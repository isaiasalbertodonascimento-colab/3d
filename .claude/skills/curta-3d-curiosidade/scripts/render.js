// Renderiza o projeto quadro a quadro no Chromium (Playwright), com servidor próprio.
// Rode da pasta que contém node_modules/ (three, @fontsource) e o projeto.
//   node render.js <projeto> --stills 1.5,6,12        -> <projeto>/stills/tX.jpg (conferência)
//   node render.js <projeto> [--jobs 4] [--from F --to F] -> <projeto>/frames/fNNNNN.jpg
// Pula quadros que já existem, então dá para retomar uma renderização interrompida.
const { chromium } = require('playwright');
const http = require('http'), fs = require('fs'), path = require('path');

const args = process.argv.slice(2);
const proj = args[0];
if (!proj || !fs.existsSync(path.join(proj, 'timeline.json'))) { console.error('uso: node render.js <projeto> [--stills t1,t2] [--jobs N]'); process.exit(1); }
const opt = k => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : null; };
const root = process.cwd();
if (!fs.existsSync(path.join(root, 'node_modules/three'))) { console.error('node_modules/three não encontrado na pasta atual: rode npm install three@0.170.0 @fontsource/anton @fontsource/inter'); process.exit(1); }

const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json', '.css': 'text/css', '.woff2': 'font/woff2', '.woff': 'font/woff', '.png': 'image/png', '.jpg': 'image/jpeg' };
const server = http.createServer((q, r) => {
  const p = path.join(root, decodeURIComponent(q.url.split('?')[0]));
  if (!p.startsWith(root) || !fs.existsSync(p) || fs.statSync(p).isDirectory()) { r.writeHead(404); return r.end(); }
  r.writeHead(200, { 'Content-Type': MIME[path.extname(p)] || 'application/octet-stream' }); fs.createReadStream(p).pipe(r);
});

async function openPage(browser, port) {
  const page = await browser.newPage({ viewport: { width: 720, height: 1280 }, deviceScaleFactor: 1 });
  const errs = [];
  page.on('console', m => { if (m.type() === 'error') { errs.push(m.text()); console.error('PAGE:', m.text()); } });
  page.on('pageerror', e => { errs.push(e.message); console.error('PAGEERR:', e.message); });
  const rel = path.relative(root, path.resolve(proj)).split(path.sep).join('/');
  await page.goto(`http://localhost:${port}/${rel}/scene/index.html`);
  await page.waitForFunction(() => window.ready === true || window.bootError, null, { timeout: 120000 });
  const be = await page.evaluate(() => window.bootError);
  if (be) throw new Error('Erro ao iniciar a cena:\n' + be);
  await page.evaluate(() => document.fonts.ready);
  return { page, el: await page.$('#wrap'), errs };
}

(async () => {
  await new Promise(res => server.listen(0, res));
  const port = server.address().port;
  const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const tl = JSON.parse(fs.readFileSync(path.join(proj, 'timeline.json')));
  const fps = tl.fps || 30;
  let failed = false;
  try {
    if (opt('--stills')) {
      const dir = path.join(proj, 'stills'); fs.mkdirSync(dir, { recursive: true });
      const { page, el } = await openPage(browser, port);
      for (const t of opt('--stills').split(',').map(Number)) {
        const t0 = Date.now(); const si = await page.evaluate(t => window.renderAt(t), t);
        const f = path.join(dir, `t${t.toFixed(2)}.jpg`);
        await el.screenshot({ path: f, type: 'jpeg', quality: 85 });
        console.log(`${f}  shot ${si}  ${Date.now() - t0} ms`);
      }
    } else {
      const dir = path.join(proj, 'frames'); fs.mkdirSync(dir, { recursive: true });
      const from = +(opt('--from') ?? 0), to = +(opt('--to') ?? Math.ceil(tl.total * fps));
      const jobs = Math.max(1, +(opt('--jobs') ?? 2));
      const todo = []; for (let f = from; f < to; f++) if (!fs.existsSync(path.join(dir, `f${String(f).padStart(5, '0')}.jpg`))) todo.push(f);
      console.log(`${todo.length} quadros a renderizar (${from}-${to}), ${jobs} páginas em paralelo`);
      const t0 = Date.now(); let done = 0;
      // cada página pega um bloco contínuo (as cenas são construídas uma vez por bloco)
      const per = Math.ceil(todo.length / jobs);
      await Promise.all(Array.from({ length: jobs }, async (_, j) => {
        const mine = todo.slice(j * per, (j + 1) * per); if (!mine.length) return;
        const { page, el } = await openPage(browser, port);
        for (const f of mine) {
          await page.evaluate(t => window.renderAt(t), f / fps);
          await el.screenshot({ path: path.join(dir, `f${String(f).padStart(5, '0')}.jpg`), type: 'jpeg', quality: 92 });
          if (++done % 60 === 0) { const s = (Date.now() - t0) / 1000; console.log(`quadro ${done}/${todo.length}  (${(s / done).toFixed(2)} s/quadro, faltam ~${Math.round(s / done * (todo.length - done))} s)`); }
        }
      }));
      console.log(`pronto: ${done} quadros em ${Math.round((Date.now() - t0) / 1000)} s`);
    }
  } catch (e) { console.error(e.message); failed = true; }
  await browser.close(); server.close();
  process.exit(failed ? 1 : 0);
})();

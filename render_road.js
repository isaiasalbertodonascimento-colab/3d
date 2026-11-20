// Renderiza a cena scene_road sem servidor HTTP: o Playwright entrega os arquivos do disco.
// uso: node render_road.js stills <outdir> t1,t2,...   |   node render_road.js frames <outdir> <ini> <fim> [fps]
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path');
const ROOT = __dirname;
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json', '.css': 'text/css', '.woff2': 'font/woff2', '.woff': 'font/woff' };
(async () => {
  const [mode, out, a, b, fpsArg] = process.argv.slice(2);
  const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--ignore-gpu-blocklist'] });
  const page = await browser.newPage({ viewport: { width: 720, height: 1280 }, deviceScaleFactor: 1 });
  page.on('console', m => { if (m.type() === 'error' || process.env.VERBOSE) console.log('PAGE:', m.text()); });
  page.on('pageerror', e => console.log('PAGEERR:', e.message));
  await page.route('http://local.test/**', route => {
    const p = path.join(ROOT, decodeURIComponent(new URL(route.request().url()).pathname));
    if (!p.startsWith(ROOT) || !fs.existsSync(p)) return route.fulfill({ status: 404, body: 'nf' });
    route.fulfill({ status: 200, body: fs.readFileSync(p), contentType: TYPES[path.extname(p)] || 'application/octet-stream' });
  });
  const t0 = Date.now();
  await page.goto('http://local.test/scene_road/index.html');
  await page.waitForFunction(() => window.ready === true, null, { timeout: 300000 });
  await page.evaluate(() => document.fonts.ready);
  console.log('carregado em', Date.now() - t0, 'ms');
  if (process.env.SHOTS) console.log((await page.evaluate(() => shots.map(s => [s.type, s.t0.toFixed(2), s.t1.toFixed(2), (s.hfov||0).toFixed(1), s.variant || '', s.recede ? 'rec' : ''].join(' ')))).join('\n'));
  const el = await page.$('#wrap');
  fs.mkdirSync(out, { recursive: true });
  if (mode === 'stills') {
    for (const t of a.split(',').map(Number)) {
      const s = Date.now(); const ty = await page.evaluate(t => window.renderAt(t), t);
      await el.screenshot({ path: `${out}/t${t.toFixed(2)}.jpg`, type: 'jpeg', quality: 88 });
      console.log(t, ty, Date.now() - s, 'ms');
    }
  } else {
    const fps = +(fpsArg || 30);
    for (let f = +a; f < +b; f++) {
      const p = `${out}/f${String(f).padStart(5, '0')}.jpg`;
      if (fs.existsSync(p)) continue;
      await page.evaluate(t => window.renderAt(t), f / fps);
      await el.screenshot({ path: p, type: 'jpeg', quality: 93 });
      if (f % 100 === 0) console.log('frame', f, new Date().toISOString());
    }
  }
  await browser.close();
})();

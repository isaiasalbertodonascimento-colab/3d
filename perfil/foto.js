const { chromium } = require('playwright'); const http = require('http'), fs = require('fs'), path = require('path');
const root = path.resolve(__dirname, '..');
const srv = http.createServer((q, r) => { const p = path.join(root, decodeURIComponent(q.url.split('?')[0])); if (!fs.existsSync(p) || fs.statSync(p).isDirectory()) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'Content-Type': { '.html': 'text/html', '.js': 'text/javascript' }[path.extname(p)] || 'application/octet-stream' }); fs.createReadStream(p).pipe(r); });
srv.listen(0, async () => {
  const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  const pg = await b.newPage({ viewport: { width: 1080, height: 1080 } });
  pg.on('pageerror', e => console.error(e.message));
  await pg.goto(`http://localhost:${srv.address().port}/perfil/index.html`);
  await pg.waitForFunction(() => window.ready === true, null, { timeout: 120000 });
  await pg.screenshot({ path: path.join(__dirname, 'perfil.png') }); await b.close(); srv.close(); console.log('ok');
});

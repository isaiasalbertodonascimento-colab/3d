// node preview.js [t1,t2,...] -> preview/tX.jpg   |  require('./preview.js') -> open()
const { chromium } = require('playwright'); const fs = require('fs'), path = require('path');
const ROOT = path.resolve(__dirname, '..');
const MIME = { html: 'text/html', js: 'text/javascript', png: 'image/png', woff2: 'font/woff2', json: 'application/json' };
async function open() {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1080, height: 1920 } });
  p.on('pageerror', e => console.error('PAGEERR', e.message)); p.on('console', m => { if (m.type() === 'error') console.error('CONSOLE', m.text()); });
  await p.route('http://video.local/**', r => { const f = path.join(ROOT, decodeURIComponent(new URL(r.request().url()).pathname)); r.fulfill({ path: f, contentType: MIME[f.split('.').pop()] || 'application/octet-stream' }); });
  await p.goto('http://video.local/' + path.basename(__dirname) + '/index.html');
  await p.waitForFunction(() => window.ready, null, { timeout: 180000 });
  return { b, p, info: await p.evaluate(() => window.INFO) };
}
module.exports = open;
if (require.main === module) (async () => {
  const { b, p, info } = await open();
  fs.mkdirSync(path.join(__dirname, 'preview'), { recursive: true });
  const ts = process.argv[2] ? process.argv[2].split(',').map(Number) : info.scenes.flatMap(s => [s.s + s.d * .2, s.s + s.d * .5, s.s + s.d * .85]);
  for (const t of ts) { const t0 = Date.now(); await p.evaluate(t => window.render(t), t); await p.screenshot({ path: path.join(__dirname, `preview/t${t.toFixed(2)}.jpg`), type: 'jpeg', quality: 80 }); console.log(t.toFixed(2), Date.now() - t0, 'ms'); }
  await b.close();
})();

// node preview3d.js [t1,t2,...] -> preview/tX.jpg
const { chromium } = require('playwright'); const fs = require('fs'), path = require('path');
const MIME = { html: 'text/html', js: 'text/javascript', png: 'image/png', woff2: 'font/woff2', json: 'application/json' };
async function open() {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1080, height: 1920 } });
  p.on('pageerror', e => console.error('PAGEERR', e.message)); p.on('console', m => { if (m.type() === 'error') console.error('CONSOLE', m.text()); });
  await p.route('http://video.local/**', r => { const f = path.join(__dirname, new URL(r.request().url()).pathname); r.fulfill({ path: f, contentType: MIME[f.split('.').pop()] || 'application/octet-stream' }); });
  await p.goto('http://video.local/video3d.html' + (process.env.Q || ''));
  await p.waitForFunction(() => window.ready, null, { timeout: 120000 });
  return { b, p, info: await p.evaluate(() => window.INFO) };
}
module.exports = open;
if (require.main === module) (async () => {
  const { b, p, info } = await open();
  console.log(await p.evaluate(() => { const g = document.getElementById('gl').getContext('webgl2'); const e = g.getExtension('WEBGL_debug_renderer_info'); return e ? g.getParameter(e.UNMASKED_RENDERER_WEBGL) : 'n/a'; }));
  fs.mkdirSync('preview', { recursive: true });
  const ts = process.argv[2] ? process.argv[2].split(',').map(Number) : info.scenes.flatMap(s => [s.s + s.d * .3, s.s + s.d * .85]);
  for (const t of ts) { const t0 = Date.now(); await p.evaluate(t => window.render(t), t); await p.screenshot({ path: `preview/t${t.toFixed(2)}.jpg`, type: 'jpeg', quality: 80 }); console.log(t.toFixed(2), Date.now() - t0, 'ms'); }
  await b.close();
})();

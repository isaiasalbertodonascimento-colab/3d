// node preview.js t1,t2,...  -> preview/tX.jpg
const { chromium } = require('playwright');
const path = require('path'), fs = require('fs');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1080, height: 1920 } });
  p.on('pageerror', e => console.error('PAGEERR', e.message));
  await p.goto('file://' + path.resolve(__dirname, 'video.html'));
  await p.waitForFunction(() => window.ready); await p.evaluate(() => document.fonts.ready);
  const info = await p.evaluate(() => window.INFO); console.log(JSON.stringify(info));
  fs.mkdirSync('preview', { recursive: true });
  const ts = process.argv[2] ? process.argv[2].split(',').map(Number) : info.scenes.flatMap(s => [s.s + s.d * .3, s.s + s.d * .85]);
  for (const t of ts) { await p.evaluate(t => render(t), t); await p.screenshot({ path: `preview/t${t.toFixed(2)}.jpg`, type: 'jpeg', quality: 80 }); }
  await b.close();
})();

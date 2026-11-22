// node shot.js [t] [p] -> teste-fx/folha_N.png (fotos de todos os efeitos de FX2)
const { chromium } = require('playwright'); const path = require('path'), fs = require('fs');
const ROOT = path.resolve(__dirname, '..');
(async () => { const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1700, height: 1500 } });
  p.on('pageerror', e => console.log('PAGEERR', e.message));
  await p.route('http://video.local/**', r => { const f = path.join(ROOT, decodeURIComponent(new URL(r.request().url()).pathname)); r.fulfill({ path: f, contentType: { html: 'text/html', js: 'text/javascript', woff2: 'font/woff2' }[f.split('.').pop()] || 'application/octet-stream' }); });
  const t = process.argv[2] || 1.3, pp = process.argv[3] || .6, step = 30;
  await p.goto(`http://video.local/teste-fx/index.html?t=${t}&p=${pp}&from=0&to=1`); const n = +(await p.title()).split(' ')[1]; console.log('efeitos:', n);
  for (let a = 0, k = 1; a < n; a += step, k++) { await p.goto(`http://video.local/teste-fx/index.html?t=${t}&p=${pp}&from=${a}&to=${a + step}`); await p.waitForFunction(() => window.ready);
    const err = await p.evaluate(() => window.ERR); if (err.length) console.log('ERROS:', err);
    await p.screenshot({ path: path.join(__dirname, `folha_${k}.png`), fullPage: true }); }
  await b.close(); })();

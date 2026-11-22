const { chromium } = require('playwright'); const path = require('path'); const ROOT = path.resolve(__dirname, '..');
(async () => { const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1080, height: 1920 } });
  p.on('pageerror', e => console.log('PAGEERR', e.message)); p.on('console', m => { if (m.type() === 'error') console.log('CONSOLE', m.text()); });
  await p.route('http://video.local/**', r => { const f = path.join(ROOT, decodeURIComponent(new URL(r.request().url()).pathname)); r.fulfill({ path: f, contentType: { html: 'text/html', js: 'text/javascript' }[f.split('.').pop()] || 'application/octet-stream' }); });
  await p.goto('http://video.local/teste-fx/amb3d.html'); await p.waitForFunction(() => window.ready, null, { timeout: 120000 });
  console.log('efeitos 3D ativos:', await p.evaluate(() => window.NUP));
  for (const t of [2.4, 3.1]) { await p.evaluate(t => window.render(t), t); await p.screenshot({ path: path.join(__dirname, `amb3d_${t}.png`) }); }
  await b.close(); })();

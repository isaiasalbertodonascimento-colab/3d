// usage: node render.js <outdir> <startFrame> <endFrame> [fps] | node render.js --stills dir t1,t2,...
const { chromium } = require('playwright');
const fs = require('fs');
(async () => {
  const args = process.argv.slice(2);
  const port = process.env.PORT || 8765;
  const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const page = await browser.newPage({ viewport: { width: 720, height: 1280 }, deviceScaleFactor: 1 });
  page.on('console', m => { if (m.type() === 'error') console.error('PAGE:', m.text()); });
  page.on('pageerror', e => console.error('PAGEERR:', e.message));
  await page.goto(`http://localhost:${port}/${process.env.SCENE || 'scene'}/index.html`);
  await page.waitForFunction(() => window.ready === true, null, { timeout: 120000 });
  await page.evaluate(() => document.fonts.ready);
  const el = await page.$('#wrap');
  if (args[0] === '--stills') {
    fs.mkdirSync(args[1], { recursive: true });
    for (const t of args[2].split(',').map(Number)) {
      const t0 = Date.now(); await page.evaluate(t => window.renderAt(t), t);
      await el.screenshot({ path: `${args[1]}/t${t.toFixed(1)}.jpg`, type: 'jpeg', quality: 85 });
      console.log(t, Date.now() - t0, 'ms');
    }
  } else {
    const [dir, s, e] = args; const fps = +(args[3] || 30);
    fs.mkdirSync(dir, { recursive: true });
    for (let f = +s; f < +e; f++) {
      const p = `${dir}/f${String(f).padStart(5, '0')}.jpg`;
      if (fs.existsSync(p)) continue;
      await page.evaluate(t => window.renderAt(t), f / fps);
      await el.screenshot({ path: p, type: 'jpeg', quality: 93 });
      if (f % 100 === 0) console.log('frame', f);
    }
  }
  await browser.close();
})();

// Abre uma página do projeto no Chromium headless (arquivos servidos via page.route).
const { chromium } = require('playwright'); const fs = require('fs'); const path = require('path');
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.woff2': 'font/woff2', '.png': 'image/png', '.json': 'application/json', '.jpg': 'image/jpeg' };
module.exports = async function open(page = 'index.html', W = 1080, H = 1920) {
  const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const p = await b.newPage({ viewport: { width: W, height: H } });
  p.on('console', m => { const t = m.text(); if (!/GPU stall|WebGL-/.test(t)) console.log('PAGE', t); });
  p.on('pageerror', e => console.log('PAGEERR', e.message));
  await p.route('http://local/**', r => {
    const f = path.join(__dirname, decodeURIComponent(new URL(r.request().url()).pathname));
    if (!fs.existsSync(f)) return r.fulfill({ status: 404, body: 'nf' });
    r.fulfill({ status: 200, body: fs.readFileSync(f), contentType: MIME[path.extname(f)] || 'application/octet-stream' });
  });
  await p.goto('http://local/' + page);
  await p.waitForFunction('window.READY === true', null, { timeout: 180000 });
  const info = await p.evaluate(() => window.INFO || {});
  return { b, p, info };
};

// Grava events.json (eventos de SFX, curva de vento e cenas) a partir da página.
const open = require('./open.js'); const fs = require('fs'), path = require('path');
(async () => { const { b, p, info } = await open();
  const d = await p.evaluate(() => ({ events: window.EVENTS, windcurve: window.WINDCURVE }));
  fs.writeFileSync(path.join(__dirname, 'events.json'), JSON.stringify({ total: info.total, scenes: info.scenes, ...d }));
  console.log(d.events.length, 'eventos,', d.windcurve.length, 'amostras de vento'); await b.close(); })();

// node shots.js [t] -> preview/<shot>.jpg para cada enquadramento
const open = require('./open.js'), path = require('path'), fs = require('fs');
(async () => { const { b, p } = await open(); fs.mkdirSync(path.join(__dirname, 'preview'), { recursive: true }); const t = +(process.argv[2] || 2);
  for (const s of (process.argv[3]||'wide,lia,janela,theo,mesa,sombra').split(',')) { const t0 = Date.now(); await p.evaluate(([t, s]) => window.render(t, s), [t, s]); await p.screenshot({ path: path.join(__dirname, `preview/${s}.jpg`), type: 'jpeg', quality: 88 }); console.log(s, Date.now() - t0, 'ms'); }
  await b.close(); })();

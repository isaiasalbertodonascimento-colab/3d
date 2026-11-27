// node check.js [passo] -> roda a cena inteira sem foto e lista personagem atravessando móvel/parede/outro personagem.
// O esperado é "0 atravessamentos". Se aparecer algo, mude a posição/trajeto no roteiro (o place() só empurra para fora).
const open = require('./preview.js');
(async () => { const { b, p, info } = await open(); const st = +(process.argv[2] || 3);
  for (let i = 0; i < info.total * 30; i += st) await p.evaluate(t => window.render(t), i / 30);
  const C = await p.evaluate(() => window.COLLIDE), GR = await p.evaluate(() => window.GROUND || []); await b.close();
  const g = {}; for (const c of C) { const k = c.what; (g[k] = g[k] || []).push(c.t); }
  for (const [k, ts] of Object.entries(g)) console.log('ATRAVESSOU', k, 'em t =', ts[0], '...', ts[ts.length - 1], `(${ts.length} quadros)`);
  console.log(C.length ? C.length + ' atravessamentos' : '0 atravessamentos');
  if (GR.length) console.log('CHÃO corrigido em', GR.length, 'quadros (maior: ' + Math.max(...GR.map(g => g.d)) + ' unid. SVG), de t =', GR[0].t, 'a', GR[GR.length - 1].t, '— o groundFix já levantou o corpo; se for muito, ajuste bob/pose.');
  else console.log('0 pés abaixo do chão');
})();

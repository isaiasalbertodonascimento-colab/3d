// node preview.js t1,t2,... [saida_dir] -> PNGs + folha de contato
const open = require('./open.js'); const path = require('path'); const { execFileSync } = require('child_process');
(async () => {
  const ts = process.argv[2].split(',').map(Number), out = process.argv[3] || '.';
  const { b, p } = await open();
  const files = [];
  for (const t of ts) {
    const t0 = Date.now(); await p.evaluate(t => window.render(t), t);
    const f = path.join(out, `prev_${t.toFixed(2)}.jpg`); await p.screenshot({ path: f, type: 'jpeg', quality: 85 }); files.push(f);
    console.log(t, Date.now() - t0, 'ms');
  }
  await b.close();
  execFileSync('python3', ['-c', `
import sys
from PIL import Image, ImageDraw
fs=sys.argv[1:]; ims=[Image.open(f).resize((270,480)) for f in fs]; n=len(ims); cols=min(n,6); rows=(n+cols-1)//cols
o=Image.new('RGB',(cols*270,rows*480))
for i,(im,f) in enumerate(zip(ims,fs)):
  o.paste(im,((i%cols)*270,(i//cols)*480)); ImageDraw.Draw(o).text(((i%cols)*270+6,(i//cols)*480+6),f.split('_')[-1][:-4],fill=(255,255,0))
o.save('${out}/folha.jpg')`, ...files]);
})();

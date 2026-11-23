// node preview.js t1,t2,... -> preview/tX.jpg + preview/sheet.jpg (folha de contato)
const open=require('./open.js');const fs=require('fs'),path=require('path');const {execSync}=require('child_process');
(async()=>{const {b,p,info}=await open();fs.mkdirSync(path.join(__dirname,'preview'),{recursive:true});
 const ts=process.argv[2]?process.argv[2].split(',').map(Number):info.scenes.flatMap(s=>[s.s+s.d*.2,s.s+s.d*.6]);const out=[];
 for(const t of ts){const t0=Date.now();await p.evaluate(t=>window.render(t),t);const f=path.join(__dirname,`preview/t${t.toFixed(2)}.jpg`);await p.screenshot({path:f,type:'jpeg',quality:80});out.push(f);console.log(t.toFixed(2),Date.now()-t0,'ms');}
 await b.close();execSync(`python3 -c "import sys;from PIL import Image,ImageDraw;fs=sys.argv[1:];n=len(fs);c=min(n,5);r=(n+c-1)//c;o=Image.new('RGB',(c*270,r*480));[o.paste(Image.open(f).resize((270,480)),((i%c)*270,(i//c)*480)) for i,f in enumerate(fs)];d=ImageDraw.Draw(o);[d.text(((i%c)*270+6,(i//c)*480+6),fs[i].split('/t')[-1][:-4],fill='red') for i in range(n)];o.save('${path.join(__dirname,'preview/sheet.jpg')}')" ${out.join(' ')}`);})();

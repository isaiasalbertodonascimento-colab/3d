// node export_events.js -> events.json (SFX das cenas novas; tempos dos quiques saem da própria física)
const fs=require('fs');eval(fs.readFileSync(__dirname+'/../kit/chars.js','utf8')+fs.readFileSync(__dirname+'/../kit/anim.js','utf8'));
const ev=[];const E=(t,name,gain=1)=>ev.push({t:+t.toFixed(3),name,gain});
// impactos de um objeto: varre a física e marca cada hit
function hits(fn,t0,t1,name,g,off=0){let last=1e9;for(let u=t0;u<t1;u+=1/120){const h=fn(u).hit;if(h<last&&h<.02)E(u+off,name,g);last=h;}}
E(.35,'thud',1);E(.36,'clank',.6);E(.5,'whoosh',.7);E(1.45,'swirl',.8);hits(u=>toss(u,.5,[.85,.8],[1.0,1.6],{floor:.79,e:.45,spin:-9}),.5,4,'plop',.8);
E(1.35,'boing',.7);E(2.0,'whoosh',.8);E(2.7,'pop',.7);
E(4.0,'whoosh',.9);E(4.5,'boing',1);E(4.5+.14+jump(0,0,.55).T/2,'ding',.9);hits(u=>fall(u,1.9,1.6,{e:.5}),1.9,4,'plop',.9,4);E(6.0,'whoosh',.8);
E(8.0,'whoosh',.9);E(8.6,'pop',1);hits(u=>toss(u,.6,[-.75,.13],[3.2,3.4],{floor:.13,e:.6,friction:.85,spin:-14}),.6,4,'boing',.6,8);
E(8.9,'boing',.6);E(9.7,'boing',.8);E(10.0,'whoosh',.8);E(10.25,'thud',1);E(10.3,'swirl',.7);E(11.2,'tweet',.6);
fs.writeFileSync(__dirname+'/events.json',JSON.stringify({total:12,scenes:[{s:0,d:4},{s:4,d:4},{s:8,d:4}],events:ev.sort((a,b)=>a.t-b.t),windcurve:Array.from({length:121},(_,i)=>.25)},null,1));
console.log(ev.length,'eventos');

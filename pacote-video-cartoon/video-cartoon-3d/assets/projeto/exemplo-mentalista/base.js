// ================= cenas do raio =================
let SEED=21;const R=()=>{SEED=(SEED*16807)%2147483647;return SEED/2147483647;};
const std=o=>new THREE.MeshStandardMaterial(Object.assign({roughness:.9,metalness:0},o));
const {SKY,CLOUDS,GU,TREES,HOUSES,POSTS,updRain}=TWX;const soft=TWX.soft;
SKY.tex.night=SKY.mk([[0,'#05081a'],[.3,'#121a3a'],[.47,'#2a3358'],[.5,'#323b60'],[1,'#323b60']]);
SKY.tex.storm=SKY.mk([[0,'#0c1018'],[.35,'#1e2533'],[.5,'#3a4352'],[1,'#3a4352']]);
// luzes do bairro
const hemiT=new THREE.HemisphereLight('#cfe3ff','#5d7a45',1.1);TOWN.add(hemiT);
const sunT=new THREE.DirectionalLight('#fff3dd',3);sunT.castShadow=true;sunT.shadow.mapSize.set(2048,2048);Object.assign(sunT.shadow.camera,{left:-14,right:14,top:14,bottom:-14,near:1,far:120});sunT.shadow.bias=-.0004;sunT.shadow.normalBias=.03;sunT.shadow.radius=3;TOWN.add(sunT,sunT.target);
const flashL=new THREE.HemisphereLight('#dfe8ff','#556',0);scene.add(flashL);
const zapL=new THREE.PointLight('#a8d8ff',0,40,1.3);scene.add(zapL);
const postL=new THREE.PointLight('#ffcf8a',0,14,1.4);TOWN.add(postL);
// janelas que acendem à noite e brilho dos postes
const glowM=c=>new THREE.MeshBasicMaterial({color:c,transparent:true,opacity:0,depthWrite:false,toneMapped:false,fog:false});
HOUSES.forEach(H=>{H.win=[];for(const x of[-2.2,2.2]){const m=new THREE.Mesh(new THREE.PlaneGeometry(1.2,1.04),glowM('#ffc870'));m.position.set(x,1.94,3.205);H.g.add(m);H.win.push(m);}});
POSTS.forEach(P=>{const b=P.userData.bulb;const g=new THREE.Mesh(new THREE.PlaneGeometry(2.6,2.6),new THREE.MeshBasicMaterial({map:soft,color:'#ffcf8a',transparent:true,opacity:0,depthWrite:false,blending:THREE.AdditiveBlending,fog:false,toneMapped:false}));b.add(g);P.userData.glow=g;});
// onda de choque do trovão
const SHOCK=new THREE.Mesh(new THREE.SphereGeometry(1,32,16),new THREE.MeshBasicMaterial({color:'#d8ecff',transparent:true,opacity:0,depthWrite:false,side:THREE.DoubleSide,blending:THREE.AdditiveBlending,fog:false}));TOWN.add(SHOCK);
const RINGS=[0,1].map(()=>{const m=new THREE.Mesh(new THREE.RingGeometry(.9,1,64),new THREE.MeshBasicMaterial({color:'#ffffff',transparent:true,opacity:0,depthWrite:false,side:THREE.DoubleSide,fog:false}));m.rotation.x=-Math.PI/2;TOWN.add(m);return m;});

// ---------- pós-processamento ----------
const composer=new EffectComposer(renderer);composer.addPass(new RenderPass(scene,cam));
const bokeh=new BokehPass(scene,cam,{focus:2,aperture:.003,maxblur:.008});composer.addPass(bokeh);
const bloom=new UnrealBloomPass(new THREE.Vector2(540,960),.55,.6,.82);composer.addPass(bloom);composer.addPass(new OutputPass());

// ---------- sprites (personagens macios) ----------
const K=.0021,FEET=712*K,SPR=[];
const CHAR_VB=[-640,-680,1280,1520];
function sprite(vb,res,par=scene,halo=false){const [vx,vy,vw,vh]=vb,cw=Math.round(vw*res),ch=Math.round(vh*res);const c=document.createElement('canvas');c.width=cw;c.height=ch;const g=c.getContext('2d');
  const tex=new THREE.CanvasTexture(c);tex.colorSpace=THREE.SRGBColorSpace;tex.anisotropy=8;const geo=new THREE.PlaneGeometry(vw*K,vh*K);geo.translate((vx+vw/2)*K,-(vy+vh/2)*K,0);
  const mat=new THREE.MeshStandardMaterial({map:tex,alphaTest:halo?.02:.5,transparent:halo,side:THREE.DoubleSide,roughness:1,metalness:0,emissive:'#ffffff',emissiveMap:tex,emissiveIntensity:.42});
  const m=new THREE.Mesh(geo,mat);m.castShadow=true;m.receiveShadow=true;m.customDepthMaterial=new THREE.MeshDepthMaterial({depthPacking:THREE.RGBADepthPacking,map:tex,alphaTest:.5});par.add(m);
  const s={mesh:m,last:'',async set(inner){if(inner===s.last)return;s.last=inner;const img=new Image();img.src='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb.join(' ')}" width="${cw}" height="${ch}">${inner}</svg>`);await img.decode();g.clearRect(0,0,cw,ch);g.drawImage(img,0,0,cw,ch);tex.needsUpdate=true;}};
  SPR.push(s);return s;}
const HERO=sprite(CHAR_VB,.72,scene,true),BIA=sprite(CHAR_VB,.62,scene,true),TEO=sprite(CHAR_VB,.62,scene,true),DAVI=sprite(CHAR_VB,.62,scene,true);
// Personagens originais: Léo (mentalista), Bia, Téo, Davi.
const LK={hairStyle:'short',hair:'#5a3a22',skin:'#f0b27e',shirt:'#6b2338',pants:'#2d2a3a',sleeveStripe:'#e0b040'};
const BK={hairStyle:'bob',hair:'#1f1a2e',skin:'#c98450',shirt:'#2f6a5a',pants:'#33384a',sleeveStripe:'#ff9ac0'};
const TK={hairStyle:'curly',hair:'#a8432a',skin:'#eba574',shirt:'#2c3566',pants:'#2b2f45',sleeveStripe:'#7fd4ff'};
const DK={hairStyle:'short',hair:'#2b2a33',skin:'#b97a52',shirt:'#9a6a1e',pants:'#3a3330',sleeveStripe:'#f4f0e6'};
// "broto" do Léo vira um olhinho dourado que brilha quando ele "lê" alguém
let SP={eye:false,glow:0,t:0};
window.sprout=function(){if(!SP.eye)return'';const T=SP.t||0,g=SP.glow||0,bl=blink(T,4)>.5?.15:1,lk=Math.sin(T*1.3)*6;
  return `<g transform="translate(0 -150) rotate(${f(Math.sin(T*2)*5)})">`+(g>0?`<circle r="${f(58+g*14+Math.sin(T*9)*4)}" fill="#ffd23f" opacity="${f(.25*g)}"/>`+[0,1,2,3,4,5,6,7].map(k=>{const a=k/8*TAU;return `<line x1="${f(Math.cos(a)*48)}" y1="${f(Math.sin(a)*48)}" x2="${f(Math.cos(a)*(62+g*18))}" y2="${f(Math.sin(a)*(62+g*18))}" stroke="#ffd23f" stroke-width="6" stroke-linecap="round" opacity="${f(g)}"/>`;}).join(''):'')+
    `<path d="M-40 0 Q0 ${f(-34*bl)} 40 0 Q0 ${f(34*bl)} -40 0Z" fill="#fff8e0" stroke="#c98a10" stroke-width="6"/><circle cx="${f(lk)}" r="${f(15*bl)}" fill="#3a6fb5"/><circle cx="${f(lk)}" r="${f(7*bl)}" fill="#141414"/><circle cx="${f(lk+5)}" cy="-5" r="3.5" fill="#fff" opacity="${f(bl)}"/></g>`;};
function leo(o){SP={eye:true,glow:o.glow||0,t:o.t};return guy(Object.assign({x:0,y:0,s:1,seed:1,style:'soft',kit:LK,sprout:true,wind:.15},o));}
function bia(o){SP={eye:false};return guy(Object.assign({x:0,y:0,s:1,seed:5,style:'soft',kit:BK,glasses:true,wind:.15},o));}
function teo(o){SP={eye:false};return guy(Object.assign({x:0,y:0,s:1,seed:7,style:'soft',kit:TK,freckles:true,wind:.15},o));}
function davi(o){SP={eye:false};return guy(Object.assign({x:0,y:0,s:1,seed:9,style:'soft',kit:DK,wind:.15},o));}
async function put(S,fn,P,LS,o){S.mesh.visible=true;S.mesh.scale.setScalar(LS);S.mesh.position.copy(P);await S.set(fn(o));}

// ponto da mão (SVG do boneco de frente, estilo macio) e SVG->mundo
function handSVG(side,a,e){const r=(side<0?a:-a)*Math.PI/180,re=(side<0?e:-e)*Math.PI/180;return [side*84.8-Math.sin(r)*135-Math.sin(r+re)*128,150+Math.cos(r)*135+Math.cos(r+re)*128];}
function reachPt(side,x,y){const sx=side*84.8,sy=150,dx=x-sx,dy=y-sy,L=Math.hypot(dx,dy),m=Math.min(1,255/L);return [sx+dx*m,sy+dy*m];}
function svgWorld(s,sx,sy){const p=s.mesh.position,sc=s.mesh.scale.x,ry=Math.atan2(cam.position.x-p.x,cam.position.z-p.z);return V(p.x+Math.cos(ry)*sx*K*sc,p.y-sy*K*sc,p.z-Math.sin(ry)*sx*K*sc);}
const P2=V(0,0,0);function proj(x,y,z){if(x&&x.isVector3){z=x.z;y=x.y;x=x.x;}cam.updateMatrixWorld();P2.set(x,y,z).project(cam);return{x:(P2.x+1)/2*1080,y:(1-P2.y)/2*1920,z:P2.z};}
function bill(s){const p=s.mesh.position;s.mesh.rotation.y=Math.atan2(cam.position.x-p.x,cam.position.z-p.z);}

// ---------- eletricidade (SVG) ----------
function zig(x1,y1,x2,y2,seed,jag=.16,n=9){const dx=x2-x1,dy=y2-y1,L=Math.hypot(dx,dy)||1,px=-dy/L,py=dx/L,pts=[[x1,y1]];
  for(let i=1;i<n;i++){const k=i/n,o=(rnd(seed*13+i)-.5)*2*jag*L*Math.sin(k*Math.PI)*(i%2?1:.6);pts.push([x1+dx*k+px*o,y1+dy*k+py*o]);}pts.push([x2,y2]);return pts;}
const pd=pts=>'M'+pts.map(p=>f(p[0])+' '+f(p[1])).join(' L');
function strokeArc(d,w,op=1,glow='#6fc8ff'){return `<path d="${d}" stroke="${glow}" stroke-width="${f(w*4.5)}" opacity="${f(.22*op)}" fill="none" stroke-linecap="round" stroke-linejoin="round"/><path d="${d}" stroke="#bfe6ff" stroke-width="${f(w*1.9)}" opacity="${f(.65*op)}" fill="none" stroke-linecap="round" stroke-linejoin="round"/><path d="${d}" stroke="#ffffff" stroke-width="${f(w*.75)}" opacity="${f(op)}" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;}
function zap(x1,y1,x2,y2,seed,o={}){const w=o.w||8,pts=zig(x1,y1,x2,y2,seed,o.jag??.16,o.n||9);let h=strokeArc(pd(pts),w,o.op??1,o.glow);
  for(let b=0;b<(o.br??2);b++){const j=1+Math.floor(rnd(seed+b*7)*(pts.length-2)),p=pts[j],L=Math.hypot(x2-x1,y2-y1)*.22*(.5+rnd(seed+b)),a=Math.atan2(y2-y1,x2-x1)+(rnd(seed+b*3)-.5)*1.8;
    h+=strokeArc(pd(zig(p[0],p[1],p[0]+Math.cos(a)*L,p[1]+Math.sin(a)*L,seed+b*31,.25,4)),w*.5,(o.op??1)*.8,o.glow);}return h;}
function sparks(x,y,r,t,n=5,w=5,seed=0){const fr=Math.floor(t*15);let h='';for(let k=0;k<n;k++){const a=rnd(seed+k*5+fr*11)*TAU,r0=r*(.25+rnd(seed+k+fr)*.3),r1=r*(.7+rnd(seed+k*2+fr)*.4);h+=zap(x+Math.cos(a)*r0,y+Math.sin(a)*r0,x+Math.cos(a+.4)*r1,y+Math.sin(a+.4)*r1,seed+k*17+fr,{w,br:0,jag:.35,n:4});}return h;}
function eball(x,y,r,t,seed=0){if(r<=1)return'';const p=1+.08*Math.sin(t*31)+.05*Math.sin(t*17);return `<circle cx="${f(x)}" cy="${f(y)}" r="${f(r*2.2*p)}" fill="url(#eball)" opacity=".55"/><circle cx="${f(x)}" cy="${f(y)}" r="${f(r*p)}" fill="url(#eball)"/>`+sparks(x,y,r*1.7,t,6,Math.max(3,r*.07),seed);}
// raio em 3D: pontos entre A e B com deslocamento, projetados na tela
function bolt3D(A,B,seed,o={}){const n=o.n||14,L=A.distanceTo(B),d=V(0,0,0).subVectors(B,A),u1=V(0,0,0).crossVectors(d,V(0,0,1)).normalize(),u2=V(0,0,0).crossVectors(d,u1).normalize();if(u1.lengthSq()<.1)u1.set(1,0,0);
  const pts=[];for(let i=0;i<=n;i++){const k=i/n,j=(o.jag??.09)*L*Math.sin(k*Math.PI)*(i%2?1:.55);const P=V(0,0,0).lerpVectors(A,B,k).addScaledVector(u1,(rnd(seed*7+i)-.5)*2*j).addScaledVector(u2,(rnd(seed*5+i+40)-.5)*2*j);const q=proj(P);if(q.z>1)return'';pts.push([q.x,q.y]);}
  let h=strokeArc(pd(pts),o.w||10,o.op??1,o.glow);
  for(let b=0;b<(o.br??3);b++){const j=2+Math.floor(rnd(seed+b*9)*(n-4)),p=pts[j],q=pts[j+1],a=Math.atan2(q[1]-p[1],q[0]-p[0])+(rnd(seed+b*3)>.5?.7:-.7),LL=Math.hypot(pts[n][0]-pts[0][0],pts[n][1]-pts[0][1])*(.12+rnd(seed+b)*.15);
    h+=strokeArc(pd(zig(p[0],p[1],p[0]+Math.cos(a)*LL,p[1]+Math.sin(a)*LL,seed+b*31,.3,5)),(o.w||10)*.45,(o.op??1)*.85,o.glow);}
  return `<g filter="url(#glow)">${h}</g>`;}
// flicker de um raio que cai em t0 e dura dur (0..1 com piscadas)
function strike(u,t0,dur=.35){if(u<t0||u>t0+dur)return 0;const k=(u-t0)/dur;return (1-k)*(.55+.45*(Math.floor(u*30)%3!==1?1:0));}
const fmt=n=>String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g,'.');
function counterBR(x,y,to,p,o={}){if(p<=0)return'';return label((o.pre||'')+fmt(to*ease(cl(p)))+(o.suf||''),y,Object.assign({size:130,fill:'#ffd23f',x,p:Math.min(1,p*4)},o));}
function sunIcon(x,y,p,t){if(p<=0)return'';const s=back(cl(p));let r='';for(let k=0;k<12;k++){const a=k/12*TAU+t*.8;r+=`<path d="M${f(Math.cos(a)*105)} ${f(Math.sin(a)*105)} L${f(Math.cos(a+.13)*150)} ${f(Math.sin(a+.13)*150)} L${f(Math.cos(a-.13)*150)} ${f(Math.sin(a-.13)*150)}Z" fill="#ffb02e"/>`;}
  return `<g transform="translate(${f(x)} ${f(y)}) scale(${f(s)})">${r}<circle r="95" fill="#ffd23f" stroke="#e8961a" stroke-width="8"/><circle cx="-30" cy="-12" r="9" fill="#5a3a1a"/><circle cx="30" cy="-12" r="9" fill="#5a3a1a"/><path d="M-30 30 Q0 10 30 30" stroke="#5a3a1a" stroke-width="8" fill="none" stroke-linecap="round"/><path d="M-60 -60 q20 -14 40 -4" stroke="#fff" stroke-width="8" opacity=".5" fill="none" stroke-linecap="round"/></g>`;}
function socket(x,y,p,t){if(p<=0)return'';const s=back(cl(p));return `<g transform="translate(${f(x)} ${f(y)}) scale(${f(s)}) rotate(${f(Math.sin(t*3)*2)})"><rect x="-150" y="-150" width="300" height="300" rx="46" fill="#f4f1ea" stroke="#141414" stroke-width="10"/><circle r="95" fill="#e4e0d6" stroke="#9a968c" stroke-width="5"/><circle cx="-36" cy="-18" r="16" fill="#2b2b35"/><circle cx="36" cy="-18" r="16" fill="#2b2b35"/><circle cy="40" r="16" fill="#2b2b35"/></g>`+label('127 / 220 V',y+235,{size:84,x,p,fill:'#fff',stroke:14});}
function pin(x,y,p,txt){if(p<=0)return'';const s=back(cl(p));return `<g transform="translate(${f(x)} ${f(y)}) scale(${s.toFixed(3)})"><path d="M0 0 C-40 -50 -50 -80 -50 -100 A50 50 0 1 1 50 -100 C50 -80 40 -50 0 0Z" fill="#2fa84f" stroke="#141414" stroke-width="8"/><circle cy="-100" r="20" fill="#ffd23f"/></g>`+label(txt,y+90,{size:76,x,p,stroke:14});}
function zz(x,y,t){let h='';for(let k=0;k<3;k++){const ph=(t*.6+k/3)%1;h+=`<text x="${f(x+ph*80+k*8)}" y="${f(y-ph*220)}" font-family="Anton" font-size="${f(54+ph*36)}" fill="#fff" stroke="#3a2c5a" stroke-width="7" paint-order="stroke" opacity="${f(Math.sin(ph*Math.PI))}">Z</text>`;}return h;}
function flashRect(op,col='#e8f4ff'){return op>0?`<rect width="1080" height="1920" fill="${col}" opacity="${f(op)}"/>`:'';}

// ---------- câmera ----------
let FOVMUL=1,FOCUS=null,AP=.002,BL=[.55,.6,.82];
function camShot(v,d,p0,p1,l0,l1,o={}){const k=(o.e||ease)(cl(v/d)),sh=o.shake||[0,0],w=o.whip||0,t=o.t||v;
  const p=V(0,0,0).lerpVectors(p0,p1,k),l=V(0,0,0).lerpVectors(l0,l1,k);const side=V(0,0,0).subVectors(l,p).cross(V(0,1,0)).normalize();
  cam.position.set(p.x+sh[0]+Math.sin(t*1.3)*.012,p.y+sh[1]+Math.sin(t*1.9)*.01,p.z);l.addScaledVector(side,w*3);cam.lookAt(l.x+sh[0]*.5,l.y+sh[1]*.5,l.z);if(!FOCUS)FOCUS=l;}
function camAt2(p,l,t,sh=[0,0]){cam.position.set(p.x+sh[0]+Math.sin(t*1.3)*.012,p.y+sh[1]+Math.sin(t*1.9)*.01,p.z);cam.lookAt(l.x+sh[0]*.5,l.y+sh[1]*.5,l.z);if(!FOCUS)FOCUS=l.clone();}

// ---------- clima / mood ----------
let MOOD='',WIND={w:.3,dx:1,dz:0},SUNDIR=V(.45,.75,-.5).normalize();
function mood(m){MOOD=m;ROOM.visible=m==='room';TOWN.visible=!ROOM.visible;scene.fog=null;scene.background=null;flashL.intensity=0;zapL.intensity=0;postL.intensity=0;
  if(m==='room'){scene.fog=new THREE.FogExp2('#3a2c4e',.035);scene.background=new THREE.Color('#251c33');renderer.toneMappingExposure=1.05;}
  if(m==='storm'){SKY.mesh.material.map=SKY.tex.storm;scene.fog=new THREE.FogExp2('#232a38',.016);hemiT.color.set('#7a88a8');hemiT.groundColor.set('#1e2a22');hemiT.intensity=.75;sunT.color.set('#9fb0d0');sunT.intensity=.55;SUNDIR=V(-.3,.8,-.5).normalize();renderer.toneMappingExposure=1.05;}
  if(m==='night'){SKY.mesh.material.map=SKY.tex.night;scene.fog=new THREE.FogExp2('#141a30',.014);hemiT.color.set('#5a6aa0');hemiT.groundColor.set('#141a14');hemiT.intensity=.5;sunT.color.set('#8fa8ff');sunT.intensity=.35;SUNDIR=V(-.4,.7,.4).normalize();renderer.toneMappingExposure=1.1;}
  if(m==='sunset'){SKY.mesh.material.map=SKY.tex.sunset;scene.fog=new THREE.Fog('#e9a27a',40,240);hemiT.color.set('#ffc9a0');hemiT.groundColor.set('#4a3a5a');hemiT.intensity=.95;sunT.color.set('#ffb070');sunT.intensity=3.2;SUNDIR=V(.9,.25,.35).normalize();renderer.toneMappingExposure=1.05;}
  SKY.mesh.material.needsUpdate=true;SKY.sunDisk.visible=SKY.sunGlow.visible=m==='sunset';SKY.sunGlow.material.color.set('#ff9a5a');SKY.sunGlow.material.opacity=.9;
  CLOUDS.forEach(c=>c.material.color.set(m==='storm'?'#4a5262':m==='night'?'#2a3050':'#ffc6a8'));
  SPR.forEach(s=>{s.mesh.material.color.set(m==='storm'?'#c8d0e0':m==='night'?'#b8c0e0':m==='sunset'?'#ffe6d0':'#ffffff');s.mesh.material.emissiveIntensity=m==='room'?.42:m==='sunset'?.4:.5;});
  HOUSES.forEach(H=>H.win.forEach(w=>w.material.opacity=m==='storm'?.55:0));POSTS.forEach(P=>{P.userData.glow.material.opacity=0;P.userData.bulb.material.emissiveIntensity=m==='storm'?1.2:.2;});
  document.getElementById('glowL').style.display=m==='room'||m==='sunset'?'':'none';}
// luzes do quarto: k=1 acesas, 0 queimadas
function roomLights(k,t){RMX.CH.userData.light.intensity=(3+Math.sin(t*11)*.4)*k;RMX.FLAMES.forEach(fl=>fl.visible=k>.5);RMX.DESK.userData.ll.intensity=5*k;RMX.DESK.userData.bulb.material.color.set(k>.5?'#fff1c8':'#3a3530');
  RMX.fillL.intensity=lerp(1.2,6,k);RMX.hemi.intensity=lerp(.45,1.05,k);RMX.sun.intensity=lerp(120,220,k);ROOMK=k;}let ROOMK=1;
function world(t,focus){
  if(TOWN.visible){SKY.mesh.position.copy(cam.position);SKY.sun.position.copy(cam.position).addScaledVector(SUNDIR,600);SKY.sun.lookAt(cam.position);
    CLOUDS.forEach((c,i)=>{const u=c.userData;c.position.set(cam.position.x+u.x+((t*(2+WIND.w*8)+i*30)%200)-100,u.y,cam.position.z+u.z);c.lookAt(cam.position);});
    GU.uTime.value=t;GU.uWind.value=WIND.w;GU.uDir.value.set(WIND.dx,WIND.dz).normalize();GU.uBlast.value=0;
    TREES.forEach(tr=>{const w=WIND.w,g=Math.sin(t*2.1+tr.ph)*.5+Math.sin(t*3.7+tr.ph*2)*.3;tr.g.rotation.z=-WIND.dx*(w*.09+g*w*.05);tr.fol.forEach((m,k)=>{m.position.set(m.userData.p.x+Math.sin(t*4+k)*.05*w+WIND.dx*w*.25,m.userData.p.y+Math.sin(t*3.3+k*2)*.04*w,m.userData.p.z+Math.cos(t*3.6+k)*.05*w);});});
    const f0=focus||V(0,0,0);sunT.target.position.copy(f0);sunT.position.copy(f0).addScaledVector(SUNDIR,60);
    updRain(t,MOOD==='storm');POSTS.forEach(P=>P.userData.glow.lookAt(cam.position));}
  if(ROOM.visible){RMX.PLANTS.forEach((p,i)=>{p.g.rotation.z=Math.sin(t*1.3+i)*.025;p.g.rotation.x=Math.sin(t*1.1+i*2)*.02;});RMX.SUNF.userData.head.rotation.z=Math.sin(t*.8)*.05;
    RMX.FLAMES.forEach((fl,i)=>{const k=1+Math.sin(t*13+i*2)*.12+Math.sin(t*7+i)*.08;fl.scale.set(k,k*(1.1+Math.sin(t*9+i)*.1),1);fl.lookAt(cam.position);});
    RMX.FAIRY.forEach((f2,i)=>{if(!f2.userData.dead)f2.material.opacity=.45+.25*Math.sin(t*2+i*1.3);f2.lookAt(cam.position);});
    const dp=RMX.DUST.geometry.attributes.position;for(let i=0;i<400;i++){dp.setXYZ(i,.2+((rnd(i)*2.4+t*.03*rnd(i+3))%2.4)-1.0,.2+((rnd(i+1)*2.4+Math.sin(t*.4+i)*.1+t*.02)%2.4),-2.8+((rnd(i+2)*2.6+t*.04)%2.6));}dp.needsUpdate=true;
    RMX.STEAM.forEach((m,i)=>{const ph=(t*.35+i/5)%1;m.position.set(-2.65+Math.sin(t+i)*.02,.92+ph*.35,.3+Math.cos(t*.7+i)*.02);m.scale.setScalar(.6+ph*1.6);m.material.opacity=.3*(1-ph);m.lookAt(cam.position);});
    RMX.RAYS.forEach((r,i)=>r.material.opacity=(.09+.04*Math.sin(t*.6+i))*lerp(.4,1,ROOMK));}}
function fairyReset(){RMX.FAIRY.forEach(g=>{g.userData.dead=false;g.visible=true;g.userData.b.material.color.copy(g.material.color);});}
function treeGlow(tr,k){tr.fol.forEach(m=>{m.material.emissive=m.material.emissive||new THREE.Color();m.material.emissive.set('#ff4a10');m.material.emissiveIntensity=k*.35;});}
function postsOff(){POSTS.forEach(P=>{P.userData.glow.material.opacity=0;P.userData.bulb.material.emissiveIntensity=.15;});}
function postOn(P,k,t){P.userData.glow.material.opacity=.85*k*(1+.05*Math.sin(t*20));P.userData.bulb.material.emissiveIntensity=.15+3*k;}
const bulbW=P=>P.userData.bulb.getWorldPosition(V(0,0,0));

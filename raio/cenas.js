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
const HERO=sprite(CHAR_VB,.8,scene,true),NEIGH=sprite(CHAR_VB,.7,scene,true),SLEEP=sprite([-220,-260,440,440],1.2);
// Herói original: cabelo curto preto-azulado, agasalho índigo com listra amarela, raiozinho na cabeça. Vizinha: cacheada, de óculos.
const HK={hairStyle:'short',hair:'#262238',skin:'#eba574',shirt:'#3a2f72',pants:'#2c2858',sleeveStripe:'#ffd23f'};
const NK={hairStyle:'curly',hair:'#5a3320',skin:'#b97a52',shirt:'#2f6a5a',pants:'#3a3a4a',sleeveStripe:'#ff7a9a'};
// o "broto" vira raiozinho + cabelo arrepiado + faíscas (desenhado dentro da cabeça, acompanha o movimento)
let SP={bolt:true,frizz:0,spark:0,hair:HK.hair,t:0,smoke:0};
window.sprout=function(t){const T=SP.t;let h='';
  if(SP.frizz>0){for(let i=0;i<13;i++){const a=(-168+i*13)*Math.PI/180,r0=92,len=(40+rnd(i)*45)*SP.frizz*(1+.15*Math.sin(T*30+i)),w=16;
    const bx=Math.cos(a)*r0,by=Math.sin(a)*r0-10,tx=Math.cos(a)*(r0+len)+Math.sin(T*25+i)*4,ty=Math.sin(a)*(r0+len)-10;const px=-Math.sin(a)*w,py=Math.cos(a)*w;
    h+=`<path d="M${f(bx+px)} ${f(by+py)} L${f(tx)} ${f(ty)} L${f(bx-px)} ${f(by-py)}Z" fill="${SP.hair}"/>`;}}
  if(SP.smoke>0)for(let k=0;k<4;k++){const ph=(T*.8+k/4)%1;h+=`<circle cx="${f(Math.sin(T*2+k*2)*30+(k-1.5)*40)}" cy="${f(-150-ph*170)}" r="${f(22+ph*40)}" fill="#8a8a96" opacity="${f(SP.smoke*.55*(1-ph))}"/>`;}
  if(SP.bolt){const r=Math.sin(T*2.4)*7,fl=.6+.4*Math.abs(Math.sin(T*13));
    h+=`<g transform="translate(0 -128) rotate(${f(r)})"><path d="M12 -92 L-20 -36 L-1 -36 L-14 8 L26 -52 L5 -52 L20 -92Z" fill="#ffd23f" stroke="#e8961a" stroke-width="6" stroke-linejoin="round"/><path d="M13 -84 L-10 -42 L4 -42" stroke="#fff8c0" stroke-width="5" fill="none" stroke-linecap="round" opacity="${f(fl)}"/></g>`;}
  if(SP.spark>0)h+=sparks(0,-40,170*SP.spark+40,T,5,5,77);
  return h;};
function hero(o){SP={bolt:true,frizz:o.frizz||0,spark:o.spark||0,hair:HK.hair,t:o.t,smoke:o.smoke||0};return guy(Object.assign({x:0,y:0,s:1,seed:1,style:'soft',kit:HK,sprout:true,wind:.3},o));}
function neigh(o){SP={bolt:false,frizz:o.frizz||0,spark:o.spark||0,hair:NK.hair,t:o.t,smoke:o.smoke||0};return guy(Object.assign({x:0,y:0,s:1,seed:5,style:'soft',kit:NK,glasses:true,sprout:true,wind:.3},o));}
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

// ================= cenas =================
const EV=[];const ev=(s,u,n,g=1)=>{EV.push([s,u,n,g]);return u;};
const TREE1=TREES.reduce((a,b)=>Math.hypot(b.g.position.x-3.2,b.g.position.z+5.6)<Math.hypot(a.g.position.x-3.2,a.g.position.z+5.6)?b:a);
const ROOF=HOUSES.filter(H=>H.z<0&&Math.abs(H.z+12.5)<1).reduce((a,b)=>Math.abs(b.x)<Math.abs(a.x)?b:a);
const BED_HEAD=V(1.15,.8,-.33);
const SC=[
// ---------- S1 quarto: acorda com o poder ----------
{mood:'room',fov:50,rain:u=>.25,setup(d){ev(0,.15,'thunder',.45);ev(0,1.2,'zap',.9);ev(0,1.22,'boing',.7);ev(0,2.2,'crackle',.9);ev(0,3.3,'buzz',.8);ev(0,d-.95,'pop');},
async up(u,d,t){const s=shots(u,[0,1.2,2.2,3.3],d),v=s.v;let h='';roomLights(1,t);fairyReset();
  const LS=.78,HP=V(1.15,.66+400*K*LS,-.28);
  if(s.i===0){SLEEP.mesh.visible=true;SLEEP.mesh.scale.setScalar(.6);SLEEP.mesh.position.copy(BED_HEAD).add(V(0,Math.sin(t*1.4)*.004,0));
    SP={bolt:true,frizz:0,spark:0,hair:HK.hair,t,smoke:0};await SLEEP.set(head({t,style:'soft',view:'3q',dir:1,expr:'sleep',hairStyle:HK.hairStyle,hair:HK.hair,skin:HK.skin,blush:.7,sprout:true}));
    camShot(v,s.d,V(-.55,1.75,2.5),V(-.2,1.6,1.9),V(1.05,.85,-.45),V(1.1,.85,-.4),{t});const q=proj(BED_HEAD.x,BED_HEAD.y+.15,BED_HEAD.z);h+=zz(q.x+40,q.y-40,t);FOCUS=BED_HEAD;AP=.002;
    h+=flashRect(strike(u,.15,.3)*.35);}
  else{HERO.mesh.visible=true;HERO.mesh.scale.setScalar(LS);const j=hop(u,1.2,.3,90);HERO.mesh.position.set(HP.x,HP.y-j.y*K*LS,HP.z);
    let o={t,sq:j.sq,frizz:s.i===1?1-seg(v,.2,1):(s.i>=2?.15:0),spark:s.i===1?1-seg(v,.3,.9):0};
    if(s.i===1)Object.assign(o,{expr:'shock',aL:60+Math.sin(t*20)*8,eL:-40,aR:60-Math.sin(t*20)*8,eR:-40,handL:'open',handR:'open',look:0,mouth:.5});
    if(s.i===2)Object.assign(o,{expr:v<.5?'shock':'smirk',aL:15,eL:-10,reachR:[160,40],handR:'open',look:.8,lookY:0,pupil:1.3});
    if(s.i===3){const pt=u>d-1.0;Object.assign(o,{expr:pt?'laugh':'smirk',aL:15,eL:-10,reachR:pt?[200,150]:[170,30],handR:pt?'point':'open',lookCam:pt,look:pt?0:.8,mouth:pt?.4:0});}
    await HERO.set(hero(o));
    if(s.i===1){camShot(v,s.d,V(.95,1.4,1.45),V(1.0,1.38,1.25),V(1.15,1.2,-.3),V(1.15,1.22,-.3),{t,shake:shake(u,1.2,.02,5)});FOCUS=HP;AP=.004;const q=proj(HP.x,HP.y+.32,HP.z);h+=popText('?!',q.x+170,q.y-30,seg(v,.05,.3),{size:100});h+=flashRect(.4*(1-seg(v,0,.25)),'#cfe8ff');}
    const HW=svgWorld(HERO,...(o.reachR?reachPt(1,...o.reachR):handSVG(1,o.aR,o.eR)));
    if(s.i===2){camShot(v,s.d,V(HW.x+.05,HW.y+.02,HW.z+.95),V(HW.x+.04,HW.y+.02,HW.z+.8),V(HW.x-.03,HW.y-.02,HW.z),V(HW.x-.03,HW.y-.02,HW.z),{t});FOVMUL=punch(u,2.2,.15);FOCUS=HW;AP=.02;}
    if(s.i===3){const a=lerp(-.35,.3,ease(cl(v/s.d)));camAt2(V(HP.x+Math.sin(a)*1.6,1.35,HP.z+Math.cos(a)*1.6),V(HP.x,1.15,HP.z),t);FOCUS=HP;AP=.004;}
    world(t);
    if(s.i>=2){const q=proj(HW.x,HW.y+(s.i===3?.12:.05),HW.z),g=seg(u,2.2,3.2),sz=(s.i===2?150:60);h+=sparks(q.x,q.y,sz*(.4+g),t,4+Math.round(g*4),s.i===2?7:4,3);if(s.i===3&&u<d-1.0)h+=eball(q.x,q.y-20,30+seg(u,3.3,d-1)*30,t,5);zapL.position.copy(HW).add(V(0,0,.15));zapL.intensity=(s.i===2?.6:1.5)+Math.abs(Math.sin(t*40))*(s.i===2?.6:1.5);}
    if(s.i===3)h+=popText('PODER DO RAIO!',540,380,seg(u,d-.95,d-.65),{size:112,fill:'#9fe6ff',rot:-5});}
  if(s.i===0)world(t);
  const tp=1-seg(u,1.1,1.3);if(tp>0)h+=label('E SE VOCÊ TIVESSE',300,{size:96,p:tp})+label('O PODER DO RAIO?',430,{size:122,fill:'#ffd23f',p:tp});
  return h;}},
// ---------- S2 quarto: queima as lâmpadas ----------
{mood:'room',fov:50,rain:u=>.25,setup(d){ev(1,.1,'charge',.9);ev(1,1.0,'zap',1.1);for(let i=0;i<8;i++)ev(1,1.08+i*.11,'bulbpop',.55);ev(1,2.05,'bulbpop',.9);ev(1,2.3,'thud',.4);ev(1,3.15,'plop',.8);},
async up(u,d,t){const s=shots(u,[0,1.0,2.0,3.1],d),v=s.v;let h='';const LS=.78,HP=V(-.45,FEET*LS,.55),G=1.0;
  const dark=seg(u,2.05,2.5);roomLights(1-dark,t);
  RMX.FAIRY.forEach((g,i)=>{const dead=u>G+.08+i*.04;g.userData.dead=dead;g.visible=!dead;g.userData.b.material.color.set(dead?'#2a2626':g.material.color);});
  HERO.mesh.visible=true;HERO.mesh.scale.setScalar(LS);HERO.mesh.position.copy(HP);
  const anti=seg(u,.1,.9),push=seg(u,G,G+.12);let o={t,spark:0,frizz:u>G?.35:0};
  if(u<G)Object.assign(o,{expr:'angry',sq:.1*anti,aR:lerp(15,-35,anti),eR:lerp(-10,-60,anti),handR:'fist',aL:lerp(15,40,anti),eL:-30,lean:-6*anti});
  else if(u<2.0)Object.assign(o,{view:'back',reachR:[lerp(120,230,push),lerp(330,-260,push)],handR:'point',aL:30,eL:-20});
  else if(u<3.1)Object.assign(o,{expr:'shock',aL:40+tremble(t,6),aR:40,eL:-60,eR:-60,mouth:.5,look:darting(t,2)});
  else Object.assign(o,{expr:'halfsmile',gesture:u>3.7?'scratch':undefined,aL:15,eL:-10,aR:20,eR:-20,blush:.4,look:-.3});
  await HERO.set(hero(o));
  if(s.i===0){camShot(v,s.d,V(-.3,1.2,2.15),V(-.32,1.15,1.85),V(-.45,1.05,.55),V(-.45,1.0,.55),{t});FOVMUL=1+.05*anti;FOCUS=HP;AP=.004;
    const [hx,hy]=handSVG(1,o.aR,o.eR),q=proj(svgWorld(HERO,hx,hy));h+=sparks(q.x,q.y,40+anti*60,t,3+Math.round(anti*4),4,9);}
  if(s.i===1){camShot(v,s.d,V(.25,1.5,2.1),V(.15,1.55,1.85),V(-1.0,2.1,-2.9),V(-1.15,2.25,-2.9),{t,shake:shake(u,G,.05,5),whip:whip(v,s.d,.14)*(v<.2?1:0)});FOCUS=V(-1.4,2.7,-2.9);AP=.002;
    h+=speedLines(Math.abs(whip(v,s.d,.14))*(v<.2?1:0));
    const hw=svgWorld(HERO,...reachPt(1,o.reachR[0],o.reachR[1]));
    const live=RMX.FAIRY.filter(g=>!g.userData.dead),tgt=live.length?live[0]:RMX.FAIRY[RMX.FAIRY.length-1];
    if(u>G&&u<G+1.0)h+=bolt3D(hw,tgt.position,Math.floor(u*20),{w:9,jag:.12,n:12,br:2});
    RMX.FAIRY.forEach((g,i)=>{const td=G+.08+i*.04;if(u>td&&u<td+.3){const q=proj(g.position);h+=sparks(q.x,q.y,60,t+i,4,3,i)+`<circle cx="${f(q.x)}" cy="${f(q.y)}" r="${f(40*(1-(u-td)/.3))}" fill="#fff8d0" opacity=".8"/>`;}});
    zapL.position.copy(tgt.position);zapL.intensity=u>G?6+Math.sin(t*50)*3:0;
    h+=popText('POC!',380,620,seg(u,G+.15,G+.4),{size:110,fill:'#fff',rot:-10})+popText('POC!',720,520,seg(u,G+.45,G+.7),{size:120,fill:'#ffd23f',rot:8})+popText('POC!',560,780,seg(u,G+.7,G+.95),{size:100,fill:'#fff',rot:-4});}
  if(s.i===2){camShot(v,s.d,V(1.7,2.3,2.4),V(1.5,2.2,2.2),V(-.9,1.0,-.7),V(-.9,1.0,-.75),{t,shake:shake(u,2.05,.03,5)});FOCUS=HP;AP=.002;
    const lp=RMX.DESK.userData.bulb.getWorldPosition(V(0,0,0)),q=proj(lp);if(u<2.4)h+=sparks(q.x,q.y,80,t,5,4,4)+flashRect(.3*(1-seg(u,2.05,2.2)),'#fff6d8');
    const cq=proj(RMX.CH.position);for(let k=0;k<5;k++){const ph=seg(u,2.25+k*.05,3.1);if(ph>0&&ph<1)h+=`<circle cx="${f(cq.x+(k-2)*40+Math.sin(t*3+k)*12)}" cy="${f(cq.y-ph*180)}" r="${f(18+ph*40)}" fill="#9a94a8" opacity="${f(.5*(1-ph))}"/>`;}}
  if(s.i===3){camShot(v,s.d,V(-.38,1.33,1.45),V(-.4,1.32,1.3),V(-.45,1.22,.55),V(-.45,1.22,.55),{t});FOVMUL=punch(u,3.1,.12);FOCUS=HP;AP=.012;
    const q=proj(HP.x,HP.y+.25,HP.z);h+=sweat(q.x,q.y-50,t)+popText('OPS...',800,1260,seg(v,.15,.4),{size:110,fill:'#fff',rot:6});
    const hq=proj(svgWorld(HERO,95,320));h+=sparks(hq.x,hq.y,50,t,3,3,12);zapL.position.copy(svgWorld(HERO,95,320)).add(V(0,0,.25));zapL.intensity=1.5+Math.abs(Math.sin(t*35))*2.5;}
  world(t);return h;}},
// ---------- S3 tempestade: 30 mil graus ----------
{mood:'storm',fov:52,rain:u=>1,setup(d){ev(2,.1,'rain',1);ev(2,.4,'thunder',.5);ev(2,1.25,'zap',1.2);ev(2,1.28,'thunder',1.2);ev(2,1.6,'sizzle',.9);ev(2,2.65,'sizzle',.7);ev(2,3.85,'sting',.8);},
async up(u,d,t){const s=shots(u,[0,1.2,2.6,3.8],d),v=s.v;let h='';WIND={w:.8,dx:-1,dz:.3};const LS=.85,HP=V(0,FEET*LS,-1.4),HIT=1.25;
  HERO.mesh.visible=true;HERO.mesh.scale.setScalar(LS);HERO.mesh.position.copy(HP);
  let o={t,wind:.9,windDir:-1,frizz:.4,wet:.6};
  if(u<HIT)Object.assign(o,{expr:'angry',aL:160+Math.sin(t*6)*5,aR:160-Math.sin(t*6)*5,eL:-10,eR:-10,handL:'open',handR:'open',lookY:-.8,spark:.5});
  else if(u<3.8)Object.assign(o,{expr:'fear',reachL:[-40,-10],reachR:[40,-10],front:'R',lean:-8,squint:1});
  else Object.assign(o,{expr:'laugh',aR:150,eR:-10,handR:'open',aL:20,eL:-20,mouth:talk(t),lookCam:true});
  await HERO.set(hero(o));
  const TOP=V(TREE1.g.position.x,5.6*TREE1.g.scale.x,TREE1.g.position.z),SKYP=V(TOP.x+4,48,TOP.z-6),st=strike(u,HIT,.45);
  treeGlow(TREE1,u>HIT?1.4*Math.exp(-(u-HIT)*.9)*(1+.2*Math.sin(t*20)):0);
  flashL.intensity=st*5+strike(u,.4,.2)*2;zapL.position.copy(TOP).add(V(0,1,2));zapL.intensity=st*60+(u>HIT?6*Math.exp(-(u-HIT)*.8):0);zapL.color.set(st>0?'#bfe0ff':'#ff9a4a');
  if(s.i===0){camShot(v,s.d,V(-1.1,.45,1.8),V(-.9,.5,1.5),V(0,2.4,-3.5),V(0,2.7,-3.8),{t});FOCUS=HP;AP=.003;
    const [lx,ly]=handSVG(-1,o.aL,o.eL),[rx,ry]=handSVG(1,o.aR,o.eR),a=proj(svgWorld(HERO,lx,ly)),b=proj(svgWorld(HERO,rx,ry));h+=zap(a.x,a.y,b.x,b.y,Math.floor(t*15),{w:5,br:1,jag:.3});}
  if(s.i===1){camShot(v,s.d,V(-4.2,1.6,4.8),V(-4.0,1.7,4.4),V(1.6,3.4,-4.6),V(1.7,3.5,-4.6),{t,shake:shake(u,HIT,.08,4)});FOVMUL=punch(u,HIT,.12);FOCUS=TOP;AP=.0015;BL=[.8,.6,.7];
    if(st>0)h+=bolt3D(SKYP,TOP,Math.floor(u*30)%3+7,{w:16,jag:.12,n:20,br:5});
    if(u>HIT){const q=proj(TOP);for(let k=0;k<10;k++){const ph=((u-HIT)*1.3+rnd(k))%1;h+=`<circle cx="${f(q.x+(rnd(k+3)-.5)*260+Math.sin(t*3+k)*20)}" cy="${f(q.y+40-ph*260)}" r="${f(6*(1-ph)+2)}" fill="#ffb04a" opacity="${f(1-ph)}"/>`;}}
    h+=counterBR(540,330,30000,seg(u,HIT+.05,2.4),{suf:' °C',size:150,fill:'#ff8a3d'});h+=flashRect(st*.5);}
  if(s.i===2){camShot(v,s.d,V(.25,1.5,.15),V(.22,1.48,0),V(0,1.32,-1.4),V(0,1.32,-1.4),{t});FOVMUL=punch(u,2.6,.1);FOCUS=HP;AP=.012;
    const q=proj(HP.x,HP.y+.2,HP.z);for(let k=0;k<5;k++){const ph=(t*.9+k/5)%1;h+=`<circle cx="${f(q.x+(k-2)*70+Math.sin(t*2+k)*20)}" cy="${f(q.y-120-ph*300)}" r="${f(24+ph*50)}" fill="#e8e8f0" opacity="${f(.45*(1-ph))}"/>`;}h+=sweat(q.x,q.y-40,t);
    h+=counterBR(540,330,30000,1,{suf:' °C',size:150,fill:'#ff8a3d'});}
  if(s.i===3){camShot(v,s.d,V(.7,1.5,1.6),V(.6,1.45,1.3),V(0,1.35,-1.4),V(0,1.35,-1.4),{t});FOCUS=HP;AP=.006;
    h+=sunIcon(540,560,seg(v,.05,.4),t)+label('×5',700,{size:170,x:810,fill:'#fff',p:seg(v,.3,.55),rot:8})+label('MAIS QUENTE QUE O SOL',360,{size:88,fill:'#ffd23f',p:seg(v,.4,.7)});}
  world(t,V(0,0,-3));return h;}},
// ---------- S4 tempestade: 300 milhões de volts ----------
{mood:'storm',fov:52,rain:u=>.9,setup(d){ev(3,.1,'buzz',1);ev(3,1.0,'crackle',.9);ev(3,1.6,'whoosh',.6);ev(3,3.2,'pop');ev(3,4.0,'whoosh',.8);ev(3,4.05,'sting',.7);ev(3,4.9,'ding',.6);ev(3,6.3,'zap',1);ev(3,6.35,'thud',.4);},
async up(u,d,t){const s=shots(u,[0,1.6,3.2,4.9,6.2],d),v=s.v;let h='';WIND={w:.7,dx:-1,dz:.3};const LS=.85,HP=V(-.3,FEET*LS,1.2);
  HERO.mesh.visible=true;HERO.mesh.scale.setScalar(LS);HERO.mesh.position.copy(HP);
  const gr=seg(u,0,3.2);let o={t,wind:.8,windDir:-1,wet:.6,frizz:.3+gr*.7};
  if(u<3.2)Object.assign(o,{expr:u<1.6?'smirk':'laugh',reachL:[-60,250],reachR:[60,250],handL:'open',handR:'open',lookY:.4,mouth:u>1.6?.5:0,pupil:1.2});
  else if(u<4.9)Object.assign(o,{view:'3q',dir:1,expr:'suspicious',gesture:'think',look:.8});
  else if(u<6.2)Object.assign(o,{expr:'laugh',aR:70,eR:-95,handR:'thumb',aL:15,eL:-10,mouth:talk(t),lookCam:true});
  else Object.assign(o,{expr:'happy',aR:60+Math.sin(t*18)*20,eR:-40,handR:'open',aL:15,eL:-10,look:.5,lookY:.6});
  await HERO.set(hero(o));const BW=svgWorld(HERO,0,250);zapL.color.set('#a8d8ff');
  if(s.i===0){camShot(v,s.d,V(.5,1.45,3.6),V(.35,1.4,3.2),V(-.3,1.3,1.2),V(-.3,1.3,1.2),{t});FOCUS=HP;AP=.004;}
  if(s.i===1){const a=lerp(-.5,.4,ease(cl(v/s.d)));camAt2(V(HP.x+Math.sin(a)*1.7,1.4,HP.z+Math.cos(a)*1.7),V(HP.x,1.12,HP.z),t);FOVMUL=punch(u,1.6,.14);FOCUS=HP;AP=.012;}
  if(s.i<2){const q=proj(BW);h+=eball(q.x,q.y,40+gr*(s.i===1?120:70),t,2);zapL.position.copy(BW).add(V(0,0,.4));zapL.intensity=(s.i===1?1:2)*(1.5+gr*2+Math.sin(t*40)*.6);
    h+=counterBR(540,330,300000000,seg(u,.8,3.0),{suf:' V',size:118,fill:'#9fe6ff'});}
  if(s.i===2){camShot(v,s.d,V(.9,1.5,3.3),V(.8,1.48,3.1),V(.2,1.35,1.2),V(.2,1.35,1.2),{t});FOCUS=HP;AP=.004;
    h+=socket(760,700,seg(v,.0,.3),t);
    const bp=seg(u,4.0,4.6);if(bp>0){h+=`<rect x="0" y="0" width="1080" height="1920" fill="#0b1020" opacity="${f(.55*bp)}"/>`;
      const H1=900*ease(bp);h+=`<rect x="200" y="${f(1380-H1)}" width="260" height="${f(H1)}" rx="20" fill="#ffd23f" stroke="#141414" stroke-width="8"/><rect x="620" y="1374" width="260" height="6" fill="#9fe6ff"/>`;
      h+=label('RAIO',1460,{size:96,x:330,p:bp})+label('TOMADA',1460,{size:96,x:750,p:bp})+label('300 MILHÕES',1380-H1-40,{size:70,x:330,p:bp,fill:'#ffd23f'})+label('220',1330,{size:70,x:750,p:bp,fill:'#9fe6ff'});}}
  if(s.i===3){camShot(v,s.d,V(.05,1.4,2.9),V(0,1.38,2.7),V(-.2,1.2,1.2),V(-.2,1.2,1.2),{t});FOVMUL=punch(u,4.9,.1);FOCUS=HP;AP=.008;
    const [hx,hy]=handSVG(1,70,-95),q=proj(svgWorld(HERO,hx,hy-40));h+=sparks(q.x,q.y,60,t,4,4,8);zapL.position.copy(svgWorld(HERO,hx,hy)).add(V(0,0,.3));zapL.intensity=2+Math.abs(Math.sin(t*30))*2;}
  if(s.i===4){camShot(v,s.d,V(.6,1.1,3.0),V(.4,1.0,2.7),V(-.3,.8,1.4),V(-.3,.75,1.4),{t,shake:shake(u,6.3,.03,6)});FOCUS=HP;AP=.004;
    const [hx,hy]=handSVG(1,o.aR,o.eR),hw=svgWorld(HERO,hx,hy),q=proj(hw);h+=sparks(q.x,q.y,50,t,3,3,4);
    if(u>6.3&&u<6.75){const g=proj(hw.x+.6,.02,hw.z+.4);h+=zap(q.x,q.y,g.x,g.y,Math.floor(u*30),{w:8,br:2})+`<ellipse cx="${f(g.x)}" cy="${f(g.y)}" rx="${f(120*seg(u,6.3,6.75))}" ry="${f(30*seg(u,6.3,6.75))}" fill="none" stroke="#bfe6ff" stroke-width="8" opacity="${f(1-seg(u,6.3,6.75))}"/>`;zapL.position.copy(hw);zapL.intensity=12;h+=popText('ZAP!',g.x+120,g.y-160,seg(u,6.3,6.5),{size:100,fill:'#9fe6ff'});}}
  world(t,V(0,0,0));return h;}},
// ---------- S5 tempestade: trovão ----------
{mood:'storm',fov:52,rain:u=>.9,setup(d){ev(4,.05,'zap',.9);ev(4,.1,'sizzle',.8);ev(4,1.1,'boom',1.3);ev(4,3.55,'pop');},
async up(u,d,t){const s=shots(u,[0,1.1,2.4,3.5],d),v=s.v;let h='';WIND={w:.7,dx:-1,dz:.3};const LS=.85,HP=V(1.4,FEET*LS,1.8),SP0=V(-8,0,-1.2),BOOM=1.1;
  HERO.mesh.visible=true;HERO.mesh.scale.setScalar(LS);HERO.mesh.position.copy(HP);
  let o={t,wind:.8,windDir:-1,wet:.6,frizz:.6};
  if(u<BOOM)Object.assign(o,{view:'back',aL:20,aR:20});
  else if(u<2.4)Object.assign(o,{view:'back',aL:40,aR:40,eL:-40,eR:-40,rot:tremble(t,3)});
  else if(u<3.5)Object.assign(o,{expr:'fear',reachL:[-118,10],reachR:[118,10],rot:tremble(t,2),blink:.85});
  else Object.assign(o,{expr:'laugh',aR:160,eR:-10,handR:'point',aL:20,eL:-20,mouth:talk(t),lookY:-.5});
  await HERO.set(hero(o));
  const bo=u<BOOM+.4?1:Math.max(0,1-(u-BOOM-.4)*3);const SKYP=V(SP0.x+3,46,SP0.z-5);
  flashL.intensity=(u<BOOM+.5?2.2*bo*(.8+.2*Math.sin(t*40)):0)+strike(u,BOOM,.25)*5;zapL.position.copy(SP0).add(V(0,3,3));zapL.intensity=bo*35;zapL.color.set('#bfe0ff');
  const sk=seg(u,BOOM,BOOM+1.2);SHOCK.position.copy(SP0).add(V(0,2,0));SHOCK.scale.setScalar(.5+eo(sk)*16);SHOCK.material.opacity=u>BOOM?.35*(1-sk):0;
  RINGS.forEach((r,i)=>{const k=seg(u,BOOM+i*.12,BOOM+1.4+i*.12);r.position.set(SP0.x,.05,SP0.z);r.scale.setScalar(.5+eo(k)*20);r.material.opacity=k>0&&k<1?.6*(1-k):0;});
  HOUSES.forEach(H=>{const q=quake(u,BOOM+Math.hypot(H.x-SP0.x,H.z-SP0.z)*.01,.06,5);H.g.position.set(H.x+q[0],q[1],H.z);});
  if(s.i===0){camShot(v,s.d,V(3.2,1.7,5.2),V(3.0,1.8,4.8),V(-6.5,3.6,-1.6),V(-6.7,3.8,-1.6),{t});FOCUS=SP0;AP=.0015;BL=[.8,.6,.7];
    h+=bolt3D(SKYP,SP0,Math.floor(u*20)%4,{w:13,jag:.06,n:16,br:3,op:bo});const q=proj(SP0.x,3,SP0.z);for(let k=0;k<6;k++){const ph=(t*1.5+k/6)%1;h+=`<ellipse cx="${f(q.x)}" cy="${f(q.y-ph*300)}" rx="${f(40+ph*120)}" ry="${f(14+ph*30)}" fill="none" stroke="#cfe6ff" stroke-width="4" opacity="${f(.5*(1-ph))}"/>`;}
    h+=popText('AR: 30.000 °C',540,360,seg(v,.15,.45),{size:96,fill:'#ff8a3d',rot:-3});}
  if(s.i===1){camShot(v,s.d,V(4.5,1.3,6.5),V(4.2,1.5,6.0),V(-6.5,3,-1.6),V(-6.5,3.2,-1.6),{t,shake:shake(u,BOOM,.18,3.5)});FOVMUL=punch(u,BOOM,.25);FOCUS=SP0;AP=.0015;BL=[.8,.6,.7];
    if(bo>0)h+=bolt3D(SKYP,SP0,Math.floor(u*20)%4,{w:13,jag:.06,n:16,br:3,op:bo});h+=popText('BUUUM!',540,620,seg(u,BOOM,BOOM+.35),{size:190,fill:'#ffd23f',rot:-8})+flashRect(.6*(1-seg(u,BOOM,BOOM+.25)))+speedLines(1-seg(u,BOOM,BOOM+.6));}
  if(s.i===2){camShot(v,s.d,V(1.6,1.5,3.1),V(1.58,1.49,2.95),V(1.4,1.38,1.8),V(1.4,1.38,1.8),{t,shake:[tremble(t,.01),tremble(t+3,.008)]});FOCUS=HP;AP=.012;const q=proj(HP.x,HP.y+.15,HP.z);h+=emanata(q.x,q.y,seg(v,0,.2),210);}
  if(s.i===3){camShot(v,s.d,V(2.4,1.25,4.2),V(2.2,1.3,3.9),V(1.4,1.6,1.8),V(1.3,1.7,1.8),{t});FOCUS=HP;AP=.005;h+=popText('TROVÃO!',540,380,seg(v,.05,.35),{size:130,fill:'#9fe6ff',rot:-6});
    if(v>.3){const st2=strike(u,3.9,.3);if(st2>0)h+=bolt3D(V(-20,50,-40),V(-14,0,-34),9,{w:9,op:st2});flashL.intensity=st2*2;}}
  world(t,V(0,0,0));return h;}},
// ---------- S6 bairro de cima: Brasil campeão ----------
{mood:'storm',fov:55,rain:u=>1,setup(d){for(const x of[.15,.45,.75,1.05])ev(5,x,'thunder',.6);ev(5,1.45,'crackle',.9);ev(5,2.95,'pop');ev(5,3.4,'thunder',.6);ev(5,4.35,'zap',.8);ev(5,4.5,'pop',.8);},
async up(u,d,t){const s=shots(u,[0,1.4,2.9,4.3],d),v=s.v;let h='';WIND={w:.9,dx:-1,dz:.3};const LS=.85,RH=V(ROOF.x,3.4+2.4+FEET*LS-.05,ROOF.z);
  HERO.mesh.visible=true;HERO.mesh.scale.setScalar(LS);HERO.mesh.position.copy(RH);
  let o={t,wind:1.1,windDir:-1,wet:.6,frizz:.8};
  if(s.i<3)Object.assign(o,{expr:s.i===1&&v>.7?'laugh':'smirk',aL:115+Math.sin(t*5)*8,aR:115-Math.sin(t*5)*8,eL:-25,eR:-25,handL:'open',handR:'open',mouth:s.i===1&&v>.7?.5:0,lookY:-.4});
  else Object.assign(o,{expr:'smug',reachL:[-150,260],reachR:[150,260],handL:'open',handR:'open',look:Math.sin(t*6)*.8});
  await HERO.set(hero(o));
  const HITS=[[.15,-18,-12],[.45,8,12],[.75,-30,-38],[1.05,20,-25],[1.35,-6,38],[1.8,34,10],[2.2,-42,14],[2.6,16,-40],[3.0,-24,-26],[3.4,40,-12],[3.8,-10,24],[4.6,28,30],[5.0,-36,-6]];
  let fl=0,zx=null;
  const strikes=()=>{let hh='';for(const[t0,x,z]of HITS){const st=strike(u,t0,.3);if(st>0){fl=Math.max(fl,st);zx=V(x,4,z);hh+=bolt3D(V(x+3,55,z-4),V(x,0,z),Math.floor(u*30)%3+Math.round(x),{w:11,jag:.07,n:14,br:3,op:st});}}return hh;};
  if(s.i===0){camShot(v,s.d,V(-6,38,34),V(-4,36,30),V(0,0,-6),V(0,0,-8),{t});FOCUS=V(0,0,-6);AP=.001;BL=[.8,.6,.7];h+=strikes();}
  const [lx,ly]=handSVG(-1,o.aL,o.eL),[rx,ry]=handSVG(1,o.aR,o.eR);
  if(s.i===1){camShot(v,s.d,V(RH.x+2.4,RH.y+.2,RH.z+3.6),V(RH.x+2.1,RH.y+.3,RH.z+3.1),V(RH.x,RH.y-.05,RH.z),V(RH.x,RH.y,RH.z),{t});FOCUS=RH;AP=.004;
    h+=strikes();const a=proj(svgWorld(HERO,lx,ly)),b=proj(svgWorld(HERO,rx,ry));h+=zap(a.x,a.y,b.x,b.y,Math.floor(t*15),{w:6,br:2,jag:.25})+sparks(a.x,a.y,50,t,3,3,1)+sparks(b.x,b.y,50,t,3,3,2);zapL.position.copy(RH);zapL.intensity=5+Math.sin(t*40)*2;}
  if(s.i===2){const a=v*.5+.8;camAt2(V(Math.cos(a)*30,26+v*4,ROOF.z+Math.sin(a)*30),V(0,0,ROOF.z),t);FOCUS=V(0,0,ROOF.z);AP=.001;BL=[.8,.6,.7];h+=strikes()+pin(540,760,seg(v,.05,.35),'BRASIL: Nº 1 EM RAIOS');}
  if(s.i===3){camShot(v,s.d,V(RH.x+.4,RH.y+.15,RH.z+1.6),V(RH.x+.35,RH.y+.12,RH.z+1.4),V(RH.x,RH.y-.02,RH.z),V(RH.x,RH.y,RH.z),{t});FOVMUL=punch(u,4.3,.1);FOCUS=RH;AP=.012;
    const a=proj(svgWorld(HERO,-150,260)),b=proj(svgWorld(HERO,150,260)),ph=(Math.sin(t*5)+1)/2;h+=zap(a.x,a.y,b.x,b.y,Math.floor(t*15),{w:5,br:1,jag:.3})+eball(lerp(a.x,b.x,ph),lerp(a.y,b.y,ph)-Math.sin(ph*Math.PI)*60,26,t,3);zapL.position.copy(svgWorld(HERO,0,260)).add(V(0,0,.3));zapL.intensity=3+Math.sin(t*40);
    h+=popText('POR ANO!',540,560,seg(v,.15,.45),{size:130,fill:'#ffd23f',rot:-6});}
  if(s.i!==3){flashL.intensity=fl*3;if(zx){zapL.position.copy(zx);zapL.intensity=Math.max(zapL.intensity,fl*80);}}
  h+=counterBR(540,330,78000000,seg(u,.2,2.6),{size:124,fill:'#9fe6ff'})+(u>.6&&s.i!==3?label('RAIOS POR ANO',450,{size:70,p:seg(u,.6,.9),fill:'#fff'}):'');
  h+=flashRect(fl*.25);world(t,V(0,0,-6));return h;}},
// ---------- S7 noite: acende a cidade ----------
{mood:'night',fov:50,rain:u=>0,setup(d){ev(6,.5,'zap',.9);ev(6,.55,'ding',.6);for(let k=1;k<6;k++)ev(6,1.2+k*.2,'zap',.45);ev(6,2.5,'ding',.5);ev(6,2.8,'ding',.45);ev(6,3.6,'sparkle',.6);},
async up(u,d,t){const s=shots(u,[0,1.2,2.4,3.5],d),v=s.v;let h='';WIND={w:.2,dx:1,dz:0};const LS=.85,HP=V(-6.55,FEET*LS,-3.65),TOUCH=.5;
  const ROW=POSTS.filter(P=>P.position.z<0&&P.position.x>=-6.5).sort((a,b)=>a.position.x-b.position.x),ROW2=POSTS.filter(P=>P.position.z>0).sort((a,b)=>a.position.x-b.position.x);
  const onT=k=>TOUCH+.05+k*.2;postsOff();
  ROW.forEach((P,k)=>postOn(P,seg(u,onT(k),onT(k)+.15),t));ROW2.forEach((P,k)=>postOn(P,seg(u,onT(Math.max(0,(P.position.x+6)/12))+.1,onT(Math.max(0,(P.position.x+6)/12))+.25),t));
  HOUSES.forEach(H=>{const dd=Math.hypot(H.x-HP.x,H.z-HP.z);H.win.forEach((w,i)=>w.material.opacity=.9*seg(u,1.0+dd*.035+i*.05,1.2+dd*.035+i*.05));});
  postL.position.copy(bulbW(ROW[0])).add(V(0,-1.6,1.4));postL.intensity=5*seg(u,onT(0),onT(0)+.15);
  HERO.mesh.visible=true;HERO.mesh.scale.setScalar(LS);HERO.mesh.position.copy(HP);
  let o={t,wind:.2,frizz:.2,light:{color:'#ffcf8a',az:60,amt:.5*seg(u,onT(0),onT(0)+.2)}};
  if(u<1.2)Object.assign(o,{view:'3q',dir:1,expr:u<TOUCH?'smirk':'happy',reachR:[lerp(150,330,seg(u,0,TOUCH)),120],handR:'open',aL:15,eL:-10,look:.8});
  else Object.assign(o,{expr:u<3.5?'happy':'smug',gesture:u>3.5?'hips':undefined,aL:15,eL:-10,aR:15,eR:-10,look:u<3.5?.8:0,lookCam:u>3.9});
  await HERO.set(hero(o));
  if(s.i===0){camShot(v,s.d,V(-5.2,1.7,.3),V(-5.35,1.75,0),V(-6.2,2.0,-4.0),V(-6.2,2.15,-4.1),{t});FOCUS=HP;AP=.004;
    const q0=proj(svgWorld(HERO,330,120)),b=proj(bulbW(ROW[0]));if(u>TOUCH-.05&&u<TOUCH+.4)h+=zap(q0.x,q0.y,b.x,b.y,Math.floor(u*30),{w:7,br:2,jag:.08,n:12});h+=sparks(q0.x,q0.y,40,t,3,3,4);}
  if(s.i===1){camShot(v,s.d,V(-3,2.0,1.2),V(9,2.3,1.2),V(5,3.4,-4.4),V(25,3.6,-4.4),{t,e:x=>x});FOCUS=V(lerp(5,25,v/s.d),3.6,-4.4);AP=.002;
    ROW.forEach((P,k)=>{if(k===0)return;const tk=onT(k);if(u>tk-.2&&u<tk+.05){const a=proj(bulbW(ROW[k-1])),b=proj(bulbW(P));if(a.z<1&&b.z<1)h+=zap(a.x,a.y,b.x,b.y,Math.floor(u*30)+k,{w:6,br:1,jag:.12,n:10});}});}
  if(s.i===2){camShot(v,s.d,V(-14,22,18),V(-10,24,14),V(4,0,-6),V(6,0,-8),{t});FOCUS=V(4,0,-6);AP=.001;BL=[.9,.6,.6];}
  if(s.i===3){camShot(v,s.d,V(-6.3,1.5,-2.2),V(-6.35,1.48,-2.4),V(-6.55,1.32,-3.65),V(-6.55,1.32,-3.65),{t});FOVMUL=punch(u,3.5,.08);FOCUS=HP;AP=.012;BL=[.7,.6,.75];
    const q=proj(HP.x,HP.y+.3,HP.z);h+=sparkle(q.x+190,q.y-120,t,46)+sparkle(q.x-200,q.y-60,t+1,32);}
  world(t,V(-6,0,-4));return h;}},
// ---------- S8 pôr do sol: o abraço com choque ----------
{mood:'sunset',fov:50,rain:u=>0,setup(d){ev(7,.2,'step',.4);ev(7,.55,'step',.4);ev(7,1.4,'zap',1.3);ev(7,1.45,'crackle',1);ev(7,2.35,'thud',.6);ev(7,3.7,'plop',.6);ev(7,d-2.2,'pop');ev(7,d-1.5,'ding',.6);},
async up(u,d,t){const s=shots(u,[0,1.4,2.3,3.6],d),v=s.v;let h='';WIND={w:.3,dx:1,dz:0};const LS=.85,HP=V(-.4,FEET*LS,1.2),ZAP=1.4;
  const walkIn=seg(u,0,1.0),NX=lerp(2.6,.38,ease(walkIn));let NP=V(NX,FEET*LS,1.2);
  HERO.mesh.visible=true;HERO.mesh.scale.setScalar(LS);HERO.mesh.position.copy(HP);NEIGH.mesh.visible=true;NEIGH.mesh.scale.setScalar(LS);
  const rim={rim:'#ffb070',rimDir:1,light:{color:'#ffb070',az:70,amt:.45}};
  let o={t,...rim},n={t,...rim};
  if(u<ZAP){Object.assign(o,{view:'side',dir:1,expr:u<1.0?'happy':'shock',gesture:u>1.0?'hug':undefined,toward:1,aF:40,aB:30});Object.assign(n,{view:'side',dir:-1,expr:'happy',walk:u<1.0?t*1.8:undefined,gesture:u>1.0?'hug':undefined,toward:-1,aF:lerp(20,80,walkIn),aB:lerp(20,70,walkIn)});}
  else if(u<2.3){const tr=tremble(t,6);Object.assign(o,{expr:'shock',frizz:1,aL:120+tr,aR:120-tr,eL:-20,eR:-20,handL:'open',handR:'open',spark:1,rot:tr*.6});Object.assign(n,{expr:'shock',frizz:1,aL:130-tr,aR:130+tr,eL:-20,eR:-20,handL:'open',handR:'open',spark:1,rot:-tr*.6,pupil:.6});NP=V(lerp(.38,.9,seg(u,ZAP,ZAP+.3)),FEET*LS+Math.sin(seg(u,ZAP,2.3)*Math.PI)*.15,1.2);}
  else{Object.assign(o,{expr:u<3.6?'shock':(u<d-2.2?'halfsmile':'happy'),gesture:u<3.6?'facepalm':(u<d-2.2?'shrug':undefined),aR:u>d-2.2?150+Math.sin(t*12)*25:15,eR:-30,handR:u>d-2.2?'wave':'relaxed',aL:15,eL:-10,frizz:.25,smoke:.4,blush:.5,lookCam:u>3.6,mouth:u>d-2.2?talk(t):0});
    Object.assign(n,{stance:'sit',expr:'neutral',eyeFx:'spiral',frizz:1.1,smoke:.9,aL:30,aR:30,eL:-30,eR:-30,rot:Math.sin(t*3)*4});NP=V(1.15,FEET*LS,1.0);}
  await HERO.set(hero(o));NEIGH.mesh.position.copy(NP);await NEIGH.set(neigh(n));
  const zp=u>ZAP&&u<2.3;
  if(s.i===0){camShot(v,s.d,V(.7,1.3,5.8),V(.4,1.3,5.2),V(.5,1.1,1.2),V(.1,1.1,1.2),{t});FOCUS=HP;AP=.004;}
  if(s.i===1){camShot(v,s.d,V(.25,1.4,3.4),V(.25,1.38,3.2),V(.25,1.25,1.2),V(.25,1.25,1.2),{t,shake:shake(u,ZAP,.06,4)});FOVMUL=punch(u,ZAP,.2);FOCUS=HP;AP=.006;
    const a=proj(HP.x,HP.y-.3,HP.z),b=proj(NP.x,NP.y-.3,NP.z);for(let k=0;k<3;k++)h+=zap(a.x,a.y-k*120,b.x,b.y-k*100,Math.floor(t*20)+k*9,{w:6,br:1,jag:.3});
    h+=sparks(a.x,a.y-100,260,t,6,4,1)+sparks(b.x,b.y-100,260,t,6,4,2)+popText('ZZZAP!',540,520,seg(u,ZAP,ZAP+.3),{size:170,fill:'#9fe6ff',rot:-8})+flashRect(.55*(1-seg(u,ZAP,ZAP+.2)),'#dff2ff');
    zapL.position.set(0,1.2,1.8);zapL.intensity=8+Math.sin(t*50)*4;}
  if(s.i===2){camShot(v,s.d,V(.2,1.5,4.6),V(.25,1.45,4.3),V(.3,.95,1.1),V(.3,1.0,1.1),{t});FOCUS=HP;AP=.003;const q=proj(NP.x,NP.y+.25,NP.z);for(let k=0;k<3;k++){const a=t*5+k*TAU/3;h+=sparkle(q.x+Math.cos(a)*110,q.y-150+Math.sin(a)*25,t+k,30);}}
  if(s.i===3){camShot(v,s.d,V(-.3,1.52,2.75),V(-.33,1.5,2.55),V(-.4,1.45,1.2),V(-.4,1.45,1.2),{t});FOCUS=HP;AP=.01;const q=proj(HP.x,HP.y+.3,HP.z);if(u<d-2.2)h+=sweat(q.x,q.y-40,t);
    h+=label('E VOCÊ,',300,{size:110,p:seg(u,d-2.2,d-1.9)})+label('USARIA PRA QUÊ?',440,{size:126,fill:'#ffd23f',p:seg(u,d-2.0,d-1.7)});
    const cp=seg(u,d-1.5,d-1.1);if(cp>0)h+=`<g transform="translate(540 1560) scale(${(back(cp)*(1+Math.sin(t*8)*.03)).toFixed(3)})"><rect x="-300" y="-70" width="600" height="130" rx="65" fill="#ff2d55" stroke="#141414" stroke-width="10"/><text y="28" class="lb" font-size="84" fill="#fff" text-anchor="middle">SIGA PARA MAIS</text></g>`;}
  if(!zp&&s.i!==1){zapL.intensity=0;}
  world(t,V(0,0,1));return h;}}
];

// ================= legendas e linha do tempo =================
const HL=[['RAIOS','PODER'],['QUEIMAR','LÂMPADAS'],['30','MIL','GRAUS','CINCO','SOL'],['300','MILHÕES','VOLTS','127','220'],['EXPLODE','TROVÃO'],['BRASIL','78','MILHÕES'],['ACENDER','CIDADE'],['ABRAÇO','CHOQUE','QUÊ']];
const A_OFF=.12;let SCN=[],GROUPS=[];const norm=w=>w.replace(/[^\wÀ-ÿ]/g,'');
function setup(T){let t=0;T.forEach((b,i)=>{const d=b.dur+A_OFF+.3+(i===T.length-1?1.6:0);SCN.push({s:t,d});
  const words=b.text.toUpperCase().split(/\s+/).filter(Boolean),tot=words.reduce((a,w)=>a+w.length+1,0);let c=t+A_OFF,cur=[];
  words.forEach((w,k)=>{const wd=b.dur*(w.length+1)/tot;cur.push({w,t0:c,t1:c+wd,hl:HL[i].includes(norm(w))});c+=wd;if(cur.length===3||/[.,:!?]$/.test(w)||k===words.length-1){GROUPS.push({words:cur,t0:cur[0].t0,end:t+d});cur=[];}});t+=d;});
  for(let g=0;g<GROUPS.length-1;g++)GROUPS[g].end=Math.min(GROUPS[g].end,GROUPS[g+1].t0);GROUPS[GROUPS.length-1].end=t-1.6;
  SC.forEach((sc,i)=>sc.setup(SCN[i].d));return{total:t,scenes:SCN};}
function caption(t){const g=GROUPS.find(g=>t>=g.t0&&t<g.end);if(!g)return'';
  const p=seg(t,g.t0,g.t0+.16),s=.75+.25*back(p),len=g.words.reduce((a,w)=>a+w.w.length+1,0),sz=Math.min(112,940/(len*.47));
  const sp=g.words.map(w=>{const on=t>=w.t0,hl=on&&w.hl,j=hl?Math.sin(t*40)*Math.max(0,1-(t-w.t0)*4)*6:0;return `<tspan fill="${on?(w.hl?'#ffd23f':'#ffffff'):'#d9d9d9'}" dy="${f(j)}">${w.w}</tspan>`;}).join(' ');
  return `<g transform="translate(540 1560) scale(${s.toFixed(3)})"><text class="cap" y="8" font-size="${f(sz)}" fill="#000" stroke="#000" stroke-width="18" opacity=".4" text-anchor="middle">${g.words.map(w=>w.w).join(' ')}</text><text class="cap" font-size="${f(sz)}" stroke="#111" stroke-width="18" text-anchor="middle">${sp}</text></g>`;}
let CUR=-1;
window.render=async function(t){
  let i=SCN.findIndex(s=>t>=s.s&&t<s.s+s.d);if(i<0)i=SCN.length-1;const u=t-SCN[i].s,d=SCN[i].d;
  if(i!==CUR){CUR=i;mood(SC[i].mood);}
  SPR.forEach(s=>s.mesh.visible=false);FOVMUL=1;FOCUS=null;AP=.002;BL=[.55,.6,.82];flashL.intensity=0;zapL.intensity=0;
  HOUSES.forEach(H=>H.g.position.set(H.x,0,H.z));SHOCK.material.opacity=0;RINGS.forEach(r=>r.material.opacity=0);treeGlow(TREE1,0);
  const ui=await SC[i].up(u,d,t);
  cam.fov=(SC[i].fov||50)*FOVMUL;cam.updateProjectionMatrix();
  SPR.forEach(s=>{if(s.mesh.visible)bill(s);});
  bokeh.uniforms.focus.value=cam.position.distanceTo(FOCUS||V(0,0,0));bokeh.uniforms.aperture.value=AP;bokeh.uniforms.maxblur.value=AP>.005?.012:.006;
  bloom.strength=BL[0];bloom.radius=BL[1];bloom.threshold=BL[2];
  composer.render();
  document.getElementById('ui').innerHTML=ui;document.getElementById('caps').innerHTML=caption(t);
  document.getElementById('flash').setAttribute('opacity',i>0?f(.5*(1-seg(u,0,.2))):'0');
  const fr=Math.floor(t*30),gr=document.getElementById('grain');gr.setAttribute('x',f(-60+rnd(fr)*60));gr.setAttribute('y',f(-60+rnd(fr+5)*60));
};
window.INFO=setup(window.TIMING);window.GROUPS=GROUPS;
window.EVENTS=EV.map(([s,u,n,g])=>({t:+(SCN[s].s+u).toFixed(3),name:n,gain:g}));
window.WINDCURVE=[];for(let t=0;t<window.INFO.total;t+=.1){const i=Math.max(0,SCN.findIndex(s=>t>=s.s&&t<s.s+s.d));window.WINDCURVE.push(+SC[i].rain(t-SCN[i].s,SCN[i].d).toFixed(3));}
window.DBG={cam,scene,renderer,THREE,HOUSES,POSTS,TREES,ROOF};
await window.render(0);
window.ready=true;

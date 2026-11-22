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

// ================= ELEVADOR: personagem, cenários e cenas =================
function tex(w,h,draw,rep){const c=document.createElement('canvas');c.width=w;c.height=h;draw(c.getContext('2d'),w,h);const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=8;if(rep){t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(rep[0],rep[1]);}return t;}
function gnoise(g,w,h,a){const im=g.getImageData(0,0,w,h);for(let i=0;i<im.data.length;i+=4){const v=(R()-.5)*a;im.data[i]+=v;im.data[i+1]+=v;im.data[i+2]+=v;}g.putImageData(im,0,0);}
function M3(geo,mat,par,x=0,y=0,z=0){const m=new THREE.Mesh(geo,mat);m.position.set(x,y,z);m.castShadow=m.receiveShadow=true;par.add(m);return m;}
const B3=(w,h,d,mat,par,x,y,z)=>M3(new THREE.BoxGeometry(w,h,d),mat,par,x,y,z);
const softT=tex(128,128,g=>{const r=g.createRadialGradient(64,64,0,64,64,64);r.addColorStop(0,'rgba(255,255,255,1)');r.addColorStop(.4,'rgba(255,255,255,.4)');r.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=r;g.fillRect(0,0,128,128);});
function glowSpr(par,col,size,x,y,z){const m=new THREE.Mesh(new THREE.PlaneGeometry(size,size),new THREE.MeshBasicMaterial({map:softT,color:col,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,toneMapped:false,fog:false}));m.position.set(x,y,z);par.add(m);m.userData.glow=1;return m;}

// ---------- personagem fixo (original) ----------
const HERO=sprite(CHAR_VB,.75,scene,true),BIG=sprite([-1000,-1000,2000,2000],.55,scene,true),CREA=sprite([-300,-300,600,600],.8,scene,true);
const BOYK={hairStyle:'short',hair:'#5a3a24',skin:'#c99568',shirt:'#d2a032',pants:'#45607f',sleeveStripe:'#b8891f'};
const PHONE_SVG=(rot=-10)=>`<g transform="translate(0 128) rotate(${rot})"><rect x="-24" y="-44" width="48" height="86" rx="10" fill="#17171b"/><rect x="-18" y="-36" width="36" height="68" rx="5" fill="#9fd0ff"/><rect x="-18" y="-36" width="36" height="20" fill="#cfe8ff" opacity=".6"/></g>`;
window.sprout=()=>'';
function kid(o){return guy(Object.assign({x:0,y:0,s:1,seed:2,style:'soft',kit:BOYK,phones:true,phoneColor:'#1b1b1f',backpack:'#83868d',holdR:o.noPhone?'':PHONE_SVG(),wind:.05},o));}
async function put(S,fn,P,LS,o){S.mesh.visible=true;S.mesh.scale.setScalar(LS);S.mesh.position.copy(P);await S.set(fn(o));}

// ---------- CIDADE: centro antigo de SP, fim de tarde ----------
const CITY=new THREE.Group();scene.add(CITY);const CT={};
{
  const facade=(base,cols,rows,lit,deco)=>{const mk=(em)=>tex(1024,2048,(g,w,h)=>{g.fillStyle=em?'#000':base;g.fillRect(0,0,w,h);if(!em){gnoise(g,w,h,14);for(let i=0;i<900;i++){g.fillStyle=`rgba(${R()>.5?'255,240,220':'60,40,30'},${R()*.06})`;g.fillRect(R()*w,R()*h,30+R()*60,4+R()*8);}}
      const cw=w/cols,rh=h/rows;for(let r=0;r<rows;r++){if(!em){g.fillStyle='rgba(60,40,30,.35)';g.fillRect(0,r*rh,w,10);g.fillStyle='rgba(255,240,220,.25)';g.fillRect(0,r*rh+10,w,4);}
        for(let c=0;c<cols;c++){if(r===rows-1&&deco&&c>=Math.floor(cols/2)-1&&c<=Math.floor(cols/2)+1)continue;const x=c*cw+cw*.22,y=r*rh+rh*.25,ww=cw*.56,hh=rh*.6,L=rnd(r*31+c*7+lit)<.28;
          if(em){if(L){g.fillStyle='#ffcf8a';g.fillRect(x,y,ww,hh);}continue;}
          g.fillStyle='#3a3238';g.fillRect(x-6,y-6,ww+12,hh+12);g.fillStyle=L?'#ffcf8a':'#4a4456';g.fillRect(x,y,ww,hh);g.fillStyle='rgba(255,255,255,.12)';g.fillRect(x,y,ww*.4,hh);g.fillStyle='#3a3238';g.fillRect(x+ww/2-3,y,6,hh);g.fillRect(x,y+hh*.4,ww,6);
          if(deco){g.fillStyle='rgba(255,235,210,.5)';g.fillRect(x-14,y+hh+6,ww+28,10);}}}
      if(deco&&!em){for(let c=0;c<=cols;c+=2){g.fillStyle='rgba(255,240,220,.18)';g.fillRect(c*cw-10,0,20,h);}}});return [mk(false),mk(true)];};
  const [fA,eA]=facade('#c4ab8e',5,12,1,true),[fB,eB]=facade('#9a8a7e',4,9,2,false),[fC,eC]=facade('#b69a8a',4,8,3,false);
  const side=std({color:'#a8907a'});
  const bld=(w,h,d,x,z,f,e)=>{const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),[side,side,side,side,new THREE.MeshStandardMaterial({map:f,emissive:'#ffffff',emissiveMap:e,emissiveIntensity:1.1,roughness:.9}),side]);m.position.set(x,h/2,z-d/2);m.castShadow=m.receiveShadow=true;CITY.add(m);return m;};
  bld(15,40,12,0,0,fA,eA);bld(13,30,12,-15,-2,fB,eB);bld(12,26,12,14.5,-1,fC,eC);bld(14,34,12,-30,-4,fB,eB);bld(14,30,12,29,-3,fC,eC);
  for(let k=1;k<13;k++)B3(15.6,.22,.5,std({color:'#8a7462'}),CITY,0,k*40/12,.2);
  // entrada: marquise, porta iluminada, letreiro
  B3(4.6,.3,1.8,std({color:'#5a463a'}),CITY,0,3.5,.9);
  const door=M3(new THREE.PlaneGeometry(2.6,3.1),new THREE.MeshBasicMaterial({color:'#ffd9a0',toneMapped:false}),CITY,0,1.55,.02);
  B3(.12,3.1,.12,std({color:'#3a2a24'}),CITY,0,1.55,.06);B3(2.9,.16,.2,std({color:'#3a2a24'}),CITY,0,3.15,.06);
  CT.doorL=new THREE.PointLight('#ffc070',18,9,1.4);CT.doorL.position.set(0,1.8,1.4);CITY.add(CT.doorL);
  const signT=tex(1024,160,(g,w,h)=>{g.fillStyle='#2a201c';g.fillRect(0,0,w,h);g.fillStyle='#e8c58a';g.font='90px Anton';g.textAlign='center';g.fillText('EDIFÍCIO AURORA · 1938',w/2,118);});
  M3(new THREE.PlaneGeometry(4.2,.66),new THREE.MeshStandardMaterial({map:signT,emissive:'#ffffff',emissiveMap:signT,emissiveIntensity:.25}),CITY,0,4.1,.04);
  // calçada de pedra portuguesa, meio-fio e rua
  const ppT=tex(512,512,(g,w,h)=>{g.fillStyle='#d9cfc2';g.fillRect(0,0,w,h);g.fillStyle='#2e2a2e';for(let y=0;y<h;y+=128){g.beginPath();g.moveTo(0,y+64);for(let x=0;x<=w;x+=8)g.lineTo(x,y+64+Math.sin(x/w*TAU*2)*36);for(let x=w;x>=0;x-=8)g.lineTo(x,y+88+Math.sin(x/w*TAU*2)*36);g.fill();}
    g.strokeStyle='rgba(0,0,0,.18)';for(let i=0;i<1600;i++){g.lineWidth=1;g.strokeRect(R()*w,R()*h,8+R()*6,8+R()*6);}gnoise(g,w,h,18);},[10,2]);
  const sw=M3(new THREE.PlaneGeometry(80,8),std({map:ppT,roughness:.8}),CITY,0,0,4);sw.rotation.x=-Math.PI/2;
  B3(80,.18,.3,std({color:'#9a948a'}),CITY,0,-.03,8.1);
  const asT=tex(512,512,(g,w,h)=>{g.fillStyle='#4a464c';g.fillRect(0,0,w,h);gnoise(g,w,h,30);g.fillStyle='#d8c890';for(let x=0;x<w;x+=128)g.fillRect(x+20,h/2-5,70,10);},[8,3]);
  const st=M3(new THREE.PlaneGeometry(80,30),std({map:asT,roughness:.85}),CITY,0,-.12,23);st.rotation.x=-Math.PI/2;
  // poste antigo
  const pole=new THREE.Group();pole.position.set(4.6,0,6.8);CITY.add(pole);M3(new THREE.CylinderGeometry(.07,.11,5.2,10),std({color:'#23252b',metalness:.5,roughness:.4}),pole,0,2.6,0);
  M3(new THREE.SphereGeometry(.22,14,10),new THREE.MeshBasicMaterial({color:'#ffe2a8',toneMapped:false}),pole,0,5.3,0);glowSpr(pole,'#ffcf8a',2.2,0,5.3,.1);
  // céu do entardecer e luzes
  const skyT=tex(8,1024,(g,w,h)=>{const gr=g.createLinearGradient(0,0,0,h);[[0,'#4e3f6e'],[.28,'#8a6a90'],[.44,'#e89a7a'],[.5,'#ffc98a'],[1,'#ffc98a']].forEach(([o,c])=>gr.addColorStop(o,c));g.fillStyle=gr;g.fillRect(0,0,w,h);});
  CT.sky=new THREE.Mesh(new THREE.SphereGeometry(400,32,16),new THREE.MeshBasicMaterial({map:skyT,side:THREE.BackSide,fog:false,toneMapped:false}));CITY.add(CT.sky);
  CT.sun=new THREE.DirectionalLight('#ffb070',3.2);CT.sun.position.set(40,14,30);CT.sun.castShadow=true;CT.sun.shadow.mapSize.set(2048,2048);Object.assign(CT.sun.shadow.camera,{left:-20,right:20,top:30,bottom:-10,near:1,far:150});CT.sun.shadow.bias=-.0005;CITY.add(CT.sun,CT.sun.target);
  CITY.add(new THREE.HemisphereLight('#ffc9a0','#4a3a5a',.95));
  CT.sunG=glowSpr(CITY,'#ffd9a0',160,180,40,140);
}

// ---------- POÇO DO ELEVADOR (corte lateral) ----------
const FH=3,NF=16,TOPY=NF*FH;
const SHAFT=new THREE.Group();scene.add(SHAFT);const SH={};
{
  const concT=tex(512,512,(g,w,h)=>{g.fillStyle='#7a6e66';g.fillRect(0,0,w,h);gnoise(g,w,h,34);for(let i=0;i<60;i++){g.fillStyle=`rgba(30,20,20,${R()*.18})`;g.beginPath();g.ellipse(R()*w,R()*h,20+R()*60,8+R()*30,R()*3,0,7);g.fill();}g.fillStyle='rgba(0,0,0,.25)';for(let y=0;y<h;y+=128)g.fillRect(0,y,w,4);},[1,14]);
  const conc=std({map:concT,roughness:.95});
  M3(new THREE.PlaneGeometry(2.8,TOPY+8),conc,SHAFT,0,TOPY/2,-1.3);
  SH.walls=[-1.4,1.4].map(x=>{const m=M3(new THREE.PlaneGeometry(2.6,TOPY+8),conc,SHAFT,x,TOPY/2,0);m.rotation.y=x<0?Math.PI/2:-Math.PI/2;return m;});
  const slab=std({color:'#8d8379',roughness:.9}),cutM=std({color:'#6a5e56'});
  const numT=n=>tex(256,128,(g,w,h)=>{g.fillStyle='#2a2224';g.fillRect(0,0,w,h);g.fillStyle='#f2e6d4';g.font='96px Anton';g.textAlign='center';g.fillText(n+'º',w/2,104);});
  SH.labels=[];
  for(let k=0;k<=NF;k++){const y=k*FH-1.5;
    for(const[xa,xb]of[[-9,-1.4],[1.4,9]])B3(xb-xa,.3,2.6,slab,SHAFT,(xa+xb)/2,y,0);
    if(k<NF){const dm=std({color:'#9a9a9e',metalness:.4,roughness:.4});B3(1.1,2.1,.05,dm,SHAFT,0,y+1.2,-1.27);B3(1.3,.12,.08,std({color:'#5a5a60'}),SHAFT,0,y+2.3,-1.26);
      const lb=M3(new THREE.PlaneGeometry(1.0,.5),new THREE.MeshStandardMaterial({map:numT(k+1),emissive:'#ffffff',emissiveMap:numT(k+1),emissiveIntensity:.5}),SHAFT,-3.0,y+1.6,1.31);SH.labels.push(lb);
      // apartamentos cortados: parede do fundo com janela iluminada
      for(const xs of[-5.5,5.5]){B3(7,2.7,.1,std({color:['#b9a48f','#a89a8a','#c2ab92'][k%3]}),SHAFT,xs,y+1.5,-1.25);
        if(rnd(k*3+xs)>.4)M3(new THREE.PlaneGeometry(1.2,1.0),new THREE.MeshBasicMaterial({color:'#ffcf8a',toneMapped:false}),SHAFT,xs+(xs<0?-1.5:1.5),y+1.7,-1.19);}}}
  for(const x of[-1.25,1.25]){B3(.08,TOPY+6,.14,std({color:'#5a5c62',metalness:.6,roughness:.35}),SHAFT,x,TOPY/2,0);for(let y=0;y<TOPY;y+=1.5)B3(.16,.12,.2,std({color:'#3a3c42'}),SHAFT,x,y,0);}
  // casa de máquinas e polia
  B3(3.4,3,2.8,std({color:'#6e625a'}),SHAFT,0,TOPY+3,0);SH.sheave=M3(new THREE.TorusGeometry(.55,.1,10,28),std({color:'#2a2a30',metalness:.6,roughness:.4}),SHAFT,0,TOPY+1,.2);
  // fosso com para-choques
  B3(2.8,.3,2.6,std({color:'#3a3436'}),SHAFT,0,-1.9,0);for(const x of[-.6,.6])M3(new THREE.CylinderGeometry(.18,.22,.9,14),std({color:'#9a2a20'}),SHAFT,x,-1.3,0);
  // cabina (exterior) + garras + cabos + contrapeso
  SH.cab=new THREE.Group();SHAFT.add(SH.cab);
  const cabM=std({color:'#b4a690',roughness:.7}),frM=std({color:'#4a4a52',metalness:.5,roughness:.5});
  B3(2.3,2.5,2.0,cabM,SH.cab,0,1.25,0);B3(2.45,.14,2.1,frM,SH.cab,0,2.57,0);B3(2.45,.14,2.1,frM,SH.cab,0,-.07,0);
  for(const x of[-1.17,1.17])B3(.1,2.9,.18,frM,SH.cab,x,1.25,0);B3(2.4,.16,.2,frM,SH.cab,0,2.9,0);
  SH.jaws=[];for(const x of[-1.25,1.25]){B3(.34,.12,.42,std({color:'#2e3036',metalness:.4}),SH.cab,x,.34,0);B3(.12,.4,.42,std({color:'#2e3036',metalness:.4}),SH.cab,x+(x<0?.14:-.14),.12,0);for(const z of[-1,1]){const j=B3(.16,.32,.07,std({color:'#c9a24a',metalness:.6,roughness:.35}),SH.cab,x,.12,z*.16);j.userData.z=z;SH.jaws.push(j);}}
  SH.cabL=new THREE.PointLight('#ffe2b0',4,6,1.6);SH.cabL.position.set(0,3.4,.6);SH.cab.add(SH.cabL);
  M3(new THREE.SphereGeometry(.07,8,6),new THREE.MeshBasicMaterial({color:'#ffe8c0',toneMapped:false}),SH.cab,0,3.25,.6);
  SH.cables=[-.2,0,.2].map(x=>{const m=M3(new THREE.CylinderGeometry(.025,.025,1,6),std({color:'#2b2b30',metalness:.7,roughness:.35}),SHAFT,x,0,0);return m;});
  SH.cw=B3(.3,2.4,.5,std({color:'#3e3e46'}),SHAFT,1.0,0,-.85);
  SH.hemi=new THREE.HemisphereLight('#8a7a90','#2a2024',.55);SHAFT.add(SH.hemi);
  SH.key=new THREE.DirectionalLight('#ffcf9a',1.2);SH.key.position.set(8,30,14);SHAFT.add(SH.key,SH.key.target);
  SH.spark=new THREE.PointLight('#ff9a3a',0,6,1.4);SHAFT.add(SH.spark);SH.pit=new THREE.PointLight('#ffb070',6,10,1.4);SH.pit.position.set(0,-.4,.6);SHAFT.add(SH.pit);
  // criatura (sombra) — só um sprite no topo da cabina
}
function setCab(y,cabOnly){SH.cab.position.y=y;SH.cables.forEach(c=>{const top=TOPY+1,b=y+2.9,L=Math.max(.1,top-b);c.scale.y=L;c.position.y=b+L/2;c.visible=!cabOnly;});SH.cw.position.y=Math.max(-1,TOPY-2-(y-0)*.9);}

// ---------- CABINA (interior) ----------
const CAB=new THREE.Group();scene.add(CAB);const CB={};
{
  const steelT=tex(512,512,(g,w,h)=>{g.fillStyle='#a8a6a2';g.fillRect(0,0,w,h);for(let i=0;i<700;i++){g.fillStyle=`rgba(${R()>.5?255:0},${R()>.5?255:0},${R()>.5?255:0},.05)`;g.fillRect(0,R()*h,w,1+R()*2);}g.fillStyle='rgba(0,0,0,.25)';for(let x=0;x<w;x+=170)g.fillRect(x,0,4,h);gnoise(g,w,h,10);});
  const wall=std({map:steelT,roughness:.45,metalness:.35}),floorT=tex(512,512,(g,w,h)=>{g.fillStyle='#4a3a32';g.fillRect(0,0,w,h);g.strokeStyle='rgba(0,0,0,.35)';g.lineWidth=3;for(let x=0;x<w;x+=64)for(let y=0;y<h;y+=64){g.strokeRect(x+4,y+4,56,56);}gnoise(g,w,h,24);},[2,2]);
  const fl=M3(new THREE.PlaneGeometry(2.2,1.8),std({map:floorT,roughness:.6}),CAB,0,0,-.9);fl.rotation.x=-Math.PI/2;
  const ce=M3(new THREE.PlaneGeometry(2.2,1.8),std({color:'#8a8682'}),CAB,0,2.4,-.9);ce.rotation.x=Math.PI/2;
  M3(new THREE.PlaneGeometry(2.2,2.4),wall,CAB,0,1.2,-1.8);
  for(const x of[-1.1,1.1]){const m=M3(new THREE.PlaneGeometry(1.8,2.4),wall,CAB,x,1.2,-.9);m.rotation.y=x<0?Math.PI/2:-Math.PI/2;}
  B3(2.1,.05,.06,std({color:'#c9b48a',metalness:.7,roughness:.3}),CAB,0,.95,-1.74);for(const x of[-1.04,1.04]){const r=B3(1.6,.05,.06,std({color:'#c9b48a',metalness:.7,roughness:.3}),CAB,x,.95,-.9);r.rotation.y=Math.PI/2;}
  CB.panel=M3(new THREE.PlaneGeometry(1.6,.95),new THREE.MeshBasicMaterial({color:'#fff2d6'}),CAB,0,2.39,-.9);CB.panel.rotation.x=Math.PI/2;
  CB.light=new THREE.PointLight('#ffe8c8',9,6,1.5);CB.light.position.set(0,2.1,-.7);CAB.add(CB.light);
  CB.hemi=new THREE.HemisphereLight('#ffe2c0','#3a2a24',.6);CAB.add(CB.hemi);
  CB.red=new THREE.PointLight('#ff2a1a',0,5,1.5);CB.red.position.set(.8,2.2,-.4);CAB.add(CB.red);
  // painel de botões (canvas: 1..15) na parede da direita
  CB.btnT=(lit)=>tex(256,640,(g,w,h)=>{g.fillStyle='#c9c8c6';g.fillRect(0,0,w,h);g.strokeStyle='#7a7a80';g.lineWidth=8;g.strokeRect(4,4,w-8,h-8);
    for(let n=1;n<=15;n++){const c=(n-1)%3,r=4-Math.floor((n-1)/3),x=52+c*76,y=140+r*100;g.fillStyle='#8e8e94';g.beginPath();g.arc(x,y,32,0,7);g.fill();g.fillStyle=lit&&n===15?'#ffb24a':'#ece9e2';g.beginPath();g.arc(x,y,25,0,7);g.fill();g.fillStyle=lit&&n===15?'#5a2a00':'#3a3a40';g.font='bold 26px sans-serif';g.textAlign='center';g.fillText(n,x,y+9);}
    g.fillStyle='#3a3a40';g.font='bold 22px sans-serif';g.textAlign='center';g.fillText('8 PESSOAS · 600 KG',w/2,60);});
  CB.btn0=CB.btnT(false);CB.btn1=CB.btnT(true);
  CB.pan=M3(new THREE.PlaneGeometry(.4,1.0),new THREE.MeshStandardMaterial({map:CB.btn0,roughness:.5,emissive:'#ffffff',emissiveMap:CB.btn0,emissiveIntensity:.08}),CAB,1.09,1.25,-.25);CB.pan.rotation.y=-Math.PI/2;
  // portas e hall
  const dm=std({map:steelT,roughness:.35,metalness:.5});CB.doors=[-1,1].map(s=>B3(1.1,2.3,.05,dm,CAB,s*.55,1.15,.05));
  const hall=std({color:'#8a6e58',roughness:.85});B3(2.2,4,.1,hall,CAB,-2.2,1.6,.12);B3(2.2,4,.1,hall,CAB,2.2,1.6,.12);B3(2.2,1.6,.1,hall,CAB,0,3.15,.12);
  B3(2.4,.12,.16,std({color:'#c9a24a',metalness:.7,roughness:.3}),CAB,0,2.36,.14);
  CB.dispC=document.createElement('canvas');CB.dispC.width=256;CB.dispC.height=128;CB.dispT=new THREE.CanvasTexture(CB.dispC);CB.dispT.colorSpace=THREE.SRGBColorSpace;
  M3(new THREE.PlaneGeometry(.5,.25),new THREE.MeshBasicMaterial({map:CB.dispT,toneMapped:false}),CAB,0,2.62,.18);
  CB.phone=M3(new THREE.PlaneGeometry(.09,.17),new THREE.MeshStandardMaterial({map:tex(64,128,(g,w,h)=>{g.fillStyle='#17171b';g.fillRect(0,0,w,h);g.fillStyle='#5a7a9a';g.fillRect(6,8,w-12,h-16);g.strokeStyle='#fff';g.lineWidth=2;for(const[a,b,c,d]of[[30,50,8,20],[30,50,56,24],[30,50,58,100],[30,50,10,96],[30,50,40,120]]){g.beginPath();g.moveTo(a,b);g.lineTo(c,d);g.stroke();}}),roughness:.3}),CAB,.45,.006,-.55);CB.phone.rotation.x=-Math.PI/2;CB.phone.rotation.z=.6;
}
let DISP=-1;function setDisp(n,dim=1){const k=n+'|'+dim;if(k===DISP)return;DISP=k;const g=CB.dispC.getContext('2d');g.fillStyle='#1a0606';g.fillRect(0,0,256,128);g.fillStyle=`rgba(255,74,42,${dim})`;g.font='96px Anton';g.textAlign='center';g.fillText(String(n).padStart(2,'0'),150,104);g.beginPath();g.moveTo(40,90);g.lineTo(20,50);g.lineTo(60,50);g.fill();CB.dispT.needsUpdate=true;}

// ---------- seletor de cenário ----------
function setWorld(w){mood('night');TOWN.visible=false;ROOM.visible=false;CITY.visible=w==='city';SHAFT.visible=w==='shaft';CAB.visible=w==='cab';
  scene.background=new THREE.Color(w==='city'?'#e9b08a':'#0e0a0c');scene.fog=w==='city'?new THREE.Fog('#e9b08a',22,170):new THREE.FogExp2(w==='shaft'?'#1a1216':'#140e10',w==='shaft'?.035:.06);
  renderer.toneMappingExposure=w==='city'?1.0:1.1;
  SPR.forEach(s=>{s.mesh.material.color.set(w==='city'?'#ffe8d6':'#ffffff');s.mesh.material.emissiveIntensity=w==='city'?.42:.35;});}

// ---------- SVG: HUD, legendas, efeitos ----------
function gaugeSVG(x,y,r,v,vmax=80){const a0=135,a1=405,A=k=>(a0+(a1-a0)*k)*Math.PI/180;let h=`<circle cx="${x}" cy="${y}" r="${r+16}" fill="#1a1618" opacity=".92"/><circle cx="${x}" cy="${y}" r="${r}" fill="#f2ead8"/>`;
  for(let k=0;k<=vmax;k+=10){const a=A(k/vmax);h+=`<line x1="${f(x+Math.cos(a)*r*.8)}" y1="${f(y+Math.sin(a)*r*.8)}" x2="${f(x+Math.cos(a)*r*.95)}" y2="${f(y+Math.sin(a)*r*.95)}" stroke="#1a1618" stroke-width="6"/><text x="${f(x+Math.cos(a)*r*.64)}" y="${f(y+Math.sin(a)*r*.64+r*.05)}" class="mt" font-size="${f(r*.13)}" fill="#1a1618" text-anchor="middle">${k}</text>`;}
  const ar=(k0,k1)=>{const p=A(k0),q=A(k1);return `M${f(x+Math.cos(p)*r*.88)} ${f(y+Math.sin(p)*r*.88)} A${f(r*.88)} ${f(r*.88)} 0 0 1 ${f(x+Math.cos(q)*r*.88)} ${f(y+Math.sin(q)*r*.88)}`;};
  const a=A(cl(v/vmax))+Math.sin(v*7)*.01;
  return h+`<path d="${ar(60/vmax,1)}" stroke="#e0402a" stroke-width="14" fill="none" opacity=".8"/><line x1="${x}" y1="${y}" x2="${f(x+Math.cos(a)*r*.82)}" y2="${f(y+Math.sin(a)*r*.82)}" stroke="#e0402a" stroke-width="12" stroke-linecap="round"/><circle cx="${x}" cy="${y}" r="22" fill="#1a1618"/><text x="${x}" y="${f(y+r*.5)}" class="mt" font-size="${f(r*.3)}" fill="#1a1618" text-anchor="middle">${Math.round(v)}</text><text x="${x}" y="${f(y+r*.72)}" class="mt" font-size="${f(r*.12)}" fill="#5a5050" text-anchor="middle">KM/H</text>`;}
function floorSVG(x,y,n,w=340,h=250,bl=1){return `<rect x="${x-w/2-16}" y="${y-h/2-16}" width="${w+32}" height="${h+32}" rx="26" fill="#1a1618" opacity=".95"/><rect x="${x-w/2}" y="${y-h/2}" width="${w}" height="${h}" rx="16" fill="#2a0c0a"/><circle cx="${x}" cy="${y}" r="${w*.55}" fill="#ff3a20" opacity="${f(.12*bl)}" filter="url(#glow)"/><text x="${x+30}" y="${f(y+h*.27)}" class="mt" font-size="${f(h*.72)}" fill="#ff4a2a" opacity="${f(bl)}" text-anchor="middle">${String(n).padStart(2,'0')}</text><path d="M${f(x-w*.36)} ${f(y+40)} l-30 -50 h60Z" fill="#ff4a2a" opacity="${f(bl)}"/><text x="${x}" y="${f(y-h/2-40)}" class="mt" font-size="40" fill="#e8d8c8" text-anchor="middle">ANDAR</text>`;}
function sparksSVG(x,y,t,n=26,spread=1,seed=0,dirx=1,g=1){let h=`<circle cx="${f(x)}" cy="${f(y)}" r="180" fill="url(#sglow)"/>`;
  for(let i=0;i<n;i++){const ph=(t*2.2+rnd(i+seed))%1,a=(-90+(rnd(i*3+seed)-.5)*160*spread)*Math.PI/180,v=300+rnd(i+9+seed)*700,px=x+Math.cos(a)*v*ph*dirx,py=y+Math.sin(a)*v*ph+900*ph*ph*g,ln=18+30*(1-ph);
    h+=`<line x1="${f(px)}" y1="${f(py)}" x2="${f(px-Math.cos(a)*ln*dirx)}" y2="${f(py-Math.sin(a)*ln-30*ph)}" stroke="${['#ffd070','#ff9a3a','#fff0c0'][i%3]}" stroke-width="${f(6*(1-ph)+1.5)}" stroke-linecap="round" opacity="${f(1-ph)}"/>`;}return h;}
function capSVG(words,p,y,size,hl){if(p<=0||!words.length)return'';const k=p<1?1+.35*Math.exp(-p*9)*Math.cos(p*14):1,len=words.join(' ').length,sz=Math.min(size,960/(len*.74));
  const sp=words.map(w=>`<tspan fill="${hl.has(w.replace(/[.,!?…]/g,''))||hl.has(w)?'#ffd23f':'#ffffff'}">${w}</tspan>`).join(' ');
  return `<g transform="translate(540 ${f(y)}) scale(${f(k*cl(p*4))})"><text class="mt" y="${f(sz*.36+8)}" font-size="${f(sz)}" fill="#000" opacity=".35" stroke="#000" stroke-width="${f(sz*.22)}" text-anchor="middle">${words.join(' ')}</text><text class="mt" y="${f(sz*.36)}" font-size="${f(sz)}" stroke="#000" stroke-width="${f(sz*.2)}" text-anchor="middle">${sp}</text></g>`;}
const dark=a=>a>0?`<rect width="1080" height="1920" fill="#000" opacity="${f(a)}"/>`:'';
// queda: altura do piso da cabina no tempo absoluto (15º andar -> entre 4º e 3º)
function cabY(t){if(t<12)return lerp(11*FH,14*FH,ease(seg(t,9,12)));if(t<15)return 14*FH;const ff=t-15;if(t<31.3)return Math.max(8.6,14*FH-.173*ff*ff);return lerp(8.6,7.5,eo(seg(t,31.3,33.3)));}
function speed(t){if(t<15)return 0;if(t<28.6)return Math.min(60,(t-15)*7.2);return 60*(1-eo(seg(t,28.6,33.3)));}

// ================= cenas (tempos do roteiro do usuário) =================
const EV=[];const ev=(s,u,n,g=1)=>{EV.push([s,u,n,g]);return u;};
const LS=.8,FY=FEET*LS;
const SC=[
// 1 rua: entra no prédio
{s:0,e:3,w:'city',caps:[[.2,'E SE TU'],[1.4,'TIVESSE...']],hl:['TIVESSE'],ev:[[.0,'city',1],[2.6,'door',.6]],
async up(u,d,t){const k=seg(u,0,d),x=lerp(-7.5,-1.2,k),z=lerp(2.3,1.9,k),turnK=seg(u,2.3,3.0);
  const o={t,walk:t*1.6,expr:'neutral',lookY:.6,look:.2,handR:'grip',reachR:[90,240]};
  if(turnK>0)Object.assign(o,turn(lerp(0,-90,turnK)));
  await put(HERO,kid,V(x,FY,z),LS,o);
  camShot(u,d,V(1.6,.42,3.4),V(1.3,.45,3.3),V(x-1.5,2.6,.8),V(x-.6,2.2,.8),{t,e:x=>x});FOCUS=V(x,1,z);AP=.003;FOVMUL=1.1-.08*u/d;
  return '';}},
// 2 close no dedo apertando o 15
{s:3,e:6,w:'cab',caps:[[.1,'...NO DÉCIMO'],[1.4,'QUINTO ANDAR']],hl:['DÉCIMO','QUINTO'],ev:[[1.0,'click',1],[1.05,'beep',.6]],
async up(u,d,t){CB.light.intensity=2.5;CB.hemi.intensity=.35;CB.panel.material.color.set('#9a8a70');BL=[.35,.5,.92];const lit=u>1.0;CB.pan.material.map=lit?CB.btn1:CB.btn0;CB.pan.material.emissiveMap=lit?CB.btn1:CB.btn0;CB.pan.material.emissiveIntensity=lit?.22:.04;
  const bp=V(1.08,1.531,-.131),k=ease(seg(u,.2,1.0))-.22*ease(seg(u,1.6,2.4)),press=seg(u,.9,1.1)-seg(u,1.5,1.8);
  camShot(u,d,V(.45,bp.y+.04,bp.z+.62),V(.55,bp.y+.03,bp.z+.5),V(1.08,bp.y,bp.z),V(1.08,bp.y,bp.z),{t});FOCUS=bp;AP=.018;
  const q=proj(bp);let h='';if(lit)h+=`<circle cx="${f(q.x)}" cy="${f(q.y)}" r="${f(150+Math.sin(t*6)*8)}" fill="#ffb040" opacity=".3" filter="url(#glow)"/>`;
  // braço do garoto (manga mostarda + mão morena clara) apontando o dedo
  const fx=lerp(-150,q.x-14,k),fy=lerp(2100,q.y+26,k)+press*10,ang=Math.atan2(fy-2300,fx+300)*180/Math.PI+90;
  h+=`<defs><linearGradient id="skg" x1="0" x2="1"><stop offset="0" stop-color="#d6a476"/><stop offset="1" stop-color="#b07e55"/></linearGradient></defs><g transform="translate(${f(fx)} ${f(fy)}) rotate(${f(ang)})">
   <rect x="-150" y="330" width="300" height="900" rx="120" fill="#d2a032"/><rect x="40" y="330" width="110" height="900" rx="55" fill="#b8891f" opacity=".6"/>
   <rect x="-120" y="140" width="240" height="260" rx="110" fill="url(#skg)"/>
   <rect x="-95" y="120" width="70" height="120" rx="35" fill="#c99568"/><rect x="-30" y="110" width="70" height="120" rx="35" fill="#c99568"/><rect x="35" y="125" width="66" height="110" rx="33" fill="#bf8b5f"/>
   <rect x="-150" y="200" width="70" height="150" rx="35" fill="#c99568" transform="rotate(-25 -115 270)"/>
   <rect x="-30" y="-10" width="64" height="200" rx="32" fill="url(#skg)"/><ellipse cx="2" cy="14" rx="20" ry="24" fill="#f0cfb0"/></g>`;
  return h;}},
// 3 porta fecha, garoto no celular com fone
{s:6,e:9,w:'cab',caps:[[.2,'VOLTANDO'],[1.4,'PRA CASA.']],hl:['CASA'],ev:[[.1,'ding',1],[.4,'doorslide',.9],[2.2,'thud',.3]],
async up(u,d,t){CB.panel.material.color.set('#c8b898');CB.pan.material.map=CB.btn1;setDisp(1);const k=ease(seg(u,.4,2.2));CB.doors.forEach((m,i)=>m.position.x=(i?1:-1)*lerp(1.65,.55,k));
  await put(HERO,kid,V(.05,FY,-.95),LS,{t,expr:'neutral',reachR:[60,230],lookY:.9,look:-.2,blink:blink(t,2)});
  camShot(u,d,V(.0,1.15,3.6),V(.0,1.2,3.1),V(0,1.05,-.9),V(0,1.1,-.9),{t});FOCUS=V(0,1,-.95);AP=.006;
  const q=proj(svgWorld(HERO,60,250));return `<circle cx="${f(q.x)}" cy="${f(q.y-80)}" r="120" fill="#a8d8ff" opacity=".22" filter="url(#glow)"/>`;}},
// 4 corte lateral do poço, cabina subindo
{s:9,e:12,w:'shaft',caps:[[.4,'E, DO NADA...']],hl:['NADA'],ev:[[.0,'hum',.8],[1.8,'creak',.7]],
async up(u,d,t){const y=cabY(t);setCab(y);SH.sheave.rotation.z=-t*2;
  camShot(u,d,V(6.5,y-2.2,15),V(6,y-1.4,13.5),V(0,y+3.5,0),V(0,y+4.5,0),{t});FOCUS=V(0,y+1,0);AP=.002;return '';}},
// 5 close no cabo: fios rompendo
{s:12,e:15,w:'shaft',caps:[[.2,'O CABO'],[2.45,'ARREBENTA.']],hl:['ARREBENTA'],ev:[[.45,'ping',.8],[.85,'ping',.8],[1.2,'ping',.9],[1.55,'ping',.9],[1.9,'ping',1],[2.2,'ping',1],[2.45,'snap',1.3],[.1,'creak',.6]],
async up(u,d,t){const y=cabY(t);setCab(y);let h='';
  const C=V(0,y+6,0);const sh=shake(u,0,.004+.01*seg(u,0,2.4),2),sh2=shake(u,2.45,.06,5);
  camAt2(V(.35+sh[0]+sh2[0]+Math.sin(t*1.7)*.06,C.y+sh[1]+sh2[1]+u*.06,lerp(.75,.45,u/d)),V(0,C.y,0),t);FOCUS=C;AP=.02;
  SH.cables.forEach((c,i)=>{if(u>2.45){const k=u-2.45;c.visible=true;c.scale.y=Math.max(.1,(TOPY+1-C.y));c.position.y=C.y+c.scale.y/2+k*k*30;}});
  // cabo desenhado em SVG por cima (fios rompendo um a um)
  const q=proj(C),W2=150;const nb=[.45,.85,1.2,1.55,1.9,2.2].filter(b=>u>b).length;
  if(u<2.45){const vib=Math.sin(t*47)*4*seg(u,0,2.4);h+=`<g transform="translate(${f(vib)} 0)"><rect x="${f(q.x-W2/2)}" y="-50" width="${W2}" height="2020" fill="#3a3a40"/>`;
    for(let k2=0;k2<62;k2++)for(let j=0;j<6;j++){const yy=k2*32-20+((t*60)%32);if(j<nb&&Math.abs(yy-q.y)<70)continue;h+=`<line x1="${f(q.x-W2/2+j*W2/6)}" y1="${yy}" x2="${f(q.x-W2/2+(j+1)*W2/6)}" y2="${yy+32}" stroke="${['#c8c8ce','#a0a0a8','#d8d8de'][j%3]}" stroke-width="${f(W2/6*.8)}"/>`;}
    h+='</g>';for(let j=0;j<nb;j++)for(const s2 of[-1,1]){const xa=q.x-W2/2+j*W2/6+12;h+=`<path d="M${f(xa)} ${f(q.y+s2*70)} q${f(20*s2)} ${f(-s2*30)} ${f(30+j*6)} ${f(-s2*(50+j*4))}" stroke="#d0d0d6" stroke-width="10" fill="none" stroke-linecap="round"/>`;}
    [.45,.85,1.2,1.55,1.9,2.2].forEach((b,i)=>{if(u-b>0&&u-b<.35)h+=sparksSVG(q.x-W2/2+i*W2/6+12,q.y,u-b,14,.8,i*9);});SH.spark.position.set(.1,C.y,.3);SH.spark.intensity=nb&&u<2.45?3:0;}
  else{const k=u-2.45;h+=`<g transform="translate(0 ${f(-k*2600)})"><rect x="${f(q.x-W2/2)}" y="-400" width="${W2}" height="${f(q.y+340)}" fill="#3a3a40"/></g><g transform="translate(0 ${f(k*1600)})"><rect x="${f(q.x-W2/2)}" y="${f(q.y+60)}" width="${W2}" height="1400" fill="#3a3a40"/></g>`+sparksSVG(q.x,q.y,k,40,1.3,5)+`<rect width="1080" height="1920" fill="#fff4d0" opacity="${f(.6*Math.exp(-k*7))}"/>`;SH.spark.intensity=8*Math.exp(-k*4);}
  return h;}},
// 6 cabina despenca: garoto flutua
{s:15,e:18,w:'cab',caps:[[.2,'QUEDA LIVRE.']],hl:['QUEDA','LIVRE'],ev:[[.0,'wind',1],[.1,'scream',.0]],
async up(u,d,t){setDisp(15);CB.doors.forEach((m,i)=>m.position.x=(i?1:-1)*.55);const fl=(Math.floor(t*14)%5)?1:.3;CB.light.intensity=9*fl;CB.panel.material.color.set(fl>.5?'#fff2d6':'#5a5040');
  const sh=shake(t,0,.02,0);
  CB.panel.material.color.set(fl>.5?'#c8b898':'#5a5040');await put(BIG,kid,V(0,.45,-1.3),.42,{t,expr:'shock',rot:Math.sin(t*2)*14+u*10,aL:150+Math.sin(t*5)*20,aR:150-Math.sin(t*5)*20,eL:-20,eR:-20,handL:'open',handR:'open',legL:-30+Math.sin(t*4)*15,legR:30-Math.sin(t*4)*15,pupil:.7,noPhone:true,mouth:.7,wind:1.2,windDir:-1});
  BIG.mesh.position.y=1.35+Math.sin(t*3)*.08;
  camShot(u,d,V(.2+sh[0],.6+sh[1],-.08),V(.18+sh[0],.62+sh[1],-.12),V(0,1.45,-1.6),V(0,1.5,-1.6),{t});FOVMUL=1.5;FOCUS=V(0,1.3,-1.3);AP=.006;
  const p=proj(.45+Math.sin(t*2.5)*.1,1.75+Math.sin(t*3)*.1,-1.0);let h=`<g transform="translate(${f(p.x)} ${f(p.y)}) rotate(${f(t*260)}) scale(1.6)">${PHONE_SVG(0).replace('translate(0 128)','')}</g>`;
  for(let k=0;k<26;k++){const x=rnd(k)*1080,y=((rnd(k+3)*1920-t*3000)%2320+2320)%2320-200;h+=`<line x1="${f(x)}" y1="${f(y)}" x2="${f(x)}" y2="${f(y+240)}" stroke="#fff" stroke-width="${f(3+rnd(k)*4)}" opacity=".12"/>`;}
  return h;}},
// 7 HUD: andares descendo + velocímetro
{s:18,e:22,w:'shaft',caps:[[.1,'#KMH']],hl:[],ev:[[.0,'alarm',.5],[1.0,'whoosh',.5],[2.0,'whoosh',.5],[3.0,'whoosh',.5]],
async up(u,d,t){const y=cabY(t);setCab(y,true);const cut=u>2.0;const sh=shake(t,0,.03,0);
  if(!cut)camShot(u,2,V(4.2+sh[0],y+1.0+sh[1],6.5),V(4.0+sh[0],y+1.1+sh[1],6.2),V(0,y+1.6,0),V(0,y+1.5,0),{t});
  else camShot(u-2,2,V(-1.8+sh[0],y-1.2+sh[1],3.2),V(-1.7+sh[0],y-1.1+sh[1],3.0),V(0,y+2.2,0),V(0,y+2.3,0),{t});
  FOCUS=V(0,y+1,0);AP=.002;
  const fl=Math.min(15,Math.floor(y/FH)+1),bl=Math.floor(t*6)%2?1:.75,v=speed(t);
  return !cut?floorSVG(300,620,fl,330,240,bl)+gaugeSVG(760,1210,230,v):gaugeSVG(540,1150,330,v)+floorSVG(800,560,fl,240,180,bl);}},
// 8 fundo do poço se aproximando
{s:22,e:25,w:'shaft',caps:[[.1,'#MET'],[1.8,'DE QUEDA.']],hl:['QUEDA','METROS'],ev:[[.0,'rumble',1],[1.5,'creak',.6]],
async up(u,d,t){const y=cabY(t);setCab(y,true);SH.cab.visible=false;const sh=shake(t,0,.03+u*.02,0);
  camAt2(V(.05+sh[0],y-.3,.05+sh[1]),V(0,y-20,-.45),t);FOCUS=V(0,-1.5,0);AP=.002;SH.spark.position.set(0,y-1,0);SH.spark.intensity=3;SH.spark.color.set('#ffe2b0');
  return '';}},
// 9 só os olhos no escuro
{s:25,e:28,w:'cab',caps:[[1.0,'MAS...']],hl:['MAS'],ev:[[.0,'heart',1],[1.0,'heart',1],[2.0,'heart',1.1]],
async up(u,d,t){CB.light.intensity=0;CB.panel.material.color.set('#1a1414');CB.hemi.intensity=.12;
  const P=V(0,1.35,-.9);await put(HERO,kid,V(0,FY,-.9),LS,{t,expr:'shock',pupil:.7,look:Math.sin(t*9)*.2,noPhone:true,brow:1});
  camShot(u,d,V(0,1.32,-.2),V(0,1.32,-.32),V(0,1.28,-.9),V(0,1.28,-.9),{t});FOCUS=P;AP=.02;
  const q=proj(svgWorld(HERO,0,10)),sc=(proj(svgWorld(HERO,100,10)).x-q.x)/100;let h=`<rect width="1080" height="1920" fill="#000" opacity=".86"/>`;
  for(const s2 of[-1,1]){const ex=q.x+s2*44*sc,ey=q.y;h+=`<ellipse cx="${f(ex)}" cy="${f(ey)}" rx="${f(26*sc)}" ry="${f(30*sc)}" fill="#f2eee6"/><circle cx="${f(ex+Math.sin(t*9)*6*sc)}" cy="${f(ey)}" r="${f(10*sc)}" fill="#0a0808"/><circle cx="${f(ex+Math.sin(t*9)*6*sc+5*sc)}" cy="${f(ey-6*sc)}" r="${f(3.5*sc)}" fill="#fff"/>`;}
  return h;}},
// 10 freio de segurança: garras travam, faíscas
{s:28,e:33,w:'shaft',caps:[[.4,'FREIO DE'],[1.6,'SEGURANÇA.']],hl:['FREIO','SEGURANÇA'],ev:[[.6,'clamp',1.2],[.65,'scrape',1.3],[2.4,'scrape',.9]],
async up(u,d,t){const y=cabY(t);setCab(y,true);const k=ease(seg(u,.5,.75)),v=Math.max(speed(t)/60,u>.6?.25:0);
  SH.jaws.forEach(j=>j.position.z=j.userData.z*lerp(.16,.085,k));
  const cut=u>2.4,J=V(-1.25,y+.12,0),sh=shake(t,0,.004+.02*v,0);
  SH.walls[0].visible=false;if(!cut)camShot(u,2.4,V(-2.5+sh[0],y+.55+sh[1],1.0),V(-2.3+sh[0],y+.45+sh[1],.85),J,J,{t});
  else camShot(u-2.4,2.6,V(-2.1+sh[0],y+.35+sh[1],.6),V(-1.6+sh[0],y+.1+sh[1],.2),J,J,{t});
  FOCUS=J;AP=.012;SH.spark.position.set(-1.6,y,.35);SH.spark.distance=8;SH.spark.intensity=u>.6?(9*v+2)*(.7+.3*Math.sin(t*50)):0;SH.hemi.intensity=.8;BL=[.45,.5,.9];SH.spark.color.set('#ff8a2a');
  let h='';if(u>.6&&v>.03){const q=proj(J.x,J.y-.18,J.z);h+=sparksSVG(q.x,q.y,t,Math.round(60*v)+10,1.5,3,-1,1.2)+sparksSVG(q.x,q.y,t+.5,Math.round(50*v)+8,1.3,9,1,1.2)+sparksSVG(q.x,q.y,t+.25,Math.round(40*v)+6,1.1,17,-1,.9);}
  return h;}},
// 11 parou entre o 4º e o 3º
{s:33,e:37,w:'shaft',caps:[[.35,'PAROU.']],hl:['PAROU'],ev:[[.3,'impact',1.3],[.5,'groan',.8]],
async up(u,d,t){const y=cabY(t)+(u>.3?Math.sin(u*40)*.06*Math.exp(-(u-.3)*5):0);setCab(y,true);const sh=shake(u,.3,.15,5);let h='';
  if(u<2.0){camShot(u,2,V(7.5+sh[0],6+sh[1],14),V(4.6+sh[0],7.6+sh[1],9.5),V(0,8.6,0),V(0,8.6,0),{t});FOCUS=V(0,8,0);AP=.002;h+=gaugeSVG(830,330,180,speed(t));}
  else{setWorld('cab');setDisp(4,Math.floor(t*3)%2?1:.3);CB.doors.forEach((m,i)=>m.position.x=(i?1:-1)*.55);CB.light.intensity=6;
    await put(HERO,kid,V(0,FY,-1.25),LS,{t,stance:'crouch',expr:'fear',aL:60,aR:60,eL:-60,eR:-60,handL:'open',handR:'open',noPhone:true,rot:tremble(t,2)});
    const s2=shake(u,2.0,.02,4);camShot(u-2,2,V(s2[0],1.0+s2[1],-.06),V(s2[0],.95+s2[1],-.1),V(0,.8,-1.3),V(0,.8,-1.3),{t});FOVMUL=1.35;FOCUS=V(0,.8,-1.25);AP=.006;h+=gaugeSVG(540,330,150,0);}
  return h;}},
// 12 diagrama do limitador
{s:37,e:42,w:'shaft',caps:[[.2,'TODO ELEVADOR'],[2.6,'TEM ISSO.']],hl:['ELEVADOR','ISSO'],ev:[[.2,'pop',.6],[1.6,'click',.8],[2.2,'clamp',.6]],
async up(u,d,t){setCab(7.5,true);camShot(u,d,V(5,9,12),V(4.6,9.2,11),V(0,8.5,0),V(0,8.5,0),{t});AP=.002;return diagram(u,t);}},
// 13 1853 Elisha Otis
{s:42,e:46,w:'shaft',caps:[[.6,'DESDE 1853.']],hl:['1853'],ev:[[.2,'pop',.6],[1.35,'cut',1],[1.45,'thud',.7],[1.6,'crowd',.6]],
async up(u,d,t){setCab(7.5,true);camShot(u,d,V(5,9,12),V(4.6,9.2,11),V(0,8.5,0),V(0,8.5,0),{t});return otis(u,t);}},
// 14 sentado aliviado, celular rachado
{s:46,e:50,w:'cab',caps:[[.4,'TU'],[1.2,'SOBREVIVE.']],hl:['SOBREVIVE'],ev:[[.3,'breath',.8],[1.6,'breath',.8],[2.9,'breath',.7]],
async up(u,d,t){setDisp(4,.6);CB.doors.forEach((m,i)=>m.position.x=(i?1:-1)*.55);CB.light.intensity=6;CB.panel.material.color.set('#fff2d6');CB.hemi.intensity=.6;
  const pant=Math.sin(t*4)*.5+.5;await put(HERO,kid,V(-.1,FY,-1.3),LS,{t,stance:'sit',expr:'neutral',mouth:.35+.35*pant,aL:20,aR:20,eL:-40,eR:-40,noPhone:true,blink:blink(t,3),bob:-6*pant});
  if(u<2){camShot(u,2,V(.25,.6,-.06),V(.2,.62,-.12),V(-.1,.55,-1.3),V(-.1,.58,-1.3),{t});FOVMUL=1.3;}else camShot(u-2,2,V(.05,1.0,-.45),V(.04,1.0,-.55),V(-.1,.98,-1.3),V(-.1,.98,-1.3),{t});
  FOCUS=V(-.1,.7,-1.3);AP=u<2?.006:.016;return '';}},
// 15 luz pisca e apaga, rangido em cima
{s:50,e:54,w:'cab',caps:[[1.4,'SÓ QUE...']],hl:['SÓ','QUE'],ev:[[.4,'flicker',.8],[1.3,'off',.8],[1.5,'creak',1.1],[3.0,'creak',1]],
async up(u,d,t){const pat=[1,1,0,1,0,0,1,0,1,0,0,0],lit=u>1.3?0:(u>.4?pat[Math.floor(u*10)%12]:1);CB.light.intensity=6*lit;CB.panel.material.color.set(lit?'#fff2d6':'#1a1414');CB.hemi.intensity=lit?.6:.08;CB.red.intensity=lit?0:3;
  CB.doors.forEach((m,i)=>m.position.x=(i?1:-1)*.55);setDisp(4,.3);
  await put(HERO,kid,V(-.1,FY,-1.3),LS,{t,stance:'sit',expr:u>1.3?'fear':'neutral',lookY:u>1.3?-.9:0,aL:20,aR:20,eL:-40,eR:-40,noPhone:true,rot:u>1.5?tremble(t,1.5):0});
  let h='';if(u<2){const s2=shake(u,1.5,.03,1.5);camShot(u,2,V(.25+s2[0],.75+s2[1],-.06),V(.05+s2[0],.85+s2[1],-.5),V(-.1,.75,-1.3),V(-.1,.8,-1.3),{t});FOVMUL=1.3;FOCUS=V(-.1,.8,-1.3);AP=.006;}
  else{camShot(u-2,2,V(0,1.4,-.1),V(0,1.45,-.15),V(0,2.4,-1.0),V(0,2.4,-1.05),{t,shake:[tremble(t,.012),tremble(t+2,.01)]});FOCUS=V(0,2.4,-.9);AP=.008;
    for(let k=0;k<16;k++){const ph=(t*.7+rnd(k))%1;h+=`<circle cx="${f(300+rnd(k+2)*480)}" cy="${f(300+ph*1300)}" r="4" fill="#c8b8a8" opacity="${f(.6*(1-ph))}"/>`;}}
  return h;}},
// 16 câmera sobe pelo poço: algo em cima da cabina
{s:54,e:58,w:'shaft',caps:[[.3,'TU NÃO'],[1.8,'TÁ SOZINHO.']],hl:['SOZINHO'],ev:[[.2,'creak',.9],[1.8,'growl',1],[3.0,'thump',.8]],
async up(u,d,t){setCab(7.5,true);SH.hemi.intensity=.3;SH.key.intensity=.35;SH.cabL.intensity=2.5;SH.cabL.color.set('#ff3a20');
  const P=V(Math.sin(t*1.7)*.25,7.5+2.6+.45,.1);CREA.mesh.visible=true;CREA.mesh.position.copy(P);CREA.mesh.scale.setScalar(1.3);
  const sh2=Math.sin(t*3)*6;await CREA.set(`<path d="M-90 50 C-100 ${f(-30+sh2)} -40 -90 0 -80 C50 -90 100 ${f(-30-sh2)} 90 50Z" fill="#050305"/>`+[0,1,2,3].map(k=>{const a=-.4+k*.27+Math.sin(t*4+k)*.08;return `<path d="M${-60+k*40} 30 L${f(-60+k*40+Math.sin(a)*90)} ${f(50+Math.cos(a)*40)}" stroke="#050305" stroke-width="14" stroke-linecap="round"/>`;}).join('')+((t*.9)%3>.2?`<circle cx="-22" cy="-40" r="8" fill="#ff3a20"/><circle cx="22" cy="-40" r="8" fill="#ff3a20"/>`:''));
  if(u<2){const cy=lerp(5,10.6,ease(seg(u,0,2)));camShot(u,2,V(2.6,cy,4.2),V(2.6,cy+.2,4.1),V(0,cy+1.2,0),V(0,10.1,0),{t});}
  else camShot(u-2,2,V(1.3,11.3,2.6),V(1.2,11.2,2.3),P,P,{t});
  FOCUS=P;AP=.006;return '';}},
// 17 PARTE 2?
{s:58,e:60.5,w:'cab',caps:[[0,'#P2']],hl:['2?'],ev:[[.0,'hit',1]],
async up(u,d,t){camAt2(V(0,1,2),V(0,1,0),t);let h=`<rect width="1080" height="1920" fill="#000"/>`;for(let k=0;k<40;k++){const ph=(t*.3+rnd(k))%1;h+=`<circle cx="${f(rnd(k+1)*1080)}" cy="${f(1920-ph*1920)}" r="${f(2+rnd(k+3)*3)}" fill="#ff3a20" opacity="${f(.5*Math.sin(ph*Math.PI))}"/>`;}return h;}}
];
SC.forEach(s=>{s.ev.forEach(([a,n,g])=>EV.push([SC.indexOf(s),a,n,g]));});
function diagram(u,t){const cut=u>2.6,z=cut?1.45+(u-2.6)*.12:.85+u*.09,cx=cut?lerp(620,700,(u-2.6)/2.4):lerp(420,620,u/2.6),cy=cut?480:lerp(1150,900,u/2.6);let h=`<rect width="1080" height="1920" fill="#1d3550"/>`;
  for(let k=0;k<1080;k+=60)h+=`<rect x="${k}" width="2" height="1920" fill="#fff" opacity=".07"/>`;for(let k=0;k<1920;k+=60)h+=`<rect y="${k}" width="1080" height="2" fill="#fff" opacity=".07"/>`;
  let g=`<g stroke="#eaf2ff" stroke-width="6" fill="none"><line x1="260" y1="200" x2="260" y2="1750"/><line x1="300" y1="200" x2="300" y2="1750"/><rect x="320" y="900" width="360" height="420" rx="10"/>`;
  const gx=760,gy=330,gr=120,ang=t*(u<1.6?6:14);g+=`<circle cx="${gx}" cy="${gy}" r="${gr}"/>`;for(let k=0;k<6;k++){const a=ang+k*TAU/6;g+=`<line x1="${gx}" y1="${gy}" x2="${f(gx+Math.cos(a)*gr)}" y2="${f(gy+Math.sin(a)*gr)}"/>`;}
  g+=`<line x1="${gx-gr}" y1="${gy}" x2="${gx-gr}" y2="1650"/><line x1="${gx+gr}" y1="${gy}" x2="${gx+gr}" y2="1650"/><path d="M${gx-gr} 1650 A${gr} ${gr} 0 0 0 ${gx+gr} 1650"/>`;
  const pull=seg(u,2.0,2.4)*30;g+=`<path d="M${gx-gr} ${f(950-pull)} L680 ${f(950-pull)} L330 ${f(1300-pull)}"/></g>`;
  const fw=1+.35*seg(u,1.6,2.2);for(const k of[0,1]){const a=ang+k*Math.PI;g+=`<circle cx="${f(gx+Math.cos(a)*gr*.55*fw)}" cy="${f(gy+Math.sin(a)*gr*.55*fw)}" r="22" fill="#ffd23f"/>`;}
  for(const s of[-1,1])g+=`<path d="M${280+s*28} 1290 L${f(280+s*(28-pull*.4))} 1340 L${280+s*50} 1340Z" fill="#ffd23f"/>`;
  g+=`<text x="500" y="1125" class="mt" font-size="44" fill="#eaf2ff" text-anchor="middle">CABINA</text>`;
  const lab=(s,x,y,ax,ay,p)=>p<=0?'':`<g opacity="${f(cl(p*3))}"><line x1="${x}" y1="${y+20}" x2="${ax}" y2="${ay}" stroke="#ffd23f" stroke-width="5"/><circle cx="${ax}" cy="${ay}" r="10" fill="#ffd23f"/><text x="${x}" y="${y}" class="mt" font-size="44" fill="#ffd23f" stroke="#0e1a28" stroke-width="10" text-anchor="middle">${s}</text></g>`;
  g+=lab('LIMITADOR DE VELOCIDADE',560,110,gx,gy-gr,seg(u,.2,.5))+lab('CABO DO LIMITADOR',760,760,gx+gr,800,seg(u,.7,1))+lab('GARRAS DE FREIO',300,1480,280,1330,seg(u,1.2,1.5))+lab('TRILHO',280,1810,280,1700,seg(u,1.4,1.7));
  const wt=u>2.0?`<text x="540" y="${cut?1380:1880}" class="mt" font-size="56" fill="#ff8a6a" stroke="#0e1a28" stroke-width="12" text-anchor="middle">RÁPIDO DEMAIS → TRAVA!</text>`:'';
  return h+`<g transform="translate(${cx} ${cy}) scale(${f(z)}) translate(${-cx} ${-cy})">${g}</g>`+wt;}
function otis(u,t){const cut=u>2.0,z=cut?1.45+(u-2)*.12:1+u*.12,cx=cut?560:lerp(540,600,u/2),cy=cut?lerp(980,820,(u-2)/2):lerp(1300,1000,u/2),ink='#3a2614';let g=`<rect width="1080" height="1920" fill="#2a2018"/><rect x="100" y="180" width="880" height="1500" rx="20" fill="#e8d6b0" stroke="#6a4a2a" stroke-width="16"/>`;
  for(let k=0;k<120;k++)g+=`<circle cx="${f(120+rnd(k)*840)}" cy="${f(200+rnd(k+2)*1460)}" r="${f(4+rnd(k+4)*16)}" fill="#8a6a40" opacity=".08"/>`;
  for(const x of[300,780]){g+=`<rect x="${x-18}" y="320" width="36" height="1150" fill="#8a5a30"/>`;for(let y=360;y<1460;y+=46)g+=`<line x1="${x+(x<500?18:-18)}" y1="${y}" x2="${x+(x<500?30:-30)}" y2="${y+14}" stroke="${ink}" stroke-width="5"/>`;}
  g+=`<rect x="282" y="300" width="516" height="40" fill="#8a5a30"/>`;const cp=seg(u,1.3,1.5),drop=30*eo(seg(u,1.4,1.6)),py=900+drop;
  g+=cp<1?`<line x1="540" y1="340" x2="540" y2="${py-260}" stroke="#7a5a3a" stroke-width="12"/>`:`<line x1="540" y1="340" x2="${f(560)}" y2="${f(520-(u-1.5)*300)}" stroke="#7a5a3a" stroke-width="12"/><line x1="540" y1="${py-260}" x2="525" y2="${f(py-360+drop)}" stroke="#7a5a3a" stroke-width="12"/>`;
  g+=`<rect x="318" y="${py}" width="444" height="44" fill="#6a4424"/><path d="M330 ${py} L540 ${py-260} L750 ${py}" stroke="${ink}" stroke-width="6" fill="none"/>`;for(let x=360;x<730;x+=70)g+=`<rect x="${x}" y="${py-60}" width="40" height="60" fill="#9a6a3a"/>`;
  const mx=560,my=py;g+=`<rect x="${mx-40}" y="${my-190}" width="80" height="150" fill="#2a1e18"/><rect x="${mx-28}" y="${my-40}" width="22" height="40" fill="#2a1e18"/><rect x="${mx+6}" y="${my-40}" width="22" height="40" fill="#2a1e18"/><circle cx="${mx}" cy="${my-225}" r="36" fill="#e0b890"/><rect x="${mx-40}" y="${my-262}" width="80" height="10" fill="#141010"/><rect x="${mx-26}" y="${my-330}" width="52" height="72" fill="#141010"/><line x1="${mx+30}" y1="${my-170}" x2="${mx+130}" y2="${f(my-250+30*cp)}" stroke="#2a1e18" stroke-width="22" stroke-linecap="round"/>`;
  const bx=lerp(700,545,seg(u,.9,1.35));g+=`<path d="M${f(bx)} ${py-380} l120 -20 v40Z" fill="#c8c8cc"/>`;
  const sp=seg(u,.1,.45);if(sp>0){g+='';const k=1+.4*Math.exp(-sp*8)*Math.cos(sp*12);let st='';for(let j=0;j<24;j++){const a=j/24*TAU,r=j%2?150:135;st+=(j?'L':'M')+f(Math.cos(a)*r)+' '+f(Math.sin(a)*r);}
    g+=`<g transform="translate(540 1440) scale(${f(k)})"><path d="${st}Z" fill="#b8322a"/><circle r="112" fill="none" stroke="#f2e2c0" stroke-width="6"/><text y="0" class="mt" font-size="66" fill="#f2e2c0" text-anchor="middle">1853</text><text y="52" class="mt" font-size="28" fill="#f2e2c0" text-anchor="middle">ELISHA OTIS</text></g>`;}
  if(cp>=1)g+=`<text x="540" y="270" class="mt" font-size="44" fill="${ink}" text-anchor="middle">"TUDO SEGURO!"</text>`;
  return `<g transform="translate(${cx} ${cy}) scale(${f(z)}) translate(${-cx} ${-cy})">${g}</g>`;}

// ================= linha do tempo e render =================
const TOTAL=60.5;let CUR=-1;
window.render=async function(t){
  let i=SC.findIndex(s=>t>=s.s&&t<s.e);if(i<0)i=SC.length-1;const S=SC[i],u=t-S.s,d=S.e-S.s;
  if(i!==CUR){CUR=i;}setWorld(S.w);
  SPR.forEach(s=>s.mesh.visible=false);FOVMUL=1;FOCUS=null;AP=.002;BL=[.6,.6,.8];flashL.intensity=0;zapL.intensity=0;
  SH.cab.visible=true;SH.walls[0].visible=true;SH.hemi.intensity=.55;SH.key.intensity=1.2;SH.cabL.intensity=4;SH.cabL.color.set('#ffe2b0');SH.spark.intensity=0;
  CB.light.intensity=5;CB.hemi.intensity=.6;CB.red.intensity=0;CB.panel.material.color.set('#fff2d6');
  CB.pan.material.map=CB.btn1;CB.pan.material.emissiveMap=CB.btn1;CB.doors.forEach((m,k)=>m.position.x=(k?1:-1)*1.65);setDisp(15);
  const ui=await S.up(u,d,t);
  cam.fov=52*FOVMUL;cam.updateProjectionMatrix();
  SPR.forEach(s=>{if(s.mesh.visible)bill(s);});scene.traverse(o=>{if(o.userData.glow&&o.visible)o.lookAt(cam.position);});
  bokeh.uniforms.focus.value=cam.position.distanceTo(FOCUS||V(0,0,0));bokeh.uniforms.aperture.value=AP;bokeh.uniforms.maxblur.value=AP>.005?.012:.006;bokeh.enabled=AP>.0025;
  bloom.strength=BL[0];bloom.radius=BL[1];bloom.threshold=BL[2];composer.render();
  // legenda: 1–3 palavras no meio da tela
  let cap='';const cur=S.caps.filter(c=>u>=c[0]);if(cur.length){const [tc,txt]=cur[cur.length-1],p=(u-tc)/.25,hl=new Set(S.hl);
    const CY={1:1640,4:1580,6:1650,11:1720,12:1790,10:330};const y=CY[i]??960;
    if(txt==='#KMH'){const v=Math.round(speed(t));cap=capSVG([String(v),'KM/H'],Math.max(p,u>.3?1:p),300,150,new Set([String(v),'KM/H']));}
    else if(txt==='#MET'){const v=Math.round(45*eo(seg(u,.1,1.7)));cap=capSVG([String(v),'METROS'],p,y,130,new Set([String(v),'METROS']));}
    else if(txt==='#P2'){const k=1+.08*Math.sin(u*6);cap=`<g transform="translate(540 960) scale(${f(k)}) translate(-540 -960)">${capSVG(['PARTE','2?'],2,960,170,new Set(['2?']))}</g>`;}
    else cap=capSVG(txt.split(' '),p,y,124,hl);}
  document.getElementById('ui').innerHTML=ui;document.getElementById('caps').innerHTML=cap;
  const CUTS={11:[2.6],15:[2.0],10:[2.0],13:[2.0],14:[2.0],9:[2.4],6:[2.0]};let fl=i>0&&i<16?.3*(1-seg(u,0,.12)):0;(CUTS[i]||[]).forEach(c=>{if(u>=c&&u<c+.15)fl=Math.max(fl,.45*(1-(u-c)/.15));});if(i===16)fl=0;document.getElementById('flash').setAttribute('opacity',f(fl));
  const fr=Math.floor(t*30),gr=document.getElementById('grain');gr.setAttribute('x',f(-60+rnd(fr)*60));gr.setAttribute('y',f(-60+rnd(fr+5)*60));
};
window.INFO={total:TOTAL,scenes:SC.map(s=>({s:s.s,d:s.e-s.s}))};window.GROUPS=[];
window.EVENTS=EV.map(([s,u,n,g])=>({t:+(SC[s].s+u).toFixed(3),name:n,gain:g}));window.WINDCURVE=[];
for(let t=0;t<TOTAL;t+=.1)window.WINDCURVE.push(t>=15&&t<29?Math.min(1.4,(t-15)*.3):(t>=29&&t<33.3?1.4*(1-seg(t,29,33.3)):.05));
window.DBG={cam,scene};
await window.render(0);
window.ready=true;

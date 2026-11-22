// ---------- GAROTO 3D articulado (personagem fixo): cabeça redonda, cabelo castanho, fone preto grande, camiseta mostarda, jeans, mochila cinza, celular ----------
const BOYH=1.34;
function makeBoy(){
  const root=new THREE.Group();scene.add(root);
  const skin=std({color:'#c99568',roughness:.7}),tee=std({color:'#d2a032',roughness:.85}),teeD=std({color:'#b8891f',roughness:.85}),jeans=std({color:'#45607f',roughness:.9}),shoe=std({color:'#ece6da',roughness:.6}),hairM=std({color:'#4a3022',roughness:.55}),blk=std({color:'#1b1b1f',roughness:.35,metalness:.2}),grey=std({color:'#83868d',roughness:.8}),greyD=std({color:'#676a71',roughness:.8});
  const cap=(r,l,mat,par,x=0,y=0,z=0)=>M3(new THREE.CapsuleGeometry(r,l,6,14),mat,par,x,y,z);
  const sph=(r,mat,par,x=0,y=0,z=0,sx=1,sy=1,sz=1)=>{const m=M3(new THREE.SphereGeometry(r,18,14),mat,par,x,y,z);m.scale.set(sx,sy,sz);return m;};
  const pelvis=new THREE.Group();pelvis.position.y=.44;root.add(pelvis);
  cap(.12,.04,jeans,pelvis,0,.01,0).scale.set(1.25,1,.95);
  // pernas
  function leg(sd){const hip=new THREE.Group();hip.position.set(sd*.085,0,0);pelvis.add(hip);cap(.066,.09,jeans,hip,0,-.105,0);const knee=new THREE.Group();knee.position.y=-.21;hip.add(knee);cap(.058,.09,jeans,knee,0,-.1,0);const ft=sph(.075,shoe,knee,0,-.215,.045,.95,.62,1.5);M3(new THREE.BoxGeometry(.13,.015,.19),std({color:'#8a8a90'}),knee,0,-.255,.045);return{hip,knee};}
  const LL=leg(-1),LR=leg(1);
  // tronco (camiseta mostarda)
  const torso=new THREE.Group();torso.position.y=.05;pelvis.add(torso);
  const tr=cap(.14,.12,tee,torso,0,.19,0);tr.scale.set(1.1,1,.82);
  const hem=M3(new THREE.TorusGeometry(.15,.012,6,24),teeD,torso,0,.02,0);hem.rotation.x=Math.PI/2;hem.scale.set(1.08,.84,1);
  const collar=M3(new THREE.TorusGeometry(.075,.014,8,20),std({color:'#a8801c'}),torso,0,.375,.01);collar.rotation.x=Math.PI/2;
  // mochila cinza (atrás) e alças
  const pack=sph(.14,grey,torso,0,.2,-.15,1.05,1.3,.7);M3(new THREE.BoxGeometry(.16,.1,.012),greyD,torso,0,.15,-.235);
  for(const sd of[-1,1]){const s=M3(new THREE.BoxGeometry(.03,.3,.012),greyD,torso,sd*.085,.22,.13);s.rotation.x=-.12;const t=M3(new THREE.BoxGeometry(.03,.012,.26),greyD,torso,sd*.085,.36,-.0);}
  // pescoço e cabeça
  const neck=cap(.045,.03,skin,torso,0,.41,0);
  const headG=new THREE.Group();headG.position.set(0,.6,0);torso.add(headG);
  const head=sph(.22,skin,headG,0,0,0);
  // cabelo curto castanho (calota) + franja
  const hairCap=M3(new THREE.SphereGeometry(.236,26,18,0,TAU,0,1.78),hairM,headG,0,.0,-.012);hairCap.rotation.x=-.42;
  const fringe=sph(.1,hairM,headG,.04,.155,.17,1.3,.55,.7);fringe.rotation.z=-.25;
  for(const sd of[-1,1])sph(.045,skin,headG,sd*.215,-.01,0,.6,1,1);
  // fone preto grande
  const band=M3(new THREE.TorusGeometry(.262,.019,10,32,Math.PI),blk,headG,0,0,0);
  for(const sd of[-1,1]){const cup=M3(new THREE.CylinderGeometry(.088,.088,.07,22),blk,headG,sd*.252,-.01,0);cup.rotation.z=Math.PI/2;const pad=M3(new THREE.CylinderGeometry(.078,.082,.03,22),std({color:'#34343c',roughness:.9}),headG,sd*.222,-.01,0);pad.rotation.z=Math.PI/2;}
  // rosto: decalque curvo com textura desenhada (olhos de ponto, sobrancelha curta, boca)
  const FC=document.createElement('canvas');FC.width=512;FC.height=430;const fg=FC.getContext('2d');const FT=new THREE.CanvasTexture(FC);FT.colorSpace=THREE.SRGBColorSpace;FT.anisotropy=8;
  const face=M3(new THREE.SphereGeometry(.2216,40,30,Math.PI/2-.9,1.8,.8,1.5),new THREE.MeshStandardMaterial({map:FT,transparent:true,roughness:.7,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2}),headG,0,0,0);face.castShadow=false;
  let faceKey='';
  function drawFace(o){const k=JSON.stringify(o);if(k===faceKey)return;faceKey=k;const g=fg,W=512,H=430;g.clearRect(0,0,W,H);
    const ex=[.5-.177,.5+.177].map(u=>u*W),ey=.47*H,my=.2*H,by=.64*H,look=(o.look||0)*9,lookY=(o.lookY||0)*7,e=o.expr||'neutral',bl=o.blink>.5,mouth=o.mouth||0,pup=o.pupil||1;
    g.lineCap='round';g.lineJoin='round';
    // bochechas
    const bl_=e==='happy'||e==='laugh'||o.blush?.5:.22;for(const x of ex){g.fillStyle=`rgba(226,110,100,${bl_})`;g.beginPath();g.ellipse(x+(x<W/2?-18:18),ey+62,30,17,0,0,7);g.fill();}
    const wide=e==='shock'||e==='fear'?1:0;
    for(let i=0;i<2;i++){const x=ex[i],sd=i?1:-1;
      if(o.eyeFx==='spiral'){g.strokeStyle='#2a1a14';g.lineWidth=5;g.beginPath();for(let a=0;a<20;a+=.2){const r=2+a*1.6;g.lineTo(x+Math.cos(a*sd*1.0+ (o.t||0)*8)*r,ey+Math.sin(a*sd+(o.t||0)*8)*r);}g.stroke();}
      else if(bl||e==='sleep'){g.strokeStyle='#2a1a14';g.lineWidth=7;g.beginPath();g.moveTo(x-20,ey);g.quadraticCurveTo(x,ey+(e==='sleep'?14:4),x+20,ey);g.stroke();}
      else if(wide){g.fillStyle='#fff';g.beginPath();g.ellipse(x,ey,30,36,0,0,7);g.fill();g.strokeStyle='#4a2a1a';g.lineWidth=3;g.stroke();g.fillStyle='#1d1410';g.beginPath();g.arc(x+look,ey+lookY,11*pup,0,7);g.fill();g.fillStyle='#fff';g.beginPath();g.arc(x+look+4,ey+lookY-4,4,0,7);g.fill();}
      else{g.fillStyle='#1d1410';g.beginPath();g.ellipse(x+look,ey+lookY,e==='laugh'||e==='happy'?15:16*pup,e==='smirk'?13:18*pup,0,0,7);g.fill();g.fillStyle='#fff';g.beginPath();g.arc(x+look+5,ey+lookY-6,5.5,0,7);g.fill();}
      // sobrancelha curta
      g.strokeStyle='#3a2418';g.lineWidth=9;g.beginPath();let ang=0,dy=0;if(e==='angry'){ang=.5*sd;dy=8;}else if(e==='fear'||e==='shock'){ang=-.32*sd;dy=-14;}else if(e==='smirk'&&i){dy=-12;}else if(e==='disgust'){ang=.25*sd;dy=4;}
      g.save();g.translate(x,by+dy);g.rotate(ang);g.moveTo(-26,0);g.lineTo(26,0);g.stroke();g.restore();}
    // boca
    g.strokeStyle='#6a3a28';g.lineWidth=7;g.fillStyle='#5a2a20';const mx=W/2;
    if(mouth>.25||e==='laugh'||e==='shock'||e==='fear'){const o2=Math.max(mouth,e==='laugh'?.8:e==='shock'?.6:.35);g.beginPath();g.ellipse(mx,my+8,(e==='laugh'?34:22)*(.7+o2*.5),(10+o2*30),0,0,7);g.fill();if(e==='laugh'){g.fillStyle='#fff';g.fillRect(mx-28,my-8,56,12);g.fillStyle='#e86a7a';g.beginPath();g.ellipse(mx,my+30,18,10,0,0,7);g.fill();}}
    else if(e==='happy'){g.beginPath();g.moveTo(mx-34,my);g.quadraticCurveTo(mx,my+36,mx+34,my);g.stroke();}
    else if(e==='angry'||e==='disgust'){g.beginPath();g.moveTo(mx-30,my+10);g.quadraticCurveTo(mx,my-14,mx+30,my+10);g.stroke();}
    else if(e==='smirk'){g.beginPath();g.moveTo(mx-24,my+4);g.quadraticCurveTo(mx+10,my+16,mx+34,my-8);g.stroke();}
    else{g.beginPath();g.moveTo(mx-20,my+2);g.quadraticCurveTo(mx,my+12,mx+20,my+2);g.stroke();}
    if(o.sweat){g.fillStyle='rgba(143,211,255,.9)';g.strokeStyle='#1d4f73';g.lineWidth=3;g.beginPath();g.moveTo(W*.82,ey-90);g.quadraticCurveTo(W*.82+22,ey-50,W*.82,ey-34);g.quadraticCurveTo(W*.82-22,ey-50,W*.82,ey-90);g.fill();g.stroke();}
    FT.needsUpdate=true;}
  // braços (camiseta até o cotovelo, antebraço e mão em pele)
  function arm(sd){const sh=new THREE.Group();sh.position.set(sd*.185,.33,0);torso.add(sh);cap(.052,.07,tee,sh,0,-.075,0);const el=new THREE.Group();el.position.y=-.17;sh.add(el);cap(.042,.1,skin,el,0,-.1,0);const hand=new THREE.Group();hand.position.y=-.225;el.add(hand);sph(.052,skin,hand,0,0,0);return{sh,el,hand};}
  const AL=arm(-1),AR=arm(1);
  // celular na mão direita da tela
  const phone=new THREE.Group();AR.hand.add(phone);phone.position.set(0,-.02,.05);phone.rotation.x=-.6;M3(new THREE.BoxGeometry(.062,.115,.009),blk,phone,0,0,0);
  const scr=M3(new THREE.PlaneGeometry(.054,.1),new THREE.MeshBasicMaterial({color:'#9fd0ff',toneMapped:false}),phone,0,0,.0052);scr.castShadow=false;
  // estrelinhas de tontura
  const stars=new THREE.Group();headG.add(stars);const stG=new THREE.ExtrudeGeometry((()=>{const s=new THREE.Shape();for(let i=0;i<10;i++){const a=i*Math.PI/5-Math.PI/2,r=i%2?.022:.05;i?s.lineTo(Math.cos(a)*r,Math.sin(a)*r):s.moveTo(Math.cos(a)*r,Math.sin(a)*r);}return s;})(),{depth:.012,bevelEnabled:false});
  for(let i=0;i<5;i++)stars.add(new THREE.Mesh(stG,new THREE.MeshBasicMaterial({color:'#ffd23f',toneMapped:false})));stars.visible=false;
  const B={root,pelvis,torso,headG,AL,AR,LL,LR,phone,stars,drawFace,pack};
  const D=Math.PI/180;
  // aplica a pose; pos = ponto dos pés; o = opções (mesmas dos sprites: t, walk, expr, aL/aR/eL/eR, legL/legR, rot, mouth, look...)
  B.pose=function(pos,o={}){const t=o.t||0;root.visible=true;root.position.copy(pos);
    const cp=cam.position,yaw=Math.atan2(cp.x-pos.x,cp.z-pos.z);root.rotation.set(0,yaw+(o.yaw??(.28+.12*Math.sin(t*.7)))*(o.noYaw?0:1),(o.rot||0)*D);root.rotation.order='YXZ';if(o.rotX)root.rotation.x=o.rotX*D;
    const w=o.walk,sw=w!=null?Math.sin(w*TAU):0,sw2=w!=null?Math.sin(w*TAU+Math.PI):0,br=Math.sin(t*2.2)*.004;
    pelvis.position.y=.44+(w!=null?Math.abs(Math.cos(w*TAU))*.025:0)+(o.sit?-.22:0)+br;
    // pernas
    const lg=(L,sd,a,swing)=>{L.hip.rotation.set(o.sit?-Math.PI/2:swing*.65,0,(sd*(a??4))*D);L.knee.rotation.x=o.sit?Math.PI/2:(w!=null?Math.max(0,-swing)*.9:0)+(o.kneeBend||0)*D;};
    lg(LL,-1,o.legL,sw);lg(LR,1,o.legR,sw2);
    // braços
    const useP=!o.noPhone&&o.aR===undefined,aL=o.aL??(w!=null?10:8),eL=o.eL??-6;let aR=o.aR??(w!=null?10:8),eR=o.eR??-6;
    AL.sh.rotation.set(w!=null&&!o.aL?sw2*.5:0,0,-aL*D);AL.el.rotation.set(0,0,-eL*D*0+(-eL*D));
    AR.sh.rotation.set(w!=null&&!o.aR&&!useP?sw*.5:0,0,aR*D);AR.el.rotation.set(0,0,eR*D);
    if(useP){AR.sh.rotation.set(-1.15,0,.25);AR.el.rotation.set(-1.0,0,0);}
    if(o.fwdR){AR.sh.rotation.x=-o.fwdR*D;}
    phone.visible=!o.noPhone;
    // cabeça e tronco
    torso.rotation.set((o.lean||0)*D+(o.sit?.12:0),0,(o.tilt||0)*D);
    headG.rotation.set((useP?.28:0)+(o.nod||0)*D+(o.lookY?-o.lookY*.15:0),(o.look||0)*.3,Math.sin(t*1.3)*.02+(o.headRoll||0)*D);
    // rosto
    drawFace({expr:o.expr,mouth:Math.round((o.mouth||0)*5)/5,look:o.look?Math.sign(o.look)*Math.min(1,Math.abs(o.look)):0,lookY:Math.round((o.lookY||0)*3)/3,pupil:o.pupil,eyeFx:o.eyeFx,blink:(o.blink!==undefined?o.blink:(Math.floor(t*30)%110<4?1:0)),blush:o.blush,sweat:o.sweat,t:o.eyeFx?Math.round(t*20)/20:0});
    stars.visible=!!o.stars;if(o.stars){stars.children.forEach((s,i)=>{const a=t*4+i*TAU/5;s.position.set(Math.cos(a)*.24,.3+Math.sin(a*2)*.02,Math.sin(a)*.24);s.lookAt(cp);s.scale.setScalar(.9+.2*Math.sin(t*9+i));});}
    return B;};
  B.hand=sd=>(sd>0?AR:AL).hand.getWorldPosition(V(0,0,0));
  B.headPos=()=>headG.getWorldPosition(V(0,0,0));
  B.neckPos=()=>torso.localToWorld(V(0,.42,0));
  B.hide=()=>{root.visible=false;};
  root.visible=false;return B;}
const BOY=makeBoy();
// celular solto (3D): posição/rotação definidas pela cena
const PHONE3=(()=>{const g=new THREE.Group();M3(new THREE.BoxGeometry(.062,.115,.009),std({color:'#1b1b1f',roughness:.3}),g);M3(new THREE.PlaneGeometry(.054,.1),new THREE.MeshBasicMaterial({color:'#9fd0ff',toneMapped:false}),g,0,0,.0052);g.visible=false;scene.add(g);return g;})();

// ---------- atalhos de compatibilidade e efeitos 3D (poeira, estilhaços, anéis, respingos, bolhas) ----------
function hsv(side,a,e){return [side,0];}
function svw(S,sx,sy){if(sy===70)return BOY.neckPos();if(sy===-20)return BOY.headPos().add(V(0,.3,0));return BOY.hand(sx>=0?1:-1);}
async function putB(S,fn,P,LS,o={}){const p=V(P.x,P.y-FY,P.z);if(o.rot===-90||o.rot===90){p.x-=.65*Math.sign(-o.rot);p.y+=.2;}BOY.pose(p,o);}
const softM=(c,op=.6)=>new THREE.MeshBasicMaterial({map:softT,color:c,transparent:true,opacity:op,depthWrite:false,fog:false,toneMapped:false});
const DUST3=(()=>{const g=new THREE.Group();scene.add(g);const m=[];for(let i=0;i<16;i++){const q=new THREE.Mesh(new THREE.PlaneGeometry(1,1),softM(i%2?'#cbb89a':'#a89880',.7));g.add(q);m.push(q);}g.visible=false;
  return{g,show(pos,p,s=1){g.visible=p>0&&p<1;if(!g.visible)return;m.forEach((q,i)=>{const a=i/16*TAU+rnd(i)*.6,d=(.15+p*(.7+rnd(i+3)*.8))*s;q.position.set(pos.x+Math.cos(a)*d,pos.y+.12+p*.5*rnd(i+5)*s+Math.abs(Math.sin(a))*.05,pos.z+Math.sin(a)*d*.8);q.scale.setScalar((.3+p*1.1+rnd(i+7)*.3)*s);q.material.opacity=.65*(1-p)*Math.min(1,p*8);q.lookAt(cam.position);});}};})();
const CHIPS=(()=>{const g=new THREE.Group();scene.add(g);const m=[];for(let i=0;i<18;i++){const q=M3(new THREE.BoxGeometry(.06+rnd(i)*.1,.02+rnd(i+1)*.04,.04+rnd(i+2)*.06),std({color:['#9a7a52','#7a5a38','#b08a5a'][i%3]}),g);m.push(q);}g.visible=false;
  return{g,show(pos,k){g.visible=k>0;if(!g.visible)return;m.forEach((q,i)=>{const vx=(rnd(i+9)-.5)*2.4,vy=1+rnd(i+11)*2.5,vz=(rnd(i+13)-.5)*1.6;q.position.set(pos.x+vx*k,pos.y+vy*k-.5*G*k*k*.5,pos.z+vz*k);q.rotation.set(k*(3+i%4),k*(2+i%3),k*5);});}};})();
const RING3=(()=>{const q=new THREE.Mesh(new THREE.RingGeometry(.85,1,48),new THREE.MeshBasicMaterial({color:'#fff',transparent:true,opacity:0,side:THREE.DoubleSide,depthWrite:false,fog:false,toneMapped:false}));q.rotation.x=-Math.PI/2;q.visible=false;scene.add(q);
  return{q,show(pos,p,s=1,col='#ffffff'){q.visible=p>0&&p<1;if(!q.visible)return;q.position.copy(pos);q.scale.setScalar((.2+p*1.8)*s);q.material.opacity=.8*(1-p);q.material.color.set(col);}};})();
const SPLASH=(()=>{const n=70,p=pts_(n,'#cfeaff',7);scene.add(p);function pts_(n,c,s){const gg=new THREE.BufferGeometry().setAttribute('position',new THREE.BufferAttribute(new Float32Array(n*3),3));return new THREE.Points(gg,new THREE.PointsMaterial({color:c,size:s,sizeAttenuation:false,transparent:true,opacity:.9,depthWrite:false,map:softT}));}p.visible=false;
  return{p,show(pos,k){p.visible=k>0&&k<1.6;if(!p.visible)return;const a=p.geometry.attributes.position;for(let i=0;i<n;i++){const ang=rnd(i)*TAU,v=.8+rnd(i+3)*1.8;a.setXYZ(i,pos.x+Math.cos(ang)*v*k*.6,pos.y+(v*1.6*k-.5*G*k*k)*.9,pos.z+Math.sin(ang)*v*k*.6);}a.needsUpdate=true;p.material.opacity=.9*Math.max(0,1-k/1.6);}};})();
const BUB3=(()=>{const n=50,gg=new THREE.BufferGeometry().setAttribute('position',new THREE.BufferAttribute(new Float32Array(n*3),3)),p=new THREE.Points(gg,new THREE.PointsMaterial({color:'#e8f8ff',size:9,sizeAttenuation:false,transparent:true,opacity:.7,depthWrite:false,map:softT}));p.visible=false;scene.add(p);
  return{p,show(c,t,on){p.visible=on;if(!on)return;const a=gg.attributes.position;for(let i=0;i<n;i++){const q=(t*.5+rnd(i))%1;a.setXYZ(i,c.x+(rnd(i+2)-.5)*2.4+Math.sin(t*3+i)*.1,c.y-2+q*5,c.z+(rnd(i+5)-.5)*3);}a.needsUpdate=true;}};})();

// ================= CONSTRUÇÕES =================
const woodT=(base,seed)=>ctex(256,64,(g,w,h)=>{g.fillStyle=base;g.fillRect(0,0,w,h);for(let i=0;i<26;i++){g.strokeStyle=`rgba(${R()>.5?'60,35,15':'200,150,100'},${.15+R()*.2})`;g.lineWidth=1+R()*2;const y=R()*h;g.beginPath();g.moveTo(0,y);g.bezierCurveTo(w*.3,y+(R()-.5)*6,w*.7,y+(R()-.5)*6,w,y);g.stroke();}noise(g,w,h,14);g.fillStyle='rgba(40,25,10,.6)';g.fillRect(0,0,3,h);g.fillRect(w-3,0,3,h);});
const plankM=std({map:woodT('#b98352'),roughness:.75}),plankM2=std({map:woodT('#a06c3c'),roughness:.75}),darkWoodM=std({map:woodT('#6b4330'),roughness:.8}),newWoodM=std({map:woodT('#d29a60'),roughness:.7});
const metalM=std({color:'#5a5f68',metalness:.7,roughness:.35}),concreteM=std({color:'#b9b6ad',roughness:.95});

// ---------- TENTATIVA 1: tábuas soltas direto nos galhos ----------
const A1=new THREE.Group();WORLD.add(A1);
const A1P=[];for(let i=0;i<5;i++){const x=1.0+i*.3,y=3.27+x*.06;const m=new THREE.Mesh(new THREE.BoxGeometry(.26,.05,2.3),i%2?plankM:plankM2);m.castShadow=m.receiveShadow=true;m.userData={home:V(x,y,.15),rz:(rnd(i+40)-.5)*.06,ry:(rnd(i+41)-.5)*.08,t:.4+i*.4};A1.add(m);A1P.push(m);}
const LADDER=new THREE.Group();A1.add(LADDER);
{const b=V(3.35,0,.5),tp=V(2.3,3.35,.5),len=b.distanceTo(tp),ang=Math.atan2(tp.y-b.y,tp.x-b.x);LADDER.position.copy(b);LADDER.rotation.z=ang-Math.PI/2;
 for(const z of[-.22,.22])box(.06,len,.06,plankM2,LADDER,0,len/2,z);for(let k=1;k<11;k++)box(.04,.04,.44,plankM2,LADDER,0,k*len/11,0);LADDER.userData={b,tp,len};}
const A1_BRK=5.0; // momento em que o galho fino quebra (tempo local da cena 2)
function a1State(u){// estado físico da tentativa 1 em função do tempo local da cena 2
  const pre=seg(u,4.0,A1_BRK),post=u>A1_BRK;
  BTHIN.rotation.set(0,-.27,0);BTHIN.rotation.z=-pre*.12-(post?.12:0);
  BT_OUT.rotation.z=post?-Math.min(1.35,(u-A1_BRK)*6)+Math.sin(Math.min(u-A1_BRK,2)*14)*.08*Math.exp(-(u-A1_BRK)*3):-pre*.18;
  A1P.forEach((m,i)=>{const h=m.userData.home,t0=m.userData.t;if(u<t0){m.visible=false;return;}m.visible=true;
    if(!post){const drop=bounce(u,t0,1.2,.6,2);const wob=pre*Math.sin(u*30+i)*.04;m.position.set(h.x,h.y+drop-(h.x>1.5?pre*.06*(h.x-1.4):0),h.z);m.rotation.set(wob,h.ry||m.userData.ry,m.userData.rz-pre*.08*(h.x-1)*.5);}
    else{const f=fall(u,A1_BRK+i*.05,[h.x,h.y,h.z],[(i-2)*.35+.6,.6+rnd(i+3)*.8,(rnd(i+4)-.5)*1.2],[(rnd(i+5)-.5)*5,(rnd(i+6)-.5)*3,-2-rnd(i+7)*3],{floor:.03});m.position.copy(f.p);m.rotation.set(f.r[0],m.userData.ry+f.r[1],m.userData.rz+f.r[2]);}});
  return{pre,post};}

// ---------- TENTATIVA 2: plataforma grande em balanço, presa só no tronco ----------
const A2=new THREE.Group();WORLD.add(A2);
const PLAT=new THREE.Group();PLAT.position.set(-.62,3.55,0);A2.add(PLAT); // pivô no tronco
const A2PCS=[];// peças com tempo de entrada
{for(let k=0;k<4;k++){const z=-1.2+k*.8;const j=box(3.0,.14,.1,darkWoodM,PLAT,-1.5,-.12,z);A2PCS.push([j,1.0+k*.12]);}
 for(let k=0;k<11;k++){const x=-.15-k*.27;const b=box(.25,.05,2.8,k%2?newWoodM:plankM,PLAT,x,.0,0);A2PCS.push([b,1.6+k*.11]);}
 for(const z of[-1.2,1.2]){const bp=box(.12,.5,.12,metalM,PLAT,.05,-.2,z);A2PCS.push([bp,.3]);}}
const BRACES=[];for(const z of[-1.0,1.0]){const g=new THREE.Group();g.position.set(-.55,2.35,z);A2.add(g);const len=1.7;const m=box(.1,len,.1,darkWoodM,g,0,len/2,0);g.rotation.z=.75;BRACES.push(g);A2PCS.push([m,.5]);}
// carga: caixas e um sofá, filhos da plataforma
const LOADM=[std({color:'#c98a4a'}),std({color:'#b4553f'}),std({color:'#3f6fb5'})];
const LOAD=[[.5,.4,.5,-2.2,-.7,0],[.45,.45,.45,-2.4,.6,1],[1.0,.45,.55,-2.6,0,2]].map(([w,h,d,x,z,mi],i)=>{const g=new THREE.Group();PLAT.add(g);const b=box(w,h,d,LOADM[mi],g,0,h/2+.03,0);if(mi===2){box(w,.35,.15,LOADM[2],g,0,h+.15,-d/2+.07);}g.userData={w,h,d,x0:-.6,x1:x,z,i};return g;});
const A2_TILT=4.4;A2PCS.forEach(([m])=>m.userData.y0=m.position.y);
function a2State(u){// estado da tentativa 2 em função do tempo local da cena 4
  A2PCS.forEach(([m,t0])=>{m.visible=u>=t0;if(m.visible)m.position.y=m.userData.y0+bounce(u,t0,.6,.45,2);});
  const th=u<A2_TILT?0:Math.min(.5,ease(cl((u-A2_TILT)/1.3))*.5)+Math.sin((u-A2_TILT)*9)*.03*Math.exp(-(u-A2_TILT)*1.5);
  PLAT.rotation.z=th;PLAT.updateMatrixWorld(true);BRACES.forEach((b,i)=>{b.rotation.z=.75-(u>A2_TILT+.3?Math.min(.9,(u-A2_TILT-.3)*2.5)*(i?1:.6):0);});
  LOAD.forEach((g,i)=>{const d=g.userData;const tin=3.0+i*.35;g.visible=u>=tin;if(!g.visible)return;let x=lerp(d.x0,d.x1,ease(seg(u,tin,tin+.6)));
    // escorrega quando a inclinação passa do atrito
    const ts=A2_TILT+.5+i*.15;if(u>ts){const k=u-ts;x-=1.6*k*k;}
    if(x>-3.0){g.position.set(x,0,d.z);g.rotation.set(0,0,0);g.userData.off=null;}
    else{// saiu da beirada: queda livre a partir do ponto de saída
      if(!g.userData.off){let tt=ts;while(tt<u&&(d.x1-1.6*(tt-ts)*(tt-ts))>-3.0)tt+=1/120;g.userData.off=tt;}
      const tEdge=g.userData.off;const wp=PLAT.localToWorld(V(-3.0,d.h/2,d.z)),vel=3.2*(tEdge-ts);
      const f=fall(u,tEdge,[wp.x,wp.y,wp.z],[-vel*Math.cos(th),-vel*Math.sin(th),0],[0,0,2.5+i],{floor:d.h/2});
      const lp=PLAT.worldToLocal(f.p.clone());g.position.copy(lp).add(V(0,-d.h/2,0));g.rotation.set(f.r[0],0,f.r[2]-th);}});
  return{th};}

// ---------- TENTATIVA 3: estrutura independente com casinha ----------
const A3=new THREE.Group();WORLD.add(A3);const PCS=[];const WIRE=new THREE.Group();scene.add(WIRE);
const wireM=new THREE.LineBasicMaterial({color:'#5fe0ff',transparent:true,opacity:.9,toneMapped:false});
function piece(m,t0,kind='drop'){m.castShadow=m.receiveShadow=true;m.userData.home=m.position.clone();m.userData.t0=t0;m.userData.kind=kind;PCS.push(m);
  const e=new THREE.LineSegments(new THREE.EdgesGeometry(m.geometry),wireM);m.updateMatrix();e.matrixAutoUpdate=false;e.matrix.copy(m.matrix);if(m.parent!==A3){m.parent.updateMatrixWorld(true);e.matrix.copy(m.matrixWorld);}WIRE.add(e);m.userData.wire=e;return m;}
const pb=(w,h,d,mat,x,y,z,t0,kind)=>piece(box(w,h,d,mat,A3,x,y,z),t0,kind);
const DECKY=3.45,HALF=2.5,CAB=1.45,WALLH=2.2;
// sapatas e pilares
[[-2.2,-2.2],[2.2,-2.2],[-2.2,2.2],[2.2,2.2]].forEach(([x,z],k)=>{piece(cyl(.32,.36,.3,concreteM,A3,x,.15,z,16),1.2+k*.1,'rise');pb(.24,DECKY-.3,.24,darkWoodM,x,.3+(DECKY-.3)/2,z,1.4+k*.18,'rise');});
// vigas, mãos-francesas
for(const z of[-2.2,2.2])pb(5.2,.24,.16,darkWoodM,0,DECKY-.32,z,2.6+(z>0?.2:0));
for(const x of[-2.2,2.2])pb(.16,.24,5.2,darkWoodM,x,DECKY-.32,0,2.9+(x>0?.15:0));
[[-2.2,-2.2,1],[2.2,-2.2,-1],[-2.2,2.2,1],[2.2,2.2,-1]].forEach(([x,z,s],k)=>{for(const ax of['x','z']){const m=box(.08,1.0,.08,darkWoodM,A3,ax==='x'?x+s*.35:x,DECKY-.75,ax==='z'?z-Math.sign(z)*.35:z);if(ax==='x')m.rotation.z=s*.75;else m.rotation.x=Math.sign(z)*.75;piece(m,3.1+k*.08);}});
// barrotes
for(let k=0;k<9;k++){const x=-2.0+k*.5;if(Math.abs(x)<1.0){pb(.08,.16,1.5,plankM2,x,DECKY-.13,-1.75,3.4+k*.08);pb(.08,.16,1.5,plankM2,x,DECKY-.13,1.75,3.45+k*.08);}else pb(.08,.16,5.0,plankM2,x,DECKY-.13,0,3.4+k*.08);}
// piso com vão ao redor do tronco (folga)
for(let k=0;k<19;k++){const x=-2.4+k*.267;const mat=k%2?newWoodM:plankM;if(Math.abs(x)<1.0){pb(.25,.05,1.5,mat,x,DECKY-.02,-1.75,4.6+k*.07);pb(.25,.05,1.5,mat,x,DECKY-.02,1.75,4.62+k*.07);}else pb(.25,.05,5.0,mat,x,DECKY-.02,0,4.6+k*.07);}
// paredes da casinha (painéis com janela) — 4 lados
const wallM=std({map:woodT('#e9d3a8'),roughness:.8}),trimM=std({color:'#f4efe4',roughness:.6}),glassM=new THREE.MeshStandardMaterial({color:'#9fd0f0',roughness:.1,metalness:.2,emissive:'#ffc870',emissiveIntensity:0});
const WINDOWS=[];
function wallSide(axis,s,t0){// axis 'x' parede em x=s*CAB; 'z' parede em z=s*CAB
  const L=CAB*2,y0=DECKY+.02;const P=(w,h,a,b)=>axis==='z'?[w,h,.1,a,y0+b,s*CAB]:[.1,h,w,s*CAB,y0+b,a];
  const door=axis==='z'&&s>0;const parts=door?[[.85,WALLH,-1.02,WALLH/2],[.85,WALLH,1.02,WALLH/2],[1.2,.5,0,WALLH-.25]]:[[.55,WALLH,-1.2,WALLH/2],[.55,WALLH,1.2,WALLH/2],[1.8,.75,0,.375],[1.8,.55,0,WALLH-.275]];
  parts.forEach((q,k)=>{const a=P(q[0],q[1],q[2],q[3]);pb(a[0],a[1],a[2],wallM,a[3],a[4],a[5],t0+k*.1);});
  if(!door){const a=P(1.8,.9,0,1.2);const g=pb(a[0]*(axis==='z'?1:1),a[1],axis==='z'?.04:a[2],glassM,a[3],a[4],a[5],t0+.6);if(axis!=='z'){g.scale.x=.4;}WINDOWS.push(g);
    const f1=P(1.86,.08,0,.78),f2=P(1.86,.08,0,1.66),f3=P(.08,.9,0,1.2);for(const f of[f1,f2,f3]){const m=pb(f[0],f[1],axis==='z'?.14:f[2]+.04,trimM,f[3]+(axis==='z'?0:s*.02),f[4],f[5]+(axis==='z'?s*.02:0),t0+.7);}}
  else{const dr=pb(.9,1.7,.06,std({color:'#c8503c',roughness:.6}),0,y0+.85,s*CAB+.02,t0+.5);}}
wallSide('z',-1,6.2);wallSide('x',1,6.5);wallSide('x',-1,6.8);wallSide('z',1,7.1);
// telhado (4 águas) com abertura para o tronco
const roofM=std({map:ctex(256,256,(g,w,h)=>{g.fillStyle='#b4553f';g.fillRect(0,0,w,h);for(let y=0;y<h;y+=20){g.fillStyle='rgba(0,0,0,.25)';g.fillRect(0,y+16,w,4);for(let x=(y/20%2)*14;x<w;x+=28){g.fillStyle='rgba(0,0,0,.15)';g.fillRect(x,y,2,18);}}noise(g,w,h,20);},[3,3]),side:THREE.DoubleSide,roughness:.75});
{const RY=DECKY+WALLH+.02,O=CAB+.45,TOP=RY+1.25,IN=.75;for(let k=0;k<4;k++){const a=k*Math.PI/2;const geo=new THREE.BufferGeometry();const c=Math.cos(a),s=Math.sin(a);const p=(u2,v2,y)=>[u2*c-v2*s,y,u2*s+v2*c];
  const v=[...p(O,-O,RY),...p(O,O,RY),...p(IN,IN,TOP),...p(O,-O,RY),...p(IN,IN,TOP),...p(IN,-IN,TOP)];geo.setAttribute('position',new THREE.Float32BufferAttribute(v,3));geo.setAttribute('uv',new THREE.Float32BufferAttribute([0,0,1,0,.8,1,0,0,.8,1,.2,1],2));geo.computeVertexNormals();
  const m=new THREE.Mesh(geo,roofM);A3.add(m);piece(m,8.2+k*.2);}
 for(let k=0;k<4;k++){const a=k*Math.PI/2;const m=box(2*(CAB+.45),.08,.1,darkWoodM,A3,Math.cos(a)*(CAB+.45),RY,Math.sin(a)*(CAB+.45));m.rotation.y=-a+Math.PI/2;piece(m,8.1);}}
// guarda-corpo (com vão da escada em +z) e escada
for(let k=0;k<=12;k++){const v=-HALF+k*(2*HALF/12);for(const[x,z]of[[v,-HALF],[v,HALF],[-HALF,v],[HALF,v]]){if(z===HALF&&x>.2&&x<1.6)continue;pb(.07,.9,.07,darkWoodM,x,DECKY+.45,z,9.4+k*.04);}}
for(const[w,d,x,z]of[[5.0,.08,0,-HALF],[.08,5.0,-HALF,0],[.08,5.0,HALF,0],[2.6,.08,-1.2,HALF],[.9,.08,2.05,HALF]])pb(w,.07,d,newWoodM,x,DECKY+.92,z,9.9);
const STAIR=[];{const n=12,run=4.2;for(let k=0;k<n;k++){const y=DECKY-(k+1)*DECKY/(n+.5),z=HALF+.15+k*run/n;STAIR.push(pb(1.3,.06,.32,newWoodM,.9,y,z,9.6+k*.06));}
 for(const x of[.28,1.52]){const len=Math.hypot(run,DECKY);const m=box(.08,.26,len,darkWoodM,A3,x,DECKY/2-.05,HALF+run/2);m.rotation.x=Math.atan2(DECKY,run);piece(m,9.55);}}
// decoração final (só aparece na cena 7): luzinhas, lanterna, vasos, bandeira, balanço
const DECOR=new THREE.Group();A3.add(DECOR);const BULBS=[];
for(let k=0;k<44;k++){const per=k/44,side=Math.floor(per*4),q=per*4-side,v=-HALF+q*2*HALF;const[x,z]=[[v,-HALF],[HALF,v],[-v,HALF],[-HALF,-v]][side];const b=new THREE.Mesh(new THREE.SphereGeometry(.045,8,6),new THREE.MeshBasicMaterial({color:['#ffd27a','#ff9ac8','#9fe0ff','#ffd27a'][k%4],toneMapped:false}));b.position.set(x,DECKY+1.0-Math.abs(Math.sin(q*Math.PI*3))*.08,z);DECOR.add(b);BULBS.push(b);}
const LANT=new THREE.PointLight('#ffc070',0,6,1.6);LANT.position.set(.75,DECKY+1.9,CAB+.25);DECOR.add(LANT);M(new THREE.SphereGeometry(.1,12,8),new THREE.MeshBasicMaterial({color:new THREE.Color(2.2,1.6,.8),toneMapped:false}),DECOR,.75,DECKY+1.9,CAB+.25);
for(const[x,z]of[[-1.9,2.1],[1.95,-2.1],[-2.1,-1.9]]){cyl(.18,.14,.25,std({color:'#c46a43'}),DECOR,x,DECKY+.13,z);for(let k=0;k<6;k++)M(new THREE.SphereGeometry(.07,8,6),std({color:['#ff5a8a','#ffd23f','#ffffff'][k%3]}),DECOR,x+(rnd(k+x)-.5)*.25,DECKY+.32+rnd(k)*.08,z+(rnd(k+z)-.5)*.25);}
const FLAG=new THREE.Group();FLAG.position.set(CAB+.4,DECKY+WALLH,CAB+.4);DECOR.add(FLAG);cyl(.02,.02,1.4,metalM,FLAG,0,.7,0,6);const FLAGM=M(new THREE.PlaneGeometry(.6,.38,8,1),std({color:'#ffd23f',side:THREE.DoubleSide}),FLAG,.32,1.2,0);FLAGM.userData.base=FLAGM.geometry.attributes.position.array.slice();
const SWING=new THREE.Group();SWING.position.set(2.95,7.3,1.25);DECOR.add(SWING);for(const z of[-.25,.25])cyl(.012,.012,6.0,std({color:'#e8dcc4'}),SWING,0,-3.0,z,4);box(.3,.05,.6,newWoodM,SWING,0,-6.0,0);
// janelas acendem, lanterna, bandeira e balanço
function a3Decor(t,on){DECOR.visible=on;WINDOWS.forEach(w=>w.material.emissiveIntensity=on?.6:0);LANT.intensity=on?6:0;BULBS.forEach((b,i)=>{const k=on?(.7+.3*Math.sin(t*3+i)):0;b.material.color.setRGB(...(['#ffd27a','#ff9ac8','#9fe0ff','#ffd27a'][i%4].match(/\w\w/g).map(h=>parseInt(h,16)/255*1.6*k+.05)));});
  SWING.rotation.x=Math.sin(t*1.6)*.35;const p=FLAGM.geometry.attributes.position,b=FLAGM.userData.base;for(let i=0;i<p.count;i++){const x=b[i*3];p.setZ(i,Math.sin(t*6+x*10)*.06*(x+.3));}p.needsUpdate=true;}
// estado da construção 3 no tempo local da cena 6 (u grande = pronta)
function a3State(u,wire=true){let anyWire=false;PCS.forEach(m=>{const t0=m.userData.t0,e=m.userData.wire;m.visible=u>=t0;
  e.visible=wire&&u<t0&&u>.15;if(e.visible){anyWire=true;e.material.opacity=.85;}
  if(m.visible){const k=cl((u-t0)/.35);if(m.userData.kind==='rise'){m.scale.y=Math.max(.01,spring(u,t0,10,6));m.position.y=m.userData.home.y-(1-Math.min(1,m.scale.y))*((m.geometry.parameters&&m.geometry.parameters.height)||0)/2;}
    else{m.scale.setScalar(1);m.position.y=m.userData.home.y+(1-spring(u,t0,11,7))*1.0*(k<1?1:0);}}});
  wireM.opacity=.55+.35*Math.sin(u*8);return anyWire;}

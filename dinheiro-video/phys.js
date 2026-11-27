// ================= FÍSICA DAS NOTAS =================
// Partículas determinísticas: cada quadro re-simula a cena desde u=0 com passo fixo (1/60 s), então
// qualquer quadro pode ser renderizado sozinho (render em pedaços paralelos) e o resultado é idêntico.
// Nota = gravidade + arrasto quadrático (terminal ~1,6 m/s) + balanço de folha + giro; quica e assenta
// numa pilha (mapa de altura em grade) que cresce; ricocheteia em esferas (cabeças); vento e impulsos.
const PN=700,PDT=1/60,GRAV=9.8,KD=3.8;
function billTex(c1,c2,txt){return ctex(256,128,(g,w,h)=>{g.fillStyle=c1;g.fillRect(0,0,w,h);g.strokeStyle=c2;g.lineWidth=7;g.strokeRect(6,6,w-12,h-12);g.beginPath();g.arc(w*.7,h/2,30,0,7);g.stroke();g.fillStyle=c2;g.font='52px Anton';g.textAlign='center';g.fillText(txt,w*.3,h/2+18);for(let i=0;i<6;i++){g.globalAlpha=.25;g.fillRect(20,20+i*15,40+R()*50,3);}g.globalAlpha=1;});}
const PMAT=[std({map:billTex('#8fd08a','#3f7a3f','$'),side:THREE.DoubleSide,roughness:.7}),
            std({map:billTex('#f2d48a','#8a5a2a','M'),side:THREE.DoubleSide,roughness:.7}),
            std({map:ctex(256,192,(g,w,h)=>{g.fillStyle='#fbfaf5';g.fillRect(0,0,w,h);g.fillStyle='#d9483b';g.fillRect(0,0,w,46);g.fillStyle='#fff';g.font='34px Anton';g.textAlign='center';g.fillText('1993',w/2,36);g.fillStyle='#333';g.font='80px Anton';g.fillText(String(1+Math.floor(R()*28)),w/2,140);g.strokeStyle='#bbb';for(let i=0;i<5;i++){g.beginPath();g.moveTo(20,160+i*6);g.lineTo(w-20,160+i*6);g.stroke();}}),side:THREE.DoubleSide,roughness:.8})];
const PMESH=PMAT.map((m,k)=>{const im=new THREE.InstancedMesh(new THREE.PlaneGeometry(k===2?.26:.3,k===2?.2:.14),m,PN);im.castShadow=true;im.receiveShadow=true;im.frustumCulled=false;im.count=0;scene.add(im);return im;});
// o: {n, kind(0 nota,1 marco,2 calendário), spawn(i)->{t0,p:[x,y,z],v:[vx,vy,vz]}, floor(x,z), cell, thick, wind(τ)->[wx,wy,wz],
//     heads:[{t0,t1,c:V,r}], kicks:[{t,c:[x,z],r,s}] (pulo na pilha), lift:{t,p} (rajada que leva notas paradas)}
function simBills(o,u){
  const kd=o.kd??1.1,n=o.n,P=new Float32Array(n*3),Vv=new Float32Array(n*3),A=new Float32Array(n*3),W=new Float32Array(n*3),S=new Uint8Array(n),SPW=[];
  const cell=o.cell||.12,thick=o.thick||.012,HM=new Map(),key=(x,z)=>Math.round(x/cell)+','+Math.round(z/cell);
  const hAt=(x,z)=>(HM.get(key(x,z))||0)+(o.floor?o.floor(x,z):0);
  const addH=(x,z,d)=>{for(const[dx,dz,k]of[[0,0,1],[1,0,.35],[-1,0,.35],[0,1,.35],[0,-1,.35]]){const kk=key(x+dx*cell,z+dz*cell);HM.set(kk,Math.max(0,(HM.get(kk)||0)+d*k));}};
  for(let i=0;i<n;i++)SPW.push(o.spawn(i));
  const steps=Math.floor(Math.max(0,u)/PDT);const kicked=new Set();
  for(let s=0;s<=steps;s++){const tau=s*PDT,wv=o.wind?o.wind(tau):[0,0,0];
    if(o.kicks)for(const k of o.kicks)if(!kicked.has(k)&&tau>=k.t){kicked.add(k);for(let i=0;i<n;i++){if(S[i]!==2)continue;const dx=P[i*3]-k.c[0],dz=P[i*3+2]-k.c[1],d=Math.hypot(dx,dz);if(d>k.r)continue;S[i]=1;addH(P[i*3],P[i*3+2],-thick);const q=(1-d/k.r)*k.s*(.6+rnd(i+77)*.7);Vv[i*3]=dx/(d+.01)*q*.6;Vv[i*3+1]=q;Vv[i*3+2]=dz/(d+.01)*q*.6;W[i*3]=rnd(i+5)*14-7;W[i*3+2]=rnd(i+6)*14-7;}}
    if(o.lift&&tau>=o.lift.t&&tau<o.lift.t+PDT*1.5)for(let i=0;i<n;i++)if(S[i]===2&&rnd(i+91)<o.lift.p){S[i]=1;addH(P[i*3],P[i*3+2],-thick);Vv[i*3]=wv[0]*.6;Vv[i*3+1]=1.5+rnd(i+92)*3;Vv[i*3+2]=wv[2]*.6;W[i*3]=rnd(i+5)*16-8;}
    for(let i=0;i<n;i++){const sp=SPW[i];
      if(S[i]===0){if(tau>=sp.t0){S[i]=1;P.set(sp.p,i*3);Vv.set(sp.v,i*3);A[i*3]=rnd(i)*6;A[i*3+1]=rnd(i+1)*6;A[i*3+2]=rnd(i+2)*6;W[i*3]=(rnd(i+3)-.5)*16;W[i*3+1]=(rnd(i+4)-.5)*10;W[i*3+2]=(rnd(i+5)-.5)*16;}else continue;}
      if(S[i]===2)continue;const j=i*3;
      let vx=Vv[j]-wv[0],vy=Vv[j+1]-wv[1],vz=Vv[j+2]-wv[2];const sp2=Math.hypot(vx,vy,vz);
      Vv[j]-=kd*vx*sp2*PDT;Vv[j+1]-=kd*vy*sp2*PDT+GRAV*PDT;Vv[j+2]-=kd*vz*sp2*PDT;
      // balanço de folha: força lateral oscilante na direção do giro da nota
      const ph=tau*(4+rnd(i+8)*3)+rnd(i+9)*7,fl=(2.2+rnd(i+10)*1.5)*Math.min(1,sp2+.4);Vv[j]+=Math.cos(A[j+1])*Math.sin(ph)*fl*PDT;Vv[j+2]+=Math.sin(A[j+1])*Math.sin(ph)*fl*PDT;
      P[j]+=Vv[j]*PDT;P[j+1]+=Vv[j+1]*PDT;P[j+2]+=Vv[j+2]*PDT;A[j]+=W[j]*PDT;A[j+1]+=W[j+1]*PDT;A[j+2]+=W[j+2]*PDT;
      if(o.heads)for(const hd of o.heads){if(tau<hd.t0||tau>hd.t1)continue;const c=typeof hd.c==='function'?hd.c(tau):hd.c;const dx=P[j]-c.x,dy=P[j+1]-c.y,dz=P[j+2]-c.z,d=Math.hypot(dx,dy,dz);if(d<hd.r&&d>1e-4){const nx=dx/d,ny=dy/d,nz=dz/d,vn=Vv[j]*nx+Vv[j+1]*ny+Vv[j+2]*nz;P[j]=c.x+nx*hd.r;P[j+1]=c.y+ny*hd.r;P[j+2]=c.z+nz*hd.r;if(vn<0){Vv[j]-=1.4*vn*nx;Vv[j+1]-=1.4*vn*ny;Vv[j+2]-=1.4*vn*nz;}W[j]*=1.3;}}
      const h=hAt(P[j],P[j+2]);
      if(P[j+1]<=h){P[j+1]=h;if(Vv[j+1]<-1.6){Vv[j+1]*=-.22;Vv[j]*=.5;Vv[j+2]*=.5;W[j]*=.5;}else{S[i]=2;Vv[j]=Vv[j+1]=Vv[j+2]=0;P[j+1]=h+thick*.5;addH(P[j],P[j+2],thick);A[j]=-Math.PI/2+(rnd(i+11)-.5)*.25;A[j+2]=(rnd(i+12)-.5)*.25;}}}}
  return {P,A,S,n,hAt};
}
const _po=new THREE.Object3D();
function drawBills(sim,kind=0){const im=PMESH[kind];let c=0;for(let i=0;i<sim.n;i++){if(sim.S[i]===0)continue;const j=i*3;_po.position.set(sim.P[j],sim.P[j+1],sim.P[j+2]);_po.rotation.set(sim.A[j],sim.A[j+1],sim.A[j+2]);_po.scale.setScalar(1);_po.updateMatrix();im.setMatrixAt(c++,_po.matrix);}im.count=c;im.instanceMatrix.needsUpdate=true;return c;}
// montanha de dinheiro (domo texturizado): altura no ponto (x,z)
const moneyT=ctex(512,512,(g,w,h)=>{g.fillStyle='#6fae6a';g.fillRect(0,0,w,h);for(let i=0;i<260;i++){g.save();g.translate(R()*w,R()*h);g.rotate(R()*3);g.fillStyle=['#8fd08a','#7cc477','#a4dc9e'][i%3];g.fillRect(-36,-17,72,34);g.strokeStyle='#3f7a3f';g.lineWidth=3;g.strokeRect(-32,-13,64,26);g.restore();}},[3,3]);
const MOUND=new THREE.Mesh(new THREE.SphereGeometry(1,40,20,0,TAU,0,Math.PI/2),std({map:moneyT,roughness:.8}));MOUND.castShadow=MOUND.receiveShadow=true;TOWN.add(MOUND);MOUND.visible=false;
function moundH(x,z){if(!MOUND.visible)return 0;const m=MOUND,dx=(x-m.position.x)/m.scale.x,dz=(z-m.position.z)/m.scale.z,q=1-dx*dx-dz*dz;return q>0?Math.sqrt(q)*m.scale.y:0;}
// chão da rua: calçadas mais altas
function streetFloor(x,z){return (Math.abs(z)>3&&Math.abs(z)<4.6)?.12:.01;}

// ================= OBJETOS NOVOS =================
// máquina de imprimir dinheiro (no meio da rua)
const PRINT=new THREE.Group();PRINT.position.set(-3.4,0,.2);TOWN.add(PRINT);const PR={};
{const body=std({color:'#3d6b5a',roughness:.5,metalness:.3}),dark=std({color:'#23262c',metalness:.6,roughness:.4}),brass=std({color:'#c9a24a',metalness:.8,roughness:.3});
 PR.body=box(2.2,1.9,1.5,body,PRINT,0,.95+.2,0);PR.body.userData.solid=true;box(2.4,.2,1.7,dark,PRINT,0,.1,0);
 box(1.6,.12,.5,dark,PRINT,0,1.75,.85);PR.rollers=[];for(let i=0;i<2;i++){const r=cyl(.11,.11,1.5,std({color:'#b0b4ba',metalness:.8,roughness:.25}),PRINT,0,1.92+i*.2,.82,20);r.rotation.z=Math.PI/2;PR.rollers.push(r);}
 PR.gears=[];for(const[x,y,rr]of[[-1.12,1.3,.32],[-1.12,.75,.22],[1.12,1.1,.38]]){const g=new THREE.Mesh(new THREE.CylinderGeometry(rr,rr,.08,12),brass);g.rotation.z=Math.PI/2;g.position.set(x,y,0);g.castShadow=true;PRINT.add(g);PR.gears.push(g);for(let k=0;k<12;k++){const tth=box(.09,.1,.09,brass,g,0,0,0);const a=k/12*TAU;tth.position.set(0,Math.cos(a)*rr,Math.sin(a)*rr);}}
 PR.chim=cyl(.16,.2,1.0,dark,PRINT,.6,2.4,-.3,14);PR.lamp=M(new THREE.SphereGeometry(.09,12,8),new THREE.MeshBasicMaterial({color:new THREE.Color(2,.4,.3),toneMapped:false}),PRINT,-.7,2.12,.5);
 const signT=ctex(512,128,(g,w,h)=>{g.fillStyle='#f2e8d0';g.fillRect(0,0,w,h);g.strokeStyle='#23262c';g.lineWidth=8;g.strokeRect(4,4,w-8,h-8);g.fillStyle='#23262c';g.font='64px Anton';g.textAlign='center';g.fillText('MÁQUINA DE DINHEIRO',w/2,90);});
 M(new THREE.PlaneGeometry(1.8,.45),std({map:signT}),PRINT,0,1.25,.76,false);
 PR.puffs=[];for(let i=0;i<8;i++){const m=new THREE.Mesh(new THREE.PlaneGeometry(1,1),new THREE.MeshBasicMaterial({map:soft,color:'#e8e8ec',transparent:true,depthWrite:false,opacity:.5}));PRINT.add(m);PR.puffs.push(m);}}
const SLOT=V(PRINT.position.x,2.0,PRINT.position.z+.95);
function animPrinter(t,on){const sh=on?Math.sin(t*41)*.012:0;PR.body.position.x=sh;PR.rollers.forEach((r,i)=>r.rotation.x=t*(on?14:0)*(i?-1:1));PR.gears.forEach((g,i)=>g.rotation.x=t*(on?3+i:0)*(i%2?-1:1));PR.lamp.material.color.setRGB(on&&Math.sin(t*12)>0?2.4:.4,on?.4:.2,.3);
  PR.puffs.forEach((m,i)=>{const ph=(t*.5+i/8)%1;m.position.set(.6+Math.sin(t+i)*.15,2.9+ph*2.2,-.3);m.scale.setScalar(.4+ph*1.6);m.material.opacity=on?.45*(1-ph):0;m.lookAt(cam.position);});}
// carrinho de mão (1923)
const WB=new THREE.Group();TOWN.add(WB);WB.visible=false;
{const wd=std({color:'#7a5436',roughness:.8}),ir=std({color:'#3a3a40',metalness:.5});
 box(1.0,.06,.62,wd,WB,0,.42,0);box(1.0,.32,.05,wd,WB,0,.58,.3);box(1.0,.32,.05,wd,WB,0,.58,-.3);box(.05,.32,.62,wd,WB,.5,.58,0);box(.05,.4,.62,wd,WB,-.5,.62,0);
 WB.userData.wheel=cyl(.2,.2,.08,ir,WB,.68,.2,0,20);WB.userData.wheel.rotation.x=Math.PI/2;for(const z of[-.22,.22]){const hnd=box(1.0,.05,.05,wd,WB,-.85,.55,z);hnd.rotation.z=.2;box(.05,.38,.05,ir,WB,-.35,.2,z);}
 const mm=new THREE.Mesh(new THREE.SphereGeometry(1,24,12,0,TAU,0,Math.PI/2),std({map:moneyT,roughness:.8}));mm.scale.set(.5,.32,.3);mm.position.set(0,.72,0);mm.castShadow=true;WB.add(mm);}
// pão (3D no balcão) e etiquetas/placa de preço
const BREAD=new THREE.Group();BREAD.position.set(-.15,1.06,-7.25);TOWN.add(BREAD);
{const bm=std({color:'#d9944a',roughness:.6});const b=M(new THREE.SphereGeometry(1,24,14),bm,BREAD,0,.07,0);b.scale.set(.2,.08,.1);for(let k=0;k<3;k++){const c=box(.02,.012,.12,std({color:'#f2d0a0'}),BREAD,-.08+k*.08,.145,0);c.rotation.y=.5;}}
const PRICE=new THREE.Group();PRICE.position.set(.35,1.06,-7.2);TOWN.add(PRICE);
const PRCV=document.createElement('canvas');PRCV.width=512;PRCV.height=300;const PRT=new THREE.CanvasTexture(PRCV);PRT.colorSpace=THREE.SRGBColorSpace;let PRLAST='';
function setPrice(txt,col='#c8322e'){if(txt===PRLAST)return;PRLAST=txt;const g=PRCV.getContext('2d');g.fillStyle='#fbfaf0';g.fillRect(0,0,512,300);g.strokeStyle='#23262c';g.lineWidth=12;g.strokeRect(6,6,500,288);g.fillStyle='#23262c';g.font='70px Anton';g.textAlign='center';g.fillText('PÃO',256,90);g.fillStyle=col;let fs=150;g.font=fs+'px Anton';while(g.measureText(txt).width>470&&fs>40){fs-=6;g.font=fs+'px Anton';}g.fillText(txt,256,230);PRT.needsUpdate=true;}
{box(.03,.3,.03,std({color:'#555'}),PRICE,0,.15,0);const p=M(new THREE.PlaneGeometry(.5,.3),new THREE.MeshStandardMaterial({map:PRT,roughness:.6}),PRICE,0,.42,.02,false);setPrice('R$ 1');}
// nota gigante (100 trilhões) — cai como folha
const GIANT=new THREE.Mesh(new THREE.PlaneGeometry(2.6,1.2),std({map:ctex(1024,472,(g,w,h)=>{g.fillStyle='#c9b0e8';g.fillRect(0,0,w,h);g.strokeStyle='#4a2a7a';g.lineWidth=14;g.strokeRect(14,14,w-28,h-28);g.strokeRect(40,40,w-80,h-80);g.fillStyle='#4a2a7a';g.font='150px Anton';g.textAlign='center';g.fillText('100',w*.3,h*.58);g.font='70px Anton';g.fillText('TRILHÕES',w*.3,h*.8);g.beginPath();g.arc(w*.74,h*.5,120,0,7);g.lineWidth=8;g.stroke();g.font='120px Anton';g.fillText('$',w*.74,h*.62);}),side:THREE.DoubleSide,roughness:.7}));GIANT.castShadow=true;TOWN.add(GIANT);GIANT.visible=false;
// etiquetas nos produtos (prateleira do mercadinho)
const TAGS=[];{const tt=ctex(128,80,(g,w,h)=>{g.fillStyle='#ff9a3a';g.beginPath();g.moveTo(0,0);g.lineTo(w-20,0);g.lineTo(w,h/2);g.lineTo(w-20,h);g.lineTo(0,h);g.fill();g.fillStyle='#fff';g.font='44px Anton';g.fillText('R$',14,56);});
 for(let s=0;s<3;s++)for(let k=0;k<9;k++){const m=new THREE.Mesh(new THREE.PlaneGeometry(.13,.08),new THREE.MeshBasicMaterial({map:tt,transparent:true,side:THREE.DoubleSide}));m.position.set(-1.9+k*.47,.72+s*.55,-9.4);m.userData.x=m.position.x;m.userData.s=s;TOWN.add(m);TAGS.push(m);}}
const priceGunSVG=()=>`<g transform="translate(0 128) rotate(-70)"><rect x="-22" y="-10" width="44" height="120" rx="10" fill="#ff9a3a" stroke="#a8562a" stroke-width="5"/><rect x="-40" y="-60" width="120" height="60" rx="12" fill="#ff9a3a" stroke="#a8562a" stroke-width="5"/><rect x="60" y="-48" width="40" height="36" fill="#fff" stroke="#a8562a" stroke-width="4"/></g>`;
const breadSVG=()=>`<g transform="translate(0 128) rotate(-10)"><ellipse cx="0" cy="-20" rx="80" ry="42" fill="#d9944a" stroke="#a8652a" stroke-width="6"/><path d="M-40 -40 l14 34 M-4 -46 l14 34 M32 -40 l14 30" stroke="#f2d0a0" stroke-width="8" stroke-linecap="round"/></g>`;
const SOLIDS=[];

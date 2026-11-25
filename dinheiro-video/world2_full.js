// casa da Dona Cida exatamente em x=0 (do outro lado da rua)
POSTS.forEach(p=>{if(p.position.z>0&&Math.abs(p.position.x)<3)p.visible=false;});HOUSES.forEach(h=>{if(h.z>0&&h.z<20&&Math.abs(h.x)<3){h.g.position.x=HX;h.x=HX;}if(h.z<0&&h.z>-20&&Math.abs(h.x)<5)h.g.visible=false;});
SKY.tex.night=SKY.mk([[0,'#070b22'],[.3,'#141c44'],[.48,'#2c3566'],[.5,'#3a4270'],[1,'#3a4270']]);
SKY.tex.morning=SKY.mk([[0,'#4f86d6'],[.3,'#9cc4ee'],[.46,'#ffd9b8'],[.5,'#ffe6c8'],[1,'#ffe6c8']]);
const STARS=new THREE.Points(new THREE.BufferGeometry().setAttribute('position',new THREE.BufferAttribute(Float32Array.from({length:1800},(_,i)=>{const k=i%3,n=Math.floor(i/3),a=rnd(n)*TAU,b=.08+rnd(n+3)*1.3;return k===0?Math.cos(a)*Math.cos(b)*650:k===1?Math.sin(b)*650:Math.sin(a)*Math.cos(b)*650;}),3)),new THREE.PointsMaterial({color:'#fffbe8',size:2.2,sizeAttenuation:false,fog:false,transparent:true,opacity:.9}));TOWN.add(STARS);
// banco de praça na calçada da frente
const BENCH=new THREE.Group();BENCH.position.set(1.6,0,4.35);TOWN.add(BENCH);
{const wd=std({color:'#8a5a36',roughness:.7}),ir=std({color:'#2f3338',metalness:.6,roughness:.4});
 for(let i=0;i<3;i++)box(1.6,.04,.12,wd,BENCH,0,.45,-.14+i*.14);for(let i=0;i<2;i++)box(1.6,.1,.03,wd,BENCH,0,.62+i*.14,.2);
 for(const x of[-.7,.7]){box(.05,.45,.4,ir,BENCH,x,.225,0);box(.05,.4,.05,ir,BENCH,x,.62,.2);}}
// ---------- mercadinho de esquina ----------
const SHOP=new THREE.Group();SHOP.position.set(0,0,-8.3);TOWN.add(SHOP);const SH={};
{const wallT=ctex(512,256,(g,w,h)=>{g.fillStyle='#f2dfb8';g.fillRect(0,0,w,h);noise(g,w,h,14);blotch(g,w,h,20,'rgba(160,110,60,A)',.12,60);});
 const wm=std({map:wallT}),wd=std({color:'#6b4330',roughness:.7}),dk=std({color:'#3a2a20'});
 box(5,.25,3.4,std({color:'#b9b2a6'}),SHOP,0,.125,0);
 box(5,3.2,.2,wm,SHOP,0,1.6,-1.6);box(.3,3.2,3.4,wm,SHOP,-2.35,1.6,0);box(.3,3.2,3.4,wm,SHOP,2.35,1.6,0);
 box(5,.5,.3,wm,SHOP,0,2.95,1.6);box(5,.12,3.6,std({color:'#e9e1cf'}),SHOP,0,3.26,0);
 // letreiro
 const signT=ctex(1024,200,(g,w,h)=>{g.fillStyle='#2a9d8f';g.fillRect(0,0,w,h);g.strokeStyle='#f2e8d0';g.lineWidth=12;g.strokeRect(10,10,w-20,h-20);g.fillStyle='#fff6dc';g.font='120px Anton';g.textAlign='center';g.fillText('MERCADINHO',w/2,150);});
 const sg=M(new THREE.PlaneGeometry(3.6,.7),std({map:signT,roughness:.6}),SHOP,0,3.0,1.77);
 // toldo listrado
 const awT=ctex(512,64,(g,w,h)=>{for(let i=0;i<8;i++){g.fillStyle=i%2?'#f4efe4':'#d9483b';g.fillRect(i*64,0,64,h);}});
 const aw=M(new THREE.PlaneGeometry(5,1.3,1,1),std({map:awT,side:THREE.DoubleSide,roughness:.8}),SHOP,0,2.5,2.2);aw.rotation.x=-1.05;
 const scal=ctex(512,64,(g,w,h)=>{g.clearRect(0,0,w,h);for(let i=0;i<16;i++){g.fillStyle=Math.floor(i/2)%2?'#f4efe4':'#d9483b';g.beginPath();g.arc(i*32+16,0,16,0,Math.PI);g.fill();}});
 const sc=new THREE.Mesh(new THREE.PlaneGeometry(5,.22),new THREE.MeshStandardMaterial({map:scal,transparent:true,alphaTest:.4,side:THREE.DoubleSide}));sc.position.set(0,1.98,2.78);SHOP.add(sc);
 // prateleiras com produtos
 const cols=['#e2574c','#f2b33d','#3f6fb5','#4f9a5a','#8a5ab5','#e98a3a','#f4efe4'];
 for(let s=0;s<4;s++){box(4.2,.04,.4,wd,SHOP,0,.6+s*.55,-1.3);let x=-2;while(x<2){const w=.12+R()*.16,hh=.18+R()*.22;box(w,hh,.22,std({color:cols[Math.floor(R()*7)],roughness:.6}),SHOP,x+w/2,.62+s*.55+hh/2,-1.3);x+=w+.03;}}
 // balcão
 box(3.2,1.0,.6,wd,SHOP,0,.5,1.0);box(3.3,.06,.7,std({color:'#e9e1cf',roughness:.4}),SHOP,0,1.03,1.0);
 for(let i=0;i<6;i++)box(.45,.7,.02,dk,SHOP,-1.25+i*.5,.5,1.31);
 // caixa de frutas na frente
 for(const[x,c]of[[-1.9,'#e2574c'],[1.9,'#f2b33d']]){box(.6,.35,.45,std({color:'#b98a5a'}),SHOP,x,.42,2.1);for(let k=0;k<9;k++)M(new THREE.SphereGeometry(.07,10,8),std({color:c,roughness:.5}),SHOP,x-.2+(k%3)*.2,.64,2.0+Math.floor(k/3)*.1);}
 SH.lamp=new THREE.PointLight('#ffd9a0',0,7,1.5);SH.lamp.position.set(0,2.8,.6);SHOP.add(SH.lamp);
}
// maquininha de cartão no balcão
function screenTex(draw){return ctex(256,192,draw);}
const MAQ=new THREE.Group();MAQ.position.set(.55,1.06,-7.42);MAQ.rotation.y=-.3;TOWN.add(MAQ);
const MAQT={idle:screenTex((g,w,h)=>{g.fillStyle='#d8f0e0';g.fillRect(0,0,w,h);g.fillStyle='#2a5a3a';g.font='44px Anton';g.textAlign='center';g.fillText('APROXIME',w/2,85);g.fillText('O CARTÃO',w/2,140);}),
  deny:screenTex((g,w,h)=>{g.fillStyle='#ff3b3b';g.fillRect(0,0,w,h);g.fillStyle='#fff';g.font='54px Anton';g.textAlign='center';g.fillText('RECUSADO',w/2,90);g.font='30px Anton';g.fillText('SEM CONEXÃO',w/2,140);})};
{box(.12,.05,.22,std({color:'#26262e',roughness:.4}),MAQ,0,.025,0);const scr=new THREE.Mesh(new THREE.PlaneGeometry(.1,.075),new THREE.MeshBasicMaterial({map:MAQT.idle,toneMapped:false}));scr.rotation.x=-Math.PI/2+.25;scr.position.set(0,.053,-.05);MAQ.add(scr);MAQ.userData.scr=scr;
 for(let i=0;i<9;i++)box(.022,.008,.018,std({color:'#555'}),MAQ,-.03+(i%3)*.03,.052,.03+Math.floor(i/3)*.026);}
// cofrinho de porquinho + cacos + moedas
const PIG=new THREE.Group();PIG.position.set(-.45,1.06,-7.35);PIG.rotation.y=.4;TOWN.add(PIG);
const pinkM=std({color:'#f29ab4',roughness:.35});
{const b=M(new THREE.SphereGeometry(1,24,16),pinkM,PIG,0,.1,0);b.scale.set(.15,.1,.11);
 const sn=M(new THREE.CylinderGeometry(.035,.035,.04,16),pinkM,PIG,0,.11,.115);sn.rotation.x=Math.PI/2;
 for(const s of[-1,1]){M(new THREE.SphereGeometry(.009,8,6),std({color:'#5a2a3a'}),PIG,s*.012,.11,.137);M(new THREE.ConeGeometry(.03,.05,8),pinkM,PIG,s*.06,.2,.04);M(new THREE.SphereGeometry(.012,8,6),std({color:'#222'}),PIG,s*.05,.15,.09);}
 for(const[x,z]of[[-.07,-.05],[.07,-.05],[-.07,.05],[.07,.05]])cyl(.022,.022,.05,pinkM,PIG,x,.02,z,10);box(.05,.006,.012,std({color:'#222'}),PIG,0,.2,0);}
const SHARDS=[],COINS=[],coinM=std({color:'#e8b83a',metalness:.8,roughness:.3});
for(let i=0;i<10;i++){const m=M(new THREE.SphereGeometry(1,6,4,(i%5)/5*TAU,TAU/5,i<5?0:Math.PI/2,Math.PI/2),pinkM,TOWN);m.scale.set(.15,.1,.11);m.visible=false;m.userData.v=V((rnd(i)-.5)*1.6,.8+rnd(i+2)*1.2,(rnd(i+4)-.2)*1.2);m.userData.r=V(rnd(i+5)*12,rnd(i+6)*12,rnd(i+7)*12);SHARDS.push(m);}
for(let i=0;i<14;i++){const m=M(new THREE.CylinderGeometry(.025,.025,.008,16),coinM,TOWN);m.visible=false;m.userData.dx=(rnd(i+20)-.5)*.9;m.userData.dz=(rnd(i+21)-.5)*.4;m.userData.h=.15+rnd(i+22)*.3;COINS.push(m);}
// notas de dinheiro voando (instanced)
const billT=ctex(256,128,(g,w,h)=>{g.fillStyle='#8fd08a';g.fillRect(0,0,w,h);g.strokeStyle='#3f7a3f';g.lineWidth=8;g.strokeRect(6,6,w-12,h-12);g.beginPath();g.arc(w/2,h/2,34,0,7);g.stroke();g.fillStyle='#3f7a3f';g.font='54px Anton';g.textAlign='center';g.fillText('$',w/2,h/2+20);});
const BILLS=new THREE.InstancedMesh(new THREE.PlaneGeometry(.3,.15),std({map:billT,side:THREE.DoubleSide,roughness:.7}),80);BILLS.castShadow=true;BILLS.frustumCulled=false;TOWN.add(BILLS);BILLS.count=0;
// rádio, mapa, lanterna e lampião da varanda (cena da noite, quintal da Dona Cida)
const YARD=V(HX,0,7.6);
const RADIO=new THREE.Group();RADIO.position.set(HX+.15,0,7.0);RADIO.rotation.y=Math.PI+.2;TOWN.add(RADIO);
{box(.5,.3,.16,std({color:'#b4553f',roughness:.5}),RADIO,0,.17,0);const grill=ctex(128,128,g=>{g.fillStyle='#3a2a20';g.fillRect(0,0,128,128);g.fillStyle='#6b5040';for(let i=0;i<8;i++)for(let j=0;j<8;j++){g.beginPath();g.arc(8+i*16,8+j*16,5,0,7);g.fill();}});
 M(new THREE.CircleGeometry(.1,24),std({map:grill}),RADIO,-.1,.17,.081);M(new THREE.CylinderGeometry(.03,.03,.02,16),std({color:'#e9e1cf'}),RADIO,.13,.2,.085).rotation.x=Math.PI/2;box(.16,.05,.01,std({color:'#f2e8a0',emissive:'#f2c860',emissiveIntensity:.6}),RADIO,.13,.1,.081);
 box(.36,.03,.04,std({color:'#222'}),RADIO,0,.335,0);RADIO.userData.ant=cyl(.006,.006,1,std({color:'#cfd3d8',metalness:.8,roughness:.2}),RADIO,.2,.32,0,6);RADIO.userData.ant.geometry.translate(0,.5,0);RADIO.userData.ant.rotation.z=-.35;}
const mapT=ctex(512,360,(g,w,h)=>{g.fillStyle='#efe3c2';g.fillRect(0,0,w,h);g.fillStyle='#bfe0e8';g.beginPath();g.moveTo(0,250);g.bezierCurveTo(140,210,220,330,512,280);g.lineTo(512,360);g.lineTo(0,360);g.fill();g.fillStyle='#bcd6a0';for(let i=0;i<7;i++){g.beginPath();g.ellipse(60+R()*400,40+R()*160,30+R()*40,20+R()*30,R()*3,0,7);g.fill();}
 g.strokeStyle='#c8503c';g.lineWidth=7;g.beginPath();g.moveTo(30,30);g.bezierCurveTo(200,90,150,200,420,180);g.stroke();g.strokeStyle='#8a7a5a';g.lineWidth=3;for(let i=1;i<4;i++){g.beginPath();g.moveTo(i*w/4,0);g.lineTo(i*w/4,h);g.stroke();}g.beginPath();g.moveTo(0,h/2);g.lineTo(w,h/2);g.stroke();
 g.fillStyle='#c8503c';g.beginPath();g.arc(420,180,14,0,7);g.fill();g.fillStyle='#4a3a2a';g.font='34px Anton';g.fillText('N',470,50);});
const MAP=new THREE.Group();MAP.position.set(HX-.45,.03,6.9);TOWN.add(MAP);
const MAPM=M(new THREE.PlaneGeometry(.9,.63),std({map:mapT,side:THREE.DoubleSide,roughness:.9}),MAP);MAPM.rotation.x=-Math.PI/2;MAPM.castShadow=false;
const PORCH=new THREE.PointLight('#ffc070',0,9,1.4);PORCH.position.set(HX,2.4,8.2);TOWN.add(PORCH);
const PORCHB=M(new THREE.SphereGeometry(.09,12,8),new THREE.MeshBasicMaterial({color:'#fff0c0',toneMapped:false}),TOWN,HX,2.5,8.3);
const FLS=new THREE.SpotLight('#fff2c8',0,8,.42,.5,1.2);scene.add(FLS,FLS.target);
const STREETL=[];for(const x of[-6,6]){const l=new THREE.PointLight('#ffcf8a',0,14,1.4);l.position.set(x,4,4.4);TOWN.add(l);STREETL.push(l);}
// mesa de café da manhã na calçada (final)
const TABLE=new THREE.Group();TABLE.position.set(-.2,0,4.0);TOWN.add(TABLE);
{const clothT=ctex(256,256,g=>{for(let i=0;i<8;i++)for(let j=0;j<8;j++){g.fillStyle=(i+j)%2?'#d9483b':'#f4efe4';g.fillRect(i*32,j*32,32,32);}});
 box(1.6,.05,.8,std({map:clothT}),TABLE,0,.75,0);for(const[x,z]of[[-.7,-.32],[.7,-.32],[-.7,.32],[.7,.32]])box(.05,.75,.05,std({color:'#6b4330'}),TABLE,x,.375,z);
 const pie=cyl(.2,.17,.06,std({color:'#d9944a',roughness:.6}),TABLE,0,.8,0,24);cyl(.24,.22,.02,std({color:'#e9e3d6'}),TABLE,0,.78,0,24);
 for(const[x,c]of[[-.5,'#f2e8d0'],[.5,'#f2e8d0']]){cyl(.05,.04,.1,std({color:c,roughness:.4}),TABLE,x,.83,.15,14);}
 for(let k=0;k<5;k++)M(new THREE.SphereGeometry(.06,10,8),std({color:['#e2574c','#f2b33d','#4f9a5a'][k%3]}),TABLE,-.35+k*.17,.8,-.25);}
// bandeirinhas (final)
const FLAGS=new THREE.Group();TOWN.add(FLAGS);
{const fc=['#e2574c','#f2b33d','#3f6fb5','#4f9a5a','#8a5ab5'];for(let i=0;i<26;i++){const u=i/25,x=-5+u*10,y=3.9-Math.sin(u*Math.PI)*.6;const m=new THREE.Mesh(new THREE.BufferGeometry().setFromPoints([V(-.12,0,0),V(.12,0,0),V(0,-.28,0)]),new THREE.MeshBasicMaterial({color:fc[i%5],side:THREE.DoubleSide}));m.position.set(x,y,4.4);m.userData.y=y;FLAGS.add(m);}}

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
const GIANT_T=ctex(1024,472,(g,w,h)=>{g.fillStyle='#c9b0e8';g.fillRect(0,0,w,h);g.strokeStyle='#4a2a7a';g.lineWidth=14;g.strokeRect(14,14,w-28,h-28);g.strokeRect(40,40,w-80,h-80);g.fillStyle='#4a2a7a';g.font='150px Anton';g.textAlign='center';g.fillText('100',w*.3,h*.58);g.font='70px Anton';g.fillText('TRILHÕES',w*.3,h*.8);g.beginPath();g.arc(w*.74,h*.5,120,0,7);g.lineWidth=8;g.stroke();g.font='120px Anton';g.fillText('$',w*.74,h*.62);});const GIANT=new THREE.Mesh(new THREE.PlaneGeometry(2.6,1.2),std({map:GIANT_T,emissive:'#ffffff',emissiveMap:GIANT_T,emissiveIntensity:.45,side:THREE.DoubleSide,roughness:.7}));GIANT.castShadow=true;TOWN.add(GIANT);GIANT.visible=false;
// etiquetas nos produtos (prateleira do mercadinho)
const TAGS=[];{const tt=ctex(128,80,(g,w,h)=>{g.fillStyle='#ff9a3a';g.beginPath();g.moveTo(0,0);g.lineTo(w-20,0);g.lineTo(w,h/2);g.lineTo(w-20,h);g.lineTo(0,h);g.fill();g.fillStyle='#fff';g.font='44px Anton';g.fillText('R$',14,56);});
 for(let s=0;s<3;s++)for(let k=0;k<9;k++){const m=new THREE.Mesh(new THREE.PlaneGeometry(.13,.08),new THREE.MeshBasicMaterial({map:tt,transparent:true,side:THREE.DoubleSide}));m.position.set(-1.9+k*.47,.72+s*.55,-9.4);m.userData.x=m.position.x;m.userData.s=s;TOWN.add(m);TAGS.push(m);}}
const priceGunSVG=()=>`<g transform="translate(0 128) rotate(-70)"><rect x="-22" y="-10" width="44" height="120" rx="10" fill="#ff9a3a" stroke="#a8562a" stroke-width="5"/><rect x="-40" y="-60" width="120" height="60" rx="12" fill="#ff9a3a" stroke="#a8562a" stroke-width="5"/><rect x="60" y="-48" width="40" height="36" fill="#fff" stroke="#a8562a" stroke-width="4"/></g>`;
const breadSVG=()=>`<g transform="translate(0 128) rotate(-10)"><ellipse cx="0" cy="-20" rx="80" ry="42" fill="#d9944a" stroke="#a8652a" stroke-width="6"/><path d="M-40 -40 l14 34 M-4 -46 l14 34 M32 -40 l14 30" stroke="#f2d0a0" stroke-width="8" stroke-linecap="round"/></g>`;
const SOLIDS=[];

// ================= luzes, clima e pós =================
const hemi=new THREE.HemisphereLight('#dbeaff','#5d7a45',1.1);scene.add(hemi);
const sun=new THREE.DirectionalLight('#fff3dd',3);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);Object.assign(sun.shadow.camera,{left:-12,right:12,top:12,bottom:-12,near:1,far:120});sun.shadow.bias=-.0004;sun.shadow.normalBias=.03;sun.shadow.radius=3;scene.add(sun,sun.target);
const composer=new EffectComposer(renderer);composer.addPass(new RenderPass(scene,cam));
const bokeh=new BokehPass(scene,cam,{focus:3,aperture:.002,maxblur:.008});composer.addPass(bokeh);
const bloom=new UnrealBloomPass(new THREE.Vector2(540,960),.5,.6,.85);composer.addPass(bloom);composer.addPass(new OutputPass());
let SUNDIR=V(.45,.75,-.5).normalize(),MOOD='';
const TINT={day:'#ffffff',sunset:'#ffe2cc',night:'#a9b4dd',morning:'#fff0e4',ocean:'#cfeaff',space:'#ffffff'};
function mood(m){if(m===MOOD)return;MOOD=m;const T=true;
  TOWN.visible=T;RADIO.visible=m==='night';TABLE.visible=FLAGS.visible=m==='morning';sun.visible=T;
  scene.fog=null;scene.background=null;STARS.visible=m==='night';PORCH.intensity=0;PORCHB.visible=m==='night';STREETL.forEach(l=>l.intensity=m==='night'?18:0);FLS.intensity=0;
  POSTS.forEach(p=>{p.userData.bulb.material.emissiveIntensity=m==='night'?3:.2;});
  const sk=SKY.mesh.material;
  if(m==='day'){sk.map=SKY.tex.day;scene.fog=new THREE.Fog('#d5e6f7',40,260);hemi.color.set('#cfe3ff');hemi.groundColor.set('#5d7a45');hemi.intensity=1.15;sun.color.set('#fff3dd');sun.intensity=3.0;SUNDIR=V(.5,.7,-.5).normalize();renderer.toneMappingExposure=1.0;}
  if(m==='morning'){sk.map=SKY.tex.morning;scene.fog=new THREE.Fog('#f2dcc8',40,240);hemi.color.set('#ffe2c8');hemi.groundColor.set('#5d7a45');hemi.intensity=1.1;sun.color.set('#ffd2a0');sun.intensity=3.2;SUNDIR=V(-.8,.45,-.4).normalize();renderer.toneMappingExposure=1.05;}
  if(m==='sunset'){sk.map=SKY.tex.sunset;scene.fog=new THREE.Fog('#e9a27a',40,240);hemi.color.set('#ffc9a0');hemi.groundColor.set('#4a3a5a');hemi.intensity=.95;sun.color.set('#ffb070');sun.intensity=3.2;SUNDIR=V(.95,.2,-.25).normalize();renderer.toneMappingExposure=1.05;}
  if(m==='night'){sk.map=SKY.tex.night;scene.fog=new THREE.FogExp2('#141a36',.018);hemi.color.set('#4a5a9a');hemi.groundColor.set('#1a1e2a');hemi.intensity=.3;sun.color.set('#9fb4ff');sun.intensity=.35;SUNDIR=V(-.3,.8,.4).normalize();renderer.toneMappingExposure=1.0;PORCH.intensity=2.5;}
  if(m==='ocean'){scene.background=new THREE.Color('#0b4a6a');scene.fog=new THREE.FogExp2('#0e5a7a',.045);hemi.color.set('#9fe0ff');hemi.groundColor.set('#1a3a4a');hemi.intensity=1.0;renderer.toneMappingExposure=1.05;}
  if(m==='space'){scene.background=new THREE.Color('#02030a');hemi.intensity=.15;renderer.toneMappingExposure=1.0;}
  sk.needsUpdate=true;SKY.sunDisk.visible=SKY.sunGlow.visible=m==='day'||m==='morning'||m==='sunset';SKY.sunGlow.material.color.set(m==='morning'?'#ffb070':'#ffe9b0');
  CLOUDS.forEach(c=>{c.visible=m!=='night';c.material.color.set(m==='morning'?'#ffe0d0':'#ffffff');});
  SPRS.forEach(s=>s.mesh.material.color.set(TINT[m]||'#fff'));
  const ti=document.getElementById('tint');ti.setAttribute('fill',m==='night'?'#1c2556':'#5b3d7a');ti.setAttribute('opacity',m==='night'?'.72':'.08');
}
let WIND={w:.3,dx:1,dz:0};
function world(t,focus){
  if(TOWN.visible){SKY.mesh.position.copy(cam.position);STARS.position.copy(cam.position);SKY.sun.position.copy(cam.position).addScaledVector(SUNDIR,600);SKY.sun.lookAt(cam.position);
    CLOUDS.forEach((c,i)=>{const u=c.userData;c.position.set(cam.position.x+u.x+((t*(2+WIND.w*8)+i*30)%200)-100,u.y,cam.position.z+u.z);c.lookAt(cam.position);});
    GU.uTime.value=t;GU.uWind.value=WIND.w;GU.uDir.value.set(WIND.dx,WIND.dz).normalize();
    TREES.forEach(tr=>{const w=WIND.w,g=Math.sin(t*2.1+tr.ph)*.5+Math.sin(t*3.7+tr.ph*2)*.3;tr.g.rotation.z=-WIND.dx*(w*.09+g*w*.05);tr.fol.forEach((m,k)=>{m.position.set(m.userData.p.x+Math.sin(t*4+k)*.05*w+WIND.dx*w*.25,m.userData.p.y+Math.sin(t*3.3+k*2)*.04*w,m.userData.p.z+Math.cos(t*3.6+k)*.05*w);});});
    FLAGS.children.forEach((m,i)=>{m.rotation.x=Math.sin(t*4+i)*.3*(.3+WIND.w);m.position.y=m.userData.y+Math.sin(t*2+i*.5)*.02;});}
  if(false){const b=OC.bub.geometry.attributes.position,c=cam.position;for(let i=0;i<500;i++){b.setXYZ(i,c.x+(rnd(i)-.5)*24,((rnd(i+1)*20+t*(.8+rnd(i+2)))%20),c.z-600+(rnd(i+3)-.5)*24-4);}b.needsUpdate=true;
    OC.weeds.forEach((g,i)=>g.children.forEach((m,k)=>{m.rotation.z=Math.sin(t*1.2+i+k)*.12;}));OC.rays.forEach((r,i)=>r.material.opacity=.08+.05*Math.sin(t*.7+i));OC.surf.material.map.offset.set(t*.01,t*.007);}
  const f0=focus||V(0,0,0);sun.target.position.copy(f0);sun.position.copy(f0).addScaledVector(SUNDIR,60);
}
// ================= câmera e helpers =================
let FOV=50,FOVMUL=1,FOCUS=null,AP=.0015;
function lens(){cam.fov=FOV*FOVMUL;cam.updateProjectionMatrix();}
function camShot(v,d,p0,p1,l0,l1,o={}){const k=(o.e||ease)(cl(v/d)),sh=o.shake||[0,0],w=o.whip||0,t=o.t||v;
  const p=V(0,0,0).lerpVectors(p0,p1,k),l=V(0,0,0).lerpVectors(l0,l1,k);const side=V(0,0,0).subVectors(l,p).cross(V(0,1,0)).normalize();
  cam.position.set(p.x+sh[0]+Math.sin(t*1.3)*.015,p.y+sh[1]+Math.sin(t*1.9)*.012,p.z);l.addScaledVector(side,w*3);cam.lookAt(l.x+sh[0]*.5,l.y+sh[1]*.5,l.z);lens();}
function camAt2(p,l,t,sh=[0,0]){cam.position.set(p.x+sh[0]+Math.sin(t*1.3)*.015,p.y+sh[1]+Math.sin(t*1.9)*.012,p.z);cam.lookAt(l.x+sh[0]*.5,l.y+sh[1]*.5,l.z);lens();}
const P2=V(0,0,0);function proj(x,y,z){if(x.isVector3){z=x.z;y=x.y;x=x.x;}cam.updateMatrixWorld();P2.set(x,y,z).project(cam);return{x:(P2.x+1)/2*1080,y:(1-P2.y)/2*1920};}
function wpos(s){return s.mesh.getWorldPosition(V(0,0,0));}
function bill(s){const p=wpos(s);s.mesh.rotation.y=Math.atan2(cam.position.x-p.x,cam.position.z-p.z);}
// ícones de app riscados
function icon(kind,x,y,p,px){if(p<=0)return'';const s=back(cl(p)),c={msg:'#2fbf71',play:'#ff3b3b',heart:'#ff5a8a',shop:'#f2b33d',bank:'#3f6fb5',box:'#b98a5a'}[kind];let g='';
  if(kind==='msg')g=`<path d="M-48 -38 h96 a14 14 0 0 1 14 14 v46 a14 14 0 0 1 -14 14 h-56 l-26 22 v-22 h-14 a14 14 0 0 1 -14 -14 v-46 a14 14 0 0 1 14 -14z" fill="#fff"/>`;
  if(kind==='play')g=`<path d="M-24 -40 L44 0 L-24 40Z" fill="#fff"/>`;
  if(kind==='heart')g=`<path d="M0 44 C-70 0 -50 -56 0 -24 C50 -56 70 0 0 44Z" fill="#fff"/>`;
  if(kind==='shop')g=`<path d="M-56 -10 h112 v58 h-112z" fill="#fff"/><path d="M-62 -14 l14 -36 h96 l14 36z" fill="#d9483b"/><rect x="-14" y="10" width="28" height="38" fill="${c}"/>`;
  if(kind==='bank')g=`<path d="M0 -54 L64 -20 H-64Z" fill="#fff"/>${[-44,-15,15,44].map(x=>`<rect x="${x-8}" y="-12" width="16" height="50" fill="#fff"/>`).join('')}<rect x="-64" y="42" width="128" height="12" fill="#fff"/>`;
  if(kind==='box')g=`<path d="M-50 -24 L0 -48 L50 -24 L50 34 L0 56 L-50 34Z" fill="#fff"/><path d="M-50 -24 L0 0 L50 -24 M0 0 V56" stroke="${c}" stroke-width="6" fill="none"/>`;
  const xs=px>0?back(cl(px)):0;
  return `<g transform="translate(${f(x)} ${f(y)}) scale(${f(s)}) rotate(${f(Math.sin(p*20)*(1-cl(p))*10)})"><circle r="92" fill="${c}" stroke="#141414" stroke-width="9"/>${g}`+(xs>0?`<g transform="scale(${f(xs)}) rotate(-8)"><path d="M-80 -80 L80 80 M80 -80 L-80 80" stroke="#141414" stroke-width="40" stroke-linecap="round"/><path d="M-80 -80 L80 80 M80 -80 L-80 80" stroke="#ff2d2d" stroke-width="24" stroke-linecap="round"/></g>`:'')+`</g>`;}
// celular gigante na tela (close-up)
function bigPhone(t,v,mode){const sh=Math.sin(t*30)*(mode==='shake'?8:0);let scr='',bars=3;
  if(mode==='lose'){bars=Math.max(0,3-Math.floor(v/.28));}
  const wifi=(x,y,n,col)=>[0,1,2].map(k=>`<path d="M${x-14-k*14} ${y-k*12} q${14+k*14} ${-14-k*8} ${28+k*28} 0" stroke="${k<n?col:'#ffffff40'}" stroke-width="7" fill="none" stroke-linecap="round"/>`).join('')+`<circle cx="${x}" cy="${y+8}" r="6" fill="${n>0?col:'#ffffff40'}"/>`;
  scr+=`<rect x="-250" y="-470" width="500" height="900" rx="40" fill="url(#vid)"/>`;
  scr+=`<rect x="-250" y="-470" width="500" height="60" rx="30" fill="#0008"/>`+wifi(180,-430,bars,'#fff')+`<text x="-210" y="-428" font-family="Anton" font-size="34" fill="#fff">18:42</text>`;
  if(mode==='lose'){const sp=t*8;scr+=`<rect x="-250" y="-410" width="500" height="840" fill="#000" opacity="${f(cl((v-.5)*3)*.55)}"/>`;
    if(v>.55){for(let k=0;k<8;k++){const a=sp+k/8*TAU;scr+=`<circle cx="${f(Math.cos(a)*50)}" cy="${f(-40+Math.sin(a)*50)}" r="${f(6+k*1.5)}" fill="#fff" opacity="${f(.2+k/10)}"/>`;}}
    if(v>.9){const p=seg(v,.9,1.1);scr+=`<g transform="translate(0 140) rotate(-10) scale(${f(back(p))})"><rect x="-210" y="-60" width="420" height="110" rx="16" fill="none" stroke="#ff2d2d" stroke-width="12"/><text y="22" font-family="Anton" font-size="70" fill="#ff2d2d" text-anchor="middle">SEM CONEXÃO</text></g>`;}}
  return `<defs><linearGradient id="vid" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ff7a59"/><stop offset=".5" stop-color="#c84bd8"/><stop offset="1" stop-color="#3f6fff"/></linearGradient></defs><g transform="translate(${f(540+sh)} 880) rotate(${f(-4+Math.sin(t*2)*2)})"><rect x="-285" y="-520" width="570" height="1000" rx="70" fill="#15151b" stroke="#000" stroke-width="10"/>${scr}<rect x="-70" y="-505" width="140" height="22" rx="11" fill="#000"/></g>`
   ;}
function phoneCard(x,y,p,title,sub,col='#ff3b3b'){if(p<=0)return'';const s=back(cl(p));return `<g transform="translate(${f(x)} ${f(y)}) scale(${f(s)})"><rect x="-200" y="-80" width="400" height="160" rx="26" fill="#fff" stroke="#141414" stroke-width="8"/><circle cx="-130" cy="0" r="46" fill="${col}"/><path d="M-152 -22 L-108 22 M-108 -22 L-152 22" stroke="#fff" stroke-width="12" stroke-linecap="round"/><text x="40" y="-6" font-family="Anton" font-size="56" fill="#141414" text-anchor="middle">${title}</text><text x="40" y="46" font-family="Anton" font-size="34" fill="${col}" text-anchor="middle">${sub}</text></g>`;}
function notes(x,y,t,n=4){let h='';for(let k=0;k<n;k++){const ph=(t*.7+k/n)%1;const X=x+Math.sin(ph*6+k)*60+(k%2?60:-60),Y=y-ph*260;h+=`<g transform="translate(${f(X)} ${f(Y)}) rotate(${f(Math.sin(t*5+k)*15)}) scale(${f(.8+ph*.4)})" opacity="${f(Math.sin(ph*Math.PI))}"><ellipse cx="-14" cy="20" rx="20" ry="15" fill="#ffd23f" stroke="#141414" stroke-width="5" transform="rotate(-20 -14 20)"/><path d="M2 18 V-46 l34 12" stroke="#141414" stroke-width="7" fill="none"/></g>`;}return h;}
function zap(x,y,t,s=1){let d=`M${f(x)} ${f(y)}`,X=x,Y=y;for(let i=0;i<6;i++){X+=(rnd(Math.floor(t*20)+i)-.5)*120*s;Y-=40*s;d+=` L${f(X)} ${f(Y)}`;}return `<path d="${d}" stroke="#bff4ff" stroke-width="${f(16*s)}" fill="none" opacity=".5"/><path d="${d}" stroke="#fff" stroke-width="${f(6*s)}" fill="none"/>`;}
function confetti(t,p){if(p<=0)return'';let h='';for(let k=0;k<60;k++){const x=rnd(k)*1080+Math.sin(t*2+k)*40,y=((t*(260+rnd(k+1)*200)+rnd(k+2)*1920)%2100)-100;h+=`<rect x="${f(x)}" y="${f(y)}" width="18" height="30" fill="${['#e2574c','#ffd23f','#3f6fb5','#4f9a5a','#ff7ac8'][k%5]}" transform="rotate(${f(t*200+k*40)} ${f(x)} ${f(y)})" opacity="${f(p)}"/>`;}return h;}
function chart(x,y,p,t){if(p<=0)return'';const s=back(cl(p*1.5)),k=cl(p);let pts=[];for(let i=0;i<=20;i++){const u=i/20;if(u>k)break;pts.push(`${f(-260+u*520)} ${f(-120+u*u*230+Math.sin(u*25)*14)}`);}
  return `<g transform="translate(${x} ${y}) scale(${f(s)})"><rect x="-300" y="-190" width="600" height="380" rx="26" fill="#fff" stroke="#141414" stroke-width="9"/>${[-100,0,100].map(yy=>`<line x1="-260" y1="${yy}" x2="260" y2="${yy}" stroke="#ddd" stroke-width="4"/>`).join('')}`+(pts.length>1?`<polyline points="${pts.join(' ')}" fill="none" stroke="#ff2d2d" stroke-width="16" stroke-linecap="round" stroke-linejoin="round"/>`:'')+`<path d="M200 70 l60 60 l10 -70z" fill="#ff2d2d" opacity="${f(seg(p,.8,1))}"/></g>`;}

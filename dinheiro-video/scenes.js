// ================= colisão e chão (kit novo) =================
PRINT.position.z=1.35;scene.updateMatrixWorld(true);SLOT.set(PRINT.position.x,2.0,PRINT.position.z+.95);
{const _b=new THREE.Box3();const add=(o,name)=>{_b.setFromObject(o);SOLIDS.push({x0:_b.min.x,x1:_b.max.x,z0:_b.min.z,z1:_b.max.z,h:_b.max.y,name});};
 add(PR.body,'máquina');add(BENCH,'banco');
 SOLIDS.push({x0:-1.65,x1:1.65,z0:-7.65,z1:-6.95,h:1.06,name:'balcão'},{x0:-2.5,x1:-2.2,z0:-10,z1:-6.6,h:3.2,name:'parede esq. do mercadinho'},{x0:2.2,x1:2.5,z0:-10,z1:-6.6,h:3.2,name:'parede dir. do mercadinho'},{x0:-2.5,x1:2.5,z0:-10.1,z1:-9.5,h:3.2,name:'prateleiras'});
 SOLIDS.push({x0:-2.5,x1:2.5,z0:-10.2,z1:-6.6,h:.25,name:'piso do mercadinho'});}
window.SOLIDS=SOLIDS;
function place(s,x,y,z,sc=1,o={}){y=y??0;const r=.28*sc;const gy=groundAt(SOLIDS,x,z,y);if(y<gy-.005){window.GROUND.push({t:+NOW.toFixed(2),d:+((gy-y)/K/sc).toFixed(1),what:'pés abaixo do chão'});y=gy;}
  if(!o.free){const q=solid(SOLIDS.filter(b=>b.h>.3),x,z,r,y);if(q.hit)window.COLLIDE.push({t:+NOW.toFixed(2),what:q.hit,depth:+q.depth.toFixed(3)});x=q.x;z=q.z;
    for(const p of PLACED){const d=Math.hypot(x-p[0],z-p[1]);if(d<r+p[2]){window.COLLIDE.push({t:+NOW.toFixed(2),what:'outro personagem',depth:+(r+p[2]-d).toFixed(3)});const[,b]=apart([p[0],p[1]],[x,z],r+p[2]);x=b[0];z=b[1];}}PLACED.push([x,z,r]);}
  s.mesh.visible=true;s.mesh.scale.setScalar(sc);s.mesh.position.set(x,y+HEADY*sc,z);}
// ================= personagens =================
const CA=sprite(CHVB,.8,scene,true),DI=sprite(CHVB,.7,scene,true),CAF=sprite(SQVB,.45,scene);
const EV=[];const ev=(s,u,n,g=1)=>{EV.push([s,u,n,g]);return u;};
function headW(s,dy=0){const p=wpos(s);return V(p.x,p.y+dy,p.z);}
function headUI(s,dy=0){return proj(headW(s,dy));}
const SIDEWALK=3.75,CX=-1.2;
function rainSpawn(n,t0,rate,o={}){return i=>({t0:t0+i*rate+rnd(i+300)*rate,p:[SLOT.x+(rnd(i)-.5)*1.2,SLOT.y+rnd(i+1)*.2,SLOT.z],v:[(o.vx??2.6)+(rnd(i+2)-.5)*2.6,4.5+rnd(i+3)*3.0,(o.vz??1.9)+rnd(i+4)*1.6]});}
function stamp(txt,p,col='#ff2d2d',y=900,rot=-12){if(p<=0)return'';const s=1.6-.6*back(cl(p*1.6));return `<g transform="translate(540 ${y}) rotate(${rot}) scale(${f(s)})" opacity="${f(cl(p*3))}"><rect x="-430" y="-100" width="860" height="200" rx="24" fill="none" stroke="${col}" stroke-width="22"/><text y="52" font-family="Anton" font-size="150" fill="${col}" text-anchor="middle">${txt}</text></g>`;}
function chartUp(x,y,p){if(p<=0)return'';const s=back(cl(p*1.5)),k=cl(p);let pts=[];for(let i=0;i<=24;i++){const u=i/24;if(u>k)break;pts.push(`${f(-260+u*520)} ${f(140-Math.pow(u,2.2)*290+Math.sin(u*30)*6)}`);}
  return `<g transform="translate(${x} ${y}) scale(${f(s)})"><rect x="-300" y="-190" width="600" height="380" rx="26" fill="#fff" stroke="#141414" stroke-width="9"/>${[-100,0,100].map(yy=>`<line x1="-260" y1="${yy}" x2="260" y2="${yy}" stroke="#ddd" stroke-width="4"/>`).join('')}`+(pts.length>1?`<polyline points="${pts.join(' ')}" fill="none" stroke="#ff2d2d" stroke-width="16" stroke-linecap="round" stroke-linejoin="round"/>`:'')+`</g>`;}
function arrowUp(x,y,p,t){if(p<=0)return'';const s=back(cl(p));return `<g transform="translate(${x} ${f(y-Math.abs(Math.sin(t*6))*20)}) scale(${f(s)})"><path d="M0 -120 L90 0 L35 0 L35 110 L-35 110 L-35 0 L-90 0Z" fill="#ff2d2d" stroke="#141414" stroke-width="10"/></g>`;}
function priceSeq(u,t0,vals,dt=.38){const k=Math.floor((u-t0)/dt);return vals[Math.max(0,Math.min(vals.length-1,k))];}
const SIMC=new Map();function sim(key,o,u){const q=Math.round(u*60);const k=key+':'+q;if(SIMC.has(k))return SIMC.get(k);const r=simBills(o,u);if(SIMC.size>8)SIMC.clear();SIMC.set(k,r);return r;}
function gustLinesUI(t,p){if(p<=0)return'';let h='';for(let k=0;k<14;k++){const y=500+rnd(k)*900,len=200+rnd(k+3)*380,x=((t*(2400+rnd(k+5)*1600)+rnd(k+8)*2400)%2400)-600;h+=`<path d="M${f(x)} ${f(y)} q${f(len*.5)} ${f(-30+rnd(k)*60)} ${f(len)} ${f(Math.sin(k)*20)}" stroke="#fff" stroke-width="${f(5+rnd(k+2)*7)}" fill="none" stroke-linecap="round" opacity="${f(p*.6)}"/>`;}return h;}

// ---- configurações de física por cena ----
const PH1={n:300,kd:.5,spawn:rainSpawn(300,.9,.0125),floor:(x,z)=>streetFloor(x,z),heads:[{t0:0,t1:9,c:V(CX,.12+HEADY,SIDEWALK),r:.36}]};
const MOUND_C=V(-1.85,.12,3.95);
const PH2={n:320,kd:.5,spawn:i=>i<150?{t0:rnd(i)*.2,p:[MOUND_C.x+(rnd(i+1)-.5)*2.2,1.3+rnd(i+2)*1.2,MOUND_C.z+(rnd(i+3)-.5)*1.4],v:[0,0,0]}:rainSpawn(170,0,.025)(i-150),floor:(x,z)=>streetFloor(x,z)+moundH(x,z),thick:.016,kicks:[{t:.78,c:[MOUND_C.x+.15,MOUND_C.z],r:1.3,s:4.2},{t:1.55,c:[MOUND_C.x,MOUND_C.z],r:.6,s:3}]};
const COUNTER=(x,z)=>(x>-1.65&&x<1.65&&z>-7.65&&z<-6.95)?1.06:(z<-6.6&&z>-10.2&&Math.abs(x)<2.5)?.25:streetFloor(x,z);
const PH3={n:220,spawn:i=>({t0:1.45+i*.0055,p:[-.75+(rnd(i)-.5)*.2,1.75+rnd(i+1)*.15,-6.75+(rnd(i+2)-.5)*.2],v:[.9+(rnd(i+3)-.3)*1.4,.4+rnd(i+4),-.9-rnd(i+5)*.8]}),floor:COUNTER,thick:.02,cell:.1};
const WBX=u=>-6.2+Math.min(u,3.25)*1.65,WBZ=-2.1,BUMP1=2.25,BUMP2=2.85;
const PH4={n:110,spawn:i=>{const tb=i<70?BUMP1:BUMP2;return{t0:tb+rnd(i)*.12,p:[WBX(tb)+(rnd(i+1)-.5)*.8,.95,WBZ+(rnd(i+2)-.5)*.4],v:[1.2+rnd(i+3)*1.8,2.6+rnd(i+4)*2.6,(rnd(i+5)-.5)*3]};},floor:streetFloor};
const PH6={n:130,spawn:i=>({t0:i*.055,p:[-5.5+rnd(i)*2,1.2+rnd(i+1)*2.8,-4.6-rnd(i+2)*1.6],v:[2+rnd(i+3)*2,1+rnd(i+4),(rnd(i+5)-.5)]}),floor:COUNTER,wind:()=>[2.6,.3,.2]};
const MOUND8={x:-1.85,z:3.95,sx:1.7,sy:1.05,sz:1.05};
const PH8={n:300,spawn:i=>({t0:rnd(i)*.15,p:[MOUND8.x+(rnd(i+1)-.5)*3.0,MOUND8.sy+.3+rnd(i+2)*.6,MOUND8.z+(rnd(i+3)-.5)*1.8],v:[0,0,0]}),floor:(x,z)=>streetFloor(x,z)+moundH(x,z),thick:.012,lift:{t:1.75,p:.8},wind:tau=>tau>1.7?[5.5,.8,.6]:[0,0,0]};

const SC=[
// ---------- S1: a máquina começa a imprimir ----------
{wind:()=>.35,setup(d){ev(0,.1,'machine',.8);ev(0,.95,'whoosh');ev(0,1.0,'paper');ev(0,2.0,'paper',.8);ev(0,2.5,'plop',.6);ev(0,3.25,'boing');ev(0,3.4,'paper',.8);},
async up(u,d,t){mood('day');const s=shots(u,[0,1.0,2.0,3.2],d),v=s.v;WIND={w:.35,dx:1,dz:0};let h='';animPrinter(t,u>.4);
  const S=sim('s1',PH1,u);drawBills(S,0);
  const j=hop(u,3.25,.5,170);place(CA,CX,.12-j.y*K,SIDEWALK);
  const pose=s.i===0?{expr:'neutral',holdR:phoneSVG('#5ab0ff'),aR:55,eR:-125,lookY:.3,look:u>.6?-.8:0}:s.i===1?{expr:'shock',lookY:-1,aL:30,aR:30,mouth:.8}:s.i===2?{expr:'laugh',aL:150,aR:150,eL:-20,eR:-20,handL:'open',handR:'open',lookY:-.6,mouth:.5}:{expr:'laugh',aL:170,aR:170,eL:-10,eR:-10,handL:'open',handR:'open',sq:j.sq,mouth:.6};
  await CA.set(caio(Object.assign({t,wind:.4},pose)));
  if(s.i===0){FOV=56;camShot(v,s.d,V(1.6,2.7,-2.4),V(1.2,2.3,-1.8),V(-2.4,1.5,2.6),V(-2.3,1.6,2.6),{t});FOCUS=V(-2.4,1.2,2);h+=label('E SE O GOVERNO',300,{size:100,p:seg(u,.1,.4)})+label('IMPRIMISSE',420,{size:110,fill:'#8fe08a',p:seg(u,.25,.55)})+label('DINHEIRO?',540,{size:130,fill:'#ffd23f',p:seg(u,.4,.7)});}
  if(s.i===1){FOV=60;camShot(v,s.d,V(CX+.25,.45,SIDEWALK+.9),V(CX+.2,.5,SIDEWALK+1.0),V(CX-1.0,2.6,1.9),V(CX-1.1,2.9,1.8),{t});FOCUS=V(CX-.6,2,2.5);AP=.003;}
  if(s.i===2){FOV=46;camShot(v,s.d,V(CX+.1,1.5,1.35),V(CX+.05,1.5,1.6),V(CX,1.35,SIDEWALK),V(CX,1.35,SIDEWALK),{t});FOCUS=wpos(CA);const q=headUI(CA,.35);h+=popText('PLOFT!',q.x+200,q.y-80,seg(u,2.5,2.8),{size:80,fill:'#fff'});}
  if(s.i===3){FOV=54;camShot(v,s.d,V(1.4,2.7,-1.6),V(2.0,3.1,-2.4),V(-1.8,1.1,3.0),V(-1.8,1.0,3.0),{t});FOCUS=wpos(CA);}
  world(t,V(-1.5,0,2.5));return h;}},
// ---------- S2: todo mundo rico... por uns dias ----------
{wind:()=>.35,setup(d){ev(1,.75,'splash_paper');ev(1,.8,'paper');ev(1,1.55,'paper',.8);ev(1,2.65,'ding',.8);ev(1,3.6,'scratch');ev(1,3.65,'thud',.7);},
async up(u,d,t){mood('day');const s=shots(u,[0,1.3,2.6,3.6],d);const FZ=3.6,uu=Math.min(u,FZ),tt=u<FZ?t:t-(u-FZ),v=s.v;WIND={w:.35,dx:1,dz:0};let h='';animPrinter(tt,true);
  MOUND.visible=true;const gr=.75+.25*seg(uu,0,3.6);MOUND.position.copy(MOUND_C);MOUND.scale.set(1.25*gr,.62*gr,.85*gr);
  const S=sim('s2',PH2,uu);drawBills(S,0);const top=MOUND_C.y+MOUND.scale.y;
  if(s.i===0){const k=seg(uu,.2,.78),x=lerp(-.1,MOUND_C.x+.15,k),y=lerp(.4,top-.05,k)+Math.sin(k*Math.PI)*.9;CAF.mesh.visible=true;CAF.mesh.scale.setScalar(.9);CAF.mesh.position.set(x,y+.25,MOUND_C.z-.15);
    await CAF.set(caio({t:tt,rot:u<.2?0:-80*seg(uu,.2,.45),expr:'laugh',aL:170,aR:170,eL:-5,eR:-5,handL:'open',handR:'open',legL:-10,legR:20,mouth:.7,wind:1.2,windDir:1}));
    FOV=54;camShot(v,s.d,V(.9,1.2,1.2),V(.6,1.3,1.4),V(-1.2,1.0,3.9),V(-1.6,1.0,3.9),{t});FOCUS=V(-1.4,.8,3.9);if(uu>.78)h+=popText('TCHIBUM!',540,600,seg(uu,.78,1.05),{size:120,fill:'#8fe08a'});}
  if(s.i===1){const y=MOUND_C.y+moundH(MOUND_C.x,MOUND_C.z)-.35;place(CA,MOUND_C.x,y,MOUND_C.z,1,{free:true});const th=seg(uu,1.45,1.6);
    await CA.set(caio({t:tt,stance:'sit',bob:20,sunglasses:true,phones:false,expr:'smug',aL:lerp(40,170,th),aR:lerp(40,170,th),eL:-20,eR:-20,handL:'open',handR:'open',mouth:.2}));
    FOV=46;camShot(v,s.d,V(MOUND_C.x+.3,top+.85,MOUND_C.z-2.7),V(MOUND_C.x+.25,top+.9,MOUND_C.z-2.45),V(MOUND_C.x,top+.75,MOUND_C.z),V(MOUND_C.x,top+.8,MOUND_C.z),{t});FOCUS=wpos(CA);AP=.006;
    const q=headUI(CA,.3);h+=sparkle(q.x+230,q.y-120,tt,50)+sparkle(q.x-220,q.y-60,tt+1,36);}
  if(s.i>=2){CAF.mesh.visible=true;CAF.mesh.scale.setScalar(.9);CAF.mesh.position.set(MOUND_C.x+.1,top+.3,MOUND_C.z-.1);
    await CAF.set(caio({t:tt,rot:-78,sunglasses:true,phones:false,expr:s.i===3?'shock':'laugh',aL:150+Math.sin(tt*8)*40,aR:150-Math.sin(tt*8)*40,eL:-20,eR:-20,legL:Math.sin(tt*10)*25,legR:-Math.sin(tt*10)*25,mouth:.5}));
    FOV=50;const pz=s.i===3?seg(u,FZ,d)*.35:0;camShot(s.i===3?u-2.6:v,2.0,V(MOUND_C.x+1.6-pz,top+1.3,MOUND_C.z-3.0+pz*2),V(MOUND_C.x+1.2-pz,top+1.2,MOUND_C.z-2.7+pz*2),V(MOUND_C.x,top+.2,MOUND_C.z),V(MOUND_C.x,top+.2,MOUND_C.z),{t:tt});cam.rotateZ(s.i===2?.18:.08);lens();FOCUS=wpos(CAF);
    if(s.i===2)h+=popText('RICO!',540,420,seg(u,2.65,2.95),{size:180,fill:'#ffd23f'})+sparkle(260,600,tt,50)+sparkle(820,560,tt+2,44);
    if(s.i===3)h+=`<rect width="1080" height="1920" fill="#000" opacity=".25"/>`+stamp('SÓ QUE NÃO',seg(u,FZ,FZ+.25));}
  window.FILTER=s.i===3?'grayscale(1) contrast(1.1)':'';
  world(tt,V(-1.5,0,3.5));return h;}},
// ---------- S3: preços disparam no mercadinho ----------
{wind:()=>.2,setup(d){ev(2,.15,'pop');ev(2,1.45,'paper');ev(2,1.9,'paper',.8);ev(2,2.9,'tec');ev(2,3.28,'tec');ev(2,3.66,'tec');ev(2,4.04,'tec');ev(2,4.45,'sting');},
async up(u,d,t){mood('day');const s=shots(u,[0,1.4,2.8,4.4],d),v=s.v;WIND={w:.2,dx:1,dz:0};let h='';BREAD.visible=true;PRICE.visible=true;
  setPrice(priceSeq(u,2.9,['R$ 1','R$ 10','R$ 100','R$ 1.000','R$ 10.000']));
  const S=sim('s3',PH3,u);drawBills(S,0);
  place(DI,.6,.25,-7.95);await DI.set(dito(Object.assign({t,expr:s.i>=2?'smug':'neutral',aR:s.i===0?60:20,eR:s.i===0?-10:-20,handR:s.i===0?'point':'relaxed'},s.i===1?{gesture:'crossed'}:{})));
  place(CA,-.85,.25,-6.4);
  const ca=s.i===1?{view:'3q',dir:1,expr:'smug',aL:110,aR:110,eL:-40,eR:-40,handL:'open',handR:'open',lean:8}:s.i===3?{expr:'shock',aL:165,aR:165,eL:-140,eR:-140,handL:'open',handR:'open',mouth:.8,browUp:1}:{view:'3q',dir:1,expr:'happy',aR:20};
  await CA.set(caio(Object.assign({t},ca)));
  if(s.i===0){FOV=50;camShot(v,s.d,V(.5,1.55,-4.2),V(.3,1.5,-4.6),V(0,1.25,-7.3),V(0,1.25,-7.3),{t});FOCUS=V(0,1.2,-7.3);const q=proj(PRICE.position.clone().add(V(0,.6,0)));h+=popText('R$ 1',q.x,q.y-60,seg(u,.15,.45),{size:90,fill:'#fff'});}
  if(s.i===1){FOV=50;camShot(v,s.d,V(1.3,1.8,-5.0),V(1.1,1.75,-5.2),V(-.5,1.2,-7.2),V(-.4,1.2,-7.2),{t});FOCUS=V(-.4,1.1,-7.2);}
  if(s.i===2){FOV=46;FOVMUL=punch(u,2.9,.08)*punch(u,3.66,.08);camShot(v,s.d,V(.5,1.6,-5.75),V(.47,1.58,-5.95),V(.35,1.5,-7.2),V(.35,1.5,-7.2),{t,shake:shake(u,3.66,.01,6)});FOCUS=PRICE.position.clone().add(V(0,.42,0));AP=.02;
    for(let k=0;k<4;k++){const tk=2.9+k*.38;if(u>tk&&u<tk+.35)h+=popText('TEC!',300+k*160,560-k*40,seg(u,tk,tk+.25),{size:90,fill:'#ff9a3a'});}}
  if(s.i===3){FOV=46;FOVMUL=punch(u,4.45,.15);camShot(v,s.d,V(-.85,1.75,-4.0),V(-.85,1.75,-4.25),V(-.85,1.62,-6.4),V(-.85,1.62,-6.4),{t});FOCUS=wpos(CA);h+=stamp('INFLAÇÃO!',seg(u,4.45,4.7),'#ff2d2d',430,-6)+arrowUp(880,700,seg(u,4.6,4.9),t);const q=headUI(CA,.3);h+=emanata(q.x,q.y-40,seg(u,4.4,4.6),230);}
  world(t,V(0,0,-7));return h;}},
// ---------- S4: Alemanha 1923 (sépia) ----------
{wind:()=>.3,setup(d){ev(3,.1,'wheel');ev(3,BUMP1,'thud');ev(3,BUMP1+.05,'paper');ev(3,BUMP2,'thud',.6);ev(3,BUMP2+.05,'paper',.7);ev(3,3.4,'ding',.7);ev(3,5.05,'sad');},
async up(u,d,t){mood('day');const s=shots(u,[0,1.7,3.3,5.0],d),v=s.v;WIND={w:.3,dx:1,dz:0};let h='';window.FILTER='sepia(.9) contrast(1.05) brightness(.97)';
  const wx=WBX(u),b1=Math.max(0,Math.sin(cl((u-BUMP1)/.35)*Math.PI))*(u>BUMP1?1:0),b2=Math.max(0,Math.sin(cl((u-BUMP2)/.3)*Math.PI))*(u>BUMP2?.6:0),bump=b1+b2;
  WB.visible=true;WB.position.set(wx,.01+bump*.18,WBZ);WB.rotation.set(0,0,bump*.18);WB.userData.wheel.rotation.z=-wx/.2;
  const S=sim('s4',PH4,u);drawBills(S,1);BREAD.visible=s.i<2;PRICE.visible=true;setPrice('BILHÕES');
  if(s.i<2){place(CA,wx-1.25,0,WBZ,1,{free:true});await CA.set(caio({t,view:'side',dir:1,walk:t*1.3,lean:14,expr:'angry',aF:75+bump*30,eF:-10,aB:70,eB:-10,mouth:.3,wind:.5}));
    if(s.i===0){FOV=56;camShot(v,s.d,V(-1.2,2.4,1.8),V(-1.5,2.2,1.5),V(-4.6,.7,-2),V(-4.0,.7,-2),{t});FOCUS=V(wx,.6,WBZ);h+=label('ALEMANHA',300,{size:110,p:seg(u,.1,.4)})+label('1923',480,{size:180,fill:'#ffd23f',p:seg(u,.25,.55)});}
    else{FOV=50;camShot(v,s.d,V(wx-.7,1.2,.9),V(wx-.5,1.1,1.0),V(wx-.7,.8,WBZ),V(wx-.6,.8,WBZ),{t,shake:shake(u,BUMP1,.03,6)});FOCUS=V(wx-.3,.7,WBZ);const q=headUI(CA,.3);h+=sweat(q.x,q.y,t);
      if(u>BUMP1)h+=popText('TOMBO!',700,620,seg(u,BUMP1,BUMP1+.3),{size:100,fill:'#fff'});}}
  else{place(DI,.6,.25,-7.95);await DI.set(dito({t,expr:'happy',aL:70,eL:-95,handL:'thumb'}));
    place(CA,-.8,.25,-6.4);await CA.set(caio({t,view:s.i===2?'3q':'front',dir:1,expr:s.i===2?'shock':'bored',holdR:breadSVG(),aR:100,eR:-90,teary:s.i===3,mouth:s.i===2?.6:0}));
    if(s.i===2){FOV=50;camShot(v,s.d,V(.4,1.55,-4.3),V(.2,1.5,-4.7),V(-.2,1.25,-7.1),V(-.2,1.25,-7.1),{t});FOCUS=V(0,1.2,-7);h+=label('UM PÃO =',300,{size:100,p:seg(u,3.35,3.6)})+label('BILHÕES',470,{size:170,fill:'#ffd23f',p:seg(u,3.5,3.8)});}
    else{FOV=42;camShot(v,s.d,V(-.8,1.75,-4.5),V(-.8,1.75,-4.7),V(-.8,1.62,-6.4),V(-.8,1.62,-6.4),{t});FOCUS=wpos(CA);AP=.006;const q=headUI(CA,.25);h+=sweat(q.x+40,q.y-40,t);}}
  world(t,V(wx,0,WBZ));return h;}},
// ---------- S5: nota de 100 trilhões ----------
{wind:()=>.3,setup(d){ev(4,.1,'flutter');ev(4,2.55,'thud');ev(4,2.6,'paper');ev(4,3.0,'tick',.6);ev(4,3.7,'pop');ev(4,3.75,'boing',.8);},
async up(u,d,t){mood('day');const s=shots(u,[0,1.4,2.5,3.6],d),v=s.v;WIND={w:.3,dx:1,dz:0};let h='';
  const LAND=2.5,X0=CX,Z0=SIDEWALK;GIANT.visible=true;
  if(u<LAND){const k=u/LAND,y=lerp(10,1.75,Math.pow(k,1.3));GIANT.position.set(X0+Math.sin(u*2.3)*1.1*(1-k*.7),y,Z0+Math.cos(u*1.7)*.4*(1-k));GIANT.rotation.set(-1.35+Math.sin(u*2.3)*.25,u*.6,Math.cos(u*2.3)*.45*(1-k*.5));}
  else{const k=seg(u,LAND,LAND+.25);const up=u>3.6?seg(u,3.6,3.9):0;GIANT.position.set(X0+up*.9,lerp(1.75,.16,k),Z0+up*.4);GIANT.rotation.set(-Math.PI/2+.04,.6+up*.5,0);}
  const covered=u>LAND+.15&&u<3.65;
  if(!covered){const out=u>=3.65;const j=hop(u,3.68,.45,150);place(CA,X0+(out?-.6:0),.12-j.y*K,Z0,1,{free:true});
    await CA.set(caio({t,expr:s.i<2?'shock':'laugh',lookY:s.i<2?-1:0,aL:s.i===1?150:20,aR:s.i===1?150:20,eL:-30,eR:-30,handL:'open',handR:'open',mouth:.6,sq:j.sq}));}
  if(s.i===0){FOV=58;camShot(v,s.d,V(X0+.2,1.1,Z0-2.6),V(X0+.15,1.2,Z0-2.4),V(X0,7,Z0),V(X0,5.5,Z0),{t});FOCUS=GIANT.position.clone();h+=label('ZIMBÁBUE',330,{size:130,fill:'#c9b0e8',p:seg(u,.15,.45)});}
  if(s.i===1){FOV=50;camShot(v,s.d,V(X0+.3,1.35,Z0-2.0),V(X0+.25,1.3,Z0-1.8),V(X0,1.8,Z0),V(X0,2.2,Z0),{t});FOCUS=wpos(CA);const q=headUI(CA,.3);h+=emanata(q.x,q.y-40,seg(v,0,.2),220);}
  if(s.i>=2){FOV=54;camShot(u-2.5,2.1,V(X0+1.8,2.6,Z0-2.4),V(X0+1.4,2.2,Z0-2.0),V(X0,.4,Z0),V(X0,.6,Z0),{t,shake:shake(u,LAND,.05,6)});FOCUS=V(X0,.3,Z0);
    const q=proj(X0,.2,Z0);h+=puff(q.x,q.y,seg(u,LAND,LAND+.6),9)+(u>LAND&&u<3.6?popText('PLOFT!',q.x,q.y-200,seg(u,LAND,LAND+.3),{size:110,fill:'#fff'}):'');
    const z=Math.min(12,Math.floor(seg(u,2.9,3.6)*12));h+=label(z?'100.'+Array(Math.ceil(z/3)).fill('000').join('.'):'100',330,{size:z>6?96:110,fill:'#ffd23f',p:seg(u,2.85,3.0)});if(u>3.6)h+=label('100 TRILHÕES!',470,{size:110,p:seg(u,3.6,3.85)});}
  world(t,V(X0,0,Z0));return h;}},
// ---------- S6: Brasil 1993 ----------
{wind:()=>.8,setup(d){ev(5,.1,'paper');ev(5,.2,'gust',.6);ev(5,1.9,'tick',.7);ev(5,2.4,'tick',.7);ev(5,2.9,'tick',.7);ev(5,3.85,'sting');ev(5,5.85,'whoosh');ev(5,6.0,'paper',.8);},
async up(u,d,t){mood('day');const s=shots(u,[0,1.8,3.8,5.8],d),v=s.v;WIND={w:.8,dx:1,dz:0};let h='';BREAD.visible=true;PRICE.visible=true;setPrice(priceSeq(u,1.8,['R$ 50','R$ 200','R$ 900','R$ 3.500','R$ 12.000'],.45));
  const S=sim('s6',PH6,u);drawBills(S,2);
  const op=s.i===3;place(DI,.4,.25,-7.95);await DI.set(dito({t,expr:s.i===2?'fear':op?'shock':'neutral',rage:s.i===2?.75:0,aL:op?150:20,aR:op?150:20,eL:-30,eR:-30,handL:op?'open':'relaxed',handR:op?'open':'relaxed',mouth:op?.7:0}));
  place(CA,-.9,.25,-6.4);await CA.set(caio({t,view:s.i===1?'front':'3q',dir:1,expr:s.i===1?'suspicious':op?'shock':'neutral',lookY:s.i===1?-.6:0,aL:op?150:20,aR:op?150:20,eL:-30,eR:-30,handL:op?'open':'relaxed',handR:op?'open':'relaxed',mouth:op?.7:0}));
  if(s.i===0){FOV=54;camShot(v,s.d,V(-1.6,1.7,-2.9),V(-1.2,1.6,-3.3),V(0,1.3,-6.8),V(.1,1.3,-6.8),{t});FOCUS=V(0,1.2,-6.6);h+=label('BRASIL',300,{size:120,p:seg(u,.1,.4)})+label('1993',490,{size:190,fill:'#ffd23f',p:seg(u,.25,.55)});}
  if(s.i===1){FOV=44;camShot(v,s.d,V(-.9,1.85,-3.5),V(-.9,1.85,-3.7),V(-.9,1.95,-6.4),V(-.9,1.95,-6.4),{t});FOCUS=wpos(CA);AP=.006;h+=chartUp(540,470,seg(u,1.85,3.6))+counter(540,790,0,2000,seg(u,1.85,3.6),{suf:'%',size:150,fill:'#ff2d2d',pre:'+'});}
  if(s.i===2){FOV=42;camShot(v,s.d,V(.4,1.85,-5.9),V(.4,1.82,-6.1),V(.4,1.7,-7.95),V(.4,1.7,-7.95),{t,shake:[tremble(t,.006),tremble(t+2,.006)]});FOCUS=wpos(DI);AP=.006;const q=headUI(DI,.25);h+=sweat(q.x,q.y-40,t)+sweat(q.x+60,q.y,t+.4);h+=label('+2.000% NUM ANO',330,{size:100,fill:'#ff5a4d',p:seg(u,3.85,4.15)});}
  if(s.i===3){FOV=56;camShot(v,s.d,V(-.3,1.8,-3.0),V(.2,1.9,-2.6),V(-.2,1.3,-7),V(-.2,1.3,-7),{t});FOCUS=V(-.2,1.2,-6.9);}
  world(t,V(0,0,-6));return h;}},
// ---------- S7: a maquininha de etiquetas ----------
{wind:()=>.3,setup(d){for(let k=0;k<6;k++)ev(6,.25+k*.22,'tec',.7);ev(6,1.75,'whoosh');ev(6,3.25,'whoosh',.7);ev(6,4.0,'tec');ev(6,4.05,'boing',.7);},
async up(u,d,t){mood('day');const s=shots(u,[0,1.7,3.2],d),v=s.v;WIND={w:.3,dx:1,dz:0};let h='';
  const dx=lerp(-1.9,1.9,seg(u,.15,1.6));TAGS.forEach(m=>{const k=spring(u,.15+(m.userData.x+1.9)/3.8*1.45,12,6);m.scale.setScalar(Math.max(.001,k*1.6));m.rotation.z=Math.sin(u*20+m.userData.x)*.1*(1-cl(u-1.7));});
  if(s.i===0){place(DI,dx,.25,-8.95,1,{free:true});await DI.set(dito({t,view:'side',dir:1,walk:t*2.6,run:true,holdF:priceGunSVG(),aF:80,eF:-20,expr:'angry',mouth:.4}));
    FOV=56;camShot(v,s.d,V(dx-.6,1.8,-6.55),V(dx-.4,1.8,-6.55),V(dx+.2,1.35,-9.3),V(dx+.4,1.35,-9.3),{t});FOCUS=V(dx,1.2,-9.2);AP=.004;
    for(let k=0;k<6;k++){const tk=.25+k*.22;if(u>tk&&u<tk+.3)h+=popText('TEC',540+(k%2?140:-140),620-k*20,seg(u,tk,tk+.2),{size:80,fill:'#ff9a3a'});}}
  if(s.i===1){const X=lerp(3.5,.6,seg(u,1.7,3.2));place(CA,X,.12,-3.85,1,{free:true});await CA.set(trail({x:0,y:0,s:1,style:'soft',seed:1,kit:CAIO,phones:true,t,view:'side',dir:-1,walk:t*3.2,run:true,holdF:breadSVG(),aF:80,eF:-60,expr:'angry',wind:1.3,windDir:1,mouth:.4},-40,0,3));
    FOV=52;camShot(v,s.d,V(X+.2,1.35,-1.4),V(X,1.35,-1.4),V(X,1.15,-3.85),V(X-.1,1.15,-3.85),{t});FOCUS=wpos(CA);h+=label('ANTES QUE SUBA!',330,{size:100,fill:'#ffd23f',p:seg(u,1.8,2.1)});}
  if(s.i===2){place(CA,-.4,.25,-6.5);place(DI,-.4,.25,-8.0);const tec=4.0;
    await CA.set(caio({t,view:'3q',dir:-1,expr:u<tec?'happy':'shock',holdR:breadSVG()+(u>tec?`<g transform="translate(30 70) scale(${f(back(seg(u,tec,tec+.2)))})"><path d="M-40 -24 h70 l22 24 l-22 24 h-70z" fill="#ff9a3a" stroke="#a8562a" stroke-width="5"/><text x="-6" y="14" font-family="Anton" font-size="32" fill="#fff" text-anchor="middle">R$ 99</text></g>`:''),aR:110,eR:-80,mouth:u>tec?.7:0}));
    await DI.set(dito({t,view:'3q',dir:1,expr:'smug',holdR:priceGunSVG(),aR:lerp(60,95,seg(u,3.7,tec)),eR:-10,lean:lerp(0,12,seg(u,3.6,tec))}));
    FOV=48;FOVMUL=punch(u,tec,.14);camShot(v,s.d,V(1.1,1.95,-4.7),V(.9,1.9,-4.95),V(-.4,1.55,-7.3),V(-.4,1.55,-7.3),{t,shake:shake(u,tec,.03,6)});FOCUS=V(-.4,1.3,-7.2);
    h+=popText('TEC!',540,560,seg(u,tec,tec+.3),{size:150,fill:'#ff9a3a'});}
  world(t,V(0,0,-6));return h;}},
// ---------- S8: dinheiro só vale o que compra ----------
{wind:(u)=>u>1.7?1.4:.3,setup(d){ev(7,.1,'pop',.6);ev(7,1.7,'gust',1.2);ev(7,1.8,'paper');ev(7,3.25,'pop');ev(7,5.2,'ding',.8);},
async up(u,d,t){mood('sunset');const s=shots(u,[0,1.6,3.2,5.0],d),v=s.v;const W=this.wind(u);WIND={w:W,dx:1,dz:.1};let h='';
  MOUND.visible=true;MOUND.position.set(MOUND8.x,.12,MOUND8.z);MOUND.scale.set(MOUND8.sx,MOUND8.sy,MOUND8.sz);
  const S=sim('s8',PH8,u);drawBills(S,0);const top=.12+MOUND8.sy;
  place(CA,MOUND8.x+.1,top-.38,MOUND8.z,1,{free:true});
  const pt=s.i===3;await CA.set(caio({t,stance:'sit',bob:20,expr:s.i===0?'halfsmile':s.i===1?'shock':pt?'happy':'smirk',lookCam:s.i>=2,holdL:breadSVG(),aL:100,eL:-90,aR:pt?85:20,eR:pt?-5:-20,handR:pt?'point':'relaxed',wind:W,windDir:-1,lookY:s.i===0?.5:0,rim:'#ffb070',rimDir:1}));
  if(s.i===0){FOV=50;camShot(v,s.d,V(MOUND8.x+.7,top+.9,MOUND8.z-3.2),V(MOUND8.x+.6,top+.85,MOUND8.z-2.9),V(MOUND8.x,top+.3,MOUND8.z),V(MOUND8.x,top+.3,MOUND8.z),{t});FOCUS=wpos(CA);AP=.005;}
  if(s.i===1){FOV=56;camShot(v,s.d,V(1.6,2.6,-1.4),V(2.2,2.9,-2.0),V(-1.4,1.2,4),V(-1.0,1.4,4),{t,shake:shake(u,1.7,.03,4)});FOCUS=wpos(CA);h+=gustLinesUI(t,1-seg(u,2.8,3.2));}
  if(s.i>=2){FOV=44;camShot(u-3.2,4.3,V(MOUND8.x+.1,top+.85,MOUND8.z-2.6),V(MOUND8.x+.1,top+.82,MOUND8.z-2.25),V(MOUND8.x+.1,top+.6,MOUND8.z),V(MOUND8.x+.1,top+.6,MOUND8.z),{t});FOCUS=wpos(CA);AP=.006;
    h+=label('E VOCÊ, LEMBRA',300,{size:100,p:seg(u,3.25,3.5)})+label('DO PREÇO DO PÃO?',430,{size:120,fill:'#ffd23f',p:seg(u,3.4,3.65)});
    const cp=seg(u,5.2,5.55);if(cp>0)h+=`<g transform="translate(540 1330) scale(${(back(cp)*(1+Math.sin(t*8)*.03)).toFixed(3)})"><rect x="-300" y="-70" width="600" height="130" rx="65" fill="#ff2d55" stroke="#141414" stroke-width="10"/><text y="28" class="lb" font-size="84" fill="#fff" text-anchor="middle">SIGA PARA MAIS</text></g>`;}
  world(t,V(-1.5,0,3.5));return h;}}
];

// ================= legendas e linha do tempo =================
const HL=[['GOVERNO','DINHEIRO'],['RICO','DIAS'],['PREÇOS','DISPARAM','INFLAÇÃO'],['1923','PÃO','BILHÕES'],['100','TRILHÕES'],['BRASIL','1993','2000'],['ETIQUETAS','REMARCAVA'],['COMPRAR','PÃO']];
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
const CUTS=[[0,1.0,2.0,3.2],[0,1.3,2.6,3.6],[0,1.4,2.8,4.4],[0,1.7,3.3,5.0],[0,1.4,2.5,3.6],[0,1.8,3.8,5.8],[0,1.7,3.2],[0,1.6,3.2,5.0]];
const shotStart=(i,u)=>{let b=0;for(const c of CUTS[i])if(u>=c)b=c;return u-b;};
window.render=async function(t){NOW=t;PLACED=[];
  let i=SCN.findIndex(s=>t>=s.s&&t<s.s+s.d);if(i<0)i=SCN.length-1;const u=t-SCN[i].s,d=SCN[i].d;
  SPRS.forEach(s=>s.mesh.visible=false);FOVMUL=1;FOCUS=null;AP=.0015;BILLS.count=0;FLS.intensity=0;MAP.visible=false;PMESH.forEach(m=>m.count=0);
  MOUND.visible=false;WB.visible=false;PRINT.visible=i<2;GIANT.visible=false;BREAD.visible=false;PRICE.visible=false;TAGS.forEach(m=>m.scale.setScalar(.001));PIG.visible=false;MAQ.visible=false;window.FILTER='';
  const ui=await SC[i].up(u,d,t);
  SPRS.forEach(s=>{if(s.mesh.visible)bill(s);});
  const fd=FOCUS?cam.position.distanceTo(FOCUS):5;bokeh.uniforms.focus.value=fd;bokeh.uniforms.aperture.value=AP;bokeh.uniforms.maxblur.value=AP>.004?.014:.007;
  bloom.strength=MOOD==='sunset'?.5:.35;bloom.threshold=.86;
  document.getElementById('gl').style.filter=window.FILTER;
  composer.render();
  document.getElementById('ui').innerHTML=ui;document.getElementById('caps').innerHTML=caption(t);
  document.getElementById('flash').setAttribute('opacity',f(.35*(1-seg(shotStart(i,u),0,.12))*(t>.05?1:0)));
  const fr=Math.floor(t*30),gr=document.getElementById('grain');gr.setAttribute('x',f(-60+rnd(fr)*60));gr.setAttribute('y',f(-60+rnd(fr+5)*60));
};
window.INFO=setup(window.TIMING);window.GROUPS=GROUPS;
window.EVENTS=EV.map(([s,u,n,g])=>({t:+(SCN[s].s+u).toFixed(3),name:n,gain:g}));
window.WINDCURVE=[];for(let t=0;t<window.INFO.total;t+=.1){const i=Math.max(0,SCN.findIndex(s=>t>=s.s&&t<s.s+s.d));window.WINDCURVE.push(+SC[i].wind(t-SCN[i].s,SCN[i].d).toFixed(3));}
window.DBG={cam,scene,THREE,SOLIDS};
await window.render(0);
window.ready=true;
</script>
</body></html>

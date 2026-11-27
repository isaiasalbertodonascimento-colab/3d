// ================= personagens (sprites) =================
const CA=sprite(CHVB,.8,scene,true),DI=sprite(CHVB,.7,scene,true),CI=sprite(CHVB,.7,scene,true),JU=sprite(CHVB,.7,scene,true);
const SCH=[CA,DI,CI,JU];
const EV=[];const ev=(s,u,n,g=1)=>{EV.push([s,u,n,g]);return u;};
const SPC=SPACE.position;const SV=(x,y,z)=>V(x+SPC.x,y+SPC.y,z+SPC.z);const OV=(x,y,z)=>V(x,y,z+OCEAN.position.z);
let BOK=false;
function headUI(s,dy=0){const p=wpos(s);return proj(p.x,p.y+dy,p.z);}
async function fishes(t,flee=0){await Promise.all(FISH.map((F,k)=>{F.mesh.visible=true;const dir=k%2?1:-1,sp=(1.2+rnd(k)*.8)*(1+flee*4);const x=((t*sp*dir+rnd(k+3)*40)%40+40)%40-20;F.mesh.position.set(cam.position.x+x*.12,cam.position.y-.6+rnd(k+1)*1.4+Math.sin(t*2+k)*.2,cam.position.z-3-rnd(k+2)*5);F.mesh.scale.setScalar(.8+rnd(k+4)*.6);return F.set(fish({t:t+k,dir,color:['#ff8a3d','#ffd23f','#5ac8fa','#ff6b8a'][k%4]}));}));}
function swimmer(t,P,o={}){SWIM.mesh.visible=true;SWIM.mesh.position.copy(P);return SWIM.set(caio(Object.assign({t,rot:-72,sunglasses:true,wet:1,phones:false,aL:170+Math.sin(t*4)*10,eL:-10,aR:160-Math.sin(t*4)*10,eR:-10,legL:Math.sin(t*9)*28,legR:-Math.sin(t*9)*28,wind:.6,windDir:1},o)));}
function bubblesUI(x,y,t,n=5){let h='';for(let k=0;k<n;k++){const ph=(t*.9+k/n)%1;h+=`<circle cx="${f(x+Math.sin(ph*9+k)*24)}" cy="${f(y-ph*240)}" r="${f(8+ph*14)}" fill="none" stroke="#e8fbff" stroke-width="5" opacity="${f(1-ph)}"/>`;}return h;}

const SC=[
// ---------- S1 rua: a internet cai ----------
{fov:48,wind:()=>.35,setup(d){ev(0,.25,'pop',.7);ev(0,1.3,'glitch');ev(0,2.25,'err');ev(0,2.6,'sting');ev(0,3.6,'thud',.6);ev(0,3.8,'pop',.8);},
async up(u,d,t){mood('day');const s=shots(u,[0,1.3,2.6,3.6],d),v=s.v;WIND={w:.35,dx:1,dz:0};
  const cx=-1.0-Math.min(u,2.6)*.45;let h='';
  if(s.i===0||s.i===1){place(CA,cx,null,3.75);await CA.set(caio({t,walk:t*1.6,moveDir:-1,view:'3q',dir:-1,expr:'laugh',mouth:.4+Math.abs(Math.sin(t*9))*.3,holdR:phoneSVG('#c84bd8'),aR:55,eR:-125,lookY:.3,wind:.4}));}
  if(s.i===0){FOV=46;camShot(v,s.d,V(cx-1.9,1.3,1.6),V(cx-1.5,1.35,2.1),V(cx,1.3,3.75),V(cx,1.3,3.75),{t});FOCUS=wpos(CA);
    const tp=seg(u,.15,.45);h+=label('E SE A INTERNET',300,{size:100,p:tp})+label('CAÍSSE?',440,{size:150,fill:'#ffd23f',p:seg(u,.3,.6)});}
  if(s.i===1){FOV=46;camShot(v,s.d,V(cx-.9,1.5,2.6),V(cx-.8,1.5,2.7),V(cx,1.2,3.75),V(cx,1.2,3.75),{t});FOCUS=V(cx+30,0,0);h+=`<rect width="1080" height="1920" fill="#000" opacity=".25"/>`+bigPhone(t,v,'lose');}
  if(s.i===2){FOV=44;FOVMUL=punch(u,2.62,.2);place(CA,cx,null,3.75);await CA.set(caio({t,expr:'shock',holdR:phoneSVG('#333'),aR:40,eR:-110,aL:30,eL:-20,mouth:.7,browUp:1,jiggle:1}));
    camShot(v,s.d,V(cx,1.45,2.35),V(cx,1.45,2.55),V(cx,1.38,3.75),V(cx,1.38,3.75),{t,shake:shake(u,2.62,.03,6)});FOCUS=wpos(CA);const q=headUI(CA,.1);h+=emanata(q.x,q.y,seg(v,0,.2),230);}
  if(s.i===3){FOV=50;place(CA,cx,null,3.75);await CA.set(caio({t,expr:'fear',holdR:phoneSVG('#333'),aR:120+Math.sin(t*14)*25,eR:-40,aL:20,lookCam:false,mouth:.4}));
    place(JU,cx+1.25,null,4.0,.95);await JU.set(juca({t,expr:'shock',holdR:phoneSVG('#333'),aR:150+Math.sin(t*16)*20,eR:-20,emote:'question',hop:0}));
    place(CI,HX,null,8.75);await CI.set(cida({t,expr:'suspicious',holdR:phoneSVG('#333'),aR:165,eR:-10,emote:'question'}));
    camShot(v,s.d,V(cx+.6,2.1,-1.3),V(cx+.6,1.9,-.9),V(cx+.5,1.4,5),V(cx+.5,1.3,5),{t});FOCUS=wpos(CA);
    h+=popText('SEM INTERNET!',540,420,seg(u,3.8,4.15),{size:130,fill:'#ff5a4d',rot:-6});}
  world(t,V(cx,0,3.75));return h;}},
// ---------- S2 rua: sem mensagem, vídeo, rede social ----------
{fov:50,wind:()=>.4,setup(d){ev(1,.15,'boing');ev(1,.9,'buzz');ev(1,1.55,'thud',.6);ev(1,1.85,'thud',.6);ev(1,2.15,'thud',.6);ev(1,2.4,'buzz');ev(1,3.05,'whoosh',.6);ev(1,3.8,'buzz');ev(1,4.35,'plop');ev(1,4.6,'sad',.7);},
async up(u,d,t){mood('day');const s=shots(u,[0,1.5,3.0,4.3],d),v=s.v;WIND={w:.4,dx:1,dz:0};let h='';const B=BENCH.position;
  if(s.i===0){const k=seg(u,.2,.6),arc=Math.sin(k*Math.PI)*.35;place(CA,B.x,HEADY+.47*k+arc,B.z+.05);
    await CA.set(caio({t,expr:k<1?'angry':'angry',sq:u<.2?.15:(u<.7&&u>.55?.2:0),holdR:phoneSVG('#444'),aR:170,eR:-8,aL:40,eL:-30,rot:tremble(t,2.5),mouth:.2}));
    FOV=50;camShot(v,s.d,V(B.x-1.2,.45,1.5),V(B.x-1.0,.5,1.8),V(B.x,1.9,B.z),V(B.x,2.0,B.z),{t});FOCUS=wpos(CA);
    h+=icon('msg',540,380,seg(u,.7,.95),seg(u,.9,1.1));const q=headUI(CA,.2);if(u>.8)h+=sweat(q.x,q.y,t);}
  if(s.i===1){const J=V(-1.3,0,3.7);place(JU,J.x,null,J.z,.95);const slap=Math.max(0,Math.sin((u-1.5)*Math.PI*3.4));
    await JU.set(juca({t,expr:'angry',holdR:phoneSVG('#444'),aR:60,eR:-90,aL:lerp(80,30,slap),eL:lerp(-110,-60,slap),handL:'open',mouth:.6,rage:.5}));
    FOV=46;camShot(v,s.d,V(J.x-.9,1.05,2.1),V(J.x-.7,1.0,2.2),V(J.x,1.0,J.z),V(J.x,1.0,J.z),{t,shake:shake(u,1.85,.02,5)});FOCUS=wpos(JU);
    h+=icon('play',540,380,seg(u,1.6,1.85),seg(u,2.35,2.6));const q=headUI(JU,-.2);h+=popText('TOC! TOC!',q.x+180,q.y+80,seg(u,1.55,1.9),{size:80,fill:'#fff'});}
  if(s.i===2){place(CA,B.x,HEADY+.47+Math.sin(t*6)*.02,B.z+.05);await CA.set(backlight(caio({t,view:'back',holdR:phoneSVG('#444'),aR:175,eR:-2,aL:120,eL:-20,handL:'open',sq:-.06}),'#ffe0a0',.9));
    FOV=50;camShot(v,s.d,V(B.x+.8,.9,7.4),V(B.x+.6,.85,7.1),V(B.x,2.3,2),V(B.x,2.6,1.5),{t});FOCUS=wpos(CA);h+=icon('heart',540,380,seg(u,3.2,3.45),seg(u,3.75,4));}
  if(s.i===3){place(CA,B.x-.8,HEADY-.42,3.05);await CA.set(caio({t,stance:'sit',expr:'bored',holdR:phoneSVG('#333'),aR:25,eR:-40,aL:20,emote:'cloud',lookY:.6,bob:20}));
    FOV=46;camShot(v,s.d,V(B.x-1.7,1.0,1.1),V(B.x-1.5,.95,1.35),V(B.x-.8,.85,3.05),V(B.x-.8,.85,3.05),{t});FOCUS=wpos(CA);AP=.006;
    const q=headUI(CA,.1);h+=popText('...',q.x+190,q.y-40,seg(u,4.4,4.7),{size:120,fill:'#fff'});}
  world(t,V(B.x,0,B.z));return h;}},
// ---------- S3 fundo do mar: cabos submarinos ----------
{fov:50,wind:()=>0,setup(d){ev(2,0,'splash');ev(2,.3,'bubbles',.8);ev(2,.7,'tick',.5);ev(2,1.6,'whoosh');ev(2,3.3,'bubbles',.7);ev(2,4.85,'pop',.7);ev(2,5.6,'pop',.7);},
async up(u,d,t){mood('ocean');const s=shots(u,[0,1.6,3.2,4.8],d),v=s.v;let h='';cablePulses(t,1,0);
  if(s.i===0){FOV=55;camShot(v,s.d,OV(-14,17,7),OV(-10,3.5,5),OV(-8,4,0),OV(-6,.5,0),{t});FOCUS=OV(-7,.3,0);h+=counter(540,380,0,95,seg(u,.5,1.5),{suf:'%',size:190});h+=label('DOS DADOS',520,{size:80,p:seg(u,1.0,1.25)});}
  if(s.i===1){FOV=50;camShot(v,s.d,OV(-9,.6,1.4),OV(-6,.55,1.2),OV(-3,.15,0),OV(0,.2,0),{t});FOCUS=OV(-4,.2,0);if(v<.3)h+=speedLines(1-v/.3);}
  if(s.i>=2){const X=s.i===2?-3+v*.7:-1+v*2.6,P=OV(X,s.i===2?1.3:1.6+v*.8,s.i===2?.5:.2);await swimmer(t,P,s.i===2?{expr:'happy',aR:40,eR:0,handR:'point',mouth:0}:{expr:'laugh'});
    if(s.i===2){FOV=46;camAt2(V(P.x+.4,P.y+.35,P.z+3.6),V(P.x+.2,P.y-.4,P.z),t);FOCUS=P;const q=proj(P.x,P.y+.1,P.z);h+=bubblesUI(q.x-60,q.y-140,t);
      const c=proj(OV(X+.4,.15,OC.curve.getPoint((X+.4+90)/180).z));h+=`<g opacity="${f(seg(v,.4,.7))}"><path d="M${f(c.x+160)} ${f(c.y-210)} Q${f(c.x+40)} ${f(c.y-200)} ${f(c.x+15)} ${f(c.y-40)}" stroke="#fff" stroke-width="12" fill="none" stroke-linecap="round"/><path d="M${f(c.x)} ${f(c.y-30)} l-26 -50 l52 0z" fill="#fff" transform="rotate(10 ${f(c.x)} ${f(c.y-30)})"/></g>`+label('CABO SUBMARINO',c.y-260,{size:76,x:Math.min(760,c.x+200),p:seg(v,.5,.8),fill:'#9fe6ff'});}
    else{FOV=55;camShot(v,s.d,OV(-4,2.5,8),OV(-2,6,13),OV(0,1,0),OV(3,1,0),{t});FOCUS=OV(0,1,0);h+=label('ENTRE CONTINENTES',360,{size:96,p:seg(u,4.85,5.15),fill:'#9fe6ff'});}}
  await fishes(t);world(t);return h;}},
// ---------- S4 tempestade solar de 1859 ----------
{fov:50,wind:()=>0,setup(d){ev(3,.05,'rumble');ev(3,1.0,'boom');ev(3,1.75,'whoosh');ev(3,3.05,'zap');ev(3,3.45,'zap');ev(3,3.9,'zap',.8);ev(3,4.4,'zap',.8);ev(3,5.25,'sting');ev(3,6.1,'whoosh',.7);},
async up(u,d,t){const s=shots(u,[0,1.7,3.4,5.2],d),v=s.v;let h='';
  if(s.i<2){mood('space');SP.sun.rotation.y=t*.05;SP.earth.rotation.y=t*.15;const sp=SP.sun.getWorldPosition(V(0,0,0)),ep=SP.earth.getWorldPosition(V(0,0,0));
    const fl=seg(u,.9,1.4);SP.flare.visible=u>.9;SP.flare.position.copy(SP.sun.position).add(V(4,-7,8));SP.flare.rotation.set(0,0,-.5+Math.PI);SP.flare.scale.setScalar(.3+fl*1.2);SP.flare.material.opacity=1-seg(u,2.5,3.2)*.6;
    const q=seg(u,1.2,3.1),cp=SP.cme.geometry.attributes.position;for(let i=0;i<900;i++){const s0=cl(q*1.35-rnd(i)*.35),sp2=s0*14+1.5,a=rnd(i+1)*TAU;cp.setXYZ(i,Math.cos(a)*sp2*rnd(i+2),lerp(26-12,-24+6,s0)+(rnd(i+3)-.5)*2,Math.sin(a)*sp2*rnd(i+4)+4);}cp.needsUpdate=true;SP.cme.material.opacity=q>0&&q<1?1:(q>=1?1-seg(u,3.1,3.4):0);
    const hit=seg(u,3.0,3.3);SP.aur.forEach((a,k)=>{a.material.opacity=hit*(.6+.3*Math.sin(t*12+k));a.scale.setScalar(1+Math.sin(t*5+k)*.05);});
    SP.glow.lookAt(cam.position);SP.atm.lookAt(cam.position);SP.glow.scale.setScalar(1+Math.sin(t*3)*.03+fl*.3);
    if(s.i===0){FOV=50;FOVMUL=punch(u,1.0,.18);camShot(v,s.d,SV(0,22,46),SV(0,24,60),SV(0,26,0),SV(0,24,0),{t,shake:shake(u,1.0,.5,4)});FOCUS=sp;h+=label('1859',360,{size:210,fill:'#ffb060',p:seg(u,.2,.5)})+popText('BUM!',700,1000,seg(u,1.0,1.3),{size:140,fill:'#ff7a3a'});}
    else{FOV=52;camShot(v,s.d,SV(0,0,92),SV(0,-1,84),SV(0,2,0),SV(0,-1,0),{t,shake:shake(u,3.05,.8,5)});FOCUS=ep;h+=label('TEMPESTADE SOLAR',330,{size:96,fill:'#ffb060',p:seg(u,1.8,2.1)});
      if(u>3.05&&u<3.25)h+=`<rect width="1080" height="1920" fill="#fff" opacity="${f(.6*(1-(u-3.05)/.2))}"/>`;}}
  else{mood('ocean');const brk=3.4;cablePulses(t,0,1);
    OC.spark.position.copy(OV(-1.5,.6,OC.curve.getPoint(.49).z));OC.spark.intensity=(Math.sin(t*37)>.2?1:0)*14;
    if(s.i===2){FOV=50;camShot(v,s.d,OV(-5.2,.5,1.9),OV(-3.0,1.0,1.1),OV(-1.4,.2,0),OV(-.4,.25,0),{t,shake:[...shake(u,3.45,.04,3)].map((x,k)=>x+tremble(t+k,.006))});FOCUS=OV(-1.5,.2,0);
      for(let k=0;k<4;k++){if(Math.sin(t*23+k*2)>-.2){const x=-2.5+k*.9;const c=proj(OV(x,.15,OC.curve.getPoint((x+90)/180).z));h+=zap(c.x,c.y,t+k,.9);}}h+=popText('ZZAP!',540,520,seg(u,3.45,3.8),{size:150,fill:'#9fe6ff'});}
    else{const back2=seg(v,.8,1.5),X=-1+back2*-3,P=OV(X,1.4,.4);await swimmer(t,P,{expr:'shock',rot:back2>0?72:-72,aL:150,aR:150,eL:-30,eR:-30,legL:Math.sin(t*16)*35,legR:-Math.sin(t*16)*35,mouth:.8,browUp:1});
      FOV=44;camAt2(V(P.x+.15,P.y+.2,P.z+2.4),V(P.x,P.y,P.z),t,shake(u,5.25,.03,5));FOCUS=P;const q=proj(P.x,P.y+.2,P.z);h+=emanata(q.x,q.y-120,seg(v,0,.2),200);if(back2>0)h+=speedLines(.5*Math.sin(back2*Math.PI));}}
  if(s.i>=2)await fishes(t,s.i===3?1:0);world(t);return h;}},
// ---------- S5 mercadinho: dia 2, Pix e cartão param ----------
{fov:48,wind:()=>.25,setup(d){ev(4,.15,'pop');ev(4,.6,'err',.8);ev(4,1.4,'beep');ev(4,1.75,'beep');ev(4,2.95,'crash');ev(4,3.0,'coins');ev(4,4.0,'ding',.8);},
async up(u,d,t){mood('day');const s=shots(u,[0,1.3,2.6,3.9],d),v=s.v;WIND={w:.25,dx:1,dz:0};let h='';const BRK=2.95;
  MAQ.userData.scr.material.map=u>1.35&&Math.sin(t*14)>-.4?MAQT.deny:MAQT.idle;
  PIG.visible=u<BRK;const pp=V(-.45,1.06,-7.35);
  SHARDS.forEach((m,i)=>{m.visible=u>=BRK;if(!m.visible)return;const k=u-BRK,vv=m.userData.v;let y=pp.y+.1+vv.y*k-4.9*k*k;m.position.set(pp.x+vv.x*k*.6,Math.max(1.07,y),pp.z+vv.z*k*.4);m.rotation.set(m.userData.r.x*Math.min(k,.5),m.userData.r.y*Math.min(k,.5),0);});
  COINS.forEach((m,i)=>{m.visible=u>=BRK;if(!m.visible)return;const k=cl((u-BRK)/.7);m.position.set(pp.x+m.userData.dx*k,1.07+bounce(u,BRK,m.userData.h,1.1,3),pp.z+m.userData.dz*k);m.rotation.set(0,0,0);});
  place(DI,.45,null,-7.95);
  const pd=s.i===1?{expr:'disgust',aL:20,aR:20,gesture:'crossed'}:s.i===2?{expr:u>BRK?'shock':'neutral',aL:u>BRK?150:20,aR:u>BRK?150:20,eL:-30,eR:-30,handL:'open',handR:'open'}:s.i===3?{expr:'happy',aR:70,eR:-95,handR:'thumb'}:{expr:'neutral',gesture:'hips'};
  await DI.set(dito(Object.assign({t,apron:true},pd)));
  if(s.i===0){place(CA,-.85,null,-6.35);await CA.set(caio({t,view:'3q',dir:1,expr:'angry',holdR:phoneSVG('#ff3b3b'),aR:110+Math.sin(t*8)*6,eR:-60,mouth:talk(t)*.6}));
    FOV=50;camShot(v,s.d,V(.2,1.55,-3.3),V(0,1.5,-3.7),V(-.2,1.3,-7.0),V(-.2,1.3,-7.0),{t});FOCUS=wpos(CA);
    h+=label('DIA 2',330,{size:200,fill:'#ffd23f',p:seg(u,.1,.4)});const q=headUI(CA,-.1);h+=phoneCard(540,560,seg(u,.45,.7),'PIX','ERRO');}
  if(s.i===1){place(CA,-.85,null,-6.35);await CA.set(caio({t,view:'3q',dir:1,expr:'angry',aR:70,eR:-60,handR:'point'}));
    FOV=40;camShot(v,s.d,V(.95,1.32,-6.75),V(.85,1.3,-6.85),V(.55,1.1,-7.42),V(.55,1.08,-7.42),{t});FOCUS=MAQ.position.clone();AP=.02;
    h+=popText('BIP! BIP!',540,560,seg(u,1.4,1.7),{size:120,fill:'#ff5a4d'});}
  if(s.i===2){place(CA,-1.35,null,-6.75);const ch=seg(u,2.75,BRK);const raise=seg(u,2.6,2.75);
    await CA.set(caio({t,view:'3q',dir:-1,expr:u<BRK?'angry':'laugh',aR:lerp(lerp(60,175,raise),55,ch),eR:lerp(-20,-5,ch),handR:'open',aL:30,eL:-30,mouth:u<BRK?.5:.7,sq:u>BRK&&u<BRK+.2?.12:0}));
    FOV=48;FOVMUL=punch(u,BRK,.2);camShot(v,s.d,V(1.0,1.65,-4.4),V(.85,1.6,-4.7),V(-.85,1.2,-7.0),V(-.85,1.2,-7.0),{t,shake:shake(u,BRK,.04,6)});FOCUS=pp;
    h+=popText('CRASH!',560,620,seg(u,BRK,BRK+.3),{size:150,fill:'#ff7ac8'});}
  if(s.i===3){place(CA,-.95,null,-6.5);await CA.set(caio({t,expr:'smug',holdR:billSVG(),aR:115,eR:-95,aL:20}));
    FOV=46;camShot(v,s.d,V(-.8,1.45,-4.3),V(-.85,1.45,-4.6),V(-.95,1.3,-6.5),V(-.95,1.3,-6.5),{t});FOCUS=wpos(CA);AP=.006;
    const q=headUI(CA,.2);h+=sparkle(q.x+220,q.y-160,t,50)+sparkle(q.x-200,q.y-80,t+1,36)+label('SÓ DINHEIRO',300,{size:110,fill:'#8fe08a',p:seg(u,4.0,4.25)})+label('VIVO!',430,{size:150,fill:'#8fe08a',p:seg(u,4.15,4.4)});}
  world(t,V(0,0,-7));return h;}},
// ---------- S6 rua: bilhões perdidos ----------
{fov:50,wind:(u)=>u>1.4&&u<2.8?1.3:.45,setup(d){ev(5,.15,'pop',.8);ev(5,.5,'pop',.8);ev(5,.85,'pop',.8);ev(5,1.45,'gust');ev(5,2.2,'boing');ev(5,2.9,'sad');ev(5,4.25,'thud',.6);},
async up(u,d,t){mood('day');const s=shots(u,[0,1.4,2.8,4.2],d),v=s.v;let h='';WIND={w:this.wind(u),dx:1,dz:0};
  BILLS.count=0;
  if(s.i===0){place(CA,-.6,null,-3.85);await CA.set(caio({t,expr:'suspicious',gesture:'scratch'}));
    FOV=48;camShot(v,s.d,V(.4,1.45,-1.3),V(.2,1.4,-1.6),V(-.5,1.3,-4.5),V(-.5,1.3,-4.5),{t});FOCUS=wpos(CA);
    ['shop','bank','box'].forEach((k,i)=>{h+=icon(k,230+i*310,380,seg(u,.15+i*.35,.4+i*.35),seg(u,.3+i*.35,.5+i*.35));});}
  if(s.i===1){const X=-1+v*2.2;BILLS.count=60;const d0=new THREE.Object3D();for(let i=0;i<60;i++){const ph=(t*.5+rnd(i))%1;d0.position.set(-2+ph*7+Math.sin(t*3+i)*.3,.4+rnd(i+1)*2.2+Math.sin(t*4+i)*.3,-3.9+(rnd(i+2)-.5)*1.6);d0.rotation.set(t*(3+rnd(i+3)*4),t*2+i,t*(2+rnd(i+4)*3));d0.updateMatrix();BILLS.setMatrixAt(i,d0.matrix);}BILLS.instanceMatrix.needsUpdate=true;
    const j=hop(u,2.05,.45,160);place(CA,X,HEADY-j.y*K,-3.85);await CA.set(caio({t,view:'side',dir:1,walk:t*3,run:true,expr:'shock',...(u>2.0&&u<2.7?{aF:165,eF:-10}:{}),handF:'open',sq:j.sq,wind:1.4,windDir:-1,mouth:.6}));
    FOV=52;camShot(v,s.d,V(X-.5,1.3,-.7),V(X-.3,1.3,-.8),V(X+.35,1.25,-3.85),V(X+.45,1.25,-3.85),{t});FOCUS=wpos(CA);if(v<.15)h+=speedLines(1-v/.15);}
  if(s.i===2){place(DI,.6,null,-6.3);await DI.set(dito({t,expr:'shock',aL:150,aR:150,eL:-40,eR:-40,handL:'open',handR:'open',apron:true,mouth:.6,tremble:1,rot:tremble(t,2)}));
    FOV=46;camShot(v,s.d,V(.6,1.55,-3.9),V(.6,1.5,-4.2),V(.6,1.3,-6.3),V(.6,1.3,-6.3),{t});FOCUS=wpos(DI);
    h+=label('US$ BILHÕES',300,{size:120,fill:'#ff5a4d',p:seg(u,2.85,3.1)})+label('POR DIA',420,{size:90,p:seg(u,3.0,3.25)})+chart(540,1180,seg(u,3.1,4.0),t);}
  if(s.i===3){place(CA,-.6,null,-3.85);await CA.set(caio({t,expr:'bored',gesture:'facepalm'}));
    FOV=44;camShot(v,s.d,V(-.3,1.5,-2.1),V(-.35,1.48,-2.3),V(-.6,1.4,-3.85),V(-.6,1.4,-3.85),{t});FOCUS=wpos(CA);AP=.006;const q=headUI(CA,.25);h+=sweat(q.x+40,q.y-40,t);}
  world(t,V(0,0,-4));return h;}},
// ---------- S7 noite: rádio a pilha e mapa de papel ----------
{fov:50,wind:()=>.15,setup(d){ev(6,.35,'click');ev(6,1.25,'radio');ev(6,2.45,'paper');ev(6,2.8,'pop',.6);ev(6,3.55,'ding',.8);},
async up(u,d,t){mood('night');const s=shots(u,[0,1.2,2.4,3.5],d),v=s.v;let h='';WIND={w:.15,dx:1,dz:0};
  const on=u>.35;const C=V(HX-.85,0,7.55),I=V(HX+.9,0,7.75),J=V(HX+.15,0,8.05);
  place(CA,C.x,HEADY-.42,C.z);place(CI,I.x,HEADY-.42,I.z);
  await CA.set(caio({t,stance:'sit',bob:20,expr:s.i===3?'laugh':'happy',holdR:flashSVG(),aR:70,eR:-70,aL:s.i===3?70:20,eL:s.i===3?-95:-20,handL:s.i===3?'thumb':'relaxed',light:{color:'#ffb070',az:1,amt:.5},mouth:s.i===3?talk(t)+.2:0}));
  await CI.set(cida({t,stance:'sit',bob:20,expr:s.i===3?'laugh':'happy',aR:s.i===2?60:20,eR:s.i===2?-10:-20,handR:s.i===2?'point':'relaxed',light:{color:'#ffb070',az:-1,amt:.5},mouth:s.i===3?.5:0}));
  place(JU,J.x,null,J.z,.95);await JU.set(juca({t,gesture:'dance',expr:'laugh',mouth:.4}));
  const ant=seg(u,1.25,1.8);RADIO.userData.ant.scale.y=.15+ant*.85;
  const mp=spring(u,2.45,10,5);MAPM.scale.set(Math.max(.05,mp),Math.max(.05,Math.min(1,mp*1.4)),1);MAP.visible=u>2.3;
  const hp=V(C.x+.25,.75,C.z-.15);FLS.position.copy(hp);FLS.target.position.set(HX-.4,0,6.9);FLS.intensity=on?(s.i===0?10*seg(u,.35,.42):s.i===2?2.5:7):0;
  if(s.i===0){FOV=60;camShot(v,s.d,V(HX-.4,1.8,4.2),V(HX-.2,1.65,4.6),V(HX,.75,7.6),V(HX,.75,7.6),{t});FOCUS=V(HX,.7,7.6);h+=label('À NOITE...',330,{size:130,fill:'#bcd0ff',p:seg(u,.05,.35)});const q=proj(hp);h+=popText('CLICK',q.x-150,q.y-120,seg(u,.35,.6),{size:70,fill:'#fff'});}
  if(s.i===1){FOV=42;camShot(v,s.d,V(HX+.55,.55,6.25),V(HX+.5,.6,6.35),V(HX+.15,.3,7.0),V(HX+.15,.35,7.0),{t});FOCUS=RADIO.position.clone();AP=.015;const q=proj(RADIO.position.clone().add(V(0,.3,0)));h+=notes(q.x,q.y-60,t,5)+label('RÁDIO A PILHA',330,{size:110,fill:'#ffd23f',p:seg(u,1.3,1.6)});}
  if(s.i===2){FOV=46;camShot(v,s.d,V(HX-.45,1.5,5.75),V(HX-.45,1.35,5.9),V(HX-.45,0,6.95),V(HX-.45,0,6.92),{t});FOCUS=MAP.position.clone();AP=.008;h+=label('MAPA DE PAPEL',330,{size:110,fill:'#ffd23f',p:seg(u,2.5,2.8)});
    const pq=proj(MAP.position.clone().add(V(.2,0,.04)));h+=pin(pq.x,pq.y,seg(u,2.8,3.1));}
  if(s.i===3){FOV=50;FOVMUL=punch(u,3.55,.12);camShot(v,s.d,V(HX,1.1,4.7),V(HX,1.05,5.0),V(HX,.75,7.7),V(HX,.75,7.7),{t});FOCUS=V(HX,.7,7.6);
    h+=popText('OURO!',540,420,seg(u,3.55,3.85),{size:190,fill:'#ffd23f'});for(let k=0;k<4;k++)h+=sparkle(200+k*230,560+Math.sin(t*3+k)*40,t+k,40);}
  world(t,V(HX,0,7.5));return h;}},
// ---------- S8 manhã: vizinhos e CTA ----------
{fov:50,wind:()=>.45,setup(d){ev(7,.1,'pop');ev(7,.4,'knock',.7);ev(7,1.95,'clap');ev(7,3.05,'cheer');ev(7,4.65,'pop');ev(7,6.05,'ding',.8);},
async up(u,d,t){mood('morning');const s=shots(u,[0,1.5,3.0,4.6,6.0],d),v=s.v;let h='';WIND={w:.45,dx:1,dz:0};
  if(s.i===0){const k=seg(u,.2,1.5);place(CI,HX,null,lerp(8.7,5.6,k));await CI.set(cida({t,walk:k>0&&k<1?t*1.6:null,expr:'happy',holdR:pieSVG(),aR:85,eR:-80,aL:85,eL:-80,mouth:talk(t)}));
    FOV=48;camShot(v,s.d,V(HX+1.4,1.35,1.4),V(HX+1.1,1.35,1.8),V(HX,1.2,6.5),V(HX,1.2,5.9),{t});FOCUS=wpos(CI);h+=label('DIA 7',330,{size:200,fill:'#ffd23f',p:seg(u,.05,.35)});}
  if(s.i===1){const hi=seg(u,1.6,1.95);place(CA,1.25,null,3.75);place(JU,1.95,null,3.75,.95);
    await CA.set(caio({t,gesture:hi>0?'highfive':undefined,toward:-1,expr:'laugh',mouth:.4}));await JU.set(juca({t,gesture:hi>0?'highfive':undefined,toward:1,expr:'laugh',hop:0}));
    place(DI,-1.4,null,4.2);await DI.set(dito({t,expr:'happy',aR:150+Math.sin(t*10)*20,eR:-30,handR:'wave',apron:true}));
    FOV=48;FOVMUL=punch(u,1.95,.12);camShot(v,s.d,V(1.6,1.3,.9),V(1.6,1.3,1.15),V(1.6,1.1,3.75),V(1.6,1.1,3.75),{t});FOCUS=V(1.6,1.1,3.75);
    const q=proj(1.6,1.75,3.75);h+=popText('TOCA AQUI!',q.x,q.y-120,seg(u,1.95,2.25),{size:100,fill:'#fff'})+(u>1.95?burst(q.x,q.y+40,90,seg(u,1.95,2.15)):'');}
  if(s.i===2){place(CA,.95,null,3.75);place(JU,-1.25,null,3.85,.95);place(CI,-.2,null,4.75);place(DI,1.85,null,4.3);
    await CA.set(caio({t,expr:'laugh',mouth:.5,aL:150,eL:-20,aR:30}));await JU.set(juca({t,expr:'laugh',gesture:'dance'}));await CI.set(cida({t,expr:'laugh',mouth:.5,emote:'hearts'}));await DI.set(dito({t,expr:'laugh',apron:true,gesture:'hips'}));
    FOV=62;camShot(v,s.d,V(.3,2.1,-.3),V(.3,1.9,.2),V(-.2,1.0,4.2),V(-.2,1.0,4.2),{t});FOCUS=V(-.2,1,4.1);h+=confetti(t,seg(u,3.0,3.3));}
  if(s.i>=3){place(CA,.95,null,3.75);const pt=s.i===4;
    await CA.set(caio({t,expr:pt?'happy':'smirk',lookCam:true,aR:pt?85:20,eR:pt?-5:-10,handR:pt?'point':'relaxed',aL:pt?20:60,eL:pt?-10:-80,handL:pt?'relaxed':'relaxed',gesture:pt?undefined:'hips',mouth:pt?.3:0}));
    FOV=46;camShot(v,s.d,V(.95,1.5,1.7),V(.95,1.5,2.0),V(.95,1.42,3.75),V(.95,1.42,3.75),{t});FOCUS=wpos(CA);AP=.006;
    h+=label('E VOCÊ,',300,{size:120,p:seg(u,4.65,4.9)})+label('AGUENTARIA?',440,{size:150,fill:'#ffd23f',p:seg(u,4.8,5.05)});
    const cp=seg(u,6.05,6.4);if(cp>0)h+=`<g transform="translate(540 1300) scale(${(back(cp)*(1+Math.sin(t*8)*.03)).toFixed(3)})"><rect x="-300" y="-70" width="600" height="130" rx="65" fill="#ff2d55" stroke="#141414" stroke-width="10"/><text y="28" class="lb" font-size="84" fill="#fff" text-anchor="middle">SIGA PARA MAIS</text></g>`;}
  world(t,V(0,0,4));return h;}}
];

// ================= legendas e linha do tempo =================
const HL=[['INTERNET','SEMANA'],['SEGUNDO','MENSAGEM','VÍDEO','SOCIAL'],['95','CABOS','MAR'],['SOLAR','1859','CABOS'],['DIA','2','PIX','CARTÃO','DINHEIRO','VIVO'],['TRAVAM','BILHÕES','DÓLARES'],['RÁDIO','MAPA','OURO'],['VIZINHOS','AGUENTARIA']];
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
let LASTSHOT='';
window.render=async function(t){
  let i=SCN.findIndex(s=>t>=s.s&&t<s.s+s.d);if(i<0)i=SCN.length-1;const u=t-SCN[i].s,d=SCN[i].d;
  SPRS.forEach(s=>s.mesh.visible=false);FOVMUL=1;FOCUS=null;AP=.0015;BILLS.count=0;FLS.intensity=0;MAP.visible=false;
  const ui=await SC[i].up(u,d,t);
  SPRS.forEach(s=>{if(s.mesh.visible)bill(s);});
  const fd=FOCUS?cam.position.distanceTo(FOCUS):5;bokeh.uniforms.focus.value=fd;bokeh.uniforms.aperture.value=AP;bokeh.uniforms.maxblur.value=AP>.004?.014:.007;
  if(MOOD==='space'){bloom.strength=1.0;bloom.threshold=.7;}else if(MOOD==='night'){bloom.strength=.8;bloom.threshold=.75;}else if(MOOD==='ocean'){bloom.strength=.7;bloom.threshold=.75;}else{bloom.strength=.35;bloom.threshold=.88;}
  composer.render();
  document.getElementById('ui').innerHTML=ui;document.getElementById('caps').innerHTML=caption(t);
  // flash curto a cada corte de plano
  const sh=window.SHOTSTART(i,u);document.getElementById('flash').setAttribute('opacity',f(.35*(1-seg(sh,0,.12))*(t>.05?1:0)));
  const fr=Math.floor(t*30),gr=document.getElementById('grain');gr.setAttribute('x',f(-60+rnd(fr)*60));gr.setAttribute('y',f(-60+rnd(fr+5)*60));
};
const CUTS=[[0,1.3,2.6,3.6],[0,1.5,3.0,4.3],[0,1.6,3.2,4.8],[0,1.7,3.4,5.2],[0,1.3,2.6,3.9],[0,1.4,2.8,4.2],[0,1.2,2.4,3.5],[0,1.5,3.0,4.6,6.0]];
window.SHOTSTART=(i,u)=>{let b=0;for(const c of CUTS[i])if(u>=c)b=c;return u-b;};
window.INFO=setup(window.TIMING);window.GROUPS=GROUPS;
window.EVENTS=EV.map(([s,u,n,g])=>({t:+(SCN[s].s+u).toFixed(3),name:n,gain:g}));
window.WINDCURVE=[];for(let t=0;t<window.INFO.total;t+=.1){const i=Math.max(0,SCN.findIndex(s=>t>=s.s&&t<s.s+s.d));window.WINDCURVE.push(+SC[i].wind(t-SCN[i].s,SCN[i].d).toFixed(3));}
window.DBG={cam,scene,THREE,HOUSES};
await window.render(0);
window.ready=true;
</script>
</body></html>

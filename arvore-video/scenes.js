// ================= personagens, colisão =================
const SOLIDS=[{x0:-.75,x1:.75,z0:-.75,z1:.75,h:9,name:'tronco'}];window.SOLIDS=SOLIDS;
function place(s,x,y,z,sc=.8,o={}){y=y??0;const r=.25*sc/.8;const gy=groundAt(SOLIDS,x,z,y);if(y<gy-.005){window.GROUND.push({t:+NOW.toFixed(2),d:+((gy-y)/K/sc).toFixed(1),what:'pés abaixo do chão'});y=gy;}
  if(!o.free){const q=solid(SOLIDS,x,z,r,y);if(q.hit)window.COLLIDE.push({t:+NOW.toFixed(2),what:q.hit,depth:+q.depth.toFixed(3)});x=q.x;z=q.z;}
  s.mesh.visible=true;s.mesh.scale.setScalar(sc);s.mesh.position.set(x,y+HEADY*sc,z);}
const CA=sprite(CHVB,.8,scene,true),CAF=sprite(SQVB,.45,scene),DOG=sprite([-300,-260,600,520],.6,scene);
const SC8=.8,HELM={cap:true,capColor:'#ffd23f'};
const ca=o=>caio(Object.assign({},HELM,{phones:false},o));
const hammerSVG=(a=0)=>`<g transform="translate(0 128) rotate(${f(-60+a)})"><rect x="-8" y="-10" width="16" height="110" rx="6" fill="#8a5a36"/><rect x="-34" y="88" width="68" height="30" rx="6" fill="#5a5f68"/></g>`;
const clipSVG=()=>`<g transform="translate(0 128) rotate(-20)"><rect x="-55" y="-20" width="110" height="140" rx="10" fill="#c98a4a"/><rect x="-45" y="0" width="90" height="110" fill="#e8f4ff"/><path d="M-35 20 h70 M-35 45 h70 M-35 70 h50" stroke="#3f6fb5" stroke-width="5"/><rect x="-20" y="-28" width="40" height="16" rx="4" fill="#5a5f68"/></g>`;
const shovelSVG=()=>`<g transform="translate(0 128) rotate(20)"><rect x="-7" y="-160" width="14" height="300" rx="6" fill="#8a5a36"/><path d="M-40 130 q40 90 80 0 v-10 h-80z" fill="#9aa0a8" stroke="#5a5f68" stroke-width="5"/></g>`;
const EV=[];const ev=(s,u,n,g=1)=>{EV.push([s,u,n,g]);return u;};
function headUI(s,dy=0){const p=wpos(s);return proj(p.x,p.y+dy,p.z);}

// ================= camada 2D de engenharia =================
function badge(n,p){if(p<=0)return'';const s=back(cl(p));return `<g transform="translate(250 200) scale(${f(s)})"><rect x="-200" y="-55" width="400" height="110" rx="20" fill="#11263f" stroke="#5fe0ff" stroke-width="6"/><text y="22" font-family="Anton" font-size="64" fill="#5fe0ff" text-anchor="middle">TENTATIVA ${n}</text></g>`;}
function blueprint(op){let h=`<g opacity="${f(op)}">`;for(let x=0;x<=1080;x+=90)h+=`<line x1="${x}" y1="0" x2="${x}" y2="1920" stroke="#bfe9ff" stroke-width="1.5" opacity=".25"/>`;for(let y=0;y<=1920;y+=90)h+=`<line x1="0" y1="${y}" x2="1080" y2="${y}" stroke="#bfe9ff" stroke-width="1.5" opacity=".25"/>`;
  for(const[x,y,sx,sy]of[[40,40,1,1],[1040,40,-1,1],[40,1880,1,-1],[1040,1880,-1,-1]])h+=`<path d="M${x} ${y+sy*70} V${y} H${x+sx*70}" stroke="#fff" stroke-width="6" fill="none"/>`;return h+'</g>';}
function meter(x,y,val,max,label,p){if(p<=0)return'';const k=cl(val/max),col=k<.5?'#4cd964':k<.8?'#ffd23f':'#ff3b30';return `<g transform="translate(${x} ${y})" opacity="${f(cl(p*3))}"><rect x="-26" y="-210" width="52" height="420" rx="14" fill="#11263f" stroke="#fff" stroke-width="5"/><rect x="-16" y="${f(200-390*k)}" width="32" height="${f(390*k)}" rx="8" fill="${col}"/><text y="260" font-family="Anton" font-size="40" fill="#fff" text-anchor="middle" stroke="#11263f" stroke-width="8" paint-order="stroke">${label}</text></g>`;}
function arrowD(x,y,len,col,p,w=1){if(p<=0)return'';const L=len*back(cl(p));return `<g transform="translate(${f(x)} ${f(y)}) scale(${w})"><path d="M-14 0 V${f(L-40)} H-38 L0 ${f(L)} L38 ${f(L-40)} H14 V0Z" fill="${col}" stroke="#141414" stroke-width="6"/></g>`;}
function ring(x,y,r,p,col='#ff3b30',dash=''){if(p<=0)return'';return `<circle cx="${f(x)}" cy="${f(y)}" r="${f(r*back(cl(p)))}" fill="none" stroke="${col}" stroke-width="12" ${dash?`stroke-dasharray="${dash}"`:''}/>`;}
function tag(txt,x,y,p,col='#ff3b30',size=64){if(p<=0)return'';const s=back(cl(p)),w=txt.length*size*.46+60;return `<g transform="translate(${f(x)} ${f(y)}) scale(${f(s)})"><rect x="${f(-w/2)}" y="${-size*.75}" width="${f(w)}" height="${size*1.3}" rx="16" fill="${col}" stroke="#141414" stroke-width="7"/><text y="${f(size*.3)}" font-family="Anton" font-size="${size}" fill="#fff" text-anchor="middle">${txt}</text></g>`;}
function checkTag(txt,x,y,p){if(p<=0)return'';const s=back(cl(p)),w=txt.length*30+150;return `<g transform="translate(${f(x)} ${f(y)}) scale(${f(s)})"><rect x="${f(-w/2)}" y="-48" width="${f(w)}" height="96" rx="20" fill="#11263f" stroke="#4cd964" stroke-width="7"/><circle cx="${f(-w/2+52)}" cy="0" r="30" fill="#4cd964"/><path d="M${f(-w/2+36)} 0 l12 13 l22 -25" stroke="#fff" stroke-width="9" fill="none" stroke-linecap="round"/><text x="${f(28)}" y="22" font-family="Anton" font-size="60" fill="#fff" text-anchor="middle">${txt}</text></g>`;}
function xMark(x,y,p,s0=1){if(p<=0)return'';const s=back(cl(p))*s0;return `<g transform="translate(${f(x)} ${f(y)}) scale(${f(s)})"><path d="M-70 -70 L70 70 M70 -70 L-70 70" stroke="#141414" stroke-width="44" stroke-linecap="round"/><path d="M-70 -70 L70 70 M70 -70 L-70 70" stroke="#ff3b30" stroke-width="26" stroke-linecap="round"/></g>`;}
function replayHUD(t,mode,speed){let h=`<rect width="1080" height="1920" fill="#0a1a33" opacity=".12"/>`;for(let y=(t*300)%12;y<1920;y+=12)h+=`<rect x="0" y="${f(y)}" width="1080" height="3" fill="#000" opacity=".12"/>`;
  if(mode==='rew'){for(let k=0;k<5;k++){const y=(rnd(Math.floor(t*20)+k)*1920);h+=`<rect x="0" y="${f(y)}" width="1080" height="${f(8+rnd(k+9)*30)}" fill="#fff" opacity=".25"/>`;}}
  h+=`<g transform="translate(60 330)"><circle cx="18" cy="-18" r="16" fill="#ff3b30" opacity="${Math.sin(t*8)>0?1:.2}"/><text x="50" y="0" font-family="Anton" font-size="62" fill="#fff" stroke="#000" stroke-width="8" paint-order="stroke">${mode==='rew'?'◀◀ REPLAY':'REPLAY'}</text></g>`;
  if(speed)h+=`<text x="1020" y="330" font-family="Anton" font-size="62" fill="#ffd23f" text-anchor="end" stroke="#000" stroke-width="8" paint-order="stroke">${speed}</text>`;
  const tc=`00:0${Math.floor(t%10)}:${String(Math.floor(t*30)%30).padStart(2,'0')}`;h+=`<text x="60" y="1440" font-family="monospace" font-size="38" fill="#fff" opacity=".8">${tc}</text>`;return h;}
function dim(a,b,txt,p){if(p<=0)return'';const A=proj(a),B=proj(b);const mx=(A.x+B.x)/2,my=(A.y+B.y)/2;return `<g opacity="${f(cl(p*3))}"><line x1="${f(A.x)}" y1="${f(A.y)}" x2="${f(B.x)}" y2="${f(B.y)}" stroke="#fff" stroke-width="5" stroke-dasharray="14 10"/><circle cx="${f(A.x)}" cy="${f(A.y)}" r="9" fill="#fff"/><circle cx="${f(B.x)}" cy="${f(B.y)}" r="9" fill="#fff"/><text x="${f(mx+20)}" y="${f(my)}" font-family="Anton" font-size="52" fill="#fff" stroke="#11263f" stroke-width="10" paint-order="stroke">${txt}</text></g>`;}

// ================= mundos de cada tentativa (funções puras do tempo local) =================
const LAD=LADDER.userData;
async function a1World(u,t,slow=1){A1.visible=true;const st=a1State(u);const top=3.27+1.7*.06+.03;let info={};
  if(u<2.6){place(CA,3.7,0,1.3,SC8);await CA.set(ca({t,expr:'happy',aR:150,eR:-20,handR:'point',lookY:-.8,mouth:.3}));}
  else if(u<3.0){const k=seg(u,2.6,3.0);place(CA,lerp(3.7,3.5,k),0,lerp(1.3,.5,k),SC8,{free:true});await CA.set(ca({t,walk:t*1.8,expr:'happy'}));}
  else if(u<4.0){const k=seg(u,3.0,3.9),P=V(0,0,0).lerpVectors(LAD.b,LAD.tp,k);place(CA,P.x+.25,P.y,P.z,SC8,{free:true});await CA.set(ca(Object.assign({t,expr:'happy'},climb(u*2),{dir:-1})));}
  else if(!st.post){const w=Math.sin(u*14)*8*seg(u,4.0,5.0);place(CA,1.75,top-(seg(u,4,5))*.05,.3,SC8,{free:true});await CA.set(ca({t,expr:u<4.4?'happy':'fear',aL:100+w,aR:100-w,eL:-10,eR:-10,handL:'open',handR:'open',lean:w,mouth:u>4.4?.5:0}));info.onTop=true;}
  else{const fl=fall(u,A1_BRK,[1.75,top,.3],[.9,1.6,.8],[0,0,0],{e:.15});const landed=fl.landed>0&&u>fl.landed;
    if(!landed){CAF.mesh.visible=true;CAF.mesh.scale.setScalar(SC8);CAF.mesh.position.set(fl.p.x,fl.p.y+HEADY*SC8,fl.p.z);await CAF.set(ca({t,rot:(u-A1_BRK)*420,expr:'shock',aL:160,aR:160,eL:-20,eR:-20,handL:'open',handR:'open',legL:-30,legR:25,mouth:.8}));}
    else{const sq=Math.exp(-(u-fl.landed)*6)*Math.cos((u-fl.landed)*20)*.25;place(CA,fl.p.x,0,fl.p.z,SC8,{free:true});await CA.set(ca({t,stance:'sit',bob:20,expr:'sleep',eyeFx:'spiral',emote:'stars',sq,aL:30,aR:30,jiggle:1}));info.landed=fl.p;}}
  return info;}
async function a2World(u,t){A2.visible=true;const st=a2State(u);const sc=SC8;
  if(u<3.0){const sw=Math.sin(t*10);place(CA,-3.4,0,1.9,sc,{free:true});await CA.set(ca({t,view:'3q',dir:1,expr:'happy',holdR:hammerSVG(sw*40),aR:110+sw*30,eR:-70,lookY:-.6}));}
  else{let x=lerp(-.9,-1.9,seg(u,3.0,4.3)),z=1.0;const ts=A2_TILT+.6;if(u>ts){const k=u-ts;x-=1.6*k*k;}
    const hang=x<=-2.9;const lp=hang?V(-2.95,0,z):V(x,.05,z);PLAT.updateMatrixWorld(true);const wp=PLAT.localToWorld(lp.clone());
    if(!hang){place(CA,wp.x,wp.y,wp.z,sc,{free:true});await CA.set(ca({t,view:u<4.3?'side':'front',dir:-1,expr:u<4.4?'happy':'fear',gesture:u<4.3?'push':undefined,toward:-1,lean:st.th*30,mouth:u>4.4?.6:0,aL:u>=4.3?120:undefined,aR:u>=4.3?120:undefined}));}
    else{const hy=wp.y-.19-HEADY*sc+.02;place(CA,wp.x-.22,Math.max(0,hy),wp.z,sc,{free:true});await CA.set(ca({t,expr:'fear',aL:175,aR:175,eL:-3,eR:-3,handL:'grip',handR:'grip',legL:Math.sin(t*12)*25,legR:-Math.sin(t*12)*25,mouth:.8}));}}
  return st;}
function cgLocal(u){// centro de gravidade da plataforma + carga (coordenada local x)
  let m=60,mx=60*-1.5;LOAD.forEach((g,i)=>{if(!g.visible)return;const w=[40,35,70][i];m+=w;mx+=w*g.position.x;});return mx/m;}

// ================= CENAS =================
const PADS=[0,2.0,.6,2.0,.4,1.5,0];
const SC=[
// ---------- S1 introdução ----------
{setup(d){ev(0,.1,'birds',.7);ev(0,1.5,'whoosh',.7);ev(0,2.6,'steps',.8);ev(0,4.1,'pop');ev(0,5.6,'ding',.8);ev(0,7.0,'whoosh');},
async up(u,d,t){const s=shots(u,[0,2.5,4.0,5.5,7.0],d),v=s.v;let h=blueprint(.5*seg(u,1.5,2.2));A1.visible=A2.visible=A3.visible=false;
  if(s.i>=1){let x,z=3.4,o;if(s.i===1){x=lerp(6.5,2.6,seg(v,0,1.4));o={view:'side',dir:-1,walk:t*3,run:true,holdF:hammerSVG(),aF:80,eF:-40,expr:'happy',wind:1};}
    else if(s.i===4){const k=seg(v,0,1.1);x=lerp(2.6,1.3,k);z=lerp(3.4,1.6,k);o={view:'back',walk:t*3,run:true,expr:'happy'};}
    else{x=2.6;o=s.i===2?{expr:'suspicious',gesture:'scratch',lookY:-.9}:{expr:'happy',aR:70,eR:-95,handR:'thumb',lookY:0};}
    place(CA,x,0,z,SC8,{free:true});await CA.set(ca(Object.assign({t},o)));}
  if(s.i===0){FOV=55;orbit(v,s.d,V(0,0,0),24,15,-1.0,-.25+Math.PI/2,14,7,5.0,{});FOCUS=V(0,4,0);h+=label('E SE VOCÊ',300,{size:100,p:seg(u,.2,.5)})+label('CONSTRUÍSSE UMA',410,{size:90,p:seg(u,.35,.65)})+label('CASA NA ÁRVORE?',530,{size:120,fill:'#ffd23f',p:seg(u,.5,.8)});}
  if(s.i===1){FOV=62;camShot(v,s.d,V(2.6,.35,6.2),V(2.4,.4,5.8),V(.2,5.5,0),V(0,6.5,0),{t});FOCUS=V(1,3,1);h+=dim(V(-.9,0,0),V(-.9,9,0),'9 m',seg(u,2.9,3.3));}
  if(s.i===2){FOV=50;camShot(v,s.d,V(3.2,1.45,6.2),V(3.0,1.4,5.9),V(2.6,1.2,3.4),V(2.6,1.2,3.4),{t});FOCUS=wpos(CA);const q=headUI(CA,.3);h+=popText('?',q.x+150,q.y-80,seg(u,4.1,4.4),{size:130,fill:'#fff'});}
  if(s.i===3){FOV=44;camShot(v,s.d,V(2.7,1.35,5.1),V(2.68,1.35,4.95),V(2.6,1.2,3.4),V(2.6,1.2,3.4),{t});FOCUS=wpos(CA);AP=.006;for(let k=0;k<3;k++)h+=tag(String(k+1),300+k*240,520,seg(u,5.6+k*.18,5.85+k*.18),['#ff3b30','#ff9a3a','#4cd964'][k],90);}
  if(s.i===4){FOV=52;orbit(v,s.d,V(0,0,0),13,11,.9,1.25,4.5,4,3.2);FOCUS=V(0,3,0);h+=label('QUAL PROJETO',330,{size:96,p:seg(u,7.05,7.3)})+label('FUNCIONA?',450,{size:130,fill:'#ffd23f',p:seg(u,7.2,7.45)});}
  worldTick(t);return h;}},
// ---------- S2 tentativa 1 ----------
{setup(d){ev(1,.1,'pop');for(let i=0;i<5;i++)ev(1,.4+i*.4+.15,'knock',.7);ev(1,3.05,'steps',.7);ev(1,4.05,'creak');ev(1,A1_BRK,'crack',1.2);ev(1,A1_BRK+.1,'planks');ev(1,5.85,'thud');ev(1,6.4,'boing',.7);},
async up(u,d,t){const s=shots(u,[0,1.4,3.0,4.0,5.0,6.3],d),v=s.v;let h=blueprint(.18);A2.visible=A3.visible=false;const info=await a1World(u,t);
  h+=badge(1,seg(u,.05,.3));const load=u<4?0:u<A1_BRK?lerp(0,95,seg(u,4,4.3)):0;
  if(s.i===0){FOV=50;camShot(v,s.d,V(5.0,2.8,5.2),V(4.6,3.0,4.8),V(1.7,3.0,.2),V(1.7,3.2,.2),{t});FOCUS=V(1.7,3.2,.2);}
  if(s.i===1){FOV=46;camShot(v,s.d,V(3.4,4.5,3.4),V(3.1,4.4,3.1),V(1.6,3.3,.1),V(1.6,3.3,.1),{t});FOCUS=V(1.6,3.3,.1);h+=dim(V(.95,3.6,-1.0),V(2.25,3.6,-1.0),'1,3 m',seg(u,2.2,2.5));}
  if(s.i===2){const P=wpos(CA);FOV=50;camShot(v,s.d,V(5.4,1.6,3.4),V(5.0,2.6,3.0),V(3.0,1.4,.5),V(2.6,2.8,.5),{t});FOCUS=P;h+=meter(950,900,0,100,'0 KG',seg(u,3.1,3.3));}
  if(s.i===3){FOV=46;camShot(v,s.d,V(3.7,4.1,2.8),V(3.5,4.0,2.6),V(1.7,3.9,.3),V(1.7,3.85,.3),{t,shake:[tremble(t,.01),0]});FOCUS=wpos(CA);h+=meter(950,900,load,100,Math.round(load)+' KG',1);const q=proj(BTHIN.localToWorld(V(1.3,.1,0)));if(u>4.3)h+=popText('CRRR...',q.x+80,q.y-140,seg(u,4.3,4.6),{size:70,fill:'#fff'});}
  if(s.i===4){FOV=52;FOVMUL=punch(u,A1_BRK,.2);camShot(v,s.d,V(6.8,3.4,6.6),V(7.2,3.2,7.0),V(1.8,2.2,.3),V(1.8,1.6,.3),{t,shake:shake(u,A1_BRK,.08,5)});FOCUS=V(1.8,2,.3);h+=popText('CRACK!',540,560,seg(u,A1_BRK,A1_BRK+.3),{size:170,fill:'#ff3b30'});if(info.landed)h+=puff(proj(info.landed).x,proj(info.landed).y,seg(u,5.75,6.3),9);}
  if(s.i===5){const P=info.landed||V(2.6,0,1.4);FOV=48;camShot(v,s.d,V(P.x+1.4,1.3,P.z+2.8),V(P.x+1.3,1.25,P.z+2.6),V(P.x,.65,P.z),V(P.x,.65,P.z),{t});FOCUS=V(P.x,.7,P.z);AP=.006;h+=xMark(900,420,seg(u,6.4,6.6),.8);}
  worldTick(t);return h;}},
// ---------- S3 replay 1 ----------
{setup(d){ev(2,.05,'rewind');ev(2,1.2,'slowmo',.8);ev(2,2.5,'pop');ev(2,4.0,'sting');ev(2,4.05,'crack',.6);},
async up(u,d,t){A2.visible=A3.visible=false;let u2,mode,spd;
  if(u<1.2){u2=lerp(7.0,3.6,u/1.2);mode='rew';spd='◀◀ x4';}else if(u<4.0){u2=lerp(3.6,4.98,(u-1.2)/2.8);mode='play';spd='0,25x';}else if(u<5.0){u2=4.98;mode='play';spd='PAUSA';}else{u2=lerp(4.98,6.2,(u-5)/(d-5));mode='play';spd='0,25x';}
  await a1World(u2,t);const hl=u>1.2?.5+.5*Math.sin(t*9):0;BT_OUTM.material.emissive.set('#ff2020');BT_OUTM.material.emissiveIntensity=hl*1.2;
  if(u<1.2){FOV=52;camShot(u,1.2,V(6.8,3.4,6.6),V(6.0,3.6,5.8),V(1.8,2.4,.3),V(1.8,3.2,.3),{t,shake:[tremble(t*3,.03),tremble(t*3+1,.02)]});}
  else if(u>=4.0&&u<5.0){FOV=42;const B=BT_OUT.localToWorld(V(.5,0,0));camShot(u-4.0,1.0,V(B.x+1.6,B.y-1.2,B.z+2.2),V(B.x+1.4,B.y-1.1,B.z+2.0),B,B,{t});}
  else{FOV=48;orbit(u-1.2,d-1.2,V(1.9,0,.3),6.0,5.4,1.15,.55,3.3,3.0,3.0);}
  FOCUS=V(1.8,3.2,.3);let h=replayHUD(t,mode,spd);
  const bq=proj(BT_OUT.localToWorld(V(.55,0,0)));
  if(u>2.4){h+=ring(bq.x,bq.y,120,seg(u,2.4,2.7))+tag('GALHO FINO',bq.x,bq.y-190,seg(u,2.5,2.8),'#ff3b30',60);}
  if(u>1.6&&u<5.0){const cq=proj(V(1.75,3.9,.3));h+=arrowD(cq.x,cq.y-60,220,'#ff3b30',seg(u,1.6,2.0));h+=tag('95 KG',cq.x+170,cq.y-40,seg(u,1.8,2.1),'#11263f',54);}
  if(u>=4.0)h+=tag('SEM APOIO FIRME',540,1240,seg(u,4.0,4.3),'#ff3b30',70)+xMark(540,1050,seg(u,4.05,4.3),.9);
  worldTick(t);return h;}},
// ---------- S4 tentativa 2 ----------
{setup(d){ev(3,.1,'pop');for(let k=0;k<6;k++)ev(3,.5+k*.4,'knock',.6);ev(3,3.05,'drag',.8);ev(3,A2_TILT,'creak');ev(3,A2_TILT+.35,'pop',.8);ev(3,5.4,'thud');ev(3,5.7,'thud',.8);ev(3,6.05,'scream',.8);},
async up(u,d,t){const s=shots(u,[0,1.5,3.0,4.4,6.0],d),v=s.v;let h=blueprint(.18);A1.visible=true;a1State(99);A3.visible=false;BT_OUTM.material.emissiveIntensity=0;
  const st=await a2World(u,t);h+=badge(2,seg(u,.05,.3));
  if(s.i===0){FOV=54;camShot(v,s.d,V(-9.5,4.6,7.0),V(-8.8,4.8,6.4),V(-1.6,2.6,0),V(-1.6,2.8,0),{t});FOCUS=V(-2,3,0);}
  if(s.i===1){FOV=48;camShot(v,s.d,V(-4.8,5.4,3.0),V(-4.3,5.2,3.3),V(-1.9,3.4,0),V(-1.9,3.4,0),{t});FOCUS=V(-1.9,3.4,0);h+=dim(PLAT.localToWorld(V(0,.15,-1.4)),PLAT.localToWorld(V(-3,.15,-1.4)),'3 m',seg(u,2.2,2.5));h+=checkTag('REFORÇADA?',540,560,seg(u,2.4,2.7));}
  if(s.i===2){FOV=52;camShot(v,s.d,V(.6,6.0,3.9),V(.5,5.9,3.6),V(-2.0,3.5,.2),V(-2.1,3.5,.2),{t});FOCUS=V(-2,3.8,.4);const ld=Math.round(lerp(60,205,seg(u,3,4.3)));h+=meter(950,900,ld,220,ld+' KG',1);}
  if(s.i===3){FOV=54;camShot(v,s.d,V(-7.0,2.9,5.8),V(-7.3,2.7,6.1),V(-2.2,2.6,0),V(-2.2,2.2,0),{t,shake:shake(u,5.4,.05,5)});FOCUS=V(-2.2,2.5,0);h+=popText('INCLINANDO!',540,560,seg(u,4.6,4.9),{size:120,fill:'#ff9a3a'});}
  if(s.i===4){PLAT.updateMatrixWorld(true);const E=PLAT.localToWorld(V(-2.95,0,1.0));FOV=50;camShot(v,s.d,V(E.x-3.0,E.y-.6,E.z+1.2),V(E.x-2.7,E.y-.55,E.z+1.05),V(E.x,E.y-.45,E.z),V(E.x,E.y-.45,E.z),{t});FOCUS=V(E.x,E.y-.5,E.z);AP=.005;const q=headUI(CA,.25);h+=sweat(q.x,q.y,t)+popText('SOCORRO!',q.x,q.y-260,seg(u,6.05,6.35),{size:90,fill:'#fff'});}
  worldTick(t);return h;}},
// ---------- S5 replay 2 ----------
{setup(d){ev(4,.05,'rewind');ev(4,1.2,'slowmo',.8);ev(4,3.0,'pop');ev(4,4.5,'sting');},
async up(u,d,t){A1.visible=true;a1State(99);A3.visible=false;let u4,mode,spd;
  if(u<1.2){u4=lerp(7.2,3.0,u/1.2);mode='rew';spd='◀◀ x4';}else if(u<4.4){u4=lerp(3.0,4.85,(u-1.2)/3.2);mode='play';spd='0,25x';}else if(u<5.4){u4=4.85;mode='play';spd='PAUSA';}else{u4=lerp(4.85,5.9,(u-5.4)/(d-5.4));mode='play';spd='0,25x';}
  await a2World(u4,t);
  if(u<1.2){FOV=54;camShot(u,1.2,V(-7.3,2.7,6.1),V(-6.5,3.2,5.0),V(-2.2,2.2,0),V(-2.0,3.0,0),{t,shake:[tremble(t*3,.03),0]});}
  else if(u>=4.4&&u<5.4){FOV=50;camShot(u-4.4,1.0,V(-6.8,1.4,2.4),V(-6.5,1.5,2.2),V(-1.6,3.0,0),V(-1.6,3.0,0),{t});}
  else{FOV=48;camShot(u-1.2,d-1.2,V(-2.0,3.3,7.4),V(-2.3,3.2,7.0),V(-1.9,3.1,0),V(-1.9,3.0,0),{t});}
  FOCUS=V(-1.9,3.2,0);let h=replayHUD(t,mode,spd);PLAT.updateMatrixWorld(true);
  if(u>1.4){const a=proj(PLAT.localToWorld(V(0,.06,1.4))),b=proj(PLAT.localToWorld(V(-1.7,.06,1.4)));h+=`<line x1="${f(a.x)}" y1="${f(a.y+30)}" x2="${f(b.x)}" y2="${f(b.y+30)}" stroke="#4cd964" stroke-width="26" stroke-linecap="round" opacity="${f(seg(u,1.4,1.7))}"/>`+tag('APOIO',(a.x+b.x)/2,(a.y+b.y)/2+110,seg(u,1.5,1.8),'#2e9e4a',54);}
  if(u>1.8){const cg=cgLocal(u4);const c=proj(PLAT.localToWorld(V(cg,.5,0))),g=proj(PLAT.localToWorld(V(cg,-2.5,0)));const out=cg<-1.7;
    h+=`<line x1="${f(c.x)}" y1="${f(c.y)}" x2="${f(g.x)}" y2="${f(g.y)}" stroke="#fff" stroke-width="6" stroke-dasharray="16 12"/><circle cx="${f(c.x)}" cy="${f(c.y)}" r="34" fill="${out?'#ff3b30':'#ffd23f'}" stroke="#141414" stroke-width="7"/><text x="${f(c.x)}" y="${f(c.y+14)}" font-family="Anton" font-size="38" fill="#141414" text-anchor="middle">CG</text>`;}
  if(u>3.0){LOAD.forEach((gr,i)=>{if(!gr.visible)return;const q=proj(gr.getWorldPosition(V(0,0,0)).add(V(0,1.0,0)));h+=arrowD(q.x,q.y-200,170,'#ff3b30',seg(u,3.0+i*.15,3.3+i*.15),.9);});const tq=proj(PLAT.localToWorld(V(-.4,.6,0)));h+=arrowD(tq.x,tq.y-120,70,'#4cd964',seg(u,3.3,3.6),.7);}
  if(u>=4.4)h+=tag('PESO SÓ DE UM LADO',540,1250,seg(u,4.45,4.75),'#ff3b30',64)+tag('CG FORA DO APOIO',540,1080,seg(u,4.6,4.9),'#11263f',56);
  worldTick(t);return h;}},
// ---------- S6 tentativa 3 ----------
{setup(d){ev(5,.1,'pop');ev(5,.3,'blueprint');for(let k=0;k<4;k++)ev(5,1.4+k*.18,'thud',.6);ev(5,2.6,'knock',.6);ev(5,3.0,'knock',.6);ev(5,3.2,'ding',.6);for(let k=0;k<8;k++)ev(5,4.6+k*.18,'knock',.45);ev(5,5.3,'ding',.6);for(let k=0;k<6;k++)ev(5,6.2+k*.25,'knock',.5);ev(5,8.2,'whoosh',.7);ev(5,9.5,'knock',.5);ev(5,10.2,'ding',.8);},
async up(u,d,t){const s=shots(u,[0,1.2,3.0,4.6,6.2,8.1,9.6],d),v=s.v;let h=blueprint(.3);A1.visible=A2.visible=false;BT_OUT.visible=false;B_OK.visible=BTHIN.visible=false;
  a3State(u,true);a3Decor(t,false);A3.visible=true;h+=badge(3,seg(u,.05,.3));
  // Caio trabalhando
  let o,x,y=0,z;if(u<1.2){x=3.4;z=3.6;o={expr:'happy',gesture:'think',holdR:clipSVG(),aR:60,eR:-100};}
  else if(u<3.0){x=2.9;z=1.3;const sw=Math.sin(t*6);o={expr:'angry',holdR:shovelSVG(),aR:60+sw*25,eR:-60,aL:70+sw*25,eL:-60,lean:10+sw*6};}
  else if(u<4.6){x=3.6;z=3.2;o={expr:'happy',aR:150,eR:-20,handR:'point',lookY:-.7};}
  else if(u<9.6){x=1.95;z=1.95;y=DECKY;const sw=Math.sin(t*10);o={view:'3q',dir:-1,expr:'happy',holdR:hammerSVG(sw*40),aR:100+sw*30,eR:-70};}
  else{const k=seg(u,9.7,d-.1);z=lerp(6.6,2.2,k);x=.9;y=z>2.5?Math.max(0,DECKY*(1-(z-2.5)/4.2)):DECKY;o={view:'back',walk:t*1.8,expr:'happy'};}
  place(CA,x,y,z,SC8,{free:true});await CA.set(ca(Object.assign({t},o)));
  if(s.i===0){FOV=54;camShot(v,s.d,V(10,6,10),V(9,5.5,9),V(0,3,0),V(0,3,0),{t});FOCUS=V(0,3,0);h+=label('PLANTA NOVA',420,{size:100,fill:'#5fe0ff',p:seg(u,.3,.6)});}
  if(s.i===1){FOV=52;camShot(v,s.d,V(5.4,1.1,5.2),V(5.0,1.6,4.8),V(2.0,1.0,2.0),V(1.6,2.2,1.6),{t,shake:shake(u,1.4,.02,6)});FOCUS=V(2.2,1.5,2.2);h+=checkTag('PILARES PRÓPRIOS',540,520,seg(u,2.2,2.5));}
  if(s.i===2){FOV=52;camShot(v,s.d,V(8.5,5.8,6.0),V(5.5,5.4,9.0),V(0,3.0,0),V(0,3.2,0),{t});FOCUS=V(0,3,0);h+=checkTag('SEM PREGAR NA ÁRVORE',540,520,seg(u,3.3,3.6));}
  if(s.i===3){FOV=52;camShot(v,s.d,V(1.8,9.0,4.6),V(1.4,8.6,4.2),V(0,3.4,0),V(0,3.4,0),{t});FOCUS=V(0,3.4,0);const c=proj(V(0,DECKY,0)),e=proj(V(1.0,DECKY,0));h+=ring(c.x,c.y,Math.abs(e.x-c.x),seg(u,5.2,5.5),'#4cd964','26 14')+checkTag('FOLGA P/ ÁRVORE CRESCER',540,520,seg(u,5.3,5.6));}
  if(s.i===4){FOV=52;orbit(v,s.d,V(0,0,0),9.5,9,1.25,1.95,5.4,5.0,4.0);FOCUS=V(0,4,0);}
  if(s.i===5){FOV=50;camShot(v,s.d,V(5.4,7.2,6.2),V(5.0,7.0,5.8),V(0,5.3,0),V(0,5.4,0),{t});FOCUS=V(0,5.5,0);}
  if(s.i===6){FOV=52;camShot(v,s.d,V(2.4,2.2,11.0),V(2.0,2.6,10.2),V(.9,2.4,3.5),V(.9,3.0,3.0),{t});FOCUS=wpos(CA);h+=meter(950,900,lerp(0,250,seg(u,9.8,10.6)),600,'OK!',seg(u,9.8,10.0));
    for(const[px,pz]of[[-2.2,2.2],[2.2,2.2]]){const q=proj(V(px,DECKY+.6,pz));h+=arrowD(q.x,q.y-160,120,'#4cd964',seg(u,10.1,10.4),.8);}h+=checkTag('PESO DISTRIBUÍDO',540,520,seg(u,10.2,10.5));}
  worldTick(t);return h;}},
// ---------- S7 resultado final ----------
{setup(d){ev(6,.1,'ding');ev(6,.3,'sparkle');ev(6,2.2,'bark');ev(6,2.9,'bark',.8);ev(6,4.1,'fanfare');ev(6,6.6,'pop');ev(6,d-1.6,'ding',.8);},
async up(u,d,t){const s=shots(u,[0,2.0,4.0,6.5,8.5],d),v=s.v;let h='';A1.visible=A2.visible=false;BT_OUT.visible=false;B_OK.visible=BTHIN.visible=false;A3.visible=true;a3State(99,false);a3Decor(t,seg(u,0,.6)>0);
  const PX=-.9,PZ=2.0;place(CA,PX,DECKY,PZ,SC8,{free:true});const fin=s.i>=3;
  await CA.set(ca({t,expr:fin?(s.i===4?'happy':'smirk'):'laugh',lookCam:fin,aR:s.i===3?70:150+Math.sin(t*10)*20,eR:s.i===3?-95:-30,handR:s.i===3?'thumb':'wave',aL:20,mouth:fin?0:.4}));
  DOG.mesh.visible=true;const dx=1.9+Math.sin(t*1.6)*.4;DOG.mesh.scale.setScalar(.7);DOG.mesh.position.set(dx,.15*0+150*K*.7+.02,2.9);await DOG.set(dog({t,walk:t*2,dir:Math.cos(t*1.6)>0?1:-1}));
  if(s.i===0){FOV=52;camShot(v,s.d,V(1.6,1.0,9.0),V(1.6,5.8,8.2),V(0,4.2,1),V(0,4.6,1),{t});FOCUS=V(0,4.5,1);h+=label('PRONTA!',380,{size:180,fill:'#ffd23f',p:seg(u,.5,.8)});for(let k=0;k<4;k++)h+=sparkle(180+k*240,560+Math.sin(t*3+k)*40,t+k,40);}
  if(s.i===1){FOV=52;camShot(v,s.d,V(7.6,2.0,7.0),V(7.0,2.2,6.4),V(2.4,2.2,1.6),V(2.4,2.4,1.6),{t});FOCUS=V(2.8,1.6,1.5);const q=proj(DOG.mesh.position);if(u>2.2)h+=popText('AU AU!',q.x,q.y-180,seg(u,2.2,2.5),{size:80,fill:'#fff'});}
  if(s.i===2){FOV=50;orbit(v,s.d,V(0,0,0),15,13.5,.55,1.95,8,6.4,4.2);FOCUS=V(0,4,0);h+=label('MANSÃO',330,{size:150,fill:'#ffd23f',p:seg(u,4.1,4.4)})+label('NAS ALTURAS!',480,{size:120,p:seg(u,4.3,4.6)});}
  if(s.i===3){FOV=44;camShot(v,s.d,V(PX+.1,DECKY+1.35,PZ+2.1),V(PX+.1,DECKY+1.35,PZ+1.85),V(PX,DECKY+1.2,PZ),V(PX,DECKY+1.2,PZ),{t});FOCUS=wpos(CA);AP=.006;const q=headUI(CA,.3);h+=sparkle(q.x+230,q.y-140,t,50)+sparkle(q.x-230,q.y-60,t+1,38);
    h+=`<g opacity="${f(seg(u,6.7,7.0))}"><rect x="190" y="1230" width="700" height="70" rx="35" fill="#11263f" opacity=".8"/><text x="540" y="1278" font-family="Anton" font-size="40" fill="#fff" text-anchor="middle">PROJETO REAL? CONSULTE UM PROFISSIONAL</text></g>`;}
  if(s.i===4){FOV=54;camShot(v,s.d,V(8.5,4.2,12.5),V(9.5,4.6,13.8),V(0,4.2,0),V(0,4.2,0),{t});FOCUS=V(0,4,0);const cp=seg(u,d-1.6,d-1.25);if(cp>0)h+=`<g transform="translate(540 1330) scale(${(back(cp)*(1+Math.sin(t*8)*.03)).toFixed(3)})"><rect x="-300" y="-70" width="600" height="130" rx="65" fill="#ff2d55" stroke="#141414" stroke-width="10"/><text y="28" class="lb" font-size="84" fill="#fff" text-anchor="middle">SIGA PARA MAIS</text></g>`;}
  worldTick(t);return h;}}
];

// ================= legendas e linha do tempo =================
const HL=[['ÁRVORE','FUNCIONA'],['TÁBUAS','GALHOS'],['ERRADO','GALHOS','SUSTENTAR'],['MAIOR','REFORÇAR'],['EQUILÍBRIO','PESO'],['INDEPENDENTE','SUSTENTAÇÃO','CASA'],['PRONTA','MANSÃO','ALTURAS']];
const A_OFF=.15;let SCN=[],GROUPS=[];const norm=w=>w.replace(/[^\wÀ-ÿ]/g,'');
function setup(T){let t=0;T.forEach((b,i)=>{const d=b.dur+A_OFF+.3+PADS[i]+(i===T.length-1?1.2:0);SCN.push({s:t,d});
  const words=b.text.toUpperCase().split(/\s+/).filter(Boolean),tot=words.reduce((a,w)=>a+w.length+1,0);let c=t+A_OFF,cur=[];
  words.forEach((w,k)=>{const wd=b.dur*(w.length+1)/tot;cur.push({w,t0:c,t1:c+wd,hl:HL[i].includes(norm(w))});c+=wd;if(cur.length===3||/[.,:!?]$/.test(w)||k===words.length-1){GROUPS.push({words:cur,t0:cur[0].t0,end:t+d});cur=[];}});t+=d;});
  for(let g=0;g<GROUPS.length-1;g++)GROUPS[g].end=Math.min(GROUPS[g].end,GROUPS[g+1].t0+0);GROUPS[GROUPS.length-1].end=t-1.2;
  SC.forEach((sc,i)=>sc.setup(SCN[i].d));return{total:t,scenes:SCN};}
function caption(t){const g=GROUPS.find(g=>t>=g.t0&&t<g.end);if(!g)return'';
  const p=seg(t,g.t0,g.t0+.16),s=.75+.25*back(p),len=g.words.reduce((a,w)=>a+w.w.length+1,0),sz=Math.min(108,940/(len*.47));
  const sp=g.words.map(w=>{const on=t>=w.t0,hl=on&&w.hl,j=hl?Math.sin(t*40)*Math.max(0,1-(t-w.t0)*4)*6:0;return `<tspan fill="${on?(w.hl?'#ffd23f':'#ffffff'):'#d9d9d9'}" dy="${f(j)}">${w.w}</tspan>`;}).join(' ');
  return `<g transform="translate(540 1600) scale(${s.toFixed(3)})"><text class="cap" y="8" font-size="${f(sz)}" fill="#000" stroke="#000" stroke-width="18" opacity=".4" text-anchor="middle">${g.words.map(w=>w.w).join(' ')}</text><text class="cap" font-size="${f(sz)}" stroke="#111" stroke-width="18" text-anchor="middle">${sp}</text></g>`;}
const CUTS=[[0,2.5,4.0,5.5,7.0],[0,1.4,3.0,4.0,5.0,6.3],[0,1.2,4.0,5.0],[0,1.5,3.0,4.4,6.0],[0,1.2,4.4,5.4],[0,1.2,3.0,4.6,6.2,8.1,9.6],[0,2.0,4.0,6.5,8.5]];
const shotStart=(i,u)=>{let b=0;for(const c of CUTS[i])if(u>=c)b=c;return u-b;};
window.render=async function(t){NOW=t;
  let i=SCN.findIndex(s=>t>=s.s&&t<s.s+s.d);if(i<0)i=SCN.length-1;const u=t-SCN[i].s,d=SCN[i].d;
  SPRS.forEach(s=>s.mesh.visible=false);FOVMUL=1;FOCUS=null;AP=.001;BT_OUT.visible=true;B_OK.visible=BTHIN.visible=true;BT_OUTM.material.emissiveIntensity=0;WIRE.children.forEach(e=>e.visible=false);
  const ui=await SC[i].up(u,d,t);
  SPRS.forEach(s=>{if(s.mesh.visible)bill(s);});
  const fd=FOCUS?cam.position.distanceTo(FOCUS):8;bokeh.uniforms.focus.value=fd;bokeh.uniforms.aperture.value=AP;bokeh.uniforms.maxblur.value=AP>.004?.014:.006;
  composer.render();
  document.getElementById('ui').innerHTML=ui;document.getElementById('caps').innerHTML=caption(t);
  document.getElementById('flash').setAttribute('opacity',f(.35*(1-seg(shotStart(i,u),0,.12))*(t>.05?1:0)));
  const fr=Math.floor(t*30),gr=document.getElementById('grain');gr.setAttribute('x',f(-60+rnd(fr)*60));gr.setAttribute('y',f(-60+rnd(fr+5)*60));
};
window.INFO=setup(window.TIMING);window.GROUPS=GROUPS;
window.EVENTS=EV.map(([s,u,n,g])=>({t:+(SCN[s].s+u).toFixed(3),name:n,gain:g}));
window.WINDCURVE=[];for(let t=0;t<window.INFO.total;t+=.1)window.WINDCURVE.push(.3);
window.DBG={cam,scene,THREE};
await window.render(0);
window.ready=true;
</script>
</body></html>

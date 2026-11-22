// ================= objetos desenhados: guarda-chuva, paraquedas, rebobinar, HUD =================
function umbrellaSVG(x,y,s,open,rot=0,inside=0,tt=0){const L=250*s,R=(18+196*open)*s,H=((.38+.6*open)*130*s)*(inside?-.55:1),top=y-L,cols=['#e2283b','#ffd23f','#e2283b','#ffd23f','#e2283b'];
  let g=`<g transform="rotate(${f(rot)} ${f(x)} ${f(y)})"><path d="M${f(x)} ${f(y+6*s)} V${f(top)}" stroke="#2a2a30" stroke-width="${f(11*s)}" stroke-linecap="round"/><path d="M${f(x)} ${f(y+6*s)} q0 ${f(34*s)} ${f(-34*s)} ${f(34*s)}" stroke="#2a2a30" stroke-width="${f(11*s)}" fill="none" stroke-linecap="round"/>`;
  for(let i=0;i<5;i++){const x0=x-R+2*R*i/5,x1=x-R+2*R*(i+1)/5,tipY=top-H,bend=inside?(i%2?1:-1)*20*s*Math.sin(tt*20):0;
    g+=`<path d="M${f(x)} ${f(tipY)} Q${f(x0+(x-x0)*.1)} ${f(top-H*.55+bend)} ${f(x0)} ${f(top)} Q${f((x0+x1)/2)} ${f(top+(inside?-1:1)*26*s*open)} ${f(x1)} ${f(top)} Q${f(x1+(x-x1)*.1)} ${f(top-H*.55-bend)} ${f(x)} ${f(tipY)}Z" fill="${cols[i]}" stroke="#141414" stroke-width="${f(5*s)}" stroke-linejoin="round"/>`;}
  g+=`<circle cx="${f(x)}" cy="${f(top-H)}" r="${f(7*s)}" fill="#2a2a30"/></g>`;return g;}
function chuteSVG(hx,hy,s,p,t){const W=360*s*(.15+.85*p),Hh=190*s*(.3+.7*p),cy=hy-420*s,fl=Math.sin(t*24)*18*s*(1-p),cols=['#ff7a1a','#fff','#ff7a1a','#fff','#ff7a1a','#fff'];let g='';
  for(const dx of[-1,-.5,0,.5,1])g+=`<line x1="${f(hx+(dx*W*.9)+fl)}" y1="${f(cy)}" x2="${f(hx+dx*50*s)}" y2="${f(hy+10*s)}" stroke="#2a2a30" stroke-width="${f(4*s)}" opacity=".85"/>`;
  for(let i=0;i<6;i++){const x0=hx-W+2*W*i/6+fl,x1=hx-W+2*W*(i+1)/6+fl;g+=`<path d="M${f(x0)} ${f(cy)} Q${f(x0+(x1-x0)*.1)} ${f(cy-Hh*1.15)} ${f(hx+fl*.4)} ${f(cy-Hh)} Q${f(x1-(x1-x0)*.1)} ${f(cy-Hh*1.15)} ${f(x1)} ${f(cy)} Q${f((x0+x1)/2)} ${f(cy+22*s*p)} ${f(x0)} ${f(cy)}Z" fill="${cols[i]}" stroke="#141414" stroke-width="${f(4*s)}"/>`;}return g;}
function depthHUD(d,x=64,y0=420,y1=1500){let g=`<rect x="${x-22}" y="${y0-24}" width="44" height="${y1-y0+48}" rx="22" fill="#1c1630" opacity=".85" stroke="#fff" stroke-width="4"/>`;const yy=y0+(y1-y0)*cl(d/PD);g+=`<rect x="${x-14}" y="${y0}" width="28" height="${f(yy-y0)}" rx="14" fill="#ffd23f"/>`;
  for(const m of[0,5,10,15,20])g+=`<line x1="${x+28}" y1="${y0+(y1-y0)*m/PD}" x2="${x+54}" y2="${y0+(y1-y0)*m/PD}" stroke="#fff" stroke-width="4"/><text class="mt" x="${x+62}" y="${y0+(y1-y0)*m/PD+10}" font-size="30" fill="#fff" stroke="#141414" stroke-width="6" paint-order="stroke">${m}m</text>`;
  return g+`<circle cx="${x}" cy="${f(yy)}" r="22" fill="#fff" stroke="#141414" stroke-width="6"/>`;}
function rewindFX(u,t,d){let g=FX2.vhsScanlines(0,0,t,1)+FX2.glitchBars(0,0,t,1)+FX2.filmScratches(0,0,t,.8);const bl=Math.floor(t*3)%2;
  const tc=Math.max(0,(1-u/d)*21);g+=`<g transform="translate(110 150)"><path d="M0 0 L56 -34 L56 34Z M56 0 L112 -34 L112 34Z" fill="#fff" stroke="#000" stroke-width="6" opacity="${bl?1:.5}"/><text class="mt" x="140" y="18" font-size="64" fill="#fff" stroke="#000" stroke-width="10" paint-order="stroke">REW</text></g><text class="mt" x="960" y="170" font-size="56" fill="#fff" stroke="#000" stroke-width="9" paint-order="stroke" text-anchor="end">00:${String(Math.floor(tc)).padStart(2,'0')}:${String(Math.floor((tc%1)*30)).padStart(2,'0')}</text>`;
  const ty=(t*900)%1920;g+=`<rect y="${f(ty)}" width="1080" height="${f(60+Math.sin(t*9)*30)}" fill="#fff" opacity=".16"/><rect width="1080" height="1920" fill="#2a6aff" opacity=".08"/>`;return g;}
function vsBars(u){const k=ease(cl(u));return `<rect x="150" y="1500" width="140" height="${f(1500*0)+120}" fill="none"/>`;}

// ================= cenas =================
const EV=[];const ev=(s,u,n,g=1)=>{EV.push([s,u,n,g]);return u;};
const LS=.8,FY=FEET*LS;
const BOYK2=BOYK;
function pitCam(yb,u,d,t,o={}){const sh=o.shake||[0,0],dist=o.dist||6.4;camAt2(V((o.x||0)+sh[0]+Math.sin(t*.9)*.05,yb+(o.dy??.5)+sh[1],dist),V(0,yb+(o.ly??.2),0),t);FOCUS=V(0,yb+.3,0);AP=o.ap||.003;}
function fallPos(t,t0,t1,drag,dmax=PD){const k=cl((t-t0)/(t1-t0)),T=drag?2.08:2.02,r=physFall(k*T,drag);return{d:Math.min(dmax,r.d),v:r.v,k};}
// pose de queda (braços e pernas batendo, celular voando)
function flail(t,mode){const a=Math.sin(t*5),b=Math.sin(t*5+1.7);return {expr:'shock',aL:130+a*28,aR:130+b*28,eL:-25,eR:-25,handL:'open',handR:'open',legL:-25+b*16,legR:25+a*16,pupil:.7,mouth:.7,wind:1.3,windDir:-1,noPhone:true,rot:Math.sin(t*2)*12};}
const phoneFly=(t,u,x,y)=>`<g transform="translate(${f(x)} ${f(y)}) rotate(${f(t*240)}) scale(1.5)">${PHONE_SVG(0).replace('translate(0 128)','')}</g>`;
function showUmb(S,aR,eR,op,o={}){cam.updateMatrixWorld();const hand=svw(S,...hsv(1,aR,eR));UM.g.visible=true;UM.g.position.set(hand.x+(o.dx||0),hand.y-.03,hand.z+.07);UM.g.rotation.set(0,0,(o.tilt||0)*Math.PI/180);UM.g.scale.setScalar(o.sc||1);UM.update(op,o.t||0,o.fl||0,o.inv||0,o.bil||0);}
const SC=[
// 1 terreno: o garoto anda em direção à câmera
{s:0,e:3,w:'top',caps:[[.2,'E SE TU'],[1.4,'CAÍSSE...']],hl:['CAÍSSE'],ev:[[.0,'wind',.6],[.3,'steps',.5],[.95,'steps',.5],[1.6,'steps',.5],[2.3,'steps',.5]],
async up(u,d,t){setPit({});planksAt(t,0);const z=lerp(-4.6,-1.6,u/d);
  await putB(HERO,kid,V(0,FY,z),LS,{t,walk:t*1.7,expr:'neutral',look:.2,lookY:.5,reachR:[90,240],blink:blink(t,2)});
  camShot(u,d,V(.8,.5,4.2),V(.4,.5,3.6),V(0,.85,-2.6),V(0,.9,-2.2),{t});FOCUS=V(0,.8,z);AP=.0025;FOVMUL=1.0;return '';}},
// 2 close: a tábua estala
{s:3,e:6,w:'top',caps:[[.1,'...NUM BURACO']],hl:['BURACO'],ev:[[.2,'steps',.5],[.8,'creak',.9],[1.5,'creak',1],[2.2,'creak',1.1],[2.7,'crack',.8]],
async up(u,d,t){setPit({});const B=0;planksAt(t,0);const z=lerp(-3.6,-.6,ease(u/d));
  await putB(HERO,kid,V(0,FY,z),LS,{t,walk:t*1.3,expr:u>1.4?'fear':'neutral',lookY:-.6,look:0,reachR:[90,240]});
  camShot(u,d,V(.9,.3,4.8),V(.45,.3,3.9),V(0,.2,-1.2),V(0,.2,-1.2),{t,shake:shake(u,2.7,.03,5)});FOCUS=V(0,.1,z);AP=.012;
  const q=proj(0,.1,-.9),p=seg(u,.6,2.7);let h=FX2.groundCrack(q.x,q.y+260,t,p,{s:1.8})+FX2.wobbleLines(q.x,q.y+200,t,seg(u,1.3,2.7),{s:1.4});
  for(let k=0;k<8;k++){const ph=(t*1.2+k/8)%1;if(p>.3)h+=`<circle cx="${f(q.x+(k-4)*60+Math.sin(t*3+k)*20)}" cy="${f(q.y+300+ph*160)}" r="${f(3+k%3*2)}" fill="#c8a878" opacity="${f(.8*(1-ph))}"/>`;}
  return h;}},
// 3 as tábuas cedem: começa a cair (vista de cima)
{s:6,e:9,w:'top',caps:[[.2,'DE 20'],[1.2,'METROS?']],hl:['20','METROS'],ev:[[.4,'crack',1.2],[1.0,'crack',1.3],[1.1,'rumble',.9],[1.25,'wind_fall',1],[2.6,'wind_fall',.6]],
async up(u,d,t){setPit({});const B=7.0;planksAt(t,B);const fp=fallPos(t,7.2,12.4,0),dep=t>7.2?fp.d:0;
  const o=t<7.2?{t,expr:'fear',lookY:-.7,aL:60,aR:60,eL:-50,eR:-50,handL:'open',handR:'open',rot:Math.sin(t*40)*3}:Object.assign({t},flail(t));
  await putB(BIG,kid,V(0,FY-dep,-.3),LS,o);
  const cy=lerp(5.5,FY+.3-dep*.9+1.2,seg(t,7.4,9)),dz=lerp(6.8,7.3,u/d);
  camAt2(V(Math.sin(t*1.1)*.2,Math.max(cy,-dep+1.6),dz),V(0,Math.max(-1.5,-dep*.7),0),t,shake(u,1.0,.08,4));FOCUS=V(0,-dep,0);AP=.004;FOVMUL=1.06;
  const hb=BOY.root.position;PHONE3.visible=t>7.15;if(t>7.15){const k=t-7.15;PHONE3.position.set(hb.x+.55+.25*Math.sin(k*2),hb.y+1.15+.25*Math.sin(k*3)+Math.min(.5,k*.5),hb.z+.25);PHONE3.rotation.set(k*4,k*5,k*3);}
  CHIPS.show(V(0,.1,-.2),t>7.0?(t-7.0)*.9:0);return '';}},
// 4 queda livre em corte lateral: velocímetro
{s:9,e:12.5,w:'pit',caps:[[.2,'QUEDA LIVRE.'],[1.5,'#KMH']],hl:['QUEDA','LIVRE'],ev:[[.0,'wind_fall',1],[.6,'whoosh',.5],[1.4,'whoosh',.5],[2.2,'whoosh',.5]],
async up(u,d,t){setPit({noPlanks:true});const fp=fallPos(t,7.2,12.4,0);
  await putB(BIG,kid,V(0,FY-fp.d,0),LS,flail(t));{const hb=BOY.root.position,k=t-7.15;PHONE3.visible=true;PHONE3.position.set(hb.x+.55+.25*Math.sin(k*2),hb.y+1.35+.25*Math.sin(k*3),hb.z+.25);PHONE3.rotation.set(k*4,k*5,k*3);}pitCam(-fp.d,u,d,t,{shake:[tremble(t,.01),tremble(t+3,.01)],dist:6.0});FOVMUL=1.08;
  let h=depthHUD(fp.d);for(let k=0;k<30;k++){const x=rnd(k)*1080,y=((rnd(k+3)*1920-t*(1500+fp.v*120))%2400+2400)%2400-200;h+=`<line x1="${f(x)}" y1="${f(y)}" x2="${f(x)}" y2="${f(y+140+fp.v*8)}" stroke="#fff" stroke-width="3" opacity="${f(.08+fp.v/40*.12)}"/>`;}
  h+=`<text class="mt" x="540" y="1500" font-size="46" fill="#fff" stroke="#141414" stroke-width="9" paint-order="stroke" text-anchor="middle">PROFUNDIDADE ${fp.d.toFixed(1).replace('.',',')} m</text>`;if(u>1.5)h+=gaugeSVG(850,1180,180,Math.min(71,fp.v*3.6));return h;}},
// 5 congela a imagem: 2 segundos
{s:12.5,e:16,w:'pit',caps:[[.2,'#SEG'],[2.0,'E O CHÃO...']],hl:['SEGUNDOS','CHÃO'],ev:[[.1,'heart',1.1],[.9,'heart',1.1],[1.7,'heart',1.2],[2.5,'heart',1.3],[3.3,'rumble',.8]],
async up(u,d,t){setPit({noPlanks:true});const dep=19+.45*ease(seg(t,12.5,15.9)),f1=Math.max(0,1-seg(u,0,.3));
  await putB(BIG,kid,V(0,FY-dep,0),LS,Object.assign(flail(t*.15),{rot:Math.sin(t*.4)*5,mouth:.9,pupil:.6}));
  const z=lerp(6.0,4.0,ease(u/d));pitCam(-dep,u,d,t,{dist:z,shake:[tremble(t,.006),tremble(t+3,.006)],ap:.01});FOVMUL=1.04+.04*Math.sin(u*6.28*1.2*1.6)*(u/d);
  return FX2.vignettePulse(0,0,t,1,{col:'#500'})+depthHUD(dep)+`<rect width="1080" height="1920" fill="#000" opacity="${f(.12*seg(u,1,d))}"/>`;}},
// 6 impacto
{s:16,e:19,w:'pit',caps:[[.5,'NÃO TERMINA'],[1.6,'BEM.']],hl:['BEM'],ev:[[.0,'boom',1.4],[.05,'thud',.9],[.5,'stars',.7]],
async up(u,d,t){setPit({noPlanks:true});const bx=u<.12?0:1;
  await putB(BIG,kid,V(0,FY-PD+.05+(u<.12?.4:0),0),LS,{t,expr:'shock',eyeFx:u<.12?undefined:'spiral',rot:u<.12?0:-90,noPhone:true,aL:60,aR:60,eL:-30,eR:-30,mouth:.3,pupil:.5,stars:u>.4,noYaw:u>=.12});
  pitCam(-PD+.4,u,d,t,{shake:shake(u,0,.35,3.5),dist:5.4,dy:.4});FOVMUL=1-.18*Math.exp(-u*5);
  const q=proj(0,-PD+.4,0);let h=`<rect width="1080" height="1920" fill="#fff" opacity="${f(Math.exp(-u*9))}"/>`+FX2.comicBoom(540,520,t,seg(u,.05,.35)*(1-seg(u,1.0,1.4)),{txt:'BUM!',s:1.6});DUST3.show(V(0,-PD,.4),seg(u,.03,1.8),.9);RING3.show(V(0,-PD+.03,0),seg(u,0,.8),1.5);
  return h;}},
// 7 volta a cena (rebobinar)
{s:19,e:22,w:'pit',caps:[[.3,'VOLTA'],[1.2,'A CENA.']],hl:['VOLTA','CENA'],ev:[[.0,'rewind',1.2],[1.5,'rewind',1],[2.6,'ding',.6]],
async up(u,d,t){const k=ease(u/d),dep=lerp(PD,0,k),tp=lerp(9.4,6.6,seg(k,.7,1)),ph=lerp(12.4,7.2,k);setPit({noPlanks:dep>1.5&&false});planksAt(tp,7.0);
  const topSide=dep<2.5;if(topSide)mapWorld('top');
  await putB(BIG,kid,V(0,FY-dep,-.2),LS,Object.assign(flail(ph),{rot:Math.sin(t*8)*10}));
  if(!topSide)pitCam(-dep,u,d,t,{dist:6.0,dy:.5});else camAt2(V(Math.sin(t*2)*.3,Math.max(2.2,-dep+3),7),V(0,-dep*.5,0),t);FOCUS=V(0,-dep,0);AP=.004;
  let h=rewindFX(u,t,d)+depthHUD(dep);const hx=(Math.floor(t*30)%4<2)?10:-8;return `<g transform="translate(${hx} 0)">${h}</g>`;}},
// 8 de volta: abre o guarda-chuva
{s:22,e:25,w:'top',caps:[[.2,'MAS SE TU'],[1.2,'TIVESSE UM'],[2.0,'GUARDA-CHUVA?']],hl:['GUARDA-CHUVA','UM'],ev:[[.0,'whoosh',.6],[.9,'ding',.7],[1.1,'umb_open',1.1],[1.2,'boing',.6]],
async up(u,d,t){setPit({});planksAt(t,0);const op=ease(seg(u,1.0,1.4)),aR=lerp(30,162,seg(u,.7,1.1));
  const o={t,expr:u>1.1?'smug':'neutral',noPhone:true,aR,eR:-10,handR:'grip',aL:15,eL:-10,lookCam:u>1.2};
  await putB(HERO,kid,V(0,FY,-1.3),LS,o);camShot(u,d,V(1.2,.5,3.6),V(.5,.8,3.2),V(0,.95,-1.3),V(0,1.2,-1.3),{t});FOCUS=V(0,1,-1.3);AP=.006;FOVMUL=1.0;cam.updateMatrixWorld();
  const hand=svw(HERO,...hsv(1,aR,-10)),q=proj(hand),pxm=Math.abs(proj(hand.x,hand.y+1,hand.z).y-q.y);
  showUmb(HERO,aR,-10,u<.8?0:op,{t,tilt:sm_(t*2)*3,fl:.15+.5*Math.exp(-(u-1.1)*4)*(u>1.1?1:0)});let h='';if(u>1.0&&u<1.7)h+=FX2.fireworkBurst(q.x,q.y-230,t,seg(u,1.0,1.7),{s:.45});return h;}},
// 9 vai flutuar? a tábua cede de novo
{s:25,e:29,w:'top',caps:[[.3,'VAI'],[1.0,'FLUTUAR?']],hl:['FLUTUAR'],ev:[[.3,'creak',.9],[.9,'crack',1.2],[1.4,'wind_fall',.8]],
async up(u,d,t){setPit({});const B=26.0;planksAt(t,B);const fp=fallPos(t,26.3,32.9,1);const dep=t>26.3?fp.d:0,aR=162;
  await putB(BIG,kid,V(0,FY-dep,-.3),LS,{t,expr:dep>1?'smirk':'neutral',noPhone:true,aR,eR:-10,handR:'grip',aL:20,eL:-30,legL:-5,legR:5,rot:Math.sin(t*1.6)*3,wind:.8,windDir:-1,pupil:1});
  const cy=Math.max(-dep+1.2,lerp(1.2,1.2,0));camAt2(V(Math.sin(t)*.2,Math.min(2.4,cy+.6),lerp(5.2,6.4,u/d)),V(0,-dep+.8,0),t,shake(u,.9,.05,4));FOCUS=V(0,-dep+.8,0);AP=.004;
  const hand=svw(BIG,...hsv(1,aR,-10)),q=proj(hand),pxm=Math.abs(proj(hand.x,hand.y+1,hand.z).y-q.y);
  showUmb(BIG,aR,-10,1,{t,tilt:Math.sin(t*3)*4,fl:.2+Math.min(1,dep/4)*.5,bil:Math.min(1,dep/6)});return (dep>.5?depthHUD(dep):'');}},
// 10 com guarda-chuva: 65 km/h
{s:29,e:33,w:'pit',caps:[[.2,'#KMH65'],[2.4,'QUASE NADA.']],hl:['QUASE','NADA'],ev:[[.0,'wind_fall',.9],[1.0,'whoosh',.5],[2.0,'whoosh',.5],[3.4,'thud',.9]],
async up(u,d,t){setPit({noPlanks:true});const fp=fallPos(t,26.3,32.9,1),dep=fp.d,aR=162+Math.sin(t*8)*5;
  await putB(BIG,kid,V(0,FY-dep,0),LS,{t,expr:u>2.2?'fear':'smirk',noPhone:true,aR,eR:-10,handR:'grip',aL:40+Math.sin(t*6)*10,eL:-30,legL:-10+Math.sin(t*5)*8,legR:10-Math.sin(t*5)*8,rot:Math.sin(t*2)*5,wind:1.3,windDir:-1,mouth:u>2.2?.6:0});
  pitCam(-dep,u,d,t,{dist:6.0,shake:[tremble(t,.008),tremble(t+3,.008)]});FOVMUL=1.06;cam.updateMatrixWorld();const hand=svw(BIG,...hsv(1,aR,-10)),q=proj(hand),pxm=Math.abs(proj(hand.x,hand.y+1,hand.z).y-q.y);
  showUmb(BIG,aR,-10,1,{t,tilt:Math.sin(t*5)*5,fl:.7,bil:1});let h=depthHUD(dep);for(let k=0;k<26;k++){const x=rnd(k)*1080,y=((rnd(k+3)*1920-t*(1400+fp.v*110))%2400+2400)%2400-200;h+=`<line x1="${f(x)}" y1="${f(y)}" x2="${f(x)}" y2="${f(y+130)}" stroke="#fff" stroke-width="3" opacity=".13"/>`;}
  h+=gaugeSVG(850,1250,170,Math.min(65,fp.v*3.6))+`<text class="mt" x="850" y="1480" font-size="40" fill="#ff8a6a" stroke="#141414" stroke-width="8" paint-order="stroke" text-anchor="middle">SEM: 71 KM/H</text>`;return h;}},
// 11 não salva: guarda-chuva virado do avesso
{s:33,e:36,w:'pit',caps:[[.3,'NÃO SALVA.']],hl:['SALVA'],ev:[[.1,'thud',.9],[.3,'boing',.8],[.5,'stars',.6]],
async up(u,d,t){setPit({noPlanks:true});
  await putB(BIG,kid,V(0,FY-PD+.05,0),LS,{t,expr:'shock',eyeFx:'spiral',rot:-90,noPhone:true,aL:70,aR:70,eL:-30,eR:-30,mouth:.3,stars:u>.1,noYaw:true});
  pitCam(-PD+.5,u,d,t,{dist:4.4,dy:.8,ly:-.1,shake:shake(u,0,.2,4)});FOVMUL=1-.1*Math.exp(-u*5);
  UM.g.visible=true;UM.g.position.set(.9,-PD+.15,.35);UM.g.rotation.set(0,0,-1.25+Math.sin(t*4)*.05*Math.exp(-u*2));UM.g.scale.setScalar(1.05);UM.update(1,t,.2*Math.exp(-u),1,0);
  const q=proj(0,-PD+.7,.3);let h=`<rect width="1080" height="1920" fill="#fff" opacity="${f(Math.exp(-u*10)*.9)}"/>`+(DUST3.show(V(0,-PD,.4),seg(u,0,1.4),.7),'');
  return h+(u>1.3?FX2.flashFrame(0,0,t,seg(u,1.3,1.6),{col:'#fff'}):'');}},
// 12 paraquedas: precisa de 100 m
{s:36,e:40,w:'pit',caps:[[.1,'E UM'],[.7,'PARAQUEDAS?'],[2.3,'PRECISA DE'],[3.0,'100 M+']],hl:['PARAQUEDAS','100'],ev:[[.0,'wind_fall',1],[1.1,'chute_flap',1],[2.0,'chute_flap',.8],[3.35,'thud',.9]],
async up(u,d,t){setPit({noPlanks:true});mapWorld('pit');const k=seg(t,36.1,39.3),dep=Math.min(PD-.1,.5*G*Math.pow(k*2.02,2)*1),op=ease(seg(u,1.1,3.1))*.55;
  await putB(BIG,kid,V(0,FY-dep,0),LS,Object.assign(flail(t),{aL:150,aR:150,rot:Math.sin(t*3)*9}));
  pitCam(-dep,u,d,t,{dist:6.2,shake:[tremble(t,.01),tremble(t+3,.01)]});FOVMUL=1.08;cam.updateMatrixWorld();
  const hp=svw(BIG,0,-20),q=proj(hp),pxm=Math.abs(proj(hp.x,hp.y+1,hp.z).y-q.y);
  if(u>1.0){const nk=svw(BIG,0,70);CHUTE.g.visible=true;CHUTE.g.position.set(nk.x,nk.y,nk.z-.02);CHUTE.g.scale.setScalar(1);CHUTE.update(.35+op,t,1-op*1.1);}let h=depthHUD(dep);
  if(u>2.2){const p=ease(seg(u,2.2,3.0));h+=`<g transform="translate(900 0)"><rect x="-50" y="780" width="100" height="${f(40+20*0)}" fill="none"/><rect x="-46" y="${f(1500-170*p)}" width="92" height="${f(170*p)}" fill="#ffd23f" stroke="#141414" stroke-width="6"/><rect x="-46" y="${f(1500-850*p)}" width="92" height="${f(850*p-170*p)}" fill="#ff7a1a" opacity="${f(.9)}" stroke="#141414" stroke-width="6"/><text class="mt" x="-130" y="${f(1500-85*p)}" font-size="34" fill="#fff" stroke="#141414" stroke-width="7" paint-order="stroke" text-anchor="end">20 m</text><text class="mt" x="-130" y="${f(1500-640*p)}" font-size="34" fill="#fff" stroke="#141414" stroke-width="7" paint-order="stroke" text-anchor="end">100 m</text></g>`;}
  if(u>3.2)h+=`<rect width="1080" height="1920" fill="#fff" opacity="${f(Math.exp(-(u-3.3)*9))}"/>`;return h;}},
// 13 airbag
{s:40,e:44,w:'pit',caps:[[.1,'E UM'],[.8,'AIRBAG?'],[2.5,'SALVA!']],hl:['AIRBAG','SALVA'],ev:[[.1,'wind_fall',.9],[1.85,'whump',1.3],[2.0,'boing',1],[2.7,'boing',.7],[3.3,'ding',.7]],
async up(u,d,t){setPit({noPlanks:true,bag:true});const t0=40.15,t1=41.95,k=seg(t,t0,t1),bagTop=PD-1.25,dep=Math.min(bagTop,.5*G*Math.pow(k*1.95,2));
  const hit=t>=t1,sq=hit?Math.exp(-(t-t1)*1.2)*Math.cos((t-t1)*9):0,bounce=hit?Math.max(0,Math.sin((t-t1)*7))*Math.exp(-(t-t1)*1.6)*2.2:0;
  PT.bagM.scale.set(1.52,1.25-.55*(hit?Math.max(0,Math.exp(-(t-t1)*7)):0)+.08*sq,2.9);
  const feet=hit?bagTop-.55*Math.max(0,Math.exp(-(t-t1)*7))+0:dep;
  await putB(BIG,kid,V(0,FY-(feet)+bounce-0,0),LS,hit?{t,expr:'laugh',aL:150,aR:150,eL:-20,eR:-20,noPhone:true,mouth:.6,rot:Math.sin(t*5)*6}:flail(t));
  pitCam(-feet+bounce,u,d,t,{dist:6.2,shake:hit?shake(t-t1,0,.06,5):[tremble(t,.008),tremble(t+3,.008)]});FOVMUL=1.04;
  let h=depthHUD(Math.min(PD,feet));if(hit&&t-t1<.5){const q=proj(0,-PD+1.2,0);h+=FX2.shockwaveRing(q.x,q.y+200,t,seg(t,t1,t1+.5),{s:1.6});}
  if(u>2.5)h+=FX2.sparkleEyes(540,820,t,1,{s:.001})+FX2.fireworkBurst(300,620,t-42.5,seg(u,2.6,3.5),{s:.9})+FX2.fireworkBurst(790,560,t-42.5,seg(u,2.8,3.7),{s:.8});return h;}},
// 14 física: parar devagar
{s:44,e:48,w:'pit',caps:[[.1,'O QUE IMPORTA:'],[2.0,'PARAR DEVAGAR.']],hl:['IMPORTA','DEVAGAR'],ev:[[.2,'pop',.7],[1.1,'tick',.7],[2.2,'ding',.7],[3.0,'pop',.7]],
async up(u,d,t){setPit({noPlanks:true,bag:true});BOY.hide();camAt2(V(0,-PD+2,6),V(0,-PD+1.5,0),t);FOCUS=null;AP=.002;
  const p=ease(seg(u,.4,2.8)),g1=Math.round(2000*seg(u,1.0,2.6)),g2=Math.round(20*seg(u,1.0,2.6));
  const col=(x,h,c,lab,sub,g)=>`<g transform="translate(${x} 0)"><rect x="-150" y="${f(1380-h)}" width="300" height="${f(h)}" rx="18" fill="${c}" stroke="#141414" stroke-width="8"/><text class="mt" y="1440" font-size="46" fill="#fff" stroke="#141414" stroke-width="9" paint-order="stroke" text-anchor="middle">${lab}</text><text class="mt" y="1500" font-size="34" fill="#ffd23f" stroke="#141414" stroke-width="7" paint-order="stroke" text-anchor="middle">${sub}</text><text class="mt" y="${f(1340-h)}" font-size="96" fill="#fff" stroke="#141414" stroke-width="14" paint-order="stroke" text-anchor="middle">${g} G</text></g>`;
  return `<rect width="1080" height="1920" fill="#1d3550" opacity=".92"/>`+FX2.sunburstBg(540,700,t,.35,{col:'#4a7ab0'})+col(300,640*p,'#e2283b','CHÃO DURO','PARA EM 1 cm',g1)+col(780,70*p+6,'#2fa84f','AIRBAG','PARA EM 1 m',g2)+`<text class="mt" x="540" y="330" font-size="64" fill="#9fe6ff" stroke="#141414" stroke-width="9" paint-order="stroke" text-anchor="middle" opacity="${f(seg(u,1.2,1.6))}">100× MENOS FORÇA</text>`;}},
// 15 água
{s:48,e:52,w:'pit',caps:[[.1,'OU NA ÁGUA?'],[2.2,'ATLETAS FAZEM.']],hl:['ÁGUA','ATLETAS'],ev:[[.1,'wind_fall',.9],[1.95,'splash',1.3],[2.2,'bubbles',.9],[3.2,'ding',.5]],
async up(u,d,t){setPit({noPlanks:true,water:true});const WT=PD-4.2,tH=48.25,tS=50.0,k=seg(t,tH,tS),dep0=.5*G*Math.pow(k*1.79,2),hit=t>=tS,ds=hit?Math.min(PD-1.2,WT+1.9*(1-Math.exp(-(t-tS)*1.6))-.9*Math.max(0,Math.sin((t-tS-1.4)*1.4))*seg(t,tS+1.4,tS+2.6)):dep0;
  await putB(BIG,kid,V(0,FY-Math.min(ds,PD-1.1),0),LS,hit?{t,expr:'neutral',blink:1,aL:30,aR:30,eL:-20,eR:-20,noPhone:true,legL:-10,legR:10,rot:Math.sin(t*2)*6}:{t,expr:'neutral',aL:10,aR:10,eL:-5,eR:-5,legL:2,legR:-2,noPhone:true,pupil:1,wind:1.2,windDir:-1,lookY:.2});
  pitCam(-ds,u,d,t,{dist:6.2,shake:hit?shake(t-tS,0,.05,5):[tremble(t,.006),tremble(t+3,.006)]});FOVMUL=1.04;
  let h=depthHUD(Math.min(PD,ds));if(hit){SPLASH.show(V(0,-WT,0),t-tS);RING3.show(V(0,-WT+.02,0),seg(t,tS,tS+1.4),2.2,'#d8f2ff');BUB3.show(V(0,-WT-1,0),t,true);h+=`<rect width="1080" height="1920" fill="#2a8ab0" opacity="${f(.2*seg(t,tS,tS+.5))}"/>`;}
  return h;}},
// 16 sem treino... dói
{s:52,e:56,w:'pit',caps:[[.3,'SEM TREINO...'],[2.0,'DÓI.']],hl:['TREINO','DÓI'],ev:[[.2,'bubbles',.7],[1.0,'cough',.9],[2.1,'sting',.8]],
async up(u,d,t){setPit({noPlanks:true,water:true});const WT=PD-4.2,rise=ease(seg(u,0,1.0));
  await putB(BIG,kid,V(0,FY-(WT+1.1-rise*.85),0),LS,{t,expr:u>1.2?'disgust':'shock',noPhone:true,aL:30,aR:30,eL:-20,eR:-20,mouth:u>1.0?.4+.4*Math.sin(t*14):.2,rot:u>1.4?Math.sin(t*3)*8:0,wind:.1});
  camAt2(V(Math.sin(t*.8)*.7,-WT+.9+u*.08,lerp(5.4,3.6,u/d)),V(0,-WT+.3,0),t);FOCUS=V(0,-WT+.5,0);AP=.01;FOVMUL=1.06;
  const q=proj(0,-WT+1.2,0);let h=sweat(q.x,q.y-130,t)+(u>1.2?FX2.sighCloud(q.x,q.y+70,t,1,{s:1}):'')+(u>2.0?FX2.angerVein(q.x,q.y,t,seg(u,2.0,2.3),{s:1}):'');return h;}},
// 17 final A ou B
{s:56,e:62,w:'top',caps:[[.1,'TU ESCOLHE:']],hl:['ESCOLHE'],ev:[[.2,'pop',.7],[1.3,'pop',.7],[1.9,'pop',.7],[2.6,'ding',.7],[4.1,'pop',.8]],
async up(u,d,t){setPit({});planksAt(t,0);const aR=150+Math.sin(t*8)*10;await putB(HERO,kid,V(0,FY,-.7),LS,{t,expr:'happy',noPhone:true,aR:u>3.9?aR:40,eR:-30,handR:u>3.9?'wave':'grip',aL:15,eL:-10,lookCam:true,mouth:u<3.9?0:.5});
  {const k=u>3.9?1:0;camShot(u%3.9,3.9,k?V(-.8,.8,3.6):V(.9,.7,4.0),k?V(.3,1.1,2.4):V(-.2,.95,2.8),V(0,1.0,-.7),V(0,1.05,-.7),{t,e:x=>x});}FOCUS=V(0,1,-.7);AP=.007;cam.updateMatrixWorld();
  const hand=svw(HERO,...hsv(1,40,-30)),q=proj(hand),pxm=Math.abs(proj(hand.x,hand.y+1,hand.z).y-q.y);
  const ab=(y,L,txt,col,p)=>p<=0?'':`<g transform="translate(540 ${y}) scale(${f(back(cl(p)))})"><rect x="-470" y="-80" width="940" height="160" rx="40" fill="#2a1f45" stroke="${col}" stroke-width="10"/><circle cx="-380" r="56" fill="${col}"/><text class="mt" x="-380" y="30" font-size="84" fill="#141414" text-anchor="middle">${L}</text><text class="mt" x="60" y="20" font-size="${txt.length>24?38:44}" fill="#fff" text-anchor="middle">${txt}</text></g>`;
  if(u<3.9)showUmb(HERO,40,-30,1,{t,tilt:-38,fl:.1});let h=FX2.lightLeak(0,0,t,.5)+ab(430,'A','E SE TU CAÍSSE DE 1.000 M?','#ffd23f',seg(u,.8,1.1))+ab(620,'B','E SE TU PULASSE DO ESPAÇO?','#9fe6ff',seg(u,1.4,1.7))+label('COMENTA A OU B!',830,{size:92,fill:'#ff8ab0',p:seg(u,2.1,2.4)});
  const cp=seg(u,d-1.8,d-1.4);if(cp>0)h+=`<g transform="translate(540 1560) scale(${(back(cp)*(1+Math.sin(t*8)*.03)).toFixed(3)})"><rect x="-300" y="-70" width="600" height="130" rx="65" fill="#ff2d55" stroke="#141414" stroke-width="10"/><text class="mt" y="28" font-size="76" fill="#fff" text-anchor="middle">SIGA PARA MAIS</text></g>`;return h;}}
];
const sm_=Math.sin;
SC.forEach(s=>{s.ev.forEach(([a,n,g])=>EV.push([SC.indexOf(s),a,n,g]));});

// ================= linha do tempo e render =================
const TOTAL=62;
window.render=async function(t){
  let i=SC.findIndex(s=>t>=s.s&&t<s.e);if(i<0)i=SC.length-1;const S=SC[i],u=t-S.s,d=S.e-S.s;
  mapWorld(S.w==='top'?'top':'pit');
  SPR.forEach(s=>s.mesh.visible=false);BOY.hide();PHONE3.visible=false;DUST3.g.visible=false;CHIPS.g.visible=false;RING3.q.visible=false;SPLASH.p.visible=false;BUB3.p.visible=false;UM.g.visible=false;CHUTE.g.visible=false;PT.dust.update(t);PT.ray.update(t);FOVMUL=1;FOCUS=null;AP=.002;BL=[.6,.6,.8];flashL.intensity=0;zapL.intensity=0;
  const ui=await S.up(u,d,t);
  cam.fov=52*FOVMUL;cam.updateProjectionMatrix();
  SPR.forEach(s=>{if(s.mesh.visible)bill(s);});scene.traverse(o=>{if(o.userData&&o.userData.glow&&o.visible)o.lookAt(cam.position);});
  bokeh.uniforms.focus.value=cam.position.distanceTo(FOCUS||V(0,0,0));bokeh.uniforms.aperture.value=AP;bokeh.uniforms.maxblur.value=AP>.005?.012:.006;bokeh.enabled=AP>.0025;
  bloom.strength=BL[0];bloom.radius=BL[1];bloom.threshold=BL[2];composer.render();
  let cap='';const cur=S.caps.filter(c=>u>=c[0]);if(cur.length){const [tc,txt]=cur[cur.length-1],p=(u-tc)/.25,hl=new Set(S.hl);const CY={13:1700,11:1640,6:420,16:1260};const y=CY[i]??960;
    if(txt==='#KMH'){const v=Math.round(Math.min(71,physFall(Math.min(2.02,(Math.min(t,12.4)-7.2)/5.2*1.97),0).v*3.6*1.0*(1+.0)));cap=capSVG([String(Math.min(70,v)),'KM/H'],Math.max(p,1),y===960?560:y,150,new Set([String(v),'KM/H']));}
    else if(txt==='#KMH65'){const v=Math.round(Math.min(65,physFall(Math.min(2.08,(t-26.3)/6.6*2.08),1).v*3.6));cap=capSVG([String(v),'KM/H'],Math.max(p,1),520,150,new Set([String(v),'KM/H']));}
    else if(txt==='#SEG'){const v=2*eo(seg(u,.2,1.8));cap=capSVG([v.toFixed(1).replace('.',','),'SEGUNDOS'],Math.max(p,1),960,130,new Set(['SEGUNDOS',v.toFixed(1).replace('.',',')]));}
    else cap=capSVG(txt.split(' '),p,y,i===16?124:124,hl);}
  document.getElementById('ui').innerHTML=ui;document.getElementById('caps').innerHTML=cap;
  const CUTS={3:[2.0],5:[1.2],6:[1.6],7:[2.4],8:[2.0],10:[2.2],15:[2.0],16:[2.0,3.9]};let fl=i>0?.3*(1-seg(u,0,.12)):0;(CUTS[i]||[]).forEach(c=>{if(u>=c&&u<c+.15)fl=Math.max(fl,.4*(1-(u-c)/.15));});
  document.getElementById('flash').setAttribute('opacity',f(i===5?0:fl));
  const fr=Math.floor(t*30),gr=document.getElementById('grain');gr.setAttribute('x',f(-60+rnd(fr)*60));gr.setAttribute('y',f(-60+rnd(fr+5)*60));
};
window.INFO={total:TOTAL,scenes:SC.map(s=>({s:s.s,d:s.e-s.s}))};window.GROUPS=[];
window.EVENTS=EV.map(([s,u,n,g])=>({t:+(SC[s].s+u).toFixed(3),name:n,gain:g}));window.WINDCURVE=[];
for(let t=0;t<TOTAL;t+=.1)window.WINDCURVE.push((t>=7.2&&t<16)||(t>=26&&t<33)||(t>=36&&t<40)||(t>=40&&t<42)||(t>=48&&t<50)?1.2:.08);
window.DBG={cam,scene};
await window.render(0);
window.ready=true;

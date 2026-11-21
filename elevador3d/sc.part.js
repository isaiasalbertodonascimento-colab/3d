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

// ================= linha do tempo amarrada à narração contínua =================
const TL=window.TIMING;let _t=.3;const L=TL.map(x=>{const o={s:_t,e:_t+x.dur};_t+=x.dur+.06;return o;});
const LS=.8,FY=FEET*LS,VT=55.6;
const fd=(tau,vt=VT)=>vt*vt/G*Math.log(Math.cosh(G*tau/vt)),fv=(tau,vt=VT)=>vt*Math.tanh(G*tau/vt);
function pw(t,K){if(t<=K[0][0])return K[0][1];for(let i=1;i<K.length;i++)if(t<=K[i][0])return lerp(K[i-1][1],K[i][1],(t-K[i-1][0])/(K[i][0]-K[i-1][0]));return K[K.length-1][1];}
const J1=L[1].e-.35;const TAU1=[[J1,0],[L[3].e,12],[L[6].e,21],[L[7].s+.5,21.9]];
// ---------- objetos de apoio: setas de força, asas do traje ----------
function arrow3(col){const g=new THREE.Group();const m=std({color:col,emissive:col,emissiveIntensity:.35});const s=M3(new THREE.CylinderGeometry(.06,.06,1,12),m,g,0,.5,0);const c=M3(new THREE.ConeGeometry(.16,.32,16),m,g,0,1.1,0);g.userData={s,c};g.visible=false;scene.add(g);return g;}
function setArrow(a,pos,len,up){a.visible=true;a.position.copy(pos);a.rotation.set(up?0:Math.PI,0,0);a.userData.s.scale.y=len;a.userData.s.position.y=len/2;a.userData.c.position.y=len+.14;}
const ARD=arrow3('#e2283b'),ARU=arrow3('#3a9aff');
const WING=(()=>{const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.BufferAttribute(new Float32Array(9*3),3));const m=new THREE.Mesh(geo,new THREE.MeshStandardMaterial({color:'#7a3cff',side:THREE.DoubleSide,roughness:.6,emissive:'#3a1a7a',emissiveIntensity:.25}));m.visible=false;BIG.mesh.add(m);return m;})();
function wingsOn(o){const p=WING.geometry.attributes.position,k=(sx,sy)=>[sx*K,-sy*K,-.012];const hl=handSVG(-1,o.aL,o.eL),hr=handSVG(1,o.aR,o.eR);
  const foot=(sd,a)=>{const r=a*Math.PI/180;return[sd*41.6-Math.sin(r)*300,400+Math.cos(r)*300];};const fl=foot(-1,o.legL),fr=foot(1,o.legR);
  const T=[[-84.8,150],hl,[-60,430],[84.8,150],hr,[60,430],[0,430],fl,fr];T.forEach((q,i)=>{const v=k(q[0],q[1]);p.setXYZ(i,v[0],v[1],v[2]);});p.needsUpdate=true;WING.geometry.computeVertexNormals();WING.visible=true;}
// ---------- HUD ----------
function altHUD(a,x=70,y0=420,y1=1480,band){let g=`<rect x="${x-22}" y="${y0-24}" width="44" height="${y1-y0+48}" rx="22" fill="#1c1630" opacity=".85" stroke="#fff" stroke-width="4"/>`;const Y=v=>y0+(y1-y0)*(1-v/ALT);
  if(band)g+=`<rect x="${x-20}" y="${f(Y(1000))}" width="40" height="${f(Y(850)-Y(1000))}" fill="#2fa84f" opacity=".85"/><text class="mt" x="${x+62}" y="${f(Y(950))}" font-size="28" fill="#7af09a" stroke="#141414" stroke-width="6" paint-order="stroke">ABRE AQUI</text>`;
  g+=`<rect x="${x-14}" y="${f(Y(cl(a,0,ALT)))}" width="28" height="${f(y1-Y(cl(a,0,ALT)))}" rx="14" fill="#9fe6ff"/>`;
  for(const m of[0,200,400,600,800,1000])g+=`<line x1="${x+28}" y1="${f(Y(m))}" x2="${x+50}" y2="${f(Y(m))}" stroke="#fff" stroke-width="4"/><text class="mt" x="${x+58}" y="${f(Y(m)+10)}" font-size="28" fill="#fff" stroke="#141414" stroke-width="6" paint-order="stroke">${m}</text>`;
  return g+`<circle cx="${x}" cy="${f(Y(cl(a,0,ALT)))}" r="22" fill="#fff" stroke="#141414" stroke-width="6"/><text class="mt" x="${x}" y="${y1+80}" font-size="40" fill="#fff" stroke="#141414" stroke-width="8" paint-order="stroke" text-anchor="middle">${Math.max(0,Math.round(a))} m</text>`;}
function gauge2(x,y,r,v,vmax=320){const a0=135,a1=405,A=k=>(a0+(a1-a0)*k)*Math.PI/180;let h=`<circle cx="${x}" cy="${y}" r="${r+16}" fill="#1a1618" opacity=".92"/><circle cx="${x}" cy="${y}" r="${r}" fill="#f2ead8"/>`;
  for(let k=0;k<=vmax;k+=40){const a=A(k/vmax);h+=`<line x1="${f(x+Math.cos(a)*r*.8)}" y1="${f(y+Math.sin(a)*r*.8)}" x2="${f(x+Math.cos(a)*r*.95)}" y2="${f(y+Math.sin(a)*r*.95)}" stroke="#1a1618" stroke-width="6"/><text x="${f(x+Math.cos(a)*r*.63)}" y="${f(y+Math.sin(a)*r*.63+r*.05)}" class="mt" font-size="${f(r*.12)}" fill="#1a1618" text-anchor="middle">${k}</text>`;}
  const a=A(cl(v/vmax))+Math.sin(v*7)*.006;return h+`<line x1="${x}" y1="${y}" x2="${f(x+Math.cos(a)*r*.82)}" y2="${f(y+Math.sin(a)*r*.82)}" stroke="#e0402a" stroke-width="12" stroke-linecap="round"/><circle cx="${x}" cy="${y}" r="20" fill="#1a1618"/><text x="${x}" y="${f(y+r*.5)}" class="mt" font-size="${f(r*.3)}" fill="#1a1618" text-anchor="middle">${Math.round(v)}</text><text x="${x}" y="${f(y+r*.72)}" class="mt" font-size="${f(r*.12)}" fill="#5a5050" text-anchor="middle">KM/H</text>`;}
function stampSVG(x,y,p,l1,l2,col='#e2283b',rot=-8){if(p<=0)return'';const s=1+2.2*(1-ease(cl(p*2.5)));return `<g transform="translate(${f(x)} ${f(y)}) rotate(${rot}) scale(${f(s)})" opacity="${f(cl(p*3))}"><rect x="-230" y="-100" width="460" height="200" rx="24" fill="#fff8f0" opacity=".92" stroke="${col}" stroke-width="12"/><text y="0" class="mt" font-size="80" fill="${col}" text-anchor="middle">${l1}</text><text y="70" class="mt" font-size="40" fill="${col}" text-anchor="middle">${l2}</text></g>`;}
function rewFX(u,t,d){let g=FX2.vhsScanlines(0,0,t,1)+FX2.glitchBars(0,0,t,1);const bl=Math.floor(t*3)%2;return g+`<g transform="translate(110 160)"><path d="M0 0 L56 -34 L56 34Z M56 0 L112 -34 L112 34Z" fill="#fff" stroke="#000" stroke-width="6" opacity="${bl?1:.5}"/><text class="mt" x="140" y="18" font-size="64" fill="#fff" stroke="#000" stroke-width="10" paint-order="stroke">REW</text></g><rect width="1080" height="1920" fill="#2a6aff" opacity=".1"/>`;}
const streaks=(t,v,op=1)=>{let h='';for(let k=0;k<26;k++){const x=rnd(k)*1080,y=((rnd(k+3)*1920-t*(900+v*30))%2400+2400)%2400-200;h+=`<line x1="${f(x)}" y1="${f(y)}" x2="${f(x)}" y2="${f(y+120+v*2)}" stroke="#fff" stroke-width="3" opacity="${f(op*(.06+cl(v/200)*.14))}"/>`;}return h;};
function flail(t){const a=Math.sin(t*5),b=Math.sin(t*5+1.7);return{expr:'shock',aL:120+a*30,aR:120+b*30,eL:-25,eR:-25,handL:'open',handR:'open',legL:-25+b*16,legR:25+a*16,pupil:.7,mouth:.7,wind:1.5,windDir:-1,noPhone:true,rot:Math.sin(t*2)*14};}
// ================= cenas =================
const EV=[];
const SC=[
// V1 porta do avião, escorrega
{a:0,b:1,ev:[[.1,'wind',1],[.2,'hum',.6],[1.75,'whoosh',1],[1.8,'boing',.5]],
async up(u,d,t){const P=SW.plane.position,slip=seg(t,J1-.15,J1+.4),dz=ease(slip)*2.2,dy=-ease(slip)*1.8;
  await put(BIG,kid,V(.4,P.y+.08+FY+dy,1.3+dz),LS,{t,expr:slip>0?'shock':'fear',aL:110+Math.sin(t*9)*6,eL:-80,aR:slip>0?150:30,eR:-20,handL:'grip',handR:'open',wind:1.6,windDir:-1,noPhone:slip>0,rot:slip*35,lookY:.5,mouth:slip>0?.6:.2});
  camShot(u,d,V(2.4,P.y+1.2,6.5),V(1.8,P.y+.6+dy*.6,5.8),V(.4,P.y+.9,1.2),V(.4,P.y+.3+dy,1.4+dz),{t,shake:[tremble(t,.02),tremble(t+3,.02)]});FOCUS=V(.4,P.y+1,1.3);AP=.004;FOVMUL=1.05;
  skyUpd(t,V(0,P.y,0),0,25);return FX2.speedStreak?'':'';}},
// V2 queda livre: 0 -> 200 km/h
{a:2,b:3,ev:[[.0,'wind_fall',1],[1.2,'whoosh',.6],[2.4,'whoosh',.6]],
async up(u,d,t){const tau=pw(t,TAU1),a=ALT-fd(tau),v=fv(tau)*3.6;const B=V(2,a,4);await put(BIG,kid,V(B.x,B.y+FY,B.z),LS,flail(t));
  const cut=u>d*.45;if(!cut)camShot(u,d*.45,V(5,a+2.5,10),V(4,a+1.6,8.5),V(2,a+.4,4),V(2,a+.3,4),{t});else camShot(u-d*.45,d*.55,V(2.4,a+1.1,6.4),V(2.3,a+1.0,6.0),V(2,a+.5,4),V(2,a+.5,4),{t,shake:[tremble(t,.01),tremble(t+3,.01)]});
  FOCUS=V(2,a+.4,4);AP=.004;skyUpd(t,B,fv(tau)*.9);return streaks(t,v)+altHUD(a)+gauge2(860,1300,170,v);}},
// V3 forças: o ar empurra pra cima
{a:4,b:4,ev:[[.2,'pop',.6],[1.6,'ding',.5]],
async up(u,d,t){const tau=pw(t,TAU1),a=ALT-fd(tau),v=fv(tau);const B=V(2,a,4);await put(BIG,kid,V(B.x,B.y+FY,B.z),LS,Object.assign(flail(t),{rot:Math.sin(t*2)*6,expr:'neutral',mouth:.2}));
  const up=1.6*cl(seg(u,.2,d*.8)*(v/VT));setArrow(ARD,V(2.9,a+1.6,4.1),1.6,false);setArrow(ARU,V(1.1,a-.4,4.1),Math.max(.05,up),true);
  camShot(u,d,V(2.2,a+.9,8.2),V(2.1,a+.8,7.4),V(2,a+.4,4),V(2,a+.4,4),{t});FOCUS=B;AP=.003;skyUpd(t,B,v*.9);
  const qd=proj(2.9,a+.2,4.1),qu=proj(1.1,a+.6+up,4.1);return streaks(t,v*3.6)+`<text class="mt" x="${f(qd.x+30)}" y="${f(qd.y+60)}" font-size="46" fill="#ff8a8a" stroke="#141414" stroke-width="8" paint-order="stroke">PESO</text><text class="mt" x="${f(qu.x-30)}" y="${f(qu.y-20)}" font-size="46" fill="#9fd0ff" stroke="#141414" stroke-width="8" paint-order="stroke" text-anchor="end">AR</text>`+(u>d*.8?label('= IGUAIS',1320,{size:90,fill:'#ffd23f',p:seg(u,d*.8,d*.8+.3)}):'')+gauge2(860,1520,140,v*3.6);}},
// V4 de cabeça pra baixo: 300 km/h
{a:5,b:5,ev:[[.1,'whoosh',1],[.3,'wind_fall',1.2],[1.4,'sting',.7]],
async up(u,d,t){const tau=pw(t,TAU1),a=ALT-fd(tau),dv=fv(tau)*3.6+ease(seg(u,.1,1.6))*(300-fv(tau)*3.6);const B=V(2,a,4),turn=ease(seg(u,0,.5));
  await put(BIG,kid,V(B.x,B.y+FY*(1-2*turn)*0+FY,B.z),LS,{t,expr:'laugh',aL:175,aR:175,eL:-5,eR:-5,handL:'open',handR:'open',legL:-4,legR:4,rot:180*turn+Math.sin(t*3)*4,wind:1.6,windDir:-1,noPhone:true,mouth:.6});
  camShot(u,d,V(3.2,a-.2,7.0),V(2.6,a+.2,6.2),V(2,a+.9,4),V(2,a+.9,4),{t,shake:[tremble(t,.02),tremble(t+3,.02)]});FOVMUL=punch(u,.5,.12);FOCUS=B;AP=.004;skyUpd(t,B,dv/3.6);
  return streaks(t,dv,1.4)+speedLines(.5+.3*Math.sin(t*6))+gauge2(860,1300,170,dv)+altHUD(a);}},
// V5 cronômetro: uns 22 segundos, chão chegando (de cima)
{a:6,b:6,ev:[[.1,'tick',.6],[.6,'tick',.6],[1.1,'tick',.6],[1.6,'tick',.6],[2.1,'tick',.6]],
async up(u,d,t){const tau=pw(t,TAU1),a=ALT-fd(tau),v=fv(tau);const B=V(2,a,4);await put(BIG,kid,V(B.x,B.y+FY,B.z),LS,flail(t));
  camAt2(V(2.4,a+7,6.5),V(2,a-30,3),t,[tremble(t,.02),tremble(t+3,.02)]);FOCUS=B;AP=.002;skyUpd(t,B,v);
  const sec=Math.min(22,Math.round(tau));return streaks(t,v*3.6)+altHUD(a)+`<g transform="translate(860 1320)"><circle r="120" fill="#1c1630" stroke="#fff" stroke-width="8"/><circle r="120" fill="none" stroke="#ffd23f" stroke-width="16" stroke-dasharray="${f(754*tau/22)} 754" transform="rotate(-90)"/><text class="mt" y="30" font-size="84" fill="#fff" text-anchor="middle">${sec}s</text></g>`;}},
// V6 e o chão... / volta a cena (rebobinar)
{a:7,b:8,ev:[[.0,'heart',1.2],[.5,'rewind',1.2]],
async up(u,d,t){const R0=.5;if(u<R0){const tau=pw(t,TAU1),a=Math.max(4,ALT-fd(tau));const B=V(2,a,4);await put(BIG,kid,V(B.x,B.y+FY,B.z),LS,Object.assign(flail(t*.2),{rot:0,pupil:.5,mouth:.9}));
    camAt2(V(2.3,a+2.2,5.6),V(2,a-.2,3.6),t,shake(u,0,.05,2));FOVMUL=1-.15*seg(u,0,R0);FOCUS=V(2,a+.5,4);AP=.012;skyUpd(t,B,40);return FX2.vignettePulse(0,0,t,1,{col:'#500'});}
  const k=ease(seg(u,R0,d)),a=lerp(6,ALT,k),P=SW.plane.position;const B=V(lerp(2,.4,k),a,lerp(4,1.6,k));await put(BIG,kid,V(B.x,B.y+FY,B.z),LS,Object.assign(flail(-t*2),{rot:Math.sin(t*9)*12}));
  camAt2(V(B.x+1.5,a+1.5,B.z+5.5),V(B.x,a+.4,B.z),t);FOCUS=B;AP=.003;skyUpd(t,B,0,0);return rewFX(u,t,d)+altHUD(a);}},
// V7 de novo na porta, agora com paraquedas na mochila
{a:9,b:9,ev:[[.1,'ding',.6],[1.1,'whoosh',.9]],
async up(u,d,t){const P=SW.plane.position,jp=seg(u,d-.45,d),dz=ease(jp)*1.6,dy=-ease(jp)*1.2;
  await put(BIG,kid,V(.4,P.y+.08+FY+dy,1.3+dz),LS,{t,expr:'smug',aL:110,eL:-80,handL:'grip',aR:jp>0?150:70,eR:-95,handR:jp>0?'open':'thumb',noPhone:true,wind:1.4,windDir:-1,lookCam:true,rot:jp*20});
  camShot(u,d,V(1.3,P.y+1.3,4.2),V(1.0,P.y+1.2,3.8),V(.4,P.y+1.0,1.3),V(.4,P.y+.9,1.4),{t});FOCUS=V(.4,P.y+1,1.3);AP=.008;skyUpd(t,V(0,P.y,0),0,25);
  return stampSVG(560,420,seg(u,.1,.5),'PARAQUEDAS','NA MOCHILA','#2f6aa8',6);}},
// V8 abre o paraquedas: 200 -> 20 km/h
{a:10,b:10,ev:[[.15,'chute_flap',1.3],[.55,'umb_open',1.2],[.6,'thud',.6]],
async up(u,d,t){const op=ease(seg(u,.15,.8)),a=ALT-30-u*8,B=V(1,a,3),jerk=Math.exp(-Math.max(0,u-.55)*6)*Math.sin(Math.max(0,u-.55)*22)*.25;
  await put(BIG,kid,V(B.x,B.y+FY+jerk,B.z),LS,{t,expr:u>.9?'laugh':'shock',aL:150,aR:150,eL:-60,eR:-60,handL:'grip',handR:'grip',legL:-6,legR:6,noPhone:true,wind:.6,windDir:-1,mouth:.5});
  const nk=svgWorld(BIG,0,70);CHUTE.g.visible=true;CHUTE.g.position.set(nk.x,nk.y,nk.z-.02);CHUTE.update(.25+.75*op,t,(1-op)*1.2);
  camShot(u,d,V(1.6,a+1.8,8.5),V(1.4,a+2.2,7.6),V(1,a+1.4,3),V(1,a+1.6,3),{t,shake:shake(u,.55,.06,5)});FOCUS=B;AP=.003;skyUpd(t,B,lerp(55,5,op));
  return gauge2(860,1300,170,lerp(200,20,ease(seg(u,.5,1.6))))+altHUD(a);}},
// V9 1.000 m: é a altura certa pra abrir
{a:11,b:11,ev:[[.2,'pop',.7],[1.4,'ding',.6]],
async up(u,d,t){const a=ALT-38-u*5,B=V(1,a,3);await put(BIG,kid,V(B.x,B.y+FY,B.z),LS,{t,expr:'happy',aL:150,aR:150,eL:-60,eR:-60,handL:'grip',handR:'grip',legL:-4+Math.sin(t*2)*6,legR:4-Math.sin(t*2)*6,noPhone:true,wind:.4,lookCam:true,mouth:talk(t)});
  const nk=svgWorld(BIG,0,70);CHUTE.g.visible=true;CHUTE.g.position.set(nk.x,nk.y,nk.z-.02);CHUTE.update(1,t,.15);
  const ang=lerp(-.5,.4,ease(u/d));camAt2(V(1+Math.sin(ang)*11,a+2.5,3+Math.cos(ang)*11),V(1,a+1.6,3),t);FOCUS=B;AP=.002;skyUpd(t,B,5);return altHUD(a,70,420,1480,true);}},
// V10 volta de novo: traje de asa
{a:12,b:12,ev:[[.0,'rewind',.9],[.9,'umb_open',.8],[1.8,'whoosh',1]],
async up(u,d,t){const P=SW.plane.position,R0=.55;if(u<R0){const k=ease(u/R0),a=lerp(ALT-40,ALT,k);await put(BIG,kid,V(lerp(1,.4,k),a+FY,lerp(3,1.4,k)),LS,Object.assign(flail(-t),{}));camAt2(V(2,a+1.5,7),V(.6,a+.6,2),t);skyUpd(t,V(0,a,0),0);return rewFX(u,t,R0);}
  const jp=seg(u,d-.45,d),o={t,expr:'smirk',aL:100,aR:100,eL:-5,eR:-5,legL:-22,legR:22,handL:'open',handR:'open',noPhone:true,wind:1.4,windDir:-1,lookCam:true};
  await put(BIG,kid,V(.4,P.y+.08+FY-ease(jp)*1.2,1.4+ease(jp)*1.6),LS,o);wingsOn(o);
  camShot(u-R0,d-R0,V(1.6,P.y+1.2,5.2),V(1.2,P.y+1.1,4.6),V(.4,P.y+.9,1.4),V(.4,P.y+.8,1.6),{t});FOCUS=V(.4,P.y+.9,1.4);AP=.006;skyUpd(t,V(0,P.y,0),0,25);
  return stampSVG(560,420,seg(u,R0,R0+.4),'TRAJE','DE ASA','#7a3cff',6);}},
// V11 planando: 3 pra frente, 1 pra baixo
{a:13,b:13,ev:[[.0,'wind_fall',1],[1.2,'whoosh',.6],[2.2,'whoosh',.6]],
async up(u,d,t){const x=u*45,a=ALT-60-u*15,B=V(x,a,0);const o={t,expr:'laugh',aL:100+Math.sin(t*3)*4,aR:100-Math.sin(t*3)*4,eL:-5,eR:-5,legL:-22,legR:22,handL:'open',handR:'open',noPhone:true,wind:1.6,windDir:-1,mouth:.5};
  await put(BIG,kid,V(B.x,B.y+FY,B.z),LS,o);bill(BIG);BIG.mesh.rotation.z=-1.25+Math.sin(t*2)*.06;BIG.mesh.updateMatrixWorld();wingsOn(o);
  camAt2(V(x+.4+Math.sin(t*.7)*.6,a+1.2,5.4),V(x,a+.2,0),t);FOCUS=B;AP=.003;skyUpd(t,B,4,40);
  const p=ease(seg(u,.4,1.4));return `<g transform="translate(300 1300)" opacity="${f(p)}"><path d="M0 0 h${f(360*p)}" stroke="#ffd23f" stroke-width="16" stroke-linecap="round"/><path d="M${f(360*p)} 0 l-30 -22 v44Z" fill="#ffd23f"/><path d="M${f(360*p)} 0 v${f(120*p)}" stroke="#9fe6ff" stroke-width="16" stroke-linecap="round"/><text class="mt" x="${f(180*p)}" y="-34" font-size="60" fill="#ffd23f" stroke="#141414" stroke-width="10" paint-order="stroke" text-anchor="middle">3 m</text><text class="mt" x="${f(360*p+30)}" y="${f(70*p)}" font-size="60" fill="#9fe6ff" stroke="#141414" stroke-width="10" paint-order="stroke">1 m</text></g>`;}},
// V12 2012: pouso em caixas de papelão
{a:14,b:14,ev:[[.2,'wind_fall',.8],[2.55,'crack',1.2],[2.6,'thud',1.2],[2.7,'boing',.7],[3.6,'pop',.7],[4.4,'ding',.6]],
async up(u,d,t){const BX=SW.boxG.position,TI=2.55,hit=u>=TI;const k=seg(u,0,TI),x=BX.x-30+30*k,y=lerp(28,1.4,ease(k)),z=BX.z;
  const o={t,expr:hit?'laugh':'smirk',aL:100,aR:100,eL:-5,eR:-5,legL:-22,legR:22,handL:'open',handR:'open',noPhone:true,wind:1.4,windDir:-1,mouth:hit?.6:0};
  if(!hit){await put(BIG,kid,V(x,y+FY,z),LS,o);bill(BIG);BIG.mesh.rotation.z=-1.2;BIG.mesh.updateMatrixWorld();wingsOn(o);}
  else{const pop=ease(seg(u,TI+.6,TI+1.2));await put(BIG,kid,V(BX.x+.4,1.2+FY-1.2*(1-pop)+.3,BX.z+.6),LS,Object.assign(o,{aL:160,aR:160,eL:-20,eR:-20}));bill(BIG);wingsOn(o);}
  SW.boxes.forEach((m,i)=>{const h=m.userData.home,dt=u-TI;if(dt<=0||Math.hypot(h.x-.4,h.z-.6)>2.6){m.position.copy(h);m.rotation.x=0;m.rotation.z=0;return;}const r=m.userData.r,a=Math.atan2(h.z-.6,h.x-.4),sp=2+r*3;m.position.set(h.x+Math.cos(a)*sp*dt,Math.max(.23,h.y+(3+r*3)*dt-.5*G*dt*dt),h.z+Math.sin(a)*sp*dt);m.rotation.set(dt*(2+r*4),0,dt*(1+r*3));});
  if(u<TI)camShot(u,TI,V(BX.x-24,16,BX.z+16),V(BX.x-8,6,BX.z+12),V(x,y,z),V(BX.x,1,BX.z),{t});else camShot(u-TI,d-TI,V(BX.x+3,2.4,BX.z+7),V(BX.x+2.2,2.2,BX.z+6),V(BX.x+.4,1.4,BX.z),V(BX.x+.4,1.6,BX.z),{t,shake:shake(u,TI,.15,4)});
  FOCUS=V(BX.x,1,BX.z);AP=.002;skyUpd(t,V(BX.x,1,BX.z),0,u<TI?30:0);
  return stampSVG(540,420,seg(u,.2,.6),'2012','DUBLÊ','#c8742a',-6)+(hit?`<rect width="1080" height="1920" fill="#fff" opacity="${f(Math.exp(-(u-TI)*8)*.7)}"/>`:'');}},
// V13 recorde: mais de 10 km, preso num pedaço do avião
{a:15,b:15,ev:[[.1,'wind_fall',1],[1.0,'creak',.8],[2.6,'whoosh',.7],[3.8,'sting',.8]],
async up(u,d,t){const FR=SW.frag;FR.position.y=900-u*30;FR.rotation.set(Math.sin(t*.7)*.3,t*.4,Math.sin(t*.5)*.4);const c=FR.position;
  const cut=u>d*.5;if(!cut)camAt2(V(c.x+14,c.y+6,c.z+18),V(c.x,c.y,c.z),t);else camAt2(V(c.x+5,c.y-3,c.z+7),V(c.x,c.y+.3,c.z),t,[tremble(t,.02),tremble(t+3,.02)]);
  FOCUS=c;AP=.002;skyUpd(t,c,25);
  return streaks(t,180)+counterBR(540,1300,10000,seg(u,.2,2.2),{suf:' m',size:120,fill:'#9fe6ff'})+stampSVG(540,420,seg(u,2.6,3.0),'RECORDE','1972 · SOBREVIVEU','#2fa84f',-6);}},
// V14 sorte... paraquedas sempre: pouso no campo
{a:16,b:16,ev:[[.2,'wind',.5],[1.2,'thud',.6],[1.3,'boing',.6],[1.6,'stars',.6]],
async up(u,d,t){const F=SW.field.position,land=1.2,hgt=u<land?lerp(7,0,ease(u/land)):0,j=hop(u,land,.3,120);
  await put(BIG,kid,V(F.x,hgt+FY-j.y*K*LS,F.z),LS,{t,sq:j.sq,expr:u<land?'happy':'laugh',aL:u<land?150:160+Math.sin(t*10)*10,aR:u<land?150:160-Math.sin(t*10)*10,eL:u<land?-60:-10,eR:u<land?-60:-10,handL:u<land?'grip':'open',handR:u<land?'grip':'open',noPhone:true,mouth:u>land?.6:.2,lookCam:u>land});
  const nk=svgWorld(BIG,0,70);CHUTE.g.visible=true;CHUTE.g.position.set(nk.x-ease(seg(u,land,d))*1.2,nk.y-ease(seg(u,land,d))*1.8,nk.z-.4*seg(u,land,d));CHUTE.update(lerp(1,.35,seg(u,land,d)),t,.2+seg(u,land,d)*.8);
  camShot(u,d,V(F.x+2.4,2.2,F.z+7.5),V(F.x+1.4,1.6,F.z+5.8),V(F.x,1.6,F.z),V(F.x,1.1,F.z),{t});FOCUS=V(F.x,1,F.z);AP=.006;skyUpd(t,V(F.x,0,F.z),0);
  return u>land?FX2.confetti(0,0,t,seg(u,land,land+.4)):'';}},
// V15 final: A ou B
{a:17,b:17,tail:1.8,ev:[[.2,'pop',.7],[.8,'pop',.7],[1.4,'pop',.7],[2.2,'ding',.7]],
async up(u,d,t){const F=SW.field.position;const wav=u>2.6;await put(BIG,kid,V(F.x,FY,F.z),LS,{t,expr:'happy',aR:wav?150+Math.sin(t*10)*25:40,eR:-30,handR:wav?'wave':'relaxed',aL:15,eL:-10,noPhone:true,lookCam:true,mouth:talk(t)});
  CHUTE.g.visible=true;CHUTE.g.position.set(F.x-1.6,-1.3,F.z-1.6);CHUTE.update(.3,t,.4);
  camShot(u,d,V(F.x+1.6,1.4,F.z+4.4),V(F.x+.6,1.2,F.z+3.4),V(F.x,1.1,F.z),V(F.x,1.15,F.z),{t});FOCUS=V(F.x,1,F.z);AP=.008;skyUpd(t,V(F.x,0,F.z),0);
  const ab=(y,Lt,txt,col,p)=>p<=0?'':`<g transform="translate(540 ${y}) scale(${f(back(cl(p)))})"><rect x="-470" y="-80" width="940" height="160" rx="40" fill="#2a1f45" stroke="${col}" stroke-width="10"/><circle cx="-380" r="56" fill="${col}"/><text class="mt" x="-380" y="30" font-size="84" fill="#141414" text-anchor="middle">${Lt}</text><text class="mt" x="60" y="20" font-size="44" fill="#fff" text-anchor="middle">${txt}</text></g>`;
  let h=ab(380,'A','E SE TU CAÍSSE NO MAR?','#ffd23f',seg(u,.3,.6))+ab(570,'B','E SE A GRAVIDADE SUMISSE?','#9fe6ff',seg(u,.8,1.1));
  const cp=seg(u,d-1.6,d-1.2);if(cp>0)h+=`<g transform="translate(540 1600) scale(${(back(cp)*(1+Math.sin(t*8)*.03)).toFixed(3)})"><rect x="-300" y="-70" width="600" height="130" rx="65" fill="#ff2d55" stroke="#141414" stroke-width="10"/><text y="28" class="mt" font-size="76" fill="#fff" text-anchor="middle">SIGA PARA MAIS</text></g>`;return h;}}
];
SC.forEach((s,i)=>{s.s=i===0?0:L[s.a].s-.03;});SC.forEach((s,i)=>{s.e=i<SC.length-1?SC[i+1].s:L[s.b].e+(s.tail||0);});
SC.forEach((s,i)=>s.ev.forEach(([a,n,g])=>EV.push([i,a,n,g])));
// legendas: 1–3 palavras por vez, sincronizadas com a fala (tempo proporcional às letras)
const HLW=new Set(['1.000','METROS','QUEDA','LIVRE.','200','KM/H.','KM/H','AR','300','22','SEGUNDOS.','CHÃO...','VOLTA','CENA.','PARAQUEDAS?','20','TRAJE','ASA?','ASA,','3','2012,','CAIXAS','PAPELÃO.','RECORDE:','10.000','SOBREVIVEU.','SORTE.','PARAQUEDAS','A','B?','ACELERAR.','CAÍSSE...','DUBLÊ']);
const GROUPS=[];TL.forEach((x,i)=>{const w=x.legenda.split(' '),tot=w.reduce((a,b)=>a+b.length+1,0);let c=L[i].s,cur=[];w.forEach((ww,k)=>{const dd=x.dur*(ww.length+1)/tot;cur.push({w:ww,t0:c,t1:c+dd});c+=dd;if(cur.length===3||/[.,:!?]$/.test(ww)||k===w.length-1){GROUPS.push({words:cur,t0:cur[0].t0,end:c});cur=[];}});});
for(let i=0;i<GROUPS.length-1;i++)GROUPS[i].end=GROUPS[i+1].t0;GROUPS[GROUPS.length-1].end+=.6;
window.GROUPS=GROUPS.map(g=>({words:g.words.map(w=>({w:w.w,t0:w.t0,t1:w.t1})),t0:g.t0,end:g.end}));
const TOTAL=SC[SC.length-1].e;
window.render=async function(t){
  let i=SC.findIndex(s=>t>=s.s&&t<s.e);if(i<0)i=SC.length-1;const S=SC[i],u=t-S.s,d=S.e-S.s;mapSky();
  SPR.forEach(s=>s.mesh.visible=false);CHUTE.g.visible=false;WING.visible=false;ARD.visible=ARU.visible=false;BIG.mesh.rotation.z=0;FOVMUL=1;FOCUS=null;AP=.002;BL=[.6,.6,.82];
  const ui=await S.up(u,d,t);
  cam.fov=52*FOVMUL;cam.updateProjectionMatrix();SPR.forEach(s=>{if(s.mesh.visible){const rz=s.mesh.rotation.z;bill(s);s.mesh.rotation.z=rz;}});scene.traverse(o=>{if(o.userData&&o.userData.glow&&o.visible)o.lookAt(cam.position);});
  bokeh.uniforms.focus.value=cam.position.distanceTo(FOCUS||V(0,0,0));bokeh.uniforms.aperture.value=AP;bokeh.uniforms.maxblur.value=AP>.005?.012:.006;bokeh.enabled=AP>.0025;bloom.strength=BL[0];bloom.radius=BL[1];bloom.threshold=BL[2];composer.render();
  const g=GROUPS.find(g=>t>=g.t0&&t<g.end);let cap='';if(g){const p=(t-g.t0)/.2,ws=g.words.map(w=>w.w),hl=new Set(ws.filter(w=>HLW.has(w)).map(w=>w.replace(/[.,!?…:]/g,'')));cap=capSVG(ws,p,960,120,hl);}
  document.getElementById('ui').innerHTML=ui;document.getElementById('caps').innerHTML=cap;
  document.getElementById('flash').setAttribute('opacity',f(i>0?.3*(1-seg(u,0,.12)):0));
  const fr=Math.floor(t*30),gr=document.getElementById('grain');gr.setAttribute('x',f(-60+rnd(fr)*60));gr.setAttribute('y',f(-60+rnd(fr+5)*60));
};
window.INFO={total:TOTAL,scenes:SC.map(s=>({s:s.s,d:s.e-s.s}))};
window.EVENTS=EV.map(([s,u,n,g])=>({t:+(SC[s].s+u).toFixed(3),name:n,gain:g}));window.WINDCURVE=[];
for(let t=0;t<TOTAL;t+=.1){const i=Math.max(0,SC.findIndex(s=>t>=s.s&&t<s.e));window.WINDCURVE.push([0,1,1,1.4,1,.2,.5,.6,.3,.2,1,1.2,.3,.2,.1][i]??.2);}
window.NARR=L.map(x=>x.s);
window.DBG={cam,scene};
await window.render(0);
window.ready=true;

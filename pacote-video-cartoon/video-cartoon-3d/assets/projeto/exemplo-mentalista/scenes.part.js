// ================= objetos desenhados (SVG) =================
function lens(x,y,r,p,inner,txt,id){if(p<=0)return'';const s=back(cl(p));
  return `<defs><clipPath id="cl${id}"><circle r="${r}"/></clipPath></defs><g transform="translate(${f(x)} ${f(y)}) scale(${f(s)})"><g transform="rotate(-45)"><rect x="-24" y="${r+6}" width="48" height="170" rx="20" fill="#5a3a22" stroke="#2a1a10" stroke-width="6"/></g><circle r="${r+18}" fill="#c9a24a" stroke="#7a5a1a" stroke-width="6"/><g clip-path="url(#cl${id})"><rect x="${-r}" y="${-r}" width="${2*r}" height="${2*r}" fill="#efe6d6"/>${inner}</g><circle r="${r}" fill="#bfe6ff" opacity=".1"/><path d="M${-r*.55} ${-r*.55} q${r*.3} ${-r*.25} ${r*.62} ${-r*.12}" stroke="#fff" stroke-width="12" opacity=".55" fill="none" stroke-linecap="round"/></g>`+label(txt,y+r+120,{size:74,x,p,fill:'#ffd23f',stroke:14});}
const IC={
 finger:`<rect x="-62" y="-200" width="124" height="420" rx="62" fill="#c98450"/><rect x="-62" y="-10" width="124" height="46" fill="#f3d2b4"/><ellipse cx="0" cy="-150" rx="38" ry="44" fill="#f6dcc6"/><path d="M-62 120 q62 18 124 0" stroke="#a86a40" stroke-width="5" fill="none"/>`,
 shoe:`<path d="M-170 40 Q-170 -50 -80 -60 L10 -60 Q70 -30 170 -10 L170 50 L-170 50Z" fill="#efece4" stroke="#a9a59c" stroke-width="6"/><path d="M-60 -50 l30 40 M-30 -55 l30 40 M0 -58 l30 40" stroke="#c9c3b6" stroke-width="7"/><path d="M-170 50 L170 50 L170 90 Q40 96 -170 62Z" fill="#7d7a74"/><path d="M-150 60 l40 6 M-100 64 l30 5" stroke="#b9b5ae" stroke-width="4"/>`,
 sleeve:`<rect x="-200" y="-200" width="400" height="400" fill="#2f6a5a"/><rect x="40" y="-200" width="24" height="400" fill="#ff9ac0"/><g fill="#fdfcf8">${[[-80,-40,26],[-40,10,18],[-100,40,14],[-20,-70,12],[10,60,20],[-60,90,10],[30,-20,9]].map(([a,b,c])=>`<circle cx="${a}" cy="${b}" r="${c}" opacity=".75"/>`).join('')}</g>`};
function card(x,y,p,lines,t){if(p<=0)return'';const s=back(cl(p));let st='';for(let k=0;k<14;k++)st+=`<circle cx="${f(-300+rnd(k)*600)}" cy="${f(-200+rnd(k+4)*400)}" r="${f(2+rnd(k+8)*4)}" fill="#fff" opacity="${f(.4+.4*Math.sin(t*3+k))}"/>`;
  return `<g transform="translate(${f(x)} ${f(y)}) scale(${f(s)}) rotate(${f(-3+Math.sin(t*2)*1.5)})"><rect x="-330" y="-230" width="660" height="460" rx="34" fill="#3a2a6a" stroke="#ffd23f" stroke-width="10"/>${st}<text y="-140" class="lb" font-size="64" fill="#ffd23f" text-anchor="middle">★ HORÓSCOPO ★</text>${lines.map((l,i)=>`<text y="${-40+i*78}" class="lb" font-size="60" fill="#fff" text-anchor="middle">${l}</text>`).join('')}</g>`;}
function arrow(x1,y1,x2,y2,p,txt,tx,ty){if(p<=0)return'';const k=ease(cl(p)),X=lerp(x1,x2,k),Y=lerp(y1,y2,k),a=Math.atan2(Y-y1,X-x1);
  return `<path d="M${f(x1)} ${f(y1)} Q${f((x1+X)/2+40)} ${f((y1+Y)/2-60)} ${f(X)} ${f(Y)}" stroke="#141414" stroke-width="22" fill="none" stroke-linecap="round"/><path d="M${f(x1)} ${f(y1)} Q${f((x1+X)/2+40)} ${f((y1+Y)/2-60)} ${f(X)} ${f(Y)}" stroke="#ffd23f" stroke-width="12" fill="none" stroke-linecap="round"/><path transform="translate(${f(X)} ${f(Y)}) rotate(${f(a*180/Math.PI)})" d="M10 0 L-34 -24 L-34 24Z" fill="#ffd23f" stroke="#141414" stroke-width="6"/>`+label(txt,ty,{size:70,x:tx,p,fill:'#fff',stroke:14});}
function coin(x,y,spin,s=1){const c=Math.cos(spin),rx=Math.max(6,Math.abs(c)*80);return `<g transform="translate(${f(x)} ${f(y)}) scale(${f(s)})"><ellipse rx="${f(rx)}" ry="80" fill="${c>0?'#f2c230':'#d9a420'}" stroke="#8a6410" stroke-width="7"/>${Math.abs(c)>.4?`<text y="26" class="lb" font-size="${f(70*Math.abs(c))}" fill="#8a6410" text-anchor="middle" transform="scale(${f(Math.abs(c))} 1)">${c>0?'★':'1'}</text>`:''}</g>`;}
function watch(x,y,t,amp=34){const a=Math.sin(t*3.2)*amp*Math.PI/180,L=300,wx=x+Math.sin(a)*L,wy=y+Math.cos(a)*L;let ch='';for(let k=1;k<14;k++){const q=k/14;ch+=`<circle cx="${f(x+Math.sin(a)*L*q)}" cy="${f(y+Math.cos(a)*L*q)}" r="6" fill="none" stroke="#c9a24a" stroke-width="4"/>`;}
  return ch+`<g transform="translate(${f(wx)} ${f(wy+50)}) rotate(${f(-a*57)})"><circle cy="-62" r="14" fill="none" stroke="#c9a24a" stroke-width="7"/><circle r="62" fill="#d9a420" stroke="#7a5a1a" stroke-width="7"/><circle r="48" fill="#fffaf0"/><path d="M0 0 L0 -36 M0 0 L22 10" stroke="#222" stroke-width="6" stroke-linecap="round"/><path d="M-30 -30 q14 -10 30 -8" stroke="#fff" stroke-width="6" opacity=".6" fill="none"/></g>`;}
function elephant(x,y,t,s=1){const b=Math.abs(Math.sin(t*6))*-24,tr=Math.sin(t*4)*14;return `<g transform="translate(${f(x)} ${f(y+b)}) scale(${f(s)}) rotate(${f(Math.sin(t*6)*6)})"><rect x="-70" y="30" width="34" height="80" rx="14" fill="#f08fb4"/><rect x="40" y="30" width="34" height="80" rx="14" fill="#f08fb4"/><ellipse rx="110" ry="80" fill="#ff9ec4"/><path d="M100 -10 q60 ${f(40+tr)} 30 ${f(110+tr)}" stroke="#ff9ec4" stroke-width="34" fill="none" stroke-linecap="round"/><circle cx="90" cy="-40" r="60" fill="#ffaecd"/><ellipse cx="50" cy="-40" rx="38" ry="50" fill="#f08fb4"/><circle cx="110" cy="-55" r="9" fill="#2b2b35"/><circle cx="113" cy="-58" r="3" fill="#fff"/><path d="M-110 -10 q-30 -10 -30 20" stroke="#f08fb4" stroke-width="10" fill="none" stroke-linecap="round"/><ellipse cx="125" cy="-25" rx="12" ry="8" fill="#ff6f9f" opacity=".6"/></g>`;}
function bubble(x,y,w,h,p,tx,ty){if(p<=0)return'';const s=back(cl(p));let c='';for(let k=0;k<9;k++){const a=k/9*TAU;c+=`<circle cx="${f(Math.cos(a)*w*.42)}" cy="${f(Math.sin(a)*h*.36)}" r="${f(h*.36)}" fill="#fff"/>`;}
  return `<circle cx="${f(tx)}" cy="${f(ty)}" r="${f(18*s)}" fill="#fff" stroke="#141414" stroke-width="5"/><circle cx="${f(lerp(tx,x,.45))}" cy="${f(lerp(ty,y,.45))}" r="${f(30*s)}" fill="#fff" stroke="#141414" stroke-width="5"/><g transform="translate(${f(x)} ${f(y)}) scale(${f(s)})"><g stroke="#141414" stroke-width="14">${c}</g>${c}<ellipse rx="${f(w*.42)}" ry="${f(h*.36)}" fill="#fff"/></g>`;}
function suit(k){return ['<path d="M0 30 C-60 -10 -40 -60 0 -30 C40 -60 60 -10 0 30Z" fill="#e2283b"/>','<path d="M0 -45 L32 0 L0 45 L-32 0Z" fill="#e2283b"/>','<path d="M0 -40 C-60 0 -40 40 0 15 C40 40 60 0 0 -40Z M-12 40 L12 40 L4 10 L-4 10Z" fill="#141414"/>','<g fill="#141414"><circle cy="-22" r="20"/><circle cx="-22" cy="8" r="20"/><circle cx="22" cy="8" r="20"/><path d="M-10 44 L10 44 L4 10 L-4 10Z"/></g>'][k];}
function cardsFan(x,y,p){if(p<=0)return'';const s=back(cl(p));let h='';for(let k=0;k<4;k++){const a=(-33+k*22)*ease(cl(p*1.4));h+=`<g transform="rotate(${f(a)}) translate(0 -150)"><rect x="-95" y="-135" width="190" height="270" rx="18" fill="#fffdf6" stroke="#141414" stroke-width="7"/><text x="-60" y="-70" class="lb" font-size="58" fill="${k<2?'#e2283b':'#141414'}" text-anchor="middle">A</text><g transform="translate(0 20) scale(1.3)">${suit(k)}</g></g>`;}
  return `<g transform="translate(${f(x)} ${f(y)}) scale(${f(s)})">${h}</g>`;}
function remote(x,y,s,r=0){return `<g transform="translate(${f(x)} ${f(y)}) rotate(${f(r)}) scale(${f(s)})"><rect x="-45" y="-130" width="90" height="260" rx="30" fill="#2b2b35" stroke="#141414" stroke-width="6"/><circle cy="-90" r="16" fill="#e2283b"/>${[0,1,2].map(i=>[0,1,2].map(j=>`<rect x="${-30+j*22}" y="${-50+i*30}" width="16" height="16" rx="5" fill="#9aa"/>`).join('')).join('')}<rect x="-20" y="50" width="40" height="40" rx="10" fill="#3f6fb5"/></g>`;}
function cake(x,y,s,eaten=0){return `<g transform="translate(${f(x)} ${f(y)}) scale(${f(s)})"><ellipse cy="70" rx="170" ry="40" fill="#f4f1ea" stroke="#141414" stroke-width="6"/>`+(eaten<1?`<g opacity="${f(1-eaten)}"><path d="M-120 60 L120 60 L120 -40 L-120 20Z" fill="#7a3a20"/><path d="M-120 20 L120 -40 L120 -20 L-120 38Z" fill="#fff0f4"/><path d="M-120 20 L120 -40 L60 -60 L-120 0Z" fill="#ff8fb0" stroke="#141414" stroke-width="5"/><circle cx="60" cy="-75" r="20" fill="#e2283b"/></g>`:`<g fill="#7a3a20"><circle cx="-40" cy="55" r="9"/><circle cx="10" cy="62" r="7"/><circle cx="60" cy="50" r="10"/></g>`)+`</g>`;}
function medCross(x,y,p){if(p<=0)return'';const s=back(cl(p));return `<g transform="translate(${f(x)} ${f(y)}) scale(${f(s)})"><circle r="120" fill="#fff" stroke="#141414" stroke-width="10"/><path d="M-30 -80 h60 v50 h50 v60 h-50 v50 h-60 v-50 h-50 v-60 h50Z" fill="#e2283b"/></g>`;}
function tag(x,y,p,txt,col='#ffd23f'){if(p<=0)return'';const s=back(cl(p)),w=txt.length*34+70;return `<g transform="translate(${f(x)} ${f(y)}) scale(${f(s)})"><rect x="${-w/2-14}" y="-58" width="${w+28}" height="104" rx="52" fill="${col}" opacity=".35" filter="url(#glow)"/><rect x="${-w/2}" y="-44" width="${w}" height="76" rx="38" fill="#2a1f45" stroke="${col}" stroke-width="7"/><text y="14" class="lb" font-size="52" fill="${col}" text-anchor="middle">${txt}</text></g>`;}
function stamp(x,y,p,txt,col='#e2283b',rot=-10){if(p<=0)return'';const s=1+2.5*(1-ease(cl(p*2.5))),w=txt.length*44+80;return `<g transform="translate(${f(x)} ${f(y)}) rotate(${rot}) scale(${f(s)})" opacity="${f(cl(p*3))}"><rect x="${-w/2}" y="-70" width="${w}" height="130" rx="16" fill="#fff8f0" opacity=".9" stroke="${col}" stroke-width="12"/><text y="26" class="lb" font-size="80" fill="${col}" text-anchor="middle">${txt}</text></g>`;}
function qmark(x,y,p,t,ok=false){if(p<=0)return'';const s=back(cl(p));return `<g transform="translate(${f(x)} ${f(y+Math.sin(t*4+x)*10)}) scale(${f(s)})"><circle r="52" fill="${ok?'#2fa84f':'#fff'}" stroke="#141414" stroke-width="7"/><text y="26" class="lb" font-size="76" fill="${ok?'#fff':'#141414'}" text-anchor="middle">${ok?'✓':'?'}</text></g>`;}
function book(x,y,p,t){if(p<=0)return'';const s=back(cl(p)),fl=Math.sin(t*7);let pg='';for(let k=0;k<3;k++){const ph=(t*1.6+k/3)%1;pg+=`<path transform="translate(0 -10) scale(${f(Math.cos(ph*Math.PI))} 1)" d="M0 0 L130 -20 L130 110 L0 130Z" fill="#fffdf2" stroke="#b8a888" stroke-width="3" opacity=".9"/>`;}
  return `<g transform="translate(${f(x)} ${f(y)}) scale(${f(s)})"><path d="M0 0 L-150 -26 L-150 116 L0 140 L150 116 L150 -26Z" fill="#6b2338" stroke="#141414" stroke-width="7"/><path d="M0 -6 L-138 -26 L-138 106 L0 128Z" fill="#fffdf2"/><path d="M0 -6 L138 -26 L138 106 L0 128Z" fill="#fffdf2"/>${pg}<path d="M-120 10 h90 M-120 40 h100 M-120 70 h80 M30 10 h90 M30 40 h70" stroke="#b8a888" stroke-width="6"/></g>`;}
function snap(x,y,p){if(p<=0||p>=1)return'';let h='';for(let k=0;k<8;k++){const a=k/8*TAU,r0=30+p*60,r1=60+p*120;h+=`<line x1="${f(x+Math.cos(a)*r0)}" y1="${f(y+Math.sin(a)*r0)}" x2="${f(x+Math.cos(a)*r1)}" y2="${f(y+Math.sin(a)*r1)}" stroke="#ffd23f" stroke-width="10" stroke-linecap="round" opacity="${f(1-p)}"/>`;}return h;}
function bar(x,y,w,p,pct,t){if(p<=0)return'';const k=ease(cl(p))*pct/100;return `<g transform="translate(${f(x)} ${f(y)})"><rect x="${-w/2}" y="-40" width="${w}" height="80" rx="40" fill="#2a1f45" stroke="#141414" stroke-width="8"/><rect x="${-w/2+8}" y="-32" width="${f((w-16)*k)}" height="64" rx="32" fill="#ffd23f"/><line x1="0" y1="-70" x2="0" y2="70" stroke="#fff" stroke-width="6" stroke-dasharray="14 10"/><text x="0" y="118" class="lb" font-size="44" fill="#fff" text-anchor="middle">50% = CHUTE</text></g>`;}

// ================= cenas =================
const EV=[];const ev=(s,u,n,g=1)=>{EV.push([s,u,n,g]);return u;};
const RS=.78,RY=FEET*RS,SS=.85,SY=FEET*SS;
const LP=V(-.8,RY,.75),BP=V(.08,RY,.45),TP=V(.62,RY,-.2);   // quarto
const LS2=V(-.55,SY,1.3),DS=V(.5,SY,1.05);                  // rua
const DOORH=HOUSES.filter(H=>H.z<0&&Math.abs(H.z+12.5)<1).reduce((a,b)=>Math.abs(b.x-1)<Math.abs(a.x-1)?b:a);
function closeOn(P,v,d,t,o={}){const dz=o.dist||1.0,dx=o.dx||0,dy=o.dy||0;camShot(v,d,V(P.x+dx,P.y+.06+dy,P.z+dz),V(P.x+dx*.9,P.y+.05+dy,P.z+dz*.88),V(P.x+(o.lx||0),P.y-.02+dy,P.z),V(P.x+(o.lx||0),P.y-.02+dy,P.z),{t,shake:o.shake});FOCUS=P;AP=o.ap||.012;}
const headQ=(P,dy=0)=>proj(P.x,P.y+dy,P.z);
const SC=[
// ---------- S0 gancho ----------
{mood:'room',fov:52,rain:u=>0,setup(d){ev(0,1.2,'snap',1);ev(0,1.25,'ding',.6);ev(0,2.0,'whoosh',.6);ev(0,4.9,'page',.8);ev(0,5.6,'whoosh',.5);ev(0,6.2,'sparkle',.6);},
async up(u,d,t){const s=shots(u,[0,2.0,3.8,5.6],d),v=s.v;let h='';roomLights(1,t);const SN=1.2,sn=seg(u,SN,SN+.5);
  let o={t,glow:u>SN?.6+.4*Math.sin(t*4):0};
  if(s.i===0)Object.assign(o,{expr:u<SN?'neutral':'smirk',walk:u<1.0?t*1.6:undefined,reachR:u>SN-.35&&u<SN+.5?[150,40]:undefined,handR:u>SN-.35&&u<SN+.5?(u<SN?'fist':'open'):'relaxed',look:Math.sin(t*1.5)*.7});
  if(s.i===1)Object.assign(o,{expr:'suspicious',look:darting(t,1.2),pupil:.8});
  if(s.i===2)Object.assign(o,{view:'3q',dir:1,expr:'smirk',gesture:'think',look:.8});
  if(s.i===3)Object.assign(o,{expr:'smug',lookCam:true,mouth:talk(t),aR:60,eR:-80,handR:'point'});
  await put(HERO,leo,LP.clone().add(V(s.i===0?lerp(.5,0,seg(u,0,1)):0,0,0)),RS,o);
  if(s.i>=2)await put(BIA,bia,BP,RS,{t,expr:s.i===3?'shock':'neutral',view:'3q',dir:-1,look:-.6});
  if(s.i===0){camShot(v,s.d,V(1.3,2.0,2.7),V(.8,1.7,2.2),V(-.6,1.0,.5),V(-.75,1.05,.6),{t});FOCUS=LP;AP=.002;
    if(u>SN-.1){const q=proj(svgWorld(HERO,150,40));h+=snap(q.x,q.y,seg(u,SN,SN+.4))+popText('TIC!',q.x+120,q.y-80,seg(u,SN,SN+.25),{size:90,fill:'#fff'});}}
  if(s.i===1){closeOn(LP,v,s.d,t,{dist:.85,dy:.04,ap:.018});FOVMUL=punch(u,2.0,.12);}
  if(s.i===2){const a=lerp(-.3,.35,ease(cl(v/s.d)));camAt2(V(-.35+Math.sin(a)*2.3,1.35,.6+Math.cos(a)*2.3),V(-.35,1.0,.6),t);FOCUS=LP;AP=.004;
    const q=headQ(BP,.35);h+=qmark(q.x-60,q.y-60,seg(v,.3,.6),t)+qmark(q.x+80,q.y-120,seg(v,.6,.9),t);}
  if(s.i===3){closeOn(LP,v,s.d,t,{dist:1.15,dx:.12,lx:.14,ap:.01});const q=headQ(BP,.1);h+=book(Math.min(900,q.x),q.y-260,seg(u,4.9,5.3),t);}
  if(s.i<=1){const tp=1-seg(u,2.4,2.7);if(tp>0)h+=label('E SE VOCÊ FOSSE',300,{size:96,p:tp*seg(u,.1,.4)})+label('UM MENTALISTA?',430,{size:126,fill:'#ffd23f',p:tp*seg(u,.25,.55)});}
  world(t);return h;}},
// ---------- S1 observação: lupas ----------
{mood:'room',fov:52,rain:u=>0,setup(d){ev(1,.2,'step',.4);ev(1,.6,'step',.4);ev(1,1.55,'pop');ev(1,3.05,'pop');ev(1,4.55,'pop');ev(1,5.85,'tick',.7);},
async up(u,d,t){const s=shots(u,[0,1.5,3.0,4.5,5.8],d),v=s.v;let h='';roomLights(1,t);
  const bx=lerp(1.0,BP.x,ease(seg(u,0,1.2)));const B=V(bx,RY,BP.z);
  await put(HERO,leo,LP,RS,{t,view:'3q',dir:1,expr:s.i===4?'smug':'suspicious',glow:.5+.5*Math.sin(t*5),gesture:s.i===4?'crossed':'think',look:.8});
  await put(BIA,bia,B,RS,{t,view:u<1.2?'side':'front',dir:-1,walk:u<1.2?t*1.8:undefined,expr:'happy',aR:u>1.2?150+Math.sin(t*10)*20:20,eR:-30,handR:u>1.2?'wave':'relaxed',look:-.6});
  if(s.i===0){camShot(v,s.d,V(-.3,1.35,2.8),V(-.32,1.33,2.6),V(-.3,1.05,.6),V(-.32,1.05,.6),{t});FOCUS=LP;AP=.003;}
  if(s.i===1){const hw=svgWorld(BIA,...handSVG(1,150,-30));closeOn(hw,v,s.d,t,{dist:.8,ap:.02});h+=lens(540,780,190,seg(v,.05,.35),IC.finger,'MARCA DE BRONZEADO',1);}
  if(s.i===2){const fw=V(B.x+.1,.12,B.z);camShot(v,s.d,V(fw.x+.2,.35,fw.z+.9),V(fw.x+.15,.32,fw.z+.8),fw,fw,{t});FOCUS=fw;AP=.015;h+=lens(540,760,190,seg(v,.05,.35),IC.shoe,'SAPATO GASTO',2);}
  if(s.i===3){const sw=svgWorld(BIA,-110,240);closeOn(sw,v,s.d,t,{dist:.75,ap:.02});h+=lens(540,760,190,seg(v,.05,.35),IC.sleeve,'PÓ DE GIZ',3);}
  if(s.i===4){closeOn(LP,v,s.d,t,{dist:.95,dx:.1,ap:.012});FOVMUL=punch(u,5.8,.1);const q=headQ(LP,.2);h+=sparkle(q.x+200,q.y-150,t,40);}
  world(t);return h;}},
// ---------- S2 leitura a frio ----------
{mood:'room',fov:54,rain:u=>0,setup(d){ev(2,.6,'pop');ev(2,2.0,'whoosh',.7);for(let k=0;k<3;k++)ev(2,4.0+k*.45,'ding',.5);ev(2,5.5,'sting',.8);},
async up(u,d,t){const s=shots(u,[0,1.9,3.7,5.5],d),v=s.v;let h='';roomLights(1,t);
  let o={t,glow:.6+.4*Math.sin(t*5)};
  if(s.i===0)Object.assign(o,{view:'3q',dir:1,expr:'smirk',gesture:'think',look:.8});
  if(s.i===1)Object.assign(o,{expr:'suspicious',gesture:'think',look:.3,lookY:-.4});
  if(s.i>=2)Object.assign(o,{view:'3q',dir:1,expr:s.i===3?'smug':'happy',aR:85,eR:-15,handR:'point',mouth:s.i===2?talk(t):0,look:.8});
  await put(HERO,leo,LP,RS,o);
  await put(BIA,bia,BP,RS,{t,view:'3q',dir:-1,expr:s.i===3?'shock':(s.i===2?'suspicious':'neutral'),aL:s.i===3?150:20,eL:s.i===3?-120:-10,aR:s.i===3?150:20,eR:s.i===3?-120:-10,look:-.6,mouth:s.i===3?.6:0});
  if(s.i===0){camShot(v,s.d,V(-.35,1.35,2.8),V(-.3,1.33,2.55),V(-.35,1.05,.6),V(-.3,1.05,.6),{t});FOCUS=LP;AP=.003;h+=stamp(540,380,seg(u,.6,1.2),'LEITURA A FRIO','#3a6fb5',-6);}
  if(s.i===1){closeOn(LP,v,s.d,t,{dist:.9,ap:.014});FOVMUL=punch(u,1.9,.1);const q=headQ(LP,0);
    [IC.finger,IC.shoe,IC.sleeve].forEach((ic,k)=>{const p=seg(u,2.0+k*.35,2.9+k*.35);if(p>0&&p<1){const x=lerp(k===0?150:k===1?930:540,q.x,ease(p)),y=lerp(k===2?1500:400,q.y-60,ease(p));h+=`<g transform="translate(${f(x)} ${f(y)}) scale(${f(.45*(1-p*.6))})"><circle r="150" fill="#efe6d6" stroke="#c9a24a" stroke-width="16"/><g clip-path="url(#cl${k+1})">${ic}</g></g>`;}});
    h+=`<defs>${[1,2,3].map(k=>`<clipPath id="cl${k}"><circle r="150"/></clipPath>`).join('')}</defs>`;}
  if(s.i===2){camShot(v,s.d,V(.3,1.4,2.5),V(.25,1.38,2.3),V(-.15,1.1,.6),V(-.15,1.1,.6),{t});FOCUS=BP;AP=.004;const q=headQ(BP,.32);
    for(let k=0;k<3;k++)h+=qmark(q.x-110+k*110,q.y-80-(k%2)*50,seg(u,3.75+k*.1,4.0+k*.1),t,u>4.0+k*.45);}
  if(s.i===3){closeOn(BP,v,s.d,t,{dist:.9,ap:.014,shake:shake(u,5.5,.015,5)});const q=headQ(BP,.1);h+=emanata(q.x,q.y,seg(v,0,.2),190)+popText('COMO VOCÊ SABIA?!',540,420,seg(v,.05,.35),{size:96,fill:'#fff',rot:-4});}
  world(t);return h;}},
// ---------- S3 efeito Forer ----------
{mood:'room',fov:54,rain:u=>0,setup(d){ev(3,.1,'pop');ev(3,1.9,'boing',.6);ev(3,3.6,'ding',.6);ev(3,5.0,'stamp',.9);},
async up(u,d,t){const s=shots(u,[0,1.8,3.6,5.0],d),v=s.v;let h='';roomLights(1,t);
  const nod=Math.max(0,Math.sin(t*7))*14;
  await put(HERO,leo,LP,RS,{t,glow:.4,view:'3q',dir:1,expr:'smirk',aR:70,eR:-70,handR:'open',look:.8});
  await put(BIA,bia,BP,RS,{t,expr:s.i>=1?'happy':'neutral',lookY:.4,bob:s.i>=1?nod:0,aL:20,eL:-30,aR:20,eR:-30});
  await put(TEO,teo,TP,RS,{t,expr:s.i===2?'laugh':(s.i>=1?'happy':'neutral'),lookY:.4,bob:s.i>=1?Math.max(0,Math.sin(t*7+1))*14:0,eyeFx:s.i===2?'star':undefined,aL:s.i===2?150:20,eL:-20,aR:s.i===2?150:20,eR:-20,mouth:s.i===2?.6:0});
  if(s.i===0){camShot(v,s.d,V(-.1,1.45,2.8),V(-.05,1.42,2.6),V(-.1,1.1,.3),V(-.05,1.1,.3),{t});FOCUS=BP;AP=.003;h+=card(540,640,seg(v,.05,.35),['VOCÊ É FORTE, MAS','ÀS VEZES SE SENTE','INSEGURO...'],t);}
  if(s.i===1){camShot(v,s.d,V(.75,1.35,2.4),V(.7,1.33,2.2),V(.35,1.05,.1),V(.35,1.05,.1),{t});FOCUS=BP;AP=.004;const a=headQ(BP,.3),b=headQ(TP,.3);h+=popText('SOU EU!',a.x,a.y-120,seg(v,.1,.35),{size:84,fill:'#fff'})+popText('EU TAMBÉM!',b.x+40,b.y-200,seg(v,.6,.85),{size:76,fill:'#ffd23f'});}
  if(s.i===2){closeOn(TP,v,s.d,t,{dist:.85,ap:.014});FOVMUL=punch(u,3.6,.1);h+=popText('É IGUALZINHO EU!',540,420,seg(v,.1,.4),{size:96,fill:'#fff'});}
  if(s.i===3){camShot(v,s.d,V(-.1,1.4,2.75),V(-.05,1.4,2.6),V(-.1,1.05,.3),V(-.05,1.05,.3),{t});FOCUS=LP;AP=.003;h+=stamp(540,560,seg(u,5.0,5.4),'EFEITO FORER','#e2283b',-8)+label('(1949)',720,{size:70,fill:'#fff',p:seg(u,5.3,5.6)});}
  world(t);return h;}},
// ---------- S4 rua: linguagem corporal ----------
{mood:'sunset',fov:52,rain:u=>0,setup(d){ev(4,.4,'pop');ev(4,1.75,'pop');ev(4,3.4,'pop');},
async up(u,d,t){const s=shots(u,[0,1.7,3.4],d),v=s.v;let h='';WIND={w:.3,dx:1,dz:0};
  const rim={rim:'#ffb070',rimDir:1,light:{color:'#ffb070',az:70,amt:.4}};
  await put(HERO,leo,LS2,SS,{t,...rim,view:'3q',dir:1,expr:'suspicious',gesture:'think',glow:.6+.4*Math.sin(t*5),look:.8});
  let o={t,...rim,expr:'suspicious',look:darting(t,1.4)};
  if(s.i===0)Object.assign(o,{gesture:'crossed'});
  if(s.i===1)Object.assign(o,{view:'3q',dir:-1,gesture:'crossed',look:-.8});
  if(s.i===2)Object.assign(o,{expr:'fear',reachR:[20,30],front:'R',handR:'open',aL:15,eL:-10,blush:.5});
  await put(DAVI,davi,DS,SS,o);
  if(s.i===0){camShot(v,s.d,V(.25,1.45,4.4),V(.2,1.42,4.0),V(.1,1.15,1.1),V(.15,1.15,1.1),{t});FOCUS=DS;AP=.004;const q=proj(svgWorld(DAVI,0,260));h+=arrow(q.x+330,q.y-260,q.x+60,q.y-20,seg(v,.2,.6),'BRAÇOS CRUZADOS',600,360);}
  if(s.i===1){const fw=V(DS.x,.15,DS.z);camShot(v,s.d,V(fw.x+.6,.45,fw.z+1.6),V(fw.x+.5,.42,fw.z+1.45),fw,fw,{t});FOCUS=fw;AP=.012;
    const f0=proj(fw),dq=proj(DOORH.x,1.2,DOORH.z+3.2);h+=arrow(f0.x+40,f0.y-120,Math.max(60,Math.min(1020,dq.x)),Math.max(300,dq.y),seg(v,.15,.6),'PÉS PRA PORTA',540,360);}
  if(s.i===2){closeOn(DS,v,s.d,t,{dist:.95,ap:.014});const q=headQ(DS,-.05);h+=arrow(q.x+360,q.y-330,q.x+80,q.y-40,seg(v,.15,.55),'MÃO NO ROSTO',560,360)+sweat(q.x,q.y-110,t);}
  world(t,V(0,0,1));return h;}},
// ---------- S5 54% ----------
{mood:'sunset',fov:52,rain:u=>0,setup(d){ev(5,.3,'pop');ev(5,2.35,'coin',.9);ev(5,4.6,'whoosh',.6);ev(5,5.3,'sting',.7);ev(5,6.9,'boing',.6);ev(5,8.6,'coin',.6);ev(5,9.5,'ding',.6);},
async up(u,d,t){const s=shots(u,[0,2.3,4.6,6.8,8.6],d),v=s.v;let h='';WIND={w:.3,dx:1,dz:0};
  const rim={rim:'#ffb070',rimDir:1,light:{color:'#ffb070',az:70,amt:.4}};
  let o={t,...rim,glow:.4};
  if(s.i===0)Object.assign(o,{view:'3q',dir:1,expr:'suspicious',gesture:'think',look:.8});
  if(s.i===1)Object.assign(o,{expr:'smirk',aR:40,eR:-110,handR:'thumb',look:.3,lookY:-.8});
  if(s.i===2)Object.assign(o,{expr:'neutral',gesture:'think',look:.5});
  if(s.i===3)Object.assign(o,{expr:'halfsmile',gesture:'shrug',lookCam:true});
  if(s.i===4)Object.assign(o,{expr:u>9.2?'laugh':'shock',reachR:[130,260],handR:'open',aL:15,eL:-10,lookY:.4,mouth:u>9.2?.5:0});
  await put(HERO,leo,LS2,SS,o);
  await put(DAVI,davi,DS,SS,{t,...rim,expr:s.i===0?'smirk':'halfsmile',gesture:'hips',look:-.6});
  const tossP=seg(u,2.35,4.4),hw=svgWorld(HERO,...handSVG(1,40,-110));
  if(s.i===0){camShot(v,s.d,V(.05,1.4,4.4),V(0,1.38,4.0),V(0,1.12,1.1),V(0,1.12,1.1),{t});FOCUS=LS2;AP=.004;const a=headQ(LS2,.35),b=headQ(DS,.35);h+=popText('VERDADE?',b.x+40,b.y-170,seg(v,.3,.55),{size:72,fill:'#fff',rot:6})+popText('MENTIRA?',b.x-60,b.y-280,seg(v,.8,1.05),{size:80,fill:'#ff8a7a',rot:-5});}
  if(s.i===1){camShot(v,s.d,V(hw.x+.15,hw.y+.4,hw.z+1.5),V(hw.x+.12,hw.y+.45,hw.z+1.35),V(hw.x,hw.y+.35,hw.z),V(hw.x,hw.y+.55,hw.z),{t});FOCUS=hw;AP=.012;
    const q=proj(hw),yy=q.y-30-Math.sin(tossP*Math.PI)*900;h+=coin(q.x,yy,t*14,1.1)+label('CARA OU COROA?',360,{size:96,p:seg(v,.3,.6),fill:'#fff'});}
  if(s.i===2){camShot(v,s.d,V(-.4,1.6,3.2),V(-.35,1.55,3.0),V(-.4,1.3,1.3),V(-.38,1.3,1.3),{t});FOCUS=LS2;AP=.006;
    h+=label('DETECTAR MENTIRA',300,{size:84,p:seg(v,.05,.3),fill:'#fff'})+label('SÓ OLHANDO:',400,{size:84,p:seg(v,.15,.4),fill:'#fff'})+counter(540,560,0,54,seg(v,.3,1.5),{suf:'%',size:170,fill:'#ffd23f'})+bar(540,1230,760,seg(v,.3,1.5),54,t);}
  if(s.i===3){closeOn(LS2,v,s.d,t,{dist:1.0,ap:.014});FOVMUL=punch(u,6.8,.1);h+=popText('≈ CARA OU COROA',540,380,seg(v,.1,.4),{size:100,fill:'#ffd23f'});}
  if(s.i===4){camShot(v,s.d,V(-.3,1.4,3.0),V(-.32,1.38,2.8),V(-.5,1.1,1.3),V(-.5,1.1,1.3),{t});FOCUS=LS2;AP=.006;const q=proj(svgWorld(HERO,130,250)),fp=seg(u,8.6,9.2);h+=coin(q.x,lerp(-200,q.y-20,ease(fp)),fp<1?t*16:0,1)+(fp>=1?popText('CARA!',q.x,q.y-200,seg(u,9.2,9.45),{size:90,fill:'#fff'}):'');}
  world(t,V(0,0,1));return h;}},
// ---------- S6 perguntas certas ----------
{mood:'sunset',fov:52,rain:u=>0,setup(d){for(let k=0;k<3;k++)ev(6,.4+k*.4,'pop',.6);ev(6,2.0,'plop',.6);ev(6,3.75,'sting',.9);ev(6,5.0,'ding',.6);},
async up(u,d,t){const s=shots(u,[0,1.9,3.7,5.0],d),v=s.v;let h='';WIND={w:.3,dx:1,dz:0};
  const rim={rim:'#ffb070',rimDir:1,light:{color:'#ffb070',az:70,amt:.4}};
  await put(HERO,leo,LS2,SS,{t,...rim,view:'3q',dir:1,glow:.6+.4*Math.sin(t*5),expr:s.i===3?'smug':'happy',aR:s.i<2?60+Math.sin(t*4)*15:20,eR:-50,handR:'open',mouth:s.i<2?talk(t):0,gesture:s.i===3?'crossed':undefined,look:.8});
  let o={t,...rim};
  if(s.i<2)Object.assign(o,{view:'3q',dir:-1,expr:s.i===0?'neutral':'fear',look:s.i===1?darting(t,2):-.8,blush:seg(u,1,3)*.8});
  else if(s.i===2)Object.assign(o,{expr:'shock',aL:150,aR:150,eL:-20,eR:-20,handL:'open',handR:'open',mouth:.7,tears:'drip'});
  else Object.assign(o,{expr:'halfsmile',gesture:'scratch',blush:.8,look:-.6});
  await put(DAVI,davi,DS,SS,o);
  if(s.i===0){camShot(v,s.d,V(0,1.4,4.2),V(.05,1.38,3.9),V(0,1.12,1.15),V(.05,1.12,1.15),{t});FOCUS=LS2;AP=.004;const q=headQ(LS2,.35);for(let k=0;k<3;k++)h+=qmark(q.x+120+k*120,q.y-120-k*60,seg(u,.4+k*.4,.65+k*.4),t);}
  if(s.i===1){closeOn(DS,v,s.d,t,{dist:.9,ap:.014});const q=headQ(DS,.2);h+=sweat(q.x,q.y-60,t)+sweat(q.x+40,q.y-40,t+.5);}
  if(s.i===2){camShot(v,s.d,V(.5,1.45,3.3),V(.5,1.42,3.0),V(.45,1.2,1.05),V(.45,1.2,1.05),{t,shake:shake(u,3.75,.03,5)});FOVMUL=punch(u,3.75,.15);FOCUS=DS;AP=.006;h+=popText('FUI EU!',540,420,seg(u,3.75,4.05),{size:150,fill:'#ff8a7a',rot:-6});}
  if(s.i===3){closeOn(LS2,v,s.d,t,{dist:1.0,dx:-.1,ap:.014});const q=headQ(LS2,.3);h+=sparkle(q.x+220,q.y-120,t,46)+sparkle(q.x-200,q.y-60,t+1,32);}
  world(t,V(0,0,1));return h;}},
// ---------- S7 palácio da memória ----------
{mood:'room',fov:54,rain:u=>0,setup(d){ev(7,.1,'shimmer',.8);for(let k=0;k<4;k++)ev(7,1.9+k*.4,'ding',.5);ev(7,5.2,'sparkle',.7);},
async up(u,d,t){const s=shots(u,[0,1.8,3.6,5.2],d),v=s.v;let h='';roomLights(.35,t);
  const SPOTS=[[V(1.15,.95,.2),'NOMES','#ffd23f'],[V(-2.4,1.1,.3),'DATAS','#9fe6ff'],[V(1.15,1.9,-2.8),'SENHAS','#ffb0e0'],[V(-2.5,1.6,-2.6),'ROSTOS','#b8f0a0'],[V(.05,.95,-2.5),'NÚMEROS','#ffcf8a']];
  const walkP=s.i===2;const P=walkP?V(lerp(-.8,.0,seg(u,3.6,5.2)),RY,lerp(.75,.2,seg(u,3.6,5.2))):LP;
  await put(HERO,leo,P,RS,{t,glow:1,expr:s.i===3?'smug':'halfsmile',blink:s.i<3?1:undefined,walk:walkP?t*1.4:undefined,aL:30,aR:30,eL:-20,eR:-20,handL:'open',handR:'open',lookCam:s.i===3});
  if(s.i===0){closeOn(LP,v,s.d,t,{dist:1.05,ap:.012});h+=label('PALÁCIO',330,{size:120,p:seg(v,.1,.4),fill:'#ffd23f'})+label('DA MEMÓRIA',460,{size:110,p:seg(v,.25,.55),fill:'#fff'});}
  if(s.i===1){camShot(v,s.d,V(-1.6,1.6,2.3),V(.6,1.7,1.6),V(-1.2,1.2,-1.5),V(1.0,1.2,-1.5),{t});FOCUS=V(0,1.2,-1.5);AP=.002;}
  if(s.i===2){camShot(v,s.d,V(1.9,2.6,2.6),V(1.6,2.5,2.4),V(-.6,1.0,-.8),V(-.6,1.0,-.9),{t});FOCUS=P;AP=.002;}
  if(s.i===3){closeOn(LP,v,s.d,t,{dist:.85,ap:.016});FOVMUL=punch(u,5.2,.1);}
  if(s.i>=1&&s.i<=2)SPOTS.forEach(([p,txt,c],k)=>{const q=proj(p);if(q.z<1&&q.x>-200&&q.x<1280)h+=tag(q.x,q.y,seg(u,1.9+k*.4,2.2+k*.4),txt,c);});
  // brilho mágico flutuando
  for(let k=0;k<26;k++){const ph=(t*.25+rnd(k))%1;h+=`<circle cx="${f(rnd(k+2)*1080+Math.sin(t+k)*30)}" cy="${f(1800-ph*1700)}" r="${f(3+rnd(k+5)*5)}" fill="${['#ffd23f','#9fe6ff','#ffb0e0'][k%3]}" opacity="${f(Math.sin(ph*Math.PI)*.8)}"/>`;}
  world(t);return h;}},
// ---------- S8 hipnose ----------
{mood:'room',fov:54,rain:u=>0,setup(d){ev(8,.1,'tick',.6);ev(8,1.0,'tick',.5);ev(8,2.0,'boing',.6);ev(8,4.0,'buzz',.8);ev(8,5.6,'pop');ev(8,6.4,'ding',.6);},
async up(u,d,t){const s=shots(u,[0,2.0,4.0,5.6],d),v=s.v;let h='';roomLights(1,t);
  const sway=Math.sin(t*3.2);
  await put(HERO,leo,LP,RS,{t,glow:.8,view:'3q',dir:1,expr:s.i===2?'halfsmile':'smirk',aR:80,eR:-20,handR:'grip',look:.8,mouth:s.i===0?talk(t):0});
  let o={t,view:'3q',dir:-1,look:sway*.9};
  if(s.i<2)Object.assign(o,{expr:'neutral',eyeFx:s.i===1?'spiral':undefined,rot:sway*(s.i===1?5:1),mouth:s.i===1?.25:0});
  else if(s.i===2)Object.assign(o,{expr:'shock',look:0,aL:60,aR:60,eL:-60,eR:-60,handL:'open',handR:'open'});
  else Object.assign(o,{expr:'happy',blink:1,stance:undefined,aL:20,aR:20,eL:-30,eR:-30});
  const TT=V(.0,RY,.35);await put(TEO,teo,TT,RS,o);
  const hw=svgWorld(HERO,...handSVG(1,80,-20));
  if(s.i===0){camShot(v,s.d,V(-.35,1.35,2.6),V(-.32,1.33,2.4),V(-.4,1.15,.5),V(-.4,1.15,.5),{t});FOCUS=TT;AP=.003;const q=proj(hw);h+=watch(q.x,q.y-20,t,30);}
  if(s.i===1){closeOn(TT,v,s.d,t,{dist:.85,ap:.014});h+=watch(360,120,t,34)+label('HIPNOSE',380,{size:120,x:720,p:seg(v,.1,.4),fill:'#c9a0ff'});}
  if(s.i===2){camShot(v,s.d,V(-.1,1.4,2.3),V(-.12,1.38,2.1),V(-.35,1.12,.5),V(-.35,1.12,.5),{t,shake:shake(u,4.0,.02,6)});FOVMUL=punch(u,4.0,.12);FOCUS=TT;AP=.004;
    h+=label('NÃO CONTROLA',340,{size:110,p:seg(v,.05,.3),fill:'#fff'})+label('NINGUÉM!',470,{size:130,p:seg(v,.15,.4),fill:'#ff6f6f'});}
  if(s.i===3){closeOn(TT,v,s.d,t,{dist:1.0,dx:-.15,lx:-.1,ap:.012});h+=medCross(800,560,seg(v,.05,.35))+label('FOCO PROFUNDO',330,{size:88,p:seg(v,.1,.4),fill:'#fff'})+label('ALIVIA A DOR',760,{size:84,x:800,p:seg(v,.5,.8),fill:'#ffd23f'});}
  world(t);return h;}},
// ---------- S9 sugestão: elefante cor-de-rosa ----------
{mood:'room',fov:54,rain:u=>0,setup(d){ev(9,.2,'pop');ev(9,2.1,'pop');ev(9,4.1,'boing',.9);ev(9,4.6,'boing',.6);ev(9,5.7,'buzz',.5);},
async up(u,d,t){const s=shots(u,[0,2.1,4.1,5.7],d),v=s.v;let h='';roomLights(1,t);
  await put(HERO,leo,LP,RS,{t,glow:.6,view:'3q',dir:1,expr:s.i===3?'laugh':'smirk',aR:s.i<2?75:20,eR:-15,handR:s.i<2?'point':'relaxed',mouth:s.i<2?talk(t):(s.i===3?.5:0),look:.8});
  let o={t,view:'3q',dir:-1,look:-.6};
  if(s.i<2)Object.assign(o,{expr:'neutral',gesture:'crossed'});
  else if(s.i===2)Object.assign(o,{expr:'shock',view:'front',lookY:-.6,aL:20,aR:20});
  else Object.assign(o,{expr:'angry',view:'front',gesture:'facepalm',rage:.4});
  await put(BIA,bia,BP,RS,o);
  if(s.i===0){camShot(v,s.d,V(-.3,1.35,2.7),V(-.32,1.33,2.5),V(-.35,1.1,.6),V(-.33,1.1,.6),{t});FOCUS=LP;AP=.003;h+=stamp(540,400,seg(u,.2,.7),'SUGESTÃO','#c040a0',-6);}
  if(s.i===1){closeOn(BP,v,s.d,t,{dist:1.2,dx:.2,lx:.15,ap:.01});const p=seg(v,0,.3),sc=back(p);
    if(p>0)h+=`<g transform="translate(540 560) scale(${f(sc)}) rotate(-4)"><rect x="-420" y="-150" width="840" height="300" rx="30" fill="#fff8e8" stroke="#141414" stroke-width="10"/><text y="-30" class="lb" font-size="80" fill="#141414" text-anchor="middle">NÃO PENSE NUM</text><text y="80" class="lb" font-size="86" fill="#ff6fa8" text-anchor="middle">ELEFANTE ROSA</text></g>`;}
  if(s.i>=2){closeOn(BP,v,s.d,t,{dist:1.25,dy:.1,ap:.01});const q=headQ(BP,.25),p=seg(u,4.1,4.4);h+=bubble(540,560,640,420,p,q.x+60,q.y-60)+(p>0?elephant(540,560,t,.9*back(p)):'');if(s.i===3)h+=popText('AAAH, NÃO!',540,960,seg(v,.1,.35),{size:90,fill:'#fff'});}
  world(t);return h;}},
// ---------- S10 poderes: cartas, controle, bolo ----------
{mood:'room',fov:54,rain:u=>0,setup(d){ev(10,.2,'card',.9);ev(10,1.0,'sting',.7);ev(10,2.5,'whoosh',.6);ev(10,3.2,'ding',.7);ev(10,4.7,'pop');ev(10,5.6,'sting',.8);},
async up(u,d,t){const s=shots(u,[0,2.4,4.6],d),v=s.v;let h='';roomLights(1,t);
  let o={t,glow:.7};
  if(s.i===0)Object.assign(o,{expr:'laugh',aR:70,eR:-60,handR:'grip',aL:15,eL:-10,mouth:.4,lookCam:true});
  if(s.i===1)Object.assign(o,{view:'3q',dir:1,expr:'smug',reachR:[260,240],handR:'grip',look:.8});
  if(s.i===2)Object.assign(o,{view:'3q',dir:1,expr:'smirk',aR:85,eR:-10,handR:'point',look:.8});
  const L0=s.i===1?V(.25,RY,.55):LP;await put(HERO,leo,L0,RS,o);
  await put(TEO,teo,s.i===2?V(.15,RY,.45):TP,RS,{t,view:'3q',dir:-1,expr:s.i===0?'angry':(s.i===2?(u>5.6?'shock':'halfsmile'):'neutral'),gesture:s.i===0?'crossed':undefined,blush:s.i===2?.8:0,look:-.6});
  if(s.i===0){camShot(v,s.d,V(-.55,1.35,2.2),V(-.6,1.33,2.0),V(-.6,1.1,.75),V(-.6,1.1,.75),{t});FOCUS=LP;AP=.006;const q=proj(svgWorld(HERO,...handSVG(1,70,-60)));h+=cardsFan(q.x+40,q.y+60,seg(v,.05,.45))+popText('GANHEI!',540,380,seg(u,1.0,1.3),{size:130,fill:'#ffd23f'});}
  if(s.i===1){const bw=V(1.15,.75,-.35);camShot(v,s.d,V(.6,1.45,1.9),V(.65,1.4,1.7),V(.9,.9,-.1),V(.9,.9,-.1),{t});FOCUS=bw;AP=.004;const q=proj(svgWorld(HERO,260,240)),p=seg(u,2.6,3.2);h+=remote(lerp(proj(bw).x,q.x,ease(p)),lerp(proj(bw).y,q.y-40,ease(p)),.9,-20+p*40)+counter(540,360,0,2,seg(u,2.7,3.2),{suf:' SEGUNDOS!',size:110,fill:'#9fe6ff'});}
  if(s.i===2){camShot(v,s.d,V(-.1,1.35,2.2),V(-.08,1.33,2.0),V(-.3,1.1,.55),V(-.28,1.1,.55),{t,shake:shake(u,5.6,.02,6)});FOCUS=V(.15,RY,.45);AP=.006;const q=headQ(V(.15,RY,.45),-.05);
    h+=cake(300,1250,.9,seg(u,4.6,5.2))+`<g fill="#7a3a20">${[[-30,40],[20,55],[45,30],[-10,70]].map(([a,b])=>`<circle cx="${f(q.x+a)}" cy="${f(q.y+b)}" r="7"/>`).join('')}</g>`+popText('FOI O TÉO!',540,380,seg(u,5.6,5.9),{size:120,fill:'#ff8a7a',rot:-6});}
  world(t);return h;}},
// ---------- S11 o preço: mímica ----------
{mood:'room',fov:54,rain:u=>0,setup(d){ev(11,.2,'whoosh',.5);ev(11,1.45,'ding',.8);ev(11,3.0,'buzz',.7);ev(11,4.6,'plop',.6);},
async up(u,d,t){const s=shots(u,[0,1.4,3.0,4.6],d),v=s.v;let h='';roomLights(1,t);
  await put(HERO,leo,LP,RS,{t,glow:s.i===1?1:.5,view:'3q',dir:1,expr:s.i===1?'laugh':(s.i===3?'happy':'smirk'),aR:s.i===1?150:20,eR:-10,handR:s.i===1?'point':'relaxed',mouth:s.i===1?.6:0,look:.8});
  let b={t,view:'front'};
  if(s.i===0)Object.assign(b,{expr:'happy',reachR:[0,-230],handR:'open',aL:60+Math.sin(t*6)*20,eL:-40,hop:0,bob:Math.sin(t*8)*10});
  else if(s.i<3)Object.assign(b,{expr:'angry',gesture:'crossed',rage:s.i===2?.5:0});
  else Object.assign(b,{expr:'suspicious',view:'3q',dir:-1,look:-.8});
  await put(BIA,bia,BP,RS,b);
  await put(TEO,teo,TP,RS,{t,expr:s.i>=2?'angry':'neutral',gesture:s.i>=2?'crossed':'think',look:-.4});
  if(s.i===0){camShot(v,s.d,V(.5,1.35,2.5),V(.45,1.33,2.3),V(.2,1.15,.3),V(.18,1.15,.3),{t});FOCUS=BP;AP=.004;h+=label('MÍMICA',360,{size:120,p:seg(v,.1,.4),fill:'#fff'});}
  if(s.i===1){closeOn(LP,v,s.d,t,{dist:.95,dx:.1,ap:.012});FOVMUL=punch(u,1.4,.12);h+=popText('TUBARÃO!',540,420,seg(u,1.45,1.75),{size:140,fill:'#9fe6ff',rot:-5});}
  if(s.i===2){camShot(v,s.d,V(.35,1.4,2.6),V(.35,1.38,2.4),V(.35,1.1,.1),V(.35,1.1,.1),{t});FOCUS=BP;AP=.004;const a=headQ(BP,.3),c=headQ(TP,.3);h+=popText('AFF...',a.x,a.y-140,seg(v,.1,.35),{size:90,fill:'#fff'})+popText('DE NOVO?!',c.x+40,c.y-230,seg(v,.5,.75),{size:80,fill:'#ff8a7a'});}
  if(s.i===3){closeOn(BP,v,s.d,t,{dist:.95,ap:.014});const q=headQ(BP,.3);h+=popText('HUMM...',q.x+80,q.y-160,seg(v,.2,.45),{size:84,fill:'#fff'})+qmark(q.x-150,q.y-120,seg(v,.4,.6),t);}
  world(t);return h;}},
// ---------- S12 CTA ----------
{mood:'sunset',fov:50,rain:u=>0,setup(d){ev(12,.6,'pop');ev(12,1.4,'pop');ev(12,4.2,'pop');ev(12,4.8,'pop');ev(12,5.1,'pop');ev(12,5.5,'ding',.5);ev(12,d-1.6,'ding',.6);},
async up(u,d,t){const s=shots(u,[0,2.3,4.6],d),v=s.v;let h='';WIND={w:.3,dx:1,dz:0};const P=V(-.2,SY,1.3);
  const rim={rim:'#ffb070',rimDir:1,light:{color:'#ffb070',az:70,amt:.4}};
  await put(HERO,leo,P,SS,{t,...rim,glow:.6+.4*Math.sin(t*4),expr:s.i===2&&u>d-2?'happy':'smirk',lookCam:true,mouth:talk(t),gesture:s.i===0?'think':undefined,aR:s.i===2?150+Math.sin(t*12)*25:(s.i===1?75:20),eR:-30,handR:s.i===2?'wave':(s.i===1?'point':'relaxed')});
  if(s.i===0){camShot(v,s.d,V(0,1.3,3.6),V(-.05,1.28,3.3),V(-.2,1.0,1.3),V(-.2,1.0,1.3),{t});FOCUS=P;AP=.005;
    h+=lens(290,330,120,seg(v,.4,.7),`<text y="40" class="lb" font-size="110" fill="#141414" text-anchor="middle">?</text>`,'CRIMES',4)+lens(790,330,120,seg(v,1.1,1.4),cake(0,-20,.55,0),'LANCHE',5)+label('OU',350,{size:90,p:seg(v,.8,1.0),fill:'#fff'});}
  if(s.i===1){closeOn(P,v,s.d,t,{dist:1.05,ap:.014});FOVMUL=punch(u,2.3,.1);h+=popText('COMENTA AÍ!',540,400,seg(u,4.0,4.3),{size:130,fill:'#ffd23f'});}
  if(s.i===2){camShot(v,s.d,V(.1,1.45,2.8),V(.05,1.43,2.6),V(-.2,1.3,1.3),V(-.2,1.3,1.3),{t});FOCUS=P;AP=.008;h+=label('PRÓXIMO VÍDEO?',300,{size:120,fill:'#ffd23f',p:1});
    const ab=(y,L,txt,col,p)=>p<=0?'':`<g transform="translate(540 ${y}) scale(${f(back(cl(p)))})"><rect x="-470" y="-80" width="940" height="160" rx="40" fill="#2a1f45" stroke="${col}" stroke-width="10"/><circle cx="-380" r="56" fill="${col}"/><text x="-380" y="30" class="lb" font-size="84" fill="#141414" text-anchor="middle">${L}</text><text x="50" y="24" class="lb" font-size="64" fill="#fff" text-anchor="middle">${txt}</text></g>`;
    h+=ab(470,'A','E SE VOCÊ FOSSE INVISÍVEL?','#ffd23f',seg(v,.2,.5))+ab(660,'B','E SE VOCÊ LESSE MENTES?','#9fe6ff',seg(v,.5,.8))+label('COMENTA A OU B!',850,{size:96,fill:'#ff8ab0',p:seg(v,.9,1.2)});
    const cp=seg(u,d-1.7,d-1.3);if(cp>0)h+=`<g transform="translate(540 1560) scale(${(back(cp)*(1+Math.sin(t*8)*.03)).toFixed(3)})"><rect x="-300" y="-70" width="600" height="130" rx="65" fill="#ff2d55" stroke="#141414" stroke-width="10"/><text y="28" class="lb" font-size="84" fill="#fff" text-anchor="middle">SIGA PARA MAIS</text></g>`;}
  world(t,V(0,0,1));return h;}}
];

// Personagens 2D (SVG). Compatível com alcatraz/chars.js + walk/run/sq/lean/bob/mouth e expressões fear/angry/laugh.
// ---------- helpers ----------
const cl=(x,a=0,b=1)=>Math.max(a,Math.min(b,x));
const seg=(u,a,b)=>cl((u-a)/(b-a));
const ease=t=>t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2;
const eo=t=>1-Math.pow(1-t,3);
const back=t=>{if(t<=0)return 0;if(t>=1)return 1;const c=1.9,c3=c+1;return 1+c3*Math.pow(t-1,3)+c*Math.pow(t-1,2)};
const lerp=(a,b,t)=>a+(b-a)*t;
const rnd=i=>{const x=Math.sin(i*127.1+311.7)*43758.5453;return x-Math.floor(x)};
const f=n=>(+n).toFixed(1);

function label(txt,y,o={}){
  const {size=120,fill='#fff',p=1,x=540,stroke=18,rot=0}=o;
  if(p<=0)return '';
  const s=back(cl(p)),op=cl(p*3);
  return `<g transform="translate(${f(x)} ${f(y)}) rotate(${rot}) scale(${s.toFixed(3)})" opacity="${op.toFixed(2)}"><text class="lb" y="6" font-size="${size}" fill="#000" opacity=".35" stroke="#000" stroke-width="${stroke}" text-anchor="middle">${txt}</text><text class="lb" font-size="${size}" fill="${fill}" stroke="#141414" stroke-width="${stroke}" text-anchor="middle">${txt}</text></g>`;
}

// ---------- characters ----------
const ORANGE={skin:'#f0913f',skinD:'#c96c24',shirt:'#f4f0e6',shirtD:'#cdc4b1',pants:'#b9a17a',pantsD:'#8c7756',hair:'#3a2722',hat:false};
const GUARD={skin:'#eab48b',skinD:'#bb845c',shirt:'#2d416c',shirtD:'#1b2847',pants:'#222d4a',pantsD:'#151c30',hair:'#3a2722',hat:true};

function head(o={}){
  const c=Object.assign({},ORANGE,o), e=c.expr||'neutral', look=c.look||0, lookY=c.lookY||0, bl=c.blink||0, mo=c.mouth||0;
  let h='';
  h+=`<circle cx="-112" cy="12" r="28" fill="${c.skin}" stroke="${c.skinD}" stroke-width="5"/><circle cx="112" cy="12" r="28" fill="${c.skin}" stroke="${c.skinD}" stroke-width="5"/>`;
  h+=`<circle r="115" fill="${c.skin}" stroke="${c.skinD}" stroke-width="6"/>`;
  h+=`<path d="M-70 -60 Q-20 -95 40 -70" stroke="#ffffff" stroke-opacity=".18" stroke-width="18" fill="none" stroke-linecap="round"/>`;
  if(!c.hat){
    h+=`<path d="M-113 -18 Q-120 -128 0 -124 Q120 -128 113 -18 Q92 -66 0 -70 Q-92 -66 -113 -18Z" fill="${c.hair}"/>`;
    for(let k=0;k<13;k++){const a=(196+k*12)*Math.PI/180;h+=`<circle cx="${f(Math.cos(a)*104)}" cy="${f(Math.sin(a)*104)}" r="${f(23+rnd(k)*6)}" fill="${c.hair}"/>`;}
  }else{
    h+=`<path d="M-120 -28 Q-122 -158 0 -156 Q122 -158 120 -28Z" fill="#22355e"/><rect x="-124" y="-52" width="248" height="30" rx="8" fill="#16223e"/>`;
    h+=`<path d="M-70 -24 Q40 -12 160 -26 Q118 8 -40 2Z" fill="#101829"/><circle cy="-100" r="19" fill="#f2c230" stroke="#b88a10" stroke-width="4"/>`;
  }
  const W='#fffdf7',P='#2a1c17',L='#3a2722';
  if(e==='sleep'){
    h+=`<path d="M-64 0 Q-42 16 -20 0 M20 0 Q42 16 64 0" stroke="${L}" stroke-width="7" fill="none" stroke-linecap="round"/>`;
    h+=`<path d="M-14 58 Q0 66 14 58" stroke="${L}" stroke-width="6" fill="none" stroke-linecap="round"/>`;
  }else if(e==='shock'){
    h+=`<circle cx="-42" cy="-6" r="33" fill="${W}" stroke="${L}" stroke-width="5"/><circle cx="42" cy="-6" r="33" fill="${W}" stroke="${L}" stroke-width="5"/>`;
    h+=`<circle cx="-42" cy="-6" r="9" fill="${P}"/><circle cx="42" cy="-6" r="9" fill="${P}"/>`;
    h+=`<path d="M-72 -58 Q-45 -74 -18 -60 M18 -60 Q45 -74 72 -58" stroke="${L}" stroke-width="10" fill="none" stroke-linecap="round"/>`;
    h+=`<ellipse cy="64" rx="24" ry="33" fill="#5a1717"/><ellipse cy="80" rx="15" ry="11" fill="#ef7b8f"/>`;
  }else if(e==='laugh'){
    h+=`<path d="M-64 2 Q-42 -22 -20 2 M20 2 Q42 -22 64 2" stroke="${L}" stroke-width="8" fill="none" stroke-linecap="round"/>`;
    h+=`<path d="M-70 -50 Q-45 -64 -18 -54 M18 -54 Q45 -64 70 -50" stroke="${L}" stroke-width="10" fill="none" stroke-linecap="round"/>`;
    h+=`<path d="M-40 40 Q0 46 40 40 Q36 ${f(86+mo*14)} 0 ${f(90+mo*14)} Q-36 ${f(86+mo*14)} -40 40Z" fill="#5a1717"/><ellipse cy="${f(76+mo*10)}" rx="16" ry="9" fill="#ef7b8f"/>`;
  }else{
    h+=`<ellipse cx="-42" cy="-4" rx="26" ry="${f(28*(1-bl)+2)}" fill="${W}" stroke="${L}" stroke-width="4.5"/><ellipse cx="42" cy="-4" rx="26" ry="${f(28*(1-bl)+2)}" fill="${W}" stroke="${L}" stroke-width="4.5"/>`;
    const pr=e==='fear'?7:11;
    if(bl<.8)h+=`<circle cx="${f(-42+look*9)}" cy="${f(lookY*9)}" r="${pr}" fill="${P}"/><circle cx="${f(42+look*9)}" cy="${f(lookY*9)}" r="${pr}" fill="${P}"/>`;
    const open=mo>.05?`<ellipse cy="${f(62+mo*4)}" rx="${f(16+mo*10)}" ry="${f(4+mo*24)}" fill="#5a1717"/>`+(mo>.4?`<ellipse cy="${f(70+mo*14)}" rx="${f(8+mo*6)}" ry="${f(3+mo*5)}" fill="#ef7b8f"/>`:''):'';
    if(e==='smirk'){
      h+=`<path d="M-72 -10 L-12 -10 L-12 -40 L-72 -40Z M12 -14 L72 -14 L72 -40 L12 -40Z" fill="${c.skin}"/>`;
      h+=`<path d="M-70 -10 L-14 -10 M14 -14 L70 -14" stroke="${L}" stroke-width="6" stroke-linecap="round"/>`;
      h+=`<path d="M-70 -48 Q-45 -54 -18 -46 M18 -62 Q45 -76 70 -58" stroke="${L}" stroke-width="10" fill="none" stroke-linecap="round"/>`;
      h+=open||`<path d="M-26 58 Q6 70 36 46" stroke="${L}" stroke-width="7" fill="none" stroke-linecap="round"/>`;
    }else if(e==='fear'){
      h+=`<path d="M-70 -44 Q-45 -50 -18 -66 M18 -66 Q45 -50 70 -44" stroke="${L}" stroke-width="10" fill="none" stroke-linecap="round"/>`;
      h+=open||`<path d="M-30 64 Q-20 54 -10 64 Q0 74 10 64 Q20 54 30 64" stroke="${L}" stroke-width="6" fill="none" stroke-linecap="round"/>`;
    }else if(e==='angry'){
      h+=`<path d="M-72 -62 L-18 -40 M18 -40 L72 -62" stroke="${L}" stroke-width="12" fill="none" stroke-linecap="round"/>`;
      h+=open||`<path d="M-26 66 Q0 52 26 66" stroke="${L}" stroke-width="7" fill="none" stroke-linecap="round"/>`;
    }else{
      h+=`<path d="M-70 -50 Q-45 -60 -18 -50 M18 -50 Q45 -60 70 -50" stroke="${L}" stroke-width="10" fill="none" stroke-linecap="round"/>`;
      if(e==='happy')h+=`<path d="M-34 46 Q0 50 34 46 Q30 ${f(84+mo*14)} 0 ${f(86+mo*14)} Q-30 ${f(84+mo*14)} -34 46Z" fill="#5a1717"/>`;
      else h+=open||`<path d="M-24 56 Q0 70 24 56" stroke="${L}" stroke-width="7" fill="none" stroke-linecap="round"/>`;
    }
  }
  h+=`<path d="M-6 26 Q4 36 12 26" stroke="${c.skinD}" stroke-width="5" fill="none" stroke-linecap="round"/>`;
  if(c.hat)h+=`<path d="M-42 40 Q-20 28 0 38 Q20 28 42 40 Q20 52 0 45 Q-20 52 -42 40Z" fill="#4e3322"/>`;
  return h;
}

function arm(side,a,e,c,hold=''){
  const r=side<0?a:-a, re=side<0?e:-e;
  return `<g transform="translate(${side*106} 150) rotate(${f(r)})"><line y2="135" stroke="${c.skin}" stroke-width="44" stroke-linecap="round"/><g transform="translate(0 135) rotate(${f(re)})"><line y2="122" stroke="${c.skin}" stroke-width="42" stroke-linecap="round"/><circle cy="128" r="28" fill="${c.skin}"/>${hold}</g><path d="M-42 -24 Q0 -48 42 -24 L46 54 Q0 70 -46 54Z" fill="${c.shirt}" stroke="${c.shirtD}" stroke-width="5"/></g>`;
}

function guy(o){
  // Novos: walk (fase do ciclo, ex. t*1.8), run (bool), legL/legR (graus), sq (+achata / -estica), lean (graus), bob (px, negativo = sobe)
  const c=Object.assign({},ORANGE,o.kit||{});
  const {x,y,s=1,eL=-8,eR=-8,holdL='',holdR='',legs=true,rot=0,walk=null,run=false,sq=0,lean=0}=o;
  let {aL,aR,legL=0,legR=0,bob=0}=o;
  if(walk!==null){const w=Math.sin(walk*Math.PI*2),amp=run?48:28;legL=w*amp;legR=-w*amp;bob+=-Math.abs(Math.cos(walk*Math.PI*2))*(run?26:12);
    if(aL===undefined)aL=12-w*(run?55:24);if(aR===undefined)aR=12+w*(run?55:24);}
  if(aL===undefined)aL=10;if(aR===undefined)aR=10;
  const leg=(sd,a)=>`<g transform="translate(${sd*52} 400) rotate(${f(a)})"><rect x="-44" y="0" width="88" height="296" rx="30" fill="${c.pants}" stroke="${c.pantsD}" stroke-width="5"/><ellipse cx="${sd*6}" cy="300" rx="62" ry="24" fill="#3a302c"/></g>`;
  let h=`<g transform="translate(${f(x)} ${f(y)}) rotate(${f(rot)}) scale(${s})">`;
  if(legs)h+=`<ellipse cx="0" cy="712" rx="${f(170*(1+sq)*(1+bob/400))}" ry="26" fill="#000" opacity=".18"/>`;
  h+=`<g transform="translate(0 712) scale(${(1+sq).toFixed(3)} ${(1-sq).toFixed(3)}) translate(0 ${f(-712+bob)}) rotate(${f(lean)} 0 420)">`;
  if(legs)h+=leg(-1,legL)+leg(1,legR);
  h+=`<rect x="-28" y="90" width="56" height="44" fill="${c.skinD}"/>`;
  h+=`<path d="M-124 150 Q-134 118 -94 112 L94 112 Q134 118 124 150 L118 432 Q0 452 -118 432Z" fill="${c.shirt}" stroke="${c.shirtD}" stroke-width="6"/>`;
  h+=`<path d="M-46 114 Q0 152 46 114" fill="none" stroke="${c.shirtD}" stroke-width="9"/>`;
  if(c.hat)h+=`<rect x="40" y="200" width="44" height="34" rx="6" fill="#f2c230"/>`;
  else if(c.tag!=='')h+=`<text x="0" y="300" font-family="Anton" font-size="44" fill="#4a4a55" text-anchor="middle" opacity=".75">${c.tag||''}</text>`;
  h+=arm(-1,aL,eL,c,holdL)+arm(1,aR,eR,c,holdR);
  h+=head(Object.assign({},c,o));
  return h+'</g></g>';
}
const fakeHead=(x,y,s,rot=0,expr='sleep')=>`<g transform="translate(${f(x)} ${f(y)}) rotate(${f(rot)}) scale(${s})">${head({expr})}</g>`;

function spoon(r=170){return `<g transform="translate(0 128) rotate(${r})"><rect x="-6" y="-10" width="12" height="110" rx="6" fill="#c9ced6" stroke="#7d848f" stroke-width="3"/><ellipse cy="112" rx="20" ry="30" fill="#dfe3e9" stroke="#7d848f" stroke-width="3"/></g>`;}
function flashlight(){return `<g transform="translate(0 128) rotate(100)"><rect x="-14" y="-20" width="28" height="80" rx="6" fill="#30343c"/><rect x="-18" y="52" width="36" height="22" rx="4" fill="#4a505b"/></g>`;}
function oar(){return `<g transform="translate(0 128) rotate(-20)"><line y1="-140" y2="150" stroke="#7a4f2c" stroke-width="12" stroke-linecap="round"/><ellipse cy="175" rx="24" ry="48" fill="#8e5d33"/></g>`;}
function burst(x,y,r,p,col='#ffd23f'){
  if(p<=0)return '';const s=back(p);let d='';
  for(let k=0;k<24;k++){const a=k/24*Math.PI*2,rr=k%2?r*.62:r;d+=(k?'L':'M')+f(Math.cos(a)*rr)+' '+f(Math.sin(a)*rr);}
  return `<g transform="translate(${x} ${y}) scale(${s.toFixed(3)})"><path d="${d}Z" fill="${col}" stroke="#141414" stroke-width="8"/></g>`;
}

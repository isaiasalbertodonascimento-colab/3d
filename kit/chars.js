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

// Clareia (amt>0) ou escurece (amt<0) uma cor #rrggbb.
function tone(hex,amt){const n=parseInt(hex.slice(1),16),c=[n>>16,(n>>8)&255,n&255].map(v=>Math.round(amt>0?v+(255-v)*amt:v*(1+amt)));return '#'+c.map(v=>v.toString(16).padStart(2,'0')).join('');}
function head(o={}){
  const c=Object.assign({},ORANGE,o), e=c.expr||'neutral', look=c.lookCam?0:(c.look||0), lookY=c.lookCam?0:(c.lookY||0), bl=c.blink||0, mo=c.mouth||0;
  let h='';
  if(c.style==='soft')return headSoft(c);
  if(c.view==='back')return headBack(c);
  if(c.view==='side')return headSide(c);
  // Bochechas que inflam no impacto (jiggle 0..1; automático no pouso).
  const JG=Math.max(c.jiggle||0,(c.sqLag||0)*3);
  if(JG>0)for(const sd of[-1,1])h+=`<ellipse cx="${sd*84}" cy="44" rx="${f(26+JG*22)}" ry="${f(22+JG*8)}" fill="${c.skin}" stroke="${c.skinD}" stroke-width="5"/>`;
  // Orelhas: mexem com o vento e "saltam" no susto; dobra interna desenhada.
  const TT=c.t, ew=(TT===undefined?0:Math.sin(TT*7.3)*(c.wind??.45)*3)+(c.earFlap||0), es=e==='shock'?1.14:1;
  const QD=c.view==='3q'?(c.dir??1):0;
  for(const sd of[-1,1])if(sd!==QD)h+=`<g transform="translate(${QD?-QD*104:sd*112} 12) rotate(${f(sd*ew*3)}) scale(${es})"><circle r="28" fill="${c.skin}" stroke="${c.skinD}" stroke-width="5"/><path d="M${sd*-4} -12 Q${sd*12} 0 ${sd*-2} 12" stroke="${c.skinD}" stroke-width="5" fill="none" stroke-linecap="round"/></g>`;
  // Estilos de cabelo: hairStyle 'curly' (padrão) | 'straight' | 'afro' | 'ponytail' | 'bald'.
  const HS=c.hat?'none':(c.hairStyle||'curly'), hwd=TT===undefined?0:(c.wind??.45), hdir=c.windDir??1;
  if(HS==='afro')for(let k=0;k<22;k++){const a=k/22*Math.PI*2,ph=TT===undefined?0:TT*4+k;h+=`<circle cx="${f(Math.cos(a)*118+hwd*hdir*6+Math.sin(ph)*hwd*4)}" cy="${f(-38+Math.sin(a)*110)}" r="${f(44+rnd(k)*10)}" fill="${c.hair}"/>`;}
  if(HS==='ponytail'){const sw=TT===undefined?0:Math.sin(TT*3.2)*10+hwd*hdir*18;h+=`<g transform="translate(${-hdir*112} -62) rotate(${f(-hdir*-50+sw)})"><path d="M0 -10 Q${-hdir*-10} 40 ${-hdir*-30} 120 Q${-hdir*-50} 190 ${-hdir*-20} 200 Q${-hdir*-5} 140 ${-hdir*10} 80 Q${-hdir*16} 30 0 -10Z" fill="${c.hair}"/></g><circle cx="${-hdir*112}" cy="-62" r="15" fill="${c.hairTie||'#e2574c'}"/>`;}
  h+=`<circle r="115" fill="${c.skin}" stroke="${c.skinD}" stroke-width="6"/>`;
  // Textura bem sutil na pele (grão), para não parecer plástico. skinTex:false desliga.
  if(c.skinTex!==false)h+=`<pattern id="skg" width="14" height="14" patternUnits="userSpaceOnUse"><circle cx="3" cy="4" r="1.3" fill="${c.skinD}"/><circle cx="10" cy="11" r="1" fill="${c.skinD}"/><circle cx="11" cy="3" r=".8" fill="#fff"/></pattern><circle r="112" fill="url(#skg)" opacity=".14"/>`;
  // Meio-tom suave embaixo do queixo e na lateral (volume sem perder o estilo chapado). shade:false desliga.
  if(c.shade!==false)h+=`<path d="M-98 58 Q0 150 98 58 Q0 128 -98 58Z" fill="${c.skinD}" opacity=".3"/><path d="M84 -70 Q118 0 84 72 Q104 0 84 -70Z" fill="${c.skinD}" opacity=".22"/>`;
  // Raiva subindo (rage 0..1): o rosto enche de vermelho de baixo para cima.
  if(c.rage>0)h+=`<clipPath id="fcl"><circle r="112"/></clipPath><rect clip-path="url(#fcl)" x="-120" y="${f(115-c.rage*235)}" width="240" height="240" fill="#ff2a1f" opacity=".55"/>`;
  // Sardas e pinta.
  if(c.freckles)for(let k=0;k<7;k++)for(const sd of[-1,1])h+=`<circle cx="${f(sd*(50+rnd(k)*30))}" cy="${f(22+rnd(k+9)*22)}" r="${f(2.5+rnd(k+3)*2)}" fill="${c.skinD}" opacity=".7"/>`;
  if(c.mole)h+=`<circle cx="52" cy="58" r="5" fill="#4a2a1a"/>`;
  if(HS==='bald')h+=`<ellipse cx="-30" cy="-78" rx="34" ry="14" fill="#fff" opacity=".35" transform="rotate(-20 -30 -78)"/>`;
  h+=`<path d="M-70 -60 Q-20 -95 40 -70" stroke="#ffffff" stroke-opacity=".18" stroke-width="18" fill="none" stroke-linecap="round"/>`;
  if(HS==='straight'||HS==='ponytail'){const w=k=>TT===undefined?0:Math.sin(TT*6+k)*hwd*5;
    h+=`<path d="M-116 -8 Q-124 -134 0 -130 Q124 -134 116 -8 L100 ${f(-40+w(1))} L82 ${f(-56+w(2))} L62 ${f(-46+w(3))} L42 ${f(-62+w(4))} L20 ${f(-50+w(5))} L0 ${f(-64+w(6))} L-22 ${f(-52+w(7))} L-44 ${f(-62+w(8))} L-64 ${f(-48+w(9))} L-84 ${f(-58+w(10))} L-102 -38Z" fill="${c.hair}"/>`;
    h+=`<path d="M-60 -110 Q-20 -124 30 -116" stroke="#fff" stroke-opacity=".18" stroke-width="10" fill="none" stroke-linecap="round"/>`;}
  else if(HS==='afro')h+=`<path d="M-113 -18 Q-120 -128 0 -124 Q120 -128 113 -18 Q92 -66 0 -70 Q-92 -66 -113 -18Z" fill="${c.hair}"/>`;
  else if(HS==='curly'){
    h+=`<path d="M-113 -18 Q-120 -128 0 -124 Q120 -128 113 -18 Q92 -66 0 -70 Q-92 -66 -113 -18Z" fill="${c.hair}"/>`;
    // Vento no cabelo: com t definido, cachos balançam (mais nas pontas de cima) e fios soltos ondulam. wind 0..1.5, windDir ±1.
    const T=c.t, wd=T===undefined?0:(c.wind??.45), dir=c.windDir??1;
    for(let k=0;k<13;k++){const a=(196+k*12)*Math.PI/180, top=Math.max(0,-Math.sin(a)), ph=T===undefined?0:T*5.3+k*.8;
      const dx=wd*(Math.sin(ph)*7*top+dir*5*top), dy=wd*Math.cos(ph*1.13)*3.5*top+(c.sqLag||0)*70*top, rr=(23+rnd(k)*6)*(1+wd*.04*Math.sin(ph*1.7));
      const cx=Math.cos(a)*104+dx, cy=Math.sin(a)*104+dy;
      h+=`<circle cx="${f(cx)}" cy="${f(cy)}" r="${f(rr)}" fill="${k%3===1?tone(c.hair,.12):c.hair}"/>`;
      if(k>=2&&k<=6)h+=`<path d="M${f(cx-rr*.55)} ${f(cy-rr*.15)} Q${f(cx-rr*.2)} ${f(cy-rr*.7)} ${f(cx+rr*.35)} ${f(cy-rr*.55)}" stroke="#fff" stroke-opacity=".28" stroke-width="5" fill="none" stroke-linecap="round"/>`;}
    if(wd>0)for(let k=0;k<3;k++){const bx=-30+k*30, w1=Math.sin(T*6.1+k*2)*wd, w2=Math.sin(T*7.3+k*1.3+1)*wd;
      h+=`<path d="M${bx} -118 Q${f(bx+dir*20+w1*8)} ${f(-140-k*2+w2*4)} ${f(bx+dir*40+w2*12)} ${f(-130+w1*7)}" stroke="${c.hair}" stroke-width="9" fill="none" stroke-linecap="round"/>`;}
  }else if(c.hat){
    h+=`<path d="M-120 -28 Q-122 -158 0 -156 Q122 -158 120 -28Z" fill="#22355e"/><rect x="-124" y="-52" width="248" height="30" rx="8" fill="#16223e"/>`;
    h+=`<path d="M-70 -24 Q40 -12 160 -26 Q118 8 -40 2Z" fill="#101829"/><circle cy="-100" r="19" fill="#f2c230" stroke="#b88a10" stroke-width="4"/>`;
  }
  const W='#fffdf7',P='#2a1c17',L='#3a2722';
  if(QD)h+=`<g transform="translate(${QD*24} 0) scale(.86 1)">`;
  if(e==='sleep'){
    h+=`<path d="M-64 0 Q-42 16 -20 0 M20 0 Q42 16 64 0" stroke="${L}" stroke-width="7" fill="none" stroke-linecap="round"/>`;
    h+=`<path d="M-14 58 Q0 66 14 58" stroke="${L}" stroke-width="6" fill="none" stroke-linecap="round"/>`;
    if(c.drool!==false){const dl=TT===undefined?14:10+Math.abs(Math.sin(TT*1.1))*22;h+=`<path d="M12 62 Q18 ${f(66+dl*.5)} 15 ${f(66+dl)}" stroke="#bfe6ff" stroke-width="6" fill="none" stroke-linecap="round"/><circle cx="15" cy="${f(70+dl)}" r="6" fill="#bfe6ff"/>`;}
  }else if(e==='shock'){
    h+=`<circle cx="-42" cy="-6" r="33" fill="${W}" stroke="${L}" stroke-width="5"/><circle cx="42" cy="-6" r="33" fill="${W}" stroke="${L}" stroke-width="5"/>`;
    h+=`<circle cx="-42" cy="-6" r="9" fill="${P}"/><circle cx="42" cy="-6" r="9" fill="${P}"/><circle cx="-45" cy="-9" r="3.5" fill="#fff"/><circle cx="39" cy="-9" r="3.5" fill="#fff"/>`;
    h+=`<path d="M-72 -58 Q-45 -74 -18 -60 M18 -60 Q45 -74 72 -58" stroke="${L}" stroke-width="10" fill="none" stroke-linecap="round"/>`;
    h+=`<ellipse cy="64" rx="24" ry="33" fill="#5a1717"/><ellipse cy="80" rx="15" ry="11" fill="#ef7b8f"/>`;
  }else if(e==='laugh'){
    h+=`<path d="M-64 2 Q-42 -22 -20 2 M20 2 Q42 -22 64 2" stroke="${L}" stroke-width="8" fill="none" stroke-linecap="round"/>`;
    h+=`<path d="M-70 -50 Q-45 -64 -18 -54 M18 -54 Q45 -64 70 -50" stroke="${L}" stroke-width="10" fill="none" stroke-linecap="round"/>`;
    h+=`<path d="M-40 40 Q0 46 40 40 Q36 ${f(86+mo*14)} 0 ${f(90+mo*14)} Q-36 ${f(86+mo*14)} -40 40Z" fill="#5a1717"/><ellipse cy="${f(76+mo*10)}" rx="16" ry="9" fill="#ef7b8f"/><path d="M-38 41 Q0 47 38 41 L35 52 Q0 57 -35 52Z" fill="#fffdf7"/>`;
  }else{
    const erx=f(26*(1+bl*.25));
    h+=`<ellipse cx="-42" cy="-4" rx="${erx}" ry="${f(28*(1-bl)+2)}" fill="${W}" stroke="${L}" stroke-width="4.5"/><ellipse cx="42" cy="-4" rx="${erx}" ry="${f(28*(1-bl)+2)}" fill="${W}" stroke="${L}" stroke-width="4.5"/>`;
    const pr=(e==='fear'?7:(c.lookCam?13.5:11))*(c.pupil||1);
    if(bl<.8)h+=`<circle cx="${f(-42+look*9)}" cy="${f(lookY*9)}" r="${pr}" fill="${P}"/><circle cx="${f(42+look*9)}" cy="${f(lookY*9)}" r="${pr}" fill="${P}"/>`;
    // Reflexo nos olhos: eyeRefl 'window' (janelinha) | 'sun' (sol amarelado) | padrão (pontinho branco).
    if(bl<.8)for(const ex of[-46,38]){const X=ex+look*9,Y=lookY*9-4;
      if(c.eyeRefl==='window')h+=`<rect x="${f(X-4)}" y="${f(Y-4)}" width="8" height="8" fill="#fff"/><path d="M${f(X)} ${f(Y-4)} v8 M${f(X-4)} ${f(Y)} h8" stroke="${P}" stroke-width="1.2"/><circle cx="${f(X+7)}" cy="${f(Y+8)}" r="1.6" fill="#fff"/>`;
      else if(c.eyeRefl==='sun')h+=`<circle cx="${f(X)}" cy="${f(Y)}" r="${f(pr*.42)}" fill="#fff6c8"/><circle cx="${f(X+7)}" cy="${f(Y+8)}" r="1.6" fill="#fff"/>`;
      else h+=`<circle cx="${f(X)}" cy="${f(Y)}" r="${f(pr*.38)}" fill="#fff"/>`;}
    const V=c.vowel;let open='';
    if(mo>.05){if(V==='M')open=`<path d="M-20 62 Q0 ${f(58+mo*4)} 20 62" stroke="${L}" stroke-width="8" fill="none" stroke-linecap="round"/>`;
      else if(V==='E')open=`<ellipse cy="62" rx="${f(26+mo*10)}" ry="${f(4+mo*12)}" fill="#5a1717"/><rect x="${f(-20-mo*6)}" y="${f(58-mo*12)}" width="${f(40+mo*12)}" height="${f(4+mo*5)}" rx="3" fill="#fffdf7"/>`;
      else if(V==='F')open=`<path d="M-20 58 Q0 54 20 58 L18 70 Q0 74 -18 70Z" fill="#5a1717"/><rect x="-16" y="54" width="32" height="9" rx="3" fill="#fffdf7"/><path d="M-20 70 Q0 66 20 70" stroke="#c85a6a" stroke-width="5" fill="none"/>`;
      else if(V==='L')open=`<ellipse cy="${f(62+mo*4)}" rx="${f(14+mo*8)}" ry="${f(6+mo*18)}" fill="#5a1717"/><ellipse cy="${f(52+mo*2)}" rx="${f(7+mo*3)}" ry="5" fill="#ef7b8f"/>`;
      else if(V==='U')open=`<ellipse cy="64" rx="${f(8+mo*3)}" ry="${f(9+mo*5)}" fill="#5a1717" stroke="#c85a6a" stroke-width="6"/>`;
      else if(V==='O')open=`<ellipse cy="64" rx="${f(11+mo*7)}" ry="${f(10+mo*16)}" fill="#5a1717"/><ellipse cy="${f(68+mo*10)}" rx="${f(6+mo*3)}" ry="${f(3+mo*4)}" fill="#ef7b8f"/>`;
      else open=`<ellipse cy="${f(62+mo*4)}" rx="${f(16+mo*10)}" ry="${f(4+mo*24)}" fill="#5a1717"/>`+(mo>.4?`<ellipse cy="${f(70+mo*14)}" rx="${f(8+mo*6)}" ry="${f(3+mo*5)}" fill="#ef7b8f"/>`:'');}
    if(e==='smirk'){
      h+=`<path d="M-72 -10 L-12 -10 L-12 -40 L-72 -40Z M12 -14 L72 -14 L72 -40 L12 -40Z" fill="${c.skin}"/>`;
      h+=`<path d="M-70 -10 L-14 -10 M14 -14 L70 -14" stroke="${L}" stroke-width="6" stroke-linecap="round"/>`;
      h+=`<path d="M-70 -48 Q-45 -54 -18 -46 M18 -62 Q45 -76 70 -58" stroke="${L}" stroke-width="10" fill="none" stroke-linecap="round"/>`;
      h+=open||`<path d="M-26 58 Q6 70 36 46" stroke="${L}" stroke-width="7" fill="none" stroke-linecap="round"/>`;
    }else if(e==='fear'){
      h+=`<path d="M-70 -44 Q-45 -50 -18 -66 M18 -66 Q45 -50 70 -44" stroke="${L}" stroke-width="10" fill="none" stroke-linecap="round"/>`;
      h+=open||`<path d="M-30 64 Q-20 54 -10 64 Q0 74 10 64 Q20 54 30 64" stroke="${L}" stroke-width="6" fill="none" stroke-linecap="round"/>`;
    }else if(['halfsmile','suspicious','bored','disgust','smug'].includes(e)){
      const lid=(k,up=true)=>up?`<path d="M-72 -36 H-12 V${f(-36+60*k)} H-72Z M12 -36 H72 V${f(-36+60*k)} H12Z" fill="${c.skin}"/><path d="M-70 ${f(-36+60*k)} H-14 M14 ${f(-36+60*k)} H70" stroke="${L}" stroke-width="6" stroke-linecap="round"/>`:`<path d="M-72 30 H-12 V${f(30-60*k)} H-72Z M12 30 H72 V${f(30-60*k)} H12Z" fill="${c.skin}"/><path d="M-70 ${f(30-60*k)} Q-42 ${f(24-60*k)} -14 ${f(30-60*k)} M14 ${f(30-60*k)} Q42 ${f(24-60*k)} 70 ${f(30-60*k)}" stroke="${L}" stroke-width="5" fill="none"/>`;
      if(e==='halfsmile'){h+=`<path d="M-70 -50 Q-45 -60 -18 -50 M18 -54 Q45 -66 70 -54" stroke="${L}" stroke-width="10" fill="none" stroke-linecap="round"/>`;h+=open||`<path d="M-20 60 Q10 70 36 46" stroke="${L}" stroke-width="7" fill="none" stroke-linecap="round"/><path d="M36 46 q8 2 8 10" stroke="${c.skinD}" stroke-width="4" fill="none"/>`;}
      if(e==='suspicious'){h+=lid(.48)+`<path d="M-70 -42 L-18 -36 M18 -60 Q45 -74 70 -58" stroke="${L}" stroke-width="10" fill="none" stroke-linecap="round"/>`;h+=open||`<path d="M-22 62 L22 56" stroke="${L}" stroke-width="7" stroke-linecap="round"/>`;}
      if(e==='bored'){h+=lid(.6)+`<path d="M-70 -34 L-18 -34 M18 -34 L70 -36" stroke="${L}" stroke-width="10" fill="none" stroke-linecap="round"/>`;h+=open||`<path d="M-22 64 Q0 60 22 64" stroke="${L}" stroke-width="7" fill="none" stroke-linecap="round"/>`;}
      if(e==='disgust'){h+=lid(.38,false)+`<path d="M-70 -42 L-18 -52 M18 -52 L70 -42" stroke="${L}" stroke-width="10" fill="none" stroke-linecap="round"/><path d="M-16 18 l8 -6 M8 12 l8 6" stroke="${c.skinD}" stroke-width="4" stroke-linecap="round"/>`;h+=`<path d="M-28 66 Q-14 54 -2 66 Q12 78 28 58" stroke="${L}" stroke-width="7" fill="none" stroke-linecap="round"/><path d="M12 70 q8 14 16 2" fill="#ef7b8f" stroke="#c85a6a" stroke-width="3"/>`;}
      if(e==='smug'){h+=`<path d="M-72 -36 H-12 V24 H-72Z M12 -36 H72 V24 H12Z" fill="${c.skin}"/><path d="M-64 0 Q-42 -12 -20 0 M20 0 Q42 -12 64 0" stroke="${L}" stroke-width="7" fill="none" stroke-linecap="round"/><path d="M-70 -56 Q-45 -70 -18 -58 M18 -58 Q45 -70 70 -56" stroke="${L}" stroke-width="10" fill="none" stroke-linecap="round"/>`;h+=open||`<path d="M-30 54 Q12 78 44 42" stroke="${L}" stroke-width="7" fill="none" stroke-linecap="round"/>`;}
    }else if(e==='tongue'){
      h+=`<path d="M-70 -50 Q-45 -62 -18 -52 M18 -56 Q45 -70 70 -54" stroke="${L}" stroke-width="10" fill="none" stroke-linecap="round"/>`;
      const tw=TT===undefined?0:Math.sin(TT*8)*4;h+=`<path d="M-32 50 Q0 74 32 50" stroke="${L}" stroke-width="7" fill="none" stroke-linecap="round"/><path d="M-15 62 Q${f(-17+tw)} 100 ${f(tw)} 102 Q${f(17+tw)} 100 15 62Z" fill="#ef7b8f" stroke="#c85a6a" stroke-width="4"/><path d="M0 68 L${f(tw*.6)} 90" stroke="#c85a6a" stroke-width="3"/>`;
    }else if(e==='angry'){
      h+=`<path d="M-72 -62 L-18 -40 M18 -40 L72 -62" stroke="${L}" stroke-width="12" fill="none" stroke-linecap="round"/>`;
      h+=open||`<path d="M-26 66 Q0 52 26 66" stroke="${L}" stroke-width="7" fill="none" stroke-linecap="round"/>`;
    }else{
      h+=`<path d="M-70 -50 Q-45 -60 -18 -50 M18 -50 Q45 -60 70 -50" stroke="${L}" stroke-width="10" fill="none" stroke-linecap="round"/>`;
      if(e==='happy')h+=`<path d="M-34 46 Q0 50 34 46 Q30 ${f(84+mo*14)} 0 ${f(86+mo*14)} Q-30 ${f(84+mo*14)} -34 46Z" fill="#5a1717"/><path d="M-32 47 Q0 51 32 47 L29 56 Q0 60 -29 56Z" fill="#fffdf7"/>`;
      else h+=open||`<path d="M-24 56 Q0 70 24 56" stroke="${L}" stroke-width="7" fill="none" stroke-linecap="round"/>`;
    }
  }
  // Cílios nos cantos de fora dos olhos.
  if(!['sleep','laugh'].includes(e)&&bl<.8)h+=`<path d="M-66 -26 l-12 -9 M-60 -31 l-8 -12 M66 -26 l12 -9 M60 -31 l8 -12" stroke="#3a2722" stroke-width="5" stroke-linecap="round"/>`;
  // Bochechas coradas: automático ao rir; blush:0..1 força (vergonha).
  const bs=c.blush??((e==='laugh'||e==='happy')?.55:0);
  if(bs>0)h+=`<ellipse cx="-64" cy="40" rx="22" ry="12" fill="#ff6f86" opacity="${f(bs*.6)}"/><ellipse cx="64" cy="40" rx="22" ry="12" fill="#ff6f86" opacity="${f(bs*.6)}"/>`;
  h+=QD?`<path d="M${QD*8} 4 Q${QD*36} 30 ${QD*8} 40" fill="${c.skin}" stroke="${c.skinD}" stroke-width="5"/>`:`<path d="M-6 26 Q4 36 12 26" stroke="${c.skinD}" stroke-width="5" fill="none" stroke-linecap="round"/>`;
  if(QD)h+='</g>';
  if(c.hat)h+=`<path d="M-42 40 Q-20 28 0 38 Q20 28 42 40 Q20 52 0 45 Q-20 52 -42 40Z" fill="#4e3322"/>`;
  // Ruga de preocupação (medo) e veia de raiva (pulsando).
  if(e==='fear')h+=`<path d="M-34 -92 q17 -7 34 0 q17 7 34 0 M-24 -104 q12 -5 24 0 q12 5 24 0" stroke="${c.skinD}" stroke-width="4" fill="none" stroke-linecap="round"/>`;
  if(e==='angry'){const vp=TT===undefined?1:1+Math.abs(Math.sin(TT*7))*.25;h+=`<g transform="translate(74 -78) scale(${f(vp)})"><path d="M-14 -4 Q-6 -6 -4 -14 M4 -14 Q6 -6 14 -4 M14 4 Q6 6 4 14 M-4 14 Q-6 6 -14 4" stroke="#e2283b" stroke-width="6" fill="none" stroke-linecap="round"/></g>`;}
  // Olhos de emoji: eyeFx 'heart' | 'star' | 'spiral' (pulsam / giram).
  if(c.eyeFx&&e!=='sleep'){const pu=TT===undefined?1:1+Math.sin(TT*10)*.12,ro=TT===undefined?0:TT*360;
    for(const sd of[-1,1]){let ic='';
      if(c.eyeFx==='heart')ic=`<path d="M0 22 C-40 -6 -26 -36 0 -18 C26 -36 40 -6 0 22Z" fill="#ff3b5c" stroke="#a3122b" stroke-width="4"/>`;
      else if(c.eyeFx==='star')ic=`<path d="M0 -30 L9 -9 L31 -9 L13 5 L20 28 L0 14 L-20 28 L-13 5 L-31 -9 L-9 -9Z" fill="#ffd23f" stroke="#b88a10" stroke-width="4"/>`;
      else ic=`<circle r="30" fill="#fffdf7" stroke="${L}" stroke-width="4"/><path d="M0 0 m0 -4 a4 4 0 1 1 0 8 a8 8 0 1 1 0 -16 a12 12 0 1 1 0 24 a16 16 0 1 1 0 -32 a20 20 0 1 1 0 40" stroke="${L}" stroke-width="4" fill="none" transform="rotate(${f(ro*sd)})"/>`;
      h+=`<circle cx="${sd*42}" cy="-4" r="35" fill="${c.skin}"/><g transform="translate(${sd*42} -4) scale(${f(pu)})">${ic}</g>`;}}
  // Acessórios: glasses, cap (capColor), phones (fone de ouvido).
  if(c.glasses)h+=`<circle cx="-42" cy="-4" r="34" fill="#bfe6ff" fill-opacity=".18" stroke="#222" stroke-width="7"/><circle cx="42" cy="-4" r="34" fill="#bfe6ff" fill-opacity=".18" stroke="#222" stroke-width="7"/><path d="M-8 -8 Q0 -14 8 -8 M-76 -10 L-108 -16 M76 -10 L108 -16" stroke="#222" stroke-width="6" fill="none"/><path d="M-60 -24 l10 -8" stroke="#fff" stroke-width="5" opacity=".6"/>`;
  if(c.cap){const cc=c.capColor||'#e2574c',bd=c.capDir??1;h+=`<path d="M-118 -40 Q-120 -150 0 -146 Q120 -150 118 -40Z" fill="${cc}" stroke="#141414" stroke-opacity=".25" stroke-width="5"/><path d="M${bd*10} -48 Q${bd*110} -64 ${bd*175} -38 Q${bd*120} -20 ${bd*10} -30Z" fill="${cc}" stroke="#141414" stroke-opacity=".35" stroke-width="5"/><circle cy="-144" r="10" fill="${cc}"/><path d="M-60 -60 Q0 -150 60 -60" stroke="#fff" stroke-opacity=".25" stroke-width="6" fill="none"/>`;}
  if(c.beanie){const bc=c.beanie,pp=TT===undefined?0:Math.sin(TT*5)*6;h+=`<path d="M-120 -40 Q-124 -160 0 -158 Q124 -160 120 -40Z" fill="${bc}"/><rect x="-126" y="-62" width="252" height="34" rx="14" fill="${tone(bc,-.2)}"/>${[...Array(9)].map((_,k)=>`<path d="M${-100+k*25} -66 v-70" stroke="${tone(bc,-.15)}" stroke-width="4"/>`).join('')}<circle cx="${f(pp)}" cy="-166" r="26" fill="#f4efe6"/>`;}
  if(c.sunglasses)h+=`<path d="M-80 -24 Q-42 -36 -8 -24 L-12 10 Q-44 26 -74 10Z M80 -24 Q42 -36 8 -24 L12 10 Q44 26 74 10Z" fill="#141820" stroke="#000" stroke-width="5"/><path d="M-8 -20 Q0 -26 8 -20 M-80 -22 L-110 -26 M80 -22 L110 -26" stroke="#000" stroke-width="6" fill="none"/><path d="M-66 -16 l18 -4 M30 -16 l18 -4" stroke="#fff" stroke-width="5" opacity=".6" stroke-linecap="round"/>`;
  if(c.phones)h+=`<path d="M-120 0 Q-130 -170 0 -165 Q130 -170 120 0" stroke="#2b2b35" stroke-width="16" fill="none"/><rect x="-142" y="-22" width="38" height="62" rx="16" fill="${c.phoneColor||'#3f6fb5'}" stroke="#2b2b35" stroke-width="6"/><rect x="104" y="-22" width="38" height="62" rx="16" fill="${c.phoneColor||'#3f6fb5'}" stroke="#2b2b35" stroke-width="6"/>`;
  // Barba e bigode: beard:'#cor', mustache:true|'#cor'.
  if(c.beard)h+=`<path d="M-96 20 Q-100 120 0 140 Q100 120 96 20 Q80 70 40 66 Q0 90 -40 66 Q-80 70 -96 20Z" fill="${c.beard}"/><path d="M-24 66 Q0 ${f(74+mo*20)} 24 66" stroke="#5a1717" stroke-width="7" fill="none" stroke-linecap="round"/>`;
  if(c.mustache)h+=`<path d="M-46 46 Q-24 30 0 42 Q24 30 46 46 Q24 58 0 50 Q-24 58 -46 46Z" fill="${c.mustache===true?(c.beard||c.hair):c.mustache}"/>`;
  // Olhos marejados (teary): brilho úmido na pálpebra de baixo.
  if(c.teary&&!['sleep','laugh'].includes(e))for(const sd of[-1,1])h+=`<path d="M${sd*42-22} 14 Q${sd*42} 28 ${sd*42+22} 14" stroke="#9fe0ff" stroke-width="6" fill="none" stroke-linecap="round" opacity=".9"/><circle cx="${sd*42+10}" cy="-14" r="6" fill="#fff"/><circle cx="${sd*42-12}" cy="10" r="3" fill="#fff"/>`;
  // Pelinhos/fios soltos no topo (fuzz), visíveis contra a luz.
  if(c.fuzz&&!c.hat)for(let k=0;k<6;k++){const bx=-60+k*24,w=TT===undefined?0:Math.sin(TT*5+k)*(c.wind??.45)*6;h+=`<path d="M${bx} -124 q${f(4+w)} -14 ${f(-2+w*1.5)} -26" stroke="${c.hair}" stroke-width="2.5" fill="none" stroke-linecap="round" opacity=".8"/>`;}
  // Molhado (wet 0..1): gotinhas na pele e brilho no cabelo. Neve na cabeça (snowCap 0..1).
  if(c.wet>0){for(let k=0;k<6;k++)h+=`<path transform="translate(${f(-80+rnd(k+70)*160)} ${f(-30+rnd(k+80)*90)})" d="M0 -7 Q5 1 0 5 Q-5 1 0 -7Z" fill="#bfe9ff" opacity="${f(.9*c.wet)}"/>`;
    if(!c.hat)h+=`<path d="M-70 -96 Q-20 -118 40 -104 M-40 -78 Q0 -90 50 -82" stroke="#fff" stroke-opacity="${f(.35*c.wet)}" stroke-width="6" fill="none" stroke-linecap="round"/>`;}
  if(c.snowCap>0){const k=c.snowCap;h+=`<path d="M${f(-96*k)} ${f(-104-6*k)} Q${f(-60*k)} ${f(-140-30*k)} 0 ${f(-136-34*k)} Q${f(60*k)} ${f(-140-30*k)} ${f(96*k)} ${f(-104-6*k)} Q${f(50*k)} -118 0 -116 Q${f(-50*k)} -118 ${f(-96*k)} ${f(-104-6*k)}Z" fill="#f8fbff" stroke="#d6e6f5" stroke-width="4"/>`;}
  // Marcas: scratch (arranhão), bandage (curativo), dirt 0..1 (sujeira).
  if(c.scratch)h+=`<path d="M58 6 l26 18 M54 16 l24 18 M62 -2 l18 12" stroke="#d6453a" stroke-width="4" stroke-linecap="round"/>`;
  if(c.bandage)h+=`<g transform="translate(-60 -78) rotate(-24)"><rect x="-40" y="-13" width="80" height="26" rx="12" fill="#f3d2a8" stroke="#c9a57a" stroke-width="3"/><rect x="-14" y="-10" width="28" height="20" rx="4" fill="#e8bf90"/><circle cx="-26" cy="-4" r="2" fill="#c9a57a"/><circle cx="26" cy="4" r="2" fill="#c9a57a"/></g>`;
  if(c.dirt>0)for(let k=0;k<5;k++)h+=`<ellipse cx="${f(-70+rnd(k)*140)}" cy="${f(-20+rnd(k+4)*80)}" rx="${f(8+rnd(k+2)*12)}" ry="${f(5+rnd(k+3)*7)}" fill="#6b4a2f" opacity="${f(.35*c.dirt)}"/>`;
  // Lágrimas: tears 'drip' (escorrendo) | 'stream' (cascata cômica).
  if(c.tears&&TT!==undefined){if(c.tears==='stream')for(const sd of[-1,1])for(let k=0;k<9;k++){const p=(TT*2.2+k/9)%1;h+=`<circle cx="${f(sd*(52+p*190))}" cy="${f(6-p*70+p*p*300)}" r="${f(15-p*5)}" fill="#5cc4ff" stroke="#1d7fc0" stroke-width="3"/>`;}
    else for(const sd of[-1,1]){const p=(TT*.7+(sd>0?.5:0))%1;h+=`<path d="M${sd*44} 22 Q${sd*46} ${f(22+p*40)} ${sd*48} ${f(26+p*70)}" stroke="#7fd0ff" stroke-width="7" fill="none" stroke-linecap="round" opacity=".8"/><path transform="translate(${sd*48} ${f(30+p*76)})" d="M0 -12 Q9 2 0 9 Q-9 2 0 -12Z" fill="#7fd0ff"/>`;}}
  // Fumaça saindo das orelhas quando a raiva passa de 60%.
  if(c.rage>.6&&TT!==undefined)for(const sd of[-1,1])for(let k=0;k<3;k++){const p=(TT*1.4+k/3)%1;h+=`<circle cx="${f(sd*(130+p*70))}" cy="${f(4-p*90)}" r="${f(12+p*26)}" fill="#f4f4f4" opacity="${f((1-p)*.8)}"/>`;}
  // Derretendo: gotas de suor escorrendo pelo rosto.
  if(c.melt>0&&TT!==undefined)for(let k=0;k<3;k++){const p=(TT*1.1+k/3)%1;h+=`<path transform="translate(${-80+k*80} ${f(-60+p*150)})" d="M0 -12 Q9 2 0 9 Q-9 2 0 -12Z" fill="#8fd3ff" opacity="${f(1-p)}"/>`;}
  // Bichinho pousado na cabeça: perch 'bird' | 'butterfly'.
  if(c.perch==='bird')h+=`<g transform="translate(20 -150)">${birdy({t:TT||0,sit:true})}</g>`;
  if(c.perch==='butterfly')h+=`<g transform="translate(-30 -138)">${butterfly(TT||0,1)}</g>`;
  // Respiração visível no frio (cold:true).
  if(c.cold&&TT!==undefined)for(let k=0;k<3;k++){const p=(TT*.45+k*.12)%1;if(p<.75)h+=`<circle cx="${f(18+p*110)}" cy="${f(72-p*50)}" r="${f(10+p*30)}" fill="#fff" opacity="${f((1-p/.75)*.55)}"/>`;}
  // Sobrancelhas expressivas: browUp (-1..1), sobem no susto, tremem de raiva.
  const by=-(c.browUp||0)*12+(e==='shock'?-6:0)+(e==='angry'&&TT!==undefined?Math.sin(TT*45)*2.5:0);
  if(by)h=h.replace(/<path d="M-7(\d) -(4[4-9]|[5-6]\d)/g,(m)=>m.replace('<path ',`<path transform="translate(0 ${f(by)})" `));
  return h;
}

// Mão com dedos. pose: 'relaxed' (padrão), 'open', 'wave', 'fist', 'point', 'thumb' (joinha, sempre para cima), 'peace', 'grip' (segurando objeto).
// tot = rotação total do antebraço (graus), usada para o joinha apontar para cima. t = tempo (dedos mexem de leve).
function hand(side,pose,t,tot,c,hold){ // unhas: automáticas; nailColor:'#e2283b' pinta, nails:false tira
  const ts=c.view==='back'?side:-side, wg=k=>t===undefined?0:Math.sin(t*3.1+k*1.7+side)*(pose==='wave'?9:4);
  const O=[],F=[];
  const fl=(x,y,a,len,w=14)=>{const r=a*Math.PI/180,x2=x-Math.sin(r)*len,y2=y+Math.cos(r)*len,L=`x1="${f(x)}" y1="${f(y)}" x2="${f(x2)}" y2="${f(y2)}" stroke-linecap="round"`;
    O.push(`<line ${L} stroke="${c.skinD}" stroke-width="${w+6}"/>`);F.push(`<line ${L} stroke="${c.skin}" stroke-width="${w}"/>`);
    if(len>=19&&c.nails!==false)F.push(`<ellipse cx="${f(x2+Math.sin(r)*3)}" cy="${f(y2-Math.cos(r)*3)}" rx="4.2" ry="5.6" transform="rotate(${f(a)} ${f(x2+Math.sin(r)*3)} ${f(y2-Math.cos(r)*3)})" fill="${c.nailColor||'#ffe3cf'}" opacity="${c.nailColor?1:.85}"/>`);};
  const bx=[ts*14,ts*4.5,-ts*5,-ts*14], ang=[-ts*10,-ts*3,ts*4,ts*12], len=[30,33,31,25];
  const fingers=(ext)=>{for(let k=0;k<4;k++){const e=ext[k];fl(bx[k],150,ang[k]*(e>.5?1:.3)+wg(k),Math.max(9,len[k]*e),e>.5?13:15);}};
  const thumbOut=()=>fl(ts*20,134,-ts*55+wg(5),24,13);
  const thumbIn=()=>fl(ts*21,136,ts*40,18,13);
  switch(pose){
    case 'open':case 'wave':fingers([1,1,1,1]);fl(ts*20,134,-ts*70+wg(5),28,13);break;
    case 'fist':fingers([0,0,0,0]);thumbIn();break;
    case 'point':fingers([1.2,0,0,0]);thumbIn();break;
    case 'peace':fingers([1.05,1,0,0]);thumbIn();break;
    case 'thumb':{fingers([0,0,0,0]);const th=(tot||0)*Math.PI/180,x0=ts*15,y0=136,x2=x0-Math.sin(th)*38,y2=y0-Math.cos(th)*38,L=`x1="${x0}" y1="${y0}" x2="${f(x2)}" y2="${f(y2)}" stroke-linecap="round"`;
      O.push(`<line ${L} stroke="${c.skinD}" stroke-width="20"/>`);F.push(`<line ${L} stroke="${c.skin}" stroke-width="14"/>`);
      if(c.nails!==false)F.push(`<ellipse cx="${f(x2+Math.sin(th)*3)}" cy="${f(y2+Math.cos(th)*3)}" rx="4.2" ry="5.6" transform="rotate(${f(-tot)} ${f(x2+Math.sin(th)*3)} ${f(y2+Math.cos(th)*3)})" fill="${c.nailColor||'#ffe3cf'}" opacity="${c.nailColor?1:.85}"/>`);break;}
    case 'grip':fingers([.45,.45,.45,.4]);thumbIn();break;
    default:fingers([.62,.66,.62,.58]);thumbOut();
  }
  const palm=`<ellipse cy="140" rx="25" ry="23" fill="${c.skin}" stroke="${c.skinD}" stroke-width="5"/>`;
  const knuck=(pose==='fist'||pose==='thumb'||pose==='point'||pose==='peace')?`<path d="M-15 158 Q-10 163 -5 158 M-3 160 Q2 165 7 160 M9 158 Q13 162 17 157" stroke="${c.skinD}" stroke-width="3" fill="none" stroke-linecap="round"/>`:'';
  const Z=x=>`<g transform="translate(0 128) scale(1.6) translate(0 -128)">${x}</g>`; // mão grande de desenho animado
  if(pose==='grip'){const q=c.squeeze||0;return Z(O.join('')+palm)+(q?`<g transform="translate(0 128) scale(${f(1-q*.18)} ${f(1+q*.06)}) translate(0 -128)">${hold}</g>`:hold)+Z(F.join(''));}
  return Z(O.join('')+palm+F.join('')+knuck)+hold;
}
function arm(side,a,e,c,hold='',hp={}){
  const r=side<0?a:-a, re=side<0?e:-e, pose=hp.pose||(hold?'grip':'relaxed');
  const wt=hp.watch&&side<0?`<rect x="-26" y="92" width="52" height="20" rx="6" fill="#2b2b35"/><circle cy="102" r="13" fill="#e9eef7" stroke="#2b2b35" stroke-width="4"/>`:'';
  const hd=wt+(hp.fingers===false?`<circle cy="128" r="28" fill="${c.skin}"/>${hold}`:hand(side,pose,hp.t,r+re,hp.squeeze?Object.assign({},c,{squeeze:hp.squeeze}):c,hold));
  const fz=c.fuzz?`<path d="M-8 40 l-6 -8 M6 70 l-6 -8 M-6 100 l-6 -8" stroke="${c.skinD}" stroke-width="2.5" stroke-linecap="round" opacity=".6"/>`:'';
  const LS=c.longSleeve;
  return `<g transform="translate(${hp.sx??side*106} 150) rotate(${f(r)})"><line y2="135" stroke="${c.skin}" stroke-width="44" stroke-linecap="round"/>${LS?`<line y2="140" stroke="${LS}" stroke-width="54" stroke-linecap="round"/>`+(c.sleeveStripe?`<line x1="${side*-14}" y1="4" x2="${side*-14}" y2="150" stroke="${c.sleeveStripe}" stroke-width="10" stroke-linecap="round"/>`:''):fz}<g transform="translate(0 135) rotate(${f(re)})"><line y2="118" stroke="${c.skin}" stroke-width="42" stroke-linecap="round"/>${LS?`<line y2="96" stroke="${LS}" stroke-width="52" stroke-linecap="round"/>`+(c.sleeveStripe?`<line x1="${side*-14}" y1="-14" x2="${side*-14}" y2="92" stroke="${c.sleeveStripe}" stroke-width="10" stroke-linecap="round"/>`:'')+`<rect x="-28" y="90" width="56" height="18" rx="8" fill="${tone(LS,-.2)}"/>`:''}${hd}</g><path d="M-42 -24 Q0 -48 42 -24 L46 54 Q0 70 -46 54Z" fill="${c.shirt}" stroke="${c.shirtD}" stroke-width="5"/></g>`;
}
const OUTFIT={winter:{coat:'#3f6fb5',scarf:'#e2283b',beanie:'#e2283b',cold:true},beach:{shirtStyle:'hawaiian',shorts:true,flipflops:true,sunglasses:true}};
function stancePreset(st,side){
  if(side)return{sit:{legF:-88,legB:-84,kneeF:90,kneeB:88,bob:150},crouch:{legF:-60,legB:-30,kneeF:120,kneeB:100,bob:160,lean:10},kneel:{legF:-80,legB:10,kneeF:85,kneeB:80,bob:160}}[st]||{};
  return{sit:{thighScale:.3,bob:115,legL:4,legR:-4,kneeL:-4,kneeR:4},crouch:{legL:42,kneeL:-84,legR:-42,kneeR:84,bob:95},lie:{rot:-90}}[st]||{};}
// Estilo macio (style:'soft'): sem contorno grosso, pele com degradê, olhos de pontinho, agasalho de escola com listra, tênis branco.
const SOFTKIT={skin:'#f2a35e',skinD:'#e3904f',shirt:'#2d3a78',shirtD:'#28336b',pants:'#34437e',pantsD:'#2e3c72',hair:'#2b2a33',nails:false,skinTex:false,shade:false,sleeveStripe:'#6dbb3c'};
function soften(o){if(o.style!=='soft'||o._soft)return o;const k=Object.assign({},SOFTKIT,o.kit||{});if(!k.longSleeve)k.longSleeve=k.shirt;k.shirtD=o.kit&&o.kit.shirtD||tone(k.shirt,-.1);return Object.assign({slim:.8,shoeColor:'#efece4',collar:'#f2f2f2'},o,{kit:k,_soft:true});}
function guy(o){
  o=soften(o);
  if(o.outfit)o=Object.assign({},OUTFIT[o.outfit],o);
  if(o.stance)o=Object.assign({},stancePreset(o.stance,o.view==='side'),o);
  if(o.view==='side')return guySide(o);
  if(o.gesture){let G=gesturePreset(o.gesture,o.t||0);if((o.toward??1)<0&&['highfive','handshake','push','hug'].includes(o.gesture)){const M={};for(const[k,v]of Object.entries(G)){const k2=k.endsWith('R')?k.slice(0,-1)+'L':k.endsWith('L')?k.slice(0,-1)+'R':k;M[k2]=Array.isArray(v)?[-v[0],v[1]]:(k==='lean'?-v:v);}if(M.front)M.front=G.front;G=M;}o=Object.assign({},G,o);}
  if(o.hunch)o=Object.assign({},o,{lean:(o.lean||0)+12,bob:(o.bob||0)+22});
  // Novos: style:'soft' (+ hairStyle 'bob'|'short'|'bun', sprout, slim, shoeColor, collar), view '3q' (+dir), sxMul, stance 'sit'|'crouch'|'lie'|'kneel', kneeL/kneeR/kneeF/kneeB, thighScale, outfit 'winter'|'beach', coat, scarf, beanie, sunglasses, floatie, flipflops, shirtStyle 'hawaiian', carry, toward, expr halfsmile|suspicious|bored|disgust|smug, vowel F|L|U; view 'front'|'side'|'back' (de lado: dir ±1, aF/aB, eF/eB, legF/legB, handF/handB, holdF/holdB), weight, castShadow{type,shift,amt}, wet, snowCap, teary, pupil, fuzz, jiggle, light{color,az,amt}, eyeRefl, dirt, scratch, bandage, sink/sinkType, squeeze (na mão: handR com hold), skinTex:false, lookCam, tears ('drip'|'stream'), rage 0..1, melt 0..1, frozen, perch ('bird'|'butterfly'), shade:false, gesture, reachL/reachR, front, kid, hunch, emote, rim/rimDir, beard/mustache, nails/nailColor, hairStyle, eyeFx, glasses/cap/phones/backpack/watch, shirtStyle ('stripes'|'hoodie'), shorts, freckles/mole, vowel, expr 'tongue', blush, browUp, cold (vapor), air (sombra no pulo), handL/handR (pose da mão com dedos), fingers:false (mão antiga), t (idle sempre vivo + vento no cabelo/camiseta), wind (0..1.5), windDir (±1), seed, walk (fase do ciclo, ex. t*1.8), run (bool), legL/legR (graus), sq (+achata / -estica), lean (graus), bob (px, negativo = sobe)
  const c=Object.assign({},ORANGE,o.kit||{},o.view?{view:o.view}:{},o.fuzz?{fuzz:true}:{},o.coat?{longSleeve:o.coat}:{});
  const Q=o.view==='3q'?(o.dir??1):0, SL=o.slim??1;
  const {x,y,s=1,holdL='',holdR='',legs=true,rot=0,walk=null,run=false,sq=0,lean=0}=o;
  let {aL,aR,eL=-8,eR=-8,legL=0,legR=0,bob=0}=o;
  // t (tempo em s): movimento constante "idle" — respiração, balanço, braços e olhos vivos, piscada automática.
  const T=o.t, sd=o.seed||0; let idL=0,idR=0,idLean=0;
  if(T!==undefined){bob+=Math.sin(T*2.6+sd)*7;idLean=Math.sin(T*1.3+sd)*2.5;idL=Math.sin(T*2.1+sd)*5;idR=Math.sin(T*2.1+sd+1.7)*5;
    if(o.blink===undefined)o=Object.assign({},o,{blink:blink(T,sd)});
    if(o.look===undefined)o=Object.assign({},o,{look:Math.sin(T*.9+sd)*.6});}
  if(walk!==null){const w=Math.sin(walk*Math.PI*2),amp=run?48:28;legL=w*amp;legR=-w*amp;bob+=-Math.abs(Math.cos(walk*Math.PI*2))*(run?26:12);
    if(aL===undefined)aL=12-w*(run?55:24);if(aR===undefined)aR=12+w*(run?55:24);}
  if(aL===undefined)aL=10;if(aR===undefined)aR=10;aL+=idL;aR+=idR;
  if(o.reachL){const r=reach(-1,o.reachL[0],o.reachL[1]);aL=r.a+idL*.3;eL=r.e;}
  if(o.reachR){const r=reach(1,o.reachR[0],o.reachR[1]);aR=r.a+idR*.3;eR=r.e;}
  const KID=o.kid?.74:1;
  // Troca de peso parado: apoia numa perna, quadril desloca (weight:-1..1 fixa; weight:false desliga).
  const WS=(T!==undefined&&walk===null&&o.weight!==false)?(o.weight??Math.tanh(Math.sin(T*.45+sd)*3)):0;
  legL+=-WS*3;legR+=WS*4;
  if(run&&walk!==null)o=Object.assign({},o,{earFlap:Math.sin(walk*4*Math.PI)*14});
  const TS=o.thighScale??1, FF=o.flipflops===true?'#e2574c':o.flipflops;
  const foot=(sd,tot)=>`<g transform="rotate(${f(-tot*.75)} ${sd*6} 150) translate(${sd*6} 150) scale(${f(1-Math.max(0,Math.abs(tot)-12)/120)} 1) translate(${-sd*6} -150)">`+(FF?`<ellipse cx="${sd*6}" cy="162" rx="64" ry="10" fill="${FF}"/><ellipse cx="${sd*6}" cy="148" rx="50" ry="17" fill="${c.skin}" stroke="${c.skinD}" stroke-width="4"/>${[0,1,2,3].map(k=>`<circle cx="${sd*6-20+k*13}" cy="160" r="6.5" fill="${c.skin}" stroke="${c.skinD}" stroke-width="2"/>`).join('')}<path d="M${sd*6} 140 l-20 16 M${sd*6} 140 l20 16" stroke="${FF}" stroke-width="7" stroke-linecap="round"/>`:`<ellipse cx="${sd*6}" cy="161" rx="64" ry="15" fill="${o.shoeColor?'#c9c4b8':'#e9e3d6'}"/><ellipse cx="${sd*6}" cy="150" rx="62" ry="24" fill="${o.shoeColor||'#3a302c'}"/><path d="M${sd*6-14} 134 l10 7 l10 -7 M${sd*6-14} 144 l10 7 l10 -7" stroke="#f4f0e6" stroke-width="4" fill="none" stroke-linecap="round"/>`)+`</g>`;
  // Perna com joelho: a = quadril, kn = joelho (graus). thighScale encurta a coxa (sentado de frente).
  const leg=(sd,a,kn=0)=>`<g transform="translate(${f(sd*52*(o.slim??1))} 400) rotate(${f(a)}) scale(${o.slim??1} 1)"><g transform="translate(0 ${f(150*TS)}) rotate(${f(kn)})">`+(o.shorts||FF?(o.shorts?`<rect x="-30" y="-24" width="60" height="170" rx="26" fill="${c.skin}"/>`+(FF?'':`<rect x="-26" y="112" width="52" height="26" rx="8" fill="#f7f5f0"/>`):`<rect x="-44" y="-16" width="88" height="150" rx="28" fill="${c.pants}" stroke="${c.pantsD}" stroke-width="5"/>`):`<rect x="-44" y="-16" width="88" height="162" rx="28" fill="${c.pants}" stroke="${c.pantsD}" stroke-width="5"/>`)+foot(sd,a+kn)+(o.dirt?`<ellipse cx="${sd*10}" cy="80" rx="22" ry="14" fill="#6b4a2f" opacity="${f(.4*o.dirt)}"/>`:'')+`</g>`+(o.shorts?`<rect x="-46" y="0" width="92" height="${f(160*TS)}" rx="30" fill="${c.pants}" stroke="${c.pantsD}" stroke-width="5"/>`:`<rect x="-44" y="0" width="88" height="${f(170*TS)}" rx="30" fill="${c.pants}" stroke="${c.pantsD}" stroke-width="5"/>`)+`</g>`;
  const ML=o.melt||0,SQ=sq+ML*.38,FZ=o.frozen&&T!==undefined?Math.sin(T*60)*3:0;
  let h=`<g transform="translate(${f(x+FZ)} ${f(y)}) rotate(${f(rot)}) scale(${f(s*(o.sxMul??1))} ${s})">`;
  if(ML>0)h+=`<ellipse cy="714" rx="${f(150+ML*190)}" ry="${f(16+ML*16)}" fill="${c.skin}" opacity=".9"/><ellipse cx="-40" cy="708" rx="${f(40+ML*60)}" ry="6" fill="#fff" opacity=".35"/>`;
  const air=Math.max(0,o.air||0);
  if(legs)h+=`<ellipse cx="0" cy="${f(712+air)}" rx="${f(170*KID*(1+sq)*(1+bob/400)/(1+air/500))}" ry="${f(26/(1+air/500))}" fill="#000" opacity="${f(.18/(1+air/400))}"/>`;
  // Sombra de contato: bem escura e pequena embaixo de cada pé (some no ar).
  if(legs&&air<60)for(const[sd2,la]of[[-1,legL],[1,legR]])h+=`<ellipse cx="${f((sd2*52-Math.sin(la*Math.PI/180)*300)*KID)}" cy="${f(718+air)}" rx="${f(54*KID)}" ry="9" fill="#000" opacity="${f(.38*(1-air/60))}"/>`;
  h+=`<g transform="translate(${f(WS*10)} 712) scale(${(1+SQ).toFixed(3)} ${(1-SQ).toFixed(3)}) translate(0 ${f(-712+bob)}) rotate(${f(lean+idLean+WS*2.5)} 0 420)">`;
  // Rastro de poeira ao andar/correr (moveDir = lado para onde anda; dust:false desliga).
  if(KID<1)h+=`<g transform="translate(0 712) scale(${KID}) translate(0 -712)">`;
  if(walk!==null&&o.dust!==false&&legs){const md=o.moveDir??1;for(let k=0;k<4;k++){const p=((walk*2)+k/4)%1;h+=`<circle cx="${f(-md*(40+p*(run?220:120)))}" cy="${f(705-p*(run?70:35))}" r="${f(10+p*(run?34:20))}" fill="#d9cfbb" opacity="${f((1-p)*(run?.6:.4))}"/>`;}}
  if(legs)h+=leg(-1,legL,o.kneeL??-legL*.25)+leg(1,legR,o.kneeR??-legR*.25);
  if(o.backpack)h+=`<rect x="-112" y="130" width="224" height="250" rx="40" fill="${o.backpack===true?'#3f6fb5':o.backpack}" stroke="#141414" stroke-opacity=".3" stroke-width="6"/><rect x="-60" y="112" width="120" height="40" rx="18" fill="${o.backpack===true?'#2f5590':o.backpack}"/>`;
  // Gingado: ombros e tronco acompanham os passos (sway). Respiração no peito.
  const WK=walk===null?0:Math.sin(walk*Math.PI*2), SW=`rotate(${f(WK*(run?4:3))} 0 420)`, BR=T===undefined?0:Math.sin(T*2.6+sd);
  h+=`<g transform="${SW}">`;
  const FR0=o.front||'';const cbk=Object.assign({},c,{skin:tone(c.skin,-.14),skinD:tone(c.skinD,-.14),shirt:tone(c.shirt,-.1),shirtD:tone(c.shirtD,-.1),longSleeve:c.longSleeve?tone(c.longSleeve,-.12):undefined});
  if(Q)h+=Q>0?arm(-1,aL,eL,cbk,holdL,{pose:o.handL,t:T,sx:-78}):arm(1,aR,eR,cbk,holdR,{pose:o.handR,t:T,sx:78});
  h+=`<g transform="translate(${f(-Q*8)} 0) scale(${f((Q?.9:1)*SL)} 1)">`;
  h+=`<rect x="-28" y="90" width="56" height="44" fill="${c.skinD}"/>`;
  h+=`<g transform="translate(0 112) scale(${f(1+BR*.012)} ${f(1+BR*.02)}) translate(0 -112)">`;
  // Barra da camiseta tremulando com o vento (com t definido).
  const hw=T===undefined?0:(o.wind??.45), hm1=Math.sin((T||0)*4.7+sd)*hw, hm2=Math.sin((T||0)*6.2+sd+1)*hw, dirH=o.windDir??1;
  h+=`<path d="M-124 150 Q-134 118 -94 112 L94 112 Q134 118 124 150 L${f(118+dirH*hw*8)} ${f(432+hm1*6+Math.max(0,SQ)*60)} Q${f(60+hm2*14)} ${f(452+hm2*10+Math.max(0,SQ)*70)} 0 ${f(444+hm1*5+Math.max(0,SQ)*70)} Q${f(-60+hm1*14)} ${f(452-hm2*8)} ${f(-118+dirH*hw*8)} ${f(432-hm1*6)}Z" fill="${c.shirt}" stroke="${c.shirtD}" stroke-width="6"/>`;
  if(o.shirtStyle==='stripes'){h+=`<clipPath id="tsc"><path d="M-124 150 Q-134 118 -94 112 L94 112 Q134 118 124 150 L118 432 Q0 452 -118 432Z"/></clipPath><g clip-path="url(#tsc)">`;for(let y=170;y<450;y+=38)h+=`<rect x="-140" y="${y}" width="280" height="15" fill="${c.stripe||'#3f6fb5'}" opacity=".85"/>`;h+='</g>';}
  if(o.shirtStyle==='hawaiian'){h+=`<clipPath id="tsh"><path d="M-124 150 Q-134 118 -94 112 L94 112 Q134 118 124 150 L118 432 Q0 452 -118 432Z"/></clipPath><g clip-path="url(#tsh)">`;for(let k=0;k<12;k++){const fx=-110+rnd(k+90)*220,fy=150+rnd(k+91)*280,fc=['#e2283b','#ffd23f','#ff8a3d','#e86fb5'][k%4];for(let p=0;p<5;p++){const a=p/5*Math.PI*2;h+=`<circle cx="${f(fx+Math.cos(a)*13)}" cy="${f(fy+Math.sin(a)*13)}" r="10" fill="${fc}"/>`;}h+=`<circle cx="${f(fx)}" cy="${f(fy)}" r="7" fill="#fff6c8"/><path d="M${f(fx+20)} ${f(fy+10)} q20 6 30 -10" stroke="#3f8f3f" stroke-width="8" fill="none"/>`;}h+='</g>';}
  if(o.shirtStyle==='hoodie')h+=`<path d="M-92 118 Q-120 60 -70 40 L70 40 Q120 60 92 118 Q0 150 -92 118Z" fill="${c.shirt}" stroke="${c.shirtD}" stroke-width="6"/><path d="M-22 130 L-26 205 M22 130 L26 205" stroke="${c.shirtD}" stroke-width="6" stroke-linecap="round"/><circle cx="-26" cy="210" r="6" fill="${c.shirtD}"/><circle cx="26" cy="210" r="6" fill="${c.shirtD}"/><path d="M-70 330 L70 330 L82 400 L-82 400Z" fill="none" stroke="${c.shirtD}" stroke-width="5"/>`;
  h+=c.view==='back'?`<path d="M-40 114 Q0 128 40 114" fill="none" stroke="${c.shirtD}" stroke-width="9"/><path d="M0 130 V420" stroke="${c.shirtD}" stroke-width="3" opacity=".35"/>`:`<path d="M-46 114 Q0 152 46 114" fill="none" stroke="${c.shirtD}" stroke-width="9"/>`;
  if(o.collar&&c.view!=='back')h+=`<path d="M-44 110 L0 156 L44 110 L28 104 L0 134 L-28 104Z" fill="${o.collar}"/><path d="M0 156 V440" stroke="${tone(c.shirt,.18)}" stroke-width="4"/>`;
  if(o.coat){const cc=o.coat,cd=tone(cc,-.25);h+=`<path d="M-132 150 Q-142 110 -96 104 L96 104 Q142 110 132 150 L130 472 Q0 488 -130 472Z" fill="${cc}" stroke="${cd}" stroke-width="6"/>`;
    if(c.view!=='back')h+=`<path d="M-24 110 L24 110 L20 470 L-20 470Z" fill="${c.shirt}"/><path d="M-22 112 V470 M22 112 V470" stroke="${cd}" stroke-width="5"/><rect x="-104" y="330" width="62" height="54" rx="8" fill="none" stroke="${cd}" stroke-width="5"/><rect x="42" y="330" width="62" height="54" rx="8" fill="none" stroke="${cd}" stroke-width="5"/>`;
    for(let k=0;k<9;k++)h+=`<circle cx="${-88+k*22}" cy="${f(108-Math.sin(k/8*Math.PI)*10)}" r="17" fill="#f4efe6"/>`;}
  if(o.scarf){const sc=o.scarf,sw=T===undefined?0:Math.sin(T*6)*(o.wind??.45)*30,dw=(o.windDir??1);h+=`<path d="M-74 108 Q0 146 74 108 L74 132 Q0 172 -74 132Z" fill="${sc}" stroke="${tone(sc,-.25)}" stroke-width="5"/><path d="M34 140 Q${f(50+dw*sw)} 220 ${f(40+dw*(o.wind??.45)*70+sw)} 300 L${f(80+dw*(o.wind??.45)*70+sw)} 300 Q${f(86+dw*sw)} 220 70 136Z" fill="${sc}" stroke="${tone(sc,-.25)}" stroke-width="5"/><path d="M${f(42+dw*(o.wind??.45)*70+sw)} 300 v14 M${f(56+dw*(o.wind??.45)*70+sw)} 300 v16 M${f(70+dw*(o.wind??.45)*70+sw)} 300 v14" stroke="${sc}" stroke-width="5"/>`;}
  if(o.floatie)h+=`<path d="M-176 400 A176 70 0 0 0 176 400 A176 70 0 0 0 -176 400Z M-110 396 A110 38 0 0 1 110 396 A110 38 0 0 1 -110 396Z" fill-rule="evenodd" fill="${o.floatie===true?'#e2283b':o.floatie}" stroke="#a3122b" stroke-width="5"/><path d="M-150 436 l30 -40 M-30 466 l20 -40 M100 452 l30 -44" stroke="#fff" stroke-width="22"/>`;
  if(o.backpack&&c.view!=='back')h+=`<path d="M-92 120 Q-80 220 -86 330 M92 120 Q80 220 86 330" stroke="#2b2b35" stroke-width="18" fill="none" stroke-linecap="round"/>`;
  const wr=.35+Math.min(1,(Math.abs(lean)+Math.abs(sq)*120+Math.abs(WK)*8)/25)*.65, fw=WK*10;
  h+=`<path d="M-104 178 q16 ${f(12+fw)} 34 6 M-98 206 q12 8 26 4 M104 178 q-16 ${f(12-fw)} -34 6 M98 206 q-12 8 -26 4 M-44 396 q22 ${f(6+wr*6+fw*.5)} 44 0 q22 ${f(-6-wr*6)} 44 0 M${f(-30+fw*2)} 300 q20 -10 40 4" stroke="${c.shirtD}" stroke-width="4" fill="none" stroke-linecap="round" opacity="${f(wr)}"/>`;
  // Vento forte: camiseta cola no corpo do lado do vento e faz dobras diagonais.
  if(hw>.9)h+=`<path d="M${f(-dirH*110)} 170 Q${f(-dirH*96)} 300 ${f(-dirH*110)} 420 M${f(-dirH*70)} 200 l${f(dirH*60)} 40 M${f(-dirH*80)} 300 l${f(dirH*70)} 30" stroke="${c.shirtD}" stroke-width="5" fill="none" stroke-linecap="round" opacity="${f(Math.min(1,(hw-.9)*1.5))}"/>`;
  if(o.dirt)for(let k=0;k<4;k++)h+=`<ellipse cx="${f(-80+rnd(k+30)*160)}" cy="${f(220+rnd(k+40)*190)}" rx="${f(14+rnd(k+50)*18)}" ry="${f(9+rnd(k+60)*10)}" fill="#6b4a2f" opacity="${f(.35*o.dirt)}"/>`;
  h+='</g>';
  // Sombra de contato no corpo: embaixo da gola e nas axilas.
  h+=`<ellipse cy="124" rx="58" ry="12" fill="#000" opacity=".1"/><path d="M-112 165 q14 40 8 90 M112 165 q-14 40 -8 90" stroke="#000" stroke-width="16" fill="none" opacity=".07" stroke-linecap="round"/>`;
  // Roupa molhada (wet 0..1): escurece e pinga da barra.
  if(o.wet>0){h+=`<path d="M-124 150 Q-134 118 -94 112 L94 112 Q134 118 124 150 L118 432 Q0 452 -118 432Z" fill="${tone(c.shirt,-.35)}" opacity="${f(.55*o.wet)}"/>`;if(T!==undefined)for(let k=0;k<5;k++){const p=(T*1.5+k/5)%1;h+=`<path transform="translate(${-90+k*45} ${f(446+p*240)})" d="M0 -9 Q6 1 0 6 Q-6 1 0 -9Z" fill="#9fdcff" opacity="${f(1-p)}"/>`;}}
  if(c.view==='back'){}
  else if(c.hat)h+=`<rect x="40" y="200" width="44" height="34" rx="6" fill="#f2c230"/>`;
  else if(c.tag!=='')h+=`<text x="0" y="300" font-family="Anton" font-size="44" fill="#4a4a55" text-anchor="middle" opacity=".75">${c.tag||''}</text>`;
  h+='</g>';
  const FR=o.front||'', AL=Q>0?'':arm(-1,aL,eL,c,holdL,{pose:o.handL,t:T,fingers:o.fingers,watch:o.watch,squeeze:o.squeeze,sx:SL<1?-106*SL:undefined}), AR=Q<0?'':arm(1,aR,eR,c,holdR,{pose:o.handR,t:T,fingers:o.fingers,squeeze:o.squeeze,sx:SL<1?106*SL:undefined});
  if(!FR.includes('L'))h+=AL;if(!FR.includes('R'))h+=AR;
  if(o.snowCap>0)for(const sd2 of[-1,1])h+=`<ellipse cx="${sd2*100}" cy="${f(116-o.snowCap*6)}" rx="${f(44*o.snowCap+8)}" ry="${f(14*o.snowCap+3)}" fill="#f8fbff" stroke="#d6e6f5" stroke-width="3"/>`;
  h+='</g>';
  if(KID<1)h+=`</g><g transform="translate(0 ${f(712*(1-KID))}) scale(.97)">`;
  // Ao falar (mouth > 0), a cabeça balança e inclina junto com a boca.
  const tk=T===undefined?0:Math.min(1,(o.mouth||0)*1.3);
  h+=`<g transform="${SW} rotate(${f(Math.sin((T||0)*9)*3.5*tk+(o.lookCam?-4:0))} 0 80) translate(0 ${f(-tk*Math.abs(Math.sin((T||0)*9))*7)})">`+head(Object.assign({},c,o,{sqLag:Math.max(0,SQ),wet:o.wet,snowCap:o.snowCap}))+'</g>';
  if(o.emote)h+=emote(o.emote,T||0);
  if(KID<1)h+='</g><g transform="translate(0 712) scale('+KID+') translate(0 -712)">';
  if(o.carry)h+=`<g transform="translate(0 330)"><rect x="-130" y="-92" width="260" height="176" rx="10" fill="#c9935a" stroke="#8a5a2a" stroke-width="7"/><path d="M-130 -30 H130 M-30 -92 V84" stroke="#e6c48e" stroke-width="18" opacity=".8"/><path d="M-90 40 l20 -20 M60 50 l24 -18" stroke="#8a5a2a" stroke-width="4"/></g>`;
  if(FR)h+=`<g transform="${SW}">`+(FR.includes('L')?AL:'')+(FR.includes('R')?AR:'')+'</g>';
  if(KID<1)h+='</g>';
  h+='</g>';
  // Pé afundando no chão macio: sink (unidades SVG), sinkColor, sinkType 'grass' | 'snow'.
  if(o.sink){const sc2=o.sinkColor||(o.sinkType==='snow'?'#f4f8ff':'#5d8f3a');h+=`<path d="M-200 ${712-o.sink} Q-100 ${712-o.sink-14} 0 ${712-o.sink} Q100 ${712-o.sink-14} 200 ${712-o.sink} L200 740 L-200 740Z" fill="${sc2}"/>`;
    if(o.sinkType!=='snow')for(let k=0;k<14;k++){const gx=-190+k*28;h+=`<path d="M${gx} ${712-o.sink+4} l${f(-6+rnd(k)*12)} ${f(-22-rnd(k+3)*20)}" stroke="${tone(sc2,-.25)}" stroke-width="5" stroke-linecap="round"/>`;}
    else h+=`<ellipse cx="-60" cy="${712-o.sink}" rx="50" ry="12" fill="#fff"/><ellipse cx="60" cy="${712-o.sink}" rx="50" ry="12" fill="#fff"/>`;}
  // Congelado: bloco de gelo translúcido com brilho e pingentes.
  if(o.frozen)h+=`<rect x="-230" y="-200" width="460" height="940" rx="46" fill="#bfe9ff" fill-opacity=".42" stroke="#eafaff" stroke-width="10"/><path d="M-180 -150 L-120 -150 M-190 -120 L-160 -120 M150 200 L190 160 M120 560 L180 500" stroke="#fff" stroke-width="12" stroke-linecap="round" opacity=".8"/><path d="M-200 -200 l20 50 l20 -50 l20 70 l20 -70 l20 40 l20 -40" fill="#dff6ff" opacity=".9"/>`;
  h+='</g>';
  // Luz do cenário: light:{color:'#ffb070', az:graus de onde vem a luz (0 = direita, 180 = esquerda), amt:0..1}.
  if(o.light){const L=o.light,id='lt'+String(L.color).replace(/[^a-z0-9]/gi,'')+(L.az??30);
    h=`<defs><filter id="${id}" x="-10%" y="-10%" width="120%" height="120%"><feGaussianBlur in="SourceAlpha" stdDeviation="22" result="b"/><feDiffuseLighting in="b" surfaceScale="7" diffuseConstant="${f(1.05+(L.amt??.5)*.15)}" lighting-color="${L.color||'#fff'}" result="l"><feDistantLight azimuth="${L.az??30}" elevation="${L.el??50}"/></feDiffuseLighting><feComposite in="l" in2="SourceAlpha" operator="in" result="lc"/><feBlend in="SourceGraphic" in2="lc" mode="multiply" result="m"/><feComposite in="m" in2="SourceGraphic" operator="arithmetic" k1="0" k2="${f(L.amt??.5)}" k3="${f(1-(L.amt??.5))}" k4="0"/></filter></defs><g filter="url(#${id})">${h}</g>`;}
  // Sombra do cenário por cima do personagem: castShadow:{type:'leaves'|'bars'|'window', shift (move a sombra), amt}.
  if(o.castShadow){const C=o.castShadow,ty=C.type||'leaves',id='cs'+ty,sh=f((C.shift||0)*300),am=f(C.amt??.42);let src;
    if(ty==='leaves')src=`<feTurbulence type="fractalNoise" baseFrequency="0.016" numOctaves="2" seed="7" result="n"/><feOffset in="n" dx="${sh}" dy="${f((C.shift||0)*60)}" result="no"/><feColorMatrix in="no" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  14 0 0 0 -7.4" result="m"/>`;
    else{const P=ty==='window'?260:110,B=ty==='window'?26:40;src=`<feFlood flood-opacity="0" x="0" y="0" width="${P}" height="${P}" result="e"/><feFlood flood-color="#000" x="0" y="0" width="${B}" height="${P}" result="v"/>`+(ty==='window'?`<feFlood flood-color="#000" x="0" y="0" width="${P}" height="${B}" result="hz"/><feMerge x="0" y="0" width="${P}" height="${P}" result="t"><feMergeNode in="e"/><feMergeNode in="v"/><feMergeNode in="hz"/></feMerge>`:`<feMerge x="0" y="0" width="${P}" height="${P}" result="t"><feMergeNode in="e"/><feMergeNode in="v"/></feMerge>`)+`<feTile in="t" result="tl"/><feOffset in="tl" dx="${sh}" result="m"/>`;}
    h=`<defs><filter id="${id}" filterUnits="userSpaceOnUse" x="-3000" y="-3000" width="6000" height="6000">${src}<feComposite in="m" in2="SourceAlpha" operator="in" result="ms"/><feFlood flood-color="#10131f" flood-opacity="${am}"/><feComposite in2="ms" operator="in" result="sh"/><feMerge><feMergeNode in="SourceGraphic"/><feMergeNode in="sh"/></feMerge></filter></defs><g filter="url(#${id})">${h}</g>`;}
  const RIM=o.rim||(o.light&&o.light.rim!==false?tone(o.light.color||'#ffffff',.55):null);
  if(RIM){o=Object.assign({},o,{rim:RIM,rimDir:o.rimDir??(o.light?(Math.cos((o.light.az??30)*Math.PI/180)>=0?1:-1):1)});}
  if(o.rim){const id='rim'+String(o.rim).replace(/[^a-z0-9]/gi,''),dx=(o.rimDir??1)*5;return `<defs><filter id="${id}" x="-20%" y="-20%" width="140%" height="140%"><feMorphology in="SourceAlpha" operator="dilate" radius="2" result="d"/><feOffset in="d" dx="${dx}" dy="-3" result="o"/><feFlood flood-color="${o.rim}" flood-opacity=".9"/><feComposite in2="o" operator="in"/></filter></defs><g filter="url(#${id})">${h}</g>${h}`;}
  return h;
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

// Rastro de movimento: cópias semitransparentes atrás de uma ação rápida. dx,dy = deslocamento da cópia (unidades SVG).
function trail(o,dx,dy,n=3){let h='';for(let k=n;k>=1;k--)h+=`<g transform="translate(${f(-dx*k)} ${f(-dy*k)})" opacity="${f(.28/k)}">${guy(o)}</g>`;return h+guy(o);}

// ---------- gestos prontos e alcance automático do braço ----------
// reach(side, x, y): ângulos (a, e) para a mão chegar no ponto (x,y) em coordenadas do boneco (cabeça = 0,0; pés = 712).
function reach(side,x,y){
  const L1=135,L2=150,Sx=side*106,Sy=150;let dx=x-Sx,dy=y-Sy,d=Math.hypot(dx,dy);const dm=L1+L2-1;if(d>dm){dx*=dm/d;dy*=dm/d;d=dm;}
  const phi=Math.atan2(-dx,dy),al=Math.acos(Math.max(-1,Math.min(1,(L1*L1+d*d-L2*L2)/(2*L1*d))));let best=null;
  for(const sg of[1,-1]){const r=phi+sg*al,Ex=Sx-Math.sin(r)*L1,Ey=Sy+Math.cos(r)*L1,r2=Math.atan2(-(Sx+dx-Ex),(Sy+dy-Ey));const sc=side*Ex+(Ey>Sy?20:0);if(!best||sc>best.sc)best={sc,r,re:r2-r};}
  let re=best.re;while(re>Math.PI)re-=2*Math.PI;while(re<-Math.PI)re+=2*Math.PI;
  const R=best.r*180/Math.PI,RE=re*180/Math.PI;return side<0?{a:R,e:RE}:{a:-R,e:-RE};
}
// gesture: 'crossed' (braços cruzados), 'hips' (mão na cintura), 'scratch' (coçar a cabeça), 'facepalm', 'think' (mão no queixo), 'shrug' (dar de ombros), 'dance' (dancinha da vitória).
function gesturePreset(g,t){const s=Math.sin(t*9),c=Math.cos(t*7);
  switch(g){
    case 'crossed':return{reachL:[70,285],reachR:[-70,265],handL:'fist',handR:'fist'};
    case 'hips':return{reachL:[-128,415],reachR:[128,415],handL:'fist',handR:'fist'};
    case 'scratch':return{reachR:[72+s*10,-112+c*6],handR:'relaxed',front:'R',expr:'smirk',lookY:-.4};
    case 'facepalm':return{reachR:[14,6],handR:'open',front:'R',expr:'neutral'};
    case 'think':return{reachR:[22,96],handR:'fist',front:'R',reachL:[70,300],handL:'fist',lookY:-.7,look:.6};
    case 'shrug':return{reachL:[-215,250],reachR:[215,250],handL:'open',handR:'open',bob:-14,browUp:.8};
    case 'carry':return{reachL:[-104,322],reachR:[104,322],handL:'open',handR:'open',front:'LR',carry:true,lean:-4};
    case 'highfive':return{reachR:[235,-120],handR:'open',expr:'happy'};
    case 'handshake':return{reachR:[215,330+Math.sin(t*14)*12],handR:'open'};
    case 'push':return{reachL:[200,250],reachR:[245,262],handL:'open',handR:'open',lean:10,front:'LR'};
    case 'hug':return{reachL:[150,232],reachR:[200,250],handL:'open',handR:'open',front:'LR',expr:'happy'};
    case 'dance':{const u=Math.sin(t*6);return{reachL:u>0?[-170,-170]:[-200,300],reachR:u>0?[200,300]:[170,-170],handL:'point',handR:'point',legL:u*18,legR:-u*18,bob:-Math.abs(u)*30,lean:u*8,expr:'laugh'};}
  }return{};}
// ---------- personagens extras ----------
const ELDER={skin:'#e9b48b',skinD:'#b9855e',shirt:'#8a9a6a',shirtD:'#66744c',pants:'#5a5048',pantsD:'#3f3830',hair:'#e8e8e8',hairStyle:'bald',beard:'#ececec',mustache:true};
const KIDKIT={skin:'#f0913f',skinD:'#c96c24',shirt:'#ffd23f',shirtD:'#c9a21f',pants:'#3f6fb5',pantsD:'#2f5590',hair:'#3a2722'};
function cane(){return `<g transform="translate(0 128) rotate(-6)"><path d="M0 -40 Q-2 -70 26 -72 Q48 -70 46 -48" stroke="#6b4a2f" stroke-width="16" fill="none" stroke-linecap="round"/><rect x="-8" y="-44" width="16" height="330" rx="7" fill="#7a5436"/><rect x="-10" y="280" width="20" height="16" rx="4" fill="#2b2b35"/></g>`;}
// Cachorro e gato (vista de lado). Origem = centro do corpo; patas tocam o chão em y=150. walk = fase, dir = ±1 (para onde olha).
function dog(o={}){const t=o.t||0,w=o.walk??null,d=o.dir??1,col=o.color||'#c98a4a',dk=o.colorD||'#8a5a2a',wag=Math.sin(t*14)*25,lg=k=>w===null?0:Math.sin(w*2*Math.PI+k*Math.PI)*25,bob=w===null?Math.sin(t*3)*3:-Math.abs(Math.cos(w*2*Math.PI))*8;
  let h=`<g transform="scale(${d} 1) translate(0 ${f(bob)})"><ellipse cy="${f(150-bob)}" rx="150" ry="16" fill="#000" opacity=".18"/>`;
  h+=`<g transform="translate(-110 -10) rotate(${f(-30+wag)})"><path d="M0 0 Q-30 -60 -10 -110" stroke="${col}" stroke-width="22" fill="none" stroke-linecap="round"/></g>`;
  for(const[x,k]of[[-80,0],[-50,1],[60,1],[90,0]])h+=`<g transform="translate(${x} 30) rotate(${f(lg(k))})"><rect x="-14" width="28" height="118" rx="12" fill="${k?dk:col}"/><ellipse cy="114" rx="20" ry="10" fill="${dk}"/></g>`;
  h+=`<ellipse rx="125" ry="62" fill="${col}"/><ellipse cx="10" cy="20" rx="70" ry="30" fill="#f2d2a8"/>`;
  h+=`<g transform="translate(115 -60) rotate(${f(Math.sin(t*2)*6)})"><ellipse rx="66" ry="56" fill="${col}"/><ellipse cx="50" cy="16" rx="38" ry="28" fill="#f2d2a8"/><ellipse cx="82" cy="4" rx="13" ry="10" fill="#2b1d17"/>`;
  h+=`<circle cx="16" cy="-12" r="11" fill="#2b1d17"/><circle cx="12" cy="-16" r="4" fill="#fff"/><path d="M-30 -40 Q-60 -20 -48 40 Q-30 30 -18 -20Z" fill="${dk}" transform="rotate(${f(Math.sin(t*5)*8)} -30 -40)"/>`;
  if(o.tongue!==false)h+=`<path d="M58 40 Q60 ${f(70+Math.abs(Math.sin(t*8))*10)} 72 ${f(68+Math.abs(Math.sin(t*8))*10)} Q80 60 74 40Z" fill="#ef7b8f"/>`;
  return h+`</g></g>`;}
function cat(o={}){const t=o.t||0,w=o.walk??null,d=o.dir??1,col=o.color||'#7a7f8a',dk=o.colorD||'#4d525c',lg=k=>w===null?0:Math.sin(w*2*Math.PI+k*Math.PI)*22,tl=Math.sin(t*2.2)*20;
  let h=`<g transform="scale(${d} 1)"><ellipse cy="150" rx="130" ry="14" fill="#000" opacity=".18"/>`;
  h+=`<path d="M-95 -5 Q-160 ${f(-40+tl)} -140 ${f(-130+tl)} Q-130 ${f(-150+tl)} -120 ${f(-130+tl)}" stroke="${col}" stroke-width="18" fill="none" stroke-linecap="round"/>`;
  for(const[x,k]of[[-70,0],[-45,1],[55,1],[80,0]])h+=`<g transform="translate(${x} 30) rotate(${f(lg(k))})"><rect x="-11" width="22" height="116" rx="10" fill="${k?dk:col}"/><ellipse cy="114" rx="15" ry="8" fill="#f4f0e6"/></g>`;
  h+=`<ellipse rx="110" ry="52" fill="${col}"/><path d="M-60 -40 l12 30 M-20 -48 l10 30 M20 -48 l8 30" stroke="${dk}" stroke-width="8" stroke-linecap="round"/>`;
  h+=`<g transform="translate(100 -55)"><circle r="52" fill="${col}"/><path d="M-40 -30 L-36 -82 L-8 -46Z M40 -30 L36 -82 L8 -46Z" fill="${col}"/><path d="M-34 -40 L-32 -66 L-16 -46Z M34 -40 L32 -66 L16 -46Z" fill="#f3a6b4"/>`;
  const bl=blink(t,4);h+=`<ellipse cx="-18" cy="-6" rx="12" ry="${f(14*(1-bl)+1)}" fill="#c9e86a"/><ellipse cx="22" cy="-6" rx="12" ry="${f(14*(1-bl)+1)}" fill="#c9e86a"/><rect x="-20" y="-16" width="4" height="${f(20*(1-bl))}" fill="#222"/><rect x="20" y="-16" width="4" height="${f(20*(1-bl))}" fill="#222"/>`;
  h+=`<path d="M0 12 l-6 -6 h12z" fill="#f3a6b4"/><path d="M0 14 q-8 10 -16 6 M0 14 q8 10 16 6 M-30 14 l-40 -6 M-30 20 l-40 6 M30 14 l40 -6 M30 20 l40 6" stroke="#222" stroke-width="3" fill="none"/>`;
  return h+`</g></g>`;}
// ---------- emoções flutuando na cabeça (coordenadas da cabeça) ----------
// emote: 'hearts' (corações subindo), 'cloud' (nuvem de mau humor com chuva), 'zzz', 'stars' (estrelas girando de tontura), 'idea' (lâmpada), 'question'.
function emote(k,t){let h='';
  if(k==='hearts')for(let i=0;i<4;i++){const p=(t*.5+i/4)%1;h+=`<path transform="translate(${f(-80+i*50+Math.sin(t*3+i)*14)} ${f(-150-p*180)}) scale(${f(.6+p*.6)})" d="M0 18 C-34 -6 -22 -30 0 -14 C22 -30 34 -6 0 18Z" fill="#ff3b5c" opacity="${f(1-p)}"/>`;}
  if(k==='cloud'){h+=`<g transform="translate(0 ${f(-215+Math.sin(t*2)*6)})"><circle cx="-50" r="42" fill="#3d4250"/><circle cx="0" cy="-20" r="52" fill="#3d4250"/><circle cx="52" r="40" fill="#3d4250"/><rect x="-90" y="0" width="182" height="38" rx="19" fill="#3d4250"/>`;for(let i=0;i<5;i++){const p=(t*1.6+i/5)%1;h+=`<line x1="${-60+i*30}" y1="${f(44+p*70)}" x2="${-66+i*30}" y2="${f(60+p*70)}" stroke="#7fb4e8" stroke-width="6" stroke-linecap="round" opacity="${f(1-p)}"/>`;}h+='</g>';}
  if(k==='zzz')for(let i=0;i<3;i++){const p=(t*.6+i/3)%1;h+=`<text x="${f(90+p*80)}" y="${f(-120-p*150)}" font-family="Anton" font-size="${f(50+p*40)}" fill="#fff" stroke="#1d3557" stroke-width="7" paint-order="stroke" opacity="${f(Math.sin(p*Math.PI))}">Z</text>`;}
  if(k==='stars')for(let i=0;i<4;i++){const a=t*5+i*Math.PI/2;h+=`<path transform="translate(${f(Math.cos(a)*130)} ${f(-150+Math.sin(a)*30)}) scale(.9)" d="M0 -26 L8 -8 L27 -8 L12 4 L18 24 L0 12 L-18 24 L-12 4 L-27 -8 L-8 -8Z" fill="#ffd23f" stroke="#b88a10" stroke-width="4"/>`;}
  if(k==='idea'){const p=1+Math.sin(t*8)*.06;h+=`<g transform="translate(0 -230) scale(${f(p)})"><circle r="44" fill="#fff6a8" stroke="#d9a400" stroke-width="6"/><rect x="-20" y="38" width="40" height="30" rx="6" fill="#9aa6b8"/>`;for(let i=0;i<8;i++){const a=i/8*Math.PI*2;h+=`<line x1="${f(Math.cos(a)*60)}" y1="${f(Math.sin(a)*60)}" x2="${f(Math.cos(a)*84)}" y2="${f(Math.sin(a)*84)}" stroke="#ffd23f" stroke-width="8" stroke-linecap="round"/>`;}h+='</g>';}
  if(k==='question')h+=`<text x="${f(110+Math.sin(t*4)*8)}" y="-150" font-family="Anton" font-size="120" fill="#ffd23f" stroke="#141414" stroke-width="10" paint-order="stroke" transform="rotate(${f(12+Math.sin(t*5)*8)} 110 -150)">?</text>`;
  return h;}
// "Puf" de fumaça para trocar roupa/visual: p de 0 a 1; troque o visual quando p passar de .5.
function poof(p,cx=0,cy=300){if(p<=0||p>=1)return'';let h='';const k=Math.sin(p*Math.PI);
  for(let i=0;i<10;i++){const a=i/10*Math.PI*2,d=120+p*200;h+=`<circle cx="${f(cx+Math.cos(a)*d*.8)}" cy="${f(cy+Math.sin(a)*d)}" r="${f(80+k*90)}" fill="#f4f1ea" opacity="${f(k*.95)}"/>`;}
  return h+`<circle cx="${cx}" cy="${cy}" r="${f(260*k)}" fill="#fff" opacity="${f(k)}"/><text x="${cx}" y="${cy+40}" font-family="Anton" font-size="${f(160*k)}" text-anchor="middle" fill="#ffd23f" stroke="#141414" stroke-width="12" paint-order="stroke">PUF!</text>`;}

// ---------- mais bichos (vista de lado; origem = centro do corpo; chão em y=150 para os que andam) ----------
function butterfly(t,s=1){const w=.3+.7*Math.abs(Math.sin(t*14));return `<g transform="scale(${s})"><ellipse rx="${f(34*w+4)}" ry="26" cx="${f(-20*w)}" cy="-8" fill="#ff8a3d" stroke="#2b2b35" stroke-width="4"/><ellipse rx="${f(34*w+4)}" ry="26" cx="${f(20*w)}" cy="-8" fill="#ff8a3d" stroke="#2b2b35" stroke-width="4"/><ellipse rx="${f(22*w+3)}" ry="16" cx="${f(-14*w)}" cy="18" fill="#ffd23f" stroke="#2b2b35" stroke-width="4"/><ellipse rx="${f(22*w+3)}" ry="16" cx="${f(14*w)}" cy="18" fill="#ffd23f" stroke="#2b2b35" stroke-width="4"/><rect x="-5" y="-24" width="10" height="52" rx="5" fill="#2b2b35"/><path d="M-3 -24 q-10 -20 -16 -22 M3 -24 q10 -20 16 -22" stroke="#2b2b35" stroke-width="3" fill="none"/></g>`;}
function birdy(o={}){const t=o.t||0,fl=o.sit?Math.sin(t*3)*6:Math.sin(t*16)*45,d=o.dir??1,col=o.color||'#3fa0e0',hb=o.sit?Math.sin(t*2.3)*8:0;
  return `<g transform="scale(${d} 1)"><path d="M-30 -2 l-34 -10 l6 16Z" fill="${col}"/><ellipse rx="38" ry="28" fill="${col}"/><ellipse cx="6" cy="10" rx="22" ry="14" fill="#fff4d0"/><g transform="translate(-4 -6) rotate(${f(-fl)})"><path d="M0 0 Q-20 -40 -44 -30 Q-30 -6 0 0Z" fill="${col}" stroke="#1f5f8a" stroke-width="3"/></g><g transform="translate(26 -22) rotate(${f(hb)})"><circle r="20" fill="${col}"/><circle cx="7" cy="-4" r="5" fill="#141414"/><circle cx="8" cy="-6" r="1.8" fill="#fff"/><path d="M18 0 l16 4 l-16 5Z" fill="#ffb02e"/></g>${o.sit?'<path d="M-8 26 v12 M8 26 v12" stroke="#ffb02e" stroke-width="5"/>':''}</g>`;}
function fish(o={}){const t=o.t||0,d=o.dir??1,col=o.color||'#ff8a3d',w=Math.sin(t*9)*18;
  return `<g transform="scale(${d} 1) rotate(${f(Math.sin(t*4)*4)})"><path d="M-60 0 L-110 ${f(-34+w)} L-104 ${f(w*.3)} L-110 ${f(34+w)}Z" fill="${col}" stroke="#a84a14" stroke-width="5"/><ellipse rx="72" ry="42" fill="${col}" stroke="#a84a14" stroke-width="5"/><path d="M-10 -40 Q10 -70 30 -40" fill="${col}" stroke="#a84a14" stroke-width="5"/><path d="M-20 -30 Q-8 0 -20 30 M0 -36 Q12 0 0 36" stroke="#ffd2a8" stroke-width="5" fill="none"/><circle cx="40" cy="-8" r="11" fill="#fff"/><circle cx="43" cy="-8" r="6" fill="#141414"/><path d="M62 12 q-8 6 -14 0" stroke="#a84a14" stroke-width="4" fill="none"/>${Math.sin(t*3)>.6?`<circle cx="${f(90+(t*40)%60)}" cy="${f(-30-(t*60)%80)}" r="8" fill="none" stroke="#bfe9ff" stroke-width="3"/>`:''}</g>`;}
function chicken(o={}){const t=o.t||0,w=o.walk??null,d=o.dir??1,lg=k=>w===null?0:Math.sin(w*2*Math.PI+k*Math.PI)*25,pk=Math.max(0,Math.sin(t*5))*16;
  let h=`<g transform="scale(${d} 1)"><ellipse cy="150" rx="80" ry="12" fill="#000" opacity=".18"/>`;
  for(const[x,k]of[[-14,0],[14,1]])h+=`<g transform="translate(${x} 50) rotate(${f(lg(k))})"><path d="M0 0 V92 M0 92 l-16 8 M0 92 l18 6 M0 92 l2 12" stroke="#ffb02e" stroke-width="8" stroke-linecap="round" fill="none"/></g>`;
  h+=`<path d="M-70 -10 Q-110 -60 -80 -80 Q-70 -40 -50 -30Z" fill="#f4f1ea" stroke="#d0c8b8" stroke-width="4"/><ellipse rx="78" ry="62" fill="#fbfaf5" stroke="#d0c8b8" stroke-width="5"/><path d="M-30 -10 Q0 30 30 -6" stroke="#d0c8b8" stroke-width="5" fill="none"/>`;
  h+=`<g transform="translate(60 ${f(-60+pk)}) rotate(${f(pk*1.5)})"><circle r="34" fill="#fbfaf5" stroke="#d0c8b8" stroke-width="4"/><path d="M-14 -30 q6 -24 14 -6 q6 -22 14 -2 q8 -16 10 6Z" fill="#e2283b"/><path d="M30 -2 l24 8 l-24 8Z" fill="#ffb02e"/><path d="M26 16 q4 18 -6 22 q-6 -12 6 -22Z" fill="#e2283b"/><circle cx="10" cy="-6" r="6" fill="#141414"/><circle cx="12" cy="-8" r="2" fill="#fff"/></g>`;
  return h+'</g>';}
function cow(o={}){const t=o.t||0,w=o.walk??null,d=o.dir??1,lg=k=>w===null?0:Math.sin(w*2*Math.PI+k*Math.PI)*22,tl=Math.sin(t*3)*20;
  let h=`<g transform="scale(${d} 1)"><ellipse cy="150" rx="210" ry="18" fill="#000" opacity=".18"/><path d="M-190 -40 Q${f(-230+tl)} 20 ${f(-220+tl)} 80" stroke="#f4f1ea" stroke-width="12" fill="none"/><circle cx="${f(-220+tl)}" cy="84" r="12" fill="#333"/>`;
  for(const[x,k]of[[-140,0],[-100,1],[100,1],[140,0]])h+=`<g transform="translate(${x} 40) rotate(${f(lg(k))})"><rect x="-16" width="32" height="96" rx="12" fill="#f4f1ea" stroke="#333" stroke-width="5"/><rect x="-16" y="86" width="32" height="22" rx="6" fill="#333"/></g>`;
  h+=`<ellipse rx="200" ry="100" fill="#f4f1ea" stroke="#333" stroke-width="7"/><ellipse cx="-60" cy="-30" rx="55" ry="38" fill="#222"/><ellipse cx="80" cy="30" rx="45" ry="32" fill="#222"/><ellipse cx="-20" cy="92" rx="34" ry="16" fill="#f3a6b4" stroke="#333" stroke-width="4"/>`;
  h+=`<g transform="translate(210 -60) rotate(${f(Math.sin(t*1.5)*6)})"><ellipse rx="80" ry="68" fill="#f4f1ea" stroke="#333" stroke-width="7"/><ellipse cx="30" cy="38" rx="56" ry="34" fill="#f3a6b4" stroke="#333" stroke-width="5"/><circle cx="12" cy="36" r="7" fill="#333"/><circle cx="50" cy="36" r="7" fill="#333"/><circle cx="-6" cy="-14" r="15" fill="#fff" stroke="#333" stroke-width="4"/><circle cx="34" cy="-14" r="15" fill="#fff" stroke="#333" stroke-width="4"/><circle cx="-4" cy="-12" r="6"/><circle cx="36" cy="-12" r="6"/><path d="M-40 -56 l-24 -30 M40 -60 l18 -34" stroke="#c9b48a" stroke-width="14" stroke-linecap="round"/><ellipse cx="-70" cy="-30" rx="30" ry="14" fill="#f4f1ea" stroke="#333" stroke-width="5" transform="rotate(${f(-20+Math.sin(t*4)*12)} -60 -30)"/></g>`;
  return h+'</g>';}
function rat(o={}){const t=o.t||0,w=o.walk??null,d=o.dir??1,col=o.color||'#9a9aa6',lg=k=>w===null?0:Math.sin(w*2*Math.PI+k*Math.PI)*30,sn=Math.sin(t*20)*3;
  let h=`<g transform="scale(${d} 1)"><ellipse cy="150" rx="70" ry="10" fill="#000" opacity=".18"/><path d="M-60 90 Q-130 ${f(120+Math.sin(t*4)*20)} -150 70" stroke="#f3a6b4" stroke-width="7" fill="none" stroke-linecap="round"/>`;
  for(const[x,k]of[[-34,0],[30,1]])h+=`<g transform="translate(${x} 110) rotate(${f(lg(k))})"><rect x="-7" width="14" height="40" rx="6" fill="#f3a6b4"/></g>`;
  h+=`<ellipse cy="90" rx="70" ry="40" fill="${col}"/><g transform="translate(60 70)"><path d="M0 -30 Q60 -6 ${f(70+sn)} 6 Q30 26 0 24Z" fill="${col}"/><circle cx="${f(72+sn)}" cy="6" r="7" fill="#f3a6b4"/><circle cx="-4" cy="-30" r="20" fill="${col}" stroke="#7a7a86" stroke-width="3"/><circle cx="-4" cy="-30" r="11" fill="#f3a6b4"/><circle cx="30" cy="-6" r="6" fill="#141414"/><path d="M56 4 l26 -8 M56 8 l28 4" stroke="#555" stroke-width="2"/></g>`;
  return h+'</g>';}

// ---------- vista de costas (cabeça) ----------
function headBack(c){const TT=c.t,wd=TT===undefined?0:(c.wind??.45),dir=c.windDir??1;let h='';
  for(const sd of[-1,1])h+=`<g transform="translate(${sd*112} 12) rotate(${f(sd*((c.earFlap||0)+(TT===undefined?0:Math.sin(TT*7.3)*wd*3))*3)})"><circle r="28" fill="${c.skin}" stroke="${c.skinD}" stroke-width="5"/></g>`;
  h+=`<circle r="115" fill="${c.skin}" stroke="${c.skinD}" stroke-width="6"/>`;
  const HS=c.hairStyle||'curly';
  if(HS==='bald')return h+`<ellipse cx="-20" cy="-60" rx="40" ry="16" fill="#fff" opacity=".3"/>`;
  h+=`<path d="M-114 40 Q-122 -130 0 -126 Q122 -130 114 40 Q60 74 0 66 Q-60 74 -114 40Z" fill="${c.hair}"/>`;
  if(HS==='curly'||HS==='afro')for(let k=0;k<26;k++){const a=(150+k*9.5)*Math.PI/180,rr=(HS==='afro'?40:24)+rnd(k)*6,R=HS==='afro'?120:104,ph=TT===undefined?0:TT*5+k,dx=wd*(Math.sin(ph)*6+dir*4);
    h+=`<circle cx="${f(Math.cos(a)*R+dx)}" cy="${f(Math.sin(a)*R*.95+(Math.sin(a)>0?-10:0))}" r="${f(rr)}" fill="${k%3===1?tone(c.hair,.12):c.hair}"/>`;}
  for(let k=0;k<7;k++)h+=`<circle cx="${-60+k*20+(k%2)*6}" cy="${f(-20+(k%3)*24)}" r="${20+rnd(k+9)*6}" fill="${k%2?tone(c.hair,.1):c.hair}"/>`;
  if(HS==='ponytail'){const sw=TT===undefined?0:Math.sin(TT*3.2)*10+wd*dir*14;h+=`<circle cy="-40" r="16" fill="${c.hairTie||'#e2574c'}"/><g transform="translate(0 -36) rotate(${f(sw)})"><path d="M-22 0 Q-30 90 0 170 Q30 90 22 0Z" fill="${c.hair}"/></g>`;}
  h+=`<path d="M-60 -100 Q-10 -120 40 -106" stroke="#fff" stroke-opacity=".2" stroke-width="10" fill="none" stroke-linecap="round"/>`;
  return h;}
// ---------- vista de lado (perfil, olhando para +x; use dir:-1 para virar) ----------
function headSide(c){const e=c.expr||'neutral',TT=c.t,bl=c.blink||0,mo=c.mouth||0,look=c.look||0,lookY=c.lookY||0,wd=TT===undefined?0:(c.wind??.45),dir=c.windDir??-1,L='#3a2722';let h='';
  h+=`<circle r="115" fill="${c.skin}" stroke="${c.skinD}" stroke-width="6"/>`;
  h+=`<path d="M100 -8 Q146 14 106 40" fill="${c.skin}" stroke="${c.skinD}" stroke-width="6"/><path d="M98 -4 L102 38" stroke="${c.skin}" stroke-width="10"/>`;
  h+=`<path d="M-98 58 Q0 150 98 58 Q0 128 -98 58Z" fill="${c.skinD}" opacity=".3"/>`;
  const HS=c.hat?'none':(c.hairStyle||'curly');
  if(HS!=='bald'&&HS!=='none'){h+=`<path d="M78 -86 Q10 -134 -72 -112 Q-128 -70 -118 22 Q-110 70 -66 74 Q-84 20 -52 -22 Q-8 -62 78 -56Z" fill="${c.hair}"/>`;
    if(HS==='curly'||HS==='afro')for(let k=0;k<13;k++){const a=(150+k*12)*Math.PI/180,ph=TT===undefined?0:TT*5.3+k*.8,dx=wd*(Math.sin(ph)*6+dir*5);h+=`<circle cx="${f(Math.cos(a)*(HS==='afro'?118:104)+dx)}" cy="${f(Math.sin(a)*(HS==='afro'?112:104))}" r="${f((HS==='afro'?40:24)+rnd(k)*6)}" fill="${k%3===1?tone(c.hair,.12):c.hair}"/>`;}
    if(HS==='ponytail'){const sw=TT===undefined?0:Math.sin(TT*3.2)*10+wd*14;h+=`<g transform="translate(-112 -40) rotate(${f(30+sw)})"><path d="M0 0 Q-40 80 -10 170 Q20 90 14 0Z" fill="${c.hair}"/></g>`;}}
  else if(HS==='bald')h+=`<ellipse cx="-10" cy="-80" rx="40" ry="14" fill="#fff" opacity=".3"/>`;
  else h+=`<path d="M-120 -28 Q-122 -158 0 -156 Q122 -158 120 -28Z" fill="#22355e"/><path d="M40 -30 Q120 -20 170 -30 Q130 -4 40 -8Z" fill="#101829"/>`;
  h+=`<g transform="translate(-16 16) rotate(${f(c.earFlap||0)})"><ellipse rx="24" ry="30" fill="${c.skin}" stroke="${c.skinD}" stroke-width="5"/><path d="M-4 -14 Q10 0 -2 14" stroke="${c.skinD}" stroke-width="5" fill="none"/></g>`;
  if(e==='sleep'||e==='laugh')h+=`<path d="M42 -2 Q58 ${e==='laugh'?-18:12} 74 -2" stroke="${L}" stroke-width="7" fill="none" stroke-linecap="round"/>`;
  else{const big=e==='shock'?1.25:1;h+=`<ellipse cx="60" cy="-6" rx="${f(16*big)}" ry="${f((26*(1-bl)+2)*big)}" fill="#fffdf7" stroke="${L}" stroke-width="4.5"/>`;
    if(bl<.8)h+=`<circle cx="${f(64+look*3)}" cy="${f(-2+lookY*6)}" r="${f((e==='shock'||e==='fear'?6:9)*(c.pupil||1))}" fill="#2a1c17"/><circle cx="${f(61+look*3)}" cy="${f(-6+lookY*6)}" r="3" fill="#fff"/>`;
    h+=`<path d="M72 -30 l10 -8" stroke="${L}" stroke-width="4" stroke-linecap="round"/>`;}
  const brow={angry:'M36 -50 L82 -32',fear:'M38 -38 L78 -58',shock:'M38 -60 Q60 -74 80 -60'}[e]||'M38 -48 Q60 -58 80 -48';
  h+=`<path d="${brow}" stroke="${L}" stroke-width="10" fill="none" stroke-linecap="round"/>`;
  if(e==='happy'||e==='laugh')h+=`<path d="M62 48 Q86 54 104 44 Q100 ${f(86+mo*10)} 78 ${f(84+mo*10)} Q62 70 62 48Z" fill="#5a1717"/><path d="M64 49 Q86 54 102 45 L100 54 Q84 60 66 56Z" fill="#fffdf7"/>`;
  else if(e==='shock')h+=`<ellipse cx="88" cy="64" rx="12" ry="18" fill="#5a1717"/>`;
  else if(mo>.05)h+=`<ellipse cx="88" cy="62" rx="${f(9+mo*6)}" ry="${f(4+mo*18)}" fill="#5a1717"/>`;
  else if(e==='angry')h+=`<path d="M68 64 Q86 54 102 62" stroke="${L}" stroke-width="7" fill="none" stroke-linecap="round"/>`;
  else if(e==='fear')h+=`<path d="M66 62 Q74 54 82 62 Q90 70 100 60" stroke="${L}" stroke-width="6" fill="none" stroke-linecap="round"/>`;
  else h+=`<path d="M68 56 Q88 66 102 52" stroke="${L}" stroke-width="7" fill="none" stroke-linecap="round"/>`;
  const bs=c.blush??((e==='laugh'||e==='happy')?.55:0);if(bs>0)h+=`<ellipse cx="58" cy="36" rx="20" ry="11" fill="#ff6f86" opacity="${f(bs*.6)}"/>`;
  if(c.glasses)h+=`<circle cx="62" cy="-6" r="30" fill="#bfe6ff" fill-opacity=".18" stroke="#222" stroke-width="7"/><path d="M32 -10 L-10 -16" stroke="#222" stroke-width="6"/>`;
  if(c.cap){const cc=c.capColor||'#e2574c';h+=`<path d="M-118 -40 Q-120 -150 0 -146 Q120 -150 118 -40Z" fill="${cc}"/><path d="M40 -46 Q140 -60 190 -36 Q130 -22 40 -30Z" fill="${cc}"/>`;}
  return h;}
function guySide(o){
  o=soften(o);
  const c=Object.assign({},ORANGE,o.kit||{},{view:'side'}),T=o.t,sd=o.seed||0,dir=o.dir??1;
  if(o.gesture){const G={hug:{aF:-82,eF:-58,aB:-78,eB:-52,handF:'open',handB:'open'},push:{aF:-96,eF:-4,aB:-90,eB:-4,handF:'open',handB:'open',lean:12},handshake:{aF:-55,eF:-28+Math.sin((o.t||0)*14)*8,handF:'open'},highfive:{aF:-155,eF:-8,handF:'open'},carry:{aF:-72,eF:-42,aB:-68,eB:-44,handF:'open',handB:'open',carry:true,lean:-6}}[o.gesture];if(G)o=Object.assign({},G,o);}
  const {x,y,s=1,walk=null,run=false,rot=0,holdF='',holdB=''}=o;let {bob=0,lean=0,legF=0,legB=0,aF,aB,eF=-14,eB=-14}=o;const SQ=o.sq||0;
  if(T!==undefined){bob+=Math.sin(T*2.6+sd)*7;lean+=Math.sin(T*1.3+sd)*1.5;if(o.blink===undefined)o=Object.assign({},o,{blink:blink(T,sd)});}
  if(walk!==null){const w=Math.sin(walk*2*Math.PI),amp=run?50:30;legF=w*amp;legB=-w*amp;bob-=Math.abs(Math.cos(walk*2*Math.PI))*(run?26:12);lean+=run?12:3;
    if(aF===undefined)aF=-w*(run?65:30);if(aB===undefined)aB=w*(run?65:30);if(run){eF-=60;eB-=60;}}
  if(aF===undefined)aF=T===undefined?0:Math.sin(T*2.1+sd)*4;if(aB===undefined)aB=T===undefined?0:Math.sin(T*2.1+sd+1.7)*4;
  const cb=Object.assign({},c,{skin:tone(c.skin,-.14),skinD:tone(c.skinD,-.14),shirt:tone(c.shirt,-.1),shirtD:tone(c.shirtD,-.1),pants:tone(c.pants,-.15),pantsD:tone(c.pantsD,-.15)});
  const legS=(k,a,kn,cc)=>`<g transform="translate(${k} 400) rotate(${f(a)})"><g transform="translate(0 150) rotate(${f(kn)})"><rect x="-44" y="-16" width="88" height="162" rx="28" fill="${cc.pants}" stroke="${cc.pantsD}" stroke-width="5"/><g transform="rotate(${f(-(a+kn)*.75)} 0 150)">`+(o.flipflops?`<ellipse cx="24" cy="162" rx="72" ry="9" fill="#e2574c"/><ellipse cx="22" cy="148" rx="58" ry="16" fill="${cc.skin}" stroke="${cc.skinD}" stroke-width="4"/>`:`<ellipse cx="24" cy="161" rx="74" ry="14" fill="#e9e3d6"/><ellipse cx="22" cy="150" rx="72" ry="24" fill="${o.shoeColor||'#3a302c'}"/><path d="M14 134 l10 7 l10 -7" stroke="#f4f0e6" stroke-width="4" fill="none"/>`)+`</g></g><rect x="-44" width="88" height="170" rx="30" fill="${cc.pants}" stroke="${cc.pantsD}" stroke-width="5"/></g>`;
  const hw=T===undefined?0:(o.wind??.45),hm=Math.sin((T||0)*4.7+sd)*hw,br=T===undefined?0:Math.sin(T*2.6+sd);
  let h=`<g transform="translate(${f(x)} ${f(y)}) rotate(${f(rot)}) scale(${f(s*dir*(o.sxMul??1))} ${s})">`;
  h+=`<ellipse cy="712" rx="150" ry="24" fill="#000" opacity=".18"/>`;
  for(const a of[legB,legF])h+=`<ellipse cx="${f(-Math.sin(a*Math.PI/180)*300+20)}" cy="718" rx="64" ry="9" fill="#000" opacity=".35"/>`;
  if(walk!==null&&o.dust!==false)for(let k=0;k<4;k++){const p=((walk*2)+k/4)%1;h+=`<circle cx="${f(-(40+p*(run?220:120)))}" cy="${f(705-p*(run?70:35))}" r="${f(10+p*(run?34:20))}" fill="#d9cfbb" opacity="${f((1-p)*(run?.6:.4))}"/>`;}
  h+=`<g transform="translate(0 712) scale(${f(1+SQ)} ${f(1-SQ)}) translate(0 ${f(-712+bob)}) rotate(${f(lean)} 0 420)">`;
  h+=arm(-1,aB,eB,cb,holdB,{pose:o.handB,t:T,sx:-6});
  const kB=o.kneeB??Math.max(0,legB)*1.1+(run?20:0),kF=o.kneeF??Math.max(0,legF)*1.1+(run?20:0);
  h+=legS(-10,legB,kB,cb)+legS(10,legF,kF,c);
  h+=`<rect x="-24" y="90" width="52" height="44" fill="${c.skinD}"/>`;
  h+=`<g transform="translate(0 112) scale(${f(1+br*.02)} ${f(1+br*.02)}) translate(0 -112)"><path d="M-70 150 Q-76 116 -44 112 L52 112 Q84 116 82 150 L${f(86+br*3)} 300 Q90 400 74 ${f(432+hm*6)} Q0 ${f(452+hm*8)} ${f(-70-hw*10)} ${f(432-hm*6)} Z" fill="${c.shirt}" stroke="${c.shirtD}" stroke-width="6"/></g>`;
  h+=`<path d="M20 114 Q40 140 58 116" fill="none" stroke="${c.shirtD}" stroke-width="8"/><path d="M-50 330 q30 10 60 0" stroke="${c.shirtD}" stroke-width="4" fill="none" opacity=".5"/>`;
  h+=`<g transform="translate(14 0)">`+head(Object.assign({},c,o,{view:'side',windDir:-1}))+'</g>';
  if(o.emote)h+=`<g transform="translate(14 0)">${emote(o.emote,T||0)}</g>`;
  if(o.carry)h+=`<g transform="translate(176 300)"><rect x="-90" y="-80" width="180" height="150" rx="10" fill="#c9935a" stroke="#8a5a2a" stroke-width="7"/><path d="M-90 -20 H90" stroke="#e6c48e" stroke-width="16" opacity=".8"/></g>`;
  h+=arm(-1,aF,eF,c,holdF,{pose:o.handF,t:T,sx:6});
  return h+'</g></g>';}

// ---------- cabeça do estilo macio (frente, 3/4, lado e costas) ----------
// hairStyle: 'bob' (liso com franja pontuda), 'short' (curtinho arredondado), 'bun' (coque), 'curly'. sprout:true = brotinho no topo.
function headSoft(c){
  const e=c.expr||'neutral',TT=c.t,bl=c.blink||0,mo=c.mouth||0,look=c.lookCam?0:(c.look||0),lookY=c.lookCam?0:(c.lookY||0),V=c.view||'front';
  const Q=V==='3q'?(c.dir??1):0,SIDE=V==='side',D='#2b2320',sk=c.skin,hair=c.hair,id='hsg'+sk.slice(1)+(SIDE?'s':Q);
  const wd=TT===undefined?0:(c.wind??.45),sw=k=>TT===undefined?0:Math.sin(TT*5+k)*wd*7,HS=c.hairStyle||'bob';
  let h=`<defs><radialGradient id="${id}" cx="${f(.36+(SIDE?.18:Q*.1))}" cy=".3" r=".8"><stop offset="0" stop-color="${tone(sk,.16)}"/><stop offset=".62" stop-color="${sk}"/><stop offset="1" stop-color="${tone(sk,-.16)}"/></radialGradient></defs>`;
  // cabelo de trás (laterais do chanel / coque)
  if(V==='back'){h+=`<circle r="116" fill="${sk}"/><path d="M-124 30 Q-132 -138 0 -140 Q132 -138 124 30 Q130 ${f(80+sw(1))} 96 60 Q0 86 -96 60 Q-130 ${f(80+sw(2))} -124 30Z" fill="${hair}"/><path d="M-50 -110 Q0 -128 50 -112" stroke="#fff" stroke-opacity=".15" stroke-width="10" fill="none"/>`;if(HS==='bun')h+=`<circle cy="-120" r="44" fill="${hair}"/>`;if(c.sprout)h+=sprout(TT);return h;}
  if(HS==='bob'){if(SIDE)h+=`<path d="M96 -64 Q70 -142 -20 -138 Q-130 -122 -138 -10 L${f(-142+sw(1))} 92 L-106 62 L-88 86 Q-78 0 -40 -30 Q20 -70 96 -64Z" fill="${hair}"/>`;
    else h+=`<path d="M-126 -10 Q-138 -140 0 -142 Q138 -140 126 -10 L${f(132+sw(1))} 86 L106 52 L92 70 L-92 70 L-106 52 L${f(-132+sw(2))} 86Z" fill="${hair}"/>`;}
  if(HS==='bun')h+=`<circle cx="${SIDE?-70:0}" cy="-120" r="44" fill="${hair}"/>`;
  // orelhas (sem contorno)
  if(SIDE)h+=`<ellipse cx="-14" cy="16" rx="20" ry="26" fill="${tone(sk,-.06)}"/>`;
  else for(const sd of[-1,1])if(sd!==Q)h+=`<circle cx="${Q?-Q*100:sd*106}" cy="16" r="22" fill="${tone(sk,-.06)}"/>`;
  h+=`<circle r="115" fill="url(#${id})"/>`;
  if(SIDE)h+=`<path d="M106 4 Q124 18 108 30" fill="${sk}"/>`;
  // rosto
  const fx=SIDE?62:Q*30,E=SIDE?[[fx,1]]:Q?[[fx+Q*30,1],[fx-Q*28,.72]]:[[-34,1],[34,1]];
  for(const[ex,sxe]of E){
    if(e==='sleep'||e==='laugh'||e==='smug')h+=`<path d="M${f(ex-10*sxe)} 0 Q${ex} ${e==='laugh'?-10:8} ${f(ex+10*sxe)} 0" stroke="${D}" stroke-width="5" fill="none" stroke-linecap="round"/>`;
    else{const ry=(e==='shock'?13:10)*(1-bl)+1,pl=(e==='bored'||e==='suspicious')?.45:0;h+=`<ellipse cx="${f(ex+look*3*sxe)}" cy="${f(lookY*5+(pl?3:0))}" rx="${f((e==='shock'?8:7)*sxe)}" ry="${f(ry*(1-pl))}" fill="${D}"/>`;if(bl<.6)h+=`<circle cx="${f(ex+look*3*sxe+2)}" cy="${f(lookY*5-3)}" r="2.2" fill="#fff"/>`;}
    const by=e==='shock'?-34:e==='angry'?-20:-26,tilt=e==='angry'?8:(e==='fear'||e==='sad')?-8:0,sg=ex>fx?1:-1;
    h+=`<path d="M${f(ex-11*sxe)} ${by-tilt*sg} L${f(ex+11*sxe)} ${by+tilt*sg}" stroke="${D}" stroke-width="4.5" stroke-linecap="round"/>`;}
  const my=50,mx=SIDE?92:fx;
  if(mo>.05||e==='shock')h+=`<ellipse cx="${mx}" cy="${my+2}" rx="${f(5+mo*4)}" ry="${f(5+(e==='shock'?6:mo*10))}" fill="#5a1f1f"/>`;
  else if(e==='laugh'||e==='happy')h+=`<path d="M${mx-13} ${my-4} Q${mx} ${my} ${mx+13} ${my-4} Q${mx+11} ${my+16} ${mx} ${my+16} Q${mx-11} ${my+16} ${mx-13} ${my-4}Z" fill="#8a2e2e"/>`;
  else if(e==='smirk'||e==='smug')h+=`<path d="M${mx-8} ${my} Q${mx+4} ${my+5} ${mx+12} ${my-6}" stroke="${D}" stroke-width="4" fill="none" stroke-linecap="round"/>`;
  else if(e==='angry'||e==='fear'||e==='sad')h+=`<path d="M${mx-9} ${my+5} Q${mx} ${my-2} ${mx+9} ${my+5}" stroke="${D}" stroke-width="4" fill="none" stroke-linecap="round"/>`;
  else h+=`<path d="M${mx-7} ${my} Q${mx} ${my+3} ${mx+7} ${my}" stroke="${D}" stroke-width="4" fill="none" stroke-linecap="round"/>`;
  const bs=c.blush??.55;for(const[ex,sxe]of E)h+=`<ellipse cx="${f(ex+(SIDE?-6:(ex>fx?1:-1)*20)*sxe)}" cy="28" rx="${f(16*sxe)}" ry="11" fill="#f2718a" opacity="${f(bs*.55)}"/>`;
  if(c.glasses)for(const[ex,sxe]of E)h+=`<ellipse cx="${ex}" cy="-2" rx="${f(25*sxe)}" ry="23" fill="#fff" fill-opacity=".08" stroke="#7a4a2a" stroke-width="4.5"/>`+(E.length>1&&ex===E[0][0]?`<path d="M${f(E[0][0]+(E[1][0]>E[0][0]?1:-1)*24*E[0][1])} -6 L${f(E[1][0]-(E[1][0]>E[0][0]?1:-1)*24*E[1][1])} -6" stroke="#7a4a2a" stroke-width="4"/>`:'')+(SIDE?`<path d="M38 -6 L-10 -12" stroke="#7a4a2a" stroke-width="4"/>`:'');
  // franja / cabelo da frente
  const o2=SIDE?20:Q*18;
  if(HS==='bob'||HS==='bun'){if(SIDE)h+=`<path d="M104 -54 Q80 -140 -20 -138 Q-124 -124 -134 -20 L-100 -40 Q-70 -96 -10 -94 L4 -60 L26 ${f(-92+sw(3))} L44 -52 L66 ${f(-84+sw(4))} L80 -46 L92 -66Z" fill="${hair}"/>`;
    else h+=`<path d="M-122 -6 Q-124 -136 ${o2} -138 Q124 -136 122 -6 L106 -40 L${f(92+o2*.3)} -22 L${f(78+o2*.4)} -64 L${f(46+o2*.6)} -40 L${f(24+o2*.8)} ${f(-84+sw(3))} L${f(-4+o2)} -46 L${f(-28+o2)} ${f(-82+sw(4))} L${f(-58+o2)} -40 L${f(-86+o2*.6)} -64 L${f(-98+o2*.4)} -22 L-110 -40Z" fill="${hair}"/>`;}
  else if(HS==='short')h+=SIDE?`<path d="M96 -66 Q70 -134 -20 -130 Q-118 -110 -122 0 Q-100 -40 -70 -50 Q-20 -96 40 -80 Q70 -76 96 -66Z" fill="${hair}"/>`:`<path d="M-120 -10 Q-126 -132 ${o2} -134 Q126 -132 120 -10 Q110 -60 80 -62 Q${f(60+o2)} -40 ${f(30+o2)} -66 Q${f(o2)} -44 ${f(-30+o2)} -66 Q${f(-60+o2)} -40 -80 -62 Q-110 -60 -120 -10Z" fill="${hair}"/><path d="M-60 -112 Q0 -128 50 -116" stroke="#fff" stroke-opacity=".22" stroke-width="10" fill="none"/>`;
  else if(HS==='curly')for(let k=0;k<13;k++){const a=(196+k*12)*Math.PI/180;h+=`<circle cx="${f(Math.cos(a)*104+o2*.5)}" cy="${f(Math.sin(a)*104)}" r="${f(24+rnd(k)*6)}" fill="${hair}"/>`;}
  if(HS!=='short'&&HS!=='curly')h+=`<path d="M${f(-70+o2)} -116 Q${f(-20+o2)} -130 ${f(30+o2)} -120" stroke="#fff" stroke-opacity=".14" stroke-width="10" fill="none" stroke-linecap="round"/>`;
  if(c.sprout)h+=sprout(TT);
  return h;}
function sprout(t){const r=t===undefined?0:Math.sin(t*2.4)*8;return `<g transform="translate(0 -136) rotate(${f(r)})"><path d="M0 0 Q-4 -16 0 -22" stroke="#4f9a3a" stroke-width="7" fill="none"/><path d="M0 -20 C-24 -40 -18 -76 2 -92 C20 -74 24 -40 0 -20Z" fill="#7cc04a"/><path d="M1 -26 L2 -82 M2 -40 l-10 -10 M2 -54 l10 -10 M2 -66 l-8 -8" stroke="#4f9a3a" stroke-width="3" fill="none"/><circle r="9" fill="#4f9a3a"/></g>`;}

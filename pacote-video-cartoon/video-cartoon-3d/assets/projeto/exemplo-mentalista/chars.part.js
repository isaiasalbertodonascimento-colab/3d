const HERO=sprite(CHAR_VB,.72,scene,true),BIA=sprite(CHAR_VB,.62,scene,true),TEO=sprite(CHAR_VB,.62,scene,true),DAVI=sprite(CHAR_VB,.62,scene,true);
// Personagens originais: Léo (mentalista), Bia, Téo, Davi.
const LK={hairStyle:'short',hair:'#5a3a22',skin:'#f0b27e',shirt:'#6b2338',pants:'#2d2a3a',sleeveStripe:'#e0b040'};
const BK={hairStyle:'bob',hair:'#1f1a2e',skin:'#c98450',shirt:'#2f6a5a',pants:'#33384a',sleeveStripe:'#ff9ac0'};
const TK={hairStyle:'curly',hair:'#a8432a',skin:'#eba574',shirt:'#2c3566',pants:'#2b2f45',sleeveStripe:'#7fd4ff'};
const DK={hairStyle:'short',hair:'#2b2a33',skin:'#b97a52',shirt:'#9a6a1e',pants:'#3a3330',sleeveStripe:'#f4f0e6'};
// "broto" do Léo vira um olhinho dourado que brilha quando ele "lê" alguém
let SP={eye:false,glow:0,t:0};
window.sprout=function(){if(!SP.eye)return'';const T=SP.t||0,g=SP.glow||0,bl=blink(T,4)>.5?.15:1,lk=Math.sin(T*1.3)*6;
  return `<g transform="translate(0 -150) rotate(${f(Math.sin(T*2)*5)})">`+(g>0?`<circle r="${f(58+g*14+Math.sin(T*9)*4)}" fill="#ffd23f" opacity="${f(.25*g)}"/>`+[0,1,2,3,4,5,6,7].map(k=>{const a=k/8*TAU;return `<line x1="${f(Math.cos(a)*48)}" y1="${f(Math.sin(a)*48)}" x2="${f(Math.cos(a)*(62+g*18))}" y2="${f(Math.sin(a)*(62+g*18))}" stroke="#ffd23f" stroke-width="6" stroke-linecap="round" opacity="${f(g)}"/>`;}).join(''):'')+
    `<path d="M-40 0 Q0 ${f(-34*bl)} 40 0 Q0 ${f(34*bl)} -40 0Z" fill="#fff8e0" stroke="#c98a10" stroke-width="6"/><circle cx="${f(lk)}" r="${f(15*bl)}" fill="#3a6fb5"/><circle cx="${f(lk)}" r="${f(7*bl)}" fill="#141414"/><circle cx="${f(lk+5)}" cy="-5" r="3.5" fill="#fff" opacity="${f(bl)}"/></g>`;};
function leo(o){SP={eye:true,glow:o.glow||0,t:o.t};return guy(Object.assign({x:0,y:0,s:1,seed:1,style:'soft',kit:LK,sprout:true,wind:.15},o));}
function bia(o){SP={eye:false};return guy(Object.assign({x:0,y:0,s:1,seed:5,style:'soft',kit:BK,glasses:true,wind:.15},o));}
function teo(o){SP={eye:false};return guy(Object.assign({x:0,y:0,s:1,seed:7,style:'soft',kit:TK,freckles:true,wind:.15},o));}
function davi(o){SP={eye:false};return guy(Object.assign({x:0,y:0,s:1,seed:9,style:'soft',kit:DK,wind:.15},o));}
async function put(S,fn,P,LS,o){S.mesh.visible=true;S.mesh.scale.setScalar(LS);S.mesh.position.copy(P);await S.set(fn(o));}

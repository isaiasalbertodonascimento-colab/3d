// ================= legendas e linha do tempo =================
const HL=__HL__;
const A_OFF=.05;let SCN=[],GROUPS=[];const norm=w=>w.replace(/[^\wÀ-ÿ]/g,'');
function setup(T){let t=0;T.forEach((b,i)=>{const d=b.dur+.2+(i===T.length-1?1.8:0);SCN.push({s:t,d});
  const words=b.text.toUpperCase().split(/\s+/).filter(Boolean),tot=words.reduce((a,w)=>a+w.length+1,0);let c=t+A_OFF,cur=[];
  words.forEach((w,k)=>{const wd=b.dur*(w.length+1)/tot;cur.push({w,t0:c,t1:c+wd,hl:HL[i].includes(norm(w))});c+=wd;if(cur.length===3||/[.,:!?]$/.test(w)||k===words.length-1){GROUPS.push({words:cur,t0:cur[0].t0,end:t+d});cur=[];}});t+=d;});
  for(let g=0;g<GROUPS.length-1;g++)GROUPS[g].end=Math.min(GROUPS[g].end,GROUPS[g+1].t0);GROUPS[GROUPS.length-1].end=t-1.8;
  SC.forEach((sc,i)=>sc.setup(SCN[i].d));return{total:t,scenes:SCN};}
function caption(t){const g=GROUPS.find(g=>t>=g.t0&&t<g.end);if(!g)return'';
  const p=seg(t,g.t0,g.t0+.16),s=.75+.25*back(p),len=g.words.reduce((a,w)=>a+w.w.length+1,0),sz=Math.min(112,940/(len*.47));
  const sp=g.words.map(w=>{const on=t>=w.t0,hl=on&&w.hl,j=hl?Math.sin(t*40)*Math.max(0,1-(t-w.t0)*4)*6:0;return `<tspan fill="${on?(w.hl?'#ffd23f':'#ffffff'):'#d9d9d9'}" dy="${f(j)}">${w.w}</tspan>`;}).join(' ');
  return `<g transform="translate(540 1560) scale(${s.toFixed(3)})"><text class="cap" y="8" font-size="${f(sz)}" fill="#000" stroke="#000" stroke-width="18" opacity=".4" text-anchor="middle">${g.words.map(w=>w.w).join(' ')}</text><text class="cap" font-size="${f(sz)}" stroke="#111" stroke-width="18" text-anchor="middle">${sp}</text></g>`;}
let CUR=-1;
window.render=async function(t){
  let i=SCN.findIndex(s=>t>=s.s&&t<s.s+s.d);if(i<0)i=SCN.length-1;const u=t-SCN[i].s,d=SCN[i].d;
  if(i!==CUR){CUR=i;mood(SC[i].mood);}
  SPR.forEach(s=>s.mesh.visible=false);FOVMUL=1;FOCUS=null;AP=.002;BL=[.55,.6,.82];flashL.intensity=0;zapL.intensity=0;
  HOUSES.forEach(H=>H.g.position.set(H.x,0,H.z));SHOCK.material.opacity=0;RINGS.forEach(r=>r.material.opacity=0);
  const ui=await SC[i].up(u,d,t);
  cam.fov=(SC[i].fov||50)*FOVMUL;cam.updateProjectionMatrix();
  SPR.forEach(s=>{if(s.mesh.visible)bill(s);});
  bokeh.uniforms.focus.value=cam.position.distanceTo(FOCUS||V(0,0,0));bokeh.uniforms.aperture.value=AP;bokeh.uniforms.maxblur.value=AP>.005?.012:.006;
  bloom.strength=BL[0];bloom.radius=BL[1];bloom.threshold=BL[2];
  bokeh.enabled=AP>.0025;composer.render();
  document.getElementById('ui').innerHTML=ui;document.getElementById('caps').innerHTML=caption(t);
  document.getElementById('flash').setAttribute('opacity',i>0?f(.5*(1-seg(u,0,.2))):'0');
  const fr=Math.floor(t*30),gr=document.getElementById('grain');gr.setAttribute('x',f(-60+rnd(fr)*60));gr.setAttribute('y',f(-60+rnd(fr+5)*60));
};
window.INFO=setup(window.TIMING);window.GROUPS=GROUPS;
window.EVENTS=EV.map(([s,u,n,g])=>({t:+(SCN[s].s+u).toFixed(3),name:n,gain:g}));
window.WINDCURVE=[];for(let t=0;t<window.INFO.total;t+=.1){const i=Math.max(0,SCN.findIndex(s=>t>=s.s&&t<s.s+s.d));window.WINDCURVE.push(+SC[i].rain(t-SCN[i].s,SCN[i].d).toFixed(3));}
window.DBG={cam,scene,renderer,THREE};
await window.render(0);
window.ready=true;

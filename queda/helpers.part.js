function tex(w,h,draw,rep){const c=document.createElement('canvas');c.width=w;c.height=h;draw(c.getContext('2d'),w,h);const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=8;if(rep){t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(rep[0],rep[1]);}return t;}
function gnoise(g,w,h,a){const im=g.getImageData(0,0,w,h);for(let i=0;i<im.data.length;i+=4){const v=(R()-.5)*a;im.data[i]+=v;im.data[i+1]+=v;im.data[i+2]+=v;}g.putImageData(im,0,0);}
function M3(geo,mat,par,x=0,y=0,z=0){const m=new THREE.Mesh(geo,mat);m.position.set(x,y,z);m.castShadow=m.receiveShadow=true;par.add(m);return m;}
const B3=(w,h,d,mat,par,x,y,z)=>M3(new THREE.BoxGeometry(w,h,d),mat,par,x,y,z);
const softT=tex(128,128,g=>{const r=g.createRadialGradient(64,64,0,64,64,64);r.addColorStop(0,'rgba(255,255,255,1)');r.addColorStop(.4,'rgba(255,255,255,.4)');r.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=r;g.fillRect(0,0,128,128);});
function glowSpr(par,col,size,x,y,z){const m=new THREE.Mesh(new THREE.PlaneGeometry(size,size),new THREE.MeshBasicMaterial({map:softT,color:col,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,toneMapped:false,fog:false}));m.position.set(x,y,z);par.add(m);m.userData.glow=1;return m;}

// ---------- personagem fixo (original) ----------
const HERO=sprite(CHAR_VB,.75,scene,true),BIG=sprite([-1000,-1000,2000,2000],.55,scene,true),CREA=sprite([-300,-300,600,600],.8,scene,true);
const BOYK={hairStyle:'short',hair:'#5a3a24',skin:'#c99568',shirt:'#d2a032',pants:'#45607f',sleeveStripe:'#b8891f'};
const PHONE_SVG=(rot=-10)=>`<g transform="translate(0 128) rotate(${rot})"><rect x="-24" y="-44" width="48" height="86" rx="10" fill="#17171b"/><rect x="-18" y="-36" width="36" height="68" rx="5" fill="#9fd0ff"/><rect x="-18" y="-36" width="36" height="20" fill="#cfe8ff" opacity=".6"/></g>`;
window.sprout=()=>'';
function kid(o){return guy(Object.assign({x:0,y:0,s:1,seed:2,style:'soft',kit:BOYK,phones:true,phoneColor:'#1b1b1f',backpack:'#83868d',holdR:o.noPhone?'':PHONE_SVG(),wind:.05},o));}
async function put(S,fn,P,LS,o){S.mesh.visible=true;S.mesh.scale.setScalar(LS);S.mesh.position.copy(P);await S.set(fn(o));}

// ---------- SVG: HUD, legendas, efeitos ----------
function gaugeSVG(x,y,r,v,vmax=80){const a0=135,a1=405,A=k=>(a0+(a1-a0)*k)*Math.PI/180;let h=`<circle cx="${x}" cy="${y}" r="${r+16}" fill="#1a1618" opacity=".92"/><circle cx="${x}" cy="${y}" r="${r}" fill="#f2ead8"/>`;
  for(let k=0;k<=vmax;k+=10){const a=A(k/vmax);h+=`<line x1="${f(x+Math.cos(a)*r*.8)}" y1="${f(y+Math.sin(a)*r*.8)}" x2="${f(x+Math.cos(a)*r*.95)}" y2="${f(y+Math.sin(a)*r*.95)}" stroke="#1a1618" stroke-width="6"/><text x="${f(x+Math.cos(a)*r*.64)}" y="${f(y+Math.sin(a)*r*.64+r*.05)}" class="mt" font-size="${f(r*.13)}" fill="#1a1618" text-anchor="middle">${k}</text>`;}
  const ar=(k0,k1)=>{const p=A(k0),q=A(k1);return `M${f(x+Math.cos(p)*r*.88)} ${f(y+Math.sin(p)*r*.88)} A${f(r*.88)} ${f(r*.88)} 0 0 1 ${f(x+Math.cos(q)*r*.88)} ${f(y+Math.sin(q)*r*.88)}`;};
  const a=A(cl(v/vmax))+Math.sin(v*7)*.01;
  return h+`<path d="${ar(60/vmax,1)}" stroke="#e0402a" stroke-width="14" fill="none" opacity=".8"/><line x1="${x}" y1="${y}" x2="${f(x+Math.cos(a)*r*.82)}" y2="${f(y+Math.sin(a)*r*.82)}" stroke="#e0402a" stroke-width="12" stroke-linecap="round"/><circle cx="${x}" cy="${y}" r="22" fill="#1a1618"/><text x="${x}" y="${f(y+r*.5)}" class="mt" font-size="${f(r*.3)}" fill="#1a1618" text-anchor="middle">${Math.round(v)}</text><text x="${x}" y="${f(y+r*.72)}" class="mt" font-size="${f(r*.12)}" fill="#5a5050" text-anchor="middle">KM/H</text>`;}
function floorSVG(x,y,n,w=340,h=250,bl=1){return `<rect x="${x-w/2-16}" y="${y-h/2-16}" width="${w+32}" height="${h+32}" rx="26" fill="#1a1618" opacity=".95"/><rect x="${x-w/2}" y="${y-h/2}" width="${w}" height="${h}" rx="16" fill="#2a0c0a"/><circle cx="${x}" cy="${y}" r="${w*.55}" fill="#ff3a20" opacity="${f(.12*bl)}" filter="url(#glow)"/><text x="${x+30}" y="${f(y+h*.27)}" class="mt" font-size="${f(h*.72)}" fill="#ff4a2a" opacity="${f(bl)}" text-anchor="middle">${String(n).padStart(2,'0')}</text><path d="M${f(x-w*.36)} ${f(y+40)} l-30 -50 h60Z" fill="#ff4a2a" opacity="${f(bl)}"/><text x="${x}" y="${f(y-h/2-40)}" class="mt" font-size="40" fill="#e8d8c8" text-anchor="middle">ANDAR</text>`;}
function sparksSVG(x,y,t,n=26,spread=1,seed=0,dirx=1,g=1){let h=`<circle cx="${f(x)}" cy="${f(y)}" r="180" fill="url(#sglow)"/>`;
  for(let i=0;i<n;i++){const ph=(t*2.2+rnd(i+seed))%1,a=(-90+(rnd(i*3+seed)-.5)*160*spread)*Math.PI/180,v=300+rnd(i+9+seed)*700,px=x+Math.cos(a)*v*ph*dirx,py=y+Math.sin(a)*v*ph+900*ph*ph*g,ln=18+30*(1-ph);
    h+=`<line x1="${f(px)}" y1="${f(py)}" x2="${f(px-Math.cos(a)*ln*dirx)}" y2="${f(py-Math.sin(a)*ln-30*ph)}" stroke="${['#ffd070','#ff9a3a','#fff0c0'][i%3]}" stroke-width="${f(6*(1-ph)+1.5)}" stroke-linecap="round" opacity="${f(1-ph)}"/>`;}return h;}
function capSVG(words,p,y,size,hl){if(p<=0||!words.length)return'';const k=p<1?1+.35*Math.exp(-p*9)*Math.cos(p*14):1,len=words.join(' ').length,sz=Math.min(size,960/(len*.74));
  const sp=words.map(w=>`<tspan fill="${hl.has(w.replace(/[.,!?…]/g,''))||hl.has(w)?'#ffd23f':'#ffffff'}">${w}</tspan>`).join(' ');
  return `<g transform="translate(540 ${f(y)}) scale(${f(k*cl(p*4))})"><text class="mt" y="${f(sz*.36+8)}" font-size="${f(sz)}" fill="#000" opacity=".35" stroke="#000" stroke-width="${f(sz*.22)}" text-anchor="middle">${words.join(' ')}</text><text class="mt" y="${f(sz*.36)}" font-size="${f(sz)}" stroke="#000" stroke-width="${f(sz*.2)}" text-anchor="middle">${sp}</text></g>`;}
const dark=a=>a>0?`<rect width="1080" height="1920" fill="#000" opacity="${f(a)}"/>`:'';
// queda: altura do piso da cabina no tempo absoluto (15º andar -> entre 4º e 3º)
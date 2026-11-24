// ================= sprites 2D (personagens originais, estilo macio) =================
const K=.0021,HEADY=712*K,HX=0;
const CHVB=[-640,-680,1280,1520],SQVB=[-1000,-1000,2000,2000];
const SPRS=[];
function sprite(vb,res,par=scene,halo=false){
  const [vx,vy,vw,vh]=vb,cw=Math.round(vw*res),ch=Math.round(vh*res);
  const c=document.createElement('canvas');c.width=cw;c.height=ch;const g=c.getContext('2d');
  const tex=new THREE.CanvasTexture(c);tex.colorSpace=THREE.SRGBColorSpace;tex.anisotropy=4;
  const geo=new THREE.PlaneGeometry(vw*K,vh*K);geo.translate((vx+vw/2)*K,-(vy+vh/2)*K,0);
  const mat=new THREE.MeshBasicMaterial({map:tex,alphaTest:halo?.02:.5,transparent:halo,side:THREE.DoubleSide,toneMapped:false});
  const m=new THREE.Mesh(geo,mat);m.castShadow=true;m.customDepthMaterial=new THREE.MeshDepthMaterial({depthPacking:THREE.RGBADepthPacking,map:tex,alphaTest:.5});par.add(m);
  const s={mesh:m,last:'',async set(inner){if(inner===s.last)return;s.last=inner;const img=new Image();img.src='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb.join(' ')}" width="${cw}" height="${ch}">${inner}</svg>`);await img.decode();g.clearRect(0,0,cw,ch);g.drawImage(img,0,0,cw,ch);tex.needsUpdate=true;}};
  SPRS.push(s);return s;
}
const CAIO={hairStyle:'short',hair:'#1a1412',skin:'#8a5634',shirt:'#d9962a',pants:'#2b3a4a',sleeveStripe:'#2aa198'};
const DITO={hairStyle:'short',hair:'#d8d4cc',skin:'#d79a6c',shirt:'#3d6b4a',pants:'#4a4038',sleeveStripe:'#f2e8d0'};
const CIDA={hairStyle:'bun',hair:'#cfcbd6',skin:'#e8b48a',shirt:'#7a2a3a',pants:'#3a3346',sleeveStripe:'#e8c58a'};
const JUCA={hairStyle:'curly',hair:'#3a2418',skin:'#c98450',shirt:'#4a6fd0',pants:'#2a3756',sleeveStripe:'#ffd23f'};
const caio=o=>guy(Object.assign({x:0,y:0,s:1,style:'soft',seed:1,kit:CAIO,phones:true},o));
const dito=o=>guy(Object.assign({x:0,y:0,s:1,style:'soft',seed:4,kit:DITO,mustache:true,glasses:true},o));
const cida=o=>guy(Object.assign({x:0,y:0,s:1,style:'soft',seed:7,kit:CIDA,glasses:true},o));
const juca=o=>guy(Object.assign({x:0,y:0,s:1,style:'soft',seed:9,kit:JUCA,kid:true,freckles:true},o));
// objetos na mão (origem da mão em 0,128 no braço)
const phoneSVG=(scr='#5ab0ff',rot=-10)=>`<g transform="translate(0 128) rotate(${rot})"><rect x="-40" y="-80" width="80" height="150" rx="16" fill="#1d1d24"/><rect x="-33" y="-70" width="66" height="126" rx="9" fill="${scr}"/><circle cy="62" r="5" fill="#555"/></g>`;
const billSVG=()=>`<g transform="translate(0 128) rotate(-30)"><rect x="-20" y="-150" width="85" height="150" rx="8" fill="#8fd08a" stroke="#3f7a3f" stroke-width="6"/><circle cx="22" cy="-75" r="24" fill="none" stroke="#3f7a3f" stroke-width="6"/><text x="22" y="-64" font-family="Anton" font-size="34" fill="#3f7a3f" text-anchor="middle">$</text></g>`;
const pieSVG=()=>`<g transform="translate(0 110)"><ellipse cy="10" rx="120" ry="34" fill="#e9e3d6" stroke="#b8b0a0" stroke-width="5"/><path d="M-100 0 Q0 -60 100 0 Q0 24 -100 0Z" fill="#d9944a" stroke="#a8652a" stroke-width="6"/><path d="M-60 -12 L-30 -30 M-10 -36 L20 -20 M40 -28 L70 -10" stroke="#a8652a" stroke-width="7" stroke-linecap="round"/></g>`;
const flashSVG=()=>`<g transform="translate(0 128) rotate(-80)"><rect x="-16" y="-20" width="32" height="90" rx="7" fill="#c8322e"/><rect x="-21" y="60" width="42" height="26" rx="5" fill="#33363d"/></g>`;

// ================= RUA (bairro do exemplo + mercadinho) =================
const SKY_EXTRA={};

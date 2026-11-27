const renderer=new THREE.WebGLRenderer({canvas:document.getElementById('gl'),antialias:true,preserveDrawingBuffer:true});
renderer.setPixelRatio(1);renderer.setSize(1080,1920,false);
renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.0;
const scene=new THREE.Scene();
const cam=new THREE.PerspectiveCamera(50,1080/1920,.05,1500);
const V=(x,y,z)=>new THREE.Vector3(x,y,z);
let SEED=11;const R=()=>{SEED=(SEED*16807)%2147483647;return SEED/2147483647;};
const TAU=Math.PI*2;
function ctex(w,h,draw,rep){const c=document.createElement('canvas');c.width=w;c.height=h;draw(c.getContext('2d'),w,h);const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=8;if(rep){t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(rep[0],rep[1]);}return t;}
function noise(g,w,h,amt){const im=g.getImageData(0,0,w,h);for(let i=0;i<im.data.length;i+=4){const v=(R()-.5)*amt;im.data[i]+=v;im.data[i+1]+=v;im.data[i+2]+=v;}g.putImageData(im,0,0);}
function blotch(g,w,h,n,col,a,r=60){for(let i=0;i<n;i++){g.fillStyle=col.replace('A',(R()*a).toFixed(3));g.beginPath();g.ellipse(R()*w,R()*h,r*(.3+R()),r*(.2+R()*.6),R()*3,0,7);g.fill();}}
const std=o=>new THREE.MeshStandardMaterial(Object.assign({roughness:.9,metalness:0},o));
function mesh(geo,mat,par,x=0,y=0,z=0){const m=new THREE.Mesh(geo,mat);m.position.set(x,y,z);m.castShadow=m.receiveShadow=true;par.add(m);return m;}
const box=(w,h,d,mat,par,x,y,z)=>mesh(new THREE.BoxGeometry(w,h,d),mat,par,x,y,z);
const soft=ctex(256,256,(g)=>{const r=g.createRadialGradient(128,128,0,128,128,128);r.addColorStop(0,'rgba(255,255,255,1)');r.addColorStop(.35,'rgba(255,255,255,.45)');r.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=r;g.fillRect(0,0,256,256);});
const puffTex=ctex(256,256,(g)=>{for(let i=0;i<26;i++){const x=128+(R()-.5)*120,y=128+(R()-.5)*110,r=30+R()*55;const gr=g.createRadialGradient(x,y,0,x,y,r);gr.addColorStop(0,'rgba(255,255,255,.55)');gr.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=gr;g.fillRect(0,0,256,256);}});
const cloudTex=ctex(512,256,(g)=>{for(let i=0;i<40;i++){const x=90+R()*330,y=110+(R()-.3)*70,r=40+R()*70;const gr=g.createRadialGradient(x,y,0,x,y,r);gr.addColorStop(0,'rgba(255,255,255,.75)');gr.addColorStop(.6,'rgba(255,255,255,.35)');gr.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=gr;g.fillRect(0,0,512,256);}
  const sh=g.createLinearGradient(0,120,0,240);sh.addColorStop(0,'rgba(120,130,160,0)');sh.addColorStop(1,'rgba(120,130,160,.35)');g.globalCompositeOperation='source-atop';g.fillStyle=sh;g.fillRect(0,0,512,256);});
const leafTex=ctex(64,64,(g)=>{g.fillStyle='#fff';g.beginPath();g.ellipse(32,32,28,15,0,0,7);g.fill();g.strokeStyle='rgba(0,0,0,.35)';g.lineWidth=3;g.beginPath();g.moveTo(6,32);g.lineTo(58,32);g.stroke();});

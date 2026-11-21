// ================= ELEVADOR: personagem, cenários e cenas =================
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

// ---------- CIDADE: centro antigo de SP, fim de tarde ----------
const CITY=new THREE.Group();scene.add(CITY);const CT={};
{
  const facade=(base,cols,rows,lit,deco)=>{const mk=(em)=>tex(1024,2048,(g,w,h)=>{g.fillStyle=em?'#000':base;g.fillRect(0,0,w,h);if(!em){gnoise(g,w,h,14);for(let i=0;i<900;i++){g.fillStyle=`rgba(${R()>.5?'255,240,220':'60,40,30'},${R()*.06})`;g.fillRect(R()*w,R()*h,30+R()*60,4+R()*8);}}
      const cw=w/cols,rh=h/rows;for(let r=0;r<rows;r++){if(!em){g.fillStyle='rgba(60,40,30,.35)';g.fillRect(0,r*rh,w,10);g.fillStyle='rgba(255,240,220,.25)';g.fillRect(0,r*rh+10,w,4);}
        for(let c=0;c<cols;c++){if(r===rows-1&&deco&&c>=Math.floor(cols/2)-1&&c<=Math.floor(cols/2)+1)continue;const x=c*cw+cw*.22,y=r*rh+rh*.25,ww=cw*.56,hh=rh*.6,L=rnd(r*31+c*7+lit)<.28;
          if(em){if(L){g.fillStyle='#ffcf8a';g.fillRect(x,y,ww,hh);}continue;}
          g.fillStyle='#3a3238';g.fillRect(x-6,y-6,ww+12,hh+12);g.fillStyle=L?'#ffcf8a':'#4a4456';g.fillRect(x,y,ww,hh);g.fillStyle='rgba(255,255,255,.12)';g.fillRect(x,y,ww*.4,hh);g.fillStyle='#3a3238';g.fillRect(x+ww/2-3,y,6,hh);g.fillRect(x,y+hh*.4,ww,6);
          if(deco){g.fillStyle='rgba(255,235,210,.5)';g.fillRect(x-14,y+hh+6,ww+28,10);}}}
      if(deco&&!em){for(let c=0;c<=cols;c+=2){g.fillStyle='rgba(255,240,220,.18)';g.fillRect(c*cw-10,0,20,h);}}});return [mk(false),mk(true)];};
  const [fA,eA]=facade('#c4ab8e',5,12,1,true),[fB,eB]=facade('#9a8a7e',4,9,2,false),[fC,eC]=facade('#b69a8a',4,8,3,false);
  const side=std({color:'#a8907a'});
  const bld=(w,h,d,x,z,f,e)=>{const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),[side,side,side,side,new THREE.MeshStandardMaterial({map:f,emissive:'#ffffff',emissiveMap:e,emissiveIntensity:1.1,roughness:.9}),side]);m.position.set(x,h/2,z-d/2);m.castShadow=m.receiveShadow=true;CITY.add(m);return m;};
  bld(15,40,12,0,0,fA,eA);bld(13,30,12,-15,-2,fB,eB);bld(12,26,12,14.5,-1,fC,eC);bld(14,34,12,-30,-4,fB,eB);bld(14,30,12,29,-3,fC,eC);
  for(let k=1;k<13;k++)B3(15.6,.22,.5,std({color:'#8a7462'}),CITY,0,k*40/12,.2);
  // entrada: marquise, porta iluminada, letreiro
  B3(4.6,.3,1.8,std({color:'#5a463a'}),CITY,0,3.5,.9);
  const door=M3(new THREE.PlaneGeometry(2.6,3.1),new THREE.MeshBasicMaterial({color:'#ffd9a0',toneMapped:false}),CITY,0,1.55,.02);
  B3(.12,3.1,.12,std({color:'#3a2a24'}),CITY,0,1.55,.06);B3(2.9,.16,.2,std({color:'#3a2a24'}),CITY,0,3.15,.06);
  CT.doorL=new THREE.PointLight('#ffc070',18,9,1.4);CT.doorL.position.set(0,1.8,1.4);CITY.add(CT.doorL);
  const signT=tex(1024,160,(g,w,h)=>{g.fillStyle='#2a201c';g.fillRect(0,0,w,h);g.fillStyle='#e8c58a';g.font='90px Anton';g.textAlign='center';g.fillText('EDIFÍCIO AURORA · 1938',w/2,118);});
  M3(new THREE.PlaneGeometry(4.2,.66),new THREE.MeshStandardMaterial({map:signT,emissive:'#ffffff',emissiveMap:signT,emissiveIntensity:.25}),CITY,0,4.1,.04);
  // calçada de pedra portuguesa, meio-fio e rua
  const ppT=tex(512,512,(g,w,h)=>{g.fillStyle='#d9cfc2';g.fillRect(0,0,w,h);g.fillStyle='#2e2a2e';for(let y=0;y<h;y+=128){g.beginPath();g.moveTo(0,y+64);for(let x=0;x<=w;x+=8)g.lineTo(x,y+64+Math.sin(x/w*TAU*2)*36);for(let x=w;x>=0;x-=8)g.lineTo(x,y+88+Math.sin(x/w*TAU*2)*36);g.fill();}
    g.strokeStyle='rgba(0,0,0,.18)';for(let i=0;i<1600;i++){g.lineWidth=1;g.strokeRect(R()*w,R()*h,8+R()*6,8+R()*6);}gnoise(g,w,h,18);},[10,2]);
  const sw=M3(new THREE.PlaneGeometry(80,8),std({map:ppT,roughness:.8}),CITY,0,0,4);sw.rotation.x=-Math.PI/2;
  B3(80,.18,.3,std({color:'#9a948a'}),CITY,0,-.03,8.1);
  const asT=tex(512,512,(g,w,h)=>{g.fillStyle='#4a464c';g.fillRect(0,0,w,h);gnoise(g,w,h,30);g.fillStyle='#d8c890';for(let x=0;x<w;x+=128)g.fillRect(x+20,h/2-5,70,10);},[8,3]);
  const st=M3(new THREE.PlaneGeometry(80,30),std({map:asT,roughness:.85}),CITY,0,-.12,23);st.rotation.x=-Math.PI/2;
  // poste antigo
  const pole=new THREE.Group();pole.position.set(4.6,0,6.8);CITY.add(pole);M3(new THREE.CylinderGeometry(.07,.11,5.2,10),std({color:'#23252b',metalness:.5,roughness:.4}),pole,0,2.6,0);
  M3(new THREE.SphereGeometry(.22,14,10),new THREE.MeshBasicMaterial({color:'#ffe2a8',toneMapped:false}),pole,0,5.3,0);glowSpr(pole,'#ffcf8a',2.2,0,5.3,.1);
  // céu do entardecer e luzes
  const skyT=tex(8,1024,(g,w,h)=>{const gr=g.createLinearGradient(0,0,0,h);[[0,'#4e3f6e'],[.28,'#8a6a90'],[.44,'#e89a7a'],[.5,'#ffc98a'],[1,'#ffc98a']].forEach(([o,c])=>gr.addColorStop(o,c));g.fillStyle=gr;g.fillRect(0,0,w,h);});
  CT.sky=new THREE.Mesh(new THREE.SphereGeometry(400,32,16),new THREE.MeshBasicMaterial({map:skyT,side:THREE.BackSide,fog:false,toneMapped:false}));CITY.add(CT.sky);
  CT.sun=new THREE.DirectionalLight('#ffb070',3.2);CT.sun.position.set(40,14,30);CT.sun.castShadow=true;CT.sun.shadow.mapSize.set(2048,2048);Object.assign(CT.sun.shadow.camera,{left:-20,right:20,top:30,bottom:-10,near:1,far:150});CT.sun.shadow.bias=-.0005;CITY.add(CT.sun,CT.sun.target);
  CITY.add(new THREE.HemisphereLight('#ffc9a0','#4a3a5a',.95));
  CT.sunG=glowSpr(CITY,'#ffd9a0',160,180,40,140);
}

// ---------- POÇO DO ELEVADOR (corte lateral) ----------
const FH=3,NF=16,TOPY=NF*FH;
const SHAFT=new THREE.Group();scene.add(SHAFT);const SH={};
{
  const concT=tex(512,512,(g,w,h)=>{g.fillStyle='#7a6e66';g.fillRect(0,0,w,h);gnoise(g,w,h,34);for(let i=0;i<60;i++){g.fillStyle=`rgba(30,20,20,${R()*.18})`;g.beginPath();g.ellipse(R()*w,R()*h,20+R()*60,8+R()*30,R()*3,0,7);g.fill();}g.fillStyle='rgba(0,0,0,.25)';for(let y=0;y<h;y+=128)g.fillRect(0,y,w,4);},[1,14]);
  const conc=std({map:concT,roughness:.95});
  M3(new THREE.PlaneGeometry(2.8,TOPY+8),conc,SHAFT,0,TOPY/2,-1.3);
  SH.walls=[-1.4,1.4].map(x=>{const m=M3(new THREE.PlaneGeometry(2.6,TOPY+8),conc,SHAFT,x,TOPY/2,0);m.rotation.y=x<0?Math.PI/2:-Math.PI/2;return m;});
  const slab=std({color:'#8d8379',roughness:.9}),cutM=std({color:'#6a5e56'});
  const numT=n=>tex(256,128,(g,w,h)=>{g.fillStyle='#2a2224';g.fillRect(0,0,w,h);g.fillStyle='#f2e6d4';g.font='96px Anton';g.textAlign='center';g.fillText(n+'º',w/2,104);});
  SH.labels=[];
  for(let k=0;k<=NF;k++){const y=k*FH-1.5;
    for(const[xa,xb]of[[-9,-1.4],[1.4,9]])B3(xb-xa,.3,2.6,slab,SHAFT,(xa+xb)/2,y,0);
    if(k<NF){const dm=std({color:'#9a9a9e',metalness:.4,roughness:.4});B3(1.1,2.1,.05,dm,SHAFT,0,y+1.2,-1.27);B3(1.3,.12,.08,std({color:'#5a5a60'}),SHAFT,0,y+2.3,-1.26);
      const lb=M3(new THREE.PlaneGeometry(1.0,.5),new THREE.MeshStandardMaterial({map:numT(k+1),emissive:'#ffffff',emissiveMap:numT(k+1),emissiveIntensity:.5}),SHAFT,-3.0,y+1.6,1.31);SH.labels.push(lb);
      // apartamentos cortados: parede do fundo com janela iluminada
      for(const xs of[-5.5,5.5]){B3(7,2.7,.1,std({color:['#b9a48f','#a89a8a','#c2ab92'][k%3]}),SHAFT,xs,y+1.5,-1.25);
        if(rnd(k*3+xs)>.4)M3(new THREE.PlaneGeometry(1.2,1.0),new THREE.MeshBasicMaterial({color:'#ffcf8a',toneMapped:false}),SHAFT,xs+(xs<0?-1.5:1.5),y+1.7,-1.19);}}}
  for(const x of[-1.25,1.25]){B3(.08,TOPY+6,.14,std({color:'#5a5c62',metalness:.6,roughness:.35}),SHAFT,x,TOPY/2,0);for(let y=0;y<TOPY;y+=1.5)B3(.16,.12,.2,std({color:'#3a3c42'}),SHAFT,x,y,0);}
  // casa de máquinas e polia
  B3(3.4,3,2.8,std({color:'#6e625a'}),SHAFT,0,TOPY+3,0);SH.sheave=M3(new THREE.TorusGeometry(.55,.1,10,28),std({color:'#2a2a30',metalness:.6,roughness:.4}),SHAFT,0,TOPY+1,.2);
  // fosso com para-choques
  B3(2.8,.3,2.6,std({color:'#3a3436'}),SHAFT,0,-1.9,0);for(const x of[-.6,.6])M3(new THREE.CylinderGeometry(.18,.22,.9,14),std({color:'#9a2a20'}),SHAFT,x,-1.3,0);
  // cabina (exterior) + garras + cabos + contrapeso
  SH.cab=new THREE.Group();SHAFT.add(SH.cab);
  const cabM=std({color:'#b4a690',roughness:.7}),frM=std({color:'#4a4a52',metalness:.5,roughness:.5});
  B3(2.3,2.5,2.0,cabM,SH.cab,0,1.25,0);B3(2.45,.14,2.1,frM,SH.cab,0,2.57,0);B3(2.45,.14,2.1,frM,SH.cab,0,-.07,0);
  for(const x of[-1.17,1.17])B3(.1,2.9,.18,frM,SH.cab,x,1.25,0);B3(2.4,.16,.2,frM,SH.cab,0,2.9,0);
  SH.jaws=[];for(const x of[-1.25,1.25]){B3(.34,.12,.42,std({color:'#2e3036',metalness:.4}),SH.cab,x,.34,0);B3(.12,.4,.42,std({color:'#2e3036',metalness:.4}),SH.cab,x+(x<0?.14:-.14),.12,0);for(const z of[-1,1]){const j=B3(.16,.32,.07,std({color:'#c9a24a',metalness:.6,roughness:.35}),SH.cab,x,.12,z*.16);j.userData.z=z;SH.jaws.push(j);}}
  SH.cabL=new THREE.PointLight('#ffe2b0',4,6,1.6);SH.cabL.position.set(0,3.4,.6);SH.cab.add(SH.cabL);
  M3(new THREE.SphereGeometry(.07,8,6),new THREE.MeshBasicMaterial({color:'#ffe8c0',toneMapped:false}),SH.cab,0,3.25,.6);
  SH.cables=[-.2,0,.2].map(x=>{const m=M3(new THREE.CylinderGeometry(.025,.025,1,6),std({color:'#2b2b30',metalness:.7,roughness:.35}),SHAFT,x,0,0);return m;});
  SH.cw=B3(.3,2.4,.5,std({color:'#3e3e46'}),SHAFT,1.0,0,-.85);
  SH.hemi=new THREE.HemisphereLight('#8a7a90','#2a2024',.55);SHAFT.add(SH.hemi);
  SH.key=new THREE.DirectionalLight('#ffcf9a',1.2);SH.key.position.set(8,30,14);SHAFT.add(SH.key,SH.key.target);
  SH.spark=new THREE.PointLight('#ff9a3a',0,6,1.4);SHAFT.add(SH.spark);
  // criatura (sombra) — só um sprite no topo da cabina
}
function setCab(y,cabOnly){SH.cab.position.y=y;SH.cables.forEach(c=>{const top=TOPY+1,b=y+2.9,L=Math.max(.1,top-b);c.scale.y=L;c.position.y=b+L/2;c.visible=!cabOnly;});SH.cw.position.y=Math.max(-1,TOPY-2-(y-0)*.9);}

// ---------- CABINA (interior) ----------
const CAB=new THREE.Group();scene.add(CAB);const CB={};
{
  const steelT=tex(512,512,(g,w,h)=>{g.fillStyle='#a8a6a2';g.fillRect(0,0,w,h);for(let i=0;i<700;i++){g.fillStyle=`rgba(${R()>.5?255:0},${R()>.5?255:0},${R()>.5?255:0},.05)`;g.fillRect(0,R()*h,w,1+R()*2);}g.fillStyle='rgba(0,0,0,.25)';for(let x=0;x<w;x+=170)g.fillRect(x,0,4,h);gnoise(g,w,h,10);});
  const wall=std({map:steelT,roughness:.45,metalness:.35}),floorT=tex(512,512,(g,w,h)=>{g.fillStyle='#4a3a32';g.fillRect(0,0,w,h);g.strokeStyle='rgba(0,0,0,.35)';g.lineWidth=3;for(let x=0;x<w;x+=64)for(let y=0;y<h;y+=64){g.strokeRect(x+4,y+4,56,56);}gnoise(g,w,h,24);},[2,2]);
  const fl=M3(new THREE.PlaneGeometry(2.2,1.8),std({map:floorT,roughness:.6}),CAB,0,0,-.9);fl.rotation.x=-Math.PI/2;
  const ce=M3(new THREE.PlaneGeometry(2.2,1.8),std({color:'#8a8682'}),CAB,0,2.4,-.9);ce.rotation.x=Math.PI/2;
  M3(new THREE.PlaneGeometry(2.2,2.4),wall,CAB,0,1.2,-1.8);
  for(const x of[-1.1,1.1]){const m=M3(new THREE.PlaneGeometry(1.8,2.4),wall,CAB,x,1.2,-.9);m.rotation.y=x<0?Math.PI/2:-Math.PI/2;}
  B3(2.1,.05,.06,std({color:'#c9b48a',metalness:.7,roughness:.3}),CAB,0,.95,-1.74);for(const x of[-1.04,1.04]){const r=B3(1.6,.05,.06,std({color:'#c9b48a',metalness:.7,roughness:.3}),CAB,x,.95,-.9);r.rotation.y=Math.PI/2;}
  CB.panel=M3(new THREE.PlaneGeometry(1.6,.95),new THREE.MeshBasicMaterial({color:'#fff2d6',toneMapped:false}),CAB,0,2.39,-.9);CB.panel.rotation.x=Math.PI/2;
  CB.light=new THREE.PointLight('#ffe8c8',9,6,1.5);CB.light.position.set(0,2.1,-.7);CAB.add(CB.light);
  CB.hemi=new THREE.HemisphereLight('#ffe2c0','#3a2a24',.6);CAB.add(CB.hemi);
  CB.red=new THREE.PointLight('#ff2a1a',0,5,1.5);CB.red.position.set(.8,2.2,-.4);CAB.add(CB.red);
  // painel de botões (canvas: 1..15) na parede da direita
  CB.btnT=(lit)=>tex(256,640,(g,w,h)=>{g.fillStyle='#c9c8c6';g.fillRect(0,0,w,h);g.strokeStyle='#7a7a80';g.lineWidth=8;g.strokeRect(4,4,w-8,h-8);
    for(let n=1;n<=15;n++){const c=(n-1)%3,r=4-Math.floor((n-1)/3),x=52+c*76,y=140+r*100;g.fillStyle='#8e8e94';g.beginPath();g.arc(x,y,32,0,7);g.fill();g.fillStyle=lit&&n===15?'#ffb24a':'#ece9e2';g.beginPath();g.arc(x,y,25,0,7);g.fill();g.fillStyle=lit&&n===15?'#5a2a00':'#3a3a40';g.font='bold 26px sans-serif';g.textAlign='center';g.fillText(n,x,y+9);}
    g.fillStyle='#3a3a40';g.font='bold 22px sans-serif';g.textAlign='center';g.fillText('8 PESSOAS · 600 KG',w/2,60);});
  CB.btn0=CB.btnT(false);CB.btn1=CB.btnT(true);
  CB.pan=M3(new THREE.PlaneGeometry(.4,1.0),new THREE.MeshStandardMaterial({map:CB.btn0,roughness:.5,emissive:'#ffffff',emissiveMap:CB.btn0,emissiveIntensity:.08}),CAB,1.09,1.25,-.25);CB.pan.rotation.y=-Math.PI/2;
  // portas e hall
  const dm=std({map:steelT,roughness:.35,metalness:.5});CB.doors=[-1,1].map(s=>B3(1.1,2.3,.05,dm,CAB,s*.55,1.15,.05));
  const hall=std({color:'#8a6e58',roughness:.85});B3(2.2,4,.1,hall,CAB,-2.2,1.6,.12);B3(2.2,4,.1,hall,CAB,2.2,1.6,.12);B3(2.2,1.6,.1,hall,CAB,0,3.15,.12);
  B3(2.4,.12,.16,std({color:'#c9a24a',metalness:.7,roughness:.3}),CAB,0,2.36,.14);
  CB.dispC=document.createElement('canvas');CB.dispC.width=256;CB.dispC.height=128;CB.dispT=new THREE.CanvasTexture(CB.dispC);CB.dispT.colorSpace=THREE.SRGBColorSpace;
  M3(new THREE.PlaneGeometry(.5,.25),new THREE.MeshBasicMaterial({map:CB.dispT,toneMapped:false}),CAB,0,2.62,.18);
  CB.phone=M3(new THREE.PlaneGeometry(.09,.17),new THREE.MeshStandardMaterial({map:tex(64,128,(g,w,h)=>{g.fillStyle='#17171b';g.fillRect(0,0,w,h);g.fillStyle='#5a7a9a';g.fillRect(6,8,w-12,h-16);g.strokeStyle='#fff';g.lineWidth=2;for(const[a,b,c,d]of[[30,50,8,20],[30,50,56,24],[30,50,58,100],[30,50,10,96],[30,50,40,120]]){g.beginPath();g.moveTo(a,b);g.lineTo(c,d);g.stroke();}}),roughness:.3}),CAB,.45,.006,-.55);CB.phone.rotation.x=-Math.PI/2;CB.phone.rotation.z=.6;
}
let DISP=-1;function setDisp(n,dim=1){const k=n+'|'+dim;if(k===DISP)return;DISP=k;const g=CB.dispC.getContext('2d');g.fillStyle='#1a0606';g.fillRect(0,0,256,128);g.fillStyle=`rgba(255,74,42,${dim})`;g.font='96px Anton';g.textAlign='center';g.fillText(String(n).padStart(2,'0'),150,104);g.beginPath();g.moveTo(40,90);g.lineTo(20,50);g.lineTo(60,50);g.fill();CB.dispT.needsUpdate=true;}

// ---------- seletor de cenário ----------
function setWorld(w){mood('night');TOWN.visible=false;ROOM.visible=false;CITY.visible=w==='city';SHAFT.visible=w==='shaft';CAB.visible=w==='cab';
  scene.background=new THREE.Color(w==='city'?'#e9b08a':'#0e0a0c');scene.fog=w==='city'?new THREE.Fog('#e9b08a',22,170):new THREE.FogExp2(w==='shaft'?'#1a1216':'#140e10',w==='shaft'?.035:.06);
  renderer.toneMappingExposure=w==='city'?1.0:1.1;
  SPR.forEach(s=>{s.mesh.material.color.set(w==='city'?'#ffe8d6':'#ffffff');s.mesh.material.emissiveIntensity=w==='city'?.42:.35;});}

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
function capSVG(words,p,y,size,hl){if(p<=0||!words.length)return'';const k=p<1?1+.35*Math.exp(-p*9)*Math.cos(p*14):1,len=words.join(' ').length,sz=Math.min(size,1000/(len*.62));
  const sp=words.map(w=>`<tspan fill="${hl.has(w.replace(/[.,!?…]/g,''))||hl.has(w)?'#ffd23f':'#ffffff'}">${w}</tspan>`).join(' ');
  return `<g transform="translate(540 ${f(y)}) scale(${f(k*cl(p*4))})"><text class="mt" y="${f(sz*.36+8)}" font-size="${f(sz)}" fill="#000" opacity=".35" stroke="#000" stroke-width="${f(sz*.22)}" text-anchor="middle">${words.join(' ')}</text><text class="mt" y="${f(sz*.36)}" font-size="${f(sz)}" stroke="#000" stroke-width="${f(sz*.2)}" text-anchor="middle">${sp}</text></g>`;}
const dark=a=>a>0?`<rect width="1080" height="1920" fill="#000" opacity="${f(a)}"/>`:'';
// queda: altura do piso da cabina no tempo absoluto (15º andar -> entre 4º e 3º)
function cabY(t){if(t<12)return lerp(11*FH,14*FH,ease(seg(t,9,12)));if(t<15)return 14*FH;const ff=t-15;if(t<31.3)return Math.max(8.6,14*FH-.173*ff*ff);return lerp(8.6,7.5,eo(seg(t,31.3,33.3)));}
function speed(t){if(t<15)return 0;if(t<28.6)return Math.min(60,(t-15)*7.2);return 60*(1-eo(seg(t,28.6,33.3)));}

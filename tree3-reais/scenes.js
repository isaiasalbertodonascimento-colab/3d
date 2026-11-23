// ===================== TREE(3): cenas (inserido no index.html pelo build.py) =====================
const K=.0021,CHAR_VB=[-560,-600,1120,1360],FLY_VB=[-1000,-1000,2000,2000];
const SPR=[];
function sprite(vb,res,halo=false){const [vx,vy,vw,vh]=vb,cw=Math.round(vw*res),ch=Math.round(vh*res);const c=document.createElement('canvas');c.width=cw;c.height=ch;const g=c.getContext('2d');
  const tex=new THREE.CanvasTexture(c);tex.colorSpace=THREE.SRGBColorSpace;tex.anisotropy=8;const geo=new THREE.PlaneGeometry(vw*K,vh*K);geo.translate((vx+vw/2)*K,-(vy+vh/2)*K,0);
  const mat=new THREE.MeshStandardMaterial({map:tex,alphaTest:halo?.02:.5,transparent:halo,side:THREE.DoubleSide,roughness:1,metalness:0,emissive:'#ffffff',emissiveMap:tex,emissiveIntensity:.42});
  const m=new THREE.Mesh(geo,mat);m.castShadow=true;m.receiveShadow=true;m.customDepthMaterial=new THREE.MeshDepthMaterial({depthPacking:THREE.RGBADepthPacking,map:tex,alphaTest:.5});scene.add(m);
  const s={mesh:m,last:'',full:false,async set(inner){if(inner===s.last)return;s.last=inner;const img=new Image();img.src='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb.join(' ')}" width="${cw}" height="${ch}">${inner}</svg>`);await img.decode();g.clearRect(0,0,cw,ch);g.drawImage(img,0,0,cw,ch);tex.needsUpdate=true;}};
  SPR.push(s);return s;}
const HERO=sprite(CHAR_VB,.85,true),HEADS=sprite([-240,-260,480,520],1.1),FLY=sprite(FLY_VB,.6,true);
// herói original: cabelo castanho curto, óculos, agasalho roxo com listra dourada
const HK={hairStyle:'short',hair:'#4a2f22',skin:'#eaa676',shirt:'#3d2f6e',pants:'#2e2a4a',sleeveStripe:'#f2c14e'};
function hero(o){return guy(Object.assign({x:0,y:0,s:1,style:'soft',seed:1,kit:HK,glasses:true,wind:.15},o));}
const HELMET=`<circle cx="0" cy="-20" r="265" fill="#bfe6ff" fill-opacity=".10" stroke="#e8f6ff" stroke-width="9" stroke-opacity=".75"/><path d="M-170 -150 q60 -90 170 -105" stroke="#fff" stroke-width="20" opacity=".55" fill="none" stroke-linecap="round"/><rect x="-120" y="226" width="240" height="34" rx="14" fill="#c9d2de" stroke="#7d848f" stroke-width="5"/>`;
const phoneHold=(r=200,glow='#8fe3ff')=>`<g transform="translate(0 135) rotate(${r})"><rect x="-38" y="-66" width="76" height="132" rx="14" fill="#1d1b26" stroke="#0e0d14" stroke-width="4"/><rect x="-31" y="-57" width="62" height="112" rx="7" fill="${glow}"/><rect x="-20" y="-40" width="40" height="8" rx="4" fill="#fff" opacity=".8"/><rect x="-20" y="-24" width="30" height="6" rx="3" fill="#fff" opacity=".6"/></g>`;
const pencil=(r=150)=>`<g transform="translate(0 135) rotate(${r})"><rect x="-9" y="-70" width="18" height="120" rx="3" fill="#f2c14e" stroke="#9a7410" stroke-width="3"/><rect x="-9" y="-78" width="18" height="14" fill="#e88aa0"/><path d="M-9 50 L0 78 L9 50Z" fill="#f0d0a8"/><path d="M-3 70 L0 78 L3 70Z" fill="#333"/></g>`;
const flag=(t)=>`<g transform="translate(0 135) rotate(180)"><line y1="-40" y2="330" stroke="#c9ced6" stroke-width="12" stroke-linecap="round"/><path d="M6 ${f(300)} q60 ${f(Math.sin(t*6)*14)} 120 0 q60 ${f(-Math.sin(t*6)*14)} 120 0 l0 -130 q-60 ${f(Math.sin(t*6+1)*14)} -120 0 q-60 ${f(-Math.sin(t*6+1)*14)} -120 0Z" fill="#2fa86a" stroke="#14532d" stroke-width="5" transform="scale(1 -1) translate(0 -470)"/><text x="126" y="250" font-family="Anton" font-size="64" fill="#ffd23f" text-anchor="middle" transform="rotate(180 126 228)">R$</text></g>`;

// ---------- dinheiro ----------
const noteT=ctex(512,232,(g,w,h)=>{const gr=g.createLinearGradient(0,0,w,h);gr.addColorStop(0,'#6b9bd2');gr.addColorStop(1,'#2d5a94');g.fillStyle=gr;g.fillRect(0,0,w,h);g.strokeStyle='rgba(255,255,255,.22)';g.lineWidth=2;for(let i=0;i<15;i++){g.beginPath();for(let x=0;x<=w;x+=8)g.lineTo(x,14+i*15+Math.sin(x/30+i)*6);g.stroke();}
  g.fillStyle='rgba(233,242,255,.9)';g.beginPath();g.ellipse(140,116,72,82,0,0,7);g.fill();g.fillStyle='#2d5a94';g.font='64px Anton';g.textAlign='center';g.fillText('R$',140,140);g.fillStyle='#fff';g.font='118px Anton';g.fillText('100',375,160);g.strokeStyle='rgba(233,242,255,.9)';g.lineWidth=8;g.strokeRect(8,8,w-16,h-16);});
const edgeTex=rep=>ctex(64,256,(g,w,h)=>{for(let y=0;y<h;y+=4){g.fillStyle=(y/4)%3?'#e6edf5':'#86a6cc';g.fillRect(0,y,w,4);}grainy(g,w,h,18);},[1,rep]);
const noteM=new THREE.MeshStandardMaterial({map:noteT,side:THREE.DoubleSide,roughness:.7,emissive:'#ffffff',emissiveMap:noteT,emissiveIntensity:.15});
function stack(w,d,rep){const ed=std({map:edgeTex(rep),roughness:.8});const g=new THREE.BoxGeometry(1,1,1);g.translate(0,.5,0);const m=new THREE.Mesh(g,[ed,ed,noteM,ed,ed,ed]);m.castShadow=m.receiveShadow=true;m.scale.set(w,1,d);return m;}
// pilha do quarto (1 metro) e trena
const STK=stack(.156*1.6,.07*1.6,40);STK.position.set(-.35,0,.2);ROOM.add(STK);
const tapeT=ctex(64,1024,(g,w,h)=>{g.fillStyle='#f2c230';g.fillRect(0,0,w,h);g.fillStyle='#222';for(let i=0;i<=100;i++){const y=h-i*h/100;g.fillRect(0,y-1,i%10?18:36,i%10?2:4);}g.font='26px Anton';for(let i=1;i<=10;i++){g.save();g.translate(52,h-i*h/10+8);g.fillText(i*10,-12,0);g.restore();}});
const TAPE=M(new THREE.PlaneGeometry(.06,1),std({map:tapeT,roughness:.5,side:THREE.DoubleSide}),ROOM,-.12,.5,.2);TAPE.geometry.translate(0,0,0);
// notas voando (instanciadas)
const NOTES=new THREE.InstancedMesh(new THREE.PlaneGeometry(.156,.07),noteM,500);NOTES.castShadow=true;NOTES.count=0;NOTES.frustumCulled=false;scene.add(NOTES);
const _o=new THREE.Object3D();
function notesRain(t,c,area,top,sc=1,n=160){NOTES.count=n;for(let i=0;i<n;i++){const ph=(t*.35*(1+rnd(i+3))+rnd(i))%1;_o.position.set(c.x+(rnd(i+1)-.5)*area+Math.sin(t*2+i)*.12,top-ph*top,c.z+(rnd(i+2)-.5)*area+Math.cos(t*1.7+i)*.12);_o.rotation.set(Math.sin(t*3+i)*.9+1.2,t*(1+rnd(i+4)*2)+i,Math.sin(t*2.3+i)*.6);_o.scale.setScalar(sc);_o.updateMatrix();NOTES.setMatrixAt(i,_o.matrix);}NOTES.instanceMatrix.needsUpdate=true;}
function notesBurst(t,c,p,sc=1,n=60,r=1.4){NOTES.count=n;for(let i=0;i<n;i++){const a=rnd(i)*TAU,up=.5+rnd(i+1),k=p*(r*(.4+rnd(i+2)*.6));_o.position.set(c.x+Math.cos(a)*k,c.y+up*k*1.2-p*p*1.2,c.z+Math.sin(a)*k);_o.rotation.set(t*4+i,t*3+i*2,i);_o.scale.setScalar(sc*Math.min(1,p*6));_o.updateMatrix();NOTES.setMatrixAt(i,_o.matrix);}NOTES.instanceMatrix.needsUpdate=true;}
function notesSpiral(t,c,sc,n=220,R0=30){NOTES.count=n;for(let i=0;i<n;i++){const ph=(t*.45+rnd(i))%1,r=R0*(1-ph)+2,a=rnd(i+1)*TAU+t*(1.2+8*ph);_o.position.set(c.x+Math.cos(a)*r,c.y+(rnd(i+2)-.5)*r*.25,c.z+Math.sin(a)*r);_o.rotation.set(t*5+i,t*4,i);_o.scale.set(sc*(1+ph*2),sc*(1-ph*.7),sc);_o.updateMatrix();NOTES.setMatrixAt(i,_o.matrix);}NOTES.instanceMatrix.needsUpdate=true;}
// celular 3D na cama
const PHONE=new THREE.Group();ROOM.add(PHONE);box(.075,.012,.15,std({color:'#1d1b26',roughness:.3}),PHONE,0,0,0);
const PSCR=new THREE.Mesh(new THREE.PlaneGeometry(.064,.135),new THREE.MeshBasicMaterial({color:'#8fe3ff',toneMapped:false}));PSCR.rotation.x=-Math.PI/2;PSCR.position.y=.007;PHONE.add(PSCR);
const PGLOW=new THREE.Mesh(new THREE.PlaneGeometry(.5,.5),new THREE.MeshBasicMaterial({map:soft,color:'#8fe3ff',transparent:true,opacity:.5,depthWrite:false,blending:THREE.AdditiveBlending,fog:false}));PGLOW.rotation.x=-Math.PI/2;PGLOW.position.y=.01;PHONE.add(PGLOW);
PHONE.position.set(1.5,.66,-.2);PHONE.rotation.y=.4;
// segunda cama (sem ninguém embaixo do cobertor) para quando o herói senta
const BED2E=bed(1.15,.4,0,'#1f2a46',0);

// ===================== ESPAÇO =====================
const SPACE=new THREE.Group();scene.add(SPACE);const SP={};
{
  const nebT=ctex(1024,512,(g,w,h)=>{g.fillStyle='#07061a';g.fillRect(0,0,w,h);for(let i=0;i<34;i++){const x=R()*w,y=h*.3+R()*h*.4,r=60+R()*160;const gr=g.createRadialGradient(x,y,0,x,y,r);const c=['rgba(120,60,170,','rgba(40,110,170,','rgba(190,70,130,'][i%3];gr.addColorStop(0,c+(.04+R()*.06)+')');gr.addColorStop(1,c+'0)');g.fillStyle=gr;g.fillRect(0,0,w,h);}});
  SP.neb=new THREE.Mesh(new THREE.SphereGeometry(3000,32,16),new THREE.MeshBasicMaterial({map:nebT,side:THREE.BackSide,fog:false,toneMapped:false,depthWrite:false}));SPACE.add(SP.neb);
  const n=5000,p=new Float32Array(n*3),c=new Float32Array(n*3);for(let i=0;i<n;i++){const u=R()*2-1,a=R()*TAU,s=Math.sqrt(1-u*u);p.set([s*Math.cos(a)*2500,u*2500,s*Math.sin(a)*2500],i*3);const k=.6+R()*.4;c.set(R()>.8?[k,k*.85,k*.7]:[k*.8,k*.9,k],i*3);}
  SP.stars=new THREE.Points(new THREE.BufferGeometry().setAttribute('position',new THREE.BufferAttribute(p,3)).setAttribute('color',new THREE.BufferAttribute(c,3)),new THREE.PointsMaterial({size:3.2,sizeAttenuation:false,vertexColors:true,fog:false,depthWrite:false,toneMapped:false}));SPACE.add(SP.stars);
  // Terra pintada + nuvens + atmosfera
  const earthT=ctex(1024,512,(g,w,h)=>{const gr=g.createLinearGradient(0,0,0,h);gr.addColorStop(0,'#2a5fa8');gr.addColorStop(.5,'#2f73c0');gr.addColorStop(1,'#2a5fa8');g.fillStyle=gr;g.fillRect(0,0,w,h);
    for(let k=0;k<7;k++){const cx=R()*w,cy=h*.22+R()*h*.56;for(let i=0;i<40;i++){g.fillStyle=['#5f9a45','#4f8a3c','#8a7a4a','#6aa84f'][i%4];g.beginPath();g.ellipse(cx+(R()-.5)*170,cy+(R()-.5)*110,20+R()*45,14+R()*30,R()*3,0,7);g.fill();}}
    g.fillStyle='#f4f8ff';g.fillRect(0,0,w,34);g.fillRect(0,h-30,w,30);strokes(g,w,h,700,['#ffffff','#1d4f8f'],50,6,.06);});
  SP.earth=new THREE.Mesh(new THREE.SphereGeometry(6,64,32),std({map:earthT,roughness:.75}));SP.earth.receiveShadow=true;SPACE.add(SP.earth);
  const cloudT=ctex(1024,512,(g,w,h)=>{for(let i=0;i<260;i++){g.fillStyle=`rgba(255,255,255,${.25+R()*.4})`;g.beginPath();g.ellipse(R()*w,h*.12+R()*h*.76,20+R()*70,6+R()*16,(R()-.5)*.4,0,7);g.fill();}});
  SP.clouds=new THREE.Mesh(new THREE.SphereGeometry(6.12,64,32),new THREE.MeshStandardMaterial({map:cloudT,transparent:true,depthWrite:false,roughness:1}));SPACE.add(SP.clouds);
  SP.atmo=new THREE.Mesh(new THREE.PlaneGeometry(17,17),new THREE.MeshBasicMaterial({map:soft,color:'#6fb6ff',transparent:true,opacity:.75,depthWrite:false,blending:THREE.AdditiveBlending,fog:false}));SPACE.add(SP.atmo);
  const moonT=ctex(512,256,(g,w,h)=>{g.fillStyle='#a9a7a2';g.fillRect(0,0,w,h);grainy(g,w,h,40);for(let i=0;i<90;i++){const x=R()*w,y=R()*h,r=3+R()*18;g.fillStyle='rgba(70,68,66,.45)';g.beginPath();g.arc(x,y,r,0,7);g.fill();g.fillStyle='rgba(230,228,224,.35)';g.beginPath();g.arc(x-r*.25,y-r*.25,r*.7,0,7);g.fill();}});
  SP.moon=new THREE.Mesh(new THREE.SphereGeometry(1.9,48,24),std({map:moonT,roughness:1}));SP.moon.position.set(0,46,0);SP.moon.castShadow=SP.moon.receiveShadow=true;SPACE.add(SP.moon);
  SP.pillar=stack(.55,.25,60);SP.pillar.position.set(0,5.9,0);SPACE.add(SP.pillar);
  SP.sunDisk=new THREE.Mesh(new THREE.PlaneGeometry(260,260),new THREE.MeshBasicMaterial({map:soft,color:'#fff2d0',transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,fog:false,toneMapped:false}));SPACE.add(SP.sunDisk);
  // balança gigante (perto da Terra, mais longe)
  SP.bal=new THREE.Group();SP.bal.position.set(-70,25,-40);SPACE.add(SP.bal);
  const metal=std({color:'#c9a24a',metalness:.75,roughness:.3}),dark=std({color:'#3a3346',metalness:.6,roughness:.4});
  cyl(.5,1.4,14,dark,SP.bal,0,-7,0,24);M(new THREE.ConeGeometry(1.2,2.2,4),metal,SP.bal,0,.2,0);
  SP.beam=new THREE.Group();SP.bal.add(SP.beam);box(26,.6,.6,metal,SP.beam,0,0,0);M(new THREE.SphereGeometry(.9,20,12),metal,SP.beam,0,0,0);
  SP.pans=[];for(const s of[-1,1]){const pg=new THREE.Group();SP.bal.add(pg);for(let k=0;k<3;k++){const a=k/3*TAU;const l=cyl(.05,.05,6,dark,pg,Math.cos(a)*1.9,3,Math.sin(a)*1.9,6);l.rotation.z=Math.cos(a)*.3;l.rotation.x=-Math.sin(a)*.3;}cyl(4.2,3.6,.5,metal,pg,0,0,0,40);SP.pans.push(pg);}
  SP.earth2=new THREE.Mesh(new THREE.SphereGeometry(3.6,48,24),std({map:earthT,roughness:.75}));SP.pans[0].add(SP.earth2);SP.earth2.position.y=3.85;
  const bundleT=ctex(512,512,(g,w,h)=>{for(let i=0;i<4;i++)for(let j=0;j<8;j++){g.drawImage(noteT.image,i*128,j*64,128,64);g.fillStyle='rgba(255,255,255,.85)';g.fillRect(i*128+54,j*64,20,64);}grainy(g,w,h,10);});
  const bm=new THREE.MeshStandardMaterial({map:bundleT,roughness:.7,emissive:'#3a6ab0',emissiveIntensity:0});SP.cubeM=bm;
  const cg=new THREE.BoxGeometry(1,1,1);cg.translate(0,.5,0);SP.cube=new THREE.Mesh(cg,bm);SP.cube.castShadow=true;SP.pans[1].add(SP.cube);
  // buraco negro: esfera preta + disco de acreção + brilho
  SP.bh=new THREE.Group();SPACE.add(SP.bh);
  M(new THREE.SphereGeometry(2.2,48,24),new THREE.MeshBasicMaterial({color:'#000'}),SP.bh,0,0,0,false);
  const diskT=ctex(512,512,(g,w,h)=>{const gr=g.createRadialGradient(256,256,90,256,256,256);gr.addColorStop(0,'rgba(255,250,230,1)');gr.addColorStop(.2,'rgba(255,190,90,1)');gr.addColorStop(.55,'rgba(230,90,60,.7)');gr.addColorStop(1,'rgba(120,40,120,0)');g.fillStyle=gr;g.fillRect(0,0,w,h);g.globalCompositeOperation='destination-out';for(let i=0;i<120;i++){g.strokeStyle=`rgba(0,0,0,${R()*.5})`;g.lineWidth=2+R()*6;g.beginPath();const r=100+R()*150,a=R()*TAU;g.arc(256,256,r,a,a+.5+R()*1.5);g.stroke();}});
  SP.disk=new THREE.Mesh(new THREE.RingGeometry(2.4,10,96,1),new THREE.MeshBasicMaterial({map:diskT,transparent:true,side:THREE.DoubleSide,depthWrite:false,blending:THREE.AdditiveBlending,toneMapped:false}));
  {const uv=SP.disk.geometry.attributes.uv,pp=SP.disk.geometry.attributes.position;for(let i=0;i<uv.count;i++){uv.setXY(i,pp.getX(i)/20+.5,pp.getY(i)/20+.5);}}
  SP.diskG=new THREE.Group();SP.diskG.rotation.x=-1.25;SP.bh.add(SP.diskG);SP.diskG.add(SP.disk);
  SP.halo=new THREE.Mesh(new THREE.PlaneGeometry(9,9),new THREE.MeshBasicMaterial({map:soft,color:'#ffb060',transparent:true,opacity:.9,depthWrite:false,blending:THREE.AdditiveBlending,toneMapped:false}));SP.bh.add(SP.halo);
  // galáxia espiral (longe de tudo)
  SP.gal=new THREE.Group();SP.gal.position.set(0,-300,-1400);SPACE.add(SP.gal);
  {const n=14000,p=new Float32Array(n*3),c=new Float32Array(n*3);for(let i=0;i<n;i++){const arm=i%3,r=Math.pow(R(),.7)*280,a=arm/3*TAU+r*.022+(R()-.5)*(.5+60/(r+20)),y=(R()-.5)*(26*Math.exp(-r/80)+4);p.set([Math.cos(a)*r,y,Math.sin(a)*r],i*3);const k=r/280;c.set([lerp(1,.55,k),lerp(.9,.7,k),lerp(.7,1,k)],i*3);}
   SP.galP=new THREE.Points(new THREE.BufferGeometry().setAttribute('position',new THREE.BufferAttribute(p,3)).setAttribute('color',new THREE.BufferAttribute(c,3)),new THREE.PointsMaterial({size:2.2,sizeAttenuation:false,vertexColors:true,transparent:true,opacity:.9,depthWrite:false,blending:THREE.AdditiveBlending,fog:false,toneMapped:false}));SP.gal.add(SP.galP);}
  SP.core=new THREE.Mesh(new THREE.PlaneGeometry(160,160),new THREE.MeshBasicMaterial({map:soft,color:'#ffe2b0',transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,toneMapped:false}));SP.gal.add(SP.core);
}
const SUNL=new THREE.DirectionalLight('#fff0dc',3.2);SUNL.castShadow=true;SUNL.shadow.mapSize.set(1024,1024);Object.assign(SUNL.shadow.camera,{left:-12,right:12,top:12,bottom:-12,near:1,far:200});scene.add(SUNL,SUNL.target);
const SUNDIR=V(.8,.35,.5).normalize();

// ---------- pós-processamento ----------
const composer=new EffectComposer(renderer);composer.addPass(new RenderPass(scene,cam));
const bokeh=new BokehPass(scene,cam,{focus:2,aperture:.004,maxblur:.008});composer.addPass(bokeh);
const bloom=new UnrealBloomPass(new THREE.Vector2(540,960),.55,.6,.82);composer.addPass(bloom);composer.addPass(new OutputPass());
let FOCUS=null,AP=.004,BL=[.55,.6,.82];

let MOOD='';
function mood(m){MOOD=m;const room=m==='room';ROOM.visible=room;SPACE.visible=!room;sun.visible=room;fillL.visible=room;SUNL.visible=!room;
  scene.fog=room?new THREE.FogExp2('#3a2c4e',.035):null;scene.background=new THREE.Color(room?'#251c33':'#05040f');
  hemi.color.set(room?'#9f8fc8':'#8fa0d8');hemi.groundColor.set(room?'#5a3a2a':'#1a1430');hemi.intensity=room?1.05:.75;renderer.toneMappingExposure=room?1.05:1.0;
  document.getElementById('glow').setAttribute('opacity',room?1:0);document.getElementById('tint').setAttribute('opacity',room?.12:.06);
  cam.far=room?200:6000;cam.updateProjectionMatrix();}

function roomLife(t){
  PLANTS.forEach((p,i)=>{p.g.rotation.z=Math.sin(t*1.3+i)*.025;p.g.rotation.x=Math.sin(t*1.1+i*2)*.02;});SUNF.userData.head.rotation.z=Math.sin(t*.8)*.05;
  FLAMES.forEach((fl,i)=>{const k=1+Math.sin(t*13+i*2)*.12+Math.sin(t*7+i)*.08;fl.scale.set(k,k*(1.1+Math.sin(t*9+i)*.1),1);fl.lookAt(cam.position);});CH.userData.light.intensity=3+Math.sin(t*11)*.4;
  FAIRY.forEach((f2,i)=>{f2.material.opacity=.45+.25*Math.sin(t*2+i*1.3);f2.lookAt(cam.position);});
  const dp=DUST.geometry.attributes.position;for(let i=0;i<400;i++){dp.setXYZ(i,.2+((rnd(i)*2.4+t*.03*rnd(i+3))%2.4)-1.0,.2+((rnd(i+1)*2.4+Math.sin(t*.4+i)*.1+t*.02)%2.4),-2.8+((rnd(i+2)*2.6+t*.04)%2.6));}dp.needsUpdate=true;
  STEAM.forEach((m,i)=>{const ph=(t*.35+i/5)%1;m.position.set(-2.65+Math.sin(t+i)*.02,.92+ph*.35,.3+Math.cos(t*.7+i)*.02);m.scale.setScalar(.6+ph*1.6);m.material.opacity=.3*(1-ph);m.lookAt(cam.position);});
  RAYS.forEach((r,i)=>r.material.opacity=.09+.04*Math.sin(t*.6+i));}
function spaceLife(t){SP.neb.position.copy(cam.position);SP.stars.position.copy(cam.position);SP.clouds.rotation.y=t*.03;SP.earth.rotation.y=t*.015;SP.moon.rotation.y=t*.02;SP.earth2.rotation.y=t*.05;
  SP.atmo.position.copy(SP.earth.position).addScaledVector(V(0,0,0).subVectors(cam.position,SP.earth.position).normalize(),-1);SP.atmo.lookAt(cam.position);
  SP.sunDisk.position.copy(cam.position).addScaledVector(SUNDIR,2400);SP.sunDisk.lookAt(cam.position);SUNL.position.copy(SUNL.target.position).addScaledVector(SUNDIR,80);
  SP.diskG.rotation.z=0;SP.disk.rotation.z=-t*1.2;SP.halo.lookAt(cam.position);SP.galP.rotation.y=t*.05;SP.core.lookAt(cam.position);}

// ---------- câmera e helpers ----------
let FOVMUL=1;
function camShot(v,d,p0,p1,l0,l1,o={}){const k=(o.e||ease)(cl(v/d)),sh=o.shake||[0,0],w=o.whip||0,t=o.t||v;const p=V(0,0,0).lerpVectors(p0,p1,k),l=V(0,0,0).lerpVectors(l0,l1,k);
  const side=V(0,0,0).subVectors(l,p).cross(V(0,1,0)).normalize();cam.position.set(p.x+sh[0]+Math.sin(t*1.3)*.012,p.y+sh[1]+Math.sin(t*1.9)*.01,p.z);l.addScaledVector(side,w*3);cam.lookAt(l.x+sh[0]*.5,l.y+sh[1]*.5,l.z);if(!FOCUS)FOCUS=l.clone();}
function camAt2(p,l,t,sh=[0,0]){cam.position.set(p.x+sh[0]+Math.sin(t*1.3)*.012,p.y+sh[1]+Math.sin(t*1.9)*.01,p.z);cam.lookAt(l.x+sh[0]*.5,l.y+sh[1]*.5,l.z);if(!FOCUS)FOCUS=l.clone();}
const P2=V(0,0,0);function proj(x,y,z){if(x&&x.isVector3){z=x.z;y=x.y;x=x.x;}cam.updateMatrixWorld();P2.set(x,y,z).project(cam);return{x:(P2.x+1)/2*1080,y:(1-P2.y)/2*1920};}
function bill(s){const p=s.mesh.getWorldPosition(V(0,0,0));if(s.full){s.mesh.quaternion.copy(cam.quaternion);return;}s.mesh.rotation.set(0,Math.atan2(cam.position.x-p.x,cam.position.z-p.z),0);}
function place(s,x,y,z,sc){s.mesh.visible=true;s.mesh.scale.setScalar(sc);s.mesh.position.set(x,y,z);}
// tela do celular grande (camada SVG)
function phoneUI(cx,cy,s,inner,o={}){const W=520,H=960,gl=o.glitch||0;const jx=gl?Math.sin(o.t*90)*14*gl:0;
  return `<g transform="translate(${f(cx+jx)} ${f(cy)}) scale(${f(s)}) rotate(${f(o.rot||0)})"><rect x="${-W/2-18}" y="${-H/2-18}" width="${W+36}" height="${H+36}" rx="70" fill="#15131c" stroke="#000" stroke-width="8"/><rect x="${-W/2}" y="${-H/2}" width="${W}" height="${H}" rx="54" fill="${o.bg||'#f3f1fb'}"/>
  <rect x="-70" y="${-H/2+14}" width="140" height="30" rx="15" fill="#15131c"/><clipPath id="pc"><rect x="${-W/2}" y="${-H/2}" width="${W}" height="${H}" rx="54"/></clipPath><g clip-path="url(#pc)">${inner}</g></g>`;}
function bankTop(){return `<rect x="-260" y="-480" width="520" height="210" fill="#6b3fd4"/><text x="-215" y="-360" font-family="Anton" font-size="46" fill="#fff">MEU BANCO</text><circle cx="190" cy="-375" r="34" fill="#fff" opacity=".25"/><text x="-215" y="-210" font-family="Anton" font-size="34" fill="#6a6680">SALDO DISPONÍVEL</text>`;}
const DIG='31415926535897932384626433832795028841971693993751058209749445923078164062862089986280348253421170679';
function digits(n,off=0){let s='';for(let i=0;i<n;i++)s+=DIG[(i*7+off)%DIG.length];return s;}
function ribbon(pts,t,size=40,col='#ffd23f'){let h='';pts.forEach((P,i)=>{if(P.z>1)return;const q=proj(P);h+=`<text x="${f(q.x)}" y="${f(q.y)}" font-family="Anton" font-size="${f(size)}" fill="${col}" stroke="#141414" stroke-width="5" paint-order="stroke" text-anchor="middle" opacity="${f(Math.min(1,i/6))}">${DIG[(i+Math.floor(t*12))%DIG.length]}</text>`;});return h;}
function zz(x,y,t){let h='';for(let k=0;k<3;k++){const ph=(t*.6+k/3)%1;h+=`<text x="${f(x+ph*80+k*8)}" y="${f(y-ph*220)}" font-family="Anton" font-size="${f(54+ph*36)}" fill="#fff" stroke="#3a2c4e" stroke-width="7" paint-order="stroke" opacity="${f(Math.sin(ph*Math.PI))}">Z</text>`;}return h;}
function card(txt,x,y,p,o={}){if(p<=0)return'';const s=back(cl(p));const w=o.w||620,h2=o.h||150;return `<g transform="translate(${f(x)} ${f(y)}) rotate(${o.rot||0}) scale(${s.toFixed(3)})"><rect x="${-w/2}" y="${-h2/2}" width="${w}" height="${h2}" rx="28" fill="${o.bg||'#2c2340'}" stroke="#141414" stroke-width="10" opacity=".93"/><text class="lb" y="${o.size?o.size*.36:34}" font-size="${o.size||96}" fill="${o.fill||'#fff'}" text-anchor="middle">${txt}</text></g>`;}
const helm=svg=>svg+HELMET;

// ===================== cenas =====================
const EV=[];const ev=(s,u,n,g=1)=>{EV.push([s,u,n,g]);return u;};
const SEAT=V(.62,712*K*.82,-.05);
const SC=[
// ---------- S1: acorda com TREE(3) reais ----------
{mood:'room',fov:52,setup(d){ev(0,.15,'buzz');ev(0,.9,'buzz',.8);ev(0,1.25,'boing');ev(0,2.3,'cash',1.1);ev(0,3.3,'boing',.8);ev(0,3.4,'paper',.8);ev(0,d-.8,'pop');},
async up(u,d,t){const s=shots(u,[0,1.2,2.3,3.3],d),v=s.v;let h='';
  const buzz=(u%0.75)<.35&&u<1.25;PHONE.visible=u<1.25;PHONE.position.set(1.5+(buzz?Math.sin(t*90)*.006:0),.66,-.2);PGLOW.material.opacity=.3+(buzz?.4:0);
  BED2.visible=u<1.2;BED2E.visible=!BED2.visible;
  if(s.i===0){place(HEADS,1.15,.8+Math.sin(t*1.4)*.004,-.35,.62);await HEADS.set(head({t,style:'soft',view:'3q',dir:1,expr:'sleep',hairStyle:HK.hairStyle,hair:HK.hair,skin:HK.skin,blush:.6}));
    camShot(v,s.d,V(-.9,2.0,2.4),V(-.5,1.7,1.7),V(1.0,.8,-.3),V(1.15,.75,-.3),{t});const q=proj(1.2,1.05,-.35);h+=zz(q.x,q.y,t);
    const pq=proj(1.5,.7,-.2);if(buzz)h+=`<g transform="translate(${f(pq.x)} ${f(pq.y)})"><path d="M-70 -30 q-14 30 0 60 M70 -30 q14 30 0 60 M-95 -45 q-22 45 0 90 M95 -45 q22 45 0 90" stroke="#bfefff" stroke-width="8" fill="none" stroke-linecap="round"/></g>`;
    FOCUS=V(1.15,.8,-.35);AP=.004;}
  else{const j=hop(u,1.2,.3,90);const S=.82;
    let o={t,stance:'sit',bob:-45,holdR:phoneHold(195),aR:-40,eR:-95,handR:'grip',light:{color:'#8fe3ff',az:-1,amt:.25}};
    if(s.i===1)Object.assign(o,{expr:v<.5?'sleep':'neutral',sq:j.sq,aL:v>.4&&v<1?160:20,eL:v>.4&&v<1?-40:-8,mouth:v>.4&&v<1?.8*Math.sin((v-.4)/.6*Math.PI):0,lookY:.5,look:.4});
    if(s.i===2)Object.assign(o,{expr:'shock',eyeFx:'star',aL:120+Math.sin(t*10)*10,eL:-60,handL:'open',mouth:.7,lookY:.3,pupil:1.3});
    let px=SEAT.x,py=SEAT.y-j.y*K*S,pz=SEAT.z;
    if(s.i===3){const jj=hop(v,0,.42,200),jj2=hop(v,.75,.42,200);const J=jj.y||jj2.y;o={t,expr:'laugh',aL:160+Math.sin(t*12)*12,aR:150-Math.sin(t*12)*12,eL:-20,eR:-20,handL:'open',handR:'open',sq:jj.sq||jj2.sq,legL:-15,legR:15,mouth:.8,eyeFx:'star'};
      if(v>s.d-.9){o.aR=70;o.eR=-10;o.handR='point';o.lookCam=true;o.aL=20;o.eyeFx=undefined;o.expr='smug';}
      px=1.15;py=.62+712*K*S-J*K*S;pz=.25;}
    place(HERO,px,py,pz,S);await HERO.set(backlight(hero(o),'#ffd49a',.45));
    if(s.i===1){camShot(v,s.d,V(-.55,1.15,1.35),V(-.4,1.1,1.1),V(.6,.95,-.1),V(.62,1.0,-.1),{t});const q=proj(SEAT.x+.25,SEAT.y+.05,SEAT.z);if(v>.4&&v<1)h+=popText('?',q.x+40,q.y-260,seg(v,.4,.6),{size:90,fill:'#fff'});}
    if(s.i===2){camShot(v,s.d,V(.0,1.2,.75),V(.1,1.2,.62),V(.62,1.15,-.05),V(.62,1.17,-.05),{t});FOVMUL=punch(u,2.32,.2);
      h+=phoneUI(800,820,.55,bankTop()+`<text x="-215" y="-120" font-family="Anton" font-size="88" fill="#1d1b26">R$ TREE(3)</text><text x="-215" y="-40" font-family="Anton" font-size="34" fill="#2fa86a">+ PIX RECEBIDO</text>`,{rot:6})+sparkle(560,560,t,60)+sparkle(1000,500,t+.4,46);}
    if(s.i===3){const a=lerp(-.5,.35,ease(cl(v/s.d)));camAt2(V(1.15+Math.sin(a)*1.9,.55,.25+Math.cos(a)*1.9),V(1.15,1.35,.25),t);FOVMUL=punch(u,3.32,.12);notesBurst(t,V(1.15,1.5,.25),seg(u,3.35,d),1,70,1.6);
      const q=proj(px,py+.25,pz);h+=sparkle(q.x-200,q.y-150,t,50)+sparkle(q.x+220,q.y-60,t+.3,40);if(v>s.d-.9)h+=popText('?!',q.x+220,q.y-260,seg(v,s.d-.9,s.d-.65),{size:120});}
    FOCUS=V(px,py,pz);AP=s.i===2?.012:.006;}
  if(s.i!==3)NOTES.count=0;
  roomLife(t);const tp=1-seg(u,2.2,2.45);if(tp>0)h+=label('E SE VOCÊ ACORDASSE COM',290,{size:84,p:tp})+label('TREE(3) REAIS?',430,{size:150,fill:'#ffd23f',p:tp});
  return h;}},
// ---------- S2: o app trava ----------
{mood:'room',fov:50,setup(d){ev(1,.1,'beeps',.7);ev(1,1.0,'beeps',.8);ev(1,2.1,'glitch',1.1);ev(1,3.1,'pop');ev(1,d-1.1,'plop',.8);},
async up(u,d,t){const s=shots(u,[0,2.0,3.0],d),v=s.v;let h='';BED2.visible=false;BED2E.visible=true;PHONE.visible=false;const S=.82;
  let o={t,stance:'sit',bob:-45,holdR:phoneHold(195,s.i>=1?'#ff6b6b':'#8fe3ff'),aR:-40,eR:-95};
  if(s.i===0)Object.assign(o,{expr:v<1?'suspicious':'shock',lookY:.5,look:.4,aL:20,mouth:v>1?.5:0,pupil:v>1?1.3:1});
  if(s.i===1)Object.assign(o,{expr:'shock',lookY:.4,aL:60,eL:-80,handL:'open'});
  if(s.i===2){Object.assign(o,{expr:v<1?'fear':'bored',rot:v<1?tremble(t,4):0,aR:-60+Math.sin(t*30)*25*(v<1?1:0),eR:-80,mouth:v<1?.5:0});if(v>1)Object.assign(o,{gesture:'facepalm'});}
  place(HERO,SEAT.x,SEAT.y,SEAT.z,S);await HERO.set(backlight(hero(o),'#ffd49a',.45));
  if(s.i===0){camShot(v,s.d,V(.7,1.22,.3),V(.68,1.2,.36),V(-1.6,.9,2.4),V(-1.5,.95,2.5),{t});
    const n=Math.floor(4+seg(v,0,2)*60),lines=[];for(let k=0;k<Math.ceil(n/9);k++)lines.push(digits(Math.min(9,n-k*9),k*5));
    h+=phoneUI(540,860,.95,bankTop()+`<text x="-215" y="-120" font-family="Anton" font-size="56" fill="#1d1b26">R$</text>`+lines.map((l,k)=>`<text x="-150" y="${-120+k*62}" font-family="Anton" font-size="60" fill="#1d1b26" letter-spacing="4">${l}</text>`).join('')+(v>1?`<circle cx="0" cy="360" r="44" fill="none" stroke="#6b3fd4" stroke-width="12" stroke-dasharray="70 210" transform="rotate(${f(t*500)} 0 360)"/>`:''),{});
    if(v>1)for(let k=0;k<10;k++){const ph=(t*.8+k/10)%1;h+=`<text x="${f(540+(rnd(k)-.5)*900)}" y="${f(700-ph*500)}" font-family="Anton" font-size="${f(50+rnd(k+2)*40)}" fill="#ffd23f" stroke="#141414" stroke-width="6" paint-order="stroke" opacity="${f(Math.sin(ph*Math.PI))}">${digits(4,k)}</text>`;}}
  if(s.i===1){const sh=shake(u,2.1,.03,4);camShot(v,s.d,V(.7,1.22,.3),V(.69,1.21,.33),V(-1.6,.9,2.4),V(-1.55,.92,2.45),{t,shake:sh});FOVMUL=punch(u,2.1,.18);
    let inner=`<rect x="-260" y="-480" width="520" height="960" fill="#1d1b26"/>`;for(let k=0;k<14;k++){const y=-460+k*68+((t*900)%68);inner+=`<rect x="${-260+rnd(k+Math.floor(t*20))*80}" y="${f(y)}" width="${f(200+rnd(k+3)*300)}" height="${f(10+rnd(k)*30)}" fill="${['#ff3b5c','#3bffb0','#5ab8ff'][k%3]}" opacity=".7"/>`;}
    inner+=`<text y="40" font-family="Anton" font-size="130" fill="#ff3b5c" text-anchor="middle" stroke="#fff" stroke-width="6" paint-order="stroke">ERRO</text><text y="120" font-family="Anton" font-size="36" fill="#fff" text-anchor="middle">NÚMERO GRANDE DEMAIS</text>`;
    h+=phoneUI(540,860,.95,inner,{glitch:1,t,bg:'#1d1b26'});for(let k=0;k<5;k++){const ph=(t*.7+k/5)%1;h+=`<circle cx="${f(540+Math.sin(k*2+t)*60+ph*80)}" cy="${f(380-ph*300)}" r="${f(30+ph*60)}" fill="#bbb" opacity="${f(.5*(1-ph))}"/>`;}}
  if(s.i===2){camShot(v,s.d,V(-.3,1.2,1.25),V(-.2,1.18,1.1),V(.6,1.05,-.05),V(.62,1.05,-.05),{t});const q=proj(SEAT.x,SEAT.y+.2,SEAT.z);if(v<1)h+=sweat(q.x,q.y-60,t)+popText('TRAVOU!',540,560,seg(v,.05,.35),{size:150,fill:'#ff5a4d',rot:-6});else h+=emanata(q.x,q.y+30,seg(v,1,1.2),190);}
  FOCUS=s.i<2?V(.5,1.1,.6):V(SEAT.x,SEAT.y,SEAT.z);AP=s.i<2?.02:.006;roomLife(t);NOTES.count=0;return h;}},
// ---------- S3: TREE(1)=1, TREE(2)=3, TREE(3) >> Graham ----------
{mood:'room',fov:50,setup(d){ev(2,.2,'pop');ev(2,1.4,'pop');ev(2,2.65,'sting',1);ev(2,3.75,'whoosh');ev(2,4.6,'plop');ev(2,d-1,'ding',.7);},
async up(u,d,t){const s=shots(u,[0,1.25,2.6,3.7,d-1.1],d),v=s.v;let h='';BED2.visible=false;BED2E.visible=true;PHONE.visible=false;const S=.82,HP=V(-.55,712*K*S,.6);
  let o={t,mouth:talk(t)};
  if(s.i===0)Object.assign(o,{expr:'happy',aR:165,eR:-5,handR:'point',aL:20});
  if(s.i===1)Object.assign(o,{expr:'happy',aR:160,eR:-10,handR:'peace',aL:150,eL:-20,handL:'point'});
  if(s.i===2)Object.assign(o,{expr:'shock',eyeFx:'spiral',aL:120+Math.sin(t*9)*15,aR:120-Math.sin(t*9)*15,eL:-50,eR:-50,handL:'open',handR:'open',mouth:.8,rot:tremble(t,2)});
  if(s.i===3)Object.assign(o,{gesture:'shrug',expr:v<.8?'smug':'laugh'});
  if(s.i===4)Object.assign(o,{expr:'laugh',aR:170,eR:0,handR:'point',aL:-20,lookY:-.6});
  const j=s.i===2?hop(v,0,.35,70):{y:0,sq:0};o.sq=j.sq;
  place(HERO,HP.x,HP.y-j.y*K*S,HP.z,S);await HERO.set(backlight(hero(o),'#ffd49a',.45));
  if(s.i===0)camShot(v,s.d,V(-.3,1.15,2.4),V(-.35,1.1,2.1),V(-.55,1.0,.6),V(-.55,1.0,.6),{t});
  if(s.i===1)camShot(v,s.d,V(.4,1.1,2.1),V(.25,1.05,1.9),V(-.55,1.0,.6),V(-.55,1.0,.6),{t});
  if(s.i===2){camShot(v,s.d,V(-.5,1.2,1.45),V(-.5,1.2,1.3),V(-.55,1.15,.6),V(-.55,1.15,.6),{t,shake:shake(u,2.65,.03,4)});FOVMUL=punch(u,2.65,.2);}
  if(s.i===3)camShot(v,s.d,V(-1.6,.45,2.0),V(-1.5,.5,1.8),V(-.55,1.2,.6),V(-.55,1.2,.6),{t,whip:whip(v,s.d,.16)*(v<.25?1:0)});
  if(s.i===4)camShot(v,s.d,V(.9,2.4,2.4),V(.7,2.2,2.1),V(-.55,.9,.6),V(-.55,.9,.6),{t});
  if(s.i<=1){h+=card('TREE(1) = 1',540,330,seg(u,.2,.45),{rot:-3});if(s.i===1)h+=card('TREE(2) = 3',540,500,seg(u,1.4,1.65),{rot:3,fill:'#9fe6ff'});}
  if(s.i===2){h+=label('TREE(3) =',270,{size:120,p:seg(u,2.62,2.85)})+`<g transform="translate(${f(540+tremble(t,6))} 640)">`+label('???',0,{size:260,fill:'#ffd23f',x:0,p:seg(u,2.7,2.95),rot:tremble(t,3)})+'</g>';h+=speedLines(.5);}
  if(s.i===3){const sh=1-seg(v,.8,1.1)*.85;h+=card('TREE(3)',540,360,1,{w:760,h:230,size:170,fill:'#ffd23f'});h+=`<g transform="translate(540 580) scale(${f(sh)})">`+card('GRAHAM',0,0,seg(v,.15,.35),{w:400,h:110,size:70})+'</g>';if(v>.5)h+=popText('≈ 0',820,600,seg(v,.5,.75),{size:120,fill:'#9fe6ff'});if(v<.25)h+=speedLines(1-v/.25);}
  if(s.i===4){const q=proj(HP.x,HP.y+.3,HP.z);h+=sparkle(q.x-180,q.y-200,t,60)+sparkle(q.x+160,q.y-260,t+.5,50);h+=card('TREE(3) ≫ GRAHAM',540,380,seg(v,.0,.25),{w:900,h:150,size:100,fill:'#ffd23f'});}
  FOCUS=V(HP.x,HP.y,HP.z);AP=s.i===2?.008:.004;roomLife(t);NOTES.count=0;return h;}},
// ---------- S4: 1 metro = 1 milhão ----------
{mood:'room',fov:52,setup(d){ev(3,.05,'paper',1);ev(3,1.6,'paper',.7);ev(3,2.35,'ding',.8);ev(3,3.3,'cash',1);ev(3,4.0,'pop');ev(3,d-1.0,'rumble',.8);},
async up(u,d,t){const s=shots(u,[0,1.25,2.3,3.25,d-1.05],d),v=s.v;let h='';BED2.visible=false;BED2E.visible=true;PHONE.visible=false;const S=.82;
  const H=s.i===4?1+seg(v,.2,1)*2.3:seg(u,.1,2.3);STK.visible=true;STK.scale.y=Math.max(.001,H);STK.material[0].map.repeat.y=Math.max(1,H*40);TAPE.visible=u>1.9&&s.i<4;TAPE.position.set(-.12,.5,.2);TAPE.scale.y=1;
  const walk=seg(u,1.0,2.3);let HX=lerp(.6,.05,walk);
  let o={t,expr:'happy',lookY:-.5};
  if(u<1.0)Object.assign(o,{expr:'shock',lookY:-.8,aL:100+Math.sin(t*8)*20,eL:-30,aR:100-Math.sin(t*8)*20,eR:-30,handL:'open',handR:'open'});
  else if(u<2.3)Object.assign(o,{walk:t*1.8,moveDir:-1,expr:'happy',look:-.6});
  else if(u<3.25)Object.assign(o,{expr:'happy',aL:90,eL:-60,handL:'open',look:-.8,mouth:talk(t)});
  else if(s.i===3)Object.assign(o,{expr:'laugh',aL:80,eL:-70,handL:'open',aR:v>.75?70:30,eR:v>.75?-95:-8,handR:v>.75?'thumb':'relaxed',emote:'hearts',mouth:.6});
  else Object.assign(o,{expr:'shock',lookY:-1,aL:20,aR:20,walk:t*1.2,moveDir:1});
  if(s.i===4)HX=.05+v*.35;
  place(HERO,HX,712*K*S,.25,S);await HERO.set(backlight(hero(o),'#ffd49a',.45));
  notesRain(t,V(-.3,0,.2),1.6,3.2,1,s.i<=1?140:60);
  if(s.i===0)camShot(v,s.d,V(.6,1.7,3.0),V(.5,1.55,2.7),V(.1,1.3,.2),V(.15,1.05,.2),{t});
  if(s.i===1)camShot(v,s.d,V(.4,1.1,2.3),V(.2,1.05,2.1),V(.2,.85,.2),V(-.1,.85,.2),{t});
  if(s.i===2){camShot(v,s.d,V(-1.15,.9,1.25),V(-1.1,1.0,1.15),V(-.3,.7,.2),V(-.3,.85,.2),{t});const q=proj(-.12,1.0,.2);h+=popText('1 METRO',q.x,q.y-90,seg(u,2.35,2.6),{size:100,fill:'#ffd23f'});}
  if(s.i===3){camShot(v,s.d,V(.1,1.25,1.5),V(.05,1.2,1.35),V(-.1,.95,.2),V(-.1,.97,.2),{t});FOVMUL=punch(u,3.27,.15);}
  if(s.i===4){camShot(v,s.d,V(.9,2.9,1.9),V(.8,3.0,1.7),V(-.2,1.3,.2),V(-.3,2.4,.2),{t,shake:[tremble(t,.01),tremble(t+1,.01)]});const q=proj(-.35,Math.min(3.2,H),.2);h+=puff(q.x,q.y,seg(v,.7,1.05),6);}
  h+=counter(540,330,0,1000000,seg(u,.2,2.4),{pre:'R$ ',size:120}).replace(/(\d)(?=(\d{3})+(?!\d))/g,'$1.');
  FOCUS=V(HX,1.0,.25);AP=.004;roomLife(t);return h;}},
// ---------- S5: pilha até a Lua ----------
{mood:'space',fov:55,setup(d){ev(4,.05,'spacewind',1);ev(4,1.6,'whoosh');ev(4,3.55,'thud',1.1);ev(4,4.6,'ding',.8);ev(4,d-.9,'pop');},
async up(u,d,t){const s=shots(u,[0,1.5,3.4,4.5],d),v=s.v;let h='';SUNL.target.position.set(0,30,0);
  const L=38.2*ease(seg(u,0,3.55)),top=5.9+L;SP.pillar.visible=true;SP.pillar.position.set(0,5.9,0);SP.pillar.scale.y=Math.max(.01,L);SP.pillar.material[0].map.repeat.y=Math.max(1,L*20);
  SP.cube.visible=false;SP.bh.visible=false;SP.bal.visible=false;NOTES.count=0;FLY.full=true;
  let HP,o;
  if(s.i<3){HP=V(0,top+.85,0);o={t,expr:s.i===0?'happy':'laugh',aL:150+Math.sin(t*8)*15,aR:150-Math.sin(t*8)*15,eL:-20,eR:-20,handL:'open',handR:'open',legL:-12,legR:12,wind:1.2,mouth:.6,rot:Math.sin(t*3)*6};}
  else{const lp=s.i===3?seg(v,0,.6):1;HP=V(lerp(0,.4,lp),lerp(top+.85,46+1.9+.75,ease(lp))+Math.sin(lp*Math.PI)*1.5,lerp(0,.6,lp));
    o=s.i===3?{t,expr:'shock',aL:150,aR:150,eL:-20,eR:-20,legL:-30,legR:20,wind:.6}:{t,expr:'laugh',holdR:flag(t),aR:150,eR:-30,handR:'grip',aL:v>1?150+Math.sin(t*10)*25:30,eL:v>1?-40:-8,handL:v>1?'wave':'relaxed',lookCam:v>1,mouth:talk(t)};}
  place(FLY,HP.x,HP.y,HP.z,1.0);await FLY.set(helm(hero(o)));
  if(s.i===0){camShot(v,s.d,V(5,9,7),V(4,13,6),V(0,8,0),V(0,top,0),{t});h+=speedLines(.3);}
  if(s.i===1){camAt2(V(2.4,top+.2,3.0),V(0,top+.6,0),t,[tremble(t,.02),tremble(t+1,.02)]);h+=speedLines(.6);}
  if(s.i===2){camShot(v,s.d,V(34,26,40),V(32,28,36),V(0,22,0),V(0,26,0),{t});}
  if(s.i===3){camShot(v,s.d,V(5,47,9),V(4.5,47.5,8),V(0,45,0),V(.3,47.5,.4),{t,shake:shake(u,3.55,.15,4)});const q=proj(0,44.2,0);h+=puff(q.x,q.y,seg(u,3.55,4.2),9);}
  if(s.i===4){camShot(v,s.d,V(2.6,48.6,4.2),V(2.4,48.7,3.9),V(.4,48.6,.6),V(.4,48.7,.6),{t});FOVMUL=punch(u,4.52,.12);const q=proj(HP);h+=sparkle(q.x-200,q.y-260,t,50)+sparkle(q.x+230,q.y-200,t+.4,40);}
  h+=counter(540,320,0,384,seg(u,.3,3.5),{pre:'R$ ',suf:' TRILHÕES',size:110});
  FOCUS=HP.clone();AP=s.i===2?.0005:.003;BL=[.8,.6,.75];spaceLife(t);return h;}},
// ---------- S6: balança com a Terra ----------
{mood:'space',fov:52,setup(d){ev(5,.05,'whoosh');ev(5,.8,'rumble',.9);ev(5,2.25,'thud',1.2);ev(5,3.05,'sting',1);ev(5,d-1.1,'plop',.7);},
async up(u,d,t){const s=shots(u,[0,1.2,2.2,3.0],d),v=s.v;let h='';const B=SP.bal.position;SUNL.target.position.copy(B);
  SP.pillar.visible=false;SP.bal.visible=true;SP.bh.visible=false;SP.cube.visible=true;NOTES.count=0;FLY.full=true;
  const g=ease(seg(u,.6,2.25)),cs=lerp(1.2,6.6,g);SP.cube.scale.setScalar(cs);SP.cube.position.set(0,.25,0);SP.cube.rotation.y=.3;SP.cubeM.emissiveIntensity=0;
  const ang=lerp(.32,0,ease(seg(u,1.4,2.3)))+Math.sin(cl((u-2.25)*3)*Math.PI*2)*.05*(u>2.25&&u<2.6?1:0)+(u>2.25?Math.exp(-(u-2.25)*3)*Math.sin((u-2.25)*14)*.04:0);
  SP.beam.rotation.z=ang;for(const[k,sg]of[[0,-1],[1,1]]){const ex=sg*12.5*Math.cos(ang),ey=sg*12.5*Math.sin(ang);SP.pans[k].position.set(ex,ey-6,0);}
  const HP=V(B.x,B.y+5+Math.sin(t*1.5)*.3,B.z+7);
  let o={t,wind:.3,legL:-10+Math.sin(t*2)*6,legR:14-Math.sin(t*2)*6,rot:Math.sin(t*1.3)*5};
  if(s.i<=1)Object.assign(o,{gesture:'crossed',expr:'suspicious',look:Math.sin(t*2.5)});
  else if(s.i===2)Object.assign(o,{expr:'shock',look:1,aL:60,aR:60,eL:-40,eR:-40,handL:'open',handR:'open'});
  else Object.assign(o,v<1.1?{expr:'shock',aL:150,aR:150,eL:-30,eR:-30,handL:'open',handR:'open',mouth:.7}:{gesture:'shrug',expr:'smug'});
  place(FLY,HP.x,HP.y,HP.z,2.2);await FLY.set(helm(hero(o)));
  if(s.i===0)camShot(v,s.d,V(B.x-6,B.y+6,B.z+66),V(B.x-4,B.y+6,B.z+60),V(B.x,B.y-3,B.z),V(B.x,B.y-2,B.z),{t});
  if(s.i===1)camShot(v,s.d,V(B.x+8,B.y+3,B.z+26),V(B.x+4,B.y+4,B.z+24),V(B.x,B.y,B.z),V(B.x,B.y+1,B.z),{t});
  if(s.i===2){const pc=SP.pans[1].position;camShot(v,s.d,V(B.x+22,B.y-2,B.z+14),V(B.x+21,B.y-3,B.z+13),V(B.x+pc.x,B.y+pc.y+3,B.z),V(B.x+pc.x,B.y+pc.y+2,B.z),{t,shake:shake(u,2.25,.25,5)});}
  if(s.i===3){camShot(v,s.d,V(B.x+1,B.y+6.5,B.z+13.5),V(B.x+.8,B.y+6.3,B.z+12.8),V(B.x,B.y+5.2,B.z+7),V(B.x,B.y+5.3,B.z+7),{t});FOVMUL=punch(u,3.05,.15);const q=proj(HP);h+=sweat(q.x,q.y-200,t);}
  h+=label('6 OCTILHÕES',320,{size:120,fill:'#ffd23f',p:seg(u,.5,.8)})+label('DE NOTAS',440,{size:70,p:seg(u,.7,.95)});
  if(u>3.05)h+=popText('= PESO DA TERRA!',540,600,seg(u,3.05,3.35),{size:100,fill:'#9fe6ff',rot:-4});
  FOCUS=s.i===3?HP.clone():V(B.x,B.y,B.z);AP=.001;BL=[.7,.6,.75];spaceLife(t);return h;}},
// ---------- S7: buraco negro ----------
{mood:'space',fov:55,setup(d){ev(6,.05,'rumble',1.2);ev(6,1.2,'boom',1.3);ev(6,1.3,'suck',1);ev(6,3.4,'whoosh');},
async up(u,d,t){const s=shots(u,[0,1.2,2.2,3.4],d),v=s.v;let h='';const B=SP.bal.position;SUNL.target.position.copy(B);
  SP.pillar.visible=false;SP.bal.visible=true;FLY.full=true;
  const pc=SP.pans[1].position,C=V(B.x+pc.x,B.y+pc.y+3.5,B.z);
  SP.beam.rotation.z=0;SP.pans[0].position.set(-12.5,-6,0);SP.pans[1].position.set(12.5,-6,0);
  if(u<1.2){SP.cube.visible=true;SP.bh.visible=false;const k=seg(u,.1,1.2);const cs=lerp(6.6,.4,k*k);SP.cube.scale.setScalar(cs);SP.cube.position.set(Math.sin(t*60)*.1*k,.25+(6.6-cs)/2,Math.cos(t*50)*.1*k);SP.cubeM.emissiveIntensity=k*3;SP.cube.rotation.y=.3+k*4;NOTES.count=0;}
  else{SP.cube.visible=false;SP.bh.visible=true;SP.bh.position.copy(C);const gr=spring(u,1.2,6,4);SP.bh.scale.setScalar(Math.max(.01,gr));SP.pans[1].visible=u<1.6;notesSpiral(t,C,2.2,200,26);SP.pans[1].scale.setScalar(1-seg(u,1.2,1.6));}
  if(u<1.2)SP.pans[1].visible=true,SP.pans[1].scale.setScalar(1);
  let HP,o;
  if(s.i<=1){HP=V(B.x+2,B.y+5,B.z+7);o={t,expr:s.i===0?'fear':'shock',aL:100,aR:100,eL:-40,eR:-40,handL:'open',handR:'open',rot:tremble(t,3)};}
  else{const k=seg(u,2.2,d),r=lerp(14,3.2,k),a=t*lerp(1.6,6,k);HP=V(C.x+Math.cos(a)*r,C.y+Math.sin(t*2)*.8,C.z+Math.sin(a)*r);o={t,expr:'fear',aL:150+Math.sin(t*14)*20,aR:150-Math.sin(t*14)*20,eL:-20,eR:-20,handL:'open',handR:'open',legL:-20,legR:20,rot:(t*360*lerp(.6,2,k))%360,sq:-lerp(.1,.55,k),mouth:.9,wind:1.4};}
  place(FLY,HP.x,HP.y,HP.z,2.2);await FLY.set(helm(hero(o)));
  if(s.i===0)camShot(v,s.d,V(C.x+4,C.y+3,C.z+22),V(C.x+3,C.y+2,C.z+18),C,C,{t,shake:[tremble(t,.15*v),tremble(t+1,.15*v)]});
  if(s.i===1){camShot(v,s.d,V(C.x-6,C.y+5,C.z+26),V(C.x-5,C.y+4,C.z+24),C,C,{t,shake:shake(u,1.2,.4,4)});FOVMUL=punch(u,1.22,.2);}
  if(s.i===2){const a=t*.5;camAt2(V(C.x+Math.cos(a)*24,C.y+7,C.z+Math.sin(a)*24),C,t);}
  if(s.i===3){camAt2(V(HP.x+(HP.x-C.x)*.6+2,HP.y+2.5,HP.z+(HP.z-C.z)*.6+2),V(HP.x,HP.y,HP.z),t,[tremble(t,.05),tremble(t+2,.05)]);FOVMUL=punch(u,3.42,.15);h+=speedLines(.8);}
  if(u>1.2&&u<1.5)h+=`<rect width="1080" height="1920" fill="#fff" opacity="${f(1-seg(u,1.2,1.5))}"/>`;
  if(s.i>=2)h+=popText('BURACO NEGRO!',540,330,seg(u,2.2,2.5),{size:120,fill:'#ff9a3c',rot:-5});
  if(u>2.9)h+=popText('ESPAGUETIFICAÇÃO!',540,480,seg(u,2.9,3.2),{size:84,fill:'#9fe6ff',rot:4});
  FOCUS=s.i>=2?HP.clone():C.clone();AP=.001;BL=[1.0,.7,.7];spaceLife(t);return h;}},
// ---------- S8: átomos do universo ----------
{mood:'space',fov:55,setup(d){ev(7,.05,'chime',.8);ev(7,1.1,'whoosh',1);ev(7,3.2,'pop');ev(7,d-1.0,'plop',.7);},
async up(u,d,t){const s=shots(u,[0,1.1,3.1],d),v=s.v;let h='';const G=SP.gal.position;SUNL.target.position.copy(G);
  SP.pillar.visible=false;SP.bal.visible=false;SP.bh.visible=false;NOTES.count=0;FLY.full=true;
  const HP=V(G.x+40,G.y+60,G.z+330);
  let o={t,holdR:pencil(150),aR:60+Math.sin(t*14)*10,eR:-90+Math.cos(t*14)*8,handR:'grip',lookY:.5,look:.6,rot:Math.sin(t*1.2)*5,legL:-10,legR:12};
  if(s.i===0)Object.assign(o,{expr:'happy',mouth:talk(t)});
  if(s.i===1)Object.assign(o,{expr:'neutral'});
  if(s.i===2)Object.assign(o,v<1?{expr:'bored',aR:30,eR:-20,lookCam:true}:{gesture:'shrug',expr:'smug',holdR:pencil(150)});
  place(FLY,HP.x,HP.y,HP.z,1);await FLY.set(helm(hero(o)));
  if(s.i===0)camShot(v,s.d,V(HP.x+.4,HP.y+.3,HP.z+4.5),V(HP.x+.3,HP.y+.2,HP.z+4.0),HP,HP,{t});
  if(s.i===1){const k=Math.pow(seg(v,0,s.d),1.6);const dist=Math.exp(lerp(Math.log(4),Math.log(900),k));camAt2(V(HP.x+dist*.15,HP.y+dist*.55,HP.z+dist*.8),V(lerp(HP.x,G.x,k),lerp(HP.y,G.y,k),lerp(HP.z,G.z,k)),t);}
  if(s.i===2)camShot(v,s.d,V(HP.x-1.2,HP.y+.6,HP.z+4.6),V(HP.x-1,HP.y+.5,HP.z+4.2),HP,HP,{t});
  // fita de dígitos: sai do lápis e dá voltas na galáxia
  const pts=[];const n=s.i===1?140:40;for(let i=0;i<n;i++){const k=i/n;if(s.i===1){const a=-k*TAU*2.2+t*.3,r=lerp(40,320,1-k);pts.push(V(G.x+Math.cos(a)*r,G.y+20+Math.sin(a*3)*8,G.z+Math.sin(a)*r));}else{pts.push(V(HP.x+.35+k*3.5,HP.y-.2+Math.sin(k*9+t*3)*.35,HP.z+.2-k*1.5));}}
  h+=ribbon(pts,t,s.i===1?34:46);
  h+=label('10<tspan dy="-42" font-size="72">80</tspan><tspan dy="42"> ÁTOMOS</tspan>',330,{size:120,fill:'#9fe6ff',p:seg(u,1.2,1.45)});
  if(u>1.6)h+=label('< DÍGITOS DE TREE(3)',460,{size:78,p:seg(u,1.6,1.85)});
  if(s.i===2)h+=popText('NÃO DÁ!',540,640,seg(v,.1,.35),{size:140,fill:'#ff5a4d',rot:-6})+(v<1?sweat(proj(HP).x,proj(HP).y-180,t):'');
  FOCUS=s.i===1?V(G.x,G.y,G.z):HP.clone();AP=s.i===1?.0002:.003;BL=[.9,.6,.6];spaceLife(t);return h;}},
// ---------- S9: era um sonho + CTA ----------
{mood:'room',fov:50,setup(d){ev(8,.05,'boing');ev(8,1.0,'plop',.9);ev(8,2.4,'pop');ev(8,3.7,'ding',.8);},
async up(u,d,t){const s=shots(u,[0,1.0,2.2],d),v=s.v;let h='';BED2.visible=false;BED2E.visible=true;PHONE.visible=false;STK.visible=false;TAPE.visible=false;NOTES.count=0;const S=.82;
  const j=hop(u,0,.3,110);
  let o={t,stance:'sit',bob:-45,holdR:phoneHold(195),aR:-40,eR:-95,sq:j.sq};
  if(s.i===0)Object.assign(o,{expr:'shock',aL:130,eL:-40,handL:'open',mouth:.6,look:darting(t)});
  if(s.i===1)Object.assign(o,{expr:'bored',teary:true,lookY:.5});
  if(s.i===2){const k=u-2.2;Object.assign(o,k<1?{expr:'laugh',aL:30,mouth:.6}:{expr:'happy',lookCam:true,aL:k<2.3?75:150+Math.sin(t*10)*25,eL:k<2.3?-10:-40,handL:k<2.3?'point':'wave',mouth:talk(t)});if(k>3.4){o.aL=70;o.eL=-95;o.handL='thumb';}}
  place(HERO,SEAT.x,SEAT.y-j.y*K*S,SEAT.z,S);await HERO.set(backlight(hero(o),'#ffd49a',.45));
  if(s.i===0){camShot(v,s.d,V(.1,1.2,.7),V(.15,1.2,.6),V(.62,1.15,-.05),V(.62,1.15,-.05),{t,shake:shake(u,.1,.02,5)});FOVMUL=punch(u,.12,.18);}
  if(s.i===1){camShot(v,s.d,V(.7,1.22,.3),V(.68,1.2,.36),V(-1.6,.9,2.4),V(-1.5,.95,2.5),{t});h+=phoneUI(540,860,.95,bankTop()+`<text x="-215" y="-120" font-family="Anton" font-size="110" fill="#1d1b26">R$ 3,17</text><text x="-215" y="-40" font-family="Anton" font-size="34" fill="#6a6680">ERA SÓ UM SONHO...</text>`,{});}
  if(s.i===2){camShot(v,s.d,V(-.35,1.15,1.35),V(-.3,1.12,1.2),V(.6,1.0,-.05),V(.62,1.02,-.05),{t});const k=u-2.2;const q=proj(SEAT.x,SEAT.y+.25,SEAT.z);if(k<1)h+=sweat(q.x,q.y-60,t);
    h+=label('E VOCÊ, O QUE FARIA',300,{size:92,p:seg(k,.2,.45)})+label('COM TREE(3) REAIS?',430,{size:112,fill:'#ffd23f',p:seg(k,.35,.6)});
    const cp=seg(k,1.5,1.85);if(cp>0)h+=`<g transform="translate(540 1180) scale(${(back(cp)*(1+Math.sin(t*8)*.03)).toFixed(3)})"><rect x="-300" y="-70" width="600" height="130" rx="65" fill="#ff2d55" stroke="#141414" stroke-width="10"/><text y="28" class="lb" font-size="84" fill="#fff" text-anchor="middle">COMENTA AÍ! 💬</text></g>`;}
  if(u<.3)h+=`<rect width="1080" height="1920" fill="#fff" opacity="${f(.8*(1-u/.3))}"/>`;
  FOCUS=s.i===1?V(.5,1.1,.6):V(SEAT.x,SEAT.y,SEAT.z);AP=s.i===1?.02:.004;roomLife(t);return h;}}
];

// ================= legendas e linha do tempo =================
const HL=[['TREE(3)','REAIS'],['TRAVAR','TELA'],['1','3','TREE(3)','GRAHAM','ZERO'],['METRO','1','MILHÃO'],['LUA','384','TRILHÕES'],['6','OCTILHÕES','TERRA'],['BURACO','NEGRO'],['ÁTOMOS','UNIVERSO'],['TREE(3)','COMENTA']];
const A_OFF=.12;let SCN=[],GROUPS=[];const norm=w=>w.replace(/[.,:!?]+$/,'').replace(/^[¿¡]/,'');
function setup(T){let t=0;T.forEach((b,i)=>{const d=b.dur+A_OFF+.3+(i===T.length-1?1.6:0);SCN.push({s:t,d});
  const words=b.text.toUpperCase().split(/\s+/).filter(Boolean),tot=words.reduce((a,w)=>a+w.length+1,0);let c=t+A_OFF,cur=[];
  words.forEach((w,k)=>{const wd=b.dur*(w.length+1)/tot;cur.push({w,t0:c,t1:c+wd,hl:HL[i].includes(norm(w))});c+=wd;if(cur.length===3||/[.,:!?]$/.test(w)||k===words.length-1){GROUPS.push({words:cur,t0:cur[0].t0,end:t+d});cur=[];}});t+=d;});
  for(let g=0;g<GROUPS.length-1;g++)GROUPS[g].end=Math.min(GROUPS[g].end,GROUPS[g+1].t0);GROUPS[GROUPS.length-1].end=t-1.6;
  SC.forEach((sc,i)=>sc.setup(SCN[i].d));return{total:t,scenes:SCN};}
function caption(t){const g=GROUPS.find(g=>t>=g.t0&&t<g.end);if(!g)return'';
  const p=seg(t,g.t0,g.t0+.16),s=.75+.25*back(p),len=g.words.reduce((a,w)=>a+w.w.length+1,0),sz=Math.min(112,940/(len*.47));
  const sp=g.words.map(w=>{const on=t>=w.t0,hl=on&&w.hl,j=hl?Math.sin(t*40)*Math.max(0,1-(t-w.t0)*4)*6:0;return `<tspan fill="${on?(w.hl?'#ffd23f':'#ffffff'):'#d9d9d9'}" dy="${f(j)}">${w.w}</tspan>`;}).join(' ');
  return `<g transform="translate(540 1560) scale(${s.toFixed(3)})"><text class="cap" y="8" font-size="${f(sz)}" fill="#000" stroke="#000" stroke-width="18" opacity=".4" text-anchor="middle">${g.words.map(w=>w.w).join(' ')}</text><text class="cap" font-size="${f(sz)}" stroke="#111" stroke-width="18" text-anchor="middle">${sp}</text></g>`;}
let CUR=-1;
window.render=async function(t){
  let i=SCN.findIndex(s=>t>=s.s&&t<s.s+s.d);if(i<0)i=SCN.length-1;const u=t-SCN[i].s,d=SCN[i].d;
  if(i!==CUR){CUR=i;mood(SC[i].mood);}
  SPR.forEach(s=>{s.mesh.visible=false;s.full=false;});FOVMUL=1;FOCUS=null;AP=.004;BL=[.55,.6,.82];STK.visible=i===3;TAPE.visible=false;
  const ui=await SC[i].up(u,d,t);
  cam.fov=(SC[i].fov||50)*FOVMUL;cam.updateProjectionMatrix();
  SPR.forEach(s=>{if(s.mesh.visible)bill(s);});
  bokeh.uniforms.focus.value=cam.position.distanceTo(FOCUS||V(0,0,0));bokeh.uniforms.aperture.value=AP;bokeh.uniforms.maxblur.value=AP>.005?.012:.007;
  bloom.strength=BL[0];bloom.radius=BL[1];bloom.threshold=BL[2];
  composer.render();
  document.getElementById('ui').innerHTML=ui;document.getElementById('caps').innerHTML=caption(t);
  document.getElementById('flash').setAttribute('opacity',i>0?f(.5*(1-seg(u,0,.2))):'0');
  const fr=Math.floor(t*30),gr=document.getElementById('grain');gr.setAttribute('x',f(-60+rnd(fr)*60));gr.setAttribute('y',f(-60+rnd(fr+5)*60));
};
window.INFO=setup(window.TIMING);window.GROUPS=GROUPS;
window.EVENTS=EV.map(([s,u,n,g])=>({t:+(SCN[s].s+u).toFixed(3),name:n,gain:g}));
window.WINDCURVE=SCN.flatMap(()=>[]);
window.DBG={cam,scene,renderer,THREE,SP};
await window.render(0);
window.ready=true;

// ================= CENÁRIO FIXO: campo aberto + árvore enorme =================
const WORLD=new THREE.Group();scene.add(WORLD);
// céu (cúpula com degradê) + nuvens
const skyT=ctex(8,1024,(g,w,h)=>{const gr=g.createLinearGradient(0,0,0,h);gr.addColorStop(0,'#3f7fd6');gr.addColorStop(.33,'#79b2ec');gr.addColorStop(.48,'#d8ecff');gr.addColorStop(.5,'#f2f6ff');gr.addColorStop(1,'#f2f6ff');g.fillStyle=gr;g.fillRect(0,0,w,h);});
const SKYM=new THREE.Mesh(new THREE.SphereGeometry(600,48,24),new THREE.MeshBasicMaterial({map:skyT,side:THREE.BackSide,fog:false,toneMapped:false}));scene.add(SKYM);
const CLOUDS=[];for(let i=0;i<22;i++){const m=new THREE.Mesh(new THREE.PlaneGeometry(1,.5),new THREE.MeshBasicMaterial({map:cloudTex,transparent:true,depthWrite:false,fog:false,toneMapped:false}));const s=50+R()*70;m.scale.set(s,s,1);const a=R()*TAU,r=200+R()*200;m.userData={x:Math.cos(a)*r,z:Math.sin(a)*r,y:80+R()*80};scene.add(m);CLOUDS.push(m);}
scene.fog=new THREE.Fog('#d9e8f5',60,330);
// chão gramado (textura) + colinas + lago + montanhas
const grassT=ctex(512,512,(g,w,h)=>{g.fillStyle='#69a043';g.fillRect(0,0,w,h);noise(g,w,h,26);blotch(g,w,h,80,'rgba(40,80,20,A)',.22,50);blotch(g,w,h,60,'rgba(180,210,90,A)',.18,40);for(let i=0;i<2600;i++){g.strokeStyle=R()>.5?'rgba(50,90,25,.5)':'rgba(150,200,90,.4)';g.lineWidth=1.5;const x=R()*w,y=R()*h;g.beginPath();g.moveTo(x,y);g.lineTo(x+(R()-.5)*4,y-6-R()*6);g.stroke();}},[90,90]);
const GROUND=M(new THREE.PlaneGeometry(700,700),std({map:grassT}),WORLD,0,0,0,false);GROUND.rotation.x=-Math.PI/2;
const dirtT=ctex(256,256,(g,w,h)=>{const r=g.createRadialGradient(128,128,10,128,128,128);r.addColorStop(0,'rgba(120,90,55,.95)');r.addColorStop(.6,'rgba(120,95,60,.55)');r.addColorStop(1,'rgba(120,95,60,0)');g.fillStyle=r;g.fillRect(0,0,w,h);});
const DIRT=M(new THREE.PlaneGeometry(9,9),std({map:dirtT,transparent:true,depthWrite:false}),WORLD,0,.01,0,false);DIRT.rotation.x=-Math.PI/2;
for(let i=0;i<14;i++){const a=i/14*TAU+R()*.3,r=90+R()*90;const h=M(new THREE.SphereGeometry(1,24,12,0,TAU,0,Math.PI/2),std({color:['#5f9a3e','#6aa84a','#558f38'][i%3],roughness:1}),WORLD,Math.cos(a)*r,0,Math.sin(a)*r,false);h.scale.set(30+R()*40,8+R()*14,30+R()*40);}
const lakeT=ctex(512,512,(g,w,h)=>{g.fillStyle='#5fa8d8';g.fillRect(0,0,w,h);g.strokeStyle='rgba(255,255,255,.35)';for(let i=0;i<80;i++){g.lineWidth=2;g.beginPath();const x=R()*w,y=R()*h;g.moveTo(x,y);g.lineTo(x+20+R()*40,y);g.stroke();}});
const LAKE=M(new THREE.CircleGeometry(1,48),new THREE.MeshStandardMaterial({map:lakeT,roughness:.15,metalness:.2}),WORLD,-30,.03,-55,false);LAKE.rotation.x=-Math.PI/2;LAKE.scale.set(26,14,1);
for(let i=0;i<9;i++){const x=-260+i*65+R()*20,z=-330-R()*60;const mt=M(new THREE.ConeGeometry(50+R()*40,90+R()*80,7),std({color:['#7d8aa8','#8a96b4','#6f7c9c'][i%3],flatShading:true}),WORLD,x,30,z,false);const sn=M(new THREE.ConeGeometry(18,26,7),std({color:'#f4f6fb',flatShading:true}),WORLD,x,mt.geometry.parameters.height/2+18,z,false);sn.position.y=30+mt.geometry.parameters.height/2-12;}
// árvores pequenas ao longe e arbustos/flores perto
const folCols=['#4f8a3a','#5d9a42','#3f7a34','#6aa84a'];
function smallTree(x,z,s){const g=new THREE.Group();g.position.set(x,0,z);g.scale.setScalar(s);WORLD.add(g);cyl(.2,.3,3,std({color:'#6b4a32'}),g,0,1.5,0,8);for(let k=0;k<5;k++)M(new THREE.IcosahedronGeometry(1.2,1),std({color:folCols[k%4],flatShading:true}),g,(R()-.5)*1.6,3.3+R()*1.2,(R()-.5)*1.6);}
for(let i=0;i<34;i++){const a=R()*TAU,r=22+R()*70;smallTree(Math.cos(a)*r,Math.sin(a)*r,.8+R()*.8);}
const FLOWERS=new THREE.InstancedMesh(new THREE.SphereGeometry(.06,6,4),std({color:'#ffffff'}),500);{const d=new THREE.Object3D(),c=new THREE.Color();for(let i=0;i<500;i++){const a=R()*TAU,r=3+R()*18;d.position.set(Math.cos(a)*r,.12,Math.sin(a)*r);d.updateMatrix();FLOWERS.setMatrixAt(i,d.matrix);c.set(['#ffd23f','#ffffff','#ff7ac8','#a98bff'][i%4]);FLOWERS.setColorAt(i,c);}WORLD.add(FLOWERS);}
// tufos de grama 3D perto da árvore
const GRASS=new THREE.InstancedMesh((()=>{const g=new THREE.PlaneGeometry(.06,.35,1,3);g.translate(0,.175,0);return g;})(),std({color:'#ffffff',side:THREE.DoubleSide,roughness:.8}),7000);
{const d=new THREE.Object3D(),c=new THREE.Color();for(let i=0;i<7000;i++){const a=R()*TAU,r=1.2+Math.sqrt(R())*14;d.position.set(Math.cos(a)*r,0,Math.sin(a)*r);d.rotation.set((R()-.5)*.4,R()*TAU,(R()-.5)*.4);d.scale.setScalar(.6+R()*.9);d.updateMatrix();GRASS.setMatrixAt(i,d.matrix);c.setHSL(.24+R()*.06,.45+R()*.2,.3+R()*.14);GRASS.setColorAt(i,c);}GRASS.receiveShadow=true;WORLD.add(GRASS);}

// ---------- A ÁRVORE (igual em todas as cenas) ----------
const barkT=ctex(256,512,(g,w,h)=>{g.fillStyle='#6b4a32';g.fillRect(0,0,w,h);noise(g,w,h,40);g.strokeStyle='rgba(30,15,5,.55)';for(let i=0;i<70;i++){g.lineWidth=2+R()*4;const x=R()*w;g.beginPath();g.moveTo(x,0);g.bezierCurveTo(x+14,h/3,x-14,h*2/3,x,h);g.stroke();}g.strokeStyle='rgba(160,120,80,.25)';for(let i=0;i<40;i++){g.lineWidth=2;const x=R()*w;g.beginPath();g.moveTo(x,0);g.lineTo(x+(R()-.5)*10,h);g.stroke();}},[2,2]);
const barkM=std({map:barkT,roughness:.95});
const TREE=new THREE.Group();WORLD.add(TREE);
const TRUNK=new THREE.Mesh((()=>{const g=new THREE.CylinderGeometry(.45,.8,8.4,24,12);const p=g.attributes.position;for(let i=0;i<p.count;i++){const y=p.getY(i),a=Math.atan2(p.getZ(i),p.getX(i));const k=1+Math.sin(a*5+y)*.04+(y<-3?(-3-y)*.25*(.6+.4*Math.sin(a*3)):0);p.setX(i,p.getX(i)*k);p.setZ(i,p.getZ(i)*k);}g.computeVertexNormals();return g;})(),barkM);TRUNK.position.y=4.2;TRUNK.castShadow=TRUNK.receiveShadow=true;TREE.add(TRUNK);
// raízes
for(let i=0;i<7;i++){const a=i/7*TAU+.3;const cv=new THREE.CatmullRomCurve3([V(Math.cos(a)*.5,.6,Math.sin(a)*.5),V(Math.cos(a)*1.1,.2,Math.sin(a)*1.1),V(Math.cos(a)*1.8,-.05,Math.sin(a)*1.8)]);M(new THREE.TubeGeometry(cv,10,.16,8),barkM,TREE);}
function branchMesh(par,pts,r0,r1){const cv=new THREE.CatmullRomCurve3(pts);const g=new THREE.TubeGeometry(cv,24,1,10);const p=g.attributes.position;// afina ao longo do galho
  const n=25,rs=11;for(let i=0;i<n;i++){const c=cv.getPoint(i/24),k=lerp(r0,r1,i/24);for(let j=0;j<rs;j++){const idx=i*rs+j;const x=p.getX(idx)-c.x,y=p.getY(idx)-c.y,z=p.getZ(idx)-c.z;p.setXYZ(idx,c.x+x*k,c.y+y*k,c.z+z*k);}}g.computeVertexNormals();const m=new THREE.Mesh(g,barkM);m.castShadow=m.receiveShadow=true;par.add(m);return m;}
// galhos fixos (copa)
const BR=[];for(const[a,y,len,up]of[[.4,6.4,3.4,1.6],[2.2,6.8,3.0,1.8],[3.8,6.2,3.6,1.5],[5.2,7.0,2.6,1.9],[1.2,7.2,2.2,2.0],[4.6,6.0,2.8,1.2]]){BR.push(branchMesh(TREE,[V(0,y,0),V(Math.cos(a)*len*.5,y+up*.45,Math.sin(a)*len*.5),V(Math.cos(a)*len,y+up,Math.sin(a)*len)],.32,.08));}
// galhos baixos usados na tentativa 1 (B_OK firme, B_THIN fino que quebra em 2 partes)
const B_OK=branchMesh(TREE,[V(0,3.0,0),V(.4,3.15,1.3),V(.6,3.35,2.5)],.26,.1);
const BTHIN=new THREE.Group();BTHIN.position.set(.35,3.05,0);TREE.add(BTHIN);
const BT_IN=branchMesh(BTHIN,[V(0,0,0),V(.7,.08,-.05),V(1.3,.16,-.1)],.12,.08);
const BT_OUT=new THREE.Group();BT_OUT.position.set(1.3,.16,-.1);BTHIN.add(BT_OUT);
const BT_OUTM=branchMesh(BT_OUT,[V(0,0,0),V(.6,.06,0),V(1.2,.14,.05)],.08,.04);
BT_OUTM.material=barkM.clone();BT_IN.material=BT_OUTM.material;
// copa: nuvens de folhas (esferas facetadas) + folhas
const CANOPY=[];for(let k=0;k<26;k++){const a=R()*TAU,r=1+R()*3.8,y=8.6+R()*2.6-r*.2;const m=M(new THREE.IcosahedronGeometry(1,2),std({color:folCols[k%4],roughness:.85,flatShading:true}),TREE,Math.cos(a)*r,y,Math.sin(a)*r);m.scale.setScalar(1.3+R()*1.1);m.userData.p=m.position.clone();CANOPY.push(m);}
const LEAVES=new THREE.InstancedMesh(new THREE.PlaneGeometry(.18,.12),std({map:leafTex,side:THREE.DoubleSide,alphaTest:.5,transparent:true}),120);LEAVES.count=0;scene.add(LEAVES);{const c=new THREE.Color();for(let i=0;i<120;i++){c.setHSL(.22+R()*.1,.6,.35+R()*.15);LEAVES.setColorAt(i,c);}}

// ---------- luzes, pós ----------
const hemi=new THREE.HemisphereLight('#d7e9ff','#5d7a45',1.15);scene.add(hemi);
const sun=new THREE.DirectionalLight('#fff0d6',3.1);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);Object.assign(sun.shadow.camera,{left:-12,right:12,top:12,bottom:-12,near:1,far:120});sun.shadow.bias=-.0004;sun.shadow.normalBias=.03;sun.shadow.radius=3;scene.add(sun,sun.target);
const SUNDIR=V(.55,.62,.55).normalize();sun.position.copy(SUNDIR).multiplyScalar(60);sun.target.position.set(0,2,0);
const SUNSPR=new THREE.Mesh(new THREE.PlaneGeometry(40,40),new THREE.MeshBasicMaterial({map:soft,color:'#fff6d8',transparent:true,depthWrite:false,fog:false,toneMapped:false}));scene.add(SUNSPR);
const composer=new EffectComposer(renderer);composer.addPass(new RenderPass(scene,cam));
const bokeh=new BokehPass(scene,cam,{focus:6,aperture:.001,maxblur:.006});composer.addPass(bokeh);
const bloom=new UnrealBloomPass(new THREE.Vector2(540,960),.35,.6,.88);composer.addPass(bloom);composer.addPass(new OutputPass());
function worldTick(t){SKYM.position.copy(cam.position);SUNSPR.position.copy(cam.position).addScaledVector(SUNDIR,500);SUNSPR.lookAt(cam.position);
  CLOUDS.forEach((c,i)=>{const u=c.userData;c.position.set(cam.position.x+u.x+((t*3+i*30)%200)-100,u.y,cam.position.z+u.z);c.lookAt(cam.position);});
  CANOPY.forEach((m,k)=>{m.position.set(m.userData.p.x+Math.sin(t*1.3+k)*.05,m.userData.p.y+Math.sin(t*1.1+k*2)*.03,m.userData.p.z+Math.cos(t*1.2+k)*.05);});
  // folhas soltas caindo
  LEAVES.count=60;const d=new THREE.Object3D();for(let i=0;i<60;i++){const ph=(t*.08+rnd(i))%1,a=rnd(i+1)*TAU,r=1+rnd(i+2)*5;d.position.set(Math.cos(a)*r+Math.sin(t+i)*.5,8.5-ph*8.5,Math.sin(a)*r+Math.cos(t*.8+i)*.4);d.rotation.set(t*2+i,t*1.5,i);d.scale.setScalar(ph<.97?1:0);d.updateMatrix();LEAVES.setMatrixAt(i,d.matrix);}LEAVES.instanceMatrix.needsUpdate=true;}

// ---------- câmera ----------
let FOV=50,FOVMUL=1,FOCUS=null,AP=.001;
function lens(){cam.fov=FOV*FOVMUL;cam.updateProjectionMatrix();}
function camShot(v,d,p0,p1,l0,l1,o={}){const k=(o.e||ease)(cl(v/d)),sh=o.shake||[0,0],t=o.t||v;const p=V(0,0,0).lerpVectors(p0,p1,k),l=V(0,0,0).lerpVectors(l0,l1,k);
  cam.position.set(p.x+sh[0]+Math.sin(t*1.3)*.015,p.y+sh[1]+Math.sin(t*1.9)*.012,p.z);cam.lookAt(l.x+sh[0]*.5,l.y+sh[1]*.5,l.z);lens();}
function orbit(v,d,c,r0,r1,a0,a1,y0,y1,ly,o={}){const k=(o.e||ease)(cl(v/d)),a=lerp(a0,a1,k),r=lerp(r0,r1,k),y=lerp(y0,y1,k);const sh=o.shake||[0,0];cam.position.set(c.x+Math.cos(a)*r+sh[0],y+sh[1],c.z+Math.sin(a)*r);cam.lookAt(c.x,ly,c.z);lens();}
const P2=V(0,0,0);function proj(x,y,z){if(x&&x.isVector3){z=x.z;y=x.y;x=x.x;}cam.updateMatrixWorld();P2.set(x,y,z).project(cam);return{x:(P2.x+1)/2*1080,y:(1-P2.y)/2*1920};}
function wpos(s){return s.mesh.getWorldPosition(V(0,0,0));}
function bill(s){const p=wpos(s);s.mesh.rotation.y=Math.atan2(cam.position.x-p.x,cam.position.z-p.z);}
// queda de corpo rígido simples (tábua, caixa): devolve posição e rotação no tempo u com quique no chão
function fall(u,t0,p0,v0,w0,o={}){const g=9.8,e=o.e??.3,fr=o.fr??.55,floor=o.floor??0,h=1/120;let x=p0[0],y=p0[1],z=p0[2],vx=v0[0],vy=v0[1],vz=v0[2],rx=0,ry=0,rz=0,wx=w0[0],wy=w0[1],wz=w0[2],s=0,landed=-1;const T=Math.max(0,u-t0);
  while(s<T){vy-=g*h;x+=vx*h;y+=vy*h;z+=vz*h;rx+=wx*h;ry+=wy*h;rz+=wz*h;if(y<floor){y=floor;if(landed<0)landed=t0+s;if(Math.abs(vy)>1.2){vy=-vy*e;wx*=.4;wz*=.4;}else{vy=0;}vx*=fr;vz*=fr;if(vy===0){wx*=.85;wz*=.85;wy*=.85;rx=lerp(rx,Math.round(rx/Math.PI)*Math.PI,.08);rz=lerp(rz,Math.round(rz/Math.PI)*Math.PI,.08);}}s+=h;}
  return{p:V(x,y,z),r:[rx,ry,rz],landed};}

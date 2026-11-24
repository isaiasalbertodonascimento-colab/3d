// ================= BAIRRO =================
const TOWN=new THREE.Group();scene.add(TOWN);
const SKY={};
SKY.mk=(stops,haze)=>ctex(8,1024,(g,w,h)=>{const gr=g.createLinearGradient(0,0,0,h);stops.forEach(([o,c])=>gr.addColorStop(o,c));g.fillStyle=gr;g.fillRect(0,0,w,h);});
SKY.tex={day:SKY.mk([[0,'#2a63c9'],[.32,'#5e97e4'],[.49,'#cfe5ff'],[.5,'#e6f1ff'],[1,'#e6f1ff']]),
 sunset:SKY.mk([[0,'#1f2a63'],[.25,'#5a4f9c'],[.4,'#e0756b'],[.49,'#ffc773'],[.5,'#ffd690'],[1,'#ffd690']]),
 storm:SKY.mk([[0,'#141a24'],[.35,'#2c3442'],[.5,'#56606e'],[1,'#56606e']])};
SKY.mesh=new THREE.Mesh(new THREE.SphereGeometry(700,48,24),new THREE.MeshBasicMaterial({map:SKY.tex.day,side:THREE.BackSide,fog:false,toneMapped:false}));TOWN.add(SKY.mesh);
SKY.sun=new THREE.Group();TOWN.add(SKY.sun);
{const d=new THREE.Mesh(new THREE.PlaneGeometry(40,40),new THREE.MeshBasicMaterial({map:soft,color:'#fffbe6',transparent:true,depthWrite:false,fog:false,toneMapped:false}));SKY.sun.add(d);
 const gl=new THREE.Mesh(new THREE.PlaneGeometry(220,220),new THREE.MeshBasicMaterial({map:soft,color:'#ffe9b0',transparent:true,opacity:.5,depthWrite:false,blending:THREE.AdditiveBlending,fog:false,toneMapped:false}));gl.position.z=-1;SKY.sun.add(gl);SKY.sunGlow=gl;SKY.sunDisk=d;}
const CLOUDS=[];for(let i=0;i<26;i++){const m=new THREE.Mesh(new THREE.PlaneGeometry(1,.5),new THREE.MeshBasicMaterial({map:cloudTex,transparent:true,depthWrite:false,fog:false,toneMapped:false}));const s=50+R()*70;m.scale.set(s,s,1);const a=R()*TAU,r=180+R()*220;m.userData={x:Math.cos(a)*r,z:Math.sin(a)*r,y:70+R()*80};TOWN.add(m);CLOUDS.push(m);}
const grassT=ctex(512,512,(g,w,h)=>{g.fillStyle='#5f8f3a';g.fillRect(0,0,w,h);noise(g,w,h,30);blotch(g,w,h,80,'rgba(30,60,10,A)',.25,50);blotch(g,w,h,60,'rgba(170,200,90,A)',.18,40);for(let i=0;i<3000;i++){g.strokeStyle=R()>.5?'rgba(40,80,20,.5)':'rgba(140,190,80,.4)';g.lineWidth=1.5;const x=R()*w,y=R()*h;g.beginPath();g.moveTo(x,y);g.lineTo(x+(R()-.5)*4,y-6-R()*6);g.stroke();}},[80,80]);
const ground=mesh(new THREE.PlaneGeometry(600,600),std({map:grassT}),TOWN);ground.rotation.x=-Math.PI/2;ground.castShadow=false;
const asphT=ctex(1024,256,(g,w,h)=>{g.fillStyle='#45484d';g.fillRect(0,0,w,h);noise(g,w,h,36);blotch(g,w,h,30,'rgba(0,0,0,A)',.2,60);g.fillStyle='#e8e2c8';for(let x=0;x<w;x+=256)g.fillRect(x+40,h/2-5,150,10);},[30,1]);
const road=mesh(new THREE.PlaneGeometry(300,6),std({map:asphT,roughness:.85}),TOWN,0,.01,0);road.rotation.x=-Math.PI/2;road.castShadow=false;
const swT=ctex(512,128,(g,w,h)=>{g.fillStyle='#b9b6ad';g.fillRect(0,0,w,h);noise(g,w,h,22);g.fillStyle='rgba(0,0,0,.25)';for(let x=0;x<w;x+=64)g.fillRect(x,0,3,h);},[60,1]);
for(const z of[-3.8,3.8])box(300,.12,1.6,std({map:swT}),TOWN,0,.06,z);
const sidingTex={};function siding(col){if(sidingTex[col])return sidingTex[col];return sidingTex[col]=ctex(512,256,(g,w,h)=>{g.fillStyle=col;g.fillRect(0,0,w,h);g.fillStyle='rgba(0,0,0,.08)';for(let y=0;y<h;y+=14)g.fillRect(0,y,w,2);noise(g,w,h,14);});}
function frontTex(col,seed){return ctex(512,256,(g,w,h)=>{g.fillStyle=col;g.fillRect(0,0,w,h);g.fillStyle='rgba(0,0,0,.08)';for(let y=0;y<h;y+=14)g.fillRect(0,y,w,2);noise(g,w,h,14);
  const win=(x,y,ww,hh)=>{g.fillStyle='#f7f5f0';g.fillRect(x-6,y-6,ww+12,hh+12);const gr=g.createLinearGradient(x,y,x+ww,y+hh);gr.addColorStop(0,'#9cc8ee');gr.addColorStop(1,'#4a6f99');g.fillStyle=gr;g.fillRect(x,y,ww,hh);g.fillStyle='#f7f5f0';g.fillRect(x+ww/2-2,y,4,hh);g.fillRect(x,y+hh/2-2,ww,4);g.fillStyle='rgba(255,255,255,.35)';g.beginPath();g.moveTo(x,y+hh*.7);g.lineTo(x+ww*.4,y);g.lineTo(x+ww*.6,y);g.lineTo(x,y+hh);g.fill();};
  win(50,70,90,80);win(372,70,90,80);g.fillStyle=['#7a3b2a','#2f4f7a','#3d6b3d'][seed%3];g.fillRect(220,96,72,160);g.fillStyle='#e8c35a';g.beginPath();g.arc(278,180,5,0,7);g.fill();g.fillStyle='#f7f5f0';g.fillRect(212,90,88,8);});}
const roofT=[ '#b4553f','#8f4a3a','#5d6470','#a8673f'].map(c=>ctex(256,256,(g,w,h)=>{g.fillStyle=c;g.fillRect(0,0,w,h);for(let y=0;y<h;y+=22){g.fillStyle='rgba(0,0,0,.28)';g.fillRect(0,y+18,w,4);for(let x=(y/22%2)*16;x<w;x+=32){g.fillStyle='rgba(0,0,0,.18)';g.fillRect(x,y,2,20);}}noise(g,w,h,26);},[3,3]));
const HOUSES=[];const wallCols=['#f3e7cf','#cfe3f0','#f4d6c6','#dfeccf','#f6efc2','#e6d8f0'];
function house(x,z,face,i){
  const g=new THREE.Group();g.position.set(x,0,z);g.rotation.y=face>0?0:Math.PI;TOWN.add(g);
  const col=wallCols[i%6],sm=std({map:siding(col)}),fm=std({map:frontTex(col,i)});
  const body=new THREE.Mesh(new THREE.BoxGeometry(7,3.4,6.4),[sm,sm,sm,sm,fm,sm]);body.position.y=1.7;body.castShadow=body.receiveShadow=true;g.add(body);
  box(7.2,.3,6.6,std({color:'#9a948a'}),g,0,.15,0);
  const shp=new THREE.Shape();shp.moveTo(-4,0);shp.lineTo(4,0);shp.lineTo(0,2.4);shp.lineTo(-4,0);
  const rg=new THREE.ExtrudeGeometry(shp,{depth:7.2,bevelEnabled:false});rg.translate(0,0,-3.6);
  const roof=new THREE.Group();roof.position.set(0,3.4,0);g.add(roof);
  const rm=mesh(rg,[std({color:'#e9e1cf'}),std({map:roofT[i%4],roughness:.75})],roof);
  box(.6,1.4,.6,std({color:'#8a4a3a'}),roof,2,1.6,-1);
  box(1.6,.12,1.2,std({color:'#f7f5f0'}),g,0,2.6,3.6);box(.12,2.5,.12,std({color:'#f7f5f0'}),g,-.7,1.3,4.1);box(.12,2.5,.12,std({color:'#f7f5f0'}),g,.7,1.3,4.1);
  HOUSES.push({g,roof,x,z,home:roof.position.clone(),seed:R()});
}
let hi=0;for(const z of[-12.5,12.5,-38,38])for(let x=-60;x<=60;x+=12){if(Math.abs(z)<20||R()>.15)house(x+(R()-.5)*2,z,z<0?1:-1,hi++);}
for(const z of[-25.25,25.25]){const r=mesh(new THREE.PlaneGeometry(300,6),std({map:asphT,roughness:.85}),TOWN,0,.012,z);r.rotation.x=-Math.PI/2;r.castShadow=false;}
const barkT=ctex(128,256,(g,w,h)=>{g.fillStyle='#6b4a32';g.fillRect(0,0,w,h);noise(g,w,h,40);g.strokeStyle='rgba(30,15,5,.5)';for(let i=0;i<40;i++){g.lineWidth=2+R()*3;const x=R()*w;g.beginPath();g.moveTo(x,0);g.bezierCurveTo(x+10,h/3,x-10,h*2/3,x,h);g.stroke();}});
const TREES=[];const folCols=['#4f8a3a','#5d9a42','#3f7a34','#6aa84a'];
function tree(x,z,s=1){const g=new THREE.Group();g.position.set(x,0,z);g.scale.setScalar(s);TOWN.add(g);
  const tr=mesh(new THREE.CylinderGeometry(.18,.3,3.2,10),std({map:barkT}),g,0,1.6,0);const fol=[];
  for(let k=0;k<7;k++){const m=mesh(new THREE.IcosahedronGeometry(1,2),std({color:folCols[(k+TREES.length)%4],roughness:.85}),g,(R()-.5)*1.8,3.3+R()*1.6,(R()-.5)*1.8);m.scale.setScalar(1+R()*.6);m.userData.p=m.position.clone();fol.push(m);}
  TREES.push({g,fol,ph:R()*TAU});}
for(let x=-58;x<=58;x+=12){for(const z of[-6.2,6.2])if(R()>.3)tree(x+5.5+(R()-.5)*1.5,z+(R()-.5)*1.2,.8+R()*.5);}
tree(4.4,-5.8,1.05);tree(-4.8,-7.4,1.15);

const POSTS=[];for(let x=-54;x<=54;x+=12){for(const z of[-4.4,4.4]){const p=new THREE.Group();p.position.set(x+(z>0?6:0),0,z);TOWN.add(p);mesh(new THREE.CylinderGeometry(.06,.08,4.2,8),std({color:'#3a3f47',metalness:.5,roughness:.4}),p,0,2.1,0);box(.9,.06,.06,std({color:'#3a3f47'}),p,.4*(z>0?-1:1),4.15,0);const l=mesh(new THREE.SphereGeometry(.14,12,8),new THREE.MeshStandardMaterial({color:'#fff6d8',emissive:'#ffd98a',emissiveIntensity:.2}),p,.8*(z>0?-1:1),4.05,0);p.userData.bulb=l;POSTS.push(p);}}
{const fm=std({color:'#f7f5f0',roughness:.6});const geo=new THREE.BoxGeometry(.09,.9,.04);const inst=new THREE.InstancedMesh(geo,fm,1600);let n=0;const d=new THREE.Object3D();
 for(let x=-60;x<=60;x+=12)for(const z of[-5.0,5.0]){for(let k=0;k<26;k++){const px=x-6+k*.22;if(Math.abs(px)<4.2)continue;d.position.set(px,.45,z);d.updateMatrix();inst.setMatrixAt(n++,d.matrix);}}
 inst.count=n;inst.castShadow=inst.receiveShadow=true;TOWN.add(inst);}
// grama 3D com vento no shader
const GU={uTime:{value:0},uWind:{value:.3},uDir:{value:new THREE.Vector2(1,0)},uBlastC:{value:new THREE.Vector3(0,0,-6.3)},uBlast:{value:0}};
{
  const geo=new THREE.PlaneGeometry(.07,.5,1,4);geo.translate(0,.25,0);const p=geo.attributes.position;for(let i=0;i<p.count;i++){const y=p.getY(i);p.setX(i,p.getX(i)*(1-y/.5*.85));}
  const mat=std({color:'#ffffff',side:THREE.DoubleSide,roughness:.8});
  mat.onBeforeCompile=sh=>{Object.assign(sh.uniforms,GU);sh.vertexShader='uniform float uTime,uWind,uBlast;uniform vec2 uDir;uniform vec3 uBlastC;\n'+sh.vertexShader.replace('#include <begin_vertex>',`#include <begin_vertex>
    vec3 ip=vec3(instanceMatrix[3][0],instanceMatrix[3][1],instanceMatrix[3][2]);float hh=position.y/0.5;float bw=hh*hh;
    vec2 d=uDir*uWind*(0.45+0.35*sin(uTime*3.1+ip.x*0.8+ip.z*0.6))+vec2(sin(uTime*1.7+ip.z*1.3),cos(uTime*1.3+ip.x*1.1))*0.07;
    vec2 bd=ip.xz-uBlastC.xz;d+=normalize(bd+vec2(0.0001))*uBlast*exp(-dot(bd,bd)/22.0)*1.6;
    vec3 wo=vec3(d.x,-length(d)*0.4,d.y)*bw*0.5;transformed+=inverse(mat3(instanceMatrix))*wo;`);};
  const areas=[[-18,18,-9.3,-4.6,9000],[-18,18,4.6,9,6000]];let tot=areas.reduce((a,b)=>a+b[4],0);
  const inst=new THREE.InstancedMesh(geo,mat,tot);const d=new THREE.Object3D(),c=new THREE.Color();let n=0;
  for(const[x0,x1,z0,z1,cnt]of areas)for(let i=0;i<cnt;i++){d.position.set(x0+R()*(x1-x0),0,z0+R()*(z1-z0));if(Math.abs(d.position.x)<3.2&&d.position.z<-5.9&&d.position.z>-10.2)d.position.y=-2;if(Math.abs(d.position.x-HX)<2.6&&d.position.z>4.6&&d.position.z<9.2&&R()<.93)d.position.y=-2;d.rotation.set(0,R()*TAU,0);d.scale.setScalar(.6+R()*.9);d.updateMatrix();inst.setMatrixAt(n,d.matrix);c.setHSL(.24+R()*.06,.45+R()*.2,.28+R()*.14);inst.setColorAt(n,c);n++;}
  inst.receiveShadow=true;TOWN.add(inst);
}

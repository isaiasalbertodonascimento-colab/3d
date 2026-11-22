// ---------- CÉU: queda de 1.000 m — avião, nuvens, chão em retalhos, campo de pouso, caixas, pedaço de avião ----------
const G=9.81,ALT=1000;
const SKYW=new THREE.Group();scene.add(SKYW);const SW={};const A3=AMB3D(THREE);
{
  // chão visto do alto: retalhos de plantação, rio, estradas, cidadezinha
  const fieldT=tex(2048,2048,(g,w,h)=>{const cols=['#7a9a48','#a8b05a','#c8a85a','#5f8a3e','#9aa84e','#b89a58','#6a8a40','#d0b870'];
    for(let i=0;i<260;i++){g.save();g.translate(R()*w,R()*h);g.rotate((R()-.5)*.5);g.fillStyle=cols[i%cols.length];const ww=80+R()*240,hh=60+R()*200;g.fillRect(-ww/2,-hh/2,ww,hh);g.strokeStyle='rgba(60,50,30,.25)';g.lineWidth=2;for(let k=-ww/2;k<ww/2;k+=10){g.beginPath();g.moveTo(k,-hh/2);g.lineTo(k,hh/2);g.stroke();}g.restore();}
    gnoise(g,w,h,22);
    g.strokeStyle='#5a8ab8';g.lineWidth=34;g.lineCap='round';g.beginPath();g.moveTo(0,h*.3);for(let x=0;x<=w;x+=40)g.lineTo(x,h*.3+Math.sin(x/w*7)*160+Math.sin(x/w*19)*40);g.stroke();g.strokeStyle='rgba(255,255,255,.25)';g.lineWidth=8;g.stroke();
    g.strokeStyle='#c8c0b0';g.lineWidth=12;for(const y of[.62,.85]){g.beginPath();g.moveTo(0,h*y);g.lineTo(w,h*y+60);g.stroke();}g.beginPath();g.moveTo(w*.55,0);g.lineTo(w*.5,h);g.stroke();
    for(let i=0;i<180;i++){const x=w*.42+R()*w*.22,y=h*.55+R()*h*.18;g.fillStyle=['#d86a4a','#e8e0d0','#b85a3a','#f0f0e8'][i%4];g.fillRect(x,y,10+R()*14,10+R()*14);}
    for(let i=0;i<900;i++){g.fillStyle=`rgba(${R()>.5?'40,70,30':'60,90,40'},${.5+R()*.4})`;g.beginPath();g.arc(R()*w,R()*h,4+R()*9,0,7);g.fill();}},[6,6]);
  const ground=M3(new THREE.PlaneGeometry(9000,9000),std({map:fieldT,roughness:1}),SKYW,0,0,0);ground.rotation.x=-Math.PI/2;ground.castShadow=false;SW.ground=ground;
  // morros ao longe
  [['#7a7a98',-900,180,1400,-2200],['#8a8aa8',800,240,1600,-2600],['#9a8aa8',0,140,1200,-1800]].forEach(([c,x,hh,ww,z])=>{const m=M3(new THREE.SphereGeometry(1,28,14,0,TAU,0,Math.PI/2),new THREE.MeshBasicMaterial({color:c}),SKYW,x,0,z);m.scale.set(ww,hh,500);m.castShadow=false;});
  // céu dourado e sol
  const skyT=tex(8,1024,(g,w,h)=>{const gr=g.createLinearGradient(0,0,0,h);[[0,'#2a4a9a'],[.3,'#5a82cc'],[.43,'#e8a888'],[.5,'#ffc890'],[1,'#e8b890']].forEach(([o,c])=>gr.addColorStop(o,c));g.fillStyle=gr;g.fillRect(0,0,w,h);});
  SW.sky=new THREE.Mesh(new THREE.SphereGeometry(6000,32,16),new THREE.MeshBasicMaterial({map:skyT,side:THREE.BackSide,fog:false,toneMapped:false}));SKYW.add(SW.sky);
  SW.sunG=glowSpr(SKYW,'#ffe0a0',1400,3000,900,-4000);const sd=glowSpr(SKYW,'#fff6d8',300,3000,900,-3990);
  // nuvens: muitas, em camadas
  const cloudT=tex(512,256,(g)=>{for(let i=0;i<46;i++){const x=80+R()*350,y=110+(R()-.3)*70,r=40+R()*75;const gr=g.createRadialGradient(x,y,0,x,y,r);gr.addColorStop(0,'rgba(255,255,255,.82)');gr.addColorStop(.6,'rgba(255,255,255,.35)');gr.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=gr;g.fillRect(0,0,512,256);}
    g.globalCompositeOperation='source-atop';const sh=g.createLinearGradient(0,110,0,250);sh.addColorStop(0,'rgba(255,200,170,0)');sh.addColorStop(1,'rgba(150,120,160,.45)');g.fillStyle=sh;g.fillRect(0,0,512,256);});
  SW.clouds=[];for(let i=0;i<90;i++){const m=new THREE.Mesh(new THREE.PlaneGeometry(1,.5),new THREE.MeshBasicMaterial({map:cloudT,transparent:true,depthWrite:false,color:i%3?'#fff4ec':'#ffe2d0'}));const s=50+R()*120;m.scale.set(s,s,1);
    const a=R()*TAU,r=170+R()*700;m.position.set(Math.cos(a)*r,150+R()*780,Math.sin(a)*r);m.userData.p=m.position.clone();SKYW.add(m);SW.clouds.push(m);}
  // pássaros
  SW.birds=A3.birds(SKYW,{n:9,y:640,z:-120});
  // avião (asa alta), parado no céu, porta aberta voltada para +z
  const P=new THREE.Group();P.position.set(0,ALT,0);SKYW.add(P);SW.plane=P;
  const white=std({color:'#f2f0ea',roughness:.4,metalness:.1}),red=std({color:'#c8322e',roughness:.4}),dark=std({color:'#2a2a30',roughness:.5});
  const fus=M3(new THREE.CylinderGeometry(1.15,.9,8,28),white,P,0,1.0,0);fus.rotation.z=Math.PI/2;
  const nose=M3(new THREE.SphereGeometry(1.15,24,16,0,TAU,0,Math.PI/2),white,P,4,1.0,0);nose.rotation.z=-Math.PI/2;
  M3(new THREE.ConeGeometry(.9,3,24),white,P,-5.4,1.1,0).rotation.z=Math.PI/2;
  B3(1.6,2.2,.12,white,P,-6.2,2.4,0);B3(.9,.08,4,white,P,-6.3,1.4,0);
  B3(2.2,.14,14,white,P,.6,2.25,0);for(const z of[-4.5,4.5]){B3(2.2,.15,.15,red,P,.6,2.3,z);}
  
  B3(8.1,.18,.02,red,P,0,.75,1.16);B3(8.1,.18,.02,red,P,0,.75,-1.16);
  SW.door=B3(1.3,1.75,.04,new THREE.MeshStandardMaterial({color:'#4a3a34',roughness:1}),P,.4,.95,1.13);B3(.5,.6,.05,std({color:'#2f6aa8'}),P,.1,.6,1.1);B3(1.36,.08,.06,std({color:'#c8c8cc',metalness:.6}),P,.4,.07,1.15);
  const doorL=new THREE.PointLight('#ffd8a0',3,4,1.5);doorL.position.set(.4,1.2,.4);P.add(doorL);
  for(let i=0;i<4;i++)B3(.5,.35,.03,new THREE.MeshStandardMaterial({color:'#9ac8e8',roughness:.1,metalness:.3}),P,2.5-i*1.25-(i>1?1.3:0),1.55,1.12);
  SW.prop=M3(new THREE.CircleGeometry(1.1,24),new THREE.MeshBasicMaterial({color:'#e8e8e8',transparent:true,opacity:.25,side:THREE.DoubleSide}),P,5.15,1.0,0);SW.prop.rotation.y=Math.PI/2;
  
  // campo de pouso florido com árvores, cerca e biruta
  const F=new THREE.Group();F.position.set(-300,0,200);SKYW.add(F);SW.field=F;
  const gT=tex(512,512,(g,w,h)=>{g.fillStyle='#6a9a3e';g.fillRect(0,0,w,h);gnoise(g,w,h,30);for(let i=0;i<2600;i++){g.strokeStyle=R()>.5?'rgba(60,100,30,.6)':'rgba(170,200,90,.5)';g.lineWidth=1.5;const x=R()*w,y=R()*h;g.beginPath();g.moveTo(x,y);g.lineTo(x+(R()-.5)*5,y-6-R()*7);g.stroke();}},[40,40]);
  const fg=M3(new THREE.PlaneGeometry(400,400),std({map:gT,roughness:1}),F,0,.05,0);fg.rotation.x=-Math.PI/2;fg.castShadow=false;
  for(let i=0;i<260;i++){const x=(R()-.5)*30,z=(R()-.5)*30;const c=['#ffd23f','#ff6fa8','#fff','#c68aff','#ff8a3d'][i%5];M3(new THREE.CylinderGeometry(.01,.01,.3,4),std({color:'#4a7a2a'}),F,x,.2,z);M3(new THREE.SphereGeometry(.07,8,6),std({color:c,emissive:c,emissiveIntensity:.12}),F,x,.36,z);}
  for(let i=0;i<14;i++){const t=new THREE.Group();const a=i/14*TAU,r=18+R()*10;t.position.set(Math.cos(a)*r,0,Math.sin(a)*r-6);F.add(t);M3(new THREE.CylinderGeometry(.25,.35,3,8),std({color:'#5a3a22'}),t,0,1.5,0);M3(new THREE.IcosahedronGeometry(2+R()*.8,1),std({color:['#4f7a32','#5a8a3a','#3f6a2a'][i%3],roughness:1}),t,0,4.2,0);}
  for(let k=-8;k<=8;k++)M3(new THREE.CylinderGeometry(.05,.05,1.1,6),std({color:'#7a5a3a'}),F,k*1.8,.55,-10);B3(30,.08,.05,std({color:'#7a5a3a'}),F,0,.9,-10);B3(30,.08,.05,std({color:'#7a5a3a'}),F,0,.5,-10);
  {const b=new THREE.Group();b.position.set(7,0,-6);F.add(b);M3(new THREE.CylinderGeometry(.05,.06,5,8),std({color:'#ddd',metalness:.5}),b,0,2.5,0);const sock=M3(new THREE.ConeGeometry(.35,2,16,1,true),std({color:'#ff6a1a',side:THREE.DoubleSide}),b,.9,4.8,0);sock.rotation.z=Math.PI/2+.15;SW.sock=sock;}
  // pilha de caixas de papelão (dublê 2012)
  const BX=new THREE.Group();BX.position.set(300,0,-200);SKYW.add(BX);SW.boxG=BX;
  const boxT=tex(128,128,(g,w,h)=>{g.fillStyle='#c8a06a';g.fillRect(0,0,w,h);gnoise(g,w,h,20);g.fillStyle='#a8804a';g.fillRect(0,h/2-5,w,10);g.fillStyle='rgba(80,50,20,.35)';g.font='bold 22px sans-serif';g.fillText('↑↑',10,30);});
  const bxM=std({map:boxT,roughness:.9});SW.boxes=[];
  for(let L=0;L<6;L++)for(let i=-(9-L);i<=9-L;i++)for(let j=-3;j<=3;j++){if(R()<.15)continue;const m=B3(.62,.45,.62,bxM,BX,i*.64+(R()-.5)*.06,.23+L*.46,j*.64+(R()-.5)*.06);m.rotation.y=(R()-.5)*.25;m.userData.home=m.position.clone();m.userData.r=R();SW.boxes.push(m);}
  const bg=M3(new THREE.PlaneGeometry(300,300),std({map:gT,roughness:1}),BX,0,.03,0);bg.rotation.x=-Math.PI/2;bg.castShadow=false;
  // pedaço de avião (recorde)
  const FR=new THREE.Group();FR.position.set(-200,700,-400);SKYW.add(FR);SW.frag=FR;
  const fm=M3(new THREE.CylinderGeometry(1.2,1.2,4.5,26,1,true,0,Math.PI*1.4),std({color:'#e8e4dc',side:THREE.DoubleSide,roughness:.5,metalness:.3}),FR,0,0,0);fm.rotation.z=Math.PI/2;
  for(let i=0;i<4;i++)B3(.5,.35,.04,new THREE.MeshStandardMaterial({color:'#2a3a4a'}),FR,-1.5+i*.9,.55,1.0);M3(new THREE.TorusGeometry(1.2,.05,6,26,Math.PI*1.4),std({color:'#8a8a90',metalness:.7}),FR,2.2,0,0).rotation.y=Math.PI/2;
  SW.fragSmoke=A3.steam(FR,{pos:V(-2.3,0,0),h:3,n:10,color:'#8a8a90'});
  // luz
  SW.sun=new THREE.DirectionalLight('#ffd0a0',3.2);SW.sun.position.set(3000,900,-4000);SW.sun.castShadow=true;SW.sun.shadow.mapSize.set(2048,2048);Object.assign(SW.sun.shadow.camera,{left:-12,right:12,top:12,bottom:-12,near:1,far:200});SW.sun.shadow.bias=-.0005;SKYW.add(SW.sun,SW.sun.target);
  SW.hemi=new THREE.HemisphereLight('#cfe0ff','#8a7a5a',1.1);SKYW.add(SW.hemi);
  // vento: partículas passando perto da câmera
  SW.windP=new THREE.Points(new THREE.BufferGeometry().setAttribute('position',new THREE.BufferAttribute(new Float32Array(400*3),3)),new THREE.PointsMaterial({color:'#ffffff',size:3,sizeAttenuation:false,transparent:true,opacity:.6,depthWrite:false}));SKYW.add(SW.windP);
}
function skyUpd(t,focus,vy=0,vx=0){
  SW.sky.position.copy(cam.position);SW.clouds.forEach((c,i)=>{c.lookAt(cam.position);c.position.x=c.userData.p.x+((t*(3+i%4))%60)-30;});SW.birds.update(t);
  SW.prop.rotation.x=t*40;SW.prop.material.opacity=.18+.1*Math.sin(t*60);SW.sock.rotation.y=Math.sin(t*1.4)*.25;SW.fragSmoke.update(t,cam);
  const f=focus||V(0,0,0);SW.sun.target.position.copy(f);SW.sun.position.copy(f).add(V(60,40,-60));
  const a=SW.windP.geometry.attributes.position;for(let i=0;i<400;i++){const r=rnd(i);a.setXYZ(i,f.x+(rnd(i+1)-.5)*14-((t*vx+r*20)%20-10)*(vx?1:0),f.y+((rnd(i+2)*30+t*vy)%30)-15,f.z+(rnd(i+3)-.5)*14);}a.needsUpdate=true;SW.windP.visible=vy>2||vx>2;}
function mapSky(){mood('night');SKYW.visible=true;TOWN.visible=false;ROOM.visible=false;scene.background=new THREE.Color('#e8b890');scene.fog=new THREE.Fog('#e6b494',260,4200);renderer.toneMappingExposure=1.0;
  SPR.forEach(s=>{s.mesh.material.color.set('#fff0e4');s.mesh.material.emissiveIntensity=.45;});}

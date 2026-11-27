// casa da Dona Cida exatamente em x=0 (do outro lado da rua)
POSTS.forEach(p=>{if(p.position.z>0&&Math.abs(p.position.x)<3)p.visible=false;});HOUSES.forEach(h=>{if(h.z>0&&h.z<20&&Math.abs(h.x)<3){h.g.position.x=HX;h.x=HX;}if(h.z<0&&h.z>-20&&Math.abs(h.x)<5)h.g.visible=false;});
SKY.tex.night=SKY.mk([[0,'#070b22'],[.3,'#141c44'],[.48,'#2c3566'],[.5,'#3a4270'],[1,'#3a4270']]);
SKY.tex.morning=SKY.mk([[0,'#4f86d6'],[.3,'#9cc4ee'],[.46,'#ffd9b8'],[.5,'#ffe6c8'],[1,'#ffe6c8']]);
const STARS=new THREE.Points(new THREE.BufferGeometry().setAttribute('position',new THREE.BufferAttribute(Float32Array.from({length:1800},(_,i)=>{const k=i%3,n=Math.floor(i/3),a=rnd(n)*TAU,b=.08+rnd(n+3)*1.3;return k===0?Math.cos(a)*Math.cos(b)*650:k===1?Math.sin(b)*650:Math.sin(a)*Math.cos(b)*650;}),3)),new THREE.PointsMaterial({color:'#fffbe8',size:2.2,sizeAttenuation:false,fog:false,transparent:true,opacity:.9}));TOWN.add(STARS);
// banco de praça na calçada da frente
const BENCH=new THREE.Group();BENCH.position.set(1.6,0,4.35);TOWN.add(BENCH);
{const wd=std({color:'#8a5a36',roughness:.7}),ir=std({color:'#2f3338',metalness:.6,roughness:.4});
 for(let i=0;i<3;i++)box(1.6,.04,.12,wd,BENCH,0,.45,-.14+i*.14);for(let i=0;i<2;i++)box(1.6,.1,.03,wd,BENCH,0,.62+i*.14,.2);
 for(const x of[-.7,.7]){box(.05,.45,.4,ir,BENCH,x,.225,0);box(.05,.4,.05,ir,BENCH,x,.62,.2);}}
// ---------- mercadinho de esquina ----------
const SHOP=new THREE.Group();SHOP.position.set(0,0,-8.3);TOWN.add(SHOP);const SH={};
{const wallT=ctex(512,256,(g,w,h)=>{g.fillStyle='#f2dfb8';g.fillRect(0,0,w,h);noise(g,w,h,14);blotch(g,w,h,20,'rgba(160,110,60,A)',.12,60);});
 const wm=std({map:wallT}),wd=std({color:'#6b4330',roughness:.7}),dk=std({color:'#3a2a20'});
 box(5,.25,3.4,std({color:'#b9b2a6'}),SHOP,0,.125,0);
 box(5,3.2,.2,wm,SHOP,0,1.6,-1.6);box(.3,3.2,3.4,wm,SHOP,-2.35,1.6,0);box(.3,3.2,3.4,wm,SHOP,2.35,1.6,0);
 box(5,.5,.3,wm,SHOP,0,2.95,1.6);box(5,.12,3.6,std({color:'#e9e1cf'}),SHOP,0,3.26,0);
 // letreiro
 const signT=ctex(1024,200,(g,w,h)=>{g.fillStyle='#2a9d8f';g.fillRect(0,0,w,h);g.strokeStyle='#f2e8d0';g.lineWidth=12;g.strokeRect(10,10,w-20,h-20);g.fillStyle='#fff6dc';g.font='120px Anton';g.textAlign='center';g.fillText('MERCADINHO',w/2,150);});
 const sg=M(new THREE.PlaneGeometry(3.6,.7),std({map:signT,roughness:.6}),SHOP,0,3.0,1.77);
 // toldo listrado
 const awT=ctex(512,64,(g,w,h)=>{for(let i=0;i<8;i++){g.fillStyle=i%2?'#f4efe4':'#d9483b';g.fillRect(i*64,0,64,h);}});
 const aw=M(new THREE.PlaneGeometry(5,1.3,1,1),std({map:awT,side:THREE.DoubleSide,roughness:.8}),SHOP,0,2.5,2.2);aw.rotation.x=-1.05;
 const scal=ctex(512,64,(g,w,h)=>{g.clearRect(0,0,w,h);for(let i=0;i<16;i++){g.fillStyle=Math.floor(i/2)%2?'#f4efe4':'#d9483b';g.beginPath();g.arc(i*32+16,0,16,0,Math.PI);g.fill();}});
 const sc=new THREE.Mesh(new THREE.PlaneGeometry(5,.22),new THREE.MeshStandardMaterial({map:scal,transparent:true,alphaTest:.4,side:THREE.DoubleSide}));sc.position.set(0,1.98,2.78);SHOP.add(sc);
 // prateleiras com produtos
 const cols=['#e2574c','#f2b33d','#3f6fb5','#4f9a5a','#8a5ab5','#e98a3a','#f4efe4'];
 for(let s=0;s<4;s++){box(4.2,.04,.4,wd,SHOP,0,.6+s*.55,-1.3);let x=-2;while(x<2){const w=.12+R()*.16,hh=.18+R()*.22;box(w,hh,.22,std({color:cols[Math.floor(R()*7)],roughness:.6}),SHOP,x+w/2,.62+s*.55+hh/2,-1.3);x+=w+.03;}}
 // balcão
 box(3.2,1.0,.6,wd,SHOP,0,.5,1.0);box(3.3,.06,.7,std({color:'#e9e1cf',roughness:.4}),SHOP,0,1.03,1.0);
 for(let i=0;i<6;i++)box(.45,.7,.02,dk,SHOP,-1.25+i*.5,.5,1.31);
 // caixa de frutas na frente
 for(const[x,c]of[[-1.9,'#e2574c'],[1.9,'#f2b33d']]){box(.6,.35,.45,std({color:'#b98a5a'}),SHOP,x,.42,2.1);for(let k=0;k<9;k++)M(new THREE.SphereGeometry(.07,10,8),std({color:c,roughness:.5}),SHOP,x-.2+(k%3)*.2,.64,2.0+Math.floor(k/3)*.1);}
 SH.lamp=new THREE.PointLight('#ffd9a0',0,7,1.5);SH.lamp.position.set(0,2.8,.6);SHOP.add(SH.lamp);
}
// maquininha de cartão no balcão
function screenTex(draw){return ctex(256,192,draw);}
const MAQ=new THREE.Group();MAQ.position.set(.55,1.06,-7.42);MAQ.rotation.y=-.3;TOWN.add(MAQ);
const MAQT={idle:screenTex((g,w,h)=>{g.fillStyle='#d8f0e0';g.fillRect(0,0,w,h);g.fillStyle='#2a5a3a';g.font='44px Anton';g.textAlign='center';g.fillText('APROXIME',w/2,85);g.fillText('O CARTÃO',w/2,140);}),
  deny:screenTex((g,w,h)=>{g.fillStyle='#ff3b3b';g.fillRect(0,0,w,h);g.fillStyle='#fff';g.font='54px Anton';g.textAlign='center';g.fillText('RECUSADO',w/2,90);g.font='30px Anton';g.fillText('SEM CONEXÃO',w/2,140);})};
{box(.12,.05,.22,std({color:'#26262e',roughness:.4}),MAQ,0,.025,0);const scr=new THREE.Mesh(new THREE.PlaneGeometry(.1,.075),new THREE.MeshBasicMaterial({map:MAQT.idle,toneMapped:false}));scr.rotation.x=-Math.PI/2+.25;scr.position.set(0,.053,-.05);MAQ.add(scr);MAQ.userData.scr=scr;
 for(let i=0;i<9;i++)box(.022,.008,.018,std({color:'#555'}),MAQ,-.03+(i%3)*.03,.052,.03+Math.floor(i/3)*.026);}
// cofrinho de porquinho + cacos + moedas
const PIG=new THREE.Group();PIG.position.set(-.45,1.06,-7.35);PIG.rotation.y=.4;TOWN.add(PIG);
const pinkM=std({color:'#f29ab4',roughness:.35});
{const b=M(new THREE.SphereGeometry(1,24,16),pinkM,PIG,0,.1,0);b.scale.set(.15,.1,.11);
 const sn=M(new THREE.CylinderGeometry(.035,.035,.04,16),pinkM,PIG,0,.11,.115);sn.rotation.x=Math.PI/2;
 for(const s of[-1,1]){M(new THREE.SphereGeometry(.009,8,6),std({color:'#5a2a3a'}),PIG,s*.012,.11,.137);M(new THREE.ConeGeometry(.03,.05,8),pinkM,PIG,s*.06,.2,.04);M(new THREE.SphereGeometry(.012,8,6),std({color:'#222'}),PIG,s*.05,.15,.09);}
 for(const[x,z]of[[-.07,-.05],[.07,-.05],[-.07,.05],[.07,.05]])cyl(.022,.022,.05,pinkM,PIG,x,.02,z,10);box(.05,.006,.012,std({color:'#222'}),PIG,0,.2,0);}
const SHARDS=[],COINS=[],coinM=std({color:'#e8b83a',metalness:.8,roughness:.3});
for(let i=0;i<10;i++){const m=M(new THREE.SphereGeometry(1,6,4,(i%5)/5*TAU,TAU/5,i<5?0:Math.PI/2,Math.PI/2),pinkM,TOWN);m.scale.set(.15,.1,.11);m.visible=false;m.userData.v=V((rnd(i)-.5)*1.6,.8+rnd(i+2)*1.2,(rnd(i+4)-.2)*1.2);m.userData.r=V(rnd(i+5)*12,rnd(i+6)*12,rnd(i+7)*12);SHARDS.push(m);}
for(let i=0;i<14;i++){const m=M(new THREE.CylinderGeometry(.025,.025,.008,16),coinM,TOWN);m.visible=false;m.userData.dx=(rnd(i+20)-.5)*.9;m.userData.dz=(rnd(i+21)-.5)*.4;m.userData.h=.15+rnd(i+22)*.3;COINS.push(m);}
// notas de dinheiro voando (instanced)
const billT=ctex(256,128,(g,w,h)=>{g.fillStyle='#8fd08a';g.fillRect(0,0,w,h);g.strokeStyle='#3f7a3f';g.lineWidth=8;g.strokeRect(6,6,w-12,h-12);g.beginPath();g.arc(w/2,h/2,34,0,7);g.stroke();g.fillStyle='#3f7a3f';g.font='54px Anton';g.textAlign='center';g.fillText('$',w/2,h/2+20);});
const BILLS=new THREE.InstancedMesh(new THREE.PlaneGeometry(.3,.15),std({map:billT,side:THREE.DoubleSide,roughness:.7}),80);BILLS.castShadow=true;BILLS.frustumCulled=false;TOWN.add(BILLS);BILLS.count=0;
// rádio, mapa, lanterna e lampião da varanda (cena da noite, quintal da Dona Cida)
const YARD=V(HX,0,7.6);
const RADIO=new THREE.Group();RADIO.position.set(HX+.15,0,7.0);RADIO.rotation.y=Math.PI+.2;TOWN.add(RADIO);
{box(.5,.3,.16,std({color:'#b4553f',roughness:.5}),RADIO,0,.17,0);const grill=ctex(128,128,g=>{g.fillStyle='#3a2a20';g.fillRect(0,0,128,128);g.fillStyle='#6b5040';for(let i=0;i<8;i++)for(let j=0;j<8;j++){g.beginPath();g.arc(8+i*16,8+j*16,5,0,7);g.fill();}});
 M(new THREE.CircleGeometry(.1,24),std({map:grill}),RADIO,-.1,.17,.081);M(new THREE.CylinderGeometry(.03,.03,.02,16),std({color:'#e9e1cf'}),RADIO,.13,.2,.085).rotation.x=Math.PI/2;box(.16,.05,.01,std({color:'#f2e8a0',emissive:'#f2c860',emissiveIntensity:.6}),RADIO,.13,.1,.081);
 box(.36,.03,.04,std({color:'#222'}),RADIO,0,.335,0);RADIO.userData.ant=cyl(.006,.006,1,std({color:'#cfd3d8',metalness:.8,roughness:.2}),RADIO,.2,.32,0,6);RADIO.userData.ant.geometry.translate(0,.5,0);RADIO.userData.ant.rotation.z=-.35;}
const mapT=ctex(512,360,(g,w,h)=>{g.fillStyle='#efe3c2';g.fillRect(0,0,w,h);g.fillStyle='#bfe0e8';g.beginPath();g.moveTo(0,250);g.bezierCurveTo(140,210,220,330,512,280);g.lineTo(512,360);g.lineTo(0,360);g.fill();g.fillStyle='#bcd6a0';for(let i=0;i<7;i++){g.beginPath();g.ellipse(60+R()*400,40+R()*160,30+R()*40,20+R()*30,R()*3,0,7);g.fill();}
 g.strokeStyle='#c8503c';g.lineWidth=7;g.beginPath();g.moveTo(30,30);g.bezierCurveTo(200,90,150,200,420,180);g.stroke();g.strokeStyle='#8a7a5a';g.lineWidth=3;for(let i=1;i<4;i++){g.beginPath();g.moveTo(i*w/4,0);g.lineTo(i*w/4,h);g.stroke();}g.beginPath();g.moveTo(0,h/2);g.lineTo(w,h/2);g.stroke();
 g.fillStyle='#c8503c';g.beginPath();g.arc(420,180,14,0,7);g.fill();g.fillStyle='#4a3a2a';g.font='34px Anton';g.fillText('N',470,50);});
const MAP=new THREE.Group();MAP.position.set(HX-.45,.03,6.9);TOWN.add(MAP);
const MAPM=M(new THREE.PlaneGeometry(.9,.63),std({map:mapT,side:THREE.DoubleSide,roughness:.9}),MAP);MAPM.rotation.x=-Math.PI/2;MAPM.castShadow=false;
const PORCH=new THREE.PointLight('#ffc070',0,9,1.4);PORCH.position.set(HX,2.4,8.2);TOWN.add(PORCH);
const PORCHB=M(new THREE.SphereGeometry(.09,12,8),new THREE.MeshBasicMaterial({color:'#fff0c0',toneMapped:false}),TOWN,HX,2.5,8.3);
const FLS=new THREE.SpotLight('#fff2c8',0,8,.42,.5,1.2);scene.add(FLS,FLS.target);
const STREETL=[];for(const x of[-6,6]){const l=new THREE.PointLight('#ffcf8a',0,14,1.4);l.position.set(x,4,4.4);TOWN.add(l);STREETL.push(l);}
// mesa de café da manhã na calçada (final)
const TABLE=new THREE.Group();TABLE.position.set(-.2,0,4.0);TOWN.add(TABLE);
{const clothT=ctex(256,256,g=>{for(let i=0;i<8;i++)for(let j=0;j<8;j++){g.fillStyle=(i+j)%2?'#d9483b':'#f4efe4';g.fillRect(i*32,j*32,32,32);}});
 box(1.6,.05,.8,std({map:clothT}),TABLE,0,.75,0);for(const[x,z]of[[-.7,-.32],[.7,-.32],[-.7,.32],[.7,.32]])box(.05,.75,.05,std({color:'#6b4330'}),TABLE,x,.375,z);
 const pie=cyl(.2,.17,.06,std({color:'#d9944a',roughness:.6}),TABLE,0,.8,0,24);cyl(.24,.22,.02,std({color:'#e9e3d6'}),TABLE,0,.78,0,24);
 for(const[x,c]of[[-.5,'#f2e8d0'],[.5,'#f2e8d0']]){cyl(.05,.04,.1,std({color:c,roughness:.4}),TABLE,x,.83,.15,14);}
 for(let k=0;k<5;k++)M(new THREE.SphereGeometry(.06,10,8),std({color:['#e2574c','#f2b33d','#4f9a5a'][k%3]}),TABLE,-.35+k*.17,.8,-.25);}
// bandeirinhas (final)
const FLAGS=new THREE.Group();TOWN.add(FLAGS);
{const fc=['#e2574c','#f2b33d','#3f6fb5','#4f9a5a','#8a5ab5'];for(let i=0;i<26;i++){const u=i/25,x=-5+u*10,y=3.9-Math.sin(u*Math.PI)*.6;const m=new THREE.Mesh(new THREE.BufferGeometry().setFromPoints([V(-.12,0,0),V(.12,0,0),V(0,-.28,0)]),new THREE.MeshBasicMaterial({color:fc[i%5],side:THREE.DoubleSide}));m.position.set(x,y,4.4);m.userData.y=y;FLAGS.add(m);}}

// ================= FUNDO DO MAR =================
const OCEAN=new THREE.Group();OCEAN.position.set(0,0,-600);scene.add(OCEAN);const OC={};
{const sandT=ctex(1024,1024,(g,w,h)=>{g.fillStyle='#c9b386';g.fillRect(0,0,w,h);noise(g,w,h,30);g.strokeStyle='rgba(120,95,60,.25)';g.lineWidth=6;for(let y=0;y<h;y+=40){g.beginPath();g.moveTo(0,y);for(let x=0;x<=w;x+=32)g.lineTo(x,y+Math.sin(x*.02+y)*10);g.stroke();}},[30,30]);
 const fl=M(new THREE.PlaneGeometry(400,400),std({map:sandT,roughness:1}),OCEAN,0,0,0,false);fl.rotation.x=-Math.PI/2;
 const pts=[];for(let x=-90;x<=90;x+=6)pts.push(V(x,.12+Math.sin(x*.3)*.02,Math.sin(x*.05)*2.5));OC.curve=new THREE.CatmullRomCurve3(pts);
 OC.cable=M(new THREE.TubeGeometry(OC.curve,400,.11,12),std({color:'#23262c',roughness:.45,metalness:.4}),OCEAN);
 OC.stripe=M(new THREE.TubeGeometry(OC.curve,400,.113,12),new THREE.MeshStandardMaterial({color:'#e0b040',roughness:.5,transparent:true,opacity:.0}),OCEAN);
 OC.pulses=[];for(let i=0;i<70;i++){const m=new THREE.Mesh(new THREE.PlaneGeometry(.7,.7),new THREE.MeshBasicMaterial({map:soft,color:'#7fe8ff',transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,toneMapped:false,fog:false}));OCEAN.add(m);OC.pulses.push(m);}
 OC.rocks=[];for(let i=0;i<60;i++){const r=M(new THREE.IcosahedronGeometry(.4+R()*1.2,1),std({color:['#5a5a52','#6b6656','#4a4f4a'][i%3],roughness:1,flatShading:true}),OCEAN,(R()-.5)*120,0,(R()-.5)*60);if(Math.abs(r.position.z)<3)r.position.z+=8*Math.sign(r.position.z||1);r.scale.y=.6;}
 const weedM=std({color:'#3f8a4a',side:THREE.DoubleSide,roughness:.7});OC.weeds=[];
 for(let i=0;i<70;i++){const g=new THREE.Group();g.position.set((R()-.5)*90,0,(R()-.5)*40);if(Math.abs(g.position.z)<7)g.position.z+=9*Math.sign(g.position.z||1);OCEAN.add(g);const n=3+Math.floor(R()*4);for(let k=0;k<n;k++){const hh=1+R()*2.5;const m=M(new THREE.PlaneGeometry(.18,hh,1,6),weedM,g,(R()-.5)*.4,hh/2,(R()-.5)*.4);m.rotation.y=R()*3;m.userData.base=m.geometry.attributes.position.array.slice();m.userData.h=hh;}OC.weeds.push(g);}
 const rayT=ctex(64,512,(g,w,h)=>{const gr=g.createLinearGradient(0,0,0,h);gr.addColorStop(0,'rgba(220,250,255,.9)');gr.addColorStop(1,'rgba(220,250,255,0)');g.fillStyle=gr;g.fillRect(0,0,w,h);g.globalCompositeOperation='destination-out';const gx=g.createLinearGradient(0,0,w,0);gx.addColorStop(0,'#000');gx.addColorStop(.5,'rgba(0,0,0,0)');gx.addColorStop(1,'#000');g.fillStyle=gx;g.fillRect(0,0,w,h);});
 OC.rays=[];for(let i=0;i<14;i++){const m=new THREE.Mesh(new THREE.PlaneGeometry(1.5+R()*2,30),new THREE.MeshBasicMaterial({map:rayT,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,opacity:.12,side:THREE.DoubleSide,fog:false}));m.geometry.translate(0,-15,0);m.position.set(-30+i*5+R()*3,17,(R()-.5)*14);m.rotation.set(0,R()*3,.25);OCEAN.add(m);OC.rays.push(m);}
 const surfT=ctex(512,512,(g,w,h)=>{g.fillStyle='#4fb8d8';g.fillRect(0,0,w,h);g.strokeStyle='rgba(230,255,255,.7)';for(let i=0;i<120;i++){g.lineWidth=2+R()*4;g.beginPath();const x=R()*w,y=R()*h;g.ellipse(x,y,20+R()*40,10+R()*20,R()*3,0,R()*5);g.stroke();}},[8,8]);
 OC.surf=new THREE.Mesh(new THREE.PlaneGeometry(400,400),new THREE.MeshBasicMaterial({map:surfT,side:THREE.DoubleSide,fog:true,toneMapped:false,transparent:true,opacity:.85}));OC.surf.rotation.x=Math.PI/2;OC.surf.position.y=18;OCEAN.add(OC.surf);
 const n=500;OC.bub=new THREE.Points(new THREE.BufferGeometry().setAttribute('position',new THREE.BufferAttribute(new Float32Array(n*3),3)),new THREE.PointsMaterial({color:'#e8fbff',size:5,sizeAttenuation:false,transparent:true,opacity:.7,depthWrite:false}));OCEAN.add(OC.bub);
 OC.light=new THREE.DirectionalLight('#cfefff',2.4);OC.light.position.set(10,30,10);OCEAN.add(OC.light,OC.light.target);
 OC.spark=new THREE.PointLight('#9fe8ff',0,10,1.5);OCEAN.add(OC.spark);}
const SWIM=sprite(SQVB,.42,scene);const FISH=[0,1,2,3,4,5].map(()=>sprite([-200,-150,400,300],.6,scene));
// ================= ESPAÇO =================
const SPACE=new THREE.Group();SPACE.position.set(0,0,700);scene.add(SPACE);const SP={};
{const n=2500,p=new Float32Array(n*3);for(let i=0;i<n;i++){const a=R()*TAU,b=Math.acos(2*R()-1),r=500;p[i*3]=Math.sin(b)*Math.cos(a)*r;p[i*3+1]=Math.cos(b)*r;p[i*3+2]=Math.sin(b)*Math.sin(a)*r;}
 SPACE.add(new THREE.Points(new THREE.BufferGeometry().setAttribute('position',new THREE.BufferAttribute(p,3)),new THREE.PointsMaterial({color:'#ffffff',size:2,sizeAttenuation:false,fog:false})));
 const sunT=ctex(1024,512,(g,w,h)=>{g.fillStyle='#ff9a2a';g.fillRect(0,0,w,h);for(let i=0;i<2500;i++){g.fillStyle=`rgba(${R()>.5?'255,230,120':'200,60,0'},${R()*.35})`;g.beginPath();g.arc(R()*w,R()*h,4+R()*14,0,7);g.fill();}});
 SP.sun=new THREE.Mesh(new THREE.SphereGeometry(12,64,32),new THREE.MeshBasicMaterial({map:sunT,toneMapped:false,fog:false,color:new THREE.Color(1.6,1.3,1)}));SP.sun.position.set(0,26,0);SPACE.add(SP.sun);
 SP.glow=new THREE.Mesh(new THREE.PlaneGeometry(70,70),new THREE.MeshBasicMaterial({map:soft,color:'#ff8a2a',transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,fog:false,opacity:.9}));SP.glow.position.copy(SP.sun.position);SPACE.add(SP.glow);
 SP.flare=new THREE.Mesh(new THREE.TorusGeometry(5,1.3,12,48,Math.PI),new THREE.MeshBasicMaterial({color:new THREE.Color(2.4,1.3,.4),toneMapped:false,transparent:true,fog:false}));SPACE.add(SP.flare);
 const earthT=ctex(1024,512,(g,w,h)=>{g.fillStyle='#2a6fc0';g.fillRect(0,0,w,h);for(let i=0;i<26;i++){g.fillStyle=['#4f9a4a','#6aa84a','#c9b47a'][i%3];g.beginPath();g.ellipse(R()*w,h*.2+R()*h*.6,30+R()*90,20+R()*60,R()*3,0,7);g.fill();}g.fillStyle='#f4f8ff';g.fillRect(0,0,w,40);g.fillRect(0,h-40,w,40);for(let i=0;i<60;i++){g.fillStyle='rgba(255,255,255,.55)';g.beginPath();g.ellipse(R()*w,R()*h,40+R()*60,8+R()*10,0,0,7);g.fill();}});
 SP.earth=new THREE.Mesh(new THREE.SphereGeometry(6,64,32),std({map:earthT,roughness:.8}));SP.earth.position.set(0,-24,0);SPACE.add(SP.earth);
 SP.atm=new THREE.Mesh(new THREE.PlaneGeometry(19,19),new THREE.MeshBasicMaterial({map:soft,color:'#6fb8ff',transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,fog:false,opacity:.7}));SP.atm.position.copy(SP.earth.position);SPACE.add(SP.atm);
 SP.aur=[1,-1].map(s=>{const m=new THREE.Mesh(new THREE.TorusGeometry(3.4,.45,8,48),new THREE.MeshBasicMaterial({color:new THREE.Color(.4,2.2,1),toneMapped:false,transparent:true,opacity:0,blending:THREE.AdditiveBlending,depthWrite:false,fog:false}));m.rotation.x=Math.PI/2;m.position.set(0,-24+s*4.8,0);SPACE.add(m);return m;});
 SP.light=new THREE.DirectionalLight('#fff1d8',3.5);SP.light.position.set(0,40,8);SP.light.target=SP.earth;SPACE.add(SP.light);
 const m=900;SP.cme=new THREE.Points(new THREE.BufferGeometry().setAttribute('position',new THREE.BufferAttribute(new Float32Array(m*3),3)),new THREE.PointsMaterial({map:soft,color:'#ffb060',size:1.6,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,fog:false}));SPACE.add(SP.cme);}

// ================= luzes, clima e pós =================
const hemi=new THREE.HemisphereLight('#dbeaff','#5d7a45',1.1);scene.add(hemi);
const sun=new THREE.DirectionalLight('#fff3dd',3);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);Object.assign(sun.shadow.camera,{left:-12,right:12,top:12,bottom:-12,near:1,far:120});sun.shadow.bias=-.0004;sun.shadow.normalBias=.03;sun.shadow.radius=3;scene.add(sun,sun.target);
const composer=new EffectComposer(renderer);composer.addPass(new RenderPass(scene,cam));
const bokeh=new BokehPass(scene,cam,{focus:3,aperture:.002,maxblur:.008});composer.addPass(bokeh);
const bloom=new UnrealBloomPass(new THREE.Vector2(540,960),.5,.6,.85);composer.addPass(bloom);composer.addPass(new OutputPass());
let SUNDIR=V(.45,.75,-.5).normalize(),MOOD='';
const TINT={day:'#ffffff',sunset:'#ffe2cc',night:'#a9b4dd',morning:'#fff0e4',ocean:'#cfeaff',space:'#ffffff'};
function mood(m){if(m===MOOD)return;MOOD=m;const T=['day','sunset','night','morning'].includes(m);
  TOWN.visible=T;RADIO.visible=m==='night';TABLE.visible=FLAGS.visible=m==='morning';OCEAN.visible=m==='ocean';SPACE.visible=m==='space';sun.visible=T;
  scene.fog=null;scene.background=null;STARS.visible=m==='night';PORCH.intensity=0;PORCHB.visible=m==='night';STREETL.forEach(l=>l.intensity=m==='night'?18:0);FLS.intensity=0;
  POSTS.forEach(p=>{p.userData.bulb.material.emissiveIntensity=m==='night'?3:.2;});
  const sk=SKY.mesh.material;
  if(m==='day'){sk.map=SKY.tex.day;scene.fog=new THREE.Fog('#d5e6f7',40,260);hemi.color.set('#cfe3ff');hemi.groundColor.set('#5d7a45');hemi.intensity=1.15;sun.color.set('#fff3dd');sun.intensity=3.0;SUNDIR=V(.5,.7,-.5).normalize();renderer.toneMappingExposure=1.0;}
  if(m==='morning'){sk.map=SKY.tex.morning;scene.fog=new THREE.Fog('#f2dcc8',40,240);hemi.color.set('#ffe2c8');hemi.groundColor.set('#5d7a45');hemi.intensity=1.1;sun.color.set('#ffd2a0');sun.intensity=3.2;SUNDIR=V(-.8,.45,-.4).normalize();renderer.toneMappingExposure=1.05;}
  if(m==='night'){sk.map=SKY.tex.night;scene.fog=new THREE.FogExp2('#141a36',.018);hemi.color.set('#4a5a9a');hemi.groundColor.set('#1a1e2a');hemi.intensity=.3;sun.color.set('#9fb4ff');sun.intensity=.35;SUNDIR=V(-.3,.8,.4).normalize();renderer.toneMappingExposure=1.0;PORCH.intensity=2.5;}
  if(m==='ocean'){scene.background=new THREE.Color('#0b4a6a');scene.fog=new THREE.FogExp2('#0e5a7a',.045);hemi.color.set('#9fe0ff');hemi.groundColor.set('#1a3a4a');hemi.intensity=1.0;renderer.toneMappingExposure=1.05;}
  if(m==='space'){scene.background=new THREE.Color('#02030a');hemi.intensity=.15;renderer.toneMappingExposure=1.0;}
  sk.needsUpdate=true;SKY.sunDisk.visible=SKY.sunGlow.visible=m==='day'||m==='morning';SKY.sunGlow.material.color.set(m==='morning'?'#ffb070':'#ffe9b0');
  CLOUDS.forEach(c=>{c.visible=m!=='night';c.material.color.set(m==='morning'?'#ffe0d0':'#ffffff');});
  SPRS.forEach(s=>s.mesh.material.color.set(TINT[m]||'#fff'));
  const ti=document.getElementById('tint');ti.setAttribute('fill',m==='night'?'#1c2556':'#5b3d7a');ti.setAttribute('opacity',m==='night'?'.72':'.08');
}
let WIND={w:.3,dx:1,dz:0};
function world(t,focus){
  if(TOWN.visible){SKY.mesh.position.copy(cam.position);STARS.position.copy(cam.position);SKY.sun.position.copy(cam.position).addScaledVector(SUNDIR,600);SKY.sun.lookAt(cam.position);
    CLOUDS.forEach((c,i)=>{const u=c.userData;c.position.set(cam.position.x+u.x+((t*(2+WIND.w*8)+i*30)%200)-100,u.y,cam.position.z+u.z);c.lookAt(cam.position);});
    GU.uTime.value=t;GU.uWind.value=WIND.w;GU.uDir.value.set(WIND.dx,WIND.dz).normalize();
    TREES.forEach(tr=>{const w=WIND.w,g=Math.sin(t*2.1+tr.ph)*.5+Math.sin(t*3.7+tr.ph*2)*.3;tr.g.rotation.z=-WIND.dx*(w*.09+g*w*.05);tr.fol.forEach((m,k)=>{m.position.set(m.userData.p.x+Math.sin(t*4+k)*.05*w+WIND.dx*w*.25,m.userData.p.y+Math.sin(t*3.3+k*2)*.04*w,m.userData.p.z+Math.cos(t*3.6+k)*.05*w);});});
    FLAGS.children.forEach((m,i)=>{m.rotation.x=Math.sin(t*4+i)*.3*(.3+WIND.w);m.position.y=m.userData.y+Math.sin(t*2+i*.5)*.02;});}
  if(OCEAN.visible){const b=OC.bub.geometry.attributes.position,c=cam.position;for(let i=0;i<500;i++){b.setXYZ(i,c.x+(rnd(i)-.5)*24,((rnd(i+1)*20+t*(.8+rnd(i+2)))%20),c.z-600+(rnd(i+3)-.5)*24-4);}b.needsUpdate=true;
    OC.weeds.forEach((g,i)=>g.children.forEach((m,k)=>{m.rotation.z=Math.sin(t*1.2+i+k)*.12;}));OC.rays.forEach((r,i)=>r.material.opacity=.08+.05*Math.sin(t*.7+i));OC.surf.material.map.offset.set(t*.01,t*.007);}
  const f0=focus||V(0,0,0);sun.target.position.copy(f0);sun.position.copy(f0).addScaledVector(SUNDIR,60);
}
// pulsos de dados no cabo: on 0..1 (velocidade), red 0..1
function cablePulses(t,on,red){OC.pulses.forEach((m,i)=>{const u=(i/70+t*.012*on+rnd(i)*.004)%1;const p=OC.curve.getPoint(u);m.position.copy(p).add(V(0,.02,0));m.lookAt(cam.position);const k=on>.05?1:.25;m.scale.setScalar((.6+.4*Math.sin(t*9+i))*k);m.material.color.set(red>.5?'#ff5a3a':'#7fe8ff');m.material.opacity=on>.05?.9:.5*(Math.sin(t*20+i*3)>.6?1:0);});}

// ================= câmera e helpers =================
let FOV=50,FOVMUL=1,FOCUS=null,AP=.0015;
function lens(){cam.fov=FOV*FOVMUL;cam.updateProjectionMatrix();}
function camShot(v,d,p0,p1,l0,l1,o={}){const k=(o.e||ease)(cl(v/d)),sh=o.shake||[0,0],w=o.whip||0,t=o.t||v;
  const p=V(0,0,0).lerpVectors(p0,p1,k),l=V(0,0,0).lerpVectors(l0,l1,k);const side=V(0,0,0).subVectors(l,p).cross(V(0,1,0)).normalize();
  cam.position.set(p.x+sh[0]+Math.sin(t*1.3)*.015,p.y+sh[1]+Math.sin(t*1.9)*.012,p.z);l.addScaledVector(side,w*3);cam.lookAt(l.x+sh[0]*.5,l.y+sh[1]*.5,l.z);lens();}
function camAt2(p,l,t,sh=[0,0]){cam.position.set(p.x+sh[0]+Math.sin(t*1.3)*.015,p.y+sh[1]+Math.sin(t*1.9)*.012,p.z);cam.lookAt(l.x+sh[0]*.5,l.y+sh[1]*.5,l.z);lens();}
const P2=V(0,0,0);function proj(x,y,z){if(x.isVector3){z=x.z;y=x.y;x=x.x;}cam.updateMatrixWorld();P2.set(x,y,z).project(cam);return{x:(P2.x+1)/2*1080,y:(1-P2.y)/2*1920};}
function wpos(s){return s.mesh.getWorldPosition(V(0,0,0));}
function place(s,x,y,z,sc=1){s.mesh.visible=true;s.mesh.scale.setScalar(sc);s.mesh.position.set(x,y===null?HEADY*sc:y,z);}
function bill(s){const p=wpos(s);s.mesh.rotation.y=Math.atan2(cam.position.x-p.x,cam.position.z-p.z);}
// ícones de app riscados
function icon(kind,x,y,p,px){if(p<=0)return'';const s=back(cl(p)),c={msg:'#2fbf71',play:'#ff3b3b',heart:'#ff5a8a',shop:'#f2b33d',bank:'#3f6fb5',box:'#b98a5a'}[kind];let g='';
  if(kind==='msg')g=`<path d="M-48 -38 h96 a14 14 0 0 1 14 14 v46 a14 14 0 0 1 -14 14 h-56 l-26 22 v-22 h-14 a14 14 0 0 1 -14 -14 v-46 a14 14 0 0 1 14 -14z" fill="#fff"/>`;
  if(kind==='play')g=`<path d="M-24 -40 L44 0 L-24 40Z" fill="#fff"/>`;
  if(kind==='heart')g=`<path d="M0 44 C-70 0 -50 -56 0 -24 C50 -56 70 0 0 44Z" fill="#fff"/>`;
  if(kind==='shop')g=`<path d="M-56 -10 h112 v58 h-112z" fill="#fff"/><path d="M-62 -14 l14 -36 h96 l14 36z" fill="#d9483b"/><rect x="-14" y="10" width="28" height="38" fill="${c}"/>`;
  if(kind==='bank')g=`<path d="M0 -54 L64 -20 H-64Z" fill="#fff"/>${[-44,-15,15,44].map(x=>`<rect x="${x-8}" y="-12" width="16" height="50" fill="#fff"/>`).join('')}<rect x="-64" y="42" width="128" height="12" fill="#fff"/>`;
  if(kind==='box')g=`<path d="M-50 -24 L0 -48 L50 -24 L50 34 L0 56 L-50 34Z" fill="#fff"/><path d="M-50 -24 L0 0 L50 -24 M0 0 V56" stroke="${c}" stroke-width="6" fill="none"/>`;
  const xs=px>0?back(cl(px)):0;
  return `<g transform="translate(${f(x)} ${f(y)}) scale(${f(s)}) rotate(${f(Math.sin(p*20)*(1-cl(p))*10)})"><circle r="92" fill="${c}" stroke="#141414" stroke-width="9"/>${g}`+(xs>0?`<g transform="scale(${f(xs)}) rotate(-8)"><path d="M-80 -80 L80 80 M80 -80 L-80 80" stroke="#141414" stroke-width="40" stroke-linecap="round"/><path d="M-80 -80 L80 80 M80 -80 L-80 80" stroke="#ff2d2d" stroke-width="24" stroke-linecap="round"/></g>`:'')+`</g>`;}
// celular gigante na tela (close-up)
function bigPhone(t,v,mode){const sh=Math.sin(t*30)*(mode==='shake'?8:0);let scr='',bars=3;
  if(mode==='lose'){bars=Math.max(0,3-Math.floor(v/.28));}
  const wifi=(x,y,n,col)=>[0,1,2].map(k=>`<path d="M${x-14-k*14} ${y-k*12} q${14+k*14} ${-14-k*8} ${28+k*28} 0" stroke="${k<n?col:'#ffffff40'}" stroke-width="7" fill="none" stroke-linecap="round"/>`).join('')+`<circle cx="${x}" cy="${y+8}" r="6" fill="${n>0?col:'#ffffff40'}"/>`;
  scr+=`<rect x="-250" y="-470" width="500" height="900" rx="40" fill="url(#vid)"/>`;
  scr+=`<rect x="-250" y="-470" width="500" height="60" rx="30" fill="#0008"/>`+wifi(180,-430,bars,'#fff')+`<text x="-210" y="-428" font-family="Anton" font-size="34" fill="#fff">18:42</text>`;
  if(mode==='lose'){const sp=t*8;scr+=`<rect x="-250" y="-410" width="500" height="840" fill="#000" opacity="${f(cl((v-.5)*3)*.55)}"/>`;
    if(v>.55){for(let k=0;k<8;k++){const a=sp+k/8*TAU;scr+=`<circle cx="${f(Math.cos(a)*50)}" cy="${f(-40+Math.sin(a)*50)}" r="${f(6+k*1.5)}" fill="#fff" opacity="${f(.2+k/10)}"/>`;}}
    if(v>.9){const p=seg(v,.9,1.1);scr+=`<g transform="translate(0 140) rotate(-10) scale(${f(back(p))})"><rect x="-210" y="-60" width="420" height="110" rx="16" fill="none" stroke="#ff2d2d" stroke-width="12"/><text y="22" font-family="Anton" font-size="70" fill="#ff2d2d" text-anchor="middle">SEM CONEXÃO</text></g>`;}}
  return `<defs><linearGradient id="vid" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ff7a59"/><stop offset=".5" stop-color="#c84bd8"/><stop offset="1" stop-color="#3f6fff"/></linearGradient></defs><g transform="translate(${f(540+sh)} 880) rotate(${f(-4+Math.sin(t*2)*2)})"><rect x="-285" y="-520" width="570" height="1000" rx="70" fill="#15151b" stroke="#000" stroke-width="10"/>${scr}<rect x="-70" y="-505" width="140" height="22" rx="11" fill="#000"/></g>`
   ;}
function phoneCard(x,y,p,title,sub,col='#ff3b3b'){if(p<=0)return'';const s=back(cl(p));return `<g transform="translate(${f(x)} ${f(y)}) scale(${f(s)})"><rect x="-200" y="-80" width="400" height="160" rx="26" fill="#fff" stroke="#141414" stroke-width="8"/><circle cx="-130" cy="0" r="46" fill="${col}"/><path d="M-152 -22 L-108 22 M-108 -22 L-152 22" stroke="#fff" stroke-width="12" stroke-linecap="round"/><text x="40" y="-6" font-family="Anton" font-size="56" fill="#141414" text-anchor="middle">${title}</text><text x="40" y="46" font-family="Anton" font-size="34" fill="${col}" text-anchor="middle">${sub}</text></g>`;}
function notes(x,y,t,n=4){let h='';for(let k=0;k<n;k++){const ph=(t*.7+k/n)%1;const X=x+Math.sin(ph*6+k)*60+(k%2?60:-60),Y=y-ph*260;h+=`<g transform="translate(${f(X)} ${f(Y)}) rotate(${f(Math.sin(t*5+k)*15)}) scale(${f(.8+ph*.4)})" opacity="${f(Math.sin(ph*Math.PI))}"><ellipse cx="-14" cy="20" rx="20" ry="15" fill="#ffd23f" stroke="#141414" stroke-width="5" transform="rotate(-20 -14 20)"/><path d="M2 18 V-46 l34 12" stroke="#141414" stroke-width="7" fill="none"/></g>`;}return h;}
function zap(x,y,t,s=1){let d=`M${f(x)} ${f(y)}`,X=x,Y=y;for(let i=0;i<6;i++){X+=(rnd(Math.floor(t*20)+i)-.5)*120*s;Y-=40*s;d+=` L${f(X)} ${f(Y)}`;}return `<path d="${d}" stroke="#bff4ff" stroke-width="${f(16*s)}" fill="none" opacity=".5"/><path d="${d}" stroke="#fff" stroke-width="${f(6*s)}" fill="none"/>`;}
function confetti(t,p){if(p<=0)return'';let h='';for(let k=0;k<60;k++){const x=rnd(k)*1080+Math.sin(t*2+k)*40,y=((t*(260+rnd(k+1)*200)+rnd(k+2)*1920)%2100)-100;h+=`<rect x="${f(x)}" y="${f(y)}" width="18" height="30" fill="${['#e2574c','#ffd23f','#3f6fb5','#4f9a5a','#ff7ac8'][k%5]}" transform="rotate(${f(t*200+k*40)} ${f(x)} ${f(y)})" opacity="${f(p)}"/>`;}return h;}
function chart(x,y,p,t){if(p<=0)return'';const s=back(cl(p*1.5)),k=cl(p);let pts=[];for(let i=0;i<=20;i++){const u=i/20;if(u>k)break;pts.push(`${f(-260+u*520)} ${f(-120+u*u*230+Math.sin(u*25)*14)}`);}
  return `<g transform="translate(${x} ${y}) scale(${f(s)})"><rect x="-300" y="-190" width="600" height="380" rx="26" fill="#fff" stroke="#141414" stroke-width="9"/>${[-100,0,100].map(yy=>`<line x1="-260" y1="${yy}" x2="260" y2="${yy}" stroke="#ddd" stroke-width="4"/>`).join('')}`+(pts.length>1?`<polyline points="${pts.join(' ')}" fill="none" stroke="#ff2d2d" stroke-width="16" stroke-linecap="round" stroke-linejoin="round"/>`:'')+`<path d="M200 70 l60 60 l10 -70z" fill="#ff2d2d" opacity="${f(seg(p,.8,1))}"/></g>`;}

// ---------- BURACO DE 20 m: terreno de obra ao entardecer + corte lateral da terra ----------
const G=9.81,PD=20,PW=1.6; // profundidade, meia-largura do buraco
const PIT=new THREE.Group();scene.add(PIT);const PT={};
{
  const soilT=tex(512,1024,(g,w,h)=>{const L=['#7a5a3e','#8a6a48','#6a4c34','#9a7a52','#5e4430','#7e6040','#6a5038'];for(let i=0;i<14;i++){g.fillStyle=L[i%L.length];g.fillRect(0,i*h/14,w,h/14+2);}
    gnoise(g,w,h,30);for(let i=0;i<150;i++){g.fillStyle=`rgba(${R()>.5?'30,18,10':'210,180,140'},${.12+R()*.2})`;g.beginPath();g.ellipse(R()*w,R()*h,4+R()*18,3+R()*10,R()*3,0,7);g.fill();}
    g.strokeStyle='rgba(40,24,12,.55)';for(let i=0;i<28;i++){g.lineWidth=1+R()*2.5;let x=R()*w,y=R()*h;g.beginPath();g.moveTo(x,y);for(let k=0;k<5;k++){x+=(R()-.5)*30;y+=10+R()*30;g.lineTo(x,y);}g.stroke();}},[3,2]);
  const soilM=std({map:soilT,roughness:.95});
  const wallM=std({map:soilT.clone(),roughness:.95,color:'#c8b09a'});wallM.map.needsUpdate=true;
  // blocos de terra (corte frontal em z=3) à esquerda e à direita do buraco
  for(const s of[-1,1]){B3(40,PD+3,6,soilM,PIT,s*(PW+20),-(PD+3)/2,0);}
  B3(2*PW+.2,PD+3,.6,wallM,PIT,0,-(PD+3)/2,-3.3);                       // fundo do buraco (parede de trás)
  PT.floor=B3(2*PW+.2,.6,6.2,std({color:'#4e3a2a',roughness:1}),PIT,0,-PD-.3,0);
  // chão do terreno (atrás e na frente) e grama
  const grassT=tex(512,512,(g,w,h)=>{g.fillStyle='#7a7a3a';g.fillRect(0,0,w,h);gnoise(g,w,h,34);for(let i=0;i<2600;i++){g.strokeStyle=R()>.5?'rgba(110,120,50,.6)':'rgba(170,150,70,.5)';g.lineWidth=1.5;const x=R()*w,y=R()*h;g.beginPath();g.moveTo(x,y);g.lineTo(x+(R()-.5)*5,y-5-R()*8);g.stroke();}for(let i=0;i<60;i++){g.fillStyle='rgba(60,40,20,.25)';g.beginPath();g.ellipse(R()*w,R()*h,20+R()*40,10+R()*20,0,0,7);g.fill();}},[60,60]);
  const gm=std({map:grassT,roughness:.95});
  PT.gBack=M3(new THREE.PlaneGeometry(400,200),gm,PIT,0,0,-103.3);PT.gBack.rotation.x=-Math.PI/2;PT.gBack.castShadow=false;
  PT.gFront=M3(new THREE.PlaneGeometry(400,200),gm,PIT,0,0,103);PT.gFront.rotation.x=-Math.PI/2;PT.gFront.castShadow=false;
  for(const s of[-1,1]){const t=M3(new THREE.PlaneGeometry(40,6),gm,PIT,s*(PW+20),.001,0);t.rotation.x=-Math.PI/2;t.castShadow=false;}
  // marcas de profundidade pintadas na parede de fundo (5, 10, 15, 20 m) com luz
  PT.lamps=[];
  for(const d of[5,10,15,20]){const tg=tex(256,96,(g,w,h)=>{g.fillStyle='#f2e6d0';g.fillRect(0,0,w,h);g.fillStyle='#2a2018';g.font='72px Anton';g.textAlign='center';g.fillText(d+' m',w/2,76);});
    M3(new THREE.PlaneGeometry(.9,.34),new THREE.MeshStandardMaterial({map:tg,emissive:'#ffffff',emissiveMap:tg,emissiveIntensity:.4}),PIT,-PW+.6,-d+.05,-2.95);
    B3(2*PW,.07,.05,std({color:'#e8d8b0',emissive:'#6a5a3a'}),PIT,0,-d,-2.97);
    const L=new THREE.PointLight('#ffcf8a',d===20?5:3.5,9,1.5);L.position.set(PW-.5,-d+1.5,1);PIT.add(L);PT.lamps.push(L);}
  // raízes e pedras saindo da parede
  for(let i=0;i<14;i++){const r=M3(new THREE.CylinderGeometry(.015,.04,.6+R()*.7,5),std({color:'#5a3a22'}),PIT,(R()>.5?1:-1)*(PW-.04),-1.5-R()*(PD-2),(R()-.5)*4);r.rotation.z=Math.PI/2+(R()-.5)*.6;}
  for(let i=0;i<20;i++){const st=M3(new THREE.DodecahedronGeometry(.1+R()*.2,0),std({color:['#8a8478','#6a665c','#a09a8c'][i%3],roughness:.9}),PIT,(R()>.5?1:-1)*(PW-.05),-1-R()*(PD-1.5),(R()-.5)*5);st.scale.y=.7;}
  // tábuas sobre o buraco
  const woodT=tex(256,256,(g,w,h)=>{g.fillStyle='#9a7a52';g.fillRect(0,0,w,h);for(let i=0;i<60;i++){g.strokeStyle=`rgba(${R()>.5?'50,30,15':'180,150,100'},${.1+R()*.15})`;g.lineWidth=1+R()*2;const y=R()*h;g.beginPath();g.moveTo(0,y);g.bezierCurveTo(w*.3,y+(R()-.5)*8,w*.6,y+(R()-.5)*8,w,y+(R()-.5)*5);g.stroke();}gnoise(g,w,h,24);g.fillStyle='rgba(40,25,10,.5)';g.fillRect(w*.1,0,5,h);g.fillRect(w*.88,0,5,h);});
  PT.pl=[];for(let i=0;i<6;i++){const m=B3(2*PW+.9,.14,.97,std({map:woodT,roughness:.9}),PIT,0,-.07,-2.5+i*1);m.userData={i,z:-2.5+i};PT.pl.push(m);
    for(const sx of[-1,1])M3(new THREE.CylinderGeometry(.018,.018,.05,6),std({color:'#3a3a40',metalness:.6}),m,sx*1.5,.09,.3);}
  // placa de aviso, cones, fita e cerca (terreno de obra)
  const signT=tex(256,256,(g,w,h)=>{g.fillStyle='#f2c230';g.fillRect(0,0,w,h);g.fillStyle='#141414';g.font='64px Anton';g.textAlign='center';g.fillText('CUIDADO',w/2,110);g.font='44px Anton';g.fillText('OBRA',w/2,170);g.lineWidth=14;g.strokeStyle='#141414';g.strokeRect(10,10,w-20,h-20);});
  M3(new THREE.CylinderGeometry(.03,.03,1.4,6),std({color:'#555'}),PIT,-3.2,.7,-4.2);M3(new THREE.PlaneGeometry(.9,.9),new THREE.MeshStandardMaterial({map:signT,roughness:.6}),PIT,-3.2,1.55,-4.18);
  for(const[x,z]of[[3.2,-3.6],[-2.6,4.2],[2.8,4.4]]){const c=M3(new THREE.ConeGeometry(.17,.55,14),std({color:'#ff6a1a'}),PIT,x,.27,z);M3(new THREE.CylinderGeometry(.175,.175,.1,14),std({color:'#fff'}),c,0,.02,0);}
  for(let k=-5;k<=5;k++){M3(new THREE.CylinderGeometry(.03,.03,1.1,6),std({color:'#6a4a2a'}),PIT,k*1.6,.55,-14);}
  const fence=B3(18,.5,.04,std({color:'#8a6a40'}),PIT,0,.9,-14);B3(18,.5,.04,std({color:'#8a6a40'}),PIT,0,.4,-14);
  // silhuetas ao longe: morros, árvores, postes e prédios do centro
  const hills=[['#5a4a62',-70,18,90],['#4a3a56',40,26,110],['#6a5668',-10,12,70]];hills.forEach(([c,x,h,w],i)=>{const m=M3(new THREE.SphereGeometry(1,24,12,0,TAU,0,Math.PI/2),new THREE.MeshBasicMaterial({color:c,fog:true}),PIT,x,0,-150-i*30);m.scale.set(w,h,40);m.castShadow=false;});
  for(let i=0;i<14;i++){const x=-60+i*9+R()*4,h=10+R()*22;const b=M3(new THREE.BoxGeometry(5+R()*5,h,5),new THREE.MeshBasicMaterial({color:'#5a4a66',fog:true}),PIT,x,h/2,-125-R()*20);b.castShadow=false;
    for(let w=0;w<5;w++)if(R()>.5)M3(new THREE.PlaneGeometry(.8,.9),new THREE.MeshBasicMaterial({color:'#ffcf8a',fog:false}),PIT,x+(R()-.5)*3,1.5+R()*(h-2),-122.4-0);}
  for(let i=0;i<9;i++){const t=new THREE.Group();t.position.set(-30+R()*60,0,-30-R()*60);PIT.add(t);M3(new THREE.CylinderGeometry(.2,.3,3,7),std({color:'#4a3322'}),t,0,1.5,0);const f=M3(new THREE.IcosahedronGeometry(1.8,1),std({color:['#5a6a3a','#6a7a3a','#4a5a32'][i%3],roughness:1}),t,0,4.2,0);f.scale.y=.9;}
  // céu do entardecer (esfera) e luz
  const skyT=tex(8,1024,(g,w,h)=>{const gr=g.createLinearGradient(0,0,0,h);[[0,'#3f3566'],[.3,'#7a5a8c'],[.45,'#e8907a'],[.5,'#ffc080'],[1,'#ffc080']].forEach(([o,c])=>gr.addColorStop(o,c));g.fillStyle=gr;g.fillRect(0,0,w,h);});
  PT.sky=new THREE.Mesh(new THREE.SphereGeometry(500,32,16),new THREE.MeshBasicMaterial({map:skyT,side:THREE.BackSide,fog:false,toneMapped:false}));PIT.add(PT.sky);
  PT.sun=new THREE.DirectionalLight('#ffb070',3);PT.sun.position.set(30,14,25);PT.sun.castShadow=true;PT.sun.shadow.mapSize.set(2048,2048);Object.assign(PT.sun.shadow.camera,{left:-12,right:12,top:12,bottom:-26,near:1,far:120});PT.sun.shadow.bias=-.0005;PIT.add(PT.sun,PT.sun.target);
  PT.hemi=new THREE.HemisphereLight('#ffc9a0','#4a3a5a',.9);PIT.add(PT.hemi);
  PT.sunG=glowSpr(PIT,'#ffd9a0',200,260,40,-260);
  // airbag amarelo gigante no fundo (escala = inflado) e água
  const bagT=tex(256,256,(g,w,h)=>{g.fillStyle='#ffc21a';g.fillRect(0,0,w,h);g.fillStyle='#e8a000';for(let i=0;i<8;i++)g.fillRect(i*32,0,6,h);g.fillStyle='rgba(255,255,255,.25)';g.fillRect(0,0,w,40);});
  PT.bag=new THREE.Group();PT.bag.position.set(0,-PD,0);PIT.add(PT.bag);const bm=M3(new THREE.SphereGeometry(1,28,16),std({map:bagT,roughness:.4}),PT.bag,0,0,0);bm.scale.set(1.52,1.25,2.9);PT.bagM=bm;
  PT.water=M3(new THREE.BoxGeometry(2*PW,4.2,5.8),new THREE.MeshStandardMaterial({color:'#2a8ab0',transparent:true,opacity:.62,roughness:.1}),PIT,0,-PD+2.1,0);PT.water.castShadow=false;PT.waterTop=M3(new THREE.PlaneGeometry(2*PW,5.8),new THREE.MeshBasicMaterial({color:'#bfe8ff',transparent:true,opacity:.4,side:THREE.DoubleSide}),PIT,0,-PD+4.2,0);PT.waterTop.rotation.x=-Math.PI/2;
  PT.bag.visible=false;PT.water.visible=false;PT.waterTop.visible=false;
}
function setPit(o={}){PT.bag.visible=!!o.bag;PT.water.visible=!!o.water;PT.waterTop.visible=!!o.water;PT.pl.forEach(m=>m.visible=!o.noPlanks);}
// tábuas: quebram a partir de B (tempo absoluto); as do centro primeiro; pura função de t
function planksAt(t,B){PT.pl.forEach((m,i)=>{const tb=B+(i===2||i===3?0:.08+.05*Math.abs(i-2.5)),dt=t-tb,sgn=i%2?1:-1;
  if(B>0&&t>B-1.2&&dt<0){const k=seg(t,B-1.2,B);m.rotation.z=Math.sin(t*40+i)*.01*k;m.position.y=-.07-.02*k*(i===2||i===3);}
  if(dt>0){m.rotation.z=sgn*Math.min(1.35,dt*3.2);m.rotation.x=sgn*dt*.5;m.position.set(sgn*dt*.7,-.07-.5*G*dt*dt*.6,m.userData.z+sgn*dt*.3);}
  else if(!(B>0&&t>B-1.2)){m.rotation.set(0,0,0);m.position.set(0,-.07,m.userData.z);}});}
function physFall(tau,drag){if(!drag)return{d:.5*G*tau*tau,v:G*tau};const k=.0088,a=Math.sqrt(G*k)*tau;return{d:Math.log(Math.cosh(a))/k,v:Math.sqrt(G/k)*Math.tanh(a)};}
function mapWorld(w){const top=w==='top';mood('night');PIT.visible=true;TOWN.visible=false;ROOM.visible=false;
  scene.background=new THREE.Color(top?'#e9b08a':'#2a1c18');scene.fog=top?new THREE.Fog('#e9a27a',25,230):new THREE.FogExp2('#2a1c18',.018);
  PT.sky.visible=top;PT.sunG.visible=top;PT.ray.obj.visible=false;PT.sun.intensity=top?3.2:1.2;PT.hemi.intensity=top?.9:.8;renderer.toneMappingExposure=top?1.0:1.15;
  SPR.forEach(s=>{s.mesh.material.color.set(top?'#ffe8d6':'#ffffff');s.mesh.material.emissiveIntensity=top?.42:.5;});}

// ---------- objetos 3D realistas: guarda-chuva, paraquedas, poeira e feixe de luz ----------
const A3=AMB3D(THREE);
PT.dust=A3.dust(PIT,{center:V(0,-10,0),area:V(3,20,5),n:260,size:3.2});PT.ray=A3.godRay(PIT,{pos:V(1.1,.4,-1),len:22,n:4});PT.dust.obj.visible=false;
function makeCanopy(o){
  const N=o.N||8,K=o.K||5,M=o.M||10,R=o.R||.45,H=o.H||.5*R,cols=(o.cols||['#b3202a']).map(c=>new THREE.Color(c)),nu=N*K+1,nv=M+1,A1=1.3,SA=1-Math.cos(A1);
  const pos=new Float32Array(nu*nv*3),col=new Float32Array(nu*nv*3),idx=[];
  for(let i=0;i<nu;i++){const gi=Math.min(N-1,Math.floor(((i%(N*K))+.5)/K)),c=cols[gi%cols.length],dk=(i%K===0)?.72:1;for(let j=0;j<nv;j++){const k=(j*nu+i)*3,sh=1-.18*(1-j/M);col[k]=c.r*dk*sh;col[k+1]=c.g*dk*sh;col[k+2]=c.b*dk*sh;}}
  for(let i=0;i<nu-1;i++)for(let j=0;j<nv-1;j++){const a=j*nu+i,b=a+1,c=a+nu,d=c+1;idx.push(a,c,b,b,c,d);}
  const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.BufferAttribute(pos,3));geo.setAttribute('color',new THREE.BufferAttribute(col,3));geo.setIndex(idx);
  const mesh=new THREE.Mesh(geo,new THREE.MeshStandardMaterial({vertexColors:true,side:THREE.DoubleSide,roughness:o.rough??.5,metalness:0}));mesh.castShadow=true;
  const rg=new THREE.BufferGeometry();rg.setAttribute('position',new THREE.BufferAttribute(new Float32Array(N*M*2*3),3));const ribs=new THREE.LineSegments(rg,new THREE.LineBasicMaterial({color:o.ribCol||'#2a2a32'}));
  function update(op,t,flut=0,inv=0,bil=0){
    for(let i=0;i<nu;i++){const th=i/(nu-1)*TAU,sag=Math.abs(Math.cos(N*th/2));
      for(let j=0;j<nv;j++){const v=j/M,a=v*A1;
        let ro=R*Math.sin(a)/Math.sin(A1)*(1+bil*.1*v),yo=-H*(1-Math.cos(a))/SA;ro*=1-.075*v*v*(1-sag);yo-=.05*R*v*v*(1-sag);
        const rc=.03*(.5+v*.5)*(1+.5*Math.sin(N*th)),yc=-v*(o.closedLen||.6);
        let r=lerp(rc,ro,op),y=lerp(yc,yo,op);
        r+=flut*Math.sin(t*17+th*3+v*5)*.045*R*v*v;y+=flut*Math.sin(t*13+th*2)*.025*R*v;
        if(inv>0){const yi=-2*H*op-y+(inv*0);y=lerp(y,yi,inv);r*=1-.1*inv*Math.sin(N*th)*Math.sin(N*th);y+=inv*.04*Math.sin(t*20+th*N)*v;}
        const k=(j*nu+i)*3;pos[k]=r*Math.cos(th);pos[k+1]=y;pos[k+2]=r*Math.sin(th);}}
    geo.attributes.position.needsUpdate=true;geo.computeVertexNormals();
    const rp=rg.attributes.position;let q=0;for(let k=0;k<N;k++){const i=k*K;for(let j=0;j<M;j++){for(const jj of[j,j+1]){const s=(jj*nu+i)*3;rp.setXYZ(q++,pos[s]*1.002,pos[s+1]-.004,pos[s+2]*1.002);}}}rp.needsUpdate=true;}
  update(1,0);return{mesh,ribs,update,pos,nu,nv,N,K,M};}
function makeUmbrella(col='#b3202a'){const g=new THREE.Group(),SL=.74,cp=makeCanopy({N:8,K:5,M:10,R:.48,H:.21,cols:[col]});cp.mesh.position.y=SL;cp.ribs.position.y=SL;g.add(cp.mesh,cp.ribs);
  const steel=std({color:'#8a8c94',metalness:.9,roughness:.25}),wood=std({color:'#6a3f1e',roughness:.5});
  M3(new THREE.CylinderGeometry(.011,.011,SL,8),steel,g,0,SL/2,0);M3(new THREE.ConeGeometry(.012,.07,8),steel,g,0,SL+.04,0);
  const hp=[V(0,.03,0),V(0,-.11,0),V(0,-.19,0),V(.045,-.25,0),V(.1,-.22,0),V(.105,-.15,0)];const h=M3(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(hp),20,.018,8),wood,g);
  const sl=M3(new THREE.CylinderGeometry(.022,.022,.05,10),steel,g,0,SL*.5,0);
  const st=new THREE.BufferGeometry();st.setAttribute('position',new THREE.BufferAttribute(new Float32Array(8*2*3),3));const stl=new THREE.LineSegments(st,new THREE.LineBasicMaterial({color:'#9a9ca4'}));g.add(stl);
  g.visible=false;scene.add(g);
  return{g,update(op,t,fl=0,inv=0,bil=0){cp.update(op,t,fl,inv,bil);sl.position.y=lerp(SL*.2,SL*.5,op);
    const p=st.attributes.position;for(let k=0;k<8;k++){const i=k*5,j=6,s=(j*cp.nu+i)*3,a=sl.position.y;p.setXYZ(k*2,0,a+.02,0);p.setXYZ(k*2+1,cp.pos[s]*.98,SL+cp.pos[s+1]-.01,cp.pos[s+2]*.98);}p.needsUpdate=true;}};}
function makeChute(){const g=new THREE.Group(),L=1.9,cp=makeCanopy({N:12,K:3,M:10,R:1.0,H:.62,cols:['#ff7a1a','#fff2e0'],ribCol:'#d8d8d8',rough:.7,closedLen:.9});cp.mesh.position.y=L;cp.ribs.position.y=L;g.add(cp.mesh,cp.ribs);
  const lg=new THREE.BufferGeometry();lg.setAttribute('position',new THREE.BufferAttribute(new Float32Array(12*2*3),3));const lines=new THREE.LineSegments(lg,new THREE.LineBasicMaterial({color:'#2a2a30'}));g.add(lines);g.visible=false;scene.add(g);
  return{g,update(op,t,fl=0){cp.update(op,t,fl,0,.5);const p=lg.attributes.position;for(let k=0;k<12;k++){const s=(cp.M*cp.nu+k*cp.K)*3;p.setXYZ(k*2,cp.pos[s],L+cp.pos[s+1],cp.pos[s+2]);p.setXYZ(k*2+1,(k%2?.1:-.1),.1,0);}p.needsUpdate=true;}};}
const UM=makeUmbrella(),CHUTE=makeChute();

// ---------- MAIS DETALHES: terreno de obra vivo e interior do buraco ----------
{
  const brickT=tex(256,128,(g,w,h)=>{g.fillStyle='#b4553f';g.fillRect(0,0,w,h);g.fillStyle='rgba(60,30,20,.5)';for(let y=0;y<h;y+=16){g.fillRect(0,y,w,2);for(let x=((y/16)%2)*16;x<w;x+=32)g.fillRect(x,y,2,16);}gnoise(g,w,h,34);});
  const brickM=std({map:brickT,roughness:.9}),concM=std({color:'#9a948a',roughness:.95}),steelM=std({color:'#7a7c84',metalness:.7,roughness:.4}),rustM=std({color:'#8a4a2a',metalness:.5,roughness:.8});
  // pilhas de tijolos, sacos de cimento, tubos de concreto
  for(const[x,z,s]of[[-5.2,-6,1],[5.8,-8.5,1.2],[-8,-12,1.3]]){const g=new THREE.Group();g.position.set(x,0,z);g.rotation.y=(R()-.5)*.6;PIT.add(g);for(let k=0;k<3;k++)for(let j=0;j<4;j++)B3(1.4*s,.2*s,.5*s,brickM,g,0,.1*s+k*.22*s,(j-1.5)*.52*s);B3(1.5*s,.06*s,2.3*s,std({color:'#7a5a3a'}),g,0,-.01,0);}
  for(let i=0;i<5;i++){const b=B3(.7,.12,.45,std({color:'#d8d0c0',roughness:1}),PIT,-3.2+(i%3)*.72,.06+Math.floor(i/3)*.13,-7+Math.floor(i/3)*.1);b.rotation.y=(R()-.5)*.4;}
  for(const[x,z]of[[7.2,-4.5],[8.6,-5.2]]){const p=M3(new THREE.CylinderGeometry(.55,.55,1.8,24,1,true),std({color:'#a8a29a',side:THREE.DoubleSide,roughness:.95}),PIT,x,.55,z);p.rotation.z=Math.PI/2;p.rotation.y=.3;}
  // tambores coloridos
  for(const[x,z,c]of[[3.9,-5,'#c8322e'],[4.7,-5.4,'#2f6aa8'],[4.2,-6.1,'#e8b22a']]){M3(new THREE.CylinderGeometry(.27,.27,.8,20),std({color:c,metalness:.4,roughness:.5}),PIT,x,.4,z);for(const y of[.2,.6])M3(new THREE.TorusGeometry(.27,.014,6,20),std({color:'#222'}),PIT,x,y,z).rotation.x=Math.PI/2;}
  // betoneira
  {const g=new THREE.Group();g.position.set(-7,0,-6.5);g.rotation.y=.5;PIT.add(g);for(const sx of[-1,1])B3(.08,.9,.08,steelM,g,sx*.5,.45,0);B3(1.1,.08,.08,steelM,g,0,.12,0);const dr=M3(new THREE.CylinderGeometry(.5,.38,.9,22),std({color:'#e8a22a',roughness:.5}),g,0,1.1,0);dr.rotation.z=.8;PT.mixer=dr;M3(new THREE.ConeGeometry(.28,.3,16),std({color:'#e8a22a'}),g,.33,1.45,0).rotation.z=-.7;}
  // carrinho de mão
  {const g=new THREE.Group();g.position.set(3,0,-3.4);g.rotation.y=-.6;PIT.add(g);B3(.7,.22,.45,std({color:'#2f6aa8',metalness:.3}),g,0,.34,0);M3(new THREE.CylinderGeometry(.12,.12,.06,14),std({color:'#222'}),g,.42,.14,0).rotation.x=Math.PI/2;for(const sz of[-1,1]){const h=B3(.7,.04,.04,std({color:'#7a5a3a'}),g,-.5,.38,sz*.18);h.rotation.z=.15;}}
  // andaime
  {const g=new THREE.Group();g.position.set(-9.5,0,-3);PIT.add(g);for(const x of[-1,1])for(const z of[-.5,.5])B3(.05,3.6,.05,steelM,g,x,1.8,z);for(const y of[.8,1.9,3.0]){B3(2.1,.05,.05,steelM,g,0,y,.5);B3(2.1,.05,.05,steelM,g,0,y,-.5);B3(2.1,.08,1.1,std({color:'#8a6a40'}),g,0,y+.04,0);}}
  // guindaste ao longe
  {const g=new THREE.Group();g.position.set(-30,0,-70);PIT.add(g);const m=new THREE.MeshBasicMaterial({color:'#4a3a56',fog:true});B3(2,45,2,m,g,0,22.5,0);B3(40,1.4,1.4,m,g,10,45,0);B3(1,.6,10,m,g,25,44,0);B3(8,1.2,1.2,m,g,-8,45,0);B3(3,3,3,m,g,-12,43.5,0);}
  // postes de luz e fios
  for(const x of[-14,-4,6,16]){const p=new THREE.Group();p.position.set(x,0,-16);PIT.add(p);M3(new THREE.CylinderGeometry(.1,.14,8,8),std({color:'#3a3a40',roughness:.8}),p,0,4,0);B3(2.2,.1,.1,std({color:'#3a3a40'}),p,0,7.6,0);const l=M3(new THREE.SphereGeometry(.18,10,8),new THREE.MeshBasicMaterial({color:'#ffe2a8',toneMapped:false}),p,1,7.45,0);glowSpr(p,'#ffcf8a',3.2,1,7.45,.1);}
  for(let k=0;k<3;k++){const pts=[];for(let i=0;i<=24;i++){const u=i/24;pts.push(V(-14+u*30,7.55-k*.18-Math.sin(u*Math.PI*3)*.55*(1-Math.abs(u-.5)*.3)*0+(-Math.sin(u*Math.PI)*.4),-16));}PIT.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts),new THREE.LineBasicMaterial({color:'#2a2a30'})));}
  // carro estacionado (silhueta simples)
  {const g=new THREE.Group();g.position.set(12,0,-9);g.rotation.y=.35;PIT.add(g);B3(4,.8,1.8,std({color:'#3a6a8a',metalness:.5,roughness:.35}),g,0,.65,0);B3(2.2,.7,1.6,std({color:'#2a4a66',metalness:.4,roughness:.3}),g,-.2,1.3,0);for(const sx of[-1.3,1.3])for(const sz of[-.9,.9])M3(new THREE.CylinderGeometry(.34,.34,.25,16),std({color:'#1a1a1e'}),g,sx,.34,sz).rotation.x=Math.PI/2;glowSpr(g,'#fff2c0',1.6,2.05,.7,.5);glowSpr(g,'#fff2c0',1.6,2.05,.7,-.5);}
  // flores, tufos e arbustos no terreno
  for(let i=0;i<120;i++){const x=(R()-.5)*34,z=-3-R()*26;if(Math.abs(x)<2.4&&z>-4)continue;const c=['#ffd23f','#ff6fa8','#fff','#c68aff'][i%4];M3(new THREE.CylinderGeometry(.008,.008,.22,4),std({color:'#4a6a2a'}),PIT,x,.11,z);M3(new THREE.SphereGeometry(.05,8,6),std({color:c,emissive:c,emissiveIntensity:.15}),PIT,x,.24,z);}
  for(let i=0;i<22;i++){const x=(R()-.5)*50,z=-8-R()*40;if(Math.abs(x)<3)continue;const b=M3(new THREE.IcosahedronGeometry(.6+R()*.5,1),std({color:['#5a6a32','#6a7a38','#4a5a2a'][i%3],roughness:1}),PIT,x,.4,z);b.scale.y=.7;}
  // poças refletindo o céu e trilha de terra até o buraco
  for(const[x,z,s]of[[-2.6,3.6,1.2],[2.4,5.5,1.6],[-1.2,-9,2]]){const pd=M3(new THREE.CircleGeometry(s,28),new THREE.MeshStandardMaterial({color:'#e8a888',roughness:.05,metalness:.8,transparent:true,opacity:.75}),PIT,x,.012,z);pd.rotation.x=-Math.PI/2;pd.castShadow=false;}
  const dirt=M3(new THREE.PlaneGeometry(2.6,70),std({color:'#8a6a48',roughness:1}),PIT,0,.006,-38);dirt.rotation.x=-Math.PI/2;dirt.castShadow=false;
  // fita de isolamento em volta do buraco (laterais) e placa extra
  const tapeT=tex(256,32,(g,w,h)=>{for(let i=0;i<16;i++){g.fillStyle=i%2?'#c8102e':'#fff';g.fillRect(i*16,0,16,h);}});
  for(const sx of[-1,1]){for(const y of[.55,.85]){const tp=M3(new THREE.PlaneGeometry(6.4,.1),new THREE.MeshStandardMaterial({map:tapeT,side:THREE.DoubleSide}),PIT,sx*(PW+.45),y,0);tp.rotation.y=Math.PI/2;tp.castShadow=false;}for(const z of[-3.2,3.2])M3(new THREE.CylinderGeometry(.025,.025,1.1,6),std({color:'#e8b22a'}),PIT,sx*(PW+.45),.55,z);}
  // ===== interior do buraco =====
  PT.drips=[];
  // escoras de madeira: tábuas verticais nas paredes laterais e vigas no fundo
  const beam=std({color:'#6a4a2a',roughness:.9});
  for(const d of[3,9,15]){B3(2*PW,.16,.16,beam,PIT,0,-d,-2.78);for(const sx of[-1,1]){B3(.1,1.4,2.2,beam,PIT,sx*(PW-.02),-d-.2,-1.2);B3(.1,1.4,2.2,beam,PIT,sx*(PW-.02),-d-.2,1.4);}}
  // canos saindo da parede com gotejamento e válvula
  for(const[d,sx]of[[7,-1],[13,1]]){const pp=M3(new THREE.CylinderGeometry(.09,.09,.9,14),rustM,PIT,sx*(PW-.4),-d,-1.2);pp.rotation.z=Math.PI/2;M3(new THREE.TorusGeometry(.1,.025,8,16),std({color:'#6a6c74',metalness:.8}),PIT,sx*(PW-.8),-d,-1.2).rotation.y=Math.PI/2;M3(new THREE.SphereGeometry(.1,10,8),std({color:'#c8322e'}),PIT,sx*(PW-.55),-d+.14,-1.2);PT.drips.push({x:sx*(PW-.84),y:-d-.1,z:-1.2});}
  PT.dripP=new THREE.Points(new THREE.BufferGeometry().setAttribute('position',new THREE.BufferAttribute(new Float32Array(2*6*3),3)),new THREE.PointsMaterial({color:'#bfe6ff',size:5,sizeAttenuation:false,transparent:true,opacity:.85,depthWrite:false}));PIT.add(PT.dripP);
  // cabo elétrico com lâmpadas de obra penduradas
  {const pts=[];for(let i=0;i<=40;i++){const u=i/40;pts.push(V(-PW+.12+Math.sin(u*9)*.04,-u*20,-2.9+.12));}PIT.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts),new THREE.LineBasicMaterial({color:'#101014'})));
   for(const d of[2.5,7.5,12.5,17.5]){const bl=M3(new THREE.SphereGeometry(.09,12,10),new THREE.MeshBasicMaterial({color:'#fff1c0',toneMapped:false}),PIT,-PW+.2,-d,-2.7);glowSpr(PIT,'#ffd890',.55,-PW+.2,-d,-2.6);M3(new THREE.ConeGeometry(.13,.12,14,1,true),std({color:'#2a2a30',side:THREE.DoubleSide}),PIT,-PW+.2,-d+.12,-2.7);}}
  // escada de madeira quebrada na parede direita
  {const g=new THREE.Group();g.position.set(PW-.12,-10,.2);PIT.add(g);for(const z of[-.28,.28])B3(.06,20,.08,beam,g,0,0,z);for(let i=-9;i<=9;i++){if(rnd(i+40)>.8)continue;B3(.06,.06,.6,beam,g,0,i*1.05,0).rotation.z=(rnd(i)-.5)*.1;}}
  // corda pendurada do alto até o meio do buraco com balde
  {const cp=[];for(let i=0;i<=24;i++)cp.push(V(PW-.6+Math.sin(i*.5)*.02,-i*.52,-2.4));PIT.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(cp),new THREE.LineBasicMaterial({color:'#b4986a'})));const bk=M3(new THREE.CylinderGeometry(.16,.12,.26,16,1,true),std({color:'#8a8c94',metalness:.7,roughness:.4,side:THREE.DoubleSide}),PIT,PW-.6,-12.6,-2.4);}
  // musgo, cogumelos brilhantes e pedras no fundo
  const mossM=std({color:'#4f7a2e',roughness:1});for(let i=0;i<26;i++){const sx=R()>.5?1:-1,m=M3(new THREE.CircleGeometry(.18+R()*.3,10),mossM,PIT,sx*(PW-.015),-1-R()*(PD-2),(R()-.5)*5);m.rotation.y=-sx*Math.PI/2;m.castShadow=false;}
  PT.mush=[];for(let i=0;i<16;i++){const d=9+R()*10.5,sx=R()>.5?1:-1,g=new THREE.Group();g.position.set(sx*(PW-.07),-d,(R()-.5)*4.5);PIT.add(g);const c=['#6fe0ff','#9aff9a','#ff9ad0'][i%3];M3(new THREE.CylinderGeometry(.01,.014,.07,6),std({color:'#e8e0d0'}),g,0,.03,0);const cap=M3(new THREE.SphereGeometry(.05,10,8,0,TAU,0,Math.PI/2),new THREE.MeshStandardMaterial({color:c,emissive:c,emissiveIntensity:.9}),g,0,.07,0);glowSpr(g,c,.28,0,.08,.02);}
  PT.bl=new THREE.PointLight('#6fe0ff',1.4,6,1.6);PT.bl.position.set(1.2,-17,0);PIT.add(PT.bl);
  for(let i=0;i<10;i++){const st=M3(new THREE.DodecahedronGeometry(.12+R()*.22,0),std({color:'#7a766c'}),PIT,(R()-.5)*2.6,-PD+.1,(R()-.5)*4.6);st.scale.y=.6;}
  M3(new THREE.CylinderGeometry(.14,.1,.28,14,1,true),rustM,PIT,-.9,-PD+.14,1.2).rotation.z=1.2;
  const bt=M3(new THREE.CylinderGeometry(.04,.05,.2,10),new THREE.MeshStandardMaterial({color:'#3a8a5a',transparent:true,opacity:.6,roughness:.1}),PIT,.7,-PD+.1,-1.4);bt.rotation.z=1.3;
  // nuvens, pássaros e vaga-lumes no céu e no terreno
  PT.clouds=A3.clouds(PIT,{color:'#ffc0a8',n:10});PT.birds=A3.birds(PIT,{n:7,y:30,z:-60});PT.fire=A3.fireflies(PIT,{center:V(0,1.2,-6),area:V(18,2,14),n:34,size:8,color:'#ffe8a0'});PT.fog=A3.fogCards(PIT,{w:18,d:16,n:9,color:'#e8c0b8'});PT.fog.obj.position.z=-6;
}
function updDetails(t,top){PT.clouds.obj.visible=PT.birds.obj.visible=PT.fire.obj.visible=PT.fog.obj.visible=top;if(top){PT.clouds.update(t);PT.birds.update(t);PT.fire.update(t);PT.fog.update(t);}
  PT.mixer.rotation.y=t*1.2;PT.mush.forEach(()=>{});PT.bl.intensity=1.2+.4*Math.sin(t*2);const a=PT.dripP.geometry.attributes.position;PT.drips.forEach((d,k)=>{for(let j=0;j<6;j++){const q=(t*.9+j/6+k*.37)%1;a.setXYZ(k*6+j,d.x,d.y-q*q*3.2,d.z);}});a.needsUpdate=true;}

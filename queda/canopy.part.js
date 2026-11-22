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

const CHUTE=makeChute();

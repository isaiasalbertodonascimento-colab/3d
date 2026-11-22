# Monta index.html: quarto (cena-quarto) + bairro (exemplo-vento) + cenas do raio (cenas.js)
import re
Q=open('../cena-quarto/index.html').read().split('\n')
E=open('../exemplo-vento/index.html').read().split('\n')
room='\n'.join(Q[45:207]+Q[223:225]+Q[228:239])  # linhas 46-207, 224-225, 229-239
room=room.replace("FAIRY.push(gl);","FAIRY.push(gl);gl.userData.b=b;").replace("lamp.add(ll);","lamp.add(ll);DESK.userData.ll=ll;DESK.userData.bulb=bulb;").replace("scene.add(sun,sun.target)","ROOM.add(sun,sun.target)").replace("scene.add(hemi)","ROOM.add(hemi)").replace("scene.add(fillL)","ROOM.add(fillL)").replace("const ROOM=new THREE.Group();scene.add(ROOM);","")
helpers='\n'.join(E[38:49])
town='\n'.join(E[136:204]+E[210:212])
town=town.replace("const TOWN=new THREE.Group();scene.add(TOWN);","")
head=open('head.html').read();cen=open('cenas.js').read()
out=head+f"""
// ================= QUARTO (de cena-quarto) =================
const ROOM=new THREE.Group();scene.add(ROOM);
const RMX=(()=>{{let SEED=3;const R=()=>{{SEED=(SEED*16807)%2147483647;return SEED/2147483647;}};
{room}
return {{sun,hemi,fillL,RAYS,DUST,PLANTS,SUNF,FLAMES,CH,FAIRY,STEAM,DESK,CURT,NS,SD}};}})();
// ================= BAIRRO (de exemplo-vento) =================
const TOWN=new THREE.Group();scene.add(TOWN);
const TWX=(()=>{{let SEED=11;const R=()=>{{SEED=(SEED*16807)%2147483647;return SEED/2147483647;}};
{helpers}
{town}
return {{SKY,CLOUDS,GU,TREES,HOUSES,POSTS,RAIN,updRain,soft,puffTex}};}})();
{cen}
</script>
</body></html>
"""
open('index.html','w').write(out);print('ok',len(out))

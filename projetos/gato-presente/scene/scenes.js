// Cenas do projeto. Cada chave é o nome usado em "cena" no beats.json.
// Uma cena recebe ctx = { THREE, env, W, H, shot, args, rng } e devolve:
//   scene   – THREE.Scene (use studio(ctx) para já vir com luz e fundo)
//   rig     – { target, dist, yaw, pitch, fov }: o motor move a câmera conforme "camera" do shot
//             (ou devolva cam e mova você mesmo em update, sem rig)
//   update(t, d, k) – t = segundos desde o início do shot, d = duração, k = 0..1
//   bloom   – [força, raio, limiar] opcional; exposure opcional
// Estas duas cenas são exemplos: substitua pelas do seu tema.
import * as THREE from 'three';
import { studio, kid, posekid, blob, tube, clay, wet, glow, cut, particles, smooth, lerp, V } from './lib.js';

export default {
  // plano aberto: personagem reagindo
  personagem(ctx) {
    const { scene } = studio(ctx, { top: '#3b5bdb', bottom: '#0d1330' });
    const k = kid({ shirt: ctx.args.camisa ?? 0xe8543a });
    scene.add(k);
    const dust = particles(120, [-3, 0, -3, 6, 3, 6], { size: 0.03, opacity: 0.35 }); scene.add(dust.points);
    return {
      scene, rig: { target: V(0, 1.15, 0), dist: 3.2, pitch: 0.08, fov: 35 },
      update(t, d, kk) {
        posekid(k, t, { talk: true, shock: smooth(0.3, 0.6, kk) * (ctx.args.susto ? 1 : 0), armR: ctx.args.susto ? smooth(.2, .5, kk) * .5 : 0 });
        dust.update(t);
      }
    };
  },
  // close macro: objeto orgânico girando com corte mostrando o interior
  macro(ctx) {
    const { scene } = studio(ctx, { top: '#5a1630', bottom: '#12040a', floor: false, rimColor: 0xff9ad5 });
    const plane = cut(V(0, 0, -1), 0);
    const outer = blob(1, wet(0xe86a8a, { clip: [plane], side: THREE.DoubleSide }), { seed: 2, noise: 0.08 });
    const core = blob(0.45, glow(0xffd23f, 1.5), { seed: 5, noise: 0.2 });
    scene.add(outer, core);
    return {
      scene, rig: { target: V(0, 0, 0), dist: 3.4, pitch: 0.2, fov: 35 }, bloom: [0.6, 0.5, 0.7],
      update(t) { outer.rotation.y = t * 0.3; core.scale.setScalar(1 + Math.sin(t * 4) * 0.05); }
    };
  },
};

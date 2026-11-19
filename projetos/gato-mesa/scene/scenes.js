// Cenas: "Por que seu gato derruba coisas da mesa?"
import * as THREE from 'three';
import { studio, kid, posekid, blob, clay, wet, glow, particles, smooth, lerp, clamp, ease, V } from './lib.js';
import { gato, poseGato, coracao, ondas } from './gato.js';

const MESA_Y = 1.0;

function mesa(scene) {
  const g = new THREE.Group(); scene.add(g);
  const tampo = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.12, 1.3), clay(0xb87545, { sheen: 0.3 })); tampo.position.y = MESA_Y - 0.06; tampo.castShadow = tampo.receiveShadow = true; g.add(tampo);
  for (const [x, z] of [[-0.95, -0.5], [0.95, -0.5], [-0.95, 0.5], [0.95, 0.5]]) {
    const p = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.05, MESA_Y - 0.12, 12), clay(0x8a5230)); p.position.set(x, (MESA_Y - 0.12) / 2, z); p.castShadow = true; g.add(p);
  }
  return g;
}
function caneca(cor = 0x4dabf7) {
  const g = new THREE.Group();
  const corpo = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.12, 0.26, 28), clay(cor, { coat: 0.6 })); corpo.position.y = 0.13; corpo.castShadow = true; g.add(corpo);
  const alca = new THREE.Mesh(new THREE.TorusGeometry(0.07, 0.022, 10, 20), clay(cor, { coat: 0.6 })); alca.position.set(0.15, 0.14, 0); g.add(alca);
  const cafe = new THREE.Mesh(new THREE.CircleGeometry(0.11, 24), wet(0x5c3a21)); cafe.rotation.x = -Math.PI / 2; cafe.position.y = 0.24; g.add(cafe);
  return g;
}
function ratinho() {
  const g = new THREE.Group(), m = clay(0xadb5bd, { sheen: 0.8 });
  const c = blob(0.14, m, { seed: 3, noise: 0.03, stretch: V(1.5, 0.8, 0.9) }); c.position.y = 0.11; g.add(c);
  for (const s of [-1, 1]) { const o = new THREE.Mesh(new THREE.SphereGeometry(0.06, 14, 10), clay(0xffc9c9)); o.position.set(0.14, 0.22, s * 0.07); o.scale.z = 0.4; g.add(o); }
  const n = new THREE.Mesh(new THREE.SphereGeometry(0.025, 10, 8), clay(0xff8fab)); n.position.set(0.26, 0.11, 0); g.add(n);
  const r = new THREE.Mesh(new THREE.TorusGeometry(0.15, 0.012, 6, 20, Math.PI), clay(0xffc9c9)); r.position.set(-0.32, 0.08, 0); g.add(r);
  return g;
}
const fundo = (ctx, top, bottom, o = {}) => studio(ctx, { top, bottom, floorColor: 0x6b4f3a, rimColor: 0xffe8cc, ...o });

export default {
  // gato em cima da mesa com uma caneca
  mesa(ctx) {
    const fase = ctx.args.fase || 'empurra', close = !!ctx.args.close;
    const cores = { empurra: ['#1098ad', '#04232b'], encara: ['#1098ad', '#04232b'], cutuca: ['#7048e8', '#160b38'], pensa: ['#f59f00', '#2b1a02'], malandro: ['#e64980', '#2b0614'] }[fase];
    const { scene } = fundo(ctx, cores[0], cores[1]);
    mesa(scene);
    const g = gato(); g.position.set(-0.15, MESA_Y, -0.1); g.rotation.y = 0.15; scene.add(g);
    const cup = caneca(); cup.position.set(0.42, MESA_Y, 0.38); scene.add(cup);
    if (fase === 'encara' || fase === 'malandro' || fase === 'pensa') cup.visible = false;
    const lampada = new THREE.Mesh(new THREE.SphereGeometry(0.12, 20, 16), glow(0xffe066, 1)); lampada.position.set(-0.15, MESA_Y + 1.75, 0); lampada.visible = fase === 'pensa'; scene.add(lampada);
    const pata = g.userData.patas[1];
    const titulo = ctx.shot.start < 2.2;
    const rig = close ? { target: V(-0.1, MESA_Y + 1.0, 0), dist: 2.8, pitch: 0.04, fov: 32 }
      : { target: V(0.3, MESA_Y + (titulo ? 0.95 : 0.35), 0), dist: 6.8, pitch: 0.14, yaw: 0.15, fov: 36 };
    return {
      scene, rig, bloom: [0.35, 0.5, 0.8],
      update(t, d, k) {
        const o = { olhar: [0, 0], vira: 0 };
        if (fase === 'empurra') {
          const e = smooth(0.05, 0.4, k);                                // pata estica
          pata.position.set(0.17 + e * 0.28, 0.2 + e * 0.18, 0.3 + e * 0.12);
          const s = smooth(0.3, 0.7, k);                                 // caneca desliza até a borda
          cup.position.x = lerp(0.42, 1.08, s);
          const q = clamp((k - 0.7) / 0.3);                              // e cai
          cup.position.y = MESA_Y - 4.9 * (q * d * 0.3) ** 2; cup.rotation.z = -q * 2.2;
          cup.visible = cup.position.y > -0.3;
          o.olhar = [0, 0]; o.vira = -0.25; o.pupilaLarga = k > 0.7; o.piscar = 0;
        } else if (fase === 'encara') { o.pupilaLarga = true; o.piscar = 0; o.vira = -0.15; }
        else if (fase === 'cutuca') {
          const tap = Math.max(0, Math.sin(t * 7));
          pata.position.set(0.17 + tap * 0.22, 0.2 + tap * 0.2, 0.3 + tap * 0.1);
          cup.rotation.z = -tap * 0.12; cup.position.x = 0.42 + tap * 0.03; o.olhar = [0.7, -0.4]; o.vira = 0.45;
        } else if (fase === 'pensa') {
          const on = smooth(0.35, 0.5, k); lampada.material.color.setRGB(1 * (0.3 + on * 1.5), 0.88 * (0.3 + on * 1.5), 0.4 * (0.3 + on * 1.5));
          lampada.scale.setScalar(0.6 + on * 0.5); o.olhar = [0.3, 0.9]; o.inclina = 0.15;
        } else if (fase === 'malandro') { o.piscar = 0.55; o.inclina = 0.2; o.cauda = 3; o.olhar = [0, 0]; }
        poseGato(g, t, o);
      }
    };
  },

  // a caneca caindo e batendo no chão
  queda(ctx) {
    const { scene } = fundo(ctx, '#e8590c', '#2b0b02', { floorColor: 0x8a5a3c, keyI: 2.0 });
    const cup = caneca(); scene.add(cup);
    const cacos = [];
    for (let i = 0; i < 14; i++) { const c = blob(0.04 + ctx.rng() * 0.04, clay(0x4dabf7), { seed: i, noise: 0.3, seg: 12 }); c.visible = false; c.userData.v = V((ctx.rng() - 0.5) * 3, 1 + ctx.rng() * 2, (ctx.rng() - 0.5) * 3); scene.add(c); cacos.push(c); }
    const onda = ctx.args.ondas ? ondas(scene, V(0, 0.05, 0), 0xffd43b, 4, V(0, 1, 0)) : null;
    const T0 = 0.35;
    return {
      scene, rig: { target: V(0, 0.55, 0), dist: 3.4, pitch: 0.25, fov: 36 }, bloom: [0.3, 0.4, 0.85],
      update(t) {
        const caiu = t >= T0;
        cup.visible = !caiu; cup.position.y = 1.4 - 9.4 * t * t; cup.rotation.z = -t * 6;
        cacos.forEach(c => { c.visible = caiu; if (caiu) { const u = t - T0; c.position.set(c.userData.v.x * u, Math.max(0.03, c.userData.v.y * u - 4.9 * u * u), c.userData.v.z * u); c.rotation.set(u * 9, u * 7, 0); } });
        if (onda) onda(t);
      }
    };
  },

  // gato agachado "caçando" um ratinho de brinquedo
  cacada(ctx) {
    const { scene } = fundo(ctx, '#2f9e44', '#05240c', { floorColor: 0x5c940d });
    const tapete = new THREE.Mesh(new THREE.CircleGeometry(2.2, 48), clay(0xe67700, { sheen: 1 })); tapete.rotation.x = -Math.PI / 2; tapete.position.y = 0.01; tapete.receiveShadow = true; scene.add(tapete);
    const g = gato(); g.rotation.y = 0.9; g.position.set(-0.6, 0, 0); scene.add(g);
    const r = ratinho(); r.position.set(0.7, 0, 0.2); r.rotation.y = Math.PI * 0.85; scene.add(r);
    return {
      scene, rig: { target: V(0.05, 0.5, 0), dist: 5.6, pitch: 0.2, fov: 36 },
      update(t, d, k) {
        g.scale.y = 0.82; g.rotation.z = -0.08; g.position.y = 0;
        g.rotation.x = Math.sin(t * 9) * 0.02;                                   // rebolado antes do bote
        poseGato(g, t, { pupilaLarga: true, piscar: 0, olhar: [0.6, -0.3], orelhaTras: 0.3, cauda: 6 });
        r.position.x = 0.7 + Math.sin(t * 3) * 0.12; r.rotation.y = Math.PI * 0.85 + Math.sin(t * 6) * 0.2;
      }
    };
  },

  // "caçada que deu certo": confete e gato orgulhoso
  festa(ctx) {
    const { scene } = fundo(ctx, '#f76707', '#2b1002');
    const g = gato(); scene.add(g);
    const conf = ['#ff6b6b', '#ffd43b', '#69db7c', '#4dabf7', '#da77f2'].map((c, i) => { const p = particles(40, [-2, 0, -1.5, 4, 3.2, 3], { color: c, size: 0.08, rise: -0.5, seed: i + 2, opacity: 0.95 }); scene.add(p.points); return p; });
    const estrela = new THREE.Mesh(new THREE.OctahedronGeometry(0.16, 0), glow(0xffe066, 1.4)); estrela.position.set(0, 1.95, 0); scene.add(estrela);
    return {
      scene, rig: { target: V(0, 0.95, 0), dist: 4.3, pitch: 0.08, fov: 34 }, bloom: [0.45, 0.5, 0.75],
      update(t) {
        conf.forEach(c => c.update(t)); estrela.rotation.set(t * 2, t * 3, 0); estrela.position.y = 1.95 + Math.sin(t * 3) * 0.05;
        g.position.y = Math.abs(Math.sin(t * 5)) * 0.06;
        poseGato(g, t, { piscar: 0.6, inclina: Math.sin(t * 5) * 0.12, cauda: 4, olhar: [0, 0.3] });
      }
    };
  },

  // a pessoa chega correndo; com carinho, faz cafuné e saem corações
  chega(ctx) {
    const carinho = !!ctx.args.carinho;
    const { scene } = fundo(ctx, '#3b5bdb', '#0b1238');
    mesa(scene);
    const g = gato(); g.position.set(0.45, MESA_Y, 0); g.rotation.y = -0.5; scene.add(g);
    const p = kid({ shirt: 0xf03e3e, hair: 0x2b1a10, skin: 0xe0a07a }); p.scale.setScalar(1.35); p.rotation.y = 0.6; scene.add(p);
    const cs = [0, 1, 2].map(() => { const c = coracao(); c.visible = carinho; scene.add(c); return c; });
    return {
      scene, rig: { target: V(0, 1.35, 0), dist: 5.2, pitch: 0.1, fov: 38 },
      update(t, d, k) {
        const chegada = carinho ? 1 : ease(smooth(0, 0.6, k));
        p.position.set(lerp(-3.5, -0.75, chegada), carinho ? 0 : Math.abs(Math.sin(t * 9)) * 0.06 * (1 - chegada), 0.3);
        posekid(p, t, { open: carinho ? 0.2 : 0.5, armR: carinho ? 0.35 + Math.sin(t * 5) * 0.08 : 0.2, lookX: 0.6, shock: carinho ? 0 : 0.3 });
        poseGato(g, t, { piscar: carinho ? 0.8 : 0, inclina: carinho ? 0.2 : 0, olhar: [-0.7, 0.2], vira: -0.2, cauda: carinho ? 1 : 3 });
        cs.forEach((c, i) => { const q = (t * 0.6 + i / 3) % 1; c.position.set(0.45 + Math.sin(i * 2) * 0.3, MESA_Y + 1.5 + q * 0.7, 0); c.scale.setScalar(Math.sin(q * Math.PI)); c.rotation.y = t; });
      }
    };
  },

  // gancho da parte 2: gato orgulhoso com um "presente" (ratinho de brinquedo de barriga para cima)
  presente(ctx) {
    const { scene } = fundo(ctx, '#5f3dc4', '#140b38', { floorColor: 0x3a2f5c });
    const g = gato(); g.position.set(-0.3, 0, 0); scene.add(g);
    const r = ratinho(); r.position.set(0.45, 0.22, 0.5); r.rotation.set(Math.PI, 0.6, 0); scene.add(r);
    const laco = new THREE.Mesh(new THREE.TorusGeometry(0.07, 0.025, 10, 20), clay(0xff6b6b)); laco.position.set(0.45, 0.3, 0.5); scene.add(laco);
    const brilho = particles(40, [0.1, 0, 0.2, 0.7, 0.8, 0.6], { color: 0xffe066, size: 0.06, rise: 0.3 }); scene.add(brilho.points);
    return {
      scene, rig: { target: V(0.05, 0.35, 0.2), dist: 4.8, pitch: 0.15, fov: 34 }, bloom: [0.4, 0.5, 0.75],
      update(t) { brilho.update(t); poseGato(g, t, { piscar: 0.5, inclina: -0.12, cabeca: -0.1, olhar: [0, 0], cauda: 2 }); }
    };
  },
};

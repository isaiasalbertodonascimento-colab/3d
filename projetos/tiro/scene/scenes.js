// Cenas: "O que acontece quando alguém leva um tiro?" — visual simbólico, sem sangue explícito.
import * as THREE from 'three';
import { studio, kid, posekid, blob, tube, clay, wet, glow, cut, particles, smooth, lerp, clamp, ease, V } from './lib.js';

const SANGUE = 0xd6334a, PLAQ = 0xffc94d;

// hemácia: rosquinha achatada
function hemacia(r = 0.12) {
  const m = new THREE.Mesh(new THREE.TorusGeometry(r * 0.62, r * 0.42, 12, 24), wet(SANGUE, { coat: 0.8 }));
  m.scale.z = 0.7; m.castShadow = true; return m;
}
// plaqueta: bolinha amarela irregular
const plaqueta = (r, seed) => blob(r, clay(PLAQ, { emissive: 0x5a3a00, sheen: 0.8 }), { seed, noise: 0.3, freq: 5, seg: 20 });

// explosão de luz simbólica (sem ferida): anel + raios amarelos
function estouro(scene, pos) {
  const g = new THREE.Group(); g.position.copy(pos); scene.add(g);
  const anel = new THREE.Mesh(new THREE.TorusGeometry(0.2, 0.025, 8, 40), glow(0xffe066, 2.2, { opacity: 1 })); g.add(anel);
  const raios = [];
  for (let i = 0; i < 10; i++) {
    const r = new THREE.Mesh(new THREE.ConeGeometry(0.035, 0.28, 6), glow(0xffd43b, 2)); const a = i / 10 * Math.PI * 2;
    r.userData.a = a; g.add(r); raios.push(r);
  }
  return t => {
    const k = clamp(t / 0.5), f = 1 - smooth(0.35, 0.9, t);
    anel.scale.setScalar(lerp(0.3, 2.2, ease(k))); anel.material.opacity = f; anel.visible = f > 0.01;
    raios.forEach(r => { const d = lerp(0.1, 0.55, ease(k)); r.position.set(Math.cos(r.userData.a) * d, Math.sin(r.userData.a) * d, 0.05); r.rotation.z = r.userData.a - Math.PI / 2; r.scale.setScalar(f); r.visible = f > 0.01; });
    g.lookAt(0, 1.4, 10);
  };
}

export default {
  pessoa(ctx) {
    const acao = ctx.args.acao || 'andar';
    const bg = { andar: ['#4c6ef5', '#0c1440'], impacto: ['#4c6ef5', '#0c1440'], confuso: ['#5f3dc4', '#140b38'], respira: ['#c92a2a', '#2b0606'], atendido: ['#12b886', '#05261d'] }[acao];
    const { scene } = studio(ctx, { top: bg[0], bottom: bg[1], floorColor: 0x3a4466, rimColor: 0xffd8a8 });
    const p = kid({ shirt: 0x228be6, hair: 0x2b1a10, skin: 0xe0a07a, pants: 0x343a40 }); scene.add(p);
    const u = p.userData;
    let extra = () => {};
    if (acao === 'andar') {
      // faixas da calçada passando dão a sensação de caminhada
      const faixas = [];
      for (let i = 0; i < 8; i++) { const f = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.01, 0.35), clay(0xdee2e6)); f.position.y = 0.006; f.receiveShadow = true; scene.add(f); faixas.push(f); }
      extra = t => faixas.forEach((f, i) => { f.position.z = ((i * 1.0 + t * 1.3) % 8) - 6; });
    }
    if (acao === 'impacto') { const b = estouro(scene, V(-0.33, 1.08, 0.3)); extra = b; }
    if (acao === 'respira') {
      const gotas = [];
      for (let i = 0; i < 4; i++) { const g = blob(0.035, wet(0x9be7ff, { coat: 1, rough: 0.05 }), { seed: i, noise: 0.05 }); g.scale.y = 1.4; scene.add(g); gotas.push(g); }
      extra = t => gotas.forEach((g, i) => { const c = (t * 0.7 + i * 0.27) % 1; g.position.set((i % 2 ? 1 : -1) * (0.28 + i * 0.02), 1.85 - c * 0.35, 0.22); g.scale.setScalar(c < 0.9 ? 1 : 0); });
    }
    if (acao === 'atendido') {
      const faixa = capsuleBand(); u.arms[-1].add(faixa);
    }
    const target = acao === 'andar' || acao === 'atendido' ? V(0, 1.78, 0) : acao === 'impacto' ? V(0, 1.4, 0) : V(0, 1.55, 0); // título no topo: assunto mais baixo
    return {
      scene, rig: { target, dist: acao === 'respira' ? 1.9 : 3.0, pitch: 0.04, fov: 34 },
      update(t, d, k) {
        extra(t);
        if (acao === 'andar') {
          p.position.y = Math.abs(Math.sin(t * 6)) * 0.03; p.rotation.z = Math.sin(t * 6) * 0.03;
          u.arms[-1].rotation.x = Math.sin(t * 6) * 0.4; u.arms[1].rotation.x = -Math.sin(t * 6) * 0.4;
          posekid(p, t, { lookY: 0.1 });
        } else if (acao === 'impacto') {
          const s = smooth(0.0, 0.15, t);
          posekid(p, t, { shock: s, open: 0.4 * s, armL: -0.05, turn: -0.15 * s, blink: false });
          p.rotation.y = -0.08 * s; p.position.x = -0.03 * s;
        } else if (acao === 'confuso') {
          posekid(p, t, { turn: -0.55, nod: 0.25, lookX: -0.9, lookY: -0.6, tilt: 0.12, open: 0.2 });
        } else if (acao === 'respira') {
          const b = Math.sin(t * 9);
          u.torso.scale.set(1 + b * 0.025, 1 + b * 0.02, 1 + b * 0.04);
          posekid(p, t, { open: 0.45 + 0.25 * b, shock: 0.25, lookY: -0.2 });
        } else {
          posekid(p, t, { open: 0.15, lookY: 0.2, tilt: 0.06 });
        }
      }
    };
  },

  // cabeça em corte: cérebro brilha e solta "adrenalina" (bolinhas laranja) que desce pelo corpo
  cerebro(ctx) {
    const { scene } = studio(ctx, { top: '#e8590c', bottom: '#2b0b02', floor: false, rimColor: 0xffe8cc, keyI: 1.6, envI: 0.3 });
    const plano = cut(V(0, 0, -1), 0);
    const pele = clay(0xe0a07a, { clip: [plano], side: THREE.DoubleSide });
    const cabeca = blob(1, pele, { seed: 1, noise: 0.03 }); cabeca.scale.set(1, 1.08, 0.95); cabeca.position.y = 1.1; scene.add(cabeca);
    const dentroC = blob(0.94, wet(0x7a2d3f, { clip: [plano], side: THREE.BackSide }), { seed: 1, noise: 0.03 }); dentroC.scale.copy(cabeca.scale); dentroC.position.y = 1.1; scene.add(dentroC);
    const pescoco = tube([[0, 0.4, 0], [0, -0.8, 0], [0, -2.6, 0]], 0.5, pele); scene.add(pescoco);
    const cer = blob(0.68, wet(0xf7a1b5, { coat: 0.6 }), { seed: 9, noise: 0.07, freq: 14, stretch: V(1.1, 0.8, 0.9) }); cer.position.y = 1.35; scene.add(cer);
    const nucleo = blob(0.18, glow(0xffa94d, 1.6), { seed: 3, noise: 0.2, seg: 24 }); nucleo.position.set(0, 1.1, 0.1); scene.add(nucleo);
    const cam = tube([[0, 1.0, 0.1], [0, 0.2, 0.05], [0, -1.2, 0], [0, -2.6, 0]], 0.1, glow(0xffa94d, 0.5)); scene.add(cam);
    const curva = cam.userData.curve, gotas = [];
    for (let i = 0; i < 18; i++) { const g = new THREE.Mesh(new THREE.SphereGeometry(0.07, 12, 10), glow(0xffd43b, 2)); scene.add(g); gotas.push(g); }
    return {
      scene, rig: { target: V(0, 0.3, 0), dist: 6.4, pitch: 0.08, fov: 40 }, bloom: [0.5, 0.5, 0.75],
      update(t) {
        const pulso = 1 + 0.12 * Math.max(0, Math.sin(t * 7));
        nucleo.scale.setScalar(pulso); cer.scale.setScalar(1 + 0.01 * Math.sin(t * 7));
        gotas.forEach((g, i) => { curva.getPointAt((t * 0.35 + i / gotas.length) % 1, g.position); g.position.z += 0.12; });
      }
    };
  },

  // vaso sanguíneo em corte: hemácias passando e algumas escapando pelo rasgo (plaquetas = args)
  vaso(ctx) {
    const plaq = !!ctx.args.plaquetas;
    const { scene } = studio(ctx, { top: '#862e9c', bottom: '#1a0626', floor: false, rimColor: 0xffc9c9, keyI: 1.9, envI: 0.3 });
    const plano = cut(V(0, 0, -1), 0);
    const pts = [[-5, -0.3, 0], [-2, 0.1, 0], [0, 0, 0], [2, -0.1, 0], [5, 0.3, 0]];
    const parede = tube(pts, 0.85, wet(0xf28ba0, { clip: [plano], side: THREE.DoubleSide }), { segments: 120, radial: 32 }); scene.add(parede);
    const dentro = tube(pts, 0.78, wet(0x9c2a4a, { clip: [plano], side: THREE.BackSide }), { segments: 120, radial: 32 }); scene.add(dentro);
    // rasgo: anel escuro no alto da parede
    const rasgo = new THREE.Mesh(new THREE.TorusGeometry(0.22, 0.07, 10, 30), wet(0x5c0f22)); rasgo.position.set(0.3, 0.8, -0.1); rasgo.rotation.x = Math.PI / 2; scene.add(rasgo);
    const curva = parede.userData.curve, rng = ctx.rng, cel = [];
    for (let i = 0; i < 36; i++) {
      const m = i % 5 === 0 && plaq ? plaqueta(0.08, i) : hemacia(0.13);
      m.userData = { ph: rng(), off: V((rng() - 0.5) * 0.9, (rng() - 0.5) * 0.9, -rng() * 0.5), sai: !plaq && i % 6 === 0, plaq: plaq && i % 5 === 0, rot: rng() * 6 };
      scene.add(m); cel.push(m);
    }
    const p = V();
    return {
      scene, rig: { target: V(0, 0.15, 0), dist: 4.6, pitch: 0.15, fov: 40 }, bloom: [0.3, 0.4, 0.9],
      update(t) {
        cel.forEach(m => {
          const u = m.userData, c = (t * 0.12 + u.ph) % 1;
          curva.getPointAt(c, p); m.position.copy(p).add(V(0, u.off.y * 0.7, u.off.z * 0.7));
          if (u.sai && c > 0.5) { const e = (c - 0.5) * 2; m.position.lerp(V(0.3, 0.8 + e * 2.2, -0.1), Math.min(1, e * 3)); }
          if (u.plaq && c > 0.45) { const e = smooth(0.45, 0.55, c); m.position.lerp(V(0.3 + Math.sin(u.rot) * 0.15, 0.72, -0.1 + Math.cos(u.rot) * 0.15), e); }
          m.rotation.set(t + u.rot, t * 0.7 + u.rot, 0);
        });
      }
    };
  },

  // cinco potes = cinco litros; o último vai esvaziando
  litros(ctx) {
    const { scene } = studio(ctx, { top: '#364fc7', bottom: '#0b1238', floorColor: 0x2b3566, rimColor: 0xffc9c9 });
    const potes = [];
    for (let i = 0; i < 5; i++) {
      const g = new THREE.Group(); g.position.set((i - 2) * 0.62, 0, 0); scene.add(g);
      const vidro = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.24, 0.8, 32, 1, true), clay(0xe7f5ff, { opacity: 0.12, coat: 1, rough: 0.05, side: THREE.DoubleSide }));
      vidro.position.y = 0.4; g.add(vidro);
      const tampa = new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.26, 0.08, 32), clay(0xf1f3f5)); tampa.position.y = 0.84; tampa.castShadow = true; g.add(tampa);
      const base = new THREE.Mesh(new THREE.CylinderGeometry(0.245, 0.245, 0.04, 32), clay(0xf1f3f5)); base.position.y = 0.02; base.receiveShadow = true; g.add(base);
      const liq = new THREE.Mesh(new THREE.CylinderGeometry(0.21, 0.21, 1, 32), wet(0xc92a2a, { coat: 1 })); g.add(liq);
      potes.push({ g, liq });
    }
    return {
      scene, rig: { target: V(0, 0.75, 0), dist: 8.5, pitch: 0.18, fov: 36 },
      update(t, d, k) {
        potes.forEach(({ g, liq }, i) => {
          const s = ease(smooth(i * 0.09, i * 0.09 + 0.18, k)); g.scale.setScalar(Math.max(0.001, s));
          const nivel = i === 4 ? lerp(0.72, 0.3, smooth(0.6, 1, k)) : 0.72;
          liq.scale.y = nivel; liq.position.y = 0.05 + nivel / 2;
        });
      }
    };
  },

  // tronco em corte com coração batendo (args.rapido = acelerado)
  coracao(ctx) {
    const rapido = !!ctx.args.rapido;
    const { scene } = studio(ctx, { top: '#c2255c', bottom: '#2b0612', floor: false, rimColor: 0xffe3e3, keyI: 1.8, envI: 0.3 });
    const plano = cut(V(0, 0, -1), 0);
    const tronco = new THREE.Mesh(new THREE.CapsuleGeometry(1.25, 1.4, 8, 32), clay(0x228be6, { clip: [plano], side: THREE.DoubleSide })); tronco.scale.z = 0.7; scene.add(tronco);
    const dentro = new THREE.Mesh(new THREE.CapsuleGeometry(1.15, 1.4, 8, 32), wet(0x6e1f33, { clip: [plano], side: THREE.BackSide })); dentro.scale.z = 0.7; scene.add(dentro);
    const cor = new THREE.Group(); cor.position.set(0.1, 0.25, 0); scene.add(cor);
    const mat = wet(0xe03131, { coat: 1 });
    const l1 = blob(0.42, mat, { seed: 2, noise: 0.06 }); l1.position.set(-0.22, 0.12, 0); cor.add(l1);
    const l2 = blob(0.42, mat, { seed: 4, noise: 0.06 }); l2.position.set(0.22, 0.12, 0); cor.add(l2);
    const ponta = blob(0.45, mat, { seed: 6, noise: 0.05, stretch: V(1, 1.3, 0.9) }); ponta.position.set(0, -0.3, 0); cor.add(ponta);
    const aorta = tube([[0.05, 0.4, 0], [0.1, 1.1, 0], [0.6, 1.3, 0], [0.8, 0.9, 0]], 0.13, wet(0xf03e3e)); cor.add(aorta);
    const veia = tube([[-0.3, 0.4, 0], [-0.4, 1.2, 0], [-0.5, 1.9, 0]], 0.11, wet(0x5f3dc4)); cor.add(veia);
    const brilho = new THREE.PointLight(0xff6b6b, 0, 3, 2); brilho.position.set(0, 0, 0.8); cor.add(brilho);
    const hz = rapido ? 2.6 : 1.25;
    return {
      scene, rig: rapido ? { target: V(0.1, 0.35, 0), dist: 2.6, pitch: 0.08, fov: 36 } : { target: V(0, 0.2, 0), dist: 5.6, pitch: 0.1, fov: 38 },
      bloom: [0.35, 0.5, 0.85],
      update(t) {
        const ph = (t * hz) % 1, b = Math.exp(-ph * 9) + 0.5 * Math.exp(-Math.abs(ph - 0.22) * 25);
        cor.scale.setScalar(1 + 0.09 * b); brilho.intensity = 3 * b;
      }
    };
  },

  // close no rasgo: plaquetas se juntam num tampão (args.vaza = ainda escapa um pouco)
  tampao(ctx) {
    const vaza = !!ctx.args.vaza;
    const { scene } = studio(ctx, { top: '#a61e4d', bottom: '#22040e', floor: false, rimColor: 0xfff3bf, keyI: 2, envI: 0.3 });
    const parede = blob(3, wet(0xf28ba0), { seed: 7, noise: 0.02, freq: 2 }); parede.position.y = -3; scene.add(parede);
    const borda = new THREE.Mesh(new THREE.TorusGeometry(0.55, 0.14, 16, 48), wet(0xc2255c)); borda.rotation.x = Math.PI / 2; borda.position.y = 0.0; scene.add(borda);
    const buraco = new THREE.Mesh(new THREE.CircleGeometry(0.5, 40), new THREE.MeshBasicMaterial({ color: 0x2b0610 })); buraco.rotation.x = -Math.PI / 2; buraco.position.y = 0.01; scene.add(buraco);
    const rng = ctx.rng, pl = [];
    for (let i = 0; i < 30; i++) {
      const a = rng() * Math.PI * 2, r = Math.sqrt(rng()) * 0.42;
      const m = plaqueta(0.09 + rng() * 0.04, i); scene.add(m);
      m.userData = { alvo: V(Math.cos(a) * r, 0.06 + rng() * 0.05, Math.sin(a) * r), ini: V(Math.cos(a) * 2.5, 0.3 + rng() * 0.8, Math.sin(a) * 2.5), atraso: rng() * 0.5, rot: rng() * 6, falta: vaza && r < 0.18 && rng() < 0.7 };
      pl.push(m);
    }
    const gotas = [];
    if (vaza) for (let i = 0; i < 6; i++) { const h = hemacia(0.09); scene.add(h); gotas.push(h); }
    return {
      scene, rig: { target: V(0, 0.05, 0), dist: 2.6, pitch: 0.75, fov: 38 }, bloom: [0.3, 0.4, 0.9],
      update(t, d, k) {
        pl.forEach(m => {
          const u = m.userData; const e = vaza ? 1 : ease(smooth(u.atraso * 0.6, u.atraso * 0.6 + 0.5, k));
          m.position.lerpVectors(u.ini, u.alvo, e); m.rotation.set(t + u.rot, t * 0.5, 0);
          m.visible = !u.falta;
        });
        gotas.forEach((g, i) => { const c = (t * 0.5 + i / gotas.length) % 1; g.position.set(Math.sin(i * 2) * 0.08, lerp(-0.1, 1.3, c), Math.cos(i * 2) * 0.08); g.rotation.set(t * 2 + i, t, 0); g.scale.setScalar(1 - c * 0.5); });
      }
    };
  },

  // mãos pressionando um pano sobre o ombro
  maos(ctx) {
    const { scene } = studio(ctx, { top: '#1971c2', bottom: '#061a33', floor: false, rimColor: 0xffe8cc, keyI: 1.7, envI: 0.25 });
    const ombro = blob(2.2, clay(0x228be6), { seed: 3, noise: 0.02 }); ombro.position.y = -2.2; scene.add(ombro);
    const pano = blob(0.55, clay(0xdee2e6, { sheen: 0.4 }), { seed: 5, noise: 0.12, freq: 6, stretch: V(1.2, 0.25, 1) }); pano.position.y = 0.02; scene.add(pano);
    const pele = clay(0xc98a62);
    const mao = (s) => {
      const g = new THREE.Group();
      const palma = blob(0.3, pele, { seed: 2 + s, noise: 0.04, stretch: V(1, 0.45, 1.2) }); g.add(palma);
      for (let i = 0; i < 4; i++) { const f = new THREE.Mesh(new THREE.CapsuleGeometry(0.065, 0.22, 4, 12), pele); f.castShadow = true; f.rotation.x = Math.PI / 2; f.position.set(-0.17 + i * 0.115, -0.02, 0.42); g.add(f); }
      const pol = new THREE.Mesh(new THREE.CapsuleGeometry(0.07, 0.18, 4, 12), pele); pol.rotation.set(Math.PI / 2, 0, s * 0.9); pol.position.set(s * 0.3, 0, 0.12); g.add(pol);
      const braco = new THREE.Mesh(new THREE.CapsuleGeometry(0.2, 1.4, 6, 16), clay(0x495057)); braco.rotation.x = -1.0; braco.position.set(0, 0.5, -0.75); g.add(braco);
      return g;
    };
    const m1 = mao(-1); m1.position.set(-0.05, 0.22, -0.05); m1.rotation.y = 0.15; scene.add(m1);
    const m2 = mao(1); m2.position.set(0.08, 0.36, 0.05); m2.rotation.y = -0.2; scene.add(m2);
    return {
      scene, rig: { target: V(0, 0.25, 0), dist: 3.0, pitch: 0.45, yaw: 0.3, fov: 36 }, bloom: [0.12, 0.4, 0.95],
      update(t) { const pr = 0.04 * (0.5 + 0.5 * Math.sin(t * 3)); m1.position.y = 0.22 - pr; m2.position.y = 0.36 - pr; pano.scale.y = 1 - pr * 2; }
    };
  },

  // ambulância de massinha chegando com a sirene piscando
  ambulancia(ctx) {
    const { scene } = studio(ctx, { top: '#3b5bdb', bottom: '#0b1238', floorColor: 0x495057, rimColor: 0xa5d8ff, keyI: 1.8, envI: 0.25 });
    const car = new THREE.Group(); scene.add(car);
    const branco = clay(0xdfe3e8);
    const bau = new THREE.Mesh(new THREE.BoxGeometry(2.2, 1.3, 1.25, 4, 4, 4), branco); bau.position.set(-0.4, 1.0, 0); bau.castShadow = true; car.add(bau);
    const cab = new THREE.Mesh(new THREE.BoxGeometry(0.95, 0.95, 1.2), branco); cab.position.set(1.15, 0.82, 0); cab.castShadow = true; car.add(cab);
    const vidro = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.42, 1.0), wet(0x1c3d5a, { rough: 0.05 })); vidro.position.set(1.63, 1.02, 0); car.add(vidro);
    const faixa = new THREE.Mesh(new THREE.BoxGeometry(3.18, 0.16, 1.27), clay(0xf03e3e)); faixa.position.set(0.07, 0.72, 0); car.add(faixa);
    const giroA = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.14, 0.3), glow(0x4dabf7, 2)); giroA.position.set(-0.1, 1.73, 0.3); car.add(giroA);
    const giroB = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.14, 0.3), glow(0xff6b6b, 2)); giroB.position.set(-0.1, 1.73, -0.3); car.add(giroB);
    const luz = new THREE.PointLight(0x4dabf7, 0, 8, 2); luz.position.set(-0.1, 2.1, 0.6); car.add(luz);
    const rodas = [];
    for (const [x, z] of [[-1.0, 0.62], [-1.0, -0.62], [1.1, 0.62], [1.1, -0.62]]) {
      const r = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.22, 24), clay(0x212529)); r.rotation.x = Math.PI / 2; r.position.set(x, 0.3, z); r.castShadow = true; car.add(r); rodas.push(r);
    }
    return {
      scene, rig: { target: V(0, 0.9, 0), dist: 9.5, pitch: 0.12, yaw: 0.5, fov: 36 }, bloom: [0.35, 0.5, 0.9],
      update(t, d, k) {
        car.position.x = lerp(4.5, 0, ease(clamp(k * 1.4))); car.position.y = Math.abs(Math.sin(t * 14)) * 0.015;
        rodas.forEach(r => { r.rotation.y = -t * 8 * (1 - clamp(k * 1.4)); });
        const on = Math.sin(t * 12) > 0; giroA.visible = on; giroB.visible = !on; luz.color.set(on ? 0x4dabf7 : 0xff6b6b); luz.intensity = 5;
      }
    };
  },
};

// curativo branco enrolado no braço esquerdo (filho do grupo do ombro)
function capsuleBand() {
  const g = new THREE.Group();
  for (let i = 0; i < 3; i++) { const b = new THREE.Mesh(new THREE.TorusGeometry(0.085, 0.03, 10, 24), clay(0xffffff, { sheen: 1 })); b.rotation.x = Math.PI / 2; b.position.y = -0.1 - i * 0.05; g.add(b); }
  return g;
}

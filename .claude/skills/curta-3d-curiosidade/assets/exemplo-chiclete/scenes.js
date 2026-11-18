// Cenas: "Chiclete fica 7 anos na barriga?"
import * as THREE from 'three';
import { studio, kid, posekid, blob, tube, clay, wet, glow, cut, particles, smooth, lerp, clamp, ease, V } from './lib.js';

const ROSA = 0xff5fa8;
const goma = (r = 0.12, seed = 3) => blob(r, wet(ROSA, { coat: 1, rough: 0.25 }), { seed, noise: 0.14, freq: 4 });

// enxame de esferinhas que avançam até um alvo e ricocheteiam (enzimas)
function enxame(scene, n, rng, alvo, raio, cor) {
  const mat = glow(cor, 1.6), its = [];
  for (let i = 0; i < n; i++) {
    const m = new THREE.Mesh(new THREE.IcosahedronGeometry(raio * (0.6 + rng() * 0.6), 1), mat);
    const dir = V(rng() - 0.5, rng() - 0.5, rng() * 0.6).normalize();
    its.push({ m, dir, ph: rng() * 6, sp: 0.8 + rng() * 0.8 }); scene.add(m);
  }
  return t => its.forEach(o => {
    const c = (t * o.sp * 0.6 + o.ph / 6) % 1;           // ciclo: vem de longe, bate, volta
    const d = c < 0.6 ? lerp(1.6, 0.0, c / 0.6) : lerp(0.0, 0.9, (c - 0.6) / 0.4);
    o.m.position.copy(alvo).addScaledVector(o.dir, d + raio * 9);
    o.m.rotation.set(t * 2 + o.ph, t * 3, 0);
  });
}

export default {
  menino(ctx) {
    const acao = ctx.args.acao || 'engolir';
    const bg = { engolir: ['#4263eb', '#0b1238'], duvida: ['#7048e8', '#160b38'], alivio: ['#0ca678', '#06281f'] }[acao];
    const { scene } = studio(ctx, { top: bg[0], bottom: bg[1], floorColor: 0x2b3566, rimColor: 0xffc0e0 });
    const k = kid({ shirt: 0xff922b, hair: 0x3b2314 }); scene.add(k);
    const g = goma(0.07); scene.add(g);
    const pts = particles(80, [-2.5, 0, -2, 5, 3, 3], { size: 0.03, opacity: 0.3 }); scene.add(pts.points);
    const target = acao === 'engolir' ? V(0, 1.72, 0) : V(0, 1.55, 0); // assunto mais baixo: o título ocupa o topo
    return {
      scene, rig: { target, dist: acao === 'engolir' ? 2.3 : 3.4, pitch: 0.02, fov: 32 },
      update(t, d, kk) {
        pts.update(t);
        if (acao === 'engolir') {
          // a goma sobe da mão, voa em arco até a boca e some; depois o pescoço "engole"
          const f = smooth(0.1, 0.55, kk), a = V(0.42, 1.05, 0.25), b = V(0, 1.48, 0.33);
          g.position.lerpVectors(a, b, f); g.position.y += Math.sin(f * Math.PI) * 0.25;
          g.visible = kk < 0.57; g.rotation.set(t * 4, t * 3, 0);
          posekid(k, t, { open: smooth(0.3, 0.5, kk) * (1 - smooth(0.58, 0.66, kk)), armR: 0.35 * (1 - smooth(0.2, 0.4, kk)),
            swallow: smooth(0.62, 0.72, kk) * (1 - smooth(0.82, 0.95, kk)), shock: smooth(0.75, 0.85, kk), lookY: 0.4 * f });
        } else if (acao === 'duvida') {
          g.visible = false;
          posekid(k, t, { tilt: 0.18 * Math.sin(t * 2), lookX: 0.6, lookY: 0.8, armR: 0.95, talk: kk > 0.3 });
          k.userData.arms[1].rotation.x = -0.6;
        } else {
          g.visible = false;
          const j = Math.abs(Math.sin(t * 5)) * 0.12 * smooth(0.1, 0.3, kk);
          k.position.y = j;
          posekid(k, t, { open: 0.55, armL: 0.75 + 0.1 * Math.sin(t * 10), armR: 0.75 + 0.1 * Math.sin(t * 10 + 1), lookY: 0.3 });
        }
      }
    };
  },

  // cabeça em corte: a bolinha rosa desce pela garganta
  garganta(ctx) {
    const { scene } = studio(ctx, { top: '#c2255c', bottom: '#2b0612', floor: false, rimColor: 0xffd8a8, keyPos: [3, 4, 3], keyI: 1.6, envI: 0.25 });
    const plano = cut(V(0, 0, -1), 0);
    const pele = clay(0xf2b38f, { clip: [plano], side: THREE.DoubleSide });
    const cabeca = blob(1, pele, { seed: 1, noise: 0.03 }); cabeca.scale.set(1, 1.08, 0.95); cabeca.position.y = 0.9; scene.add(cabeca);
    const pescoco = tube([[0, 0.2, 0], [0, -0.6, 0], [0, -1.8, 0]], 0.55, pele); scene.add(pescoco);
    const interior = wet(0xb83b5e, { clip: [plano], side: THREE.BackSide });
    const boca = blob(0.5, wet(0x9c2a4a, { clip: [plano], side: THREE.DoubleSide }), { seed: 6, noise: 0.06, stretch: V(1, 0.5, 1) });
    boca.position.set(0, 0.45, 0.25); scene.add(boca);
    const lingua = blob(0.32, wet(0xff7a8a, { clip: [plano] }), { seed: 2, noise: 0.05, stretch: V(1.1, 0.4, 1.4) }); lingua.position.set(0, 0.3, 0.2); scene.add(lingua);
    const garg = tube([[0, 0.35, 0.05], [0, -0.2, -0.05], [0, -0.9, -0.05], [0, -1.8, 0]], u => 0.16 + 0.02 * Math.sin(u * 30), interior); scene.add(garg);
    const garg2 = tube([[0, 0.35, 0.05], [0, -0.2, -0.05], [0, -0.9, -0.05], [0, -1.8, 0]], 0.19, wet(0xe8798f, { clip: [plano], side: THREE.DoubleSide })); scene.add(garg2);
    const g = goma(0.12); scene.add(g);
    const curva = garg.userData.curve;
    return {
      scene, rig: { target: V(0, 0.1, 0), dist: 6.2, pitch: 0.1, fov: 38 }, bloom: [0.25, 0.4, 0.9],
      update(t, d, kk) { curva.getPointAt(clamp(0.05 + kk * 0.9), g.position); g.position.z += 0.05; g.rotation.set(t * 3, t * 2, 0); g.scale.set(1, 1.2 + 0.2 * Math.sin(t * 8), 1); }
    };
  },

  // esôfago em corte com enzimas cercando a goma
  esofago(ctx) {
    const { scene } = studio(ctx, { top: '#862e9c', bottom: '#1a0626', floor: false, rimColor: 0x99e9f2 });
    const plano = cut(V(0, 0, -1), 0);
    const pts = [[-0.3, 3, 0], [0.2, 1.5, 0], [-0.2, 0, 0], [0.25, -1.5, 0], [0, -3, 0]];
    const parede = tube(pts, u => 0.6 + 0.06 * Math.sin(u * 50), wet(0xe8798f, { clip: [plano], side: THREE.DoubleSide }), { segments: 200 }); scene.add(parede);
    const dentro = tube(pts, u => 0.52 + 0.06 * Math.sin(u * 50), wet(0xa8324f, { clip: [plano], side: THREE.BackSide }), { segments: 200 }); scene.add(dentro);
    const g = goma(0.3); scene.add(g);
    const alvo = V(); const enz = enxame(scene, 26, ctx.rng, alvo, 0.035, 0x69db7c);
    const saliva = particles(150, [-0.6, -3, -0.4, 1.2, 6, 0.6], { color: 0xc5f6fa, size: 0.05, rise: -0.4, opacity: 0.5 }); scene.add(saliva.points);
    const curva = parede.userData.curve;
    return {
      scene, rig: { target: V(0, 0, 0), dist: 3.2, pitch: 0.05, fov: 40 }, bloom: [0.7, 0.5, 0.7],
      update(t, d, kk) {
        curva.getPointAt(clamp(0.35 + kk * 0.2), g.position); g.position.z = -0.05; g.rotation.set(t, t * 0.7, 0);
        g.scale.set(1 + 0.08 * Math.sin(t * 5), 1 - 0.08 * Math.sin(t * 5), 1);
        alvo.copy(g.position); enz(t); saliva.update(t);
      }
    };
  },

  // close na goma: enzimas ricocheteiam ou ácido borbulha em volta
  goma(ctx) {
    const acido = !!ctx.args.acido;
    const { scene } = studio(ctx, acido ? { top: '#2b8a3e', bottom: '#051a08', floor: false, rimColor: 0xd8f5a2, keyI: 2.0, envI: 0.35 }
      : { top: '#a61e4d', bottom: '#2b0612', floor: false, rimColor: 0x96f2d7 });
    const g = goma(0.62, 5); scene.add(g);
    // bolhinhas de ar presas na goma
    for (let i = 0; i < 14; i++) {
      const b = new THREE.Mesh(new THREE.SphereGeometry(0.06 + ctx.rng() * 0.07, 16, 12), wet(0xffc9e3, { coat: 1, rough: 0.1 }));
      const dir = V(ctx.rng() - 0.5, ctx.rng() - 0.5, ctx.rng() - 0.5).normalize(); b.position.copy(dir.multiplyScalar(0.6)); g.add(b);
    }
    let upd;
    if (acido) {
      const bolhas = particles(260, [-2, -2.5, -1.5, 4, 5, 3], { color: 0xd8f5a2, size: 0.09, rise: 0.8, opacity: 0.8 }); scene.add(bolhas.points);
      
      upd = t => bolhas.update(t);
    } else {
      upd = enxame(scene, 34, ctx.rng, V(0, 0, 0), 0.07, 0x69db7c);
    }
    return {
      scene, rig: { target: V(0, -0.2, 0), dist: 3.6, pitch: 0.12, fov: 38 }, bloom: acido ? [0.45, 0.5, 0.8] : [0.5, 0.5, 0.75],
      update(t) { g.rotation.set(t * 0.4, t * 0.6, 0); g.scale.setScalar(1 + 0.03 * Math.sin(t * 6)); upd(t); }
    };
  },

  // estômago em corte com ácido brilhando lá dentro
  estomago(ctx) {
    const { scene } = studio(ctx, { top: '#e8590c', bottom: '#2b0b02', floor: false, rimColor: 0xfff3bf, keyI: 1.8, envI: 0.3 });
    const plano = cut(V(0, 0, -1), 0);
    const forma = { seed: 8, noise: 0.07, stretch: V(1.25, 1, 0.8) };
    const casca = blob(1.5, wet(0xf06595, { clip: [plano], side: THREE.DoubleSide }), forma); casca.rotation.z = -0.5; scene.add(casca);
    const dentro = blob(1.38, wet(0xa61e4d, { clip: [plano], side: THREE.BackSide }), forma); dentro.rotation.z = -0.5; scene.add(dentro);
    const ent = tube([[-0.7, 3, 0], [-0.6, 1.8, 0], [-0.9, 1.0, 0]], 0.28, wet(0xf06595, { clip: [plano], side: THREE.DoubleSide })); scene.add(ent);
    // poça de ácido: disco brilhante cortado pela casca
    const acido = new THREE.Mesh(new THREE.CircleGeometry(1.25, 48), glow(0xa9e34b, 0.75, { clip: [plano] })); acido.rotation.x = -Math.PI / 2; acido.position.y = -0.45; scene.add(acido);
    const bolhas = particles(120, [-1.1, -0.6, -0.8, 2.2, 1.2, 0.9], { color: 0xe9fac8, size: 0.06, rise: 0.25 }); scene.add(bolhas.points);
    const g = goma(0.22); scene.add(g);
    return {
      scene, rig: { target: V(0, 0.1, 0), dist: 6.5, pitch: 0.3, fov: 38 }, bloom: [0.45, 0.5, 0.8],
      update(t) { g.position.set(Math.sin(t * 0.9) * 0.4, -0.38 + Math.sin(t * 2.3) * 0.04, -0.1); g.rotation.set(t, t * 0.6, 0); bolhas.update(t);
        acido.scale.setScalar(1 + 0.02 * Math.sin(t * 3)); casca.scale.setScalar(1 + 0.015 * Math.sin(t * 2)); }
    };
  },

  // intestino serpenteando; a goma viaja por ele (args.fim = close na saída)
  intestino(ctx) {
    const fim = !!ctx.args.fim;
    const { scene } = studio(ctx, { top: '#1098ad', bottom: '#04232b', floor: false, rimColor: 0xffd8a8 });
    const plano = cut(V(0, 0, -1), 0);
    const pts = []; for (let i = 0; i <= 40; i++) { const u = i / 40; pts.push(V(Math.sin(u * Math.PI * 5) * 1.3, 2.6 - u * 5.4, Math.cos(u * Math.PI * 5) * 0.15)); }
    const parede = tube(pts, u => 0.34 + 0.05 * Math.sin(u * 160), wet(0xf783ac, { clip: [plano], side: THREE.DoubleSide }), { segments: 400, radial: 20 }); scene.add(parede);
    const dentro = tube(pts, 0.29, wet(0xa61e4d, { clip: [plano], side: THREE.BackSide }), { segments: 300, radial: 16 }); scene.add(dentro);
    const g = goma(0.17); scene.add(g);
    const curva = parede.userData.curve, foco = V(0, 0, 0);
    return {
      scene, rig: fim ? { target: foco, dist: 2.2, pitch: 0.15, yaw: 0.25, fov: 36 } : { target: foco, dist: 6.2, pitch: 0.05, fov: 40 },
      update(t, d, kk) {
        const u = fim ? lerp(0.6, 0.78, kk) : lerp(0.05, 0.8, kk);
        curva.getPointAt(clamp(u), g.position); g.position.z -= 0.02; g.rotation.set(t * 2, t, 0);
        if (fim) foco.copy(g.position).add(V(0, 0.25, 0));  // câmera acompanha a goma
      }
    };
  },
};

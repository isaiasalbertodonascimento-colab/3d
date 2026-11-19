// Cenas: "Por que seu gato traz bichos mortos para você?" (parte 2)
import * as THREE from 'three';
import { studio, kid, posekid, blob, clay, wet, glow, cut, particles, smooth, lerp, clamp, ease, V } from './lib.js';
import { gato, poseGato, coracao } from './gato.js';

// ratinho de brinquedo (de barriga para cima = "presente")
function ratinho(cor = 0xadb5bd) {
  const g = new THREE.Group(), m = clay(cor, { sheen: 0.8 });
  const c = blob(0.14, m, { seed: 3, noise: 0.03, stretch: V(1.5, 0.8, 0.9) }); c.position.y = 0.11; g.add(c);
  for (const s of [-1, 1]) { const o = new THREE.Mesh(new THREE.SphereGeometry(0.06, 14, 10), clay(0xffc9c9)); o.position.set(0.14, 0.22, s * 0.07); o.scale.z = 0.4; g.add(o); }
  const n = new THREE.Mesh(new THREE.SphereGeometry(0.025, 10, 8), clay(0xff8fab)); n.position.set(0.26, 0.11, 0); g.add(n);
  const r = new THREE.Mesh(new THREE.TorusGeometry(0.15, 0.012, 6, 20, Math.PI), clay(0xffc9c9)); r.position.set(-0.32, 0.08, 0); g.add(r);
  return g;
}
function laco(cor = 0xff6b6b) {
  const g = new THREE.Group(), m = clay(cor, { coat: 0.6 });
  for (const s of [-1, 1]) { const a = new THREE.Mesh(new THREE.TorusGeometry(0.06, 0.025, 10, 20), m); a.position.x = s * 0.06; a.scale.set(1, 0.7, 1); g.add(a); }
  const n = new THREE.Mesh(new THREE.SphereGeometry(0.03, 10, 8), m); g.add(n); return g;
}
// texto em placa (para números grandes no gráfico)
function placa(txt, cor = '#ffffff', w = 1.2) {
  const c = document.createElement('canvas'); c.width = 512; c.height = 256; const g = c.getContext('2d');
  g.font = '900 170px Anton, Impact, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
  g.lineWidth = 22; g.strokeStyle = '#000'; g.strokeText(txt, 256, 135); g.fillStyle = cor; g.fillText(txt, 256, 135);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
  return new THREE.Mesh(new THREE.PlaneGeometry(w, w / 2), new THREE.MeshBasicMaterial({ map: t, transparent: true, toneMapped: false }));
}
function borboleta() {
  const g = new THREE.Group(), asas = [];
  for (const s of [-1, 1]) { const a = new THREE.Mesh(new THREE.CircleGeometry(0.12, 20), clay(0xb197fc, { side: THREE.DoubleSide, emissive: 0x2a1a5e })); a.position.x = s * 0.1; a.scale.set(1, 1.3, 1); const p = new THREE.Group(); p.add(a); g.add(p); asas.push(p); }
  const corpo = new THREE.Mesh(new THREE.CapsuleGeometry(0.02, 0.14, 4, 8), clay(0x343a40)); g.add(corpo);
  g.userData.bater = t => asas.forEach((p, i) => { p.rotation.y = (i ? 1 : -1) * Math.abs(Math.sin(t * 14)) * 1.1; });
  return g;
}
function grama(scene, rng, n = 160, raio = 3.5) {
  const geo = new THREE.ConeGeometry(0.035, 0.32, 4), mat = clay(0x51cf66);
  const inst = new THREE.InstancedMesh(geo, mat, n), m = new THREE.Matrix4(), q = new THREE.Quaternion();
  for (let i = 0; i < n; i++) { const a = rng() * 6.28, r = Math.sqrt(rng()) * raio; q.setFromEuler(new THREE.Euler((rng() - 0.5) * 0.4, 0, (rng() - 0.5) * 0.4)); m.compose(V(Math.cos(a) * r, 0.14, Math.sin(a) * r - 0.5), q, V(1, 0.7 + rng() * 0.8, 1)); inst.setMatrixAt(i, m); }
  scene.add(inst);
}

export default {
  // porta de casa: gato orgulhoso com o "presente" no capacho
  porta(ctx) {
    const close = !!ctx.args.close, orgulho = !!ctx.args.orgulho;
    const { scene } = studio(ctx, { top: '#f08c00', bottom: '#2b1700', floorColor: 0x5c5f66, rimColor: 0xffe8cc, keyI: 1.9, envI: 0.3 });
    const parede = new THREE.Mesh(new THREE.BoxGeometry(6, 4, 0.2), clay(0xe0b88a)); parede.position.set(0, 2, -1.2); parede.receiveShadow = true; scene.add(parede);
    const porta = new THREE.Mesh(new THREE.BoxGeometry(1.3, 2.4, 0.12), clay(0x1971c2)); porta.position.set(0, 1.2, -1.05); porta.castShadow = true; scene.add(porta);
    const mac = new THREE.Mesh(new THREE.SphereGeometry(0.06, 16, 12), clay(0xffd43b, { coat: 1 })); mac.position.set(0.48, 1.2, -0.97); scene.add(mac);
    const capacho = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.04, 0.8), clay(0xc92a2a)); capacho.position.set(0, 0.02, -0.3); capacho.receiveShadow = true; scene.add(capacho);
    const vaso = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.17, 0.4, 20), clay(0xe8590c)); vaso.position.set(-1.25, 0.2, -0.75); scene.add(vaso);
    const planta = blob(0.35, clay(0x2f9e44), { seed: 2, noise: 0.25, freq: 6 }); planta.position.set(-1.25, 0.65, -0.75); scene.add(planta);
    const g = gato(); g.position.set(-0.2, 0.04, -0.35); scene.add(g);
    const r = ratinho(); r.position.set(0.42, 0.26, 0.05); r.rotation.set(Math.PI, 0.5, 0); scene.add(r);
    const l = laco(); l.position.set(0.42, 0.29, 0.05); scene.add(l);
    const brilho = particles(30, [0.1, 0.1, -0.2, 0.6, 0.6, 0.5], { color: 0xffe066, size: 0.06, rise: 0.25 }); scene.add(brilho.points);
    const titulo = ctx.shot.start < 3.2 || ctx.shot.beat === 5;
    const rig = close ? { target: V(-0.15, 0.9, -0.2), dist: 3.7, pitch: 0.04, fov: 32 }
      : { target: V(0.05, titulo ? 1.45 : 0.75, -0.2), dist: 5.0, pitch: 0.12, fov: 36 };
    return {
      scene, rig, bloom: [0.2, 0.4, 0.9], exposure: 0.92,
      update(t, d, k) {
        brilho.update(t);
        poseGato(g, t, { piscar: close ? 0.45 : 0.55, cabeca: -0.12, inclina: orgulho ? Math.sin(t * 2) * 0.1 : 0.05, olhar: [0, 0], cauda: 2.5 });
        g.userData.corpo.scale.y = 1.15 * 1.04; // peito estufado
      }
    };
  },

  // barriga cheia, mas os olhos vão na borboleta
  pote(ctx) {
    const { scene } = studio(ctx, { top: '#1098ad', bottom: '#04232b', floorColor: 0x495057, rimColor: 0xfff3bf });
    const pote = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.34, 0.2, 32), clay(0xf03e3e, { coat: 0.6 })); pote.position.set(0.6, 0.1, 0.3); scene.add(pote);
    const rng = ctx.rng;
    for (let i = 0; i < 40; i++) { const r = new THREE.Mesh(new THREE.SphereGeometry(0.05, 8, 6), clay(0xa0522d)); const a = rng() * 6.28, rr = Math.sqrt(rng()) * 0.32; r.position.set(0.6 + Math.cos(a) * rr, 0.2 + rng() * 0.12 * (1 - rr / 0.32) + 0.02, 0.3 + Math.sin(a) * rr); scene.add(r); }
    const g = gato(); g.position.set(-0.35, 0, 0); g.rotation.y = 0.3; scene.add(g);
    const b = borboleta(); scene.add(b);
    return {
      scene, rig: { target: V(0.1, 0.85, 0), dist: 4.0, pitch: 0.15, fov: 36 },
      update(t) {
        b.position.set(Math.sin(t * 0.9) * 0.9, 1.85 + Math.sin(t * 2.1) * 0.2, 0.3 + Math.cos(t * 0.7) * 0.3); b.userData.bater(t); b.rotation.y = Math.sin(t) * 0.5;
        poseGato(g, t, { pupilaLarga: true, piscar: 0, olhar: [b.position.x * 0.8, 1], cabeca: -0.25, vira: b.position.x * 0.4, cauda: 4 });
      }
    };
  },

  // jardim: espreita e dá o bote (args.bote)
  jardim(ctx) {
    const bote = !!ctx.args.bote;
    const { scene } = studio(ctx, { top: '#1c7ed6', bottom: '#74c0fc', floorColor: 0x2f9e44, rimColor: 0xfff3bf, keyI: 2.0, envI: 0.3 });
    grama(scene, ctx.rng);
    for (let i = 0; i < 6; i++) { const f = new THREE.Mesh(new THREE.SphereGeometry(0.08, 12, 10), clay([0xff6b6b, 0xffd43b, 0xda77f2][i % 3])); f.position.set(-2 + i * 0.8, 0.35, -1.5 - (i % 2) * 0.5); scene.add(f); }
    for (let i = 0; i < 7; i++) { const c = new THREE.Mesh(new THREE.BoxGeometry(0.16, 1.1, 0.06), clay(0xfff4e6)); c.position.set(-3 + i * 1.0, 0.55, -2.6); scene.add(c); }
    const g = gato(); g.rotation.y = 1.1; scene.add(g);
    const r = ratinho(0x868e96); r.position.set(1.0, 0, 0.1); r.rotation.y = Math.PI; scene.add(r);
    return {
      scene, bloom: [0.2, 0.4, 0.9], rig: bote ? { target: V(0.5, 0.5, 0), dist: 5.0, pitch: 0.12, fov: 36 } : { target: V(0.1, 0.55, 0), dist: 5.0, pitch: 0.18, fov: 36 },
      update(t, d, k) {
        let x = -0.9, y = 0;
        if (bote) { const j = smooth(0.0, 0.35, t); x = lerp(-0.6, 0.75, j); y = Math.sin(j * Math.PI) * 0.6; g.rotation.z = -0.3 * Math.sin(j * Math.PI); }
        else { x = -0.9 + k * 0.4; g.rotation.x = Math.sin(t * 10) * 0.02; }
        g.position.set(x, y, 0); g.scale.y = bote ? 1 : 0.82;
        poseGato(g, t, { pupilaLarga: true, piscar: 0, olhar: [0.6, -0.3], orelhaTras: bote ? 0 : 0.35, cauda: bote ? 2 : 7 });
        r.position.x = 1.0 + Math.sin(t * 2) * 0.05;
      }
    };
  },

  // mãe ensinando os filhotes com um ratinho
  mae(ctx) {
    const close = !!ctx.args.close;
    const { scene } = studio(ctx, { top: '#e64980', bottom: '#2b0614', floorColor: 0x5c2a3d, rimColor: 0xffe3e3 });
    const m = gato(); m.position.set(-0.6, 0, -0.2); m.rotation.y = 0.5; scene.add(m);
    const f1 = gato({ cor: 0x495057 }); f1.scale.setScalar(0.5); f1.position.set(0.55, 0, 0.3); f1.rotation.y = -0.6; scene.add(f1);
    const f2 = gato({ cor: 0xffd8a8 }); f2.scale.setScalar(0.45); f2.position.set(0.95, 0, -0.1); f2.rotation.y = -0.9; scene.add(f2);
    const r = ratinho(); r.position.set(0.05, 0, 0.35); r.rotation.y = 0.4; scene.add(r);
    const cs = [0, 1].map(() => { const c = coracao(); c.scale.setScalar(0.6); scene.add(c); return c; });
    return {
      scene, rig: close ? { target: V(0.6, 0.45, 0.1), dist: 2.6, pitch: 0.12, fov: 34 } : { target: V(0.1, 0.65, 0), dist: 4.6, pitch: 0.15, fov: 36 },
      update(t) {
        poseGato(m, t, { piscar: 0.4, cabeca: 0.15, olhar: [0.5, -0.5], cauda: 1.2 });
        poseGato(f1, t + 1, { pupilaLarga: true, piscar: 0, olhar: [-0.6, -0.5], cauda: 5 });
        poseGato(f2, t + 2, { pupilaLarga: true, piscar: 0, olhar: [-0.8, -0.4], inclina: 0.2, cauda: 5 });
        f1.position.y = Math.abs(Math.sin(t * 6)) * 0.04;
        r.position.x = 0.05 + Math.sin(t * 2.5) * 0.08;
        cs.forEach((c, i) => { const q = (t * 0.5 + i / 2) % 1; c.position.set(-0.6 + i * 0.3, 1.6 + q * 0.6, -0.2); c.scale.setScalar(0.6 * Math.sin(q * Math.PI)); c.rotation.y = t; });
      }
    };
  },

  // a pessoa tentando caçar (e falhando); o gato julgando
  pessimo(ctx) {
    const julga = !!ctx.args.julga;
    const { scene } = studio(ctx, { top: '#7048e8', bottom: '#160b38', floorColor: 0x3b3561, rimColor: 0xffe066 });
    const p = kid({ shirt: 0x12b886, hair: 0x2b1a10, skin: 0xe0a07a }); p.scale.setScalar(1.25); scene.add(p);
    const r = ratinho(); scene.add(r);
    const g = gato(); g.position.set(1.1, 0, 0.5); g.rotation.y = -0.7; scene.add(g);
    return {
      scene, bloom: [0.2, 0.4, 0.9], rig: julga ? { target: V(1.05, 0.85, 0.5), dist: 3.9, pitch: 0.05, yaw: -0.2, fov: 34 } : { target: V(0.1, 1.15, 0), dist: 5.4, pitch: 0.1, fov: 38 },
      update(t) {
        const a = t * 2.2;
        r.position.set(Math.cos(a) * 0.9 - 0.4, 0, Math.sin(a) * 0.5); r.rotation.y = -a;
        const atraso = a - 0.9;
        p.position.set(Math.cos(atraso) * 0.9 - 0.4, Math.abs(Math.sin(t * 9)) * 0.05, Math.sin(atraso) * 0.5 - 0.4);
        p.rotation.y = -atraso + Math.PI; p.rotation.z = Math.sin(t * 7) * 0.12;
        posekid(p, t, { open: 0.6, shock: 0.4, armL: 0.6 + Math.sin(t * 9) * 0.3, armR: 0.6 + Math.cos(t * 9) * 0.3 });
        poseGato(g, t, { piscar: 0.6, inclina: 0.18, olhar: [-0.7, 0], cauda: 0.8 });
      }
    };
  },

  // casa em corte: o lugar mais seguro; ele entra com a presa (args.entra)
  casa(ctx) {
    const entra = !!ctx.args.entra;
    const { scene } = studio(ctx, { top: '#1c7ed6', bottom: '#0b3d6e', floorColor: 0x2f9e44, rimColor: 0xfff3bf, keyI: 1.9, envI: 0.3 });
    const plano = cut(V(0, 0, -1), 0.8);
    const casa = new THREE.Mesh(new THREE.BoxGeometry(3, 2, 2), clay(0xf4a261, { clip: [plano], side: THREE.DoubleSide })); casa.position.y = 1; scene.add(casa);
    const piso = new THREE.Mesh(new THREE.BoxGeometry(2.9, 0.05, 1.9), clay(0xb87545)); piso.position.y = 0.03; scene.add(piso);
    const tel = new THREE.Mesh(new THREE.ConeGeometry(2.3, 1.2, 4), clay(0xc92a2a)); tel.position.y = 2.6; tel.rotation.y = Math.PI / 4; tel.scale.z = 0.75; scene.add(tel);
    const sofa = blob(0.45, clay(0x5c7cfa), { seed: 2, noise: 0.05, stretch: V(1.6, 0.6, 0.8) }); sofa.position.set(-0.8, 0.3, -0.5); scene.add(sofa);
    const cama = new THREE.Mesh(new THREE.TorusGeometry(0.3, 0.1, 12, 30), clay(0x9775fa)); cama.rotation.x = Math.PI / 2; cama.position.set(0.85, 0.12, -0.3); scene.add(cama);
    const estoque = [0, 1, 2].map(i => { const r = ratinho([0xadb5bd, 0xffc9c9, 0x868e96][i]); r.scale.setScalar(0.7); r.position.set(0.75 + i * 0.12, 0.12 + i * 0.03, -0.3 + (i % 2) * 0.1); r.rotation.y = i; scene.add(r); return r; });
    const escudo = new THREE.Mesh(new THREE.TorusGeometry(2.2, 0.03, 8, 64), glow(0x69db7c, 1.2, { opacity: 1 })); escudo.position.set(0, 1.1, 0); scene.add(escudo);
    const g = gato(); g.scale.setScalar(0.8); scene.add(g);
    const r = ratinho(); r.scale.setScalar(0.8); scene.add(r);
    return {
      scene, bloom: [0.2, 0.4, 0.9], rig: entra ? { target: V(1.0, 0.6, 0.3), dist: 4.8, pitch: 0.2, fov: 36 } : { target: V(0.5, 0.7, 0), dist: 5.2, pitch: 0.3, fov: 36 },
      update(t, d, k) {
        escudo.material.opacity = 0.4 + 0.4 * Math.sin(t * 3); escudo.rotation.y = t * 0.5;
        const e = entra ? ease(clamp(k * 1.2)) : 1;
        g.position.set(lerp(2.4, 0.55, e), Math.abs(Math.sin(t * 8)) * 0.02 * (e < 1 ? 1 : 0), lerp(0.9, 0.0, e)); g.rotation.y = -1.2 + e * 0.6;
        r.position.copy(g.position).add(V(-0.22, 0.32, 0.1)); r.rotation.set(0.3, -1.2, 0);
        poseGato(g, t, { piscar: 0.3, olhar: [0, 0], cauda: 2 });
      }
    };
  },

  // brincando de caçada com a varinha
  brinca(ctx) {
    const { scene } = studio(ctx, { top: '#f76707', bottom: '#2b1002', floorColor: 0x6b4f3a, rimColor: 0xfff3bf });
    const p = kid({ shirt: 0x7950f2, hair: 0x2b1a10, skin: 0xe0a07a }); p.scale.setScalar(1.3); p.position.set(-1.0, 0, -0.4); p.rotation.y = 0.7; scene.add(p);
    const vara = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 1.3, 8), clay(0x343a40)); scene.add(vara);
    const pena = blob(0.12, clay(0xff6b6b, { sheen: 1 }), { seed: 5, noise: 0.35, freq: 7, stretch: V(0.6, 1.4, 0.6) }); scene.add(pena);
    const fio = new THREE.Line(new THREE.BufferGeometry().setFromPoints([V(), V()]), new THREE.LineBasicMaterial({ color: 0xffffff })); scene.add(fio);
    const g = gato(); g.position.set(0.6, 0, 0.2); g.rotation.y = -0.4; scene.add(g);
    return {
      scene, rig: { target: V(0, 1.0, 0), dist: 5.2, pitch: 0.1, fov: 38 },
      update(t) {
        posekid(p, t, { open: 0.4, armR: 0.7 + Math.sin(t * 3) * 0.15, lookX: 0.6 });
        const ponta = V(-0.3 + Math.sin(t * 3) * 0.4, 2.0, 0.1);
        vara.position.set((ponta.x - 0.75) / 2 - 0.2, 1.75, 0); vara.lookAt(ponta); vara.rotateX(Math.PI / 2);
        pena.position.set(0.55 + Math.sin(t * 3.5) * 0.35, 1.3 + Math.sin(t * 7) * 0.25, 0.3);
        fio.geometry.setFromPoints([ponta, pena.position.clone()]);
        const pulo = Math.max(0, Math.sin(t * 3.5));
        g.position.y = pulo * 0.45; g.rotation.z = -0.15 * pulo;
        poseGato(g, t, { pupilaLarga: true, piscar: 0, olhar: [0, 1], cabeca: -0.3, cauda: 6 });
        g.userData.patas.forEach((pt, i) => { pt.position.y = 0.2 + pulo * (0.25 + i * 0.05); pt.position.z = 0.3 + pulo * 0.15; });
      }
    };
  },

  // gráfico: antes x depois (–25% brincando, –36% ração com mais carne)
  barras(ctx) {
    const racao = ctx.args.qual === 'racao', alvo = racao ? 0.64 : 0.75;
    const { scene } = studio(ctx, { top: racao ? '#2b8a3e' : '#1971c2', bottom: racao ? '#051a08' : '#061a33', floorColor: 0x2b3566, rimColor: 0xffe8cc });
    const barra = (cor, x) => { const b = new THREE.Mesh(new THREE.BoxGeometry(0.75, 1, 0.75), clay(cor, { coat: 0.4 })); b.position.x = x; b.castShadow = true; scene.add(b); return b; };
    const antes = barra(0xfa5252, -0.6), depois = barra(0x40c057, 0.6);
    const ra = ratinho(), rd = ratinho(); scene.add(ra, rd);
    const num = placa(racao ? '-36%' : '-25%', '#ffd43b', 1.5); num.position.set(0.35, 0, 0.6); scene.add(num);
    const H = 2.4;
    return {
      scene, rig: { target: V(0, 1.45, 0), dist: 6.8, pitch: 0.08, fov: 36 },
      update(t, d, k) {
        const cresce = ease(smooth(0, 0.3, k)), cai = ease(smooth(0.3, 0.6, k));
        antes.scale.y = Math.max(0.01, H * cresce); antes.position.y = antes.scale.y / 2;
        const hd = H * cresce * lerp(1, alvo, cai); depois.scale.y = Math.max(0.01, hd); depois.position.y = hd / 2;
        ra.position.set(-0.6, antes.scale.y, 0); rd.position.set(0.6, hd, 0); ra.rotation.y = rd.rotation.y = t;
        num.position.set(0, 2.15, 0.9); num.scale.setScalar(smooth(0.55, 0.7, k) * (1 + 0.05 * Math.sin(t * 6)));
      }
    };
  },

  // comendo ração com pedaços de carne
  racao(ctx) {
    const { scene } = studio(ctx, { top: '#c92a2a', bottom: '#2b0606', floorColor: 0x5c3d2e, rimColor: 0xffe8cc });
    const pote = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.34, 0.2, 32), clay(0x4dabf7, { coat: 0.6 })); pote.position.set(0.15, 0.1, 0.6); scene.add(pote);
    const rng = ctx.rng;
    for (let i = 0; i < 18; i++) { const c = blob(0.07, wet(0x9c3b2d), { seed: i, noise: 0.25, seg: 14 }); const a = rng() * 6.28, rr = Math.sqrt(rng()) * 0.3; c.position.set(0.15 + Math.cos(a) * rr, 0.24, 0.6 + Math.sin(a) * rr); scene.add(c); }
    const g = gato(); g.position.set(0.1, 0, -0.2); scene.add(g);
    return {
      scene, rig: { target: V(0.1, 0.75, 0.2), dist: 3.8, pitch: 0.3, fov: 36 },
      update(t) { poseGato(g, t, { piscar: 0.85, cabeca: 0.35 + Math.abs(Math.sin(t * 6)) * 0.08, mia: Math.max(0, Math.sin(t * 6)) * 0.5, cauda: 1.5 }); }
    };
  },

  // gancho da parte 3: amassando a almofada como pão
  amassa(ctx) {
    const { scene } = studio(ctx, { top: '#e8590c', bottom: '#2b1600', floorColor: 0x6b4226, rimColor: 0xfff3bf, keyI: 1.8, envI: 0.3 });
    const almofada = blob(0.7, clay(0xf3d9fa, { sheen: 0.6 }), { seed: 4, noise: 0.06, stretch: V(1.3, 0.35, 1) }); almofada.position.set(0, 0.2, 0.45); scene.add(almofada);
    const pao = blob(0.32, clay(0xd9a066, { sheen: 0.6 }), { seed: 7, noise: 0.05, stretch: V(1.5, 0.75, 0.9) }); pao.position.set(1.0, 0.25, 0.6); scene.add(pao);
    const g = gato(); g.position.set(0, 0.05, -0.15); scene.add(g);
    return {
      scene, rig: { target: V(0.2, 0.75, 0.2), dist: 4.9, pitch: 0.18, fov: 36 }, bloom: [0.2, 0.4, 0.9],
      update(t) {
        const pt = g.userData.patas;
        pt[0].position.set(-0.17, 0.25 + Math.max(0, Math.sin(t * 6)) * 0.14, 0.42); pt[1].position.set(0.17, 0.25 + Math.max(0, -Math.sin(t * 6)) * 0.14, 0.42);
        almofada.scale.y = 0.35 * (1 - 0.05 * Math.abs(Math.sin(t * 6)));
        poseGato(g, t, { piscar: 0.8, inclina: 0.1, cauda: 1, respira: 3 });
      }
    };
  },
};

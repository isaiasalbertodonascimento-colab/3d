// Cenas: "Você acha que conhece o seu gato?"
import * as THREE from 'three';
import { studio, blob, tube, clay, wet, glow, cut, particles, smooth, lerp, clamp, ease, V } from './lib.js';

const LARANJA = 0xf08c2e, CREME = 0xffe8cc, ROSA = 0xff8fab;

// ---------- gato de massinha ----------
// sentado, ~1,3 de altura; cabeça em y≈1.05. Partes em g.userData.
function gato(o = {}) {
  const pelo = clay(o.cor ?? LARANJA, { sheen: 0.9 }), barriga = clay(CREME, { sheen: 0.9 });
  const g = new THREE.Group();
  const corpo = blob(0.45, pelo, { seed: 2, noise: 0.03, stretch: V(0.95, 1.15, 0.9) }); corpo.position.y = 0.48; g.add(corpo);
  const peito = blob(0.3, barriga, { seed: 3, noise: 0.03, stretch: V(0.9, 1.2, 0.6) }); peito.position.set(0, 0.52, 0.24); g.add(peito);
  for (const s of [-1, 1]) {
    const pata = blob(0.11, pelo, { seed: 5 + s, noise: 0.03, stretch: V(1, 2.2, 1) }); pata.position.set(s * 0.17, 0.2, 0.3); g.add(pata);
    const pe = blob(0.1, barriga, { seed: 7, noise: 0.02, stretch: V(1, 0.6, 1.3) }); pe.position.set(s * 0.17, 0.05, 0.38); g.add(pe);
    const coxa = blob(0.22, pelo, { seed: 9, noise: 0.03, stretch: V(0.8, 1, 1.2) }); coxa.position.set(s * 0.3, 0.22, 0.02); g.add(coxa);
  }
  const head = new THREE.Group(); head.position.set(0, 1.05, 0.08); g.add(head);
  const cranio = blob(0.38, pelo, { seed: 11, noise: 0.02, stretch: V(1.12, 0.95, 1) }); head.add(cranio);
  const focinho = blob(0.16, barriga, { seed: 12, noise: 0.03, stretch: V(1.5, 0.8, 0.8) }); focinho.position.set(0, -0.12, 0.3); head.add(focinho);
  const nariz = blob(0.045, clay(ROSA, { coat: 0.8 }), { seed: 1, noise: 0.05, stretch: V(1.3, 0.8, 0.8) }); nariz.position.set(0, -0.06, 0.42); head.add(nariz);
  const boca = blob(0.06, clay(0x5a1622, { coat: 1 }), { seed: 4, noise: 0.03 }); boca.position.set(0, -0.2, 0.38); boca.scale.set(1, 0.1, 0.5); head.add(boca);
  const orelhas = [];
  for (const s of [-1, 1]) {
    const or = new THREE.Group(); or.position.set(s * 0.22, 0.28, -0.02); or.rotation.z = -s * 0.35; head.add(or);
    const ext = new THREE.Mesh(new THREE.ConeGeometry(0.13, 0.28, 24), pelo); ext.castShadow = true; or.add(ext);
    const int = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.18, 20), clay(ROSA)); int.position.set(0, -0.02, 0.05); or.add(int);
    orelhas.push(or);
    for (const k of [-1, 0, 1]) { // bigodes
      const b = new THREE.Mesh(new THREE.CylinderGeometry(0.006, 0.004, 0.42, 6), clay(0xffffff)); b.rotation.z = Math.PI / 2 + k * 0.15 * s; b.position.set(s * 0.32, -0.1 + k * 0.035, 0.3); head.add(b);
    }
  }
  const olhos = [], pupilas = [], palpebras = [];
  const iris = o.irisGlow ? glow(0xb2f2bb, 1.1) : clay(0xb5e06b, { coat: 1, rough: 0.1 });
  for (const s of [-1, 1]) {
    const ol = blob(0.1, iris, { seed: 2, noise: 0.0, seg: 24 }); ol.position.set(s * 0.15, 0.04, 0.3); ol.scale.set(1, 1.1, 0.6); head.add(ol); olhos.push(ol);
    const pu = new THREE.Mesh(new THREE.SphereGeometry(0.06, 16, 12), clay(0x111111, { coat: 1, rough: 0.05 })); pu.position.set(s * 0.15, 0.04, 0.355); pu.scale.set(0.35, 1.3, 0.4); head.add(pu); pupilas.push(pu);
    const hl = new THREE.Mesh(new THREE.SphereGeometry(0.015, 8, 6), glow(0xffffff, 1)); hl.position.set(s * 0.15 + 0.03, 0.08, 0.385); head.add(hl);
    const pa = blob(0.105, pelo, { seed: 3, noise: 0, seg: 24 }); pa.position.copy(ol.position).add(V(0, 0.0, 0.01)); pa.scale.set(1.05, 0.02, 0.66); head.add(pa); palpebras.push(pa);
  }
  // cauda: corrente de esferas recalculada a cada quadro
  const cauda = [];
  for (let i = 0; i < 12; i++) { const c = new THREE.Mesh(new THREE.SphereGeometry(0.075 - i * 0.002, 14, 10), i > 9 ? clay(CREME) : pelo); c.castShadow = true; g.add(c); cauda.push(c); }
  g.userData = { head, boca, olhos, pupilas, palpebras, orelhas, cauda, corpo };
  return g;
}
// o: { piscar(0..1 fechado), mia(0..1), olhar:[x,y], inclina, cauda(vel), respira }
function poseGato(g, t, o = {}) {
  const u = g.userData;
  const fecha = o.piscar ?? (Math.sin(t * 2.3) > 0.985 ? 1 : 0);
  u.palpebras.forEach(p => { p.scale.y = 0.02 + clamp(fecha) * 1.08; });
  u.boca.scale.y = 0.1 + (o.mia ?? 0) * 0.9;
  const [lx, ly] = o.olhar ?? [0, 0];
  u.pupilas.forEach((p, i) => { p.position.x = (i ? 1 : -1) * 0.15 + lx * 0.03; p.position.y = 0.04 + ly * 0.03; p.scale.x = o.pupilaLarga ? 0.9 : 0.35; });
  u.head.rotation.z = (o.inclina ?? 0) + Math.sin(t * 1.1) * 0.03;
  u.head.rotation.x = (o.cabeca ?? 0) + (o.mia ?? 0) * -0.15;
  u.head.rotation.y = o.vira ?? 0;
  u.orelhas.forEach((or, i) => { or.rotation.x = Math.sin(t * 3 + i) * 0.04 + (o.orelhaTras ?? 0) * -0.5; });
  u.corpo.scale.y = 1.15 * (1 + Math.sin(t * (o.respira ?? 2)) * 0.015);
  const vel = o.cauda ?? 1.5;
  u.cauda.forEach((c, i) => {
    const k = i / 11, onda = Math.sin(t * vel - k * 2.5) * 0.35 * k;
    c.position.set(0.15 + Math.sin(onda + k * 1.4) * 0.45 * k + k * 0.25, 0.08 + k * 0.5 + Math.sin(k * 3) * 0.05, -0.35 - k * 0.15 + Math.cos(k * 2) * 0.05);
  });
}

// coração de massinha
function coracao(cor = 0xff4d6d) {
  const g = new THREE.Group(), m = clay(cor, { coat: 0.8, emissive: 0x400010 });
  const a = new THREE.Mesh(new THREE.SphereGeometry(0.1, 20, 16), m); a.position.set(-0.07, 0.03, 0); g.add(a);
  const b = a.clone(); b.position.x = 0.07; g.add(b);
  const c = new THREE.Mesh(new THREE.ConeGeometry(0.15, 0.2, 24), m); c.rotation.z = Math.PI; c.position.y = -0.1; g.add(c);
  return g;
}
// ondas de vibração (anéis que se expandem)
function ondas(scene, pos, cor, n = 4, normal = V(0, 0, 1)) {
  const an = [];
  for (let i = 0; i < n; i++) { const m = new THREE.Mesh(new THREE.TorusGeometry(0.3, 0.018, 8, 48), glow(cor, 0.8, { opacity: 1 })); m.position.copy(pos); m.lookAt(pos.clone().add(normal)); scene.add(m); an.push(m); }
  return t => an.forEach((m, i) => { const c = (t * 0.9 + i / n) % 1; m.scale.setScalar(0.5 + c * 2.4); m.material.opacity = 1 - c; });
}

export default {
  gato(ctx) {
    const a = ctx.args, acao = a.acao || 'sentado';
    const bg = { sentado: ['#7048e8', '#160b38'], encara: ['#7048e8', '#160b38'], escuro: ['#1b2440', '#05070f'], mia: ['#f76707', '#2b0f02'],
      malandro: ['#e64980', '#2b0614'], pisca: ['#1098ad', '#04232b'], aproxima: ['#f06595', '#2b0614'] }[acao] || ['#7048e8', '#160b38'];
    const { scene } = studio(ctx, { top: bg[0], bottom: bg[1], floorColor: 0x2f2a4a, rimColor: 0xffd8a8, keyI: acao === 'escuro' ? 0.6 : 2.4, hemi: acao === 'escuro' ? 0.15 : 0.6 });
    const g = gato({ irisGlow: acao === 'escuro' }); scene.add(g);
    let extra = () => {};
    if (a.coracao) {
      const cs = [0, 1, 2].map(i => { const c = coracao(); c.position.set(-0.35 + i * 0.35, 1.7, 0.2); scene.add(c); return c; });
      extra = t => cs.forEach((c, i) => { const p = (t * 0.6 + i * 0.33) % 1; c.position.y = 1.55 + p * 0.6; c.scale.setScalar(Math.sin(p * Math.PI) * 1.1); c.rotation.y = t; });
    }
    const close = !!a.close || acao === 'encara';
    // planos com título (gancho e fim): gato mais baixo na tela
    const titulo = ctx.shot.start < 3.2 || ctx.shot.beat === 7;
    const rig = close ? { target: V(0, 1.0, 0), dist: 2.7, pitch: 0.02, fov: 32 }
      : { target: V(0, titulo ? 1.45 : 0.85, 0), dist: 3.6, pitch: 0.12, fov: 34 };
    return {
      scene, rig, bloom: acao === 'escuro' ? [0.45, 0.4, 0.75] : [0.3, 0.5, 0.85], exposure: acao === 'escuro' ? 0.8 : 1,
      update(t, d, k) {
        extra(t);
        const o = { olhar: [0, 0.1] };
        if (acao === 'encara') { o.olhar = [0, 0]; o.pupilaLarga = true; o.piscar = 0; }
        if (acao === 'escuro') { o.pupilaLarga = true; o.piscar = 0; o.vira = Math.sin(t * 0.8) * 0.3; }
        if (acao === 'mia') { o.mia = Math.max(0, Math.sin(t * 2.6)) ** 0.6; o.cabeca = -0.1; }
        if (acao === 'malandro') { o.piscar = 0.55; o.inclina = 0.22; o.olhar = [0.7, 0]; o.cauda = 3; }
        if (acao === 'pisca') { const c = (t % 2.4) / 2.4; o.piscar = smooth(0.3, 0.55, c) * (1 - smooth(0.6, 0.85, c)); o.inclina = 0.08; }
        if (acao === 'aproxima') { g.position.z = lerp(-0.8, 0.4, ease(clamp(k * 1.3))); o.piscar = 0.35; o.inclina = 0.1; o.cauda = 2.5; g.position.y = Math.abs(Math.sin(t * 7)) * 0.02 * (k < 0.75 ? 1 : 0); }
        poseGato(g, t, o);
      }
    };
  },

  // sala escura; com brilho, os olhos acendem
  noite(ctx) {
    const brilho = !!ctx.args.brilho;
    const { scene } = studio(ctx, { top: '#141c33', bottom: '#030409', floorColor: 0x1a1f33, keyColor: 0x8fa8ff, keyI: 0.5, hemi: 0.12, rimColor: 0x4dabf7, rimI: 1.4, fillI: 0, envI: 0.08 });
    const janela = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 1.9), glow(0x3b5bdb, 0.5)); janela.position.set(-1.6, 1.8, -3); scene.add(janela);
    const lua = new THREE.Mesh(new THREE.CircleGeometry(0.28, 32), glow(0xe7f5ff, 1.3)); lua.position.set(-1.4, 2.3, -2.98); scene.add(lua);
    const sofa = blob(1.2, clay(0x343a63), { seed: 2, noise: 0.05, stretch: V(2, 0.55, 0.8) }); sofa.position.set(1.5, 0.5, -1.8); scene.add(sofa);
    const g = gato({ cor: 0x5c4a3a, irisGlow: true }); g.position.set(0, 0, 0); scene.add(g);
    const luz = new THREE.PointLight(0xb2f2bb, 0, 1.2, 2); luz.position.set(0, 1.1, 0.9); scene.add(luz);
    const poeira = particles(80, [-3, 0, -3, 6, 3, 4], { size: 0.03, color: 0x91a7ff, opacity: 0.4, rise: 0.02 }); scene.add(poeira.points);
    return {
      scene, rig: brilho ? { target: V(0, 1.0, 0), dist: 2.8, pitch: 0, fov: 32 } : { target: V(0, 0.9, 0), dist: 4.2, pitch: 0.1, fov: 36 },
      bloom: brilho ? [0.5, 0.3, 0.8] : [0.35, 0.3, 0.8], exposure: 0.85,
      update(t, d, k) {
        poeira.update(t);
        const acende = brilho ? smooth(0.05, 0.3, t) * 0.6 : 0.15;
        g.userData.olhos.forEach(o => o.material.color.setRGB(0.7 * (0.4 + acende * 2), 0.95 * (0.4 + acende * 2), 0.73 * (0.4 + acende * 2)));
        luz.intensity = acende * 0.5;
        poseGato(g, t, { pupilaLarga: true, piscar: 0, olhar: [0, 0], vira: brilho ? 0 : Math.sin(t * 0.7) * 0.35 });
      }
    };
  },

  // olho em corte: a luz entra, bate na camada refletora (tapetum) e volta
  olho(ctx) {
    const reflexo = !!ctx.args.reflexo;
    const { scene } = studio(ctx, { top: '#0b7285', bottom: '#021a1f', floor: false, rimColor: 0xc3fae8, keyI: 1.8, envI: 0.3 });
    const plano = cut(V(0, 0, -1), 0);
    const bulbo = new THREE.Mesh(new THREE.SphereGeometry(1, 48, 36), wet(0xdcd3e0, { clip: [plano], side: THREE.DoubleSide })); scene.add(bulbo);
    const dentro = new THREE.Mesh(new THREE.SphereGeometry(0.93, 48, 36), wet(0x862e9c, { clip: [plano], side: THREE.BackSide })); scene.add(dentro);
    // tapetum: calota brilhante no fundo do olho
    const tap = new THREE.Mesh(new THREE.SphereGeometry(0.9, 48, 24, Math.PI * 0.6, Math.PI * 0.8, Math.PI * 0.25, Math.PI * 0.5), glow(0x69db7c, 0.55, { clip: [plano], side: THREE.DoubleSide }));
    tap.rotation.y = Math.PI / 2; scene.add(tap);
    const cristal = blob(0.32, wet(0xe3fafc, { opacity: 0.7, coat: 1, rough: 0.02 }), { seed: 1, noise: 0, stretch: V(0.55, 1, 1) }); cristal.position.x = 0.72; scene.add(cristal);
    const iris = new THREE.Mesh(new THREE.TorusGeometry(0.42, 0.08, 12, 48), clay(0xb5e06b)); iris.rotation.y = Math.PI / 2; iris.position.x = 0.86; scene.add(iris);
    // raios de luz
    const raio = (cor) => { const m = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 1, 12), glow(cor, 1.3)); m.rotation.z = Math.PI / 2; scene.add(m); return m; };
    const entra = raio(0xfff3bf), volta = raio(0x8ce99a);
    const fotons = particles(60, [-0.9, -0.15, -0.1, 3.2, 0.3, 0.2], { color: 0xfff3bf, size: 0.06, rise: 0 }); scene.add(fotons.points);
    return {
      scene, rig: { target: V(0.4, 0, 0), dist: 4.6, pitch: 0.15, yaw: 0.35, fov: 40 }, bloom: [0.3, 0.4, 0.85],
      update(t, d, k) {
        const a = clamp(t / 1.0), x1 = 2.6, x0 = lerp(x1, -0.85, a);
        entra.position.set((x0 + x1) / 2, 0.1, 0); entra.scale.y = Math.max(0.001, x1 - x0);
        const b = reflexo ? clamp((t - 1.0) / 1.0) : 0, xb = lerp(-0.85, 2.6, b);
        volta.visible = b > 0; volta.position.set((-0.85 + xb) / 2, -0.12, 0); volta.scale.y = Math.max(0.001, xb + 0.85);
        tap.material.color.setRGB(0.41 * (0.55 + b * 0.6), 0.86 * (0.55 + b * 0.6), 0.49 * (0.55 + b * 0.6));
        fotons.update(t);
      }
    };
  },

  // dois gatos se olhando em silêncio
  dois(ctx) {
    const { scene } = studio(ctx, { top: '#5f3dc4', bottom: '#140b38', floorColor: 0x2f2a4a, rimColor: 0xffe066 });
    const a = gato(); a.position.set(-0.75, 0, 0); a.rotation.y = 0.9; scene.add(a);
    const b = gato({ cor: 0x868e96 }); b.position.set(0.75, 0, 0); b.rotation.y = -0.9; scene.add(b);
    const pontos = [0, 1, 2].map(i => { const m = new THREE.Mesh(new THREE.SphereGeometry(0.06, 12, 10), clay(0xffffff)); m.position.set(-0.15 + i * 0.15, 1.75, 0); scene.add(m); return m; });
    return {
      scene, rig: { target: V(0, 0.9, 0), dist: 4.4, pitch: 0.12, fov: 36 },
      update(t) {
        poseGato(a, t, { olhar: [0.3, 0] }); poseGato(b, t + 1, { olhar: [-0.3, 0] });
        pontos.forEach((p, i) => { p.position.y = 1.75 + Math.max(0, Math.sin(t * 4 - i)) * 0.08; });
      }
    };
  },

  // gato deitado ronronando: ondas saindo do peito
  ronrona(ctx) {
    const close = !!ctx.args.close;
    const { scene } = studio(ctx, { top: '#f59f00', bottom: '#2b1a02', floorColor: 0x5c3d1e, rimColor: 0xfff3bf });
    const almofada = blob(1.1, clay(0xd6336c, { sheen: 1 }), { seed: 3, noise: 0.04, stretch: V(1.4, 0.3, 1.1) }); almofada.position.y = 0.15; scene.add(almofada);
    const g = gato(); g.scale.set(1, 0.8, 1); g.position.y = 0.2; scene.add(g);
    const onda = ondas(scene, V(0, 0.75, 0.45), 0xffd43b, 4);
    return {
      scene, rig: close ? { target: V(0, 0.85, 0.2), dist: 2.6, pitch: 0.1, fov: 32 } : { target: V(0, 0.75, 0), dist: 3.6, pitch: 0.2, fov: 36 }, bloom: [0.3, 0.4, 0.85],
      update(t) {
        onda(t);
        poseGato(g, t, { piscar: 0.85, inclina: 0.1, cauda: 0.8, respira: 4 });
        g.position.x = Math.sin(t * 60) * 0.004; // vibração
      }
    };
  },

  // osso vibrando com brilho de "reparo"
  osso(ctx) {
    const close = !!ctx.args.close;
    const { scene } = studio(ctx, { top: '#2b8a3e', bottom: '#051a08', floor: false, rimColor: 0xd3f9d8, keyI: 1.9, envI: 0.3 });
    const osso = new THREE.Group(); osso.rotation.z = Math.PI / 2; const giro = new THREE.Group(); giro.add(osso); scene.add(giro); // em pé: cabe no quadro vertical
    const m = clay(0xe9d8c4, { sheen: 0.4 });
    const haste = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 2.2, 32), m); haste.rotation.z = Math.PI / 2; haste.castShadow = true; osso.add(haste);
    for (const s of [-1, 1]) for (const z of [-1, 1]) { const b = new THREE.Mesh(new THREE.SphereGeometry(0.28, 24, 18), m); b.position.set(s * 1.15, z * 0.17, 0); osso.add(b); }
    const fissura = new THREE.Mesh(new THREE.TorusGeometry(0.19, 0.03, 8, 32), glow(0x8ce99a, 0.9)); fissura.rotation.y = Math.PI / 2; osso.add(fissura);
    const onda = ondas(scene, V(0, 0, 0), 0x8ce99a, 4, V(0, 1, 0));
    const brilhos = particles(90, [-1.5, -0.6, -0.6, 3, 1.2, 1.2], { color: 0xb2f2bb, size: 0.05, rise: 0.15 }); scene.add(brilhos.points);
    return {
      scene, rig: close ? { target: V(0, 0, 0), dist: 2.6, pitch: 0.25, fov: 34 } : { target: V(0, 0, 0), dist: 3.8, pitch: 0.3, fov: 38 }, bloom: [0.3, 0.4, 0.85],
      update(t) { onda(t); brilhos.update(t); giro.position.x = Math.sin(t * 70) * 0.006; giro.rotation.y = t * 0.5; fissura.scale.setScalar(1 + 0.08 * Math.sin(t * 6)); }
    };
  },

  // cupcake ignorado pelo gato (args.some = vira fumaça)
  doce(ctx) {
    const some = !!ctx.args.some;
    const { scene } = studio(ctx, { top: '#f783ac', bottom: '#2b0614', floorColor: 0x5c2a3d, rimColor: 0xfff0f6 });
    const bolo = new THREE.Group(); bolo.position.set(0.6, 0, 0.3); scene.add(bolo);
    const forma = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.22, 0.32, 20), clay(0x4dabf7)); forma.position.y = 0.16; forma.castShadow = true; bolo.add(forma);
    const cob = blob(0.32, clay(0xfff0f6, { sheen: 1 }), { seed: 4, noise: 0.15, freq: 7, stretch: V(1, 0.75, 1) }); cob.position.y = 0.46; bolo.add(cob);
    const cereja = new THREE.Mesh(new THREE.SphereGeometry(0.08, 20, 16), wet(0xe03131)); cereja.position.y = 0.72; bolo.add(cereja);
    const confeitos = particles(30, [-0.25, 0.4, -0.25, 0.5, 0.3, 0.5], { color: 0xffe066, size: 0.05, rise: 0 }); bolo.add(confeitos.points);
    const fumaca = particles(120, [-0.4, 0, -0.4, 0.8, 1.2, 0.8], { color: 0xffffff, size: 0.18, rise: 0.6, opacity: 0.5 }); fumaca.points.visible = false; bolo.add(fumaca.points);
    const g = gato(); g.position.set(-0.45, 0, 0); g.rotation.y = 0.35; scene.add(g);
    return {
      scene, rig: { target: V(0.05, 0.75, 0), dist: 3.2, pitch: 0.12, fov: 34 },
      update(t, d, k) {
        poseGato(g, t, { vira: -0.6, olhar: [-0.8, 0.2], piscar: 0.4, inclina: -0.1, cauda: 1 });
        if (some) { const s = 1 - smooth(0.15, 0.45, k); forma.scale.setScalar(Math.max(0.001, s)); cob.scale.setScalar(Math.max(0.001, s)); cereja.scale.setScalar(Math.max(0.001, s)); fumaca.points.visible = k > 0.12 && k < 0.85; fumaca.update(t); }
      }
    };
  },

  // língua com receptores; o encaixe do doce está vazio
  lingua(ctx) {
    const { scene } = studio(ctx, { top: '#c2255c', bottom: '#2b0612', floor: false, rimColor: 0xffe3e3, keyI: 2, envI: 0.3 });
    const lingua = blob(1.3, wet(0xff8fa3), { seed: 6, noise: 0.03, stretch: V(0.75, 0.18, 1.3) }); lingua.position.y = -0.2; scene.add(lingua);
    const pap = particles(260, [-0.9, 0.0, -1.5, 1.8, 0.04, 3], { color: 0xffc9d4, size: 0.04, rise: 0, opacity: 0.8 }); scene.add(pap.points);
    const cores = [0x4dabf7, 0x69db7c, 0xffa94d, null, 0xb197fc];
    const enc = cores.map((c, i) => {
      const grp = new THREE.Group(); grp.position.set(-0.8 + i * 0.4, 0.06, 0.2); scene.add(grp);
      const base = new THREE.Mesh(new THREE.TorusGeometry(0.11, 0.035, 10, 28), wet(0xc2255c)); base.rotation.x = Math.PI / 2; grp.add(base);
      if (c) { const r = blob(0.08, clay(c, { emissive: c, emissiveIntensity: 0.25 }), { seed: i, noise: 0.15, freq: 6, seg: 20 }); r.position.y = 0.06; grp.add(r); }
      else { const vazio = new THREE.Mesh(new THREE.CircleGeometry(0.1, 24), new THREE.MeshBasicMaterial({ color: 0x2b0610 })); vazio.rotation.x = -Math.PI / 2; vazio.position.y = 0.01; grp.add(vazio); }
      return grp;
    });
    const anel = new THREE.Mesh(new THREE.TorusGeometry(0.17, 0.02, 8, 40), glow(0xffe066, 2, { opacity: 1 })); anel.rotation.x = Math.PI / 2; anel.position.copy(enc[3].position).add(V(0, 0.05, 0)); scene.add(anel);
    return {
      scene, rig: { target: V(0, 0.05, 0.2), dist: 2.4, pitch: 0.7, fov: 38 }, bloom: [0.5, 0.5, 0.7],
      update(t) { anel.material.opacity = 0.4 + 0.6 * Math.abs(Math.sin(t * 4)); anel.scale.setScalar(1 + 0.1 * Math.sin(t * 4)); enc.forEach((e, i) => { e.position.y = 0.06 + Math.sin(t * 2 + i) * 0.01; }); }
    };
  },

  // gato enrolado dormindo; espia = abre um olho e encara
  dorme(ctx) {
    const espia = !!ctx.args.espia;
    const { scene } = studio(ctx, { top: '#364fc7', bottom: '#0b1238', floorColor: 0x2b3566, rimColor: 0xd0bfff, keyI: 1.8 });
    const cama = new THREE.Mesh(new THREE.TorusGeometry(0.75, 0.25, 20, 48), clay(0x9775fa, { sheen: 1 })); cama.rotation.x = Math.PI / 2; cama.position.y = 0.2; scene.add(cama);
    const fundo = new THREE.Mesh(new THREE.CylinderGeometry(0.75, 0.75, 0.1, 40), clay(0xb197fc)); fundo.position.y = 0.06; scene.add(fundo);
    const g = gato(); g.scale.set(0.95, 0.62, 0.95); g.position.set(0, 0.12, 0); g.rotation.y = -0.4; scene.add(g);
    const zs = [0, 1, 2].map(i => { const z = new THREE.Mesh(new THREE.TorusGeometry(0.06 + i * 0.025, 0.018, 8, 4), clay(0xffffff)); scene.add(z); return z; });
    return {
      scene, rig: espia ? { target: V(0, 0.75, 0.1), dist: 2.5, pitch: 0.05, yaw: -0.2, fov: 30 } : { target: V(0, 0.55, 0), dist: 3.3, pitch: 0.35, fov: 36 },
      update(t, d, k) {
        zs.forEach((z, i) => { const c = (t * 0.4 + i / 3) % 1; z.position.set(0.3 + c * 0.4, 1.0 + c * 0.8, 0); z.material.opacity = 1; z.scale.setScalar(Math.sin(c * Math.PI)); z.visible = !espia || k < 0.15; z.rotation.z = Math.PI / 4; });
        const u = g.userData;
        if (espia) {
          const abre = smooth(0.12, 0.3, k);
          u.palpebras[0].scale.y = 1.1; u.palpebras[1].scale.y = 0.02 + (1 - abre) * 1.08;
          poseGato(g, t, { piscar: 1, respira: 1.2, cauda: 0.4, olhar: [0, 0] });
          u.palpebras[1].scale.y = 0.02 + (1 - abre) * 1.08; u.head.rotation.y = 0.3 * abre;
        } else poseGato(g, t, { piscar: 1, respira: 1.2, cauda: 0.4, cabeca: 0.25 });
      }
    };
  },
};

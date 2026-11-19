// Gato de massinha reaproveitado do projeto "gato"
import * as THREE from 'three';
import { studio, blob, tube, clay, wet, glow, cut, particles, smooth, lerp, clamp, ease, V } from './lib.js';

const LARANJA = 0xf08c2e, CREME = 0xffe8cc, ROSA = 0xff8fab;

// ---------- gato de massinha ----------
// sentado, ~1,3 de altura; cabeça em y≈1.05. Partes em g.userData.
export function gato(o = {}) {
  const pelo = clay(o.cor ?? LARANJA, { sheen: 0.9 }), barriga = clay(CREME, { sheen: 0.9 });
  const g = new THREE.Group(); const patas = [];
  const corpo = blob(0.45, pelo, { seed: 2, noise: 0.03, stretch: V(0.95, 1.15, 0.9) }); corpo.position.y = 0.48; g.add(corpo);
  const peito = blob(0.3, barriga, { seed: 3, noise: 0.03, stretch: V(0.9, 1.2, 0.6) }); peito.position.set(0, 0.52, 0.24); g.add(peito);
  for (const s of [-1, 1]) {
    const pata = blob(0.11, pelo, { seed: 5 + s, noise: 0.03, stretch: V(1, 2.2, 1) }); pata.position.set(s * 0.17, 0.2, 0.3); g.add(pata); patas.push(pata);
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
  g.userData = { patas, head, boca, olhos, pupilas, palpebras, orelhas, cauda, corpo };
  return g;
}
// o: { piscar(0..1 fechado), mia(0..1), olhar:[x,y], inclina, cauda(vel), respira }
export function poseGato(g, t, o = {}) {
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
export function coracao(cor = 0xff4d6d) {
  const g = new THREE.Group(), m = clay(cor, { coat: 0.8, emissive: 0x400010 });
  const a = new THREE.Mesh(new THREE.SphereGeometry(0.1, 20, 16), m); a.position.set(-0.07, 0.03, 0); g.add(a);
  const b = a.clone(); b.position.x = 0.07; g.add(b);
  const c = new THREE.Mesh(new THREE.ConeGeometry(0.15, 0.2, 24), m); c.rotation.z = Math.PI; c.position.y = -0.1; g.add(c);
  return g;
}
// ondas de vibração (anéis que se expandem)
export function ondas(scene, pos, cor, n = 4, normal = V(0, 0, 1)) {
  const an = [];
  for (let i = 0; i < n; i++) { const m = new THREE.Mesh(new THREE.TorusGeometry(0.3, 0.018, 8, 48), glow(cor, 0.8, { opacity: 1 })); m.position.copy(pos); m.lookAt(pos.clone().add(normal)); scene.add(m); an.push(m); }
  return t => an.forEach((m, i) => { const c = (t * 0.9 + i / n) % 1; m.scale.setScalar(0.5 + c * 2.4); m.material.opacity = 1 - c; });
}


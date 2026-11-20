// Cenários ricos sem contorno + efeitos mágicos (anéis roxos, distorção) + malha de espaço-tempo
import * as THREE from 'three';
import { studio, blob, glow, particles, smooth, lerp, clamp, V } from './lib.js';

// ---------- texturas pintadas ----------
let _seed = 11; const rnd = () => (_seed = (_seed * 16807) % 2147483647) / 2147483647;
function tela(w, h, f) { const c = document.createElement('canvas'); c.width = w; c.height = h; f(c.getContext('2d'), w, h); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.anisotropy = 4; return t; }
const ruido = (g, w, h, n = 3000, a = 0.06) => { for (let i = 0; i < n; i++) { g.fillStyle = `rgba(${rnd() < .5 ? '0,0,0' : '255,255,255'},${rnd() * a})`; g.fillRect(rnd() * w, rnd() * h, 2 + rnd() * 5, 2 + rnd() * 5); } };
const cache = {};
export const tex = {
  pedra: () => cache.pedra ??= tela(512, 512, (g, w, h) => { g.fillStyle = '#5d5650'; g.fillRect(0, 0, w, h); for (let y = 0; y < h; y += 46) for (let x = (y / 46 % 2) * 40 - 40; x < w; x += 80) { const c = 95 + rnd() * 40; g.fillStyle = `rgb(${c},${c - 6},${c - 12})`; g.beginPath(); g.roundRect(x + 3, y + 3, 74 + rnd() * 6, 40, 10); g.fill(); } ruido(g, w, h, 4000, 0.08); }),
  reboco: () => cache.reboco ??= tela(256, 256, (g, w, h) => { g.fillStyle = '#ecdcbf'; g.fillRect(0, 0, w, h); ruido(g, w, h, 2500, 0.05); for (let i = 0; i < 6; i++) { g.fillStyle = `rgba(140,110,70,${0.05 + rnd() * 0.06})`; g.beginPath(); g.ellipse(rnd() * w, rnd() * h, 20 + rnd() * 40, 10 + rnd() * 30, rnd() * 3, 0, 7); g.fill(); } }),
  madeira: () => cache.madeira ??= tela(256, 256, (g, w, h) => { g.fillStyle = '#8a5a32'; g.fillRect(0, 0, w, h); for (let x = 0; x < w; x += 32) { g.fillStyle = `rgba(0,0,0,${0.08 + rnd() * 0.1})`; g.fillRect(x, 0, 2, h); } for (let i = 0; i < 60; i++) { g.strokeStyle = `rgba(60,30,10,${rnd() * 0.25})`; g.beginPath(); const x = rnd() * w; g.moveTo(x, 0); g.bezierCurveTo(x + 6, h / 3, x - 6, h * 2 / 3, x + 3, h); g.stroke(); } }),
  telha: () => cache.telha ??= tela(256, 256, (g, w, h) => { g.fillStyle = '#a8432e'; g.fillRect(0, 0, w, h); for (let y = 0; y < h; y += 22) for (let x = (y / 22 % 2) * 16; x < w; x += 32) { g.fillStyle = `rgba(${rnd() < .5 ? '60,15,5' : '220,120,90'},${0.12 + rnd() * 0.15})`; g.beginPath(); g.ellipse(x, y + 14, 15, 10, 0, 0, Math.PI); g.fill(); } }),
  calcada: () => cache.calcada ??= tela(512, 512, (g, w, h) => { g.fillStyle = '#6f675e'; g.fillRect(0, 0, w, h); for (let i = 0; i < 520; i++) { const c = 110 + rnd() * 50; g.fillStyle = `rgb(${c},${c - 8},${c - 16})`; g.beginPath(); g.ellipse(rnd() * w, rnd() * h, 10 + rnd() * 9, 8 + rnd() * 7, rnd() * 3, 0, 7); g.fill(); } }),
  grama: () => cache.grama ??= tela(256, 256, (g, w, h) => { g.fillStyle = '#5f7d3b'; g.fillRect(0, 0, w, h); for (let i = 0; i < 2500; i++) { g.fillStyle = `rgba(${rnd() < .5 ? '40,70,20' : '150,170,80'},${rnd() * 0.3})`; g.fillRect(rnd() * w, rnd() * h, 2, 5); } }),
  terra: () => cache.terra ??= tela(256, 256, (g, w, h) => { g.fillStyle = '#9b7653'; g.fillRect(0, 0, w, h); ruido(g, w, h, 3000, 0.1); }),
};
export const lam = (cor, o = {}) => new THREE.MeshLambertMaterial({ color: cor, map: o.map ?? null, side: o.side ?? THREE.FrontSide, emissive: o.emissive ?? 0x000000 });
const caixa = (w, h, d, mat) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat); m.castShadow = m.receiveShadow = true; return m; };
function repetir(t, x, y) { const c = t.clone(); c.repeat.set(x, y); c.needsUpdate = true; return c; }

// ---------- céu e luz ----------
export function base(ctx, o = {}) {
  const r = studio(ctx, { top: o.top ?? '#f2a65a', bottom: o.bottom ?? '#f8dcb0', floor: false, keyColor: o.keyColor ?? 0xffc98a, keyI: o.keyI ?? 2.0, keyPos: o.keyPos ?? [-6, 5, 3], hemi: o.hemi ?? 0.55, sky: o.sky ?? 0xffe0b8, ground: 0x4a3a2a, rimColor: o.rim ?? 0xffb070, rimI: 1.2, fillI: 0, envI: 0.15, fog: o.fog, fogNear: o.fogNear ?? 10, fogFar: o.fogFar ?? 40, shadowSize: 8 });
  r.key.shadow.camera.far = 60; r.key.shadow.mapSize.set(1536, 1536);
  return r;
}
export function sol(scene, pos, cor = 0xffb36b, r = 1.2) { const s = new THREE.Mesh(new THREE.CircleGeometry(r, 40), glow(cor, 1.3)); s.position.copy(pos); scene.add(s); const h = new THREE.Mesh(new THREE.CircleGeometry(r * 2.6, 40), glow(cor, 0.5, { opacity: 0.25 })); h.position.copy(pos).add(V(0, 0, -0.1)); scene.add(h); return s; }
// raios de luz (god rays) + poeira brilhando
export function raios(scene, de, para, o = {}) {
  const g = new THREE.Group(); scene.add(g);
  const dir = para.clone().sub(de), len = dir.length();
  for (let i = 0; i < (o.n ?? 4); i++) {
    const r = new THREE.Mesh(new THREE.CylinderGeometry(o.r0 ?? 0.15, o.r1 ?? 0.9, len, 16, 1, true), glow(o.cor ?? 0xffd59a, 0.6, { opacity: o.op ?? 0.07, side: THREE.DoubleSide }));
    r.material.depthWrite = false; r.position.copy(de).add(dir.clone().multiplyScalar(0.5)).add(V((i - (o.n ?? 4) / 2) * (o.esp ?? 0.35), 0, 0));
    r.quaternion.setFromUnitVectors(V(0, -1, 0), dir.clone().normalize()); g.add(r);
  }
  const p = particles(o.poeira ?? 160, [para.x - 1.5, 0.2, para.z - 1.5, 3, Math.max(2, de.y), 3], { color: 0xffe2a8, size: 0.03, rise: 0.05, opacity: 0.85 }); scene.add(p.points);
  return { g, update: t => { p.update(t); g.children.forEach((r, i) => { r.material.opacity = (o.op ?? 0.07) * (0.75 + 0.25 * Math.sin(t * 1.3 + i)); }); } };
}
export function chama(scene, pos, esc = 1) {
  const g = new THREE.Group(); g.position.copy(pos); g.scale.setScalar(esc); scene.add(g);
  const c1 = new THREE.Mesh(new THREE.SphereGeometry(0.05, 12, 10), glow(0xffd56b, 2.2)); c1.scale.set(1, 2, 1); g.add(c1);
  const c2 = new THREE.Mesh(new THREE.SphereGeometry(0.09, 12, 10), glow(0xff8a2b, 1.2, { opacity: 0.6 })); c2.scale.set(1, 1.8, 1); c2.position.y = -0.01; g.add(c2);
  const luz = new THREE.PointLight(0xff9a40, 3 * esc, 6 * esc, 1.5); luz.position.y = 0.1; g.add(luz);
  return t => { const f = 1 + 0.12 * Math.sin(t * 23) + 0.08 * Math.sin(t * 37); c1.scale.set(1, 2 * f, 1); c2.scale.set(f, 1.8 * f, f); luz.intensity = 3 * esc * f; };
}

// ---------- construções ----------
export function casaEnxaimel(w = 3, h = 2.6, d = 2.6, o = {}) {
  const g = new THREE.Group();
  const corpo = caixa(w, h, d, lam(0xffffff, { map: repetir(tex.reboco(), 2, 2) })); corpo.position.y = h / 2; g.add(corpo);
  const viga = lam(0x4a2e1a);
  const vf = (x, y, ww, hh, rz = 0) => { const v = caixa(ww, hh, 0.08, viga); v.position.set(x, y, d / 2 + 0.02); v.rotation.z = rz; g.add(v); };
  vf(0, 0.12, w, 0.14); vf(0, h * 0.5, w, 0.12); vf(0, h - 0.06, w, 0.12);
  for (const x of [-w / 2 + 0.06, -w / 6, w / 6, w / 2 - 0.06]) vf(x, h / 2, 0.12, h);
  vf(-w / 3, h * 0.75, 0.1, h * 0.55, 0.75); vf(w / 3, h * 0.25, 0.1, h * 0.55, -0.75);
  const janela = caixa(0.5, 0.6, 0.06, o.noite ? glow(0xffb560, 1.2) : lam(0x2d3b4a)); janela.position.set(-w / 3 + 0.05, h * 0.72, d / 2 + 0.03); g.add(janela);
  const j2 = janela.clone(); j2.position.x = w / 3 - 0.05; g.add(j2);
  const porta = caixa(0.6, 1.1, 0.06, lam(0x5a3a22)); porta.position.set(0, 0.6, d / 2 + 0.03); g.add(porta);
  const forma = new THREE.Shape(); forma.moveTo(-w / 2 - 0.25, 0); forma.lineTo(w / 2 + 0.25, 0); forma.lineTo(0, h * 0.6); forma.lineTo(-w / 2 - 0.25, 0);
  const tel = new THREE.Mesh(new THREE.ExtrudeGeometry(forma, { depth: d + 0.5, bevelEnabled: false }), lam(0xffffff, { map: repetir(tex.telha(), 1, 1) })); tel.position.set(0, h, -d / 2 - 0.25); tel.castShadow = true; g.add(tel);
  return g;
}
export function arvore(rng, esc = 1, cor) {
  const g = new THREE.Group();
  const tr = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.2, 2.2, 8), lam(0x5a3d26)); tr.position.y = 1.1; tr.castShadow = true; g.add(tr);
  const cores = cor ?? [0x2f5d34, 0x3d7240, 0x274d2c];
  for (let i = 0; i < 4; i++) { const f = blob(0.9 - i * 0.12, lam(cores[i % cores.length]), { seed: Math.floor(rng() * 50), noise: 0.18, freq: 4, seg: 20 }); f.position.set((rng() - 0.5) * 0.5, 2.3 + i * 0.55, (rng() - 0.5) * 0.4); g.add(f); }
  g.scale.setScalar(esc); return g;
}
export function cerca(scene, x0, x1, z) {
  const m = lam(0x7a5434);
  for (let x = x0; x <= x1; x += 1.2) { const p = caixa(0.12, 1.0, 0.12, m); p.position.set(x, 0.5, z); scene.add(p); }
  for (const y of [0.4, 0.8]) { const r = caixa(x1 - x0, 0.08, 0.06, m); r.position.set((x0 + x1) / 2, y, z); scene.add(r); }
}
export function chao(scene, map, w = 60, d = 60, rep = 12, cor = 0xffffff) { const c = new THREE.Mesh(new THREE.PlaneGeometry(w, d), lam(cor, { map: repetir(map, rep, rep) })); c.rotation.x = -Math.PI / 2; c.receiveShadow = true; scene.add(c); return c; }

// ---------- efeitos mágicos ----------
// anéis concêntricos roxos saindo de um ponto (palma da mão), olhando para "dir"
export function aneis(scene, n = 4, cor = 0xb266ff) {
  const g = new THREE.Group(); scene.add(g); const an = [];
  for (let i = 0; i < n; i++) { const a = new THREE.Mesh(new THREE.TorusGeometry(0.2, 0.012, 8, 48), glow(cor, 1.8, { opacity: 1 })); a.material.depthWrite = false; g.add(a); an.push(a); }
  const brilho = new THREE.Mesh(new THREE.SphereGeometry(0.09, 16, 12), glow(0xd9a8ff, 2)); g.add(brilho);
  const luz = new THREE.PointLight(0xa855f7, 3, 4, 1.5); g.add(luz);
  const fag = particles(60, [-0.5, -0.5, -0.5, 1, 1, 1], { color: 0xd0a0ff, size: 0.04, rise: 0.3 }); g.add(fag.points);
  return { g, update: (t, forca = 1) => { an.forEach((a, i) => { const c = (t * 0.9 + i / n) % 1; a.scale.setScalar((0.4 + c * 3.2) * forca); a.material.opacity = (1 - c) * forca; }); brilho.scale.setScalar((1 + 0.2 * Math.sin(t * 9)) * forca); luz.intensity = 3 * forca; fag.update(t); fag.points.visible = forca > 0.05; brilho.visible = forca > 0.05; } };
}
// distorção do espaço: esfera de malha roxa ondulando em volta de um objeto
export function distorcao(scene, r = 0.6) {
  const geo = new THREE.IcosahedronGeometry(r, 3), base = geo.attributes.position.array.slice();
  const m = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color: new THREE.Color(0xb266ff).multiplyScalar(1.4), wireframe: true, transparent: true, opacity: 0.35, toneMapped: false, depthWrite: false })); scene.add(m);
  return { m, update: t => { const p = geo.attributes.position; for (let i = 0; i < p.count; i++) { const x = base[i * 3], y = base[i * 3 + 1], z = base[i * 3 + 2]; const k = 1 + 0.08 * Math.sin(t * 5 + x * 6 + y * 5); p.setXYZ(i, x * k, y * k, z * k); } p.needsUpdate = true; m.rotation.y = t * 0.4; } };
}

// ---------- ciência: malha de espaço-tempo ----------
// massas: [{pos: Vector3, m}] -> afundamento y = -Σ m / (d² + c)
export function malha(scene, o = {}) {
  const N = o.n ?? 44, L = o.tam ?? 12, cor = new THREE.Color(o.cor ?? 0x8b5cf6).multiplyScalar(1.6);
  const pts = []; for (let i = 0; i <= N; i++) for (let j = 0; j < N; j++) { pts.push(i, j); pts.push(i, j + 1); pts.push(j, i); pts.push(j + 1, i); }
  const pos = new Float32Array(pts.length / 2 * 3); const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const lin = new THREE.LineSegments(geo, new THREE.LineBasicMaterial({ color: cor, transparent: true, opacity: 0.85, toneMapped: false })); scene.add(lin);
  const atualizar = (massas) => { for (let k = 0; k < pts.length / 2; k++) { const x = (pts[k * 2] / N - 0.5) * L, z = (pts[k * 2 + 1] / N - 0.5) * L; let y = 0; for (const s of massas) { const dx = x - s.pos.x, dz = z - s.pos.z; y -= s.m / (dx * dx + dz * dz + (s.c ?? 0.6)); } pos[k * 3] = x; pos[k * 3 + 1] = Math.max(y, -4); pos[k * 3 + 2] = z; } geo.attributes.position.needsUpdate = true; };
  const altura = (x, z, massas) => { let y = 0; for (const s of massas) { const dx = x - s.pos.x, dz = z - s.pos.z; y -= s.m / (dx * dx + dz * dz + (s.c ?? 0.6)); } return Math.max(y, -4); };
  return { lin, atualizar, altura };
}

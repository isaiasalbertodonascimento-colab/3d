// Ambientes mais realistas: céu com nuvens, grama instanciada, fonte, árvores frondosas, flores, pombos, sótão.
import * as THREE from 'three';
import { studio, blob, glow, particles, smooth, lerp, clamp, V, mulberry } from './lib.js';
import { tex } from './cenarios.js';

const std = (cor, o = {}) => new THREE.MeshStandardMaterial({ color: cor, roughness: o.rough ?? 0.85, metalness: 0, map: o.map ?? null, transparent: o.opacity != null, opacity: o.opacity ?? 1, side: o.side ?? THREE.FrontSide, emissive: o.emissive ?? 0x000000 });
const sombra = m => { m.castShadow = m.receiveShadow = true; return m; };
function telaTex(w, h, f, rep) { const c = document.createElement('canvas'); c.width = w; c.height = h; f(c.getContext('2d'), w, h); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping; if (rep) t.repeat.set(rep, rep); t.anisotropy = 4; return t; }

// ---------- céu ----------
export function ceu(scene, o = {}) {
  const geo = new THREE.SphereGeometry(80, 32, 16);
  const mat = new THREE.ShaderMaterial({ side: THREE.BackSide, depthWrite: false, fog: false,
    uniforms: { topo: { value: new THREE.Color(o.topo ?? 0x4a78b8) }, meio: { value: new THREE.Color(o.meio ?? 0xf3b27a) }, base: { value: new THREE.Color(o.base ?? 0xffd8a8) } },
    vertexShader: 'varying vec3 vP; void main(){ vP = normalize(position); gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.); }',
    fragmentShader: 'uniform vec3 topo, meio, base; varying vec3 vP; void main(){ float h = vP.y; vec3 c = h > 0.15 ? mix(meio, topo, smoothstep(0.15, 0.7, h)) : mix(base, meio, smoothstep(-0.05, 0.15, h)); gl_FragColor = vec4(c, 1.); }' });
  const s = new THREE.Mesh(geo, mat); scene.add(s);
  // nuvens fofas (sprites)
  const nt = telaTex(256, 128, (g, w, h) => { for (let i = 0; i < 9; i++) { const x = 40 + i * 22 + Math.sin(i) * 10, y = 70 - Math.sin(i * 0.9) * 20, r = 30 + (i % 3) * 12; const gr = g.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, 'rgba(255,255,255,.95)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, w, h); } });
  const nuvens = [];
  const rng = mulberry(o.seed ?? 3);
  for (let i = 0; i < (o.nuvens ?? 9); i++) { const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: nt, color: o.corNuvem ?? 0xffe3c8, transparent: true, opacity: 0.85, depthWrite: false, fog: false })); sp.position.set(-40 + rng() * 80, 14 + rng() * 14, -45 - rng() * 20); sp.scale.set(18 + rng() * 14, 7 + rng() * 5, 1); scene.add(sp); nuvens.push(sp); }
  return t => nuvens.forEach((n, i) => { n.position.x += 0.002 * (1 + i % 3); });
}

// ---------- grama instanciada ----------
export function grama(scene, area, n = 6000, o = {}) {
  const geo = new THREE.ConeGeometry(0.025, 0.28, 3, 1); geo.translate(0, 0.14, 0);
  const mat = new THREE.MeshStandardMaterial({ roughness: 0.9, vertexColors: false });
  const inst = new THREE.InstancedMesh(geo, mat, n); inst.receiveShadow = true;
  const m = new THREE.Matrix4(), q = new THREE.Quaternion(), c = new THREE.Color(), rng = mulberry(o.seed ?? 5);
  for (let i = 0; i < n; i++) {
    let x, z; do { x = area[0] + rng() * area[2]; z = area[1] + rng() * area[3]; } while (o.evitar && o.evitar(x, z));
    q.setFromEuler(new THREE.Euler((rng() - 0.5) * 0.5, rng() * 3, (rng() - 0.5) * 0.5));
    m.compose(V(x, 0, z), q, V(1, 0.6 + rng() * 0.9, 1)); inst.setMatrixAt(i, m);
    c.setHSL(0.22 + rng() * 0.06, 0.45 + rng() * 0.2, 0.28 + rng() * 0.15); inst.setColorAt(i, c);
  }
  scene.add(inst); return inst;
}
// flores
export function flores(scene, cx, cz, r, n = 120, cores = [0xff6b8a, 0xffd43b, 0xffffff, 0xb197fc, 0xff922b]) {
  const geo = new THREE.SphereGeometry(0.05, 8, 6); const inst = new THREE.InstancedMesh(geo, std(0xffffff, { rough: 0.6 }), n);
  const m = new THREE.Matrix4(), c = new THREE.Color(), rng = mulberry(9);
  for (let i = 0; i < n; i++) { const a = rng() * 6.28, d = Math.sqrt(rng()) * r; m.makeTranslation(cx + Math.cos(a) * d, 0.18 + rng() * 0.1, cz + Math.sin(a) * d); inst.setMatrixAt(i, m); inst.setColorAt(i, c.set(cores[i % cores.length])); }
  scene.add(inst);
  const terra = sombra(new THREE.Mesh(new THREE.CylinderGeometry(r + 0.1, r + 0.15, 0.15, 24), std(0x5a3d26))); terra.position.set(cx, 0.07, cz); scene.add(terra);
  const borda = sombra(new THREE.Mesh(new THREE.TorusGeometry(r + 0.12, 0.07, 8, 32), std(0xb8b0a0))); borda.rotation.x = Math.PI / 2; borda.position.set(cx, 0.15, cz); scene.add(borda);
}
// árvore frondosa
export function arvore(scene, x, z, esc = 1, seed = 1) {
  const rng = mulberry(seed); const g = new THREE.Group(); g.position.set(x, 0, z); g.scale.setScalar(esc); scene.add(g);
  const tronco = sombra(new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.26, 2.6, 10), std(0x5b4030))); tronco.position.y = 1.3; g.add(tronco);
  for (const [a, h] of [[0.6, 2.0], [-0.7, 2.3], [2.2, 2.1]]) { const gal = sombra(new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.09, 1.0, 6), std(0x5b4030))); gal.position.set(Math.cos(a) * 0.3, h, Math.sin(a) * 0.3); gal.rotation.set(Math.sin(a) * 0.7, 0, Math.cos(a) * 0.7); g.add(gal); }
  const tons = [0x3f6b35, 0x4f7f3a, 0x5d8f45, 0x355c2e];
  for (let i = 0; i < 9; i++) { const f = sombra(blob(0.75 + rng() * 0.4, std(tons[i % 4], { rough: 0.95 }), { seed: Math.floor(rng() * 99), noise: 0.2, freq: 5, seg: 22 })); f.position.set((rng() - 0.5) * 1.8, 2.7 + rng() * 1.3, (rng() - 0.5) * 1.6); g.add(f); }
  return g;
}
// pombo (bate asas ou congelado no ar)
export function pombo(scene) {
  const g = new THREE.Group(); scene.add(g);
  const cinza = std(0x8a8f99), escuro = std(0x4a4e57);
  const corpo = sombra(new THREE.Mesh(new THREE.SphereGeometry(0.12, 14, 10), cinza)); corpo.scale.set(1, 0.8, 1.5); g.add(corpo);
  const cab = sombra(new THREE.Mesh(new THREE.SphereGeometry(0.065, 12, 10), escuro)); cab.position.set(0, 0.08, 0.17); g.add(cab);
  const bico = new THREE.Mesh(new THREE.ConeGeometry(0.018, 0.05, 6), std(0xe8a33a)); bico.rotation.x = Math.PI / 2; bico.position.set(0, 0.07, 0.24); g.add(bico);
  const asas = [-1, 1].map(s => { const a = new THREE.Group(); a.position.set(s * 0.08, 0.04, 0); g.add(a); const p = sombra(new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.015, 0.16), cinza)); p.position.x = s * 0.16; a.add(p); return a; });
  return { g, bater: (t, parado) => asas.forEach((a, i) => { a.rotation.z = (i ? -1 : 1) * (parado ? 0.7 : Math.sin(t * 18) * 0.9); }) };
}

// ---------- praça completa ----------
export function praca(ctx, o = {}) {
  const r = studio(ctx, { top: '#4a78b8', bottom: '#ffd8a8', floor: false, keyColor: 0xffc58a, keyI: o.keyI ?? 2.6, keyPos: [-9, 5, -6], hemi: 0.6, sky: 0xbcd4f0, ground: 0x5a4a30, rimColor: 0xffb070, rimI: 1.0, fillI: 0, envI: 0.35, fog: 0xe8c4a0, fogNear: 14, fogFar: 55, shadowSize: 9 });
  const s = r.scene; s.background = null;
  r.key.shadow.mapSize.set(2048, 2048); r.key.shadow.camera.far = 60; r.key.shadow.radius = 3;
  const nuv = ceu(s, { topo: 0x5a86c4, meio: 0xf2b07a, base: 0xffe0b0 });
  const g = new THREE.Mesh(new THREE.PlaneGeometry(120, 120), std(0xffffff, { map: (() => { const t = tex.grama().clone(); t.repeat.set(40, 40); t.needsUpdate = true; return t; })() })); g.rotation.x = -Math.PI / 2; g.receiveShadow = true; s.add(g);
  const pedra = telaTex(512, 512, (c, w, h) => { c.fillStyle = '#b8ab98'; c.fillRect(0, 0, w, h); for (let y = 0; y < h; y += 64) for (let x = (y / 64 % 2) * 32; x < w; x += 64) { const v = 170 + Math.random() * 40; c.fillStyle = `rgb(${v},${v - 10},${v - 25})`; c.fillRect(x + 2, y + 2, 60, 60); } }, 1);
  pedra.repeat.set(3, 30);
  const cam1 = new THREE.Mesh(new THREE.PlaneGeometry(3, 60), std(0xffffff, { map: pedra })); cam1.rotation.x = -Math.PI / 2; cam1.position.set(0, 0.01, -10); cam1.receiveShadow = true; s.add(cam1);
  const praca2 = new THREE.Mesh(new THREE.CircleGeometry(4.2, 48), std(0xffffff, { map: (() => { const t = pedra.clone(); t.repeat.set(5, 5); t.needsUpdate = true; return t; })() })); praca2.rotation.x = -Math.PI / 2; praca2.position.set(0, 0.015, -6); praca2.receiveShadow = true; s.add(praca2);
  grama(s, [-14, -26, 28, 30], o.grama ?? 7000, { evitar: (x, z) => Math.abs(x) < 1.7 || Math.hypot(x, z + 6) < 4.4 });
  for (const [x, z, e, sd] of [[-4.5, -2, 1.1, 1], [5, -3, 1.2, 2], [-6, -11, 1.3, 3], [6.5, -12, 1.0, 4], [-3.5, -17, 1.2, 5], [4, -20, 1.4, 6], [-9, -6, 1.2, 7], [9, -8, 1.1, 8]]) arvore(s, x, z, e, sd);
  flores(s, -2.6, -1.2, 0.7, 110); flores(s, 2.8, -9.5, 0.8, 130);
  for (const [x, z, ry] of [[2.3, -2.5, -Math.PI / 2], [-2.3, -10, Math.PI / 2]]) { const b = new THREE.Group(); b.position.set(x, 0, z); b.rotation.y = ry; s.add(b); const ass = sombra(new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.08, 0.45), std(0x8a5a32))); ass.position.y = 0.45; b.add(ass); const enc = sombra(new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.4, 0.06), std(0x8a5a32))); enc.position.set(0, 0.72, -0.2); b.add(enc); for (const px of [-0.7, 0.7]) { const p = sombra(new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.45, 0.4), std(0x2b2b2b, { rough: 0.5 }))); p.position.set(px, 0.22, 0); b.add(p); } }
  for (const [x, z] of [[1.9, 0], [-1.9, -8], [1.9, -15]]) { const p = sombra(new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.07, 3.2, 10), std(0x2b2b2b, { rough: 0.4 }))); p.position.set(x, 1.6, z); s.add(p); const l = new THREE.Mesh(new THREE.SphereGeometry(0.17, 14, 10), glow(0xfff1c8, 1.1)); l.position.set(x, 3.25, z); s.add(l); }
  // prédios ao fundo (névoa faz a profundidade)
  for (let i = 0; i < 12; i++) { const h = 7 + (i * 37 % 9), w = 4 + (i % 3); const b = new THREE.Mesh(new THREE.BoxGeometry(w, h, 4), std([0xd9c2a8, 0xc2b5a8, 0xe0c8b0, 0xb8a898][i % 4])); b.position.set(-26 + i * 4.8, h / 2, -32 - (i % 2) * 3); s.add(b); for (let y = 1.5; y < h - 1; y += 1.4) for (let xx = -w / 2 + 0.8; xx < w / 2 - 0.4; xx += 1.0) { const j = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 0.7), std(0x6d7f93, { rough: 0.3 })); j.position.set(b.position.x + xx, y, b.position.z + 2.01); s.add(j); } }
  // fonte
  const fonte = new THREE.Group(); fonte.position.set(0, 0, -6); s.add(fonte);
  const perfil = [V(0, 0), V(2.0, 0), V(2.05, 0.55), V(1.85, 0.6), V(1.8, 0.3), V(0, 0.3)].map(p => new THREE.Vector2(p.x, p.y));
  const bacia = sombra(new THREE.Mesh(new THREE.LatheGeometry(perfil, 48), std(0xffffff, { map: (() => { const t = tex.pedra().clone(); t.repeat.set(6, 1); t.needsUpdate = true; return t; })(), rough: 0.8 }))); fonte.add(bacia);
  const agua = new THREE.Mesh(new THREE.CircleGeometry(1.82, 48), new THREE.MeshStandardMaterial({ color: 0x3b7fa0, roughness: 0.05, metalness: 0.3, transparent: true, opacity: 0.85 })); agua.rotation.x = -Math.PI / 2; agua.position.y = 0.48; fonte.add(agua);
  const col = sombra(new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.28, 1.4, 16), std(0xffffff, { map: tex.pedra() }))); col.position.y = 0.95; fonte.add(col);
  const prato = sombra(new THREE.Mesh(new THREE.CylinderGeometry(0.8, 0.2, 0.2, 32), std(0xffffff, { map: tex.pedra() }))); prato.position.y = 1.7; fonte.add(prato);
  // jatos de água (gotas que se movem ou ficam paradas)
  const gotaMat = new THREE.MeshStandardMaterial({ color: 0xbfe6ff, roughness: 0.05, metalness: 0.1, transparent: true, opacity: 0.8, emissive: 0x1a3a50 });
  const gotas = new THREE.InstancedMesh(new THREE.SphereGeometry(0.045, 8, 6), gotaMat, 260); fonte.add(gotas);
  const gd = []; const rng = mulberry(4); for (let i = 0; i < 260; i++) gd.push({ a: rng() * 6.28, f: rng(), v: 0.8 + rng() * 0.4 });
  const mm = new THREE.Matrix4();
  const atualizarAgua = (t) => { gd.forEach((d, i) => { const u = (d.f + t * 0.45 * d.v) % 1; const r = 0.15 + u * 1.25; const y = 1.85 + Math.sin(u * Math.PI) * 0.9 - u * 1.2; mm.makeTranslation(Math.cos(d.a) * r, y, Math.sin(d.a) * r); gotas.setMatrixAt(i, mm); }); gotas.instanceMatrix.needsUpdate = true; };
  // folhas caindo
  const folhas = particles(80, [-6, 0.3, -14, 12, 4, 14], { color: 0xd98a3a, size: 0.09, rise: -0.2, opacity: 0.9 }); s.add(folhas.points);
  return { scene: s, key: r.key, fonte, atualizarAgua, folhas, update: (t, parado) => { nuv(t); if (!parado) folhas.update(t); } };
}

// ---------- sótão do avô ----------
export function sotao(ctx) {
  const r = studio(ctx, { top: '#2a1e16', bottom: '#120c08', floor: false, keyColor: 0xffc98a, keyI: 0.35, hemi: 0.35, sky: 0xffd0a0, rimColor: 0xffa860, rimI: 0.8, fillI: 0, envI: 0.25 });
  const s = r.scene;
  const mad = (rx, ry) => { const t = tex.madeira().clone(); t.repeat.set(rx, ry); t.needsUpdate = true; return t; };
  const chao = new THREE.Mesh(new THREE.PlaneGeometry(14, 14), std(0xffffff, { map: mad(6, 6) })); chao.rotation.x = -Math.PI / 2; chao.receiveShadow = true; s.add(chao);
  for (const sx of [-1, 1]) { const tel = new THREE.Mesh(new THREE.BoxGeometry(0.08, 4.6, 10), std(0xffffff, { map: mad(3, 5) })); tel.position.set(sx * 1.75, 2.35, -0.5); tel.rotation.z = sx * 0.72; tel.receiveShadow = true; s.add(tel); }
  const fundo = new THREE.Mesh(new THREE.PlaneGeometry(8, 5), std(0xffffff, { map: mad(4, 2) })); fundo.position.set(0, 2.5, -4); s.add(fundo);
  for (let z = -3.5; z < 4; z += 1.6) { const v = sombra(new THREE.Mesh(new THREE.BoxGeometry(5.2, 0.16, 0.18), std(0x5a3a22))); v.position.set(0, 3.0, z); s.add(v); }
  const jan = new THREE.Mesh(new THREE.CircleGeometry(0.7, 40), glow(0xffd29a, 1.3)); jan.position.set(0, 2.6, -3.98); s.add(jan);
  const aro = new THREE.Mesh(new THREE.TorusGeometry(0.72, 0.06, 10, 40), std(0x4a2e1a)); aro.position.set(0, 2.6, -3.95); s.add(aro);
  const sol = new THREE.SpotLight(0xffc98a, 40, 16, 0.42, 0.5, 1.2); sol.position.set(0, 2.6, -3.8); sol.target.position.set(0.3, 0, 1.5); sol.castShadow = true; sol.shadow.mapSize.set(1024, 1024); s.add(sol, sol.target);
  const feixe = new THREE.Mesh(new THREE.ConeGeometry(1.3, 5.6, 32, 1, true), glow(0xffd29a, 0.6, { opacity: 0.07, side: THREE.DoubleSide })); feixe.material.depthWrite = false; feixe.position.set(0.15, 1.4, -1.3); feixe.rotation.x = -1.15; s.add(feixe);
  const poeira = particles(260, [-1.4, 0.2, -3.5, 2.8, 3, 5], { color: 0xffe2b0, size: 0.028, rise: 0.04, opacity: 0.9 }); s.add(poeira.points);
  const rng = mulberry(7);
  for (let i = 0; i < 9; i++) { const w = 0.5 + rng() * 0.6; const c = sombra(new THREE.Mesh(new THREE.BoxGeometry(w, 0.4 + rng() * 0.4, 0.5 + rng() * 0.3), std([0xb08a5a, 0x9a7448, 0xc8a070][i % 3]))); c.position.set((i % 2 ? 1 : -1) * (1.3 + rng() * 0.6), 0.3 + Math.floor(i / 4) * 0.45, -3 + (i % 4) * 1.1); c.rotation.y = rng() * 0.4; s.add(c); }
  const bau = sombra(new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.55, 0.6), std(0x6a3e22))); bau.position.set(-0.9, 0.28, -1.2); s.add(bau);
  const poltrona = new THREE.Group(); poltrona.position.set(0.9, 0, -0.6); poltrona.rotation.y = -0.5; s.add(poltrona);
  const as = sombra(new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.42, 0.8), std(0x7a2e2e))); as.position.y = 0.3; poltrona.add(as);
  const enc = sombra(new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.9, 0.18), std(0x7a2e2e))); enc.position.set(0, 0.75, -0.32); poltrona.add(enc);
  return { scene: s, poltrona, update: t => poeira.update(t) };
}

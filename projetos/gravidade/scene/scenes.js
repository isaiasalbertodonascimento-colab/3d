// Cenas: "Renasci na Idade Média com o poder da gravidade" — 2D vetorial chapado com profundidade cinematográfica
import * as THREE from 'three';
import { blob, glow, particles, smooth, lerp, clamp, ease, V } from './lib.js';
import { personagem, pose, tingir, chapa } from './vetor.js';
import { tex, lam, base, sol, raios, chama, casaEnxaimel, arvore, cerca, chao, aneis, distorcao, malha } from './cenarios.js';

const heroi = () => personagem({ pele: 0xe8a87c, roupa: 0xd9a21b, calca: 0x3b3a4a, cabelo: 0x3a2416 });
const aldeao = (i = 0) => personagem({ pele: [0xe0a882, 0xc98552, 0xf0c09a][i % 3], roupa: [0x7a5a3a, 0x5b6b3a, 0x8a4a3a, 0x6a5a7a][i % 4], calca: 0x4a3a2a, cabelo: [0x3a2416, 0x7a7a7a, 0x5a3220][i % 3], cabeloEstilo: ['touca', 'careca', 'curto', 'coque'][i % 4], barba: i % 2 ? 0x5a3a26 : null, tunica: true, mangaLonga: true, sapato: 0x3a2a1e });
const H = 2.45; // altura do personagem

// ---------- ambientes reutilizáveis (cenário completo) ----------
function cidade(ctx) {
  const b = base(ctx, { top: '#7fb3e0', bottom: '#d9ecf7', keyColor: 0xfff1d6, keyI: 2.2, keyPos: [5, 8, 4], sky: 0xdfefff, rim: 0xffffff, fog: 0xcfe3f0, fogNear: 14, fogFar: 45 });
  const s = b.scene;
  chao(s, tex.calcada(), 60, 60, 14, 0xcfcfcf);
  const rua = new THREE.Mesh(new THREE.PlaneGeometry(8, 80), lam(0x4a4f57)); rua.rotation.x = -Math.PI / 2; rua.position.set(4.5, 0.01, 0); rua.receiveShadow = true; s.add(rua);
  for (let i = 0; i < 9; i++) { const h = 4 + (i * 37 % 7), w = 3; const p = new THREE.Mesh(new THREE.BoxGeometry(w, h, 3), lam([0xd9c7b0, 0xb8c9d9, 0xe0b8a0, 0xc2d1b0][i % 4])); p.position.set(-3.5, h / 2, -i * 3.4 + 6); p.castShadow = p.receiveShadow = true; s.add(p);
    for (let y = 1.2; y < h - 0.6; y += 1.1) for (const z of [-0.8, 0, 0.8]) { const j = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 0.65), lam(0x4d6b85)); j.position.set(-1.99, y, -i * 3.4 + 6 + z); j.rotation.y = Math.PI / 2; s.add(j); } }
  for (let i = 0; i < 4; i++) { const pos = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.06, 3.2, 8), lam(0x2b2b2b)); pos.position.set(-1.4, 1.6, 4 - i * 6); s.add(pos); }
  return { scene: s, update: () => {} };
}
function vila(ctx, o = {}) {
  const noite = !!o.noite;
  const b = noite ? base(ctx, { top: '#1b2550', bottom: '#3a3a6e', keyColor: 0xaabfff, keyI: 1.4, keyPos: [-4, 8, -6], hemi: 0.8, sky: 0x8090d0, rim: 0x9a8cff, fog: 0x2a3060, fogNear: 12, fogFar: 45 })
    : base(ctx, { top: '#e8874a', bottom: '#f6c88a', keyColor: 0xffb070, keyI: 2.4, keyPos: [-8, 4, -10], sky: 0xffd2a0, rim: 0xff9a50, fog: 0xf0b07a, fogNear: 10, fogFar: 38 });
  const s = b.scene;
  chao(s, tex.calcada(), 60, 60, 14, noite ? 0x8a8aa8 : 0xd8c8b0);
  const rng = ctx.rng;
  for (let i = 0; i < 6; i++) for (const lado of [-1, 1]) { const c = casaEnxaimel(2.8 + rng() * 0.6, 2.4 + rng() * 0.8, 2.6, { noite }); c.position.set(lado * 3.6, 0, 2 - i * 3.6); c.rotation.y = -lado * Math.PI / 2; s.add(c); }
  const poco = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.65, 0.8, 20), lam(0xffffff, { map: tex.pedra() })); poco.position.set(1.2, 0.4, -6); poco.castShadow = true; s.add(poco);
  const feno = blob(0.7, lam(0xd9b45a), { seed: 3, noise: 0.15, freq: 7, stretch: V(1.3, 0.8, 1) }); feno.position.set(-2.0, 0.45, -3); s.add(feno);
  let upd = () => {};
  if (noite) { const lua = new THREE.Mesh(new THREE.CircleGeometry(1.1, 40), glow(0xe8ecff, 1.4)); lua.position.set(-3, 9, -30); s.add(lua); const est = particles(300, [-25, 4, -40, 50, 25, 4], { color: 0xffffff, size: 0.08, rise: 0 }); est.update(0); s.add(est.points); }
  else { sol(s, V(0, 3.2, -30), 0xffa860, 2.4); const r = raios(s, V(0, 9, -12), V(0, 0, 0), { n: 5, r0: 0.3, r1: 2.0, esp: 1.2, op: 0.06, poeira: 120 }); upd = r.update; }
  return { scene: s, update: upd };
}
function interior(ctx) {
  const b = base(ctx, { top: '#2a1e18', bottom: '#120c0a', keyColor: 0xffc080, keyI: 0.5, keyPos: [3, 5, -4], hemi: 0.3, sky: 0xffc8a0, rim: 0xff9a50 });
  const s = b.scene;
  const parede = (w, h) => new THREE.Mesh(new THREE.PlaneGeometry(w, h), lam(0xffffff, { map: (() => { const t = tex.pedra().clone(); t.repeat.set(w / 2, h / 2); t.needsUpdate = true; return t; })() }));
  const fundo = parede(10, 5); fundo.position.set(0, 2.5, -2.5); fundo.receiveShadow = true; s.add(fundo);
  const lat = parede(8, 5); lat.rotation.y = Math.PI / 2; lat.position.set(-3.5, 2.5, 1); lat.receiveShadow = true; s.add(lat);
  chao(s, tex.madeira(), 20, 20, 8, 0xc8a080);
  const jan = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 1.3), glow(0xffd8a0, 1.2)); jan.position.set(1.4, 2.9, -2.48); s.add(jan);
  const r = raios(s, V(1.4, 2.9, -2.4), V(0.2, 0, 1.2), { n: 3, r0: 0.25, r1: 0.8, esp: 0.25, op: 0.09, poeira: 180 });
  const mesa = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.1, 0.9), lam(0xffffff, { map: tex.madeira() })); mesa.position.set(0, 0.85, -0.6); mesa.castShadow = mesa.receiveShadow = true; s.add(mesa);
  for (const [x, z] of [[-0.8, -0.95], [0.8, -0.95], [-0.8, -0.25], [0.8, -0.25]]) { const p = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.85, 0.08), lam(0x5a3a22)); p.position.set(x, 0.42, z); s.add(p); }
  const vela = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.25, 12), lam(0xf4ead2)); vela.position.set(-0.55, 1.02, -0.7); s.add(vela);
  const fogoVela = chama(s, V(-0.55, 1.2, -0.7), 0.8);
  // lareira
  const lar = new THREE.Mesh(new THREE.BoxGeometry(1.6, 1.4, 0.5), lam(0xffffff, { map: tex.pedra() })); lar.position.set(-2.3, 0.7, -2.2); s.add(lar);
  const boca = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 0.7), new THREE.MeshBasicMaterial({ color: 0x1a0d08 })); boca.position.set(-2.3, 0.45, -1.94); s.add(boca);
  const fogo = chama(s, V(-2.3, 0.3, -1.9), 2.2);
  const brasas = particles(60, [-2.7, 0.2, -2.0, 0.8, 1.2, 0.3], { color: 0xff8a3d, size: 0.04, rise: 0.5 }); s.add(brasas.points);
  for (let i = 0; i < 4; i++) { const j = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.12, 0.25, 12), lam([0x8a5a3a, 0x6a7a5a, 0xa06040][i % 3])); j.position.set(1.8 + i * 0.3, 1.75, -2.35); s.add(j); }
  const prat = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.05, 0.3), lam(0x5a3a22)); prat.position.set(2.25, 1.6, -2.35); s.add(prat);
  return { scene: s, update: t => { r.update(t); fogoVela(t); fogo(t); brasas.update(t); } };
}
function floresta(ctx) {
  const b = base(ctx, { top: '#c9a86a', bottom: '#4a6a4a', keyColor: 0xffd59a, keyI: 1.8, keyPos: [4, 9, -6], hemi: 0.45, sky: 0xd8e8c0, rim: 0xffd080, fog: 0x7f9a6a, fogNear: 6, fogFar: 26 });
  const s = b.scene;
  chao(s, tex.grama(), 60, 60, 14, 0xc0d0a0);
  const rng = ctx.rng;
  for (let i = 0; i < 40 && s.children.length < 400; i++) { const a = rng() * Math.PI * 2, r = 3.5 + rng() * 14; const x = Math.cos(a) * r, z = Math.sin(a) * r - 3; if (z > -2.5 && Math.abs(x) < 6) continue; const t = arvore(rng, 0.9 + rng() * 0.7); t.position.set(x, 0, z); s.add(t); }
  for (let i = 0; i < 6; i++) { const p = blob(0.3 + rng() * 0.3, lam(0x7a7a72), { seed: i + 3, noise: 0.25 }); p.position.set(-3 + rng() * 6, 0.15, -1 - rng() * 4); p.scale.y = 0.6; s.add(p); }
  const r = raios(s, V(2, 10, -6), V(0, 0, 0), { n: 5, r0: 0.4, r1: 1.4, esp: 0.8, op: 0.07, poeira: 140 });
  return { scene: s, update: t => r.update(t) };
}

// ---------- cenas ----------
export default {
  // cidade moderna: anda (por trás), banana (close no chão), escorrega
  cidade(ctx) {
    const a = ctx.args.acao, amb = cidade(ctx), s = amb.scene;
    const h = heroi(); s.add(h);
    const banana = new THREE.Group(); s.add(banana);
    for (let i = 0; i < 4; i++) { const c = new THREE.Mesh(new THREE.CapsuleGeometry(0.05, 0.22, 4, 8), chapa(0xf2cc3a)); c.rotation.set(Math.PI / 2, 0, i * Math.PI / 2 + 0.3); c.position.set(Math.cos(i * Math.PI / 2 + 0.3) * 0.12, 0.03, Math.sin(i * Math.PI / 2 + 0.3) * 0.12); banana.add(c); }
    banana.position.set(0, 0, 2.6);
    const rig = a === 'anda' ? { target: V(0, 1.6, 0.5), dist: 5.2, pitch: 0.12, yaw: Math.PI + 0.25, fov: 38 }
      : a === 'banana' ? { target: V(0, 0.15, 2.6), dist: 2.0, pitch: 0.35, yaw: 0.6, fov: 34 }
      : { target: V(0, 1.4, 2.4), dist: 5.4, pitch: 0.05, yaw: 1.3, fov: 38 };
    return {
      scene: s, rig, bloom: [0.25, 0.4, 0.9], dof: a === 'banana' ? 0.012 : 0.004,
      update(t, d, k) {
        if (a === 'anda') { h.position.set(0, 0, lerp(-1, 1.6, k)); pose(h, t, { anda: 1, expr: 'feliz', olhar: [0.4, 0] }); }
        else if (a === 'banana') { h.position.set(0, 0, lerp(0.6, 2.2, k)); pose(h, t, { anda: 1, expr: 'feliz' }); }
        else { const q = ease(smooth(0.1, 0.55, k)); h.position.set(0, Math.sin(q * Math.PI) * 0.5, 2.5 + q * 0.4); h.rotation.x = -q * 1.45; pose(h, t, { expr: 'surpresa', bE: 1.6 * q + 0.1, bD: 1.4 * q + 0.1, pE: 0.9 * q, pD: -0.3 * q }); }
      }
    };
  },
  // a "morte": subindo numa luz dourada (cômico)
  ceu(ctx) {
    const b = base(ctx, { top: '#d99a3a', bottom: '#8a5a1e', keyI: 1.0, hemi: 0.9, sky: 0xffe0a0 }); const s = b.scene;
    const h = heroi(); s.add(h);
    const auréola = new THREE.Mesh(new THREE.TorusGeometry(0.28, 0.035, 10, 40), glow(0xfff0a0, 1.6)); auréola.rotation.x = Math.PI / 2; s.add(auréola);
    const brilho = particles(160, [-3, -2, -3, 6, 8, 4], { color: 0xffffff, size: 0.08, rise: 0.8 }); s.add(brilho.points);
    const r = raios(s, V(0, 12, -2), V(0, -2, 0), { n: 4, r0: 0.5, r1: 2.2, esp: 1.1, op: 0.04, poeira: 60 });
    return {
      scene: s, rig: { target: V(0, 2.0, 0), dist: 6.0, pitch: 0.05, fov: 38 }, bloom: [0.3, 0.4, 0.85], dof: 0.002, exposure: 0.8,
      update(t, d, k) { brilho.update(t); r.update(t); h.position.y = k * 1.4; h.rotation.y = t * 0.6; auréola.position.set(h.position.x, h.position.y + 2.62, 0); pose(h, t, { expr: 'concentrado', bE: 0.5, bD: 0.5 }); }
    };
  },
  // acorda no feno ao amanhecer
  acorda(ctx) {
    const amb = vila(ctx), s = amb.scene;
    const feno = blob(1.3, lam(0xe0bc62), { seed: 5, noise: 0.15, freq: 8, stretch: V(1.4, 0.45, 1.1) }); feno.position.set(0, 0.35, 0.3); s.add(feno);
    const h = heroi(); h.position.set(0, 0.25, 0.6); s.add(h);
    const galinha = blob(0.2, lam(0xf4f0e8), { seed: 2, noise: 0.05, stretch: V(1.2, 1, 0.9) }); galinha.position.set(1.4, 0.25, 1.2); s.add(galinha);
    return {
      scene: s, rig: { target: V(0, 1.1, 0.6), dist: 5.4, pitch: 0.18, yaw: 0.3, fov: 38 }, bloom: [0.3, 0.4, 0.85], dof: 0.005,
      update(t, d, k) {
        amb.update(t); const lev = ease(smooth(0.1, 0.6, k));
        h.rotation.x = lerp(-1.3, -0.2, lev); h.position.y = 0.25;
        pose(h, t, { expr: k > 0.5 ? 'surpresa' : 'concentrado', bE: 0.3, bD: 0.3, pE: -1.3 * lev, pD: -1.3 * lev, olhar: [Math.sin(t * 3), 0.2] });
        galinha.position.x = 1.4 + Math.sin(t * 2) * 0.2;
      }
    };
  },
  // vila: wide, anda, janela (aldeões espiando), aldeoes (tochas), noite
  vila(ctx) {
    const a = ctx.args.acao, amb = vila(ctx, { noite: a === 'noite' }), s = amb.scene;
    const h = heroi(); s.add(h);
    const gente = [];
    if (a === 'aldeoes' || a === 'janela' || a === 'wide') {
      const n = a === 'aldeoes' ? 6 : 3;
      for (let i = 0; i < n; i++) { const p = aldeao(i); p.position.set(-1.6 + i * 0.65, 0, a === 'aldeoes' ? -2.2 - (i % 2) * 0.6 : -4 - i); p.rotation.y = a === 'aldeoes' ? 0 : (i % 2 ? 0.8 : -0.6); s.add(p); gente.push(p);
        if (a === 'aldeoes') { const t2 = new THREE.Group(); const c = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.9, 8), lam(0x5a3a22)); t2.add(c); const f = new THREE.Mesh(new THREE.SphereGeometry(0.1, 12, 10), glow(0xff9a3a, 2)); f.position.y = 0.5; f.scale.y = 1.6; t2.add(f); const l = new THREE.PointLight(0xff8a30, 2.5, 4, 1.5); l.position.y = 0.6; t2.add(l); t2.position.set(0.22, 0.5, 0.1); p.userData.bracos[1].add(t2); } }
    }
    if (a === 'noite') tingir(h, 0x7080c0, 0.55);
    const rig = a === 'anda' ? { target: V(0, 1.6, -1), dist: 5.6, pitch: 0.1, yaw: Math.PI + 0.15, fov: 38 }
      : a === 'janela' ? { target: V(-0.4, 1.6, -3.2), dist: 6.2, pitch: 0.05, yaw: 0.25, fov: 38 }
      : a === 'aldeoes' ? { target: V(-0.2, 1.6, -2.4), dist: 6.0, pitch: 0.05, fov: 40 }
      : { target: V(0, 2.4, 0), dist: 12, pitch: 0.12, fov: 42 };
    return {
      scene: s, rig, bloom: a === 'noite' ? [0.5, 0.5, 0.6] : [0.3, 0.4, 0.85], dof: a === 'wide' || a === 'noite' ? 0.0015 : 0.004,
      update(t, d, k) {
        amb.update(t);
        if (a === 'anda') { h.position.set(0, 0, lerp(-1.5, 1, k)); h.rotation.y = Math.PI; pose(h, t, { anda: 1, expr: 'neutro' }); }
        else if (a === 'janela' || a === 'aldeoes') { h.visible = false; }
        else if (a === 'noite') { h.position.set(0, 0, 2); h.rotation.y = Math.PI; pose(h, t, { expr: 'medo' }); }
        else { h.position.set(0, 0, 1); h.rotation.y = Math.sin(t * 0.8) * 0.8; pose(h, t, { expr: 'surpresa', olhar: [Math.sin(t), 0.3] }); }
        gente.forEach((p, i) => pose(p, t, a === 'aldeoes' ? { expr: 'raiva', fase: i, bD: 2.6, bDx: -0.3 + Math.sin(t * 8 + i) * 0.25, bE: 0.4 + Math.sin(t * 7 + i) * 0.3, olhar: [0, 0] } : a === 'janela' ? { expr: 'medo', fase: i, olhar: [i % 2 ? -0.8 : 0.8, 0.2], bE: 0.15, bD: 0.15 } : { expr: 'neutro', fase: i, anda: 0.6 }));
      }
    };
  },
  // interior de pedra: vela, maçã voando pra mão, objetos flutuando
  interior(ctx) {
    const a = ctx.args.acao, amb = interior(ctx), s = amb.scene;
    const h = heroi(); h.position.set(0.95, 0, 0.25); h.rotation.y = -1.2; s.add(h);
    const maca = blob(0.11, lam(0xc0392b), { seed: 2, noise: 0.05 }); s.add(maca);
    const cab = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.01, 0.07, 6), lam(0x5a3a22)); maca.add(cab); cab.position.y = 0.12;
    const fx = aneis(s, 4); const dist = distorcao(s, 0.35);
    const objs = [];
    if (a === 'objetos') for (let i = 0; i < 6; i++) { const o = i % 2 ? new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.1, 0.2, 12), lam([0x8a5a3a, 0x6a7a5a, 0xa06040][i % 3])) : blob(0.1, lam(0xc0392b), { seed: i, noise: 0.05 }); o.castShadow = true; s.add(o); objs.push(o); }
    const rig = a === 'vela' ? { target: V(-0.3, 1.3, -0.6), dist: 4.0, pitch: 0.12, yaw: 0.35, fov: 36 } : { target: V(0.35, 1.45, -0.2), dist: 4.6, pitch: 0.08, yaw: 0.15, fov: 38 };
    return {
      scene: s, rig, bloom: [0.45, 0.45, 0.7], dof: 0.005,
      update(t, d, k) {
        amb.update(t);
        const ini = ctx.args.ini ?? 0, fim = ctx.args.fim ?? 1, kk = lerp(ini, fim, k);
        const mao = new THREE.Vector3(); h.userData.maos[-1].getWorldPosition(mao);
        if (a === 'maca') {
          const v = ease(smooth(0.2, 0.7, kk)); maca.position.lerpVectors(V(-0.45, 0.98, -0.6), mao.clone().add(V(0, 0.1, 0)), v); maca.position.y += Math.sin(v * Math.PI) * 0.35; maca.rotation.set(t * 3, t * 2, 0);
          fx.g.position.copy(mao); fx.update(t, kk > 0.1 ? 1 : 0.2); dist.m.position.copy(maca.position); dist.update(t); dist.m.visible = v > 0.02 && v < 0.98;
          pose(h, t, { expr: kk < 0.2 ? 'concentrado' : kk < 0.75 ? 'surpresa' : 'risada', bE: 1.3, bEx: -0.4, bD: 0.15, olhar: [-1, -0.3] });
        } else if (a === 'objetos') {
          maca.visible = false; fx.g.position.copy(mao); fx.update(t, 1); dist.m.visible = false;
          objs.forEach((o, i) => { const ang = t * 1.2 + i / objs.length * Math.PI * 2; o.position.set(0.2 + Math.cos(ang) * 0.9, 1.6 + Math.sin(t * 2 + i) * 0.15, -0.3 + Math.sin(ang) * 0.6); o.rotation.set(t + i, t * 1.3, 0); });
          pose(h, t, { expr: 'risada', bE: 2.2, bD: 2.2, olhar: [0, 0.6] });
        } else { maca.position.set(-0.45, 0.98, -0.6); fx.update(t, 0); dist.m.visible = false; pose(h, t, { expr: 'neutro', olhar: [-1, -0.4], bE: 0.15, bD: 0.15 }); }
      }
    };
  },
  // close na mão com os anéis roxos (bg: interior | grade)
  mao(ctx) {
    const bgN = ctx.args.bg, forca = ctx.args.forca ?? 1;
    let s, upd = () => {};
    if (bgN === 'grade') { const b = base(ctx, { top: '#12082a', bottom: '#030108', keyI: 0.4, hemi: 0.3 }); s = b.scene; const m = malha(s, { cor: 0x8b5cf6 }); m.lin.position.set(0, -0.8, -3); upd = t => m.atualizar([{ pos: V(Math.sin(t) * 0.5, 0, 0), m: 1.5 }]); }
    else { const amb = interior(ctx); s = amb.scene; upd = amb.update; }
    const h = heroi(); h.position.set(0.4, 0, 0.3); h.rotation.y = -0.35; s.add(h);
    const fx = aneis(s, 5); const dist = distorcao(s, 0.28);
    return {
      scene: s, rig: { target: V(0.05, 1.55, 0.9), dist: 2.0, pitch: 0.05, yaw: 0.2, fov: 32 }, bloom: [0.6, 0.5, 0.55], dof: 0.012, maxblur: 0.016,
      update(t, d, k) {
        upd(t); pose(h, t, { expr: 'concentrado', bE: 1.25, bEx: -1.2, bD: 0.1 });
        const mao = new THREE.Vector3(); h.userData.maos[-1].getWorldPosition(mao);
        fx.g.position.copy(mao).add(V(0, 0, 0.08)); fx.g.lookAt(ctx.shot && mao.clone().add(V(0.3, 0, 1))); fx.update(t, forca * (0.6 + 0.4 * smooth(0, 0.3, k)));
        dist.m.position.copy(mao).add(V(0, 0.1, 0.2)); dist.update(t); dist.m.visible = forca > 0.5;
      }
    };
  },
  // close no rosto (expr; bg: cidade|vila|interior|floresta|noite; quem: aldeao)
  rosto(ctx) {
    const a = ctx.args, bgN = a.bg ?? 'vila';
    const amb = bgN === 'cidade' ? cidade(ctx) : bgN === 'interior' ? interior(ctx) : bgN === 'floresta' ? floresta(ctx) : vila(ctx, { noite: bgN === 'noite' });
    const s = amb.scene;
    const p = a.quem === 'aldeao' ? aldeao(2) : heroi(); p.position.set(0, 0, 1.5); s.add(p);
    if (bgN === 'noite') tingir(p, 0x7080c0, 0.5);
    let fx = null; if (a.expr === 'concentrado' || a.expr === 'risada') { fx = aneis(s, 3); }
    return {
      scene: s, rig: { target: V(0, 1.72, 1.5), dist: 2.8, pitch: 0.02, yaw: 0.12, fov: 30 }, bloom: [0.35, 0.45, 0.75], dof: 0.02, maxblur: 0.018,
      update(t, d, k) {
        amb.update(t);
        pose(p, t, { expr: a.expr, olhar: a.expr === 'raiva' ? [0, 0] : [Math.sin(t * 2) * 0.3, 0.1], cabZ: a.expr === 'medo' ? -0.06 : 0, bE: 0.1, bD: 0.1 });
        if (fx) { const m = new THREE.Vector3(); p.userData.cabeca.getWorldPosition(m); fx.g.position.copy(m).add(V(0.45, -0.5, 0.3)); fx.update(t, 0.7); }
      }
    };
  },
  // malha neon do espaço-tempo (plana, planeta, orbita, mao)
  grade(ctx) {
    const modo = ctx.args.modo;
    const b = base(ctx, { top: '#160a35', bottom: '#030108', keyI: 0.3, hemi: 0.2 }); const s = b.scene;
    const est = particles(400, [-15, -3, -20, 30, 20, 8], { color: 0xffffff, size: 0.05, rise: 0 }); est.update(0); s.add(est.points);
    const m = malha(s, { cor: modo === 'mao' ? 0xb266ff : 0x6d7cff, n: 46, tam: 12 });
    const planeta = new THREE.Mesh(new THREE.SphereGeometry(0.75, 40, 30), new THREE.MeshLambertMaterial({ color: 0x3d8bfd, emissive: 0x0b2a6a })); planeta.visible = modo === 'planeta' || modo === 'orbita'; s.add(planeta);
    const atm = new THREE.Mesh(new THREE.SphereGeometry(0.85, 30, 20), glow(0x74c0fc, 0.6, { opacity: 0.25 })); planeta.add(atm);
    const lua = new THREE.Mesh(new THREE.SphereGeometry(0.2, 20, 16), new THREE.MeshLambertMaterial({ color: 0xdedede })); lua.visible = modo === 'orbita'; s.add(lua);
    let h = null, fx = null;
    if (modo === 'mao') { h = heroi(); h.position.set(0, -0.2, 2.6); h.rotation.y = Math.PI; s.add(h); fx = aneis(s, 5); }
    return {
      scene: s, rig: modo === 'mao' ? { target: V(0, 0.9, 1.2), dist: 6.0, pitch: 0.3, yaw: Math.PI + 0.2, fov: 40 } : { target: V(0, -0.6, 0), dist: 9.5, pitch: 0.55, fov: 40 }, bloom: [0.7, 0.5, 0.5], dof: 0.0015,
      update(t, d, k) {
        const massas = [];
        if (modo === 'planeta' || modo === 'orbita') { const mm = modo === 'planeta' ? ease(smooth(0, 0.5, k)) * 2.2 : 2.2; massas.push({ pos: V(0, 0, 0), m: mm, c: 1.6 }); planeta.position.y = m.altura(0, 0, massas) + 0.7; planeta.rotation.y = t * 0.5; }
        if (modo === 'orbita') { const ang = t * 1.6, r = 2.4; const p = V(Math.cos(ang) * r, 0, Math.sin(ang) * r); lua.position.set(p.x, m.altura(p.x, p.z, massas) + 0.2, p.z); }
        if (modo === 'mao') { const mao = new THREE.Vector3(); h.userData.maos[-1].getWorldPosition(mao); const alvo = V(Math.sin(t * 1.2) * 1.2, 0, -1 + Math.cos(t) * 0.6); massas.push({ pos: alvo, m: 1.2 + 0.6 * Math.sin(t * 3) }); fx.g.position.copy(mao); fx.update(t, 1); pose(h, t, { expr: 'concentrado', bE: 1.3, bEx: -1.0, bD: 0.2 }); }
        m.atualizar(massas); m.lin.rotation.y = modo === 'mao' ? 0 : t * 0.05;
      }
    };
  },
  // bola pesada afundando um lençol (bolinhas = bolinhas rolando pra dentro)
  tecido(ctx) {
    const modo = ctx.args.modo;
    const b = base(ctx, { top: '#2a1f4a', bottom: '#0c0818', keyColor: 0xffe8d0, keyI: 1.6, keyPos: [3, 6, 4], hemi: 0.35, sky: 0xc0b0ff }); const s = b.scene;
    const N = 60, L = 8; const geo = new THREE.PlaneGeometry(L, L, N, N); geo.rotateX(-Math.PI / 2);
    const tx = (() => { const c = document.createElement('canvas'); c.width = c.height = 512; const g = c.getContext('2d'); g.fillStyle = '#d9cff5'; g.fillRect(0, 0, 512, 512); g.strokeStyle = 'rgba(90,60,160,.45)'; g.lineWidth = 3; for (let i = 0; i <= 512; i += 32) { g.beginPath(); g.moveTo(i, 0); g.lineTo(i, 512); g.stroke(); g.beginPath(); g.moveTo(0, i); g.lineTo(512, i); g.stroke(); } const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t; })();
    const pano = new THREE.Mesh(geo, new THREE.MeshLambertMaterial({ map: tx, side: THREE.DoubleSide })); pano.receiveShadow = true; s.add(pano);
    const basePos = geo.attributes.position.array.slice();
    const bola = new THREE.Mesh(new THREE.SphereGeometry(0.6, 32, 24), new THREE.MeshLambertMaterial({ color: 0xd08a4a, emissive: 0x2a1408 })); bola.castShadow = true; s.add(bola);
    const bolinhas = []; if (modo === 'bolinhas') for (let i = 0; i < 5; i++) { const bb = new THREE.Mesh(new THREE.SphereGeometry(0.12, 16, 12), new THREE.MeshLambertMaterial({ color: [0xffc83a, 0xff6b6b, 0x69db7c, 0x74c0fc, 0xda77f2][i] })); bb.castShadow = true; bb.userData = { a: i / 5 * Math.PI * 2, r: 3.2 }; s.add(bb); bolinhas.push(bb); }
    const fundo = (x, z, m) => -m * 1.6 / (x * x + z * z + 0.9);
    return {
      scene: s, rig: ctx.args.close ? { target: V(0, -0.6, 0), dist: 3.4, pitch: 0.35, fov: 36 } : { target: V(0, -0.5, 0), dist: 7.5, pitch: 0.5, fov: 38 }, bloom: [0.25, 0.4, 0.85], dof: ctx.args.close ? 0.01 : 0.003,
      update(t, d, k) {
        const m = modo === 'bola' ? ease(smooth(0.05, 0.6, k)) : 1;
        const p = geo.attributes.position; for (let i = 0; i < p.count; i++) { const x = basePos[i * 3], z = basePos[i * 3 + 2]; p.setY(i, fundo(x, z, m)); } p.needsUpdate = true; geo.computeVertexNormals();
        bola.position.set(0, lerp(2.2, fundo(0, 0, m) + 0.55, m), 0);
        bolinhas.forEach((bb, i) => { const u = bb.userData; u.r = Math.max(0.65, 3.2 - t * 0.9); u.a += 0.02 + 0.6 / (u.r * u.r) * 0.1; const x = Math.cos(u.a) * u.r, z = Math.sin(u.a) * u.r; bb.position.set(x, fundo(x, z, 1) + 0.12, z); });
      }
    };
  },
  // estrada do campo com cerca, pôr do sol, ele indo embora (por trás)
  estrada(ctx) {
    const b = base(ctx, { top: '#e0703a', bottom: '#f7c27a', keyColor: 0xff9a50, keyI: 2.2, keyPos: [0, 3, -20], sky: 0xffc890, rim: 0xff8a40, fog: 0xf0a060, fogNear: 10, fogFar: 40 }); const s = b.scene;
    chao(s, tex.grama(), 80, 80, 16, 0xe0c080);
    const rua = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 80), lam(0xffffff, { map: (() => { const t = tex.terra().clone(); t.repeat.set(1, 20); t.needsUpdate = true; return t; })() })); rua.rotation.x = -Math.PI / 2; rua.position.y = 0.01; rua.receiveShadow = true; s.add(rua);
    for (const x of [-1.6, 1.6]) { for (let z = 6; z > -30; z -= 1.4) { const p = new THREE.Mesh(new THREE.BoxGeometry(0.12, 1.0, 0.12), lam(0x7a5434)); p.position.set(x, 0.5, z); p.castShadow = true; s.add(p); } for (const y of [0.4, 0.8]) { const r = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.08, 36), lam(0x7a5434)); r.position.set(x, y, -12); s.add(r); } }
    for (let i = 0; i < 5; i++) { const m = blob(6, lam(0x8a7a50), { seed: i, noise: 0.05 }); m.position.set(-20 + i * 10, -3.5, -40); m.scale.y = 0.6; s.add(m); }
    sol(s, V(0, 2.6, -38), 0xffa050, 2.6);
    const h = heroi(); h.rotation.y = Math.PI; s.add(h); tingir(h, 0xffb080, 0.25);
    return {
      scene: s, rig: { target: V(0, 1.4, -2), dist: 6.0, pitch: 0.08, yaw: 0.08, fov: 38 }, bloom: [0.4, 0.45, 0.7], dof: 0.003,
      update(t, d, k) { h.position.set(0, 0, lerp(0, -4, k)); pose(h, t, { anda: 1, expr: 'neutro' }); }
    };
  },
  // floresta: wide, pedra, tronco, voa
  floresta(ctx) {
    const a = ctx.args.acao, amb = floresta(ctx), s = amb.scene;
    const h = heroi(); h.position.set(0, 0, 0.6); s.add(h);
    const fx = aneis(s, 4);
    const pedra = blob(0.3, lam(0x8a8a82), { seed: 4, noise: 0.25 }); pedra.castShadow = true; s.add(pedra);
    const tronco = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.25, 2.2, 14), lam(0x6a4a2e)); tronco.castShadow = true; s.add(tronco);
    const dist = distorcao(s, 0.6);
    const rig = a === 'wide' ? { target: V(0, 1.6, 0), dist: 9.0, pitch: 0.15, yaw: 0.2, fov: 40 } : a === 'voa' ? { target: V(0, 2.4, 0.6), dist: 5.8, pitch: 0.0, yaw: 0.3, fov: 40 } : { target: V(0.3, 1.5, 0.3), dist: 5.2, pitch: 0.08, yaw: 0.35, fov: 38 };
    return {
      scene: s, rig, bloom: [0.45, 0.45, 0.7], dof: a === 'wide' ? 0.002 : 0.005,
      update(t, d, k) {
        amb.update(t);
        const mao = new THREE.Vector3(); h.userData.maos[-1].getWorldPosition(mao);
        pedra.visible = a === 'pedra'; tronco.visible = a === 'tronco'; dist.m.visible = false;
        if (a === 'pedra') { const v = ease(smooth(0.1, 0.6, k)); pedra.position.set(1.0, 0.18 + v * 1.4 + Math.sin(t * 2) * 0.05, 0); pedra.rotation.set(t, t * 0.7, 0); dist.m.visible = true; dist.m.position.copy(pedra.position); dist.update(t); fx.g.position.copy(mao); fx.update(t, 0.8); pose(h, t, { expr: 'concentrado', bE: 1.3, bEx: -0.6, bD: 0.15 }); }
        else if (a === 'tronco') { const v = ease(smooth(0.05, 0.5, k)); tronco.position.set(1.2, 1.1 + v * 1.2, -0.3); tronco.rotation.z = lerp(Math.PI / 2, 0.3, v); dist.m.visible = true; dist.m.scale.setScalar(2.2); dist.m.position.copy(tronco.position); dist.update(t); fx.g.position.copy(mao); fx.update(t, 1); pose(h, t, { expr: 'raiva', bE: 1.6, bD: 1.6, bEx: -0.5, bDx: -0.5 }); }
        else if (a === 'voa') { const v = ease(smooth(0.05, 0.6, k)); h.position.y = v * 1.6 + Math.sin(t * 2) * 0.05; fx.g.position.set(0, h.position.y + 0.05, 0.6); fx.g.rotation.x = Math.PI / 2; fx.update(t, 1); pose(h, t, { expr: 'surpresa', bE: 0.9, bD: 0.9, pE: 0.2, pD: -0.2 }); }
        else { fx.update(t, 0); pose(h, t, { expr: 'neutro', olhar: [Math.sin(t), 0.2] }); }
      }
    };
  },
  // torre à noite: janela roxa, figura encapuzada, olhos
  torre(ctx) {
    const a = ctx.args.acao, amb = vila(ctx, { noite: true }), s = amb.scene;
    const torre = new THREE.Group(); torre.position.set(0, 0, -9); s.add(torre);
    const corpo = new THREE.Mesh(new THREE.CylinderGeometry(1.4, 1.6, 9, 20), lam(0xffffff, { map: tex.pedra() })); corpo.position.y = 4.5; corpo.castShadow = true; torre.add(corpo);
    const teto = new THREE.Mesh(new THREE.ConeGeometry(1.8, 2.4, 20), lam(0x5a3a5a)); teto.position.y = 10.2; torre.add(teto);
    const jan = new THREE.Mesh(new THREE.PlaneGeometry(0.7, 1.0), glow(0xb266ff, 0.9)); jan.position.set(0, 7.0, 1.4); torre.add(jan);
    const luzR = new THREE.PointLight(0xa855f7, 8, 10, 1.5); luzR.position.set(0, 7, 2.5); torre.add(luzR);
    const fig = personagem({ pele: 0x1a1426, roupa: 0x1d1530, calca: 0x1d1530, cabelo: 0x241a38, cabeloEstilo: 'capuz', tunica: true, mangaLonga: true });
    fig.scale.setScalar(0.32); fig.position.set(0, 6.5, 1.75); torre.add(fig);
    fig.userData.olhos.forEach(o => { o.material = glow(0xd9a8ff, 2.5); o.scale.set(1.6, 1.0, 0.4); });
    fig.traverse(o => { if (o.isMesh && o.material?.color && o.material.color.getHex() === 0xf08a8a) o.visible = false; }); // sem bochecha rosada no vilão
    const fx = aneis(s, 4);
    const rig = a === 'janela' ? { target: V(0, 5.2, -9), dist: 13, pitch: -0.2, fov: 40 } : a === 'figura' ? { target: V(0, 7.0, -7.2), dist: 3.4, pitch: -0.05, fov: 36 } : { target: V(0, 6.98, -7.2), dist: 1.6, pitch: 0, fov: 30 };
    return {
      scene: s, rig, bloom: [0.7, 0.5, 0.45], dof: a === 'olhos' ? 0.02 : 0.004,
      update(t, d, k) {
        amb.update(t); jan.material.color.setRGB(0.7 * (0.9 + 0.2 * Math.sin(t * 5)), 0.4 * (0.9 + 0.2 * Math.sin(t * 5)), 1.0 * (0.9 + 0.2 * Math.sin(t * 5)));
        fig.visible = a !== 'janela' || k > 0.5;
        pose(fig, t, { expr: 'neutro', bD: a === 'figura' ? 1.3 : 0.1, bDx: a === 'figura' ? -1.0 : 0, bE: 0.1 });
        const mao = new THREE.Vector3(); fig.userData.maos[1].getWorldPosition(mao); fx.g.position.copy(mao); fx.g.scale.setScalar(0.5); fx.update(t, a === 'figura' ? 1 : 0.4);
      }
    };
  },
};

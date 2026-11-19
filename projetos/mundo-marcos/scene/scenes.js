// Cenas: "Mundo de Marcos" — cada mentira te deixa 1 cm menor
import * as THREE from 'three';
import { studio, blob, glow, particles, smooth, lerp, clamp, ease, V } from './lib.js';
import { placa, camHud, hud } from './fx.js';
import { personagem, pose, toon, contorno, parede } from './toon.js';

const ALT = 1.8; // altura "cheia" do personagem em metros
const marcos = (o = {}) => personagem({ pele: 0xc98552, roupa: o.roupa ?? 0x2c3e66, calca: o.calca ?? 0x2c3e66, cabelo: 0x22150e, gravata: o.gravata === false ? null : (o.gravata ?? 0xc0392b), bigode: true, alca: o.alca });
const gabriel = () => personagem({ pele: 0xc98552, roupa: 0xf2c94c, calca: 0x4a6fa5, cabelo: 0x22150e, cabecao: 1.25 });
const altura = (p, m) => p.scale.setScalar(m / ALT);

// ---------- cenários ----------
function sala(ctx, o = {}) {
  const { scene } = studio(ctx, { top: '#2b2f3a', bottom: '#12141a', floor: false, keyI: o.keyI ?? 1.1, hemi: 0.45, rimColor: 0xffc078, rimI: 1.0, fillI: 0, envI: 0.18 });
  const tex = parede(o.cima ?? '#d9cfbd', o.baixo ?? '#6f8f7a', { corte: o.corte ?? 0.6 }); tex.repeat.set(2, 1);
  const fundo = new THREE.Mesh(new THREE.PlaneGeometry(10, 4.6), new THREE.MeshLambertMaterial({ map: tex })); fundo.position.set(0, 2.3, -2); fundo.receiveShadow = true; scene.add(fundo);
  const lat = new THREE.Mesh(new THREE.PlaneGeometry(6, 4.6), new THREE.MeshLambertMaterial({ map: tex })); lat.rotation.y = Math.PI / 2; lat.position.set(-4, 2.3, 1); lat.receiveShadow = true; scene.add(lat);
  const ctex = (() => { const c = document.createElement('canvas'); c.width = c.height = 512; const g = c.getContext('2d'); g.fillStyle = o.chao ?? '#8a6a4a'; g.fillRect(0, 0, 512, 512); g.strokeStyle = 'rgba(0,0,0,.18)'; for (let i = 0; i < 512; i += 64) { g.beginPath(); g.moveTo(0, i); g.lineTo(512, i); g.stroke(); } for (let i = 0; i < 1500; i++) { g.fillStyle = `rgba(0,0,0,${Math.random() * 0.05})`; g.fillRect(Math.random() * 512, Math.random() * 512, 3, 3); } const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(3, 3); return t; })();
  const chao = new THREE.Mesh(new THREE.PlaneGeometry(30, 30), new THREE.MeshLambertMaterial({ map: ctex })); ctex.repeat.set(9, 9); chao.rotation.x = -Math.PI / 2; chao.receiveShadow = true; scene.add(chao);
  // janela com luz quente e poeira
  const jx = o.janelaX ?? 1.6;
  const jan = new THREE.Mesh(new THREE.PlaneGeometry(1.3, 1.5), glow(0xffd8a8, 1.05)); jan.position.set(jx, 2.6, -1.98); scene.add(jan);
  for (const [w, h, x, y] of [[1.45, 0.08, 0, 0.78], [1.45, 0.08, 0, -0.78], [0.08, 1.6, 0.7, 0], [0.08, 1.6, -0.7, 0], [0.05, 1.5, 0, 0], [1.3, 0.05, 0, 0]]) { const b = new THREE.Mesh(new THREE.BoxGeometry(w, h, 0.06), toon(0x7a6a58)); b.position.set(jx + x, 2.6 + y, -1.95); scene.add(b); }
  const sol = new THREE.SpotLight(0xffc078, o.sol ?? 20, 14, 0.55, 0.6, 1.2); sol.position.set(jx, 2.8, -1.8); sol.target.position.set(jx - 1.2, 0, 2.2); sol.castShadow = true; sol.shadow.mapSize.set(1024, 1024); scene.add(sol, sol.target);
  const feixe = new THREE.Mesh(new THREE.ConeGeometry(1.0, 4.2, 32, 1, true), glow(0xffc078, 0.5, { opacity: 0.05, side: THREE.DoubleSide })); feixe.position.set(jx - 0.5, 1.6, 0); feixe.rotation.set(-0.9, 0, 0.3); scene.add(feixe);
  const poeira = particles(150, [jx - 2, 0.2, -1.6, 2.6, 2.8, 3], { color: 0xffe8cc, size: 0.025, rise: 0.04, opacity: 0.75 }); scene.add(poeira.points);
  return { scene, poeira };
}
function mesa(scene, x, z, o = {}) {
  const g = new THREE.Group(); g.position.set(x, 0, z); scene.add(g);
  const top = new THREE.Mesh(new THREE.BoxGeometry(o.w ?? 1.4, 0.08, o.d ?? 0.8), toon(o.cor ?? 0x9c6b43)); top.position.y = o.h ?? 0.78; contorno(top, 0.01); g.add(top);
  for (const [a, b] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) { const p = new THREE.Mesh(new THREE.BoxGeometry(0.07, o.h ?? 0.78, 0.07), toon(0x7a5232)); p.position.set(a * ((o.w ?? 1.4) / 2 - 0.08), (o.h ?? 0.78) / 2, b * ((o.d ?? 0.8) / 2 - 0.08)); g.add(p); }
  return g;
}
function cadeira(scene, x, z, ry = 0) {
  const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = ry; scene.add(g);
  const as = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.06, 0.46), toon(0xb07a4e)); as.position.y = 0.48; contorno(as, 0.015); g.add(as);
  const enc = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.55, 0.05), toon(0xb07a4e)); enc.position.set(0, 0.78, -0.21); contorno(enc, 0.015); g.add(enc);
  for (const [a, b] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) { const p = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.48, 0.05), toon(0x7a5232)); p.position.set(a * 0.2, 0.24, b * 0.19); g.add(p); }
  return g;
}
function carro(cor = 0xc0392b) {
  const g = new THREE.Group();
  const b = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.55, 1.1), toon(cor)); b.position.y = 0.5; contorno(b, 0.012); g.add(b);
  const t = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.45, 1.0), toon(cor)); t.position.set(-0.1, 0.98, 0); contorno(t, 0.015); g.add(t);
  const v = new THREE.Mesh(new THREE.BoxGeometry(1.24, 0.32, 1.02), toon(0x2b4a66)); v.position.set(-0.1, 1.0, 0); g.add(v);
  for (const [x, z] of [[-0.7, 0.55], [0.7, 0.55], [-0.7, -0.55], [0.7, -0.55]]) { const w = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.24, 0.16, 20), toon(0x222222)); w.rotation.x = Math.PI / 2; w.position.set(x, 0.24, z); g.add(w); }
  const farol = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.12, 0.25), glow(0xfff3bf, 1)); farol.position.set(1.11, 0.6, 0.35); g.add(farol); const f2 = farol.clone(); f2.position.z = -0.35; g.add(f2);
  return g;
}
function lado(t, rng) { return t; }

export default {
  // rua: gente de todos os tamanhos (regua = régua gigante na parede)
  rua(ctx) {
    const { scene } = studio(ctx, { top: '#f4a259', bottom: '#f6d6a8', floor: false, keyI: 1.6, hemi: 0.6, rimColor: 0xfff3bf, envI: 0.2 });
    const chao = new THREE.Mesh(new THREE.PlaneGeometry(30, 20), new THREE.MeshLambertMaterial({ color: 0x9a8f80 })); chao.rotation.x = -Math.PI / 2; chao.receiveShadow = true; scene.add(chao);
    const rng = ctx.rng;
    for (let i = 0; i < 8; i++) { const h = 3 + rng() * 3, w = 1.6 + rng() * 0.8; const b = new THREE.Mesh(new THREE.BoxGeometry(w, h, 1.4), new THREE.MeshLambertMaterial({ map: parede(['#e3c9a0', '#c9d6c2', '#d8b4a0', '#bfcde0'][i % 4], '#8a8a80', { corte: 0.85 }) })); b.position.set(-7 + i * 2.1, h / 2, -4); b.castShadow = true; scene.add(b);
      for (let y = 1; y < h - 0.6; y += 1.0) for (let x = -w / 2 + 0.4; x < w / 2 - 0.2; x += 0.6) { const j = new THREE.Mesh(new THREE.PlaneGeometry(0.32, 0.45), toon(0x3d5a73)); j.position.set(-7 + i * 2.1 + x, y, -3.29); scene.add(j); } }
    const gente = [], alts = [1.95, 1.2, 1.7, 0.9, 1.55, 2.05, 1.35];
    alts.forEach((a, i) => { const p = personagem({ pele: [0xc98552, 0xe0a882, 0x8d5524][i % 3], roupa: [0x2f6f8f, 0xc0392b, 0x6a994e, 0xf2c94c, 0x7b5ea7][i % 5], calca: 0x3d405b, cabelo: 0x22150e, estilo: i % 2 ? 'coque' : 'cachos' }); altura(p, a); p.position.set(-3 + i * 1.0, 0, -0.8 + (i % 2) * 0.9); p.rotation.y = (rng() - 0.5) * 1.2; scene.add(p); gente.push(p); });
    let regua = null;
    if (ctx.args.regua) { regua = new THREE.Group(); scene.add(regua); const r = new THREE.Mesh(new THREE.BoxGeometry(0.3, 2.4, 0.05), toon(0xf8f1e3)); r.position.set(-4.0, 1.2, 0.3); contorno(r, 0.02); regua.add(r); for (let k = 0; k <= 12; k++) { const m = new THREE.Mesh(new THREE.BoxGeometry(k % 2 ? 0.1 : 0.2, 0.015, 0.06), toon(0x2a1d17)); m.position.set(-4.05, k * 0.2, 0.33); regua.add(m); } }
    const titulo = ctx.shot.start < 3.2;
    return {
      scene, rig: { target: V(0, titulo ? 2.2 : 1.2, 0), dist: 9.2, pitch: 0.08, fov: 40 }, bloom: [0.3, 0.4, 0.85],
      update(t) { gente.forEach((p, i) => pose(p, t + i, { expr: i % 3 ? 'serio' : 'sorriso', bE: 0.15, bD: 0.15, olhar: [Math.sin(t + i), 0] })); }
    };
  },

  // alguém conta uma mentira e encolhe na hora
  encolhe(ctx) {
    const { scene, poeira } = sala(ctx, { cima: '#e2d4bd', baixo: '#7a9e9f' });
    const p = personagem({ pele: 0xe0a882, roupa: 0x6a994e, calca: 0x3d405b, cabelo: 0x5a3220, estilo: 'coque' }); scene.add(p);
    const puff = particles(80, [-0.6, 0, -0.6, 1.2, 2, 1.2], { color: 0xffffff, size: 0.12, rise: 0.4, opacity: 0.7 }); scene.add(puff.points);
    const cam = camHud(ctx, 38); scene.add(cam); const txt = hud(cam, '−1 CM', '#ff8787', 0.45, 0.6);
    return {
      scene, cam, rig: { target: V(0.2, 1.3, 0), dist: 5.2, pitch: 0.05, fov: 38 }, bloom: [0.3, 0.4, 0.85],
      update(t, d, k) {
        poeira.update(t); puff.update(t);
        const e = ease(smooth(0.25, 0.45, k)); altura(p, lerp(1.8, 1.45, e)); p.position.set(0, 0, 0);
        puff.points.visible = k > 0.25 && k < 0.7; txt.scale.setScalar(Math.max(0.001, ease(smooth(0.3, 0.45, k))));
        pose(p, t, { expr: k < 0.3 ? 'sorriso' : 'susto', bD: 0.3, olhar: k < 0.3 ? [0.5, 0] : [0, -1], cabX: k > 0.4 ? 0.2 : 0 });
      }
    };
  },

  // político pequenininho discursando em cima de um banquinho
  politico(ctx) {
    const { scene, poeira } = sala(ctx, { cima: '#d6cbb5', baixo: '#3f5f7a', janelaX: -1.2 });
    const palco = new THREE.Mesh(new THREE.BoxGeometry(4, 0.3, 2), toon(0x7a5232)); palco.position.set(0, 0.15, -0.6); contorno(palco, 0.01); scene.add(palco);
    const banco = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.32, 0.6, 20), toon(0xb07a4e)); banco.position.set(0.3, 0.6, -0.4); contorno(banco, 0.02); scene.add(banco);
    const pulp = new THREE.Mesh(new THREE.BoxGeometry(0.8, 1.15, 0.5), toon(0x3d5a73)); pulp.position.set(0.3, 0.88, 0.15); contorno(pulp, 0.015); scene.add(pulp);
    const mic = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.4, 8), toon(0x222222)); mic.position.set(0.3, 1.6, 0.25); mic.rotation.x = -0.5; scene.add(mic);
    const bandeira = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 0.6), toon(0x2f9e44, { side: THREE.DoubleSide })); bandeira.position.set(-1.4, 2.0, -1.5); scene.add(bandeira);
    const p = personagem({ pele: 0xe0a882, roupa: 0x2b2b2b, calca: 0x2b2b2b, cabelo: 0x9a9a9a, gravata: 0x1c7ed6 }); altura(p, 0.8); p.position.set(0.3, 0.9, -0.4); scene.add(p);
    return {
      scene, rig: { target: V(0.3, 1.35, 0), dist: 3.6, pitch: 0.05, fov: 38 }, bloom: [0.3, 0.4, 0.85],
      update(t) { poeira.update(t); pose(p, t, { expr: 'sorriso', bD: 1.2 + Math.sin(t * 4) * 0.4, bE: 0.3, olhar: [0, 0.2] }); p.userData.linha.scale.set(1, 1 + 0.6 * Math.abs(Math.sin(t * 9)), 1); }
    };
  },

  // criança quebra o vaso e encolhe na hora
  vaso(ctx) {
    const { scene, poeira } = sala(ctx, { cima: '#e8d8c3', baixo: '#a4806b' });
    const movel = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.8, 0.5), toon(0x8a5a3c)); movel.position.set(-0.9, 0.4, -1.4); contorno(movel, 0.01); scene.add(movel);
    const cacos = []; for (let i = 0; i < 9; i++) { const c = blob(0.08, toon(0x3b8ea5), { seed: i, noise: 0.35, seg: 10 }); c.userData.v = V((ctx.rng() - 0.5) * 1.6, 0, (ctx.rng() - 0.5) * 1.2); scene.add(c); cacos.push(c); }
    const vaso = blob(0.22, toon(0x3b8ea5), { seed: 2, noise: 0.05, stretch: V(0.8, 1.3, 0.8) }); scene.add(vaso);
    const k1 = personagem({ pele: 0xc98552, roupa: 0xe76f51, calca: 0x264653, cabelo: 0x22150e, cabecao: 1.25 }); scene.add(k1);
    const cam = camHud(ctx, 38); scene.add(cam); const txt = hud(cam, '"NÃO FUI EU"', '#ffffff', 0.5, 0.75);
    return {
      scene, cam, rig: { target: V(-0.2, 1.0, 0), dist: 5.0, pitch: 0.08, fov: 38 }, bloom: [0.3, 0.4, 0.85],
      update(t, d, k) {
        poeira.update(t);
        const cai = clamp(k / 0.25); vaso.position.set(-0.5, 0.95 - cai * cai * 0.85, -1.0); vaso.visible = k < 0.25; vaso.rotation.z = cai * 1.5;
        cacos.forEach(c => { const u = clamp((k - 0.25) * 5); c.visible = k >= 0.25; c.position.set(-0.5 + c.userData.v.x * u, 0.06, -1.0 + c.userData.v.z * u); });
        const e = ease(smooth(0.55, 0.75, k)); altura(k1, lerp(1.25, 0.85, e)); k1.position.set(0.5, 0, 0.2); k1.rotation.y = -0.4;
        txt.scale.setScalar(Math.max(0.001, ease(smooth(0.45, 0.55, k))));
        pose(k1, t, { expr: k < 0.5 ? 'susto' : e > 0.5 ? 'susto' : 'serio', bE: 0.4, bD: 0.4, olhar: [-0.8, -0.6] });
      }
    };
  },

  // gente que cresce e gente que some (some = um vai sumindo)
  cresce(ctx) {
    const some = !!ctx.args.some;
    const { scene, poeira } = sala(ctx, { cima: '#dfe7e0', baixo: '#5b7f95' });
    const a = personagem({ pele: 0x8d5524, roupa: 0xf2c94c, calca: 0x3d405b, cabelo: 0x22150e }); a.position.set(-0.75, 0, 0); scene.add(a);
    const b = personagem({ pele: 0xe0a882, roupa: 0x7b5ea7, calca: 0x3d405b, cabelo: 0x5a3220, estilo: 'coque' }); b.position.set(0.75, 0, 0); scene.add(b);
    const brilho = particles(70, [-1.4, 0.2, -0.4, 1.4, 3, 0.8], { color: 0xffe066, size: 0.05, rise: 0.6 }); scene.add(brilho.points);
    return {
      scene, rig: { target: V(0, 1.5, 0), dist: 6.4, pitch: 0.05, fov: 38 }, bloom: [0.35, 0.4, 0.8],
      update(t, d, k) {
        poeira.update(t); brilho.update(t);
        altura(a, 1.7 + ease(k) * 0.45); altura(b, some ? lerp(1.5, 0.45, ease(k)) : 1.5 - ease(k) * 0.3);
        pose(a, t, { expr: 'sorriso', bE: 0.2, bD: 0.2, olhar: [0.5, -0.3] }); pose(b, t, { expr: some ? 'susto' : 'preocupado', bE: 0.2, bD: 0.2, olhar: [-0.5, 0.4] });
      }
    };
  },

  // Marcos na régua: 1,80 → 1,40
  regua(ctx) {
    const enc = !!ctx.args.encolhe;
    const { scene, poeira } = sala(ctx, { cima: '#d9cfbd', baixo: '#4f7f86' });
    const r = new THREE.Group(); r.position.set(-0.55, 0, -1.9); scene.add(r);
    const fita = new THREE.Mesh(new THREE.BoxGeometry(0.34, 2.2, 0.03), toon(0xf8f1e3)); fita.position.y = 1.1; contorno(fita, 0.015); r.add(fita);
    for (let i = 0; i <= 22; i++) { const m = new THREE.Mesh(new THREE.BoxGeometry(i % 5 ? 0.1 : 0.22, 0.012, 0.04), toon(0x2a1d17)); m.position.set(-0.06, i * 0.1, 0.02); r.add(m); }
    const p = marcos(); p.position.set(0.15, 0, -1.4); scene.add(p);
    const marca = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.025, 0.05), glow(0xff6b6b, 1.2)); marca.position.set(-0.55, 0, -1.86); scene.add(marca);
    const cam = camHud(ctx, 38); scene.add(cam); const txt = hud(cam, '1,80 M', '#ffd43b', 0.5, 0.6);
    return {
      scene, cam, rig: { target: V(-0.15, 1.45, -1.4), dist: 5.6, pitch: 0.03, fov: 38 }, bloom: [0.3, 0.4, 0.85],
      update(t, d, k) {
        poeira.update(t);
        const e = enc ? ease(smooth(0.1, 0.8, k)) : 0; const h = lerp(1.8, 1.4, e); altura(p, h);
        marca.position.y = 2.2 * h / 1.8; // topo da cabeça
        txt.userData.set((h).toFixed(2).replace('.', ',') + ' M'); txt.scale.setScalar(Math.max(0.001, ease(smooth(0.05, 0.2, k))));
        pose(p, t, { expr: enc ? 'preocupado' : 'serio', bE: 0.1, bD: 0.1, olhar: [0, enc ? -0.6 : 0] });
      }
    };
  },

  // loja de carros: o melhor vendedor (trofeu = troféu brilhando)
  loja(ctx) {
    const trofeu = !!ctx.args.trofeu;
    const { scene, poeira } = sala(ctx, { cima: '#eef1f4', baixo: '#3f5f7a', chao: '#bfc6cc', janelaX: -1.6, sol: 14 });
    const c = carro(0xc0392b); c.position.set(0.3, 0, -0.6); c.rotation.y = -0.5; scene.add(c);
    const placaO = placa('OFERTA', '#ffd43b', 1.2); placaO.position.set(0.4, 3.1, -1.95); scene.add(placaO);
    const p = marcos(); altura(p, 1.62); p.position.set(-1.0, 0, 0.5); p.rotation.y = 0.5; scene.add(p);
    const cli = personagem({ pele: 0xe0a882, roupa: 0x6a994e, calca: 0x3d405b, cabelo: 0x5a3220, estilo: 'coque' }); altura(cli, 1.7); cli.position.set(0.0, 0, 1.0); cli.rotation.y = -0.9; scene.add(cli);
    const tr = new THREE.Group(); tr.position.set(-1.0, 2.25, 0.5); tr.visible = trofeu; scene.add(tr);
    const copa = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.08, 0.25, 20), toon(0xf2c94c, { emissive: 0x3a2a00 })); tr.add(copa); const base = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.08, 0.18), toon(0x7a5232)); base.position.y = -0.18; tr.add(base);
    const cam = camHud(ctx, 40); scene.add(cam); const txt = trofeu ? hud(cam, 'MELHOR VENDEDOR', '#ffd43b', 0.55, 0.95) : null;
    return {
      scene, cam, rig: { target: V(-0.2, 1.2, 0), dist: 7.4, pitch: 0.08, fov: 40 }, bloom: [0.3, 0.4, 0.85],
      update(t, d, k) {
        poeira.update(t); tr.rotation.y = t * 1.5;
        pose(p, t, { expr: 'sorriso', bD: 1.1 + Math.sin(t * 3) * 0.3, bE: 0.3, olhar: [0.8, 0] }); pose(cli, t, { expr: 'serio', olhar: [-0.5, 0] });
        if (txt) txt.scale.setScalar(Math.max(0.001, ease(smooth(0.1, 0.3, k))));
      }
    };
  },

  // demitido: saindo com a caixa
  demitido(ctx) {
    const { scene, poeira } = sala(ctx, { cima: '#e5e1d8', baixo: '#8a8f99', janelaX: 1.8, sol: 10, keyI: 0.8 });
    mesa(scene, -0.9, -1.2, { cor: 0x6b6b6b });
    const p = marcos(); altura(p, 1.55); p.position.set(0.4, 0, 0); p.rotation.y = -0.25; scene.add(p);
    const cx = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.35, 0.4), toon(0xc8a46a)); contorno(cx, 0.015); scene.add(cx);
    const planta = blob(0.12, toon(0x2f9e44), { seed: 3, noise: 0.3 }); scene.add(planta);
    const cam = camHud(ctx, 38); scene.add(cam); const txt = hud(cam, 'DEMITIDO', '#ff8787', 0.55, 0.65);
    return {
      scene, cam, rig: { target: V(0.1, 1.15, 0), dist: 5.2, pitch: 0.05, fov: 38 }, bloom: [0.25, 0.4, 0.9],
      update(t, d, k) {
        poeira.update(t);
        p.position.x = lerp(0.6, -0.1, k);
        pose(p, t, { expr: 'preocupado', bE: 0.9, bD: 0.9, bEx: -0.9, bDx: -0.9, olhar: [0, -0.8], cabX: 0.25 });
        const s = p.scale.x; cx.position.set(p.position.x, 1.0 * s + 0.05, 0.35 * s); planta.position.copy(cx.position).add(V(0.1, 0.25, 0));
        txt.scale.setScalar(Math.max(0.001, ease(smooth(0.05, 0.25, k))));
      }
    };
  },

  // casa: o Gabriel pergunta; mente = "foi ótimo" (encolhe um pouco); menor = altura atual
  casa(ctx) {
    const a = ctx.args;
    const { scene, poeira } = sala(ctx, { cima: '#e8dcc6', baixo: '#b5835a', janelaX: -1.4 });
    const sofa = blob(0.6, toon(0x4f6d7a), { seed: 2, noise: 0.03, stretch: V(2.0, 0.6, 0.8) }); sofa.position.set(1.6, 0.45, -1.4); scene.add(sofa);
    const m = marcos(); m.position.set(0.55, 0, 0); m.rotation.y = -0.5; scene.add(m);
    const g = gabriel(); g.position.set(-0.6, 0, 0.4); g.rotation.y = 0.7; scene.add(g);
    const cam = camHud(ctx, 38); scene.add(cam);
    const txt = a.pergunta ? hud(cam, '"COMO FOI O TRABALHO?"', '#ffffff', 0.52, 1.0) : a.mente ? hud(cam, '"FOI ÓTIMO."', '#ffffff', 0.52, 0.7) : null;
    const base = (a.menor ?? 1) * 1.55;
    return {
      scene, cam, rig: a.close ? { target: V(0.5, 1.5 * base / 1.55, 0), dist: 3.2, pitch: 0.03, yaw: -0.25, fov: 34 } : { target: V(0, 1.2, 0), dist: 5.6, pitch: 0.05, fov: 38 }, bloom: [0.3, 0.4, 0.85],
      update(t, d, k) {
        poeira.update(t);
        const e = a.mente ? ease(smooth(0.4, 0.7, k)) : 0; altura(m, base - e * 0.04);
        altura(g, 1.25);
        pose(m, t, { expr: a.mente ? 'sorriso' : 'serio', bE: 0.15, bD: 0.15, olhar: [-0.7, -0.3] });
        pose(g, t, { expr: 'sorriso', bE: 0.15, bD: a.pergunta ? 0.6 : 0.15, olhar: [0.6, 0.4] });
        if (txt) txt.scale.setScalar(Math.max(0.001, ease(smooth(0.05, 0.25, k))));
      }
    };
  },

  // praça: de terno no banco; dias = o sol passa e ele vai diminuindo
  praca(ctx) {
    const dias = !!ctx.args.dias;
    const { scene } = studio(ctx, { top: '#7aa6c2', bottom: '#f3d9b1', floor: false, keyI: 1.5, hemi: 0.6, rimColor: 0xffd8a8, envI: 0.2 });
    const chao = new THREE.Mesh(new THREE.PlaneGeometry(30, 20), new THREE.MeshLambertMaterial({ color: 0x8fa86b })); chao.rotation.x = -Math.PI / 2; chao.receiveShadow = true; scene.add(chao);
    const cam2 = new THREE.Mesh(new THREE.PlaneGeometry(30, 2.4), new THREE.MeshLambertMaterial({ color: 0xc9b99a })); cam2.rotation.x = -Math.PI / 2; cam2.position.set(0, 0.01, 1.4); scene.add(cam2);
    const banco = new THREE.Group(); scene.add(banco);
    const ass = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.12, 0.6), toon(0xbfbfbf)); ass.position.y = 0.5; contorno(ass, 0.01); banco.add(ass);
    const enc = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.55, 0.12), toon(0xbfbfbf)); enc.position.set(0, 0.85, -0.27); contorno(enc, 0.01); banco.add(enc);
    for (const x of [-0.9, 0.9]) { const p = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.5, 0.5), toon(0xa6a6a6)); p.position.set(x, 0.25, 0); banco.add(p); }
    const poste = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.06, 3.2, 10), toon(0x2b2b2b)); poste.position.set(-1.8, 1.6, -0.6); scene.add(poste);
    const lamp = new THREE.Mesh(new THREE.SphereGeometry(0.16, 14, 10), glow(0xfff3bf, 1)); lamp.position.set(-1.8, 3.25, -0.6); scene.add(lamp);
    for (let i = 0; i < 6; i++) { const tr = new THREE.Group(); const tc = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.14, 1.4, 8), toon(0x7a5232)); tc.position.y = 0.7; tr.add(tc); const cp = blob(0.8, toon([0x4f7f4f, 0x6a994e][i % 2]), { seed: i, noise: 0.2, freq: 4 }); cp.position.y = 1.9; tr.add(cp); tr.position.set(-6 + i * 2.4, 0, -4 - (i % 2)); scene.add(tr); }
    const p = marcos(); p.position.set(0.1, 0.05, 0.05); scene.add(p);
    const sol = new THREE.Mesh(new THREE.SphereGeometry(0.5, 20, 16), glow(0xffd8a8, 1.2)); scene.add(sol);
    const cam = camHud(ctx, 40); scene.add(cam); const txt = dias ? hud(cam, 'DIA 1', '#ffffff', 0.55, 0.5) : null;
    return {
      scene, cam, rig: { target: V(0, 1.1, 0), dist: 5.8, pitch: 0.06, fov: 40 }, bloom: [0.3, 0.4, 0.85],
      update(t, d, k) {
        const dia = dias ? Math.floor(k * 4) + 1 : 0;
        const fase = dias ? (k * 4) % 1 : 0.4;
        sol.position.set(lerp(-5, 5, fase), 4 + Math.sin(fase * Math.PI) * 2, -8);
        altura(p, dias ? 1.55 - dia * 0.015 : 1.55);
        // sentado
        const u = p.userData; u.pernas[-1].rotation.x = -1.45; u.pernas[1].rotation.x = -1.45; p.position.y = 0.55 - 0.95 * p.scale.x + 0.05;
        pose(p, t, { expr: 'preocupado', bE: 0.25, bD: 0.25, olhar: [0, -0.6], cabX: 0.2, pE: -1.45, pD: -1.45, inclina: 0.15 });
        if (txt) txt.userData.set('DIA ' + dia);
      }
    };
  },

  // em cima da cadeira para alcançar a pia (mesa = "a mesa que cresceu")
  pia(ctx) {
    const { scene, poeira } = sala(ctx, { cima: '#e6ddc8', baixo: '#7aa095', janelaX: 0.6 });
    const banc = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.92, 0.7), toon(0xd9d2c3)); banc.position.set(0.4, 0.46, -1.6); contorno(banc, 0.01); scene.add(banc);
    const tampo = new THREE.Mesh(new THREE.BoxGeometry(2.7, 0.06, 0.78), toon(0x8a8f99)); tampo.position.set(0.4, 0.95, -1.6); scene.add(tampo);
    const cuba = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.04, 0.45), toon(0x5c6370)); cuba.position.set(0.6, 0.985, -1.55); scene.add(cuba);
    const torn = new THREE.Mesh(new THREE.TorusGeometry(0.12, 0.025, 8, 16, Math.PI), toon(0xc0c0c0)); torn.position.set(0.6, 1.1, -1.85); scene.add(torn);
    const pratos = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.12, 20), toon(0xf8f9fa)); pratos.position.set(0.25, 1.04, -1.55); scene.add(pratos);
    cadeira(scene, 0.6, -0.95, Math.PI);
    const p = marcos({ gravata: false, roupa: 0xe0d8c8 }); altura(p, 1.05); p.position.set(0.6, 0.51, -1.0); p.rotation.y = Math.PI; scene.add(p);
    const g = gabriel(); altura(g, 1.15); g.position.set(-1.0, 0, 0.3); g.rotation.y = 0.9; scene.add(g);
    const cam = camHud(ctx, 38); scene.add(cam); const txt = ctx.args.mesa ? hud(cam, '"A MESA CRESCEU"', '#ffffff', 0.55, 0.9) : null;
    return {
      scene, cam, rig: { target: V(0, 1.15, -0.6), dist: 5.4, pitch: 0.05, yaw: 0.3, fov: 38 }, bloom: [0.3, 0.4, 0.85],
      update(t, d, k) {
        poeira.update(t);
        pose(p, t, { expr: 'serio', bE: 0.5, bD: 0.5, bEx: -1.0, bDx: -1.0 + Math.sin(t * 5) * 0.15, olhar: [0, -0.5] });
        pose(g, t, { expr: 'preocupado', olhar: [0.8, 0.2] });
        if (txt) { txt.scale.setScalar(Math.max(0.001, ease(smooth(0.1, 0.3, k)))); p.rotation.y = lerp(Math.PI, Math.PI - 2.4, ease(smooth(0.0, 0.3, k))); }
      }
    };
  },

  // frente a frente, do mesmo tamanho (close = 'gabriel' | 'marcos'; fala = conta a verdade)
  frente(ctx) {
    const a = ctx.args;
    const { scene, poeira } = sala(ctx, { cima: '#e8dcc6', baixo: '#b5835a', janelaX: 0.05, sol: 16 });
    const m = marcos({ gravata: false, roupa: 0xe0d8c8 }); altura(m, 1.15); m.position.set(0.55, 0, 0); m.rotation.y = -Math.PI / 2 + 0.25; scene.add(m);
    const g = gabriel(); altura(g, 1.15); g.position.set(-0.55, 0, 0); g.rotation.y = Math.PI / 2 - 0.25; scene.add(g);
    const cam = camHud(ctx, 36); scene.add(cam);
    const txt = a.close === 'gabriel' && !a.fala ? hud(cam, '"PAI, CÊ TÁ MENTINDO?"', '#ffffff', 0.55, 1.0) : a.fala ? hud(cam, 'A VERDADE', '#ffd43b', 0.55, 0.6) : null;
    const rig = a.close === 'gabriel' ? { target: V(-0.55, 1.05, 0), dist: 2.4, pitch: 0.0, yaw: 1.2, fov: 32 } : a.close === 'marcos' ? { target: V(0.55, 1.05, 0), dist: 2.4, pitch: 0.0, yaw: -1.2, fov: 32 } : { target: V(0, 1.0, 0), dist: 5.8, pitch: 0.03, fov: 36 };
    return {
      scene, cam, rig, bloom: [0.35, 0.45, 0.8],
      update(t, d, k) {
        poeira.update(t);
        pose(g, t, { expr: 'serio', bE: 0.1, bD: 0.1, olhar: [0, 0] });
        pose(m, t, { expr: a.fala ? (Math.sin(t * 9) > 0 ? 'preocupado' : 'serio') : 'preocupado', bE: 0.1, bD: 0.1, olhar: [0, a.fala ? -0.3 : 0] });
        if (a.fala) m.userData.linha.scale.set(1, 1 + 0.7 * Math.abs(Math.sin(t * 8)), 1);
        if (txt) txt.scale.setScalar(Math.max(0.001, ease(smooth(0.05, 0.25, k))));
      }
    };
  },

  // Marcos crescendo a cada verdade (regua = régua mostrando quase um palmo)
  cresce_marcos(ctx) {
    const { scene, poeira } = sala(ctx, { cima: '#e8dcc6', baixo: '#b5835a', janelaX: 0.05, sol: 30 });
    const m = marcos({ gravata: false, roupa: 0xe0d8c8 }); m.position.set(0.3, 0, 0); m.rotation.y = -0.35; scene.add(m);
    const g = gabriel(); altura(g, 1.15); g.position.set(-0.8, 0, 0.1); g.rotation.y = 0.6; scene.add(g);
    const brilho = particles(110, [-0.3, 0.1, -0.5, 1.2, 2.2, 1], { color: 0xffe066, size: 0.06, rise: 0.7 }); scene.add(brilho.points);
    const cam = camHud(ctx, 38); scene.add(cam);
    const txt = hud(cam, '+1 CM', '#69db7c', 0.55, 0.6);
    return {
      scene, cam, rig: { target: V(-0.2, 1.05, 0), dist: 4.6, pitch: 0.03, fov: 38 }, bloom: [0.4, 0.45, 0.75],
      update(t, d, k) {
        poeira.update(t); brilho.update(t);
        const pulsos = Math.floor(k * 5); const h = 1.15 + (pulsos + smooth(0, 0.3, (k * 5) % 1)) * 0.04; altura(m, ctx.args.regua ? 1.15 + ease(k) * 0.2 : h);
        txt.userData.set(ctx.args.regua ? 'QUASE UM PALMO' : '+' + (pulsos + 1) + ' CM'); txt.scale.setScalar(Math.max(0.001, 1 + 0.08 * Math.sin(k * 5 * Math.PI * 2)));
        pose(m, t, { expr: 'preocupado', bE: 0.15, bD: 0.15, olhar: [-0.6, -0.2] }); pose(g, t, { expr: 'serio', olhar: [0.6, 0.3] });
      }
    };
  },

  abraco(ctx) {
    const close = !!ctx.args.close;
    const { scene, poeira } = sala(ctx, { cima: '#e8dcc6', baixo: '#b5835a', janelaX: 0.0, sol: 32 });
    const m = marcos({ gravata: false, roupa: 0xe0d8c8 }); altura(m, 1.4); m.position.set(0.18, 0, 0); m.rotation.y = -Math.PI / 2 + 0.4; scene.add(m);
    const g = gabriel(); altura(g, 1.15); g.position.set(-0.2, 0, 0.05); g.rotation.y = Math.PI / 2 - 0.4; scene.add(g);
    const coracoes = particles(30, [-0.5, 1.2, -0.3, 1, 1, 0.6], { color: 0xff8fab, size: 0.09, rise: 0.4 }); scene.add(coracoes.points);
    const cam = camHud(ctx, 36); scene.add(cam); const txt = close ? hud(cam, '"PREFIRO UM PAI QUE NÃO SOME"', '#ffffff', 0.55, 1.05) : null;
    return {
      scene, cam, rig: close ? { target: V(0, 1.15, 0), dist: 2.8, pitch: 0.02, yaw: 0.4, fov: 34 } : { target: V(0, 1.0, 0), dist: 4.4, pitch: 0.05, fov: 36 }, bloom: [0.4, 0.45, 0.75],
      update(t, d, k) {
        poeira.update(t); coracoes.update(t);
        pose(m, t, { expr: 'sorriso', bE: 0.9, bD: 0.9, bEx: -1.3, bDx: -1.3, olhar: [0, -0.4], cabX: 0.15 });
        pose(g, t, { expr: 'sorriso', bE: 1.0, bD: 1.0, bEx: -1.4, bDx: -1.4, olhar: [0, 0.6] });
        if (txt) txt.scale.setScalar(Math.max(0.001, ease(smooth(0.05, 0.25, k))));
      }
    };
  },

  // oficina: Marcos consertando carro; olha = o Gabriel olha pra cima
  oficina(ctx) {
    const olha = !!ctx.args.olha;
    const { scene, poeira } = sala(ctx, { cima: '#cfc6b4', baixo: '#5c6370', chao: '#6b6b6b', janelaX: 2.0, sol: 22 });
    const c = carro(0x1c7ed6); c.position.set(-0.2, 0, -1.0); c.rotation.y = 0.15; scene.add(c);
    const capo = new THREE.Mesh(new THREE.BoxGeometry(0.75, 0.05, 1.0), toon(0x1c7ed6)); capo.position.set(0.95, 1.15, -0.85); capo.rotation.z = 1.0; scene.add(capo);
    for (let i = 0; i < 5; i++) { const f = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.4, 0.02), toon(0x5c5c5c)); f.position.set(-2.4 + i * 0.25, 2.2, -1.97); scene.add(f); }
    const m = marcos({ gravata: false, roupa: 0x2f5d8a, calca: 0x2f5d8a, alca: 0x24476b }); altura(m, 1.6); m.position.set(1.15, 0, -0.2); m.rotation.y = -1.0; scene.add(m);
    const g = gabriel(); altura(g, 1.15); g.position.set(0.3, 0, 0.6); g.rotation.y = 0.5; scene.add(g);
    const titulo = ctx.shot.beat === 9 && ctx.args.olha && ctx.shot.camera === 'pull_out';
    const cam = camHud(ctx, 38); scene.add(cam); const txt = olha && !titulo ? hud(cam, '"PAI, VOCÊ TÁ ENORME"', '#ffffff', 0.55, 1.0) : null;
    return {
      scene, cam, rig: olha ? { target: V(0.7, titulo ? 1.9 : 1.2, 0), dist: 5.0, pitch: 0.05, yaw: -0.2, fov: 38 } : { target: V(0.3, 1.1, -0.3), dist: 6.0, pitch: 0.08, fov: 38 }, bloom: [0.3, 0.4, 0.85],
      update(t, d, k) {
        poeira.update(t);
        if (olha) { m.rotation.y = lerp(-1.0, -0.4, ease(smooth(0, 0.4, k))); pose(m, t, { expr: 'sorriso', bE: 0.15, bD: 0.15, olhar: [-0.6, -0.7], cabX: 0.2 }); }
        else pose(m, t, { expr: 'serio', bD: 0.5, bDx: -1.3 + Math.sin(t * 6) * 0.2, bE: 0.3, bEx: -0.8, inclina: 0.35, olhar: [0, -1] });
        pose(g, t, { expr: 'sorriso', olhar: [0.6, 1], cabX: olha ? -0.35 : 0, bE: 0.15, bD: 0.15 });
        if (txt) txt.scale.setScalar(Math.max(0.001, ease(smooth(0.05, 0.25, k))));
      }
    };
  },
};

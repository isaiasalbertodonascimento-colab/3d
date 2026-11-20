// Cenas: "Apertei o botão que parava o tempo"
import * as THREE from 'three';
import { studio, blob, glow, particles, smooth, lerp, clamp, ease, V, mulberry } from './lib.js';
import { personagem, pose, tingir } from './vetor2.js';
import { praca, sotao, pombo } from './ambiente.js';
import { aneis } from './cenarios.js';
import { camHud, hud } from './fx.js';

const lia = () => personagem({ pele: 0xd99a6c, roupa: 0x2a9d8f, calca: 0x3d405b, cabelo: 0x2b1a12, cabeloEstilo: 'rabo', sapato: 0xf1f1f1 });
const avo = () => personagem({ pele: 0xe8b08a, roupa: 0x8a5a3a, calca: 0x5a5048, cabelo: 0xdedede, cabeloEstilo: 'careca', barba: 0xeeeeee, sobrancelha: 0xcfcfcf, oculos: true, mangaLonga: true });
const menino = () => personagem({ pele: 0xc98552, roupa: 0xe63946, calca: 0x264653, cabelo: 0x22150e });
const ouro = () => new THREE.MeshStandardMaterial({ color: 0xd4a03a, metalness: 0.8, roughness: 0.3 });

// relógio de bolso
function relogio(esc = 1) {
  const g = new THREE.Group(); g.scale.setScalar(esc);
  const caixa = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 0.14, 48), ouro()); caixa.rotation.x = Math.PI / 2; g.add(caixa);
  const aro = new THREE.Mesh(new THREE.TorusGeometry(0.5, 0.045, 12, 48), ouro()); g.add(aro);
  const face = new THREE.Mesh(new THREE.CircleGeometry(0.43, 48), new THREE.MeshStandardMaterial({ color: 0xf6ecd6, roughness: 0.6 })); face.position.z = 0.072; g.add(face);
  for (let i = 0; i < 12; i++) { const m = new THREE.Mesh(new THREE.BoxGeometry(0.02, i % 3 ? 0.05 : 0.09, 0.01), new THREE.MeshBasicMaterial({ color: 0x2a1d17 })); const a = i / 12 * 6.283; m.position.set(Math.sin(a) * 0.36, Math.cos(a) * 0.36, 0.075); m.rotation.z = -a; g.add(m); }
  const pont = (c, w, cor) => { const p = new THREE.Group(); const m = new THREE.Mesh(new THREE.BoxGeometry(w, c, 0.01), new THREE.MeshBasicMaterial({ color: cor })); m.position.y = c / 2; p.add(m); p.position.z = 0.08; g.add(p); return p; };
  const hora = pont(0.2, 0.025, 0x2a1d17), min = pont(0.3, 0.018, 0x2a1d17), seg = pont(0.34, 0.01, 0xc0392b);
  const coroa = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.1, 16), ouro()); coroa.position.y = 0.57; g.add(coroa);
  const botao = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.08, 16), new THREE.MeshStandardMaterial({ color: 0xc0392b, roughness: 0.4 })); botao.position.y = 0.65; g.add(botao);
  const argola = new THREE.Mesh(new THREE.TorusGeometry(0.08, 0.018, 8, 20), ouro()); argola.position.y = 0.74; g.add(argola);
  g.userData = { hora, min, seg, botao };
  return g;
}
// onda de choque do tempo parando (anel ciano no chão)
function onda(scene) { const a = new THREE.Mesh(new THREE.TorusGeometry(1, 0.05, 8, 96), glow(0x7ee8fa, 2, { opacity: 1 })); a.rotation.x = Math.PI / 2; a.material.depthWrite = false; scene.add(a); return a; }

export default {
  // sótão: o avô entrega o relógio (avo = close no avô falando)
  sotao(ctx) {
    const a = ctx.args, amb = sotao(ctx), s = amb.scene;
    const v = avo(); v.position.set(0.9, 0.02, -0.6); v.rotation.y = -0.5 - Math.PI * 0; s.add(v);
    const l = lia(); l.position.set(-0.5, 0, 0.5); l.rotation.y = 0.9; s.add(l);
    const rel = relogio(0.22); s.add(rel);
    const rig = a.close ? { target: V(0.85, 1.2, -0.5), dist: 3.1, pitch: 0.02, yaw: -0.35, fov: 32 } : { target: V(0.2, 1.3, 0), dist: 5.4, pitch: 0.06, yaw: 0.15, fov: 38 };
    return {
      scene: s, rig, bloom: [0.4, 0.45, 0.75], dof: a.close ? 0.012 : 0.004,
      update(t, d, k) {
        amb.update(t);
        pose(v, t, { acao: 'sentado', expr: a.close ? 'triste' : 'neutro', fala: a.close, olhar: [-0.6, 0.2], braco: a.close ? null : [-1, -1.0 - ease(smooth(0, 0.5, k)) * 0.3, 0.2, -0.4] });
        v.position.y = 0.0;
        const mao = new THREE.Vector3(); v.userData.maos[-1].getWorldPosition(mao);
        rel.position.copy(mao).add(V(0, 0.05, 0.05)); rel.rotation.y = -0.5 + Math.sin(t) * 0.1;
        pose(l, t, { acao: 'parado', expr: 'surpresa', olhar: [0.8, -0.2], braco: [1, -1.1, 0.1, -0.5] });
      }
    };
  },
  // close no relógio (aperta = dedo aperta o botão; escuro = tudo escuro em volta)
  relogio(ctx) {
    const a = ctx.args;
    const r = studio(ctx, { top: a.escuro ? '#050507' : '#3a2a1e', bottom: a.escuro ? '#000000' : '#120c08', floor: false, keyColor: 0xffd29a, keyI: a.escuro ? 0.4 : 2.2, keyPos: [2, 3, 3], hemi: a.escuro ? 0.05 : 0.5, rimColor: 0x7ee8fa, rimI: a.escuro ? 1.2 : 1.6, envI: a.escuro ? 0.1 : 0.6 });
    const s = r.scene;
    const rel = relogio(1.6); rel.position.set(0, 0.15, 0); s.add(rel);
    const pele = new THREE.MeshBasicMaterial({ color: 0xd99a6c });
    const dedo = new THREE.Mesh(new THREE.CapsuleGeometry(0.13, 0.5, 6, 12), pele); s.add(dedo);
    const palma = new THREE.Mesh(new THREE.SphereGeometry(0.7, 20, 16), pele); palma.scale.set(1.2, 0.9, 0.45); palma.position.set(0, -0.6, -0.35); s.add(palma);
    const poeira = particles(80, [-2, -1.5, -1, 4, 4, 2], { color: 0xffe2b0, size: 0.03, rise: 0.05 }); s.add(poeira.points);
    const choque = aneis(s, 5, 0x7ee8fa); choque.g.position.set(0, 1.25, 0.2);
    return {
      scene: s, rig: { target: V(0, 0.75, 0), dist: 4.6, pitch: 0.05, fov: 34 }, bloom: [0.5, 0.45, 0.65], dof: 0.006, desat: a.escuro ? 0.6 : 0,
      update(t, d, k) {
        poeira.update(t);
        const tt = a.aperta && !a.escuro ? (k < 0.35 ? t : 0.35 * d) : t; // os ponteiros param quando aperta
        const u = rel.userData; u.seg.rotation.z = -tt * 6.283 / 2; u.min.rotation.z = -1 - tt * 0.2; u.hora.rotation.z = -2.2;
        const ap = a.aperta ? ease(smooth(0.15, 0.32, k)) * (1 - (a.escuro ? smooth(0.45, 0.6, k) : 0)) : 0;
        dedo.position.set(0.05, 1.95 - ap * 0.28 + (1 - smooth(0, 0.15, k)) * 0.4, 0.15); dedo.rotation.z = 0.1;
        u.botao.position.y = 0.65 - ap * 0.04;
        choque.update(t, a.aperta && !a.escuro ? smooth(0.32, 0.4, k) * (1 - smooth(0.85, 1, k)) : 0);
        rel.rotation.set(Math.sin(t * 0.6) * 0.06, Math.sin(t * 0.4) * 0.12, 0);
      }
    };
  },
  // a praça (tudo que acontece depois que o tempo para)
  praca(ctx) {
    const a = ctx.args.acao, amb = praca(ctx), s = amb.scene;
    amb.atualizarAgua(1.37); // água congelada no mesmo instante em todas as cenas
    const l = lia(); s.add(l);
    const m = menino(); m.scale.setScalar(0.72); m.position.set(-1.4, 0.75, -2.8); m.rotation.y = 0.6; s.add(m);
    const bola = new THREE.Mesh(new THREE.SphereGeometry(0.16, 20, 16), new THREE.MeshStandardMaterial({ color: 0xffd43b, roughness: 0.5 })); bola.castShadow = true; bola.position.set(-0.55, 2.35, -3.0); s.add(bola);
    const pombos = []; const rng = mulberry(12);
    for (let i = 0; i < 7; i++) { const p = pombo(s); p.g.position.set(-2 + rng() * 4, 1.4 + rng() * 1.6, -4.5 + rng() * 3); p.g.rotation.set(-0.3, rng() * 6, 0); if (p.g.position.distanceTo(V(-1.4, 1.6, -2.8)) < 1.4) p.g.position.x += 2.6; pombos.push(p); }
    // folhas paradas no ar
    const folhasAr = []; for (let i = 0; i < 16; i++) { const f = new THREE.Mesh(new THREE.PlaneGeometry(0.12, 0.08), new THREE.MeshStandardMaterial({ color: [0xd98a3a, 0xc0662b, 0xe0a040][i % 3], side: THREE.DoubleSide })); f.position.set(-3 + rng() * 6, 0.5 + rng() * 2.5, -5 + rng() * 5); f.rotation.set(rng() * 3, rng() * 3, rng() * 3); s.add(f); folhasAr.push(f); }
    const parede = new THREE.Mesh(new THREE.CircleGeometry(0.9, 48), new THREE.MeshBasicMaterial({ color: new THREE.Color(0x7ee8fa).multiplyScalar(1.3), transparent: true, opacity: 0, toneMapped: false, depthWrite: false, side: THREE.DoubleSide })); s.add(parede);
    const ondas = [0, 1, 2].map(() => { const r = new THREE.Mesh(new THREE.RingGeometry(0.2, 0.24, 48), new THREE.MeshBasicMaterial({ color: new THREE.Color(0x7ee8fa).multiplyScalar(1.6), transparent: true, opacity: 0, toneMapped: false, depthWrite: false, side: THREE.DoubleSide })); s.add(r); return r; });
    const choque = onda(s);
    const cfg = {
      parou: { rig: { target: V(0, 2.1, -1), dist: 6.5, pitch: 0.12, fov: 40 }, lia: [0, 0, 1], dof: 0.003 },
      parado_wide: { rig: { target: V(0, 1.6, -4), dist: 11, pitch: 0.12, yaw: 0.2, fov: 42 }, lia: [0.6, 0, 1.6], dof: 0.0015 },
      pombos: { rig: { target: V(-0.2, 2.1, -3), dist: 5.6, pitch: -0.08, yaw: 0.3, fov: 36 }, lia: [0.8, 0, -1.5], dof: 0.01 },
      fonte: { rig: { target: V(0, 1.5, -6), dist: 6.2, pitch: 0.15, fov: 38 }, lia: [1.8, 0, -3.6], dof: 0.004 },
      gotas: { rig: { target: V(0.95, 1.75, -5.6), dist: 1.8, pitch: 0.05, yaw: -0.4, fov: 32 }, lia: [1.75, 0, -4.9], dof: 0.02 },
      menino: { rig: { target: V(-1.2, 1.5, -2.6), dist: 4.6, pitch: 0.05, yaw: 0.8, fov: 38 }, lia: [0.3, 0, -3.0], dof: 0.006 },
      corre: { rig: { target: V(0, 1.2, 0), dist: 6.0, pitch: 0.08, yaw: -0.9, fov: 40 }, lia: [0, 0, 0], dof: 0.004 },
      pula: { rig: { target: V(0, 1.5, 0.5), dist: 5.2, pitch: 0.05, yaw: 0.4, fov: 40 }, lia: [0, 0, 0.5], dof: 0.004 },
      anda: { rig: { target: V(2.5, 1.3, -0.5), dist: 5.4, pitch: 0.08, yaw: Math.PI - 0.35, fov: 38 }, lia: [2.5, 0, 0], dof: 0.004 },
      bate: { rig: { target: V(0, 1.3, -0.5), dist: 5.4, pitch: 0.05, yaw: Math.PI - 0.75, fov: 38 }, lia: [0, 0, 0], dof: 0.005 },
      empurra: { rig: { target: V(0, 1.3, -0.35), dist: 5.0, pitch: 0.05, yaw: Math.PI - 0.6, fov: 38 }, lia: [0, 0, 0], dof: 0.005 },
    }[a];
    l.position.set(...cfg.lia); l.rotation.y = a === 'corre' ? Math.PI / 2 : a === 'gotas' ? -2.4 : a === 'pombos' ? Math.PI * 0.85 : a === 'menino' ? -1.45 : a === 'fonte' ? -2.0 : Math.PI;
    return {
      scene: s, rig: cfg.rig, bloom: [0.35, 0.45, 0.8], dof: cfg.dof, desat: a === 'parou' ? 0 : 0.42,
      update(t, d, k) {
        const congelou = a !== 'parou' || k > 0.35;
        amb.update(t, congelou);
        // pombos voando até a onda passar
        pombos.forEach((p, i) => { p.bater(congelou ? 0.3 + i : t + i, congelou); if (!congelou) p.g.position.y += Math.sin(t * 3 + i) * 0.003; });
        if (!congelou) amb.atualizarAgua(t * 1.0 + 1.0); else if (a === 'parou') amb.atualizarAgua(1.0 + 0.35 * d);
        pose(m, 0.6, { acao: 'congelado', expr: 'risada' });
        // onda de choque
        choque.visible = a === 'parou'; if (a === 'parou') { const q = smooth(0.25, 0.65, k); choque.scale.setScalar(0.3 + q * 18); choque.position.set(0, 0.1, 1); choque.material.opacity = 1 - q; }
        parede.material.opacity = 0; ondas.forEach(o => o.material.opacity = 0);
        if (a === 'parou') { pose(l, t, { acao: 'botao', expr: k < 0.3 ? 'concentrado' : 'surpresa', k: k * 2 }); }
        else if (a === 'parado_wide' || a === 'fonte') { pose(l, t, { acao: 'parado', expr: 'surpresa', olhar: [Math.sin(t * 1.5), 0.4], cab: [-0.15, Math.sin(t) * 0.4, 0] }); }
        else if (a === 'pombos') { l.position.z = cfg.lia[2] - k * 0.6; pose(l, t, { acao: 'andar', vel: 4, expr: 'surpresa', cab: [-0.35, 0, 0], olhar: [0, 1] }); }
        else if (a === 'gotas') { pose(l, t, { acao: 'parado', expr: 'surpresa', braco: [1, -1.35, 0.15, -0.2 - smooth(0.2, 0.6, k) * 0.15], olhar: [0.6, 0.3] }); }
        else if (a === 'menino') { pose(l, t, { acao: 'parado', expr: 'risada', braco: [1, -1.3, 0.1, -0.6], cab: [0, 0.2, 0.1] }); }
        else if (a === 'corre') { l.position.x = lerp(-2.5, 2.5, k); pose(l, t, { acao: 'correr', expr: 'risada' }); }
        else if (a === 'pula') { const kk = (k * 1.3) % 1; l.position.y = Math.sin(clamp((kk - 0.3) / 0.5) * Math.PI) * 0.9; pose(l, t, { acao: 'pular', k: kk, expr: kk > 0.3 && kk < 0.85 ? 'risada' : 'feliz' }); }
        else if (a === 'anda') { const lento = 1 - smooth(0.5, 1, k); l.position.x = 2.5; l.position.z = -k * 1.0 * lento - 0.3 * (1 - lento); pose(l, t, { acao: 'andar', vel: 7 * (0.3 + lento * 0.7), expr: k > 0.6 ? 'medo' : 'feliz' }); }
        else if (a === 'bate' || a === 'empurra') {
          const bate = a === 'bate' ? smooth(0.15, 0.25, k) : 1;
          l.position.z = a === 'bate' ? (k < 0.22 ? -k * 1.5 : -0.33 + smooth(0.22, 0.4, k) * 0.25) : -0.1;
          pose(l, t, { acao: a === 'bate' && k < 0.22 ? 'andar' : 'empurrar', expr: a === 'bate' ? (k < 0.25 ? 'feliz' : 'surpresa') : 'raiva' });
          const pm = new THREE.Vector3(); l.userData.maos[1].getWorldPosition(pm);
          parede.position.set(0, 1.35, l.position.z - 0.55); parede.rotation.set(0, 0, 0); parede.material.opacity = (a === 'bate' ? (1 - smooth(0.25, 0.7, k)) * bate : 0.18 + 0.08 * Math.sin(t * 9)) * 0.35;
          ondas.forEach((o, i) => { const c = ((t * 1.2) + i / 3) % 1; o.position.set(0, 1.35, l.position.z - 0.54); o.scale.setScalar(0.5 + c * 4); o.material.opacity = (1 - c) * 0.8 * (a === 'bate' ? bate * (1 - smooth(0.4, 0.8, k)) : 1); });
        }
      }
    };
  },
  // close no rosto da Lia na praça congelada
  rosto(ctx) {
    const a = ctx.args, amb = praca(ctx, { grama: 4000 }), s = amb.scene; amb.atualizarAgua(1.37);
    const l = lia(); l.position.set(0, 0, 1.5); s.add(l);
    return {
      scene: s, rig: { target: V(0, 1.42, 1.5), dist: 3.9, pitch: 0.02, yaw: 0.12, fov: 32 }, bloom: [0.35, 0.45, 0.8], dof: 0.018, maxblur: 0.016, desat: 0.42,
      update(t, d, k) { amb.update(t, true); pose(l, t, { acao: a.acao === 'empurrar' ? 'empurrar' : a.acao, expr: a.expr, olhar: [Math.sin(t * 2) * 0.3, 0.1], balanca: a.expr === 'risada' }); }
    };
  },
  // didático: moléculas de ar, luz e som (normais x tempo parado)
  ciencia(ctx) {
    const modo = ctx.args.modo;
    const r = studio(ctx, { top: '#0a1a2e', bottom: '#020509', floor: false, keyI: 0.8, hemi: 0.4, rimColor: 0x7ee8fa, envI: 0.3 }); const s = r.scene;
    const grid = new THREE.GridHelper(20, 40, 0x1e5a7a, 0x123548); grid.position.y = -1.2; s.add(grid);
    const parado = modo.endsWith('parado') || modo === 'luz_parada';
    const cam = camHud(ctx, 38); s.add(cam);
    const rot = { ar: 'MOLÉCULAS DE AR', ar_parado: 'TEMPO PARADO', luz: 'LUZ', luz_parada: 'LUZ PARADA', som: 'SOM = AR VIBRANDO' }[modo];
    const txt = hud(cam, rot, parado ? '#7ee8fa' : '#ffc83a', 0.8, 0.95);
    let upd = () => {};
    if (modo.startsWith('ar')) {
      const n = 140, mol = [], rng = mulberry(3);
      const mat = new THREE.MeshStandardMaterial({ color: 0x5ab0ff, roughness: 0.3, emissive: 0x0a2a4a });
      for (let i = 0; i < n; i++) { const o = new THREE.Mesh(new THREE.SphereGeometry(0.07, 12, 10), mat); const p = V(-2 + rng() * 4, -0.8 + rng() * 3, -1.5 + rng() * 3); o.userData = { p, v: V(rng() - 0.5, rng() - 0.5, rng() - 0.5).normalize().multiplyScalar(0.8 + rng()) }; o.position.copy(p); s.add(o); mol.push(o); }
      let mao = null; if (ctx.args.mao) { mao = new THREE.Mesh(new THREE.SphereGeometry(0.35, 20, 16), new THREE.MeshBasicMaterial({ color: 0xd99a6c })); mao.scale.set(1, 1.2, 0.5); s.add(mao); }
      const lig = new THREE.LineSegments(new THREE.BufferGeometry(), new THREE.LineBasicMaterial({ color: new THREE.Color(0x7ee8fa).multiplyScalar(1.4), transparent: true, opacity: 0.4, toneMapped: false })); s.add(lig);
      if (parado) { const pts = []; mol.forEach((a2, i) => mol.forEach((b2, j) => { if (j > i && a2.position.distanceTo(b2.position) < 0.55) pts.push(a2.position.clone(), b2.position.clone()); })); lig.geometry.setFromPoints(pts); }
      upd = (t, k) => { if (!parado) mol.forEach(o => { const p = o.userData.p.clone().addScaledVector(o.userData.v, t); ['x', 'y', 'z'].forEach((ax, i) => { const lo = [-2, -0.8, -1.5][i], hi = [2, 2.2, 1.5][i], w = hi - lo; let q = ((p[ax] - lo) % (2 * w) + 2 * w) % (2 * w); p[ax] = lo + (q > w ? 2 * w - q : q); }); o.position.copy(p); }); if (mao) { mao.position.set(lerp(3, 2.15, ease(smooth(0, 0.4, k))) + Math.sin(t * 25) * 0.01, 0.7, 0); } };
    } else if (modo.startsWith('luz')) {
      const lamp = new THREE.Mesh(new THREE.SphereGeometry(0.35, 24, 18), glow(0xffe08a, 1.8)); lamp.position.set(-2, 0.8, 0); s.add(lamp);
      const olho = new THREE.Group(); olho.position.set(2, 0.8, 0); s.add(olho);
      const bran = new THREE.Mesh(new THREE.SphereGeometry(0.4, 24, 18), new THREE.MeshStandardMaterial({ color: 0xf8f9fa, roughness: 0.3 })); olho.add(bran);
      const iris = new THREE.Mesh(new THREE.SphereGeometry(0.17, 20, 16), new THREE.MeshStandardMaterial({ color: parado ? 0x222222 : 0x2a9d8f })); iris.position.x = -0.3; iris.scale.x = 0.4; olho.add(iris);
      const fot = []; for (let i = 0; i < 14; i++) { const f = new THREE.Mesh(new THREE.CapsuleGeometry(0.03, 0.22, 4, 8), glow(0xffe08a, 2)); f.rotation.z = Math.PI / 2; f.userData = { y: (i % 5 - 2) * 0.12, ph: i / 14 }; s.add(f); fot.push(f); }
      upd = (t) => { fot.forEach(f => { const u = parado ? f.userData.ph * 0.8 + 0.05 : (t * 0.8 + f.userData.ph) % 1; f.position.set(lerp(-1.6, 1.6, u), 0.8 + f.userData.y, 0); }); bran.material.emissive = new THREE.Color(parado ? 0x000000 : 0x332a10); };
    } else {
      const caixa = new THREE.Mesh(new THREE.BoxGeometry(0.8, 1.1, 0.6), new THREE.MeshStandardMaterial({ color: 0x2b2f3a, roughness: 0.5 })); caixa.position.set(-1.8, 0.4, 0); s.add(caixa);
      const cone = new THREE.Mesh(new THREE.CircleGeometry(0.28, 24), new THREE.MeshStandardMaterial({ color: 0x111111 })); cone.position.set(-1.39, 0.5, 0); cone.rotation.y = Math.PI / 2; s.add(cone);
      const an = [0, 1, 2, 3].map(() => { const r2 = new THREE.Mesh(new THREE.TorusGeometry(0.4, 0.025, 8, 40, Math.PI), glow(0x7ee8fa, 1.6, { opacity: 1 })); r2.rotation.set(0, Math.PI / 2, -Math.PI / 2); r2.material.depthWrite = false; s.add(r2); return r2; });
      const xis = hud(cam, 'SEM AR SE MEXENDO = SEM SOM', '#ffffff', -0.6, 0.95); xis.scale.setScalar(0.001);
      upd = (t, k) => { const para = smooth(0.45, 0.55, k); an.forEach((r2, i) => { const c = ((para > 0.5 ? 0.5 * d0 : t) * 0.7 + i / 4) % 1; r2.position.set(-1.3 + c * 3, 0.5, 0); r2.scale.setScalar(0.6 + c * 2); r2.material.opacity = (1 - c) * (1 - para * 0.85); }); xis.scale.setScalar(Math.max(0.001, para)); };
      var d0 = 0;
    }
    return {
      scene: s, cam, rig: { target: V(0, 0.65, 0), dist: 6.8, pitch: 0.15, fov: 38 }, bloom: [0.5, 0.45, 0.6], dof: 0.002, desat: parado ? 0.3 : 0,
      update(t, d, k) { upd(t, k); txt.scale.setScalar(Math.max(0.001, ease(smooth(0.05, 0.25, k)))); }
    };
  },
  // no escuro: cega, silêncio, nada, a mão no ombro, a figura
  escuro(ctx) {
    const a = ctx.args;
    const r = studio(ctx, { top: '#030306', bottom: '#000000', floor: false, keyColor: 0x7ee8fa, keyI: a.ombro || a.figura ? 0.7 : 0.25, keyPos: [-2, 3, -2], hemi: 0.05, rimColor: 0x7ee8fa, rimI: a.ombro || a.figura ? 2.4 : 0.6, envI: 0.05 }); const s = r.scene;
    const l = lia(); l.position.set(0, 0, 0); s.add(l); tingir(l, 0x3a5a7a, a.cega ? 0.55 : 0.8);
    const outro = personagem({ pele: 0x1a1420, roupa: 0x14101c, calca: 0x14101c, cabelo: 0x0c0a10, cabeloEstilo: 'curto', mangaLonga: true });
    outro.position.set(0.35, 0, -0.75); outro.visible = !!(a.ombro || a.figura); s.add(outro);
    outro.userData.olhos.forEach(o => { o.material = glow(0x7ee8fa, 2.5); });
    outro.traverse(o => { if (o.isMesh && o.material?.color && o.material.color.getHex() === 0xf08a8a) o.visible = false; });
    const relO = relogio(0.18); s.add(relO); relO.visible = !!a.figura;
    const brilhoR = new THREE.PointLight(0x7ee8fa, a.figura ? 4 : 0, 4, 1.5); s.add(brilhoR);
    const linha = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.012, 0.01), glow(0x7ee8fa, 1.5)); linha.position.set(0, 2.4, 0.6); linha.visible = !!a.silencio; s.add(linha);
    const rel = relogio(0.3); rel.position.set(0, 1.3, 0.6); rel.visible = !!a.nada; s.add(rel);
    const rig = a.close ? { target: V(0.05, 1.5, -0.3), dist: 3.6, pitch: 0.05, yaw: 0.3, fov: 32 } : a.figura ? { target: V(0.15, 1.6, -0.35), dist: 4.3, pitch: 0.02, yaw: 0.25, fov: 36 } : { target: V(0, 1.55, 0), dist: 4.6, pitch: 0.05, yaw: 0.2, fov: 38 };
    return {
      scene: s, rig, bloom: [0.6, 0.5, 0.5], dof: a.close ? 0.015 : 0.004, desat: 0.5, exposure: a.cega ? lerp(1, 0.15, 1) : 1,
      update(t, d, k) {
        if (a.cega) { const esc = smooth(0.2, 0.8, k); r.key.intensity = lerp(0.6, 0.0, esc); r.rim.intensity = lerp(1.2, 0.05, esc); pose(l, t, { acao: 'cobrir', expr: 'medo' }); }
        else if (a.silencio) { pose(l, t, { acao: 'rosto', expr: 'medo', olhar: [Math.sin(t * 3), 0] }); }
        else if (a.nada) { pose(l, t, { acao: 'botao', expr: 'medo', k: k * 3 }); }
        else { pose(l, t, { acao: 'parado', expr: k > 0.4 || a.figura ? 'medo' : 'triste', cab: [0, a.figura ? -0.5 * smooth(0.3, 0.7, k) : 0, 0], olhar: [a.figura ? 1 : 0, 0] }); }
        if (outro.visible) {
          const chega = a.close ? 1 : ease(smooth(0.1, 0.6, k));
          outro.position.z = lerp(-1.6, -0.75, chega);
          pose(outro, t, { acao: 'parado', expr: 'neutro', braco: [-1, -1.15 * chega, 0.45, -0.6 * chega], olhar: [0, 0] });
          const mo = new THREE.Vector3(); outro.userData.maos[1].getWorldPosition(mo); relO.position.copy(mo).add(V(0, 0.08, 0.06)); brilhoR.position.copy(mo).add(V(0, 0.2, 0.3));
        }
        rel.rotation.y = Math.sin(t) * 0.2;
      }
    };
  },
};

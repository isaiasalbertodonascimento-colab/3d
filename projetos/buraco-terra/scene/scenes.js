// Cenas: "E se você pulasse num buraco que atravessa a Terra?"
import * as THREE from 'three';
import { studio, kid, posekid, blob, tube, clay, wet, glow, cut, particles, smooth, lerp, clamp, ease, V } from './lib.js';
import { placa, camHud, hud, espaco, anelNeon, terra } from './fx.js';

const R = 2;
const pessoa = () => kid({ shirt: 0xf03e3e, hair: 0x2b1a10, skin: 0xe0a07a, pants: 0x1c7ed6 });

// Terra em corte com túnel vertical
function terraCorte(scene) {
  const plano = cut(V(0, 0, -1), 0);
  const camadas = [
    [R, clay(0x1c7ed6, { clip: [plano], side: THREE.DoubleSide })],
    [R * 0.96, clay(0x8d5524, { clip: [plano], side: THREE.BackSide })],
    [R * 0.9, clay(0xe8590c, { clip: [plano], side: THREE.DoubleSide, emissive: 0x401000 })],
    [R * 0.55, glow(0xffa94d, 1.0, { clip: [plano], side: THREE.DoubleSide })],
  ];
  camadas.forEach(([r, m]) => scene.add(new THREE.Mesh(new THREE.SphereGeometry(r, 64, 48), m)));
  const nucleo = new THREE.Mesh(new THREE.SphereGeometry(R * 0.28, 40, 30), glow(0xfff3bf, 1.4)); scene.add(nucleo);
  for (let i = 0; i < 6; i++) { const c = blob(0.5, clay(0x40c057), { seed: i, noise: 0.3, freq: 4 }); const a = i * 1.05 + 0.3, b = (i % 3 - 1) * 0.6; c.position.set(Math.cos(a) * Math.cos(b) * R * 0.86, Math.sin(b) * R * 0.86, -Math.abs(Math.sin(a) * Math.cos(b)) * R * 0.86); c.scale.set(1, 1, 0.35); c.lookAt(0, 0, 0); scene.add(c); }
  const tunel = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, R * 2.2, 16), new THREE.MeshBasicMaterial({ color: 0x0b0b12 })); scene.add(tunel);
  const borda = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, R * 2.2, 16, 1, true), glow(0x74c0fc, 0.5, { opacity: 0.35, side: THREE.DoubleSide })); scene.add(borda);
  return { nucleo };
}

export default {
  // na beira do buraco; pula = salta para dentro
  pulo(ctx) {
    const pula = !!ctx.args.pula;
    const { scene } = studio(ctx, { top: '#1c7ed6', bottom: '#a5d8ff', floor: false, keyI: 2.2, rimColor: 0xfff3bf });
    const chao = new THREE.Mesh(new THREE.SphereGeometry(30, 64, 32), clay(0x40c057)); chao.position.y = -30; chao.receiveShadow = true; scene.add(chao);
    const buraco = new THREE.Mesh(new THREE.CircleGeometry(0.75, 48), new THREE.MeshBasicMaterial({ color: 0x050508 })); buraco.rotation.x = -Math.PI / 2; buraco.position.set(0.6, 0.012, 0); scene.add(buraco);
    const aro = new THREE.Mesh(new THREE.TorusGeometry(0.78, 0.09, 12, 48), clay(0x8d5524)); aro.rotation.x = Math.PI / 2; aro.position.set(0.6, 0.03, 0); scene.add(aro);
    const brilho = new THREE.Mesh(new THREE.CircleGeometry(0.35, 32), glow(0xff922b, 0.9, { opacity: 0.6 })); brilho.rotation.x = -Math.PI / 2; brilho.position.set(0.6, 0.015, 0); scene.add(brilho);
    const rng = ctx.rng;
    for (let i = 0; i < 9; i++) { const g = new THREE.Group(); const tr = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.09, 0.5, 8), clay(0x8a5230)); tr.position.y = 0.25; g.add(tr); const c = blob(0.35, clay(0x2f9e44), { seed: i, noise: 0.15, freq: 5, seg: 16 }); c.position.y = 0.75; g.add(c); g.position.set(-3 + rng() * 6, 0, -2 - rng() * 3); scene.add(g); }
    const placaBR = placa('BRASIL', '#ffd43b', 1.2); placaBR.position.set(-0.75, 1.15, -0.6); scene.add(placaBR);
    const poste = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.9, 8), clay(0x8a5230)); poste.position.set(-0.75, 0.55, -0.62); poste.scale.y = 1.25; scene.add(poste);
    const p = pessoa(); p.position.set(-0.35, 0, 0.1); p.rotation.y = 0.9; scene.add(p);
    const titulo = ctx.shot.start < 2.7 || ctx.shot.beat === 6;
    return {
      scene, rig: { target: V(0.2, titulo ? 1.45 : 0.8, 0), dist: 7.2, pitch: 0.25, fov: 38 }, bloom: [0.3, 0.4, 0.85],
      update(t, d, k) {
        brilho.material.opacity = 0.4 + 0.25 * Math.sin(t * 4);
        if (pula) {
          const j = clamp(t / 1.1); const x = lerp(-0.35, 0.6, ease(clamp(j * 1.6))); const y = Math.sin(clamp(j * 1.6) * Math.PI) * 0.8 - Math.max(0, j - 0.62) * 9;
          p.position.set(x, y, 0.05); p.visible = y > -2.5; p.rotation.x = j * 0.6;
          posekid(p, t, { open: 0.7, shock: 0.3, armL: 0.9, armR: 0.9 });
        } else posekid(p, t, { lookY: -0.8, nod: 0.35, open: 0.3, armR: 0.15, shock: 0.15 });
      }
    };
  },

  // Terra em corte com a pessoa no túnel (vaivem = oscila para sempre)
  corte(ctx) {
    const a = ctx.args;
    const { scene, est } = espaco(ctx, '#0b1e4a', '#010208', 700);
    const { nucleo } = terraCorte(scene);
    const p = pessoa(); p.scale.setScalar(0.32); scene.add(p);
    const rastro = particles(60, [-0.05, -R, -0.05, 0.1, R * 2, 0.1], { color: 0xffd43b, size: 0.05, rise: 0 }); rastro.points.visible = !!a.vaivem; scene.add(rastro.points);
    const cam = camHud(ctx, 40); scene.add(cam);
    const txt = a.hud ? hud(cam, a.hud, '#ffd43b', 0.55, 1.0) : null;
    return {
      scene, cam, rig: { target: V(0, -0.5, 0), dist: 13.5, pitch: 0.05, yaw: 0.25, fov: 40 }, bloom: [0.45, 0.4, 0.75],
      update(t, d, k) {
        nucleo.scale.setScalar(1 + 0.04 * Math.sin(t * 5));
        const y = a.vaivem ? R * 1.05 * Math.cos(t * 2.2) : lerp(R * 1.05, R * 0.2, ease(k));
        p.position.set(0, y - 0.15, 0.12); p.rotation.z = Math.sin(t * 6) * 0.3; posekid(p, t, { open: 0.6, armL: 0.9, armR: 0.9, shock: 0.4 });
        if (txt) txt.scale.setScalar(Math.max(0.001, ease(smooth(0.1, 0.3, k))));
      }
    };
  },

  // núcleo em brasa + termômetro (sol = comparação com o Sol)
  nucleo(ctx) {
    const sol = !!ctx.args.sol;
    const { scene } = studio(ctx, { top: '#c92a2a', bottom: '#1a0202', floor: false, rimColor: 0xffd8a8, keyI: 1.6, envI: 0.25 });
    const n = blob(1.0, glow(0xffc93b, 0.85), { seed: 2, noise: 0.06, freq: 6 }); scene.add(n);
    const casca = new THREE.Mesh(new THREE.SphereGeometry(1.5, 48, 32), glow(0xff6b00, 0.6, { opacity: 0.25 })); scene.add(casca);
    const lava = particles(260, [-2.5, -2.5, -2.5, 5, 5, 5], { color: 0xff922b, size: 0.08, rise: 0.3 }); scene.add(lava.points);
    const termo = new THREE.Group(); termo.position.set(1.7, -0.3, 0.6); scene.add(termo);
    const vidro = new THREE.Mesh(new THREE.CapsuleGeometry(0.13, 1.8, 6, 16), clay(0xf8f9fa, { opacity: 0.4, coat: 1 })); termo.add(vidro);
    const bulbo = new THREE.Mesh(new THREE.SphereGeometry(0.22, 20, 16), glow(0xff3b3b, 1.3)); bulbo.position.y = -1.0; termo.add(bulbo);
    const coluna = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 1, 12), glow(0xff3b3b, 1.3)); termo.add(coluna);
    let astro = null;
    if (sol) { astro = blob(0.9, glow(0xffe066, 1.2), { seed: 7, noise: 0.08, freq: 5 }); astro.position.set(2.6, 0.2, -0.5); scene.add(astro); n.position.x = -1.2; casca.position.x = -1.2; termo.visible = false; }
    const cam = camHud(ctx, 38); scene.add(cam);
    const txt = hud(cam, sol ? 'QUASE IGUAL AO SOL' : '+5.000 °C', '#ffd43b', 0.55, sol ? 1.05 : 0.95);
    return {
      scene, cam, rig: sol ? { target: V(0.6, 0.3, 0), dist: 11.0, pitch: 0.05, fov: 38 } : { target: V(0.6, 0.4, 0), dist: 8.8, pitch: 0.05, fov: 38 }, bloom: [0.4, 0.4, 0.8],
      update(t, d, k) {
        lava.update(t); n.rotation.y = t * 0.4; n.scale.setScalar(1 + 0.05 * Math.sin(t * 7));
        const h = 0.2 + ease(smooth(0.05, 0.6, k)) * 1.8; coluna.scale.y = h; coluna.position.y = -1.0 + h / 2;
        if (astro) astro.rotation.y = t * 0.3;
        txt.scale.setScalar(Math.max(0.001, ease(smooth(0.15, 0.35, k))) * (1 + 0.04 * Math.sin(t * 8)));
      }
    };
  },

  // caindo dentro do túnel, linhas de velocidade (rapido = mais rápido + número)
  queda(ctx) {
    const rapido = !!ctx.args.rapido;
    const { scene } = studio(ctx, { top: '#3d1a00', bottom: '#120500', floor: false, keyI: 1.8, rimColor: 0xffa94d, envI: 0.3 });
    const parede = new THREE.Mesh(new THREE.CylinderGeometry(2.2, 2.2, 40, 32, 20, true), clay(0x8d5524, { side: THREE.BackSide })); scene.add(parede);
    const aneis = []; for (let i = 0; i < 14; i++) { const a = anelNeon(2.1, i % 2 ? 0xff922b : 0xffd43b, 0.03); a.rotation.x = Math.PI / 2; scene.add(a); aneis.push(a); }
    const linhas = []; for (let i = 0; i < 40; i++) { const l = new THREE.Mesh(new THREE.BoxGeometry(0.02, 1.4, 0.02), glow(0xfff3bf, 0.9)); const a = i * 2.4, r = 0.8 + (i % 5) * 0.25; l.position.set(Math.cos(a) * r, 0, Math.sin(a) * r); l.userData.o = i * 0.37; scene.add(l); linhas.push(l); }
    const p = pessoa(); scene.add(p);
    const cam = camHud(ctx, 40); scene.add(cam);
    const txt = rapido ? hud(cam, '≈ 30.000 KM/H', '#ffd43b', 0.55, 1.05) : null;
    const vel = rapido ? 22 : 9;
    return {
      scene, cam, rig: { target: V(0, 0.6, 0), dist: 6.4, pitch: 0.45, fov: 40 }, bloom: [0.4, 0.4, 0.8],
      update(t, d, k) {
        aneis.forEach((a, i) => { a.position.y = ((i * 3 + t * vel) % 42) - 21; });
        linhas.forEach(l => { l.position.y = ((l.userData.o * 10 + t * vel * 1.6) % 24) - 12; });
        p.position.set(Math.sin(t * 3) * 0.08, 0.2, 0); p.rotation.set(Math.sin(t * 2) * 0.2, t * 0.6, Math.sin(t * 5) * 0.15);
        posekid(p, t, { open: 0.7, shock: 0.5, armL: 0.95 + Math.sin(t * 12) * 0.08, armR: 0.95 + Math.cos(t * 12) * 0.08 });
        if (txt) txt.scale.setScalar(Math.max(0.001, ease(smooth(0.05, 0.25, k))) * (1 + 0.05 * Math.sin(t * 10)));
      }
    };
  },

  // flutuando no centro; setas = a gravidade puxando igual para todos os lados
  flutua(ctx) {
    const setas = !!ctx.args.setas, close = !!ctx.args.close;
    const { scene } = studio(ctx, { top: '#e8590c', bottom: '#3d1200', floor: false, keyI: 2, rimColor: 0xfff3bf, envI: 0.3 });
    const brilho = particles(200, [-4, -4, -4, 8, 8, 8], { color: 0xffd8a8, size: 0.06, rise: 0.05, opacity: 0.7 }); scene.add(brilho.points);
    const p = pessoa(); scene.add(p);
    const grupo = new THREE.Group(); grupo.visible = setas; scene.add(grupo);
    const dirs = [V(1, 0, 0), V(-1, 0, 0), V(0, 1, 0), V(0, -1, 0), V(0.7, 0.7, 0), V(-0.7, 0.7, 0), V(0.7, -0.7, 0), V(-0.7, -0.7, 0)];
    const flechas = dirs.map(d => { const g = new THREE.Group(); const h = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.7, 10), glow(0x74c0fc, 1.2)); h.position.y = 0.35; const c = new THREE.Mesh(new THREE.ConeGeometry(0.13, 0.25, 14), glow(0x74c0fc, 1.2)); c.position.y = 0.8; g.add(h, c); g.quaternion.setFromUnitVectors(V(0, 1, 0), d.clone().normalize()); g.userData.d = d.clone().normalize(); grupo.add(g); return g; });
    const cam = camHud(ctx, 40); scene.add(cam);
    const txt = setas ? hud(cam, 'PESO: ZERO', '#ffd43b', 0.55, 0.95) : null;
    return {
      scene, cam, rig: close ? { target: V(0, 0.75, 0), dist: 5.4, pitch: 0.05, fov: 38 } : { target: V(0, 0.6, 0), dist: 7.6, pitch: 0.1, fov: 40 }, bloom: [0.4, 0.4, 0.8],
      update(t, d, k) {
        brilho.update(t);
        p.position.set(0, 0.1 + Math.sin(t * 1.5) * 0.08, 0); p.rotation.set(Math.sin(t * 0.7) * 0.4, t * 0.4, Math.sin(t * 0.5) * 0.5);
        posekid(p, t, { open: 0.4, armL: 0.5 + Math.sin(t * 1.3) * 0.2, armR: 0.6 + Math.cos(t * 1.1) * 0.2, lookY: 0.3 });
        grupo.position.set(0, 0.95, 0);
        flechas.forEach(f => { const e = 1.0 + 0.12 * Math.sin(t * 5); f.position.copy(f.userData.d).multiplyScalar(0.55 * e); });
        if (txt) txt.scale.setScalar(Math.max(0.001, ease(smooth(0.2, 0.4, k))));
      }
    };
  },

  // globo: Brasil → atravessa o centro → Oceano Pacífico ao sul do Japão
  globo(ctx) {
    const saida = !!ctx.args.saida;
    const { scene } = espaco(ctx, '#0b1e4a', '#010208', 700);
    const tt = terra(1.8); tt.children[0].material.transparent = true; tt.children[0].material.opacity = 0.8; scene.add(tt);
    const pinA = new THREE.Group(), pinB = new THREE.Group();
    for (const [pin, cor] of [[pinA, 0x40c057], [pinB, 0x4dabf7]]) { const h = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.45, 8), clay(0xffffff)); h.position.y = 0.22; const b = new THREE.Mesh(new THREE.SphereGeometry(0.12, 16, 12), glow(cor, 1.3)); b.position.y = 0.48; pin.add(h, b); tt.add(pin); }
    const dA = V(-0.55, -0.4, 0.73).normalize(), dB = dA.clone().negate();
    pinA.position.copy(dA).multiplyScalar(1.8); pinA.quaternion.setFromUnitVectors(V(0, 1, 0), dA);
    pinB.position.copy(dB).multiplyScalar(1.8); pinB.quaternion.setFromUnitVectors(V(0, 1, 0), dB);
    const linha = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 3.6, 10), glow(0xffd43b, 1.2)); linha.quaternion.setFromUnitVectors(V(0, 1, 0), dA); tt.add(linha);
    const cam = camHud(ctx, 40); scene.add(cam);
    const t1 = hud(cam, 'BRASIL', '#69db7c', 0.6, 0.6), t2 = hud(cam, 'OCEANO PACÍFICO', '#74c0fc', 0.42, 1.0); t2.visible = saida;
    return {
      scene, cam, rig: { target: V(0, 0.7, 0), dist: 11.5, pitch: 0.1, fov: 40 }, bloom: [0.4, 0.4, 0.8],
      update(t, d, k) {
        tt.rotation.y = saida ? lerp(0.5, Math.PI + 0.5, ease(smooth(0.1, 0.8, k))) : 0.5 + t * 0.1;
        linha.scale.y = saida ? 1 : Math.max(0.01, ease(smooth(0.2, 0.9, k)));
        pinA.scale.setScalar(2); pinB.visible = saida; pinB.scale.setScalar(saida ? 2 * ease(smooth(0.5, 0.75, k)) + 0.001 : 0.001);
        t1.visible = !saida; t2.scale.setScalar(Math.max(0.001, ease(smooth(0.6, 0.8, k))));
      }
    };
  },
};

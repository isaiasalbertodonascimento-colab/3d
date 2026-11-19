// Cenas: "E se a Terra parasse de girar por um segundo?"
import * as THREE from 'three';
import { studio, kid, posekid, blob, clay, wet, glow, particles, smooth, lerp, clamp, ease, V } from './lib.js';
import { placa, camHud, hud, espaco, anelNeon, terra } from './fx.js';

function carro(cor) {
  const g = new THREE.Group();
  const b = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.3, 0.46), clay(cor, { coat: 0.6 })); b.position.y = 0.25; b.castShadow = true; g.add(b);
  const t = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.22, 0.42), clay(cor, { coat: 0.6 })); t.position.set(-0.05, 0.5, 0); g.add(t);
  const v = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.16, 0.44), clay(0x1c3d5a, { rough: 0.1, coat: 1 })); v.position.set(-0.05, 0.5, 0); v.scale.set(0.98, 0.8, 1.01); g.add(v);
  for (const [x, z] of [[-0.28, 0.24], [0.28, 0.24], [-0.28, -0.24], [0.28, -0.24]]) { const w = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.11, 0.08, 16), clay(0x212529)); w.rotation.x = Math.PI / 2; w.position.set(x, 0.11, z); g.add(w); }
  return g;
}
function predio(w, h, cor, rng) {
  const g = new THREE.Group();
  const b = new THREE.Mesh(new THREE.BoxGeometry(w, h, w), clay(cor)); b.position.y = h / 2; b.castShadow = true; g.add(b);
  const jm = clay(0xffe066, { emissive: 0x6b5300 });
  for (let y = 0.4; y < h - 0.2; y += 0.45) for (let x = -w / 2 + 0.2; x < w / 2 - 0.1; x += 0.3) { if (rng() < 0.3) continue; const j = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.2, 0.02), jm); j.position.set(x, y, w / 2 + 0.01); g.add(j); }
  return g;
}
const pessoa = (cor) => kid({ shirt: cor, hair: 0x2b1a10, skin: 0xe0a07a });

export default {
  // a Terra girando (para = trava de repente; equador = anel com a velocidade)
  planeta(ctx) {
    const a = ctx.args;
    const { scene } = espaco(ctx, '#0b1e4a', '#010208', 700);
    const t = terra(1.6); scene.add(t);
    const anel = anelNeon(1.75, 0xffd43b, 0.035); anel.rotation.x = Math.PI / 2; anel.visible = !!a.equador; scene.add(anel);
    const setas = [];
    if (a.equador) for (let i = 0; i < 6; i++) { const s = new THREE.Mesh(new THREE.ConeGeometry(0.09, 0.25, 12), glow(0xffd43b, 1.4)); scene.add(s); setas.push(s); }
    const cam = camHud(ctx, 40); scene.add(cam);
    const txt = a.para ? hud(cam, 'PAROU!', '#ff6b6b', 0.55, 0.8) : a.equador ? hud(cam, 'GIRANDO SEM PARAR', '#ffd43b', 0.55, 1.0) : null;
    const titulo = ctx.shot.start < 4.3 || ctx.shot.beat === 6;
    return {
      scene, cam, rig: { target: V(0, titulo ? 1.4 : 0.5, 0), dist: 11.5, pitch: 0.18, fov: 40 }, bloom: [0.4, 0.4, 0.8],
      update(tt, d, k) {
        const vel = a.para ? (tt < 0.12 ? 3 : 0) : 1.2;
        t.rotation.y = a.para ? Math.min(tt, 0.12) * 3 : tt * vel;
        setas.forEach((s, i) => { const ang = tt * 1.2 + i / 6 * Math.PI * 2; s.position.set(Math.cos(ang) * 1.75, 0, -Math.sin(ang) * 1.75); s.rotation.set(0, ang, -Math.PI / 2); });
        if (txt) txt.scale.setScalar(Math.max(0.001, ease(smooth(0.05, 0.2, k))) * (a.para ? 1 + 0.08 * Math.sin(tt * 20) : 1));
      }
    };
  },

  // rua: voa (0..1) = tudo sendo arremessado para o leste; predios = até os prédios
  rua(ctx) {
    const a = ctx.args, voa = a.voa ?? 0;
    const { scene } = studio(ctx, { top: '#4dabf7', bottom: '#d0ebff', floorColor: 0x868e96, floorR: 20, keyI: 2.0, envI: 0.3, rimColor: 0xfff3bf });
    const asf = new THREE.Mesh(new THREE.BoxGeometry(30, 0.02, 2.4), clay(0x343a40)); asf.position.y = 0.01; asf.receiveShadow = true; scene.add(asf);
    for (let i = -12; i < 12; i++) { const f = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.025, 0.08), clay(0xf8f9fa)); f.position.set(i * 1.2, 0.02, 0); scene.add(f); }
    const rng = ctx.rng, cores = [0xfa5252, 0x4dabf7, 0xffd43b, 0x69db7c, 0xda77f2];
    const predios = [];
    for (let i = 0; i < 7; i++) { const h = 2 + rng() * 2.5, p = predio(1.1, h, [0xadb5bd, 0xe9ecef, 0xffd8a8, 0xa5d8ff][i % 4], rng); p.position.set(-5 + i * 1.6, 0, -2.2); scene.add(p); predios.push({ p, h, ph: rng() }); }
    const carros = [0, 1, 2].map(i => { const c = carro(cores[i]); c.position.set(-2.5 + i * 2.2, 0, i % 2 ? 0.6 : -0.6); scene.add(c); return { c, ph: rng() }; });
    const gente = [0, 1, 2, 3].map(i => { const p = pessoa(cores[(i + 2) % 5]); p.position.set(-3 + i * 1.8, 0, 1.6); p.rotation.y = (rng() - 0.5) * 0.8; scene.add(p); return { p, ph: rng() }; });
    const vento = particles(160, [-8, 0.2, -2, 16, 4, 5], { color: 0xffffff, size: 0.07, rise: 0, opacity: 0.6 }); vento.points.visible = voa > 0; scene.add(vento.points);
    const cam = camHud(ctx, 40); scene.add(cam);
    const txt = a.hud ? hud(cam, a.hud, '#ffd43b', 0.55, 0.95) : voa ? hud(cam, 'PARA O LESTE →', '#ffd43b', 0.55, 0.95) : null;
    const lanca = (o, k, ph, alt, rot, peso = 1) => { const e = clamp((k - ph * 0.3 * peso) * voa * 1.6); o.position.x += e * e * 9 * peso; o.position.y += Math.sin(e * Math.PI * 0.8) * alt * e; o.rotation.z = -e * rot; o.rotation.x = e * rot * 0.5; };
    return {
      scene, cam, rig: { target: V(0, a.predios ? 1.8 : 1.1, 0), dist: a.predios ? 11 : 8.0, pitch: 0.12, fov: 40 }, bloom: [0.2, 0.4, 0.9],
      update(t, d, k) {
        const kk = voa ? clamp(k + (voa < 1 ? 0 : 0.35)) : 0;
        gente.forEach(({ p, ph }, i) => { p.position.set(-3 + i * 1.8, 0, 1.6); p.rotation.set(0, 0, 0); if (voa) lanca(p, kk, ph, 2.2, 5); posekid(p, t + i, voa ? { shock: 1, open: 0.8, armL: 0.9, armR: 0.9 } : a.alivio ? { open: 0.2, lookY: 0.4, tilt: 0.1 } : { talk: i === 1 }); });
        carros.forEach(({ c, ph }, i) => { c.position.set(-2.5 + i * 2.2, 0, i % 2 ? 0.6 : -0.6); c.rotation.set(0, 0, 0); if (voa) lanca(c, kk, ph, 1.6, 4, 0.9); });
        predios.forEach(({ p, ph }, i) => { p.position.set(-5 + i * 1.6, 0, -2.2); p.rotation.set(0, 0, 0); if (a.predios) lanca(p, clamp(k * 1.2), ph, 1.2, 1.5, 0.7); });
        if (voa) { vento.points.position.x = ((t * 14) % 16) - 8; }
        if (txt) txt.scale.setScalar(Math.max(0.001, ease(smooth(0.05, 0.25, k))));
      }
    };
  },

  // onda gigante sobre a cidade
  onda(ctx) {
    const { scene } = studio(ctx, { top: '#212529', bottom: '#868e96', floorColor: 0x0b4f8a, floorR: 25, keyI: 2.0, envI: 0.3, rimColor: 0xd0ebff });
    const rng = ctx.rng;
    for (let i = 0; i < 14; i++) { const h = 0.6 + rng() * 1.6; const b = new THREE.Mesh(new THREE.BoxGeometry(0.5, h, 0.5), clay([0xe9ecef, 0xffd8a8, 0xadb5bd][i % 3])); b.position.set(-3 + (i % 7) * 1.0, h / 2, 1 - Math.floor(i / 7) * 1.2); b.castShadow = true; scene.add(b); }
    const onda = new THREE.Group(); scene.add(onda);
    const rolo = new THREE.Mesh(new THREE.TorusGeometry(2.6, 1.3, 24, 64, Math.PI * 1.15), wet(0x1c7ed6, { coat: 1, rough: 0.15 }));
    rolo.rotation.y = Math.PI / 2; rolo.scale.set(1, 1, 5); rolo.position.y = 0.2; onda.add(rolo);
    const parede = new THREE.Mesh(new THREE.BoxGeometry(14, 2.4, 2.2), wet(0x1971c2, { coat: 1, rough: 0.2 })); parede.position.set(0, 1.0, -2.0); onda.add(parede);
    const espuma = particles(260, [-7, 3.2, -1.0, 14, 1.6, 2.5], { color: 0xffffff, size: 0.14, rise: -0.3, opacity: 0.9 }); onda.add(espuma.points);
    const cam = camHud(ctx, 42); scene.add(cam); const txt = hud(cam, 'ONDAS GIGANTES', '#ffd43b', 0.55, 1.0);
    return {
      scene, cam, rig: { target: V(0, 2.2, -1), dist: 17, pitch: 0.1, yaw: 0.55, fov: 42 }, bloom: [0.25, 0.4, 0.85],
      update(t, d, k) { onda.position.z = lerp(-6, -3.2, ease(k)); espuma.update(t); txt.scale.setScalar(Math.max(0.001, ease(smooth(0.1, 0.3, k)))); }
    };
  },

  // furacão: espiral de nuvens girando rápido
  furacao(ctx) {
    const { scene } = espaco(ctx, '#0b1e4a', '#010208', 400);
    const t = terra(3.2); t.position.y = -3.6; scene.add(t);
    const n = 1400, pos = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) { const r = Math.pow(Math.random(), 0.6) * 2.4, a = r * 2.2 + (i % 3) * 2.1 + (Math.random() - 0.5) * 0.5; pos.set([Math.cos(a) * r, 0, Math.sin(a) * r], i * 3); }
    const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const nuvem = new THREE.Points(geo, new THREE.PointsMaterial({ color: 0xffffff, size: 0.12, transparent: true, opacity: 0.85, depthWrite: false })); nuvem.position.y = -0.35; scene.add(nuvem);
    const olho = new THREE.Mesh(new THREE.CircleGeometry(0.25, 32), new THREE.MeshBasicMaterial({ color: 0x0b2e5e })); olho.rotation.x = -Math.PI / 2; olho.position.y = -0.33; scene.add(olho);
    const cam = camHud(ctx, 40); scene.add(cam); const txt = hud(cam, 'VENTOS DE 1.600 KM/H', '#ffd43b', 0.55, 1.05);
    return {
      scene, cam, rig: { target: V(0, -0.2, 0), dist: 6.2, pitch: 0.9, fov: 40 }, bloom: [0.35, 0.4, 0.8],
      update(tt, d, k) { nuvem.rotation.y = -tt * 2.5; txt.scale.setScalar(Math.max(0.001, ease(smooth(0.1, 0.3, k)))); }
    };
  },

  // Terra parada ao lado do Sol: metade dia, metade noite
  diaenoite(ctx) {
    const comHud = !!ctx.args.hud;
    const { scene } = espaco(ctx, '#140b38', '#010007', 600);
    const sol = blob(1.1, glow(0xffa94d, 1.2), { seed: 2, noise: 0.08, freq: 4 }); sol.position.set(-1.3, 3.6, -2.5); scene.add(sol);
    const t = terra(1.4); t.children[t.children.length - 1].visible = false; t.position.set(0.3, -0.4, 0); scene.add(t);
    const n = t.position.clone().sub(sol.position).normalize();
    const plano = new THREE.Plane(n.clone().negate(), n.dot(t.position));
    const sombra = new THREE.Mesh(new THREE.SphereGeometry(1.45, 48, 32), new THREE.MeshBasicMaterial({ color: 0x000814, transparent: true, opacity: 0.78, clippingPlanes: [plano] })); sombra.position.copy(t.position); scene.add(sombra);
    const raios = particles(80, [-1.6, 0.5, -2.5, 2.5, 3.2, 2], { color: 0xffe066, size: 0.06, rise: -0.4, opacity: 0.6 }); scene.add(raios.points);
    const cam = camHud(ctx, 40); scene.add(cam);
    const a1 = comHud ? hud(cam, '6 MESES DE SOL', '#ffd43b', 0.6, 0.95) : null, a2 = comHud ? hud(cam, '6 MESES DE NOITE', '#74c0fc', 0.38, 0.95) : null;
    return {
      scene, cam, rig: { target: V(0, 1.0, 0), dist: 11.5, pitch: 0.05, fov: 40 }, bloom: [0.45, 0.4, 0.75],
      update(tt, d, k) { sol.rotation.y = tt * 0.2; raios.update(tt); if (a1) { a1.scale.setScalar(Math.max(0.001, ease(smooth(0.05, 0.25, k)))); a2.scale.setScalar(Math.max(0.001, ease(smooth(0.3, 0.5, k)))); } }
    };
  },

  // o novo mapa: oceanos nos polos, um continente gigante no meio
  mapa(ctx) {
    const pronto = !!ctx.args.pronto;
    const { scene } = espaco(ctx, '#0b1e4a', '#010208', 600);
    const g = new THREE.Group(); scene.add(g);
    const terraM = new THREE.Mesh(new THREE.SphereGeometry(1.8, 64, 48), clay(0x40c057)); g.add(terraM);
    const faixa = new THREE.Mesh(new THREE.SphereGeometry(1.83, 64, 48, 0, Math.PI * 2, Math.PI * 0.36, Math.PI * 0.28), clay(0xc9a227)); g.add(faixa);
    const capN = new THREE.Mesh(new THREE.SphereGeometry(1.86, 64, 32, 0, Math.PI * 2, 0, 1), wet(0x1c7ed6, { coat: 1 })); g.add(capN);
    const capS = capN.clone(); capS.rotation.x = Math.PI; g.add(capS);
    const atm = new THREE.Mesh(new THREE.SphereGeometry(1.95, 48, 32), glow(0x74c0fc, 0.45, { opacity: 0.2 })); g.add(atm);
    const cam = camHud(ctx, 40); scene.add(cam); const txt = hud(cam, '1 SUPERCONTINENTE', '#69db7c', 0.6, 1.05);
    return {
      scene, cam, rig: { target: V(0, 0.7, 0), dist: 12.5, pitch: 0.12, fov: 40 }, bloom: [0.3, 0.4, 0.85],
      update(t, d, k) {
        g.rotation.y = t * 0.35;
        const cresce = pronto ? 1 : ease(smooth(0.1, 0.9, k));
        const ang = lerp(0.45, 1.05, cresce);
        capN.geometry.dispose(); capN.geometry = new THREE.SphereGeometry(1.86, 48, 24, 0, Math.PI * 2, 0, ang); capS.geometry = capN.geometry;
        txt.scale.setScalar(pronto ? Math.max(0.001, ease(smooth(0.1, 0.3, k))) : 0.001);
      }
    };
  },
};

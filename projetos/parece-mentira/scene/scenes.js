// Cenas: "5 coisas que parecem mentira, mas são verdade" — visual neon/espacial
import * as THREE from 'three';
import { studio, blob, tube, clay, wet, glow, particles, smooth, lerp, clamp, ease, V } from './lib.js';

// ---------- utilidades ----------
function placa(txt, cor = '#ffd43b', w = 2) {
  const c = document.createElement('canvas'); c.width = 1024; c.height = 256; const g = c.getContext('2d');
  const desenha = (s) => {
    g.clearRect(0, 0, 1024, 256); let fs = 200;
    do { g.font = `900 ${fs}px Anton, Impact, sans-serif`; fs -= 8; } while (g.measureText(s).width > 960 && fs > 40);
    g.textAlign = 'center'; g.textBaseline = 'middle'; g.lineJoin = 'round';
    g.lineWidth = 26; g.strokeStyle = '#000'; g.strokeText(s, 512, 136); g.fillStyle = cor; g.fillText(s, 512, 136);
  };
  desenha(txt);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, w / 4), new THREE.MeshBasicMaterial({ map: t, transparent: true, toneMapped: false, depthTest: false }));
  m.renderOrder = 10; let atual = txt;
  m.userData.set = s => { if (s !== atual) { atual = s; desenha(s); t.needsUpdate = true; } };
  return m;
}
function camHud(ctx, fov) { return new THREE.PerspectiveCamera(fov, ctx.W / ctx.H, 0.01, 500); }
// número/frase presa na tela: y em unidades a 3 m da câmera (0.35 ≈ terço de cima)
function hud(cam, txt, cor = '#ffd43b', y = 0.35, w = 1.05, x = 0) { const p = placa(txt, cor, w); p.position.set(x, y, -3); cam.add(p); return p; }
function espaco(ctx, top = '#1b0b3a', bottom = '#02010a', n = 500) {
  const { scene, key, rim } = studio(ctx, { top, bottom, floor: false, keyI: 2.2, rimColor: 0xb197fc, rimI: 2.5, envI: 0.35 });
  const est = particles(n, [-12, -10, -14, 24, 22, 10], { color: 0xffffff, size: 0.06, rise: 0, opacity: 0.9 }); scene.add(est.points);
  return { scene, key, rim, est };
}
const anelNeon = (r, cor, t = 0.03) => new THREE.Mesh(new THREE.TorusGeometry(r, t, 10, 64), glow(cor, 1.0));

function folha() { const m = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.012, 1.0), clay(0xf8f9fa, { sheen: 0.3 })); m.castShadow = true; return m; }
function lua(r = 0.6) { const m = blob(r, clay(0xced4da, { sheen: 0.2 }), { seed: 9, noise: 0.03, freq: 9 }); for (let i = 0; i < 7; i++) { const c = new THREE.Mesh(new THREE.SphereGeometry(r * (0.1 + (i % 3) * 0.05), 14, 10), clay(0xadb5bd)); const a = i * 2.1, b = i * 1.3; c.position.set(Math.cos(a) * Math.cos(b) * r * 0.97, Math.sin(b) * r * 0.97, Math.sin(a) * Math.cos(b) * r * 0.97); c.scale.z = 0.4; c.lookAt(0, 0, 0); m.add(c); } return m; }
function terra(r = 1) {
  const g = new THREE.Group(); g.add(blob(r, clay(0x1c7ed6, { coat: 0.6 }), { seed: 1, noise: 0.0 }));
  for (let i = 0; i < 9; i++) { const c = blob(r * 0.32, clay(0x51cf66), { seed: i, noise: 0.3, freq: 4 }); const a = i * 2.4, b = (i % 4 - 1.5) * 0.45; c.position.set(Math.cos(a) * Math.cos(b) * r * 0.82, Math.sin(b) * r * 0.82, Math.sin(a) * Math.cos(b) * r * 0.82); c.scale.set(1, 1, 0.45); c.lookAt(0, 0, 0); g.add(c); }
  const atm = new THREE.Mesh(new THREE.SphereGeometry(r * 1.06, 40, 30), glow(0x74c0fc, 0.5, { opacity: 0.25 })); g.add(atm); return g;
}
function colher() {
  const g = new THREE.Group(), m = clay(0xdee2e6, { rough: 0.2, coat: 1 }); m.metalness = 0.6;
  const cabo = new THREE.Mesh(new THREE.CapsuleGeometry(0.06, 1.3, 6, 12), m); cabo.rotation.z = Math.PI / 2; cabo.position.x = -0.85; cabo.rotation.y = 0; g.add(cabo);
  const concha = new THREE.Mesh(new THREE.SphereGeometry(0.32, 32, 16, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), m); concha.scale.set(1.25, 0.55, 0.9); concha.material.side = THREE.DoubleSide; g.add(concha);
  return g;
}
function carro(cor) {
  const g = new THREE.Group();
  const b = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.14, 0.22), clay(cor, { coat: 0.6 })); b.position.y = 0.11; g.add(b);
  const t = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.1, 0.2), clay(cor, { coat: 0.6 })); t.position.set(-0.02, 0.22, 0); g.add(t);
  for (const [x, z] of [[-0.13, 0.11], [0.13, 0.11], [-0.13, -0.11], [0.13, -0.11]]) { const w = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.04, 12), clay(0x212529)); w.rotation.x = Math.PI / 2; w.position.set(x, 0.05, z); g.add(w); }
  return g;
}
function banana(escala = 1) {
  const pts = []; for (let i = 0; i <= 8; i++) { const a = -0.9 + i / 8 * 1.8; pts.push(V(Math.sin(a) * 0.9, -Math.cos(a) * 0.9 + 0.9, 0)); }
  const g = new THREE.Group();
  g.add(tube(pts, u => 0.17 * Math.sin(Math.PI * clamp(u * 0.92 + 0.04)) + 0.02, clay(0xffd43b, { sheen: 0.6 }), { segments: 60, radial: 6 }));
  for (const u of [0, 1]) { const p = pts[u ? 8 : 0]; const tip = new THREE.Mesh(new THREE.SphereGeometry(0.045, 10, 8), clay(0x5c3d1e)); tip.position.copy(p); g.add(tip); }
  g.scale.setScalar(escala); return g;
}
function arvore(rng) {
  const g = new THREE.Group();
  const tr = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.07, 0.35, 8), clay(0x8a5230)); tr.position.y = 0.17; g.add(tr);
  const c = blob(0.24, clay([0x2f9e44, 0x37b24d, 0x40c057][Math.floor(rng() * 3)]), { seed: Math.floor(rng() * 9), noise: 0.15, freq: 5, seg: 16 }); c.position.y = 0.5; g.add(c);
  return g;
}
function galaxia(n = 1800, raio = 3.2) {
  const pos = new Float32Array(n * 3), col = new Float32Array(n * 3), c = new THREE.Color();
  for (let i = 0; i < n; i++) {
    const braco = i % 2, r = Math.pow(Math.random(), 0.7) * raio, a = r * 1.6 + braco * Math.PI + (Math.random() - 0.5) * 0.6;
    pos.set([Math.cos(a) * r, (Math.random() - 0.5) * 0.15 * (1 - r / raio), Math.sin(a) * r], i * 3);
    c.setHSL(0.6 + (r / raio) * 0.3 - (r < 0.6 ? 0.5 : 0), 0.8, 0.65 + (r < 0.6 ? 0.2 : 0)); col.set([c.r, c.g, c.b], i * 3);
  }
  const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(pos, 3)); geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
  const cv = document.createElement('canvas'); cv.width = cv.height = 64; const x = cv.getContext('2d'); const gr = x.createRadialGradient(32, 32, 0, 32, 32, 32); gr.addColorStop(0, '#fff'); gr.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = gr; x.fillRect(0, 0, 64, 64);
  return new THREE.Points(geo, new THREE.PointsMaterial({ size: 0.09, vertexColors: true, map: new THREE.CanvasTexture(cv), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
}

export default {
  // ícones dos 5 fatos orbitando; explode = estouram para fora
  abertura(ctx) {
    const explode = !!ctx.args.explode;
    const { scene, est } = espaco(ctx, '#3b0764', '#05010f');
    const centro = new THREE.Group(); scene.add(centro);
    const p = folha(); p.scale.setScalar(0.5); const l = lua(0.35); const c = colher(); c.scale.setScalar(0.45);
    const v = blob(0.35, clay(0xf59f00, { sheen: 0.6 }), { seed: 3, noise: 0.08, freq: 3 }); const b = banana(0.45); const t = arvore(ctx.rng); t.scale.setScalar(1.2);
    const icones = [p, l, c, v, b, t]; icones.forEach(i => centro.add(i));
    const aneis = [anelNeon(1.5, 0xf783ac), anelNeon(1.8, 0x74c0fc)]; aneis.forEach(a => { a.rotation.x = Math.PI / 2; scene.add(a); });
    const centroBrilho = blob(0.3, glow(0xffd43b, 1.0), { seed: 2, noise: 0.2, freq: 6 }); scene.add(centroBrilho);
    const fagulhas = particles(220, [-3, -3, -3, 6, 6, 6], { color: 0xffd43b, size: 0.06, rise: 0 }); fagulhas.points.visible = explode; scene.add(fagulhas.points);
    return {
      scene, rig: { target: V(0, -0.35, 0), dist: 9.0, pitch: 0.28, fov: 38 }, bloom: [0.4, 0.4, 0.8],
      update(t, d, k) {
        const abre = explode ? 1 + ease(smooth(0.05, 0.6, k)) * 1.2 : 1;
        icones.forEach((i, n) => { const a = t * 0.6 + n / icones.length * Math.PI * 2; i.position.set(Math.cos(a) * 1.65 * abre, Math.sin(t * 2 + n) * 0.15, Math.sin(a) * 1.65 * abre); i.rotation.y = t + n; });
        aneis.forEach((a, n) => { a.rotation.z = t * (n ? -0.4 : 0.4); a.scale.setScalar(abre); });
        centroBrilho.scale.setScalar((1 + 0.15 * Math.sin(t * 6)) * (explode ? 1 + smooth(0, 0.2, k) * 1.5 - smooth(0.2, 0.6, k) * 1.5 : 1));
        if (explode) { fagulhas.points.scale.setScalar(0.2 + ease(smooth(0, 0.6, k)) * 1.6); fagulhas.points.material.opacity = 1 - smooth(0.5, 1, k); }
        est.points.rotation.y = t * 0.02;
      }
    };
  },

  // folha dobrando; pilha = a espessura dobrando até virar torre
  papel(ctx) {
    const pilha = !!ctx.args.pilha;
    const { scene, est } = espaco(ctx, '#0b7285', '#011418');
    const mesa = new THREE.Mesh(new THREE.CylinderGeometry(1.6, 1.6, 0.1, 48), clay(0x1864ab)); mesa.position.y = -0.05; mesa.receiveShadow = true; scene.add(mesa);
    const base = folha(); base.position.y = 0.01; scene.add(base);
    const aba = new THREE.Group(); aba.position.set(0, 0.012, 0); scene.add(aba);
    const fl = folha(); fl.scale.x = 0.5; fl.position.x = 0.35; aba.add(fl);
    const torre = new THREE.Mesh(new THREE.BoxGeometry(0.7, 1, 0.5), clay(0xf8f9fa, { sheen: 0.4 })); torre.visible = pilha; scene.add(torre);
    const linhas = new THREE.Mesh(new THREE.BoxGeometry(0.72, 1, 0.52), new THREE.MeshBasicMaterial({ color: 0x74c0fc, wireframe: true, transparent: true, opacity: 0.25 })); linhas.visible = pilha; scene.add(linhas);
    const cam = camHud(ctx, 38); scene.add(cam); const cont = hud(cam, 'DOBRA 1', '#ffd43b', 0.42, 0.9);
    return {
      scene, cam, rig: pilha ? { target: V(0, 2.4, 0), dist: 8.0, pitch: 0.1, fov: 38 } : { target: V(0, 0.45, 0), dist: 5.2, pitch: 0.55, fov: 38 }, bloom: [0.25, 0.4, 0.9],
      update(t, d, k) {
        est.update?.(t);
        if (!pilha) {
          const f = (t * 1.6) % 1; aba.rotation.z = Math.PI * ease(clamp(f * 1.3));
          const n = 1 + Math.floor(t * 1.6); cont.userData.set('DOBRA ' + n);
          base.scale.y = Math.pow(2, Math.min(n, 6) * 0.35); fl.visible = true;
        } else {
          aba.visible = false; base.visible = false;
          const n = Math.min(42, Math.floor(8 + ease(k) * 34)); const h = 0.05 * Math.pow(1.13, n);
          torre.scale.y = h; torre.position.y = h / 2; linhas.scale.y = h; linhas.position.y = h / 2;
          cont.userData.set('DOBRA ' + n);
        }
      }
    };
  },

  // Terra → coluna de papel → Lua (numero = mostra a distância)
  lua(ctx) {
    const numero = !!ctx.args.numero;
    const { scene, est } = espaco(ctx, '#0b1e4a', '#010208', 800);
    const t = terra(1.2); t.position.set(0, -4, 0); scene.add(t);
    const l = lua(0.55); l.position.set(0, 5.2, -0.5); scene.add(l);
    const coluna = new THREE.Mesh(new THREE.BoxGeometry(0.16, 1, 0.12), clay(0xf8f9fa, { emissive: 0x333333 })); scene.add(coluna);
    const halo = new THREE.Mesh(new THREE.BoxGeometry(0.3, 1, 0.22), glow(0x74c0fc, 0.35, { opacity: 0.15 })); scene.add(halo);
    const cam = camHud(ctx, 46); scene.add(cam); const num = hud(cam, '439.000 KM', '#ffd43b', 0.45, 1.15); num.visible = numero; const sub = hud(cam, 'MAIS LONGE QUE A LUA', '#ffffff', 0.18, 1.0); sub.visible = numero;
    return {
      scene, cam, rig: { target: V(0, 0.4, 0), dist: 15.5, pitch: 0.02, fov: 46 }, bloom: [0.35, 0.4, 0.8],
      update(tt, d, k) {
        t.rotation.y = tt * 0.2; l.rotation.y = tt * 0.1;
        const topo = numero ? 5.2 : lerp(-2.8, 5.2, ease(clamp(k * 1.3)));
        const h = topo + 2.8; coluna.scale.y = h; coluna.position.y = -2.8 + h / 2; halo.scale.y = h; halo.position.y = coluna.position.y;
        if (numero) { const s = ease(smooth(0, 0.25, k)); num.scale.setScalar(s); sub.scale.setScalar(s); }
      }
    };
  },

  // estrela de nêutrons pulsando com feixes
  estrela(ctx) {
    const { scene, est } = espaco(ctx, '#0c2a6b', '#01030d', 700);
    const nucleo = blob(0.7, glow(0xa5d8ff, 1.0), { seed: 4, noise: 0.02 }); scene.add(nucleo);
    const coroa = new THREE.Mesh(new THREE.SphereGeometry(1.0, 40, 30), glow(0x4dabf7, 0.5, { opacity: 0.18 })); scene.add(coroa);
    const feixes = new THREE.Group(); scene.add(feixes);
    for (const s of [1, -1]) { const f = new THREE.Mesh(new THREE.ConeGeometry(0.35, 5, 24, 1, true), glow(0x99e9f2, 0.7, { opacity: 0.3, side: THREE.DoubleSide })); f.position.y = s * 2.8; f.rotation.z = s > 0 ? Math.PI : 0; feixes.add(f); }
    feixes.rotation.z = 0.5;
    const aneis = [anelNeon(1.4, 0x74c0fc, 0.02), anelNeon(1.9, 0xb197fc, 0.02), anelNeon(2.4, 0x74c0fc, 0.015)];
    aneis.forEach((a, i) => { a.rotation.x = Math.PI / 2 + i * 0.25; scene.add(a); });
    return {
      scene, rig: { target: V(0, -0.3, 0), dist: 8.5, pitch: 0.15, fov: 40 }, bloom: [0.55, 0.5, 0.7],
      update(t) { feixes.rotation.y = t * 3; nucleo.scale.setScalar(1 + 0.05 * Math.sin(t * 30)); coroa.scale.setScalar(1 + 0.08 * Math.sin(t * 4)); aneis.forEach((a, i) => { a.rotation.z = t * (0.5 + i * 0.3); }); }
    };
  },

  // colher com um pedacinho de estrela; carros = balança contra uma montanha de carros
  colher(ctx) {
    const carros = !!ctx.args.carros;
    const { scene } = espaco(ctx, '#3b0764', '#05010f', 300);
    const col = colher(); scene.add(col);
    const pedaco = blob(0.13, glow(0xa5d8ff, 1.3), { seed: 2, noise: 0.25, freq: 6 }); scene.add(pedaco);
    const luz = new THREE.PointLight(0x74c0fc, 2.5, 2, 2); scene.add(luz);
    const cam = camHud(ctx, 38); scene.add(cam); const peso = hud(cam, 'BILHÕES DE TONELADAS', '#ffd43b', 0.45, 1.05);
    let viga = null, pratoA = null, pratoB = null, monte = null;
    if (carros) {
      const base = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.3, 1.8, 16), clay(0xffd43b, { coat: 0.6 })); base.position.y = -0.4; scene.add(base);
      viga = new THREE.Group(); viga.position.y = 0.5; scene.add(viga);
      const barra = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.08, 0.12), clay(0xffd43b, { coat: 0.6 })); viga.add(barra);
      pratoA = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.45, 0.08, 32), clay(0xf8f9fa)); pratoB = pratoA.clone(); scene.add(pratoA, pratoB);
      monte = new THREE.Group(); scene.add(monte);
      const cores = [0xff6b6b, 0x4dabf7, 0x69db7c, 0xffd43b, 0xda77f2, 0xff922b];
      for (let i = 0; i < 22; i++) { const c = carro(cores[i % 6]); const lin = Math.floor(i / 7), col2 = i % 7; c.position.set((col2 - 3) * 0.14 + (lin % 2) * 0.07, lin * 0.22, ((i * 37) % 5 - 2) * 0.08); c.rotation.y = i; c.scale.setScalar(0.7); monte.add(c); }
      col.scale.setScalar(0.55);
    }
    return {
      scene, cam, rig: carros ? { target: V(0, 0.05, 0), dist: 7.6, pitch: 0.12, fov: 38 } : { target: V(-0.35, -0.35, 0), dist: 3.6, pitch: 0.3, fov: 38 }, bloom: [0.4, 0.4, 0.8],
      update(t, d, k) {
        if (!carros) {
          col.position.y = -0.2 - ease(smooth(0, 0.25, k)) * 0.35 + Math.sin(t * 40) * 0.006 * (k > 0.2 ? 1 : 0); col.rotation.z = -0.08;
          pedaco.position.set(0, col.position.y + 0.12, 0); luz.position.copy(pedaco.position).add(V(0, 0.4, 0.4));
          peso.scale.setScalar(Math.max(0.001, smooth(0.2, 0.4, k)));
        } else {
          const tilt = -0.32 * ease(smooth(0.05, 0.4, k)) + Math.sin(t * 3) * 0.01; viga.rotation.z = tilt;
          const pA = V(-1.5, 0, 0).applyEuler(viga.rotation).add(viga.position), pB = V(1.5, 0, 0).applyEuler(viga.rotation).add(viga.position);
          pratoA.position.copy(pA).add(V(0, -0.55, 0)); pratoB.position.copy(pB).add(V(0, -0.55, 0));
          col.position.copy(pratoA.position).add(V(0.35, 0.12, 0)); pedaco.position.copy(col.position).add(V(0, 0.08, 0)); luz.position.copy(pedaco.position).add(V(0, 0.5, 0.5));
          monte.position.copy(pratoB.position).add(V(0, 0.04, 0));
          peso.userData.set('MAIS QUE TODOS OS CARROS');
        }
        pedaco.scale.setScalar(1 + 0.15 * Math.sin(t * 12));
      }
    };
  },

  // Vênus: número do dia x ano; orbita = gira em volta do Sol mas quase não gira em si
  venus(ctx) {
    const orbita = !!ctx.args.orbita;
    const { scene } = espaco(ctx, '#5c1a00', '#0a0200', 500);
    const v = new THREE.Group(); scene.add(v);
    const corpo = blob(1.1, clay(0xf59f00, { sheen: 0.5 }), { seed: 6, noise: 0.06, freq: 5 }); v.add(corpo);
    for (let i = 0; i < 5; i++) { const fx = new THREE.Mesh(new THREE.TorusGeometry(1.0 - i * 0.05, 0.05, 8, 48, Math.PI * 1.2), clay(0xffd8a8)); fx.rotation.x = Math.PI / 2 + (i - 2) * 0.28; fx.rotation.z = i; v.add(fx); }
    const bandeira = new THREE.Group(); const haste = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.5, 8), clay(0xffffff)); haste.position.y = 0.25; bandeira.add(haste); const pano = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.15, 0.01), clay(0xff6b6b)); pano.position.set(0.13, 0.42, 0); bandeira.add(pano); bandeira.position.y = 1.08; v.add(bandeira);
    const cam = camHud(ctx, 38); scene.add(cam); const dia = hud(cam, 'DIA = 243 DIAS', '#ffd43b', 0.5, 1.0), ano = hud(cam, 'ANO = 225 DIAS', '#74c0fc', 0.27, 1.0);
    let sol = null;
    if (orbita) { sol = blob(1.3, glow(0xff922b, 1.25), { seed: 3, noise: 0.1, freq: 4 }); scene.add(sol); v.scale.setScalar(0.6); const trilha = anelNeon(3, 0xffa94d, 0.015); trilha.rotation.x = Math.PI / 2; scene.add(trilha); }
    return {
      scene, cam, rig: orbita ? { target: V(0, -0.9, 0), dist: 11.0, pitch: 0.5, fov: 40 } : { target: V(0, 0.55, 0), dist: 7.4, pitch: 0.1, fov: 38 }, bloom: orbita ? [0.45, 0.4, 0.75] : [0.3, 0.4, 0.85],
      update(t, d, k) {
        if (orbita) {
          const a = t * 1.4; v.position.set(Math.cos(a) * 3, 0, Math.sin(a) * 3); v.rotation.y = t * 0.08; // gira muito devagar
          dia.visible = ano.visible = false; sol.rotation.y = t * 0.3;
        } else {
          v.rotation.y = t * 0.15;
          dia.scale.setScalar(Math.max(0.001, ease(smooth(0.1, 0.3, k))));
          ano.scale.setScalar(Math.max(0.001, ease(smooth(0.35, 0.55, k))));
        }
      }
    };
  },

  // banana radioativa; pilha = montanha de bananas
  banana(ctx) {
    const pilha = !!ctx.args.pilha;
    const { scene } = espaco(ctx, '#0b3d17', '#010a03', 300);
    const b = banana(1.4); b.position.set(0, -0.35, 0); scene.add(b);
    const aneis = [0, 1, 2].map(i => { const a = anelNeon(0.6, 0x69db7c, 0.025); a.material.transparent = true; scene.add(a); return a; });
    const brilho = particles(90, [-1.5, -1, -1, 3, 2.5, 2], { color: 0x8ce99a, size: 0.05, rise: 0.5, opacity: 0.6 }); scene.add(brilho.points);
    const simbolo = new THREE.Group(); scene.add(simbolo);
    for (let i = 0; i < 3; i++) { const p = new THREE.Mesh(new THREE.CircleGeometry(0.35, 24, i * 2.094 - 0.5, 1.0), glow(0xffd43b, 1.0, { side: THREE.DoubleSide })); simbolo.add(p); }
    const miolo = new THREE.Mesh(new THREE.CircleGeometry(0.08, 20), glow(0xffd43b, 1.6)); simbolo.add(miolo);
    const monte = new THREE.Group(); monte.visible = pilha; scene.add(monte);
    if (pilha) { for (let i = 0; i < 70; i++) { const bb = banana(0.45); const r = Math.sqrt(i / 70) * 2.2, a = i * 2.4; bb.position.set(Math.cos(a) * r, -0.9 + (2.2 - r) * 0.7, Math.sin(a) * r - 1.0); bb.rotation.set(i, i * 0.7, i * 1.3); monte.add(bb); } }
    const cam = camHud(ctx, 38); scene.add(cam); const txt = hud(cam, 'MILHÕES DE UMA VEZ', '#ffd43b', 0.45, 1.05); txt.visible = pilha;
    return {
      scene, cam, rig: pilha ? { target: V(0, 0.2, 0), dist: 8.0, pitch: 0.2, fov: 38 } : { target: V(0, 0.55, 0), dist: 5.6, pitch: 0.1, fov: 38 }, bloom: [0.35, 0.4, 0.8],
      update(t, d, k) {
        b.rotation.y = t * 0.6; brilho.update(t);
        aneis.forEach((a, i) => { const c = (t * 0.7 + i / 3) % 1; a.scale.setScalar(0.8 + c * 3); a.material.opacity = 1 - c; a.position.y = 0; a.rotation.x = Math.PI / 2; });
        simbolo.position.set(0, 1.4, 0.3); simbolo.rotation.z = t * 1.5; simbolo.visible = !pilha;
        if (pilha) { b.visible = false; txt.scale.setScalar(Math.max(0.001, ease(smooth(0.2, 0.4, k)))); monte.rotation.y = t * 0.15; }
      }
    };
  },

  galaxia(ctx) {
    const { scene } = espaco(ctx, '#160b38', '#010007', 600);
    const g = galaxia(); g.rotation.x = 0.5; scene.add(g);
    const nucleo = new THREE.Mesh(new THREE.SphereGeometry(0.3, 24, 18), glow(0xfff3bf, 1.1)); scene.add(nucleo);
    return {
      scene, rig: { target: V(0, -0.6, 0), dist: 8.5, pitch: 0.35, fov: 42 }, bloom: [0.6, 0.5, 0.55],
      update(t) { g.rotation.y = t * 0.25; nucleo.scale.setScalar(1 + 0.08 * Math.sin(t * 3)); }
    };
  },

  // planetinha coberto de árvores
  floresta(ctx) {
    const { scene } = espaco(ctx, '#0b4f2a', '#010a04', 400);
    const p = new THREE.Group(); scene.add(p);
    p.add(blob(1.6, clay(0x2b8a3e), { seed: 2, noise: 0.03 }));
    const rng = ctx.rng;
    for (let i = 0; i < 160; i++) {
      const tr = arvore(rng); const u = rng() * 2 - 1, a = rng() * Math.PI * 2, s = Math.sqrt(1 - u * u);
      const n = V(Math.cos(a) * s, u, Math.sin(a) * s); tr.position.copy(n.clone().multiplyScalar(1.6)); tr.quaternion.setFromUnitVectors(V(0, 1, 0), n); tr.scale.setScalar(0.7 + rng() * 0.5); p.add(tr);
    }
    const cam = camHud(ctx, 40); scene.add(cam); const num = hud(cam, '3 TRILHÕES', '#69db7c', 0.47, 1.05);
    return {
      scene, cam, rig: { target: V(0, 0.4, 0), dist: 8.6, pitch: 0.2, fov: 40 }, bloom: [0.3, 0.4, 0.85],
      update(t, d, k) { p.rotation.y = t * 0.3; p.rotation.x = 0.3; num.scale.setScalar(Math.max(0.001, ease(smooth(0.15, 0.35, k))) * (1 + 0.04 * Math.sin(t * 6))); }
    };
  },

  // placar final: árvores x estrelas
  versus(ctx) {
    const { scene } = espaco(ctx, '#3b0764', '#05010f', 400);
    const ar = arvore(ctx.rng); ar.scale.setScalar(2.4); ar.position.set(-0.85, -0.6, 0); scene.add(ar);
    const es = new THREE.Mesh(new THREE.OctahedronGeometry(0.45, 0), glow(0xffd43b, 1.0)); es.position.set(0.85, 0.3, 0); scene.add(es);
    const cam = camHud(ctx, 40); scene.add(cam); const a = hud(cam, 'ÁRVORES: 3 TRILHÕES', '#69db7c', 0.55, 1.1), b = hud(cam, 'ESTRELAS: 100-400 BI', '#ffd43b', 0.33, 1.1); const vs = placa('VS', '#ffffff', 1.0); vs.position.set(0, 0.6, 0.6); scene.add(vs);
    const coroa = new THREE.Mesh(new THREE.ConeGeometry(0.25, 0.3, 5), clay(0xffd43b, { coat: 1, emissive: 0x332200 })); scene.add(coroa);
    return {
      scene, cam, rig: { target: V(0, 0.9, 0), dist: 6.8, pitch: 0.05, fov: 40 }, bloom: [0.35, 0.4, 0.8],
      update(t, d, k) { es.rotation.set(t, t * 1.3, 0); vs.scale.setScalar(1 + 0.1 * Math.sin(t * 8)); coroa.position.set(-0.85, 2.15 + Math.sin(t * 4) * 0.05, 0.3); coroa.rotation.y = t * 2; coroa.scale.setScalar(ease(smooth(0.3, 0.5, k))); }
    };
  },
};

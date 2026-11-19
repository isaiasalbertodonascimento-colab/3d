// Cenas: "O polvo tem três corações, sangue azul e nove cérebros"
import * as THREE from 'three';
import { studio, blob, tube, clay, wet, glow, cut, particles, smooth, lerp, clamp, ease, V } from './lib.js';

const COR = 0xe8590c;

// ---------- polvo de massinha ----------
function polvo(o = {}) {
  const g = new THREE.Group();
  const pele = clay(o.cor ?? COR, { sheen: 0.8, coat: 0.3, opacity: o.opacity, side: o.opacity ? THREE.DoubleSide : THREE.FrontSide });
  const manto = blob(0.55, pele, { seed: 4, noise: 0.05, stretch: V(0.95, 1.3, 0.95) }); manto.position.set(0, 1.15, -0.08); manto.rotation.x = -0.25; g.add(manto);
  const pintas = [];
  if (!o.opacity) for (let i = 0; i < 9; i++) {
    const a = i * 2.4, h = 0.9 + (i % 3) * 0.25;
    const p = new THREE.Mesh(new THREE.SphereGeometry(0.05 + (i % 2) * 0.025, 12, 8), clay(0xffa94d)); p.position.set(Math.sin(a) * 0.5, h + 0.2, Math.cos(a) * 0.5 - 0.08); p.scale.z = 0.4; p.lookAt(0, h + 0.2, -0.08); g.add(p); pintas.push(p);
  }
  const olhos = [], pupilas = [];
  for (const s of [-1, 1]) {
    const ol = new THREE.Mesh(new THREE.SphereGeometry(0.16, 24, 18), clay(0xfffbe6, { coat: 1, rough: 0.15 })); ol.position.set(s * 0.27, 0.78, 0.36); g.add(ol); olhos.push(ol);
    const pu = new THREE.Mesh(new THREE.BoxGeometry(0.17, 0.05, 0.05, 2, 2, 2), clay(0x111111, { coat: 1 })); pu.position.set(s * 0.27, 0.78, 0.5); g.add(pu); pupilas.push(pu);
    const pa = new THREE.Mesh(new THREE.SphereGeometry(0.17, 24, 12, 0, Math.PI * 2, 0, Math.PI * 0.45), pele); pa.position.copy(ol.position); pa.rotation.x = -0.35; g.add(pa);
  }
  const bracos = [];
  const N = 16;
  for (let i = 0; i < 8; i++) {
    const segs = [];
    for (let j = 0; j < N; j++) {
      const u = j / (N - 1), r = 0.13 * (1 - u * 0.8);
      const m = new THREE.Mesh(new THREE.SphereGeometry(r, 14, 10), pele); m.castShadow = true; g.add(m);
      if (j % 2 === 1 && !o.opacity) { const v = new THREE.Mesh(new THREE.SphereGeometry(r * 0.45, 10, 8), clay(0xffd8a8)); v.position.y = -r * 0.85; v.scale.y = 0.5; m.add(v); }
      segs.push(m);
    }
    bracos.push(segs);
  }
  g.userData = { manto, pele, olhos, pupilas, bracos, pintas };
  return g;
}
// modo: 'repousa' | 'nada' | 'rasteja' | 'acena'
function posePolvo(g, t, modo = 'repousa', o = {}) {
  const { bracos, manto, pupilas } = g.userData, N = bracos[0].length;
  manto.scale.set(1, 1 + Math.sin(t * 2) * 0.03, 1);
  pupilas.forEach((p, i) => { p.position.x = (i ? 1 : -1) * 0.27 + (o.olharX ?? 0) * 0.04; p.scale.y = 1 + (o.susto ?? 0) * 2; });
  bracos.forEach((segs, i) => {
    const a = (i + 0.5) / 8 * Math.PI * 2;
    segs.forEach((m, j) => {
      const u = j / (N - 1); let x, y, z;
      if (modo === 'nada') {
        const r = 0.28 + u * 0.12 + Math.sin(t * 3) * 0.05 * u, sw = Math.sin(t * 3 - u * 3) * 0.12 * u;
        x = Math.cos(a) * r + sw; z = Math.sin(a) * r; y = 0.55 - u * 1.5;
      } else if (modo === 'acena' && i === 1) {
        x = 0.35 + u * 0.55 + Math.sin(t * 6 - u * 2) * 0.15 * u; y = 0.55 + u * 1.0; z = 0.25;
      } else {
        const passo = modo === 'rasteja' ? Math.sin(t * 5 + i * 1.3) : Math.sin(t * 1.4 + i);
        const r = 0.3 + u * 1.15, onda = passo * 0.18 * u;
        const aa = a + onda;
        x = Math.cos(aa) * r; z = Math.sin(aa) * r;
        y = 0.06 + 0.5 * Math.pow(1 - u, 1.6) + (modo === 'rasteja' ? Math.max(0, passo) * 0.12 * Math.sin(u * Math.PI) : 0);
        if (u > 0.75) { const c = (u - 0.75) / 0.25; y += c * c * 0.18; const k = 1 - c * 0.25; x *= k; z *= k; }
      }
      m.position.set(x, y, z);
    });
  });
}
const corPolvo = (g, c) => g.userData.pele.color.set(c);

// ---------- cenário marinho ----------
function mar(ctx, o = {}) {
  const { scene, key } = studio(ctx, { top: o.top ?? '#1c7ed6', bottom: o.bottom ?? '#03142e', floorColor: 0xe9c46a, floorR: 14, rimColor: 0x99e9f2, keyColor: 0xd0ebff, keyI: 2.2, fog: o.fog ?? 0x0b3d6e, fogNear: 6, fogFar: 22, ...o.studio });
  const extras = [];
  if (o.fundo !== false) {
    const rng = ctx.rng;
    for (let i = 0; i < 7; i++) { const r = blob(0.3 + rng() * 0.5, clay(0x6c757d), { seed: i, noise: 0.15 }); r.position.set((rng() - 0.5) * 9, 0.05, -2 - rng() * 5); r.scale.y = 0.6; scene.add(r); }
    const algas = [];
    for (let i = 0; i < 9; i++) {
      const x = (rng() - 0.5) * 8, z = -1.5 - rng() * 5, h = 1 + rng() * 1.6;
      const al = tube([[0, 0, 0], [0.1, h * 0.4, 0], [-0.1, h * 0.75, 0], [0.05, h, 0]], u => 0.06 * (1 - u * 0.6), clay(i % 2 ? 0x2f9e44 : 0x5c940d), { segments: 24, radial: 8 });
      al.position.set(x, 0, z); scene.add(al); algas.push({ al, ph: rng() * 6 });
    }
    extras.push(t => algas.forEach(a => { a.al.rotation.z = Math.sin(t * 1.2 + a.ph) * 0.12; }));
  }
  const bolhas = particles(o.bolhas ?? 90, [-4, 0, -4, 8, 5, 6], { color: 0xe7f5ff, size: 0.06, rise: 0.5, opacity: 0.6 }); scene.add(bolhas.points);
  extras.push(t => { bolhas.update(t); key.position.x = 3 + Math.sin(t * 0.7) * 1.2; key.intensity = 2.2 + Math.sin(t * 2.3) * 0.25; }); // luz ondulando como água
  return { scene, update: t => extras.forEach(f => f(t)) };
}

export default {
  polvo(ctx) {
    const acao = ctx.args.acao || 'repousa', close = !!ctx.args.close;
    const m = mar(ctx);
    const p = polvo(); m.scene.add(p);
    const titulo = ctx.shot.start < 2.6;
    const fim = ctx.shot.beat === 6;
    const rig = close ? { target: V(0, 0.8, 0), dist: 3.9, pitch: 0.05, fov: 32 }
      : { target: V(0, titulo || fim ? 1.45 : 0.75, 0), dist: 4.8, pitch: 0.18, fov: 36 };
    return {
      scene: m.scene, rig, bloom: [0.3, 0.5, 0.85],
      update(t, d, k) {
        m.update(t);
        if (acao === 'rasteja') { p.position.x = lerp(-1.2, 1.2, k); posePolvo(p, t, 'rasteja'); }
        else if (acao === 'cores') {
          const c = new THREE.Color().setHSL((Math.floor(t * 5) * 0.17) % 1, 0.8, 0.5, THREE.SRGBColorSpace); corPolvo(p, c); posePolvo(p, t, 'repousa', { susto: 0.2 });
        } else posePolvo(p, t, acao === 'acena' ? 'acena' : 'repousa', { olharX: acao === 'olha' ? Math.sin(t * 1.5) : 0 });
      }
    };
  },

  // corte do manto: 2 corações das brânquias + coração sistêmico (args.para = ele para)
  coracoes(ctx) {
    const foco = ctx.args.foco, para = !!ctx.args.para;
    const { scene } = studio(ctx, { top: '#862e9c', bottom: '#12051f', floor: false, rimColor: 0x99e9f2, keyI: 1.9, envI: 0.3 });
    const plano = cut(V(0, 0, -1), 0);
    const casca = blob(1.5, clay(COR, { clip: [plano], side: THREE.DoubleSide, sheen: 0.8 }), { seed: 4, noise: 0.04, stretch: V(0.9, 1.25, 0.85) }); scene.add(casca);
    const dentro = blob(1.4, wet(0x5f1a37, { clip: [plano], side: THREE.BackSide }), { seed: 4, noise: 0.04, stretch: V(0.9, 1.25, 0.85) }); scene.add(dentro);
    const azul = wet(0x339af0, { coat: 1 });
    const cor = (r, x, y) => { const c = blob(r, wet(0xe03131, { coat: 1, emissive: 0x330000 }), { seed: x * 10 + 3, noise: 0.07 }); c.position.set(x, y, 0); scene.add(c); return c; };
    const bA = cor(0.22, -0.68, -0.55), bB = cor(0.22, 0.68, -0.55), sis = cor(0.36, 0, 0.05);
    const branquias = [-1, 1].map(s => { const b = blob(0.32, wet(0xffc9c9), { seed: 6 + s, noise: 0.25, freq: 9, stretch: V(0.7, 1.3, 0.7) }); b.position.set(s * 0.72, -0.05, -0.1); scene.add(b); return b; });
    const vasos = [
      tube([[-0.68, -0.55, 0], [-0.72, -0.3, 0], [-0.72, -0.05, -0.05]], 0.06, azul), tube([[0.68, -0.55, 0], [0.72, -0.3, 0], [0.72, -0.05, -0.05]], 0.06, azul),
      tube([[-0.6, 0.2, -0.05], [-0.3, 0.15, 0], [0, 0.05, 0]], 0.06, azul), tube([[0.6, 0.2, -0.05], [0.3, 0.15, 0], [0, 0.05, 0]], 0.06, azul),
      tube([[0, 0.35, 0], [0, 0.9, 0], [0.2, 1.4, -0.1]], 0.07, azul), tube([[0, -0.25, 0], [0, -0.9, 0], [0, -1.6, 0]], 0.07, azul)];
    vasos.forEach(v => scene.add(v));
    const anel = new THREE.Mesh(new THREE.TorusGeometry(0.5, 0.025, 8, 48), glow(0xffe066, 1.6)); scene.add(anel);
    if (foco === 'branquias') anel.position.set(-0.68, -0.55, 0.1), anel.scale.setScalar(0.65);
    else if (foco === 'sistemico') anel.position.set(0, 0.05, 0.1);
    else anel.visible = false;
    const fluxo = particles(70, [-0.9, -1.4, -0.05, 1.8, 2.8, 0.1], { color: 0x74c0fc, size: 0.05, rise: 0.5 }); scene.add(fluxo.points);
    const rig = foco ? { target: V(0, -0.2, 0), dist: 4.6, pitch: 0.08, fov: 38 } : { target: V(0, 0.0, 0), dist: 5.6, pitch: 0.1, fov: 38 };
    return {
      scene, rig, bloom: [0.35, 0.5, 0.8],
      update(t, d, k) {
        fluxo.update(t);
        const bate = (f, ph = 0) => { const q = (t * f + ph) % 1; return Math.exp(-q * 8); };
        bA.scale.setScalar(1 + 0.12 * bate(1.6)); bB.scale.setScalar(1 + 0.12 * bate(1.6, 0.1));
        const vivo = para ? 1 - smooth(0.1, 0.4, k) : 1;
        sis.scale.setScalar(1 + 0.12 * bate(1.6, 0.4) * vivo);
        sis.material.color.setRGB(lerp(0.45, 0.88, vivo), lerp(0.45, 0.19, vivo), lerp(0.5, 0.19, vivo));
        anel.scale.setScalar((foco === 'branquias' ? 0.65 : 1) * (1 + 0.06 * Math.sin(t * 6))); anel.rotation.z = t;
      }
    };
  },

  // nadando em mar aberto (o coração sistêmico desliga)
  nada(ctx) {
    const m = mar(ctx, { fundo: false, studio: { floor: false }, top: '#339af0', bottom: '#041f3d', bolhas: 150 });
    const p = polvo(); p.rotation.z = -1.1; m.scene.add(p);
    const raios = [0, 1, 2, 3].map(i => { const r = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 9), glow(0xd0ebff, 0.25, { opacity: 0.35 })); r.position.set(-3 + i * 2, 3, -4); r.rotation.z = 0.25; m.scene.add(r); return r; });
    return {
      scene: m.scene, rig: { target: V(0, 0.9, 0), dist: 5.2, pitch: 0.05, fov: 38 },
      update(t, d, k) {
        m.update(t); raios.forEach((r, i) => { r.material.opacity = 0.2 + 0.15 * Math.sin(t * 1.5 + i); });
        p.position.set(lerp(1.6, -1.6, k), 0.8 + Math.sin(t * 3) * 0.1, 0); posePolvo(p, t, 'nada');
      }
    };
  },

  // vaso com sangue azul: cobre (laranja) carregando oxigênio
  sangue(ctx) {
    const close = !!ctx.args.close;
    const { scene } = studio(ctx, { top: '#1864ab', bottom: '#020c1c', floor: false, rimColor: 0x99e9f2, keyI: 1.9, envI: 0.3 });
    const plano = cut(V(0, 0, -1), 0);
    const pts = [[-5, -0.2, 0], [-2, 0.15, 0], [0, 0, 0], [2, -0.15, 0], [5, 0.2, 0]];
    scene.add(tube(pts, 0.9, wet(0xf783ac, { clip: [plano], side: THREE.DoubleSide }), { segments: 120, radial: 32 }));
    scene.add(tube(pts, 0.82, wet(0x1c7ed6, { clip: [plano], side: THREE.BackSide }), { segments: 120, radial: 32 }));
    const liquido = particles(320, [-5, -0.75, -0.6, 10, 1.5, 0.5], { color: 0xa5d8ff, size: 0.11, rise: 0, opacity: 0.9 }); scene.add(liquido.points);
    const cobre = [], rng = ctx.rng;
    for (let i = 0; i < 18; i++) {
      const gr = new THREE.Group();
      const cu = new THREE.Mesh(new THREE.IcosahedronGeometry(0.17, 1), clay(0xe8590c, { coat: 1, rough: 0.15, emissive: 0x401400 })); gr.add(cu);
      for (const s of [-1, 1]) { const ox = new THREE.Mesh(new THREE.SphereGeometry(0.06, 12, 10), glow(0xffffff, 1.1)); ox.position.set(s * 0.09, 0.2, 0); ox.scale.setScalar(1.4); gr.add(ox); }
      gr.userData = { ph: rng(), y: (rng() - 0.5) * 1.1, z: -rng() * 0.6, r: rng() * 6 }; scene.add(gr); cobre.push(gr);
    }
    return {
      scene, rig: close ? { target: V(0, 0, 0), dist: 3.0, pitch: 0.05, fov: 34 } : { target: V(0, 0, 0), dist: 6.0, pitch: 0.12, fov: 40 }, bloom: [0.35, 0.4, 0.85],
      update(t) {
        liquido.points.position.x = ((t * 0.6) % 2) - 1;
        cobre.forEach(c => { const u = c.userData; c.position.set(((u.ph * 10 + t * 0.6) % 10) - 5, u.y + Math.sin(t * 2 + u.r) * 0.05, u.z); c.rotation.set(t + u.r, t * 0.8, 0); });
      }
    };
  },

  // sistema nervoso: cérebro central + "mini cérebros" e sinais correndo pelos braços
  rede(ctx) {
    const bracos = !!ctx.args.bracos;
    const m = mar(ctx, { top: '#0b4f6c', bottom: '#010a12', fundo: false, studio: { floor: false } });
    const p = polvo({ opacity: 0.3, cor: 0xff922b }); m.scene.add(p);
    const cerebro = blob(0.22, glow(0xffd43b, 1.4), { seed: 2, noise: 0.15, freq: 8 }); cerebro.position.set(0, 0.95, 0.05); m.scene.add(cerebro);
    const nos = [], sinais = [];
    for (let i = 0; i < 8; i++) {
      const n = new THREE.Mesh(new THREE.SphereGeometry(0.075, 14, 10), glow(0xffd43b, 1.3)); m.scene.add(n); nos.push(n);
      const s = new THREE.Mesh(new THREE.SphereGeometry(0.045, 10, 8), glow(0x96f2d7, 2)); m.scene.add(s); sinais.push(s);
    }
    return {
      scene: m.scene, rig: bracos ? { target: V(0.4, 0.3, 0.4), dist: 3.4, pitch: 0.5, fov: 36 } : { target: V(0, 0.7, 0), dist: 4.6, pitch: 0.35, fov: 38 }, bloom: [0.35, 0.4, 0.85], exposure: 0.85,
      update(t) {
        m.update(t); posePolvo(p, t, 'repousa');
        cerebro.scale.setScalar(1 + 0.08 * Math.sin(t * 5));
        const segs = p.userData.bracos;
        nos.forEach((n, i) => { n.position.copy(segs[i][3].position); n.scale.setScalar(1 + 0.25 * Math.max(0, Math.sin(t * 6 + i))); });
        sinais.forEach((s, i) => { const u = ((t * 0.8 + i * 0.13) % 1) * (segs[i].length - 1); const a = Math.floor(u), f = u - a; s.position.lerpVectors(segs[i][a].position, segs[i][Math.min(a + 1, segs[i].length - 1)].position, f); s.position.y += 0.08; });
      }
    };
  },

  // close nas ventosas provando uma concha
  ventosa(ctx) {
    const m = mar(ctx, { fundo: false, top: '#1864ab', bottom: '#020c1c', studio: { floor: false } });
    const curva = [[-2.2, 1.6, 0], [-1.2, 0.9, 0.1], [-0.3, 0.45, 0], [0.4, 0.38, 0], [0.9, 0.6, 0], [1.05, 0.95, 0]];
    const braco = tube(curva, u => 0.32 * (1 - u * 0.75), clay(COR, { sheen: 0.8 }), { segments: 120, radial: 24 }); m.scene.add(braco);
    const c = braco.userData.curve, vs = [];
    for (let i = 0; i < 14; i++) {
      const u = 0.12 + i * 0.06, pnt = c.getPointAt(u), tg = c.getTangentAt(u), r = 0.32 * (1 - u * 0.75);
      const v = new THREE.Mesh(new THREE.TorusGeometry(r * 0.45, r * 0.18, 10, 24), clay(0xffd8a8)); v.position.copy(pnt).add(V(tg.y * r * 0.9, -tg.x * r * 0.9, 0.12)); v.lookAt(v.position.clone().add(V(tg.y, -tg.x, 0.4))); m.scene.add(v); vs.push(v);
    }
    const concha = new THREE.Group(); concha.position.set(0.2, 0.12, 0.1); m.scene.add(concha);
    for (const s of [1, -1]) { const h = new THREE.Mesh(new THREE.SphereGeometry(0.32, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2), clay(0xfff0f6, { sheen: 1, side: THREE.DoubleSide })); h.scale.set(1, 0.4 * s, 0.85); concha.add(h); }
    const gosto = particles(70, [-0.2, 0.1, -0.1, 0.8, 0.9, 0.4], { color: 0xffe066, size: 0.06, rise: 0.4 }); m.scene.add(gosto.points);
    return {
      scene: m.scene, rig: { target: V(-0.2, 0.55, 0), dist: 4.2, pitch: 0.2, fov: 36 }, bloom: [0.3, 0.4, 0.85],
      update(t) { m.update(t); gosto.update(t); vs.forEach((v, i) => v.scale.setScalar(1 + 0.12 * Math.sin(t * 5 - i * 0.6))); concha.rotation.y = Math.sin(t) * 0.1; }
    };
  },

  // olho com pupila horizontal; bolinhas coloridas perdem a cor ao passar na frente dele
  olho(ctx) {
    const { scene } = studio(ctx, { top: '#5f3dc4', bottom: '#0d0624', floor: false, rimColor: 0xd0bfff, keyI: 2.0, envI: 0.3 });
    const pele = blob(1.6, clay(COR, { sheen: 0.8 }), { seed: 3, noise: 0.04 }); pele.position.set(0, 0, -1.2); scene.add(pele);
    const bulbo = new THREE.Mesh(new THREE.SphereGeometry(0.75, 40, 30), clay(0xfff3bf, { coat: 1, rough: 0.12 })); bulbo.position.set(0, 0, 0.1); scene.add(bulbo);
    const pupila = new THREE.Mesh(new THREE.BoxGeometry(0.95, 0.2, 0.2, 2, 2, 2), clay(0x0b0b0b, { coat: 1, rough: 0.05 })); pupila.position.set(0, 0, 0.78); scene.add(pupila);
    const palp = new THREE.Mesh(new THREE.SphereGeometry(0.8, 40, 20, 0, Math.PI * 2, 0, Math.PI * 0.42), clay(COR, { sheen: 0.8 })); palp.position.copy(bulbo.position); palp.rotation.x = -0.3; scene.add(palp);
    const cores = [0xff6b6b, 0xffd43b, 0x69db7c, 0x4dabf7, 0xda77f2, 0xff922b];
    const bolas = cores.map((c, i) => { const b = new THREE.Mesh(new THREE.SphereGeometry(0.24, 24, 18), clay(c, { coat: 0.8 })); b.userData.c = new THREE.Color(c); b.userData.i = i; scene.add(b); return b; });
    const cinza = new THREE.Color(0x9a9a9a), tmp = new THREE.Color();
    return {
      scene, rig: { target: V(0, -0.15, 0.5), dist: 5.0, pitch: 0.05, fov: 38 }, bloom: [0.3, 0.5, 0.85],
      update(t) {
        pupila.scale.y = 1 + 0.25 * Math.sin(t * 2);
        bolas.forEach(b => {
          const a = t * 0.9 + b.userData.i / 6 * Math.PI * 2;
          b.position.set(Math.cos(a) * 1.25, Math.sin(a) * 0.45 - 0.1, 1.0 + Math.sin(a) * 0.3);
          const perto = 1 - smooth(0.3, 0.9, Math.abs(b.position.x));        // na frente do olho: vira cinza
          b.material.color.copy(tmp.copy(b.userData.c).lerp(cinza, perto));
        });
      }
    };
  },
};

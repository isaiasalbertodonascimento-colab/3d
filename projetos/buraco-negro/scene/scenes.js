// Cenas: "E se você caísse num buraco negro?" — história do Léo, estilo desenho chapado em cenário 3D
import * as THREE from 'three';
import { studio, clay, glow, particles, smooth, lerp, clamp, ease, V, tube } from './lib.js';
import { camHud, hud, espaco } from './fx.js';
import { personagem, pose, toon, contorno, parede } from './toon.js';

const leo = () => personagem({ pele: 0xb9774a, roupa: 0xf1f3f5, calca: 0xf1f3f5, cabelo: 0x22150e, capacete: true, faixa: 0xf08c00 });
const bia = () => personagem({ pele: 0xe0a882, roupa: 0x2f6f8f, calca: 0x3d405b, cabelo: 0x5a3220, estilo: 'coque' });

// buraco negro com disco de acreção
function buracoNegro(scene, pos = V(), esc = 1) {
  const g = new THREE.Group(); g.position.copy(pos); g.scale.setScalar(esc); scene.add(g);
  g.add(new THREE.Mesh(new THREE.SphereGeometry(1, 48, 32), new THREE.MeshBasicMaterial({ color: 0x000000 })));
  const anelFoton = new THREE.Mesh(new THREE.TorusGeometry(1.08, 0.05, 12, 96), glow(0xffd8a8, 1.6)); g.add(anelFoton);
  const halo = new THREE.Mesh(new THREE.RingGeometry(1.05, 1.9, 96), glow(0xff922b, 0.5, { opacity: 0.1, side: THREE.DoubleSide })); g.add(halo);
  const disco = new THREE.Group(); disco.rotation.x = Math.PI / 2 - 0.22; g.add(disco);
  const n = 2600, pos2 = new Float32Array(n * 3), col = new Float32Array(n * 3), c = new THREE.Color();
  for (let i = 0; i < n; i++) { const r = 1.35 + Math.pow(Math.random(), 1.8) * 2.4, a = Math.random() * 6.283; pos2.set([Math.cos(a) * r, Math.sin(a) * r, (Math.random() - 0.5) * 0.06], i * 3); c.setHSL(0.07 + (r - 1.3) * 0.02, 0.95, 0.75 - (r - 1.3) * 0.12); col.set([c.r, c.g, c.b], i * 3); }
  const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(pos2, 3)); geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
  const pts = new THREE.Points(geo, new THREE.PointsMaterial({ size: 0.05, vertexColors: true, transparent: true, opacity: 0.95, depthWrite: false, blending: THREE.AdditiveBlending })); disco.add(pts);
  const faixa = new THREE.Mesh(new THREE.RingGeometry(1.3, 3.4, 96), glow(0xff6b00, 0.45, { opacity: 0.14, side: THREE.DoubleSide })); disco.add(faixa);
  return { g, disco, update: t => { disco.rotation.z = t * 0.6; anelFoton.scale.setScalar(1 + 0.01 * Math.sin(t * 5)); } };
}
function nave(scene) {
  const g = new THREE.Group(); scene.add(g);
  const casco = new THREE.Mesh(new THREE.CapsuleGeometry(1.3, 3.2, 12, 32), toon(0xdedad2)); casco.rotation.z = Math.PI / 2; contorno(casco, 0.012); g.add(casco);
  for (let i = -2; i <= 2; i++) { const anel = new THREE.Mesh(new THREE.TorusGeometry(1.31, 0.03, 8, 48), toon(0x9a958b)); anel.rotation.y = Math.PI / 2; anel.position.x = i * 0.75; g.add(anel); }
  const faixa = new THREE.Mesh(new THREE.CylinderGeometry(1.315, 1.315, 0.3, 48, 1, true), toon(0xf08c00, { side: THREE.DoubleSide })); faixa.rotation.z = Math.PI / 2; faixa.position.x = 1.6; g.add(faixa);
  const janela = new THREE.Mesh(new THREE.CircleGeometry(0.35, 32), glow(0xffd8a8, 1.1)); janela.position.set(-0.6, 0.2, 1.29); g.add(janela);
  const aroJ = new THREE.Mesh(new THREE.TorusGeometry(0.36, 0.05, 10, 32), toon(0x6c675f)); aroJ.position.copy(janela.position); g.add(aroJ);
  const ponta = new THREE.Mesh(new THREE.ConeGeometry(0.5, 0.8, 24), toon(0xc92a2a)); ponta.rotation.z = -Math.PI / 2; ponta.position.x = 3.2; contorno(ponta, 0.02); g.add(ponta);
  return g;
}
const fundoEspaco = (ctx) => { const e = espaco(ctx, '#141a33', '#03040a', 700); return e; };

export default {
  // fora da nave: consertando, cabo, deriva em direção ao buraco negro
  fora(ctx) {
    const a = ctx.args;
    const { scene } = fundoEspaco(ctx);
    const bn = buracoNegro(scene, V(4.5, 4.2, -9), 1.6);
    const n = nave(scene); n.position.set(-1.6, -0.9, -0.6); n.rotation.y = 0.25;
    const p = leo(); p.scale.setScalar(0.85); scene.add(p);
    const luz = new THREE.PointLight(0xff922b, 5, 0, 1.4); luz.position.set(4.5, 4.2, -6); scene.add(luz);
    const pontoNave = V(-0.2, -0.3, 0.4);
    let cabo = null;
    const desenhaCabo = (fim, solto) => {
      if (cabo) { scene.remove(cabo); cabo.geometry.dispose(); }
      const meio = pontoNave.clone().lerp(fim, 0.5).add(V(0, solto ? -0.2 : -0.35, 0.2));
      const fimC = solto ? pontoNave.clone().lerp(fim, 0.4).add(V(0.1, 0.3, 0)) : fim;
      cabo = tube([pontoNave, meio, fimC], 0.025, toon(0xf8f9fa), { segments: 30, radial: 6 }); scene.add(cabo);
    };
    const titulo = ctx.shot.start < 2.5;
    return {
      scene, rig: { target: V(0.4, titulo ? 2.0 : 0.8, 0), dist: 8.4, pitch: 0.08, yaw: -0.1, fov: 40 }, bloom: [0.35, 0.4, 0.85],
      update(t, d, k) {
        bn.update(t);
        let pos = V(0.9, 0.2 + Math.sin(t * 1.3) * 0.05, 0.6), rot = 0.3;
        if (a.deriva) { pos = V(lerp(1.2, 3.4, ease(k)), lerp(0.4, 2.6, ease(k)), lerp(0.6, -3, ease(k))); rot = t * 0.8; }
        p.position.copy(pos); p.rotation.set(0, 0.4, a.deriva ? rot : 0.15);
        desenhaCabo(pos.clone().add(V(-0.05, 0.85 * 0.85, 0)), !!a.deriva);
        pose(p, t, a.deriva ? { expr: 'susto', bE: 1.6, bD: 1.4, pE: 0.4, pD: -0.3 } : a.conserta ? { expr: 'serio', bD: 0.4, bDx: -1.2 + Math.sin(t * 6) * 0.25, bE: 0.25, olhar: [-0.6, -0.4], cabY: -0.4 } : { expr: 'serio', bE: 0.4, bD: 0.3, olhar: [0, 0] });
      }
    };
  },

  // close no rosto dentro do capacete, com o reflexo laranja
  rosto(ctx) {
    const a = ctx.args;
    const { scene } = fundoEspaco(ctx);
    const bn = buracoNegro(scene, V(-3.5, 2.5, -8), 1.4);
    const p = leo(); scene.add(p);
    const luz = new THREE.PointLight(0xff922b, 3, 0, 1.2); luz.position.set(-2, 2.4, 2); scene.add(luz);
    return {
      scene, rig: { target: V(0, 1.8, 0), dist: 2.8, pitch: 0.02, yaw: 0.15, fov: 34 }, bloom: [0.3, 0.4, 0.88],
      update(t, d, k) {
        bn.update(t);
        p.position.y = Math.sin(t * 1.2) * 0.02;
        if (a.estica) { const e = ease(smooth(0, 0.8, k)); p.userData.cabeca.scale.set(1 - e * 0.25, 1 + e * 0.6, 1); }
        pose(p, t, { expr: a.expr ?? 'serio', olhar: a.expr === 'susto' ? [-0.4, 0.3] : [0.2, 0], cabZ: a.expr === 'susto' ? 0.08 : 0 });
      }
    };
  },

  // o cabo arrebentando
  cabo(ctx) {
    const { scene } = fundoEspaco(ctx);
    const luz = new THREE.PointLight(0xff922b, 8, 0, 1.2); luz.position.set(2, 2, 2); scene.add(luz);
    const lado = (s) => tube([[s * 2.5, 0.1 * s, 0], [s * 1.2, 0.05, 0], [s * 0.05, 0, 0]], 0.09, toon(0xf8f9fa), { segments: 30, radial: 10 });
    const A = lado(-1), B = lado(1); scene.add(A, B);
    const fios = [], rng = ctx.rng;
    for (let i = 0; i < 10; i++) { const f = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.01, 0.25, 4), toon(0xdee2e6)); f.userData = { s: i % 2 ? 1 : -1, a: rng() * 6.28 }; scene.add(f); fios.push(f); }
    const faisca = particles(120, [-0.6, -0.6, -0.6, 1.2, 1.2, 1.2], { color: 0xffd43b, size: 0.07, rise: 0 }); scene.add(faisca.points);
    return {
      scene, rig: { target: V(0, 0.1, 0), dist: 7.0, pitch: 0.1, fov: 36 }, bloom: [0.4, 0.4, 0.8],
      update(t, d, k) {
        const sep = ease(smooth(0.15, 0.6, k)) * 0.45;
        A.position.set(-sep, -sep * 0.2, 0); B.position.set(sep, sep * 0.5, 0); B.rotation.z = sep * 0.4;
        fios.forEach(f => { const s = f.userData.s; f.position.set(s * (0.15 + sep * 0.9), (s > 0 ? sep * 0.5 : -sep * 0.2) + Math.sin(f.userData.a) * 0.06, Math.cos(f.userData.a) * 0.06); f.rotation.z = Math.PI / 2 + Math.sin(f.userData.a + t * 5) * 0.6; });
        faisca.points.visible = k > 0.15 && k < 0.7; faisca.points.scale.setScalar(0.3 + sep); faisca.update(t);
      }
    };
  },

  // o buraco negro (raios = a luz sendo engolida)
  buraco(ctx) {
    const { scene } = fundoEspaco(ctx);
    const bn = buracoNegro(scene, V(0, 0, 0), 1);
    const raios = [];
    if (ctx.args.raios) for (let i = 0; i < 7; i++) {
      const y0 = -2.6 + i * 0.85, pts = []; for (let j = 0; j <= 30; j++) { const u = j / 30; const x = lerp(-5, 0.9, u); const dy = y0 * (1 - Math.pow(u, 3)); pts.push(V(x, dy * (1 - u * 0.6) + Math.sign(y0 || 1) * 0.0, 0.5)); }
      const r = tube(pts, 0.02, glow(0xfff3bf, 1.4), { segments: 60, radial: 6 }); r.userData.len = pts.length; scene.add(r); raios.push(r);
    }
    const cam = camHud(ctx, 40); scene.add(cam);
    const txt = ctx.args.raios ? hud(cam, 'NEM A LUZ ESCAPA', '#ffd43b', 0.58, 1.05) : null;
    return {
      scene, cam, rig: { target: V(0, -0.2, 0), dist: 9.5, pitch: 0.12, fov: 40 }, bloom: [0.6, 0.45, 0.55],
      update(t, d, k) {
        bn.update(t);
        raios.forEach((r, i) => { r.geometry.setDrawRange(0, Math.floor(r.geometry.index.count * clamp(k * 1.6 - i * 0.05))); });
        if (txt) txt.scale.setScalar(Math.max(0.001, ease(smooth(0.15, 0.35, k))));
      }
    };
  },

  // sendo puxado: setas mostram pés puxados mais forte; estica = vira macarrão
  puxa(ctx) {
    const a = ctx.args;
    const { scene } = fundoEspaco(ctx);
    const bn = buracoNegro(scene, V(0, -6.5, -2), 2.2);
    const p = leo(); scene.add(p);
    const luz = new THREE.PointLight(0xff922b, 6, 0, 1.2); luz.position.set(0, -3, 2); scene.add(luz);
    const seta = (cor, tam) => { const g = new THREE.Group(); const h = new THREE.Mesh(new THREE.CylinderGeometry(0.06 * tam, 0.06 * tam, 0.8 * tam, 10), glow(cor, 1.3)); const c = new THREE.Mesh(new THREE.ConeGeometry(0.16 * tam, 0.3 * tam, 14), glow(cor, 1.3)); c.rotation.z = Math.PI; c.position.y = -0.55 * tam; g.add(h, c); scene.add(g); return g; };
    const sPe = seta(0xff6b6b, 1.6), sCab = seta(0xffd43b, 0.7);
    sPe.visible = sCab.visible = !!a.setas;
    const cam = camHud(ctx, 40); scene.add(cam);
    const t1 = a.setas ? hud(cam, 'PÉS: PUXÃO FORTE', '#ff8787', 0.62, 0.9) : null, t2 = a.setas ? hud(cam, 'CABEÇA: PUXÃO FRACO', '#ffd43b', 0.45, 0.9) : null;
    return {
      scene, cam, rig: { target: V(0, 0.6, 0), dist: 7.4, pitch: 0.12, fov: 40 }, bloom: [0.35, 0.4, 0.85],
      update(t, d, k) {
        bn.update(t);
        const e = a.estica != null ? (a.estica >= 1 ? ease(smooth(0, 0.9, k)) : a.estica * ease(smooth(0, 0.8, k))) : 0;
        p.scale.set(1 - e * 0.55, 1 + e * 2.2, 1 - e * 0.55); p.position.y = 0.2 - e * 2.6 + Math.sin(t) * 0.04; p.rotation.z = Math.sin(t * 0.8) * 0.08;
        pose(p, t, { expr: e > 0.05 || a.setas ? 'susto' : 'preocupado', bE: 2.6, bD: 2.6, olhar: [0, -1] });
        sPe.position.set(0.75, -0.6 - e * 2, 0.3); sCab.position.set(0.75, 1.85 + e * 1.2, 0.3);
        if (t1) { t1.scale.setScalar(Math.max(0.001, ease(smooth(0.1, 0.3, k)))); t2.scale.setScalar(Math.max(0.001, ease(smooth(0.35, 0.55, k)))); }
      }
    };
  },

  // espaguetificação: fios esticados girando para dentro do disco
  macarrao(ctx) {
    const { scene } = fundoEspaco(ctx);
    const bn = buracoNegro(scene, V(0, -0.6, 0), 1.1);
    const fios = [];
    for (let i = 0; i < 9; i++) {
      const pts = []; for (let j = 0; j <= 40; j++) { const u = j / 40, r = lerp(4.2, 1.25, u), ang = u * 5 + i * 0.7; pts.push(V(Math.cos(ang) * r, -0.6 + Math.sin(u * 9 + i) * 0.08 + (1 - u) * 0.5, Math.sin(ang) * r * 0.45)); }
      const f = tube(pts, u => 0.05 * (1 - u * 0.6), toon(i % 3 === 0 ? 0xf1f3f5 : 0xf5d572), { segments: 120, radial: 8 }); scene.add(f); fios.push(f);
    }
    const cam = camHud(ctx, 40); scene.add(cam); const txt = hud(cam, 'ESPAGUETIFICAÇÃO', '#ffd43b', 0.6, 1.05);
    return {
      scene, cam, rig: { target: V(0, 0.4, 0), dist: 8.6, pitch: 0.35, fov: 40 }, bloom: [0.55, 0.45, 0.6],
      update(t, d, k) { bn.update(t); fios.forEach((f, i) => { f.rotation.y = -t * 0.9 - i * 0.05; }); txt.scale.setScalar(Math.max(0.001, ease(smooth(0.2, 0.4, k))) * (1 + 0.04 * Math.sin(t * 7))); }
    };
  },

  // dentro da nave: a tripulante na janela, luz laranja entrando com poeira
  cabine(ctx) {
    const a = ctx.args;
    const { scene } = studio(ctx, { top: '#2b2f3a', bottom: '#12141a', floor: false, keyI: 0.9, hemi: 0.35, rimColor: 0xffa94d, rimI: 1.2, fillI: 0, envI: 0.15 });
    const tex = parede('#cfc6b4', '#4f7f86', { corte: 0.58 }); tex.repeat.set(2, 1);
    const fundo = new THREE.Mesh(new THREE.PlaneGeometry(8, 4.4), new THREE.MeshLambertMaterial({ map: tex })); fundo.position.set(0, 2.2, -1.6); fundo.receiveShadow = true; scene.add(fundo);
    const chao = new THREE.Mesh(new THREE.PlaneGeometry(8, 5), new THREE.MeshLambertMaterial({ color: 0x5b5f66 })); chao.rotation.x = -Math.PI / 2; chao.receiveShadow = true; scene.add(chao);
    const lat = new THREE.Mesh(new THREE.PlaneGeometry(5, 4.4), new THREE.MeshLambertMaterial({ map: tex })); lat.rotation.y = Math.PI / 2; lat.position.set(-3.2, 2.2, 0.8); scene.add(lat);
    // janela redonda com o brilho do buraco negro lá fora
    const jan = new THREE.Mesh(new THREE.CircleGeometry(0.75, 48), glow(0xffa94d, 1.15)); jan.position.set(0.9, 2.3, -1.58); scene.add(jan);
    const nucleo = new THREE.Mesh(new THREE.CircleGeometry(0.22, 32), new THREE.MeshBasicMaterial({ color: 0x000000 })); nucleo.position.set(0.95, 2.25, -1.57); scene.add(nucleo);
    const aro = new THREE.Mesh(new THREE.TorusGeometry(0.78, 0.09, 12, 48), toon(0x6c675f)); aro.position.set(0.9, 2.3, -1.55); scene.add(aro);
    for (let i = 0; i < 8; i++) { const r = new THREE.Mesh(new THREE.SphereGeometry(0.03, 8, 6), toon(0x9a958b)); const ang = i / 8 * 6.283; r.position.set(0.9 + Math.cos(ang) * 0.92, 2.3 + Math.sin(ang) * 0.92, -1.57); scene.add(r); }
    const sol = new THREE.SpotLight(0xffa94d, 22, 12, 0.5, 0.6, 1.2); sol.position.set(0.9, 2.3, -1.4); sol.target.position.set(0.2, 0, 2); sol.castShadow = true; scene.add(sol, sol.target);
    const feixe = new THREE.Mesh(new THREE.ConeGeometry(1.1, 4.2, 32, 1, true), glow(0xffc078, 0.5, { opacity: 0.06, side: THREE.DoubleSide })); feixe.position.set(0.6, 1.3, 0.2); feixe.rotation.set(-1.0, 0, 0.25); scene.add(feixe);
    const poeira = particles(160, [-0.6, 0.2, -1.2, 2.4, 2.6, 2.6], { color: 0xffe8cc, size: 0.025, rise: 0.04, opacity: 0.8 }); scene.add(poeira.points);
    // marcas de dias riscadas na parede (detalhe de cenário)
    const b = bia(); b.position.set(0.55, 0, -0.55); scene.add(b);
    const titulo = ctx.shot.beat === 6;
    const rig = a.close ? { target: V(0.4, 1.95, -0.4), dist: 2.6, pitch: 0.02, yaw: 0.55, fov: 34 } : a.olha ? { target: V(0.5, titulo ? 2.25 : 1.6, -0.4), dist: 4.4, pitch: 0.04, yaw: 0.1, fov: 36 } : { target: V(0.3, 1.55, -0.4), dist: 5.6, pitch: 0.06, yaw: -0.45, fov: 38 };
    return {
      scene, rig, bloom: [0.35, 0.4, 0.8], exposure: 1.0,
      update(t, d, k) {
        poeira.update(t); jan.material.color.setScalar(1).multiplyScalar(1.1 + 0.08 * Math.sin(t * 2));
        if (a.olha) { const v = ease(smooth(0.05, 0.4, k)); b.rotation.y = lerp(Math.PI * 0.85, 0.1, v); pose(b, t, { expr: 'preocupado', olhar: [0, 0], bE: 0.15, bD: 0.15, cabZ: 0.06 }); }
        else { b.rotation.y = Math.PI * 0.85; pose(b, t, { expr: 'preocupado', bD: 0.5, bDx: -1.6, olhar: [0, 0.4], cabX: -0.12 }); }
      }
    };
  },

  // pela janela: o Léo pequenininho na borda (congelado = vermelho e parado)
  janela(ctx) {
    const cong = !!ctx.args.congelado;
    const { scene } = fundoEspaco(ctx);
    const bn = buracoNegro(scene, V(0, 0, -4), 1.5);
    const p = leo(); p.scale.setScalar(0.3); scene.add(p);
    const moldura = new THREE.Mesh(new THREE.RingGeometry(1.25, 6, 64), toon(0x8b8578)); moldura.position.z = 3.2; scene.add(moldura);
    const aro = new THREE.Mesh(new THREE.TorusGeometry(1.25, 0.1, 12, 64), toon(0x5c5850)); aro.position.z = 3.25; scene.add(aro);
    const luzJ = new THREE.PointLight(0xffa94d, 4, 0, 1.2); luzJ.position.set(0, 0, 5.5); scene.add(luzJ);
    const brilho = new THREE.Mesh(new THREE.SphereGeometry(0.17, 16, 12), glow(0xff3b3b, 0.9, { opacity: 0.3 })); scene.add(brilho);
    const cam = camHud(ctx, 40); scene.add(cam); const txt = cong ? hud(cam, 'CONGELADO PRA SEMPRE', '#ff8787', 0.62, 1.05) : null;
    const pele = p.userData.cabeca.children[0].material;
    return {
      scene, cam, rig: { target: V(0, 0.05, 0), dist: 7.4, pitch: 0.0, fov: 40 }, bloom: [0.4, 0.4, 0.8],
      update(t, d, k) {
        bn.update(t);
        const lento = cong ? 1 : smooth(0, 1, k);
        const tt = cong ? 2 : t * (1 - lento * 0.85);
        p.position.set(lerp(0.5, 1.15, cong ? 1 : ease(k)), lerp(0.45, 0.12, cong ? 1 : ease(k)), -2.2); p.rotation.z = tt * 0.5;
        pose(p, tt, { expr: 'susto', bE: 1.6, bD: 1.6 });
        const verm = cong ? 1 : lento;
        p.traverse(o => { if (o.isMesh && o.material && o.material.isMeshToonMaterial) { o.material = o.material.clone(); o.material.emissive = new THREE.Color(0x8a0000).multiplyScalar(verm * 0.8); } });
        brilho.position.copy(p.position); brilho.material.opacity = 0.08 + verm * 0.22;
        if (txt) txt.scale.setScalar(Math.max(0.001, ease(smooth(0.1, 0.3, k))));
      }
    };
  },

  // relógio desacelerando até parar
  relogio(ctx) {
    const { scene } = fundoEspaco(ctx);
    const bn = buracoNegro(scene, V(0, -3.5, -6), 1.6);
    const g = new THREE.Group(); scene.add(g);
    const face = new THREE.Mesh(new THREE.CylinderGeometry(1.1, 1.1, 0.15, 48), toon(0xf8f1e3)); face.rotation.x = Math.PI / 2; contorno(face, 0.03); g.add(face);
    const aro = new THREE.Mesh(new THREE.TorusGeometry(1.12, 0.08, 10, 48), toon(0xc92a2a)); g.add(aro);
    for (let i = 0; i < 12; i++) { const m = new THREE.Mesh(new THREE.BoxGeometry(0.05, i % 3 ? 0.12 : 0.22, 0.02), toon(0x2a1d17)); const a = i / 12 * 6.283; m.position.set(Math.sin(a) * 0.9, Math.cos(a) * 0.9, 0.09); m.rotation.z = -a; g.add(m); }
    const ponteiro = (c, w) => { const p = new THREE.Group(); const m = new THREE.Mesh(new THREE.BoxGeometry(0.06, c, 0.03), toon(w)); m.position.y = c / 2; p.add(m); p.position.z = 0.11; g.add(p); return p; };
    const hora = ponteiro(0.5, 0x2a1d17), min = ponteiro(0.78, 0x2a1d17), seg = ponteiro(0.85, 0xe03131);
    const cam = camHud(ctx, 40); scene.add(cam); const txt = hud(cam, 'O TEMPO QUASE PARA', '#ffd43b', 0.62, 1.05);
    return {
      scene, cam, rig: { target: V(0, 0.4, 0), dist: 4.6, pitch: 0.02, fov: 38 }, bloom: [0.4, 0.4, 0.75],
      update(t, d, k) {
        bn.update(t);
        const tempo = 4 * (1 - Math.exp(-t * 0.9)); // desacelera até parar
        seg.rotation.z = -tempo * 6.283; min.rotation.z = -tempo * 0.6; hora.rotation.z = -1 - tempo * 0.05;
        g.rotation.y = Math.sin(t * 0.6) * 0.15;
        face.material.color.setRGB(0.97, lerp(0.95, 0.55, smooth(0, 1, k)), lerp(0.89, 0.5, smooth(0, 1, k)));
        txt.scale.setScalar(Math.max(0.001, ease(smooth(0.2, 0.4, k))));
      }
    };
  },

  // a Via Láctea e o buraco negro do centro
  galaxia(ctx) {
    const { scene } = espaco(ctx, '#160b38', '#010007', 600);
    const n = 2400, pos = new Float32Array(n * 3), col = new Float32Array(n * 3), c = new THREE.Color();
    for (let i = 0; i < n; i++) { const braco = i % 4, r = Math.pow(Math.random(), 0.75) * 3.6, a = r * 1.3 + braco * Math.PI / 2 + (Math.random() - 0.5) * 0.5; pos.set([Math.cos(a) * r, (Math.random() - 0.5) * 0.12, Math.sin(a) * r], i * 3); c.setHSL(r < 0.8 ? 0.1 : 0.62 + Math.random() * 0.12, 0.7, r < 0.8 ? 0.8 : 0.7); col.set([c.r, c.g, c.b], i * 3); }
    const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(pos, 3)); geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
    const gal = new THREE.Points(geo, new THREE.PointsMaterial({ size: 0.06, vertexColors: true, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending })); gal.rotation.x = 0.55; scene.add(gal);
    const centro = new THREE.Mesh(new THREE.SphereGeometry(0.12, 20, 16), new THREE.MeshBasicMaterial({ color: 0x000000 })); scene.add(centro);
    const halo = new THREE.Mesh(new THREE.TorusGeometry(0.16, 0.025, 8, 40), glow(0xffa94d, 1.5)); halo.rotation.x = 0.55 + Math.PI / 2; scene.add(halo);
    const cam = camHud(ctx, 40); scene.add(cam); const txt = ctx.args.hud ? hud(cam, '4 MILHÕES DE SÓIS', '#ffd43b', 0.6, 1.0) : null;
    return {
      scene, cam, rig: { target: V(0, -0.3, 0), dist: 8.5, pitch: 0.3, fov: 40 }, bloom: [0.6, 0.5, 0.55],
      update(t, d, k) { gal.rotation.y = t * 0.15; halo.scale.setScalar(1 + 0.1 * Math.sin(t * 4)); if (txt) txt.scale.setScalar(Math.max(0.001, ease(smooth(0.2, 0.4, k)))); }
    };
  },
};

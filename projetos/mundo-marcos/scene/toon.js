// Estilo "desenho chapado em cenário 3D": personagens cel-shaded com contorno fino,
// paredes com textura de tinta gasta e poeira na luz.
import * as THREE from 'three';
import { V, clamp, smooth, lerp } from './lib.js';

let _grad = null;
function gradiente() {
  if (_grad) return _grad;
  const d = new Uint8Array([90, 90, 90, 255, 200, 200, 200, 255, 255, 255, 255, 255]);
  _grad = new THREE.DataTexture(d, 3, 1, THREE.RGBAFormat); _grad.minFilter = _grad.magFilter = THREE.NearestFilter; _grad.needsUpdate = true;
  return _grad;
}
export const toon = (cor, o = {}) => new THREE.MeshToonMaterial({ color: cor, gradientMap: gradiente(), transparent: o.opacity != null, opacity: o.opacity ?? 1, side: o.side ?? THREE.FrontSide, emissive: o.emissive ?? 0x000000 });
const plano = (cor) => new THREE.MeshBasicMaterial({ color: cor });

// contorno por "casco invertido"
export function contorno(m, w = 0.035, cor = 0x2a1d17) {
  const c = new THREE.Mesh(m.geometry, new THREE.MeshBasicMaterial({ color: cor, side: THREE.BackSide }));
  c.scale.setScalar(1 + w); c.raycast = () => {}; m.add(c); return m;
}
const peca = (geo, mat, w) => { const m = new THREE.Mesh(geo, mat); m.castShadow = true; return contorno(m, w); };

// ---------- personagem ----------
// o: { pele, roupa, calca, cabelo, estilo:'cachos'|'coque', capacete, faixa }
export function personagem(o = {}) {
  const pele = toon(o.pele ?? 0xc98552), roupa = toon(o.roupa ?? 0xf1f3f5), calca = toon(o.calca ?? 0x8c7b63), cab = toon(o.cabelo ?? 0x2b1a12);
  const g = new THREE.Group();
  const quadril = new THREE.Group(); quadril.position.y = 0.95; g.add(quadril);
  const torso = new THREE.Group(); quadril.add(torso);
  const tronco = peca(new THREE.CapsuleGeometry(0.2, 0.4, 6, 16), roupa); tronco.position.y = 0.33; tronco.scale.set(1.05, 1, 0.7); torso.add(tronco);
  if (o.faixa) { const f = new THREE.Mesh(new THREE.CylinderGeometry(0.212, 0.212, 0.07, 24), toon(o.faixa)); f.position.y = 0.3; f.scale.set(1.05, 1, 0.7); torso.add(f); }
  if (o.gravata) { const gr = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.36, 0.02), toon(o.gravata)); gr.position.set(0, 0.42, 0.15); torso.add(gr); const n = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.06, 0.03), toon(o.gravata)); n.position.set(0, 0.61, 0.145); torso.add(n);
    const gola = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.06, 0.02), toon(0xf8f9fa)); gola.position.set(0, 0.64, 0.14); torso.add(gola); }
  if (o.alca) { for (const s2 of [-1, 1]) { const al = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.5, 0.02), toon(o.alca)); al.position.set(s2 * 0.1, 0.4, 0.15); torso.add(al); } }
  const pesc = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.12, 12), pele); pesc.position.y = 0.66; torso.add(pesc);
  const cabeca = new THREE.Group(); cabeca.position.y = 0.95; torso.add(cabeca);
  const cranio = peca(new THREE.SphereGeometry(0.3, 32, 24), pele, 0.03); cabeca.add(cranio);
  for (const s of [-1, 1]) { const or = peca(new THREE.SphereGeometry(0.07, 14, 10), pele, 0.06); or.position.set(s * 0.3, -0.01, 0); or.scale.set(0.5, 1, 0.8); cabeca.add(or); }
  // cabelo
  if ((o.estilo ?? 'cachos') === 'cachos') {
    for (let i = 0; i < 46; i++) { const a = i * 2.39996, y = 0.1 + (i / 46) * 0.2; const r = Math.sqrt(Math.max(0, 0.31 * 0.31 - (y - 0.0) * (y - 0.0) * 0.6)); if (Math.sin(a) > 0.55 && y < 0.2) continue;
      const b = new THREE.Mesh(new THREE.SphereGeometry(0.055, 10, 8), cab); b.position.set(Math.cos(a) * r * 0.95, y + 0.02, Math.sin(a) * r * 0.95 - 0.02); cabeca.add(b); }
  } else {
    const calota = new THREE.Mesh(new THREE.SphereGeometry(0.315, 28, 16, 0, Math.PI * 2, 0, Math.PI * 0.42), cab); calota.rotation.x = -0.25; cabeca.add(calota);
    const coque = peca(new THREE.SphereGeometry(0.12, 16, 12), cab, 0.05); coque.position.set(0, 0.3, -0.18); cabeca.add(coque);
  }
  // rosto plano
  const olhos = [], pupilas = [], sobr = [];
  for (const s of [-1, 1]) {
    const ol = new THREE.Mesh(new THREE.CircleGeometry(0.062, 24), plano(0xffffff)); ol.position.set(s * 0.1, 0.05, 0.296); cabeca.add(ol); olhos.push(ol);
    const ab = new THREE.Mesh(new THREE.RingGeometry(0.062, 0.072, 24), plano(0x2a1d17)); ab.position.copy(ol.position); cabeca.add(ab);
    const pu = new THREE.Mesh(new THREE.CircleGeometry(0.028, 16), plano(0x1a120e)); pu.position.set(s * 0.1, 0.045, 0.298); cabeca.add(pu); pupilas.push(pu);
    const br = new THREE.Mesh(new THREE.CircleGeometry(0.01, 8), plano(0xffffff)); br.position.set(s * 0.1 + 0.012, 0.058, 0.299); cabeca.add(br);
    const so = new THREE.Mesh(new THREE.CapsuleGeometry(0.018, 0.09, 4, 8), plano(0x2a1d17)); so.rotation.z = Math.PI / 2; so.position.set(s * 0.1, 0.15, 0.285); cabeca.add(so); sobr.push(so);
  }
  const nariz = new THREE.Mesh(new THREE.TorusGeometry(0.025, 0.007, 6, 12, Math.PI), plano(0x7a4a2c)); nariz.position.set(0, -0.03, 0.296); nariz.rotation.z = Math.PI; cabeca.add(nariz);
  const boca = new THREE.Group(); boca.position.set(0, -0.12, 0.286); cabeca.add(boca);
  if (o.bigode) { const bg = new THREE.Mesh(new THREE.CapsuleGeometry(0.025, 0.12, 4, 8), plano(0x22150e)); bg.rotation.z = Math.PI / 2; bg.position.set(0, -0.075, 0.295); cabeca.add(bg); }
  const linha = new THREE.Mesh(new THREE.TorusGeometry(0.05, 0.009, 6, 16, Math.PI * 0.8), plano(0x2a1d17)); linha.rotation.z = Math.PI * 1.1; boca.add(linha);
  const oBoca = new THREE.Mesh(new THREE.CircleGeometry(0.055, 24), plano(0x4a1622)); oBoca.scale.set(0.8, 1.15, 1); boca.add(oBoca);
  const lingua = new THREE.Mesh(new THREE.CircleGeometry(0.03, 16), plano(0xe8647a)); lingua.position.set(0, -0.03, 0.001); boca.add(lingua);
  // braços e pernas compridos e finos
  const bracos = {}, pernas = {};
  for (const s of [-1, 1]) {
    const om = new THREE.Group(); om.position.set(s * 0.24, 0.6, 0); torso.add(om);
    const manga = peca(new THREE.CapsuleGeometry(0.07, 0.12, 4, 10), roupa); manga.position.y = -0.08; om.add(manga);
    const ante = peca(new THREE.CapsuleGeometry(0.048, 0.5, 4, 10), o.capacete ? roupa : pele); ante.position.y = -0.36; om.add(ante);
    const mao = peca(new THREE.SphereGeometry(0.065, 12, 10), o.capacete ? toon(0xdee2e6) : pele, 0.05); mao.position.y = -0.66; om.add(mao);
    bracos[s] = om;
    const qp = new THREE.Group(); qp.position.set(s * 0.1, 0, 0); quadril.add(qp);
    const pe = peca(new THREE.CapsuleGeometry(0.075, 0.68, 4, 10), calca); pe.position.y = -0.42; qp.add(pe);
    const sap = peca(new THREE.SphereGeometry(0.08, 12, 10), toon(o.capacete ? 0xdee2e6 : 0x6b4a2b), 0.05); sap.scale.set(1, 0.6, 1.6); sap.position.set(0, -0.86, 0.05); qp.add(sap);
    pernas[s] = qp;
  }
  let capacete = null;
  if (o.capacete) {
    capacete = new THREE.Mesh(new THREE.SphereGeometry(0.46, 32, 24), new THREE.MeshPhysicalMaterial({ color: 0xe7f5ff, transparent: true, opacity: 0.07, roughness: 0.2, clearcoat: 0.3, depthWrite: false }));
    capacete.position.y = 0.02; cabeca.add(capacete);
    const aro = peca(new THREE.TorusGeometry(0.3, 0.05, 10, 32), toon(0xdee2e6)); aro.rotation.x = Math.PI / 2; aro.position.y = -0.36; cabeca.add(aro);
    const mochila = peca(new THREE.BoxGeometry(0.38, 0.5, 0.18), toon(0xced4da)); mochila.position.set(0, 0.36, -0.22); torso.add(mochila);
  }
  if (o.cabecao) cabeca.scale.setScalar(o.cabecao);
  g.userData = { quadril, torso, cabeca, olhos, pupilas, sobr, linha, oBoca, lingua, bracos, pernas };
  return g;
}
// expr: 'serio' | 'susto' | 'sorriso' | 'preocupado'
export function pose(p, t, o = {}) {
  const u = p.userData, e = o.expr ?? 'serio';
  const susto = e === 'susto';
  u.linha.visible = !susto; u.oBoca.visible = susto; u.lingua.visible = susto;
  u.linha.rotation.z = e === 'sorriso' ? Math.PI * 1.1 : e === 'preocupado' ? Math.PI * 0.1 : Math.PI * 1.1;
  u.linha.scale.set(e === 'serio' ? 0.7 : 1, e === 'serio' ? 0.3 : 1, 1);
  u.sobr.forEach((s, i) => { const lado = i ? 1 : -1; s.position.y = susto ? 0.19 : 0.15; s.rotation.z = Math.PI / 2 + (e === 'preocupado' ? lado * 0.35 : susto ? 0 : lado * -0.12); });
  u.olhos.forEach(ol => ol.scale.setScalar(susto ? 1.15 : 1));
  const [lx, ly] = o.olhar ?? [0, 0];
  u.pupilas.forEach((pu, i) => { pu.position.x = (i ? 1 : -1) * 0.1 + lx * 0.025; pu.position.y = 0.045 + ly * 0.02; pu.scale.setScalar(susto ? 0.75 : 1); });
  const pisca = Math.sin(t * 2.3) > 0.985 && !susto;
  u.olhos.forEach(ol => { ol.scale.y = pisca ? 0.1 : ol.scale.x; });
  u.cabeca.rotation.set(o.cabX ?? 0, o.cabY ?? 0, (o.cabZ ?? 0) + Math.sin(t * 1.2) * 0.02);
  u.torso.rotation.x = o.inclina ?? 0;
  u.bracos[-1].rotation.set(o.bEx ?? 0, 0, -(o.bE ?? 0.12)); u.bracos[1].rotation.set(o.bDx ?? 0, 0, o.bD ?? 0.12);
  u.pernas[-1].rotation.x = o.pE ?? 0; u.pernas[1].rotation.x = o.pD ?? 0;
}

// ---------- texturas de parede gasta ----------
export function parede(cima = '#d9cfbd', baixo = '#5f8f86', o = {}) {
  const c = document.createElement('canvas'); c.width = 1024; c.height = 1024; const g = c.getContext('2d');
  const corte = o.corte ?? 0.55;
  g.fillStyle = cima; g.fillRect(0, 0, 1024, 1024 * corte); g.fillStyle = baixo; g.fillRect(0, 1024 * corte, 1024, 1024);
  g.fillStyle = 'rgba(0,0,0,.12)'; g.fillRect(0, 1024 * corte - 6, 1024, 12);
  let s = 7; const r = () => (s = (s * 16807) % 2147483647) / 2147483647;
  for (let i = 0; i < 4000; i++) { g.fillStyle = `rgba(${r() < .5 ? '0,0,0' : '255,255,255'},${r() * 0.05})`; g.fillRect(r() * 1024, r() * 1024, 2 + r() * 6, 2 + r() * 6); }
  for (let i = 0; i < 9; i++) { g.fillStyle = `rgba(120,90,60,${0.06 + r() * 0.08})`; g.beginPath(); g.ellipse(r() * 1024, r() * 1024, 30 + r() * 90, 20 + r() * 60, r() * 3, 0, 7); g.fill(); }
  g.strokeStyle = 'rgba(40,30,25,.35)'; g.lineWidth = 2;
  for (let i = 0; i < 7; i++) { let x = r() * 1024, y = r() * 1024; g.beginPath(); g.moveTo(x, y); for (let k = 0; k < 6; k++) { x += (r() - 0.5) * 70; y += r() * 50; g.lineTo(x, y); } g.stroke(); }
  for (let i = 0; i < 6; i++) { g.fillStyle = 'rgba(255,255,255,.35)'; g.beginPath(); g.ellipse(r() * 1024, 1024 * corte + r() * 300, 15 + r() * 25, 10 + r() * 15, r() * 3, 0, 7); g.fill(); }
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping; return t;
}

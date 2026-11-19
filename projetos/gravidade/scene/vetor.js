// Personagens 2D vetoriais chapados (sem contorno): cabeça grande, olhos de pontinho,
// sobrancelhas grossas, bochecha rosada, corpo comprido e membros finos.
import * as THREE from 'three';
import { clamp, lerp, V } from './lib.js';

export const chapa = (cor, o = {}) => { const m = new THREE.MeshBasicMaterial({ color: cor, transparent: o.opacity != null, opacity: o.opacity ?? 1, side: o.side ?? THREE.FrontSide }); m.userData.base = new THREE.Color(cor); return m; };
const mesh = (geo, mat, sombra = true) => { const m = new THREE.Mesh(geo, mat); m.castShadow = sombra; return m; };

// o: { pele, roupa, calca, cabelo, cabeloEstilo:'curto'|'careca'|'touca'|'capuz'|'coque', barba, tunica, sapato }
export function personagem(o = {}) {
  const pele = chapa(o.pele ?? 0xe8a87c), roupa = chapa(o.roupa ?? 0xd9a21b), calca = chapa(o.calca ?? 0x3b3a4a), cab = chapa(o.cabelo ?? 0x3a2416), escuro = chapa(0x1c1412);
  const g = new THREE.Group();
  const quadril = new THREE.Group(); quadril.position.y = 1.0; g.add(quadril);
  const torso = new THREE.Group(); quadril.add(torso);
  const tronco = mesh(new THREE.CapsuleGeometry(0.17, 0.52, 6, 18), roupa); tronco.position.y = 0.36; tronco.scale.set(1.05, 1, 0.72); torso.add(tronco);
  if (o.tunica) { const saia = mesh(new THREE.CylinderGeometry(0.19, 0.3, 0.55, 20), roupa); saia.position.y = -0.05; saia.scale.z = 0.75; torso.add(saia); const cinto = mesh(new THREE.CylinderGeometry(0.185, 0.185, 0.05, 20), chapa(0x5a3a1e)); cinto.position.y = 0.2; cinto.scale.z = 0.75; torso.add(cinto); }
  const pesc = mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.12, 10), pele); pesc.position.y = 0.72; torso.add(pesc);
  const cabeca = new THREE.Group(); cabeca.position.y = 1.08; torso.add(cabeca);
  const cranio = mesh(new THREE.SphereGeometry(0.36, 36, 28), pele); cranio.scale.set(1, 1.02, 0.95); cabeca.add(cranio);
  for (const s of [-1, 1]) { const or = mesh(new THREE.SphereGeometry(0.07, 14, 10), pele); or.position.set(s * 0.355, -0.02, 0); or.scale.set(0.45, 1, 0.8); cabeca.add(or); }
  const est = o.cabeloEstilo ?? 'curto';
  if (est === 'curto' || est === 'coque') {
    const calota = mesh(new THREE.SphereGeometry(0.372, 32, 16, 0, Math.PI * 2, 0, Math.PI * 0.4), cab); calota.rotation.x = -0.32; cabeca.add(calota);
    for (let i = 0; i < 5; i++) { const t = mesh(new THREE.SphereGeometry(0.09, 10, 8), cab); t.position.set(-0.2 + i * 0.1, 0.3 - Math.abs(i - 2) * 0.02, 0.15); t.scale.set(1, 0.6, 0.8); cabeca.add(t); }
    if (est === 'coque') { const c = mesh(new THREE.SphereGeometry(0.13, 14, 10), cab); c.position.set(0, 0.32, -0.22); cabeca.add(c); }
  } else if (est === 'touca') {
    const t = mesh(new THREE.SphereGeometry(0.38, 28, 14, 0, Math.PI * 2, 0, Math.PI * 0.45), cab); t.rotation.x = -0.25; cabeca.add(t);
  } else if (est === 'capuz') {
    const h = mesh(new THREE.SphereGeometry(0.44, 28, 20, Math.PI * 0.18, Math.PI * 1.64), cab); h.rotation.y = Math.PI / 2; h.scale.set(1, 1.15, 1); cabeca.add(h);
    const ponta = mesh(new THREE.ConeGeometry(0.2, 0.35, 16), cab); ponta.position.set(0, 0.42, -0.2); ponta.rotation.x = -0.6; cabeca.add(ponta);
  }
  if (o.barba) { const b = mesh(new THREE.SphereGeometry(0.3, 20, 14, 0, Math.PI * 2, Math.PI * 0.55, Math.PI * 0.45), chapa(o.barba)); b.position.set(0, -0.02, 0.06); b.scale.set(1.05, 1.1, 1); cabeca.add(b); }
  // rosto
  const olhos = [], olhosF = [], sobr = [];
  for (const s of [-1, 1]) {
    const ol = mesh(new THREE.SphereGeometry(0.034, 12, 10), escuro, false); ol.position.set(s * 0.12, 0.04, 0.335); ol.scale.z = 0.4; cabeca.add(ol); olhos.push(ol);
    const fe = mesh(new THREE.TorusGeometry(0.035, 0.011, 6, 12, Math.PI), escuro, false); fe.position.set(s * 0.12, 0.035, 0.338); fe.rotation.z = Math.PI; fe.visible = false; cabeca.add(fe); olhosF.push(fe);
    const so = mesh(new THREE.CapsuleGeometry(0.026, 0.11, 4, 8), chapa(o.sobrancelha ?? 0x2a1a10), false); so.rotation.z = Math.PI / 2; so.position.set(s * 0.12, 0.16, 0.32); so.scale.z = 0.5; cabeca.add(so); sobr.push(so);
    const bo = mesh(new THREE.CircleGeometry(0.06, 20), chapa(0xf08a8a, { opacity: 0.55 }), false); bo.position.set(s * 0.2, -0.07, 0.318); bo.lookAt(s * 0.2 * 3, -0.07 * 3, 0.318 * 3); cabeca.add(bo);
  }
  const nariz = mesh(new THREE.SphereGeometry(0.022, 10, 8), chapa(new THREE.Color(o.pele ?? 0xe8a87c).multiplyScalar(0.82).getHex()), false); nariz.position.set(0, -0.02, 0.35); cabeca.add(nariz);
  const boca = new THREE.Group(); boca.position.set(0, -0.14, 0.33); cabeca.add(boca);
  const linha = mesh(new THREE.TorusGeometry(0.05, 0.011, 6, 16, Math.PI * 0.8), escuro, false); linha.rotation.z = Math.PI * 1.1; boca.add(linha);
  const aberta = mesh(new THREE.CircleGeometry(0.06, 24), chapa(0x5a1a24), false); aberta.scale.set(0.75, 1.1, 1); boca.add(aberta);
  const riso = mesh(new THREE.CircleGeometry(0.08, 24, Math.PI, Math.PI), chapa(0x5a1a24), false); boca.add(riso);
  const lingua = mesh(new THREE.CircleGeometry(0.035, 16), chapa(0xe8647a), false); lingua.position.set(0, -0.04, 0.002); boca.add(lingua);
  // braços e pernas finos
  const bracos = {}, pernas = {}, maos = {};
  for (const s of [-1, 1]) {
    const om = new THREE.Group(); om.position.set(s * 0.215, 0.68, 0); torso.add(om);
    const manga = mesh(new THREE.CapsuleGeometry(0.06, 0.12, 4, 10), roupa); manga.position.y = -0.08; om.add(manga);
    const br = mesh(new THREE.CapsuleGeometry(0.038, 0.56, 4, 10), o.mangaLonga ? roupa : pele); br.position.y = -0.4; om.add(br);
    const mao = mesh(new THREE.SphereGeometry(0.06, 12, 10), pele); mao.position.y = -0.72; om.add(mao); maos[s] = mao;
    bracos[s] = om;
    const qp = new THREE.Group(); qp.position.set(s * 0.09, 0, 0); quadril.add(qp);
    const pe = mesh(new THREE.CapsuleGeometry(0.052, 0.78, 4, 10), calca); pe.position.y = -0.46; qp.add(pe);
    const sap = mesh(new THREE.SphereGeometry(0.075, 12, 10), chapa(o.sapato ?? 0x3a2a1e)); sap.scale.set(1, 0.55, 1.7); sap.position.set(0, -0.92, 0.05); qp.add(sap);
    pernas[s] = qp;
  }
  g.userData = { quadril, torso, cabeca, olhos, olhosF, sobr, linha, aberta, riso, lingua, bracos, pernas, maos };
  return g;
}

// expr: 'neutro'|'surpresa'|'raiva'|'risada'|'concentrado'|'feliz'|'medo'
export function pose(p, t, o = {}) {
  const u = p.userData, e = o.expr ?? 'neutro';
  const fechado = e === 'concentrado' || e === 'risada';
  u.olhos.forEach(x => { x.visible = !fechado; x.scale.set(e === 'surpresa' || e === 'medo' ? 1.25 : 1, e === 'surpresa' || e === 'medo' ? 1.25 : 1, 0.4); });
  u.olhosF.forEach((x, i) => { x.visible = fechado; x.rotation.z = e === 'risada' ? 0 : Math.PI; });
  u.linha.visible = e === 'neutro' || e === 'feliz' || e === 'concentrado' || e === 'raiva';
  u.linha.rotation.z = e === 'raiva' ? Math.PI * 0.1 : Math.PI * 1.1; u.linha.scale.set(e === 'concentrado' ? 0.6 : 1, e === 'concentrado' ? 0.25 : 1, 1);
  u.aberta.visible = e === 'surpresa' || e === 'medo'; u.lingua.visible = e === 'surpresa';
  u.riso.visible = e === 'risada';
  u.sobr.forEach((s, i) => {
    const lado = i ? 1 : -1;
    const ang = { raiva: lado * 0.45, surpresa: 0, medo: lado * -0.35, concentrado: lado * 0.22, risada: lado * -0.1, feliz: lado * -0.12, neutro: 0 }[e] ?? 0;
    s.rotation.z = Math.PI / 2 + ang; s.position.y = e === 'surpresa' || e === 'medo' ? 0.2 : e === 'raiva' ? 0.14 : 0.16;
  });
  const [lx, ly] = o.olhar ?? [0, 0];
  u.olhos.forEach((x, i) => { x.position.x = (i ? 1 : -1) * 0.12 + lx * 0.02; x.position.y = 0.04 + ly * 0.02; });
  const pisca = !fechado && Math.sin(t * 2.1 + (o.fase ?? 0)) > 0.985;
  if (pisca) u.olhos.forEach(x => x.scale.y = 0.15);
  u.cabeca.rotation.set((o.cabX ?? 0) + (e === 'risada' ? -0.15 + Math.sin(t * 14) * 0.05 : 0), o.cabY ?? 0, (o.cabZ ?? 0) + Math.sin(t * 1.2 + (o.fase ?? 0)) * 0.02);
  u.torso.rotation.x = o.inclina ?? 0;
  const anda = o.anda ?? 0;
  const passo = Math.sin(t * 7) * anda;
  u.bracos[-1].rotation.set((o.bEx ?? 0) - passo * 0.6, 0, -(o.bE ?? 0.1)); u.bracos[1].rotation.set((o.bDx ?? 0) + passo * 0.6, 0, o.bD ?? 0.1);
  u.pernas[-1].rotation.x = (o.pE ?? 0) + passo * 0.7; u.pernas[1].rotation.x = (o.pD ?? 0) - passo * 0.7;
  u.quadril.position.y = 1.0 + Math.abs(Math.sin(t * 7)) * 0.04 * anda;
}

// tinge os personagens (materiais chapados não recebem luz): noite azulada, pôr do sol alaranjado
export function tingir(obj, cor, f) {
  const c = new THREE.Color(cor);
  obj.traverse(m => {
    if (!m.isMesh || !m.material?.userData?.base) return;
    const base = new THREE.Color().copy(m.material.userData.base); // copia ANTES do clone (o clone serializa a cor)
    m.material = m.material.clone(); m.material.userData.base = base;
    m.material.color.copy(base).multiply(new THREE.Color(1, 1, 1).lerp(c, f));
  });
}

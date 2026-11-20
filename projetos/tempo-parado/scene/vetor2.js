// Personagem 2D vetorial (sem contorno) COM articulações: ombro/cotovelo, quadril/joelho.
// Animações prontas: andar, correr, pular, empurrar, apontar, mãos no rosto, cobrir olhos, apertar botão.
import * as THREE from 'three';
import { clamp, lerp, smooth, ease, V } from './lib.js';

export const chapa = (cor, o = {}) => { const m = new THREE.MeshBasicMaterial({ color: cor, transparent: o.opacity != null, opacity: o.opacity ?? 1, side: o.side ?? THREE.FrontSide }); m.userData.base = new THREE.Color(cor); return m; };
const mesh = (geo, mat, sombra = true) => { const m = new THREE.Mesh(geo, mat); m.castShadow = sombra; return m; };
const UP = 0.3, LO = 0.3;     // comprimento braço/antebraço
const COX = 0.4, CAN = 0.4;   // coxa/canela

export function personagem(o = {}) {
  const pele = chapa(o.pele ?? 0xe8a87c), roupa = chapa(o.roupa ?? 0x2a9d8f), calca = chapa(o.calca ?? 0x3b3a4a), cab = chapa(o.cabelo ?? 0x3a2416), escuro = chapa(0x1c1412);
  const g = new THREE.Group();
  const quadril = new THREE.Group(); quadril.position.y = COX + CAN + 0.1; g.add(quadril);
  const torso = new THREE.Group(); quadril.add(torso);
  const tronco = mesh(new THREE.CapsuleGeometry(0.17, 0.48, 6, 18), roupa); tronco.position.y = 0.34; tronco.scale.set(1.05, 1, 0.72); torso.add(tronco);
  if (o.saia) { const s = mesh(new THREE.CylinderGeometry(0.18, 0.32, 0.42, 22), chapa(o.saia)); s.position.y = 0.02; s.scale.z = 0.8; torso.add(s); }
  const pesc = mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.12, 10), pele); pesc.position.y = 0.7; torso.add(pesc);
  const cabeca = new THREE.Group(); cabeca.position.y = 1.06; torso.add(cabeca);
  const cranio = mesh(new THREE.SphereGeometry(0.36, 36, 28), pele); cranio.scale.set(1, 1.02, 0.95); cabeca.add(cranio);
  for (const s of [-1, 1]) { const or = mesh(new THREE.SphereGeometry(0.07, 14, 10), pele); or.position.set(s * 0.355, -0.02, 0); or.scale.set(0.45, 1, 0.8); cabeca.add(or); }
  // cabelo (com "mola" secundária)
  const cabelo = new THREE.Group(); cabeca.add(cabelo);
  const est = o.cabeloEstilo ?? 'curto';
  if (est !== 'careca') { const calota = mesh(new THREE.SphereGeometry(0.373, 32, 16, 0, Math.PI * 2, 0, Math.PI * (est === 'longo' ? 0.55 : 0.4)), cab); calota.rotation.x = -0.32; cabelo.add(calota); }
  if (est === 'curto') for (let i = 0; i < 5; i++) { const t = mesh(new THREE.SphereGeometry(0.09, 10, 8), cab); t.position.set(-0.2 + i * 0.1, 0.3 - Math.abs(i - 2) * 0.02, 0.15); t.scale.set(1, 0.6, 0.8); cabelo.add(t); }
  let rabo = null;
  if (est === 'rabo' || est === 'longo') { rabo = new THREE.Group(); rabo.position.set(0, 0.18, -0.32); cabelo.add(rabo); const r1 = mesh(new THREE.SphereGeometry(0.12, 14, 10), cab); r1.scale.set(0.9, 1.4, 0.9); r1.position.y = -0.15; rabo.add(r1); const r2 = mesh(new THREE.SphereGeometry(0.09, 12, 10), cab); r2.position.y = -0.38; r2.scale.set(0.8, 1.3, 0.8); rabo.add(r2); }
  if (o.barba) { const b = mesh(new THREE.SphereGeometry(0.3, 20, 14, 0, Math.PI * 2, Math.PI * 0.55, Math.PI * 0.45), chapa(o.barba)); b.position.set(0, -0.02, 0.06); b.scale.set(1.05, 1.1, 1); cabeca.add(b); }
  if (o.oculos) { for (const s of [-1, 1]) { const l = mesh(new THREE.TorusGeometry(0.07, 0.012, 6, 20), escuro, false); l.position.set(s * 0.12, 0.04, 0.345); cabeca.add(l); } }
  // rosto
  const olhos = [], olhosF = [], sobr = [];
  for (const s of [-1, 1]) {
    const ol = mesh(new THREE.SphereGeometry(0.034, 12, 10), escuro, false); ol.position.set(s * 0.12, 0.04, 0.335); ol.scale.z = 0.4; cabeca.add(ol); olhos.push(ol);
    const fe = mesh(new THREE.TorusGeometry(0.035, 0.011, 6, 12, Math.PI), escuro, false); fe.position.set(s * 0.12, 0.035, 0.338); fe.rotation.z = Math.PI; fe.visible = false; cabeca.add(fe); olhosF.push(fe);
    const so = mesh(new THREE.CapsuleGeometry(0.026, 0.11, 4, 8), chapa(o.sobrancelha ?? 0x2a1a10), false); so.rotation.z = Math.PI / 2; so.position.set(s * 0.12, 0.16, 0.32); so.scale.z = 0.5; cabeca.add(so); sobr.push(so);
    const bo = mesh(new THREE.CircleGeometry(0.06, 20), chapa(0xf08a8a, { opacity: 0.55 }), false); bo.position.set(s * 0.2, -0.07, 0.318); bo.lookAt(s * 0.6, -0.21, 0.954); cabeca.add(bo);
  }
  const nariz = mesh(new THREE.SphereGeometry(0.022, 10, 8), chapa(new THREE.Color(o.pele ?? 0xe8a87c).multiplyScalar(0.82).getHex()), false); nariz.position.set(0, -0.02, 0.35); cabeca.add(nariz);
  const boca = new THREE.Group(); boca.position.set(0, -0.14, 0.33); cabeca.add(boca);
  const linha = mesh(new THREE.TorusGeometry(0.05, 0.011, 6, 16, Math.PI * 0.8), escuro, false); linha.rotation.z = Math.PI * 1.1; boca.add(linha);
  const aberta = mesh(new THREE.CircleGeometry(0.06, 24), chapa(0x5a1a24), false); aberta.scale.set(0.75, 1.1, 1); boca.add(aberta);
  const riso = mesh(new THREE.CircleGeometry(0.08, 24, Math.PI, Math.PI), chapa(0x5a1a24), false); boca.add(riso);
  const lingua = mesh(new THREE.CircleGeometry(0.035, 16), chapa(0xe8647a), false); lingua.position.set(0, -0.04, 0.002); boca.add(lingua);
  // braços: ombro -> cotovelo -> mão
  const bracos = {}, cotov = {}, maos = {}, pernas = {}, joelhos = {};
  for (const s of [-1, 1]) {
    const om = new THREE.Group(); om.position.set(s * 0.215, 0.66, 0); torso.add(om);
    const manga = mesh(new THREE.CapsuleGeometry(0.058, 0.1, 4, 10), roupa); manga.position.y = -0.06; om.add(manga);
    const sup = mesh(new THREE.CapsuleGeometry(0.038, UP - 0.04, 4, 10), o.mangaLonga ? roupa : pele); sup.position.y = -UP / 2; om.add(sup);
    const co = new THREE.Group(); co.position.y = -UP; om.add(co);
    const inf = mesh(new THREE.CapsuleGeometry(0.036, LO - 0.04, 4, 10), o.mangaLonga ? roupa : pele); inf.position.y = -LO / 2; co.add(inf);
    const mao = mesh(new THREE.SphereGeometry(0.058, 12, 10), pele); mao.position.y = -LO - 0.02; co.add(mao);
    bracos[s] = om; cotov[s] = co; maos[s] = mao;
    const qp = new THREE.Group(); qp.position.set(s * 0.09, 0, 0); quadril.add(qp);
    const cx = mesh(new THREE.CapsuleGeometry(0.056, COX - 0.04, 4, 10), calca); cx.position.y = -COX / 2; qp.add(cx);
    const jo = new THREE.Group(); jo.position.y = -COX; qp.add(jo);
    const ca = mesh(new THREE.CapsuleGeometry(0.05, CAN - 0.04, 4, 10), o.meia ? chapa(o.meia) : calca); ca.position.y = -CAN / 2; jo.add(ca);
    const sap = mesh(new THREE.SphereGeometry(0.075, 12, 10), chapa(o.sapato ?? 0x3a2a1e)); sap.scale.set(1, 0.55, 1.7); sap.position.set(0, -CAN - 0.05, 0.05); jo.add(sap);
    pernas[s] = qp; joelhos[s] = jo;
  }
  g.userData = { quadril, torso, cabeca, cabelo, rabo, olhos, olhosF, sobr, linha, aberta, riso, lingua, bracos, cotov, maos, pernas, joelhos, alturaQ: COX + CAN + 0.1 };
  return g;
}

// ------------ poses ------------
// o: expr, olhar:[x,y], cab:[x,y,z], acao:'parado'|'andar'|'correr'|'pular'|'empurrar'|'apontar'|'rosto'|'cobrir'|'botao'|'acenar'|'comemorar'|'sentado'|'congelado', k (0..1 para ações com início/fim), vel
export function pose(p, t, o = {}) {
  const u = p.userData, e = o.expr ?? 'neutro', ac = o.acao ?? 'parado';
  // ---- rosto ----
  const fechado = e === 'concentrado' || e === 'risada';
  u.olhos.forEach(x => { x.visible = !fechado; const s = e === 'surpresa' || e === 'medo' ? 1.3 : 1; x.scale.set(s, s, 0.4); });
  u.olhosF.forEach(x => { x.visible = fechado; x.rotation.z = e === 'risada' ? 0 : Math.PI; });
  u.linha.visible = ['neutro', 'feliz', 'concentrado', 'raiva', 'triste'].includes(e);
  u.linha.rotation.z = e === 'raiva' || e === 'triste' ? Math.PI * 0.1 : Math.PI * 1.1; u.linha.scale.set(e === 'concentrado' ? 0.6 : 1, e === 'concentrado' ? 0.25 : 1, 1);
  const falando = o.fala ? Math.abs(Math.sin(t * 13)) : 0;
  u.aberta.visible = e === 'surpresa' || e === 'medo' || falando > 0.4; u.aberta.scale.set(0.75, e === 'surpresa' || e === 'medo' ? 1.1 : 0.4 + falando * 0.6, 1); u.lingua.visible = e === 'surpresa';
  u.riso.visible = e === 'risada';
  u.sobr.forEach((s, i) => { const l = i ? 1 : -1; const a = { raiva: l * 0.45, surpresa: 0, medo: l * -0.35, triste: l * -0.3, concentrado: l * 0.22, risada: l * -0.1, feliz: l * -0.12, neutro: 0 }[e] ?? 0; s.rotation.z = Math.PI / 2 + a; s.position.y = e === 'surpresa' || e === 'medo' ? 0.2 + Math.sin(t * 6) * 0.005 : e === 'raiva' ? 0.14 : 0.16; });
  const [lx, ly] = o.olhar ?? [Math.sin(t * 0.7) * 0.2, 0];
  u.olhos.forEach((x, i) => { x.position.x = (i ? 1 : -1) * 0.12 + lx * 0.022; x.position.y = 0.04 + ly * 0.02; });
  if (!fechado && Math.sin(t * 2.1 + (o.fase ?? 0)) > 0.985) u.olhos.forEach(x => x.scale.y = 0.15);
  // ---- corpo ----
  const B = u.bracos, C = u.cotov, P = u.pernas, J = u.joelhos;
  const setB = (s, ombX, ombZ, cot) => { B[s].rotation.set(ombX, 0, s * ombZ); C[s].rotation.set(cot, 0, 0); };
  const setP = (s, qx, jx) => { P[s].rotation.set(qx, 0, 0); J[s].rotation.set(jx, 0, 0); };
  let qy = u.alturaQ, incl = 0, rotY = 0, cab = o.cab ?? [0, 0, 0], respira = Math.sin(t * 2 + (o.fase ?? 0)) * 0.012;
  const k = o.k ?? 0;
  if (ac === 'andar' || ac === 'correr') {
    const run = ac === 'correr', f = (o.vel ?? (run ? 11 : 7)), ph = t * f;
    const amp = run ? 1.0 : 0.55;
    for (const s of [-1, 1]) { const ps = Math.sin(ph + (s > 0 ? 0 : Math.PI)); setP(s, -ps * amp * 0.9, Math.max(0, -Math.cos(ph + (s > 0 ? 0 : Math.PI))) * (run ? 1.6 : 1.0) + 0.05); setB(s, ps * amp * (run ? 1.1 : 0.8), 0.12, run ? -1.4 : -0.35); }
    qy += Math.abs(Math.sin(ph)) * (run ? 0.08 : 0.04) - (run ? 0.05 : 0); incl = run ? 0.28 : 0.05; cab = [cab[0] - incl * 0.6, cab[1], cab[2] + Math.sin(ph) * 0.04];
  } else if (ac === 'pular') {
    // agacha -> estica no ar -> pousa
    const ag = smooth(0, 0.18, k) * (1 - smooth(0.18, 0.3, k)) + smooth(0.85, 0.95, k) * (1 - smooth(0.95, 1, k));
    const ar = smooth(0.25, 0.35, k) * (1 - smooth(0.78, 0.88, k));
    for (const s of [-1, 1]) { setP(s, -ag * 1.1 - ar * 0.35 * (s > 0 ? 1 : 0.4), ag * 2.0 + ar * (s > 0 ? 0.8 : 0.3)); setB(s, -ar * 2.9 + ag * 0.6, 0.25 + ar * 0.3, -ar * 0.2 - ag * 0.3); }
    qy -= ag * 0.32; incl = ag * 0.35 - ar * 0.1;
  } else if (ac === 'empurrar') {
    const tr = Math.sin(t * 25) * 0.02; for (const s of [-1, 1]) { setB(s, -1.45 + tr, 0.15, -0.35); setP(s, s > 0 ? -0.5 : 0.35, s > 0 ? 0.2 : 0.5); }
    incl = 0.38; qy -= 0.06;
  } else if (ac === 'apontar') {
    setB(1, -1.45, 0.2, -0.05); setB(-1, 0.1, 0.12, -0.2); for (const s of [-1, 1]) setP(s, 0, 0.03);
  } else if (ac === 'rosto') { // mãos no rosto (susto/emoção)
    for (const s of [-1, 1]) { setB(s, -0.5, 0.75, -2.45); setP(s, 0, 0.03); }
  } else if (ac === 'cobrir') { // cobrindo os olhos
    for (const s of [-1, 1]) { setB(s, -0.85, 0.5, -2.35); setP(s, 0, 0.05); } incl = 0.1;
  } else if (ac === 'botao') { // uma mão segura o relógio, a outra aperta
    setB(-1, -0.9, 0.15, -1.2); setB(1, -0.75, -0.05, -1.4 + Math.max(0, Math.sin(k * Math.PI * 2)) * 0.15); for (const s of [-1, 1]) setP(s, 0, 0.03); cab = [0.35, 0, 0];
  } else if (ac === 'acenar') {
    setB(1, -0.2, 2.6, -0.6 + Math.sin(t * 9) * 0.5); setB(-1, 0.05, 0.12, -0.2); for (const s of [-1, 1]) setP(s, 0, 0.03);
  } else if (ac === 'comemorar') {
    for (const s of [-1, 1]) { setB(s, -0.2, 2.5 + Math.sin(t * 8 + s) * 0.2, -0.3); setP(s, 0, 0.03); } qy += Math.abs(Math.sin(t * 8)) * 0.12;
  } else if (ac === 'sentado') {
    for (const s of [-1, 1]) { setP(s, -1.5, 1.5); setB(s, -0.35, 0.12, -0.9); } qy = CAN + 0.08;
  } else if (ac === 'congelado') { // pego no meio do salto
    setP(1, -1.0, 1.4); setP(-1, 0.4, 0.6); setB(1, -2.6, 0.4, -0.3); setB(-1, -0.4, 0.6, -0.8); respira = 0;
  } else { // parado (respirando, peso de um lado)
    for (const s of [-1, 1]) { setB(s, Math.sin(t * 1.1 + s) * 0.04, 0.1, -0.15); setP(s, 0, s > 0 ? 0.08 : 0.02); }
  }
  if (o.braco) { const [s, ox, oz, co] = o.braco; setB(s, ox, oz, co); }
  u.quadril.position.y = qy + respira; u.torso.rotation.set(incl, rotY, 0); u.torso.scale.set(1, 1 + respira, 1);
  u.cabeca.rotation.set(cab[0] + (e === 'risada' ? -0.15 + Math.sin(t * 14) * 0.05 : 0), cab[1], cab[2] + Math.sin(t * 1.2 + (o.fase ?? 0)) * 0.02 + (o.balanca ? Math.sin(t * 9) * 0.25 : 0));
  // movimento secundário do cabelo/rabo
  if (u.rabo) u.rabo.rotation.x = 0.25 + Math.sin(t * (ac === 'correr' ? 11 : 3)) * (ac === 'correr' || ac === 'pular' ? 0.35 : 0.06) + incl * 0.8;
}

export function tingir(obj, cor, f) {
  const c = new THREE.Color(cor);
  obj.traverse(m => { if (!m.isMesh || !m.material?.userData?.base) return; const base = new THREE.Color().copy(m.material.userData.base); m.material = m.material.clone(); m.material.userData.base = base; m.material.color.copy(base).multiply(new THREE.Color(1, 1, 1).lerp(c, f)); });
}

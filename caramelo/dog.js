// Rig procedural do "caramelo-raptor": pose -> primitivos SDF + pontos de anexo.
import * as THREE from './lib/three.module.js';
import { V3 } from './sdf.js';
const { add, sub, mul, nrm, cross, lerp, len } = V3;
const C = h => { const c = new THREE.Color(h); return [c.r, c.g, c.b]; };
export const COL = {
  body: C('#c08348'), back: C('#a96d38'), cream: C('#e9cfa2'), light: C('#d6a265'), ear: C('#7e4426'),
  muzzle: C('#dcb27a'), scale: C('#7a5c40'), toe: C('#55473c'), lip: C('#2a1a14')
};
const rotY = (v, a) => [v[0] * Math.cos(a) + v[2] * Math.sin(a), v[1], -v[0] * Math.sin(a) + v[2] * Math.cos(a)];
const rotZ = (v, a) => [v[0] * Math.cos(a) - v[1] * Math.sin(a), v[0] * Math.sin(a) + v[1] * Math.cos(a), v[2]];
const rotAxis = (v, k, a) => { const c = Math.cos(a), s = Math.sin(a), d = V3.dot(k, v), cr = cross(k, v); return [v[0] * c + cr[0] * s + k[0] * d * (1 - c), v[1] * c + cr[1] * s + k[1] * d * (1 - c), v[2] * c + cr[2] * s + k[2] * d * (1 - c)]; };

export function defaultPose() {
  return {
    hipY: .56, pitch: .45, roll: 0, neckA: 1.1, headP: -.14, headY: 0, headR: 0, jaw: .15, tongue: .3, blink: 0, earPerk: .5, earFlop: 0,
    tailLift: .25, tailWag: .5, tailPh: 0, tailWagV: 0, tailCurl: .08,
    feet: [[.05, .025, -.11], [.05, .025, .11]], lift: [0, 0], mt: [0, 0], tap: [0, 0],
    arms: null, armBend: [0, 0], squint: 0, bodyX: 0,
  };
}

// Pés a partir do ciclo de marcha
export function gait(P, ph, speed, mode = 'walk') {
  const f = mode === 'run' ? 3.1 : 1.9, S = Math.max(.001, speed / f), duty = mode === 'run' ? .4 : .6;
  const lh = mode === 'run' ? .14 : .07;
  for (let s = 0; s < 2; s++) {
    let p = ((ph + s * .5) % 1 + 1) % 1, x, y, lift = 0;
    if (p < duty) { x = S * duty / 2 - (p / duty) * S * duty; y = .025; }
    else { const q = (p - duty) / (1 - duty); x = -S * duty / 2 + q * S * duty; lift = Math.sin(q * Math.PI); y = .025 + lift * lh; }
    P.feet[s] = [.04 + x, y, s ? .11 : -.11]; P.lift[s] = lift;
  }
  const bob = mode === 'run' ? .05 : .02;
  P.hipY += -bob * Math.cos(ph * 4 * Math.PI) * Math.min(1, speed * 2);
  P.roll = .04 * Math.sin(ph * 2 * Math.PI) * Math.min(1, speed * 2);
  return P;
}

function ik(J, A, L1, L2, dir) {
  const dx = A[0] - J[0], dy = A[1] - J[1]; let d = Math.hypot(dx, dy); d = Math.min(Math.max(d, Math.abs(L1 - L2) + .01), L1 + L2 - .002);
  const th = Math.atan2(dy, dx), al = Math.acos((L1 * L1 + d * d - L2 * L2) / (2 * L1 * d));
  const a = th + dir * al; const zt = .35;
  return [J[0] + Math.cos(a) * L1, J[1] + Math.sin(a) * L1, J[2] + (A[2] - J[2]) * zt];
}

export function dogRig(P) {
  const prims = [], claws = [], E = { prims, claws };
  const rc = (a, b, r1, r2, o = {}) => prims.push(Object.assign({ t: 'rc', a, b, r1, r2, k: .045, col: COL.body, fur: 1 }, o));
  const el = (c, r, ax, o = {}) => prims.push(Object.assign({ t: 'el', c, r, ax, k: .045, col: COL.body, fur: 1 }, o));
  const H = [P.bodyX, P.hipY, 0];
  const bd = rotZ([1, 0, 0], P.pitch), bu = rotZ([0, 1, 0], P.pitch);
  const Cc = add(H, mul(bd, .4));
  const side = [0, 0, 1];
  // tronco
  rc(H, Cc, .105, .135, { col: COL.body, col2: COL.cream, under: 'down', k: .06 });
  el(add(add(H, mul(bd, .2)), mul(bu, .03)), [.16, .08, .095], [bd, bu, side], { col: COL.body, col2: COL.cream, under: 'down', k: .06 });
  el(add(Cc, mul(bu, -.035)), [.12, .16, .115], [bd, bu, side], { col: COL.body, col2: COL.cream, under: 'front', fwd: bd, k: .06 });
  el(add(add(H, mul(bd, .1)), mul(bu, .06)), [.19, .05, .085], [bd, bu, side], { col: COL.back, k: .07 });
  // pescoço
  const Nb = add(add(Cc, mul(bd, .05)), mul(bu, .06));
  const nd = rotY([Math.cos(P.neckA), Math.sin(P.neckA), 0], P.headY * .45);
  const Ne = add(Nb, mul(nd, .17));
  rc(Nb, Ne, .085, .068, { col: COL.body, col2: COL.cream, under: 'front', fwd: [nd[0] > 0 ? 1 : 0, -.2, 0], k: .06 });
  // cabeça
  let f = rotY(rotZ([1, 0, 0], P.headP), P.headY), u = rotY(rotZ([0, 1, 0], P.headP), P.headY);
  u = rotAxis(u, f, P.headR); const r = cross(f, u);
  const Hc = add(add(Ne, mul(u, .045)), mul(f, .02));
  const hf = (x, y, z) => add(add(add(Hc, mul(f, x)), mul(u, y)), mul(r, z));
  E.head = { o: Hc, f, u, r, hf };
  el(hf(0, 0, 0), [.112, .098, .09], [f, u, r], { col: COL.body, k: .03 });
  el(hf(-.01, .04, 0), [.08, .05, .068], [f, u, r], { col: COL.back, k: .03 });
  for (const s of [-1, 1]) el(hf(.05, -.03, s * .055), [.06, .05, .038], [f, u, r], { col: COL.light, k: .03 });
  rc(hf(.06, -.012, 0), hf(.205, -.03, 0), .058, .04, { col: COL.muzzle, k: .035, fur: .55 });
  el(hf(.1, .025, 0), [.06, .02, .033], [f, u, r], { col: COL.light, k: .03, fur: .6 });
  for (const s of [-1, 1]) { el(hf(.06, .062, s * .042), [.035, .018, .03], [f, u, r], { col: COL.back, k: .025, fur: .8 }); rc(hf(.08, -.046, s * .04), hf(.215, -.052, s * .018), .011, .008, { col: COL.lip, k: .008, fur: 0 }); }
  // mandíbula
  const ja = P.jaw * .62, jf = rotAxis(f, r, -ja), ju = rotAxis(u, r, -ja);
  const jh = hf(.0, -.045, 0);
  const jt = add(add(jh, mul(jf, .19)), mul(ju, -.012));
  rc(add(jh, mul(jf, .03)), jt, .04, .025, { col: COL.muzzle, col2: COL.cream, under: 'down', k: .012, fur: .5 });
  E.jaw = { o: jh, f: jf, u: ju, r };
  // orelhas (semi-caídas)
  for (const s of [-1, 1]) {
    const base = hf(-.035, .075, s * .066);
    const up = nrm(add(add(mul(u, 1), mul(r, s * .55)), mul(f, -.1)));
    const tip0 = add(base, mul(up, .065 + P.earPerk * .02));
    const fold = nrm(add(add(mul(up, .3 - P.earPerk * .4 + P.earFlop), mul(f, .75)), mul(r, s * .35)));
    const fn = nrm(cross(up, r));
    el(add(base, mul(up, .036)), [.036, .042, .012], [nrm(cross(fn, up)), up, fn], { col: COL.ear, k: .02, fur: .45 });
    const flap = add(tip0, mul(fold, .025));
    const fax = nrm(cross(fold, r));
    el(flap, [.034, .036, .01], [nrm(cross(fax, fold)), fold, fax], { col: COL.ear, k: .015, fur: .45 });
  }
  // pernas traseiras (raptor)
  const L1 = .25, L2 = .27;
  for (let s = 0; s < 2; s++) {
    const sz = s ? 1 : -1;
    const J = add(add(H, [0, -.03, sz * .1]), mul(bd, -.02));
    const F = P.feet[s];
    const mtDir = nrm(lerp([-.32 - P.lift[s] * .5, 1, 0], [-1, .12, 0], P.mt[s]));
    const A = add(F, mul(mtDir, .19));
    const K = ik(J, A, L1, L2, 1);
    el(lerp(J, K, .38), [.15, .1, .085], [nrm(sub(K, J)), nrm(cross(side, sub(K, J))), side], { col: COL.body, col2: COL.cream, under: 'down', k: .06 });
    rc(J, K, .085, .058, { k: .05 });
    rc(K, A, .052, .03, { k: .035 });
    rc(A, F, .03, .026, { k: .02, col: COL.scale, fur: .12 });
    el(F, [.04, .026, .034], [[1, 0, 0], [0, 1, 0], [0, 0, 1]], { k: .02, col: COL.scale, fur: 0 });
    const curl = P.lift[s] * .9;
    for (const ang of [-.38, 0, .38]) {
      let td = rotY([1, 0, 0], ang * (sz)); td = nrm([td[0] * Math.cos(curl), -Math.sin(curl) - .12, td[2]]);
      let tp = P.tap[s] && ang === (sz > 0 ? .38 : -.38) ? P.tap[s] : 0;
      if (tp) td = nrm(add(td, [0, tp, 0]));
      const T0 = add(F, mul(td, .02)), T1 = add(F, mul(td, .095));
      rc(T0, T1, .019, .013, { k: .012, col: COL.toe, fur: 0 });
      claws.push({ p: T1, d: nrm(add(td, [0, -.55, 0])), l: .034, r: .008 });
    }
  }
  // braços (patinhas dianteiras com garras)
  for (let s = 0; s < 2; s++) {
    const sz = s ? 1 : -1;
    const S = add(add(add(Cc, mul(bd, .03)), mul(bu, -.08)), [0, 0, sz * .085]);
    const T = P.arms ? P.arms[s] : add(S, [.11, -.1, sz * .01]);
    const El = ik(S, T, .12, .12, -1);
    rc(S, El, .045, .034, { k: .04, col: COL.body });
    rc(El, T, .032, .025, { k: .025, col: COL.light });
    const pd = nrm(sub(T, El));
    el(add(T, mul(pd, .012)), [.03, .022, .028], [pd, nrm(cross(side, pd)), side], { k: .02, col: COL.light, fur: .5 });
    for (const o of [-.012, 0, .012]) claws.push({ p: add(add(T, mul(pd, .035)), [0, -.005, o]), d: nrm(add(pd, [0, -.5, 0])), l: .022, r: .005 });
  }
  // cauda
  let tp = add(add(H, mul(bd, -.12)), mul(bu, .03));
  let td = rotZ([-1, 0, 0], -P.tailLift);
  const n = 11, segL = .82 / n;
  for (let i = 0; i < n; i++) {
    const w = P.tailWag * Math.sin(P.tailPh - i * .38) * (.25 + i * .06);
    const wv = P.tailWagV * Math.sin(P.tailPh - i * .38) * (.3 + i * .05);
    td = nrm(rotY(rotZ(td, -P.tailCurl + wv * .2), w * .2));
    const nx = add(tp, mul(td, segL));
    const r1 = .048 * (1 - i / n) + .011, r2 = .048 * (1 - (i + 1) / n) + .011;
    rc(tp, nx, r1, r2, { k: .03, col: i > 6 ? COL.back : COL.body, col2: COL.light, under: 'down' });
    tp = nx;
  }
  E.tailTip = tp;
  return E;
}

// Peças rígidas: olhos, nariz, boca, língua, dentes, garras.
export class DogParts {
  constructor(parent) {
    const cv = document.createElement('canvas'); cv.width = 512; cv.height = 256; const x = cv.getContext('2d');
    x.fillStyle = '#1a0d06'; x.fillRect(0, 0, 512, 256);
    const gr = x.createRadialGradient(256, 128, 4, 256, 128, 70); gr.addColorStop(0, '#000'); gr.addColorStop(.5, '#030100'); gr.addColorStop(.58, '#3a1a08'); gr.addColorStop(.85, '#5a2a0c'); gr.addColorStop(1, '#1a0d06');
    x.save(); x.translate(256, 128); x.scale(1, 2); x.translate(-256, -128); x.fillStyle = gr; x.beginPath(); x.arc(256, 128, 40, 0, 7); x.fill(); x.restore();
    const et = new THREE.CanvasTexture(cv); et.colorSpace = THREE.SRGBColorSpace;
    const eyeM = new THREE.MeshPhysicalMaterial({ map: et, roughness: .08, clearcoat: .5, clearcoatRoughness: .05, envMapIntensity: .35 });
    const lidM = new THREE.MeshStandardMaterial({ color: '#7a4a24', roughness: .9 });
    const noseM = new THREE.MeshPhysicalMaterial({ color: '#1a1412', roughness: .5, clearcoat: .35, clearcoatRoughness: .4 });
    const mouthM = new THREE.MeshStandardMaterial({ color: '#4a0f10', roughness: .6 });
    const tongueM = new THREE.MeshPhysicalMaterial({ color: '#d9646a', roughness: .35, clearcoat: .5, sheen: .5, sheenColor: '#ff9a9a' });
    const toothM = new THREE.MeshStandardMaterial({ color: '#f2ede0', roughness: .3 });
    const clawM = new THREE.MeshPhysicalMaterial({ color: '#1d1714', roughness: .25, clearcoat: .6 });
    const sph = new THREE.SphereGeometry(1, 32, 20);
    this.g = new THREE.Group(); parent.add(this.g);
    const mk = (geo, m) => { const o = new THREE.Mesh(geo, m); o.castShadow = true; o.receiveShadow = true; this.g.add(o); return o; };
    this.eyes = [mk(sph, eyeM), mk(sph, eyeM)];
    this.lids = [mk(sph, lidM), mk(sph, lidM)];
    this.nose = mk(sph, noseM); this.mouth = mk(sph, mouthM); this.tongue = mk(sph, tongueM);
    this.lips = mk(new THREE.TorusGeometry(1, .12, 8, 24, Math.PI), new THREE.MeshStandardMaterial({ color: '#2a1612', roughness: .5 }));
    const cone = new THREE.ConeGeometry(1, 1, 10); cone.translate(0, .5, 0);
    this.teeth = []; for (let i = 0; i < 4; i++) this.teeth.push(mk(cone, toothM));
    this.claws = []; for (let i = 0; i < 12; i++) this.claws.push(mk(cone, clawM));
    this.m4 = new THREE.Matrix4();
  }
  place(o, p, f, u, r, sx, sy, sz) {
    this.m4.makeBasis(new THREE.Vector3(...f), new THREE.Vector3(...u), new THREE.Vector3(...r));
    o.quaternion.setFromRotationMatrix(this.m4); o.position.set(...p); o.scale.set(sx, sy, sz);
  }
  update(E, P) {
    const { hf, f, u, r } = E.head;
    for (const s of [-1, 1]) {
      const i = s > 0 ? 1 : 0, c = hf(.078, .03, s * .056);
      const ef = nrm(add(add(f, mul(r, s * .55)), mul(u, .05)));
      const eu = nrm(cross(cross(ef, u), ef)), er = cross(ef, eu);
      this.place(this.eyes[i], add(c, mul(ef, .004)), ef, eu, er, .016, .015, .016);
      const bl = Math.max(P.blink, P.squint * .55);
      // pálpebra: elipsoide que desce cobrindo o olho
      this.place(this.lids[i], add(add(c, mul(eu, .02 - bl * .016)), mul(ef, -.002)), ef, eu, er, .019, .012 + bl * .006, .02);
      this.lids[i].visible = bl > .05;
    }
    this.place(this.nose, hf(.235, -.01, 0), f, u, r, .019, .016, .024);
    const J = E.jaw;
    const jp = (x, y, z) => add(add(add(J.o, mul(J.f, x)), mul(J.u, y)), mul(J.r, z));
    const mo = mul(add(hf(.13, -.05, 0), jp(.13, .0, 0)), .5);
    this.place(this.mouth, mo, f, u, r, .09, .012 + P.jaw * .045, .032);
    this.mouth.visible = P.jaw > .05;
    const tl = P.tongue, tf = nrm(add(J.f, mul(J.u, -tl * .9)));
    const tu = nrm(cross(J.r, tf));
    this.place(this.tongue, add(jp(.13 + tl * .05, .014, 0), mul(tf, tl * .02)), tf, tu, J.r, .055 + tl * .03, .009, .026);
    this.tongue.visible = P.jaw > .08 || tl > .3;
    this.place(this.lips, hf(.15, -.052, 0), r, f, u, .0, .0, .0); this.lips.visible = false;
    let k = 0;
    for (const s of [-1, 1]) {
      this.place(this.teeth[k++], hf(.18, -.048, s * .024), f, mul(u, -1), mul(r, -1), .006, .02, .006);
      this.place(this.teeth[k++], jp(.16, .022, s * .022), J.f, J.u, J.r, .005, .016, .005);
    }
    E.claws.forEach((c, i) => {
      const o = this.claws[i]; if (!o) return;
      const d = c.d, side = Math.abs(d[2]) < .9 ? [0, 0, 1] : [1, 0, 0], a = nrm(cross(d, side)), b = cross(a, d);
      this.place(o, add(c.p, mul(d, -.006)), a, d, b, c.r, c.l, c.r);
    });
  }
}

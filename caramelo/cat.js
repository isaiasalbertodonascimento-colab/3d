// Gato rajado sentado (mesmo sistema de pelo).
import * as THREE from './lib/three.module.js';
import { FurBody } from './fur.js';
import { V3 } from './sdf.js';
const { add, mul, nrm, cross } = V3;
const C = h => { const c = new THREE.Color(h); return [c.r, c.g, c.b]; };
const GREY = C('#8e877d'), DARK = C('#3d3732'), CREAM = C('#d9cfc0'), PINK = C('#c98a85');
const rotY = (v, a) => [v[0] * Math.cos(a) + v[2] * Math.sin(a), v[1], -v[0] * Math.sin(a) + v[2] * Math.cos(a)];
const rotZ = (v, a) => [v[0] * Math.cos(a) - v[1] * Math.sin(a), v[0] * Math.sin(a) + v[1] * Math.cos(a), v[2]];
export class Cat {
  constructor(scene) {
    this.g = new THREE.Group(); scene.add(this.g);
    this.fur = new FurBody(this.g, { len: .006, freq: 650, layers: 10 });
    const cv = document.createElement('canvas'); cv.width = 512; cv.height = 256; const x = cv.getContext('2d');
    x.fillStyle = '#7a8a2a'; x.fillRect(0, 0, 512, 256);
    const gr = x.createRadialGradient(256, 128, 0, 256, 128, 120); gr.addColorStop(0, '#d8d04a'); gr.addColorStop(.6, '#9aa83a'); gr.addColorStop(1, '#4a5a1a');
    x.fillStyle = gr; x.save(); x.translate(256, 128); x.scale(.5, 1); x.beginPath(); x.arc(0, 0, 150, 0, 7); x.fill(); x.restore();
    x.fillStyle = '#050505'; x.beginPath(); x.ellipse(256, 128, 7, 70, 0, 0, 7); x.fill();
    const et = new THREE.CanvasTexture(cv); et.colorSpace = THREE.SRGBColorSpace;
    const sph = new THREE.SphereGeometry(1, 32, 20);
    this.eyes = [0, 1].map(() => { const m = new THREE.Mesh(sph, new THREE.MeshPhysicalMaterial({ map: et, roughness: .03, clearcoat: 1 })); this.g.add(m); return m; });
    this.lids = [0, 1].map(() => { const m = new THREE.Mesh(sph, new THREE.MeshStandardMaterial({ color: '#4a4540', roughness: .9 })); this.g.add(m); return m; });
    this.nose = new THREE.Mesh(sph, new THREE.MeshStandardMaterial({ color: '#c47a78', roughness: .4 })); this.g.add(this.nose);
    this.m4 = new THREE.Matrix4();
  }
  place(o, p, f, u, r, s) { this.m4.makeBasis(new THREE.Vector3(...f), new THREE.Vector3(...u), new THREE.Vector3(...r)); o.quaternion.setFromRotationMatrix(this.m4); o.position.set(...p); o.scale.set(...s); }
  update(P) {
    const prims = [];
    const rc = (a, b, r1, r2, o = {}) => prims.push(Object.assign({ t: 'rc', a, b, r1, r2, k: .03, col: GREY, col2: DARK, under: 'stripe', sf: 80, fur: 1 }, o));
    const el = (c, r, ax, o = {}) => prims.push(Object.assign({ t: 'el', c, r, ax, k: .03, col: GREY, col2: DARK, under: 'stripe', sf: 80, fur: 1 }, o));
    const I = [[1, 0, 0], [0, 1, 0], [0, 0, 1]];
    el([-.04, .09, 0], [.12, .09, .1], I);
    rc([-.03, .1, 0], [.05, .21, 0], .085, .068);
    el([.06, .17, 0], [.055, .08, .06], I, { col: CREAM, col2: null, under: null });
    for (const s of [-1, 1]) { rc([.07, .15, s * .032], [.09, .025, s * .032], .022, .018, { k: .02 }); el([.105, .016, s * .032], [.03, .015, .02], I, { col: CREAM, col2: null, under: null, k: .015 }); el([-.02, .06, s * .08], [.08, .06, .03], I, { k: .03 }); }
    // cabeça
    let f = rotY(rotZ([1, 0, 0], P.headP), P.headY), u = rotY(rotZ([0, 1, 0], P.headP), P.headY); const r = cross(f, u);
    const Hc = [.07, .3, 0]; const hf = (x, y, z) => add(add(add(Hc, mul(f, x)), mul(u, y)), mul(r, z));
    rc([.05, .22, 0], hf(-.01, -.02, 0), .06, .05);
    el(hf(0, 0, 0), [.055, .05, .062], [f, u, r], { k: .02 });
    el(hf(.04, -.018, 0), [.028, .022, .034], [f, u, r], { col: CREAM, col2: null, under: null, k: .015 });
    for (const s of [-1, 1]) rc(hf(-.005, .035, s * .032), hf(-.01, .085, s * .05), .024, .004, { k: .01, fur: .6 });
    // cauda enrolada
    let tp = [-.14, .04, 0], td = nrm([-.6, -.2, .8]);
    for (let i = 0; i < 9; i++) { td = nrm(rotY(td, -.28 + Math.sin(P.t * 2.2 - i * .5) * .12)); const nx = add(tp, mul(td, .04)); rc(tp, nx, .022, .02, { k: .015, sf: 120 }); tp = nx; }
    this.fur.update(prims, .007);
    for (const s of [-1, 1]) {
      const i = s > 0 ? 1 : 0, c = hf(.046, .012, s * .026), ef = nrm(add(f, mul(r, s * .45)));
      const eu = nrm(cross(cross(ef, u), ef)), er = cross(ef, eu);
      this.place(this.eyes[i], c, ef, eu, er, [.012, .012, .012]);
      const bl = P.blink; this.place(this.lids[i], add(c, mul(eu, .013 - bl * .011)), ef, eu, er, [.0135, .008 + bl * .004, .0135]); this.lids[i].visible = bl > .05;
    }
    this.place(this.nose, hf(.067, -.008, 0), f, u, r, [.006, .005, .008]);
  }
}

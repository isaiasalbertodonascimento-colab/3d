// 3D Dip-Road Chase, Long Lens — apocalipse zumbi (90 s, 9:16)
import * as THREE from 'three';
import { mergeGeometries, mergeVertices } from 'three/addons/utils/BufferGeometryUtils.js';

const W = 720, H = 1280, ASP = W / H, TOTAL = 90;
const TL = await (await fetch('/timeline.json')).json();
const Q = new URLSearchParams(location.search);

// ---------- utils ----------
function mulberry(seed) { return () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const smooth = (a, b, x) => { const t = clamp((x - a) / (b - a)); return t * t * (3 - 2 * t); };
const lerp = (a, b, t) => a + (b - a) * t;
const TAU = Math.PI * 2, DEG = Math.PI / 180;
const vfovOf = hfovDeg => 2 * Math.atan(Math.tan(hfovDeg * DEG / 2) / ASP) / DEG;

function canvasTex(w, h, draw, srgb = true) {
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c);
  if (srgb) t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 16; t.wrapS = t.wrapT = THREE.RepeatWrapping;
  return t;
}

// ---------- palette / sun ----------
const PAL = { sky: 0x7fb0e0, haze: 0xece4d2, sand: 0xd2ae80, sun: 0xfff0d8, car: 0x86b5ad };
const SUN = new THREE.Vector3(0.5, 0.86, 0.22).normalize();          // alto, vindo da lateral (+x)
const SHX = -SUN.x / SUN.y, SHZ = -SUN.z / SUN.y;                    // deslocamento da sombra por metro de altura

// ---------- terreno: estrada reta sobre ondulações ----------
const Z0 = -1660, Z1 = 1660;
const pBig = z => 40 * (1 - Math.cos(TAU * z / 2500));               // vale em z=0, cristas em ±1250
function dips(z) {
  const ph = TAU * z / 104 + 0.7 * Math.sin(TAU * z / 690) + 0.35 * Math.sin(TAU * z / 251 + 2.0);
  const a = 2.75 + 0.75 * Math.sin(TAU * z / 470 + 1.0);
  return a * Math.sin(ph);
}
const roadY = z => pBig(z) + dips(z);
function groundY(x, z) {
  const ax = Math.abs(x);
  const wash = dips(z + 0.05 * x) * (0.85 + 0.15 * Math.sin(x * 0.011 + z * 0.003));
  const broad = (6 * Math.sin(x * 0.0067 + z * 0.0021) + 4 * Math.sin(x * 0.0127 - z * 0.0043 + 1.3) + 3 * Math.sin(x * 0.0031 + 2.1) + 4) * smooth(10, 260, ax);
  const bump = (0.3 * Math.sin(x * 0.23 + z * 0.17) * Math.sin(x * 0.11 - z * 0.29 + 1) + 0.15 * Math.sin(x * 0.6 + z * 0.45)) * smooth(6, 14, ax);
  const nat = pBig(z) + wash + broad + bump - 0.08;
  return lerp(roadY(z) - 0.1, nat, smooth(4.5, 8.0, ax));
}

// ---------- renderer ----------
const renderer = new THREE.WebGLRenderer({ antialias: false, preserveDrawingBuffer: true });
renderer.setPixelRatio(1); renderer.setSize(W, H);
renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFShadowMap;
document.getElementById('wrap').prepend(renderer.domElement);
const depthTex = new THREE.DepthTexture(W, H); depthTex.type = THREE.FloatType;
const rt = new THREE.WebGLRenderTarget(W, H, { type: THREE.HalfFloatType, samples: 4, depthTexture: depthTex });

const scene = new THREE.Scene();
scene.fog = new THREE.Fog(PAL.haze, 650, 9000);
scene.add(new THREE.HemisphereLight(0xb4cfe9, 0xd8bd92, 0.8));
const sun = new THREE.DirectionalLight(PAL.sun, 2.0);
sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048); sun.shadow.bias = -0.0004; sun.shadow.normalBias = 0.03;
scene.add(sun, sun.target);

// céu: azul #7fb0e0, neblina só junto ao horizonte
{
  const g = new THREE.SphereGeometry(40000, 48, 24);
  const m = new THREE.ShaderMaterial({
    side: THREE.BackSide, depthWrite: false, fog: false,
    uniforms: { cs: { value: new THREE.Color(PAL.sky) }, ch: { value: new THREE.Color(PAL.haze) }, cz: { value: new THREE.Color(0x6e9fd6) } },
    vertexShader: `varying vec3 vd; void main(){ vd = normalize(position); gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.); gl_Position.z = gl_Position.w; }`,
    fragmentShader: `uniform vec3 cs, ch, cz; varying vec3 vd; void main(){ float e = vd.y;
      vec3 c = mix(ch, cs, smoothstep(0.035, 0.16, e)); c = mix(c, cz, smoothstep(0.3, 0.95, e)); gl_FragColor = vec4(c*1.05, 1.); }`
  });
  const sky = new THREE.Mesh(g, m); sky.renderOrder = -10; sky.frustumCulled = false; scene.add(sky);
  window._sky = sky;
}

// --- textura da areia
const sandTex = canvasTex(512, 512, (g, w, h) => {
  const r = mulberry(11); g.fillStyle = '#d2ae80'; g.fillRect(0, 0, w, h);
  const img = g.getImageData(0, 0, w, h);
  for (let i = 0; i < w * h; i++) { const v = (r() - .5) * 22; img.data[i * 4] += v; img.data[i * 4 + 1] += v * .95; img.data[i * 4 + 2] += v * .85; }
  g.putImageData(img, 0, 0);
  for (let i = 0; i < 900; i++) { g.fillStyle = `rgba(${90 + r() * 40},${80 + r() * 30},${60 + r() * 20},${.15 + r() * .25})`; g.fillRect(r() * w, r() * h, 1 + r() * 2.5, 1 + r() * 2); }
  for (let i = 0; i < 260; i++) { g.fillStyle = `rgba(${95 + r() * 30},${120 + r() * 30},${60 + r() * 20},${.25 + r() * .3})`; g.beginPath(); g.arc(r() * w, r() * h, 1 + r() * 3, 0, 7); g.fill(); }
  for (let i = 0; i < 400; i++) { g.fillStyle = `rgba(255,248,232,${.15 + r() * .2})`; g.fillRect(r() * w, r() * h, 1, 1); }
});

// --- asfalto escuro e rachado (u: largura 8.4 m, v: 40 m)
const roadTex = canvasTex(256, 1024, (g, w, h) => {
  const r = mulberry(5);
  g.fillStyle = '#2d2e30'; g.fillRect(0, 0, w, h);
  const img = g.getImageData(0, 0, w, h);
  for (let i = 0; i < w * h; i++) { const v = (r() - .5) * 18 + (r() < .03 ? 22 : 0); img.data[i * 4] += v; img.data[i * 4 + 1] += v; img.data[i * 4 + 2] += v * 1.05; }
  g.putImageData(img, 0, 0);
  for (let i = 0; i < 14; i++) { g.fillStyle = r() < .5 ? 'rgba(20,20,22,.35)' : 'rgba(70,70,72,.25)'; g.fillRect(r() * w, r() * h, 20 + r() * 90, 30 + r() * 160); }
  const crack = (x, y, len, ang, wdt, col) => {
    g.strokeStyle = col; g.lineWidth = wdt; g.beginPath(); g.moveTo(x, y);
    for (let k = 0; k < len; k++) { ang += (r() - .5) * .9; x += Math.cos(ang) * 6; y += Math.sin(ang) * 6; g.lineTo(x, y); if (r() < .08) crack(x, y, len * .4 | 0, ang + (r() - .5) * 2.5, wdt * .7, col); }
    g.stroke();
  };
  for (let i = 0; i < 22; i++) crack(r() * w, r() * h, 20 + r() * 60, Math.PI / 2 + (r() - .5) * .6, 1 + r() * 1.5, 'rgba(14,14,15,.85)');
  for (let i = 0; i < 18; i++) crack(r() * w, r() * h, 6 + r() * 20, (r() - .5) * .8, 1 + r(), 'rgba(14,14,15,.8)');
  for (let i = 0; i < 9; i++) crack(r() * w, r() * h, 25 + r() * 40, Math.PI / 2 + (r() - .5) * .5, 2.5 + r() * 2, 'rgba(8,8,9,.75)');   // remendos de piche
  for (const cx of [.25, .75]) for (let i = 0; i < 160; i++) { // fissuras "couro de jacaré" nas trilhas de roda
    const x = (cx + (r() - .5) * .12) * w, y = r() * h; crack(x, y, 2 + r() * 3, r() * 6.3, .8, 'rgba(16,16,17,.6)');
  }
  const line = (u0, u1, col, dash) => { for (let y = 0; y < h; y += 2) { if (dash && (y % 300) > 170) continue; const a = .45 + r() * .35; if (r() < .08) continue; g.fillStyle = col.replace('A', a.toFixed(2)); g.fillRect(u0 * w, y, (u1 - u0) * w, 2); } };
  line(.045, .06, 'rgba(214,208,192,A)'); line(.94, .955, 'rgba(214,208,192,A)');
  line(.478, .49, 'rgba(196,166,82,A)'); line(.51, .522, 'rgba(196,166,82,A)');
  for (let y = 0; y < h; y++) { for (const s of [0, 1]) { const ww = 2 + r() * 7; g.fillStyle = `rgba(150,136,112,${.55 + r() * .4})`; g.fillRect(s ? w - ww : 0, y, ww, 1); } }
});

// --- malha do terreno
{
  const half = [4.45, 5, 5.7, 6.5, 7.5, 8.8, 10.3, 12, 14, 16.5, 19.5, 23, 27, 32, 38, 45, 54, 65, 78, 94, 113, 136, 164, 198, 240, 290, 350, 425, 520, 640, 790, 980, 1220, 1500];
  const XS = [...half.map(v => -v).reverse(), ...half];
  const NZ = (Z1 - Z0) / 2 + 1, NX = XS.length;
  const pos = new Float32Array(NZ * NX * 3), col = new Float32Array(NZ * NX * 3), uv = new Float32Array(NZ * NX * 2);
  let k = 0;
  for (let i = 0; i < NZ; i++) { const z = Z0 + i * 2; for (let j = 0; j < NX; j++, k++) {
    const x = XS[j], ax = Math.abs(x);
    pos[k * 3] = x; pos[k * 3 + 1] = groundY(x, z); pos[k * 3 + 2] = z;
    uv[k * 2] = x / 6; uv[k * 2 + 1] = z / 6;
    let f = 0.95 + 0.05 * Math.sin(x * 0.05 + z * 0.031) * Math.sin(x * 0.021 - z * 0.047) + 0.03 * Math.sin(x * 0.4 + z * 0.33);
    let cr = f, cg = f, cb = f;
    const gv = 1 - smooth(5.5, 8, ax);                    // cascalho acinzentado no acostamento
    cr = lerp(cr, .86, gv); cg = lerp(cg, .9, gv); cb = lerp(cb, .98, gv);
    const gr = 0.06 * clamp(Math.sin(x * 0.017 + z * 0.009) * 1.5);  // manchas esverdeadas
    col[k * 3] = cr - gr; col[k * 3 + 1] = cg + gr * .3; col[k * 3 + 2] = cb - gr * .6;
  } }
  const idx = new Uint32Array((NZ - 1) * (NX - 1) * 6); k = 0;
  for (let i = 0; i < NZ - 1; i++) for (let j = 0; j < NX - 1; j++) { const a = i * NX + j, b = a + 1, c = a + NX, d = c + 1; idx.set([a, c, b, b, c, d], k); k += 6; }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); g.setAttribute('color', new THREE.BufferAttribute(col, 3)); g.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
  g.setIndex(new THREE.BufferAttribute(idx, 1)); g.computeVertexNormals();
  const m = new THREE.Mesh(g, new THREE.MeshLambertMaterial({ map: sandTex, vertexColors: true }));
  m.receiveShadow = true; scene.add(m);
}
// --- malha da estrada
{
  const XS = [-4.6, -4.2, -2.1, 0, 2.1, 4.2, 4.6];
  const NZ = (Z1 - Z0) + 1, NX = XS.length;
  const pos = new Float32Array(NZ * NX * 3), uv = new Float32Array(NZ * NX * 2);
  let k = 0;
  for (let i = 0; i < NZ; i++) { const z = Z0 + i; const y = roadY(z); for (let j = 0; j < NX; j++, k++) {
    const x = XS[j], ax = Math.abs(x);
    pos[k * 3] = x; pos[k * 3 + 1] = ax > 4.3 ? y - 0.16 : y + 0.05 * (1 - (x / 4.2) ** 2); pos[k * 3 + 2] = z;
    uv[k * 2] = clamp((x + 4.2) / 8.4, 0.004, .996); uv[k * 2 + 1] = z / 40;
  } }
  const idx = []; for (let i = 0; i < NZ - 1; i++) for (let j = 0; j < NX - 1; j++) { const a = i * NX + j, b = a + 1, c = a + NX, d = c + 1; idx.push(a, c, b, b, c, d); }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); g.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
  g.setIndex(idx); g.computeVertexNormals();
  const m = new THREE.Mesh(g, new THREE.MeshLambertMaterial({ map: roadTex, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 }));
  m.receiveShadow = true; scene.add(m);
}

// --- sombras planas (projetadas no chão) para os objetos estáticos
const shadowMat = new THREE.MeshBasicMaterial({ color: 0x0b0d14, transparent: true, opacity: 0.6, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -4, polygonOffsetUnits: -4 });
function groundStrip(x0, z0, x1, z1, wdt, segs = 6) {   // fita no chão de (x0,z0) até (x1,z1)
  const dx = x1 - x0, dz = z1 - z0, L = Math.hypot(dx, dz) || 1, nx = -dz / L * wdt / 2, nz = dx / L * wdt / 2;
  const p = [], ix = [];
  for (let s = 0; s <= segs; s++) { const t = s / segs, x = x0 + dx * t, z = z0 + dz * t;
    p.push(x + nx, groundY(x + nx, z + nz) + .04, z + nz, x - nx, groundY(x - nx, z - nz) + .04, z - nz);
    if (s) { const a = (s - 1) * 2; ix.push(a, a + 1, a + 2, a + 1, a + 3, a + 2); } }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(p, 3)); g.setIndex(ix); return g;
}

// --- vegetação rasteira verde e densa (instâncias por bloco, p/ culling)
function buildBushes(avoid) {
  const R = mulberry(77);
  const geos = [0, 1, 2].map(s => {
    const g0 = new THREE.IcosahedronGeometry(1, 1); g0.deleteAttribute('normal'); g0.deleteAttribute('uv'); const g = mergeVertices(g0); const p = g.attributes.position; const rr = mulberry(100 + s);
    for (let i = 0; i < p.count; i++) { const x = p.getX(i), y = p.getY(i), z = p.getZ(i); const f = 0.82 + 0.18 * Math.sin(x * 5 + s) * Math.sin(z * 4 + y * 3) + rr() * 0.12; p.setXYZ(i, x * f, Math.max(y * f * 0.62, -0.2) + 0.28, z * f); }
    g.computeVertexNormals(); return g;
  });
  const lowGeo = (() => { const g0 = new THREE.IcosahedronGeometry(1, 0); g0.deleteAttribute('normal'); g0.deleteAttribute('uv'); const g = mergeVertices(g0); g.scale(1, .6, 1); g.translate(0, .3, 0); g.computeVertexNormals(); return g; })();
  const shGeo = (() => { const g = new THREE.CircleGeometry(1, 10); g.rotateX(-Math.PI / 2); const p = g.attributes.position; const L = 0.75;
    for (let i = 0; i < p.count; i++) { const x = p.getX(i), z = p.getZ(i); const d = x * SHX + z * SHZ; const s = Math.max(0, d) * L; p.setXYZ(i, x * .95 + SHX * (0.35 + s * .6), .05, z * .95 + SHZ * (0.35 + s * .6)); } return g; })();
  const bushMat = new THREE.MeshLambertMaterial({ color: 0xffffff });
  const bands = [[5.4, 40, 8], [40, 110, 14], [110, 300, 55], [300, 760, 260]];
  const M = new THREE.Matrix4(), Pv = new THREE.Vector3(), Qi = new THREE.Quaternion(), S = new THREE.Vector3(), Cc = new THREE.Color();
  for (let zc = Z0; zc < Z1; zc += 100) for (const side of [-1, 1]) for (const [b0, b1, dens] of bands) {
    const n = Math.round((b1 - b0) * 100 / dens);
    const near = b0 < 50;
    const geo = near ? geos[(zc / 100 + side + 9) % 3 | 0] : lowGeo;
    const im = new THREE.InstancedMesh(geo, bushMat, n), sm = new THREE.InstancedMesh(shGeo, shadowMat, n);
    let k = 0;
    for (let tries = 0; k < n && tries < n * 4; tries++) {
      const x = side * (b0 + R() * (b1 - b0)), z = zc + R() * 100;
      const patch = 0.5 + 0.5 * Math.sin(x * 0.09 + z * 0.05) * Math.sin(x * 0.037 - z * 0.071 + 2);
      if (R() > 0.35 + patch * 0.65) continue;
      if (avoid.some(a => (a[0] - x) ** 2 + (a[1] - z) ** 2 < 81)) continue;
      const s = (0.35 + R() * R() * 0.9) * (near ? 1 : 1.25);
      Pv.set(x, groundY(x, z) - 0.06, z); S.set(s * (0.9 + R() * .4), s * (0.7 + R() * .6), s * (0.9 + R() * .4));
      M.compose(Pv, Qi, S); im.setMatrixAt(k, M); sm.setMatrixAt(k, M);
      Cc.setHSL(0.2 + R() * 0.08, 0.28 + R() * 0.18, 0.25 + R() * 0.12); im.setColorAt(k, Cc); k++;
    }
    im.count = sm.count = k; im.computeBoundingSphere(); sm.computeBoundingSphere();
    scene.add(im, sm);
  }
}

// --- postes de madeira com fios, balizadores e placas "DIP"
{
  const R = mulberry(31);
  const wood = new THREE.MeshLambertMaterial({ color: 0x4f4135 }), white = new THREE.MeshLambertMaterial({ color: 0xd9d6cc }), refl = new THREE.MeshLambertMaterial({ color: 0xc8732e });
  const pg = [], wg = [], rg = [], sg = [], wires = [];
  const poleX = 10.5; let prev = null;
  for (let z = Z0 + 10; z < Z1; z += 52 + (R() - .5) * 6) {
    const x = poleX + (R() - .5) * .6, y = groundY(x, z) - .2, h = 9.4 + R() * .6, lean = (R() - .5) * .05;
    const c = new THREE.CylinderGeometry(.12, .16, h, 7); c.translate(0, h / 2, 0); c.rotateZ(lean); c.translate(x, y, z); pg.push(c);
    const b = new THREE.BoxGeometry(2.3, .13, .12); b.translate(x - lean * h, y + h - .5, z); pg.push(b);
    const att = [-1.0, -0.1, 0.95].map(o => new THREE.Vector3(x - lean * h + o, y + h - .38, z));
    if (prev) for (let w = 0; w < 3; w++) { const A = prev[w], B = att[w];
      for (let s = 0; s < 12; s++) { const t0 = s / 12, t1 = (s + 1) / 12;
        const P = t => new THREE.Vector3().lerpVectors(A, B, t).add(new THREE.Vector3(0, -0.9 * 4 * t * (1 - t), 0)); wires.push(P(t0), P(t1)); } }
    prev = att;
    sg.push(groundStrip(x, z, x + SHX * h, z + SHZ * h, .3, 8));
    sg.push(groundStrip(x + SHX * (h - .5) - 1.15, z + SHZ * (h - .5), x + SHX * (h - .5) + 1.15, z + SHZ * (h - .5), .14, 3));
  }
  for (let z = Z0 + 20; z < Z1; z += 40) for (const s of [-1, 1]) {
    const x = s * 5.1, zz = z + (s > 0 ? 20 : 0), y = groundY(x, zz);
    const p = new THREE.BoxGeometry(.09, 1.15, .06); p.translate(x, y + .5, zz); wg.push(p);
    const r = new THREE.BoxGeometry(.07, .14, .065); r.translate(x, y + 0.95, zz); rg.push(r);
    sg.push(groundStrip(x, zz, x + SHX * 1.1, zz + SHZ * 1.1, .09, 2));
  }
  const signTex = canvasTex(256, 256, (g, w, h) => {
    g.translate(128, 128); g.rotate(Math.PI / 4); g.fillStyle = '#1b1b1b'; g.fillRect(-88, -88, 176, 176); g.fillStyle = '#d4ad3c'; g.fillRect(-80, -80, 160, 160);
    g.setTransform(1, 0, 0, 1, 0, 0); g.fillStyle = '#1b1b1b'; g.font = 'bold 70px Arial'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('DIP', 128, 132);
  });
  const signMat = new THREE.MeshLambertMaterial({ map: signTex, transparent: true, alphaTest: .5 });
  for (const z of [-1180, -860, -520, -300, -140, 90, 260, 480, 790, 1100]) {
    const x = -5.9, y = groundY(x, z);
    const p = new THREE.BoxGeometry(.08, 2.2, .08); p.translate(x, y + 1.1, z); wg.push(p);
    const s = new THREE.Mesh(new THREE.PlaneGeometry(1.1, 1.1), signMat); s.position.set(x, y + 2.35, z + .05); scene.add(s);
    const s2 = s.clone(); s2.rotation.y = Math.PI; s2.position.z = z - .05; scene.add(s2);
    sg.push(groundStrip(x, z, x + SHX * 2.9, z + SHZ * 2.9, .1, 3));
  }
  scene.add(new THREE.Mesh(mergeGeometries(pg), wood), new THREE.Mesh(mergeGeometries(wg), white), new THREE.Mesh(mergeGeometries(rg), refl));
  scene.add(new THREE.Mesh(mergeGeometries(sg), shadowMat));
  scene.add(new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(wires), new THREE.LineBasicMaterial({ color: 0x262626 })));
}

// ---------- pessoas (zumbis, motoqueiro, ocupantes) ----------
const BOX = {};
const box = (w, h, d) => BOX[`${w},${h},${d}`] ||= new THREE.BoxGeometry(w, h, d);
const matCache = {};
const lam = c => matCache[c] ||= new THREE.MeshLambertMaterial({ color: c });
function makeHuman({ skin, shirt, pants, shoes = 0x3a332c }) {
  const g = new THREE.Group(), add = (p, geo, m, x = 0, y = 0, z = 0) => { const o = new THREE.Mesh(geo, lam(m)); o.position.set(x, y, z); p.add(o); return o; };
  const hips = new THREE.Group(); hips.position.y = .95; g.add(hips);
  add(hips, box(.34, .2, .2), pants, 0, .02);
  const torso = new THREE.Group(); torso.position.y = .1; hips.add(torso);
  add(torso, box(.42, .56, .24), shirt, 0, .28);
  const head = new THREE.Group(); head.position.y = .6; torso.add(head);
  add(head, box(.2, .25, .22), skin, 0, .13); add(head, box(.06, .05, .06), skin, 0, -.02);
  const arm = s => { const sh = new THREE.Group(); sh.position.set(s * .27, .52, 0); torso.add(sh); add(sh, box(.11, .32, .12), shirt, 0, -.15);
    const el = new THREE.Group(); el.position.y = -.31; sh.add(el); add(el, box(.1, .3, .1), skin, 0, -.15); add(el, box(.09, .1, .09), skin, 0, -.33); return [sh, el]; };
  const leg = s => { const hp = new THREE.Group(); hp.position.set(s * .1, -.02, 0); hips.add(hp); add(hp, box(.15, .45, .16), pants, 0, -.22);
    const kn = new THREE.Group(); kn.position.y = -.45; hp.add(kn); add(kn, box(.13, .45, .14), pants, 0, -.22); add(kn, box(.12, .08, .27), shoes, 0, -.46, .05); return [hp, kn]; };
  const [aL, eL] = arm(1), [aR, eR] = arm(-1), [lL, kL] = leg(1), [lR, kR] = leg(-1);
  return { g, hips, torso, head, aL, eL, aR, eR, lL, kL, lR, kR };
}

// zumbis na beira da estrada
const zombies = [];
{
  const R = mulberry(909);
  const skins = [0x8d9479, 0x9a9a82, 0x7f8a74, 0xa39c86], shirts = [0x6f6657, 0x5d6870, 0x7b6a5a, 0x8a8577, 0x5b5a4f, 0x7a5f55], pantsC = [0x4d4a44, 0x55606a, 0x5f5546, 0x3f4448];
  const zsh = new THREE.CircleGeometry(1, 12); zsh.rotateX(-Math.PI / 2);
  { const p = zsh.attributes.position; for (let i = 0; i < p.count; i++) { const x = p.getX(i) * .32, z = p.getZ(i) * .32, d = Math.max(0, (x * SHX + z * SHZ) / .66 / .32); p.setXYZ(i, x + SHX * .62 * d * .9 + SHX * .25, .05, z + SHZ * .62 * d * .9 + SHZ * .25); } }
  for (let c = 0; c < 26; c++) {
    const zc = -1250 + R() * 2400, side = R() < .5 ? -1 : 1, xc = side * (7 + R() * 22), n = 2 + (R() * 5 | 0);
    for (let i = 0; i < n; i++) {
      const h = makeHuman({ skin: skins[R() * 4 | 0], shirt: shirts[R() * 6 | 0], pants: pantsC[R() * 4 | 0] });
      const s = 0.92 + R() * .16; h.g.scale.setScalar(s);
      const x = xc + (R() - .5) * 10, z = zc + (R() - .5) * 14;
      const dir = new THREE.Vector2(-Math.sign(x), (R() - .5) * 1.2).normalize();
      const sh = new THREE.Mesh(zsh, shadowMat); sh.scale.setScalar(s);
      scene.add(h.g, sh);
      zombies.push({ h, sh, x0: x, z0: z, dir, sp: .35 + R() * .4, ph: R() * 10, limp: .6 + R() * .4 });
    }
  }
}
function animZombies(t) {
  for (const zb of zombies) {
    const d = Math.min(zb.sp * (t + 3), Math.max(0, Math.abs(zb.x0) - 5.5) / Math.max(.2, Math.abs(zb.dir.x)));
    const x = zb.x0 + zb.dir.x * d, z = zb.z0 + zb.dir.y * d, y = groundY(x, z);
    const h = zb.h; h.g.position.set(x, y, z); h.g.rotation.y = Math.atan2(zb.dir.x, zb.dir.y);
    zb.sh.position.set(x, y, z);
    const p = (t * zb.sp * 3.2 + zb.ph);
    h.lL.rotation.x = .42 * Math.sin(p); h.lR.rotation.x = -.42 * Math.sin(p) * zb.limp;
    h.kL.rotation.x = .5 * Math.max(0, -Math.sin(p)); h.kR.rotation.x = .5 * Math.max(0, Math.sin(p)) * zb.limp;
    h.torso.rotation.x = .3 + .05 * Math.sin(2 * p); h.torso.rotation.z = .1 * Math.sin(p);
    h.hips.position.y = .95 - .03 * Math.abs(Math.sin(p));
    h.aL.rotation.x = -1.2 + .12 * Math.sin(p + 1); h.aR.rotation.x = -1.05 + .12 * Math.sin(p + 2.3); h.aR.rotation.z = -.1; h.aL.rotation.z = .1;
    h.eL.rotation.x = -.2; h.eR.rotation.x = -.35;
    h.head.rotation.x = .25 + .1 * Math.sin(p * .5); h.head.rotation.z = .25 * Math.sin(zb.ph);
  }
}

// ---------- veículos ----------
const std = (c, r = .6, m = 0, extra = {}) => new THREE.MeshStandardMaterial({ color: c, roughness: r, metalness: m, ...extra });
function shadowAll(o) { o.traverse(m => { if (m.isMesh) { m.castShadow = true; m.receiveShadow = true; } }); }
function makeCar() {
  const root = new THREE.Group(), body = new THREE.Group(); root.add(body);
  const paint = std(PAL.car, .5, .05), dark = std(0x1c1d1e, .85), chrome = std(0xb8b6ae, .3), glass = std(0x121719, .12, 0, { transparent: true, opacity: .62 });
  const add = (geo, m, x, y, z, p = body) => { const o = new THREE.Mesh(geo, m); o.position.set(x, y, z); p.add(o); return o; };
  add(new THREE.BoxGeometry(1.86, .5, 4.95), paint, 0, .66, 0);
  add(new THREE.BoxGeometry(1.8, .1, 1.55), paint, 0, .95, 1.6);
  add(new THREE.BoxGeometry(1.8, .1, 1.05), paint, 0, .95, -1.95);
  const cab = new THREE.BoxGeometry(1.62, .48, 2.15); { const p = cab.attributes.position;
    for (let i = 0; i < p.count; i++) if (p.getY(i) > 0) { p.setX(i, p.getX(i) * .86); p.setZ(i, p.getZ(i) > 0 ? p.getZ(i) - .5 : p.getZ(i) + .3); } cab.computeVertexNormals(); }
  add(cab, glass, 0, 1.14, -.2);
  add(new THREE.BoxGeometry(1.4, .06, 1.38), paint, 0, 1.4, -.3);
  for (const s of [-1, 1]) { const pil = add(new THREE.BoxGeometry(.06, .5, .08), paint, s * .74, 1.15, .62); pil.rotation.x = -.8; add(new THREE.BoxGeometry(.06, .46, .1), paint, s * .73, 1.14, -1.1).rotation.x = .5; }
  add(new THREE.BoxGeometry(1.92, .14, .16), chrome, 0, .5, 2.5); add(new THREE.BoxGeometry(1.92, .14, .16), chrome, 0, .5, -2.5);
  add(new THREE.BoxGeometry(1.35, .2, .04), dark, 0, .7, 2.48);
  for (const s of [-1, 1]) { add(new THREE.CylinderGeometry(.09, .09, .05, 12).rotateX(Math.PI / 2), std(0xf2eee0, .2), s * .7, .72, 2.49); add(new THREE.BoxGeometry(.3, .12, .04), std(0x8a2420, .4), s * .65, .75, -2.48); }
  add(new THREE.BoxGeometry(1.7, .16, 4.5), dark, 0, .38, 0);
  for (const s of [-1, 1]) add(new THREE.BoxGeometry(.02, .05, 4.6), chrome, s * .935, .72, 0);
  // ocupantes
  for (const [x, c] of [[.38, 0x5a4a3c], [-.38, 0x6d6a5c]]) { add(new THREE.BoxGeometry(.42, .45, .26), lam(c), x, 1.03, -.3); add(new THREE.SphereGeometry(.11, 10, 8), lam(0xb08a6e), x, 1.36, -.28); add(new THREE.SphereGeometry(.115, 10, 8, 0, TAU, 0, 1.4), lam(0x2e2620), x, 1.39, -.3); }
  const wheels = [];
  const tire = new THREE.CylinderGeometry(.33, .33, .24, 16).rotateZ(Math.PI / 2), hub = new THREE.CylinderGeometry(.19, .19, .25, 12).rotateZ(Math.PI / 2);
  for (const [x, z] of [[.8, 1.42], [-.8, 1.42], [.8, -1.42], [-.8, -1.42]]) { const w = new THREE.Group(); w.position.set(x, .33, z); root.add(w);
    add(tire, dark, 0, 0, 0, w); add(hub, chrome, 0, 0, 0, w); add(new THREE.BoxGeometry(.26, .05, .3), dark, 0, 0, 0, w); wheels.push(w); }
  shadowAll(root); return { root, body, wheels, r: .33, wb: 1.42 };
}
function makeBike() {
  const root = new THREE.Group(), body = new THREE.Group(); root.add(body);
  const dark = std(0x26282a, .7), metal = std(0x8d8d88, .35), tank = std(0x7d4335, .45);
  const add = (geo, m, x, y, z, p = body) => { const o = new THREE.Mesh(geo, m); o.position.set(x, y, z); p.add(o); return o; };
  add(new THREE.BoxGeometry(.3, .34, .62), dark, 0, .52, 0); add(new THREE.BoxGeometry(.33, .2, .52), tank, 0, .84, .22);
  add(new THREE.BoxGeometry(.28, .09, .62), std(0x18191a, .9), 0, .82, -.32);
  for (const s of [-1, 1]) { const f = add(new THREE.BoxGeometry(.05, .66, .05), metal, s * .1, .62, .62); f.rotation.x = .35; }
  add(new THREE.BoxGeometry(.72, .04, .04), metal, 0, 1.0, .5); add(new THREE.CylinderGeometry(.08, .08, .08, 10).rotateX(Math.PI / 2), std(0xf0ecdc, .2), 0, .9, .7);
  add(new THREE.BoxGeometry(.08, .08, .7), metal, .16, .4, -.35);
  const rider = makeHuman({ skin: 0xa8846a, shirt: 0x6b5843, pants: 0x4c5764, shoes: 0x2a2622 });
  rider.g.position.set(0, -.1, -.32); body.add(rider.g);
  rider.lL.rotation.x = rider.lR.rotation.x = -1.25; rider.kL.rotation.x = rider.kR.rotation.x = 1.55; rider.lL.rotation.z = .12; rider.lR.rotation.z = -.12;
  rider.torso.rotation.x = .55; rider.aL.rotation.x = rider.aR.rotation.x = -1.05; rider.eL.rotation.x = rider.eR.rotation.x = -.35; rider.aL.rotation.z = .25; rider.aR.rotation.z = -.25;
  rider.head.add(new THREE.Mesh(new THREE.SphereGeometry(.16, 14, 10), std(0xd7d1c2, .35))).position.y = .14;
  const wheels = []; const tire = new THREE.CylinderGeometry(.32, .32, .12, 16).rotateZ(Math.PI / 2);
  for (const z of [.72, -.72]) { const w = new THREE.Group(); w.position.set(0, .32, z); root.add(w); add(tire, dark, 0, 0, 0, w); add(new THREE.BoxGeometry(.13, .5, .03), metal, 0, 0, 0, w); wheels.push(w); }
  shadowAll(root); return { root, body, wheels, r: .32, wb: .72, rider };
}
const car = makeCar(), bike = makeBike(); scene.add(car.root, bike.root);

// ---------- simulação (estrada ondulada, decolagem nas cristas, pouso) ----------
const SIM_DT = 1 / 240, PRE = 3;
function simulate(zStart, v, T, wb) {
  const n = Math.ceil((T + PRE) / SIM_DT) + 2;
  const Z = new Float32Array(n), Y = new Float32Array(n), P = new Float32Array(n), HV = new Float32Array(n), AIR = new Uint8Array(n), ev = [];
  const gy = z => (roadY(z + wb) + roadY(z - wb)) / 2, gp = z => Math.atan2(roadY(z + wb) - roadY(z - wb), 2 * wb);
  let z = zStart - v * PRE, air = false, y = gy(z), vy = v * (gy(z + .05) - gy(z - .05)) / .1, pitch = 0, prate = 0, po = 0, pov = 0, h = 0, hv = 0;
  for (let i = 0; i < n; i++) {
    Z[i] = z; Y[i] = y; P[i] = air ? pitch : gp(z) + po; HV[i] = h; AIR[i] = air ? 1 : 0;
    const zn = z + v * SIM_DT, gn = gy(zn); let ay = 0;
    if (!air) {
      const yb = y + vy * SIM_DT - 4.905 * SIM_DT * SIM_DT;
      if (yb > gn + 1e-7) { air = true; pitch = gp(z) + po; prate = (gp(zn) - gp(z)) / SIM_DT * .6; y = yb; vy -= 9.81 * SIM_DT; ev.push({ k: 'off', t: i * SIM_DT - PRE, z }); }
      else { const nvy = (gn - y) / SIM_DT; ay = (nvy - vy) / SIM_DT; vy = nvy; y = gn; }
    } else {
      y += vy * SIM_DT - 4.905 * SIM_DT * SIM_DT; vy -= 9.81 * SIM_DT; pitch += prate * SIM_DT; prate -= .35 * SIM_DT;
      if (y <= gn) { if (i * SIM_DT - PRE - ev[ev.length - 1].t < .06) ev.pop(); else ev[ev.length - 1].air = 1; const gvy = v * (gy(zn + .05) - gy(zn - .05)) / .1, imp = vy - gvy; air = false; y = gn; vy = gvy; po = pitch - gp(zn); pov = 0; hv += imp * .3; if (-imp > 1.2) ev.push({ k: 'land', t: (i + 1) * SIM_DT - PRE, z: zn, imp: -imp }); }
    }
    hv += (-200 * h - 17 * hv - clamp(ay, -60, 60) * .9) * SIM_DT; h = clamp(h + hv * SIM_DT, -.16, .1);
    if (!air) { pov += (-160 * po - 16 * pov) * SIM_DT; po += pov * SIM_DT; }
    z = zn;
  }
  const sample = t => { const f = clamp((t + PRE) / SIM_DT, 0, n - 1.001), i = f | 0, a = f - i;
    return { z: lerp(Z[i], Z[i + 1], a), y: lerp(Y[i], Y[i + 1], a), pitch: lerp(P[i], P[i + 1], a), heave: lerp(HV[i], HV[i + 1], a), air: AIR[i] }; };
  return { sample, ev, AIR, v };
}
const CAR_X = -1.9, CAR_V = 37, BIKE_GAP = 15;
const bikeX = t => -0.5 + .45 * Math.sin(t * .8);
function placeVehicle(V, s, x, t) {
  V.root.position.set(x, s.y, s.z); V.root.rotation.set(-s.pitch, 0, 0); V.body.position.y = s.heave;
  for (const w of V.wheels) w.rotation.x = s.z / V.r;
  if (V.rider) { V.root.rotation.z = .03 * Math.sin(t * 1.3); V.rider.torso.rotation.x = .55 - s.heave * 2; }
}

// ---------- poeira (pousos + rastro leve) ----------
const dustTex = canvasTex(128, 128, (g, w, h) => {
  const r = mulberry(3);
  for (let i = 0; i < 26; i++) { const x = 64 + (r() - .5) * 50, y = 64 + (r() - .5) * 50, rad = 14 + r() * 36;
    const gr = g.createRadialGradient(x, y, 0, x, y, rad); gr.addColorStop(0, 'rgba(255,255,255,.22)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, w, h); }
});
const dustCol = new THREE.Color(0xe4cfaa).multiplyScalar(1.25);
const dustPool = []; for (let i = 0; i < 420; i++) { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: dustTex, color: dustCol, transparent: true, depthWrite: false, opacity: 0 })); s.visible = false; scene.add(s); dustPool.push(s); }
function dustParticles(sim, x, t, scale) {
  const out = [];
  sim.ev.forEach((e, ei) => { if (e.k !== 'land') return; const age = t - e.t; if (age < 0 || age > 3.6) return;
    const r = mulberry(1000 + ei * 7 + (scale * 10 | 0)); const I = clamp(e.imp / 4, .35, 1.2) * scale;
    for (let i = 0; i < 18; i++) { const life = 2.4 + r() * 1.2; if (age > life) { r(); r(); r(); r(); continue; }
      const a = r() * TAU, sp = 1.5 + r() * 4, fw = 2 + r() * 6, k = (1 - Math.exp(-1.6 * age)) / 1.6;
      const px = x + Math.cos(a) * (.6 + sp * k) * (r() < .5 ? 1 : .6), pz = e.z + (r() - .5) * 3 + Math.sin(a) * sp * .5 * k + fw * k, py = roadY(pz) + .3 + (.4 + r() * 1.2) * k;
      out.push([px, py, pz, (1 + 4.5 * Math.sqrt(age / life)) * I, .5 * I * Math.pow(1 - age / life, 1.6) * smooth(0, .12, age)]); } });
  for (let k = 0; k < 40; k++) { const te = Math.floor(t / .05) * .05 - k * .05, age = t - te; if (age > 1.8) break; const s = sim.sample(te); if (s.air) continue;
    const r = mulberry(5000 + Math.round(te * 20)); for (const side of [-1, 1]) {
      const px = x + side * .75 * scale + (r() - .5) * age * 1.2, pz = s.z - 1.5 * scale + age * 2.5, py = roadY(pz) + .15 + age * .5;
      out.push([px, py, pz, (.5 + age * 1.3) * scale, .06 * (1 - age / 1.8) * smooth(0, .1, age)]); } }
  return out;
}

// ---------- planos (shots) ----------
// A: assinatura, teleobjetiva 2–5° (3–5 s) | B: câmera baixa na crista (1–2 s) | C: câmera montada no carro / na moto (1–2 s)
const shots = [];
{
  const R = mulberry(2025);
  const bounds = [0, ...TL.slice(1).map(s => s.start - .3), TOTAL];
  const plan = [];
  for (let i = 0; i < bounds.length - 1; i++) {
    const a = bounds[i], b = bounds[i + 1], dur = b - a;
    if (i === bounds.length - 2) { plan.push(['A', a, a + 3.6]); plan.push(['B', a + 3.6, a + 5.1]); plan.push(['C', a + 5.1, a + 6.6]); plan.push(['A', a + 6.6, b, 'end']); continue; }
    const ad = clamp(dur * .55, 3.2, 5), rest = dur - ad, n = Math.max(1, Math.ceil(rest / 1.95));
    plan.push(['A', a, a + ad]); for (let k = 0; k < n; k++) plan.push([k % 2 === 0 ? (R() < .5 ? 'B' : 'C') : 'C', a + ad + rest * k / n, a + ad + rest * (k + 1) / n]);
  }
  // evita repetir o mesmo tipo curto em sequência
  for (let i = 1; i < plan.length; i++) if (plan[i][0] !== 'A' && plan[i][0] === plan[i - 1][0]) plan[i][0] = plan[i][0] === 'B' ? 'C' : 'B';
  let aCount = 0, cCount = 0;
  const firstEvent = (sim, kind, lo, hi) => sim.ev.find(e => e.k === kind && e.t >= lo && e.t <= hi && (kind !== 'off' || e.air));
  for (const [type, t0, t1, tag] of plan) {
    const dur = t1 - t0, sh = { type, t0, t1 };
    if (type === 'A') {
      const recede = tag === 'end' || (aCount % 3 === 2); aCount++;
      let best = null;
      for (let tries = 0; tries < 400 && !best; tries++) {
        const hfov = [2.0, 2.2, 2.6, 3.0, 3.5, 4.2][R() * 6 | 0], vf = vfovOf(hfov) * DEG;
        const cx = [-6.2, -5.4, 5.6, 6.4][R() * 4 | 0], hc = 1.8 + R() * 3.5;
        const cz = recede ? -150 + R() * 200 : -50 + R() * 200;
        const D0 = recede ? 200 + R() * 80 : 270 + CAR_V * dur + R() * 120;
        const zs = recede ? cz + D0 : cz - D0;
        const sim = simulate(zs, CAR_V, dur, car.wb), bsim = simulate(zs - BIKE_GAP, CAR_V, dur, bike.wb);
        const cy = groundY(cx, cz) + hc, dirz = recede ? 1 : -1;
        let sky = -1; for (let d = 30; d < 3200; d += 4) { const z = cz + dirz * d; sky = Math.max(sky, Math.atan((roadY(z) + .9 - cy) / d)); }
        const pitch = sky - vf / 2 + (0.035 + R() * .04) * vf;
        let ok = true, vis = 0;
        for (let t = 0; t <= dur; t += .1) { const s = sim.sample(t), D = Math.abs(s.z - cz), a = Math.atan((s.y + .75 - cy) / D);
          if (a < pitch - vf / 2 + .14 * vf || a > pitch + vf / 2 - .2 * vf) { ok = false; break; }
          let hid = false; for (let d = 20; d < D - 5; d += 3) { const z = cz + dirz * d; if (Math.atan((roadY(z) - cy) / d) > Math.atan((s.y + .5 - cy) / D)) { hid = true; break; } }
          if (!hid) vis++; }
        const nT = Math.floor(dur / .1) + 1;
        if (ok && vis > nT * .45 && vis < nT * .9) best = { hfov, cx, cy, cz, pitch, sim, bsim, recede };
      }
      if (!best) throw new Error('A shot sem composição em ' + t0);
      Object.assign(sh, best, { near: 8, seed: R() * 100 });
    } else if (type === 'B') {
      let best = null;
      for (let tries = 0; tries < 300 && !best; tries++) {
        const zs = -560 + R() * 1000, sim = simulate(zs, CAR_V, dur, car.wb), e = firstEvent(sim, 'off', .25, dur * .55);
        if (!e) continue;
        const side = R() < .65 ? -1 : 1, cz = e.z + 10 + R() * 7, cx = side * (4.7 + R() * .6);
        best = { sim, bsim: simulate(zs - BIKE_GAP, CAR_V, dur, bike.wb), cx, cz, cy: groundY(cx, cz) + .32 + R() * .2, hfov: 24 + R() * 6 };
      }
      if (best) Object.assign(sh, best, { near: .1 }); else sh.type = 'C';
    }
    if (sh.type === 'C') {
      const variant = ['side', 'rear', 'bike'][cCount++ % 3];
      let best = null;
      for (let tries = 0; tries < 300 && !best; tries++) {
        const zs = -520 + R() * 1000, sim = simulate(zs, CAR_V, dur, car.wb), bsim = simulate(zs - BIKE_GAP, CAR_V, dur, bike.wb);
        const e = firstEvent(sim, 'off', .15, dur - .5); if (!e && tries < 250) continue;
        best = { sim, bsim, variant, hfov: variant === 'bike' ? 30 : 30 + R() * 4 };
      }
      Object.assign(sh, best, { near: .12 });
    }
    shots.push(sh);
  }
}
window.shots = shots;
buildBushes(shots.filter(s => s.type === 'B').map(s => [s.cx, s.cz]));

// ---------- câmera ----------
const cam = new THREE.PerspectiveCamera(30, ASP, .1, 50000);
const tmpV = new THREE.Vector3(), tmpU = new THREE.Vector3();
function jitter(t, s, amp) { return amp * (Math.sin(t * 13.1 + s) * .5 + Math.sin(t * 21.7 + s * 2) * .3 + Math.sin(t * 7.3 + s * 3) * .4); }
function setCamera(sh, tl) {
  cam.up.set(0, 1, 0);
  cam.fov = vfovOf(sh.hfov); cam.near = sh.near; cam.updateProjectionMatrix();
  const cs = sh.sim.sample(tl);
  if (sh.type === 'A') {
    cam.position.set(sh.cx, sh.cy, sh.cz);
    const D = Math.abs(cs.z - sh.cz), yaw = Math.atan2(CAR_X + (bikeX(tl) - CAR_X) * .35 - sh.cx, (cs.z - BIKE_GAP * .3 * (sh.recede ? -1 : 1)) - sh.cz);
    const p = sh.pitch + jitter(tl, sh.seed, .00012), y = yaw + jitter(tl, sh.seed + 5, .00015);
    cam.lookAt(sh.cx + Math.sin(y) * Math.cos(p) * 100, sh.cy + Math.sin(p) * 100, sh.cz + Math.cos(y) * Math.cos(p) * 100);
    void D;
  } else if (sh.type === 'B') {
    cam.position.set(sh.cx, sh.cy, sh.cz);
    const s = sh.sim.sample(tl - .07);
    const ty = Math.max(s.y + .7, roadY(s.z) + .7);
    cam.lookAt(lerp(CAR_X, sh.cx, .1), ty + jitter(tl, 3, .02), s.z);
  } else {
    const V = sh.variant === 'bike' ? bike : car; V.root.updateMatrixWorld(true);
    let pos, look;
    if (sh.variant === 'side') { pos = new THREE.Vector3(1.12, 1.1, .3); look = new THREE.Vector3(.2, -3.6, 40); }
    else if (sh.variant === 'rear') { pos = new THREE.Vector3(.5, 1.0, -2.62); look = new THREE.Vector3(1.4, -2.2, -40); }
    else { pos = new THREE.Vector3(.32, 1.75, -1.25); look = new THREE.Vector3(-1.4, -0.4, 30); }
    cam.position.copy(V.body.localToWorld(pos)); tmpV.copy(V.body.localToWorld(look));
    tmpU.set(0, 1, 0).applyQuaternion(V.root.quaternion); cam.up.copy(tmpU);
    tmpV.x += jitter(tl, 1, .012); tmpV.y += jitter(tl, 2, .015);
    cam.lookAt(tmpV);
  }
}

// ---------- pós-processamento: brilho do calor + miragem (crescem com a distância), granulação ±2% ----------
const post = new THREE.ShaderMaterial({
  uniforms: { tColor: { value: rt.texture }, tDepth: { value: depthTex }, near: { value: 1 }, far: { value: 50000 }, vfov: { value: .1 }, hfov: { value: .05 }, time: { value: 0 }, seed: { value: 0 }, exposure: { value: 1 } },
  vertexShader: `varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0., 1.); }`,
  fragmentShader: `
    uniform sampler2D tColor, tDepth; uniform float near, far, vfov, hfov, time, seed, exposure; varying vec2 vUv;
    float lin(float d){ float z = d*2.-1.; return 2.*near*far/(far+near-z*(far-near)); }
    float hash(vec2 p){ p = fract(p*vec2(123.34, 456.21)); p += dot(p, p+45.32); return fract(p.x*p.y); }
    vec3 neutral(vec3 c){ const float sc = 0.8 - 0.04, dc = 0.15; float x = min(c.r, min(c.g, c.b)); float off = x < 0.08 ? x - 6.25*x*x : 0.04; c -= off;
      float pk = max(c.r, max(c.g, c.b)); if (pk < sc) return c; float d = 1. - sc; float np = 1. - d*d/(pk + d - sc); c *= np/pk; float g = 1. - 1./(dc*(pk-np)+1.); return mix(c, vec3(np), g); }
    vec3 toSRGB(vec3 c){ return mix(c*12.92, 1.055*pow(c, vec3(1./2.4)) - .055, step(.0031308, c)); }
    void main(){
      vec2 uv = vUv; float rd = texture2D(tDepth, uv).x; float isSky = step(.999999, rd); float d = mix(lin(rd), 1e5, isSky);
      vec2 ang = vec2((uv.x-.5)*hfov, (uv.y-.5)*vfov);
      float amp = (1.-isSky) * .00034 * smoothstep(35., 1500., d);
      float n = sin(ang.y*1150. - time*7.3 + sin(ang.x*430. + time*1.7)*1.8)*.5 + sin(ang.y*2650. + ang.x*720. - time*13.)*.28 + sin(ang.y*520. + ang.x*160. - time*3.1)*.4;
      vec2 suv = uv + vec2(.35*n*amp/hfov, n*amp/vfov);
      vec3 c = texture2D(tColor, suv).rgb;
      // miragem: superfície distante vista quase rasante reflete o que está logo acima
      float pa = vfov/1280.;
      float dU = lin(texture2D(tDepth, uv + vec2(0., 1./1280.)).x), dD = lin(texture2D(tDepth, uv - vec2(0., 1./1280.)).x);
      float dd = min(abs(dU-d), abs(d-dD)) + 1e-3; float graz = d*pa/dd;
      float mir = (1.-isSky) * smoothstep(260., 950., d) * (1. - smoothstep(.0035, .011, graz));
      float wob = sin(ang.x*900. + time*5.) * .5 + sin(ang.x*2300. - time*9.) * .3;
      vec3 rc = texture2D(tColor, suv + vec2(0., (.0016 + .0008*wob)/vfov + (.011-graz)*.12/vfov*pa*1280.*.02)).rgb;
      c = mix(c, rc*1.03 + vec3(.01,.015,.025), mir*.8);
      c *= exposure;
      c = neutral(c);
      float l = dot(c, vec3(.2126,.7152,.0722)); c = mix(vec3(l), c, .9);          // desbotado
      c = c*.94 + .028;
      vec2 q = uv - .5; c *= 1. - dot(q,q)*.18;
      c = toSRGB(clamp(c, 0., 1.));
      c *= 1. + (hash(uv*vec2(1280.,720.) + seed) - .5)*.04;                    // granulação ±2%
      gl_FragColor = vec4(c, 1.);
    }`
});
const postScene = new THREE.Scene(), postCam = new THREE.Camera();
{ const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute([-1, -1, 0, 3, -1, 0, -1, 3, 0], 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute([0, 0, 2, 0, 0, 2], 2));
  const m = new THREE.Mesh(g, post); m.frustumCulled = false; postScene.add(m); }

// ---------- textos ----------
const tags = ['', 'CURIOSIDADE #1', 'CURIOSIDADE #2', 'CURIOSIDADE #3', 'DICA 1 · ÁGUA', 'DICA 2 · MULTIDÕES', 'DICA 3 · ABRIGO', 'DICA 4 · SILÊNCIO', 'DICA 5 · KIT', 'DICA 6 · GRUPO', ''];
const sceneStart = TL.map((s, i) => i === 0 ? 0 : s.start - .3);
const capEl = document.getElementById('cap'), tagEl = document.getElementById('tag'), bigEl = document.getElementById('big'), fadeEl = document.getElementById('fade'), titleEl = document.getElementById('title'), barEl = document.querySelector('#bar i');
const chunks = [];
TL.forEach(s => {
  const words = s.text.split(/\s+/); const tot = words.reduce((a, w) => a + w.length + 2, 0);
  let t = s.start; const dur = s.end - s.start; const wt = words.map(w => { const d = dur * (w.length + 2) / tot; const o = { w, a: t, b: t + d }; t += d; return o; });
  let cur = [];
  wt.forEach((o, i) => { cur.push(o); const L = cur.reduce((a, x) => a + x.w.length, 0); if (cur.length >= 3 || L > 13 || /[.,?:!]$/.test(o.w) || i === wt.length - 1) { chunks.push(cur); cur = []; } });
});
const bigs = { 3: ['POUCOS DIAS', 'PARA AS CIDADES CAÍREM'], 4: ['3 DIAS', 'SEM ÁGUA'] };
let lastCap = '';
function overlays(t) {
  let si = 0; for (let i = 0; i < sceneStart.length; i++) if (t >= sceneStart[i]) si = i;
  const t0 = sceneStart[si];
  fadeEl.style.opacity = t < .7 ? (1 - smooth(0, .7, t)).toFixed(3) : t > TOTAL - 1.3 ? smooth(TOTAL - 1.3, TOTAL, t).toFixed(3) : '0';
  const tg = tags[si]; const tgH = tg ? `<div>${tg}</div>` : ''; if (tagEl.innerHTML !== tgH) tagEl.innerHTML = tgH;
  tagEl.style.opacity = smooth(t0 + .2, t0 + .6, t);
  const bg = bigs[si]; const bH = bg && t > t0 + 2.2 ? `<div class="l1">${bg[0]}</div><div class="l2">${bg[1]}</div>` : '';
  if (bigEl.innerHTML !== bH) bigEl.innerHTML = bH;
  bigEl.style.opacity = bg ? smooth(t0 + 2.2, t0 + 2.7, t) : 0; bigEl.style.transform = `scale(${lerp(.92, 1, smooth(t0 + 2.2, t0 + 2.7, t))})`;
  let title = '';
  if (t < 4.2) title = 'E SE HOUVESSE UM<br><em>APOCALIPSE<br>ZUMBI?</em>';
  if (t > TL[10].end - .2) title = 'ESTAR PREPARADO<br>NUNCA É<br><em>EXAGERO</em>';
  if (titleEl.innerHTML !== title) titleEl.innerHTML = title;
  titleEl.style.opacity = t < 4.2 ? smooth(.3, .9, t) * (1 - smooth(3.7, 4.2, t)) : smooth(TL[10].end - .2, TL[10].end + .4, t);
  let c = null; for (const ch of chunks) if (t >= ch[0].a - .05 && t <= ch[ch.length - 1].b + .25) c = ch;
  const html = c ? c.map(o => `<span class="${t >= o.a && t < o.b + .05 ? 'on' : ''}">${o.w}</span>`).join(' ') : '';
  if (html !== lastCap) { capEl.innerHTML = html; lastCap = html; }
  barEl.style.width = (t / TOTAL * 100).toFixed(2) + '%';
}

// ---------- render ----------
window.renderAt = function (t) {
  let sh = shots[0]; for (const s of shots) if (t >= s.t0) sh = s;
  const tl = t - sh.t0;
  const cs = sh.sim.sample(tl), bs = sh.bsim.sample(tl);
  placeVehicle(car, cs, CAR_X, t); placeVehicle(bike, bs, bikeX(tl), t);
  animZombies(tl);
  setCamera(sh, tl);
  // poeira
  const parts = [...dustParticles(sh.sim, CAR_X, tl, 1), ...dustParticles(sh.bsim, bikeX(tl), tl, .55)];
  for (let i = 0; i < dustPool.length; i++) { const s = dustPool[i], p = parts[i];
    if (!p || p[4] < .003) { s.visible = false; continue; } s.visible = true; s.position.set(p[0], p[1], p[2]); s.scale.setScalar(p[3]); s.material.opacity = p[4] * smooth(2 + p[3] * .6, 6 + p[3] * 1.2, s.position.distanceTo(cam.position)); s.material.rotation = i * 1.7; }
  // sombra nítida focada no veículo
  const roi = sh.type === 'A' ? 32 : 26, cz = cs.z - BIKE_GAP * .45;
  sun.target.position.set(-1, roadY(cz), cz); sun.position.copy(sun.target.position).addScaledVector(SUN, 400);
  const sc = sun.shadow.camera; sc.left = sc.bottom = -roi; sc.right = sc.top = roi; sc.near = 300; sc.far = 500; sc.updateProjectionMatrix();
  renderer.setRenderTarget(rt); renderer.render(scene, cam);
  post.uniforms.near.value = cam.near; post.uniforms.far.value = cam.far;
  post.uniforms.vfov.value = cam.fov * DEG; post.uniforms.hfov.value = sh.hfov * DEG;
  post.uniforms.time.value = t; post.uniforms.seed.value = (t * 37.17) % 97; post.uniforms.exposure.value = 1.0;
  renderer.setRenderTarget(null); renderer.render(postScene, postCam);
  overlays(t);
  return sh.type;
};
window.ready = true;

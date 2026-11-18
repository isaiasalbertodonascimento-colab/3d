// Biblioteca de peças para o visual "massinha 3D" (clay): materiais, estúdio,
// personagem, órgãos/tubos, cortes anatômicos e partículas. Reutilize nas cenas.
import * as THREE from 'three';

// ---------- matemática ----------
export function mulberry(seed) { return () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
export const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
export const smooth = (a, b, x) => { const t = clamp((x - a) / (b - a)); return t * t * (3 - 2 * t); };
export const lerp = (a, b, t) => a + (b - a) * t;
export const ease = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
export const V = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);

// ---------- materiais ----------
// Massinha fosca com brilho aveludado nas bordas (sheen) e um verniz leve.
export function clay(color, o = {}) {
  const c = new THREE.Color(color);
  return new THREE.MeshPhysicalMaterial({
    color: c, roughness: o.rough ?? 0.55, metalness: 0,
    sheen: o.sheen ?? 0.7, sheenRoughness: 0.5, sheenColor: c.clone().lerp(new THREE.Color(0xffffff), 0.45),
    clearcoat: o.coat ?? 0.15, clearcoatRoughness: 0.4,
    emissive: o.emissive ?? 0x000000, emissiveIntensity: o.emissiveIntensity ?? 1,
    side: o.side ?? THREE.FrontSide, transparent: o.opacity != null, opacity: o.opacity ?? 1,
    clippingPlanes: o.clip ?? null, clipShadows: !!o.clip,
  });
}
// Tecido úmido e brilhante (órgãos, mucosa, líquidos).
export function wet(color, o = {}) {
  return clay(color, { rough: 0.28, sheen: 0.3, coat: 1.0, ...o });
}
// Material que brilha sozinho (ácido, sinais elétricos, destaques). Ativa o bloom.
// o: { clip, opacity }
export function glow(color, intensity = 2, o = {}) {
  return new THREE.MeshBasicMaterial({ color: new THREE.Color(color).multiplyScalar(intensity), toneMapped: false,
    clippingPlanes: o.clip ?? null, transparent: o.opacity != null, opacity: o.opacity ?? 1, side: o.side ?? THREE.FrontSide });
}

// ---------- estúdio ----------
function gradientTex(top, bottom) {
  const c = document.createElement('canvas'); c.width = 4; c.height = 256;
  const g = c.getContext('2d'); const gr = g.createLinearGradient(0, 0, 0, 256);
  gr.addColorStop(0, top); gr.addColorStop(1, bottom); g.fillStyle = gr; g.fillRect(0, 0, 4, 256);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}
// Fundo em degradê, luz principal com sombra suave, contraluz colorida e preenchimento.
// Devolve { scene, key, rim, floor }.
export function studio(ctx, o = {}) {
  const scene = new THREE.Scene();
  scene.background = gradientTex(o.top ?? '#2a3550', o.bottom ?? '#0b0f1a');
  scene.environment = ctx.env;
  scene.environmentIntensity = o.envI ?? 0.5;
  if (o.fog) scene.fog = new THREE.Fog(o.fog, o.fogNear ?? 8, o.fogFar ?? 30);
  scene.add(new THREE.HemisphereLight(o.sky ?? 0xbfd4ff, o.ground ?? 0x3a2a20, o.hemi ?? 0.6));
  const key = new THREE.DirectionalLight(o.keyColor ?? 0xfff1dc, o.keyI ?? 2.6);
  key.position.set(...(o.keyPos ?? [3, 6, 4])); key.castShadow = true;
  key.shadow.mapSize.set(1024, 1024); key.shadow.bias = -0.0004; key.shadow.radius = 4;
  const s = o.shadowSize ?? 4; Object.assign(key.shadow.camera, { left: -s, right: s, top: s, bottom: -s, near: 0.1, far: 40 });
  scene.add(key);
  const rim = new THREE.DirectionalLight(o.rimColor ?? 0x6fb6ff, o.rimI ?? 2.2);
  rim.position.set(...(o.rimPos ?? [-4, 3, -4])); scene.add(rim);
  const fill = new THREE.PointLight(o.fillColor ?? 0xffc9a8, o.fillI ?? 6, 0, 2);
  fill.position.set(...(o.fillPos ?? [-3, 1.5, 3])); scene.add(fill);
  let floor = null;
  if (o.floor !== false) {
    floor = new THREE.Mesh(new THREE.CircleGeometry(o.floorR ?? 12, 48), clay(o.floorColor ?? 0x3b4766, { sheen: 0.2, coat: 0 }));
    floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; scene.add(floor);
  }
  return { scene, key, rim, fill, floor };
}

// ---------- formas ----------
const shadowy = m => { m.castShadow = true; m.receiveShadow = true; return m; };
export function sphere(r, mat, seg = 32) { return shadowy(new THREE.Mesh(new THREE.SphereGeometry(r, seg, Math.round(seg * 0.75)), mat)); }
export function capsule(r, len, mat) { return shadowy(new THREE.Mesh(new THREE.CapsuleGeometry(r, len, 6, 16), mat)); }

// Bolha orgânica: esfera com ondulações (chiclete, órgão, célula, pedra...).
export function blob(r, mat, o = {}) {
  const geo = new THREE.SphereGeometry(r, o.seg ?? 48, o.seg ? Math.round(o.seg * .75) : 36);
  const p = geo.attributes.position, v = new THREE.Vector3(); const sd = o.seed ?? 1, n = o.noise ?? 0.12, f = o.freq ?? 3;
  for (let i = 0; i < p.count; i++) {
    v.fromBufferAttribute(p, i); const u = v.clone().normalize();
    const d = Math.sin(u.x * f + sd) * Math.sin(u.y * f * 1.3 + sd * 2) * Math.sin(u.z * f * .9 + sd * 3) + 0.5 * Math.sin(u.x * f * 2.1 + u.z * f * 1.7 + sd);
    v.multiplyScalar(1 + n * d); if (o.stretch) v.multiply(o.stretch); p.setXYZ(i, v.x, v.y, v.z);
  }
  geo.computeVertexNormals();
  return shadowy(new THREE.Mesh(geo, mat));
}

// Tubo ao longo de pontos (esôfago, intestino, veia, fio, nervo).
// radius pode ser número ou função (u de 0 a 1) => raio.
export function tube(points, radius, mat, o = {}) {
  const curve = new THREE.CatmullRomCurve3(points.map(p => Array.isArray(p) ? V(...p) : p));
  const segs = o.segments ?? 160, radial = o.radial ?? 24;
  const geo = new THREE.TubeGeometry(curve, segs, typeof radius === 'number' ? radius : 1, radial, false);
  if (typeof radius === 'function') {
    const p = geo.attributes.position, c = new THREE.Vector3(), v = new THREE.Vector3();
    for (let i = 0; i <= segs; i++) {
      const u = i / segs; curve.getPointAt(u, c); const r = radius(u);
      for (let j = 0; j <= radial; j++) { const k = i * (radial + 1) + j; v.fromBufferAttribute(p, k).sub(c).multiplyScalar(r).add(c); p.setXYZ(k, v.x, v.y, v.z); }
    }
    geo.computeVertexNormals();
  }
  const m = shadowy(new THREE.Mesh(geo, mat)); m.userData.curve = curve; return m;
}

// Corte anatômico: devolve um plano de corte para passar em clay({clip:[plano], side: DoubleSide}).
// normal aponta para o lado que FICA visível. Ex.: cut(V(0,0,-1)) remove a metade da frente (z>0).
export function cut(normal = V(0, 0, -1), offset = 0) { return new THREE.Plane(normal.clone().normalize(), offset); }

// ---------- personagem de massinha ----------
// Criança estilizada: cabeça grande, olhos brilhantes, boca que abre. Altura ~1.6.
// Partes em .userData: head, jaw, eyes, lids, armL, armR, torso, neck.
export function kid(o = {}) {
  const skin = clay(o.skin ?? 0xf2b38f), shirt = clay(o.shirt ?? 0x2f7de1), pants = clay(o.pants ?? 0x2b2f45),
    hairM = clay(o.hair ?? 0x5a3420, { sheen: 0.9 }), white = clay(0xffffff, { coat: 1, rough: .2 }), dark = clay(0x161018, { coat: 1, rough: .15 });
  const g = new THREE.Group();
  const torso = new THREE.Group(); torso.position.y = 0.72; g.add(torso);
  const body = capsule(0.25, 0.32, shirt); body.position.y = 0.2; body.scale.set(1, 1, 0.8); torso.add(body);
  for (const s of [-1, 1]) {
    const leg = capsule(0.1, 0.36, pants); leg.position.set(s * 0.12, -0.32, 0); g.add(leg); leg.position.y = 0.38;
    const shoe = sphere(0.12, clay(0xf4f4f4)); shoe.scale.set(1, 0.55, 1.5); shoe.position.set(s * 0.12, 0.06, 0.05); g.add(shoe);
  }
  const arms = {};
  for (const s of [-1, 1]) {
    const sh = new THREE.Group(); sh.position.set(s * 0.3, 0.38, 0); torso.add(sh);
    const a = capsule(0.075, 0.3, shirt); a.position.y = -0.2; sh.add(a);
    const hand = sphere(0.085, skin, 20); hand.position.y = -0.42; sh.add(hand);
    sh.rotation.z = s * 0.25; arms[s] = sh;
  }
  const neck = new THREE.Group(); neck.position.y = 0.55; torso.add(neck);
  const nk = capsule(0.08, 0.08, skin); nk.position.y = 0.04; neck.add(nk);
  const head = new THREE.Group(); head.position.y = 0.38; neck.add(head);
  const skull = sphere(0.36, skin, 48); skull.scale.set(1, 1.02, 0.95); head.add(skull);
  const hair = blob(0.37, hairM, { seed: 4, noise: 0.06, freq: 9 }); hair.scale.set(1.04, 0.62, 1.0); hair.position.set(0, 0.17, -0.04); head.add(hair);
  const eyes = [], lids = [];
  for (const s of [-1, 1]) {
    const e = sphere(0.085, white, 24); e.position.set(s * 0.13, 0.03, 0.3); e.scale.z = 0.6; head.add(e);
    const pu = sphere(0.045, dark, 16); pu.position.set(s * 0.13, 0.03, 0.355); head.add(pu); eyes.push(pu);
    const hl = sphere(0.013, glow(0xffffff, 1), 8); hl.position.set(s * 0.13 + 0.015, 0.05, 0.395); head.add(hl);
    const lid = sphere(0.09, skin, 24); lid.position.copy(e.position); lid.scale.set(1.02, 0.02, 0.66); head.add(lid); lids.push(lid);
    const ear = sphere(0.08, skin, 16); ear.position.set(s * 0.35, 0.0, 0); ear.scale.set(0.5, 1, 0.8); head.add(ear);
    const cheek = sphere(0.06, clay(0xff8f8f, { opacity: 0.45 }), 16); cheek.position.set(s * 0.2, -0.1, 0.28); cheek.scale.z = 0.4; head.add(cheek);
  }
  const nose = sphere(0.045, skin, 16); nose.position.set(0, -0.05, 0.36); head.add(nose);
  const jaw = new THREE.Group(); jaw.position.set(0, -0.17, 0.27); head.add(jaw);
  const mouth = sphere(0.075, clay(0x5a1622, { coat: 1, rough: .3 }), 24); mouth.scale.set(1.2, 0.15, 0.4); jaw.add(mouth);
  g.userData = { head, jaw: mouth, eyes, lids, arms, torso, neck };
  return g;
}
// Pose do personagem a cada frame. o: { talk, open (0..1 boca), blink, lookX, lookY, swallow (0..1), happy, armUp (-1..1 por braço) }
export function posekid(k, t, o = {}) {
  const u = k.userData;
  u.torso.position.y = 0.72 + Math.sin(t * 2.2) * 0.008;
  u.head.rotation.z = Math.sin(t * 1.3) * 0.04 + (o.tilt ?? 0);
  u.head.rotation.x = (o.nod ?? 0) - (o.swallow ?? 0) * 0.25;
  u.head.rotation.y = o.turn ?? 0;
  const open = clamp((o.open ?? 0) + (o.talk ? 0.35 * Math.max(0, Math.sin(t * 17)) : 0));
  u.jaw.scale.y = 0.15 + open * 0.75;
  const bl = o.blink === false ? 0 : (Math.sin(t * 2.7) > 0.985 ? 1 : 0);
  const shock = o.shock ?? 0;
  u.lids.forEach(l => { l.scale.y = 0.02 + bl * 0.9; });
  u.eyes.forEach((e, i) => { e.position.x = (i ? 1 : -1) * 0.13 + (o.lookX ?? 0) * 0.03; e.position.y = 0.03 + (o.lookY ?? 0) * 0.03; e.scale.setScalar(1 - shock * 0.45); });
  u.arms[-1].rotation.z = -0.25 - (o.armL ?? 0) * 2.2; u.arms[1].rotation.z = 0.25 + (o.armR ?? 0) * 2.2;
  u.neck.scale.set(1 + (o.swallow ?? 0) * 0.15, 1, 1 + (o.swallow ?? 0) * 0.15);
}

// ---------- partículas ----------
// Bolinhas flutuando (poeira de estúdio, bolhas, esporos, enzimas). Devolve { points, update(t) }.
export function particles(n, box, o = {}) {
  const rng = mulberry(o.seed ?? 3), pos = new Float32Array(n * 3), base = [];
  for (let i = 0; i < n; i++) base.push([box[0] + rng() * box[3], box[1] + rng() * box[4], box[2] + rng() * box[5], rng() * 10]);
  const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const c = document.createElement('canvas'); c.width = c.height = 64; const g = c.getContext('2d');
  const gr = g.createRadialGradient(32, 32, 0, 32, 32, 32); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, 64, 64);
  const mat = new THREE.PointsMaterial({ color: o.color ?? 0xffffff, size: o.size ?? 0.05, map: new THREE.CanvasTexture(c), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: o.opacity ?? 0.7 });
  const points = new THREE.Points(geo, mat);
  const rise = o.rise ?? 0.05;
  return {
    points, update(t) {
      base.forEach((b, i) => { pos[i * 3] = b[0] + Math.sin(t * 0.6 + b[3]) * 0.05; pos[i * 3 + 1] = box[1] + ((b[1] - box[1] + t * rise) % box[4]); pos[i * 3 + 2] = b[2] + Math.cos(t * 0.5 + b[3]) * 0.05; });
      geo.attributes.position.needsUpdate = true;
    }
  };
}

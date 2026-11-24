// Rua de bairro brasileiro ao pôr do sol (texturas procedurais).
import * as THREE from './lib/three.module.js';

let seed = 7; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
const R = (a, b) => a + (b - a) * rnd();

function hash(x, y) { let h = (x * 374761393 + y * 668265263) | 0; h = (h ^ (h >> 13)) * 1274126177 | 0; return ((h ^ (h >> 16)) >>> 0) / 4294967295; }
function vnoise(x, y, P) {
  const xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi, u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf);
  const a = hash(xi % P, yi % P), b = hash((xi + 1) % P, yi % P), c = hash(xi % P, (yi + 1) % P), d = hash((xi + 1) % P, (yi + 1) % P);
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
}
function fbm(x, y, P, o = 5) { let s = 0, a = .5, f = 1; for (let i = 0; i < o; i++) { s += a * vnoise(x * f, y * f, P * f); a *= .5; f *= 2; } return s; }

function canvasTex(size, fn, rep = 1, srgb = true) {
  const c = document.createElement('canvas'); c.width = c.height = size; const x = c.getContext('2d');
  const im = x.createImageData(size, size);
  for (let j = 0; j < size; j++) for (let i = 0; i < size; i++) { const o = fn(i / size, j / size); const k = (j * size + i) * 4; im.data[k] = o[0]; im.data[k + 1] = o[1]; im.data[k + 2] = o[2]; im.data[k + 3] = o[3] ?? 255; }
  x.putImageData(im, 0, 0);
  const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rep, rep); t.anisotropy = 8;
  if (srgb) t.colorSpace = THREE.SRGBColorSpace; return { t, c, x };
}

export function buildWorld(scene) {
  const W = { animated: [] };
  // ---------- texturas
  const concrete = canvasTex(512, (u, v) => {
    const n = fbm(u * 8, v * 8, 8), s = hash(Math.floor(u * 512), Math.floor(v * 512));
    const groove = Math.min(u, 1 - u, v, 1 - v) < .006 ? .55 : 1;
    const st = fbm(u * 3 + 9, v * 3, 3, 3);
    let g = (150 + n * 60 + s * 25 - (st > .62 ? 30 : 0)) * groove;
    return [g * 1.02, g * .98, g * .92];
  });
  const concreteB = canvasTex(512, (u, v) => { const n = fbm(u * 8, v * 8, 8), s = hash(Math.floor(u * 512), Math.floor(v * 512)); const groove = Math.min(u, 1 - u, v, 1 - v) < .006 ? 40 : 180; const g = Math.min(groove, 120 + n * 80 + s * 50); return [g, g, g]; }, 1, false);
  const asphalt = canvasTex(512, (u, v) => { const n = fbm(u * 16, v * 16, 16), s = hash(Math.floor(u * 512), Math.floor(v * 512)); const g = 48 + n * 30 + (s > .93 ? 40 : 0) - (fbm(u * 2, v * 2, 2, 3) > .6 ? 10 : 0); return [g, g * .98, g * .95]; });
  const plaster = canvasTex(512, (u, v) => { const n = fbm(u * 12, v * 12, 12), d = fbm(u * 30, v * 2, 30, 4); const s = hash(Math.floor(u * 512), Math.floor(v * 512)); const drip = Math.max(0, d - .55) * 2.5 * (1 - v) * 0; const g = 205 + n * 45 + s * 18 - Math.max(0, fbm(u * 6, v * 1.5 + 4, 6, 4) - .55) * 260 * Math.pow(v, 2) - drip; return [g, g, g]; });
  const tiles = canvasTex(256, (u, v) => { const row = (v * 8) % 1, col = (u * 6 + (Math.floor(v * 8) % 2) * .5) % 1; const sh = .55 + .45 * Math.sin(col * Math.PI) * (1 - row * .5); const n = fbm(u * 10, v * 10, 10, 3); const r = (150 + n * 50) * sh; return [r * 1.25, r * .6, r * .42]; });
  const bark = canvasTex(256, (u, v) => { const n = fbm(u * 12, v * 3, 12), g = 70 + n * 70; return [g * 1.05, g * .9, g * .75]; });
  const dirt = canvasTex(256, (u, v) => { const n = fbm(u * 10, v * 10, 10); const g = 70 + n * 60; return [g * 1.2, g * .9, g * .65]; });
  const leafT = (() => { const c = document.createElement('canvas'); c.width = c.height = 256; const x = c.getContext('2d');
    for (let i = 0; i < 70; i++) { const a = rnd() * 6.28, r = rnd() * 95, px = 128 + Math.cos(a) * r, py = 128 + Math.sin(a) * r, l = R(16, 30);
      x.save(); x.translate(px, py); x.rotate(rnd() * 6.28); const g = R(.65, 1.2); x.fillStyle = `rgb(${70 * g | 0},${115 * g | 0},${38 * g | 0})`;
      x.beginPath(); x.ellipse(0, 0, l, l * .38, 0, 0, 7); x.fill(); x.strokeStyle = 'rgba(30,50,15,.5)'; x.lineWidth = 1; x.beginPath(); x.moveTo(-l, 0); x.lineTo(l, 0); x.stroke(); x.restore(); }
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t; })();

  // ---------- céu
  const sunDir = new THREE.Vector3(-1, .1, .32).normalize(); W.sunDir = sunDir;
  const skyMat = new THREE.ShaderMaterial({
    side: THREE.BackSide, depthWrite: false, fog: false,
    uniforms: { uSun: { value: sunDir }, uT: { value: 0 } },
    vertexShader: 'varying vec3 vD; void main(){ vD = normalize(position); vec4 p = modelViewMatrix*vec4(position,1.); gl_Position = projectionMatrix*p; gl_Position.z = gl_Position.w; }',
    fragmentShader: `varying vec3 vD; uniform vec3 uSun; uniform float uT;
float h(vec2 p){ return fract(sin(dot(p, vec2(127.1,311.7)))*43758.5453); }
float n(vec2 p){ vec2 i=floor(p), f=fract(p); f=f*f*(3.-2.*f); return mix(mix(h(i),h(i+vec2(1,0)),f.x), mix(h(i+vec2(0,1)),h(i+vec2(1,1)),f.x), f.y); }
float fb(vec2 p){ float s=0., a=.5; for(int i=0;i<6;i++){ s+=a*n(p); p*=2.03; a*=.5; } return s; }
void main(){
  vec3 d = normalize(vD); float y = d.y; float s = max(dot(d,uSun),0.);
  vec3 zen = vec3(.13,.24,.52), mid = vec3(.55,.55,.72), hor = vec3(1.25,.62,.32);
  vec3 c = mix(hor, mid, smoothstep(.0,.18,y)); c = mix(c, zen, smoothstep(.15,.7,y));
  c += vec3(1.3,.55,.2) * pow(s, 6.) * .9 * (1.-smoothstep(0.,.5,y));
  c += vec3(1.,.7,.4) * pow(s, 60.) * 1.5;
  c += vec3(30.,22.,12.) * smoothstep(.9993,.9997,s);
  if (y > 0.) { vec2 uv = d.xz/(y+.12)*1.2 + vec2(uT*.01,0.);
    float cl = smoothstep(.5,.85, fb(uv*1.3)) * smoothstep(.0,.12,y);
    vec3 cc = mix(vec3(1.3,.55,.38), vec3(.55,.42,.55), smoothstep(.05,.4,y)); cc += vec3(1.,.5,.2)*pow(s,4.)*1.2;
    c = mix(c, cc, cl*.85); }
  if (y < 0.) c = mix(hor*.6, vec3(.25,.2,.2), smoothstep(0.,-.2,y));
  gl_FragColor = vec4(c, 1.);
}` });
  const sky = new THREE.Mesh(new THREE.SphereGeometry(900, 48, 24), skyMat); sky.frustumCulled = false; scene.add(sky); W.sky = sky;

  // ---------- luzes
  const sun = new THREE.DirectionalLight('#ffbe85', 4.2); sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048); const sc = sun.shadow.camera; sc.left = sc.bottom = -6; sc.right = sc.top = 6; sc.near = 1; sc.far = 80; sun.shadow.bias = -.0004; sun.shadow.normalBias = .02; sun.shadow.radius = 3;
  scene.add(sun, sun.target); W.sun = sun;
  W.aimSun = (x, y, z, size = 6) => { sun.target.position.set(x, y, z); sun.position.set(x + sunDir.x * 40, y + sunDir.y * 40 + 2, z + sunDir.z * 40); sc.left = sc.bottom = -size; sc.right = sc.top = size; sc.updateProjectionMatrix(); };
  const hemi = new THREE.HemisphereLight('#a7bde0', '#7a5e46', .9); scene.add(hemi);
  scene.fog = new THREE.FogExp2('#d79a74', .012);

  const std = (o) => new THREE.MeshStandardMaterial(Object.assign({ roughness: .9 }, o));
  const add = (geo, mat, x, y, z, cast = true, rec = true) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.castShadow = cast; m.receiveShadow = rec; scene.add(m); return m; };
  const box = (w, h, d) => new THREE.BoxGeometry(w, h, d);
  const tex = (T, rx, ry) => { const t = T.t.clone(); t.needsUpdate = true; t.repeat.set(rx, ry); return t; };

  // ---------- chão
  const X0 = -160, X1 = 90, LX = X1 - X0, MX = (X0 + X1) / 2;
  add(box(LX, .12, 2.8), std({ map: tex(concrete, LX / 1.2, 2.8 / 1.2), bumpMap: tex(concreteB, LX / 1.2, 2.8 / 1.2), bumpScale: 1.2, roughness: .88 }), MX, .06, -.4);
  add(box(LX, .14, .14), std({ color: '#b8b2a6', roughness: .8 }), MX, .07, 1.0);
  add(box(LX, .02, 7), std({ map: tex(asphalt, LX / 3, 7 / 3), roughness: .95 }), MX, -.01, 4.5);
  for (let x = X0; x < X1; x += 6) add(box(3, .005, .12), std({ color: '#d9b53c', roughness: .8 }), x, .002, 4.5, false);
  add(box(LX, .12, 2.5), std({ map: tex(concrete, LX / 1.2, 2.5 / 1.2), roughness: .9 }), MX, .06, 9.25);
  add(box(LX, .14, .14), std({ color: '#b8b2a6' }), MX, .07, 8.0);
  add(new THREE.PlaneGeometry(2000, 2000).rotateX(-Math.PI / 2), std({ color: '#5a4a3a' }), 0, -.03, 0, false);

  // canteiro de grama
  const gx0 = 10, gx1 = 24, gz0 = .12, gz1 = .9;
  add(box(gx1 - gx0, .02, gz1 - gz0), std({ map: tex(dirt, 8, 1) }), (gx0 + gx1) / 2, .125, (gz0 + gz1) / 2, false);
  const blade = new THREE.BufferGeometry(); blade.setAttribute('position', new THREE.Float32BufferAttribute([-.008, 0, 0, .008, 0, 0, 0, 1, 0], 3)); blade.computeVertexNormals();
  const NB = 26000, grass = new THREE.InstancedMesh(blade, std({ color: '#ffffff', side: THREE.DoubleSide, roughness: .75 }), NB);
  const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler(), col = new THREE.Color();
  for (let i = 0; i < NB; i++) {
    const h = R(.05, .14); e.set(R(-.35, .35), R(0, 6.28), R(-.35, .35)); q.setFromEuler(e);
    m4.compose(new THREE.Vector3(R(gx0, gx1), .13, R(gz0, gz1)), q, new THREE.Vector3(R(.8, 1.6), h, 1)); grass.setMatrixAt(i, m4);
    col.setHSL(R(.17, .27), R(.35, .6), R(.2, .38)); grass.setColorAt(i, col);
  }
  grass.receiveShadow = true; scene.add(grass); W.grass = grass;
  // folhas secas na calçada
  const leafG = new THREE.PlaneGeometry(.06, .035).rotateX(-Math.PI / 2);
  const NL = 500, dry = new THREE.InstancedMesh(leafG, std({ color: '#ffffff', side: THREE.DoubleSide }), NL);
  for (let i = 0; i < NL; i++) { e.set(R(-.3, .3), R(0, 6.28), 0); q.setFromEuler(e); m4.compose(new THREE.Vector3(R(-30, 40), .125, R(-1.7, .9) * (rnd() < .5 ? 1 : 1)), q, new THREE.Vector3(1, 1, 1)); dry.setMatrixAt(i, m4); col.setHSL(R(.05, .12), R(.4, .7), R(.2, .4)); dry.setColorAt(i, col); }
  dry.receiveShadow = true; scene.add(dry);

  // ---------- casas e muros
  const pal = ['#ead8b0', '#d98c5f', '#f1ece0', '#a9c39f', '#e7c368', '#cfa5a0', '#9fb6c8', '#e9a8a0', '#d6d0c4'];
  const plMat = c => std({ color: c, map: tex(plaster, 2, 1), roughness: .92 });
  const roofMat = std({ map: tex(tiles, 4, 3), roughness: .8 });
  const glass = new THREE.MeshPhysicalMaterial({ color: '#1d2530', roughness: .08, metalness: .2, envMapIntensity: 1.5 });
  const frameM = std({ color: '#e8e4da', roughness: .6 });
  const metal = std({ color: '#2a2a2c', roughness: .45, metalness: .6 });
  function house(x0, x1, side) {
    const s = side, zf = s < 0 ? -1.8 : 10.5, w = x1 - x0, cx = (x0 + x1) / 2;
    const hw = (x0 <= 7 && x1 >= 7 && s < 0) ? 1.9 : R(1.7, 2.3);
    const c = pal[Math.floor(rnd() * pal.length)];
    const gw = Math.min(3, w * .35), gx = cx + R(-w * .2, w * .2);
    const wallM = plMat(c);
    const piece = (a, b) => { if (b - a < .05) return; add(box(b - a, hw, .16), wallM, (a + b) / 2, hw / 2, zf + s * .08); add(box(b - a, .08, .24), std({ color: '#cfc9bd' }), (a + b) / 2, hw + .04, zf + s * .08); };
    if (x0 <= 7 && x1 >= 7 && s < 0) piece(x0, x1); else {
      piece(x0, gx - gw / 2); piece(gx + gw / 2, x1);
      const gg = new THREE.Group(); scene.add(gg);
      for (let b = gx - gw / 2 + .06; b < gx + gw / 2; b += .11) add(new THREE.CylinderGeometry(.012, .012, hw - .1), metal, b, hw / 2, zf + s * .1);
      add(box(gw, .05, .04), metal, gx, .12, zf + s * .1); add(box(gw, .05, .04), metal, gx, hw - .12, zf + s * .1);
    }
    // casa
    const hz = zf + s * R(3, 5), hd = R(7, 9), hh = R(2.8, 3.3), hc = pal[Math.floor(rnd() * pal.length)];
    add(box(w - .6, hh, hd), plMat(hc), cx, hh / 2, hz + s * hd / 2);
    const roof = new THREE.Mesh(new THREE.CylinderGeometry(1, 1, w - .2, 3, 1, false), roofMat);
    roof.rotation.z = Math.PI / 2; roof.rotation.y = 0; roof.scale.set(1.1, 1, hd * .62); roof.position.set(cx, hh + .5, hz + s * hd / 2); roof.castShadow = roof.receiveShadow = true; scene.add(roof);
    // janelas na fachada
    for (let wx = x0 + 1.4; wx < x1 - 1; wx += R(2.4, 3.4)) {
      add(box(1.3, 1.1, .06), frameM, wx, 1.55, hz + s * -.01, false);
      add(box(1.15, .95, .07), glass, wx, 1.55, hz + s * -.02, false);
    }
    // vaso / planta no muro
    if (rnd() < .5) { const pg = new THREE.IcosahedronGeometry(R(.4, .7), 1); add(pg, std({ color: '#3f6a2a', roughness: .9 }), x0 + R(.6, w - .6), hw + .25, zf + s * .5); }
  }
  for (const s of [-1, 1]) { let x = -150; while (x < 85) { const w = R(8, 12); house(x, x + w, s); x += w; } }

  // ---------- árvores
  function tree(x, z, sc = 1, flowers = false) {
    const g = new THREE.Group(); g.position.set(x, 0, z); scene.add(g);
    const pts = [new THREE.Vector3(0, 0, 0), new THREE.Vector3(R(-.2, .2), 1.4 * sc, R(-.2, .2)), new THREE.Vector3(R(-.4, .4), 2.6 * sc, R(-.4, .4))];
    const trunk = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 12, .13 * sc, 10), std({ map: tex(bark, 1, 3) })); trunk.castShadow = trunk.receiveShadow = true; g.add(trunk);
    for (let i = 0; i < 5; i++) { const a = rnd() * 6.28, p0 = pts[2].clone(), p1 = p0.clone().add(new THREE.Vector3(Math.cos(a) * 1.2 * sc, R(.6, 1.2) * sc, Math.sin(a) * 1.2 * sc));
      const br = new THREE.Mesh(new THREE.TubeGeometry(new THREE.LineCurve3(p0, p1), 2, .06 * sc, 6), trunk.material); br.castShadow = true; g.add(br); }
    const NLf = 340, card = new THREE.PlaneGeometry(.8 * sc, .8 * sc);
    const lm = new THREE.InstancedMesh(card, std({ map: leafT, alphaTest: .5, side: THREE.DoubleSide, roughness: .8 }), NLf);
    for (let i = 0; i < NLf; i++) {
      const a = rnd() * 6.28, b = Math.acos(R(-.6, 1)), r = Math.pow(rnd(), .4) * 2.2 * sc;
      const p = new THREE.Vector3(Math.cos(a) * Math.sin(b) * r, 3.4 * sc + Math.cos(b) * r * .7, Math.sin(a) * Math.sin(b) * r);
      e.set(R(0, 6.28), R(0, 6.28), R(0, 6.28)); q.setFromEuler(e); m4.compose(p, q, new THREE.Vector3(1, 1, 1)); lm.setMatrixAt(i, m4);
      if (flowers && rnd() < .7) col.setHSL(R(.12, .15), .95, R(.55, .7)); else col.setHSL(R(.22, .3), R(.3, .6), R(.5, .85)); lm.setColorAt(i, col);
    }
    lm.castShadow = lm.receiveShadow = true; g.add(lm);
    add(box(.8, .02, .8), std({ map: tex(dirt, 1, 1) }), x, .125, z, false);
  }
  tree(-11, .55, 1); tree(2.6, .55, .95); tree(12.2, .55, 1.1, true); tree(-24, .55, 1.05, true); tree(28, .55, 1);
  tree(-6, 8.7, 1.1); tree(9.5, 8.7, 1, true); tree(22, 8.7, 1.05); tree(-30, 8.7, 1);

  // ---------- postes e fios
  const poleM = std({ color: '#a8a399', roughness: .85 });
  const poles = [-45, -15, 19, 49].map(x => { add(new THREE.CylinderGeometry(.09, .15, 9, 10), poleM, x, 4.5, .82); add(box(.12, .12, 1.6), poleM, x, 8.2, .82); return x; });
  const wireM = new THREE.MeshBasicMaterial({ color: '#141414' });
  for (let i = 0; i < poles.length - 1; i++) for (const [dz, y] of [[-.6, 8.3], [0, 8.3], [.6, 8.3], [0, 7.4]]) {
    const a = new THREE.Vector3(poles[i], y, .82 + dz), b = new THREE.Vector3(poles[i + 1], y, .82 + dz), m = a.clone().lerp(b, .5); m.y -= .9;
    scene.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.QuadraticBezierCurve3(a, m, b), 40, .01, 4), wireM));
  }
  // morros ao longe
  const hillM = std({ color: '#6b5a6e', roughness: 1 });
  for (let i = 0; i < 9; i++) { const m = add(new THREE.SphereGeometry(1, 16, 8), hillM, -260 - R(0, 80), -10, R(-160, 160), false, false); m.scale.set(R(40, 80), R(25, 55), R(40, 90)); }

  // ---------- poeira dourada no ar (bokeh)
  const NP = 260, pg = new THREE.BufferGeometry(), pa = new Float32Array(NP * 3), base = [];
  for (let i = 0; i < NP; i++) base.push([R(-8, 20), R(.2, 2.6), R(-1.6, 3), R(0, 6.28)]);
  pg.setAttribute('position', new THREE.BufferAttribute(pa, 3));
  const dustTex = (() => { const c = document.createElement('canvas'); c.width = c.height = 64; const x = c.getContext('2d'); const g = x.createRadialGradient(32, 32, 0, 32, 32, 32); g.addColorStop(0, 'rgba(255,230,180,1)'); g.addColorStop(1, 'rgba(255,200,120,0)'); x.fillStyle = g; x.fillRect(0, 0, 64, 64); return new THREE.CanvasTexture(c); })();
  const pts = new THREE.Points(pg, new THREE.PointsMaterial({ size: .025, map: dustTex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, color: '#ffd9a0' }));
  pts.frustumCulled = false; scene.add(pts);
  W.animated.push(t => { for (let i = 0; i < NP; i++) { const b = base[i]; pa[i * 3] = b[0] + Math.sin(t * .3 + b[3]) * .3; pa[i * 3 + 1] = b[1] + Math.sin(t * .5 + b[3] * 2) * .15; pa[i * 3 + 2] = b[2] + Math.cos(t * .27 + b[3]) * .3; } pg.attributes.position.needsUpdate = true; skyMat.uniforms.uT.value = t; });
  W.update = t => W.animated.forEach(f => f(t));
  return W;
}

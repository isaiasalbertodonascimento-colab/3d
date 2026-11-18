import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

const W = 720, H = 1280;
const TL = await (await fetch('/timeline.json')).json();

// ---------- utils ----------
function mulberry(seed) { return () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const smooth = (a, b, x) => { const t = clamp((x - a) / (b - a)); return t * t * (3 - 2 * t); };
const lerp = (a, b, t) => a + (b - a) * t;
const ease = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

function canvasTex(w, h, draw, srgb = true) {
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c);
  if (srgb) t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
}
const softTex = canvasTex(128, 128, (g, w, h) => {
  const gr = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(.35, 'rgba(255,255,255,.55)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = gr; g.fillRect(0, 0, w, h);
});
const smokeTex = canvasTex(256, 256, (g, w, h) => {
  const r = mulberry(3);
  for (let i = 0; i < 40; i++) {
    const x = 128 + (r() - .5) * 120, y = 128 + (r() - .5) * 120, rad = 30 + r() * 60;
    const gr = g.createRadialGradient(x, y, 0, x, y, rad);
    gr.addColorStop(0, 'rgba(255,255,255,.18)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = gr; g.fillRect(0, 0, w, h);
  }
});
function noiseTex(base, var_, size = 512, seed = 1, rep = 1) {
  const t = canvasTex(size, size, (g, w, h) => {
    const r = mulberry(seed); const img = g.createImageData(w, h);
    for (let i = 0; i < w * h; i++) {
      const v = (r() - .5) * var_;
      img.data[i * 4] = clamp(base[0] + v, 0, 255); img.data[i * 4 + 1] = clamp(base[1] + v, 0, 255); img.data[i * 4 + 2] = clamp(base[2] + v, 0, 255); img.data[i * 4 + 3] = 255;
    }
    g.putImageData(img, 0, 0);
    for (let i = 0; i < 260; i++) { g.fillStyle = `rgba(0,0,0,${r() * .12})`; g.beginPath(); g.ellipse(r() * w, r() * h, r() * 40, r() * 20, r() * 3, 0, 7); g.fill(); }
  });
  t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rep, rep);
  return t;
}

// ---------- renderer ----------
const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
renderer.setPixelRatio(1);
renderer.setSize(W, H);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.0;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.getElementById('wrap').prepend(renderer.domElement);
const envTex = new THREE.PMREMGenerator(renderer).fromScene(new RoomEnvironment(), .04).texture;

const composer = new EffectComposer(renderer);
const renderPass = new RenderPass(new THREE.Scene(), new THREE.PerspectiveCamera());
composer.addPass(renderPass);
const bloom = new UnrealBloomPass(new THREE.Vector2(W, H), 0.8, 0.6, 0.8);
composer.addPass(bloom);
composer.addPass(new OutputPass());
const gradePass = new ShaderPass({
  uniforms: { tDiffuse: { value: null }, time: { value: 0 }, vig: { value: 1.0 }, tint: { value: new THREE.Vector3(1, 1, 1) } },
  vertexShader: `varying vec2 vUv; void main(){vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
  fragmentShader: `uniform sampler2D tDiffuse; uniform float time; uniform float vig; uniform vec3 tint; varying vec2 vUv;
  float h(vec2 p){return fract(sin(dot(p,vec2(12.9898,78.233)))*43758.5453);}
  void main(){
    vec2 d=vUv-.5; float r=length(d);
    vec3 c; float ca=.0025*r*2.;
    c.r=texture2D(tDiffuse,vUv+d*ca).r; c.g=texture2D(tDiffuse,vUv).g; c.b=texture2D(tDiffuse,vUv-d*ca).b;
    float l=dot(c,vec3(.299,.587,.114));
    c=mix(c, c*vec3(.9,1.0,1.08), smoothstep(.5,0.,l)*.6);   // cool shadows
    c=mix(c, c*vec3(1.08,1.0,.9), smoothstep(.4,1.,l)*.5);   // warm highlights
    c=mix(vec3(l),c,1.05);
    c*=tint;
    c*=mix(1., smoothstep(.95,.25,r), vig*.75);
    c+=(h(vUv*vec2(720.,1280.)+fract(time*7.13)*100.)-.5)*.055;
    gl_FragColor=vec4(c,1.);
  }`
});
composer.addPass(gradePass);

// ---------- builders ----------
const skinCols = [0x7d846a, 0x6a735a, 0x8a8770, 0x5f6650, 0x8c7d6c];
const clothCols = [0x2b2f36, 0x4a3b2e, 0x3a4652, 0x5a2a26, 0x2f3b2b, 0x6b6257, 0x1f2a44, 0x50463a];
function makeHuman(rng, opts = {}) {
  const zombie = opts.zombie !== false;
  const g = new THREE.Group();
  const skin = new THREE.MeshStandardMaterial({ color: zombie ? skinCols[Math.floor(rng() * skinCols.length)] : 0x8a6a55, roughness: .75 });
  const shirt = new THREE.MeshStandardMaterial({ color: opts.shirt ?? clothCols[Math.floor(rng() * clothCols.length)], roughness: .95 });
  const pants = new THREE.MeshStandardMaterial({ color: opts.pants ?? clothCols[Math.floor(rng() * clothCols.length)], roughness: .95 });
  if (zombie) { shirt.color.multiplyScalar(.75); }
  const cap = (r, l, m) => { const me = new THREE.Mesh(new THREE.CapsuleGeometry(r, l, 4, 10), m); me.castShadow = true; return me; };
  const hips = new THREE.Group(); hips.position.y = .95; g.add(hips);
  const torso = new THREE.Group(); hips.add(torso);
  const tm = cap(.17, .42, shirt); tm.position.y = .32; tm.scale.set(1.15, 1, .75); torso.add(tm);
  const neck = cap(.05, .08, skin); neck.position.y = .66; torso.add(neck);
  const headG = new THREE.Group(); headG.position.y = .74; torso.add(headG);
  const head = new THREE.Mesh(new THREE.SphereGeometry(.115, 20, 16), skin); head.scale.set(.9, 1.1, 1); head.position.y = .09; head.castShadow = true; headG.add(head);
  const hair = new THREE.Mesh(new THREE.SphereGeometry(.118, 16, 12, 0, Math.PI * 2, 0, 1.3), new THREE.MeshStandardMaterial({ color: 0x1b1612, roughness: 1 }));
  hair.position.set(0, .11, -.01); hair.scale.set(.92, 1.08, 1.02); headG.add(hair);
  if (zombie) {
    const eyeM = new THREE.MeshBasicMaterial({ color: 0xd8e0b0 });
    for (const s of [-1, 1]) { const e = new THREE.Mesh(new THREE.SphereGeometry(.014, 8, 6), eyeM); e.position.set(s * .04, .11, .1); headG.add(e); }
    const blood = new THREE.Mesh(new THREE.SphereGeometry(.06, 8, 6), new THREE.MeshStandardMaterial({ color: 0x3a0806, roughness: .4 }));
    blood.position.set(.02, .0, .085); blood.scale.set(1, .5, .3); headG.add(blood);
  }
  const limbs = {};
  for (const s of [-1, 1]) {
    const sh = new THREE.Group(); sh.position.set(s * .22, .56, 0); torso.add(sh);
    const ua = cap(.055, .24, shirt); ua.position.y = -.15; sh.add(ua);
    const el = new THREE.Group(); el.position.y = -.31; sh.add(el);
    const fa = cap(.045, .22, skin); fa.position.y = -.14; el.add(fa);
    const hand = new THREE.Mesh(new THREE.SphereGeometry(.05, 8, 6), skin); hand.position.y = -.3; hand.scale.set(.8, 1.2, .5); el.add(hand);
    const hp = new THREE.Group(); hp.position.set(s * .1, 0, 0); hips.add(hp);
    const th = cap(.075, .36, pants); th.position.y = -.22; hp.add(th);
    const kn = new THREE.Group(); kn.position.y = -.45; hp.add(kn);
    const sn = cap(.06, .34, pants); sn.position.y = -.22; kn.add(sn);
    const foot = new THREE.Mesh(new THREE.BoxGeometry(.1, .06, .22), new THREE.MeshStandardMaterial({ color: 0x151515, roughness: .8 })); foot.position.set(0, -.46, .05); kn.add(foot);
    limbs[s] = { sh, el, hp, kn };
  }
  const sc = .92 + rng() * .16; g.scale.setScalar(sc);
  g.userData = { hips, torso, headG, limbs, zombie, phase: rng() * 10, speed: .7 + rng() * .5, armsUp: rng() < .6, limp: rng() < .5 ? .5 : 1, tilt: (rng() - .5) * .8 };
  return g;
}
function animHuman(h, t, walking = true) {
  const u = h.userData, p = t * u.speed * 4 + u.phase;
  const { hips, torso, headG, limbs } = u;
  if (!u.zombie) {
    const b = Math.sin(t * 1.5 + u.phase) * .01;
    torso.rotation.x = .02 + b; headG.rotation.y = Math.sin(t * .4 + u.phase) * .3;
    for (const s of [-1, 1]) { limbs[s].sh.rotation.x = .05; limbs[s].sh.rotation.z = s * .08; limbs[s].el.rotation.x = -.15; }
    return;
  }
  const a = walking ? 1 : .15;
  for (const s of [-1, 1]) {
    const ph = p + (s > 0 ? 0 : Math.PI); const amp = (s > 0 ? u.limp : 1) * .45 * a;
    limbs[s].hp.rotation.x = Math.sin(ph) * amp;
    limbs[s].kn.rotation.x = Math.max(0, -Math.cos(ph)) * .7 * a + .05;
    limbs[s].sh.rotation.x = u.armsUp ? -1.25 + Math.sin(ph * .5 + s) * .12 : Math.sin(ph + Math.PI) * .25 * a + .1;
    limbs[s].sh.rotation.z = s * (u.armsUp ? .12 : .15);
    limbs[s].el.rotation.x = u.armsUp ? -.25 : -.3;
  }
  hips.position.y = .95 - Math.abs(Math.sin(p)) * .04 * a;
  hips.rotation.z = Math.sin(p) * .07 * a;
  torso.rotation.x = .22 + Math.sin(p * 2) * .03;
  torso.rotation.z = Math.sin(p) * .06 + u.tilt * .1;
  headG.rotation.z = u.tilt + Math.sin(p * .5) * .1;
  headG.rotation.x = -.15 + Math.sin(p * 1.3) * .08;
}

const winTexes = [];
for (let k = 0; k < 4; k++) {
  const r = mulberry(100 + k);
  const map = canvasTex(256, 512, (g, w, h) => {
    g.fillStyle = ['#3a3d42', '#2e3136', '#45413c', '#34383e'][k]; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 4000; i++) { g.fillStyle = `rgba(${r() < .5 ? 0 : 255},${r() < .5 ? 0 : 255},${r() < .5 ? 0 : 255},.03)`; g.fillRect(r() * w, r() * h, 3, 3); }
    for (let y = 0; y < 16; y++) for (let x = 0; x < 6; x++) { g.fillStyle = '#121418'; g.fillRect(12 + x * 40, 10 + y * 31, 26, 20); }
  });
  const em = canvasTex(256, 512, (g, w, h) => {
    g.fillStyle = '#000'; g.fillRect(0, 0, w, h);
    for (let y = 0; y < 16; y++) for (let x = 0; x < 6; x++) {
      const v = r(); if (v < .1) { g.fillStyle = v < .03 ? '#ff8a3a' : '#ffcf8a'; g.fillRect(12 + x * 40, 10 + y * 31, 26, 20); }
      else if (v < .14) { g.fillStyle = '#4a6a8a'; g.fillRect(12 + x * 40, 10 + y * 31, 26, 20); }
    }
  });
  winTexes.push({ map, em });
}
function makeBuilding(rng, w, h, d, opts = {}) {
  const k = Math.floor(rng() * 4);
  const mk = () => { const m = winTexes[k].map.clone(); m.needsUpdate = true; m.wrapS = m.wrapT = THREE.RepeatWrapping; m.repeat.set(Math.max(1, w / 9), h / 30); return m; };
  const mke = () => { const m = winTexes[(k + Math.floor(rng() * 3)) % 4].em.clone(); m.needsUpdate = true; m.wrapS = m.wrapT = THREE.RepeatWrapping; m.repeat.set(Math.max(1, w / 9), h / 30); return m; };
  const mat = new THREE.MeshStandardMaterial({ map: mk(), emissiveMap: mke(), emissive: new THREE.Color(1, 1, 1), emissiveIntensity: opts.lit ?? 1.6, roughness: .85, metalness: .1 });
  const top = new THREE.MeshStandardMaterial({ color: 0x222428, roughness: 1 });
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), [mat, mat, top, top, mat, mat]);
  m.position.y = h / 2; m.castShadow = true; m.receiveShadow = true;
  return m;
}

function makeFire(scene, pos, size, rng) {
  const grp = new THREE.Group(); grp.position.copy(pos); scene.add(grp);
  const sprites = [];
  for (let i = 0; i < 26; i++) {
    const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: softTex, color: new THREE.Color().setHSL(.04 + rng() * .06, 1, .55), blending: THREE.AdditiveBlending, depthWrite: false, transparent: true }));
    s.userData = { o: rng(), x: (rng() - .5) * size, z: (rng() - .5) * size * .6, sp: .7 + rng() * .6 }; grp.add(s); sprites.push(s);
  }
  const smokes = [];
  for (let i = 0; i < 14; i++) {
    const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: smokeTex, color: 0x1c1a19, depthWrite: false, transparent: true, opacity: .8 }));
    s.userData = { o: rng(), x: (rng() - .5) * size, sp: .5 + rng() * .3, rot: rng() * 6 }; grp.add(s); smokes.push(s);
  }
  const light = new THREE.PointLight(0xff6a2a, size * 30, size * 14, 1.6); light.position.y = size * .5; grp.add(light);
  return {
    update(t) {
      for (const s of sprites) {
        const u = s.userData; const life = (t * u.sp + u.o) % 1;
        s.position.set(u.x * (1 - life * .5) + Math.sin(t * 3 + u.o * 9) * .1 * size, life * size * 1.6, u.z);
        const sc = size * (1.1 - life * .8); s.scale.set(sc, sc * 1.3, 1);
        s.material.opacity = Math.sin(life * Math.PI) * .9;
      }
      for (const s of smokes) {
        const u = s.userData; const life = (t * u.sp * .25 + u.o) % 1;
        s.position.set(u.x + life * size * 1.5, size * 1.2 + life * size * 7, 0);
        const sc = size * (1.5 + life * 5); s.scale.set(sc, sc, 1);
        s.material.rotation = u.rot + life; s.material.opacity = Math.sin(life * Math.PI) * .75;
      }
      light.intensity = size * 30 * (.75 + .25 * Math.sin(t * 13 + pos.x) * Math.sin(t * 7.3));
    }
  };
}
function makeEmbers(scene, count, box, rng, color = 0xff8a30) {
  const g = new THREE.BufferGeometry(); const p = new Float32Array(count * 3); const seeds = [];
  for (let i = 0; i < count; i++) seeds.push([rng(), rng(), rng(), rng()]);
  g.setAttribute('position', new THREE.BufferAttribute(p, 3));
  const pts = new THREE.Points(g, new THREE.PointsMaterial({ size: box.size ?? .15, map: softTex, color, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true }));
  scene.add(pts);
  return {
    pts, update(t) {
      for (let i = 0; i < count; i++) {
        const [a, b, c, d] = seeds[i]; const life = (t * (box.speed ?? .08) * (.5 + d) + a) % 1;
        p[i * 3] = box.x0 + a * box.w + Math.sin(t * 1.3 + d * 20) * .6;
        p[i * 3 + 1] = box.y0 + life * box.h;
        p[i * 3 + 2] = box.z0 + c * box.d + Math.cos(t * 1.1 + b * 20) * .6;
      }
      g.attributes.position.needsUpdate = true;
    }
  };
}

function buildCity(scene, rng, o = {}) {
  const street = o.street ?? 14;
  const asphalt = noiseTex([34, 35, 38], 30, 512, 5, 20);
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(800, 800), new THREE.MeshStandardMaterial({ map: asphalt, roughness: .6, metalness: .2, color: 0x9a9a9a }));
  ground.rotation.x = -Math.PI / 2; ground.receiveShadow = true; scene.add(ground);
  // lane markings
  const lineM = new THREE.MeshStandardMaterial({ color: 0x8a8060, roughness: .8 });
  for (let z = -300; z < 60; z += 8) { const l = new THREE.Mesh(new THREE.PlaneGeometry(.25, 3.5), lineM); l.rotation.x = -Math.PI / 2; l.position.set(0, .01, z); scene.add(l); }
  // sidewalks
  for (const s of [-1, 1]) { const sw = new THREE.Mesh(new THREE.BoxGeometry(4, .2, 420), new THREE.MeshStandardMaterial({ color: 0x4a4a4c, roughness: .9 })); sw.position.set(s * (street / 2 + 2), .1, -150); sw.receiveShadow = true; scene.add(sw); }
  const blds = [];
  for (const s of [-1, 1]) {
    let z = 40;
    while (z > -320) {
      const w = 10 + rng() * 10, d = 10 + rng() * 10, h = 14 + rng() * (o.tall ?? 50);
      const b = makeBuilding(rng, d, h, w, { lit: o.lit }); b.position.x = s * (street / 2 + 4 + d / 2); b.position.z = z - w / 2; scene.add(b); blds.push(b);
      z -= w + 1 + rng() * 3;
    }
  }
  for (let i = 0; i < (o.bg ?? 140); i++) {
    const x = (rng() - .5) * 500, z = -60 - rng() * 400; if (Math.abs(x) < 50) continue;
    const w = 12 + rng() * 20, h = 20 + rng() * 110;
    const b = makeBuilding(rng, w, h, w, { lit: o.lit }); b.position.x = x; b.position.z = z; b.castShadow = false; scene.add(b);
  }
  // cars (wrecked)
  const cars = [];
  for (let i = 0; i < (o.cars ?? 8); i++) {
    const c = new THREE.Group();
    const col = [0x6b1010, 0x1d2b40, 0x555a5e, 0x202020, 0x7a6a40][i % 5];
    const bm = new THREE.MeshStandardMaterial({ color: col, roughness: .35, metalness: .6 });
    const body = new THREE.Mesh(new THREE.BoxGeometry(1.9, .7, 4.4), bm); body.position.y = .65; body.castShadow = true; c.add(body);
    const cab = new THREE.Mesh(new THREE.BoxGeometry(1.7, .6, 2.2), new THREE.MeshStandardMaterial({ color: 0x0c0e12, roughness: .1, metalness: .9 })); cab.position.set(0, 1.25, -.2); c.add(cab);
    for (const [x, z] of [[-.9, 1.4], [.9, 1.4], [-.9, -1.4], [.9, -1.4]]) { const wh = new THREE.Mesh(new THREE.CylinderGeometry(.35, .35, .25, 16), new THREE.MeshStandardMaterial({ color: 0x111111 })); wh.rotation.z = Math.PI / 2; wh.position.set(x, .35, z); c.add(wh); }
    c.position.set((rng() - .5) * (street - 3), 0, 10 - rng() * 120); c.rotation.y = (rng() - .5) * 1.4; scene.add(c); cars.push(c);
  }
  return { blds, cars, ground };
}

function addSkyGlow(scene, color, y = 30, z = -300, s = 600) {
  const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: softTex, color, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: .55, fog: false }));
  sp.position.set(0, y, z); sp.scale.set(s, s * .5, 1); scene.add(sp); return sp;
}

// ---------- scenes ----------
const S = [];
function persp(fov = 50) { const c = new THREE.PerspectiveCamera(fov, W / H, .05, 2000); return c; }

// 0: Hook – burning city at night
S.push(() => {
  const rng = mulberry(11); const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x0a0c12); scene.fog = new THREE.FogExp2(0x1a1416, .011);
  scene.add(new THREE.HemisphereLight(0x324058, 0x120a08, .6));
  const moon = new THREE.DirectionalLight(0x8aa0c8, 1.0); moon.position.set(-40, 80, 20); moon.castShadow = true;
  Object.assign(moon.shadow.camera, { left: -40, right: 40, top: 40, bottom: -40, far: 300 }); moon.shadow.mapSize.set(2048, 2048); scene.add(moon);
  const city = buildCity(scene, rng, { cars: 10 });
  addSkyGlow(scene, 0xff5a1e, 20, -280, 700);
  const fires = [];
  fires.push(makeFire(scene, new THREE.Vector3(-3, .2, -30), 2.2, rng));
  fires.push(makeFire(scene, new THREE.Vector3(4, .2, -70), 3, rng));
  fires.push(makeFire(scene, new THREE.Vector3(-14, 34, -110), 5, rng));
  fires.push(makeFire(scene, new THREE.Vector3(18, 28, -60), 4, rng));
  fires.push(makeFire(scene, new THREE.Vector3(40, 50, -220), 9, rng));
  fires.push(makeFire(scene, new THREE.Vector3(-60, 40, -260), 10, rng));
  const emb = makeEmbers(scene, 400, { x0: -25, w: 50, y0: 0, h: 60, z0: -120, d: 130, speed: .06, size: .25 }, rng);
  const zs = [];
  for (let i = 0; i < 70; i++) { const z = makeHuman(rng); z.userData.base = new THREE.Vector3((rng() - .5) * 13, 0, 5 - rng() * 90); z.rotation.y = (rng() - .5) * .6; scene.add(z); zs.push(z); }
  const cam = persp(55);
  return {
    scene, cam, bloom: [1.0, .7, .75],
    update(t, d) {
      const k = ease(clamp(t / d));
      cam.position.set(lerp(-6, 1.5, k), lerp(70, 1.7, k), lerp(60, 14, k));
      cam.lookAt(lerp(0, 0, k), lerp(0, 1.6, k), lerp(-40, -20, k));
      for (const z of zs) { animHuman(z, t); z.position.copy(z.userData.base); z.position.z += t * z.userData.speed * .55 * Math.cos(z.rotation.y); z.position.x += t * z.userData.speed * .55 * Math.sin(z.rotation.y); }
      fires.forEach(f => f.update(t)); emb.update(t);
    }
  };
});

// 1: Cordyceps – ant + fungal stalk, macro
S.push(() => {
  const rng = mulberry(21); const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x07100a); scene.fog = new THREE.Fog(0x0a140c, 1.2, 6);
  scene.add(new THREE.HemisphereLight(0x8ab878, 0x1a1208, .5));
  const key = new THREE.DirectionalLight(0xffe2b0, 2.4); key.position.set(1.5, 3, 1); key.castShadow = true; key.shadow.mapSize.set(2048, 2048);
  Object.assign(key.shadow.camera, { left: -1.5, right: 1.5, top: 1.5, bottom: -1.5 }); key.shadow.bias = -.0005; scene.add(key);
  const rim = new THREE.DirectionalLight(0x9fe08a, 1.6); rim.position.set(-2, 1, -2); scene.add(rim);
  const litter = canvasTex(1024, 1024, (g, w, h) => {
    const r = mulberry(5); g.fillStyle = '#2a1e12'; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 900; i++) { g.save(); g.translate(r() * w, r() * h); g.rotate(r() * 7); const s = 10 + r() * 40; g.fillStyle = `hsl(${20 + r() * 25},${35 + r() * 30}%,${10 + r() * 18}%)`; g.beginPath(); g.ellipse(0, 0, s, s * .4, 0, 0, 7); g.fill(); g.strokeStyle = 'rgba(0,0,0,.3)'; g.beginPath(); g.moveTo(-s, 0); g.lineTo(s, 0); g.stroke(); g.restore(); }
  });
  litter.wrapS = litter.wrapT = THREE.RepeatWrapping; litter.repeat.set(3, 3);
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(10, 10), new THREE.MeshStandardMaterial({ map: litter, roughness: .9 })); ground.rotation.x = -Math.PI / 2; ground.receiveShadow = true; scene.add(ground);
  // plant stem
  const stemM = new THREE.MeshStandardMaterial({ color: 0x4f6a2a, roughness: .6 });
  const stem = new THREE.Mesh(new THREE.CylinderGeometry(.03, .045, 2, 16), stemM); stem.position.set(0, 1, 0); stem.castShadow = true; stem.rotation.z = .08; scene.add(stem);
  // leaf
  const ls = new THREE.Shape(); ls.moveTo(0, 0); ls.bezierCurveTo(.25, .15, .5, .1, .8, 0); ls.bezierCurveTo(.5, -.12, .25, -.12, 0, 0);
  for (const [y, ry] of [[.55, 0], [1.1, 2.5]]) { const lf = new THREE.Mesh(new THREE.ShapeGeometry(ls, 16), new THREE.MeshStandardMaterial({ color: 0x3f6a24, side: THREE.DoubleSide, roughness: .5 })); lf.position.set(0, y, 0); lf.rotation.set(-.5, ry, .3); lf.castShadow = true; scene.add(lf); }
  // ant on stem
  const antM = new THREE.MeshPhysicalMaterial({ color: 0x2a140a, roughness: .3, clearcoat: 1, clearcoatRoughness: .2 });
  const ant = new THREE.Group(); ant.position.set(.06, .95, .02); ant.rotation.set(0, 0, 1.45); scene.add(ant);
  const ell = (x, sx, sy, sz) => { const m = new THREE.Mesh(new THREE.SphereGeometry(.05, 24, 16), antM); m.position.x = x; m.scale.set(sx, sy, sz); m.castShadow = true; ant.add(m); return m; };
  ell(-.11, 1.6, 1.1, 1.1); ell(0, 1.2, .55, .55); const headA = ell(.09, .9, .85, .85);
  for (const s of [-1, 1]) for (let i = 0; i < 3; i++) {
    const leg = new THREE.Mesh(new THREE.CylinderGeometry(.005, .004, .14, 6), antM); leg.position.set(-.03 + i * .03, -.03, s * .05); leg.rotation.set(s * 1.0, 0, (i - 1) * .5); ant.add(leg);
  }
  for (const s of [-1, 1]) { const an = new THREE.Mesh(new THREE.CylinderGeometry(.003, .003, .12, 6), antM); an.position.set(.14, .03, s * .02); an.rotation.set(s * .4, 0, -.9); ant.add(an); }
  // fungal stalk from head
  const curve = new THREE.CatmullRomCurve3([new THREE.Vector3(0, 0, 0), new THREE.Vector3(.02, .12, .0), new THREE.Vector3(-.03, .28, .02), new THREE.Vector3(.01, .45, 0), new THREE.Vector3(.0, .55, -.01)]);
  const stalkM = new THREE.MeshPhysicalMaterial({ color: 0xc8a060, roughness: .45, sheen: 1, sheenColor: new THREE.Color(0xfff0c0), emissive: 0x2a1a05 });
  const stalk = new THREE.Mesh(new THREE.TubeGeometry(curve, 64, .012, 10), stalkM); stalk.castShadow = true;
  const stalkG = new THREE.Group(); stalkG.add(stalk);
  const bulb = new THREE.Mesh(new THREE.SphereGeometry(.03, 16, 12), new THREE.MeshPhysicalMaterial({ color: 0xe0a040, roughness: .5, emissive: 0x804010, emissiveIntensity: .6 })); bulb.position.set(0, .55, -.01); bulb.scale.set(1, 1.6, 1); stalkG.add(bulb);
  const wpos = new THREE.Vector3(); headA.getWorldPosition(wpos); stalkG.position.copy(wpos).add(new THREE.Vector3(.0, .03, 0)); scene.add(stalkG);
  // spores
  const spore = makeEmbers(scene, 300, { x0: -.8, w: 1.6, y0: .9, h: 1.2, z0: -.8, d: 1.6, speed: .04, size: .015 }, rng, 0xfff0a0);
  // bokeh
  for (let i = 0; i < 30; i++) { const b = new THREE.Sprite(new THREE.SpriteMaterial({ map: softTex, color: new THREE.Color().setHSL(.18 + rng() * .12, .7, .45), transparent: true, opacity: .35, blending: THREE.AdditiveBlending, depthWrite: false, fog: false })); b.position.set((rng() - .5) * 8, rng() * 4, -4 - rng() * 3); const s = .3 + rng() * .8; b.scale.set(s, s, 1); scene.add(b); }
  const cam = persp(35);
  return {
    scene, cam, bloom: [.7, .8, .7], update(t, d) {
      const a = .9 + t * .07;
      cam.position.set(Math.sin(a) * (1.5 - t * .03), 1.0 + t * .015, Math.cos(a) * (1.5 - t * .03)); cam.lookAt(.03, 1.02, 0);
      const g = smooth(.5, d * .7, t); stalkG.scale.set(1, Math.max(.01, g), 1); bulb.visible = g > .7;
      headA.rotation.y = Math.sin(t * 9) * .1 * (1 - g);
      spore.pts.material.opacity = smooth(d * .5, d * .8, t); spore.update(t);
    }
  };
});

// 2: Rabies virus in bloodstream
S.push(() => {
  const rng = mulberry(31); const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x1a0204); scene.fog = new THREE.FogExp2(0x2a0306, .09);
  scene.add(new THREE.HemisphereLight(0xff9a8a, 0x300004, .8));
  const k = new THREE.DirectionalLight(0xffd0c0, 2); k.position.set(2, 3, 4); scene.add(k);
  const rim = new THREE.DirectionalLight(0x80b0ff, 2.5); rim.position.set(-3, -1, -3); scene.add(rim);
  // bullet-shaped virion
  const prof = []; for (let i = 0; i <= 20; i++) { const a = i / 20 * Math.PI / 2; prof.push(new THREE.Vector2(Math.sin(a) * .35, .5 + Math.cos(a) * .35)); }
  prof.push(new THREE.Vector2(.35, -.6)); prof.push(new THREE.Vector2(.0, -.6));
  const vGeo = new THREE.LatheGeometry(prof.reverse(), 48);
  const vMat = new THREE.MeshPhysicalMaterial({ color: 0xb8c8c0, roughness: .5, sheen: 1, sheenColor: new THREE.Color(0xffffff), clearcoat: .3, emissive: 0x101820 });
  const spikeGeo = new THREE.CylinderGeometry(.012, .02, .1, 6); const spikeM = new THREE.MeshStandardMaterial({ color: 0xd8a070, roughness: .5, emissive: 0x301000 });
  const knobGeo = new THREE.SphereGeometry(.03, 8, 6);
  function virion() {
    const g = new THREE.Group(); g.add(new THREE.Mesh(vGeo, vMat));
    const n = 220; const sp = new THREE.InstancedMesh(spikeGeo, spikeM, n); const kn = new THREE.InstancedMesh(knobGeo, spikeM, n);
    const m = new THREE.Matrix4(), q = new THREE.Quaternion(), up = new THREE.Vector3(0, 1, 0);
    for (let i = 0; i < n; i++) {
      const y = -.55 + rng() * 1.35, a = rng() * Math.PI * 2; let r = .35, nrm;
      if (y > .5) { const ang = Math.acos(clamp((y - .5) / .35, -1, 1)); r = Math.sin(ang) * .35; nrm = new THREE.Vector3(Math.cos(a) * Math.sin(ang), Math.cos(ang), Math.sin(a) * Math.sin(ang)); }
      else nrm = new THREE.Vector3(Math.cos(a), 0, Math.sin(a));
      const yy = y > .5 ? .5 + Math.cos(Math.acos(clamp((y - .5) / .35, -1, 1))) * .35 : y;
      const p = new THREE.Vector3(Math.cos(a) * r, yy, Math.sin(a) * r).addScaledVector(nrm, .05);
      q.setFromUnitVectors(up, nrm); m.compose(p, q, new THREE.Vector3(1, 1, 1)); sp.setMatrixAt(i, m);
      m.compose(p.clone().addScaledVector(nrm, .05), q, new THREE.Vector3(1, 1, 1)); kn.setMatrixAt(i, m);
    }
    g.add(sp, kn); return g;
  }
  const vs = [];
  const hero = virion(); scene.add(hero); vs.push({ g: hero, p: new THREE.Vector3(0, 0, 0), r: [.3, .2, .6] });
  for (let i = 0; i < 9; i++) { const v = virion(); scene.add(v); vs.push({ g: v, p: new THREE.Vector3((rng() - .5) * 6, (rng() - .5) * 8, -2 - rng() * 8), r: [rng(), rng(), rng()] }); }
  // red blood cells
  const rp = []; for (let i = 0; i <= 24; i++) { const x = i / 24; const r = x * .9; const th = .12 + .25 * Math.pow(x, 2) * (1 - Math.pow(x, 6)); rp.push(new THREE.Vector2(r, th)); }
  const rp2 = rp.slice().reverse().map(v => new THREE.Vector2(v.x, -v.y));
  const rbcGeo = new THREE.LatheGeometry(rp.concat(rp2), 40);
  const rbcM = new THREE.MeshPhysicalMaterial({ color: 0xb0100c, roughness: .35, clearcoat: .6, sheen: .5, sheenColor: new THREE.Color(0xff6040), transmission: 0, emissive: 0x200000 });
  const cells = [];
  for (let i = 0; i < 40; i++) { const c = new THREE.Mesh(rbcGeo, rbcM); c.userData = { p: new THREE.Vector3((rng() - .5) * 10, (rng() - .5) * 14, -1 - rng() * 14), r: new THREE.Vector3(rng() * 6, rng() * 6, rng() * 6), s: .5 + rng() * .5 }; c.scale.setScalar(.8 + rng() * .5); scene.add(c); cells.push(c); }
  const parts = makeEmbers(scene, 300, { x0: -4, w: 8, y0: -6, h: 12, z0: -6, d: 9, speed: .02, size: .04 }, rng, 0xff8070);
  const cam = persp(40);
  return {
    scene, cam, bloom: [.6, .7, .7], update(t, d) {
      cam.position.set(Math.sin(t * .15) * .4, .2, 3.2 - t * .12); cam.lookAt(0, .1, 0);
      for (const v of vs) { v.g.position.copy(v.p); v.g.position.y += Math.sin(t * .5 + v.r[0] * 9) * .15; v.g.rotation.set(v.r[0] * 6 + t * .2, v.r[1] * 6 + t * .3, v.r[2] * 6 + .9); }
      for (const c of cells) { const u = c.userData; c.position.copy(u.p); c.position.y = ((u.p.y + t * u.s + 7) % 14) - 7; c.rotation.set(u.r.x + t * .3, u.r.y + t * .2, u.r.z); }
      parts.update(t);
    }
  };
});

// 3: Simulation map
S.push(() => {
  const rng = mulberry(41); const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x05070c); scene.fog = new THREE.FogExp2(0x05070c, .018);
  scene.add(new THREE.HemisphereLight(0x6080b0, 0x000000, .6));
  const dl = new THREE.DirectionalLight(0xffffff, .8); dl.position.set(10, 30, 20); scene.add(dl);
  const NX = 44, NZ = 80, sp = .55;
  const geo = new THREE.BoxGeometry(sp * .86, 1, sp * .86); geo.translate(0, .5, 0);
  const mat = new THREE.MeshStandardMaterial({ roughness: .5, metalness: .2 });
  const cells = []; const nz = (x, z) => Math.sin(x * .35) * Math.cos(z * .21) + Math.sin(x * .13 + z * .17) * .8 + Math.sin(z * .5 + 1) * .3;
  for (let i = 0; i < NX; i++) for (let j = 0; j < NZ; j++) {
    const x = (i - NX / 2) / (NX / 2), z = (j - NZ / 2) / (NZ / 2);
    const land = 1 - (x * x * .9 + z * z) + nz(i, j) * .22; if (land < 0) continue;
    cells.push({ i, j, x: (i - NX / 2) * sp, z: (j - NZ / 2) * sp, h: .15 + land * .6 + rng() * .1, n: rng() });
  }
  const cities = [[-4, -8, 2.8], [3, 4, 2.4], [-2, 12, 2.0], [5, -14, 1.8], [-6, 3, 1.4]];
  for (const c of cells) {
    let dmin = 1e9; for (const [cx, cz, s] of cities) dmin = Math.min(dmin, Math.hypot(c.x - cx, c.z - cz) / s);
    c.d = dmin; c.city = Math.max(0, 1.6 - dmin) * 2.5;
  }
  const im = new THREE.InstancedMesh(geo, mat, cells.length); scene.add(im);
  const m4 = new THREE.Matrix4(), col = new THREE.Color();
  const glow = []; for (const [cx, cz] of cities) { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: softTex, color: 0xff2010, blending: THREE.AdditiveBlending, transparent: true, depthWrite: false })); s.position.set(cx, 2, cz); scene.add(s); glow.push(s); }
  const cam = persp(45);
  return {
    scene, cam, bloom: [1.1, .5, .3], update(t, d) {
      const k = clamp(t / d);
      cam.position.set(Math.sin(.4 + t * .05) * 12, 22 - k * 5, 18 - k * 4); cam.lookAt(0, 0, -1);
      const front = t * 1.05;
      cells.forEach((c, idx) => {
        const inf = smooth(0, .5, front - c.d * 2.2 - c.n * .6);
        const hh = c.h + c.city * (1 + .2 * Math.sin(idx)) + inf * .8 * (1 + c.city);
        m4.makeScale(1, hh, 1); m4.setPosition(c.x, 0, c.z); im.setMatrixAt(idx, m4);
        col.setRGB(lerp(.16, 2.4, inf), lerp(.22 + c.city * .1, .12, inf), lerp(.35 + c.city * .1, .06, inf)); im.setColorAt(idx, col);
      });
      im.instanceMatrix.needsUpdate = true; im.instanceColor.needsUpdate = true;
      glow.forEach((g, i) => { const s = (2 + Math.sin(t * 3 + i)) * smooth(0, 1, t - i * .4) * 2.5; g.scale.set(s, s, 1); });
      const day = Math.min(28, 1 + Math.floor(Math.pow(k, 1.3) * 28));
      setBig(`DIA ${String(day).padStart(2, '0')}`, k < .55 ? 'cidades caindo' : 'áreas isoladas resistem');
    }
  };
});

// Generic room/table builder used for water + kit
function tableScene(seed, bg) {
  const rng = mulberry(seed); const scene = new THREE.Scene();
  scene.background = new THREE.Color(bg); scene.fog = new THREE.Fog(bg, 4, 14); scene.environment = envTex; scene.environmentIntensity = .35;
  scene.add(new THREE.HemisphereLight(0x6a7890, 0x100c08, .35));
  const key = new THREE.SpotLight(0xffe0b8, 60, 15, .6, .5, 1.6); key.position.set(1.5, 4.5, 2); key.castShadow = true; key.shadow.mapSize.set(2048, 2048); key.shadow.bias = -.0004; scene.add(key); scene.add(key.target);
  const rim = new THREE.DirectionalLight(0x6a90ff, 1.2); rim.position.set(-3, 2, -4); scene.add(rim);
  const wood = canvasTex(1024, 1024, (g, w, h) => {
    const r = mulberry(seed); g.fillStyle = '#4a2e1a'; g.fillRect(0, 0, w, h);
    for (let y = 0; y < h; y += 2) { g.fillStyle = `rgba(${r() < .5 ? 20 : 90},${r() < .5 ? 10 : 50},0,${r() * .25})`; g.fillRect(0, y + Math.sin(y * .05) * 3, w, 2); }
    for (let i = 0; i < 5; i++) { g.fillStyle = 'rgba(0,0,0,.6)'; g.fillRect(0, i * 205, w, 3); }
  });
  const table = new THREE.Mesh(new THREE.BoxGeometry(6, .1, 4), new THREE.MeshStandardMaterial({ map: wood, roughness: .55 })); table.position.y = -.05; table.receiveShadow = true; scene.add(table);
  const wall = new THREE.Mesh(new THREE.PlaneGeometry(14, 8), new THREE.MeshStandardMaterial({ map: noiseTex([60, 58, 55], 40, 512, seed + 9, 2), roughness: 1 })); wall.position.set(0, 2, -2.2); wall.receiveShadow = true; scene.add(wall);
  const dust = makeEmbers(scene, 250, { x0: -2, w: 4, y0: -.5, h: 4, z0: -1.5, d: 3, speed: .015, size: .012 }, rng, 0xfff0d0);
  return { rng, scene, key, dust };
}

// 4: Water
S.push(() => {
  const { rng, scene, key, dust } = tableScene(51, 0x0b0d10);
  key.position.set(-1.5, 4, 2.5);
  const prof = [[0, 0], [.32, 0], [.34, .05], [.34, 1.1], [.3, 1.35], [.14, 1.55], [.12, 1.75], [.0, 1.75]].map(([x, y]) => new THREE.Vector2(x, y));
  const bGeo = new THREE.LatheGeometry(prof, 48);
  const glass = new THREE.MeshPhysicalMaterial({ color: 0xffffff, transmission: 1, roughness: .05, thickness: .3, ior: 1.45, clearcoat: 1, specularIntensity: 1 });
  const water = new THREE.MeshPhysicalMaterial({ color: 0x9ad0ff, emissive: 0x0a2a50, transmission: .85, roughness: .1, thickness: 1, ior: 1.33, attenuationColor: new THREE.Color(0x60a0d0), attenuationDistance: 1.5 });
  const capM = new THREE.MeshStandardMaterial({ color: 0x1a4aa0, roughness: .4 });
  const labelM = new THREE.MeshStandardMaterial({ color: 0x2a70c0, roughness: .6 });
  const bottles = [];
  [[-.9, .2, 1], [0, -.3, 1.1], [.9, .25, .95], [-.3, .9, .9], [.55, -1.1, .9]].forEach(([x, z, s], i) => {
    const g = new THREE.Group();
    const b = new THREE.Mesh(bGeo, glass); b.castShadow = true; g.add(b);
    const wv = new THREE.Mesh(new THREE.CylinderGeometry(.31, .31, 1.05, 40), water); wv.position.y = .56; g.add(wv);
    const cp = new THREE.Mesh(new THREE.CylinderGeometry(.13, .13, .12, 24), capM); cp.position.y = 1.8; g.add(cp);
    const lb = new THREE.Mesh(new THREE.CylinderGeometry(.345, .345, .35, 40, 1, true), labelM); lb.position.y = .55; g.add(lb);
    g.position.set(x, 0, z); g.scale.setScalar(s * .6); scene.add(g); bottles.push(g);
  });
  // drop
  const drop = new THREE.Mesh(new THREE.SphereGeometry(.04, 20, 16), water); scene.add(drop);
  const cam = persp(38);
  return {
    scene, cam, bloom: [.5, .6, .8], update(t, d) {
      cam.position.set(Math.sin(t * .06 - .3) * 4.6, 1.9 + t * .02, Math.cos(t * .06 - .3) * 4.6); cam.lookAt(0, .45, 0);
      bottles.forEach((b, i) => { const k = smooth(i * .35, i * .35 + .5, t); b.position.y = (1 - k) * 2; b.visible = k > 0; });
      const dl = (t * .7) % 1; drop.position.set(.3, 2.2 - dl * dl * 2.2, 1.2); drop.scale.set(1, 1.3, 1);
      dust.update(t);
      setBig('3 DIAS', 'é o limite sem água');
    }
  };
});

// 5: Crowds – horde walking toward camera
S.push(() => {
  const rng = mulberry(61); const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x0c0e14); scene.fog = new THREE.FogExp2(0x241a18, .02);
  scene.add(new THREE.HemisphereLight(0x405070, 0x100806, .7));
  const moon = new THREE.DirectionalLight(0x9ab0d8, 1.1); moon.position.set(20, 40, -30); moon.castShadow = true; moon.shadow.mapSize.set(2048, 2048); Object.assign(moon.shadow.camera, { left: -25, right: 25, top: 25, bottom: -25 }); scene.add(moon);
  buildCity(scene, rng, { cars: 6, tall: 40 });
  addSkyGlow(scene, 0xff4a1a, 10, -260, 600);
  const fires = [makeFire(scene, new THREE.Vector3(-5, .2, -40), 2.5, rng), makeFire(scene, new THREE.Vector3(6, .2, -60), 3, rng)];
  // streetlight flicker
  const sl = new THREE.PointLight(0xffd8a0, 40, 30, 1.5); sl.position.set(6, 6, -6); scene.add(sl);
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(.08, .1, 6, 8), new THREE.MeshStandardMaterial({ color: 0x222222 })); pole.position.set(6.5, 3, -6); scene.add(pole);
  const bulb = new THREE.Mesh(new THREE.SphereGeometry(.2, 12, 8), new THREE.MeshBasicMaterial({ color: 0xffe0b0 })); bulb.position.copy(sl.position); scene.add(bulb);
  const zs = [];
  for (let i = 0; i < 110; i++) { const z = makeHuman(rng); z.userData.base = new THREE.Vector3((rng() - .5) * 15, 0, -4 - Math.pow(rng(), .7) * 60); z.rotation.y = (rng() - .5) * .3; scene.add(z); zs.push(z); }
  const cam = persp(42);
  return {
    scene, cam, bloom: [.9, .6, .75], update(t) {
      cam.position.set(.5 + Math.sin(t * .7) * .05, 1.1 + Math.sin(t * 1.9) * .02, 6 + t * .35); cam.lookAt(0, 1.4, -15);
      for (const z of zs) { animHuman(z, t); z.position.copy(z.userData.base); z.position.z += t * z.userData.speed * .6 + 4; }
      const f = (Math.sin(t * 23) > .7 || (t % 3) < .12) ? .15 : 1; sl.intensity = 40 * f; bulb.material.color.setScalar(f);
      fires.forEach(x => x.update(t));
    }
  };
});

// 6: Shelter – tall building with barricaded ground floor
S.push(() => {
  const rng = mulberry(71); const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x0a0d14); scene.fog = new THREE.FogExp2(0x1a1518, .014);
  scene.add(new THREE.HemisphereLight(0x405880, 0x100806, .7));
  const moon = new THREE.DirectionalLight(0xa0b8e0, 1.4); moon.position.set(-30, 60, 40); moon.castShadow = true; moon.shadow.mapSize.set(2048, 2048); Object.assign(moon.shadow.camera, { left: -30, right: 30, top: 60, bottom: -10, far: 200 }); scene.add(moon);
  const asphalt = noiseTex([34, 35, 38], 30, 512, 7, 30);
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(600, 600), new THREE.MeshStandardMaterial({ map: asphalt, roughness: .7 })); ground.rotation.x = -Math.PI / 2; ground.receiveShadow = true; scene.add(ground);
  const tower = makeBuilding(rng, 16, 60, 16, { lit: .5 }); scene.add(tower);
  // ground floor wall + barricades
  const gf = new THREE.Mesh(new THREE.BoxGeometry(16.2, 5, 16.2), new THREE.MeshStandardMaterial({ color: 0x3a3836, roughness: .9 })); gf.position.y = 2.5; gf.castShadow = true; scene.add(gf);
  const plankM = new THREE.MeshStandardMaterial({ map: canvasTex(256, 64, (g, w, h) => { const r = mulberry(2); g.fillStyle = '#6b4a2a'; g.fillRect(0, 0, w, h); for (let y = 0; y < h; y += 2) { g.fillStyle = `rgba(30,15,0,${r() * .4})`; g.fillRect(0, y, w, 1); } }), roughness: .9 });
  for (let k = 0; k < 4; k++) for (let i = 0; i < 9; i++) {
    const p = new THREE.Mesh(new THREE.BoxGeometry(3.4, .35, .12), plankM); p.castShadow = true;
    const x = -6 + (k) * 4, y = .8 + i * .45; p.position.set(x, y, 8.18); p.rotation.z = (i % 2 ? .35 : -.3) * (i % 3 ? 1 : .2); scene.add(p);
  }
  for (const s of [-1, 1]) for (let i = 0; i < 6; i++) { const c = new THREE.Mesh(new THREE.BoxGeometry(.5, .5, .5), new THREE.MeshStandardMaterial({ color: 0x5a4a2a, roughness: 1 })); c.position.set(s * (3 + i * .6), .25 + (i % 2) * .5, 9); scene.add(c); }
  // rooftop survivor + light
  const sv = makeHuman(rng, { zombie: false, shirt: 0x2a3a2a, pants: 0x222222 }); sv.position.set(2, 60, 6); sv.scale.setScalar(1.1); scene.add(sv);
  const rl = new THREE.PointLight(0xffb070, 8, 10); rl.position.set(2, 61.5, 6); scene.add(rl);
  // neighbours
  for (let i = 0; i < 30; i++) { const x = (rng() - .5) * 300, z = -40 - rng() * 250; const b = makeBuilding(rng, 14 + rng() * 10, 15 + rng() * 50, 14 + rng() * 10, { lit: .8 }); b.position.x = x; b.position.z = z; b.castShadow = false; scene.add(b); }
  addSkyGlow(scene, 0xff5020, 0, -250, 600);
  const fire = makeFire(scene, new THREE.Vector3(-25, .2, -30), 4, rng);
  const zs = []; for (let i = 0; i < 40; i++) { const z = makeHuman(rng); const a = rng() * Math.PI - Math.PI / 2 + Math.PI / 2; const r = 10 + rng() * 10; z.userData.base = new THREE.Vector3((rng() - .5) * 26, 0, 9.5 + rng() * 12); z.rotation.y = Math.PI + (rng() - .5) * .6; scene.add(z); zs.push(z); }
  const cam = persp(50);
  return {
    scene, cam, bloom: [.8, .6, .75], update(t, d) {
      const k = ease(clamp(t / d));
      cam.position.set(lerp(6, 14, k), lerp(1.8, 70, k), lerp(26, 26, k)); cam.lookAt(0, lerp(2.5, 58, k), 0);
      for (const z of zs) { animHuman(z, t, true); z.position.copy(z.userData.base); z.position.z = Math.max(8.7, z.userData.base.z - t * z.userData.speed * .4); }
      animHuman(sv, t); fire.update(t);
    }
  };
});

// 7: Silence & darkness – candle in window goes out
S.push(() => {
  const rng = mulberry(81); const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x05070b); scene.fog = new THREE.FogExp2(0x120e10, .012);
  scene.add(new THREE.HemisphereLight(0x304060, 0x050302, .35));
  // outside city far below: put city at y=-25
  const out = new THREE.Group(); out.position.set(0, -24, -20); scene.add(out);
  const rngC = mulberry(5);
  const tmp = new THREE.Scene(); buildCity(tmp, rngC, { cars: 5, bg: 80 }); while (tmp.children.length) out.add(tmp.children[0]);
  const fires = [makeFire(out, new THREE.Vector3(-3, .2, -30), 2.5, rng), makeFire(out, new THREE.Vector3(30, 30, -120), 7, rng)];
  addSkyGlow(scene, 0xff5020, -10, -300, 600);
  const zs = []; for (let i = 0; i < 40; i++) { const z = makeHuman(rng); z.userData.base = new THREE.Vector3((rng() - .5) * 12, 0, -10 - rng() * 50); out.add(z); zs.push(z); }
  // window frame (room)
  const wallM = new THREE.MeshStandardMaterial({ color: 0x2a2624, roughness: 1 });
  const fr = (w, h, x, y) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, .3), wallM); m.position.set(x, y, 0); m.receiveShadow = true; scene.add(m); };
  fr(10, 4, 0, 3.6); fr(10, 4, 0, -2.9); fr(4, 4, -2.7, .4); fr(4, 4, 2.7, .4);
  const sill = new THREE.Mesh(new THREE.BoxGeometry(1.6, .1, .8), new THREE.MeshStandardMaterial({ color: 0x5a5048, roughness: .8 })); sill.position.set(0, -.9, .3); sill.receiveShadow = true; scene.add(sill);
  const mull = new THREE.Mesh(new THREE.BoxGeometry(.08, 3.4, .08), wallM); mull.position.set(0, .4, 0); scene.add(mull);
  const candle = new THREE.Mesh(new THREE.CylinderGeometry(.06, .06, .35, 20), new THREE.MeshPhysicalMaterial({ color: 0xf0e8d8, roughness: .4, transmission: .2, thickness: .2 })); candle.position.set(.35, -.67, .35); candle.castShadow = true; scene.add(candle);
  const flame = new THREE.Sprite(new THREE.SpriteMaterial({ map: softTex, color: 0xffa040, blending: THREE.AdditiveBlending, transparent: true, depthWrite: false })); flame.position.set(.35, -.43, .35); scene.add(flame);
  const cl = new THREE.PointLight(0xff9a40, 3, 6, 1.5); cl.position.set(.35, -.35, .5); cl.castShadow = true; scene.add(cl);
  const smoke = []; for (let i = 0; i < 10; i++) { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: smokeTex, color: 0x9a9a9a, transparent: true, depthWrite: false })); smoke.push(s); scene.add(s); }
  const cam = persp(45);
  return {
    scene, cam, bloom: [1.0, .6, .6], update(t, d) {
      cam.position.set(.1 + t * .02, -.2, 3.8 - t * .12); cam.lookAt(0, -.3, -4);
      const off = d * .38; const on = t < off ? 1 : 0;
      const fl = .85 + .15 * Math.sin(t * 17) * Math.sin(t * 11);
      flame.scale.set(.12 * fl * on, .28 * fl * on, 1); cl.intensity = 3 * fl * on;
      smoke.forEach((s, i) => { const life = clamp((t - off) * .5 - i * .08); s.visible = t > off && life < 1; s.position.set(.35 + Math.sin(life * 8 + i) * .05, -.45 + life * 1.2, .35); const sc = .05 + life * .3; s.scale.set(sc, sc, 1); s.material.opacity = (1 - life) * .25; });
      for (const z of zs) { animHuman(z, t); z.position.copy(z.userData.base); z.position.z += t * z.userData.speed * .5; }
      fires.forEach(f => f.update(t));
    }
  };
});

// 8: Kit
S.push(() => {
  const { rng, scene, key, dust } = tableScene(91, 0x0a0b0e);
  const items = [];
  const metal = new THREE.MeshStandardMaterial({ color: 0x2a2a2e, metalness: .8, roughness: .35 });
  // flashlight
  { const g = new THREE.Group(); const b = new THREE.Mesh(new THREE.CylinderGeometry(.09, .09, .8, 24), metal); b.rotation.z = Math.PI / 2; g.add(b); const h = new THREE.Mesh(new THREE.CylinderGeometry(.15, .1, .25, 24), metal); h.rotation.z = Math.PI / 2; h.position.x = .5; g.add(h); const lens = new THREE.Mesh(new THREE.CircleGeometry(.13, 24), new THREE.MeshBasicMaterial({ color: 0xfff4d0 })); lens.rotation.y = Math.PI / 2; lens.position.x = .63; g.add(lens); const sl = new THREE.SpotLight(0xfff0d0, 25, 8, .35, .4); sl.position.set(.65, 0, 0); sl.target.position.set(3, -.2, .5); g.add(sl, sl.target); g.position.set(-1.1, .15, .5); g.rotation.y = .5; items.push(g); }
  // radio
  { const g = new THREE.Group(); const bx = new THREE.Mesh(new THREE.BoxGeometry(.9, .55, .3), new THREE.MeshStandardMaterial({ color: 0x3a2a1a, roughness: .5 })); bx.position.y = .28; g.add(bx); const gr = new THREE.Mesh(new THREE.CircleGeometry(.18, 24), new THREE.MeshStandardMaterial({ color: 0x111111, roughness: .9 })); gr.position.set(-.18, .28, .151); g.add(gr); const dial = new THREE.Mesh(new THREE.PlaneGeometry(.3, .1), new THREE.MeshBasicMaterial({ color: 0xffa040 })); dial.position.set(.2, .38, .151); g.add(dial); const ant = new THREE.Mesh(new THREE.CylinderGeometry(.01, .01, .9, 6), metal); ant.position.set(.35, .9, 0); ant.rotation.z = -.4; g.add(ant); g.position.set(.2, 0, -.8); g.rotation.y = -.2; items.push(g); }
  // medkit
  { const g = new THREE.Group(); const bx = new THREE.Mesh(new THREE.BoxGeometry(.8, .35, .55), new THREE.MeshStandardMaterial({ color: 0xd8d4cc, roughness: .4 })); bx.position.y = .18; g.add(bx); const c1 = new THREE.Mesh(new THREE.BoxGeometry(.32, .01, .1), new THREE.MeshStandardMaterial({ color: 0xc01010 })); c1.position.y = .36; g.add(c1); const c2 = c1.clone(); c2.rotation.y = Math.PI / 2; g.add(c2); g.position.set(1.2, 0, .1); g.rotation.y = .4; items.push(g); }
  // cans
  { const g = new THREE.Group(); const lbl = canvasTex(256, 128, (c, w, h) => { c.fillStyle = '#a02818'; c.fillRect(0, 0, w, h); c.fillStyle = '#f0d070'; c.fillRect(0, 50, w, 28); }); for (let i = 0; i < 3; i++) { const cn = new THREE.Mesh(new THREE.CylinderGeometry(.16, .16, .4, 32), [new THREE.MeshStandardMaterial({ map: lbl, roughness: .4, metalness: .3 }), new THREE.MeshStandardMaterial({ color: 0xaaaaaa, metalness: 1, roughness: .3 }), new THREE.MeshStandardMaterial({ color: 0xaaaaaa, metalness: 1, roughness: .3 })]); cn.castShadow = true; cn.position.set(i * .36 - .36, .2, i % 2 * .2); if (i === 2) cn.position.set(-.18, .6, .1); g.add(cn); } g.position.set(-.2, 0, .9); items.push(g); }
  // map
  { const mt = canvasTex(512, 384, (c, w, h) => { c.fillStyle = '#d8c8a0'; c.fillRect(0, 0, w, h); const r = mulberry(4); c.strokeStyle = '#7a9a6a'; c.lineWidth = 3; for (let i = 0; i < 12; i++) { c.beginPath(); c.moveTo(r() * w, r() * h); c.bezierCurveTo(r() * w, r() * h, r() * w, r() * h, r() * w, r() * h); c.stroke(); } c.strokeStyle = '#4060a0'; c.lineWidth = 6; c.beginPath(); c.moveTo(0, h * .7); c.bezierCurveTo(w * .3, h * .5, w * .6, h * .9, w, h * .6); c.stroke(); c.strokeStyle = '#c02020'; c.lineWidth = 5; c.setLineDash([12, 8]); c.beginPath(); c.moveTo(w * .2, h * .2); c.lineTo(w * .5, h * .45); c.lineTo(w * .8, h * .3); c.stroke(); c.fillStyle = '#c02020'; c.font = 'bold 40px sans-serif'; c.fillText('X', w * .78, h * .33); c.fillStyle = 'rgba(0,0,0,.15)'; for (let i = 1; i < 4; i++) c.fillRect(i * w / 4, 0, 2, h); });
    const g = new THREE.Group(); const m = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 1.2), new THREE.MeshStandardMaterial({ map: mt, roughness: .9, side: THREE.DoubleSide })); m.rotation.x = -Math.PI / 2; m.position.y = .005; m.receiveShadow = true; g.add(m); g.position.set(.5, 0, .9); g.rotation.y = .15; items.push(g); }
  items.forEach(i => { i.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } }); scene.add(i); });
  const times = [.0, 1.4, 2.6, 3.7, 5.2];
  const cam = persp(40);
  return {
    scene, cam, bloom: [.6, .5, .8], update(t, d) {
      const a = .2 + t * .05; cam.position.set(Math.sin(a) * 4, 3.2 - t * .1, Math.cos(a) * 4); cam.lookAt(0, .2, 0);
      items.forEach((it, i) => { const k = smooth(times[i], times[i] + .35, t); it.visible = k > 0; it.position.y = (1 - k) * 1.5 + Math.sin(k * Math.PI) * .05; });
      dust.update(t);
    }
  };
});

// 9: Small group on rooftop
S.push(() => {
  const rng = mulberry(101); const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x0c0c12); scene.fog = new THREE.FogExp2(0x2a1812, .009);
  scene.add(new THREE.HemisphereLight(0x405070, 0x140a06, .5));
  const roof = new THREE.Mesh(new THREE.BoxGeometry(30, 1, 30), new THREE.MeshStandardMaterial({ map: noiseTex([50, 50, 52], 40, 512, 3, 6), roughness: .95 })); roof.position.set(0, 39.5, 0); roof.receiveShadow = true; scene.add(roof);
  const ledge = new THREE.Mesh(new THREE.BoxGeometry(30, 1, .4), new THREE.MeshStandardMaterial({ color: 0x3a3a3c, roughness: .9 })); ledge.position.set(0, 40.5, -8); scene.add(ledge);
  const g2 = new THREE.Group(); scene.add(g2);
  const tmp = new THREE.Scene(); buildCity(tmp, mulberry(9), { cars: 0, bg: 160, tall: 70 }); while (tmp.children.length) g2.add(tmp.children[0]); g2.position.set(0, 0, -30);
  addSkyGlow(scene, 0xff4a1a, 20, -320, 800);
  const fires = [makeFire(g2, new THREE.Vector3(-30, 45, -120), 9, rng), makeFire(g2, new THREE.Vector3(40, 60, -200), 12, rng), makeFire(g2, new THREE.Vector3(5, 1, -60), 4, rng)];
  const emb = makeEmbers(scene, 300, { x0: -20, w: 40, y0: 35, h: 25, z0: -60, d: 60, speed: .04, size: .2 }, rng);
  const back = new THREE.DirectionalLight(0xff8040, 1.4); back.position.set(0, 50, -60); back.castShadow = true; back.target.position.set(0, 40, 0); scene.add(back, back.target);
  const people = [];
  [[-1.6, -6.4, 0x2a3a2a], [-.5, -6.8, 0x3a2a22], [.6, -6.5, 0x1f2a3a], [1.6, -6.1, 0x3a3a3a]].forEach(([x, z, c], i) => { const p = makeHuman(rng, { zombie: false, shirt: c, pants: 0x1a1a1a }); p.position.set(x, 40, z); p.rotation.y = Math.PI + (rng() - .5) * .4; scene.add(p); people.push(p); });
  // backpacks
  people.forEach(p => { const b = new THREE.Mesh(new THREE.BoxGeometry(.34, .45, .2), new THREE.MeshStandardMaterial({ color: 0x3a3020, roughness: 1 })); b.position.set(0, .35, -.17); p.userData.torso.add(b); });
  const fl = new THREE.SpotLight(0xfff0d0, 30, 40, .25, .5); fl.position.set(1.6, 41.4, -6); fl.target.position.set(4, 30, -40); scene.add(fl, fl.target);
  const cam = persp(45);
  return {
    scene, cam, bloom: [1.0, .6, .7], update(t, d) {
      cam.position.set(lerp(-1, 1.5, t / d), 41.6, lerp(1, -2, t / d)); cam.lookAt(0, 41, -20);
      people.forEach(p => animHuman(p, t)); fires.forEach(f => f.update(t)); emb.update(t);
      fl.target.position.x = 4 + Math.sin(t * .6) * 6;
    }
  };
});

// 10: Dawn – final
S.push(() => {
  const rng = mulberry(111); const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x6a5a6a); scene.fog = new THREE.FogExp2(0xb08070, .006);
  const hemi = new THREE.HemisphereLight(0xffc8a0, 0x302830, .9); scene.add(hemi);
  const sun = new THREE.DirectionalLight(0xffb070, 3); sun.position.set(0, 25, -200); sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048); Object.assign(sun.shadow.camera, { left: -60, right: 60, top: 60, bottom: -60, far: 400 }); scene.add(sun);
  buildCity(scene, rng, { cars: 8, lit: .2 });
  const sky = canvasTex(16, 512, (g, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#2a3050'); gr.addColorStop(.5, '#a06070'); gr.addColorStop(.75, '#f0a070'); gr.addColorStop(1, '#ffd0a0'); g.fillStyle = gr; g.fillRect(0, 0, w, h); });
  scene.background = sky;
  const sunS = new THREE.Sprite(new THREE.SpriteMaterial({ map: softTex, color: 0xffd090, blending: THREE.AdditiveBlending, transparent: true, depthWrite: false, fog: false })); sunS.scale.set(160, 160, 1); scene.add(sunS);
  const core = new THREE.Sprite(new THREE.SpriteMaterial({ map: softTex, color: 0xffffff, blending: THREE.AdditiveBlending, transparent: true, depthWrite: false, fog: false })); core.scale.set(30, 30, 1); scene.add(core);
  const smoke = makeFire(scene, new THREE.Vector3(30, 40, -200), 8, rng);
  const emb = makeEmbers(scene, 200, { x0: -20, w: 40, y0: 0, h: 30, z0: -60, d: 60, speed: .02, size: .12 }, rng, 0xffe0b0);
  const cam = persp(50);
  return {
    scene, cam, bloom: [.9, .7, .8], update(t, d) {
      const k = ease(clamp(t / d));
      cam.position.set(0, lerp(2, 30, k), lerp(10, -10, k)); cam.lookAt(0, lerp(4, 12, k), -120);
      const sy = lerp(-10, 30, k); sunS.position.set(0, sy, -400); core.position.set(0, sy, -399); sun.position.set(0, sy + 10, -200);
      sun.intensity = lerp(1.2, 3.5, k); renderer.toneMappingExposure = lerp(.8, 1.15, k);
      smoke.update(t); emb.update(t);
    }
  };
});

// ---------- timeline / overlays ----------
const sceneStart = TL.map((s, i) => i === 0 ? 0 : s.start - .3);
const total = 90;
const tags = ['', 'CURIOSIDADE #1', 'CURIOSIDADE #2', 'CURIOSIDADE #3', 'DICA 1 · ÁGUA', 'DICA 2 · MULTIDÕES', 'DICA 3 · ABRIGO', 'DICA 4 · SILÊNCIO', 'DICA 5 · KIT', 'DICA 6 · GRUPO', ''];
const capEl = document.getElementById('cap'), tagEl = document.getElementById('tag'), bigEl = document.getElementById('big'), fadeEl = document.getElementById('fade'), titleEl = document.getElementById('title'), barEl = document.querySelector('#bar i');
let bigSet = false;
function setBig(a, b) { bigSet = true; const h = `<div class="l1">${a}</div><div class="l2">${b}</div>`; if (bigEl.innerHTML !== h) bigEl.innerHTML = h; }

// word chunks for captions
const chunks = [];
TL.forEach(s => {
  const words = s.text.split(/\s+/); const tot = words.reduce((a, w) => a + w.length + 2, 0);
  let t = s.start; const dur = s.end - s.start; const wt = words.map(w => { const d = dur * (w.length + 2) / tot; const o = { w, a: t, b: t + d }; t += d; return o; });
  let cur = [];
  wt.forEach((o, i) => { cur.push(o); const L = cur.reduce((a, x) => a + x.w.length, 0); if (cur.length >= 3 || L > 13 || /[.,?:!]$/.test(o.w) || i === wt.length - 1) { chunks.push(cur); cur = []; } });
});

const built = [];
let lastCap = '';
window.renderAt = function (t) {
  let si = 0; for (let i = 0; i < sceneStart.length; i++) if (t >= sceneStart[i]) si = i;
  if (!built[si]) built[si] = S[si]();
  const sc = built[si]; const t0 = sceneStart[si]; const t1 = si + 1 < sceneStart.length ? sceneStart[si + 1] : total;
  renderer.toneMappingExposure = 1.0; bigSet = false;
  sc.update(t - t0, t1 - t0);
  renderPass.scene = sc.scene; renderPass.camera = sc.cam;
  bloom.strength = sc.bloom[0]; bloom.radius = sc.bloom[1]; bloom.threshold = sc.bloom[2];
  gradePass.uniforms.time.value = t;
  composer.render();
  // free previous scenes
  for (let i = 0; i < si; i++) if (built[i]) { built[i].scene.traverse(o => { o.geometry?.dispose?.(); }); built[i] = null; S[i] = null; }
  // overlays
  const fin = smooth(t0, t0 + .35, t), fout = 1 - smooth(t1 - .3, t1, t);
  fadeEl.style.opacity = (1 - Math.min(fin, fout) * (t < .01 ? 0 : 1)).toFixed(3);
  if (si === 0) fadeEl.style.opacity = (1 - Math.min(smooth(0, .8, t), fout)).toFixed(3);
  if (t > total - 1.2) fadeEl.style.opacity = smooth(total - 1.2, total, t).toFixed(3);
  const tg = tags[si]; const tgH = tg ? `<div>${tg}</div>` : ''; if (tagEl.innerHTML !== tgH) tagEl.innerHTML = tgH;
  tagEl.style.opacity = smooth(t0 + .2, t0 + .6, t);
  if (!bigSet) bigEl.innerHTML = '';
  bigEl.style.opacity = smooth(t0 + .5, t0 + 1, t);
  bigEl.style.transform = `scale(${lerp(.9, 1, smooth(t0 + .5, t0 + 1, t))})`;
  // title (hook + final)
  let title = '';
  if (t < 4.2) title = 'E SE HOUVESSE UM<br><em>APOCALIPSE<br>ZUMBI?</em>';
  if (t > TL[10].end - 0.2) title = 'ESTAR PREPARADO<br>NUNCA É<br><em>EXAGERO</em>';
  if (titleEl.innerHTML !== title) titleEl.innerHTML = title;
  titleEl.style.opacity = t < 4.2 ? smooth(.3, .9, t) * (1 - smooth(3.7, 4.2, t)) : smooth(TL[10].end - .2, TL[10].end + .4, t);
  // captions
  let c = null; for (const ch of chunks) if (t >= ch[0].a - .05 && t <= ch[ch.length - 1].b + .25) c = ch;
  const html = c ? c.map(o => `<span class="${t >= o.a && t < o.b + .05 ? 'on' : ''}">${o.w}</span>`).join(' ') : '';
  if (html !== lastCap) { capEl.innerHTML = html; lastCap = html; }
  capEl.style.display = (t < 4.2 || t > TL[10].end - .2) && si !== 0 && si !== 10 ? '' : '';
  barEl.style.width = (t / total * 100).toFixed(2) + '%';
  return si;
};
window.ready = true;

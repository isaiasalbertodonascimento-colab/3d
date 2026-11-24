// Roteiro, câmera e render do vídeo "Caramelo-raptor".
import * as THREE from './lib/three.module.js';
import { buildWorld } from './world.js';
import { FurBody } from './fur.js';
import { dogRig, defaultPose, gait, DogParts } from './dog.js';
import { Cat } from './cat.js';
import { Post } from './post.js';

const Wd = innerWidth, Hd = innerHeight;
const R = new THREE.WebGLRenderer({ antialias: false, preserveDrawingBuffer: true }); R.setPixelRatio(1); R.setSize(Wd, Hd);
R.shadowMap.enabled = true; R.shadowMap.type = THREE.PCFSoftShadowMap; R.toneMapping = THREE.NoToneMapping;
document.getElementById('v').appendChild(R.domElement);
const scene = new THREE.Scene();
const W = buildWorld(scene);
// ambiente refletido (céu) para materiais brilhosos
const pm = new THREE.PMREMGenerator(R); const envScene = new THREE.Scene(); envScene.add(W.sky.clone());
scene.environment = pm.fromScene(envScene, .02, 1, 2000).texture; scene.environmentIntensity = .55;
const cam = new THREE.PerspectiveCamera(30, Wd / Hd, .03, 1500);
const post = new Post(R, Wd, Hd);

const dogG = new THREE.Group(); scene.add(dogG);
const fur = new FurBody(dogG), parts = new DogParts(dogG);
const cat = new Cat(scene);
const ball = new THREE.Mesh(new THREE.SphereGeometry(.036, 32, 20), new THREE.MeshPhysicalMaterial({ color: '#d42a1e', roughness: .45, clearcoat: .4 })); ball.castShadow = true; scene.add(ball);

// ---------- utilidades
const cl = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const ss = (a, b, x) => { const t = cl((x - a) / (b - a)); return t * t * (3 - 2 * t); };
const mix = (a, b, t) => a + (b - a) * t;
const mixv = (a, b, t) => a.map((v, i) => v + (b[i] - v) * t);
const key = (t, ks) => { if (t <= ks[0][0]) return ks[0][1]; for (let i = 1; i < ks.length; i++) if (t <= ks[i][0]) { const [t0, v0] = ks[i - 1], [t1, v1] = ks[i]; return mix(v0, v1, ss(t0, t1, t)); } return ks[ks.length - 1][1]; };
const blink = (t, at) => at.reduce((m, a) => Math.max(m, 1 - cl(Math.abs(t - a) / .09)), 0);
const nz = (t, s) => Math.sin(t * 13.1 + s) * .5 + Math.sin(t * 23.7 + s * 2) * .3 + Math.sin(t * 41.3 + s * 3) * .2;
const yawTo = (dx, dz) => Math.atan2(-dz, dx);
const pant = (P, t, k = 1) => { P.jaw = .3 + .12 * Math.sin(t * 15) * k; P.tongue = .75; };
const wag = (P, t, a = .6, f = 14) => { P.tailPh = t * f; P.tailWag = a; };

// bola
const ballAt = t => {
  if (t < 8.6) return null;
  if (t < 9.05) { const u = (t - 8.6) / .45; return [mix(5, 1.3, u), mix(2.8, .156, u) + Math.sin(u * Math.PI) * .6, mix(2.5, -.4, u)]; }
  if (t < 9.55) { const u = (t - 9.05) / .5; return [mix(1.3, 3.9, u), .156 + Math.sin(u * Math.PI) * .42, mix(-.4, -.5, u)]; }
  if (t < 9.8) { const u = (t - 9.55) / .25; return [mix(3.9, 4.9, u), .156 + Math.sin(u * Math.PI) * .1, -.5]; }
  const u = cl((t - 9.8) / 1.5); return [mix(4.9, 7.95, 1 - (1 - u) * (1 - u)), .156, -.5];
};

// ---------- planos
const SH = [];
const shot = (t0, t1, f) => SH.push({ t0, t1, f });
// A1: chegada pela calçada, contraluz
shot(0, 2.2, (u, t) => {
  const x = -5.5 + 1.1 * t, P = gait(defaultPose(), t * 1.9, 1.1); pant(P, t); wag(P, t, .5, 10);
  P.headY = .1 * Math.sin(t * 2); P.blink = blink(t, [1.3]);
  return { dog: [x, -.55, 0, P], cam: { p: [.3 - .3 * u, .3, -.2], look: 'head', fov: 26 }, ap: .03, res: .013 };
});
// A2: travelling lateral
shot(2.2, 4.4, (u, t) => {
  const x = -5.5 + 1.1 * t, P = gait(defaultPose(), t * 1.9, 1.1); pant(P, t); wag(P, t, .65, 12);
  P.headY = key(t, [[3.1, 0], [3.5, -.55]]); P.headR = key(t, [[3.4, 0], [3.8, -.15]]); P.blink = blink(t, [4.0]);
  return { dog: [x, -.55, 0, P], cam: { p: [x + 1.0 + .2 * u, .55, 1.55], look: [x + .25, .62, -.55], fov: 34 }, ap: .02, res: .012 };
});
// B1: close do rosto, inclinando a cabeça
shot(4.4, 6.6, (u, t) => {
  const x = -.66 + .38 * (1 - Math.exp(-(t - 4.4) * 5)), P = defaultPose(); wag(P, t, .55, 11);
  P.headR = key(t, [[4.7, 0], [4.95, .42], [5.5, .42], [5.75, -.38], [6.6, -.38]]);
  P.earPerk = key(t, [[4.7, .5], [4.95, 1], [5.5, .7], [5.75, 1]]);
  P.headP = -.1; P.blink = blink(t, [5.3]); P.jaw = key(t, [[5.9, .08], [6.1, .35]]); P.tongue = key(t, [[5.9, 0], [6.15, .9]]);
  if (t > 6.1) P.jaw += .08 * Math.sin(t * 15);
  return { dog: [x, -.55, 0, P], cam: { p: [x + 1.75 - .2 * u, 1.02, -.42], look: 'head', fov: 30 }, ap: .022, res: .0095 };
});
// B2: macro dos pés com garra batendo
shot(6.6, 8.6, (u, t) => {
  const x = -.28, P = defaultPose(); pant(P, t); wag(P, t, .55, 11);
  P.tap[0] = Math.pow(Math.abs(Math.sin((t - 6.6) * Math.PI * 2.2)), .6) * 1.1;
  return { focusP: [x + .12, .17, -.66], dog: [x, -.55, 0, P], cam: { p: [x + .7 - .08 * u, .27, -.32 - .08 * u], look: [x + .1, .19, -.66], fov: 40 }, ap: .02, res: .0095 };
});
// C1: bola chega — over the shoulder + zoom punch
shot(8.6, 9.8, (u, t) => {
  const x = -.28, P = defaultPose(); wag(P, t, .8, 16);
  const b = ballAt(t), hx = x + .5, hz = -.55; P.headY = cl(Math.atan2(-(b[2] - hz), b[0] - hx), -.8, .8); P.headP = cl(Math.atan2(b[1] - 1.0, Math.hypot(b[0] - hx, b[2] - hz)), -.8, .5);
  P.earPerk = 1; P.jaw = .12; P.tongue = 0;
  const cr = ss(9.3, 9.6, t); P.hipY -= .09 * cr; P.pitch -= .2 * cr; P.neckA -= .35 * cr;
  const fov = mix(42, 32, ss(9.12, 9.24, t));
  return { dog: [x, -.55, 0, P], cam: { p: [x - 1.0, 1.3, -.05], look: [2.2, .35, -.5], fov }, ap: .012, res: .011, shake: ss(9.12, 9.2, t) * (1 - ss(9.25, 9.5, t)) * .015 };
});
// C2: corrida estilo raptor
const runX = t => { const s = cl((t - 9.8) / 1.8); return -.28 + 7.6 * (s < .7 ? (s / .7) * (s / .7) * .55 + 0 : .55 + (1 - Math.pow(1 - (s - .7) / .3, 2)) * .45); };
shot(9.8, 11.6, (u, t) => {
  const x = runX(t), sp = (runX(t + .02) - runX(t - .02)) / .04, P = gait(defaultPose(), t * 3.1, Math.min(sp, 6), sp > 1.5 ? 'run' : 'walk');
  P.pitch = mix(.45, .12, cl(sp / 3)); P.neckA = mix(1.1, .55, cl(sp / 3)); P.headP = mix(-.14, -.02, cl(sp / 3)); P.tailLift = mix(.25, -.05, cl(sp / 3)); P.tailWag = .25; P.tailPh = t * 9;
  P.jaw = .55 + .15 * Math.sin(t * 20); P.tongue = 1; P.earPerk = 0; P.earFlop = .6 * Math.sin(t * 19.5);
  if (t > 11.3) { P.jaw = .28; P.tongue = 0; }
  return { dog: [x, -.5, 0, P], cam: { p: [x - 1.1, .55, 2.6], look: [x + .35, .45, -.5], fov: 40 }, ap: .008, res: .012, whip: t < 10.0 ? [.05 * (1 - (t - 9.8) / .2), 0] : null, holdBall: t > 11.3 };
});
// C3: volta orgulhoso com a bola na boca
shot(11.6, 13.2, (u, t) => {
  const x = 7.75 - .85 * (t - 11.6), P = gait(defaultPose(), t * 1.9, .85); wag(P, t, .9, 17);
  P.jaw = .28; P.tongue = 0; P.neckA = 1.25; P.headP = .02; P.earPerk = .9; P.blink = blink(t, [12.5]);
  return { dog: [x, -.55, Math.PI, P], cam: { p: [4.85 + .25 * u, .62, -.35], look: 'head', fov: 36 }, ap: .02, res: .011, holdBall: true };
});
// D1/D2: tentativa de coçar a orelha com bracinho curto
const dD = [6.3, -.75, Math.PI + .55];
const scratchPose = (t, k) => {
  const P = defaultPose(); P.hipY = .3; P.pitch = .6; P.feet = [[.13, .025, -.13], [.13, .025, .13]]; P.mt = [1, 1];
  P.headR = -.32 * k; P.headY = -.2 * k; P.squint = .7 * k; P.jaw = .18; P.tongue = .6; P.neckA = 1.15; P.tailWag = .2; P.tailPh = t * 5; P.tailLift = -.15;
  return P;
};
const withArm = (P, t, amt) => {
  const E = dogRig(P); const ear = E.head.hf(-.035, .08, -.066);
  P.arms = [null, null];
  const S = [P.bodyX + .4 * Math.cos(P.pitch) - .05, P.hipY + .4 * Math.sin(P.pitch) - .08, -.085];
  const rest = [S[0] + .11, S[1] - .1, -.075];
  const reach = [mix(S[0] + .2, ear[0], .55), Math.min(ear[1] - .07, S[1] + .2), mix(-.085, ear[2], .5)];
  const T = mixv(rest, reach, amt); T[1] += Math.sin(t * 42) * .025 * amt; T[0] += Math.cos(t * 42) * .012 * amt;
  P.arms = [T, [S[0] + .11, S[1] - .1, .075]];
  return P;
};
shot(13.2, 15.4, (u, t) => {
  const k = ss(13.3, 13.7, t), P = withArm(scratchPose(t, k), t, ss(13.6, 13.9, t));
  const d = [Math.cos(dD[2]), -Math.sin(dD[2])];
  return { dog: [dD[0], dD[1], dD[2], P], cam: { p: [dD[0] - 1.1 + .1 * u, .8, dD[1] + 1.25 - .1 * u], look: 'head', fov: 36 }, ap: .02, res: .0105 };
});
shot(15.4, 17.0, (u, t) => {
  const give = ss(16.25, 16.4, t), P = withArm(scratchPose(t, 1), t, 1 - give);
  if (t > 16.3) { const s = cl((t - 16.3) / .6); P.headY = .55 * Math.sin(s * 30) * (1 - s); P.headR = -.32 * (1 - s) + .3 * Math.sin(s * 30) * (1 - s); P.earFlop = .8 * Math.abs(Math.sin(s * 30)) * (1 - s); P.squint = .9 * (1 - s); }
  return { dog: [dD[0], dD[1], dD[2], P], cam: { p: [dD[0] - 1.0 + .08 * u, 1.0, dD[1] + 1.05], look: 'head', fov: 32 }, ap: .03, res: .0095 };
});
// E: o gato no muro
const CAT = [7.25, 1.98, -1.88];
const dE = [6.65, -1.02, yawTo(.6, -.86)];
shot(17.0, 18.6, (u, t) => {
  const P = defaultPose(); P.headP = .5; P.neckA = 1.35;
  return { dog: [dE[0], dE[1], dE[2], P], cat: { headP: -.45, headY: -.35, blink: blink(t, [17.9]) }, cam: { p: [6.55, .9, -.35], look: [CAT[0], CAT[1] + .25, CAT[2]], fov: mix(32, 27, u) }, focus: 'cat', ap: .025, res: .013 };
});
const roarPose = (t, k, au) => {
  const P = defaultPose(); P.pitch = mix(.45, 1.0, k); P.hipY = mix(.56, .5, k); P.neckA = mix(1.2, 1.55, k); P.headP = mix(.3, .65, k);
  P.jaw = au ?? ss(19.3, 19.75, t); P.tongue = 0; P.earPerk = mix(.5, 0, k); P.earFlop = -.3 * k;
  P.tailLift = mix(.25, -.1, k); P.tailWag = .1; P.tailPh = t * 3; P.squint = .4 * P.jaw;
  const S = [P.bodyX + .4 * Math.cos(P.pitch), P.hipY + .4 * Math.sin(P.pitch) - .08];
  P.arms = [[S[0] + mix(.11, .14, k), S[1] + mix(-.1, .08, k), -.11], [S[0] + mix(.11, .14, k), S[1] + mix(-.1, .08, k), .11]];
  return P;
};
shot(18.6, 20.2, (u, t) => {
  const k = ss(18.7, 19.4, t), P = roarPose(t, k);
  const d = [Math.cos(dE[2]), -Math.sin(dE[2])];
  return { dog: [dE[0], dE[1], dE[2], P], cam: { p: [dE[0] + 1.45, .3, -1.35], look: 'head', fov: mix(46, 34, ss(18.6, 20.1, t)) }, ap: .015, res: .0105, shake: ss(19.0, 20.1, t) * .02 };
});
shot(20.2, 20.8, (u, t) => {
  const j = t < 20.3 ? mix(1, .25, ss(20.2, 20.27, t)) : mix(.25, .05, ss(20.32, 20.5, t));
  const P = roarPose(t, 1, j); P.headP = mix(.65, .35, ss(20.4, 20.8, t)); P.earFlop = mix(-.3, .5, ss(20.35, 20.6, t)); P.squint = 0; P.blink = blink(t, [20.6]);
  const d = [Math.cos(dE[2]), -Math.sin(dE[2])];
  return { dog: [dE[0], dE[1], dE[2], P], cam: { p: [dE[0] + 1.05, .7, -1.4], look: 'head', fov: 32 }, ap: .02, res: .0095 };
});
shot(20.8, 21.6, (u, t) => {
  const P = roarPose(t, 1, .05); P.earFlop = .5;
  return { dog: [dE[0], dE[1], dE[2], P], cat: { headP: -.4, headY: mix(-.3, .25, ss(21.2, 21.5, t)), blink: t > 21.0 && t < 21.4 ? ss(21.0, 21.2, t) * .9 : 0 }, cam: { p: [CAT[0] + .25, 2.15, CAT[2] + 1.05 - .08 * u], look: [CAT[0], CAT[1] + .22, CAT[2]], fov: 34 }, focus: 'cat', ap: .02, res: .013 };
});
// F: pôr do sol na grama
const dF = [15.5, .5, Math.PI];
const lyingPose = (t, lift) => {
  const P = defaultPose(); P.hipY = .2; P.pitch = .03; P.feet = [[.13, .025, -.18], [.13, .025, .18]]; P.mt = [1, 1];
  const C = [P.bodyX + .4, P.hipY + .012];
  P.arms = [[C[0] + .26, .035, -.09], [C[0] + .26, .035, .09]];
  P.neckA = mix(.5, 1.0, lift); P.headP = mix(-.3, -.05, lift);
  P.tailLift = -.25; P.tailWag = .15; P.tailWagV = .9; P.tailPh = t * 9; P.tailCurl = .02;
  return P;
};
shot(21.6, 24.0, (u, t) => {
  const P = lyingPose(t, 0); P.blink = blink(t, [22.6, 23.5]); P.jaw = .05; P.tongue = 0;
  return { dog: [dF[0], dF[1], dF[2], P], cam: { p: [18.3 - .6 * u, .5, -.45 + .1 * u], look: [12.0, 1.05, 1.3], fov: 38 }, focusDog: true, ap: .012, res: .012, bloom: .8 };
});
shot(24.0, 26.0, (u, t) => {
  const l = ss(24.3, 24.8, t), P = lyingPose(t, l); P.earPerk = mix(.4, 1, l); pant(P, t, l); if (t < 24.4) { P.jaw = .05; P.tongue = 0; } P.blink = blink(t, [25.3]);
  P.headR = key(t, [[25.0, 0], [25.4, .25]]);
  return { dog: [dF[0], dF[1], dF[2], P], cam: { p: [14.0 - .12 * u, .4, .85 - .05 * u], look: 'head', fov: 30 }, ap: .03, res: .0095 };
});
const TOTAL = 26.0;

// ---------- legendas
const CAP = [
  [0.2, 4.4, 'ADOTEI UM VIRA-LATA <b>CARAMELO</b>'],
  [4.5, 6.6, 'O VETERINÁRIO DISSE QUE ELE É <b>“MISTURA”</b>'],
  [6.6, 8.6, 'MISTURA DE <b>QUÊ</b>, DOUTOR?'],
  [8.7, 11.6, 'HORA DA <b>BOLINHA!</b>'],
  [11.6, 13.2, '<b>ENTREGA</b> EXPRESSA'],
  [13.3, 17.0, 'COÇAR A ORELHA VIROU <b>MISSÃO IMPOSSÍVEL</b>'],
  [17.1, 20.2, 'AÍ ELE TENTOU <b>RUGIR</b> PRO GATO...'],
  [20.25, 21.6, '...E SAIU UM <b>“AU”</b>'],
  [21.7, 24.0, 'MAS NO FUNDO É SÓ UM <b>CARAMELO</b>'],
  [24.1, 26.0, 'VOCÊ <b>ADOTARIA</b>?'],
];
const capEl = document.getElementById('cap');

// ---------- render de um quadro
const tmp = new THREE.Vector3();
let lastRes = 0;
window.render = t => {
  const S = SH.find(s => t >= s.t0 && t < s.t1) || SH[SH.length - 1];
  const u = cl((t - S.t0) / (S.t1 - S.t0)), o = S.f(u, t);
  const [dx, dz, dyaw, P] = o.dog;
  const gy = (dx > 10 && dx < 24 && dz > .1) ? .14 : .12;
  dogG.position.set(dx, gy, dz); dogG.rotation.y = dyaw; dogG.updateMatrixWorld(true);
  const _t0 = performance.now(); const E = dogRig(P); fur.update(E.prims, o.res); parts.update(E, P); window._mesh = performance.now() - _t0;
  const headW = new THREE.Vector3(...E.head.hf(.06, 0, 0)).applyMatrix4(dogG.matrixWorld);
  // bola
  const b = ballAt(t);
  if (o.holdBall) { const J = E.jaw; const m = [J.o[0] + J.f[0] * .13 + J.u[0] * .04, J.o[1] + J.f[1] * .13 + J.u[1] * .04, J.o[2] + J.f[2] * .13]; ball.position.set(...m).applyMatrix4(dogG.matrixWorld); ball.visible = true; }
  else if (b) { ball.position.set(...b); ball.visible = true; ball.rotation.z = -t * 9; } else ball.visible = false;
  // gato
  const showCat = !!o.cat || (t > 16.9 && t < 21.7);
  cat.g.visible = showCat;
  if (showCat) { cat.g.position.set(...CAT); cat.g.rotation.y = -Math.PI / 2; cat.update(Object.assign({ t, headP: -.4, headY: -.3, blink: 0 }, o.cat || {})); }
  // câmera
  const look = o.cam.look === 'head' ? headW : new THREE.Vector3(...o.cam.look);
  cam.position.set(...o.cam.p);
  const sh = o.shake || 0; cam.position.x += nz(t, 1) * sh; cam.position.y += nz(t, 2) * sh;
  cam.lookAt(look); cam.fov = o.cam.fov; cam.updateProjectionMatrix();
  const focusP = o.focusP ? new THREE.Vector3(...o.focusP) : o.focus === 'cat' ? new THREE.Vector3(CAT[0], CAT[1] + .25, CAT[2]) : headW;
  W.aimSun(o.focus === 'cat' ? CAT[0] : dx, 0, o.focus === 'cat' ? CAT[2] : dz, o.focus === 'cat' ? 4 : 3.5);
  W.grass.visible = cam.position.x > 8.5;
  W.update(t);
  const _t1 = performance.now(); post.render(scene, cam, { focus: cam.position.distanceTo(focusP), aperture: o.ap, t, whip: o.whip, exposure: 1.05, bloom: o.bloom ?? .55 });
  // legenda
  const c = CAP.find(c => t >= c[0] && t < c[1]);
  if (c) { const k = cl((t - c[0]) / .12); capEl.innerHTML = c[2]; capEl.style.opacity = 1; capEl.style.transform = `translate(-50%,0) scale(${.85 + .15 * (1 - Math.pow(1 - k, 3)) + (k < 1 ? .06 * Math.sin(k * Math.PI) : 0)})`; }
  else capEl.style.opacity = 0;
  return S.t0;
};
window.__ = { scene, post, R, W, fur, cam };
window.INFO = { total: TOTAL, cuts: SH.map(s => s.t0) };
document.fonts.ready.then(() => { window.READY = true; });

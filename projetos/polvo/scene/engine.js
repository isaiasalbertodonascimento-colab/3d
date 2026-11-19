// Motor do curta: lê ../timeline.json, troca de cena a cada "shot", move a câmera,
// aplica zoom de impacto + tremida, e desenha legendas karaokê, etiqueta e títulos.
// Não edite por projeto: as cenas ficam em scenes.js.
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { clamp, smooth, lerp, ease, mulberry } from './lib.js';

export const W = 720, H = 1280;

export async function boot(SCENES) {
  const TL = await (await fetch('../timeline.json', { cache: 'no-store' })).json();
  const wrap = document.getElementById('wrap');
  const stage = document.getElementById('stage');

  const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
  renderer.setPixelRatio(1);
  renderer.setSize(W, H);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.localClippingEnabled = true; // cortes anatômicos (cutaway) usam clipping planes
  stage.appendChild(renderer.domElement);
  const env = new THREE.PMREMGenerator(renderer).fromScene(new RoomEnvironment(), 0.04).texture;

  const composer = new EffectComposer(renderer);
  const renderPass = new RenderPass(new THREE.Scene(), new THREE.PerspectiveCamera());
  composer.addPass(renderPass);
  const bloom = new UnrealBloomPass(new THREE.Vector2(W, H), 0.35, 0.5, 0.85);
  composer.addPass(bloom);
  composer.addPass(new OutputPass());
  // vinheta + grão leve: dá o acabamento "render de estúdio"
  const grade = new ShaderPass({
    uniforms: { tDiffuse: { value: null }, time: { value: 0 } },
    vertexShader: 'varying vec2 vUv; void main(){vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
    fragmentShader: `uniform sampler2D tDiffuse; uniform float time; varying vec2 vUv;
      float h(vec2 p){return fract(sin(dot(p,vec2(12.9898,78.233)))*43758.5453);}
      void main(){ vec2 d=vUv-.5; vec3 c=texture2D(tDiffuse,vUv).rgb;
        c*=mix(1.,smoothstep(1.0,.3,length(d)),.55);
        c+=(h(vUv*vec2(720.,1280.)+fract(time*7.13)*100.)-.5)*.025;
        gl_FragColor=vec4(c,1.);}`
  });
  composer.addPass(grade);

  const shots = TL.shots;
  const beats = TL.beats;
  const total = TL.total;

  // ---- legendas: palavras com tempo proporcional ao tamanho, em blocos de até 3 ----
  const chunks = [];
  for (const b of beats) for (const s of b.sentences) {
    const words = s.text.split(/\s+/).filter(Boolean);
    const tot = words.reduce((a, w) => a + w.length + 2, 0);
    let t = s.start; const dur = s.end - s.start;
    const wt = words.map(w => { const d = dur * (w.length + 2) / tot; const o = { w, a: t, b: t + d }; t += d; return o; });
    let cur = [];
    wt.forEach((o, i) => {
      cur.push(o);
      const L = cur.reduce((a, x) => a + x.w.length, 0);
      if (cur.length >= 3 || L > 14 || /[.,?:!;…]$/.test(o.w) || i === wt.length - 1) { chunks.push(cur); cur = []; }
    });
  }

  const capEl = document.getElementById('cap'), tagEl = document.getElementById('tag'),
    titleEl = document.getElementById('title'), flashEl = document.getElementById('flash'),
    fadeEl = document.getElementById('fade'), barEl = document.querySelector('#bar i');
  const titles = TL.titulos || {};
  const built = [];
  let lastCap = null, lastTag = null, lastTitle = null;

  function build(i) {
    const sh = shots[i];
    const fn = SCENES[sh.cena];
    if (!fn) throw new Error(`Cena "${sh.cena}" (shot ${i}) não existe em scenes.js. Disponíveis: ${Object.keys(SCENES).join(', ')}`);
    const sc = fn({ THREE, env, W, H, shot: sh, args: sh.args || {}, rng: mulberry(1000 + i * 77) });
    if (!sc.cam) { sc.cam = new THREE.PerspectiveCamera(sc.rig?.fov ?? 40, W / H, 0.01, 500); }
    return sc;
  }

  // movimentos de câmera genéricos, aplicados quando a cena devolve "rig"
  function applyMove(cam, move, k, rig, t) {
    const tg = rig.target || new THREE.Vector3();
    let dist = rig.dist ?? 4, yaw = rig.yaw ?? 0, pitch = rig.pitch ?? 0.15, dy = 0;
    const e = ease(k);
    switch (move) {
      case 'push_in': dist *= lerp(1.25, 0.8, e); break;
      case 'pull_out': dist *= lerp(0.8, 1.25, e); break;
      case 'pan_left': yaw += lerp(0.35, -0.35, e); break;
      case 'pan_right': yaw += lerp(-0.35, 0.35, e); break;
      case 'tilt_down': pitch += lerp(0.35, -0.1, e); dy = lerp(0.3, -0.2, e) * dist * 0.2; break;
      case 'tilt_up': pitch += lerp(-0.1, 0.35, e); dy = lerp(-0.2, 0.3, e) * dist * 0.2; break;
      case 'orbit': yaw += lerp(-0.6, 0.6, e); break;
      default: dist *= 1 - 0.04 * k; yaw += Math.sin(t * 0.5) * 0.02; // static: respiração leve
    }
    cam.position.set(
      tg.x + dist * Math.sin(yaw) * Math.cos(pitch),
      tg.y + dist * Math.sin(pitch) + dy,
      tg.z + dist * Math.cos(yaw) * Math.cos(pitch));
    cam.lookAt(tg.x, tg.y + dy * 0.5, tg.z);
    if (rig.fov) { cam.fov = rig.fov; cam.updateProjectionMatrix(); }
  }

  window.TOTAL = total;
  window.FPS = TL.fps || 30;
  window.renderAt = function (t) {
    let si = 0; for (let i = 0; i < shots.length; i++) if (t >= shots[i].start) si = i;
    if (!built[si]) built[si] = build(si);
    for (let i = 0; i < si; i++) if (built[i]) { built[i].scene.traverse(o => { o.geometry?.dispose?.(); }); built[i] = null; }
    const sh = shots[si], sc = built[si];
    const lt = t - sh.start, d = sh.end - sh.start, k = clamp(lt / d);
    renderer.toneMappingExposure = sc.exposure ?? 1.0;
    sc.update?.(lt, d, k, t);
    if (sc.rig) applyMove(sc.cam, sh.camera || 'static', k, sc.rig, lt);
    renderPass.scene = sc.scene; renderPass.camera = sc.cam;
    const bl = sc.bloom || [0.35, 0.5, 0.85];
    bloom.strength = bl[0]; bloom.radius = bl[1]; bloom.threshold = bl[2];
    grade.uniforms.time.value = t;
    composer.render();

    // zoom de impacto + tremida no começo do shot; cortes secos entre shots
    let scale = 1, dx = 0, dy = 0, flash = 0;
    if (sh.impacto) {
      const p = clamp(lt / 0.45);
      scale = lerp(1.14, 1.0, ease(p)) + 0.03 * k;
      const amp = 14 * (1 - p);
      dx = Math.sin(lt * 90) * amp; dy = Math.cos(lt * 71) * amp;
      flash = 0.55 * (1 - clamp(lt / 0.12));
    }
    stage.style.transform = `translate(${dx.toFixed(1)}px,${dy.toFixed(1)}px) scale(${scale.toFixed(4)})`;
    flashEl.style.opacity = flash.toFixed(3);
    fadeEl.style.opacity = (Math.max(1 - smooth(0, 0.5, t), smooth(total - 0.8, total, t))).toFixed(3);

    // etiqueta do beat (ex.: "MITO", "FATO #1")
    let bi = 0; for (let i = 0; i < beats.length; i++) if (t >= beats[i].start - 0.2) bi = i;
    const tg = beats[bi]?.tag || '';
    const tagH = tg ? `<div>${tg}</div>` : '';
    if (tagH !== lastTag) { tagEl.innerHTML = tagH; lastTag = tagH; }
    tagEl.style.opacity = smooth(beats[bi].start - 0.2, beats[bi].start + 0.15, t).toFixed(3);

    // título de gancho (início) e de fechamento (fim)
    let title = '', op = 0;
    const hookEnd = Math.min(beats[0].end, (titles.gancho_dur ?? 3.2) + TL.lead);
    const last = beats[beats.length - 1];
    if (titles.gancho && t < hookEnd + 0.3) { title = titles.gancho; op = smooth(0.15, 0.5, t) * (1 - smooth(hookEnd, hookEnd + 0.3, t)); }
    if (titles.final && t > last.end - 0.1) { title = titles.final; op = smooth(last.end - 0.1, last.end + 0.3, t); }
    if (title !== lastTitle) { titleEl.innerHTML = title; lastTitle = title; }
    titleEl.style.opacity = op.toFixed(3);
    titleEl.style.transform = `scale(${lerp(0.85, 1, smooth(0, 0.35, op)).toFixed(3)})`;

    // legenda karaokê
    let c = null; for (const ch of chunks) if (t >= ch[0].a - 0.05 && t <= ch[ch.length - 1].b + 0.2) c = ch;
    const html = c ? c.map(o => `<span class="${t >= o.a && t < o.b + 0.05 ? 'on' : ''}">${o.w}</span>`).join(' ') : '';
    if (html !== lastCap) { capEl.innerHTML = html; lastCap = html; }
    barEl.style.width = (t / total * 100).toFixed(2) + '%';
    return si;
  };
  window.ready = true;
}

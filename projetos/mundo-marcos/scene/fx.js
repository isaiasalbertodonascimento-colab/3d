// Utilidades visuais (placas de texto, HUD preso na câmera, espaço, anel neon, Terra)
import * as THREE from 'three';
import { studio, blob, clay, glow, particles, V } from './lib.js';
// ---------- utilidades ----------
export function placa(txt, cor = '#ffd43b', w = 2) {
  const c = document.createElement('canvas'); c.width = 1024; c.height = 256; const g = c.getContext('2d');
  const desenha = (s) => {
    g.clearRect(0, 0, 1024, 256); let fs = 200;
    do { g.font = `900 ${fs}px Anton, Impact, sans-serif`; fs -= 8; } while (g.measureText(s).width > 960 && fs > 40);
    g.textAlign = 'center'; g.textBaseline = 'middle'; g.lineJoin = 'round';
    g.lineWidth = 26; g.strokeStyle = '#000'; g.strokeText(s, 512, 136); g.fillStyle = cor; g.fillText(s, 512, 136);
  };
  desenha(txt);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, w / 4), new THREE.MeshBasicMaterial({ map: t, transparent: true, toneMapped: false, depthTest: false }));
  m.renderOrder = 10; let atual = txt;
  m.userData.set = s => { if (s !== atual) { atual = s; desenha(s); t.needsUpdate = true; } };
  return m;
}
export function camHud(ctx, fov) { return new THREE.PerspectiveCamera(fov, ctx.W / ctx.H, 0.01, 500); }
// número/frase presa na tela: y em unidades a 3 m da câmera (0.35 ≈ terço de cima)
export function hud(cam, txt, cor = '#ffd43b', y = 0.35, w = 1.05, x = 0) { const p = placa(txt, cor, w); p.position.set(x, y, -3); cam.add(p); return p; }
export function espaco(ctx, top = '#1b0b3a', bottom = '#02010a', n = 500) {
  const { scene, key, rim } = studio(ctx, { top, bottom, floor: false, keyI: 2.2, rimColor: 0xb197fc, rimI: 2.5, envI: 0.35 });
  const est = particles(n, [-14, -12, -16, 28, 26, 5], { color: 0xffffff, size: 0.06, rise: 0, opacity: 0.9 }); est.update(0); scene.add(est.points); // posiciona as estrelas (sem isso ficam todas na origem)
  return { scene, key, rim, est };
}
export const anelNeon = (r, cor, t = 0.03) => new THREE.Mesh(new THREE.TorusGeometry(r, t, 10, 64), glow(cor, 1.0));

export function terra(r = 1) {
  const g = new THREE.Group(); g.add(blob(r, clay(0x1c7ed6, { coat: 0.6 }), { seed: 1, noise: 0.0 }));
  for (let i = 0; i < 9; i++) { const c = blob(r * 0.4, clay(0x51cf66), { seed: i, noise: 0.3, freq: 4 }); const a = i * 2.4, b = (i % 4 - 1.5) * 0.45; c.position.set(Math.cos(a) * Math.cos(b) * r * 0.9, Math.sin(b) * r * 0.9, Math.sin(a) * Math.cos(b) * r * 0.9); c.scale.set(1, 1, 0.45); c.lookAt(0, 0, 0); g.add(c); }
  const atm = new THREE.Mesh(new THREE.SphereGeometry(r * 1.06, 40, 30), glow(0x74c0fc, 0.5, { opacity: 0.25 })); g.add(atm); return g;
}

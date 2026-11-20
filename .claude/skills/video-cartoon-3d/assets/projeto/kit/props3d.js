// Props 3D reutilizáveis (ES module). Uso: import { footprints, stepsAlong } from '../kit/props3d.js'
// Pegadas no chão: footprints(THREE, parent, {max, color, size}) -> { set(lista) }, lista = stepsAlong(...).
export function footprints(THREE, parent, o = {}) {
  const max = o.max || 80, size = o.size || .3;
  const c = document.createElement('canvas'); c.width = 64; c.height = 128; const g = c.getContext('2d');
  g.fillStyle = '#fff'; g.beginPath(); g.ellipse(32, 40, 22, 34, 0, 0, 7); g.fill(); g.beginPath(); g.ellipse(32, 100, 16, 22, 0, 0, 7); g.fill();
  const tex = new THREE.CanvasTexture(c);
  const geo = new THREE.PlaneGeometry(size * .5, size); geo.rotateX(-Math.PI / 2);
  const mat = new THREE.MeshBasicMaterial({ map: tex, color: o.color || '#2f4a20', transparent: true, opacity: o.opacity ?? .6, depthWrite: false });
  const inst = new THREE.InstancedMesh(geo, mat, max); inst.count = 0; inst.renderOrder = 1; parent.add(inst);
  const d = new THREE.Object3D();
  return { mesh: inst, set(list) { const n = Math.min(max, list.length); for (let i = 0; i < n; i++) { const p = list[i]; d.position.set(p.x, (o.y ?? .015), p.z); d.rotation.set(0, p.ang, 0); d.scale.setScalar(p.s ?? 1); d.updateMatrix(); inst.setMatrixAt(i, d.matrix); } inst.count = n; inst.instanceMatrix.needsUpdate = true; } };
}
// Pegadas deterministas ao longo de um caminho path(t)->{x,z}: um passo a cada `every` s, alternando pé, somem após `life` s.
export function stepsAlong(path, t, every = .35, life = 5, width = .14, t0 = 0) {
  const out = [];
  for (let k = 0; t0 + k * every <= t; k++) {
    const tk = t0 + k * every; if (t - tk > life) continue;
    const a = path(tk), b = path(tk + .05), dx = b.x - a.x, dz = b.z - a.z, L = Math.hypot(dx, dz) || 1, side = k % 2 ? 1 : -1;
    out.push({ x: a.x - dz / L * width * side, z: a.z + dx / L * width * side, ang: Math.atan2(dx, dz), s: 1 - Math.max(0, (t - tk) - (life - .6)) / .6 });
  }
  return out;
}

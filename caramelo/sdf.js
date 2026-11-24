// SDF orgânico (round cones + elipsoides com união suave) -> malha por Surface Nets.
// Cada primitivo: {t:'rc', a,b,r1,r2} ou {t:'el', c, r:[rx,ry,rz], ax:[ex,ey,ez]}
// + k (suavidade), col, col2, under ('down'|'front'|null), fur (0..1), id
const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const subv = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const len = a => Math.hypot(a[0], a[1], a[2]);
const nrm = a => { const l = len(a) || 1; return [a[0] / l, a[1] / l, a[2] / l]; };
const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];

function prep(p) {
  if (p.t === 'rc') {
    const ba = subv(p.b, p.a), l2 = dot(ba, ba), rr = p.r1 - p.r2;
    p._ba = ba; p._l2 = l2; p._rr = rr; p._a2 = l2 - rr * rr; p._il2 = 1 / l2;
    const ax = nrm(ba); let ref = Math.abs(ax[2]) < .9 ? [0, 0, 1] : [1, 0, 0];
    const x1 = nrm(cross(ax, ref)), x2 = cross(ax, x1);
    p._fr = [x1, ax, x2]; p._o = p.a;
    const r = Math.max(p.r1, p.r2) + p.k;
    p._min = [Math.min(p.a[0], p.b[0]) - r, Math.min(p.a[1], p.b[1]) - r, Math.min(p.a[2], p.b[2]) - r];
    p._max = [Math.max(p.a[0], p.b[0]) + r, Math.max(p.a[1], p.b[1]) + r, Math.max(p.a[2], p.b[2]) + r];
  } else {
    p._fr = p.ax; p._o = p.c; const m = Math.max(...p.r) + p.k;
    p._min = p.c.map(v => v - m); p._max = p.c.map(v => v + m);
  }
}

function primD(p, x, y, z) {
  if (p.t === 'rc') {
    const pax = x - p.a[0], pay = y - p.a[1], paz = z - p.a[2], ba = p._ba, l2 = p._l2;
    const yy = pax * ba[0] + pay * ba[1] + paz * ba[2], zz = yy - l2;
    const xvx = pax * l2 - ba[0] * yy, xvy = pay * l2 - ba[1] * yy, xvz = paz * l2 - ba[2] * yy;
    const x2 = xvx * xvx + xvy * xvy + xvz * xvz, y2 = yy * yy * l2, z2 = zz * zz * l2;
    const rr = p._rr, a2 = p._a2, il2 = p._il2;
    const k = Math.sign(rr) * rr * rr * x2;
    if (Math.sign(zz) * a2 * z2 > k) return Math.sqrt(x2 + z2) * il2 - p.r2;
    if (Math.sign(yy) * a2 * y2 < k) return Math.sqrt(x2 + y2) * il2 - p.r1;
    return (Math.sqrt(x2 * a2 * il2) + yy * rr) * il2 - p.r1;
  }
  const dx = x - p.c[0], dy = y - p.c[1], dz = z - p.c[2], ax = p.ax, r = p.r;
  const qx = (dx * ax[0][0] + dy * ax[0][1] + dz * ax[0][2]), qy = (dx * ax[1][0] + dy * ax[1][1] + dz * ax[1][2]), qz = (dx * ax[2][0] + dy * ax[2][1] + dz * ax[2][2]);
  const k0 = Math.hypot(qx / r[0], qy / r[1], qz / r[2]), k1 = Math.hypot(qx / (r[0] * r[0]), qy / (r[1] * r[1]), qz / (r[2] * r[2]));
  return k1 < 1e-9 ? -Math.min(...r) : k0 * (k0 - 1) / k1;
}

function smin(a, b, k) { if (k <= 0) return Math.min(a, b); const h = Math.max(k - Math.abs(a - b), 0) / k; return Math.min(a, b) - h * h * k * .25; }

export function evalSDF(prims, x, y, z) {
  let d = 1e9;
  for (let i = 0; i < prims.length; i++) {
    const p = prims[i];
    if (x < p._min[0] - .05 || y < p._min[1] - .05 || z < p._min[2] - .05 || x > p._max[0] + .05 || y > p._max[1] + .05 || z > p._max[2] + .05) {
      // longe da caixa: estimativa barata
      const ex = Math.max(p._min[0] - x, 0, x - p._max[0]), ey = Math.max(p._min[1] - y, 0, y - p._max[1]), ez = Math.max(p._min[2] - z, 0, z - p._max[2]);
      d = Math.min(d, Math.hypot(ex, ey, ez)); continue;
    }
    d = smin(d, primD(p, x, y, z), p.k);
  }
  return d;
}

// Constrói a malha. Retorna arrays para BufferGeometry.
export function meshSDF(prims, h) {
  prims.forEach(prep);
  const mn = [1e9, 1e9, 1e9], mx = [-1e9, -1e9, -1e9];
  for (const p of prims) for (let i = 0; i < 3; i++) { mn[i] = Math.min(mn[i], p._min[i]); mx[i] = Math.max(mx[i], p._max[i]); }
  for (let i = 0; i < 3; i++) { mn[i] -= 2 * h; mx[i] += 2 * h; }
  const nx = Math.ceil((mx[0] - mn[0]) / h) + 1, ny = Math.ceil((mx[1] - mn[1]) / h) + 1, nz = Math.ceil((mx[2] - mn[2]) / h) + 1;
  const N = nx * ny * nz, F = new Float32Array(N);
  const B = 4, bx = Math.ceil(nx / B), by = Math.ceil(ny / B), bz = Math.ceil(nz / B), half = B * h * 0.866 + 2.5 * h;
  for (let K = 0; K < bz; K++) for (let J = 0; J < by; J++) for (let I = 0; I < bx; I++) {
    const cx = mn[0] + (I * B + B / 2) * h, cy = mn[1] + (J * B + B / 2) * h, cz = mn[2] + (K * B + B / 2) * h;
    const dc = evalSDF(prims, cx, cy, cz), far = Math.abs(dc) > half;
    let sub = prims;
    if (!far) { const r = B * h * .5 + .06; sub = prims.filter(p => !(cx + r < p._min[0] || cy + r < p._min[1] || cz + r < p._min[2] || cx - r > p._max[0] || cy - r > p._max[1] || cz - r > p._max[2])); if (!sub.length) sub = prims; }
    for (let k = K * B; k < Math.min(nz, K * B + B); k++) for (let j = J * B; j < Math.min(ny, J * B + B); j++) for (let i = I * B; i < Math.min(nx, I * B + B); i++) {
      F[i + nx * (j + ny * k)] = far ? dc : evalSDF(sub, mn[0] + i * h, mn[1] + j * h, mn[2] + k * h);
    }
  }
  const cell = new Int32Array(N).fill(-1);
  const P = [];
  const E = [[0, 1], [0, 2], [0, 4], [1, 3], [1, 5], [2, 3], [2, 6], [3, 7], [4, 5], [4, 6], [5, 7], [6, 7]];
  const v = new Float32Array(8);
  for (let k = 0; k < nz - 1; k++) for (let j = 0; j < ny - 1; j++) for (let i = 0; i < nx - 1; i++) {
    let m = 0;
    for (let c = 0; c < 8; c++) { const val = F[(i + (c & 1)) + nx * ((j + ((c >> 1) & 1)) + ny * (k + ((c >> 2) & 1)))]; v[c] = val; if (val < 0) m |= 1 << c; }
    if (m === 0 || m === 255) continue;
    let sx = 0, sy = 0, sz = 0, n = 0;
    for (const [a, b] of E) {
      if ((v[a] < 0) === (v[b] < 0)) continue;
      const t = v[a] / (v[a] - v[b]);
      sx += (a & 1) + t * ((b & 1) - (a & 1)); sy += ((a >> 1) & 1) + t * (((b >> 1) & 1) - ((a >> 1) & 1)); sz += ((a >> 2) & 1) + t * (((b >> 2) & 1) - ((a >> 2) & 1)); n++;
    }
    cell[i + nx * (j + ny * k)] = P.length / 3;
    P.push(mn[0] + (i + sx / n) * h, mn[1] + (j + sy / n) * h, mn[2] + (k + sz / n) * h);
  }
  const idx = [];
  const st = [1, nx, nx * ny];
  for (let k = 1; k < nz - 1; k++) for (let j = 1; j < ny - 1; j++) for (let i = 1; i < nx - 1; i++) {
    const p = i + nx * (j + ny * k), f0 = F[p];
    for (let a = 0; a < 3; a++) {
      const f1 = F[p + st[a]];
      if ((f0 < 0) === (f1 < 0)) continue;
      const b = (a + 1) % 3, c = (a + 2) % 3;
      const q0 = cell[p - st[b] - st[c]], q1 = cell[p - st[c]], q2 = cell[p], q3 = cell[p - st[b]];
      if (q0 < 0 || q1 < 0 || q2 < 0 || q3 < 0) continue;
      if (f0 < 0) idx.push(q0, q1, q2, q0, q2, q3); else idx.push(q0, q2, q1, q0, q3, q2);
    }
  }
  // atributos por vértice
  const nv = P.length / 3, NRM = new Float32Array(nv * 3), COL = new Float32Array(nv * 3), FUR = new Float32Array(nv), FP = new Float32Array(nv * 3);
  const ds = new Float32Array(prims.length);
  for (let q = 0; q < nv; q++) {
    const x = P[q * 3], y = P[q * 3 + 1], z = P[q * 3 + 2];
    // normal pelo gradiente da grade (trilinear)
    const gx = (x - mn[0]) / h, gy = (y - mn[1]) / h, gz = (z - mn[2]) / h;
    const i0 = Math.min(nx - 3, Math.max(1, Math.floor(gx))), j0 = Math.min(ny - 3, Math.max(1, Math.floor(gy))), k0 = Math.min(nz - 3, Math.max(1, Math.floor(gz)));
    const fx = gx - i0, fy = gy - j0, fz = gz - k0;
    const G = (i, j, k) => F[i + nx * (j + ny * k)];
    const T = (i, j, k, ax) => { const di = ax === 0, dj = ax === 1, dk = ax === 2; return G(i + di, j + dj, k + dk) - G(i - di, j - dj, k - dk); };
    const n = [0, 0, 0];
    for (let ax = 0; ax < 3; ax++) { let v = 0;
      for (let c = 0; c < 8; c++) { const ci = c & 1, cj = (c >> 1) & 1, ck = (c >> 2) & 1; v += T(i0 + ci, j0 + cj, k0 + ck, ax) * (ci ? fx : 1 - fx) * (cj ? fy : 1 - fy) * (ck ? fz : 1 - fz); }
      n[ax] = v; }
    const nl = Math.hypot(n[0], n[1], n[2]) || 1; n[0] /= nl; n[1] /= nl; n[2] /= nl;
    NRM.set(n, q * 3);
    let dmin = 1e9, best = 0;
    for (let i = 0; i < prims.length; i++) { const p = prims[i];
      if (x < p._min[0] - .03 || y < p._min[1] - .03 || z < p._min[2] - .03 || x > p._max[0] + .03 || y > p._max[1] + .03 || z > p._max[2] + .03) { ds[i] = 1e9; continue; }
      const d = primD(p, x, y, z); ds[i] = d; if (d < dmin) { dmin = d; best = i; } }
    let W = 0, r = 0, g = 0, bb = 0, fu = 0;
    for (let i = 0; i < prims.length; i++) {
      const w = Math.exp(-(ds[i] - dmin) / .012); if (w < .01) continue;
      const p = prims[i]; let col = p.col;
      if (p.col2) {
        let m = 0;
        if (p.under === 'down') m = Math.min(1, Math.max(0, (-n[1] + .05) / .45));
        else if (p.under === 'front') m = Math.min(1, Math.max(0, (dot(n, p.fwd) - .1) / .4)) * Math.min(1, Math.max(0, (.55 - n[1]) / .4));
        else if (p.under === 'stripe') { const lp = subv([x, y, z], p._o); m = Math.max(0, Math.sin(dot(lp, p._fr[1]) * p.sf + Math.sin(dot(lp, p._fr[0]) * 40) * .8) * 1.6 - .5); m = Math.min(1, m); }
        col = [col[0] + (p.col2[0] - col[0]) * m, col[1] + (p.col2[1] - col[1]) * m, col[2] + (p.col2[2] - col[2]) * m];
      }
      r += col[0] * w; g += col[1] * w; bb += col[2] * w; fu += p.fur * w; W += w;
    }
    const jit = 1 + (Math.sin(x * 91.7 + y * 47.3 + z * 13.1) * .5) * .06;
    COL[q * 3] = r / W * jit; COL[q * 3 + 1] = g / W * jit; COL[q * 3 + 2] = bb / W * jit; FUR[q] = fu / W;
    const pb = prims[best], lp = subv([x, y, z], pb._o);
    FP[q * 3] = dot(lp, pb._fr[0]) + best * 3.1; FP[q * 3 + 1] = dot(lp, pb._fr[1]); FP[q * 3 + 2] = dot(lp, pb._fr[2]);
  }
  return { pos: new Float32Array(P), nrm: NRM, col: COL, fur: FUR, fp: FP, idx: new Uint32Array(idx) };
}

export const V3 = { dot, sub: subv, len, nrm, cross, add: (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]], mul: (a, s) => [a[0] * s, a[1] * s, a[2] * s], lerp: (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t] };

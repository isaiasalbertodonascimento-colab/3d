// Kit de animação para os vídeos cartoon. Tudo é função pura do tempo (render(t) determinístico).
// Carregar DEPOIS de kit/chars.js (usa seg, ease, back, lerp, rnd, f, cl, label).

// ---------- corpo ----------
// Pulo com antecipação (agacha), estica subindo e achata ao pousar. y em unidades SVG (negativo = sobe).
function hop(u, t0, dur = .55, h = 180) {
  const a = t0, b = t0 + .12, c = b + dur, e = c + .2;
  if (u < a || u > e) return { y: 0, sq: 0 };
  if (u < b) return { y: 0, sq: .2 * Math.sin((u - a) / .12 * Math.PI / 2) };
  if (u < c) { const k = (u - b) / dur; return { y: -4 * h * k * (1 - k), sq: -.16 * Math.cos(k * Math.PI) }; }
  const k = (u - c) / .2; return { y: 0, sq: .24 * (1 - k) * Math.cos(k * Math.PI * 1.5) };
}
// Objeto quicando: altura que decai a cada quique (0 = chão). n quiques em dur segundos.
function bounce(u, t0, h = 1, dur = 1.2, n = 3) {
  if (u < t0) return h; const k = (u - t0) / dur; if (k >= 1) return 0;
  const i = Math.floor(k * n), p = k * n - i; return h * Math.pow(.45, i + 1) * 4 * p * (1 - p);
}
// Mola: vai de 0 a 1 com overshoot e assenta (entradas de objetos, zoom punch, cabeças virando).
function spring(u, t0, freq = 9, decay = 6) { if (u < t0) return 0; const x = u - t0; return 1 - Math.exp(-decay * x) * Math.cos(freq * x); }
// Cenário reagindo: objeto treme quando alguém grita/pisa forte. Devolve [dx, dy, rotZ] (metros, radianos) para somar no mesh.
function quake(t, t0, amt = .04, decay = 6) { if (t < t0) return [0, 0, 0]; const k = Math.exp(-(t - t0) * decay) * amt; return [Math.sin(t * 73) * k, Math.abs(Math.sin(t * 51)) * k * .6, Math.sin(t * 61) * k * 1.5]; }
// Arcos de movimento com follow-through: o antebraço atrasa em relação ao braço (lag) e passa um pouco do ponto.
function swing(p, a0, a1, e0, e1, lag = .18) { const k = ease(cl(p)), k2 = ease(cl((p - lag) / (1 - lag))), ov = Math.sin(cl(p) * Math.PI) * .12; return { a: lerp(a0, a1, k), e: lerp(e0, e1, k2) + (e1 - e0) * ov * (p < 1 ? 1 : 0) }; }
// Hesitação: anda um pouco, para olhando para os lados, depois termina. Devolve {p (progresso 0..1), look}.
function hesitate(u, t0, dur, pause = .6) { const x = u - t0; if (x < 0) return { p: 0, look: 0 }; const a = dur * .3, b = a + pause; if (x < a) return { p: ease(x / a) * .35, look: 0 }; if (x < b) { const q = (x - a) / pause; return { p: .35, look: Math.sin(q * Math.PI * 2) * .9 }; } return { p: .35 + ease(cl((x - b) / (dur - a))) * .65, look: 0 }; }
// Tremedeira de medo/frio (graus ou px pequenos).
function tremble(t, amt = 3) { return Math.sin(t * 61) * amt * .6 + Math.sin(t * 37 + 1) * amt * .4; }

// ---------- rosto ----------
// Boca falando sincronizada com as legendas: precisa de window.GROUPS (grupos de legenda com words[{t0,t1}]).
function talk(t) {
  const G = window.GROUPS || [];
  for (const g of G) for (const w of g.words) if (t >= w.t0 && t < w.t1) {
    const syl = Math.max(1, Math.round(w.w.length / 2.5)), k = (t - w.t0) / (w.t1 - w.t0);
    return .2 + .8 * Math.abs(Math.sin(k * syl * Math.PI));
  }
  return 0;
}
// Boca com vogais: {mouth, vowel} sincronizados com a legenda. Uso: Object.assign(o, talkV(t)).
function talkV(t) {
  const G = window.GROUPS || [];
  for (const g of G) for (const w of g.words) if (t >= w.t0 && t < w.t1) {
    const L = w.w.toLowerCase().replace(/[^a-záàâãéêíóôõúç]/g, '') || 'a', k = (t - w.t0) / (w.t1 - w.t0), i = Math.min(L.length - 1, Math.floor(k * L.length)), ch = L[i], ph = k * L.length;
    const v = /[aáàâã]/.test(ch) ? 'A' : /[eéêií]/.test(ch) ? 'E' : /[oóôõ]/.test(ch) ? 'O' : /[uú]/.test(ch) ? 'U' : /[fv]/.test(ch) ? 'F' : /l/.test(ch) ? 'L' : /[mbp]/.test(ch) ? 'M' : 'E';
    const open = /[AOE]/.test(v) && /[aeiouáàâãéêíóôõú]/.test(ch) ? .45 + .55 * Math.abs(Math.sin(ph * Math.PI)) : .3;
    return { mouth: open, vowel: v };
  }
  return { mouth: 0, vowel: null };
}
// Virar o personagem: ângulo em graus (0 frente, 45 3/4, 90 lado, 180 costas, 270 lado oposto) -> {view, dir, sxMul}.
// sxMul achata de leve na troca de vista para esconder o "pulo" entre desenhos.
function turn(deg) {
  const a = ((deg % 360) + 360) % 360; let view = 'front', dir = 1;
  if (a >= 22.5 && a < 67.5) view = '3q'; else if (a >= 67.5 && a < 135) view = 'side'; else if (a >= 135 && a < 225) view = 'back';
  else if (a >= 225 && a < 292.5) { view = 'side'; dir = -1; } else if (a >= 292.5 && a < 337.5) { view = '3q'; dir = -1; }
  const dm = Math.min(...[22.5, 67.5, 135, 225, 292.5, 337.5].map(e => Math.abs(a - e))); return { view, dir, sxMul: .78 + .22 * Math.min(1, dm / 14) };
}
// Subir escada (de lado): fase do passo -> pernas/joelhos/bob. Suba o mesh em altura de degrau a cada meio ciclo.
function climb(ph) { const w = Math.sin(ph * 2 * Math.PI), up = Math.max(0, w), dn = Math.max(0, -w); return { view: 'side', legF: -55 * up + 10 * dn, kneeF: 85 * up, legB: -55 * dn + 10 * up, kneeB: 85 * dn, aF: 25 * w, aB: -25 * w, lean: 8, bob: -10 * Math.abs(w) }; }
// Pular obstáculo (de lado): p 0..1 -> pose + altura `lift` (unidades SVG; mova o mesh: mesh.y += -lift*K).
function hurdle(p, h = 260) { const k = Math.sin(Math.min(1, Math.max(0, p)) * Math.PI); return { view: 'side', legF: -70 * k, kneeF: 100 * k, legB: 40 * k, kneeB: 90 * k, aF: -120 * k, eF: -10, aB: 40 * k, lean: 14 * k, lift: -h * k, sq: p < .08 ? .15 : (p > .92 ? .18 : -.08 * k) }; }
// Piscada natural: ~0.12 s a cada 2.4–4 s (seed diferente por personagem).
function blink(t, seed = 0) { const per = 2.4 + rnd(seed) * 1.6, p = (t + rnd(seed + 9) * per) % per; return p < .12 ? Math.sin(p / .12 * Math.PI) : 0; }
// Olhar varrendo de um lado pro outro (nervoso).
function darting(t, rate = 3) { return Math.sign(Math.sin(t * rate * Math.PI)) * .9; }

// ---------- câmera ----------
// Vários planos dentro de um bloco: shots(u, [0, 1.4, 2.9]) -> {i, v (tempo local), d (duração do plano)}
function shots(u, starts, total) {
  let i = starts.length - 1; while (i > 0 && u < starts[i]) i--;
  const end = i + 1 < starts.length ? starts[i + 1] : (total ?? starts[i] + 3); return { i, v: u - starts[i], d: end - starts[i] };
}
// Zoom punch: multiplica o FOV (ex.: cam.fov = base * punch(u, 2.0)). Fecha rápido e volta com mola.
function punch(u, t0, amt = .22) { if (u < t0) return 1; const x = u - t0; return 1 - amt * Math.exp(-x * 5) * Math.cos(x * 10) * (x < .04 ? x / .04 : 1); }
// Tremida de impacto: [dx, dy] em metros para somar na posição/lookAt da câmera. Determinística por quadro.
function shake(t, t0, amt = .05, decay = 7) {
  if (t < t0) return [0, 0]; const k = Math.exp(-(t - t0) * decay) * amt, fr = Math.floor(t * 30);
  return [(rnd(fr) - .5) * 2 * k, (rnd(fr + 77) - .5) * 2 * k];
}
// Whip pan: deslocamento lateral do lookAt (-1..1) nos primeiros/últimos `dur` s do plano. Some com speedLines().
function whip(v, d, dur = .16) { if (v < dur) return -Math.pow(1 - v / dur, 2); if (v > d - dur) return Math.pow((v - (d - dur)) / dur, 2); return 0; }

// ---------- efeitos na tela (strings SVG para a camada de UI 1080x1920) ----------
function speedLines(p, cx = 540, cy = 900, n = 22) {
  if (p <= 0) return ''; let h = '';
  for (let k = 0; k < n; k++) { const a = rnd(k) * Math.PI * 2, r0 = 380 + rnd(k + 3) * 300, r1 = r0 + 260 + rnd(k + 5) * 400;
    h += `<line x1="${f(cx + Math.cos(a) * r0)}" y1="${f(cy + Math.sin(a) * r0)}" x2="${f(cx + Math.cos(a) * r1)}" y2="${f(cy + Math.sin(a) * r1)}" stroke="#fff" stroke-width="${f(4 + rnd(k + 8) * 8)}" opacity="${f(p * .8)}" stroke-linecap="round"/>`; }
  return h;
}
// Gotas de suor saindo da cabeça (x,y = topo da cabeça na tela).
function sweat(x, y, u, n = 3) {
  let h = ''; for (let k = 0; k < n; k++) { const ph = (u * 1.6 + k / n) % 1, dx = (k % 2 ? 1 : -1) * (40 + ph * 90), dy = -40 + ph * ph * 160;
    h += `<path transform="translate(${f(x + dx)} ${f(y + dy)}) scale(${f(1 - ph * .4)})" d="M0 -26 Q16 0 0 12 Q-16 0 0 -26Z" fill="#8fd3ff" stroke="#1d4f73" stroke-width="4" opacity="${f(1 - ph)}"/>`; }
  return h;
}
// Linhas de susto em volta da cabeça.
function emanata(x, y, p, r = 150) {
  if (p <= 0) return ''; let h = ''; const s = back(cl(p));
  for (let k = 0; k < 7; k++) { const a = (-150 + k * 20) * Math.PI / 180; h += `<line x1="${f(x + Math.cos(a) * r * s)}" y1="${f(y + Math.sin(a) * r * s)}" x2="${f(x + Math.cos(a) * (r + 70) * s)}" y2="${f(y + Math.sin(a) * (r + 70) * s)}" stroke="#141414" stroke-width="10" stroke-linecap="round"/>`; }
  return h;
}
// Brilho/estrelinha girando.
function sparkle(x, y, u, size = 60) {
  const s = size * (.7 + .3 * Math.abs(Math.sin(u * 6))), r = u * 90;
  return `<g transform="translate(${f(x)} ${f(y)}) rotate(${f(r)})"><path d="M0 ${-s} Q${s * .15} ${-s * .15} ${s} 0 Q${s * .15} ${s * .15} 0 ${s} Q${-s * .15} ${s * .15} ${-s} 0 Q${-s * .15} ${-s * .15} 0 ${-s}Z" fill="#fff6b0" stroke="#d9a400" stroke-width="4"/></g>`;
}
// Nuvem de poeira de impacto/derrapagem (p 0..1).
function puff(x, y, p, n = 7) {
  if (p <= 0 || p >= 1) return ''; let h = '';
  for (let k = 0; k < n; k++) { const a = Math.PI + (k / (n - 1)) * Math.PI, d = 40 + p * 140; h += `<circle cx="${f(x + Math.cos(a) * d)}" cy="${f(y + Math.sin(a) * d * .4)}" r="${f(26 + p * 34)}" fill="#e9e1cf" opacity="${f(.85 * (1 - p))}"/>`; }
  return h;
}
// Onomatopeia com pop + tremida (POW, PLOFT, CLANK...). p de 0 a 1.
function popText(txt, x, y, p, o = {}) {
  if (p <= 0) return ''; const j = (1 - cl(p * 2)) * 10;
  return label(txt, y + Math.sin(p * 40) * j, Object.assign({ size: 110, fill: '#ffd23f', x: x + Math.cos(p * 33) * j, rot: (o.rot ?? -8) + Math.sin(p * 25) * j, p, stroke: 16 }, o));
}
// Contador animado (ex.: 0 -> 50 com "+" na frente).
function counter(x, y, from, to, p, o = {}) { const v = Math.round(lerp(from, to, ease(cl(p)))); return label((o.pre || '') + v + (o.suf || ''), y, Object.assign({ size: 150, fill: '#ffd23f', x, p: Math.min(1, p * 4) }, o)); }

// ---------- eventos -> efeitos sonoros ----------
// Declare os eventos de cada cena UMA vez e use a mesma tabela na animação e no áudio:
//   const EV = [[cena, u, 'pop'], [cena, u, 'thud'], ...];  evAt(EV, cena, 'thud') -> u do evento
// e exporte window.EVENTS (tempos absolutos) para o make_audio.py ler via events.json.
function evAt(EV, sc, name, nth = 0) { const l = EV.filter(e => e[0] === sc && e[2] === name); return l[nth] ? l[nth][1] : 1e9; }

// ---------- física (determinística: o mesmo t dá sempre o mesmo resultado, então dá para renderizar em pedaços) ----------
// Tudo em METROS e SEGUNDOS, igual às posições dos meshes. G = gravidade (cartoon: um pouco mais forte que a real fica mais "snappy").
const G = 12;
const _P = (fn, t) => { const v = fn(t); return Array.isArray(v) ? v : [v, 0]; };
// Inércia de uma parte mole presa a um corpo que segue path(t) -> [x, y] (metros).
// Simula os últimos `win` s a 120 Hz partindo do repouso: mola k, amortecimento c. Devolve {d:[dx,dy] (atraso da parte, m), v:[vx,vy], a:[ax,ay]}.
function inertia(path, t, k = 70, c = 7, win = 1.6) {
  const h = 1 / 120, n = Math.round(win / h); let dx = 0, dy = 0, vx = 0, vy = 0, ax = 0, ay = 0;
  let p0 = _P(path, t - win - h), p1 = _P(path, t - win);
  for (let i = 1; i <= n; i++) {
    const p2 = _P(path, t - win + i * h); ax = (p2[0] - 2 * p1[0] + p0[0]) / (h * h); ay = (p2[1] - 2 * p1[1] + p0[1]) / (h * h);
    // a parte sente a aceleração do corpo ao contrário (fica para trás) e a mola puxa de volta
    vx += (-k * dx - c * vx - ax) * h; vy += (-k * dy - c * vy - ay) * h; dx += vx * h; dy += vy * h; p0 = p1; p1 = p2;
  }
  const pa = _P(path, t + h), pb = _P(path, t - h);
  return { d: [dx, dy], v: [(pa[0] - pb[0]) / (2 * h), (pa[1] - pb[1]) / (2 * h)], a: [ax, ay] };
}
// Pulo com gravidade de verdade: a altura decide o tempo no ar (T = 2*sqrt(2h/G)). Antecipação (agacha), estica subindo, achata no pouso.
// Devolve {y (m, para cima), sq (squash p/ guy), air (unid. SVG p/ sombra), vy, phase:'pre'|'air'|'land'|null, T (tempo no ar)}.
function jump(u, t0, h = .5, o = {}) {
  const g = o.g ?? G, pre = o.pre ?? .14, v0 = Math.sqrt(2 * g * h), T = 2 * v0 / g, land = o.land ?? .32, K = o.K ?? .0021;
  const x = u - t0; if (x < 0 || x > pre + T + land) return { y: 0, sq: 0, air: 0, vy: 0, phase: null, T };
  if (x < pre) return { y: 0, sq: .22 * Math.sin(x / pre * Math.PI / 2), air: 0, vy: 0, phase: 'pre', T };
  if (x < pre + T) { const s = x - pre, y = v0 * s - g * s * s / 2, vy = v0 - g * s; return { y, sq: -.18 * Math.abs(vy) / v0, air: y / K, vy, phase: 'air', T }; }
  const s = (x - pre - T) / land; return { y: 0, sq: .3 * Math.exp(-s * 5) * Math.cos(s * 11), air: 0, vy: 0, phase: 'land', T };
}
// Queda livre de uma altura h0 com quiques que perdem energia (e = elasticidade 0..1). Para objetos e para quem cai.
// Devolve {y, vy, hit (s desde o último impacto, p/ squash/poeira/som), n (nº do quique), rest (parado)}.
function fall(u, t0, h0 = 1.5, o = {}) {
  const g = o.g ?? G, e = o.e ?? .45; let x = u - t0; if (x < 0) return { y: h0, vy: 0, hit: 1e9, n: -1, rest: false };
  let t1 = Math.sqrt(2 * h0 / g); if (x < t1) return { y: h0 - g * x * x / 2, vy: -g * x, hit: 1e9, n: -1, rest: false };
  x -= t1; let v = g * t1 * e, n = 0;
  while (v > .25 && n < 12) { const T = 2 * v / g; if (x < T) return { y: v * x - g * x * x / 2, vy: v - g * x, hit: x, n, rest: false }; x -= T; v *= e; n++; }
  return { y: 0, vy: 0, hit: x, n, rest: true };
}
// Objeto arremessado: parte de p0=[x,y] com v0=[vx,vy] (m/s), cai com gravidade, quica no chão (floor) perdendo energia,
// desliza com atrito e gira enquanto voa. Devolve {x, y, rot (rad), hit, rest}.
function toss(u, t0, p0, v0, o = {}) {
  const g = o.g ?? G, e = o.e ?? .4, fr = o.friction ?? .6, floor = o.floor ?? 0, spin = o.spin ?? 8, h = 1 / 120;
  let x = p0[0], y = p0[1], vx = v0[0], vy = v0[1], rot = 0, w = spin, hit = 1e9, s = 0; const T = Math.max(0, u - t0);
  while (s < T) { vy -= g * h; x += vx * h; y += vy * h; rot += w * h; hit += h;
    if (y < floor) { y = floor; if (Math.abs(vy) > .6) { vy = -vy * e; hit = 0; w *= .5; } else { vy = 0; } vx *= fr; if (vy === 0) { vx *= .9; w *= .8; } }
    s += h; }
  return { x, y, rot, hit, rest: vy === 0 && Math.abs(vx) < .01 };
}
// Pêndulo amortecido (placa pendurada, lustre, rabo de cavalo, chaveiro): ângulo em radianos após um empurrão em t0.
function pendulum(u, t0, amp = .5, len = .4, damp = 1.2, o = {}) { const g = o.g ?? G; if (u < t0) return 0; const w = Math.sqrt(g / len), x = u - t0; return amp * Math.exp(-damp * x) * Math.sin(w * x); }
// Empurrão/esbarrão: quem leva o empurrão desliza e freia por atrito (v0 m/s, mu = atrito). Devolve {x (m), v}.
function shove(u, t0, v0 = 2, mu = 3) { if (u < t0) return { x: 0, v: 0 }; const x = u - t0, ts = v0 / mu; if (x > ts) return { x: v0 * ts / 2, v: 0 }; return { x: v0 * x - mu * x * x / 2, v: v0 - mu * x }; }

// ---------- colisão: personagem NUNCA atravessa móvel, parede ou outro personagem ----------
// Obstáculos = caixas no chão {x0,x1,z0,z1,h,name} (metros). Monte com solidsFrom(grupo) (lê a caixa 3D de cada objeto marcado
// com userData.solid=true) ou à mão. r = "raio" do personagem (meio corpo, ~.28 m em escala .78).
// solid(...) empurra o ponto para fora de qualquer caixa e devolve {x, z, hit (nome do que ia atravessar ou null), depth}.
function solid(boxes, x, z, r = .28, y = 0) {
  let hit = null, depth = 0;
  for (let it = 0; it < 3; it++) for (const b of boxes) {
    if (y > (b.h ?? 9)) continue; // pulando por cima de algo baixo
    const cx = Math.max(b.x0, Math.min(b.x1, x)), cz = Math.max(b.z0, Math.min(b.z1, z)), dx = x - cx, dz = z - cz, d = Math.hypot(dx, dz);
    if (d >= r) continue;
    if (d > 1e-6) { x = cx + dx / d * r; z = cz + dz / d * r; }
    else { const o = [[b.x0 - r - x, 0], [b.x1 + r - x, 0], [0, b.z0 - r - z], [0, b.z1 + r - z]].sort((a, c) => Math.hypot(...a) - Math.hypot(...c))[0]; x += o[0]; z += o[1]; }
    hit = b.name || 'obstáculo'; depth = Math.max(depth, r - d);
  }
  return { x, z, hit, depth };
}
// Dois personagens não se atravessam: afasta a e b até a distância mínima (devolve as posições novas).
function apart(a, b, min = .5) { const dx = b[0] - a[0], dz = b[1] - a[1], d = Math.hypot(dx, dz) || 1e-6; if (d >= min) return [a, b]; const k = (min - d) / 2 / d; return [[a[0] - dx * k, a[1] - dz * k], [b[0] + dx * k, b[1] + dz * k]]; }

// Chão: altura da superfície embaixo de (x,z) — chão (floor, padrão 0) ou o topo de uma caixa que já está abaixo do personagem
// (subiu na mesa, pulou no banco). Use para nunca deixar o personagem abaixo do chão: y = Math.max(y, groundAt(...)).
function groundAt(boxes, x, z, y = 0, floor = 0) { let g = floor; for (const b of boxes) if (x >= b.x0 && x <= b.x1 && z >= b.z0 && z <= b.z1 && (b.h ?? 9) <= y + .05) g = Math.max(g, b.h); return g; }

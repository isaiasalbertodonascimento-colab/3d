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
    const vs = w.w.toLowerCase().match(/[aeiouáàâãéêíóôõú]/g) || ['a'], k = (t - w.t0) / (w.t1 - w.t0), ph = k * vs.length, v = vs[Math.min(vs.length - 1, Math.floor(ph))];
    const open = Math.abs(Math.sin(ph * Math.PI)), map = /[aáàâã]/.test(v) ? 'A' : /[eéêií]/.test(v) ? 'E' : 'O';
    return { mouth: .15 + .85 * open, vowel: open < .25 ? 'M' : map };
  }
  return { mouth: 0, vowel: null };
}
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

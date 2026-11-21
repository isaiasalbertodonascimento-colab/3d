# Núcleo: câmera 3D simples (projeção + faces com luz e névoa), personagem 2D, legendas e pós.
import math, cairo, numpy as np

W, H, FPS = 1080, 1920, 30
TAU = math.tau
FONT = 'Montserrat ExtraBold'

def cl(x, a=0., b=1.): return max(a, min(b, x))
def seg(u, a, b): return cl((u - a) / (b - a))
def ease(t): return 4*t*t*t if t < .5 else 1 - (-2*t + 2)**3 / 2
def eo(t): return 1 - (1 - t)**3
def lerp(a, b, t): return a + (b - a) * t
def rnd(i): x = math.sin(i * 127.1 + 311.7) * 43758.5453; return x - math.floor(x)
def hexc(h, a=1.):
    h = h.lstrip('#'); return (int(h[0:2], 16)/255, int(h[2:4], 16)/255, int(h[4:6], 16)/255, a)
def mix(c1, c2, k): return tuple(lerp(a, b, k) for a, b in zip(c1, c2))
def shade(c, k): return (c[0]*k, c[1]*k, c[2]*k, c[3] if len(c) > 3 else 1)
def setc(ctx, c, a=None):
    c = hexc(c) if isinstance(c, str) else c
    ctx.set_source_rgba(c[0], c[1], c[2], (c[3] if len(c) > 3 else 1) if a is None else a)

# ---------------- câmera 3D ----------------
class Cam:
    def __init__(s, pos, look, fov=55, fog=(.0, 1e9), fogc='#c9a58a', light=(-.4, .7, .6)):
        s.p = np.array(pos, float); l = np.array(look, float); f = l - s.p; f /= np.linalg.norm(f)
        r = np.cross(f, [0, 1, 0]); r /= np.linalg.norm(r); u = np.cross(r, f)
        s.f, s.r, s.u = f, r, u; s.k = (H / 2) / math.tan(math.radians(fov) / 2)
        s.fog = fog; s.fogc = hexc(fogc); L = np.array(light, float); s.L = L / np.linalg.norm(L)
    def proj(s, P):
        d = np.array(P, float) - s.p; z = d @ s.f
        if z < .02: z = .02
        return (W/2 + (d @ s.r) * s.k / z, H/2 - (d @ s.u) * s.k / z, z)
    def depth(s, P): return (np.array(P, float) - s.p) @ s.f
    def fogk(s, z): a, b = s.fog; return cl((z - a) / (b - a)) * .85
    def face(s, ctx, pts, col, n=None, amb=.62, dif=.45, alpha=1., fog=True, line=None):
        C = [np.array(p, float) - s.p for p in pts]; C = [(c @ s.r, c @ s.u, c @ s.f) for c in C]
        nz = .05; out = []
        for i in range(len(C)):   # recorte no plano próximo (Sutherland-Hodgman)
            a, b = C[i], C[(i + 1) % len(C)]
            if a[2] >= nz: out.append(a)
            if (a[2] >= nz) != (b[2] >= nz):
                k = (nz - a[2]) / (b[2] - a[2]); out.append(tuple(a[j] + (b[j] - a[j]) * k for j in range(3)))
        if len(out) < 3: return
        P = [(W/2 + x * s.k / z, H/2 - y * s.k / z, z) for x, y, z in out]
        c = hexc(col) if isinstance(col, str) else col
        if n is not None:
            k = amb + dif * max(0, float(np.dot(np.array(n, float), s.L)))
            c = shade(c, k)
        if fog:
            z = sum(p[2] for p in P) / len(P); c = mix(c, s.fogc, s.fogk(z))
        ctx.move_to(P[0][0], P[0][1])
        for p in P[1:]: ctx.line_to(p[0], p[1])
        ctx.close_path(); setc(ctx, c[:3] + (alpha,))
        if line: ctx.fill_preserve(); setc(ctx, line[0]); ctx.set_line_width(line[1]); ctx.stroke()
        else: ctx.fill()
    def box(s, ctx, x0, y0, z0, x1, y1, z1, col, sides='all', **kw):
        # desenha faces visíveis (normal voltada para a câmera), da mais longe para a mais perto
        F = {'top': ([(x0,y1,z0),(x1,y1,z0),(x1,y1,z1),(x0,y1,z1)],(0,1,0)), 'bot': ([(x0,y0,z0),(x1,y0,z0),(x1,y0,z1),(x0,y0,z1)],(0,-1,0)),
             'front': ([(x0,y0,z1),(x1,y0,z1),(x1,y1,z1),(x0,y1,z1)],(0,0,1)), 'back': ([(x0,y0,z0),(x1,y0,z0),(x1,y1,z0),(x0,y1,z0)],(0,0,-1)),
             'left': ([(x0,y0,z0),(x0,y0,z1),(x0,y1,z1),(x0,y1,z0)],(-1,0,0)), 'right': ([(x1,y0,z0),(x1,y0,z1),(x1,y1,z1),(x1,y1,z0)],(1,0,0))}
        L = []
        for k, (pts, n) in F.items():
            if sides != 'all' and k not in sides: continue
            c = np.mean(pts, 0)
            if np.dot(np.array(n), s.p - c) <= 0: continue
            L.append((s.depth(c), pts, n))
        for _, pts, n in sorted(L, key=lambda a: -a[0]):
            s.face(ctx, pts, col, n, **kw)

# ---------------- personagem fixo ----------------
SKIN, SKIND = '#c99568', '#b07e55'
HAIR, TEE, TEED = '#4a3022', '#d2a032', '#b8891f'
JEANS, JEANSD, PACK, PACKD = '#45607f', '#374e69', '#83868d', '#676a71'
PHONE = '#17171b'

def rrect(ctx, x, y, w, h, r):
    r = min(r, w/2, h/2); ctx.new_sub_path()
    ctx.arc(x+w-r, y+r, r, -TAU/4, 0); ctx.arc(x+w-r, y+h-r, r, 0, TAU/4); ctx.arc(x+r, y+h-r, r, TAU/4, TAU/2); ctx.arc(x+r, y+r, r, TAU/2, TAU*3/4); ctx.close_path()

def limb(ctx, x0, y0, ang, length, w, col, ang2=0, len2=0, col2=None, end=None):
    """membro com duas partes; ângulos em graus (0 = para baixo). devolve ponta."""
    a = math.radians(ang); x1, y1 = x0 - math.sin(a)*length, y0 + math.cos(a)*length
    ctx.set_line_cap(cairo.LINE_CAP_ROUND); ctx.set_line_width(w); setc(ctx, col)
    ctx.move_to(x0, y0); ctx.line_to(x1, y1); ctx.stroke()
    if len2:
        b = math.radians(ang + ang2); x2, y2 = x1 - math.sin(b)*len2, y1 + math.cos(b)*len2
        setc(ctx, col2 or col); ctx.move_to(x1, y1); ctx.line_to(x2, y2); ctx.stroke(); return x2, y2
    return x1, y1

def phone(ctx, x, y, rot=0, s=1., cracked=False, glow=1.):
    ctx.save(); ctx.translate(x, y); ctx.rotate(math.radians(rot)); ctx.scale(s, s)
    rrect(ctx, -17, -30, 34, 60, 7); setc(ctx, PHONE); ctx.fill()
    rrect(ctx, -13, -25, 26, 50, 4); setc(ctx, mix(hexc('#2a3440'), hexc('#a8d8ff'), glow)); ctx.fill()
    if cracked:
        setc(ctx, '#ffffff', .85); ctx.set_line_width(1.6)
        for a, b, c, d in [(-4, -5, -12, -20), (-4, -5, 9, -18), (-4, -5, 12, 8), (-4, -5, -10, 20), (2, 4, 6, 22)]:
            ctx.move_to(a, b); ctx.line_to(c, d); ctx.stroke()
    ctx.restore()

def head(ctx, x, y, r, o):
    """cabeça redonda com cabelo, fone grande, olhos de ponto e sobrancelha curta"""
    view, t = o.get('view', 'front'), o.get('t', 0)
    lk = o.get('look', 0) * r * .18; ly = o.get('lookY', 0) * r * .12
    ctx.save(); ctx.translate(x, y); ctx.rotate(math.radians(o.get('tilt', 0)))
    # sombra suave da cabeça no pescoço
    # cabeça
    ctx.arc(0, 0, r, 0, TAU); setc(ctx, SKIN); ctx.fill()
    ctx.save(); ctx.arc(0, 0, r, 0, TAU); ctx.clip(); ctx.arc(r*.55, r*.25, r*1.05, 0, TAU); setc(ctx, SKIND, .45); ctx.fill(); ctx.restore()
    # cabelo curto (tampa)
    ctx.save(); ctx.arc(0, 0, r*1.04, 0, TAU); ctx.clip()
    ctx.move_to(-r*1.1, -r*.05)
    for k in range(7):
        xx = lerp(-r*1.05, r*1.05, k/6); ctx.line_to(xx, -r*(.42 + .1*(k % 2)) + (r*.25 if view == 'side' and xx > r*.2 else 0))
    ctx.line_to(r*1.1, -r*.05); ctx.line_to(r*1.1, -r*1.2); ctx.line_to(-r*1.1, -r*1.2); ctx.close_path(); setc(ctx, HAIR); ctx.fill()
    ctx.restore()
    if view == 'back':
        ctx.arc(0, 0, r*1.0, TAU*.55, TAU*.95); ctx.arc(0, r*.4, r*.98, TAU*.02, TAU*.48); setc(ctx, HAIR); ctx.fill()
    # rosto
    if view in ('front', 'side'):
        ex = [-r*.33, r*.33] if view == 'front' else [r*.48]
        wide = o.get('wide', 0); dark = o.get('dark', False)
        for e in ex:
            cx, cy = e + lk + (r*.0), -r*.02 + ly
            if wide:
                ctx.arc(cx, cy, r*.17*wide + r*.06, 0, TAU); setc(ctx, '#ffffff'); ctx.fill()
                ctx.arc(cx + lk*.3, cy, r*.085, 0, TAU); setc(ctx, '#141414'); ctx.fill()
                ctx.arc(cx + lk*.3 + r*.03, cy - r*.04, r*.03, 0, TAU); setc(ctx, '#ffffff'); ctx.fill()
            else:
                bl = o.get('blink', 0)
                if bl > .5:
                    setc(ctx, '#2a1a14'); ctx.set_line_width(r*.06); ctx.move_to(cx - r*.08, cy); ctx.line_to(cx + r*.08, cy); ctx.stroke()
                else:
                    ctx.arc(cx, cy, r*.075, 0, TAU); setc(ctx, '#1d1410'); ctx.fill()
                    ctx.arc(cx + r*.025, cy - r*.03, r*.022, 0, TAU); setc(ctx, '#ffffff', .9); ctx.fill()
            # sobrancelha curta
            br = o.get('brow', 0)
            setc(ctx, '#3a2418'); ctx.set_line_width(r*.075); ctx.set_line_cap(cairo.LINE_CAP_ROUND)
            ctx.move_to(cx - r*.12, cy - r*.24 - br*r*.08 + (r*.03 if e < 0 else -r*.0)*br); ctx.line_to(cx + r*.12, cy - r*.24 - br*r*.08 - (r*.03 if e < 0 else 0)*br); ctx.stroke()
        # boca
        m = o.get('mouth', 0); mx = (r*.25 if view == 'side' else 0) + lk*.6
        if m > .15:
            ctx.save(); ctx.translate(mx, r*.42); ctx.scale(1, 1 + m*.6); ctx.arc(0, 0, r*.09*(1 + m*.5), 0, TAU); ctx.restore(); setc(ctx, '#5a2a20'); ctx.fill()
        else:
            setc(ctx, '#6a3a28'); ctx.set_line_width(r*.05); ctx.move_to(mx - r*.09, r*.4); ctx.curve_to(mx - r*.03, r*.45, mx + r*.03, r*.45, mx + r*.09, r*.4); ctx.stroke()
        # bochecha
        for e in ex: ctx.arc(e + lk*.5, r*.25, r*.12, 0, TAU); setc(ctx, '#d9786a', .25); ctx.fill()
    # fone grande preto
    setc(ctx, '#1b1b1f'); ctx.set_line_width(r*.16); ctx.set_line_cap(cairo.LINE_CAP_ROUND)
    if view == 'side':
        ctx.arc(-r*.05, -r*.05, r*1.08, TAU*.62, TAU*.95); ctx.stroke()
        rrect(ctx, -r*.38, -r*.32, r*.42, r*.62, r*.18); setc(ctx, '#1b1b1f'); ctx.fill()
        rrect(ctx, -r*.3, -r*.22, r*.12, r*.36, r*.06); setc(ctx, '#3a3a42'); ctx.fill()
    else:
        ctx.arc(0, -r*.05, r*1.1, TAU*.56, TAU*.94); ctx.stroke()
        for sx in (-1, 1):
            rrect(ctx, sx*r*1.0 - r*.17, -r*.32, r*.34, r*.64, r*.15); setc(ctx, '#1b1b1f'); ctx.fill()
            rrect(ctx, sx*r*1.0 - r*.06 + sx*r*.03, -r*.22, r*.1, r*.36, r*.05); setc(ctx, '#3a3a42'); ctx.fill()
    ctx.restore()

def boy(ctx, x, y, s=1., o=None):
    """garoto fixo. origem nos pés. o: view(front/side/back), walk(fase), t, arms('down','phone','press','up','float'), sit, wide, look..."""
    o = o or {}; t = o.get('t', 0); view = o.get('view', 'front'); d = o.get('dir', 1)
    ctx.save(); ctx.translate(x, y); ctx.scale(s * (d if view == 'side' else 1), s); ctx.rotate(math.radians(o.get('rot', 0)))
    breath = math.sin(t * 2.2) * 2 * (1 + o.get('pant', 0) * 3)
    sit = o.get('sit', False); fl = o.get('float', 0)
    w = o.get('walk'); sw = math.sin(w * TAU) * 28 if w is not None else 0; bob = -abs(math.cos(w * TAU)) * 6 if w is not None else 0
    # sombra no chão
    if o.get('shadow', True) and not fl:
        for k in range(5): ctx.save(); ctx.scale(1, .22); ctx.arc(0, 0, 70 + k*8, 0, TAU); ctx.restore(); setc(ctx, '#000000', .06); ctx.fill()
    hipY = -150 + bob + (95 if sit else 0)
    ctx.translate(0, bob * 0)
    # pernas
    if sit:
        for sx in (-1, 1):
            limb(ctx, sx*22, hipY, -90*sx if view != 'side' else -88, 70, 40, JEANS, 90*sx if view != 'side' else 85, 75, JEANSD)
        for sx in (-1, 1): ctx.arc(sx*(22+70) if view != 'side' else 70, hipY + 75, 1, 0, 0)
    elif fl:
        for sx, ph in ((-1, 0), (1, 1.3)):
            a = 25*sx + math.sin(t*3 + ph)*15; limb(ctx, sx*20, hipY, a, 75, 40, JEANS if sx < 0 else JEANSD, -40*sx + math.sin(t*4+ph)*20, 75, JEANSD)
    else:
        legs = [(-1, sw), (1, -sw)] if view != 'side' else [(1, -sw), (-1, sw)]
        for sx, a in legs:
            col = JEANSD if (view == 'side' and sx > 0) else JEANS
            px = sx*22 if view != 'side' else 0
            ex, ey = limb(ctx, px, hipY, a, 78, 42, col, -abs(a)*.4 if a < 0 else 0, 72, col)
            ctx.save(); ctx.translate(ex + (10 if view == 'side' else 0), ey + 4); ctx.scale(1, .55); ctx.arc(0, 0, 26, 0, TAU); ctx.restore(); setc(ctx, '#ece6da'); ctx.fill()
    # mochila (atrás)
    ty = hipY - 115 + breath * .3
    if view == 'side':
        rrect(ctx, -82, ty + 5, 50, 100, 18); setc(ctx, PACK); ctx.fill(); rrect(ctx, -82, ty + 55, 50, 12, 4); setc(ctx, PACKD); ctx.fill()
    elif view == 'back':
        pass
    else:
        rrect(ctx, -66, ty + 8, 132, 96, 22); setc(ctx, PACKD); ctx.fill()
    # braços de trás (side)
    arms = o.get('arms', 'down')
    def arm(side, a1, a2, front=True):
        sx = side * 50 if view != 'side' else 0
        col = TEE if front else TEED
        x1, y1 = limb(ctx, sx, ty + 18, a1, 52, 34, col)
        x2, y2 = limb(ctx, x1, y1, a1 + a2, 58, 26, SKIN if front else SKIND)
        ctx.arc(x2, y2, 15, 0, TAU); setc(ctx, SKIN if front else SKIND); ctx.fill(); return x2, y2
    A = {'down': ((10, -5), (-10, 5)), 'phone': ((12, 0), (-28, 130)), 'press': ((10, -5), (-75, -10)), 'up': ((150, 10), (-150, -10)),
         'float': ((120 + math.sin(t*5)*20, 20), (-120 - math.sin(t*5+1)*20, -20)), 'brace': ((60, -40), (-60, 40)), 'chest': ((20, 110), (-20, -110))}[arms] if isinstance(arms, str) else arms
    if view == 'side':
        arm(-1, -sw*.8 + A[0][0]*0, 10, front=False)
    if view == 'back':
        rrect(ctx, -52, ty - 5, 104, 125, 30); setc(ctx, TEE); ctx.fill()
    # tronco
    if view != 'back':
        tw = 104 if view != 'side' else 74
        rrect(ctx, -tw/2, ty - 5, tw, 125 + breath, 30); setc(ctx, TEE); ctx.fill()
        ctx.save(); rrect(ctx, -tw/2, ty - 5, tw, 125 + breath, 30); ctx.clip(); ctx.rectangle(tw*.18, ty - 10, tw, 140); setc(ctx, TEED, .5); ctx.fill(); ctx.restore()
        ctx.move_to(-12 if view != 'side' else 10, ty - 3); ctx.curve_to(-6, ty + 10, 6, ty + 10, 12 if view != 'side' else 30, ty - 3); setc(ctx, '#a8801c'); ctx.set_line_width(4); ctx.stroke()
        if view != 'side':
            for sx in (-1, 1): ctx.move_to(sx*34, ty); ctx.line_to(sx*40, ty + 70); setc(ctx, PACKD); ctx.set_line_width(12); ctx.stroke()
    else:
        rrect(ctx, -58, ty + 5, 116, 100, 22); setc(ctx, PACK); ctx.fill(); rrect(ctx, -46, ty + 50, 92, 40, 12); setc(ctx, PACKD); ctx.fill()
    # braços
    hp = None
    if view == 'side':
        if arms == 'phone': hp = arm(1, 20, -120)
        elif arms == 'press': hp = arm(1, 80, 10)
        else: hp = arm(1, sw*.8, 10)
    else:
        hl = arm(-1, A[0][0], A[0][1]); hp = arm(1, A[1][0], A[1][1])
    if o.get('phone', True) and arms in ('phone', 'down', 'brace') and not fl:
        phone(ctx, hp[0] + (0 if view != 'side' else 10), hp[1] - 10, -15 if view != 'side' else 70, 1., o.get('cracked', False), o.get('glow', 1))
    # pescoço + cabeça
    hy = ty - 62 + breath * .4
    ctx.rectangle(-12, ty - 20, 24, 24); setc(ctx, SKIND); ctx.fill()
    head(ctx, (10 if view == 'side' else 0) + o.get('hx', 0), hy, 62, dict(o, view=view))
    ctx.restore()
    return hp

# ---------------- legendas ----------------
def caption(ctx, words, p, y=H*.5, size=118, hl=()):
    """1–3 palavras no meio da tela: branco com contorno preto, palavra-chave em amarelo; entra com pop"""
    if p <= 0 or not words: return
    ctx.select_font_face(FONT, cairo.FONT_SLANT_NORMAL, cairo.FONT_WEIGHT_NORMAL); ctx.set_font_size(size)
    sp = ctx.text_extents(' ').x_advance
    ext = [ctx.text_extents(w) for w in words]; tot = sum(e.x_advance for e in ext) + sp * (len(words) - 1)
    sc = size if tot < W*.9 else size * W*.9 / tot
    k = 1 + .35 * math.exp(-p * 9) * math.cos(p * 14) if p < 1 else 1
    ctx.save(); ctx.translate(W/2, y); ctx.scale(k * sc/size, k * sc/size); ctx.set_font_size(size)
    x = -tot/2
    for w, e in zip(words, ext):
        ctx.move_to(x, size*.36); ctx.text_path(w); ctx.set_line_join(cairo.LINE_JOIN_ROUND)
        setc(ctx, '#000000'); ctx.set_line_width(size*.2); ctx.stroke_preserve()
        setc(ctx, '#ffd23f' if w.strip('.,!?') in hl else '#ffffff'); ctx.fill()
        x += e.x_advance + sp
    ctx.restore()

def text(ctx, s, x, y, size, col='#ffffff', stroke=None, anchor='c', alpha=1.):
    ctx.select_font_face(FONT, cairo.FONT_SLANT_NORMAL, cairo.FONT_WEIGHT_NORMAL); ctx.set_font_size(size)
    e = ctx.text_extents(s); xx = x - (e.x_advance/2 if anchor == 'c' else (e.x_advance if anchor == 'r' else 0))
    ctx.move_to(xx, y + size*.36); ctx.text_path(s)
    if stroke: setc(ctx, stroke[0], alpha); ctx.set_line_width(stroke[1]); ctx.set_line_join(cairo.LINE_JOIN_ROUND); ctx.stroke_preserve()
    setc(ctx, col, alpha); ctx.fill()

# ---------------- pós: névoa, cor quente, vinheta, grão ----------------
_yy, _xx = np.mgrid[0:H, 0:W]
VIG = (1 - .55 * np.clip(((_xx - W/2)**2 / (W*.75)**2 + (_yy - H*.47)**2 / (H*.62)**2) - .25, 0, 1))[..., None].astype(np.float32)
rng = np.random.default_rng(3)
GRAIN = [(rng.standard_normal((H//2, W//2)).astype(np.float32)) for _ in range(6)]
def post(surf, fr, warm=1., grade=(1.04, .98, .9), vig=1.):
    buf = np.ndarray((H, W, 4), np.uint8, surf.get_data()).astype(np.float32)
    rgb = buf[..., 2::-1] / 255.  # BGRA -> RGB
    g = np.array(grade, np.float32); rgb = rgb * lerp(1, 1, 0) * (1 + (g - 1) * warm)
    lum = rgb.mean(-1, keepdims=True); rgb = lum + (rgb - lum) * .86          # pouco saturado
    rgb = rgb * (1 - (1 - VIG) * vig)
    gr = np.repeat(np.repeat(GRAIN[fr % 6], 2, 0), 2, 1)[..., None] * .022
    rgb = np.clip(rgb + gr, 0, 1)
    return (rgb * 255).astype(np.uint8)

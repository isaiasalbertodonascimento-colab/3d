# Cenas do vídeo "E se tu tivesse no décimo quinto andar..." — tudo desenhado com Cairo.
import math, cairo, numpy as np
from core import *

SKYTOP, SKYBOT = '#6b5a7a', '#f0b98a'

def sky(ctx, top=SKYTOP, bot=SKYBOT, y0=0, y1=H):
    g = cairo.LinearGradient(0, y0, 0, y1); g.add_color_stop_rgb(0, *hexc(top)[:3]); g.add_color_stop_rgb(1, *hexc(bot)[:3]); ctx.set_source(g); ctx.paint()
def fill(ctx, c, a=1.): setc(ctx, c, a); ctx.paint()
def fogband(ctx, y, h, c='#e8b48a', a=.35):
    g = cairo.LinearGradient(0, y - h, 0, y + h); g.add_color_stop_rgba(0, *hexc(c)[:3], 0); g.add_color_stop_rgba(.5, *hexc(c)[:3], a); g.add_color_stop_rgba(1, *hexc(c)[:3], 0)
    ctx.set_source(g); ctx.rectangle(0, y - h, W, 2*h); ctx.fill()
def glow(ctx, x, y, r, c, a=.6):
    g = cairo.RadialGradient(x, y, 0, x, y, r); g.add_color_stop_rgba(0, *hexc(c)[:3], a); g.add_color_stop_rgba(1, *hexc(c)[:3], 0); ctx.set_source(g); ctx.arc(x, y, r, 0, TAU); ctx.fill()
def put_boy(ctx, cam, P, o, h=1.62):
    a = cam.proj(P); b = cam.proj((P[0], P[1] + h, P[2])); s = (a[1] - b[1]) / 392
    if s <= 0: return None
    return boy(ctx, a[0], a[1], s, o), s
def shake(t, t0, amt=24, dec=7):
    if t < t0: return 0, 0
    k = math.exp(-(t - t0) * dec) * amt; fr = int(t * 30); return (rnd(fr) - .5) * 2 * k, (rnd(fr + 77) - .5) * 2 * k
def cam_xform(ctx, zoom=1., sx=0, sy=0, cx=W/2, cy=H/2):
    ctx.translate(cx + sx, cy + sy); ctx.scale(zoom, zoom); ctx.translate(-cx, -cy)
def sparks(ctx, x, y, t, n=26, spread=1., col='#ffb040', seed=0, dirx=1, g=1.):
    for i in range(n):
        ph = (t * 2.2 + rnd(i + seed)) % 1
        a = math.radians(-90 + (rnd(i * 3 + seed) - .5) * 160 * spread) ; v = 300 + rnd(i + 9 + seed) * 700
        px = x + math.cos(a) * v * ph * dirx; py = y + math.sin(a) * v * ph + 900 * ph * ph * g
        ln = 18 + 30 * (1 - ph)
        setc(ctx, col, 1 - ph); ctx.set_line_width(5 * (1 - ph) + 1.5); ctx.set_line_cap(cairo.LINE_CAP_ROUND)
        ctx.move_to(px, py); ctx.line_to(px - math.cos(a) * ln * dirx, py - math.sin(a) * ln - 30 * ph); ctx.stroke()
    glow(ctx, x, y, 140, '#ffb040', .55)

# ---------------- cenários reutilizáveis ----------------
STEEL, STEELD, WALL, CONC = '#9a9a9e', '#7d7e84', '#b9a48f', '#8d8379'
def cabin_interior(cam, ctx, lit=1., floor_y=0, red=0.):
    x0, x1, z0, z1, y1 = -1.0, 1.0, -1.6, 0.0, 2.3
    wall = mix(hexc('#c2b29a'), hexc('#2a2226'), 1 - lit); flo = mix(hexc('#6e5a4a'), hexc('#1c1618'), 1 - lit)
    if red: wall = mix(wall, hexc('#5a1a1a'), red * .5); flo = mix(flo, hexc('#3a1010'), red * .5)
    cam.face(ctx, [(x0, floor_y, z0), (x1, floor_y, z0), (x1, floor_y, z1), (x0, floor_y, z1)], flo, (0, 1, 0))
    cam.face(ctx, [(x0, floor_y+y1, z0), (x1, floor_y+y1, z0), (x1, floor_y+y1, z1), (x0, floor_y+y1, z1)], shade(wall, .8), (0, -1, 0))
    cam.face(ctx, [(x0, floor_y, z0), (x1, floor_y, z0), (x1, floor_y+y1, z0), (x0, floor_y+y1, z0)], wall, (0, 0, 1))
    cam.face(ctx, [(x0, floor_y, z0), (x0, floor_y, z1), (x0, floor_y+y1, z1), (x0, floor_y+y1, z0)], shade(wall, .92), (1, 0, 0))
    cam.face(ctx, [(x1, floor_y, z0), (x1, floor_y, z1), (x1, floor_y+y1, z1), (x1, floor_y+y1, z0)], shade(wall, .85), (-1, 0, 0))
    # painéis verticais, corrimão, luz do teto
    for x in (-.5, 0, .5): cam.face(ctx, [(x - .005, floor_y + .05, z0 + .01), (x + .005, floor_y + .05, z0 + .01), (x + .005, floor_y + y1 - .05, z0 + .01), (x - .005, floor_y + y1 - .05, z0 + .01)], shade(wall, .7), None)
    cam.face(ctx, [(x0 + .02, floor_y + .9, z0 + .03), (x1 - .02, floor_y + .9, z0 + .03), (x1 - .02, floor_y + .95, z0 + .03), (x0 + .02, floor_y + .95, z0 + .03)], '#c9b48a', None)
    if lit > .05:
        lc = mix(hexc('#3a3030'), hexc('#fff2d6'), lit)
        cam.face(ctx, [(-.5, floor_y+y1-.01, -1.1), (.5, floor_y+y1-.01, -1.1), (.5, floor_y+y1-.01, -.4), (-.5, floor_y+y1-.01, -.4)], lc, None, fog=False)
    # painel de botões na parede lateral direita
    cam.face(ctx, [(x1 - .01, floor_y + 1.0, -.35), (x1 - .01, floor_y + 1.0, -.15), (x1 - .01, floor_y + 1.5, -.15), (x1 - .01, floor_y + 1.5, -.35)], '#8a8a90', None)

def shaft_side(ctx, cam, ycab, t, floors=16, cut=True, dark=0., labels=True, cabin=True, cw=True):
    """corte lateral do prédio: lajes, paredes do poço, cabina e cabos"""
    FH = 3.0
    cam.face(ctx, [(-8, -2, -1.3), (8, -2, -1.3), (8, floors*FH + 4, -1.3), (-8, floors*FH + 4, -1.3)], mix(hexc('#6e6258'), hexc('#120e10'), dark), (0, 0, 1))
    for k in range(floors + 1):
        y = k * FH
        for xa, xb in ((-8, -1.4), (1.4, 8)):
            cam.box(ctx, xa, y - .25, -1.3, xb, y, 1.3, mix(hexc(CONC), hexc('#141012'), dark))
        if labels and 0 < k + 1 <= floors:
            p = cam.proj((-2.4, y + 1.4, 1.31))
            if -100 < p[1] < H + 100: text(ctx, f'{k+1}º', p[0], p[1], max(18, min(80, 2600 / p[2])), '#f2e6d4', ('#2a2020', 6), alpha=1 - dark*.7)
    # trilhos e cabos
    for x in (-1.25, 1.25): cam.box(ctx, x - .04, -1, -.1, x + .04, floors*FH + 3, .1, '#55565c')
    top = floors*FH + 3
    if cabin:
        cy = ycab
        if cw:
            cwy = top - (cy - 0) * .9 - 6
            cam.box(ctx, .95, cwy, -1.0, 1.25, cwy + 2.5, -.6, '#4a4a52')
        for x in (-.25, 0, .25):
            a = cam.proj((x, cy + 2.6, 0)); b = cam.proj((x, top, 0))
            setc(ctx, '#2b2b30'); ctx.set_line_width(max(2, 60 / a[2])); ctx.move_to(a[0], a[1]); ctx.line_to(b[0], b[1]); ctx.stroke()
        cam.box(ctx, -1.15, cy, -1.0, 1.15, cy + 2.5, 1.0, mix(hexc('#a89c88'), hexc('#1a1416'), dark))
        cam.box(ctx, -1.2, cy + 2.5, -1.05, 1.2, cy + 2.65, 1.05, mix(hexc('#6b6258'), hexc('#120e10'), dark))
        cam.box(ctx, -1.2, cy - .15, -1.05, 1.2, cy, 1.05, mix(hexc('#6b6258'), hexc('#120e10'), dark))
        p = cam.proj((0, cy + 1.25, 1.01))
        if not dark: glow(ctx, p[0], p[1], 200 / max(.5, p[2]) * 6, '#ffe2b0', .25)
    # casa de máquinas
    cam.box(ctx, -1.4, top, -1.3, 1.4, top + 2.5, 1.3, mix(hexc('#7a6e62'), hexc('#120e10'), dark))
    s = cam.proj((0, top - .3, 0)); setc(ctx, '#2b2b30'); ctx.arc(s[0], s[1], max(6, 250 / s[2]), 0, TAU); ctx.set_line_width(max(3, 50 / s[2])); ctx.stroke()

def gauge(ctx, x, y, r, v, vmax=80, label='KM/H'):
    ctx.arc(x, y, r + 14, 0, TAU); setc(ctx, '#1a1618', .92); ctx.fill()
    ctx.arc(x, y, r, 0, TAU); setc(ctx, '#f2ead8'); ctx.fill()
    a0, a1 = math.radians(135), math.radians(405)
    for k in range(0, vmax + 1, 10):
        a = lerp(a0, a1, k / vmax); setc(ctx, '#1a1618'); ctx.set_line_width(6)
        ctx.move_to(x + math.cos(a) * r * .8, y + math.sin(a) * r * .8); ctx.line_to(x + math.cos(a) * r * .95, y + math.sin(a) * r * .95); ctx.stroke()
        text(ctx, str(k), x + math.cos(a) * r * .65, y + math.sin(a) * r * .65, r * .13, '#1a1618')
    ctx.arc(x, y, r * .88, a0 + (a1 - a0) * 60 / vmax, a1); setc(ctx, '#e0402a', .8); ctx.set_line_width(14); ctx.stroke()
    a = lerp(a0, a1, cl(v / vmax)) + math.sin(v * 7) * .01
    setc(ctx, '#e0402a'); ctx.set_line_width(12); ctx.set_line_cap(cairo.LINE_CAP_ROUND); ctx.move_to(x, y); ctx.line_to(x + math.cos(a) * r * .82, y + math.sin(a) * r * .82); ctx.stroke()
    ctx.arc(x, y, 22, 0, TAU); setc(ctx, '#1a1618'); ctx.fill()
    text(ctx, f'{int(round(v))}', x, y + r * .42, r * .3, '#1a1618'); text(ctx, label, x, y + r * .68, r * .12, '#5a5050')

def floor_display(ctx, x, y, n, w=300, h=230, blink=1.):
    rrect(ctx, x - w/2 - 16, y - h/2 - 16, w + 32, h + 32, 26); setc(ctx, '#1a1618', .95); ctx.fill()
    rrect(ctx, x - w/2, y - h/2, w, h, 16); setc(ctx, '#2a0c0a'); ctx.fill()
    glow(ctx, x, y, w*.7, '#ff3a20', .25 * blink)
    text(ctx, f'{n:02d}', x + 30, y, h * .72, '#ff4a2a', alpha=blink)
    ctx.move_to(x - w*.36, y + 40); ctx.line_to(x - w*.36 - 30, y - 10); ctx.line_to(x - w*.36 + 30, y - 10); ctx.close_path()
    ctx.move_to(x - w*.36, y + 40); setc(ctx, '#ff4a2a', blink); ctx.fill()

# ---------------- cenas ----------------
def s01_rua(ctx, u, d, t):
    """garoto entra num prédio antigo do centro de SP, fim de tarde. contra-plongée, zoom lento"""
    sky(ctx, '#7a6a8c', '#f4b688')
    glow(ctx, W*.82, H*.42, 700, '#ffd8a0', .55)
    cam = Cam((-3.4 + u*.12, .45, 15.5 - u*.35), (.8, 7.5, 0), 64 - u*1.8, fog=(10, 70), fogc='#e8b08a', light=(.8, .5, .5))
    # prédio vizinho (fundo) e o prédio antigo
    cam.box(ctx, 7, 0, -6, 15, 22, -1, '#9a8a7e')
    for yy in range(2, 22, 3):
        for xx in (8.5, 11, 13.5): cam.face(ctx, [(xx, yy, -1 + .01), (xx + 1.2, yy, -1 + .01), (xx + 1.2, yy + 1.6, -1 + .01), (xx, yy + 1.6, -1 + .01)], '#4a4450', None)
    cam.box(ctx, -7, 0, -5, 6, 34, 0, '#c4ab8e')
    for k in range(1, 12):   # cornijas art déco
        cam.box(ctx, -7.2, k*3 - .2, -5, 6.2, k*3, .25, '#a8907a')
    for yy in range(4, 33, 3):
        for xx in (-5.5, -3.2, -.9, 1.4, 3.7):
            lit = rnd(xx * 7 + yy) > .72
            cam.face(ctx, [(xx, yy, .01), (xx + 1.3, yy, .01), (xx + 1.3, yy + 1.9, .01), (xx, yy + 1.9, .01)], '#ffcf8a' if lit else '#4a4252', None, fog=not lit)
    # entrada com marquise e porta iluminada
    cam.box(ctx, -1.6, 3.2, 0, 1.6, 3.45, 1.6, '#6a5446')
    cam.face(ctx, [(-1.1, 0, .02), (1.1, 0, .02), (1.1, 3.0, .02), (-1.1, 3.0, .02)], '#ffd9a0', None, fog=False)
    cam.face(ctx, [(-.05, 0, .03), (.05, 0, .03), (.05, 3.0, .03), (-.05, 3.0, .03)], '#3a2a24', None)
    p = cam.proj((0, 1.5, .1)); glow(ctx, p[0], p[1], 420, '#ffcf8a', .45)
    p = cam.proj((-.3, 4.2, .1)); text(ctx, 'EDIFÍCIO SÃO BENTO', p[0], p[1] + 30, 34, '#3a2a20')
    # calçada (pedra portuguesa) e rua
    cam.face(ctx, [(-12, 0, 0), (14, 0, 0), (14, 0, 6), (-12, 0, 6)], '#b6a596', (0, 1, 0))
    for k in range(-12, 14):
        for j in range(0, 6):
            if (k + j) % 2 == 0: cam.face(ctx, [(k, .002, j), (k + .5, .002, j), (k + .5, .002, j + .5), (k, .002, j + .5)], '#3e3a3e', None, alpha=.55)
    cam.face(ctx, [(-12, -.15, 6), (14, -.15, 6), (14, -.15, 20), (-12, -.15, 20)], '#5a5258', (0, 1, 0))
    # poste
    cam.box(ctx, 4.2, 0, 3, 4.35, 6, 3.15, '#2b2b30'); p = cam.proj((4.0, 6, 3.1)); glow(ctx, p[0], p[1], 160, '#ffd090', .5)
    # garoto andando até a porta
    k = seg(u, 0, d*.95); x = lerp(-3.2, -.3, ease(k)); z = lerp(10.5, 1.4, ease(k))
    view = 'side' if k < .75 else 'back'
    put_boy(ctx, cam, (x, 0, z), dict(t=t, view=view, dir=1, walk=t*1.5, arms='phone' if view == 'side' else 'down', look=.4))
    fogband(ctx, H*.62, 260, '#f0b890', .28)

def s02_botao(ctx, u, d, t):
    """close no dedo apertando o 15"""
    z = 1 + u * .05; cam_xform(ctx, z, 0, 0, W*.55, H*.45)
    g = cairo.LinearGradient(0, 0, W, H); g.add_color_stop_rgb(0, .62, .6, .58); g.add_color_stop_rgb(1, .42, .4, .4); ctx.set_source(g); ctx.paint()
    for k in range(260): setc(ctx, '#ffffff' if k % 2 else '#000000', .04); ctx.set_line_width(2); y = rnd(k) * H; ctx.move_to(0, y); ctx.line_to(W, y + 20); ctx.stroke()
    # placa
    rrect(ctx, 220, 260, 640, 1400, 40); setc(ctx, '#c9c8c6'); ctx.fill(); rrect(ctx, 220, 260, 640, 1400, 40); setc(ctx, '#7a7a80'); ctx.set_line_width(8); ctx.stroke()
    text(ctx, 'OTIS-SP  ·  CAP. 8 PESSOAS', 540, 330, 30, '#4a4a50')
    press = seg(u, .9, 1.15) - seg(u, 1.5, 1.8)
    for i in range(15):
        n = 15 - i; col, row = (n - 1) % 3, (n - 1) // 3
        bx, by = 360 + col * 180, 1480 - row * 230
        lit = n == 15 and u > 1.0
        ctx.arc(bx, by + 8, 66, 0, TAU); setc(ctx, '#000000', .25); ctx.fill()
        ctx.arc(bx, by, 66, 0, TAU); setc(ctx, '#8e8e94'); ctx.fill()
        dep = 6 * press if n == 15 else 0
        ctx.arc(bx, by + dep, 52, 0, TAU); setc(ctx, '#ffb24a' if lit else '#e8e6e0'); ctx.fill()
        if lit: glow(ctx, bx, by, 160, '#ffb040', .6)
        ctx.arc(bx, by + dep, 52, 0, TAU); setc(ctx, '#ff8a20' if lit else '#a8a8ae'); ctx.set_line_width(6); ctx.stroke()
        text(ctx, str(n), bx, by + dep, 44, '#5a2a00' if lit else '#3a3a40')
    # mão e dedo (pele morena clara), vindo de baixo à direita
    bx, by = 360 + 2*180, 1480 - 4*230
    k = ease(seg(u, .2, 1.0)) - .3 * ease(seg(u, 1.6, 2.4)); fx, fy = lerp(1100, bx + 6, k), lerp(1500, by + 30, k) + 6*press
    ctx.save(); ctx.translate(fx, fy); ctx.rotate(math.radians(-28))
    rrect(ctx, -46, 0, 92, 300, 46); setc(ctx, SKIN); ctx.fill()
    rrect(ctx, 10, 0, 36, 300, 18); setc(ctx, SKIND, .5); ctx.fill()
    ctx.save(); ctx.translate(-10, -10); ctx.scale(1, .8); ctx.arc(0, 0, 28, TAU/2, TAU); ctx.restore(); setc(ctx, '#e8c2a0'); ctx.fill()
    rrect(ctx, -110, 240, 220, 360, 90); setc(ctx, SKIN); ctx.fill()
    rrect(ctx, -110, 470, 220, 400, 40); setc(ctx, TEE); ctx.fill()
    ctx.restore()

def s03_porta(ctx, u, d, t):
    fill(ctx, '#3a3030')
    cam = Cam((0, 1.2, 3.6 - u*.12), (0, 1.25, -.8), 50, fog=(3, 12), fogc='#2a2228', light=(.2, .9, .4))
    cabin_interior(cam, ctx, 1)
    p = cam.proj((0, 2.29, -.75)); glow(ctx, p[0], p[1] + 60, 520, '#fff0d0', .35)
    put_boy(ctx, cam, (.1, 0, -.85), dict(t=t, view='front', arms='phone', lookY=1.0, look=-.2, glow=1))
    # luz do celular no rosto
    a = cam.proj((.05, 1.35, -.6)); glow(ctx, a[0], a[1], 150, '#a8d8ff', .25)
    # portas fechando
    k = ease(seg(u, .4, 2.2))
    for sx in (-1, 1):
        xa = sx * lerp(1.05, 0, k); xb = sx * 1.1 + sx * 0
        cam.face(ctx, [(min(xa, sx*1.1), 0, .05), (max(xa, sx*1.1), 0, .05), (max(xa, sx*1.1), 2.3, .05), (min(xa, sx*1.1), 2.3, .05)], '#a9a9ad', (0, 0, 1))
        if k > .02:
            e = cam.proj((xa, 1.15, .06)); setc(ctx, '#6a6a70'); ctx.set_line_width(5); a2 = cam.proj((xa, 0, .06)); b2 = cam.proj((xa, 2.3, .06)); ctx.move_to(a2[0], a2[1]); ctx.line_to(b2[0], b2[1]); ctx.stroke()
    # moldura e parede do hall
    for pts in ([(-3, -1, .1), (-1.1, -1, .1), (-1.1, 4, .1), (-3, 4, .1)], [(1.1, -1, .1), (3, -1, .1), (3, 4, .1), (1.1, 4, .1)], [(-1.1, 2.3, .1), (1.1, 2.3, .1), (1.1, 4, .1), (-1.1, 4, .1)]):
        cam.face(ctx, pts, '#8a6e58', (0, 0, 1))
    p = cam.proj((0, 2.6, .11)); floor_display(ctx, p[0], p[1], 0 if u < .1 else 1, 150, 90)

def s04_poco(ctx, u, d, t):
    fill(ctx, '#2a2024')
    yc = 6 + u * 2.4
    cam = Cam((7.5, yc - 2.5, 15), (0, yc + 3.5, 0), 58 - u*2, fog=(10, 40), fogc='#3a2a2a', light=(.7, .6, .6))
    shaft_side(ctx, cam, yc, t)
    fogband(ctx, H*.85, 300, '#4a3530', .4)

def strand_rope(ctx, x, y0, y1, w, t, broken=(), snap=None, shift=0):
    rrect(ctx, x - w/2, y0, w, y1 - y0, w*.3); setc(ctx, '#4a4a50'); ctx.fill()
    for k in range(int((y1 - y0) / 34) + 2):
        yy = y0 + k*34 + (shift % 34)
        for j in range(6):
            xa = x - w/2 + j*w/6
            if j in broken and abs(yy - H*.5) < 120: continue
            setc(ctx, ['#b8b8be', '#9a9aa0', '#c8c8ce'][j % 3]); ctx.set_line_width(w/6*.8)
            ctx.move_to(xa, yy); ctx.line_to(xa + w/6, yy + 34); ctx.stroke()

def s05_cabo(ctx, u, d, t):
    fill(ctx, '#1e1a1e')
    for k in range(40): setc(ctx, '#ffffff', .03); ctx.rectangle(rnd(k)*W, 0, 3, H); ctx.fill()
    sx, sy = shake(u, 0, 4 + 10*seg(u, 0, 2.4), 0)
    sx2, sy2 = shake(u, 2.45, 40, 6)
    cam_xform(ctx, 1.05 + u*.06, sx + sx2, sy + sy2)
    breaks = [.45, .85, 1.2, 1.55, 1.9, 2.2]; nb = sum(u > b for b in breaks)
    if u < 2.45:
        strand_rope(ctx, W/2, -100, H + 100, 220, t, broken=set(range(nb)))
        for j in range(nb):  # pontas soltas enroladas
            for sgn in (-1, 1):
                xa = W/2 - 110 + j*36 + 18; ctx.set_line_width(14); setc(ctx, '#c0c0c6'); ctx.move_to(xa, H*.5 + sgn*120)
                ctx.curve_to(xa + 30*sgn, H*.5 + sgn*60, xa + 60, H*.5 + sgn*40, xa + 40 + j*10, H*.5 + sgn*(30 + j*6)); ctx.stroke()
        for b in breaks:
            if 0 < u - b < .4: sparks(ctx, W/2 - 110 + breaks.index(b)*36 + 18, H*.5, u - b, 16, .8, seed=int(b*100))
    else:
        k = u - 2.45
        ctx.save(); ctx.translate(0, -k*2600); strand_rope(ctx, W/2, -400, H*.5 - 60, 220, t); ctx.restore()
        ctx.save(); ctx.translate(0, k*1500); strand_rope(ctx, W/2, H*.5 + 60, H + 400, 220, t); ctx.restore()
        sparks(ctx, W/2, H*.5, k, 40, 1.3, seed=5); glow(ctx, W/2, H*.5, 500, '#fff0c0', .7*math.exp(-k*6))
    # rótulo técnico
    text(ctx, 'CABO DE AÇO · 6 PERNAS', W/2, 220, 34, '#c8c0b8')

def s06_queda(ctx, u, d, t):
    fl = 1 if (int(t*14) % 5) else .35
    fill(ctx, '#1a1416')
    sx, sy = shake(t, 0, 10, 0)
    cam_xform(ctx, 1.04 + u*.04, sx, sy)
    cam = Cam((.0, .55, 1.6), (0, 1.5, -1.2), 64, fog=(2, 9), fogc='#1a1416', light=(.2, .9, .4))
    cabin_interior(cam, ctx, .85*fl)
    p = cam.proj((0, 2.29, -.75)); glow(ctx, p[0], p[1] + 60, 460, '#fff0d0', .3*fl)
    rot = math.sin(t*2) * 18 + u*20
    put_boy(ctx, cam, (0, .45 + math.sin(t*3)*.08, -.8), dict(t=t, view='front', float=1, arms='float', wide=1, mouth=.7, rot=rot, shadow=False, phone=False, brow=1))
    a = cam.proj((.55 + math.sin(t*2.5)*.1, 1.7 + math.sin(t*3)*.1, -.5)); phone(ctx, a[0], a[1], t*260, 1.6)
    # riscos de velocidade subindo
    for k in range(30):
        x = rnd(k)*W; y = (rnd(k+3)*H - t*3000) % (H + 400) - 200
        setc(ctx, '#ffffff', .12); ctx.set_line_width(3 + rnd(k)*4); ctx.move_to(x, y); ctx.line_to(x, y + 220); ctx.stroke()

def s07_hud(ctx, u, d, t):
    fill(ctx, '#201a1c')
    # parede do poço passando muito rápido
    for k in range(9):
        y = (k*260 - t*2400) % (H + 260) - 130
        setc(ctx, '#3a3034'); ctx.rectangle(0, y, W, 60); ctx.fill(); setc(ctx, '#4a3e40'); ctx.rectangle(0, y, W, 10); ctx.fill()
    for k in range(40):
        x = rnd(k)*W; y = (rnd(k+3)*H - t*3800) % (H + 400) - 200; setc(ctx, '#ffffff', .1); ctx.set_line_width(3); ctx.move_to(x, y); ctx.line_to(x, y + 300); ctx.stroke()
    sx, sy = shake(t, 0, 6, 0)
    cut = u > 2.0
    floor = 15 - int(seg(u, 0, d) * 7.99)
    v = 60 * eo(seg(u, .1, 3.4))
    if not cut:
        cam_xform(ctx, 1 + u*.03, sx, sy)
        floor_display(ctx, 540, 700, floor, 380, 280, 1 if int(t*6) % 2 else .75); text(ctx, 'ANDAR', 540, 520, 44, '#e8d8c8')
        gauge(ctx, 540, 1300, 310, v)
    else:
        cam_xform(ctx, 1.15 + (u - 2)*.04, sx, sy, 760, 1100)
        gauge(ctx, 620, 1080, 330, v)
        floor_display(ctx, 860, 520, floor, 220, 170, 1 if int(t*6) % 2 else .75)

def s08_fundo(ctx, u, d, t):
    fill(ctx, '#0e0a0c')
    sx, sy = shake(t, 0, 18 + u*10, 0)
    cam_xform(ctx, 1, sx, sy)
    yc = lerp(30, 6, eo(seg(u, 0, d)))
    cam = Cam((0, yc, .3), (0, yc - 10, -.9), 75, fog=(2, 30), fogc='#0e0a0c', light=(.3, .8, .5))
    for k in range(12, -1, -1):
        y = k * 3
        for pts, n in ((([-1.3, y, -1.3], [1.3, y, -1.3], [1.3, y + 3, -1.3], [-1.3, y + 3, -1.3]), (0, 0, 1)), (([-1.3, y, -1.3], [-1.3, y, 1.3], [-1.3, y + 3, 1.3], [-1.3, y + 3, -1.3]), (1, 0, 0)),
                       (([1.3, y, -1.3], [1.3, y, 1.3], [1.3, y + 3, 1.3], [1.3, y + 3, -1.3]), (-1, 0, 0))):
            if y + 3 < yc: cam.face(ctx, pts, '#5a4a44' if k % 2 else '#4e4040', n)
        if y < yc: cam.face(ctx, [(-1.3, y + 2.6, -1.29), (1.3, y + 2.6, -1.29), (1.3, y + 2.9, -1.29), (-1.3, y + 2.9, -1.29)], '#2a2020', None)
    cam.face(ctx, [(-1.3, 0, -1.3), (1.3, 0, -1.3), (1.3, 0, 1.3), (-1.3, 0, 1.3)], '#2a2428', (0, 1, 0))
    for x in (-.6, .6): cam.box(ctx, x - .18, 0, -.18, x + .18, .9, .18, '#7a2a20')   # para-choques
    for x in (-1.25, 1.25): cam.box(ctx, x - .04, 0, -.1, x + .04, 40, .1, '#55565c')

def s09_olhos(ctx, u, d, t):
    fill(ctx, '#050405')
    z = 1 + u*.05; cam_xform(ctx, z)
    ctx.save(); ctx.translate(W/2, H*.52); ctx.scale(6.2, 6.2)
    head(ctx, 0, 0, 62, dict(t=t, wide=1.3, mouth=0, look=math.sin(t*9)*.15))
    ctx.restore()
    # escuridão: só os olhos ficam visíveis
    g = cairo.RadialGradient(W/2, H*.5, 50, W/2, H*.5, 900)
    g.add_color_stop_rgba(0, 0, 0, 0, .82); g.add_color_stop_rgba(1, 0, 0, 0, .97); ctx.set_source(g); ctx.paint()
    for sxx in (-1, 1):
        ex, ey = W/2 + sxx*62*.33*6.2*z, H*.52 - 62*.02*6.2
        ctx.arc(ex, ey, 62*(.17*1.3 + .06)*6.2*z, 0, TAU); setc(ctx, '#e8e4dc'); ctx.fill()
        ctx.arc(ex + math.sin(t*9)*12, ey, 62*.085*6.2*z, 0, TAU); setc(ctx, '#0a0808'); ctx.fill()
        ctx.arc(ex + math.sin(t*9)*12 + 12, ey - 14, 10, 0, TAU); setc(ctx, '#ffffff'); ctx.fill()

def s10_freio(ctx, u, d, t):
    fill(ctx, '#241c1e')
    cut = u > 2.4; v0 = max(0, 1 - seg(u, .5, d))
    sx, sy = shake(t, 0, 14*v0 + 4, 0)
    ctx.translate(50, -10); cam_xform(ctx, (1.3 + u*.05) if not cut else (1.8 + (u - 2.4)*.06), sx, sy, 490, 910)
    ctx.rectangle(-400, -400, 2400, 3000); setc(ctx, '#3a2e2c'); ctx.fill()
    for k in range(30): setc(ctx, '#000000', .12); ctx.rectangle(-400, (k*140 + t*2600*v0) % 2600 - 400, 2400, 14); ctx.fill()
    # trilho em T (de lado, vertical) com marcas passando
    off = (t * 2600 * v0) % 120
    ctx.rectangle(430, 0, 120, H); setc(ctx, '#6e7078'); ctx.fill(); ctx.rectangle(470, 0, 40, H); setc(ctx, '#9a9ca4'); ctx.fill()
    for k in range(20):
        y = (k*120 + off) % (H + 120) - 60; setc(ctx, '#4a4c52'); ctx.rectangle(430, y, 120, 6); ctx.fill()
    if u > .6:   # risco quente onde as garras raspam
        ctx.rectangle(470, H*.44, 40, H*.56); g = cairo.LinearGradient(0, H*.44, 0, H); g.add_color_stop_rgba(0, 1, .55, .2, .9); g.add_color_stop_rgba(1, 1, .55, .2, 0); ctx.set_source(g); ctx.fill()
    # estrutura da cabina e bloco do freio
    ctx.rectangle(560, 500, 520, 1000); setc(ctx, '#8a7e70'); ctx.fill(); ctx.rectangle(560, 500, 520, 1000); setc(ctx, '#5a5048'); ctx.set_line_width(10); ctx.stroke()
    for y in (620, 1380):
        ctx.rectangle(560, y, 520, 30); setc(ctx, '#6a6058'); ctx.fill()
    rrect(ctx, 360, 760, 330, 300, 20); setc(ctx, '#3e4046'); ctx.fill()
    k = ease(seg(u, .5, .75))
    for sgn in (-1, 1):  # garras (cunhas) fechando no trilho
        gx = 490 + sgn * lerp(120, 66, k)
        ctx.move_to(gx, 790); ctx.line_to(gx + sgn*50, 790); ctx.line_to(gx + sgn*50, 1030); ctx.line_to(gx, 1000); ctx.close_path(); setc(ctx, '#c9a24a'); ctx.fill()
        for j in range(6): setc(ctx, '#8a6a20'); ctx.set_line_width(4); ctx.move_to(gx, 810 + j*32); ctx.line_to(gx + sgn*40, 800 + j*32); ctx.stroke()
    text(ctx, 'GARRA', 300, 900, 34, '#f0e6d6', ('#141414', 8)); text(ctx, 'TRILHO', 490, 300, 34, '#f0e6d6', ('#141414', 8))
    if u > .55 and v0 > .05:
        sparks(ctx, 490, 1040, t, int(40*v0) + 8, 1.4, seed=3, dirx=-1, g=1.2); sparks(ctx, 490, 1040, t + .5, int(30*v0) + 6, 1.2, seed=9, dirx=1, g=1.2)

def s11_parou(ctx, u, d, t):
    cut = u > 2.0
    if not cut:
        fill(ctx, '#2a2024')
        stop = seg(u, 0, .3); yc = lerp(7.8, 7.2, eo(stop)) + (math.sin(u*40)*.06*math.exp(-u*5) if u > .3 else 0)
        sx, sy = shake(u, .3, 30, 6)
        cam_xform(ctx, 1 + u*.03, sx, sy)
        cam = Cam((7, 6, 13), (0, 8.4, 0), 52, fog=(10, 40), fogc='#3a2a2a')
        shaft_side(ctx, cam, yc, t, floors=8, cw=False)
        gauge(ctx, 820, 330, 190, 60 * (1 - eo(seg(u, 0, .35))))
    else:
        fill(ctx, '#1a1416')
        sx, sy = shake(u, 2.0, 8, 4); cam_xform(ctx, 1.02 + (u - 2)*.03, sx, sy)
        cam = Cam((0, .9, 2.6), (0, 1.0, -1.0), 58, fog=(3, 10), fogc='#1a1416', light=(.2, .9, .4))
        cabin_interior(cam, ctx, .7)
        put_boy(ctx, cam, (0, 0, -.8), dict(t=t, view='front', sit=True, arms='brace', wide=1, mouth=.5, pant=1, brow=1, phone=False))
        floor_display(ctx, 540, 260, 4, 180, 130, .4 + .6*(int(t*3) % 2))

def s12_diagrama(ctx, u, d, t):
    fill(ctx, '#1d3550')
    for k in range(0, W, 60): setc(ctx, '#ffffff', .07); ctx.rectangle(k, 0, 2, H); ctx.fill()
    for k in range(0, H, 60): setc(ctx, '#ffffff', .07); ctx.rectangle(0, k, W, 2); ctx.fill()
    cut = u > 2.6
    cam_xform(ctx, (1 + u*.03) if not cut else 1.6 + (u - 2.6)*.05, 0, 0, W/2, 420 if cut else H/2)
    line = lambda *p: (ctx.move_to(*p[0]), [ctx.line_to(*q) for q in p[1:]], ctx.stroke())
    setc(ctx, '#eaf2ff'); ctx.set_line_width(6)
    # trilho, cabina, polia do limitador, cabo em laço, polia tensora
    line((260, 200), (260, 1750)); line((300, 200), (300, 1750))
    rrect(ctx, 320, 900, 360, 420, 10); ctx.stroke()
    text(ctx, 'CABINA', 500, 1110, 44, '#eaf2ff')
    gx, gy, gr = 760, 330, 120; ang = t * (6 if u < 1.6 else 14)
    ctx.arc(gx, gy, gr, 0, TAU); ctx.stroke()
    for k in range(6): a = ang + k*TAU/6; line((gx, gy), (gx + math.cos(a)*gr, gy + math.sin(a)*gr))
    fw = 1 + .35*seg(u, 1.6, 2.2)   # contrapesos (centrífugos) abrindo
    for k in (0, 1):
        a = ang + k*math.pi; ctx.arc(gx + math.cos(a)*gr*.55*fw, gy + math.sin(a)*gr*.55*fw, 22, 0, TAU); setc(ctx, '#ffd23f'); ctx.fill()
    setc(ctx, '#eaf2ff'); ctx.set_line_width(6)
    line((gx - gr, gy), (gx - gr, 1650)); line((gx + gr, gy), (gx + gr, 1650)); ctx.arc(gx, 1650, gr, 0, math.pi); ctx.stroke()
    # braço que puxa as garras
    pull = seg(u, 2.0, 2.4) * 30
    line((gx - gr, 950 - pull), (680, 950 - pull)); line((680, 950 - pull), (330, 1300 - pull))
    for sgn in (-1, 1): ctx.move_to(280 + sgn*28, 1290); ctx.line_to(280 + sgn*(28 - pull*.4), 1340); ctx.line_to(280 + sgn*50, 1340); ctx.close_path(); setc(ctx, '#ffd23f'); ctx.fill()
    setc(ctx, '#eaf2ff'); ctx.set_line_width(6)
    def lab(s, x, y, ax, ay, p):
        if p <= 0: return
        text(ctx, s, x, y, 46, '#ffd23f', ('#0e1a28', 10), alpha=cl(p*3)); setc(ctx, '#ffd23f', cl(p*3)); ctx.set_line_width(5)
        ctx.move_to(x, y + 40); ctx.line_to(ax, ay); ctx.stroke(); ctx.arc(ax, ay, 10, 0, TAU); ctx.fill()
    lab('LIMITADOR DE VELOCIDADE', 560, 110, gx, gy - gr, seg(u, .2, .5))
    lab('CABO DO LIMITADOR', 760, 760, gx + gr, 800, seg(u, .7, 1.0))
    lab('GARRAS DE FREIO', 300, 1480, 280, 1330, seg(u, 1.2, 1.5))
    lab('TRILHO', 280, 1780, 280, 1700, seg(u, 1.4, 1.7))
    if u > 2.0:
        text(ctx, 'RÁPIDO DEMAIS → TRAVA!', W/2, 1880 if not cut else 640, 50, '#ff8a6a', ('#0e1a28', 10))

def s13_otis(ctx, u, d, t):
    fill(ctx, '#2a2018')
    cut = u > 2.0
    cam_xform(ctx, (1 + u*.04) if not cut else 1.5 + (u - 2)*.05, 0, 0, W/2, 900 if cut else H/2)
    rrect(ctx, 100, 180, 880, 1500, 20); setc(ctx, '#e8d6b0'); ctx.fill(); rrect(ctx, 100, 180, 880, 1500, 20); setc(ctx, '#6a4a2a'); ctx.set_line_width(16); ctx.stroke()
    for k in range(120): setc(ctx, '#8a6a40', .08); ctx.arc(120 + rnd(k)*840, 200 + rnd(k+2)*1460, 4 + rnd(k+4)*16, 0, TAU); ctx.fill()
    # torre de madeira com trilhos
    ink = '#3a2614'
    for x in (300, 780):
        ctx.rectangle(x - 18, 320, 36, 1150); setc(ctx, '#8a5a30'); ctx.fill()
        for y in range(360, 1460, 46): setc(ctx, ink); ctx.move_to(x + (18 if x < 500 else -18), y); ctx.line_to(x + (30 if x < 500 else -30), y + 14); ctx.set_line_width(5); ctx.stroke()
    ctx.rectangle(282, 300, 516, 40); setc(ctx, '#8a5a30'); ctx.fill()
    cutp = seg(u, 1.3, 1.5); drop = 30 * eo(seg(u, 1.4, 1.6))
    py = 900 + drop
    # corda (cortada)
    setc(ctx, '#7a5a3a'); ctx.set_line_width(12)
    if cutp < 1: ctx.move_to(540, 340); ctx.line_to(540, py - 260); ctx.stroke()
    else:
        ctx.move_to(540, 340); ctx.line_to(540 + 20, 520 - (u - 1.5)*300); ctx.stroke(); ctx.move_to(540, py - 260); ctx.line_to(525, py - 360 + drop); ctx.stroke()
    # plataforma
    ctx.rectangle(318, py, 444, 44); setc(ctx, '#6a4424'); ctx.fill(); ctx.move_to(330, py); ctx.line_to(540, py - 260); ctx.line_to(750, py); setc(ctx, ink); ctx.set_line_width(6); ctx.stroke()
    for x in range(360, 730, 70): ctx.rectangle(x, py - 60, 40, 60); setc(ctx, '#9a6a3a'); ctx.fill()  # caixas
    # homem de cartola (silhueta estilizada) com o braço aberto
    mx, my = 560, py
    ctx.rectangle(mx - 40, my - 190, 80, 150); setc(ctx, '#2a1e18'); ctx.fill()
    ctx.rectangle(mx - 28, my - 40, 22, 40); ctx.rectangle(mx + 6, my - 40, 22, 40); ctx.fill()
    ctx.arc(mx, my - 225, 36, 0, TAU); setc(ctx, '#e0b890'); ctx.fill()
    ctx.rectangle(mx - 40, my - 262, 80, 10); ctx.rectangle(mx - 26, my - 330, 52, 72); setc(ctx, '#141010'); ctx.fill()
    setc(ctx, '#2a1e18'); ctx.set_line_width(22); ctx.set_line_cap(cairo.LINE_CAP_ROUND); ctx.move_to(mx + 30, my - 170); ctx.line_to(mx + 130, my - 250 + 30*cutp); ctx.stroke()
    # lâmina cortando a corda
    bx = lerp(700, 545, seg(u, .9, 1.35)); ctx.move_to(bx, py - 380); ctx.line_to(bx + 120, py - 400); ctx.line_to(bx + 120, py - 360); ctx.close_path(); setc(ctx, '#c8c8cc'); ctx.fill()
    # selo
    sp = back = seg(u, .1, .45)
    if sp > 0:
        k = 1 + .4*math.exp(-sp*8)*math.cos(sp*12)
        ctx.save(); ctx.translate(540, 1530); ctx.scale(k, k)
        for j in range(24): a = j/24*TAU; ctx.line_to(math.cos(a)*(150 if j % 2 else 135), math.sin(a)*(150 if j % 2 else 135))
        ctx.close_path(); setc(ctx, '#b8322a'); ctx.fill(); ctx.arc(0, 0, 112, 0, TAU); setc(ctx, '#f2e2c0'); ctx.set_line_width(6); ctx.stroke()
        text(ctx, '1853', 0, -20, 66, '#f2e2c0'); text(ctx, 'ELISHA OTIS', 0, 48, 30, '#f2e2c0')
        ctx.restore()
    if cutp >= 1: text(ctx, '"TUDO SEGURO!"', 540, 260 + 0, 44, ink)

def s14_sentado(ctx, u, d, t):
    fill(ctx, '#1a1416')
    cut = u > 2.0
    if not cut: cam = Cam((-.3, .6, 2.4), (0, .7, -1.0), 60, fog=(3, 10), fogc='#1a1416', light=(.2, .9, .4))
    else: cam = Cam((0, .78, .5), (0, .78, -1.0), 44, fog=(3, 10), fogc='#1a1416', light=(.2, .9, .4))
    cam_xform(ctx, 1 + u*.02)
    cabin_interior(cam, ctx, .7)
    put_boy(ctx, cam, (0, 0, -.9), dict(t=t, view='front', sit=True, arms='down', mouth=.45 + .3*math.sin(t*4), pant=1, blink=1 if (t*1.3) % 2.2 < .12 else 0, phone=False, look=.0))
    a = cam.proj((.55, .01, -.5)); phone(ctx, a[0], a[1], 70, 1.6 if not cut else 2.6, cracked=True, glow=.6)
    if cut:   # vapor do respiro
        for k in range(3):
            ph = (t*.8 + k/3) % 1; p = cam.proj((0, .95 + ph*.2, -.6)); setc(ctx, '#ffffff', .12*(1 - ph)); ctx.arc(p[0] + ph*60, p[1], 40 + ph*80, 0, TAU); ctx.fill()

def s15_apaga(ctx, u, d, t):
    fill(ctx, '#0c0a0b')
    pat = [1, 1, 0, 1, 0, 0, 1, 0, 1, 0, 0, 0]
    lit = 0 if u > 1.3 else (pat[int(u*10) % len(pat)] if u > .4 else 1)
    cut = u > 2.0
    sx, sy = shake(u, 1.4, 10, 3) if u > 1.4 else (0, 0)
    cam_xform(ctx, 1 + u*.03, sx, sy)
    if not cut:
        cam = Cam((0, .9, 2.4), (0, 1.2, -1.0), 58, fog=(3, 10), fogc='#0c0a0b', light=(.2, .9, .4))
        cabin_interior(cam, ctx, .75*lit, red=.6*(1 - lit))
        put_boy(ctx, cam, (0, 0, -.9), dict(t=t, view='front', sit=True, arms='down', wide=1 if u > 1.3 else 0, lookY=-1 if u > 1.3 else 0, brow=1, phone=False))
    else:
        cam = Cam((0, 1.6, .2), (0, 2.6, -1.0), 62, fog=(2, 8), fogc='#0c0a0b', light=(.2, .9, .4))
        cabin_interior(cam, ctx, .08, red=.8)
        for k in range(14):  # poeira caindo do teto
            ph = (t*.7 + rnd(k)) % 1; setc(ctx, '#c8b8a8', .5*(1 - ph)); ctx.arc(W*.3 + rnd(k+2)*W*.4, 300 + ph*1200, 4, 0, TAU); ctx.fill()
    if lit < .5: fill(ctx, '#300808', .35)

def s16_sobe(ctx, u, d, t):
    fill(ctx, '#060506')
    cut = u > 2.0
    if not cut:
        cy = lerp(7.4, 10.8, ease(seg(u, 0, 2.0)))
        cam = Cam((3.2, cy, 5), (0, cy + 1.6 - u*1.0, 0), 60, fog=(4, 20), fogc='#060506', light=(.3, .8, .5))
    else:
        cam = Cam((1.6, 11.2, 3.2), (0, 9.8, 0), 55, fog=(4, 20), fogc='#060506', light=(.3, .8, .5))
    shaft_side(ctx, cam, 7.2, t, floors=8, dark=.82, labels=False, cw=False)
    # algo escuro se mexendo em cima da cabina
    p = cam.proj((math.sin(t*1.7)*.25, 7.2 + 2.65 + .45, .1)); s = 520 / p[2]
    ctx.save(); ctx.translate(p[0], p[1]); ctx.scale(s/100, s/100)
    sh = math.sin(t*3)*6
    ctx.move_to(-90, 50); ctx.curve_to(-100, -30 + sh, -40, -90, 0, -80); ctx.curve_to(50, -90, 100, -30 - sh, 90, 50); ctx.close_path(); setc(ctx, '#020102'); ctx.fill()
    for k in range(4):
        a = -.4 + k*.27 + math.sin(t*4 + k)*.08; ctx.move_to(-60 + k*40, 30); ctx.line_to(-60 + k*40 + math.sin(a)*90, 50 + math.cos(a)*40); ctx.set_line_width(12); ctx.stroke()
    if (t*0.9) % 3 > .2:
        for sx in (-22, 22): ctx.arc(sx, -40, 7, 0, TAU); setc(ctx, '#ff3a20', .9); ctx.fill()
    ctx.restore()
    glow(ctx, p[0], p[1] - 40*s/100, 80*s/100, '#ff3a20', .15)

def s17_parte2(ctx, u, d, t):
    fill(ctx, '#000000')

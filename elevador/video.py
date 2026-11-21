# python3 video.py test 1.5,20,30   -> test/tX.png  |  python3 video.py render ini fim saida.mp4
import sys, subprocess, math, cairo, numpy as np
from core import *
import scenes as S

# (início, fim, cena, legendas [(t_rel, palavras)], destaques)
SC = [
 (0, 3, S.s01_rua, [(.2, 'E SE TU'), (1.4, 'TIVESSE...')], {'TIVESSE...', 'TIVESSE'}),
 (3, 6, S.s02_botao, [(.1, '...NO DÉCIMO'), (1.4, 'QUINTO ANDAR')], {'DÉCIMO', 'QUINTO'}),
 (6, 9, S.s03_porta, [(.2, 'VOLTANDO'), (1.4, 'PRA CASA.')], {'CASA'}),
 (9, 12, S.s04_poco, [(.4, 'E, DO NADA...')], {'NADA...', 'NADA'}),
 (12, 15, S.s05_cabo, [(.2, 'O CABO'), (2.45, 'ARREBENTA.')], {'ARREBENTA'}),
 (15, 18, S.s06_queda, [(.2, 'QUEDA LIVRE.')], {'QUEDA', 'LIVRE'}),
 (18, 22, S.s07_hud, [(.1, '#KMH')], set()),
 (22, 25, S.s08_fundo, [(.1, '#MET'), (1.8, 'DE QUEDA.')], {'METROS', 'QUEDA'}),
 (25, 28, S.s09_olhos, [(1.0, 'MAS...')], {'MAS...', 'MAS'}),
 (28, 33, S.s10_freio, [(.4, 'FREIO DE'), (1.6, 'SEGURANÇA.')], {'FREIO', 'SEGURANÇA'}),
 (33, 37, S.s11_parou, [(.35, 'PAROU.')], {'PAROU'}),
 (37, 42, S.s12_diagrama, [(.2, 'TODO ELEVADOR'), (2.6, 'TEM ISSO.')], {'ISSO', 'ELEVADOR'}),
 (42, 46, S.s13_otis, [(.6, 'DESDE 1853.')], {'1853'}),
 (46, 50, S.s14_sentado, [(.4, 'TU'), (1.2, 'SOBREVIVE.')], {'SOBREVIVE'}),
 (50, 54, S.s15_apaga, [(1.4, 'SÓ QUE...')], {'SÓ', 'QUE...', 'QUE'}),
 (54, 58, S.s16_sobe, [(.3, 'TU NÃO'), (1.8, 'TÁ SOZINHO.')], {'SOZINHO'}),
 (58, 60.5, S.s17_parte2, [(.0, '#P2')], {'2?'}),
]
TOTAL = 60.5
CAP_Y = {6: H*.15, 4: H*.82, 11: H*.18, 12: H*.92, 13: H*.08, 7: H*.5}

def frame(t):
    surf = cairo.ImageSurface(cairo.FORMAT_ARGB32, W, H); ctx = cairo.Context(surf)
    i = max(k for k, s in enumerate(SC) if t >= s[0]); s0, s1, fn, caps, hl = SC[i]; u, d = t - s0, s1 - s0
    ctx.save(); fn(ctx, u, d, t); ctx.restore()
    # legenda: 1–3 palavras no meio, pop ao entrar
    cur = [c for c in caps if u >= c[0]]
    if cur:
        tc, txt = cur[-1]; p = (u - tc) / .25
        if txt == '#KMH': v = int(round(60 * eo(seg(u, .1, 3.4)))); caption(ctx, [str(v), 'KM/H'], max(p, 1) if u > .3 else p, CAP_Y.get(i, H*.5), 150, {str(v), 'KM/H'})
        elif txt == '#MET': v = int(round(45 * eo(seg(u, .1, 1.7)))); caption(ctx, [str(v), 'METROS'], p, CAP_Y.get(i, H*.5), 130, {str(v), 'METROS'})
        elif txt == '#P2': k = 1 + .08 * math.sin(u * 6); ctx.save(); ctx.translate(W/2, H/2); ctx.scale(k, k); ctx.translate(-W/2, -H/2); caption(ctx, ['PARTE', '2?'], 2, H*.5, 170, {'2?'}); ctx.restore()
        else: caption(ctx, txt.split(), p, CAP_Y.get(i, H*.5), 120, hl)
    # corte: flash curto de entrada de cena
    if i > 0 and u < .08: ctx.set_source_rgba(1, .95, .9, .25 * (1 - u / .08)); ctx.paint()
    if i == 16: ctx.set_source_rgba(0, 0, 0, 1 - seg(u, 0, .3)); ctx.paint() if u < .3 else None
    surf.flush()
    warm = .4 if i in (11,) else 1.
    return post(surf, int(t * FPS), warm=warm, vig=1.)

if __name__ == '__main__':
    mode = sys.argv[1]
    if mode == 'test':
        from PIL import Image; import os; os.makedirs('test', exist_ok=True)
        for t in map(float, sys.argv[2].split(',')): Image.fromarray(frame(t)).save(f'test/t{t:05.2f}.png'); print(t)
    else:
        a, b, out = int(sys.argv[2]), int(sys.argv[3]), sys.argv[4]
        ff = subprocess.Popen(['ffmpeg', '-y', '-loglevel', 'error', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', f'{W}x{H}', '-r', str(FPS), '-i', '-', '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '18', '-pix_fmt', 'yuv420p', out], stdin=subprocess.PIPE)
        for f in range(a, b): ff.stdin.write(frame(f / FPS).tobytes())
        ff.stdin.close(); ff.wait(); print('ok', out)

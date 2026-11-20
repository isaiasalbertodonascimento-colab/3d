# Aponta trechos "parados" de um vídeo: compara quadros a cada 0,5 s (ignorando a faixa da legenda).
# Também lista planos longos sem corte (> 4 s). Uso: python3 kit/static_check.py video.mp4 [limiar=5]
import sys, subprocess, numpy as np
src = sys.argv[1]; thr = float(sys.argv[2]) if len(sys.argv) > 2 else 5.0
W, H = 135, 240
raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', src, '-vf', f'fps=2,scale={W}:{H},format=gray', '-f', 'rawvideo', '-'], capture_output=True, check=True).stdout
fr = np.frombuffer(raw, np.uint8).reshape(-1, H, W).astype(np.float32)
mask = np.ones((H, W), bool); mask[int(H * .74):int(H * .86)] = False   # faixa da legenda (y 1420-1650 em 1920)
d = [float(np.abs(fr[i + 1] - fr[i])[mask].mean()) for i in range(len(fr) - 1)]
bad = [i for i, v in enumerate(d) if v < thr]
runs, s = [], None
for i in range(len(d) + 1):
    if i < len(d) and i in bad: s = i if s is None else s
    elif s is not None:
        if i - s >= 2: runs.append((s / 2, i / 2))
        s = None
print(f'movimento médio: {np.mean(d):.2f} | trechos parados (>=1 s, mudança < {thr}): {len(runs)}')
for a, b in runs: print(f'  {a:5.1f}s - {b:5.1f}s')
print(f'parado: {sum(b - a for a, b in runs):.1f}s de {len(d) / 2:.1f}s')
sc = subprocess.run(['ffmpeg', '-hide_banner', '-i', src, '-vf', 'scdet=threshold=10', '-an', '-f', 'null', '-'], capture_output=True, text=True).stderr
import re
cuts = [0] + sorted({round(float(x), 1) for x in re.findall(r'lavfi\.scd\.time: ([0-9.]+)', sc)}) + [len(d) / 2]
longs = [(a, b) for a, b in zip(cuts, cuts[1:]) if b - a > 4]
print(f'cortes: {len(cuts) - 2} | planos com mais de 4 s sem corte: {len(longs)}')
for a, b in longs: print(f'  {a:5.1f}s - {b:5.1f}s ({b - a:.1f}s)')

# Trilha + efeitos sonoros sintetizados (só numpy). Saída: audio/trilha.wav (48 kHz estéreo)
import numpy as np, wave, os
SR = 48000; T = 26.0; N = int(SR * T)
rng = np.random.default_rng(3)
L = np.zeros(N); Rr = np.zeros(N)

def put(sig, t, g=1.0, pan=0.0):
    i = int(t * SR); n = min(len(sig), N - i)
    if n <= 0: return
    L[i:i+n] += sig[:n] * g * np.sqrt(.5 - pan * .5) * 1.41
    Rr[i:i+n] += sig[:n] * g * np.sqrt(.5 + pan * .5) * 1.41

def env(n, a=.005, d=.2):
    t = np.arange(n) / SR
    return np.minimum(1, t / a) * np.exp(-t / d)

def ks(f, dur=1.0, decay=.994):
    n = int(dur * SR); p = max(2, int(SR / f)); y = np.zeros(n); y[:p] = rng.uniform(-1, 1, p)
    for k in range(p, n): y[k] = decay * .5 * (y[k - p] + y[k - p + 1])
    return y * env(n, .001, dur)

def noise(dur): return rng.uniform(-1, 1, int(dur * SR))
def lpf(x, a):
    y = np.empty_like(x); s = 0.
    for i in range(len(x)): s += a * (x[i] - s); y[i] = s
    return y
def sine(f, dur, ph=0): t = np.arange(int(dur * SR)) / SR; return np.sin(2 * np.pi * f * t + ph)
def hz(n): return 440 * 2 ** ((n - 69) / 12)

# ---------------- música (112 BPM, ukulele + baixo + shaker)
bpm = 112; beat = 60 / bpm
prog = [[60, 64, 67], [55, 59, 62], [57, 60, 64], [53, 57, 60]]  # C G Am F
cache = {}
def uke(n, dur=.9):
    k = (n, dur)
    if k not in cache: cache[k] = ks(hz(n + 12), dur, .992)
    return cache[k]
t = 0.0; bar = 0
while t < 20.15:
    ch = prog[bar % 4]
    for b in range(4):
        tb = t + b * beat
        if tb >= 20.15: break
        # padrão de dedilhado: baixo-acorde-acorde
        for k, nn in enumerate(ch):
            put(uke(nn), tb + k * .012, .16 if b % 2 == 0 else .11, -.3 + k * .3)
        if b in (1, 3):
            for k, nn in enumerate(ch): put(uke(nn, .5), tb + beat / 2 + k * .01, .08, .3 - k * .3)
        bs = sine(hz(ch[0] - 24), .45) * env(int(.45 * SR), .005, .18); put(bs, tb, .32 if b % 2 == 0 else .2)
        sh = noise(.06) * env(int(.06 * SR), .002, .02); put(sh, tb + beat / 2, .05, .4); put(sh, tb, .03, -.4)
        if b == 1 or b == 3:
            cl = noise(.08) * env(int(.08 * SR), .001, .03); put(lpf(cl, .5), tb, .12)
    t += 4 * beat; bar += 1
# volta suave no final (21.6 -> 26)
prog2 = [[53, 57, 60, 64], [55, 59, 62, 65], [60, 64, 67, 71], [60, 64, 67, 72]]
for i, ch in enumerate(prog2):
    tb = 21.6 + i * 1.1
    for k, nn in enumerate(ch): put(ks(hz(nn + 12), 2.2, .996), tb + k * .07, .12, -.4 + k * .27)
    pad = sum(sine(hz(nn), 1.6) for nn in ch) * env(int(1.6 * SR), .4, 1.2) * .05; put(pad, tb, 1)
    put(sine(hz(ch[0] - 24), 1.2) * env(int(1.2 * SR), .01, .5), tb, .25)

# ---------------- ambiente: passarinhos + brisa
br = lpf(noise(T), .02); put(br * .08, 0)
for tt in np.arange(.4, 26, .9) + rng.uniform(0, .6, len(np.arange(.4, 26, .9))):
    if 20.2 < tt < 21.6: continue
    n = int(.09 * SR); f0 = rng.uniform(3200, 4800); tt2 = np.arange(n) / SR
    ch = np.sin(2 * np.pi * (f0 + 1800 * np.sin(tt2 * 60)) * tt2) * env(n, .005, .03)
    for r in range(rng.integers(1, 4)): put(ch, tt + r * .11, .025, rng.uniform(-.8, .8))

# ---------------- efeitos
def click(g=.3, pan=0, tt=0):
    n = int(.03 * SR); c = noise(.03) * env(n, .0005, .004); c = c - lpf(c, .3); put(c, tt, g, pan)
def thump(tt, g=.25): put(sine(90, .12) * env(int(.12 * SR), .002, .04), tt, g)
def whoosh(tt, dur=.35, g=.25):
    n = int(dur * SR); x = noise(dur); w = np.sin(np.linspace(0, np.pi, n)) ** 2; put(lpf(x, .15) * w, tt, g)
def boing(tt, g=.35):
    n = int(.35 * SR); t2 = np.arange(n) / SR; f = 180 + 260 * np.exp(-t2 * 12) + 40 * np.sin(t2 * 70)
    put(np.sin(2 * np.pi * np.cumsum(f) / SR) * env(n, .002, .12), tt, g)
def hit(tt, g=.5):
    n = int(.4 * SR); put((sine(60, .4) * env(n, .001, .12) + lpf(noise(.4), .3) * env(n, .001, .04)) , tt, g)
# passos com garras (caminhada)
for t0, t1, rate in [(0, 4.5, 3.8), (11.6, 13.2, 3.8)]:
    for tt in np.arange(t0 + .1, t1, 1 / rate): click(.22, rng.uniform(-.2, .2), tt + rng.uniform(-.01, .01)); thump(tt, .06)
# batidinhas da garra (B2)
for tt in [7.05, 7.51, 7.96, 8.42]: click(.55, .1, tt); click(.25, .1, tt + .02)
# bola
whoosh(8.6, .45, .2); boing(9.05, .4); boing(9.55, .28); boing(9.8, .18); hit(9.18, .45)
whoosh(9.78, .3, .4)
for tt in np.arange(9.9, 11.3, 1 / 6.2): click(.28, rng.uniform(-.3, .3), tt); thump(tt, .12)
n = int(.25 * SR); t2 = np.arange(n) / SR; put(np.sin(2 * np.pi * np.cumsum(1400 + 600 * np.sin(t2 * 40)) / SR) * env(n, .005, .06), 11.32, .18)  # squeak da bola
# bracinho se debatendo
for tt in np.arange(13.65, 16.25, .12): put(lpf(noise(.06), .25) * env(int(.06 * SR), .003, .02), tt, .12, -.2)
# chacoalhada de cabeça (orelhas)
for tt in np.arange(16.3, 16.85, .05): put(lpf(noise(.04), .35) * env(int(.04 * SR), .002, .012), tt, .2, rng.uniform(-.5, .5))
# piscada do gato
put(sine(1800, .15) * env(int(.15 * SR), .002, .05), 17.9, .05)
# rufar crescente + grave
for i, tt in enumerate(np.arange(18.7, 20.15, .045)):
    g = .05 + .35 * (i / 32) ** 2; put(lpf(noise(.05), .4) * env(int(.05 * SR), .001, .015), tt, g, rng.uniform(-.2, .2))
rum = lpf(noise(1.5), .01) * np.linspace(0, 1, int(1.5 * SR)) ** 2; put(rum, 18.65, 1.2)
# scratch de disco e "au" fininho
n = int(.32 * SR); t2 = np.arange(n) / SR; f = 600 * (1 + np.sin(t2 * 28)); put(np.sign(np.sin(2 * np.pi * np.cumsum(f) / SR)) * lpf(noise(.32), .5) * env(n, .002, .12), 20.16, .25)
n = int(.16 * SR); t2 = np.arange(n) / SR
f = 950 + 500 * np.sin(np.pi * t2 / .16) ; au = np.sin(2 * np.pi * np.cumsum(f) / SR) + .4 * np.sin(4 * np.pi * np.cumsum(f) / SR)
put(au * np.sin(np.pi * t2 / .16) ** .6, 20.27, .5)
# grilos (silêncio constrangedor)
for tt in np.arange(20.6, 21.6, .42):
    n = int(.18 * SR); t2 = np.arange(n) / SR; put(np.sin(2 * np.pi * 4500 * t2) * (np.sin(2 * np.pi * 30 * t2) > 0) * env(n, .01, .08), tt, .05, .5)
# cauda batendo na grama
for tt in np.arange(21.7, 26, 1 / 1.43): put(lpf(noise(.08), .2) * env(int(.08 * SR), .002, .03), tt, .12, -.3)

mix = np.stack([L, Rr], 1)
mix /= max(1e-9, np.abs(mix).max()) / .9
os.makedirs('audio', exist_ok=True)
with wave.open('audio/trilha.wav', 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes((mix * 32767).astype('<i2').tobytes())
print('ok', mix.shape)

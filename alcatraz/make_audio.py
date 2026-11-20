# Trilha sem narração: música "sneaky" sintetizada + SFX sincronizados com as cenas.
# Uso: python3 make_audio.py  -> audio/trilha.wav
import json, numpy as np
from scipy.signal import butter, sosfilt
from scipy.io import wavfile

SR = 48000
T = json.load(open('timing.json'))
A_OFF = .12
S, D = [], []
t = 0
for i, b in enumerate(T):
    d = b['dur'] + A_OFF + .3 + (1.6 if i == len(T) - 1 else 0)
    S.append(t); D.append(d); t += d
TOTAL = t + .5
N = int(TOTAL * SR)
rng = np.random.default_rng(11)
L = np.zeros(N); Rr = np.zeros(N)

def bp(x, a, b): return sosfilt(butter(2, [a, b], 'band', fs=SR, output='sos'), x)
def lp(x, f): return sosfilt(butter(2, f, 'low', fs=SR, output='sos'), x)
def hp(x, f): return sosfilt(butter(2, f, 'high', fs=SR, output='sos'), x)
def add(at, sig, g=1.0, pan=0.0):
    s = int(at * SR)
    if s < 0: sig = sig[-s:]; s = 0
    e = min(N, s + len(sig)); sig = sig[:e - s] * g
    L[s:e] += sig * (1 - max(0, pan)); Rr[s:e] += sig * (1 + min(0, pan))
def env(n, a, r):
    t = np.arange(n) / SR; return np.minimum(1, t / max(a, 1e-4)) * np.exp(-t / r)

# ---------- SFX ----------
def whoosh(dur=.5):
    n = int(dur * SR); x = rng.standard_normal(n); t = np.arange(n) / SR
    out = np.zeros(n)
    for k in range(8):
        sl = slice(k * n // 8, (k + 1) * n // 8); f0 = 400 + 3000 * (k / 8)
        out[sl] = bp(x, f0, f0 * 1.8)[sl]
    return out * np.sin(np.pi * t / dur) ** 2 * .9
def pop():
    n = int(.09 * SR); t = np.arange(n) / SR; f = 500 + 900 * t / .09
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 40)
def thud(f0=110, dur=.35):
    n = int(dur * SR); t = np.arange(n) / SR; f = 40 + f0 * np.exp(-t * 18)
    return (np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 10) + .3 * lp(rng.standard_normal(n), 900) * np.exp(-t * 30))
def ding():
    n = int(1.2 * SR); t = np.arange(n) / SR
    return (np.sin(2 * np.pi * 1320 * t) + .4 * np.sin(2 * np.pi * 2640 * t) + .2 * np.sin(2 * np.pi * 1980 * t)) * np.exp(-t * 4) * .5
def click():
    n = int(.03 * SR); return hp(rng.standard_normal(n), 2500) * np.exp(-np.arange(n) / SR * 200)
def step():
    n = int(.12 * SR); t = np.arange(n) / SR
    return lp(rng.standard_normal(n), 500) * np.exp(-t * 45) + .5 * np.sin(2 * np.pi * 70 * t) * np.exp(-t * 40)
def boing():
    n = int(.5 * SR); t = np.arange(n) / SR; f = 300 * np.exp(-t * 2.5) * (1 + .08 * np.sin(2 * np.pi * 14 * t))
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 5) * .6
def sting():
    n = int(.5 * SR); t = np.arange(n) / SR
    a = np.sin(2 * np.pi * 880 * t) * (t < .12) + np.sin(2 * np.pi * 1175 * t) * (t >= .12)
    return a * np.exp(-((t % .12)) * 8) * np.exp(-t * 3) * .5
def splash():
    n = int(.6 * SR); t = np.arange(n) / SR
    return bp(rng.standard_normal(n), 600, 4000) * np.minimum(1, t / .03) * np.exp(-t * 6) * .5

for i in range(1, 8): add(S[i] - .18, whoosh(), .55)
# 1
add(S[0] + 1.6, whoosh(.35), .25); add(S[0] + 2.3, pop(), .5)
# 2 ilha
for k, u in enumerate([.05, .45 * D[1], .68 * D[1]]): add(S[1] + u, pop(), .45)
# 3 colher raspando (mesma frequência do braço: 3.2 Hz)
s3, d3 = S[2], D[2]; n = int((d3 - .3) * SR); tt = np.arange(n) / SR
scr = bp(rng.standard_normal(n), 2200, 6500) * np.abs(np.sin(np.pi * 3.2 * tt)) ** 3
add(s3 + .3, scr * np.minimum(1, tt / .2) * np.minimum(1, (tt[-1] - tt) / .2), .22, .2)
add(s3 + .05, pop(), .4); add(s3 + .6 * d3, pop(), .5)
# 4 receita
s4, d4 = S[3], D[3]
for u in [.05, .2, .33 * d4 - .1, .47 * d4 - .1, .68 * d4 - .1]: add(s4 + u, pop(), .5)
add(s4 + .8 * d4, whoosh(.45), .5); add(s4 + .9 * d4, ding(), .6)
# 5 ronda
s5, d5 = S[4], D[4]
u = .1
while u < .25 * d5: add(s5 + u, step(), .5, .4); u += .42
u = .72 * d5
while u < .98 * d5: add(s5 + u, step(), .5, .4); u += .42
add(s5 + .22 * d5, click(), .5); add(s5 + .68 * d5, click(), .5)
add(s5 + .05, pop(), .35); add(s5 + .78 * d5, pop(), .45)
# 6 manhã
s6, d6 = S[5], D[5]
add(s6 + .05, pop(), .4); add(s6 + .45 * d6, click(), .3)
add(s6 + .5 * d6, sting(), .55); add(s6 + .62 * d6, thud(), 1.0); add(s6 + .62 * d6, boing(), .5)
add(s6 + .76 * d6, thud(160, .2), .45); add(s6 + .6 * d6, pop(), .4)
# 7 jangada
s7, d7 = S[6], D[6]
for k in range(8): add(s7 + .4 + k * .98, splash(), .35, (-1) ** k * .3)
add(s7 + .05, pop(), .4); add(s7 + .6 * d7, pop(), .5); add(s7 + .66 * d7, pop(), .4)
# 8 cartazes
s8, d8 = S[7], D[7]
for k in range(3): add(s8 + .1 + k * .18, whoosh(.3), .3); add(s8 + .45 + k * .18, thud(200, .12), .35)
add(s8 + 1.3, thud(80, .5), 1.0); add(s8 + 1.3, hp(rng.standard_normal(int(.15 * SR)), 1500) * np.exp(-np.arange(int(.15 * SR)) / SR * 30), .5)
add(s8 + .5 * d8, pop(), .45); add(s8 + .7 * d8, pop(), .5); add(s8 + d8 - 1.5, ding(), .45)

# ondas do mar (cenas 2 e 7)
for i in (1, 6):
    n = int(D[i] * SR); tt = np.arange(n) / SR
    w = lp(rng.standard_normal(n), 700) * (.55 + .45 * np.sin(2 * np.pi * .22 * tt)) * np.minimum(1, tt / .4) * np.minimum(1, (tt[-1] - tt) / .4)
    add(S[i], w, .35, .15); add(S[i], np.roll(w, 4000), .35, -.15)

# ---------- música (D menor, 100 bpm, pizzicato "sneaky") ----------
bpm = 100; beat = 60 / bpm
def pluck(f, dur=.45, g=.4):
    n = int(dur * SR); p = int(SR / f); buf = rng.uniform(-1, 1, p); out = np.zeros(n)
    for k in range(n):
        out[k] = buf[k % p]; buf[k % p] = .5 * (buf[k % p] + buf[(k + 1) % p]) * .996
    return out * np.exp(-np.arange(n) / SR * 5) * g
def bass(f, dur):
    n = int(dur * SR); t = np.arange(n) / SR
    return (np.sin(2 * np.pi * f * t) + .3 * np.sin(4 * np.pi * f * t)) * np.minimum(1, t / .01) * np.exp(-t * 3) * .5
def hat():
    n = int(.05 * SR); return hp(rng.standard_normal(n), 7000) * np.exp(-np.arange(n) / SR * 90) * .25
nt = lambda m: 440 * 2 ** ((m - 69) / 12)
mel = [62, None, 65, 64, None, 62, 61, None, 62, None, 69, None, 67, 65, 64, None,
       62, None, 65, 64, None, 62, 61, None, 57, None, 58, 61, 62, None, None, None]
roots = [38, 38, 34, 33]  # D, D, Bb, A
cache = {}
mus = np.zeros(N)
nbars = int(TOTAL / (4 * beat)) + 1
for bar in range(nbars):
    t0 = bar * 4 * beat; r = roots[bar % 4]
    for q in range(4):
        tb = t0 + q * beat
        if tb > TOTAL - 1.5: break
        bsig = bass(nt(r + (12 if q == 2 else 0)), beat * .9)
        s = int(tb * SR); e = min(N, s + len(bsig)); mus[s:e] += bsig[:e - s]
        for h in (0, .5):
            hs = hat(); s = int((tb + h * beat) * SR); e = min(N, s + len(hs)); mus[s:e] += hs[:e - s] * (1 if h else .6)
    if bar >= 1:
        for k in range(8):
            m = mel[(bar % 4) * 8 + k]
            tm = t0 + k * beat / 2
            if m is None or tm > TOTAL - 1.5: continue
            if m not in cache: cache[m] = pluck(nt(m + 12))
            sg = cache[m]; s = int(tm * SR); e = min(N, s + len(sg)); mus[s:e] += sg[:e - s]
# acorde final
tt = np.arange(int(2.5 * SR)) / SR
fin = sum(np.sin(2 * np.pi * nt(m) * tt) for m in (50, 57, 62, 65)) * np.exp(-tt * 1.5) * .2
s = int((TOTAL - 2.6) * SR); mus[s:s + len(fin)] += fin[:N - s]
# a música abaixa na ronda noturna (tensão)
g = np.ones(N); a, b = int(S[4] * SR), int((S[4] + D[4]) * SR); g[a:b] = .55
mus = lp(mus, 6000) * g * .55
L += mus; Rr += mus
fade = np.minimum(1, (TOTAL - np.arange(N) / SR) / .6); L *= fade; Rr *= fade
m = max(np.abs(L).max(), np.abs(Rr).max())
out = np.stack([L, Rr], 1) / m * .89
wavfile.write('audio/trilha.wav', SR, (out * 32767).astype(np.int16))
print('ok', round(TOTAL, 2), 's')

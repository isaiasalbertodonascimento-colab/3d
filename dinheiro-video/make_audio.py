# Trilha sem narração: música alegre + SFX dos eventos (events.json) + ambiente de vento que segue a força
# do vento na tela (windcurve em events.json). Uso: python3 make_audio.py  -> audio/trilha.wav
import json, sys, numpy as np
from scipy.signal import butter, sosfilt
from scipy.io import wavfile

SR = 48000
E = json.load(open('events.json'))
TOTAL = E['total'] + .3
N = int(TOTAL * SR)
rng = np.random.default_rng(5)
L = np.zeros(N); Rr = np.zeros(N)
bp = lambda x, a, b: sosfilt(butter(2, [a, b], 'band', fs=SR, output='sos'), x)
lp = lambda x, f: sosfilt(butter(2, f, 'low', fs=SR, output='sos'), x)
hp = lambda x, f: sosfilt(butter(2, f, 'high', fs=SR, output='sos'), x)
def tt(d): return np.arange(int(d * SR)) / SR
def add(at, sig, g=1.0, pan=0.0):
    s = int(at * SR)
    if s >= N: print(f'aviso: evento fora da duração em {at:.2f}s'); return
    if s < 0: sig = sig[-s:]; s = 0
    e = min(N, s + len(sig)); sig = sig[:e - s] * g
    L[s:e] += sig * (1 - max(0, pan)); Rr[s:e] += sig * (1 + min(0, pan))
def sweep_noise(d, f0, f1, shape):
    t = tt(d); x = rng.standard_normal(len(t)); out = np.zeros(len(t)); n = 10
    for k in range(n):
        sl = slice(k * len(t) // n, (k + 1) * len(t) // n); f = f0 + (f1 - f0) * k / n; out[sl] = bp(x, f, f * 1.9)[sl]
    return out * shape(t / d)
def tone(fs, d, dec): t = tt(d); return np.sin(2 * np.pi * np.cumsum(np.broadcast_to(fs(t), t.shape)) / SR) * np.exp(-t * dec)

def chirps():
    out = np.zeros(int(.6 * SR)); c = np.sin(2 * np.pi * np.cumsum(2800 + 1800 * np.sin(np.pi * tt(.12) / .12)) / SR) * np.sin(np.pi * tt(.12) / .12)
    for k in range(3): s0 = int(k * .16 * SR); out[s0:s0 + len(c)] += c
    return out * .35
SFX = {
 'whoosh': lambda: sweep_noise(.5, 400, 3500, lambda k: np.sin(np.pi * k) ** 2) * .9,
 'gust': lambda: sweep_noise(1.3, 200, 1600, lambda k: np.minimum(1, k / .1) * np.exp(-k * 2.2)) * 1.4,
 'swirl': lambda: sweep_noise(1.4, 300, 2400, lambda k: k * (.6 + .4 * np.sin(k * 40))) * .8,
 'windup': lambda: sweep_noise(1.9, 150, 1400, lambda k: k ** 1.5) * 1.1,
 'inhale': lambda: sweep_noise(.8, 900, 2600, lambda k: np.sin(np.pi * k) * k) * .6,
 'pop': lambda: tone(lambda t: 500 + 9000 * t, .09, 40),
 'plop': lambda: tone(lambda t: 260 - 900 * t, .14, 25),
 'boing': lambda: tone(lambda t: 300 * np.exp(-t * 2.5) * (1 + .08 * np.sin(2 * np.pi * 14 * t)), .5, 5) * .6,
 'thud': lambda: tone(lambda t: 40 + 110 * np.exp(-t * 18), .35, 10) + .3 * lp(rng.standard_normal(int(.35 * SR)), 900) * np.exp(-tt(.35) * 30),
 'clank': lambda: sum(np.sin(2 * np.pi * f * tt(.6)) * np.exp(-tt(.6) * d) for f, d in [(523, 9), (1187, 12), (1712, 15), (2650, 20)]) * .3 + hp(rng.standard_normal(int(.6 * SR)), 3000) * np.exp(-tt(.6) * 40) * .4,
 'ding': lambda: (np.sin(2 * np.pi * 1320 * tt(1.2)) + .4 * np.sin(2 * np.pi * 2640 * tt(1.2))) * np.exp(-tt(1.2) * 4) * .5,
 'sting': lambda: (np.sin(2 * np.pi * 880 * tt(.5)) * (tt(.5) < .12) + np.sin(2 * np.pi * 1175 * tt(.5)) * (tt(.5) >= .12)) * np.exp(-tt(.5) * 3) * .5,
 'tunnel': lambda: lp(rng.standard_normal(int(4.4 * SR)), 900) * np.minimum(1, tt(4.4) / .4) * np.minimum(1, (4.4 - tt(4.4)) / .5) * 1.0,
 'tornado': lambda: lp(rng.standard_normal(int(8.6 * SR)), 500) * (.7 + .3 * np.sin(2 * np.pi * .7 * tt(8.6))) * np.minimum(1, tt(8.6) / 1.2) * np.minimum(1, (8.6 - tt(8.6)) / 1.0) * 1.4,
 'flywind': lambda: bp(rng.standard_normal(int(4.4 * SR)), 300, 2500) * (.75 + .25 * np.sin(2 * np.pi * .9 * tt(4.4))) * np.minimum(1, tt(4.4) / .3) * np.minimum(1, (4.4 - tt(4.4)) / .4) * .7,
 'thunder': lambda: (lp(np.cumsum(rng.standard_normal(int(2.6 * SR))) * .02, 220) * np.exp(-tt(2.6) * 1.4) + hp(rng.standard_normal(int(2.6 * SR)), 1500) * np.exp(-tt(2.6) * 25) * .5) * 1.3,
 'moo': lambda: bp(np.sign(np.sin(2 * np.pi * np.cumsum(150 - 40 * tt(.9)) / SR)) * .5, 200, 1200) * np.sin(np.pi * tt(.9) / .9) * .9,
 'tweet': lambda: chirps(),
 'sneeze': lambda: np.concatenate([sweep_noise(.25, 2500, 5000, lambda k: np.sin(np.pi * k)) * 1.2, bp(rng.standard_normal(int(.35 * SR)), 300, 2500) * np.exp(-tt(.35) * 8) * 1.4]),
}

def noise(d): return rng.standard_normal(int(d * SR))
def seq(parts, total):
    out = np.zeros(int(total * SR))
    for at, sig in parts:
        a = int(at * SR); e = min(len(out), a + len(sig)); out[a:e] += sig[:e - a]
    return out
def beepf(f, d=.12): return np.sin(2 * np.pi * f * tt(d)) * np.minimum(1, (d - tt(d)) / .01) * .5
SFX.update({
 'beep': lambda: np.concatenate([beepf(1800), np.zeros(int(.05 * SR)), beepf(1800)]),
 'err': lambda: np.concatenate([beepf(620, .15), beepf(440, .28)]) * 1.2,
 'buzz': lambda: np.sign(np.sin(2 * np.pi * 110 * tt(.35))) * np.exp(-tt(.35) * 4) * .35,
 'glitch': lambda: np.concatenate([hp(noise(.04), 2000) * .5 * (k % 2) + np.sin(2 * np.pi * (300 + 500 * k) * tt(.04)) * .3 for k in range(10)]),
 'click': lambda: hp(noise(.03), 3000) * np.exp(-tt(.03) * 200) * 1.5,
 'tick': lambda: np.concatenate([hp(noise(.02), 4000) * np.exp(-tt(.02) * 300) * .8 for _ in range(1)] + [np.zeros(int(.06 * SR))]) ,
 'crash': lambda: (hp(noise(.8), 1500) * np.exp(-tt(.8) * 6) + sum(np.sin(2 * np.pi * f * tt(.8)) * np.exp(-tt(.8) * 9) for f in (2200, 3100, 4300)) * .25) * 1.1,
 'coins': lambda: seq([(k * .07 + rng.random() * .03, (np.sin(2 * np.pi * (2400 + 300 * (k % 4)) * tt(.25)) + .5 * np.sin(2 * np.pi * (5200 + 200 * k) * tt(.25))) * np.exp(-tt(.25) * 18) * .25) for k in range(12)], 1.3),
 'splash': lambda: lp(noise(1.2), 2500) * np.exp(-tt(1.2) * 3) * 1.2,
 'bubbles': lambda: seq([(k * .09, np.sin(2 * np.pi * np.cumsum(500 + 900 * tt(.08) / .08 + 150 * k) / SR) * np.sin(np.pi * tt(.08) / .08) * .3) for k in range(10)], 1.3),
 'rumble': lambda: lp(noise(1.6), 140) * np.minimum(1, tt(1.6) / .3) * np.exp(-tt(1.6) * 1.2) * 3,
 'boom': lambda: (tone(lambda t: 35 + 80 * np.exp(-t * 6), 1.4, 2.5) + lp(noise(1.4), 400) * np.exp(-tt(1.4) * 3)) * 1.2,
 'zap': lambda: np.sign(np.sin(2 * np.pi * (120 + 60 * np.sin(2 * np.pi * 37 * tt(.4))) * tt(.4))) * hp(noise(.4), 800) * np.exp(-tt(.4) * 6) * .6 + hp(noise(.4), 3000) * np.exp(-tt(.4) * 12) * .5,
 'sad': lambda: np.concatenate([np.sin(2 * np.pi * f * tt(.32)) * np.exp(-tt(.32) * 2) * .35 * (1 + .3 * np.sign(np.sin(2 * np.pi * f / 2 * tt(.32)))) for f in (392, 370, 349)] + [np.sin(2 * np.pi * (330 - 20 * tt(.9)) * tt(.9)) * np.exp(-tt(.9) * 2) * .35]),
 'radio': lambda: bp(noise(.35), 1000, 3000) * .5 * np.exp(-tt(.35) * 3),
 'paper': lambda: bp(noise(.5), 1500, 6000) * (.5 + .5 * np.abs(np.sin(2 * np.pi * 14 * tt(.5)))) * np.exp(-tt(.5) * 3) * .9,
 'knock': lambda: np.concatenate([lp(noise(.12), 600) * np.exp(-tt(.12) * 40) * 2.5, np.zeros(int(.12 * SR)), lp(noise(.12), 600) * np.exp(-tt(.12) * 40) * 2.5]),
 'clap': lambda: bp(noise(.2), 900, 4000) * np.exp(-tt(.2) * 25) * 1.4,
 'cheer': lambda: bp(noise(1.6), 500, 3000) * np.sin(np.pi * tt(1.6) / 1.6) * (1 + .3 * np.sin(2 * np.pi * 6 * tt(1.6))) * .9,
})

SFX.update({
 'machine': lambda: (lp(noise(4.0), 180) * 1.6 + np.sign(np.sin(2 * np.pi * 9 * tt(4.0))) * bp(noise(4.0), 300, 1200) * .25) * np.minimum(1, tt(4.0) / .3) * np.minimum(1, (4.0 - tt(4.0)) / .5),
 'paper': lambda: bp(noise(.7), 2000, 7000) * (.4 + .6 * np.abs(np.sin(2 * np.pi * 11 * tt(.7)))) * np.sin(np.pi * tt(.7) / .7) * .9,
 'splash_paper': lambda: bp(noise(1.0), 1500, 7000) * np.exp(-tt(1.0) * 3.5) * 1.6 + lp(noise(1.0), 300) * np.exp(-tt(1.0) * 8) * 1.2,
 'scratch': lambda: np.sign(np.sin(2 * np.pi * np.cumsum(900 - 700 * tt(.45) / .45) / SR)) * bp(noise(.45), 400, 5000) * .7 * np.exp(-tt(.45) * 2),
 'tec': lambda: np.concatenate([hp(noise(.025), 2500) * np.exp(-tt(.025) * 150) * 1.4, np.zeros(int(.04 * SR)), lp(noise(.05), 900) * np.exp(-tt(.05) * 80) * 1.8]),
 'wheel': lambda: (np.sin(2 * np.pi * 7 * tt(3.2)) > .6) * bp(noise(3.2), 2000, 5000) * .35 + lp(noise(3.2), 200) * .4,
 'flutter': lambda: bp(noise(2.5), 300, 1500) * (.5 + .5 * np.sin(2 * np.pi * 3 * tt(2.5))) * np.sin(np.pi * tt(2.5) / 2.5) * .8,
})
for ev in E['events']:
    if ev['name'] not in SFX: sys.exit(f"SFX desconhecido: '{ev['name']}'")
    add(ev['t'], SFX[ev['name']](), .55 * ev['gain'], (rng.random() - .5) * .4)
for s in E['scenes'][1:]: add(s['s'] - .18, SFX['whoosh'](), .4)

# ambiente de vento seguindo a força do vento das cenas (amostrado a 10 Hz)
wc = np.interp(np.arange(N) / SR, np.arange(len(E['windcurve'])) / 10, E['windcurve'])
wn = lp(rng.standard_normal(N), 900) * .6 + bp(rng.standard_normal(N), 900, 3000) * .25
gst = .75 + .25 * np.sin(2 * np.pi * .35 * np.arange(N) / SR) * np.sin(2 * np.pi * .13 * np.arange(N) / SR + 1)
amb = wn * np.clip(wc, 0, 2) ** 1.3 * gst * .32
L += amb; Rr += np.roll(amb, 900)

# música: curiosa e animada, 112 bpm (pizzicato + baixo + bateria leve)
beat = 60 / 120; nt = lambda m: 440 * 2 ** ((m - 69) / 12)
def pluck(f, d=.42):
    n = int(d * SR); p = int(SR / f); buf = rng.uniform(-1, 1, p); out = np.zeros(n)
    for k in range(n): out[k] = buf[k % p]; buf[k % p] = .5 * (buf[k % p] + buf[(k + 1) % p]) * .996
    return out * np.exp(-tt(d) * 4) * .4
kick = tone(lambda t: 45 + 90 * np.exp(-t * 30), .25, 14) * .9
clap = bp(rng.standard_normal(int(.15 * SR)), 900, 4000) * np.exp(-tt(.15) * 30) * .5
hat = hp(rng.standard_normal(int(.05 * SR)), 7000) * np.exp(-tt(.05) * 90) * .22
chords = [(48, [64, 67, 72]), (57, [64, 69, 72]), (53, [65, 69, 72]), (55, [67, 71, 74])]  # C Am F G
mel = [72, 76, 79, 0, 84, 0, 79, 76, 76, 0, 72, 69, 72, 0, 76, 0, 77, 0, 81, 79, 77, 0, 72, 0, 74, 77, 79, 0, 83, 0, 79, 0]
mus = np.zeros(N); cache = {}
def put(at, sig, g=1):
    s = int(at * SR)
    if s >= N: return
    e = min(N, s + len(sig)); mus[s:e] += sig[:e - s] * g
for bar in range(int(TOTAL / (4 * beat)) + 1):
    t0 = bar * 4 * beat; root, ch = chords[bar % 4]
    if t0 > TOTAL - 2: break
    for q in range(4):
        put(t0 + q * beat, kick if q % 2 == 0 else clap, .8)
        for hh in (0, .5): put(t0 + (q + hh) * beat, hat)
        b = np.sin(2 * np.pi * nt(root - 12 + (7 if q == 2 else 0)) * tt(beat * .9)) * np.exp(-tt(beat * .9) * 3) * .5
        put(t0 + q * beat, b)
    for m in ch:
        if m not in cache: cache[m] = pluck(nt(m), .9)
        put(t0, cache[m], .35); put(t0 + 2 * beat, cache[m], .25)
    if bar >= 1:
        for k in range(8):
            m = mel[(bar % 4) * 8 + k]
            if not m: continue
            if m + 12 not in cache: cache[m + 12] = pluck(nt(m))
            put(t0 + k * beat / 2, cache[m + 12], .8)
fin = sum(np.sin(2 * np.pi * nt(m) * tt(2.5)) for m in (48, 60, 64, 67, 72)) * np.exp(-tt(2.5) * 1.5) * .2
put(TOTAL - 2.6, fin)
mus = lp(mus, 7000) * .5
L += mus; Rr += mus
fade = np.minimum(1, (TOTAL - np.arange(N) / SR) / .6); L *= fade; Rr *= fade
m = max(np.abs(L).max(), np.abs(Rr).max())
wavfile.write('audio/trilha.wav', SR, (np.stack([L, Rr], 1) / m * .89 * 32767).astype(np.int16))
print('ok', round(TOTAL, 2), 's,', len(E['events']), 'eventos')

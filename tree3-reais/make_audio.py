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
def beeps():
    out=np.zeros(int(.7*SR))
    for k in range(6):
        b=np.sin(2*np.pi*(1200+300*(k%3))*tt(.06))*np.sin(np.pi*tt(.06)/.06);s0=int(k*.11*SR);out[s0:s0+len(b)]+=b
    return out*.35
def cash():
    bell=sum(np.sin(2*np.pi*f*tt(1.0))*np.exp(-tt(1.0)*d) for f,d in [(2093,5),(2637,6),(3136,7)])*.25
    clk=hp(rng.standard_normal(int(.08*SR)),2000)*np.exp(-tt(.08)*60)*.6
    out=np.zeros(int(1.1*SR));out[:len(clk)]+=clk;s0=int(.07*SR);out[s0:s0+len(bell)]+=bell[:len(out)-s0];return out
SFX = {
 'whoosh': lambda: sweep_noise(.5, 400, 3500, lambda k: np.sin(np.pi * k) ** 2) * .9,
 'pop': lambda: tone(lambda t: 500 + 9000 * t, .09, 40),
 'plop': lambda: tone(lambda t: 260 - 900 * t, .14, 25),
 'boing': lambda: tone(lambda t: 300 * np.exp(-t * 2.5) * (1 + .08 * np.sin(2 * np.pi * 14 * t)), .5, 5) * .6,
 'thud': lambda: tone(lambda t: 40 + 110 * np.exp(-t * 18), .35, 10) + .3 * lp(rng.standard_normal(int(.35 * SR)), 900) * np.exp(-tt(.35) * 30),
 'ding': lambda: (np.sin(2 * np.pi * 1320 * tt(1.2)) + .4 * np.sin(2 * np.pi * 2640 * tt(1.2))) * np.exp(-tt(1.2) * 4) * .5,
 'sting': lambda: (np.sin(2 * np.pi * 880 * tt(.5)) * (tt(.5) < .12) + np.sin(2 * np.pi * 1175 * tt(.5)) * (tt(.5) >= .12)) * np.exp(-tt(.5) * 3) * .5,
 'buzz': lambda: np.sign(np.sin(2*np.pi*150*tt(.35)))*bp(rng.standard_normal(int(.35*SR)),100,400)*0+lp(np.sign(np.sin(2*np.pi*170*tt(.35))),600)*(np.sin(2*np.pi*12*tt(.35))>0)*.35,
 'beeps': beeps,
 'cash': cash,
 'glitch': lambda: np.concatenate([np.sign(np.sin(2*np.pi*(200+rng.random()*1800)*tt(.05)))*.4*(rng.random()>.3) for _ in range(14)])*hp(rng.standard_normal(int(14*.05*SR))+2,200)*.6,
 'paper': lambda: bp(rng.standard_normal(int(1.6*SR)),1500,6000)*(.5+.5*np.abs(np.sin(2*np.pi*7*tt(1.6))))*np.minimum(1,tt(1.6)/.1)*np.exp(-tt(1.6)*1.2)*.5,
 'rumble': lambda: lp(rng.standard_normal(int(1.6*SR)),120)*np.minimum(1,tt(1.6)/.6)*np.exp(-np.maximum(0,tt(1.6)-1.2)*6)*3,
 'boom': lambda: (tone(lambda t: 30+90*np.exp(-t*6),1.6,2.5)*1.2+lp(rng.standard_normal(int(1.6*SR)),400)*np.exp(-tt(1.6)*3)*1.2),
 'suck': lambda: sweep_noise(1.6, 3000, 200, lambda k: np.sin(np.pi*k)**.5)*1.0,
 'chime': lambda: sum(np.sin(2*np.pi*f*tt(1.4))*np.exp(-tt(1.4)*3)*(tt(1.4)>i*.08) for i,f in enumerate([1568,1976,2349,3136]))*.25,
 'spacewind': lambda: bp(rng.standard_normal(int(4*SR)),200,1800)*(.7+.3*np.sin(2*np.pi*.8*tt(4)))*np.minimum(1,tt(4)/.3)*np.minimum(1,(4-tt(4))/.6)*.7,
}
for ev in E['events']:
    if ev['name'] not in SFX: sys.exit(f"SFX desconhecido: '{ev['name']}'")
    add(ev['t'], SFX[ev['name']](), .55 * ev['gain'], (rng.random() - .5) * .4)
for s in E['scenes'][1:]: add(s['s'] - .18, SFX['whoosh'](), .4)

# música: alegre em Sol maior, 118 bpm (pizzicato + baixo + bateria leve)
beat = 60 / 118; nt = lambda m: 440 * 2 ** ((m - 69) / 12)
def pluck(f, d=.42):
    n = int(d * SR); p = int(SR / f); buf = rng.uniform(-1, 1, p); out = np.zeros(n)
    for k in range(n): out[k] = buf[k % p]; buf[k % p] = .5 * (buf[k % p] + buf[(k + 1) % p]) * .996
    return out * np.exp(-tt(d) * 4) * .4
kick = tone(lambda t: 45 + 90 * np.exp(-t * 30), .25, 14) * .9
clap = bp(rng.standard_normal(int(.15 * SR)), 900, 4000) * np.exp(-tt(.15) * 30) * .5
hat = hp(rng.standard_normal(int(.05 * SR)), 7000) * np.exp(-tt(.05) * 90) * .22
chords = [(55, [67, 71, 74]), (52, [64, 67, 71]), (48, [64, 67, 72]), (50, [66, 69, 74])]  # G Em C D
mel = [79, 0, 76, 78, 79, 0, 74, 0, 76, 0, 72, 74, 76, 0, 71, 0, 72, 0, 76, 74, 72, 0, 67, 0, 74, 0, 78, 76, 74, 0, 0, 0]
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
fin = sum(np.sin(2 * np.pi * nt(m) * tt(2.5)) for m in (55, 62, 67, 71)) * np.exp(-tt(2.5) * 1.5) * .2
put(TOTAL - 2.6, fin)
mus = lp(mus, 7000) * .5
L += mus; Rr += mus
fade = np.minimum(1, (TOTAL - np.arange(N) / SR) / .6); L *= fade; Rr *= fade
m = max(np.abs(L).max(), np.abs(Rr).max())
wavfile.write('audio/trilha.wav', SR, (np.stack([L, Rr], 1) / m * .89 * 32767).astype(np.int16))
print('ok', round(TOTAL, 2), 's,', len(E['events']), 'eventos')

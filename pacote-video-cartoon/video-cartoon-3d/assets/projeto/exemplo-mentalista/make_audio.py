# Trilha sem narração: música + SFX elétricos (events.json) + chuva que segue a curva de chuva das cenas. Uso: python3 make_audio.py  -> audio/trilha.wav
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
def crack(d,dens=60,seed=0):
    r=np.random.default_rng(seed);out=np.zeros(int(d*SR))
    for k in range(int(d*dens)):
        s0=r.integers(0,len(out)-400);n=r.integers(60,380);out[s0:s0+n]+=r.standard_normal(n)*np.exp(-np.arange(n)/(n/4))*r.uniform(.3,1)
    return hp(out,1500)
def hum(d,f0=100):
    t=tt(d);x=np.sign(np.sin(2*np.pi*f0*t))*.3+np.sin(2*np.pi*f0*2*t)*.3
    return lp(x,1800)*(.7+.3*np.sin(2*np.pi*7*t))
SFX = {
 'whoosh': lambda: sweep_noise(.5, 400, 3500, lambda k: np.sin(np.pi * k) ** 2) * .9,
 'pop': lambda: tone(lambda t: 500 + 9000 * t, .09, 40),
 'plop': lambda: tone(lambda t: 260 - 900 * t, .14, 25),
 'boing': lambda: tone(lambda t: 300 * np.exp(-t * 2.5) * (1 + .08 * np.sin(2 * np.pi * 14 * t)), .5, 5) * .6,
 'thud': lambda: tone(lambda t: 40 + 110 * np.exp(-t * 18), .35, 10) + .3 * lp(rng.standard_normal(int(.35 * SR)), 900) * np.exp(-tt(.35) * 30),
 'ding': lambda: (np.sin(2 * np.pi * 1320 * tt(1.2)) + .4 * np.sin(2 * np.pi * 2640 * tt(1.2))) * np.exp(-tt(1.2) * 4) * .5,
 'sparkle': lambda: sum(np.sin(2*np.pi*f*tt(.9))*np.exp(-tt(.9)*6)*(tt(.9)>k*.08) for k,f in enumerate([1760,2217,2637,3520]))*.25,
 'sting': lambda: (np.sin(2 * np.pi * 880 * tt(.5)) * (tt(.5) < .12) + np.sin(2 * np.pi * 1175 * tt(.5)) * (tt(.5) >= .12)) * np.exp(-tt(.5) * 3) * .5,
 'thunder': lambda: (lp(np.cumsum(rng.standard_normal(int(2.6 * SR))) * .02, 220) * np.exp(-tt(2.6) * 1.4) + hp(rng.standard_normal(int(2.6 * SR)), 1500) * np.exp(-tt(2.6) * 25) * .5) * 1.3,
 'boom': lambda: (lp(np.cumsum(rng.standard_normal(int(3.2*SR)))*.03,160)*np.exp(-tt(3.2)*1.1)*1.6+tone(lambda t:35+60*np.exp(-t*6),3.2,1.6)*1.2+np.pad(crack(.4,200,3),(0,int(3.2*SR)-int(.4*SR)))*.6),
 'zap': lambda: (crack(.45,260,1)*np.exp(-tt(.45)*5)*1.4+np.sin(2*np.pi*np.cumsum(1800-1500*tt(.45))/SR)*np.exp(-tt(.45)*8)*.4),
 'crackle': lambda: crack(1.4,90,2)*np.sin(np.pi*tt(1.4)/1.4)*1.1,
 'buzz': lambda: (hum(1.6,95)*.5+crack(1.6,40,4)*.6)*np.minimum(1,tt(1.6)/.3)*np.minimum(1,(1.6-tt(1.6))/.4),
 'charge': lambda: (np.sin(2*np.pi*np.cumsum(200+1400*(tt(.95)/.95)**2)/SR)*.35+crack(.95,60,5)*.4)*(tt(.95)/.95),
 'bulbpop': lambda: (hp(rng.standard_normal(int(.12*SR)),2500)*np.exp(-tt(.12)*45)*1.2+np.pad(tone(lambda t:1800-3000*t,.08,40),(0,int(.12*SR)-int(.08*SR)))*.4),
 'sizzle': lambda: hp(rng.standard_normal(int(1.2*SR)),3000)*(.5+.5*np.abs(np.sin(2*np.pi*13*tt(1.2))))*np.exp(-tt(1.2)*2)*.8,
 'step': lambda: lp(rng.standard_normal(int(.1*SR)),700)*np.exp(-tt(.1)*50)*1.2,
 'snap': lambda: hp(rng.standard_normal(int(.06*SR)),2000)*np.exp(-tt(.06)*90)*1.6,
 'page': lambda: sweep_noise(.35,1500,5000,lambda k:np.sin(np.pi*k))*.7,
 'tick': lambda: np.concatenate([np.sin(2*np.pi*3200*tt(.03))*np.exp(-tt(.03)*200),np.zeros(int(.25*SR)),np.sin(2*np.pi*2600*tt(.03))*np.exp(-tt(.03)*200)])*.6,
 'stamp': lambda: tone(lambda t:70+80*np.exp(-t*25),.3,12)*1.2+lp(rng.standard_normal(int(.3*SR)),1500)*np.exp(-tt(.3)*30)*.5,
 'coin': lambda: sum(np.sin(2*np.pi*f*tt(.8))*np.exp(-tt(.8)*d) for f,d in [(2093,6),(2637,8),(3520,10)])*.3,
 'shimmer': lambda: sum(np.sin(2*np.pi*f*tt(1.6))*np.exp(-tt(1.6)*2)*(tt(1.6)>k*.1) for k,f in enumerate([880,1109,1319,1760,2217,2637]))*.18,
 'card': lambda: np.concatenate([hp(rng.standard_normal(int(.04*SR)),3000)*np.exp(-tt(.04)*80) if True else 0 for _ in range(4)])*.8,
}
for ev in E['events']:
    if ev['name'] not in SFX: sys.exit(f"SFX desconhecido: '{ev['name']}'")
    add(ev['t'], SFX[ev['name']](), .55 * ev['gain'], (rng.random() - .5) * .4)
for s in E['scenes'][1:]: add(s['s'] - .18, SFX['whoosh'](), .4)

# música: alegre em Sol maior, 118 bpm (pizzicato + baixo + bateria leve)
beat = 60 / 108; nt = lambda m: 440 * 2 ** ((m - 69) / 12)
def pluck(f, d=.42):
    n = int(d * SR); p = int(SR / f); buf = rng.uniform(-1, 1, p); out = np.zeros(n)
    for k in range(n): out[k] = buf[k % p]; buf[k % p] = .5 * (buf[k % p] + buf[(k + 1) % p]) * .996
    return out * np.exp(-tt(d) * 4) * .4
kick = tone(lambda t: 45 + 90 * np.exp(-t * 30), .25, 14) * .9
clap = bp(rng.standard_normal(int(.15 * SR)), 900, 4000) * np.exp(-tt(.15) * 30) * .5
hat = hp(rng.standard_normal(int(.05 * SR)), 7000) * np.exp(-tt(.05) * 90) * .22
chords = [(57, [69, 72, 76]), (53, [69, 72, 77]), (50, [69, 74, 77]), (52, [68, 71, 76])]  # Am F Dm E (mistério divertido)
mel = [76, 0, 72, 0, 74, 76, 0, 69, 77, 0, 76, 74, 72, 0, 69, 0, 74, 0, 77, 0, 76, 74, 72, 74, 76, 0, 80, 0, 81, 0, 0, 0]
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
fin = sum(np.sin(2 * np.pi * nt(m) * tt(2.5)) for m in (57, 64, 69, 72)) * np.exp(-tt(2.5) * 1.5) * .2
put(TOTAL - 2.6, fin)
mus = lp(mus, 7000) * .5
L += mus; Rr += mus
fade = np.minimum(1, (TOTAL - np.arange(N) / SR) / .6); L *= fade; Rr *= fade
m = max(np.abs(L).max(), np.abs(Rr).max())
wavfile.write('audio/trilha.wav', SR, (np.stack([L, Rr], 1) / m * .89 * 32767).astype(np.int16))
print('ok', round(TOTAL, 2), 's,', len(E['events']), 'eventos')

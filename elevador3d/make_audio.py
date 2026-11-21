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
def hum(d,f0=100):
    t=tt(d);x=np.sign(np.sin(2*np.pi*f0*t))*.3+np.sin(2*np.pi*f0*2*t)*.3
    return lp(x,1800)*(.7+.3*np.sin(2*np.pi*7*t))
def creak(d=1.2,f0=180):
    t=tt(d);f=f0*(1+.4*np.sin(2*np.pi*1.3*t))+30*rng.standard_normal(len(t)).cumsum()/SR*40
    x=np.sign(np.sin(2*np.pi*np.cumsum(f)/SR))*(np.abs(np.sin(2*np.pi*9*t))>.3)
    return bp(x,300,2500)*np.sin(np.pi*t/d)*.9
SFX = {
 'whoosh': lambda: sweep_noise(.5, 400, 3500, lambda k: np.sin(np.pi * k) ** 2) * .9,
 'pop': lambda: tone(lambda t: 500 + 9000 * t, .09, 40),
 'thud': lambda: tone(lambda t: 40 + 110 * np.exp(-t * 18), .35, 10) + .3 * lp(rng.standard_normal(int(.35 * SR)), 900) * np.exp(-tt(.35) * 30),
 'ding': lambda: (np.sin(2*np.pi*1046*tt(1.6))+.5*np.sin(2*np.pi*2093*tt(1.6))+.3*np.sin(2*np.pi*1318*tt(1.6)))*np.exp(-tt(1.6)*2.5)*.5,
 'click': lambda: hp(rng.standard_normal(int(.03*SR)),2000)*np.exp(-tt(.03)*150)*1.2,
 'beep': lambda: np.sin(2*np.pi*1500*tt(.18))*np.minimum(1,(.18-tt(.18))/.02)*.35,
 'city': lambda: lp(rng.standard_normal(int(3*SR)),600)*.25+bp(rng.standard_normal(int(3*SR)),800,3000)*.05,
 'door': lambda: lp(rng.standard_normal(int(.5*SR)),500)*np.exp(-tt(.5)*6)*.8,
 'doorslide': lambda: bp(rng.standard_normal(int(1.8*SR)),200,1200)*np.sin(np.pi*tt(1.8)/1.8)*.5+hum(1.8,60)*.15,
 'hum': lambda: hum(3.0,55)*.35*np.minimum(1,tt(3.0)/.4),
 'creak': lambda: creak(1.2,180),
 'groan': lambda: creak(1.8,90)*1.1,
 'ping': lambda: (np.sin(2*np.pi*2600*tt(.4))+.5*np.sin(2*np.pi*3900*tt(.4)))*np.exp(-tt(.4)*9)*.5+hp(rng.standard_normal(int(.4*SR)),3000)*np.exp(-tt(.4)*40)*.6,
 'snap': lambda: hp(rng.standard_normal(int(.6*SR)),1200)*np.exp(-tt(.6)*12)*1.8+tone(lambda t:120*np.exp(-t*4)+40,.6,5)*1.2,
 'wind': lambda: bp(rng.standard_normal(int(13*SR)),250,2500)*np.minimum(1,tt(13)/1.5)*np.minimum(1,(13-tt(13))/.3)*(.6+.4*np.sin(2*np.pi*.7*tt(13)))*.9,
 'scream': lambda: np.zeros(10),
 'alarm': lambda: np.sin(2*np.pi*(900+300*(np.sin(2*np.pi*2*tt(3.5))>0))*tt(3.5))*.18,
 'rumble': lambda: lp(rng.standard_normal(int(3*SR)),120)*np.minimum(1,tt(3)/.5)*1.4,
 'heart': lambda: tone(lambda t:55+30*np.exp(-t*20),.25,14)*1.3+np.pad(tone(lambda t:50+25*np.exp(-t*20),.22,14),(int(.22*SR),0))[:int(.25*SR)]*0,
 'clamp': lambda: sum(np.sin(2*np.pi*f*tt(.8))*np.exp(-tt(.8)*d) for f,d in [(420,9),(980,12),(1650,15)])*.6+hp(rng.standard_normal(int(.8*SR)),2000)*np.exp(-tt(.8)*30)*.8,
 'scrape': lambda: bp(rng.standard_normal(int(2.6*SR)),1500,6000)*(.7+.3*np.sin(2*np.pi*31*tt(2.6)))*np.minimum(1,tt(2.6)/.05)*np.exp(-tt(2.6)*.8)*1.2,
 'impact': lambda: tone(lambda t:35+90*np.exp(-t*12),1.2,3)*1.6+lp(rng.standard_normal(int(1.2*SR)),800)*np.exp(-tt(1.2)*6)*1.2,
 'cut': lambda: hp(rng.standard_normal(int(.15*SR)),2500)*np.exp(-tt(.15)*30),
 'crowd': lambda: bp(rng.standard_normal(int(1.5*SR)),300,2000)*np.sin(np.pi*tt(1.5)/1.5)*.4,
 'breath': lambda: bp(rng.standard_normal(int(1.0*SR)),400,2500)*np.sin(np.pi*tt(1.0))**2*.5,
 'flicker': lambda: hum(.9,120)*(np.sin(2*np.pi*12*tt(.9))>0)*.5,
 'off': lambda: tone(lambda t:120*np.exp(-t*3),.5,6)*.6,
 'growl': lambda: lp(np.sign(np.sin(2*np.pi*np.cumsum(70+20*np.sin(2*np.pi*3*tt(1.6)))/SR))*rng.uniform(.6,1,int(1.6*SR)),600)*np.sin(np.pi*tt(1.6)/1.6)*.9,
 'thump': lambda: tone(lambda t:50+60*np.exp(-t*20),.4,8)*1.2,
 'hit': lambda: tone(lambda t:40+80*np.exp(-t*10),1.5,2)*1.4+lp(rng.standard_normal(int(1.5*SR)),400)*np.exp(-tt(1.5)*3)*.6,
}
for ev in E['events']:
    if ev['name'] not in SFX: sys.exit(f"SFX desconhecido: '{ev['name']}'")
    add(ev['t'], SFX[ev['name']](), .55 * ev['gain'], (rng.random() - .5) * .4)


# música de suspense baixa: drone grave + pulso de batida cardíaca + arpejo menor esparso
mus = np.zeros(N); tA = np.arange(N) / SR
drone = sum(np.sin(2*np.pi*f*tA + .3*np.sin(2*np.pi*.1*tA)) for f in (55, 82.4, 110.5)) * .18
drone *= .6 + .4*np.sin(2*np.pi*.07*tA)**2
mus += lp(drone, 900)
beat = 60/72; nt = lambda m: 440 * 2 ** ((m - 69) / 12)
def put(at, sig, g=1):
    s = int(at * SR)
    if s >= N: return
    e = min(N, s + len(sig)); mus[s:e] += sig[:e - s] * g
kick = tone(lambda t: 45 + 50 * np.exp(-t * 25), .3, 10)
arp = [57, 60, 64, 65, 64, 60, 57, 56]
for k in range(int(TOTAL / beat)):
    t0 = k * beat
    if 15 <= t0 < 33: continue   # na queda: só vento e ruído
    put(t0, kick, .5); put(t0 + .28, kick, .3)
    if k % 2 == 0: put(t0, np.sin(2*np.pi*nt(arp[(k//2) % 8] + 12)*tt(1.2))*np.exp(-tt(1.2)*3)*.18)
rise = (seg_np := np.clip((tA - 15) / 13, 0, 1)) * (tA < 28.6)
mus += np.sin(2*np.pi*(220 + 440*rise)*tA) * rise * .06
mus = lp(mus, 7000) * .5
L += mus; Rr += mus
fade = np.minimum(1, (TOTAL - np.arange(N) / SR) / .6); L *= fade; Rr *= fade
m = max(np.abs(L).max(), np.abs(Rr).max())
wavfile.write('audio/trilha.wav', SR, (np.stack([L, Rr], 1) / m * .89 * 32767).astype(np.int16))
print('ok', round(TOTAL, 2), 's,', len(E['events']), 'eventos')

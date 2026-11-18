import numpy as np, json
from scipy.signal import butter, sosfilt
from scipy.io import wavfile
SR=48000; D=90; n=SR*D; t=np.arange(n)/SR
rng=np.random.default_rng(7)
def lp(x,f): return sosfilt(butter(2,f,'low',fs=SR,output='sos'),x)
def bp(x,a,b): return sosfilt(butter(2,[a,b],'band',fs=SR,output='sos'),x)
L=np.zeros(n); R=np.zeros(n)
# drone: chord progression changes every ~11s (Am, F, Dm, E)
roots=[55,43.65,36.71,41.2]
for k in range(9):
    s=int(k*10*SR); e=min(n,int((k+1)*10*SR+SR*2)); tt=t[s:e]-t[s]
    env=np.minimum(1,tt/2)*np.minimum(1,(tt[-1]-tt)/2)
    r=roots[k%4]
    for m,a in [(1,.5),(1.5,.25),(2,.2),(2.4 if k%4!=3 else 2.52,.12),(4,.05)]:
        f=r*m; det=1.003
        L[s:e]+=a*env*np.sin(2*np.pi*f*tt+0.3*np.sin(2*np.pi*.1*tt))
        R[s:e]+=a*env*np.sin(2*np.pi*f*det*tt)
L=lp(L,900);R=lp(R,900)
# wind
w=rng.standard_normal(n); mod=0.5+0.5*np.sin(2*np.pi*0.07*t)*np.sin(2*np.pi*0.031*t+1)
wind=bp(w,200,900)*0.25*(0.4+mod)
L+=wind; R+=np.roll(wind,800)
# heartbeat pulses (sub kick) during curiosities & tips
def kick(at,amp=1.0):
    s=int(at*SR); ln=int(0.35*SR); tt=np.arange(ln)/SR
    f=45+70*np.exp(-tt*30); ph=2*np.pi*np.cumsum(f)/SR
    k=np.sin(ph)*np.exp(-tt*9)*amp
    e=min(n,s+ln); L[s:e]+=k[:e-s]; R[s:e]+=k[:e-s]
bpm=72; b=60/bpm
x=1.0
while x<86:
    kick(x,0.9); kick(x+0.28,0.55); x+=b*2
# impacts at each segment start
tl=json.load(open('../timeline.json'))
for s in tl:
    st=s['start']-0.05; i=int(st*SR); ln=int(2.5*SR); tt=np.arange(ln)/SR
    boom=(np.sin(2*np.pi*38*tt)+lp(rng.standard_normal(ln),300)*0.6)*np.exp(-tt*2.2)*0.8
    e=min(n,i+ln); L[i:e]+=boom[:e-i]; R[i:e]+=boom[:e-i]
# riser at start, swell at end
i0=0; ln=int(1.0*SR); tt=np.arange(ln)/SR
riser=bp(rng.standard_normal(ln),800,5000)*(tt/1.0)**2*0.4
L[:ln]+=riser;R[:ln]+=riser
fade=np.ones(n); fo=int(3*SR); fade[-fo:]=np.linspace(1,0,fo); fade[:int(.3*SR)]=np.linspace(0,1,int(.3*SR))
st=np.stack([L*fade,R*fade],1); st/=np.abs(st).max()*1.05
wavfile.write('music.wav',SR,(st*32767*0.9).astype(np.int16))

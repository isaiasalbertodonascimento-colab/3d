# Mistura a narração no vídeo. Uso: python3 mix_narracao.py audio/narr  video_mudo.mp4  saida.mp4
# Espera um arquivo por cena em audio/narr: n01.mp3|wav ... n17 (qualquer voz: ElevenLabs, Piper...). Encaixa cada fala no tempo da cena
# (acelera até 1,35x se passar), coloca no início da cena, abaixa a música (ducking) e normaliza em -14 LUFS.
import sys, json, glob, os, subprocess, numpy as np
from scipy.io import wavfile
SR = 48000
d, vid, out = sys.argv[1], sys.argv[2], sys.argv[3]
S = json.load(open('narracao.json')); T = len(wavfile.read('audio/trilha.wav')[1]) / SR
def load(p, tempo=1.0):
    af = f'atempo={tempo:.3f},' if tempo > 1.001 else ''
    r = subprocess.run(['ffmpeg', '-loglevel', 'error', '-i', p, '-af', af + 'silenceremove=start_periods=1:start_threshold=-45dB', '-ac', '1', '-ar', str(SR), '-f', 's16le', '-'], capture_output=True, check=True)
    return np.frombuffer(r.stdout, np.int16).astype(np.float32) / 32768
N = np.zeros(int((T + 1) * SR), np.float32)
for c in S:
    f = (glob.glob(f'{d}/n{c["cena"]:02d}.*') or [None])[0]
    if not f: print('sem arquivo para a cena', c['cena']); continue
    x = load(f); L = len(x) / SR; room = c['duracao'] - .25
    if L > room: x = load(f, min(1.35, L / room)); L = len(x) / SR
    s = int((c['inicio'] + .1) * SR); N[s:s + len(x)] += x[:len(N) - s]
    print(f'cena {c["cena"]:2d}: fala {L:.2f}s em {c["duracao"]}s' + ('  (LONGA!)' if L > room + .3 else ''))
sr, M = wavfile.read('audio/trilha.wav'); M = (M.astype(np.float32) / 32768); M = M if M.ndim == 2 else np.stack([M, M], 1)
env = np.convolve(np.abs(N[:len(M)]), np.ones(int(.15 * SR)) / (.15 * SR), 'same'); duck = 1 - .6 * np.clip(env * 12, 0, 1)
mix = M * duck[:len(M), None] * .8 + N[:len(M), None] * 1.0
mix = mix / max(1, np.abs(mix).max()) * .89
wavfile.write('audio/mix_narrado.wav', SR, (mix * 32767).astype(np.int16))
subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', vid, '-i', 'audio/mix_narrado.wav', '-af', 'loudnorm=I=-14:TP=-1.5', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k', '-ar', '48000', '-shortest', '-movflags', '+faststart', out], check=True)
print('ok', out)

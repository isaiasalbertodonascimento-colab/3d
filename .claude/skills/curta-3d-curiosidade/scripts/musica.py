#!/usr/bin/env python3
"""Trilha sintetizada (só numpy), sincronizada com timeline.json -> audio/musica.wav

Uso: python3 musica.py <projeto> [--clima curioso|tenso|leve] [--bpm 100]

Gera: base de acordes suave, pulso rítmico, "whoosh" antes de cada beat e um baque
grave em cada shot marcado como impacto. Sem direitos autorais: tudo é gerado aqui.
"""
import argparse, json, os
import numpy as np

SR = 48000

def lowpass(x, fc):
    X = np.fft.rfft(x); f = np.fft.rfftfreq(len(x), 1 / SR)
    X *= 1 / np.sqrt(1 + (f / fc) ** 4)  # Butterworth de 2ª ordem (magnitude)
    return np.fft.irfft(X, len(x))

def bandpass(x, lo, hi):
    return lowpass(x, hi) - lowpass(x, lo)

CLIMAS = {
    # raízes dos acordes (Hz) e intervalos do acorde
    "curioso": dict(roots=[110.0, 87.31, 130.81, 98.0], chord=[1, 1.5, 2, 2.52], bpm=100, bright=1800),   # Am F C G
    "tenso":   dict(roots=[55.0, 58.27, 55.0, 51.91], chord=[1, 1.5, 2, 2.38], bpm=84, bright=900),        # Am Bb Am Ab
    "leve":    dict(roots=[130.81, 98.0, 110.0, 87.31], chord=[1, 1.26, 1.5, 2], bpm=112, bright=2600),   # C G Am F
    "cinematico": dict(roots=[73.42, 58.27, 87.31, 65.41], chord=[1, 1.5, 2, 2.38], bpm=78, bright=1200),  # Dm Bb F C (épico suave)
    "emocional": dict(roots=[87.31, 130.81, 98.0, 110.0], chord=[1, 1.26, 1.5, 2], bpm=72, bright=1500),  # F C G Am (histórias)
}

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("project"); ap.add_argument("--clima", default="curioso", choices=CLIMAS); ap.add_argument("--bpm", type=float)
    ap.add_argument("--magia", default="", help="cenas (separadas por vírgula) que ganham zumbido mágico")
    ap.add_argument("--whoosh-cortes", action="store_true", help="whoosh suave em cada corte de shot")
    a = ap.parse_args()
    tl = json.load(open(os.path.join(a.project, "timeline.json"), encoding="utf-8"))
    c = CLIMAS[a.clima]; bpm = a.bpm or c["bpm"]; beat = 60 / bpm
    D = tl["total"]; n = int(SR * D); t = np.arange(n) / SR
    rng = np.random.default_rng(7)
    L = np.zeros(n); R = np.zeros(n)

    # base: um acorde a cada 2 compassos, com ataque e soltura suaves
    bar = beat * 4; seg = bar * 2; k = 0
    while k * seg < D:
        s = int(k * seg * SR); e = min(n, int(((k + 1) * seg + 0.6) * SR)); tt = t[s:e] - t[s]
        env = np.minimum(1, tt / 0.8) * np.minimum(1, (tt[-1] - tt) / 0.6 + 1e-9)
        r = c["roots"][k % len(c["roots"])]
        for m, amp in zip(c["chord"], [.35, .2, .16, .12]):
            for det, ch in ((1.0, L), (1.004, R)):
                ch[s:e] += amp * env * (np.sin(2 * np.pi * r * m * det * tt) + 0.3 * np.sin(4 * np.pi * r * m * det * tt))
        k += 1
    L = lowpass(L, c["bright"]); R = lowpass(R, c["bright"])

    # pulso: bumbo leve + chimbal, entra depois do gancho
    start = tl["beats"][0]["end"] if len(tl["beats"]) > 1 else 0.5
    def hit(at, kind):
        i = int(at * SR)
        if kind == "kick":
            ln = int(.3 * SR); tt = np.arange(ln) / SR; f = 50 + 90 * np.exp(-tt * 35)
            w = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tt * 12) * .55
        else:
            ln = int(.06 * SR); tt = np.arange(ln) / SR
            w = rng.standard_normal(ln) * np.exp(-tt * 70) * .08
        e = min(n, i + ln)
        if i < n: L[i:e] += w[:e - i]; R[i:e] += w[:e - i]
    x = start
    while x < D - 1.5:
        hit(x, "kick"); hit(x + beat / 2, "hat"); hit(x + beat * 1.5, "hat"); x += beat * 2

    # whoosh subindo antes de cada beat (a partir do 2º)
    for b in tl["beats"][1:]:
        ln = int(0.5 * SR); i = int((b["start"] - 0.5) * SR); tt = np.arange(ln) / SR
        w = bandpass(rng.standard_normal(ln), 600, 6000) * (tt / 0.5) ** 2 * 0.35
        e = min(n, i + ln); L[i:e] += w[:e - i]; R[i:e] += w[:e - i] * .8
    # whoosh curto em cada corte
    if a.whoosh_cortes:
        for sh in tl["shots"][1:]:
            ln = int(0.32 * SR); i = int((sh["start"] - 0.28) * SR); tt = np.arange(ln) / SR
            w = bandpass(rng.standard_normal(ln), 900, 5000) * np.sin(np.pi * tt / 0.32) ** 2 * 0.16
            e = min(n, i + ln); i0 = max(0, i)
            if e > i0: L[i0:e] += w[i0 - i:e - i]; R[i0:e] += w[i0 - i:e - i] * 0.85
    # zumbido mágico (cintilante) nas cenas de poder
    magia = {c.strip() for c in a.magia.split(",") if c.strip()}
    for sh in tl["shots"]:
        if sh["cena"] not in magia: continue
        i = int(sh["start"] * SR); e = min(n, int(sh["end"] * SR)); tt = np.arange(e - i) / SR; dur = max(tt[-1], 1e-3)
        env = np.minimum(1, tt / 0.25) * np.minimum(1, (dur - tt) / 0.3 + 1e-9)
        z = sum(np.sin(2 * np.pi * f * tt + 3 * np.sin(2 * np.pi * 5.5 * tt)) / (k + 1) for k, f in enumerate([440, 660, 990, 1320]))
        z = z * (0.6 + 0.4 * np.sin(2 * np.pi * 7 * tt)) * env * 0.07
        L[i:e] += z; R[i:e] += np.roll(z, 400)
    # baque grave nos impactos
    for s in tl["shots"]:
        if not s.get("impacto"): continue
        i = int(s["start"] * SR); ln = int(1.6 * SR); tt = np.arange(ln) / SR
        boom = (np.sin(2 * np.pi * 42 * tt) + lowpass(rng.standard_normal(ln), 250) * .5) * np.exp(-tt * 3.2) * .9
        e = min(n, i + ln); L[i:e] += boom[:e - i]; R[i:e] += boom[:e - i]

    fade = np.ones(n); fo = int(1.5 * SR); fade[-fo:] = np.linspace(1, 0, fo); fi = int(.2 * SR); fade[:fi] = np.linspace(0, 1, fi)
    st = np.stack([L * fade, R * fade], 1); st /= np.abs(st).max() * 1.12
    out = os.path.join(a.project, "audio", "musica.wav"); os.makedirs(os.path.dirname(out), exist_ok=True)
    import wave
    with wave.open(out, "wb") as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes((st * 32767).astype("<i2").tobytes())
    print(f"[musica] {out} ({D:.1f}s, clima {a.clima}, {bpm:.0f} bpm)")

if __name__ == "__main__":
    main()

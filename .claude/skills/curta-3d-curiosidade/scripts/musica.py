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
}

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("project"); ap.add_argument("--clima", default="curioso", choices=CLIMAS); ap.add_argument("--bpm", type=float)
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

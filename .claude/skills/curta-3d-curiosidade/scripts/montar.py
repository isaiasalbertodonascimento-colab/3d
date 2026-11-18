#!/usr/bin/env python3
"""Junta quadros + narração + trilha (com ducking) -> <projeto>/final.mp4 (1080x1920).

Uso: python3 montar.py <projeto> [--musica-vol 0.35] [--crf 18]
"""
import argparse, glob, json, os, subprocess, sys

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("project"); ap.add_argument("--musica-vol", type=float, default=0.35); ap.add_argument("--crf", type=int, default=18)
    a = ap.parse_args(); P = a.project
    tl = json.load(open(os.path.join(P, "timeline.json"), encoding="utf-8"))
    fps = tl.get("fps", 30); need = int(tl["total"] * fps)
    frames = sorted(glob.glob(os.path.join(P, "frames", "f*.jpg")))
    if len(frames) < need - 1:
        sys.exit(f"[erro] faltam quadros: {len(frames)} de {need}. Rode render.js de novo (ele retoma de onde parou).")
    nar = os.path.join(P, "audio", "narracao.wav"); mus = os.path.join(P, "audio", "musica.wav")
    for f in (nar, mus):
        if not os.path.exists(f): sys.exit(f"[erro] falta {f}")
    lead_ms = int(tl["lead"] * 1000)
    # a música abaixa sozinha quando a voz entra (sidechaincompress) e volta nas pausas
    fc = (f"[1:a]adelay={lead_ms}|{lead_ms},aformat=channel_layouts=stereo,apad,asplit=2[v][sc];"
          f"[2:a]volume={a.musica_vol}[m];"
          f"[m][sc]sidechaincompress=threshold=0.03:ratio=8:attack=15:release=350[md];"
          f"[v][md]amix=inputs=2:duration=longest:normalize=0,alimiter=limit=0.95[a]")
    out = os.path.join(P, "final.mp4")
    cmd = ["ffmpeg", "-y", "-hide_banner", "-loglevel", "error", "-framerate", str(fps), "-i", os.path.join(P, "frames", "f%05d.jpg"),
           "-i", nar, "-i", mus, "-filter_complex", fc, "-map", "0:v", "-map", "[a]",
           "-vf", "scale=1080:1920:flags=lanczos", "-c:v", "libx264", "-preset", "medium", "-crf", str(a.crf), "-pix_fmt", "yuv420p",
           "-c:a", "aac", "-b:a", "192k", "-t", f"{tl['total']:.3f}", "-movflags", "+faststart", out]
    r = subprocess.run(cmd, capture_output=True, text=True)
    if r.returncode: sys.exit("[erro] ffmpeg:\n" + r.stderr)
    print(f"[montar] {out} pronto ({tl['total']:.1f}s, {os.path.getsize(out) / 1e6:.1f} MB)")

if __name__ == "__main__":
    main()

#!/usr/bin/env python3
"""Gera timeline.json SEM narração: cada frase fica na tela pelo tempo de leitura.

Uso: python3 timeline_sem_voz.py <projeto> [--cps 15] [--pausa 0.45] [--lead 0.8] [--tail 2.0]

cps = caracteres por segundo de leitura (15 é confortável para legenda em blocos de 2–4 palavras).
Os shots são distribuídos como no timeline.py (cortes encaixados nas fronteiras de frase,
nunca menores que ~1,2 s).
"""
import argparse, json, os, re

def frases(t):
    return [p.strip() for p in re.split(r"(?<=[.!?…])\s+", t.strip()) if p.strip()]

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("project"); ap.add_argument("--cps", type=float, default=15); ap.add_argument("--pausa", type=float, default=0.45)
    ap.add_argument("--lead", type=float, default=0.8); ap.add_argument("--tail", type=float, default=2.0); ap.add_argument("--min", type=float, default=1.2, help="tempo mínimo de cada frase na tela"); ap.add_argument("--fps", type=int, default=30)
    a = ap.parse_args(); P = a.project
    doc = json.load(open(os.path.join(P, "beats.json"), encoding="utf-8"))
    t = a.lead; beats = []
    for bi, b in enumerate(doc["beats"]):
        ss = []
        for s in frases(b["narracao"]):
            d = max(a.min, len(s) / a.cps + 0.25)
            ss.append({"text": s, "start": round(t, 3), "end": round(t + d, 3)}); t += d + a.pausa
        beats.append({"id": b.get("id", f"b{bi+1}"), "tag": b.get("tag", ""), "start": ss[0]["start"], "end": ss[-1]["end"], "sentences": ss})
    total = round(beats[-1]["end"] + a.tail, 3)
    shots = []
    for bi, (b, bd) in enumerate(zip(beats, doc["beats"])):
        sl = bd.get("shots") or [{"cena": bd.get("cena", "personagem")}]
        b0 = 0.0 if bi == 0 else b["start"] - 0.12
        b1 = beats[bi + 1]["start"] - 0.12 if bi + 1 < len(beats) else total
        bounds = [s["start"] - 0.12 for s in b["sentences"][1:]]
        cuts = []
        for j in range(1, len(sl)):
            target = b0 + (b1 - b0) * j / len(sl)
            near = min(bounds, key=lambda x: abs(x - target)) if bounds else None
            prev = cuts[-1] if cuts else b0
            ok = near is not None and abs(near - target) < 1.2 and near - prev >= 1.2 and b1 - near >= 1.2 * (len(sl) - j)
            cuts.append(near if ok else target)
        edges = [b0] + cuts + [b1]
        if min(edges[i + 1] - edges[i] for i in range(len(edges) - 1)) < 1.2:  # algum ficou curto: divide por igual
            edges = [b0 + (b1 - b0) * i / len(sl) for i in range(len(sl) + 1)]
        for j, s in enumerate(sl):
            shots.append({"beat": bi, "start": round(edges[j], 3), "end": round(edges[j + 1], 3), "cena": s["cena"],
                          "camera": s.get("camera", "static"), "impacto": bool(s.get("impacto", False)), "args": s.get("args", {})})
    tl = {"fps": a.fps, "total": total, "lead": a.lead, "titulos": doc.get("titulos", {}), "beats": beats, "shots": shots, "sem_voz": True}
    json.dump(tl, open(os.path.join(P, "timeline.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    print(f"[timeline sem voz] {sum(len(b['sentences']) for b in beats)} frases, {total:.1f}s ({int(total * a.fps)} quadros), {len(shots)} shots")
    for i, s in enumerate(shots):
        d = s["end"] - s["start"]; flag = "  <-- longo (>5s)" if d > 5 else ("  <-- curto" if d < 1.2 else "")
        print(f"  shot {i:2d} {s['start']:6.2f}-{s['end']:6.2f} ({d:.1f}s) {s['cena']} {s['args'] or ''}{flag}")

if __name__ == "__main__":
    main()

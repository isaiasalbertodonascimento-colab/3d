#!/usr/bin/env python3
"""Alinha a narração com o roteiro e gera timeline.json + audio/narracao.wav.

Uso: python3 timeline.py <pasta_do_projeto> [--audio arquivo] [--lead 0.8] [--tail 1.6]

Como funciona: cada frase do roteiro (termina em . ! ? …) é separada por uma pausa
de ~0,8 s na fala sintetizada. O script detecta essas pausas com o silencedetect do
ffmpeg e casa uma pausa com cada fronteira de frase. Se sobrar exatamente uma pausa
longa no fim (a vinheta "FreeTTS" do plano grátis), o áudio é cortado antes dela.
Se a contagem não bater, cai para tempos proporcionais ao número de letras e AVISA.
"""
import argparse, json, os, re, subprocess, sys, shutil

def run(cmd):
    return subprocess.run(cmd, capture_output=True, text=True)

def duration(path):
    r = run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", path])
    return float(r.stdout.strip())

def silences(path, noise="-35dB", d=0.45):
    r = run(["ffmpeg", "-hide_banner", "-i", path, "-af", f"silencedetect=noise={noise}:d={d}", "-f", "null", "-"])
    out, cur = [], None
    for line in r.stderr.splitlines():
        m = re.search(r"silence_start: ([\d.]+)", line)
        if m: cur = float(m.group(1))
        m = re.search(r"silence_end: ([\d.]+)", line)
        if m and cur is not None: out.append((max(0.0, cur), float(m.group(1)))); cur = None
    if cur is not None: out.append((cur, None))  # silêncio até o fim do arquivo
    return out

def split_sentences(text):
    parts = re.split(r"(?<=[.!?…])\s+", text.strip())
    return [p.strip() for p in parts if p.strip()]

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("project")
    ap.add_argument("--audio", help="narração (padrão: audio/narracao_raw.mp3 ou .wav)")
    ap.add_argument("--lead", type=float, default=None, help="segundos antes da 1ª fala")
    ap.add_argument("--tail", type=float, default=None, help="segundos depois da última fala")
    ap.add_argument("--fps", type=int, default=30)
    ap.add_argument("--sem-vinheta", action="store_true", help="não procurar/cortar vinheta no fim (voz gravada ou TTS pago)")
    a = ap.parse_args()
    P = a.project
    beats_doc = json.load(open(os.path.join(P, "beats.json"), encoding="utf-8"))
    lead = a.lead if a.lead is not None else beats_doc.get("lead", 0.8)
    tail = a.tail if a.tail is not None else beats_doc.get("tail", 1.8)
    src = a.audio
    if not src:
        for c in ("audio/narracao_raw.mp3", "audio/narracao_raw.wav", "audio/narracao_raw.m4a"):
            if os.path.exists(os.path.join(P, c)): src = os.path.join(P, c); break
    if not src or not os.path.exists(src):
        sys.exit("[erro] narração não encontrada. Salve em <projeto>/audio/narracao_raw.mp3")

    sents = []  # (beat_index, texto)
    for bi, b in enumerate(beats_doc["beats"]):
        for s in split_sentences(b["narracao"]): sents.append((bi, s))
    N = len(sents)
    dur = duration(src)
    sil = silences(src)
    lead_sil = sil[0] if sil and sil[0][0] < 0.05 else None
    speech_start = lead_sil[1] if lead_sil else 0.0
    internal = [s for s in sil if s is not lead_sil and s[1] is not None]
    trailing = [s for s in sil if s[1] is None]
    speech_end = trailing[0][0] if trailing else dur
    mode, warn = "pausas", None
    # vinheta do TTS grátis: pausa longa (>= 1,2 s) nos últimos 6 s, seguida de uma fala curta.
    # Tudo dali em diante é descartado.
    tag = [s for s in internal if s[1] - s[0] >= 1.2 and s[0] > dur - 6]
    if tag and not a.sem_vinheta:
        speech_end = tag[0][0]; internal = [s for s in internal if s[0] < speech_end]; mode += " + vinheta cortada"
    if len(internal) < N - 1:
        # voz com pausas curtas (ex.: ElevenLabs): procura de novo com limiar menor
        fino = [s for s in silences(src, d=0.18) if s[1] is not None and s[0] > speech_start + 0.05 and s[1] < speech_end]
        if len(fino) >= N - 1: internal = fino; mode += " curtas"
    if len(internal) == N - 1:
        gaps = internal
    elif len(internal) > N - 1:
        # Mais pausas que fronteiras (vírgulas também pausam). Estima onde cada frase deveria
        # acabar pelo nº de letras e escolhe, em ordem, as pausas que melhor batem com essas
        # estimativas, preferindo as mais longas (programação dinâmica).
        tot = sum(len(s) + 4 for _, s in sents); acc = 0; exp = []
        for _, s in sents[:-1]:
            acc += len(s) + 4; exp.append(speech_start + (speech_end - speech_start) * acc / tot)
        M = len(internal); INF = float("inf")
        mid = [(s[0] + s[1]) / 2 for s in internal]; ln = [s[1] - s[0] for s in internal]
        cost = lambda i, j: abs(mid[j] - exp[i]) - 2.0 * ln[j]
        D = [[INF] * M for _ in range(N - 1)]; B = [[-1] * M for _ in range(N - 1)]
        for j in range(M): D[0][j] = cost(0, j)
        for i in range(1, N - 1):
            best, bj = INF, -1
            for j in range(M):
                if j > 0 and D[i - 1][j - 1] < best: best, bj = D[i - 1][j - 1], j - 1
                if best < INF: D[i][j] = best + cost(i, j); B[i][j] = bj
        j = min(range(M), key=lambda x: D[N - 2][x]); pick = []
        for i in range(N - 2, -1, -1): pick.append(j); j = B[i][j]
        gaps = [internal[k] for k in reversed(pick)]
        mode += f" (casadas pelo texto: {N-1} de {len(internal)})"
        desvio = max(abs((g[0] + g[1]) / 2 - e) for g, e in zip(gaps, exp))
        if desvio > 2.5:
            warn = f"alguma fronteira de frase ficou {desvio:.1f}s longe do esperado: confira as legendas nos stills."
    else:
        gaps = None
        mode = "proporcional"
        warn = (f"esperava {N-1} pausas entre {N} frases e achei {len(internal)}. "
                "Tempos ficaram proporcionais às letras: confira legendas nos stills. "
                "Para alinhar certo, gere a narração com uma frase por parágrafo.")

    # tempos de cada frase (relativos ao áudio original)
    times = []
    if gaps:
        for i in range(N):
            st = speech_start if i == 0 else gaps[i - 1][1] - 0.04
            en = speech_end if i == N - 1 else gaps[i][0] + 0.04
            times.append((st, en))
    else:
        tot = sum(len(s) for _, s in sents); t = speech_start
        for _, s in sents:
            d = (speech_end - speech_start) * len(s) / tot; times.append((t, t + d)); t += d

    # corta e normaliza a narração; o vídeo começa "lead" segundos antes da 1ª fala
    a0 = max(0.0, speech_start - 0.05); a1 = min(dur, speech_end + 0.2)
    os.makedirs(os.path.join(P, "audio"), exist_ok=True)
    out_wav = os.path.join(P, "audio", "narracao.wav")
    r = run(["ffmpeg", "-y", "-hide_banner", "-loglevel", "error", "-i", src, "-ss", f"{a0:.3f}", "-to", f"{a1:.3f}",
             "-af", "afade=t=out:st={:.3f}:d=0.15,highpass=f=70,loudnorm=I=-15:TP=-1.5:LRA=9".format(max(0, a1 - a0 - 0.15)),
             "-ar", "48000", "-ac", "1", out_wav])
    if r.returncode: sys.exit("[erro] ffmpeg: " + r.stderr)
    off = lead - a0
    total = round(lead + (a1 - a0) + tail, 3)

    beats = []
    for bi, b in enumerate(beats_doc["beats"]):
        ss = [{"text": s, "start": round(times[i][0] + off, 3), "end": round(times[i][1] + off, 3)}
              for i, (j, s) in enumerate(sents) if j == bi]
        beats.append({"id": b.get("id", f"b{bi+1}"), "tag": b.get("tag", ""), "start": ss[0]["start"], "end": ss[-1]["end"], "sentences": ss})

    # shots: divide cada beat em partes iguais, encaixando o corte na fronteira de frase mais próxima
    shots = []
    for bi, (b, bd) in enumerate(zip(beats, beats_doc["beats"])):
        sl = bd.get("shots") or [{"cena": bd.get("cena", "personagem")}]
        nxt = beats[bi + 1]["start"] if bi + 1 < len(beats) else total
        b0 = 0.0 if bi == 0 else b["start"] - 0.12
        b1 = nxt - 0.12 if bi + 1 < len(beats) else total
        bounds = [s["start"] - 0.12 for s in b["sentences"][1:]]
        cuts = []
        for j in range(1, len(sl)):
            target = b0 + (b1 - b0) * j / len(sl)
            near = min(bounds, key=lambda x: abs(x - target)) if bounds else None
            prev = cuts[-1] if cuts else b0
            ok = near is not None and abs(near - target) < 1.2 and near - prev >= 1.2 and b1 - near >= 1.2 * (len(sl) - j)
            cuts.append(near if ok else target)  # nunca deixa um shot com menos de ~1,2 s
        edges = [b0] + cuts + [b1]
        if min(edges[i + 1] - edges[i] for i in range(len(edges) - 1)) < 1.2:  # algum ficou curto: divide por igual
            edges = [b0 + (b1 - b0) * i / len(sl) for i in range(len(sl) + 1)]
        for j, s in enumerate(sl):
            shots.append({"beat": bi, "start": round(edges[j], 3), "end": round(edges[j + 1], 3), "cena": s["cena"],
                          "camera": s.get("camera", "static"), "impacto": bool(s.get("impacto", False)), "args": s.get("args", {}),
                          "descricao": s.get("descricao", "")})

    tl = {"fps": a.fps, "total": total, "lead": lead, "titulos": beats_doc.get("titulos", {}), "beats": beats, "shots": shots}
    json.dump(tl, open(os.path.join(P, "timeline.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=1)

    print(f"[timeline] {N} frases, alinhamento: {mode}. Duração total {total:.1f}s ({int(total * a.fps)} quadros).")
    for b in beats:
        for s in b["sentences"]: print(f"  {s['start']:6.2f}-{s['end']:6.2f}  [{b['id']}] {s['text']}")
    for i, s in enumerate(shots):
        d = s["end"] - s["start"]; flag = "  <-- longo (>4,5s): divida o beat em mais shots" if d > 4.5 else ""
        print(f"  shot {i:2d} {s['start']:6.2f}-{s['end']:6.2f} ({d:.1f}s) {s['cena']} / {s['camera']}{' / IMPACTO' if s['impacto'] else ''}{flag}")
    if warn: print("[AVISO] " + warn)

if __name__ == "__main__":
    if not shutil.which("ffmpeg"): sys.exit("[erro] ffmpeg não instalado")
    main()

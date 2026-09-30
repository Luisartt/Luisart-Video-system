"""Compare the written script with what was actually said (Whisper transcript). Read-only.

Usage:  python comparar_guion.py <guion.txt|.md> <transcript.json> [--md salida.md]

transcript.json is the file written by luisart-editar-short/scripts/transcribe_parts.py:
{"text", "words": [{"text","start","end"}], "splits": [...]}.

Reports: how much of the script was said, script passages that were skipped, spoken passages that
are not in the script (ad-libs or repeats/retakes), and every NUMBER that differs. It never edits
anything: what Luisart said is not changed; figure problems are flagged for the report.
"""
import argparse, difflib, json, re, sys, unicodedata


def norm(s):
    s = unicodedata.normalize("NFD", s.lower())
    s = "".join(c for c in s if unicodedata.category(c) != "Mn")
    return re.sub(r"[^a-z0-9$%]", "", s)


def script_words(text):
    text = re.sub(r"^---.*?---", "", text, flags=re.S)           # frontmatter
    text = re.sub(r"\[[^\]]*\]|\([^)]*\)|^#+.*$|^>.*$", " ", text, flags=re.M)  # [acotaciones], (notas), headings
    out = []
    for raw in text.split():
        n = norm(raw)
        if n:
            out.append((raw.strip(".,;:¡!¿?\"'()"), n))
    return out


def fmt_time(t):
    return f"{int(t // 60):02d}:{t % 60:04.1f}"


def main():
    sys.stdout.reconfigure(encoding="utf-8")
    ap = argparse.ArgumentParser()
    ap.add_argument("guion")
    ap.add_argument("transcript")
    ap.add_argument("--md")
    a = ap.parse_args()

    sw = script_words(open(a.guion, encoding="utf-8").read())
    tw = json.load(open(a.transcript, encoding="utf-8"))["words"]
    sn = [n for _, n in sw]
    tn = [norm(w["text"]) for w in tw]
    keep = [i for i, n in enumerate(tn) if n]
    tw = [tw[i] for i in keep]
    tn = [tn[i] for i in keep]

    sm = difflib.SequenceMatcher(None, sn, tn, autojunk=False)
    matched = sum(b.size for b in sm.get_matching_blocks())
    cover = 100.0 * matched / max(1, len(sn))
    spoken_extra = 100.0 * (len(tn) - matched) / max(1, len(tn))

    skipped, extra, numbers = [], [], []
    for tag, i1, i2, j1, j2 in sm.get_opcodes():
        if tag == "equal":
            continue
        s_txt = " ".join(w for w, _ in sw[i1:i2])
        t_txt = " ".join(w["text"] for w in tw[j1:j2])
        at = tw[j1]["start"] if j1 < len(tw) else (tw[-1]["end"] if tw else 0)
        if re.search(r"\d", s_txt) or re.search(r"\d", t_txt):
            numbers.append((fmt_time(at), s_txt or "—", t_txt or "—"))
        if tag in ("delete", "replace") and len(sw[i1:i2]) >= 3:
            skipped.append((fmt_time(at), s_txt, t_txt))
        elif tag == "insert" and len(tw[j1:j2]) >= 3:
            extra.append((fmt_time(at), t_txt))

    lines = [
        f"# Guion vs lo que se dijo",
        "",
        f"- Palabras del guion: {len(sn)} · palabras dichas: {len(tn)}",
        f"- **Cobertura del guion: {cover:.0f} %** (lo que sí se dijo tal cual)",
        f"- Dicho fuera del guion (ad-libs, repeticiones): {spoken_extra:.0f} %",
        "",
        "## Partes del guion que no se dijeron (o se dijeron distinto)",
    ]
    lines += [f"- [{t}] guion: «{s}» → dicho: «{d or '—'}»" for t, s, d in skipped[:40]] or ["- Ninguna."]
    lines += ["", "## Dicho que no está en el guion"]
    lines += [f"- [{t}] «{x}»" for t, x in extra[:40]] or ["- Nada relevante."]
    lines += ["", "## Números o cifras que cambiaron (revisar, NO se corrige lo dicho)"]
    lines += [f"- [{t}] guion: «{s}» → dicho: «{d}»" for t, s, d in numbers[:40]] or ["- Ninguno."]
    report = "\n".join(lines)
    if a.md:
        open(a.md, "w", encoding="utf-8").write(report + "\n")
    print(report)


if __name__ == "__main__":
    main()

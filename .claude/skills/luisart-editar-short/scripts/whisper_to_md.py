"""Turn a transcribe_parts.py result into a readable Markdown transcript with [mm:ss] paragraph stamps.

Usage:
  python -W ignore .claude/skills/luisart-editar-short/scripts/whisper_to_md.py \
    <transcript.json> <out.md> [--pause 1.2] [--max-words 70]

A new paragraph starts after a pause of at least --pause seconds (default 1.2) or when a paragraph
reaches --max-words words. Only the text is rewritten as Markdown; timings stay in the json.
"""
import json
import sys


def arg(name, default):
    return type(default)(sys.argv[sys.argv.index(name) + 1]) if name in sys.argv else default


def stamp(sec):
    sec = int(sec)
    h, m, s = sec // 3600, sec % 3600 // 60, sec % 60
    return f"{h}:{m:02d}:{s:02d}" if h else f"{m:02d}:{s:02d}"


def main():
    if len(sys.argv) < 3:
        sys.exit(__doc__)
    src, out = sys.argv[1], sys.argv[2]
    pause, max_words = arg("--pause", 1.2), arg("--max-words", 70)
    words = json.load(open(src, encoding="utf-8"))["words"]
    paras, cur, cur_start, prev_end = [], [], 0.0, 0.0
    for w in words:
        if cur and (w["start"] - prev_end >= pause or len(cur) >= max_words):
            paras.append((cur_start, " ".join(cur)))
            cur = []
        if not cur:
            cur_start = w["start"]
        cur.append(w["text"].strip())
        prev_end = w["end"]
    if cur:
        paras.append((cur_start, " ".join(cur)))
    with open(out, "w", encoding="utf-8", newline="\n") as fh:
        for start, text in paras:
            fh.write(f"**[{stamp(start)}]** {text}\n\n")
    print(f"{len(words)} words, {len(paras)} paragraphs -> {out}")


if __name__ == "__main__":
    main()

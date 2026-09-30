"""Word-timed Spanish transcript with whisper-large-v3-turbo, split in pauses so no part crosses
the pipeline's 30 s chunk boundary (where it hallucinates "Gracias…" and repeated lines).

Same model and settings as .firecrawl/whisper_words.py, plus the split and an optional word check.

Usage (from the project root, under the render lock — it uses the GPU):
  npx tsx .claude/skills/luisart-editar-short/scripts/with_lock.ts -- \
    .venv/Scripts/python.exe -W ignore .claude/skills/luisart-editar-short/scripts/transcribe_parts.py \
    <audio-or-video> <out.json> [--max 28] [--lang spanish|english|auto] [--expect transcript-words.json [--cuts cut/cuts.json]]

- Splits the audio into parts of at most --max seconds (default 28), each cut in the longest
  silence (ffmpeg silencedetect, -35 dB, >= 0.2 s) near the ideal split point; a 44 s file ends up
  in two halves, like the per-barato checks.
- Writes <out.json> = {"text", "words": [{text, start, end}], "splits": [s, ...]} in the input's
  own time (seconds).
- --expect: compares the words, in order, against an expected transcript (e.g. the source
  transcript-words.json). With --cuts, only the words kept by cuts.json are expected (the check of a
  final render against the cut). Prints missing / extra words with their times; exit code 0 either
  way (a human reads the diff: "dos" vs "2" is fine, a missing sentence is not).
"""
import difflib
import json
import os
import re
import subprocess
import sys
import tempfile
import unicodedata

os.environ.setdefault("HF_HUB_OFFLINE", "1")  # don't stall on Hugging Face requests


def arg(name, default=None):
    return sys.argv[sys.argv.index(name) + 1] if name in sys.argv else default


def duration(path):
    return float(subprocess.check_output(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", path]).decode().strip())


def silences(path):
    r = subprocess.run(["ffmpeg", "-hide_banner", "-nostats", "-i", path, "-af", "silencedetect=noise=-35dB:d=0.2", "-f", "null", "-"],
                       capture_output=True, text=True)
    starts = [float(x) for x in re.findall(r"silence_start: ([\d.]+)", r.stderr)]
    ends = [float(x) for x in re.findall(r"silence_end: ([\d.]+)", r.stderr)]
    return [(a, b) for a, b in zip(starts, ends)]


def split_points(total, max_len, sil):
    points, start = [], 0.0
    while total - start > max_len:
        ideal = start + min(max_len, (total - start) / 2 if total - start < 2 * max_len else max_len)
        cands = [(a + b) / 2 for a, b in sil if start + 5 < (a + b) / 2 <= start + max_len]
        cut = min(cands, key=lambda m: abs(m - ideal)) if cands else start + max_len
        points.append(round(cut, 3))
        start = cut
    return points


def norm(s):
    s = unicodedata.normalize("NFD", s.lower())
    s = "".join(c for c in s if unicodedata.category(c) != "Mn")
    return re.sub(r"[^a-z0-9]", "", s)


def main():
    src, out = sys.argv[1], sys.argv[2]
    max_len = float(arg("--max", "28"))
    total = duration(src)
    cuts = split_points(total, max_len, silences(src))
    bounds = [0.0] + cuts + [total]

    import torch
    from transformers import pipeline

    asr = pipeline("automatic-speech-recognition", model="openai/whisper-large-v3-turbo", torch_dtype=torch.float16, device="cuda:0")
    lang = arg("--lang", "spanish")  # "spanish" (default), any Whisper language name ("english"), or "auto" to detect
    gen_kwargs = {"task": "transcribe"} if lang == "auto" else {"language": lang, "task": "transcribe"}
    words, texts = [], []
    with tempfile.TemporaryDirectory() as tmp:
        for i, (a, b) in enumerate(zip(bounds[:-1], bounds[1:])):
            part = os.path.join(tmp, f"part{i}.wav")
            subprocess.check_call(["ffmpeg", "-v", "error", "-y", "-ss", f"{a:.3f}", "-to", f"{b:.3f}", "-i", src, "-vn", "-ac", "1", "-ar", "16000", part])
            r = asr(part, chunk_length_s=30, batch_size=4, return_timestamps="word", generate_kwargs=gen_kwargs)
            texts.append(r["text"].strip())
            for c in r["chunks"]:
                s, e = c["timestamp"]
                words.append({"text": c["text"].strip(), "start": round(a + (s or 0), 3), "end": round(a + (e if e is not None else (s or 0)), 3)})
    json.dump({"text": " ".join(texts), "words": words, "splits": cuts}, open(out, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    print(f"{len(words)} words, split at {cuts} s -> {out}")

    expect_path = arg("--expect")
    if not expect_path:
        return
    exp = json.load(open(expect_path, encoding="utf-8"))["words"]
    cuts_path = arg("--cuts")
    if cuts_path:
        keep = json.load(open(cuts_path, encoding="utf-8"))["keep"]
        exp = [w for w in exp if any(k["in"] <= (w["start"] + w["end"]) / 2 <= k["out"] for k in keep)]
    a = [norm(w["text"]) for w in exp]
    b = [norm(w["text"]) for w in words]
    sm = difflib.SequenceMatcher(a=a, b=b, autojunk=False)
    same = sum(bl.size for bl in sm.get_matching_blocks())
    print(f"expected {len(a)} words, heard {len(b)}, {same} in order")
    for op, i1, i2, j1, j2 in sm.get_opcodes():
        if op == "equal":
            continue
        miss = " ".join(w["text"] for w in exp[i1:i2])
        extra = " ".join(w["text"] for w in words[j1:j2])
        at = words[j1]["start"] if j1 < len(words) else (words[-1]["end"] if words else 0)
        print(f"  {op:7s} @{at:6.2f}s  expected: [{miss}]  heard: [{extra}]")


if __name__ == "__main__":
    main()

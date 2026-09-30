"""Builds a Codex review prompt: instructions + rules + every listed file pasted WITH line numbers.

Codex's read-only sandbox can't start processes on Windows (CreateProcessAsUserW: access denied),
so it can't open files itself: everything it must judge goes into the prompt text.

Usage (from the project root):
  .venv/Scripts/python.exe .claude/skills/luisart-revision-codex/scripts/make_prompt.py <out.txt> \
      --head <instructions.md> [--frames <frames.json>] -- <file> [<file> ...]

- --head: the task text (what to review, the rule checklist, the answer format).
- --frames: frames.json from review_frames.py; appended as a tile -> frame/time legend so Codex
  can cite tiles precisely.
- Files are pasted as "=== path (N lines) ===" followed by "  12| code". A file can be limited
  to a line range with path:START-END (e.g. CHANNEL.md:1-120).
- Prints the prompt size. Keep one prompt under ~150k characters: split big reviews into several
  calls (one per deliverable, one for docs/libraries), run one at a time.
"""
import json
import sys


def main():
    out = sys.argv[1]
    args = sys.argv[2:]
    files = args[args.index("--") + 1:] if "--" in args else []
    opts = args[: args.index("--")] if "--" in args else args
    head = opts[opts.index("--head") + 1]
    frames = opts[opts.index("--frames") + 1] if "--frames" in opts else None

    parts = [open(head, encoding="utf-8").read().rstrip(), ""]
    if frames:
        data = json.load(open(frames, encoding="utf-8"))
        parts.append(f"=== Contact-sheet legend ({data['video']}, {data['fps']:g} fps): tile -> sheet, frame, seconds ===")
        parts += [f"{t['tile']:03d}: sheet {t['sheet']:02d}, f{t['frame']}, {t['seconds']:.2f}s" for t in data["frames"]]
        parts.append("")
    for spec in files:
        path, rng = (spec.rsplit(":", 1) + [None])[:2] if ":" in spec[2:] else (spec, None)
        lines = open(path, encoding="utf-8").read().splitlines()
        a, b = 1, len(lines)
        if rng:
            a, b = (int(x) for x in rng.split("-"))
        parts.append(f"=== {path} (lines {a}-{min(b, len(lines))} of {len(lines)}) ===")
        parts += [f"{i:4d}| {lines[i - 1]}" for i in range(a, min(b, len(lines)) + 1)]
        parts.append("")
    text = "\n".join(parts)
    open(out, "w", encoding="utf-8").write(text)
    print(f"wrote {out}: {len(text):,} characters, {len(files)} files")
    if len(text) > 150_000:
        print("WARNING: over ~150k characters - split this review into several calls")


if __name__ == "__main__":
    main()

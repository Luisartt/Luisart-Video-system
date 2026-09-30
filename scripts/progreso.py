"""Track the guided run (skill lizard-init-skills). State lives in brand/progress.json and brand/PROGRESS.md.

Usage
  python scripts/progreso.py --init                 create the files with every step pending
  python scripts/progreso.py --autodetect           mark steps done when their proof files exist
  python scripts/progreso.py --next                 print the next pending step (required first, then optional)
  python scripts/progreso.py --list                 print every step with its status
  python scripts/progreso.py --done S04 [--note "create path, tokens v1"]
  python scripts/progreso.py --skip S12 [--note "later"]
  python scripts/progreso.py --reset S05
Statuses: pending, done, skipped. The order comes from .claude/skills/lizard-init-skills/steps.json.
"""
import argparse
import datetime
import glob
import json
import os
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
STEPS = os.path.join(ROOT, ".claude", "skills", "lizard-init-skills", "steps.json")
STATE = os.path.join(ROOT, "brand", "progress.json")
MD = os.path.join(ROOT, "brand", "PROGRESS.md")


def steps():
    return json.load(open(STEPS, encoding="utf-8"))["steps"]


def load():
    if not os.path.exists(STATE):
        return {}
    return json.load(open(STATE, encoding="utf-8"))


def save(st):
    os.makedirs(os.path.dirname(STATE), exist_ok=True)
    json.dump(st, open(STATE, "w", encoding="utf-8"), indent=2, ensure_ascii=False)
    lines = ["# Progress", "", "Kept by `scripts/progreso.py` (skill `lizard-init-skills`). `[x]` done · `[~]` skipped · `[ ]` pending.", ""]
    phase = None
    for s in steps():
        if s["phase"] != phase:
            phase = s["phase"]
            lines += ["", f"## {phase}"]
        e = st.get(s["id"], {})
        mark = {"done": "x", "skipped": "~"}.get(e.get("status"), " ")
        note = f" — {e['note']}" if e.get("note") else ""
        when = f" ({e['date']})" if e.get("date") else ""
        opt = " _(optional)_" if s["mode"] == "optional" else ""
        lines.append(f"- [{mark}] {s['id']} `{'` / `'.join(s['skills'])}` — {s['title']}{opt}{when}{note}")
    open(MD, "w", encoding="utf-8", newline="\n").write("\n".join(lines) + "\n")


def channel():
    try:
        return json.load(open(os.path.join(ROOT, "brand", "paths.json"), encoding="utf-8"))["channel"]
    except Exception:  # noqa: BLE001
        try:
            b = json.load(open(os.path.join(ROOT, "brand", "brand.json"), encoding="utf-8"))
            return b.get("slug") or b.get("active_channel") or "my-channel"
        except Exception:  # noqa: BLE001
            return "my-channel"


def vault():
    try:
        return json.load(open(os.path.join(ROOT, "brand", "paths.json"), encoding="utf-8"))["vault"]
    except Exception:  # noqa: BLE001
        return None


def proven(step):
    proofs = step.get("done_when") or []
    if not proofs:
        return False
    for p in proofs:
        if p.startswith("@vault/"):
            v = vault()
            path = os.path.join(v, p[7:]) if v else None
            ok = bool(path) and os.path.exists(path)
        else:
            ok = bool(glob.glob(os.path.join(ROOT, p.replace("{channel}", channel()))))
        if not ok:
            return False
    return True


def status(st, s):
    return st.get(s["id"], {}).get("status", "pending")


def main():
    sys.stdout.reconfigure(encoding="utf-8")
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--init", action="store_true")
    ap.add_argument("--autodetect", action="store_true")
    ap.add_argument("--next", action="store_true")
    ap.add_argument("--list", action="store_true")
    ap.add_argument("--done")
    ap.add_argument("--skip")
    ap.add_argument("--reset")
    ap.add_argument("--note", default="")
    a = ap.parse_args()
    st = load()
    ids = {s["id"]: s for s in steps()}
    today = datetime.date.today().isoformat()

    if a.init:
        if not st:
            save({})
            print("created brand/progress.json and brand/PROGRESS.md")
        else:
            print("already exists (use --reset ID to redo a step)")
        return
    for flag, stat in ((a.done, "done"), (a.skip, "skipped")):
        if flag:
            if flag not in ids:
                sys.exit(f"unknown step {flag}")
            st[flag] = {"status": stat, "date": today, "note": a.note}
            save(st)
            print(f"{flag} -> {stat}")
    if a.reset:
        st.pop(a.reset, None)
        save(st)
        print(f"{a.reset} -> pending")
    if a.autodetect:
        changed = []
        for s in steps():
            if status(st, s) == "pending" and proven(s):
                st[s["id"]] = {"status": "done", "date": today, "note": "detected from files"}
                changed.append(s["id"])
        save(st)
        print("auto-detected done:", ", ".join(changed) or "none")
    if a.list:
        for s in steps():
            print(f"{s['id']}  {status(st, s):8s} {s['mode']:9s} {'/'.join(s['skills']):48s} {s['title']}")
    if a.next:
        # the order is the order of steps.json; optional steps are offered in place and the user may skip them
        nxt = next((s for s in steps() if status(st, s) == "pending"), None)
        if not nxt:
            print("ALL DONE")
        else:
            print(json.dumps(nxt, ensure_ascii=False))


if __name__ == "__main__":
    main()

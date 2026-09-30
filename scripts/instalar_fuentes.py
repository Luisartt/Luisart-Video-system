"""Install the outside skills and reference repos this system was built from (third-party/sources.json).

Usage
  python scripts/instalar_fuentes.py --list                     show every source, its group and status
  python scripts/instalar_fuentes.py --install                  install the groups core + design (recommended)
  python scripts/instalar_fuentes.py --install --group core     only one or more groups (comma separated: core,design,optional)
  python scripts/instalar_fuentes.py --install --only agent-reach,impeccable
  python scripts/instalar_fuentes.py --update                   update what is installed (skills update + git pull)
  python scripts/instalar_fuentes.py --check                    verify the installed files exist (exit 1 if something is missing)
  Add --dry-run to print the commands without running them; --root <dir> to install somewhere else (tests).

Skills are installed project-level (.claude/skills/<name>) with `npx skills add <repo> -a claude-code -y --copy`; the tool
records versions in skills-lock.json. Reference repos are shallow-cloned into tools/ (git-ignored). Needs Node/npx and git.
Works the same on Windows, macOS and Linux. Read each source's licence (docs/FUENTES.md) before redistributing anything.
"""
import argparse
import json
import os
import re
import shutil
import subprocess
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
DEFAULT_ROOT = os.path.dirname(HERE)


def load(root):
    p = os.path.join(DEFAULT_ROOT, "third-party", "sources.json")
    return json.load(open(p, encoding="utf-8"))


def skill_dirs(src):
    return [] if src["skills"] == ["*"] else src["skills"]


def installed(root, src):
    if src["kind"] == "repo":
        return os.path.exists(os.path.join(root, src["proof"]))
    names = skill_dirs(src)
    if not names:  # "*": any of the repo's skills present is enough; use the lock file
        lock = os.path.join(root, "skills-lock.json")
        if not os.path.exists(lock):
            return False
        data = json.load(open(lock, encoding="utf-8")).get("skills", {})
        return any(v.get("source") == src["repo"] for v in data.values())
    return all(os.path.exists(os.path.join(root, ".claude", "skills", n, "SKILL.md")) for n in names)


ANSI = re.compile(r"\x1b\[[0-9;?]*[A-Za-z]")


def run(cmd, cwd, dry):
    """Run a command, hide the progress bars, and show only the useful lines (or the tail if it fails)."""
    print("  $", " ".join(cmd))
    if dry:
        return 0
    r = subprocess.run(cmd, cwd=cwd, capture_output=True, text=True, encoding="utf-8", errors="replace")
    text = ((r.stdout or "") + "\n" + (r.stderr or "")).replace("\r", "\n")
    lines = [ANSI.sub("", l).strip() for l in text.splitlines()]
    lines = [l for l in lines if l]
    shown = [l for l in lines if "✓" in l or "Cloning into" in l or "rror" in l or "fatal" in l]
    for l in (shown if r.returncode == 0 else lines[-15:]):
        print("   ", l[:160])
    return r.returncode


def install_one(root, src, dry, update=False):
    if src["kind"] == "repo":
        target = os.path.join(root, src["target"])
        git = shutil.which("git")
        if not git:
            print("  git not found"); return 1
        if os.path.exists(os.path.join(target, ".git")):
            return run([git, "-C", target, "pull", "--ff-only"], root, dry) if update else 0
        os.makedirs(os.path.dirname(target), exist_ok=True)
        return run([git, "clone", "--depth", "1", "https://github.com/" + src["repo"] + ".git", target], root, dry)
    npx = shutil.which("npx")
    if not npx:
        print("  npx not found (install Node.js first: see docs/INSTALACION.md)"); return 1
    cmd = [npx, "--yes", "skills", "update" if update else "add"]
    if update:
        return run(cmd + ["-p", "-y"] + skill_dirs(src), root, dry)
    cmd += [src["repo"], "-a", "claude-code", "-y", "--copy", "-s"] + (skill_dirs(src) or ["*"])
    return run(cmd, root, dry)


def main():
    sys.stdout.reconfigure(encoding="utf-8")
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    for f in ("--list", "--install", "--update", "--check", "--dry-run"):
        ap.add_argument(f, action="store_true")
    ap.add_argument("--group", default="core,design")
    ap.add_argument("--only")
    ap.add_argument("--root", default=DEFAULT_ROOT)
    a = ap.parse_args()
    root = os.path.abspath(a.root)
    data = load(root)
    srcs = data["sources"]
    if a.only:
        want = set(a.only.split(","))
        srcs = [s for s in srcs if s["id"] in want]
    elif a.install or a.update or a.check:
        groups = set(a.group.split(","))
        srcs = [s for s in srcs if s["group"] in groups]

    if a.list or not (a.install or a.update or a.check):
        for s in data["sources"]:
            print(f"{'[x]' if installed(root, s) else '[ ]'} {s['id']:18s} {s['group']:9s} {s['kind']:6s} {s['license'][:28]:28s} {s['url']}")
        return
    bad = 0
    for s in srcs:
        if a.check:
            ok = installed(root, s)
            bad += not ok
            print(f"{'OK     ' if ok else 'MISSING'} {s['id']}")
            continue
        print(f"== {s['name']} ({s['repo']})")
        if a.install and installed(root, s) and not a.update:
            print("  already installed")
            continue
        rc = install_one(root, s, a.dry_run, update=a.update)
        ok = a.dry_run or installed(root, s)
        bad += 0 if (rc == 0 and ok) else 1
        print("  ->", "ok" if (rc == 0 and ok) else f"FAILED (exit {rc}); see the skill os-fallbacks")
    if a.check:
        sys.exit(1 if bad else 0)
    if a.install or a.update:
        print("\nDone." if not bad else f"\n{bad} source(s) failed.")
        sys.exit(1 if bad else 0)


if __name__ == "__main__":
    main()

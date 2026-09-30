"""Create and manage the paths this system uses (brand/paths.json).

The skills never hard-code a folder: they use placeholders such as {PROJECT} or {VAULT}. This script
creates the folders, writes brand/paths.json, and can print any skill with its placeholders resolved.
Edit brand/paths.json at any time to move things, then run --check.

Usage
  python scripts/configurar_rutas.py --create [--channel my-brand] [--vault "D:/MyVault"] [--cloud "G:/My Drive/MyBrand"]
  python scripts/configurar_rutas.py --show
  python scripts/configurar_rutas.py --check
  python scripts/configurar_rutas.py --resolve .claude/skills/luisart-editar-short/SKILL.md

--create makes: channels/<channel>/ (copy of channels/_template), out|media|archive|recordings/<channel>/,
the vault (copy of vault-template/ if the folder is empty or missing) and writes paths.json.
It never overwrites anything that already exists.
"""
import argparse
import json
import os
import re
import shutil
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CFG = os.path.join(ROOT, "brand", "paths.json")
BRAND = os.path.join(ROOT, "brand", "brand.json")


def slugify(s):
    s = re.sub(r"[^a-z0-9]+", "-", s.lower()).strip("-")
    return s or "my-channel"


def norm(p):
    return os.path.abspath(os.path.expanduser(p)).replace("\\", "/") if p else ""


def default_channel():
    try:
        b = json.load(open(BRAND, encoding="utf-8"))
        return slugify(b.get("slug") or b.get("active_channel") or b.get("brand_name") or "")
    except Exception:  # noqa: BLE001
        return "my-channel"


def load():
    if not os.path.exists(CFG):
        sys.exit("brand/paths.json does not exist yet: run  python scripts/configurar_rutas.py --create")
    return json.load(open(CFG, encoding="utf-8"))


def resolved(cfg):
    project = norm(cfg["project"])
    vault = norm(cfg["vault"])
    content_dir = f"{vault}/{cfg['content_dir']}"
    knowledge_dir = f"{vault}/{cfg['knowledge_dir']}"
    return {
        "PROJECT": project,
        "CHANNEL": cfg["channel"],
        "CHANNEL_DIR": f"{project}/channels/{cfg['channel']}",
        "VAULT": vault,
        "CONTENT_DIR": content_dir,
        "CONTENT_INBOX": f"{content_dir}/{cfg['content_inbox']}",
        "KNOWLEDGE_DIR": knowledge_dir,
        "KNOWLEDGE_INBOX": f"{knowledge_dir}/{cfg['knowledge_inbox']}",
        "CLOUD": norm(cfg["cloud"]) if cfg.get("cloud") else "<cloud folder: not set in brand/paths.json>",
        "PYTHON": project + ("/.venv/Scripts/python.exe" if os.name == "nt" else "/.venv/bin/python"),  # the project venv (Windows / macOS / Linux)
    }


def copy_tree(src, dst):
    if os.path.exists(dst) and os.listdir(dst):
        print(f"  exists, left untouched: {dst}")
        return False
    shutil.copytree(src, dst, dirs_exist_ok=True, ignore=shutil.ignore_patterns("__pycache__", "node_modules"))
    print(f"  created: {dst}")
    return True


def create(a):
    cfg = {
        "project": norm(ROOT),
        "channel": slugify(a.channel) if a.channel else default_channel(),
        "vault": norm(a.vault) if a.vault else norm(os.path.join("~", "Documents", "MyVault")),
        "content_dir": "Content",
        "content_inbox": "rawcc",
        "knowledge_dir": "Knowledge-Sources",
        "knowledge_inbox": "rawc",
        "cloud": norm(a.cloud) if a.cloud else "",
    }
    if os.path.exists(CFG) and not a.force:
        old = json.load(open(CFG, encoding="utf-8"))
        cfg.update({k: v for k, v in old.items() if k in cfg and not getattr(a, k, None)})
        print("brand/paths.json exists: keeping its values (use --force to rewrite).")
    os.makedirs(os.path.dirname(CFG), exist_ok=True)
    json.dump(cfg, open(CFG, "w", encoding="utf-8"), indent=2)
    print("wrote", CFG)
    r = resolved(cfg)
    print("Creating folders (nothing is overwritten):")
    copy_tree(os.path.join(ROOT, "channels", "_template"), r["CHANNEL_DIR"])
    for base in ("out", "media", "archive", "recordings"):
        d = f"{r['PROJECT']}/{base}/{cfg['channel']}"
        os.makedirs(d, exist_ok=True)
        print("  ok:", d)
    copy_tree(os.path.join(ROOT, "vault-template"), r["VAULT"])
    print("\nNote: the copied channel still registers compositions with 'TPL-' ids; register it in core/Root.tsx "
          "only after renaming them (the graphics skill does this with you).")
    show(cfg)


def show(cfg=None):
    cfg = cfg or load()
    print("\nPlaceholders used by the skills:")
    for k, v in resolved(cfg).items():
        print(f"  {'{' + k + '}':<18} -> {v}")


def check():
    cfg = load()
    bad = 0
    for k, v in resolved(cfg).items():
        if k in ("CHANNEL",):
            continue
        if k == "PYTHON" and not os.path.exists(v):
            print(f"NOT YET  {{{k}}} {v}  (created by the project install step)")
            continue
        ok = os.path.exists(v) if not v.startswith("<") else None
        state = "OK   " if ok else ("NOT SET" if ok is None else "MISSING")
        bad += ok is False
        print(f"{state:8s} {{{k}}} {v}")
    sys.exit(1 if bad else 0)


def resolve(path):
    cfg = load()
    text = open(path, encoding="utf-8").read()
    text = re.sub(r"\n> \*\*Paths\.\*\*.*?(?=\n\n)", "", text, flags=re.S)  # drop the legend block
    for k, v in resolved(cfg).items():
        text = text.replace("{" + k + "}", v)
    sys.stdout.reconfigure(encoding="utf-8")
    print(text)


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--create", action="store_true")
    ap.add_argument("--show", action="store_true")
    ap.add_argument("--check", action="store_true")
    ap.add_argument("--resolve")
    ap.add_argument("--channel")
    ap.add_argument("--vault")
    ap.add_argument("--cloud")
    ap.add_argument("--force", action="store_true")
    a = ap.parse_args()
    sys.stdout.reconfigure(encoding="utf-8")
    if a.create:
        create(a)
    elif a.check:
        check()
    elif a.resolve:
        resolve(a.resolve)
    elif a.show:
        show()
    else:
        ap.print_help()


if __name__ == "__main__":
    main()

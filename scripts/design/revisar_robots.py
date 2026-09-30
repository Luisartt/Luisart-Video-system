"""Check whether a site lets AI agents read it, BEFORE you browse it for references.

Usage:  python scripts/design/revisar_robots.py godly.design www.behance.net ...

For each domain it downloads /robots.txt and reports:
  - ALLOWED   : no rule blocks AI crawlers (or none are named) and the root is not disallowed
  - PARTIAL   : some paths are disallowed for AI crawlers (read the list before you fetch)
  - BLOCKED   : AI crawlers are disallowed from "/" -> do NOT fetch it with tools; give the link to
                the user and let THEM look (or ask them to paste what they liked)
  - UNKNOWN   : robots.txt could not be read (403 / timeout) -> treat as human-only
This is etiquette and the site's stated wish, not a legal opinion. Re-check: policies change.
"""
import re
import sys
import urllib.request

AI = re.compile(r"gptbot|claudebot|claude-web|anthropic|ccbot|google-extended|perplexitybot|chatgpt-user|oai-searchbot|bytespider|amazonbot|meta-externalagent", re.I)


def groups(text):
    gs, cur = [], None
    for line in text.splitlines():
        line = line.split("#")[0].strip()
        if not line or ":" not in line:
            continue
        k, _, v = line.partition(":")
        k, v = k.lower().strip(), v.strip()
        if k == "user-agent":
            if cur is None or cur["rules"]:
                cur = {"uas": [], "rules": []}
                gs.append(cur)
            cur["uas"].append(v)
        elif cur is not None and k in ("disallow", "allow"):
            cur["rules"].append((k, v))
    return gs


def verdict(domain):
    try:
        req = urllib.request.Request(f"https://{domain}/robots.txt", headers={"User-Agent": "Mozilla/5.0 (robots check)"})
        text = urllib.request.urlopen(req, timeout=15).read().decode("utf-8", "replace")
    except Exception as e:  # noqa: BLE001
        return "UNKNOWN", f"robots.txt not readable ({e.__class__.__name__})"
    blocked, partial = [], []
    star_root = False
    for g in groups(text):
        dis = [v for k, v in g["rules"] if k == "disallow" and v]
        ais = [u for u in g["uas"] if AI.search(u)]
        if "*" in g["uas"] and "/" in dis:
            star_root = True
        if ais and "/" in dis:
            blocked += ais
        elif ais and dis:
            partial.append(f"{ais[0]}: {dis[:3]}")
    if star_root:
        return "BLOCKED", "all robots disallowed from /"
    if blocked:
        return "BLOCKED", "AI crawlers disallowed: " + ", ".join(sorted(set(blocked))[:4])
    if partial:
        return "PARTIAL", "; ".join(partial[:2])
    return "ALLOWED", "no rule against AI agents"


def main():
    sys.stdout.reconfigure(encoding="utf-8")
    if len(sys.argv) < 2:
        sys.exit(__doc__)
    for d in sys.argv[1:]:
        d = re.sub(r"^https?://", "", d).split("/")[0]
        v, why = verdict(d)
        print(f"{v:8s} {d:28s} {why}")


if __name__ == "__main__":
    main()

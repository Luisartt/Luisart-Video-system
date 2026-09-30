---
name: install-third-party-skills
description: Install the outside skills and reference repositories this system was built from — Agent Reach (internet research), the Remotion skills, Playwright CLI, the design skills (taste, redesign, brutalist, brandkit, output enforcement, Impeccable) and the awesome-design-md collection — so the assistant can repeat the same process. Use right after the computer setup, when the user says "instala las skills", "instala Agent Reach", "trae todo lo de los repos", "install the third-party skills", or when a skill mentions agent-reach / impeccable / playwright-cli / remotion-best-practices and it is not installed.
---

# Install the third-party skills and sources

This system stands on other people's open work. `third-party/sources.json` lists every source with its repository, licence and
what it is used for; `docs/FUENTES.md` explains what we took from each. **The skills are installed at setup time, not copied into
this repository** (they keep their own licences and update upstream); `skills-lock.json` records the versions.

The user is not expected to run anything: you do it.

## Steps
1. **Check what is there:** `python scripts/instalar_fuentes.py --list` (python3 on a Mac if needed). `[x]` = installed.
2. **Install** (needs Node/`npx` and git from the computer setup):
   - Recommended (core + design): `python scripts/instalar_fuentes.py --install`
   - Only some groups or sources: `--group core` · `--group design` · `--group optional` (3D) · `--only agent-reach,impeccable`
   - Preview without changes: `--dry-run`. Keep them fresh later with `--update`.
   Each skill lands in `.claude/skills/<name>/` (project level). Reference repos land in `tools/` (git-ignored).
3. **Verify:** `python scripts/instalar_fuentes.py --check` → all `OK`. If one fails, use the skill `os-fallbacks` (typical causes:
   no network, `npx` missing, an old Node); as a last resort install it by hand with
   `npx skills add <repo> -a claude-code -y --copy -s <skill>` (the repo and names are in `sources.json`).
4. **Tell the user** what was installed (names and what each is for, in their language) and that **new skills are available from the
   next session** (Claude Code loads `.claude/skills/` at start): ask them to restart the session if a skill does not appear.

## What you get
| Source | Skills | Used by this system for |
|---|---|---|
| Agent Reach (`Panniantong/Agent-Reach`) | `agent-reach` | reading the public internet: references, research, reels, posts |
| Remotion skills (`remotion-dev/skills`) | `remotion-best-practices` + 10 more | building video in Remotion correctly |
| Playwright CLI (`microsoft/playwright-cli`) | `playwright-cli` | checking designs in a real browser |
| Taste skills (`leonxlnx/taste-skill`) | `design-taste-frontend`, `redesign-existing-projects`, `industrial-brutalist-ui`, `brandkit`, `full-output-enforcement` | design direction and complete outputs |
| Impeccable (`pbakaus/impeccable`) | `impeccable` | design critique and audit |
| awesome-design-md (`voltagent/awesome-design-md`) | (repo in `tools/design-repos/`) | DESIGN.md examples of well-known brands |
| img2threejs (optional) | `img2threejs` | 3D from an image |

Several upstream names changed over time (for example `brutalist-skill` → `industrial-brutalist-ui`); the manifest uses the current
ones and records the old ones in `formerly`.

## Agent Reach: how to use it here
- It is the **first choice** for reading public platforms in `design-references-research` and `luisart-procesar-referencias`.
  Run `agent-reach doctor --json` to see which channel works right now.
- Its command-line tool installs itself on first use. Its default mode is a **read-only check**; only run its `--system` install after
  the user explicitly approves system changes, never with `sudo` unless they approve.
- **Use the channels that need no login.** Channels that need cookies or a login (for example X or Instagram profiles) only if the
  user sets them up themselves and says so; never take or import cookies on their behalf, never log in for them.
- It only reads: posting, commenting or liking is out of scope for this system.

## Rules
- Installing third-party skills means running their instructions with the assistant's permissions: say so once, install only what is
  in `sources.json`, and never add a source the user did not ask for.
- Do not commit the installed copies (they are git-ignored); commit only `skills-lock.json` if the user wants the versions pinned.
- Respect each licence (see `docs/FUENTES.md`): credit them and do not redistribute their files as your own.

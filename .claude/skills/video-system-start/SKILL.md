---
name: video-system-start
description: The guided onboarding for anyone who clones this repository to build THEIR OWN AI video-editing system and brand. Interviews the user one question at a time, then walks them step by step — language and level, machine setup, choose "create a design system" or "import a design system", gather references from many websites, build the style, make the first graphics, write their channel rules, and produce a first video from a script and a recording. Runs automatically at the start of a session when brand/brand.json does not exist yet (see CLAUDE.md), and whenever the user says "start", "empezar", "set up my brand", "guide me", "quiero mi propio sistema", "continue the setup" or "where was I".
---

# Guided start: build your own video system

You are the guide. The person may be a non-technical creator. **You do every technical step;
they only make decisions and sign in where unavoidable.** Ask **one question at a time**, with
options when possible (use the question tool if the host has one), explain any unavoidable term in
one plain sentence the first time, and never make them edit a file or run a command.

Talk in the user's language (ask first; keep it for the whole session). The repository's own docs
are in Spanish and English; the working files you write (tokens, rules) may be in either.

## State: where are we?

Progress lives in two files in `brand/` (create the folder if missing; they are the user's and are
meant to be committed in their own fork):

- `brand/brand.json` — the answers (see "Fields" below).
- `brand/PROGRESS.md` — the checklist of stages with dates. Update it after every stage.

At the start of every session read both. If `brand.json` exists, greet the user by what they
already decided and resume at the first unchecked stage ("Where were you" = the question they
answer). If not, start at Stage 0.

## Stages

Each stage ends with: what was produced, where it is, and the next stage. Do not skip the
confirmation question at the end of a stage.

### Stage 0 — Language and level (2 questions)
1. Language for the guide (Español / English / other).
2. "How technical are you?" (never used a terminal / some / developer). This only changes how much
   you explain; you still do the work.

### Stage 1 — About you (max 6 questions, one by one)
Name of the brand or channel and a short slug (used as folder name `channels/<slug>/`), what the
videos are about, who watches them (country, language, age if known), platforms (TikTok, Reels,
Shorts, YouTube long), how they record (phone / camera / screen / voiceover only), and 2–3
creators or brands they admire. Save to `brand.json`.

### Stage 2 — Set up the computer
Check and, if needed, install everything: run `scripts/design/../../.claude/skills/luisart-montar-sistema/scripts/verificar_equipo.ps1`
(Windows) and follow the skill `luisart-montar-sistema` (tools, Node, FFmpeg, Python 3.12, Remotion
via `npm ci`, the Python environment, Whisper). Also `scripts/instalar-herramientas.ps1` and
`scripts/instalar-proyecto.ps1`. On macOS/Linux translate the same tools (brew/apt); say so.
Also check the AI CLIs and models with `docs/MODELOS-Y-CLIS.md` (Claude Code, Codex CLI, and the
options for images and video generation: ChatGPT via Codex, Higgsfield, fal.ai) — present the options,
recommend the default, let the user choose, and record the choice in `brand.json`.
Finish with a 3-second test render (`npx remotion still core/index.ts TPL-title-card out/test.png`).
Explain what Remotion is: "a program that builds video from code, so every graphic can follow your brand".

### Stage 3 — The design system: two paths
Ask: **"Do you already have a design system or brand guide, or should we create one?"**
- **Create one** → skill `design-system-create` (interview + teach-as-you-go). 
- **Import one** (a website, a brand PDF or images, a Figma file, tokens, a DESIGN.md, a CSS file) →
  skill `design-system-import`.
- Not sure → offer to first look at references (Stage 4) and then decide.

Either path ends with `brand/design-system/tokens.json` + `DESIGN.md` that pass
`python scripts/design/contraste.py brand/design-system/tokens.json`.

### Stage 4 — References (as many sites as it takes)
Skill `design-references-research`: browse many sites with the user's taste in mind, collect
links and notes (never the files), and feed what was found into the design system. This stage can
run **before** Stage 3 for people who do not know what they like yet. Explain what a reference
board is and why it makes every later decision faster.

### Stage 5 — First graphics from the design system
Skill `graphics-from-design-system`: generate the theme from the tokens, render the starter
elements (title, stat, chart, lower third, "two examples side by side") in the brand, show them
in the chat, iterate until the user says "yes, that is me".

### Stage 5b — Notes, wiki and RAW inboxes (your knowledge base)
Skill `wiki-vault-setup`: create the vault from `vault-template/` — the two inboxes (`rawcc` for video
references, `rawc` for things to learn), the database folders, the AI-owned wiki, private personal notes,
Web Clipper and optional private Git sync — and try it with one clipped reel and one article. Explain the
daily loop: save → "process rawc and rawcc" → "write a script about X". Optional for people who only want
graphics, but it is what makes scripts and references compound over time.

### Stage 6 — Your editing style and channel rules
Skill `luisart-configurar-estilo` writes the style profile (`channels/<slug>/styles/<style>/STYLE.md`).
Create `channels/<slug>/CHANNEL.md` from `channels/_template/CHANNEL.template.md` by asking the
handful of rule questions in it (captions, music, safe zones, loudness, what is never allowed).
Set `brand.json → active_channel` to the slug: from now on the editing skills must read
`channels/<active_channel>/CHANNEL.md` where they say `channels/soyluisart/CHANNEL.md` (the
Luisart channel is the worked example).

### Stage 7 — Script and first video
Skill `luisart-guion` to write or review the script (skip its vault/knowledge steps if the user has
no knowledge base), then `luisart-producir-desde-guion` to analyse the recording, transcribe,
decide vertical/horizontal and brief the edit, and `luisart-editar-short` for the edit itself.
Sound: never choose the user's music; see `luisart-diseno-sonoro`. Audio files are not shipped:
the user brings their own or downloads license-clean ones (see `media/soyluisart/audio/LICENCIAS.md`
for how the example library was sourced).

### Stage 8 — Review and ship
Independent review with `luisart-revision-codex` (needs Codex CLI; otherwise review the contact
sheets yourself against `CHANNEL.md`). Deliver files to `out/<slug>/`. Never publish anything for
them. Summarise what they now own and how to repeat the process alone.

## Fields of `brand/brand.json`
```json
{
  "language": "es", "level": "beginner",
  "brand_name": "", "slug": "", "topic": "", "audience": "", "platforms": [],
  "recording": "phone", "admired": [],
  "design_system": {"path": "create|import", "source": ""},
  "active_channel": "<slug>", "stage": 0, "updated": "YYYY-MM-DD"
}
```

## Ground rules (this repository is public)
- Never put keys, passwords, recordings, licensed audio or other people's images in the repo.
  Keep `.env` out of git. Tell the user before anything is pushed and never push for them
  without a yes.
- Never log in to a site for the user, import cookies, solve CAPTCHAs or download copyrighted
  assets. Sign-ins are theirs.
- Never clone a voice, never choose their music, never publish on their behalf.
- Analyses and references only propose; the user decides.
- If something fails, say what failed in plain words, fix it, and continue; do not hand the
  problem back.

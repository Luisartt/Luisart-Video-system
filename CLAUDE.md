# CLAUDE.md — Luisart Video System

This repository is a **public, clonable system** for building an AI-operated video-editing pipeline and
brand. Anyone can clone it, make their own brand and editing style, and produce videos with an AI
assistant. The `channels/soyluisart/` folder and the `luisart-*` skills are a **complete worked example**
(a real channel); the starter kit for your own brand is `channels/_template/`.

## First thing in every session

1. Read `brand/brand.json` and `brand/PROGRESS.md` if they exist.
2. **If the guided run has not started (no `brand/brand.json`), run the skill `lizard-init-skills` now**, before
   doing anything else, and greet the user in their language (ask it first). Do not wait for them to ask.
   It runs every other skill in a fixed order and tracks progress; if it is in progress, greet the user by what they
   already decided and offer to continue from the next step (`python scripts/progreso.py --next`).
3. A session hook (`.claude/settings.json` → `scripts/hook-inicio.mjs`) prints a one-paragraph status at
   session start; it only reads `brand/` and prints text.

## The guided path (skills)
`lizard-init-skills` (the conductor: runs all of these in order, `steps.json`) → `video-system-start` (intake) →
`luisart-montar-sistema` (computer setup) → `design-system-create` **or**
`design-system-import` → `design-references-research` (sites; guide in
`.claude/skills/design-references-research/references/sites.md`) → `graphics-from-design-system` →
`wiki-vault-setup` (notes, RAW inboxes, wiki) → `luisart-configurar-estilo` (style profile) →
`luisart-guion` → `luisart-producir-desde-guion` → `luisart-editar-short` → `luisart-revision-codex` →
`buffer-publishing-setup` (schedule the finished post; guide in `docs/BUFFER.md`).
Models and CLIs guide: `docs/MODELOS-Y-CLIS.md`. All tools: `TOOLS.md`.

## Paths are placeholders (configurable)
No skill hard-codes a folder. They use placeholders (`{PROJECT}`, `{CHANNEL}`, `{CHANNEL_DIR}`, `{VAULT}`,
`{CONTENT_DIR}`, `{CONTENT_INBOX}`, `{KNOWLEDGE_DIR}`, `{KNOWLEDGE_INBOX}`, `{CLOUD}`) whose values live in
`brand/paths.json`, created by `python scripts/configurar_rutas.py --create` (Stage 2 of the guide). Before
following any skill, read that file and resolve the placeholders (`--resolve <file>` prints a skill resolved).
The user can edit `paths.json` or any `SKILL.md` to fit their setup; `--check` verifies the folders exist.
- `channels/soyluisart/` is the **reference channel shipped as an example** (rules, four styles, animation
  library). The user's own channel is `{CHANNEL_DIR}` (created from `channels/_template`); create its `CHANNEL.md`
  from `channels/_template/CHANNEL.template.md`. Where a skill says "copy from the reference video/channel", copy
  from `channels/soyluisart/`.
- Brand values (colours, fonts, sizes, motion) come from `brand/design-system/tokens.json`, not from the example
  channel's theme.
- Anything in the example docs specific to its creator (music picks, his face/voice, paid programs, names) does
  **not** apply to the user.

## Hard rules (public repository)
- Never commit keys (`.env` is ignored), passwords, recordings, licensed audio, other people's images or
  frames, or a vault. Ask before any push; never force-push.
- Never log in for the user, import cookies, solve CAPTCHAs or download copyrighted assets. Respect each
  site's robots.txt (`scripts/design/revisar_robots.py`); if a site blocks AI agents, give the user the link.
- Never clone a voice or pick the user's music. **Publishing is always the user's decision:** schedule in Buffer only
  after they say the post is done (never "publish now"); never type, ask for or store a password or API key.
- The user is assumed **not technical**: you run every command; they decide and sign in. Report outcomes in
  plain words in their language.
- One heavy job (render, Whisper) at a time; renders go through the `*-locked.ts` scripts in `core/scripts/`.
- Precedence when documents disagree: active channel's `CHANNEL.md` > `luisart-reglas` (example) > other
  skills > `GUIDELINES.md` > `AGENTS.md`.

Full process reference for agents: `AGENTS.md` (written for the original channel; same pipeline).

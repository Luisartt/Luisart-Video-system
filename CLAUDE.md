# CLAUDE.md — Luisart Video System

This repository is a **public, clonable system** for building an AI-operated video-editing pipeline and
brand. Anyone can clone it, make their own brand and editing style, and produce videos with an AI
assistant. The `channels/soyluisart/` folder and the `luisart-*` skills are a **complete worked example**
(a real channel); the starter kit for your own brand is `channels/_template/`.

## First thing in every session

1. Read `brand/brand.json` and `brand/PROGRESS.md` if they exist.
2. **If `brand/brand.json` does not exist, run the skill `video-system-start` now**, before doing
   anything else, and greet the user in their language (ask it first). Do not wait for them to ask.
   If it exists, greet them by what they already decided and offer to resume at the first unchecked stage.
3. A session hook (`.claude/settings.json` → `scripts/hook-inicio.mjs`) prints a one-paragraph status at
   session start; it only reads `brand/` and prints text.

## The guided path (skills)
`video-system-start` (the guide) → `luisart-montar-sistema` (computer setup) → `design-system-create` **or**
`design-system-import` → `design-references-research` (sites; guide in
`.claude/skills/design-references-research/references/sites.md`) → `graphics-from-design-system` →
`wiki-vault-setup` (notes, RAW inboxes, wiki) → `luisart-configurar-estilo` (style profile) →
`luisart-guion` → `luisart-producir-desde-guion` → `luisart-editar-short` → `luisart-revision-codex`.
Models and CLIs guide: `docs/MODELOS-Y-CLIS.md`. All tools: `TOOLS.md`.

## Mapping the original names to the user's (important)
The example skills name the original creator's paths. When following them for someone else, substitute:
- `channels/soyluisart/CHANNEL.md` and `channels/soyluisart/…` → `channels/<brand.json.active_channel>/…`
  (create `CHANNEL.md` from `channels/_template/CHANNEL.template.md`; the soyluisart one stays as reference).
- `Finanzas/` → `brand.json.vault.knowledge_dir`; `Creacion de Contenido/` → `vault.content_dir`; the vault
  root (`…\Lartyk`) → `vault.path`; the project root (`…\tubeai-video`) → this repository's folder.
- Brand values (colours, fonts, sizes, motion) come from `brand/design-system/tokens.json`, not from the
  Luisart `piz` theme, which is only the example.
Anything in those skills that is specific to the original creator (music picks, his face/voice files,
paid programs) does **not** apply to the user.

## Hard rules (public repository)
- Never commit keys (`.env` is ignored), passwords, recordings, licensed audio, other people's images or
  frames, or a vault. Ask before any push; never force-push.
- Never log in for the user, import cookies, solve CAPTCHAs or download copyrighted assets. Respect each
  site's robots.txt (`scripts/design/revisar_robots.py`); if a site blocks AI agents, give the user the link.
- Never clone a voice, pick the user's music, or publish anything for them.
- The user is assumed **not technical**: you run every command; they decide and sign in. Report outcomes in
  plain words in their language.
- One heavy job (render, Whisper) at a time; renders go through the `*-locked.ts` scripts in `core/scripts/`.
- Precedence when documents disagree: active channel's `CHANNEL.md` > `luisart-reglas` (example) > other
  skills > `GUIDELINES.md` > `AGENTS.md`.

Full process reference for agents: `AGENTS.md` (written for the original channel; same pipeline).

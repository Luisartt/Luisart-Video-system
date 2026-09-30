# Luisart Video System

🇪🇸 [README en español](README.md)

**Clone it and build your own brand, your own editing style and your own videos with an AI that guides you
step by step.** You do not need to code: the AI does every technical step; you decide and sign in where
unavoidable.

This is the real system used to edit the **@soyluisart** channel (AI, finance and business in Spanish),
packaged so anyone can use it: Whisper transcription, cuts, [Remotion](https://www.remotion.dev)
animations that follow *your* design system, sound effects, face-aware captions, vertical and horizontal
versions, and independent review with Codex.

## Start (3 steps) — Windows and Mac
> Works on **Windows and macOS**. Step-by-step instructions for both: [`docs/INSTALACION.md`](docs/INSTALACION.md).
1. **Clone** and open the folder with [Claude Code](https://claude.com/claude-code):
   ```bash
   git clone https://github.com/Luisartt/Luisart-Video-system.git
   cd Luisart-Video-system
   claude
   ```
2. **The guide starts by itself:** a session hook plus `CLAUDE.md` make the AI run the master skill
   **`luisart-init-skills`** (or type `/luisart-init-skills`), which runs **every skill in order** and asks you one
   question at a time, in your language.
3. **Follow the stages.** Stop and resume any time: progress is kept in `brand/PROGRESS.md`.

## What the guide does with you
| Stage | What happens | Skill |
|---|---|---|
| 0–1 | language, level, who you are and what your videos are about | `video-system-start` (conducted by `luisart-init-skills`, steps S01–S17 in `steps.json`) |
| 2 | install and verify the computer (Remotion, FFmpeg, Python, Whisper, CLIs) | `luisart-montar-sistema` |
| 3 | **Design system: create one or import one** (website, CSS, tokens, DESIGN.md, PDF, Figma) | `design-system-create` / `design-system-import` |
| 4 | **References** from many sites, teaching you how to build a board (links and notes only) | `design-references-research` |
| 5 | **Graphics** in your brand: title, figure, chart, lower third, "two examples side by side" | `graphics-from-design-system` |
| 5b | **Your wiki:** notes, RAW inboxes (`rawcc` references, `rawc` learning), database filed by category | `wiki-vault-setup` |
| 6 | your editing style and channel rules | `luisart-configurar-estilo` |
| 7 | script + recording → analysis, transcript, vertical/horizontal, edit | `luisart-guion`, `luisart-producir-desde-guion`, `luisart-editar-short` |
| 7b | **Carousels** (4:5) and **stories** (9:16) in your brand, rendered from data | `carousel-create`, `story-create` |
| 8 | independent review, delivery and **scheduling in Buffer** (recommended) | `luisart-revision-codex`, `buffer-publishing-setup` |

## What is in the repository
| Path | Contents |
|---|---|
| `CLAUDE.md` | instructions for the AI: guided start, name mapping, hard rules |
| `.claude/skills/` | every skill (guide, design system, references, graphics, wiki, styles, editing, review…) |
| `channels/_template/` | **token-driven** starter graphics kit (your brand → `tokens.json` → theme → graphics) |
| `channels/soyluisart/` | a complete real-channel example: rules, 4 styles, animation library |
| `brand/` | **your** brand: `brand.json`, `PROGRESS.md`, `paths.json` (your folders, editable), `design-system/tokens.json`, `references/` |
| `vault-template/` | skeleton of your wiki: manual `CLAUDE.md`, inboxes, page templates, Web Clipper |
| `docs/VIDEOS-CON-O-SIN-REFERENCIAS.md` | **videos with reference videos (Route A) or from your design system alone (Route B)** |
| `channels/_template/social/` | carousel and story renderer (`render_social.cjs`) + examples |
| `.claude/skills/os-fallbacks/`, `scripts/diagnosticar.py` | **if something fails, the AI picks the alternative for your system (Windows / Mac / Linux)** |
| `docs/INSTALACION.md` | **step-by-step installation for Windows and Mac** |
| `docs/BUFFER.md`, `tools/buffer/` | Buffer recommendation and setup + scripts to schedule posts |
| `docs/MODELOS-Y-CLIS.md` | which models and CLIs to use (images, video, voice, review), with options |
| `scripts/` | installers (`.ps1` Windows · `.sh` Mac/Linux), design tools (contrast, token import, robots.txt check) |
| `core/` | Remotion root, locked renders, QA, matting and face tracking |
| `TOOLS.md` | every tool with versions and sources |

## Design tools (the AI runs them for you)
```bash
python scripts/design/importar_tokens.py --url https://your-site.com   # import colours and fonts
python scripts/design/contraste.py brand/design-system/tokens.json     # readable on a phone?
python scripts/design/generar_theme.py                                 # tokens -> Remotion theme
python scripts/design/revisar_robots.py godly.design ...               # does this site let an AI read it?
python scripts/configurar_rutas.py --create --channel my-brand         # creates folders and brand/paths.json
python scripts/progreso.py --list                                      # your progress in the guided run
npm run studio                                                         # preview the graphics
```

## Videos: with or without references
You can **send reference videos** (1–5, links or files + one line on what you liked) and the AI copies their principles, **or send none**
and work from your design system alone (imported or created from scratch). You can combine and switch any time:
[`docs/VIDEOS-CON-O-SIN-REFERENCIAS.md`](docs/VIDEOS-CON-O-SIN-REFERENCIAS.md).

## Carousels and stories
```bash
node channels/_template/social/render_social.cjs --deck channels/_template/social/example-carousel.json   # 7 slides 1080x1350
node channels/_template/social/render_social.cjs --deck channels/_template/social/example-story.json      # 4 stories 1080x1920
```
The AI does it for you with the skills `carousel-create` and `story-create`: it reads your tokens, respects the safe zones and leaves the post ready for Buffer.

## Important notes
- **Public repository:** never commit keys (`.env` is ignored), recordings, licensed audio, other people's
  images or your personal wiki (it lives in *its own private repository*).
- **Audio:** no music or sound effects are included (licences). `media/soyluisart/audio/LICENCIAS.md` explains
  how the example library was sourced with clean licences.
- **Remotion:** free for individuals and small teams; companies of more than 3 people need a licence
  (<https://www.remotion.pro/license>).
- **Licence:** [MIT](LICENSE). Use it, change it, share it. Third-party skills installed separately have their own licences (see `TOOLS.md`).
- **Session hook:** `.claude/settings.json` runs `scripts/hook-inicio.mjs`, which only reads `brand/` and prints
  text. Read it if you like: it is ~25 lines.
- The `luisart-*` skills and `AGENTS.md` come from the original channel; every folder in them is a placeholder you
  configure in `brand/paths.json` (see `CLAUDE.md`).

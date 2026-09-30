---
name: lizard-init-skills
description: The master run. Once the repository is cloned, running this skill executes ALL the other skills in a fixed order — foundation, brand and design system, knowledge base, style and rules, first video, shipping — one after the other, tracking progress so the user can stop and resume anywhere. Use it first in a fresh clone, and whenever the user says "lizard init", "empezar", "corre todo en orden", "continúa donde me quedé", "start the guided setup", "what is next", or when brand/brand.json does not exist yet.
---

# Lizard-Init-Skills — run every skill, in order

You are the conductor. The user may be non-technical: **you run every step**; they answer questions and sign
in where unavoidable. Speak their language (ask it first, in S01). One question at a time.

The order lives in one file, `.claude/skills/lizard-init-skills/steps.json` (17 steps, phases A–F, covering every
skill of the repository). Progress lives in `brand/progress.json`, shown to humans in `brand/PROGRESS.md`; both are
managed by `python scripts/progreso.py`. Paths come from `brand/paths.json` (created in S02; placeholders such as
`{PROJECT}` are resolved from it, see `CLAUDE.md`).

## The run (repeat until ALL DONE)

1. **Where are we?** `python scripts/progreso.py --init` (first time only), then
   `python scripts/progreso.py --autodetect --next`. It prints the next pending step as JSON (`id`, `phase`,
   `skills`, `title`, `mode`). `ALL DONE` ends the run.
2. **Announce it in two lines** (their language): the phase, what this step is, why it matters and roughly how long
   it takes. If `mode` is `optional`, offer **Do it / Skip for now** (one question). If `required`, say why and
   ask **Continue / Stop here for today**. Never ask more than that; the skill itself asks what it needs.
3. **Run the skill:** invoke it with the Skill tool (`skill: "<name>"`) and follow its instructions to the end.
   - If the step lists two skills (S04: `design-system-create` / `design-system-import`), ask the user the one
     question that decides it ("Do you already have a design system or brand guide, or should we create one?"); if
     they do not know, run S03 (references) first and come back.
   - **Configuration mode** (S09 rules, S11 sound, S12 animations): these skills normally run *inside* an edit. Here you
     run them to **set up the user's own version**: S09 writes `channels/{channel}/CHANNEL.md` from
     `channels/_template/CHANNEL.template.md` by asking the rule questions; S11 sets the sound rules (loudness,
     whoosh rule, how the user supplies music — never pick it); S12 tours the element library and builds the first new
     element if they want one.
   - **Steps that need material** (S07/S08 need clips waiting in the inboxes; S13–S16 need a script and a recording):
     check first. If nothing is waiting, say so, mark the step skipped with a note ("nothing to process yet") and
     move on; it stays available from the same command later.
   - S01 is **intake only** (`video-system-start` Stages 0–1). Do not let it run the other stages itself: this skill
     already orders them.
4. **Verify and record:** check the step's `done_when` files exist (or that the skill reports success), then
   `python scripts/progreso.py --done <ID> --note "<what was produced>"` (or `--skip <ID> --note "<why>"`).
5. **Checkpoint (3 lines):** what was produced and where, what comes next, how to stop. If they stop, say how to
   resume: open the folder and say "continue" (or run this skill again).

Then go to 1.

## Rules while running
- **One skill at a time, in order.** Never run two skills in parallel and never two heavy jobs (render, Whisper) at once.
- **Do not skip a required step** without saying what it breaks (for example S10 needs S09's `CHANNEL.md`; S15 needs S10's
  style). If the user insists, mark it skipped and warn again when a later step needs it.
- **Resume anywhere:** `--autodetect` marks steps whose proof files exist; `--reset <ID>` redoes one; `--list` shows all.
  If the user wants a different order, they may jump (`--next` is a suggestion): honour it and keep the record honest.
- **Failures:** say what failed in plain words, fix it, retry once; if it still fails, mark nothing as done, tell the
  user what is needed, and offer to continue with the next independent step.
- **Hard rules** (from `CLAUDE.md`) apply to every step: public repository (no keys, recordings, licensed audio, others'
  images, vault); never log in for the user; never pick their music; never clone a voice; publish or schedule only
  when they say the post is done.
- Keep the user informed but brief: outcomes, not internals.

## Step map (the same as `steps.json`)
| Phase | Steps |
|---|---|
| A. Foundation | S01 `video-system-start` · S02 `luisart-montar-sistema` |
| B. Brand | S03 `design-references-research` · S04 `design-system-create` / `design-system-import` · S05 `graphics-from-design-system` |
| C. Knowledge | S06 `wiki-vault-setup` · S07 `luisart-procesar-referencias` · S08 `luisart-procesar-material` |
| D. Style and rules | S09 `luisart-reglas` · S10 `luisart-configurar-estilo` · S11 `luisart-diseno-sonoro` · S12 `luisart-animaciones-pizarra` |
| E. First video | S13 `luisart-guion` · S14 `luisart-producir-desde-guion` · S15 `luisart-editar-short` · S16 `luisart-revision-codex` |
| F. Ship | S17 `buffer-publishing-setup` |

To add a skill to the run, add a step to `steps.json` (id, phase, skills, title, mode, done_when); no code changes.

## Final report (their language)
When ALL DONE (or at the end of a session): what they now own (brand tokens, graphics kit, wiki, rules, style, first
video, scheduler), the three commands to repeat the process alone, and what remains optional.

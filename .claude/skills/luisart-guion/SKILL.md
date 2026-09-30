---
name: luisart-guion
description: Write or review the script (guion) of a @soyluisart video on a given topic — reads the channel's script and diction playbook, templates and reference diction analyses in the vault's wiki/Content Creation/Scripts/, then searches the finance / business knowledge base (wiki/Knowledge/, read-only) for definitions, examples, numbers, nuances and common mistakes that can make the video better, proposes which ones to use, writes the script in Spanish with the channel rules (hook, beats, "dato de ejemplo · MXN", "Luisart" spelling) and records the knowledge pages used in the video's Sources Used.md. Use it whenever the user or the main chat wants a script — "hazme un guion de…", "escribe el guion", "revisa mi guion", "¿qué le agrego al guion?", "mejora este guion", "guion para un short sobre…", "¿cómo explico X en un video?" — and before recording a new @soyluisart video when no script exists yet.
---

> **Paths.** This skill uses placeholders, defined in `brand/paths.json` (created by
> `python scripts/configurar_rutas.py`; edit that file to change them, then tell your assistant):
> `{PROJECT}` repository root · `{CHANNEL}`/`{CHANNEL_DIR}` your channel slug and folder ·
> `{VAULT}` your knowledge vault · `{CONTENT_DIR}`/`{CONTENT_INBOX}` content database and its `rawcc` inbox ·
> `{KNOWLEDGE_DIR}`/`{KNOWLEDGE_INBOX}` knowledge database and its `rawc` inbox · `{CLOUD}` cloud-storage
> folder. Resolve them before running any command (`python scripts/configurar_rutas.py --resolve <file>`
> prints this file resolved). `channels/soyluisart/` is the **reference channel shipped as an example**:
> copy from it where this skill says to; your own channel lives in `{CHANNEL_DIR}`.

# Script for a @soyluisart video (write or review)

The user (Luisart) is not technical and writes in Spanish. His videos are in Spanish (Mexico):
**the script is written in Spanish**; the vault notes this skill writes are in English. Chat with
him in Spanish, plain words.

Vault root: `{VAULT}\` (`VAULT` below; manual
`VAULT\CLAUDE.md`). This is the one content task allowed to search `VAULT\wiki\Knowledge\` —
**read-only**: never create, edit, move or re-link a Knowledge page from here, and never read
`VAULT\{KNOWLEDGE_DIR}\` (the wiki already compiles it; if Knowledge lacks something, say so in
the report instead).

## 1 · Read the channel side first
- Skill `luisart-reglas` and `{CHANNEL_DIR}/CHANNEL.md` ★ (glossary, "Luisart" spelling,
  example-figure labels, MXN/US$, deliverables, the style options).
- `VAULT\wiki\Content Creation\Scripts\` — the script and diction playbook, the templates, and
  any finished scripts of earlier videos (reuse what worked).
- The diction analyses in `VAULT\wiki\Content Creation\References\Analyzed Videos\` (section
  "Script and Diction") and the creator pages in `References\Creators\` — hooks, beat structure,
  words per minute, sentence length, rhetorical devices.
- If the video already exists: `VAULT\wiki\Content Creation\Videos\<YYYY-MM-DD slug>\` and, in the
  repo, `channels/soyluisart/videos/<v>/BRIEF.md` (his earlier script vs what was said).
- Reviewing: his draft (pasted in chat or a file he names). Never overwrite his file; write the
  revised version next to it or in the chat.

## 2 · Search the knowledge base for the topic
Goal: definitions, examples, numbers, nuances and common mistakes that can complement the video.
- Start at `VAULT\wiki\Home.md` → `VAULT\wiki\Knowledge\Maps\` (the map for the topic's area) →
  the linked `Knowledge\Concepts\<category>\` and `Knowledge\Summaries\…` pages (and `Entities\`,
  `Diagrams\` when relevant).
- Also grep `VAULT\wiki\Knowledge\` for the topic in titles, `aliases:` (they include the old
  Spanish titles: search the Spanish terms too, e.g. "múltiplo precio utilidad", "P/U", "P/E")
  and body text. Read the 3–8 best pages in full.
- Collect, per page: the clean definition, one example he could say, any figure (with its source
  and date as the page states it), the nuance or trap that viewers get wrong, and a common mistake.

## 3 · Propose, then write
- First show him (Spanish, short) what the knowledge base adds: 3–6 bullets "Puedo agregar…"
  (definition / example / number / nuance / common mistake), each with the page it came from, and
  your recommendation of which to use. If the main chat asked for a finished script without
  questions, pick them yourself and say which in the report.
- Write the script in Spanish, for speaking, following the playbook and a template from
  `Scripts\`: hook in the first 1–3 s (question, contradiction, number, promise or story), one idea
  per beat, short sentences, direct "tú", one concrete example, a clear payoff, the CTA. Mark beats
  and, where useful, the on-screen idea for the edit (`[pizarra: …]`), without dictating the edit.
- Figures: every example number gets "dato de ejemplo · MXN" (or US$ for global prices) unless it
  is sourced; a real figure is used only with its source (Knowledge page + the primary source it
  cites) and stays checkable. Keep the arithmetic consistent (these numbers later go into
  `figures.ts`). Never euros; Mexican number format.
- Reviewing his draft: keep his voice and content; list the changes (hook, clarity, length,
  errors, a missing nuance from Knowledge) and give the revised script. Flag factual or number
  problems with options; never silently change a claim.

## 4 · Record what was used
- Save the finished script as `VAULT\wiki\Content Creation\Scripts\<YYYY-MM-DD slug> Script.md`
  (frontmatter per `VAULT\CLAUDE.md` → "Wiki conventions": `type: script`,
  `domain: [channel-editing]`, `aliases: [<Spanish title>]`, `sources: [...]` (plain paths, e.g.
  his draft), `tags: [...]`, `updated: <YYYY-MM-DD>`; English headings, the script body in
  Spanish; last section `## Key Takeaways`, 3–7 bullets) and link it from the video folder.
  Give him the script in the chat too.
- Write or update `VAULT\wiki\Content Creation\Videos\<YYYY-MM-DD slug>\Sources Used.md` (English):
  each Knowledge page used (`[[wikilink]]`), what was taken from it (definition / example / figure /
  nuance), and the primary source behind every real figure (`type: video` frontmatter as above,
  ending with `## Key Takeaways`). Create the video folder if needed.
- One `[content]` entry in `VAULT\wiki\Log.md` (append-only; format in the vault manual). Knowledge
  pages are linked from these notes, never edited.

## Don'ts
- Never write, edit or move anything in `wiki\Knowledge\`; never read `{KNOWLEDGE_DIR}\`.
- Never invent figures, quotes or sources; unsourced numbers are "dato de ejemplo".
- Never uppercase "Luisart". Never publish anything.
- This skill does not edit video: hand the script to the main chat / `luisart-editar-short`.

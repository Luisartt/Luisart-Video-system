---
name: luisart-procesar-referencias
description: Process the video references Luisart drops in the vault's "{CONTENT_DIR}" folder (one folder per reference with videos, links.txt, notes) or clips with Obsidian Web Clipper into "{CONTENT_INBOX}/" — each pending one is downloaded, transcribed, analysed for BOTH editing style and script/diction style, analysed frame by frame (layout, captions, text, animations, diagrams, images, pacing, hook/CTA, music, SFX timing, loudness), compared with the channel's styles, recreated as sample renders of the copyable elements, written up in English as a note in wiki/Content Creation/References/Analyzed Videos/, compiled into the creator articles (References/Creators/) and the script playbook (Scripts/), and the source filed in the best-fit category folder of "{CONTENT_DIR}/" (Creators, Editing Styles, Scripts and Diction, Sound and Music, Animation and Motion, Other). Reports to the user in Spanish. Use it ONLY when the user asks — "procesa rawcc", "procesa rawc y rawcc", "procesa las dos carpetas", "procesa lo pendiente", "procesa RAW", "procesa las referencias", "analiza mis referencias", "ya te mandé videos por el clipper", "revisa lo que guardé en el Web Clipper", "procesa este clip" — never on its own initiative. Also use it to re-process one reference or to answer "¿qué referencias tengo pendientes?".
---

> **Paths.** This skill uses placeholders, defined in `brand/paths.json` (created by
> `python scripts/configurar_rutas.py`; edit that file to change them, then tell your assistant):
> `{PROJECT}` repository root · `{CHANNEL}`/`{CHANNEL_DIR}` your channel slug and folder ·
> `{VAULT}` your knowledge vault · `{CONTENT_DIR}`/`{CONTENT_INBOX}` content database and its `rawcc` inbox ·
> `{KNOWLEDGE_DIR}`/`{KNOWLEDGE_INBOX}` knowledge database and its `rawc` inbox · `{CLOUD}` cloud-storage
> folder · `{PYTHON}` the project's Python (venv: `.venv/Scripts/python.exe` on Windows, `.venv/bin/python` on macOS/Linux). Resolve them before running any command (`python scripts/configurar_rutas.py --resolve <file>`
> prints this file resolved). `channels/soyluisart/` is the **reference channel shipped as an example**:
> copy from it where this skill says to; your own channel lives in `{CHANNEL_DIR}`.

# Process video references

Vault root: `{VAULT}\` (`VAULT` below; its
manual is `VAULT\CLAUDE.md` — read it first). The wiki is written in **English**; the user's own
words stay in Spanish (quoted, see step 4). Report to him in **Spanish**.

- Inbox (his, read-only for us except filing a processed item): `VAULT\{CONTENT_INBOX}\`
  — Web Clipper notes, one folder per reference (videos, `links.txt`, notes, written scripts),
  and loose files. The database it files into: `VAULT\{CONTENT_DIR}\`.
- Done: `VAULT\{CONTENT_DIR}\<Category>\<slug>\` (filed by category, never deleted; see
  step 4). `_Processed\` is only the fallback.
- Output (AI-owned): `VAULT\wiki\Content Creation\References\Analyzed Videos\` (one note per
  reference), `...\References\Creators\` (creator articles + `Creator Comparison.md`) and
  `...\Scripts\` (script and diction findings).
- This skill never reads or writes `VAULT\wiki\Knowledge\` or `VAULT\{KNOWLEDGE_DIR}\`, and never
  writes `{CONTENT_DIR}\Project Snapshots\`.
- History only: until 2026-09-28 the inboxes were the repo's root `RAW/` (now replaced by
  `{CONTENT_DIR}\`) and the old repo vault's `Referencias/`; that old vault is
  archived at `archive/{CHANNEL}/conocimiento-migrado-2026-09-28/`. Never write there.

The user's request to process **is** the approval for this run, including the wiki compile of these
references (tell him in the report what was written). Nothing is processed without that request.

Depth template for an analysis: `media/{CHANNEL}/automated-research/style-refs/kallaway/ANALISIS.md`
and `.../nick/ANALISIS.md` (lighter per single video; full depth when the user asks to replicate a
creator's style). Rules to compare against: skill `luisart-reglas` + `{CHANNEL_DIR}/CHANNEL.md` ★.

## 1 · Find pending references
- **Reference folders**: every subfolder of `{CONTENT_INBOX}\` except `_*`. Inside:
  video files, `links.txt` (one URL per line), optional notes (`notas.txt`/`.md`: what he liked,
  edición vs guion priority), screenshots, written scripts. Loose files directly in `rawcc\`
  (other than `README.md` and the template `.json`) → treat each as its own reference. Slug =
  folder name in kebab-case.
- **Web Clipper notes**: every `.md` in `{CONTENT_INBOX}\` (skip the template
  `.json` and any `README`/`_LEEME`) that is not processed: `status: pending`, a missing `status`
  (the plain Web Clipper default template saves `source`, `created`, `tags: [clippings]` and no
  `status`), or an older `estado: pendiente`. Read the address from `url` **or** `source` and his own
  sections ("Qué me gustó", "Qué quiero copiar") — those set the priorities of the analysis.
  Slug = note title in kebab-case.
- Skip an item already processed: its path (or its `filed` path) appears in the `sources:` of a wiki
  page — then it only needs filing (step 4).
- If the user named specific clips, process only those. Report the list (item, kind, proposed
  category) before starting. One request can cover both inboxes ("procesa rawc y rawcc"): run
  `luisart-procesar-material` for `{KNOWLEDGE_INBOX}\` too, one heavy GPU job at a time.

## 2 · Download (one at a time)
- **Social-network video links → Agent Reach first (automatic).** If the clip is or contains a video link from a social network (YouTube, TikTok, Instagram, X/Twitter, Reddit, Facebook, LinkedIn, Bilibili, Xiaohongshu, Xiaoyuzhou), launch the `agent-reach` skill before downloading, without asking: read title, author, caption/description, date, platform subtitles, top comments and thread text, and write them under `## Platform Context` in the note (facts only, with the URL). It complements Whisper, never replaces it (the transcript stays the source of what is said); do not use Agent Reach's `transcribe` or Groq/OpenAI. If yt-dlp fails, try Agent Reach's route for that platform to get the media; never log in or import cookies for Luisart: a channel that needs login is reported "needs login" and skipped.
- YouTube / TikTok / single Instagram reel: `yt-dlp -f "bv*[height<=720]+ba/b[height<=720]" -o
  "archive/{CHANNEL}/style-refs/<creador>/<fecha>-<slug>.%(ext)s" <url>` (in the repo, never in
  the vault).
- Instagram **profile** URLs don't work with yt-dlp: collect reel URLs with the built-in browser
  (never log in, decline cookies), then download single reels.
- If the download fails (private, removed, login wall), write the analysis note with
  `status: error` and a one-line reason in a `## Status` section, leave the reference where it is
  (don't move it) and move on.
- `<creador>`: the handle in kebab-case (`kallaway`, `nick-saraev`…). Reuse existing folders.

## 2b · Local files from a reference folder
Analyse his videos in place (read-only); they may stay in the raw folder and travel with it to
`_Processed\<slug>\` (the vault ignores videos in git). Don't re-encode or edit them. Copy one into
`archive/{CHANNEL}/style-refs/<creador>/` only if a tool needs a repo-relative path.

## 3 · Analyse
**Audio or video is always transcribed with Whisper** (never work from the title or description). The full procedure (audio with yt-dlp, `transcribe_parts.py --lang spanish|english|auto` under the render lock, `whisper_to_md.py` for the readable transcript) is in skill `luisart-procesar-material` §2; the transcript goes in the analysis note and in `_Processed/<slug>/transcript.md`. Written references (a blog post, an article whose voice he wants) are read directly and analysed for script and diction only; write them to `wiki/Content Creation/References/Analyzed Texts/`. Notes are written with the AI CLI that is available (Claude Code first; Codex or Gemini CLI as fallback) and verified against the transcript. Material meant for learning, not copying, belongs to `luisart-procesar-material`.
Outputs in the repo: `media/{CHANNEL}/automated-research/style-refs/<creador>/<fecha>-<slug>/`
(sheets, transcript); bulky frames in `archive/…`. Heavy frames never go into the vault. Heavy GPU
jobs one at a time under the render lock
(`npx tsx .claude/skills/luisart-editar-short/scripts/with_lock.ts -- <cmd>`).
- Scene cuts: `ffmpeg -i v.mp4 -vf "select='gt(scene,0.3)',showinfo" -f null -` → shot list, cuts/min.
- Contact sheet 1 frame/s (drawtext needs `fontfile='<a font file>' (Windows `C\:/Windows/Fonts/arial.ttf`, macOS `/System/Library/Fonts/Supplemental/Arial.ttf`)`), plus a strip
  of 10 consecutive frames on each distinctive animation (speed/easing).
- Transcript with word times: `{PYTHON} .claude/skills/luisart-editar-short/scripts/transcribe_parts.py`
  (see that skill for arguments) → align captions, text and SFX to words.
- Audio: `ffmpeg -af ebur128` (integrated LUFS voice/total), music present? level under voice,
  SFX events (onsets between words; spectrogram `showspectrumpic` if needed), whooshes yes/no.
- Look at the sheets yourself and describe: framing/background · layout mix · captions (font or free
  equivalent, size, colour, words per caption, position, highlight, boxes?) · titles/hook ·
  animations (entrances, speed in frames, easing) · diagrams · images/B-roll · pacing · hook first 3 s
  · CTA · music · SFX map (event → sound → offset) · voice processing.

### 3b · Script and diction (always — he values the guion as much as the edit)
From the word-timed transcript (full text goes into the note, in its original language):
- Hook: first sentence verbatim, type (question, contradiction, number, promise, story), seconds to the
  first payoff. Structure beats with timestamps (hook → problem → proof → twist → CTA).
- Delivery numbers: words per minute, average words per sentence, pause lengths (gaps > 0.3 s) and
  where they fall, filler words, emphasis (words he stresses: loudness/pitch jumps).
- Language: register/tone, person (tú/ustedes/yo), rhetorical devices (contrast, rule of three,
  open loops, direct questions, analogies, repetition), jargon level, retention phrases, CTA wording.
- Deliver a reusable **script template** (beats with sentence patterns; the patterns themselves in
  Spanish, since his videos are Spanish, adapted to finance/AI/business in MXN) plus one example
  rewrite of a Luisart topic using it (clearly marked as example).

### 3c · Renders (by default)
Recreate the 2–4 most copyable editing elements as Remotion demo clips in the fitting style pack
(or, if it justifies a new style, demo clips in a new `styles/<creador>/` pack that stays a
**proposal** — not a channel style option, not used in edits, until Luisart approves it), following
`luisart-animaciones-pizarra` conventions and the channel rules (ask nothing; clashing techniques get the adapted version). Render
with `core/scripts/render-batch-locked.ts` to `out/{CHANNEL}/referencias/<slug>/`, `npm run qa`,
contact sheet via `index_sheet.py`. Never use Luisart's face footage unless a recording is provided
for it; use the reference only for analysis, never re-publish its footage.

## 4 · Write it up (English note, for a non-technical creator)
Create `VAULT\wiki\Content Creation\References\Analyzed Videos\<YYYY-MM-DD> <Creator> - <Title>.md`
(English title; the Spanish/original title as an alias). Never edit his raw files:
- Frontmatter (field names from `VAULT\CLAUDE.md` → "Wiki conventions"): `type: reference`,
  `domain: [channel-editing]`, `aliases: [...]`,
  `sources: [...]` (plain paths: the resolved final destination
  `"{CONTENT_DIR}/<Category>/<dest>/"` — decide category and `<dest>` first: `<slug>`, or
  `<slug>-2` if that folder exists — for an `error` note, where the reference still is —
  `"{CONTENT_INBOX}/<folder or note>"`), `url` or `file`,
  `creator: "[[<Creator>]]"`, `status: analyzed` (or `error`), `analyzed: <YYYY-MM-DD>`,
  `tags: [...]`, `updated: <YYYY-MM-DD>`.
- `## His Notes` — his own text ("Qué me gustó", "Qué quiero copiar", notas) copied **untouched**
  (Spanish, as he wrote it), each quote followed by an English translation.
- `## Summary` (5–10 bullets) · `## Editing Analysis` (subsections of step 3, with timestamps) ·
  `## Script and Diction` (3b, with the transcript in a collapsed callout and the script template) ·
  `## What We Can Copy` (map each idea to Luisart / Luisart Split / Kallaway / new element; say if
  it justifies a new style pack) · `## Clashes With Channel Rules` (and the proposed adaptation) ·
  `## Renders` (full paths into `{PROJECT}/out/` + sheet) ·
  `## Files` (full repo paths of video, sheets, transcript — link by path; never copy videos or
  frame dumps into the vault) · `## Key Takeaways` (3–7 bullets, last section, as every Content
  Creation page).
- Then, **only for `status: analyzed`**, **file the source in the database by category**: move the
  reference unchanged into `VAULT\{CONTENT_DIR}\<Category>\<dest>\` (the path named in
  `sources`), with `<Category>` the best fit of `Creators` (one subfolder per creator, e.g.
  `Creators\Kallaway\<dest>\`), `Editing Styles`, `Scripts and Diction`, `Sound and Music`,
  `Animation and Motion`, `Other`; create the category folder if it does not exist. A reference
  folder moves as a whole (videos included); a Web Clipper note moves as-is (a plain move keeps his
  text). Then add to the clip note's frontmatter only `status: processed`, `processed: <date>`,
  `filed: "<final path>"` and `summary: "[[<analysis note>]]"`. If two categories fit, pick the
  better one and name the alternative in the report (links resolve by name, moving later is safe).
  `_Processed\` only if none fits. A `status: error` reference is not moved. Never delete.

## 5 · Compile into the wiki
Follow the conventions of `VAULT\CLAUDE.md`, with the analysis notes as sources:
- Create or update `VAULT\wiki\Content Creation\References\Creators\<Creator>.md` (new creator →
  also link it from `Creator Comparison.md` there and from `soyluisart Channel Home.md`).
- Script and diction findings also feed `VAULT\wiki\Content Creation\Scripts\`: add the script
  template and the diction numbers to the playbook / templates pages there (create a
  `<Creator> Diction.md` page if none fits), linking back to the analysis note. Skill
  `luisart-guion` reads these.
- Contradictions with existing articles → `> [!warning] Superseded` callout, never overwrite.
- Append one entry to `VAULT\wiki\Log.md` (append-only):
  `## [YYYY-MM-DD] [content] process-references | <n> references`, with `wrote` / `updated` bullets
  naming pages by file stem.
- Do NOT change the channel rules, skills or existing style packs from an analysis (a 3c proposal
  pack is only a demo). List proposals in the report; implement only if the user asks.

## 6 · Report (Spanish, in chat)
Per reference: 3–5 bullet highlights, what we can copy and into which style, rule clashes, where the
note now lives. Then the global picture if several references share patterns, and questions only
where a decision is genuinely the user's (e.g. adopting a clashing technique).

## Don'ts
- Never process without the user's request. Never delete a reference, folder or note of his.
- Never edit his files in `{CONTENT_DIR}\`: the only changes are filing a processed item in its category folder and the clip note's status frontmatter.
- Never put videos or heavy frames in the vault. Never read or write `wiki\Knowledge\` or
  `{KNOWLEDGE_DIR}\`.
- Never overwrite the user's text in a note. Never publish anything.

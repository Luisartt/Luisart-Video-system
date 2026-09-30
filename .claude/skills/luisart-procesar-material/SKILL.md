---
name: luisart-procesar-material
description: Process material Luisart clips with Obsidian Web Clipper into "Finanzas/rawc/" (blogs, articles, papers, books, podcasts, lectures, videos, audio) or hands over as files — audio and video ALWAYS go through Whisper (download the audio, transcribe with word times, save a Markdown transcript, analyse it), text (blog, paper, book) is read directly, and the notes are written with the AI CLI that is available (Claude Code first, Codex or Gemini CLI as fallback) into wiki/Knowledge/ (a summary page plus new or enriched concept pages), then the clip is filed in the best-fit category folder of Finanzas/. Also the shared how-to for transcribing any audio/video with Whisper. Use it ONLY when the user asks — "procesa rawc", "procesa rawc y rawcc", "procesa las dos carpetas", "procesa lo pendiente", "procesa el material", "procesa lo que guardé en el clipper de conocimiento", "resume este paper / blog / libro", "transcribe este audio / podcast", "analiza esta clase / conferencia", "qué tengo pendiente en Finanzas" — never on its own initiative. References for making videos (editing and script style to copy) use luisart-procesar-referencias instead.
---

# Process knowledge material (text, audio, video)

Vault: `C:\Users\LART\Documents\Lartyk\` (manual: `CLAUDE.md` there, section "Intake rule: the two inboxes, `rawc` and `rawcc`" — read it first).
Project (scripts, `.venv`, heavy media): `C:\Users\LART\Documents\Proyectos\tubeai-video\`.
Inbox: `Finanzas/rawc/` — clipped notes (either of our templates with `status: pending`, or Web Clipper's plain default with `source` / `created` / `tags: [clippings]` and no `status`), media, PDF, epub or slides files, folders with `links.txt`, loose study files. The database it files into: `Finanzas/` (the course, book and class sources).
The user's request to process **is** the approval for that run, including writing the wiki pages and filing the sources (say in the report what was written and where each source went). Nothing is processed without it. One request can cover both inboxes ("procesa rawc y rawcc"): run this skill for `rawc` and `luisart-procesar-referencias` for `rawcc`, one heavy GPU job at a time.

Which skill? Clips saved in `Creacion de Contenido/rawcc/` are references for making videos → `luisart-procesar-referencias`. Clips in `Finanzas/rawc/` are knowledge → this skill. If a knowledge clip is clearly also a style reference, finish it here and tell Luisart he can clip it again with the content template.

## 1 · Find pending clips
- Every item directly in `Finanzas/rawc/` except `README.md`, `_web-clipper-template.json` and folders starting with `_`. Skip an item already processed: its path (or its `filed` path) appears in the `sources:` of a wiki page — then it only needs filing (step 5). Read the address from `url` **or** `source`, `kind` (if any) and his sections "What I liked" / "What matters to me" (they set the priorities).
- Decide the **kind** (never ask): `youtube.com`, `youtu.be`, `vimeo`, `tiktok`, `instagram` reels, `spotify`/`podcasts`/`soundcloud`, any `.mp3 .m4a .wav .mp4 .mov .webm` → **audiovisual**. Everything else → **text**: `arxiv`, `ssrn`, `.pdf` papers → *paper*; `.epub`, book files or "book" in the note → *book*; the rest → *article / blog*.
- Report the list (title, kind, proposed category) before starting. If he named specific clips, process only those.

## 2 · Audiovisual (video, audio, podcast, lecture): ALWAYS Whisper
Never summarise from the description, the title or memory: the transcript is the source.

Work folder (heavy files never enter the vault): `archive/soyluisart/clips/<slug>/` in the project. `<slug>` = kebab-case of the clip name.

0. **Social-network video links → Agent Reach first (automatic).** If the clip is or contains a video link from a social network (YouTube, TikTok, Instagram, X/Twitter, Reddit, Facebook, LinkedIn, Bilibili, Xiaohongshu, Xiaoyuzhou), launch the `agent-reach` skill before downloading, without asking: read title, author, caption/description, date, platform subtitles, top comments and thread text, and write them under `## Platform Context` in the note (facts only, with the URL). It complements Whisper, never replaces it (the transcript stays the source of what is said); do not use Agent Reach's `transcribe` or Groq/OpenAI. If yt-dlp fails, try Agent Reach's route for that platform to get the media; never log in or import cookies for Luisart: a channel that needs login is reported "needs login" and skipped.
1. **Get the audio.**
   - URL: `yt-dlp -x --audio-format wav -o "archive/soyluisart/clips/<slug>/audio.%(ext)s" "<url>"`. Instagram profile URLs don't work with yt-dlp; use single reel URLs (built-in browser to find them, never log in, decline cookies). Private, removed or login-walled → set `status: error` and a one-line `## Status` reason in the note, leave it in the inbox, go on.
   - Local file (dropped in the inbox): use it as is (ffmpeg reads the audio of any video); don't move or edit the original.
2. **Transcribe** (GPU, one heavy job at a time, under the render lock):
   ```
   npx tsx .claude/skills/luisart-editar-short/scripts/with_lock.ts -- .venv/Scripts/python.exe -W ignore .claude/skills/luisart-editar-short/scripts/transcribe_parts.py archive/soyluisart/clips/<slug>/audio.wav archive/soyluisart/clips/<slug>/transcript.json --lang <spanish|english|auto>
   ```
   - Model: whisper-large-v3-turbo. The script splits the audio in pauses into parts ≤ 28 s (Whisper hallucinates "Gracias…" and repeated lines at its 30 s boundary), so hours-long audio is fine; run it in the background and don't start another GPU job meanwhile.
   - `--lang`: `spanish` (default), `english`, any Whisper language name, or `auto` when the language is unknown.
   - Output `transcript.json` = `{text, words: [{text,start,end}], splits}` with word times.
3. **Readable transcript.**
   ```
   .venv/Scripts/python.exe -W ignore .claude/skills/luisart-editar-short/scripts/whisper_to_md.py archive/soyluisart/clips/<slug>/transcript.json "<vault>/Finanzas/rawc/_Transcripts/<clip name>.md"
   ```
   Gives paragraphs with `**[mm:ss]**` stamps. Add frontmatter (`type: transcript`, `source: <url or file>`, `language`, `model: whisper-large-v3-turbo`, `generated: <date>`) and never edit the text afterwards; fix suspicious words only in the notes, marked `(sic)` or "garbled in the transcript". Check names of people, companies and tickers against what the page itself says.
4. Go to step 4 (analysis) with the transcript.

## 3 · Text (blog, article, paper, book)
- Blog / article: the clip body may already hold the text; if it is only a description, read the page (`WebFetch`, or the built-in browser for pages that need it; decline cookies, never log in).
- Paper: read the PDF (Read tool with `pages`, ≤ 20 pages per request; for long PDFs read abstract, introduction, method, results, discussion, conclusion, then tables). Record the citation: authors, year, venue, DOI or URL.
- Book (`.epub`, `.pdf`, `.html`): read the chapters (epub → extract text with a script into the work folder); for a long book work chapter by chapter and write one summary page per book plus concept pages, like the existing Books summaries.
- Text in the work folder if you extract it: `archive/soyluisart/clips/<slug>/text.md` (not in the vault).

## 4 · Analyse and write the notes (with the CLI that is available)
The notes are written by the AI agent running in the available CLI: **Claude Code** by default; if it isn't available, **Codex CLI** (`codex exec -s read-only` for a draft, then write the files yourself) or **Gemini CLI** (per the user's global instructions: `gemini --skip-trust --approval-mode plan -m gemini-3.5-flash -o json -p "<prompt>"`, one call at a time) to condense very long transcripts. Whatever writes the draft, verify every number, name and quote against the transcript or text before saving.

Read the transcript / text fully, then produce:
- **Summary** (5–10 bullets), **key ideas**, **claims with numbers** (with `[mm:ss]` or page), **concepts mentioned** (link to existing Knowledge pages; check with Glob/Grep first), **notable quotes** (short, exact, with time or page), **open questions / things to verify**, and for audiovisual material: speakers and language.
- Where it goes (per `CLAUDE.md` → Knowledge operations):
  - **Summary page** in `wiki/Knowledge/Summaries/<group>/`: `Books`, `Articles and Papers`, `Talks and Podcasts`, `Classes and Study Sessions` (a lecture or course video), or `Other`. Frontmatter: `type: summary`, `source_type: article|paper|book|podcast|video|lecture`, `domain`, `aliases`, `sources: ["<final filed path of the clip>", "<final filed path of its transcript>"]` (step 5 decides them), `updated`. Body: `## Summary` → `## Key Ideas` → `## Concepts Mentioned` → `## Notable Quotes` → `## Open Questions` → `## Notes`. Written in English; a Spanish-language source keeps short quotes in Spanish with the translation.
  - **Concept pages:** enrich existing ones (add under `## Where It Appears` and refine the definition, marking contradictions with a `> [!warning] Superseded` callout) or create a new page only when the material really defines a concept with no page. Prefer enriching to creating near-duplicates. Ground every claim in the material; never invent.
  - Update `wiki/Knowledge/Knowledge Index.md` (`## Other pages` for new pages) and append one `## [date] [knowledge] ingest | <title>` entry to `wiki/Log.md` (`wrote` / `updated` / `flagged`, stems in backticks).
- Never touch `wiki/Content Creation/`. Never overwrite Luisart's text in the clip note.

## 5 · File the source in the database, then close the clip
The vault rule is in `CLAUDE.md` → "Intake rule" (steps 4–5). For every processed clip:
- **File it by category.** Move the clip note (and any file he dropped for it, plus its transcript from `_Transcripts/`) out of `rawc` into the closest existing folder of `Finanzas/`: `Finanzas - Negocios/<Subject>/` for course topics, `Finanzas - Negocios/Libros/` for books, `CFA - Certificaciones/`, `Bloomberg - Certifications/`, `fuentes/marketing`, `fuentes/sales`, `fuentes/coaching-facilitation`, `fuentes/tools`, `fuentes/best-practices`, `transcripciones/` for class or meeting transcripts, `Bpowerconsulting/`, `TAB/`. If nothing fits, create `Finanzas/Clips/<wiki concept category name>/` (for example `Finanzas/Clips/Technology and AI/`). `Finanzas/rawc/_Processed/` is only the fallback. Never delete. If two folders fit, pick the better one and name the alternative in the report.
- **Record the final path** in the wiki summary's `sources:` (the filed clip and its transcript) and in the clip note's frontmatter: `status: processed`, `processed: <YYYY-MM-DD>`, `filed: "<final path>"`, `summary: "[[<summary page title>]]"`. His own text stays untouched.
- Work folder in `archive/soyluisart/clips/<slug>/` stays (audio, json) for re-runs.

## 6 · Report (Spanish, in chat)
Per clip: kind, what it says in 3–5 bullets, pages written or enriched, anything uncertain (audio quality, garbled names, unreadable pages), clips that failed and why. Ask questions only where a decision is genuinely his.

## Don'ts
- Never process without his request. Never summarise audio or video without a Whisper transcript.
- Never put video or audio in the vault. Never edit or delete `Finanzas/` files he put there: the only changes are filing a processed item in its category folder (step 5), the clip note's status frontmatter and the derived transcripts.
- Never invent citations, numbers or quotes. Never publish anything.

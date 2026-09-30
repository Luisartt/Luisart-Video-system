---
name: wiki-vault-setup
description: Guide a user step by step to create their own knowledge vault (Obsidian + Markdown wiki) for their video channel from vault-template/ — the two inboxes (rawcc for video references, rawc for things to learn), the databases filed by category, the AI-owned wiki (Content Creation and Knowledge), private personal notes, Web Clipper, Git sync and backups — explaining what each part is for and how the AI processes the inboxes. Use when the user says "crea mi wiki", "arma mi bóveda", "cómo hago las notas / las carpetas RAW", "set up my knowledge base", "create the vault", or when video-system-start reaches the wiki stage.
---

# Create the vault (wiki, notes, RAW inboxes)

This is the content-creation knowledge system the original channel uses, packaged so anyone can build
it. The finished result: the creator saves things in **two inboxes** in one gesture; on request the AI
reads them (video and audio through Whisper), writes organised wiki pages, files the originals by category,
and later uses that knowledge when writing scripts and editing videos.

Talk in the user's language, one question at a time, explain each part in a sentence before creating it,
and never make them touch files. Read `vault-template/README.md` and `vault-template/CLAUDE.md` first:
the second one is the manual the AI will follow forever.

## Steps

1. **Explain the idea in five lines** (show this, in their language):
   - *Inboxes:* `rawcc` = videos/reels to copy the **editing and script** of; `rawc` = things to **learn**
     (articles, courses, books, podcasts). Save first, decide nothing now.
   - *Database folders:* your originals, filed by category, never edited.
   - *Wiki:* pages the AI writes from your sources, in a fixed shape.
   - *Personal notes:* private; the AI does not open them unless asked.
   - *Two divisions never mix while editing:* editing reads Content Creation only; scripts may read
     Knowledge to add substance.
2. **Ask** (max 6): where to put the vault (default `Documents/<Brand>-Vault`), the wiki language
   (default = the user's), their 8–15 **knowledge categories** (propose some from `brand.json → topic`
   and let them edit), whether they want Personal notes, whether to sync with GitHub (private repo) and
   back up to cloud storage.
3. **Create it:** `python scripts/configurar_rutas.py --create --vault "<chosen path>"` copies `vault-template/` to the
   vault (it never overwrites) and writes the paths to `brand/paths.json`. Then fill: the vault's `CLAUDE.md`
   (`<Creator>`, `<channel>`, folder names if renamed), `wiki/Home.md`, `Channel Home.md`, `Knowledge Index.md`
   (their categories → create `wiki/Knowledge/Concepts/<category>/` folders), today's date in `updated`.
   **Paths are configurable:** the processing skills (`luisart-procesar-material`, `luisart-procesar-referencias`,
   `luisart-guion`, `luisart-editar-short`) use placeholders (`{VAULT}`, `{CONTENT_INBOX}`, `{KNOWLEDGE_INBOX}` …)
   that come from `brand/paths.json`. If the user renames a folder or moves the vault, they (or you) edit that file
   and run `python scripts/configurar_rutas.py --check`. To customise a skill itself, edit its `SKILL.md`: the
   placeholders keep working.
4. **Connect the tools** (do it for them): install Obsidian (`winget install Obsidian.Obsidian` on Windows),
   open the folder as a vault; plugins to enable: Web Clipper (browser extension), Obsidian Git (optional),
   Dataview (optional). **Import both Web Clipper templates**
   (`Content/rawcc/_web-clipper-template.json`, `Knowledge-Sources/rawc/_web-clipper-template.json`):
   explain "one button saves a page into the right inbox".
5. **Sync and backup (optional but recommended):** `git init`, private repository on their own GitHub
   (`gh repo create <name> --private`), Git LFS for documents (`.gitattributes` is ready), push. Explain
   *private* in one sentence: transcripts and notes are personal. Heavy media stays out of git; offer a daily
   text backup to cloud storage.
6. **Try it with one real item.** Ask them to clip one reel (→ `rawcc`) and one article (→ `rawc`). Then
   run, on their request, `luisart-procesar-referencias` / `luisart-procesar-material` (needs the project's
   Whisper and yt-dlp from the setup stage) and **walk them through the result**: the analysed note, where
   the source was filed, the Log line, how a concept page links to it. This is the moment they "get" it.
7. **Teach the daily loop** (one screen, their language):
   - Save anything interesting with Web Clipper (one click) or drop files in an inbox.
   - Say "process rawc and rawcc" when you have a pile.
   - Ask "write a script about X": it reads your Knowledge (read-only) and your channel rules.
   - After each video the AI updates `Videos/<date slug>/`.
   - Ask "lint the wiki" now and then.
8. **Update** `brand/PROGRESS.md` and finish with the next stage of `video-system-start`.

## Rules
- The vault is **private by default**; never put it in this public repository (it is git-ignored through
  its own repo). Never commit keys, passwords, IDs, tax or bank documents.
- The AI processes inboxes **only on request**; the request is the approval for writing pages and filing.
- Never edit or delete the database folders; never put video/audio/renders in the vault.
- Never read `Personal notes/` unless asked in that message.
- Whisper for all audio/video; the transcript is the source; never invent citations.

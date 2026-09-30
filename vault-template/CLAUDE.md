# CLAUDE.md — vault manual (template)

> Copy of the working manual of a real creator's vault, generalised. Replace `<Creator>`,
> `<channel>` and the folder names if you renamed them (keep `brand/brand.json → vault` in sync).

This is **<Creator>'s single knowledge vault** (Obsidian + Markdown). It serves two jobs:
1. **Making videos.** The editing system, styles, references, scripts and one file per video.
2. **Knowledge.** What the creator studies or knows (courses, books, classes, articles), written so the
   AI can reuse it in scripts.

Everything is Markdown. The wiki is written in **one language** (default: English) and the creator is
addressed in **their own language**. The AI does all technical work and reports outcomes, not internals.

---

## Layout

```
Content/                    DATABASE of the content-creation division (the creator's material; the AI only
                            reads it and files processed items)
  rawcc/                      INBOX: video references, reels, scripts to study (+ _web-clipper-template.json)
  <category>/<slug>/          processed references, filed by category:
                              Creators/<creator>, Editing Styles, Scripts and Diction,
                              Sound and Music, Animation and Motion, Other
  _Processed/                 fallback when no category fits
Knowledge-Sources/          DATABASE of the knowledge division: course, book, class and article sources
  rawc/                       INBOX: blogs, papers, books, podcasts, lectures, videos, audio, loose files
                              (+ _web-clipper-template.json, _Transcripts/ staging, _Processed/ fallback)
  <subject>/                  processed sources filed by subject
wiki/                       AI-owned pages
  Home.md  Log.md
  Content Creation/           everything needed to make a video
    Channel Home.md  Content Creation Index.md
    Editing System/  Styles/  Designs/  References/(Creators, Analyzed Videos, Analyzed Texts)
    Scripts/  Videos/<YYYY-MM-DD slug>/  Finished Posts/ (one page per scheduled/published post)
  Knowledge/
    Knowledge Index.md  Concepts/<category>/  Summaries/<source group>/  Entities/  Maps/  Diagrams/
Personal notes/             the creator's PRIVATE notes (see Hard don'ts)
_templates/                 page templates the AI copies (concept, summary, analysed video, video brief)
```

## Read-routing: keep the two worlds apart

| Task | Read | Never |
|---|---|---|
| **Edit a video** | `wiki/Content Creation/` only: Editing System, the chosen style's folder and designs, the creators behind it, `Videos/<that video>/`. | `wiki/Knowledge/`, `Knowledge-Sources/` — editing must never mix with knowledge. |
| **Write or review a script on topic X** | `Content Creation/Scripts/` and diction notes, then a **read-only search of `wiki/Knowledge/`** for X (definitions, examples, numbers, nuances, common mistakes). Record pages used in `Videos/<video>/Sources Used.md`. | Editing or re-linking Knowledge pages from a content task. |
| **Process the inboxes** ("process rawc and rawcc", or one of them) | `Knowledge-Sources/rawc/` → `wiki/Knowledge/`; `Content/rawcc/` → `wiki/Content Creation/References/`, `Scripts/`; then file each source by category. Audio and video always through Whisper first. | Processing without the creator's request. |
| **Ingest, query or lint knowledge** | `Knowledge-Sources/` → `wiki/Knowledge/`. | `Content Creation/`, except to link a concept a script used. |

## Intake rule: the two inboxes

The creator clips or drops everything new into **two inboxes**; they are the only places new material
arrives. The folders around them are the database: the AI reads them and only **files** processed items.

| Inbox | Division | Skill | Notes go to | Source is then filed in |
|---|---|---|---|---|
| `Knowledge-Sources/rawc/` | Knowledge | `luisart-procesar-material` | `wiki/Knowledge/` | best-fit folder under `Knowledge-Sources/` |
| `Content/rawcc/` | Content creation | `luisart-procesar-referencias` | `wiki/Content Creation/References/` (+ `Scripts/`, `Creators/`) | best-fit folder under `Content/` |

**When the creator asks**, analyse both inboxes in one run; the request is the approval (including
writing wiki pages and moving files). Nothing is processed automatically.

**Pending = everything directly in an inbox** except `README.md`, `_web-clipper-template.json` and
folders starting with `_`: clipped notes (either template, or Web Clipper's default), media/PDF/epub/
slides files, folders with `links.txt` and notes, loose files. An item whose path appears in a wiki
page's `sources:` is already processed and only needs filing.

**Per item:** (1) classify audiovisual vs text; (2) read it — **audio/video always through Whisper**,
the transcript is the source, never the title; text read directly; (3) write the notes with the AI CLI
available and verify numbers/names/quotes against the source; (4) put notes in the wiki in the category
that fits (summary + concepts for knowledge; analysis note + creator article + scripts for content);
(5) **file the source in the database by category**, never delete, then record the final path in the
wiki page `sources:` and in the clip note's frontmatter (`status: processed`, `processed`, `filed`,
`summary`); (6) report to the creator: what it is, pages written, where it was filed and why, anything
uncertain or failed. Heavy jobs (Whisper, renders) one at a time.

## Wiki conventions

**Frontmatter** — YAML lists `[a, b]`, dates `YYYY-MM-DD`; field names never change (Dataview and
Metadata Menu depend on them).

| Page | Fields |
|---|---|
| Concept | `type: concept`, `domain: [...]`, `aliases: [...]`, `updated` |
| Summary | `type: summary`, `domain`, `sources: ["Knowledge-Sources/..."]`, `updated` |
| Entity | `type: entity`, `class: institution \| company \| person \| instrument \| standard \| index`, `domain`, `aliases`, `updated` |
| Map | `type: moc`, `domain` |
| Index (`Home`, indexes) | `type: index`, `aliases`, `updated` |
| Content Creation page | `type: channel-hub \| channel-rule \| channel-style \| gallery \| creator \| reference \| script \| video`, `domain: [channel-editing]`, `aliases`, `sources`, `tags`, `updated` |

`sources` are plain paths, never wikilinks. Append a path when a new source updates a page; never remove
one (except a verified non-existent path, logged).

**Names and links:** canonical names in Title Case; other-language titles go in `aliases`, never as a
new page; link liberally (a link to a missing page marks something worth writing); moving a page between
folders is safe because Obsidian links by name.

**Body:** Concept = `## Definition` → `## Key Ideas` → `## Connections` → `## Where It Appears`.
Summary = `## Summary` → `## Key Ideas` → `## Concepts Mentioned` → `## Notable Quotes` →
`## Open Questions` → `## Notes`. Content Creation pages = dense bullets/tables ending with
`## Key Takeaways` (3–7 bullets). Contradictions are never overwritten silently: add a
`> [!warning] Superseded` callout to the older page linking the newer, keep the old claim under it.
The creator's own words stay untouched; the AI adds sections after them.

**Log:** `wiki/Log.md` is append-only; each entry `## [YYYY-MM-DD] [content|knowledge] <op> | <summary>`
with `wrote` / `updated` / `flagged` bullets naming pages in backticks. Never rewrite past entries.

## Knowledge operations
**Ingest** (read → discuss key points if the creator is present → summary in `Summaries/<group>/` →
create or enrich concept/entity pages → update Home and the relevant Map → Log line; prefer enriching to
creating near-duplicates). **Query** (Home → Maps → pages → answer with `[[links]]`; good answers become
pages). **Lint** (contradictions, stale claims, orphans, concepts mentioned without a page, missing links,
duplicate aliases; verify specific numbers against their source).

## Analysed reference note (content division)
Keep the creator's own text untouched, then add: `## Summary`, `## Editing Analysis`,
`## Script and Diction` (with the transcript and a reusable script template), `## What We Can Copy`,
`## Clashes With Channel Rules`, `## Renders`, `## Files`. Frontmatter `status: pending` → `analyzed`
(or `error` with a one-line reason). Analyses only **propose**; channel rules change only when the creator
decides.

## After each video
Update `wiki/Content Creation/Videos/<YYYY-MM-DD slug>/`: brief summary, version history, pending
decisions, `Sources Used.md`, render paths (full paths into the project's `out/`, never copy videos into
the vault). New contact sheets go to `Designs/<Style>/`.

## Sync and backup (recommended)
- One **private** GitHub repository per vault; `git pull` at the start of any task, commit and push at the
  end with a message that says what changed; never force-push. Use Git LFS for PDFs/Office/images.
- Heavy video/audio never goes to git: keep it in cloud storage with the same relative path.
- A scheduled daily zip of text files to cloud storage is a cheap second safety net.

## Hard don'ts
- **The database folders** (`Content/`, `Knowledge-Sources/`): never edit or delete anything; the only
  change is filing a processed item from an inbox into its category (and AI-made Whisper transcripts).
- **Never** put renders, video or audio into the vault; never summarise audio/video without a transcript;
  never invent citations (if nothing backs a claim, say so).
- **Channel decisions** (music, voice cloning, publishing, changing channel rules) belong to the creator.
- **Personal notes:** never open, search, list, summarise or use anything in `Personal notes/` unless the
  creator explicitly asks in that message; nothing there feeds the wiki. If it syncs to git it sits in
  plain text — encrypt or exclude it if that matters.
- **Sync:** never make the vault repository public; never commit keys, passwords, IDs, tax or bank papers.

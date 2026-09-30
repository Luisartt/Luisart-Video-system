# rawc — knowledge inbox

Everything you want to **learn or remember** arrives here: blogs, papers, books, podcasts, lectures, videos,
audio, slides, loose study files. The AI reads this folder and only files processed items; the folder
around it, `Knowledge-Sources/`, is the database filed by subject.

## What goes here
- **Web Clipper notes** (import `_web-clipper-template.json` once). Clip any article or video page.
- Files you drop: PDF, epub, slides, mp3/mp4, transcripts.
- A folder per source with `links.txt` and your own notes.

Videos to *copy the editing of* go to `Content/rawcc/` instead.

## What happens when you say "process rawc"
Only when you ask. Skill `luisart-procesar-material`.
1. Read it: text directly; **audio and video always through Whisper** (transcript saved to
   `_Transcripts/`, never edited afterwards; doubtful words flagged `(sic)`).
2. Write a **summary** in `wiki/Knowledge/Summaries/<group>/` (Summary · Key Ideas · Concepts Mentioned ·
   Notable Quotes · Open Questions · Notes), and create or **enrich concept pages** in
   `wiki/Knowledge/Concepts/<category>/` (enrich before creating a near-duplicate); update the Knowledge Index.
3. **File the source by subject** under `Knowledge-Sources/` (`Books/`, `Courses/<subject>/`, `Articles/`,
   `Talks and Podcasts/`, or `Clips/<category>/` if nothing fits). Nothing is deleted.
4. Add a `[knowledge] ingest` line to `wiki/Log.md`.

Numbers, names and quotes are always checked against the source; nothing is invented.

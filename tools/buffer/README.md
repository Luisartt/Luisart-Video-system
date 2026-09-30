# tools/buffer — schedule posts in Buffer from a saved browser session

Why this exists: the Buffer connector (MCP) is great for captions, listing, editing and deleting posts, but
**uploading media files** goes through Buffer's web composer. These three small scripts drive a visible
Chromium that keeps your Buffer login in `.profiles/buffer` (git-ignored; never delete it).

| File | What it does |
|---|---|
| `abrir.cjs` | opens Chromium with the permanent profile and debugging port 9333; **you** sign in to Buffer there once |
| `pw.cjs` | lets other scripts control that window |
| `publicar.cjs` | opens the composer, keeps only Instagram, uploads files one by one in order, sets Post/Reel/Story, pastes the caption, takes Buffer's recommended time (or `--time`) and presses **Schedule Post** |

```bash
node tools/buffer/abrir.cjs                     # once; sign in; leave it open
node tools/buffer/publicar.cjs --type carousel --files "01.png,02.png,03.png" --caption caption.txt
node tools/buffer/publicar.cjs --type reel --files reel.mp4 --caption caption.txt --time "6:30 PM"
```
Facts learned the hard way: attach files **one by one** (Buffer orders by finished upload); a single video flips the
type to "Reel", so the script re-selects the right radio; Instagram allows at most 5 hashtags; a "Music" note
forces "Notify Me" (phone app) instead of automatic publishing. The scripts never publish "now" and never add music.

Full guide and rules: `docs/BUFFER.md` and the skill `buffer-publishing-setup`.
The page's markup can change: the first time, run it while the user watches the window and fix any selector
that no longer matches. Automation was written for the Instagram carousel flow; check Reel and Story the first time.

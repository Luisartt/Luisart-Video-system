---
name: buffer-publishing-setup
description: Recommend and set up Buffer for scheduling social posts (Instagram carousels, reels, stories), connect the Buffer connector and a saved-login browser profile, and then schedule finished posts safely — detect the format, upload files in order, schedule at Buffer's recommended time, verify order and status, and file the result. Use when the user says "configura Buffer", "quiero programar mis publicaciones", "sube este post a Instagram", "prográmalo", "set up Buffer", "schedule this", or when video-system-start reaches the ship stage.
---

# Buffer: setup and publishing

Buffer is the recommended scheduler: one queue for several networks, recommended posting times, and a free plan
to start (check the current plan on their pricing page). Read `docs/BUFFER.md` for the human-readable version;
the scripts are in `tools/buffer/` (Playwright, already a dependency).

**Hard rules (always):**
- **Schedule, never "publish now"**, and only after the user says the post is finished.
- **Never choose music.** The user adds it in Instagram from the Buffer phone app (Notify Me mode), which makes
  that post non-automatic — say so.
- **Never type, ask for or store a password or API key.** The user signs in to Buffer in the window you open;
  if the connector asks for a key, the user puts it in the connector settings, never in the chat.
- **Never delete `.profiles/buffer`** (the saved login; it is git-ignored). If you must start over, ask first.
- Do not post for the user on any network you have not set up with them. Nothing here publishes without consent.

## A. Setup (once) — you do the work, they sign in
1. Ask: "Do you already have a Buffer account with your networks connected?" If not, guide them to create one and
   connect their networks (you can open the page for them in the built-in browser; they sign in).
2. **Connector:** check whether a Buffer connector is available in this session (`list_channels` works). If not,
   tell them to add the Buffer connector in their client and authorise it (OAuth); if their client asks for an API
   key, it is created at `publish.buffer.com/settings/api` and pasted into the connector settings, not here.
3. **Saved browser session:** run `node tools/buffer/abrir.cjs` (in the background), wait for port 9333, and ask the
   user to sign in to Buffer in that window. Confirm with `node tools/buffer/publicar.cjs` (prints the usage text if
   it loads) and by opening `publish.buffer.com` in that window.
4. **Dry run:** create a test draft with one image through the composer, look at it with `list_posts`, delete it.
5. Record in `brand/brand.json`: `"publishing": {"tool": "buffer", "channels": ["instagram"], "deselect": <N>}`
   where `deselect` = how many pre-selected channels must be switched off so only the target stays (see
   `--deselect` in `publicar.cjs`). Update `brand/PROGRESS.md`.

## B. Publish a finished post
1. **Detect the format** from the files (`ffprobe` width/height/duration + file count); ask one short question only if
   ambiguous:
   | Format | How to recognise it | Buffer type |
   |---|---|---|
   | Carousel | 2–10 files, equal size 1080×1350 (4:5), numbered `01…N` | Post |
   | Reel | one 9:16 video 1080×1920, ~5–90 s | Reel |
   | Story | one 9:16 image or video, short, no caption | Story |
   | Single post | one 1080×1350 image | Post |
   YouTube or other networks are different flows: ask.
2. **Prepare:** final, numbered files; caption from the post's document (**max 5 hashtags** for Instagram, < 2,200
   characters; Stories carry none). Confirm the final files are filed (see the vault's "finished posts" rule).
3. **Schedule:** `node tools/buffer/publicar.cjs --type carousel|reel|story --files "a,b,c" --caption caption.txt [--time "6:30 PM"] [--deselect N]`.
   If it says **no session**, the user signs in again in the `abrir.cjs` window. The first time, run it with the
   window visible and the user watching; fix selectors that no longer match (Buffer's web changes).
4. **Verify** with the connector: `list_posts` → status `scheduled`, automatic mode, `dueAt`, assets **in order
   01…N**. If two swapped, fix with `edit_post` (keep each asset's Buffer source URL, `metadata.instagram.type` and
   `shouldShareToFeed`). Delete any leftover draft. Never patch a half-failed upload: delete and redo the post.
5. **Close:** write the Buffer post id, date/time and status in the post's document in the wiki (`Finished posts`)
   and add a `Log.md` entry; tell the user (their language): what was scheduled, when, which caption keyword they
   must answer (for a comment-to-get call to action), and anything pending (music, phone app).

## Known limits
- Buffer may put a post in **draft** if a setup is missing (phone notifications for Notify Me); automatic mode avoids it.
- More than 5 hashtags disables "Schedule Post"; wrong-size files get cropped — export the right size first.
- A single uploaded video flips the type to Reel; the script re-selects the right radio after the first file.
- The integrated browser pane cannot attach files: use the `tools/buffer` window.
- The automation was used in real life for carousels; verify the Reel and Story paths the first time.

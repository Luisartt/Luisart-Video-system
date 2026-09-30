---
name: design-references-research
description: Research visual and editing references for a video brand across many websites and platforms (design galleries, brand pages, creators' channels, motion and video-editing examples), teach the user how to build a reference board, and distill what was found into notes and candidate design tokens without copying anyone's assets. Use when the user says "busca referencias", "ayúdame a encontrar inspiración", "find me references for my style", "look at these sites", or when video-system-start reaches the references stage.
---

# Research references (and teach how)

A **reference board** is a short list of examples with one sentence each about *what* you like
("the numbers are huge and they count up", "captions sit under the chin, two words at a time").
It turns a vague taste into decisions a design system can encode. The user does not have to know
what they like: you show, they react ("yes / no / that part only"), you learn.

## How to work

1. **Get the brief:** `brand/brand.json` (topic, audience, platforms, admired creators/brands). If
   the user has links already, start there.
2. **Pick the lanes**, say which and why, and go through several sites per lane (aim for 6–10
   examples in total per lane; stop when answers repeat):
   - *Design and brand galleries:* Behance, Dribbble, Pinterest boards, Awwwards, Siteinspire,
     Godly, Land-book, Are.na, Savee, Mobbin (apps), Brand Guidelines / brand-pages of companies
     in the same niche.
   - *Motion and video:* YouTube and Instagram/TikTok reels of creators in the niche (public
     pages), Vimeo Staff Picks, motion-graphics showcases, Motionographer, Lottie/After Effects
     showcases.
   - *Design systems to learn from:* public design-system sites (Material, Polaris, Carbon,
     Primer, Atlassian, Radix) and the `awesome-design-md` collection
     (<https://github.com/voltagent/awesome-design-md>) for DESIGN.md examples of well-known brands.
   - *Editing grammar:* analysed videos in the wiki/notes of this repo if present
     (`.claude/skills/luisart-procesar-referencias` explains how an analysis is done).
3. **Use the tools the assistant has**, in this order: the built-in browser (look at the page,
   read text, screenshot for your own analysis), Firecrawl or web fetch/search if connected, a
   social-media reader skill if installed (for public reels/posts). If a site needs a login,
   blocks bots or shows a CAPTCHA: say "that one needs login", skip it, and move on. Never log in
   for the user, never import cookies, never solve CAPTCHAs.
4. **For each reference record** (in `brand/references/REFERENCES.md`, a table):
   link · what it is · what the user liked (their words) · what to borrow (a principle, not an
   asset) · observed tokens (colour, type, radius, motion speed) · what clashes with the brand.
   For videos also note the format, hook in the first 3 seconds, caption style, cut rhythm, sound.
5. **Show, don't dump:** after each lane, present the 3–5 strongest examples in the chat with one
   line each and ask "which of these feels like you?". Drop what gets a no.
6. **Distill:** end with a 10-line summary ("your taste in one page"): palette family, type mood,
   shape language, motion speed, caption style, layout. Feed it to `design-system-create` or
   `design-system-import` and keep the board linked from `DESIGN.md`.
7. Teach as you go in one or two sentences: why galleries show polish and not substance, why to look
   at 3 references that share a trait instead of one you copy, how to tell trendy from durable.

## Access guide: how the model reaches each site
1. Start from `references/sites.md` (curated list, links only, with each site's AI-access status).
2. **Check before you fetch:** `python scripts/design/revisar_robots.py <domain> ...` returns ALLOWED /
   PARTIAL / BLOCKED / UNKNOWN from the site's robots.txt. Treat BLOCKED and UNKNOWN as human-only:
   hand the user the link, ask them to open it and tell you (or paste) what they liked, and move on.
   Never work around a block (no proxies, no spoofed agents).
3. **Choose the lightest tool that works**, in this order: (0) the `agent-reach` skill when installed (skill `install-third-party-skills`;
   `agent-reach doctor --json` shows which channel works; no-login channels only); (a) the built-in browser pane for looking at a
   page and reading its text; (b) web fetch/search tools for single pages; (c) Firecrawl (map, scrape)
   if a connector is installed — one site at a time, few pages; (d) a social-media reader skill for public
   reels/posts. Do not crawl galleries wholesale: sample a handful of pages per site.
4. **Order of a session:** pick 3–4 sites that match the brand → look at 6–10 examples each → show the best
   5 in the chat → record them → next lane. Stop when answers repeat.
5. Login walls, cookie banners that hide content, CAPTCHAs: stop and tell the user; decline non-essential
   cookies; never sign in for them.
6. Add any site the user brings to `sites.md` with its status.

## Rules
- Store **links and your own notes**, not the assets. Screenshots you take are for analysis only and
  go to `brand/references/_local/` (git-ignored). Never commit other people's images, frames,
  videos, logos or fonts; never reproduce long text. Quote at most a few words with attribution.
- Borrow principles (contrast, rhythm, density, hierarchy), never a whole identity.
- Public pages only; follow robots/ToS; slow and polite (no scraping storms).
- No personal data about private people; a creator's public channel is fine to analyse as a style
  reference, their face and voice are not material to reuse.
- The analysis proposes; the user decides what enters the brand.

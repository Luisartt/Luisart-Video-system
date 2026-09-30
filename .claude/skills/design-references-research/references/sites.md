# Reference sites (links only)

A starting list of places to look for design, motion and component references. **Links only:**
nothing from these sites is copied into this repository. Each site's access policy was checked on
**2026-09-30** with `scripts/design/revisar_robots.py`; policies change, so re-run it before relying
on a row.

Legend — **AI access**: ✅ no rule against AI agents · ◐ some paths disallowed · ⛔ AI crawlers
blocked or human-only (give the user the link and let *them* look; do not fetch it with tools).

## Inspiration: sites, apps, brands
| Site | What it is | AI access |
|---|---|---|
| [Godly](https://godly.design) | curated websites and apps, sections (hero, footer, CTA), logos and icons | ✅ |
| [Savee](https://savee.com) | saved images by studios and brands; good for mood | ✅ |
| [Awwwards](https://www.awwwards.com) | award-winning websites | ✅ |
| [Dribbble](https://dribbble.com) | designers' shots: UI, motion, branding | ✅ |
| [Motionographer](https://motionographer.com) | motion-design showcases and articles | ✅ |
| [Framer Marketplace](https://www.framer.com/marketplace/templates/) | website templates (good for layout ideas) | ✅ |
| [Lenin.dev](https://www.lenin.dev) | example of a designer portfolio | ✅ |
| [Behance](https://www.behance.net) | portfolios and brand projects | ⛔ |
| [Siteinspire](https://www.siteinspire.com) | curated web design | ⛔ |
| [Pinterest](https://www.pinterest.com) | boards for mood | ⛔ (all robots) |
| [Are.na](https://www.are.na) | channels of saved links | ◐ |
| [Land-book](https://land-book.com) | landing-page gallery | ◐ |
| [Mobbin](https://mobbin.com) | mobile app flows | ⛔ for some AI bots |
| [Refero Styles](https://styles.refero.design) | brand styles with previews and a downloadable `DESIGN.md` | ⛔ (robots ask AI agents not to crawl: the **user** opens the page and downloads the `DESIGN.md` themselves, then you import it with `design-system-import`) |

## Components and motion (for ideas you rebuild in your own tokens)
| Site | What it is | AI access |
|---|---|---|
| [21st.dev](https://21st.dev) | community React components | ◐ (only bookmarks disallowed) |
| [React Bits](https://reactbits.dev) | animated components, text effects, backgrounds (MIT) | ✅ |
| [Magic UI](https://magicui.design) | animated components and templates | ✅ |
| [SmoothUI](https://smoothui.dev) | components incl. AI/agent/chat, charts | ✅ |
| [unlumen UI](https://ui.unlumen.com) | components, animated icons | ✅ |
| [neobrutalism.com (Retro UI)](https://neobrutalism.com) | neo-brutalist components and blocks | ✅ |
| [Transitions.dev](https://transitions.dev) | collection of UI transitions and text effects | ✅ |
| [ShaderGradient](https://shadergradient.co) | WebGL gradients | ✅ |
| [Unicorn Studio](https://www.unicorn.studio) | WebGL effects and backgrounds | ✅ |
| [CodePen](https://codepen.io) | front-end experiments | ⛔ (automated fetch returns 403) |

## Design systems to study (public documentation)
Material Design, Shopify Polaris, IBM Carbon, GitHub Primer, Atlassian Design, Radix/shadcn. And the
[`awesome-design-md`](https://github.com/voltagent/awesome-design-md) collection of `DESIGN.md` files.

## Video and editing references
Public channels and reels in the user's niche (YouTube, Instagram, TikTok) — analysed with
`.claude/skills/luisart-procesar-referencias`; Vimeo Staff Picks; motion-graphics reels. Use the
platform's public page only; if it needs a login, skip it.

## Add your own
Keep this file as a living list: add a row when the user discovers a site they like (name, link,
one line, AI-access status from `revisar_robots.py`).

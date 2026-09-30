# Terminal — green-screen graphics library (@soyluisart)

Extracted from the approved prototype `prototypes/b/` (showcase `SLA-proto-b-terminal`): Schibsted
Grotesk + JetBrains Mono, near-black panels, hairlines, corner ticks, `[01]` mono tags, decrypt text,
split-flap tiles, beams, step charts. Renders: `out/soyluisart/green/terminal/<ID>.mp4` (H.264
4:4:4, `#00FF00` background), overview `out/soyluisart/green/terminal/_index.png`.

**Every element** takes `backing` (`green` default · `style` = preview over the Terminal backdrop ·
`transparent` = for alpha renders) and `duration` (seconds). All props are editable in Studio →
`soyluisart/terminal/<element>`. Each element enters, holds, and exits with the same scan-wipe
(ice scanline erasing it, last 10 frames).

**Sound (2026-09-27):** every element bakes its own sound effects (`sfx` prop, default on; map in
`theme.ts → sfx`, taken from `media/soyluisart/audio/GUIA-EFECTOS.md`, cue component
`../shared/sfx.tsx`). Each file's measured peak lands on the frame the visual event happens; beds
are trimmed to the event with a 4-frame fade. Titles: mechanical typing bed under the decrypting
lines + a hard key on the last character (+ a short bed under the `$` line). Lower third: click
tone when the blue edge snaps on + short typing under the typed line. Keyword: tech select per
line; stat: ticking while it counts + bleep when it settles. Ticker: split-flap bed while tiles
turn + bleep when the last one settles. Chart: data-progress bed while it draws, a minimal pop as
the head passes each buy/sell marker, bleep on the last value. Beams: loading bed, tech select as
the logos land, option select when the hub first lights. Checklist: click as the card lands,
checkbox tick per step, success chime on the last. Callout: keys under the label, digital click
when the frame closes. Compare: click as the cards land, a select click per row, a ding on the last
winner mark. Scan transition: tech slide on the covering sweep and (softer) on the reveal, keys
under the chapter headline. No whooshes anywhere in this library. Renders carry an AAC track.

**Numbers and money:** Mexican format (`1,284.50`, `formatNum` = `shared/text.ts → formatMx`);
money only in US$ or MXN (stock prices are US$, marked in the caption / meta line). Tags are
uppercased in code (`upperKeepName`), so "Luisart" and @handles are never uppercased.

**No boxes behind text (user rule, 2026-09-27):** no panel, chip, pill or band exists only to sit
behind text. Titles, lower thirds, keywords, callout labels, the compare chapter tag and "VS", and
the "[Dato de ejemplo]" line are plain type with a thin opaque outline painted under the letters
(`outlineText()` in `primitives.tsx`), framed at most by hairline corner ticks with no fill. Only
cards that ARE the graphic keep their opaque near-black panel: beams diagram, ticker board,
chart frame, checklist task card, compare cards (the chart's head value is plain white text, no
white tag).

Key-safe rules baked in: panels are opaque near-black; no grain, no washes, no glows outside
panels; on green the gain colour `#3DDC97` becomes ice + ▲, and logos
that contain green (Gemini, Copilot) switch to their official white mono mark. Sample numbers show
`[Dato de ejemplo]`. The channel name is always "Luisart".

| ID | For | Key props |
|---|---|---|
| `SLA-term-title-left` | Chapter title, top-left: plain outlined type inside blue corner ticks (no panel) | `chapter`, `tag`, `line1`, `line2` (ice + cursor), `command` ($ line, empty = none), `size` |
| `SLA-term-title-center` | Full chapter card, centred | same, `layout: center` |
| `SLA-term-title-subtitle` | Title + one-line subtitle | same + `subtitle`, `layout: subtitle` |
| `SLA-term-lower-third-luisart-left` | "Luisart" name tag, bottom-left: corner ticks + blue edge bar, outlined type, no box | `name`, `line` (typed), `tag`, `side`, `bottom` |
| `SLA-term-lower-third-luisart-right` | Same, bottom-right | `side: right` |
| `SLA-term-lower-third-guest` | Guest name + role | `name`, `line` (role · company), `tag` |
| `SLA-term-beams-3-logos` | 3 AI logos beaming into a labelled node | `logos` (list), `headline`, `hubTag`, `hubLabel`, `align` |
| `SLA-term-beams-5-logos` | Same with 5 logos (1–6 supported) | `logos` |
| `SLA-term-beams-versus` | Two logos facing, beams meet in a VS node | `layout: versus`, `logos[0..1]`, `hubLabel` |
| `SLA-term-ticker-gain` | Split-flap price board, rising | `rows[0]` (`symbol`, `price`, `change` %), `caption`, `sample`, `side` |
| `SLA-term-ticker-loss` | Same, falling (red ▼) | `rows[0].change` negative |
| `SLA-term-ticker-watchlist` | 3–4 rows of tickers | `layout: watchlist`, `rows` |
| `SLA-term-chart-up` | Step chart drawing on, white head value (plain text), buy/sell markers | `series`, `buys`, `sells` (indices), `symbol`, `meta`, `decimals`, `sample` |
| `SLA-term-chart-down` | Same with a falling series | `series` |
| `SLA-term-checklist-3-steps` | Agent task card ticking steps + progress bar | `steps`, `title`, `doneLabel`, `side`, `bottom` |
| `SLA-term-checklist-5-steps` | Same, 5 steps (1–7 supported) | `steps` |
| `SLA-term-callout-box` | Bracket frame drawing around a region, with a typed outlined label (no chip) | `x`, `y`, `w`, `h`, `label`, `readout`, `accent` |
| `SLA-term-callout-underline` | Underline with end ticks under a region | `mode: underline`, `x`, `y`, `w`, `h`, `label` |
| `SLA-term-compare-chatgpt-vs-claude` | Two AI tools side by side, stat rows; "VS" is outlined text in corner ticks | `left`/`right` (`logo`, `name`, `tag`), `rows` (`label`, `left`, `right`, `better`) |
| `SLA-term-compare-generic` | Same without logos (A/B monograms), prices in US$ | `logo: none`, `monogram` |
| `SLA-term-keyword-single` | One big word with corner ticks (no panel behind it) | `lines` (1), `tag`, `size`, `position` |
| `SLA-term-keyword-stacked` | 2–3 stacked lines, white/ice | `lines` |
| `SLA-term-keyword-stat` | Big mono number counting up + label | `layout: stat`, `value`, `decimals`, `prefix`, `suffix`, `label`, `sample` |
| `SLA-term-transition-scan` | Full-frame scan-cut wipe (1 s): covers, then uncovers | `duration`, `sweepFrames` — cut under the fully covered frames |
| `SLA-term-transition-scan-chapter` | Same, holding a chapter tag + headline while covered | `chapter`, `tag`, `headline` |

## Vertical (Shorts / Reels / TikTok)

Every variant above also exists at 1080×1920 with the same props, ID + `-v` (Studio →
`soyluisart/terminal/vertical/<element>`), rendered to `out/soyluisart/green-vertical/terminal/<ID>.mp4`
(overview `_index.png`). The same components re-lay themselves out via `useFormat()` and keep
everything inside the vertical safe area (top 250, bottom 484, left 120, right 160), placed by the
zones rule (`useFormat().zones`, user 2026-09-27): every graphic, lower third included, sits in
the **graphics zone x 120–920, y 250–970**; the **captions band x 120–900, y 1000–1300** is left
for captions only; nothing below y 1436 or in the right 160 px of the lower half. The scan
transitions cover the whole frame (their chapter text stays inside the graphics zone):

| Vertical ID | Layout on vertical |
|---|---|
| `SLA-term-title-left-v`, `-center-v`, `-subtitle-v` | Bracketed block (no panel) at the top of / centred in the graphics zone, headline wraps to 2–4 lines, size fitted to the longest word |
| `SLA-term-lower-third-luisart-left-v`, `-luisart-right-v`, `-guest-v` | At the foot of the graphics zone: bottom edge at y 970 (`bottom` never below 950), x 120–920 |
| `SLA-term-beams-3-logos-v`, `-5-logos-v` | Panel = the graphics zone (800×720): logos in a row on top, beams curve down into the node below |
| `SLA-term-beams-versus-v` | Same panel: column logo A, VS node, logo B |
| `SLA-term-ticker-gain-v`, `-loss-v` | Symbol, price and change on three split-flap rows |
| `SLA-term-ticker-watchlist-v` | Full-width panel, smaller tiles |
| `SLA-term-chart-up-v`, `-down-v` | Chart panel filling the graphics zone (800×720), legend on its own line |
| `SLA-term-checklist-3-steps-v`, `-5-steps-v` | Full-width card at the foot of the graphics zone (bottom edge y 970), larger type |
| `SLA-term-callout-box-v`, `-underline-v` | Region props in 1080×1920 px (defaults inside the graphics zone, labels included) |
| `SLA-term-compare-chatgpt-vs-claude-v`, `-generic-v` | Two compact cards side by side in the graphics zone (each row: label above value), outlined "VS" in the gap |
| `SLA-term-keyword-single-v`, `-stacked-v`, `-stat-v` | Centred in the graphics zone, size fitted to width |
| `SLA-term-transition-scan-v`, `-scan-chapter-v` | Full-frame wipe; chapter text inside the safe box |

On vertical all mono labels are set 1.25× larger. `safeGuide` (all elements, default off) shades
the platform-covered areas in Studio previews; never turn it on for a render.

Logos available (`logos` / `logo` props): chatgpt, claude, gemini, perplexity, deepseek, mistral,
copilot, grok, meta, anthropic, nvidia, cursor, huggingface, midjourney, n8n, make.

Files: `theme.ts` (tokens), `primitives.tsx` (ticks, tags, panels, decrypt, type line, split-flap,
logos, exit wipe, backing), one file per element, `index.tsx` (registrations).

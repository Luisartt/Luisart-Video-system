# Documental — green-screen graphics library

Approved style C (`prototypes/c/`, showcase `SLA-proto-c-documental`) turned into props-driven
elements. Every element is registered twice: horizontal 1920×1080 (`SLA-doc-<element>-<variant>`)
and vertical 1080×1920 for Shorts / Reels / TikTok (`SLA-doc-<element>-<variant>-v`, Studio folder
`documental/vertical`). Both are 30 fps, enter → hold → exit, rendered on pure green `#00FF00` for
chroma keying (H.264 4:4:4, 20 Mb/s). Renders: `out/soyluisart/green/documental/<ID>.mp4` and
`out/soyluisart/green-vertical/documental/<ID>-v.mp4`; overview sheets: `_index.png` in each folder.

**Vertical:** the same component re-lays itself out via `useFormat()` (`../shared/formats.tsx`),
keeping everything inside the vertical safe area (top 250, bottom 484, left 120, right 160) and
placed by the zones rule (`useFormat().zones`, user 2026-09-27): every graphic sits in the
**graphics zone x 120–920, y 250–970** (part-title card, emphasis, big-number with its footnote, the
top-to-bottom timeline, logo network, quote, stamps; lower thirds and the lower part-title at the
zone's foot, bottom edge y 970); only captions use the **captions band x 120–900, y 1000–1300**;
nothing goes below y 1436 or in the right 160 px of the lower half. Part-title words re-flow into
shorter lines and emphasis lines wrap/shrink to the zone width; the vertical logo network is
compact (single centre: satellites on an ellipse as wide as the zone; rivals: centres stacked with
the VS between, satellites to the sides, the first centre's label above it).
`lineY` (timeline) and `bottom` (captions) only apply to horizontal.

**Props every element has:** `backing` (`green` default · `style` = preview over the Documental
look: B-roll/charcoal/map + grain + vignette · `transparent` = for a ProRes alpha render with
`npm run render:alpha`), `preview` (backdrop used by `style`: `charcoal`, `c1-datacenter`,
`c2-ticker`, `map`), `seconds` (clip length), `safeGuide` (Studio preview only: shades the areas the
platform UI covers; keep it off for renders).

**No boxes behind text (user rule, 2026-09-27):** no bar, tab, box or band sits behind any words.
The emphasis bar became a thick accent underline stroke under accent-coloured italic caps, the
bone "PARTE N" / "INVITADA" / timeline tab became a plain kicker (bone caps with short amber
rules), and the source footnote is plain serif type. Text stays legible through its weight, a thin
opaque outline painted under the letters (`outline()` in `primitives.tsx`) and the hard
`theme.ts → shadow`. Logo-network nodes and timeline markers are the diagram and stay.

**Sound (2026-09-27):** every element bakes its own sound effects (`sfx` prop, default on; map in
`theme.ts → sfx`, taken from `media/soyluisart/audio/GUIA-EFECTOS.md`, cue component
`../shared/sfx.tsx`). Each file's measured peak lands on the frame the visual event happens; beds
are trimmed with a 4-frame fade. Part title: click as the kicker wipes in + cinematic boom when the
first word lands. Emphasis: a highlighter stroke as each underline sweeps in + one bass hit when the
last line lands (braam if that line is red). Big number: ticking while it counts, then boom (ka-ching
for money, braam for a fall). Lower third: classic click. Quote: click on the first word. Stamp:
typewriter bed + bell. Timeline: click for the kicker, minimal pop per point. Logo network: sub-boom
on the centre's sonar ring, soft pops for the satellites (≥ 6 frames apart) and the VS. Captions:
no sound per chunk, one sharp pop on the highlighted word. **Whooshes only in the transitions**:
flash = fast whoosh + camera flash on the peak frame, wipe = air sweep, amber wipe = fast swipe.
Renders carry an AAC track.

**Numbers, money and the name:** Mexican format (`500,000`, `7.5`; `formatNum` = `shared/text.ts →
formatMx`); money only in US$ or MXN (the money sample is `US$500,000 M`). Quote authors and
network labels are uppercased in code (`upperKeepName`), so "Luisart" is never uppercased.

**Key-safe rules:** over green everything is fully opaque — the prototype's soft glows became a
tight hard shadow (`theme.ts → shadow`), fades became masked rises / hard steps / clip wipes,
translucent borders and boxes were flattened to opaque colours, and the logo glow is stepped
opaque halo rings plus an expanding "sonar" ring. Grain, vignette, dust, the map and B-roll only
appear with `backing: "style"`. Gemini uses its one-colour mark (the colour sparkle contains
green). The channel name is always "Luisart", never uppercased. Sample figures always carry the
"dato de ejemplo" source.

Files: `theme.ts` (tokens), `primitives.tsx` (frame, backdrops, motion, logos, footnote),
one file per element, `index.tsx` (registers every variant).

| ID | Use | Key props |
|---|---|---|
| `SLA-doc-part-title-one-line` | Chapter card, one title line, "PARTE N" kicker between amber rules | `part`, `lines`, `accent`, `accentColor`, `layout`, `fontSize` |
| `SLA-doc-part-title-two-line` | The prototype's chapter card (two lines) | same |
| `SLA-doc-part-title-lower` | Smaller chapter title in the lower-left third, over the talking head | same (`layout: "lower"`) |
| `SLA-doc-emphasis-yellow` | "SIN FRENOS" amber italic caps + amber underline stroke wiping in, serif subline (no bar behind) | `bars[{text,color}]` (one underlined line each), `subline`, `fontSize`, `position` |
| `SLA-doc-emphasis-red` | Same in red, for warnings | same |
| `SLA-doc-emphasis-stacked` | Two offset underlined lines (amber + red) | same |
| `SLA-doc-big-number-percent` | Big % counting up + label + plain serif source footnote (no box) | `label`, `numbers[{prefix,value,decimals,suffix,caption,color}]`, `fontSize`, `footnote`, `source` |
| `SLA-doc-big-number-money` | Money figure ("US$500,000 M") | same |
| `SLA-doc-big-number-versus` | Two figures side by side with captions | same (two `numbers`) |
| `SLA-doc-big-number-drop` | Negative figure in red ("−38 %") | same |
| `SLA-doc-logo-network-openai-center` | OpenAI in the centre, 4 linked rivals | `title`, `centers[{logo,label}]`, `satellites[{logo,label,to}]` |
| `SLA-doc-logo-network-5-logos` | Centre + 5 satellites | same |
| `SLA-doc-logo-network-rivals` | Two centres with a red "VS" link | same + `vsLabel` |
| `SLA-doc-lower-third-luisart-left` | "Luisart · IA · finanzas · negocios", bottom-left | `name`, `role`, `tab`, `side`, `nameSize` |
| `SLA-doc-lower-third-luisart-right` | Same, bottom-right | same |
| `SLA-doc-lower-third-guest` | Guest name with an "INVITADA" kicker (plain caps + amber rule, no tab) | same |
| `SLA-doc-quote-short` | Short serif italic quote + attribution | `quote`, `author`, `role`, `side`, `fontSize`, `maxWidth`, `framesPerWord` |
| `SLA-doc-quote-long` | Long quote (smaller type) | same |
| `SLA-doc-stamp-place-year` | "SAN FRANCISCO · 2015" typed in, top-left | `text`, `sub`, `position`, `fontSize`, `framesPerChar` |
| `SLA-doc-stamp-date` | Date + serif context line | same |
| `SLA-doc-stamp-chapter` | "CAPÍTULO 3 · EL DESPEGUE", bottom-left | same |
| `SLA-doc-timeline-3-points` | Timeline with 3 years, title as a plain kicker | `title`, `points[{year,label}]`, `highlight`, `accentColor`, `lineY`, `segmentFrames` |
| `SLA-doc-timeline-5-points` | Timeline with 5 years | same |
| `SLA-doc-captions-highlight-amber` | Word-by-word caps captions, keyword in amber | `text`, `highlight`, `highlightStyle`, `accentColor`, `wordsPerPage`, `framesPerWord`, `fontSize`, `bottom` |
| `SLA-doc-captions-highlight-red` | Same, keyword in red with a hard red underline (no block behind it since 2026-09-27) | same (`highlightStyle: "underline"`) |
| `SLA-doc-transition-flash` | Bone flash cut (4 solid frames, peak at frame 15) | `kind`, `at` |
| `SLA-doc-transition-wipe` | Charcoal panel wipe with amber edge, covers at frame 15 | `kind`, `at`, `panel`, `direction` |
| `SLA-doc-transition-wipe-amber` | Amber panel wipe, right → left | same |

Every ID above also exists as a vertical composition with the same props: append `-v` (e.g.
`SLA-doc-part-title-two-line-v`, `SLA-doc-lower-third-luisart-left-v`, `SLA-doc-transition-wipe-v`) — 28
vertical IDs in total.

## Vertical IDs (1080×1920)

- **big-number**: `SLA-doc-big-number-percent-v`, `SLA-doc-big-number-money-v`, `SLA-doc-big-number-versus-v`, `SLA-doc-big-number-drop-v`
- **captions**: `SLA-doc-captions-highlight-amber-v`, `SLA-doc-captions-highlight-red-v`
- **emphasis**: `SLA-doc-emphasis-yellow-v`, `SLA-doc-emphasis-red-v`, `SLA-doc-emphasis-stacked-v`
- **logo-network**: `SLA-doc-logo-network-openai-center-v`, `SLA-doc-logo-network-5-logos-v`, `SLA-doc-logo-network-rivals-v`
- **lower-third**: `SLA-doc-lower-third-luisart-left-v`, `SLA-doc-lower-third-luisart-right-v`, `SLA-doc-lower-third-guest-v`
- **part-title**: `SLA-doc-part-title-one-line-v`, `SLA-doc-part-title-two-line-v`, `SLA-doc-part-title-lower-v`
- **quote**: `SLA-doc-quote-short-v`, `SLA-doc-quote-long-v`
- **stamp**: `SLA-doc-stamp-place-year-v`, `SLA-doc-stamp-date-v`, `SLA-doc-stamp-chapter-v`
- **timeline**: `SLA-doc-timeline-3-points-v`, `SLA-doc-timeline-5-points-v`
- **transition**: `SLA-doc-transition-flash-v`, `SLA-doc-transition-wipe-v`, `SLA-doc-transition-wipe-amber-v`

#!/usr/bin/env node
// Token-driven renderer for Instagram carousels (1080x1350, 4:5) and stories (1080x1920, 9:16).
// Reads a deck (JSON) + your design tokens and writes PNG slides (and, with --animate, short MP4s).
//
// Usage:
//   node channels/_template/social/render_social.cjs --deck channels/_template/social/example-carousel.json [--out out/me/carousels/x]
//        [--tokens brand/design-system/tokens.json] [--only 3] [--animate [--seconds 5]] [--guides]
//   --only N     render just slide N (fast check)        --guides  draw the safe zones / sticker areas (preview only)
//   --animate    also write NN.mp4 (30 fps, silent): everything is visible from frame 0 (faded) and finishes entering in < 1 s
//
// Deck format: { "kind": "carousel" | "story", "series": "PART 1", "handle": "@you", "slides": [ { "type": ..., ... } ] }
//   carousel types: hook {title, note}, context {title, note}, item {n, title, body, proof}, stat {value, label, note},
//                   compare {title, a:{name,value,unit}, b:{...}, footnote}, list {title, items[]}, cta {keyword, line, save}
//   story types   : cover {kicker, title}, stat {value, label, note}, quote {text, by}, poll {question, a, b},
//                   cta {line, button}
//   In any text, *word* is drawn in the accent colour. Numbers in examples: add "example": "example data".
const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");
const { chromium } = require("playwright");

const arg = (n, d = null) => { const i = process.argv.indexOf("--" + n); return i > -1 ? (process.argv[i + 1] && !process.argv[i + 1].startsWith("--") ? process.argv[i + 1] : true) : d; };
const ROOT = path.resolve(__dirname, "..", "..", "..");
const deckPath = arg("deck");
if (!deckPath || deckPath === true) { console.log("Missing --deck <file.json> (see the header of this file)"); process.exit(1); }
const deck = JSON.parse(fs.readFileSync(deckPath, "utf8"));
const tokPath = arg("tokens") || [path.join(ROOT, "brand/design-system/tokens.json"), path.join(ROOT, "brand/design-system/tokens.example.json")].find(fs.existsSync);
const T0 = JSON.parse(fs.readFileSync(tokPath, "utf8"));
const T = {
  color: { background: "#FFFFFF", surface: "#F4F4F6", ink: "#111111", muted: "#6B7280", accent: "#2F6BFF", accent2: "#B07800", positive: "#1E8A53", negative: "#E5484D", line: "#111111", ...T0.color },
  font: { heading: { family: "Inter Tight", weight: 700 }, body: { family: "Inter", weight: 500 }, accent: { family: "Shadows Into Light Two", weight: 400 }, mono: { family: "Space Mono", weight: 700 }, ...T0.font },
  radius: { card: 0, ...T0.radius }, border: T0.border ?? 4, shadow: { x: 9, y: 9, color: "#D6D6D6", ...T0.shadow },
  safe: { story: { top: 250, bottom: 1600 }, ...T0.safe }, social: { carouselFrame: 0.84, handle: "@yourbrand", series: "PART 1", ...T0.social },
};
const kind = deck.kind === "story" ? "story" : "carousel";
const W = 1080, H = kind === "story" ? 1920 : 1350;
const handle = deck.handle || T.social.handle, series = deck.series || T.social.series;
const total = deck.slides.length;
const outDir = arg("out") && arg("out") !== true ? arg("out") : path.join(ROOT, "out", "social", path.basename(deckPath, ".json"));
fs.mkdirSync(outDir, { recursive: true });

const esc = (s) => String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const rich = (s) => esc(s).replace(/\*([^*]+)\*/g, '<span class="ac">$1</span>').replace(/\n/g, "<br>");
const fam = (r) => `"${T.font[r].family}"`;
const gf = Object.values(T.font).map((f) => `family=${encodeURIComponent(f.family).replace(/%20/g, "+")}:wght@${f.weight}`).join("&");

const css = `
@import url("https://fonts.googleapis.com/css2?${gf}&display=swap");
:root { --bg:${T.color.background}; --surface:${T.color.surface}; --ink:${T.color.ink}; --muted:${T.color.muted}; --ac:${T.color.accent}; --ac2:${T.color.accent2}; --line:${T.color.line}; --neg:${T.color.negative}; --pos:${T.color.positive};
  --bd:${T.border}px; --r:${T.radius.card}px; --sh:${T.shadow.x}px ${T.shadow.y}px 0 ${T.shadow.color}; }
* { box-sizing: border-box; margin: 0; }
body { width:${W}px; height:${H}px; overflow:hidden; background:var(--bg); font-family:${fam("body")}, sans-serif; color:var(--ink); }
.marco { position:relative; width:${W}px; height:${H}px; display:flex; align-items:center; justify-content:center;
  background-color:var(--bg); background-image:radial-gradient(circle, ${T.color.line}22 2.5px, transparent 3px); background-size:64px 64px; }
.slide { position:relative; flex:none; width:${W}px; height:${H}px; ${kind === "carousel" ? `transform:scale(${T.social.carouselFrame});` : ""} }
.ac { color:var(--ac); }
h1, h2 { font-family:${fam("heading")}, sans-serif; font-weight:${T.font.heading.weight}; letter-spacing:-.02em; line-height:1.03; }
.note { font-family:${fam("accent")}, cursive; font-weight:${T.font.accent.weight}; color:var(--muted); line-height:1.15; }
.lab { font-family:${fam("mono")}, monospace; font-weight:${T.font.mono.weight}; letter-spacing:.04em; }
.card { background:var(--surface); border:var(--bd) solid var(--line); border-radius:var(--r); box-shadow:var(--sh); }
.chip { display:inline-block; align-self:flex-start; background:var(--ac); color:#fff; border:var(--bd) solid var(--line); border-radius:var(--r); padding:4px 22px; font-size:40px; }
.top { position:absolute; left:90px; right:90px; top:130px; display:flex; justify-content:space-between; font-size:32px; }
.top .serie::before { content:""; display:inline-block; width:18px; height:18px; background:var(--ac); margin-right:14px; }
.pie { position:absolute; left:90px; right:90px; bottom:130px; display:flex; justify-content:space-between; align-items:center; }
.handle { font-size:30px; padding:8px 22px; border:var(--bd) solid var(--line); border-radius:999px; background:var(--bg); }
.hint { font-size:32px; color:var(--ac); }
.body { position:absolute; left:90px; right:90px; top:230px; bottom:230px; display:flex; flex-direction:column; justify-content:center; gap:40px; }
.body h1 { font-size:${Math.round((T0.type?.title ?? 96) * 1.3)}px; } .body h2 { font-size:${T0.type?.title ?? 96}px; }
.body .note { font-size:58px; } .body p { font-size:46px; line-height:1.3; }
.num-big { font-family:${fam("heading")}, sans-serif; font-weight:${T.font.heading.weight}; font-size:${(T0.type?.number ?? 160) * 1.25}px; line-height:1; }
.tiles { display:flex; gap:32px; } .tile { flex:1; padding:28px; } .tile b { display:block; font-family:${fam("heading")}, sans-serif; font-size:84px; margin-top:10px; }
.tile .nm { font-size:38px; font-family:${fam("heading")}, sans-serif; } .bar { height:120px; display:flex; align-items:flex-end; margin-top:14px; } .bar i { display:block; width:100%; border:var(--bd) solid var(--line); }
ul.list { list-style:none; padding:0; display:flex; flex-direction:column; gap:26px; } ul.list li { font-size:48px; line-height:1.2; } ul.list li::before { content:""; display:inline-block; width:20px; height:20px; margin-right:22px; background:var(--ac); }
.ex { font-size:28px; color:var(--muted); }
.cta-word { font-family:${fam("mono")}, monospace; font-weight:${T.font.mono.weight}; font-size:130px; padding:8px 44px; background:var(--ac); color:#fff; border:var(--bd) solid var(--line); border-radius:var(--r); box-shadow:var(--sh); align-self:flex-start; }
.story .body { top:${T.safe.story.top}px; bottom:${H - T.safe.story.bottom}px; left:80px; right:80px; } .story .body h1 { font-size:${Math.round((T0.type?.title ?? 96) * 1.5)}px; } .story .body p { font-size:54px; }
.poll { display:flex; flex-direction:column; gap:22px; } .poll .opt { padding:30px; font-size:56px; font-family:${fam("heading")}, sans-serif; text-align:center; }
.guide { position:absolute; left:0; right:0; border-top:3px dashed #e5484d; font:22px monospace; color:#e5484d; }
.sticker { align-self:stretch; height:170px; border:3px dashed var(--ac); border-radius:24px; display:flex; align-items:center; justify-content:center; color:var(--ac); font-size:34px; }
@keyframes rise { from { opacity:.3; transform:translateY(26px); } to { opacity:1; transform:none; } }
[data-a] { animation: rise .35s cubic-bezier(.2,.7,.2,1) both; animation-delay: calc(var(--i, 0) * 90ms); }
`;

const foot = (n) => `<div class="top lab" data-a><span class="serie">${esc(series)}</span><span>${String(n).padStart(2, "0")} / ${String(total).padStart(2, "0")}</span></div>
  <div class="pie" data-a><span class="handle lab">${esc(handle)}</span><span class="hint lab">${n === total ? "SAVE ✓" : "SWIPE →"}</span></div>`;
const ex = (s) => (s.example ? `<div class="ex lab" data-a>${esc(s.example)}</div>` : "");
const body = (inner) => `<div class="body">${inner}</div>`;

const C = {
  hook: (s, n) => foot(n) + body(`<h1 data-a>${rich(s.title)}</h1>${s.note ? `<div class="note" data-a>${rich(s.note)}</div>` : ""}`),
  context: (s, n) => foot(n) + body(`<h2 data-a>${rich(s.title)}</h2>${s.note ? `<div class="note" data-a>${rich(s.note)}</div>` : ""}${ex(s)}`),
  item: (s, n) => foot(n) + body(`<span class="chip lab" data-a>${esc(s.n ?? n - 1)}</span><h2 data-a>${rich(s.title)}</h2><p data-a>${rich(s.body || "")}</p>${s.proof ? `<div class="card" data-a style="padding:34px 40px;font-size:40px">${rich(s.proof)}</div>` : ""}${ex(s)}`),
  stat: (s, n) => (kind === "story" ? "" : foot(n)) + body(`<div class="card" data-a style="padding:48px 44px"><div class="num-big">${esc(s.value)}</div><p style="color:var(--muted)">${esc(s.label)}</p></div>${s.note ? `<div class="note" data-a>${rich(s.note)}</div>` : ""}${ex(s)}`),
  compare: (s, n) => {
    const max = Math.max(s.a.value, s.b.value);
    const tile = (x, col) => `<div class="card tile" data-a><div class="nm">${esc(x.name)}</div><div class="bar"><i style="height:${Math.max(6, (x.value / max) * 100)}%;background:${col}"></i></div><b>${esc(x.value)}${esc(x.unit || "")}</b></div>`;
    return foot(n) + body(`<h2 data-a>${rich(s.title)}</h2><div class="tiles">${tile(s.a, "var(--ac2)")}${tile(s.b, "var(--ac)")}</div>${s.footnote ? `<div class="note" data-a>${rich(s.footnote)}</div>` : ""}${ex(s)}`);
  },
  list: (s, n) => foot(n) + body(`<h2 data-a>${rich(s.title)}</h2><ul class="list">${(s.items || []).map((i) => `<li data-a>${rich(i)}</li>`).join("")}</ul>${ex(s)}`),
  cta: (s, n) => (kind === "story" ? "" : foot(n)) + body(kind === "story"
    ? `<h1 data-a>${rich(s.line)}</h1><div class="sticker lab" data-a>${esc(s.button || "link sticker here")}</div>`
    : `<h2 data-a>${rich(s.line || "Want the full list?")}</h2><div class="cta-word" data-a>${esc(s.keyword || "KEYWORD")}</div><div class="note" data-a>${rich(s.save || "Save this post ✓")}</div>`),
  cover: (s) => body(`${s.kicker ? `<div class="note" data-a style="font-size:56px">${rich(s.kicker)}</div>` : ""}<h1 data-a>${rich(s.title)}</h1>`),
  quote: (s) => body(`<h1 data-a>“${rich(s.text)}”</h1>${s.by ? `<div class="note" data-a>— ${esc(s.by)}</div>` : ""}`),
  poll: (s) => body(`<h1 data-a style="font-size:84px">${rich(s.question)}</h1><div class="poll"><div class="card opt" data-a>${esc(s.a)}</div><div class="card opt" data-a>${esc(s.b)}</div></div><div class="note" data-a style="font-size:40px">(add the native poll sticker in Instagram over these options)</div>`),
};

function html(s, n, guides) {
  const fn = C[s.type];
  if (!fn) throw new Error(`unknown slide type "${s.type}" (slide ${n})`);
  const g = guides ? (kind === "story" ? `<div class="guide" style="top:${T.safe.story.top}px">safe top</div><div class="guide" style="top:${T.safe.story.bottom}px">safe bottom</div>` : `<div class="guide" style="top:130px">130</div><div class="guide" style="bottom:130px">130</div>`) : "";
  return `<!doctype html><html><head><meta charset="utf-8"><style>${css}</style></head><body><div class="marco"><section class="slide ${kind}">${fn(s, n)}${g}</section></div></body></html>`;
}

(async () => {
  const only = Number(arg("only") || 0), animate = arg("animate"), seconds = Number(arg("seconds") || 5), guides = !!arg("guides");
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
  for (let i = 0; i < total; i++) {
    const n = i + 1;
    if (only && only !== n) continue;
    await page.setContent(html(deck.slides[i], n, guides), { waitUntil: "networkidle" }).catch(() => {});
    await page.evaluate(async () => { await document.fonts.ready; document.querySelectorAll("[data-a]").forEach((e, k) => e.style.setProperty("--i", k)); });
    const name = String(n).padStart(2, "0");
    await page.evaluate(() => document.getAnimations().forEach((a) => { a.pause(); a.currentTime = 10000; }));
    await page.screenshot({ path: path.join(outDir, name + ".png") });
    console.log("wrote", path.join(outDir, name + ".png"));
    if (animate) {
      const fdir = path.join(outDir, "_frames_" + name); fs.mkdirSync(fdir, { recursive: true });
      const frames = Math.round(seconds * 30);
      for (let f = 0; f < frames; f++) {
        await page.evaluate((t) => document.getAnimations().forEach((a) => { a.pause(); a.currentTime = t; }), (f / 30) * 1000);
        await page.screenshot({ path: path.join(fdir, String(f).padStart(4, "0") + ".png") });
      }
      const r = spawnSync("ffmpeg", ["-y", "-v", "error", "-framerate", "30", "-i", path.join(fdir, "%04d.png"), "-c:v", "libx264", "-pix_fmt", "yuv420p", "-crf", "17", path.join(outDir, name + ".mp4")]);
      fs.rmSync(fdir, { recursive: true, force: true });
      console.log(r.status === 0 ? "wrote " + path.join(outDir, name + ".mp4") : "ffmpeg failed: " + String(r.stderr));
    }
  }
  await browser.close();
})().catch((e) => { console.error("ERR", e.message); process.exit(1); });

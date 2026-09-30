import { useCurrentFrame, useVideoConfig } from "remotion";
import { z } from "zod";
import { captionSpot, preferredCaptionY } from "../shared/captionSpot";
import { Stage, Variant, base, baseSchema, useFormat } from "./primitives";
import { piz } from "./theme";

// Word-timed captions (rules of 2026-09-27, CHANNEL.md ★):
//  • ONLY on pure talking-head stretches: never while any graphic is on screen. Pass the graphic
//    windows of the edit in `hide` (seconds); nothing is drawn inside them (and no run shorter
//    than 12 frames is shown between two of them).
//  • Never over the face (forehead, eyes, mouth): pass the take's face box in `face` (canvas px,
//    e.g. from core/scripts/py/face_track.py); the line moves to the spot nearest the caption zone
//    that clears it (shared/captionSpot.ts) — usually above the head. No `face` = caption zone.
//  • In the caption zone by default (vertical y 1000–1300, line centre 1250, x 120–900;
//    horizontal y 820–970), plain white Inter 700 with a thin ink outline + soft shadow, no plate.
// 2–4 words per chunk (a chunk also ends on punctuation or a pause), swapped on a hard cut; the
// active word turns blue. No board mode any more (captions never sit on a board — rule a).
// For per-frame face tracking and graphic windows, edits use the same logic directly (reference:
// videos/2026-09-27-per-barato/scenes/pizarra/captionRule.ts + captionPlace.ts).

const wordSchema = z.object({ text: z.string(), start: z.number(), end: z.number() });
const boxSchema = z.object({ x0: z.number(), y0: z.number(), x1: z.number(), y1: z.number() });
export const captionsSchema = baseSchema.extend({
  words: z.array(wordSchema),
  maxWords: z.number().min(1).max(5),
  highlight: z.boolean().describe("Active word in blue"),
  fontSize: z.number().min(30).max(110),
  offset: z.number().describe("Seconds added to every word time (to sync a clip that starts later)"),
  hide: z.array(z.object({ start: z.number(), end: z.number() })).describe("Seconds with a graphic on screen: no captions there"),
  face: boxSchema.nullable().describe("Face box of the take (canvas px); the caption never covers it"),
});
type Props = z.infer<typeof captionsSchema>;
type Word = z.infer<typeof wordSchema>;

export const chunkWords = (words: Word[], maxWords: number): Word[][] => {
  const chunks: Word[][] = [];
  let cur: Word[] = [];
  words.forEach((w, i) => {
    cur.push(w);
    const next = words[i + 1];
    const punct = /[.,;:?!…]$/.test(w.text);
    const pause = next ? next.start - w.end > 0.35 : true;
    if (cur.length >= maxWords || punct || pause) {
      chunks.push(cur);
      cur = [];
    }
  });
  if (cur.length) chunks.push(cur);
  return chunks;
};

const MIN_SHOW = 12 / 30; // seconds

/** True if time t lies in a clean stretch (outside every `hide` window) at least MIN_SHOW long. */
const clean = (t: number, hide: Props["hide"], from: number, to: number) => {
  if (hide.some((h) => t >= h.start && t < h.end)) return false;
  let a = from;
  let b = to;
  for (const h of hide) {
    if (h.end <= t && h.end > a) a = h.end;
    if (h.start > t && h.start < b) b = h.start;
  }
  return b - a >= MIN_SHOW;
};

export const Captions: React.FC<Props> = (p) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { name, zones } = useFormat(); // horizontal: same rules, caption zone y 820–970
  const t = frame / fps - p.offset;
  const chunks = chunkWords(p.words, p.maxWords);
  let idx = -1;
  chunks.forEach((c, i) => {
    if (t >= c[0].start) idx = i;
  });
  const chunk = idx >= 0 ? chunks[idx] : null;
  const nextStart = chunks[idx + 1]?.[0].start ?? Infinity;
  const until = chunk ? Math.min(nextStart, chunk[chunk.length - 1].end + 0.6) : 0;
  const visible = chunk && t < until && clean(t, p.hide, chunk[0].start, until);
  const text = chunk ? chunk.map((w) => w.text).join(" ") : "";
  const cy = visible ? captionSpot(p.face, text, p.fontSize, name) : null;
  const cap = zones.captions;
  return (
    <Stage backing={p.backing} safeGuide={p.safeGuide}>
      {visible && chunk && cy !== null ? (
        <div
          style={{
            position: "absolute",
            left: cap.x,
            width: cap.w,
            top: cy,
            transform: "translateY(-50%)",
            textAlign: "center",
            font: `700 ${p.fontSize}px ${piz.font.caption}`,
            letterSpacing: "-0.015em",
            lineHeight: 1.15,
            WebkitTextStroke: `${Math.round(p.fontSize * 0.125)}px ${piz.color.ink}`,
            paintOrder: "stroke fill",
            textShadow: p.backing === "green" ? undefined : "0 2px 10px rgba(0,0,0,0.42)",
          }}
        >
          {chunk.map((w, i) => {
            const nextW = chunk[i + 1];
            const active = p.highlight && t >= w.start && (nextW ? t < nextW.start : true);
            return (
              <span key={i} style={{ color: active ? piz.color.accent : piz.color.white }}>
                {w.text}
                {i < chunk.length - 1 ? " " : ""}
              </span>
            );
          })}
        </div>
      ) : null}
    </Stage>
  );
};

// Sample words: the first 9 s of the user's test recording (per-barato), Whisper word timings.
export const SAMPLE_WORDS: Word[] = [
  { text: "Me", start: 0, end: 0.3 },
  { text: "llevo", start: 0.3, end: 0.5 },
  { text: "más", start: 0.5, end: 0.72 },
  { text: "de", start: 0.72, end: 0.8 },
  { text: "dos", start: 0.8, end: 0.96 },
  { text: "años", start: 0.96, end: 1.34 },
  { text: "estudiando", start: 1.34, end: 1.96 },
  { text: "entender", start: 1.96, end: 2.32 },
  { text: "esto,", start: 2.32, end: 2.92 },
  { text: "y", start: 2.92, end: 3.16 },
  { text: "es", start: 3.16, end: 3.28 },
  { text: "que", start: 3.28, end: 3.36 },
  { text: "una", start: 3.36, end: 3.52 },
  { text: "acción,", start: 3.52, end: 4.12 },
  { text: "cuando", start: 4.12, end: 5.06 },
  { text: "está", start: 5.06, end: 5.3 },
  { text: "barata,", start: 5.3, end: 5.94 },
  { text: "no", start: 5.94, end: 6.34 },
  { text: "significa", start: 6.34, end: 6.88 },
  { text: "que", start: 6.88, end: 7.14 },
  { text: "sea", start: 7.14, end: 7.3 },
  { text: "una", start: 7.3, end: 7.44 },
  { text: "buena", start: 7.44, end: 7.64 },
  { text: "inversión.", start: 7.64, end: 8.14 },
];

// The test take's face box (face-track.json of the per-barato A-roll, first seconds, at 100 %).
const SAMPLE_FACE = { x0: 250, y0: 690, x1: 810, y1: 1420 };

const common: Props = {
  ...base("green", 8.5),
  words: SAMPLE_WORDS,
  maxWords: 4,
  highlight: true,
  fontSize: piz.size.caption,
  offset: 0,
  hide: [],
  face: null,
};

// No board variants (captions never sit on a board). `aroll-preview` shows the face-aware placement
// over the test take; `aroll-hide` shows the graphics gate (a behind-head word from 0.8–3.4 s).
export const captionsVariants: Variant<Props>[] = [
  { id: "aroll", props: common, horizontal: true },
  { id: "aroll-preview", props: { ...common, backing: "aroll", face: SAMPLE_FACE } },
  { id: "aroll-hide", props: { ...common, backing: "aroll", face: SAMPLE_FACE, hide: [{ start: 0.8, end: 3.4 }, { start: 5.3, end: 8.5 }] } },
];

export const CAPTION_LINE_Y = preferredCaptionY;

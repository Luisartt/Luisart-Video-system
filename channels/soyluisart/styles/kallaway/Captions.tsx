import { useCurrentFrame, useVideoConfig } from "remotion";
import { z } from "zod";
import { captionSpot, type FaceBox } from "../shared/captionSpot";
import { ZONES, type FormatName } from "../shared/formats";
import { kalGeometry } from "./Layout";
import { Stage, TEST_FACE, Variant, WordTone, base, baseSchema, fitSize, mapBox, textOnDark, toneFont, toneOf, useFormat } from "./primitives";
import { kal } from "./theme";

// kal-captions — his two caption sizes and nothing else (ANALISIS §7.2, user decision 2026-09-28):
//  • seam: ~2 words (max 3, breaks on punctuation or a pause), Inter 700 46 px, white with a soft
//    shadow, NO box, centred just under the split seam (vertical y ≈ 1040, above the head).
//    Continuous on the split even with an image on top (the image is B-roll, not text) — except
//    while the top half shows text that repeats the speech (headline of the same words, counter,
//    kinetic words): the edit passes those windows in `hide`.
//  • face-word: ONE giant word (Inter 700 ≈ 165 px) per spoken word on face shots, dry cut on the
//    word, no karaoke. Emotion words switch to Playfair Display Italic, key words to light blue
//    #7FA6FF (his gold), "bad" words to red. Face-aware (shared/captionSpot.ts): on the chest under
//    the chin when there is room, otherwise ABOVE the head — never on the forehead, eyes or mouth.
// No sound on captions.

export type Word = { text: string; start: number; end: number };
export type Unit = { text: string; from: number; to: number; tone: WordTone }; // frames
export type Emphasis = { serif?: string[]; key?: string[]; alert?: string[] };

const clean = (s: string) => s.replace(/^[.,;:]+|[.,;:]+$/g, "");
const letters = (s: string) => Array.from(s.replace(/[^\p{L}\p{N}]/gu, "")).length;
/** Short function words ("el", "de", "por", "con"…) weigh half a word; numbers weigh a full one. */
const isShort = (s: string) => letters(s) <= 3 && !/\d/.test(s);
const weight = (s: string) => (isShort(s) ? 0.5 : 1);

/** Seam blocks: about 2 words (a short function word weighs half; max 3 words, 16 characters),
 *  breaking after punctuation or a pause > 0.3 s. A block never ends on a dangling short word ("el",
 *  "por"): it moves to the next block ("el precio / por acción"). Each block holds until the next. */
export const seamUnits = (words: Word[], fps: number, holdFrames = 8): Unit[] => {
  const out: Unit[] = [];
  let cur: Word[] = [];
  const flush = (list: Word[]) => {
    if (!list.length) return;
    out.push({ text: list.map((w) => clean(w.text)).join(" "), from: Math.round(list[0].start * fps), to: Math.round(list[list.length - 1].end * fps), tone: "plain" });
  };
  words.forEach((w, i) => {
    const n = cur.reduce((s, x) => s + weight(x.text), 0) + weight(w.text);
    const chars = cur.reduce((s, x) => s + clean(x.text).length + 1, 0) + clean(w.text).length;
    if (cur.length && (n > 2 || cur.length >= 3 || chars > 16)) {
      const last = cur[cur.length - 1];
      if (cur.length > 1 && isShort(last.text) && !/[.,;:?!…]$/.test(last.text)) {
        flush(cur.slice(0, -1));
        cur = [last];
      } else {
        flush(cur);
        cur = [];
      }
    }
    cur.push(w);
    const next = words[i + 1];
    if (/[.,;:?!…]$/.test(w.text) || !next || next.start - w.end > 0.3) {
      flush(cur);
      cur = [];
    }
  });
  flush(cur);
  return out.map((u, i) => ({ ...u, to: Math.min(out[i + 1]?.from ?? Infinity, u.to + holdFrames) }));
};

/** Face words: one per spoken word, from its first frame to the next word's (hold ≤ 10 f after the
 *  last). Words shorter than `minFrames` are skipped (the previous word holds): no 1–3 f flashes. */
export const faceWordUnits = (words: Word[], fps: number, lists: Emphasis, minFrames = 4, holdFrames = 10): Unit[] => {
  const raw = words.map((w) => ({ text: clean(w.text), from: Math.round(w.start * fps), end: Math.round(w.end * fps), tone: toneOf(w.text, lists) }));
  const out: Unit[] = [];
  raw.forEach((w, i) => {
    const nextFrom = raw[i + 1]?.from ?? w.end + holdFrames;
    const to = Math.min(nextFrom, Math.max(w.end, w.from + minFrames) + holdFrames);
    if (to - w.from < minFrames && out.length) {
      out[out.length - 1].to = to; // too short to read: the previous word holds
      return;
    }
    out.push({ text: w.text, from: w.from, to, tone: w.tone });
  });
  return out;
};

/** Size of a giant word so it fits the caption zone width. */
export const faceWordSize = (text: string, tone: WordTone, fmt: FormatName = "vertical", max?: number) =>
  fitSize(text, ZONES[fmt].captions.w - 30, max ?? (fmt === "vertical" ? kal.size.faceWord : 130), tone);

/** Line centre for a giant word that clears `face` (screen px). If it doesn't fit at full size the
 *  word shrinks in steps (to 80 %); cy is null only if even that doesn't fit (reframe the shot). */
export const faceWordSpot = (face: FaceBox | null, text: string, tone: WordTone, fmt: FormatName = "vertical") => {
  const full = faceWordSize(text, tone, fmt);
  for (const k of [1, 0.93, 0.86, 0.8]) {
    const size = faceWordSize(text, tone, fmt, Math.floor(full * k));
    const cy = captionSpot(face, text, tone === "serif" ? size * 1.06 : size, fmt);
    if (cy !== null) return { cy, size };
  }
  return { cy: null, size: full };
};

/** The giant word (centred in the caption zone's width, like captionRect). */
export const FaceWord: React.FC<{ text: string; tone: WordTone; cy: number; size: number; fmt?: FormatName }> = ({ text, tone, cy, size, fmt = "vertical" }) => {
  const cap = ZONES[fmt].captions;
  return (
    <div
      style={{
        position: "absolute",
        left: cap.x,
        width: cap.w,
        top: cy,
        transform: "translateY(-50%)",
        textAlign: "center",
        whiteSpace: "nowrap",
        lineHeight: 1.1,
        ...toneFont(tone, size),
        ...textOnDark(tone, true),
      }}
    >
      {text}
    </div>
  );
};

/** The small seam caption. `outline` adds a thin ink stroke (over a light image). */
export const SeamCaption: React.FC<{ text: string; cx: number; cy: number; maxW: number; size?: number; outline?: boolean }> = ({ text, cx, cy, maxW, size = kal.size.seam, outline = false }) => (
  <div
    style={{
      position: "absolute",
      left: cx - maxW / 2,
      width: maxW,
      top: cy,
      transform: "translateY(-50%)",
      textAlign: "center",
      whiteSpace: "nowrap",
      fontFamily: kal.font.sans,
      fontWeight: 700,
      fontSize: size,
      letterSpacing: "-0.01em",
      lineHeight: 1.15,
      ...textOnDark("plain", false, outline ? 2 : 0),
    }}
  >
    {text}
  </div>
);

// ── Showcase element ───────────────────────────────────────────────────────────────────────────
const wordSchema = z.object({ text: z.string(), start: z.number(), end: z.number() });
const boxSchema = z.object({ x0: z.number(), y0: z.number(), x1: z.number(), y1: z.number() });
export const captionsSchema = baseSchema.extend({
  mode: z.enum(["seam", "face-word"]),
  words: z.array(wordSchema),
  serif: z.array(z.string()).describe("Emotion words → Playfair Display Italic"),
  key: z.array(z.string()).describe("Key words → light blue #7FA6FF"),
  alert: z.array(z.string()).describe("'Bad' words → red"),
  face: boxSchema.nullable().describe("face-word: the face box on screen (canvas px); the word never covers it"),
  hide: z.array(z.object({ start: z.number(), end: z.number() })).describe("Seconds where the top shows text that repeats the speech: no caption"),
});
type Props = z.infer<typeof captionsSchema>;

export const KalCaptions: React.FC<Props> = (p) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { name, isVertical } = useFormat();
  const t = frame / fps;
  const hidden = p.hide.some((h) => t >= h.start && t < h.end);
  const units = p.mode === "seam" ? seamUnits(p.words, fps) : faceWordUnits(p.words, fps, { serif: p.serif, key: p.key, alert: p.alert });
  const u = hidden ? null : units.find((x) => frame >= x.from && frame < x.to) ?? null;
  const g = kalGeometry(isVertical);
  let body: React.ReactNode = null;
  if (u && p.mode === "seam") body = <SeamCaption text={u.text} cx={g.seamCaption.cx} cy={g.seamCaption.cy} maxW={g.seamCaption.maxW} />;
  if (u && p.mode === "face-word") {
    const spot = faceWordSpot(p.face, u.text, u.tone, name);
    if (spot.cy !== null) body = <FaceWord text={u.text} tone={u.tone} cy={spot.cy} size={spot.size} fmt={name} />;
  }
  return (
    <Stage backing={p.backing} safeGuide={p.safeGuide}>
      {body}
    </Stage>
  );
};

// Sample: the first 9 s of the user's test take (Whisper word timings).
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

const common: Props = {
  ...base("green", 8.5),
  mode: "seam",
  words: SAMPLE_WORDS,
  serif: ["significa", "inversión"],
  key: ["barata", "años"],
  alert: [],
  face: null,
  hide: [],
};

// The face box on screen for the showcase = the test take's box as the face layout shows it
// (vertical 92 % from the bottom centre; horizontal the centred figure at 0.5625).
const faceV = mapBox(TEST_FACE, kalGeometry(true).facePlace(TEST_FACE));
const faceH = { x0: 656 + TEST_FACE.x0 * 0.5625, y0: TEST_FACE.y0 * 0.5625, x1: 656 + TEST_FACE.x1 * 0.5625, y1: TEST_FACE.y1 * 0.5625 };

export const captionsVariants: Variant<Props>[] = [
  { id: "seam", props: common, horizontal: true },
  { id: "face-word", props: { ...common, mode: "face-word", face: faceV }, horizontal: true },
];
/** Horizontal showcases use the horizontal face box. */
export const captionsVariantsH = captionsVariants.map((v) => (v.props.mode === "face-word" ? { ...v, props: { ...v.props, face: faceH } } : v));

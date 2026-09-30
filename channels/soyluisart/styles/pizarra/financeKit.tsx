import { Img, useCurrentFrame } from "remotion";
import { z } from "zod";
import { mascotSrc } from "./Mascot";
import { MASCOTS, MASCOT_EXPRESSIONS, MascotExpression } from "./mascotIndex";
import { MarkerStroke, roughArrow } from "./marker";
import { Drop, Sfx, TypeOn, useFormat } from "./primitives";
import { piz } from "./theme";

// Shared helpers for the finance / stock-exchange / CFA elements (Candles, Ticker, Donut, Gauge,
// Formula, ExamQuestion, CurveChart, Snowball; 2026-09-29). Layouts are drawn straight inside the
// graphics zone (vertical x 120–920 / y 250–970, horizontal x 140–1780 / y 90–790) — no ZoneFit
// scaling — so pixel art and mascots stay on whole pixels.

export const SAMPLE = "dato de ejemplo";

/** Format info + the graphics zone box of the current canvas. */
export const useZone = () => {
  const f = useFormat();
  return { ...f, z: f.zones.graphics };
};

/** Font size so `text` fits `width` on one line (average glyph ≈ ratio × size). */
export const fitSize = (text: string, width: number, max: number, ratio = 0.56) =>
  Math.max(24, Math.min(max, Math.floor(width / (Math.max(1, Array.from(text).length) * ratio))));

// ── Micro-motion (rule i): same maths as the per-barato edit's motion.tsx ─────────────────────────
/** Gentle breathing after an element lands (scale 1 ↔ 1 + amp, ~1.5 s period). */
export const Breathe: React.FC<{ at: number; amp?: number; period?: number; children: React.ReactNode; style?: React.CSSProperties }> = ({
  at,
  amp = 0.035,
  period = 45,
  children,
  style,
}) => {
  const frame = useCurrentFrame();
  const t = Math.max(0, frame - at - 6);
  const s = 1 + amp * 0.5 * (1 - Math.cos((2 * Math.PI * t) / period));
  return <div style={{ transform: `scale(${s.toFixed(4)})`, ...style }}>{children}</div>;
};

/** Idle float (±px, ~1 s period). `whole` rounds to integer pixels (pixel art). */
export const Float: React.FC<{ px?: number; period?: number; phase?: number; whole?: boolean; children: React.ReactNode; style?: React.CSSProperties }> = ({
  px = 5,
  period = 34,
  phase = 0,
  whole = false,
  children,
  style,
}) => {
  const frame = useCurrentFrame();
  const y = px * Math.sin((2 * Math.PI * (frame + phase)) / period);
  return <div style={{ transform: `translateY(${whole ? Math.round(y) : y.toFixed(2)}px)`, ...style }}>{children}</div>;
};

// ── Mascots ───────────────────────────────────────────────────────────────────────────────────
export const mascotField = z
  .string()
  .refine((k) => k in MASCOTS, "Unknown mascot key (see mascotIndex.ts)")
  .describe("Mascot key from mascotIndex.ts (e.g. f08-toro, termometro-base, bit-cfa-base)");
export const exprField = z.enum(MASCOT_EXPRESSIONS);
export type Face = { expr: MascotExpression; at: number };

/** Mascot sprite (256 px PNG on a 32-px art grid → `size` should be a multiple of 32 so art
 *  pixels stay whole). Drops in at `at`, bobs one art pixel every 19 f (like Mascot.tsx), and
 *  swaps face in a single frame at each `faces[i].at` (a reaction on a beat). */
export const MascotSprite: React.FC<{ character: string; faces: Face[]; size: number; at: number; flip?: boolean; style?: React.CSSProperties }> = ({
  character,
  faces,
  size,
  at,
  flip = false,
  style,
}) => {
  const frame = useCurrentFrame();
  const face = [...faces].sort((a, b) => a.at - b.at).filter((f) => frame >= f.at).pop() ?? faces[0];
  const bob = Math.floor(frame / 19) % 2 === 0 ? 0 : -Math.max(1, Math.round(size / 32));
  return (
    <Drop at={at} style={style}>
      <Img
        src={mascotSrc(character, face.expr)}
        style={{ width: size, height: size, objectFit: "contain", imageRendering: "pixelated", display: "block", transform: `translateY(${bob}px)${flip ? " scaleX(-1)" : ""}` }}
      />
    </Drop>
  );
};

// ── Marker arrow (shaft, then the two-stroke head) — use inside a <MarkerLayer> ───────────────
export const MarkerArrow: React.FC<{
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  at: number;
  seed: string;
  bend?: number;
  frames?: number;
  color?: string;
  width?: number;
  head?: number;
}> = ({ x1, y1, x2, y2, at, seed, bend = 0.2, frames = 10, color = piz.color.accent, width = 8, head = 30 }) => {
  const [shaft, headD] = roughArrow(x1, y1, x2, y2, seed, bend, head);
  return (
    <>
      <MarkerStroke d={shaft} at={at} frames={frames} color={color} width={width} />
      <MarkerStroke d={headD} at={at + frames - 2} frames={5} color={color} width={width} />
    </>
  );
};

// ── Text bits ─────────────────────────────────────────────────────────────────────────────────
/** Centred typed heading at the top of a box + its typing bed (1 char/frame). */
export const ZoneHeading: React.FC<{
  text: string;
  accent: string;
  at: number;
  left: number;
  top: number;
  width: number;
  max: number;
  sfx: boolean;
  accentColor?: string;
  align?: "center" | "left";
}> = ({ text, accent, at, left, top, width, max, sfx, accentColor, align = "center" }) => (
  <>
    <div style={{ position: "absolute", left, top, width, display: "flex", justifyContent: align === "center" ? "center" : "flex-start" }}>
      <TypeOn text={text} accent={accent} accentColor={accentColor} at={at} fontSize={fitSize(text, width, max, 0.6)} align={align} style={{ whiteSpace: "nowrap" }} />
    </div>
    <Sfx kind="type" at={at} frames={Array.from(text).length + 2} on={sfx} />
  </>
);

/** Muted sample-data label ("dato de ejemplo"). */
export const SourceLabel: React.FC<{ text: string; left: number; top: number; width: number; align?: "left" | "center" | "right"; size?: number }> = ({
  text,
  left,
  top,
  width,
  align = "center",
  size = 26,
}) => (
  <div style={{ position: "absolute", left, top, width, textAlign: align, font: `500 ${size}px ${piz.font.caption}`, color: piz.color.muted, lineHeight: 1.2 }}>{text}</div>
);

// ── Pixel bits ────────────────────────────────────────────────────────────────────────────────
export const PIXEL_CURSOR = [
  "K.........",
  "KK........",
  "KWK.......",
  "KWWK......",
  "KWWWK.....",
  "KWWWWK....",
  "KWWWWWK...",
  "KWWWWWWK..",
  "KWWWWKKKK.",
  "KWKWWK....",
  "KK.KWWK...",
  "K..KWWK...",
  "....KWWK..",
  "....KKK...",
];
export const PIXEL_UP = ["....K....", "...KBK...", "..KBBBK..", ".KBBBBBK.", "KBBBBBBBK", "KKKKKKKKK"];
export const PIXEL_DOWN = ["KKKKKKKKK", "KRRRRRRRK", ".KRRRRRK.", "..KRRRK..", "...KRK...", "....K...."];
export const PIXEL_FLAT = ["KKKKKKKKK", "KDDDDDDDK", "KDDDDDDDK", "KKKKKKKKK"];

/** Nice axis step for a range split into ~`count` ticks (1, 2, 2.5, 5 × 10^k). */
export const niceStep = (range: number, count = 4) => {
  const raw = range / Math.max(1, count);
  const mag = Math.pow(10, Math.floor(Math.log10(raw)));
  const n = raw / mag;
  return (n <= 1 ? 1 : n <= 2 ? 2 : n <= 2.5 ? 2.5 : n <= 5 ? 5 : 10) * mag;
};

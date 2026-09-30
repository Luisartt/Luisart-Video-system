import { Img, random, useCurrentFrame } from "remotion";
import { z } from "zod";
import { useFormat } from "./primitives";
import { MarkerStroke, roughArrow } from "./marker";
import { mascotSrc } from "./Mascot";
import { MASCOTS, MASCOT_EXPRESSIONS, MascotExpression } from "./mascotIndex";
import { piz } from "./theme";

// Shared helpers for the diagram elements (funnel, flywheel, pyramid, venn, flow, matrix, scale;
// 2026-09-29). Each element lays out on its own design box (w × h, per format) and DiagramBox scales
// it uniformly (never up) and centres it in the graphics zone: vertical x 120–920 / y 250–970,
// horizontal x 140–1780 / y 90–790 (ZONES in shared/formats.tsx). So nothing leaves the zone in either
// format, and every coordinate inside an element is a plain design-box coordinate.

const INSET = 10;

/** Scale + position of a w × h design box fitted into the graphics zone. */
export const useDiagramFit = (w: number, h: number) => {
  const { zones } = useFormat();
  const g = zones.graphics;
  const aw = g.w;
  const ah = g.h - INSET * 2;
  const k = Math.min(1, aw / w, ah / h);
  return { k, left: g.x + (aw - w * k) / 2, top: g.y + INSET + (ah - h * k) / 2 };
};

/** Design box: children use design coordinates (0..w, 0..h). */
export const DiagramBox: React.FC<{ w: number; h: number; children: React.ReactNode }> = ({ w, h, children }) => {
  const { k, left, top } = useDiagramFit(w, h);
  return (
    <div style={{ position: "absolute", left, top, width: w, height: h, transform: `scale(${k.toFixed(4)})`, transformOrigin: "0 0" }}>{children}</div>
  );
};

/** SVG layer covering the design box (marker strokes, shapes). */
export const BoxSvg: React.FC<{ w: number; h: number; children: React.ReactNode }> = ({ w, h, children }) => (
  <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ position: "absolute", left: 0, top: 0, overflow: "visible", pointerEvents: "none" }}>
    {children}
  </svg>
);

/** Absolutely placed block in design coordinates. */
export const At: React.FC<{ x: number; y: number; w?: number; h?: number; children: React.ReactNode; style?: React.CSSProperties }> = ({ x, y, w, h, children, style }) => (
  <div style={{ position: "absolute", left: x, top: y, width: w, height: h, ...style }}>{children}</div>
);

// ── Micro-motion (rule i: nothing static). Same behaviour as the per-barato motion.tsx. ─────────
/** Idle float ±px (~1 s period, phase per element): tags, cards, tokens. */
export const Float: React.FC<{ px?: number; period?: number; phase?: number; children: React.ReactNode; style?: React.CSSProperties }> = ({
  px = 5,
  period = 34,
  phase = 0,
  children,
  style,
}) => {
  const frame = useCurrentFrame();
  const y = px * Math.sin((2 * Math.PI * (frame + phase)) / period);
  return <div style={{ transform: `translateY(${y.toFixed(2)}px)`, ...style }}>{children}</div>;
};

/** Breathing scale at `frame` for a result that landed at `at` (1 before it). */
export const breatheScale = (frame: number, at: number, amp = 0.035, period = 45) =>
  frame < at ? 1 : 1 + amp * 0.5 * (1 - Math.cos((2 * Math.PI * Math.max(0, frame - at - 6)) / period));

/** Breathing after a result lands (scale 1 ↔ 1 + amp, ~1.5 s period). */
export const Breathe: React.FC<{ at: number; amp?: number; period?: number; children: React.ReactNode; style?: React.CSSProperties }> = ({
  at,
  amp = 0.035,
  period = 45,
  children,
  style,
}) => {
  const frame = useCurrentFrame();
  const s = breatheScale(frame, at, amp, period);
  return <div style={{ transform: `scale(${s.toFixed(4)})`, ...style }}>{children}</div>;
};

// ── Mascots (139 pixel characters, mascotIndex.ts) ──────────────────────────────────────────────
export const mascotExprField = z.enum(MASCOT_EXPRESSIONS);
export const mascotKeyField = z
  .string()
  .refine((k) => k === "" || k in MASCOTS, "Unknown mascot key (see mascotIndex.ts)")
  .describe("Mascot key from mascotIndex.ts (e.g. embudo-base, chip-base); empty = none");

/** A mascot PNG, crisp (pixelated), with a stepped 1-art-pixel bob (never a smooth move). */
export const MascotImg: React.FC<{ character: string; expr: MascotExpression; size: number; bob?: boolean; seed?: number }> = ({
  character,
  expr,
  size,
  bob = true,
  seed = 0,
}) => {
  const frame = useCurrentFrame();
  const step = Math.max(1, Math.round(size / 32));
  const bobY = bob ? (Math.floor((frame + seed) / 19) % 2 === 0 ? 0 : -step) : 0;
  return (
    <Img
      src={mascotSrc(character, expr)}
      style={{ display: "block", width: size, height: size, objectFit: "contain", imageRendering: "pixelated", transform: `translateY(${bobY}px)` }}
    />
  );
};

/** Face at `frame` from a list of [fromFrame, expression] swaps (single-frame state swaps). */
export const faceAt = (frame: number, swaps: readonly (readonly [number, MascotExpression])[]) => {
  let e = swaps[0][1];
  for (const [f, x] of swaps) if (frame >= f) e = x;
  return e;
};

// ── Marker arrow: shaft drawn on, then the two-stroke head ─────────────────────────────────────
export const MarkerArrow: React.FC<{
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  at: number;
  seed: string;
  bend?: number;
  head?: number;
  frames?: number;
  color?: string;
  width?: number;
}> = ({ x1, y1, x2, y2, at, seed, bend = 0.2, head = 26, frames = 9, color = piz.color.accent, width = 8 }) => {
  const [shaft, headD] = roughArrow(x1, y1, x2, y2, seed, bend, head);
  return (
    <>
      <MarkerStroke d={shaft} at={at} frames={frames} color={color} width={width} />
      <MarkerStroke d={headD} at={at + frames - 2} frames={4} color={color} width={width} />
    </>
  );
};

/** Big hand-drawn circle: low-frequency wobble (no jitter), ~1.05 turns so the end overlaps the
 *  start like a real marker. roughEllipse's per-point jitter reads jagged at large radii. */
export const handCircle = (cx: number, cy: number, r: number, seed: string, turns = 1.05) => {
  const steps = 120;
  const ph1 = random(`${seed}a`) * Math.PI * 2;
  const ph2 = random(`${seed}b`) * Math.PI * 2;
  const start = -2.1 + random(`${seed}s`) * 0.5;
  let d = "";
  for (let i = 0; i <= steps; i++) {
    const u = i / steps;
    const t = start + u * Math.PI * 2 * turns;
    const k = 1 + 0.014 * Math.sin(2 * t + ph1) + 0.008 * Math.sin(3 * t + ph2) + u * 0.025;
    d += `${i === 0 ? "M" : "L"}${(cx + Math.cos(t) * r * k).toFixed(1)},${(cy + Math.sin(t) * r * k).toFixed(1)} `;
  }
  return d.trim();
};

// ── Text helpers ───────────────────────────────────────────────────────────────────────────────
/** Font size so `text` fits on one line in `maxW` (average glyph ≈ `em` × size), capped at `max`. */
export const fitFont = (text: string, maxW: number, max: number, em = 0.6) => Math.max(18, Math.min(max, Math.floor(maxW / (Array.from(text).length * em))));

/** Longest line of a multi-line string (for fitFont on wrapped labels). */
export const longestLine = (text: string) => text.split("\n").reduce((a, b) => (Array.from(b).length > Array.from(a).length ? b : a), "");

/** Ratio → "25%", "4%", "1.5%", "0.6%", "0.08%" (Mexican format, no trailing zeros). */
export const fmtPct = (ratio: number) => {
  const v = ratio * 100;
  const d = v >= 10 ? 0 : v >= 0.1 ? 1 : 2;
  return `${new Intl.NumberFormat("es-MX", { minimumFractionDigits: 0, maximumFractionDigits: d }).format(v)}%`;
};

/** Tiny pixel person (6×7 art pixels) as SVG rects at (x, y) = top-left, crisp. */
const PERSON = ["..KK..", "..KK..", ".KKKK.", "K.KK.K", "..KK..", ".K..K.", ".K..K."];
export const pixelPerson = (key: string, x: number, y: number, px: number, fill: string) =>
  PERSON.flatMap((row, r) =>
    Array.from(row).map((ch, c) => (ch === "K" ? <rect key={`${key}-${r}-${c}`} x={Math.round(x) + c * px} y={Math.round(y) + r * px} width={px} height={px} fill={fill} /> : null)),
  );

/** Muted sample-data label ("dato de ejemplo"). */
export const SourceLabel: React.FC<{ text: string; size?: number; align?: React.CSSProperties["textAlign"] }> = ({ text, size = 28, align = "left" }) =>
  text ? <div style={{ font: `500 ${size}px ${piz.font.caption}`, color: piz.color.muted, textAlign: align, whiteSpace: "nowrap" }}>{text}</div> : null;

/** Seconds → frames at 30 fps. */
export const sec = (s: number) => Math.round(s * 30);

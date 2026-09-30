import { evolvePath } from "@remotion/paths";
import { interpolate, random, useCurrentFrame } from "remotion";
import { piz } from "./theme";

// Hand-drawn marker strokes for the pizarra: slightly wobbly paths drawn on (stroke-dash) from
// frame `at` over `frames`, round caps, one colour. Paths are generated deterministically (seeded)
// so every render is identical.

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const f1 = (n: number) => n.toFixed(1);

/** Wobbly ellipse: ~1.08 turns so the end overlaps the start like a real marker circle. */
export const roughEllipse = (cx: number, cy: number, rx: number, ry: number, seed: string, turns = 1.08) => {
  const steps = 48;
  const start = -2.2 + random(`${seed}s`) * 0.6;
  let d = "";
  for (let i = 0; i <= steps; i++) {
    const t = start + (i / steps) * Math.PI * 2 * turns;
    const k = 1 + (random(`${seed}${i}`) - 0.5) * 0.05 + (i / steps) * 0.05;
    const x = cx + Math.cos(t) * rx * k;
    const y = cy + Math.sin(t) * ry * k;
    d += `${i === 0 ? "M" : "L"}${f1(x)},${f1(y)} `;
  }
  return d.trim();
};

/** Slightly bowed line from A to B. */
export const roughLine = (x1: number, y1: number, x2: number, y2: number, seed: string, bow = 0.04) => {
  const mx = (x1 + x2) / 2;
  const my = (y1 + y2) / 2;
  const len = Math.hypot(x2 - x1, y2 - y1);
  const nx = -(y2 - y1) / (len || 1);
  const ny = (x2 - x1) / (len || 1);
  const b = (random(seed) - 0.5) * 2 * bow * len;
  return `M${f1(x1)},${f1(y1)} Q${f1(mx + nx * b)},${f1(my + ny * b)} ${f1(x2)},${f1(y2)}`;
};

/** Curved arrow shaft from A to B plus a two-stroke head at B (returned as two paths). */
export const roughArrow = (x1: number, y1: number, x2: number, y2: number, seed: string, bend = 0.25, head = 34) => {
  const mx = (x1 + x2) / 2;
  const my = (y1 + y2) / 2;
  const len = Math.hypot(x2 - x1, y2 - y1);
  const nx = -(y2 - y1) / (len || 1);
  const ny = (x2 - x1) / (len || 1);
  const cx = mx + nx * bend * len;
  const cy = my + ny * bend * len;
  const shaft = `M${f1(x1)},${f1(y1)} Q${f1(cx)},${f1(cy)} ${f1(x2)},${f1(y2)}`;
  const ang = Math.atan2(y2 - cy, x2 - cx);
  const a1 = ang + Math.PI * 0.82 + (random(`${seed}h`) - 0.5) * 0.1;
  const a2 = ang - Math.PI * 0.82;
  const headD = `M${f1(x2 + Math.cos(a1) * head)},${f1(y2 + Math.sin(a1) * head)} L${f1(x2)},${f1(y2)} L${f1(x2 + Math.cos(a2) * head)},${f1(y2 + Math.sin(a2) * head)}`;
  return [shaft, headD];
};

/** Tick mark inside a box of size s at (x, y). */
export const tickPath = (x: number, y: number, s: number) =>
  `M${f1(x + s * 0.12)},${f1(y + s * 0.52)} L${f1(x + s * 0.4)},${f1(y + s * 0.8)} L${f1(x + s * 0.95)},${f1(y + s * 0.05)}`;

/** One marker stroke drawn on from `at` over `frames` (ease-out). */
export const MarkerStroke: React.FC<{ d: string; at: number; frames?: number; color?: string; width?: number; opacity?: number }> = ({
  d,
  at,
  frames = 10,
  color = piz.color.accent,
  width = 9,
  opacity = 1,
}) => {
  const frame = useCurrentFrame();
  if (frame < at) return null;
  const p = interpolate(frame, [at, at + frames], [0, 1], { ...clamp, easing: piz.ease.out });
  const { strokeDasharray, strokeDashoffset } = evolvePath(p, d);
  return (
    <path d={d} fill="none" stroke={color} strokeWidth={width} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={strokeDasharray} strokeDashoffset={strokeDashoffset} opacity={opacity} />
  );
};

/** Full-canvas SVG layer for marker strokes (pointer-free, overflow visible). */
export const MarkerLayer: React.FC<{ width: number; height: number; children: React.ReactNode; style?: React.CSSProperties }> = ({ width, height, children, style }) => (
  <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ position: "absolute", left: 0, top: 0, overflow: "visible", pointerEvents: "none", ...style }}>
    {children}
  </svg>
);

/** Pesos / numbers in Mexican format: 20000 → "20,000". */
export const fmtMx = (n: number, decimals = 0) =>
  new Intl.NumberFormat("es-MX", { minimumFractionDigits: decimals, maximumFractionDigits: decimals }).format(n);

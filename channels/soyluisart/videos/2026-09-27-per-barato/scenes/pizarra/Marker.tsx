import { evolvePath } from "@remotion/paths";
import { AbsoluteFill, interpolate, random, useCurrentFrame } from "remotion";
import { piz } from "../../../../styles/pizarra/theme";

// Hand-drawn marker strokes for the pizarra: slightly wobbly lines, underlines, circles and arrows
// that draw on from start to end (the "someone is writing on the board" feel). Round caps, ink or
// accent colour, drawn over `frames` with an ease-out, then held. Coordinates are canvas pixels.

const jit = (seed: string, amp: number) => (random(seed) - 0.5) * 2 * amp;

/** A marker line from (x1,y1) to (x2,y2) with a gentle hand sag and tiny overshoot. */
export const handLine = (x1: number, y1: number, x2: number, y2: number, seed = "l") => {
  const mx = (x1 + x2) / 2 + jit(`${seed}-mx`, 6);
  const my = (y1 + y2) / 2 + jit(`${seed}-my`, 5) + 3;
  return `M ${x1.toFixed(1)} ${(y1 + jit(`${seed}-a`, 2)).toFixed(1)} Q ${mx.toFixed(1)} ${my.toFixed(1)} ${(x2 + jit(`${seed}-o`, 4)).toFixed(1)} ${(y2 + jit(`${seed}-b`, 3)).toFixed(1)}`;
};

/** A loose marker ellipse that goes round ~1.1 turns (overlapping its start, like a real circle). */
export const handEllipse = (cx: number, cy: number, rx: number, ry: number, seed = "e", turns = 1.12) => {
  const n = 64;
  const a0 = -2.2 + jit(`${seed}-a0`, 0.3);
  const tilt = jit(`${seed}-t`, 0.06);
  const pts: string[] = [];
  for (let i = 0; i <= n; i++) {
    const a = a0 + (i / n) * Math.PI * 2 * turns;
    // radius drifts a little along the stroke (hand), opening outward at the end
    const k = 1 + 0.04 * Math.sin(i * 0.35 + random(`${seed}-k`) * 6) + (i / n) * 0.06;
    const x = rx * k * Math.cos(a);
    const y = ry * k * Math.sin(a);
    const xr = x * Math.cos(tilt) - y * Math.sin(tilt);
    const yr = x * Math.sin(tilt) + y * Math.cos(tilt);
    pts.push(`${i === 0 ? "M" : "L"} ${(cx + xr).toFixed(1)} ${(cy + yr).toFixed(1)}`);
  }
  return pts.join(" ");
};

/** Arrow: shaft (hand line) plus two head strokes, returned as separate paths drawn in order. */
export const handArrow = (x1: number, y1: number, x2: number, y2: number, seed = "a", head = 30): string[] => {
  const ang = Math.atan2(y2 - y1, x2 - x1);
  const h1 = `M ${x2} ${y2} L ${(x2 - head * Math.cos(ang - 0.5)).toFixed(1)} ${(y2 - head * Math.sin(ang - 0.5)).toFixed(1)}`;
  const h2 = `M ${x2} ${y2} L ${(x2 - head * Math.cos(ang + 0.5)).toFixed(1)} ${(y2 - head * Math.sin(ang + 0.5)).toFixed(1)}`;
  return [handLine(x1, y1, x2, y2, seed), h1, h2];
};

/** Curved marker arrow from (x1,y1) to (x2,y2): a quadratic shaft bowed by `bend` (fraction of the
 *  length, sign = side) and an open two-stroke head aligned with the curve's end tangent. Returns
 *  [shaft, head] so the head draws right after the shaft. */
export const curvedArrow = (x1: number, y1: number, x2: number, y2: number, seed = "c", bend = 0.3, head = 30): string[] => {
  const len = Math.hypot(x2 - x1, y2 - y1) || 1;
  const nx = -(y2 - y1) / len;
  const ny = (x2 - x1) / len;
  const b = bend * len + jit(`${seed}-b`, 6);
  const cx = (x1 + x2) / 2 + nx * b;
  const cy = (y1 + y2) / 2 + ny * b;
  const shaft = `M ${x1.toFixed(1)} ${y1.toFixed(1)} Q ${cx.toFixed(1)} ${cy.toFixed(1)} ${x2.toFixed(1)} ${y2.toFixed(1)}`;
  const ang = Math.atan2(y2 - cy, x2 - cx);
  const spread = 0.5 + jit(`${seed}-h`, 0.06);
  const a = (s: number) => `${(x2 - head * Math.cos(ang + s)).toFixed(1)} ${(y2 - head * Math.sin(ang + s)).toFixed(1)}`;
  return [shaft, `M ${a(-spread)} L ${x2.toFixed(1)} ${y2.toFixed(1)} L ${a(spread)}`];
};

/** Two-way curved arrow: shaft + a head at each end. */
export const doubleArrow = (x1: number, y1: number, x2: number, y2: number, seed = "d", bend = 0.3, head = 26): string[] => {
  const [shaft, h2] = curvedArrow(x1, y1, x2, y2, seed, bend, head);
  const len = Math.hypot(x2 - x1, y2 - y1) || 1;
  const cx = (x1 + x2) / 2 + (-(y2 - y1) / len) * (bend * len + jit(`${seed}-b`, 6));
  const cy = (y1 + y2) / 2 + ((x2 - x1) / len) * (bend * len + jit(`${seed}-b`, 6));
  const ang = Math.atan2(y1 - cy, x1 - cx);
  const a = (s: number) => `${(x1 - head * Math.cos(ang + s)).toFixed(1)} ${(y1 - head * Math.sin(ang + s)).toFixed(1)}`;
  return [shaft, h2, `M ${a(-0.5)} L ${x1.toFixed(1)} ${y1.toFixed(1)} L ${a(0.5)}`];
};

/** Draws one or more paths on, one after the other, starting at `at` over `frames` in total. */
export const Marker: React.FC<{
  d: string | string[];
  at: number;
  frames?: number;
  color?: string;
  width?: number;
  /** Coordinate space of `d` (default: the 1080×1920 sheet; horizontal overlays use 0 0 1920 1080). */
  viewBox?: string;
}> = ({ d, at, frames = 8, color = piz.color.ink, width = 8, viewBox = "0 0 1080 1920" }) => {
  const frame = useCurrentFrame();
  if (frame < at) return null;
  const paths = Array.isArray(d) ? d : [d];
  const per = frames / paths.length;
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <svg width="100%" height="100%" viewBox={viewBox} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
        {paths.map((p, i) => {
          const t = interpolate(frame, [at + i * per, at + (i + 1) * per], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: piz.ease.out,
          });
          if (t <= 0) return null;
          const { strokeDasharray, strokeDashoffset } = evolvePath(t, p);
          return (
            <path
              key={i}
              d={p}
              fill="none"
              stroke={color}
              strokeWidth={width}
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray={strokeDasharray}
              strokeDashoffset={strokeDashoffset}
            />
          );
        })}
      </svg>
    </AbsoluteFill>
  );
};

import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";

// Micro-movement (user, 2026-09-27: "dynamic, constant movement — no shot is ever static").
// Small and slow on purpose: the eye reads it as life, not as a camera move.

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

/** 0→1 progress through [from, to). */
export const progress = (frame: number, from: number, to: number) => interpolate(frame, [from, Math.max(from + 1, to)], [0, 1], clamp);

/** Slow push-in + drift over a segment (content layer). `depth` scales the whole move (parallax). */
export const Drift: React.FC<{ from: number; to: number; depth?: number; originY?: string; children: React.ReactNode }> = ({
  from,
  to,
  depth = 1,
  originY = "45%",
  children,
}) => {
  const frame = useCurrentFrame();
  const p = progress(frame, from, to);
  const s = 1 + 0.028 * depth * p;
  const y = -9 * depth * p;
  const x = 4 * depth * Math.sin(p * Math.PI);
  return (
    <AbsoluteFill style={{ transform: `translate(${x.toFixed(2)}px, ${y.toFixed(2)}px) scale(${s.toFixed(4)})`, transformOrigin: `50% ${originY}` }}>
      {children}
    </AbsoluteFill>
  );
};

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

/** Idle float (±px, ~1 s period, phase per element) — his "respiración" on satellites. */
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

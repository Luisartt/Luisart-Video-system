import React from "react";
import { z } from "zod";
import { piz } from "./theme";

// Stick figure of the Luisart pizarra style — 3 approved looks (Luisart, 2026-09-30), each with 6
// expressions (same set as Bit) and 4 arm poses. Drawn in a fixed 200×340 cell (ground at y=320)
// and scaled to `h`, so every look and pose has the same footprint. Expression/pose swap on a hard
// frame (no tweening), like the rest of the style.
//   marcador  — thick wobbly marker line, hollow head, dot face, hand circles
//   pixel     — all square pixels like Bit, blue tie
//   caracter  — solid head, plain white eyes WITHOUT pupils, mitts, sneakers, blue scarf (default)

const { color, font } = piz;
const INK = color.ink;
const BLUE = color.accent;
const TINT = color.tintMid;

export type Pose = "stand" | "wave" | "question" | "point";
export const poseField = z.enum(["stand", "wave", "question", "point"]);
export type StickVariant = "marcador" | "pixel" | "caracter";
export const stickVariantField = z.enum(["marcador", "pixel", "caracter"]);
export type StickExpression = "happy" | "surprised" | "thinking" | "angry" | "wink" | "sleepy";
export const stickExpressionField = z.enum(["happy", "surprised", "thinking", "angry", "wink", "sleepy"]);
export const DEFAULT_STICK_VARIANT: StickVariant = "caracter";

type Pt = [number, number];
const S: Pt = [100, 105];
const HIP: Pt = [100, 205];
const LEFT: [Pt, Pt] = [[80, 150], [72, 195]];
const RIGHT: Record<Pose, [Pt, Pt]> = {
  stand: [[120, 150], [128, 195]],
  wave: [[140, 92], [160, 45]],
  question: [[136, 145], [112, 96]],
  point: [[142, 112], [188, 104]],
};
const LEGS: [Pt, Pt] = [[75, 320], [125, 320]];

const strokeProps = (w: number, c: string = INK) => ({
  fill: "none",
  stroke: c,
  strokeWidth: w,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
});

/** "z z" for sleepy, blue, in the look's own font. */
const Zs: React.FC<{ family: string; size: number }> = ({ family, size }) => (
  <>
    <text x={140} y={30} fontFamily={family} fontSize={size} fill={BLUE} fontWeight={700}>z</text>
    <text x={162} y={12} fontFamily={family} fontSize={size * 0.7} fill={BLUE} fontWeight={700}>z</text>
  </>
);

const Question: React.FC<{ family: string; size: number; x?: number; y?: number }> = ({ family, size, x = 150, y = 40 }) => (
  <text x={x} y={y} fontFamily={family} fontSize={size} fill={BLUE} fontWeight={700}>?</text>
);

// ── A · Marcador ───────────────────────────────────────────────────────────────────────────────
const wob = (a: Pt, b: Pt, k: number) => `M${a[0]},${a[1]} Q${(a[0] + b[0]) / 2 + k},${(a[1] + b[1]) / 2 - k * 0.6} ${b[0]},${b[1]}`;

const BodyA: React.FC<{ pose: Pose; mark: boolean }> = ({ pose, mark }) => {
  const R = RIGHT[pose];
  return (
    <>
      <g {...strokeProps(8)}>
        <path d="M100,96 Q97,150 100,205" />
        <path d={wob(S, LEFT[0], -4)} />
        <path d={wob(LEFT[0], LEFT[1], -3)} />
        <path d={wob(S, R[0], 4)} />
        <path d={wob(R[0], R[1], 3)} />
        <path d={wob(HIP, LEGS[0], -5)} />
        <path d={wob(HIP, LEGS[1], 5)} />
        <ellipse cx={100} cy={54} rx={42} ry={41} transform="rotate(-4 100 54)" />
      </g>
      <circle cx={LEFT[1][0]} cy={LEFT[1][1]} r={8} fill="#fff" stroke={INK} strokeWidth={6} />
      <circle cx={R[1][0]} cy={R[1][1]} r={8} fill="#fff" stroke={INK} strokeWidth={6} />
      {pose === "question" && mark ? <Question family={font.hand} size={56} /> : null}
    </>
  );
};

const FaceA: React.FC<{ e: StickExpression }> = ({ e }) => {
  const dot = (x: number, y: number, r = 5) => <circle cx={x} cy={y} r={r} fill={INK} />;
  const ln = (d: string, w = 5) => <path d={d} {...strokeProps(w)} />;
  switch (e) {
    case "happy":
      return <>{dot(86, 50)}{dot(114, 50)}{ln("M84,68 Q100,84 116,68")}</>;
    case "surprised":
      return (
        <>
          <circle cx={85} cy={48} r={8} fill="#fff" stroke={INK} strokeWidth={5} />
          <circle cx={115} cy={48} r={8} fill="#fff" stroke={INK} strokeWidth={5} />
          {dot(85, 48, 3)}{dot(115, 48, 3)}
          <ellipse cx={100} cy={74} rx={7} ry={9} {...strokeProps(5)} />
        </>
      );
    case "thinking":
      return (
        <>
          {dot(88, 44)}{dot(116, 44)}{ln("M92,72 L112,68")}
          <circle cx={152} cy={30} r={4} {...strokeProps(3)} />
          <circle cx={162} cy={16} r={7} {...strokeProps(3)} />
        </>
      );
    case "angry":
      return <>{dot(86, 52)}{dot(114, 52)}{ln("M72,38 L94,46")}{ln("M128,38 L106,46")}{ln("M86,76 Q100,64 114,76")}</>;
    case "wink":
      return <>{dot(86, 50)}{ln("M104,52 Q114,44 124,52")}{ln("M84,68 Q100,84 116,68")}</>;
    case "sleepy":
      return (
        <>
          {ln("M78,50 Q86,58 94,50")}{ln("M106,50 Q114,58 122,50")}
          <ellipse cx={100} cy={74} rx={5} ry={4} {...strokeProps(4)} />
          <Zs family={font.hand} size={44} />
        </>
      );
  }
};

// ── B · Pixel ──────────────────────────────────────────────────────────────────────────────────
const U = 8;

const bodyCells = (pose: Pose) => {
  const cells = new Set<string>();
  const add = (x: number, y: number) => cells.add(`${x},${y}`);
  const line = (a: Pt, b: Pt) => {
    let x0 = Math.round(a[0] / U), y0 = Math.round(a[1] / U);
    const x1 = Math.round(b[0] / U), y1 = Math.round(b[1] / U);
    const dx = Math.abs(x1 - x0), dy = -Math.abs(y1 - y0), sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1;
    let err = dx + dy;
    for (;;) {
      add(x0, y0);
      add(x0 + 1, y0);
      if (x0 === x1 && y0 === y1) break;
      const e2 = 2 * err;
      if (e2 >= dy) { err += dy; x0 += sx; }
      if (e2 <= dx) { err += dx; y0 += sy; }
    }
  };
  const R = RIGHT[pose];
  line([100, 100], [100, 205]);
  line(S, LEFT[0]); line(LEFT[0], LEFT[1]); line(S, R[0]); line(R[0], R[1]);
  line(HIP, LEGS[0]); line(HIP, LEGS[1]);
  LEGS.forEach((p, i) => {
    const x = Math.round((p[0] - (i ? 0 : 8)) / U), y = Math.round(p[1] / U);
    add(x, y - 1); add(x + 1, y - 1); add(x + 2, y - 1);
  });
  return [...cells].map((k) => k.split(",").map(Number) as Pt);
};

const HEAD_CELLS = (() => {
  const out: Pt[] = [];
  for (let y = -6; y <= 6; y++) for (let x = -6; x <= 6; x++) if (x * x + y * y <= 32) out.push([12 + x, 6 + y]);
  return out;
})();

const Cell: React.FC<{ x: number; y: number; c: string; head?: boolean }> = ({ x, y, c, head }) => (
  <rect x={x * U - (head ? 4 : 0)} y={y * U - (head ? 4 : 0)} width={U} height={U} fill={c} />
);

const BodyB: React.FC<{ pose: Pose; mark: boolean }> = ({ pose, mark }) => (
  <>
    {bodyCells(pose).map(([x, y]) => <Cell key={`${x},${y}`} x={x} y={y} c={INK} />)}
    {HEAD_CELLS.map(([x, y]) => <Cell key={`h${x},${y}`} x={x} y={y} c={INK} head />)}
    <Cell x={12} y={13} c={BLUE} head /><Cell x={12} y={14} c={BLUE} head /><Cell x={12} y={15} c={TINT} head />
    {pose === "question" && mark ? <Question family={font.pixel} size={60} y={44} /> : null}
  </>
);

const FaceB: React.FC<{ e: StickExpression }> = ({ e }) => {
  const p = (list: Pt[], c: string) => list.map(([x, y]) => <Cell key={`${x},${y}`} x={12 + x} y={6 + y} c={c} head />);
  const W = "#fff";
  switch (e) {
    case "happy":
      return <>{p([[-2, -2], [-2, -1], [2, -2], [2, -1]], W)}{p([[-3, 1], [3, 1], [-2, 2], [-1, 2], [0, 2], [1, 2], [2, 2]], TINT)}</>;
    case "surprised":
      return <>{p([[-3, -2], [-2, -2], [-3, -1], [-2, -1], [2, -2], [3, -2], [2, -1], [3, -1]], W)}{p([[-1, 1], [0, 1], [-1, 2], [0, 2]], TINT)}</>;
    case "thinking":
      return (
        <>
          {p([[-2, -3], [-2, -2], [3, -3], [3, -2]], W)}{p([[0, 2], [1, 2], [2, 2]], TINT)}
          <rect x={152} y={20} width={8} height={8} fill={INK} />
          <rect x={166} y={6} width={12} height={12} fill={INK} />
        </>
      );
    case "angry":
      return <>{p([[-3, -2], [-2, -1], [3, -2], [2, -1]], W)}{p([[-4, -3], [-3, -3], [4, -3], [3, -3]], TINT)}{p([[-2, 3], [-1, 2], [0, 2], [1, 2], [2, 3]], TINT)}</>;
    case "wink":
      return <>{p([[-2, -2], [-2, -1]], W)}{p([[1, -1], [2, -1], [3, -1]], W)}{p([[-3, 1], [3, 1], [-2, 2], [-1, 2], [0, 2], [1, 2], [2, 2]], TINT)}</>;
    case "sleepy":
      return <>{p([[-3, -1], [-2, -1], [-1, -1], [1, -1], [2, -1], [3, -1]], W)}{p([[0, 2], [1, 2]], TINT)}<Zs family={font.pixel} size={48} /></>;
  }
};

// ── C · Con carácter (plain white eyes, NO pupils) ─────────────────────────────────────────────
const BodyC: React.FC<{ pose: Pose; mark: boolean }> = ({ pose, mark }) => {
  const R = RIGHT[pose];
  return (
    <>
      <g {...strokeProps(10)}>
        <path d="M100,100 L100,205" />
        <path d={`M${S[0]},${S[1]} L${LEFT[0][0]},${LEFT[0][1]} L${LEFT[1][0]},${LEFT[1][1]}`} />
        <path d={`M${S[0]},${S[1]} L${R[0][0]},${R[0][1]} L${R[1][0]},${R[1][1]}`} />
        <path d={`M100,205 L${LEGS[0][0]},${LEGS[0][1]}`} />
        <path d={`M100,205 L${LEGS[1][0]},${LEGS[1][1]}`} />
      </g>
      <circle cx={LEFT[1][0]} cy={LEFT[1][1]} r={11} fill={INK} />
      <circle cx={R[1][0]} cy={R[1][1]} r={11} fill={INK} />
      <ellipse cx={67} cy={316} rx={17} ry={8} fill={INK} />
      <ellipse cx={133} cy={316} rx={17} ry={8} fill={INK} />
      <circle cx={100} cy={52} r={44} fill={INK} />
      <path d="M70,104 Q100,122 130,104 L130,116 Q100,134 70,116 Z" fill={BLUE} stroke={INK} strokeWidth={5} strokeLinejoin="round" />
      <path d="M112,122 L124,152 L108,148 Z" fill={BLUE} stroke={INK} strokeWidth={5} strokeLinejoin="round" />
      {pose === "question" && mark ? <Question family={font.label} size={58} x={148} /> : null}
    </>
  );
};

const FaceC: React.FC<{ e: StickExpression }> = ({ e }) => {
  const eye = (x: number, y: number, rx = 11, ry = 13) => <ellipse cx={x} cy={y} rx={rx} ry={ry} fill="#fff" />;
  const wl = (d: string, w = 5) => <path d={d} {...strokeProps(w, "#fff")} />;
  switch (e) {
    case "happy":
      return <>{eye(84, 50)}{eye(116, 50)}{wl("M86,72 Q100,88 114,72")}</>;
    case "surprised":
      return <>{eye(84, 46, 13, 16)}{eye(116, 46, 13, 16)}<ellipse cx={100} cy={76} rx={7} ry={9} fill="#fff" /></>;
    case "thinking":
      return (
        <>
          {eye(84, 50)}{eye(116, 44, 11, 15)}{wl("M90,76 L112,72")}{wl("M104,26 Q116,20 128,28", 4)}
          <circle cx={152} cy={32} r={4} fill={INK} />
          <circle cx={162} cy={18} r={7} fill={INK} />
        </>
      );
    case "angry":
      return (
        <>
          {eye(84, 52, 11, 10)}{eye(116, 52, 11, 10)}
          <path d="M66,34 L98,50 L98,40 L70,28 Z" fill={INK} />
          <path d="M134,34 L102,50 L102,40 L130,28 Z" fill={INK} />
          {wl("M86,78 Q100,66 114,78")}
        </>
      );
    case "wink":
      return <>{eye(84, 50)}{wl("M104,52 Q116,42 128,52", 6)}{wl("M86,72 Q100,88 114,72")}</>;
    case "sleepy":
      return (
        <>
          {wl("M72,48 Q84,60 96,48", 6)}{wl("M104,48 Q116,60 128,48", 6)}
          <ellipse cx={100} cy={76} rx={5} ry={4} fill="#fff" />
          <Zs family={font.label} size={46} />
        </>
      );
  }
};

// ── Public component ───────────────────────────────────────────────────────────────────────────
const LOOKS: Record<StickVariant, { Body: React.FC<{ pose: Pose; mark: boolean }>; Face: React.FC<{ e: StickExpression }> }> = {
  marcador: { Body: BodyA, Face: FaceA },
  pixel: { Body: BodyB, Face: FaceB },
  caracter: { Body: BodyC, Face: FaceC },
};

/** Stick figure standing on the ground line (drawn by the caller). `h` = total height in px. */
export const StickFigure: React.FC<{
  h: number;
  pose?: Pose;
  flip?: boolean;
  variant?: StickVariant;
  expression?: StickExpression;
}> = ({ h, pose = "stand", flip = false, variant = DEFAULT_STICK_VARIANT, expression = "happy" }) => {
  const { Body, Face } = LOOKS[variant];
  const w = (h * 200) / 340;
  return (
    <svg width={w} height={h} viewBox="0 0 200 340" style={{ overflow: "visible", transform: flip ? "scaleX(-1)" : undefined }}>
      <Body pose={pose} mark={expression !== "thinking"} />
      <Face e={expression} />
    </svg>
  );
};

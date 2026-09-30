import { useCurrentFrame, interpolate, Easing } from "remotion";
import { Board, Card, H, Note, T, SAFE, clamp, useEnter } from "../kit";

// "Two examples side by side": the same content in two tiles, each with a name and a small
// sub-label; the second tile sits lower and enters later; one accent colour per example; both
// run in sync on the same scale and the winner is circled at the end.
// Pattern learned from a reference analysis (see .claude/skills/luisart-configurar-estilo).

export type CompareTwoProps = {
  title: string;
  a: { name: string; sub: string; value: number; unit?: string };
  b: { name: string; sub: string; value: number; unit?: string };
  footnote: string;
  seconds?: number;
};

const W = 440;
const GAP = 60;
const X_A = 70;
const X_B = X_A + W + GAP;
const TILE_H = 330;
const HEAD_H = 106;
const Y_A = SAFE.top + 200;
const OFF = 40;
const STEPS = 12;
const START = 50;
const LEN = 14;

const Tile: React.FC<{ side: CompareTwoProps["a"]; x: number; y: number; at: number; color: string; max: number }> = ({ side, x, y, at, color, max }) => {
  const frame = useCurrentFrame();
  const e = useEnter(at);
  const prog = interpolate(frame, [START, START + STEPS * LEN], [0, STEPS], clamp);
  const shown = (side.value * Math.min(STEPS, prog)) / STEPS;
  return (
    <div style={{ position: "absolute", left: x, top: y, width: W, ...e.style }}>
      <div style={{ height: 64, display: "flex", alignItems: "flex-end", gap: 12, marginBottom: 8 }}>
        <div style={{ width: 22, height: 54, background: color, border: `${T.border}px solid ${T.color.line}` }} />
        <H size={40}>{side.name}</H>
      </div>
      <Note size={30} style={{ textAlign: "right", marginBottom: 10 }}>{side.sub}</Note>
      <Card style={{ height: TILE_H, position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", left: 22, right: 22, bottom: 120, height: 140, display: "flex", alignItems: "flex-end", gap: 6 }}>
          {Array.from({ length: STEPS }).map((_, i) => {
            const s = START + i * LEN;
            const val = (side.value * (i + 1)) / STEPS;
            const h = interpolate(frame, [s, s + 10], [0, (val / max) * 140], { ...clamp, easing: Easing.out(Easing.cubic) });
            return <div key={i} style={{ flex: 1, height: Math.max(h, frame >= s ? 4 : 0), background: color, border: h > 2 ? `3px solid ${T.color.line}` : "none", boxSizing: "border-box" }} />;
          })}
        </div>
        <H size={T.type.number * 0.52} style={{ position: "absolute", left: 0, right: 0, bottom: 22, textAlign: "center" }}>
          {`${Math.round(shown).toLocaleString("en-US")}${side.unit ?? ""}`}
        </H>
      </Card>
    </div>
  );
};

export const CompareTwo: React.FC<CompareTwoProps> = ({ title, a, b, footnote }) => {
  const frame = useCurrentFrame();
  const max = Math.max(a.value, b.value);
  const winAt = START + STEPS * LEN + 8;
  const win = a.value >= b.value ? "a" : "b";
  const circle = interpolate(frame, [winAt, winAt + 18], [0, 1], { ...clamp, easing: Easing.out(Easing.quad) });
  const wx = win === "a" ? X_A : X_B;
  const wy = Y_A + (win === "a" ? 0 : OFF) + HEAD_H + TILE_H - 22 - 44;
  const w = 420;
  const h = 130;
  return (
    <Board>
      <div style={{ position: "absolute", left: 70, top: SAFE.top + 12, width: 940 }}>
        <H size={78}>{title}</H>
      </div>
      <Tile side={a} x={X_A} y={Y_A} at={10} color={T.color.accent2} max={max} />
      <Tile side={b} x={X_B} y={Y_A + OFF} at={20} color={T.color.accent} max={max} />
      {frame >= winAt ? (
        <svg width={w} height={h} style={{ position: "absolute", left: wx + W / 2 - w / 2, top: wy - h / 2 }} viewBox={`0 0 ${w} ${h}`}>
          <path
            d={`M ${w * 0.5} 8 C ${w * 0.95} 2, ${w - 4} ${h - 8}, ${w * 0.5} ${h - 6} C 14 ${h}, 0 14, ${w * 0.42} 6`}
            fill="none"
            stroke={T.color.accent}
            strokeWidth={7}
            strokeLinecap="round"
            strokeDasharray={1400}
            strokeDashoffset={1400 * (1 - circle)}
          />
        </svg>
      ) : null}
      <div style={{ position: "absolute", left: 70, top: Y_A + OFF + HEAD_H + TILE_H + 70, width: 820, opacity: interpolate(frame, [winAt + 20, winAt + 34], [0, 1], clamp) }}>
        <H size={60}>{footnote}</H>
      </div>
    </Board>
  );
};

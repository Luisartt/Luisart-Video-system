import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { evolvePath } from "@remotion/paths";
import { z } from "zod";
import { HandNote, Sfx, Stage, TypeOn, Variant, base, baseSchema, clamp, useFormat } from "./primitives";
import { fmtMx } from "./marker";
import { piz } from "./theme";

// Number counter: a giant blue figure counts up (ease-out, tabular digits) under a small heading,
// then a marker underline is drawn beneath it and a handwritten note lands. Mexican formatting
// (20,000.50). Sound: ticking counter bed while it counts, bleep when it settles, marker at the
// underline.

export const counterSchema = baseSchema.extend({
  heading: z.string(),
  accent: z.string(),
  value: z.number(),
  from: z.number(),
  decimals: z.number().min(0).max(2),
  prefix: z.string(),
  suffix: z.string(),
  countSeconds: z.number().min(0.3).max(5),
  startAt: z.number().min(0).describe("Seconds when the count starts"),
  note: z.string(),
  source: z.string(),
});
type Props = z.infer<typeof counterSchema>;

const UNDERLINE = "M8,26 C220,14 520,32 760,18 S960,22 992,16";

export const Counter: React.FC<Props> = (p) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { isVertical, safeBox } = useFormat();
  const start = Math.round(p.startAt * fps);
  const dur = Math.round(p.countSeconds * fps);
  const land = start + dur;
  const t = interpolate(frame, [start, land], [0, 1], { ...clamp, easing: piz.ease.out });
  const val = p.from + (p.value - p.from) * t;
  const text = `${p.prefix}${fmtMx(frame >= land ? p.value : val, p.decimals)}${p.suffix}`;
  const lineAt = land + 3;
  const lp = interpolate(frame, [lineAt, lineAt + 10], [0, 1], { ...clamp, easing: piz.ease.out });
  const ev = evolvePath(lp, UNDERLINE);
  // Fit the final figure on one line inside the safe width.
  const finalLen = Array.from(`${p.prefix}${fmtMx(p.value, p.decimals)}${p.suffix}`).length;
  const fs = Math.min(isVertical ? 220 : 230, Math.floor((safeBox.w - 40) / (finalLen * 0.62)));
  return (
    <Stage backing={p.backing} safeGuide={p.safeGuide}>
      <AbsoluteFill style={{ left: safeBox.x, top: safeBox.y, width: safeBox.w, height: safeBox.h, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10, paddingBottom: isVertical ? 80 : 0 }}>
        <TypeOn text={p.heading} accent={p.accent} at={2} fontSize={isVertical ? 84 : 80} />
        <div style={{ position: "relative", display: "inline-block", marginTop: 20 }}>
          <div style={{ font: `800 ${fs}px ${piz.font.heading}`, color: piz.color.accent, letterSpacing: "-0.02em", fontVariantNumeric: "tabular-nums", lineHeight: 1, whiteSpace: "nowrap", visibility: frame >= start ? "visible" : "hidden" }}>{text}</div>
          {frame >= lineAt ? (
            <svg viewBox="0 0 1000 40" preserveAspectRatio="none" style={{ position: "absolute", left: "-3%", width: "106%", height: 40, top: "100%" }}>
              <path d={UNDERLINE} fill="none" stroke={piz.color.ink} strokeWidth={10} strokeLinecap="round" strokeDasharray={ev.strokeDasharray} strokeDashoffset={ev.strokeDashoffset} />
            </svg>
          ) : null}
        </div>
        <div style={{ marginTop: 50 }}>
          <HandNote text={p.note} at={lineAt + 8} fontSize={isVertical ? 76 : 72} />
        </div>
        <div style={{ font: `500 28px ${piz.font.caption}`, color: piz.color.muted, marginTop: 30 }}>{p.source}</div>
      </AbsoluteFill>
      <Sfx kind="type" at={2} frames={Array.from(p.heading).length + 2} on={p.sfx} />
      <Sfx kind="counter" at={start} frames={dur} on={p.sfx} />
      <Sfx kind="bleep" at={land} on={p.sfx} />
      <Sfx kind="marker" at={lineAt} on={p.sfx} />
    </Stage>
  );
};

const common: Props = {
  ...base("board", 5),
  heading: "EN 10 AÑOS TENDRÍAS",
  accent: "10 AÑOS",
  value: 36000,
  from: 0,
  decimals: 0,
  prefix: "$",
  suffix: " MXN",
  countSeconds: 1.4,
  startAt: 0.8,
  note: "guardando $300 al mes, sin intereses",
  source: "dato de ejemplo",
};

export const counterVariants: Variant<Props>[] = [
  { id: "pesos", props: common, horizontal: true },
  { id: "percent", props: { ...common, heading: "RENDIMIENTO REAL", accent: "REAL", value: 7.5, decimals: 1, prefix: "", suffix: "%", note: "después de comisiones", countSeconds: 1.1 }, horizontal: true },
];

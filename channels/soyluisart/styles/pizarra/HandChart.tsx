import { AbsoluteFill, useCurrentFrame } from "remotion";
import { z } from "zod";
import { HandNote, Sfx, Stage, TypeOn, Variant, base, baseSchema, useFormat } from "./primitives";
import { MarkerLayer, MarkerStroke, roughLine } from "./marker";
import { piz } from "./theme";

// Vertical content extent on the sheet (measured on the renders) → fitted into the graphics zone
// y 250–970 by <Stage fit> (user rule 2026-09-27, Codex H6).
const ZONE_FIT = [268, 1430] as const;

// Hand-drawn finance chart: marker axes drawn on, then bars (tinted fill + wobbly blue outline)
// or a wobbly line through the points, each point/bar landing in turn with a handwritten value.
// Heights are computed from the data (max = full height), so the drawing always matches it.

export const handChartSchema = baseSchema.extend({
  heading: z.string(),
  accent: z.string(),
  mode: z.enum(["bars", "line"]),
  data: z.array(z.object({ label: z.string(), value: z.number(), display: z.string() })).min(2).max(8),
  highlight: z.number().min(-1).max(7).describe("Index drawn in the accent / circled (-1 = none)"),
  note: z.string(),
  source: z.string(),
});
type Props = z.infer<typeof handChartSchema>;

export const HandChart: React.FC<Props> = (p) => {
  const frame = useCurrentFrame();
  const { isVertical, safeBox, width, height } = useFormat();
  const headH = 170;
  const cw = isVertical ? safeBox.w - 20 : 1300;
  const ch = isVertical ? 640 : 480;
  const x0 = isVertical ? safeBox.x + 10 : (width - cw) / 2;
  const y0 = isVertical ? safeBox.y + headH + 60 : safeBox.y + headH + 10;
  const axisAt = 8;
  const dataAt = axisAt + 16;
  const step = 7;
  const n = p.data.length;
  const max = Math.max(...p.data.map((d) => d.value), 1);
  const slot = cw / n;
  const barW = slot * 0.56;
  const px = (i: number) => x0 + slot * i + slot / 2;
  const py = (v: number) => y0 + ch - (v / max) * (ch - 70);
  const pts = p.data.map((d, i) => [px(i), py(d.value)] as const);
  const lineD = pts.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(1)},${(y + (i % 2 ? 3 : -3)).toFixed(1)}`).join(" ");
  const lastAt = dataAt + (n - 1) * step;
  return (
    <Stage backing={p.backing} safeGuide={p.safeGuide} fit={ZONE_FIT}>
      <AbsoluteFill style={{ left: safeBox.x, width: safeBox.w, top: safeBox.y + 10, height: headH, display: "flex", flexDirection: "column", alignItems: "center" }}>
        <TypeOn text={p.heading} accent={p.accent} at={2} fontSize={isVertical ? 88 : 84} />
      </AbsoluteFill>
      <MarkerLayer width={width} height={height}>
        <MarkerStroke d={roughLine(x0 - 10, y0 + ch, x0 + cw + 10, y0 + ch, "xaxis", 0.004)} at={axisAt} frames={10} color={piz.color.ink} width={7} />
        <MarkerStroke d={roughLine(x0 - 10, y0 + ch, x0 - 6, y0 - 10, "yaxis", 0.01)} at={axisAt + 4} frames={8} color={piz.color.ink} width={7} />
        {p.mode === "bars"
          ? p.data.map((d, i) => {
              const x = px(i) - barW / 2;
              const y = py(d.value);
              const at = dataAt + i * step;
              if (frame < at) return null;
              const hl = i === p.highlight;
              const col = hl ? piz.color.accent : piz.color.accentDark;
              const dd = `M${x},${y0 + ch} L${x + 2},${y} L${x + barW - 1},${y + 3} L${x + barW},${y0 + ch}`;
              return (
                <g key={i}>
                  <rect x={x} y={y} width={barW} height={y0 + ch - y} fill={hl ? piz.color.tintMid : piz.color.tint} />
                  <MarkerStroke d={dd} at={at} frames={6} color={col} width={7} />
                </g>
              );
            })
          : (
            <>
              <MarkerStroke d={lineD} at={dataAt} frames={(n - 1) * step} width={9} />
              {pts.map(([x, y], i) =>
                frame >= dataAt + i * step ? <circle key={i} cx={x} cy={y} r={i === p.highlight ? 16 : 11} fill={i === p.highlight ? piz.color.accent : piz.color.white} stroke={piz.color.accent} strokeWidth={6} /> : null,
              )}
            </>
          )}
      </MarkerLayer>
      {p.data.map((d, i) => {
        const at = dataAt + i * step;
        return (
          <div key={i}>
            <div style={{ position: "absolute", left: px(i) - slot / 2, width: slot, top: py(d.value) - (p.mode === "bars" ? 62 : 74), textAlign: "center", font: `400 ${isVertical ? 50 : 48}px ${piz.font.hand}`, color: i === p.highlight ? piz.color.accent : piz.color.handInk, visibility: frame >= at + 2 ? "visible" : "hidden" }}>
              {d.display}
            </div>
            <div style={{ position: "absolute", left: px(i) - slot / 2, width: slot, top: y0 + ch + 14, textAlign: "center", font: `700 ${isVertical ? 30 : 30}px ${piz.font.caption}`, color: piz.color.ink }}>{d.label}</div>
          </div>
        );
      })}
      <div style={{ position: "absolute", left: safeBox.x, width: safeBox.w, top: y0 + ch + 80, textAlign: "center" }}>
        <HandNote text={p.note} at={lastAt + 10} fontSize={isVertical ? 70 : 64} color={piz.color.accentDark} />
      </div>
      <div style={{ position: "absolute", left: safeBox.x, width: safeBox.w, top: safeBox.y + safeBox.h - 40, textAlign: "center", font: `500 28px ${piz.font.caption}`, color: piz.color.muted }}>{p.source}</div>
      <Sfx kind="type" at={2} frames={Array.from(p.heading).length + 2} on={p.sfx} />
      <Sfx kind="marker" at={axisAt} on={p.sfx} />
      {p.data.map((_, i) => (
        <Sfx key={i} kind="minimal" at={dataAt + i * step + 4} on={p.sfx} volume={0.18} />
      ))}
      <Sfx kind="ding" at={lastAt + 6} on={p.sfx} />
    </Stage>
  );
};

const years = [
  { label: "2021", value: 10000, display: "$10k" },
  { label: "2022", value: 11500, display: "$11.5k" },
  { label: "2023", value: 13200, display: "$13.2k" },
  { label: "2024", value: 15200, display: "$15.2k" },
  { label: "2025", value: 17500, display: "$17.5k" },
];

export const handChartVariants: Variant<Props>[] = [
  { id: "bars", props: { ...base("board", 5), heading: "TU AHORRO CRECE", accent: "CRECE", mode: "bars", data: years, highlight: 4, note: "sin tocarlo, solo intereses", source: "dato de ejemplo (MXN)" }, horizontal: true },
  { id: "line", props: { ...base("board", 5), heading: "EL PRECIO DE LA ACCIÓN", accent: "ACCIÓN", mode: "line", data: [
    { label: "ene", value: 120, display: "$120" },
    { label: "mar", value: 95, display: "$95" },
    { label: "may", value: 140, display: "$140" },
    { label: "jul", value: 110, display: "$110" },
    { label: "sep", value: 165, display: "$165" },
  ], highlight: 4, note: "sube y baja: no entres en pánico", source: "dato de ejemplo (MXN)" }, horizontal: true },
];

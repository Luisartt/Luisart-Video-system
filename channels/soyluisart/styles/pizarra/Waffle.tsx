import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { z } from "zod";
import { HandNote, Sfx, Stage, TypeOn, Variant, base, baseSchema, useFormat } from "./primitives";
import { piz } from "./theme";

// Vertical content extent on the sheet (measured on the renders) → fitted into the graphics zone
// y 250–970 by <Stage fit> (user rule 2026-09-27, Codex H6).
const ZONE_FIT = [430, 1432] as const;

// Waffle chart ("12 de cada 100"): a grid of small squares, outlined in ink, filling one cell per
// frame in blue up to `value`, from the beat word. Hand label + bold heading on one line above it.
// `compare` stacks a second waffle under a divider (his ANTES / AHORA), the second label in blue.

const rowSchema = z.object({
  label: z.string().describe("Handwritten label (\"antes\")"),
  heading: z.string().describe("Bold line (\"12 de cada 100\")"),
  value: z.number().min(0).max(100),
  at: z.number().min(0).describe("Seconds when the fill starts"),
  tone: z.enum(["accent", "alert", "ink"]),
});
export const waffleSchema = baseSchema.extend({
  rows: z.array(rowSchema).min(1).max(2),
  total: z.number().min(10).max(100),
  cols: z.number().min(5).max(25),
  source: z.string(),
});
type Props = z.infer<typeof waffleSchema>;
type Row = z.infer<typeof rowSchema>;

const toneColor = (t: Row["tone"]) => (t === "alert" ? piz.color.alert : t === "ink" ? piz.color.ink : piz.color.accent);

const Grid: React.FC<{ value: number; total: number; cols: number; cell: number; gap: number; at: number; fill: string }> = ({ value, total, cols, cell, gap, at, fill }) => {
  const frame = useCurrentFrame();
  const filled = Math.max(0, Math.min(value, Math.floor((frame - at + 1) * piz.timing.cellsPerFrame)));
  const b = cell >= 50 ? 4 : 3;
  return (
    <div style={{ display: "grid", gridTemplateColumns: `repeat(${cols}, ${cell}px)`, gap }}>
      {Array.from({ length: total }, (_, i) => (
        <div
          key={i}
          style={{ width: cell, height: cell, boxSizing: "border-box", border: `${b}px solid ${i < filled ? fill : piz.color.ink}`, background: i < filled ? fill : piz.color.white }}
        />
      ))}
    </div>
  );
};

export const Waffle: React.FC<Props> = (p) => {
  const { isVertical, safeBox, width } = useFormat();
  const { fps } = useVideoConfig();
  const n = p.rows.length;
  const rowsN = Math.ceil(p.total / p.cols);
  const sideBySide = !isVertical && n === 2;
  const availW = sideBySide ? (safeBox.w - 160) / 2 : Math.min(safeBox.w - 40, isVertical ? 800 : 1100);
  const blockH = (isVertical ? safeBox.h - 60 : safeBox.h - 120) / (sideBySide ? 1 : n) - 200;
  const pitch = Math.floor(Math.min(availW / p.cols, blockH / rowsN));
  const gap = Math.max(4, Math.round(pitch * 0.16));
  const cell = pitch - gap;
  const gridW = p.cols * pitch - gap;
  const headSize = isVertical ? 62 : 58;
  const blocks = p.rows.map((r, i) => {
    const at = Math.round(r.at * fps);
    const col = toneColor(r.tone);
    return (
      <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 34, width: gridW }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 18, alignSelf: i === 1 && !sideBySide ? "flex-end" : "flex-start" }}>
          <HandNote text={r.label} at={Math.max(0, at - 8)} color={i === 0 ? piz.color.ink : col} fontSize={headSize * 1.35} />
          <TypeOn text={r.heading} at={Math.max(0, at - 5)} fontFamily={piz.font.caption} weight={700} fontSize={headSize} align="left" letterSpacing="-0.02em" />
        </div>
        <Grid value={r.value} total={p.total} cols={p.cols} cell={cell} gap={gap} at={at} fill={col} />
        <Sfx kind="click" at={at} on={p.sfx} />
        <Sfx kind="ding" at={at + r.value} on={p.sfx} />
      </div>
    );
  });
  const line = piz.ui.border;
  return (
    <Stage backing={p.backing} safeGuide={p.safeGuide} fit={ZONE_FIT}>
      <AbsoluteFill
        style={{
          left: safeBox.x,
          top: safeBox.y,
          width: safeBox.w,
          height: safeBox.h,
          display: "flex",
          flexDirection: sideBySide ? "row" : "column",
          alignItems: "center",
          justifyContent: n === 2 ? "space-evenly" : "center",
          gap: sideBySide ? 160 : 0,
        }}
      >
        {blocks[0]}
        {blocks[1] ?? null}
      </AbsoluteFill>
      {n === 2 && !sideBySide ? (
        <div style={{ position: "absolute", left: 0, width, top: Math.round(safeBox.y + safeBox.h / 2) - line / 2, height: line, background: piz.color.ink }} />
      ) : null}
      {n === 2 && sideBySide ? (
        <div style={{ position: "absolute", top: 0, bottom: 0, left: width / 2 - line / 2, width: line, background: piz.color.ink }} />
      ) : null}
      <div
        style={{
          position: "absolute",
          left: safeBox.x,
          width: safeBox.w,
          top: safeBox.y + safeBox.h - 40,
          textAlign: "center",
          font: `500 28px ${piz.font.caption}`,
          color: piz.color.muted,
        }}
      >
        {p.source}
      </div>
    </Stage>
  );
};

export const waffleVariants: Variant<Props>[] = [
  {
    id: "single",
    horizontal: true,
    props: {
      ...base("board", 5),
      rows: [{ label: "solo", heading: "12 de cada 100", value: 12, at: 0.6, tone: "accent" }],
      total: 100,
      cols: 10,
      source: "dato de ejemplo",
    },
  },
  {
    id: "compare",
    horizontal: true,
    props: {
      ...base("board", 5),
      rows: [
        { label: "ANTES", heading: "12 de cada 100", value: 12, at: 0.5, tone: "accent" },
        { label: "AHORA", heading: "4 de cada 100", value: 4, at: 2, tone: "accent" },
      ],
      total: 100,
      cols: 20,
      source: "dato de ejemplo",
    },
  },
];

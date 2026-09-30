import { useVideoConfig } from "remotion";
import { z } from "zod";
import { Drop, HandNote, Sfx, Stage, TypeOn, Variant, base, baseSchema, useFormat } from "./primitives";
import { MarkerLayer, MarkerStroke, roughArrow, roughEllipse, roughLine } from "./marker";
import { piz } from "./theme";

// Marker annotation: a statement card (rows of label / amount) on the board; a blue marker circles
// the key row's amount, a curved arrow runs to a handwritten note, and an optional red marker
// strikes another row. Circle, arrow and note land in that order (circle on its beat).

export const annotateSchema = baseSchema.extend({
  heading: z.string(),
  accent: z.string(),
  title: z.string().describe("Card title bar"),
  rows: z.array(z.object({ label: z.string(), value: z.string() })).min(2).max(5),
  target: z.number().min(0).max(4).describe("Row whose value gets circled"),
  strike: z.number().min(-1).max(4).describe("Row struck through in red (-1 = none)"),
  note: z.string(),
  circleAt: z.number().min(0).describe("Seconds"),
  source: z.string(),
});
type Props = z.infer<typeof annotateSchema>;

export const Annotate: React.FC<Props> = (p) => {
  const { fps } = useVideoConfig();
  const { isVertical, safeBox, width, height } = useFormat();
  const circleAt = Math.round(p.circleAt * fps);
  const arrowAt = circleAt + 12;
  const noteAt = arrowAt + 8;
  const strikeAt = circleAt - 14;
  const winW = isVertical ? safeBox.w - piz.ui.hardShadow : 960;
  const barH = 76;
  const rowH = isVertical ? 104 : 96;
  const winH = barH + 20 + p.rows.length * rowH + 20;
  const winX = isVertical ? safeBox.x : safeBox.x + 40;
  const winY = isVertical ? safeBox.y + 300 : Math.round((height - winH) / 2) + 40;
  const rowCy = (i: number) => winY + barH + 20 + i * rowH + rowH / 2;
  const valueRight = winX + winW - 40;
  const fs = isVertical ? 48 : 46;
  const tv = p.rows[p.target]?.value ?? "";
  const valueW = Array.from(tv).length * fs * 0.62;
  const cx = valueRight - valueW / 2;
  const cy = rowCy(p.target);
  const noteX = isVertical ? safeBox.x + 40 : winX + winW + 90;
  const noteY = isVertical ? winY + winH + 150 : cy + 150;
  const [shaft, head] = isVertical
    ? roughArrow(noteX + 260, noteY - 20, cx - valueW * 0.3, cy + rowH * 0.55, "ann", -0.25)
    : roughArrow(noteX + 40, noteY - 30, cx + valueW * 0.55 + 20, cy + 30, "ann", 0.3);
  return (
    <Stage backing={p.backing} safeGuide={p.safeGuide}>
      <div style={{ position: "absolute", left: safeBox.x, width: isVertical ? safeBox.w : winW + 80, top: isVertical ? safeBox.y + 20 : winY - 150, display: "flex", justifyContent: isVertical ? "center" : "flex-start" }}>
        <TypeOn text={p.heading} accent={p.accent} at={4} align={isVertical ? "center" : "left"} fontSize={isVertical ? 96 : 90} />
      </div>
      <Drop at={2} style={{ position: "absolute", left: winX, top: winY }}>
        <div style={{ width: winW, height: winH, boxSizing: "border-box", border: `${piz.ui.border}px solid ${piz.color.ink}`, background: piz.color.white, boxShadow: `${piz.ui.hardShadow}px ${piz.ui.hardShadow}px 0 ${piz.ui.shadowColor}` }}>
          <div style={{ height: barH, boxSizing: "border-box", borderBottom: `${piz.ui.border}px solid ${piz.color.ink}`, background: piz.color.bar, display: "flex", alignItems: "center", gap: 14, padding: "0 24px" }}>
            <div style={{ width: 18, height: 18, background: piz.color.ink }} />
            <div style={{ font: `700 34px ${piz.font.caption}`, color: piz.color.ink }}>{p.title}</div>
          </div>
          <div style={{ padding: "20px 36px" }}>
            {p.rows.map((r, i) => (
              <div key={i} style={{ height: rowH, display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: i < p.rows.length - 1 ? `3px solid ${piz.color.greyLight}` : undefined }}>
                <div style={{ font: `500 ${fs * 0.86}px ${piz.font.caption}`, color: "#444" }}>{r.label}</div>
                <div style={{ font: `700 ${fs}px ${piz.font.label}`, color: piz.color.ink }}>{r.value}</div>
              </div>
            ))}
          </div>
        </div>
      </Drop>
      <MarkerLayer width={width} height={height}>
        {p.strike >= 0 && p.strike < p.rows.length ? (
          <MarkerStroke d={roughLine(winX + 30, rowCy(p.strike) + 4, winX + winW - 30, rowCy(p.strike) - 4, "strike", 0.01)} at={strikeAt} frames={8} color={piz.color.alert} width={8} />
        ) : null}
        <MarkerStroke d={roughEllipse(cx, cy, valueW / 2 + 42, rowH * 0.48, "circle")} at={circleAt} frames={12} width={9} />
        <MarkerStroke d={shaft} at={arrowAt} frames={8} width={8} />
        <MarkerStroke d={head} at={arrowAt + 7} frames={4} width={8} />
      </MarkerLayer>
      <div style={{ position: "absolute", left: noteX, top: noteY - 40, width: isVertical ? safeBox.w - 80 : width - noteX - 140 }}>
        <HandNote text={p.note} at={noteAt} color={piz.color.accentDark} fontSize={isVertical ? 76 : 70} align="left" />
      </div>
      <div style={{ position: "absolute", left: safeBox.x, width: safeBox.w, top: safeBox.y + safeBox.h - 40, textAlign: "center", font: `500 28px ${piz.font.caption}`, color: piz.color.muted }}>{p.source}</div>
      <Sfx kind="type" at={4} frames={Array.from(p.heading).length + 2} on={p.sfx} />
      {p.strike >= 0 ? <Sfx kind="strike" at={strikeAt} on={p.sfx} /> : null}
      <Sfx kind="marker" at={circleAt} on={p.sfx} />
      <Sfx kind="marker" at={arrowAt} on={p.sfx} volume={0.28} />
      <Sfx kind="click" at={noteAt} on={p.sfx} volume={0.2} />
    </Stage>
  );
};

const common: Props = {
  ...base("board", 5),
  heading: "LA LETRA CHIQUITA",
  accent: "CHIQUITA",
  title: "Tu fondo de inversión",
  rows: [
    { label: "Rendimiento anual", value: "10%" },
    { label: "Comisión anual", value: "2.5%" },
    { label: "Rendimiento real", value: "7.5%" },
  ],
  target: 1,
  strike: 0,
  note: "esto se come tu ganancia",
  circleAt: 1.3,
  source: "dato de ejemplo",
};

export const annotateVariants: Variant<Props>[] = [
  { id: "circle-strike", props: common, horizontal: true },
  { id: "circle", props: { ...common, strike: -1, target: 2, note: "lo que de verdad ganas", heading: "FÍJATE AQUÍ", accent: "AQUÍ" }, horizontal: true },
];

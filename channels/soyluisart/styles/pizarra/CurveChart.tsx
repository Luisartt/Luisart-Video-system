import { useCurrentFrame } from "remotion";
import { z } from "zod";
import { HandNote, Sfx, Stage, Variant, base, baseSchema } from "./primitives";
import { MarkerLayer, MarkerStroke, fmtMx, roughEllipse, roughLine } from "./marker";
import { Float, MarkerArrow, MascotSprite, SAMPLE, SourceLabel, ZoneHeading, exprField, mascotField, niceStep, useZone } from "./financeKit";
import { piz } from "./theme";

// Marker curve charts (CFA topics), scaled from the data:
// · frontera — risk (x) vs return (y): the assets pop as dots with hand labels, the efficient
//   frontier is drawn on, then the capital line from the risk-free point, and the frontier point
//   with the best return per unit of risk (max (y − rf) / x, computed) pops, gets circled and
//   labelled "mejor relación"; an arrow brings the hand note.
// · rendimientos — yield curve by term: the normal (rising) curve draws on in blue, then it turns
//   into a dashed ghost and the inverted curve draws on in red (the "bad" signal) with a thud;
//   an arrow brings the hand note.

const xy = z.object({ x: z.number(), y: z.number() });

export const curveChartSchema = baseSchema.extend({
  mode: z.enum(["frontera", "rendimientos"]),
  heading: z.string(),
  accent: z.string(),
  xTitle: z.string(),
  yTitle: z.string(),
  unit: z.string().describe("Suffix for the axis numbers, e.g. %"),
  curve: z.array(xy).min(3).describe("frontera: frontier samples (x = risk, y = return) · rendimientos: normal curve (x = term index)"),
  curve2: z.array(xy).describe("rendimientos: inverted curve (same x); frontera: empty"),
  categories: z.array(z.string()).describe("rendimientos: term labels under the x axis; frontera: empty (numeric ticks)"),
  points: z.array(z.object({ label: z.string(), x: z.number(), y: z.number(), pos: z.enum(["right", "left", "above", "below"]).describe("Where the hand label sits") })).describe("frontera: assets as dots"),
  rf: z.number().describe("frontera: risk-free return (start of the capital line)"),
  label1: z.string().describe("Hand label on the first curve"),
  label2: z.string().describe("Hand label on the best point (frontera) / the second curve (rendimientos)"),
  mascot: mascotField.describe("Shown in the side column on horizontal only"),
  mascotFrom: exprField,
  mascotTo: exprField,
  note: z.string(),
  source: z.string(),
});
type Props = z.infer<typeof curveChartSchema>;

/** Smooth path through points (Catmull-Rom → cubic Bézier). */
const smooth = (pts: [number, number][]) => {
  if (pts.length < 2) return "";
  let d = `M${pts[0][0].toFixed(1)},${pts[0][1].toFixed(1)}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[Math.min(pts.length - 1, i + 2)];
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += ` C${c1[0].toFixed(1)},${c1[1].toFixed(1)} ${c2[0].toFixed(1)},${c2[1].toFixed(1)} ${p2[0].toFixed(1)},${p2[1].toFixed(1)}`;
  }
  return d;
};

export const CurveChart: React.FC<Props> = (p) => {
  const frame = useCurrentFrame();
  const { isVertical, width, height, z: zone } = useZone();
  const V = isVertical;
  const F = p.mode === "frontera";
  if (!F && (p.curve2.length !== p.curve.length || p.categories.length !== p.curve.length)) throw new Error("CurveChart: yield curves and categories must match");

  // ── Layout ──
  const L = V
    ? { x0: 214, x1: 888, y0: 392, y1: 764, headTop: 256, tick: 26, title: 32, note: { x: 128, y: 850, w: 780, size: 46 }, source: { x: 520, y: 944, w: 400 }, mascot: null as null | { x: number; y: number; size: number }, ptLabel: 30 }
    : { x0: 280, x1: 1250, y0: 226, y1: 680, headTop: 96, tick: 28, title: 36, note: p.mode === "frontera" ? { x: 880, y: 536, w: 380, size: 44 } : { x: 400, y: 224, w: 640, size: 40 }, source: { x: 1330, y: 748, w: 450 }, mascot: { x: 1440, y: 220, size: 288 }, ptLabel: 34 };

  // ── Scales from the data ──
  const allY = [...p.curve, ...p.curve2, ...p.points].map((q) => q.y).concat(F ? [p.rf, 0] : []);
  const yMax = Math.max(...allY) * (F ? 1.12 : 1.08);
  const yMin = F ? 0 : Math.max(0, Math.min(...allY) - (Math.max(...allY) - Math.min(...allY)) * 0.6);
  const yStep = niceStep(yMax - yMin, 4);
  const xMax = F ? Math.max(...[...p.curve, ...p.points].map((q) => q.x)) * 1.1 : p.curve.length - 1;
  const xStep = F ? niceStep(xMax, 4) : 1;
  const px = (x: number) => (F ? L.x0 + (x / xMax) * (L.x1 - L.x0 - 20) : L.x0 + 40 + (x / Math.max(1, xMax)) * (L.x1 - L.x0 - 80));
  const py = (y: number) => L.y1 - ((y - yMin) / (yMax - yMin)) * (L.y1 - L.y0);
  const yTicks: number[] = [];
  for (let v = Math.ceil(yMin / yStep) * yStep; v <= yMax + 1e-9; v += yStep) yTicks.push(v);
  const xTicks: number[] = [];
  if (F) for (let v = 0; v <= xMax + 1e-9; v += xStep) xTicks.push(v);
  const dec = (s: number) => (Number.isInteger(s) ? 0 : 1);

  // ── Timing ──
  const headAt = 2;
  const axisAt = 6;
  const ptAt = (i: number) => 16 + i * 6;
  const c1At = F ? ptAt(p.points.length) + 4 : 16;
  const c1Frames = 22;
  const lineAt = c1At + c1Frames + 6; // frontera: capital line
  const bestAt = lineAt + 14;
  const swapAt = c1At + c1Frames + 36; // rendimientos: inversion (the normal curve holds ~1.2 s first)
  const c2Frames = 22;
  const keyAt = F ? bestAt : swapAt; // the reveal beat
  const circleAt = F ? bestAt + 8 : swapAt + c2Frames + 2;
  const arrowAt = circleAt + 14;
  const noteAt = arrowAt + 6;

  const c1 = p.curve.map((q) => [px(q.x), py(q.y)] as [number, number]);
  const c2 = p.curve2.map((q) => [px(q.x), py(q.y)] as [number, number]);
  // Best return per unit of risk on the frontier (computed).
  const bestIdx = F ? p.curve.reduce((b, q, i) => ((q.y - p.rf) / q.x > (p.curve[b].y - p.rf) / p.curve[b].x ? i : b), 0) : -1;
  const best = F ? p.curve[bestIdx] : null;
  const bx = best ? px(best.x) : 0;
  const by = best ? py(best.y) : 0;
  // Capital line from (0, rf) through the best point, extended by 35 %.
  const lineEnd = best ? { x: best.x * 1.35, y: p.rf + (best.y - p.rf) * 1.35 } : null;
  // Arrow target: the best point (frontera) or the short end of the inverted curve (rendimientos).
  const arrow = V
    ? F
      ? { x1: bx + 80, y1: L.note.y - 6, x2: bx + 12, y2: by + 34, bend: 0.15 }
      : { x1: c2[0][0] + 42, y1: L.note.y - 6, x2: c2[0][0] + 12, y2: c2[0][1] + 26, bend: -0.04 } // passes between the 1m and 3m labels
    : F
      ? { x1: L.note.x - 6, y1: L.note.y + 22, x2: bx + 18, y2: by + 28, bend: 0.2 }
      : { x1: L.note.x - 10, y1: L.note.y + 34, x2: c2[0][0] + 12, y2: c2[0][1] - 24, bend: 0.2 };
  const ghost = !F && frame >= swapAt;

  return (
    <Stage backing={p.backing} safeGuide={p.safeGuide}>
      <ZoneHeading text={p.heading} accent={p.accent} at={headAt} left={zone.x} top={L.headTop} width={zone.w} max={V ? 70 : 80} sfx={p.sfx} accentColor={F ? piz.color.accent : piz.color.alert} />
      {/* axis numbers and titles */}
      {yTicks.map((v, i) => (
        <div key={`y${i}`} style={{ position: "absolute", left: L.x0 - 100, width: 86, top: py(v) - L.tick * 0.62, textAlign: "right", font: `700 ${L.tick}px ${piz.font.label}`, color: piz.color.muted, visibility: frame >= axisAt + 4 ? "visible" : "hidden" }}>
          {fmtMx(v, dec(yStep))}
          {p.unit}
        </div>
      ))}
      {F
        ? xTicks.map((v, i) => (
            <div key={`x${i}`} style={{ position: "absolute", left: px(v) - 50, width: 100, top: L.y1 + 10, textAlign: "center", font: `700 ${L.tick}px ${piz.font.label}`, color: piz.color.muted, visibility: frame >= axisAt + 4 ? "visible" : "hidden" }}>
              {fmtMx(v, dec(xStep))}
              {p.unit}
            </div>
          ))
        : p.categories.map((c, i) => (
            <div key={`c${i}`} style={{ position: "absolute", left: px(i) - 50, width: 100, top: L.y1 + 10, textAlign: "center", font: `700 ${L.tick}px ${piz.font.label}`, color: piz.color.muted, visibility: frame >= axisAt + 4 ? "visible" : "hidden" }}>
              {c}
            </div>
          ))}
      <div style={{ position: "absolute", left: L.x0 + 10, top: L.y0 - L.title - 12, font: `400 ${L.title}px ${piz.font.hand}`, color: piz.color.handInk, visibility: frame >= axisAt + 6 ? "visible" : "hidden", whiteSpace: "nowrap" }}>{p.yTitle}</div>
      <div style={{ position: "absolute", left: L.x1 - 400, width: 400, top: L.y1 + L.tick + 18, textAlign: "right", font: `400 ${L.title}px ${piz.font.hand}`, color: piz.color.handInk, visibility: frame >= axisAt + 6 ? "visible" : "hidden" }}>{p.xTitle}</div>
      <MarkerLayer width={width} height={height}>
        <MarkerStroke d={roughLine(L.x0 - 8, L.y1, L.x1, L.y1, "kx", 0.004)} at={axisAt} frames={10} color={piz.color.ink} width={6} />
        <MarkerStroke d={roughLine(L.x0, L.y1 + 8, L.x0 + 3, L.y0 - 10, "ky", 0.008)} at={axisAt + 3} frames={8} color={piz.color.ink} width={6} />
        {/* frontera: assets as dots */}
        {F
          ? p.points.map((q, i) =>
              frame >= ptAt(i) ? <circle key={i} cx={px(q.x)} cy={py(q.y)} r={11} fill={piz.color.white} stroke={piz.color.ink} strokeWidth={5} /> : null,
            )
          : null}
        {/* first curve (frontier / normal yield curve); becomes a dashed ghost after the swap */}
        {ghost ? (
          <path d={smooth(c1)} fill="none" stroke={piz.color.pending} strokeWidth={6} strokeDasharray="4 16" strokeLinecap="round" />
        ) : (
          <MarkerStroke d={smooth(c1)} at={c1At} frames={c1Frames} color={piz.color.accent} width={9} />
        )}
        {!F && !ghost
          ? c1.map(([x, y], i) => (frame >= c1At + Math.round((i / (c1.length - 1)) * c1Frames) ? <circle key={i} cx={x} cy={y} r={9} fill={piz.color.white} stroke={piz.color.accent} strokeWidth={5} /> : null))
          : null}
        {/* rendimientos: the inverted curve in red */}
        {!F ? <MarkerStroke d={smooth(c2)} at={swapAt} frames={c2Frames} color={piz.color.alert} width={9} /> : null}
        {!F
          ? c2.map(([x, y], i) => {
              const at = swapAt + Math.round((i / (c2.length - 1)) * c2Frames);
              // The short end (the alarm) keeps pulsing once the curve is drawn.
              const r = i === 0 && frame >= circleAt ? 11 + 2.5 * Math.sin((frame - circleAt) / 7) : 9;
              return frame >= at ? <circle key={i} cx={x} cy={y} r={r} fill={i === 0 && frame >= circleAt ? piz.color.alert : piz.color.white} stroke={piz.color.alert} strokeWidth={5} /> : null;
            })
          : null}
        {/* frontera: capital line + best point */}
        {F && best && lineEnd ? (
          <>
            {frame >= lineAt ? <circle cx={px(0)} cy={py(p.rf)} r={10} fill={piz.color.ink} /> : null}
            <MarkerStroke d={roughLine(px(0), py(p.rf), px(lineEnd.x), py(lineEnd.y), "cml", 0.01)} at={lineAt} frames={10} color={piz.color.handInk} width={5} />
            {frame >= bestAt ? <circle cx={bx} cy={by} r={16 + 2 * Math.sin((frame - bestAt) / 7)} fill={piz.color.accent} stroke={piz.color.ink} strokeWidth={5} /> : null}
            <MarkerStroke d={roughEllipse(bx, by, 46, 40, "best")} at={circleAt} frames={12} color={piz.color.accentDark} width={7} />
          </>
        ) : null}
        <MarkerArrow {...arrow} at={arrowAt} seed="ca" color={piz.color.ink} width={7} />
      </MarkerLayer>
      {/* hand labels */}
      {F
        ? p.points.map((q, i) => (
            <div
              key={i}
              style={{
                position: "absolute",
                left: q.pos === "right" ? px(q.x) + 16 : q.pos === "left" ? px(q.x) - 316 : px(q.x) - 150,
                width: 300,
                textAlign: q.pos === "right" ? "left" : q.pos === "left" ? "right" : "center",
                top: q.pos === "above" ? py(q.y) - L.ptLabel - 22 : q.pos === "below" ? py(q.y) + 14 : py(q.y) - L.ptLabel * 0.62,
                font: `400 ${L.ptLabel}px ${piz.font.hand}`,
                color: piz.color.handInk,
                whiteSpace: "nowrap",
                visibility: frame >= ptAt(i) + 2 ? "visible" : "hidden",
              }}
            >
              {q.label}
            </div>
          ))
        : null}
      {F ? (
        <div style={{ position: "absolute", left: px(0) + 18, top: py(p.rf) + 4, font: `400 ${L.ptLabel}px ${piz.font.hand}`, color: piz.color.handInk, whiteSpace: "nowrap", visibility: frame >= lineAt + 2 ? "visible" : "hidden" }}>sin riesgo</div>
      ) : null}
      {(() => {
        // label1: at the end of the first curve; label2: next to the best point / at the end of curve 2.
        const e1 = c1[c1.length - 1];
        const l1 = F ? { x: e1[0] - 250, y: e1[1] - L.ptLabel - 26, at: c1At + c1Frames } : { x: e1[0] - 250, y: e1[1] - L.ptLabel - 30, at: c1At + c1Frames };
        const l2 = F ? { x: bx - 300, y: by - L.ptLabel - 44, at: circleAt + 4 } : { x: c2[c2.length - 1][0] - 260, y: c2[c2.length - 1][1] + 16, at: swapAt + c2Frames };
        return (
          <>
            <div style={{ position: "absolute", left: l1.x - 60, width: 310, top: l1.y, textAlign: "right", visibility: frame >= l1.at ? "visible" : "hidden" }}>
              <HandNote text={p.label1} at={l1.at} fontSize={L.ptLabel + 4} align="right" color={ghost ? piz.color.muted : piz.color.accentDark} style={{ padding: "0 10px", whiteSpace: "nowrap" }} />
            </div>
            <div style={{ position: "absolute", left: l2.x, width: F ? 280 : 260, top: l2.y, textAlign: "right" }}>
              <HandNote text={p.label2} at={l2.at} fontSize={L.ptLabel + 6} align="right" color={F ? piz.color.accent : piz.color.alert} style={{ padding: "0 10px", whiteSpace: "nowrap" }} />
            </div>
          </>
        );
      })()}
      {L.mascot ? (
        <div style={{ position: "absolute", left: L.mascot.x, top: L.mascot.y }}>
          <MascotSprite character={p.mascot} size={L.mascot.size} at={10} faces={[{ expr: p.mascotFrom, at: 0 }, { expr: p.mascotTo, at: keyAt }]} />
        </div>
      ) : null}
      <div style={{ position: "absolute", left: L.note.x, top: L.note.y, width: L.note.w }}>
        <Float px={4} phase={13}>
          <HandNote text={p.note} at={noteAt} fontSize={L.note.size} align={V ? "center" : "left"} color={F ? piz.color.accentDark : piz.color.alert} style={{ padding: "0 14px" }} />
        </Float>
      </div>
      <SourceLabel text={p.source} left={L.source.x} top={L.source.y} width={L.source.w} align={V ? "right" : "left"} size={24} />
      <Sfx kind="marker" at={axisAt} on={p.sfx} volume={0.3} />
      {L.mascot ? <Sfx kind="pop" at={10} on={p.sfx} volume={0.2} /> : null}
      {F ? p.points.map((_, i) => <Sfx key={i} kind="minimal" at={ptAt(i)} on={p.sfx} volume={0.2} />) : null}
      <Sfx kind="markerWrite" at={c1At} frames={c1Frames} on={p.sfx} volume={0.22} />
      {F ? <Sfx kind="marker" at={lineAt} on={p.sfx} volume={0.3} /> : null}
      {F ? <Sfx kind="ding" at={bestAt} on={p.sfx} /> : null}
      {!F ? <Sfx kind="thud" at={swapAt} on={p.sfx} /> : null}
      {!F ? <Sfx kind="markerWrite" at={swapAt + 2} frames={c2Frames} on={p.sfx} volume={0.2} /> : null}
      {F ? <Sfx kind="marker" at={circleAt} on={p.sfx} /> : null}
      <Sfx kind="marker" at={arrowAt} on={p.sfx} volume={0.32} />
    </Stage>
  );
};

// Frontier sample (the "bullet"): σ(r) = √(36 + 6·(r − 5)²) for r from 3.5 % to 11 %, minimum risk
// 6 % at r = 5 %. With a 3 % risk-free rate the best ratio lands at r = 8 %, σ ≈ 9.5 % (computed
// in the component as max (r − rf) / σ).
const FRONTIER = Array.from({ length: 31 }, (_, i) => {
  const r = 3.5 + i * 0.25;
  return { x: Math.round(Math.sqrt(36 + 6 * (r - 5) ** 2) * 100) / 100, y: r };
});
const TERMS = ["1m", "3m", "6m", "1a", "2a", "5a", "10a", "30a"];
const NORMAL = [4.0, 4.2, 4.4, 4.7, 5.1, 5.8, 6.3, 6.8];
const INVERTED = [5.6, 5.5, 5.4, 5.1, 4.7, 4.3, 4.1, 4.0];

export const curveChartVariants: Variant<Props>[] = [
  {
    id: "frontera",
    horizontal: true,
    props: {
      ...base("board", 6),
      mode: "frontera",
      heading: "LA FRONTERA EFICIENTE",
      accent: "EFICIENTE",
      xTitle: "riesgo",
      yTitle: "rendimiento esperado",
      unit: "%",
      curve: FRONTIER,
      curve2: [],
      categories: [],
      points: [
        { label: "bonos", x: 7.5, y: 4.5, pos: "right" },
        { label: "oro", x: 13, y: 6, pos: "right" },
        { label: "acciones globales", x: 15, y: 9, pos: "below" },
        { label: "acciones MX", x: 18.5, y: 10, pos: "above" },
      ],
      rf: 3,
      label1: "frontera eficiente",
      label2: "mejor relación",
      mascot: "bit-analista-base",
      mascotFrom: "pensando",
      mascotTo: "feliz",
      note: "más rendimiento por cada unidad de riesgo",
      source: SAMPLE,
    },
  },
  {
    id: "rendimientos",
    horizontal: true,
    props: {
      ...base("board", 7),
      mode: "rendimientos",
      heading: "CURVA INVERTIDA",
      accent: "INVERTIDA",
      xTitle: "plazo",
      yTitle: "tasa anual",
      unit: "%",
      curve: NORMAL.map((y, x) => ({ x, y })),
      curve2: INVERTED.map((y, x) => ({ x, y })),
      categories: TERMS,
      points: [],
      rf: 0,
      label1: "normal",
      label2: "invertida",
      mascot: "bit-economista-base",
      mascotFrom: "feliz",
      mascotTo: "sorpresa",
      note: "el corto plazo paga más: señal de alerta",
      source: SAMPLE,
    },
  },
];

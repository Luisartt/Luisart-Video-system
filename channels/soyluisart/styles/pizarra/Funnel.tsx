import { interpolate, random, useCurrentFrame } from "remotion";
import { z } from "zod";
import { HandNote, Sfx, Stage, TypeOn, Variant, base, baseSchema, clamp, useFormat } from "./primitives";
import { MarkerStroke, fmtMx, roughEllipse } from "./marker";
import { At, BoxSvg, Breathe, DiagramBox, MarkerArrow, MascotImg, SourceLabel, faceAt, fitFont, fmtPct, mascotExprField, mascotKeyField, pixelPerson } from "./diagramKit";
import { piz } from "./theme";

// Sales / content funnel (2026-09-29): a pixel funnel whose stages (stepped trapezoid bands, ink
// border + hard shadow) drop in top → bottom, each number counting up inside its band (Mexican
// format). A marker arrow on the right joins each band to the next with the conversion % computed
// from the data (value ÷ previous value). Little pixel "people" pour into the mouth all the time and
// only a few drip out of the spout (constant motion). At the end the last stage is circled in marker,
// the final hand note gets the overall conversion ({total} = last ÷ first) and the mascot reacts.

const stageSchema = z.object({ label: z.string(), value: z.number().positive() });
export const funnelSchema = baseSchema.extend({
  heading: z.string(),
  accent: z.string().describe("Heading words drawn blue"),
  stages: z.array(stageSchema).min(3).max(5).describe("Top → bottom; each value should be smaller than the one above"),
  every: z.number().min(8).max(40).describe("Frames between stages"),
  note: z.string().describe("Final hand note; {total} is replaced by the computed overall conversion (last ÷ first)"),
  source: z.string().describe("Sample-data label, e.g. \"dato de ejemplo\""),
  mascot: mascotKeyField,
  mascotFrom: mascotExprField,
  mascotTo: mascotExprField.describe("Face after the result lands"),
});
type Props = z.infer<typeof funnelSchema>;

const COUNT = 16; // frames per count-up

const geometry = (isVertical: boolean) =>
  isVertical
    ? { W: 880, H: 900, head: 70, cx: 370, pourTop: 92, topY: 176, bottomY: 680, hwTop: 316, hwBot: 100, spoutHw: 40, spoutH: 40, drip: 36, noteY: 800, noteX: 0, noteW: 880, noteFs: 54, mascotX: 650, mascotY: 590, mascotSize: 208, sourceX: 10, sourceY: 730 }
    : { W: 1700, H: 720, head: 72, cx: 600, pourTop: 88, topY: 150, bottomY: 590, hwTop: 400, hwBot: 130, spoutHw: 46, spoutH: 40, drip: 60, noteY: 470, noteX: 1150, noteW: 560, noteFs: 60, mascotX: 1302, mascotY: 170, mascotSize: 256, sourceX: 0, sourceY: 690 };

export const Funnel: React.FC<Props> = (p) => {
  const frame = useCurrentFrame();
  const { isVertical } = useFormat();
  const g = geometry(isVertical);
  const n = p.stages.length;
  const gap = 16;
  const bandH = Math.floor((g.bottomY - g.topY - (n - 1) * gap) / n);
  const hw = (y: number) => g.hwTop + ((g.hwBot - g.hwTop) * (y - g.topY)) / (g.bottomY - g.topY);
  const y0 = (i: number) => g.topY + i * (bandH + gap);
  const y1 = (i: number) => y0(i) + bandH;
  const spoutTop = y1(n - 1);

  // Timing (frames).
  const headLen = Array.from(p.heading).length;
  const headAt = 2;
  const B = (i: number) => headAt + headLen + 4 + i * p.every; // band i lands
  const countStart = (i: number) => B(i) + 2;
  const countEnd = (i: number) => countStart(i) + COUNT;
  const arrowAt = (i: number) => B(i) + 7; // arrow from band i-1 into band i
  const lastSettle = countEnd(n - 1);
  const circleAt = lastSettle + 8;
  const resultAt = circleAt + 10;

  const first = p.stages[0].value;
  const last = p.stages[n - 1].value;
  const note = p.note.replace("{total}", fmtPct(last / first));
  const headFs = fitFont(p.heading, g.W - 20, g.head, 0.62);

  // Stepped (pixel) band outline between y0 and y1.
  const bandPoints = (a: number, b: number) => {
    const steps = Math.max(2, Math.round((b - a) / 14));
    const sh = (b - a) / steps;
    const right: [number, number][] = [];
    let x = Math.round(g.cx + hw(a));
    right.push([x, a]);
    for (let s = 1; s <= steps; s++) {
      const y = Math.round(a + s * sh);
      right.push([x, y]);
      x = Math.round(g.cx + hw(y));
      right.push([x, y]);
    }
    const left = right.map(([px, py]) => [Math.round(2 * g.cx - px), py] as [number, number]).reverse();
    return [...right, ...left].map((q) => q.join(",")).join(" ");
  };

  // Pixel people pouring into the mouth (from the first band) and dripping out of the spout (from the last).
  const particles = () => {
    const out: React.ReactNode[] = [];
    if (frame >= B(0)) {
      for (let j = 0; j < 10; j++) {
        const period = 40 + Math.round(random(`fp${j}`) * 12);
        const t = ((frame - B(0) + random(`fq${j}`) * period) % period) / period;
        const x = g.cx - 12 + (((j + 0.5) / 10) * 2 - 1) * g.hwTop * 0.8 + (random(`fx${j}`) - 0.5) * 30;
        const y = g.pourTop + t * (g.topY - g.pourTop + 6);
        out.push(...pixelPerson(`p${j}`, x, y, 4, j % 3 === 0 ? piz.color.accent : piz.color.ink));
      }
    }
    if (frame >= B(n - 1)) {
      for (let j = 0; j < 2; j++) {
        const period = 44;
        const t = ((frame - B(n - 1) + j * 22) % period) / period;
        out.push(...pixelPerson(`d${j}`, g.cx - 12 + (j === 0 ? -10 : 10), spoutTop + g.spoutH + 4 + t * g.drip, 4, piz.color.accent));
      }
    }
    return <>{out}</>;
  };

  const drop = (at: number) => {
    const t = interpolate(frame, [at, at + 4], [0, 1], { ...clamp, easing: piz.ease.out });
    return { opacity: frame < at ? 0 : t, dy: Math.round((t - 1) * 10) };
  };

  return (
    <Stage backing={p.backing} safeGuide={p.safeGuide}>
      <DiagramBox w={g.W} h={g.H}>
        <At x={0} y={0} w={g.W}>
          <TypeOn text={p.heading} accent={p.accent} at={headAt} fontSize={headFs} />
        </At>
        <BoxSvg w={g.W} h={g.H}>
          {particles()}
          {/* Spout: appears with the last band. */}
          {frame >= B(n - 1) ? (
            <g>
              <rect x={g.cx - g.spoutHw + 9} y={spoutTop + 9} width={g.spoutHw * 2} height={g.spoutH} fill={piz.ui.shadowColor} />
              <rect x={g.cx - g.spoutHw} y={spoutTop - 2} width={g.spoutHw * 2} height={g.spoutH + 2} fill={piz.color.accent} stroke={piz.color.ink} strokeWidth={5} />
            </g>
          ) : null}
          {p.stages.map((_, i) => {
            const d = drop(B(i));
            const pts = bandPoints(y0(i), y1(i));
            const lastBand = i === n - 1;
            return (
              <g key={i} opacity={d.opacity} transform={`translate(0 ${d.dy})`}>
                <polygon points={pts} fill={piz.ui.shadowColor} transform="translate(9 9)" />
                <polygon points={pts} fill={lastBand ? piz.color.accent : i % 2 === 0 ? piz.color.tint : piz.color.white} stroke={piz.color.ink} strokeWidth={5} strokeLinejoin="miter" />
              </g>
            );
          })}
          {/* Conversion arrows on the right, band i-1 → band i. */}
          {p.stages.map((_, i) => {
            if (i === 0) return null;
            const xs = g.cx + hw(y1(i - 1) - 20) + 18;
            const ys = y1(i - 1) - 24;
            const xe = g.cx + hw(y0(i) + 24) + 18;
            const ye = y0(i) + 24;
            return <MarkerArrow key={i} x1={xs} y1={ys} x2={xe} y2={ye} at={arrowAt(i)} seed={`fa${i}`} bend={-0.55} head={18} frames={7} color={piz.color.accentDark} width={6} />;
          })}
          {/* Winner circle around the last stage. */}
          <MarkerStroke d={roughEllipse(g.cx, (y0(n - 1) + y1(n - 1)) / 2, hw(y0(n - 1)) + 40, bandH / 2 + 20, "fcirc")} at={circleAt} frames={12} color={piz.color.accent} width={8} />
        </BoxSvg>
        {/* Band contents: label + counted number. */}
        {p.stages.map((s, i) => {
          const d = drop(B(i));
          const mid = hw((y0(i) + y1(i)) / 2);
          const lastBand = i === n - 1;
          const t = interpolate(frame, [countStart(i), countEnd(i)], [0, 1], { ...clamp, easing: piz.ease.out });
          const val = frame >= countEnd(i) ? s.value : Math.round(s.value * t);
          const w = Math.round(mid * 2 - 30);
          const fsL = Math.min(Math.round(bandH * 0.26), fitFont(s.label, w, 40, 0.58));
          const fsN = Math.min(Math.round(bandH * 0.44), fitFont(fmtMx(s.value), w, 60, 0.6));
          return (
            <At key={i} x={g.cx - w / 2} y={y0(i) + d.dy} w={w} h={bandH} style={{ opacity: d.opacity, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 2 }}>
              <div style={{ font: `700 ${fsL}px ${piz.font.caption}`, color: lastBand ? piz.color.white : piz.color.ink, lineHeight: 1, whiteSpace: "nowrap" }}>{s.label}</div>
              <div style={{ font: `800 ${fsN}px ${piz.font.heading}`, color: lastBand ? piz.color.white : piz.color.ink, lineHeight: 1, fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap" }}>{fmtMx(val)}</div>
            </At>
          );
        })}
        {/* Conversion notes. */}
        {p.stages.map((s, i) => {
          if (i === 0) return null;
          const x = Math.max(g.cx + hw(y1(i - 1) - 20), g.cx + hw(y0(i) + 24)) + 48;
          const y = (y1(i - 1) + y0(i)) / 2 - 30;
          return (
            <At key={i} x={x} y={y} w={260}>
              <HandNote text={fmtPct(s.value / p.stages[i - 1].value)} at={arrowAt(i) + 3} fontSize={52} color={piz.color.accentDark} align="left" style={{ padding: "0 10px" }} />
            </At>
          );
        })}
        <At x={g.noteX} y={g.noteY} w={g.noteW} style={{ display: "flex", justifyContent: "center" }}>
          <Breathe at={resultAt}>
            <HandNote text={note} at={resultAt} fontSize={g.noteFs} color={piz.color.accentDark} style={{ padding: "0 14px" }} />
          </Breathe>
        </At>
        {p.mascot ? (
          <At x={g.mascotX} y={g.mascotY} style={{ opacity: frame >= headAt ? 1 : 0 }}>
            <MascotImg character={p.mascot} expr={faceAt(frame, [[0, p.mascotFrom], [resultAt, p.mascotTo]])} size={g.mascotSize} />
          </At>
        ) : null}
        <At x={g.sourceX} y={g.sourceY}>
          <SourceLabel text={p.source} />
        </At>
      </DiagramBox>
      <Sfx kind="type" at={headAt} frames={headLen + 2} on={p.sfx} />
      {p.stages.map((_, i) => (
        <Sfx key={`pop${i}`} kind="pop" at={B(i)} on={p.sfx} volume={0.25} />
      ))}
      <Sfx kind="counter" at={countStart(0)} frames={countEnd(n - 1) - countStart(0)} on={p.sfx} volume={0.22} />
      {p.stages.map((_, i) => (i === 0 ? null : <Sfx key={`mk${i}`} kind="marker" at={arrowAt(i)} on={p.sfx} volume={0.3} />))}
      <Sfx kind="bleep" at={lastSettle} on={p.sfx} volume={0.25} />
      <Sfx kind="marker" at={circleAt} on={p.sfx} />
      <Sfx kind="ding" at={resultAt} on={p.sfx} />
    </Stage>
  );
};

export const funnelVariants: Variant<Props>[] = [
  {
    id: "ventas",
    horizontal: true,
    props: {
      ...base("board", 6),
      heading: "EL EMBUDO DE VENTAS",
      accent: "VENTAS",
      stages: [
        { label: "Alcance", value: 20000 },
        { label: "Interés", value: 5000 },
        { label: "Prospectos", value: 800 },
        { label: "Clientes", value: 120 },
      ],
      every: 16,
      note: "solo el {total} termina comprando",
      source: "dato de ejemplo",
      mascot: "bit-vendedor-base",
      mascotFrom: "pensando",
      mascotTo: "feliz",
    },
  },
  {
    id: "contenido",
    horizontal: true,
    props: {
      ...base("board", 6),
      heading: "TU EMBUDO DE CONTENIDO",
      accent: "CONTENIDO",
      stages: [
        { label: "Vistas", value: 50000 },
        { label: "Seguidores", value: 2000 },
        { label: "Suscriptores", value: 400 },
        { label: "Compradores", value: 40 },
      ],
      every: 16,
      note: "el {total} de las vistas compra",
      source: "dato de ejemplo",
      mascot: "embudo-base",
      mascotFrom: "sorpresa",
      mascotTo: "guino",
    },
  },
];

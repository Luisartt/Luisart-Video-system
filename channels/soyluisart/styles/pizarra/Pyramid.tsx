import { useCurrentFrame } from "remotion";
import { z } from "zod";
import { HandNote, Sfx, Stage, TypeOn, Variant, base, baseSchema, useFormat } from "./primitives";
import { MarkerStroke, roughEllipse } from "./marker";
import { At, BoxSvg, Breathe, DiagramBox, Float, MarkerArrow, MascotImg, breatheScale, faceAt, fitFont, mascotExprField, mascotKeyField } from "./diagramKit";
import { piz } from "./theme";

// Pyramid / hierarchy of tiers (2026-09-29): a stepped pixel-brick pyramid built from the base up,
// one brick per frame (masonry rows, light seams), each layer framed in ink with its label when it is
// complete. The top layer is blue; when it lands it gets a marker circle, then the side notes arrive
// with marker arrows pointing at it and a hand note closes under the base. Optional mascot beside the
// top (reacting when the top is circled).

export const pyramidSchema = baseSchema.extend({
  heading: z.string(),
  accent: z.string().describe("Heading words drawn blue"),
  layers: z.array(z.object({ label: z.string() })).min(3).max(5).describe("Base first, top last"),
  leftNote: z.string().describe("Hand note left of the top, with an arrow to it (empty = none)"),
  rightNote: z.string().describe("Hand note right of the top (ignored when a mascot is set)"),
  footNote: z.string().describe("Hand note under the base"),
  mascot: mascotKeyField,
  faceStart: mascotExprField,
  faceEnd: mascotExprField.describe("Face when the top is circled"),
});
type Props = z.infer<typeof pyramidSchema>;

const BRICK = 92; // target brick width

const geometry = (isVertical: boolean) =>
  isVertical
    ? { W: 880, H: 900, head: 68, cx: 440, topY: 150, baseY: 786, wBase: 860, wTop: 360, noteFs: 42, footY: 808, footFs: 44, mascot: 176 }
    : { W: 1700, H: 720, head: 72, cx: 850, topY: 108, baseY: 618, wBase: 1060, wTop: 360, noteFs: 52, footY: 636, footFs: 54, mascot: 192 };

export const Pyramid: React.FC<Props> = (p) => {
  const frame = useCurrentFrame();
  const { isVertical } = useFormat();
  const g = geometry(isVertical);
  const n = p.layers.length;
  const h = (g.baseY - g.topY) / n;
  // Layer i (0 = base) geometry.
  const lw = (i: number) => Math.round(g.wBase - (i * (g.wBase - g.wTop)) / (n - 1));
  const ly = (i: number) => Math.round(g.baseY - (i + 1) * h);
  const lx = (i: number) => Math.round(g.cx - lw(i) / 2);

  // Bricks per layer: two masonry rows, bottom row first, left → right.
  const bricksOf = (i: number) => {
    const w = lw(i);
    const cols = Math.max(2, Math.round(w / BRICK));
    const bw = w / cols;
    const rh = h / 2;
    const out: { x: number; y: number; w: number; h: number }[] = [];
    [1, 0].forEach((row) => {
      const y = ly(i) + row * rh;
      if (row === 1) for (let c = 0; c < cols; c++) out.push({ x: lx(i) + c * bw, y, w: bw, h: rh });
      else {
        out.push({ x: lx(i), y, w: bw / 2, h: rh });
        for (let c = 0; c < cols - 1; c++) out.push({ x: lx(i) + bw / 2 + c * bw, y, w: bw, h: rh });
        out.push({ x: lx(i) + w - bw / 2, y, w: bw / 2, h: rh });
      }
    });
    return out;
  };
  const bricks = p.layers.map((_, i) => bricksOf(i));

  // Timing (frames).
  const headLen = Array.from(p.heading).length;
  const headAt = 2;
  const layerStart: number[] = [];
  let t = headAt + headLen + 4;
  for (let i = 0; i < n; i++) {
    layerStart.push(t);
    t += bricks[i].length + 4;
  }
  const doneAt = (i: number) => layerStart[i] + bricks[i].length; // frame the layer is complete
  const circleAt = doneAt(n - 1) + 6;
  const leftAt = circleAt + 12;
  const rightAt = leftAt + 10;
  const footAt = rightAt + 10;

  const fill = (i: number) => (i === n - 1 ? piz.color.accent : i % 2 === 0 ? piz.color.white : piz.color.tint);
  const seam = (i: number) => (i === n - 1 ? piz.color.accentDark : piz.color.tintMid);
  const top = n - 1;
  const topMidY = ly(top) + h / 2;
  const topL = lx(top);
  const topR = lx(top) + lw(top);
  const sideW = Math.min(isVertical ? 250 : 420, topL - 70);
  const face = faceAt(frame, [[0, p.faceStart], [circleAt, p.faceEnd]]);
  const headFs = fitFont(p.heading, g.W - 20, g.head, 0.62);

  return (
    <Stage backing={p.backing} safeGuide={p.safeGuide}>
      <DiagramBox w={g.W} h={g.H}>
        <At x={0} y={0} w={g.W}>
          <TypeOn text={p.heading} accent={p.accent} at={headAt} fontSize={headFs} />
        </At>
        <BoxSvg w={g.W} h={g.H}>
          {p.layers.map((_, i) => {
            const shown = Math.max(0, Math.min(bricks[i].length, frame - layerStart[i] + 1));
            const complete = frame >= doneAt(i);
            const vis = bricks[i].slice(0, shown);
            // The top layer breathes once it is circled (rule i: nothing static).
            const bs = i === top ? breatheScale(frame, circleAt, 0.025) : 1;
            const cy = ly(i) + h / 2;
            return (
              <g key={i} transform={bs === 1 ? undefined : `translate(${g.cx} ${cy}) scale(${bs.toFixed(4)}) translate(${-g.cx} ${-cy})`}>
                {vis.map((b, k) => (
                  <rect key={`s${k}`} x={Math.round(b.x) + 9} y={Math.round(b.y) + 9} width={Math.round(b.w)} height={Math.round(b.h)} fill={piz.ui.shadowColor} />
                ))}
                {vis.map((b, k) => (
                  <rect key={`b${k}`} x={Math.round(b.x)} y={Math.round(b.y)} width={Math.round(b.w)} height={Math.round(b.h)} fill={fill(i)} stroke={seam(i)} strokeWidth={3} />
                ))}
                {complete ? <rect x={lx(i)} y={ly(i)} width={lw(i)} height={Math.round(h)} fill="none" stroke={piz.color.ink} strokeWidth={5} /> : null}
              </g>
            );
          })}
          <MarkerStroke d={roughEllipse(g.cx, topMidY, lw(top) / 2 + 38, h / 2 + 30, "pyr-top")} at={circleAt} frames={12} color={piz.color.accent} width={8} />
          {p.leftNote ? <MarkerArrow x1={topL - 76} y1={topMidY + 34} x2={topL - 34} y2={topMidY + 6} at={leftAt} seed="pyl" bend={0.3} head={18} frames={6} color={piz.color.accentDark} width={6} /> : null}
          {p.rightNote && !p.mascot ? <MarkerArrow x1={topR + 76} y1={topMidY + 34} x2={topR + 34} y2={topMidY + 6} at={rightAt} seed="pyr" bend={-0.3} head={18} frames={6} color={piz.color.accentDark} width={6} /> : null}
        </BoxSvg>
        {p.layers.map((L, i) => {
          const fs = Math.min(Math.round(h * 0.34), fitFont(L.label, lw(i) - 40, 46, 0.56));
          return (
            <At key={i} x={lx(i)} y={ly(i)} w={lw(i)} h={Math.round(h)} style={{ display: "flex", alignItems: "center", justifyContent: "center", visibility: frame >= doneAt(i) ? "visible" : "hidden", transform: i === top ? `scale(${breatheScale(frame, circleAt, 0.025).toFixed(4)})` : undefined }}>
              <div style={{ font: `700 ${fs}px ${piz.font.caption}`, color: i === top ? piz.color.white : piz.color.ink, whiteSpace: "nowrap", lineHeight: 1 }}>{L.label}</div>
            </At>
          );
        })}
        {p.leftNote ? (
          <At x={topL - 80 - sideW} y={topMidY - 34} w={sideW} style={{ display: "flex", justifyContent: "flex-end" }}>
            <Float px={4} phase={7}>
              <HandNote text={p.leftNote} at={leftAt + 3} fontSize={g.noteFs} color={piz.color.accentDark} align="right" style={{ padding: "0 10px" }} />
            </Float>
          </At>
        ) : null}
        {p.mascot ? (
          <At
            x={isVertical ? topR + 50 : lx(top - 1) + lw(top - 1) + 44}
            y={isVertical ? ly(top) + h / 2 - g.mascot / 2 - 10 : ly(top - 1) + h - g.mascot}
            style={{ visibility: frame >= doneAt(top) ? "visible" : "hidden" }}
          >
            <MascotImg character={p.mascot} expr={face} size={g.mascot} />
          </At>
        ) : p.rightNote ? (
          <At x={topR + 80} y={topMidY - 34} w={sideW}>
            <Float px={4} phase={21}>
              <HandNote text={p.rightNote} at={rightAt + 3} fontSize={g.noteFs} color={piz.color.accentDark} align="left" style={{ padding: "0 10px" }} />
            </Float>
          </At>
        ) : null}
        <At x={0} y={g.footY} w={g.W} style={{ display: "flex", justifyContent: "center" }}>
          <Breathe at={footAt}>
            <HandNote text={p.footNote} at={footAt} fontSize={g.footFs} color={piz.color.handInk} style={{ padding: "0 14px" }} />
          </Breathe>
        </At>
      </DiagramBox>
      <Sfx kind="type" at={headAt} frames={headLen + 2} on={p.sfx} />
      <Sfx kind="tap" at={layerStart[0]} on={p.sfx} volume={0.2} />
      {p.layers.map((_, i) => (
        <Sfx key={i} kind="pop" at={doneAt(i)} on={p.sfx} volume={0.25} />
      ))}
      <Sfx kind="marker" at={circleAt} on={p.sfx} />
      {p.leftNote ? <Sfx kind="marker" at={leftAt} on={p.sfx} volume={0.3} /> : null}
      {p.mascot ? null : p.rightNote ? <Sfx kind="marker" at={rightAt} on={p.sfx} volume={0.3} /> : null}
      <Sfx kind="ding" at={footAt} on={p.sfx} />
    </Stage>
  );
};

export const pyramidVariants: Variant<Props>[] = [
  {
    id: "capital",
    horizontal: true,
    props: {
      ...base("board", 7),
      heading: "ESTRUCTURA DE CAPITAL",
      accent: "CAPITAL",
      layers: [{ label: "Deuda senior" }, { label: "Deuda subordinada" }, { label: "Capital preferente" }, { label: "Capital común" }],
      leftNote: "más riesgo",
      rightNote: "cobra al final",
      footNote: "si la empresa quiebra, la deuda cobra primero",
      mascot: "",
      faceStart: "pensando",
      faceEnd: "feliz",
    },
  },
  {
    id: "prioridades",
    horizontal: true,
    props: {
      ...base("board", 7),
      heading: "PIRÁMIDE DE MASLOW",
      accent: "MASLOW",
      layers: [{ label: "Fisiológicas" }, { label: "Seguridad" }, { label: "Pertenencia" }, { label: "Reconocimiento" }, { label: "Autorrealización" }],
      leftNote: "se busca al final",
      rightNote: "",
      footNote: "primero se cubre lo básico",
      mascot: "bit-estratega-base",
      faceStart: "pensando",
      faceEnd: "feliz",
    },
  },
];

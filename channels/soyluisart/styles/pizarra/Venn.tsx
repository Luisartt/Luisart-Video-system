import { useCurrentFrame } from "remotion";
import { z } from "zod";
import { Drop, HandNote, Sfx, Stage, TypeOn, Variant, base, baseSchema, useFormat } from "./primitives";
import { MarkerStroke, tickPath } from "./marker";
import { At, BoxSvg, Breathe, DiagramBox, Float, MarkerArrow, MascotImg, faceAt, fitFont, handCircle, mascotExprField, mascotKeyField } from "./diagramKit";
import { piz } from "./theme";

// Venn diagram (2026-09-29), 2 or 3 circles drawn on in marker one by one, each with its label in its
// own lobe. Then the common area (the lens, or the centre of the three — Jim Collins' hedgehog
// concept) fills blue, the mascot drops into it, a marker tick lands, the mascot's face changes and a
// hand note with a marker arrow points into the centre.

export const vennSchema = baseSchema.extend({
  heading: z.string(),
  accent: z.string().describe("Heading words drawn blue"),
  circles: z.array(z.object({ label: z.string() })).min(2).max(3),
  every: z.number().min(8).max(40).describe("Frames between circles"),
  note: z.string().describe("Hand note pointing into the common area"),
  mascot: mascotKeyField,
  faceStart: mascotExprField,
  faceEnd: mascotExprField.describe("Face when the tick lands"),
});
type Props = z.infer<typeof vennSchema>;

type C = { x: number; y: number };
type Geo = {
  W: number;
  H: number;
  head: number;
  headBox: { x: number; y: number; w: number; align: "center" | "left" };
  r: number;
  c: C[];
  labels: { x: number; y: number; w: number }[];
  labelFs: number;
  center: C;
  mascot: number;
  note: { x: number; y: number; w: number; fs: number };
  arrow: [number, number, number, number, number];
};

const geometry = (isVertical: boolean, three: boolean): Geo => {
  if (isVertical && three)
    return {
      W: 880, H: 900, head: 68, headBox: { x: 0, y: 0, w: 880, align: "center" }, r: 228,
      c: [{ x: 300, y: 350 }, { x: 580, y: 350 }, { x: 440, y: 592 }],
      labels: [{ x: 214, y: 282, w: 236 }, { x: 666, y: 282, w: 236 }, { x: 440, y: 716, w: 300 }], labelFs: 34,
      center: { x: 440, y: 432 }, mascot: 112,
      note: { x: 604, y: 748, w: 276, fs: 44 }, arrow: [700, 730, 488, 486, 0.22],
    };
  if (isVertical)
    return {
      W: 880, H: 820, head: 68, headBox: { x: 0, y: 0, w: 880, align: "center" }, r: 240,
      c: [{ x: 290, y: 390 }, { x: 590, y: 390 }],
      labels: [{ x: 172, y: 390, w: 200 }, { x: 708, y: 390, w: 200 }], labelFs: 36,
      center: { x: 440, y: 390 }, mascot: 128,
      note: { x: 150, y: 700, w: 600, fs: 50 }, arrow: [672, 708, 482, 604, 0.3],
    };
  if (three)
    return {
      W: 1700, H: 720, head: 76, headBox: { x: 1010, y: 90, w: 690, align: "left" }, r: 206,
      c: [{ x: 430, y: 258 }, { x: 690, y: 258 }, { x: 560, y: 480 }],
      labels: [{ x: 362, y: 204, w: 230 }, { x: 758, y: 204, w: 230 }, { x: 560, y: 600, w: 280 }], labelFs: 34,
      center: { x: 560, y: 332 }, mascot: 104,
      note: { x: 1040, y: 430, w: 660, fs: 58 }, arrow: [1024, 452, 618, 362, 0.2],
    };
  return {
    W: 1700, H: 720, head: 76, headBox: { x: 1010, y: 110, w: 690, align: "left" }, r: 236,
    c: [{ x: 400, y: 370 }, { x: 690, y: 370 }],
    labels: [{ x: 286, y: 370, w: 200 }, { x: 804, y: 370, w: 200 }], labelFs: 38,
    center: { x: 545, y: 370 }, mascot: 128,
    note: { x: 1040, y: 430, w: 660, fs: 58 }, arrow: [1024, 470, 566, 526, -0.25],
  };
};

export const Venn: React.FC<Props> = (p) => {
  const frame = useCurrentFrame();
  const { isVertical } = useFormat();
  const three = p.circles.length === 3;
  const g = geometry(isVertical, three);
  const n = p.circles.length;

  // Timing (frames).
  const headLen = Array.from(p.heading).length;
  const headAt = 2;
  const circleAt = (i: number) => headAt + headLen + 4 + i * p.every;
  const labelAt = (i: number) => circleAt(i) + 8;
  const fillAt = circleAt(n - 1) + 14 + 8;
  const tickAt = fillAt + 14;
  const noteAt = tickAt + 8;

  const face = faceAt(frame, [[0, p.faceStart], [tickAt, p.faceEnd]]);
  const headFs = isVertical ? fitFont(p.heading, g.W - 20, g.head, 0.62) : g.head;
  const clipIds = g.c.map((_, i) => `venn-clip-${i}`);
  const tickX = g.note.x;
  const noteTextX = g.note.x + 64;

  return (
    <Stage backing={p.backing} safeGuide={p.safeGuide}>
      <DiagramBox w={g.W} h={g.H}>
        <At x={g.headBox.x} y={g.headBox.y} w={g.headBox.w}>
          <TypeOn text={p.heading} accent={p.accent} at={headAt} fontSize={headFs} align={g.headBox.align} lineHeight={1.02} />
        </At>
        <BoxSvg w={g.W} h={g.H}>
          <defs>
            {g.c.map((c, i) => (
              <clipPath key={i} id={clipIds[i]}>
                <circle cx={c.x} cy={c.y} r={g.r} />
              </clipPath>
            ))}
          </defs>
          {/* Common area: nested clips = intersection of every circle. */}
          {frame >= fillAt ? (
            three ? (
              <g clipPath={`url(#${clipIds[0]})`}>
                <g clipPath={`url(#${clipIds[1]})`}>
                  <circle cx={g.c[2].x} cy={g.c[2].y} r={g.r} fill={piz.color.tintMid} />
                </g>
              </g>
            ) : (
              <g clipPath={`url(#${clipIds[0]})`}>
                <circle cx={g.c[1].x} cy={g.c[1].y} r={g.r} fill={piz.color.tintMid} />
              </g>
            )
          ) : null}
          {g.c.map((c, i) => (
            <MarkerStroke key={i} d={handCircle(c.x, c.y, g.r, `venn${i}`)} at={circleAt(i)} frames={14} color={piz.color.ink} width={8} />
          ))}
          <MarkerStroke d={tickPath(tickX, g.note.y - 6, 56)} at={tickAt} frames={7} color={piz.color.accent} width={10} />
          <MarkerArrow x1={g.arrow[0]} y1={g.arrow[1]} x2={g.arrow[2]} y2={g.arrow[3]} at={noteAt} seed="venn-arrow" bend={g.arrow[4]} head={22} frames={8} color={piz.color.accentDark} width={7} />
        </BoxSvg>
        {p.circles.map((c, i) => {
          const L = g.labels[i];
          return (
            <At key={i} x={L.x - L.w / 2} y={L.y - 60} w={L.w} h={120} style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Drop at={labelAt(i)}>
                <Float px={3} phase={i * 13}>
                  <div style={{ font: `700 ${g.labelFs}px ${piz.font.caption}`, color: piz.color.ink, textAlign: "center", lineHeight: 1.1 }}>{c.label}</div>
                </Float>
              </Drop>
            </At>
          );
        })}
        {p.mascot ? (
          <At x={g.center.x - g.mascot / 2} y={g.center.y - g.mascot / 2}>
            <Drop at={fillAt}>
              <MascotImg character={p.mascot} expr={face} size={g.mascot} />
            </Drop>
          </At>
        ) : null}
        <At x={noteTextX} y={g.note.y - 14} w={g.note.w - 64}>
          <Breathe at={noteAt} style={{ transformOrigin: "0 50%" }}>
            <HandNote text={p.note} at={noteAt} fontSize={g.note.fs} color={piz.color.accentDark} align="left" style={{ padding: "0 10px" }} />
          </Breathe>
        </At>
      </DiagramBox>
      <Sfx kind="type" at={headAt} frames={headLen + 2} on={p.sfx} />
      {p.circles.map((_, i) => (
        <Sfx key={i} kind="marker" at={circleAt(i)} on={p.sfx} volume={0.35} />
      ))}
      <Sfx kind="pop" at={fillAt} on={p.sfx} volume={0.3} />
      <Sfx kind="marker" at={tickAt} on={p.sfx} volume={0.3} />
      <Sfx kind="ding" at={noteAt} on={p.sfx} />
    </Stage>
  );
};

export const vennVariants: Variant<Props>[] = [
  {
    id: "dos",
    horizontal: true,
    props: {
      ...base("board", 6),
      heading: "¿DÓNDE ESTÁ TU NEGOCIO?",
      accent: "NEGOCIO",
      circles: [{ label: "Lo que sabes hacer" }, { label: "Lo que alguien necesita" }],
      every: 16,
      note: "justo aquí, en medio",
      mascot: "foco-base",
      faceStart: "pensando",
      faceEnd: "feliz",
    },
  },
  {
    id: "tres",
    horizontal: true,
    props: {
      ...base("board", 7),
      heading: "EL CONCEPTO DEL ERIZO",
      accent: "ERIZO",
      circles: [{ label: "Lo que te apasiona" }, { label: "En lo que puedes ser el mejor" }, { label: "Lo que te genera dinero" }],
      every: 16,
      note: "ahí está tu foco",
      mascot: "foco-base",
      faceStart: "pensando",
      faceEnd: "guino",
    },
  },
];

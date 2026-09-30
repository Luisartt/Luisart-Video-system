import { useCurrentFrame } from "remotion";
import { z } from "zod";
import { Drop, HandNote, Sfx, Stage, TypeOn, Variant, base, baseSchema, useFormat } from "./primitives";
import { MarkerStroke, roughEllipse, roughLine } from "./marker";
import { At, BoxSvg, Breathe, DiagramBox, Float, MarkerArrow, MascotImg, faceAt, fitFont, mascotExprField, mascotKeyField } from "./diagramKit";
import { piz } from "./theme";

// 2×2 matrix (2026-09-29): marker axes with arrowheads and hand labels, the cross drawn on, the four
// quadrant names typed, then example items (paper cards with tape-free hard shadows, slightly tilted)
// drop into their quadrant one by one and keep floating. At the end the winning quadrant is circled in
// blue marker (its name turns blue), the mascot reacts and the hand note lands.
// Quadrant order everywhere: 0 = top-left, 1 = top-right, 2 = bottom-left, 3 = bottom-right
// (x grows to the right, y grows upwards).

export const matrix2x2Schema = baseSchema.extend({
  heading: z.string(),
  accent: z.string().describe("Heading words drawn blue"),
  xLabel: z.string().describe("Horizontal axis (grows to the right)"),
  yLabel: z.string().describe("Vertical axis (grows upwards)"),
  quadrants: z.array(z.string()).length(4).describe("Names: top-left, top-right, bottom-left, bottom-right"),
  items: z.array(z.object({ text: z.string(), q: z.number().min(0).max(3) })).min(2).max(6).describe("Example items, landing in this order (max 2 per quadrant)"),
  winner: z.number().min(0).max(3).describe("Quadrant circled at the end"),
  note: z.string(),
  mascot: mascotKeyField,
  faceStart: mascotExprField,
  faceEnd: mascotExprField.describe("Face when the winner is circled"),
});
type Props = z.infer<typeof matrix2x2Schema>;

const geometry = (isVertical: boolean) =>
  isVertical
    ? { W: 880, H: 990, head: 68, x0: 96, x1: 872, y0: 104, y1: 760, nameFs: 42, itemFs: 32, xLabelY: 776, mascot: { x: 0, y: 830, s: 150 }, note: { x: 170, y: 860, w: 710, fs: 54 }, headBox: { x: 0, y: 0, w: 880, align: "center" as const } }
    : { W: 1700, H: 720, head: 76, x0: 110, x1: 1060, y0: 24, y1: 630, nameFs: 46, itemFs: 32, xLabelY: 644, mascot: { x: 1140, y: 262, s: 176 }, note: { x: 1140, y: 474, w: 560, fs: 58 }, headBox: { x: 1140, y: 40, w: 560, align: "left" as const } };

export const Matrix2x2: React.FC<Props> = (p) => {
  const frame = useCurrentFrame();
  const { isVertical } = useFormat();
  const g = geometry(isVertical);
  const mx = (g.x0 + g.x1) / 2;
  const my = (g.y0 + g.y1) / 2;
  const quad = (q: number) => ({ x: q % 2 === 0 ? g.x0 : mx, y: q < 2 ? g.y0 : my, w: mx - g.x0, h: my - g.y0 });

  // Timing (frames).
  const headLen = Array.from(p.heading).length;
  const headAt = 2;
  const axesAt = headAt + headLen + 2;
  const crossAt = axesAt + 12;
  const namesAt = crossAt + 10;
  const nameLen = Math.max(...p.quadrants.map((s) => Array.from(s).length));
  const itemAt = (k: number) => namesAt + 6 + nameLen + 4 + k * 14;
  const circleAt = itemAt(p.items.length - 1) + 16;
  const noteAt = circleAt + 12;

  const face = faceAt(frame, [[0, p.faceStart], [circleAt, p.faceEnd]]);
  const headFs = isVertical ? fitFont(p.heading, g.W - 20, g.head, 0.62) : g.head;
  const cardW = Math.round(quad(0).w - 64);
  // Card heights (estimated line wrap) and their stacked tops inside each quadrant.
  const cardH = (text: string) => Math.ceil((Array.from(text).length * g.itemFs * 0.54) / (cardW - 40)) * g.itemFs * 1.12 + 30;
  const cardsTop = (q: number) => quad(q).y + 22 + g.nameFs + 56;
  const tops = p.items.map((it, k) => cardsTop(it.q) + p.items.slice(0, k).filter((o) => o.q === it.q).reduce((a, o) => a + cardH(o.text) + 18, 0));
  const winItems = p.items.map((it, k) => ({ it, k })).filter((o) => o.it.q === p.winner);
  const winTop = cardsTop(p.winner);
  const winBottom = winItems.length ? Math.max(...winItems.map((o) => tops[o.k] + cardH(o.it.text))) : winTop + 60;
  const winCx = quad(p.winner).x + 32 + cardW / 2;

  return (
    <Stage backing={p.backing} safeGuide={p.safeGuide}>
      <DiagramBox w={g.W} h={g.H}>
        <At x={g.headBox.x} y={g.headBox.y} w={g.headBox.w}>
          <TypeOn text={p.heading} accent={p.accent} at={headAt} fontSize={headFs} align={g.headBox.align} lineHeight={1.02} />
        </At>
        <BoxSvg w={g.W} h={g.H}>
          <MarkerArrow x1={g.x0} y1={g.y1} x2={g.x1} y2={g.y1} at={axesAt} seed="mx-x" bend={0.004} head={24} frames={9} color={piz.color.ink} width={8} />
          <MarkerArrow x1={g.x0} y1={g.y1} x2={g.x0} y2={g.y0 - 8} at={axesAt + 3} seed="mx-y" bend={0.004} head={24} frames={9} color={piz.color.ink} width={8} />
          <MarkerStroke d={roughLine(mx, g.y0 + 12, mx, g.y1 - 14, "mx-v", 0.01)} at={crossAt} frames={8} color={piz.color.handInk} width={5} />
          <MarkerStroke d={roughLine(g.x0 + 14, my, g.x1 - 16, my, "mx-h", 0.01)} at={crossAt + 3} frames={8} color={piz.color.handInk} width={5} />
        </BoxSvg>
        {/* Axis labels (hand). The y label reads bottom → top. */}
        <At x={g.x0} y={g.xLabelY} w={g.x1 - g.x0} style={{ display: "flex", justifyContent: "flex-end" }}>
          <HandNote text={p.xLabel} at={axesAt + 8} fontSize={isVertical ? 46 : 48} color={piz.color.handInk} align="right" style={{ padding: "0 10px" }} />
        </At>
        <div style={{ position: "absolute", left: g.x0 - 68, top: g.y1 - 12, width: g.y1 - g.y0 - 24, transform: "rotate(-90deg)", transformOrigin: "0 0" }}>
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <HandNote text={p.yLabel} at={axesAt + 10} fontSize={isVertical ? 46 : 48} color={piz.color.handInk} align="right" style={{ padding: "0 10px" }} />
          </div>
        </div>
        {p.quadrants.map((name, q) => {
          const r = quad(q);
          const win = q === p.winner && frame >= circleAt;
          return (
            <At key={q} x={r.x + 30} y={r.y + 22} w={r.w - 50}>
              <TypeOn text={name} at={namesAt + q * 2} fontSize={g.nameFs} weight={800} align="left" color={win ? piz.color.accent : piz.color.ink} accentColor={piz.color.accent} />
            </At>
          );
        })}
        {p.items.map((it, k) => {
          const r = quad(it.q);
          const top = tops[k];
          const tilt = (k % 2 === 0 ? -1 : 1) * 1.6;
          return (
            <At key={k} x={r.x + 32} y={top} w={cardW}>
              <Drop at={itemAt(k)} px={26} frames={6}>
                <Float px={4} phase={k * 11}>
                  <div
                    style={{
                      width: cardW,
                      boxSizing: "border-box",
                      padding: "12px 18px 14px",
                      background: piz.color.white,
                      border: `4px solid ${piz.color.ink}`,
                      boxShadow: `7px 7px 0 ${piz.ui.shadowColor}`,
                      font: `700 ${g.itemFs}px ${piz.font.caption}`,
                      color: piz.color.ink,
                      lineHeight: 1.12,
                      transform: `rotate(${tilt}deg)`,
                    }}
                  >
                    {it.text}
                  </div>
                </Float>
              </Drop>
            </At>
          );
        })}
        <BoxSvg w={g.W} h={g.H}>
          <MarkerStroke d={roughEllipse(winCx, (winTop + winBottom) / 2, cardW / 2 + 30, (winBottom - winTop) / 2 + 46, "mx-win")} at={circleAt} frames={12} color={piz.color.accent} width={9} />
        </BoxSvg>
        {p.mascot ? (
          <At x={g.mascot.x} y={g.mascot.y} style={{ visibility: frame >= axesAt ? "visible" : "hidden" }}>
            <MascotImg character={p.mascot} expr={face} size={g.mascot.s} />
          </At>
        ) : null}
        <At x={g.note.x} y={g.note.y} w={g.note.w}>
          <Breathe at={noteAt} style={{ transformOrigin: "0 50%" }}>
            <HandNote text={p.note} at={noteAt} fontSize={g.note.fs} color={piz.color.accentDark} align="left" style={{ padding: "0 10px" }} />
          </Breathe>
        </At>
      </DiagramBox>
      <Sfx kind="type" at={headAt} frames={headLen + 2} on={p.sfx} />
      <Sfx kind="marker" at={axesAt} on={p.sfx} volume={0.35} />
      <Sfx kind="marker" at={crossAt} on={p.sfx} volume={0.25} />
      <Sfx kind="type" at={namesAt} frames={nameLen + 8} on={p.sfx} volume={0.2} />
      {p.items.map((_, k) => (
        <Sfx key={k} kind="note" at={itemAt(k) + 3} on={p.sfx} volume={0.35} />
      ))}
      <Sfx kind="marker" at={circleAt} on={p.sfx} />
      <Sfx kind="ding" at={noteAt} on={p.sfx} />
    </Stage>
  );
};

export const matrix2x2Variants: Variant<Props>[] = [
  {
    id: "riesgo-impacto",
    horizontal: true,
    props: {
      ...base("board", 7),
      heading: "MATRIZ DE RIESGO",
      accent: "RIESGO",
      xLabel: "probabilidad →",
      yLabel: "impacto →",
      quadrants: ["ASEGÚRALO", "EVÍTALO", "ACÉPTALO", "REDÚCELO"],
      items: [
        { text: "Se va la luz una hora", q: 2 },
        { text: "Clientes que pagan tarde", q: 3 },
        { text: "Incendio en la bodega", q: 0 },
        { text: "Todo depende de un cliente", q: 1 },
      ],
      winner: 1,
      note: "atiende primero este",
      mascot: "dado-base",
      faceStart: "pensando",
      faceEnd: "sorpresa",
    },
  },
  {
    id: "urgente-importante",
    horizontal: true,
    props: {
      ...base("board", 7),
      heading: "URGENTE VS. IMPORTANTE",
      accent: "IMPORTANTE",
      xLabel: "urgencia →",
      yLabel: "importancia →",
      quadrants: ["AGÉNDALO", "HAZLO YA", "ELIMÍNALO", "DELÉGALO"],
      items: [
        { text: "Pagar la tarjeta hoy", q: 1 },
        { text: "Contestar chats", q: 3 },
        { text: "Scroll sin fin", q: 2 },
        { text: "Aprender a usar IA", q: 0 },
      ],
      winner: 0,
      note: "aquí crece tu negocio",
      mascot: "f12-reloj-arena",
      faceStart: "pensando",
      faceEnd: "feliz",
    },
  },
];

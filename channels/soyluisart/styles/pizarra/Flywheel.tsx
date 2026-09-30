import { random, useCurrentFrame } from "remotion";
import { z } from "zod";
import { Drop, HandNote, PixelIcon, Sfx, Stage, TypeOn, Variant, base, baseSchema, iconField, useFormat } from "./primitives";
import { MarkerStroke } from "./marker";
import { At, BoxSvg, Breathe, DiagramBox, MarkerArrow, MascotImg, faceAt, fitFont, mascotExprField, mascotKeyField } from "./diagramKit";
import { piz } from "./theme";

// Flywheel (Jim Collins, "Good to Great": no single miracle moment, many pushes in the same
// direction build momentum). 4–5 cards sit on a circle; after they land, marker arrows draw on
// along the circle one push at a time (card → next card, the last one closes the loop) and the wheel
// in the middle turns faster with every push (rim bolts show the speed; the mascot in the hub
// wakes up and ends happy). When the loop closes a blue dot keeps running round the circle at the
// wheel's speed (constant motion) and the hand note lands.

const nodeSchema = z.object({ label: z.string(), icon: iconField });
export const flywheelSchema = baseSchema.extend({
  heading: z.string(),
  accent: z.string().describe("Heading words drawn blue"),
  nodes: z.array(nodeSchema).min(4).max(5).describe("Clockwise from the top"),
  every: z.number().min(10).max(45).describe("Frames between pushes (arrows)"),
  note: z.string().describe("Hand note when the loop closes"),
  mascot: mascotKeyField,
  faceStart: mascotExprField.describe("Before the first push"),
  facePush: mascotExprField.describe("From the first push"),
  faceEnd: mascotExprField.describe("When the loop closes"),
});
type Props = z.infer<typeof flywheelSchema>;

const CARD_W = 210;
const CARD_H = 150;
const ARC_FRAMES = 12;

const geometry = (isVertical: boolean) =>
  isVertical
    ? { W: 880, H: 900, head: 68, cx: 440, cy: 500, R: 300, wheel: 122, mascot: 112, note: { x: 220, y: 628, w: 440, fs: 44, align: "center" as const } }
    : { W: 1700, H: 720, head: 76, cx: 480, cy: 368, R: 262, wheel: 132, mascot: 112, note: { x: 980, y: 430, w: 720, fs: 60, align: "left" as const } };

/** Wobbly clockwise arc from angle a0 to a1 (radians, screen coords) + a two-stroke head at a1. */
const arcArrow = (cx: number, cy: number, r: number, a0: number, a1: number, seed: string): [string, string] => {
  const steps = Math.max(6, Math.round(((a1 - a0) * 180) / Math.PI / 3));
  let d = "";
  for (let i = 0; i <= steps; i++) {
    const a = a0 + ((a1 - a0) * i) / steps;
    const rr = r + (random(`${seed}${i}`) - 0.5) * 5 + Math.sin((i / steps) * Math.PI) * 6;
    d += `${i === 0 ? "M" : "L"}${(cx + Math.cos(a) * rr).toFixed(1)},${(cy + Math.sin(a) * rr).toFixed(1)} `;
  }
  const ex = cx + Math.cos(a1) * r;
  const ey = cy + Math.sin(a1) * r;
  const dir = Math.atan2(Math.cos(a1), -Math.sin(a1)); // clockwise tangent
  const h = 24;
  const l = dir + Math.PI * 0.8;
  const rgt = dir - Math.PI * 0.8;
  const head = `M${(ex + Math.cos(l) * h).toFixed(1)},${(ey + Math.sin(l) * h).toFixed(1)} L${ex.toFixed(1)},${ey.toFixed(1)} L${(ex + Math.cos(rgt) * h).toFixed(1)},${(ey + Math.sin(rgt) * h).toFixed(1)}`;
  return [d.trim(), head];
};

export const Flywheel: React.FC<Props> = (p) => {
  const frame = useCurrentFrame();
  const { isVertical } = useFormat();
  const g = geometry(isVertical);
  const n = p.nodes.length;
  const ang = (i: number) => -Math.PI / 2 + (i / n) * Math.PI * 2;
  const pos = (i: number) => [g.cx + Math.cos(ang(i)) * g.R, g.cy + Math.sin(ang(i)) * g.R] as const;

  // Clearance: smallest angular offset that takes the arc outside a card (+ margin).
  const clear = (i: number, sign: 1 | -1) => {
    const [px, py] = pos(i);
    for (let deg = 0; deg < 80; deg += 0.5) {
      const a = ang(i) + (sign * deg * Math.PI) / 180;
      const x = g.cx + Math.cos(a) * g.R;
      const y = g.cy + Math.sin(a) * g.R;
      if (Math.abs(x - px) > CARD_W / 2 + 18 || Math.abs(y - py) > CARD_H / 2 + 18) return (deg * Math.PI) / 180;
    }
    return (80 * Math.PI) / 180;
  };

  // Timing (frames).
  const headLen = Array.from(p.heading).length;
  const headAt = 2;
  const wheelAt = headAt + headLen + 3;
  const cardAt = (i: number) => wheelAt + 4 + i * 8;
  const pushAt = (i: number) => cardAt(n - 1) + 10 + i * p.every;
  const doneAt = pushAt(n - 1) + ARC_FRAMES + 4;

  // Wheel speed (deg/frame) grows with each completed push; angle = running sum.
  const speed = (f: number) => {
    let k = 0;
    for (let i = 0; i < n; i++) if (f >= pushAt(i) + ARC_FRAMES) k++;
    return f < wheelAt ? 0 : 0.7 + 1.1 * k + 0.35 * k * k;
  };
  let theta = 0;
  for (let f = wheelAt; f <= frame; f++) theta += speed(f);
  const pushes = Array.from({ length: n }, (_, i) => i).filter((i) => frame >= pushAt(i) + ARC_FRAMES).length;

  const headFs = isVertical ? fitFont(p.heading, g.W - 20, g.head, 0.62) : g.head;
  // One label size for every card (the longest label decides).
  const fs = Math.min(...p.nodes.map((nd) => fitFont(nd.label, CARD_W - 24, 32, 0.56)));
  const face = faceAt(frame, [[0, p.faceStart], [pushAt(0), p.facePush], [doneAt, p.faceEnd]]);
  // Runner dot round the circle after the loop closes (same angular speed as the wheel).
  let runner = 0;
  for (let f = doneAt; f <= frame; f++) runner += speed(f) * 0.6;
  const ra = ang(0) + (runner * Math.PI) / 180;

  return (
    <Stage backing={p.backing} safeGuide={p.safeGuide}>
      <DiagramBox w={g.W} h={g.H}>
        {isVertical ? (
          <At x={0} y={0} w={g.W}>
            <TypeOn text={p.heading} accent={p.accent} at={headAt} fontSize={headFs} />
          </At>
        ) : (
          <At x={g.note.x} y={150} w={g.note.w}>
            <TypeOn text={p.heading} accent={p.accent} at={headAt} fontSize={headFs} align="left" lineHeight={1.02} />
          </At>
        )}
        <BoxSvg w={g.W} h={g.H}>
          {/* Arrows along the circle: one per push, the last closes the loop. */}
          {p.nodes.map((_, i) => {
            const j = (i + 1) % n;
            const a0 = ang(i) + clear(i, 1);
            const a1 = ang(i) + (Math.PI * 2) / n - clear(j, -1);
            const [shaft, head] = arcArrow(g.cx, g.cy, g.R, a0, a1, `fw${i}`);
            return (
              <g key={i}>
                <MarkerStroke d={shaft} at={pushAt(i)} frames={ARC_FRAMES} color={piz.color.accent} width={9} />
                <MarkerStroke d={head} at={pushAt(i) + ARC_FRAMES - 2} frames={4} color={piz.color.accent} width={9} />
              </g>
            );
          })}
          {frame >= doneAt ? <rect x={Math.round(g.cx + Math.cos(ra) * g.R) - 11} y={Math.round(g.cy + Math.sin(ra) * g.R) - 11} width={22} height={22} fill={piz.color.accent} stroke={piz.color.ink} strokeWidth={4} /> : null}
          {/* The wheel: rim band + spokes + bolts, turning; hub stays still under the mascot. */}
          {frame >= wheelAt ? (
            <g>
              <circle cx={g.cx + 9} cy={g.cy + 9} r={g.wheel} fill={piz.ui.shadowColor} />
              <g transform={`rotate(${theta.toFixed(2)} ${g.cx} ${g.cy})`}>
                <circle cx={g.cx} cy={g.cy} r={g.wheel} fill={piz.color.tint} stroke={piz.color.ink} strokeWidth={8} />
                <circle cx={g.cx} cy={g.cy} r={g.wheel - 34} fill={piz.color.white} stroke={piz.color.ink} strokeWidth={6} />
                {[0, 1, 2, 3, 4, 5].map((s) => {
                  const a = (s * Math.PI) / 3;
                  return <line key={s} x1={g.cx + Math.cos(a) * 56} y1={g.cy + Math.sin(a) * 56} x2={g.cx + Math.cos(a) * (g.wheel - 34)} y2={g.cy + Math.sin(a) * (g.wheel - 34)} stroke={piz.color.ink} strokeWidth={8} />;
                })}
                {[0, 1, 2, 3, 4, 5, 6, 7].map((s) => {
                  const a = (s * Math.PI) / 4 + Math.PI / 8;
                  const r = g.wheel - 17;
                  return <rect key={s} x={g.cx + Math.cos(a) * r - 8} y={g.cy + Math.sin(a) * r - 8} width={16} height={16} fill={s % 2 ? piz.color.accent : piz.color.ink} />;
                })}
              </g>
              <circle cx={g.cx} cy={g.cy} r={62} fill={piz.color.white} stroke={piz.color.ink} strokeWidth={6} />
            </g>
          ) : null}
        </BoxSvg>
        {p.mascot ? (
          <At x={g.cx - g.mascot / 2} y={g.cy - g.mascot / 2 - 4} style={{ visibility: frame >= wheelAt ? "visible" : "hidden" }}>
            <MascotImg character={p.mascot} expr={face} size={g.mascot} />
          </At>
        ) : null}
        {p.nodes.map((nd, i) => {
          const [x, y] = pos(i);
          const target = pushes > 0 && pushes < n && i === pushes % n;
          return (
            <At key={i} x={x - CARD_W / 2} y={y - CARD_H / 2} w={CARD_W} h={CARD_H}>
              <Drop at={cardAt(i)}>
                <div
                  style={{
                    width: CARD_W,
                    height: CARD_H,
                    boxSizing: "border-box",
                    background: piz.color.white,
                    border: `${target ? 7 : 4}px solid ${target ? piz.color.accent : piz.color.ink}`,
                    boxShadow: `${piz.ui.hardShadow}px ${piz.ui.hardShadow}px 0 ${piz.ui.shadowColor}`,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 10,
                  }}
                >
                  <PixelIcon name={nd.icon} px={4} />
                  <div style={{ font: `700 ${fs}px ${piz.font.caption}`, color: piz.color.ink, lineHeight: 1, whiteSpace: "nowrap" }}>{nd.label}</div>
                </div>
              </Drop>
            </At>
          );
        })}
        <At x={g.note.x} y={g.note.y} w={g.note.w} style={{ display: "flex", justifyContent: isVertical ? "center" : "flex-start" }}>
          <Breathe at={doneAt} style={{ transformOrigin: isVertical ? "50% 50%" : "0 50%" }}>
            <HandNote text={p.note} at={doneAt} fontSize={g.note.fs} color={piz.color.accentDark} align={g.note.align} style={{ padding: "0 14px" }} />
          </Breathe>
        </At>
        {!isVertical ? (
          <BoxSvg w={g.W} h={g.H}>
            <MarkerArrow x1={g.note.x - 10} y1={g.note.y + 44} x2={g.cx + Math.cos(0.7) * (g.R + 18)} y2={g.cy + Math.sin(0.7) * (g.R + 18)} at={doneAt + 8} seed="fwnote" bend={-0.2} color={piz.color.accentDark} width={7} />
          </BoxSvg>
        ) : null}
      </DiagramBox>
      <Sfx kind="type" at={headAt} frames={headLen + 2} on={p.sfx} />
      <Sfx kind="pop" at={wheelAt} on={p.sfx} volume={0.25} />
      {p.nodes.map((_, i) => (
        <Sfx key={`c${i}`} kind="click" at={cardAt(i)} on={p.sfx} volume={0.2} />
      ))}
      {p.nodes.map((_, i) => (
        <Sfx key={`m${i}`} kind="marker" at={pushAt(i)} on={p.sfx} volume={0.35} />
      ))}
      <Sfx kind="ding" at={doneAt} on={p.sfx} />
      {!isVertical ? <Sfx kind="marker" at={doneAt + 8} on={p.sfx} volume={0.25} /> : null}
    </Stage>
  );
};

export const flywheelVariants: Variant<Props>[] = [
  {
    id: "bueno-a-excelente",
    horizontal: true,
    props: {
      ...base("board", 7),
      heading: "EL VOLANTE DE INERCIA",
      accent: "INERCIA",
      nodes: [
        { label: "Disciplina", icon: "calendar" },
        { label: "Resultados", icon: "chart-up" },
        { label: "Impulso", icon: "rocket" },
        { label: "Más resultados", icon: "star" },
      ],
      every: 20,
      note: "ningún empujón mágico: todos suman",
      mascot: "engrane-base",
      faceStart: "sueno",
      facePush: "pensando",
      faceEnd: "feliz",
    },
  },
  {
    id: "negocio",
    horizontal: true,
    props: {
      ...base("board", 7),
      heading: "EL VOLANTE DE TU NEGOCIO",
      accent: "NEGOCIO",
      nodes: [
        { label: "Mejor producto", icon: "star" },
        { label: "Más clientes", icon: "phone" },
        { label: "Más ventas", icon: "coin" },
        { label: "Más para invertir", icon: "money-bag" },
      ],
      every: 20,
      note: "cada vuelta cuesta menos",
      mascot: "engrane-base",
      faceStart: "sueno",
      facePush: "sorpresa",
      faceEnd: "guino",
    },
  },
];

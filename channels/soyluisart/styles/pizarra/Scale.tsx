import { spring, useCurrentFrame } from "remotion";
import { z } from "zod";
import { Drop, HandNote, Sfx, Stage, TypeOn, Variant, base, baseSchema, useFormat } from "./primitives";
import { MarkerStroke, tickPath } from "./marker";
import { At, BoxSvg, Breathe, DiagramBox, Float, MascotImg, faceAt, fitFont, mascotExprField, mascotKeyField } from "./diagramKit";
import { piz } from "./theme";

// Decision balance (2026-09-29): a pixel balance (post, base, beam, two plates). Labelled weights
// drop one by one onto their side; every landing tips the beam with a small spring wobble. The tilt
// is computed from the weights (right − left), so the drawing always matches the data; at the end the
// winning side (heavier total) gets a marker tick, its title turns blue, the mascot reacts and the
// hand note lands ({winner} = the winning title in lower case).

const sideSchema = z.object({ title: z.string(), tone: z.enum(["accent", "alert", "ink"]).describe("alert (red) only for the 'bad' side") });
export const scaleSchema = baseSchema.extend({
  heading: z.string(),
  accent: z.string().describe("Heading words drawn blue"),
  left: sideSchema,
  right: sideSchema,
  tokens: z.array(z.object({ side: z.enum(["left", "right"]), text: z.string(), weight: z.number().min(1).max(3) })).min(2).max(7).describe("In landing order; max 3 per side"),
  every: z.number().min(10).max(40).describe("Frames between weights"),
  note: z.string().describe("Hand note at the end; {winner} = winning side's title in lower case"),
  mascot: mascotKeyField,
  faceStart: mascotExprField,
  faceEnd: mascotExprField,
});
type Props = z.infer<typeof scaleSchema>;

const geometry = (isVertical: boolean) =>
  isVertical
    ? { W: 880, H: 940, head: 68, px: 440, py: 560, L: 312, maxDeg: 9, baseY: 790, tokW: 240, tokFs: 28, tokH: (w: number) => 56 + 18 * w, titleY: 646, titleFs: 46, mascot: { x: 690, y: 716, s: 170 }, note: { x: 20, y: 866, w: 640, fs: 52, align: "center" as const } }
    : { W: 1700, H: 720, head: 72, px: 850, py: 470, L: 470, maxDeg: 7.5, baseY: 660, tokW: 290, tokFs: 27, tokH: (w: number) => Math.max(70, 50 + 14 * w), titleY: 548, titleFs: 48, mascot: { x: 40, y: 500, s: 176 }, note: { x: 590, y: 226, w: 520, fs: 56, align: "center" as const } };

const tone = (t: "accent" | "alert" | "ink") => (t === "accent" ? { fill: piz.color.tint, border: piz.color.ink, title: piz.color.accent } : t === "alert" ? { fill: piz.color.white, border: piz.color.alert, title: piz.color.alert } : { fill: piz.color.white, border: piz.color.ink, title: piz.color.ink });

export const Scale: React.FC<Props> = (p) => {
  const frame = useCurrentFrame();
  const { isVertical } = useFormat();
  const g = geometry(isVertical);

  // Timing (frames).
  const headLen = Array.from(p.heading).length;
  const headAt = 2;
  const structAt = headAt + headLen + 3;
  const titleAt = structAt + 6;
  const tokAt = (k: number) => titleAt + 14 + k * p.every; // drop starts
  const DROP = 7;
  const landAt = (k: number) => tokAt(k) + DROP;
  const lastLand = landAt(p.tokens.length - 1);
  const winAt = lastLand + 24;
  const noteAt = winAt + 8;

  // Tilt from the data: target after each landing, sprung.
  const unit = 3.2;
  const target = (k: number) => {
    let d = 0;
    p.tokens.slice(0, k + 1).forEach((t) => (d += t.side === "right" ? t.weight : -t.weight));
    return Math.max(-g.maxDeg, Math.min(g.maxDeg, d * unit));
  };
  let theta = 0;
  p.tokens.forEach((_, k) => {
    const prev = k === 0 ? 0 : target(k - 1);
    const sp = spring({ frame: frame - landAt(k), fps: 30, config: { damping: 7, mass: 0.7, stiffness: 110 } });
    theta += (target(k) - prev) * sp;
  });
  // Idle sway once the balance has settled (rule i: nothing static).
  const settle = lastLand + 20;
  if (frame > settle) theta += 0.45 * Math.sin((2 * Math.PI * (frame - settle)) / 64) * Math.min(1, (frame - settle) / 20);
  const rad = (theta * Math.PI) / 180;
  const end = (s: -1 | 1) => ({ x: g.px + s * g.L * Math.cos(rad), y: g.py + s * g.L * Math.sin(rad) });
  const plateTop = (s: -1 | 1) => end(s).y - 36 - 16;

  const sum = (side: "left" | "right") => p.tokens.filter((t) => t.side === side).reduce((a, t) => a + t.weight, 0);
  const sl = sum("left");
  const sr = sum("right");
  const winSide: "left" | "right" | null = sl === sr ? null : sl > sr ? "left" : "right";
  const winnerTitle = winSide ? p[winSide].title.toLowerCase() : "empate";
  const note = p.note.replace("{winner}", winnerTitle);
  const face = faceAt(frame, [[0, p.faceStart], [winAt, p.faceEnd]]);
  const headFs = fitFont(p.heading, g.W - 20, g.head, 0.62);

  // Stack offsets (from the plate top upwards) per token.
  const offsets = p.tokens.map((t, k) => p.tokens.slice(0, k).filter((o) => o.side === t.side).reduce((a, o) => a + g.tokH(o.weight) + 6, 0));
  const stackTop = (side: "left" | "right") => {
    const s = side === "left" ? -1 : 1;
    const h = p.tokens.filter((t) => t.side === side).reduce((a, t) => a + g.tokH(t.weight) + 6, 0);
    return plateTop(s) - h;
  };

  const structVis = frame >= structAt;
  return (
    <Stage backing={p.backing} safeGuide={p.safeGuide}>
      <DiagramBox w={g.W} h={g.H}>
        <At x={0} y={0} w={g.W}>
          <TypeOn text={p.heading} accent={p.accent} at={headAt} fontSize={headFs} />
        </At>
        {/* Side titles under the beam ends. */}
        {(["left", "right"] as const).map((side) => {
          const s = side === "left" ? -1 : 1;
          const tn = tone(p[side].tone);
          const win = winSide === side && frame >= winAt;
          return (
            <At key={side} x={g.px + s * g.L - 170} y={g.titleY} w={340} style={{ display: "flex", justifyContent: "center" }}>
              <TypeOn text={p[side].title} at={titleAt} fontSize={g.titleFs} weight={800} color={win ? piz.color.accent : tn.title} />
            </At>
          );
        })}
        <BoxSvg w={g.W} h={g.H}>
          {structVis ? (
            <g>
              {/* Base (stepped) + post + pivot. */}
              <rect x={g.px - 150 + 9} y={g.baseY + 9} width={300} height={40} fill={piz.ui.shadowColor} />
              <rect x={g.px - 150} y={g.baseY} width={300} height={40} fill={piz.color.tint} stroke={piz.color.ink} strokeWidth={5} />
              <rect x={g.px - 110} y={g.baseY - 20} width={220} height={22} fill={piz.color.white} stroke={piz.color.ink} strokeWidth={5} />
              <rect x={g.px - 18} y={g.py} width={36} height={g.baseY - 20 - g.py} fill={piz.color.white} stroke={piz.color.ink} strokeWidth={5} />
              {/* Beam, rotated about the pivot. */}
              <g transform={`rotate(${theta.toFixed(3)} ${g.px} ${g.py})`}>
                <rect x={g.px - g.L - 20} y={g.py - 13} width={g.L * 2 + 40} height={26} fill={piz.color.ink} />
                <rect x={g.px - g.L - 12} y={g.py - 7} width={g.L * 2 + 24} height={8} fill={piz.color.accent} />
              </g>
              <rect x={g.px - 20} y={g.py - 20} width={40} height={40} fill={piz.color.accent} stroke={piz.color.ink} strokeWidth={5} />
              {/* Rods + plates follow the beam ends (plates stay level). */}
              {([-1, 1] as const).map((s) => {
                const e = end(s);
                return (
                  <g key={s}>
                    <rect x={e.x - 5} y={e.y - 38} width={10} height={38} fill={piz.color.ink} />
                    <rect x={e.x - 140 + 7} y={e.y - 52 + 7} width={280} height={16} fill={piz.ui.shadowColor} />
                    <rect x={e.x - 140} y={e.y - 52} width={280} height={16} fill={piz.color.white} stroke={piz.color.ink} strokeWidth={5} />
                  </g>
                );
              })}
            </g>
          ) : null}
        </BoxSvg>
        {/* Weights: drop in, then ride their plate. */}
        {p.tokens.map((t, k) => {
          const s = t.side === "left" ? -1 : 1;
          const h = g.tokH(t.weight);
          const tn = tone(p[t.side].tone);
          const e = end(s);
          return (
            <At key={k} x={e.x - g.tokW / 2} y={plateTop(s) - offsets[k] - h} w={g.tokW} h={h}>
              <Drop at={tokAt(k)} px={70} frames={DROP}>
                <div
                  style={{
                    width: g.tokW,
                    height: h,
                    boxSizing: "border-box",
                    background: tn.fill,
                    border: `5px solid ${tn.border}`,
                    boxShadow: `6px 6px 0 ${piz.ui.shadowColor}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    textAlign: "center",
                    padding: "4px 12px",
                    font: `700 ${g.tokFs}px ${piz.font.caption}`,
                    color: piz.color.ink,
                    lineHeight: 1.08,
                  }}
                >
                  {t.text}
                </div>
              </Drop>
            </At>
          );
        })}
        {winSide ? (
          <BoxSvg w={g.W} h={g.H}>
            <MarkerStroke d={tickPath(end(winSide === "left" ? -1 : 1).x + g.tokW / 2 - 30, stackTop(winSide) - 84, 80)} at={winAt} frames={7} color={piz.color.accent} width={11} />
          </BoxSvg>
        ) : null}
        {p.mascot ? (
          <At x={g.mascot.x} y={g.mascot.y} style={{ visibility: structVis ? "visible" : "hidden" }}>
            <Float px={3} period={40}>
              <MascotImg character={p.mascot} expr={face} size={g.mascot.s} bob={false} />
            </Float>
          </At>
        ) : null}
        <At x={g.note.x} y={g.note.y} w={g.note.w} style={{ display: "flex", justifyContent: "center" }}>
          <Breathe at={noteAt}>
            <HandNote text={note} at={noteAt} fontSize={g.note.fs} color={piz.color.accentDark} align={g.note.align} style={{ padding: "0 14px" }} />
          </Breathe>
        </At>
      </DiagramBox>
      <Sfx kind="type" at={headAt} frames={headLen + 2} on={p.sfx} />
      <Sfx kind="pop" at={structAt} on={p.sfx} volume={0.25} />
      <Sfx kind="typeShort" at={titleAt + 2} on={p.sfx} volume={0.22} />
      {p.tokens.map((_, k) => (
        <Sfx key={k} kind="thud" at={landAt(k)} on={p.sfx} volume={0.22} />
      ))}
      {winSide ? <Sfx kind="marker" at={winAt} on={p.sfx} /> : null}
      <Sfx kind="ding" at={noteAt} on={p.sfx} />
    </Stage>
  );
};

export const scaleVariants: Variant<Props>[] = [
  {
    id: "pros-contras",
    horizontal: true,
    props: {
      ...base("board", 7),
      heading: "¿IA EN TU NEGOCIO?",
      accent: "IA",
      left: { title: "PROS", tone: "accent" },
      right: { title: "CONTRAS", tone: "alert" },
      tokens: [
        { side: "left", text: "Ahorra horas", weight: 3 },
        { side: "right", text: "Hay que revisarla", weight: 2 },
        { side: "left", text: "Responde al instante", weight: 2 },
        { side: "right", text: "Curva de aprendizaje", weight: 1 },
        { side: "left", text: "Trabaja 24/7", weight: 1 },
      ],
      every: 20,
      note: "ganan los {winner}",
      mascot: "bit-estratega-base",
      faceStart: "pensando",
      faceEnd: "feliz",
    },
  },
  {
    id: "etica",
    horizontal: true,
    props: {
      ...base("board", 7),
      heading: "¿ATAJO O LO CORRECTO?",
      accent: "CORRECTO",
      left: { title: "ATAJO", tone: "alert" },
      right: { title: "LO CORRECTO", tone: "accent" },
      tokens: [
        { side: "left", text: "Vender más hoy", weight: 2 },
        { side: "right", text: "Confianza del cliente", weight: 3 },
        { side: "left", text: "Menos trabajo", weight: 1 },
        { side: "right", text: "Tu reputación", weight: 2 },
        { side: "right", text: "Clientes que regresan", weight: 2 },
      ],
      every: 20,
      note: "pesa más {winner}",
      mascot: "brujula-base",
      faceStart: "pensando",
      faceEnd: "feliz",
    },
  },
];

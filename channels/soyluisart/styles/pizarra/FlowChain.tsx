import { getLength, getPointAtLength } from "@remotion/paths";
import { interpolate, useCurrentFrame } from "remotion";
import { z } from "zod";
import { Drop, HandNote, PixelIcon, Sfx, Stage, TypeOn, Variant, base, baseSchema, clamp, iconField, useFormat } from "./primitives";
import { MarkerStroke, roughArrow, tickPath } from "./marker";
import { At, BoxSvg, Breathe, DiagramBox, MascotImg, fitFont, mascotKeyField } from "./diagramKit";
import { piz } from "./theme";

// Process chain / AI agent flow (2026-09-29): 3–4 pixel cards (icon or mascot + label + hand note)
// joined by marker arrows (one row on horizontal, a two-column snake on vertical). A data packet
// (pixel dot) then travels along the arrows; the card it is in lights up blue; in the "thinking" card
// (the AI or the filter) the mascot goes from waiting to thinking (three dots light in turn) to happy,
// and when the packet reaches the last card a marker tick lands and the hand note closes. The packet
// keeps flowing afterwards (silently) so the board never goes still.

const nodeSchema = z.object({
  label: z.string(),
  note: z.string().describe("Short hand note inside the card"),
  icon: iconField,
  mascot: mascotKeyField.describe("If set, the card shows this mascot instead of the icon"),
});
export const flowChainSchema = baseSchema.extend({
  heading: z.string(),
  accent: z.string().describe("Heading words drawn blue"),
  nodes: z.array(nodeSchema).min(3).max(4),
  thinkIndex: z.number().min(-1).max(3).describe("Card where the packet stops to think (-1 = none)"),
  finalNote: z.string(),
});
type Props = z.infer<typeof flowChainSchema>;

const TRAVEL = 14;
const DWELL = 6;
const THINK = 30;

type Card = { x: number; y: number; w: number; h: number };

const layout = (isVertical: boolean, n: number) => {
  if (isVertical) {
    const W = 880;
    const w = 340;
    const h = 250;
    const cols = [40, 500];
    const rows = [110, 474];
    const cards: Card[] = Array.from({ length: n }, (_, i) => {
      const row = Math.floor(i / 2);
      const col = row % 2 === 0 ? i % 2 : 1 - (i % 2);
      return { x: cols[col], y: rows[row], w, h };
    });
    return { W, H: 850, head: 68, cards, noteY: 764, noteFs: 50, visual: 104, iconPx: 5 };
  }
  const W = 1700;
  const w = n === 4 ? 340 : 400;
  const gap = (W - n * w) / (n - 1);
  const cards: Card[] = Array.from({ length: n }, (_, i) => ({ x: i * (w + gap), y: 124, w, h: 300 }));
  return { W, H: 560, head: 76, cards, noteY: 476, noteFs: 60, visual: 128, iconPx: 7 };
};

/** Arrow between two cards: horizontal neighbours join side to side, vertical ones top to bottom. */
const linkPoints = (a: Card, b: Card) => {
  const acx = a.x + a.w / 2;
  const acy = a.y + a.h / 2;
  const bcx = b.x + b.w / 2;
  const bcy = b.y + b.h / 2;
  if (Math.abs(acy - bcy) < 1) {
    const dir = bcx > acx ? 1 : -1;
    return [dir > 0 ? a.x + a.w + 16 : a.x - 16, acy, dir > 0 ? b.x - 16 : b.x + b.w + 16, bcy] as const;
  }
  return [acx, a.y + a.h + 16, bcx, b.y - 16] as const;
};

export const FlowChain: React.FC<Props> = (p) => {
  const frame = useCurrentFrame();
  const { isVertical } = useFormat();
  const n = p.nodes.length;
  const L = layout(isVertical, n);

  // Timing (frames).
  const headLen = Array.from(p.heading).length;
  const headAt = 2;
  const cardAt = (i: number) => headAt + headLen + 4 + i * 16;
  const arrowAt = (i: number) => cardAt(i) + 8;
  const runAt = cardAt(n - 1) + 14;
  // Hop schedule for one run: depart[i] = packet leaves card i along arrow i.
  const depart: number[] = [];
  let t = 0;
  for (let i = 0; i < n - 1; i++) {
    depart.push(t);
    t += TRAVEL;
    if (i + 1 < n - 1) t += i + 1 === p.thinkIndex ? THINK : DWELL;
  }
  const runLen = t; // arrival at the last card
  const finalAt = runAt + runLen;
  const noteAt = finalAt + 10;

  const shafts = p.nodes.slice(0, -1).map((_, i) => {
    const [x1, y1, x2, y2] = linkPoints(L.cards[i], L.cards[i + 1]);
    return roughArrow(x1, y1, x2, y2, `flow${i}`, i % 2 === 0 ? 0.12 : -0.12, 24);
  });

  // Packet state: the first run (with sounds), then a silent loop — rest REST frames in the last
  // card, run again — so the board keeps moving.
  const REST = 24;
  const cycle = runLen + REST;
  const local = frame - runAt;
  let inRun = -1;
  let inCard = -1;
  if (local >= 0 && local < runLen) inRun = local;
  else if (local >= runLen) {
    const tt = (local - runLen) % cycle;
    if (tt < REST) inCard = n - 1;
    else inRun = tt - REST;
  }
  let packet: { x: number; y: number } | null = null;
  if (inRun >= 0) {
    for (let i = 0; i < n - 1; i++) {
      const s0 = depart[i];
      const next = i + 1 < n - 1 ? depart[i + 1] : runLen;
      if (inRun >= s0 && inRun < s0 + TRAVEL) {
        const k = interpolate(inRun, [s0, s0 + TRAVEL], [0, 1], { ...clamp, easing: piz.ease.out });
        const d = shafts[i][0];
        const pt = getPointAtLength(d, getLength(d) * k);
        if (pt) packet = { x: pt.x, y: pt.y };
      } else if (inRun >= s0 + TRAVEL && inRun < next) inCard = i + 1;
    }
  }
  const done = frame >= finalAt;
  const thinkArrive = p.thinkIndex > 0 ? runAt + depart[p.thinkIndex - 1] + TRAVEL : -1;
  const thinkLeave = p.thinkIndex > 0 && p.thinkIndex < n - 1 ? runAt + depart[p.thinkIndex] : -1;
  const headFs = fitFont(p.heading, L.W - 20, L.head, 0.62);

  return (
    <Stage backing={p.backing} safeGuide={p.safeGuide}>
      <DiagramBox w={L.W} h={L.H}>
        <At x={0} y={0} w={L.W}>
          <TypeOn text={p.heading} accent={p.accent} at={headAt} fontSize={headFs} />
        </At>
        <BoxSvg w={L.W} h={L.H}>
          {shafts.map(([shaft, head], i) => (
            <g key={i}>
              <MarkerStroke d={shaft} at={arrowAt(i)} frames={8} color={piz.color.ink} width={8} />
              <MarkerStroke d={head} at={arrowAt(i) + 6} frames={4} color={piz.color.ink} width={8} />
            </g>
          ))}
        </BoxSvg>
        {p.nodes.map((nd, i) => {
          const c = L.cards[i];
          const active = inCard === i || (done && i === n - 1);
          const isThink = i === p.thinkIndex;
          const thinking = isThink && frame >= thinkArrive && frame < thinkLeave;
          const face = !isThink ? "feliz" : frame < thinkArrive ? "sueno" : frame < thinkLeave ? "pensando" : "feliz";
          const fsL = fitFont(nd.label, c.w - 40, isVertical ? 38 : 40, 0.56);
          return (
            <At key={i} x={c.x} y={c.y} w={c.w} h={c.h}>
              <Drop at={cardAt(i)}>
                <div
                  style={{
                    position: "relative",
                    width: c.w,
                    height: c.h,
                    boxSizing: "border-box",
                    background: piz.color.white,
                    border: `${active ? 8 : 4}px solid ${active ? piz.color.accent : piz.color.ink}`,
                    boxShadow: `${piz.ui.hardShadow}px ${piz.ui.hardShadow}px 0 ${piz.ui.shadowColor}`,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                  }}
                >
                  {nd.mascot ? <MascotImg character={nd.mascot} expr={face} size={L.visual} seed={i * 7} /> : <PixelIcon name={nd.icon} px={L.iconPx} />}
                  <div style={{ font: `700 ${fsL}px ${piz.font.caption}`, color: piz.color.ink, lineHeight: 1, whiteSpace: "nowrap" }}>{nd.label}</div>
                  <div style={{ font: `400 ${fitFont(nd.note, c.w - 36, isVertical ? 36 : 40, 0.42)}px ${piz.font.hand}`, color: piz.color.accentDark, lineHeight: 1, whiteSpace: "nowrap" }}>{nd.note}</div>
                  {thinking ? (
                    <div style={{ position: "absolute", right: 14, top: 14, display: "flex", gap: 8 }}>
                      {[0, 1, 2].map((k) => (
                        <div key={k} style={{ width: 14, height: 14, background: Math.floor((frame - thinkArrive) / 6) % 4 > k ? piz.color.accent : piz.color.pending }} />
                      ))}
                    </div>
                  ) : null}
                </div>
              </Drop>
            </At>
          );
        })}
        <BoxSvg w={L.W} h={L.H}>
          {packet ? <rect x={Math.round(packet.x) - 14} y={Math.round(packet.y) - 14} width={28} height={28} fill={piz.color.accent} stroke={piz.color.ink} strokeWidth={4} /> : null}
          <MarkerStroke d={tickPath(L.cards[n - 1].x + L.cards[n - 1].w - 84, L.cards[n - 1].y + 16, 64)} at={finalAt} frames={7} color={piz.color.accent} width={10} />
        </BoxSvg>
        <At x={0} y={L.noteY} w={L.W} style={{ display: "flex", justifyContent: "center" }}>
          <Breathe at={noteAt}>
            <HandNote text={p.finalNote} at={noteAt} fontSize={L.noteFs} color={piz.color.accentDark} style={{ padding: "0 14px" }} />
          </Breathe>
        </At>
      </DiagramBox>
      <Sfx kind="type" at={headAt} frames={headLen + 2} on={p.sfx} />
      {p.nodes.map((_, i) => (
        <Sfx key={`c${i}`} kind="pop" at={cardAt(i)} on={p.sfx} volume={0.25} />
      ))}
      {shafts.map((_, i) => (
        <Sfx key={`a${i}`} kind="marker" at={arrowAt(i)} on={p.sfx} volume={0.3} />
      ))}
      <Sfx kind="tap" at={runAt} on={p.sfx} volume={0.22} />
      {depart.slice(0, -1).map((d, i) =>
        i + 1 === p.thinkIndex ? <Sfx key={`h${i}`} kind="bubble" at={runAt + d + TRAVEL} on={p.sfx} volume={0.35} /> : <Sfx key={`h${i}`} kind="tap" at={runAt + d + TRAVEL} on={p.sfx} volume={0.22} />,
      )}
      {thinkLeave > 0 ? <Sfx kind="bleep" at={thinkLeave} on={p.sfx} volume={0.25} /> : null}
      <Sfx kind="correct" at={finalAt} on={p.sfx} />
    </Stage>
  );
};

export const flowChainVariants: Variant<Props>[] = [
  {
    id: "agente-ia",
    horizontal: true,
    props: {
      ...base("board", 7),
      heading: "ASÍ TRABAJA UN AGENTE DE IA",
      accent: "IA",
      nodes: [
        { label: "Tarea", note: "“resume mis correos”", icon: "mail", mascot: "" },
        { label: "Agente de IA", note: "arma un plan", icon: "robot", mascot: "bit-ia-base" },
        { label: "Herramientas", note: "correo y agenda", icon: "calendar", mascot: "" },
        { label: "Resultado", note: "resumen listo", icon: "check", mascot: "" },
      ],
      thinkIndex: 1,
      finalNote: "tú solo das la tarea",
    },
  },
  {
    id: "automatizacion",
    horizontal: true,
    props: {
      ...base("board", 7),
      heading: "UNA AUTOMATIZACIÓN",
      accent: "AUTOMATIZACIÓN",
      nodes: [
        { label: "Disparador", note: "llega un correo", icon: "mail", mascot: "" },
        { label: "Filtro", note: "¿es una factura?", icon: "question", mascot: "chip-base" },
        { label: "Acción", note: "agenda el pago", icon: "calendar", mascot: "" },
        { label: "Aviso", note: "te avisa al cel", icon: "phone", mascot: "" },
      ],
      thinkIndex: 1,
      finalNote: "y tú ni lo tocaste",
    },
  },
];

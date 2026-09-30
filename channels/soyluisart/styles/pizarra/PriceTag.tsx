import { useCurrentFrame, useVideoConfig } from "remotion";
import { z } from "zod";
import { Drop, HandNote, Sfx, Stage, TypeOn, Variant, base, baseSchema, useFormat } from "./primitives";
import { MarkerLayer, MarkerStroke, roughEllipse, roughLine } from "./marker";
import { piz } from "./theme";

// Vertical content extent on the sheet (measured on the renders) → fitted into the graphics zone
// y 250–970 by <Stage fit> (user rule 2026-09-27, Codex H6).
const ZONE_FIT = [248, 1432] as const;

// Price-tag comparison: 2–3 paper price tags hanging from a string (tag shape with a punched hole,
// ink border), each with a name, a big price and a small detail line. On `verdictAt` the winner
// gets a blue marker circle (ka-ching) and the loser a red marker cross; a hand note explains.

export const priceTagSchema = baseSchema.extend({
  heading: z.string(),
  accent: z.string(),
  tags: z.array(z.object({ name: z.string(), price: z.string(), detail: z.string() })).min(2).max(3),
  winner: z.number().min(0).max(2),
  crossLosers: z.boolean(),
  verdictAt: z.number().min(0),
  note: z.string(),
  source: z.string(),
});
type Props = z.infer<typeof priceTagSchema>;

const TAG_CLIP = "polygon(22% 0, 100% 0, 100% 100%, 22% 100%, 0 50%)";

export const PriceTag: React.FC<Props> = (p) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { isVertical, safeBox, width, height } = useFormat();
  const n = p.tags.length;
  const verdict = Math.round(p.verdictAt * fps);
  const tw = isVertical ? 600 : n === 3 ? 480 : 540;
  const th = isVertical ? (n === 3 ? 230 : 290) : 320;
  const pos = (i: number) =>
    isVertical
      ? { x: safeBox.x + (safeBox.w - tw) / 2 + (i % 2 ? 60 : -40), y: safeBox.y + 300 + i * (th + (n === 3 ? 40 : 90)) }
      : { x: (width - (n * tw + (n - 1) * 80)) / 2 + i * (tw + 80), y: safeBox.y + 260 + (i % 2) * 40 };
  const start = 4 + Array.from(p.heading).length + 4;
  return (
    <Stage backing={p.backing} safeGuide={p.safeGuide} fit={ZONE_FIT}>
      <div style={{ position: "absolute", left: safeBox.x, width: safeBox.w, top: safeBox.y + 10, display: "flex", justifyContent: "center" }}>
        <TypeOn text={p.heading} accent={p.accent} at={4} fontSize={isVertical ? 92 : 86} />
      </div>
      {p.tags.map((t, i) => {
        const q = pos(i);
        const rot = isVertical ? (i % 2 ? 3 : -3) : i % 2 ? 4 : -4;
        return (
          <Drop key={i} at={start + i * 8} px={16} style={{ position: "absolute", left: q.x, top: q.y }}>
            <div style={{ transform: `rotate(${rot}deg)`, transformOrigin: "0% 50%", filter: "drop-shadow(0 8px 12px rgba(40,40,40,0.18))" }}>
              <div style={{ width: tw, height: th, background: piz.color.ink, clipPath: TAG_CLIP, position: "relative" }}>
                <div style={{ position: "absolute", inset: 5, background: i === p.winner ? piz.color.tint : "#FFF6DA", clipPath: TAG_CLIP }} />
                <div style={{ position: "absolute", left: tw * 0.07, top: th / 2 - 16, width: 32, height: 32, borderRadius: "50%", background: piz.color.paper, border: `5px solid ${piz.color.ink}`, boxSizing: "border-box" }} />
                <div style={{ position: "absolute", left: tw * 0.27, right: 20, top: 0, bottom: 0, display: "flex", flexDirection: "column", justifyContent: "center", gap: 4 }}>
                  <div style={{ font: `700 ${isVertical ? 40 : 38}px ${piz.font.label}`, color: piz.color.ink }}>{t.name}</div>
                  <div style={{ font: `800 ${n === 3 ? 84 : isVertical ? 104 : 100}px ${piz.font.heading}`, color: piz.color.ink, letterSpacing: "-0.02em", lineHeight: 1 }}>{t.price}</div>
                  <div style={{ font: `400 ${isVertical ? 50 : 46}px ${piz.font.hand}`, color: piz.color.handInk }}>{t.detail}</div>
                </div>
              </div>
            </div>
          </Drop>
        );
      })}
      <MarkerLayer width={width} height={height}>
        {p.tags.map((_, i) => {
          const q = pos(i);
          const cx = q.x + tw * 0.6;
          const cy = q.y + th / 2;
          if (i === p.winner) return <MarkerStroke key={i} d={roughEllipse(cx, cy, tw * 0.52, th * 0.66, `pw${i}`)} at={verdict} frames={12} width={10} />;
          if (!p.crossLosers) return null;
          return (
            <g key={i}>
              <MarkerStroke d={roughLine(cx - tw * 0.35, cy - th * 0.35, cx + tw * 0.35, cy + th * 0.35, `px${i}a`, 0.03)} at={verdict + 14} frames={6} color={piz.color.alert} width={10} />
              <MarkerStroke d={roughLine(cx + tw * 0.35, cy - th * 0.35, cx - tw * 0.35, cy + th * 0.35, `px${i}b`, 0.03)} at={verdict + 19} frames={6} color={piz.color.alert} width={10} />
            </g>
          );
        })}
      </MarkerLayer>
      <div style={{ position: "absolute", left: safeBox.x, width: safeBox.w, top: isVertical ? pos(n - 1).y + th + (n === 3 ? 30 : 70) : pos(0).y + th + 110, textAlign: "center" }}>
        <HandNote text={p.note} at={verdict + 26} fontSize={isVertical ? 70 : 66} color={piz.color.accentDark} />
      </div>
      <div style={{ position: "absolute", left: safeBox.x, width: safeBox.w, top: safeBox.y + safeBox.h - 40, textAlign: "center", font: `500 28px ${piz.font.caption}`, color: piz.color.muted, visibility: frame >= 0 ? "visible" : "hidden" }}>{p.source}</div>
      <Sfx kind="type" at={4} frames={Array.from(p.heading).length + 2} on={p.sfx} />
      {p.tags.map((_, i) => (
        <Sfx key={i} kind="note" at={start + i * 8} on={p.sfx} volume={0.3} />
      ))}
      <Sfx kind="kaching" at={verdict + 12} on={p.sfx} />
      <Sfx kind="marker" at={verdict} on={p.sfx} />
      {p.crossLosers ? <Sfx kind="strike" at={verdict + 14} on={p.sfx} /> : null}
    </Stage>
  );
};

export const priceTagVariants: Variant<Props>[] = [
  {
    id: "pu",
    horizontal: true,
    props: {
      ...base("board", 6),
      heading: "¿CUÁL ES MÁS BARATA?",
      accent: "BARATA?",
      tags: [
        { name: "Empresa A", price: "$20", detail: "gana $10 · P/U 2" },
        { name: "Empresa B", price: "$10", detail: "gana $2 · P/U 5" },
      ],
      winner: 0,
      crossLosers: true,
      verdictAt: 2.2,
      note: "la de $10 es la cara",
      source: "dato de ejemplo (MXN)",
    },
  },
  {
    id: "plans",
    horizontal: true,
    props: {
      ...base("board", 6),
      heading: "¿QUÉ PLAN TE CONVIENE?",
      accent: "CONVIENE?",
      tags: [
        { name: "Mensual", price: "US$20", detail: "US$240 al año" },
        { name: "Anual", price: "US$200", detail: "ahorras US$40" },
        { name: "Gratis", price: "US$0", detail: "con límites" },
      ],
      winner: 1,
      crossLosers: false,
      verdictAt: 2.4,
      note: "si lo usas diario, el anual",
      source: "precios de ejemplo",
    },
  },
];

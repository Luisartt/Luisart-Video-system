import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { z } from "zod";
import { Sfx, Stage, TypeOn, Variant, base, baseSchema, useFormat } from "./primitives";
import { MarkerStroke, roughLine, tickPath } from "./marker";
import { piz } from "./theme";

// Checklist: a typed heading, then hand-drawn ink boxes with bold items; on each item's beat a blue
// marker tick is drawn into its box (and optionally the text greys out); a chime when the last
// one is ticked.

export const checklistSchema = baseSchema.extend({
  heading: z.string(),
  accent: z.string(),
  items: z.array(z.object({ text: z.string(), at: z.number().min(0).describe("Seconds: tick") })).min(2).max(6),
  dimDone: z.boolean().describe("Grey out ticked items"),
});
type Props = z.infer<typeof checklistSchema>;

const Box: React.FC<{ s: number; tickAt: number; i: number }> = ({ s, tickAt, i }) => {
  const pad = 10;
  const box = [
    roughLine(pad, pad + 2, s - pad, pad, `b${i}a`, 0.02),
    roughLine(s - pad, pad, s - pad + 2, s - pad, `b${i}b`, 0.02),
    roughLine(s - pad + 2, s - pad, pad, s - pad + 1, `b${i}c`, 0.02),
    roughLine(pad, s - pad + 1, pad, pad + 2, `b${i}d`, 0.02),
  ].join(" ");
  return (
    <svg width={s} height={s} viewBox={`0 0 ${s} ${s}`} style={{ overflow: "visible", flexShrink: 0 }}>
      <path d={box} fill="none" stroke={piz.color.ink} strokeWidth={6} strokeLinecap="round" strokeLinejoin="round" />
      <MarkerStroke d={tickPath(pad - 2, pad - 14, s - 2 * pad + 18)} at={tickAt} frames={7} width={11} />
    </svg>
  );
};

export const Checklist: React.FC<Props> = (p) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { isVertical, safeBox } = useFormat();
  const ticks = p.items.map((it) => Math.round(it.at * fps));
  const s = isVertical ? 82 : 76;
  const fs = isVertical ? 54 : 52;
  const last = Math.max(...ticks);
  return (
    <Stage backing={p.backing} safeGuide={p.safeGuide}>
      <AbsoluteFill style={{ left: safeBox.x + (isVertical ? 0 : 200), top: safeBox.y, width: safeBox.w - (isVertical ? 0 : 400), height: safeBox.h, display: "flex", flexDirection: "column", justifyContent: "center", gap: isVertical ? 44 : 30 }}>
        <TypeOn text={p.heading} accent={p.accent} at={2} align="left" fontSize={isVertical ? 96 : 90} style={{ marginBottom: 30 }} />
        {p.items.map((it, i) => {
          const done = frame >= ticks[i] + 6;
          return (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 34 }}>
              <Box s={s} tickAt={ticks[i]} i={i} />
              <div style={{ font: `700 ${fs}px ${piz.font.caption}`, letterSpacing: "-0.01em", color: p.dimDone && done ? piz.color.pending : piz.color.ink, lineHeight: 1.12 }}>{it.text}</div>
            </div>
          );
        })}
      </AbsoluteFill>
      <Sfx kind="type" at={2} frames={Array.from(p.heading).length + 2} on={p.sfx} />
      {ticks.map((t, i) => (
        <Sfx key={i} kind="marker" at={t} on={p.sfx} volume={0.35} />
      ))}
      <Sfx kind="chime" at={last + 10} on={p.sfx} />
    </Stage>
  );
};

export const checklistVariants: Variant<Props>[] = [
  {
    id: "3-items",
    horizontal: true,
    props: {
      ...base("board", 5),
      heading: "ANTES DE INVERTIR",
      accent: "INVERTIR",
      items: [
        { text: "Fondo de emergencia", at: 1.2 },
        { text: "Cero deudas caras", at: 2 },
        { text: "Sabes en qué entras", at: 2.8 },
      ],
      dimDone: false,
    },
  },
  {
    id: "5-items",
    horizontal: true,
    props: {
      ...base("board", 6),
      heading: "AUTOMATIZA CON IA",
      accent: "IA",
      items: [
        { text: "Responder correos", at: 1 },
        { text: "Agendar citas", at: 1.6 },
        { text: "Hacer facturas", at: 2.2 },
        { text: "Resumir juntas", at: 2.8 },
        { text: "Revisar gastos", at: 3.4 },
      ],
      dimDone: true,
    },
  },
];

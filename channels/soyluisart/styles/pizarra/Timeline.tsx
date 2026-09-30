import { useCurrentFrame } from "remotion";
import { z } from "zod";
import { HandNote, Sfx, Stage, TypeOn, Variant, base, baseSchema, useFormat } from "./primitives";
import { MarkerLayer, MarkerStroke, roughLine } from "./marker";
import { piz } from "./theme";

// Vertical content extent on the sheet (measured on the renders) → fitted into the graphics zone
// y 250–970 by <Stage fit> (user rule 2026-09-27, Codex H6).
const ZONE_FIT = [250, 1404] as const;

// Marker timeline: the line is drawn on (left→right on horizontal, top→bottom on vertical), and
// each point pops as the line reaches it: a dot, the year in bold grotesk and a handwritten label.
// The `highlight` point is blue with a bigger dot.

export const timelineSchema = baseSchema.extend({
  heading: z.string(),
  accent: z.string(),
  points: z.array(z.object({ year: z.string(), label: z.string() })).min(2).max(6),
  highlight: z.number().min(-1).max(5),
  drawSeconds: z.number().min(0.5).max(6),
});
type Props = z.infer<typeof timelineSchema>;

export const Timeline: React.FC<Props> = (p) => {
  const frame = useCurrentFrame();
  const { isVertical, safeBox, width, height, } = useFormat();
  const n = p.points.length;
  const lineAt = 4 + Array.from(p.heading).length + 4;
  const lineFrames = Math.round(p.drawSeconds * 30);
  const headH = isVertical ? 170 : 150;
  const a = isVertical ? { x: safeBox.x + 120, y: safeBox.y + headH + 30 } : { x: safeBox.x + 60, y: safeBox.y + safeBox.h / 2 + 30 };
  const b = isVertical ? { x: safeBox.x + 120, y: safeBox.y + safeBox.h - 60 } : { x: safeBox.x + safeBox.w - 60, y: safeBox.y + safeBox.h / 2 + 30 };
  const pt = (i: number) => {
    const t = n === 1 ? 0.5 : 0.06 + (i / (n - 1)) * 0.88;
    return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t, at: lineAt + Math.round(lineFrames * t) };
  };
  return (
    <Stage backing={p.backing} safeGuide={p.safeGuide} fit={ZONE_FIT}>
      <div style={{ position: "absolute", left: safeBox.x, width: safeBox.w, top: safeBox.y + 10, display: "flex", justifyContent: "center" }}>
        <TypeOn text={p.heading} accent={p.accent} at={4} fontSize={isVertical ? 90 : 86} />
      </div>
      <MarkerLayer width={width} height={height}>
        <MarkerStroke d={roughLine(a.x, a.y, b.x, b.y, "tl", 0.01)} at={lineAt} frames={lineFrames} color={piz.color.ink} width={7} />
        {p.points.map((_, i) => {
          const q = pt(i);
          const hl = i === p.highlight;
          return frame >= q.at ? <circle key={i} cx={q.x} cy={q.y} r={hl ? 22 : 15} fill={hl ? piz.color.accent : piz.color.white} stroke={hl ? piz.color.accent : piz.color.ink} strokeWidth={6} /> : null;
        })}
      </MarkerLayer>
      {p.points.map((pp, i) => {
        const q = pt(i);
        const hl = i === p.highlight;
        const vis = frame >= q.at;
        const up = !isVertical && i % 2 === 0;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: isVertical ? q.x + 50 : q.x - 180,
              width: isVertical ? safeBox.w - 200 : 360,
              top: isVertical ? q.y - 50 : up ? q.y - 190 : q.y + 40,
              textAlign: isVertical ? "left" : "center",
              visibility: vis ? "visible" : "hidden",
            }}
          >
            <div style={{ font: `800 ${isVertical ? 64 : 60}px ${piz.font.heading}`, color: hl ? piz.color.accent : piz.color.ink, lineHeight: 1 }}>{pp.year}</div>
            <HandNote text={pp.label} at={q.at + 2} fontSize={isVertical ? 56 : 52} align={isVertical ? "left" : "center"} color={hl ? piz.color.accentDark : piz.color.handInk} />
          </div>
        );
      })}
      <Sfx kind="type" at={4} frames={Array.from(p.heading).length + 2} on={p.sfx} />
      <Sfx kind="markerWrite" at={lineAt} frames={lineFrames} on={p.sfx} volume={0.22} />
      {p.points.map((_, i) => (
        <Sfx key={i} kind="tick" at={pt(i).at} on={p.sfx} volume={0.35} />
      ))}
    </Stage>
  );
};

export const timelineVariants: Variant<Props>[] = [
  {
    id: "4-points",
    horizontal: true,
    props: {
      ...base("board", 6),
      heading: "ASÍ LLEGÓ LA IA",
      accent: "IA",
      points: [
        { year: "2017", label: "nace la idea clave" },
        { year: "2020", label: "modelos más grandes" },
        { year: "2022", label: "llega ChatGPT" },
        { year: "Hoy", label: "está en tu bolsillo" },
      ],
      highlight: 3,
      drawSeconds: 2.4,
    },
  },
  {
    id: "5-points",
    horizontal: true,
    props: {
      ...base("board", 7),
      heading: "TU PLAN A 5 AÑOS",
      accent: "5 AÑOS",
      points: [
        { year: "Año 1", label: "fondo de emergencia" },
        { year: "Año 2", label: "cero deudas" },
        { year: "Año 3", label: "primeras inversiones" },
        { year: "Año 4", label: "ingreso extra" },
        { year: "Año 5", label: "tu dinero trabaja" },
      ],
      highlight: 4,
      drawSeconds: 3,
    },
  },
];

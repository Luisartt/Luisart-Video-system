import { AbsoluteFill, random } from "remotion";
import { z } from "zod";
import { Drop, Sfx, Stage, Variant, base, baseSchema, useFormat } from "./primitives";
import { piz } from "./theme";

// Press-clippings collage on the cream board: paper cut-outs with torn top/bottom edges and a soft
// shadow, stacked and overlapping, one every `stagger` frames (fade + 12 px drop, paper sound).
// The first item can be a big serif headline cut-out; the rest are news cards (outlet, serif
// headline, date). Sample text is fictional and labelled as example.

const itemSchema = z.object({
  outlet: z.string(),
  headline: z.string(),
  date: z.string(),
  big: z.boolean().describe("Big serif headline cut-out"),
});
export const clippingsSchema = baseSchema.extend({
  items: z.array(itemSchema).min(1).max(5),
  stagger: z.number().min(4).max(30),
  label: z.string().describe("Small line at the bottom (\"titulares de ejemplo\")"),
});
type Props = z.infer<typeof clippingsSchema>;

/** Torn-paper clip path: jagged top and bottom edges, straight sides. */
const torn = (seed: string, teeth = 38, depth = 1.6) => {
  const pts: string[] = [];
  for (let i = 0; i <= teeth; i++) {
    const x = (i / teeth) * 100;
    pts.push(`${x.toFixed(2)}% ${(random(`${seed}t${i}`) * depth).toFixed(2)}%`);
  }
  for (let i = teeth; i >= 0; i--) {
    const x = (i / teeth) * 100;
    pts.push(`${x.toFixed(2)}% ${(100 - random(`${seed}b${i}`) * depth).toFixed(2)}%`);
  }
  return `polygon(${pts.join(", ")})`;
};

const Clip: React.FC<{ item: z.infer<typeof itemSchema>; w: number; seed: string }> = ({ item, w, seed }) => {
  const fs = item.big ? Math.round(w / 11.5) : Math.round(w / 21);
  return (
    <div style={{ filter: "drop-shadow(0 6px 10px rgba(60,50,30,0.22))" }}>
      <div style={{ width: w, background: piz.color.white, clipPath: torn(seed, item.big ? 44 : 34, item.big ? 1.4 : 2.6), padding: item.big ? "34px 34px 40px" : "30px 30px 34px", boxSizing: "border-box" }}>
        {item.big ? (
          <div style={{ font: `700 ${fs}px ${piz.font.serif}`, color: piz.color.ink, lineHeight: 1.08, letterSpacing: "-0.01em" }}>{item.headline}</div>
        ) : (
          <>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: fs * 1.1, height: fs * 1.1, background: piz.color.ink, color: piz.color.white, font: `700 ${fs * 0.8}px ${piz.font.serif}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                {item.outlet.trim().charAt(0).toUpperCase()}
              </div>
              <div style={{ font: `500 ${fs * 0.85}px ${piz.font.caption}`, color: "#444" }}>{item.outlet}</div>
            </div>
            <div style={{ font: `700 ${fs * 1.25}px ${piz.font.serif}`, color: piz.color.accentDark, lineHeight: 1.2, marginTop: 12 }}>{item.headline}</div>
            <div style={{ font: `500 ${fs * 0.8}px ${piz.font.caption}`, color: piz.color.muted, marginTop: 10 }}>{item.date}</div>
          </>
        )}
      </div>
    </div>
  );
};

export const Clippings: React.FC<Props> = (p) => {
  const { isVertical, safeBox } = useFormat();
  const w = isVertical ? safeBox.w - 20 : 860;
  const start = 4;
  const overlap = isVertical ? -26 : -30;
  const col = (items: typeof p.items, offset: number) =>
    items.map((it, j) => {
      const i = j + offset;
      const rot = (random(`rot${i}`) - 0.5) * 3;
      const dx = Math.round((random(`dx${i}`) - 0.5) * (isVertical ? 60 : 80));
      const cw = it.big ? w : Math.round(w * 0.9);
      return (
        <Drop key={i} at={start + i * p.stagger} px={12} style={{ marginTop: j === 0 ? 0 : overlap, zIndex: i, position: "relative" }}>
          <div style={{ transform: `translateX(${dx}px) rotate(${rot.toFixed(2)}deg)` }}>
            <Clip item={it} w={cw} seed={`clip${i}`} />
          </div>
        </Drop>
      );
    });
  return (
    <Stage backing={p.backing} safeGuide={p.safeGuide}>
      {isVertical ? (
        <AbsoluteFill style={{ left: safeBox.x, top: safeBox.y, width: safeBox.w, height: safeBox.h - 60, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
          {col(p.items, 0)}
        </AbsoluteFill>
      ) : (
        <AbsoluteFill style={{ left: safeBox.x, top: safeBox.y, width: safeBox.w, height: safeBox.h - 50, display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 70 }}>
          <div style={{ display: "flex", flexDirection: "column" }}>{col(p.items.slice(0, 1), 0)}</div>
          <div style={{ display: "flex", flexDirection: "column" }}>{col(p.items.slice(1), 1)}</div>
        </AbsoluteFill>
      )}
      <div style={{ position: "absolute", left: safeBox.x, width: safeBox.w, top: safeBox.y + safeBox.h - 44, textAlign: "center", font: `400 40px ${piz.font.hand}`, color: piz.color.handInk }}>{p.label}</div>
      {p.items.map((_, i) => (
        <Sfx key={i} kind="paper" at={start + i * p.stagger} on={p.sfx} />
      ))}
    </Stage>
  );
};

export const clippingsVariants: Variant<Props>[] = [
  {
    id: "press",
    horizontal: true,
    props: {
      ...base("cream", 5),
      stagger: 10,
      label: "titulares de ejemplo",
      items: [
        { big: true, outlet: "", date: "", headline: "La IA ya hace en una tarde lo que antes costaba meses" },
        { big: false, outlet: "Diario Ejemplo", headline: "Las pymes que usan IA ahorran horas cada semana", date: "12 sept 2026" },
        { big: false, outlet: "Revista Modelo", headline: "Automatizar tareas deja de ser cosa de grandes empresas", date: "3 sept 2026" },
      ],
    },
  },
];

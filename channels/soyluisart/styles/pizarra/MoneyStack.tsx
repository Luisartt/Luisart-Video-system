import { useCurrentFrame, useVideoConfig } from "remotion";
import { z } from "zod";
import { FloorShadow, HandNote, PixelArt, Sfx, Stage, TypeOn, Variant, base, baseSchema, useFormat } from "./primitives";
import { fmtMx } from "./marker";
import { piz } from "./theme";

// Vertical content extent on the sheet (measured on the renders) → fitted into the graphics zone
// y 250–970 by <Stage fit> (user rule 2026-09-27, Codex H6).
const ZONE_FIT = [268, 1432] as const;

// Pesos money stack in pixel art: a pile of bills grows one bill per frame (side view: each bill
// is a two-pixel slab, the top bill drawn in full) while its amount counts up in pesos; a
// bag-drop thud when it settles. Compare mode shows 2–3 stacks whose heights are computed from
// their amounts.

const G = "#7FC89A";
const g = "#BFE6CB";
const PAL = { K: piz.color.ink, v: g, V: G, D: "#3E8E5E", W: piz.color.white };
const TOP = [
  "KKKKKKKKKKKKKKKKKKKK",
  "KvvvvvvvvvvvvvvvvvvK",
  "KvVVvvvvvKKvvvvvVVvK",
  "KvVvvvvvKvvKvvvvvVvK",
  "KvvvvvvvKvvKvvvvvvvK",
  "KvVvvvvvKvvKvvvvvVvK",
  "KvVVvvvvvKKvvvvvVVvK",
  "KvvvvvvvvvvvvvvvvvvK",
  "KKKKKKKKKKKKKKKKKKKK",
];
const SLAB = ["KVVVVVVVVVVVVVVVVVVK", "KDDDDDDDDDDDDDDDDDDK"];

export const moneyStackSchema = baseSchema.extend({
  heading: z.string(),
  accent: z.string(),
  stacks: z.array(z.object({ label: z.string(), amount: z.number() })).min(1).max(3),
  pesosPerBill: z.number().min(1).describe("Pesos one bill stands for (sets the height)"),
  maxBills: z.number().min(5).max(60),
  note: z.string(),
  source: z.string(),
});
type Props = z.infer<typeof moneyStackSchema>;

export const MoneyStack: React.FC<Props> = (p) => {
  const frame = useCurrentFrame();
  useVideoConfig();
  const { isVertical, safeBox, width } = useFormat();
  const n = p.stacks.length;
  const start = 4 + Array.from(p.heading).length + 4;
  const bills = p.stacks.map((s) => Math.max(1, Math.min(p.maxBills, Math.round(s.amount / p.pesosPerBill))));
  // Pixel size: as big as fits the tallest stack between the heading and the labels.
  const maxRows = TOP.length + SLAB.length * (Math.max(...bills) - 1);
  const baseYEarly = safeBox.y + safeBox.h - (isVertical ? 330 : 260);
  const availH = baseYEarly - (safeBox.y + (isVertical ? 280 : 250));
  const px = Math.max(3, Math.min(isVertical ? (n > 2 ? 9 : 12) : 11, Math.floor(availH / maxRows)));
  const colW = Math.max(20 * px + 80, isVertical ? 340 : 420);
  const gap = isVertical ? 30 : 120;
  const totalW = n * colW + (n - 1) * gap;
  const baseY = safeBox.y + safeBox.h - (isVertical ? 330 : 260);
  const done = (i: number) => start + i * 6 + bills[i];
  return (
    <Stage backing={p.backing} safeGuide={p.safeGuide} fit={ZONE_FIT}>
      <div style={{ position: "absolute", left: safeBox.x, width: safeBox.w, top: safeBox.y + 10, display: "flex", justifyContent: "center" }}>
        <TypeOn text={p.heading} accent={p.accent} at={4} fontSize={isVertical ? 90 : 86} />
      </div>
      {p.stacks.map((s, i) => {
        const shown = Math.max(0, Math.min(bills[i], frame - (start + i * 6) + 1));
        const rows: string[] = [];
        if (shown > 0) {
          rows.push(...TOP);
          for (let k = 1; k < shown; k++) rows.push(...SLAB);
        }
        const h = rows.length * px;
        const amount = bills[i] > 0 ? (s.amount * shown) / bills[i] : 0;
        const x = (width - totalW) / 2 + i * (colW + gap);
        return (
          <div key={i} style={{ position: "absolute", left: x, width: colW, top: baseY - h, display: "flex", flexDirection: "column", alignItems: "center" }}>
            <div style={{ font: `800 ${isVertical ? (n > 2 ? 46 : 58) : 60}px ${piz.font.heading}`, color: i === n - 1 ? piz.color.accent : piz.color.ink, marginBottom: 14, fontVariantNumeric: "tabular-nums", visibility: shown > 0 ? "visible" : "hidden", whiteSpace: "nowrap" }}>
              ${fmtMx(frame >= done(i) ? s.amount : Math.round(amount))}
            </div>
            <PixelArt rows={rows.length ? rows : ["."]} px={px} palette={PAL} />
            <div style={{ marginTop: 8 }}>
              <FloorShadow width={20 * px} />
            </div>
            <div style={{ position: "absolute", top: h + 60, width: colW, textAlign: "center", font: `400 ${isVertical ? 50 : 52}px ${piz.font.hand}`, color: piz.color.handInk, lineHeight: 1 }}>{s.label}</div>
          </div>
        );
      })}
      <div style={{ position: "absolute", left: safeBox.x, width: safeBox.w, top: baseY + (isVertical ? 170 : 140), textAlign: "center" }}>
        <HandNote text={p.note} at={Math.max(...p.stacks.map((_, i) => done(i))) + 8} fontSize={isVertical ? 70 : 64} color={piz.color.accentDark} />
      </div>
      <div style={{ position: "absolute", left: safeBox.x, width: safeBox.w, top: safeBox.y + safeBox.h - 40, textAlign: "center", font: `500 28px ${piz.font.caption}`, color: piz.color.muted }}>{p.source}</div>
      <Sfx kind="type" at={4} frames={Array.from(p.heading).length + 2} on={p.sfx} />
      {p.stacks.map((_, i) => (
        <Sfx key={`c${i}`} kind="countMoney" at={start + i * 6} frames={bills[i]} on={p.sfx} />
      ))}
      {p.stacks.map((_, i) => (
        <Sfx key={`b${i}`} kind="bagDrop" at={done(i)} on={p.sfx} volume={0.25} />
      ))}
    </Stage>
  );
};

export const moneyStackVariants: Variant<Props>[] = [
  {
    id: "grow",
    horizontal: true,
    props: { ...base("board", 5), heading: "TU AHORRO EN 1 AÑO", accent: "1 AÑO", stacks: [{ label: "$1,500 al mes × 12", amount: 18000 }], pesosPerBill: 500, maxBills: 60, note: "sin darte cuenta", source: "dato de ejemplo (MXN)" },
  },
  {
    id: "compare",
    horizontal: true,
    props: {
      ...base("board", 6),
      heading: "INVERTIR VS GUARDAR",
      accent: "INVERTIR",
      stacks: [
        { label: "bajo el colchón", amount: 50000 },
        { label: "invertido al 10%", amount: 129687 },
      ],
      pesosPerBill: 5000,
      maxBills: 60,
      note: "$50,000 en 10 años",
      source: "dato de ejemplo: 10% anual compuesto, sin inflación",
    },
  },
];

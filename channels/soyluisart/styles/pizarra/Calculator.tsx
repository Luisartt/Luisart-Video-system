import { AbsoluteFill, useCurrentFrame } from "remotion";
import { z } from "zod";
import { HandNote, RetroWindow, Sfx, Stage, TypeOn, Variant, base, baseSchema, useFormat } from "./primitives";
import { MarkerLayer, MarkerStroke, fmtMx, roughLine } from "./marker";
import { piz } from "./theme";

// Vertical content extent on the sheet (measured on the renders) → fitted into the graphics zone
// y 250–970 by <Stage fit> (user rule 2026-09-27, Codex H6).
const ZONE_FIT = [255, 1290] as const;

// "Calculator" breakdown: a retro window where each line (label + signed amount in pesos) lands
// with a click, a marker rule is drawn under them and the total — computed from the lines, never
// typed by hand — lands big in blue (or red for a bad total) with a ka-ching.

export const calculatorSchema = baseSchema.extend({
  heading: z.string(),
  accent: z.string(),
  title: z.string(),
  items: z.array(z.object({ label: z.string(), amount: z.number().describe("Signed: +income / −expense") })).min(2).max(6),
  totalLabel: z.string(),
  currency: z.string(),
  totalTone: z.enum(["accent", "alert"]),
  note: z.string(),
  every: z.number().min(4).max(30),
});
type Props = z.infer<typeof calculatorSchema>;

export const Calculator: React.FC<Props> = (p) => {
  const frame = useCurrentFrame();
  const { isVertical, safeBox, width, height } = useFormat();
  const total = p.items.reduce((s, it) => s + it.amount, 0);
  const start = 10;
  const w = isVertical ? safeBox.w - piz.ui.hardShadow : 1000;
  const rowH = isVertical ? 92 : 80;
  const fs = isVertical ? 46 : 42;
  const ruleAt = start + p.items.length * p.every + 2;
  const totalAt = ruleAt + 12;
  const left = isVertical ? safeBox.x : (width - w) / 2;
  const headTop = isVertical ? safeBox.y + 20 : safeBox.y;
  const winTop = headTop + (isVertical ? 170 : 140);
  const barH = 80;
  const ruleY = winTop + barH + 24 + p.items.length * rowH + 14;
  const sign = (n: number) => (n < 0 ? "−" : "+");
  const toneCol = p.totalTone === "alert" ? piz.color.alert : piz.color.accent;
  return (
    <Stage backing={p.backing} safeGuide={p.safeGuide} fit={ZONE_FIT}>
      <AbsoluteFill style={{ left: safeBox.x, width: safeBox.w, top: headTop, height: 140, display: "flex", justifyContent: "center" }}>
        <TypeOn text={p.heading} accent={p.accent} at={2} fontSize={isVertical ? 92 : 86} />
      </AbsoluteFill>
      <div style={{ position: "absolute", left, top: winTop }}>
        <RetroWindow title={p.title} width={w} titleSize={34}>
          <div style={{ padding: "24px 40px 30px" }}>
            {p.items.map((it, i) => (
              <div key={i} style={{ height: rowH, display: "flex", justifyContent: "space-between", alignItems: "center", visibility: frame >= start + i * p.every ? "visible" : "hidden" }}>
                <div style={{ font: `500 ${fs}px ${piz.font.caption}`, color: "#333" }}>{it.label}</div>
                <div style={{ font: `700 ${fs}px ${piz.font.label}`, color: it.amount < 0 ? piz.color.alert : piz.color.ink, fontVariantNumeric: "tabular-nums" }}>
                  {sign(it.amount)} {p.currency}
                  {fmtMx(Math.abs(it.amount))}
                </div>
              </div>
            ))}
            <div style={{ height: 40 }} />
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", visibility: frame >= totalAt ? "visible" : "hidden" }}>
              <div style={{ font: `700 ${fs * 1.05}px ${piz.font.caption}`, color: piz.color.ink }}>{p.totalLabel}</div>
              <div style={{ font: `800 ${fs * 1.9}px ${piz.font.heading}`, color: toneCol, letterSpacing: "-0.02em" }}>
                {p.currency}
                {fmtMx(total)}
              </div>
            </div>
          </div>
        </RetroWindow>
      </div>
      <MarkerLayer width={width} height={height}>
        <MarkerStroke d={roughLine(left + 30, ruleY, left + w - 30, ruleY - 4, "rule", 0.01)} at={ruleAt} frames={9} color={piz.color.ink} width={7} />
      </MarkerLayer>
      <div style={{ position: "absolute", left: safeBox.x, width: safeBox.w, top: ruleY + rowH * 2 + 40, textAlign: "center" }}>
        <HandNote text={p.note} at={totalAt + 8} fontSize={isVertical ? 70 : 64} color={p.totalTone === "alert" ? piz.color.alert : piz.color.accentDark} />
      </div>
      <Sfx kind="type" at={2} frames={Array.from(p.heading).length + 2} on={p.sfx} />
      {p.items.map((_, i) => (
        <Sfx key={i} kind="click" at={start + i * p.every} on={p.sfx} volume={0.22} />
      ))}
      <Sfx kind="marker" at={ruleAt} on={p.sfx} />
      <Sfx kind={p.totalTone === "alert" ? "error" : "kaching"} at={totalAt} on={p.sfx} volume={p.totalTone === "alert" ? 0.15 : undefined} />
    </Stage>
  );
};

export const calculatorVariants: Variant<Props>[] = [
  {
    id: "budget",
    horizontal: true,
    props: {
      ...base("board", 6),
      heading: "TU MES EN NÚMEROS",
      accent: "NÚMEROS",
      title: "Presupuesto · dato de ejemplo",
      items: [
        { label: "Sueldo", amount: 20000 },
        { label: "Renta", amount: -7000 },
        { label: "Comida", amount: -4000 },
        { label: "Transporte", amount: -1500 },
      ],
      totalLabel: "Te queda",
      currency: "$",
      totalTone: "accent",
      note: "eso es lo que puedes ahorrar",
      every: 10,
    },
  },
  {
    id: "card-debt",
    horizontal: true,
    props: {
      ...base("board", 6),
      heading: "LO QUE DE VERDAD PAGAS",
      accent: "PAGAS",
      title: "Tarjeta de crédito · dato de ejemplo",
      items: [
        { label: "Compra a meses", amount: 10000 },
        { label: "Intereses", amount: 3500 },
        { label: "Comisiones", amount: 600 },
      ],
      totalLabel: "Total",
      currency: "$",
      totalTone: "alert",
      note: "41% más de lo que costaba",
      every: 12,
    },
  },
];

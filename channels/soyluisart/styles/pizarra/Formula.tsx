import { evolvePath } from "@remotion/paths";
import { interpolate, useCurrentFrame } from "remotion";
import { z } from "zod";
import { Drop, HandNote, Sfx, Stage, Variant, base, baseSchema, clamp } from "./primitives";
import { MarkerLayer, fmtMx } from "./marker";
import { Breathe, Float, MarkerArrow, MascotSprite, SAMPLE, SourceLabel, ZoneHeading, exprField, fitSize, mascotField, useZone } from "./financeKit";
import { piz } from "./theme";

// Big typeset formula (CFA look): the terms appear one by one, each gets a blue marker underline
// and its legend row (symbol · hand note · example value) lands under the formula. Then an arrow
// runs from the legend to the worked result (computed in the variant from the example numbers),
// which lands with a ding / ka-ching while the mascot (CFA book, calculator) reacts.

const item = z.object({
  t: z.string(),
  op: z.boolean().describe("Operator (=, ÷, +, ×): appears with the next term, no underline"),
  sup: z.boolean().describe("Exponent (drawn small and raised)"),
  br: z.boolean().describe("Vertical only: start a new line before this item"),
});

export const formulaSchema = baseSchema.extend({
  heading: z.string(),
  accent: z.string(),
  formula: z.array(item).min(3).max(9),
  legend: z
    .array(z.object({ term: z.number().min(0).describe("Index in `formula` to underline"), symbol: z.string(), note: z.string(), value: z.string().describe("Example value ('' = none)") }))
    .min(1)
    .max(4)
    .describe("In formula order; one beat each"),
  resultLabel: z.string().describe("Hand label before the result"),
  result: z.string().describe("Worked result, computed from the example numbers"),
  resultSound: z.enum(["ding", "kaching"]),
  mascot: mascotField,
  mascotFrom: exprField,
  mascotTo: exprField,
  source: z.string(),
});
type Props = z.infer<typeof formulaSchema>;

const UNDERLINE = "M10,18 C200,10 480,24 720,14 S930,18 990,12";
const UNDER2 = "M20,20 C260,14 520,26 760,16 S940,22 980,16";

/** Marker underline stretched under its parent (draws on from `at`). */
const Underline: React.FC<{ at: number; color: string; d?: string; top?: string }> = ({ at, color, d = UNDERLINE, top = "96%" }) => {
  const frame = useCurrentFrame();
  if (frame < at) return null;
  const p = interpolate(frame, [at, at + 8], [0, 1], { ...clamp, easing: piz.ease.out });
  const ev = evolvePath(p, d);
  return (
    <svg viewBox="0 0 1000 30" preserveAspectRatio="none" style={{ position: "absolute", left: "-4%", width: "108%", height: 26, top, overflow: "visible" }}>
      <path d={d} fill="none" stroke={color} strokeWidth={9} strokeLinecap="round" strokeDasharray={ev.strokeDasharray} strokeDashoffset={ev.strokeDashoffset} />
    </svg>
  );
};

const BEAT = 22;

export const Formula: React.FC<Props> = (p) => {
  const frame = useCurrentFrame();
  const { isVertical, width, height, z: zone } = useZone();
  p.legend.forEach((l) => {
    if (l.term >= p.formula.length || p.formula[l.term].op) throw new Error(`Formula: legend "${l.symbol}" must point at a term`);
  });

  // ── Timing: legend row k is beat k; items appear with the next underlined term ──
  const headAt = 2;
  const mascotAt = 8;
  const b0 = headAt + Math.min(Array.from(p.heading).length, 20) + 4;
  const beat = (k: number) => b0 + k * BEAT;
  const lastBeat = beat(p.legend.length - 1);
  const appearAt: number[] = [];
  let pending: number[] = [];
  p.formula.forEach((_, i) => {
    pending.push(i);
    const k = p.legend.findIndex((l) => l.term === i);
    if (k >= 0) {
      pending.forEach((j) => (appearAt[j] = beat(k)));
      pending = [];
    }
  });
  pending.forEach((j) => (appearAt[j] = lastBeat));
  const arrowAt = lastBeat + 20;
  const resultAt = arrowAt + 12;

  // ── Layout ──
  const lines: number[][] = [[]];
  p.formula.forEach((it, i) => {
    if (isVertical && it.br && lines[lines.length - 1].length) lines.push([]);
    lines[lines.length - 1].push(i);
  });
  const lineChars = Math.max(...lines.map((ln) => ln.reduce((a, i) => a + Array.from(p.formula[i].t).length * (p.formula[i].sup ? 0.5 : 1) + 1, 0)));
  const fW = isVertical ? zone.w - 20 : 1400;
  const fs = Math.min(isVertical ? 96 : 104, Math.floor(fW / (lineChars * 0.58)));
  const fTop = isVertical ? 344 : 196;
  const fH = lines.length * fs * 1.14;
  const V = isVertical;
  const symChars = Math.max(...p.legend.map((l) => Array.from(l.symbol).length));
  const leg = V ? { x: 128, w: 784, top: fTop + fH + 22, rowH: 72, sym: 42, note: 36, val: 42 } : { x: 200, w: 1040, top: fTop + fH + 28, rowH: 64, sym: 44, note: 42, val: 44 };
  const symW = Math.round(symChars * 0.62 * leg.sym + 16);
  const legRow = (k: number) => leg.top + k * leg.rowH;
  const resTop = legRow(p.legend.length) + (V ? 14 : 8);
  const mascot = V ? { x: 760, y: Math.min(772, resTop - 6), size: 160 } : { x: 1450, y: leg.top - 20, size: 256 };
  const res = V ? { x: leg.x + 100, w: 520, label: 38, max: 58 } : { x: leg.x + 340, w: 840, label: 40, max: 66 };
  const resSize = fitSize(p.result, res.w, res.max, 0.6);
  const lastVal = p.legend[p.legend.length - 1];
  const arrow = V
    ? { x1: leg.x + 24, y1: legRow(p.legend.length - 1) + leg.rowH - 6, x2: res.x - 16, y2: resTop + res.label + resSize * 0.55, bend: 0.3 }
    : { x1: leg.x + 20, y1: legRow(p.legend.length - 1) + leg.rowH - 4, x2: res.x - 20, y2: resTop + res.label + resSize * 0.5, bend: 0.3 };

  return (
    <Stage backing={p.backing} safeGuide={p.safeGuide}>
      <ZoneHeading text={p.heading} accent={p.accent} at={headAt} left={zone.x} top={V ? 256 : 96} width={zone.w} max={V ? 70 : 80} sfx={p.sfx} />
      {/* formula */}
      <div style={{ position: "absolute", left: zone.x, top: fTop, width: zone.w, display: "flex", flexDirection: "column", alignItems: "center" }}>
        {lines.map((ln, li) => (
          <div key={li} style={{ display: "flex", alignItems: "baseline", gap: Math.round(fs * 0.22), height: fs * 1.14, font: `800 ${fs}px ${piz.font.heading}`, color: piz.color.ink, letterSpacing: "-0.02em", whiteSpace: "nowrap" }}>
            {ln.map((i) => {
              const it = p.formula[i];
              const k = p.legend.findIndex((l) => l.term === i);
              return (
                <div key={i} style={{ position: "relative", fontSize: it.sup ? "0.55em" : undefined, alignSelf: it.sup ? "flex-start" : undefined, marginLeft: it.sup ? -Math.round(fs * 0.16) : 0, color: it.op ? piz.color.muted : piz.color.ink, visibility: frame >= appearAt[i] ? "visible" : "hidden" }}>
                  <Drop at={appearAt[i]} px={8}>
                    {it.t}
                  </Drop>
                  {k >= 0 ? <Underline at={beat(k) + 2} color={piz.color.accent} top={it.sup ? "88%" : "92%"} /> : null}
                </div>
              );
            })}
          </div>
        ))}
      </div>
      {/* legend: symbol · hand note · example value */}
      {p.legend.map((l, k) => (
        <div key={k} style={{ position: "absolute", left: leg.x, top: legRow(k), width: V ? leg.w : leg.w, height: leg.rowH }}>
          <Drop at={beat(k) + 4} style={{ display: "flex", alignItems: "center", height: "100%", gap: 18 }}>
            <div style={{ width: symW, flexShrink: 0, font: `800 ${leg.sym}px ${piz.font.heading}`, color: piz.color.accent, letterSpacing: "-0.01em", whiteSpace: "nowrap" }}>{l.symbol}</div>
            <div style={{ flex: 1, minWidth: 0, font: `400 ${leg.note}px ${piz.font.hand}`, color: piz.color.handInk, lineHeight: 0.98 }}>{l.note}</div>
            {l.value ? <div style={{ font: `800 ${leg.val}px ${piz.font.heading}`, color: piz.color.ink, whiteSpace: "nowrap", fontVariantNumeric: "tabular-nums" }}>{l.value}</div> : null}
          </Drop>
        </div>
      ))}
      <MarkerLayer width={width} height={height}>
        <MarkerArrow {...arrow} at={arrowAt} seed={`fa${lastVal.symbol}`} color={piz.color.ink} width={7} head={26} />
      </MarkerLayer>
      {/* worked result */}
      <div style={{ position: "absolute", left: res.x, top: resTop, width: res.w, visibility: frame >= resultAt ? "visible" : "hidden" }}>
        <HandNote text={p.resultLabel} at={resultAt} fontSize={res.label} align="left" color={piz.color.accentDark} style={{ padding: "0 14px 0 0", lineHeight: 1 }} />
        <div style={{ position: "relative", display: "inline-block", marginTop: V ? 2 : 4 }}>
          <Breathe at={resultAt} style={{ transformOrigin: "0% 50%" }}>
            <Drop at={resultAt} px={8}>
              <div style={{ font: `800 ${resSize}px ${piz.font.heading}`, color: piz.color.accent, letterSpacing: "-0.02em", whiteSpace: "nowrap", fontVariantNumeric: "tabular-nums" }}>{p.result}</div>
            </Drop>
          </Breathe>
          <Underline at={resultAt + 5} color={piz.color.ink} top="98%" />
          <Underline at={resultAt + 9} color={piz.color.ink} d={UNDER2} top="112%" />
        </div>
      </div>
      <div style={{ position: "absolute", left: mascot.x, top: mascot.y }}>
        <Float px={3} whole>
          <MascotSprite character={p.mascot} size={mascot.size} at={mascotAt} faces={[{ expr: p.mascotFrom, at: 0 }, { expr: p.mascotTo, at: resultAt }]} />
        </Float>
      </div>
      <SourceLabel text={p.source} left={V ? 520 : 1380} top={V ? 944 : 748} width={400} align={V ? "right" : "left"} size={24} />
      <Sfx kind="pop" at={mascotAt} on={p.sfx} volume={0.2} />
      {p.legend.map((_, k) => (
        <Sfx key={k} kind="marker" at={beat(k) + 2} on={p.sfx} volume={0.34} />
      ))}
      <Sfx kind="marker" at={arrowAt} on={p.sfx} volume={0.3} />
      <Sfx kind={p.resultSound} at={resultAt} on={p.sfx} />
    </Stage>
  );
};

const T = (t: string, extra: Partial<z.infer<typeof item>> = {}) => ({ t, op: false, sup: false, br: false, ...extra });
const O = (t: string, extra: Partial<z.infer<typeof item>> = {}) => ({ t, op: true, sup: false, br: false, ...extra });

// Worked examples (sample numbers, computed here so the result always matches the legend).
const PU = { precio: 200, upa: 20 };
const BAL = { pasivos: 300000, capital: 200000 };
const VT = { vp: 10000, r: 0.1, n: 5 };

export const formulaVariants: Variant<Props>[] = [
  {
    id: "pu",
    horizontal: true,
    props: {
      ...base("board", 6),
      heading: "¿QUÉ ES EL P/U?",
      accent: "P/U?",
      formula: [T("P/U"), O("="), T("Precio"), O("÷"), T("UPA")],
      legend: [
        { term: 0, symbol: "P/U", note: "cuántas veces pagas la utilidad", value: "" },
        { term: 2, symbol: "Precio", note: "lo que cuesta 1 acción", value: `$${fmtMx(PU.precio)}` },
        { term: 4, symbol: "UPA", note: "utilidad por acción al año", value: `$${fmtMx(PU.upa)}` },
      ],
      resultLabel: "con estos datos:",
      result: `P/U = ${fmtMx(PU.precio / PU.upa)} veces`,
      resultSound: "ding",
      mascot: "libro-base",
      mascotFrom: "pensando",
      mascotTo: "feliz",
      source: `${SAMPLE} (MXN)`,
    },
  },
  {
    id: "balance",
    horizontal: true,
    props: {
      ...base("board", 6),
      heading: "LA ECUACIÓN CONTABLE",
      accent: "CONTABLE",
      formula: [T("Activos"), O("="), T("Pasivos", { br: true }), O("+"), T("Capital")],
      legend: [
        { term: 0, symbol: "Activos", note: "todo lo que la empresa tiene", value: `$${fmtMx(BAL.pasivos + BAL.capital)}` },
        { term: 2, symbol: "Pasivos", note: "lo que debe", value: `$${fmtMx(BAL.pasivos)}` },
        { term: 4, symbol: "Capital", note: "lo que es de los dueños", value: `$${fmtMx(BAL.capital)}` },
      ],
      resultLabel: "siempre cuadra:",
      result: `$${fmtMx(BAL.pasivos + BAL.capital)} = $${fmtMx(BAL.pasivos + BAL.capital)}`,
      resultSound: "ding",
      mascot: "libro-base",
      mascotFrom: "pensando",
      mascotTo: "guino",
      source: `${SAMPLE} (MXN)`,
    },
  },
  {
    id: "valor-tiempo",
    horizontal: true,
    props: {
      ...base("board", 7),
      heading: "VALOR FUTURO",
      accent: "FUTURO",
      formula: [T("VF"), O("="), T("VP"), O("×"), T("(1 + r)"), T("n", { sup: true })],
      legend: [
        { term: 0, symbol: "VF", note: "lo que tendrás al final", value: "" },
        { term: 2, symbol: "VP", note: "lo que inviertes hoy", value: `$${fmtMx(VT.vp)}` },
        { term: 4, symbol: "r", note: "tasa de interés anual", value: `${fmtMx(VT.r * 100)}%` },
        { term: 5, symbol: "n", note: "número de años", value: `${VT.n}` },
      ],
      resultLabel: `en ${VT.n} años:`,
      result: `VF = $${fmtMx(VT.vp * Math.pow(1 + VT.r, VT.n), 2)}`,
      resultSound: "kaching",
      mascot: "calculadora-base",
      mascotFrom: "pensando",
      mascotTo: "feliz",
      source: `${SAMPLE} (MXN)`,
    },
  },
];

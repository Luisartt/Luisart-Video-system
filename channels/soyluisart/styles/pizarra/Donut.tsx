import { interpolate, useCurrentFrame } from "remotion";
import { z } from "zod";
import { Drop, HandNote, Sfx, Stage, Variant, base, baseSchema, clamp } from "./primitives";
import { MarkerLayer, MarkerStroke, fmtMx, roughEllipse } from "./marker";
import { Breathe, Float, MarkerArrow, MascotSprite, SAMPLE, SourceLabel, ZoneHeading, exprField, fitSize, mascotField, useZone } from "./financeKit";
import { piz } from "./theme";

// Donut chart (portfolio / budget): a marker guide circle is drawn, then the slices grow one after
// another clockwise from 12 o'clock with their legend rows (hand labels + computed %), while the
// centre total counts up. Then the highlighted slice pops out, its legend row gets a marker circle,
// the optional mascot reacts and an arrow brings in the hand note. Percentages and the total are
// computed from `data` (largest-remainder rounding, so the labels always add up to 100 %).

const TONES = {
  accent: piz.color.accent,
  dark: piz.color.accentDark,
  mid: piz.color.tintMid,
  tint: piz.color.tint,
  ink: piz.color.ink,
  grey: piz.color.grey,
  alert: piz.color.alert,
} as const;
type Tone = keyof typeof TONES;

export const donutSchema = baseSchema.extend({
  heading: z.string(),
  accent: z.string(),
  data: z
    .array(z.object({ label: z.string(), value: z.number().positive(), tone: z.enum(Object.keys(TONES) as [Tone, ...Tone[]]).describe("Blue shades / ink / grey; alert = red, only for 'bad'") }))
    .min(2)
    .max(7),
  prefix: z.string(),
  centerLabel: z.string().describe("Hand label under the centre total"),
  highlight: z.number().min(0).max(6).describe("Slice that pops out, gets the circle and the arrow"),
  mascot: mascotField.or(z.literal("")).describe("Optional mascot key ('' = none)"),
  mascotFrom: exprField,
  mascotTo: exprField,
  note: z.string(),
  source: z.string(),
});
type Props = z.infer<typeof donutSchema>;

/** Integer percentages that add up to 100 (largest remainder). */
const roundedPct = (vals: number[]) => {
  const total = vals.reduce((a, b) => a + b, 0);
  const raw = vals.map((v) => (v / total) * 100);
  const out = raw.map(Math.floor);
  let left = 100 - out.reduce((a, b) => a + b, 0);
  raw
    .map((r, i) => ({ i, rem: r - Math.floor(r) }))
    .sort((a, b) => b.rem - a.rem)
    .forEach(({ i }) => {
      if (left > 0) {
        out[i]++;
        left--;
      }
    });
  return out;
};

const pt = (cx: number, cy: number, r: number, deg: number) => [cx + r * Math.cos((deg * Math.PI) / 180), cy + r * Math.sin((deg * Math.PI) / 180)] as const;
const arcPath = (cx: number, cy: number, R: number, r: number, a0: number, a1: number) => {
  const large = a1 - a0 > 180 ? 1 : 0;
  const [x0, y0] = pt(cx, cy, R, a0);
  const [x1, y1] = pt(cx, cy, R, a1);
  const [x2, y2] = pt(cx, cy, r, a1);
  const [x3, y3] = pt(cx, cy, r, a0);
  return `M${x0.toFixed(1)},${y0.toFixed(1)} A${R},${R} 0 ${large} 1 ${x1.toFixed(1)},${y1.toFixed(1)} L${x2.toFixed(1)},${y2.toFixed(1)} A${r},${r} 0 ${large} 0 ${x3.toFixed(1)},${y3.toFixed(1)} Z`;
};

const SLICE = 8; // frames per slice

export const Donut: React.FC<Props> = (p) => {
  const frame = useCurrentFrame();
  const { isVertical, width, height, z: zone } = useZone();
  const n = p.data.length;
  if (p.highlight >= n) throw new Error("Donut: highlight out of range");
  const total = p.data.reduce((a, d) => a + d.value, 0);
  const pcts = roundedPct(p.data.map((d) => d.value));
  const angles: [number, number][] = [];
  let acc = -90;
  p.data.forEach((d) => {
    const sweep = (d.value / total) * 360;
    angles.push([acc, acc + sweep]);
    acc += sweep;
  });

  // ── Layout ──
  const L = isVertical
    ? { headTop: 256, headMax: 72, cx: 322, cy: 566, R: 176, r: 104, leg: { x: 538, y: 382, w: 374, rowH: 62, label: 40, pct: 40, sw: 30 }, centerMax: 46, centerHand: 30, mascot: { x: 124, y: 792, size: 160 }, note: { x: 300, y: 800, w: 620, size: 50 }, source: { x: 300, y: 940, w: 620 } }
    : { headTop: 96, headMax: 80, cx: 490, cy: 452, R: 250, r: 148, leg: { x: 790, y: 230, w: 500, rowH: 74, label: 46, pct: 48, sw: 34 }, centerMax: 60, centerHand: 36, mascot: { x: 1442, y: 196, size: 256 }, note: { x: 1366, y: 566, w: 414, size: 52 }, source: { x: 840, y: 740, w: 900 } };
  const legRows = Math.max(n, 4);
  const legTop = L.leg.y + (6 - legRows) * L.leg.rowH * 0.5; // centred on the donut for fewer rows

  // ── Timing ──
  const headAt = 2;
  const guideAt = 6;
  const mascotAt = 10;
  const s0 = 16;
  const sliceAt = (i: number) => s0 + i * SLICE;
  const totalLand = sliceAt(n - 1) + SLICE;
  const hlAt = totalLand + 10;
  const circleAt = hlAt + 8;
  const arrowAt = circleAt + 12;
  const noteAt = arrowAt + 6;

  // The centre total adds each slice's value as that slice grows (so it always matches the drawing).
  const grow = (i: number) => interpolate(frame, [sliceAt(i), sliceAt(i) + SLICE], [0, 1], { ...clamp, easing: piz.ease.out });
  const shownTotal = p.data.reduce((a, d, i) => a + d.value * grow(i), 0);
  const totalTxt = `${p.prefix}${fmtMx(frame >= totalLand ? total : shownTotal)}`;
  const finalTxt = `${p.prefix}${fmtMx(total)}`;
  const hl = p.highlight;
  const [ha0, ha1] = angles[hl];
  const hMid = (ha0 + ha1) / 2;
  const pop = interpolate(frame, [hlAt, hlAt + 5], [0, 14], { ...clamp, easing: piz.ease.out });
  const hlBad = p.data[hl].tone === "alert";

  const rowY = (i: number) => legTop + i * L.leg.rowH;
  const legCircle = { cx: L.leg.x + L.leg.w / 2 - 8, cy: rowY(hl) + L.leg.rowH / 2, rx: L.leg.w / 2 + 4, ry: L.leg.rowH / 2 + 6 };
  // Vertical: arrow note → the popped slice; horizontal: note → the circled legend row.
  // (the arrow tip goes to the slice edge nearest 6 o'clock, where the note is, from outside the ring)
  const tipAngle = Math.min(Math.max(90, ha0 + 8), ha1 - 8);
  const [sx, sy] = pt(L.cx, L.cy, L.R + 34, tipAngle);
  const arrow = isVertical
    ? { x1: L.note.x + 30, y1: L.note.y - 4, x2: sx, y2: sy, bend: 0.2 }
    : { x1: L.note.x + 10, y1: L.note.y + 4, x2: legCircle.cx + legCircle.rx + 8, y2: legCircle.cy + 10, bend: -0.2 };
  // Legend labels shrink to fit next to the % column.
  const maxLabel = Math.max(...p.data.map((d) => Array.from(d.label).length));
  const labelSize = Math.min(L.leg.label, Math.floor((L.leg.w - L.leg.sw - 28 - L.leg.pct * 2.3) / (maxLabel * 0.4)));

  return (
    <Stage backing={p.backing} safeGuide={p.safeGuide}>
      <ZoneHeading text={p.heading} accent={p.accent} at={headAt} left={zone.x} top={L.headTop} width={zone.w} max={L.headMax} sfx={p.sfx} />
      <MarkerLayer width={width} height={height}>
        <MarkerStroke d={roughEllipse(L.cx, L.cy, L.R + 20, L.R + 20, "dg", 1.02)} at={guideAt} frames={10} color={piz.color.ink} width={5} />
        {p.data.map((d, i) => {
          const at = sliceAt(i);
          if (frame < at) return null;
          const [a0, a1] = angles[i];
          const g = interpolate(frame, [at, at + SLICE], [0, 1], { ...clamp, easing: piz.ease.out });
          const end = a0 + (a1 - a0) * g;
          if (end - a0 < 0.3) return null;
          const off = i === hl ? pop : 0;
          const mid = (a0 + a1) / 2;
          const dx = Math.cos((mid * Math.PI) / 180) * off;
          const dy = Math.sin((mid * Math.PI) / 180) * off;
          return <path key={i} d={arcPath(L.cx, L.cy, L.R, L.r, a0, end)} fill={TONES[d.tone]} stroke={piz.color.ink} strokeWidth={4} strokeLinejoin="round" transform={`translate(${dx.toFixed(1)} ${dy.toFixed(1)})`} />;
        })}
        <MarkerStroke d={roughEllipse(legCircle.cx, legCircle.cy, legCircle.rx, legCircle.ry, "dl")} at={circleAt} frames={12} color={hlBad ? piz.color.alert : piz.color.accentDark} width={7} />
        <MarkerArrow {...arrow} at={arrowAt} seed="da" color={piz.color.ink} width={7} />
      </MarkerLayer>
      {/* centre total */}
      <div style={{ position: "absolute", left: L.cx - L.r, top: L.cy - L.r, width: L.r * 2, height: L.r * 2, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", visibility: frame >= s0 ? "visible" : "hidden" }}>
        <Breathe at={totalLand}>
          <div style={{ font: `800 ${fitSize(finalTxt, L.r * 1.7, L.centerMax, 0.6)}px ${piz.font.heading}`, color: piz.color.ink, letterSpacing: "-0.02em", fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap" }}>{totalTxt}</div>
        </Breathe>
        <div style={{ font: `400 ${L.centerHand}px ${piz.font.hand}`, color: piz.color.handInk, marginTop: 2 }}>{p.centerLabel}</div>
      </div>
      {/* legend */}
      {p.data.map((d, i) => (
        <div key={i} style={{ position: "absolute", left: L.leg.x, top: rowY(i), width: L.leg.w, height: L.leg.rowH }}>
          <Drop at={sliceAt(i)} style={{ display: "flex", alignItems: "center", height: "100%", gap: 14 }}>
            <div style={{ width: L.leg.sw, height: L.leg.sw, flexShrink: 0, background: TONES[d.tone], border: `4px solid ${piz.color.ink}`, boxSizing: "border-box" }} />
            <div style={{ flex: 1, minWidth: 0, font: `400 ${labelSize}px ${piz.font.hand}`, color: piz.color.handInk, whiteSpace: "nowrap", lineHeight: 1 }}>{d.label}</div>
            <div style={{ font: `800 ${L.leg.pct}px ${piz.font.heading}`, color: i === hl ? (hlBad ? piz.color.alert : piz.color.accent) : piz.color.ink, fontVariantNumeric: "tabular-nums", letterSpacing: "-0.01em" }}>{pcts[i]}%</div>
          </Drop>
        </div>
      ))}
      {p.mascot ? (
        <div style={{ position: "absolute", left: L.mascot.x, top: L.mascot.y }}>
          <MascotSprite character={p.mascot} size={L.mascot.size} at={mascotAt} faces={[{ expr: p.mascotFrom, at: 0 }, { expr: p.mascotTo, at: hlAt }]} />
        </div>
      ) : null}
      <div style={{ position: "absolute", left: L.note.x, top: L.note.y, width: L.note.w }}>
        <Float px={4} phase={9}>
          <HandNote text={p.note} at={noteAt} fontSize={L.note.size} align="left" color={hlBad ? piz.color.alert : piz.color.accentDark} style={{ padding: "0 14px" }} />
        </Float>
      </div>
      <SourceLabel text={p.source} left={L.source.x} top={L.source.y} width={L.source.w} align={isVertical ? "right" : "left"} size={24} />
      <Sfx kind="marker" at={guideAt} on={p.sfx} volume={0.3} />
      {p.mascot ? <Sfx kind="pop" at={mascotAt} on={p.sfx} volume={0.2} /> : null}
      {p.data.map((_, i) => (
        <Sfx key={i} kind={i % 2 ? "tap" : "click"} at={sliceAt(i)} on={p.sfx} volume={0.22} />
      ))}
      <Sfx kind="bleep" at={totalLand} on={p.sfx} volume={0.26} />
      <Sfx kind={hlBad ? "thud" : "ding"} at={hlAt} on={p.sfx} />
      <Sfx kind="marker" at={circleAt} on={p.sfx} />
      <Sfx kind="marker" at={arrowAt} on={p.sfx} volume={0.32} />
    </Stage>
  );
};

export const donutVariants: Variant<Props>[] = [
  {
    id: "portafolio",
    horizontal: true,
    props: {
      ...base("board", 6),
      heading: "TU PORTAFOLIO",
      accent: "PORTAFOLIO",
      data: [
        { label: "Acciones México", value: 35000, tone: "accent" },
        { label: "Acciones globales", value: 25000, tone: "dark" },
        { label: "Bonos", value: 30000, tone: "mid" },
        { label: "Efectivo", value: 10000, tone: "tint" },
      ],
      prefix: "$",
      centerLabel: "invertidos",
      highlight: 2,
      mascot: "canasta-base",
      mascotFrom: "pensando",
      mascotTo: "feliz",
      note: "bonos: menos riesgo y menos rendimiento",
      source: `${SAMPLE} (MXN)`,
    },
  },
  {
    id: "presupuesto",
    horizontal: true,
    props: {
      ...base("board", 6),
      heading: "TU SUELDO AL MES",
      accent: "SUELDO",
      data: [
        { label: "Vivienda", value: 6000, tone: "dark" },
        { label: "Comida", value: 4000, tone: "accent" },
        { label: "Transporte", value: 2000, tone: "mid" },
        { label: "Deudas", value: 3000, tone: "alert" },
        { label: "Gustos", value: 3000, tone: "tint" },
        { label: "Ahorro", value: 2000, tone: "ink" },
      ],
      prefix: "$",
      centerLabel: "al mes",
      highlight: 3,
      mascot: "pastel-base",
      mascotFrom: "pensando",
      mascotTo: "sorpresa",
      note: "las deudas se comen tu ahorro",
      source: `${SAMPLE} (MXN)`,
    },
  },
];

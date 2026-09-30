import { interpolate, useCurrentFrame } from "remotion";
import { z } from "zod";
import { Drop, HandNote, Sfx, Stage, Variant, base, baseSchema, clamp } from "./primitives";
import { MarkerLayer, MarkerStroke, fmtMx, roughLine } from "./marker";
import { Breathe, Float, MarkerArrow, MascotSprite, SAMPLE, SourceLabel, ZoneHeading, fitSize, mascotField, useZone } from "./financeKit";
import { piz } from "./theme";

// Compound-interest snowball: the coin mascot rolls in, then one stacked bar per year grows —
// capital (what you put in, light blue) under interest (blue) — while the big MXN figure counts
// the balance year by year; the final total lands with a ka-ching, the legend shows the computed
// totals and a curved marker arrow runs from the first bar to the last. Every number is computed
// from `principal`, `contribution`, `rate` and `years` (contributions at the end of each year).

export const snowballSchema = baseSchema.extend({
  heading: z.string(),
  accent: z.string(),
  principal: z.number().min(0).describe("Money at the start (MXN)"),
  contribution: z.number().min(0).describe("Added at the end of every year (MXN)"),
  rate: z.number().min(0).max(1).describe("Annual rate, e.g. 0.1 = 10 %"),
  years: z.number().int().min(3).max(15),
  subtitle: z.string().describe("Hand line under the figure (assumptions)"),
  capitalLabel: z.string(),
  interestLabel: z.string(),
  mascot: mascotField,
  note: z.string(),
  source: z.string(),
});
type Props = z.infer<typeof snowballSchema>;

export const snowballSeries = (principal: number, contribution: number, rate: number, years: number) => {
  const out: { year: number; balance: number; capital: number; interest: number }[] = [];
  let b = principal;
  for (let t = 1; t <= years; t++) {
    b = b * (1 + rate) + contribution;
    const capital = principal + contribution * t;
    out.push({ year: t, balance: b, capital, interest: b - capital });
  }
  return out;
};

const STEP = 5;

export const Snowball: React.FC<Props> = (p) => {
  const frame = useCurrentFrame();
  const { isVertical, width, height, z: zone } = useZone();
  const V = isVertical;
  if (p.principal + p.contribution <= 0) throw new Error("Snowball: principal or contribution must be > 0");
  const s = snowballSeries(p.principal, p.contribution, p.rate, p.years);
  const last = s[s.length - 1];
  const n = s.length;

  // ── Layout ──
  const L = V
    ? { x0: 214, x1: 900, y0: 566, y1: 800, headTop: 256, num: { x: 120, y: 328, w: 800, size: 92, align: "center" as const }, sub: 32, coin: { x: 780, y: 842, size: 139 }, leg: { x: 214, y: 476, size: 30 }, yearSize: 26, note: { x: 128, y: 852, w: 640, size: 42 }, source: { x: 128, y: 944, w: 640 } }
    : { x0: 250, x1: 1190, y0: 250, y1: 680, headTop: 96, num: { x: 1250, y: 226, w: 530, size: 124, align: "left" as const }, sub: 38, coin: { x: 262, y: 248, size: 139 }, leg: { x: 1250, y: 420, size: 36 }, yearSize: 28, note: { x: 1250, y: 560, w: 530, size: 50 }, source: { x: 1250, y: 748, w: 530 } };
  const slot = (L.x1 - L.x0) / n;
  const bw = Math.min(64, slot * 0.62);
  const bx = (i: number) => L.x0 + slot * (i + 0.5);
  const hOf = (v: number) => (v / last.balance) * (L.y1 - L.y0 - 10);

  // ── Timing ──
  const headAt = 2;
  const axisAt = 8;
  const coinAt = 6;
  const coinLand = coinAt + 16;
  const barAt = (i: number) => 26 + i * STEP;
  const lastLand = barAt(n - 1) + 5;
  const finalAt = lastLand + 2;
  const arrowAt = finalAt + 10;
  const noteAt = arrowAt + 8;

  // Counter follows the bars: the balance of the bar being drawn.
  const k = Math.min(n - 1, Math.max(0, Math.floor((frame - barAt(0)) / STEP)));
  const g = interpolate(frame, [barAt(k), barAt(k) + 5], [0, 1], { ...clamp, easing: piz.ease.out });
  const prev = k === 0 ? p.principal : s[k - 1].balance;
  const shown = frame < barAt(0) ? p.principal : frame >= finalAt ? last.balance : prev + (s[k].balance - prev) * g;
  const finalTxt = `$${fmtMx(last.balance)}`;
  const numSize = fitSize(`${finalTxt} MX`, L.num.w, L.num.size, 0.6);

  // Coin rolls in from the left: two full turns, ending upright (crisp at rest).
  const roll = interpolate(frame, [coinAt, coinLand], [0, 1], { ...clamp, easing: piz.ease.out });
  const coinX = Math.round((1 - roll) * (zone.x - L.coin.x)); // starts at the zone's left edge
  const coinRot = roll < 1 ? 720 * roll : 0;

  const top0 = L.y1 - hOf(s[0].balance);
  const topN = L.y1 - hOf(last.balance);
  // Both ends sit above their bar, so for growing balances the arrow clears the bars in between.
  const arrow = { x1: bx(0), y1: top0 - 22, x2: bx(n - 1) - bw * 0.3, y2: topN - 18, bend: -0.12 };

  return (
    <Stage backing={p.backing} safeGuide={p.safeGuide}>
      <ZoneHeading text={p.heading} accent={p.accent} at={headAt} left={zone.x} top={L.headTop} width={zone.w} max={V ? 70 : 80} sfx={p.sfx} />
      {/* big figure: balance counting with the bars */}
      <div style={{ position: "absolute", left: L.num.x, top: L.num.y, width: L.num.w, textAlign: L.num.align }}>
        <Breathe at={finalAt} style={{ transformOrigin: L.num.align === "center" ? "50% 50%" : "0% 50%", display: "inline-block" }}>
          <span style={{ font: `800 ${numSize}px ${piz.font.heading}`, color: piz.color.accent, letterSpacing: "-0.02em", fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap" }}>${fmtMx(shown)}</span>
          <span style={{ font: `400 ${Math.round(numSize * 0.42)}px ${piz.font.hand}`, color: piz.color.handInk, marginLeft: 12 }}>MXN</span>
        </Breathe>
        <div style={{ font: `400 ${L.sub}px ${piz.font.hand}`, color: piz.color.handInk, marginTop: 2, lineHeight: 1.05 }}>{p.subtitle}</div>
      </div>
      <MarkerLayer width={width} height={height}>
        <MarkerStroke d={roughLine(L.x0 - 10, L.y1, L.x1, L.y1, "sx", 0.004)} at={axisAt} frames={10} color={piz.color.ink} width={6} />
        {s.map((d, i) => {
          if (frame < barAt(i)) return null;
          const gi = interpolate(frame, [barAt(i), barAt(i) + 5], [0, 1], { ...clamp, easing: piz.ease.out });
          const hc = hOf(d.capital) * gi;
          const hi = hOf(Math.max(0, d.interest)) * gi;
          const x = bx(i) - bw / 2;
          return (
            <g key={i}>
              <rect x={x} y={L.y1 - hc} width={bw} height={hc} fill={piz.color.tintMid} stroke={piz.color.ink} strokeWidth={4} />
              {hi > 0.5 ? <rect x={x} y={L.y1 - hc - hi} width={bw} height={hi} fill={piz.color.accent} stroke={piz.color.ink} strokeWidth={4} /> : null}
            </g>
          );
        })}
        <MarkerArrow {...arrow} at={arrowAt} seed="sb" color={piz.color.ink} width={7} />
      </MarkerLayer>
      {/* years */}
      {s.map((d, i) => (
        <div key={i} style={{ position: "absolute", left: bx(i) - 40, width: 80, top: L.y1 + 8, textAlign: "center", font: `700 ${L.yearSize}px ${piz.font.label}`, color: piz.color.muted, visibility: frame >= barAt(i) ? "visible" : "hidden" }}>
          {d.year}
        </div>
      ))}
      <div style={{ position: "absolute", left: L.x0 - 110, width: 90, top: L.y1 + 4, textAlign: "right", font: `400 ${L.yearSize + 6}px ${piz.font.hand}`, color: piz.color.handInk, visibility: frame >= axisAt + 4 ? "visible" : "hidden" }}>año</div>
      {/* legend with the computed totals */}
      <div style={{ position: "absolute", left: L.leg.x, top: L.leg.y, display: "flex", flexDirection: "column", gap: 8 }}>
        {[
          { tone: piz.color.tintMid, label: p.capitalLabel, v: last.capital },
          { tone: piz.color.accent, label: p.interestLabel, v: last.interest },
        ].map((r, i) => (
          <Drop key={i} at={barAt(0) + i * 4} style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 28, height: 28, background: r.tone, border: `4px solid ${piz.color.ink}`, boxSizing: "border-box" }} />
            <div style={{ font: `400 ${L.leg.size}px ${piz.font.hand}`, color: piz.color.handInk, whiteSpace: "nowrap" }}>{r.label}</div>
            <div style={{ font: `800 ${L.leg.size - 2}px ${piz.font.heading}`, color: i ? piz.color.accent : piz.color.ink, visibility: frame >= finalAt ? "visible" : "hidden", fontVariantNumeric: "tabular-nums" }}>${fmtMx(r.v)}</div>
          </Drop>
        ))}
      </div>
      {/* the coin rolls in */}
      <div style={{ position: "absolute", left: L.coin.x, top: L.coin.y, transform: `translateX(${coinX}px) rotate(${coinRot.toFixed(1)}deg)`, visibility: frame >= coinAt ? "visible" : "hidden" }}>
        <MascotSprite character={p.mascot} size={L.coin.size} at={coinAt} faces={[{ expr: "sorpresa", at: 0 }, { expr: "feliz", at: finalAt }]} />
      </div>
      <div style={{ position: "absolute", left: L.note.x, top: L.note.y, width: L.note.w }}>
        <Float px={4} phase={17}>
          <HandNote text={p.note} at={noteAt} fontSize={L.note.size} align={V ? "center" : "left"} color={piz.color.accentDark} style={{ padding: "0 14px" }} />
        </Float>
      </div>
      <SourceLabel text={p.source} left={L.source.x} top={L.source.y} width={L.source.w} align={V ? "center" : "left"} size={24} />
      <Sfx kind="marker" at={axisAt} on={p.sfx} volume={0.28} />
      <Sfx kind="coin" at={coinLand} on={p.sfx} />
      <Sfx kind="countMoney" at={barAt(0)} frames={lastLand - barAt(0)} on={p.sfx} />
      <Sfx kind="kaching" at={finalAt} on={p.sfx} />
      <Sfx kind="marker" at={arrowAt} on={p.sfx} volume={0.34} />
    </Stage>
  );
};

const IC = { principal: 10000, contribution: 0, rate: 0.1, years: 10 };
const AH = { principal: 0, contribution: 12000, rate: 0.08, years: 10 };
const ahLast = snowballSeries(AH.principal, AH.contribution, AH.rate, AH.years).slice(-1)[0];

export const snowballVariants: Variant<Props>[] = [
  {
    id: "interes-compuesto",
    horizontal: true,
    props: {
      ...base("board", 6),
      heading: "INTERÉS COMPUESTO",
      accent: "COMPUESTO",
      ...IC,
      subtitle: `$${fmtMx(IC.principal)} al ${fmtMx(IC.rate * 100)}% anual · ${IC.years} años`,
      capitalLabel: "lo que pusiste",
      interestLabel: "intereses",
      mascot: "f03-moneda",
      note: "los intereses también generan intereses",
      source: SAMPLE,
    },
  },
  {
    id: "ahorro",
    horizontal: true,
    props: {
      ...base("board", 6),
      heading: "AHORRO CONSTANTE",
      accent: "CONSTANTE",
      ...AH,
      subtitle: `$${fmtMx(AH.contribution)} al año · ${fmtMx(AH.rate * 100)}% anual · ${AH.years} años`,
      capitalLabel: "lo que ahorraste",
      interestLabel: "intereses",
      mascot: "f03-moneda",
      note: `tú pusiste $${fmtMx(ahLast.capital)}; el interés, el resto`,
      source: `${SAMPLE} · aporte a fin de año`,
    },
  },
];

import { interpolate, random, useCurrentFrame } from "remotion";
import { z } from "zod";
import { HandNote, Sfx, Stage, Variant, base, baseSchema, clamp } from "./primitives";
import { MarkerLayer, MarkerStroke, fmtMx, roughEllipse, roughLine } from "./marker";
import { Breathe, Float, MarkerArrow, MascotSprite, SAMPLE, SourceLabel, ZoneHeading, exprField, mascotField, niceStep, useZone } from "./financeKit";
import { piz } from "./theme";

// Hand-drawn candlestick chart (stock exchange): marker axes draw on, then the candles appear one by
// one from `data` (wick drawn on, body growing from open to close) — up candles blue, down candles
// red (a falling day is the "bad" colour). The change from the first open to the last close is
// computed and lands as a big figure (+ding up / thud down) while the mascot (toro / oso) swaps face;
// then a marker circle on the target candle and an arrow from the hand note. Everything is scaled
// from the data, so the drawing always matches it.

const candle = z.object({ o: z.number(), h: z.number(), l: z.number(), c: z.number() });

export const candlesSchema = baseSchema.extend({
  heading: z.string(),
  accent: z.string().describe("Words of the heading drawn in colour"),
  accentTone: z.enum(["accent", "alert"]).describe("Colour of the accent words (alert = red, only for 'bad')"),
  data: z.array(candle).min(4).max(16).describe("Candles in order: open, high, low, close"),
  prefix: z.string().describe("Currency prefix for prices, e.g. US$ or $"),
  target: z.enum(["last", "maxDrop", "maxRise"]).describe("Candle the circle and arrow point at"),
  mascot: mascotField,
  mascotFrom: exprField,
  mascotTo: exprField.describe("Face after the change figure lands"),
  note: z.string(),
  period: z.string().describe("Label under the time axis, e.g. 'últimos 12 días'"),
  source: z.string(),
});
type Props = z.infer<typeof candlesSchema>;

const STEP = 5; // frames between candles

export const Candles: React.FC<Props> = (p) => {
  const frame = useCurrentFrame();
  const { isVertical, width, height, z: zone } = useZone();
  const n = p.data.length;
  p.data.forEach((d, i) => {
    if (d.h < Math.max(d.o, d.c) || d.l > Math.min(d.o, d.c)) throw new Error(`Candles: candle ${i} has high/low outside open/close`);
  });

  // ── Layout (drawn inside the graphics zone) ──
  const L = isVertical
    ? { x0: 232, x1: 878, y0: 372, y1: 760, tickX: 120, tickW: 96, headTop: 256, headMax: 76, periodTop: 768, periodSize: 34, mascot: { x: 124, y: 802, size: 160 }, note: { x: 300, y: 806, w: 620, size: 50 }, source: { x: 300, y: 940, w: 620 } }
    : { x0: 270, x1: 1320, y0: 215, y1: 690, tickX: 140, tickW: 118, headTop: 96, headMax: 84, periodTop: 700, periodSize: 36, mascot: { x: 1447, y: 196, size: 256 }, note: { x: 1370, y: 482, w: 410, size: 54 }, source: { x: 270, y: 716, w: 700 } };

  // ── Scales from the data ──
  const lo = Math.min(...p.data.map((d) => d.l));
  const hi = Math.max(...p.data.map((d) => d.h));
  const pad = (hi - lo) * 0.08;
  const step = niceStep(hi - lo + 2 * pad, 4);
  const amin = lo - pad;
  const amax = hi + pad;
  const py = (v: number) => L.y1 - ((v - amin) / (amax - amin)) * (L.y1 - L.y0);
  const slot = (L.x1 - L.x0) / n;
  const bw = Math.min(46, slot * 0.56);
  const cx = (i: number) => L.x0 + slot * (i + 0.5);
  const tickDec = Number.isInteger(step) ? 0 : step < 1 ? 2 : 1;
  const ticks: number[] = [];
  for (let v = Math.ceil(amin / step) * step; v <= amax + 1e-9; v += step) ticks.push(v);

  const first = p.data[0];
  const last = p.data[n - 1];
  const change = ((last.c - first.o) / first.o) * 100;
  const up = change >= 0;
  const changeTxt = `${up ? "+" : "−"}${fmtMx(Math.abs(change), 0)}%`;
  const tone = up ? piz.color.accent : piz.color.alert;

  const targetIdx =
    p.target === "last"
      ? n - 1
      : p.data.reduce((best, d, i) => {
          const move = p.target === "maxDrop" ? d.o - d.c : d.c - d.o;
          const bestMove = p.target === "maxDrop" ? p.data[best].o - p.data[best].c : p.data[best].c - p.data[best].o;
          return move > bestMove ? i : best;
        }, 0);

  // ── Timing (frames) ──
  const headAt = 2;
  const axisAt = 6;
  const mascotAt = 10;
  const c0 = 16;
  const landOf = (i: number) => c0 + i * STEP + 4;
  const T = landOf(n - 1) + 6; // change figure + mascot reaction
  const circleAt = T + 9;
  const arrowAt = T + 18;
  const noteAt = arrowAt + 8;

  // Change figure sits in the empty corner: top-left in an uptrend, bottom-left in a downtrend.
  const badge = { x: L.x0 + 20, y: up ? L.y0 + 8 : L.y1 - (isVertical ? 150 : 170) };
  const t = p.data[targetIdx];
  const tc = { x: cx(targetIdx), y: (py(t.h) + py(t.l)) / 2 };
  const rx = bw / 2 + 26;
  const ry = (py(t.l) - py(t.h)) / 2 + 26;
  const arrow = isVertical
    ? { x1: Math.max(340, Math.min(860, up ? tc.x - 120 : tc.x + 70)), y1: L.note.y - 6, x2: tc.x, y2: tc.y + ry + 12 }
    : { x1: L.note.x + 4, y1: L.note.y + 40, x2: tc.x + rx + 12, y2: tc.y };

  return (
    <Stage backing={p.backing} safeGuide={p.safeGuide}>
      <ZoneHeading text={p.heading} accent={p.accent} accentColor={p.accentTone === "alert" ? piz.color.alert : piz.color.accent} at={headAt} left={zone.x} top={L.headTop} width={zone.w} max={L.headMax} sfx={p.sfx} />
      {/* price ticks */}
      {ticks.map((v, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: L.tickX,
            width: L.tickW,
            top: py(v) - 16,
            textAlign: "right",
            font: `700 ${isVertical ? 26 : 28}px ${piz.font.label}`,
            color: piz.color.muted,
            visibility: frame >= axisAt + 4 ? "visible" : "hidden",
          }}
        >
          {i === ticks.length - 1 ? `${p.prefix}${fmtMx(v, tickDec)}` : fmtMx(v, tickDec)}
        </div>
      ))}
      <MarkerLayer width={width} height={height}>
        <MarkerStroke d={roughLine(L.x0 - 8, L.y1, L.x1, L.y1, "cx", 0.004)} at={axisAt} frames={10} color={piz.color.ink} width={6} />
        <MarkerStroke d={roughLine(L.x0 - 8, L.y1, L.x0 - 4, L.y0 - 12, "cy", 0.01)} at={axisAt + 3} frames={8} color={piz.color.ink} width={6} />
        {p.data.map((d, i) => {
          const at = c0 + i * STEP;
          if (frame < at) return null;
          const x = cx(i);
          const upC = d.c >= d.o;
          const g = interpolate(frame, [at + 1, at + 4], [0, 1], { ...clamp, easing: piz.ease.out });
          const yo = py(d.o);
          const yc = yo + (py(d.c) - yo) * g;
          let top = Math.min(yo, yc);
          let bot = Math.max(yo, yc);
          if (bot - top < 6) {
            const m = (top + bot) / 2;
            top = m - 3;
            bot = m + 3;
          }
          const j = (k: string) => (random(`cd${i}${k}`) - 0.5) * 3;
          const body = `M${(x - bw / 2 + j("a")).toFixed(1)},${top.toFixed(1)} L${(x + bw / 2).toFixed(1)},${(top + j("b")).toFixed(1)} L${(x + bw / 2 + j("c")).toFixed(1)},${bot.toFixed(1)} L${(x - bw / 2).toFixed(1)},${(bot + j("d")).toFixed(1)} Z`;
          return (
            <g key={i}>
              <MarkerStroke d={roughLine(x, py(d.h), x, py(d.l), `w${i}`, 0.02)} at={at} frames={4} color={piz.color.ink} width={5} />
              <path d={body} fill={upC ? piz.color.accent : piz.color.alert} stroke={piz.color.ink} strokeWidth={4} strokeLinejoin="round" />
            </g>
          );
        })}
        <MarkerStroke d={roughEllipse(tc.x, tc.y, rx, ry, "tgt")} at={circleAt} frames={12} color={up ? piz.color.accentDark : piz.color.alert} width={8} />
        <MarkerArrow {...arrow} at={arrowAt} seed="carrow" bend={0.16} color={piz.color.ink} width={7} />
      </MarkerLayer>
      {/* change figure: computed from first open → last close */}
      <div style={{ position: "absolute", left: badge.x, top: badge.y, visibility: frame >= T ? "visible" : "hidden" }}>
        <Breathe at={T} style={{ transformOrigin: "0% 50%" }}>
          <div style={{ font: `800 ${isVertical ? 96 : 104}px ${piz.font.heading}`, color: tone, lineHeight: 1, letterSpacing: "-0.02em", whiteSpace: "nowrap" }}>{changeTxt}</div>
        </Breathe>
        <HandNote
          text={`de ${p.prefix}${fmtMx(first.o)} a ${p.prefix}${fmtMx(last.c)}`}
          at={T + 3}
          fontSize={isVertical ? 38 : 42}
          align="left"
          style={{ whiteSpace: "nowrap", padding: "0 14px 0 2px" }}
        />
      </div>
      <div style={{ position: "absolute", left: L.x1 - 420, width: 420, top: L.periodTop, textAlign: "right", font: `400 ${L.periodSize}px ${piz.font.hand}`, color: piz.color.handInk, visibility: frame >= axisAt + 6 ? "visible" : "hidden" }}>
        {p.period}
      </div>
      <div style={{ position: "absolute", left: L.mascot.x, top: L.mascot.y }}>
        <MascotSprite character={p.mascot} size={L.mascot.size} at={mascotAt} faces={[{ expr: p.mascotFrom, at: 0 }, { expr: p.mascotTo, at: T }]} />
      </div>
      <div style={{ position: "absolute", left: L.note.x, top: L.note.y, width: L.note.w }}>
        <Float px={4} phase={7}>
          <HandNote text={p.note} at={noteAt} fontSize={L.note.size} align="left" color={up ? piz.color.accentDark : piz.color.alert} style={{ padding: "0 14px" }} />
        </Float>
      </div>
      <SourceLabel text={p.source} left={L.source.x} top={L.source.y} width={L.source.w} align={isVertical ? "right" : "left"} size={24} />
      <Sfx kind="marker" at={axisAt} on={p.sfx} volume={0.3} />
      <Sfx kind="pop" at={mascotAt} on={p.sfx} volume={0.22} />
      <Sfx kind="markerWrite" at={c0} frames={n * STEP} on={p.sfx} volume={0.22} />
      <Sfx kind={up ? "ding" : "thud"} at={T} on={p.sfx} />
      <Sfx kind="marker" at={circleAt} on={p.sfx} />
      <Sfx kind="marker" at={arrowAt} on={p.sfx} volume={0.32} />
    </Stage>
  );
};

// Sample data (fictional share, US$): an uptrend with higher highs, and a crash of about −35 %.
const ALCISTA = [
  { o: 100, h: 104, l: 98, c: 103 },
  { o: 103, h: 106, l: 101, c: 102 },
  { o: 102, h: 108, l: 101, c: 107 },
  { o: 107, h: 110, l: 105, c: 109 },
  { o: 109, h: 111, l: 104, c: 105 },
  { o: 105, h: 112, l: 104, c: 111 },
  { o: 111, h: 116, l: 110, c: 115 },
  { o: 115, h: 117, l: 112, c: 113 },
  { o: 113, h: 120, l: 112, c: 119 },
  { o: 119, h: 123, l: 117, c: 122 },
  { o: 122, h: 124, l: 118, c: 120 },
  { o: 120, h: 129, l: 119, c: 128 },
];
const CRASH = [
  { o: 150, h: 153, l: 148, c: 152 },
  { o: 152, h: 155, l: 150, c: 154 },
  { o: 154, h: 156, l: 151, c: 152 },
  { o: 152, h: 154, l: 147, c: 148 },
  { o: 148, h: 150, l: 140, c: 141 },
  { o: 141, h: 143, l: 128, c: 130 },
  { o: 130, h: 133, l: 112, c: 115 },
  { o: 115, h: 122, l: 110, c: 120 },
  { o: 120, h: 121, l: 104, c: 106 },
  { o: 106, h: 109, l: 95, c: 98 },
  { o: 98, h: 103, l: 96, c: 101 },
  { o: 101, h: 102, l: 94, c: 97 },
];

export const candlesVariants: Variant<Props>[] = [
  {
    id: "alcista",
    horizontal: true,
    props: {
      ...base("board", 6),
      heading: "MERCADO ALCISTA",
      accent: "ALCISTA",
      accentTone: "accent",
      data: ALCISTA,
      prefix: "US$",
      target: "last",
      mascot: "f08-toro",
      mascotFrom: "pensando",
      mascotTo: "feliz",
      note: "cada máximo, más alto que el anterior",
      period: "12 días",
      source: `${SAMPLE} · acción ficticia (US$)`,
    },
  },
  {
    id: "crash",
    horizontal: true,
    props: {
      ...base("board", 6),
      heading: "ASÍ SE VE UN CRASH",
      accent: "CRASH",
      accentTone: "alert",
      data: CRASH,
      prefix: "US$",
      target: "maxDrop",
      mascot: "f09-oso",
      mascotFrom: "pensando",
      mascotTo: "sorpresa",
      note: "el peor día: pánico y ventas",
      period: "12 días",
      source: `${SAMPLE} · acción ficticia (US$)`,
    },
  },
];

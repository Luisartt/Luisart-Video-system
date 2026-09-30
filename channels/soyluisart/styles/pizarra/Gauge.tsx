import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { z } from "zod";
import { HandNote, Sfx, Stage, TypeOn, Variant, base, baseSchema, clamp } from "./primitives";
import { MarkerLayer, MarkerStroke, fmtMx, roughLine } from "./marker";
import { Breathe, Float, MarkerArrow, MascotSprite, SAMPLE, SourceLabel, ZoneHeading, exprField, fitSize, mascotField, useZone } from "./financeKit";
import { upperKeepName } from "../shared/text";
import { piz } from "./theme";

// Dial gauge (inflation, risk): a half-ring of coloured zones lands segment by segment with its
// marker ticks, then the needle swings to `value` with a spring (overshoots and settles) while the
// big figure counts up in Mexican format. When it settles the zone it landed in is stamped as the
// verdict word, the mascot reacts and an arrow brings the hand note to that zone.

const TONES = { tint: piz.color.tint, mid: piz.color.tintMid, accent: piz.color.accent, dark: piz.color.accentDark, alert: piz.color.alert } as const;
type Tone = keyof typeof TONES;
const onDark = (t: Tone) => t === "accent" || t === "dark" || t === "alert";

export const gaugeSchema = baseSchema.extend({
  heading: z.string(),
  accent: z.string(),
  min: z.number(),
  max: z.number(),
  value: z.number(),
  decimals: z.number().min(0).max(2),
  suffix: z.string().describe("After the big figure, e.g. % or ' de 10'"),
  zones: z
    .array(z.object({ to: z.number().describe("Upper bound of the zone"), label: z.string(), tone: z.enum(Object.keys(TONES) as [Tone, ...Tone[]]).describe("alert = red, only for 'bad'") }))
    .min(2)
    .max(5),
  caption: z.string().describe("Hand label under the big figure"),
  mascot: mascotField.or(z.literal("")),
  mascotFrom: exprField,
  mascotTo: exprField,
  note: z.string(),
  source: z.string(),
});
type Props = z.infer<typeof gaugeSchema>;

const pt = (cx: number, cy: number, r: number, deg: number) => [cx + r * Math.cos((deg * Math.PI) / 180), cy + r * Math.sin((deg * Math.PI) / 180)] as const;
const band = (cx: number, cy: number, R: number, r: number, a0: number, a1: number) => {
  const [x0, y0] = pt(cx, cy, R, a0);
  const [x1, y1] = pt(cx, cy, R, a1);
  const [x2, y2] = pt(cx, cy, r, a1);
  const [x3, y3] = pt(cx, cy, r, a0);
  const large = a1 - a0 > 180 ? 1 : 0;
  return `M${x0.toFixed(1)},${y0.toFixed(1)} A${R},${R} 0 ${large} 1 ${x1.toFixed(1)},${y1.toFixed(1)} L${x2.toFixed(1)},${y2.toFixed(1)} A${r},${r} 0 ${large} 0 ${x3.toFixed(1)},${y3.toFixed(1)} Z`;
};

export const Gauge: React.FC<Props> = (p) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { isVertical, width, height, z: zone } = useZone();
  if (!(p.max > p.min) || p.zones[p.zones.length - 1].to !== p.max) throw new Error("Gauge: zones must end at max and max > min");
  const tOf = (v: number) => Math.min(1, Math.max(0, (v - p.min) / (p.max - p.min)));
  const angOf = (v: number) => 180 + 180 * tOf(v); // 180° = left (min), 270° = top, 360° = right (max)
  const bounds = [p.min, ...p.zones.map((zz) => zz.to)];
  const zoneIdx = Math.max(0, p.zones.findIndex((zz, i) => p.value < zz.to || i === p.zones.length - 1));
  const verdict = p.zones[zoneIdx];

  // ── Layout ──
  const L = isVertical
    ? { headTop: 256, headMax: 72, cx: 520, cy: 652, R: 272, r: 190, tickR: 302, tick: 30, label: 28, num: { x: 310, y: 684, w: 600, size: 104, align: "center" as const }, cap: 34, verdict: 50, mascot: { x: 124, y: 700, size: 160 }, note: { x: 300, y: 862, w: 620, size: 44 }, source: { x: 120, y: 940, w: 280 } }
    : { headTop: 96, headMax: 80, cx: 600, cy: 612, R: 350, r: 252, tickR: 386, tick: 32, label: 30, num: { x: 1040, y: 250, w: 460, size: 150, align: "left" as const }, cap: 40, verdict: 64, mascot: { x: 1508, y: 222, size: 256 }, note: { x: 1040, y: 596, w: 700, size: 54 }, source: { x: 140, y: 720, w: 400 } };

  // ── Timing ──
  const headAt = 2;
  const zoneAt = (i: number) => 8 + i * 6;
  const mascotAt = 12;
  const swingAt = zoneAt(p.zones.length - 1) + 12;
  const settleAt = swingAt + 30;
  const verdictAt = settleAt + 6;
  const arrowAt = verdictAt + 14;
  const noteAt = arrowAt + 6;

  const s = spring({ frame: frame - swingAt, fps, config: { damping: 7, stiffness: 90, mass: 0.9 } });
  const needleAng = Math.min(362, Math.max(178, 180 + (angOf(p.value) - 180) * s));
  const count = interpolate(frame, [swingAt, settleAt], [p.min, p.value], { ...clamp, easing: piz.ease.out });
  const numTxt = `${fmtMx(frame >= settleAt ? p.value : count, p.decimals)}${p.suffix}`;
  const numSize = fitSize(`${fmtMx(p.value, p.decimals)}${p.suffix}`, L.num.w, L.num.size, 0.6);
  const bad = verdict.tone === "alert";
  const vColor = bad ? piz.color.alert : piz.color.accent;

  const [tipX, tipY] = pt(L.cx, L.cy, L.r - 24, needleAng);
  const perp = needleAng + 90;
  const [b1x, b1y] = pt(L.cx, L.cy, 12, perp);
  const [b2x, b2y] = pt(L.cx, L.cy, -12, perp);
  const [tailX, tailY] = pt(L.cx, L.cy, -30, needleAng);
  const needle = `M${b1x.toFixed(1)},${b1y.toFixed(1)} L${tipX.toFixed(1)},${tipY.toFixed(1)} L${b2x.toFixed(1)},${b2y.toFixed(1)} L${tailX.toFixed(1)},${tailY.toFixed(1)} Z`;

  const vMid = (angOf(bounds[zoneIdx]) + angOf(bounds[zoneIdx + 1])) / 2;
  // Arrow tip: outside the ring, on the verdict zone, at the angle nearest the right side (where the note is).
  const za0 = angOf(bounds[zoneIdx]);
  const za1 = angOf(bounds[zoneIdx + 1]);
  const tipAng = Math.min(za1 - 14, Math.max(za0 + 14, 345)); // clear of the tick numbers
  const [ax, ay] = pt(L.cx, L.cy, L.R + 26, tipAng);
  // Vertical: the note sits under the figure, so the arrow only goes to the ring when the verdict zone
  // reaches the right side (else it would cross the dial) — otherwise it points at the verdict word.
  const ringReachable = za1 - 14 >= 320;
  const arrow = isVertical
    ? ringReachable
      ? { x1: L.note.x + L.note.w - 50, y1: L.note.y - 6, x2: ax, y2: ay, bend: 0.3 }
      : (() => {
          // right end of the "caption VERDICT" row (centred), estimated from the glyph widths
          const rowW = Array.from(p.caption).length * 0.38 * L.cap + 18 + Array.from(verdict.label).length * 0.64 * L.verdict;
          const endX = Math.min(880, L.num.x + L.num.w / 2 + rowW / 2 + 12);
          return { x1: 900, y1: L.note.y + 6, x2: endX, y2: L.num.y + numSize + 8 + L.verdict * 0.5, bend: 0.5 };
        })()
    : { x1: L.note.x - 10, y1: L.note.y + 24, x2: ax + 6, y2: ay, bend: 0.2 };

  return (
    <Stage backing={p.backing} safeGuide={p.safeGuide}>
      <ZoneHeading text={p.heading} accent={p.accent} at={headAt} left={zone.x} top={L.headTop} width={zone.w} max={L.headMax} sfx={p.sfx} />
      <MarkerLayer width={width} height={height}>
        {p.zones.map((zz, i) => {
          if (frame < zoneAt(i)) return null;
          const a0 = angOf(bounds[i]);
          const a1 = angOf(zz.to);
          const g = interpolate(frame, [zoneAt(i), zoneAt(i) + 5], [0, 1], { ...clamp, easing: piz.ease.out });
          return <path key={i} d={band(L.cx, L.cy, L.R, L.r, a0, a0 + (a1 - a0) * g)} fill={TONES[zz.tone]} stroke={piz.color.ink} strokeWidth={4} strokeLinejoin="round" />;
        })}
        {bounds.map((b, i) => {
          const a = angOf(b);
          const [x0, y0] = pt(L.cx, L.cy, L.R + 4, a);
          const [x1, y1] = pt(L.cx, L.cy, L.R + 20, a);
          return <MarkerStroke key={i} d={roughLine(x0, y0, x1, y1, `gt${i}`, 0.02)} at={zoneAt(Math.max(0, i - 1)) + 3} frames={4} color={piz.color.ink} width={5} />;
        })}
        {frame >= swingAt - 6 ? (
          <>
            <path d={needle} fill={piz.color.ink} stroke={piz.color.ink} strokeWidth={3} strokeLinejoin="round" />
            <circle cx={L.cx} cy={L.cy} r={22} fill={piz.color.ink} />
            <circle cx={L.cx} cy={L.cy} r={8} fill={piz.color.white} />
          </>
        ) : null}
        <MarkerArrow {...arrow} at={arrowAt} seed="ga" color={piz.color.ink} width={7} />
      </MarkerLayer>
      {/* zone labels (inside the ring = part of the drawing) and tick numbers */}
      {p.zones.map((zz, i) => {
        const mid = (angOf(bounds[i]) + angOf(zz.to)) / 2;
        const [x, y] = pt(L.cx, L.cy, (L.R + L.r) / 2, mid);
        // Written along the ring (tangent), so long words fit inside the band.
        return (
          <div key={i} style={{ position: "absolute", left: x - 150, top: y - L.label * 0.62, width: 300, textAlign: "center", font: `700 ${L.label}px ${piz.font.label}`, color: onDark(zz.tone) ? piz.color.white : piz.color.ink, transform: `rotate(${(mid + 90 - 360).toFixed(1)}deg)`, visibility: frame >= zoneAt(i) + 4 ? "visible" : "hidden" }}>
            {zz.label}
          </div>
        );
      })}
      {bounds.map((b, i) => {
        const [x, y] = pt(L.cx, L.cy, L.tickR, angOf(b));
        return (
          <div key={i} style={{ position: "absolute", left: x - 60, top: y - L.tick * 0.6, width: 120, textAlign: "center", font: `700 ${L.tick}px ${piz.font.label}`, color: piz.color.muted, visibility: frame >= zoneAt(Math.max(0, i - 1)) + 4 ? "visible" : "hidden" }}>
            {fmtMx(b, Number.isInteger(b) ? 0 : 1)}
          </div>
        );
      })}
      {/* big figure + verdict */}
      <div style={{ position: "absolute", left: L.num.x, top: L.num.y, width: L.num.w, textAlign: L.num.align, visibility: frame >= swingAt ? "visible" : "hidden" }}>
        <Breathe at={settleAt} style={{ transformOrigin: L.num.align === "center" ? "50% 50%" : "0% 50%" }}>
          <div style={{ font: `800 ${numSize}px ${piz.font.heading}`, color: frame >= settleAt ? vColor : piz.color.ink, letterSpacing: "-0.02em", lineHeight: 1, fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap" }}>{numTxt}</div>
        </Breathe>
        {isVertical ? (
          <div style={{ display: "flex", justifyContent: "center", alignItems: "baseline", gap: 18, marginTop: 6 }}>
            <div style={{ font: `400 ${L.cap}px ${piz.font.hand}`, color: piz.color.handInk }}>{p.caption}</div>
            <TypeOn text={upperKeepName(verdict.label)} at={verdictAt} color={vColor} fontSize={L.verdict} align="left" weight={800} />
          </div>
        ) : (
          <>
            <div style={{ font: `400 ${L.cap}px ${piz.font.hand}`, color: piz.color.handInk, marginTop: 4 }}>{p.caption}</div>
            <div style={{ marginTop: 16 }}>
              <TypeOn text={upperKeepName(verdict.label)} at={verdictAt} color={vColor} fontSize={L.verdict} align={L.num.align} weight={800} />
            </div>
          </>
        )}
      </div>
      {p.mascot ? (
        <div style={{ position: "absolute", left: L.mascot.x, top: L.mascot.y }}>
          <MascotSprite character={p.mascot} size={L.mascot.size} at={mascotAt} faces={[{ expr: p.mascotFrom, at: 0 }, { expr: p.mascotTo, at: verdictAt }]} />
        </div>
      ) : null}
      <div style={{ position: "absolute", left: L.note.x, top: L.note.y, width: L.note.w }}>
        <Float px={4} phase={3}>
          <HandNote text={p.note} at={noteAt} fontSize={L.note.size} align={isVertical ? "right" : "left"} color={bad ? piz.color.alert : piz.color.accentDark} style={{ padding: "0 14px" }} />
        </Float>
      </div>
      <SourceLabel text={p.source} left={L.source.x} top={L.source.y} width={L.source.w} align="left" size={24} />
      {p.zones.map((_, i) => (
        <Sfx key={i} kind="tap" at={zoneAt(i)} on={p.sfx} volume={0.22} />
      ))}
      {p.mascot ? <Sfx kind="pop" at={mascotAt + 2} on={p.sfx} volume={0.2} /> : null}
      <Sfx kind="counter" at={swingAt} frames={settleAt - swingAt} on={p.sfx} />
      <Sfx kind="bleep" at={settleAt} on={p.sfx} />
      <Sfx kind={bad ? "thud" : "stamp"} at={verdictAt} on={p.sfx} volume={bad ? 0.3 : 0.3} />
      <Sfx kind="marker" at={arrowAt} on={p.sfx} volume={0.34} />
    </Stage>
  );
};

export const gaugeVariants: Variant<Props>[] = [
  {
    id: "inflacion",
    horizontal: true,
    props: {
      ...base("board", 6),
      heading: "¿SUBEN LOS PRECIOS?",
      accent: "PRECIOS?",
      min: 0,
      max: 12,
      value: 7.8,
      decimals: 1,
      suffix: "%",
      zones: [
        { to: 3, label: "baja", tone: "tint" },
        { to: 6, label: "media", tone: "mid" },
        { to: 12, label: "alta", tone: "alert" },
      ],
      caption: "inflación anual",
      mascot: "termometro-base",
      mascotFrom: "pensando",
      mascotTo: "sorpresa",
      note: "tu dinero compra menos cada año",
      source: SAMPLE,
    },
  },
  {
    id: "riesgo",
    horizontal: true,
    props: {
      ...base("board", 6),
      heading: "TU PERFIL DE RIESGO",
      accent: "RIESGO",
      min: 0,
      max: 10,
      value: 8,
      decimals: 0,
      suffix: " de 10",
      zones: [
        { to: 3, label: "conservador", tone: "tint" },
        { to: 7, label: "moderado", tone: "mid" },
        { to: 10, label: "agresivo", tone: "dark" },
      ],
      caption: "tu nivel de riesgo",
      mascot: "dado-base",
      mascotFrom: "pensando",
      mascotTo: "guino",
      note: "más riesgo = más subidas y bajadas",
      source: SAMPLE,
    },
  },
];

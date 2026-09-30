import { interpolate } from "remotion";
import { z } from "zod";
import { term } from "./theme";
import { backingField, clamp, Decrypt, Exit, formatNum, Panel, safeGuideField, SampleChip, stepPath, Tag, TermStage, useLayout, useLife, usePalette, sfxField, TSfx } from "./primitives";
import { spaced } from "../shared/sfx";

// Step chart that draws on left to right with a scan head, a white value riding the head,
// buy ▲ / sell ▼ markers and a dashed price grid. Axis, ticks, change and markers are all
// computed from `series`. From the prototype's MarketBeat. The panel is the chart frame (it IS
// the graphic); since 2026-09-27 (user rule, no plates behind text) the head value is plain white
// mono text stroked in the panel colour, not a filled white tag.

export const chartSchema = z.object({
  backing: backingField,
  safeGuide: safeGuideField,
  sfx: sfxField,
  duration: z.number().min(3).max(10).default(5.5),
  chapter: z.string(),
  tag: z.string(),
  symbol: z.string(),
  meta: z.string().describe("Línea mono sobre el gráfico"),
  sample: z.boolean().describe('Muestra "[Dato de ejemplo]" y "serie ficticia"'),
  decimals: z.number().int().min(0).max(4),
  series: z.array(z.number()).min(2),
  buys: z.array(z.number().int().min(0)).describe("Índices de compra ▲"),
  sells: z.array(z.number().int().min(0)).describe("Índices de venta ▼"),
});
export type ChartProps = z.infer<typeof chartSchema>;

const UP = [
  1232.7, 1236.1, 1229.4, 1231.8, 1240.2, 1238.6, 1245.9, 1243.1, 1239.7, 1247.3, 1252.8, 1249.1, 1255.6, 1251.2, 1246.9, 1253.4,
  1260.7, 1258.2, 1263.9, 1259.5, 1266.8, 1271.3, 1268.0, 1262.4, 1269.7, 1274.1, 1270.6, 1277.9, 1281.2, 1276.8, 1280.3, 1284.5,
];
const DOWN = [
  221.4, 222.9, 220.1, 221.7, 218.3, 219.6, 216.2, 217.8, 219.1, 215.4, 213.9, 215.2, 212.6, 214.0, 216.3, 213.1,
  210.2, 211.5, 208.9, 210.7, 207.4, 205.8, 207.9, 209.6, 206.3, 204.1, 205.9, 203.2, 201.7, 203.8, 202.4, 200.6,
];

const base: ChartProps = {
  backing: "green",
  safeGuide: false, sfx: true,
  duration: 5.5,
  chapter: "03",
  tag: "Mercado",
  symbol: "NVDA",
  meta: "NVDA · US$ · intradía · 5 min",
  sample: true,
  decimals: 2,
  series: UP,
  buys: [2, 8, 14, 23],
  sells: [6, 12, 21, 28],
};

export const chartVariants: Record<string, ChartProps> = {
  up: base,
  down: { ...base, symbol: "TSLA", meta: "TSLA · US$ · intradía · 5 min", series: DOWN, buys: [3, 9, 16, 26], sells: [1, 6, 13, 22, 29] },
};

const HW = 1664;
const HH = 720;

export const Chart: React.FC<ChartProps> = (p) => {
  const { frame } = useLife();
  const pal = usePalette();
  const c = term.color;
  const f = term.font;
  const L = useLayout();
  // Vertical: the panel fills the graphics zone (y 250–970, 800 wide); legend on its own line.
  const W = L.v ? L.zones.graphics.w : HW;
  const H = L.v ? L.zones.graphics.h : HH;
  const legendTop = L.v ? 222 : 186;
  const tick = interpolate(frame, [0, 8], [0, 1], { ...clamp, easing: term.ease.snap });
  const s = p.series;
  const first = s[0];
  const last = s[s.length - 1];
  const change = (last / first - 1) * 100;
  const up = change >= 0;

  const plot = { x0: 40, x1: W - 190, y0: L.v ? 290 : 236, y1: H - 44 };
  const range = Math.max(...s) - Math.min(...s);
  const step = Math.pow(10, Math.floor(Math.log10(Math.max(range, 1e-6))));
  const lo = Math.floor(Math.min(...s) / step) * step;
  const hi = Math.ceil(Math.max(...s) / step) * step;
  const ticks = Array.from({ length: 5 }, (_, i) => lo + ((hi - lo) * i) / 4);
  const xAt = (i: number) => plot.x0 + (i / (s.length - 1)) * (plot.x1 - plot.x0);
  const yAt = (v: number) => plot.y1 - ((v - lo) / (hi - lo || 1)) * (plot.y1 - plot.y0);
  const pts = s.map((v, i) => ({ x: xAt(i), y: yAt(v) }));
  const d = stepPath(pts);
  const area = `${d} V ${plot.y1} H ${plot.x0} Z`;
  const prog = interpolate(frame, [14, 74], [0, 1], { ...clamp, easing: term.ease.inOut });
  const headI = Math.floor(prog * (s.length - 1));
  const headX = interpolate(prog, [0, 1], [plot.x0, plot.x1]);
  const headV = s[headI];
  const headY = yAt(headV);
  const valid = (i: number) => i >= 0 && i < s.length;

  // Frame at which the scan head reaches point i (same easing as `prog`).
  const reach = (i: number) => {
    for (let f = 14; f <= 74; f++) {
      if (interpolate(f, [14, 74], [0, 1], { ...clamp, easing: term.ease.inOut }) * (s.length - 1) >= i) return f;
    }
    return 74;
  };
  const markerCues = spaced([...p.buys, ...p.sells].filter(valid).map(reach).filter((f) => f < 70));
  const sound = (
    <>
      <TSfx kind="progress" at={14} frames={60} on={p.sfx} />
      {markerCues.map((f) => (
        <TSfx key={f} kind="pop" at={f} on={p.sfx} />
      ))}
      <TSfx kind="bleep" at={74} on={p.sfx} />
    </>
  );

  return (
    <TermStage backing={p.backing} safeGuide={p.safeGuide}>
      <Exit style={{ left: L.v ? L.zones.graphics.x : term.margin, top: L.v ? L.zones.graphics.y : (1080 - H) / 2, width: W, height: H }}>
        <Panel tick={tick} style={{ width: W, height: H }}>
          <div style={{ position: "absolute", left: 40, right: 40, top: 30, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Tag style={{ opacity: frame >= 2 ? 1 : 0 }}>
              [{p.chapter}] {p.tag}
            </Tag>
            {p.sample ? <SampleChip style={{ opacity: frame >= 4 ? 1 : 0 }} /> : null}
          </div>
          <div style={{ position: "absolute", left: 40, top: 86, display: "flex", alignItems: "baseline", gap: 28, whiteSpace: "nowrap" }}>
            <span style={{ fontFamily: f.display, fontWeight: 800, fontSize: 64, letterSpacing: "-0.035em", color: c.ice }}>
              <Decrypt text={p.symbol} start={3} perChar={1} scramble={6} />
            </span>
            <span style={{ fontFamily: f.display, fontWeight: 800, fontSize: 64, letterSpacing: "-0.035em", color: c.text }}>
              <Decrypt text={formatNum(last, p.decimals)} start={6} perChar={0.8} scramble={6} />
            </span>
            <span style={{ fontFamily: f.mono, fontWeight: 700, fontSize: 32, color: up ? pal.gain : pal.loss, opacity: frame >= 16 ? 1 : 0 }}>
              {up ? "▲" : "▼"} {formatNum(Math.abs(change), 1)} %
            </span>
          </div>
          <Tag size={15} c={c.muted} style={{ position: "absolute", left: 40, top: 186 }}>
            {p.meta}
            {p.sample ? <span style={{ color: c.orange }}> · serie ficticia</span> : null}
          </Tag>
          <Tag size={15} c={c.muted} style={{ position: "absolute", right: L.v ? undefined : 40, left: L.v ? 40 : undefined, top: legendTop }}>
            <span style={{ color: pal.gain }}>▲ compra</span> <span style={{ color: pal.loss, marginLeft: 16 }}>▼ venta</span>
          </Tag>
          <svg width={W} height={H} style={{ position: "absolute", left: -1, top: -1 }}>
            <defs>
              <linearGradient id="t-area" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor={c.blue} stopOpacity={0.28} />
                <stop offset="100%" stopColor={c.blue} stopOpacity={0} />
              </linearGradient>
              <clipPath id="t-reveal">
                <rect x={plot.x0 - 2} y={0} width={Math.max(0, headX - plot.x0 + 3)} height={H} />
              </clipPath>
            </defs>
            {ticks.map((v) => (
              <g key={v}>
                <line x1={plot.x0} x2={plot.x1} y1={yAt(v)} y2={yAt(v)} stroke={c.hairline} strokeDasharray="4 6" />
                <text x={plot.x1 + 22} y={yAt(v) + 6} fill={c.muted} fontFamily={f.mono} fontSize={L.v ? 18 : 16}>
                  {formatNum(v, p.decimals)}
                </text>
              </g>
            ))}
            <g clipPath="url(#t-reveal)">
              <path d={area} fill="url(#t-area)" />
              <path d={d} fill="none" stroke={c.ice} strokeWidth={2.5} />
              {p.buys.filter(valid).map((i) => (
                <path key={`b${i}`} d={`M ${pts[i].x} ${pts[i].y + 16} l 9 15 h -18 z`} fill={pal.gain} />
              ))}
              {p.sells.filter(valid).map((i) => (
                <path key={`s${i}`} d={`M ${pts[i].x} ${pts[i].y - 16} l 9 -15 h -18 z`} fill={pal.loss} />
              ))}
            </g>
            {prog > 0 ? (
              <g>
                <line x1={headX} x2={headX} y1={plot.y0} y2={plot.y1} stroke={c.blue} strokeOpacity={0.5} />
                <circle cx={headX} cy={headY} r={11} fill={c.blue} fillOpacity={0.25} />
                <circle cx={headX} cy={headY} r={5} fill={c.ice} />
                <line x1={headX + 8} x2={headX + 20} y1={headY} y2={headY} stroke={c.text} strokeWidth={2} />
                <text
                  x={headX + 26}
                  y={headY + 8}
                  fill={c.text}
                  stroke={c.panel}
                  strokeWidth={6}
                  paintOrder="stroke"
                  strokeLinejoin="round"
                  fontFamily={f.mono}
                  fontWeight={700}
                  fontSize={L.v ? 24 : 22}
                >
                  {formatNum(headV, p.decimals)}
                </text>
              </g>
            ) : null}
          </svg>
        </Panel>
      </Exit>
      {sound}
    </TermStage>
  );
};

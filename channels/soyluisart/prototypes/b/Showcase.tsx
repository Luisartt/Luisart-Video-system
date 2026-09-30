import { evolvePath, getLength } from "@remotion/paths";
import { AbsoluteFill, Sequence, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { clamp, colourLogos, formatEs, Logo, stepPath } from "../shared";
import { Backdrop, CornerTicks, Decrypt, Hud, ScanCut, SplitFlap, Tag, TypeLine } from "./components";
import { themeB as t } from "./theme";

const { color, font } = t;

// Hard cuts between beats, each covered by a 5-frame scan sweep.
const BEATS = [90, 90, 90, 60];
const STARTS = BEATS.map((_, i) => BEATS.slice(0, i).reduce((a, b) => a + b, 0));
export const protoBDuration = BEATS.reduce((a, b) => a + b, 0);
const CIRCUIT_FRAMES = 180; // b1-circuit-pulses.mp4 is 6.04 s

const X = 128; // content left edge

// ── Beat 1 · chapter card ────────────────────────────────────────────────────────────────
const ChapterBeat: React.FC = () => {
  const frame = useCurrentFrame();
  const tick = interpolate(frame, [0, 8], [0, 1], { ...clamp, easing: t.ease.snap });
  const steps = ["Leer el mercado", "Evaluar el riesgo", "Mover tu dinero"];
  const h1: React.CSSProperties = {
    fontFamily: font.display,
    fontWeight: 800,
    fontSize: 136,
    lineHeight: 0.98,
    letterSpacing: t.tracking.display,
    color: color.text,
  };
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: X, top: 240, padding: "40px 48px 44px 40px" }}>
        <CornerTicks size={22} p={tick} c={color.blue} />
        <Tag style={{ opacity: frame >= 3 ? 1 : 0 }}>[01] Capítulo</Tag>
        <div style={{ ...h1, marginTop: 26 }}>
          <Decrypt text="La IA ya está moviendo" start={4} perChar={0.8} />
        </div>
        <div style={{ ...h1, color: color.ice, display: "flex", alignItems: "center" }}>
          <Decrypt text="tu dinero." start={14} perChar={1} />
          <span
            style={{
              display: "inline-block",
              width: 22,
              height: 112,
              marginLeft: 18,
              background: color.blue,
              opacity: frame >= 14 && Math.floor(frame / 8) % 2 === 0 ? 1 : 0,
            }}
          />
        </div>
        <TypeLine
          text={'$ soyluisart run capitulo --id 01 --tema "IA y dinero"'}
          start={34}
          cps={1.6}
          cursorUntil={0}
          style={{ marginTop: 40, fontSize: 24, color: color.muted, letterSpacing: "0.02em" }}
        />
      </div>

      <div
        style={{
          position: "absolute",
          right: X,
          bottom: 112,
          width: 420,
          background: `${color.panel}E6`,
          border: `1px solid ${color.hairline}`,
          opacity: frame >= 40 ? 1 : 0,
        }}
      >
        <div style={{ padding: "16px 22px", borderBottom: `1px solid ${color.hairline}`, display: "flex", justifyContent: "space-between" }}>
          <Tag size={15} c={color.text}>
            Agente · en marcha
          </Tag>
          <Tag size={15} c={Math.floor(frame / 10) % 2 ? color.orange : `${color.orange}66`}>
            ●
          </Tag>
        </div>
        <div style={{ padding: "18px 22px", display: "flex", flexDirection: "column", gap: 14 }}>
          {steps.map((s, i) => {
            const done = frame >= 50 + i * 9;
            return (
              <div key={s} style={{ display: "flex", gap: 14, alignItems: "center", fontFamily: font.mono, fontSize: 20, color: done ? color.text : color.muted }}>
                <span style={{ color: done ? color.gain : color.muted, width: 20 }}>{done ? "✓" : "·"}</span>
                {s}
              </div>
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ── Beat 2 · animated beams: 5 AI tools → "Tu negocio" ─────────────────────────────────
const NODES = [
  { def: colourLogos.openai, x: 660, y: 330 },
  { def: colourLogos.claude, x: 580, y: 460 },
  { def: colourLogos.gemini, x: 540, y: 590 },
  { def: colourLogos.perplexity, x: 580, y: 720 },
  { def: colourLogos.deepseek, x: 660, y: 850 },
];
const HUB = { x: 1360, y: 590, w: 400, h: 164 };
const NODE = 108;

const BeamsBeat: React.FC = () => {
  const frame = useCurrentFrame();
  const hubLeft = HUB.x - HUB.w / 2;
  const paths = NODES.map((n) => {
    const x0 = n.x + NODE / 2;
    return `M ${x0} ${n.y} C ${x0 + 280} ${n.y} ${hubLeft - 280} ${HUB.y} ${hubLeft} ${HUB.y}`;
  });
  const lens = paths.map((d) => getLength(d));
  const period = 28;
  const travel = 20;
  const cometStart = (i: number) => 30 + i * 4;
  // Hub flashes when a comet lands.
  const pulse = Math.max(
    0,
    ...NODES.map((_, i) => {
      const since = frame - cometStart(i) - travel;
      if (since < 0) return 0;
      return Math.max(0, 1 - (since % period) / 10);
    }),
  );
  const hubIn = frame >= 1;
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: X, top: 128 }}>
        <Tag>[02] Herramientas</Tag>
        <div style={{ marginTop: 14, fontFamily: font.display, fontWeight: 700, fontSize: 60, letterSpacing: "-0.03em", color: color.text }}>
          <Decrypt text="Cinco modelos. Un solo destino." start={0} perChar={0.5} scramble={5} />
        </div>
      </div>

      <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
        <defs>
          <filter id="b-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="5" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        {paths.map((d, i) => {
          const draw = interpolate(frame, [10 + i * 3, 24 + i * 3], [0, 1], { ...clamp, easing: t.ease.inOut });
          const evo = evolvePath(draw, d);
          const seg = 150;
          const local = frame - cometStart(i);
          const phase = local < 0 ? -1 : local % period;
          const offset = phase >= 0 && phase <= travel ? interpolate(phase, [0, travel], [seg, -lens[i]]) : seg;
          return (
            <g key={i}>
              <path d={d} fill="none" stroke={color.hairlineBright} strokeWidth={2} strokeDasharray={evo.strokeDasharray} strokeDashoffset={evo.strokeDashoffset} />
              <path
                d={d}
                fill="none"
                stroke={color.blue}
                strokeWidth={4}
                strokeLinecap="round"
                strokeDasharray={`${seg} ${lens[i] + seg}`}
                strokeDashoffset={offset}
                filter="url(#b-glow)"
              />
              <path
                d={d}
                fill="none"
                stroke={color.ice}
                strokeWidth={1.5}
                strokeLinecap="round"
                strokeDasharray={`${seg * 0.4} ${lens[i] + seg}`}
                strokeDashoffset={offset - seg * 0.6}
              />
            </g>
          );
        })}
      </svg>

      {NODES.map((n, i) => {
        const on = frame >= i;
        const flicker = frame === i || frame === i + 2 ? 0.4 : 1;
        return (
          <div key={n.def.file} style={{ opacity: on ? flicker : 0 }}>
            <div
              style={{
                position: "absolute",
                left: n.x - NODE / 2,
                top: n.y - NODE / 2,
                width: NODE,
                height: NODE,
                background: color.panel,
                border: `1px solid ${color.hairlineBright}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <CornerTicks size={12} c={color.ice} />
              <Logo def={n.def} size={54} />
            </div>
            <Tag size={17} c={color.ice} style={{ position: "absolute", right: 1920 - (n.x - NODE / 2 - 26), top: n.y - 12 }}>
              {n.def.name}
            </Tag>
          </div>
        );
      })}

      <div
        style={{
          position: "absolute",
          left: hubLeft,
          top: HUB.y - HUB.h / 2,
          width: HUB.w,
          height: HUB.h,
          background: color.panel,
          border: `1px solid ${pulse > 0.05 ? color.blue : color.hairlineBright}`,
          boxShadow: `0 0 ${24 + pulse * 40}px ${color.blue}${Math.round(40 + pulse * 80).toString(16).padStart(2, "0")}`,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          paddingLeft: 36,
          opacity: hubIn ? 1 : 0,
        }}
      >
        <CornerTicks size={20} c={color.ice} />
        <Tag size={15}>[Nodo_00] Destino</Tag>
        <div style={{ marginTop: 8, fontFamily: font.display, fontWeight: 700, fontSize: 58, letterSpacing: "-0.03em", color: color.text }}>
          <Decrypt text="Tu negocio" start={8} perChar={1} scramble={6} />
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ── Beat 3 · split-flap ticker + step chart ─────────────────────────────────────────────
// Sample data, clearly tagged on screen: a made-up intraday price series.
const SAMPLE_PRICES = [
  1232.7, 1236.1, 1229.4, 1231.8, 1240.2, 1238.6, 1245.9, 1243.1, 1239.7, 1247.3, 1252.8, 1249.1, 1255.6, 1251.2, 1246.9, 1253.4,
  1260.7, 1258.2, 1263.9, 1259.5, 1266.8, 1271.3, 1268.0, 1262.4, 1269.7, 1274.1, 1270.6, 1277.9, 1281.2, 1276.8, 1280.3, 1284.5,
];
const BUYS = [2, 8, 14, 23];
const SELLS = [6, 12, 21, 28];

const MarketBeat: React.FC = () => {
  const frame = useCurrentFrame();
  const first = SAMPLE_PRICES[0];
  const last = SAMPLE_PRICES[SAMPLE_PRICES.length - 1];
  const change = (last / first - 1) * 100;
  const up = change >= 0;

  // Chart geometry, computed from the data.
  const box = { x: X, y: 404, w: 1920 - 2 * X, h: 540 };
  const plot = { x0: box.x + 40, x1: box.x + box.w - 170, y0: box.y + 76, y1: box.y + box.h - 44 };
  const lo = Math.floor(Math.min(...SAMPLE_PRICES) / 10) * 10;
  const hi = Math.ceil(Math.max(...SAMPLE_PRICES) / 10) * 10;
  const ticks = Array.from({ length: 5 }, (_, i) => lo + ((hi - lo) * i) / 4);
  const xAt = (i: number) => plot.x0 + (i / (SAMPLE_PRICES.length - 1)) * (plot.x1 - plot.x0);
  const yAt = (v: number) => plot.y1 - ((v - lo) / (hi - lo)) * (plot.y1 - plot.y0);
  const pts = SAMPLE_PRICES.map((v, i) => ({ x: xAt(i), y: yAt(v) }));
  const d = stepPath(pts);
  const area = `${d} V ${plot.y1} H ${plot.x0} Z`;
  const p = interpolate(frame, [12, 66], [0, 1], { ...clamp, easing: t.ease.inOut });
  const headI = Math.floor(p * (SAMPLE_PRICES.length - 1));
  const headX = interpolate(p, [0, 1], [plot.x0, plot.x1]);
  const headV = SAMPLE_PRICES[headI];
  const headY = yAt(headV);
  const chartIn = frame >= 2;

  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: X, top: 128, right: X, display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <Tag>[03] Mercado</Tag>
        <div style={{ border: `1px solid ${color.orange}`, padding: "8px 14px", position: "relative" }}>
          <Tag size={16}>[Dato de ejemplo]</Tag>
        </div>
      </div>
      <div style={{ position: "absolute", left: X, top: 186 }}>
        <SplitFlap
          start={2}
          segments={[
            { text: "NVDA", c: color.ice },
            { text: " " },
            { text: formatEs(last, 2), c: color.text },
            { text: " " },
            { text: `${up ? "▲" : "▼"} ${formatEs(Math.abs(change), 1)} %`, c: up ? color.gain : color.loss },
          ]}
        />
      </div>

      <div
        style={{
          position: "absolute",
          left: box.x,
          top: box.y,
          width: box.w,
          height: box.h,
          border: `1px solid ${color.hairline}`,
          background: `${color.panel}66`,
          opacity: chartIn ? 1 : 0,
        }}
      >
        <CornerTicks size={16} c={color.ice} />
        <Tag size={15} c={color.muted} style={{ position: "absolute", left: 40, top: 26 }}>
          NVDA · intradía · 5 min · <span style={{ color: color.orange }}>serie ficticia</span>
        </Tag>
        <Tag size={15} c={color.muted} style={{ position: "absolute", right: 40, top: 26 }}>
          <span style={{ color: color.gain }}>▲ compra</span> <span style={{ color: color.loss, marginLeft: 16 }}>▼ venta</span>
        </Tag>
      </div>
      <svg width={1920} height={1080} style={{ position: "absolute", inset: 0, opacity: chartIn ? 1 : 0 }}>
        <defs>
          <linearGradient id="b-area" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor={color.blue} stopOpacity={0.28} />
            <stop offset="100%" stopColor={color.blue} stopOpacity={0} />
          </linearGradient>
          <clipPath id="b-reveal">
            <rect x={plot.x0 - 2} y={0} width={headX - plot.x0 + 3} height={1080} />
          </clipPath>
        </defs>
        {ticks.map((v) => (
          <g key={v}>
            <line x1={plot.x0} x2={plot.x1} y1={yAt(v)} y2={yAt(v)} stroke={color.hairline} strokeDasharray="4 6" />
            <text x={plot.x1 + 22} y={yAt(v) + 6} fill={color.muted} fontFamily={font.mono} fontSize={16}>
              {formatEs(v, 2)}
            </text>
          </g>
        ))}
        <g clipPath="url(#b-reveal)">
          <path d={area} fill="url(#b-area)" />
          <path d={d} fill="none" stroke={color.ice} strokeWidth={2.5} />
          {BUYS.map((i) => (
            <path key={`b${i}`} d={`M ${pts[i].x} ${pts[i].y + 16} l 9 15 h -18 z`} fill={color.gain} />
          ))}
          {SELLS.map((i) => (
            <path key={`s${i}`} d={`M ${pts[i].x} ${pts[i].y - 16} l 9 -15 h -18 z`} fill={color.loss} />
          ))}
        </g>
        {p > 0 ? (
          <g>
            <line x1={headX} x2={headX} y1={plot.y0} y2={plot.y1} stroke={color.blue} strokeOpacity={0.5} />
            <circle cx={headX} cy={headY} r={11} fill={color.blue} fillOpacity={0.25} />
            <circle cx={headX} cy={headY} r={5} fill={color.ice} />
            <rect x={headX + 16} y={headY - 20} width={150} height={40} fill={color.text} />
            <text x={headX + 91} y={headY + 7} textAnchor="middle" fill={color.bg} fontFamily={font.mono} fontWeight={700} fontSize={20}>
              {formatEs(headV, 2)}
            </text>
          </g>
        ) : null}
      </svg>
    </AbsoluteFill>
  );
};

// ── Beat 4 · lower third ─────────────────────────────────────────────────────────────────
const NameBeat: React.FC = () => {
  const frame = useCurrentFrame();
  const tick = interpolate(frame, [0, 6], [0, 1], { ...clamp, easing: t.ease.snap });
  const box = frame >= 5;
  return (
    <AbsoluteFill>
      <div
        style={{
          position: "absolute",
          left: X,
          bottom: 150,
          padding: "26px 44px 30px 40px",
          background: box ? `${color.bg}D9` : "transparent",
          border: `1px solid ${box ? color.hairlineBright : "transparent"}`,
        }}
      >
        <CornerTicks size={20} p={tick} c={color.ice} />
        <div style={{ position: "absolute", left: -1, top: 24, bottom: 24, width: 4, background: color.blue, opacity: box ? 1 : 0 }} />
        <Tag size={15} style={{ opacity: frame >= 6 ? 1 : 0 }}>
          [ID] Presentador
        </Tag>
        <div
          style={{
            marginTop: 6,
            fontFamily: font.display,
            fontWeight: 800,
            fontSize: 92,
            lineHeight: 1.02,
            letterSpacing: "-0.035em",
            color: color.text,
          }}
        >
          <Decrypt text="Luisart" start={6} perChar={1.2} scramble={6} />
        </div>
        <TypeLine
          text="@soyluisart · IA · finanzas · negocios"
          start={16}
          cps={2.4}
          cursorUntil={48}
          style={{ marginTop: 10, fontSize: 24, color: color.ice, letterSpacing: "0.02em" }}
        />
      </div>
    </AbsoluteFill>
  );
};

export const ProtoBTerminal: React.FC = () => {
  const { fps } = useVideoConfig();
  const beats = [ChapterBeat, BeamsBeat, MarketBeat, NameBeat];
  return (
    <AbsoluteFill style={{ background: color.bg }}>
      <Backdrop
        videoFrames={CIRCUIT_FRAMES}
        brightness={(f) => interpolate(f, [STARTS[3], STARTS[3] + 10], [t.circuitOpacity, 0.55], clamp)}
      />
      {beats.map((Beat, i) => (
        <Sequence key={i} from={STARTS[i]} durationInFrames={BEATS[i]}>
          <Beat />
        </Sequence>
      ))}
      <Hud beatStarts={STARTS} fps={fps} />
      {STARTS.slice(1).map((s) => (
        <Sequence key={s} from={s - 2} durationInFrames={5}>
          <ScanCut />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};

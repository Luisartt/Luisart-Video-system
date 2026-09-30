import { TransitionSeries, linearTiming } from "@remotion/transitions";
import { wipe } from "@remotion/transitions/wipe";
import { fade } from "@remotion/transitions/fade";
import { AbsoluteFill, Img, OffthreadVideo, interpolate, useCurrentFrame } from "remotion";
import { clamp, falProto, formatEs, Logo, linePath, monoLogos } from "../shared";
import { Crosshair, Hairline, LineReveal, MonoLabel, PageChrome, Plate } from "./components";
import { themeA as t } from "./theme";

const { color, font } = t;
const M = t.margin;

// Beat lengths and transitions (frames at 30 fps). Total = sum(beats) − sum(transitions).
const BEATS = [100, 85, 95, 75];
const TRANS = [14, 14, 12];
export const protoADuration = BEATS.reduce((a, b) => a + b, 0) - TRANS.reduce((a, b) => a + b, 0);
const BEAT_STARTS = BEATS.map((_, i) => BEATS.slice(0, i).reduce((a, b) => a + b, 0) - TRANS.slice(0, i).reduce((a, b) => a + b, 0));

// Seedance animation of the engraving (coin machine → neural network). Fallback: e1 still.
const PLATE_VIDEO = falProto("a3-engraving-machine-1080p.mp4");

const Page: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <AbsoluteFill style={{ background: color.ink }}>{children}</AbsoluteFill>
);

// ── Beat 1 · chapter card ────────────────────────────────────────────────────────────────
const ChapterBeat: React.FC = () => {
  const frame = useCurrentFrame();
  const reveal = interpolate(frame, [4, 30], [0, 1], { ...clamp, easing: t.ease.inOut });
  const headline: React.CSSProperties = {
    fontFamily: font.serif,
    fontSize: 118,
    lineHeight: 1.0,
    letterSpacing: t.tracking.serif,
    color: color.text,
  };
  return (
    <Page>
      <div style={{ position: "absolute", left: M, top: 262, width: 700 }}>
        <LineReveal delay={6} duration={16}>
          <MonoLabel>01 / Capítulo</MonoLabel>
        </LineReveal>
        <div style={{ position: "relative", height: 1, marginTop: 26, marginBottom: 38 }}>
          <Hairline delay={10} duration={20} length={88} color={color.copper} style={{ left: 0, top: 0 }} />
        </div>
        <LineReveal delay={12} style={headline}>
          La IA ya está
        </LineReveal>
        <LineReveal delay={17} style={headline}>
          moviendo
        </LineReveal>
        <LineReveal delay={22} style={{ ...headline, fontStyle: "italic", color: color.copper }}>
          tu dinero.
        </LineReveal>
        <div
          style={{
            marginTop: 44,
            width: 500,
            fontFamily: font.sans,
            fontSize: 26,
            lineHeight: 1.45,
            color: color.muted,
            opacity: interpolate(frame, [34, 50], [0, 1], clamp),
            translate: `0 ${interpolate(frame, [34, 50], [10, 0], { ...clamp, easing: t.ease.out })}px`,
          }}
        >
          Algoritmos que compran, venden y deciden mientras tú duermes.
        </div>
      </div>
      <div style={{ position: "absolute", right: M, top: 238 }}>
        <Plate
          width={840}
          height={560}
          reveal={reveal}
          caption="Lám. I — De la máquina de monedas a la red"
          figure="Fig. 01"
        >
          <OffthreadVideo
            src={PLATE_VIDEO}
            muted
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              scale: String(interpolate(frame, [0, 100], [1.0, 1.07], clamp)),
            }}
          />
        </Plate>
      </div>
    </Page>
  );
};

// ── Beat 2 · tool strip on a hairline grid ───────────────────────────────────────────────
const ToolsBeat: React.FC = () => {
  const frame = useCurrentFrame();
  const top = 500;
  const h = 260;
  const w = 1920 - 2 * M;
  const cell = w / monoLogos.length;
  const cross = interpolate(frame, [20, 32], [0, 1], clamp);
  return (
    <Page>
      <div style={{ position: "absolute", left: M, top: 236, display: "flex", justifyContent: "space-between", width: w, alignItems: "flex-end" }}>
        <div>
          <LineReveal delay={4} duration={16}>
            <MonoLabel>02 / Herramientas</MonoLabel>
          </LineReveal>
          <LineReveal
            delay={8}
            style={{ marginTop: 30, fontFamily: font.serif, fontSize: 104, lineHeight: 1, letterSpacing: t.tracking.serif, color: color.text }}
          >
            Quién mueve <span style={{ fontStyle: "italic", color: color.copper }}>los hilos</span>
          </LineReveal>
        </div>
        <div
          style={{
            width: 470,
            fontFamily: font.sans,
            fontSize: 24,
            lineHeight: 1.5,
            color: color.muted,
            paddingBottom: 12,
            opacity: interpolate(frame, [18, 34], [0, 1], clamp),
          }}
        >
          Seis modelos que ya leen mercados, redactan informes y proponen inversiones.
        </div>
      </div>

      <div
        style={{
          position: "absolute",
          left: M,
          top,
          width: w,
          height: h,
          background: color.inkRaised,
          clipPath: `inset(0 ${interpolate(frame, [4, 26], [100, 0], { ...clamp, easing: t.ease.inOut })}% 0 0)`,
        }}
      />
      <Hairline delay={6} duration={22} length={w} color={color.hairlineStrong} style={{ left: M, top }} />
      <Hairline delay={9} duration={22} length={w} color={color.hairlineStrong} origin="end" style={{ left: M, top: top + h }} />
      {Array.from({ length: monoLogos.length + 1 }).map((_, i) => (
        <Hairline key={i} vertical delay={12 + i * 1.5} duration={14} length={h} color={color.hairline} style={{ left: M + i * cell, top }} />
      ))}
      {Array.from({ length: monoLogos.length + 1 }).map((_, i) => (
        <div key={i}>
          <Crosshair x={M + i * cell} y={top} opacity={cross} />
          <Crosshair x={M + i * cell} y={top + h} opacity={cross} />
        </div>
      ))}
      {monoLogos.map((def, i) => {
        const d = 22 + i * 4;
        return (
          <div
            key={def.file}
            style={{
              position: "absolute",
              left: M + i * cell,
              top,
              width: cell,
              height: h,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 30,
              opacity: interpolate(frame, [d, d + 14], [0, 1], clamp),
              translate: `0 ${interpolate(frame, [d, d + 16], [16, 0], { ...clamp, easing: t.ease.out })}px`,
            }}
          >
            <MonoLabel size={14} color={color.muted} style={{ position: "absolute", left: 20, top: 18 }}>
              {String(i + 1).padStart(2, "0")}
            </MonoLabel>
            <Logo def={def} size={70} />
            <div style={{ fontFamily: font.sans, fontWeight: 500, fontSize: 28, color: color.text, letterSpacing: "-0.01em" }}>{def.name}</div>
          </div>
        );
      })}
      <MonoLabel
        size={14}
        color={color.muted}
        style={{ position: "absolute", left: M, top: top + h + 26, opacity: interpolate(frame, [40, 54], [0, 1], clamp) }}
      >
        Logotipos de sus respectivos dueños · solo para identificar cada producto
      </MonoLabel>
    </Page>
  );
};

// ── Beat 3 · before → after number with a small plate ───────────────────────────────────
// Sample data (clearly tagged on screen): annual return of a sample portfolio, month by month.
const SAMPLE_RETURNS = [37.3, 38.1, 37.6, 40.2, 42.8, 41.9, 45.3, 47.7, 46.9, 51.2, 54.6, 57.9];

const DataBeat: React.FC = () => {
  const frame = useCurrentFrame();
  const before = SAMPLE_RETURNS[0];
  const after = SAMPLE_RETURNS[SAMPLE_RETURNS.length - 1];
  const count = interpolate(frame, [34, 66], [before, after], { ...clamp, easing: t.ease.out });
  const reveal = interpolate(frame, [2, 26], [0, 1], { ...clamp, easing: t.ease.inOut });

  // Ledger line chart, computed from the data.
  const cw = 900;
  const ch = 150;
  const min = Math.min(...SAMPLE_RETURNS);
  const max = Math.max(...SAMPLE_RETURNS);
  const pts = SAMPLE_RETURNS.map((v, i) => ({
    x: (i / (SAMPLE_RETURNS.length - 1)) * cw,
    y: ch - ((v - min) / (max - min)) * (ch - 16) - 8,
  }));
  const draw = interpolate(frame, [30, 76], [0, 1], { ...clamp, easing: t.ease.inOut });

  const big: React.CSSProperties = { fontFamily: font.serif, fontSize: 176, lineHeight: 1, letterSpacing: "-0.03em" };
  const rightX = 900;
  return (
    <Page>
      <div style={{ position: "absolute", left: M, top: 212 }}>
        <Plate width={660} height={440} reveal={reveal} caption="Lám. II — Motor de cotizaciones" figure="Fig. 02">
          <Img
            src={falProto("e2-engraving-ticker-engine.png")}
            style={{ width: "100%", height: "100%", objectFit: "cover", scale: String(interpolate(frame, [0, 95], [1.02, 1.08], clamp)) }}
          />
        </Plate>
      </div>
      <div style={{ position: "absolute", left: rightX, top: 212, width: 1920 - M - rightX }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <LineReveal delay={6} duration={16}>
            <MonoLabel>03 / El dato</MonoLabel>
          </LineReveal>
          <div
            style={{
              border: `1px solid ${color.copper}`,
              padding: "7px 14px 6px",
              opacity: interpolate(frame, [14, 24], [0, 1], clamp),
            }}
          >
            <MonoLabel size={14}>Dato de ejemplo</MonoLabel>
          </div>
        </div>
        <LineReveal
          delay={10}
          style={{ marginTop: 30, fontFamily: font.serif, fontSize: 70, lineHeight: 1.02, letterSpacing: t.tracking.serif, color: color.text }}
        >
          Rentabilidad anual, <span style={{ fontStyle: "italic", color: color.copper }}>antes y después</span>
        </LineReveal>
        <LineReveal delay={14} style={{ marginTop: 6, fontFamily: font.sans, fontSize: 24, color: color.muted }}>
          Cartera ilustrativa · no es una estadística real
        </LineReveal>

        <div style={{ display: "flex", alignItems: "flex-end", gap: 34, marginTop: 58 }}>
          <div style={{ opacity: interpolate(frame, [20, 34], [0, 1], clamp) }}>
            <div style={{ ...big, color: color.muted }}>
              {formatEs(before, 1)}
              <span style={{ fontSize: 88 }}>%</span>
            </div>
            <MonoLabel size={15} color={color.muted} style={{ marginTop: 14 }}>
              Gestión manual
            </MonoLabel>
          </div>
          <svg width={120} height={40} style={{ marginBottom: 108, overflow: "visible" }}>
            <line
              x1={0}
              y1={20}
              x2={interpolate(frame, [28, 42], [0, 116], { ...clamp, easing: t.ease.inOut })}
              y2={20}
              stroke={color.copper}
              strokeWidth={1.5}
            />
            <path d="M 104 10 L 118 20 L 104 30" fill="none" stroke={color.copper} strokeWidth={1.5} opacity={interpolate(frame, [40, 44], [0, 1], clamp)} />
          </svg>
          <div style={{ opacity: interpolate(frame, [32, 40], [0, 1], clamp) }}>
            <div style={{ ...big, color: color.copper }}>
              {formatEs(count, 1)}
              <span style={{ fontSize: 88 }}>%</span>
            </div>
            <MonoLabel size={15} color={color.copper} style={{ marginTop: 14 }}>
              Con IA
            </MonoLabel>
          </div>
        </div>

        <svg width={cw} height={ch + 30} style={{ marginTop: 44, overflow: "visible" }}>
          <defs>
            <linearGradient id="a-gilded" x1="0" x2="1" y1="0" y2="0">
              <stop offset="0%" stopColor="#AE9357" stopOpacity={0.5} />
              <stop offset="60%" stopColor="#FFF0CC" />
              <stop offset="100%" stopColor={color.copper} />
            </linearGradient>
            <clipPath id="a-draw">
              <rect x={-4} y={-20} width={(cw + 8) * draw} height={ch + 60} />
            </clipPath>
          </defs>
          <line x1={0} x2={cw} y1={ch} y2={ch} stroke={color.hairline} />
          {SAMPLE_RETURNS.map((_, i) => (
            <line key={i} x1={pts[i].x} x2={pts[i].x} y1={ch} y2={ch + 8} stroke={color.hairlineStrong} />
          ))}
          <g clipPath="url(#a-draw)">
            <path d={linePath(pts)} fill="none" stroke="url(#a-gilded)" strokeWidth={2} />
            <circle cx={pts[pts.length - 1].x} cy={pts[pts.length - 1].y} r={5} fill={color.copper} />
          </g>
          <text x={0} y={ch + 30} fill={color.muted} fontFamily={font.mono} fontSize={13} letterSpacing="0.2em">
            ENE
          </text>
          <text x={cw} y={ch + 30} fill={color.muted} fontFamily={font.mono} fontSize={13} letterSpacing="0.2em" textAnchor="end">
            DIC
          </text>
        </svg>
      </div>
    </Page>
  );
};

// ── Beat 4 · name lower third ─────────────────────────────────────────────────────────────
const NameBeat: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <Page>
      <AbsoluteFill style={{ overflow: "hidden" }}>
        <Img
          src={falProto("e1-engraving-brain-ledger.png")}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            filter: "brightness(0.5) contrast(1.05)",
            scale: String(interpolate(frame, [0, 75], [1.04, 1.09], clamp)),
          }}
        />
      </AbsoluteFill>
      <AbsoluteFill
        style={{
          background: `linear-gradient(90deg, ${color.ink}F2 0%, ${color.ink}B0 34%, ${color.ink}00 62%), linear-gradient(0deg, ${color.ink}E6 0%, ${color.ink}00 45%)`,
        }}
      />
      <div style={{ position: "absolute", left: M + 40, bottom: 170 }}>
        <LineReveal delay={4} duration={14}>
          <MonoLabel size={16} style={{ textTransform: "none", letterSpacing: "0.14em" }}>
            @soyluisart
          </MonoLabel>
        </LineReveal>
        <LineReveal
          delay={8}
          duration={22}
          style={{ marginTop: 10, fontFamily: font.serif, fontStyle: "italic", fontSize: 132, lineHeight: 1, letterSpacing: "-0.01em", color: color.text }}
        >
          Luisart
        </LineReveal>
        <div style={{ position: "relative", height: 1, marginTop: 22 }}>
          <Hairline delay={14} duration={24} length={440} color={color.copper} style={{ left: 0, top: 0 }} />
        </div>
        <LineReveal delay={22} duration={16} style={{ marginTop: 22 }}>
          <MonoLabel size={19} color={color.text}>
            IA · Finanzas · Negocios
          </MonoLabel>
        </LineReveal>
      </div>
    </Page>
  );
};

export const ProtoAGrabado: React.FC = () => (
  <AbsoluteFill style={{ background: color.ink }}>
    <TransitionSeries>
      <TransitionSeries.Sequence durationInFrames={BEATS[0]}>
        <ChapterBeat />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition presentation={wipe({ direction: "from-left" })} timing={linearTiming({ durationInFrames: TRANS[0] })} />
      <TransitionSeries.Sequence durationInFrames={BEATS[1]}>
        <ToolsBeat />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition presentation={wipe({ direction: "from-left" })} timing={linearTiming({ durationInFrames: TRANS[1] })} />
      <TransitionSeries.Sequence durationInFrames={BEATS[2]}>
        <DataBeat />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition presentation={fade()} timing={linearTiming({ durationInFrames: TRANS[2] })} />
      <TransitionSeries.Sequence durationInFrames={BEATS[3]}>
        <NameBeat />
      </TransitionSeries.Sequence>
    </TransitionSeries>
    <PageChrome beatStarts={BEAT_STARTS} />
  </AbsoluteFill>
);

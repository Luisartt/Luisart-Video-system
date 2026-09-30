import { evolvePath } from "@remotion/paths";
import { noise2D } from "@remotion/noise";
import { AbsoluteFill, Sequence, interpolate, random, useCurrentFrame } from "remotion";
import { clamp, colourLogos, Logo, LogoDef } from "../shared";
import { Broll, Dust, FilmGrain, FlashCut, GateWeave, LandingWord, Vignette } from "./components";
import { themeC as t } from "./theme";

const { color, font } = t;

// Hard cuts between beats; the one flash/glitch cut sits inside beat 3 (bar → number).
const BEATS = [96, 75, 90, 69];
const STARTS = BEATS.map((_, i) => BEATS.slice(0, i).reduce((a, b) => a + b, 0));
export const protoCDuration = BEATS.reduce((a, b) => a + b, 0);
const FLASH_AT = 34; // local frame in beat 3

// ── Beat 1 · "PARTE 1" + title words landing ─────────────────────────────────────────────
const ChapterBeat: React.FC = () => {
  const frame = useCurrentFrame();
  const words1 = ["LA", "IA", "YA", "ESTÁ"];
  const words2 = ["MOVIENDO", "TU", "DINERO"];
  const title: React.CSSProperties = {
    fontFamily: font.display,
    fontWeight: 900,
    fontSize: 138,
    lineHeight: 1.0,
    letterSpacing: "-0.01em",
    color: color.bone,
    textShadow: "0 0 34px rgba(232,226,214,0.28), 0 2px 0 rgba(0,0,0,0.4)",
    display: "flex",
    gap: "0.24em",
    justifyContent: "center",
  };
  const tab = interpolate(frame, [6, 12], [0, 1], { ...clamp, easing: t.ease.land });
  return (
    <AbsoluteFill>
      <Broll file="c1-datacenter-amber.mp4" duration={BEATS[0]} dim={0.62} from={1.05} to={1.13} />
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(17,19,22,0.1) 0%, rgba(17,19,22,0.55) 100%)" }} />
      <Dust />
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", flexDirection: "column" }}>
        <div
          style={{
            background: color.bone,
            color: color.charcoal,
            fontFamily: font.display,
            fontWeight: 800,
            fontSize: 34,
            letterSpacing: "0.1em",
            padding: "10px 44px 9px",
            marginBottom: 34,
            clipPath: `inset(0 ${(1 - tab) * 100}% 0 0)`,
          }}
        >
          PARTE 1
        </div>
        <div style={title}>
          {words1.map((w, i) => (
            <LandingWord key={w} delay={14 + i * 5}>
              {w}
            </LandingWord>
          ))}
        </div>
        <div style={{ ...title, marginTop: 8 }}>
          {words2.map((w, i) => (
            <LandingWord key={w} delay={36 + i * 6} style={w === "DINERO" ? { color: color.amber, textShadow: "0 0 40px rgba(238,187,24,0.35)" } : undefined}>
              {w}
            </LandingWord>
          ))}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ── Beat 2 · map network radiating from the OpenAI mark ─────────────────────────────────
const CENTER = { x: 960, y: 590, r: 128 };
const SATELLITES: { def: LogoDef; x: number; y: number }[] = [
  { def: colourLogos.claude, x: 470, y: 330 },
  { def: colourLogos.gemini, x: 1450, y: 318 },
  { def: colourLogos.deepseek, x: 420, y: 820 },
  { def: colourLogos.perplexity, x: 1500, y: 812 },
];
const SAT_R = 82;

const MapLines: React.FC = () => {
  // A stylised street map: a jittered grid of faint roads, plus two thicker arterials.
  const lines: string[] = [];
  for (let i = -2; i < 26; i++) {
    const pts = Array.from({ length: 12 }, (_, k) => {
      const x = k * 200 - 100;
      const y = i * 48 + noise2D("mh", i * 0.7, k * 0.3) * 26;
      return `${k === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`;
    });
    lines.push(pts.join(" "));
  }
  for (let j = -2; j < 44; j++) {
    const pts = Array.from({ length: 8 }, (_, k) => {
      const y = k * 180 - 90;
      const x = j * 48 + noise2D("mv", j * 0.7, k * 0.3) * 26;
      return `${k === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`;
    });
    lines.push(pts.join(" "));
  }
  return (
    <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
      <g stroke={color.bone} fill="none">
        {lines.map((d, i) => (
          <path key={i} d={d} strokeOpacity={random(`ml-${i}`) > 0.8 ? 0.1 : 0.045} strokeWidth={1} />
        ))}
        <path d="M -40 900 C 400 760 700 700 960 590 S 1500 330 1980 260" stroke={color.red} strokeOpacity={0.35} strokeWidth={4} />
        <path d="M 300 -40 C 420 300 600 500 960 590 S 1400 900 1500 1120" stroke={color.amber} strokeOpacity={0.18} strokeWidth={3} />
      </g>
    </svg>
  );
};

const NetworkBeat: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: color.charcoal }}>
      <AbsoluteFill style={{ scale: String(interpolate(frame, [0, BEATS[1]], [1.0, 1.06], clamp)), rotate: "-4deg" }}>
        <MapLines />
      </AbsoluteFill>
      <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 55%, rgba(17,19,22,0) 0%, rgba(17,19,22,0.85) 70%)" }} />
      <AbsoluteFill style={{ scale: String(interpolate(frame, [0, BEATS[1]], [1.0, 1.04], clamp)) }}>
        <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
          {SATELLITES.map((s, i) => {
            const d = `M ${CENTER.x} ${CENTER.y} L ${s.x} ${s.y}`;
            const p = interpolate(frame, [8 + i * 4, 26 + i * 4], [0, 1], { ...clamp, easing: t.ease.land });
            const evo = evolvePath(p, d);
            return (
              <path
                key={i}
                d={d}
                stroke={color.cyan}
                strokeWidth={2}
                strokeOpacity={0.85}
                strokeDasharray={evo.strokeDasharray}
                strokeDashoffset={evo.strokeDashoffset}
              />
            );
          })}
        </svg>
        <div
          style={{
            position: "absolute",
            left: CENTER.x - 330,
            top: CENTER.y - 330,
            width: 660,
            height: 660,
            background: "radial-gradient(circle, rgba(232,226,214,0.30) 0%, rgba(232,226,214,0.08) 40%, rgba(232,226,214,0) 70%)",
            opacity: interpolate(frame, [0, 10], [0, 1], clamp),
          }}
        />
        <div
          style={{
            position: "absolute",
            left: CENTER.x - CENTER.r,
            top: CENTER.y - CENTER.r,
            width: CENTER.r * 2,
            height: CENTER.r * 2,
            borderRadius: "50%",
            background: color.charcoalRaised,
            border: `2px solid rgba(232,226,214,0.55)`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            scale: String(interpolate(frame, [0, 8], [0.9, 1], { ...clamp, easing: t.ease.land })),
            opacity: interpolate(frame, [0, 4], [0, 1], clamp),
          }}
        >
          <Logo def={colourLogos.openai} size={132} />
        </div>
        <div
          style={{
            position: "absolute",
            left: CENTER.x - 200,
            width: 400,
            top: CENTER.y + CENTER.r + 22,
            textAlign: "center",
            fontFamily: font.display,
            fontWeight: 800,
            fontSize: 28,
            letterSpacing: "0.14em",
            color: color.bone,
            opacity: interpolate(frame, [6, 12], [0, 1], clamp),
          }}
        >
          OPENAI · CHATGPT
        </div>
        {SATELLITES.map((s, i) => {
          const d = 22 + i * 4;
          return (
            <div key={s.def.file} style={{ opacity: interpolate(frame, [d, d + 4], [0, 1], clamp) }}>
              <div
                style={{
                  position: "absolute",
                  left: s.x - SAT_R,
                  top: s.y - SAT_R,
                  width: SAT_R * 2,
                  height: SAT_R * 2,
                  borderRadius: "50%",
                  background: color.charcoalRaised,
                  border: `1.5px solid ${color.cyan}AA`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  scale: String(interpolate(frame, [d, d + 6], [0.85, 1], { ...clamp, easing: t.ease.land })),
                }}
              >
                <Logo def={s.def} size={80} />
              </div>
              <div
                style={{
                  position: "absolute",
                  left: s.x - 150,
                  width: 300,
                  top: s.y + SAT_R + 18,
                  textAlign: "center",
                  fontFamily: font.display,
                  fontWeight: 800,
                  fontSize: 24,
                  letterSpacing: "0.14em",
                  color: color.bone,
                }}
              >
                {s.def.name.toUpperCase()}
              </div>
            </div>
          );
        })}
      </AbsoluteFill>
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 92,
          textAlign: "center",
          fontFamily: font.serif,
          fontStyle: "italic",
          fontSize: 42,
          color: color.bone,
          opacity: interpolate(frame, [30, 40], [0, 1], clamp),
        }}
      >
        Cinco empresas. Una misma carrera.
      </div>
    </AbsoluteFill>
  );
};

// ── Beat 3 · "SIN FRENOS" bar → flash → big number with a source footnote ───────────────
// Sample figure, labelled on screen as an example.
const SAMPLE_SPEND_GROWTH = 214;

const MoneyBeat: React.FC = () => {
  const frame = useCurrentFrame();
  const pre = frame < FLASH_AT;
  const bar = interpolate(frame, [4, 9], [0, 1], { ...clamp, easing: t.ease.land });
  const post = frame - FLASH_AT;
  const value = Math.round(interpolate(post, [2, 18], [0, SAMPLE_SPEND_GROWTH], { ...clamp, easing: t.ease.land }));
  const split = interpolate(post, [0, 5], [16, 0], clamp);
  const numStyle: React.CSSProperties = {
    fontFamily: font.display,
    fontWeight: 900,
    fontSize: 300,
    lineHeight: 0.9,
    letterSpacing: "-0.03em",
  };
  const numText = `+${value} %`;
  return (
    <AbsoluteFill>
      <Broll
        file="c2-ticker-machine.mp4"
        duration={BEATS[2]}
        dim={pre ? 0.55 : 0.3}
        from={pre ? 1.06 : 1.16}
        to={pre ? 1.1 : 1.22}
        origin="60% 45%"
      />
      {pre ? (
        <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", flexDirection: "column" }}>
          <div
            style={{
              background: color.amber,
              padding: "6px 64px 0 48px",
              clipPath: `inset(0 ${(1 - bar) * 100}% 0 0)`,
            }}
          >
            <div
              style={{
                fontFamily: font.display,
                fontWeight: 900,
                fontStyle: "italic",
                fontSize: 176,
                lineHeight: 1.05,
                letterSpacing: "-0.01em",
                color: color.black,
                scale: String(interpolate(frame, [6, 10], [1.12, 1], { ...clamp, easing: t.ease.land })),
              }}
            >
              SIN FRENOS
            </div>
          </div>
          <div
            style={{
              marginTop: 40,
              fontFamily: font.serif,
              fontSize: 40,
              color: color.bone,
              textShadow: "0 2px 12px rgba(0,0,0,0.6)",
              opacity: interpolate(frame, [12, 18], [0, 1], clamp),
            }}
          >
            Los algoritmos ya operan sin pedir permiso.
          </div>
        </AbsoluteFill>
      ) : (
        <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", flexDirection: "column" }}>
          <div style={{ fontFamily: font.display, fontWeight: 800, fontSize: 34, letterSpacing: "0.14em", color: color.amber }}>
            GASTO EN IA · EMPRESA TIPO · EN DOS AÑOS
          </div>
          <div style={{ position: "relative", marginTop: 26 }}>
            <div style={{ ...numStyle, color: color.red, position: "absolute", left: -split, top: 0, opacity: split > 0.5 ? 0.8 : 0, mixBlendMode: "screen" }}>
              {numText}
            </div>
            <div style={{ ...numStyle, color: color.cyan, position: "absolute", left: split, top: 0, opacity: split > 0.5 ? 0.8 : 0, mixBlendMode: "screen" }}>
              {numText}
            </div>
            <div style={{ ...numStyle, color: color.bone, position: "relative", scale: String(interpolate(post, [0, 56], [1, 1.04], clamp)) }}>
              {numText}
            </div>
          </div>
          <div
            style={{
              position: "absolute",
              bottom: 118,
              left: 300,
              right: 300,
              background: "rgba(17,19,22,0.9)",
              padding: "20px 30px 22px",
              fontFamily: font.serif,
              fontSize: 31,
              lineHeight: 1.4,
              color: color.bone,
              opacity: interpolate(post, [16, 22], [0, 1], clamp),
            }}
          >
            Cifra ilustrativa para este prototipo, no es una estadística real.{" "}
            <span style={{ color: "rgba(232,226,214,0.6)", fontStyle: "italic" }}>Fuente: </span>
            <span style={{ color: color.amber, textDecoration: "underline", textUnderlineOffset: 5 }}>dato de ejemplo</span>
          </div>
        </AbsoluteFill>
      )}
      <FlashCut at={FLASH_AT} />
    </AbsoluteFill>
  );
};

// ── Beat 4 · lower third ─────────────────────────────────────────────────────────────────
const NameBeat: React.FC = () => {
  const frame = useCurrentFrame();
  const barH = interpolate(frame, [2, 10], [0, 1], { ...clamp, easing: t.ease.land });
  const nameIn = interpolate(frame, [6, 16], [0, 1], { ...clamp, easing: t.ease.land });
  return (
    <AbsoluteFill>
      <Broll file="c1-datacenter-amber.mp4" trimBefore={100} duration={BEATS[3]} dim={0.78} from={1.12} to={1.18} origin="30% 50%" />
      <AbsoluteFill style={{ background: "linear-gradient(0deg, rgba(10,10,11,0.85) 0%, rgba(10,10,11,0) 42%)" }} />
      <div style={{ position: "absolute", left: 150, bottom: 150, display: "flex", gap: 30, alignItems: "stretch" }}>
        <div style={{ width: 8, background: color.amber, scale: `1 ${barH}`, transformOrigin: "bottom" }} />
        <div style={{ overflow: "hidden", paddingRight: 20 }}>
          <div
            style={{
              fontFamily: font.display,
              fontWeight: 800,
              fontSize: 112,
              lineHeight: 1,
              letterSpacing: "-0.015em",
              color: color.bone,
              translate: `${(1 - nameIn) * -105}% 0`,
            }}
          >
            Luisart
          </div>
          <div
            style={{
              marginTop: 12,
              fontFamily: font.serif,
              fontStyle: "italic",
              fontSize: 40,
              color: "rgba(232,226,214,0.85)",
              opacity: interpolate(frame, [14, 22], [0, 1], clamp),
            }}
          >
            IA · finanzas · negocios
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

export const ProtoCDocumental: React.FC = () => {
  const beats = [ChapterBeat, NetworkBeat, MoneyBeat, NameBeat];
  return (
    <AbsoluteFill style={{ background: color.charcoal }}>
      <GateWeave>
        {beats.map((Beat, i) => (
          <Sequence key={i} from={STARTS[i]} durationInFrames={BEATS[i]}>
            <Beat />
          </Sequence>
        ))}
      </GateWeave>
      <Vignette />
      <FilmGrain />
    </AbsoluteFill>
  );
};

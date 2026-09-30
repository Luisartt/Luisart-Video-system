import { AbsoluteFill, Easing, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { DotBoard, Drop, PixelIcon, Sfx, TypeOn, clamp } from "../../styles/pizarra/primitives";
import { piz } from "../../styles/pizarra/theme";

// PRUEBA (2026-09-30): "dos ejemplos lado a lado" copiado del reel After Effects vs Opus 5 (Dd1bdQYugkl):
// mismo contenido en dos tarjetas, etiqueta con sub-rotulo, segunda tarjeta desplazada hacia abajo,
// un color de acento por ejemplo, ambas corren en sincronia y al final se ve cual gana.
// Datos de ejemplo · MXN (no son tasas reales).

const { color, font } = piz;
const W = 440;
const GAP = 60;
const X_A = 70;
const X_B = X_A + W + GAP;
const TILE_H = 330;
const HEAD_H = 106;
const Y_A = 450;
const OFF = 40;
const MONTHS = 12;
const M_START = 70; // frame donde arranca el mes 1
const M_LEN = 14; // frames por mes
const M_END = M_START + MONTHS * M_LEN;

type Side = { key: "a" | "b"; x: number; y: number; accent: string; tint: string; name: string; sub: string; icon: "coin" | "money-bag"; rate: number; at: number };
const SIDES: Side[] = [
  { key: "a", x: X_A, y: Y_A, accent: color.yellow, tint: "#FFF6D6", name: "Cuenta de nómina", sub: "ejemplo A · 1% anual", icon: "coin", rate: 100, at: 20 },
  { key: "b", x: X_B, y: Y_A + OFF, accent: color.accent, tint: color.tint, name: "CETES", sub: "ejemplo B · 7% anual", icon: "money-bag", rate: 700, at: 30 },
];

const Tile: React.FC<{ s: Side }> = ({ s }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = spring({ frame: frame - s.at, fps, config: { damping: 14, stiffness: 170, mass: 0.7 } });
  const month = Math.min(MONTHS, Math.max(0, Math.floor((frame - M_START) / M_LEN) + 1));
  const monthProg = interpolate(frame, [M_START, M_END], [0, MONTHS], clamp);
  const earned = Math.round((s.rate * Math.min(MONTHS, monthProg)) / MONTHS);
  const barMax = 140;
  return (
    <div style={{ position: "absolute", left: s.x, top: s.y, width: W, opacity: Math.min(1, enter * 1.4), transform: `translateY(${(1 - enter) * 40}px)` }}>
      {/* etiqueta: icono + nombre + sub-rotulo desplazado (como "Original"/"Remake") */}
      <div style={{ display: "flex", alignItems: "flex-end", gap: 12, marginBottom: 12, height: 64 }}>
        <div style={{ width: 54, height: 54, background: s.accent, border: `${piz.ui.border}px solid ${color.ink}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <PixelIcon name={s.icon} px={3} />
        </div>
        <div style={{ fontFamily: font.heading, fontWeight: 700, fontSize: 40, color: color.ink, lineHeight: 1 }}>{s.name}</div>
      </div>
      <div style={{ fontFamily: font.hand, fontSize: 30, color: color.handInk, marginTop: -6, marginBottom: 10, textAlign: "right" }}>{s.sub}</div>
      {/* tarjeta */}
      <div style={{ height: TILE_H, background: s.tint, border: `${piz.ui.border}px solid ${color.ink}`, boxShadow: `${piz.ui.hardShadow}px ${piz.ui.hardShadow}px 0 ${piz.ui.shadowColor}`, position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", left: 22, top: 16, fontFamily: font.pixel, fontWeight: 700, fontSize: 28, color: color.ink }}>
          {month === 0 ? "mes 0" : `mes ${month}`}
        </div>
        <div style={{ position: "absolute", left: 22, right: 22, bottom: 120, height: barMax, display: "flex", alignItems: "flex-end", gap: 6 }}>
          {Array.from({ length: MONTHS }).map((_, i) => {
            const startF = M_START + i * M_LEN;
            const val = (s.rate * (i + 1)) / MONTHS;
            const h = interpolate(frame, [startF, startF + 10], [0, (val / 700) * barMax], { ...clamp, easing: Easing.out(Easing.cubic) });
            return <div key={i} style={{ flex: 1, height: Math.max(h, frame >= startF ? 4 : 0), background: s.accent, border: h > 2 ? `3px solid ${color.ink}` : "none", boxSizing: "border-box" }} />;
          })}
        </div>
        <div style={{ position: "absolute", left: 0, right: 0, bottom: 22, textAlign: "center", fontFamily: font.heading, fontWeight: 700, fontSize: 84, color: color.ink, lineHeight: 1 }}>
          +${earned.toLocaleString("en-US")}
        </div>
        <div style={{ position: "absolute", left: 0, right: 0, bottom: 100, height: 0 }} />
      </div>
    </div>
  );
};

/** Ovalo de marcador que se dibuja alrededor del numero ganador. */
const Circle: React.FC<{ at: number }> = ({ at }) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [at, at + 18], [0, 1], { ...clamp, easing: Easing.out(Easing.quad) });
  const w = 420;
  const h = 130;
  const len = 1400;
  const cx = X_B + W / 2;
  const cy = Y_A + OFF + HEAD_H + TILE_H - 22 - 44;
  return (
    <svg width={w} height={h} style={{ position: "absolute", left: cx - w / 2, top: cy - h / 2 }} viewBox={`0 0 ${w} ${h}`}>
      <path
        d={`M ${w * 0.5} 8 C ${w * 0.95} 2, ${w - 4} ${h - 8}, ${w * 0.5} ${h - 6} C 14 ${h}, 0 14, ${w * 0.42} 6`}
        fill="none"
        stroke={color.accentDark}
        strokeWidth={7}
        strokeLinecap="round"
        strokeDasharray={len}
        strokeDashoffset={len * (1 - p)}
      />
    </svg>
  );
};

export const DosEjemplos: React.FC = () => {
  const frame = useCurrentFrame();
  const winAt = M_END + 8;
  const textAt = winAt + 30;
  return (
    <AbsoluteFill>
      <DotBoard />
      {/* titulo */}
      <div style={{ position: "absolute", left: 70, top: 262, width: 940 }}>
        <TypeOn text="Mismo dinero, dos decisiones" at={2} color={color.ink} fontSize={78} align="left" />
      </div>
      <Sfx kind="type" at={2} frames={28} />
      {SIDES.map((s) => (
        <Tile key={s.key} s={s} />
      ))}
      <Sfx kind="pop" at={20} />
      <Sfx kind="pop" at={30} />
      {frame >= winAt ? <Circle at={winAt} /> : null}
      <Sfx kind="pop" at={winAt} />
      <Drop at={winAt + 16} px={14}>
        <div style={{ position: "absolute", left: X_B + 60, top: Y_A + OFF + HEAD_H + TILE_H + 16, whiteSpace: "nowrap", fontFamily: font.hand, fontSize: 64, color: color.accentDark, transform: "rotate(-6deg)" }}>¡7 veces más!</div>
      </Drop>
      {/* bloque de texto inferior (como el del reel, pero dentro de la zona segura) */}
      <div style={{ position: "absolute", left: 70, top: 1090, width: 820 }}>
        <Drop at={textAt} px={16}>
          <div style={{ fontFamily: font.heading, fontWeight: 700, fontSize: 64, color: color.ink, lineHeight: 1.08 }}>
            Los mismos <span style={{ color: color.accent }}>$10,000 MXN</span>. El mismo año.
          </div>
        </Drop>
        <Drop at={textAt + 14} px={16}>
          <div style={{ fontFamily: font.heading, fontWeight: 700, fontSize: 64, color: color.ink, lineHeight: 1.08, marginTop: 14 }}>Solo cambió dónde los pusiste.</div>
        </Drop>
        <Drop at={textAt + 30} px={10}>
          <div style={{ fontFamily: font.hand, fontSize: 44, color: color.muted, marginTop: 22 }}>dato de ejemplo · MXN</div>
        </Drop>
      </div>
    </AbsoluteFill>
  );
};
export const dosEjemplosDuration = 360;

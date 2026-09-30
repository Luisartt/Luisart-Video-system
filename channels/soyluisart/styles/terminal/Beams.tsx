import { evolvePath, getLength } from "@remotion/paths";
import { interpolate } from "remotion";
import { z } from "zod";
import { term } from "./theme";
import { backingField, clamp, CornerTicks, Decrypt, Exit, LogoNode, logoName, Panel, safeGuideField, Tag, TermStage, useBacking, useLayout, useLife, zLogo, type LogoKey, sfxField, TSfx } from "./primitives";

// Animated beams: AI logos wired to a central labelled node, comets of light travelling along
// the wires and the node flashing as they land. From the prototype's BeamsBeat. Everything sits
// inside one opaque panel, so the beam glow never touches the green.

export const beamsSchema = z.object({
  backing: backingField,
  safeGuide: safeGuideField,
  sfx: sfxField,
  duration: z.number().min(2).max(10).default(5),
  layout: z.enum(["fan", "versus"]),
  align: z.enum(["left", "center", "right"]),
  chapter: z.string(),
  tag: z.string(),
  headline: z.string(),
  logos: z.array(zLogo).min(1).max(6).describe("fan: 1–6 logos; versus: los dos primeros"),
  hubTag: z.string(),
  hubLabel: z.string(),
});
export type BeamsProps = z.infer<typeof beamsSchema>;

const base: BeamsProps = {
  backing: "green",
  safeGuide: false, sfx: true,
  duration: 5,
  layout: "fan",
  align: "center",
  chapter: "02",
  tag: "Herramientas",
  headline: "Tres modelos. Un solo destino.",
  logos: ["chatgpt", "claude", "gemini"],
  hubTag: "[Nodo_00] Destino",
  hubLabel: "Tu negocio",
};

export const beamsVariants: Record<string, BeamsProps> = {
  "3-logos": base,
  "5-logos": { ...base, headline: "Cinco modelos. Un solo destino.", logos: ["chatgpt", "claude", "gemini", "perplexity", "deepseek"] },
  versus: {
    ...base,
    layout: "versus",
    tag: "Comparativa",
    headline: "Dos modelos, una pregunta.",
    logos: ["chatgpt", "claude"],
    hubTag: "[VS] Duelo",
    hubLabel: "¿Cuál gana?",
  },
};

const W = 1320;
const H = 720;
const H_VS = 560; // versus needs less height
const HEAD_H = 170;
const PERIOD = 28;
const TRAVEL = 20;
const SEG = 150;

type Beam = { d: string; len: number; draw: [number, number]; comet: number };

const BeamPaths: React.FC<{ beams: Beam[] }> = ({ beams }) => {
  const { frame } = useLife();
  const c = term.color;
  const green = useBacking() === "green";
  return (
    <svg width={1400} height={1200} style={{ position: "absolute", left: 0, top: 0 }}>
      <defs>
        <filter id="t-beam-glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation={green ? 3 : 5} result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      {beams.map((b, i) => {
        const draw = interpolate(frame, b.draw, [0, 1], { ...clamp, easing: term.ease.inOut });
        const evo = evolvePath(draw, b.d);
        const local = frame - b.comet;
        const phase = local < 0 ? -1 : local % PERIOD;
        const offset = phase >= 0 && phase <= TRAVEL ? interpolate(phase, [0, TRAVEL], [SEG, -b.len]) : SEG;
        return (
          <g key={i}>
            <path d={b.d} fill="none" stroke={c.hairlineBright} strokeWidth={2} strokeDasharray={evo.strokeDasharray} strokeDashoffset={evo.strokeDashoffset} />
            <path
              d={b.d}
              fill="none"
              stroke={c.blue}
              strokeWidth={4}
              strokeLinecap="round"
              strokeDasharray={`${SEG} ${b.len + SEG}`}
              strokeDashoffset={offset}
              filter="url(#t-beam-glow)"
            />
            <path
              d={b.d}
              fill="none"
              stroke={c.ice}
              strokeWidth={1.5}
              strokeLinecap="round"
              strokeDasharray={`${SEG * 0.4} ${b.len + SEG}`}
              strokeDashoffset={offset - SEG * 0.6}
            />
          </g>
        );
      })}
    </svg>
  );
};

const Hub: React.FC<{ x: number; y: number; w: number; h: number; pulse: number; tag: string; label: string; centered?: boolean }> = ({
  x,
  y,
  w,
  h,
  pulse,
  tag,
  label,
  centered,
}) => {
  const c = term.color;
  return (
    <div
      style={{
        position: "absolute",
        left: x - w / 2,
        top: y - h / 2,
        width: w,
        height: h,
        boxSizing: "border-box",
        background: c.panel,
        border: `1px solid ${pulse > 0.05 ? c.blue : c.hairlineBright}`,
        boxShadow: `0 0 ${24 + pulse * 40}px ${c.blue}${Math.round(40 + pulse * 80).toString(16).padStart(2, "0")}`,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: centered ? "center" : "flex-start",
        paddingLeft: centered ? 0 : 36,
      }}
    >
      <CornerTicks size={20} c={c.ice} />
      <Tag size={15}>{tag}</Tag>
      <div style={{ marginTop: 8, fontFamily: term.font.display, fontWeight: 700, fontSize: 54, letterSpacing: "-0.03em", color: c.text, whiteSpace: "nowrap" }}>
        <Decrypt text={label} start={8} perChar={1} scramble={6} />
      </div>
    </div>
  );
};

const pulseAt = (frame: number, comets: number[]) =>
  Math.max(
    0,
    ...comets.map((s) => {
      const since = frame - s - TRAVEL;
      if (since < 0) return 0;
      return Math.max(0, 1 - (since % PERIOD) / 10);
    }),
  );

const nodeFlicker = (frame: number, i: number) => frame >= i && frame !== i && frame !== i + 2;

const Fan: React.FC<{ logos: LogoKey[]; hubTag: string; hubLabel: string }> = ({ logos, hubTag, hubLabel }) => {
  const { frame } = useLife();
  const n = logos.length;
  const areaTop = HEAD_H + 10;
  const areaBot = H - 50;
  // Node size shrinks with the count so nodes never touch (≥ 14 px apart).
  const NODE = Math.min(116, Math.floor((areaBot - areaTop) / n - 14));
  const cy = (areaTop + areaBot) / 2;
  const gap = Math.min(150, (areaBot - areaTop - NODE) / Math.max(1, n - 1));
  const baseX = 270;
  const nodes = logos.map((id, i) => {
    const t = n === 1 ? 0 : (i / (n - 1)) * 2 - 1; // -1..1
    return { id, x: baseX + t * t * 80, y: cy + (i - (n - 1) / 2) * gap };
  });
  const hub = { x: W - 270, y: cy, w: 400, h: 164 };
  const hubLeft = hub.x - hub.w / 2;
  const beams: Beam[] = nodes.map((nd, i) => {
    const x0 = nd.x + NODE / 2;
    const d = `M ${x0} ${nd.y} C ${x0 + 260} ${nd.y} ${hubLeft - 260} ${hub.y} ${hubLeft} ${hub.y}`;
    return { d, len: getLength(d), draw: [10 + i * 3, 24 + i * 3], comet: 30 + i * 4 };
  });
  const pulse = pulseAt(frame, beams.map((b) => b.comet));
  return (
    <>
      <BeamPaths beams={beams} />
      {nodes.map((nd, i) => (
        <div key={`${nd.id}-${i}`} style={{ visibility: nodeFlicker(frame, i) ? "visible" : "hidden" }}>
          <LogoNode logo={nd.id} size={NODE} style={{ left: nd.x - NODE / 2, top: nd.y - NODE / 2 }} />
          <Tag size={17} c={term.color.ice} style={{ position: "absolute", right: W - (nd.x - NODE / 2 - 22), top: nd.y - 12 }}>
            {logoName(nd.id)}
          </Tag>
        </div>
      ))}
      <div style={{ visibility: frame >= 1 ? "visible" : "hidden" }}>
        <Hub {...hub} pulse={pulse} tag={hubTag} label={hubLabel} />
      </div>
    </>
  );
};

const Versus: React.FC<{ logos: LogoKey[]; hubTag: string; hubLabel: string }> = ({ logos, hubTag, hubLabel }) => {
  const { frame } = useLife();
  const c = term.color;
  const NODE = 150;
  const cy = HEAD_H + (H_VS - HEAD_H) / 2 - 30;
  const sides = [
    { id: logos[0] ?? "chatgpt", x: 230, dir: 1 },
    { id: logos[1] ?? logos[0] ?? "claude", x: W - 230, dir: -1 },
  ];
  const hub = { x: W / 2, y: cy, w: 330, h: 150 };
  const beams: Beam[] = [];
  sides.forEach((s, si) => {
    const x0 = s.x + (s.dir * NODE) / 2;
    const x1 = hub.x - (s.dir * hub.w) / 2;
    [-44, 0, 44].forEach((dy, k) => {
      const y0 = cy + dy;
      const y1 = cy + dy * 0.35;
      const mid = (x0 + x1) / 2;
      const d = `M ${x0} ${y0} C ${mid} ${y0} ${mid} ${y1} ${x1} ${y1}`;
      beams.push({ d, len: getLength(d), draw: [10 + k * 3, 24 + k * 3], comet: 30 + si * 14 + k * 4 });
    });
  });
  const pulse = pulseAt(frame, beams.map((b) => b.comet));
  return (
    <>
      <BeamPaths beams={beams} />
      {sides.map((s, i) => (
        <div key={i} style={{ visibility: nodeFlicker(frame, i) ? "visible" : "hidden" }}>
          <LogoNode logo={s.id} size={NODE} style={{ left: s.x - NODE / 2, top: cy - NODE / 2 }} />
          <div style={{ position: "absolute", left: s.x - 200, width: 400, top: cy + NODE / 2 + 22, textAlign: "center" }}>
            <div style={{ fontFamily: term.font.display, fontWeight: 700, fontSize: 40, letterSpacing: "-0.03em", color: c.text }}>
              <Decrypt text={logoName(s.id)} start={6 + i * 4} perChar={1} scramble={6} />
            </div>
            <Tag size={15} c={c.muted} style={{ marginTop: 6 }}>
              [{i === 0 ? "A" : "B"}] {i === 0 ? "Izquierda" : "Derecha"}
            </Tag>
          </div>
        </div>
      ))}
      <div style={{ visibility: frame >= 1 ? "visible" : "hidden" }}>
        <Hub {...hub} pulse={pulse} tag={hubTag} label={hubLabel} centered />
      </div>
    </>
  );
};

// ── Vertical (1080×1920): logos in a row on top beaming down into the node; versus as a column.
// The panel is the graphics zone (800 × 720 from y 250), so both layouts are compact.
const VH = 720;
const VH_VS = 720;
const HEAD_V = 200;

const VFan: React.FC<{ logos: LogoKey[]; hubTag: string; hubLabel: string; vw: number }> = ({ logos, hubTag, hubLabel, vw }) => {
  const { frame } = useLife();
  const n = logos.length;
  const cell = (vw - 64) / n;
  const NODE = Math.min(116, Math.floor(cell - 26));
  const nodes = logos.map((id, i) => {
    const t = n === 1 ? 0 : (i / (n - 1)) * 2 - 1;
    return { id, x: 32 + (i + 0.5) * cell, y: HEAD_V + 50 + NODE / 2 + t * t * 30 };
  });
  const hub = { x: vw / 2, y: VH - 40 - 75, w: Math.min(520, vw - 120), h: 150 };
  const hubTop = hub.y - hub.h / 2;
  const beams: Beam[] = nodes.map((nd, i) => {
    const y0 = nd.y + NODE / 2;
    const k = (hubTop - y0) * 0.55;
    const d = `M ${nd.x} ${y0} C ${nd.x} ${y0 + k} ${hub.x} ${hubTop - k} ${hub.x} ${hubTop}`;
    return { d, len: getLength(d), draw: [10 + i * 3, 24 + i * 3], comet: 30 + i * 4 };
  });
  const pulse = pulseAt(frame, beams.map((b) => b.comet));
  return (
    <>
      <BeamPaths beams={beams} />
      {nodes.map((nd, i) => (
        <div key={`${nd.id}-${i}`} style={{ visibility: nodeFlicker(frame, i) ? "visible" : "hidden" }}>
          <LogoNode logo={nd.id} size={NODE} style={{ left: nd.x - NODE / 2, top: nd.y - NODE / 2 }} />
          <Tag size={n > 4 ? 14 : 16} c={term.color.ice} style={{ position: "absolute", left: nd.x - cell / 2, width: cell, textAlign: "center", top: nd.y - NODE / 2 - 34, letterSpacing: "0.04em" }}>
            {logoName(nd.id)}
          </Tag>
        </div>
      ))}
      <div style={{ visibility: frame >= 1 ? "visible" : "hidden" }}>
        <Hub {...hub} pulse={pulse} tag={hubTag} label={hubLabel} centered />
      </div>
    </>
  );
};

const VVersus: React.FC<{ logos: LogoKey[]; hubTag: string; hubLabel: string; vw: number }> = ({ logos, hubTag, hubLabel, vw }) => {
  const { frame } = useLife();
  const c = term.color;
  const NODE = 116;
  const x = vw / 2 - 150;
  const sides = [
    { id: logos[0] ?? "chatgpt", y: HEAD_V + 30 + NODE / 2, dir: 1 },
    { id: logos[1] ?? logos[0] ?? "claude", y: VH_VS - 30 - NODE / 2, dir: -1 },
  ];
  const hub = { x: vw / 2, y: (sides[0].y + sides[1].y) / 2, w: Math.min(520, vw - 120), h: 140 };
  const beams: Beam[] = [];
  sides.forEach((s, si) => {
    const y0 = s.y + (s.dir * NODE) / 2;
    const y1 = hub.y - (s.dir * hub.h) / 2;
    [-44, 0, 44].forEach((dx, k) => {
      const x0 = x + dx;
      const x1 = hub.x + dx * 0.35;
      const mid = (y0 + y1) / 2;
      const d = `M ${x0} ${y0} C ${x0} ${mid} ${x1} ${mid} ${x1} ${y1}`;
      beams.push({ d, len: getLength(d), draw: [10 + k * 3, 24 + k * 3], comet: 30 + si * 14 + k * 4 });
    });
  });
  const pulse = pulseAt(frame, beams.map((b) => b.comet));
  return (
    <>
      <BeamPaths beams={beams} />
      {sides.map((s, i) => (
        <div key={i} style={{ visibility: nodeFlicker(frame, i) ? "visible" : "hidden" }}>
          <LogoNode logo={s.id} size={NODE} style={{ left: x - NODE / 2, top: s.y - NODE / 2 }} />
          <div style={{ position: "absolute", left: x + NODE / 2 + 28, top: s.y - 40 }}>
            <div style={{ fontFamily: term.font.display, fontWeight: 700, fontSize: 52, letterSpacing: "-0.03em", color: c.text, whiteSpace: "nowrap" }}>
              <Decrypt text={logoName(s.id)} start={6 + i * 4} perChar={1} scramble={6} />
            </div>
            <Tag size={17} c={c.muted} style={{ marginTop: 6 }}>
              [{i === 0 ? "A" : "B"}] {i === 0 ? "Arriba" : "Abajo"}
            </Tag>
          </div>
        </div>
      ))}
      <div style={{ visibility: frame >= 1 ? "visible" : "hidden" }}>
        <Hub {...hub} pulse={pulse} tag={hubTag} label={hubLabel} centered />
      </div>
    </>
  );
};

export const Beams: React.FC<BeamsProps> = (p) => {
  const { frame } = useLife();
  const L = useLayout();
  const tick = interpolate(frame, [0, 8], [0, 1], { ...clamp, easing: term.ease.snap });
  const vs = p.layout === "versus";
  const w = L.v ? L.zones.graphics.w : W;
  const h = L.v ? (vs ? VH_VS : VH) : vs ? H_VS : H;
  const left = L.v ? L.zones.graphics.x : p.align === "left" ? term.margin : p.align === "right" ? 1920 - term.margin - W : (1920 - W) / 2;
  const top = L.v ? L.zones.graphics.y : (1080 - h) / 2;
  const sub = { logos: p.logos, hubTag: p.hubTag, hubLabel: p.hubLabel };
  // First comet reaches the hub at 30 + TRAVEL (both layouts start their first comet at 30).
  const sound = (
    <>
      <TSfx kind="loading" at={0} frames={30} on={p.sfx} />
      <TSfx kind="techSelect" at={1} on={p.sfx} />
      <TSfx kind="optionSelect" at={30 + TRAVEL} on={p.sfx} />
    </>
  );
  return (
    <TermStage backing={p.backing} safeGuide={p.safeGuide}>
      <Exit style={{ left, top, width: w, height: h }}>
        <Panel tick={tick} tickSize={22} style={{ width: w, height: h }}>
          <div style={{ position: "absolute", left: 48, top: 44, right: L.v ? 48 : undefined }}>
            <Tag>
              [{p.chapter}] {p.tag}
            </Tag>
            <div
              style={{
                marginTop: 14,
                fontFamily: term.font.display,
                fontWeight: 700,
                fontSize: L.v ? 52 : 56,
                lineHeight: L.v ? 1.02 : undefined,
                letterSpacing: "-0.03em",
                color: term.color.text,
                whiteSpace: L.v ? "normal" : "nowrap",
              }}
            >
              <Decrypt text={p.headline} start={0} perChar={0.5} scramble={5} />
            </div>
          </div>
          {L.v ? (
            vs ? <VVersus {...sub} vw={w} /> : <VFan {...sub} vw={w} />
          ) : vs ? (
            <Versus {...sub} />
          ) : (
            <Fan {...sub} />
          )}
        </Panel>
      </Exit>
      {sound}
    </TermStage>
  );
};
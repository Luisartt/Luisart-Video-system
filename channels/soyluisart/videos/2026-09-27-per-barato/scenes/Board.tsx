import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { CornerTicks, Decrypt } from "../../../prototypes/b/components";
import { themeB as t } from "../../../prototypes/b/theme";
import { A, B as CoB, money, num, pu } from "./figures";
import { C, F, Life, Mono, Panel, Stamp, clamp, ramp } from "./parts";

// Claudia's "pizarra" rebuilt as a Terminal board: near-black with a hairline grid and corner
// ticks, the formula card, companies A and B filling in on their words, and the speaker in a
// framed picture-in-picture card (removed in v2: the board is graphics only). v3: no plates behind
// text (the example chip and the takeaway strip are plain text; values decrypt as plain mono type
// instead of split-flap tiles); figures come from figures.ts.

export type BoardTimes = {
  inF: number;
  outF: number;
  formula: number;
  precioHi: number;
  utilHi: number;
  aHead: number;
  aPrice: number;
  aEps: number;
  aPU: number;
  bHead: number;
  bPrice: number;
  bEps: number;
  bPU: number;
  segunda: number;
  cara: number;
  aunque: number;
};

const W = 1080;
const H = 1920;
const L = 120; // safe left
const R = 920; // safe right edge
const WIPE = 8;

// Layout (all inside the vertical safe box 120…920 × 250…1436).
export const BOARD_LAYOUT = {
  tagTop: 262,
  formula: { top: 314, h: 224 },
  cols: { top: 562, h: 580, w: 390, gap: 20 },
  lower: { top: 1190 },
  caption: { left: L, width: R - L, bottom: 1920 - 1416 },
};
const B = BOARD_LAYOUT;

const Grid: React.FC = () => {
  const g = t.grid;
  return (
    <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
      <defs>
        <pattern id="per-grid" width={g} height={g} patternUnits="userSpaceOnUse" x={12} y={0}>
          <path d={`M ${g} 0 L 0 0 0 ${g}`} fill="none" stroke={C.hairline} strokeWidth={1} />
        </pattern>
      </defs>
      <rect x={0} y={0} width={W} height={H} fill="url(#per-grid)" opacity={0.8} />
    </svg>
  );
};

/** Value that flips (scrambles) a few frames early and locks on its word — plain type, no tiles. */
const Flap: React.FC<{ text: string; at: number; c?: string }> = ({ text, at, c = C.text }) => (
  <div style={{ fontFamily: F.mono, fontWeight: 700, fontSize: 64, lineHeight: 1.2, letterSpacing: "0.02em", color: c, height: 82 }}>
    <Decrypt text={text} start={at - 4} perChar={1} scramble={3} scrambleColor={C.ice} />
  </div>
);

const Row: React.FC<{ label: string; value: string; at: number; c?: string }> = ({ label, value, at, c }) => {
  const frame = useCurrentFrame();
  const on = frame >= at - 4;
  return (
    <div style={{ padding: "16px 22px 0", opacity: on ? 1 : 0.35 }}>
      <Mono size={22} c={C.muted} style={{ marginBottom: 10 }}>
        {label}
      </Mono>
      {on ? <Flap text={value} at={at} c={c} /> : <div style={{ height: 82, fontFamily: F.mono, fontSize: 44, color: C.hairlineBright }}>—</div>}
    </div>
  );
};

const Column: React.FC<{
  x: number;
  letter: string;
  head: number;
  price: [string, number];
  eps: [string, number];
  pu: [string, number];
  puColor: string;
  hot?: number;
}> = ({ x, letter, head, price, eps, pu, puColor, hot }) => {
  const frame = useCurrentFrame();
  const hotP = hot !== undefined ? ramp(frame, hot, 6) : 0;
  const puP = ramp(frame, pu[1], 5);
  const border = hotP > 0 ? C.loss : C.hairlineBright;
  return (
    <Life inF={head} outF={1e6} style={{ left: x, top: B.cols.top, width: B.cols.w, height: B.cols.h }}>
      <Panel style={{ width: "100%", height: "100%" }} border={border} tick={hotP > 0 ? C.loss : C.ice}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 14, padding: "20px 22px 16px", borderBottom: `1px solid ${C.hairline}` }}>
          <Mono size={26} c={C.blue}>
            [{letter}]
          </Mono>
          <div style={{ fontFamily: F.display, fontWeight: 700, fontSize: 50, letterSpacing: "-0.03em", color: C.text, lineHeight: 1 }}>
            Empresa {letter}
          </div>
        </div>
        <Row label="Precio por acción" value={price[0]} at={price[1]} />
        <Row label="Utilidad / acción" value={eps[0]} at={eps[1]} />
        <div style={{ position: "absolute", left: 22, right: 22, bottom: 26, borderTop: `1px solid ${C.hairline}`, paddingTop: 12 }}>
          <Mono size={22} c={C.muted}>
            Múltiplo P/U
          </Mono>
          <div
            style={{
              fontFamily: F.display,
              fontWeight: 800,
              fontSize: 150,
              lineHeight: 1,
              letterSpacing: "-0.05em",
              marginTop: 4,
              color: frame >= pu[1] ? puColor : C.hairlineBright,
              scale: frame >= pu[1] ? interpolate(puP, [0, 1], [1.35, 1]) : 1,
              transformOrigin: "left center",
            }}
          >
            {frame >= pu[1] ? pu[0] : "—"}
          </div>
        </div>
      </Panel>
    </Life>
  );
};

export const Board: React.FC<{ tm: BoardTimes }> = ({ tm }) => {
  const frame = useCurrentFrame();
  if (frame < tm.inF || frame >= tm.outF) return null;
  const inP = interpolate(frame, [tm.inF, tm.inF + WIPE], [0, 100], { ...clamp, easing: t.ease.inOut });
  const outP = interpolate(frame, [tm.outF - WIPE, tm.outF], [0, 100], { ...clamp, easing: t.ease.inOut });
  const clip = `polygon(0% ${outP}%, 100% ${outP}%, 100% ${inP}%, 0% ${inP}%)`;
  const edge = frame < tm.inF + WIPE ? inP : frame >= tm.outF - WIPE ? outP : null;
  const colA = L;
  const colB = L + B.cols.w + B.cols.gap;
  const fx = ramp(frame, tm.formula, 6);
  const hi = (at: number) => (frame >= at ? C.ice : C.text);

  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ clipPath: clip }}>
        <AbsoluteFill style={{ background: `radial-gradient(ellipse 85% 60% at 50% 48%, #0E1A33 0%, #08101F 45%, ${C.bg} 100%)` }} />
        <Grid />
        <div style={{ position: "absolute", left: 48, top: 48, right: 48, bottom: 48, border: `1px solid ${C.hairline}` }}>
          <CornerTicks size={26} />
        </div>

        {/* Header */}
        <div style={{ position: "absolute", left: L, top: B.tagTop, width: R - L, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Mono size={26} c={C.orange}>
            <Decrypt text="[02] MÚLTIPLO P/U" start={tm.inF + 4} perChar={0.6} scramble={5} />
          </Mono>
          {frame >= tm.aHead ? (
            <div style={{ opacity: ramp(frame, tm.aHead, 6) }}>
              <Mono size={22}>[Dato de ejemplo]</Mono>
            </div>
          ) : null}
        </div>

        {/* Formula card: lands on "múltiplo" */}
        <Life inF={tm.formula} outF={1e6} style={{ left: L, top: B.formula.top, width: R - L, height: B.formula.h }}>
          <Panel style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", gap: 20, padding: "0 34px" }}>
            <div style={{ fontFamily: F.display, fontWeight: 800, fontSize: 132, letterSpacing: "-0.05em", color: C.blue, lineHeight: 1 }}>
              <Decrypt text="P/U" start={tm.formula} perChar={1} scramble={5} />
            </div>
            <div style={{ fontFamily: F.display, fontWeight: 600, fontSize: 88, color: C.muted, opacity: fx }}>=</div>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", opacity: fx }}>
              <div style={{ fontFamily: F.display, fontWeight: 700, fontSize: 60, letterSpacing: "-0.03em", color: hi(tm.precioHi), lineHeight: 1.1 }}>Precio</div>
              <div style={{ width: 430, height: 3, background: C.ice, margin: "10px 0", scale: `${ramp(frame, tm.formula + 3, 8)} 1` }} />
              <div style={{ fontFamily: F.display, fontWeight: 700, fontSize: 45, letterSpacing: "-0.03em", color: hi(tm.utilHi), lineHeight: 1.1 }}>
                Utilidad por acción
              </div>
            </div>
          </Panel>
        </Life>

        {/* Companies A and B */}
        <Column x={colA} letter="A" head={tm.aHead} price={[money(A.price), tm.aPrice]} eps={[money(A.eps), tm.aEps]} pu={[num(pu(A)), tm.aPU]} puColor={C.ice} />
        <Column
          x={colB}
          letter="B"
          head={tm.bHead}
          price={[money(CoB.price), tm.bPrice]}
          eps={[money(CoB.eps), tm.bEps]}
          pu={[num(pu(CoB)), tm.bPU]}
          puColor={frame >= tm.cara ? C.loss : C.text}
          hot={tm.segunda}
        />
        <Stamp text="MÁS CARA" at={tm.cara} size={50} rotate={-6} style={{ left: colB + 60, top: B.cols.top + B.cols.h - 34 }} />
        {/* The one-line takeaway: price vs multiple (plain text, no strip behind it) */}
        <Life inF={tm.aunque} outF={1e6} style={{ left: L, top: B.lower.top, width: R - L }}>
          <Mono size={24} c={C.orange} style={{ marginBottom: 12 }}>
            [!] Precio ≠ caro o barato
          </Mono>
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
            {[
              ["Precio", money(A.price), money(CoB.price), C.text],
              ["P/U", num(pu(A)), num(pu(CoB)), C.loss],
            ].map(([k, a, b, cb]) => (
              <div key={k} style={{ display: "flex", alignItems: "baseline", gap: 14 }}>
                <Mono size={24} c={C.muted}>
                  {k}
                </Mono>
                <div style={{ fontFamily: F.mono, fontWeight: 700, fontSize: 48, color: C.ice }}>{a}</div>
                <div style={{ fontFamily: F.mono, fontSize: 32, color: C.muted }}>vs</div>
                <div style={{ fontFamily: F.mono, fontWeight: 700, fontSize: 48, color: cb }}>{b}</div>
              </div>
            ))}
          </div>
        </Life>
      </AbsoluteFill>
      {edge !== null ? <div style={{ position: "absolute", left: 0, right: 0, top: (edge / 100) * H - 1, height: 2, background: C.ice }} /> : null}
    </AbsoluteFill>
  );
};

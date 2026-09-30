import { evolvePath } from "@remotion/paths";
import { interpolate } from "remotion";
import { z } from "zod";
import { term } from "./theme";
import { backingField, clamp, CornerTicks, Exit, outlineText, safeGuideField, Tag, TermStage, TypeLine, useLayout, useLife, sfxField, TSfx, upperKeepName } from "./primitives";

// Bracket highlight: corner ticks snap out around a region of the frame, then a frame line
// (box) or an underline with end ticks (underline) draws, with a typed mono label. The region
// itself stays empty, so the recording shows through after keying.
// 2026-09-27 (user rule, no chips/plates behind text): the label and the size readout are plain
// mono text with the thin opaque outline painted under the letters (outlineText).

export const calloutSchema = z.object({
  backing: backingField,
  safeGuide: safeGuideField,
  sfx: sfxField,
  duration: z.number().min(2).max(10).default(4),
  mode: z.enum(["box", "underline"]),
  x: z.number().describe("Región: esquina superior izquierda (px del lienzo: 1920×1080 o 1080×1920)"),
  y: z.number(),
  w: z.number().min(20),
  h: z.number().min(10),
  label: z.string(),
  readout: z.boolean().describe("Muestra las medidas de la región en mono"),
  accent: z.enum(["ice", "blue", "orange"]),
});
export type CalloutProps = z.infer<typeof calloutSchema>;

const base: CalloutProps = {
  backing: "green",
  safeGuide: false, sfx: true,
  duration: 4,
  mode: "box",
  x: 1060,
  y: 250,
  w: 640,
  h: 380,
  label: "[01] Mira esto",
  readout: true,
  accent: "ice",
};

export const calloutVariants: Record<string, CalloutProps> = {
  box: base,
  underline: { ...base, mode: "underline", x: 980, y: 640, w: 760, h: 90, label: "[02] La cifra clave", accent: "blue" },
};

/** Region defaults for the vertical canvas: inside the graphics zone (y 250–970), labels included. */
export const calloutVerticalRegions: Record<string, Pick<CalloutProps, "x" | "y" | "w" | "h">> = {
  box: { x: 170, y: 390, w: 700, h: 470 },
  underline: { x: 170, y: 700, w: 700, h: 110 },
};

export const Callout: React.FC<CalloutProps> = (p) => {
  const { frame } = useLife();
  const L = useLayout();
  const c = term.color;
  const accent = c[p.accent];
  const tick = interpolate(frame, [0, 8], [0, 1], { ...clamp, easing: term.ease.snap });
  const draw = interpolate(frame, [6, 20], [0, 1], { ...clamp, easing: term.ease.inOut });
  const pad = 4;
  const labelIn = frame >= 10;
  const chip = (
    <div style={{ visibility: labelIn ? "visible" : "hidden" }}>
      <Tag size={18} c={c.orange} style={outlineText(24)}>
        <TypeLine text={upperKeepName(p.label)} start={10} cps={2} cursorUntil={0} style={{ display: "inline" }} />
      </Tag>
    </div>
  );
  const readout = p.readout ? (
    <div style={{ visibility: frame >= 18 ? "visible" : "hidden" }}>
      <Tag size={14} c={c.ice} style={outlineText(20)}>
        {Math.round(p.w)}×{Math.round(p.h)} · x{Math.round(p.x)} y{Math.round(p.y)}
      </Tag>
    </div>
  ) : null;

  const sound = (
    <>
      <TSfx kind="keys" at={10} frames={Math.ceil(p.label.length / 2)} volume={0.2} on={p.sfx} />
      <TSfx kind="clickDigital" at={20} on={p.sfx} />
    </>
  );

  if (p.mode === "box") {
    const W = p.w + pad * 2;
    const H = p.h + pad * 2;
    const rect = `M 1 1 H ${W - 1} V ${H - 1} H 1 Z`;
    const evo = evolvePath(draw, rect);
    return (
      <TermStage backing={p.backing} safeGuide={p.safeGuide}>
        <Exit style={{ left: p.x - pad, top: p.y - pad, width: W, height: H }}>
          <svg width={W} height={H} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
            <path d={rect} fill="none" stroke={accent} strokeWidth={2} strokeDasharray={evo.strokeDasharray} strokeDashoffset={evo.strokeDashoffset} />
          </svg>
          <CornerTicks size={34} p={tick} c={accent} weight={4} inset={-8} />
          <div style={{ position: "absolute", left: -8, bottom: H + 14 }}>{chip}</div>
          {readout ? <div style={{ position: "absolute", right: -8, top: H + 14 }}>{readout}</div> : null}
        </Exit>
        {sound}
    </TermStage>
    );
  }

  // Underline: a thick line under the region with vertical end ticks, label below.
  const lineY = p.y + p.h + 10;
  const len = p.w * draw;
  return (
    <TermStage backing={p.backing} safeGuide={p.safeGuide}>
      <Exit style={{ left: p.x, top: lineY - 12, width: p.w, height: 24 }}>
        <div style={{ position: "absolute", left: 0, top: 10, width: len, height: 5, background: accent }} />
        <div style={{ position: "absolute", left: 0, top: 12 - 14 * tick, width: 3, height: 28 * tick, background: c.ice }} />
        <div style={{ position: "absolute", right: 0, top: 12 - 14 * tick, width: 3, height: 28 * tick, background: c.ice, visibility: draw >= 1 ? "visible" : "hidden" }} />
        <div style={{ position: "absolute", left: 0, top: 40 }}>{chip}</div>
        {readout ? <div style={{ position: "absolute", right: 0, top: 40 }}>{readout}</div> : null}
      </Exit>
      {sound}
    </TermStage>
  );
};

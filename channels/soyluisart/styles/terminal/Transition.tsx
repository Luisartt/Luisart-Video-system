import { AbsoluteFill, interpolate, random } from "remotion";
import { z } from "zod";
import { term } from "./theme";
import { backingField, clamp, CornerTicks, Decrypt, fitDisplay, safeGuideField, Tag, TermStage, useLayout, useLife, sfxField, TSfx, decryptEnd } from "./primitives";

// Scan-cut wipe as a full-frame overlay: an ice scanline sweeps down and leaves an opaque
// near-black grid behind it (fully covering the frame), glitch bars flicker, then a second
// sweep uncovers the frame again. Cut your recording under the fully covered frames.
// `chapter` holds longer and decrypts a chapter tag + headline while covered.

export const transitionSchema = z.object({
  backing: backingField,
  safeGuide: safeGuideField,
  sfx: sfxField,
  duration: z.number().min(0.6).max(6).default(1),
  sweepFrames: z.number().int().min(4).max(20).describe("Frames de cada barrido"),
  chapter: z.string().describe("Vacío = sin texto (solo barrido)"),
  tag: z.string(),
  headline: z.string(),
});
export type TransitionProps = z.infer<typeof transitionSchema>;

export const transitionVariants: Record<string, TransitionProps> = {
  scan: { backing: "green", safeGuide: false, sfx: true, duration: 1, sweepFrames: 9, chapter: "", tag: "Capítulo", headline: "" },
  "scan-chapter": { backing: "green", safeGuide: false, sfx: true, duration: 2.5, sweepFrames: 9, chapter: "02", tag: "Capítulo", headline: "Herramientas" },
};

const BAND = 90;

export const Transition: React.FC<TransitionProps> = (p) => {
  const { frame, dur } = useLife();
  const L = useLayout();
  const W = L.width;
  const HT = L.height;
  const headSize = L.v ? fitDisplay(p.headline, L.safeBox.w - 20, 120, 0.6) : 136;
  const c = term.color;
  const sweep = p.sweepFrames;
  const revealStart = dur - sweep;
  const covering = frame < sweep;
  const revealing = frame >= revealStart;
  const yIn = interpolate(frame, [0, sweep - 1], [0, HT], { ...clamp, easing: term.ease.inOut });
  const yOut = interpolate(frame, [revealStart, dur - 1], [0, HT], { ...clamp, easing: term.ease.inOut });
  // Covered region: [top, bottom).
  const top = revealing ? yOut : 0;
  const bottom = covering ? yIn : HT;
  const lineY = covering ? yIn : revealing ? yOut : -10;
  const glitch = covering || revealing || frame < sweep + 4;
  const g = term.grid;
  const inset = term.frameInset;
  const hasText = p.chapter !== "" || p.headline !== "";
  const textStart = sweep + 2;
  const sound = (
    <>
      <TSfx kind="slide" at={0} on={p.sfx} />
      <TSfx kind="slide" at={revealStart} volume={0.25} on={p.sfx} />
      {hasText && p.headline ? <TSfx kind="keys" at={textStart + 2} frames={Math.ceil(decryptEnd(p.headline, textStart + 2, 0.9) - textStart - 2)} volume={0.25} on={p.sfx} /> : null}
    </>
  );

  return (
    <TermStage backing={p.backing} safeGuide={p.safeGuide}>
      {bottom > top ? (
        <AbsoluteFill style={{ clipPath: `inset(${top}px 0 ${HT - bottom}px 0)` }}>
          <AbsoluteFill style={{ background: c.bg }} />
          <svg width={W} height={HT} style={{ position: "absolute", inset: 0 }}>
            <defs>
              <pattern id="t-cut-grid" width={g} height={g} patternUnits="userSpaceOnUse" x={0} y={12}>
                <path d={`M ${g} 0 L 0 0 0 ${g}`} fill="none" stroke={c.hairline} strokeWidth={1} />
              </pattern>
            </defs>
            <rect x={0} y={0} width={W} height={HT} fill="url(#t-cut-grid)" />
          </svg>
          <div style={{ position: "absolute", left: inset, top: inset, right: inset, bottom: inset, border: `1px solid ${c.hairline}` }}>
            <CornerTicks size={26} />
          </div>
          {/* Blue band trails the scanline, always on the covered side. */}
          {covering ? (
            <div style={{ position: "absolute", left: 0, right: 0, top: lineY - BAND, height: BAND, background: `linear-gradient(180deg, ${c.blue}00 0%, ${c.blue}40 100%)` }} />
          ) : null}
          {revealing ? (
            <div style={{ position: "absolute", left: 0, right: 0, top: lineY, height: BAND, background: `linear-gradient(0deg, ${c.blue}00 0%, ${c.blue}40 100%)` }} />
          ) : null}
          {glitch
            ? [0, 1, 2].map((i) => (
                <div
                  key={i}
                  style={{
                    position: "absolute",
                    left: random(`tc-x-${i}-${frame}`) * (W - 520),
                    top: random(`tc-y-${i}-${frame}`) * (HT - 40),
                    width: 200 + random(`tc-w-${i}-${frame}`) * 400,
                    height: 3,
                    background: c.blue,
                  }}
                />
              ))
            : null}
          {hasText && frame >= textStart ? (
            <div style={{ position: "absolute", left: L.v ? L.left + 10 : term.margin + 40, top: L.v ? L.top + L.safeBox.h / 2 : "50%", transform: "translateY(-50%)" }}>
              {p.chapter ? (
                <Tag>
                  [{p.chapter}] {p.tag}
                </Tag>
              ) : null}
              <div style={{ marginTop: 20, fontFamily: term.font.display, fontWeight: 800, fontSize: headSize, lineHeight: 0.98, letterSpacing: term.tracking.display, color: c.text, whiteSpace: "nowrap" }}>
                <Decrypt text={p.headline} start={textStart + 2} perChar={0.9} />
              </div>
            </div>
          ) : null}
        </AbsoluteFill>
      ) : null}
      {covering || revealing ? <div style={{ position: "absolute", left: 0, right: 0, top: lineY - 1, height: 2, background: c.ice }} /> : null}
      {sound}
    </TermStage>
  );
};

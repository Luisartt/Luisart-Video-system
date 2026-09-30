import { AbsoluteFill, useCurrentFrame } from "remotion";
import { HandNote, TypeOn } from "../../../../styles/pizarra/primitives";
import { piz } from "../../../../styles/pizarra/theme";

// Santiago's hook / turn / CTA shot in the Luisart brand: a small handwritten kicker (ink, in FRONT
// of the person) above a giant Inter Tight 800 word typed 1 char/frame BEHIND the head (layers:
// A-roll → big words → person matte → kicker). No band, box or plate behind anything: the big word
// is brand blue (or ink for a first line), the kicker is ink handwriting with a faint paper glow so
// it reads on the bright wall. The same layout is rendered twice (behind / front) so they align.

export type PizLine = { text: string; at: number; tone: "accent" | "ink"; max?: number };
export type PizGroup = {
  name: string;
  from: number; // frame the group appears (a cut)
  to: number; // frame it cuts out
  top: number; // px: top of the big-word block
  kicker?: { text: string; at: number; size?: number };
  lines: PizLine[];
  /** Key face shot (user rule 2026-09-27): only these keep a big behind-head word; the other face
   *  shots get captions instead. */
  key?: boolean;
  /** Horizontal 1920×1080 edit: top of the big-word block (the face panel is 0.5625 × the sheet). */
  hTop?: number;
};

/** Horizontal: words span the graphics zone (x 140–1780) behind the head in the centred face panel. */
export type BehindFrame = "vertical" | "horizontal";
const FRAMES = {
  vertical: { left: 0, width: 1080, maxW: 907, maxSize: piz.size.behindHead as number, kicker: piz.size.kicker as number },
  horizontal: { left: 140, width: 1640, maxW: 1400, maxSize: 190, kicker: 60 },
};

const MAX_W = 907; // 84 % of 1080 (his 78–85 %)
/** Inter Tight 800 caps ≈ 0.64 em per character (same rule as the library's BehindHeadWord). */
export const fitWord = (text: string, max: number = piz.size.behindHead, maxW = MAX_W) => Math.min(max, Math.floor(maxW / Math.max(1, Array.from(text).length * 0.64)));

const BIG_SHADOW = "0 4px 16px rgba(0,0,0,0.16)";
const KICKER_GLOW = "0 0 10px rgba(255,255,255,0.85), 0 0 3px rgba(255,255,255,0.9)";

const GroupLayout: React.FC<{ g: PizGroup; layer: "behind" | "front"; frame: BehindFrame }> = ({ g, layer, frame }) => {
  const F = FRAMES[frame];
  const h = frame === "horizontal";
  return (
  <div style={{ position: "absolute", left: F.left, width: F.width, top: h ? (g.hTop ?? 150) : g.top, display: "flex", justifyContent: "center" }}>
    <div style={{ position: "relative", display: "flex", flexDirection: "column", alignItems: "center" }}>
      {g.kicker ? (
        <div style={{ position: "absolute", left: 0, bottom: "100%", marginBottom: 10, whiteSpace: "nowrap", visibility: layer === "front" ? "visible" : "hidden" }}>
          <HandNote text={g.kicker.text} at={g.kicker.at} color={piz.color.ink} fontSize={h ? F.kicker : g.kicker.size ?? piz.size.kicker} align="left" style={{ textShadow: KICKER_GLOW, whiteSpace: "nowrap", padding: "0 10px" }} />
        </div>
      ) : null}
      {g.lines.map((l, i) => (
        <div key={i} style={{ visibility: layer === "behind" ? "visible" : "hidden", whiteSpace: "nowrap" }}>
          <TypeOn
            text={l.text}
            at={l.at}
            color={l.tone === "accent" ? piz.color.accent : piz.color.ink}
            fontSize={fitWord(l.text, h ? Math.min(F.maxSize, (l.max ?? F.maxSize) * 1.1) : l.max, F.maxW)}
            weight={800}
            lineHeight={0.92}
            letterSpacing="-0.015em"
            style={{ textShadow: BIG_SHADOW, whiteSpace: "nowrap" }}
          />
        </div>
      ))}
    </div>
  </div>
  );
};

export const BehindLayer: React.FC<{ groups: PizGroup[]; layer: "behind" | "front"; frame?: BehindFrame }> = ({ groups, layer, frame: fr = "vertical" }) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill>
      {groups.map((g) => (frame >= g.from && frame < g.to ? <GroupLayout key={g.name} g={g} layer={layer} frame={fr} /> : null))}
    </AbsoluteFill>
  );
};

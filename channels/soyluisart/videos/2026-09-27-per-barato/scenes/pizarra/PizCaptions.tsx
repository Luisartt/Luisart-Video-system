import { useCurrentFrame } from "remotion";
import { piz } from "../../../../styles/pizarra/theme";
import { ZONES } from "../../../../styles/shared/formats";
import type { CaptionGate } from "./captionRule";

// Santiago's karaoke in the Luisart brand: 2–4 words per chunk, the whole chunk swaps in on a hard
// cut, the active word turns blue on its own start, no animation. No plate/box behind it: ink
// Inter 700 on white paper; over video white with a thin ink outline (paint-order stroke) and a
// soft shadow. Shown only on pure talking-head stretches (captionRule.ts), never over the face.

// Horizontal extent: the format's caption zone (ZONES: vertical x 120-900, left of the platform's
// like/share column; horizontal x 240-1680, centred under the face panel).
// Vertical position: decided by the edit - nearest the caption zone that doesn't touch the face
// (captionPlace.ts); the zone is a preference, the face overrides it.
const CAPS = { vertical: ZONES.vertical.captions, horizontal: ZONES.horizontal.captions };

export type CaptionPlacement = { on: "paper" | "video"; cy: number; size?: number } | null;

export const PizCaptions: React.FC<{ gate: CaptionGate; placement: (frame: number) => CaptionPlacement; zone?: "vertical" | "horizontal" }> = ({
  gate,
  placement,
  zone = "vertical",
}) => {
  const CAP = CAPS[zone];
  const frame = useCurrentFrame();
  const { page, show } = gate(frame);
  const place = placement(frame);
  if (!page || !show || !place) return null;
  const spoken = page.tokens.filter((tk) => frame >= tk.from);
  const active = spoken[spoken.length - 1];
  const paper = place.on === "paper";
  const base = paper ? piz.color.ink : piz.color.white;
  const size = place.size ?? 56;
  return (
    <div
      style={{
        position: "absolute",
        left: CAP.x,
        width: CAP.w,
        top: place.cy,
        transform: "translateY(-50%)",
        textAlign: "center",
        font: `700 ${size}px ${piz.font.caption}`,
        letterSpacing: "-0.015em",
        lineHeight: 1.15,
        ...(paper
          ? {}
          : {
              WebkitTextStroke: `${Math.round(size * 0.125)}px ${piz.color.ink}`,
              paintOrder: "stroke fill",
              textShadow: "0 2px 10px rgba(0,0,0,0.42)",
            }),
      }}
    >
      {page.tokens.map((tk, i) => (
        <span key={i} style={{ color: tk === active ? piz.color.accent : base }}>
          {tk.text}
          {i < page.tokens.length - 1 ? " " : ""}
        </span>
      ))}
    </div>
  );
};

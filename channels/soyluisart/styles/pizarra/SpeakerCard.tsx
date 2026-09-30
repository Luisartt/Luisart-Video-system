import { AbsoluteFill } from "remotion";
import { z } from "zod";
import { ARollVideo, Drop, HandNote, PixelIcon, Sfx, Stage, TEST_AROLL, TEST_MATTE, TypeOn, Variant, base, baseSchema, iconField, useFormat } from "./primitives";
import { piz } from "./theme";

// His signature layout: pizarra on top (heading + hand note + pixel icon) and the A-roll in a big
// rounded card at the bottom (≈87 % wide, radius 20, soft shadow) with the head breaking out above
// the card's top edge — the person matte is drawn over the board only above that edge.
// `enabled` = false drops the card (the user dislikes small face insets) and centres the board
// content, so the same element can be switched off per video. No captions (rule a: a graphic is
// always on screen here); the card belongs to split layouts only, never to full-board scenes (g).

export const speakerCardSchema = baseSchema.extend({
  enabled: z.boolean().describe("Style switch: false = no speaker card, board content centred"),
  heading: z.string(),
  accent: z.string(),
  note: z.string(),
  icon: iconField,
  aroll: z.string(),
  matte: z.string(),
  cardTop: z.number().describe("px: card top edge"),
  videoScale: z.number().min(0.5).max(1.5).describe("A-roll scale inside the card (1 = full frame)"),
  videoTop: z.number().describe("px: where the scaled A-roll's top edge sits"),
  trimSeconds: z.number().min(0).describe("Start offset into the A-roll/matte"),
});
type Props = z.infer<typeof speakerCardSchema>;

export const SpeakerCard: React.FC<Props> = (p) => {
  const { width, height, safeBox } = useFormat();
  const cardW = Math.round(width * 0.87);
  const cardX = Math.round((width - cardW) / 2);
  const cardBottom = height - 40;
  const vidW = Math.round(width * p.videoScale);
  const vidH = Math.round(height * p.videoScale);
  const vidX = Math.round((width - vidW) / 2);
  const headAt = 4 + piz.timing.headingAfterNote;
  const iconAt = headAt + Array.from(p.heading).length + 3;
  const trim = Math.round(p.trimSeconds * 30);
  const video = (src: string, transparent: boolean) => (
    <div style={{ position: "absolute", left: vidX, top: p.videoTop, width: vidW, height: vidH }}>
      <ARollVideo src={src} transparent={transparent} trimBefore={trim} style={{ objectFit: "cover" }} />
    </div>
  );
  const boardTop = (
    <AbsoluteFill
      style={{
        left: safeBox.x,
        width: safeBox.w,
        top: p.enabled ? safeBox.y + 20 : safeBox.y,
        height: p.enabled ? p.cardTop - safeBox.y - 140 : safeBox.h,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: p.enabled ? "flex-start" : "center",
        gap: 6,
      }}
    >
      <TypeOn text={p.heading} at={headAt} accent={p.accent} />
      <HandNote text={p.note} at={4} />
      <Drop at={iconAt} style={{ marginTop: p.enabled ? 30 : 60 }}>
        <PixelIcon name={p.icon} px={p.enabled ? 10 : 18} />
      </Drop>
    </AbsoluteFill>
  );
  return (
    <Stage backing={p.backing} safeGuide={p.safeGuide}>
      {boardTop}
      {p.enabled ? (
        <>
          {/* Card: A-roll clipped to a rounded rect with a soft shadow and a thin white edge. */}
          <div
            style={{
              position: "absolute",
              left: cardX,
              top: p.cardTop,
              width: cardW,
              height: cardBottom - p.cardTop,
              borderRadius: 20,
              overflow: "hidden",
              boxShadow: "0 6px 24px rgba(17,17,17,0.10)",
              outline: "2px solid #FFFFFF",
            }}
          >
            <div style={{ position: "absolute", left: -cardX, top: -p.cardTop, width, height }}>{video(p.aroll, false)}</div>
          </div>
          {/* Head break-out: the matte, only above the card's top edge. */}
          {p.matte ? <AbsoluteFill style={{ clipPath: `inset(0 0 ${height - p.cardTop}px 0)` }}>{video(p.matte, true)}</AbsoluteFill> : null}
        </>
      ) : null}
      <Sfx kind="type" at={headAt} frames={Array.from(p.heading).length + 2} on={p.sfx} />
      <Sfx kind="pop" at={iconAt} on={p.sfx} />
    </Stage>
  );
};

const common: Props = {
  ...base("board", 6),
  enabled: true,
  heading: "EXCUSA 1",
  accent: "1",
  note: "no sé por dónde empezar",
  icon: "bulb",
  aroll: TEST_AROLL,
  matte: TEST_MATTE,
  cardTop: 900,
  videoScale: 0.87,
  videoTop: 380,
  trimSeconds: 0,
};

export const speakerCardVariants: Variant<Props>[] = [
  { id: "card", props: common },
  { id: "off", props: { ...common, enabled: false, seconds: 4 } },
];

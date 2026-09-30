import { AbsoluteFill, Easing, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { z } from "zod";
import { theme } from "../theme";
import { LAND_FRAME, Sfx, usePushOut } from "./kit";

// Mirko's intro (0:00–0:03): retro perspective grid floor of thin blue lines scrolling toward
// the viewer, a carousel of thumbnails racing across the horizon with a motion trail (offset,
// fading copies — no CSS blur), the camera pulling back, then the channel handle pops in.

export const gridIntroSchema = z.object({
  thumbnails: z.array(z.string()).describe("Image paths inside media/; empty = gradient placeholders"),
  title: z.string(),
  titleAt: z.number().int().min(0).describe("Frame at which the title pops in"),
  sfx: z.boolean(),
  exit: z.enum(["push", "none"]),
});

export type GridIntroProps = z.infer<typeof gridIntroSchema>;

export const gridIntroDefaults: GridIntroProps = {
  thumbnails: [],
  title: "@soyluisart",
  titleAt: 54,
  sfx: true,
  exit: "push",
};

const { color, font, motion } = theme;

const HORIZON = 700; // px from the top
const CELL = 90; // grid spacing on the floor plane
const TILE_W = 400;
const TILE_H = 225;
const PITCH = TILE_W + 40;
const N = 24;

const placeholders = [
  `linear-gradient(135deg, ${color.glowSoft}, ${color.bgNavyLight})`,
  `linear-gradient(135deg, ${color.accentCyan}, ${color.glow})`,
  `linear-gradient(135deg, ${color.card}, ${color.accent})`,
  `linear-gradient(135deg, ${color.glow}, ${color.bgNavy})`,
  `linear-gradient(135deg, ${color.accent}, ${color.accentCyan})`,
  `linear-gradient(135deg, ${color.bgNavyLight}, ${color.glowSoft})`,
  `linear-gradient(135deg, ${color.textMuted}, ${color.glow})`,
  `linear-gradient(135deg, ${color.glowSoft}, ${color.accentCyan})`,
];

const Tile: React.FC<{ index: number; thumbs: string[]; x: number; opacity: number }> = ({ index, thumbs, x, opacity }) => {
  const src = thumbs.length ? thumbs[index % thumbs.length] : null;
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        bottom: 0,
        width: TILE_W,
        height: TILE_H,
        borderRadius: 14,
        overflow: "hidden",
        opacity,
        background: src ? color.bgNavy : placeholders[index % placeholders.length],
      }}
    >
      {src ? (
        <Img src={staticFile(src)} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      ) : (
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: `radial-gradient(28% 50% at ${30 + ((index * 23) % 40)}% 55%, rgba(255,255,255,0.55) 0%, transparent 70%)`,
          }}
        />
      )}
    </div>
  );
};

const carouselPos = (f: number) =>
  interpolate(f, [0, 80], [0, 5600], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.quad) }) +
  Math.max(0, f - 80) * 8;

export const GridIntro: React.FC<Partial<GridIntroProps>> = (props) => {
  const { thumbnails, title, titleAt, sfx, exit } = { ...gridIntroDefaults, ...props };
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const out = usePushOut(exit === "push");

  // Grid floor scrolls toward the viewer.
  const scroll = (frame * 9) % CELL;

  // Carousel: fast, decelerating, camera pulls back (smaller, lower).
  const pos = carouselPos(frame);
  const v = pos - carouselPos(frame - 1);
  const camScale = interpolate(frame, [0, 110], [0.9, 0.34], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.cubic),
  });
  const total = N * PITCH;
  // Motion blur without CSS blur: copies spread along the motion (a "shutter" of blurLen px).
  const blurLen = Math.min(v * 1.1, 260);
  const COPIES = 8;
  const fast = Math.min(1, v / 30);

  const pop = spring({ frame: frame - titleAt, fps, config: motion.popIn });
  const titleDrift = 1 + motion.driftScalePerSecond * Math.max(0, frame - titleAt) / fps;

  return (
    <AbsoluteFill style={{ background: color.bgDeep, overflow: "hidden" }}>
      {sfx ? <Sfx kind="whoosh" at={0} /> : null}
      {sfx ? <Sfx kind="click" at={titleAt + LAND_FRAME - 1} /> : null}

      <AbsoluteFill style={{ scale: String(1 + out * 0.35), opacity: 1 - out }}>
        {/* Horizon glow */}
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: HORIZON - 260,
            height: 520,
            background: `radial-gradient(60% 50% at 50% 50%, ${color.bgNavyLight}aa 0%, transparent 70%)`,
          }}
        />

        {/* Grid floor */}
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: HORIZON,
            bottom: 0,
            overflow: "hidden",
            perspective: 420,
            perspectiveOrigin: "50% 0%",
          }}
        >
          <div
            style={{
              position: "absolute",
              left: "50%",
              top: 0,
              width: 8000,
              height: 3200,
              marginLeft: -4000,
              transformOrigin: "50% 0%",
              transform: "rotateX(78deg)",
              backgroundImage: [
                `linear-gradient(0deg, ${color.glowSoft} 0px, ${color.glowSoft} 2px, transparent 2px)`,
                `linear-gradient(90deg, ${color.glowSoft} 0px, ${color.glowSoft} 2px, transparent 2px)`,
              ].join(","),
              backgroundSize: `${CELL}px ${CELL}px`,
              backgroundPosition: `0px ${scroll}px`,
              opacity: 0.7,
            }}
          />
          {/* Fade the floor into the horizon */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: `linear-gradient(180deg, ${color.bgDeep} 0%, ${color.bgDeep}dd 18%, transparent 60%, ${color.bgNavy}55 100%)`,
            }}
          />
        </div>

        {/* Thumbnail carousel on the horizon */}
        <div
          style={{
            position: "absolute",
            left: "50%",
            top: HORIZON - 16,
            width: 0,
            height: 0,
            scale: String(camScale),
            transformOrigin: "0 0",
          }}
        >
          {Array.from({ length: N }).map((_, i) => {
            const x = ((((i * PITCH - pos) % total) + total) % total) - total / 2;
            return (
              <div key={i}>
                {fast > 0.05
                  ? Array.from({ length: COPIES }).map((__, k) => (
                      <Tile key={k} index={i} thumbs={thumbnails} x={x + (k / (COPIES - 1) - 0.5) * blurLen} opacity={0.3 * fast} />
                    ))
                  : null}
                <Tile index={i} thumbs={thumbnails} x={x} opacity={1 - 0.6 * fast} />
              </div>
            );
          })}
        </div>

        {/* Channel handle */}
        <AbsoluteFill style={{ alignItems: "center", paddingTop: 300 }}>
          <div
            style={{
              fontFamily: font.display,
              fontWeight: 900,
              fontSize: 190,
              lineHeight: 1,
              color: color.text,
              letterSpacing: "0.01em",
              textShadow: `0 0 40px ${color.glow}cc, 0 0 110px ${color.glowSoft}88`,
              scale: String((0.3 + 0.7 * pop) * titleDrift),
              opacity: interpolate(frame - titleAt, [0, 2], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
            }}
          >
            {title}
          </div>
        </AbsoluteFill>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

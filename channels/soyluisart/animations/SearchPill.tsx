import { useCurrentFrame, useVideoConfig } from "remotion";
import { z } from "zod";
import { theme } from "../theme";
import { CardMotion, LAND_FRAME, Sfx, Stage } from "./kit";

// White glowing search pill with typewriter text (InvernovAH 0:19): pops in, types at
// theme.motion.typeCharsPerSecond with a blinking accent cursor, drifts slowly, pushes out.

export const searchPillSchema = z.object({
  text: z.string(),
  background: z.boolean(),
  sfx: z.boolean(),
  exit: z.enum(["push", "none"]),
});

export type SearchPillProps = z.infer<typeof searchPillSchema>;

export const searchPillDefaults: SearchPillProps = {
  text: "Cómo crecer en YouTube desde 0",
  background: true,
  sfx: true,
  exit: "push",
};

const { color, font, glow, radius, type, motion } = theme;

export const SearchPill: React.FC<Partial<SearchPillProps>> = (props) => {
  const { text, background, sfx, exit } = { ...searchPillDefaults, ...props };
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const typeStart = LAND_FRAME + 2;
  const chars = Array.from(text);
  const shown = Math.max(0, Math.min(chars.length, Math.floor(((frame - typeStart) / fps) * motion.typeCharsPerSecond)));
  const typing = shown < chars.length;
  // Solid while typing, then blinks (~2 Hz).
  const cursorOn = typing || Math.floor((frame - typeStart) / (fps / 4)) % 2 === 0;

  return (
    <Stage background={background}>
      {sfx ? <Sfx kind="click" at={LAND_FRAME - 1} /> : null}
      <CardMotion exit={exit} from={0.3} driftX={-14}>
        <div
          style={{
            width: 1280,
            height: 116,
            borderRadius: radius.pill,
            background: color.card,
            boxShadow: glow.pill,
            display: "flex",
            alignItems: "center",
            padding: "0 56px",
            boxSizing: "border-box",
            fontFamily: font.ui,
            fontWeight: 600,
            fontSize: 52,
            color: color.cardText,
            letterSpacing: type.uiTracking,
            whiteSpace: "pre",
            overflow: "hidden",
          }}
        >
          {chars.slice(0, shown).join("")}
          <span
            style={{
              display: "inline-block",
              width: 4,
              height: 58,
              marginLeft: 4,
              borderRadius: 2,
              background: color.accent,
              opacity: cursorOn ? 1 : 0,
            }}
          />
        </div>
      </CardMotion>
    </Stage>
  );
};

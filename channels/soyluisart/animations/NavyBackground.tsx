import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { theme } from "../theme";

// Near-black navy with blue light pooling at the bottom and corners, drifting slowly.
export const NavyBackground: React.FC<{ glowX?: number; glowY?: number }> = ({ glowX = 50, glowY = 105 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const x = glowX + Math.sin(t * 0.4) * 4;
  const { color } = theme;
  return (
    <AbsoluteFill
      style={{
        background: [
          `radial-gradient(60% 55% at ${x}% ${glowY}%, ${color.glow}cc 0%, ${color.bgNavyLight}88 45%, transparent 75%)`,
          `radial-gradient(40% 40% at 100% 0%, ${color.bgNavyLight}66 0%, transparent 70%)`,
          `radial-gradient(35% 35% at 0% 100%, ${color.bgNavyLight}55 0%, transparent 70%)`,
          `linear-gradient(180deg, ${color.bgDeep} 0%, ${color.bgNavy} 100%)`,
        ].join(","),
      }}
    />
  );
};

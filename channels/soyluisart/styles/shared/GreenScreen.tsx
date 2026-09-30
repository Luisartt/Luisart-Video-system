import { AbsoluteFill } from "remotion";

// Chroma-key background for graphics the user keys over their recording in the editor.
export const CHROMA_GREEN = "#00FF00";

export type Backing = "green" | "style" | "transparent";

// Wraps a graphic: pure green behind it, or the style's own background (for previews), or nothing (alpha renders).
export const Backed: React.FC<{ backing: Backing; styleBackground?: React.ReactNode; children: React.ReactNode }> = ({
  backing,
  styleBackground,
  children,
}) => (
  <AbsoluteFill style={{ backgroundColor: backing === "green" ? CHROMA_GREEN : "transparent" }}>
    {backing === "style" ? styleBackground : null}
    {children}
  </AbsoluteFill>
);

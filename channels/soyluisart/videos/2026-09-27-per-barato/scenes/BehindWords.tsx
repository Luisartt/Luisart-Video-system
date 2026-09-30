import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { Decrypt } from "../../../prototypes/b/components";
import { C, F, clamp, ramp, scanClip } from "./parts";

// Claudia's signature move in the Terminal brand: huge Schibsted Grotesk 800 words laid between
// the A-roll and the person cutout, so the head/hair covers their lower middle. v2: no dark band;
// the words are dark ink on the bright wall with electric-blue accents and a faint light halo.

const INK = "#0A0F1E";
const SOFT = "0 0 22px rgba(255,255,255,0.35)";

export type BehindLine = {
  text: string;
  at: number; // cut frame the line lands on
  top: number; // px from the top of the frame (box top)
  size: number; // px
  lead?: boolean; // small decrypting lead-in line (Claudia's "Si estás viendo")
  color?: string;
  accent?: string; // substring painted electric blue
};
export type BehindGroup = { lines: BehindLine[]; out: number };

const CENTER_LEFT = 120;
const WIDTH = 800; // vertical safe width (120 … 920)
const EXIT = 7;

const Painted: React.FC<{ text: string; accent?: string; color: string }> = ({ text, accent, color }) => {
  if (!accent || !text.includes(accent)) return <span style={{ color }}>{text}</span>;
  const i = text.indexOf(accent);
  return (
    <>
      <span style={{ color }}>{text.slice(0, i)}</span>
      <span style={{ color: C.blue }}>{accent}</span>
      <span style={{ color }}>{text.slice(i + accent.length)}</span>
    </>
  );
};

const Line: React.FC<{ line: BehindLine; out: number }> = ({ line, out }) => {
  const frame = useCurrentFrame();
  if (frame < line.at) return null;
  const p = ramp(frame, line.at, 6);
  const x = interpolate(frame, [out - EXIT, out], [0, 1], clamp);
  const common: React.CSSProperties = {
    position: "absolute",
    left: CENTER_LEFT,
    width: WIDTH,
    top: line.top,
    textAlign: "center",
    whiteSpace: "nowrap",
    ...scanClip(x),
  };
  if (line.lead) {
    return (
      <div
        style={{
          ...common,
          fontFamily: F.display,
          fontWeight: 700,
          fontSize: line.size,
          letterSpacing: "-0.02em",
          lineHeight: 1,
          color: line.color ?? INK,
          textShadow: SOFT,
        }}
      >
        <Decrypt text={line.text} start={line.at} perChar={0.6} scramble={5} />
      </div>
    );
  }
  return (
    <div
      style={{
        ...common,
        fontFamily: F.display,
        fontWeight: 800,
        fontSize: line.size,
        letterSpacing: "-0.045em",
        lineHeight: 0.9,
        opacity: interpolate(p, [0, 0.5], [0, 1], clamp),
        scale: interpolate(p, [0, 1], [1.14, 1]),
        translate: `0px ${(1 - p) * 26}px`,
        textShadow: SOFT,
      }}
    >
      <Painted text={line.text} accent={line.accent} color={line.color ?? INK} />
    </div>
  );
};

/** Layer that goes between the A-roll and the cutout. */
export const BehindWords: React.FC<{ groups: BehindGroup[] }> = ({ groups }) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill>
      {groups.map((g, gi) =>
        frame >= g.lines[0].at - 1 && frame < g.out ? (
          <AbsoluteFill key={gi}>
            {g.lines.map((l, li) => (
              <Line key={li} line={l} out={g.out} />
            ))}
          </AbsoluteFill>
        ) : null,
      )}
    </AbsoluteFill>
  );
};

/** Rough width fit for Schibsted Grotesk 800 capitals at −0.045em tracking. */
export const fitCaps = (text: string, max: number, width = WIDTH) => Math.min(max, Math.floor(width / (Array.from(text).length * 0.67)));

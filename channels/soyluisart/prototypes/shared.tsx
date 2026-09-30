import { Img, staticFile } from "remotion";

// Helpers shared by the three style prototypes (A, B, C). Brand values live in each
// prototype's own theme.ts; this file only knows where the research assets are.

export const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

export const falProto = (file: string) => staticFile(`soyluisart/automated-research/fal/proto/${file}`);
export const falTest = (file: string) => staticFile(`soyluisart/automated-research/fal/tests/${file}`);

// Logos are used unmodified, only to name products. `white` marks a monochrome (black) mark that
// may be shown white on dark with brightness(0) invert(1); colour logos are never recoloured.
export type LogoDef = { file: string; name: string; white?: boolean };

export const logoSrc = (file: string) => staticFile(`soyluisart/automated-research/logos/${file}`);

/** All-monochrome set (white on dark) for calm editorial layouts. */
export const monoLogos: LogoDef[] = [
  { file: "openai.svg", name: "ChatGPT", white: true },
  { file: "claude-mono.svg", name: "Claude", white: true },
  { file: "gemini-mono.svg", name: "Gemini", white: true },
  { file: "perplexity-white.svg", name: "Perplexity" },
  { file: "mistral-mono-white.svg", name: "Mistral" },
  { file: "deepseek-mono.svg", name: "DeepSeek", white: true },
];

/** Official colour marks (OpenAI's Blossom is monochrome by design, so it is shown white). */
export const colourLogos: Record<string, LogoDef> = {
  openai: { file: "openai.svg", name: "ChatGPT", white: true },
  claude: { file: "claude.svg", name: "Claude" },
  gemini: { file: "gemini.svg", name: "Gemini" },
  perplexity: { file: "perplexity-white.svg", name: "Perplexity" },
  deepseek: { file: "deepseek.svg", name: "DeepSeek" },
  mistral: { file: "mistral.svg", name: "Mistral" },
};

export const Logo: React.FC<{ def: LogoDef; size: number; style?: React.CSSProperties }> = ({ def, size, style }) => (
  <Img
    src={logoSrc(def.file)}
    style={{
      width: size,
      height: size,
      objectFit: "contain",
      display: "block",
      filter: def.white ? "brightness(0) invert(1)" : undefined,
      ...style,
    }}
  />
);

/** Spanish number format with thousands grouping forced (es-ES skips it for 4-digit numbers). */
export const formatEs = (value: number, decimals: number): string => {
  const fixed = Math.abs(value).toFixed(decimals);
  const [int, dec] = fixed.split(".");
  const grouped = int.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return `${value < 0 ? "−" : ""}${grouped}${dec ? `,${dec}` : ""}`;
};

/** Smooth SVG path through points (for chart lines). */
export const linePath = (pts: { x: number; y: number }[]) =>
  pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(2)} ${p.y.toFixed(2)}`).join(" ");

/** Step path (horizontal then vertical) through points. */
export const stepPath = (pts: { x: number; y: number }[]) =>
  pts
    .map((p, i) => (i === 0 ? `M ${p.x.toFixed(2)} ${p.y.toFixed(2)}` : `H ${p.x.toFixed(2)} V ${p.y.toFixed(2)}`))
    .join(" ");

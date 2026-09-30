import { Children, cloneElement, createContext, isValidElement, useContext } from "react";
import { AbsoluteFill, Img, Loop, OffthreadVideo, interpolate, random, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { z } from "zod";
import { Backed, type Backing } from "../shared/GreenScreen";
import { SafeZoneGuide, useFormat } from "../shared/formats";
import { SfxCue } from "../shared/sfx";
import { formatMx, upperKeepName } from "../shared/text";
import { term, type TermColor } from "./theme";

// Shared building blocks of the Terminal library, extracted from prototypes/b/components.tsx
// (CornerTicks, Tag, Decrypt, TypeLine, SplitFlap, Backdrop) and made key-safe:
// on green backing everything visible is fully opaque, there are no soft glows, and the
// gain colour (#3DDC97, too close to chroma green) is swapped for ice + ▲.

const { font } = term;

export const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

// ── Backing ──────────────────────────────────────────────────────────────────────────────
export const zBacking = z.enum(["green", "style", "transparent"]);
export const backingField = zBacking.default("green");
/** Studio-only overlay of the platform safe area. Never on in renders. */
export const safeGuideField = z.boolean().describe("Solo vista previa: muestra la zona segura (nunca en renders)");
/** Bake the element's sound effects (theme.ts → sfx, map in media/soyluisart/audio/GUIA-EFECTOS.md). */
export const sfxField = z.boolean().describe("Sonido incluido (theme.ts → sfx)");

/** One Terminal sound cue: the file's hit lands on frame `at`; `frames` makes it a bed. */
export const TSfx: React.FC<{ kind: keyof typeof term.sfx; at: number; frames?: number; volume?: number; on: boolean }> = ({ kind, ...rest }) => (
  <SfxCue def={term.sfx[kind]} {...rest} />
);

export { useFormat };

const BackingCtx = createContext<Backing>("green");
export const useBacking = () => useContext(BackingCtx);

/** Palette for the current backing: on green, `gain` becomes ice (arrows carry the meaning). */
export const usePalette = (): TermColor => {
  const backing = useBacking();
  return backing === "green" ? { ...term.color, gain: term.color.ice } : term.color;
};

/** Seconds → frames, for calculateMetadata on every composition. */
export const durationFromProps = ({ props }: { props: { duration: number } }) => ({
  durationInFrames: Math.max(15, Math.round(props.duration * term.canvas.fps)),
});

/** Terminal preview background: circuit B-roll dimmed under a hairline grid, framed with ticks. */
export const StyleBackdrop: React.FC = () => {
  const { width, height } = useFormat();
  const g = term.grid;
  const inset = term.frameInset;
  const c = term.color;
  return (
    <AbsoluteFill style={{ background: c.bg }}>
      <Loop durationInFrames={180}>
        <OffthreadVideo
          src={staticFile("soyluisart/automated-research/fal/proto/b1-circuit-pulses.mp4")}
          muted
          style={{ width: "100%", height: "100%", objectFit: "cover", opacity: term.circuitOpacity }}
        />
      </Loop>
      <AbsoluteFill style={{ background: `radial-gradient(ellipse 75% 70% at 50% 50%, ${c.bg}00 0%, ${c.bg}CC 100%)` }} />
      <svg width={width} height={height} style={{ position: "absolute", inset: 0 }}>
        <defs>
          <pattern id="t-grid" width={g} height={g} patternUnits="userSpaceOnUse" x={0} y={12}>
            <path d={`M ${g} 0 L 0 0 0 ${g}`} fill="none" stroke={c.hairline} strokeWidth={1} />
          </pattern>
        </defs>
        <rect x={0} y={0} width={width} height={height} fill="url(#t-grid)" opacity={0.75} />
      </svg>
      <div style={{ position: "absolute", left: inset, top: inset, right: inset, bottom: inset, border: `1px solid ${c.hairline}` }}>
        <CornerTicks size={26} />
      </div>
    </AbsoluteFill>
  );
};

/** Root of every element: green / Terminal backdrop / transparent, plus the backing context. */
export const TermStage: React.FC<{ backing: Backing; safeGuide?: boolean; children: React.ReactNode }> = ({ backing, safeGuide, children }) => (
  <BackingCtx.Provider value={backing}>
    <Backed backing={backing} styleBackground={<StyleBackdrop />}>
      {children}
      {safeGuide ? <SafeZoneGuide /> : null}
    </Backed>
  </BackingCtx.Provider>
);

/**
 * Layout helper: format info plus the content edges. Horizontal keeps the approved prototype
 * margin (128 px); vertical uses the platform safe area (top 250, bottom 484, left 120, right 160).
 */
export const useLayout = () => {
  const f = useFormat();
  const v = f.isVertical;
  return {
    ...f,
    v,
    left: v ? f.safe.left : term.margin,
    right: v ? f.safe.right : term.margin,
    top: v ? f.safe.top : term.margin,
    bottom: v ? f.safe.bottom : term.margin,
  };
};

/** Rough Schibsted Grotesk 800 fit: largest size ≤ max at which `text` fits `width` (tight tracking). */
export const fitDisplay = (text: string, width: number, max: number, perChar = 0.53) =>
  Math.min(max, Math.floor(width / (Math.max(1, Array.from(text).length) * perChar)));

// ── Timing ───────────────────────────────────────────────────────────────────────────────
/** Enter is per element; every element exits with the same scan wipe over the last frames. */
export const useLife = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const exitStart = durationInFrames - term.exitFrames;
  const exitP = interpolate(frame, [exitStart, durationInFrames - 1], [0, 1], { ...clamp, easing: term.ease.inOut });
  return { frame, dur: durationInFrames, exitStart, exitP };
};

/**
 * Scan-wipe exit: an ice scanline crosses the element and erases it behind itself.
 * Wrap a positioned block (pass its position in `style`).
 */
export const Exit: React.FC<{ style?: React.CSSProperties; dir?: "ltr" | "rtl"; children: React.ReactNode }> = ({
  style,
  dir = "ltr",
  children,
}) => {
  const { exitP } = useLife();
  const x = interpolate(exitP, [0, 1], [-3, 103]);
  const clip =
    exitP <= 0
      ? undefined
      : dir === "ltr"
        ? `polygon(${x}% -2000px, calc(100% + 2000px) -2000px, calc(100% + 2000px) calc(100% + 2000px), ${x}% calc(100% + 2000px))`
        : `polygon(-2000px -2000px, ${100 - x}% -2000px, ${100 - x}% calc(100% + 2000px), -2000px calc(100% + 2000px))`;
  const lineLeft = dir === "ltr" ? `${x}%` : `calc(${100 - x}% - 2px)`;
  return (
    <div style={{ position: "absolute", ...style, clipPath: clip }}>
      {children}
      {exitP > 0 && exitP < 1 ? (
        <div style={{ position: "absolute", left: lineLeft, top: -14, bottom: -14, width: 2, background: term.color.ice }} />
      ) : null}
    </div>
  );
};

// ── Frames and labels ────────────────────────────────────────────────────────────────────
/** L-shaped corner ticks around a box. `p` 0..1 draws them outwards from each corner. */
export const CornerTicks: React.FC<{ size?: number; p?: number; c?: string; weight?: number; inset?: number }> = ({
  size = 18,
  p = 1,
  c = term.color.ice,
  weight = 2,
  inset = -1,
}) => {
  const len = size * p;
  const corners: React.CSSProperties[] = [
    { left: inset, top: inset },
    { right: inset, top: inset },
    { left: inset, bottom: inset },
    { right: inset, bottom: inset },
  ];
  if (len <= 0) return null;
  return (
    <>
      {corners.map((pos, i) => {
        const right = "right" in pos;
        const bottom = "bottom" in pos;
        return (
          <div key={i} style={{ position: "absolute", width: size, height: size, ...pos }}>
            <div style={{ position: "absolute", [bottom ? "bottom" : "top"]: 0, [right ? "right" : "left"]: 0, width: len, height: weight, background: c }} />
            <div style={{ position: "absolute", [bottom ? "bottom" : "top"]: 0, [right ? "right" : "left"]: 0, width: weight, height: len, background: c }} />
          </div>
        );
      })}
    </>
  );
};

/** Uppercases strings inside a label (also inside plain <span>s) but keeps "Luisart" and @handles
 * as written; component children (TypeLine, Decrypt) are left to their own text. */
const upperNode = (node: React.ReactNode): React.ReactNode =>
  Children.map(node, (child) => {
    if (typeof child === "string") return upperKeepName(child);
    if (isValidElement<{ children?: React.ReactNode }>(child) && typeof child.type === "string" && child.props.children !== undefined) {
      return cloneElement(child, undefined, upperNode(child.props.children));
    }
    return child;
  });

/** Small bracketed mono label: "[01] CAPÍTULO". Orange by default (small labels only). On the
 * vertical canvas labels are set 1.25× larger so they still read on a phone. Caps are applied in
 * code (not CSS) so the channel name stays "Luisart". */
export const Tag: React.FC<{ children: React.ReactNode; c?: string; size?: number; style?: React.CSSProperties }> = ({
  children,
  c = term.color.orange,
  size = 18,
  style,
}) => {
  const vertical = useFormat().isVertical;
  return (
  <div
    style={{
      fontFamily: font.mono,
      fontSize: vertical ? Math.round(size * 1.25) : size,
      fontWeight: 500,
      letterSpacing: term.tracking.mono,
      color: c,
      whiteSpace: "nowrap",
      ...style,
    }}
  >
    {upperNode(children)}
  </div>
  );
};

/**
 * Plain text made legible without a plate (user feedback 2026-09-27: no boxes behind text): a thin
 * opaque near-black outline painted UNDER the fill (paint-order), so the letters keep their shape.
 * Key-safe on green (fully opaque, no soft shadow).
 */
export const outlineText = (size: number): React.CSSProperties => ({
  WebkitTextStroke: `${Math.max(3, Math.round(size * 0.06))}px ${term.color.bg}`,
  paintOrder: "stroke fill",
});

/** "[Dato de ejemplo]" line: plain orange mono text with an outline (no chip/plate behind it). */
export const SampleChip: React.FC<{ text?: string; size?: number; style?: React.CSSProperties }> = ({ text = "Dato de ejemplo", size = 16, style }) => (
  <div style={style}>
    <Tag size={size} style={outlineText(Math.round(size * 1.25))}>[{text}]</Tag>
  </div>
);

/**
 * Opaque near-black panel with a hairline border and corner ticks: the backing for any text
 * that sits over the recording. `tick` 0..1 draws the ticks in.
 */
export const Panel: React.FC<{
  style?: React.CSSProperties;
  tick?: number;
  tickSize?: number;
  tickColor?: string;
  border?: string;
  children?: React.ReactNode;
}> = ({ style, tick = 1, tickSize = 18, tickColor = term.color.ice, border = term.color.hairlineBright, children }) => (
  <div style={{ position: "relative", background: term.color.panel, border: `1px solid ${border}`, boxSizing: "border-box", ...style }}>
    <CornerTicks size={tickSize} p={tick} c={tickColor} />
    {children}
  </div>
);

// ── Text effects ─────────────────────────────────────────────────────────────────────────
const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#%&*+=<>/";

/**
 * Scramble/decrypt reveal: each character appears as random glyphs, then locks into place from
 * left to right. The real character is laid out invisibly underneath, so nothing reflows.
 */
export const Decrypt: React.FC<{
  text: string;
  start: number;
  perChar?: number;
  scramble?: number;
  scrambleColor?: string;
  style?: React.CSSProperties;
}> = ({ text, start, perChar = 0.9, scramble = 7, scrambleColor = term.color.blue, style }) => {
  const frame = useCurrentFrame();
  return (
    <span style={style}>
      {Array.from(text).map((ch, i) => {
        if (ch === " ") return <span key={i}> </span>;
        const appear = start + i * perChar * 0.5;
        const lock = start + i * perChar + scramble;
        if (frame < appear) return <span key={i} style={{ visibility: "hidden" }}>{ch}</span>;
        if (frame >= lock) return <span key={i}>{ch}</span>;
        const g = GLYPHS[Math.floor(random(`dc-${text}-${i}-${Math.floor(frame / 2)}`) * GLYPHS.length)];
        return (
          <span key={i} style={{ position: "relative", display: "inline-block" }}>
            <span style={{ visibility: "hidden" }}>{ch}</span>
            <span style={{ position: "absolute", left: 0, top: 0, color: scrambleColor }}>{g}</span>
          </span>
        );
      })}
    </span>
  );
};

/** Frame at which a Decrypt of `text` has fully locked. */
export const decryptEnd = (text: string, start: number, perChar = 0.9, scramble = 7) =>
  start + Math.max(0, Array.from(text).length - 1) * perChar + scramble;

/** Typed terminal line with a blinking block cursor. */
export const TypeLine: React.FC<{ text: string; start: number; cps?: number; style?: React.CSSProperties; cursorUntil?: number }> = ({
  text,
  start,
  cps = 1.4,
  style,
  cursorUntil = Infinity,
}) => {
  const frame = useCurrentFrame();
  const n = Math.max(0, Math.min(text.length, Math.floor((frame - start) * cps)));
  const blinkOn = Math.floor(frame / 8) % 2 === 0 || (n > 0 && n < text.length);
  return (
    <div style={{ fontFamily: font.mono, whiteSpace: "pre", ...style }}>
      {text.slice(0, n)}
      {frame >= start && frame < cursorUntil ? (
        <span style={{ display: "inline-block", width: "0.6em", height: "1.05em", verticalAlign: "-0.15em", background: term.color.blue, opacity: blinkOn ? 1 : 0 }} />
      ) : null}
      {/* The untyped rest is laid out invisibly so the line's box never grows while typing. */}
      <span style={{ visibility: "hidden" }}>{text.slice(n)}</span>
    </div>
  );
};

/** Departure-board tiles. Tiles are opaque from the first frame (dim border until they flip). */
export type FlapSegment = { text: string; c?: string };
export const SplitFlap: React.FC<{
  segments: FlapSegment[];
  start: number;
  stagger?: number;
  flips?: number;
  flipFrames?: number;
  tileW?: number;
  tileH?: number;
  fontSize?: number;
  gap?: number;
}> = ({ segments, start, stagger = 1.5, flips = 6, flipFrames = 2, tileW = 64, tileH = 98, fontSize = 68, gap = 6 }) => {
  const frame = useCurrentFrame();
  const c = term.color;
  const chars = segments.flatMap((s) => Array.from(s.text).map((ch) => ({ ch, col: s.c ?? c.text })));
  let tileIndex = 0;
  return (
    <div style={{ display: "flex", gap, alignItems: "center" }}>
      {chars.map(({ ch, col }, i) => {
        if (ch === " ") return <div key={i} style={{ width: Math.round(tileW * 0.34) }} />;
        const k = tileIndex++;
        const s0 = start + k * stagger;
        const settle = s0 + flips * flipFrames;
        const visible = frame >= s0;
        const step = Math.floor((frame - s0) / flipFrames);
        const sub = (frame - s0) % flipFrames;
        const glyph = !visible ? "" : frame >= settle ? ch : GLYPHS[Math.floor(random(`sf-${ch}-${k}-${step}`) * GLYPHS.length)];
        const flipping = visible && frame < settle;
        const half: React.CSSProperties = { position: "absolute", left: 0, width: tileW, height: tileH / 2, overflow: "hidden", background: c.tile };
        const glyphStyle: React.CSSProperties = {
          position: "absolute",
          left: 0,
          width: tileW,
          height: tileH,
          lineHeight: `${tileH}px`,
          textAlign: "center",
          fontFamily: font.mono,
          fontWeight: 700,
          fontSize,
          color: flipping ? c.ice : col,
        };
        return (
          <div
            key={i}
            style={{
              position: "relative",
              width: tileW,
              height: tileH,
              background: c.bg,
              border: `1px solid ${visible ? c.hairlineBright : c.hairline}`,
              boxSizing: "content-box",
            }}
          >
            <div style={{ ...half, top: 0, scale: flipping && sub === 0 ? "1 0.35" : "1 1", transformOrigin: "bottom" }}>
              <div style={{ ...glyphStyle, top: 0 }}>{glyph}</div>
            </div>
            <div style={{ ...half, top: tileH / 2, background: c.tileLow }}>
              <div style={{ ...glyphStyle, top: -tileH / 2 }}>{glyph}</div>
            </div>
            <div style={{ position: "absolute", left: 0, right: 0, top: tileH / 2 - 1, height: 2, background: c.bg }} />
          </div>
        );
      })}
    </div>
  );
};

// ── Numbers and paths ────────────────────────────────────────────────────────────────────
/** Mexican number format, the channel standard: 1,284.50 (see shared/text.ts). */
export const formatNum = formatMx;
export { upperKeepName };

/** Step path (horizontal then vertical) through points. */
export const stepPath = (pts: { x: number; y: number }[]) =>
  pts.map((p, i) => (i === 0 ? `M ${p.x.toFixed(2)} ${p.y.toFixed(2)}` : `H ${p.x.toFixed(2)} V ${p.y.toFixed(2)}`)).join(" ");

// ── Logos ────────────────────────────────────────────────────────────────────────────────
// Used unmodified, only to name products. `white`: a black monochrome mark shown white on dark.
// `onGreen`: a green-free alternative (official mono mark) used on green backing, because
// marks with green in them (Gemini's gradient, Copilot, NVIDIA) would key out.
type LogoFile = { file: string; white?: boolean };
type LogoDef = LogoFile & { name: string; onGreen?: LogoFile };

const LOGO_DIR = "soyluisart/automated-research/logos";
export const LOGOS = {
  chatgpt: { name: "ChatGPT", file: "openai.svg", white: true },
  claude: { name: "Claude", file: "claude.svg" },
  gemini: { name: "Gemini", file: "gemini.svg", onGreen: { file: "gemini-mono.svg", white: true } },
  perplexity: { name: "Perplexity", file: "perplexity-white.svg" },
  deepseek: { name: "DeepSeek", file: "deepseek.svg" },
  mistral: { name: "Mistral", file: "mistral.svg" },
  copilot: { name: "Copilot", file: "copilot.svg", onGreen: { file: "copilot-mono.svg", white: true } },
  grok: { name: "Grok", file: "grok.svg" },
  meta: { name: "Meta AI", file: "meta-ai.svg" },
  anthropic: { name: "Anthropic", file: "anthropic-mono.svg", white: true },
  nvidia: { name: "NVIDIA", file: "nvidia-mono.svg", white: true },
  cursor: { name: "Cursor", file: "cursor-mono.svg", white: true },
  huggingface: { name: "Hugging Face", file: "huggingface.svg" },
  midjourney: { name: "Midjourney", file: "midjourney.svg", white: true },
  n8n: { name: "n8n", file: "n8n.svg" },
  make: { name: "Make", file: "make-mono.svg", white: true },
} satisfies Record<string, LogoDef>;

export type LogoKey = keyof typeof LOGOS;
export const zLogo = z.enum(Object.keys(LOGOS) as [LogoKey, ...LogoKey[]]);
export const logoName = (k: LogoKey) => LOGOS[k].name;

export const Logo: React.FC<{ id: LogoKey; size: number; style?: React.CSSProperties }> = ({ id, size, style }) => {
  const backing = useBacking();
  const def: LogoDef = LOGOS[id];
  const f: LogoFile = backing === "green" && def.onGreen ? def.onGreen : def;
  return (
    <Img
      src={staticFile(`${LOGO_DIR}/${f.file}`)}
      style={{ width: size, height: size, objectFit: "contain", display: "block", filter: f.white ? "brightness(0) invert(1)" : undefined, ...style }}
    />
  );
};

/** Square logo node: opaque tile, hairline border, small corner ticks. `logo: null` shows a monogram. */
export const LogoNode: React.FC<{ logo: LogoKey | null; monogram?: string; size?: number; style?: React.CSSProperties }> = ({
  logo,
  monogram = "A",
  size = 108,
  style,
}) => (
  <div
    style={{
      position: "absolute",
      width: size,
      height: size,
      background: term.color.panel,
      border: `1px solid ${term.color.hairlineBright}`,
      boxSizing: "border-box",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      ...style,
    }}
  >
    <CornerTicks size={Math.round(size / 9)} c={term.color.ice} />
    {logo ? (
      <Logo id={logo} size={Math.round(size / 2)} />
    ) : (
      <span style={{ fontFamily: font.mono, fontWeight: 700, fontSize: Math.round(size * 0.42), color: term.color.ice }}>{monogram}</span>
    )}
  </div>
);

import { noise2D } from "@remotion/noise";
import { AbsoluteFill, Img, OffthreadVideo, interpolate, random, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { z } from "zod";
import { Backed } from "../shared/GreenScreen";
import { SafeZoneGuide, useFormat } from "../shared/formats";
import { SfxCue } from "../shared/sfx";
import { formatMx, upperKeepName } from "../shared/text";
import { doc } from "./theme";

// Building blocks shared by every Documental element. Refactored from prototypes/c/components.tsx
// (which stays untouched as the approved reference). Rule for green-screen delivery: everything
// that is drawn over green is fully opaque. Grain, vignette, dust and B-roll only exist in the
// "style" preview backing.

const { color } = doc;

export const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

// ── Shared schema fields ────────────────────────────────────────────────────────────────────
export const backingField = z
  .enum(["green", "style", "transparent"])
  .describe("green = #00FF00 for chroma key · style = preview over the Documental look · transparent = alpha render");
export const previewField = z
  .enum(["charcoal", "c1-datacenter", "c2-ticker", "map"])
  .describe("Background used only when backing = style");
export const baseSchema = z.object({
  backing: backingField,
  preview: previewField,
  seconds: z.number().min(1).max(12).describe("Clip length (enter + hold + exit)"),
  safeGuide: z.boolean().describe("Studio preview only: shade the areas platform UI covers. Keep off for renders"),
  sfx: z.boolean().describe("Bake the element's sound effects (theme.ts → sfx, map in media/soyluisart/audio/GUIA-EFECTOS.md)"),
});
export type BaseProps = z.infer<typeof baseSchema>;
export { useFormat, upperKeepName };

/** One Documental sound cue: the file's hit lands on frame `at`; `frames` makes it a bed. */
export const DSfx: React.FC<{ kind: keyof typeof doc.sfx; at: number; frames?: number; volume?: number; on: boolean }> = ({ kind, ...rest }) => (
  <SfxCue def={doc.sfx[kind]} {...rest} />
);

/** Rough rendered width of a caps string (em factor per character) — used to wrap/fit on vertical. */
export const textWidth = (s: string, fontSize: number, em = 0.7) => Array.from(s).length * em * fontSize;

/** Greedy word wrap by estimated width. */
export const wrapWords = (ws: string[], fontSize: number, maxW: number, em = 0.7, gapEm = 0.24): string[][] => {
  const lines: string[][] = [];
  let cur: string[] = [];
  let w = 0;
  for (const word of ws) {
    const ww = textWidth(word, fontSize, em);
    const add = cur.length === 0 ? ww : w + gapEm * fontSize + ww;
    if (cur.length > 0 && add > maxW) {
      lines.push(cur);
      cur = [word];
      w = ww;
    } else {
      cur.push(word);
      w = add;
    }
  }
  if (cur.length) lines.push(cur);
  return lines;
};
export const accentField = z.enum(["amber", "red"]);
export type Variant<P> = { id: string; props: P };
export const accentColor = (a: "amber" | "red") => (a === "red" ? color.red : color.amber);

// ── Style-preview backdrops (never drawn over green) ─────────────────────────────────────────
const falProto = (file: string) => staticFile(`soyluisart/automated-research/fal/proto/${file}`);

export const Broll: React.FC<{ file: string; dim?: number; from?: number; to?: number; origin?: string; trimBefore?: number }> = ({
  file,
  dim = 0.6,
  from = 1.06,
  to = 1.14,
  origin = "50% 50%",
  trimBefore = 0,
}) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  return (
    <AbsoluteFill style={{ overflow: "hidden", background: color.black }}>
      <OffthreadVideo
        src={falProto(file)}
        muted
        trimBefore={trimBefore}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          filter: `${doc.grade} brightness(${dim})`,
          scale: String(interpolate(frame, [0, durationInFrames], [from, to], { ...clamp, easing: doc.ease.slow })),
          transformOrigin: origin,
        }}
      />
    </AbsoluteFill>
  );
};

export const FilmGrain: React.FC<{ opacity?: number }> = ({ opacity = doc.grain.opacity }) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width / 2} ${height / 2}`}
      preserveAspectRatio="none"
      style={{ position: "absolute", inset: 0, mixBlendMode: "overlay", opacity, pointerEvents: "none" }}
    >
      <filter id="doc-grain" x="0" y="0" width="100%" height="100%">
        <feTurbulence type="fractalNoise" baseFrequency={doc.grain.frequency} numOctaves={2} seed={frame % 997} stitchTiles="stitch" />
        <feColorMatrix type="saturate" values="0" />
        <feComponentTransfer>
          <feFuncR type="linear" slope={1.6} intercept={-0.3} />
          <feFuncG type="linear" slope={1.6} intercept={-0.3} />
          <feFuncB type="linear" slope={1.6} intercept={-0.3} />
        </feComponentTransfer>
      </filter>
      <rect width={width / 2} height={height / 2} filter="url(#doc-grain)" />
    </svg>
  );
};

export const Vignette: React.FC = () => (
  <AbsoluteFill
    style={{
      pointerEvents: "none",
      background: "radial-gradient(ellipse 72% 68% at 50% 50%, rgba(0,0,0,0) 45%, rgba(0,0,0,0.55) 85%, rgba(0,0,0,0.8) 100%)",
    }}
  />
);

export const Dust: React.FC<{ count?: number }> = ({ count = 36 }) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {Array.from({ length: count }).map((_, i) => {
        const x0 = random(`dx-${i}`) * 1920;
        const y0 = random(`dy-${i}`) * 1080;
        const s = 2 + random(`ds-${i}`) * 4;
        const speed = 0.2 + random(`dv-${i}`) * 0.6;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x0 + noise2D(`dn-${i}`, frame * 0.01, 0) * 30,
              top: (((y0 - frame * speed) % 1080) + 1080) % 1080,
              width: s,
              height: s,
              borderRadius: s,
              background: color.bone,
              opacity: 0.18 + random(`do-${i}`) * 0.4,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

/** Faint stylised street map (the network beat's backdrop). */
export const MapLines: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames, width, height } = useVideoConfig();
  const lines: string[] = [];
  for (let i = -2; i < Math.ceil(height / 48) + 4; i++) {
    const pts = Array.from({ length: Math.ceil(width / 200) + 3 }, (_, k) => {
      const x = k * 200 - 100;
      const y = i * 48 + noise2D("mh", i * 0.7, k * 0.3) * 26;
      return `${k === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`;
    });
    lines.push(pts.join(" "));
  }
  for (let j = -2; j < Math.ceil(width / 48) + 4; j++) {
    const pts = Array.from({ length: Math.ceil(height / 180) + 3 }, (_, k) => {
      const y = k * 180 - 90;
      const x = j * 48 + noise2D("mv", j * 0.7, k * 0.3) * 26;
      return `${k === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`;
    });
    lines.push(pts.join(" "));
  }
  return (
    <AbsoluteFill style={{ background: color.charcoal }}>
      <AbsoluteFill style={{ scale: String(interpolate(frame, [0, durationInFrames], [1.0, 1.06], clamp)), rotate: "-4deg" }}>
        <svg width={width} height={height} style={{ position: "absolute", inset: 0 }}>
          <g stroke={color.bone} fill="none">
            {lines.map((d, i) => (
              <path key={i} d={d} strokeOpacity={random(`ml-${i}`) > 0.8 ? 0.1 : 0.045} strokeWidth={1} />
            ))}
            <g transform={`translate(${width / 2 - 960} ${height * 0.55 - 590})`}>
              <path d="M -40 900 C 400 760 700 700 960 590 S 1500 330 1980 260" stroke={color.red} strokeOpacity={0.35} strokeWidth={4} />
              <path d="M 300 -40 C 420 300 600 500 960 590 S 1400 900 1500 1120" stroke={color.amber} strokeOpacity={0.18} strokeWidth={3} />
            </g>
          </g>
        </svg>
      </AbsoluteFill>
      <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 55%, rgba(17,19,22,0) 0%, rgba(17,19,22,0.85) 70%)" }} />
    </AbsoluteFill>
  );
};

export const Backdrop: React.FC<{ kind: BaseProps["preview"] }> = ({ kind }) => {
  if (kind === "map") return <MapLines />;
  if (kind === "charcoal") return <AbsoluteFill style={{ background: color.charcoal }} />;
  return (
    <AbsoluteFill>
      {kind === "c1-datacenter" ? (
        <Broll file="c1-datacenter-amber.mp4" dim={0.62} from={1.05} to={1.13} />
      ) : (
        <Broll file="c2-ticker-machine.mp4" dim={0.45} from={1.08} to={1.14} origin="60% 45%" />
      )}
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(17,19,22,0.1) 0%, rgba(17,19,22,0.55) 100%)" }} />
      <Dust />
    </AbsoluteFill>
  );
};

/** Gate weave: ±1.5 px drift like film in a projector gate. Safe over green (it only moves the element). */
export const GateWeave: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const frame = useCurrentFrame();
  const x = noise2D("weave-x", frame * 0.35, 0) * doc.weavePx;
  const y = noise2D("weave-y", 0, frame * 0.35) * doc.weavePx;
  return <AbsoluteFill style={{ translate: `${x.toFixed(2)}px ${y.toFixed(2)}px` }}>{children}</AbsoluteFill>;
};

/** Every element's outer frame: green / style preview / transparent, gate weave, and (style only) vignette + grain. */
export const DocFrame: React.FC<Pick<BaseProps, "backing" | "preview" | "safeGuide"> & { children: React.ReactNode; weave?: boolean }> = ({
  backing,
  preview,
  safeGuide,
  children,
  weave = true,
}) => (
  <Backed backing={backing} styleBackground={<Backdrop kind={preview} />}>
    {weave ? <GateWeave>{children}</GateWeave> : <AbsoluteFill>{children}</AbsoluteFill>}
    {backing === "style" ? (
      <>
        <Vignette />
        <FilmGrain />
      </>
    ) : null}
    {safeGuide ? <SafeZoneGuide /> : null}
  </Backed>
);

// ── Motion primitives (all key-safe: no opacity ramps over green) ───────────────────────────

/** A word that lands hard: from 1.32× to set in 4 frames; appears in one step (no soft fade). */
export const LandingWord: React.FC<{ delay: number; children: React.ReactNode; style?: React.CSSProperties }> = ({ delay, children, style }) => {
  const frame = useCurrentFrame();
  return (
    <span
      style={{
        display: "inline-block",
        opacity: frame > delay ? 1 : 0,
        scale: String(interpolate(frame, [delay, delay + 4], [1.32, 1], { ...clamp, easing: doc.ease.land })),
        ...style,
      }}
    >
      {children}
    </span>
  );
};

/** Masked rise: the line slides up out of its own box (replaces the prototype's soft fades). */
export const Rise: React.FC<{ delay: number; frames?: number; children: React.ReactNode; style?: React.CSSProperties }> = ({
  delay,
  frames = 9,
  children,
  style,
}) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [delay, delay + frames], [0, 1], { ...clamp, easing: doc.ease.land });
  return (
    <div style={{ overflow: "hidden", paddingBottom: 8, marginBottom: -8, ...style }}>
      <div style={{ translate: `0 ${((1 - p) * 110).toFixed(2)}%` }}>{children}</div>
    </div>
  );
};

/** 0 → 1 over the last `frames` frames of the composition. */
export const useExit = (frames: number = doc.exitFrames) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  return interpolate(frame, [durationInFrames - frames - 1, durationInFrames - 1], [0, 1], { ...clamp, easing: doc.ease.leave });
};

/** Hard wipe-out of a block at the end of the clip (left→right by default). */
export const ExitWipe: React.FC<{ children: React.ReactNode; dir?: "right" | "left"; frames?: number; style?: React.CSSProperties }> = ({
  children,
  dir = "right",
  frames,
  style,
}) => {
  const p = useExit(frames);
  const pct = `${(p * 100).toFixed(2)}%`;
  return (
    <div style={{ clipPath: dir === "right" ? `inset(-40px -40px -40px ${pct})` : `inset(-40px ${pct} -40px -40px)`, ...style }}>{children}</div>
  );
};

/** Clip reveal of a tab/bar from the left (0 → 1). */
export const revealRight = (p: number) => `inset(0 ${((1 - p) * 100).toFixed(2)}% 0 0)`;
export const revealLeft = (p: number) => `inset(0 0 0 ${((1 - p) * 100).toFixed(2)}%)`;

// ── Text helpers ─────────────────────────────────────────────────────────────────────────────
const norm = (s: string) =>
  s
    .toLocaleLowerCase("es")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^\p{L}\p{N}]/gu, "");
export const isAccent = (word: string, accent: string) => accent.trim() !== "" && accent.split(/\s+/).some((a) => norm(a) === norm(word));
export const words = (s: string) => s.split(/\s+/).filter(Boolean);

/** Mexican number format, the channel standard: 500,000 · 7.5 (see shared/text.ts). */
export const formatNum = formatMx;

/**
 * Thin opaque charcoal-black outline painted UNDER the letters (paint-order), so plain type stays
 * legible over any recording without a plate behind it (user rule 2026-09-27: no boxes, tabs,
 * pills or bands behind text). Fully opaque, so key-safe on green. Pair it with `doc.shadow.*`.
 */
export const outline = (fontSize: number): React.CSSProperties => ({
  WebkitTextStroke: `${Math.max(2, Math.round(fontSize * 0.045))}px ${color.black}`,
  paintOrder: "stroke fill",
});

/**
 * Small caps kicker ("PARTE 1", "INVITADA", timeline titles). Replaces the former bone tab
 * (a filled plate) since 2026-09-27: bone letter-spaced caps with the outline + hard shadow, and a
 * short amber rule on the left (`rules: "both"` for centred layouts). Wipes in left → right.
 */
export const Kicker: React.FC<{ text: string; size?: number; progress: number; rules?: "left" | "both"; style?: React.CSSProperties }> = ({
  text,
  size = 34,
  progress,
  rules = "left",
  style,
}) => {
  const rule = (
    <div style={{ width: Math.round(size * 1.2), height: Math.max(4, Math.round(size * 0.16)), background: color.amber, boxShadow: doc.shadow.small, flexShrink: 0 }} />
  );
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: Math.round(size * 0.5),
        clipPath: progress >= 1 ? undefined : `inset(-40% ${((1 - progress) * 100).toFixed(2)}% -60% -10%)`,
        ...style,
      }}
    >
      {rule}
      <div
        style={{
          ...outline(size),
          fontFamily: doc.font.display,
          fontWeight: 800,
          fontSize: size,
          lineHeight: 1,
          letterSpacing: "0.14em",
          marginRight: rules === "both" ? 0 : "-0.14em",
          color: color.bone,
          textShadow: doc.shadow.small,
          whiteSpace: "nowrap",
        }}
      >
        {text}
      </div>
      {rules === "both" ? rule : null}
    </div>
  );
};

/** Source footnote with the "Fuente:" line: plain serif type (outline + hard shadow), no box. */
export const Footnote: React.FC<{ text: string; source: string; progress: number; style?: React.CSSProperties }> = ({ text, source, progress, style }) => (
  <div
    style={{
      ...outline(31),
      fontFamily: doc.font.serif,
      fontSize: 31,
      lineHeight: 1.4,
      color: color.bone,
      textShadow: doc.shadow.small,
      textAlign: "center",
      textWrap: "balance",
      clipPath: progress >= 1 ? undefined : `inset(-20% ${((1 - progress) * 100).toFixed(2)}% -30% -5%)`,
      ...style,
    }}
  >
    {text}{" "}
    <span style={{ color: color.boneDim, fontStyle: "italic" }}>Fuente: </span>
    <span style={{ color: color.amber, textDecoration: "underline", textUnderlineOffset: 5 }}>{source}</span>
  </div>
);

// ── Logos (unmodified files; monochrome black marks are shown white) ─────────────────────────
export type LogoDef = { file: string; name: string; white?: boolean };
export const LOGOS = {
  openai: { file: "openai.svg", name: "ChatGPT", white: true },
  claude: { file: "claude.svg", name: "Claude" },
  anthropic: { file: "anthropic-mono.svg", name: "Anthropic", white: true },
  // Gemini's colour sparkle contains green, which a chroma key would eat: the one-colour mark is used.
  gemini: { file: "gemini-mono.svg", name: "Gemini", white: true },
  perplexity: { file: "perplexity-white.svg", name: "Perplexity" },
  deepseek: { file: "deepseek.svg", name: "DeepSeek" },
  mistral: { file: "mistral.svg", name: "Mistral" },
  meta: { file: "meta-mono.svg", name: "Meta", white: true },
  xai: { file: "xai.svg", name: "xAI", white: true },
  midjourney: { file: "midjourney.svg", name: "Midjourney", white: true },
} satisfies Record<string, LogoDef>;
export type LogoKey = keyof typeof LOGOS;
export const logoKeyField = z.enum(Object.keys(LOGOS) as [LogoKey, ...LogoKey[]]);

export const Logo: React.FC<{ id: LogoKey; size: number; style?: React.CSSProperties }> = ({ id, size, style }) => {
  const def: LogoDef = LOGOS[id];
  return (
    <Img
      src={staticFile(`soyluisart/automated-research/logos/${def.file}`)}
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
};

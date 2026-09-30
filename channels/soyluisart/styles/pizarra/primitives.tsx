import { Audio } from "@remotion/media";
import { AbsoluteFill, OffthreadVideo, Sequence, interpolate, staticFile, useCurrentFrame } from "remotion";
import { z } from "zod";
import { CHROMA_GREEN } from "../shared/GreenScreen";
import { SafeZoneGuide, useFormat } from "../shared/formats";
import { PixelArt, TAIL_DOWN } from "./pixel";
import { SfxKind, piz } from "./theme";

export { useFormat };
export * from "./pixel";

const { color, font, size, timing } = piz;
export const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

// ── Shared schema ──────────────────────────────────────────────────────────────────────────────
export const backingField = z
  .enum(["board", "cream", "green", "transparent", "aroll"])
  .describe(
    "board = white dotted pizarra · cream = beige dotted variant (press/people) · green = #00FF00 for chroma key · transparent = alpha render · aroll = preview over the test A-roll",
  );
export const baseSchema = z.object({
  backing: backingField,
  seconds: z.number().min(1).max(20).describe("Clip length. Pizarra elements have no exit: they cut out"),
  sfx: z.boolean().describe("Bake the element's sound effects (theme.ts → sfx)"),
  safeGuide: z.boolean().describe("Studio preview only: shade the areas platform UI covers. Keep off for renders"),
});
export type BaseProps = z.infer<typeof baseSchema>;
export type Variant<P> = { id: string; props: P; horizontal?: boolean };
export const base = (backing: BaseProps["backing"], seconds: number): BaseProps => ({ backing, seconds, sfx: true, safeGuide: false });

// Test footage (user's own recording) used by the A-roll showcases.
export const TEST_AROLL = "soyluisart/automated-research/2026-09-27-per-barato/aroll-1080x1920.mp4";
export const TEST_MATTE = "soyluisart/automated-research/2026-09-27-per-barato/aroll-person-alpha-v2.webm";

// ── Text helpers ──────────────────────────────────────────────────────────────────────────────
const norm = (s: string) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^\p{L}\p{N}%$€]/gu, "");
export const isIn = (word: string, list: string) => list.trim() !== "" && list.split(/\s+/).some((a) => norm(a) === norm(word));

// ── Board background ──────────────────────────────────────────────────────────────────────────
/** Dotted pizarra: dots on a fixed 64 px grid, centred so the margins are symmetric (first dot at
 *  (28, 32) on 1080×1920; (32, 28) on 1920×1080). Static: never moves between scenes. */
export const DotBoard: React.FC<{ variant?: "white" | "cream" }> = ({ variant = "white" }) => {
  const { width, height } = useFormat();
  const s = piz.board.spacing;
  const off = (len: number) => (len - Math.floor((len - 40) / s) * s) / 2;
  const ox = off(width);
  const oy = off(height);
  const paper = variant === "cream" ? color.cream : color.paper;
  const dot = variant === "cream" ? color.creamDot : color.dot;
  const r = piz.board.dotRadius;
  return (
    <AbsoluteFill
      style={{
        backgroundColor: paper,
        backgroundImage: `radial-gradient(circle, ${dot} ${r}px, transparent ${r + 0.6}px)`,
        backgroundSize: `${s}px ${s}px`,
        backgroundPosition: `${ox - s / 2}px ${oy - s / 2}px`,
      }}
    />
  );
};

export const ARollVideo: React.FC<{ src: string; punch?: boolean; transparent?: boolean; trimBefore?: number; style?: React.CSSProperties }> = ({
  src,
  punch = false,
  transparent = false,
  trimBefore,
  style,
}) => (
  <OffthreadVideo
    src={staticFile(src)}
    muted
    trimBefore={trimBefore && trimBefore > 0 ? trimBefore : undefined}
    transparent={transparent}
    style={{ width: "100%", height: "100%", objectFit: "cover", transform: punch ? `scale(${timing.punch})` : undefined, transformOrigin: "50% 38%", ...style }}
  />
);

/** Background + safe-area guide for every element. */
/**
 * Vertical only: fits content whose y-extent is [y0, y1] (as laid out on the 1080×1920 sheet) into
 * the graphics zone (y 250–970, `ZONES` in shared/formats.tsx) — scaled down if taller, centred —
 * so nothing lands in the caption band or under the platform UI (user rule 2026-09-27, Codex H6).
 */
export const ZoneFit: React.FC<{ fit?: readonly [number, number]; children: React.ReactNode }> = ({ fit, children }) => {
  const { isVertical, zones, width } = useFormat();
  if (!fit || !isVertical) return <>{children}</>;
  const top = zones.graphics.y + 10;
  const bottom = zones.graphics.y + zones.graphics.h - 10;
  const [y0, y1] = fit;
  const k = Math.min(1, (bottom - top) / (y1 - y0));
  const dest = top + (bottom - top - (y1 - y0) * k) / 2;
  return (
    <AbsoluteFill style={{ transform: `translateY(${(dest - y0).toFixed(1)}px) scale(${k.toFixed(4)})`, transformOrigin: `${width / 2}px ${y0}px` }}>
      {children}
    </AbsoluteFill>
  );
};

export const Stage: React.FC<Pick<BaseProps, "backing" | "safeGuide"> & { children: React.ReactNode; aroll?: string; fit?: readonly [number, number] }> = ({
  backing,
  safeGuide,
  children,
  aroll = TEST_AROLL,
  fit,
}) => (
  <AbsoluteFill style={{ backgroundColor: backing === "green" ? CHROMA_GREEN : "transparent" }}>
    {backing === "board" ? <DotBoard /> : null}
    {backing === "cream" ? <DotBoard variant="cream" /> : null}
    {backing === "aroll" ? (
      <AbsoluteFill>
        <ARollVideo src={aroll} />
      </AbsoluteFill>
    ) : null}
    <ZoneFit fit={fit}>{children}</ZoneFit>
    {safeGuide ? <SafeZoneGuide /> : null}
  </AbsoluteFill>
);

/** True when drawn over footage/green: text needs white + shadow instead of ink. */
export const onVideo = (backing: BaseProps["backing"]) => backing === "aroll" || backing === "green" || backing === "transparent";

// ── Sound ─────────────────────────────────────────────────────────────────────────────────────
/** SFX whose hit lands on frame `at`: the file starts `pre` frames earlier (theme.sfx, measured in
 *  GUIA-EFECTOS.md); if that is before frame 0 the file's head is trimmed instead. `frames` cuts a
 *  typing bed at the last character (4-frame fade-out). */
export const Sfx: React.FC<{ kind: SfxKind; at: number; frames?: number; on?: boolean; volume?: number }> = ({ kind, at, frames, on = true, volume }) => {
  if (!on) return null;
  const def = piz.sfx[kind];
  const v = volume ?? def.volume;
  const start = Math.round(at) - def.pre;
  const trim = start < 0 ? -start : 0;
  const len = frames ? Math.max(4, Math.round(frames) + def.pre - trim) : undefined;
  return (
    <Sequence from={Math.max(0, start)} durationInFrames={len} layout="none" name={`sfx-${kind}`}>
      <Audio
        src={staticFile(def.file)}
        trimBefore={trim > 0 ? trim : undefined}
        volume={len ? (f: number) => (f > len - 4 ? (v * Math.max(0, len - f)) / 4 : v) : v}
      />
    </Sequence>
  );
};

// ── Motion ────────────────────────────────────────────────────────────────────────────────────
/** Fade + small drop (ease-out), whole-pixel offsets so pixel art stays crisp. */
export const Drop: React.FC<{ at: number; px?: number; frames?: number; children: React.ReactNode; style?: React.CSSProperties; solid?: boolean }> = ({
  at,
  px = timing.iconDropPx,
  frames = timing.iconDrop,
  children,
  style,
  solid = false,
}) => {
  const frame = useCurrentFrame();
  if (frame < at) return <div style={{ visibility: "hidden", ...style }}>{children}</div>;
  const p = interpolate(frame, [at, at + frames], [0, 1], { ...clamp, easing: piz.ease.out });
  return (
    <div style={{ opacity: solid ? 1 : p, transform: `translateY(${Math.round((p - 1) * px)}px)`, ...style }}>{children}</div>
  );
};

/** Hard appear at `at` (state swaps, pops). */
export const Show: React.FC<{ at: number; children: React.ReactNode; style?: React.CSSProperties }> = ({ at, children, style }) => {
  const frame = useCurrentFrame();
  return <div style={{ visibility: frame >= at ? "visible" : "hidden", ...style }}>{children}</div>;
};

/** Typewriter at 1 char/frame. Full text is laid out from frame 0 (untyped chars invisible), so
 *  centred lines never shift. Words listed in `accent` are drawn in the accent colour. The block
 *  fades 0.5 → 1 over 5 frames (his "pink → red" first letters) unless `solid` (green/alpha). */
export const TypeOn: React.FC<{
  text: string;
  at: number;
  accent?: string;
  color?: string;
  accentColor?: string;
  fontSize?: number;
  fontFamily?: string;
  weight?: number;
  letterSpacing?: string;
  lineHeight?: number;
  align?: React.CSSProperties["textAlign"];
  solid?: boolean;
  caret?: boolean;
  cps?: number;
  style?: React.CSSProperties;
}> = ({
  text,
  at,
  accent = "",
  color: ink = color.ink,
  accentColor = color.accent,
  fontSize = size.heading,
  fontFamily = font.heading,
  weight = piz.weight.heading,
  letterSpacing = "-0.01em",
  lineHeight = 1,
  align = "center",
  solid = false,
  caret = false,
  cps = timing.charsPerFrame,
  style,
}) => {
  const frame = useCurrentFrame();
  const shown = Math.max(0, Math.floor((frame - at + 1) * cps));
  const op = solid ? 1 : interpolate(frame, [at, at + timing.blockFade], [0.5, 1], clamp);
  let i = 0;
  const tokens = text.split(/(\s+|\n)/);
  const typing = shown > 0 && shown < Array.from(text).length;
  return (
    <div style={{ font: `${weight} ${fontSize}px ${fontFamily}`, letterSpacing, lineHeight, textAlign: align, whiteSpace: "pre-wrap", opacity: frame >= at ? op : 0, ...style }}>
      {tokens.map((tok, ti) => {
        const col = isIn(tok, accent) ? accentColor : ink;
        return (
          <span key={ti} style={{ color: col }}>
            {Array.from(tok).map((ch, ci) => {
              const vis = i++ < shown;
              return (
                <span key={ci} style={{ color: vis ? col : "transparent" }}>
                  {ch}
                </span>
              );
            })}
          </span>
        );
      })}
      {caret && typing ? <Caret height={fontSize * 0.9} /> : null}
    </div>
  );
};

export const Caret: React.FC<{ height: number; color?: string; blink?: boolean }> = ({ height, color: col = color.ink, blink = false }) => {
  const frame = useCurrentFrame();
  const on = !blink || Math.floor(frame / timing.caretBlink) % 2 === 0;
  return (
    <span
      style={{ display: "inline-block", width: Math.round(height * 0.42), height: Math.round(height), background: on ? col : "transparent", verticalAlign: "-0.12em", marginLeft: 4 }}
    />
  );
};

/** Handwritten note: 4-frame fade + a subtle left→right write-on wipe. */
export const HandNote: React.FC<{
  text: string;
  at: number;
  color?: string;
  fontSize?: number;
  align?: React.CSSProperties["textAlign"];
  solid?: boolean;
  shadow?: boolean;
  style?: React.CSSProperties;
}> = ({ text, at, color: col = color.handInk, fontSize = size.hand, align = "center", solid = false, shadow = false, style }) => {
  const frame = useCurrentFrame();
  const wipeFrames = Math.max(8, Math.round(Array.from(text).length * 0.6));
  const p = interpolate(frame, [at, at + wipeFrames], [0, 1], { ...clamp, easing: piz.ease.out });
  const op = solid ? 1 : interpolate(frame, [at, at + timing.noteFade], [0, 1], clamp);
  return (
    <div
      style={{
        font: `400 ${fontSize}px ${font.hand}`,
        color: col,
        lineHeight: 1.05,
        textAlign: align,
        whiteSpace: "pre-wrap",
        opacity: frame >= at ? op : 0,
        clipPath: `inset(-20% ${((1 - p) * 100).toFixed(2)}% -30% -5%)`,
        textShadow: shadow ? "0 2px 8px rgba(0,0,0,0.45)" : undefined,
        ...style,
      }}
    >
      {text}
    </div>
  );
};

/** Heading (TypeOn) + hand note glued as a pair. The note fades in on the beat; the heading starts
 *  typing 3 frames later (ANALISIS §11 HeadingPair). */
export const HeadingPair: React.FC<{
  heading: string;
  note: string;
  at: number;
  accent?: string;
  headingColor?: string;
  noteColor?: string;
  align?: "left" | "center" | "right";
  headingSize?: number;
  noteSize?: number;
  maxWidth?: number;
}> = ({ heading, note, at, accent = "", headingColor = color.ink, noteColor = color.handInk, align = "center", headingSize = size.heading, noteSize = size.hand, maxWidth }) => (
  <div style={{ display: "flex", flexDirection: "column", alignItems: align === "center" ? "center" : align === "left" ? "flex-start" : "flex-end", gap: 6, maxWidth }}>
    <TypeOn text={heading} at={at + timing.headingAfterNote} accent={accent} color={headingColor} fontSize={headingSize} align={align} />
    {note ? <HandNote text={note} at={at} color={noteColor} fontSize={noteSize} align={align} /> : null}
  </div>
);

// ── Pixel UI ──────────────────────────────────────────────────────────────────────────────────
/** Stepped-corner polygon (pixel look) for a w×h box with step s. */
const stepped = (s: number) =>
  `polygon(${s}px 0, calc(100% - ${s}px) 0, calc(100% - ${s}px) ${s}px, 100% ${s}px, 100% calc(100% - ${s}px), calc(100% - ${s}px) calc(100% - ${s}px), calc(100% - ${s}px) 100%, ${s}px 100%, ${s}px calc(100% - ${s}px), 0 calc(100% - ${s}px), 0 ${s}px, ${s}px ${s}px)`;

/** Pixel speech bubble: white box, 4 px ink border with stepped corners, stepped tail, typed text.
 *  The word being typed is underlined (his active-word underline). */
export const PixelBubble: React.FC<{
  text: string;
  at: number;
  fontSize?: number;
  maxWidth?: number;
  tail?: "left" | "right" | "none";
  sfx?: boolean;
}> = ({ text, at, fontSize = 46, maxWidth = 640, tail = "left", sfx = true }) => {
  const frame = useCurrentFrame();
  const b = 4;
  const px = 6;
  const shown = Math.max(0, frame - at + 1);
  const chars = Array.from(text);
  // Index range of the word currently being typed (for the underline).
  let wStart = 0;
  let wEnd = chars.length;
  if (shown < chars.length) {
    wStart = chars.slice(0, shown).lastIndexOf(" ") + 1;
    const next = chars.indexOf(" ", shown);
    wEnd = next === -1 ? chars.length : next;
  } else {
    wStart = chars.length;
  }
  if (frame < at) return null;
  return (
    <div style={{ position: "relative", display: "inline-block", maxWidth }}>
      <div style={{ background: color.ink, clipPath: stepped(b * 2), padding: b }}>
        <div style={{ background: color.white, clipPath: stepped(b), padding: "18px 26px 22px" }}>
          <div style={{ font: `700 ${fontSize}px ${font.caption}`, color: color.ink, lineHeight: 1.18, letterSpacing: "-0.01em" }}>
            {chars.map((ch, i) => (
              <span
                key={i}
                style={{
                  color: i < shown ? color.ink : "transparent",
                  textDecoration: i >= wStart && i < wEnd && i < shown ? "underline" : undefined,
                  textDecorationThickness: 4,
                  textUnderlineOffset: 8,
                }}
              >
                {ch}
              </span>
            ))}
          </div>
        </div>
      </div>
      {tail !== "none" ? (
        <div style={{ position: "absolute", top: `calc(100% - ${b}px)`, [tail === "left" ? "left" : "right"]: 60, transform: tail === "right" ? "scaleX(-1)" : undefined }}>
          <PixelArt rows={TAIL_DOWN} px={px} />
        </div>
      ) : null}
      <Sfx kind="type" at={at} frames={chars.length} on={sfx} />
    </div>
  );
};

/** "+SEGUIR"-style pixel button: flat accent box, ink border, hard offset shadow, pixel font. */
export const PixelButton: React.FC<{ label: string; fontSize?: number; fill?: string; textColor?: string }> = ({
  label,
  fontSize = 64,
  fill = color.accent,
  textColor = color.white,
}) => {
  const b = Math.round(fontSize / 12);
  return (
    <div
      style={{
        display: "inline-block",
        background: fill,
        color: textColor,
        font: `700 ${fontSize}px ${font.pixel}`,
        lineHeight: 1,
        padding: `${Math.round(fontSize * 0.2)}px ${Math.round(fontSize * 0.36)}px ${Math.round(fontSize * 0.26)}px`,
        border: `${b}px solid ${color.ink}`,
        boxShadow: `${b * 2}px ${b * 2}px 0 ${color.ink}`,
        whiteSpace: "nowrap",
      }}
    >
      {label}
    </div>
  );
};

/** Retro-brutalist window: 4 px ink border, hard 9 px grey shadow, grey title bar with three
 *  square buttons (blue + 2 grey). */
export const RetroWindow: React.FC<{ title: string; width: number; children: React.ReactNode; titleSize?: number; square?: boolean }> = ({
  title,
  width,
  children,
  titleSize = 38,
  square = false,
}) => {
  const b = piz.ui.border;
  const btn = Math.round(titleSize * 0.5);
  return (
    <div style={{ width, border: `${b}px solid ${color.ink}`, background: color.white, boxShadow: `${piz.ui.hardShadow}px ${piz.ui.hardShadow}px 0 ${piz.ui.shadowColor}` }}>
      <div style={{ display: "flex", alignItems: "center", gap: 14, background: color.bar, borderBottom: `${b}px solid ${color.ink}`, padding: "14px 22px" }}>
        {square ? (
          <div style={{ width: btn, height: btn, background: color.ink }} />
        ) : (
          <div style={{ display: "flex", gap: 8 }}>
            {[color.accent, color.grey, color.grey].map((c, i) => (
              <div key={i} style={{ width: btn, height: btn, background: c, border: `3px solid ${color.ink}` }} />
            ))}
          </div>
        )}
        <div style={{ font: `700 ${titleSize}px ${font.caption}`, color: color.ink, letterSpacing: "-0.01em" }}>{title}</div>
      </div>
      {children}
    </div>
  );
};

/** Tile with ink border and hard shadow (logos, attachments). */
export const Tile: React.FC<{ size: number; children: React.ReactNode; border?: string; style?: React.CSSProperties }> = ({ size: s, children, border = color.ink, style }) => (
  <div
    style={{
      width: s,
      height: s,
      background: color.white,
      border: `${piz.ui.border}px solid ${border}`,
      boxShadow: `6px 6px 0 ${piz.ui.shadowColor}`,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      boxSizing: "border-box",
      ...style,
    }}
  >
    {children}
  </div>
);

// ── Stick figure (3 looks × 6 expressions × 4 poses: see StickFigure.tsx) ──────────────────────
export * from "./StickFigure";

// ── Text over video: white + soft shadow (captions: see Captions.tsx — face shots only) ──────
export const videoTextShadow = "0 2px 8px rgba(0,0,0,0.42)";

// ── Logos (unmodified files; mono marks are ink) ──────────────────────────────────────────────
export const LOGOS = {
  chatgpt: { file: "openai-mono.svg", name: "ChatGPT" },
  claude: { file: "claude.svg", name: "Claude" },
  gemini: { file: "gemini.svg", name: "Gemini" },
  perplexity: { file: "perplexity-mono.svg", name: "Perplexity" },
  deepseek: { file: "deepseek.svg", name: "DeepSeek" },
  grok: { file: "xai.svg", name: "Grok" },
  copilot: { file: "copilot.svg", name: "Copilot" },
  cursor: { file: "cursor-mono.svg", name: "Cursor" },
  mistral: { file: "mistral.svg", name: "Mistral" },
  midjourney: { file: "midjourney.svg", name: "Midjourney" },
  n8n: { file: "n8n.svg", name: "n8n" },
  zapier: { file: "zapier.svg", name: "Zapier" },
} as const;
export type LogoKey = keyof typeof LOGOS;
export const logoField = z.enum(Object.keys(LOGOS) as [LogoKey, ...LogoKey[]]);
// Over chroma green, marks that contain green (Gemini's gradient, Copilot's) switch to their
// one-colour files so the key doesn't eat them.
const KEY_SAFE: Partial<Record<LogoKey, string>> = { gemini: "gemini-mono.svg", copilot: "copilot-mono.svg" };
export const logoSrc = (k: LogoKey, keySafe = false) =>
  staticFile(`soyluisart/automated-research/logos/${keySafe && KEY_SAFE[k] ? KEY_SAFE[k] : LOGOS[k].file}`);

import { interpolate, useCurrentFrame } from "remotion";
import { C, F, clamp } from "./parts";
import { B, num, pu } from "./figures";
import { WORDS, findWord, isKept, srcFrame, type Word } from "./timing";

// Word-by-word captions: 2–4 words per page, each word appears as it is spoken, the active one in
// electric blue. v3 (user feedback on v2): NO plate/box behind them — plain bold type made legible
// by a thin dark outline (paint-order stroke, drawn outside the letters) and a soft shadow, so they
// read over the white wall, the grey blanket and the dark board alike.

export type Token = { text: string; from: number; to: number };
export type Page = { tokens: Token[]; from: number; to: number };

/** Display fixes for transcription artifacts and the on-screen figures. */
const fixes = (): Map<number, string> => {
  const m = new Map<number, string>();
  m.set(findWord("50", { after: 28 }).i, num(pu(B))); // whisper wrote ".50."
  // The recording says "10" for company B's price; the screen shows the figure in figures.ts.
  m.set(findWord("10", { after: 25.5 }).i, String(B.price));
  return m;
};

const clean = (w: Word, fix: Map<number, string>) => fix.get(w.i) ?? w.text.replace(/[.,]+$/g, "").replace(/^[.,]+/g, "");

const MAX_WORDS = 4;
const MAX_CHARS = 18;
const GAP_S = 0.35;
const HOLD_F = 8;

export const buildPages = (): Page[] => {
  const fix = fixes();
  const kept = WORDS.filter((w) => isKept((w.start + w.end) / 2));
  const pages: Page[] = [];
  let cur: Token[] = [];
  let prev: Word | null = null;
  const flush = () => {
    if (cur.length) pages.push({ tokens: cur, from: cur[0].from, to: cur[cur.length - 1].to });
    cur = [];
  };
  for (const w of kept) {
    const text = clean(w, fix);
    const chars = cur.reduce((s, x) => s + x.text.length + 1, 0) + text.length;
    const breakBefore =
      cur.length >= MAX_WORDS ||
      chars > MAX_CHARS ||
      (prev && (w.start - prev.end > GAP_S || /[.,?]$/.test(prev.text)));
    if (breakBefore) flush();
    cur.push({ text, from: srcFrame(w.start), to: Math.max(srcFrame(w.end), srcFrame(w.start) + 2) });
    prev = w;
  }
  flush();
  // Each page holds until the next one starts (at most HOLD_F frames after its last word).
  return pages.map((p, i) => ({ ...p, to: Math.min(pages[i + 1]?.from ?? Infinity, p.to + HOLD_F) }));
};

const PAGES = buildPages();

/** Legibility without a plate: a thin dark outline painted under the fill + a soft shadow. */
export const OUTLINE = "#04060B";
export const plainText = (size: number, outline = OUTLINE): React.CSSProperties => ({
  WebkitTextStroke: `${Math.max(4, Math.round(size * 0.13))}px ${outline}`,
  paintOrder: "stroke fill",
  textShadow: "0 3px 14px rgba(0,0,0,0.45)",
});

export type CaptionBox = { left: number; width: number; bottom: number; size: number; align: "center" | "left" };

export const Captions: React.FC<{ box: (frame: number) => CaptionBox | null }> = ({ box }) => {
  const frame = useCurrentFrame();
  const page = PAGES.find((p) => frame >= p.from && frame < p.to);
  const b = box(frame);
  if (!page || !b) return null;
  const spoken = page.tokens.filter((tk) => frame >= tk.from);
  const active = spoken[spoken.length - 1];
  return (
    <div
      style={{
        position: "absolute",
        left: b.left,
        width: b.width,
        bottom: b.bottom,
        display: "flex",
        justifyContent: b.align === "center" ? "center" : "flex-start",
      }}
    >
      <div
        style={{
          ...plainText(b.size),
          fontFamily: F.display,
          fontWeight: 700,
          fontSize: b.size,
          letterSpacing: "-0.02em",
          lineHeight: 1.08,
          color: C.text,
          textAlign: b.align,
          maxWidth: b.width,
        }}
      >
        {page.tokens.map((tk, i) => {
          const shown = frame >= tk.from;
          const p = interpolate(frame, [tk.from - 1, tk.from + 2], [0, 1], clamp);
          return (
            <span key={i}>
              {i > 0 ? " " : ""}
              <span
                style={{
                  display: "inline-block",
                  color: tk === active ? C.blue : C.text,
                  opacity: shown ? p : 0,
                  translate: `0px ${(1 - p) * 8}px`,
                }}
              >
                {tk.text}
              </span>
            </span>
          );
        })}
      </div>
    </div>
  );
};

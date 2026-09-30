import cuts from "../cut/cuts.json";
import transcript from "../../../../../media/soyluisart/automated-research/2026-09-27-per-barato/transcript-words.json";

// Source (recording) time → cut time, from the keep list in cut/cuts.json. Every insert and
// caption is placed through these helpers from the word timestamps; nothing is hard-coded.

export const FPS = cuts.fps;
export const KEEP = cuts.keep;

/** Keep segments in frames: where each one starts in the cut and in the source. */
export const SEGMENTS = (() => {
  let at = 0;
  return KEEP.map((k) => {
    const srcIn = Math.round(k.in * FPS);
    const srcOut = Math.round(k.out * FPS);
    const seg = { cutFrom: at, srcIn, srcOut, frames: srcOut - srcIn };
    at += seg.frames;
    return seg;
  });
})();

export const TOTAL_FRAMES = SEGMENTS.reduce((s, x) => s + x.frames, 0);

/** Source seconds → cut seconds. Times inside a removed stretch snap to the join. */
export const srcToCut = (t: number): number => {
  let acc = 0;
  for (const k of KEEP) {
    if (t < k.in) return acc;
    if (t <= k.out) return acc + (t - k.in);
    acc += k.out - k.in;
  }
  return acc;
};

export const isKept = (t: number) => KEEP.some((k) => t >= k.in && t <= k.out);

/** Source seconds → cut frame. */
export const srcFrame = (t: number) => Math.round(srcToCut(t) * FPS);

export type Word = { text: string; start: number; end: number; i: number };
export const WORDS: Word[] = transcript.words.map((w, i) => ({ ...w, i }));

export const norm = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]/g, "");

/**
 * First transcript word matching `text` (accent/punctuation-insensitive) that starts at or after
 * `after` source seconds and survives the cut. Throws if missing, so a typo fails the build.
 */
export const findWord = (text: string, opts: { after?: number } = {}): Word => {
  const target = norm(text);
  const w = WORDS.find((x) => x.start >= (opts.after ?? 0) && norm(x.text) === target && isKept((x.start + x.end) / 2));
  if (!w) throw new Error(`findWord: "${text}" after ${opts.after ?? 0}s not found`);
  return w;
};

/** Cut frame where a word starts / ends. */
export const at = (text: string, after?: number) => srcFrame(findWord(text, { after }).start);
export const endOf = (text: string, after?: number) => srcFrame(findWord(text, { after }).end);

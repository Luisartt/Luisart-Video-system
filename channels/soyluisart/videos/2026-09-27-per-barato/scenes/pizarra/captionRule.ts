import { buildPages, type Page } from "../Captions";

// Caption rule (user, 2026-09-27, final): captions NEVER appear while any graphic is on screen —
// animation, board, title, figure, arrow, icon or behind-head word. They only appear on pure
// talking-head stretches where nothing else is on screen (a split layout always has a graphic on
// top, so split stretches get none). Each edit passes the frame windows where it shows ANY graphic;
// a caption page shows only on its frames outside those windows, and never for a run shorter than
// MIN_SHOW frames (no flashes between two graphics).

export type Window = readonly [number, number];
export type CaptionGate = (frame: number) => { page: Page | null; show: boolean };

const MIN_SHOW = 12; // frames

export const makeCaptionGate = (graphics: Window[], total: number): CaptionGate => {
  const pages = buildPages();
  const busy = new Uint8Array(total + 1);
  for (const [a, b] of graphics) for (let f = Math.max(0, a); f < Math.min(total + 1, b); f++) busy[f] = 1;
  const show = new Uint8Array(total + 1);
  for (const p of pages) {
    let f = p.from;
    while (f < p.to) {
      if (busy[f]) {
        f++;
        continue;
      }
      let e = f;
      while (e < p.to && !busy[e]) e++;
      if (e - f >= MIN_SHOW) for (let k = f; k < e; k++) show[k] = 1;
      f = e;
    }
  }
  return (frame: number) => {
    const page = pages.find((p) => frame >= p.from && frame < p.to) ?? null;
    return { page, show: page !== null && show[frame] === 1 };
  };
};

/** Frames with a caption on screen (for the BRIEF / checks). */
export const captionFrames = (gate: CaptionGate, total: number) => {
  let n = 0;
  for (let f = 0; f < total; f++) if (gate(f).show) n++;
  return n;
};

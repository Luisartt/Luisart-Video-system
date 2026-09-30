import sfxIndex from "../../../../../media/soyluisart/audio/efectos/sfx-index.json";
import { A, B, money, num, pu } from "./figures";
import type { Cue } from "./Sound";
import { TOTAL_FRAMES, at, endOf } from "./timing";

// v2 cue list. Each sound lands (its measured peak, from sfx-index.json) on the frame its visual
// lands; frames come from the transcript words through the cut map, like the graphics.
// Whooshes only on the opening hook and the two board transitions (user's rule).

export type Entry = { file: string; preRollFrames30: number | null; license: string; source: string };
export const INDEX = new Map((sfxIndex.files as Entry[]).map((f) => [f.file.replace(/^efectos\//, ""), f]));

export const LIB = "soyluisart/audio/efectos/";

/** Cue on `frame` using the library's peak offset for `file` (category/name.wav). */
export const cue = (name: string, frame: number, file: string, vol: number, extra: Partial<Cue> = {}): Cue => {
  const e = INDEX.get(file);
  if (!e) throw new Error(`sfx not in library index: ${file}`);
  return { name, at: frame, file: LIB + file, vol, lead: e.preRollFrames30 ?? 0, max: 45, ...extra };
};

// Split-flap: a real board recording, cut to the few frames the tiles flip (different stretch each time).
export const flap = (name: string, frame: number, trim: number, frames: number, vol = 0.24) =>
  cue(name, frame, "ticker/ticker-split-flap-01.wav", vol, { lead: 0, trim, max: frames });

export const CUES: Cue[] = [
  // ── Opening hook: digital stab on frame 0, whoosh landing on "2 AÑOS"
  cue("hook · glitch stab", 0, "glitch/glitch-break-01.wav", 0.22, { max: 20 }),
  cue("hook · whoosh → 2 AÑOS", at("dos"), "whoosh/whoosh-epic-07.wav", 0.26, { max: 40 }),
  // ── Hook words
  cue("decrypt · Una acción", at("acción"), "typing/typing-key-presses-short-02.wav", 0.16, { max: 16 }),
  cue("BARATA lands", at("barata"), "impact/impact-bass-hit-short-01.wav", 0.24, { max: 24 }),
  cue("≠ BUENA INVERSIÓN", at("buena"), "glitch/glitch-quick-01.wav", 0.16, { max: 28 }),
  cue("[01] La trampa tag", at("aquí"), "pop/pop-soft-01.wav", 0.24),
  // ── Price chip, stamp, compare chips
  flap(`${money(A.price)}.00 flips`, at("precio") - 3, 1500, 12),
  cue("¿REGALADA? stamp", at("regalada"), "misc/misc-stamp-01.wav", 0.32, { max: 24 }),
  cue("PRECIO chip", at("precio", 12.5), "ui/ui-click-tone-01.wav", 0.28),
  cue("UTILIDADES chip", at("utilidades"), "ui/ui-click-mouse-02.wav", 0.28),
  // ── Board in (transition)
  cue("board in · whoosh", at("ahí"), "whoosh/whoosh-air-quick-03.wav", 0.28, { max: 30 }),
  cue("board in · sub", at("ahí"), "impact/impact-sub-boom-01.wav", 0.18, { max: 40 }),
  cue("P/U formula types", at("múltiplo"), "typing/typing-key-presses-short-02.wav", 0.18, { max: 18 }),
  // ── Empresa A
  cue("Empresa A card", at("empresa", 19), "ui/ui-click-select-01.wav", 0.24, { max: 20 }),
  flap(`A · ${money(A.price)} flips`, at("20", 19) - 4, 300, 8),
  flap(`A · ${money(A.eps)} flips`, at("10", 22) - 4, 600, 8),
  cue(`A · P/U = ${num(pu(A))} ding`, at("2", 25), "notification/notification-ding-keyword-01.wav", 0.22, { max: 40 }),
  // ── Empresa B
  flap(`B · ${money(B.price)} flips`, at("vale", 25.5) - 4, 900, 10),
  flap(`B · ${money(B.eps)} flips`, at("2", 27) - 4, 1200, 8),
  cue(`B · P/U = ${num(pu(B))} bleep`, at("50", 28), "data/data-bleep-01.wav", 0.24, { max: 18 }),
  cue(`${num(pu(B))} MÁS CARA · low hit`, at("cara"), "tension/tension-heartbeat-impact-01.wav", 0.3, { max: 40 }),
  cue("takeaway strip", at("aunque"), "ui/ui-click-classic-02.wav", 0.18),
  // ── Board out (transition)
  cue("board out · whoosh", at("antes"), "whoosh/whoosh-wind-short-06.wav", 0.28, { max: 30 }),
  // ── CTA
  cue("¿BARATO lands", at("barato", 38), "notification/notification-pop-hard-01.wav", 0.24, { max: 20 }),
  cue("decrypt · ¿Barato comparado", at("comparado"), "typing/typing-key-presses-short-02.wav", 0.14, { max: 12 }),
  cue("CON QUÉ? lands", at("con", 40), "impact/impact-cinematic-boom-01.wav", 0.16, { max: 30 }),
  // ── Save + outro
  cue("Guarda esto chip", at("guarda"), "ui/ui-tech-select-01.wav", 0.28),
  cue("bookmark fills", at("esto", 41.5), "ui/ui-click-mouse-01.wav", 0.28),
  cue("outro sting", Math.min(endOf("necesitar") - 4, TOTAL_FRAMES - 10), "notification/notification-bell-ding-01.wav", 0.2, { max: 20 }),
];

/** Licences of the files actually used (for BRIEF.md). */
export const licensesOf = (cues: Cue[]) => Array.from(new Set(cues.map((c) => c.file.replace(LIB, "")))).map((f) => {
  const e = INDEX.get(f)!;
  return `${f} — ${e.source}, ${e.license}`;
});
export const CUE_LICENSES = licensesOf(CUES);

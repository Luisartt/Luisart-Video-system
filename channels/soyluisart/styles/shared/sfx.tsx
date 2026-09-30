import { Audio, Sequence, staticFile } from "remotion";

// Baked sound effects for the style libraries (same approach as styles/pizarra → Sfx): each file's
// measured peak (`pre` frames into the file, from media/soyluisart/audio/efectos/sfx-index.json)
// lands on the frame the visual event happens. If that start falls before frame 0 the file's head
// is trimmed instead. Beds (`frames` given) run for that many frames after the event and fade out
// over their last 4 frames. Sound map per element: media/soyluisart/audio/GUIA-EFECTOS.md.

export type SfxDef = { file: string; volume: number; pre: number };

/** Path helper: files live in media/soyluisart/audio/efectos/ (publicDir = media). */
export const fx = (file: string, volume: number, pre: number): SfxDef => ({ file: `soyluisart/audio/efectos/${file}`, volume, pre });

export const SfxCue: React.FC<{ def: SfxDef; at: number; frames?: number; volume?: number; on?: boolean; fade?: number }> = ({
  def,
  at,
  frames,
  volume,
  on = true,
  fade = 4,
}) => {
  if (!on) return null;
  const v = volume ?? def.volume;
  const start = Math.round(at) - def.pre;
  const trim = start < 0 ? -start : 0;
  const len = frames ? Math.max(fade + 1, Math.round(frames) + def.pre - trim) : undefined;
  return (
    <Sequence from={Math.max(0, start)} durationInFrames={len} layout="none" name={`sfx ${def.file.split("/").pop()}`}>
      <Audio
        src={staticFile(def.file)}
        trimBefore={trim > 0 ? trim : undefined}
        volume={len ? (f: number) => (f > len - fade ? (v * Math.max(0, len - f)) / fade : v) : v}
      />
    </Sequence>
  );
};

/** Keeps cues at least `gap` frames apart ("one accent per beat", GUIA-EFECTOS rule 3). */
export const spaced = (frames: number[], gap = 6): number[] => {
  const out: number[] = [];
  for (const f of [...frames].sort((a, b) => a - b)) if (out.length === 0 || f - out[out.length - 1] >= gap) out.push(f);
  return out;
};

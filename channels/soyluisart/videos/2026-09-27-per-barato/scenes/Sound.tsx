import { Audio, Sequence, interpolate, staticFile } from "remotion";
import { FPS, TOTAL_FRAMES, WORDS, isKept, srcFrame } from "./timing";

// v2 sound design. Every cue sits on the frame its visual lands (cue frames come from the same
// word-timed beats as the graphics). Whooshes only on the opening hook and the board transitions;
// everything else gets a smaller fitting sound, one per beat, levels well under the voice.

export type Cue = {
  name: string; // what it accents (shown in the Studio timeline)
  at: number; // frame the sound's transient/peak lands on
  file: string; // path under media/
  vol: number; // linear <Audio> volume (library guide scale: 0.25 ≈ −12 dB)
  trim?: number; // frames skipped at the start of the file (e.g. a later stretch of a long ticker)
  lead?: number; // frames of the sample before its transient (whoosh/riser tails), so the peak lands on `at`
  max?: number; // cut the sample after this many frames (with a short fade)
};

const gain = (db: number) => Math.pow(10, db / 20);

const CueAudio: React.FC<{ cue: Cue }> = ({ cue }) => {
  const from = Math.max(0, cue.at - (cue.lead ?? 0));
  const trim = (cue.trim ?? 0) + Math.max(0, (cue.lead ?? 0) - cue.at); // if the lead would start before frame 0
  const len = Math.min(cue.max ?? 4 * FPS, TOTAL_FRAMES - from);
  if (len <= 0) return null;
  const g = cue.vol;
  return (
    <Sequence name={`sfx · ${cue.name}`} from={from} durationInFrames={len} layout="none">
      <Audio
        src={staticFile(cue.file)}
        trimBefore={trim}
        volume={(f) => g * interpolate(f, [len - 4, len], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })}
      />
    </Sequence>
  );
};

export const SfxTrack: React.FC<{ cues: Cue[] }> = ({ cues }) => (
  <>
    {cues.map((c, i) => (
      <CueAudio key={i} cue={c} />
    ))}
  </>
);

/** Frames where the voice is speaking (word spans padded by 0.12 s), for music ducking. */
const SPEECH = (() => {
  const on = new Uint8Array(TOTAL_FRAMES + 1);
  const pad = Math.round(0.12 * FPS);
  for (const w of WORDS) {
    if (!isKept((w.start + w.end) / 2)) continue;
    const a = Math.max(0, srcFrame(w.start) - pad);
    const b = Math.min(TOTAL_FRAMES, srcFrame(w.end) + pad);
    for (let f = a; f <= b; f++) on[f] = 1;
  }
  // Smooth: gain envelope 0 (speech) … 1 (gap) with ~6-frame attack/release.
  const env = new Float32Array(TOTAL_FRAMES + 1);
  let v = 0;
  for (let f = 0; f <= TOTAL_FRAMES; f++) {
    const target = on[f] ? 0 : 1;
    v += (target - v) * (target < v ? 0.35 : 0.12);
    env[f] = v;
  }
  return env;
})();

/**
 * Music bed: looped to the edit, 0.5 s fade in, 1 s fade out, ducked under the voice and lifted a
 * few dB in the gaps between phrases.
 */
export const MusicBed: React.FC<{ file: string; loopFrames: number; underDb: number; liftDb: number; trimBefore?: number }> = ({
  file,
  loopFrames,
  underDb,
  liftDb,
  trimBefore = 0,
}) => {
  const vol = (f: number) => {
    const fade = interpolate(f, [0, 0.5 * FPS, TOTAL_FRAMES - FPS, TOTAL_FRAMES], [0, 1, 1, 0], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
    const e = SPEECH[Math.min(TOTAL_FRAMES, Math.max(0, f))];
    return fade * gain(underDb + e * liftDb);
  };
  const n = Math.ceil(TOTAL_FRAMES / loopFrames);
  return (
    <>
      {Array.from({ length: n }, (_, i) => (
        <Sequence key={i} name={`music · loop ${i + 1}`} from={i * loopFrames} durationInFrames={Math.min(loopFrames, TOTAL_FRAMES - i * loopFrames)} layout="none">
          <Audio src={staticFile(file)} trimBefore={trimBefore} volume={(f) => vol(f + i * loopFrames)} />
        </Sequence>
      ))}
    </>
  );
};

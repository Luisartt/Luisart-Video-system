import { TOTAL_FRAMES } from "./timing";

// Background music for every version of this short — ONE swappable constant.
//
// Rule (user, 2026-09-27): the USER chooses the music. Claude never picks a bed for them (they
// rejected "Stylz" and every trending option). They drop their files into
//   media/soyluisart/user-provided/musica/
// and tell us which one to use. Until then `USER_MUSIC` stays null and every render goes out with
// NO music (voice + SFX only). To use their track, set the file NAME exactly as it sits in that
// folder, e.g.
//   export const USER_MUSIC: UserMusic | null = { file: "mi-cancion.mp3" };
// and re-render. Levels follow CHANNEL.md: ≈ −22 LUFS at volume 0.25, −2 dB more under the voice
// (≈ −24 LUFS), +3 dB in the gaps between phrases (ducked from the word timings, Sound.tsx), 0.5 s
// fade in, 1 s fade out. Rights for a user-supplied track are the user's call; note its source in
// BRIEF.md.

export const USER_MUSIC_DIR = "soyluisart/user-provided/musica";

export type UserMusic = {
  file: string; // file name inside media/soyluisart/user-provided/musica/ (no sub-paths)
  trimBefore?: number; // frames skipped at the start of the file (start on a downbeat)
  underDb?: number; // gain under the voice (dB)
  liftDb?: number; // extra gain in the gaps (dB)
};

export const USER_MUSIC: UserMusic | null = null;

/** Props for <MusicBed> from the user's folder, or null (= no music) when nothing is set. */
export const musicBedProps = (t: UserMusic | null = USER_MUSIC) => {
  if (!t) return null;
  if (/[\\/]|\.\./.test(t.file)) throw new Error(`USER_MUSIC.file must be a file name inside ${USER_MUSIC_DIR}/, got "${t.file}"`);
  return {
    file: `${USER_MUSIC_DIR}/${t.file}`,
    trimBefore: t.trimBefore ?? 0,
    loopFrames: TOTAL_FRAMES + 1,
    underDb: t.underDb ?? 20 * Math.log10(0.25) - 2,
    liftDb: t.liftDb ?? 3,
  };
};

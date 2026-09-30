// Builds the cut voice track from cut/cuts.json: the A-roll audio with every keep segment
// concatenated sample-exact and a 15 ms fade-out / fade-in at each join (no click).
// Usage: npx tsx channels/soyluisart/videos/2026-09-27-per-barato/cut/build-voice.ts
import { readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const cuts = JSON.parse(readFileSync(join(here, "cuts.json"), "utf8")) as { source: string; keep: { in: number; out: number }[] };
const FADE = 0.015;
const out = join(dirname(cuts.source), "voice-cut.wav");

const parts = cuts.keep.map((k, i) => {
  const len = k.out - k.in;
  const fades = [
    i > 0 ? `afade=t=in:st=0:d=${FADE}` : null,
    i < cuts.keep.length - 1 ? `afade=t=out:st=${(len - FADE).toFixed(3)}:d=${FADE}` : null,
  ].filter(Boolean);
  return `[0:a]atrim=start=${k.in}:end=${k.out},asetpts=PTS-STARTPTS${fades.length ? "," + fades.join(",") : ""}[a${i}]`;
});
const graph = `${parts.join(";")};${cuts.keep.map((_, i) => `[a${i}]`).join("")}concat=n=${cuts.keep.length}:v=0:a=1[out]`;

const r = spawnSync("ffmpeg", ["-v", "error", "-y", "-i", cuts.source, "-filter_complex", graph, "-map", "[out]", "-ar", "48000", "-c:a", "pcm_s16le", out], {
  stdio: "inherit",
});
if (r.status !== 0) process.exit(r.status ?? 1);
console.log(`wrote ${out}`);

// v2 sound design: a mastered copy of the voice (light compression, two-pass loudnorm to
// −15 LUFS / −1.5 dBTP) so the final mix with music and SFX lands near −14 LUFS for social.
const master = join(dirname(cuts.source), "voice-cut-master.wav");
const pre = "highpass=f=70,acompressor=threshold=-20dB:ratio=2.5:attack=8:release=120:makeup=2";
const target = "I=-15:TP=-1.5:LRA=9";
const m = spawnSync("ffmpeg", ["-hide_banner", "-nostats", "-i", out, "-af", `${pre},loudnorm=${target}:print_format=json`, "-f", "null", "-"], {
  encoding: "utf8",
});
const json = JSON.parse(m.stderr.slice(m.stderr.lastIndexOf("{"), m.stderr.lastIndexOf("}") + 1));
const second = `${pre},loudnorm=${target}:measured_I=${json.input_i}:measured_TP=${json.input_tp}:measured_LRA=${json.input_lra}:measured_thresh=${json.input_thresh}:offset=${json.target_offset}:linear=true`;
const r2 = spawnSync("ffmpeg", ["-v", "error", "-y", "-i", out, "-af", second, "-ar", "48000", "-c:a", "pcm_s16le", master], { stdio: "inherit" });
if (r2.status !== 0) process.exit(r2.status ?? 1);
console.log(`wrote ${master}`);

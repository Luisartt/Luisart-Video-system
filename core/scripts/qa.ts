// Flash scan: flags single-frame brightness spikes/drops and stray all-white/all-black frames.
// Usage: npm run qa -- <file> [more files]   (alpha files are scanned over mid-grey)
import { execFileSync } from "node:child_process";

const JUMP = 40;
const WHITE = 245;
const BLACK = 10;

const hasAlpha = (file: string): boolean => {
  const out = execFileSync("ffprobe", ["-v", "error", "-select_streams", "v:0", "-show_entries", "stream=pix_fmt", "-of", "csv=p=0", file]).toString().trim();
  return /yuva|rgba|argb|bgra|gbrap/.test(out);
};

const yavg = (file: string): number[] => {
  const alpha = hasAlpha(file);
  const filter = alpha
    ? "[0:v]format=rgba[fg];color=c=0x808080:s=16x16[bg];[bg][fg]scale2ref[bg2][fg2];[bg2][fg2]overlay=shortest=1,signalstats,metadata=print:key=lavfi.signalstats.YAVG:file=-"
    : "signalstats,metadata=print:key=lavfi.signalstats.YAVG:file=-";
  const args = alpha
    ? ["-v", "error", "-i", file, "-filter_complex", filter, "-f", "null", "-"]
    : ["-v", "error", "-i", file, "-vf", filter, "-f", "null", "-"];
  const out = execFileSync("ffmpeg", args, { maxBuffer: 1 << 28 }).toString();
  return [...out.matchAll(/YAVG=([\d.]+)/g)].map((m) => parseFloat(m[1]));
};

// --allow-white: for clips whose design includes a deliberate white flash transition.
const allowWhite = process.argv.includes("--allow-white");
const files = process.argv.slice(2).filter((a) => !a.startsWith("--"));

let failed = false;
for (const file of files) {
  const y = yavg(file);
  const issues: string[] = [];
  // A run of all-black/all-white frames that reaches the first or last frame is a fade in/out
  // (e.g. an end dip to black), so it counts as an edge.
  const extreme = (v: number) => v >= WHITE || v <= BLACK;
  let headEnd = 0;
  while (headEnd < y.length && extreme(y[headEnd])) headEnd++;
  let tailStart = y.length - 1;
  while (tailStart >= 0 && extreme(y[tailStart])) tailStart--;
  for (let i = 1; i < y.length - 1; i++) {
    const dPrev = y[i] - y[i - 1];
    const dNext = y[i] - y[i + 1];
    if (allowWhite && y[i] >= WHITE - 60) continue;
    if (Math.abs(dPrev) > JUMP && Math.abs(dNext) > JUMP && Math.sign(dPrev) === Math.sign(dNext)) {
      issues.push(`frame ${i}: single-frame ${dPrev > 0 ? "flash" : "drop"} (Y ${y[i - 1].toFixed(0)} → ${y[i].toFixed(0)} → ${y[i + 1].toFixed(0)})`);
    }
    if (extreme(y[i]) && i >= headEnd && i <= tailStart) {
      issues.push(`frame ${i}: all-${y[i] >= WHITE ? "white" : "black"} frame mid-clip (Y ${y[i].toFixed(0)})`);
    }
  }
  if (issues.length === 0) {
    console.log(`PASS ${file} (${y.length} frames)`);
  } else {
    failed = true;
    console.log(`FAIL ${file} (${y.length} frames)`);
    for (const s of issues) console.log(`  ${s}`);
  }
}
process.exit(failed ? 1 : 0);

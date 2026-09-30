// Renders many stills with ONE bundle (the public dir is ~0.5 GB, so bundling per still is slow),
// while holding the same exclusive lock as render-locked.ts.
// Usage: npx tsx core/scripts/stills-locked.ts <outDir> <id>[@frame|@mid] [<id>[@frame] ...]
//   @mid (default) = the middle frame of the composition.
import { openSync, closeSync, unlinkSync, statSync, mkdirSync } from "node:fs";
import path from "node:path";
import { bundle } from "@remotion/bundler";
import { renderStill, selectComposition } from "@remotion/renderer";
import { chromeMode, gl, publicDir, timeoutInMilliseconds } from "../lib/render-settings";

const LOCK = "out/.render-lock";
const STALE_MS = 30 * 60 * 1000;
const sleep = (ms: number) => Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);

const [outDir, ...specs] = process.argv.slice(2);
if (!outDir || specs.length === 0) {
  console.error("usage: stills-locked.ts <outDir> <id>[@frame|@mid] ...");
  process.exit(2);
}
mkdirSync("out", { recursive: true });
mkdirSync(outDir, { recursive: true });

let fd = -1;
for (;;) {
  try {
    fd = openSync(LOCK, "wx");
    break;
  } catch {
    try {
      if (Date.now() - statSync(LOCK).mtimeMs > STALE_MS) unlinkSync(LOCK);
    } catch {}
    process.stdout.write(".");
    sleep(5000);
  }
}

let code = 0;
try {
  const serveUrl = await bundle({ entryPoint: path.resolve(process.env.ENTRY || "core/index.ts"), publicDir: path.resolve(publicDir) });
  for (const spec of specs) {
    const [id, at = "mid"] = spec.split("@");
    try {
      const composition = await selectComposition({ serveUrl, id, chromeMode, chromiumOptions: { gl }, timeoutInMilliseconds });
      const frame = at === "mid" ? Math.floor(composition.durationInFrames / 2) : at === "late" ? Math.floor(composition.durationInFrames * 0.85) : Math.min(Number(at), composition.durationInFrames - 1);
      const output = path.join(outDir, `${id}.png`);
      await renderStill({ serveUrl, composition, frame, output, chromeMode, chromiumOptions: { gl }, timeoutInMilliseconds, overwrite: true });
      console.log(`ok ${id} @${frame} -> ${output}`);
    } catch (e) {
      code = 1;
      console.error(`FAIL ${id}: ${(e as Error).message}`);
    }
  }
} finally {
  closeSync(fd);
  unlinkSync(LOCK);
}
process.exit(code);

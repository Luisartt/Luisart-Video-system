// Renders several compositions to MP4 with ONE bundle, holding the same exclusive render lock as
// render-locked.ts (never two renders at once on this machine). Settings from core/lib/render-settings.
// Green-screen clips (props.backing === "green") render as PNG frames + yuv444p (clean key edges,
// as the style READMEs ask); everything else as JPEG frames. Output: <outDir>/<id>.mp4
// Usage: npx tsx core/scripts/render-batch-locked.ts <outDir> <id> [<id> ...]
import { openSync, closeSync, unlinkSync, statSync, mkdirSync } from "node:fs";
import path from "node:path";
import { bundle } from "@remotion/bundler";
import { renderMedia, selectComposition } from "@remotion/renderer";
import { chromeMode, concurrency, gl, hardwareAcceleration, publicDir, timeoutInMilliseconds, videoBitrate } from "../lib/render-settings";

const LOCK = "out/.render-lock";
const STALE_MS = 30 * 60 * 1000;
const sleep = (ms: number) => Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);

const [outDir, ...ids] = process.argv.slice(2);
if (!outDir || ids.length === 0) {
  console.error("usage: render-batch-locked.ts <outDir> <id> [<id> ...]");
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
  for (const id of ids) {
    try {
      const composition = await selectComposition({ serveUrl, id, chromeMode, chromiumOptions: { gl }, timeoutInMilliseconds });
      const green = (composition.props as { backing?: string }).backing === "green";
      const output = path.join(outDir, `${id}.mp4`);
      await renderMedia({
        serveUrl,
        composition,
        codec: "h264",
        outputLocation: output,
        chromeMode,
        chromiumOptions: { gl },
        timeoutInMilliseconds,
        concurrency,
        hardwareAcceleration,
        videoBitrate,
        imageFormat: green ? "png" : "jpeg",
        pixelFormat: green ? "yuv444p" : "yuv420p",
        overwrite: true,
      });
      console.log(`rendered ${id} -> ${output}`);
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

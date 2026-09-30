// Renders several frames of ONE composition as PNG stills with a single bundle, holding the same
// exclusive render lock as render-locked.ts (never two renders at once on this machine).
// Output: <outDir>/<id>@<frame>.png
// Usage: npx tsx core/scripts/frames-locked.ts <outDir> <compositionId> <frame> [<frame> ...] [--props=<json>]
//   --props: input props for the composition (e.g. --props={"safeGuide":true} for a zone check);
//            the file names then get a "-props" suffix.
import { openSync, closeSync, unlinkSync, statSync, mkdirSync } from "node:fs";
import path from "node:path";
import { bundle } from "@remotion/bundler";
import { renderStill, selectComposition } from "@remotion/renderer";
import { chromeMode, gl, publicDir, timeoutInMilliseconds } from "../lib/render-settings";

const LOCK = "out/.render-lock";
const STALE_MS = 30 * 60 * 1000;
const sleep = (ms: number) => Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);

const args = process.argv.slice(2);
const propsArg = args.find((a) => a.startsWith("--props="));
const inputProps = propsArg ? JSON.parse(propsArg.slice("--props=".length)) : {};
const [outDir, id, ...frames] = args.filter((a) => !a.startsWith("--"));
if (!outDir || !id || frames.length === 0) {
  console.error("usage: frames-locked.ts <outDir> <id> <frame> [<frame> ...]");
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
  const composition = await selectComposition({ serveUrl, id, inputProps, chromeMode, chromiumOptions: { gl }, timeoutInMilliseconds });
  for (const f of frames) {
    const frame = Math.min(Number(f), composition.durationInFrames - 1);
    const output = path.join(outDir, `${id}@${frame}${propsArg ? "-props" : ""}.png`);
    try {
      await renderStill({ serveUrl, composition, frame, output, inputProps, chromeMode, chromiumOptions: { gl }, timeoutInMilliseconds, overwrite: true });
      console.log(`ok @${frame} -> ${output}`);
    } catch (e) {
      code = 1;
      console.error(`FAIL @${frame}: ${(e as Error).message}`);
    }
  }
} finally {
  closeSync(fd);
  unlinkSync(LOCK);
}
process.exit(code);

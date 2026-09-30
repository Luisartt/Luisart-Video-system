// Runs `remotion render` (or `still`) while holding an exclusive lock, so parallel agents never
// render at the same time on this low-RAM machine.
// Usage: npm run render:locked -- <render|still> <compositionId> <outFile> [extra remotion flags]
import { openSync, closeSync, unlinkSync, statSync, mkdirSync } from "node:fs";
import { spawnSync } from "node:child_process";

const LOCK = "out/.render-lock";
const STALE_MS = 30 * 60 * 1000;
const sleep = (ms: number) => Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);

mkdirSync("out", { recursive: true });
const [mode, id, outFile, ...rest] = process.argv.slice(2);
if (!mode || !id || !outFile) {
  console.error("usage: render:locked -- <render|still> <id> <out> [flags]");
  process.exit(2);
}

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

let code = 1;
try {
  const npx = process.platform === "win32" ? "npx.cmd" : "npx";
  const r = spawnSync(npx, ["remotion", mode, "core/index.ts", id, outFile, ...rest], { stdio: "inherit", shell: true });
  code = r.status ?? 1;
} finally {
  closeSync(fd);
  unlinkSync(LOCK);
}
process.exit(code);

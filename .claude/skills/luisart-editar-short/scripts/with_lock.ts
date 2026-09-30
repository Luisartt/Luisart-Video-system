// Runs ANY heavy command (transcription, matte, face tracking, a big FFmpeg encode) while holding
// the same exclusive lock as core/scripts/render-locked.ts (out/.render-lock), so it never runs at
// the same time as a render or another heavy job on this low-RAM machine.
// Usage (from the project root):
//   npx tsx .claude/skills/luisart-editar-short/scripts/with_lock.ts -- <command> [args...]
// Example:
//   npx tsx .claude/skills/luisart-editar-short/scripts/with_lock.ts -- .venv/Scripts/python.exe -W ignore core/scripts/py/face_track.py in.mp4 out.json
import { closeSync, mkdirSync, openSync, statSync, unlinkSync } from "node:fs";
import { spawnSync } from "node:child_process";

const LOCK = "out/.render-lock";
const STALE_MS = 30 * 60 * 1000;
const sleep = (ms: number) => Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);

const argv = process.argv.slice(2);
const cmd = argv[0] === "--" ? argv.slice(1) : argv;
if (cmd.length === 0) {
  console.error("usage: with_lock.ts -- <command> [args...]");
  process.exit(2);
}
mkdirSync("out", { recursive: true });

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
  // Executables (python.exe, ffmpeg, node) run directly, so arguments pass through untouched.
  // npm/npx (.cmd shims on Windows) need a shell: arguments are quoted for it.
  const needsShell = process.platform === "win32" && /^(npx|npm)$|\.(cmd|bat)$/i.test(cmd[0]);
  const quote = (a: string) => (/[\s"&|<>^]/.test(a) ? `"${a.replace(/"/g, '\\"')}"` : a);
  const r = needsShell
    ? spawnSync(cmd.map(quote).join(" "), { stdio: "inherit", shell: true })
    : spawnSync(cmd[0], cmd.slice(1), { stdio: "inherit" });
  if (r.error) console.error(r.error.message);
  code = r.status ?? 1;
} finally {
  closeSync(fd);
  unlinkSync(LOCK);
}
process.exit(code);

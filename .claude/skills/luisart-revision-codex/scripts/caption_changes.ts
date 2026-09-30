// Prints the frames where an edit's caption layer changes (a caption page appears, swaps or
// disappears), so the review contact sheets can include a frame right after each change.
// Usage (from the project root):
//   npx tsx .claude/skills/luisart-revision-codex/scripts/caption_changes.ts <edit module> <gate export> <total frames>
// Example:
//   npx tsx .claude/skills/luisart-revision-codex/scripts/caption_changes.ts \
//     channels/soyluisart/videos/2026-09-27-per-barato/scenes/pizarra/PizShort.tsx PIZ_CAPTION_GATE 1266
// The gate is the function made by makeCaptionGate() (captionRule.ts): frame → { page, show }.
// Output: one JSON line {"changes":[...frames], "captionFrames": n}.
import path from "node:path";
import { pathToFileURL } from "node:url";

const [modPath, exportName, totalArg] = process.argv.slice(2);
if (!modPath || !exportName || !totalArg) {
  console.error("usage: caption_changes.ts <edit module> <gate export> <total frames>");
  process.exit(2);
}
const mod = await import(pathToFileURL(path.resolve(modPath)).href);
const gate = mod[exportName] as (f: number) => { page: { from: number } | null; show: boolean };
if (typeof gate !== "function") {
  console.error(`${exportName} is not exported as a function by ${modPath}`);
  process.exit(2);
}
const total = Number(totalArg);
const changes: number[] = [];
let prev = "";
let shown = 0;
for (let f = 0; f < total; f++) {
  const g = gate(f);
  const key = g.show && g.page ? String(g.page.from) : "";
  if (key) shown++;
  if (key !== prev) changes.push(f);
  prev = key;
}
console.log(JSON.stringify({ changes, captionFrames: shown }));

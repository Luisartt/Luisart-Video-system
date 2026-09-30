// SessionStart hook: prints a short status so the assistant knows where the user is.
// It ONLY reads brand/brand.json and brand/PROGRESS.md and prints text. No network, no writes.
import { existsSync, readFileSync } from "node:fs";

const read = (p) => (existsSync(p) ? readFileSync(p, "utf8") : null);
const brand = read("brand/brand.json");
let msg;
if (!brand) {
  msg =
    "This repository has no brand set up yet (brand/brand.json is missing). Run the skill `video-system-start` now " +
    "and guide the user step by step: ask their language first, then one question at a time. " +
    "Options they will choose later: create a design system or import one. Do everything technical yourself.";
} else {
  let info = {};
  try { info = JSON.parse(brand); } catch { /* keep empty */ }
  const progress = (read("brand/PROGRESS.md") || "").split("\n").filter((l) => /^- \[[ x]\]/i.test(l)).slice(0, 14).join("\n");
  msg =
    `Brand set up: "${info.brand_name || "?"}" (language: ${info.language || "?"}, stage: ${info.stage ?? "?"}, active channel: ${info.active_channel || "?"}). ` +
    "Greet the user by what they already decided and offer to resume with the skill `video-system-start`.\n" +
    (progress ? `Progress:\n${progress}` : "");
}
process.stdout.write(JSON.stringify({ hookSpecificOutput: { hookEventName: "SessionStart", additionalContext: msg } }));

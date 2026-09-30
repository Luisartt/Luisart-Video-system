// SessionStart hook: prints a short status so the assistant knows where the user is in the guided run.
// It ONLY reads brand/*.json and .claude/skills/luisart-init-skills/steps.json and prints text. No network, no writes.
import { existsSync, readFileSync } from "node:fs";

const readJson = (p) => {
  try { return existsSync(p) ? JSON.parse(readFileSync(p, "utf8")) : null; } catch { return null; }
};
const brand = readJson("brand/brand.json");
const progress = readJson("brand/progress.json") || {};
const steps = (readJson(".claude/skills/luisart-init-skills/steps.json") || { steps: [] }).steps;
const next = steps.find((s) => (progress[s.id]?.status || "pending") === "pending");

let msg;
if (!brand && !Object.keys(progress).length) {
  msg =
    "This repository has not been set up yet (no brand/brand.json). Run the skill `luisart-init-skills` now: it runs every " +
    "other skill in order and guides the user step by step. Ask their language first, then one question at a time. " +
    "Do everything technical yourself.";
} else if (!next) {
  msg = "The guided run (luisart-init-skills) is complete. Offer to repeat any step (`python scripts/progreso.py --reset <ID>`) or start a new video.";
} else {
  msg =
    `The guided run (skill \`luisart-init-skills\`) is in progress${brand?.brand_name ? ` for "${brand.brand_name}"` : ""}. ` +
    `Next step: ${next.id} (${next.skills.join(" / ")}) — ${next.title}. ` +
    "Greet the user by what they already decided, then offer to continue with `luisart-init-skills`.";
}
process.stdout.write(JSON.stringify({ hookSpecificOutput: { hookEventName: "SessionStart", additionalContext: msg } }));

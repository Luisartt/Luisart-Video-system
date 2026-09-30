// Schedules an Instagram post in Buffer using the window with the saved session (abrir.cjs).
// Usage:
//   node tools/buffer/publicar.cjs --type carousel|reel|story --files "a.mp4,b.mp4,..." [--caption caption.txt] [--time "2:42 PM"] [--deselect 2]
//   (Spanish aliases work too: --tipo carrusel|reel|historia --archivos ... --hora ...)
//   carousel : several slides (images or 4:5 videos), uploaded ONE BY ONE IN ORDER, radio "Post".
//   reel     : ONE vertical 9:16 video, radio "Reel".
//   story    : ONE 9:16 image or video, radio "Story" (no caption).
//   --time   : if omitted, the time Buffer recommends is used (Next Available -> Set Date and Time).
//   --deselect N : how many channel avatars to switch off so only Instagram stays (Buffer pre-selects all your
//                  channels; default 2 = a 3-channel free plan with Instagram first). Adjust to your account.
// It NEVER publishes "now" and NEVER adds music. Afterwards verify the order with the Buffer connector
// (list_posts): Buffer sometimes swaps two slides. Buffer's page can change: the FIRST time, run it while the
// user watches the visible window and fix any selector that no longer matches.
const pw = require("./pw.cjs");
const fs = require("fs");

const arg = (...names) => { for (const n of names) { const i = process.argv.indexOf("--" + n); if (i > -1) return process.argv[i + 1]; } return null; };
const ALIAS = { carousel: "carousel", carrusel: "carousel", reel: "reel", story: "story", historia: "story" };
const type = ALIAS[arg("type", "tipo")];
const files = (arg("files", "archivos") || "").split(",").map((s) => s.trim()).filter(Boolean);
const captionFile = arg("caption");
const time = arg("time", "hora");
const deselect = Number(arg("deselect") ?? 2);
if (!type || !files.length) { console.log("Missing --type (carousel|reel|story) and --files"); process.exit(1); }
if (type !== "carousel" && files.length !== 1) { console.log("A reel or a story takes ONE file"); process.exit(1); }
const caption = captionFile && type !== "story" ? fs.readFileSync(captionFile, "utf8").trim() : "";
if ((caption.match(/#\w+/g) || []).length > 5) { console.log("Instagram allows at most 5 hashtags: fix the caption"); process.exit(1); }
const radio = { carousel: "Post", reel: "Reel", story: "Story" }[type];

pw(async (p) => {
  p.on("dialog", (d) => d.accept());
  await p.goto("https://publish.buffer.com/home", { waitUntil: "domcontentloaded" });
  await p.waitForTimeout(2500);
  if (p.url().includes("auth.buffer.com")) { console.log("NO SESSION: the user must sign in in the window opened by abrir.cjs"); return; }
  await p.getByRole("button", { name: "Create Post" }).first().click();
  await p.waitForTimeout(1500);
  const discard = p.getByRole("button", { name: "Discard" });
  if (await discard.count()) { await discard.first().click(); await p.waitForTimeout(1000); }
  const dlg = p.getByRole("dialog");
  // keep only Instagram (Buffer pre-selects every channel)
  for (let i = 0; i < deselect; i++) {
    const box = await dlg.locator("img[class*=avatar]").first().boundingBox();
    await p.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await p.waitForTimeout(400);
    await p.mouse.click(box.x + box.width - 2, box.y + 2);
    await p.waitForTimeout(800);
  }
  // files: one by one, in order
  for (let i = 0; i < files.length; i++) {
    await p.locator("input[type=file]").first().setInputFiles(files[i]);
    await p.waitForTimeout(files.length === 1 ? 9000 : 6000);
    if (i === 0) { // with a single video Buffer flips to "Reel": select the right type
      await dlg.locator("label").filter({ hasText: new RegExp("^" + radio + "$") }).first().click().catch(async () => { await dlg.getByText(radio, { exact: true }).first().click(); });
      await p.waitForTimeout(1500);
    }
    console.log("uploaded", i + 1, "of", files.length);
  }
  if (caption) {
    const tb = dlg.getByRole("textbox", { name: /composer/i }).first();
    await tb.click(); await tb.fill(caption); await p.waitForTimeout(800);
  }
  // time
  await dlg.getByText("Next Available").first().click();
  await p.waitForTimeout(700);
  await p.getByText("Set Date and Time").first().click();
  await p.waitForTimeout(1000);
  if (time) {
    const field = p.getByText(/^\d{1,2}:\d{2} [AP]M$/).last();
    await field.click({ clickCount: 3 }); await p.keyboard.type(time); await p.keyboard.press("Enter"); await p.waitForTimeout(600);
  }
  console.log("time:", await dlg.getByText(/(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec) \d+,/).first().innerText());
  await p.getByText("Done", { exact: true }).first().click();
  await p.waitForTimeout(800);
  const schedule = dlg.getByRole("button", { name: "Schedule Post" });
  if (await schedule.isDisabled()) { console.log("Schedule Post is disabled: check hashtags, files or the post type in Buffer"); return; }
  await schedule.click();
  await p.waitForTimeout(7000);
  console.log((await p.getByText("Set Up Notifications").count()) ? "Buffer asked to enable Notify Me (phone app): NOT scheduled" : "scheduled");
}).catch((e) => console.log("ERR", e.message));

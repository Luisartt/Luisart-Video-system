// Opens a VISIBLE Chromium with a PERMANENT profile for Buffer (the login is saved in ../../.profiles/buffer)
// and a debugging port (9333) so publicar.cjs can drive the same window.
// The session survives between uses: never delete .profiles/buffer. If Buffer asks for a login, ONLY the user
// signs in (the AI never types a password).
// Usage (the user does this once):  node tools/buffer/abrir.cjs   -> sign in to Buffer in that window.
const { chromium } = require("playwright");
const path = require("path");
(async () => {
  const ctx = await chromium.launchPersistentContext(path.join(__dirname, "../../.profiles/buffer"), {
    headless: false,
    viewport: { width: 1280, height: 900 },
    args: ["--remote-debugging-port=9333"],
  });
  const p = ctx.pages()[0] || (await ctx.newPage());
  await p.goto("https://publish.buffer.com");
  console.log("open: sign in to Buffer if asked, then leave this window open (or close it: the session is saved)");
  await new Promise((res) => ctx.on("close", res));
})();

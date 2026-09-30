// Connects to the window opened by abrir.cjs and runs fn(page, context) on the Buffer page.
const { chromium } = require("playwright");
module.exports = async function (fn) {
  const b = await chromium.connectOverCDP("http://127.0.0.1:9333");
  const ctx = b.contexts()[0];
  const p = ctx.pages().find((x) => x.url().includes("buffer.com")) || ctx.pages()[0];
  try { return await fn(p, ctx); } finally { await b.close(); }
};

// Runs a fal.ai model through its queue, downloads every output file, and logs it.
// Usage: npm run fal -- <endpoint> <input.json | inline JSON> --out <dir> --name <base> [--note "..."]
// Needs FAL_KEY in .env. Every run is appended to <out>/SOURCES.md and fal-spend.csv.
import { readFileSync, writeFileSync, appendFileSync, mkdirSync, existsSync } from "node:fs";
import { join, extname } from "node:path";

const env = existsSync(".env") ? readFileSync(".env", "utf8") : "";
for (const line of env.split(/\r?\n/)) {
  const m = line.match(/^([A-Z_]+)=(.*)$/);
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
}
const KEY = process.env.FAL_KEY;
if (!KEY) throw new Error("FAL_KEY missing from .env");

const args = process.argv.slice(2);
const flag = (n: string) => {
  const i = args.indexOf(`--${n}`);
  return i >= 0 ? args[i + 1] : undefined;
};
const [endpoint, inputArg] = args;
const outDir = flag("out") ?? "media/fal";
const base = flag("name") ?? `fal-${Date.now()}`;
const note = flag("note") ?? "";
const input = JSON.parse(existsSync(inputArg) ? readFileSync(inputArg, "utf8") : inputArg);

const headers = { Authorization: `Key ${KEY}`, "Content-Type": "application/json" };
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

const collectUrls = (v: unknown, acc: string[] = []): string[] => {
  if (typeof v === "string" && /^https?:\/\/.+\.(mp4|webm|mov|png|jpe?g|webp|wav|mp3)(\?|$)/i.test(v)) acc.push(v);
  else if (Array.isArray(v)) v.forEach((x) => collectUrls(x, acc));
  else if (v && typeof v === "object") Object.values(v).forEach((x) => collectUrls(x, acc));
  return acc;
};

// Network hiccups while polling must not lose a paid job: retry reads with backoff.
const fetchRetry = async (url: string, init?: RequestInit, tries = 12): Promise<Response> => {
  for (let i = 1; ; i++) {
    try {
      return await fetch(url, init);
    } catch (e) {
      if (i >= tries) throw e;
      await sleep(Math.min(30000, 2000 * i));
    }
  }
};

// --request <id> resumes an already-submitted job (never resubmits, so it isn't billed twice).
const resumeId = flag("request");
const appBase = endpoint.split("/").slice(0, 2).join("/");

const main = async () => {
  const t0 = Date.now();
  let subJson: { request_id?: string; status_url?: string; response_url?: string };
  if (resumeId) {
    subJson = {
      request_id: resumeId,
      status_url: `https://queue.fal.run/${appBase}/requests/${resumeId}/status`,
      response_url: `https://queue.fal.run/${appBase}/requests/${resumeId}`,
    };
  } else {
    const sub = await fetch(`https://queue.fal.run/${endpoint}`, { method: "POST", headers, body: JSON.stringify(input) });
    subJson = (await sub.json()) as typeof subJson;
    if (!sub.ok || !subJson.status_url) throw new Error(`submit failed ${sub.status}: ${JSON.stringify(subJson)}`);
  }
  console.log(`queued ${subJson.request_id}`);
  for (;;) {
    await sleep(5000);
    const st = (await (await fetchRetry(`${subJson.status_url}?logs=0`, { headers })).json()) as { status: string };
    process.stdout.write(`\r${st.status} ${Math.round((Date.now() - t0) / 1000)}s   `);
    if (st.status === "COMPLETED") break;
    if (st.status !== "IN_QUEUE" && st.status !== "IN_PROGRESS") throw new Error(`status ${JSON.stringify(st)}`);
  }
  const res = await fetchRetry(subJson.response_url!, { headers });
  const result = await res.json();
  if (!res.ok) throw new Error(`result ${res.status}: ${JSON.stringify(result)}`);
  mkdirSync(outDir, { recursive: true });
  writeFileSync(join(outDir, `${base}.json`), JSON.stringify({ endpoint, input, result }, null, 2));
  const urls = collectUrls(result);
  const files: string[] = [];
  for (const [i, url] of urls.entries()) {
    const ext = extname(new URL(url).pathname) || ".bin";
    const file = join(outDir, `${base}${urls.length > 1 ? `-${i + 1}` : ""}${ext}`);
    writeFileSync(file, Buffer.from(await (await fetchRetry(url)).arrayBuffer()));
    files.push(file);
  }
  const date = new Date().toISOString().slice(0, 10);
  const prompt = String((input as { prompt?: string }).prompt ?? "").replace(/\|/g, "/").replace(/\s+/g, " ");
  const src = join(outDir, "SOURCES.md");
  if (!existsSync(src)) writeFileSync(src, "# Sources\n\n| File | Source | Captured | What it shows | Scene |\n|---|---|---|---|---|\n");
  for (const f of files) appendFileSync(src, `| ${f.split(/[\\/]/).pop()} | generated with fal.ai ${endpoint}; prompt: "${prompt}" | ${date} | ${note} | — |\n`);
  const spend = "fal-spend.csv";
  if (!existsSync(spend)) writeFileSync(spend, "date,endpoint,request_id,name,seconds,resolution,draft,note\n");
  const i2 = input as { duration?: string; resolution?: string; draft?: boolean };
  appendFileSync(spend, `${date},${endpoint},${subJson.request_id},${base},${i2.duration ?? ""},${i2.resolution ?? ""},${i2.draft ?? ""},"${note.replace(/"/g, "'")}"\n`);
  console.log(`\ndone in ${Math.round((Date.now() - t0) / 1000)}s`);
  for (const f of files) console.log(f);
};

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

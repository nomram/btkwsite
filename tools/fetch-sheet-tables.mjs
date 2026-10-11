// One-off helper used during import: renders Google Sheets "htmlembed" URLs in Chrome and
// saves their table data to crawl/sheets.json (the raw embed HTML is an empty JS shell).
import { spawn } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
const content = JSON.parse(fs.readFileSync("crawl/full/downloads/site-clone-www.betongakuten.se/site-content.json", "utf8"));
const urls = new Set();
for (const p of content.pages) for (const b of p.blocks) if (b.type === "embed" && /docs\.google\.com\/spreadsheets/.test(b.src)) urls.add(b.src);
const prof = path.join(os.tmpdir(), "bk-sheets-profile");
fs.rmSync(prof, { recursive: true, force: true }); fs.mkdirSync(prof, { recursive: true });
const c = spawn("C:/Program Files/Google/Chrome/Application/chrome.exe",
  [`--user-data-dir=${prof}`, "--remote-debugging-pipe", "--no-first-run", "--no-default-browser-check", "--window-size=1400,900", "about:blank"],
  { stdio: ["ignore", "ignore", "ignore", "pipe", "pipe"] });
const out = c.stdio[3], inn = c.stdio[4]; let buf = "", id = 0; const pend = new Map();
inn.on("data", (d) => { buf += d.toString("utf8"); let i; while ((i = buf.indexOf("\0")) >= 0) { const m = JSON.parse(buf.slice(0, i)); buf = buf.slice(i + 1); if (m.id && pend.has(m.id)) { pend.get(m.id)(m); pend.delete(m.id); } } });
const send = (method, params = {}, sessionId) => new Promise((res) => { const i = ++id; pend.set(i, res); out.write(JSON.stringify({ id: i, method, params, ...(sessionId ? { sessionId } : {}) }) + "\0"); });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
await sleep(1500);
const extract = `(() => { const f = document.getElementById('pageswitcher-content'); return f ? f.src : null; })()`;
const result = {};
for (const url of urls) {
  const { result: { targetId } } = await send("Target.createTarget", { url: "about:blank" });
  const { result: { sessionId } } = await send("Target.attachToTarget", { targetId, flatten: true });
  await send("Page.enable", {}, sessionId);
  await send("Page.navigate", { url }, sessionId);
  let r = null;
  for (let k = 0; k < 12; k++) {
    await sleep(1500);
    const e = await send("Runtime.evaluate", { expression: extract, returnByValue: true }, sessionId);
    r = e.result && e.result.result && e.result.result.value;
    if (r) break;
  }
  result[url] = r;
  await send("Target.closeTarget", { targetId });
  console.log(url.slice(-40), "->", r);
}
fs.writeFileSync("crawl/sheets.json", JSON.stringify(result, null, 1));
await send("Browser.close");

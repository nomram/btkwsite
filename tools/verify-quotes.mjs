#!/usr/bin/env node
// Re-checks the human check of quote requests, offline and without any server of ours.
//
//   node tools/verify-quotes.mjs rows.json [--minutes 30] [--keep valid.json]
//
// rows.json: the quote_requests table exported as JSON from the Supabase dashboard (an array of rows).
// For every row it recomputes the proof from the browser (quote-guard.js):
//   1. proof of work: sha256("<round>:<beacon signature>|<e-mail>|<nonce>") starts with four zero hex digits.
//      The beacon signature is fetched from the public drand network for that round, so it cannot be made up.
//   2. freshness: the round must be older than the request (the proof cannot predate its beacon) and not more than --minutes older
//      (default 30): a stockpile of proofs computed in advance fails here, because the beacon value did not exist yet.
//   3. the form was not sent faster than a person writes it (fill_ms >= 6000) and the hold-and-release really happened
//      (game_hits = 1, game_ms plausible: not an instant release).
// Rows that pass are printed as "ok", the rest with the reason. A row without a beacon (pow_round = 0, the browser could not
// reach drand) is judged on the weaker local rules and marked "ok (no beacon)".
import crypto from "node:crypto";
import fs from "node:fs";

const argv = process.argv.slice(2);
const file = argv.find((a) => !a.startsWith("--"));
const val = (n, d) => { const i = argv.indexOf(n); return i >= 0 ? argv[i + 1] : d; };
if (!file) { console.log("usage: node tools/verify-quotes.mjs rows.json [--minutes 30] [--keep valid.json]"); process.exit(1); }
const MAX_AGE_S = (parseInt(val("--minutes", "30"), 10) || 30) * 60;
const GENESIS = 1692803367, PERIOD = 3; // drand "quicknet"
const roundTime = (r) => GENESIS + (r - 1) * PERIOD;
const cache = new Map();
async function signatureOf(round) {
  if (cache.has(round)) return cache.get(round);
  const r = await fetch(`https://api.drand.sh/v2/beacons/quicknet/rounds/${round}`);
  const sig = r.ok ? (await r.json()).signature : null;
  cache.set(round, sig);
  return sig;
}

const rows = JSON.parse(fs.readFileSync(file, "utf8"));
const good = [];
let bad = 0;
for (const row of rows) {
  const why = [];
  const created = row.created_at ? Math.floor(Date.parse(row.created_at) / 1000) : Math.floor(Date.now() / 1000);
  let beacon = "no beacon";
  if (row.pow_nonce == null) why.push("no proof");
  else if (row.pow_round > 0) {
    const sig = await signatureOf(row.pow_round);
    if (!sig) why.push("beacon round not found");
    else {
      const h = crypto.createHash("sha256").update(`${row.pow_round}:${sig}|${row.email}|${row.pow_nonce}`).digest("hex");
      if (!h.startsWith("0000")) why.push("proof of work wrong");
      const age = created - roundTime(row.pow_round);
      if (age < -5) why.push("proof is from the future");
      if (age > MAX_AGE_S) why.push(`proof is ${Math.round(age / 60)} min old (stockpiled?)`);
      beacon = "beacon round " + row.pow_round;
    }
  } else {
    const h = crypto.createHash("sha256").update(`local:${row.pow_ts}|${row.email}|${row.pow_nonce}`).digest("hex");
    if (!h.startsWith("0000")) why.push("proof of work wrong");
    if (Math.abs(created - row.pow_ts) > MAX_AGE_S) why.push("local time far from the request");
  }
  if ((row.fill_ms || 0) < 6000) why.push(`filled in ${row.fill_ms || 0} ms`);
  if (row.game_hits !== 1) why.push("no hold-and-release");
  else if (row.game_ms != null && row.game_ms < 40) why.push("released at machine speed");
  const ok = !why.length;
  if (ok) good.push(row); else bad++;
  console.log(`${String(row.id ?? "?").padStart(5)}  ${ok ? "ok" + (beacon === "no beacon" ? " (no beacon)" : "") : "REJECT: " + why.join("; ")}  ${row.email || ""}  ${String(row.product || "").slice(0, 24)}`);
}
console.log(`\n${good.length} ok, ${bad} rejected, ${rows.length} total`);
if (val("--keep")) { fs.writeFileSync(val("--keep"), JSON.stringify(good, null, 2)); console.log("valid rows written to " + val("--keep")); }

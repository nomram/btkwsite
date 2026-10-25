// Interactive performance chart ("perfchart" block): curves with real values, drawn as inline SVG at build time (so it reads without
// JavaScript and in search results), made interactive by site.js: curves can be switched on and off (plunger sizes), and a
// pointer or the arrow keys read the values at any pressure.
//   { type: "perfchart", title, hint, xName, yName, x: {unit, min, max, step}, y: {unit, min, max, step},
//     series: [{ name, color, points: [[x, y], ...] }], areas: [{ color, points }] }
const W = 480, H = 340, M = { l: 46, r: 14, t: 14, b: 42 };
const PW = W - M.l - M.r, PH = H - M.t - M.b;
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const fix = (v) => (Math.round(v * 10) / 10).toString();

export function perfChartEmpty(b) { return !(b.series || []).some((s) => s && (s.points || []).length > 1); }

export function renderPerfChart(ctx, b, editFld = () => "") {
  const series = (b.series || []).filter((s) => s && (s.points || []).length > 1);
  if (!series.length) return "";
  const x = b.x, y = b.y;
  const sx = (v) => M.l + ((v - x.min) / (x.max - x.min)) * PW;
  const sy = (v) => M.t + PH - ((v - y.min) / (y.max - y.min)) * PH;
  const ticks = (a) => { const out = []; for (let v = a.min; v <= a.max + 1e-6; v += a.step) out.push(Math.round(v * 100) / 100); return out; };
  const xt = ticks(x), yt = ticks(y);
  const xSkip = xt.length > 9 ? 2 : 1, ySkip = yt.length > 9 ? 2 : 1;
  const grid = xt.map((v) => `<line x1="${fix(sx(v))}" y1="${M.t}" x2="${fix(sx(v))}" y2="${M.t + PH}"/>`).join("") + yt.map((v) => `<line x1="${M.l}" y1="${fix(sy(v))}" x2="${M.l + PW}" y2="${fix(sy(v))}"/>`).join("");
  const labels = xt.map((v, i) => (i % xSkip ? "" : `<text x="${fix(sx(v))}" y="${M.t + PH + 15}" text-anchor="middle">${v}</text>`)).join("") + yt.map((v, i) => (i % ySkip ? "" : `<text x="${M.l - 7}" y="${fix(sy(v) + 4)}" text-anchor="end">${v}</text>`)).join("");
  const path = (pts) => "M" + pts.map(([px, py]) => `${fix(sx(Math.max(x.min, Math.min(x.max, px))))} ${fix(sy(Math.max(y.min, Math.min(y.max, py))))}`).join("L");
  const areas = (b.areas || []).map((a) => `<path class="pc__area" d="${path(a.points)}Z" fill="${esc(a.color)}"/>`).join("");
  const lines = series.map((s, i) => `<path class="pc__line" data-s="${i}" d="${path(s.points)}" stroke="${esc(s.color)}"/>`).join("");
  const dots = series.map((s, i) => `<circle class="pc__dot" data-s="${i}" r="4.5" cx="-20" cy="-20" fill="${esc(s.color)}"/>`).join("");
  const chips = series.length > 1
    ? `<div class="pc__chips" role="group" aria-label="${esc(b.chipsLabel || "")}">` + series.map((s, i) => `<button type="button" class="pc__chip" aria-pressed="true" data-s="${i}"><i style="background:${esc(s.color)}"></i><span>${esc(s.name)}</span></button>`).join("") + "</div>"
    : "";
  const data = { x: { min: x.min, max: x.max, unit: x.unit, name: b.xName || "" }, y: { min: y.min, max: y.max, unit: y.unit, name: b.yName || "" }, series: series.map((s) => ({ n: s.name, c: s.color, p: s.points })) , geo: { W, H, ml: M.l, mt: M.t, pw: PW, ph: PH } };
  const summary = series.map((s) => { const top = Math.max(...s.points.map((p) => p[1])), maxX = Math.max(...s.points.map((p) => p[0])); return `${s.name}: ${fix(top)} ${y.unit}, ${fix(maxX)} ${x.unit}`; }).join("; ");
  return `<figure class="pc" data-pc>${b.title ? `<figcaption class="pc__title"${editFld("title")}>${esc(b.title)}</figcaption>` : ""}${chips}` +
    `<svg class="pc__svg" viewBox="0 0 ${W} ${H}" role="img" tabindex="0" aria-label="${esc((b.title || "") + (summary ? ". " + summary : ""))}">` +
    `<g class="pc__grid">${grid}</g>${areas}<g class="pc__axis"><line x1="${M.l}" y1="${M.t}" x2="${M.l}" y2="${M.t + PH}"/><line x1="${M.l}" y1="${M.t + PH}" x2="${M.l + PW}" y2="${M.t + PH}"/></g>` +
    `<g class="pc__ticks">${labels}</g><text class="pc__ax" x="${M.l + PW / 2}" y="${H - 6}" text-anchor="middle">${esc((b.xName || "") + (x.unit ? " [" + x.unit + "]" : ""))}</text>` +
    `<text class="pc__ax" transform="translate(12 ${M.t + PH / 2}) rotate(-90)" text-anchor="middle">${esc((b.yName || "") + (y.unit ? " [" + y.unit + "]" : ""))}</text>` +
    `${lines}<line class="pc__cursor" x1="-20" y1="${M.t}" x2="-20" y2="${M.t + PH}"/>${dots}</svg>` +
    `<div class="pc__read" aria-live="polite">${b.hint ? `<span class="pc__hint">${esc(b.hint)}</span>` : ""}</div>` +
    `<script type="application/json" class="pc__data">${JSON.stringify(data).replace(/</g, "\\u003c")}</script></figure>`;
}

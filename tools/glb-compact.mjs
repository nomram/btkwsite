#!/usr/bin/env node
// Turns a manufacturer's .glb (CAD export, often 10-30 MB) into the small mesh file the site's own 3D viewer (src/js/viewer3d.js) reads.
//   - the scene graph is flattened (every part placed with its world matrix), textures are dropped (each material keeps one colour;
//     a colour texture becomes its average colour), so nothing but geometry and flat PBR-ish colours remain
//   - vertices are welded on a fine grid (1/4000 of the model's size) together with their normal, so hard CAD edges stay sharp,
//     and triangles that collapse on that grid (bolt threads, tiny chamfers) are dropped
//   - positions are stored as uint16 in the model's box, normals as int8, indices as uint16 in chunks of at most 65 535 vertices
//   - the result is gzipped (the viewer unpacks it with the browser's DecompressionStream)
// Format (after gunzip): "BKM1", uint32 header length, JSON header, padding to 4, then for each draw: positions, normals, indices.
//   node tools/glb-compact.mjs in.glb out.bkm [--grid 4000]
import fs from "node:fs";
import zlib from "node:zlib";
import sharp from "sharp";

const [, , inFile, outFile, ...rest] = process.argv;
const GRID = Number((rest.join(" ").match(/--grid\s+(\d+)/) || [])[1] || 1000);
const buf = fs.readFileSync(inFile);
if (buf.readUInt32LE(0) !== 0x46546c67) throw new Error("not a glb");
let off = 12, json = null, bin = null;
while (off < buf.length) {
  const len = buf.readUInt32LE(off), type = buf.readUInt32LE(off + 4);
  const chunk = buf.subarray(off + 8, off + 8 + len);
  if (type === 0x4e4f534a) json = JSON.parse(chunk.toString("utf8")); else if (type === 0x004e4942) bin = chunk;
  off += 8 + len;
}
const G = json;
const CT = { 5120: [Int8Array, 1], 5121: [Uint8Array, 1], 5122: [Int16Array, 2], 5123: [Uint16Array, 2], 5125: [Uint32Array, 4], 5126: [Float32Array, 4] };
const NC = { SCALAR: 1, VEC2: 2, VEC3: 3, VEC4: 4, MAT4: 16 };
function readAccessor(i) {
  const a = G.accessors[i], bv = G.bufferViews[a.bufferView];
  const [T, size] = CT[a.componentType], n = NC[a.type];
  const stride = bv.byteStride || size * n, base = (bv.byteOffset || 0) + (a.byteOffset || 0);
  const out = new Float64Array(a.count * n);
  const dv = new DataView(bin.buffer, bin.byteOffset);
  const rd = { 5120: (o) => dv.getInt8(o), 5121: (o) => dv.getUint8(o), 5122: (o) => dv.getInt16(o, true), 5123: (o) => dv.getUint16(o, true), 5125: (o) => dv.getUint32(o, true), 5126: (o) => dv.getFloat32(o, true) }[a.componentType];
  const norm = a.normalized ? { 5120: 127, 5121: 255, 5122: 32767, 5123: 65535 }[a.componentType] : 0;
  for (let k = 0; k < a.count; k++) for (let c = 0; c < n; c++) { let v = rd(base + k * stride + c * size); if (norm) v = Math.max(v / norm, -1); out[k * n + c] = v; }
  return { data: out, n, count: a.count };
}
// --- matrices (column-major, like glTF) ---
const mul = (a, b) => { const o = new Array(16); for (let c = 0; c < 4; c++) for (let r = 0; r < 4; r++) { let s = 0; for (let k = 0; k < 4; k++) s += a[k * 4 + r] * b[c * 4 + k]; o[c * 4 + r] = s; } return o; };
function trs(n) {
  if (n.matrix) return n.matrix.slice();
  const [tx, ty, tz] = n.translation || [0, 0, 0], [x, y, z, w] = n.rotation || [0, 0, 0, 1], [sx, sy, sz] = n.scale || [1, 1, 1];
  return [(1 - 2 * (y * y + z * z)) * sx, 2 * (x * y + z * w) * sx, 2 * (x * z - y * w) * sx, 0, 2 * (x * y - z * w) * sy, (1 - 2 * (x * x + z * z)) * sy, 2 * (y * z + x * w) * sy, 0, 2 * (x * z + y * w) * sz, 2 * (y * z - x * w) * sz, (1 - 2 * (x * x + y * y)) * sz, 0, tx, ty, tz, 1];
}
function normalMat(m) { // inverse transpose of the upper 3x3, as a row-major 3x3
  const a = m[0], b = m[4], c = m[8], d = m[1], e = m[5], f = m[9], g = m[2], h = m[6], i = m[10];
  const A = e * i - f * h, B = -(d * i - f * g), C = d * h - e * g, det = a * A + b * B + c * C;
  const inv = [A, -(b * i - c * h), b * f - c * e, B, a * i - c * g, -(a * f - c * d), C, -(a * h - b * g), a * e - b * d].map((x) => x / det);
  return { nm: [inv[0], inv[3], inv[6], inv[1], inv[4], inv[7], inv[2], inv[5], inv[8]], det };
}
// --- materials: one flat colour each ---
async function avgTextureColor(texIndex) {
  try {
    const img = G.images[G.textures[texIndex].source], bv = G.bufferViews[img.bufferView];
    const st = await sharp(bin.subarray(bv.byteOffset || 0, (bv.byteOffset || 0) + bv.byteLength)).removeAlpha().stats();
    return st.channels.slice(0, 3).map((c) => Math.pow(c.mean / 255, 2.2)); // to linear
  } catch { return [1, 1, 1]; }
}
const mats = [];
for (const m of G.materials || []) {
  const p = m.pbrMetallicRoughness || {};
  let col = (p.baseColorFactor || [1, 1, 1, 1]).slice(0, 3), alpha = (p.baseColorFactor || [1, 1, 1, 1])[3];
  if (p.baseColorTexture) { const t = await avgTextureColor(p.baseColorTexture.index); col = col.map((v, k) => v * t[k]); }
  const ext = m.extensions || {};
  const glass = ext.KHR_materials_transmission && ext.KHR_materials_transmission.transmissionFactor > 0.5;
  if (glass) alpha = Math.min(alpha, 0.28);
  if (m.alphaMode !== "BLEND" && !glass) alpha = 1;
  mats.push({ c: col.map((v) => +v.toFixed(4)), m: +(p.metallicFactor ?? 1).toFixed(2), r: +(p.roughnessFactor ?? 1).toFixed(2), a: +alpha.toFixed(2), cc: ext.KHR_materials_clearcoat ? 1 : 0 });
}
if (!mats.length) mats.push({ c: [0.6, 0.6, 0.6], m: 0, r: 0.6, a: 1, cc: 0 });
// --- collect world-space triangles per material ---
const groups = new Map(); // material key -> { mat, pos: [], nor: [] } (non-indexed, welded later)
const matKey = (mi) => JSON.stringify(mats[mi] || mats[0]);
let triIn = 0;
function walk(ni, parent) {
  const node = G.nodes[ni], world = mul(parent, trs(node));
  if (node.mesh != null) {
    const { nm, det } = normalMat(world);
    for (const prim of G.meshes[node.mesh].primitives) {
      if (prim.mode != null && prim.mode !== 4) continue;
      const P = readAccessor(prim.attributes.POSITION), N = prim.attributes.NORMAL != null ? readAccessor(prim.attributes.NORMAL) : null;
      const idx = prim.indices != null ? readAccessor(prim.indices).data : Float64Array.from({ length: P.count }, (_, k) => k);
      const key = matKey(prim.material ?? 0);
      if (!groups.has(key)) groups.set(key, { mat: JSON.parse(key), pos: [], nor: [] });
      const g = groups.get(key);
      const wp = new Float64Array(P.count * 3), wn = new Float64Array(P.count * 3);
      for (let k = 0; k < P.count; k++) {
        const x = P.data[k * 3], y = P.data[k * 3 + 1], z = P.data[k * 3 + 2];
        wp[k * 3] = world[0] * x + world[4] * y + world[8] * z + world[12];
        wp[k * 3 + 1] = world[1] * x + world[5] * y + world[9] * z + world[13];
        wp[k * 3 + 2] = world[2] * x + world[6] * y + world[10] * z + world[14];
        if (N) {
          const a = N.data[k * 3], b = N.data[k * 3 + 1], c = N.data[k * 3 + 2];
          let nx = nm[0] * a + nm[1] * b + nm[2] * c, ny = nm[3] * a + nm[4] * b + nm[5] * c, nz = nm[6] * a + nm[7] * b + nm[8] * c;
          const l = Math.hypot(nx, ny, nz) || 1; wn[k * 3] = nx / l; wn[k * 3 + 1] = ny / l; wn[k * 3 + 2] = nz / l;
        }
      }
      for (let t = 0; t + 2 < idx.length; t += 3) {
        const tri = det < 0 ? [idx[t], idx[t + 2], idx[t + 1]] : [idx[t], idx[t + 1], idx[t + 2]];
        let fn = null;
        if (!N) { // flat normal
          const [a, b, c] = tri.map((v) => [wp[v * 3], wp[v * 3 + 1], wp[v * 3 + 2]]);
          const u = [b[0] - a[0], b[1] - a[1], b[2] - a[2]], v = [c[0] - a[0], c[1] - a[1], c[2] - a[2]];
          fn = [u[1] * v[2] - u[2] * v[1], u[2] * v[0] - u[0] * v[2], u[0] * v[1] - u[1] * v[0]]; const l = Math.hypot(...fn) || 1; fn = fn.map((q) => q / l);
        }
        for (const v of tri) { g.pos.push(wp[v * 3], wp[v * 3 + 1], wp[v * 3 + 2]); if (fn) g.nor.push(...fn); else g.nor.push(wn[v * 3], wn[v * 3 + 1], wn[v * 3 + 2]); }
        triIn++;
      }
    }
  }
  for (const c of node.children || []) walk(c, world);
}
const I = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
for (const r of G.scenes[G.scene || 0].nodes) walk(r, I);
// --- bounding box ---
const min = [Infinity, Infinity, Infinity], max = [-Infinity, -Infinity, -Infinity];
for (const g of groups.values()) for (let k = 0; k < g.pos.length; k += 3) for (let c = 0; c < 3; c++) { min[c] = Math.min(min[c], g.pos[k + c]); max[c] = Math.max(max[c], g.pos[k + c]); }
const size = Math.max(max[0] - min[0], max[1] - min[1], max[2] - min[2]);
const cell = size / GRID;
const q16 = (v, c) => Math.round(((v - min[c]) / (max[c] - min[c] || 1)) * 65535);
// --- weld per material, drop collapsed triangles, split into uint16 chunks ---
const draws = [], parts = [];
let triOut = 0, vertOut = 0;
for (const g of groups.values()) {
  const map = new Map(); let vp = [], vn = [], ix = [];
  const flush = () => { if (!ix.length) return; draws.push({ mat: g.mat, vp, vn, ix }); vertOut += vp.length / 3; triOut += ix.length / 3; vp = []; vn = []; ix = []; map.clear(); };
  for (let t = 0; t < g.pos.length / 9; t++) {
    const keys = [], cellKeys = new Set();
    for (let k = 0; k < 3; k++) {
      const o = (t * 3 + k) * 3;
      const cx = Math.round(g.pos[o] / cell), cy = Math.round(g.pos[o + 1] / cell), cz = Math.round(g.pos[o + 2] / cell);
      cellKeys.add(cx + "," + cy + "," + cz);
      keys.push(cx + "," + cy + "," + cz + "|" + Math.round(g.nor[o] * 12) + "," + Math.round(g.nor[o + 1] * 12) + "," + Math.round(g.nor[o + 2] * 12));
    }
    if (cellKeys.size < 3) continue; // collapsed on the grid
    if (vp.length / 3 > 65530 - 3) flush();
    for (let k = 0; k < 3; k++) {
      let id = map.get(keys[k]);
      if (id == null) { const o = (t * 3 + k) * 3; id = vp.length / 3; map.set(keys[k], id); vp.push(g.pos[o], g.pos[o + 1], g.pos[o + 2]); vn.push(g.nor[o], g.nor[o + 1], g.nor[o + 2]); }
      ix.push(id);
    }
  }
  flush();
}
// --- write ---
const matList = [], matIndex = new Map();
const header = { v: 2, min, max, mats: matList, draws: [] };
let bodyLen = 0;
for (const d of draws) {
  const k = JSON.stringify(d.mat); if (!matIndex.has(k)) { matIndex.set(k, matList.length); matList.push(d.mat); }
  const n = d.vp.length / 3;
  // planes: x, y, z positions (uint16, low bytes then high bytes), oct normal u, v (int8), indices as deltas (low then high bytes)
  const plane16 = (arr) => { const o = Buffer.alloc(arr.length * 2); for (let k = 0; k < arr.length; k++) { o[k] = arr[k] & 255; o[arr.length + k] = arr[k] >> 8; } return o; };
  const X = new Uint16Array(n), Y = new Uint16Array(n), Z = new Uint16Array(n), NU = Buffer.alloc(n), NV = Buffer.alloc(n);
  for (let k = 0; k < n; k++) {
    X[k] = q16(d.vp[k * 3], 0); Y[k] = q16(d.vp[k * 3 + 1], 1); Z[k] = q16(d.vp[k * 3 + 2], 2);
    let nx = d.vn[k * 3], ny = d.vn[k * 3 + 1], nz = d.vn[k * 3 + 2]; const l1 = Math.abs(nx) + Math.abs(ny) + Math.abs(nz) || 1; nx /= l1; ny /= l1; nz /= l1;
    let u = nx, v = ny; if (nz < 0) { u = (1 - Math.abs(ny)) * Math.sign(nx || 1); v = (1 - Math.abs(nx)) * Math.sign(ny || 1); }
    NU.writeInt8(Math.max(-127, Math.min(127, Math.round(u * 127))), k); NV.writeInt8(Math.max(-127, Math.min(127, Math.round(v * 127))), k);
  }
  const DI = new Uint16Array(d.ix.length); let prev = 0; for (let k = 0; k < d.ix.length; k++) { DI[k] = (d.ix[k] - prev) & 0xffff; prev = d.ix[k]; }
  header.draws.push({ m: matIndex.get(k), n, i: d.ix.length });
  const blob = [plane16(X), plane16(Y), plane16(Z), NU, NV, plane16(DI)];
  parts.push(...blob); bodyLen += blob.reduce((q, x) => q + x.length, 0);
}
// sort: opaque first, glass last (the viewer draws them in this order)
const hj = Buffer.from(JSON.stringify(header), "utf8");
const pad = (4 - ((8 + hj.length) % 4)) % 4;
const head = Buffer.alloc(8); head.write("BKM2", 0, "ascii"); head.writeUInt32LE(hj.length + pad, 4);
const raw = Buffer.concat([head, hj, Buffer.alloc(pad, 0x20), ...parts]);
const gz = zlib.gzipSync(raw, { level: 9 });
fs.writeFileSync(outFile, gz);
console.log(`${inFile.split(/[\\/]/).pop()}: ${(buf.length / 1e6).toFixed(1)} MB, ${triIn} tris -> ${triOut} tris, ${vertOut} verts, ${draws.length} draws, ${matList.length} colours, size ${size.toFixed(2)} m -> ${(raw.length / 1e6).toFixed(1)} MB raw, ${(gz.length / 1e6).toFixed(2)} MB gz`);

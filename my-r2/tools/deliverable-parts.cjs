// Hashes the parts of a built deliverable separately, so two builds can be compared part by part: the concepts and everything that
// runs (window.__JU_SOURCES, the shell, runtime, fonts, shared modules, the state index) versus the appendix text, the coverage table
// and the evidence gallery (window.__JU_DOCS / __JU_COVERAGE / __JU_EVIDENCE) and the build time stamp.
// Used to show that a rebuild which only refreshed the appendices left every checked concept byte-for-byte the same.
// node my-r2/tools/deliverable-parts.cjs <a.html> [<b.html>]
const fs = require('fs'); const crypto = require('crypto');
const KEYS = ['__JU_SOURCES', '__JU_META', '__JU_META_ALL', '__JU_DOCS', '__JU_INDEX', '__JU_COVERAGE', '__JU_EVIDENCE', '__JU_SCOPE', '__JU_FONTS', '__JU_SHARED_BUNDLE', '__JU_BUILT'];
const RUNS = ['__JU_SOURCES', '__JU_META', '__JU_META_ALL', '__JU_INDEX', '__JU_SCOPE', '__JU_FONTS', '__JU_SHARED_BUNDLE'];
const h = (s) => crypto.createHash('sha256').update(s).digest('hex').slice(0, 12);
function parts(file) {
  const t = fs.readFileSync(file, 'utf8'); const out = { bytes: Buffer.byteLength(t), parts: {} };
  let rest = t;
  KEYS.forEach((k, i) => {
    const a = t.indexOf('window.' + k + '='); if (a < 0) return;
    const next = i + 1 < KEYS.length ? t.indexOf(';window.' + KEYS[i + 1] + '=', a) : t.indexOf(';', t.indexOf('window.' + k + '=') + k.length + 8);
    const seg = t.slice(a, next < 0 ? undefined : next); out.parts[k] = { hash: h(seg), bytes: Buffer.byteLength(seg) };
    rest = rest.replace(seg, '');
  });
  out.parts.shell = { hash: h(rest), bytes: Buffer.byteLength(rest) };
  /* each concept on its own, so a rebuild that touched one concept shows which */
  try { const a = t.indexOf('window.__JU_SOURCES='); const b = t.indexOf(';window.__JU_META=', a); const S = JSON.parse(t.slice(a + 'window.__JU_SOURCES='.length, b)); out.concepts = Object.fromEntries(Object.keys(S).map(k => [k, h(S[k])])); } catch (e) { out.concepts = { error: e.message }; }   /* the page around the data: shell markup, CSS, runtime, fonts */
  out.runs = h(RUNS.map(k => (out.parts[k] || {}).hash || '').join('') + out.parts.shell.hash);
  return out;
}
const files = process.argv.slice(2); const res = files.map(f => Object.assign({ file: f }, parts(f)));
if (res.length === 2) res.push({ sameRunningParts: res[0].runs === res[1].runs, differ: Object.keys(res[0].parts).filter(k => (res[1].parts[k] || {}).hash !== res[0].parts[k].hash), conceptsDiffer: Object.keys(res[0].concepts || {}).filter(k => (res[1].concepts || {})[k] !== res[0].concepts[k]) });
console.log(JSON.stringify(res, null, 1));

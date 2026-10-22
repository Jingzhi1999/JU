#!/usr/bin/env node
/* my-r2/src/build.js — JU「我的局」R2 ten directions (C01–C10; C00 = wiring reference, built only when named).
   (1) assembles my-r2/concepts/project/*.dc.html artboards for the Design canvas from my-r2/concepts/src/*.dc.html
       (injecting the shared core JU.*, the fx primitives, the shared V27 / ritual modules, the review panel and concept metadata),
   (2) writes my-r2/concepts/project/canvas.json + Main.dc.html (Main + C01–C10, 780×884 boards, 5 per row),
   (3) writes the offline deliverable JU-MY-R2-TEN-DIRECTIONS.html (runtime + artboards + shell + appendices + index + evidence).

   Injection markers inside a concept source (see my-r2/spec/contract.md §2):
     /* @panel-css *​/   ← my-r2/src/core/ju-panel.css + src/core/ju-fx.css + my-r2/src/shared/**​/*.css
                           (if the source also has /* @shared-css *​/, the shared CSS goes there instead)
     <!-- @fx-svg -->   ← src/core/ju-fx.svg + my-r2/src/shared/**​/*.svg
     <!-- @panel -->    ← my-r2/src/core/ju-panel.html (wrapped in <sc-if value="{{panel.show}}">)
     /* @core *​/        ← src/core/ju-fx.js + my-r2/src/core/ju-data.js + ju-ctl.js + ju-review.js
                           + my-r2/src/shared/**​/*.js (v27/ first, then rituals/, then the rest) + var CONCEPT = {...}
   Missing core / shared / panel / doc files are skipped with a warning (the build never throws on a missing input).

   Environment:
     JU_STANDALONE=<out.html>   private build: writes only that file (no my-r2/concepts/project/* files, no deliverable)
     JU_ONLY=C03,C05            build only these concepts (C00 must be named explicitly, it is internal)
     JU_FONTS_CSS=<css>         inline @font-face rules (made by my-r2/tools/embed-fonts.py) and strip the Google Fonts links
     JU_CONCEPTS=<json>         concepts list (default my-r2/concepts/concepts.json)
     JU_CONCEPTS_DIR=<dir>      concept sources (default my-r2/concepts/src)
     JU_CORE_DIR=<dir>          core files ju-data.js / ju-ctl.js / ju-review.js / ju-panel.html / ju-panel.css (default my-r2/src/core)
     JU_SHARED_DIR=<dir>        shared modules (default my-r2/src/shared)
     JU_EVIDENCE_INDEX=<json>   evidence index (default my-r2/evidence/index.json; made by my-r2/tools/evidence-index.py)
   Usage:  node my-r2/src/build.js
           JU_STANDALONE=/home/user/JU/.build/C03.html JU_ONLY=C03 node my-r2/src/build.js */
const fs = require('fs'); const path = require('path');
const ROOT = path.resolve(__dirname, '..', '..');
const abs = (p) => path.isAbsolute(p) ? p : path.join(ROOT, p);
const read = (p) => fs.readFileSync(abs(p), 'utf8');
const exists = (p) => fs.existsSync(abs(p));
const warn = function () { console.warn.apply(console, ['build:'].concat([].slice.call(arguments))); };
/* JSON for a <script> body: '<' is escaped so "</script>" inside a concept source cannot end the data script early */
const js = (s) => JSON.stringify(s).split('<').join('\\u003c');

const CONCEPTS_JSON = process.env.JU_CONCEPTS || 'my-r2/concepts/concepts.json';
const SRC_DIR = process.env.JU_CONCEPTS_DIR || 'my-r2/concepts/src';
const CORE_DIR = process.env.JU_CORE_DIR || 'my-r2/src/core';
const SHARED_DIR = process.env.JU_SHARED_DIR || 'my-r2/src/shared';
const PRIVATE = process.env.JU_STANDALONE || '';   // private output path: no shared files are written
const ONLY = (process.env.JU_ONLY || '').split(',').map(s => s.trim()).filter(Boolean);
const DELIVERABLE = 'JU-MY-R2-TEN-DIRECTIONS.html';

/* ---- inputs (every one optional while the other builders are still writing) ---- */
let metaAll = [];
if (exists(CONCEPTS_JSON)) { try { metaAll = JSON.parse(read(CONCEPTS_JSON)); } catch (e) { warn('cannot parse ' + CONCEPTS_JSON + ': ' + e.message); } }
else warn('no concepts list yet: ' + CONCEPTS_JSON + ' (building the shell with 0 concepts)');
if (!Array.isArray(metaAll)) { warn(CONCEPTS_JSON + ' is not an array'); metaAll = []; }
const meta = metaAll.filter(c => {
  if (!c || !c.code || !c.file) { warn('concept entry without code/file skipped'); return false; }
  if (ONLY.length && ONLY.indexOf(c.code) < 0) return false;
  if (c.internal && ONLY.indexOf(c.code) < 0) return false;   /* C00 wiring reference: only when asked for by name */
  const ok = exists(path.join(SRC_DIR, c.file)); if (!ok) warn('skip (no source yet):', c.file); return ok;
});
const optional = (p, what) => { if (exists(p)) return read(p); warn('missing ' + (what || '') + ' ' + p + ' (skipped)'); return ''; };
const guardScript = (s, name) => { if (/<\/script/i.test(s)) { warn(name + ' contains "</script" — escaped so the artboard parses'); return s.replace(/<\/script/gi, '<\\/script'); } return s; };
/* a script that does not parse on its own (e.g. a method-excerpt file such as my-r2/src/shared/v27/header.js, kept for reference)
   must never be injected: it would break every concept bundle. Such files are skipped with a warning naming the first bad line. */
const parses = (s, name) => { try { new (require('vm').Script)(s, { filename: name }); return true; } catch (e) { const m = /:(\d+)\n/.exec(e.stack || ''); warn('not injectable (syntax error' + (m ? ' near line ' + m[1] : '') + ': ' + e.message + '): ' + name + ' — a method excerpt rather than a module? skipped'); return false; } };
const coreFiles = ['src/core/ju-fx.js', path.join(CORE_DIR, 'ju-data.js'), path.join(CORE_DIR, 'ju-ctl.js'), path.join(CORE_DIR, 'ju-review.js')];
const core = coreFiles.map(f => { const s = optional(f, 'core'); return s && parses(s, f) ? '/* ---- ' + f + ' ---- */\n' + guardScript(s, f) : ''; }).filter(Boolean).join('\n');
const panelHtml = optional(path.join(CORE_DIR, 'ju-panel.html'), 'panel');
const panelCss = optional(path.join(CORE_DIR, 'ju-panel.css'), 'panel');
const fxCss = optional('src/core/ju-fx.css', 'fx');
const fxSvg = optional('src/core/ju-fx.svg', 'fx');

/* shared modules: my-r2/src/shared/**: v27/ first, then rituals/, then any other folder (alphabetical); files sorted inside each.
   Folders that hold reference material rather than modules are never injected: assets (fonts, original V27 / R9 sources),
   original*, test*, docs, and files starting with "_". */
const SKIP_DIR = /^(assets|original|originals|source|sources|raw|test|tests|docs|fonts|_.*)$/i;
function walk(dir) { const out = []; if (!exists(dir)) return out; for (const e of fs.readdirSync(abs(dir), { withFileTypes: true }).sort((a, b) => a.name < b.name ? -1 : 1)) { if (SKIP_DIR.test(e.name)) continue; const p = path.join(dir, e.name); if (e.isDirectory()) out.push.apply(out, walk(p)); else if (e.name[0] !== '_') out.push(p); } return out; }
function sharedFiles(ext) {
  if (!exists(SHARED_DIR)) return [];
  const top = fs.readdirSync(abs(SHARED_DIR), { withFileTypes: true });
  const dirs = top.filter(e => e.isDirectory() && !SKIP_DIR.test(e.name)).map(e => e.name).sort((a, b) => { const r = (n) => n === 'v27' ? 0 : n === 'rituals' ? 1 : 2; return r(a) - r(b) || (a < b ? -1 : 1); });
  const files = top.filter(e => e.isFile() && e.name[0] !== '_').map(e => path.join(SHARED_DIR, e.name)).sort();
  dirs.forEach(d => files.push.apply(files, walk(path.join(SHARED_DIR, d))));
  return files.filter(f => f.endsWith(ext));
}
const sharedCssFiles = sharedFiles('.css'), sharedJsFiles = sharedFiles('.js').filter(f => parses(read(f), f)), sharedSvgFiles = sharedFiles('.svg');
[].concat(sharedCssFiles, sharedJsFiles, sharedSvgFiles).forEach(f => { const kb = fs.statSync(abs(f)).size / 1024; if (kb > 120) warn('shared module is large (' + kb.toFixed(0) + ' KB, injected into every concept): ' + f); });
const sharedCss = sharedCssFiles.map(f => '/* ---- ' + f + ' ---- */\n' + read(f)).join('\n');
const sharedJs = sharedJsFiles.map(f => '/* ---- ' + f + ' ---- */\n' + guardScript(read(f), f)).join('\n');
const sharedSvg = sharedSvgFiles.map(read).join('\n');
if (!sharedCssFiles.length && !sharedJsFiles.length) warn('no shared modules under ' + SHARED_DIR + ' yet (nothing injected)');
else console.log('shared modules:', [].concat(sharedCssFiles, sharedJsFiles, sharedSvgFiles).map(f => path.relative(ROOT, abs(f))).join(', '));

/* ---- assemble one artboard ---- */
const BANNED = ['扣分', '信用分', '处罚', '等级', '剩余次数'];
function assemble(c) {
  const file = path.join(SRC_DIR, c.file);
  let src = read(file);
  const missing = ['<!-- @panel -->', '/* @core */', '/* @panel-css */'].filter(m => !src.includes(m));
  if (missing.length) { warn('skip (markers missing, still being written?):', c.file, missing.join(' ')); return null; }
  if (!src.includes('<!-- @fx-svg -->')) warn(c.file + ': no <!-- @fx-svg --> marker — fx defs not injected');
  const kb = Buffer.byteLength(src, 'utf8') / 1024; if (kb > 200) warn(c.file + ': source is ' + kb.toFixed(0) + ' KB (> 200 KB limit)');
  const hits = BANNED.filter(w => src.includes(w)); if (hits.length) warn(c.file + ': banned words present: ' + hits.join(' '));
  const conceptJson = JSON.stringify({ code: c.code, name: c.name, line: c.line, notes: c.notes || '', motions: c.motions || [] });
  const hasShared = src.includes('/* @shared-css */');
  src = src.replace('<!-- @panel -->', () => '<sc-if value="{{panel.show}}" hint-placeholder-val="{{true}}">\n' + panelHtml + '\n</sc-if>');
  src = src.replace('/* @panel-css */', () => panelCss + '\n' + fxCss + (hasShared ? '' : '\n' + sharedCss));
  if (hasShared) src = src.replace('/* @shared-css */', () => sharedCss);
  src = src.replace('<!-- @fx-svg -->', () => fxSvg + (sharedSvg ? '\n' + sharedSvg : ''));
  src = src.replace('/* @core */', () => core + '\n' + sharedJs + '\nvar CONCEPT = ' + conceptJson + ';');
  if (!/<title>/.test(src)) src = src.replace('<head>', '<head>\n<title>' + c.code + ' ' + c.name + '</title>');
  return src;
}
const built = {}; const metaBuilt = [];
for (const c of meta) { const out = assemble(c); if (!out) continue; built[c.code] = out; metaBuilt.push(c); }
if (!PRIVATE) { fs.mkdirSync(path.join(ROOT, 'my-r2/concepts/project'), { recursive: true }); for (const c of metaBuilt) fs.writeFileSync(path.join(ROOT, 'my-r2/concepts/project', c.file), built[c.code]); }

/* ---- canvas index + Main entry artboard (only built concepts are listed; the canvas needs a file per entry) ---- */
const W = 780, H = 884, GX = 80, GY = 120; const perRow = 5;
const publicMeta = metaAll.filter(c => c && !c.internal);
const boards = { 'Main.dc.html': { x: 0, y: 0, w: 1240, h: 640, title: '评审入口 · 我的局十套方案索引', is_interactive: true } };
const order = ['Main.dc.html'];
metaBuilt.forEach((c) => { let i = publicMeta.findIndex(x => x.code === c.code); if (i < 0) i = publicMeta.length + metaBuilt.filter(x => x.internal).indexOf(c); const r = Math.floor(i / perRow), col = i % perRow; boards[c.file] = { x: col * (W + GX), y: 640 + 223 + 120 + r * (H + GY), w: W, h: H, title: `${c.code} ${c.name}`, is_interactive: true }; order.push(c.file); });
if (!PRIVATE) {
  const canvasPath = path.join(ROOT, 'my-r2/concepts/project/canvas.json');
  let canvas = exists('my-r2/concepts/project/canvas.json') ? JSON.parse(read('my-r2/concepts/project/canvas.json')) : { v: 3, createdOnFiles: { v: 1, at: new Date().toISOString().replace(/\.\d+Z$/, 'Z') }, title: 'JU 我的局 R2 · 十个方向', launch: { view: 'canvas' }, pages: [], notes: {}, designSystems: [] };
  canvas.boards = boards; canvas.order = order;
  canvas.notes = Object.assign({}, canvas.notes, { row1: { x: 0, y: 640 + 120, text: '十套「我的局」方案 · 每套 = 手机画面（390×844）+ 画面外评审面板（状态索引 / 速度 / 关键帧 / 演示数据 / 时钟 / 尺寸与键盘 / 失败模拟）· 演示日期 2026-12-17 15:00，不冒充实时', kind: 'title1', maxW: 4220 } });
  fs.writeFileSync(canvasPath, JSON.stringify(canvas, null, 1));
  const cards = publicMeta.map(c => { const done = metaBuilt.some(x => x.code === c.code); return done
    ? `    <a class="card" href="${c.file}"><span class="code">${c.code}</span><span class="name">${c.name}</span><span class="line">${c.line || ''}</span></a>`
    : `    <div class="card todo"><span class="code">${c.code}</span><span class="name">${c.name}</span><span class="line">${c.line || ''}</span><span class="st">画板制作中</span></div>`; }).join('\n');
  const mainBoard = `<!doctype html>
<html lang="zh-CN">
<head>
<meta charset="utf-8">
<title>评审入口</title>
<script src="./support.js"></script>
</head>
<body>
<x-dc>
<helmet>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@400;500;700&family=DM+Mono:wght@400;500&display=swap">
<style>
body{margin:0}
.ix{width:1240px;height:640px;box-sizing:border-box;background:#14161f;color:#f4f2ee;font-family:"Noto Sans SC",-apple-system,"PingFang SC",sans-serif;padding:40px 48px;display:flex;flex-direction:column;gap:18px}
.ix h1{margin:0;font-size:30px;font-weight:500;letter-spacing:.01em}
.ix .sub{margin:0;color:#a9a6a0;font-size:14px;max-width:980px;line-height:1.6}
.grid{display:grid;grid-template-columns:repeat(5, minmax(0, 1fr));gap:14px;flex:1 1 auto}
.card{display:flex;flex-direction:column;gap:6px;padding:14px;border:1px solid rgba(255,255,255,.14);border-radius:12px;color:inherit;text-decoration:none;background:rgba(255,255,255,.03);min-height:150px;position:relative}
a.card:hover{background:rgba(255,255,255,.08)}
.card.todo{opacity:.55;border-style:dashed}
.code{font:500 11px/1 "DM Mono",ui-monospace,monospace;letter-spacing:.12em;color:#a09c94}
.name{font-size:17px;font-weight:600;line-height:1.3}
.line{font-size:12px;color:#cfcbc4;line-height:1.55}
.st{position:absolute;right:12px;bottom:10px;font-size:11px;color:#8d8983}
.foot{color:#7f7b75;font-size:12px}
</style>
</helmet>
<div class="ix">
  <h1>JU「我的局」R2 · 十个艺术指导方向</h1>
  <p class="sub">每套都是一台可操作的 390×844 手机画面：我参加的 / 我发起的两种身份、当前 / 历史 / 草稿分区、局内详情与阅读确认、候补、票根（出票 / 撕票 / 联系）、改期答复、历史票根与记录，以及管理这局的十二个表面（审核、成员、候补、联系、离开、改时间、答复、取消、散场、出席、局卡）。画面右侧是评审面板（状态索引 / 1× · 0.5× / 暂停 · 关键帧 / 演示数据 / 时钟推进 / 尺寸 · 键盘 · 安全区 · 文字 115% / 失败模拟 / 重置），不属于产品界面。点卡片进入对应方案。</p>
  <div class="grid">
${cards}
  </div>
  <p class="foot">十套共用同一位示例用户、同一组活动与同一份业务状态；每套的演示数据相互隔离。演示日期 2026-12-17 15:00（不冒充实时）；预留 6h / 撕票后 8h 联系 / 散场后 24h 联系关闭 / 年度 4 次主动退出为演示假设。研究附录与差异矩阵见仓库 my-r2/spec/ 与 my-r2/research/。</p>
</div>
</x-dc>
<script type="text/x-dc" data-dc-script data-props='{"$preview":{"width":1240,"height":640}}'>
class Component extends DCLogic {
  renderVals() { return {}; }
}
</script>
</body>
</html>
`;
  fs.writeFileSync(path.join(ROOT, 'my-r2/concepts/project/Main.dc.html'), mainBoard);
}

/* ---- appendices (markdown → html, minimal; same renderer as Phase B: code spans stay literal, | inside `code` does not split a row) ---- */
function splitRow(r) {
  r = r.trim().replace(/^\|/, '').replace(/\|$/, '');
  const out = []; let cur = '', code = false;
  for (let i = 0; i < r.length; i++) {
    const ch = r[i];
    if (ch === '\\' && r[i + 1] === '|') { cur += '|'; i++; continue; }
    if (ch === '`') code = !code;
    if (ch === '|' && !code) { out.push(cur); cur = ''; continue; }
    cur += ch;
  }
  out.push(cur); return out;
}
const esc = (t) => String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
function md(s) {
  /* code spans are cut out first, so text inside backticks (e.g. `<br>` or `a | b`) stays literal */
  const prose = (t) => esc(t).replace(/&lt;br\s*\/?&gt;/g, '<br>').replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>').replace(/\[([^\]]+)\]\((https?:[^)\s]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>').replace(/(^|[^"'>])(https?:\/\/[^\s<)]+)/g, '$1<a href="$2" target="_blank" rel="noopener">$2</a>');
  const inline = (t) => t.split('`').map((seg, k) => k % 2 ? '<code>' + esc(seg) + '</code>' : prose(seg)).join('');
  const lines = s.split('\n'); let out = [], i = 0;
  while (i < lines.length) {
    const l = lines[i];
    if (/^\s*$/.test(l)) { i++; continue; }
    let m;
    if ((m = /^(#{1,6})\s+(.*)$/.exec(l))) { out.push(`<h${m[1].length}>${inline(m[2])}</h${m[1].length}>`); i++; continue; }
    if (/^\|/.test(l)) { const rows = []; while (i < lines.length && /^\|/.test(lines[i])) { rows.push(lines[i]); i++; } const cells = rows.filter(r => !/^\|\s*:?-+/.test(r)).map(r => splitRow(r).map(c => inline(c.trim()))); if (!cells.length) continue; out.push('<table><thead><tr>' + cells[0].map(c => `<th>${c}</th>`).join('') + '</tr></thead><tbody>' + cells.slice(1).map(r => '<tr>' + r.map(c => `<td>${c}</td>`).join('') + '</tr>').join('') + '</tbody></table>'); continue; }
    if (/^\s*[-*]\s+/.test(l)) { out.push('<ul>'); while (i < lines.length && /^\s*[-*]\s+/.test(lines[i])) { out.push(`<li>${inline(lines[i].replace(/^\s*[-*]\s+/, ''))}</li>`); i++; } out.push('</ul>'); continue; }
    if (/^\s*\d+[.)]\s+/.test(l)) { out.push('<ol>'); while (i < lines.length && /^\s*\d+[.)]\s+/.test(lines[i])) { out.push(`<li>${inline(lines[i].replace(/^\s*\d+[.)]\s+/, ''))}</li>`); i++; } out.push('</ol>'); continue; }
    if (/^```/.test(l)) { let b = []; i++; while (i < lines.length && !/^```/.test(lines[i])) { b.push(lines[i]); i++; } i++; out.push(`<pre>${esc(b.join('\n'))}</pre>`); continue; }
    if (/^\s*>\s?/.test(l)) { let b = []; while (i < lines.length && /^\s*>\s?/.test(lines[i])) { b.push(lines[i].replace(/^\s*>\s?/, '')); i++; } out.push(`<blockquote>${inline(b.join(' '))}</blockquote>`); continue; }
    if (/^\s*(-{3,}|\*{3,})\s*$/.test(l)) { out.push('<hr>'); i++; continue; }
    let p = []; while (i < lines.length && !/^\s*$/.test(lines[i]) && !/^(#|\||\s*[-*]\s|\s*\d+[.)]\s|```|\s*>)/.test(lines[i])) { p.push(lines[i]); i++; } out.push(`<p>${inline(p.join(' '))}</p>`);
  }
  return out.join('\n');
}
/* the state index for the shell's compare view (the shell must not depend on a concept having been mounted first) */
const INDEX_LIST = (() => {
  const dataFile = path.join(CORE_DIR, 'ju-data.js'); if (!exists(dataFile)) { warn('no ' + dataFile + ' — window.__JU_INDEX will be empty'); return []; }
  try { const vm = require('vm'); const ctx = { window: {}, console }; ctx.window.window = ctx.window; ctx.self = ctx.window; vm.createContext(ctx);
    if (exists('src/core/ju-fx.js')) { try { vm.runInContext(read('src/core/ju-fx.js'), ctx); } catch (e) { } }
    vm.runInContext(read(dataFile), ctx);
    const JU = ctx.window.JU || {}; const idx = JU.INDEX || []; if (!idx.length) warn('ju-data.js defines no JU.INDEX');
    return idx.map(e => ({ key: e.key, group: e.group, label: e.label, variant: e.variant || 'default', open: e.open || null })); }
  catch (e) { warn('cannot evaluate ju-data.js for the index: ' + e.message); return []; }
})();
const DOC_FILES = {
  matrix: exists('my-r2/spec/matrix.md') ? 'my-r2/spec/matrix.md' : 'my-r2/spec/directions.md',
  refs: 'my-r2/spec/concept-refs.md',
  research: 'my-r2/research/ledger.md',
  motion: exists('my-r2/spec/motion-record.md') ? 'my-r2/spec/motion-record.md' : 'my-r2/spec/motion-specs.md',
  coverage: 'my-r2/spec/coverage.md',
  verification: 'my-r2/spec/verification.md',
  limits: 'my-r2/spec/limits.md',
  observations: 'my-r2/spec/baseline-old10.md'
};
const docs = {};
for (const [k, f] of Object.entries(DOC_FILES)) { if (exists(f)) docs[k] = { file: f, present: true, html: md(read(f)) }; else { warn('appendix "' + k + '" not generated yet: ' + f); docs[k] = { file: f, present: false, html: '<p class="apx-missing">（尚未生成：' + esc(f) + '）</p>' }; } }

/* ---- coverage table (five separate columns) parsed from my-r2/spec/coverage.md (written by my-r2/tools/coverage-matrix.cjs) ----
   Looks for "### CNN name" sections each followed by a table whose header has the five columns; rows are "key · label | … ". */
const COVERAGE_COLUMNS = ['入口存在', '真实操作成功', '静态视觉已看', '正常速度动效已看', '仍需用户验收'];
function parseCoverage(text) {
  const out = { generated: '', columns: COVERAGE_COLUMNS, concepts: {}, order: [] };
  const lines = text.split('\n'); let cur = null;
  const m0 = /自动生成\s*([^）)]*)/.exec(text); if (m0) out.generated = m0[1].trim();
  for (let i = 0; i < lines.length; i++) {
    const l = lines[i]; let m;
    if ((m = /^###\s+(C\d\d)\b\s*(.*)$/.exec(l))) { cur = { code: m[1], name: m[2].trim(), rows: [] }; out.concepts[m[1]] = cur; out.order.push(m[1]); continue; }
    if (cur && /^\|/.test(l)) {
      const head = splitRow(l).map(c => c.trim()); if (!(head.length >= 6 && COVERAGE_COLUMNS.every(c => head.indexOf(c) >= 0))) continue;
      const col = COVERAGE_COLUMNS.map(c => head.indexOf(c)); i += 2;
      while (i < lines.length && /^\|/.test(lines[i])) { const cells = splitRow(lines[i]).map(c => c.trim()); const kl = cells[0].split(' · '); cur.rows.push({ key: kl[0].trim(), label: kl.slice(1).join(' · ').trim(), entry: cells[col[0]] || '', op: cells[col[1]] || '', static: cells[col[2]] || '', motion: cells[col[3]] || '', pending: cells[col[4]] || '' }); i++; }
      i--;
    }
  }
  return out.order.length ? out : null;
}
const COVERAGE_MD = process.env.JU_COVERAGE_MD || 'my-r2/spec/coverage.md';   /* JU_COVERAGE_MD=<md> overrides (tests) */
if (process.env.JU_COVERAGE_MD && exists(COVERAGE_MD)) docs.coverage = { file: COVERAGE_MD, present: true, html: md(read(COVERAGE_MD)) };
const COVERAGE = exists(COVERAGE_MD) ? parseCoverage(read(COVERAGE_MD)) : null;
if (exists(COVERAGE_MD) && !COVERAGE) warn(COVERAGE_MD + ' has no five-column per-concept tables (### CNN + 入口存在…仍需用户验收) — the shell shows the markdown only');

/* ---- evidence gallery: my-r2/evidence/index.json → thumbnails inlined as data URIs ---- */
const EVIDENCE = (() => {
  const f = process.env.JU_EVIDENCE_INDEX || 'my-r2/evidence/index.json'; if (!exists(f)) { warn('no evidence index yet: ' + f + ' (gallery empty)'); return { generated: '', items: [] }; }
  let idx; try { idx = JSON.parse(read(f)); } catch (e) { warn('cannot parse ' + f + ': ' + e.message); return { generated: '', items: [] }; }
  const base = path.dirname(abs(f)); const items = Array.isArray(idx) ? idx : (idx.items || []); let bytes = 0; const out = [];
  const mime = { '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.gif': 'image/gif' };
  for (const it of items) {
    if (!it || !it.file) continue;
    const rel = it.thumb || it.file; const p = path.join(base, rel); let src = null;
    if (fs.existsSync(p)) { const st = fs.statSync(p); const ext = path.extname(p).toLowerCase(); if (mime[ext] && (it.thumb || st.size <= 200 * 1024)) { src = 'data:' + mime[ext] + ';base64,' + fs.readFileSync(p).toString('base64'); bytes += st.size; } else warn('evidence not inlined (no thumb and > 200 KB, or not an image): ' + rel); }
    else warn('evidence file missing: ' + rel);
    out.push({ code: it.code || '', group: it.group || '', title: it.title || path.basename(it.file), file: it.file, note: it.note || '', src });
  }
  if (bytes > 8 * 1024 * 1024) warn('evidence thumbnails total ' + (bytes / 1048576).toFixed(1) + ' MB — consider smaller thumbs (tools/evidence-index.py --width)');
  return { generated: idx.generated || '', items: out };
})();

/* ---- standalone ---- */
const shellHtml = read('my-r2/src/shell/shell.html');
/* offline fonts: JU_FONTS_CSS=<file> (made by my-r2/tools/embed-fonts.py) inlines subset WOFF2 @font-face rules into the page head
   and strips the Google Fonts <link>s from the shell and every embedded concept, so the delivered file renders the same offline. */
const FONTS_CSS = process.env.JU_FONTS_CSS && fs.existsSync(process.env.JU_FONTS_CSS) ? fs.readFileSync(process.env.JU_FONTS_CSS, 'utf8') : '';
if (process.env.JU_FONTS_CSS && !FONTS_CSS) warn('JU_FONTS_CSS not found: ' + process.env.JU_FONTS_CSS + ' (fonts stay online links)');
const stripFontLinks = (s) => s.replace(/<link[^>]+href="https:\/\/fonts\.googleapis\.com[^"]*"[^>]*>\s*/g, '');
if (FONTS_CSS) { for (const k of Object.keys(built)) built[k] = stripFontLinks(built[k]); }
const scope = { demoNow: '2026-12-17 15:00', assumptions: ['预留 6 小时', '撕票后 8 小时联系', '散场后 24 小时联系关闭', '年度 4 次主动退出', '容量含局主', '全员确认成局出票'], outOfScope: ['继续编辑草稿', '再开一局', '去找局', '去开局', '查看进度', '账户级记录页', '发现 / 城市 / 完整报名 / 开局编辑器 / 登录 / 设置 / 后端'] };
const data = `window.__JU_SOURCES=${js(built)};window.__JU_META=${js(metaBuilt)};window.__JU_META_ALL=${js(publicMeta.map(c => ({ code: c.code, name: c.name, line: c.line || '', motions: c.motions || [] })))};window.__JU_DOCS=${js(docs)};window.__JU_INDEX=${js(INDEX_LIST)};window.__JU_COVERAGE=${js(COVERAGE)};window.__JU_EVIDENCE=${js(EVIDENCE)};window.__JU_SCOPE=${js(scope)};window.__JU_BUILT=${js(new Date().toISOString())};`;
const standalone = (FONTS_CSS ? stripFontLinks(shellHtml) : shellHtml)
  .replace('/*@fonts*/', () => FONTS_CSS)
  .replace('/*@shell-css*/', () => read('my-r2/src/shell/shell.css'))
  .replace('/*@preact*/', () => read('src/runtime/preact.min.js'))
  .replace('/*@runtime*/', () => read('src/runtime/dc-mini-runtime.js'))
  .replace('/*@data*/', () => data)
  .replace('/*@shell-js*/', () => read('my-r2/src/shell/shell.js'));
const outPath = PRIVATE ? path.resolve(PRIVATE) : path.join(ROOT, DELIVERABLE);
fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, standalone);
console.log('built', metaBuilt.length, 'concepts (' + metaBuilt.map(c => c.code).join(', ') + ');', 'index', INDEX_LIST.length, 'states;', 'shared', sharedCssFiles.length + ' css / ' + sharedJsFiles.length + ' js;', 'docs', Object.keys(docs).filter(k => docs[k].present).length + '/' + Object.keys(docs).length + ';', 'evidence', EVIDENCE.items.length + ';', (standalone.length / 1024 / 1024).toFixed(2), 'MB →', outPath);

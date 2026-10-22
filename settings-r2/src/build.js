#!/usr/bin/env node
/* settings-r2/src/build.js — JU「设置」R2 ten directions (S01–S10).
   (1) assembles settings-r2/concepts/project/*.dc.html artboards for the Design canvas from settings-r2/concepts/src/*.dc.html
       (injecting the shared settings core JUS, the fx primitives, the review panel and concept metadata),
   (2) writes settings-r2/concepts/project/canvas.json + Main.dc.html,
   (3) writes the offline deliverable JU-SETTINGS-R2-TEN-DIRECTIONS.html (runtime + artboards + shell + appendices).
   Private build (parallel work, no shared files written): JU_STANDALONE=/home/user/JU/.build/S01.html node settings-r2/src/build.js */
const fs = require('fs'); const path = require('path');
const ROOT = path.resolve(__dirname, '..', '..');
const read = (p) => fs.readFileSync(path.join(ROOT, p), 'utf8');
const exists = (p) => fs.existsSync(path.join(ROOT, p));
const js = (s) => JSON.stringify(s).split('<').join('\\u003c');
const metaAll = JSON.parse(read(process.env.JUS_CONCEPTS || 'settings-r2/concepts/concepts.json'));
const ONLY = (process.env.JUS_ONLY || '').split(',').filter(Boolean);   // JUS_ONLY=SC05,SC02 builds only finished concepts into the shared outputs
const meta = metaAll.filter(c => { if (ONLY.length && ONLY.indexOf(c.code) < 0) return false; if (c.internal && ONLY.indexOf(c.code) < 0) return false; /* S00 wiring reference: only when asked for by name */ const ok = exists(`settings-r2/concepts/src/${c.file}`); if (!ok) console.warn('skip (no source yet):', c.file); return ok; });
const core = ['src/core/ju-fx.js', 'settings-r2/src/core/jus-data.js', 'settings-r2/src/core/jus-ctl.js', 'settings-r2/src/core/jus-review.js'].filter(exists).map(read).join('\n');
const panelHtml = read('settings-r2/src/core/jus-panel.html');
const panelCss = read('settings-r2/src/core/jus-panel.css');
const fxCss = read('src/core/ju-fx.css');
const fxSvg = read('src/core/ju-fx.svg');
fs.mkdirSync(path.join(ROOT, 'settings-r2/concepts/project'), { recursive: true });

function assemble(c) {
  let src = read(`settings-r2/concepts/src/${c.file}`);
  const conceptJson = JSON.stringify({ code: c.code, name: c.name, line: c.line, notes: c.notes || '', motions: c.motions || [] });
  if (!src.includes('<!-- @panel -->') || !src.includes('/* @core */') || !src.includes('/* @panel-css */')) { console.warn('skip (markers missing, still being written?):', c.file); return null; }
  src = src.replace('<!-- @panel -->', () => '<sc-if value="{{panel.show}}" hint-placeholder-val="{{true}}">\n' + panelHtml + '\n</sc-if>');
  src = src.replace('/* @panel-css */', () => panelCss + '\n' + fxCss);
  src = src.replace('<!-- @fx-svg -->', () => fxSvg);
  src = src.replace('/* @core */', () => core + '\nvar CONCEPT = ' + conceptJson + ';');
  if (!/<title>/.test(src)) src = src.replace('<head>', '<head>\n<title>' + c.code + ' ' + c.name + '</title>');
  return src;
}
const PRIVATE = process.env.JU_STANDALONE || '';
const built = {}; const metaBuilt = [];
for (const c of meta) { const out = assemble(c); if (!out) continue; built[c.code] = out; metaBuilt.push(c); if (!PRIVATE) fs.writeFileSync(path.join(ROOT, 'settings-r2/concepts/project', c.file), out); }

/* ---- canvas index + Main entry artboard (only built concepts are listed; the canvas needs a file per entry) ---- */
const W = 780, H = 884, GX = 80, GY = 120; const perRow = 5;
const boards = { 'Main.dc.html': { x: 0, y: 0, w: 1240, h: 640, title: '评审入口 · 设置十套方案索引', is_interactive: true } };
const order = ['Main.dc.html'];
metaBuilt.forEach((c) => { const i = metaAll.findIndex(x => x.code === c.code); const r = Math.floor(i / perRow), col = i % perRow; boards[c.file] = { x: col * (W + GX), y: 640 + 223 + 120 + r * (H + GY), w: W, h: H, title: `${c.code} ${c.name}`, is_interactive: true }; order.push(c.file); });
if (!PRIVATE) {
  const canvasPath = path.join(ROOT, 'settings-r2/concepts/project/canvas.json');
  let canvas = exists('settings-r2/concepts/project/canvas.json') ? JSON.parse(read('settings-r2/concepts/project/canvas.json')) : { v: 3, createdOnFiles: { v: 1, at: new Date().toISOString().replace(/\.\d+Z$/, 'Z') }, title: 'JU 设置 R2 · 十个方向', launch: { view: 'canvas' }, pages: [], notes: {}, designSystems: [] };
  canvas.boards = boards; canvas.order = order;
  canvas.notes = Object.assign({}, canvas.notes, { row1: { x: 0, y: 640 + 120, text: '十套「设置」方案 · 每套 = 手机画面（390×844）+ 画面外评审面板（状态索引 / 速度 / 关键帧 / 演示数据 / 权限模拟）', kind: 'title1', maxW: 4220 } });
  fs.writeFileSync(canvasPath, JSON.stringify(canvas, null, 1));
  const cards = metaAll.map(c => { const done = metaBuilt.some(x => x.code === c.code); return done
    ? `    <a class="card" href="${c.file}"><span class="code">${c.code}</span><span class="name">${c.name}</span><span class="line">${c.line}</span></a>`
    : `    <div class="card todo"><span class="code">${c.code}</span><span class="name">${c.name}</span><span class="line">${c.line}</span><span class="st">画板制作中</span></div>`; }).join('\n');
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
.ix{width:1240px;height:640px;box-sizing:border-box;background:#17161a;color:#f4f2ee;font-family:"Noto Sans SC",-apple-system,"PingFang SC",sans-serif;padding:40px 48px;display:flex;flex-direction:column;gap:18px}
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
  <h1>JU「设置」R2 · 十个艺术指导方向</h1>
  <p class="sub">每套都是一台可操作的 390×844 手机画面：设置首页、个人资料编辑、收藏管理、城市偏好、通知与系统权限、外观预览、我的记录与补充／申诉、我的举报与进度、帮助与反馈、隐私可见性、账户操作、关于与规则，以及连到「入局 01」与「我的局」的最小接缝（同一份收藏与记录状态）。画面右侧是评审面板（状态索引 / 1× · 0.5× / 暂停 · 关键帧 / 演示数据 / 权限与失败模拟 / 重置），不属于产品界面。点卡片进入对应方案。</p>
  <div class="grid">
${cards}
  </div>
  <p class="foot">十套共用同一位示例用户、同一组活动与同一份业务状态；每套的演示数据相互隔离。研究附录与差异矩阵见仓库 settings-r2/spec/ 与 settings-r2/research/。</p>
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
  fs.writeFileSync(path.join(ROOT, 'settings-r2/concepts/project/Main.dc.html'), mainBoard);
}

/* ---- appendices (markdown → html, minimal) ---- */
function md(s) {
  const esc = (t) => t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const inline = (t) => esc(t).replace(/`([^`]+)`/g, '<code>$1</code>').replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>').replace(/\[([^\]]+)\]\((https?:[^)\s]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>').replace(/(^|[^"'>])(https?:\/\/[^\s<)]+)/g, '$1<a href="$2" target="_blank" rel="noopener">$2</a>');
  const lines = s.split('\n'); let out = [], i = 0;
  while (i < lines.length) {
    const l = lines[i];
    if (/^\s*$/.test(l)) { i++; continue; }
    let m;
    if ((m = /^(#{1,6})\s+(.*)$/.exec(l))) { out.push(`<h${m[1].length}>${inline(m[2])}</h${m[1].length}>`); i++; continue; }
    if (/^\|/.test(l)) { const rows = []; while (i < lines.length && /^\|/.test(lines[i])) { rows.push(lines[i]); i++; } const cells = rows.filter(r => !/^\|\s*:?-+/.test(r)).map(r => r.replace(/^\||\|$/g, '').split('|').map(c => inline(c.trim()))); out.push('<table><thead><tr>' + cells[0].map(c => `<th>${c}</th>`).join('') + '</tr></thead><tbody>' + cells.slice(1).map(r => '<tr>' + r.map(c => `<td>${c}</td>`).join('') + '</tr>').join('') + '</tbody></table>'); continue; }
    if (/^\s*[-*]\s+/.test(l)) { out.push('<ul>'); while (i < lines.length && /^\s*[-*]\s+/.test(lines[i])) { out.push(`<li>${inline(lines[i].replace(/^\s*[-*]\s+/, ''))}</li>`); i++; } out.push('</ul>'); continue; }
    if (/^\s*\d+[.)]\s+/.test(l)) { out.push('<ol>'); while (i < lines.length && /^\s*\d+[.)]\s+/.test(lines[i])) { out.push(`<li>${inline(lines[i].replace(/^\s*\d+[.)]\s+/, ''))}</li>`); i++; } out.push('</ol>'); continue; }
    if (/^```/.test(l)) { let b = []; i++; while (i < lines.length && !/^```/.test(lines[i])) { b.push(lines[i]); i++; } i++; out.push(`<pre>${esc(b.join('\n'))}</pre>`); continue; }
    let p = []; while (i < lines.length && !/^\s*$/.test(lines[i]) && !/^(#|\||\s*[-*]\s|\s*\d+[.)]\s|```)/.test(lines[i])) { p.push(lines[i]); i++; } out.push(`<p>${inline(p.join(' '))}</p>`);
  }
  return out.join('\n');
}
const docs = {};
for (const [k, f] of Object.entries({ matrix: exists('settings-r2/spec/matrix.md') ? 'settings-r2/spec/matrix.md' : 'settings-r2/spec/directions.md', refs: 'settings-r2/spec/concept-refs.md', mapping: 'settings-r2/spec/function-state-map.md', verification: 'settings-r2/spec/verification.md', observations: 'settings-r2/spec/baseline-observations.md', contract: 'settings-r2/spec/state-contract.md', ledger: 'settings-r2/research/ledger.md', rules: 'settings-r2/spec/rules-check.md', limits: 'settings-r2/spec/limits.md' })) { if (exists(f)) docs[k] = md(read(f)); else docs[k] = '<p>（尚未生成：' + f + '）</p>'; }

/* ---- standalone ---- */
const shellHtml = read('settings-r2/src/shell/shell.html');
/* offline fonts: JU_FONTS_CSS=<file> (made by settings-r2/tools/embed-fonts.py) inlines subset WOFF2 @font-face rules into the page head
   and strips the Google Fonts <link>s from the shell and every embedded concept, so the delivered file renders the same offline. */
const FONTS_CSS = process.env.JU_FONTS_CSS && fs.existsSync(process.env.JU_FONTS_CSS) ? fs.readFileSync(process.env.JU_FONTS_CSS, 'utf8') : '';
const stripFontLinks = (s) => s.replace(/<link[^>]+href="https:\/\/fonts\.googleapis\.com[^"]*"[^>]*>\s*/g, '');
if (FONTS_CSS) { for (const k of Object.keys(built)) built[k] = stripFontLinks(built[k]); }
const standalone = (FONTS_CSS ? stripFontLinks(shellHtml) : shellHtml)
  .replace('/*@fonts*/', () => FONTS_CSS)
  .replace('/*@shell-css*/', () => read('settings-r2/src/shell/shell.css'))
  .replace('/*@preact*/', () => read('src/runtime/preact.min.js'))
  .replace('/*@runtime*/', () => read('src/runtime/dc-mini-runtime.js'))
  .replace('/*@data*/', () => `window.__JUS_SOURCES=${js(built)};window.__JUS_META=${js(metaBuilt)};window.__JUS_DOCS=${js(docs)};window.__JUS_BUILT=${js(new Date().toISOString())};`)
  .replace('/*@shell-js*/', () => read('settings-r2/src/shell/shell.js'));
const outPath = PRIVATE ? path.resolve(PRIVATE) : path.join(ROOT, 'JU-SETTINGS-R2-TEN-DIRECTIONS.html');
fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, standalone);
console.log('built', metaBuilt.length, 'settings concepts;', (standalone.length / 1024 / 1024).toFixed(2), 'MB standalone →', outPath);

#!/usr/bin/env node
/* build.js — assembles (1) concepts/project/*.dc.html artboards for the Design canvas from concepts/src/*.dc.html
   (injecting the shared core, the review panel and concept metadata), (2) canvas.json + Main.dc.html,
   (3) the standalone review canvas JU-My-Ju-Fable51-10-Concepts.html (runtime + all artboards + shell + appendices). */
const fs = require('fs'); const path = require('path');
const ROOT = path.resolve(__dirname, '..');
const read = (p) => fs.readFileSync(path.join(ROOT, p), 'utf8');
const exists = (p) => fs.existsSync(path.join(ROOT, p));
const js = (s) => JSON.stringify(s).split('<').join('\\u003c');
const metaAll = JSON.parse(read(process.env.JU_CONCEPTS || 'concepts/concepts.json'));
const meta = metaAll.filter(c => { const ok = exists(`concepts/src/${c.file}`); if (!ok) console.warn('skip (no source yet):', c.file); return ok; });
const metaIndex = metaAll;
const core = ['src/core/ju-data.js', 'src/core/ju-fx.js', 'src/core/ju-review.js'].filter(exists).map(read).join('\n');
const panelHtml = read('src/core/ju-panel.html');
const panelCss = read('src/core/ju-panel.css');
const fxCss = read('src/core/ju-fx.css');
const fxSvg = read('src/core/ju-fx.svg');
fs.mkdirSync(path.join(ROOT, 'concepts/project'), { recursive: true });

function assemble(c) {
  let src = read(`concepts/src/${c.file}`);
  const conceptJson = JSON.stringify({ code: c.code, name: c.name, line: c.line, notes: c.notes || '', motions: c.motions || [] });
  if (!src.includes('<!-- @panel -->') || !src.includes('/* @core */') || !src.includes('/* @panel-css */')) throw new Error(c.file + ': missing a marker (<!-- @panel -->, /* @core */, /* @panel-css */)');
  src = src.replace('<!-- @panel -->', () => '<sc-if value="{{panel.show}}" hint-placeholder-val="{{true}}">\n' + panelHtml + '\n</sc-if>');
  src = src.replace('/* @panel-css */', () => panelCss + '\n' + fxCss);
  src = src.replace('<!-- @fx-svg -->', () => fxSvg);
  src = src.replace('/* @core */', () => core + '\nvar CONCEPT = ' + conceptJson + ';');
  if (!/<title>/.test(src)) src = src.replace('<head>', '<head>\n<title>' + c.code + ' ' + c.name + '</title>');
  return src;
}
const built = {};
for (const c of meta) { built[c.code] = assemble(c); fs.writeFileSync(path.join(ROOT, 'concepts/project', c.file), built[c.code]); }

/* ---- canvas index + Main entry artboard ---- */
const W = 780, H = 884, GX = 80, GY = 120; const perRow = 5;
const boards = { 'Main.dc.html': { x: 0, y: 0, w: 1240, h: 640, title: '评审入口 · 十套方案索引', is_interactive: true } };
const order = ['Main.dc.html'];
meta.forEach((c, i) => { const r = Math.floor(metaIndex.indexOf(metaIndex.find(x => x.code === c.code)) / perRow), col = metaIndex.indexOf(metaIndex.find(x => x.code === c.code)) % perRow; boards[c.file] = { x: col * (W + GX), y: 640 + 223 + 120 + r * (H + GY), w: W, h: H, title: `${c.code} ${c.name}`, is_interactive: true }; order.push(c.file); });
void ((c, i) => { const r = Math.floor(i / perRow), col = i % perRow; boards[c.file] = { x: col * (W + GX), y: 640 + 223 + 120 + r * (H + GY), w: W, h: H, title: `${c.code} ${c.name}`, is_interactive: true }; order.push(c.file); });
const canvasPath = path.join(ROOT, 'concepts/project/canvas.json');
let canvas = exists('concepts/project/canvas.json') ? JSON.parse(read('concepts/project/canvas.json')) : { v: 3, createdOnFiles: { v: 1, at: new Date().toISOString().replace(/\.\d+Z$/, 'Z') }, title: 'JU 我的局 · 十套视觉动效方案', launch: { view: 'canvas' }, pages: [], notes: {}, designSystems: [] };
canvas.boards = boards; canvas.order = order;
canvas.notes = Object.assign({}, canvas.notes, { row1: { x: 0, y: 640 + 120, text: '十套「我的局」方案 · 每套 = 手机画面（390×844）+ 画面外评审面板（状态索引 / 速度 / 关键帧 / 演示数据）', kind: 'title1', maxW: 4220 } });
fs.writeFileSync(canvasPath, JSON.stringify(canvas, null, 1));

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
.ix{width:1240px;height:640px;box-sizing:border-box;background:#141416;color:#f4f4f5;font-family:"Noto Sans SC",-apple-system,"PingFang SC",sans-serif;padding:44px 48px;display:flex;flex-direction:column;gap:22px}
.ix h1{margin:0;font-size:30px;font-weight:500;letter-spacing:.01em}
.ix .sub{margin:0;color:#a0a0a8;font-size:14px;max-width:900px;line-height:1.6}
.grid{display:grid;grid-template-columns:repeat(5, minmax(0, 1fr));gap:14px;flex:1 1 auto}
.card{display:flex;flex-direction:column;gap:6px;padding:14px;border:1px solid rgba(255,255,255,.14);border-radius:12px;color:inherit;text-decoration:none;background:rgba(255,255,255,.03);min-height:160px}
.card:hover{background:rgba(255,255,255,.08)}
.code{font:500 11px/1 "DM Mono",ui-monospace,monospace;letter-spacing:.12em;color:#9a9aa3}
.name{font-size:17px;font-weight:600;line-height:1.3}
.line{font-size:12px;color:#c4c4cc;line-height:1.55}
.foot{color:#7c7c86;font-size:12px}
</style>
</helmet>
<div class="ix">
  <h1>JU「我的局」· 十套视觉与动效方案</h1>
  <p class="sub">每套都是一台可操作的 390×844 手机画面，覆盖「我参加的」「我发起的」两种身份、局内详情、管理这局、弹层、票件与结束态；画面右侧是评审面板（状态索引 / 1× · 0.5× / 暂停 · 关键帧 / 演示数据 / 重置），不属于产品界面。点卡片进入对应方案。</p>
  <div class="grid">
${metaIndex.map(c => `    <a class="card" href="${c.file}"><span class="code">${c.code}</span><span class="name">${c.name}</span><span class="line">${c.line}</span></a>`).join('\n')}
  </div>
  <p class="foot">所有方案共用同一份示例活动与业务状态；每套数据独立。研究附录与差异矩阵见仓库 spec/ 与 research/。</p>
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
fs.writeFileSync(path.join(ROOT, 'concepts/project/Main.dc.html'), mainBoard);

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
for (const [k, f] of Object.entries({ ledger: 'research/ledger.md', matrix: 'spec/directions.md', motions: 'spec/motion-specs.md', coverage: 'spec/coverage.md', inventory: 'spec/state-inventory.md', limits: 'spec/limits.md', mapping: 'spec/concept-refs.md' })) docs[k] = exists(f) ? md(read(f)) : '<p>（本次构建未包含）</p>';

/* ---- standalone ---- */
const shellHtml = read('src/shell/shell.html');
const standalone = shellHtml
  .replace('/*@shell-css*/', () => read('src/shell/shell.css'))
  .replace('/*@preact*/', () => read('src/runtime/preact.min.js'))
  .replace('/*@runtime*/', () => read('src/runtime/dc-mini-runtime.js'))
  .replace('/*@data*/', () => `window.__JU_SOURCES=${js(built)};window.__JU_META=${js(meta)};window.__JU_DOCS=${js(docs)};window.__JU_BUILT=${js(new Date().toISOString())};`)
  .replace('/*@shell-js*/', () => read('src/shell/shell.js'));
fs.writeFileSync(path.join(ROOT, 'JU-My-Ju-Fable51-10-Concepts.html'), standalone);
console.log('built', meta.length, 'concepts;', (standalone.length / 1024 / 1024).toFixed(2), 'MB standalone');

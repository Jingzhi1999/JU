// Runs tools/coverage.cjs for every concept that has a source file and writes my-r2/spec/coverage.md with FIVE SEPARATE columns.
// node my-r2/tools/coverage-matrix.cjs [C01 C02 ...] [--out my-r2/spec/coverage.md] [--manual my-r2/spec/coverage-manual.json] [--evidence my-r2/evidence] [--no-run]
//   file under test: JU_STANDALONE=<path> or the deliverable (build first). Screenshots → <evidence>/CNN/coverage-matrix/<key>.png
//   Column 1 「入口存在」 is automatic (the jump reached the state and a screenshot exists). Columns 2–5 「真实操作成功 / 静态视觉已看 /
//   正常速度动效已看 / 仍需用户验收」 are read from the hand-kept manual file so a re-run never erases them:
//     { "C01": { "j-home": { "op": "✓ capture flow-enter 10-22", "static": "✓ lead 10-22", "motion": "✓ flow-compare 10-22", "pending": "首屏层级" }, "*": { "pending": "全部视觉" } } }
//   ("*" = a default for every state of that concept). --no-run keeps the existing screenshots and only rewrites the markdown.
//   build.js parses the "### CNN" tables of the output into window.__JU_COVERAGE for the shell's 覆盖表 page.
const { execSync } = require('child_process'); const fs = require('fs'); const path = require('path');
const ROOT = path.resolve(__dirname, '..', '..');
const opt = (k, d) => { const i = process.argv.indexOf('--' + k); return i >= 0 ? process.argv[i + 1] : d; }; const flag = (k) => process.argv.indexOf('--' + k) >= 0;
const only = process.argv.slice(2).filter(a => /^C\d\d$/.test(a));
const out = path.resolve(opt('out', path.join(ROOT, 'my-r2/spec/coverage.md')));
const manualFile = path.resolve(opt('manual', path.join(ROOT, 'my-r2/spec/coverage-manual.json')));
const manual = fs.existsSync(manualFile) ? JSON.parse(fs.readFileSync(manualFile, 'utf8')) : {};
const metaFile = process.env.JU_CONCEPTS || path.join(ROOT, 'my-r2/concepts/concepts.json'); const srcDir = process.env.JU_CONCEPTS_DIR || path.join(ROOT, 'my-r2/concepts/src');
const meta = fs.existsSync(metaFile) ? JSON.parse(fs.readFileSync(metaFile, 'utf8')) : [];
/* internal concepts (C00) take part only when named on the command line, as with the build's JU_ONLY */
const concepts = meta.filter(c => (only.length ? only.includes(c.code) : !c.internal) && fs.existsSync(path.join(srcDir, c.file)));
const vm = require('vm'); const ctx = { window: {}, console }; ctx.window.window = ctx.window; vm.createContext(ctx);
const dataFile = path.join(process.env.JU_CORE_DIR ? path.resolve(process.env.JU_CORE_DIR) : path.join(ROOT, 'my-r2/src/core'), 'ju-data.js');
try { vm.runInContext(fs.readFileSync(path.join(ROOT, 'src/core/ju-fx.js'), 'utf8'), ctx); } catch (e) { }
vm.runInContext(fs.readFileSync(dataFile, 'utf8'), ctx); const INDEX = ctx.window.JU.INDEX;
const evidenceRoot = path.resolve(opt('evidence', path.join(ROOT, 'my-r2/evidence')));
const results = {};
for (const c of concepts) {
  const code = c.code; const dir = path.join(evidenceRoot, code, 'coverage-matrix');
  if (!flag('no-run')) { try { execSync(`node my-r2/tools/coverage.cjs ${code} ${dir}`, { cwd: ROOT, stdio: 'pipe', timeout: 900000 }); } catch (e) { } }
  let log = { states: 0, errors: ['coverage run failed'] };
  try { log = JSON.parse(fs.readFileSync(path.join(dir, 'log.json'), 'utf8')); } catch (e) { }
  const have = new Set(fs.existsSync(dir) ? fs.readdirSync(dir).filter(f => /\.(png|jpg)$/.test(f) && !/^sheet\./.test(f)).map(f => f.replace(/\.(png|jpg)$/, '')) : []);
  results[code] = { name: c.name, have, errors: log.errors || [], mismatches: log.mismatches || [] };
}
const codes = concepts.map(c => c.code); const stamp = new Date().toISOString().slice(0, 16).replace('T', ' ') + ' UTC';
const cell = (v) => String(v == null ? '' : v).replace(/\|/g, '\\|').replace(/\n/g, ' ') || '–';
let md = `# 覆盖表（自动生成 ${stamp}）\n\n`;
md += `五栏分开记录，不用一个「50/50 ✓」同时声称五件事：\n\n- **入口存在**：\`tools/coverage.cjs\` 对每套跳转全部 ${INDEX.length} 个索引状态并截图；✓ = 可到达且截图已生成（\`my-r2/evidence/CNN/coverage-matrix/<key>.jpg\`）。\n- **真实操作成功 / 静态视觉已看 / 正常速度动效已看**：逐格取自每套独立复核者自己的覆盖表（\`my-r2/evidence/CNN/verify.md\` 第 1 轮；只勾复核者亲自做过、看过的），由 \`tools/coverage-from-verify.py\` 写入 \`my-r2/spec/coverage-manual.json\`；之后的修复由复核第 2 轮或主负责人复验，每套表前写明。主负责人另在交付文件上把十套 500 张状态截图按接触表逐套看过一遍（2026-10-30）。\n- **仍需用户验收**：每个状态都还要你做最终的视觉验收；「R1 曾记」是第 1 轮在该状态上记下的问题，已进入修复轮，不表示仍未解决。\n\n`;
md += `## 入口存在（自动）\n\n| 状态 | 分组 | ${codes.join(' | ')} |\n|---|---|${codes.map(() => '---').join('|')}|\n`;
for (const e of INDEX) md += `| ${e.key} · ${e.label} | ${e.group} | ${codes.map(c => results[c].have.has(e.key) ? '✓' : '✗').join(' | ')} |\n`;
md += `\n| 方案 | 可到达状态 | 跳转后 jumpKey 不符 | errors |\n|---|---|---|---|\n` + codes.map(c => `| ${c} | ${results[c].have.size}/${INDEX.length} | ${results[c].mismatches.length} | ${results[c].errors.length}${results[c].errors.length ? '：' + cell(results[c].errors.slice(0, 3).join('；').slice(0, 300)) : ''} |`).join('\n') + '\n';
md += `\n## 五栏覆盖（每套）\n\n`;
for (const c of codes) {
  const m = manual[c] || {}; const star = m['*'] || {};
  md += `### ${c} ${results[c].name}\n\n` + (star.note ? star.note + '\n\n' : '') + `| 状态 | 入口存在 | 真实操作成功 | 静态视觉已看 | 正常速度动效已看 | 仍需用户验收 |\n|---|---|---|---|---|---|\n`;
  for (const e of INDEX) { const r = Object.assign({}, star, m[e.key] || {}); md += `| ${e.key} · ${e.label} | ${results[c].have.has(e.key) ? '✓' : '✗'} | ${cell(r.op)} | ${cell(r.static)} | ${cell(r.motion)} | ${cell(r.pending)} |\n`; }
  md += '\n';
}
fs.mkdirSync(path.dirname(out), { recursive: true }); fs.writeFileSync(out, md);
console.log(JSON.stringify({ out, concepts: Object.fromEntries(codes.map(c => [c, { states: results[c].have.size, errors: results[c].errors.length, mismatches: results[c].mismatches.length }])) }));

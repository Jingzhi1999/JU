// Runs tools/coverage.cjs for every concept that has a source file and writes spec/coverage.md (state × concept matrix).
// node settings-r2/tools/coverage-matrix.cjs [SC01 SC02 ...]   (uses the shared standalone; build first)
const { execSync } = require('child_process'); const fs = require('fs'); const path = require('path');
const ROOT = path.resolve(__dirname, '..', '..');
const meta = JSON.parse(fs.readFileSync(path.join(ROOT, 'settings-r2/concepts/concepts.json'), 'utf8'));
const only = process.argv.slice(2);
const codes = meta.filter(c => fs.existsSync(path.join(ROOT, 'settings-r2/concepts/src', c.file)) && (!only.length || only.includes(c.code))).map(c => c.code);
const vm = require('vm'); const ctx = { window: {} }; ctx.window.window = ctx.window; vm.createContext(ctx); vm.runInContext(fs.readFileSync(path.join(ROOT, 'settings-r2/src/core/jus-data.js'), 'utf8'), ctx);
const INDEX = ctx.window.JUS.INDEX;
const results = {};
for (const code of codes) {
  const out = path.join(ROOT, 'settings-r2/evidence', code, 'coverage-matrix');
  try { execSync(`node settings-r2/tools/coverage.cjs ${code} ${out}`, { cwd: ROOT, stdio: 'pipe', timeout: 600000 }); } catch (e) { }
  let log = { states: 0, errors: ['coverage run failed'] };
  try { log = JSON.parse(fs.readFileSync(path.join(out, 'log.json'), 'utf8')); } catch (e) { }
  const have = new Set(fs.existsSync(out) ? fs.readdirSync(out).filter(f => f.endsWith('.png') && f !== 'sheet.png').map(f => f.replace(/\.png$/, '')) : []);
  results[code] = { have, errors: log.errors || [] };
}
let md = `# 状态覆盖矩阵（自动生成 ${new Date().toISOString().slice(0, 16).replace('T', ' ')} UTC）\n\n`;
md += `口径：\`tools/coverage.cjs\` 对每套跳转全部 ${INDEX.length} 个索引状态并截图；✓ = 该状态可到达且截图已生成（\`settings-r2/evidence/SCNN/coverage-matrix/<key>.png\`）；截图是否正确显示该状态需人工看图（见各套 review 报告）。errors = 跳转过程中的控制台 / 页面错误数。\n\n`;
md += `| 状态 | 分组 | ${codes.join(' | ')} |\n|---|---|${codes.map(() => '---').join('|')}|\n`;
for (const e of INDEX) md += `| ${e.key} · ${e.label} | ${e.group} | ${codes.map(c => results[c].have.has(e.key) ? '✓' : '✗').join(' | ')} |\n`;
md += `\n| 方案 | 可到达状态 | errors |\n|---|---|---|\n` + codes.map(c => `| ${c} | ${results[c].have.size}/${INDEX.length} | ${results[c].errors.length}${results[c].errors.length ? '：' + results[c].errors.slice(0, 3).join('；').slice(0, 300) : ''} |`).join('\n') + '\n';
fs.writeFileSync(path.join(ROOT, 'settings-r2/spec/coverage.md'), md);
console.log(JSON.stringify(Object.fromEntries(codes.map(c => [c, { states: results[c].have.size, errors: results[c].errors.length }]))));

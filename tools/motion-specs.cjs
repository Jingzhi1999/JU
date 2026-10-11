// Concatenates spec/motion/*.md into spec/motion-specs.md (appendix: key visual parameters + three core motions per concept).
const fs = require('fs'); const path = require('path'); const ROOT = path.resolve(__dirname, '..');
const dir = path.join(ROOT, 'spec/motion'); const files = fs.existsSync(dir) ? fs.readdirSync(dir).filter(f => /^C\d\d\.md$/.test(f)).sort() : [];
let md = `# 十套方案 · 关键视觉参数与核心动效分段（汇总 ${new Date().toISOString().slice(0, 10)}）\n\n各节由对应方案的实现代理撰写（当前代码值），主负责人复核状态见 JU-MY-JU-PROJECT-RECORD.md §3。\n\n`;
for (const f of files) { const t = fs.readFileSync(path.join(dir, f), 'utf8').replace(/^# /m, '## '); md += t + '\n\n---\n\n'; }
if (!files.length) md += '（尚无方案规格）\n';
fs.writeFileSync(path.join(ROOT, 'spec/motion-specs.md'), md); console.log('motion-specs:', files.join(', '));

// Concatenates my-r2/spec/motion/CNN.md (each concept's eleven-family motion record + key visual parameters + "one judgement that
// may still fail") into one appendix file. build.js shows my-r2/spec/motion-record.md when it exists, else my-r2/spec/motion-specs.md.
// node my-r2/tools/motion-specs.cjs [--out my-r2/spec/motion-specs.md]
const fs = require('fs'); const path = require('path'); const ROOT = path.resolve(__dirname, '..', '..');
const i = process.argv.indexOf('--out'); const out = i >= 0 ? path.resolve(process.argv[i + 1]) : path.join(ROOT, 'my-r2/spec/motion-specs.md');
const dir = path.join(ROOT, 'my-r2/spec/motion'); const files = fs.existsSync(dir) ? fs.readdirSync(dir).filter(f => /^C\d\d\.md$/.test(f)).sort() : [];
let md = `# 我的局十套 · 十一族动效记录与关键视觉参数（汇总 ${new Date().toISOString().slice(0, 10)}）\n\n各节由对应方案的实现者撰写（当前代码值：谁动、从哪到哪、时长曲线、打断与返回、减少动态终态；字体角色与字阶、行宽实测、色板与前景面积、光源 / 表面规则、页头收拢实现；一个仍可能失败的设计判断与检查方法）。主负责人复核状态见 JU-MY-R2-PROJECT-RECORD.md。\n\n`;
for (const f of files) { const t = fs.readFileSync(path.join(dir, f), 'utf8').replace(/^# /m, '## '); md += t + '\n\n---\n\n'; }
if (!files.length) md += '（尚无方案记录：my-r2/spec/motion/CNN.md）\n';
fs.mkdirSync(path.dirname(out), { recursive: true }); fs.writeFileSync(out, md); console.log('motion-specs:', files.length ? files.join(', ') : '(none)', '→', out);

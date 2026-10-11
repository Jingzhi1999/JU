// Jump through every JU.INDEX state of a concept, screenshot each, and tile a coverage sheet.
// node tools/coverage.cjs <CODE> <outdir> [--only j-|h-|b-]   → outdir/<key>.png, sheet.png, log.json
const { chromium } = require('/opt/node-tools/node_modules/playwright');
const { execSync } = require('child_process'); const fs = require('fs'); const path = require('path');
const [code, outdir] = process.argv.slice(2); const only = (() => { const i = process.argv.indexOf('--only'); return i >= 0 ? process.argv[i + 1] : ''; })();
(async () => {
  fs.rmSync(outdir, { recursive: true, force: true }); fs.mkdirSync(outdir, { recursive: true });
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1000, height: 1000 } });
  const errors = []; p.on('pageerror', e => errors.push(e.message)); p.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  await p.goto('file://' + (process.env.JU_STANDALONE ? path.resolve(process.env.JU_STANDALONE) : path.resolve(__dirname, '..', 'JU-My-Ju-Fable51-10-Concepts.html')) + '#concept/' + code);
  await p.waitForTimeout(600); await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(400);
  const phone = await p.evaluate(c => { const h = document.querySelector('.stage-host[data-code="' + c + '"]'); const r = h.shadowRoot.querySelector('.ju-phone').getBoundingClientRect(); return { x: r.left, y: r.top, w: r.width, h: r.height }; }, code);
  const keys = await p.evaluate(() => JU.INDEX.map(e => e.key));
  const files = [];
  for (const k of keys) {
    if (only && !k.startsWith(only)) continue;
    const before = errors.length;
    await p.evaluate(([c, k]) => { window.JUShell.mounts.stage['stage:' + c + ':'].instance.jumpTo(k); }, [code, k]);
    await p.waitForTimeout(700);
    const f = `${outdir}/${k}.png`; await p.screenshot({ path: f, clip: { x: phone.x, y: phone.y, width: phone.w, height: phone.h } }); files.push(f);
    if (errors.length > before) errors.push(`^ while jumping to ${k}`);
  }
  const cols = 8, rows = Math.ceil(files.length / cols);
  files.forEach((f, i) => fs.copyFileSync(f, `${outdir}/s${String(i).padStart(2, '0')}.png`));
  try { execSync(`ffmpeg -y -loglevel error -framerate 1 -i '${outdir}/s%02d.png' -vf "scale=240:-1,tile=${cols}x${rows}:padding=4:margin=4:color=white" -frames:v 1 -update 1 '${outdir}/sheet.png'`); } catch (e) { errors.push('sheet failed: ' + String(e.stderr || e.message).slice(0, 200)); }
  fs.readdirSync(outdir).filter(f => /^s\d+\.png$/.test(f)).forEach(f => fs.unlinkSync(`${outdir}/${f}`));
  fs.writeFileSync(`${outdir}/log.json`, JSON.stringify({ code, states: files.length, errors }, null, 1));
  console.log(JSON.stringify({ states: files.length, errors: errors.length, sheet: `${outdir}/sheet.png` }));
  await b.close();
})();

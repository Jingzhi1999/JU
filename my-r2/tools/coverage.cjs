// Jump through every JU.INDEX state (50) of a concept, screenshot each, and tile a coverage sheet — the 「入口存在」 column only.
// node my-r2/tools/coverage.cjs <CODE> <outdir> [--only j-|h-|b-] [--settle 700]   → outdir/<key>.png, sheet.png, log.json
// env JU_STANDALONE=<path> targets a private build; otherwise the deliverable. log.json: {code, states, keys, errors, mismatches}
// (mismatches = jumps after which inst.state.jumpKey is not the requested key, when the mixin exposes it).
const L = require('./_lib.cjs'); const fs = L.fs;
const [code, outdir] = L.positionals(); const only = L.opt('only', ''); const settle = +L.opt('settle', 700);
if (!code || !outdir) { console.error('usage: node my-r2/tools/coverage.cjs <CODE> <outdir> [--only j-]'); process.exit(2); }
(async () => {
  fs.rmSync(outdir, { recursive: true, force: true }); fs.mkdirSync(outdir, { recursive: true });
  const { b, p, errors } = await L.launch();
  const ok = await L.openConcept(p, L.fileFor(code), code);
  if (!ok) { console.log(JSON.stringify({ states: 0, errors: ['concept not mounted: ' + code].concat(errors) })); await b.close(); process.exit(1); }
  const phone = await L.phoneRect(p, code);
  const keys = (await L.indexKeys(p)).filter(k => !only || k.startsWith(only));
  const files = []; const mismatches = [];
  for (const k of keys) {
    const before = errors.length;
    await L.jump(p, code, k, settle);
    const jk = await L.E(p, code, "return inst.state && 'jumpKey' in inst.state ? inst.state.jumpKey : (inst.state.view && inst.state.view.jumpKey) || null;");
    if (jk && jk !== k) mismatches.push(k + ' → ' + jk);
    const f = `${outdir}/${k}.png`; await L.shot(p, phone, f); files.push(f);
    if (errors.length > before) errors.push(`^ while jumping to ${k}`);
  }
  const cols = 8, rows = Math.ceil(files.length / cols);
  files.forEach((f, i) => fs.copyFileSync(f, `${outdir}/s${String(i).padStart(2, '0')}.png`));
  try { L.execSync(`ffmpeg -y -loglevel error -reinit_filter 0 -framerate 1 -i '${outdir}/s%02d.png' -vf "scale=240:-1,tile=${cols}x${rows}:padding=4:margin=4:color=white" -frames:v 1 -update 1 '${outdir}/sheet.png'`); } catch (e) { errors.push('sheet failed: ' + String(e.stderr || e.message).slice(0, 200)); }
  fs.readdirSync(outdir).filter(f => /^s\d+\.png$/.test(f)).forEach(f => fs.unlinkSync(`${outdir}/${f}`));
  L.writeLog(outdir, { code, states: files.length, keys, errors, mismatches });
  console.log(JSON.stringify({ states: files.length, errors: errors.length, mismatches: mismatches.length, sheet: `${outdir}/sheet.png` }));
  await b.close();
})().catch(e => { console.error(e); process.exit(1); });

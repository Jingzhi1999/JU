// Lead review sheet (my-r2): render the SAME state in every available build (.build/CNN.html, or the deliverable with --final),
// anonymised (no names / codes on the sheet, tiles in the given order only), optionally grayscale, at a given phone size and
// environment, and tile into one image.
// Usage: node my-r2/tools/lead-sheet.cjs <outdir> <state-key> [--codes C01,C02,...] [--gray] [--w 390 --h 844] [--skin cotton|halo|sunset] [--final]
//        [--actions '<json>'] (after the jump; same grammar as flows.json steps: click / wait / scrollEnd / input / key / eval)
//        [--zoom] [--safe] [--kb]   (文字 115% / 安全区 / 键盘 simulation on every build)
//   output: outdir/<CODE>.png per build, outdir/sheet[-gray].png, outdir/log.json
const L = require('./_lib.cjs'); const fs = L.fs, path = L.path;
const [outdir, stateKey] = L.positionals();
if (!outdir || !stateKey) { console.error('usage: node my-r2/tools/lead-sheet.cjs <outdir> <state-key> [--codes …] [--gray] [--final]'); process.exit(2); }
(async () => {
  fs.mkdirSync(outdir, { recursive: true });
  const codes = L.opt('codes', 'C01,C02,C03,C04,C05,C06,C07,C08,C09,C10').split(',');
  const W = +L.opt('w', 390), H = +L.opt('h', 844); const skin = L.opt('skin', ''); const actions = JSON.parse(L.opt('actions', '[]'));
  const { b, p } = await L.launch(); const files = []; const log = {};
  for (const code of codes) {
    const file = L.fileFor(code, { final: L.flag('final'), preferPrivate: true });
    if (!fs.existsSync(file)) { log[code] = 'no build'; continue; }
    const errors = []; const onErr = e => errors.push(e.message); p.on('pageerror', onErr);
    const ok = await L.openConcept(p, file, code, 700); if (!ok) { log[code] = 'not mounted'; p.off('pageerror', onErr); continue; }
    await L.E(p, code, 'inst.setPhoneSize(a[0], a[1])', [W, H]); await p.waitForTimeout(200);
    if (stateKey !== 'j-home') await L.jump(p, code, stateKey, 700);
    for (const k of ['zoom', 'safe', 'kb']) if (L.flag(k)) await L.setToggle(p, code, k, true);
    let skinHow = ''; if (skin) { skinHow = await L.setSkin(p, code, skin); await p.waitForTimeout(400); }
    const issues = []; for (const a of actions) { const issue = await L.runStep(p, code, a); if (issue) issues.push(issue); }
    await p.waitForTimeout(600);
    const r = await L.phoneRect(p, code); const f = path.join(outdir, `${code}.png`); await L.shot(p, r, f); files.push(f);
    log[code] = { ok, skin: skinHow, issues, errors: errors.slice(0, 3) }; p.off('pageerror', onErr);
  }
  await b.close();
  if (files.length) { const rows = []; for (let i = 0; i < files.length; i += 5) rows.push(files.slice(i, i + 5)); L.tilePy(outdir, rows, path.join(outdir, 'sheet' + (L.flag('gray') ? '-gray' : '') + '.png'), { scale: 0.5, gap: 10, gray: L.flag('gray'), bg: '44,44,48' }); }
  fs.writeFileSync(path.join(outdir, 'log.json'), JSON.stringify({ state: stateKey, W, H, skin, gray: L.flag('gray'), log }, null, 1));
  console.log(JSON.stringify({ state: stateKey, built: files.length, log }));
})().catch(e => { console.error(e); process.exit(1); });

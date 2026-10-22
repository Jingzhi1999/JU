// Same-flow comparison across concepts (差异检查 3 / 正常速度录屏替代): runs the SAME real-click flow in every concept at 1×
// and keeps a JPEG frame every --every ms for --span ms after each click (≥ 24 frames for the default 进入—操作—返回 flow),
// one row per concept, so the spatial organisation of each concept's transition can be compared side by side.
// Usage: node my-r2/tools/flow-compare.cjs <outdir> [--codes C01,C02,...] [--flow enter-back] [--final] [--skin cotton] [--speed 1] [--every 80] [--span 1000]
//   files: .build/<CODE>.html per concept (private builds) unless --final (the deliverable) or JU_STANDALONE (one file for all)
//   flows: my-r2/tools/flows.json (enter-back = home → first row → detail → back; tear-contact-copy; end-attend; …)
//   output: outdir/<CODE>-NN.jpg frames, outdir/sheet.png (rows = concepts), outdir/log.json (how each click landed, frame labels)
const L = require('./_lib.cjs'); const fs = L.fs, path = L.path;
const [outdir] = L.positionals();
if (!outdir) { console.error('usage: node my-r2/tools/flow-compare.cjs <outdir> [--codes C01,C02] [--flow enter-back] [--final]'); process.exit(2); }
(async () => {
  fs.mkdirSync(outdir, { recursive: true });
  const codes = L.opt('codes', 'C01,C02,C03,C04,C05,C06,C07,C08,C09,C10').split(','); const skin = L.opt('skin', ''); const speed = +L.opt('speed', 1);
  const every = +L.opt('every', 80), span = +L.opt('span', 1000); const flowName = L.opt('flow', 'enter-back');
  const flow = L.loadFlows()[flowName]; if (!flow) { console.error('unknown flow: ' + flowName); process.exit(2); }
  const { b, p, errors } = await L.launch(); const rows = []; const log = {};
  for (const code of codes) {
    const file = L.fileFor(code, { final: L.flag('final'), preferPrivate: true });
    if (!fs.existsSync(file)) { log[code] = 'no build'; continue; }
    const start = errors.length;
    const ok = await L.openConcept(p, file, code, 800); if (!ok) { log[code] = 'not mounted'; continue; }
    await L.E(p, code, 'inst.reset(); inst.setSpeed(a)', speed); if (skin) await L.setSkin(p, code, skin); await p.waitForTimeout(400);
    if (flow.jump) await L.jump(p, code, flow.jump, 500);
    const box = await L.phoneRect(p, code); const frames = []; const how = [];
    /* JPEG frames: PNG encoding of a full-screen colour field takes ~500ms and would make the timed frames land late */
    const shot = async (label) => { const f = path.join(outdir, `${code}-${String(frames.length).padStart(2, '0')}.jpg`); await L.shot(p, box, f, 'jpeg'); frames.push({ f, label }); };
    await shot('起点');
    for (const st of flow.steps) {
      if (st.click) {
        const r = await L.clickSel(p, code, st.click, st); const issue = L.clickIssue(r, st.click); how.push((issue || 'click') + ' ← ' + st.click);
        const t0 = Date.now(); let k = 0;
        while (Date.now() - t0 < span) { const due = t0 + k * every; const w = due - Date.now(); if (w > 0) await p.waitForTimeout(w); await shot(st.click.replace(/\[data-act="?|"?\]/g, '') + ' +' + (Date.now() - t0) + 'ms'); k++; }
      }
      else if (st.wait) { /* flows carry waits for rm-check; here the frames already cover the time */ await p.waitForTimeout(Math.min(st.wait, 200)); }
      else { const issue = await L.runStep(p, code, st); if (issue) how.push(issue); }
    }
    await p.waitForTimeout(400); await shot('终态');
    rows.push({ code, frames }); log[code] = { how, errors: errors.slice(start, start + 3), frames: frames.length };
  }
  await b.close();
  if (rows.length) L.tilePy(outdir, rows.map(r => r.frames.map(x => x.f)), path.join(outdir, 'sheet.png'), { scale: 0.34, gap: 6 });
  fs.writeFileSync(path.join(outdir, 'log.json'), JSON.stringify({ flow: flowName, title: flow.title, skin, speed, every, span, labels: rows[0] ? rows[0].frames.map(x => x.label) : [], log }, null, 1));
  console.log(JSON.stringify({ flow: flowName, rows: rows.length, frames: rows[0] ? rows[0].frames.length : 0, sheet: path.join(outdir, 'sheet.png'), log }));
})().catch(e => { console.error(e); process.exit(1); });

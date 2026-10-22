// System reduced-motion check (my-r2): emulate prefers-reduced-motion: reduce, open the concept, run the real-click flows of
// tools/flows.json (详情返回 / 阅读确认出票 / 撕票联系复制 / 改期接受·拒绝 / 候补退出 / 审核 / 改时间 / 取消燃烧 / 散场出席 / 草稿删除撤销)
// and verify (a) the mixin reports rmSys, (b) every flow reaches its terminal state (its expectations hold, i.e. the source,
// the result and the necessary state are as complete as with motion), (c) no animation longer than 1ms is still running after it.
// Usage: JU_STANDALONE=.build/C01.html node my-r2/tools/rm-check.cjs C01 [outdir] [--flows enter-back,tear-contact-copy]
//   → outdir/f00-<flow>.png (terminal state of each flow), log.json {rmSys, findings, flows, errors}
const L = require('./_lib.cjs'); const fs = L.fs, path = L.path;
const [code, outArg] = L.positionals();
if (!code) { console.error('usage: node my-r2/tools/rm-check.cjs <CODE> [outdir] [--flows a,b]'); process.exit(2); }
(async () => {
  const outdir = outArg || path.resolve('.build', code + '-rm'); fs.mkdirSync(outdir, { recursive: true });
  const all = L.loadFlows(); const names = (L.opt('flows', '') || Object.keys(all).filter(k => k[0] !== '_').join(',')).split(',').filter(Boolean);
  const { b, p, errors } = await L.launch({ reducedMotion: 'reduce' });
  const ok = await L.openConcept(p, L.fileFor(code), code, 900);
  if (!ok) { console.log(JSON.stringify({ code, error: 'concept not mounted', errors })); await b.close(); process.exit(1); }
  const rmSys = await L.E(p, code, 'return !!(inst.state.review && inst.state.review.rmSys)');
  const rmClass = await L.E(p, code, "var app = sr.querySelector('.app'); return app ? app.className : ''");
  const findings = []; const flows = {}; let n = 0;
  if (!rmSys) findings.push('mixin does not report review.rmSys under prefers-reduced-motion: reduce');
  if (!/\brm\b/.test(rmClass)) findings.push('.app has no .rm class under prefers-reduced-motion (rootCls): ' + rmClass);
  for (const name of names) {
    const f = all[name]; if (!f) { findings.push('unknown flow: ' + name); continue; }
    const before = errors.length; const issues = [];
    if (f.jump) await L.jump(p, code, f.jump, 300);
    for (const st of f.steps) { const issue = await L.runStep(p, code, st); if (issue) issues.push(issue); }
    await p.waitForTimeout(250);
    const anim = await L.runningAnimations(p, code, 1);
    if (anim.length) issues.push('running animations > 1ms after the flow: ' + anim.slice(0, 5).join(', '));
    if (errors.length > before) issues.push('page errors during the flow: ' + errors.slice(before).slice(0, 2).join(' | '));
    flows[name] = { title: f.title, ok: !issues.length, issues };
    issues.forEach(i => findings.push(`${name}: ${i}`));
    const r = await L.phoneRect(p, code); await L.shot(p, r, `${outdir}/f${String(n++).padStart(2, '0')}-${name}.png`);
  }
  await b.close();
  L.writeLog(outdir, { code, rmSys, findings, flows, errors });
  console.log(JSON.stringify({ code, rmSys, flowsOk: Object.values(flows).filter(x => x.ok).length + '/' + names.length, findings, errors: errors.length }));
})().catch(e => { console.error(e); process.exit(1); });

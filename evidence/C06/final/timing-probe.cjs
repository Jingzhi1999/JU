// Real-time windows under 减少动态 ON / OFF: how long the draft undo bar, the copy toast, the 「已复制」 label and the 改时间 toast stay up.
// node evidence/C06/final/timing-probe.cjs <standalone.html> <out.json>
const { chromium } = require('/opt/node-tools/node_modules/playwright');
const fs = require('fs'); const path = require('path');
const [file, out] = process.argv.slice(2);
const M = "window.JUShell.mounts.stage['stage:C06:']";
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1000, height: 1000 } });
  const errors = []; p.on('pageerror', e => errors.push(e.message)); p.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  await p.goto('file://' + path.resolve(file) + '#concept/C06'); await p.waitForTimeout(800); await p.evaluate(() => document.fonts.ready);
  const ev = js => p.evaluate(js => { const m = window.JUShell.mounts.stage['stage:C06:']; return new Function('root', 'inst', js)(m.root, m.instance); }, js);
  const q = sel => p.evaluate(sel => { const r = document.querySelector('.stage-host[data-code="C06"]').shadowRoot; const e = r.querySelector(sel); if (!e) return null; const cs = getComputedStyle(e); return { text: e.textContent.trim(), op: +cs.opacity, disp: cs.display }; }, sel);
  // sample a predicate every 50ms for up to `max` ms; returns first-on / last-on times relative to t0
  const watch = async (pred, max, t0) => { let on = null, off = null; const end = t0 + max; while (Date.now() < end) { const v = await pred(); const t = Date.now() - t0; if (v && on == null) on = t; if (v) off = t; await p.waitForTimeout(50); } return { on, lastOn: off, upMs: on == null ? 0 : off - on }; };
  const res = {};
  for (const rm of [true, false]) {
    const k = rm ? 'rm_on' : 'rm_off'; res[k] = {};
    // ---- draft delete → undo bar (10 s window), then undo at 8.6 s ----
    await ev("inst.jumpTo('h-draft')"); await p.waitForTimeout(700);
    if (rm !== !!(await ev('return inst.state.review.rm'))) await ev('inst.toggleRM()');
    await p.waitForTimeout(100);
    let t0 = Date.now(); await ev("root.querySelector('.c06-over [data-act=\"delete\"]').click()");
    const u = await watch(async () => !!(await q('.c06-undo')), 8600, t0);
    const visAt85 = !!(await q('.c06-undo')); const lineDisp = await ev("var i = root.querySelector('.c06-undo i'); return i ? getComputedStyle(i).display : 'n/a'");
    await ev("var b = root.querySelector('.c06-undo [data-act=\"undo\"]'); if (b) b.click()"); await p.waitForTimeout(rm ? 300 : 900);
    const restored = await ev("return JU.derive.hosted(inst.state.data).drafts.some(function (d) { return d.id === 'draft-reading'; }) && !inst.state.undo");
        res[k].undo = Object.assign(u, { visibleAt8600: visAt85, undoRestored: restored, countdownLine: lineDisp });
    // ---- full 10 s window without undo: commit happens at ~10 s, not before ----
    await ev("inst.jumpTo('h-draft')"); await p.waitForTimeout(700); if (rm !== !!(await ev('return inst.state.review.rm'))) await ev('inst.toggleRM()');
    t0 = Date.now(); await ev("root.querySelector('.c06-over [data-act=\"delete\"]').click()");
    res[k].undoFull = await watch(async () => !!(await q('.c06-undo')), 11800, t0);
    res[k].undoFull.committed = await ev("return !inst.state.undo && !JU.derive.hosted(inst.state.data).drafts.some(function (d) { return d.id === 'draft-reading'; })");
    // ---- copy wechat: toast + 已复制 label ----
    await ev("inst.jumpTo('j-d-contact')"); await p.waitForTimeout(900); if (rm !== !!(await ev('return inst.state.review.rm'))) await ev('inst.toggleRM()');
    t0 = Date.now(); await ev("root.querySelector('.c06-over [data-act=\"copy\"]').click()");
    let lab = { on: null, last: null }; const tt = await watch(async () => { const t = await q('.c06-toast.in'); const c = await q('.c06-over [data-act="copy"]'); const now = Date.now() - t0; if (c && c.text === '已复制') { if (lab.on == null) lab.on = now; lab.last = now; } return !!(t && t.op > 0.5); }, 4000, t0);
    res[k].copyToast = Object.assign(tt, { text: '微信号已复制' }); res[k].copiedLabel = { on: lab.on, lastOn: lab.last, upMs: lab.on == null ? 0 : lab.last - lab.on };
    // ---- 改时间 submit: toast ----
    await ev("inst.jumpTo('h-m-reschedule')"); await p.waitForTimeout(900); if (rm !== !!(await ev('return inst.state.review.rm'))) await ev('inst.toggleRM()');
    await ev("inst.patchView({ rsDate: '2026-12-26', rsTime: '19:30' })"); await p.waitForTimeout(150);
    t0 = Date.now(); await ev("inst.submitReschedule()");
    let txt = ''; const rt = await watch(async () => { const t = await q('.c06-toast.in'); if (t && t.op > 0.5) txt = t.text; return !!(t && t.op > 0.5); }, 4600, t0);
    res[k].rescheduleToast = Object.assign(rt, { text: txt });
    await ev('if (inst.state.review.rm) inst.toggleRM()');
  }
  res.errors = errors;
  fs.writeFileSync(out, JSON.stringify(res, null, 1)); console.log(JSON.stringify(res, null, 1)); await b.close();
})();

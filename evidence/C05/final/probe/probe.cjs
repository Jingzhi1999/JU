// Timing probe for C05 real-time windows: undo bar, toast, 已复制 label — reduced motion ON vs OFF.
const { chromium } = require('/opt/node-tools/node_modules/playwright');
const fs = require('fs'); const path = require('path');
const out = process.argv[2];
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1000, height: 1000 } });
  const errors = []; p.on('pageerror', e => errors.push(e.message)); p.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  await p.goto('file://' + path.resolve(process.env.JU_STANDALONE) + '#concept/C05');
  await p.waitForTimeout(1000);
  const ev = (js, arg) => p.evaluate(([js, arg]) => { const m = window.JUShell.mounts.stage['stage:C05:']; return new Function('root', 'inst', 'arg', js)(m.root, m.instance, arg); }, [js, arg]);
  const sample = async (probeJs, ms, step) => { const t0 = Date.now(); const rows = []; let last = null; while (Date.now() - t0 < ms) { const v = await ev(probeJs); const s = JSON.stringify(v); if (s !== last) { rows.push({ t: Date.now() - t0, v }); last = s; } await p.waitForTimeout(step); } return rows; };
  const res = { errors };
  for (const rm of [true, false]) {
    const tag = rm ? 'rmOn' : 'rmOff';
    // 1) draft delete → undo bar lifetime (left to expire)
    await ev("inst.jumpTo('h-drafts')"); await p.waitForTimeout(700);
    if (!!(await ev('return inst.state.review.rm')) !== rm) await ev('inst.toggleRM()');
    await p.waitForTimeout(200);
    const before = await ev("return root.querySelectorAll('.c05-rowwrap [data-act=\"delete\"]').length");
    await ev("root.querySelector('.c05-rowwrap [data-act=\"delete\"]').click()");
    const undoRows = await sample("var u = root.querySelector('.c05-undo'); return { bar: !!u, text: u ? u.textContent.trim() : '', drafts: root.querySelectorAll('.c05-rowwrap [data-act=\"delete\"]').length, rm: inst.state.review.rm };", 11500, 100);
    res[tag + '_undoExpire'] = { draftsBefore: before, rows: undoRows };
    // 2) draft delete → undo at ~8.5 s restores
    await ev("inst.jumpTo('h-drafts')"); await p.waitForTimeout(700);
    await ev("root.querySelector('.c05-rowwrap [data-act=\"delete\"]').click()");
    const undoRows2 = await sample("var u = root.querySelector('.c05-undo'); return { bar: !!u, drafts: root.querySelectorAll('.c05-rowwrap [data-act=\"delete\"]').length };", 8500, 100);
    await ev("root.querySelector('.c05-undo [data-act=\"undo\"]').click()");
    const after = await sample("var u = root.querySelector('.c05-undo'); return { bar: !!u, drafts: root.querySelectorAll('.c05-rowwrap [data-act=\"delete\"]').length, titles: Array.prototype.map.call(root.querySelectorAll('.c05-rowwrap.draft, .c05-rowwrap'), function(){return 1}).length };", 1500, 100);
    res[tag + '_undoRestore'] = { untilUndo: undoRows2, afterUndo: after };
    // 3) copy wechat (joined contact) → toast + 已复制 label
    await ev("inst.jumpTo('j-d-contact')"); await p.waitForTimeout(900);
    await ev("root.querySelector('.c05-detail [data-act=\"copy\"]').click()");
    const copyRows = await sample("var t = root.querySelector('.c05-bartoast.in') || root.querySelector('.c05-toast.in'); var c = root.querySelector('.c05-detail [data-act=\"copy\"]'); return { toast: t ? t.textContent.trim() : null, copyLabel: c ? c.textContent.trim() : null };", 3400, 100);
    res[tag + '_copy'] = copyRows;
    // 4) 改时间 submit → toast
    await ev("inst.jumpTo('h-m-reschedule')"); await p.waitForTimeout(900);
    await ev("inst.patchView({ rsDate: '2026-12-21', rsTime: '19:30' })"); await p.waitForTimeout(150);
    await ev("root.querySelector('.c05-slip [data-act=\"propose\"]').click()");
    const rsRows = await sample("var t = root.querySelector('.c05-bartoast.in') || root.querySelector('.c05-toast.in'); return { toast: t ? t.textContent.trim() : null, slip: !!root.querySelector('.c05-slip'), tab: inst.state.view.tab };", 3600, 100);
    res[tag + '_reschedule'] = rsRows;
  }
  fs.mkdirSync(path.dirname(out), { recursive: true }); fs.writeFileSync(out, JSON.stringify(res, null, 1));
  console.log(JSON.stringify(res, null, 0).slice(0, 6000));
  await b.close();
})();

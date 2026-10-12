// read-only timing probe for C03 real-time windows (contract §11), reduced motion ON and OFF.
// node timing-probe.cjs <out.json>   (env JU_STANDALONE=<private build>)
const { chromium } = require('/opt/node-tools/node_modules/playwright');
const path = require('path'); const fs = require('fs');
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1000, height: 1000 } });
  const errors = []; p.on('pageerror', e => errors.push(e.message)); p.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  await p.goto('file://' + path.resolve(process.env.JU_STANDALONE) + '#concept/C03'); await p.waitForTimeout(800); await p.evaluate(() => document.fonts.ready);
  const I = (js, arg) => p.evaluate(([js, arg]) => { const m = window.JUShell.mounts.stage['stage:C03:']; const inst = m.instance, root = m.root; return new Function('root', 'inst', 'arg', js)(root, inst, arg); }, [js, arg]);
  const st = () => I(`const t = root.querySelector('.c03-toast'); return { on: !!t && t.classList.contains('on'), op: t ? +getComputedStyle(t).opacity : 0, text: t ? t.textContent.trim() : '', undo: !!(t && t.querySelector('[data-act="undo"]')), drafts: root.querySelectorAll('.c03-pg .c03-row.draft').length, landed: root.querySelectorAll('.c03-pg .landed').length, rm: inst.state.review.rm }`);
  // watch until predicate false (or timeout); returns ms the predicate stayed true from t0
  const watch = async (pred, maxMs, stopAt) => { const t0 = Date.now(); let first = null, last = null, s; while (Date.now() - t0 < maxMs) { s = await st(); const ok = pred(s); const t = Date.now() - t0; if (ok) { if (first == null) first = t; last = t; } else if (first != null) break; if (stopAt && t >= stopAt) break; await p.waitForTimeout(40); } return { appearsAt: first, lastSeenAt: last, end: s }; };
  const res = {};
  for (const rm of [true, false]) {
    const tag = rm ? 'rm_on' : 'rm_off'; const r = res[tag] = {};
    const setRM = async () => { const cur = await I('return inst.state.review.rm'); if (cur !== rm) await I('inst.toggleRM()'); };
    // 1) draft delete → undo bar → undo at 8.8 s
    await I('inst.jumpTo("h-drafts")'); await p.waitForTimeout(500); await setRM(); await p.waitForTimeout(100);
    const n0 = (await st()).drafts;
    await I(`root.querySelector('.c03-pg .c03-row.draft [data-act="delete"]').click()`);
    const w1 = await watch(s => s.on && s.undo, 12000, 8800);
    const at88 = await st();
    await I(`const u = root.querySelector('.c03-toast [data-act="undo"]'); if (u) u.click()`); await p.waitForTimeout(rm ? 200 : 700);
    const afterUndo = await st();
    // landed bookmark on the restored draft: how long it stays
    const wl = await watch(s => s.landed > 0, 4000);
    r.undo = { draftsBefore: n0, undoBarAppearsAtMs: w1.appearsAt, undoBarStillUpAtMs: w1.lastSeenAt, stateAt8800: { on: at88.on, op: at88.op, text: at88.text, drafts: at88.drafts }, afterUndo: { drafts: afterUndo.drafts, toastOn: afterUndo.on }, restoredBookmarkMs: wl.lastSeenAt };
    // 2) draft delete → no undo → commit at 10 s
    await I('inst.jumpTo("h-drafts")'); await p.waitForTimeout(500);
    await I(`root.querySelector('.c03-pg .c03-row.draft [data-act="delete"]').click()`);
    const w2 = await watch(s => s.on && s.undo, 13000);
    r.commit = { undoBarUpMs: w2.lastSeenAt - (w2.appearsAt || 0), barGoneAtMs: w2.lastSeenAt, draftsAfter: w2.end.drafts, engineUndoPending: await I('return !!(inst.state.data.undo || inst.state.data.pendingUndo)') };
    // 3) copy wechat (编辑部 · 联系信息) → toast + 「已复制」
    await I('inst.jumpTo("h-m-contact")'); await p.waitForTimeout(700);
    await I(`root.querySelector('.c03-sp [data-act="copy"]').click()`);
    const t0 = Date.now(); let copiedLast = null, toastFirst = null, toastLast = null, txt = '';
    while (Date.now() - t0 < 4500) { const s = await I(`const t = root.querySelector('.c03-toast'); const c = [...root.querySelectorAll('.c03-sp [data-act="copy"]')].some(e => e.textContent.includes('已复制')); return { on: !!t && t.classList.contains('on'), text: t ? t.textContent.trim() : '', c }`); const t = Date.now() - t0; if (s.on) { if (toastFirst == null) toastFirst = t; toastLast = t; txt = s.text; } if (s.c) copiedLast = t; await p.waitForTimeout(40); }
    r.copy = { toastText: txt, toastAppearsAtMs: toastFirst, toastLastSeenAtMs: toastLast, copiedLabelLastSeenAtMs: copiedLast };
    // 4) 改时间 submit → toast
    await I('inst.jumpTo("h-m-reschedule")'); await p.waitForTimeout(800);
    await I(`inst.patchSheet({ date: '2026-12-20', time: '19:30' })`); await p.waitForTimeout(100);
    await I(`root.querySelector('.c03-slip [data-act="propose"]').click()`);
    const w4 = await watch(s => s.on, 5000);
    r.reschedule = { toastText: w4.end && w4.end.text, toastAppearsAtMs: w4.appearsAt, toastLastSeenAtMs: w4.lastSeenAt };
    // 5) open a card and come back: landing bookmark dwell
    await I('inst.jumpTo("j-home")'); await p.waitForTimeout(500);
    await I(`root.querySelector('.c03-pg .c03-row:not(.draft)').click()`); await p.waitForTimeout(rm ? 300 : 1300);
    await I(`const bk = root.querySelector('[data-act="back"]'); if (bk) bk.click()`);
    const w5 = await watch(s => s.landed > 0, 5000);
    r.returnBookmark = { appearsAtMs: w5.appearsAt, lastSeenAtMs: w5.lastSeenAt };
  }
  res.errors = errors;
  fs.writeFileSync(process.argv[2], JSON.stringify(res, null, 1)); console.log(JSON.stringify(res, null, 1)); await b.close();
})();

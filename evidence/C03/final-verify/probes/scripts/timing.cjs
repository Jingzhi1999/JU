// read-only timing probe (final-verify), RM ON and OFF. node timing.cjs <out.json>
const { chromium } = require('/opt/node-tools/node_modules/playwright'); const fs = require('fs');
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1000, height: 1000 } });
  const errors = []; p.on('pageerror', e => errors.push(e.message)); p.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  await p.goto('file:///home/user/JU/.build/final-C03.html#concept/C03'); await p.waitForTimeout(900); await p.evaluate(() => document.fonts.ready);
  const I = (js) => p.evaluate((js) => { const m = window.JUShell.mounts.stage['stage:C03:']; return new Function('root', 'inst', js)(m.root, m.instance); }, js);
  const st = () => I(`const t = root.querySelector('.c03-toast'); const cs = t && getComputedStyle(t); const r = t && t.getBoundingClientRect(); const ph = root.querySelector('.ju-phone').getBoundingClientRect();
    return { on: !!t && t.classList.contains('on'), op: cs ? +cs.opacity : 0, vis: !!(t && r.width > 0 && r.bottom <= ph.bottom && r.top >= ph.top), text: t ? t.textContent.trim() : '', undo: !!(t && t.querySelector('[data-act="undo"]')),
      drafts: root.querySelectorAll('.c03-pg .c03-row.draft').length, landed: root.querySelectorAll('.landed').length, rm: inst.state.review.rm, undoPending: !!inst.state.data.undo }`);
  const watch = async (pred, maxMs, stopAt) => { const t0 = Date.now(); let first = null, last = null, s, samples = 0; while (Date.now() - t0 < maxMs) { s = await st(); samples++; const ok = pred(s); const t = Date.now() - t0; if (ok) { if (first == null) first = t; last = t; } else if (first != null) break; if (stopAt && t >= stopAt) break; await p.waitForTimeout(30); } return { appearsAt: first, lastSeenAt: last, endAt: Date.now() - t0, end: s, samples }; };
  const res = {};
  for (const rm of [true, false]) {
    const r = res[rm ? 'rm_on' : 'rm_off'] = {};
    const setRM = async () => { if ((await I('return inst.state.review.rm')) !== rm) await I('inst.toggleRM()'); await p.waitForTimeout(80); };
    // 1 delete → undo at ~8.8 s
    await I('inst.jumpTo("h-drafts-many")'); await p.waitForTimeout(600); await setRM();
    const n0 = (await st()).drafts; const title1 = await I(`return root.querySelectorAll('.c03-pg .c03-row.draft')[1].textContent.trim().slice(0, 12)`);
    await I(`root.querySelectorAll('.c03-pg .c03-row.draft [data-act="delete"]')[1].click()`);
    const w1 = await watch(s => s.on && s.op > 0.9 && s.undo, 12000, 8800); const at88 = await st();
    await I(`root.querySelector('.c03-toast [data-act="undo"]').click()`); await p.waitForTimeout(150);
    const afterUndo = await st(); const restoredTitle = await I(`return [...root.querySelectorAll('.c03-pg .c03-row.draft')].map(e => e.textContent.trim().slice(0, 12))`);
    const wl = await watch(s => s.landed > 0, 4000);
    r.undo = { draftsBefore: n0, deleted: title1, undoBarAppearsAtMs: w1.appearsAt, undoBarStillUpAtMs: w1.lastSeenAt, at88: { on: at88.on, op: at88.op, vis: at88.vis, text: at88.text, drafts: at88.drafts }, afterUndo: { drafts: afterUndo.drafts, rows: restoredTitle, toastOn: afterUndo.on, undoPending: afterUndo.undoPending }, restoredBookmarkStillAtMsAfter150: wl.lastSeenAt };
    // 2 delete → commit at 10 s
    await I('inst.jumpTo("h-drafts-many")'); await p.waitForTimeout(600);
    await I(`root.querySelectorAll('.c03-pg .c03-row.draft [data-act="delete"]')[0].click()`);
    const w2 = await watch(s => s.on && s.undo, 13000); await p.waitForTimeout(400); const after2 = await st();
    r.commit = { undoBarAppearsAtMs: w2.appearsAt, undoBarLastSeenAtMs: w2.lastSeenAt, draftsAfter: after2.drafts, undoPendingAfter: after2.undoPending, toastOnAfter: after2.on };
    // 3 copy wx
    await I('inst.jumpTo("h-m-contact")'); await p.waitForTimeout(800);
    await I(`root.querySelector('.c03-sp [data-act="copy"]').click()`);
    { const t0 = Date.now(); let cl = null, tf = null, tl = null, txt = '', minOp = 1; while (Date.now() - t0 < 4200) { const s = await I(`const t = root.querySelector('.c03-toast'); return { on: t.classList.contains('on'), op: +getComputedStyle(t).opacity, text: t.textContent.trim(), c: [...root.querySelectorAll('.c03-sp [data-act="copy"]')].some(e => e.textContent.includes('已复制')) }`); const t = Date.now() - t0; if (s.on && s.op > .9) { if (tf == null) tf = t; tl = t; txt = s.text; } if (s.c) cl = t; await p.waitForTimeout(30); } r.copy = { text: txt, toastAppearsAtMs: tf, toastLastSeenAtMs: tl, copiedLabelLastSeenAtMs: cl }; }
    // 4 改时间 propose
    await I('inst.jumpTo("h-m-reschedule")'); await p.waitForTimeout(900);
    await I(`inst.patchSheet({ date: '2026-12-20', time: '19:30' })`); await p.waitForTimeout(120);
    await I(`root.querySelector('.c03-slip [data-act="propose"]').click()`);
    { const w = await watch(s => s.on && s.op > .9, 5500); r.reschedule = { text: w.end && (w.lastSeenAt ? (await st()).text : ''), appearsAtMs: w.appearsAt, lastSeenAtMs: w.lastSeenAt, durationMs: w.lastSeenAt - w.appearsAt }; }
    // 5 participant accepts reschedule by tearing the new stub (key path)
    await I('inst.jumpTo("j-d-reschedule")'); await p.waitForTimeout(1200);
    const hasStub = await I(`const s = root.querySelector('.c03-sp .c03-side.stub'); if (!s) return false; s.focus(); return true;`);
    if (hasStub) {
      await p.keyboard.press('Enter'); const w = await watch(s => s.on && s.op > .9, 7000); r.acceptResched = { text: w.end ? w.end.text : '', appearsAtMs: w.appearsAt, lastSeenAtMs: w.lastSeenAt, durationMs: w.lastSeenAt - w.appearsAt, toastTextSeen: (await st()).text };
    } else r.acceptResched = { stub: false };
    // 6 return bookmark
    await I('inst.jumpTo("j-home")'); await p.waitForTimeout(600);
    await I(`root.querySelector('.c03-pg .c03-row:not(.draft)').click()`); await p.waitForTimeout(rm ? 300 : 1300);
    await I(`root.querySelector('[data-act="back"]').click()`);
    { const w = await watch(s => s.landed > 0, 5000); r.returnBookmark = { appearsAtMs: w.appearsAt, lastSeenAtMs: w.lastSeenAt }; }
  }
  res.errors = errors; fs.writeFileSync(process.argv[2], JSON.stringify(res, null, 1)); console.log(JSON.stringify(res, null, 1)); await b.close();
})();

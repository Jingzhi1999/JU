// C07 final-verify timing probe (independent reviewer). node rm-probe.cjs <build.html> <out.json>
// Each scenario runs in a fresh page; samples DOM every 50 ms inside the page.
const { chromium } = require('/opt/node-tools/node_modules/playwright');
const fs = require('fs'); const path = require('path');
const build = path.resolve(process.argv[2]); const out = process.argv[3];
const SC = {
  // --- reduced motion ON ---
  undoNoTap: { rm: true, body: `
    I.jumpTo('h-drafts'); await sleep(700);
    const t0 = performance.now(); q('.c07-tile[data-rid="draft-reading"] [data-act=delete]').click();
    const s = await watch(() => !!q('.c07-undo[role=status]'), 12000);
    return { undoBar: s, draftsAfter: I.state.data.drafts.map(d => d.id), engineUndo: I.state.data.undo };` },
  undoTap: { rm: true, body: `
    I.jumpTo('h-drafts'); await sleep(700);
    q('.c07-tile[data-rid="draft-reading"] [data-act=delete]').click(); const t0 = performance.now();
    await sleep(8600); const barAt8600 = !!q('.c07-undo[role=status]'); const txt = barAt8600 ? q('.c07-undo .t').textContent : null;
    q('[data-act=undo]').click(); const t1 = performance.now();
    const back = await waitFor(() => !!q('.c07-tile[data-rid="draft-reading"]'), 3000);
    await sleep(3000);
    return { barAt8600, txt, restoredAfterMs: back, stillThereAt11_6s: !!q('.c07-tile[data-rid="draft-reading"]'), drafts: I.state.data.drafts.map(d => d.id), bar: !!q('.c07-undo[role=status]') };` },
  redelete3: { rm: true, body: redel(3000) }, redelete86: { rm: true, body: redel(8600) },
  toastCopy: { rm: true, body: `
    I.jumpTo('j-d-contact'); await sleep(900);
    q('.c07-over [data-act=copy]').click();
    const s = await watch(() => { const t = q('.c07-toast'); const on = t && t.classList.contains('on') && getComputedStyle(t).opacity > 0.9; return on ? t.textContent : null; }, 4000);
    return s;` },
  toastCopied: { rm: true, body: `
    I.jumpTo('j-d-contact'); await sleep(900);
    q('.c07-over [data-act=copy]').click();
    return await watch(() => { const b = q('.c07-over [data-act=copy]'); return b && b.textContent.trim() === '已复制' ? '已复制' : null; }, 4000);` },
  toastAccept: { rm: true, body: `
    I.jumpTo('j-d-reschedule'); await sleep(900);
    const b = q('.c07-over [data-act=accept]'); if (!b) return 'no accept btn'; b.click(); const t0 = performance.now();
    const s = await watch(() => { const t = q('.c07-toast'); const on = t && t.classList.contains('on') && getComputedStyle(t).opacity > 0.9; return on ? t.textContent : null; }, 4500);
    return Object.assign(s, { freshTorn: I.state.view.passes && I.state.view.passes.fresh && I.state.view.passes.fresh.torn, mainLeft: !!(I.state.view.passes && I.state.view.passes.main) });` },
  toastPropose: { rm: true, body: `
    I.jumpTo('h-m-reschedule'); await sleep(1200);
    I.patchSheet({ time: '21:15' }); await sleep(200);
    const b = q('.c07-sheet .c07-sheet-f .c07-btn.big'); if (!b) return 'no btn'; b.click();
    const s = await watch(() => { const t = q('.c07-toast'); const on = t && t.classList.contains('on') && getComputedStyle(t).opacity > 0.9; return on ? t.textContent : null; }, 4500);
    return s;` },
  print: { rm: true, body: `
    I.jumpTo('j-home'); await sleep(900);
    q('.c07-tile[data-rid="run3k"] .c07-open').click(); const t0 = performance.now();
    const ready = await waitFor(() => { const p = I.state.view.passes && I.state.view.passes.main; return p && p.phase === 'ready' && I.state.view.phase === 'in' && !!q('.c07-over [data-act=tear]'); }, 4000);
    await sleep(300);
    return { readyAfterMs: ready, phase: I.state.view.passes.main.phase, tearBtn: q('.c07-over [data-act=tear]') && q('.c07-over [data-act=tear]').textContent, scanVisible: (() => { const s = q('.c07-over .c07-pass .scan'); return s ? getComputedStyle(s).display : 'none-el'; })() };` },
  tear: { rm: true, body: `
    I.jumpTo('j-d-tear'); await sleep(900);
    q('.c07-over [data-act=tear]').click(); const t0 = performance.now();
    const torn = await waitFor(() => { const p = I.state.view.passes.main; return p.torn && I.state.view.contact; }, 4000);
    await sleep(200);
    return { tornAndContactAfterMs: torn, ticketTorn: JU.derive.rowById(I.state.data, 'run3k').ticket.torn, stage: JU.derive.rowById(I.state.data, 'run3k').stage, copyBtn: !!q('.c07-over [data-act=copy]') };` },
  cancel: { rm: true, body: `
    I.jumpTo('h-m-cancel'); await sleep(1200);
    q('.c07-sheet .c07-sheet-f .c07-btn.big').click(); const t0 = performance.now();
    const dropped = await waitFor(() => I.state.view.voidPhase === 'dropped' && !I.state.sheet, 5000);
    await sleep(300);
    const ev = I.state.data.events ? (Array.isArray(I.state.data.events) ? I.state.data.events.find(e => e.id === 'cards') : I.state.data.events.cards) : null;
    return { droppedAfterMs: dropped, status: ev && ev.status, cardText: (q('#c07-man-card') || {}).innerText };` },
  recopy: { rm: true, body: `
    I.jumpTo('j-d-contact'); await sleep(900);
    q('.c07-over [data-act=copy]').click(); await sleep(2000);
    q('.c07-over [data-act=copy]').click();
    const toast = watch(() => { const t = q('.c07-toast'); return t && t.classList.contains('on') && getComputedStyle(t).opacity > 0.9 ? t.textContent : null; }, 3500);
    const btn = watch(() => { const b = q('.c07-over [data-act=copy]'); return b && b.textContent.trim() === '已复制' ? '已复制' : null; }, 3500);
    return { secondToast: await toast, secondCopied: await btn };` },
  // --- reduced motion OFF ---
  undoNoTapOff: { rm: false, body: `
    I.jumpTo('h-drafts'); await sleep(700);
    q('.c07-tile[data-rid="draft-reading"] [data-act=delete]').click();
    const s = await watch(() => !!q('.c07-undo[role=status]'), 12500);
    return { undoBar: s, draftsAfter: I.state.data.drafts.map(d => d.id) };` },
  redelete3Off: { rm: false, body: redel(3000) }, redelete86Off: { rm: false, body: redel(8600) },
};
function redel(at) { return `
    I.jumpTo('h-drafts'); await sleep(700);
    q('.c07-tile[data-rid="draft-reading"] [data-act=delete]').click(); const t0 = performance.now();
    await waitFor(() => !!q('.c07-undo[role=status]'), 2000);
    await sleep(${at} - (performance.now() - t0)); q('[data-act=undo]').click();
    await waitFor(() => !!q('.c07-tile[data-rid="draft-reading"] [data-act=delete]'), 3000); await sleep(200);
    const t2 = performance.now(); q('.c07-tile[data-rid="draft-reading"] [data-act=delete]').click();
    const s = await watch(() => !!q('.c07-undo[role=status]'), 13000);
    return { firstUndoAt: ${at}, secondDeleteAtMs: Math.round(t2 - t0), secondBar: s, secondBarGoneAtSinceFirstDelete: s.last != null ? Math.round(t2 - t0 + s.last) : null, draftsAfter: I.state.data.drafts.map(d => d.id) };`; }
(async () => {
  const only = process.argv[4] ? process.argv[4].split(',') : Object.keys(SC);
  const res = {}; const b = await chromium.launch();
  for (const k of only) {
    const p = await b.newPage({ viewport: { width: 1000, height: 1000 } });
    const errors = []; p.on('pageerror', e => errors.push(e.message)); p.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
    await p.goto('file://' + build + '#concept/C07'); await p.waitForTimeout(600); await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(400);
    const r = await p.evaluate(async ([body, rm]) => {
      const m = window.JUShell.mounts.stage['stage:C07:']; const R = m.root, I = m.instance;
      if (!!I.state.review.rm !== rm) I.toggleRM(); await new Promise(r => setTimeout(r, 150));
      const sleep = ms => new Promise(r => setTimeout(r, Math.max(0, ms))); const q = s => R.querySelector(s);
      const waitFor = async (f, max) => { const t = performance.now(); while (performance.now() - t < max) { if (f()) return Math.round(performance.now() - t); await sleep(10); } return null; };
      // watch: first / last time f() is truthy within max ms (50 ms polling); values seen
      const watch = async (f, max) => { const t = performance.now(); let first = null, last = null; const vals = new Set(); while (performance.now() - t < max) { const v = f(); const now = Math.round(performance.now() - t); if (v) { if (first == null) first = now; last = now; if (typeof v === 'string') vals.add(v); } await sleep(50); } return { first, last, span: first != null ? last - first : 0, vals: Array.from(vals) }; };
      const fn = new Function('R', 'I', 'sleep', 'q', 'waitFor', 'watch', 'return (async () => {' + body + '})()');
      return await fn(R, I, sleep, q, waitFor, watch);
    }, [SC[k].body, SC[k].rm]);
    res[k] = { rm: SC[k].rm, result: r, errors }; console.error(k, JSON.stringify(res[k]));
    await p.close();
  }
  fs.writeFileSync(out, JSON.stringify(res, null, 1)); await b.close();
})();

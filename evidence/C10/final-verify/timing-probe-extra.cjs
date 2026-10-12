// DOM timing probe (no screenshots) for C10 under reduced motion ON at 1x.
const { chromium } = require('/opt/node-tools/node_modules/playwright');
const fs = require('fs');
const OUT = process.argv[2];
const SRC = 'file:///home/user/JU/.build/final-C10.html#concept/C10';
(async () => {
  const b = await chromium.launch();
  const results = {};
  async function page() {
    const p = await b.newPage({ viewport: { width: 1000, height: 1000 } });
    const errors = []; p.on('pageerror', e => errors.push(e.message)); p.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
    await p.goto(SRC); await p.waitForTimeout(800); await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(300);
    await p.evaluate(() => {
      window.__R = () => document.querySelector('.stage-host[data-code="C10"]').shadowRoot;
      window.__I = () => window.JUShell.mounts.stage['stage:C10:'].instance;
      window.__vis = (el) => { if (!el) return false; const R = __R(); const ph = R.querySelector('.ju-phone').getBoundingClientRect(); const r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return false; if (r.bottom < ph.top || r.top > ph.bottom || r.right < ph.left || r.left > ph.right) return false; let e = el; while (e && e.nodeType === 1) { const cs = getComputedStyle(e); if (cs.display === 'none' || cs.visibility === 'hidden' || +cs.opacity < 0.05) return false; e = e.parentElement || (e.getRootNode && e.getRootNode().host); if (e && e.classList && e.classList.contains('stage-host')) break; } return true; };
      window.__start = (fn) => { window.__log = []; const t0 = performance.now(); window.__t0 = t0; window.__iv = setInterval(() => { try { window.__log.push(Object.assign({ t: Math.round(performance.now() - t0) }, fn())); } catch (e) { window.__log.push({ t: Math.round(performance.now() - t0), err: String(e) }); } }, 50); };
      window.__stop = () => { clearInterval(window.__iv); return window.__log; };
      window.__now = () => Math.round(performance.now() - window.__t0);
    });
    return { p, errors };
  }
  const rmOn = async (p) => { await p.evaluate(() => { __I().setReview({ rm: true }); }); await p.waitForTimeout(200); };
  // runs of contiguous truthy values for key
  const runs = (log, key) => { const out = []; let cur = null; for (const s of log) { if (s[key]) { if (!cur) cur = { from: s.t, to: s.t }; else cur.to = s.t; } else if (cur) { out.push(cur); cur = null; } } if (cur) out.push(cur); return out; };
  const firstT = (log, pred) => { const s = log.find(pred); return s ? s.t : null; };


  // A. attendance amber trail (RM on)
  { const { p, errors } = await page(); await p.evaluate(() => __I().jumpTo('h-m-attendance')); await p.waitForTimeout(1500); await rmOn(p);
    const pre = await p.evaluate(() => { const R = __R(); return { absentBtns: R.querySelectorAll('.pane.mg [data-act=attend-absent]').length, edit: [...R.querySelectorAll('.pane.mg button')].filter(b => /更正/.test(b.textContent)).length }; });
    // open 更正 on a recorded member if present, else record the first unrecorded one
    await p.evaluate(() => { const R = __R(); const ed = [...R.querySelectorAll('.pane.mg button')].find(b => /更正/.test(b.textContent)); if (ed) ed.click(); });
    await p.waitForTimeout(200);
    const choose = await p.evaluate(() => { const R = __R(); return [...R.querySelectorAll('.pane.mg .seg3')].map(s => s.closest('[class]').textContent.slice(0, 30)); });
    await p.evaluate(() => { __start(() => { const I = __I(), R = __R(); const f = R.querySelector('.pane.mg .trail div.fresh'); return { attFresh: I.state.attFresh || '', freshVis: __vis(f) ? f.textContent.trim() : '', freshColor: f ? getComputedStyle(f).color : '' }; }); const R = __R(); const seg = R.querySelector('.pane.mg .seg3'); const b = seg && (seg.querySelector('[data-act=attend-absent]:not(.on)') || seg.querySelector('[data-act=attend-present]')); b.click(); });
    await p.waitForTimeout(3500); const log = await p.evaluate(() => __stop());
    results.rm_attend = { pre, choose, attFreshRuns: runs(log, 'attFresh'), freshVisRuns: runs(log, 'freshVis'), freshText: (log.find(s => s.freshVis) || {}).freshVis, freshColor: (log.find(s => s.freshVis) || {}).freshColor, endColor: log[log.length - 1].freshColor, errors };
    await p.close(); }
  // B. loupe dwell after approve (RM on)
  { const { p, errors } = await page(); await p.evaluate(() => __I().jumpTo('h-m-review')); await p.waitForTimeout(1500); await rmOn(p);
    await p.evaluate(() => { __start(() => { const I = __I(); const mg = I.state.manage; return { focus: mg ? String(mg.focus) : '', fresh: mg ? String(mg.fresh) : '' }; }); __R().querySelector('.pane.mg [data-act=approve]').click(); });
    await p.waitForTimeout(2500); const log = await p.evaluate(() => __stop());
    const segs = []; let last = null; for (const s of log) { if (s.focus !== last) { segs.push({ t: s.t, focus: s.focus, fresh: s.fresh }); last = s.focus; } }
    results.rm_loupe = { focusChanges: segs, errors };
    await p.close(); }
  // C. RM off 1x: undo commit + copy toast (regression timing)
  { const { p, errors } = await page(); await p.evaluate(() => __I().jumpTo('h-drafts')); await p.waitForTimeout(800);
    await p.evaluate(() => { __start(() => { const R = __R(), u = R.querySelector('.undo'); return { bar: __vis(u), dels: R.querySelectorAll('.del').length }; }); __R().querySelector('.del').click(); });
    await p.waitForTimeout(11500); const log = await p.evaluate(() => __stop());
    results.off_undo_commit = { barRuns: runs(log, 'bar'), endDels: log[log.length - 1].dels, errors };
    await p.close(); }
  { const { p, errors } = await page(); await p.evaluate(() => __I().jumpTo('j-d-contact')); await p.waitForTimeout(1200);
    await p.evaluate(() => { __start(() => { const R = __R(), t = R.querySelector('.toast'); const cp = R.querySelector('.pane.dt [data-act=copy]'); return { toast: t && t.classList.contains('on') && __vis(t) ? t.textContent.trim() : '', c: cp && cp.textContent.trim() === '已复制' }; }); __R().querySelector('.pane.dt [data-act=copy]').click(); });
    await p.waitForTimeout(3500); const log = await p.evaluate(() => __stop());
    results.off_copy = { toastRuns: runs(log, 'toast'), copiedRuns: runs(log, 'c'), errors };
    await p.close(); }
  // D. RM on + 0.5x: undo window doubles (contract 11)
  { const { p, errors } = await page(); await p.evaluate(() => __I().jumpTo('h-drafts')); await p.waitForTimeout(800); await rmOn(p); await p.evaluate(() => __I().setSpeed(0.5)); await p.waitForTimeout(100);
    await p.evaluate(() => { __start(() => { const R = __R(), u = R.querySelector('.undo'); return { bar: __vis(u) }; }); __R().querySelector('.del').click(); });
    await p.waitForTimeout(21000); const log = await p.evaluate(() => __stop());
    results.rm_half_undo = { barRuns: runs(log, 'bar'), errors };
    await p.close(); }
  fs.writeFileSync(OUT, JSON.stringify(results, null, 1));
  console.log(JSON.stringify(results, null, 1));
  await b.close();
})();

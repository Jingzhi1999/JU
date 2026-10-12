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

  // 1. drafts: delete, no undo -> commit
  { const { p, errors } = await page(); await p.evaluate(() => __I().jumpTo('h-drafts')); await p.waitForTimeout(800); await rmOn(p);
    const rmClass = await p.evaluate(() => !!__R().querySelector('.rm'));
    await p.evaluate(() => { __start(() => { const R = __R(), u = R.querySelector('.undo'); return { bar: __vis(u), undoBtn: __vis(R.querySelector('.undo [data-act=undo]')), barText: u ? u.textContent.trim() : '', dels: R.querySelectorAll('.del').length, stUndo: !!__I().state.undo, empty: !!R.querySelector('.roll.h .emp') && __vis(R.querySelector('.roll.h .emp')) }; }); __R().querySelector('.del').click(); });
    await p.waitForTimeout(11500); const log = await p.evaluate(() => __stop());
    results.rm_undo_commit = { rmClass, barRuns: runs(log, 'bar'), undoBtnRuns: runs(log, 'undoBtn'), stUndoRuns: runs(log, 'stUndo'), delsAt: { t200: (log.find(s => s.t >= 200) || {}).dels, end: log[log.length - 1].dels }, emptyFirst: firstT(log, s => s.empty), barText: (log.find(s => s.bar) || {}).barText, errors };
    await p.close(); }
  // 2. drafts: delete, undo at 8.5 s
  { const { p, errors } = await page(); await p.evaluate(() => __I().jumpTo('h-drafts')); await p.waitForTimeout(800); await rmOn(p);
    await p.evaluate(() => { __start(() => { const R = __R(), u = R.querySelector('.undo'); const cell = [...R.querySelectorAll('.roll.h .cell')].find(c => /雨天读书局/.test(c.textContent)); return { bar: __vis(u), undoBtn: __vis(R.querySelector('.undo [data-act=undo]')), dels: R.querySelectorAll('.del').length, draftVis: __vis(cell), stUndo: !!__I().state.undo, drafts: __I().state.data && JSON.stringify(Object.keys(__I().state.data)).length }; }); __R().querySelector('.del').click(); });
    await p.waitForTimeout(8500);
    const at = await p.evaluate(() => { const R = __R(); const ok = __vis(R.querySelector('.undo [data-act=undo]')); const t = __now(); R.querySelector('.undo [data-act=undo]').click(); return { t, barVisibleAtClick: ok }; });
    await p.waitForTimeout(4000); const log = await p.evaluate(() => __stop());
    const after = log.filter(s => s.t > at.t);
    results.rm_undo_85 = { clickedAt: at, barRuns: runs(log, 'bar'), draftVisRuns: runs(log, 'draftVis'), restoredAt: firstT(after, s => s.draftVis && s.dels === 1), endState: log[log.length - 1], errors };
    await p.close(); }
  // 3. copy wechat toast
  { const { p, errors } = await page(); await p.evaluate(() => __I().jumpTo('j-d-contact')); await p.waitForTimeout(1200); await rmOn(p);
    await p.evaluate(() => { __start(() => { const R = __R(), t = R.querySelector('.toast'); const cp = R.querySelector('.pane.dt [data-act=copy]'); return { toast: t && t.classList.contains('on') && __vis(t) ? t.textContent.trim() : '', copied: cp ? cp.textContent.trim() : '' }; }); __R().querySelector('.pane.dt [data-act=copy]').click(); });
    await p.waitForTimeout(3500); const log = await p.evaluate(() => __stop());
    results.rm_copy = { toastRuns: runs(log, 'toast'), toastText: (log.find(s => s.toast) || {}).toast, copiedRuns: runs(log.map(s => Object.assign({}, s, { c: s.copied === '已复制' })), 'c'), errors };
    await p.close(); }
  // 4. reschedule submit toast + struck old time
  { const { p, errors } = await page(); await p.evaluate(() => __I().jumpTo('h-m-reschedule')); await p.waitForTimeout(1500); await rmOn(p);
    const pre = await p.evaluate(() => { const I = __I(); return JSON.stringify(I.state.resched); });
    await p.evaluate(() => __I().setState({ resched: { date: '2026-12-24', time: '20:00' } })); await p.waitForTimeout(150);
    const en = await p.evaluate(() => { const b = __R().querySelector('.sheet [data-act=propose]'); return b ? { dis: b.disabled, txt: b.textContent } : null; });
    await p.evaluate(() => { __start(() => { const R = __R(), t = R.querySelector('.toast'); const old = R.querySelector('.hface .tm.strike.old'); const sh = R.querySelector('.sheet'); return { toast: t && t.classList.contains('on') && __vis(t) ? t.textContent.trim() : '', strike: __vis(old) ? old.textContent.trim() : '', sheet: !!sh && __vis(sh), hero: (R.querySelector('.hface .tm:not(.old)') || {}).textContent }; }); __R().querySelector('.sheet [data-act=propose]').click(); });
    await p.waitForTimeout(4000); const log = await p.evaluate(() => __stop());
    results.rm_resched = { pre, button: en, toastRuns: runs(log, 'toast'), toastText: (log.find(s => s.toast) || {}).toast, strikeRuns: runs(log, 'strike'), strikeText: (log.find(s => s.strike) || {}).strike, sheetGoneAt: firstT(log, s => !s.sheet), hero: log[log.length - 1].hero, errors };
    await p.close(); }
  // 5. print (develop) from home, then tear by drag, then accept-reschedule toast
  { const { p, errors } = await page(); await p.evaluate(() => __I().jumpTo('j-home')); await p.waitForTimeout(800); await rmOn(p);
    await p.evaluate(() => { __start(() => { const I = __I(), R = __R(); const d = I.state.detail; const pimg = R.querySelector('.pane.dt .tk.melt .pimg'); const ttl = R.querySelector('.pane.dt .tk.melt .pimg .ttl'); const neg = R.querySelector('.pane.dt .negwrap'); return { open: !!d, printed: !!(d && d.printed), dev: !!I.state.fx.dev, pimgVis: __vis(pimg), ttlVis: __vis(ttl), negVis: __vis(neg), phase: d ? d.phase : '' }; }); const c = __R().querySelector('.cell[data-rid=run3k] .fr'); c.scrollIntoView({ block: 'nearest' }); c.click(); });
    await p.waitForTimeout(3000); const log = await p.evaluate(() => __stop());
    results.rm_print = { printedAt: firstT(log, s => s.printed), devRuns: runs(log, 'dev'), ttlVisAt: firstT(log, s => s.ttlVis), negVisAt: firstT(log, s => s.negVis), phaseInAt: firstT(log, s => s.phase === 'in'), errors: errors.slice() };
    // tear
    const r = await p.evaluate(() => { const n = __R().querySelector('.pane.dt .negwrap'); const b = n.getBoundingClientRect(); return { x: b.left + 20, y: b.top + b.height / 2, w: b.width }; });
    await p.evaluate(() => { __start(() => { const I = __I(), R = __R(); const ct = R.querySelector('.pane.dt .contact'); const sl = R.querySelector('.pane.dt .sleeve .cnt'); return { cutOff: !!I.state.fx.cutOff, torn: !!I.state.fx.torn, stubs: I.state.stubs, contactVis: __vis(ct), sleeve: sl ? sl.textContent.trim() : '', status: (R.querySelector('.pane.dt .stt') || {}).textContent, toast: (() => { const t = R.querySelector('.toast'); return t && t.classList.contains('on') ? t.textContent.trim() : ''; })() }; }); });
    await p.mouse.move(r.x, r.y); await p.mouse.down(); for (let i = 1; i <= 8; i++) { await p.mouse.move(r.x + 260 * i / 8, r.y, { steps: 2 }); await p.waitForTimeout(30); }
    const upT = await p.evaluate(() => __now()); await p.mouse.up();
    await p.waitForTimeout(2500); const log2 = await p.evaluate(() => __stop());
    const a2 = log2.filter(s => s.t >= upT);
    results.rm_tear = { upAt: upT, cutOffAt: firstT(a2, s => s.cutOff), tornAt: firstT(a2, s => s.torn), stubs1At: firstT(a2, s => s.stubs >= 1), contactVisAt: firstT(a2, s => s.contactVis), end: log2[log2.length - 1], errors };
    await p.close(); }
  // 6. accept reschedule by button: toast
  { const { p, errors } = await page(); await p.evaluate(() => __I().jumpTo('j-d-reschedule')); await p.waitForTimeout(1500); await rmOn(p);
    const btn = await p.evaluate(() => { const b = __R().querySelector('.pane.dt [data-act=accept]'); return b ? { dis: b.disabled, t: b.textContent.trim() } : null; });
    await p.evaluate(() => { __start(() => { const R = __R(), t = R.querySelector('.toast'); return { toast: t && t.classList.contains('on') && __vis(t) ? t.textContent.trim() : '', torn: !!__I().state.fx.torn, contactVis: __vis(R.querySelector('.pane.dt .contact')) }; }); const b = __R().querySelector('.pane.dt [data-act=accept]'); if (b) b.click(); });
    await p.waitForTimeout(4000); const log = await p.evaluate(() => __stop());
    results.rm_accept = { btn, toastRuns: runs(log, 'toast'), toastText: (log.find(s => s.toast) || {}).toast, tornAt: firstT(log, s => s.torn), contactVisAt: firstT(log, s => s.contactVis), errors };
    await p.close(); }
  // 7. cancel destruction (host)
  { const { p, errors } = await page(); await p.evaluate(() => __I().jumpTo('h-m-cancel')); await p.waitForTimeout(1500); await rmOn(p);
    const btn = await p.evaluate(() => { const b = __R().querySelector('.sheet [data-act=cancel]'); return b ? { dis: b.disabled, t: b.textContent.trim() } : null; });
    await p.evaluate(() => { __start(() => { const I = __I(), R = __R(); const mg = I.state.manage; const st = R.querySelector('.pane.mg .hstat, .pane.mg .stt, .pane.mg .mstat'); return { cstage: mg ? mg.cstage : '', settled: !!(mg && mg.settled), sheet: __vis(R.querySelector('.sheet')), busy: I.state.busy, status: [...R.querySelectorAll('.pane.mg *')].filter(e => e.children.length === 0 && /已取消/.test(e.textContent) && __vis(e)).map(e => e.textContent.trim()).slice(0, 3).join(' | '), recruit: [...R.querySelectorAll('.pane.mg *')].filter(e => e.children.length === 0 && /招募中/.test(e.textContent) && __vis(e)).length }; }); __R().querySelector('.sheet [data-act=cancel]').click(); });
    await p.waitForTimeout(3500); const log = await p.evaluate(() => __stop());
    results.rm_cancel = { btn, busyRuns: runs(log, 'busy'), sheetGoneAt: firstT(log, s => !s.sheet), cstages: [...new Set(log.map(s => s.cstage))], voidAt: firstT(log, s => s.cstage === 'void'), statusAt: firstT(log, s => s.status), statusText: (log.find(s => s.status) || {}).status, recruitEnd: log[log.length - 1].recruit, errors };
    await p.close(); }
  fs.writeFileSync(OUT, JSON.stringify(results, null, 1));
  console.log(JSON.stringify(results, null, 1));
  await b.close();
})();

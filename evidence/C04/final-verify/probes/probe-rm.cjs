// final-verify (independent): reduced-motion real-time windows + immediate results; RM-off undo/toast regression.
// node probe-rm.cjs <out.json>  — env JU_STANDALONE
const { chromium } = require('/opt/node-tools/node_modules/playwright');
const fs = require('fs'); const path = require('path');
const OUT = process.argv[2];
const R = `document.querySelector('.stage-host[data-code="C04"]').shadowRoot`; const INST = `window.JUShell.mounts.stage['stage:C04:'].instance`;
const SAMPLER = `(() => { const R = ${R}; const inst = ${INST}; const txt = e => e ? e.textContent.trim().replace(/\\s+/g, ' ') : null;
  window.__t0 = performance.now(); window.__log = []; let last = '';
  const tick = () => { const s = inst.state; const u = R.querySelector('.undo'); const t = R.querySelector('.toast'); const cp = R.querySelector('.cp.ok, .cp.done, .cp.copied');
    const cps = [...R.querySelectorAll('[data-act="copy"]')].map(txt).join('|');
    const sig = JSON.stringify({ undo: u ? txt(u) + ' op=' + getComputedStyle(u).opacity : null, toast: t ? txt(t) + ' op=' + getComputedStyle(t).opacity : null, copied: s.copied || '', cps, drafts: (s.data && s.data.drafts ? s.data.drafts.length : null), busy: s.busy || '' });
    if (sig !== last) { last = sig; window.__log.push(Object.assign({ t: Math.round(performance.now() - window.__t0) }, JSON.parse(sig))); }
    window.__raf = requestAnimationFrame(tick); }; tick(); })()`;
(async () => {
  const b = await chromium.launch(); const results = {};
  const fresh = async (rm) => { const p = await b.newPage({ viewport: { width: 1000, height: 1000 } }); const errors = [];
    p.on('pageerror', e => errors.push(e.message)); p.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
    await p.goto('file://' + path.resolve(process.env.JU_STANDALONE) + '#concept/C04'); await p.waitForTimeout(800);
    const I = (js) => p.evaluate(js); if (rm) await I(`${INST}.toggleRM()`); return { p, errors, I }; };
  const span = (log, key) => { const on = log.find(r => r[key]); const off = on && log.find(r => r.t > on.t && !r[key]); return on ? { on: on.t, off: off ? off.t : null, ms: off ? off.t - on.t : null, text: on[key] } : null; };
  // drafts: count + undo window; then undo restores (and order)
  for (const rm of [true, false]) {
    const { p, errors, I } = await fresh(rm); await I(`${INST}.jumpTo('h-drafts')`); await p.waitForTimeout(900);
    const before = await I(`JSON.stringify(${INST}.state.data.drafts.map(d=>d.id||d.title))`);
    await I(SAMPLER); await I(`${R}.querySelector('[data-act="delete"]').click()`); await p.waitForTimeout(11500);
    const log = await I('window.__log'); const w = span(log, 'undo'); const afterCommit = await I(`JSON.stringify(${INST}.state.data.drafts.map(d=>d.id||d.title))`);
    // second run: undo at 8.5 s
    await I(`${INST}.jumpTo('h-drafts')`); await p.waitForTimeout(900); await I(`cancelAnimationFrame(window.__raf)`); await I(SAMPLER);
    await I(`${R}.querySelector('[data-act="delete"]').click()`); await p.waitForTimeout(8500);
    const stillAt85 = await I(`!!${R}.querySelector('.undo [data-act="undo"]')`);
    await I(`${R}.querySelector('.undo [data-act="undo"]').click()`); await p.waitForTimeout(rm ? 300 : 1200);
    const restored = await I(`JSON.stringify(${INST}.state.data.drafts.map(d=>d.id||d.title))`);
    const domRows = await I(`[...${R}.querySelectorAll('[data-act="delete"]')].length`);
    await p.waitForTimeout(2500); const stillRestored = await I(`JSON.stringify(${INST}.state.data.drafts.map(d=>d.id||d.title))`);
    results['drafts_' + (rm ? 'rm' : '1x')] = { errors, before, undoWindow: w, afterCommit, undoBarAt8500: stillAt85, restored, restoredEqualsBefore: restored === before, stillRestoredAfter2500: stillRestored === before, deleteButtonsInDom: domRows, firstLog: log.slice(0, 6) };
    await p.close();
  }
  // copy toast + 已复制 label
  for (const rm of [true, false]) {
    const { p, errors, I } = await fresh(rm); await I(`${INST}.jumpTo('j-d-contact')`); await p.waitForTimeout(1200);
    await I(SAMPLER); await I(`${R}.querySelector('.pane [data-act="copy"]').click()`); await p.waitForTimeout(3600);
    const log = await I('window.__log'); results['copy_' + (rm ? 'rm' : '1x')] = { errors, toast: span(log, 'toast'), copied: span(log, 'copied'), log }; await p.close();
  }
  // reschedule submit toast (host)
  for (const rm of [true, false]) {
    const { p, errors, I } = await fresh(rm); await I(`${INST}.jumpTo('h-m-reschedule')`); await p.waitForTimeout(1200);
    await I(`${INST}.setState({ resched: { date: '2026-12-24', time: '19:30', touched: true } })`); await p.waitForTimeout(200);
    await I(SAMPLER); await I(`${R}.querySelector('.sheet [data-act="propose"]').click()`); await p.waitForTimeout(rm ? 3800 : 5000);
    const log = await I('window.__log'); results['resched_toast_' + (rm ? 'rm' : '1x')] = { errors, toast: span(log, 'toast'), log }; await p.close();
  }
  fs.writeFileSync(OUT, JSON.stringify(results, null, 1));
  const brief = {}; for (const k in results) { brief[k] = Object.assign({}, results[k]); delete brief[k].log; }
  console.log(JSON.stringify(brief, null, 1)); await b.close();
})();

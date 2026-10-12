// C01 final-verify: delete → 撤销 → delete the SAME draft again. Does the second undo window still last 10 s?
// usage: JU_STANDALONE=<build> node redelete-probe.cjs <out.json>
const { chromium } = require('/opt/node-tools/node_modules/playwright');
const path = require('path'); const fs = require('fs');
const file = path.resolve(process.env.JU_STANDALONE); const out = process.argv[2];
(async () => {
  const b = await chromium.launch(); const res = [];
  for (const rm of [true, false]) for (const undoAt of [3000, 8600]) {
    const p = await b.newPage({ viewport: { width: 1000, height: 1000 } }); const errors = [];
    p.on('pageerror', e => errors.push(e.message)); p.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
    await p.goto('file://' + file + '#concept/C01'); await p.waitForTimeout(1200);
    const r = await p.evaluate(async ([rm, undoAt]) => {
      const sleep = ms => new Promise(r => setTimeout(r, ms));
      const m = window.JUShell.mounts.stage['stage:C01:']; const inst = m.instance; const root = m.root;
      const vis = sel => [...root.querySelectorAll(sel)].some(x => x.getClientRects().length > 0);
      const titles = () => [...root.querySelectorAll('.c01-feed .c01-row[data-rid] h3')].map(h => h.textContent.trim());
      if (rm) inst.toggleRM(); await sleep(200);
      inst.jumpTo('h-drafts'); await sleep(rm ? 500 : 1800);
      const o = { rm, undoAt, before: titles() };
      root.querySelector('.c01-feed [data-act="delete"]').click(); const t0 = performance.now();
      while (performance.now() - t0 < undoAt) await sleep(20);
      root.querySelector('[data-act="undo"]').click(); await sleep(rm ? 200 : 700);
      o.afterUndo = titles();
      root.querySelector('.c01-feed [data-act="delete"]').click(); const t1 = performance.now(); o.secondDeleteAtMs = Math.round(t1 - t0);
      let seen = null, gone = null;
      while (performance.now() - t1 < 12000) { const v = vis('[data-act="undo"]'); const el = performance.now() - t1; if (v && seen == null) seen = el; if (!v && seen != null && gone == null) { gone = el; break; } await sleep(25); }
      o.secondUndoBarUpMs = seen != null && gone != null ? Math.round(gone - seen) : null; o.secondBarGoneAtMs = gone == null ? null : Math.round(gone);
      o.barGoneAtSinceFirstDeleteMs = gone == null ? null : Math.round(t1 - t0 + gone);
      o.pendingUndoAfterBarGone = !!inst.state.undo;
      o.draftsInDataAfter = JSON.stringify(inst.state.data.drafts).slice(0, 200);
      o.titlesAfter = titles();
      return o;
    }, [rm, undoAt]);
    r.errors = errors; res.push(r); await p.close();
  }
  fs.writeFileSync(out, JSON.stringify(res, null, 1)); console.log(JSON.stringify(res, null, 1)); await b.close();
})();

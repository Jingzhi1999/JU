// C01 hold() timing probe: under reduced motion ON and OFF, measure how long the draft undo bar and the copy toast stay up.
const { chromium } = require('/opt/node-tools/node_modules/playwright');
const path = require('path'); const fs = require('fs');
const file = path.resolve(process.env.JU_STANDALONE); const out = process.argv[2];
(async () => {
  const b = await chromium.launch(); const res = {};
  for (const rm of [true, false]) {
    const p = await b.newPage({ viewport: { width: 1000, height: 1000 } }); const errors = [];
    p.on('pageerror', e => errors.push(e.message)); p.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
    await p.goto('file://' + file + '#concept/C01'); await p.waitForTimeout(1200);
    const r = await p.evaluate(async (rm) => {
      const sleep = ms => new Promise(r => setTimeout(r, ms));
      const m = window.JUShell.mounts.stage['stage:C01:']; const inst = m.instance; const root = m.root;
      const vis = sel => [...root.querySelectorAll(sel)].some(x => x.getClientRects().length > 0);
      const o = { rm };
      if (rm) inst.toggleRM(); await sleep(200);
      o.rmState = !!inst.state.review.rm;
      // undo window
      inst.jumpTo('h-drafts'); await sleep(rm ? 400 : 1600);
      const nBefore = inst.state.data.hostedDrafts ? inst.state.data.hostedDrafts.length : null;
      root.querySelector('.c01-feed [data-act="delete"]').click(); const t0 = performance.now();
      let seen = null, gone = null;
      while (performance.now() - t0 < 13000) { const v = vis('[data-act="undo"]'); if (v && seen == null) seen = performance.now() - t0; if (!v && seen != null && gone == null) { gone = performance.now() - t0; break; } await sleep(50); }
      o.undoAppearedMs = Math.round(seen); o.undoGoneMs = gone == null ? null : Math.round(gone); o.undoUpMs = gone == null ? null : Math.round(gone - seen);
      // undo restores (second run: delete then undo at 8.5 s)
      inst.jumpTo('h-drafts'); await sleep(rm ? 400 : 1600);
      const titlesBefore = [...root.querySelectorAll('.c01-feed .c01-row[data-rid] h3')].map(h => h.textContent.trim());
      root.querySelector('.c01-feed [data-act="delete"]').click(); const t1 = performance.now();
      await sleep(8500); o.undoVisibleAt8500 = vis('[data-act="undo"]');
      root.querySelector('[data-act="undo"]').click(); await sleep(rm ? 300 : 1200);
      const titlesAfter = [...root.querySelectorAll('.c01-feed .c01-row[data-rid] h3')].map(h => h.textContent.trim());
      o.undoClickedAtMs = Math.round(performance.now() - t1); o.restored = JSON.stringify(titlesBefore) === JSON.stringify(titlesAfter); o.draftTitles = titlesAfter;
      // copy toast
      inst.jumpTo('j-d-contact'); await sleep(rm ? 500 : 4000);
      const btn = root.querySelector('.c01-over [data-act="copy"]') || root.querySelector('[data-act="copy"]');
      btn.click(); const t2 = performance.now();
      const toastOn = () => { const st = inst.state.toast; return !!(st && st.on); };
      let tg = null, lg = null; o.copyLabelAt300 = null;
      while (performance.now() - t2 < 5000) { await sleep(50); const el = performance.now() - t2; if (o.copyLabelAt300 == null && el >= 300) o.copyLabelAt300 = btn.isConnected ? btn.textContent.trim() : (root.querySelector('[data-act="copy"]') || {}).textContent; if (tg == null && !toastOn()) tg = el; const c = root.querySelector('.c01-over [data-act="copy"]') || root.querySelector('[data-act="copy"]'); if (lg == null && c && c.textContent.trim() !== '已复制') lg = el; if (tg != null && lg != null) break; }
      o.toastUpMs = tg == null ? null : Math.round(tg); o.copiedLabelUpMs = lg == null ? null : Math.round(lg);
      return o;
    }, rm);
    r.errors = errors; res[rm ? 'rmOn' : 'rmOff'] = r; await p.close();
  }
  fs.writeFileSync(out, JSON.stringify(res, null, 1)); console.log(JSON.stringify(res, null, 1)); await b.close();
})();

// Regression for keyed real-time windows: (1) delete draft → undo → delete the same draft again → the undo control must still be
// visible 9 s after the FIRST delete + 2 s (i.e. the stale first timer must not close the second window); (2) both with reduced motion
// off and on. Uses data-act="delete"/"undo" conventions; h-drafts index state.
const { chromium } = require('/opt/node-tools/node_modules/playwright');
const path = require('path');
const sleep = (ms) => new Promise(r => setTimeout(r, ms));
(async () => {
  const b = await chromium.launch(); const out = {};
  const codes = process.argv.slice(2).length ? process.argv.slice(2) : ['C01', 'C02', 'C03', 'C04', 'C05', 'C06', 'C07', 'C08', 'C09', 'C10'];
  await Promise.all(codes.map(async (code) => {
    const res = {};
    for (const rm of [false, true]) {
      const p = await b.newPage({ viewport: { width: 1000, height: 1000 } });
      await p.goto('file://' + path.resolve(__dirname, '../../JU-My-Ju-Fable51-10-Concepts.html') + '#concept/' + code); await sleep(1500);
      const r = await p.evaluate(async ([c, rm]) => {
        const sl = (ms) => new Promise(r => setTimeout(r, ms));
        const m = window.JUShell.mounts.stage['stage:' + c + ':']; const inst = m.instance; const root = m.root;
        inst.jumpTo('h-drafts'); await sl(900); if (rm) { inst.toggleRM(); await sl(200); }
        const vis = (sel) => [...root.querySelectorAll(sel)].some(x => x.getClientRects().length && getComputedStyle(x).visibility !== 'hidden');
        const del = () => { const d = [...root.querySelectorAll('[data-act="delete"]')].find(x => x.getClientRects().length); if (d) d.click(); return !!d; };
        const undo = () => { const u = [...root.querySelectorAll('[data-act="undo"]')].find(x => x.getClientRects().length); if (u) u.click(); return !!u; };
        const draftsBefore = inst.state.data.drafts.length;
        if (!del()) return { err: 'no delete' }; await sl(1200);
        if (!undo()) return { err: 'no undo after first delete' }; await sl(1500);
        if (!del()) return { err: 'no delete second' }; await sl(9000);   // ~11.7 s after the first delete, ~9 s after the second
        const undoStill = vis('[data-act="undo"]');
        const undone = undo(); await sl(1500);
        return { undoStillVisible: undoStill, restored: inst.state.data.drafts.length === draftsBefore, undone };
      }, [code, rm]);
      res[rm ? 'rm' : 'normal'] = r; await p.close();
    }
    out[code] = res;
  }));
  console.log(JSON.stringify(out, null, 0)); await b.close();
})();

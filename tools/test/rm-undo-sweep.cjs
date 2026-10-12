// Reduced-motion sweep: for each concept, open host drafts, turn on reduced motion, delete a draft, and check that an undo control
// is still visible after 800 ms (a 10 s window must not collapse to 0). Uses the contract's data-act conventions.
const { chromium } = require('/opt/node-tools/node_modules/playwright');
const path = require('path');
(async () => {
  const b = await chromium.launch();
  const out = {};
  for (const code of ['C01', 'C02', 'C03', 'C04', 'C05', 'C06', 'C07', 'C08', 'C09', 'C10']) {
    const p = await b.newPage({ viewport: { width: 1000, height: 1000 } });
    await p.goto('file://' + path.resolve(__dirname, '../../JU-My-Ju-Fable51-10-Concepts.html') + '#concept/' + code); await p.waitForTimeout(1200);
    const r = await p.evaluate(async (c) => {
      const m = window.JUShell.mounts.stage['stage:' + c + ':']; const inst = m.instance; const root = m.root;
      inst.jumpTo('h-drafts'); await new Promise(r => setTimeout(r, 700));
      inst.toggleRM(); await new Promise(r => setTimeout(r, 200));
      const del = root.querySelector('[data-act="delete"]'); if (!del) return { err: 'no [data-act=delete]' };
      del.click(); await new Promise(r => setTimeout(r, 120));
      const confirm = [...root.querySelectorAll('[data-act="delete"]')].find(x => x !== del && x.offsetParent); if (confirm) confirm.click();
      await new Promise(r => setTimeout(r, 800));
      const undo = [...root.querySelectorAll('[data-act="undo"]')].filter(x => x.offsetParent || x.getClientRects().length);
      return { undoVisible: undo.length > 0 };
    }, code);
    out[code] = r; await p.close();
  }
  console.log(JSON.stringify(out)); await b.close();
})();

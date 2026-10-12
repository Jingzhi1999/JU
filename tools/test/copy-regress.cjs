// Repeat-copy regression: open host contact info, press copy, press copy again 1.5 s later, check that some "已复制" feedback is still
// visible 1.6 s after the second press (≈3.1 s after the first, i.e. after the first press's 1.8–2.6 s timer would have cleared it).
const { chromium } = require('/opt/node-tools/node_modules/playwright');
const path = require('path');
(async () => {
  const b = await chromium.launch(); const out = {};
  const codes = process.argv.slice(2).length ? process.argv.slice(2) : ['C01', 'C02', 'C03', 'C04', 'C05', 'C06', 'C07', 'C08', 'C09', 'C10'];
  await Promise.all(codes.map(async (code) => {
    const p = await b.newPage({ viewport: { width: 1000, height: 1000 } });
    await p.goto('file://' + path.resolve(__dirname, '../../JU-My-Ju-Fable51-10-Concepts.html') + '#concept/' + code); await p.waitForTimeout(1500);
    out[code] = await p.evaluate(async (c) => {
      const sl = (ms) => new Promise(r => setTimeout(r, ms));
      const m = window.JUShell.mounts.stage['stage:' + c + ':']; const inst = m.instance; const root = m.root;
      inst.jumpTo('h-m-contact'); await sl(1500);
      const btn = () => [...root.querySelectorAll('[data-act="copy"]')].find(x => x.getClientRects().length && !x.disabled);
      const b1 = btn(); if (!b1) return { err: 'no visible [data-act=copy]' };
      b1.click(); await sl(1500);
      const b2 = btn(); if (!b2) return { err: 'copy button gone after first press' };
      b2.click(); await sl(1600);
      const txt = root.textContent; return { stillCopied: /已复制/.test(txt) };
    }, code);
    await p.close();
  }));
  console.log(JSON.stringify(out)); await b.close();
})();

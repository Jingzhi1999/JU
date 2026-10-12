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


  for (const rm of [true, false]) { const { p, errors } = await page(); await p.evaluate(() => __I().jumpTo('j-d-contact')); await p.waitForTimeout(1200); if (rm) await rmOn(p);
    await p.evaluate(() => { __start(() => { const R = __R(), t = R.querySelector('.toast'); const cp = R.querySelector('.pane.dt [data-act=copy]'); return { toast: t && t.classList.contains('on') && __vis(t) ? 1 : 0, c: cp && cp.textContent.trim() === '已复制' ? 1 : 0 }; }); __R().querySelector('.pane.dt [data-act=copy]').click(); });
    await p.waitForTimeout(1500); const t2 = await p.evaluate(() => { __R().querySelector('.pane.dt [data-act=copy]').click(); return __now(); });
    await p.waitForTimeout(3500); const log = await p.evaluate(() => __stop());
    results[(rm ? 'rm' : 'off') + '_double_copy'] = { secondClickAt: t2, toastRuns: runs(log, 'toast'), copiedRuns: runs(log, 'c'), errors };
    await p.close(); }
  console.log(JSON.stringify(results, null, 1));
  await b.close();
})();

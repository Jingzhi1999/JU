const { chromium } = require('/opt/node-tools/node_modules/playwright'); const fs = require('fs');
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1000, height: 1000 } });
  const errors = []; p.on('pageerror', e => errors.push(e.message)); p.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  await p.goto('file:///home/user/JU/.build/final-C03.html#concept/C03'); await p.waitForTimeout(900);
  const I = (js) => p.evaluate((js) => { const m = window.JUShell.mounts.stage['stage:C03:']; return new Function('root', 'inst', js)(m.root, m.instance); }, js);
  const bar = () => I(`const t = root.querySelector('.c03-toast'); return { on: t.classList.contains('on'), n: root.querySelectorAll('.c03-pg .c03-row.draft').length, undo: !!inst.state.data.undo }`);
  const out = {};
  await I('inst.toggleRM()'); await I('inst.jumpTo("h-drafts-many")'); await p.waitForTimeout(600);
  // pause: delete, pause at 2 s for 12 s, resume, measure
  await I(`root.querySelector('.c03-pg .c03-row.draft [data-act="delete"]').click()`); await p.waitForTimeout(2000);
  await I('inst.togglePause()'); await p.waitForTimeout(12000); out.afterPaused12s = await bar();
  await I('inst.togglePause()'); const t0 = Date.now(); let last = null; while (Date.now() - t0 < 10000) { const s = await bar(); if (s.on) last = Date.now() - t0; else break; await p.waitForTimeout(100); }
  out.barAfterResumeLastOnMs = last; out.afterResumeCommit = await bar();
  // reset: delete then jump at 3 s, wait 10 s
  await I('inst.jumpTo("h-drafts-many")'); await p.waitForTimeout(600);
  await I(`root.querySelector('.c03-pg .c03-row.draft [data-act="delete"]').click()`); await p.waitForTimeout(3000);
  await I('inst.jumpTo("h-drafts-many")'); await p.waitForTimeout(10500); out.afterJumpAndWait = await bar();
  out.errors = errors; console.log(JSON.stringify(out, null, 1)); fs.writeFileSync(process.argv[2], JSON.stringify(out, null, 1)); await b.close();
})();

const { chromium } = require('/opt/node-tools/node_modules/playwright'); const fs = require('fs');
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1000, height: 1000 } });
  const errors = []; p.on('pageerror', e => errors.push(e.message)); p.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  await p.goto('file:///home/user/JU/.build/final-C03.html#concept/C03'); await p.waitForTimeout(900);
  const I = (js) => p.evaluate((js) => { const m = window.JUShell.mounts.stage['stage:C03:']; return new Function('root', 'inst', js)(m.root, m.instance); }, js);
  const out = {};
  const bar = () => I(`const t = root.querySelector('.c03-toast'); return { on: t.classList.contains('on'), text: t.textContent.trim(), n: root.querySelectorAll('.c03-pg .c03-row.draft').length }`);
  const measure = async () => { const tB = Date.now(); const s0 = []; while (Date.now() - tB < 11000) { const s = await bar(); s0.push([Date.now() - tB, s.on, s.n]); await p.waitForTimeout(100); } const lastOn = s0.filter(s => s[1]).pop(); return { lastOnMs: lastOn && lastOn[0], finalDrafts: s0[s0.length - 1][2] }; };
  const del = (i) => I(`root.querySelectorAll('.c03-pg .c03-row.draft [data-act="delete"]')[${i}].click()`);
  await I('inst.jumpTo("h-drafts-many")'); await p.waitForTimeout(600); await I('inst.toggleRM()'); await p.waitForTimeout(100);
  // case 1: delete A, undo at 8 s, delete B at 9 s
  await del(0); await p.waitForTimeout(8000); await I(`root.querySelector('.c03-toast [data-act="undo"]').click()`); await p.waitForTimeout(1000); await del(1);
  out.undoAt8_deleteAt9 = await measure();
  // case 2: delete A, then delete B at 5 s while A's bar is up
  await I('inst.jumpTo("h-drafts-many")'); await p.waitForTimeout(600);
  await del(0); await p.waitForTimeout(5000); await del(0); const m2 = await measure(); out.deleteA_thenB_at5s = m2;
  out.rm = await I('return inst.state.review.rm'); out.errors = errors; console.log(JSON.stringify(out, null, 1)); fs.writeFileSync(process.argv[2], JSON.stringify(out, null, 1)); await b.close();
})();

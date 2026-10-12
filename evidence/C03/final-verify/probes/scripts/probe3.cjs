const { chromium } = require('/opt/node-tools/node_modules/playwright'); const fs = require('fs');
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1000, height: 1000 } });
  const errors = []; p.on('pageerror', e => errors.push(e.message)); p.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  await p.goto('file:///home/user/JU/.build/final-C03.html#concept/C03'); await p.waitForTimeout(900);
  const I = (js) => p.evaluate((js) => { const m = window.JUShell.mounts.stage['stage:C03:']; return new Function('root', 'inst', js)(m.root, m.instance); }, js);
  const out = {};
  const bar = () => I(`const t = root.querySelector('.c03-toast'); return { on: t.classList.contains('on'), text: t.textContent.trim(), n: root.querySelectorAll('.c03-pg .c03-row.draft').length }`);
  for (const rm of [true, false]) {
    const tag = rm ? 'rm_on' : 'rm_off'; out[tag] = {};
    await I('inst.jumpTo("h-drafts-many")'); await p.waitForTimeout(600);
    if ((await I('return inst.state.review.rm')) !== rm) await I('inst.toggleRM()'); await p.waitForTimeout(100);
    // delete A, undo at 2s, delete B at 3s → is B's bar still up 9 s after B's delete?
    const t0 = Date.now();
    await I(`root.querySelectorAll('.c03-pg .c03-row.draft [data-act="delete"]')[0].click()`); await p.waitForTimeout(2000);
    await I(`root.querySelector('.c03-toast [data-act="undo"]').click()`); await p.waitForTimeout(1000);
    await I(`root.querySelectorAll('.c03-pg .c03-row.draft [data-act="delete"]')[1].click()`); const tB = Date.now();
    const samples = []; while (Date.now() - tB < 11000) { const s = await bar(); samples.push([Date.now() - tB, s.on]); await p.waitForTimeout(100); }
    const lastOn = samples.filter(s => s[1]).pop(); out[tag].secondDeleteBarLastOnMsAfterDelete = lastOn && lastOn[0];
  }
  out.errors = errors; console.log(JSON.stringify(out, null, 1)); fs.writeFileSync(process.argv[2], JSON.stringify(out, null, 1)); await b.close();
})();

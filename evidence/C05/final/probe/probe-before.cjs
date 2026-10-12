// Reproduces the sweep finding: same build, but hold() forced back to after() on the instance (= pre-fix behaviour), RM on.
const { chromium } = require('/opt/node-tools/node_modules/playwright');
const fs = require('fs'); const path = require('path');
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1000, height: 1000 } });
  await p.goto('file://' + path.resolve(process.env.JU_STANDALONE) + '#concept/C05'); await p.waitForTimeout(1000);
  const ev = (js) => p.evaluate((js) => { const m = window.JUShell.mounts.stage['stage:C05:']; return new Function('root', 'inst', js)(m.root, m.instance); }, js);
  const out = {};
  for (const variant of ['preFix_after', 'postFix_hold']) {
    await ev("inst.jumpTo('h-drafts')"); await p.waitForTimeout(700);
    if (!(await ev('return inst.state.review.rm'))) await ev('inst.toggleRM()');
    if (variant === 'preFix_after') await ev('inst.hold = inst.after;'); else await ev('delete inst.hold;');
    await ev("root.querySelector('.c05-rowwrap [data-act=\"delete\"]').click()");
    await p.waitForTimeout(800);
    out[variant] = await ev("return { undoBarAt800ms: !!root.querySelector('.c05-undo'), draftsListed: root.querySelectorAll('.c05-rowwrap [data-act=\"delete\"]').length, undoState: inst.state.undo };");
  }
  fs.writeFileSync(process.argv[2], JSON.stringify(out, null, 1)); console.log(JSON.stringify(out));
  await b.close();
})();

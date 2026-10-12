const { chromium } = require('/opt/node-tools/node_modules/playwright');
const sleep = ms => new Promise(r => setTimeout(r, ms));
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1000, height: 1000 } }); const errors=[]; p.on('pageerror', e => errors.push(e.message));
  await p.goto('file://' + require('path').resolve(process.env.JU_STANDALONE || '/home/user/JU/.build/final-C08.html') + '#concept/C08'); await p.waitForTimeout(1200);
  const E = (js) => p.evaluate((js) => { const m = window.JUShell.mounts.stage['stage:C08:']; return (new Function('root', 'inst', js))(m.root, m.instance); }, js);
  const o = {};
  await E('inst.toggleRM()'); await E('inst.setSpeed(0.5)'); await sleep(200);
  await E(`inst.jumpTo('h-drafts')`); await sleep(500);
  await E(`root.querySelector('.c08-blk[data-rid="draft-reading"] .c08-del').click()`); await sleep(300);
  o.half = await E(`const i = root.querySelector('.c08-undo i'); return { dur: getComputedStyle(i, '::after').animationDuration, timer: inst._undoTimer && inst._undoTimer.remaining }`);
  // pause: timer and drain freeze
  await E('inst.togglePause()'); await sleep(100); const a = await E(`return getComputedStyle(root.querySelector('.c08-undo i'), '::after').transform`); await sleep(2500); const bb = await E(`return getComputedStyle(root.querySelector('.c08-undo i'), '::after').transform`);
  o.pause = { before: a, after2500: bb, ps: await E(`return getComputedStyle(root.querySelector('.c08-undo i'), '::after').animationPlayState`), undo: await E('return !!inst.state.undo') };
  await E('inst.togglePause()');
  o.errors = errors; console.log(JSON.stringify(o, null, 1)); await b.close();
})();

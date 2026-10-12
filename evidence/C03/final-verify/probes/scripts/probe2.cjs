const { chromium } = require('/opt/node-tools/node_modules/playwright'); const fs = require('fs');
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1000, height: 1000 } });
  const errors = []; p.on('pageerror', e => errors.push(e.message)); p.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  await p.goto('file:///home/user/JU/.build/final-C03.html#concept/C03'); await p.waitForTimeout(900);
  const I = (js) => p.evaluate((js) => { const m = window.JUShell.mounts.stage['stage:C03:']; return new Function('root', 'inst', js)(m.root, m.instance); }, js);
  const out = {};
  const titles = () => I(`return [...root.querySelectorAll('.c03-pg .c03-row.draft')].map(e => (e.querySelector('h3,.c03-rt,b,strong')||e).textContent.trim().replace(/\\s+/g,' ').slice(0, 20))`);
  for (const rm of [true, false]) {
    const tag = rm ? 'rm_on' : 'rm_off'; out[tag] = {};
    await I('inst.jumpTo("h-drafts-many")'); await p.waitForTimeout(600);
    if ((await I('return inst.state.review.rm')) !== rm) await I('inst.toggleRM()'); await p.waitForTimeout(100);
    out[tag].before = await titles();
    await I(`root.querySelectorAll('.c03-pg .c03-row.draft [data-act="delete"]')[1].click()`); await p.waitForTimeout(8700);
    out[tag].at87 = await titles();
    await I(`root.querySelector('.c03-toast [data-act="undo"]').click()`); await p.waitForTimeout(rm ? 200 : 800);
    out[tag].afterUndo = await titles(); out[tag].landedRow = await I(`const l = root.querySelector('.c03-row.landed'); return l ? l.textContent.trim().replace(/\\s+/g,' ').slice(0, 20) : null`);
    await p.waitForTimeout(11000); out[tag].after11s = await titles(); out[tag].undoAfter = !!(await I('return inst.state.data.undo'));
    // accept-reschedule toast
    await I('inst.jumpTo("j-d-reschedule")'); await p.waitForTimeout(rm ? 600 : 4500);
    await I(`root.querySelector('.c03-sp .c03-side.stub').focus()`); await p.keyboard.press('Enter');
    const t0 = Date.now(); let f = null, l = null, txt = ''; while (Date.now() - t0 < 8000) { const s = await I(`const t = root.querySelector('.c03-toast'); return { on: t.classList.contains('on') && +getComputedStyle(t).opacity > .9, text: t.textContent.trim() }`); const t = Date.now() - t0; if (s.on) { if (f == null) f = t; l = t; txt = s.text; } else if (f != null) break; await p.waitForTimeout(30); }
    out[tag].acceptToast = { text: txt, appearsAtMs: f, lastSeenAtMs: l, durationMs: l - f };
  }
  out.errors = errors; console.log(JSON.stringify(out, null, 1)); fs.writeFileSync(process.argv[2], JSON.stringify(out, null, 1)); await b.close();
})();

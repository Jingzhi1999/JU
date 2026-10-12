const { chromium } = require('/opt/node-tools/node_modules/playwright');
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1000, height: 1000 } });
  const errors = []; p.on('pageerror', e => errors.push(e.message));
  await p.goto('file:///home/user/JU/.build/verify-C04.html#concept/C04'); await p.waitForTimeout(800);
  const ev = (js) => p.evaluate((js) => { const m = window.JUShell.mounts.stage['stage:C04:']; return new Function('root', 'inst', js)(m.root, m.instance); }, js);
  const out = {};
  await ev(`inst.jumpTo('h-m-cancelled')`); await p.waitForTimeout(900);
  out.cancelledAff = await ev(`return [...root.querySelectorAll('.pane.mg .endcomp .aff > div')].map(d=>d.textContent.trim().replace(/\\s+/g,' '))`);
  await ev(`inst.jumpTo('h-m-cancel')`); await p.waitForTimeout(900);
  out.sheetAff = await ev(`return [...root.querySelectorAll('.sheet .aff > div')].map(d=>d.textContent.trim().replace(/\\s+/g,' '))`);
  await ev(`root.querySelector('.sheet [data-act="cancel"]').click()`); await p.waitForTimeout(6500);
  out.afterCancelAff = await ev(`return [...root.querySelectorAll('.pane.mg .endcomp .aff > div')].map(d=>d.textContent.trim().replace(/\\s+/g,' '))`);
  out.leonRow = await ev(`return [...root.querySelectorAll('.pane.mg .mrow')].map(d=>d.textContent.trim().replace(/\\s+/g,' '))`);
  // selector conventions
  out.selectors = await ev(`return { over: root.querySelectorAll('.c04-over').length, rid: root.querySelectorAll('[data-rid]').length }`);
  await ev(`inst.jumpTo('j-d-tear')`); await p.waitForTimeout(900);
  out.tearAct = await ev(`return [...root.querySelectorAll('[data-act]')].map(e=>e.dataset.act).filter(Boolean)`);
  await ev(`inst.jumpTo('j-d-reschedule')`); await p.waitForTimeout(900);
  out.reschedActs = await ev(`return [...root.querySelectorAll('[data-act]')].map(e=>e.dataset.act).filter(Boolean)`);
  out.reschedOldCount = await ev(`const t=root.querySelector('.pane').textContent; return (t.match(/20:30/g)||[]).length`);
  // width probes 360/430
  for (const w of [360, 430]) {
    await ev(`const ph=root.querySelector('.ju-phone'); ph.style.width='${w}px';`); await p.waitForTimeout(200);
    for (const k of ['j-home','h-home','j-d-tear','h-m-review','b-long-h']) { await ev(`inst.jumpTo('${k}')`); await p.waitForTimeout(700);
      out['w'+w+'-'+k] = await ev(`const a=root.querySelector('.app'); const bad=[...a.querySelectorAll('*')].filter(e=>{const r=e.getBoundingClientRect(); const ar=a.getBoundingClientRect(); return r.width>0 && (r.right>ar.right+1) && getComputedStyle(e).position!=='fixed' && !e.closest('.sky') && !e.closest('.stack.h:not(:only-child)')}).length; return {sw:a.scrollWidth, cw:a.clientWidth}`);
    }
    await ev(`root.querySelector('.ju-phone').style.width='';`);
  }
  out.errors = errors;
  console.log(JSON.stringify(out, null, 1));
  await b.close();
})();

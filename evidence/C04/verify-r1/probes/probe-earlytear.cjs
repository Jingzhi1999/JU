const { chromium } = require('/opt/node-tools/node_modules/playwright');
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1000, height: 1000 } });
  const errors = []; p.on('pageerror', e => errors.push(e.message));
  await p.goto('file:///home/user/JU/.build/verify-C04.html#concept/C04'); await p.waitForTimeout(800);
  const ev = (js) => p.evaluate((js) => { const m = window.JUShell.mounts.stage['stage:C04:']; return new Function('root', 'inst', js)(m.root, m.instance); }, js);
  const clip = await p.evaluate(() => { const h = document.querySelector('.stage-host[data-code="C04"]'); const r = h.shadowRoot.querySelector('.ju-phone').getBoundingClientRect(); return { x: r.left, y: r.top, width: r.width, height: r.height }; });
  await ev(`inst.jumpTo('j-d-invited')`); await p.waitForTimeout(900); await ev(`inst.setSpeed(0.5)`);
  await ev(`root.querySelector('.pane .acts .cta').click()`); await p.waitForTimeout(1300);
  await ev(`const r=root.querySelector('.rules .rs'); r.scrollTop=99999; r.dispatchEvent(new Event('scroll'))`); await p.waitForTimeout(500);
  await ev(`root.querySelector('.rules [data-act="confirm"]').click()`);
  await p.waitForTimeout(1150);
  const has = await ev(`const e=root.querySelector('.pane .piece[data-act="tear"]'); if(!e) return 'none'; const r=e.getBoundingClientRect(); return JSON.stringify({x:r.left+r.width/2,y:r.top+r.height/2, rules: !!root.querySelector('.rules')})`);
  console.log('tear piece at ~1150ms (0.5x):', has);
  await p.screenshot({ path: '/home/user/JU/evidence/C04/verify-r1/print-flash-window.png', clip });
  if (has !== 'none') { const r = JSON.parse(has); const x = r.x, y = r.y + 100; await p.mouse.move(x, y); await p.mouse.down(); for (let i = 1; i <= 6; i++) { await p.mouse.move(x, y + 25 * i, { steps: 2 }); await p.waitForTimeout(30); }
    await p.screenshot({ path: '/home/user/JU/evidence/C04/verify-r1/print-flash-drag.png', clip });
    const st = await ev(`return JSON.stringify({tear: inst.state.tear.p, printed: inst.state.detail.printed, fx: inst.state.fx})`); console.log('during drag:', st);
    await p.mouse.up(); await p.waitForTimeout(8000);
    const st2 = await ev(`return JSON.stringify({stage: root.querySelector('.pane .ph .state').textContent, fx: inst.state.fx, printed: inst.state.detail.printed, pass: root.querySelector('.pane .pass') && root.querySelector('.pane .pass').className, contact: !!root.querySelector('.pane .contact')})`); console.log('after release+3s:', st2);
    await p.screenshot({ path: '/home/user/JU/evidence/C04/verify-r1/print-flash-after8s.png', clip });
  }
  console.log('errors', errors);
  await b.close();
})();

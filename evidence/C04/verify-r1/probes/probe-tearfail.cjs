const { chromium } = require('/opt/node-tools/node_modules/playwright');
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1000, height: 1000 } });
  await p.goto('file:///home/user/JU/.build/verify-C04.html#concept/C04'); await p.waitForTimeout(800);
  const ev = (js) => p.evaluate((js) => { const m = window.JUShell.mounts.stage['stage:C04:']; return new Function('root', 'inst', js)(m.root, m.instance); }, js);
  await ev(`inst.jumpTo('j-d-tear')`); await p.waitForTimeout(900); await ev(`inst.armFail()`); await p.waitForTimeout(100);
  const r = JSON.parse(await ev(`const e=root.querySelector('.pane .piece[data-act="tear"]').getBoundingClientRect(); return JSON.stringify({x:e.left+e.width/2,y:e.top+e.height/2})`));
  const x = r.x, y = r.y + 100;
  await p.mouse.move(x, y); await p.mouse.down(); for (let i = 1; i <= 8; i++) { await p.mouse.move(x, y + 150 * i / 8, { steps: 2 }); await p.waitForTimeout(40); } await p.mouse.up(); await p.waitForTimeout(500);
  const s1 = await ev(`const s=inst.state; return JSON.stringify({tear:s.tear, err:!!s.err, stage: root.querySelector('.pane .ph .state').textContent})`);
  // move without pressing
  await p.mouse.move(x, y + 20, { steps: 4 }); await p.waitForTimeout(200);
  const s2 = await ev(`const s=inst.state; return JSON.stringify({tear:s.tear})`);
  await p.mouse.move(x, y + 140, { steps: 4 }); await p.waitForTimeout(200);
  const s3 = await ev(`const s=inst.state; return JSON.stringify({tear:s.tear})`);
  await p.screenshot({ path: '/home/user/JU/evidence/C04/verify-r1/tearfail-hover.png', clip: await p.evaluate(() => { const h = document.querySelector('.stage-host[data-code="C04"]'); const r = h.shadowRoot.querySelector('.ju-phone').getBoundingClientRect(); return { x: r.left, y: r.top, width: r.width, height: r.height }; }) });
  // dismiss error then hover + click-release elsewhere
  await ev(`root.querySelector('.pane .errbar [data-act="close"]').click()`); await p.waitForTimeout(200);
  const s4 = await ev(`const s=inst.state; return JSON.stringify({tear:s.tear, err:!!s.err})`);
  await p.mouse.move(x, y + 30, { steps: 3 }); await p.waitForTimeout(150);
  const s5 = await ev(`const s=inst.state; return JSON.stringify({tear:s.tear})`);
  await p.mouse.move(x, y + 140, { steps: 3 }); await p.mouse.down(); await p.mouse.up(); await p.waitForTimeout(1500);
  const s6 = await ev(`const s=inst.state; return JSON.stringify({tear:s.tear, fx:s.fx, state: root.querySelector('.pane .ph .state').textContent})`);
  console.log([s1, s2, s3, s4, s5, s6].join('\n'));
  await b.close();
})();

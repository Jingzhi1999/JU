// per-frame sample of the lifted object during lift: face height, title height, top, over classes
const { chromium } = require('/opt/node-tools/node_modules/playwright'); const path = require('path'); const fs = require('fs');
(async () => { const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1000, height: 1000 } });
  await p.goto('file://' + path.resolve(process.argv[2]) + '#concept/C06'); await p.waitForTimeout(900); await p.evaluate(() => document.fonts.ready);
  const run = js => p.evaluate(js => { const m = window.JUShell.mounts.stage['stage:C06:']; return new Function('root', 'inst', js)(m.root, m.instance); }, js);
  const out = {};
  for (const [label, setup, rid, speed] of [['ramen 1x', "inst.jumpTo('j-history')", 'r-ramen', 1], ['ramen 0.5x', "inst.jumpTo('j-history')", 'r-ramen', 0.5], ['bar long 1x', "inst.loadVariant('long')", 'r-bar', 1], ['brunch 1x (short name)', "inst.jumpTo('j-home')", 'r-brunch', 1]]) {
    await run(`inst.setSpeed(${speed})`); await p.waitForTimeout(100);
    await run(setup); await p.waitForTimeout(800);
    if (rid === 'r-bar') { await run("inst.switchRole('hosted')"); await p.waitForTimeout(1500); }
    const rows = await run(`return new Promise(res => { const rows = []; const t0 = performance.now(); const row0 = root.querySelector('.c06-obj[data-rid="${rid}"]'); const r0 = row0.getBoundingClientRect(); const t = row0.querySelector('.c06-t'); rows.push({ t: 'list', faceH: Math.round(r0.height), titleH: t ? Math.round(t.getBoundingClientRect().height) : null, top: Math.round(r0.top) }); row0.click();
      const tick = () => { const now = performance.now() - t0; const h = root.querySelector('.c06-over .c06-held.main') || root.querySelector('.c06-over .c06-held'); const over = root.querySelector('.c06-over'); if (h) { const f = h.querySelector('.c06-face') || h; const rc = f.getBoundingClientRect(); const tt = h.querySelector('.c06-t'); rows.push({ t: Math.round(now), faceH: Math.round(rc.height), titleH: tt ? Math.round(tt.getBoundingClientRect().height) : null, top: Math.round(rc.top), over: over ? over.className.replace('c06-over', '').trim() : '' }); } if (now < 900) requestAnimationFrame(tick); else res(rows); }; requestAnimationFrame(tick); });`);
    out[label] = rows.filter((r, i) => i < 12 || i % 6 === 0);
    await run(`const b = root.querySelector('.c06-over [data-act="back"]'); if (b) b.click();`); await p.waitForTimeout(2500);
  }
  console.log(JSON.stringify(out, null, 0).replace(/\},\{/g, '},\n{')); fs.writeFileSync(process.argv[3], JSON.stringify(out, null, 1));
  await b.close(); })();

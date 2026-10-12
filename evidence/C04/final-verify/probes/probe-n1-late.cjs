// final-verify: real-pointer click on 去不了了 / agreement link and stub drag late in the print (after the pass is visible but before printed)
const { chromium } = require('/opt/node-tools/node_modules/playwright'); const path = require('path');
const R = `document.querySelector('.stage-host[data-code="C04"]').shadowRoot`; const INST = `window.JUShell.mounts.stage['stage:C04:'].instance`;
(async () => { const b = await chromium.launch(); const out = {};
  for (const [speed, at] of [[1, 1600], [1, 2400], [1, 3100], [0.5, 3500], [0.5, 5000], [0.5, 6300]]) {
    const p = await b.newPage({ viewport: { width: 1000, height: 1000 } }); const errors = []; p.on('pageerror', e => errors.push(e.message));
    await p.goto('file://' + path.resolve(process.env.JU_STANDALONE) + '#concept/C04'); await p.waitForTimeout(800); const I = js => p.evaluate(js);
    await I(`${INST}.jumpTo('j-d-invited')`); await p.waitForTimeout(1000); await I(`${INST}.setSpeed(${speed})`);
    await I(`${R}.querySelector('.pane .acts .cta').click()`); await p.waitForTimeout(1400);
    await I(`(()=>{const e=${R}.querySelector('.rules .rs'); e.scrollTop=99999; e.dispatchEvent(new Event('scroll'));})()`); await p.waitForTimeout(500);
    await I(`${R}.querySelector('.rules [data-act="confirm"]').click()`); await p.waitForTimeout(at);
    const pos = sel => I(`(()=>{const e=${R}.querySelector('${sel}');if(!e)return null;const r=e.getBoundingClientRect();return {x:r.left+r.width/2,y:r.top+r.height/2,h:r.height,dis:e.disabled};})()`);
    const r = { st0: await I(`JSON.stringify({printed:${INST}.state.detail.printed, print:!!${INST}.state.fx.print})`) };
    const wk = await pos('.pane .bar2 .weak'); r.weakDisabled = wk && wk.dis; if (wk) await p.mouse.click(wk.x, wk.y); await p.waitForTimeout(80);
    r.sheet = await I(`(${INST}.state.sheet||{}).kind||null`);
    const ag = await pos('.pane .agl [data-act="rules"], .pane .acts [data-act="rules"]'); r.agreeDisabled = ag && ag.dis; if (ag) await p.mouse.click(ag.x, ag.y); await p.waitForTimeout(80);
    r.layer = await I(`(${INST}.state.detail||{}).layer||null`);
    const st = await pos('.pane .piece.stubp'); if (st) { st.y += st.h * 0.37; r.hitAtStub = await p.evaluate(([x, y]) => { const e = document.querySelector('.stage-host[data-code="C04"]').shadowRoot.elementFromPoint(x, y); const a = e && e.closest('.piece'); return a ? a.className + ' pe=' + getComputedStyle(a).pointerEvents : (e ? String(e.className) : null); }, [st.x, st.y]); await p.mouse.move(st.x, st.y); await p.mouse.down(); for (let i = 1; i <= 8; i++) { await p.mouse.move(st.x, st.y + i * 22); await p.waitForTimeout(20); } r.tearDuring = await I(`JSON.stringify(${INST}.state.tear)`); await p.mouse.up(); }
    await p.waitForTimeout(speed === 1 ? 3000 : 6000);
    r.final = await I(`(()=>{const i=${INST};const row=i.joinedRow('brunch');return JSON.stringify({stage:row.stage,torn:!!(row.ticket&&row.ticket.torn),printed:i.state.detail.printed,sheet:(i.state.sheet||{}).kind||null,layer:i.state.detail.layer});})()`);
    r.errors = errors; out[speed + 'x_' + at] = r; await p.close(); }
  console.log(JSON.stringify(out, null, 1)); await b.close(); })();

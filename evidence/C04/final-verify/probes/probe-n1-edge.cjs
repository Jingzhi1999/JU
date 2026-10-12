// final-verify: instrument tearDown — does any pointerdown reach it, and with what state, around the end of the confirm→print?
const { chromium } = require('/opt/node-tools/node_modules/playwright'); const path = require('path');
const R = `document.querySelector('.stage-host[data-code="C04"]').shadowRoot`; const INST = `window.JUShell.mounts.stage['stage:C04:'].instance`;
(async () => { const b = await chromium.launch(); const out = {};
  for (const speed of [1, 0.5]) {
    const p = await b.newPage({ viewport: { width: 1000, height: 1000 } }); const errors = []; p.on('pageerror', e => errors.push(e.message));
    await p.goto('file://' + path.resolve(process.env.JU_STANDALONE) + '#concept/C04'); await p.waitForTimeout(800); const I = js => p.evaluate(js);
    await I(`${INST}.jumpTo('j-d-invited')`); await p.waitForTimeout(1000); await I(`${INST}.setSpeed(${speed})`);
    await I(`${R}.querySelector('.pane .acts .cta').click()`); await p.waitForTimeout(1400);
    await I(`(()=>{const e=${R}.querySelector('.rules .rs'); e.scrollTop=99999; e.dispatchEvent(new Event('scroll'));})()`); await p.waitForTimeout(500);
    await I(`(()=>{const i=${INST}; window.__td=[]; window.__t0=performance.now(); const o=i.tearDown.bind(i); i.tearDown=function(ev){ const s=i.state; window.__td.push({t:Math.round(performance.now()-window.__t0), printed:s.detail&&s.detail.printed, print:!!s.fx.print, layer:s.detail&&s.detail.layer}); return o(ev); };
      let lastP=null; window.__pt=[]; const tk=()=>{ const d=i.state.detail; const v=d&&d.printed; if(v!==lastP){ lastP=v; window.__pt.push({t:Math.round(performance.now()-window.__t0), printed:v}); } window.__raf=requestAnimationFrame(tk); }; tk(); })()`);
    await I(`${R}.querySelector('.rules [data-act="confirm"]').click()`);
    // tap the stub position every ~60 ms from t=0 to the end of the print (+300 ms) with a real mouse
    const end = speed === 1 ? 3700 : 7100; const t0 = Date.now(); let n = 0;
    while (Date.now() - t0 < end) {
      const pos = await I(`(()=>{const e=${R}.querySelector('.pane .piece.stubp');if(!e)return null;const r=e.getBoundingClientRect();return {x:r.left+r.width/2,y:r.top+r.height*0.87};})()`);
      if (pos) { await p.mouse.move(pos.x, pos.y); await p.mouse.down(); await p.mouse.up(); n++; }
      await p.waitForTimeout(60);
    }
    out[speed + 'x'] = { taps: n, tearDownCalls: await I('window.__td'), printedTransitions: await I('window.__pt'), errors };
    await p.close(); }
  console.log(JSON.stringify(out, null, 1)); await b.close(); })();

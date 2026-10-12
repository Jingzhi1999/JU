// final-verify: reduced motion, confirm→formed — how long is the intermediate (unprinted) state between 处理中 and the printed pass? 5 runs.
const { chromium } = require('/opt/node-tools/node_modules/playwright'); const path = require('path');
const R = `document.querySelector('.stage-host[data-code="C04"]').shadowRoot`; const INST = `window.JUShell.mounts.stage['stage:C04:'].instance`;
(async () => { const b = await chromium.launch(); const runs = [];
  for (let k = 0; k < 5; k++) { const p = await b.newPage({ viewport: { width: 1000, height: 1000 } }); const I = js => p.evaluate(js);
    await p.goto('file://' + path.resolve(process.env.JU_STANDALONE) + '#concept/C04'); await p.waitForTimeout(800); await I(`${INST}.toggleRM()`);
    await I(`${INST}.jumpTo('j-d-invited')`); await p.waitForTimeout(900); await I(`${R}.querySelector('.pane .acts .cta').click()`); await p.waitForTimeout(500);
    await I(`(()=>{const e=${R}.querySelector('.rules .rs'); e.scrollTop=99999; e.dispatchEvent(new Event('scroll'));})()`); await p.waitForTimeout(300);
    await I(`(()=>{const i=${INST}; window.__l=[]; const t0=performance.now(); let last=''; const tk=()=>{ const d=i.state.detail||{}; const r=${R}.querySelector('.rules'); const dm=${R}.querySelector('.dimmer, .rdim'); const s=JSON.stringify({printed:d.printed, print:!!i.state.fx.print, rules:r?r.className:null, dim: dm? getComputedStyle(dm).opacity:null, busy:i.state.busy||''}); if(s!==last){last=s; window.__l.push(Math.round(performance.now()-t0)+' '+s);} window.__raf=requestAnimationFrame(tk); }; tk(); })()`);
    await I(`${R}.querySelector('.rules [data-act="confirm"]').click()`); await p.waitForTimeout(1200); runs.push(await I('window.__l')); await p.close(); }
  console.log(JSON.stringify(runs, null, 1)); await b.close(); })();

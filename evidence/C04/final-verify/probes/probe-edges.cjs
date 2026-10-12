// final-verify: edge regressions around the new !d.printed / rules-layer gates
const { chromium } = require('/opt/node-tools/node_modules/playwright'); const path = require('path');
const R = `document.querySelector('.stage-host[data-code="C04"]').shadowRoot`; const INST = `window.JUShell.mounts.stage['stage:C04:'].instance`;
(async () => { const b = await chromium.launch(); const out = {};
  const fresh = async () => { const p = await b.newPage({ viewport: { width: 1000, height: 1000 } }); const errors = []; p.on('pageerror', e => errors.push(e.message)); p.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
    await p.goto('file://' + path.resolve(process.env.JU_STANDALONE) + '#concept/C04'); await p.waitForTimeout(800); return { p, errors, I: js => p.evaluate(js) }; };
  const btns = `[...${R}.querySelectorAll('.pane:not(.mg) button')].filter(b=>!b.closest('.rules')&&!b.closest('.sheet')).map(b=>b.textContent.trim().slice(0,8)+(b.disabled?'[x]':'[ON]')).join(' ')`;
  const tearAt = async (p, I) => { const st = await I(`(()=>{const e=${R}.querySelector('.pane .piece.stubp');if(!e)return null;const r=e.getBoundingClientRect();return {x:r.left+r.width/2,y:r.top+r.height*0.87};})()`); if (!st) return 'no stub';
    await p.mouse.move(st.x, st.y); await p.mouse.down(); for (let i = 1; i <= 10; i++) { await p.mouse.move(st.x, st.y + i * 20); await p.waitForTimeout(25); } await p.mouse.up(); await p.waitForTimeout(4500);
    return I(`(()=>{const d=${INST}.state.detail; const row=${INST}.joinedRow(d.id); return row.stage+' torn='+!!(row.ticket&&row.ticket.torn)+' layer='+d.layer;})()`); };
  // 1) livehouse (reschedule reply) tap → print: controls disabled during print, enabled after
  { const { p, errors, I } = await fresh(); await I(`${INST}.jumpTo('j-home')`); await p.waitForTimeout(800);
    await I(`${R}.querySelector('.rw[data-rid="livehouse"] .row').click()`); const seq = []; let last = '';
    for (let i = 0; i < 40; i++) { const s = await I(btns); const pr = await I(`${INST}.state.detail&&${INST}.state.detail.printed`); const k = s + ' printed=' + pr; if (k !== last) { seq.push(i * 100 + 'ms ' + k); last = k; } await p.waitForTimeout(100); }
    out.livehouse_print = { seq, errors }; await p.close(); }
  // 2) j-d-tear: open read-only rules from the agreement link, close it, then the stub still tears
  { const { p, errors, I } = await fresh(); await I(`${INST}.jumpTo('j-d-tear')`); await p.waitForTimeout(900);
    await I(`${R}.querySelector('.pane [data-act="rules"]').click()`); await p.waitForTimeout(900); const layerOpen = await I(`${INST}.state.detail.layer`);
    await I(`${R}.querySelector('.rules [data-act="close"]').click()`); await p.waitForTimeout(900); const layerClosed = await I(`${INST}.state.detail.layer`);
    out.rules_then_tear = { layerOpen, layerClosed, after: await tearAt(p, I), errors }; await p.close(); }
  // 3) confirm → back during the rules-out window → reopen brunch → it prints, ends enabled and tearable
  { const { p, errors, I } = await fresh(); await I(`${INST}.jumpTo('j-d-invited')`); await p.waitForTimeout(1000);
    await I(`${R}.querySelector('.pane .acts .cta').click()`); await p.waitForTimeout(1400);
    await I(`(()=>{const e=${R}.querySelector('.rules .rs'); e.scrollTop=99999; e.dispatchEvent(new Event('scroll'));})()`); await p.waitForTimeout(500);
    await I(`${R}.querySelector('.rules [data-act="confirm"]').click()`); await p.waitForTimeout(560);
    const atBack = await I(`JSON.stringify({layer:${INST}.state.detail.layer, printed:${INST}.state.detail.printed})`);
    await I(`${R}.querySelector('.pane .bar2 .back').click()`); await p.waitForTimeout(1500);
    const home = await I(`JSON.stringify({view:${INST}.state.view.name, detail:!!${INST}.state.detail, rules:!!${R}.querySelector('.rules'), blur: getComputedStyle(${R}.querySelector('.home, .stack, .list')||document.body).filter})`);
    await I(`${R}.querySelector('.rw[data-rid="brunch"] .row').click()`); await p.waitForTimeout(250); const reopen = await I(`JSON.stringify({printed:${INST}.state.detail.printed, print:!!${INST}.state.fx.print, pass:(${R}.querySelector('.pane .pass')||{}).className})`);
    await p.waitForTimeout(3200); const end = await I(btns);
    out.confirm_back_reopen = { atBack, home, reopen, endButtons: end, tear: await tearAt(p, I), errors }; await p.close(); }
  console.log(JSON.stringify(out, null, 1)); await b.close(); })();

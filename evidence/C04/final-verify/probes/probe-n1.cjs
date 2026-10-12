// final-verify (independent): confirm→formed print path on j-d-invited (brunch).
// node probe-n1.cjs <out.json>  — env JU_STANDALONE
const { chromium } = require('/opt/node-tools/node_modules/playwright');
const fs = require('fs'); const path = require('path');
const OUT = process.argv[2];
const SAMPLER = `(() => {
  const R = document.querySelector('.stage-host[data-code="C04"]').shadowRoot;
  const inst = window.JUShell.mounts.stage['stage:C04:'].instance;
  window.__t0 = performance.now(); window.__log = []; let last = '';
  const txt = e => e ? e.textContent.trim().replace(/\\s+/g, ' ') : null;
  const tick = () => {
    const s = inst.state; const d = s.detail || {};
    const pane = R.querySelector('.pane:not(.mg)');
    const pass = pane && pane.querySelector('.pass');
    const pieces = pass ? [...pass.querySelectorAll('.piece')].map(p => (p.className.match(/stubp|headp|bodyp|timep|\\w+p\\b/)||[''])[0] + ':' + getComputedStyle(p).opacity.slice(0,4) + '/' + getComputedStyle(p).pointerEvents) : [];
    const stub = pass && pass.querySelector('.piece.stubp');
    let hit = null; if (stub) { const r = stub.getBoundingClientRect(); const el = R.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); hit = el ? (el.closest('[data-act]') ? el.closest('[data-act]').getAttribute('data-act') : el.className && String(el.className).slice(0, 24)) : null; }
    const btns = pane ? [...pane.querySelectorAll('button')].filter(b => !b.closest('.rules')).map(b => txt(b).slice(0, 10) + (b.disabled ? '[x]' : '[ON]')) : [];
    const helps = pane ? [...pane.querySelectorAll('.help')].map(txt).filter(h => /拖|撕/.test(h)) : [];
    const rules = R.querySelector('.rules');
    const sig = JSON.stringify({ rules: rules ? rules.className.replace('rules', '').trim() || 'present' : null, layer: d.layer || null, printed: d.printed, fxPrint: !!(s.fx && s.fx.print), busy: s.busy || '',
      passCls: pass ? pass.className.replace(/\\s+/g, ' ').trim() : null, passOp: pass ? getComputedStyle(pass).opacity : null, pieces: pieces.join(' '), stubHit: hit,
      tearHint: helps.join('|') || null, note: txt(pane && pane.querySelector('.sec-h .note')), state: txt(pane && pane.querySelector('.ph .state')), btns: btns.join(' ') });
    if (sig !== last) { last = sig; window.__log.push(Object.assign({ t: Math.round(performance.now() - window.__t0) }, JSON.parse(sig))); }
    window.__raf = requestAnimationFrame(tick);
  }; tick();
})()`;
const R = `document.querySelector('.stage-host[data-code="C04"]').shadowRoot`; const INST = `window.JUShell.mounts.stage['stage:C04:'].instance`;
(async () => {
  const b = await chromium.launch(); const results = {};
  const fresh = async () => {
    const p = await b.newPage({ viewport: { width: 1000, height: 1000 } }); const errors = [];
    p.on('pageerror', e => errors.push(e.message)); p.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
    await p.goto('file://' + path.resolve(process.env.JU_STANDALONE) + '#concept/C04'); await p.waitForTimeout(800);
    return { p, errors, I: (js) => p.evaluate(js) };
  };
  const toConfirm = async (I, p, speed, rm) => {
    if (rm) await I(`${INST}.toggleRM()`);
    await I(`${INST}.jumpTo('j-d-invited')`); await p.waitForTimeout(1000); await I(`${INST}.setSpeed(${speed})`); await p.waitForTimeout(50);
    await I(`${R}.querySelector('.pane .acts [data-act="rules"], .pane .acts .cta').click()`); await p.waitForTimeout(1400);
    await I(`(()=>{const e=${R}.querySelector('.rules .rs'); e.scrollTop=99999; e.dispatchEvent(new Event('scroll'));})()`); await p.waitForTimeout(500);
  };
  const final = (I) => I(`(()=>{const i=${INST};const row=i.joinedRow('brunch');const R0=${R};return {stage:row&&row.stage,torn:!!(row&&row.ticket&&row.ticket.torn),printed:i.state.detail&&i.state.detail.printed,layer:i.state.detail&&i.state.detail.layer,sheet:i.state.sheet&&i.state.sheet.kind,contact:!!R0.querySelector('.pane .contact'),pass:(R0.querySelector('.pane .pass')||{}).className};})()`);
  const analyse = (log) => {
    const tw = (log.find(r => r.layer === 'rules-out') || {}).t; const tp = (log.find(r => r.fxPrint) || {}).t; const tf = (log.find(r => r.printed && r.t > (tp || 0) && !r.fxPrint) || {}).t;
    const win = log.filter(r => r.t >= tw && r.t < tf);
    return { writeAt: tw, printStartAt: tp, printedAt: tf,
      finishedPassBeforePrinted: win.filter(r => r.passCls && !/unprinted|printing/.test(r.passCls)).length,
      stubVisibleBeforePrintStart: win.filter(r => r.t < tp && /stubp:(?!0\/|0\.0)/.test(r.pieces)).length,
      stubHitTearBeforePrinted: win.filter(r => r.stubHit === 'tear').length,
      enabledBtnsBeforePrinted: [...new Set(win.flatMap(r => (r.btns.match(/\S+\[ON\]/g) || [])))],
      tearHintBeforePrinted: win.filter(r => r.tearHint).length,
      noteBeforePrinted: [...new Set(win.map(r => r.note))], noteAfter: (log.find(r => r.t >= tf) || {}).note,
      btnsAfter: (log.find(r => r.t >= tf) || {}).btns, hintAfter: (log.find(r => r.t >= tf) || {}).tearHint };
  };
  for (const speed of [1, 0.5]) {
    const { p, errors, I } = await fresh(); await toConfirm(I, p, speed);
    await I(SAMPLER); await I(`${R}.querySelector('.rules [data-act="confirm"]').click()`);
    await p.waitForTimeout(speed === 1 ? 4500 : 8500);
    const log = await I('window.__log'); results['timeline_' + speed + 'x'] = { errors, summary: analyse(log), log, final: await final(I) }; await p.close();
  }
  // real-pointer attacks inside the window: drag the stub area, click 去不了了, click the agreement link
  const pos = async (I, sel) => I(`(()=>{const e=${R}.querySelector('${sel}');if(!e)return null;const r=e.getBoundingClientRect();return {x:r.left+r.width/2,y:r.top+r.height/2,w:r.width,h:r.height};})()`);
  const attacks = [[1, 480], [1, 650], [1, 900], [1, 1050], [0.5, 900], [0.5, 1150], [0.5, 1600], [0.5, 2000]];
  for (const [speed, at] of attacks) {
    const { p, errors, I } = await fresh(); await toConfirm(I, p, speed);
    // remember where the stub / weak button will be (they exist pre-confirm only in the finished state, so use the pass box)
    await I(SAMPLER); await I(`${R}.querySelector('.rules [data-act="confirm"]').click()`); await p.waitForTimeout(at);
    const box = await pos(I, '.pane .pass'); const r = {};
    if (box) { const x = box.x, y = box.y + box.h * 0.38; await p.mouse.move(x, y); await p.mouse.down(); for (let i = 1; i <= 8; i++) { await p.mouse.move(x, y + i * 22, { steps: 2 }); await p.waitForTimeout(25); } r.duringDrag = await I(`JSON.stringify(${INST}.state.tear)`); await p.mouse.up(); }
    const wk = await pos(I, '.pane .bar2 .weak'); if (wk) { await p.mouse.click(wk.x, wk.y); }
    r.sheetAfterWeakClick = await I(`(${INST}.state.sheet||{}).kind||null`);
    r.layerAfter = await I(`(${INST}.state.detail||{}).layer||null`);
    await p.waitForTimeout(speed === 1 ? 4000 : 8000);
    r.final = await final(I); const log = await I('window.__log'); r.summary = analyse(log); r.errors = errors;
    results['attack_' + speed + 'x_' + at] = r; await p.close();
  }
  // reduced motion: confirm → immediate printed pass
  { const { p, errors, I } = await fresh(); await toConfirm(I, p, 1, true); await I(SAMPLER); await I(`${R}.querySelector('.rules [data-act="confirm"]').click()`); await p.waitForTimeout(1500);
    const log = await I('window.__log'); results.rm_confirm = { errors, summary: analyse(log), log, final: await final(I) }; await p.close(); }
  fs.writeFileSync(OUT, JSON.stringify(results, null, 1));
  const brief = {}; for (const k in results) { brief[k] = Object.assign({}, results[k]); delete brief[k].log; }
  console.log(JSON.stringify(brief, null, 1)); await b.close();
})();

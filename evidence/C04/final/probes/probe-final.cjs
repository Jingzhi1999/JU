// C04 final probes: confirm→formed print timeline (1x / 0.5x), early-drag race, RM undo window + toast durations.
const { chromium } = require('/opt/node-tools/node_modules/playwright');
const fs = require('fs'); const path = require('path');
const OUT = process.argv[2];
const SAMPLER = `(() => {
  const host = document.querySelector('.stage-host[data-code="C04"]'); const R = host.shadowRoot;
  const inst = window.JUShell.mounts.stage['stage:C04:'].instance;
  window.__t0 = performance.now(); window.__log = []; let last = '';
  const tick = () => {
    const s = inst.state; const d = s.detail || {};
    const pass = R.querySelector('.pane .pass'); const weak = R.querySelector('.pane .ph button.weak, .pane button.weak[data-act="exit"]');
    const hint = R.querySelector('.pane .help'); const note = [...R.querySelectorAll('.pane .sh .n, .pane .pnote, .pane .note')].map(e=>e.textContent).join('|');
    const stub = R.querySelector('.pane .pass .piece.stubp'); const stubOp = stub ? getComputedStyle(stub).opacity : '-';
    const undo = R.querySelector('.undo'); const toast = R.querySelector('.toast');
    const sig = JSON.stringify({ layer: d.layer || null, printed: d.printed, print: !!(s.fx && s.fx.print), busy: s.busy || '', passCls: pass ? pass.className.replace(/\\s+/g,' ').trim() : null, stubOpacity: stubOp, weak: weak ? (weak.textContent + (weak.disabled ? ' [disabled]' : ' [ENABLED]')) : null, hint: hint ? hint.textContent : null, undo: !!undo, toast: toast ? toast.textContent : null, copied: s.copied || '' });
    if (sig !== last) { last = sig; window.__log.push(Object.assign({ t: Math.round(performance.now() - window.__t0) }, JSON.parse(sig))); }
    window.__raf = requestAnimationFrame(tick);
  }; tick();
})()`;
(async () => {
  const b = await chromium.launch(); const results = {};
  const fresh = async () => {
    const p = await b.newPage({ viewport: { width: 1000, height: 1000 } }); const errors = [];
    p.on('pageerror', e => errors.push(e.message)); p.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
    await p.goto('file://' + path.resolve(process.env.JU_STANDALONE) + '#concept/C04'); await p.waitForTimeout(800);
    const I = (js) => p.evaluate(js);
    return { p, errors, I };
  };
  const R = `document.querySelector('.stage-host[data-code="C04"]').shadowRoot`; const INST = `window.JUShell.mounts.stage['stage:C04:'].instance`;
  const toConfirm = async (I, p, speed) => {
    await I(`${INST}.setSpeed(${speed})`); await I(`${INST}.jumpTo('j-d-invited')`); await p.waitForTimeout(1200);
    await I(`${R}.querySelector('.acts [data-act="rules"]').click()`); await p.waitForTimeout(900 / speed);
    await I(`(()=>{const e=${R}.querySelector('.rules .rs'); e.scrollTop=99999; e.dispatchEvent(new Event('scroll'));})()`); await p.waitForTimeout(300);
  };
  // 1) confirm → formed timeline at 1x and 0.5x
  for (const speed of [1, 0.5]) {
    const { p, errors, I } = await fresh(); await toConfirm(I, p, speed);
    await I(SAMPLER); await I(`${R}.querySelector('.rules [data-act="confirm"]').click()`);
    await p.waitForTimeout(speed === 1 ? 4200 : 8000);
    const log = await I('window.__log'); await I('cancelAnimationFrame(window.__raf)');
    const tw = (log.find(r => r.layer === 'rules-out') || {}).t, tf = (log.find(r => r.printed && r.t > tw) || {}).t;
    results['confirm_' + speed + 'x'] = { errors, timeline: log, finishedPassBeforePrint: log.filter(r => r.passCls && !/printing|unprinted/.test(r.passCls) && r.t < tf).length, enabledExitBeforePrinted: log.filter(r => r.t >= tw && r.t < tf && r.weak && /ENABLED/.test(r.weak)).length };
    await p.close();
  }
  // 2) early drag on the stub during the reveal window (0.5x, ~1.15s after confirm — the verify-r1 race)
  {
    const { p, errors, I } = await fresh(); await toConfirm(I, p, 0.5);
    await I(SAMPLER); await I(`${R}.querySelector('.rules [data-act="confirm"]').click()`); await p.waitForTimeout(1150);
    const rect = await I(`(()=>{const h=document.querySelector('.stage-host[data-code="C04"]');const e=h.shadowRoot.querySelector('.pane .pass');if(!e)return null;const r=e.getBoundingClientRect();return {x:r.left+r.width/2,y:r.top+r.height*0.85};})()`);
    if (rect) { await p.mouse.move(rect.x, rect.y); await p.mouse.down(); for (let i = 1; i <= 8; i++) { await p.mouse.move(rect.x, rect.y + i * 20); await p.waitForTimeout(30); } await p.mouse.up(); }
    await p.waitForTimeout(7000);
    const st = await I(`(()=>{const i=${INST};const row=i.joinedRow('brunch');return {stage:row&&row.stage,torn:!!(row&&row.ticket&&row.ticket.torn),printed:i.state.detail&&i.state.detail.printed,layer:i.state.detail&&i.state.detail.layer};})()`);
    results.early_drag_0_5x = { errors, dragAt: rect, after7s: st, timeline: await I('window.__log') };
    await p.close();
  }
  // 3) reduced motion: draft undo window + toast/copy dwell (real time)
  {
    const { p, errors, I } = await fresh(); await I(`${INST}.toggleRM()`); await I(`${INST}.jumpTo('h-drafts')`); await p.waitForTimeout(900);
    await I(SAMPLER); await I(`${R}.querySelector('[data-act="delete"]').click()`); await p.waitForTimeout(11500);
    const log = await I('window.__log'); const on = log.find(r => r.undo), off = log.find(r => on && r.t > on.t && !r.undo);
    results.rm_undo_window = { errors, undoShownAt: on && on.t, undoGoneAt: off && off.t, visibleMs: on && off ? off.t - on.t : null, timeline: log };
    await p.close();
  }
  {
    const { p, errors, I } = await fresh(); await I(`${INST}.toggleRM()`); await I(`${INST}.jumpTo('j-d-contact')`); await p.waitForTimeout(1200);
    await I(SAMPLER); await I(`${R}.querySelector('.pane [data-act="copy"]').click()`); await p.waitForTimeout(3500);
    const log = await I('window.__log'); const ton = log.find(r => r.toast), toff = log.find(r => ton && r.t > ton.t && !r.toast); const con = log.find(r => r.copied), coff = log.find(r => con && r.t > con.t && !r.copied);
    results.rm_copy_toast = { errors, toastVisibleMs: ton && toff ? toff.t - ton.t : null, copiedVisibleMs: con && coff ? coff.t - con.t : null, timeline: log };
    await p.close();
  }
  {
    const { p, errors, I } = await fresh(); await I(`${INST}.jumpTo('j-d-contact')`); await p.waitForTimeout(1200);
    await I(SAMPLER); await I(`${R}.querySelector('.pane [data-act="copy"]').click()`); await p.waitForTimeout(3500);
    const log = await I('window.__log'); const ton = log.find(r => r.toast), toff = log.find(r => ton && r.t > ton.t && !r.toast); const con = log.find(r => r.copied), coff = log.find(r => con && r.t > con.t && !r.copied);
    results.copy_toast_1x = { errors, toastVisibleMs: ton && toff ? toff.t - ton.t : null, copiedVisibleMs: con && coff ? coff.t - con.t : null };
    await p.close();
  }
  fs.writeFileSync(path.join(OUT, 'probes.json'), JSON.stringify(results, null, 1));
  const brief = {}; for (const k in results) { const r = results[k]; brief[k] = Object.assign({}, r); delete brief[k].timeline; }
  console.log(JSON.stringify(brief, null, 1));
  await b.close();
})();

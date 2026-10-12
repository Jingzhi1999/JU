// C01 final-verify probe (independent reviewer). Measures, from the DOM, under 减少动态 ON and OFF:
//  undo bar dwell + undo restore; toast dwell (4 different receipts) + 「已复制」 label; time-to-result for print, tear, accept-reschedule, cancel burn.
// usage: JU_STANDALONE=<build> node rm-probe.cjs <out.json>
const { chromium } = require('/opt/node-tools/node_modules/playwright');
const path = require('path'); const fs = require('fs');
const file = path.resolve(process.env.JU_STANDALONE); const out = process.argv[2];
const sleep = ms => new Promise(r => setTimeout(r, ms));
(async () => {
  const b = await chromium.launch(); const res = {};
  for (const rm of [true, false]) {
    const p = await b.newPage({ viewport: { width: 1000, height: 1000 } }); const errors = [];
    p.on('pageerror', e => errors.push(e.message)); p.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
    await p.goto('file://' + file + '#concept/C01'); await p.waitForTimeout(1200);
    const E = (js, arg) => p.evaluate(([js, arg]) => { const m = window.JUShell.mounts.stage['stage:C01:']; return (new Function('root', 'inst', 'arg', js))(m.root, m.instance, arg); }, [js, arg]);
    // helpers installed in page
    await E(`window.__c01 = {
      phone: () => root.querySelector('.ju-phone').getBoundingClientRect(),
      shown: (sel) => { const ph = root.querySelector('.ju-phone').getBoundingClientRect(); return [...root.querySelectorAll(sel)].some(x => { const r = x.getBoundingClientRect(); if (!r.width || !r.height) return false; const cs = getComputedStyle(x); if (cs.visibility === 'hidden' || +cs.opacity < 0.5) return false; return r.bottom > ph.top + 4 && r.top < ph.bottom - 4 && r.right > ph.left && r.left < ph.right; }); },
      toastOnScreen: () => { const t = root.querySelector('.c01-toast'); if (!t) return false; const ph = root.querySelector('.ju-phone').getBoundingClientRect(); const r = t.getBoundingClientRect(); return t.classList.contains('in') && r.top < ph.bottom - 40 && r.bottom <= ph.bottom + 1; },
      toastText: () => { const t = root.querySelector('.c01-toast'); return t ? t.textContent.trim() : ''; }
    }; return true;`);
    const o = { rm };
    if (rm) await E('inst.toggleRM()'); await sleep(200);
    o.rmState = await E('return !!inst.state.review.rm');
    const settle = rm ? 500 : 1800;
    // ---- A. draft undo window (let it expire) ----
    await E(`inst.jumpTo('h-drafts')`); await sleep(settle);
    o.draftsBefore = await E(`return [...root.querySelectorAll('.c01-feed .c01-row[data-rid] h3')].map(h => h.textContent.trim())`);
    o.engineDraftsBefore = await E(`return JSON.stringify(Object.keys(inst.state.data)).slice(0,300)`);
    await E(`root.querySelector('.c01-feed [data-act="delete"]').click()`); let t0 = Date.now(); let seen = null, last = null, gone = null;
    while (Date.now() - t0 < 13000) { const v = await E(`return __c01.shown('[data-act="undo"]')`); const el = Date.now() - t0; if (v) { if (seen == null) seen = el; last = el; } else if (seen != null && gone == null) { gone = el; break; } await sleep(100); }
    o.undoFirstSeenMs = seen; o.undoLastSeenMs = last; o.undoGoneMs = gone; o.undoUpMs = gone != null && seen != null ? gone - seen : null;
    o.draftsAfterExpiry = await E(`return [...root.querySelectorAll('.c01-feed .c01-row[data-rid] h3')].map(h => h.textContent.trim())`);
    // ---- A2. undo at ~8.6 s restores ----
    await E(`inst.jumpTo('h-drafts')`); await sleep(settle);
    const before2 = await E(`return [...root.querySelectorAll('.c01-feed .c01-row[data-rid] h3')].map(h => h.textContent.trim())`);
    await E(`root.querySelector('.c01-feed [data-act="delete"]').click()`); t0 = Date.now();
    await sleep(400); o.draftsDuringUndo = await E(`return [...root.querySelectorAll('.c01-feed .c01-row[data-rid] h3')].map(h => h.textContent.trim())`);
    while (Date.now() - t0 < 8600) await sleep(50);
    o.undoVisibleAtMs = Date.now() - t0; o.undoVisibleAt8600 = await E(`return __c01.shown('[data-act="undo"]')`);
    await E(`root.querySelector('[data-act="undo"]').click()`); const tu = Date.now();
    let restoredAt = null; while (Date.now() - tu < 3000) { const now = await E(`return [...root.querySelectorAll('.c01-feed .c01-row[data-rid] h3')].map(h => h.textContent.trim())`); if (JSON.stringify(now) === JSON.stringify(before2) && await E(`return __c01.shown('.c01-feed .c01-row[data-rid]')`)) { restoredAt = Date.now() - tu; break; } await sleep(30); }
    o.undoRestoredAfterMs = restoredAt; await sleep(11000 - (Date.now() - tu) > 0 ? 3000 : 0);
    // wait past the original 10 s window to prove no late commit
    while (Date.now() - t0 < 11500) await sleep(100);
    o.draftsAfter11s = await E(`return [...root.querySelectorAll('.c01-feed .c01-row[data-rid] h3')].map(h => h.textContent.trim())`); o.draftsBefore2 = before2;
    o.undoBarAfterRestore = await E(`return __c01.shown('[data-act="undo"]')`);
    // ---- B. toasts ----
    const toastRun = async (label, prep, trigger) => {
      await prep(); const tt = Date.now(); await trigger(); let on = null, off = null, text = '', samples = 0, onScreenSamples = 0;
      while (Date.now() - tt < 6000) { const s = await E(`return [__c01.toastOnScreen(), __c01.toastText()]`); const el = Date.now() - tt; samples++; if (s[0]) { onScreenSamples++; if (on == null) { on = el; text = s[1]; } } else if (on != null && off == null) { off = el; break; } await sleep(50); }
      return { label, text, appearMs: on, goneMs: off, upMs: on != null && off != null ? off - on : null };
    };
    o.toasts = [];
    // copy (also measures 已复制 label)
    await E(`inst.jumpTo('j-d-contact')`); await sleep(rm ? 600 : 4200);
    { await E(`window.__cp = root.querySelector('.c01-over [data-act="copy"]'); window.__cp.click()`); const tt = Date.now(); let on = null, off = null, lab0 = null, labOff = null;
      while (Date.now() - tt < 6000) { const s = await E(`const c = root.querySelector('.c01-over [data-act="copy"]'); return [__c01.toastOnScreen(), __c01.toastText(), c ? c.textContent.trim() : '']`); const el = Date.now() - tt; if (lab0 == null) lab0 = s[2]; if (s[0] && on == null) on = el; if (!s[0] && on != null && off == null) off = el; if (labOff == null && s[2] !== '已复制' && el > 100) labOff = el; if (off != null && labOff != null) break; await sleep(50); }
      o.toasts.push({ label: 'copy', text: '微信号已复制', appearMs: on, goneMs: off, upMs: on != null && off != null ? off - on : null }); o.copiedLabelFirst = lab0; o.copiedLabelGoneMs = labOff; }
    await sleep(500);
    o.toasts.push(await toastRun('contacted', async () => { await E(`inst.jumpTo('j-d-contact')`); await sleep(rm ? 600 : 4200); }, async () => { await E(`root.querySelector('.c01-over [data-act="contacted"]').click()`); }));
    o.toasts.push(await toastRun('end', async () => { await E(`inst.jumpTo('h-m-end')`); await sleep(rm ? 600 : 1800); }, async () => { await E(`root.querySelector('.c01-slip [data-act="end"]').click()`); }));
    // ---- C. print on first open (j-home → r-run3k) ----
    await E(`inst.jumpTo('j-home')`); await sleep(settle);
    await E(`root.querySelector('.c01-feed [data-rid="r-run3k"]').click()`); let tp = Date.now(); let tkReady = null, tailReady = null, phases = [];
    while (Date.now() - tp < 6000) { const s = await E(`const v = inst.state.view; return [v.tickets && v.tickets.main ? v.tickets.main.phase : null, v.tailPhase, v.phase]`); const el = Date.now() - tp; if (!phases.length || phases[phases.length - 1].s !== s.join('/')) phases.push({ t: el, s: s.join('/') }); if (tkReady == null && s[0] === 'ready') tkReady = el; if (tailReady == null && s[1] === 'ready') { tailReady = el; break; } await sleep(20); }
    o.print = { ticketReadyMs: tkReady, tailReadyMs: tailReady, phases: phases.slice(0, 20) };
    await sleep(300);
    o.print.contentOk = await E(`const o = root.querySelector('.c01-over'); const t = o ? o.innerText : ''; return { hasTicket: __c01.shown('.c01-over [data-tk="main"] .c01-side.stub'), hasMembers: /同局的/.test(t), stubHint: /撕/.test(t) }`);
    // ---- D. tear (drag the stub) ----
    const sr = await E(`const s = root.querySelector('.c01-over [data-tk="main"] .c01-side.stub'); s.scrollIntoView({block:'nearest'}); const r = s.getBoundingClientRect(); return { x: r.left, y: r.top, w: r.width, h: r.height }`);
    await sleep(rm ? 100 : 500);
    const sr2 = await E(`const r = root.querySelector('.c01-over [data-tk="main"] .c01-side.stub').getBoundingClientRect(); return { x: r.left, y: r.top, w: r.width, h: r.height }`);
    const fx = sr2.x + sr2.w - 30, fy = sr2.y + sr2.h - 30; await p.mouse.move(fx, fy); await p.mouse.down();
    for (let i = 1; i <= 8; i++) { await p.mouse.move(fx - 140 * i / 8, fy + 120 * i / 8, { steps: 2 }); await sleep(40); }
    await p.mouse.up(); const tt0 = Date.now(); let torn = null, contact = null, tray = null;
    while (Date.now() - tt0 < 6000) { const s = await E(`const v = inst.state.view; const t = v.tickets.main; return [!!t.torn, !!v.contact, inst.state.pile.length]`); const el = Date.now() - tt0; if (torn == null && s[0]) torn = el; if (contact == null && s[1]) contact = el; if (tray == null && s[2] > 0) tray = el; if (torn != null && contact != null) break; await sleep(20); }
    await sleep(rm ? 200 : 1500);
    o.tear = { tornMs: torn, contactMs: contact, trayMs: tray, content: await E(`const t = root.querySelector('.c01-over').innerText; return { contactLayer: /联系局主|微信/.test(t), copy: !!root.querySelector('.c01-over [data-act="copy"]'), stubGone: !root.querySelector('.c01-over [data-tk="main"] .c01-side.stub'), trayText: (root.innerText.match(/存根\\s*\\d+/) || [''])[0] }`) };
    // ---- E. accept reschedule (tear the fresh ticket) → toast ----
    await E(`inst.jumpTo('j-d-reschedule')`); await sleep(rm ? 600 : 4500);
    const fr = await E(`const s = root.querySelector('.c01-over [data-tk="fresh"] .c01-side.stub'); if (!s) return null; s.scrollIntoView({block:'nearest'}); const r = s.getBoundingClientRect(); return { x: r.left, y: r.top, w: r.width, h: r.height }`);
    if (fr) { await sleep(300); const f2 = await E(`const r = root.querySelector('.c01-over [data-tk="fresh"] .c01-side.stub').getBoundingClientRect(); return { x: r.left, y: r.top, w: r.width, h: r.height }`);
      const ax = f2.x + f2.w - 30, ay = f2.y + f2.h - 30; await p.mouse.move(ax, ay); await p.mouse.down(); for (let i = 1; i <= 8; i++) { await p.mouse.move(ax - 140 * i / 8, ay + 120 * i / 8, { steps: 2 }); await sleep(40); }
      const tt = Date.now(); await p.mouse.up(); let on = null, off = null, text = '', torn2 = null;
      while (Date.now() - tt < 8000) { const s = await E(`return [__c01.toastOnScreen(), __c01.toastText(), !!(inst.state.view.tickets.fresh||{}).torn]`); const el = Date.now() - tt; if (torn2 == null && s[2]) torn2 = el; if (s[0] && on == null) { on = el; text = s[1]; } if (!s[0] && on != null && off == null) { off = el; break; } await sleep(50); }
      o.toasts.push({ label: 'acceptReschedule', text, appearMs: on, goneMs: off, upMs: on != null && off != null ? off - on : null, freshTornMs: torn2 });
      o.acceptOldVoided = await E(`return !!(inst.state.view.tickets.old||{}).voided`);
    } else o.toasts.push({ label: 'acceptReschedule', error: 'no fresh stub' });
    // ---- F. cancel destruction ----
    await E(`inst.jumpTo('h-m-cancel')`); await sleep(rm ? 600 : 1800);
    await E(`root.querySelector('.c01-slip [data-act="cancel"]').click()`); const tc = Date.now(); let burntAt = null, slipGone = null, statusAt = null, ph = [];
    while (Date.now() - tc < 9000) { const s = await E(`const v = inst.state.view; const ov = root.querySelector('.c01-over'); const t = ov ? ov.innerText : ''; return [v.slip || '', !!v.charred, !!v.charSeq, inst.state.ashFx ? 1 : 0, /已取消/.test(t), inst.state.busy || '']`); const el = Date.now() - tc; const k = s.join('/'); if (!ph.length || ph[ph.length - 1].s !== k) ph.push({ t: el, s: k }); if (slipGone == null && !s[0]) slipGone = el; if (statusAt == null && s[4]) statusAt = el; if (burntAt == null && s[1] && !s[2] && !s[3] && !s[5] && el > 0) burntAt = el; if (burntAt != null && slipGone != null && statusAt != null) break; await sleep(20); }
    await sleep(rm ? 200 : 600);
    o.cancel = { slipGoneMs: slipGone, cancelledTextMs: statusAt, burnDoneMs: burntAt, phases: ph.slice(0, 20), content: await E(`const t = root.querySelector('.c01-over').innerText; return { cancelled: /已取消/.test(t), charStrip: __c01.shown('.c01-over .c01-char, .c01-over .charred, .c01-over [class*="char"]'), snippet: t.replace(/\\s+/g,' ').slice(0, 260) }`) };
    r = o; r.errors = errors; res[rm ? 'rmOn' : 'rmOff'] = r; await p.close();
  }
  fs.writeFileSync(out, JSON.stringify(res, null, 1)); console.log(JSON.stringify(res, null, 1)); await b.close();
})();
var r;

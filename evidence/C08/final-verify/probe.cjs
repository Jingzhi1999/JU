// C08 final-verify timing probe (independent reviewer). Samples the live DOM + instance state, under 减少动态 ON and OFF:
//  A  draft undo window (bar first/last seen, visible at 800 ms, drain duration + scaleX at 5 s, commit after expiry)
//  A2 undo at ~8.6 s restores the row; no late commit at 11.5 s
//  A3 undo window survives a header role switch with a pane open (closePanesThen re-arm)
//  B  toasts: copy (+ 已复制 label), 改时间 propose, 接受改期 (tear the new ticket), partial-undo notice
//  C  landed ring after detail → back
//  D/E/F time-to-result for print (first open of r-run3k), tear (drag stub), cancel destruction (h-m-cancel)
// usage: JU_STANDALONE=<build> node probe.cjs <out.json>
const { chromium } = require('/opt/node-tools/node_modules/playwright');
const path = require('path'); const fs = require('fs');
const file = path.resolve(process.env.JU_STANDALONE); const out = process.argv[2];
const sleep = ms => new Promise(r => setTimeout(r, ms));
(async () => {
  const b = await chromium.launch(); const res = {};
  for (const rm of [true, false]) {
    const p = await b.newPage({ viewport: { width: 1000, height: 1000 } }); const errors = [];
    p.on('pageerror', e => errors.push(e.message)); p.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
    await p.goto('file://' + file + '#concept/C08'); await p.waitForTimeout(1200);
    const E = (js, arg) => p.evaluate(([js, arg]) => { const m = window.JUShell.mounts.stage['stage:C08:']; return (new Function('root', 'inst', 'arg', js))(m.root, m.instance, arg); }, [js, arg]);
    await E(`window.__c = {
      ph: () => root.querySelector('.ju-phone').getBoundingClientRect(),
      vis: (el) => { if (!el) return false; const ph = root.querySelector('.ju-phone').getBoundingClientRect(); const r = el.getBoundingClientRect(); if (!r.width || !r.height) return false; let n = el; while (n && n.nodeType === 1) { const cs = getComputedStyle(n); if (cs.visibility === 'hidden' || cs.display === 'none' || +cs.opacity < 0.5) return false; n = n.parentElement; } return r.bottom > ph.top + 4 && r.top < ph.bottom - 4 && r.right > ph.left && r.left < ph.right; },
      shown: (sel) => [...root.querySelectorAll(sel)].some(x => __c.vis(x)),
      undo: () => { const u = root.querySelector('.c08-undo'); return __c.vis(u); },
      toast: () => { const t = root.querySelector('.c08-toast'); return t && t.classList.contains('in') && __c.vis(t) ? t.textContent.trim() : ''; },
      stubPt: () => { const s = [...root.querySelectorAll('.c08-pane [data-act="tear"]')].filter(x => __c.vis(x)).pop(); if (!s) return null; const r = s.getBoundingClientRect(); const sr = root.getRootNode(); for (let fx = 0.9; fx > 0.5; fx -= 0.04) { const x = r.left + r.width * fx, y = r.top + r.height * 0.5; const e = sr.elementFromPoint(x, y); if (e && (e === s || s.contains(e))) return { x, y, fx: +fx.toFixed(2) }; } return null; },
      rows: () => [...root.querySelectorAll('.c08-blk[data-rid]')].filter(e => __c.vis(e.querySelector('.c08-bk'))).map(e => e.dataset.rid)
    }; return true;`);
    const o = { rm }; if (rm) await E('inst.toggleRM()'); await sleep(200);
    o.rmState = await E('return !!inst.state.review.rm');
    const settle = rm ? 500 : 1500;
    // ---------- A. undo window, let it expire ----------
    await E(`inst.jumpTo('h-drafts')`); await sleep(settle);
    o.A = { rowsBefore: await E('return __c.rows()'), draftsBefore: await E('return inst.state.data.drafts.map(d => d.id)') };
    await E(`root.querySelector('.c08-blk[data-rid="draft-reading"] .c08-del').click()`); let t0 = Date.now(); let seen = null, last = null, gone = null, at800 = null, rowGone = null, drain5 = null, dur = null; const tl = [];
    while (Date.now() - t0 < 13000) {
      const s = await E(`const i = root.querySelector('.c08-undo i'); const cs = i ? getComputedStyle(i, '::after') : null; return { u: __c.undo(), rows: __c.rows(), dur: cs ? cs.animationDuration : null, tf: cs ? cs.transform : null, st: !!inst.state.undo, txt: (root.querySelector('.c08-undo') || {}).textContent || '' }`);
      const el = Date.now() - t0; tl.push([el, s.u ? 1 : 0, s.rows.length]);
      if (rowGone == null && !s.rows.includes('draft-reading')) rowGone = el;
      if (s.u) { if (seen == null) { seen = el; o.A.barText = s.txt; } last = el; dur = s.dur; } else if (seen != null && gone == null) { gone = el; break; }
      if (at800 == null && el >= 800) at800 = { el, visible: s.u, state: s.st };
      if (drain5 == null && el >= 5000 && s.tf) { const m = /matrix\(([-\d.e]+)/.exec(s.tf); drain5 = { el, scaleX: m ? +(+m[1]).toFixed(3) : s.tf }; }
      await sleep(100);
    }
    Object.assign(o.A, { rowGoneMs: rowGone, barFirstMs: seen, barLastMs: last, barGoneMs: gone, at800, drainDuration: dur, drainAt5s: drain5 });
    await sleep(300); o.A.draftsAfterExpiry = await E('return inst.state.data.drafts.map(d => d.id)'); o.A.rowsAfterExpiry = await E('return __c.rows()');
    // ---------- A2. undo at ~8.6 s ----------
    await E(`inst.jumpTo('h-drafts')`); await sleep(settle);
    await E(`root.querySelector('.c08-blk[data-rid="draft-reading"] .c08-del').click()`); t0 = Date.now();
    while (Date.now() - t0 < 8600) await sleep(50);
    o.A2 = { atMs: Date.now() - t0, barVisible: await E('return __c.undo()'), rowsDuring: await E('return __c.rows()') };
    await E(`root.querySelector('.c08-undo [data-act="undo"]').click()`); const tu = Date.now(); let restored = null;
    while (Date.now() - tu < 3000) { if ((await E('return __c.rows()')).includes('draft-reading')) { restored = Date.now() - tu; break; } await sleep(30); }
    o.A2.restoredAfterMs = restored; while (Date.now() - t0 < 11500) await sleep(100);
    o.A2.at11500 = { rows: await E('return __c.rows()'), drafts: await E('return inst.state.data.drafts.map(d => d.id)'), bar: await E('return __c.undo()'), errText: await E(`return (root.querySelector('.c08-err') || {}).textContent || ''`) };
    // ---------- A3. undo window across a role switch with a pane open ----------
    await E(`inst.jumpTo('h-drafts-many')`); await sleep(settle);
    const many = await E('return __c.rows()'); o.A3 = { rowsBefore: many };
    await E(`root.querySelector('.c08-blk[data-rid="${many[0]}"] .c08-del').click()`); t0 = Date.now(); await sleep(rm ? 300 : 900);
    await E(`root.querySelector('.c08-blk[data-rid="${many[1]}"] .c08-bk-main').click()`); await sleep(rm ? 300 : 900);
    o.A3.paneOpen = await E('return !!inst.state.draftView'); o.A3.barWithPane = await E('return __c.undo()');
    while (Date.now() - t0 < 2500) await sleep(50);
    await E(`[...root.querySelectorAll('.c08-role button')].find(x => x.textContent.trim().startsWith('参加')).click()`); const tsw = Date.now() - t0;
    let l3 = null, g3 = null; while (Date.now() - t0 < 12500) { const u = await E('return !!inst.state.undo'); const el = Date.now() - t0; if (u) l3 = el; else if (g3 == null) { g3 = el; break; } await sleep(100); }
    Object.assign(o.A3, { switchAtMs: tsw, role: await E('return inst.state.role'), undoStateLastMs: l3, undoStateGoneMs: g3 });
    // ---------- B. toasts ----------
    const toastWatch = async (labelSel) => { const tt = Date.now(); let on = null, off = null, text = '', lab0 = null, labOff = null;
      while (Date.now() - tt < 7000) { const s = await E(`return [__c.toast(), arg ? ((root.querySelector(arg) || {}).textContent || '').trim() : '']`, labelSel || ''); const el = Date.now() - tt;
        if (s[0] && on == null) { on = el; text = s[0]; } if (!s[0] && on != null && off == null) off = el;
        if (labelSel) { if (lab0 == null) lab0 = s[1]; if (labOff == null && el > 60 && s[1] !== '已复制') labOff = el; }
        if (off != null && (!labelSel || labOff != null)) break; await sleep(50); }
      return { text, appearMs: on, goneMs: off, upMs: on != null && off != null ? off - on : null, label0: lab0, labelGoneMs: labOff }; };
    o.B = {};
    await E(`inst.jumpTo('j-d-contact')`); await sleep(rm ? 700 : 2500);
    await E(`root.querySelector('.c08-pane [data-act="copy"]').click()`); o.B.copy = await toastWatch('.c08-pane [data-act="copy"]');
    await E(`inst.jumpTo('h-m-reschedule')`); await sleep(rm ? 700 : 1800);
    await E(`inst.setState(s => ({ resched: Object.assign({}, s.resched, { time: '20:30', touched: true }) }))`); await sleep(100);
    o.B.proposeEnabled = await E(`const b = root.querySelector('.c08-drawer [data-act="propose"]'); return b && !b.disabled`);
    await E(`root.querySelector('.c08-drawer [data-act="propose"]').click()`); o.B.propose = await toastWatch();
    // accept reschedule: tear the new ticket's stub
    await E(`inst.jumpTo('j-d-reschedule')`); await sleep(rm ? 900 : 3500);
    await E(`const s = [...root.querySelectorAll('.c08-pane [data-act="tear"]')].filter(x => __c.vis(x)).pop(); if (s) s.scrollIntoView({ block: 'nearest' })`); await sleep(rm ? 150 : 500);
    const stub = await E('return __c.stubPt()');
    o.B.rStub = stub;
    if (stub) { await p.mouse.move(stub.x, stub.y); await p.mouse.down(); for (let i = 1; i <= 8; i++) { await p.mouse.move(stub.x + 150 * i / 8, stub.y + 20 * i / 8, { steps: 2 }); await sleep(40); } await p.mouse.up();
      const ta = Date.now(); let tor = null; while (Date.now() - ta < 6000) { if (await E('return __c.toast()')) break; await sleep(30); } tor = Date.now() - ta; o.B.acceptToastStartMs = tor; o.B.accept = await toastWatch(); o.B.accept.appearMs = tor; }
    // partial-undo notice (delete two, undo)
    await E(`inst.jumpTo('h-drafts-many')`); await sleep(settle);
    const m2 = await E('return __c.rows()');
    await E(`root.querySelector('.c08-blk[data-rid="${m2[0]}"] .c08-del').click()`); await sleep(rm ? 150 : 700);
    await E(`root.querySelector('.c08-blk[data-rid="${m2[1]}"] .c08-del').click()`); await sleep(rm ? 300 : 900);
    o.B.batchBar = await E(`return (root.querySelector('.c08-undo') || {}).textContent || ''`);
    await E(`root.querySelector('.c08-undo [data-act="undo"]').click()`); o.B.partialUndo = await toastWatch();
    // ---------- C. landed ring after back ----------
    await E(`inst.jumpTo('j-home')`); await sleep(settle);
    await E(`root.querySelector('.c08-blk[data-rid="brunch"] .c08-bk-main').click()`); await sleep(rm ? 500 : 1500);
    o.C = { paneTitle: await E(`return (root.querySelector('.c08-pane .c08-ptitle') || {}).textContent || ''`) };
    await E(`root.querySelector('.c08-pane [data-act="back"]').click()`); t0 = Date.now(); let lOn = null, lOff = null;
    while (Date.now() - t0 < 4000) { const l = await E(`const e = root.querySelector('.c08-blk.landed'); return !!(e && __c.vis(e))`); const el = Date.now() - t0; if (l && lOn == null) lOn = el; if (!l && lOn != null && lOff == null) { lOff = el; break; } await sleep(50); }
    Object.assign(o.C, { landedOnMs: lOn, landedOffMs: lOff });
    // ---------- D. print ----------
    await E(`inst.jumpTo('j-home')`); await sleep(settle);
    await E(`root.querySelector('.c08-blk[data-rid="run3k"] .c08-bk-main').click()`); let tp = Date.now(); const ph = []; let issued = null;
    while (Date.now() - tp < 6000) { const s = await E(`const d = inst.state.detail; return d ? (d.phase + '/' + d.print) : 'none'`); const el = Date.now() - tp; if (!ph.length || ph[ph.length - 1].s !== s) ph.push({ t: el, s }); if (issued == null && /\/(issued|null)$/.test(s) && ph.some(x => /run/.test(x.s))) { issued = el; } if (issued != null && el > issued + 900) break; await sleep(20); }
    await sleep(200);
    o.D = { issuedMs: issued, phases: ph, title: await E(`return (root.querySelector('.c08-pane .c08-ptitle') || {}).textContent || ''`), hasStub: await E(`return __c.shown('.c08-pane [data-act="tear"]')`), printedV: await E('return JSON.stringify(inst.state.printedV)') };
    // ---------- E. tear ----------
    await E(`const s = [...root.querySelectorAll('.c08-pane [data-act="tear"]')].filter(x => __c.vis(x)).pop(); if (s) s.scrollIntoView({ block: 'nearest' })`); await sleep(rm ? 150 : 500);
    const sp = await E('return __c.stubPt()');
    if (sp) { await p.mouse.move(sp.x, sp.y); await p.mouse.down(); for (let i = 1; i <= 8; i++) { await p.mouse.move(sp.x + 150 * i / 8, sp.y + 20 * i / 8, { steps: 2 }); await sleep(40); } await p.mouse.up(); }
    const te = Date.now(); let torn = null, contact = null;
    while (Date.now() - te < 5000) { const s = await E(`const d = inst.state.detail; const r = JU.derive.rowById(inst.state.data, 'run3k'); return [!!(r && r.ticket && r.ticket.torn), d && d.layer, __c.shown('.c08-pane .c08-contact')]`); const el = Date.now() - te; if (torn == null && s[0]) torn = el; if (contact == null && s[1] === 'contact' && s[2]) contact = el; if (torn != null && contact != null) break; await sleep(20); }
    await sleep(rm ? 200 : 1200);
    o.E = { stubAt: sp, tornMs: torn, contactShownMs: contact, title: await E(`return (root.querySelector('.c08-pane .c08-ptitle') || {}).textContent || ''`), contactText: await E(`return ((root.querySelector('.c08-pane .c08-contact') || {}).innerText || '').replace(/\\s+/g, ' ').slice(0, 120)`), stubGone: await E(`return !__c.shown('.c08-pane [data-act="tear"]')`) };
    // ---------- F. cancel destruction ----------
    await E(`inst.jumpTo('h-m-cancel')`); await sleep(rm ? 700 : 1800);
    await E(`root.querySelector('.c08-drawer [data-act="cancel"]').click()`); const tc = Date.now(); const cph = []; let voidAt = null;
    while (Date.now() - tc < 8000) { const s = await E(`const m = inst.state.manage; return m ? String(m.cstage) + '|sheet:' + (inst.state.sheet ? inst.state.sheet.cls || 'on' : '-') : 'none'`); const el = Date.now() - tc; if (!cph.length || cph[cph.length - 1].s !== s) cph.push({ t: el, s }); if (voidAt == null && /^void\|sheet:-/.test(s)) { voidAt = el; } if (voidAt != null && el > voidAt + 300) break; await sleep(20); }
    await sleep(300);
    o.F = { voidMs: voidAt, phases: cph, paneText: await E(`return ((root.querySelector('.c08-pane .c08-pbody') || {}).innerText || '').replace(/\\s+/g, ' ').slice(0, 260)`), eventStatus: await E(`const m = JU.derive.manage(inst.state.data, inst.state.manage.id); return m && (m.status || m.stage || m.key || JSON.stringify(Object.keys(m)).slice(0, 120))`) };
    o.errors = errors; res[rm ? 'rmOn' : 'rmOff'] = o; await p.close();
  }
  fs.writeFileSync(out, JSON.stringify(res, null, 1)); console.log(JSON.stringify(res, null, 1)); await b.close();
})();

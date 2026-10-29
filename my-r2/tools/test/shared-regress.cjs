// Shared-layer regression for the lead's fixes after the C04 / C06 stage-1 reviews (2026-10-23), on the C00 wiring reference:
// torn ticket opened from home is 'torn' (not 'fresh'); home() one level deep runs the exit phase like back(); the exiting
// surface keeps its last model (no text swap mid-exit); jumpTo resets every list to the top; the first visit of the other role starts at
// the top (C02 verify); a receipt never repeats its title.
// Usage: JU_STANDALONE=/home/user/JU/.build/lead-C00.html node my-r2/tools/test/shared-regress.cjs [CODE]
const L = require('../_lib.cjs');
const CODE = process.argv[2] || 'C00';
let fails = 0, passes = 0; const ok = (n, c, x) => { if (c) passes++; else { fails++; console.log('FAIL', n, x == null ? '' : JSON.stringify(x)); } };
(async () => {
  const { b, p, errors } = await L.launch({ viewport: { width: 1000, height: 1000 } });
  await L.openConcept(p, L.fileFor(CODE), CODE);
  await L.E(p, CODE, 'if (window.JU && JU.shared && JU.shared.skins && inst.envRef && inst.envRef.current) JU.shared.skins.pause(inst.envRef.current);');
  const idle = async () => { for (let i = 0; i < 60; i++) { if (await L.E(p, CODE, "return inst.state.nav.phase === 'idle'")) return true; await p.waitForTimeout(80); } return false; };
  /* 1. torn ticket entered by navigation (not by index jump) */
  await L.jump(p, CODE, 'j-home', 500);
  await L.E(p, CODE, "inst.go('ticket', { eventId: 'coffee' })"); await idle(); await p.waitForTimeout(300);
  const t1 = await L.E(p, CODE, 'var t = inst.ctlVals().ticket; return { on: t.on, state: t.state, printing: t.printing }');
  ok('torn ticket opened from home is state torn (no reprint, contact available)', t1.on && t1.state === 'torn' && !t1.printing, t1);
  /* 2. exit keeps the last model; 3. home() one level deep animates */
  const before = await L.E(p, CODE, 'var t = inst.ctlVals().ticket; return { title: t.title, state: t.state, eventId: t.eventId }');
  await L.E(p, CODE, 'inst.ctlVals().nav.back()');
  const during = await L.E(p, CODE, "var c = inst.ctlVals(); return { phase: inst.state.nav.phase, on: c.ticket.on, leaving: !!c.ticket.leaving, title: c.ticket.title, state: c.ticket.state, eventId: c.ticket.eventId }");
  ok('during the exit phase the leaving ticket keeps its last model (leaving:true, same title / state)', during.phase === 'exit' && during.leaving && during.title === before.title && during.state === before.state && during.eventId === before.eventId, { before, during });
  await idle();
  await L.E(p, CODE, "inst.go('detail', { eventId: 'theater' })"); await idle();
  await L.E(p, CODE, 'inst.home()');
  const h = await L.E(p, CODE, 'return { phase: inst.state.nav.phase, depth: inst.state.nav.stack.length }');
  ok('home() one level deep runs the exit phase (like back)', h.phase === 'exit' && h.depth === 2, h);
  await idle();
  const h2 = await L.E(p, CODE, 'return { phase: inst.state.nav.phase, depth: inst.state.nav.stack.length, s: inst.state.nav.stack[0].s }');
  ok('…and settles on home', h2.phase === 'idle' && h2.depth === 1 && h2.s === 'home', h2);
  /* 4. jumpTo resets every list */
  await L.jump(p, CODE, 'j-many', 600);
  const sc = await L.E(p, CODE, "var el = root.querySelector('[data-scroller^=\"home\"]') || root.querySelector('[data-scroller]'); if (!el) return null; el.scrollTop = 400; return { name: el.getAttribute('data-scroller'), top: el.scrollTop }");
  await L.jump(p, CODE, 'j-many', 600);
  const sc2 = sc ? await L.E(p, CODE, "var el = root.querySelector('[data-scroller=\"' + a + '\"]'); return el ? el.scrollTop : null", sc.name) : null;
  ok('jumpTo puts every list back at the top', sc && sc.top > 0 && sc2 === 0, { sc, sc2 });
  /* 4b. the first visit of the other role starts at the top (C02 verify m3: it kept the joined list's offset) */
  await L.jump(p, CODE, 'j-many', 600);
  const rs0 = await L.E(p, CODE, "var el = root.querySelector('[data-scroller=\"home\"]'); if (!el) return null; el.scrollTop = 300; el.dispatchEvent(new Event('scroll')); return el.scrollTop");
  await L.E(p, CODE, "inst.setRole('hosted')"); await idle(); await p.waitForTimeout(200);
  const rs1 = await L.E(p, CODE, "var el = root.querySelector('[data-scroller=\"home\"]'); return el ? el.scrollTop : null");
  await L.E(p, CODE, "inst.setRole('joined')"); await idle(); await p.waitForTimeout(200);
  const rs2 = await L.E(p, CODE, "var el = root.querySelector('[data-scroller=\"home\"]'); return el ? el.scrollTop : null");
  ok('first visit of the other role starts at the top; coming back restores the first role\'s offset', rs0 > 0 && rs1 === 0 && Math.abs(rs2 - rs0) < 2, { rs0, rs1, rs2 });
  /* 4c. an expired reservation cannot be confirmed (C01 verify B1: it formed the event and printed a ticket) */
  const ex = await L.E(p, CODE, "var d = JSON.parse(JSON.stringify(inst.state.data)); var it = d.joined.filter(function (x) { return x.eventId === 'brunch'; })[0]; if (!it) return null; var a = JSON.parse(JSON.stringify(d)); a.joined.filter(function (x) { return x.eventId === 'brunch'; })[0].stage = 'expired'; var b = JSON.parse(JSON.stringify(d)); var ib = b.joined.filter(function (x) { return x.eventId === 'brunch'; })[0]; ib.members.forEach(function (m) { if (m.you) m.deadline = JU.now() - 1000; }); ib.deadline = JU.now() - 1000; var c = JSON.parse(JSON.stringify(d)); return { stageExpired: JU.engine.confirmReservation(a, { eventId: 'brunch' }).effect.type, deadlinePast: JU.engine.confirmReservation(b, { eventId: 'brunch' }).effect.type, live: JU.engine.confirmReservation(c, { eventId: 'brunch' }).effect.type };");
  ok('confirming an expired reservation is refused (stage expired / deadline past); a live one still confirms', ex && ex.stageExpired === 'error' && ex.deadlinePast === 'error' && ex.live !== 'error', ex);
  /* 5. receipt never repeats its title */
  await L.jump(p, CODE, 'j-many', 700); await L.E(p, CODE, "inst.go('waitlist', { eventId: 'climb' })"); await idle();   /* climb = my turn in the queue (invited_queue, many variant) */
  const r = await L.E(p, CODE, 'var c = inst.ctlVals(); var w = c.waitlist && c.waitlist.on ? c.waitlist : null; return w ? w.receipt : null');
  ok('waitlist receipt: field dropped when the title already says it', r && !(r.field && r.title.indexOf(r.field) >= 0), r);
  /* 6. burn handle: a paused seek to the end waits; resume lands the end state; an unpaused seek to the end lands next frame (C03 report) */
  await L.jump(p, CODE, 'j-d-tear', 700); await idle();
  for (let i = 0; i < 90; i++) { if (await L.E(p, CODE, "return inst.ctlVals().ticket.state === 'printed' || inst.ctlVals().ticket.state === 'ready'")) break; await p.waitForTimeout(100); }
  const bn = await L.E(p, CODE, `var st = root.querySelector('[data-surface="ticket"] [data-print-stage]') || root.querySelector('[data-print-stage]'); if (!st || !window.JURitual || !window.JURitual.burn) return { missing: true };
    window.__bnDone = 0; var h = window.JURitual.burn(st, { reason: 'withdrawn' }, { reduced: false, onDone: function () { window.__bnDone++; } }); window.__bnH = h; window.__bnSt = st;
    if (!h.engine) return { noEngine: true }; h.pause(); h.seek(h.engine.duration); return { state: st.dataset.state };`);
  await p.waitForTimeout(150);
  const bn2 = await L.E(p, CODE, "return { state: window.__bnSt.dataset.state, done: window.__bnDone }");
  await L.E(p, CODE, "window.__bnH.resume(); return 1"); await p.waitForTimeout(50);
  const bn3 = await L.E(p, CODE, "return { state: window.__bnSt.dataset.state, done: window.__bnDone }");
  const bn4 = await L.E(p, CODE, `var st = window.__bnSt; window.JURitual.burn.reset(st); window.__bnDone = 0; var h = window.JURitual.burn(st, { reason: 'withdrawn' }, { reduced: false, onDone: function () { window.__bnDone++; } }); window.__bnH = h; h.seek(h.engine.duration); return 1`);
  await p.waitForTimeout(150);
  const bn5 = await L.E(p, CODE, "return { state: window.__bnSt.dataset.state, done: window.__bnDone }");
  ok('burn: paused seek to the end waits, resume lands the end state once; an unpaused seek to the end lands by itself', bn && bn.state === 'burning' && bn2.state === 'burning' && bn2.done === 0 && bn3.state === 'void' && bn3.done === 1 && bn4 === 1 && bn5.state === 'void' && bn5.done === 1, { bn, bn2, bn3, bn5 });
  ok('no console errors', errors.length === 0, errors.slice(0, 3));
  await b.close();
  console.log(fails ? `FAILED ${fails} / ${passes} passed` : `shared-regress OK · ${passes} checks passed`); process.exit(fails ? 1 : 0);
})();

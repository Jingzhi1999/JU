// Shared-layer regression for the lead's fixes after the C04 / C06 stage-1 reviews (2026-10-23), on the C00 wiring reference:
// torn ticket opened from home is 'torn' (not 'fresh'); home() one level deep runs the exit phase like back(); the exiting
// surface keeps its last model (no text swap mid-exit); jumpTo resets every list to the top; a receipt never repeats its title.
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
  /* 5. receipt never repeats its title */
  await L.jump(p, CODE, 'j-many', 700); await L.E(p, CODE, "inst.go('waitlist', { eventId: 'climb' })"); await idle();   /* climb = my turn in the queue (invited_queue, many variant) */
  const r = await L.E(p, CODE, 'var c = inst.ctlVals(); var w = c.waitlist && c.waitlist.on ? c.waitlist : null; return w ? w.receipt : null');
  ok('waitlist receipt: field dropped when the title already says it', r && !(r.field && r.title.indexOf(r.field) >= 0), r);
  ok('no console errors', errors.length === 0, errors.slice(0, 3));
  await b.close();
  console.log(fails ? `FAILED ${fails} / ${passes} passed` : `shared-regress OK · ${passes} checks passed`); process.exit(fails ? 1 : 0);
})();

// Return-to-origin scroll regression (my-r2 shared controller): opening a row that sits near the bottom edge of the list and
// returning must not scroll the list at all (no reveal-then-restore double scroll), and a row that changed group must still be
// brought into view. Usage: JU_STANDALONE=/home/user/JU/.build/lead-C00.html node my-r2/tools/test/reveal-regress.cjs [CODE]
const L = require('../_lib.cjs');
const CODE = process.argv[2] || 'C00';
let fails = 0, passes = 0; const ok = (n, c, x) => { if (c) passes++; else { fails++; console.log('FAIL', n, x == null ? '' : JSON.stringify(x)); } };
(async () => {
  const { b, p, errors } = await L.launch({ viewport: { width: 1000, height: 1000 } });
  await L.openConcept(p, L.fileFor(CODE), CODE);
  await L.jump(p, CODE, 'j-many', 700);
  /* scroll the home list so some row sits 0–12px from the bottom edge (the old reveal() threshold) */
  const pick = await L.E(p, CODE, `
    var sc = root.querySelector('[data-scroller^="home"]') || root.querySelector('[data-surface="home"] [data-scroller]'); if (!sc) return { err: 'no home scroller' };
    var rows = [].slice.call(sc.querySelectorAll('[data-origin][data-rid]')); if (!rows.length) return { err: 'no rows' };
    var target = rows[Math.min(rows.length - 1, 6)]; var s = sc.getBoundingClientRect(), r = target.getBoundingClientRect();
    sc.scrollTop += (r.bottom - (s.bottom - 6));   /* bottom edge 6px inside the scroller */
    inst._applyHc && inst._applyHc(sc);
    return { name: sc.getAttribute('data-scroller'), rid: target.getAttribute('data-rid'), origin: target.getAttribute('data-origin'), top: sc.scrollTop };`);
  ok('home scroller and a near-edge row found', !pick.err, pick);
  if (!pick.err) {
    await p.waitForTimeout(200);
    const r0 = await L.E(p, CODE, `var sc = root.querySelector('[data-scroller="' + a.name + '"]'); var el = root.querySelector('[data-origin="' + a.origin + '"]'); return { top: sc.scrollTop, el: !!el }`, pick);
    /* a raw pointer click at the row's current box (the capture helper would scroll it into view first) */
    const bb = await L.E(p, CODE, `var el = root.querySelector('[data-origin="' + a.origin + '"]'); var r = el.getBoundingClientRect(); return { x: r.left + Math.min(r.width / 2, 120), y: r.top + Math.min(r.height / 2, 18) }`, pick);
    await p.mouse.click(bb.x, bb.y); await p.waitForTimeout(900);
    const atDetail = await L.E(p, CODE, `return inst.state.nav.stack[inst.state.nav.stack.length - 1].s`);
    ok('row opened a deeper surface', atDetail !== 'home', atDetail);
    await L.E(p, CODE, `inst.ctlVals().nav.back()`);
    const tops = []; for (let i = 0; i < 14; i++) { tops.push(await L.E(p, CODE, `var sc = root.querySelector('[data-scroller="' + a.name + '"]'); return sc ? Math.round(sc.scrollTop) : null`, pick)); await p.waitForTimeout(60); }
    const uniq = [...new Set(tops.filter(v => v != null))];
    ok('no double scroll on return: list scrollTop constant during the exit and after settle', uniq.length === 1 && Math.abs(uniq[0] - Math.round(r0.top)) <= 1, { before: Math.round(r0.top), during: tops });
  }
  ok('no console errors', errors.length === 0, errors.slice(0, 3));
  await b.close();
  console.log(fails ? `FAILED ${fails} / ${passes} passed` : `reveal-regress OK · ${passes} checks passed`); process.exit(fails ? 1 : 0);
})();

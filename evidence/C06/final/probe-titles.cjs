// Full-name probe: for every expanded view (detail / history / manage / card slip / draft), is the event's full title shown, unclipped, somewhere visible?
// node evidence/C06/final/probe-titles.cjs <standalone.html> <out.txt>
const { chromium } = require('/opt/node-tools/node_modules/playwright');
const fs = require('fs'); const path = require('path');
const [file, out] = process.argv.slice(2);
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1000, height: 1000 } });
  const errors = []; p.on('pageerror', e => errors.push(e.message)); p.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  await p.goto('file://' + path.resolve(file) + '#concept/C06'); await p.waitForTimeout(800); await p.evaluate(() => document.fonts.ready);
  const cases = [];
  // every index entry that opens a surface
  const keys = await p.evaluate(() => window.JU.INDEX.filter(e => e.open).map(e => e.key));
  keys.forEach(k => cases.push({ label: k, jump: k }));
  // the card slip on the manage page
  cases.push({ label: 'h-m-card +slip', jump: 'h-m-card', then: "inst.openSlip('card')" });
  // long-title variant: every surface that holds a long-titled event
  cases.push({ label: 'long · brunch detail', jump: 'b-long', then: "inst.applyJump({ key: 'x', open: { eventId: 'brunch', surface: 'detail' } })" });
  cases.push({ label: 'long · livehouse reschedule', jump: 'b-long', then: "inst.applyJump({ key: 'x', open: { eventId: 'livehouse', surface: 'reschedule-reply' } })" });
  cases.push({ label: 'long · bar manage', jump: 'b-long-h', then: "inst.applyJump({ key: 'x', open: { eventId: 'bar', surface: 'manage', tab: 'applications' } })" });
  cases.push({ label: 'long · bar manage +card slip', jump: 'b-long-h', then: "inst.applyJump({ key: 'x', open: { eventId: 'bar', surface: 'manage', tab: 'members' } })", then2: "inst.openSlip('card')" });
  const lines = [];
  for (const c of cases) {
    await p.evaluate(k => { const m = window.JUShell.mounts.stage['stage:C06:']; m.instance.jumpTo(k); }, c.jump); await p.waitForTimeout(700);
    for (const js of [c.then, c.then2]) { if (!js) continue; await p.evaluate(js => { const m = window.JUShell.mounts.stage['stage:C06:']; new Function('root', 'inst', js)(m.root, m.instance); }, js); await p.waitForTimeout(900); }
    const r = await p.evaluate(() => {
      const m = window.JUShell.mounts.stage['stage:C06:']; const inst = m.instance; const s = inst.state; const v = s.view; const host = document.querySelector('.stage-host[data-code="C06"]'); const root = host.shadowRoot;
      let title = null;
      if (v.name === 'draft') { const d = window.JU.derive.hosted(s.data).drafts.filter(x => x.id === v.id)[0]; title = d && d.title; }
      else if (v.name === 'manage') { const mg = inst.mg(v.id); title = mg && mg.event.title; }
      else if (v.name === 'detail') { const rr = window.JU.derive.rowById(s.data, v.id); title = rr && rr.event.title; }
      const over = root.querySelector('.c06-over'); if (!over || !title) return { view: v.name, title, ok: false, where: [] };
      const vis = el => { for (let e = el; e && e !== over.parentNode; e = e.parentElement) { const cs = getComputedStyle(e); if (cs.display === 'none' || cs.visibility === 'hidden' || +cs.opacity < 0.05) return false; } const rc = el.getBoundingClientRect(); return rc.width > 4 && rc.height > 4; };
      const unclipped = el => { if (el.scrollWidth > el.clientWidth + 1) return false;
        /* line clamp: compare with the same element unclamped (glyph overhang of 1–3px is not a cut line) */
        const h0 = el.getBoundingClientRect().height; const keep = el.getAttribute('style') || ''; el.setAttribute('style', keep + ';-webkit-line-clamp:unset!important;display:block!important;height:auto!important;max-height:none!important;overflow:visible!important');
        const h1 = el.getBoundingClientRect().height; el.setAttribute('style', keep); if (h1 > h0 + 6) return false; const rc = el.getBoundingClientRect(); for (let e = el.parentElement; e && e !== over; e = e.parentElement) { const cs = getComputedStyle(e); if (cs.overflow !== 'visible' || cs.overflowX !== 'visible' || cs.overflowY !== 'visible') { const pr = e.getBoundingClientRect(); if (e.classList.contains('c06-sheet')) continue; /* the sheet scrolls; its header is at the top */ if (rc.left < pr.left - 1 || rc.right > pr.right + 1 || rc.top < pr.top - 1 || rc.bottom > pr.bottom + 1) return false; } } return true; };
      const all = Array.from(over.querySelectorAll('*')).filter(e => e.textContent.indexOf(title) >= 0 && !Array.from(e.children).some(ch => ch.textContent.indexOf(title) >= 0));
      const where = all.map(e => ({ cls: (e.className && e.className.baseVal == null ? e.className : '') + '', tag: e.tagName.toLowerCase(), parent: (e.closest('.c06-held,.c06-sheet,.c06-slip,.c06-fullcard') || {}).className || '', vis: vis(e), full: unclipped(e) }));
      return { view: v.name + '/' + (v.tab || v.mode || ''), phase: v.phase, slip: v.slip || '', title, ok: where.some(w => w.vis && w.full), where };
    });
    const w = r.where.map(x => `${x.tag}.${x.cls.trim().replace(/\s+/g, '.')}@${String(x.parent).trim().split(/\s+/).slice(0, 2).join('.')}=${x.vis ? (x.full ? 'FULL' : 'CUT') : 'hidden'}`).join(' | ');
    lines.push(`${r.ok ? 'OK  ' : 'MISS'} ${c.label} [${r.view}${r.slip ? ' slip=' + r.slip : ''}] 「${r.title}」 → ${w || '(not in the expanded view)'}`);
  }
  lines.push('errors: ' + JSON.stringify(errors));
  fs.writeFileSync(out, lines.join('\n') + '\n'); console.log(lines.join('\n'));
  await b.close();
})();

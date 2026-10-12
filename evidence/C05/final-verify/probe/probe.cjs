// Final-verify timing probe for C05: in-page rAF sampler records every change of a watched expression with performance.now() timestamps.
const { chromium } = require('/opt/node-tools/node_modules/playwright');
const fs = require('fs'); const path = require('path');
const out = process.argv[2];
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1000, height: 1000 } });
  const errors = []; p.on('pageerror', e => errors.push(e.message)); p.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  await p.goto('file://' + path.resolve(process.env.JU_STANDALONE) + '#concept/C05'); await p.waitForTimeout(1200);
  const ev = (js) => p.evaluate((js) => { const m = window.JUShell.mounts.stage['stage:C05:']; return new Function('root', 'inst', js)(m.root, m.instance); }, js);
  // start sampler: watch(js) returns a JSON-able value; transitions stored on window.__rec
  const watch = (js) => p.evaluate((js) => { const m = window.JUShell.mounts.stage['stage:C05:']; const f = new Function('root', 'inst', js); window.__rec = []; window.__t0 = performance.now(); let last; window.__on = true; const tick = () => { if (!window.__on) return; let v; try { v = f(m.root, m.instance); } catch (e) { v = 'ERR ' + e.message; } const s = JSON.stringify(v); if (s !== last) { window.__rec.push({ t: Math.round(performance.now() - window.__t0), v }); last = s; } requestAnimationFrame(tick); }; tick(); }, js);
  const stop = () => p.evaluate(() => { window.__on = false; return window.__rec; });
  const mark = () => p.evaluate(() => Math.round(performance.now() - window.__t0));
  const setRM = async (on) => { if (!!(await ev('return inst.state.review.rm')) !== on) await ev('inst.toggleRM()'); await p.waitForTimeout(150); };
  const setSpeed = async (k) => { await ev('inst.setSpeed(' + k + ')'); await p.waitForTimeout(100); };
  const res = { errors };
  const W_UNDO = "var u = root.querySelector('.c05-undo'); return { bar: !!u, txt: u ? u.textContent.replace(/\\s+/g,'') : '', undoState: inst.state.undo ? inst.state.undo.draftId : null, rows: root.querySelectorAll('.c05-rowwrap [data-act=\"delete\"]').length };";
  const W_TOAST = "var t = root.querySelector('.c05-bartoast.in') || root.querySelector('.c05-toast.in'); var c = root.querySelector('.c05-over [data-act=\"copy\"]'); return { toast: t ? t.textContent.trim() : null, copy: c ? c.textContent.trim() : null };";
  const W_TAG = "var v = inst.state.view || {}; var t = v.tags && v.tags.main; return { name: v.name, phase: t ? t.phase : null, torn: t ? !!t.torn : null, falling: t ? !!t.falling : null, contact: !!v.contact, contactCard: !!root.querySelector('.c05-over [data-act=\"copy\"]') };";
  const W_BURN = "var v = inst.state.view || {}; return { slip: v.slip || null, burn: v.burn || null, busy: !!inst.state.busy, chip: (function(){ var c = root.querySelector('.c05-over .c05-lab'); return c ? c.textContent.trim() : null; })() };";
  for (const rm of [true, false]) {
    const tag = rm ? 'rmOn' : 'rmOff';
    await ev("inst.jumpTo('j-home')"); await p.waitForTimeout(500); await setRM(rm); await setSpeed(1);
    // 1) draft delete, left to expire
    await ev("inst.jumpTo('h-drafts')"); await p.waitForTimeout(700);
    await watch(W_UNDO); await ev("root.querySelector('.c05-rowwrap [data-act=\"delete\"]').click()"); const t1 = await mark();
    await p.waitForTimeout(11500); res[tag + '_undoExpire'] = { clickAt: t1, rec: await stop() };
    // 2) draft delete, undo at 9.0 s
    await ev("inst.jumpTo('h-drafts')"); await p.waitForTimeout(700);
    await watch(W_UNDO); await ev("root.querySelector('.c05-rowwrap [data-act=\"delete\"]').click()"); const t2 = await mark();
    await p.waitForTimeout(9000); const tu = await mark(); await ev("root.querySelector('.c05-undo [data-act=\"undo\"]').click()");
    await p.waitForTimeout(2500); res[tag + '_undoAt9s'] = { clickAt: t2, undoAt: tu, rec: await stop(), titleBack: await ev("return Array.from(root.querySelectorAll('.c05-piece')).map(function(e){return e.dataset.rid})") };
    // 3) copy toast
    await ev("inst.jumpTo('j-d-contact')"); await p.waitForTimeout(900);
    await watch(W_TOAST); await ev("root.querySelector('.c05-over [data-act=\"copy\"]').click()"); const t3 = await mark();
    await p.waitForTimeout(3600); res[tag + '_copy'] = { clickAt: t3, rec: await stop() };
    // 4) reschedule submit toast
    await ev("inst.jumpTo('h-m-reschedule')"); await p.waitForTimeout(900);
    await ev("inst.patchView({ rsDate: '2026-12-21', rsTime: '19:30' })"); await p.waitForTimeout(150);
    await watch(W_TOAST); await ev("root.querySelector('.c05-slip [data-act=\"propose\"]').click()"); const t4 = await mark();
    await p.waitForTimeout(4000); res[tag + '_reschedToast'] = { clickAt: t4, rec: await stop() };
    // 5) print + tear (from list) at 1x, plus 0.5x when rm off
    for (const k of rm ? [1] : [1, 0.5]) {
      await ev("inst.jumpTo('j-home')"); await p.waitForTimeout(600); await setSpeed(k);
      await watch(W_TAG); await ev("root.querySelector('[data-rid=\"run3k\"] .c05-hit').click()"); const t5 = await mark();
      await p.waitForTimeout(rm ? 800 : (k === 1 ? 4200 : 7600));
      const box = await p.evaluate(() => { const h = document.querySelector('.stage-host[data-code="C05"]'); const e = h.shadowRoot.querySelector('.c05-over .c05-tagwrap[data-act="tear"]'); if (!e) return null; const r = e.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; });
      let tr = null;
      if (box) { await p.mouse.move(box.x, box.y); await p.mouse.down(); for (let i = 1; i <= 6; i++) { await p.mouse.move(box.x, box.y + 10 * i, { steps: 2 }); await p.waitForTimeout(40); } tr = await mark(); await p.mouse.up(); }
      await p.waitForTimeout(rm ? 800 : 3200 * (k === 1 ? 1 : 2));
      res[tag + '_printTear_x' + k] = { clickAt: t5, releaseAt: tr, rec: await stop() };
    }
    // 6) cancel destruction
    for (const k of rm ? [1] : [1, 0.5]) {
      await ev("inst.jumpTo('h-m-cancel')"); await p.waitForTimeout(900); await setSpeed(k);
      await watch(W_BURN); await ev("root.querySelector('.c05-slip [data-act=\"cancel\"]').click()"); const t6 = await mark();
      await p.waitForTimeout(rm ? 800 : 5000 * (k === 1 ? 1 : 2));
      res[tag + '_cancel_x' + k] = { clickAt: t6, rec: await stop() };
    }
    await setSpeed(1);
  }
  fs.mkdirSync(path.dirname(out), { recursive: true }); fs.writeFileSync(out, JSON.stringify(res, null, 1));
  console.log('errors', JSON.stringify(errors));
  await b.close();
})();

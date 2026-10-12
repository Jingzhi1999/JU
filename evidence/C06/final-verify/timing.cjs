// timing probe: node timing.cjs <standalone> <out.json>
const { chromium } = require('/opt/node-tools/node_modules/playwright');
const fs = require('fs'); const path = require('path');
const [file, out] = process.argv.slice(2);
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1000, height: 1000 } });
  const errors = []; p.on('pageerror', e => errors.push(e.message)); p.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  await p.goto('file://' + path.resolve(file) + '#concept/C06'); await p.waitForTimeout(900); await p.evaluate(() => document.fonts.ready);
  const run = (js) => p.evaluate(js => { const m = window.JUShell.mounts.stage['stage:C06:']; return new Function('root', 'inst', js)(m.root, m.instance); }, js);
  const sample = () => p.evaluate(() => {
    const root = document.querySelector('.stage-host[data-code="C06"]').shadowRoot; const ph = root.querySelector('.ju-phone').getBoundingClientRect();
    const vis = el => { if (!el) return false; const cs = getComputedStyle(el); if (cs.display === 'none' || cs.visibility === 'hidden' || +cs.opacity < 0.5) return false; const r = el.getBoundingClientRect(); return r.width > 4 && r.height > 4 && r.bottom > ph.top && r.top < ph.bottom; };
    const u = root.querySelector('.c06-undo'); const ub = u && u.querySelector('button'); const ui = u && u.querySelector('i');
    const t = root.querySelector('.c06-toast'); const tOn = t && t.classList.contains('in') && vis(t);
    const copyBtns = Array.from(root.querySelectorAll('.c06-over [data-act="copy"]')).map(x => x.textContent.trim());
    const inst = window.JUShell.mounts.stage['stage:C06:'].instance; const s = inst.state;
    const drafts = window.JU.derive.hosted(s.data).drafts.map(d => d.title);
    return { undo: !!(u && vis(u) && ub && vis(ub)), undoText: u ? u.textContent.trim() : '', lineDisplay: ui ? getComputedStyle(ui).display : null, toast: tOn ? t.textContent.trim() : '', copy: copyBtns.join(','), drafts: drafts.join('|'), rm: s.review.rm };
  });
  const track = async (ms, step) => { const t0 = Date.now(); const rows = []; while (Date.now() - t0 < ms) { const s = await sample(); rows.push(Object.assign({ t: Date.now() - t0 }, s)); await p.waitForTimeout(step); } return rows; };
  const summarize = (rows, key) => { const on = rows.filter(r => r[key]); if (!on.length) return { first: null, last: null, dur: 0 }; return { first: on[0].t, last: on[on.length - 1].t, dur: on[on.length - 1].t - on[0].t }; };
  const res = {};
  for (const rm of [true, false]) {
    const tag = rm ? 'rmOn' : 'rmOff'; res[tag] = {};
    // ---- draft delete, no undo: full window
    await run(`if (inst.state.review.rm !== ${rm}) inst.toggleRM(); inst.setSpeed(1);`); await p.waitForTimeout(200);
    const rmState = await run(`return inst.state.review.rm;`); res[tag].rmState = rmState;
    await run(`inst.jumpTo('h-draft');`); await p.waitForTimeout(900);
    const before = await sample();
    await run(`root.querySelector('.c06-sheet [data-act="delete"]').click();`);
    let rows = await track(12500, 80);
    res[tag].deleteNoUndo = { draftsBefore: before.drafts, undo: summarize(rows, 'undo'), lineDisplay: (rows.find(r => r.undo) || {}).lineDisplay, at800: rows.filter(r => r.t >= 750 && r.t <= 900).map(r => r.undo), draftsEnd: rows[rows.length - 1].drafts, undoAtEnd: rows[rows.length - 1].undo, sample8s: rows.filter(r => r.t >= 7900 && r.t <= 8200).map(r => r.undo) };
    // ---- draft delete, undo at 8.5 s
    await run(`inst.jumpTo('h-draft');`); await p.waitForTimeout(900);
    await run(`root.querySelector('.c06-sheet [data-act="delete"]').click();`);
    rows = await track(8500, 80);
    const pre = rows[rows.length - 1];
    await run(`root.querySelector('.c06-undo button').click();`);
    const after = await track(1500, 100);
    const commitCheck = await track(3500, 250);
    res[tag].deleteUndo85 = { undoUp: summarize(rows, 'undo'), undoAt8_5: pre.undo, draftsAt8_5: pre.drafts, draftsAfterUndo: after.map(r => r.t + ':' + r.drafts).filter((x, i) => i % 3 === 0), draftsAt5sAfter: commitCheck[commitCheck.length - 1].drafts, undoBarAfter: after[after.length - 1].undo };
    // ---- copy toast + 已复制 label
    await run(`inst.jumpTo('j-d-contact');`); await p.waitForTimeout(1200);
    await run(`root.querySelector('.c06-over [data-act="copy"]').click();`);
    rows = await track(3600, 50);
    res[tag].copy = { toast: summarize(rows, 'toast'), toastText: (rows.find(r => r.toast) || {}).toast, copied: summarize(rows.map(r => Object.assign({}, r, { c: /已复制/.test(r.copy) })), 'c') };
    // ---- reschedule toast
    await run(`inst.jumpTo('h-m-reschedule');`); await p.waitForTimeout(1200);
    await run(`inst.patchView({ rsDate: '2026-12-24', rsTime: '21:00' });`); await p.waitForTimeout(200);
    const okBtn = await run(`const b = root.querySelector('.c06-slip [data-act="propose"]'); return b ? b.className : null;`);
    await run(`root.querySelector('.c06-slip [data-act="propose"]').click();`);
    rows = await track(4000, 50);
    res[tag].resched = { rmDuring: rows[0].rm, okCls: okBtn, toast: summarize(rows, 'toast'), toastText: (rows.find(r => r.toast) || {}).toast };
  }
  res.errors = errors;
  fs.writeFileSync(out, JSON.stringify(res, null, 1)); console.log(JSON.stringify(res, null, 1));
  await b.close();
})();

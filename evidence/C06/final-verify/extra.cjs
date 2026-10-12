const { chromium } = require('/opt/node-tools/node_modules/playwright'); const path = require('path'); const fs = require('fs');
(async () => { const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1000, height: 1000 } });
  const errors = []; p.on('pageerror', e => errors.push(e.message)); p.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  await p.goto('file://' + path.resolve(process.argv[2]) + '#concept/C06'); await p.waitForTimeout(900);
  const run = js => p.evaluate(js => { const m = window.JUShell.mounts.stage['stage:C06:']; return new Function('root', 'inst', js)(m.root, m.instance); }, js);
  const samp = () => run(`const u = root.querySelector('.c06-undo'); const t = root.querySelector('.c06-toast'); const ph = root.querySelector('.ju-phone').getBoundingClientRect(); const vis = el => { if (!el) return false; const cs = getComputedStyle(el); const r = el.getBoundingClientRect(); return cs.display !== 'none' && +cs.opacity > 0.5 && r.bottom > ph.top && r.top < ph.bottom; }; return { undo: vis(u), toast: t && t.classList.contains('in') && vis(t) ? t.textContent.trim() : '', drafts: JU.derive.hosted(inst.state.data).drafts.length, rm: inst.state.review.rm };`);
  const track = async (ms, step) => { const t0 = Date.now(), rows = []; while (Date.now() - t0 < ms) { rows.push(Object.assign({ t: Date.now() - t0 }, await samp())); await p.waitForTimeout(step); } return rows; };
  const span = (rows, f) => { const on = rows.filter(f); return on.length ? [on[0].t, on[on.length - 1].t] : null; };
  await run('inst.toggleRM()'); await p.waitForTimeout(200);
  const out = {};
  // list-row delete under RM
  await run(`inst.jumpTo('h-drafts')`); await p.waitForTimeout(900);
  out.listBtn = await run(`const b = [...root.querySelectorAll('[data-act="delete"]')].find(x => !x.closest('.c06-over')); if (!b) return null; b.click(); return b.textContent.trim();`);
  let rows = await track(11000, 100);
  out.listDelete = { rm: rows[0].rm, undoSpan: span(rows, r => r.undo), at800: rows.filter(r => r.t > 700 && r.t < 950).map(r => r.undo), draftsAt500: (rows.find(r => r.t > 500) || {}).drafts, draftsEnd: rows[rows.length - 1].drafts };
  // accept reschedule under RM: toast 已接受改期
  await run(`inst.jumpTo('j-d-reschedule')`); await p.waitForTimeout(1200);
  out.acceptBtn = await run(`const b = root.querySelector('.c06-over [data-act="accept"]'); if (!b) return null; b.click(); return b.textContent.trim();`);
  rows = await track(3500, 50);
  out.accept = { toastSpan: span(rows, r => r.toast), text: (rows.find(r => r.toast) || {}).toast || '' };
  out.errors = errors; console.log(JSON.stringify(out, null, 1)); fs.writeFileSync(process.argv[3], JSON.stringify(out, null, 1));
  await b.close(); })();

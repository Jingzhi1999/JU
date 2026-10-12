const { chromium } = require('/opt/node-tools/node_modules/playwright'); const fs = require('fs');
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1000, height: 1000 } });
  const errors = []; p.on('pageerror', e => errors.push(e.message)); p.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  await p.goto('file:///home/user/JU/.build/final-C03.html#concept/C03'); await p.waitForTimeout(900); await p.evaluate(() => document.fonts.ready);
  const I = (js) => p.evaluate((js) => { const m = window.JUShell.mounts.stage['stage:C03:']; return new Function('root', 'inst', js)(m.root, m.instance); }, js);
  const geo = () => I(`const tk = root.querySelector('.c03-sp .c03-tk.c03-stk'); if (!tk) return null; const R = tk.getBoundingClientRect(); const rel = e => { if (!e) return null; const r = e.getBoundingClientRect(); return [Math.round(r.top - R.top), Math.round(r.bottom - R.top)]; };
    const tr = e => e ? { text: e.textContent.trim().replace(/\\s+/g,' '), truncated: e.scrollWidth > e.clientWidth + 1, lines: Math.round(e.getBoundingClientRect().height / parseFloat(getComputedStyle(e).lineHeight || 16)) } : null;
    const sl = tk.querySelector('.c03-slink'); return { strip: [0, Math.round(R.height)], width: Math.round(R.width), contain: getComputedStyle(tk).contain, slink: rel(sl), slinkInside: sl ? sl.getBoundingClientRect().bottom <= R.bottom + 0.5 : null, place: tr(tk.querySelector('.c03-splace')), sline: tr(tk.querySelector('.c03-sline')) }`);
  const out = {};
  const states = [['h-m-members', null], ['h-m-review', null], ['h-m-contact', null], ['h-m-cancelled', null], ['h-m-card', null], ['h-m-end', null], ['h-m-replies', null], ['h-m-cancel', null], ['b-long-h', 'row'], ['h-pending', 'rows']];
  for (const [k, mode] of states) {
    await I(`inst.jumpTo(${JSON.stringify(k)})`); await p.waitForTimeout(900);
    if (mode === 'row') { await I(`root.querySelector('.c03-pg .c03-row').click()`); await p.waitForTimeout(1500); out[k + ' → 编辑部(first row)'] = await geo(); }
    else if (mode === 'rows') { const n = await I(`return root.querySelectorAll('.c03-pg .c03-row:not(.draft)').length`); for (let i = 0; i < n; i++) { await I(`inst.jumpTo('h-pending')`); await p.waitForTimeout(700); const t = await I(`const r = root.querySelectorAll('.c03-pg .c03-row:not(.draft)')[${i}]; const t = r.textContent.trim().replace(/\\s+/g,' ').slice(0, 18); r.click(); return t`); await p.waitForTimeout(1500); out['h-pending row ' + i + ' ' + t] = await geo(); } }
    else out[k] = await geo();
  }
  // long variant after cancel (rm on for speed)
  await I('inst.toggleRM()'); await I(`inst.jumpTo('b-long-h')`); await p.waitForTimeout(700); await I(`root.querySelector('.c03-pg .c03-row').click()`); await p.waitForTimeout(400);
  await I(`root.querySelector('.c03-sp [data-act="cancel"]').click()`); await p.waitForTimeout(300); await I(`root.querySelector('.c03-slip [data-act="cancel"]').click()`); await p.waitForTimeout(500);
  out['b-long-h → 编辑部 → cancelled (rm)'] = await geo(); await I('inst.toggleRM()');
  // b-long-h other rows
  await I(`inst.jumpTo('b-long-h')`); await p.waitForTimeout(700); const n = await I(`return root.querySelectorAll('.c03-pg .c03-row:not(.draft)').length`);
  for (let i = 1; i < n; i++) { await I(`inst.jumpTo('b-long-h')`); await p.waitForTimeout(700); const t = await I(`const r = root.querySelectorAll('.c03-pg .c03-row:not(.draft)')[${i}]; const t = r.textContent.trim().replace(/\\s+/g,' ').slice(0, 18); r.click(); return t`); await p.waitForTimeout(1500); out['b-long-h row ' + i + ' ' + t] = await geo(); }
  out.errors = errors; fs.writeFileSync(process.argv[2], JSON.stringify(out, null, 1)); console.log(JSON.stringify(out, null, 1)); await b.close();
})();

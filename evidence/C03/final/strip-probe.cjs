// read-only probe: 编辑部 局卡条 geometry (strip box vs its contents) in default and long variants
const { chromium } = require('/opt/node-tools/node_modules/playwright');
const path = require('path');
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1000, height: 1000 } });
  const errors = []; p.on('pageerror', e => errors.push(e.message)); p.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  await p.goto('file://' + path.resolve(process.env.JU_STANDALONE) + '#concept/C03'); await p.waitForTimeout(800); await p.evaluate(() => document.fonts.ready);
  const out = [];
  const cases = [['h-m-review', null], ['h-m-members', null], ['h-m-cancelled', null], ['b-long-h', 'bar'], ['b-single-h', null]];
  for (const [key, ev] of cases) {
    await p.evaluate(([k, ev]) => { const m = window.JUShell.mounts.stage['stage:C03:']; m.instance.jumpTo(k); if (ev) setTimeout(() => m.instance.openManage(ev, { tab: 'members', intent: 'manage' }, true), 60); }, [key, ev]);
    await p.waitForTimeout(900);
    const r = await p.evaluate(() => {
      const h = document.querySelector('.stage-host[data-code="C03"]').shadowRoot; const tk = h.querySelector('.c03-tk.c03-stk'); if (!tk) return 'no strip';
      const bx = e => { const r = e.getBoundingClientRect(); return [Math.round(r.top), Math.round(r.bottom)]; };
      const si = tk.querySelector('.c03-sinfo'), sl = tk.querySelector('.c03-slink'), pl = tk.querySelector('.c03-splace'), sv = tk.querySelector('.c03-bsvg');
      const cs = getComputedStyle(tk);
      return { strip: bx(tk), sinfo: bx(si), slink: bx(sl), place: bx(pl), placeText: pl.textContent, svg: bx(sv), contain: cs.contain, h: cs.height, clipped: bx(sl)[1] > bx(tk)[1] };
    });
    out.push(key + (ev ? '+' + ev : '') + ' ' + JSON.stringify(r));
  }
  console.log(out.join('\n')); console.log('errors', JSON.stringify(errors)); await b.close();
})();

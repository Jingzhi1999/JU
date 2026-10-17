// Generic smoke test of the standalone canvas: overview previews, concept view + panel, compare view, appendix.
const { chromium } = require('/opt/node-tools/node_modules/playwright');
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1400, height: 1000 } });
  const errors = []; p.on('pageerror', e => errors.push(e.message)); p.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  await p.goto('file:///home/user/JU/JU-Settings-Fablo51-10-Concepts.html'); await p.waitForTimeout(2500);
  const ov = await p.evaluate(() => ({ cards: document.querySelectorAll('.ov-card').length, previews: [...document.querySelectorAll('.ph-host')].filter(h => h.shadowRoot && h.shadowRoot.querySelector('.ju-phone')).length }));
  await p.screenshot({ path: '/home/user/JU/settings/tools/test/sa-overview.png' });
  await p.click('.ov-card .btn'); await p.waitForSelector('.stage-host.on'); await p.waitForTimeout(1500);
  const host = await p.$('.stage-host.on');
  const cv = await p.evaluate(h => { const r = h.shadowRoot; const btns = [...r.querySelectorAll('.ju-btn')]; const half = btns.find(x => x.textContent === '0.5×'); half && half.click(); return { code: h.dataset.code, phone: !!r.querySelector('.ju-phone'), idx: r.querySelectorAll('.ju-idx').length, half: !!half }; }, host);
  await p.waitForTimeout(200);
  const k = await p.evaluate(h => h.shadowRoot.querySelector('.app').style.cssText, host);
  await p.screenshot({ path: '/home/user/JU/settings/tools/test/sa-concept.png' });
  // jump via rail to the last concept
  await p.evaluate(() => { const bs = document.querySelectorAll('#rail button'); bs[bs.length - 1].click(); }); await p.waitForTimeout(1500);
  const last = await p.evaluate(() => { const h = document.querySelector('.stage-host.on'); return { code: h.dataset.code, phone: !!h.shadowRoot.querySelector('.ju-phone') }; });
  await p.click('.tab[data-view="compare"]'); await p.waitForTimeout(3000);
  const cmp = await p.evaluate(() => ({ hosts: document.querySelectorAll('.cmp-host').length, states: document.querySelectorAll('#cmp-state option').length }));
  await p.selectOption('#cmp-state', 's-records'); await p.click('#cmp-apply'); await p.waitForTimeout(1200);
  await p.screenshot({ path: '/home/user/JU/settings/tools/test/sa-compare.png' });
  await p.click('.tab[data-view="appendix"]'); await p.waitForTimeout(500);
  const apx = await p.evaluate(() => document.querySelector('#apx-doc').textContent.length);
  console.log(JSON.stringify({ ov, cv, k, last, cmp, apxChars: apx, errors: errors.slice(0, 5), errorCount: errors.length }));
  await b.close();
})();

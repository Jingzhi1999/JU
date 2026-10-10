const { chromium } = require('/opt/node-tools/node_modules/playwright');
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1400, height: 1000 } });
  p.on('pageerror', e => console.log('pageerror:', e.message)); p.on('console', m => { if (m.type() === 'error') console.log('console:', m.text()); });
  await p.goto('file:///home/user/JU/JU-My-Ju-Fable51-10-Concepts.html'); await p.waitForTimeout(1500);
  await p.screenshot({ path: '/home/user/JU/tools/test/sa-overview.png' });
  await p.click('.ov-card .btn'); await p.waitForTimeout(800);
  await p.screenshot({ path: '/home/user/JU/tools/test/sa-concept.png' });
  // click a card inside shadow dom, then the panel's 0.5x
  const host = await p.$('.stage-host.on');
  await p.evaluate(h => { const r = h.shadowRoot; r.querySelector('.card').click(); }, host); await p.waitForTimeout(150);
  await p.screenshot({ path: '/home/user/JU/tools/test/sa-concept-mid.png' });
  const r = await p.evaluate(h => { const r = h.shadowRoot; const btns = [...r.querySelectorAll('.ju-btn')]; btns.find(b => b.textContent === '0.5×').click(); return { k: r.querySelector('.app').style.cssText, idx: r.querySelectorAll('.ju-idx').length }; }, host);
  await p.waitForTimeout(100);
  const r2 = await p.evaluate(h => { const r = h.shadowRoot; [...r.querySelectorAll('.ju-idx')].find(b => b.textContent === '完全空').click(); return r.querySelector('.app').style.cssText; }, host);
  await p.waitForTimeout(200);
  const r3 = await p.evaluate(h => h.shadowRoot.querySelector('.app').textContent.includes('还没有局'), host);
  console.log(JSON.stringify({ r, r2, emptyShown: r3 }));
  await p.click('.tab[data-view="compare"]'); await p.waitForTimeout(800); await p.screenshot({ path: '/home/user/JU/tools/test/sa-compare.png' });
  await b.close();
})();

const { chromium } = require('/opt/node-tools/node_modules/playwright');
(async () => {
  const b = await chromium.launch(); const p = await b.newPage();
  p.on('pageerror', e => console.log('pageerror:', e.message, (e.stack||'').split('\n').slice(1,3).join(' | ')));
  p.on('console', m => { if (m.type()==='error') console.log('console:', m.text().slice(0,300)); });
  await p.goto('file:///home/user/JU/JU-My-Ju-Fable51-10-Concepts.html#concept/C00'); await p.waitForTimeout(1200);
  const info = await p.evaluate(() => { const h = document.querySelector('.stage-host[data-code="C00"]'); return { host: !!h, shadow: !!(h && h.shadowRoot), phone: !!(h && h.shadowRoot && h.shadowRoot.querySelector('.ju-phone')), html: h && h.shadowRoot ? h.shadowRoot.innerHTML.slice(0, 300) : null }; });
  console.log(JSON.stringify(info));
  await b.close();
})();

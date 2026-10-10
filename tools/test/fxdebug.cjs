const { chromium } = require('/opt/node-tools/node_modules/playwright');
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1000, height: 1000 } });
  p.on('pageerror', e => console.log('pageerror:', e.message)); p.on('console', m => { if (m.type() === 'error' || m.type() === 'warning') console.log('console:', m.text()); });
  await p.goto('file:///home/user/JU/JU-My-Ju-Fable51-10-Concepts.html#concept/C00'); await p.waitForTimeout(1000);
  const host = await p.$('.stage-host.on');
  const info = await p.evaluate(h => { const r = h.shadowRoot; [...r.querySelectorAll('.fxrow button')].find(b => b.textContent === '出票').click(); return new Promise(res => setTimeout(() => { const tk = r.querySelector('.tk'); const cs = getComputedStyle(tk); res({ cls: tk.className, anim: cs.animationName, dur: cs.animationDuration, tf: cs.transform, mask: cs.maskImage.slice(0, 80), info: r.querySelector('.fxinfo').textContent, registered: (() => { try { CSS.registerProperty({ name: '--fx-ink', syntax: '<percentage>', inherits: false, initialValue: '0%' }); return 'was-not-registered'; } catch (e) { return 'already:' + e.message.slice(0, 40); } })(), sheetHasKf: [...r.querySelectorAll('style')].some(s => s.textContent.includes('@keyframes fx-print')) }); }, 600)); }, host);
  console.log(JSON.stringify(info, null, 1));
  await b.close();
})();

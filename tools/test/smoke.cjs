const { chromium } = require('/opt/node-tools/node_modules/playwright');
const fs = require('fs');
const js = require('./esc.cjs');
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 420, height: 340 } });
  p.on('console', m => console.log('console:', m.type(), m.text())); p.on('pageerror', e => console.log('pageerror:', e.message));
  const preact = fs.readFileSync('/home/user/JU/src/runtime/preact.min.js', 'utf8'); const rt = fs.readFileSync('/home/user/JU/src/runtime/dc-mini-runtime.js', 'utf8');
  const src = fs.readFileSync('/home/user/JU/tools/test/sample.dc.html', 'utf8');
  const html = `<!doctype html><html><head><meta charset="utf-8"><script>${preact}</script><script>${rt}</script></head><body style="margin:0"><div id="host"></div><script>
    window.m = DCMini.mount(document.getElementById('host'), ${js(src)}, {});
  </script></body></html>`;
  fs.writeFileSync('/home/user/JU/tools/test/smoke.html', html);
  await p.goto('file:///home/user/JU/tools/test/smoke.html'); await p.waitForTimeout(1200);
  await p.screenshot({ path: '/home/user/JU/tools/test/smoke-0.png' });
  const sh = await p.evaluate(() => { const r = document.getElementById('host').shadowRoot; return { h1: r.querySelector('h1').textContent, svgVB: r.querySelector('svg').getAttribute('viewBox'), cards: r.querySelectorAll('.card').length, p: r.querySelector('p').textContent, font: getComputedStyle(r.querySelector('.root')).fontFamily, fontsLoaded: document.fonts.check('16px "Noto Serif SC"') }; });
  console.log(JSON.stringify(sh));
  await p.evaluate(() => { const r = document.getElementById('host').shadowRoot; const c = r.querySelectorAll('.card')[1]; c.dataset.mark = 'same'; });
  await p.evaluate(() => document.getElementById('host').shadowRoot.querySelectorAll('.card')[1].click());
  await p.waitForTimeout(120);
  const mid = await p.evaluate(() => { const r = document.getElementById('host').shadowRoot; const c = r.querySelectorAll('.card')[1]; return { cls: c.className, mark: c.dataset.mark, tf: getComputedStyle(c).transform, txt: c.textContent.trim() }; });
  console.log('mid', JSON.stringify(mid));
  await p.screenshot({ path: '/home/user/JU/tools/test/smoke-1.png' });
  await p.waitForTimeout(700);
  const end = await p.evaluate(() => { const r = document.getElementById('host').shadowRoot; const c = r.querySelectorAll('.card')[1]; return { cls: c.className, mark: c.dataset.mark, op: getComputedStyle(c).opacity }; });
  console.log('end', JSON.stringify(end));
  await p.screenshot({ path: '/home/user/JU/tools/test/smoke-2.png' });
  await b.close();
})();

const { chromium } = require('/opt/node-tools/node_modules/playwright');
const fs = require('fs');
(async () => {
  const [url, out] = process.argv.slice(2);
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36' });
  const page = await ctx.newPage();
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 }); await page.waitForTimeout(5000);
  const H = await page.evaluate(async () => {
    const cands = Array.from(document.querySelectorAll('*')).filter(e => { const s = getComputedStyle(e); return (s.overflowY === 'auto' || s.overflowY === 'scroll') && e.scrollHeight > e.clientHeight + 200; });
    cands.sort((a, b) => b.scrollHeight - a.scrollHeight); const sc = cands[0] || document.scrollingElement; window.__sc = sc;
    for (let y = 0; y < sc.scrollHeight; y += 600) { sc.scrollTop = y; await new Promise(r => setTimeout(r, 250)); }
    sc.scrollTop = 0; return sc.scrollHeight;
  });
  const vids = await page.evaluate(() => Array.from(document.querySelectorAll('video')).map((v, i) => {
    const src = v.currentSrc || v.src || (v.querySelector('source') || {}).src || '';
    let cap = ''; let el = v; for (let k = 0; k < 6 && el; k++) { el = el.parentElement; if (el && el.innerText && el.innerText.trim().length > 10) { cap = el.innerText.trim().slice(0, 220); break; } }
    const r = v.getBoundingClientRect(); return { i, src, cap: cap.replace(/\n/g, ' / '), top: r.top + (window.__sc.scrollTop || 0) };
  }));
  fs.mkdirSync(out, { recursive: true }); fs.writeFileSync(out + '/videos.json', JSON.stringify({ url, H, vids }, null, 1));
  console.log(url, 'H', H, 'videos', vids.length); vids.forEach(v => console.log(v.i, Math.round(v.top), v.src.slice(0, 120), '|', v.cap.slice(0, 130)));
  await browser.close();
})();

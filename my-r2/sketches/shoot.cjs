#!/usr/bin/env node
/* my-r2/sketches/shoot.cjs — 截图全部草案（390×844 @2x）并拼匿名对比表（同数据 / 同环境 / 灰度）。 */
const { chromium } = require('playwright'); const fs = require('fs'); const path = require('path');
const OUT = path.join(__dirname, 'out');
(async () => {
  const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: 438, height: 892 }, deviceScaleFactor: 2 });
  const page = await ctx.newPage(); const files = fs.readdirSync(OUT).filter(f => /^[A-Z]-(joined|hosted)\.html$/.test(f)).sort();
  for (const f of files) { await page.goto('file://' + path.join(OUT, f)); await page.waitForTimeout(900); await page.locator('.phone').screenshot({ path: path.join(OUT, f.replace('.html', '.png')) }); }
  const ids = [...new Set(files.map(f => f[0]))];
  const sheet = (role, gray) => `<!doctype html><meta charset="utf-8"><style>body{margin:0;background:#2a2a2e;padding:16px;font-family:sans-serif}div.g{display:grid;grid-template-columns:repeat(5,390px);gap:14px}img{width:390px;height:844px;display:block;border-radius:6px;${gray ? 'filter:grayscale(1);' : ''}}p{color:#bbb;margin:0 0 8px;font-size:13px}</style><p>${role} · ${gray ? 'grayscale' : 'colour'} · 匿名（按字母顺序，不是方案号）</p><div class="g">${ids.map(i => `<img src="${i}-${role}.png">`).join('')}</div>`;
  for (const role of ['joined', 'hosted']) for (const gray of [false, true]) {
    const f = path.join(OUT, `sheet-${role}${gray ? '-gray' : ''}.html`); fs.writeFileSync(f, sheet(role, gray));
    const p2 = await ctx.newPage(); await p2.setViewportSize({ width: 2080, height: 1760 }); await p2.goto('file://' + f); await p2.waitForTimeout(400); await p2.screenshot({ path: f.replace('.html', '.png'), fullPage: true, scale: 'css' }); await p2.close();
  }
  await b.close(); console.log('shot', files.length, 'sketches; sheets written');
})();

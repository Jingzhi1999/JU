// node rec.cjs <url> <mobile|desktop> <outdir> '<actions json>'
// actions: [{"wait":ms}|{"clickText":"..","nth":0}|{"clickSel":"css"}|{"key":"Escape"}|{"scroll":y}|{"mark":"label"}]
const { chromium } = require('/opt/node-tools/node_modules/playwright');
const fs = require('fs'); const path = require('path');
(async () => {
  const [url, vp, outdir, actsJson] = process.argv.slice(2); fs.mkdirSync(outdir, { recursive: true });
  const mobile = vp === 'mobile'; const size = mobile ? { width: 390, height: 844 } : { width: 1280, height: 800 };
  const b = await chromium.launch();
  const ctx = await b.newContext({ viewport: size, deviceScaleFactor: 1, isMobile: mobile, hasTouch: mobile, recordVideo: { dir: outdir, size } , userAgent: mobile ? 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.6 Mobile/15E148 Safari/604.1' : undefined });
  const p = await ctx.newPage(); const t0 = Date.now(); const log = [];
  const mark = (m) => log.push({ t: ((Date.now() - t0) / 1000).toFixed(2), m });
  await p.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 }); mark('loaded');
  for (const a of JSON.parse(actsJson)) {
    try {
      if (a.wait) await p.waitForTimeout(a.wait);
      else if (a.clickText) { await p.getByText(a.clickText, { exact: !!a.exact }).nth(a.nth || 0).click({ timeout: 8000, force: !!a.force }); mark('click ' + a.clickText); }
      else if (a.clickSel) { await p.locator(a.clickSel).nth(a.nth || 0).click({ timeout: 8000, force: !!a.force }); mark('click ' + a.clickSel); }
      else if (a.clickXY) { await p.mouse.click(a.clickXY[0], a.clickXY[1]); mark('clickXY ' + a.clickXY); }
      else if (a.key) { await p.keyboard.press(a.key); mark('key ' + a.key); }
      else if (a.scroll !== undefined) { await p.evaluate(y => window.scrollTo(0, y), a.scroll); mark('scroll ' + a.scroll); }
      else if (a.scrollTo) { await p.getByText(a.scrollTo).first().scrollIntoViewIfNeeded(); mark('scrollTo ' + a.scrollTo); }
      else if (a.shot) { await p.screenshot({ path: path.join(outdir, a.shot + '.jpg'), type: 'jpeg', quality: 75 }); mark('shot ' + a.shot); }
    } catch (e) { mark('FAIL ' + JSON.stringify(a) + ' ' + String(e).slice(0, 120)); }
  }
  const v = p.video(); await ctx.close(); const vp2 = await v.path();
  fs.renameSync(vp2, path.join(outdir, 'rec.webm'));
  fs.writeFileSync(path.join(outdir, 'log.json'), JSON.stringify(log, null, 1)); console.log(JSON.stringify(log));
  await b.close();
})();

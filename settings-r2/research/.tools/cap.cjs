const { chromium } = require('/opt/node-tools/node_modules/playwright');
const fs = require('fs'); const path = require('path');
const W = '/tmp/claude-0/-home-user-JU/c1f2fb96-6559-5a75-970f-6155c432919b/scratchpad/zz-ledger-lead-9f3/';
const DESK_UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36';
const MOB_UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.6 Mobile/15E148 Safari/604.1';
async function dismiss(page) {
  const labels = ['Accept all','Accept All','Accept','I agree','Agree','Allow all','Got it!','Got it','OK','Okay','OK, got it','同意','接受','我知道了','Accept Cookies','Accept cookies','Allow All Cookies','Reject All','Reject all','Close'];
  for (const l of labels) { try { const b = page.getByRole('button', { name: l, exact: true }).first(); if (await b.isVisible({ timeout: 300 })) { await b.click({ timeout: 1500 }); await page.waitForTimeout(400); } } catch (e) {} }
}
async function runJob(browser, job) {
  const mobile = job.vp === 'mobile'; const out = path.isAbsolute(job.out) ? job.out : W + job.out;
  const ctx = await browser.newContext(mobile ? { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, userAgent: MOB_UA, locale: job.locale || 'en-US' } : { viewport: { width: 1440, height: 900 }, userAgent: DESK_UA, locale: job.locale || 'en-US' });
  const page = await ctx.newPage(); const log = { id: job.id, url: job.url };
  const mk = () => fs.mkdirSync(out, { recursive: true });
  try {
    mk(); const r = await page.goto(job.url, { waitUntil: 'domcontentloaded', timeout: 60000 });
    log.status = r && r.status(); await page.waitForTimeout(job.wait || 3500); await dismiss(page);
    for (const c of (job.clicks || [])) { try { await page.getByText(c, { exact: false }).first().click({ timeout: 3000 }); await page.waitForTimeout(800); } catch (e) { log['clickfail_' + c] = String(e).slice(0, 80); } }
    log.title = await page.title();
    let H = await page.evaluate(() => document.documentElement.scrollHeight);
    const vh = mobile ? 844 : 900; const step = job.step || Math.round(vh * 0.85); let shots = 0; const maxShots = job.maxShots || 40;
    for (let y = 0; y < H && shots < maxShots; y += step) {
      await page.evaluate(yy => window.scrollTo(0, yy), y); await page.waitForTimeout(job.scrollWait || 700);
      if (job.scrollShots) { mk(); await page.screenshot({ path: path.join(out, `s${String(shots).padStart(2, '0')}_y${y}.jpg`), type: 'jpeg', quality: 70 }); }
      shots++; H = await page.evaluate(() => document.documentElement.scrollHeight);
    }
    log.height = H; await page.evaluate(() => window.scrollTo(0, 0)); await page.waitForTimeout(500);
    for (const f of (job.find || [])) {
      try {
        const loc = page.getByText(f.text, { exact: !!f.exact }).nth(f.nth || 0);
        await loc.scrollIntoViewIfNeeded({ timeout: 8000 }); await page.waitForTimeout(f.wait || 1200);
        const box = await loc.boundingBox(); const sy = await page.evaluate(() => window.scrollY);
        const top = Math.max(0, box.y + sy - (f.padTop || 200)); const h = (box.height || 20) + (f.padTop || 200) + (f.padBottom || 500);
        mk(); await page.screenshot({ path: path.join(out, `${f.name}.jpg`), type: 'jpeg', quality: 72, fullPage: true, clip: { x: 0, y: top, width: mobile ? 390 : 1440, height: Math.min(h, 2400) } });
        log['found_' + f.name] = Math.round(box.y + sy);
      } catch (e) { log['notfound_' + f.name] = String(e).slice(0, 100); }
    }
    if (job.full) { mk(); await page.screenshot({ path: path.join(out, 'full.jpg'), type: 'jpeg', quality: 55, fullPage: true }); }
    if (job.evalText) {
      const info = await page.evaluate(() => ({ text: document.body.innerText.slice(0, 30000), imgs: Array.from(document.images).map(i => i.currentSrc || i.src).filter(Boolean).slice(0, 300), vids: Array.from(document.querySelectorAll('video, video source')).map(v => v.currentSrc || v.src).filter(Boolean) }));
      mk(); fs.writeFileSync(path.join(out, 'page.json'), JSON.stringify(info, null, 1));
    }
  } catch (e) { log.error = String(e).slice(0, 300); }
  await ctx.close(); return log;
}
(async () => {
  const jobs = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
  const browser = await chromium.launch(); const conc = parseInt(process.env.CONC || '3'); let i = 0;
  async function worker() { while (i < jobs.length) { const j = jobs[i++]; console.log(JSON.stringify(await runJob(browser, j))); } }
  await Promise.all(Array.from({ length: Math.min(conc, jobs.length) }, worker)); await browser.close();
})();

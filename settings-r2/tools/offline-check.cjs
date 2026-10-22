// Offline acceptance: open the final file with every network request blocked; visit each concept; record requests, errors and fonts.
const { chromium } = require('/opt/node-tools/node_modules/playwright'); const fs = require('fs');
(async () => {
  const [file, out] = process.argv.slice(2); fs.mkdirSync(out, { recursive: true });
  const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: 1440, height: 1000 } });
  const blocked = []; await ctx.route('**/*', r => { const u = r.request().url(); if (u.startsWith('file:') || u.startsWith('data:') || u.startsWith('blob:')) return r.continue(); blocked.push(u); return r.abort(); });
  const p = await ctx.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'error') errs.push('console: ' + m.text()); });
  await p.goto('file://' + file + '#overview'); await p.waitForTimeout(6000); await p.screenshot({ path: out + '/overview.jpg', type: 'jpeg', quality: 80 });
  const res = {};
  for (const c of ['S01', 'S02', 'S03', 'S04', 'S05', 'S06', 'S07', 'S08', 'S09', 'S10']) {
    await p.evaluate(c => { location.hash = '#concept/' + c; }, c); await p.waitForTimeout(1800);
    res[c] = await p.evaluate(() => { const h = document.querySelector('.stage-host.on'); if (!h) return null; const fams = new Set(); h.shadowRoot.querySelectorAll('.ju-phone *').forEach(e => fams.add(getComputedStyle(e).fontFamily.split(',')[0].replace(/["']/g, '').trim())); return Array.from(fams); });
    await p.screenshot({ path: out + '/' + c + '.jpg', type: 'jpeg', quality: 80 });
  }
  const loaded = await p.evaluate(() => Array.from(document.fonts).filter(f => f.status === 'loaded').map(f => f.family + ' ' + f.weight + ' ' + f.stretch));
  console.log(JSON.stringify({ blockedRequests: blocked.length, blocked: blocked.slice(0, 5), errors: errs.slice(0, 5), errorCount: errs.length, fontsLoaded: loaded, familiesUsed: res }));
  await b.close();
})();

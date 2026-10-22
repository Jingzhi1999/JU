// Smoke test of the standalone canvas (my-r2): no console / page errors, the four views route (hash + pushState / popstate),
// overview cards carry four mounted previews, the concept view mounts a stage with the panel outside the phone,
// #compare opened DIRECTLY builds its state select from window.__JU_INDEX before any concept ran, the compare stages mount
// and sync-click works, the appendix renders docs + the coverage table page, and nothing outside the current view keeps running.
// Usage: JU_STANDALONE=<file> node my-r2/tools/test/standalone.cjs [--shots <dir>]   (default file = the deliverable)
const L = require('../_lib.cjs'); const fs = L.fs, path = L.path;
(async () => {
  const file = L.fileFor(''); const shots = L.opt('shots', ''); if (shots) fs.mkdirSync(shots, { recursive: true });
  const { b, p, errors } = await L.launch({ viewport: { width: 1400, height: 1000 } });
  const fails = []; const ok = (name, cond, info) => { if (!cond) fails.push(name + (info ? ': ' + JSON.stringify(info) : '')); };
  const out = { file };
  /* 1. direct #compare before anything else ran: the index must come from the build-time injection */
  await p.goto('file://' + file + '#compare'); await p.waitForTimeout(2500);
  out.compareDirect = await p.evaluate(() => ({ view: document.querySelector('.view.on').id, states: document.querySelectorAll('#cmp-state option').length, injectedIndex: (window.__JU_INDEX || []).length, hosts: document.querySelectorAll('.cmp-host').length, mounted: [...document.querySelectorAll('.cmp-host')].filter(h => h.shadowRoot && h.shadowRoot.querySelector('.ju-phone')).length }));
  ok('direct #compare shows compare', out.compareDirect.view === 'v-compare', out.compareDirect);
  ok('state select built from __JU_INDEX', out.compareDirect.injectedIndex > 0 && out.compareDirect.states >= out.compareDirect.injectedIndex, out.compareDirect);
  if (shots) await p.screenshot({ path: path.join(shots, 'sa-compare-direct.jpg'), type: 'jpeg', quality: 70 });
  /* 2. overview */
  await p.goto('file://' + file + '#overview'); await p.waitForTimeout(3000);
  out.overview = await p.evaluate(() => ({ cards: document.querySelectorAll('.ov-card').length, built: document.querySelectorAll('.ov-card:not(.todo)').length, previews: [...document.querySelectorAll('.ph-host')].filter(h => h.shadowRoot && h.shadowRoot.querySelector('.ju-phone')).length, scope: (document.querySelector('#scope') || {}).textContent || '' }));
  ok('scope line on overview', /演示日期/.test(out.overview.scope));
  ok('four previews per built card', out.overview.previews === out.overview.built * 4, out.overview);
  if (shots) await p.screenshot({ path: path.join(shots, 'sa-overview.jpg'), type: 'jpeg', quality: 70 });
  const META = await p.evaluate(() => window.__JU_META.map(c => c.code));
  if (META.length) {
    /* 3. concept view through a card click (pushState) */
    await p.click('.ov-card:not(.todo) .btn'); await p.waitForSelector('.stage-host.on'); await p.waitForTimeout(1500);
    out.concept = await p.evaluate(() => { const h = document.querySelector('.stage-host.on'); const r = h.shadowRoot; const phone = r.querySelector('.ju-phone'); const panel = r.querySelector('.ju-panel'); return { code: h.dataset.code, hash: location.hash, phone: !!phone, panelOutsidePhone: !!panel && !phone.contains(panel), idx: r.querySelectorAll('.ju-idx').length, stats: window.JUShell.stats() }; });
    ok('concept opened with hash', out.concept.hash === '#concept/' + out.concept.code, out.concept.hash);
    ok('panel outside the phone', out.concept.panelOutsidePhone);
    ok('previews asleep while a concept is open', out.concept.stats.timersOutsideCurrent === 0 && out.concept.stats.runningOutsideCurrent === 0, out.concept.stats);
    if (shots) await p.screenshot({ path: path.join(shots, 'sa-concept.jpg'), type: 'jpeg', quality: 70 });
    /* 4. back → overview (popstate), forward → concept */
    await p.goBack(); await p.waitForTimeout(400); out.back = await p.evaluate(() => document.querySelector('.view.on').id); ok('popstate back to overview', out.back === 'v-overview', out.back);
    await p.goForward(); await p.waitForTimeout(400); out.fwd = await p.evaluate(() => document.querySelector('.view.on').id); ok('forward to concept', out.fwd === 'v-concept', out.fwd);
    /* 5. rail → last concept */
    await p.evaluate(() => { const bs = [...document.querySelectorAll('#rail button:not(.todo)')]; bs[bs.length - 1].click(); }); await p.waitForTimeout(1500);
    out.last = await p.evaluate(() => { const h = document.querySelector('.stage-host.on'); return { code: h.dataset.code, phone: !!h.shadowRoot.querySelector('.ju-phone'), stats: window.JUShell.stats() }; });
    ok('other stage asleep', out.last.stats.timersOutsideCurrent === 0, out.last.stats);
    /* 6. compare via the tab: jump + sync click + combination change (unmount) */
    await p.click('.tab[data-view="compare"]'); await p.waitForTimeout(2500);
    const key = await p.evaluate(() => { const o = document.querySelector('#cmp-state option[value="h-m-attendance"]') || document.querySelector('#cmp-state option[value]'); return o ? o.value : ''; });
    if (key) { await p.selectOption('#cmp-state', key); await p.click('#cmp-apply'); await p.waitForTimeout(1200); }
    out.compare = await p.evaluate(() => ({ hosts: document.querySelectorAll('.cmp-host').length, mounted: Object.keys(window.JUShell.mounts.compare).length, anon: document.querySelector('#cmp-stages').classList.contains('anon'), log: document.querySelector('#cmp-log').textContent }));
    ok('compare stages mounted', out.compare.hosts >= 1 && out.compare.mounted === out.compare.hosts, out.compare);
    await p.fill('#cmp-act', 'back'); await p.click('#cmp-click'); await p.waitForTimeout(600);
    out.sync = await p.evaluate(() => document.querySelector('#cmp-log').textContent);
    ok('sync click reported', /同步点击/.test(out.sync), out.sync);
    if (shots) await p.screenshot({ path: path.join(shots, 'sa-compare.jpg'), type: 'jpeg', quality: 70 });
    const before = await p.evaluate(() => Object.keys(window.JUShell.mounts.compare));
    await p.selectOption('#cmp-scope', 'all'); await p.waitForTimeout(2500);
    out.compareAll = await p.evaluate((before) => ({ hosts: document.querySelectorAll('.cmp-host').length, mounted: Object.keys(window.JUShell.mounts.compare).length, oldKeysGone: before.every(k => !window.JUShell.mounts.compare[k]), stats: window.JUShell.stats() }), before);
    ok('all-ten combination replaces the old mounts', out.compareAll.hosts === META.length && out.compareAll.mounted === META.length, out.compareAll);
    ok('nothing outside compare runs', out.compareAll.stats.timersOutsideCurrent === 0 && out.compareAll.stats.runningOutsideCurrent === 0, out.compareAll.stats);
  }
  /* 7. appendix: coverage table page + a doc tab + direct #appendix/<doc> */
  await p.click('.tab[data-view="appendix"]'); await p.waitForTimeout(500);
  out.appendix = await p.evaluate(() => ({ tabs: document.querySelectorAll('.apx-tab').length, on: document.querySelector('.apx-tab.on').dataset.doc, chars: document.querySelector('#apx-doc').textContent.length, hash: location.hash }));
  ok('appendix opens on the coverage table', out.appendix.on === 'coverage-table' && out.appendix.chars > 20, out.appendix);
  await p.evaluate(() => { location.hash = '#appendix/limits'; }); await p.waitForTimeout(400);
  out.appendixDoc = await p.evaluate(() => ({ on: document.querySelector('.apx-tab.on').dataset.doc, chars: document.querySelector('#apx-doc').textContent.length, stats: window.JUShell.stats() }));
  ok('#appendix/limits routes to that doc', out.appendixDoc.on === 'limits' && out.appendixDoc.chars > 0, out.appendixDoc);
  ok('nothing runs while the appendix is open', out.appendixDoc.stats.running === 0 && out.appendixDoc.stats.timers === 0, out.appendixDoc.stats);
  if (shots) await p.screenshot({ path: path.join(shots, 'sa-appendix.jpg'), type: 'jpeg', quality: 70 });
  out.errors = errors.slice(0, 8); out.errorCount = errors.length; ok('no console / page errors', errors.length === 0, errors.slice(0, 3));
  out.fails = fails;
  console.log(JSON.stringify(out));
  console.log(fails.length ? 'standalone FAILED ' + fails.length : 'standalone OK');
  await b.close(); process.exit(fails.length ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });

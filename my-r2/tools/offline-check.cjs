// Offline acceptance of the deliverable (my-r2): open the final file with every network request blocked and check
//   (1) #compare opened directly: the state select is built from the build-time index (window.__JU_INDEX) before any concept ran,
//   (2) after three compare-combination switches (and a tour through the views) nothing outside the current view keeps running:
//       running animations and armed timers of instances off screen must be 0 (JUShell.stats),
//   (3) fonts: with the network blocked no font family used inside a phone falls back — every family resolves to an embedded face,
//   (4) 总览: every built concept's card has its four previews mounted (参加者首屏 / 局主首屏 / 局内详情 / 出席记录),
//   (5) 附录: the five-column coverage table page exists (and whether it has data), each concept opens without errors.
// Usage: node my-r2/tools/offline-check.cjs <file> <outdir>   → outdir/*.jpg + outdir/log.json, prints a JSON summary; exit 1 on a failed check
const L = require('./_lib.cjs'); const fs = L.fs, path = L.path;
(async () => {
  const [fileArg, out] = L.positionals(); const file = path.resolve(fileArg || L.DELIVERABLE); fs.mkdirSync(out || '.build/offline', { recursive: true }); const outdir = out || '.build/offline';
  const { b, p, errors, blocked } = await L.launch({ viewport: { width: 1440, height: 1000 }, offline: true });
  const fails = []; const ok = (name, cond, info) => { if (!cond) fails.push(name + (info ? ': ' + JSON.stringify(info).slice(0, 300) : '')); };
  const res = { file };
  /* (1) direct #compare */
  await p.goto('file://' + file + '#compare'); await p.waitForTimeout(3000);
  res.compareDirect = await p.evaluate(() => ({ view: (document.querySelector('.view.on') || {}).id, injectedIndex: (window.__JU_INDEX || []).length, states: document.querySelectorAll('#cmp-state option[value]:not([value=""])').length, hosts: document.querySelectorAll('.cmp-host').length, mounted: [...document.querySelectorAll('.cmp-host')].filter(h => h.shadowRoot && h.shadowRoot.querySelector('.ju-phone')).length }));
  ok('direct #compare: index injected before the controls', res.compareDirect.view === 'v-compare' && res.compareDirect.injectedIndex >= 50 && res.compareDirect.states >= res.compareDirect.injectedIndex, res.compareDirect);
  ok('direct #compare: stages mounted', res.compareDirect.hosts > 0 && res.compareDirect.mounted === res.compareDirect.hosts, res.compareDirect);
  await p.screenshot({ path: outdir + '/compare-direct.jpg', type: 'jpeg', quality: 70 });
  /* (2) three combination switches, then a view tour; count what still runs outside the current view */
  const META = await p.evaluate(() => window.__JU_META.map(c => c.code));
  const switches = []; const picks = META.length >= 3 ? [[META[0], META[1], META[2]], [META[1], META[2], ''], [META[2], META[0], META[1]]] : [[META[0], META[1] || '', ''], [META[1] || META[0], '', ''], [META[0], '', '']];
  await p.selectOption('#cmp-scope', 'pick');
  for (const [a, b2, c] of picks) { await p.selectOption('#cmp-a', a); if (b2) await p.selectOption('#cmp-b', b2); await p.selectOption('#cmp-c', c); await p.waitForTimeout(1800); switches.push(await p.evaluate(() => { const s = window.JUShell.stats(); return { hosts: document.querySelectorAll('.cmp-host').length, mounts: Object.keys(window.JUShell.mounts.compare).length, running: s.running, timers: s.timers, outsideRunning: s.runningOutsideCurrent, outsideTimers: s.timersOutsideCurrent }; })); }
  res.switches = switches;
  ok('compare switches unmount the previous combination', switches.every(s => s.mounts === s.hosts), switches);
  ok('after three switches nothing outside the current stages runs', switches.every(s => s.outsideRunning === 0 && s.outsideTimers === 0), switches);
  await p.screenshot({ path: outdir + '/compare-switched.jpg', type: 'jpeg', quality: 70 });
  /* tour: overview → each concept → appendix; off-screen instances must be asleep */
  await p.evaluate(() => { location.hash = '#overview'; }); await p.waitForTimeout(6000);
  res.overview = await p.evaluate(() => { const cards = [...document.querySelectorAll('.ov-card:not(.todo)')]; return { cards: cards.length, perCard: cards.map(c => ({ code: c.querySelector('.ov-code').textContent, previews: [...c.querySelectorAll('.ph-host')].filter(h => h.shadowRoot && h.shadowRoot.querySelector('.ju-phone') && h.shadowRoot.querySelector('.app')).length })), stats: window.JUShell.stats() }; });
  ok('overview: four previews per concept card', res.overview.cards === META.length && res.overview.perCard.every(c => c.previews === 4), res.overview.perCard);
  ok('overview: compare instances asleep', res.overview.stats.runningOutsideCurrent === 0 && res.overview.stats.timersOutsideCurrent === 0, res.overview.stats);
  await p.screenshot({ path: outdir + '/overview.jpg', type: 'jpeg', quality: 70 });
  res.concepts = {};
  for (const c of META) {
    const before = errors.length;
    await p.evaluate(c => { location.hash = '#concept/' + c; }, c); await p.waitForTimeout(1800);
    res.concepts[c] = await p.evaluate(c => { const h = document.querySelector('.stage-host.on'); if (!h || h.dataset.code !== c) return { mounted: false }; const fams = new Set(); h.shadowRoot.querySelectorAll('.ju-phone *').forEach(e => { const cs = getComputedStyle(e); if (cs.display !== 'none' && e.textContent && e.textContent.trim()) fams.add(cs.fontFamily.split(',')[0].replace(/["']/g, '').trim()); }); const s = window.JUShell.stats(); return { mounted: true, families: [...fams], outsideRunning: s.runningOutsideCurrent, outsideTimers: s.timersOutsideCurrent }; }, c);
    res.concepts[c].errors = errors.slice(before, before + 3);
    ok(c + ': mounted without errors', res.concepts[c].mounted && errors.length === before, res.concepts[c]);
    ok(c + ': other instances asleep', res.concepts[c].outsideRunning === 0 && res.concepts[c].outsideTimers === 0, res.concepts[c]);
    await p.screenshot({ path: outdir + '/' + c + '.jpg', type: 'jpeg', quality: 70 });
  }
  /* (3) fonts offline: every family used inside a phone must resolve to a loaded embedded face (no fallback) */
  const used = new Set(); Object.values(res.concepts).forEach(c => (c.families || []).forEach(f => used.add(f)));
  res.fonts = await p.evaluate((fams) => { const loaded = [...document.fonts].filter(f => f.status === 'loaded').map(f => f.family.replace(/["']/g, '')); const generic = /^(sans-serif|serif|monospace|system-ui|ui-monospace|ui-sans-serif|-apple-system|BlinkMacSystemFont|PingFang SC|Hiragino Sans GB|Microsoft YaHei|Helvetica|Arial|Segoe UI)$/i; const missing = fams.filter(f => !generic.test(f) && !loaded.includes(f) && !document.fonts.check('12px "' + f + '"')); const inlineFaces = (document.getElementById('ju-fonts') || { textContent: '' }).textContent.length; return { used: fams, loadedFaces: loaded.length, loadedFamilies: [...new Set(loaded)], missing, inlineCssBytes: inlineFaces }; }, [...used]);
  ok('fonts embedded (ju-fonts style has @font-face data)', res.fonts.inlineCssBytes > 1000, { inlineCssBytes: res.fonts.inlineCssBytes });
  ok('no font family used in a phone falls back offline', res.fonts.missing.length === 0, res.fonts.missing);
  /* (5) appendix coverage table */
  await p.evaluate(() => { location.hash = '#appendix/coverage-table'; }); await p.waitForTimeout(600);
  res.coverageTable = await p.evaluate(() => ({ on: (document.querySelector('.apx-tab.on') || {}).dataset ? document.querySelector('.apx-tab.on').dataset.doc : '', table: !!document.querySelector('.cov-table'), rows: document.querySelectorAll('.cov-table tbody tr').length, columns: [...document.querySelectorAll('.cov-table thead th')].map(t => t.textContent), notice: (document.querySelector('.apx-missing') || {}).textContent || '', stats: window.JUShell.stats() }));
  ok('appendix: coverage-table page exists', res.coverageTable.on === 'coverage-table' && (res.coverageTable.table || /尚未生成/.test(res.coverageTable.notice)), res.coverageTable);
  ok('appendix: five separate columns', !res.coverageTable.table || ['入口存在', '真实操作成功', '静态视觉已看', '正常速度动效已看', '仍需用户验收'].every(c => res.coverageTable.columns.includes(c)), res.coverageTable.columns);
  ok('appendix: everything asleep', res.coverageTable.stats.running === 0 && res.coverageTable.stats.timers === 0, res.coverageTable.stats);
  await p.screenshot({ path: outdir + '/appendix.jpg', type: 'jpeg', quality: 70 });
  res.blockedRequests = blocked.length; res.blocked = blocked.slice(0, 5); res.errorCount = errors.length; res.errors = errors.slice(0, 5); res.fails = fails;
  ok('no network requests attempted', blocked.length === 0, blocked.slice(0, 3));
  ok('no page / console errors', errors.length === 0, errors.slice(0, 3));
  fs.writeFileSync(path.join(outdir, 'log.json'), JSON.stringify(res, null, 1));
  console.log(JSON.stringify(Object.assign({}, res, { concepts: Object.fromEntries(Object.entries(res.concepts).map(([k, v]) => [k, { mounted: v.mounted, errors: v.errors }])) })));
  console.log(fails.length ? 'offline-check FAILED ' + fails.length + ': ' + fails.join(' | ') : 'offline-check OK');
  await b.close(); process.exit(fails.length ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });

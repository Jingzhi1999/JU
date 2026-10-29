// Verifier round 3: page-side timeline of real clicks at 1× (env paused): long tasks after the click, and per-rAF effective
// opacity (product of ancestors' opacity, clip ignored) of the old / new content blocks + the flying title, to find blank intervals
// (all content ≈ 0) and lag. node r3probe.cjs <out.json>
const L = require('/home/user/JU/my-r2/tools/_lib.cjs'); const os = require('os'); const fs = require('fs');
const ARM = `
var sels = a; var st = window.__tl = { t0: null, samples: [], long: [] };
try { new PerformanceObserver(function (l) { l.getEntries().forEach(function (e) { if (st.t0 != null) st.long.push([Math.round(e.startTime - st.t0), Math.round(e.duration)]); }); }).observe({ type: 'longtask', buffered: false }); } catch (x) { st.noLT = true; }
function eff(e) { var o = 1, n = e; while (n && n.nodeType === 1) { var c = getComputedStyle(n); o *= +c.opacity; if (c.visibility === 'hidden' || c.display === 'none') return 0; n = n.parentElement || (n.getRootNode && n.getRootNode().host) || null; if (n && n.classList && n.classList.contains('ju-phone')) break; } return Math.round(o * 100) / 100; }
function region(y0, y1) { var P = sr.querySelector('.ju-phone').getBoundingClientRect(); var best = 0, who = ''; var all = sr.querySelectorAll('*'); for (var i = 0; i < all.length; i++) { var e = all[i]; if (e.closest('.c05-ghost') || e.closest('[data-header]') && e.closest('.c05-hd')) continue; var has = false; for (var c = e.firstChild; c; c = c.nextSibling) if (c.nodeType === 3 && c.data.trim()) { has = true; break; } if (!has) continue; var b = e.getBoundingClientRect(); if (b.width < 2 || b.height < 2) continue; var cy = b.top + b.height / 2 - P.top; if (cy < y0 || cy > y1 || b.left > P.right || b.right < P.left) continue; var v = eff(e); if (v > best) { best = v; who = (e.textContent || '').trim().slice(0, 8); } } return Math.round(best * 100) / 100; }
function vis(q) { if (q === '@face') return region(95, 520); if (q === '@paper') return region(545, 790); var best = 0; Array.prototype.slice.call(sr.querySelectorAll(q)).forEach(function (e) { var b = e.getBoundingClientRect(); if (b.width < 2 || b.height < 2 || !(e.textContent || '').trim()) return; var v = eff(e); if (v > best) best = v; }); return best; }
sr.addEventListener('pointerdown', function () { if (st.t0 != null) return; st.t0 = performance.now(); (function loop() { var t = Math.round(performance.now() - st.t0); var row = [t]; sels.forEach(function (q) { row.push(vis(q)); }); st.samples.push(row); if (t < 1400) requestAnimationFrame(loop); })(); }, { capture: true });
return true;`;
(async () => {
  const { b, p, errors } = await L.launch({ viewport: { width: 480, height: 1000 } });
  await L.openConcept(p, '/home/user/JU/.build/verify-C05.html', 'C05', 1200);
  await L.E(p, 'C05', 'JU.shared.skins.pause(inst.envRef.current)'); await p.waitForTimeout(300);
  const res = { load: os.loadavg()[0].toFixed(2), runs: [] };
  const run = async (label, sel, sels, settle) => {
    await L.E(p, 'C05', ARM, sels); await p.waitForTimeout(80);
    const r = await L.clickSel(p, 'C05', sel); await p.waitForTimeout(1600);
    const tl = await p.evaluate(() => window.__tl);
    res.runs.push({ label, sels, click: r && r.x != null ? 'ok' : r, long: tl.long, samples: tl.samples });
    await p.waitForTimeout(settle || 300);
  };
  const HOME = ['@face', '@paper', '[data-surface=home] .c05-ttl', '.c05-ghost'];
  await run('role→hosted', '[data-role-tab=hosted]', HOME);
  await run('role→joined', '[data-role-tab=joined]', HOME);
  await run('section→history', '[data-section-tab=history]', HOME);
  await run('section→current', '[data-section-tab=current]', HOME);
  await run('B row→detail', '[data-scroller=home] [data-rid=dimsum]', ['@face', '@paper', '.c05-ghost']);
  await run('B detail→back', '[data-surface=detail] [data-act=back]', ['@face', '@paper', '.c05-ghost']);
  await L.E(p, 'C05', "sr.querySelectorAll('[data-scroller]').forEach(function (s) { s.scrollTop = 0; s.dispatchEvent(new Event('scroll')); });"); await p.waitForTimeout(500);
  await run('A row→ticket', '[data-scroller=home] [data-rid=run3k]', ['[data-surface=home] .c05-zb', '[data-surface=home] .c05-list .c05-row', '[data-surface=ticket] .c05-hd', '.c05-ghost'], 6500);
  await run('A ticket→back (settled 8s)', '[data-surface=ticket] [data-act=back]', ['[data-surface=ticket] .c05-hd', '[data-surface=ticket] .ju-ticket-face', '[data-surface=home] .c05-ttl', '[data-surface=home] .c05-zb', '[data-surface=home] .c05-list .c05-row', '.c05-ghost']);
  await L.E(p, 'C05', "sr.querySelectorAll('[data-scroller]').forEach(function (s) { s.scrollTop = 0; s.dispatchEvent(new Event('scroll')); });"); await p.waitForTimeout(500);
  await run('A2 row→ticket', '[data-scroller=home] [data-rid=run3k]', ['[data-surface=ticket] .c05-hd'], 400);
  await run('A2 ticket→back during print', '[data-surface=ticket] [data-act=back]', ['[data-surface=ticket] .c05-hd', '[data-surface=ticket] .c05-tk-wait, [data-surface=ticket] .c05-tk-hint', '[data-surface=home] .c05-ttl', '[data-surface=home] .c05-zb', '[data-surface=home] .c05-list .c05-row', '.c05-ghost']);
  res.errors = errors.slice(0, 5); fs.writeFileSync(process.argv[2], JSON.stringify(res, null, 1));
  // summary: first sample where anything changed vs t=0, blank intervals (every tracked block ≤ .08), long tasks
  for (const r of res.runs) {
    const s = r.samples; if (!s.length) { console.log(r.label, 'no samples', r.click); continue; }
    const base = s[0].slice(1).join(','); const first = s.find(x => x.slice(1).join(',') !== base);
    const nf = r.sels.filter(q => q[0] === '@').length || r.sels.length; const blanks = s.filter(x => x.slice(1, 1 + nf).every(v => v <= 0.12)).map(x => x[0]);
    const span = blanks.length ? `${blanks[0]}–${blanks[blanks.length - 1]}ms (${blanks.length} rAF)` : 'none';
    console.log(`${r.label.padEnd(30)} first change ${first ? first[0] + 'ms' : 'none'} · all-tracked≈0 ${span} · longtasks ${JSON.stringify(r.long)} · frames ${s.length}`);
  }
  await b.close();
})().catch(e => { console.error(e); process.exit(1); });

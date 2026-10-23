// Width / text-size / safe-area robustness check (my-r2): renders a concept's phone at 360×780, 375×812, 390×844 and 430×932
// for a few states, then at 390×844 with 文字 115% (toggleZoom) and with the safe-area simulation (toggleSafe), and tiles them.
// Usage: JU_STANDALONE=.build/C05.html node my-r2/tools/widths.cjs C05 [outdir] [states csv]
//   → outdir/sheet.png (+ per-shot png), prints horizontal-overflow findings, the smallest font size (must be ≥ 12px),
//     font-size invariance across widths (no page scaling: the largest / smallest font of a state must not change with width),
//     and whether .app carries a transform (forbidden). Text sized in cqw (self or an ancestor's inline font-size) is the V27 局卡
//     original copied verbatim (it scales with its 4:5 container and carries 5–8px label text by design) and is left out of minFont,
//     like the ritual canvases / rigs are left out of overflow (incl. the 08 散场 scene inside [data-t08-scope]: its stage sits −20px
//     outside each side and its canvas another 24px, by the original's design). Default states: j-home,h-home,j-d-tear,h-m-attendance,j-many,h-pending,b-long,b-long-h
const L = require('./_lib.cjs'); const fs = L.fs, path = L.path;
const [code, outArg, statesArg] = L.positionals();
if (!code) { console.error('usage: node my-r2/tools/widths.cjs <CODE> [outdir] [states csv]'); process.exit(2); }
(async () => {
  const outdir = outArg || path.resolve('.build', code + '-widths'); fs.mkdirSync(outdir, { recursive: true });
  const states = (statesArg || 'j-home,h-home,j-d-tear,h-m-attendance,j-many,h-pending,b-long,b-long-h').split(',');
  const sizes = [[360, 780], [375, 812], [390, 844], [430, 932]];
  const { b, p, errors } = await L.launch({ viewport: { width: 1400, height: 1100 } });
  const ok = await L.openConcept(p, L.fileFor(code), code, 900);
  if (!ok) { console.log(JSON.stringify({ code, error: 'concept not mounted', errors })); await b.close(); process.exit(1); }
  const findings = []; const fontLog = []; const shots = []; let n = 0; const api = {};
  const MEASURE = "var ph = sr.querySelector('.ju-phone'); var pr = ph.getBoundingClientRect(); var over = [];\n" +
    "ph.querySelectorAll('*').forEach(function (el) { var cs = getComputedStyle(el); if (cs.display === 'none' || cs.visibility === 'hidden' || cs.position === 'fixed') return; var b = el.getBoundingClientRect(); if (b.width === 0 || b.height === 0) return; if (cs.transform !== 'none') return; if (el.matches && el.matches('[data-jurig], [data-tear] canvas, [data-burn] canvas, [data-burn] svg, [data-print-stage] canvas, [data-t08-scope] *')) return; var anc = el.parentElement, moved = false; while (anc && anc !== ph) { var t = getComputedStyle(anc).transform; if (t && t !== 'none') { var m = t.match(/matrix\\(([^)]+)\\)/); if (!m) { moved = true; break; } var v = m[1].split(',').map(Number); if (Math.abs(v[4]) > 0.5 || Math.abs(v[5]) > 0.5) { moved = true; break; } } anc = anc.parentElement; } if (moved) return; if (b.right > pr.right + 2 || b.left < pr.left - 2) { var ov = (el.parentElement && getComputedStyle(el.parentElement).overflowX) || ''; if (ov === 'hidden' || ov === 'auto' || ov === 'scroll' || ov === 'clip') return; over.push((el.tagName.toLowerCase() + '.' + String(el.className || '').split(' ').slice(0, 2).join('.')) + ' ' + Math.round(b.left - pr.left) + '…' + Math.round(b.right - pr.left)); } });\n" +
    "var max = 0, min = 99, minEl = ''; ph.querySelectorAll('h1,h2,h3,h4,p,span,div,button,input,label,a,li,td,th,small,em,strong,b,i,time').forEach(function (el) { if (!el.childNodes.length || !el.textContent.trim()) return; var direct = Array.prototype.some.call(el.childNodes, function (nd) { return nd.nodeType === 3 && nd.nodeValue.trim(); }); if (!direct) return; var cs = getComputedStyle(el); if (cs.display === 'none' || cs.visibility === 'hidden') return; var b = el.getBoundingClientRect(); if (!b.width || !b.height) return; if (el.closest('.ju-panel')) return; var cqa = el, cq = false; while (cqa && cqa !== ph) { if (cqa.style && /cqw/.test(cqa.style.fontSize || '')) { cq = true; break; } cqa = cqa.parentElement; } if (cq) return; var f = parseFloat(cs.fontSize); if (f > max) max = f; if (f < min && f > 0) { min = f; minEl = el.tagName.toLowerCase() + '.' + String(el.className || '').split(' ')[0] + ' «' + el.textContent.trim().slice(0, 12) + '»'; } });\n" +
    "var app = ph.querySelector('.app'); var tr = app ? getComputedStyle(app).transform : 'none'; var cls = ph.className;\n" +
    "return { x: pr.left, y: pr.top, w: pr.width, h: pr.height, over: over.slice(0, 6), max: max, min: min, minEl: minEl, transform: tr, phoneCls: cls };";
  async function measure(pass, w, s) {
    const r = await L.E(p, code, MEASURE);
    if (r.over.length) findings.push(`${pass} ${w}px ${s}: overflow ${r.over.join(' | ')}`);
    if (r.min < 12) findings.push(`${pass} ${w}px ${s}: smallest text ${r.min}px (${r.minEl})`);
    if (r.transform && r.transform !== 'none') findings.push(`${pass} ${w}px ${s}: .app transform ${r.transform}`);
    fontLog.push({ pass, w, s, max: r.max, min: r.min, transform: r.transform, phoneCls: r.phoneCls });
    const f = `${outdir}/f${String(n++).padStart(2, '0')}-${pass}-${w}-${s}.png`; await L.shot(p, { x: r.x, y: r.y, w: r.w, h: r.h }, f); shots.push([f, `${pass} ${w} ${s}`]);
  }
  for (const [w, h] of sizes) {
    await L.E(p, code, 'inst.setPhoneSize(a[0], a[1])', [w, h]); await p.waitForTimeout(300);
    for (const s of states) { await L.jump(p, code, s, 650); await measure('w', w, s); }
  }
  await L.E(p, code, 'inst.setPhoneSize(390, 844)'); await p.waitForTimeout(300);
  for (const k of ['zoom', 'safe']) {
    api[k] = await L.setToggle(p, code, k, true); if (api[k] !== 'ok') { findings.push(`no ${k} toggle on the instance (R2 mixin toggle${k[0].toUpperCase() + k.slice(1)} missing)`); continue; }
    await p.waitForTimeout(300);
    const has = await L.E(p, code, "return sr.querySelector('.ju-phone').classList.contains(a)", k); if (!has) findings.push(`toggle${k[0].toUpperCase() + k.slice(1)}() did not put .${k} on .ju-phone (panel wiring)`);
    for (const s of states) { await L.jump(p, code, s, 650); await measure(k, 390, s); }
    await L.setToggle(p, code, k, false); await p.waitForTimeout(200);
  }
  await b.close();
  L.tilePy(outdir, chunk(shots.map(x => x[0]), states.length), path.join(outdir, 'sheet.png'), { scale: 0.46, labels: chunk(shots.map(x => x[1]), states.length), bg: '230,228,224' });
  // invariance: the largest and smallest font sizes of a state must not change with width (no page scaling); zoom must enlarge them
  const inv = []; states.forEach(st => { const rows = fontLog.filter(r => r.pass === 'w' && r.s === st); const maxes = new Set(rows.map(r => r.max)), mins = new Set(rows.map(r => r.min)); if (maxes.size > 1 || mins.size > 1) inv.push(`${st}: max ${[...maxes].join('/')} min ${[...mins].join('/')}`); });
  const zoomCheck = states.map(st => { const w = fontLog.find(r => r.pass === 'w' && r.w === 390 && r.s === st), z = fontLog.find(r => r.pass === 'zoom' && r.s === st); return (w && z) ? { s: st, grew: z.max > w.max + 0.5 || z.min > w.min + 0.5 } : null; }).filter(Boolean);
  const notGrown = zoomCheck.filter(z => !z.grew).map(z => z.s);
  if (api.zoom === 'ok' && notGrown.length) findings.push('文字 115% did not enlarge text in: ' + notGrown.join(', '));
  const minFont = Math.min(...fontLog.filter(r => r.pass === 'w').map(r => r.min));
  L.writeLog(outdir, { code, shots: n, overflow: findings.filter(f => /overflow/.test(f)), findings, fontInvariance: inv, minFont, fontLog, api, errors });
  console.log(JSON.stringify({ code, shots: n, sheet: path.join(outdir, 'sheet.png'), overflow: findings.filter(f => /overflow/.test(f)), findings: findings.filter(f => !/overflow/.test(f)), fontInvariance: inv, minFont, api, errors: errors.length }));
  function chunk(a, k) { const out = []; for (let i = 0; i < a.length; i += k) out.push(a.slice(i, i + k)); return out; }
})().catch(e => { console.error(e); process.exit(1); });

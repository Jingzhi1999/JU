// Cross-concept transition probe (verifier tool, scratchpad). Real clicks at 1×, environment paused, document scroll locked.
// For every rAF after the pointerdown it samples the phone's CONTENT text (all text except role / section tabs, back buttons and the
// bottom root nav): effective opacity (ancestor opacity × text colour alpha) and occlusion (elementsFromPoint stack, after the click
// every element is made hit-testable so pointer-events:none layers count; a layer covers only if it is ≥50% opaque and paints a
// background / image). Per sample: blank (no content text visible above 0.3), oneLine (visible content text fits in ≤76px of height),
// overlap pairs (two different visible text line boxes intersecting ≥30% of the smaller one), and visible copies of every event title.
// A CDP screencast runs at the same time; a small magenta marker in the phone's bottom-left shows the probe sample number (#k +ms).
// Usage: node xprobe.cjs <CODE> <build.html> <outdir> <rawdir>
const L = require('/home/user/JU/my-r2/tools/_lib.cjs'); const fs = L.fs, path = L.path; const os = require('os');
const [code, file, outdir, rawdir] = process.argv.slice(2);
const DUR = 1300, SETTLE = 900;
const INSTALL = `
var ctx = window.__xpCtx = { sr: sr, inst: inst };
var ph = sr.querySelector('.ju-phone');
var mark = document.createElement('div'); mark.className = '__xpmark';
mark.style.cssText = 'position:absolute;left:3px;bottom:3px;z-index:2147483647;pointer-events:none;font:700 12px/14px Menlo,monospace;color:#fff;background:rgba(214,0,140,.78);padding:1px 4px;border-radius:3px;';
mark.textContent = '#-'; ph.appendChild(mark);
var CH = '[data-role-tab],[data-section-tab],[data-act="back"],.__xpmark';
var NAV = { '找局': 1, '开局': 1, '我的局': 1, '设置': 1 };
function norm(s) { return (s || '').replace(/[\\s\\u00a0\\u200b\\u2009]+/g, ''); }
var TITLES = {}; try { var ev = inst.state.data.events || {}; Object.keys(ev).forEach(function (k) { var t = ev[k] && ev[k].title; if (t) TITLES[norm(t)] = t; }); } catch (x) { }
var opm = new Map();
function op(e) { if (opm.has(e)) return opm.get(e); var v = 1; if (e !== ph) { var c = getComputedStyle(e); if (c.display === 'none') v = 0; else { var par = e.parentElement || (e.parentNode && e.parentNode.host) || null; v = (+c.opacity) * (par && ph.contains(par) ? op(par) : 1); } } opm.set(e, v); return v; }
function alpha(col) { var m = /rgba?\\(([^)]+)\\)/.exec(col || ''); if (!m) return 1; var p = m[1].split(/[\\s,\\/]+/).filter(Boolean); if (p.length < 4) return 1; var a = p[3]; return /%$/.test(a) ? parseFloat(a) / 100 : +a; }
function minStopAlpha(bi) { if (/url\\(/.test(bi)) return 1; var m = bi.match(/rgba?\\([^)]+\\)/g); if (!m) return 0; var lo = 1; m.forEach(function (c) { var a = alpha(c); if (a < lo) lo = a; }); return lo; }
function pseudoPaints(s, c) { var R = s.getBoundingClientRect(); var pss = ['::before', '::after']; for (var i = 0; i < 2; i++) { var q = getComputedStyle(s, pss[i]); if (!q || q.content === 'none' || q.content === 'normal' || q.display === 'none' || q.visibility !== 'visible') continue; if (op(s) * (+q.opacity) < 0.5) continue; var w = parseFloat(q.width), h = parseFloat(q.height); if (!(w >= 0.6 * R.width && h >= 0.6 * R.height)) continue; if (alpha(q.backgroundColor) >= 0.5) return true; if (q.backgroundImage && q.backgroundImage !== 'none' && minStopAlpha(q.backgroundImage) >= 0.5) return true; } return false; }
function paints(s) { if (op(s) < 0.5) return false; var c = getComputedStyle(s); if (c.visibility !== 'visible') return false; if (s.tagName === 'IMG' || s.tagName === 'VIDEO' || s.tagName === 'CANVAS') return true; if (alpha(c.backgroundColor) >= 0.5) return true; if (c.backgroundImage && c.backgroundImage !== 'none' && minStopAlpha(c.backgroundImage) >= 0.5) return true; return pseudoPaints(s, c); }
function rgbaOf(col) { var m = /rgba?\\(([^)]+)\\)/.exec(col || ''); if (!m) return null; var p = m[1].split(/[\\s,\\/]+/).filter(Boolean); if (p.length < 3) return null; var a = p.length > 3 ? (/%$/.test(p[3]) ? parseFloat(p[3]) / 100 : +p[3]) : 1; return [+p[0], +p[1], +p[2], a]; }
function lumOf(c) { var v = [c[0], c[1], c[2]].map(function (x) { x /= 255; return x <= 0.03928 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4); }); return 0.2126 * v[0] + 0.7152 * v[1] + 0.0722 * v[2]; }
function avgStops(bi) { var m = bi.match(/rgba?\\([^)]+\\)/g); if (!m) return null; var acc = [0, 0, 0], n = 0; m.forEach(function (c) { var v = rgbaOf(c); if (v && v[3] >= 0.5) { acc[0] += v[0]; acc[1] += v[1]; acc[2] += v[2]; n++; } }); return n ? [acc[0] / n, acc[1] / n, acc[2] / n] : null; }
var ENVBG = [238, 232, 240];
function bgColorOf(s) { if (s.tagName === 'IMG' || s.tagName === 'VIDEO' || s.tagName === 'CANVAS') return 'unknown'; var c = getComputedStyle(s); var b = rgbaOf(c.backgroundColor); if (b && b[3] >= 0.5) return b; if (c.backgroundImage && c.backgroundImage !== 'none') { if (/url\\(/.test(c.backgroundImage)) return 'unknown'; var g = avgStops(c.backgroundImage); if (g) return g; } var pss = ['::before', '::after']; for (var i = 0; i < 2; i++) { var q = getComputedStyle(s, pss[i]); if (!q || q.content === 'none' || q.content === 'normal') continue; var pb = rgbaOf(q.backgroundColor); if (pb && pb[3] >= 0.5) return pb; if (q.backgroundImage && q.backgroundImage !== 'none') { var pg = avgStops(q.backgroundImage); if (pg) return pg; } } return null; }
/* legible = the text colour (with its effective opacity) differs enough from what is behind it: contrast >= 1.5 */
function legible(e, st, i) { var bg = null; for (var j = i; j < st.length; j++) { var s = st[j]; if (op(s) < 0.5 && s !== e) continue; var b = bgColorOf(s); if (b === 'unknown') return true; if (b) { bg = b; break; } } if (!bg) bg = ENVBG; var c = getComputedStyle(e); var fg = rgbaOf(c.webkitTextFillColor || c.color) || [0, 0, 0, 1]; var o = op(e) * fg[3] * (e.__xpm == null ? 1 : e.__xpm) * (e.__xpatt == null ? 1 : e.__xpatt); var mix = [0, 1, 2].map(function (k) { return o * fg[k] + (1 - o) * bg[k]; }); var L1 = lumOf(mix), L2 = lumOf(bg); var cr = (Math.max(L1, L2) + 0.05) / (Math.min(L1, L2) + 0.05); return cr >= 1.5; }
function parseArgs(t) { var out = [], d = 0, cur = ''; for (var i = 0; i < t.length; i++) { var ch = t[i]; if (ch === '(') d++; if (ch === ')') d--; if (ch === ',' && d === 0) { out.push(cur.trim()); cur = ''; continue; } cur += ch; } if (cur.trim()) out.push(cur.trim()); return out; }
/* product of the linear-gradient mask alphas of e and its ancestors at (x, y) — masks hide text without any opacity / clip trace */
function maskAt(el, x, y) { var m = 1; for (var z = el; z && z !== ph; z = z.parentElement || (z.getRootNode && z.getRootNode().host) || null) { var c = getComputedStyle(z); var mi = c.maskImage || c.webkitMaskImage; if (!mi || mi === 'none') continue; var mm = /^linear-gradient\\((.*)\\)$/.exec(mi.trim()); if (!mm) continue; var args = parseArgs(mm[1]); var dir = 'b'; if (/^(to |[-\\d.]+deg)/.test(args[0])) { var a0 = args.shift(); if (/to top|^0deg|^360deg/.test(a0)) dir = 't'; else if (/to right|^90deg/.test(a0)) dir = 'r'; else if (/to left|^270deg/.test(a0)) dir = 'l'; else if (/to bottom|^180deg/.test(a0)) dir = 'b'; else continue; } var R = z.getBoundingClientRect(); var len = (dir === 'b' || dir === 't') ? R.height : R.width; if (len <= 0) continue; var pos = dir === 'b' ? y - R.top : dir === 't' ? R.bottom - y : dir === 'r' ? x - R.left : R.right - x; var stops = args.map(function (a) { var col = (a.match(/rgba?\\([^)]*\\)|transparent|black|white/i) || [''])[0]; var rest = a.replace(col, ''); var al = col === 'transparent' ? 0 : (rgbaOf(col) ? rgbaOf(col)[3] : 1); var pm = /(-?[\\d.]+)(px|%)/.exec(rest); var pp = pm ? (pm[2] === '%' ? +pm[1] / 100 * len : +pm[1]) : null; return [pp, al]; }); if (!stops.length) continue; if (stops[0][0] == null) stops[0][0] = 0; if (stops[stops.length - 1][0] == null) stops[stops.length - 1][0] = len; for (var i = 1; i < stops.length - 1; i++) if (stops[i][0] == null) { var j = i; while (stops[j][0] == null) j++; var a1 = stops[i - 1][0], b1 = stops[j][0]; for (var k = i; k < j; k++) stops[k][0] = a1 + (b1 - a1) * (k - i + 1) / (j - i + 1); } var al = stops[stops.length - 1][1]; if (pos <= stops[0][0]) al = stops[0][1]; else for (var q = 0; q < stops.length - 1; q++) { var A = stops[q], B = stops[q + 1]; if (pos >= A[0] && pos <= B[0]) { al = B[0] > A[0] ? A[1] + (B[1] - A[1]) * (pos - A[0]) / (B[0] - A[0]) : B[1]; break; } } m *= al; } return m; }
function avgStopAlpha(bi) { if (/url\\(/.test(bi)) return 1; var m = bi.match(/rgba?\\([^)]+\\)/g); if (!m) return 0; var t = 0; m.forEach(function (c) { var v = rgbaOf(c); t += v ? v[3] : 1; }); return t / m.length; }
/* how much of what is below a layer it hides at this point: opacity × background alpha (solid / gradient average / big ::before ::after); images, video, canvas count as opaque */
function coverAlpha(s) { var c = getComputedStyle(s); if (c.visibility !== 'visible') return 0; var o = op(s); if (o <= 0) return 0; if (s.tagName === 'IMG' || s.tagName === 'VIDEO' || s.tagName === 'CANVAS') return o; var a = 0; var b = rgbaOf(c.backgroundColor); if (b) a = Math.max(a, b[3]); if (c.backgroundImage && c.backgroundImage !== 'none') a = Math.max(a, avgStopAlpha(c.backgroundImage)); if (a < 1) { var R = s.getBoundingClientRect(); var pss = ['::before', '::after']; for (var i = 0; i < 2; i++) { var q = getComputedStyle(s, pss[i]); if (!q || q.content === 'none' || q.content === 'normal' || q.display === 'none' || q.visibility !== 'visible') continue; var w = parseFloat(q.width), h = parseFloat(q.height); if (!(w >= 0.6 * R.width && h >= 0.6 * R.height)) continue; var pa = 0; var pb = rgbaOf(q.backgroundColor); if (pb) pa = pb[3]; if (q.backgroundImage && q.backgroundImage !== 'none') pa = Math.max(pa, avgStopAlpha(q.backgroundImage)); a = Math.max(a, pa * (+q.opacity)); } } return o * a; }
function uncovered(e, x, y) { var ia = []; for (var a = e; a && a.nodeType === 1; a = a.parentElement) if (a.hasAttribute('inert')) { ia.push(a); a.removeAttribute('inert'); } var pv = e.style.getPropertyValue('pointer-events'), pp = e.style.getPropertyPriority('pointer-events'); e.style.setProperty('pointer-events', 'auto', 'important'); var st = sr.elementsFromPoint(x, y); if (pv) e.style.setProperty('pointer-events', pv, pp); else e.style.removeProperty('pointer-events'); for (var k = 0; k < ia.length; k++) ia[k].setAttribute('inert', ''); var o0 = (e.__xpo == null ? 1 : e.__xpo), att = 1; for (var i = 0; i < st.length; i++) { var s = st[i]; if (s === e || e.contains(s)) { e.__xpatt = att; return legible(e, st, i); } if (s.contains(e)) continue; var ca = coverAlpha(s); if (ca > 0) { att *= (1 - Math.min(1, ca)); if (o0 * att <= 0.3) return false; } } return false; }
function trects(e) { var out = []; for (var c = e.firstChild; c; c = c.nextSibling) if (c.nodeType === 3 && c.data.trim()) { var r = document.createRange(); r.selectNodeContents(c); var rs = r.getClientRects(); for (var i = 0; i < rs.length; i++) if (rs[i].width > 0.5 && rs[i].height > 0.5) out.push(rs[i]); } return out; }
function dtext(e) { var s = ''; for (var c = e.firstChild; c; c = c.nextSibling) if (c.nodeType === 3) s += c.data; return s; }
function uninert() { var l = sr.querySelectorAll('[inert]'); for (var i = 0; i < l.length; i++) { l[i].removeAttribute('inert'); l[i].setAttribute('data-xp-inert', ''); } }
function reinert() { var l = sr.querySelectorAll('[data-xp-inert]'); for (var i = 0; i < l.length; i++) { l[i].setAttribute('inert', ''); l[i].removeAttribute('data-xp-inert'); } }
function sample() {
  if (window.__xpLive) uninert();
  opm.clear(); var PR = ph.getBoundingClientRect(); var tw = document.createTreeWalker(ph, NodeFilter.SHOW_TEXT); var seen = new Set(), items = [], n;
  while ((n = tw.nextNode())) {
    if (!n.data.trim()) continue; var e = n.parentElement; if (!e || seen.has(e)) continue; seen.add(e);
    if (e.closest(CH)) continue; var r = e.getBoundingClientRect();
    if (r.width < 1 || r.height < 1 || r.bottom <= PR.top || r.top >= PR.bottom || r.right <= PR.left || r.left >= PR.right) continue;
    var c = getComputedStyle(e); if (c.visibility !== 'visible') continue;
    var o = op(e) * alpha(c.webkitTextFillColor || c.color); if (o <= 0.3) continue;
    var tr0 = trects(e)[0]; if (!tr0) continue; var inside = (Math.min(tr0.bottom, PR.bottom) - Math.max(tr0.top, PR.top)) / tr0.height; if (inside < 0.6) continue;
    var mk = maskAt(e, tr0.left + tr0.width / 2, tr0.top + tr0.height / 2); e.__xpm = mk; o = o * mk; if (o <= 0.3) continue;
    var dt = norm(dtext(e)); if (NAV[dt] && r.top > PR.bottom - 130) continue;
    e.__xpo = o; items.push({ e: e, r: r, o: o, dt: dt });
  }
  items.sort(function (a, b) { return b.o - a.o; });
  var vis = 0, top = 1e9, bot = -1e9, lines = [];
  for (var i = 0; i < items.length; i++) {
    var it = items[i]; var tr = trects(it.e); if (!tr.length) continue; var q = tr[0];
    var x = Math.min(Math.max(q.left + q.width / 2, PR.left + 1), PR.right - 1), y = Math.min(Math.max(q.top + q.height / 2, PR.top + 1), PR.bottom - 1);
    if (!uncovered(it.e, x, y)) continue; it.vis = true; vis++; if (lines.length < 3) lines.push(it.dt.slice(0, 14));
    tr.forEach(function (q) { if (q.top < top) top = q.top; if (q.bottom > bot) bot = q.bottom; }); if (bot - top > 76) break;
  }
  if (window.__xpDebug) { window.__xpDbg = window.__xpDbg || []; window.__xpDbg.push(items.slice(0, 8).map(function (it) { var tr = trects(it.e); var q = tr[0]; return [it.dt.slice(0, 10), +it.o.toFixed(2), q ? Math.round(q.top - PR.top) : null, q ? coverOf(it.e, q.left + q.width / 2, q.top + q.height / 2) : 'no-rect', it.e.closest('.c05-snapo') ? 'CLONE' : '']; })); }
  var blank = vis ? 0 : 1, one = (vis && bot - top <= 76) ? 1 : 0;
  var pairs = [], arr = items.slice().sort(function (a, b) { return a.r.top - b.r.top; });
  for (var a = 0; a < arr.length; a++) for (var b = a + 1; b < arr.length && arr[b].r.top < arr[a].r.bottom; b++) {
    var A = arr[a], B = arr[b]; if (A.e.contains(B.e) || B.e.contains(A.e)) continue; if (A.r.right <= B.r.left || B.r.right <= A.r.left) continue;
    if (!A.dt || !B.dt) continue;
    var ra = trects(A.e), rb = trects(B.e), hit = null;
    for (var u = 0; u < ra.length && !hit; u++) for (var w = 0; w < rb.length && !hit; w++) { var qa = ra[u], qb = rb[w]; var ix = Math.min(qa.right, qb.right) - Math.max(qa.left, qb.left), iy = Math.min(qa.bottom, qb.bottom) - Math.max(qa.top, qb.top); if (ix <= 0 || iy <= 0) continue; var sm = Math.min(qa.width * qa.height, qb.width * qb.height); if (ix * iy >= 0.3 * sm) hit = { x: Math.max(qa.left, qb.left) + ix / 2, y: Math.max(qa.top, qb.top) + iy / 2 }; }
    if (!hit) continue; if (A.dt === B.dt && ra.length && rb.length && Math.abs(ra[0].left - rb[0].left) <= 3 && Math.abs(ra[0].top - rb[0].top) <= 3) continue; if (!uncovered(A.e, hit.x, hit.y) || !uncovered(B.e, hit.x, hit.y)) continue;
    var k = [A.dt.slice(0, 20), B.dt.slice(0, 20)].sort().join(' ⟂ '); if (pairs.indexOf(k) < 0) pairs.push(k);
  }
  var tc = null, matched = new Set(), pos = {};
  for (var j = 0; j < items.length; j++) {
    var it2 = items[j]; var cand = [it2.e, it2.e.parentElement, it2.e.parentElement && it2.e.parentElement.parentElement];
    for (var z = 0; z < cand.length; z++) { var el = cand[z]; if (!el || !ph.contains(el)) continue; var t = norm(el.textContent); if (TITLES[t]) { if (!matched.has(el)) { var ok = it2.vis; if (ok === undefined) { var tr2 = trects(it2.e); ok = tr2.length ? uncovered(it2.e, tr2[0].left + tr2[0].width / 2, tr2[0].top + tr2[0].height / 2) : false; } if (ok) { matched.add(el); var rr = trects(it2.e)[0] || it2.r; var key = TITLES[t]; pos[key] = pos[key] || []; if (!pos[key].some(function (q) { return Math.abs(q[0] - rr.left) <= 3 && Math.abs(q[1] - rr.top) <= 3; })) { pos[key].push([rr.left, rr.top]); tc = tc || {}; tc[key] = (tc[key] || 0) + 1; } } } break; } }
  }
  return { blank: blank, one: one, pairs: pairs, tc: tc, n: items.length, vis: vis, lines: lines };
}
function coverOf(e, x, y) { var ia = []; for (var a = e; a && a.nodeType === 1; a = a.parentElement) if (a.hasAttribute('inert')) { ia.push(a); a.removeAttribute('inert'); } var pv = e.style.getPropertyValue('pointer-events'), pp = e.style.getPropertyPriority('pointer-events'); e.style.setProperty('pointer-events', 'auto', 'important'); var st = sr.elementsFromPoint(x, y); if (pv) e.style.setProperty('pointer-events', pv, pp); else e.style.removeProperty('pointer-events'); for (var k = 0; k < ia.length; k++) ia[k].setAttribute('inert', ''); for (var i = 0; i < st.length; i++) { var s = st[i]; if (s === e || e.contains(s)) return 'VISIBLE'; if (s.contains(e)) continue; if (paints(s)) { var c = getComputedStyle(s); return 'COVER ' + s.tagName + '.' + String(s.className).trim().split(/\\s+/).slice(0, 2).join('.') + ' op' + op(s).toFixed(2) + ' bg' + c.backgroundColor + (c.backgroundImage !== 'none' ? ' bi' + c.backgroundImage.slice(0, 40) : ''); } } return 'NOT-HIT'; }
function diag(max) { opm.clear(); var PR = ph.getBoundingClientRect(); var tw = document.createTreeWalker(ph, NodeFilter.SHOW_TEXT); var seen = new Set(), out = [], n; while ((n = tw.nextNode()) && out.length < (max || 12)) { if (!n.data.trim()) continue; var e = n.parentElement; if (!e || seen.has(e)) continue; seen.add(e); if (e.closest(CH)) continue; var r = e.getBoundingClientRect(); if (r.width < 1 || r.height < 1 || r.bottom <= PR.top || r.top >= PR.bottom) continue; var c = getComputedStyle(e); if (c.visibility !== 'visible') continue; var o = op(e) * alpha(c.webkitTextFillColor || c.color); if (o <= 0.3) continue; var tr = trects(e); if (!tr.length) continue; var q = tr[0]; out.push([n.data.trim().slice(0, 10), +o.toFixed(2), Math.round(q.top - PR.top), coverOf(e, q.left + q.width / 2, q.top + q.height / 2)]); } return out; }
var peStyle = document.createElement('style'); peStyle.textContent = '*:not(#__xp1#__xp2#__xp3) { pointer-events: auto !important; }';
window.__xp = {
  diag: diag,
  arm: function (dur) {
    var st = window.__xp.st = { t0: null, s: [], done: false, epoch: null };
    function onDown() { if (st.t0 != null) return; st.t0 = performance.now(); st.epoch = performance.timeOrigin + st.t0; var k = 0;
      var mc = new MessageChannel(); var next = function () { requestAnimationFrame(function () { mc.port2.postMessage(0); }); };
      var take = function () { var t = Math.round(performance.now() - st.t0); var r = sample(); st.s.push([t, r.blank, r.one, r.pairs, r.tc, r.n, r.vis, r.lines]); mark.textContent = '#' + k + ' +' + t; k++; return t; };
      sr.appendChild(peStyle); uninert(); take(); reinert(); if (peStyle.parentNode) peStyle.parentNode.removeChild(peStyle);   /* #0 = the painted state at pointerdown (baseline), measured with the same hit-testing as later samples, then the page is restored before pointerup */
      mc.port1.onmessage = function () { var t = take(); if (t < dur) next(); else { st.done = true; window.__xpLive = false; reinert(); if (peStyle.parentNode) peStyle.parentNode.removeChild(peStyle); mark.textContent = '#end'; } };
      next(); }   /* later samples run in a task posted from rAF = after that frame's style / layout / paint, i.e. the state that was painted */
    function onClick() { setTimeout(function () { sr.appendChild(peStyle); window.__xpLive = true; uninert(); }, 0); }
    sr.addEventListener('pointerdown', onDown, { capture: true, once: true }); sr.addEventListener('click', onClick, { capture: true, once: true });
    return true;
  }
};
return Object.keys(TITLES).length;`;
// click-target resolvers (run in page; return {x, y, desc} in viewport coordinates or {err})
const VIS = "function vis(e) { var b = e.getBoundingClientRect(), P = sr.querySelector('.ju-phone').getBoundingClientRect(); return b.width > 2 && b.height > 2 && b.bottom > P.top + 2 && b.top < P.bottom - 2 && getComputedStyle(e).visibility === 'visible'; }";
const ROW = VIS + "var rid = a; var els = Array.prototype.slice.call(sr.querySelectorAll('[data-surface=home] [data-rid=\"' + rid + '\"]')); if (!els.length) els = Array.prototype.slice.call(sr.querySelectorAll('[data-rid=\"' + rid + '\"]')); var rows = els.filter(function (e) { return e.hasAttribute('data-origin'); }); var row = (rows.length ? rows : els).filter(vis)[0] || (rows.length ? rows : els)[0]; if (!row) return { err: 'no row ' + rid }; if (inst.reveal) { try { inst.reveal(row); } catch (x) { } } return { ok: true };";
const ROWPT = VIS + "var rid = a; var els = Array.prototype.slice.call(sr.querySelectorAll('[data-surface=home] [data-rid=\"' + rid + '\"]')); if (!els.length) els = Array.prototype.slice.call(sr.querySelectorAll('[data-rid=\"' + rid + '\"]')); var rows = els.filter(function (e) { return e.hasAttribute('data-origin'); }); var row = (rows.length ? rows : els).filter(vis)[0]; if (!row) return { err: 'row not visible ' + rid }; var tw = document.createTreeWalker(row, NodeFilter.SHOW_TEXT), n, best = null; while ((n = tw.nextNode())) { if (!n.data.trim()) continue; var e = n.parentElement; if (e.closest('[data-act]') && e.closest('[data-act]') !== row && row.contains(e.closest('[data-act]'))) continue; if (!vis(e)) continue; best = e; break; } var b = (best || row).getBoundingClientRect(); var x = b.left + Math.min(b.width / 2, 60), y = b.top + b.height / 2; var hit = sr.elementFromPoint(x, y); return { x: x, y: y, desc: (best ? best.textContent.trim().slice(0, 16) : 'row') , covered: !(hit && (row === hit || row.contains(hit))), hit: hit ? hit.tagName + '.' + String(hit.className).slice(0, 30) : null };";
const ACT = VIS + "var alts = a.split('||'); for (var k = 0; k < alts.length; k++) { var list = Array.prototype.slice.call(sr.querySelectorAll(alts[k])).filter(vis); if (!list.length) continue; var over = list.filter(function (e) { return !!e.closest('[class*=\"-over\"]'); }); var e = over.length ? over[over.length - 1] : list[0]; if (inst.reveal) { try { inst.reveal(e); } catch (x) { } } var b = e.getBoundingClientRect(); return { x: b.left + b.width / 2, y: b.top + Math.min(b.height / 2, 48), desc: alts[k] + ' «' + e.textContent.trim().slice(0, 12) + '»' }; } return { err: 'missing ' + a };";
const READCTA = VIS + "var list = Array.prototype.slice.call(sr.querySelectorAll('[data-surface=home] [data-act=cta], [data-surface=home] [data-act=read]')).filter(vis); var pick = list.filter(function (e) { var r = e.closest('[data-rid]'); return r && r.getAttribute('data-rid') === 'brunch'; })[0] || null; var how = 'brunch CTA'; if (!pick) { pick = list.filter(function (e) { return /阅读/.test(e.textContent); })[0] || null; how = 'CTA 阅读…'; } if (!pick) { var any = Array.prototype.slice.call(sr.querySelectorAll('[data-act=cta], [data-act=read]')).filter(function (e) { return vis(e) && !e.closest('[class*=\"-over\"]') && /阅读/.test(e.textContent); }); pick = any[0] || null; how = 'dock CTA 阅读…'; } if (!pick) return { err: 'no read CTA on home' }; if (inst.reveal) { try { inst.reveal(pick); } catch (x) { } } var b = pick.getBoundingClientRect(); return { x: b.left + b.width / 2, y: b.top + Math.min(b.height / 2, 24), desc: how + ' «' + pick.textContent.trim().slice(0, 10) + '»' };";
const TOP = "var s = inst.state.nav && inst.state.nav.stack; var t = s && s.length ? s[s.length - 1] : null; return (t ? t.s : 'home') + '|' + inst.state.role + '|' + inst.state.section + '|' + (inst.state.nav && inst.state.nav.phase);";
(async () => {
  fs.mkdirSync(outdir, { recursive: true }); fs.mkdirSync(rawdir, { recursive: true });
  let waited = 0; while (os.loadavg()[0] >= 8 && waited < 180000) { await new Promise(r => setTimeout(r, 5000)); waited += 5000; }
  const { b, p, errors } = await L.launch({ viewport: { width: 480, height: 1000 } });
  const log = { code, file, loadStart: os.loadavg()[0].toFixed(2), waited, segs: [] };
  const ok = await L.openConcept(p, file, code, 1400); if (!ok) { console.log(JSON.stringify({ code, error: 'not mounted' })); await b.close(); process.exit(1); }
  const pause = () => L.E(p, code, "var el = sr.querySelector('.ju-env'); if (window.JU && JU.shared && JU.shared.skins && el) { try { JU.shared.skins.pause(el); } catch (x) { } }");
  await pause(); await p.evaluate(() => { document.documentElement.style.overflow = 'hidden'; document.body.style.overflow = 'hidden'; window.scrollTo(0, 0); });
  let box = await L.phoneRect(p, code); let vw = 480, vh = 1000;
  if (box.x + box.w + 16 > vw || box.y + box.h + 16 > vh) { vw = Math.max(vw, Math.ceil(box.x + box.w + 16)); vh = Math.max(vh, Math.ceil(box.y + box.h + 16)); await p.setViewportSize({ width: vw, height: vh }); await p.waitForTimeout(300); box = await L.phoneRect(p, code); }
  log.titles = await L.E(p, code, INSTALL);
  const cdp = await p.context().newCDPSession(p);
  const reset = async () => { await L.E(p, code, 'inst.reset()'); await p.waitForTimeout(1300); await pause(); await L.E(p, code, "sr.querySelectorAll('[data-scroller]').forEach(function (s) { s.scrollTop = 0; s.dispatchEvent(new Event('scroll')); });"); await p.waitForTimeout(400); };
  const seg = async (name, resolve, expect, opts) => { opts = opts || {};
    const rec = { name, before: await L.E(p, code, TOP) };
    let tgt = await resolve(); if (!tgt || tgt.err) { rec.err = (tgt && tgt.err) || 'no target'; log.segs.push(rec); return rec; }
    rec.target = tgt.desc; if (tgt.covered) rec.targetCovered = tgt.hit;
    await L.E(p, code, 'window.__xp.arm(a)', opts.dur || DUR);
    const raw = []; const onFrame = async (ev) => { raw.push({ t: ev.metadata.timestamp, data: ev.data }); try { await cdp.send('Page.screencastFrameAck', { sessionId: ev.sessionId }); } catch (e) { } };
    cdp.on('Page.screencastFrame', onFrame); await cdp.send('Page.startScreencast', { format: 'jpeg', quality: 80, maxWidth: 1400, maxHeight: 1400, everyNthFrame: 1 });
    await p.waitForTimeout(80); rec.load = os.loadavg()[0].toFixed(2);
    await p.mouse.click(tgt.x, tgt.y); await p.mouse.move(2, 2);
    for (let i = 0; i < 40; i++) { await p.waitForTimeout(100); if (await p.evaluate(() => window.__xp.st && window.__xp.st.done)) break; }
    await p.waitForTimeout(120); try { await cdp.send('Page.stopScreencast'); } catch (e) { } cdp.off('Page.screencastFrame', onFrame);
    const st = await p.evaluate(() => window.__xp.st); rec.samples = st.s; rec.epoch = st.epoch;
    rec.after = await L.E(p, code, TOP); rec.reached = expect ? rec.after.split('|')[0] === expect : true;
    const fdir = path.join(rawdir, name); fs.mkdirSync(fdir, { recursive: true }); rec.frames = [];
    raw.sort((x, y) => x.t - y.t).forEach((r, i) => { const f = path.join(fdir, 'f' + String(i).padStart(3, '0') + '.jpg'); fs.writeFileSync(f, Buffer.from(r.data, 'base64')); rec.frames.push([path.basename(f), Math.round((r.t * 1000) - (st.epoch || 0))]); });
    log.segs.push(rec); await p.waitForTimeout(opts.settle == null ? SETTLE : opts.settle); return rec;
  };
  const row = (rid) => async () => { const r0 = await L.E(p, code, ROW, rid); if (r0 && r0.err) return r0; await p.waitForTimeout(350); return L.E(p, code, ROWPT, rid); };
  const act = (sel) => async () => { const r = await L.E(p, code, ACT, sel); await p.waitForTimeout(250); if (r && !r.err) { const r2 = await L.E(p, code, ACT, sel); return r2; } return r; };
  // group 1: row → detail → back
  await reset();
  await seg('1-row-detail', row('dimsum'), 'detail');
  await seg('2-detail-back', act('[data-surface=detail] [data-act=back]||[data-act=back]'), 'home');
  // group 2: home → torn ticket (theater) → back
  await reset();
  await seg('3-row-ticket', row('theater'), 'ticket');
  await p.waitForTimeout(600);
  await seg('4-ticket-back', act('[data-surface=ticket] [data-act=back]||[data-act=back]'), 'home');
  // group 3: role switch
  await reset();
  await seg('5-role-hosted', act('[data-role-tab=hosted]'), null);
  await seg('6-role-joined', act('[data-role-tab=joined]'), null);
  // group 4: section switch
  await reset();
  await seg('7-sec-history', act('[data-section-tab=history]'), null);
  await seg('8-sec-current', act('[data-section-tab=current]'), null);
  // group 5: read entry → read → back
  await reset();
  const s9 = await seg('9-read-entry', () => L.E(p, code, READCTA), 'read');
  if (!s9.reached && !s9.err) s9.note = 'CTA did not open the read layer (top=' + s9.after + ')';
  await seg('10-read-back', act('[data-surface=read] [data-act=back]||[data-act=back]'), null);
  if (process.argv.includes('--busy')) {
    const rowFast = (rid) => () => L.E(p, code, ROWPT, rid);
    const actFast = (sel) => () => L.E(p, code, ACT, sel);
    // 11: back while the ticket is still printing (row → ticket for a ticket that prints on entry, back after ~450ms)
    await reset();
    const r1 = await row('run3k')(); if (r1 && !r1.err) { await p.mouse.click(r1.x, r1.y); await p.mouse.move(2, 2); await p.waitForTimeout(450); }
    log.busyNote = 'run3k opened at t0, back clicked ≈450ms later (printing state: ' + await L.E(p, code, "try { return inst.ctlVals ? (inst.ctlVals().ticket && inst.ctlVals().ticket.state) : (inst._c && inst._c.ticket && inst._c.ticket.state); } catch (x) { return 'n/a'; }") + ')';
    await seg('11-back-during-print', actFast('[data-surface=ticket] [data-act=back]||[data-act=back]'), 'home');
    // 12/13: switch role, click a row ≈150ms later, then go back right after (≈350ms after the row click). One screencast for both.
    await reset();
    {
      const raw = []; const onFrame = async (ev) => { raw.push({ t: ev.metadata.timestamp, data: ev.data }); try { await cdp.send('Page.screencastFrameAck', { sessionId: ev.sessionId }); } catch (e) { } };
      cdp.on('Page.screencastFrame', onFrame); await cdp.send('Page.startScreencast', { format: 'jpeg', quality: 80, maxWidth: 1400, maxHeight: 1400, everyNthFrame: 1 });
      await p.waitForTimeout(120);
      const before12 = await L.E(p, code, TOP);
      const t1 = await actFast('[data-role-tab=hosted]')(); const tc = Date.now();
      await p.mouse.click(t1.x, t1.y); await p.mouse.move(2, 2);
      await L.E(p, code, 'window.__xp.arm(a)', 330);
      const r12 = await rowFast('museum')();
      await p.waitForTimeout(Math.max(0, 150 - (Date.now() - tc)));
      const load12 = os.loadavg()[0].toFixed(2); const gap = Date.now() - tc;
      if (r12 && !r12.err) { await p.mouse.click(r12.x, r12.y); await p.mouse.move(2, 2); }
      for (let i = 0; i < 20; i++) { await p.waitForTimeout(40); if (await p.evaluate(() => window.__xp.st && window.__xp.st.done)) break; }
      const st12 = await p.evaluate(() => window.__xp.st); const after12 = await L.E(p, code, TOP);
      await L.E(p, code, 'window.__xp.arm(a)', DUR);
      const r13 = await actFast('[data-surface=manage] [data-act=back]||[data-act=back]')(); const load13 = os.loadavg()[0].toFixed(2);
      if (r13 && !r13.err) { await p.mouse.click(r13.x, r13.y); await p.mouse.move(2, 2); }
      for (let i = 0; i < 40; i++) { await p.waitForTimeout(100); if (await p.evaluate(() => window.__xp.st && window.__xp.st.done)) break; }
      const st13 = await p.evaluate(() => window.__xp.st); const after13 = await L.E(p, code, TOP);
      await p.waitForTimeout(120); try { await cdp.send('Page.stopScreencast'); } catch (e) { } cdp.off('Page.screencastFrame', onFrame);
      raw.sort((x, y) => x.t - y.t);
      const mk = (name, st, before, after, expect, target, load, lo, hi) => {
        const fdir = path.join(rawdir, name); fs.mkdirSync(fdir, { recursive: true }); const frames = [];
        raw.filter(r => r.t * 1000 >= lo && r.t * 1000 < hi).forEach((r, i) => { const f = path.join(fdir, 'f' + String(i).padStart(3, '0') + '.jpg'); fs.writeFileSync(f, Buffer.from(r.data, 'base64')); frames.push([path.basename(f), Math.round(r.t * 1000 - (st.epoch || 0))]); });
        log.segs.push({ name, before, after, reached: after.split('|')[0] === expect, target, load, samples: st.s, epoch: st.epoch, frames });
      };
      const e12 = st12.epoch || (Date.now()); const e13 = st13.epoch || (e12 + 400);
      mk('12-row-after-role', st12, before12, after12, 'manage', 'row museum ' + gap + 'ms after the role tab click', load12, e12 - 160, e13 - 1);
      mk('13-back-immediately', st13, after12, after13, 'home', (r13 && r13.desc) || 'back', load13, e13 - 80, e13 + DUR + 400);
      log.busyRoleToRowMs = gap;
    }
  }
  log.errors = errors.slice(0, 8); log.loadEnd = os.loadavg()[0].toFixed(2); log.box = box; log.vw = vw; log.vh = vh;
  fs.writeFileSync(path.join(outdir, 'probe.json'), JSON.stringify(log));
  console.log(JSON.stringify({ code, titles: log.titles, load: [log.loadStart, log.loadEnd], segs: log.segs.map(s => [s.name, s.err || (s.reached ? 'ok' : 'NOT ' + s.after), (s.samples || []).length, (s.frames || []).length, s.target]), errors: log.errors }));
  await b.close();
})().catch(e => { console.error(e); process.exit(1); });

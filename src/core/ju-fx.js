/* ju-fx.js — shared low-level effect helpers (geometry + measurement). Each concept supplies its own
   materials, edges, timings and composition; this file only computes shapes and rects. */
(function (global) {
  'use strict';
  var JU = global.JU = global.JU || {};
  function rand(seed) { var s = (seed || 1) * 9301 + 49297; return function () { s = (s * 9301 + 49297) % 233280; return s / 233280; }; }
  /* jagged profile: n offsets in [-amp, amp], smoothed a little so the tear reads as fibre, not noise */
  function tearProfile(n, amp, seed) {
    var r = rand(seed || 7), raw = [], out = [];
    for (var i = 0; i < n; i++) raw.push((r() * 2 - 1) * amp);
    for (var j = 0; j < n; j++) out.push(((raw[(j + n - 1) % n] + raw[j] * 2 + raw[(j + 1) % n]) / 4));
    return out;
  }
  /* clip-path polygons for a horizontal tear at y (px) across a w×h face.
     progress ∈ [0,1]: how far the tear has run from the left edge; attached part keeps the straight perforation.
     side 'keep' = part below the seam, 'stub' = part above. gap (px) opens the torn portion. */
  function tearClip(o) {
    var w = o.w, h = o.h, y = o.y, prof = o.profile, p = Math.max(0, Math.min(1, o.progress == null ? 1 : o.progress)), gap = o.gap || 0, n = prof.length;
    var seam = [];
    for (var i = 0; i <= n; i++) { var x = (w * i) / n; var torn = x <= p * w + 0.001; var off = torn ? prof[Math.min(i, n - 1)] : 0; seam.push([x, y + off]); }
    var pts = function (arr) { return arr.map(function (q) { return q[0].toFixed(1) + 'px ' + q[1].toFixed(1) + 'px'; }).join(','); };
    if (o.side === 'stub') { var top = seam.map(function (q) { var torn = q[0] <= p * w + 0.001; return [q[0], q[1] - (torn ? gap : 0)]; }); return 'polygon(0px 0px,' + w + 'px 0px,' + pts(top.slice().reverse()) + ')'; }
    if (o.side === 'edge') { var e = o.edge || 2; var a = seam.map(function (q) { return [q[0], q[1] - e]; }), b = seam.map(function (q) { return [q[0], q[1] + e]; }).reverse(); return 'polygon(' + pts(a) + ',' + pts(b) + ')'; }
    return 'polygon(' + pts(seam) + ',' + w + 'px ' + h + 'px,0px ' + h + 'px)';
  }
  /* vertical tear (seam at x) */
  function tearClipV(o) { var w = o.w, h = o.h, x = o.x, prof = o.profile, p = Math.max(0, Math.min(1, o.progress == null ? 1 : o.progress)), gap = o.gap || 0, n = prof.length; var seam = []; for (var i = 0; i <= n; i++) { var y = (h * i) / n; var torn = y <= p * h + 0.001; seam.push([x + (torn ? prof[Math.min(i, n - 1)] : 0), y]); } var pts = function (arr) { return arr.map(function (q) { return q[0].toFixed(1) + 'px ' + q[1].toFixed(1) + 'px'; }).join(','); }; if (o.side === 'stub') { var l = seam.map(function (q) { var torn = q[1] <= p * h + 0.001; return [q[0] - (torn ? gap : 0), q[1]]; }); return 'polygon(0px 0px,' + pts(l) + ',0px ' + h + 'px)'; } if (o.side === 'edge') { var e = o.edge || 2; var a = seam.map(function (q) { return [q[0] - e, q[1]]; }), b = seam.map(function (q) { return [q[0] + e, q[1]]; }).reverse(); return 'polygon(' + pts(a) + ',' + pts(b) + ')'; } return 'polygon(' + pts(seam) + ',' + w + 'px ' + h + 'px,' + w + 'px 0px)'; }
  /* rect of an element relative to a root element (the phone) — for FLIP / shared-element transitions */
  function rectIn(el, root) { var a = el.getBoundingClientRect(), b = root.getBoundingClientRect(); var sx = root.offsetWidth ? b.width / root.offsetWidth : 1; return { x: (a.left - b.left) / sx, y: (a.top - b.top) / sx, w: a.width / sx, h: a.height / sx }; }
  /* scatter positions for ash / confetti fragments */
  function scatter(n, seed, spread) { var r = rand(seed || 3), out = []; for (var i = 0; i < n; i++) out.push({ dx: (r() * 2 - 1) * (spread || 60), dy: 40 + r() * (spread || 60), rot: (r() * 2 - 1) * 120, s: 0.5 + r() * 0.8, d: r() * 300 }); return out; }
  JU.fx = { rand: rand, tearProfile: tearProfile, tearClip: tearClip, tearClipV: tearClipV, rectIn: rectIn, scatter: scatter };
})(typeof window !== 'undefined' ? window : this);

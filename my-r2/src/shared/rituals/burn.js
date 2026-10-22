/* burn.js — JU 票根作废 / 燃烧（炭化边 · 卷曲 · 落灰；原件复用，不改时长曲线、不改尺寸、不改配色）
   ───────────────────────────────────────────────────────────────────────────────
   来源：/home/user/JU/.build/baseline/V27.html（V27.code.html 行号一致）
   · 第 430 行  <script data-standalone-source="./ju-nativeburn.js" src="data:text/javascript;base64,…">
                → 下方第一段 IIFE 为该文件逐字节解码后的原文（window.JUNativeBurn = {mount, version:'25.0-shadow-handoff', variants:['A','B','C']}）
                  · 真实 DOM 票面从不被采样、克隆或替换：每帧只改 surface.style.clipPath = path(evenodd, 外框 + 燃烧等时线)，
                    影子外壳（shadow.firstElementChild）同步同一 clip-path；画布（pad 74px）只画炭化带 / 热边 / 卷曲碎片 / 落灰
                  · 到达时间场 arrival(x,y)：A 右下角起燃（end 7.2s, duration 9.3s, curls 58, ash 78, fold 8.5, char 1）
                                           B 多点烧穿（.32,.31 / .78,.65 / .13,.92；end 8.2s, duration 10.6s, curls 118, ash 136, fold 17, char 1.5）
                                           C 左侧横向推进（end 9.3s, duration 12.6s, curls 72, ash 126, fold 10, char 1.05）
                  · playbackDuration = min(opts.duration || cfg.duration, 7.6)；rate = cfg.duration / playbackDuration（V27 传 duration 6.6）
                  · 炭化带：5 层描边 25c/17c/9c/4c/1.7c，ignite=smooth(.06,.72,t)；热边 #d43b0d 5.5px + #ff5419 1.45px（shadowBlur 5）+ 逐纤维 #ffb451/#ff7726
                  · 尾段：主体烧尽且无大碎片后 .45s 内画布整体 destination-out 淡出 → done → onDone()
                  · 章（[data-raster="stamp"]）的外轮廓并入纸的蒙版（同一块 DOM 被一起烧掉）
                  · 可见性：IntersectionObserver + visibilitychange + scroll/resize；不可见即暂停，回来接着烧（不重头）
   · 第 429 行  ./ju-burn.js（window.JUBurn，火焰 / 余烬粒子版，“How We Feel 逐帧复刻”）仍打包但 V27 页面未调用（JUBurn.mount 出现 0 次）；存档于 assets/original/v27/ju-burn.js，不复用
   · 第 3710-3722 行 burnParts(tag)：paper / host([data-burn]) / surface([data-paper-surface]) / shadow([data-paper-shadow])
   · 第 3776-3783 行 burnMount(tag,variant,onDone)：清旧画布 → paper.opacity=1 → stage.dataset.burnPose24 → 冻结影子 filter →
                  JUNativeBurn.mount(host,{paper,surface,shadow,variant,duration:6.6,onDone})
   · 第 3784-3791 行 burnUnmount：engine.destroy()（取消 rAF / 断观察者 / 摘画布 / 还 clip-path）→ 清 filter / burnPose
   · 第 3800-3812 行 startBurn()（s11「去不了了」→ variant B）：先 rig.setEnabled(false)，setState p10:'burning'，engine.start()；onDone → p10:'ash', r11:'left'
   · 第 3792-3799 行 startBurn12()（s12 局主取消 → variant C，进屏即点火）；第 4404-4410 行 exitConfirmed22()（s06 主动退出 → variant C）
   · 第 4258 行   declineTime18()：**先** JuLedger.choose(EVENT,false) 写入 → 成功才 requestAnimationFrame(startBurn)；cancel18 / withdrawConfirmed 同理
   · 第 3723-3775 行 prepareBurnLayout26：手机高 <720 时的布局预飞（把票挪进安全区再点火，320ms cubic-bezier(.16,1,.3,1)）——本文件不含
   数据与动画：**数据先写、动画后放**；燃烧只作用于原票件，终态 = 纸被 clip-path 吃完 + 画布淡出 + 作废文案落定（juSettle）。
   prefers-reduced-motion：V27 源码未给燃烧接系统设置（brief §10 指出）；本文件补上：减少动态时 seek 到终态并直接落定，不改任何曲线。
   键盘 / 按钮等价物：原件由「去不了了 → 确认退出」按钮 / 进屏自动触发；本文件 JURitual.burn(host,data,opts) 即按钮入口。
   ─────────────────────────────────────────────────────────────────────────────── */
/* JU standalone — native paper / deterministic glowing char edges.
 * The ticket face is never sampled, rasterized, cloned, hidden, or replaced.
 * All printing, stamps and the existing tear canvas remain the actual DOM.
 * Only its clip-path changes. This canvas contains localized heat, scorched
 * edges, curled paper and inert ash. No flame textures or flame emitters.
 */
(function () {
  'use strict';
  const TAU = Math.PI * 2;
  const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
  const mix = (a, b, t) => a + (b - a) * t;
  const smooth = (a, b, x) => { const t = clamp((x - a) / (b - a)); return t * t * (3 - 2 * t); };
  const hash = (x, y = 0) => { const v = Math.sin(x * 127.1 + y * 311.7 + 18.731) * 43758.5453123; return v - Math.floor(v); };
  function noise(x, y) {
    const i = Math.floor(x), j = Math.floor(y), u = smooth(0, 1, x - i), v = smooth(0, 1, y - j);
    return mix(mix(hash(i, j), hash(i + 1, j), u), mix(hash(i, j + 1), hash(i + 1, j + 1), u), v);
  }
  const grain = (x, y) => (noise(x * .023, y * .027) - .5) * 18 + (noise(x * .097, y * .081) - .5) * 7 + (noise(x * .36, y * .31) - .5) * 2.5;
  const presets = {
    A: { end: 7.2, duration: 9.3, curls: 58, ash: 78, fold: 8.5, char: 1, seed: 17 },
    B: { end: 8.2, duration: 10.6, curls: 118, ash: 136, fold: 17, char: 1.5, seed: 83 },
    C: { end: 9.3, duration: 12.6, curls: 72, ash: 126, fold: 10, char: 1.05, seed: 149 }
  };

  function mount(host, options) {
    const o = options || {}, paper = o.paper || host.parentElement;
    const surface = o.surface || paper.querySelector('[data-paper-surface]');
    if (!surface) throw new Error('JU burn requires the existing native paper surface.');
    const variant = presets[o.variant] ? o.variant : 'A', cfg = presets[variant];const shadowFace=o.shadow?.firstElementChild;const milestones={mainGone:null,majorFragmentGone:null,lastParticle:null,resultReady:null};let remainingFraction=1,majorCount=0,particleCount=0,tailStarted=null;
    const playbackDuration=Math.min(Number(o.duration)||cfg.duration,7.6),rate=cfg.duration/playbackDuration;
    const W = paper.offsetWidth || 258;
    const H = Math.max(1, surface.offsetHeight || surface.scrollHeight || paper.offsetHeight);
    const dpr = Math.min(window.devicePixelRatio || 1, 2), pad = 74;
    const cv = document.createElement('canvas');
    cv.setAttribute('aria-hidden', 'true'); cv.setAttribute('data-ju-material-fx', variant);
    cv.width = Math.ceil((W + pad * 2) * dpr); cv.height = Math.ceil((H + pad * 2) * dpr);
    cv.style.cssText = 'position:absolute;pointer-events:none;left:' + (-pad) + 'px;top:' + (-pad) + 'px;width:' + (W + pad * 2) + 'px;height:' + (H + pad * 2) + 'px;overflow:visible';
    const ctx = cv.getContext('2d', { alpha: true }); if (!ctx) return null; host.appendChild(cv);
    const previousClip = surface.style.clipPath, previousWebkitClip = surface.style.webkitClipPath;
    const previousShadowClip=shadowFace?.style.clipPath||'',previousShadowWebkitClip=shadowFace?.style.webkitClipPath||'';
    const x0 = -34, y0 = -24, xmax = W + 40, ymax = H + 30, grid = 3.4;
    const cols = Math.ceil((xmax - x0) / grid) + 1, rows = Math.ceil((ymax - y0) / grid) + 1;
    const dx = (xmax - x0) / (cols - 1), dy = (ymax - y0) / (rows - 1);
    const field = new Float32Array(cols * rows);
    let lo = Infinity, hi = -Infinity;
    function raw(x, y) {
      const n = grain(x + cfg.seed, y - cfg.seed * .43);
      if (variant === 'A') return Math.hypot((W - 4 - x) * 1.02, (H - 5 - y) * .85) + n;
      if (variant === 'B') return Math.min(
        .4 + Math.hypot((x - W * .32) * 1.07, (y - H * .31) * .92) / 35,
        1.15 + Math.hypot((x - W * .78), (y - H * .65) * .9) / 32,
        1.9 + Math.hypot((x - W * .13) * 1.04, (y - H * .92) * .96) / 30
      ) + n / 23 + Math.sin(x*.085+y*.051)*.095;
      return Math.max(0, x + 5) + Math.abs(y - H * .64) * .36 + 17 * Math.sin(y / H * 5.2) + n * .8;
    }
    for (let j = 1; j < rows - 1; j++) for (let i = 1; i < cols - 1; i++) {
      const r = raw(x0 + i * dx, y0 + j * dy); field[j * cols + i] = r; lo = Math.min(lo, r); hi = Math.max(hi, r);
    }
    function arrival(x, y) {
      let q = clamp((raw(x, y) - lo) / (hi - lo));
      if (variant === 'A') q = q + Math.sin(q * TAU) * .027;
      if (variant === 'C') q = .24 * q + .76 * Math.pow(q, .78);
      return .38 + (cfg.end - .38) * q;
    }
    for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) {
      field[j * cols + i] = i === 0 || j === 0 || i === cols - 1 || j === rows - 1 ? 1e4 : arrival(x0 + i * dx, y0 + j * dy);
    }
    function normal(x, y) {
      const gx = (arrival(x + 2, y) - arrival(x - 2, y)) / 4, gy = (arrival(x, y + 2) - arrival(x, y - 2)) / 4;
      const length = Math.max(.003, Math.hypot(gx, gy)); return { x: gx / length, y: gy / length, g: length };
    }
    function events(count, salt) {
      const list = [];
      for (let i = 0; i < count; i++) {
        const k = i + cfg.seed * 7 + salt, x = 5 + hash(k, 1) * (W - 10), y = 5 + hash(k, 2) * (H - 10);
        list.push({ x, y, at: arrival(x, y), n: normal(x, y), r: hash(k, 3), s: hash(k, 4), phase: hash(k, 5) * TAU, k });
      }
      return list;
    }
    const curls = events(cfg.curls, 251), ashes = events(cfg.ash, 503);
    const fibres = events(2900, 1237);
    const outline = new Path2D(); outline.roundRect(0, 0, W, H, 14);
    // The stamp is the same protruding native DOM element. Its actual local
    // transform extends only the material edge stencil; no face pixels are read.
    const stamp = surface.querySelector('[data-raster="stamp"]');
    if (stamp && typeof DOMMatrix !== 'undefined') {
      const s = getComputedStyle(stamp), origin = s.transformOrigin.split(' ').map(parseFloat);
      let sx = stamp.offsetLeft, sy = stamp.offsetTop, parent = stamp.offsetParent;
      while (parent && parent !== surface && surface.contains(parent)) { sx += parent.offsetLeft; sy += parent.offsetTop; parent = parent.offsetParent; }
      const m = new DOMMatrix().translate(sx + origin[0], sy + origin[1]).multiply(new DOMMatrix(s.transform === 'none' ? undefined : s.transform)).translate(-origin[0], -origin[1]);
      const stampShape = new Path2D(); stampShape.roundRect(0, 0, stamp.offsetWidth, stamp.offsetHeight, parseFloat(s.borderRadius) || 8);
      outline.addPath(stampShape, m);
    }
    const outerString = 'M-60 -50H' + (W + 60) + 'V' + (H + 55) + 'H-60Z';
    let elapsed = 0, active = false, userPaused = false, inView = true, destroyed = false, done = false, fired = false, raf = 0, last = null;
    let frameCount = 0, totalFrameMs = 0,startedAtWall=0,completedAtWall=0;

    // Marching squares on a time-of-arrival field: all contours are a UNION.
    // Shared edge keys make closed loops; overlapping holes never resurrect paper.
    function contours(t) {
      const nodes = new Map(), links = new Map();
      function edge(i, j, e, values) {
        let ax, ay, bx, by, va, vb, key;
        if (e === 0) { ax = i; ay = j; bx = i + 1; by = j; va = values[0]; vb = values[1]; key = 'h' + (j * cols + i); }
        else if (e === 1) { ax = i + 1; ay = j; bx = i + 1; by = j + 1; va = values[1]; vb = values[2]; key = 'v' + (j * cols + i + 1); }
        else if (e === 2) { ax = i; ay = j + 1; bx = i + 1; by = j + 1; va = values[3]; vb = values[2]; key = 'h' + ((j + 1) * cols + i); }
        else { ax = i; ay = j; bx = i; by = j + 1; va = values[0]; vb = values[3]; key = 'v' + (j * cols + i); }
        if (!nodes.has(key)) { const u = clamp((t - va) / (vb - va)); nodes.set(key, [x0 + mix(ax, bx, u) * dx, y0 + mix(ay, by, u) * dy]); }
        return key;
      }
      function link(a, b) { if (!links.has(a)) links.set(a, []); if (!links.has(b)) links.set(b, []); links.get(a).push(b); links.get(b).push(a); }
      const table = [[], [3, 0], [0, 1], [3, 1], [1, 2], [3, 2, 0, 1], [0, 2], [3, 2], [2, 3], [0, 2], [0, 3, 1, 2], [1, 2], [1, 3], [0, 1], [3, 0], []];
      for (let j = 0; j < rows - 1; j++) for (let i = 0; i < cols - 1; i++) {
        const idx = j * cols + i, values = [field[idx], field[idx + 1], field[idx + cols + 1], field[idx + cols]];
        const mask = (values[0] < t ? 1 : 0) | (values[1] < t ? 2 : 0) | (values[2] < t ? 4 : 0) | (values[3] < t ? 8 : 0);
        const edges = table[mask];
        for (let k = 0; k < edges.length; k += 2) link(edge(i, j, edges[k], values), edge(i, j, edges[k + 1], values));
      }
      const seen = new Set(), loops = [];
      for (const start of nodes.keys()) {
        if (seen.has(start)) continue;
        const loop = []; let current = start, previous = null;
        for (let guard = 0; guard < 6000; guard++) {
          if (!current || seen.has(current)) break;
          seen.add(current); loop.push(nodes.get(current));
          const next = (links.get(current) || []).find(v => v !== previous); previous = current; current = next;
        }
        if (loop.length > 2) loops.push(loop);
      }
      let svg = ''; const path = new Path2D();
      loops.forEach(points => {
        path.moveTo(points[0][0], points[0][1]); svg += 'M' + points[0][0].toFixed(2) + ' ' + points[0][1].toFixed(2);
        for (let i = 1; i < points.length; i++) { const p = points[i]; path.lineTo(p[0], p[1]); svg += 'L' + p[0].toFixed(2) + ' ' + p[1].toFixed(2); }
        path.closePath(); svg += 'Z';
      });
      return { svg, path, loops };
    }

    function drawChar(front, remaining, t) {
      const g = ctx, ignite = smooth(.06, .72, t), finish = 1 - smooth(cfg.end - .05, cfg.end + .15, t);
      g.save(); g.clip(outline); g.clip(remaining, 'evenodd'); g.lineJoin = 'round'; g.lineCap = 'round';
      const c = cfg.char;
      [[25*c,'rgba(116,88,62,.08)'],[17*c,'rgba(119,93,68,.15)'],[9*c,'rgba(77,64,53,.32)'],[4*c,'rgba(38,35,33,.60)'],[1.7*c,'rgba(23,25,28,.75)']].forEach(s => {
        g.globalAlpha = ignite * finish; g.lineWidth = s[0]; g.strokeStyle = s[1]; g.stroke(front.path);
      });
      // Local paper density gives the carbon band a quiet, uneven depth. The
      // pattern stays in paper coordinates; neither the contour nor heat grows.
      for (const loop of front.loops) for (let i = 0; i < loop.length; i += 3) {
        const p=loop[i],density=noise(p[0]*.038+cfg.seed,p[1]*.047),depth=smooth(.25,.8,density);
        g.globalAlpha=(.08+depth*.14)*ignite*finish;g.strokeStyle='#44372d';g.lineWidth=(2.5+depth*3.5)*c;
        g.beginPath();g.moveTo(p[0],p[1]);for(let j=1;j<=3;j++){const q=loop[(i+j)%loop.length];g.lineTo(q[0],q[1]);}g.stroke();
      }
      // Broken mineral/graphite flecks and tiny fibres, fixed to paper coordinates.
      for (const f of fibres) {
        const dt = f.at - t;
        if (dt < -.025 || dt > .26 * c) continue;
        const band = (1 - dt / (.29 * c)) * ignite * finish;
        g.globalAlpha = clamp(band) * (.2 + f.r * .6);
        g.strokeStyle = f.r > .65 ? '#a99980' : '#292827'; g.lineWidth = .3 + f.s * .45;
        const len = .65 + f.s * 2.6;
        g.beginPath(); g.moveTo(f.x, f.y); g.lineTo(f.x + Math.cos(f.phase) * len, f.y + Math.sin(f.phase) * len); g.stroke();
      }
      // Discontinuous radial fractures keep the front a brittle carbon sheet,
      // with differing edge thickness, instead of a smooth brown tube.
      for (const loop of front.loops) for (let i = 0; i < loop.length; i += 4) {
        const p = loop[i], k = Math.floor(p[0] * .18) + Math.floor(p[1] * .2) * 173;
        if (hash(k, 8) < .3) continue;
        const n = normal(p[0], p[1]), length = (1.5 + hash(k, 9) * 4.5) * c;
        g.globalAlpha = .22 * ignite * finish; g.strokeStyle = '#211f20'; g.lineWidth = .35 + hash(k, 10) * .4;
        g.beginPath(); g.moveTo(p[0], p[1]);
        g.lineTo(p[0] + n.x * length * .6 + n.y * .7, p[1] + n.y * length * .6 - n.x * .7);
        g.lineTo(p[0] + n.x * length, p[1] + n.y * length); g.stroke();
      }
      // Carbon remains visible beneath a thin, locally varying incandescent lip.
      g.globalAlpha = .36 * ignite * finish;
      g.lineWidth = 1.15; g.strokeStyle = '#242426'; g.stroke(front.path);
      const strength = (variant === 'A' ? .78 : variant === 'B' ? .87 : 1) * ignite * finish;
      // Restrained conducted warmth stays in the surviving paper, not over text
      // far from the advancing front. No images, flame sprites or fire particles.
      g.globalAlpha = .21 * strength;
      g.lineWidth = 5.5; g.strokeStyle = '#d43b0d'; g.stroke(front.path);
      g.globalAlpha = .38 * strength; g.lineWidth = 1.45;
      g.shadowBlur = 5; g.shadowColor = 'rgba(255,63,8,.78)';
      g.strokeStyle = '#ff5419'; g.stroke(front.path);
      g.shadowBlur = 0;
      // Individual hot fibres vary smoothly along the physical contour. Their
      // location is fixed to the material and seek() remains deterministic.
      for (const loop of front.loops) for (let i = 0; i < loop.length; i += 3) {
        const p = loop[i];
        const density = noise(p[0] * .043 + 19, p[1] * .039 + 7);
        const breath = .88 + .12 * Math.sin(t * 1.7 + density * 8);
        const heat = smooth(.21, .73, density) * breath;
        g.globalAlpha = strength * (.22 + heat * .68);
        g.lineWidth = .4 + heat * .58;
        g.strokeStyle = heat > .55 ? '#ffb451' : '#ff7726';
        g.beginPath();g.moveTo(p[0],p[1]);
        for (let j = 1; j <= 3; j++) { const q = loop[(i + j) % loop.length];g.lineTo(q[0],q[1]); }
        g.stroke();
      }
      g.restore();
    }

    // Follow the material front instead of leaving a rectangular strip hanging
    // at a curl's original location once the paper has already receded.
    function edgeAnchor(e, t) {
      let shift = clamp((t - e.at) / e.n.g, -8, 42);
      for (let i = 0; i < 2; i++) {
        const error = arrival(e.x + e.n.x * shift, e.y + e.n.y * shift) - t;
        shift = clamp(shift - clamp(error / e.n.g, -9, 9), -9, 48);
      }
      return { x: e.x + e.n.x * shift, y: e.y + e.n.y * shift };
    }

    function drawCurl(e, t) {
      const age = t - e.at, life = variant === 'B' ? .83 : .61;
      if (age < -.18 || age > life) return;
      const p = clamp((age + .18) / (life + .18));
      const open = Math.sin(p * Math.PI) * smooth(0, .1, t), alpha = (1 - smooth(.7, 1, p));
      // Small flakes hug the burn front; scale both roll depth and strip width.
      const curlScale = .48;
      const anchor = edgeAnchor(e, t);
      const x = anchor.x + e.n.x * 1.1 * curlScale, y = anchor.y + e.n.y * 1.1 * curlScale;
      if (x < 3 || x > W - 3 || y < 3 || y > H - 3) return;
      const radius = cfg.fold * (.38 + e.r * .53) * open * curlScale, width = ((variant === 'B' ? 9 : 7) + e.s * 10) * curlScale;majorCount++;
      const tx = -e.n.y, ty = e.n.x, g = ctx, rows = 15;
      const vertices = [];
      for (let i = 0; i <= rows; i++) {
        const u = i / rows, angle = u * (1.35 + open * (1.25 + e.r * 1.35)), s = radius * Math.sin(angle), z = radius * (1 - Math.cos(angle));
        const taper = Math.pow(1 - u, .48) * (.84 + .16 * Math.sin(e.phase + u * 8));
        const twist = u * u * width * (e.r - .5) * .85;
        const cx = x - e.n.x * s + z * .32 + tx * twist, cy = y - e.n.y * s - z * .62 + ty * twist;
        const leftRag = taper * (.8 + hash(e.k, i + 91) * .31), rightRag = taper * (.58 + hash(e.k, i + 171) * .57);
        vertices.push([{ x: cx - tx * width * .5 * leftRag, y: cy - ty * width * .5 * leftRag }, { x: cx + tx * width * .5 * rightRag, y: cy + ty * width * .5 * rightRag }]);
      }
      g.save(); g.globalAlpha = alpha;
      // Projected self shadow, followed by the matte reverse of the roll.
      g.fillStyle = 'rgba(23,22,25,.15)'; g.shadowColor = 'rgba(15,15,22,.3)'; g.shadowBlur = 2; g.shadowOffsetY = 1;
      g.beginPath(); g.moveTo(vertices[0][0].x, vertices[0][0].y);
      vertices.forEach(v => g.lineTo(v[0].x, v[0].y)); vertices.slice().reverse().forEach(v => g.lineTo(v[1].x, v[1].y)); g.closePath(); g.fill(); g.shadowBlur = 0; g.shadowOffsetY = 0;
      for (let i = 0; i < rows; i++) for (let column = 0; column < 4; column++) {
        const u = (i + .5) / rows, a = vertices[i], b = vertices[i + 1], c0 = column / 4, c1 = (column + 1) / 4;
        const light = Math.max(0, Math.sin(u * 2.3 + .25));
        const fresh = smooth(.06, .59, u) * (1 - smooth(.78, 1, u));
        const mineral = (hash(e.k + column * 11, i) - .5) * 12;
        const r = 38 + light * 23 + fresh * 100 + mineral, gg = 35 + light * 18 + fresh * 87 + mineral, bb = 32 + light * 14 + fresh * 68 + mineral;
        g.fillStyle = 'rgb(' + Math.round(r) + ',' + Math.round(gg) + ',' + Math.round(bb) + ')';
        g.beginPath(); g.moveTo(mix(a[0].x, a[1].x, c0), mix(a[0].y, a[1].y, c0));
        g.lineTo(mix(a[0].x, a[1].x, c1), mix(a[0].y, a[1].y, c1));
        g.lineTo(mix(b[0].x, b[1].x, c1), mix(b[0].y, b[1].y, c1));
        g.lineTo(mix(b[0].x, b[1].x, c0), mix(b[0].y, b[1].y, c0)); g.closePath(); g.fill();
      }
      // Two thickness lines and fine cross-grain cracks define the torn edge.
      g.lineWidth = .35; g.strokeStyle = 'rgba(191,177,143,.48)'; g.beginPath();
      vertices.forEach((v, i) => i ? g.lineTo(v[0].x, v[0].y) : g.moveTo(v[0].x, v[0].y)); g.stroke();
      g.lineWidth = .32; g.strokeStyle = 'rgba(29,27,25,.68)'; g.beginPath();
      vertices.forEach((v, i) => i ? g.lineTo(v[1].x, v[1].y) : g.moveTo(v[1].x, v[1].y)); g.stroke();
      for (let i = 2; i < rows; i += 2) {
        const a = vertices[i], b = vertices[i + 1]; g.lineWidth = .22; g.strokeStyle = 'rgba(30,28,25,.34)';
        g.beginPath(); g.moveTo(a[0].x, a[0].y); g.lineTo(mix(b[0].x, b[1].x, .25 + hash(e.k, i) * .42), mix(b[0].y, b[1].y, .25 + hash(e.k, i) * .42)); g.stroke();
      }
      g.restore();
    }

    function drawAsh(e, t) {
      const age = t - e.at - .06;
      if (age < 0) return;
      const g = ctx, floor = H + 14 + e.r * 18, gravity = variant === 'C' ? 119 : 150, vy = -8 - e.s * 17;
      const landing = (-vy + Math.sqrt(vy * vy + 2 * gravity * (floor - e.y))) / gravity;
      const fall = Math.min(age, landing), settled = age > landing, after = Math.max(0, age - landing);
      const drift = (e.r - .5) * 24 * fall + Math.sin(fall * 3 + e.phase) * 6 * Math.min(1, fall * 2);
      const x = e.x + drift, y = e.y + vy * fall + .5 * gravity * fall * fall;
      const keep = e.s > .62, fade = keep ? 1 - smooth(cfg.duration - .9, cfg.duration - .08, t) : 1 - smooth(1.05, 1.7, age);
      const opacity = smooth(0, .13, age) * fade * (settled ? .3 : .58) * (1 - smooth(.7, 1.65, after));
      if (opacity <= .001) return;particleCount++;
      const size = (variant === 'B' ? 1.6 : 1.1) + e.s * (variant === 'C' ? 2.4 : 2), rotation = settled ? e.phase : e.phase + age * (1.6 + e.s * 2);
      g.save(); g.globalAlpha = opacity; g.translate(x, y); g.rotate(rotation);
      g.scale(1, settled ? .32 : .26 + Math.abs(Math.cos(age * 4 + e.phase)) * .66);
      g.fillStyle = e.r > .42 ? '#65615e' : '#343338';
      g.beginPath(); g.moveTo(-size, -size * .28); g.lineTo(-size * .24, -size * .62); g.lineTo(size * .85, -size * .18); g.lineTo(size * .5, size * .42); g.lineTo(-size * .65, size * .55); g.closePath(); g.fill();
      g.strokeStyle = 'rgba(212,204,186,.45)'; g.lineWidth = .35; g.beginPath(); g.moveTo(-size, -size * .28); g.lineTo(size * .85, -size * .18); g.stroke();
      g.restore();
    }

    function scorchOnset(t, remaining) {
      if (t < .035 || t > .88) return;
      let x, y;
      if (variant === 'A') { x = W - 3; y = H - 7; }
      else if (variant === 'B') { x = W * .32; y = H * .31; }
      else { x = 1; y = H * .64; }
      const p = smooth(.035, .4, t) * (1 - smooth(.5, .88, t)), g = ctx, r = 4 + p * 8;
      g.save(); g.clip(outline); g.clip(remaining, 'evenodd');
      const stain = g.createRadialGradient(x, y, 0, x, y, r);
      stain.addColorStop(0, 'rgba(53,45,39,' + (.48 * p) + ')'); stain.addColorStop(.35, 'rgba(91,74,59,' + (.22 * p) + ')'); stain.addColorStop(1, 'rgba(107,91,72,0)');
      g.fillStyle = stain; g.fillRect(x - r, y - r, r * 2, r * 2);
      const heat = g.createRadialGradient(x, y, 0, x, y, r * .66);
      heat.addColorStop(0, 'rgba(255,108,31,' + (.42 * p) + ')');
      heat.addColorStop(.28, 'rgba(225,56,12,' + (.23 * p) + ')');
      heat.addColorStop(1, 'rgba(181,37,8,0)');
      g.fillStyle = heat;g.fillRect(x-r,y-r,r*2,r*2);g.restore();
    }

    function render(t) {
      if (destroyed) return;
      const startTime = performance.now();majorCount=0;particleCount=0;let left=0,total=0;for(let y=3;y<H;y+=7)for(let x=3;x<W;x+=7){total++;if(arrival(x,y)>t)left++;}remainingFraction=total?left/total:0;if(remainingFraction===0&&milestones.mainGone===null)milestones.mainGone=elapsed;
      ctx.setTransform(dpr, 0, 0, dpr, pad * dpr, pad * dpr);
      ctx.clearRect(-pad, -pad, W + pad * 2, H + pad * 2);
      if (t <= 0) { surface.style.clipPath = previousClip; surface.style.webkitClipPath = previousWebkitClip;if(shadowFace){shadowFace.style.clipPath=previousShadowClip;shadowFace.style.webkitClipPath=previousShadowWebkitClip;} return; }
      if (t < cfg.end + .03) {
        const front = contours(t), nativePath = outerString + front.svg;
        const css = 'path(evenodd, "' + nativePath + '")';
        surface.style.clipPath = css; surface.style.webkitClipPath = css;if(shadowFace){shadowFace.style.clipPath=css;shadowFace.style.webkitClipPath=css;}
        const remaining = new Path2D(nativePath);
        ctx.save();ctx.clip(outline);ctx.clip(remaining,'evenodd');for(const e of curls){const dt=e.at-t;if(dt>0&&dt<.85){const opacity=(1-dt/.85)*(.13+e.r*.12),r=6+e.s*10;const stain=ctx.createRadialGradient(e.x,e.y,0,e.x,e.y,r);stain.addColorStop(0,'rgba(91,65,43,'+opacity+')');stain.addColorStop(1,'rgba(91,65,43,0)');ctx.fillStyle=stain;ctx.fillRect(e.x-r,e.y-r,r*2,r*2);}}ctx.restore();drawChar(front, remaining, t); scorchOnset(t, remaining);
        for (const e of curls) drawCurl(e, t);
      } else { surface.style.clipPath = 'path("M0 0Z")'; surface.style.webkitClipPath = 'path("M0 0Z")';if(shadowFace){shadowFace.style.clipPath='path("M0 0Z")';shadowFace.style.webkitClipPath='path("M0 0Z")';} }
      if(remainingFraction===0&&majorCount===0){if(milestones.majorFragmentGone===null)milestones.majorFragmentGone=elapsed;if(tailStarted===null)tailStarted=elapsed;}ctx.globalAlpha=1;for(const e of ashes)drawAsh(e,t);if(tailStarted!==null){const fade=clamp((elapsed-tailStarted)/.45);ctx.save();ctx.globalCompositeOperation='destination-out';ctx.globalAlpha=fade;ctx.fillRect(-pad,-pad,W+pad*2,H+pad*2);ctx.restore();if(fade>=1){particleCount=0;if(milestones.lastParticle===null)milestones.lastParticle=elapsed;}}
      frameCount++; totalFrameMs += performance.now() - startTime;
    }

    function visible() {
      if (destroyed) return false;
      if (document.hidden) return false;
      const r = paper.getBoundingClientRect();
      const vw = window.innerWidth, vh = window.innerHeight;
      const ix = Math.max(0, Math.min(r.right, vw) - Math.max(r.left, 0));
      const iy = Math.max(0, Math.min(r.bottom, vh) - Math.max(r.top, 0));
      return ix > Math.min(r.width, vw) * .24 && iy > Math.min(r.height, vh) * .08;
    }
    function schedule() {
      if (!destroyed && active && !userPaused && inView && !done && !raf) raf = requestAnimationFrame(tick);
    }
    function tick(now) {
      raf = 0;
      if (destroyed || !active || userPaused || !inView || done) { last = null; return; }
      if (last !== null) elapsed = Math.min(playbackDuration, elapsed + Math.max(0, (now - last) / 1000));
      last = now; render(elapsed*rate);
      if (elapsed >= playbackDuration || tailStarted!==null&&elapsed-tailStarted>=.45) {
        done = true; active = false; last = null;completedAtWall=Date.now();milestones.resultReady=elapsed;
        if (!fired) { fired = true; if (typeof o.onDone === 'function') o.onDone(); }
        return;
      }
      schedule();
    }
    function visibilityChanged() {
      const v = visible();
      if (v !== inView) { inView = v; last = null; if (!v && raf) { cancelAnimationFrame(raf); raf = 0; } }
      schedule();
    }
    const io = typeof IntersectionObserver !== 'undefined' ? new IntersectionObserver(visibilityChanged, { threshold: [0, .01, .12, .26, .5, .9] }) : null;
    if (io) { io.observe(paper); const section = paper.closest('section'); if (section) io.observe(section); }
    document.addEventListener('visibilitychange', visibilityChanged);
    window.addEventListener('scroll', visibilityChanged, { passive: true });
    window.addEventListener('resize', visibilityChanged, { passive: true });
    inView = visible();

    const api = {
      cv, variant, width: W, height: H, duration: playbackDuration,
      get elapsed() { return elapsed; }, get done() { return done; }, get running() { return active && !userPaused && inView && !done; },
      get metrics() { return { frames: frameCount, meanRenderMs: frameCount ? totalFrameMs / frameCount : 0, devicePixelRatio: dpr, grid: [cols, rows], nativeFace: true,remainingFraction,majorCount,particleCount,milestones:{...milestones},wallDurationMs:completedAtWall?completedAtWall-startedAtWall:null }; },
      start() { if (destroyed || done) return api; active = true; userPaused = false; inView = visible();if(!startedAtWall)startedAtWall=Date.now();last = null; schedule(); return api; },
      pause() { userPaused = true; last = null; if (raf) cancelAnimationFrame(raf); raf = 0; return api; },
      resume() { return api.start(); },
      seek(seconds) { elapsed = clamp(Number(seconds) || 0, 0, playbackDuration); done = elapsed >= playbackDuration; last = null; render(elapsed*rate); return api; },
      destroy() {
        if (destroyed) return; destroyed = true; if (raf) cancelAnimationFrame(raf); raf = 0;
        if (io) io.disconnect(); document.removeEventListener('visibilitychange', visibilityChanged);
        window.removeEventListener('scroll', visibilityChanged); window.removeEventListener('resize', visibilityChanged);
        surface.style.clipPath = previousClip; surface.style.webkitClipPath = previousWebkitClip;if(shadowFace){shadowFace.style.clipPath=previousShadowClip;shadowFace.style.webkitClipPath=previousShadowWebkitClip;} cv.remove();
      }
    };
    return api;
  }
  window.JUNativeBurn = { mount, version: '25.0-shadow-handoff', variants: ['A', 'B', 'C'] };
})();

/* ── JURitual.burn：V27 burnParts / burnMount / burnUnmount / startBurn 的可复用编排（第 3710-3812 行） ── */
(function () {
  'use strict';
  const NS = window.JURitual = window.JURitual || {};
  const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches || document.documentElement.dataset.juReduced === 'true';
  const stageOf = host => host.matches('[data-print-stage]') ? host : (host.closest('[data-print-stage]') || host.querySelector('[data-print-stage]') || host);
  const VARIANT = { 'reschedule-declined': 'B', declined: 'B', cancelled: 'C', 'host-cancelled': 'C', withdrawn: 'C', exit: 'C' };

  function parts(stage) {
    const paper = stage.querySelector('[data-paper]');
    return { paper, host: stage.querySelector('[data-burn]'), surface: paper && paper.querySelector('[data-paper-surface]'), shadow: paper && paper.querySelector('[data-paper-shadow]') };
  }
  function unmount(stage, engine) {
    const m = parts(stage);
    if (engine) { try { engine.destroy(); } catch (e) { } }
    if (m.host) Array.prototype.slice.call(m.host.querySelectorAll('canvas')).forEach(c => c.remove());
    if (m.surface) { m.surface.style.clipPath = ''; m.surface.style.webkitClipPath = ''; }
    if (m.shadow) { m.shadow.style.filter = ''; const f = m.shadow.firstElementChild; if (f) { f.style.clipPath = ''; f.style.webkitClipPath = ''; } }
    if (m.paper) { m.paper.style.filter = ''; delete m.paper.parentElement.dataset.burnPose24; const rig = m.paper.querySelector('[data-tear]'); if (rig && rig.__juBurnHidden !== undefined) { rig.style.display = rig.__juBurnHidden; delete rig.__juBurnHidden; } }
    stage.__juBurn = null;
  }

  /* data.reason: 'reschedule-declined'(B) | 'cancelled'(C) | 'withdrawn'(C)；或 opts.variant 'A'|'B'|'C'
     data.ashTitle / data.ashSub / data.ashSec 填入舞台内 [data-ash] 终态块（可无）。
     返回 {engine, promise, pause, resume, seek, destroy}；promise → {ok, variant, metrics} */
  NS.burn = function (host, data, opts) {
    opts = opts || {}; data = data || {};
    const stage = stageOf(host);
    const variant = opts.variant || VARIANT[data.reason] || 'C';
    const m = parts(stage);
    if (!m.paper || !m.host || !m.surface || !window.JUNativeBurn) return { engine: null, promise: Promise.resolve({ ok: false, reason: 'no-parts' }) };
    if (stage.__juBurn) unmount(stage, stage.__juBurn);
    const ash = stage.querySelector('[data-ash]') || (stage.parentElement && stage.parentElement.querySelector('[data-ash]'));
    if (ash) { const t = ash.querySelector('[data-slot="ashTitle"]'), s = ash.querySelector('[data-slot="ashSub"]'), c = ash.querySelector('[data-slot="ashSec"]'); if (t && data.ashTitle) t.textContent = data.ashTitle; if (s && data.ashSub) s.textContent = data.ashSub; if (c && data.ashSec) c.textContent = data.ashSec; delete ash.dataset.shown; }
    // 撕票 rig 先停（startBurn 第 3802 行）
    const rigHost = m.paper.querySelector('[data-tear]'); if (rigHost && rigHost.__jurig) rigHost.__jurig.setEnabled(false);
    // 已撕的票：空副券宿主按 s10 规则收成 0 再点火（否则引擎的内联 clip-path 会盖掉影子外壳的 inset 让位，露出 84px 空白纸影）
    if (rigHost && stage.dataset.state === 'torn') { rigHost.__juBurnHidden = rigHost.style.display; rigHost.style.display = 'none'; }
    // burnMount（第 3777-3780 行）
    Array.prototype.slice.call(m.host.querySelectorAll('canvas')).forEach(c => c.remove());
    m.paper.style.opacity = '1'; m.paper.style.transform = 'none'; m.paper.parentElement.dataset.burnPose24 = 'true';
    if (m.shadow) m.shadow.style.filter = getComputedStyle(m.shadow).filter;
    let resolveDone, finished = false;
    const promise = new Promise(ok => { resolveDone = ok; });
    const finish = () => {
      if (finished) return; finished = true;
      stage.dataset.state = 'void'; delete stage.dataset.print;
      if (ash) ash.dataset.shown = 'true';
      if (opts.onDone) opts.onDone();
      resolveDone({ ok: true, variant, metrics: engine ? engine.metrics : null });
    };
    let engine = null;
    try {
      engine = window.JUNativeBurn.mount(m.host, { paper: m.paper, surface: m.surface, shadow: m.shadow, variant, duration: opts.duration || 6.6, onDone: finish });
    } catch (e) { unmount(stage, null); return { engine: null, promise: Promise.resolve({ ok: false, reason: String(e) }) }; }
    if (!engine) { unmount(stage, null); return { engine: null, promise: Promise.resolve({ ok: false, reason: 'no-context' }) }; }
    stage.__juBurn = engine;
    stage.dataset.state = 'burning';
    if (opts.onState) opts.onState('burning');
    if (reduced() && opts.reduced !== false) {
      // 减少动态：直接到终态（纸被吃完、画布清空），不播放 6.6s
      engine.seek(engine.duration);
      requestAnimationFrame(finish);
    } else engine.start();
    const handle = {
      engine, promise, variant,
      pause: () => { engine.pause(); return handle; }, resume: () => { engine.resume(); return handle; },
      seek: s => { engine.seek(s); return handle; },
      destroy: () => { unmount(stage, engine); },
    };
    return handle;
  };
  NS.burn.reset = function (host) {
    const stage = stageOf(host); unmount(stage, stage.__juBurn);
    const ash = stage.querySelector('[data-ash]') || (stage.parentElement && stage.parentElement.querySelector('[data-ash]')); if (ash) delete ash.dataset.shown;
    if (stage.dataset.state === 'void' || stage.dataset.state === 'burning') stage.dataset.state = 'ready';
  };
  NS.burn.DURATION = 6.6; NS.burn.VARIANTS = { B: '改期拒绝（多点烧穿·卷边炭化）', C: '局主取消 / 主动退出（侧向推进·落灰收尾）', A: '右下角起燃（V27 页面未使用）' };
})();

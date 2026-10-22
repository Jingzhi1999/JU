/* JU · 08 出席章 —— 章作为独立合成层：同一套 Blender 盖章 motion，按 attendance 状态输出不同颜色 / 文字。
   present = 深绿「出席」，absent = 印泥红「未出席」。
   1) make()：印泥质感章面（圈、刻度、字、噪点与不均匀墨迹）
   2) retexture()：把 Cycles 扫描票面上烤死的蓝色「入席」抠掉（局部修补），盖上状态章 → WebGL 正面贴图
   3) Compositor：盖章影片逐帧合成 —— 章区域用首帧干净纸面替换视频里的蓝色墨迹，垫上状态章，印章 / 影子仍从视频取 */
(function () {
  'use strict';
  var INK = { present: [45, 106, 75], absent: [178, 58, 44] };
  var TEXT = { present: '出席', absent: '未出席' };
  var TEX_STAMP = { cx: 660, cy: 592, r: 176, rot: -11 };            // 900×1200 票面贴图里的章
  var VID_STAMP = { cx: 559, cy: 531, rx: 93, ry: 95, rot: -11 };    // 900×1050 影片里的章（静止盖章段）
  var VID_QUAD = [[201, 216], [692, 222], [693, 880], [247, 822]];  // 影片首帧票根四角（TL TR BR BL）
  var clamp = function (v, a, b) { return Math.max(a, Math.min(b, v)); };
  var noiseCv = null;
  function noise(size) {
    if (noiseCv) return noiseCv;
    var c = document.createElement('canvas'); c.width = c.height = size; var g = c.getContext('2d'), id = g.createImageData(size, size), s = 90210, d = id.data;
    for (var i = 0; i < d.length; i += 4) { s = (Math.imul(s, 1664525) + 1013904223) >>> 0; var v = s >>> 24; d[i] = d[i + 1] = d[i + 2] = 255; d[i + 3] = v; }
    g.putImageData(id, 0, 0); noiseCv = c; return c;
  }
  var cache = {};
  function make(variant, metadata) {
    var city=metadata&&metadata.city||'NYC',year=metadata&&metadata.year||'2026',cacheKey=variant+'|'+city+'|'+year;
    if (cache[cacheKey]) return cache[cacheKey];
    var S = 600, c = document.createElement('canvas'); c.width = c.height = S; var g = c.getContext('2d'), ink = INK[variant] || INK.present;
    var col = 'rgb(' + ink.join(',') + ')';
    g.translate(S / 2, S / 2);
    g.strokeStyle = col; g.fillStyle = col; g.lineCap = 'round';
    g.lineWidth = 9; g.beginPath(); g.arc(0, 0, 280, 0, Math.PI * 2); g.stroke();
    g.lineWidth = 3; g.beginPath(); g.arc(0, 0, 252, 0, Math.PI * 2); g.stroke();
    for (var k = 0; k < 72; k++) { var a = k / 72 * Math.PI * 2, long = k % 3 === 0; g.lineWidth = long ? 3 : 2; g.beginPath(); g.moveTo(Math.cos(a) * 258, Math.sin(a) * 258); g.lineTo(Math.cos(a) * (long ? 275 : 268), Math.sin(a) * (long ? 275 : 268)); g.stroke(); }
    var mono = "'Space Mono', Menlo, monospace", serif = "'Noto Serif SC', 'Songti SC', 'STSong', serif";
    g.textAlign = 'center'; g.textBaseline = 'middle';
    if ('letterSpacing' in g) g.letterSpacing = '7px';
    g.font = '700 26px ' + mono; g.fillText('JU / '+city, 0, -128);
    var text = TEXT[variant] || TEXT.present;
    if ('letterSpacing' in g) g.letterSpacing = (text.length > 2 ? 4 : 14) + 'px';
    g.font = '900 ' + (text.length > 2 ? 122 : 168) + 'px ' + serif; g.fillText(text, text.length > 2 ? 2 : 7, 4);
    if ('letterSpacing' in g) g.letterSpacing = '6px';
    g.font = '700 24px ' + mono; g.fillText('WE WERE HERE', 0, 118);
    g.font = '700 22px ' + mono; g.fillText(String(year), 0, 154);
    // 印泥：噪点 + 大块不均匀 + 边缘轻微毛糙
    g.setTransform(1, 0, 0, 1, 0, 0);
    var id = g.getImageData(0, 0, S, S), d = id.data, n = noise(256).getContext('2d').getImageData(0, 0, 256, 256).data;
    var blot = document.createElement('canvas'); blot.width = blot.height = S; var bg = blot.getContext('2d'); bg.imageSmoothingEnabled = true; bg.drawImage(noise(256), 0, 0, 24, 24, 0, 0, S, S);
    var bd = bg.getImageData(0, 0, S, S).data;
    for (var p = 0; p < d.length; p += 4) {
      if (!d[p + 3]) continue;
      var x = (p / 4) % S, y = (p / 4 / S) | 0;
      var fine = n[(((y & 255) * 256) + (x & 255)) * 4 + 3] / 255, big = bd[p + 3] / 255;
      var a = (0.62 + 0.38 * fine) * (0.72 + 0.42 * big);
      if (fine < 0.07) a *= 0.25;
      d[p + 3] = Math.round(clamp(d[p + 3] / 255 * a, 0, 1) * 235);
    }
    g.putImageData(id, 0, 0);
    cache[cacheKey] = c; return c;
  }
  // 把章按（cx, cy, rx, ry, rot）画到目标画布：正片叠底，像真印泥压在纸上
  function stampTo(g, variant, cx, cy, rx, ry, rot, alpha, metadata) {
    var s = make(variant,metadata), k = rx / 280, ky = (ry || rx) / 280;
    g.save(); g.globalAlpha = alpha == null ? 1 : alpha; g.globalCompositeOperation = 'multiply'; g.translate(cx, cy); g.rotate((rot || 0) * Math.PI / 180); g.scale(k, ky); g.drawImage(s, -300, -300); g.restore();
  }
  function inkLike(r, g, b, thr) { return b - Math.max(r, g) > thr && (r + g + b) < 690; }
  // Cycles 扫描票面 → 抠掉烤死的蓝章、补纸、盖状态章
  function retexture(img, variant) {
    var W = img.naturalWidth || 900, H = img.naturalHeight || 1200;
    var c = document.createElement('canvas'); c.width = W; c.height = H; var g = c.getContext('2d'); g.drawImage(img, 0, 0, W, H);
    var sx = W / 900, sy = H / 1200, cx = TEX_STAMP.cx * sx, cy = TEX_STAMP.cy * sy, R = TEX_STAMP.r * sx * 1.16;
    var x0 = Math.max(0, Math.floor(cx - R)), y0 = Math.max(0, Math.floor(cy - R)), w = Math.min(W - x0, Math.ceil(R * 2)), h = Math.min(H - y0, Math.ceil(R * 2));
    var id = g.getImageData(x0, y0, w, h), d = id.data, clean = variant === 'none';
    for (var y = 0; y < h; y++) for (var x = 0; x < w; x++) {
      var dx = x0 + x - cx, dy = y0 + y - cy, rr = Math.sqrt(dx * dx + dy * dy); if (rr > R) continue;
      var i = (y * w + x) * 4, thr = rr < R * .62 ? (clean ? 5 : 11) : (clean ? 12 : 24);   // 圈内更狠（底下是字），圈边留住细的 guilloche 线；干净版（盖章前）连淡边也抠
      if (inkLike(d[i], d[i + 1], d[i + 2], thr)) d[i + 3] = 0;
    }
    if (clean) {                                               // 洞外扩 1px，抓住抹残的淡蓝边
      var mark = new Uint8Array(w * h);
      for (var y2 = 1; y2 < h - 1; y2++) for (var x2 = 1; x2 < w - 1; x2++) { var j = y2 * w + x2; if (d[j * 4 + 3] === 0) { mark[j - 1] = mark[j + 1] = mark[j - w] = mark[j + w] = 1; } }
      for (var k = 0; k < w * h; k++) if (mark[k]) d[k * 4 + 3] = 0;
    }
    var holes = document.createElement('canvas'); holes.width = w; holes.height = h; holes.getContext('2d').putImageData(id, 0, 0);
    // 补纸：透明洞 + 模糊 = 邻近纸面颜色的加权平均
    var fill = document.createElement('canvas'); fill.width = w; fill.height = h; var fg = fill.getContext('2d');
    fg.filter = 'blur(7px)'; fg.drawImage(holes, 0, 0); fg.filter = 'blur(2px)'; fg.drawImage(holes, 0, 0); fg.filter = 'none'; fg.drawImage(holes, 0, 0);
    g.save(); g.beginPath(); g.arc(cx, cy, R, 0, Math.PI * 2); g.clip(); g.drawImage(fill, x0, y0); g.restore();
    if (variant !== 'none') stampTo(g, variant, cx, cy, TEX_STAMP.r * sx, TEX_STAMP.r * sy, TEX_STAMP.rot, 1);
    return c;
  }
  /* 影片合成器：out = 视频帧；章区域内 = 首帧纸面 + 状态章，再把印章本体 / 影子（与首帧差异大且非蓝墨的像素）盖回去 */
  function Compositor(video, poster, out) {
    this.v = video; this.poster = poster; this.out = out; this.g = out.getContext('2d');
    this.variant = 'present'; this.cw = 0; this.ch = 0;
    var R = Math.ceil(Math.max(VID_STAMP.rx, VID_STAMP.ry) * 1.32);
    this.reg = { x: Math.round(VID_STAMP.cx - R), y: Math.round(VID_STAMP.cy - R), w: R * 2, h: R * 2 };
    var mk = function (w, h) { var c = document.createElement('canvas'); c.width = w; c.height = h; return c; };
    this.cur = mk(this.reg.w, this.reg.h); this.cg = this.cur.getContext('2d', { willReadFrequently: true });
    this.f0 = mk(this.reg.w, this.reg.h); this.f0g = this.f0.getContext('2d', { willReadFrequently: true }); this.f0d = null;
    this.st = mk(this.reg.w, this.reg.h); this.stg = this.st.getContext('2d', { willReadFrequently: true }); this.std = null;
    this.res = mk(this.reg.w, this.reg.h); this.rg = this.res.getContext('2d');
  }
  Compositor.prototype.size = function (cw, ch, dpr) { this.cw = cw; this.ch = ch; var k = Math.min(2, dpr || devicePixelRatio || 1); this.out.width = Math.max(1, Math.round(cw * k)); this.out.height = Math.max(1, Math.round(ch * k)); this.k = k; };
  Compositor.prototype.setVariant = function (v) { if (this.variant !== v) { this.variant = v; this.std = null; } };
  Compositor.prototype.prep = function () {
    var r = this.reg;
    if (!this.f0d) {
      var src = this.poster && this.poster.naturalWidth ? this.poster : null; if (!src) return false;
      this.f0g.clearRect(0, 0, r.w, r.h); this.f0g.drawImage(src, r.x, r.y, r.w, r.h, 0, 0, r.w, r.h); this.f0d = this.f0g.getImageData(0, 0, r.w, r.h).data;
    }
    if (!this.std) {
      this.stg.clearRect(0, 0, r.w, r.h); stampTo(this.stg, this.variant, VID_STAMP.cx - r.x, VID_STAMP.cy - r.y, VID_STAMP.rx, VID_STAMP.ry, VID_STAMP.rot, 1);
      // multiply 在透明底上不成立：这里只要章的 alpha 与颜色，合成时手动做正片叠底
      this.std = this.stg.getImageData(0, 0, r.w, r.h).data;
    }
    return true;
  };
  // t：视频时间；alpha 由时间决定（印章落下 ~2.3s 后墨迹出现）
  Compositor.prototype.draw = function (t) {
    var v = this.v, g = this.g, k = this.k || 1;
    if (!this.cw || v.readyState < 2) return false;
    g.setTransform(k, 0, 0, k, 0, 0); g.clearRect(0, 0, this.cw, this.ch);
    var sx = this.cw / 900, sy = this.ch / 1050;
    try { g.drawImage(v, 0, 0, this.cw, this.ch); } catch (e) { return false; }
    if (!this.prep()) return true;
    var r = this.reg, ink = INK[this.variant] || INK.present;
    var a = clamp((t - 2.32) / .22, 0, 1);
    this.cg.clearRect(0, 0, r.w, r.h);
    try { this.cg.drawImage(v, r.x, r.y, r.w, r.h, 0, 0, r.w, r.h); } catch (e) { return true; }
    var id = this.cg.getImageData(0, 0, r.w, r.h), d = id.data, f0 = this.f0d, st = this.std;
    var cx = r.w / 2, cy = r.h / 2, RX = VID_STAMP.rx * 1.3, RY = VID_STAMP.ry * 1.3;
    for (var y = 0; y < r.h; y++) for (var x = 0; x < r.w; x++) {
      var i = (y * r.w + x) * 4, ex = (x - cx) / RX, ey = (y - cy) / RY;
      if (ex * ex + ey * ey > 1) continue;
      var R0 = f0[i], G0 = f0[i + 1], B0 = f0[i + 2], A0 = f0[i + 3];
      var Rc = d[i], Gc = d[i + 1], Bc = d[i + 2], Ac = d[i + 3];
      var isInk = inkLike(Rc, Gc, Bc, 11) && !inkLike(R0, G0, B0, 11);
      var diff = Math.abs(Rc - R0) + Math.abs(Gc - G0) + Math.abs(Bc - B0) + Math.abs(Ac - A0);
      var isObject = !isInk && diff > 54 && A0 > 0 ? true : (A0 === 0 && Ac > 0 ? true : false);
      if (isObject) continue;                                    // 印章本体 / 影子：视频原像素
      // 纸面：首帧像素 + 状态章（正片叠底）
      var sa = st[i + 3] / 255 * a;
      if (sa > 0) { var mr = ink[0] / 255, mg = ink[1] / 255, mb = ink[2] / 255; d[i] = Math.round(R0 * (1 - sa + sa * mr)); d[i + 1] = Math.round(G0 * (1 - sa + sa * mg)); d[i + 2] = Math.round(B0 * (1 - sa + sa * mb)); }
      else { d[i] = R0; d[i + 1] = G0; d[i + 2] = B0; }
      d[i + 3] = A0;
    }
    this.rg.putImageData(id, 0, 0);
    g.drawImage(this.res, 0, 0, r.w, r.h, r.x * sx, r.y * sy, r.w * sx, r.h * sy);
    return true;
  };
  window.JuStamp = { make: make, retexture: retexture, stampTo: stampTo, Compositor: Compositor, VID_QUAD: VID_QUAD, INK: INK };
})();

/* JU · 焚烧引擎 —— How We Feel 逐帧复刻
   分层：票根纹理 / 破坏遮罩 / 亮橙焦边 / 炭化层 / 火焰层 / 余烬粒子 / 极少量烟
   破坏边界来自 procedural noise 场（不是线性擦除），火线不均匀推进、出现半岛与孤岛
   全程发生在 JU 原背景上：不改背景、不上黑幕 */
(function () {
  var DPR = Math.min(2, window.devicePixelRatio || 1);
  var clamp = function (v, a, b) { return v < a ? a : v > b ? b : v; };

  function hash2(x, y, s) {
    var h = (x | 0) * 374761393 + (y | 0) * 668265263 + s * 1274126177;
    h = (h ^ (h >> 13)) * 1274126177;
    return ((h ^ (h >> 16)) >>> 0) / 4294967295;
  }
  function vnoise(x, y, s) {
    var ix = Math.floor(x), iy = Math.floor(y), fx = x - ix, fy = y - iy;
    var u = fx * fx * (3 - 2 * fx), v = fy * fy * (3 - 2 * fy);
    var a = hash2(ix, iy, s), b = hash2(ix + 1, iy, s), c = hash2(ix, iy + 1, s), d = hash2(ix + 1, iy + 1, s);
    return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
  }

  /* ── 参数：火的手感 ──────────────────────────────────────── */
  var HOT = 0.012;     // 亮橙热边宽度（T 单位，≈3px）
  var BROWN = 0.034;   // 深褐炭化
  var BLACK = 0.092;   // 黑炭
  var EDGE = 0.013;    // 消失过渡
  var MS = 0.55;       // 遮罩分辨率
  var EMBER_RATE = 210;// 余烬密度（个/秒·峰值）
  var PAD = { l: 78, t: 104, r: 78, b: 92 };

  // 时间轴：0 完整 → 点火 → 破洞 → 吞噬 → 高潮 → 残片 → 余烬
  var KEYS = [[0, 0], [0.08, 0], [0.155, 0.012], [0.20, 0.038], [0.32, 0.135],
              [0.55, 0.405], [0.75, 0.705], [0.90, 0.945], [1, 1.16]];
  function burnAt(t) {
    for (var i = 1; i < KEYS.length; i++) {
      if (t <= KEYS[i][0]) {
        var a = KEYS[i - 1], b = KEYS[i], u = (t - a[0]) / (b[0] - a[0] || 1);
        return a[1] + (b[1] - a[1]) * u;
      }
    }
    return KEYS[KEYS.length - 1][1];
  }
  function flameEnv(t) {                                  // 火焰规模包络
    if (t < 0.075) return 0;
    if (t < 0.20) return (t - 0.075) / 0.125;
    if (t < 0.80) return 1;
    if (t < 0.95) return 1 - (t - 0.80) / 0.15 * 0.86;
    return Math.max(0, 0.14 - (t - 0.95) * 2.8);
  }

  function sprite(rgb) {
    var c = document.createElement('canvas');
    c.width = c.height = 24;
    var g = c.getContext('2d');
    var gr = g.createRadialGradient(12, 12, 0, 12, 12, 12);
    gr.addColorStop(0, 'rgba(' + rgb + ',1)');
    gr.addColorStop(0.34, 'rgba(' + rgb + ',.62)');
    gr.addColorStop(1, 'rgba(' + rgb + ',0)');
    g.fillStyle = gr; g.fillRect(0, 0, 24, 24);
    return c;
  }

  function Burn(host, o) {
    var W = o.width, H = o.height;
    this.o = o; this.W = W; this.H = H;
    this.CW = W + PAD.l + PAD.r; this.CH = H + PAD.t + PAD.b;
    this.dur = o.duration || 5300;

    host.style.position = 'absolute';
    host.__juburn = this;
    var cv = this.cv = document.createElement('canvas');
    cv.width = Math.round(this.CW * DPR); cv.height = Math.round(this.CH * DPR);
    cv.style.cssText = 'position:absolute;left:' + (-PAD.l) + 'px;top:' + (-PAD.t) + 'px;width:' + this.CW +
      'px;height:' + this.CH + 'px;pointer-events:none;opacity:0;z-index:9';
    host.appendChild(cv);
    this.g = cv.getContext('2d');

    this.src = document.createElement('canvas');
    this.src.width = Math.round(W * DPR); this.src.height = Math.round(H * DPR);
    var sg = this.src.getContext('2d');
    sg.setTransform(DPR, 0, 0, DPR, 0, 0);
    o.draw(sg, W, H);

    var mw = this.mw = Math.max(4, Math.round(W * MS)), mh = this.mh = Math.max(4, Math.round(H * MS));
    this.charCv = document.createElement('canvas'); this.charCv.width = mw; this.charCv.height = mh;
    this.charG = this.charCv.getContext('2d');
    this.eraCv = document.createElement('canvas'); this.eraCv.width = mw; this.eraCv.height = mh;
    this.eraG = this.eraCv.getContext('2d');
    this.hotCv = document.createElement('canvas'); this.hotCv.width = mw; this.hotCv.height = mh;
    this.hotG = this.hotCv.getContext('2d');
    this.charImg = this.charG.createImageData(mw, mh);
    this.eraImg = this.eraG.createImageData(mw, mh);
    this.hotImg = this.hotG.createImageData(mw, mh);
    // 纸单独一层：char/erase 只在纸上生效，火光不会被当成纸的一部分投影
    this.layerCv = document.createElement('canvas');
    this.layerCv.width = Math.round(this.CW * DPR); this.layerCv.height = Math.round(this.CH * DPR);
    this.layerG = this.layerCv.getContext('2d');
    this.flameCv = document.createElement('canvas');
    this.flameCv.width = Math.round(this.CW * 0.6); this.flameCv.height = Math.round(this.CH * 0.6);
    this.flameG = this.flameCv.getContext('2d');

    // 票根实心区（源画布 alpha），火只吃纸 —— 向外扩一格，避免边缘留下一圈没烧掉的纸
    var im = sg.getImageData(0, 0, this.src.width, this.src.height).data;
    this.solid = new Uint8Array(mw * mh);
    var half = 0.5 / MS * DPR;
    var probe = function (sx, sy, W2, H2) {
      if (sx < 0 || sy < 0 || sx >= W2 || sy >= H2) return 0;
      return im[((sy | 0) * W2 + (sx | 0)) * 4 + 3] > 24 ? 1 : 0;
    };
    for (var y = 0; y < mh; y++) for (var x = 0; x < mw; x++) {
      var sx0 = x / MS * DPR, sy0 = y / MS * DPR, hit = 0;
      hit = probe(sx0, sy0, this.src.width, this.src.height)
        || probe(sx0 - half, sy0 - half, this.src.width, this.src.height)
        || probe(sx0 + half, sy0 - half, this.src.width, this.src.height)
        || probe(sx0 - half, sy0 + half, this.src.width, this.src.height)
        || probe(sx0 + half, sy0 + half, this.src.width, this.src.height);
      this.solid[y * mw + x] = hit ? 1 : 0;
    }
    this.field();
    this.embers = [];
    this.smoke = [];
    this.sp = [sprite('255,128,16'), sprite('255,180,50'), sprite('255,236,168')];
    this.b = 0; this.t = 0; this.running = false;
  }

  /* 点燃时间场 T：底部先燃 + 分形噪声 + 舌状突进 + 点火点 */
  Burn.prototype.field = function () {
    var mw = this.mw, mh = this.mh, H = this.H, W = this.W;
    var T = this.T = new Float32Array(mw * mh);
    var igx = W * (this.o.ignitionX == null ? 0.44 : this.o.ignitionX), igy = H - 3;
    var t1 = W * 0.70, t2 = W * 0.20, t3 = W * 0.46;
    var mn = 1e9, mx = -1e9, i;
    // 到纸边的距离场（两遍 chamfer）—— 让火能顺着轮廓往里啃，而不是撞到纸边就停
    var D = this.D = new Float32Array(mw * mh), BIG = 1e6, xx, yy;
    for (i = 0; i < D.length; i++) D[i] = this.solid[i] ? BIG : 0;
    // 纸常常铺满整张网格（左右不留空），得把网格外也当作"非纸"播种，否则侧边量不出距离
    for (xx = 0; xx < mw; xx++) { if (this.solid[xx]) D[xx] = 1; i = (mh - 1) * mw + xx; if (this.solid[i]) D[i] = 1; }
    for (yy = 0; yy < mh; yy++) { i = yy * mw; if (this.solid[i]) D[i] = 1; i = yy * mw + mw - 1; if (this.solid[i]) D[i] = 1; }
    for (yy = 0; yy < mh; yy++) for (xx = 0; xx < mw; xx++) {
      i = yy * mw + xx; if (!this.solid[i]) continue;
      var d1 = D[i];
      if (xx > 0) d1 = Math.min(d1, D[i - 1] + 1);
      if (yy > 0) d1 = Math.min(d1, D[i - mw] + 1);
      if (xx > 0 && yy > 0) d1 = Math.min(d1, D[i - mw - 1] + 1.414);
      if (xx < mw - 1 && yy > 0) d1 = Math.min(d1, D[i - mw + 1] + 1.414);
      D[i] = d1;
    }
    for (yy = mh - 1; yy >= 0; yy--) for (xx = mw - 1; xx >= 0; xx--) {
      i = yy * mw + xx; if (!this.solid[i]) continue;
      var d2 = D[i];
      if (xx < mw - 1) d2 = Math.min(d2, D[i + 1] + 1);
      if (yy < mh - 1) d2 = Math.min(d2, D[i + mw] + 1);
      if (xx < mw - 1 && yy < mh - 1) d2 = Math.min(d2, D[i + mw + 1] + 1.414);
      if (xx > 0 && yy < mh - 1) d2 = Math.min(d2, D[i + mw - 1] + 1.414);
      D[i] = d2;
    }
    for (var y = 0; y < mh; y++) for (var x = 0; x < mw; x++) {
      var px = x / MS, py = y / MS;
      var n = vnoise(px / 33, py / 33, 3) * 0.60 + vnoise(px / 14, py / 14, 7) * 0.27 + vnoise(px / 6.5, py / 6.5, 11) * 0.13;
      var v = (H - py) / H * 0.80 + (n - 0.5) * 0.58;
      v -= 0.22 * Math.exp(-Math.pow((px - t1) / 30, 2)) * (0.55 + 0.45 * Math.sin(py * 0.021 + 1.1));
      v -= 0.17 * Math.exp(-Math.pow((px - t2) / 24, 2)) * (0.5 + 0.5 * Math.sin(py * 0.017 + 2.6));
      v += 0.13 * Math.exp(-Math.pow((px - t3) / 34, 2));
      v -= 0.46 * Math.exp(-(Math.pow(px - igx, 2) / 1900 + Math.pow(py - igy, 2) / 1500));
      i = y * mw + x;
      var ed = D[i] / MS;                                 // 到纸边的像素距离
      v -= (0.11 + 0.19 * vnoise(px / 7.5, py / 7.5, 23)) * Math.exp(-ed / 10);
      T[i] = v;
      if (this.solid[i]) { if (v < mn) mn = v; if (v > mx) mx = v; }
    }
    var sc = 1 / (mx - mn || 1);
    for (i = 0; i < T.length; i++) T[i] = (T[i] - mn) * sc;
  };

  Burn.prototype.start = function () {
    if (this.running) return;
    this.running = true; this.t = 0; this.b = 0;
    this.embers.length = 0; this.smoke.length = 0;
    this.cv.style.opacity = '1';
    this.t0 = performance.now(); this.last = this.t0;
    var self = this;
    var loop = function (now) {
      var dt = clamp((now - self.last) / 1000, 0, 0.05); self.last = now;
      self.t = clamp((now - self.t0) / self.dur, 0, 1);
      self.b = burnAt(self.t);
      self.tick(dt, (now - self.t0) / 1000);
      self.render((now - self.t0) / 1000);
      if (self.t < 1 || self.embers.length) self.raf = requestAnimationFrame(loop);
      else { self.running = false; self.o.onDone && self.o.onDone(); }
      if (self.t >= 1 && !self.tail) {                    // 只剩余烬的收尾
        self.tail = true;
        setTimeout(function () { self.o.onEmberOnly && self.o.onEmberOnly(); }, 120);
      }
    };
    this.raf = requestAnimationFrame(loop);
  };

  Burn.prototype.reset = function () {
    cancelAnimationFrame(this.raf);
    this.running = false; this.tail = false; this.t = 0; this.b = 0;
    this.embers.length = 0; this.smoke.length = 0;
    this.cv.style.opacity = '0';
    this.g.setTransform(DPR, 0, 0, DPR, 0, 0);
    this.g.clearRect(0, 0, this.CW, this.CH);
  };
  Burn.prototype.destroy = function () { cancelAnimationFrame(this.raf); };

  /* 沿火线取样：每列从下往上找第一处未燃 → 火焰与余烬都贴着它生 */
  Burn.prototype.front = function () {
    var mw = this.mw, mh = this.mh, T = this.T, S = this.solid, b = this.b, pts = [];
    var stepx = Math.max(1, Math.round(6 * MS));
    for (var x = 1; x < mw; x += stepx) {
      var found = -1, any = 0;
      for (var y = mh - 1; y >= 0; y--) {
        var i = y * mw + x;
        if (!S[i]) continue;
        any = 1;
        if (T[i] > b) { found = y; break; }
      }
      if (found >= 0 && any) pts.push({ x: x / MS, y: found / MS });
    }
    return pts;
  };

  Burn.prototype.tick = function (dt, time) {
    var env = flameEnv(this.t), i, p;
    this.pts = this.front();
    // 余烬：贴着火线出生，向上 + 横向漂散，少数短暂下坠
    var n = Math.round(EMBER_RATE * env * dt);
    if (this.t > 0.075 && this.t < 0.99) {
      for (i = 0; i < n && this.embers.length < 520; i++) {
        var src = this.pts.length ? this.pts[(Math.random() * this.pts.length) | 0] : { x: this.W * 0.44, y: this.H - 2 };
        var big = Math.random() > 0.9;
        this.embers.push({
          x: src.x + (Math.random() - 0.5) * 9, y: src.y + (Math.random() - 0.5) * 7,
          vx: (Math.random() - 0.5) * 46, vy: -(16 + Math.random() * 74) * (Math.random() > 0.86 ? -0.32 : 1),
          r: big ? 1.5 + Math.random() * 1.1 : 0.45 + Math.random() * 0.85,
          life: 0, max: 0.5 + Math.random() * (big ? 1.5 : 1.1),
          c: Math.random() > 0.72 ? 2 : (Math.random() > 0.4 ? 0 : 1),
        });
      }
      if (Math.random() < dt * 5 * env) this.smoke.push({
        x: (this.pts.length ? this.pts[(Math.random() * this.pts.length) | 0].x : this.W / 2) + (Math.random() - 0.5) * 30,
        y: this.H * 0.6 * Math.random() + this.H * 0.3, r: 14 + Math.random() * 22, life: 0, max: 1.9 + Math.random(),
        vx: (Math.random() - 0.5) * 12, vy: -22 - Math.random() * 26,
      });
    }
    for (i = this.embers.length - 1; i >= 0; i--) {
      p = this.embers[i];
      p.life += dt;
      if (p.life >= p.max) { this.embers.splice(i, 1); continue; }
      p.vy += 26 * dt;                                     // 上升渐缓
      p.vx *= 0.987;
      p.x += p.vx * dt; p.y += p.vy * dt;
    }
    for (i = this.smoke.length - 1; i >= 0; i--) {
      p = this.smoke[i];
      p.life += dt;
      if (p.life >= p.max) { this.smoke.splice(i, 1); continue; }
      p.x += p.vx * dt; p.y += p.vy * dt; p.r += 14 * dt;
    }
  };

  Burn.prototype.mask = function () {
    var mw = this.mw, mh = this.mh, T = this.T, S = this.solid, b = this.b;
    var cd = this.charImg.data, ed = this.eraImg.data, hd = this.hotImg.data;
    for (var i = 0, n = mw * mh; i < n; i++) {
      var o4 = i << 2;
      hd[o4 + 3] = 0;
      if (!S[i]) { cd[o4 + 3] = 0; ed[o4 + 3] = 0; continue; }
      var d = b - T[i];
      if (d <= 0) { cd[o4 + 3] = 0; ed[o4 + 3] = 0; continue; }
      var r, g, bl, a = 255;
      if (d < HOT) {                                       // 亮黄 → 亮橙的热边
        var u = d / HOT;
        r = 255; g = 244 - 118 * u; bl = 186 - 168 * u;
        a = Math.min(255, (d / (HOT * 0.30)) * 255);
      } else if (d < BROWN) {                              // 深褐
        var u2 = (d - HOT) / (BROWN - HOT);
        r = 255 - 181 * u2; g = 126 - 92 * u2; bl = 18 - 8 * u2;
      } else if (d < BLACK) {                              // 炭黑
        var u3 = (d - BROWN) / (BLACK - BROWN);
        r = 74 - 62 * u3; g = 34 - 27 * u3; bl = 10 - 6 * u3;
        if (u3 > 0.25 && hash2(i, 17, 5) > 0.983) { r = 196; g = 78; bl = 14; }   // 炭里未熄的点
      } else { r = 10; g = 6; bl = 4; }
      cd[o4] = r; cd[o4 + 1] = g; cd[o4 + 2] = bl; cd[o4 + 3] = a;
      if (d < BROWN) {                                     // 只有热边参与泛光，炭黑不参与
        hd[o4] = r; hd[o4 + 1] = g; hd[o4 + 2] = bl;
        hd[o4 + 3] = Math.round(a * (1 - d / BROWN));
      }
      ed[o4] = 0; ed[o4 + 1] = 0; ed[o4 + 2] = 0;
      ed[o4 + 3] = d > BLACK ? Math.min(255, (d - BLACK) / EDGE * 255) : 0;
    }
    this.charG.putImageData(this.charImg, 0, 0);
    this.eraG.putImageData(this.eraImg, 0, 0);
    this.hotG.putImageData(this.hotImg, 0, 0);
  };

  /* 火苗：底部窜起的舌状火焰，暖白核 + 橙外缘 + 抖动 */
  Burn.prototype.flame = function (g, x, baseY, w, h, time, seed, core) {
    var steps = 8, i, pts = [];
    for (i = 0; i <= steps; i++) {
      var u = i / steps;
      var taper = Math.pow(Math.sin((1 - u * 0.92) * Math.PI * 0.5), 0.75);
      var wob = (vnoise(seed * 5.1 + u * 2.4, time * 2.6 + u * 1.7, 21) - 0.5) * w * 1.5 * u * u;
      var cx = x + wob + Math.sin(time * 3.1 + seed * 2.2) * w * 0.16 * u;
      var hw = Math.max(0.5, w * 0.5 * taper * (core ? 0.42 : 1));
      pts.push([cx - hw, baseY - h * u, cx + hw]);
    }
    g.beginPath();
    g.moveTo(pts[0][0], pts[0][1]);
    for (i = 1; i <= steps; i++) g.lineTo(pts[i][0], pts[i][1]);
    for (i = steps; i >= 0; i--) g.lineTo(pts[i][2], pts[i][1]);
    g.closePath();
    var gr = g.createLinearGradient(0, baseY, 0, baseY - h);
    if (core) {
      gr.addColorStop(0, 'rgba(255,248,222,.96)');
      gr.addColorStop(0.45, 'rgba(255,226,124,.88)');
      gr.addColorStop(1, 'rgba(255,186,60,0)');
    } else {
      gr.addColorStop(0, 'rgba(255,120,10,.80)');
      gr.addColorStop(0.36, 'rgba(255,164,28,.70)');
      gr.addColorStop(1, 'rgba(255,104,10,0)');
    }
    g.fillStyle = gr;
    g.fill();
  };

  Burn.prototype.render = function (time) {
    var g = this.g, W = this.W, H = this.H, i, p;
    g.setTransform(DPR, 0, 0, DPR, 0, 0);
    g.clearRect(0, 0, this.CW, this.CH);
    var env = flameEnv(this.t);

    // 火线附近的暖光（落在 JU 原背景上，不是黑幕）
    if (env > 0 && this.pts && this.pts.length) {
      var mid = this.pts[(this.pts.length / 2) | 0];
      var gx = PAD.l + mid.x, gy = PAD.t + mid.y;
      // 半径收在画布内：否则暖光会被画布边裁掉，留下一圈笔直的矩形
      var room = Math.min(gx, this.CW - gx, gy, this.CH - gy);
      var R = Math.max(36, Math.min(190, room));
      var gl = g.createRadialGradient(gx, gy, 2, gx, gy, R);
      gl.addColorStop(0, 'rgba(255,146,44,' + (0.20 * env * Math.min(1, R / 150)).toFixed(3) + ')');
      gl.addColorStop(1, 'rgba(255,120,30,0)');
      g.fillStyle = gl;
      g.beginPath(); g.arc(gx, gy, R, 0, 6.2832); g.fill();
    }

    // 票根 + 炭化 + 破坏 —— 全部画进独立图层，source-atop 只咬得到纸
    this.mask();
    var lg = this.layerG;
    lg.setTransform(DPR, 0, 0, DPR, 0, 0);
    lg.clearRect(0, 0, this.CW, this.CH);
    lg.save();
    lg.translate(PAD.l, PAD.t);
    lg.imageSmoothingEnabled = true;
    lg.drawImage(this.src, 0, 0, W, H);
    lg.globalCompositeOperation = 'source-atop';
    lg.drawImage(this.charCv, 0, 0, W, H);
    lg.globalCompositeOperation = 'destination-out';
    lg.drawImage(this.eraCv, 0, 0, W, H);
    lg.restore();
    // 影子跟着烧剩的轮廓走，不是跟着画布矩形 —— 边缘才不会出现一圈直角
    g.save();
    g.shadowColor = 'rgba(18,22,48,.24)'; g.shadowBlur = 30; g.shadowOffsetY = 20;
    g.drawImage(this.layerCv, 0, 0, this.CW, this.CH);
    g.restore();

    // 焦边泛光
    g.save();
    g.translate(PAD.l, PAD.t);
    g.globalCompositeOperation = 'lighter';
    g.globalAlpha = 0.72;
    g.filter = 'blur(6px)';
    g.drawImage(this.hotCv, 0, 0, W, H);
    g.filter = 'blur(1.4px)';
    g.globalAlpha = 0.5;
    g.drawImage(this.hotCv, 0, 0, W, H);
    g.restore();

    // 烟：极少量，只是配角
    if (this.smoke.length) {
      g.save();
      g.translate(PAD.l, PAD.t);
      for (i = 0; i < this.smoke.length; i++) {
        p = this.smoke[i];
        var k = p.life / p.max;
        var sgr = g.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r);
        sgr.addColorStop(0, 'rgba(52,44,40,' + (0.085 * (1 - k) * env).toFixed(3) + ')');
        sgr.addColorStop(1, 'rgba(52,44,40,0)');
        g.fillStyle = sgr;
        g.beginPath(); g.arc(p.x, p.y, p.r, 0, 6.2832); g.fill();
      }
      g.restore();
    }

    // 火焰层
    var fg = this.flameG, fs = 0.6;
    fg.setTransform(fs, 0, 0, fs, 0, 0);
    fg.clearRect(0, 0, this.CW, this.CH);
    if (env > 0.002) {
      fg.save();
      fg.translate(PAD.l, PAD.t);
      var list = [], igx = W * 0.44;
      if (this.t < 0.30) {                                  // 点火：先就一簇明确的火苗舔纸
        var ig = clamp((this.t - 0.075) / 0.09, 0, 1), fade = clamp((0.30 - this.t) / 0.07, 0, 1);
        list.push({ x: igx, y: H - 1, w: (26 + 16 * ig) * fade, h: (26 + 78 * ig) * fade, s: 1.7 });
        list.push({ x: igx - 14, y: H - 1, w: (15 + 9 * ig) * fade, h: (15 + 44 * ig) * fade, s: 3.4 });
      }
      var ramp = clamp((this.t - 0.21) / 0.08, 0, 1);
      if (this.pts && ramp > 0) for (i = 0; i < this.pts.length; i += 3) {
        var q = this.pts[i];
        if (vnoise(q.x / 34 + 11, time * 0.85, 41) < 0.44) continue;   // 火苗时有时无
        var hn = vnoise(q.x / 22, time * 1.6, 31);
        var hh = (10 + 92 * hn * hn) * env * ramp;
        if (hh < 9) continue;
        list.push({ x: q.x, y: q.y + 3, w: 15 + 21 * hn, h: hh, s: q.x * 0.037 });
      }
      for (i = 0; i < list.length; i++) this.flame(fg, list[i].x, list[i].y, list[i].w, list[i].h, time, list[i].s, false);
      fg.restore();
      this.flameList = list;
    } else this.flameList = null;
    g.save();
    g.filter = 'blur(2.4px)';
    g.globalAlpha = 0.92;
    g.drawImage(this.flameCv, 0, 0, this.CW, this.CH);
    g.restore();
    if (this.flameList) {                                   // 暖白核：不模糊
      g.save();
      g.translate(PAD.l, PAD.t);
      for (i = 0; i < this.flameList.length; i++) {
        var f = this.flameList[i];
        this.flame(g, f.x, f.y, f.w * 0.56, f.h * 0.62, time, f.s + 0.7, true);
      }
      g.globalCompositeOperation = 'lighter';
      g.globalAlpha = 0.5;
      for (i = 0; i < this.flameList.length; i++) {
        var f2 = this.flameList[i];
        this.flame(g, f2.x, f2.y, f2.w * 0.3, f2.h * 0.4, time, f2.s + 1.6, true);
      }
      g.restore();
    }

    // 余烬
    if (this.embers.length) {
      g.save();
      g.translate(PAD.l, PAD.t);
      for (i = 0; i < this.embers.length; i++) {
        p = this.embers[i];
        var kk = p.life / p.max, al = kk < 0.16 ? kk / 0.16 : Math.pow(1 - kk, 1.5);
        var rr = p.r * (1 - kk * 0.55) * 4.2;
        g.globalAlpha = clamp(al, 0, 1);
        g.drawImage(this.sp[p.c], p.x - rr, p.y - rr, rr * 2, rr * 2);
      }
      g.restore();
    }
  };

  window.JUBurn = {
    mount: function (host, o) { var x = new Burn(host, o); window.JUBurn.last = x; return x; },
    /* QA：把时间轴钉在某一刻 */
    qa: function (t) {
      var x = window.JUBurn.last || (document.querySelector('[data-burn="s10"]') || {}).__juburn;
      if (!x) return;
      x.cv.style.opacity = '1';
      x.t = t; x.b = burnAt(t);
      for (var i = 0; i < 26; i++) { x.tick(0.016, t * 5.3); }
      x.render(t * 5.3);
    },
  };
})();

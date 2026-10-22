/* JU · 撕票根引擎 —— FocusFlight 逐帧复刻
   物体模型：一整条副券 = 26 段 verlet 链（距离约束 + 弯曲刚度）
   已撕段受重力下垂、未撕段仍锚在齿孔线上、撕裂前沿是白色圆点
   条码 / 文字 / 纸底 = 同一张源画布，逐段采样绘制 → 共用同一形变场 */
(function () {
  var DPR = Math.min(2, window.devicePixelRatio || 1);
  var clamp = function (v, a, b) { return v < a ? a : v > b ? b : v; };

  function srcCanvas(w, h, draw) {
    var c = document.createElement('canvas');
    c.width = Math.round(w * DPR); c.height = Math.round(h * DPR);
    var g = c.getContext('2d');
    g.setTransform(DPR, 0, 0, DPR, 0, 0);
    draw(g, w, h);
    return c;
  }

  /* ── 参数：纸的手感 ──────────────────────────────────────── */
  var N = 26;          // 逻辑分段（视觉仍是一整张连续纸）
  var GRAV = 1450;     // 重力 px/s²
  var DAMP = 0.982;    // 空气阻尼
  var BEND = 0.30;     // 弯曲刚度：纸不是布，撑得住
  var MAXA = 2.05 * Math.PI / 180;  // 相邻两段最大夹角 —— 纸的挺度，撕得越多垂得越弯
  var ITER = 6;        // 约束迭代
  var SNAP = 0.5;      // 松手阈值：过半自动撕完，未过半回位
  var PADX = 88, PADT = 18, PADB = 220;

  function Rig(host, o) {
    var W = o.width, H = o.height, self = this;
    this.o = o; this.W = W; this.H = H;
    this.CW = W + PADX * 2; this.CH = PADT + H + PADB;
    this.seg = W / N;
    this.p = 0; this.vel = 0;
    this.free = false; this.falling = false; this.done = false;
    this.dragging = false; this.retract = false; this.auto = false;
    this.enabled = false; this.fade = 1; this.destroyed = false; this.notified = false;this.detachNotified=false; this.visible = true;
    this.reduced = matchMedia('(prefers-reduced-motion: reduce)');

    host.style.position = 'relative';
    host.style.touchAction = 'none';
    // 重新挂载时先把上一个 rig 的产物清干净 ——
    // 否则每挂载一次就多一层副券，撜掉一层下面还压着一层
    var old = host.__jurig;
    if (old) {
      try { old.destroy(); } catch (x) {}
      [old.cv, old.knob, old.grab].forEach(function (el) { if (el && el.parentNode === host) host.removeChild(el); });
    }
    Array.prototype.slice.call(host.querySelectorAll('canvas[data-jurig]')).forEach(function (el) { el.remove(); });
    this.host = host;
    host.__jurig = this;

    var cv = this.cv = document.createElement('canvas');
    cv.setAttribute('data-jurig', '1');
    cv.width = Math.round(this.CW * DPR); cv.height = Math.round(this.CH * DPR);
    cv.style.cssText = 'position:absolute;left:' + (-PADX) + 'px;top:' + (-PADT) + 'px;width:' + this.CW +
      'px;height:' + this.CH + 'px;pointer-events:none;z-index:4';
    host.appendChild(cv);
    this.g = cv.getContext('2d');

    var sh = this.shCv = document.createElement('canvas');
    sh.width = Math.round(this.CW * 0.5); sh.height = Math.round(this.CH * 0.5);
    this.shG = sh.getContext('2d');

    /* 撕裂前沿的白色圆点 —— 用户真正抓住的东西 */
    var knob = this.knob = document.createElement('div');
    knob.style.cssText = 'position:absolute;left:0;top:0;width:21px;height:21px;margin:-10.5px 0 0 -10.5px;' +
      'border-radius:50%;z-index:9;pointer-events:none;opacity:0;transition:opacity .3s ease;will-change:transform';
    var dot = document.createElement('div');
    dot.style.cssText = 'width:100%;height:100%;border-radius:50%;' +
      'background:radial-gradient(120% 120% at 38% 28%,#FDFDFF 0%,#EFF1F7 52%,#D7DBE8 100%);' +
      'box-shadow:0 1.5px 5px rgba(18,22,48,.22),0 0 0 .5px rgba(26,29,42,.09) inset;' +
      'will-change:transform,opacity;animation:juKnobHint 3.4s linear infinite';
    knob.appendChild(dot);
    this.dot = dot;
    host.appendChild(knob);

    var grab = this.grab = document.createElement('div');
    grab.style.cssText = 'position:absolute;left:-16px;right:-16px;top:-18px;height:' + (H + 30) +
      'px;z-index:10;touch-action:none;cursor:grab;pointer-events:none';
    host.appendChild(grab);

    this.src = srcCanvas(W, H, function (g, w, h) { o.draw(g, w, h); });

    this.nodes = [];
    for (var i = 0; i <= N; i++) this.nodes.push({ x: i * this.seg, y: 0, px: i * this.seg, py: 0 });

    grab.setAttribute('role', 'button'); grab.tabIndex = -1; grab.setAttribute('aria-label', '撕下副券');
    this.onDown = function (e) { self.down(e); };
    this.onKey = function (e) {
      if ((e.key !== 'Enter' && e.key !== ' ') || !self.enabled || self.done || e.repeat) return;
      e.preventDefault(); self.auto = true; self.rate = 2.8; self.start();
    };
    grab.addEventListener('pointerdown', this.onDown); grab.addEventListener('keydown', this.onKey);
    this.onVis = function () {
      if (document.hidden) { if (self.cancelDrag) self.cancelDrag(true); cancelAnimationFrame(self.raf); self.raf = 0; }
      else if (self.busy()) self.start();
    };
    this.onReduced = function () { self.dot.style.animation = self.reduced.matches ? 'none' : 'juKnobHint 3.4s linear infinite'; if (self.busy()) self.start(); };
    document.addEventListener('visibilitychange', this.onVis); self.reduced.addEventListener('change', this.onReduced);
    this.io = new IntersectionObserver(function (entries) { self.visible = entries[0].isIntersecting; if (!self.visible) { cancelAnimationFrame(self.raf); self.raf = 0; } else if (self.busy()) self.start(); });
    this.io.observe(host); this.onReduced();
    this.paint();
    this.ready=Promise.resolve(document.fonts?.ready).then(function(){if(!self.destroyed){self.redraw();self.canvasReady=true;}return self;});
  }

  Rig.prototype.redraw = function () {
    this.src = srcCanvas(this.W, this.H, this.o.draw);
    this.paint();
  };
  Rig.prototype.qa = function (p) {
    this.p = p;
    for (var k = 0; k < 90; k++) this.step(1 / 120);
    this.paint();
  };
  Rig.prototype.setEnabled = function (b) {
    this.enabled = b && !this.done;if(this.enabled){const r=this.host.getBoundingClientRect();this.visible=r.width>0&&r.height>0&&r.bottom>0&&r.top<innerHeight;if(this.visible&&this.busy())this.start();}
    this.grab.style.pointerEvents = this.enabled ? 'auto' : 'none';
    this.grab.tabIndex = this.enabled ? 0 : -1; this.grab.setAttribute('aria-disabled', String(!this.enabled));
    if (!this.enabled && this.cancelDrag) this.cancelDrag(true);
    this.knobPaint();
  };
  /* 抓手：随撕裂前沿右移逐渐淡出，撕断即消失 */
  Rig.prototype.knobPaint = function () {
    var o = (!this.enabled || this.done || this.dragging) ? 0 : Math.max(0, 1 - this.p * 1.05);
    this.knob.style.opacity = o.toFixed(3);
  };

  Rig.prototype.down = function (e) {
    if (!this.enabled || this.done || this.destroyed || this.dragging || e.isPrimary === false || (e.button !== undefined && e.button !== 0)) return;
    var self = this, W = this.W, id = e.pointerId;
    e.preventDefault();
    try { this.grab.setPointerCapture(id); } catch (x) {}
    this.grab.style.cursor = 'none'; this.dot.style.animation = 'none';
    this.dragging = true; this.retract = false; this.auto = false;
    var scale = this.host.getBoundingClientRect().width / (this.host.offsetWidth || W) || 1;
    var x0 = e.clientX - this.p * W * scale, last = e.clientX, lastT = performance.now();
    var mv = function (ev) {
      if (ev.pointerId !== id) return;
      var now = performance.now(), dt = Math.max(8, now - lastT);
      self.vel = (ev.clientX - last) / scale / dt * 1000; last = ev.clientX; lastT = now;
      self.p = clamp((ev.clientX - x0) / (W * scale), 0, 1);
      if (self.p >= 1) { fin(); self.detach(); }
    };
    var fin = function () {
      window.removeEventListener('pointermove', mv); window.removeEventListener('pointerup', up);
      window.removeEventListener('pointercancel', cancel); self.grab.removeEventListener('lostpointercapture', cancel); window.removeEventListener('blur', blur);
      self.cancelDrag = null; self.dragging = false;
      try { if (self.grab.hasPointerCapture(id)) self.grab.releasePointerCapture(id); } catch (x) {}
      self.grab.style.cursor = 'grab';
    };
    var release = function (cancelled) {
      fin(); if (self.done || self.destroyed) return;
      if (cancelled || self.p < SNAP) self.retract = true;
      else { self.auto = true; self.rate = 0.95 + clamp(self.vel / W, 0, 1.5); }
      self.start();
    };
    var up = function (ev) { if (ev.pointerId === id) release(false); };
    var cancel = function (ev) { if (ev.pointerId === id) release(true); };
    var blur = function () { release(true); };
    this.cancelDrag = release;
    window.addEventListener('pointermove', mv); window.addEventListener('pointerup', up);
    window.addEventListener('pointercancel', cancel); this.grab.addEventListener('lostpointercapture', cancel); window.addEventListener('blur', blur);
    this.start();
  };

  /* 最后一个连接点断开 → 小幅坠落 + 轻微角动量 */
  Rig.prototype.detach = function () {
    if (this.done || this.destroyed) return;
    if(!this.detachNotified){if(this.o.onDetach?.()===false){this.reset();this.setEnabled(true);return;}this.detachNotified=true;}this.done=true;this.p=1;this.free=true;this.falling=true;
    this.grab.style.pointerEvents = 'none';
    this.knob.style.opacity = '0';
    this.fallElapsed = 0;
    for (var i = 0; i <= N; i++) {
      var n = this.nodes[i], k = i / N;
      n.py = n.y - (0.55 + k * 0.75);
      n.px = n.x - (0.10 + k * 0.34);
    }
    if (!this._stepping) this.start();
    this.grab.tabIndex = -1; this.grab.setAttribute('aria-disabled', 'true');
  };

  Rig.prototype.reset = function () {
    if (this.cancelDrag) this.cancelDrag(true);
    cancelAnimationFrame(this.raf); this.raf = 0;
    this.notified = false; this.detachNotified=false; this.dragging = false; this.fallElapsed = 0; this.grab.style.pointerEvents=this.enabled?'auto':'none';this.knob.style.opacity='1';
    this.p = 0; this.vel = 0; this.free = false; this.falling = false;
    this.done = false; this.retract = false; this.auto = false; this.fade = 1;
    this.cv.style.opacity = '1';
    this.cv.style.display = '';
    this.dot.style.animation = this.reduced.matches ? 'none' : 'juKnobHint 3.4s linear infinite';
    for (var i = 0; i <= N; i++) {
      var n = this.nodes[i];
      n.x = n.px = i * this.seg; n.y = n.py = 0;
    }
    this.paint();
  };

  Rig.prototype.destroy = function () {
    if (this.destroyed) return; this.destroyed = true; if (this.cancelDrag) this.cancelDrag(true);
    cancelAnimationFrame(this.raf); this.raf = 0; this.io.disconnect();
    document.removeEventListener('visibilitychange', this.onVis); this.reduced.removeEventListener('change', this.onReduced);
    this.grab.removeEventListener('pointerdown', this.onDown); this.grab.removeEventListener('keydown', this.onKey);
    [this.cv, this.knob, this.grab].forEach(function (el) { el.remove(); });
    if (this.host.__jurig === this) delete this.host.__jurig;
  };

  Rig.prototype.start = function () {
    if (this.raf || this.destroyed || !this.visible || document.hidden) return;
    var self = this;
    this.last = performance.now();
    var loop = function (now) {
      self.raf = 0;
      if (self.destroyed || !self.visible || document.hidden) return;
      var dt = clamp((now - self.last) / 1000, 0, 0.034); self.last = now;
      self._stepping = true;
      if (self.reduced.matches && self.auto) { self.auto = false; self.detach(); }
      if (self.reduced.matches && self.retract) { self.p = 0; self.retract = false; }
      if (self.retract) { self.p = Math.max(0, self.p - dt * 2.6); if (self.p <= 0.0001) { self.p = 0; self.retract = false; } }
      if (self.auto) { self.p = Math.min(1, self.p + dt * self.rate); if (self.p >= 1) { self.auto = false; self.detach(); } }
      self._stepping = false;
      var sub = Math.max(1, Math.ceil(dt / 0.0084)), h = dt / sub;
      for (var k = 0; k < sub; k++) self.step(h);
      if (self.falling) {
        self.fallElapsed += dt * 1000;
        var el = self.reduced.matches ? 1081 : self.fallElapsed;
        self.fade = el < 620 ? 1 : clamp(1 - (el - 620) / 380, 0, 1);
        self.cv.style.opacity = self.fade.toFixed(3);
        if (el > 1080) { self.falling = false; self.cv.style.display = 'none'; }
      }
      self.paint();
      // 断完、落完就收工：verlet 节点的微抖不值得再占一条 rAF
      if (self.done && !self.falling) {
        self.raf = 0;
        if (!self.notified && !self.destroyed) { self.notified = true; if (self.o.onDone) self.o.onDone(); }
        return;
      }
      if (self.busy()) self.raf = requestAnimationFrame(loop);
    };
    this.raf = requestAnimationFrame(loop);
  };

  Rig.prototype.busy = function () {
    if (this.dragging || this.retract || this.auto || this.falling) return true;
    var e = 0;
    for (var i = 0; i <= N; i++) {
      var n = this.nodes[i];
      e += Math.abs(n.x - n.px) + Math.abs(n.y - n.py);
    }
    return e > 0.05;
  };

  Rig.prototype.step = function (dt) {
    var ns = this.nodes, front = this.p * this.W, seg = this.seg, i, n;
    var gy = GRAV * dt * dt;
    for (i = 0; i <= N; i++) {
      n = ns[i];
      var vx = (n.x - n.px) * DAMP, vy = (n.y - n.py) * DAMP;
      n.px = n.x; n.py = n.y;
      n.x += vx; n.y += vy + gy;
    }
    for (var it = 0; it < ITER; it++) {
      for (i = 0; i < N; i++) {                       // 纸不可拉伸
        var a = ns[i], b = ns[i + 1];
        var dx = b.x - a.x, dy = b.y - a.y, d = Math.sqrt(dx * dx + dy * dy) || 1e-4;
        var f = (d - seg) / d * 0.5;
        a.x += dx * f; a.y += dy * f; b.x -= dx * f; b.y -= dy * f;
      }
      for (i = 1; i < N; i++) {                       // 弯曲刚度：连续弧线，不是布
        var p0 = ns[i - 1], p1 = ns[i], p2 = ns[i + 1];
        p1.x += ((p0.x + p2.x) * 0.5 - p1.x) * BEND;
        p1.y += ((p0.y + p2.y) * 0.5 - p1.y) * BEND;
      }
      if (!this.free) {                               // 未撕段仍挂在齿孔上
        for (i = 0; i <= N; i++) {
          var rx = i * seg, over = rx - front;
          if (over < 0) continue;
          var k = 0.28 + 0.72 * Math.min(1, over / 30);
          n = ns[i];
          n.x += (rx - n.x) * k; n.y += (0 - n.y) * k;
        }
      }
    }
    this.stiffen(front);
  };

  /* 纸的挺度：从仍连着的一侧往外，限制每段的转角 —— 纸会垂，但不会像布一样折下去 */
  Rig.prototype.stiffen = function (front) {
    var ns = this.nodes, seg = this.seg;
    var start = this.free ? N : Math.min(N, Math.ceil(front / seg));
    var dx = -1, dy = 0;
    for (var k = start; k > 0; k--) {
      var a = ns[k], b = ns[k - 1];
      var vx = b.x - a.x, vy = b.y - a.y;
      var len = Math.sqrt(vx * vx + vy * vy) || 1e-4;
      vx /= len; vy /= len;
      var ang = Math.atan2(dx * vy - dy * vx, dx * vx + dy * vy);
      if (ang > MAXA || ang < -MAXA) {
        var cl = ang > 0 ? MAXA : -MAXA, c = Math.cos(cl), s = Math.sin(cl);
        vx = dx * c - dy * s; vy = dx * s + dy * c;
        b.x = a.x + vx * seg; b.y = a.y + vy * seg;
      }
      dx = vx; dy = vy;
    }
  };

  Rig.prototype.frontPoint = function () {
    var t = clamp(this.p, 0, 1) * N, i = clamp(Math.floor(t), 0, N - 1), f = t - i;
    var a = this.nodes[i], b = this.nodes[i + 1];
    return { x: a.x + (b.x - a.x) * f, y: a.y + (b.y - a.y) * f };
  };

  Rig.prototype.paint = function () {
    var g = this.g, W = this.W, H = this.H, ns = this.nodes, seg = this.seg, i;
    var front = this.p * W, ox = PADX, oy = PADT;
    g.setTransform(DPR, 0, 0, DPR, 0, 0);
    g.clearRect(0, 0, this.CW, this.CH);

    /* 1 · 垂下来的纸在背景上投的软影 */
    var sg = this.shG, s = 0.5;
    sg.setTransform(1, 0, 0, 1, 0, 0);
    sg.clearRect(0, 0, this.shCv.width, this.shCv.height);
    sg.fillStyle = '#0B0F1E';
    for (i = 0; i < N; i++) {
      var a = ns[i], b = ns[i + 1];
      var dx = b.x - a.x, dy = b.y - a.y, len = Math.sqrt(dx * dx + dy * dy) + 1;
      sg.save();
      sg.translate((ox + a.x) * s, (oy + a.y) * s);
      sg.rotate(Math.atan2(dy, dx));
      sg.fillRect(0, 0, len * s, H * s);
      sg.restore();
    }
    g.save();
    g.globalAlpha = 0.26;
    g.filter = 'blur(5px)';
    g.drawImage(this.shCv, 0, 8, this.CW, this.CH);
    g.restore();

    /* 2 · 撕开处露出的缝隙：票身下缘落进空腔的阴影 */
    if (front > 0.5) {
      var gr = g.createLinearGradient(0, oy, 0, oy + 9);
      gr.addColorStop(0, 'rgba(18,22,48,.24)');
      gr.addColorStop(1, 'rgba(18,22,48,0)');
      g.fillStyle = gr;
      g.fillRect(ox - 1, oy, front + 1, 9);
    }

    /* 3 · 纸面本体：逐段采样同一张源画布 → 条码与纸共用形变 */
    var sw = this.src.width / N;
    for (i = 0; i < N; i++) {
      var a2 = ns[i], b2 = ns[i + 1];
      var dx2 = b2.x - a2.x, dy2 = b2.y - a2.y;
      var len2 = Math.sqrt(dx2 * dx2 + dy2 * dy2), ang = Math.atan2(dy2, dx2);
      var ov = i < N - 1 ? 1.15 : 0;
      g.save();
      g.translate(ox + a2.x, oy + a2.y);
      g.rotate(ang);
      g.drawImage(this.src, i * sw, 0, sw + ov * DPR, this.src.height, 0, 0, seg + ov, H);
      var sh = Math.min(0.17, Math.abs(Math.sin(ang)) * 0.21);
      if (sh > 0.004) {
        g.fillStyle = 'rgba(15,19,38,' + sh.toFixed(3) + ')';
        g.fillRect(0, 0, seg + ov, H);
      }
      if (ang < -0.02) {                                   // 弯折外侧的受光
        g.fillStyle = 'rgba(255,255,255,' + Math.min(0.16, -ang * 0.2).toFixed(3) + ')';
        g.fillRect(0, 0, seg + ov, H * 0.4);
      }
      g.restore();
    }

    /* 4 · 齿孔线：未撕段一条细虚线，前沿有一点张力翘起；已撕段是票身的毛边 */
    g.save();
    g.lineWidth = 1.4;
    if (front < W - 0.5) {
      g.strokeStyle = 'rgba(26,29,42,.30)';
      g.setLineDash([3.4, 3.4]);
      g.beginPath();
      g.moveTo(ox + Math.max(0, front) + 4, oy + 0.7);
      g.lineTo(ox + W - 5, oy + 0.7);
      g.stroke();
      g.setLineDash([]);
      var tp = this.frontPoint();                          // 前沿张力：1–2px 局部翘起
      g.strokeStyle = 'rgba(26,29,42,.34)';
      g.beginPath();
      g.moveTo(ox + tp.x, oy + tp.y);
      g.quadraticCurveTo(ox + tp.x + 9, oy - 1.7, ox + Math.min(W, tp.x + 20), oy + 0.7);
      g.stroke();
    }
    if (front > 1) {
      g.strokeStyle = 'rgba(214,217,229,.95)';
      g.lineWidth = 1.6;
      g.beginPath();
      var step = 3.2;
      for (var x = 0; x <= front; x += step) {
        var yy = oy - 0.4 - ((Math.sin(x * 1.9) + Math.sin(x * 0.7 + 1.3)) * 0.5 + 0.5) * 1.5;
        if (x === 0) g.moveTo(ox + x, yy); else g.lineTo(ox + x, yy);
      }
      g.stroke();
    }
    g.restore();

    /* 5 · 白色圆点 = 撕裂前沿 */
    var fp = this.frontPoint();
    this.knob.style.transform = 'translate(' + clamp(fp.x, 9, W - 9).toFixed(1) + 'px,' + fp.y.toFixed(1) + 'px)';
    this.knobPaint();
  };

  window.JUTear = {
    rigs: {},
    mount: function (host, o) {
      var r = new Rig(host, o);
      window.JUTear.rigs[host.getAttribute('data-tear') || 'x'] = r;
      return r;
    },
    /* 副券纸面：纸底 + 网点 + 条码 + 两行小字，全部烘进同一张源画布 */
    drawStub: function (g, w, h, rightText, note) {
      var r = 14, i;
      g.save();
      g.beginPath();
      g.moveTo(0, 2.2);
      for (var x = 0; x <= w; x += 2.6) {                   // 撕口毛边
        var y = ((Math.sin(x * 1.7) + Math.sin(x * 0.63 + 2.1)) * 0.5 + 0.5) * 1.9;
        g.lineTo(x, y);
      }
      g.lineTo(w, h - r); g.quadraticCurveTo(w, h, w - r, h);
      g.lineTo(r, h); g.quadraticCurveTo(0, h, 0, h - r);
      g.closePath();
      g.clip();
      g.fillStyle = '#EDEFF7';
      g.fillRect(0, 0, w, h);
      g.fillStyle = 'rgba(26,29,42,.077)';                  // 与票身同一套网点
      for (var gy = 1; gy < h; gy += 9) for (var gx = 1; gx < w; gx += 9) {
        g.beginPath(); g.arc(gx, gy, 1, 0, 6.2832); g.fill();
      }
      g.font='400 14px "Noto Sans SC",sans-serif';g.fillStyle='#535b70';g.textBaseline='middle';g.fillText(note?'撕下，确认新时间':'撕下，联系局主',18,h/2);g.strokeStyle='#818aa5';g.lineWidth=1.4;g.beginPath();g.moveTo(w-42,h/2);g.lineTo(w-22,h/2);g.moveTo(w-28,h/2-5);g.lineTo(w-22,h/2);g.lineTo(w-28,h/2+5);g.stroke();
      g.globalAlpha = 0.05;                                 // 纸纤维
      for (i = 0; i < 420; i++) {
        g.fillStyle = i % 2 ? '#5B6178' : '#FFFFFF';
        g.fillRect(Math.random() * w, Math.random() * h, 1, 1);
      }
      g.globalAlpha = 1;
      g.restore();
    },
    tracked: function (g, s, x, y, ls, align) {
      var ch = Array.from(s), i, wsum = 0;
      for (i = 0; i < ch.length; i++) wsum += g.measureText(ch[i]).width + ls;
      wsum -= ls;
      var cx = align === 'right' ? x - wsum : align === 'center' ? x - wsum / 2 : x;
      for (i = 0; i < ch.length; i++) { g.fillText(ch[i], cx, y); cx += g.measureText(ch[i]).width + ls; }
      return wsum;
    },
  };
})();

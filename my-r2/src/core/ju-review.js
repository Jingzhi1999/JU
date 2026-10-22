/* ju-review.js (my-r2) — review mixin for every 「我的局」 R2 concept artboard (ported from settings-r2/src/core/jus-review.js;
   the settings-only parts — permissions, reminder service, email code — are gone, the 「我的局」 parts — environments, safe area,
   text zoom, 360×780, the review clock with 到最近到期 — are new).
   Gives each Component: speed / reduced-motion (panel + system prefers-reduced-motion + optional user preference) / pause / keyframe
   scrub (with the WAAPI zero-point fix and auto-replay), timers that respect speed (after / hold / holdKey / afterKey / cancelKey),
   reset, state-index jumps (JU.INDEX, 50), replay of the last core motion, demo variants (JU.VARIANTS), one-shot failure arming
   (write + copy), phone presets 360×780 / 375×812 / 390×844 / 430×932 / 适应窗口高度, keyboard (--kb 300px), safe area (--sat/--sab),
   text 115% (--tz), environments (data-skin), the clock (+5 分钟 / +1 小时 / 到最近到期 / +24 小时 / 回到演示时刻) and panelVals().
   Depends on JU.data / JU.INDEX / JU.VARIANTS / JU.now / JU.advance / JU.nextDeadline (ju-data.js) and JU.ctlInstall (ju-ctl.js). */
(function (global) {
  'use strict';
  var JU = global.JU = global.JU || {};
  JU.SKINS = [{ key: 'cotton', label: '棉糖', en: 'Cotton Candy' }, { key: 'halo', label: '光晕', en: 'Halo' }, { key: 'sunset', label: '落日', en: 'Sunset' }];
  JU.PHONES = [{ w: 360, h: 780 }, { w: 375, h: 812 }, { w: 390, h: 844 }, { w: 430, h: 932 }];
  JU.mixin = function (C) {
    var p = C.prototype;
    if (JU.ctlInstall) JU.ctlInstall(C);   /* shared behaviour controller (ju-ctl.js): navigation, surfaces, sheets, effects, index mapping */
    p.reviewInit = function (concept) {
      this.concept = concept || {}; this._timers = []; this.lastMotion = null; this.rootRef = { current: null };
      var mq = (typeof global.matchMedia === 'function') ? global.matchMedia('(prefers-reduced-motion: reduce)') : null;
      this.state = Object.assign({ review: { speed: 1, rm: false, rmSys: !!(mq && mq.matches), paused: false, scrub: null, frame: 0, pw: 390, ph: 844, fit: false, kb: false, safe: false, zoom: false, skin: 'cotton', clockTick: 0 } }, this.initialState('default'));
      var self = this; if (mq) { this._mq = mq; this._mqFn = function (ev) { self.setReview({ rmSys: !!ev.matches }); }; try { mq.addEventListener('change', this._mqFn); } catch (e) { try { mq.addListener(this._mqFn); } catch (e2) { } } }
    };
    var ownUnmount = Object.prototype.hasOwnProperty.call(p, 'componentWillUnmount') ? p.componentWillUnmount : null;
    p.componentWillUnmount = function () { this.clearTimers(); if (this._mq && this._mqFn) { try { this._mq.removeEventListener('change', this._mqFn); } catch (e) { try { this._mq.removeListener(this._mqFn); } catch (e2) { } } } if (ownUnmount) ownUnmount.call(this); };
    /* the user's own 减少动态 preference, when a concept's data carries one (none in the shared datasets today) */
    p.userRM = function () { var d = this.state && this.state.data; return !!(d && d.you && d.you.reduceMotion); };
    /* after(): an ANIMATION completion timer — scaled by speed, collapsed to 0 under reduced motion, paused with 暂停 / scrub, cleared on reset */
    p.after = function (ms, fn) {
      var self = this; var r = this.state.review || {};
      var k = (r.rm || r.rmSys || this.userRM()) ? 0 : (r.speed === 0.5 ? 2 : 1);
      var e = { fn: fn, remaining: Math.round(ms * k), id: null, due: 0 };
      var arm = function () { e.due = Date.now() + e.remaining; e.id = setTimeout(function () { self._timers = self._timers.filter(function (t) { return t !== e; }); e.fn(); }, e.remaining); };
      e.arm = arm; this._timers.push(e); if (!this._paused) arm(); return e;
    };
    /* hold(): a REAL-TIME window (toast, undo window, copy feedback, the countdown tick, 处理中) — never collapsed under reduced motion */
    p.hold = function (ms, fn) {
      var self = this; var r = this.state.review || {}; var k = r.speed === 0.5 ? 2 : 1;
      var e = { fn: fn, remaining: Math.round(ms * k), id: null, due: 0 };
      var arm = function () { e.due = Date.now() + e.remaining; e.id = setTimeout(function () { self._timers = self._timers.filter(function (t) { return t !== e; }); e.fn(); }, e.remaining); };
      e.arm = arm; this._timers.push(e); if (!this._paused) arm(); return e;
    };
    p.cancelTimer = function (e) { if (!e) return; if (e.id) clearTimeout(e.id); e.id = null; this._timers = (this._timers || []).filter(function (t) { return t !== e; }); };
    p.holdKey = function (key, ms, fn) { this._keyed = this._keyed || {}; this.cancelTimer(this._keyed[key]); var self = this; var e = this.hold(ms, function () { if (self._keyed[key] === e) delete self._keyed[key]; fn(); }); this._keyed[key] = e; return e; };
    p.afterKey = function (key, ms, fn) { this._keyed = this._keyed || {}; this.cancelTimer(this._keyed[key]); var self = this; var e = this.after(ms, function () { if (self._keyed[key] === e) delete self._keyed[key]; fn(); }); this._keyed[key] = e; return e; };
    p.cancelKey = function (key) { if (this._keyed && this._keyed[key]) { this.cancelTimer(this._keyed[key]); delete this._keyed[key]; } };
    p.clearTimers = function () { (this._timers || []).forEach(function (e) { if (e.id) clearTimeout(e.id); }); this._timers = []; this._keyed = {}; };
    p.pauseTimers = function () { if (this._paused) return; this._paused = true; (this._timers || []).forEach(function (e) { if (e.id) { clearTimeout(e.id); e.id = null; e.remaining = Math.max(0, e.due - Date.now()); } }); };
    p.resumeTimers = function () { if (!this._paused) return; this._paused = false; (this._timers || []).forEach(function (e) { if (!e.id) e.arm(); }); };
    if (!p.act) p.act = function (name, payload) { var res = JU.engine[name](this.state.data, payload || {}); this.setState({ data: res.data }); return res; };
    p.armFail = function () { this.setState(function (s) { return { data: JU.engine.setFailNext(s.data, { on: !(s.data.flags && s.data.flags.failNext) }).data }; }); };
    p.armCopyFail = function () { this.setState(function (s) { return { data: JU.engine.setCopyFailNext(s.data, { on: !(s.data.flags && s.data.flags.copyFailNext) }).data }; }); };
    p.motion = function (name, fn) { this.lastMotion = { name: name, fn: fn }; fn.call(this); };
    p.setReview = function (patch) { this.setState(function (s) { return { review: Object.assign({}, s.review, patch) }; }); };
    p.setSpeed = function (x) { this.setReview({ speed: x }); };
    p.toggleRM = function () { this.setReview({ rm: !this.state.review.rm }); };
    p.isRM = function () { var r = this.state.review || {}; return !!(r.rm || r.rmSys || this.userRM()); };
    p.setPhoneSize = function (w, h) { this.setReview({ pw: w, ph: h, fit: false }); };
    /* 适应窗口高度: the phone keeps its width and takes the browser window's height (667–932), a real reflow — nothing is scaled */
    p.fitPhone = function () { var vh = (global.innerHeight || 844) - 96; var h = Math.max(667, Math.min(932, Math.round(vh))); this.setReview({ ph: h, fit: true }); };
    p.toggleKb = function () { this.setReview({ kb: !this.state.review.kb }); };
    p.toggleSafe = function () { this.setReview({ safe: !this.state.review.safe }); };
    p.toggleZoom = function () { this.setReview({ zoom: !this.state.review.zoom }); };
    p.setSkin = function (k) { this.setReview({ skin: k }); };
    /* the clock: JU.advance moves every instance on the page (the datasets share one clock); the controller settles expiries */
    p.advanceClock = function (ms) { JU.advance(ms || 5 * 60000); if (this.settleNow) this.settleNow(); this.setReview({ clockTick: (this.state.review.clockTick || 0) + 1 }); };
    p.toNextDeadline = function () { var nd = JU.nextDeadline(this.state.data); if (nd == null) { if (this.say) this.say('没有将到期的预留或联系窗', 'info'); return; } this.advanceClock(nd - JU.now() + 1000); };
    p.resetClock = function () { JU.resetClock(); this.setReview({ clockTick: (this.state.review.clockTick || 0) + 1 }); };
    p.togglePause = function () { var on = !this.state.review.paused; if (on) this.pauseTimers(); else if (this.state.review.scrub == null) this.resumeTimers(); this.setReview({ paused: on }); };
    p.scrubTo = function (v) {
      var self = this;
      if (v == null) { this._scrubRestore(); this.resumeTimers(); this.setReview({ scrub: null, paused: false }); return; }
      if (!this._scrubS) {
        var s = this._scrubS = { seen: [], zeroed: [], replay: false };
        if (!this._movingAnims().length && this.lastMotion && !this.isRM()) {
          /* nothing is moving (the last motion has settled and its animations are gone): replay the last core motion with its own
             timers running, and freeze it the moment it is under way — the root already carries .paused, so its keyframes sit at 0 */
          s.replay = true; this.resumeTimers();
          var m = this.lastMotion; if (this.beforeReplay) this.beforeReplay(m.name);
          setTimeout(function () { if (self._scrubS !== s) return; m.fn.call(self); self._scrubWait(s, Date.now()); }, 60);
        } else this.pauseTimers();
      }
      if (!this._scrubS.replay) setTimeout(function () { self._scrubZero(0); }, 0);
      this.setReview({ scrub: +v, paused: true });
    };
    p._finiteAnims = function () {
      var app = this.rootRef && this.rootRef.current; if (!app || !app.getAnimations) return [];
      return app.getAnimations({ subtree: true }).filter(function (a) { try { var t = a.effect.getComputedTiming(); return isFinite(t.endTime) && t.endTime > 0; } catch (e) { return false; } });
    };
    p._movingAnims = function () {
      return this._finiteAnims().filter(function (a) { try { var t = a.effect.getComputedTiming(); return (a.playState === 'running' || a.playState === 'paused') && a.currentTime != null && a.currentTime < t.endTime - 1; } catch (e) { return false; } });
    };
    p._scrubWait = function (s, t0) {
      var self = this;
      var step = function () {
        if (self._scrubS !== s) return;
        var nav = self.state.nav, moving = !!(nav && (nav.phase === 'in' || nav.phase === 'exit'));
        var now = Date.now(), soon = (self._timers || []).some(function (e) { return e.id && e.due - now < 260; });
        if (moving || (self._movingAnims().length && !soon) || now - t0 > 1600) { s.replay = false; self.pauseTimers(); self._scrubZero(0); return; }
        requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    };
    /* 关键帧: a concept's `.scrub` rules turn the slider into a negative animation-delay, which lands on the intended frame only when
       the animation's own current time is 0 — so once `.scrub` is on the root the mixin sets currentTime = 0 on exactly the animations
       a `.scrub` rule controls (pseudo-elements included) and 释放 puts each back. Only currentTime is written, never play()/pause(). */
    function splitSel(s) { var out = [], d = 0, cur = ''; for (var i = 0; i < s.length; i++) { var ch = s.charAt(i); if (ch === '(') d++; else if (ch === ')') d--; if (ch === ',' && d === 0) { out.push(cur.trim()); cur = ''; } else cur += ch; } if (cur.trim()) out.push(cur.trim()); return out; }
    p._scrubRules = function (app) {
      if (this._scrubSel) return this._scrubSel;
      var list = [], node = app.getRootNode ? app.getRootNode() : null, sheets = [];
      if (node && node.styleSheets) sheets = sheets.concat([].slice.call(node.styleSheets));
      if (node && node.adoptedStyleSheets) sheets = sheets.concat([].slice.call(node.adoptedStyleSheets));
      var walk = function (rules) {
        [].forEach.call(rules || [], function (r) {
          if (!r.selectorText) { if (r.cssRules) walk(r.cssRules); return; }
          if (r.selectorText.indexOf('.scrub') < 0 || !r.style) return;
          if (!(r.style.animationDelay || r.style.animationName || r.style.getPropertyValue('animation'))) return;
          splitSel(r.selectorText).forEach(function (part) { if (part.indexOf('.scrub') < 0) return; var m = /::?(before|after)$/.exec(part); list.push({ sel: m ? part.slice(0, m.index) : part, pseudo: m ? '::' + m[1] : null }); });
        });
      };
      sheets.forEach(function (sh) { try { walk(sh.cssRules); } catch (e) { } });
      return (this._scrubSel = list);
    };
    p._scrubZero = function (tries) {
      var s = this._scrubS, app = this.rootRef && this.rootRef.current, self = this;
      if (!s || !app || !app.getAnimations) return;
      if (!app.classList.contains('scrub')) { if (tries < 6) requestAnimationFrame(function () { self._scrubZero(tries + 1); }); return; }
      var rules = this._scrubRules(app); if (!rules.length) return;
      app.getAnimations({ subtree: true }).forEach(function (a) {
        if (s.seen.indexOf(a) >= 0) return; s.seen.push(a);
        var ef = a.effect, el = ef && ef.target; if (!el || !el.matches) return;
        var ps = ef.pseudoElement ? String(ef.pseudoElement).replace(/^:+/, '::') : null;
        var hit = rules.some(function (r) { if (r.pseudo !== ps) return false; try { return el.matches(r.sel); } catch (e) { return false; } });
        if (!hit) return;
        s.zeroed.push({ a: a, ct: a.currentTime });
        try { a.currentTime = 0; } catch (e) { }
      });
    };
    p._scrubRestore = function () {
      var s = this._scrubS; this._scrubS = null; if (!s) return;
      s.zeroed.forEach(function (z) { try { if (z.ct != null && z.a.effect && z.a.effect.target && z.a.effect.target.isConnected) z.a.currentTime = z.ct; } catch (e) { } });
    };
    p.reset = function (variant) { this.clearTimers(); this._paused = false; this._scrubS = null; this._pendingRestore = null; this._pendingSection = null; this._sheetTrigger = null; this._restoreFocus = null; var st = this.initialState(variant || this.state.variant || 'default'); st.jumpKey = null; this.setState(function (cur) { st.review = Object.assign({}, cur.review, { scrub: null, paused: false, kb: false }); return st; }); };
    p.loadVariant = function (key) { this.reset(key); };
    p.replay = function () { if (!this.lastMotion) return; var m = this.lastMotion; if (this.beforeReplay) this.beforeReplay(m.name); var self = this; this.after(60, function () { m.fn.call(self); }); };
    p.jumpTo = function (key) {
      var e = JU.INDEX.filter(function (x) { return x.key === key; })[0]; if (!e) return;
      this.clearTimers(); this._paused = false; this._scrubS = null; this._pendingRestore = null; this._pendingSection = null; this._sheetTrigger = null; this._restoreFocus = null;
      var st = this.initialState(e.variant || 'default'); st.jumpKey = e.key;
      this.setState(function (cur) { st.review = Object.assign({}, cur.review, { scrub: null, paused: false, kb: false }); return st; });
      var self = this; this.after(30, function () { self.applyJump(e); });
    };
    if (!p.applyJump) p.applyJump = function (e) { if (this.ctlJump) this.ctlJump(e); };
    p.panelVals = function () {
      var self = this, s = this.state, r = s.review;
      var groups = []; var byGroup = {};
      JU.INDEX.forEach(function (e) {
        var g = byGroup[e.group]; if (!g) { g = byGroup[e.group] = { title: e.group, items: [] }; groups.push(g); }
        var active = s.jumpKey === e.key;
        g.items.push({ key: e.key, label: e.label, cls: active ? 'on' : '', go: function () { self.jumpTo(e.key); } });
      });
      var k = (r.rm || r.rmSys || this.userRM()) ? 0.001 : (r.speed === 0.5 ? 2 : 1);
      var clockMin = Math.round((JU.now() - JU.NOW) / 60000); var nd = s.data ? JU.nextDeadline(s.data) : null;
      var sizes = JU.PHONES.map(function (ph) { return { key: ph.w + 'x' + ph.h, label: ph.w + '×' + ph.h, cls: (!r.fit && r.pw === ph.w && r.ph === ph.h) ? 'on' : '', go: function () { self.setPhoneSize(ph.w, ph.h); } }; });
      return {
        code: this.concept.code, name: this.concept.name, line: this.concept.line, notes: this.concept.notes, motions: this.concept.motions || [],
        groups: groups,
        variants: JU.VARIANTS.map(function (v) { return { key: v.key, label: v.label, cls: (s.variant || 'default') === v.key ? 'on' : '', go: function () { self.loadVariant(v.key); } }; }),
        skins: JU.SKINS.map(function (v) { return { key: v.key, label: v.label + ' ' + v.en, cls: (r.skin || 'cotton') === v.key ? 'on' : '', go: function () { self.setSkin(v.key); } }; }),
        sizes: sizes,
        speed1: r.speed === 1 ? 'on' : '', speedHalf: r.speed === 0.5 ? 'on' : '', rmOn: r.rm ? 'on' : '', pausedOn: r.paused ? 'on' : '',
        setSpeed1: function () { self.setSpeed(1); }, setSpeedHalf: function () { self.setSpeed(0.5); },
        toggleRM: function () { self.toggleRM(); }, togglePause: function () { self.togglePause(); },
        reset: function () { self.reset(); }, replay: function () { self.replay(); }, hasReplay: !!this.lastMotion, replayCls: this.lastMotion ? '' : 'off',
        armFail: function () { self.armFail(); }, failArmed: !!(s.data && s.data.flags && s.data.flags.failNext) ? 'on' : '',
        armCopyFail: function () { self.armCopyFail(); }, copyFailArmed: !!(s.data && s.data.flags && s.data.flags.copyFailNext) ? 'on' : '',
        scrub: r.scrub == null ? 0 : r.scrub, scrubbing: r.scrub != null,
        onScrub: function (ev) { self.scrubTo(ev.target.value); }, endScrub: function () { self.scrubTo(null); },
        k: k, frame: r.scrub == null ? 0 : r.scrub / 100,
        rootCls: ((r.rm || r.rmSys || this.userRM()) ? ' rm' : '') + (r.rmSys ? ' rm-sys' : '') + (r.paused ? ' paused' : '') + (r.scrub != null ? ' scrub' : ''),
        phoneStyle: '--pw:' + r.pw + 'px;--ph:' + r.ph + 'px;--kb:' + (r.kb ? '300px' : '0px') + ';--sat:' + (r.safe ? '47px' : '0px') + ';--sab:' + (r.safe ? '34px' : '0px') + ';--tz:' + (r.zoom ? '1.15' : '1'),
        phoneCls: (r.kb ? ' kb' : '') + (r.safe ? ' safe' : '') + (r.zoom ? ' zoom' : ''),
        wFit: r.fit ? 'on' : '', setFit: function () { self.fitPhone(); }, fitLabel: r.fit ? '（' + r.pw + '×' + r.ph + '）' : '',
        kbOn: r.kb ? 'on' : '', toggleKb: function () { self.toggleKb(); }, safeOn: r.safe ? 'on' : '', toggleSafe: function () { self.toggleSafe(); }, zoomOn: r.zoom ? 'on' : '', toggleZoom: function () { self.toggleZoom(); },
        rmSysLine: r.rmSys ? '系统 prefers-reduced-motion：开（已生效）' : '系统 prefers-reduced-motion：关',
        clockLine: '当前演示时间 ' + JU.fmt.nowText() + '（偏移 ' + (clockMin >= 0 ? '+' : '') + clockMin + ' 分钟）', clockNote: '演示日期 2026-12-17，不冒充实时 · 真实走时 + 面板偏移', nextLine: nd ? '最近到期：' + JU.fmt.abs(nd) + '（' + JU.fmt.leftShort(nd - JU.now()) + '后）' : '没有将到期的项',
        advance5: function () { self.advanceClock(5 * 60000); }, advance60: function () { self.advanceClock(60 * 60000); }, advanceNext: function () { self.toNextDeadline(); }, advance24: function () { self.advanceClock(24 * 3600000); }, resetClock: function () { self.resetClock(); }, hasNext: nd != null, nextCls: nd != null ? '' : 'off'
      };
    };
  };
})(typeof window !== 'undefined' ? window : this);

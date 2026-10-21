/* jus-review.js (R2) — review mixin for every 「设置」 R2 concept artboard.
   R2 additions: system prefers-reduced-motion (matchMedia) joins the panel switch and the user preference; phone size presets
   375×812 / 390×844 / 430×932 (real reflow — NO scaling helper exists any more); keyboard simulation (--kb inset on .ju-phone);
   advancing clock controls (JUS.advance) and a code-expiry shortcut for the review index.
   Gives each Component: speed / reduced-motion / pause / keyframe scrub, timers that respect speed (after / hold / holdKey),
   reset, state-index jumps (JUS.INDEX), replay of the last core motion, demo variants (JUS.VARIANTS), one-shot failure arming,
   system-permission and reminder-service simulation (JUS.engine.simPermission / simService), and the review panel's renderVals.
   Depends on JUS.data(variant), JUS.INDEX, JUS.VARIANTS, JUS.PERMISSIONS from jus-data.js (same bundle). */
(function (global) {
  'use strict';
  var JUS = global.JUS = global.JUS || {};
  JUS.mixin = function (C) {
    var p = C.prototype;
    p.reviewInit = function (concept) {
      this.concept = concept; this._timers = []; this.lastMotion = null; this.rootRef = { current: null };
      var mq = (typeof global.matchMedia === 'function') ? global.matchMedia('(prefers-reduced-motion: reduce)') : null;
      this.state = Object.assign({ review: { speed: 1, rm: false, rmSys: !!(mq && mq.matches), paused: false, scrub: null, frame: 0, pw: 390, ph: 844, kb: false } }, this.initialState('default'));
      var self = this; if (mq) { this._mq = mq; this._mqFn = function (ev) { self.setReview({ rmSys: !!ev.matches }); }; try { mq.addEventListener('change', this._mqFn); } catch (e) { try { mq.addListener(this._mqFn); } catch (e2) {} } }
      /* persistence: one namespaced key per concept (jus:<CODE>:v1); previews / compare mounts pass persist:false */
      this.persist = this.props.persist !== false && !!concept.code;
      if (this.persist) { var saved = JUS.store.load(concept.code); if (saved && saved.schema === JUS.SCHEMA && saved.data) { this.state.data = saved.data; this.state.variant = saved.data.variant || 'default'; } }
    };
    p.persistNow = function (data) { if (this.persist) JUS.store.save(this.concept.code, { schema: JUS.SCHEMA, data: data, at: Date.now() }); };
    var ownUnmount = Object.prototype.hasOwnProperty.call(p, 'componentWillUnmount') ? p.componentWillUnmount : null;
    p.componentWillUnmount = function () { this.clearTimers(); if (this._mq && this._mqFn) { try { this._mq.removeEventListener('change', this._mqFn); } catch (e) { try { this._mq.removeListener(this._mqFn); } catch (e2) {} } } if (ownUnmount) ownUnmount.call(this); };
    /* R2: there is deliberately NO fitWidth / scale helper. Concepts must reflow at 375 / 390 / 430 (see concept-contract.md §3). */
    /* after(): an ANIMATION completion timer — scaled by speed, collapsed to 0 under reduced motion, paused with 暂停 / scrub, cleared on reset */
    p.after = function (ms, fn) {
      var self = this; var r = this.state.review || {}; var d = this.state.data; var userRm = !!(d && d.appearance && d.appearance.reduceMotion);
      var k = (r.rm || r.rmSys || userRm) ? 0 : (r.speed === 0.5 ? 2 : 1); /* 面板减少动态 / 系统 prefers-reduced-motion / 用户偏好 三者任一都把动画完成计时器归零 */
      var e = { fn: fn, remaining: Math.round(ms * k), id: null, due: 0 };
      var arm = function () { e.due = Date.now() + e.remaining; e.id = setTimeout(function () { self._timers = self._timers.filter(function (t) { return t !== e; }); e.fn(); }, e.remaining); };
      e.arm = arm; this._timers.push(e); if (!this._paused) arm(); return e;
    };
    /* hold(): a REAL-TIME window (toast, undo window, copy feedback) — never collapsed under reduced motion */
    p.hold = function (ms, fn) {
      var self = this; var r = this.state.review || {}; var k = r.speed === 0.5 ? 2 : 1;
      var e = { fn: fn, remaining: Math.round(ms * k), id: null, due: 0 };
      var arm = function () { e.due = Date.now() + e.remaining; e.id = setTimeout(function () { self._timers = self._timers.filter(function (t) { return t !== e; }); e.fn(); }, e.remaining); };
      e.arm = arm; this._timers.push(e); if (!this._paused) arm(); return e;
    };
    p.cancelTimer = function (e) { if (!e) return; if (e.id) clearTimeout(e.id); e.id = null; this._timers = (this._timers || []).filter(function (t) { return t !== e; }); };
    p.holdKey = function (key, ms, fn) { this._keyed = this._keyed || {}; this.cancelTimer(this._keyed[key]); var self = this; var e = this.hold(ms, function () { if (self._keyed[key] === e) delete self._keyed[key]; fn(); }); this._keyed[key] = e; return e; };
    p.cancelKey = function (key) { if (this._keyed && this._keyed[key]) { this.cancelTimer(this._keyed[key]); delete this._keyed[key]; } };
    p.afterKey = function (key, ms, fn) { this._keyed = this._keyed || {}; this.cancelTimer(this._keyed[key]); var self = this; var e = this.after(ms, function () { if (self._keyed[key] === e) delete self._keyed[key]; fn(); }); this._keyed[key] = e; return e; };
    p.clearTimers = function () { (this._timers || []).forEach(function (e) { if (e.id) clearTimeout(e.id); }); this._timers = []; this._keyed = {}; };
    p.pauseTimers = function () { if (this._paused) return; this._paused = true; (this._timers || []).forEach(function (e) { if (e.id) { clearTimeout(e.id); e.id = null; e.remaining = Math.max(0, e.due - Date.now()); } }); };
    p.resumeTimers = function () { if (!this._paused) return; this._paused = false; (this._timers || []).forEach(function (e) { if (!e.id) e.arm(); }); };
    /* engine helper: run an action, store the new data, return the result (concepts turn result.effect into motion) */
    p.act = function (name, payload) { var res = JUS.engine[name](this.state.data, payload || {}); this.setState({ data: res.data }); if (res.effect && res.effect.type !== 'error' && res.effect.type !== 'invalid') this.persistNow(res.data); return res; };
    p.armFail = function () { this.setState(function (s) { return { data: JUS.engine.setFailNext(s.data, { on: !(s.data.flags && s.data.flags.failNext) }).data }; }); };
    p.simPermission = function (v) { this.setState(function (s) { return { data: JUS.engine.simPermission(s.data, { value: v }).data }; }); };
    p.simService = function () { this.setState(function (s) { return { data: JUS.engine.simService(s.data, { on: !s.data.notify.serviceConnected }).data }; }); };
    p.armCopyFail = function () { this.setState(function (s) { return { data: JUS.engine.setCopyFailNext(s.data, { on: !(s.data.flags && s.data.flags.copyFailNext) }).data }; }); };
    p.setAnswer = function (v) { this.setState(function (s) { return { data: JUS.engine.setPermissionAnswer(s.data, { value: v }).data }; }); };
    p.motion = function (name, fn) { this.lastMotion = { name: name, fn: fn }; fn.call(this); };
    p.setReview = function (patch) { this.setState(function (s) { return { review: Object.assign({}, s.review, patch) }; }); };
    p.setSpeed = function (x) { this.setReview({ speed: x }); };
    p.toggleRM = function () { this.setReview({ rm: !this.state.review.rm }); };
    p.isRM = function () { var r = this.state.review || {}; var d = this.state.data; return !!(r.rm || r.rmSys || (d && d.appearance && d.appearance.reduceMotion)); };
    p.setPhoneSize = function (w, h) { this.setReview({ pw: w, ph: h }); };
    p.toggleKb = function () { this.setReview({ kb: !this.state.review.kb }); };
    p.advanceClock = function (ms) { JUS.advance(ms || 5 * 60000); this.setReview({ clockTick: (this.state.review.clockTick || 0) + 1 }); };
    p.expireCode = function () { var self = this; this.setState(function (s) { return { data: JUS.engine.expireEmailCode(s.data, {}).data }; }); };
    p.togglePause = function () { var on = !this.state.review.paused; if (on) this.pauseTimers(); else if (this.state.review.scrub == null) this.resumeTimers(); this.setReview({ paused: on }); };
    p.scrubTo = function (v) { if (v == null) { this.resumeTimers(); } else { this.pauseTimers(); } this.setReview({ scrub: v == null ? null : +v, paused: v != null }); };
    p.reset = function (variant) { this.clearTimers(); this._paused = false; var r = this.state.review; var st = this.initialState(variant || this.state.variant || 'default'); st.review = Object.assign({}, r, { scrub: null, paused: false }); st.jumpKey = null; if (this.persist) JUS.store.clear(this.concept.code); this.setState(st); };
    p.loadVariant = function (key) { this.reset(key); };
    p.replay = function () { if (!this.lastMotion) return; var m = this.lastMotion; if (this.beforeReplay) this.beforeReplay(m.name); var self = this; this.after(60, function () { m.fn.call(self); }); };
    p.jumpTo = function (key) {
      var e = JUS.INDEX.filter(function (x) { return x.key === key; })[0]; if (!e) return;
      this.clearTimers(); this._paused = false;
      var st = this.initialState(e.variant || 'default');
      st.review = Object.assign({}, this.state.review, { scrub: null, paused: false });
      st.jumpKey = e.key;
      this.setState(st);
      var self = this; this.after(30, function () { self.applyJump(e); });
    };
    if (!p.applyJump) p.applyJump = function (e) { if (this.openSurface) this.openSurface(e.open); };
    p.panelVals = function () {
      var self = this, s = this.state, r = s.review;
      var groups = []; var byGroup = {};
      JUS.INDEX.forEach(function (e) {
        var g = byGroup[e.group]; if (!g) { g = byGroup[e.group] = { title: e.group, items: [] }; groups.push(g); }
        var active = s.jumpKey === e.key;
        g.items.push({ key: e.key, label: e.label, cls: active ? 'on' : '', go: function () { self.jumpTo(e.key); } });
      });
      var k = (r.rm || r.rmSys) ? 0.001 : (r.speed === 0.5 ? 2 : 1);
      var clockMin = Math.round((JUS.now() - JUS.NOW) / 60000);
      var perm = s.data && s.data.notify ? s.data.notify.permission : 'default';
      return {
        code: this.concept.code, name: this.concept.name, line: this.concept.line, notes: this.concept.notes, motions: this.concept.motions || [],
        groups: groups,
        variants: JUS.VARIANTS.map(function (v) { return { key: v.key, label: v.label, cls: (s.variant || 'default') === v.key ? 'on' : '', go: function () { self.loadVariant(v.key); } }; }),
        perms: JUS.PERMISSIONS.map(function (v) { return { key: v.key, label: v.label, cls: perm === v.key ? 'on' : '', go: function () { self.simPermission(v.key); } }; }),
        serviceOn: s.data && s.data.notify && s.data.notify.serviceConnected ? 'on' : '', toggleService: function () { self.simService(); },
        speed1: r.speed === 1 ? 'on' : '', speedHalf: r.speed === 0.5 ? 'on' : '', rmOn: r.rm ? 'on' : '', pausedOn: r.paused ? 'on' : '',
        setSpeed1: function () { self.setSpeed(1); }, setSpeedHalf: function () { self.setSpeed(0.5); },
        toggleRM: function () { self.toggleRM(); }, togglePause: function () { self.togglePause(); },
        reset: function () { self.reset(); }, replay: function () { self.replay(); }, hasReplay: !!this.lastMotion,
        armFail: function () { self.armFail(); }, failArmed: !!(s.data && s.data.flags && s.data.flags.failNext) ? 'on' : '',
        armCopyFail: function () { self.armCopyFail(); }, copyFailArmed: !!(s.data && s.data.flags && s.data.flags.copyFailNext) ? 'on' : '',
        answerGranted: (s.data && s.data.flags && s.data.flags.permissionAnswer) !== 'denied' ? 'on' : '', answerDenied: (s.data && s.data.flags && s.data.flags.permissionAnswer) === 'denied' ? 'on' : '',
        answerGrant: function () { self.setAnswer('granted'); }, answerDeny: function () { self.setAnswer('denied'); },
        codeLine: s.data && s.data.you && s.data.you.emailPending ? '本机测试验证码：' + s.data.you.emailPending.code + '（发给 ' + s.data.you.emailPending.email + '）' : '邮箱验证码：发送后显示在这里（本机测试码，不发邮件）',
        scrub: r.scrub == null ? 0 : r.scrub, scrubbing: r.scrub != null,
        onScrub: function (ev) { self.scrubTo(ev.target.value); }, endScrub: function () { self.scrubTo(null); },
        k: k, frame: r.scrub == null ? 0 : r.scrub / 100,
        rootCls: ((r.rm || r.rmSys) ? ' rm' : '') + (r.rmSys ? ' rm-sys' : '') + (r.paused ? ' paused' : '') + (r.scrub != null ? ' scrub' : ''),
        phoneStyle: '--pw:' + r.pw + 'px;--ph:' + r.ph + 'px;--kb:' + (r.kb ? '300px' : '0px'), phoneCls: r.kb ? ' kb' : '',
        w375: r.pw === 375 ? 'on' : '', w390: r.pw === 390 ? 'on' : '', w430: r.pw === 430 ? 'on' : '',
        setW375: function () { self.setPhoneSize(375, 812); }, setW390: function () { self.setPhoneSize(390, 844); }, setW430: function () { self.setPhoneSize(430, 932); },
        kbOn: r.kb ? 'on' : '', toggleKb: function () { self.toggleKb(); },
        rmSysLine: r.rmSys ? '系统 prefers-reduced-motion：开（已生效）' : '系统 prefers-reduced-motion：关',
        clockLine: '演示时钟：' + (clockMin >= 0 ? '+' : '') + clockMin + ' 分钟（真实走时 + 面板偏移）', advance5: function () { self.advanceClock(5 * 60000); }, expireCode: function () { self.expireCode(); }
      };
    };
  };
})(typeof window !== 'undefined' ? window : this);

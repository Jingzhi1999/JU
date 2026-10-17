/* jus-review.js — review mixin for every 「设置」 concept artboard (settings edition of src/core/ju-review.js).
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
      this.state = Object.assign({ review: { speed: 1, rm: false, paused: false, scrub: null, frame: 0 } }, this.initialState('default'));
    };
    p.componentWillUnmount = function () { this.clearTimers(); };
    /* after(): an ANIMATION completion timer — scaled by speed, collapsed to 0 under reduced motion, paused with 暂停 / scrub, cleared on reset */
    p.after = function (ms, fn) {
      var self = this; var r = this.state.review || {}; var k = r.rm ? 0 : (r.speed === 0.5 ? 2 : 1);
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
    p.act = function (name, payload) { var res = JUS.engine[name](this.state.data, payload || {}); this.setState({ data: res.data }); return res; };
    p.armFail = function () { this.setState(function (s) { return { data: JUS.engine.setFailNext(s.data, { on: !(s.data.flags && s.data.flags.failNext) }).data }; }); };
    p.simPermission = function (v) { this.setState(function (s) { return { data: JUS.engine.simPermission(s.data, { value: v }).data }; }); };
    p.simService = function () { this.setState(function (s) { return { data: JUS.engine.simService(s.data, { on: !s.data.notify.serviceConnected }).data }; }); };
    p.motion = function (name, fn) { this.lastMotion = { name: name, fn: fn }; fn.call(this); };
    p.setReview = function (patch) { this.setState(function (s) { return { review: Object.assign({}, s.review, patch) }; }); };
    p.setSpeed = function (x) { this.setReview({ speed: x }); };
    p.toggleRM = function () { this.setReview({ rm: !this.state.review.rm }); };
    p.togglePause = function () { var on = !this.state.review.paused; if (on) this.pauseTimers(); else if (this.state.review.scrub == null) this.resumeTimers(); this.setReview({ paused: on }); };
    p.scrubTo = function (v) { if (v == null) { this.resumeTimers(); } else { this.pauseTimers(); } this.setReview({ scrub: v == null ? null : +v, paused: v != null }); };
    p.reset = function (variant) { this.clearTimers(); this._paused = false; var r = this.state.review; var st = this.initialState(variant || this.state.variant || 'default'); st.review = Object.assign({}, r, { scrub: null, paused: false }); this.setState(st); };
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
      var k = r.rm ? 0.001 : (r.speed === 0.5 ? 2 : 1);
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
        scrub: r.scrub == null ? 0 : r.scrub, scrubbing: r.scrub != null,
        onScrub: function (ev) { self.scrubTo(ev.target.value); }, endScrub: function () { self.scrubTo(null); },
        k: k, frame: r.scrub == null ? 0 : r.scrub / 100,
        rootCls: (r.rm ? ' rm' : '') + (r.paused ? ' paused' : '') + (r.scrub != null ? ' scrub' : '')
      };
    };
  };
})(typeof window !== 'undefined' ? window : this);

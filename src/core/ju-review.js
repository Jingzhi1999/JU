/* ju-review.js — shared review mixin for every concept artboard.
   Gives each Component: speed / reduced-motion / pause / keyframe scrub, timers that respect speed,
   reset, state-index jumps, replay of the last core motion, and the review panel's renderVals.
   Depends on JU.data(variant) and JU.INDEX from ju-data.js (same bundle). */
(function (global) {
  'use strict';
  var JU = global.JU = global.JU || {};
  JU.VARIANTS = [
    { key: 'default', label: '标准示例' }, { key: 'empty', label: '完全空' }, { key: 'single', label: '只有一场' },
    { key: 'drafts', label: '只有草稿' }, { key: 'pending', label: '待处理较多' }, { key: 'many', label: '当前较多' },
    { key: 'history', label: '历史较多' }, { key: 'long', label: '长标题长地点' }
  ];
  JU.mixin = function (C) {
    var p = C.prototype;
    /* ---- lifecycle helpers ---- */
    p.reviewInit = function (concept) {
      this.concept = concept; this._timers = []; this.lastMotion = null; this.rootRef = { current: null };
      this.state = Object.assign({ review: { speed: 1, rm: false, paused: false, scrub: null, frame: 0 } }, this.initialState('default'));
    };
    p.componentWillUnmount = function () { this.clearTimers(); };
    /* timers scaled by speed; cleared on reset */
    p.after = function (ms, fn) {
      var self = this; var r = this.state.review || {}; var k = r.rm ? 0 : (r.speed === 0.5 ? 2 : 1);
      var id = setTimeout(function () { self._timers = self._timers.filter(function (t) { return t !== id; }); fn(); }, Math.round(ms * k));
      this._timers.push(id); return id;
    };
    p.clearTimers = function () { (this._timers || []).forEach(clearTimeout); this._timers = []; };
    /* run a named core motion: records it for replay */
    p.motion = function (name, fn) { this.lastMotion = { name: name, fn: fn }; fn.call(this); };
    /* ---- review actions ---- */
    p.setReview = function (patch) { this.setState(function (s) { return { review: Object.assign({}, s.review, patch) }; }); };
    p.setSpeed = function (x) { this.setReview({ speed: x }); };
    p.toggleRM = function () { this.setReview({ rm: !this.state.review.rm }); };
    p.togglePause = function () { this.setReview({ paused: !this.state.review.paused }); };
    p.scrubTo = function (v) { this.setReview({ scrub: v == null ? null : +v, paused: v != null }); };
    p.reset = function (variant) { this.clearTimers(); var r = this.state.review; var st = this.initialState(variant || this.state.variant || 'default'); st.review = Object.assign({}, r, { scrub: null, paused: false }); this.setState(st); };
    p.loadVariant = function (key) { this.reset(key); };
    p.replay = function () { if (!this.lastMotion) return; var m = this.lastMotion; if (this.beforeReplay) this.beforeReplay(m.name); var self = this; this.after(60, function () { m.fn.call(self); }); };
    p.jumpTo = function (key) {
      var e = JU.INDEX.filter(function (x) { return x.key === key; })[0]; if (!e) return;
      this.clearTimers();
      var st = this.initialState(e.variant || 'default');
      st.role = e.role || 'joined'; st.section = e.section || 'current';
      st.review = Object.assign({}, this.state.review, { scrub: null, paused: false });
      this.setState(st);
      if (e.open) { var self = this; this.after(30, function () { self.applyJump(e); }); }
    };
    /* default jump: concepts override applyJump(entry) to open the right surface in their own view model */
    if (!p.applyJump) p.applyJump = function (e) { if (this.openSurface) this.openSurface(e.open); };
    /* ---- panel renderVals ---- */
    p.panelVals = function () {
      var self = this, s = this.state, r = s.review;
      var groups = []; var byGroup = {};
      JU.INDEX.forEach(function (e) {
        var g = byGroup[e.group]; if (!g) { g = byGroup[e.group] = { title: e.group, items: [] }; groups.push(g); }
        var active = (s.role === (e.role || 'joined')) && (s.section === (e.section || 'current')) && ((s.variant || 'default') === (e.variant || 'default')) && (!e.open ? !s.view || s.view.name === 'list' : (s.view && s.view.jumpKey === e.key));
        g.items.push({ key: e.key, label: e.label, cls: active ? 'on' : '', go: function () { self.jumpTo(e.key); } });
      });
      var k = r.rm ? 0.001 : (r.speed === 0.5 ? 2 : 1);
      return {
        code: this.concept.code, name: this.concept.name, line: this.concept.line, notes: this.concept.notes, motions: this.concept.motions || [],
        groups: groups,
        variants: JU.VARIANTS.map(function (v) { return { key: v.key, label: v.label, cls: (s.variant || 'default') === v.key ? 'on' : '', go: function () { self.loadVariant(v.key); } }; }),
        speed1: r.speed === 1 ? 'on' : '', speedHalf: r.speed === 0.5 ? 'on' : '', rmOn: r.rm ? 'on' : '', pausedOn: r.paused ? 'on' : '',
        setSpeed1: function () { self.setSpeed(1); }, setSpeedHalf: function () { self.setSpeed(0.5); },
        toggleRM: function () { self.toggleRM(); }, togglePause: function () { self.togglePause(); },
        reset: function () { self.reset(); }, replay: function () { self.replay(); }, hasReplay: !!this.lastMotion,
        scrub: r.scrub == null ? 0 : r.scrub, scrubbing: r.scrub != null,
        onScrub: function (ev) { self.scrubTo(ev.target.value); }, endScrub: function () { self.scrubTo(null); },
        k: k, frame: r.scrub == null ? 0 : r.scrub / 100,
        rootCls: (r.rm ? ' rm' : '') + (r.paused ? ' paused' : '') + (r.scrub != null ? ' scrub' : '')
      };
    };
  };
})(typeof window !== 'undefined' ? window : this);

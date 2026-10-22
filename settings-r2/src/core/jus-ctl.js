/* jus-ctl.js (R2) — the shared BEHAVIOUR controller for every 「设置」 R2 concept (S01–S10). No markup, no styles:
   each concept renders this.ctlVals() with its own composition, type, surfaces and motion.

   Provides (installed by JUS.mixin automatically):
     navigation   this.go(surface, params, ev) / back() / home() / replace(surface, params, ev) / root('settings'|'find'|'mine')
                  stack entries remember the origin rect (ev.currentTarget.closest('[data-origin]')) and each surface's scroll
                  position (elements marked data-scroller="name"); phases enter → in → idle (fwd) and exit → idle (back).
     header       onScroll on any [data-scroller] writes --hc (0..1, collapse progress over this.headerRange px, default 96) on the
                  scroller and on its [data-surface] ancestor — concepts interpolate 30px → 18px with calc(); no re-render per frame.
     feedback     this.say(text, kind) toast (real-time window 2600ms); confirm sheets (unsaved / account-end); simulated system prompt.
     profile      pf: draft → validation (V27 rules) → email code (send / wrong / resend countdown 59s / expiry by the advancing clock /
                  verify) → save (pending ≥ saveMs, fail keeps input, retry) → success returns to the previous surface; unsaved guard.
     text forms   form: record supplement / dispute / appeal, report supplement, feedback, seam report — drafts keyed per object,
                  local file names (File.name / size only, never uploaded), pending → fail/retry → done.
     settings     notify (prefs / permission / service), skin (preview / apply / cancel + reduce motion), city (search / pick),
                  fav (remove with 4s undo that restores the original position), favDetail, recs / rec, reps / rep, help, privacy,
                  about, acct (demo session end / restart), copy (real clipboard result).
     seams        feed (入局 01 list with the V27 swipe gesture: right > 82px adds, left < −82px removes, wrong direction damped ×0.26,
                  6px dead zone, axis ratio 1.25, clamp 190px, rotate dx×0.012°), feedDetail, mine (我的局 rows + report entry).
     index        ctlJump(e): builds the stack for every JUS.INDEX entry (so 返回 works from any jumped state) and seeds the state.
   Concepts may override: this.motionSpec = { fwd, back, root, swap } (ms), this.headerRange, this.saveMs, this.paths (surface → stack),
   onProfileSaved(effect), onFormDone(kind, id, effect), and may call this.ctlJump(e) from their own applyJump. */
(function (global) {
  'use strict';
  var JUS = global.JUS = global.JUS || {};
  var SURFACES = ['home', 'profile', 'profile-edit', 'favorites', 'favorite-detail', 'city', 'notify', 'appearance', 'records', 'record-detail',
    'record-supplement', 'record-dispute', 'record-appeal', 'reports', 'report-detail', 'report-supplement', 'help', 'feedback', 'privacy',
    'account', 'about', 'rules', 'seam-feed', 'seam-feed-detail', 'seam-mine', 'seam-report'];
  JUS.SURFACES = SURFACES;
  var ROOTS = { settings: 'home', find: 'seam-feed', mine: 'seam-mine' };
  var DEFAULT_PATHS = {
    'home': ['home'], 'profile': ['home', 'profile'], 'profile-edit': ['home', 'profile', 'profile-edit'],
    'favorites': ['home', 'favorites'], 'favorite-detail': ['home', 'favorites', 'favorite-detail'],
    'city': ['home', 'city'], 'notify': ['home', 'notify'], 'appearance': ['home', 'appearance'],
    'records': ['home', 'records'], 'record-detail': ['home', 'records', 'record-detail'],
    'record-supplement': ['home', 'records', 'record-detail', 'record-supplement'], 'record-dispute': ['home', 'records', 'record-detail', 'record-dispute'],
    'record-appeal': ['home', 'records', 'record-detail', 'record-appeal'],
    'reports': ['home', 'reports'], 'report-detail': ['home', 'reports', 'report-detail'], 'report-supplement': ['home', 'reports', 'report-detail', 'report-supplement'],
    'help': ['home', 'help'], 'feedback': ['home', 'help', 'feedback'], 'privacy': ['home', 'privacy'], 'account': ['home', 'account'],
    'about': ['home', 'about'], 'rules': ['home', 'about', 'rules'],
    'seam-feed': ['seam-feed'], 'seam-feed-detail': ['seam-feed', 'seam-feed-detail'], 'seam-mine': ['seam-mine'], 'seam-report': ['seam-mine', 'seam-report']
  };
  JUS.CTL_PATHS = DEFAULT_PATHS;
  var FORM = {
    supplement: { action: 'addSupplement', idKey: 'recordId', files: true, min: 4, title: '补充这条记录', label: '补充说明', placeholder: '写清时间、经过与你知道的事实（至少 4 个字）', submit: '保存补充', ok: '补充已保存在本机', fail: '补充未保存，内容已保留，请重试。' },
    dispute: { action: 'fileDispute', idKey: 'recordId', files: true, min: 4, title: '对出席记录提出异议', label: '异议说明', placeholder: '例如：我当天到场了，和局主在门口碰过面（至少 4 个字）', submit: '提出异议', ok: '异议已提出 · 待核实（本机）', fail: '异议未保存，内容已保留，请重试。' },
    appeal: { action: 'fileAppeal', idKey: 'recordId', files: true, min: 4, title: '补充与申诉', label: '补充事实或申诉说明', placeholder: '说明当时的情况（至少 4 个字）', submit: '保存说明', ok: null, fail: null },
    rsupp: { action: 'supplementReport', idKey: 'reportId', files: true, min: 1, title: '补充材料', label: '补充材料', placeholder: '补充相关细节', submit: '提交补充', ok: '补充已提交 · 处理中', fail: null },
    feedback: { action: 'submitFeedback', idKey: null, files: false, min: 4, title: '产品反馈', label: '想对 JU 说的话', placeholder: '哪里不好用、希望加什么（至少 4 个字）', submit: '提交反馈', ok: '反馈已提交（本机保存）', fail: '反馈未提交，内容已保留，请重试。' },
    report: { action: 'fileReport', idKey: 'eventId', files: true, min: 4, title: '举报', label: '发生了什么', placeholder: '写清时间、经过与具体事实（至少 4 个字）', submit: '提交举报', ok: '举报已提交 · 等待平台受理（本机）', fail: '举报未提交，内容已保留，请重试。' }
  };
  JUS.CTL_FORMS = FORM;
  var SURFACE_FORM = { 'record-supplement': 'supplement', 'record-dispute': 'dispute', 'record-appeal': 'appeal', 'report-supplement': 'rsupp', 'feedback': 'feedback', 'seam-report': 'report' };
  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
  function assign() { var o = {}; for (var i = 0; i < arguments.length; i++) { var a = arguments[i]; if (a) for (var k in a) if (Object.prototype.hasOwnProperty.call(a, k)) o[k] = a[k]; } return o; }
  function graphemes(v) { try { if (global.Intl && Intl.Segmenter) { var n = 0; var it = new Intl.Segmenter('zh', { granularity: 'grapheme' }).segment(v || ''); for (var x of it) n++; return n; } } catch (e) { } return Array.from(v || '').length; }

  JUS.ctlState = function () {
    return {
      nav: { stack: [{ s: 'home', p: {}, from: null, key: null, id: 1 }], phase: 'idle', dir: 'fwd', seq: 1, leaving: null },
      pf: null, tf: {}, sheet: null, toast: null,
      ui: { skinPreview: null, cityQ: '', feedFilter: 'all', dx: {}, drag: null, feedHint: null, sys: false, copyFail: null, undo: null, lastSaved: null, flash: null }
    };
  };
  var baseState = JUS.baseState;
  JUS.baseState = function (variant) { return assign(baseState(variant), JUS.ctlState()); };

  JUS.ctlInstall = function (C) {
    var p = C.prototype;
    p.navMs = function (dir) { var m = this.motionSpec || {}; return dir === 'back' ? (m.back || 280) : dir === 'root' ? (m.root || 300) : dir === 'swap' ? (m.swap || 280) : (m.fwd || 320); };
    p._top = function () { var st = this.state.nav.stack; return st[st.length - 1]; };
    p._captureScroll = function () {
      var root = this.rootRef && this.rootRef.current; if (!root || !this.state.nav) return;
      var memo = {}; root.querySelectorAll('[data-scroller]').forEach(function (el) { memo[el.getAttribute('data-scroller')] = el.scrollTop; });
      (this._scrollMemo = this._scrollMemo || {})[this._top().id] = memo;
    };
    p._originOf = function (ev, s) {
      var root = this.rootRef && this.rootRef.current; if (!ev || !root || !global.JU || !JU.fx) return { from: null, key: null };
      var t = ev.currentTarget || ev.target; var el = t && t.closest ? (t.closest('[data-origin]') || t) : null;
      /* 重播 re-runs a motion with its original event: by then currentTarget is null and the tapped element may have been
         re-rendered, so fall back to the element that currently marks this surface as its origin (only when an event was given;
         programmatic navigation without an event keeps from = null as before) */
      if ((!el || !el.isConnected || !root.contains(el)) && s) el = root.querySelector('[data-origin="' + s + '"]');
      if (!el) return { from: null, key: null };
      return { from: JU.fx.rectIn(el, root), key: el.getAttribute ? el.getAttribute('data-origin') : null };
    };
    /* finish any running transition immediately (used when a new navigation interrupts the current one) */
    p._navSettle = function () {
      var nav = this.state.nav; this.cancelKey('nav');
      if (nav.phase === 'exit') { var stack = nav.stack.slice(0, -1); this._pendingRestore = stack[stack.length - 1].id; nav = { stack: stack, phase: 'idle', dir: 'back', seq: nav.seq, leaving: null }; }
      else nav = assign(nav, { phase: 'idle', leaving: null });
      this.state.nav = nav; /* synchronous settle so the next push builds on the settled stack */
      return nav;
    };
    p._runPhases = function (dir) {
      var self = this;
      this.afterKey('nav', 20, function () {
        var r = self.rootRef && self.rootRef.current; if (r) void r.offsetHeight;
        self.setState(function (st) { return { nav: assign(st.nav, { phase: 'in' }) }; });
        self.afterKey('nav', self.navMs(dir), function () { self.setState(function (st) { return { nav: assign(st.nav, { phase: 'idle', leaving: null }) }; }); });
      });
    };
    p.go = function (s, params, ev) {
      var nav = this.state.nav; if (!nav) return;
      if (nav.phase !== 'idle') nav = this._navSettle();
      var o = this._originOf(ev, s); this._captureScroll();
      var id = (nav.seq || 1) + 1; var entry = { s: s, p: params || {}, from: o.from, key: o.key, id: id };
      var patch = { nav: { stack: nav.stack.concat([entry]), phase: 'enter', dir: 'fwd', seq: id, leaving: null }, sheet: null };
      patch = assign(patch, this._enterPatch(s, entry.p));
      this.setState(patch); this._runPhases('fwd');
      if (this.onNav) this.onNav('go', s, entry.p);
    };
    p.replace = function (s, params, ev) {
      var nav = this.state.nav; if (!nav) return;
      if (nav.phase !== 'idle') nav = this._navSettle();
      var top = nav.stack[nav.stack.length - 1]; if (top.s === s && JSON.stringify(top.p) === JSON.stringify(params || {})) return;
      var o = this._originOf(ev, s); this._captureScroll(); this._leavePatchApply(top.s);
      var id = (nav.seq || 1) + 1; var entry = { s: s, p: params || {}, from: o.from, key: o.key, id: id };
      var patch = { nav: { stack: nav.stack.slice(0, -1).concat([entry]), phase: 'enter', dir: 'swap', seq: id, leaving: top.s !== s ? top : null }, sheet: null };
      patch = assign(patch, this._enterPatch(s, entry.p));
      this.setState(patch); this._runPhases('swap');
      if (this.onNav) this.onNav('replace', s, entry.p);
    };
    p.root = function (key) {
      var s = ROOTS[key] || key; var nav = this.state.nav; if (!nav) return;
      if (nav.phase !== 'idle') nav = this._navSettle();
      var top = nav.stack[nav.stack.length - 1];
      if (nav.stack.length === 1 && top.s === s) { var sc = this.rootRef.current && this.rootRef.current.querySelector('[data-scroller="' + s + '"]'); if (sc) sc.scrollTo({ top: 0, behavior: this.isRM() ? 'auto' : 'smooth' }); return; }
      this._captureScroll(); this._leavePatchApply(top.s);
      var id = (nav.seq || 1) + 1;
      var patch = { nav: { stack: [{ s: s, p: {}, from: null, key: null, id: id }], phase: 'enter', dir: 'root', seq: id, leaving: top.s !== s ? top : null }, sheet: null, pf: null };
      this.setState(patch); this._runPhases('root');
      if (this.onNav) this.onNav('root', s, {});
    };
    /* back(force): force skips the unsaved guard (used after save / discard) */
    p.back = function (force) {
      var nav = this.state.nav; if (!nav) return false;
      if (nav.phase === 'exit') nav = this._navSettle();
      if (nav.stack.length < 2) return false;
      var top = nav.stack[nav.stack.length - 1];
      if (force !== true && this._guard(top)) return true;
      this.cancelKey('nav');
      this._leavePatchApply(top.s);
      var self = this; var revealId = nav.stack[nav.stack.length - 2].id;
      this.setState({ nav: assign(nav, { phase: 'exit', dir: 'back', leaving: null }), sheet: null });
      this.afterKey('nav', this.navMs('back'), function () {
        self._pendingRestore = revealId;
        self.setState(function (st) { var stack = st.nav.stack.slice(0, -1); return { nav: { stack: stack, phase: 'idle', dir: 'back', seq: st.nav.seq, leaving: null } }; });
      });
      if (this.onNav) this.onNav('back', nav.stack[nav.stack.length - 2].s, nav.stack[nav.stack.length - 2].p);
      return true;
    };
    p.home = function () { this.cancelKey('nav'); this.setState({ nav: { stack: [{ s: 'home', p: {}, from: null, key: null, id: (this.state.nav.seq || 1) + 1 }], phase: 'idle', dir: 'back', seq: (this.state.nav.seq || 1) + 1, leaving: null }, sheet: null, pf: null }); };
    /* guard: returns true when leaving must be confirmed (opens the unsaved sheet) */
    p._guard = function (top) {
      if (top.s === 'profile-edit') { var f = this.state.pf; if (f && !f.saved && this._pfDirty(f)) { this.setState({ sheet: { kind: 'unsaved' } }); return true; } }
      var fk = SURFACE_FORM[top.s]; if (fk) { var id = this._formId(fk, top.p); var t = (this.state.tf || {})[fk + ':' + id]; if (t && !t.done && ((t.text || '').trim() || (t.files || []).length)) { this.setState({ sheet: { kind: 'unsaved', form: fk + ':' + id } }); return true; } }
      return false;
    };
    p._enterPatch = function (s, params) {
      var ui = this.state.ui || {};
      if (s === 'profile-edit') return { pf: this._pfFresh(this.state.data) };
      if (s === 'city') return { ui: assign(ui, { cityQ: '' }) };
      if (s === 'appearance') return { ui: assign(ui, { skinPreview: null }) };
      if (s === 'notify') return { ui: assign(ui, { sys: false }) };
      return {};
    };
    p._leavePatchApply = function (s) {
      var ui = this.state.ui || {};
      if (s === 'appearance' && ui.skinPreview) this.setState({ ui: assign(ui, { skinPreview: null }) });
      if (s === 'profile-edit') { this.cancelKey('resend'); this.cancelKey('pf-save'); }
    };
    p._ctlAfterUpdate = function () {
      var root = this.rootRef && this.rootRef.current; if (!root || !this.state.nav) return;
      var self = this;
      if (this._pendingRestore != null) {
        var memo = (this._scrollMemo || {})[this._pendingRestore]; this._pendingRestore = null;
        if (memo) Object.keys(memo).forEach(function (k) { var el = root.querySelector('[data-scroller="' + k + '"]'); if (el) el.scrollTop = memo[k]; });
      }
      root.querySelectorAll('[data-scroller]').forEach(function (el) { self._applyHc(el); });
      if (this._focusField) { var f = root.querySelector('[data-field="' + this._focusField + '"]'); this._focusField = null; if (f && f.focus) { try { f.focus({ preventScroll: true }); } catch (e) { try { f.focus(); } catch (e2) { } } this.reveal(f); } }
    };
    /* reveal(el): bring a field into view inside its own [data-scroller] only (above the keyboard inset --kb), never via
       scrollIntoView — that also scrolls clipped ancestors (.app / .ju-phone) and shifts the whole screen. */
    p.reveal = function (el) {
      var root = this.rootRef && this.rootRef.current; if (!el || !root) return;
      var sc = el.closest && el.closest('[data-scroller]');
      var ph = root.closest ? (root.closest('.ju-phone') || root) : root; var pr = ph.getBoundingClientRect();
      var kb = parseFloat((global.getComputedStyle ? getComputedStyle(root).getPropertyValue('--kb') : '') || '0') || 0;
      if (sc) {
        var s = sc.getBoundingClientRect(), r = el.getBoundingClientRect(); var top = Math.max(s.top, pr.top), bottom = Math.min(s.bottom, pr.bottom - kb);
        if (r.top < top + 12 || r.bottom > bottom - 12) sc.scrollTop += (r.top + r.height / 2) - (top + bottom) / 2;
        this._applyHc(sc);
      }
      if (root.scrollTop) root.scrollTop = 0; if (ph !== root && ph.scrollTop) ph.scrollTop = 0;
    };
    p._applyHc = function (el) {
      var rng = this.headerRange || 96; var hc = clamp(el.scrollTop / rng, 0, 1).toFixed(3);
      el.style.setProperty('--hc', hc); var surf = el.closest && el.closest('[data-surface]'); if (surf && surf !== el) surf.style.setProperty('--hc', hc);
      var hd = surf && surf.querySelector('[data-header]'); if (hd) hd.style.setProperty('--hc', hc);
    };
    var ownDU = Object.prototype.hasOwnProperty.call(p, 'componentDidUpdate') ? p.componentDidUpdate : null;
    p.componentDidUpdate = function (pp, ps) { this._ctlAfterUpdate(); if (ownDU) ownDU.call(this, pp, ps); };
    var ownDM = Object.prototype.hasOwnProperty.call(p, 'componentDidMount') ? p.componentDidMount : null;
    p.componentDidMount = function () { this._ctlAfterUpdate(); if (ownDM) ownDM.call(this); };

    /* ---------------- feedback ---------------- */
    p.say = function (text, kind) { var self = this; var id = (this._toastSeq = (this._toastSeq || 0) + 1); this.setState({ toast: { text: text, kind: kind || 'info', id: id } }); this.holdKey('toast', kind === 'error' ? 3600 : 2600, function () { self.setState(function (s) { return s.toast && s.toast.id === id ? { toast: null } : null; }); }); };
    p.closeSheet = function () { this.setState({ sheet: null }); };

    /* ---------------- profile form ---------------- */
    p._pfFresh = function (d) {
      var y = d.you; var pnd = y.emailPending;
      return { name: y.name, wx: y.wx, email: y.email, code: '', errors: {}, saving: false, failed: false, saved: false, shake: 0,
        codeState: pnd && pnd.email !== y.email ? (pnd.verified ? 'verified' : 'sent') : 'none', codeFor: pnd ? pnd.email : null, resendLeft: 0, expiresIn: 0,
        base: { name: y.name, wx: y.wx, email: y.email } };
    };
    p._pfDirty = function (f) { return f.name !== f.base.name || f.wx !== f.base.wx || f.email !== f.base.email; };
    p._pfSet = function (patch) { this.setState(function (s) { return s.pf ? { pf: assign(s.pf, patch) } : null; }); };
    /* functional update: several inputs can fire in the same tick (autofill, IME commit) — never build on a stale this.state.pf */
    p.pfInput = function (field, v) {
      var self = this;
      this.setState(function (s) {
        var f = s.pf; if (!f) return null; var patch = {}; patch[field] = v; patch.errors = assign(f.errors); patch.errors[field] = ''; patch.failed = false; patch.saved = false;
        if (field === 'email') { var t = (v || '').trim(); if (f.codeState !== 'none' && t !== f.codeFor) { patch.codeState = 'none'; patch.code = ''; self.cancelKey('resend'); } patch.errors.code = ''; }
        if (field === 'code') patch.errors.code = '';
        return { pf: assign(f, patch) };
      });
    };
    p.pfSendCode = function () {
      var f = this.state.pf; if (!f) return; var email = (f.email || '').trim();
      if (f.codeState === 'sent' && f.resendLeft > 0) return;
      var res = this.act('requestEmailCode', { email: email }); var e = res.effect;
      if (e.type === 'invalid') { this._pfSet({ errors: assign(f.errors, e.errors) }); return; }
      if (e.type === 'error') { this.say(e.message, 'error'); return; }
      this._pfSet({ codeState: 'sent', codeFor: email, code: '', errors: assign(f.errors, { email: '', code: '' }), resendLeft: 59, expiresIn: 300 });
      this._focusField = 'code'; this._pfTick();
    };
    p._pfTick = function () {
      var self = this;
      this.holdKey('resend', 500, function () {
        var pnd = JUS.derive.emailPending(self.state.data); var f = self.state.pf; if (!pnd || !f || f.codeState === 'verified' || f.codeState === 'none') return;
        var cs = pnd.expired && f.codeState === 'sent' ? 'expired' : f.codeState;
        self._pfSet({ resendLeft: pnd.resendLeftS, expiresIn: Math.ceil(pnd.expiresInMs / 1000), codeState: cs, errors: cs === 'expired' && f.codeState !== 'expired' ? assign(f.errors, { code: JUS.COPY.profileErrors.codeExpired }) : f.errors });
        if (cs === 'sent' || pnd.resendLeftS > 0) self._pfTick();
      });
    };
    p.pfVerify = function () {
      var f = this.state.pf; if (!f) return;
      if (!(f.code || '').trim()) { this._pfSet({ errors: assign(f.errors, { code: '请输入 6 位验证码' }) }); return; }
      var res = this.act('verifyEmailCode', { code: (f.code || '').trim() }); var e = res.effect;
      if (e.type === 'invalid') { this._pfSet({ codeState: e.errors.expired ? 'expired' : f.codeState, errors: assign(f.errors, { code: e.errors.code }) }); return; }
      if (e.type === 'error') { this._pfSet({ errors: assign(f.errors, { code: e.message }) }); return; }
      this.cancelKey('resend'); this._pfSet({ codeState: 'verified', errors: assign(f.errors, { code: '', email: '' }) });
    };
    p.pfSave = function () {
      var f = this.state.pf; if (!f || f.saving) return;
      var email = (f.email || '').trim();
      var errs = { name: JUS.validate.name(f.name), wx: JUS.validate.wx(f.wx), email: JUS.validate.email(email) };
      if (!errs.email && email && email !== f.base.email && f.codeState !== 'verified') errs.email = JUS.COPY.profileErrors.mailUnverified;
      if (errs.name || errs.wx || errs.email) { this._pfSet({ errors: assign(f.errors, errs), failed: false, shake: (f.shake || 0) + 1 }); this._focusField = errs.name ? 'name' : errs.wx ? 'wx' : 'email'; return; }
      this._pfSet({ saving: true, failed: false, errors: {} });
      var self = this; var draft = { name: f.name, wx: f.wx, email: email };
      this.holdKey('pf-save', this.saveMs || 360, function () {
        var res = self.act('saveProfile', draft); var e = res.effect;
        if (e.type === 'invalid') { self._pfSet({ saving: false, errors: e.errors, shake: (self.state.pf.shake || 0) + 1 }); return; }
        if (e.type === 'error') { self._pfSet({ saving: false, failed: true }); return; }
        self.setState(function (s) { return { pf: s.pf ? assign(s.pf, { saving: false, saved: true, base: { name: draft.name.trim(), wx: draft.wx.trim(), email: draft.email } }) : null, ui: assign(s.ui, { lastSaved: { fields: e.changed, nothing: e.nothing, at: Date.now() } }) }; });
        if (self.onProfileSaved) self.onProfileSaved(e);
        else { self.say(e.nothing ? '没有改动' : '资料已保存', 'ok'); self.afterKey('pf-back', 220, function () { self.back(true); }); }
      });
    };
    p.pfCancel = function () { var f = this.state.pf; if (f && !f.saved && this._pfDirty(f)) { this.setState({ sheet: { kind: 'unsaved' } }); return; } this.back(true); };
    p.sheetKeep = function () { this.setState({ sheet: null }); };
    /* drafts are dropped only after the leaving page has gone, so its text does not blank out mid-exit; a navigation in between
       (seq changes) leaves them alone, and entering profile-edit always starts from a fresh pf anyway */
    p._dropDraftAfterExit = function (formKey) {
      var self = this, seq0 = this.state.nav.seq;
      this.afterKey('drop-draft', this.navMs('back') + 40, function () {
        if (self.state.nav.seq !== seq0) return;
        if (formKey) self.setState(function (st) { var tf = assign(st.tf); delete tf[formKey]; return { tf: tf }; });
        else if (self._top().s !== 'profile-edit') self.setState({ pf: null });
      });
    };
    p.sheetDiscard = function () {
      var sh = this.state.sheet; this.setState({ sheet: null });
      if (!(sh && sh.form)) this.cancelKey('resend');
      this.back(true);
      this._dropDraftAfterExit(sh && sh.form ? sh.form : null);
    };

    /* ---------------- text forms ---------------- */
    p._formId = function (kind, params) { var k = FORM[kind].idKey; return k ? (params.id || '') : 'new'; };
    p._tf = function (kind, id) { return (this.state.tf || {})[kind + ':' + id] || { text: '', files: [], who: [], errors: {}, saving: false, failed: false, done: null }; };
    p._tfUpdate = function (kind, id, fn) { var k = kind + ':' + id; this.setState(function (s) { var tf = assign(s.tf); var cur = tf[k] || { text: '', files: [], who: [], errors: {} }; tf[k] = assign(cur, fn(cur)); return { tf: tf }; }); };
    p._tfSet = function (kind, id, patch) { var k = kind + ':' + id; this.setState(function (s) { var tf = assign(s.tf); tf[k] = assign(tf[k] || { text: '', files: [], who: [], errors: {} }, patch); return { tf: tf }; }); };
    p.formSubmit = function (kind, id) {
      var spec = FORM[kind]; var f = this._tf(kind, id); if (f.saving) return; var self = this; var text = (f.text || '').trim();
      var errs = {};
      if (kind === 'rsupp') { if (!text && !(f.files || []).length) errs.text = '请填写补充内容或添加材料'; }
      else if (text.length < spec.min) errs.text = '请填写至少' + spec.min + '字的内容';
      if (kind === 'report' && !(f.who || []).length) errs.who = '请选择举报对象';
      if (errs.text || errs.who) { this._tfSet(kind, id, { errors: errs, failed: false, shake: (f.shake || 0) + 1 }); return; }
      this._tfSet(kind, id, { saving: true, failed: false, errors: {} });
      this.holdKey('tf-' + kind + id, this.saveMs || 360, function () {
        var payload = { text: text };
        if (spec.idKey) payload[spec.idKey] = id;
        if (spec.files) payload.materials = (f.files || []).map(function (x) { return { name: x.name, size: x.size }; });
        if (kind === 'report') { var opts = self._whoOptions(id); payload.who = f.who; payload.whoName = opts.filter(function (o) { return f.who.indexOf(o.k) >= 0; }).map(function (o) { return o.label; }).join('、'); }
        var res = self.act(spec.action, payload); var e = res.effect;
        if (e.type === 'invalid') { self._tfSet(kind, id, { saving: false, errors: e.errors }); return; }
        if (e.type === 'error') { self._tfSet(kind, id, { saving: false, failed: true, failMsg: spec.fail || (kind === 'appeal' ? JUS.COPY.appealFail : kind === 'rsupp' ? JUS.COPY.supplementFail : JUS.COPY.saveFail) }); return; }
        self._tfSet(kind, id, { saving: false, failed: false, done: e });
        var ok = spec.ok || (kind === 'appeal' ? JUS.COPY.appealSaved : '已保存');
        if (self.onFormDone) self.onFormDone(kind, id, e);
        else { self.say(ok, 'ok'); self.afterKey('tf-back', 240, function () { self.back(true); self._dropDraftAfterExit(kind + ':' + id); }); }
      });
    };
    p._whoOptions = function (eventId) {
      var d = this.state.data; var e = d.events[eventId]; if (!e) return [];
      return [{ k: 'host', label: JUS.derive.hostName(d, e) + '（局主）' }, { k: 'member', label: '同局成员' }, { k: 'other', label: '场地或其他' }];
    };

    /* ---------------- settings actions ---------------- */
    p.copy = function (value) {
      var self = this;
      var done = function (ok) { var r = self.act('copyResult', { ok: ok, value: value }); var e = r.effect; if (e.type === 'copied') { self.setState(function (s) { return { ui: assign(s.ui, { copyFail: null }) }; }); self.say(e.message, 'ok'); } else { self.setState(function (s) { return { ui: assign(s.ui, { copyFail: value }) }; }); self.say(e.message, 'error'); self.holdKey('copy', 6000, function () { self.setState(function (s) { return { ui: assign(s.ui, { copyFail: null }) }; }); }); } };
      try { if (global.navigator && navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(value).then(function () { done(true); }, function () { done(false); }); else done(false); } catch (e) { done(false); }
    };
    p.skinPick = function (key) { var cur = this.state.data.appearance.skin; this.setState(function (s) { return { ui: assign(s.ui, { skinPreview: key === cur ? null : key }) }; }); if (this.onSkinPreview) this.onSkinPreview(key); };
    p.skinApply = function () { var key = this.state.ui.skinPreview; if (!key) return; var r = this.act('applySkin', { skin: key }); if (r.effect.type === 'error') { this.say(r.effect.message, 'error'); return; } this.setState(function (s) { return { ui: assign(s.ui, { skinPreview: null }) }; }); var sk = JUS.SKINS.filter(function (x) { return x.key === key; })[0]; this.say('外观已换成「' + sk.name + '」', 'ok'); };
    p.skinCancel = function () { this.setState(function (s) { return { ui: assign(s.ui, { skinPreview: null }) }; }); };
    p.rmToggle = function () { var on = !this.state.data.appearance.reduceMotion; var r = this.act('setReduceMotion', { on: on }); if (r.effect.type === 'error') this.say(r.effect.message, 'error'); };
    p.cityPick = function (key) { var r = this.act('setCity', { city: key }); var e = r.effect; if (e.type === 'error') { this.say(e.message, 'error'); return; } var c = JUS.cityByKey(key); this.say(e.same ? '默认城市已经是' + c.name : '默认城市改为' + c.name, 'ok'); this.setState(function (s) { return { ui: assign(s.ui, { cityQ: '', flash: 'city' }) }; }); };
    p.notifyToggle = function (key) { var cur = !!this.state.data.notify.prefs[key]; var r = this.act('setNotifyPref', { key: key, on: !cur }); if (r.effect.type === 'error') this.say(r.effect.message + ' · 开关已恢复', 'error'); };
    p.notifyRequest = function () {
      var r = this.act('requestPermission', {}); var e = r.effect;
      if (e.type === 'error') { this.say(JUS.COPY.permissionError, 'error'); return; }
      if (e.noop) return;
      var self = this; this.afterKey('sys', 260, function () { self.setState(function (s) { return { ui: assign(s.ui, { sys: true }) }; }); });
    };
    p.notifyAnswer = function (value) {
      this.setState(function (s) { return { ui: assign(s.ui, { sys: false }) }; });
      var r = this.act('resolvePermission', { value: value }); var e = r.effect; if (e.type === 'error') { this.say(JUS.COPY.permissionError, 'error'); return; }
      this.say(value === 'granted' ? '系统已允许通知 · 消息提醒暂未开通' : '你拒绝了系统通知 · 可在浏览器设置里重新打开', value === 'granted' ? 'ok' : 'info');
    };
    p.favRemove = function (id) {
      var d = this.state.data; var f = d.favorites.filter(function (x) { return x.eventId === id; })[0]; if (!f) return;
      var r = this.act('unfavorite', { eventId: id }); var e = r.effect; if (e.type === 'error') { this.say(e.message, 'error'); return; }
      var title = d.events[id].title; var self = this;
      this.setState(function (s) { return { ui: assign(s.ui, { undo: { id: id, at: f.at, title: title, last: !!e.last } }) }; });
      this.holdKey('undo', 4000, function () { self.setState(function (s) { return { ui: assign(s.ui, { undo: null }) }; }); });
    };
    p.favUndo = function () { var u = this.state.ui.undo; if (!u) return; this.cancelKey('undo'); var r = this.act('favorite', { eventId: u.id, at: u.at }); if (r.effect.type === 'error') { this.say(r.effect.message, 'error'); return; } this.setState(function (s) { return { ui: assign(s.ui, { undo: null }) }; }); this.say('已放回收藏', 'ok'); };
    p.favToggle = function (id) {
      var on = JUS.derive.isFav(this.state.data, id); var r = this.act(on ? 'unfavorite' : 'favorite', { eventId: id }); var e = r.effect;
      if (e.type === 'error') { this.say(e.message, 'error'); return; }
      this.say(on ? JUS.FAV.copy.remove + ' · 共 ' + e.count + ' 个' : JUS.FAV.copy.add + ' · 共 ' + e.count + ' 个', 'ok');
    };
    p.acctEnd = function () { this.setState({ sheet: { kind: 'account-end' } }); };
    p.acctConfirm = function () { this.setState({ sheet: null }); var r = this.act('endDemoSession', {}); if (r.effect.type === 'error') { this.say(r.effect.message, 'error'); return; } this.say('已退出本机演示会话', 'ok'); };
    p.acctRestart = function () { var r = this.act('restartDemoSession', {}); if (r.effect.type === 'error') { this.say(r.effect.message, 'error'); return; } this.say('已重新开始本机演示', 'ok'); };

    /* ---------------- 入局 seam gesture (V27 favMove / favEnd parameters, JUS.FAV) ---------------- */
    p._feedDown = function (id, ev) { if (ev.button != null && ev.button !== 0) return; try { ev.currentTarget.setPointerCapture(ev.pointerId); } catch (e) { } this.setState(function (s) { return { ui: assign(s.ui, { drag: { id: id, x: ev.clientX, y: ev.clientY, axis: null, moved: false } }) }; }); };
    p._feedMove = function (id, ev) {
      var g = this.state.ui.drag; if (!g || g.id !== id) return; var F = JUS.FAV;
      var dx = ev.clientX - g.x, dy = ev.clientY - g.y; var axis = g.axis;
      if (!axis) { if (Math.abs(dx) < F.deadZone && Math.abs(dy) < F.deadZone) return; axis = Math.abs(dx) > Math.abs(dy) * F.axisRatio ? 'x' : 'y'; if (axis === 'y') { try { ev.currentTarget.releasePointerCapture(ev.pointerId); } catch (e) { } this.setState(function (s) { return { ui: assign(s.ui, { drag: null, dx: assign(s.ui.dx, (function () { var o = {}; o[id] = 0; return o; })()) }) }; }); return; } }
      var on = JUS.derive.isFav(this.state.data, id); var right = dx > 0; var valid = (right && !on) || (!right && on);
      var eff = valid ? clamp(dx, -F.clamp, F.clamp) : dx * F.idleDamp; var hint = valid ? (Math.abs(dx) > F.throwPx ? (right ? F.copy.add : F.copy.remove) : null) : (right ? F.copy.alreadyOn : F.copy.notOn);
      this.setState(function (s) { var o = assign(s.ui.dx); o[id] = eff; return { ui: assign(s.ui, { drag: assign(g, { axis: axis, moved: true }), dx: o, feedHint: { id: id, text: hint, valid: valid } }) }; });
    };
    p._feedUp = function (id, ev, cancel) {
      var g = this.state.ui.drag; if (!g || g.id !== id) return; var F = JUS.FAV; var dx = cancel ? 0 : (this.state.ui.dx[id] || 0);
      var on = JUS.derive.isFav(this.state.data, id); var moved = g.moved;
      this.setState(function (s) { var o = assign(s.ui.dx); o[id] = 0; return { ui: assign(s.ui, { drag: null, dx: o, feedHint: null }) }; });
      if (moved) this._suppressClick = id;
      if (dx > F.throwPx && !on) this.favToggle(id); else if (dx < -F.throwPx && on) this.favToggle(id);
    };
    p._feedKey = function (id, ev) { if (ev.key === 'ArrowRight' && !JUS.derive.isFav(this.state.data, id)) { ev.preventDefault(); this.favToggle(id); } else if (ev.key === 'ArrowLeft' && JUS.derive.isFav(this.state.data, id)) { ev.preventDefault(); this.favToggle(id); } else if (ev.key === 'Enter') { this.go('seam-feed-detail', { id: id }, ev); } };

    /* ---------------- index mapping ---------------- */
    p.ctlJump = function (e) {
      var o = e.open || {}; var s = o.surface || 'home'; var id = o.id || null; var self = this;
      var paths = assign(DEFAULT_PATHS, this.paths || {}); var path = paths[s] || ['home', s];
      var seq = (this.state.nav && this.state.nav.seq) || 1;
      var stack = path.map(function (x) { seq++; var pr = {}; if (id && /detail|supplement|dispute|appeal|report$|seam-report/.test(x)) pr.id = id; return { s: x, p: pr, from: null, key: null, id: seq }; });
      var d = this.state.data; var ui = assign(this.state.ui); var patch = { nav: { stack: stack, phase: 'idle', dir: 'fwd', seq: seq, leaving: null }, sheet: null, toast: null, pf: null, tf: {} };
      if (s === 'profile-edit') {
        var pf = this._pfFresh(d);
        if (o.state === 'invalid') { pf.name = ''; pf.wx = 'ahe ju'; pf.email = 'ahe@gmail.com'; pf.errors = { name: JUS.validate.name(''), wx: JUS.validate.wx('ahe ju'), email: JUS.validate.email('ahe@gmail.com') }; }
        if (o.state === 'code' || o.state === 'code-expired') { var r1 = JUS.engine.requestEmailCode(d, { email: 'he.a@stern.nyu.edu' }); d = r1.data; pf.email = 'he.a@stern.nyu.edu'; pf.codeState = 'sent'; pf.codeFor = pf.email; pf.resendLeft = 59; pf.expiresIn = 300;
          if (o.state === 'code-expired') { d = JUS.engine.expireEmailCode(d, {}).data; pf.codeState = 'expired'; pf.resendLeft = 0; pf.expiresIn = 0; pf.code = r1.effect.code; pf.errors = { code: JUS.COPY.profileErrors.codeExpired }; } }
        if (o.state === 'fail') { pf.name = '阿禾 Ahe'; pf.failed = true; }
        if (o.state === 'unsaved') { pf.name = '阿禾 Ahe'; patch.sheet = { kind: 'unsaved' }; }
        if (o.state === 'kb') { this._focusField = 'name'; this.setReview({ kb: true }); }
        patch.pf = pf; patch.data = d;
        if (o.state === 'code') this.afterKey('jump-tick', 30, function () { self._pfTick(); });
      }
      if (s === 'profile' && o.state === 'saved') { var rs = JUS.engine.saveProfile(d, { name: '阿禾 Ahe', wx: d.you.wx, email: d.you.email }); if (rs.effect.type === 'profile-saved') { patch.data = rs.data; ui.lastSaved = { fields: rs.effect.changed, at: Date.now() }; } }
      if (s === 'city' && o.state === 'noresult') ui.cityQ = '东京';
      if (s === 'notify' && o.state === 'requesting') { var rq = JUS.engine.requestPermission(d, {}); patch.data = rq.data; ui.sys = true; }
      if (s === 'appearance' && o.state === 'preview') ui.skinPreview = id || 'sunset';
      if (s === 'account' && o.state === 'confirm') patch.sheet = { kind: 'account-end' };
      if (s === 'seam-feed' && o.state === 'fav') ui.feedFilter = 'fav';
      patch.ui = ui;
      this.setState(patch);
    };

    /* ---------------- view model ---------------- */
    p.ctlVals = function () {
      var self = this, s = this.state, d = s.data, ui = s.ui || {}, nav = s.nav, F = JUS.FAV;
      var stack = nav.stack, top = stack[stack.length - 1], under = stack.length > 1 ? stack[stack.length - 2] : null;
      var ph = 'ph-' + nav.phase + ' dir-' + nav.dir;
      var on = {}, cls = {}, is = {}, go = {};
      SURFACES.forEach(function (x) { on[x] = false; cls[x] = ''; is[x] = false; go[x] = function (ev) { self.go(x, {}, ev); }; });
      if (under) { on[under.s] = true; cls[under.s] = 'is-under ' + ph; }
      if (nav.leaving) { on[nav.leaving.s] = true; cls[nav.leaving.s] = 'is-leaving ' + ph; }
      on[top.s] = true; cls[top.s] = 'is-top ' + ph; is[top.s] = true;
      var fr = top.from; var fromStyle = fr ? ('--fx-x:' + Math.round(fr.x) + 'px;--fx-y:' + Math.round(fr.y) + 'px;--fx-w:' + Math.round(fr.w) + 'px;--fx-h:' + Math.round(fr.h) + 'px') : '';
      var leavingFrom = nav.leaving && nav.leaving.from ? nav.leaving.from : null;
      var navV = { cur: top.s, prev: under ? under.s : null, depth: stack.length, phase: nav.phase, dir: nav.dir, from: fr, fromStyle: fromStyle, fromKey: top.key, params: top.p,
        on: on, cls: cls, is: is, go: go, back: function () { self.back(); }, home: function () { self.home(); },
        onScroll: function (ev) { self._applyHc(ev.currentTarget); },
        rootCls: ' nav-' + nav.phase + ' dir-' + nav.dir + ' at-' + top.s + (under ? ' over-' + under.s : '') + (nav.leaving ? ' leaving-' + nav.leaving.s : ''), leavingFrom: leavingFrom,
        title: { 'home': '设置', 'profile': '个人资料', 'profile-edit': '编辑资料', 'favorites': '收藏的局', 'favorite-detail': '活动详情', 'city': '默认浏览城市', 'notify': '通知与提醒', 'appearance': '外观与动态', 'records': '我的记录', 'record-detail': '记录详情', 'record-supplement': '补充记录', 'record-dispute': '出席异议', 'record-appeal': '补充与申诉', 'reports': '我的举报', 'report-detail': '举报详情', 'report-supplement': '补充材料', 'help': '帮助与反馈', 'feedback': '产品反馈', 'privacy': '隐私与资料可见性', 'account': '账户与本机数据', 'about': '关于与规则', 'rules': '参加约定', 'seam-feed': '找局', 'seam-feed-detail': '活动详情', 'seam-mine': '我的局', 'seam-report': '举报' } };
      navV.curTitle = navV.title[top.s] || '';
      var rootKey = top.s.indexOf('seam-feed') === 0 ? 'find' : top.s.indexOf('seam-mine') === 0 || top.s === 'seam-report' ? 'mine' : 'settings';
      var rootNav = [{ k: 'find', label: '找局' }, { k: 'create', label: '开局' }, { k: 'mine', label: '我的局' }, { k: 'settings', label: '设置' }].map(function (r) {
        return assign(r, { on: r.k === rootKey, cls: (r.k === rootKey ? 'on' : '') + (r.k === 'create' ? ' off' : ''), disabled: r.k === 'create', go: function () { if (r.k === 'create') { self.say('开局不在本次演示范围', 'info'); return; } self.root(r.k); } });
      });
      var sum = JUS.derive.summary(d);
      var recsAll = JUS.derive.records(d); var repsAll = JUS.derive.reports(d);
      var att = [];
      recsAll.rows.forEach(function (r) { if (r.pendingReview && !r.appeals.length) att.push({ key: 'rec-' + r.id, kind: 'record', title: r.title, label: r.label, status: r.statusLabel, line: '待核实 · 可补充说明或提出异议', open: function (ev) { self.go('record-detail', { id: r.id }, ev); } }); });
      repsAll.rows.forEach(function (r) { if (r.needsMore) att.push({ key: 'rep-' + r.id, kind: 'report', title: r.title, label: '举报需补充', status: r.statusLabel, line: r.needsText || '需要补充材料', open: function (ev) { self.go('report-detail', { id: r.id }, ev); } }); });
      var you = assign(d.you, { emailLabel: sum.emailLabel, wxLabel: sum.wxLabel, verified: !!(d.you.email && d.you.emailVerified), domain: d.you.emailDomain, initial: (d.you.name || '·').slice(0, 1),
        copyWx: function () { if (d.you.wx) self.copy(d.you.wx); }, copyFail: ui.copyFail, lastSaved: ui.lastSaved, savedName: !!(ui.lastSaved && ui.lastSaved.fields && ui.lastSaved.fields.indexOf('name') >= 0), savedWx: !!(ui.lastSaved && ui.lastSaved.fields && ui.lastSaved.fields.indexOf('wx') >= 0), savedEmail: !!(ui.lastSaved && ui.lastSaved.fields && ui.lastSaved.fields.indexOf('email') >= 0) });
      var out = { nav: navV, rootNav: rootNav, sum: sum, att: att, attCount: att.length, you: you, kb: !!(s.review && s.review.kb), rm: this.isRM(),
        skinShown: ui.skinPreview || d.appearance.skin, toast: s.toast ? assign(s.toast, { on: true, cls: 'k-' + s.toast.kind }) : { on: false, text: '', cls: '' },
        session: d.session, demoNote: JUS.COPY.demoOnly };
      /* confirm sheets */
      var sh = s.sheet;
      out.sheet = { on: !!sh, kind: sh ? sh.kind : '', unsaved: !!(sh && sh.kind === 'unsaved'), accountEnd: !!(sh && sh.kind === 'account-end'),
        title: sh ? (sh.kind === 'unsaved' ? JUS.COPY.unsaved.title : '退出本机演示会话？') : '', body: sh ? (sh.kind === 'unsaved' ? JUS.COPY.unsaved.body : '只结束本机的演示会话；已提交的记录、举报与资料都保留，不会发出任何真实请求。') : '',
        keepLabel: JUS.COPY.unsaved.keep, discardLabel: JUS.COPY.unsaved.discard, keep: function () { self.sheetKeep(); }, discard: function () { self.sheetDiscard(); },
        confirmLabel: '退出登录（本地演示）', cancelLabel: '再想想', confirm: function () { self.acctConfirm(); }, cancel: function () { self.closeSheet(); } };
      /* profile */
      var f = s.pf;
      if (f) {
        var emailT = (f.email || '').trim(); var changed = emailT !== f.base.email;
        out.pf = { on: true, name: f.name, wx: f.wx, email: f.email, code: f.code, err: f.errors || {}, hasErr: !!(f.errors && (f.errors.name || f.errors.wx || f.errors.email || f.errors.code)),
          dirty: this._pfDirty(f), saving: f.saving, failed: f.failed, saved: f.saved, shake: f.shake || 0, shakeCls: f.shake ? ('shake-' + (f.shake % 2)) : '',
          emailChanged: changed, needCode: changed && !!emailT && f.codeState !== 'verified', codeState: f.codeState, codeNone: f.codeState === 'none', codeSent: f.codeState === 'sent', codeExpired: f.codeState === 'expired', codeVerified: f.codeState === 'verified',
          resendLeft: f.resendLeft, canResend: f.codeState === 'expired' || (f.codeState === 'sent' && f.resendLeft <= 0), resendLabel: f.codeState === 'sent' && f.resendLeft > 0 ? f.resendLeft + ' 秒后可重发' : '重新发送', expiresIn: f.expiresIn,
          nameCount: graphemes(f.name) + '/10', nameOver: graphemes(f.name) > 10,
          onName: function (ev) { self.pfInput('name', ev.target.value); }, onWx: function (ev) { self.pfInput('wx', ev.target.value); }, onEmail: function (ev) { self.pfInput('email', ev.target.value); }, onCode: function (ev) { self.pfInput('code', ev.target.value.replace(/\D/g, '').slice(0, 6)); },
          onKeyCode: function (ev) { if (ev.key === 'Enter') self.pfVerify(); },
          sendCode: function () { self.pfSendCode(); }, verify: function () { self.pfVerify(); }, resend: function () { self.pfSendCode(); }, save: function () { self.pfSave(); }, retry: function () { self.pfSave(); }, cancel: function () { self.pfCancel(); },
          saveLabel: f.saving ? '保存中…' : f.failed ? '重试保存' : '保存', failText: f.failed ? JUS.COPY.saveFail + '，输入已保留' : '',
          emailHint: JUS.COPY.emailHint, snapshotNote: JUS.COPY.snapshotNote, codeNote: '本机演示 · 验证码不发邮件，显示在画面外的评审面板', verifiedText: '已验证 ' + (emailT.split('@')[1] || '') };
      } else out.pf = { on: false };
      /* text form for the current surface */
      var fk = SURFACE_FORM[top.s];
      if (fk) {
        var fid = this._formId(fk, top.p); var tf = this._tf(fk, fid); var spec = FORM[fk];
        var who = fk === 'report' ? this._whoOptions(fid).map(function (o) { return assign(o, { on: (tf.who || []).indexOf(o.k) >= 0, toggle: function () { self._tfUpdate(fk, fid, function (t) { var w = (t.who || []).slice(); var i = w.indexOf(o.k); if (i >= 0) w.splice(i, 1); else w.push(o.k); return { who: w, errors: assign(t.errors, { who: '' }) }; }); } }); }) : [];
        out.form = { on: true, kind: fk, id: fid, title: spec.title, label: spec.label, placeholder: spec.placeholder, submitLabel: tf.saving ? '提交中…' : tf.failed ? '重试' : spec.submit,
          text: tf.text || '', count: (tf.text || '').trim().length, min: spec.min, err: tf.errors || {}, saving: !!tf.saving, failed: !!tf.failed, failText: tf.failed ? (tf.failMsg || JUS.COPY.saveFail) : '', done: !!tf.done, shake: tf.shake || 0,
          onInput: function (ev) { self._tfSet(fk, fid, { text: ev.target.value, errors: {}, failed: false }); },
          canFiles: spec.files, files: (tf.files || []).map(function (x, i) { return assign(x, { sizeText: x.size > 1048576 ? (x.size / 1048576).toFixed(1) + ' MB' : Math.max(1, Math.round(x.size / 1024)) + ' KB', remove: function () { self._tfUpdate(fk, fid, function (t) { var fl = (t.files || []).slice(); fl.splice(i, 1); return { files: fl }; }); } }); }),
          onFiles: function (ev) { var list = Array.prototype.slice.call(ev.target.files || []).map(function (x) { return { name: x.name, size: x.size }; }); self._tfUpdate(fk, fid, function (t) { return { files: (t.files || []).concat(list).slice(0, 3) }; }); try { ev.target.value = ''; } catch (e) { } },
          fileNote: '本机演示 · 只记录文件名与大小，不会上传', who: who, needWho: fk === 'report',
          submit: function () { self.formSubmit(fk, fid); }, cancel: function () { self.back(); } };
      } else out.form = { on: false };
      /* notifications */
      var n = JUS.derive.notify(d);
      out.notify = assign(n, { cats: JUS.NOTIFY_CATS.map(function (c) { var v = !!d.notify.prefs[c.key]; return { key: c.key, label: c.label, sub: c.sub, on: v, aria: v ? 'true' : 'false', cls: v ? 'on' : '', toggle: function () { self.notifyToggle(c.key); } }; }),
        onCount: JUS.NOTIFY_CATS.filter(function (c) { return d.notify.prefs[c.key]; }).length, total: JUS.NOTIFY_CATS.length,
        isDefault: n.permission === 'default', isRequesting: n.permission === 'requesting', isGranted: n.permission === 'granted', isDenied: n.permission === 'denied', isUnsupported: n.permission === 'unsupported',
        request: function () { self.notifyRequest(); }, sys: { on: !!ui.sys, allow: function () { self.notifyAnswer('granted'); }, deny: function () { self.notifyAnswer('denied'); }, title: '“JU” 想向你发送通知', body: '通知可能包括提醒、声音和图标标记。可在系统设置中更改。' },
        prefHint: JUS.COPY.prefHint });
      /* appearance */
      var rmUser = !!d.appearance.reduceMotion, rmSys = !!(s.review && s.review.rmSys);
      out.skin = { cur: d.appearance.skin, shown: out.skinShown, preview: ui.skinPreview, previewing: !!ui.skinPreview,
        list: JUS.SKINS.map(function (k) { return assign(k, { on: d.appearance.skin === k.key, shown: out.skinShown === k.key, cls: (d.appearance.skin === k.key ? 'cur' : '') + (out.skinShown === k.key ? ' shown' : ''), pick: function () { self.skinPick(k.key); } }); }),
        curName: JUS.SKINS.filter(function (k) { return k.key === d.appearance.skin; })[0].name, shownName: JUS.SKINS.filter(function (k) { return k.key === out.skinShown; })[0].name,
        apply: function () { self.skinApply(); }, cancel: function () { self.skinCancel(); }, applyLabel: ui.skinPreview ? '应用「' + JUS.SKINS.filter(function (k) { return k.key === ui.skinPreview; })[0].name + '」' : '应用',
        rmUser: rmUser, rmSys: rmSys, rmOn: rmUser || rmSys, rmAria: (rmUser || rmSys) ? 'true' : 'false', rmToggle: function () { self.rmToggle(); },
        rmLine: rmSys ? '系统已开启「减少动态」，JU 会跟随系统；这里的开关在系统关闭后生效' : rmUser ? '已减少动态：转场直接呈现结果，状态与反馈不变' : '正常动态' };
      /* city */
      var q = (ui.cityQ || '').trim().toLowerCase(); var curCity = JUS.cityByKey(d.prefs.city);
      var cl = JUS.CITIES.filter(function (c) { return !q || c.name.indexOf(q) >= 0 || c.en.toLowerCase().indexOf(q) >= 0 || c.key.toLowerCase().indexOf(q) >= 0; });
      out.city = { cur: curCity, q: ui.cityQ || '', onQ: function (ev) { var v = ev.target.value; self.setState(function (st) { return { ui: assign(st.ui, { cityQ: v }) }; }); }, clearQ: function () { self.setState(function (st) { return { ui: assign(st.ui, { cityQ: '' }) }; }); },
        list: cl.map(function (c) { return assign(c, { on: c.key === d.prefs.city, cls: c.key === d.prefs.city ? 'on' : '', pick: function () { self.cityPick(c.key); } }); }), none: cl.length === 0, noResult: JUS.CITY_COPY.noResult, retry: JUS.CITY_COPY.retry, scope: JUS.COPY.cityScope, note: JUS.CITY_COPY.customNote, flash: ui.flash === 'city' };
      /* favorites */
      var favs = JUS.derive.favorites(d);
      var favRow = function (r) { return assign(r, { key: r.id, open: function (ev) { if (self._suppressClick === r.id) { self._suppressClick = null; return; } self.go('favorite-detail', { id: r.id }, ev); }, remove: function () { self.favRemove(r.id); }, joined: r.relation.kind === 'joined', hosted: r.relation.kind === 'hosted', relLabel: r.relation.label, statusLabel: r.status.label, closed: r.status.closed, cityName: r.city.name }); };
      out.fav = { rows: favs.all.map(favRow), active: favs.active.map(favRow), archived: favs.archived.map(favRow), count: favs.count, empty: favs.empty, emptyCopy: JUS.COPY.favEmpty,
        undo: ui.undo ? { on: true, text: '已拿出「' + ui.undo.title + '」', act: function () { self.favUndo(); }, label: '撤回' } : { on: false }, goFind: function () { self.root('find'); } };
      if (top.s === 'favorite-detail' || top.s === 'seam-feed-detail') {
        var eid = top.p.id; var ev0 = d.events[eid];
        if (ev0) { var fr0 = JUS.derive.favorite(d, eid); var j0 = JUS.derive.joinedRow(d, eid); var canSee = !!(j0 && j0.ticket && j0.ticket.torn && !j0.contactClosed);
          var det = { id: eid, title: ev0.title, when: JUS.fmt.when(ev0.iso), place: JUS.fmt.place(ev0.loc), host: JUS.derive.hostName(d, ev0), cap: '共 ' + ev0.capacity + ' 人', note: ev0.note || '', city: JUS.cityByKey(ev0.city), crossCity: ev0.city !== d.prefs.city, status: JUS.derive.eventStatus(d, ev0),
            fav: JUS.derive.isFav(d, eid), favLabel: JUS.derive.isFav(d, eid) ? '已收藏 · 拿出收藏' : '收进收藏', toggleFav: function () { self.favToggle(eid); },
            joined: !!j0, joinedLabel: j0 ? j0.label : '未报名', canSeeHostWx: canSee, hostWx: canSee ? (ev0.host === 'you' ? d.you.wx : ev0.host.wx) : '', hostWxRule: canSee ? '已撕开有效票，可以联系局主' : j0 ? (j0.ticket ? '撕开有效票后才能看到局主微信' : JUS.COPY.contactRules.beforeFormed) : '报名并成局、撕开有效票后才能看到局主微信',
            copyHostWx: function () { if (canSee) self.copy(ev0.host === 'you' ? d.you.wx : ev0.host.wx); }, applyNote: '报名不在本次演示范围', favAgo: fr0 ? fr0.favAgo : '' };
          if (top.s === 'favorite-detail') out.favDetail = det; else out.feedDetail = det; }
      }
      /* records */
      out.recs = { rows: recsAll.rows.map(function (r) { return assign(r, { key: r.id, open: function (ev) { self.go('record-detail', { id: r.id }, ev); } }); }), count: recsAll.count, empty: recsAll.count === 0,
        attendance: recsAll.attendance, exits: recsAll.exits, changes: recsAll.changes, exitLine: recsAll.exitLine,
        help: JUS.COPY.recordHelp, quotaRule: JUS.COPY.quotaRule, quotaNo: JUS.COPY.quotaNoCount, creditSettings: JUS.COPY.creditSettings, emptyText: JUS.COPY.creditEmpty };
      out.recs.groups = [['出席记录', out.recs.rows.filter(function (r) { return r.kindLabel === '出席记录'; })], ['主动退出', out.recs.rows.filter(function (r) { return r.kindLabel === '主动退出'; })], ['安排变化', out.recs.rows.filter(function (r) { return r.kindLabel === '安排变化'; })]].filter(function (g) { return g[1].length; }).map(function (g) { return { title: g[0], rows: g[1], count: g[1].length }; });
      var rid = /^record-/.test(top.s) ? top.p.id : (under && /^record-/.test(under.s) ? under.p.id : null);
      if (rid) { var rr = JUS.derive.record(d, rid); if (rr) out.rec = assign(rr, { supplementRows: (rr.supplements || []).map(function (x) { return assign(x, { atText: JUS.fmt.dateTime(x.at), materialsText: (x.materials || []).map(function (m) { return m.name; }).join('、') }); }), appealRows: (rr.appeals || []).map(function (x) { return assign(x, { atText: JUS.fmt.dateTime(x.at), kindLabel: x.kind === 'dispute' ? '出席异议' : '申诉说明', statusLabel: '待核实（本机）' }); }),
        goSupplement: function (ev) { self.go('record-supplement', { id: rid }, ev); }, goDispute: rr.canDispute ? function (ev) { self.go('record-dispute', { id: rid }, ev); } : null, goAppeal: rr.canAppeal ? function (ev) { self.go('record-appeal', { id: rid }, ev); } : null }); }
      out.rec = out.rec || null;
      /* reports */
      out.reps = { rows: repsAll.rows.map(function (r) { return assign(r, { key: r.id, open: function (ev) { self.go('report-detail', { id: r.id }, ev); } }); }), count: repsAll.rows.length, empty: repsAll.rows.length === 0, note: JUS.COPY.reportNote, mock: JUS.COPY.reportMock, emptyText: JUS.COPY.reportsEmpty };
      var pid = /^report-/.test(top.s) ? top.p.id : (under && /^report-/.test(under.s) ? under.p.id : null);
      if (pid) { var rp = JUS.derive.report(d, pid); if (rp) out.rep = assign(rp, { goSupplement: rp.needsMore ? function (ev) { self.go('report-supplement', { id: pid }, ev); } : null, shotRows: (rp.shots || []).map(function (x) { return assign(x, { sizeText: x.size ? Math.max(1, Math.round(x.size / 1024)) + ' KB' : '' }); }) }); }
      out.rep = out.rep || null;
      /* help / privacy / about / account */
      out.help = { groups: JUS.RULE_GROUPS.map(function (g) { return assign(g, { rules: JUS.RULES.filter(function (r) { return r.group === g.key; }) }); }), faq: JUS.RULES.filter(function (r) { return r.body; }).slice(0, 6), feedback: JUS.derive.feedback(d), goFeedback: function (ev) { self.go('feedback', {}, ev); }, goReports: function (ev) { self.go('reports', {}, ev); }, goRules: function (ev) { self.go('rules', {}, ev); } };
      out.privacy = JUS.derive.privacy(d);
      out.about = assign(JUS.derive.about(d), { goRules: function (ev) { self.go('rules', {}, ev); } });
      out.acct = { session: d.session, demo: d.session.kind === 'demo', ended: d.session.kind === 'ended', startedText: d.session.startedAt ? JUS.fmt.dateTime(d.session.startedAt) : '', endedText: d.session.endedAt ? JUS.fmt.dateTime(d.session.endedAt) : '', device: d.session.device,
        end: function () { self.acctEnd(); }, restart: function () { self.acctRestart(); }, storageNote: '本套方案的演示数据只存在这台设备的浏览器里（' + JUS.store.key(this.concept.code) + '）；重置只清这一套。', noAccount: '没有真实账户：没有登录、绑定、改密码或注销能力，这里也不会伪装它们。' };
      /* seams */
      var feed = JUS.derive.feed(d, ui.feedFilter || 'all');
      out.feed = { count: feed.count, favCount: JUS.derive.feed(d, 'all').favCount, city: feed.city, filter: ui.feedFilter || 'all', isAll: (ui.feedFilter || 'all') === 'all', isFav: ui.feedFilter === 'fav',
        setAll: function () { self.setState(function (st) { return { ui: assign(st.ui, { feedFilter: 'all' }) }; }); }, setFav: function () { self.setState(function (st) { return { ui: assign(st.ui, { feedFilter: 'fav' }) }; }); },
        hintIdle: '右滑收进收藏 · 左滑拿出', empty: feed.count === 0, emptyText: ui.feedFilter === 'fav' ? JUS.FAV.copy.emptyCity || '还没收藏这个城市的局' : '这个城市暂时没有可报名的局',
        rows: feed.rows.map(function (r) { var dx = (ui.dx && ui.dx[r.id]) || 0; var dragging = !!(ui.drag && ui.drag.id === r.id); var hint = ui.feedHint && ui.feedHint.id === r.id ? ui.feedHint : null;
          return assign(r, { key: r.id, dx: dx, dragging: dragging, cls: (dragging ? 'is-drag' : '') + (r.fav ? ' is-fav' : '') + (hint && !hint.valid ? ' is-wrong' : '') + (hint && hint.valid && hint.text ? ' is-armed' : ''), style: 'transform:translateX(' + dx.toFixed(1) + 'px) rotate(' + (dx * F.rotatePerPx).toFixed(2) + 'deg)', hint: hint ? hint.text : '', star: r.fav ? F.icon.on : F.icon.off,
            down: function (ev) { self._feedDown(r.id, ev); }, move: function (ev) { self._feedMove(r.id, ev); }, up: function (ev) { self._feedUp(r.id, ev, false); }, cancel: function (ev) { self._feedUp(r.id, ev, true); }, key: function (ev) { self._feedKey(r.id, ev); },
            open: function (ev) { if (self._suppressClick === r.id) { self._suppressClick = null; return; } self.go('seam-feed-detail', { id: r.id }, ev); }, toggle: function () { self.favToggle(r.id); } }); }) };
      var mine = JUS.derive.mine(d);
      var mineRow = function (r) { var rs = repsAll.rows.filter(function (x) { return x.eventId === r.id; }); return assign(r, { key: r.id, toggleFav: function () { self.favToggle(r.id); }, star: r.fav ? F.icon.on : F.icon.off, receipt: rs.length ? rs[0].statusLabel : '', report: function (ev) { self.go('seam-report', { id: r.id }, ev); }, canReport: r.group === '历史' }); };
      out.mine = { current: mine.current.map(mineRow), history: mine.history.map(mineRow), hosted: mine.hosted.map(function (h) { return assign(h, { key: h.id, toggleFav: function () { self.favToggle(h.id); }, star: h.fav ? F.icon.on : F.icon.off }); }), snapshotNote: JUS.COPY.snapshotNote };
      if (top.s === 'seam-report') { var re = d.events[top.p.id]; out.seamReport = re ? { title: re.title, when: JUS.fmt.when(re.iso), place: JUS.fmt.place(re.loc), host: JUS.derive.hostName(d, re), existing: repsAll.rows.filter(function (x) { return x.eventId === re.id; }) } : null; }
      return out;
    };
  };
})(typeof window !== 'undefined' ? window : this);

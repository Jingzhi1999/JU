/* ju-ctl.js (my-r2) — the shared BEHAVIOUR controller for every 「我的局」 R2 concept (C01–C10). No markup, no styles: each concept
   renders this.ctlVals() with its own composition, type, surfaces and motion. Interface: my-r2/spec/ctl-api.md (v1).

   Provides (installed by JU.mixin → JU.ctlInstall):
     navigation   this.go(surface, params, ev) / back() / home() / replace(surface, params, ev). Surfaces: home (role × section live in
                  state, never on the stack) → detail / read / waitlist / ticket / reply / history / manage / draft. Stack entries keep
                  the origin rect of the tapped [data-origin] element and the scroll position of every [data-scroller]; phases
                  enter → in → idle (fwd / swap / role) and exit → idle (back). go() ignores a push that repeats the top entry; back()
                  may be called again while the exit animation runs (it settles the previous one first). Missing parents of a path
                  (home > detail > read) are inserted under the new top so 返回 always has somewhere to go.
     header       onScroll on any [data-scroller] writes --hc (0..1 over this.headerRange px, default 96) on the scroller, its
                  [data-surface] ancestor and that surface's [data-header]; concepts interpolate 30px → 18px with calc().
     role/section setRole / setSection with per-role section memory and per-(role, section) scroll memory; dir-role / dir-swap phases.
     engine       this.act(name, payload) → { data, effect }: every state change goes through JU.engine; the controller writes the data
                  FIRST, then sets c.fx and calls the concept's onEffect(effect) so the concept animates what already happened.
                  Writes that simulate a request (confirm / approve / reject / sheet ok) stay 处理中 for ≥ this.processMs (360ms, real
                  time) before the engine runs; an armed failure (面板 「下一次写入失败」) lands as an error at the place it happened,
                  with 重试 — nothing is animated on failure.
     participant  detail (members / countdown / rules / primary / secondary), read (scroll-to-end receipt → confirm / release),
                  waitlist (door + receipt + leave), ticket (print → tear gesture or tearNow() keyboard / button → contact layer →
                  copy → 已加微信), reply (new ticket: accept = tear, decline = burn), history (ashes once, records, 局内记录).
     host         manage H1: head / progress, apps (approve / reject → result in place), roster, queue, leaves, replies, attendance
                  (set → stamp fresh 2.5s → correct → trail), arrange (reschedule / end / cancel sheets, card sheet), drafts (delete
                  → 10s undo in the original slot).
     sheets       c.sheet: confirm (withdraw / release / exit / decline / leaveQueue), reschedule, cancel, end, card, record, contact;
                  focusRef + onKeyDown (Tab cycle, Esc), focus returns to the trigger element on close.
     feedback     say(text, kind) toast (2600ms real time), copy(text, key) with the REAL clipboard result (armed failure → 失败 +
                  重试 + 手动复制).
     clock        the countdown tick (holdKey 'tick', 1s, real time) runs only while a row with a deadline is on screen; every tick
                  and every panel clock jump settles expiries through JU.engine.settle and emits each effect.
     index        ctlJump(e) builds the full stack + ui for all 50 JU.INDEX entries (so 返回 works from any jumped state).
   Concepts may override: motionSpec { fwd, back, swap, role } (ms), headerRange, processMs, printMs (2300), burnMs (6600),
   deleteMs (260), tearSpec { dist, kx, ky }, paths, and the hooks onEffect(effect), onNav(kind, surface, params), beforeReplay(name). */
(function (global) {
  'use strict';
  var JU = global.JU = global.JU || {};
  var H = 3600000, M = 60000;
  var SURFACES = ['home', 'detail', 'read', 'waitlist', 'ticket', 'reply', 'history', 'manage', 'draft'];
  JU.SURFACES = SURFACES;
  var DEFAULT_PATHS = { home: ['home'], detail: ['home', 'detail'], read: ['home', 'detail', 'read'], waitlist: ['home', 'waitlist'], ticket: ['home', 'ticket'], reply: ['home', 'reply'], history: ['home', 'history'], manage: ['home', 'manage'], draft: ['home', 'draft'] };
  JU.CTL_PATHS = DEFAULT_PATHS;
  var TITLES = { home: '我的局', detail: '局内详情', read: '阅读并确认', waitlist: '候补', ticket: '票根', reply: '局主改了时间', history: '历史', manage: '管理这局', draft: '草稿' };
  var FOCUSABLE = 'button:not([disabled]),[href],input:not([disabled]):not([type=hidden]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';
  /* layout position (offset chain): ignores CSS transforms / running animations and scroll offsets */
  /* a receipt whose title already says its field (「位置已预留」+「已预留」) drops the field (C06 report) */
  function noDupField(r) { return r && r.field && r.title && r.title.indexOf(r.field) >= 0 ? assign(r, { field: '' }) : r; }
  function layoutXY(n) { var x = 0, y = 0; while (n) { x += n.offsetLeft || 0; y += n.offsetTop || 0; n = n.offsetParent; } return { x: x, y: y }; }
  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
  function assign() { var o = {}; for (var i = 0; i < arguments.length; i++) { var a = arguments[i]; if (a) for (var k in a) if (Object.prototype.hasOwnProperty.call(a, k)) o[k] = a[k]; } return o; }
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function jitem(d, id) { return d.joined.filter(function (x) { return x.eventId === id; })[0] || null; }
  function hitem(d, id) { return d.hosted.filter(function (x) { return x.eventId === id; })[0] || null; }
  function mask(name) { return name ? String(name).slice(0, 1) + '**' : ''; }
  function isoOf(date, time) { return date && time ? date + 'T' + time : ''; }
  /* the shared ritual modules (my-r2/src/shared/rituals/*, window.JURitual) own print / tear / burn timing when present; without them the
     controller's own timers (printMs / burnMs) stand in so every flow still completes */
  function ritual(name) { var R = global.JURitual; return !!(R && R[name]); }
  JU.hasRitual = ritual;

  JU.ctlState = function () {
    return {
      nav: { stack: [{ s: 'home', p: {}, from: null, key: null, id: 1 }], phase: 'idle', dir: 'fwd', seq: 1, leaving: null },
      sheet: null, toast: null,
      ui: {
        memo: { joined: 'current', hosted: 'current' }, prevRole: null, prevSection: null, landKey: null,
        read: { eventId: null, progress: 0, done: false, doneAt: 0 },
        ticket: { printed: {}, printing: null, tear: { progress: 0, active: false, done: false, error: '' }, contactOpen: false },
        burned: {}, burn: null, result: null, copy: null, undo: null, ghost: null, restored: null,
        manage: { open: {}, editing: {}, fresh: {}, focus: null, next: null },
        busy: {}, errors: {}, fx: null, tick: 0, settled: 0
      }
    };
  };
  var baseState = JU.baseState;
  JU.baseState = function (variant) { return assign(baseState(variant), JU.ctlState()); };

  JU.ctlInstall = function (C) {
    var p = C.prototype;
    p.navMs = function (dir) { var m = this.motionSpec || {}; return dir === 'back' ? (m.back || 300) : dir === 'role' ? (m.role || 300) : dir === 'swap' ? (m.swap || 280) : (m.fwd || 360); };
    p._top = function () { var st = this.state.nav.stack; return st[st.length - 1]; };
    p._ui = function (patch) { this.setState(function (s) { return { ui: assign(s.ui, patch) }; }); };
    p._uiIn = function (key, patch) { this.setState(function (s) { var o = {}; o[key] = assign(s.ui[key], patch); return { ui: assign(s.ui, o) }; }); };
    p._paths = function () { return assign(DEFAULT_PATHS, this.paths || {}); };
    /* ---------------- scroll memory + origin rects ---------------- */
    p._scrollKey = function (entry) { return entry.s === 'home' ? 'home:' + this.state.role + ':' + this.state.section : String(entry.id); };
    p._captureScroll = function () {
      var root = this.rootRef && this.rootRef.current; if (!root || !this.state.nav) return;
      var memo = {}; root.querySelectorAll('[data-scroller]').forEach(function (el) { memo[el.getAttribute('data-scroller')] = el.scrollTop; });
      (this._scrollMemo = this._scrollMemo || {})[this._scrollKey(this._top())] = memo;
    };
    p._originOf = function (ev, s) {
      var root = this.rootRef && this.rootRef.current; if (!ev || !root || !JU.fx) return { from: null, key: null };
      var t = ev.currentTarget || ev.target; var el = t && t.closest ? (t.closest('[data-origin]') || t) : null;
      if ((!el || !el.isConnected || !root.contains(el)) && s) el = root.querySelector('[data-origin="' + s + '"]');
      if (!el || !el.getBoundingClientRect) return { from: null, key: null };
      return { from: JU.fx.rectIn(el, root), key: el.getAttribute ? el.getAttribute('data-origin') : null };
    };
    /* the element that marks `key` as an origin — scrolled into view inside its own scroller when it moved off-screen (a row that
       changed group lands somewhere else); null when it is gone (the concept then fades instead of flying) */
    p._originRect = function (key, memoKey) {
      var root = this.rootRef && this.rootRef.current; if (!root || !key || !JU.fx) return null;
      var el = root.querySelector('[data-origin="' + key + '"]'); if (!el) return null;
      /* opt-in: a concept whose under page is still transformed when back() runs (pushed off-screen, scaled, bands moved away)
         marks the scroller (or an ancestor) data-measure="layout"; the row and the visible window are then measured in layout
         coordinates (offset chain, transforms ignored) — where the row will be once the page has settled (C08 report: the
         transformed home put the soft reveal ~640px off) */
      var lay = !!(el.closest && el.closest('[data-measure="layout"]'));
      this.reveal(el, false, { soft: true, memoKey: memoKey, layout: lay }); return lay ? this._layoutRectIn(el, root) : JU.fx.rectIn(el, root);
    };
    /* transform-free rect of el inside root (same shape as JU.fx.rectIn): offset chain minus the scroll offsets in between;
       falls back to the visual rect when el is not laid out (display:none / fixed) */
    p._layoutRectIn = function (el, root) {
      if (!el.offsetParent && el !== root) return JU.fx.rectIn(el, root);
      var a = layoutXY(el), b = layoutXY(root), sx = 0, sy = 0, n = el.parentElement;
      while (n && n !== root) { sx += n.scrollLeft || 0; sy += n.scrollTop || 0; n = n.parentElement; }
      return { x: a.x - b.x - sx, y: a.y - b.y - sy, w: el.offsetWidth, h: el.offsetHeight };
    };
    /* put the under page's scrollers back where they were NOW (before measuring the origin), so the return lands on the real
       final position and the settle-time restore has nothing left to move (no visible double scroll) */
    p._restoreNow = function (key) {
      var root = this.rootRef && this.rootRef.current; var memo = key != null && (this._scrollMemo || {})[key]; if (!root || !memo) return;
      Object.keys(memo).forEach(function (k) { var el = root.querySelector('[data-scroller="' + k + '"]'); if (el && el.getAttribute('data-restore') !== 'manual' && Math.abs(el.scrollTop - memo[k]) > 0.5) el.scrollTop = memo[k]; });
    };
    p._navSettle = function () {
      var nav = this.state.nav; this.cancelKey('nav');
      if (nav.phase === 'exit') { var stack = nav.stack.slice(0, -1); this._pendingRestore = this._scrollKey(stack[stack.length - 1]); nav = { stack: stack, phase: 'idle', dir: 'back', seq: nav.seq, leaving: null }; }
      else nav = assign(nav, { phase: 'idle', leaving: null });
      this.state.nav = nav; return nav;
    };
    p._runPhases = function (dir) {
      var self = this;
      this.afterKey('nav', 20, function () {
        var r = self.rootRef && self.rootRef.current; if (r) void r.offsetHeight;
        self.setState(function (st) { return { nav: assign(st.nav, { phase: 'in' }) }; });
        self.afterKey('nav', self.navMs(dir), function () { self.setState(function (st) { return { nav: assign(st.nav, { phase: 'idle', leaving: null }) }; }); });
      });
    };
    /* ---------------- navigation ---------------- */
    p.go = function (s, params, ev) {
      var nav = this.state.nav; if (!nav) return;
      if (nav.phase !== 'idle') nav = this._navSettle();
      params = params || {};
      var cur = nav.stack[nav.stack.length - 1]; if (cur && cur.s === s && JSON.stringify(cur.p || {}) === JSON.stringify(params)) return;
      var o = this._originOf(ev, s); this._captureScroll();
      var seq = nav.seq || 1; var stack = nav.stack.slice();
      var path = this._paths()[s] || ['home', s]; var parents = path.slice(1, -1);
      parents.forEach(function (ps) { if (!stack.some(function (e) { return e.s === ps; })) stack.push({ s: ps, p: assign(params), from: null, key: o.key, id: ++seq }); });   /* an inserted parent (home → manage puts detail under it) keeps the origin row's key, so backing out through it still reveals that row (C10 report) */
      var entry = { s: s, p: params, from: o.from, key: o.key, id: ++seq }; stack.push(entry);
      var patch = { nav: { stack: stack, phase: 'enter', dir: 'fwd', seq: seq, leaving: null }, sheet: null };
      this.setState(patch); this._enterApply(s, entry.p); this._runPhases('fwd');
      var self = this; this.lastMotion = { name: 'go:' + s, fn: function () { if (self._top().s !== s) return; self.back(); self.afterKey('replay', self.navMs('back') + 60, function () { self.go(s, params, null); }); } };
      if (this.onNav) this.onNav('go', s, entry.p);
    };
    p.replace = function (s, params, ev) {
      var nav = this.state.nav; if (!nav) return;
      if (nav.phase !== 'idle') nav = this._navSettle();
      var top = nav.stack[nav.stack.length - 1]; params = params || {};
      if (top.s === s && JSON.stringify(top.p) === JSON.stringify(params)) return;
      var o = this._originOf(ev, s); this._captureScroll(); this._leaveApply(top.s);
      var id = (nav.seq || 1) + 1; var entry = { s: s, p: params, from: o.from, key: o.key, id: id };
      var patch = { nav: { stack: nav.stack.slice(0, -1).concat([entry]), phase: 'enter', dir: 'swap', seq: id, leaving: top.s !== s ? top : null }, sheet: null };
      this.setState(patch); this._enterApply(s, entry.p); this._runPhases('swap');
      if (this.onNav) this.onNav('replace', s, entry.p);
    };
    p.back = function () {
      var nav = this.state.nav; if (!nav) return false;
      if (nav.phase === 'exit') nav = this._navSettle();
      if (nav.stack.length < 2) return false;
      var top = nav.stack[nav.stack.length - 1]; var under = nav.stack[nav.stack.length - 2];
      this.cancelKey('nav'); this._leaveApply(top.s);
      /* the origin may have moved (a row that changed group) or be gone: re-measure it so the exit lands on the real row */
      var self = this; var revealKey = this._scrollKey(under); this._restoreNow(revealKey);
      var from = top.key ? this._originRect(top.key, revealKey) : null; var stack = nav.stack.slice(); stack[stack.length - 1] = assign(top, { from: from || null });
      this.setState({ nav: assign(nav, { stack: stack, phase: 'exit', dir: 'back', leaving: null }), sheet: null });
      this.afterKey('nav', this.navMs('back'), function () {
        self._pendingRestore = revealKey;
        self.setState(function (st) { var sk = st.nav.stack.slice(0, -1); return { nav: { stack: sk, phase: 'idle', dir: 'back', seq: st.nav.seq, leaving: null }, ui: assign(st.ui, { landKey: top.key || null }) }; });
        if (top.key) self.holdKey('land', 1100, function () { self._ui({ landKey: null }); });
      });
      if (this.onNav) this.onNav('back', under.s, under.p);
      return true;
    };
    p.home = function () { if (this.state.nav && this.state.nav.stack.length === 2 && this.state.nav.phase !== 'exit') return this.back();   /* one level deep: same exit motion as back() (C06: in-place layouts fold) */
      var top = this._top(); this.cancelKey('nav'); if (top.s !== 'home') this._leaveApply(top.s); var id = (this.state.nav.seq || 1) + 1; this._pendingRestore = 'home:' + this.state.role + ':' + this.state.section; this.setState({ nav: { stack: [{ s: 'home', p: {}, from: null, key: null, id: id }], phase: 'idle', dir: 'back', seq: id, leaving: null }, sheet: null }); };
    p.setTopParams = function (patch) { this.setState(function (st) { var sk = st.nav.stack.slice(); var top = sk[sk.length - 1]; sk[sk.length - 1] = assign(top, { p: assign(top.p, patch) }); return { nav: assign(st.nav, { stack: sk }) }; }); };
    /* role / section: the home surface stays on the stack; the phase + dir tell the concept what moved */
    p.setRole = function (k) {
      if (k !== 'joined' && k !== 'hosted') return; var s = this.state; if (s.role === k) return;
      if (s.nav.phase !== 'idle') this._navSettle();
      this._captureScroll(); var sec = (s.ui.memo && s.ui.memo[k]) || 'current'; if (k === 'joined' && sec === 'drafts') sec = 'current';
      this._pendingRestore = 'home:' + k + ':' + sec;
      this.setState(function (st) { return { role: k, section: sec, ui: assign(st.ui, { prevRole: st.role, prevSection: st.section, result: null }), nav: assign(st.nav, { phase: 'enter', dir: 'role' }), sheet: null }; });
      this._runPhases('role'); if (this.onNav) this.onNav('role', k, { section: sec });
    };
    p.setSection = function (k) {
      var s = this.state; if (s.section === k) return; if (k === 'drafts' && s.role !== 'hosted') return;
      if (s.nav.phase !== 'idle') this._navSettle();
      this._captureScroll(); this._pendingRestore = 'home:' + s.role + ':' + k;
      this.setState(function (st) { var memo = assign(st.ui.memo); memo[st.role] = k; return { section: k, ui: assign(st.ui, { memo: memo, prevRole: st.role, prevSection: st.section }), nav: assign(st.nav, { phase: 'enter', dir: 'swap' }), sheet: null }; });
      this._runPhases('swap'); if (this.onNav) this.onNav('section', k, {});
    };
    /* entering / leaving a surface */
    p._enterApply = function (s, params) {
      var self = this; var d = this.state.data;
      if (s === 'ticket' || s === 'reply') {
        var it = jitem(d, params.eventId); var e = it && d.events[it.eventId];
        var key = e ? it.eventId + ':' + (s === 'reply' ? e.version : (it.ticket ? it.ticket.version : e.version)) : null;
        var hasTicket = !!(it && e && (s === 'reply' ? it.stage === 'reschedule' : (it.ticket && !it.ticket.void && (it.stage === 'tear' || it.stage === 'contact' || it.stage === 'going'))));
        var needPrint = hasTicket && key && !this.state.ui.ticket.printed[key] && !(it.ticket && it.ticket.torn && s !== 'reply');
        var tornIn = s === 'ticket' && hasTicket && !!(it.ticket && it.ticket.torn) && (it.stage === 'contact' || it.stage === 'going');   /* a ticket torn earlier opens with its contact layer (contact and going alike — C04: going had no way in) */
        this._uiIn('ticket', { printing: needPrint ? key : null, tear: { progress: 0, active: false, done: false, error: '' }, contactOpen: !!(params.contact) || tornIn });
        this._ui({ result: null });
        if (needPrint && !ritual('print')) this.afterKey('print', this.printMs || 2300, function () { self.ticketPrinted(key); });
      }
      if (s === 'read') { this._uiIn('read', { eventId: params.eventId, progress: 0, done: false, doneAt: 0 }); this._ui({ result: null }); }
      if (s === 'detail' || s === 'waitlist') this._ui({ result: null });
      if (s === 'history') {
        var hi = jitem(d, params.eventId); var burnable = !!(hi && (hi.stage === 'cancelled' || hi.stage === 'exited' || hi.stage === 'declined') && hi.ticket);
        var play = burnable && !this.state.ui.burned[params.eventId];
        this._ui({ burn: play ? { eventId: params.eventId, playing: true } : null, result: null });
        if (play && !ritual('burn')) this.afterKey('burn', this.burnMs || 6600, function () { self.burnDone(params.eventId); });
      }
      if (s === 'manage') {
        this.settleNow();
        var open = assign({ apps: true, replies: true, members: true, queue: true, leaves: false, attendance: true, arrange: true }, params.open || {});
        this._uiIn('manage', { open: open, editing: {}, focus: params.focus || null, next: null }); this._pendingSection = params.focus || null;
      }
    };
    p._leaveApply = function (s) {
      if (s === 'ticket' || s === 'reply') { this.cancelKey('print'); this.cancelKey('contact'); this.cancelKey('tear-burn'); this._tearRig = null; this._uiIn('ticket', { printing: null, contactOpen: false, tear: { progress: 0, active: false, done: false, error: '' } }); }
      if (s === 'history') { this.cancelKey('burn'); }
      this._ui({ result: null, busy: {}, errors: {} });
    };
    /* ---------------- after render ---------------- */
    p._ctlAfterUpdate = function () {
      var root = this.rootRef && this.rootRef.current; if (!root || !this.state.nav) return;
      var self = this;
      if (this._resetScrollers) { this._resetScrollers = false; this._scrollMemo = {}; root.querySelectorAll('[data-scroller]').forEach(function (el) { el.scrollTop = 0; }); }   /* jumpTo / reset start every list at the top (C06 report) */
      if (this._pendingRestore != null) {
        var pkey = this._pendingRestore; var memo = (this._scrollMemo || {})[pkey]; this._pendingRestore = null;
        if (memo) Object.keys(memo).forEach(function (k) { var el = root.querySelector('[data-scroller="' + k + '"]'); if (el && el.getAttribute('data-restore') !== 'manual') el.scrollTop = memo[k]; });   /* data-restore="manual": the concept places this scroller itself (in-place layouts, C06) */
        else if (String(pkey).indexOf('home:') === 0) { var hs = root.querySelector('[data-scroller="home"]'); if (hs && hs.getAttribute('data-restore') !== 'manual') hs.scrollTop = 0; }   /* first visit of a role / section starts at the top instead of keeping the other list's offset (C02 verify m3) */
      }
      root.querySelectorAll('[data-scroller]').forEach(function (el) { if (el.getAttribute('data-hc') !== 'manual') self._applyHc(el); });   /* data-hc="manual": the concept writes --hc itself (C03 window swap) — scroll events still write it */
      if (this._pendingSection) { var sec = root.querySelector('[data-section="' + this._pendingSection + '"]'); this._pendingSection = null; if (sec) this.reveal(sec, true); }
      /* a read layer short enough not to scroll counts as read to the end */
      if (this._top().s === 'read' && !this.state.ui.read.done) { var rs = root.querySelector('[data-scroller="read"]'); if (rs && rs.scrollHeight <= rs.clientHeight + 4) this.readScroll({ currentTarget: rs }); }
      if (this._focusSheet && this.state.sheet) { var sr = this._sheetRef && this._sheetRef.current; if (sr && sr.isConnected) { this._focusSheet = false; var first = sr.querySelector('[data-autofocus]') || sr.querySelector(FOCUSABLE); if (first) { try { first.focus({ preventScroll: true }); } catch (e) { try { first.focus(); } catch (e2) { } } } } }
      if (this._restoreFocus && !this.state.sheet) { var t = this._restoreFocus; this._restoreFocus = null; if (t && t.isConnected && t.focus) { try { t.focus({ preventScroll: true }); } catch (e) { } } }
      if (this._focusAtt) { var sel = '[data-rid="' + this._focusAtt + '"] [data-act="attend-present"],[data-rid="' + this._focusAtt + '"] button'; var b = root.querySelector(sel); this._focusAtt = null; if (b) { this.reveal(b); try { b.focus({ preventScroll: true }); } catch (e) { } } }
      this._tickLoop();
    };
    /* reveal(el, top, opts): bring el into view inside its own [data-scroller].
       top:true  → section focus: its top goes to the visible top + its own CSS scroll-margin-top (default 8px) + the height of a
                   sticky [data-header] inside the scroller, and only when it is not already in the upper 60% of the view
       opts.soft → return-to-origin: scroll only when less than half of el is visible (a row 12px from the edge stays put)
       opts.memoKey → keep the scroll memo of that page in sync with the new position (no fight with the settle restore) */
    p.reveal = function (el, top, opts) {
      opts = opts || {};
      var root = this.rootRef && this.rootRef.current; if (!el || !root) return;
      var sc = el.closest && el.closest('[data-scroller]');
      var ph = root.closest ? (root.closest('.ju-phone') || root) : root; var pr = ph.getBoundingClientRect();
      var kb = parseFloat((global.getComputedStyle ? getComputedStyle(root).getPropertyValue('--kb') : '') || '0') || 0;
      if (sc) {
        var s = sc.getBoundingClientRect(), r = el.getBoundingClientRect(); var t0 = Math.max(s.top, pr.top), b0 = Math.min(s.bottom, pr.bottom - kb);
        var before = sc.scrollTop;
        if (top) {
          var cs = global.getComputedStyle ? getComputedStyle(el) : null; var mt = cs ? parseFloat(cs.scrollMarginTop) || 0 : 0; if (!mt) mt = 8;
          var hd = sc.querySelector('[data-header]'); if (hd && global.getComputedStyle && /sticky|fixed/.test(getComputedStyle(hd).position)) mt += hd.getBoundingClientRect().height;
          var inUpper = r.top >= t0 + mt - 1 && r.top <= t0 + (b0 - t0) * 0.6;
          if (!inUpper) sc.scrollTop += r.top - t0 - mt;
        } else if (opts.soft && opts.layout) {
          var ly = layoutXY(el).y - layoutXY(sc).y, lh = el.offsetHeight, vt = sc.scrollTop, vb = sc.scrollTop + sc.clientHeight;
          var visL = Math.max(0, Math.min(ly + lh, vb) - Math.max(ly, vt)); if (lh > 0 && visL / lh < 0.5) sc.scrollTop += (ly + lh / 2) - (vt + vb) / 2;
        } else if (opts.soft) {
          var vis = Math.max(0, Math.min(r.bottom, b0) - Math.max(r.top, t0)); if (r.height > 0 && vis / r.height < 0.5) sc.scrollTop += (r.top + r.height / 2) - (t0 + b0) / 2;
        } else if (r.top < t0 + 12 || r.bottom > b0 - 12) sc.scrollTop += (r.top + r.height / 2) - (t0 + b0) / 2;
        if (opts.memoKey != null && sc.scrollTop !== before) { var m = (this._scrollMemo = this._scrollMemo || {}); var nm = sc.getAttribute('data-scroller'); (m[opts.memoKey] = m[opts.memoKey] || {})[nm] = sc.scrollTop; }
        this._applyHc(sc);
      }
      if (root.scrollTop) root.scrollTop = 0; if (ph !== root && ph.scrollTop) ph.scrollTop = 0;
    };
    p._applyHc = function (el) {
      var rng = this.headerRange || 96; var hc = clamp(el.scrollTop / rng, 0, 1).toFixed(3);
      el.style.setProperty('--hc', hc); var surf = el.closest && el.closest('[data-surface]'); if (surf && surf !== el) surf.style.setProperty('--hc', hc);
      var hd = surf && surf.querySelector('[data-header]'); if (hd) hd.style.setProperty('--hc', hc);
    };
    p.scrollTop = function (name) { var root = this.rootRef && this.rootRef.current; var sc = root && root.querySelector('[data-scroller="' + name + '"]'); if (sc) { try { sc.scrollTo({ top: 0, behavior: this.isRM() ? 'auto' : 'smooth' }); } catch (e) { sc.scrollTop = 0; } this._applyHc(sc); } };
    var ownDU = Object.prototype.hasOwnProperty.call(p, 'componentDidUpdate') ? p.componentDidUpdate : null;
    p.componentDidUpdate = function (pp, ps) { this._ctlAfterUpdate(); if (ownDU) ownDU.call(this, pp, ps); };
    var ownDM = Object.prototype.hasOwnProperty.call(p, 'componentDidMount') ? p.componentDidMount : null;
    p.componentDidMount = function () { this._ctlAfterUpdate(); if (ownDM) ownDM.call(this); };

    /* ---------------- engine + effects ---------------- */
    p.act = function (name, payload) {
      var res = JU.engine[name](this.state.data, payload || {});
      this.setState({ data: res.data });
      var e = res.effect; if (e && e.type !== 'error' && e.type !== 'noop' && e.type !== 'flag' && e.type !== 'invalid') { this._emit(e); (e.promoted || []).forEach(this._emit, this); }
      return res;
    };
    p._emit = function (effect) { var self = this; var seq = (this._fxSeq = (this._fxSeq || 0) + 1); var fx = assign(effect, { seq: seq, at: Date.now() }); this._ui({ fx: fx }); if (this.onEffect) { this.onEffect(fx); if (fx.type !== 'printed' && fx.type !== 'settled') this.lastMotion = { name: 'fx:' + fx.type, fn: function () { self._ui({ fx: assign(fx, { seq: (self._fxSeq = self._fxSeq + 1), replay: true }) }); self.onEffect(assign(fx, { replay: true })); } }; } return fx; };
    /* a write that simulates a request: 处理中 for ≥ processMs (real time, also under reduced motion), then the engine; the result
       (data + effect, or the error) is handed to done(res) */
    p._run = function (key, name, payload, done) {
      var self = this; if (this.state.ui.busy[key]) return;
      this.setState(function (s) { var b = assign(s.ui.busy), er = assign(s.ui.errors); b[key] = true; er[key] = ''; return { ui: assign(s.ui, { busy: b, errors: er }) }; });
      this.holdKey('busy:' + key, this.processMs || 360, function () {
        var res = self.act(name, payload);
        self.setState(function (s) { var b = assign(s.ui.busy), er = assign(s.ui.errors); delete b[key]; if (res.effect.type === 'error') er[key] = res.effect.message || '这一步没有生效，请刷新后重试。'; else delete er[key]; return { ui: assign(s.ui, { busy: b, errors: er }) }; });
        if (done) done(res);
      });
    };
    p.settleNow = function () {
      var r = JU.engine.settle(this.state.data); if (!r.effects.length) return r;
      this.setState(function (s) { return { data: r.data, ui: assign(s.ui, { settled: (s.ui.settled || 0) + 1 }) }; });
      r.effects.forEach(this._emit, this); return r;
    };
    p._needsTick = function () {
      var s = this.state, d = s.data; if (!s.nav || !d) return false; var top = this._top();
      if (top.s === 'home') { if (s.section !== 'current') return false; return s.role === 'joined' ? d.joined.some(function (it) { return it.deadline && (it.stage === 'invited' || it.stage === 'invited_queue'); }) : d.hosted.some(function (it) { var e = d.events[it.eventId]; return e && e.status === 'open' && it.members.some(function (m) { return m.status === 'invited' && m.deadline; }); }); }
      if (top.s === 'detail' || top.s === 'read' || top.s === 'waitlist') { var it = jitem(d, top.p.eventId); return !!(it && ((it.deadline && (it.stage === 'invited' || it.stage === 'invited_queue')) || it.members.some(function (m) { return m.status === 'invited' && m.deadline; }))); }
      if (top.s === 'manage') { var hm = hitem(d, top.p.eventId); var e2 = hm && d.events[hm.eventId]; return !!(hm && e2 && e2.status === 'open' && hm.members.some(function (m) { return m.status === 'invited' && m.deadline; })); }
      return false;
    };
    p._tickLoop = function () {
      var self = this; if (this._keyed && this._keyed.tick) return; if (!this._needsTick()) return;
      var step = function () { if (!self._needsTick()) return; if (JU.dueCount(self.state.data)) self.settleNow(); self._ui({ tick: (self.state.ui.tick || 0) + 1 }); self.holdKey('tick', 1000, step); };
      this.holdKey('tick', 1000, step);
    };

    /* ---------------- feedback ---------------- */
    p.say = function (text, kind) { var self = this; var id = (this._toastSeq = (this._toastSeq || 0) + 1); this.setState({ toast: { text: text, kind: kind || 'info', id: id } }); this.holdKey('toast', kind === 'error' ? 3600 : 2600, function () { self.setState(function (s) { return s.toast && s.toast.id === id ? { toast: null } : null; }); }); };
    p._copyDone = function (key, text, ok, okText, armed, quietOk, inPlace) {
      var self = this;
      if (armed) { this.setState(function (s) { return { data: JU.engine.setCopyFailNext(s.data, { on: false }).data }; }); ok = false; }
      this._ui({ copy: { key: key, text: text, ok: ok, at: Date.now() } });
      if (ok) { if (!quietOk && !inPlace) this.say(okText || '已复制', 'ok'); this.holdKey('copy:' + key, 2600, function () { self._clearCopy(key); }); }   /* quietOk: the shared module already shows「✓ 已复制」in place — no second toast */
      else { if (!quietOk) this.say('未能复制，长按手动复制', 'error'); this.holdKey('copy:' + key, 8000, function () { self._clearCopy(key); }); }   /* via the shared module its own line「复制失败，请长按账号复制」is the feedback (C04: three messages at once) — no toast */
      return ok;
    };
    p.copy = function (text, key, okText, inPlace) {   /* inPlace: the view shows copyState(key).label beside the button — success needs no toast (C03: toast + label at once); failure keeps the toast for the manual-copy hint */
      var self = this; key = key || 'copy'; var armed = !!(this.state.data.flags && this.state.data.flags.copyFailNext);
      var done = function (ok) { self._copyDone(key, text, ok, okText, armed, false, inPlace); };
      try { if (global.navigator && navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(function () { done(true); }, function () { done(false); }); else done(false); } catch (e) { done(false); }
    };
    /* copyVia(run): the clipboard call belongs to a shared module (JURitual.contact handle.copy → Promise<boolean>); the panel's
       「下一次复制失败」 is honoured by letting exactly that one writeText reject, so the module shows its own failure line too */
    p.copyVia = function (run, key, text, okText) {
      var self = this; key = key || 'copy'; var armed = !!(this.state.data.flags && this.state.data.flags.copyFailNext);
      var clip = global.navigator && navigator.clipboard; var patched = false;
      if (armed && clip) { try { Object.defineProperty(clip, 'writeText', { configurable: true, writable: true, value: function () { return Promise.reject(new Error('armed copy failure')); } }); patched = true; } catch (e) { } }
      var restore = function () { if (patched) { patched = false; try { delete clip.writeText; } catch (e) { } } };
      var pr; try { pr = Promise.resolve(run()); } catch (e) { pr = Promise.resolve(false); }
      return pr.then(function (ok) { restore(); return self._copyDone(key, text, !!ok, okText, armed, true); }, function () { restore(); return self._copyDone(key, text, false, okText, armed, true); });
    };
    p._clearCopy = function (key) { this.setState(function (s) { return s.ui.copy && s.ui.copy.key === key ? { ui: assign(s.ui, { copy: null }) } : null; }); };
    p.copyState = function (key) { var self = this; var c = this.state.ui.copy; var mine = c && c.key === key; return { copied: !!(mine && c.ok), failed: !!(mine && !c.ok), text: mine ? c.text : '', label: mine ? (c.ok ? '已复制' : '未能复制 · 重试') : '复制', retry: function () { if (mine) self.copy(c.text, key, null, true); } }; };

    /* ---------------- sheets + focus ---------------- */
    p.openSheet = function (sheet, ev) {
      var t = ev && (ev.currentTarget || ev.target); this._sheetTrigger = t && t.focus ? t : null; this._focusSheet = true;
      this._sheetRef = this._sheetRef || { current: null };
      this.setState({ sheet: assign(sheet, { id: (this._sheetSeq = (this._sheetSeq || 0) + 1), busy: false, error: '', done: false }) });
    };
    /* NB: never re-read this.state right after a setState in the same tick — Preact applies it at render time (the busy guard is in sheetCancel, which runs on a fresh click) */
    p.closeSheet = function (keepFocus) { this.cancelKey('busy:sheet'); if (!keepFocus) this._restoreFocus = this._sheetTrigger; this._sheetTrigger = null; this.setState({ sheet: null }); };
    p._sheetSet = function (patch) { this.setState(function (s) { return s.sheet ? { sheet: assign(s.sheet, patch) } : null; }); };
    p.sheetKey = function (ev) {
      var sh = this.state.sheet; if (!sh) return;
      if (ev.key === 'Escape') { ev.preventDefault(); this.sheetCancel(); return; }
      if (ev.key !== 'Tab') return; var sr = this._sheetRef && this._sheetRef.current; if (!sr) return;
      var list = Array.prototype.filter.call(sr.querySelectorAll(FOCUSABLE), function (el) { return el.offsetParent !== null || el.getClientRects().length; }); if (!list.length) { ev.preventDefault(); return; }
      var doc = sr.getRootNode ? sr.getRootNode() : global.document; var cur = doc.activeElement; var i = list.indexOf(cur);
      if (ev.shiftKey) { if (i <= 0) { ev.preventDefault(); list[list.length - 1].focus(); } } else if (i < 0 || i === list.length - 1) { ev.preventDefault(); list[0].focus(); }
    };
    p.sheetCancel = function () { var sh = this.state.sheet; if (!sh) return; if (sh.busy) return; this.closeSheet(); };
    /* every sheet's primary action: 处理中 in the sheet → engine → close on success, error in place (重试 = the same button) */
    p.sheetOk = function () {
      var sh = this.state.sheet, self = this; if (!sh || sh.busy) return; var d = this.state.data;
      var finish = function (res, after) { var e = res.effect; if (e.type === 'error') { self._sheetSet({ busy: false, error: e.message || '这一步没有生效，请刷新后重试。' }); return; } self._sheetSet({ busy: false, error: '' }); if (after) after(e, res.data); };
      var run = function (name, payload, after) { self._sheetSet({ busy: true, error: '' }); self.holdKey('busy:sheet', self.processMs || 360, function () { finish(self.act(name, payload), after); }); };
      if (sh.kind === 'confirm') {
        var map = { withdraw: 'withdrawApplication', release: 'releaseReservation', exit: 'exitEvent', decline: 'declineReschedule', leaveQueue: 'leaveWaitlist' };
        var titles = { withdraw: ['已撤回', '申请已撤回'], release: ['已退出这局', '已放弃预留 · 不记主动失约'], exit: ['已退出这局', '主动退出 · 票根与联系已关闭'], decline: ['拒绝改期', '未接受局主的新时间，位置已释放。'], leaveQueue: ['已退出候补', '退出候补 · 不记缺席'] };
        run(map[sh.sub], { eventId: sh.eventId }, function (e) {
          var t = titles[sh.sub]; var burn = !!e.burn && !self.state.ui.burned[sh.eventId];
          self._ui({ result: { eventId: sh.eventId, kind: e.type, sub: sh.sub, title: t[0], body: t[1], burn: burn, burning: burn } });
          self.closeSheet(true);
          if (burn && !ritual('burn')) self.afterKey('tear-burn', self.burnMs || 6600, function () { self.burnDone(sh.eventId); });
        });
        return;
      }
      if (sh.kind === 'reschedule') {
        var iso = isoOf(sh.date, sh.time);
        run('propose', { eventId: sh.eventId, newIso: iso }, function (e) {
          self.closeSheet(); self.say(e.asked ? '已改时间 · 等 ' + e.asked + ' 位成员答复' : '已改时间', 'ok');
          self._uiIn('manage', { open: assign(self.state.ui.manage.open, { replies: true }) }); self._pendingSection = 'replies';   /* reveal only — a scrollTop here fought the reveal (C10: two scrolls after 改时间 / 记为散场) */
        });
        return;
      }
      if (sh.kind === 'cancel') { run('cancel', { eventId: sh.eventId }, function () { self.closeSheet(); self.scrollTop('manage'); }); return; }
      if (sh.kind === 'end') { run('end', { eventId: sh.eventId }, function (e, data) { self.closeSheet(); self.setTopParams({ intent: 'attendance' }); self._uiIn('manage', { open: assign(self.state.ui.manage.open, { attendance: true }), next: e.toRecord ? (self._firstUnrecorded(sh.eventId, data) || null) : null }); self._pendingSection = 'attendance'; }); return; }
      if (sh.kind === 'record') {
        var text = (sh.text || '').trim(); if (text.length < 4) { this._sheetSet({ error: '请至少写 4 个字' }); return; }
        run('addRecord', { eventId: sh.eventId, kind: 'report', text: '你补充：' + text }, function () { self._sheetSet({ done: true, text: text }); });
        return;
      }
      if (sh.kind === 'card' || sh.kind === 'contact') { this.closeSheet(); }
    };
    p.sheetInput = function (field, v) { var patch = {}; patch[field] = v; patch.error = ''; this._sheetSet(patch); };
    p._firstUnrecorded = function (eventId, data) { var m = JU.derive.manage(data || this.state.data, eventId); var a = m && m.attendees.filter(function (x) { return !x.attendance; })[0]; return a ? a.id : null; };

    /* ---------------- participant actions ---------------- */
    p.readScroll = function (ev) {
      var el = ev.currentTarget || ev.target; if (!el) return; this._applyHc(el);
      var max = el.scrollHeight - el.clientHeight; var prog = max <= 2 ? 1 : clamp((el.scrollTop) / max, 0, 1); var atEnd = max <= 4 || el.scrollTop + el.clientHeight >= el.scrollHeight - 8;
      var r = this.state.ui.read; if (Math.abs(prog - r.progress) < 0.01 && (!atEnd || r.done)) return;
      this._uiIn('read', { progress: prog, done: r.done || atEnd, doneAt: r.done ? r.doneAt : (atEnd ? JU.now() : 0) });
    };
    p.readConfirm = function (eventId) {
      var self = this; if (!this.state.ui.read.done) return;
      this._run('confirm', 'confirmReservation', { eventId: eventId }, function (res) {
        var e = res.effect; if (e.type === 'error') return;
        var formed = !!e.formed; if (formed) self._emit({ type: 'formed', eventId: eventId });
        self._ui({ result: { eventId: eventId, kind: 'confirmed', formed: formed, title: formed ? '已确认 · 已成局' : '已确认', body: formed ? '全员到齐，票根已出' : '等其他人确认，全员（含局主）到齐后出票' } });
      });
    };
    p.ticketPrinted = function (key) { var tk = this.state.ui.ticket; if (tk.printing !== key && tk.printed[key]) return; this.cancelKey('print'); var pr = assign(tk.printed); pr[key] = true; this._uiIn('ticket', { printed: pr, printing: null }); this._emit({ type: 'printed', key: key }); };
    p.tearDown = function (ev) {
      var tk = this.state.ui.ticket; if (tk.tear.done || tk.printing) return; if (ev.button != null && ev.button !== 0) return;
      try { ev.currentTarget.setPointerCapture(ev.pointerId); } catch (e) { }
      this._tearStart = { x: ev.clientX, y: ev.clientY }; this._uiIn('ticket', { tear: assign(tk.tear, { active: true, progress: 0, error: '' }) });
    };
    p.tearMove = function (ev) {
      var tk = this.state.ui.ticket; if (!tk.tear.active || !this._tearStart) return; var sp = this.tearSpec || { dist: 160, kx: -1, ky: 1.2 };
      var dx = ev.clientX - this._tearStart.x, dy = ev.clientY - this._tearStart.y; var prog = clamp((dx * (sp.kx == null ? -1 : sp.kx) + dy * (sp.ky == null ? 1.2 : sp.ky)) / (sp.dist || 160), 0, 1);
      if (Math.abs(prog - tk.tear.progress) < 0.005) return; this._uiIn('ticket', { tear: assign(tk.tear, { progress: prog }) });
    };
    p.tearUp = function (ev, cancel) {
      var tk = this.state.ui.ticket; if (!tk.tear.active) return; this._tearStart = null; var threshold = this.tearThreshold || 0.5;
      if (!cancel && tk.tear.progress >= threshold) { this._suppressClick = true; this.tearNow(); return; }
      this._uiIn('ticket', { tear: assign(tk.tear, { active: false, progress: 0 }) });
    };
    /* the WRITE of a tear (撕裂前沿到右端 = detach): synchronous, returns true on success, false when the engine refused (the stub then
       snaps back and the error line shows). The shared tear rig calls this from its onDetach; the plain path calls it from tearNow(). */
    p.tearCommit = function () {
      var top = this._top(); var d = this.state.data; var it = jitem(d, top.p.eventId); var tk = this.state.ui.ticket;
      if (!it || tk.printing) return false; var reply = top.s === 'reply' || it.stage === 'reschedule';
      if (tk.tear.done || (it.ticket && it.ticket.torn && !reply) || (reply && it.reschedule && it.reschedule.answered)) return true;   /* already torn: a replayed fall writes nothing */
      var name = reply ? 'acceptReschedule' : 'tearTicket';
      if (!reply && it.stage !== 'tear') return false;
      var res = this.act(name, { eventId: it.eventId });
      if (res.effect.type === 'error') { this._uiIn('ticket', { tear: { progress: 0, active: false, done: false, error: reply ? '新时间未保存，请重新撕下副券' : '未能保存，请重新撕下副券' } }); return false; }
      this._uiIn('ticket', { tear: { progress: 1, active: false, done: true, error: '' } });
      this._emit({ type: 'torn', eventId: it.eventId, reply: reply });
      if (reply) this.say('已接受改期 · 按新票根的时间见', 'ok');
      return true;
    };
    /* the shared rig (JURitual.tear handle) registers here; tearNow() then runs its keyboard path (trigger) instead of the plain write */
    p.registerTear = function (handle) { this._tearRig = handle || null; };
    /* the keyboard / button equivalent of the gesture (Enter / Space on the stub, or a 撕开票根 button): same write, same fall */
    p.tearNow = function () {
      var self = this; var tk = this.state.ui.ticket; if (tk.tear.done || tk.printing) return;
      var rig = this._tearRig; if (rig && rig.trigger && !rig.done) { rig.trigger(); return; }
      if (!this.tearCommit()) return;
      this.afterKey('contact', 300, function () { self._uiIn('ticket', { contactOpen: true }); });
    };
    p.tearKey = function (ev) { if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); this.tearNow(); } };
    p.markContacted = function (eventId) { this._run('contacted', 'markContacted', { eventId: eventId }); };
    p.burnDone = function (eventId) { this.cancelKey('burn'); this.cancelKey('tear-burn'); var b = assign(this.state.ui.burned); b[eventId] = true; var patch = { burned: b }; if (this.state.ui.burn && this.state.ui.burn.eventId === eventId) patch.burn = null; if (this.state.ui.result && this.state.ui.result.eventId === eventId) patch.result = assign(this.state.ui.result, { burning: false }); this._ui(patch); };
    p.openConfirm = function (sub, eventId, ev) { var c = { withdraw: 'withdraw', release: 'release', exit: 'exit', decline: 'decline', leaveQueue: 'leaveQueue' }[sub]; if (!c) return; this.openSheet({ kind: 'confirm', sub: sub, eventId: eventId }, ev); };
    /* ---------------- host actions ---------------- */
    p.approve = function (eventId, appId) { this._run('app:' + appId, 'approve', { eventId: eventId, appId: appId }); };
    p.reject = function (eventId, appId) { this._run('app:' + appId, 'reject', { eventId: eventId, appId: appId }); };
    p.attend = function (eventId, memberId, value) {
      var self = this; var res = this.act('attend', { eventId: eventId, memberId: memberId, value: value }); var e = res.effect;
      if (e.type === 'error') { this.setState(function (s) { var er = assign(s.ui.errors); er['att:' + memberId] = e.message; return { ui: assign(s.ui, { errors: er }) }; }); return; }
      var ed = assign(this.state.ui.manage.editing); delete ed[memberId];
      var fresh = assign(this.state.ui.manage.fresh); if (e.type === 'attended') fresh[memberId] = e.seq || Date.now();
      var next = this._firstUnrecorded(eventId, res.data);
      this._uiIn('manage', { editing: ed, fresh: fresh, next: next });
      this.setState(function (s) { var er = assign(s.ui.errors); delete er['att:' + memberId]; return { ui: assign(s.ui, { errors: er }) }; });
      if (e.type === 'attended') this.holdKey('stamp:' + memberId, 2500, function () { var f = assign(self.state.ui.manage.fresh); delete f[memberId]; self._uiIn('manage', { fresh: f }); });
      if (next) this._focusAtt = next;
    };
    p.correct = function (memberId) { var ed = assign(this.state.ui.manage.editing); ed[memberId] = true; this._uiIn('manage', { editing: ed }); };
    p.toggleSection = function (key) { var o = assign(this.state.ui.manage.open); o[key] = !o[key]; this._uiIn('manage', { open: o }); };
    p.openReschedule = function (eventId, ev) { var e = this.state.data.events[eventId]; var w = JU.fmt.when(e.iso); this.openSheet({ kind: 'reschedule', eventId: eventId, date: e.iso.slice(0, 10), time: w.time }, ev); };
    p.openCancel = function (eventId, ev) { this.openSheet({ kind: 'cancel', eventId: eventId }, ev); };
    p.openEnd = function (eventId, ev) { this.openSheet({ kind: 'end', eventId: eventId }, ev); };
    p.openCard = function (eventId, ev) { this.openSheet({ kind: 'card', eventId: eventId }, ev); };
    p.openRecord = function (eventId, ev) { this.openSheet({ kind: 'record', eventId: eventId, text: '' }, ev); };
    p.deleteDraft = function (draftId) {
      var self = this; var d = this.state.data; var ghostDraft = d.drafts.filter(function (x) { return x.id === draftId; })[0]; if (!ghostDraft) return;
      var hosted = JU.derive.hosted(d); var idx = hosted.drafts.map(function (x) { return x.id; }).indexOf(draftId);
      var res = this.act('deleteDraft', { draftId: draftId }); var e = res.effect; if (e.type === 'error') { this.say(e.message, 'error'); return; }
      this._ui({ undo: { draftId: draftId, title: e.title, index: e.index, at: Date.now() }, ghost: { draftId: draftId, index: idx, draft: ghostDraft } });
      this.afterKey('ghost', this.deleteMs || 260, function () { self._ui({ ghost: null }); });
      this.holdKey('undo', 10000, function () { self.act('commitUndo', {}); self._ui({ undo: null }); });
    };
    p.undoDelete = function () {
      var self = this; var u = this.state.ui.undo; if (!u) return; this.cancelKey('undo');
      var res = this.act('undoDelete', {}); if (res.effect.type === 'error') { this.say(res.effect.message, 'error'); return; }
      this._ui({ undo: null, ghost: null, restored: u.draftId }); this.afterKey('restored', this.deleteMs || 260, function () { self._ui({ restored: null }); });
    };

    /* ---------------- index mapping ---------------- */
    p.ctlJump = function (e, data) {
      var o = e.open || {}; var role = e.role || 'joined'; var section = e.section || 'current'; var d = data || this.state.data;
      var ui = JU.ctlState().ui; ui.memo = { joined: 'current', hosted: 'current' }; ui.memo[role] = section;
      var seq = (this.state.nav && this.state.nav.seq) || 1; var patch = { role: role, section: section, sheet: null, toast: null };
      var mk = function (s, pr) { return { s: s, p: pr || {}, from: null, key: null, id: ++seq }; };
      var stack = [mk('home')];
      if (o.surface) {
        var s = { contact: 'ticket', 'reschedule-reply': 'reply', withdraw: 'ticket' }[o.surface] || o.surface; var id = o.eventId;
        var it = id && jitem(d, id); var ev0 = id && d.events[id];
        if (s === 'draft') { stack.push(mk('draft', { draftId: id })); }
        else if (s === 'manage') {
          var tab = o.tab || 'members'; var intent = tab === 'applications' ? 'review' : tab === 'attendance' ? 'attendance' : 'manage';
          var sec = { applications: 'apps', members: 'members', waitlist: 'queue', contact: 'members', leaves: 'leaves', replies: 'replies', attendance: 'attendance', reschedule: 'arrange', cancel: 'arrange', end: 'arrange', card: 'arrange' }[tab] || 'members';
          ui.manage = { open: { apps: true, replies: true, members: true, queue: true, leaves: tab === 'leaves', attendance: true, arrange: true }, editing: {}, fresh: {}, focus: sec, next: null };
          stack.push(mk('manage', { eventId: id, intent: intent }));
          this._pendingSection = sec; this._sheetRef = this._sheetRef || { current: null };
          if (tab === 'reschedule' && ev0) { var w = JU.fmt.when(ev0.iso); patch.sheet = { kind: 'reschedule', eventId: id, date: ev0.iso.slice(0, 10), time: w.time, id: 1, busy: false, error: '', done: false }; }
          if (tab === 'cancel') patch.sheet = { kind: 'cancel', eventId: id, id: 1, busy: false, error: '', done: false };
          if (tab === 'end') patch.sheet = { kind: 'end', eventId: id, id: 1, busy: false, error: '', done: false };
          if (tab === 'card') patch.sheet = { kind: 'card', eventId: id, id: 1, busy: false, error: '', done: false };
          if (patch.sheet) this._focusSheet = true;
        }
        else {
          var path = this._paths()[s] || ['home', s]; path.slice(1).forEach(function (x) { stack.push(mk(x, { eventId: id })); });
          if ((s === 'ticket' || s === 'reply') && it && ev0) { var key = id + ':' + (s === 'reply' ? ev0.version : (it.ticket ? it.ticket.version : ev0.version)); ui.ticket.printed[key] = true; }
          if (o.surface === 'contact') ui.ticket.contactOpen = true;
          if (o.surface === 'withdraw' && it) { var sub = it.stage === 'pending' ? 'withdraw' : (it.stage === 'invited' || it.stage === 'invited_queue') ? 'release' : it.stage === 'reschedule' ? 'decline' : it.stage === 'waitlist' ? 'leaveQueue' : 'exit'; patch.sheet = { kind: 'confirm', sub: sub, eventId: id, id: 1, busy: false, error: '', done: false }; this._sheetRef = this._sheetRef || { current: null }; this._focusSheet = true; }
          if (s === 'history' && it) ui.burned[id] = true; /* a jumped history state shows the settled ashes; the burn plays on a real first open */
        }
      }
      patch.nav = { stack: stack, phase: 'idle', dir: 'fwd', seq: seq, leaving: null }; patch.ui = ui;
      this._pendingRestore = null; this.setState(patch);
    };

    /* ---------------- view model ---------------- */
    p.ctlVals = function () {
      var self = this, s = this.state, d = s.data, ui = s.ui, nav = s.nav, rv = s.review || {};
      var stack = nav.stack, top = stack[stack.length - 1], under = stack.length > 1 ? stack[stack.length - 2] : null;
      var ph = 'ph-' + nav.phase + ' dir-' + nav.dir; var now = JU.now();
      var on = {}, cls = {}, is = {};
      SURFACES.forEach(function (x) { on[x] = false; cls[x] = ''; is[x] = false; });
      if (under) { on[under.s] = true; cls[under.s] = 'is-under ' + ph; }
      if (nav.leaving) { on[nav.leaving.s] = true; cls[nav.leaving.s] = 'is-leaving ' + ph; }
      on[top.s] = true; cls[top.s] = 'is-top ' + ph; is[top.s] = true;
      var fr = top.from; var fromStyle = fr ? ('--fx-x:' + Math.round(fr.x) + 'px;--fx-y:' + Math.round(fr.y) + 'px;--fx-w:' + Math.round(fr.w) + 'px;--fx-h:' + Math.round(fr.h) + 'px') : '';
      var navV = { cur: top.s, prev: under ? under.s : null, depth: stack.length, phase: nav.phase, dir: nav.dir, moving: nav.phase !== 'idle', from: fr, fromStyle: fromStyle, fromKey: top.key, landKey: ui.landKey, params: top.p, title: TITLES, curTitle: TITLES[top.s] || '',
        on: on, cls: cls, is: is, back: function () { self.back(); }, home: function () { self.home(); },
        onScroll: function (ev) { self._applyHc(ev.currentTarget); },
        rootCls: ' nav-' + nav.phase + ' dir-' + nav.dir + ' at-' + top.s + (under ? ' over-' + under.s : '') + (nav.leaving ? ' leaving-' + nav.leaving.s : '') + ' role-' + s.role + ' sec-' + s.section + (s.sheet ? ' has-sheet' : '') + (s.toast ? ' has-toast' : ''),
        leavingFrom: nav.leaving && nav.leaving.from ? nav.leaving.from : null };
      var role = s.role, section = s.section;
      var joinedD = JU.derive.joined(d), hostedD = JU.derive.hosted(d);
      var inert = function (ev) { stop(ev); self.say('不在本次演示范围', 'info'); };
      /* a tap on a button INSIDE a row must not also open the row: inner actions stop propagation, and open() ignores a click whose target sits in an inner [data-act] */
      var stop = function (ev) { if (ev && ev.stopPropagation) ev.stopPropagation(); };
      var innerAct = function (ev) { var t = ev && ev.target; var a = t && t.closest ? t.closest('[data-act]') : null; return !!(a && ev.currentTarget && a !== ev.currentTarget && ev.currentTarget.contains && ev.currentTarget.contains(a)); };
      /* ---- lists ---- */
      var leftOf = function (row) { return { text: row.leftText, ratio: row.leftRatio, tone: row.leftTone, on: !!row.deadline && (row.stage === 'invited' || row.stage === 'invited_queue'), expired: !!row.deadline && row.left <= 0 }; };
      var joinedRow = function (r) {
        var id = r.id; var st = r.stage;
        var open = function (ev) { if (self._suppressClick) { self._suppressClick = false; return; } if (innerAct(ev)) return; if (st === 'ended' || r.group === 'closed') self.go('history', { eventId: id }, ev); else if (st === 'waitlist') self.go('waitlist', { eventId: id }, ev); else if (st === 'reschedule') self.go('reply', { eventId: id }, ev); else if (st === 'tear' || st === 'contact' || st === 'going') self.go('ticket', { eventId: id }, ev); else self.go('detail', { eventId: id }, ev); };
        var act = function (ev) { stop(ev); if (st === 'invited' || st === 'invited_queue') self.go('read', { eventId: id }, ev); else if (st === 'contact') self.go('ticket', { eventId: id, contact: true }, ev); else if (st === 'ended' || r.group === 'closed') self.go('history', { eventId: id }, ev); else if (st === 'waitlist') self.go('waitlist', { eventId: id }, ev); else if (st === 'reschedule') self.go('reply', { eventId: id }, ev); else if (st === 'tear' || st === 'going') self.go('ticket', { eventId: id }, ev); else self.go('detail', { eventId: id }, ev); };
        var secLabel = st === 'pending' ? '撤回' : (st === 'invited' || st === 'invited_queue' || st === 'tear' || st === 'contact' || st === 'going' || st === 'reschedule') ? '去不了了' : st === 'waitlist' ? '退出候补' : '';
        var secSub = st === 'pending' ? 'withdraw' : (st === 'invited' || st === 'invited_queue') ? 'release' : st === 'reschedule' ? 'decline' : st === 'waitlist' ? 'leaveQueue' : secLabel ? 'exit' : '';
        var secondary = secSub ? function (ev) { stop(ev); self.openConfirm(secSub, id, ev); } : null;
        var when = r.when; var deadlineText = r.deadline && (st === 'invited' || st === 'invited_queue') ? JU.fmt.deadlineCopy(r.deadline) : '';
        return assign(r, { key: id, title: r.event.title, en: r.event.en, pack: r.event.pack, hostName: r.host.name, left: leftOf(r), deadlineText: deadlineText, open: open, act: act, secondary: secondary, secondaryLabel: secLabel, secondaryKey: secSub === 'leaveQueue' ? 'leave-queue' : secSub, ctaLabel: r.cta, isLead: !!(joinedD.lead && joinedD.lead.id === id), landing: ui.landKey === 'row-' + id, originKey: 'row-' + id, whenText: when.zh, placeText: r.place.hood, seatText: '已确认 ' + r.counts.confirmed + '/' + r.counts.capacity, monthTitle: when.month + ' 月' });
      };
      var sectionsJ = function (list) { return list.map(function (g) { return { key: g.key, title: g.title, note: g.note, count: g.rows.length, rows: g.rows.map(joinedRow) }; }); };
      var jcur = joinedD.current.map(joinedRow), jhist = joinedD.history.map(joinedRow);
      var monthsOf = function (rows) { var out = [], by = {}; rows.forEach(function (r) { var k = r.when.iso ? r.when.iso.slice(0, 7) : ''; if (!by[k]) { by[k] = { key: k, title: (k ? +k.slice(5, 7) + ' 月' : ''), rows: [] }; out.push(by[k]); } by[k].rows.push(r); }); return out; };
      var joined = assign(joinedD, { groups: { act: joinedD.groups.act.map(joinedRow), soon: joinedD.groups.soon.map(joinedRow), wait: joinedD.groups.wait.map(joinedRow), kept: joinedD.groups.kept.map(joinedRow), closed: joinedD.groups.closed.map(joinedRow) }, current: jcur, history: jhist, lead: joinedD.lead ? joinedRow(joinedD.lead) : null, sections: sectionsJ(joinedD.sectionsCurrent), sectionsHistory: sectionsJ(joinedD.sectionsHistory), months: monthsOf(jhist), badgeText: joinedD.badge ? joinedD.badge + ' 项要你回应' : '',
        empty: section === 'history' ? assign({ on: jhist.length === 0 }, JU.COPY.emptyJoinedHistory, { action: { label: '回到当前', inert: false, go: function () { self.setSection('current'); } } }) : assign({ on: jcur.length === 0, kind: joinedD.emptyKind }, jhist.length ? JU.COPY.emptyJoinedRested : JU.COPY.emptyJoinedFirst, { action: { label: '去找局', inert: true, go: inert } }) });
      var hostRow = function (r) {
        var id = r.id; var intent = r.key === 'review' ? 'review' : (r.key === 'ended' && r.unrecorded) ? 'attendance' : 'manage';
        var open = function (ev) { if (innerAct(ev)) return; self.go('manage', { eventId: id, intent: intent }, ev); };
        var act = function (ev) { stop(ev); self.go('manage', { eventId: id, intent: intent }, ev); };
        return assign(r, { key: id, stateKey: r.key, title: r.event.title, en: r.event.en, pack: r.event.pack, open: open, act: act, intent: intent, ctaLabel: r.cta, isLead: !!(hostedD.lead && hostedD.lead.id === id), landing: ui.landKey === 'row-' + id, originKey: 'row-' + id, whenText: r.when.zh, placeText: r.place.hood, roster: r.seats });
      };
      var sectionsH = function (list) { return list.map(function (g) { return { key: g.key, title: g.title, note: g.note, count: g.rows.length, rows: g.rows.map(hostRow) }; }); };
      var draftRow = function (dr, cls) { return assign(dr, { key: dr.id, cls: cls || '', sourceText: dr.source ? '由「' + dr.source.title + '」再开' : '', open: function (ev) { if (innerAct(ev)) return; self.go('draft', { draftId: dr.id }, ev); }, del: function (ev) { stop(ev); self.deleteDraft(dr.id); }, continueInert: true, continueLabel: '继续编辑', originKey: 'row-' + dr.id, landing: ui.landKey === 'row-' + dr.id }); };
      var drafts = hostedD.drafts.map(function (dr) { return draftRow(dr, ui.restored === dr.id ? 'is-restored' : ''); });
      if (ui.ghost && !drafts.some(function (x) { return x.id === ui.ghost.draftId; })) { var g = hostedD.drafts; var gd = JU.derive.hosted(assign(d, { drafts: [ui.ghost.draft] })).drafts[0]; drafts.splice(Math.min(ui.ghost.index, drafts.length), 0, assign(draftRow(gd, 'is-deleting'), { ghost: true })); }
      var hcur = hostedD.current.map(hostRow), hhist = hostedD.history.map(hostRow);
      var undoLeft = ui.undo ? Math.max(0, 10 - Math.round((Date.now() - ui.undo.at) / 1000)) : 0;
      var hosted = assign(hostedD, { rows: hostedD.rows.map(hostRow), sections: sectionsH(hostedD.sectionsCurrent), sectionsHistory: sectionsH(hostedD.sectionsHistory), current: hcur, history: hhist, lead: hostedD.lead ? hostRow(hostedD.lead) : null, drafts: drafts, badgeText: hostedD.badge ? hostedD.badge + ' 项待你处理' : '',
        undo: ui.undo ? { on: true, draftId: ui.undo.draftId, text: '已删除「' + ui.undo.title + '」', label: '撤销', act: function () { self.undoDelete(); }, left: undoLeft } : { on: false, text: '', label: '撤销', left: 0 },
        empty: section === 'drafts' ? assign({ on: drafts.length === 0 }, JU.COPY.emptyDrafts, { action: { label: '去开局', inert: true, go: inert } }) : section === 'history' ? assign({ on: hhist.length === 0 }, JU.COPY.emptyHostedHistory, { action: { label: '回到当前', inert: false, go: function () { self.setSection('current'); } } }) : (hostedD.drafts.length ? assign({ on: hcur.length === 0, kind: 'drafts' }, JU.COPY.emptyHostedDrafts, { action: { label: '接着改草稿', inert: false, go: function () { self.setSection('drafts'); } } }) : assign({ on: hcur.length === 0, kind: 'first' }, JU.COPY.emptyHostedFirst, { action: { label: '去开局', inert: true, go: inert } })) });
      var roleTabs = [{ k: 'joined', label: '我参加的', badge: joinedD.badge, badgeText: joined.badgeText }, { k: 'hosted', label: '我发起的', badge: hostedD.badge, badgeText: hosted.badgeText }].map(function (t) { return assign(t, { on: t.k === role, cls: t.k === role ? 'on' : '', go: function () { self.setRole(t.k); } }); });
      var secDefs = role === 'joined' ? [{ k: 'current', label: '当前', count: joinedD.counts.current }, { k: 'history', label: '历史', count: joinedD.counts.history }] : [{ k: 'current', label: '当前', count: hostedD.counts.current }, { k: 'drafts', label: '草稿', count: hostedD.counts.drafts }, { k: 'history', label: '历史', count: hostedD.counts.history }];
      var sectionTabs = secDefs.map(function (t) { return assign(t, { on: t.k === section, cls: t.k === section ? 'on' : '', countText: t.k === 'current' ? '' : String(t.count), go: function () { self.setSection(t.k); } }); });
      var out = { nav: navV, role: role, section: section, prevRole: ui.prevRole, prevSection: ui.prevSection, setRole: function (k) { self.setRole(k); }, setSection: function (k) { self.setSection(k); }, roleTabs: roleTabs, sectionTabs: sectionTabs, joined: joined, hosted: hosted,
        home: { cls: 'role-' + role + ' sec-' + section + ' ' + (nav.dir === 'role' || nav.dir === 'swap' ? ph : ''), isJoined: role === 'joined', isHosted: role === 'hosted', isCurrent: section === 'current', isHistory: section === 'history', isDrafts: section === 'drafts' },
        rootNav: [{ k: 'find', label: '找局' }, { k: 'create', label: '开局' }, { k: 'mine', label: '我的局' }, { k: 'settings', label: '设置' }].map(function (r) { return assign(r, { on: r.k === 'mine', inert: r.k !== 'mine', cls: r.k === 'mine' ? 'on' : 'off', go: function () { if (r.k !== 'mine') inert(); else self.home(); } }); }),
        skin: rv.skin || 'cotton', ritual: { print: ritual('print'), tear: ritual('tear'), contact: ritual('contact'), burn: ritual('burn'), stamp: ritual('stamp'), skins: !!(JU.shared && JU.shared.skins) }, rm: this.isRM ? this.isRM() : false, kb: !!rv.kb, safe: !!rv.safe, zoom: !!rv.zoom, fx: ui.fx, fail: { armed: !!(d.flags && d.flags.failNext), copyArmed: !!(d.flags && d.flags.copyFailNext) },
        clock: { now: now, nowText: JU.fmt.nowText(), offsetMin: Math.round((now - JU.NOW) / 60000), demoNote: '演示日期 2026-12-17，不冒充实时', next: JU.nextDeadline(d) },
        toast: s.toast ? assign(s.toast, { on: true, cls: 'k-' + s.toast.kind }) : { on: false, text: '', kind: '', cls: '' },
        copy: function (text, key, okText) { self.copy(text, key, okText); }, copyState: function (key) { return self.copyState(key); }, say: function (t, k) { self.say(t, k); }, inert: inert, rules: JU.RULES, COPY: JU.COPY };
      /* ---- sheet ---- */
      var sh = s.sheet; this._sheetRef = this._sheetRef || { current: null };
      out.sheet = { on: false, kind: '', sub: '', focusRef: this._sheetRef, onKeyDown: function (ev) { self.sheetKey(ev); }, ok: function () { self.sheetOk(); }, cancel: function () { self.sheetCancel(); }, busy: false, error: '', done: false, okLabel: '', cancelLabel: '', title: '', body: '', irreversible: '', identity: null, affected: [], fields: null, canOk: false, danger: false, text: '', onInput: null, count: 0, max: 120, min: 4 };
      if (sh) {
        var ev1 = d.events[sh.eventId]; var ident = ev1 ? { title: ev1.title, when: JU.fmt.when(ev1.iso).zh, place: JU.fmt.place(ev1.loc).hood, pack: ev1.pack } : null;
        out.sheet = assign(out.sheet, { on: true, kind: sh.kind, sub: sh.sub || '', eventId: sh.eventId, busy: !!sh.busy, error: sh.error || '', done: !!sh.done, identity: ident, cls: 'kind-' + sh.kind + (sh.sub ? ' sub-' + sh.sub : '') });
        if (sh.kind === 'confirm') { var cp = JU.COPY[sh.sub]; out.sheet = assign(out.sheet, { title: cp.title, body: cp.body, okLabel: sh.busy ? '处理中…' : (sh.error ? '重试' : cp.ok), cancelLabel: cp.cancel, canOk: !sh.busy, danger: sh.sub === 'exit' || sh.sub === 'decline' || sh.sub === 'release', keepPrimary: sh.sub === 'exit' || sh.sub === 'decline' || sh.sub === 'release', okTone: (sh.sub === 'withdraw' || sh.sub === 'leaveQueue') ? 'ink' : 'danger' }); }
        if (sh.kind === 'reschedule') { var mm = JU.derive.manage(d, sh.eventId); var iso = isoOf(sh.date, sh.time); var valid = /^\d{4}-\d{2}-\d{2}$/.test(sh.date || '') && /^\d{2}:\d{2}$/.test(sh.time || ''); var same = valid && iso === ev1.iso;
          out.sheet = assign(out.sheet, { title: JU.COPY.reschedule.title, okLabel: sh.busy ? '处理中…' : JU.COPY.reschedule.ok, cancelLabel: JU.COPY.reschedule.cancel, canOk: valid && !same && !sh.busy && !mm.unanswered, danger: false,
            fields: { date: sh.date || '', time: sh.time || '', onDate: function (e2) { self.sheetInput('date', e2.target.value); }, onTime: function (e2) { self.sheetInput('time', e2.target.value); }, valid: valid, same: same, sameHint: same ? JU.COPY.reschedule.same : '', placeholder: '选好新的日期和时间', oldWhen: JU.fmt.when(ev1.iso), newWhen: valid && !same ? JU.fmt.when(iso) : null, newText: valid && !same ? JU.fmt.when(iso).zh : '', consequence: mm.rescheduleDesc, tz: '纽约时间', minStep: 15 } }); }
        if (sh.kind === 'cancel') { var mc = JU.derive.manage(d, sh.eventId); var af = mc.cancelAffected; var affected = [['已确认成员', af.confirmed], ['已预留', af.reserved], ['候补', af.queue], ['待审申请', af.pending]].filter(function (x) { return x[1] > 0; }).map(function (x) { return { label: x[0], n: x[1] }; });
          out.sheet = assign(out.sheet, { title: JU.COPY.cancelEvent.title, body: JU.COPY.cancelEvent.body, irreversible: JU.COPY.cancelEvent.irreversible, affected: affected, affectedTitle: '会受影响的人', okLabel: sh.busy ? '处理中…' : (sh.error ? '重试' : JU.COPY.cancelEvent.ok), cancelLabel: JU.COPY.cancelEvent.cancel, canOk: !sh.busy, danger: true }); }
        if (sh.kind === 'end') { var me0 = JU.derive.manage(d, sh.eventId); out.sheet = assign(out.sheet, { title: JU.COPY.endEvent.title, body: JU.COPY.endEvent.body, okLabel: sh.busy ? '处理中…' : (sh.error ? '重试' : JU.COPY.endEvent.ok), cancelLabel: JU.COPY.endEvent.cancel, canOk: !sh.busy && me0.canEnd, danger: false, hint: me0.canEnd ? '' : (me0.unanswered ? '改期还有人未答复，先等答复。' : '还没成局，不能记为散场；可以取消这场。') }); }
        if (sh.kind === 'card') { var mcd = JU.derive.manage(d, sh.eventId); out.sheet = assign(out.sheet, { title: '局卡', body: '成员在详情里看到的是同一张局卡。', okLabel: '关闭', cancelLabel: '关闭', canOk: true, card: { title: ev1.title, en: ev1.en, pack: ev1.pack, when: JU.fmt.when(ev1.iso), place: JU.fmt.place(ev1.loc), host: ev1.host.name, statusLabel: ev1.status === 'cancelled' ? '已取消' : mcd.formed ? '已成局' : mcd.counts.reserved ? '席位已预留' : '仍可报名', caption: '已确认 ' + mcd.counts.confirmed + '/' + ev1.capacity + ' · 已预留 ' + mcd.counts.reserved, note: ev1.note || '' } }); }
        if (sh.kind === 'record') { var tx = sh.text || ''; out.sheet = assign(out.sheet, { title: '说说发生了什么', body: '局内事实陈述，不评分；至少 4 个字。', text: tx, count: tx.trim().length, max: 120, min: 4, onInput: function (e2) { self.sheetInput('text', (e2.target.value || '').slice(0, 120)); }, okLabel: sh.busy ? '提交中…' : (sh.error && sh.error.indexOf('请') !== 0 ? '重试' : '提交'), cancelLabel: sh.done ? '关闭' : '取消', canOk: !sh.busy && !sh.done && tx.trim().length >= 4, doneTitle: '已受理', doneBody: '可在“设置 → 帮助与反馈”查询进度。', progressInert: true }); }
        if (sh.kind === 'contact') { out.sheet = assign(out.sheet, { title: '联系局主', okLabel: '关闭', cancelLabel: '关闭', canOk: true }); }
      }
      /* ---- participant surfaces ---- */
      var rowOf = function (id) { return jcur.concat(jhist).filter(function (r) { return r.id === id; })[0] || null; };
      var curId = top.p.eventId || (under && under.p.eventId) || null;
      var result = ui.result && ui.result.eventId === curId ? ui.result : null;
      var memberRows = function (r) { return r.item.members.filter(function (m) { return m.status !== 'open'; }).map(function (m) { var released = m.status === 'invited' && m.you && r.stage === 'released'; var lapsed = m.status === 'invited' && !released && (r.stage === 'expired' || (m.deadline && m.deadline <= now)); var timed = m.status === 'invited' && !released && !lapsed && !!m.deadline;   /* released / expired / untimed reservations never show a countdown (C03 verify) */   /* an expired reservation read from history is not「剩 1 小时」(C03 report) */ var txt = m.status === 'host' ? '局主' : m.status === 'confirmed' ? (r.stage === 'gathering' ? '已确认 · 等成局出票' : '已确认') : released ? '已放弃预留' : lapsed ? '预留已过期' : timed ? '已预留 · ' + JU.fmt.hoursLeft(m.deadline - now) : m.status === 'invited' ? '已预留' : '位置已释放'; return { id: m.id, name: m.you ? '你' : m.name, status: m.status, statusText: txt, you: !!m.you, leftText: timed ? JU.fmt.left(Math.max(0, m.deadline - now)) : '', tone: m.status === 'host' ? 'host' : m.status === 'confirmed' ? 'ok' : m.status === 'invited' && !lapsed && !released ? 'res' : 'void' }; }); };
      var detailOf = function (id) {
        var r = rowOf(id); if (!r) return { on: false };
        var st = r.stage; var cd = leftOf(r);
        var primary, secondary = null;
        var goRead = function (ev) { self.go('read', { eventId: id }, ev); };
        if (result && result.kind === 'confirmed') primary = { key: result.formed ? 'ticket' : 'members', label: result.formed ? '查看票根' : '查看成员', act: function (ev) { if (result.formed) self.replace('ticket', { eventId: id }, ev); else { self._ui({ result: null }); } } };
        else if (result) primary = { key: 'home', label: '回到列表', act: function () { self.home(); } };
        else if (st === 'pending') { primary = { key: 'none', label: '等局主审核', disabled: true }; secondary = { key: 'withdraw', label: '撤回报名', act: function (ev) { self.openConfirm('withdraw', id, ev); } }; }
        else if (st === 'invited' || st === 'invited_queue') { if (cd.expired) primary = { key: 'home', label: '回到列表', act: function () { self.home(); } }; else { primary = { key: 'read', label: '阅读并确认', act: goRead }; secondary = { key: 'release', label: '去不了了', act: function (ev) { self.openConfirm('release', id, ev); } }; } }
        else if (st === 'gathering') primary = { key: 'none', label: '等待确认', disabled: true };
        else if (st === 'waitlist') { primary = { key: 'waitlist', label: '查看候补位置', act: function (ev) { self.go('waitlist', { eventId: id }, ev); } }; secondary = { key: 'leave-queue', label: '退出候补', act: function (ev) { self.openConfirm('leaveQueue', id, ev); } }; }
        else if (st === 'tear' || st === 'contact' || st === 'going') { primary = { key: 'ticket', label: r.cta, act: function (ev) { self.go('ticket', { eventId: id, contact: st === 'contact' }, ev); } }; secondary = { key: 'exit', label: '去不了了', act: function (ev) { self.openConfirm('exit', id, ev); } }; }
        else if (st === 'reschedule') { primary = { key: 'reply', label: r.cta, act: function (ev) { self.go('reply', { eventId: id }, ev); } }; secondary = { key: 'decline', label: '去不了了', act: function (ev) { self.openConfirm('decline', id, ev); } }; }
        else primary = { key: 'history', label: '查看记录', act: function (ev) { self.go('history', { eventId: id }, ev); } };
        primary = assign({ disabled: false, busy: !!ui.busy.confirm }, primary);
        var title = result ? result.title : (cd.expired && (st === 'invited' || st === 'invited_queue') ? '预留已到期' : r.detailTitle);
        return { on: true, eventId: id, row: r, title: title, stage: st, label: r.label, need: r.need, event: r.event, when: r.when, place: r.place, host: r.host, members: memberRows(r), seats: r.seats, counts: r.counts, seatText: r.counts.confirmed + '/' + r.counts.capacity + ' 已确认（含局主）',
          countdown: assign(cd, { on: cd.on && !result }), rules: JU.RULES, primary: primary, secondary: secondary, openRead: goRead, result: result, error: ui.errors.confirm || '', back: function () { self.back(); }, receipt: st === 'invited_queue' ? { title: cd.expired ? '邀请已到期' : '位置已预留', body: cd.expired ? '' : r.deadlineText, field: cd.expired ? '已到期' : '已预留', note: '邀请的6小时已开始计时。' } : null, originKey: 'row-' + id };
      };
      out.detail = (is.detail || is.read || (under && under.s === 'detail')) && curId ? detailOf(curId) : { on: false };
      var rd = ui.read; var readRow = is.read && top.p.eventId ? rowOf(top.p.eventId) : null;
      if (readRow) {
        var rid = readRow.id; var cdR = leftOf(readRow); var rres = ui.result && ui.result.eventId === rid ? ui.result : null;
        var state = rres ? (rres.kind === 'confirmed' ? 'confirmed' : 'released') : (cdR.expired || readRow.stage === 'expired') ? 'expired' : ui.busy.confirm ? 'busy' : ui.errors.confirm ? 'failed' : 'reading';
        out.read = { on: true, eventId: rid, row: readRow, title: rres ? rres.title : state === 'expired' ? '预留已到期' : readRow.detailTitle, progress: rd.eventId === rid ? rd.progress : 0, done: rd.eventId === rid && rd.done, state: state, busy: state === 'busy', failed: state === 'failed', confirmed: state === 'confirmed', expired: state === 'expired', error: ui.errors.confirm || '', rules: JU.RULES, countdown: cdR, members: memberRows(readRow),
          hint: state === 'confirmed' ? (rres.body || '') : state === 'expired' ? '预留已到期，位置已补给他人' : (rd.eventId === rid && rd.done) ? '已读完，可以确认' : '请读到末尾，再确认入局', endMark: '已到约定末尾',
          onScroll: function (ev) { self.readScroll(ev); }, confirm: function () { self.readConfirm(rid); }, retry: function () { self.readConfirm(rid); }, release: function (ev) { self.openConfirm('release', rid, ev); },
          primary: state === 'confirmed' ? { key: rres.formed ? 'ticket' : 'members', label: rres.formed ? '查看票根' : '查看成员', act: function (ev) { if (rres.formed) self.replace('ticket', { eventId: rid }, ev); else self.back(); }, disabled: false } : state === 'expired' ? { key: 'home', label: '回到列表', act: function () { self.home(); }, disabled: false } : { key: state === 'failed' ? 'retry' : 'confirm', label: state === 'busy' ? '处理中…' : state === 'failed' ? '重试' : '确认入局', act: function () { self.readConfirm(rid); }, disabled: !(rd.eventId === rid && rd.done) || state === 'busy' },
          secondary: state === 'reading' || state === 'failed' ? { label: '去不了了', act: function (ev) { self.openConfirm('release', rid, ev); } } : null, back: function () { self.back(); }, result: rres };
      } else out.read = { on: false, progress: 0, done: false, state: 'off' };
      /* waitlist door */
      var wlRow = is.waitlist && top.p.eventId ? rowOf(top.p.eventId) : null;
      if (wlRow) {
        var wid = wlRow.id; var it0 = wlRow.item; var wres = ui.result && ui.result.eventId === wid ? ui.result : null; var cdW = leftOf(wlRow);
        var entered = memberRows(wlRow).filter(function (m) { return m.status === 'host' || m.status === 'confirmed' || m.status === 'invited'; });
        var queue = (it0.queue || []).map(function (q, i) { return { pos: i + 1, name: q.you ? '你' : mask(q.name), you: !!q.you }; });
        var turn = wlRow.stage === 'invited_queue';
        out.waitlist = { on: true, eventId: wid, row: wlRow, title: wres ? wres.title : turn ? '轮到你了' : '候补第 ' + it0.queuePos + ' 位', stage: wlRow.stage, pos: it0.queuePos, total: it0.queue.length, counts: wlRow.counts, seats: wlRow.seats, seatLine: wlRow.counts.confirmed + '/' + wlRow.counts.capacity + ' 已确认 · ' + wlRow.counts.reserved + ' 已预留 · 候补 ' + it0.queue.length, entered: entered, queue: queue, hint: turn ? '位置已留给你' : it0.queue.length ? '轮到后需在6小时内确认。' : '候补尚未留位，按加入顺序邀请。',
          receipt: noDupField(wres ? { title: wres.title, field: wres.sub === 'leaveQueue' ? '已退出' : '', body: wres.body } : turn ? { title: cdW.expired ? '邀请已到期' : '位置已预留', field: cdW.expired ? '已到期' : '已预留', body: cdW.expired ? '' : wlRow.deadlineText, note: '邀请的6小时已开始计时。' } : { title: '已加入候补', field: it0.queuePos + ' 位', body: '轮到你时才开始 6 小时预留', note: '' }),
          countdown: cdW, turn: turn, result: wres, viewInvite: function (ev) { self.go('read', { eventId: wid }, ev); }, leave: function (ev) { self.openConfirm('leaveQueue', wid, ev); }, ok: function () { self.back(); }, back: function () { self.back(); }, primary: wres ? { label: '回到列表', act: function () { self.home(); } } : turn ? { label: '查看邀请', act: function (ev) { self.go('read', { eventId: wid }, ev); } } : { label: '知道了', act: function () { self.back(); } }, secondary: !wres && !turn ? { label: '退出候补', act: function (ev) { self.openConfirm('leaveQueue', wid, ev); } } : null };
      } else out.waitlist = { on: false };
      /* ticket / reply */
      var tkRow = (is.ticket || is.reply) && top.p.eventId ? rowOf(top.p.eventId) : null;
      if (tkRow) {
        var tid = tkRow.id, it1 = tkRow.item, ev2 = tkRow.event, tk = ui.ticket; var reply = is.reply; var st1 = tkRow.stage;
        var tres = ui.result && ui.result.eventId === tid ? ui.result : null;
        var ver = reply ? ev2.version : (it1.ticket ? it1.ticket.version : ev2.version); var key = tid + ':' + ver; var printed = !!tk.printed[key] || (!reply && !!(it1.ticket && it1.ticket.torn));   /* a ticket torn earlier is not reprinted (needPrint skips it), so it counts as printed: state 'torn', contact layer available (C04 report) */
        var hasTicket = reply ? st1 === 'reschedule' || st1 === 'contact' || st1 === 'going' : !!(it1.ticket && !it1.ticket.void && (st1 === 'tear' || st1 === 'contact' || st1 === 'going'));
        var torn = reply ? (it1.reschedule && it1.reschedule.answered === 'accepted') || tk.tear.done : !!(it1.ticket && it1.ticket.torn) || tk.tear.done;
        var state = tres && (tres.kind === 'exited' || tres.kind === 'reschedule-declined') ? 'void' : !hasTicket ? 'void' : tk.printing === key ? 'printing' : !printed ? 'fresh' : torn ? 'torn' : 'printed';
        var faceWhen = reply && it1.reschedule ? JU.fmt.when(it1.reschedule.newIso) : JU.fmt.when(ev2.iso);
        var face = { title: ev2.title, en: ev2.en, pack: ev2.pack, time: faceWhen.time, md: faceWhen.md, wdZh: faceWhen.wdZh, wdEn: faceWhen.wdEn, date: faceWhen.date, when: faceWhen, place: tkRow.place, meeting: ev2.status === 'open' ? faceWhen.meeting : '待局主确认', host: ev2.host.name, version: ver, versionText: '第 ' + ver + ' 版', stamp: reply ? '时间已改' : '', code: 'JU-' + String(tid).toUpperCase().slice(0, 6), seat: '第 ' + (Math.max(0, it1.members.map(function (m) { return m.you; }).indexOf(true)) + 1) + ' 席', torn: state === 'torn', tornText: state === 'torn' ? '已撕' : '' };
        var unavailable = null;
        if (state === 'void' && !tres) { var ux = st1 === 'cancelled' ? ['这局已取消，原票根不再有效。', '查看取消结果', 'history'] : st1 === 'ended' ? ['这次活动已结束，记录已归档。', '查看散场记录', 'history'] : st1 === 'reschedule' && !reply ? ['局主调整了时间，请确认新安排。', '确认新时间', 'reply'] : (st1 === 'pending' || st1 === 'invited' || st1 === 'invited_queue' || st1 === 'waitlist') ? ['确认入局后，才会为你保留票根。', '查看参加状态', 'detail'] : st1 === 'gathering' ? ['还有成员待确认，全员到齐后出票。', '查看成员', 'detail'] : ['你已退出，原票根和联系方式已失效。', '查看退出结果', 'history'];
          unavailable = { on: true, text: ux[0], label: ux[1], act: function (ev) { self.replace(ux[2], { eventId: tid }, ev); } }; }
        var contactOpenWin = tkRow.contactOpen || (torn && st1 === 'reschedule');
        var cs = self.copyState('ticket:' + tid); var ck = 'ticket:' + tid;
        var rOld = reply && it1.reschedule ? JU.fmt.when(it1.reschedule.oldIso) : null;
        var ritualData = { key: key, title: JU.fmt.keepDot(ev2.title), time: faceWhen.time, md: faceWhen.md, loc: tkRow.place.hood, meeting: ev2.status === 'open' ? faceWhen.meeting : '待局主确认', host: ev2.host.name, previous: rOld ? rOld.wdEn + ' ' + rOld.md + ' ' + rOld.time : '', mark: reply ? '时间已改' : '', reissued: !!reply, account: ev2.host.wx, added: !!it1.contactAdded };
        var contact = { on: !!tk.contactOpen && state === 'torn', available: state === 'torn', wx: contactOpenWin ? ev2.host.wx : '', hostName: ev2.host.name, hostLabel: '局主 · ' + ev2.host.name, note: it1.contactAdded ? JU.COPY.contactedNote : JU.COPY.contactNote, closed: torn && !contactOpenWin, closedText: '联系方式已关闭', done: !!it1.contactAdded, busy: !!ui.busy.contacted, error: ui.errors.contacted || '',
          copy: function () { if (contactOpenWin) self.copy(ev2.host.wx, ck); else self.say('联系方式已关闭', 'error'); }, copyWith: function (run) { if (!contactOpenWin) { self.say('联系方式已关闭', 'error'); return Promise.resolve(false); } return self.copyVia(run, ck, ev2.host.wx); }, copied: cs.copied, copyFail: cs.failed && !it1.contactAdded, copyLabel: cs.label, retryCopy: cs.retry, markContacted: function () { if (!it1.contactAdded) self.markContacted(tid); }, ctaLabel: it1.contactAdded ? '待赴约' : (ui.busy.contacted ? '处理中…' : ui.errors.contacted ? '重试' : '已加微信'), ctaDisabled: !!it1.contactAdded || !!ui.busy.contacted,
          open: function () { self._uiIn('ticket', { contactOpen: true }); }, close: function () { self._uiIn('ticket', { contactOpen: false }); }, toggle: function () { self._uiIn('ticket', { contactOpen: !self.state.ui.ticket.contactOpen }); }, openSheet: function (ev) { self.openSheet({ kind: 'contact', eventId: tid }, ev); } };
        var canTear = state === 'printed' && (reply ? st1 === 'reschedule' : st1 === 'tear');
        var tear = { progress: tk.tear.progress, active: tk.tear.active, done: tk.tear.done || state === 'torn', error: tk.tear.error, threshold: this.tearThreshold || 0.5, canTear: canTear, style: '--tear:' + tk.tear.progress.toFixed(3), cls: (tk.tear.active ? 'is-drag' : '') + (tk.tear.done || state === 'torn' ? ' is-torn' : ''),
          onDown: function (ev) { if (canTear) self.tearDown(ev); }, onMove: function (ev) { self.tearMove(ev); }, onUp: function (ev) { self.tearUp(ev, false); }, onCancel: function (ev) { self.tearUp(ev, true); }, onKey: function (ev) { if (canTear) self.tearKey(ev); }, tearNow: function () { if (canTear) self.tearNow(); }, label: reply ? '撕下，确认新时间 →' : '撕下，联系局主 →', hint: canTear ? '拖动副券撕开，或按 Enter' : '' };
        var title = tres ? tres.title : state === 'void' ? (unavailable ? '票根不可用' : tkRow.detailTitle) : reply ? (torn ? (it1.contactAdded ? '待赴约' : '新时间已确认') : '局主改时间') : st1 === 'tear' ? '撕开，联系局主' : st1 === 'contact' ? '联系局主' : st1 === 'going' ? '待赴约' : tkRow.detailTitle;
        out.ticket = { on: true, eventId: tid, row: tkRow, title: title, stage: st1, face: face, ritual: ritualData, state: state, printing: state === 'printing', printed: function () { self.ticketPrinted(key); }, printKey: key, registerTear: function (h) { self.registerTear(h); }, tearCommit: function () { return self.tearCommit(); }, tear: tear, contact: contact, unavailable: unavailable, result: tres ? assign(tres, { label: '查看退出结果', act: function (ev) { self.replace('history', { eventId: tid }, ev); }, burn: tres.burn, burning: !!tres.burning, reason: tres.sub === 'decline' ? 'reschedule-declined' : 'withdrawn', burnDone: function () { self.burnDone(tid); } }) : null,
          exit: function (ev) { self.openConfirm(st1 === 'reschedule' ? 'decline' : 'exit', tid, ev); }, exitLabel: '去不了了', canExit: !tres && state !== 'void' && (st1 === 'tear' || st1 === 'contact' || st1 === 'going' || st1 === 'reschedule'), back: function () { self.back(); }, isReply: reply, hostWx: contactOpenWin ? ev2.host.wx : '', originKey: 'row-' + tid, rules: JU.RULES,
          reply: reply && it1.reschedule ? { oldWhen: JU.fmt.when(it1.reschedule.oldIso), newWhen: JU.fmt.when(it1.reschedule.newIso), oldText: '原定 ' + JU.fmt.when(it1.reschedule.oldIso).zh, newText: '改到 ' + faceWhen.wdZh + ' ' + faceWhen.meeting, answered: it1.reschedule.answered || null, accept: function () { if (canTear) self.tearNow(); }, decline: function (ev) { self.openConfirm('decline', tid, ev); }, oldTorn: !!(it1.ticket && it1.ticket.torn), contactAdded: !!it1.contactAdded } : null };
      } else out.ticket = { on: false, state: 'off', tear: { progress: 0 }, contact: { on: false } };
      out.reply = out.ticket.reply || null;
      /* history */
      var hRow = is.history && top.p.eventId ? rowOf(top.p.eventId) : null;
      if (hRow) {
        var hid = hRow.id, ith = hRow.item, evh = hRow.event; var stamp = hRow.stage === 'ended' ? (ith.attendance || 'none') : 'none';
        var burnable = (hRow.stage === 'cancelled' || hRow.stage === 'exited' || hRow.stage === 'declined') && !!ith.ticket;
        var playing = !!(ui.burn && ui.burn.eventId === hid && ui.burn.playing);
        var recs = (ith.records || []).slice().reverse().map(function (x) { return assign(x, { atText: JU.fmt.abs(x.at), kindLabel: x.kind === 'attendance' ? '出席记录' : x.kind === 'exit' ? '退出' : x.kind === 'report' ? '你的补充' : '记录' }); });
        var hsh = s.sheet && s.sheet.kind === 'record' && s.sheet.eventId === hid ? s.sheet : null; var hcs = self.copyState('history:' + hid);
        var reason = hRow.stage === 'cancelled' ? '局主取消 · 票根作废，不计你的退出' : hRow.need;
        var burnReason = hRow.stage === 'cancelled' ? 'cancelled' : hRow.stage === 'declined' ? 'reschedule-declined' : 'withdrawn';
        var stampEvent = function (r) { var e = r.event, w = r.when; return { id: 'NYC|' + (e.pack || 'invite') + '|' + e.title, city: 'NYC', pack: e.pack || 'invite', title: e.title, en: e.en || '', wd: w.wdEn, date: w.md, dateNum: w.month + '-' + w.day + '-2026', time: w.time, loc: r.place.hood, host: r.host.name, capacity: e.capacity, seats: Math.max(0, e.capacity - r.counts.confirmed), version: e.version || 1 }; };
        var stampData = hRow.stage === 'ended' ? { event: stampEvent(hRow), mode: ith.attendance || 'pending', history: jhist.filter(function (r) { return r.stage === 'ended' && r.id !== hid; }).map(function (r) { return { id: 'NYC|' + (r.event.pack || 'invite') + '|' + r.event.title, event: stampEvent(r), attendance: r.attendance || 'none', endedAt: r.endedAt || 0 }; }) } : null;
        var hOld = hRow.stage === 'declined' && ith.reschedule ? JU.fmt.when(ith.reschedule.oldIso) : null;
        var hRitual = ith.ticket ? { key: hid + ':' + (ith.ticket.version || 1), title: JU.fmt.keepDot(evh.title), time: hRow.when.time, md: hRow.when.md, loc: hRow.place.hood, meeting: '待局主确认', host: hRow.host.name, previous: hOld ? hOld.wdEn + ' ' + hOld.md + ' ' + hOld.time : '', mark: hRow.stage === 'declined' ? '时间已改' : '', reissued: hRow.stage === 'declined', torn: !!ith.ticket.torn } : null;
        out.history = { on: true, eventId: hid, row: hRow, title: hRow.detailTitle, stage: hRow.stage, label: hRow.label, event: evh, when: hRow.when, oldWhen: hRow.stage === 'cancelled' && ith.reschedule ? JU.fmt.when(ith.reschedule.oldIso) : null, place: hRow.place, host: hRow.host, stamp: stamp, stampText: { present: '出席', absent: '未出席', pending: '待定', none: '' }[stamp], attendanceText: hRow.attendanceText || '', reason: reason, closedNote: hRow.stage === 'cancelled' ? '不计为未出席，也不影响成局信用。' : '', records: recs, members: memberRows(hRow),
          ticket: ith.ticket ? { torn: !!ith.ticket.torn, void: !!ith.ticket.void, version: ith.ticket.version } : null, ritual: hRitual, ashes: burnable && !playing, burn: { play: playing, done: !playing, reason: burnReason, burnDone: function () { self.burnDone(hid); } }, burnOnce: burnable, stampData: stampData, hasStamp: hRow.stage === 'ended', contactOpen: !!hRow.contactOpen, hostWx: hRow.hostWx, copyWx: function () { if (hRow.contactOpen) self.copy(hRow.hostWx, 'history:' + hid, null, true); }, copied: hcs.copied, copyFail: hcs.failed, copyLabel: hcs.label, retryCopy: hcs.retry, contactClosedText: hRow.stage === 'ended' && !hRow.contactOpen ? '散场已超过 24 小时，联系方式已关闭' : '',
          report: { open: function (ev) { self.openRecord(hid, ev); }, on: !!hsh, text: hsh ? hsh.text || '' : '', onInput: out.sheet.onInput, count: hsh ? (hsh.text || '').trim().length : 0, max: 120, min: 4, submit: function () { self.sheetOk(); }, done: !!(hsh && hsh.done), busy: !!(hsh && hsh.busy), error: hsh ? hsh.error : '', close: function () { self.sheetCancel(); }, label: '不对劲？举报', doneText: '已受理 · 可在“设置 → 帮助与反馈”查询进度。' },
          back: function () { self.back(); }, originKey: 'row-' + hid, footer: JU.COPY.historyFooter };
      } else out.history = { on: false, burn: { play: false } };
      /* ---- manage ---- */
      if (is.manage && top.p.eventId) {
        var m = JU.derive.manage(d, top.p.eventId); var mid = top.p.eventId; var mui = ui.manage;
        if (!m) out.manage = { on: true, missing: true, eventId: mid, title: '找不到这场活动', body: '这场活动不在本机，返回我的局重新选择。', back: function () { self.back(); } };
        else {
          var intent = top.p.intent || 'manage'; var ev3 = m.event; var cancelled = ev3.status === 'cancelled', ended = ev3.status === 'ended';
          var show = { apps: !cancelled && !ended && (m.pendingApps.length > 0 || m.handledCount > 0), replies: !!ev3.proposal && ev3.status === 'open', members: !ended, queue: m.queue.length > 0 && !cancelled && !ended, leaves: m.leaves.length > 0, attendance: ended && m.attendees.length > 0, arrange: true };
          var orderAll = intent === 'review' ? ['apps', 'replies', 'members', 'queue', 'leaves'] : intent === 'attendance' ? ['attendance', 'leaves'] : ['replies', 'members', 'apps', 'queue', 'leaves'];
          var order = orderAll.filter(function (k) { return show[k]; }).concat(['arrange']);
          var secV = function (k, extra) { return assign({ key: k, on: show[k], order: Math.max(0, order.indexOf(k)), open: !!mui.open[k], cls: (mui.open[k] ? 'is-open' : 'is-closed') + (mui.focus === k ? ' is-focus' : ''), toggle: function () { self.toggleSection(k); } }, extra); };
          var apps = secV('apps', { title: '申请 · ' + m.pendingApps.length, label: '申请', count: m.pendingApps.length, titleHandled: m.handledCount ? '已处理 ' + m.handledCount : '', count: m.pendingApps.length, handled: m.handledCount, sub: m.handledCount ? '申请 ' + m.pendingApps.length + ' · 已处理 ' + m.handledCount : '通过即发出 6 小时预留', help: JU.COPY.approveHelp, empty: m.pendingApps.length === 0,
            rows: m.appsToShow.map(function (a) { var k = 'app:' + a.id; return assign(a, { key: a.id, nickText: a.nick || '未填称呼', initial: JU.fmt.initial(a.nick), busy: !!ui.busy[k], error: ui.errors[k] || '', result: a.handled, tone: a.status === 'approved' ? 'ok' : a.status === 'rejected' ? 'void' : 'wait', approve: function (ev) { self.approve(mid, a.id); }, reject: function (ev) { self.reject(mid, a.id); }, retry: function () { self.setState(function (st) { var er = assign(st.ui.errors); delete er[k]; return { ui: assign(st.ui, { errors: er }) }; }); } }); }) });
          var rosterRows = m.roster.map(function (r) { var ck = 'wx:' + r.id; var rcs = self.copyState(ck); return assign(r, { key: r.id, name: r.host ? '你' : r.nick, initial: JU.fmt.initial(r.nick), copyWx: function () { if (r.showWx) self.copy(r.wx, ck, '微信号已复制', true); }, copied: rcs.copied, copyFail: rcs.failed, copyLabel: rcs.label, retryCopy: rcs.retry, wxText: r.showWx ? '微信 ' + r.wx : '', contactText: r.contactAdded ? '已自报加微信' : '', left: { text: r.leftText, ratio: r.leftRatio, tone: r.leftTone, on: !!r.leftText } }); });
          var openSeats = Math.max(0, m.counts.available);
          var roster = secV('members', { title: '成员', label: '成员', count: null, line: ev3.capacity + ' 个座位（含你）· 已确认 ' + m.counts.confirmed + (m.counts.reserved ? ' · 预留 ' + m.counts.reserved : ''), rows: rosterRows, openSeats: openSeats, openText: cancelled ? '' : openSeats ? '还有 ' + openSeats + ' 个空位' : '', openRows: cancelled ? [] : Array.apply(null, Array(openSeats)).map(function (_, i) { return { key: 'open-' + i, text: '等人' }; }), voidNote: cancelled ? '已取消 · 票根作废' : '' });
          var queue = secV('queue', { title: '候补 · ' + m.queue.length, label: '候补', count: m.queue.length, sub: '不占席位', count: m.queue.length, rows: m.queue.map(function (q, i) { return assign(q, { key: q.nick + i, initial: JU.fmt.initial(q.nick) }); }), help: JU.COPY.queueHelp });
          var leaves = secV('leaves', { title: '离开记录 · ' + m.leaves.length, label: '离开记录', count: m.leaves.length, count: m.leaves.length, rows: m.leaves.map(function (l, i) { return assign(l, { key: l.nick + i, atText: JU.fmt.abs(l.at) }); }) });
          var replies = secV('replies', { title: '改期答复 · 已答复 ' + m.answered + '/' + m.asked, label: '改期答复', count: '已答复 ' + m.answered + '/' + m.asked, sub: '没有答复期限', answered: m.answered, total: m.asked, oldWhen: m.oldWhen, newWhen: m.when, rows: m.reschedRoster.map(function (r) { return assign(r, { key: r.id, name: r.nick, tone: r.reschedule === 'ask' ? 'wait' : r.reschedule === 'accepted' ? 'ok' : 'void', ticketLine: r.reschedule === 'accepted' ? '已撕票' : r.reschedule === 'declined' ? '席位已释放' : '旧票不能用' }); }), help: JU.COPY.repliesHelp });
          var attRows = m.attendees.map(function (a) { var editing = !!mui.editing[a.id]; var rec = !!a.attendance; var ack = 'wx:' + a.id; var acs = self.copyState(ack);
            return assign(a, { key: a.id, name: a.nick, initial: JU.fmt.initial(a.nick), value: a.attendance || '', label: a.attLabel, recorded: rec, editing: editing, choosing: !rec || editing, stampFresh: !!mui.fresh[a.id], stamp: a.attendance === 'present' ? 'present' : a.attendance === 'absent' ? 'absent' : a.attendance === 'pending' ? 'pending' : 'none', trail: a.attTrail, showTrail: a.attTrail.length >= 2, error: ui.errors['att:' + a.id] || '', isNext: mui.next === a.id,
              set: function (v) { self.attend(mid, a.id, v); }, setPresent: function () { self.attend(mid, a.id, 'present'); }, setAbsent: function () { self.attend(mid, a.id, 'absent'); }, setPending: function () { self.attend(mid, a.id, 'pending'); }, correct: function () { self.correct(a.id); }, isPresent: a.attendance === 'present', isAbsent: a.attendance === 'absent', isPending: a.attendance === 'pending',
              copyWx: function () { if (a.showWx) self.copy(a.wx, ack, '微信号已复制', true); }, copied: acs.copied, copyFail: acs.failed, copyLabel: acs.label, retryCopy: acs.retry, wxText: a.showWx ? '微信 ' + a.wx : '' }); });
          var attendance = secV('attendance', { title: '出席 · ' + m.recorded + '/' + m.nonHost, label: '出席', count: m.recorded + '/' + m.nonHost, sub: '逐人记录 · 可更正', rec: m.recorded, total: m.nonHost, present: m.present, absent: m.absent, undecided: m.undecided, rows: attRows, help: JU.COPY.attendanceHelp, contactLine: m.contactOpen ? '散场 24 小时内仍可查看成员微信' : '散场已超过 24 小时，联系方式已关闭', focusNext: mui.next, allRecorded: m.recorded === m.nonHost && m.nonHost > 0, doneText: m.recorded === m.nonHost ? '都记好了 · ' + m.present + '/' + m.nonHost + ' 人到场' : '' });
          var arrange = secV('arrange', { title: '这局的安排', label: '这局的安排', count: null, canReschedule: m.canReschedule, canEnd: m.canEnd, canCancel: m.canCancel, notFormedHint: m.notFormedHint ? '还没成局，不能记为散场' : '', endHint: m.notFormedHint ? '还没成局，不能记为散场' : m.unanswered ? '改期还有人未答复，先等答复' : '', unansweredHint: m.unanswered && ev3.status === 'open' ? '上一次改期还有人未答复' : '',
            reschedule: function (ev) { if (m.canReschedule) self.openReschedule(mid, ev); }, end: function (ev) { if (m.canEnd) self.openEnd(mid, ev); }, cancel: function (ev) { if (m.canCancel) self.openCancel(mid, ev); }, card: function (ev) { self.openCard(mid, ev); },
            rescheduleLabel: '改时间', rescheduleNote: '已确认的人各自答复', endLabel: '记为散场', endNote: '散场后逐人记录出席', cancelLabel: '取消这局', cancelNote: '确认前会列出受影响的人', reopenInert: true, reopenLabel: '再开一局', reopenNote: '只带入活动内容，成员与记录不复制', showReopen: cancelled || ended, reopen: inert });
          var pg = { confirmed: m.counts.confirmed, cap: ev3.capacity, reserved: m.counts.reserved, available: m.counts.available, seats: m.seats, text: '已确认 ' + m.counts.confirmed + '/' + ev3.capacity + '（含你）', more: JU.fmt.seatLine(m.counts), attendance: ended ? { rec: m.recorded, total: m.nonHost, present: m.present, absent: m.absent, text: m.recorded + '/' + m.nonHost + ' 已记录出席', sub: '出席 ' + m.present + ' · 未出席 ' + m.absent } : null, hidden: cancelled };
          out.manage = { on: true, missing: false, eventId: mid, intent: intent, m: m, event: ev3, head: { title: ev3.title, status: m.status, life: m.life, meta: m.status + ' · ' + m.when.zh, when: m.when, oldWhen: m.oldWhen, place: m.place, formedLine: m.formedLine, progress: pg, cancelled: cancelled, ended: ended, formed: m.formed, contactOpen: m.contactOpen, cardLink: '查看局卡', dimmed: cancelled || ended }, order: order, show: show, apps: apps, roster: roster, queue: queue, leaves: leaves, replies: replies, attendance: attendance, arrange: arrange, card: { open: function (ev) { self.openCard(mid, ev); }, label: '查看局卡' }, error: ui.errors.manage || '', back: function () { self.back(); }, backLabel: '返回我的局', focus: mui.focus, originKey: 'row-' + mid };
        }
      } else out.manage = { on: false };
      /* draft summary */
      if (is.draft && top.p.draftId) { var dr0 = hosted.drafts.filter(function (x) { return x.id === top.p.draftId; })[0]; out.draft = dr0 ? assign({}, dr0, { on: true, draftId: dr0.id, row: dr0, rowDel: dr0.del, back: function () { self.back(); }, del: function (ev) { self.deleteDraft(dr0.id); self.back(); } }) : { on: true, missing: true, title: '草稿已删除', back: function () { self.back(); } }; }
      else out.draft = { on: false };
      out.surfaceTitle = out.manage.on ? out.manage.head && out.manage.head.title : out.ticket.on ? out.ticket.title : out.history.on ? out.history.title : out.read.on ? out.read.title : out.detail.on ? out.detail.title : out.waitlist.on ? out.waitlist.title : TITLES[top.s];
      /* a surface that is LEAVING after replace() (read → ticket, ticket ⇄ reply …) keeps the last model it rendered with, so its exit
         animation never paints an empty frame (C07 review); the cache is per surface and only reused for the same event / draft */
      var vmCache = (this._vmCache = this._vmCache || {});
      /* the same holds for the top surface during back()'s exit phase: _leaveApply has already cleared its result / contact state,
         so it would change text mid-exit (C06 report: a folding paragraph swapped sentences) — it keeps its last model instead */
      var exitTop = nav.phase === 'exit' ? nav.stack[nav.stack.length - 1] : null, exitK = exitTop ? (exitTop.s === 'reply' ? 'ticket' : exitTop.s) : null;
      ['detail', 'read', 'waitlist', 'ticket', 'history', 'manage', 'draft'].forEach(function (k) { if (k === exitK) return; if (out[k] && out[k].on && is[k]) vmCache[k] = out[k]; });
      if (exitK && vmCache[exitK]) { var ep = exitTop.p || {}, ec = vmCache[exitK]; if ((ep.eventId && ec.eventId === ep.eventId) || (ep.draftId && ec.draftId === ep.draftId)) out[exitK] = assign(ec, { leaving: true }); }
      if (nav.leaving && out[nav.leaving.s] && !out[nav.leaving.s].on) {
        var cached = vmCache[nav.leaving.s], lp = nav.leaving.p || {};
        if (cached && ((lp.eventId && cached.eventId === lp.eventId) || (lp.draftId && cached.draftId === lp.draftId))) out[nav.leaving.s] = assign(cached, { leaving: true });
      }
      return out;
    };
  };
})(typeof window !== 'undefined' ? window : this);

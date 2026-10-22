(function () {
  'use strict';
  /* my-r2/src/shell/shell.js — the offline review shell for JU「我的局」R2 (injected by my-r2/src/build.js).
     Views: 总览 (one card per concept, four same-data phones) · 方案 (rail + full-size stage, panel outside the phone)
            · 比较 (2–3 concepts or all ten in the same state, anonymised / grayscale / reduced motion / size / synced click)
            · 附录 (docs + the five-column coverage table + the evidence gallery).
     Resource rule: only the instances on screen run. Leaving a view / a concept pauses its timers (pauseTimers) and its
     animations; a compare combination change unmounts the old instances (timers cleared, animations cancelled, nodes removed).
     The state index (window.__JU_INDEX) is injected at build time, so #compare can be opened directly before any concept runs. */
  var SRC = window.__JU_SOURCES || {}, META = window.__JU_META || [], DOCS = window.__JU_DOCS || {};
  /* the overview and the rail list every public concept (built or 画板制作中) plus any internal one built by name (JU_ONLY=C00) */
  var META_ALL = (window.__JU_META_ALL || META).concat(META.filter(function (c) { return !(window.__JU_META_ALL || []).some(function (x) { return x.code === c.code; }); }));
  var INDEX = window.__JU_INDEX || [];
  var COV = window.__JU_COVERAGE || null, EV = window.__JU_EVIDENCE || { items: [] }, SCOPE = window.__JU_SCOPE || null;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var views = { overview: $('#v-overview'), concept: $('#v-concept'), compare: $('#v-compare'), appendix: $('#v-appendix') };
  var mounts = { preview: {}, stage: {}, compare: {} };
  var currentView = null;
  var esc = function (s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); };

  /* ---------- instance lifecycle ---------- */
  function anims(m) { try { return m && m.root && m.root.getAnimations ? m.root.getAnimations({ subtree: true }) : []; } catch (e) { return []; } }
  /* sleep(): an instance that is not on screen stops consuming — its timers are paused and every running animation is paused */
  function sleep(m) {
    if (!m || m.__asleep) return; m.__asleep = true;
    var i = m.instance; try { if (i && i.pauseTimers) i.pauseTimers(); } catch (e) { }
    m.__pausedAnims = [];
    anims(m).forEach(function (a) { try { if (a.playState === 'running') { a.pause(); m.__pausedAnims.push(a); } } catch (e) { } });
  }
  /* wake(): back on screen — resume the timers (unless the reviewer had pressed 暂停 in the panel) and the animations we paused */
  function wake(m) {
    if (!m || !m.__asleep) return; m.__asleep = false;
    var i = m.instance; var panelPaused = !!(i && i.state && i.state.review && (i.state.review.paused || i.state.review.scrub != null));
    try { if (i && i.resumeTimers && !panelPaused) i.resumeTimers(); } catch (e) { }
    (m.__pausedAnims || []).forEach(function (a) { try { if (a.playState === 'paused') a.play(); } catch (e) { } }); m.__pausedAnims = [];
  }
  /* unmountHost(): the runtime's handle.unmount() renders null (componentWillUnmount → clearTimers); we also cancel every animation
     first and clear the shadow root, then remove the host node, so nothing of the old instance keeps running */
  function unmountHost(h) {
    var m = h && h.__m;
    if (m) {
      var i = m.instance;
      anims(m).forEach(function (a) { try { a.cancel(); } catch (e) { } });
      try { if (i && i.clearTimers) i.clearTimers(); } catch (e) { }
      try { if (m.unmount) m.unmount(); else if (i && i.componentWillUnmount) i.componentWillUnmount(); } catch (e) { }
      try { if (h.shadowRoot) h.shadowRoot.innerHTML = ''; else h.innerHTML = ''; } catch (e) { }
      h.__m = null;
    }
    if (h && h.parentNode) h.parentNode.removeChild(h);
  }
  if (window.DCMini && !window.DCMini.unmount) window.DCMini.unmount = function (host) { unmountHost(host); };
  function mountInto(kind, key, host, code, props) {
    var m = DCMini.mount(host, SRC[code], props); m.__code = code; m.__kind = kind; host.__m = m; mounts[kind][key] = m; return m;
  }
  function eachMount(fn) { Object.keys(mounts).forEach(function (kind) { Object.keys(mounts[kind]).forEach(function (k) { fn(kind, k, mounts[kind][k]); }); }); }
  function isCurrent(kind, m) {
    if (kind === 'preview') return currentView === 'overview';
    if (kind === 'stage') return currentView === 'concept' && m.__code === currentCode;
    if (kind === 'compare') return currentView === 'compare';
    return false;
  }
  /* stats(): what is still running — offline-check.cjs asserts that nothing outside the current view / concept is */
  function stats() {
    var out = { view: currentView, current: currentCode, mounts: 0, running: 0, runningOutsideCurrent: 0, timers: 0, timersOutsideCurrent: 0, detail: [] };
    eachMount(function (kind, k, m) {
      out.mounts++;
      var cur = isCurrent(kind, m);
      var r = anims(m).filter(function (a) { return a.playState === 'running'; }).length;
      var t = ((m.instance && m.instance._timers) || []).filter(function (e) { return e.id; }).length;
      out.running += r; out.timers += t; if (!cur) { out.runningOutsideCurrent += r; out.timersOutsideCurrent += t; }
      if (r || t) out.detail.push({ kind: kind, key: k, current: cur, running: r, timers: t });
    });
    return out;
  }
  function settleMounts() {
    eachMount(function (kind, k, m) { if (isCurrent(kind, m)) wake(m); else sleep(m); });
  }

  /* ---------- views + routing ---------- */
  var DOC_TABS = [['coverage-table', '覆盖表（五栏）'], ['evidence', '证据画廊'], ['matrix', '十套差异矩阵'], ['refs', '参考与转译'], ['motion', '核心动效记录'], ['verification', '实际验收记录'], ['coverage', '覆盖记录（原文）'], ['research', '研究台账'], ['observations', '旧十套实看记录'], ['limits', '限制与未验证项']];
  var DOC_KEYS = {}; DOC_TABS.forEach(function (t) { DOC_KEYS[t[0]] = t[1]; });
  var currentDoc = 'coverage-table';
  function hashFor(view) { return '#' + view + (view === 'concept' && currentCode ? '/' + currentCode : view === 'appendix' ? '/' + currentDoc : ''); }
  function show(view, push) {
    if (!views[view]) view = 'overview';
    currentView = view;
    Object.keys(views).forEach(function (k) { views[k].classList.toggle('on', k === view); });
    document.querySelectorAll('.tab').forEach(function (t) { t.classList.toggle('on', t.dataset.view === view); });
    if (view === 'overview') buildOverview(); if (view === 'compare') buildCompare(); if (view === 'appendix') showDoc(currentDoc);
    settleMounts();
    var h = hashFor(view);
    try { if (push && location.hash !== h) history.pushState(null, '', h); else if (location.hash !== h) history.replaceState(null, '', h); } catch (e) { }
  }
  document.querySelectorAll('.tab').forEach(function (t) { t.addEventListener('click', function () { if (t.dataset.view === 'concept') openConcept(currentCode, true); else show(t.dataset.view, true); }); });

  /* ---------- 总览: one card per concept, four same-data phones (a real mount each, jumped to its state after mounting) ---------- */
  var OV_SHOTS = [['j-home', '参加者 · 默认首屏'], ['h-home', '局主 · 默认首屏'], ['j-d-tear', '局内详情 · 已出票待撕'], ['h-m-attendance', '管理 · 出席记录']];
  var ovBuilt = false;
  function buildOverview() {
    if (ovBuilt) return; ovBuilt = true;
    if (SCOPE) $('#scope').innerHTML = '<span class="sc"><b>演示日期</b> ' + esc(SCOPE.demoNow) + '（不冒充实时；面板可推进时钟）</span><span class="sc"><b>演示假设</b> ' + SCOPE.assumptions.map(esc).join(' / ') + '（不借设计批准为政策）</span><span class="sc"><b>范围外入口</b> ' + SCOPE.outOfScope.map(esc).join('、') + '：保留文字与位置，不可点</span>';
    var grid = $('#ov-grid');
    if (!META_ALL.length) { grid.innerHTML = '<p class="lead">（本次构建不含任何方案源文件）</p>'; return; }
    META_ALL.forEach(function (c) {
      var done = !!SRC[c.code];
      var card = document.createElement('div'); card.className = 'ov-card' + (done ? '' : ' todo');
      card.innerHTML = '<div class="ov-head"><span class="ov-code">' + esc(c.code) + '</span><span class="ov-name">' + esc(c.name) + '</span></div><p class="ov-line">' + esc(c.line) + '</p>' +
        (done ? '<div class="ov-phones">' + OV_SHOTS.map(function (st) { return '<div class="ov-shot"><div class="ov-ph"><div class="ph-host" data-jump="' + st[0] + '"></div></div><span class="ph-label">' + st[1] + '</span></div>'; }).join('') + '</div>' +
          '<div class="ov-foot"><span>' + esc((c.motions || []).slice(0, 3).map(function (m) { return String(m).split('：')[0]; }).join(' · ')) + '</span><button type="button" class="btn">进入操作</button></div>'
          : '<p class="ov-todo">画板制作中（源文件尚未进入本次构建）</p>');
      if (done) card.addEventListener('click', function () { openConcept(c.code, true); });
      grid.appendChild(card);
      card.querySelectorAll('.ph-host').forEach(function (h) {
        h.classList.add('preview'); var key = h.dataset.jump;
        var m = mountInto('preview', 'preview:' + c.code + ':' + key, h, c.code, { panel: false, idle: true, persist: false });
        setTimeout(function () { try { if (m.instance && m.instance.jumpTo) m.instance.jumpTo(key); } catch (e) { console.error('preview jump failed', c.code, key, e); } }, 80);
      });
    });
  }

  /* ---------- 方案: rail + full-size stage ---------- */
  var currentCode = META.length ? META[0].code : '';
  var rail = $('#rail'), stageWrap = $('#stage-wrap');
  if (!META.length) stageWrap.classList.add('empty');
  META_ALL.forEach(function (c) { var b = document.createElement('button'); b.type = 'button'; b.innerHTML = '<span class="c">' + esc(c.code) + '</span>' + esc(c.name); b.dataset.code = c.code; if (SRC[c.code]) b.addEventListener('click', function () { openConcept(c.code, true); }); else { b.classList.add('todo'); b.title = '画板制作中'; } rail.appendChild(b); });
  var fitted = {};
  function openConcept(code, push) {
    if (!SRC[code]) { show('concept', push); return; }
    currentCode = code;
    rail.querySelectorAll('button').forEach(function (b) { b.classList.toggle('on', b.dataset.code === code); });
    var host = stageWrap.querySelector('.stage-host[data-code="' + code + '"]');
    if (!host) { host = document.createElement('div'); host.className = 'stage-host on'; host.dataset.code = code; stageWrap.appendChild(host); mountInto('stage', 'stage:' + code + ':', host, code, { panel: true }); }
    stageWrap.querySelectorAll('.stage-host').forEach(function (h) { h.classList.toggle('on', h.dataset.code === code); });
    show('concept', push);   /* settleMounts() inside: the stage we leave sleeps, this one wakes */
    try { window.scrollTo(0, 0); } catch (e) { }
    /* a short laptop window (e.g. 1440×789) cannot show an 844px phone: the first time a concept opens there, its phone takes
       the window's height (real reflow, labelled 「适应窗口高度」 in the panel; the standard sizes stay one click away) */
    if (!fitted[code] && (window.innerHeight || 1000) < 950) {
      fitted[code] = true;
      var mm = mounts.stage['stage:' + code + ':'];
      setTimeout(function () { var i = mm && mm.instance; if (i && i.fitPhone) i.fitPhone(); }, 0);
    }
  }

  /* ---------- 比较 ---------- */
  var cmpBuilt = false;
  function stages() { return Array.prototype.slice.call($('#cmp-stages').querySelectorAll('.cmp-host')); }
  function setLog(t) { $('#cmp-log').textContent = t || ''; }
  function buildCompare() {
    if (cmpBuilt) return; cmpBuilt = true;
    /* 1. the state index first (injected at build time; a concept bundle's JU.INDEX is only a fallback) */
    var idx = INDEX.length ? INDEX : ((window.JU && window.JU.INDEX) || []);
    var st = $('#cmp-state');
    if (!idx.length) { var o0 = document.createElement('option'); o0.value = ''; o0.textContent = '（状态索引未注入）'; st.appendChild(o0); setLog('状态索引未注入（构建时缺少 ju-data.js）：「同时跳转」不可用，重置 / 同步点击仍可用。'); }
    idx.forEach(function (e) { var o = document.createElement('option'); o.value = e.key; o.textContent = e.group + ' · ' + e.label; st.appendChild(o); });
    /* 2. then the controls and the stages */
    ['cmp-a', 'cmp-b', 'cmp-c'].forEach(function (id, i) { var sel = $('#' + id); META.forEach(function (c) { var o = document.createElement('option'); o.value = c.code; o.textContent = c.code + ' ' + c.name; sel.appendChild(o); }); if (i < 2 && META[i]) sel.value = META[i].code; });
    if (META.length < 2) $('#cmp-scope').value = 'all';
    function applyChecks() {
      var wrap = $('#cmp-stages'); var anon = $('#cmp-anon').checked;
      wrap.classList.toggle('anon', anon); stages().forEach(function (h) { h.classList.toggle('anon', anon); });
      wrap.classList.toggle('gray', $('#cmp-gray').checked);
      views.compare.classList.toggle('pick', $('#cmp-scope').value === 'pick');
      var sz = $('#cmp-size').value.split(',').map(Number); var rm = $('#cmp-rm').checked;
      stages().forEach(function (h) { var i = h.__m && h.__m.instance; if (!i || !i.state || !i.state.review) return;
        if (i.setPhoneSize && (i.state.review.pw !== sz[0] || i.state.review.ph !== sz[1])) i.setPhoneSize(sz[0], sz[1]);
        if (!!i.state.review.rm !== rm) { if (i.setReview) i.setReview({ rm: rm }); else if (i.toggleRM) i.toggleRM(); } });
    }
    function render() {
      var codes = $('#cmp-scope').value === 'all' ? META.map(function (c) { return c.code; }) : ['cmp-a', 'cmp-b', 'cmp-c'].map(function (id) { return $('#' + id).value; }).filter(function (v, i, a) { return v && SRC[v] && a.indexOf(v) === i; });
      var wrap = $('#cmp-stages');
      stages().forEach(unmountHost); Object.keys(mounts.compare).forEach(function (k) { delete mounts.compare[k]; }); wrap.innerHTML = '';
      if (!codes.length) { wrap.innerHTML = '<p class="cmp-empty">（没有可比较的方案）</p>'; return; }
      var panels = $('#cmp-panels').checked;
      codes.forEach(function (code, n) {
        var h = document.createElement('div'); h.className = 'cmp-host' + (panels ? '' : ' nopanel'); h.dataset.code = code; h.dataset.idx = String(n + 1);
        var name = document.createElement('span'); name.className = 'cmp-name'; var c = META.filter(function (x) { return x.code === code; })[0]; name.textContent = code + ' ' + (c ? c.name : ''); h.appendChild(name);
        wrap.appendChild(h);
        mountInto('compare', 'compare:' + code + ':' + n, h, code, { panel: panels, persist: false });
      });
      applyChecks();
    }
    ['cmp-a', 'cmp-b', 'cmp-c', 'cmp-panels', 'cmp-scope'].forEach(function (id) { $('#' + id).addEventListener('change', render); });
    ['cmp-anon', 'cmp-gray', 'cmp-rm', 'cmp-size'].forEach(function (id) { $('#' + id).addEventListener('change', applyChecks); });
    $('#cmp-apply').addEventListener('click', function () { var k = st.value; if (!k) return; stages().forEach(function (h) { var i = h.__m && h.__m.instance; if (i && i.jumpTo) i.jumpTo(k); }); setLog('已同时跳转到 ' + k + '（' + stages().length + ' 套）'); });
    $('#cmp-click').addEventListener('click', syncClick);
    $('#cmp-act').addEventListener('keydown', function (ev) { if (ev.key === 'Enter') syncClick(); });
    $('#cmp-reset').addEventListener('click', function () { stages().forEach(function (h) { var i = h.__m && h.__m.instance; if (i && i.reset) i.reset(); }); setLog('已重置全部舞台'); });
    $('#cmp-speed1').addEventListener('click', function () { stages().forEach(function (h) { var i = h.__m && h.__m.instance; if (i && i.setSpeed) i.setSpeed(1); }); $('#cmp-speed1').classList.add('on'); $('#cmp-speed05').classList.remove('on'); });
    $('#cmp-speed05').addEventListener('click', function () { stages().forEach(function (h) { var i = h.__m && h.__m.instance; if (i && i.setSpeed) i.setSpeed(0.5); }); $('#cmp-speed05').classList.add('on'); $('#cmp-speed1').classList.remove('on'); });
    render();
  }
  /* syncClick(): the same real click (pointerdown → pointerup → click at the element's centre) on every stage's shadow root.
     Input is a data-act value (tear → [data-act="tear"]) or any selector. Among several matches the one inside an overlay
     (.cNN-over) wins, otherwise the first element with a box. */
  function splitAlts(sel) { var alts = [], cur = '', d = 0, q = ''; for (var i = 0; i < sel.length; i++) { var ch = sel[i]; if (q) { if (ch === q) q = ''; cur += ch; continue; } if (ch === '"' || ch === "'") { q = ch; cur += ch; continue; } if (ch === '[' || ch === '(') d++; if (ch === ']' || ch === ')') d--; if (ch === ',' && d === 0) { alts.push(cur.trim()); cur = ''; continue; } cur += ch; } if (cur.trim()) alts.push(cur.trim()); return alts; }
  function pickTarget(sr, sel) {
    /* "sel1, sel2" = alternatives in priority order (same rule as tools/_lib.cjs): the first one with a visible match wins */
    var total = 0, vis = [];
    try { var alts = splitAlts(sel); for (var k = 0; k < alts.length && !vis.length; k++) { var list = Array.prototype.slice.call(sr.querySelectorAll(alts[k])); total += list.length; vis = list.filter(function (el) { var b = el.getBoundingClientRect(); return b.width > 0 && b.height > 0; }); } } catch (e) { return { bad: true }; }
    if (!vis.length) return { el: null, total: total };
    var over = vis.filter(function (el) { return !!el.closest('[class*="-over"]'); });
    return { el: over.length ? over[over.length - 1] : vis[0], total: list.length };
  }
  function realClick(el) {
    var b = el.getBoundingClientRect(); var x = b.left + b.width / 2, y = b.top + Math.min(b.height / 2, 48);
    var base = { bubbles: true, cancelable: true, composed: true, clientX: x, clientY: y, button: 0, buttons: 1 };
    var pe = function (type, extra) { try { return new PointerEvent(type, Object.assign({ pointerId: 1, isPrimary: true, pointerType: 'mouse' }, base, extra || {})); } catch (e) { return new MouseEvent(type, base); } };
    el.dispatchEvent(pe('pointerdown')); el.dispatchEvent(new MouseEvent('mousedown', base));
    el.dispatchEvent(pe('pointerup', { buttons: 0 })); el.dispatchEvent(new MouseEvent('mouseup', Object.assign({}, base, { buttons: 0 })));
    el.click();
  }
  function syncClick() {
    var q = ($('#cmp-act').value || '').trim(); if (!q) { setLog('请输入 data-act 值或选择器'); return; }
    var sel = /[\[\].#\s>:*=]/.test(q) ? q : '[data-act="' + q + '"]';
    var hit = [], miss = [], bad = false;
    stages().forEach(function (h) { var sr = h.shadowRoot; if (!sr) { miss.push(h.dataset.code); return; } var t = pickTarget(sr, sel); if (t.bad) { bad = true; return; } if (!t.el) { miss.push(h.dataset.code + (t.total ? '（有 ' + t.total + ' 个但不可见）' : '')); return; } realClick(t.el); hit.push(h.dataset.code); });
    setLog(bad ? '选择器无效：' + sel : '同步点击 ' + sel + '：命中 ' + hit.length + ' 套' + (hit.length ? '（' + hit.join(' ') + '）' : '') + (miss.length ? '；未找到：' + miss.join('，') : ''));
    return { sel: sel, hit: hit, miss: miss };
  }

  /* ---------- 附录 ---------- */
  var apxNav = $('#apx-nav');
  DOC_TABS.forEach(function (t) { var b = document.createElement('button'); b.type = 'button'; b.className = 'apx-tab'; b.dataset.doc = t[0]; b.textContent = t[1]; var d = DOCS[t[0]]; if (d && d.present === false) { b.classList.add('missing'); b.title = '尚未生成：' + d.file; } if (t[0] === 'evidence' && !(EV.items && EV.items.length)) { b.classList.add('missing'); b.title = '尚未登记证据'; } if (t[0] === 'coverage-table' && !COV) { b.classList.add('missing'); b.title = '尚未生成 my-r2/spec/coverage.md'; } b.addEventListener('click', function () { showDoc(t[0]); try { history.pushState(null, '', hashFor('appendix')); } catch (e) { } }); apxNav.appendChild(b); });
  function showDoc(k) {
    if (!DOC_KEYS[k]) k = 'coverage-table'; currentDoc = k;
    document.querySelectorAll('.apx-tab').forEach(function (t) { t.classList.toggle('on', t.dataset.doc === k); });
    var box = $('#apx-doc');
    if (k === 'coverage-table') { renderCoverage(box); return; }
    if (k === 'evidence') { renderEvidence(box); return; }
    var d = DOCS[k]; box.innerHTML = d ? (d.present === false ? '<p class="apx-missing">（尚未生成：' + esc(d.file) + '）</p>' : d.html) : '';
  }
  var COLS = [['entry', '入口存在'], ['op', '真实操作成功'], ['static', '静态视觉已看'], ['motion', '正常速度动效已看'], ['pending', '仍需用户验收']];
  function cellCls(k, v) { v = String(v || '').trim(); if (!v || v === '–' || v === '-' || v === '—') return 'na'; if (k === 'pending') return 'pend'; if (/^[✓✔]/.test(v)) return 'ok'; if (/^[✗✘×x]/i.test(v)) return 'no'; return 'txt'; }
  var covCode = null;
  function renderCoverage(box) {
    var legend = '<p class="cov-legend"><span>五栏各自独立：</span><span>入口存在 = tools/coverage.cjs 跳转到该状态且截图生成（自动）</span><span>真实操作成功 = 用真实点击走到该状态（capture / flow 记录）</span><span>静态视觉已看 = 有人看过该截图</span><span>正常速度动效已看 = 1× 帧序列被看过</span><span>仍需用户验收 = 留给用户的判断</span></p>';
    if (!COV) { box.innerHTML = '<h2>覆盖表</h2>' + legend + '<p class="apx-missing">（尚未生成 my-r2/spec/coverage.md：运行 node my-r2/tools/coverage-matrix.cjs，再把真实操作 / 静态 / 动效 / 待验收四栏记录到 my-r2/spec/coverage-manual.json 后重新构建）</p>'; return; }
    if (!covCode || !COV.concepts[covCode]) covCode = COV.order[0];
    var c = COV.concepts[covCode]; var rows = c.rows || [];
    var sums = COLS.map(function (col) { return rows.filter(function (r) { return cellCls(col[0], r[col[0]]) === 'ok' || (col[0] === 'pending' && cellCls(col[0], r[col[0]]) === 'pend'); }).length; });
    var html = '<h2>覆盖表 <span class="apx-note">自动生成 ' + esc(COV.generated) + '</span></h2>' + legend +
      '<div class="cov-head"><label>方案 <select id="cov-sel">' + COV.order.map(function (k) { return '<option value="' + k + '"' + (k === covCode ? ' selected' : '') + '>' + k + ' ' + esc(COV.concepts[k].name) + '</option>'; }).join('') + '</select></label><span>' + rows.length + ' 个状态</span></div>' +
      '<div class="cov-sum">' + COLS.map(function (col, i) { return '<div><b>' + sums[i] + '/' + rows.length + '</b>' + col[1] + (col[0] === 'pending' ? '（有记录）' : '（✓）') + '</div>'; }).join('') + '</div>' +
      '<table class="cov-table"><thead><tr><th>状态</th><th>名称</th>' + COLS.map(function (col) { return '<th>' + col[1] + '</th>'; }).join('') + '</tr></thead><tbody>' +
      rows.map(function (r) { return '<tr><td class="key">' + esc(r.key) + '</td><td class="grp">' + esc(r.label) + '</td>' + COLS.map(function (col) { var v = r[col[0]]; return '<td class="' + cellCls(col[0], v) + '">' + (String(v || '').trim() ? esc(v) : '–') + '</td>'; }).join('') + '</tr>'; }).join('') +
      '</tbody></table>';
    box.innerHTML = html;
    $('#cov-sel').addEventListener('change', function () { covCode = this.value; renderCoverage(box); });
  }
  function renderEvidence(box) {
    var items = EV.items || [];
    if (!items.length) { box.innerHTML = '<h2>证据画廊</h2><p class="apx-missing">（尚未登记证据：python3 -I my-r2/tools/evidence-index.py 生成 my-r2/evidence/index.json 与缩略图后重新构建；画廊按方案分组内嵌缩略图，原图路径写在说明里）</p>'; return; }
    var groups = {}; var order = [];
    items.forEach(function (it) { var g = it.code || '其它'; if (!groups[g]) { groups[g] = []; order.push(g); } groups[g].push(it); });
    box.innerHTML = '<h2>证据画廊 <span class="apx-note">' + items.length + ' 项' + (EV.generated ? ' · 登记于 ' + esc(EV.generated) : '') + '</span></h2><p class="apx-note">缩略图在构建时内嵌；原图与帧序列在仓库 my-r2/evidence/ 下（路径见各项说明）。</p>' +
      order.map(function (g) { var c = META_ALL.filter(function (x) { return x.code === g; })[0]; return '<section class="ev-group"><h3>' + esc(g) + (c ? ' ' + esc(c.name) : '') + '</h3><div class="ev-grid">' + groups[g].map(function (it) { return '<figure class="ev-item">' + (it.src ? '<img src="' + it.src + '" alt="' + esc(it.title) + '" loading="lazy">' : '<div class="ev-none">未内嵌</div>') + '<figcaption><b>' + esc(it.title) + '</b>' + (it.group ? esc(it.group) + ' · ' : '') + esc(it.note) + '<br><code>' + esc(it.file) + '</code></figcaption></figure>'; }).join('') + '</div></section>'; }).join('');
  }

  /* ---------- routing: #overview · #concept/CNN · #compare · #appendix/<doc>; typed URLs and back / forward both work ---------- */
  function route() {
    var parts = (location.hash || '').slice(1).split('/');
    if (parts[0] === 'concept') { openConcept(SRC[parts[1]] ? parts[1] : currentCode, false); }
    else if (parts[0] === 'appendix') { if (parts[1] && DOC_KEYS[parts[1]]) currentDoc = parts[1]; show('appendix', false); }
    else if (parts[0] && views[parts[0]]) show(parts[0], false);
    else show('overview', false);
  }
  window.addEventListener('hashchange', route);
  window.addEventListener('popstate', route);
  route();
  window.JUShell = { openConcept: openConcept, show: show, mounts: mounts, stats: stats, sleep: sleep, wake: wake, unmountHost: unmountHost, syncClick: syncClick, stage: function (code) { return mounts.stage['stage:' + (code || currentCode) + ':']; }, current: function () { return { view: currentView, code: currentCode, doc: currentDoc }; } };
})();

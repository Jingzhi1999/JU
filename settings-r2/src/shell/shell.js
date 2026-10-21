(function () {
  'use strict';
  var SRC = window.__JUS_SOURCES, META = window.__JUS_META, DOCS = window.__JUS_DOCS;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var views = { overview: $('#v-overview'), concept: $('#v-concept'), compare: $('#v-compare'), appendix: $('#v-appendix') };
  var mounts = { preview: {}, stage: {}, compare: {} };
  function mountConcept(kind, code, host, props) {
    var key = kind + ':' + code + ':' + (props && props.preset || '');
    if (mounts[kind][key]) return mounts[kind][key];
    var m = DCMini.mount(host, SRC[code], Object.assign({ panel: kind === 'stage' }, props || {}));
    mounts[kind][key] = m; return m;
  }
  function show(view) {
    Object.keys(views).forEach(function (k) { views[k].classList.toggle('on', k === view); });
    document.querySelectorAll('.tab').forEach(function (t) { t.classList.toggle('on', t.dataset.view === view); });
    if (view === 'overview') buildOverview(); if (view === 'compare') buildCompare(); if (view === 'appendix') showDoc(currentDoc);
    try { history.replaceState(null, '', '#' + view + (view === 'concept' ? '/' + currentCode : '')); } catch (e) { }
  }
  document.querySelectorAll('.tab').forEach(function (t) { t.addEventListener('click', function () { show(t.dataset.view); }); });
  var ovBuilt = false;
  function buildOverview() {
    if (ovBuilt) return; ovBuilt = true;
    var grid = $('#ov-grid');
    if (!META.length) { grid.innerHTML = '<p class="lead">（本次构建不含任何方案源文件）</p>'; return; }
    META.forEach(function (c) {
      var card = document.createElement('div'); card.className = 'ov-card';
      card.innerHTML = '<div class="ov-head"><span class="ov-code">' + c.code + '</span><span class="ov-name">' + c.name + '</span></div><p class="ov-line">' + c.line + '</p>' +
        '<div class="ov-phones">' + [['s-home', '设置首页'], ['s-profile-edit', '资料编辑'], ['s-fav', '收藏列表'], ['s-record-absent', '记录详情'], ['s-fail', '保存失败']].map(function (st) { return '<div class="ov-ph"><div class="ph-host" data-jump="' + st[0] + '"></div><span class="ph-label">' + st[1] + '</span></div>'; }).join('') + '</div>' +
        '<div class="ov-foot"><span>' + (c.motions || []).slice(0, 3).map(function (m) { return m.split('：')[0]; }).join(' · ') + '</span><button type="button" class="btn">进入操作</button></div>';
      card.addEventListener('click', function () { openConcept(c.code); });
      grid.appendChild(card);
      card.querySelectorAll('.ph-host').forEach(function (h) { h.classList.add('preview'); var m = DCMini.mount(h, SRC[c.code], { panel: false, idle: true, persist: false }); mounts.preview['preview:' + c.code + ':' + h.dataset.jump] = m; var key = h.dataset.jump; setTimeout(function () { if (m.instance && m.instance.jumpTo && key !== 's-home') m.instance.jumpTo(key); }, 80); });
    });
  }
  var currentCode = META.length ? META[0].code : '';
  var rail = $('#rail'), stageWrap = $('#stage-wrap');
  META.forEach(function (c) { var b = document.createElement('button'); b.type = 'button'; b.innerHTML = '<span class="c">' + c.code + '</span>' + c.name; b.dataset.code = c.code; b.addEventListener('click', function () { openConcept(c.code); }); rail.appendChild(b); });
  function openConcept(code) {
    currentCode = code;
    rail.querySelectorAll('button').forEach(function (b) { b.classList.toggle('on', b.dataset.code === code); });
    var host = stageWrap.querySelector('[data-code="' + code + '"]');
    if (!host) { host = document.createElement('div'); host.className = 'stage-host'; host.dataset.code = code; stageWrap.appendChild(host); mountConcept('stage', code, host, { panel: true }); }
    stageWrap.querySelectorAll('.stage-host').forEach(function (h) { h.classList.toggle('on', h.dataset.code === code); });
    show('concept');
  }
  var cmpBuilt = false;
  function buildCompare() {
    if (cmpBuilt) return; cmpBuilt = true;
    ['cmp-a', 'cmp-b', 'cmp-c'].forEach(function (id, i) { var sel = $('#' + id); META.forEach(function (c) { var o = document.createElement('option'); o.value = c.code; o.textContent = c.code + ' ' + c.name; sel.appendChild(o); }); if (i < 2 && META[i]) sel.value = META[i].code; });
    function applyChecks() { var wrap = $('#cmp-stages'); wrap.classList.toggle('anon', $('#cmp-anon').checked); wrap.classList.toggle('gray', $('#cmp-gray').checked); views.compare.classList.toggle('pick', $('#cmp-scope').value === 'pick'); stages().forEach(function (h) { var i = h.__m && h.__m.instance; if (!i) return; var sz = $('#cmp-size').value.split(',').map(Number); if (i.setPhoneSize && (i.state.review.pw !== sz[0])) i.setPhoneSize(sz[0], sz[1]); if (i.setReview && !!i.state.review.rm !== $('#cmp-rm').checked) i.setReview({ rm: $('#cmp-rm').checked }); }); }
    var st = $('#cmp-state'); var idx = (window.JUS && JUS.INDEX) || [];
    idx.forEach(function (e) { var o = document.createElement('option'); o.value = e.key; o.textContent = e.group + ' · ' + e.label; st.appendChild(o); });
    function stages() { return Array.prototype.slice.call($('#cmp-stages').querySelectorAll('.cmp-host')); }
    function render() {
      var codes = $('#cmp-scope').value === 'all' ? META.map(function (c) { return c.code; }) : ['cmp-a', 'cmp-b', 'cmp-c'].map(function (id) { return $('#' + id).value; }).filter(Boolean);
      var wrap = $('#cmp-stages'); wrap.innerHTML = '';
      codes.forEach(function (code) { var h = document.createElement('div'); h.className = 'cmp-host' + ($('#cmp-panels').checked ? '' : ' nopanel'); h.dataset.code = code; h.dataset.idx = String(codes.indexOf(code) + 1); wrap.appendChild(h); var m = DCMini.mount(h, SRC[code], { panel: $('#cmp-panels').checked, persist: false }); h.__m = m; });
      applyChecks();
    }
    ['cmp-a', 'cmp-b', 'cmp-c', 'cmp-panels', 'cmp-scope'].forEach(function (id) { $('#' + id).addEventListener('change', render); });
    ['cmp-anon', 'cmp-gray', 'cmp-rm', 'cmp-size'].forEach(function (id) { $('#' + id).addEventListener('change', applyChecks); });
    $('#cmp-apply').addEventListener('click', function () { stages().forEach(function (h) { var i = h.__m && h.__m.instance; if (i && i.jumpTo) i.jumpTo(st.value); }); });
    $('#cmp-reset').addEventListener('click', function () { stages().forEach(function (h) { var i = h.__m && h.__m.instance; if (i && i.reset) i.reset(); }); });
    $('#cmp-speed1').addEventListener('click', function () { stages().forEach(function (h) { var i = h.__m && h.__m.instance; if (i && i.setSpeed) i.setSpeed(1); }); });
    $('#cmp-speed05').addEventListener('click', function () { stages().forEach(function (h) { var i = h.__m && h.__m.instance; if (i && i.setSpeed) i.setSpeed(0.5); }); });
    render();
  }
  var currentDoc = 'matrix';
  function showDoc(k) { currentDoc = k; document.querySelectorAll('.apx-tab').forEach(function (t) { t.classList.toggle('on', t.dataset.doc === k); }); $('#apx-doc').innerHTML = DOCS[k] || ''; }
  document.querySelectorAll('.apx-tab').forEach(function (t) { t.addEventListener('click', function () { showDoc(t.dataset.doc); }); });
  var hash = (location.hash || '').slice(1).split('/');
  if (hash[0] === 'concept' && SRC[hash[1]]) openConcept(hash[1]); else if (hash[0] && views[hash[0]]) show(hash[0]); else show('overview');
  window.JUShell = { openConcept: openConcept, show: show, mounts: mounts };
})();

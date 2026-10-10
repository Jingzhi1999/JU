(function () {
  'use strict';
  var SRC = window.__JU_SOURCES, META = window.__JU_META, DOCS = window.__JU_DOCS;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var views = { overview: $('#v-overview'), concept: $('#v-concept'), compare: $('#v-compare'), appendix: $('#v-appendix') };
  var mounts = { preview: {}, stage: {}, compare: {} };
  function mountConcept(kind, code, host, props) {
    var key = kind + ':' + code + ':' + (props && props.preset || '');
    if (mounts[kind][key]) return mounts[kind][key];
    var m = DCMini.mount(host, SRC[code], Object.assign({ panel: kind === 'stage' }, props || {}));
    mounts[kind][key] = m; return m;
  }
  /* ---- tabs ---- */
  function show(view) {
    Object.keys(views).forEach(function (k) { views[k].classList.toggle('on', k === view); });
    document.querySelectorAll('.tab').forEach(function (t) { t.classList.toggle('on', t.dataset.view === view); });
    if (view === 'overview') buildOverview(); if (view === 'compare') buildCompare(); if (view === 'appendix') showDoc(currentDoc);
    try { history.replaceState(null, '', '#' + view + (view === 'concept' ? '/' + currentCode : '')); } catch (e) { }
  }
  document.querySelectorAll('.tab').forEach(function (t) { t.addEventListener('click', function () { show(t.dataset.view); }); });
  /* ---- overview ---- */
  var ovBuilt = false;
  function buildOverview() {
    if (ovBuilt) return; ovBuilt = true;
    var grid = $('#ov-grid');
    META.forEach(function (c) {
      var card = document.createElement('div'); card.className = 'ov-card';
      card.innerHTML = '<div class="ov-head"><span class="ov-code">' + c.code + '</span><span class="ov-name">' + c.name + '</span></div><p class="ov-line">' + c.line + '</p>' +
        '<div class="ov-phones"><div class="ov-ph"><div class="ph-host" data-preset="joined"></div><span class="ph-label">我参加的</span></div><div class="ov-ph"><div class="ph-host" data-preset="hosted"></div><span class="ph-label">我发起的</span></div></div>' +
        '<div class="ov-foot"><span>' + (c.motions || []).slice(0, 3).map(function (m) { return m.split('：')[0]; }).join(' · ') + '</span><button type="button" class="btn">进入操作</button></div>';
      card.addEventListener('click', function () { openConcept(c.code); });
      grid.appendChild(card);
      card.querySelectorAll('.ph-host').forEach(function (h) { h.classList.add('preview'); mountConcept('preview', c.code, h, { preset: h.dataset.preset, idle: true, panel: false }); });
    });
  }
  /* ---- concept view ---- */
  var currentCode = META[0].code;
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
  /* ---- compare ---- */
  var cmpBuilt = false;
  function buildCompare() {
    if (cmpBuilt) return; cmpBuilt = true;
    ['cmp-a', 'cmp-b', 'cmp-c'].forEach(function (id, i) { var sel = $('#' + id); META.forEach(function (c) { var o = document.createElement('option'); o.value = c.code; o.textContent = c.code + ' ' + c.name; sel.appendChild(o); }); if (i < 2 && META[i]) sel.value = META[i].code; });
    var st = $('#cmp-state'); var idx = (window.JU && JU.INDEX) || [];
    var any = null; Object.keys(mounts.stage).some(function (k) { any = mounts.stage[k]; return true; });
    idx.forEach(function (e) { var o = document.createElement('option'); o.value = e.key; o.textContent = e.group + ' · ' + e.label; st.appendChild(o); });
    function stages() { return Array.prototype.slice.call($('#cmp-stages').querySelectorAll('.cmp-host')); }
    function render() {
      var codes = ['cmp-a', 'cmp-b', 'cmp-c'].map(function (id) { return $('#' + id).value; }).filter(Boolean);
      var wrap = $('#cmp-stages'); wrap.innerHTML = '';
      codes.forEach(function (code) { var h = document.createElement('div'); h.className = 'cmp-host' + ($('#cmp-panels').checked ? '' : ' nopanel'); h.dataset.code = code; wrap.appendChild(h); var m = DCMini.mount(h, SRC[code], { panel: $('#cmp-panels').checked }); h.__m = m; });
    }
    ['cmp-a', 'cmp-b', 'cmp-c', 'cmp-panels'].forEach(function (id) { $('#' + id).addEventListener('change', render); });
    $('#cmp-apply').addEventListener('click', function () { stages().forEach(function (h) { var i = h.__m && h.__m.instance; if (i && i.jumpTo) i.jumpTo(st.value); }); });
    $('#cmp-reset').addEventListener('click', function () { stages().forEach(function (h) { var i = h.__m && h.__m.instance; if (i && i.reset) i.reset(); }); });
    $('#cmp-speed1').addEventListener('click', function () { stages().forEach(function (h) { var i = h.__m && h.__m.instance; if (i && i.setSpeed) i.setSpeed(1); }); });
    $('#cmp-speed05').addEventListener('click', function () { stages().forEach(function (h) { var i = h.__m && h.__m.instance; if (i && i.setSpeed) i.setSpeed(0.5); }); });
    render();
  }
  /* ---- appendix ---- */
  var currentDoc = 'matrix';
  function showDoc(k) { currentDoc = k; document.querySelectorAll('.apx-tab').forEach(function (t) { t.classList.toggle('on', t.dataset.doc === k); }); $('#apx-doc').innerHTML = DOCS[k] || ''; }
  document.querySelectorAll('.apx-tab').forEach(function (t) { t.addEventListener('click', function () { showDoc(t.dataset.doc); }); });
  /* ---- boot ---- */
  var hash = (location.hash || '').slice(1).split('/');
  if (hash[0] === 'concept' && SRC[hash[1]]) openConcept(hash[1]); else if (hash[0] && views[hash[0]]) show(hash[0]); else show('overview');
  window.JUShell = { openConcept: openConcept, show: show, mounts: mounts };
})();

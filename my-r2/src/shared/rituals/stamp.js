/* stamp.js — 出席印记（08 散场：WebGL2 橡皮章落下盖印 → 今天这张票根 settle → 以前的局显现 → 翻阅）
   ───────────────────────────────────────────────────────────────────────────────
   原件判定（两处都能真实运行，见 spec/baseline-rituals.md §出席印记）：
   · 已认可原件 = V27 的 08 散场（用户侧主线）：/home/user/JU/.build/baseline/V27.html 第 427 行 ./ju-tickets2.js（window.JuTickets）
       盖章时间线 TL（秒）：enter .18→1.05 / press 1.05→1.34 / ink 1.40→1.52 / lift 1.70→2.20 / exit 2.20→2.85 / end 2.95；归档 INTRO_DUR 1.9s
       章 = 程序几何（橡胶垫 r=MARK.r、木块、车木把手），完全不透明，落下时真实遮住票面；按压时票面有 .045 的凹陷（uDent）
       章印 MARK 来自 stampAnchor(pack)：invite {x:.78,y:.82,r:.13}（相对贴图；r 为宽度比例）→ 局部坐标 (x−.5)·2.4, (.5−y)·3.0, r·2.4
       票根 mesh：2.4×3.0×.018（36×48 面片 + 圆角 .075 周边），纹理 720×900（JuFilm.paintCard）；章面纹理由 JuStamp.make()（600×600，印泥噪点）
       present = 深绿 rgb(45,106,75)「出席」，absent = 印泥红 rgb(178,58,44)「未出席」；环文 'JU / {city}' · 'WE WERE HERE' · 年份
       盖章姿态 pressPose：rx −26°（从高处看桌面上的票）；盖完 → introPose：0–.45 settle，随后 1–3 张以前的局从纵深显现（每张延迟 .13s，.48s）
       prefers-reduced-motion：不播放盖章，直接 ink=1、phase stamped → 归档 → browse（跳过 intro）
       没有视频帧：v2 引擎“不再有 Cycles 影片与接管帧”；ju-stamp.js 里的 Compositor / VID_QUAD / retexture 是 v1 影片遗留，V27 资源表里没有 mp4
   · R9（局主端逐人记录）= 同一引擎的宿主适配器：/home/user/JU/.build/baseline/R9.html 第 85014-85377 行 vendor/ju-tickets-host.js（window.JuTicketsHost）
       文件头声明“Source: byte-identical V27 ju-tickets2.js. Original geometry, shaders, C-path and wall controls retained.”
       差异：profile 'quick'（TL 压缩为 enter 0→.12 / press .12→.21 / ink .218→.26 / lift .29→.40 / exit .40→.54 / end .56，起落高度 1.15/.32/.72/2.1，
       退出时 alpha 淡出）；章锚点 invite 改为 {x:.78,y:.62,r:.11}（app.js 第 795 行，参加者姓名叠印在票面下方）；history / paintTicket / stampAnchor 可注入；
       onComplete 回调；setSettled(status) 直接构造终态；指针事件改挂在 stage 上。R9 的 ju-stamp.js 与 V27 逐字节相同。
   依赖（均为原件逐字节副本，见 assets/original/，顺序见 bundle.json）：
       assets/original/v27/ju-paper-film.js（JuFilm.paintCard，720×900 局卡贴图；不需要 ju-paper-model.js）
       assets/original/v27/ju-envelope.js（JuEnvelope.makeJuReverse，512×640 卡背；不需要 JU_CARD_DATA）
       assets/original/v27/ju-stamp.js（JuStamp.make / stampTo）
       assets/original/v27/ju-tickets2.js（JuTickets.mount）
       字体只按家族名引用：Libre Caslon Text / Caveat / Zhi Mang Xing / Space Mono / Noto Serif SC 900（打包时随共享包内联，见 bundle.json）
   打包约定：本文件**优先使用已存在的 window 全局**（JuTickets / JuStamp / JuFilm / JuEnvelope / JuLedger 垫片）；只有全局缺失时才按需注入
       assets/original/*.js（单文件交付时由构建按 bundle.json 一次性合并，运行时不会 fetch）。
   V27 页面侧编排（第 3488-3522 行）：JuTickets.mount(el,{mode:att8,active:()=>nearScreen('s08'),onPhase})；t08Sync → setEvent({...r.event}) → setMode(att8)；
       replay8 → _t08.replay()；att8 = record.attendance（'pending'|'present'|'absent'，第 4190 行）；出席事实写入 JuLedger.attend(v,k)（review-tools.js）→ refresh18：
       **先写 attendance，再 setMode 播章**（动画只是结果的呈现）。
   settled（本文件新增的呈现方式，引擎未改）：进入历史 / 已记录的局不重放盖章——setMode 之后在引擎自己的时间线上 seek：
       把 state.stamp.t0 拨到 TL.end 之外 step() 一次（→ ink=1、phase stamped、startIntro），再把 state.intro.t0 拨到 INTRO_DUR 之外 step() 一次（→ beginBrowse），
       render()。章已在卡上、历史卡已显现；replay() 仍可重播完整序列；减少动态时引擎自身就走这条路（play() 直接 ink=1 → browse）。R9 适配器用其 setSettled()。
   stampFace（轻量章面，供局主侧逐人出席记录每行落章，不为每行开 WebGL2）：同一张 JuStamp.make() 章面（600×600 印泥噪点），
       按 V27 原件的尺寸输出：圈径 ≈64px @1x（= 2 × .13 × 245.5 卡宽），旋转 −11°（与 MARK.rot 一致，也是 juStamp 关键帧的终点），
       mix-blend-mode multiply 压在纸面上；present / absent 直接用原件 stampTo；pending（待定，灰墨）V27 没有——按同一绘制程序参数化生成，属扩展，已标注。
   键盘：画布 browse 态 ArrowUp/Down/Left/Right 翻阅，Home/End 首尾，Enter/Space 翻面（引擎自带）；盖章本身由状态触发，本文件提供 replay()/setMode()/settle() 作为按钮入口。
   ─────────────────────────────────────────────────────────────────────────────── */
(function () {
  'use strict';
  const NS = window.JURitual = window.JURitual || {};
  const BASE = (() => { const s = document.currentScript && document.currentScript.src; return s ? s.slice(0, s.lastIndexOf('/') + 1) : ''; })();
  const ENGINES = [
    { global: 'JuFilm', path: 'assets/original/v27/ju-paper-film.js' },
    { global: 'JuEnvelope', path: 'assets/original/v27/ju-envelope.js' },
    { global: 'JuStamp', path: 'assets/original/v27/ju-stamp.js' },
    { global: 'JuTickets', path: 'assets/original/v27/ju-tickets2.js' },
  ];
  const R9 = [{ global: 'JuTicketsHost', path: 'assets/original/r9/ju-tickets-host.js' }];
  const loadScript = src => new Promise((ok, no) => { const s = document.createElement('script'); s.src = src; s.onload = ok; s.onerror = () => no(new Error('load ' + src)); document.head.appendChild(s); });
  let loading = null;
  /* 全局优先：已存在的 window 全局一律复用；缺失的才按需注入（单文件打包后这里永远不会发请求） */
  function ensure(adapter) {
    const need = ENGINES.concat(adapter === 'r9' ? R9 : []).filter(e => !window[e.global]);
    if (!need.length) return Promise.resolve();
    loading = (loading || Promise.resolve()).then(async () => { for (const e of need) if (!window[e.global]) await loadScript(BASE + e.path); });
    return loading;
  }
  /* V27 s08 的 DOM 钩子（第 1329-1335 行）：缺则建 */
  function scaffold(host) {
    if (host.querySelector('[data-t08="canvas"]')) return host;
    if (!host.hasAttribute('data-t08-scope')) host.setAttribute('data-t08-scope', '1');
    host.insertAdjacentHTML('beforeend',
      '<div data-t08-root="1" class="ju-t08-root"><div data-t08="stage" class="ju-t08-stage">' +
      '<canvas data-t08="canvas" tabindex="0" role="img" aria-label="票根：上下拖动翻阅以前的局，点一下翻到背面"></canvas>' +
      '<img data-t08="flat" alt="当前票根"></div>' +
      '<span data-t08="hint" class="ju-t08-hint">上下滑动 · 翻以前的局　点一下 · 看背面</span>' +
      '<div data-t08="hidden" aria-hidden="true"></div></div>');
    return host;
  }
  /* JuLedger 垫片：只在页面没有 V27 账本时安装（ju-tickets2.js 通过它取当前局与个人历史） */
  function shim(event, history) {
    if (window.JuLedger && window.JuLedger.personalHistory && !window.JuLedger.__juRitualShim) return false;
    window.JuLedger = { original: event, lookup: () => null, eventProjection: e => e, personalHistory: () => history || [], __juRitualShim: true };
    return true;
  }
  const TL = { enter0: .18, enter1: 1.05, press0: 1.05, press1: 1.34, ink0: 1.40, ink1: 1.52, lift0: 1.70, lift1: 2.20, exit0: 2.20, exit1: 2.85, end: 2.95, intro: 1.9 };
  const waitReady = (t, max) => new Promise(ok => { let n = 0; const f = () => { if ((t.diag && t.diag().ready) || n++ > (max || 240)) ok(); else requestAnimationFrame(f); }; f(); });
  /* settled：在 V27 引擎自己的时间线上 seek 到 browse 终态（不另造终态，引擎未改） */
  function settleV27(t) {
    const now = performance.now();
    if (t.state && t.state.stamp) { t.state.stamp.t0 = now - (TL.end * 1000 + 50); t.step(now); }   // → ink=1 · stamped · startIntro()
    if (t.state && t.state.intro) { t.state.intro.t0 = now - (TL.intro * 1000 + 50); t.step(now); } // → beginBrowse()
    t.render();
  }
  /* data：{event:{id,city,pack,title,en,wd,date,dateNum,time,loc,host,capacity,seats}, mode:'pending'|'present'|'absent', history:[{id,event,attendance,endedAt}]}
     opts：{adapter:'v27'|'r9', settled:boolean, active():boolean, onPhase(p), onIndex(i,card), onComplete(r), profile}
       settled:true → 直接呈现盖章完成后的 browse 终态（章已在卡上、历史卡显现），不播 enter→press→ink→lift→exit；只有“刚记录的那次”才不传 settled
     返回 Promise<handle>：{engine, adapter, replay(), setMode(m), settle(m), diag(), destroy(), done: Promise(phase==='browse')} */
  NS.stamp = async function (host, data, opts) {
    opts = opts || {}; data = data || {};
    const adapter = opts.adapter === 'r9' ? 'r9' : 'v27';
    await ensure(adapter);
    await document.fonts.ready;
    const event = Object.assign({ id: 'NYC|invite|本场', city: 'NYC', pack: 'invite', wd: 'FRI', date: '', time: '', loc: '', host: '', capacity: 4, seats: 1 }, data.event || {});
    const root = scaffold(host.closest('[data-t08-scope]') || host);
    if (adapter === 'v27') shim(event, data.history);
    else if (window.JuLedger && window.JuLedger.__juRitualShim) { window.JuLedger.original = event; }
    let resolveDone; const done = new Promise(ok => { resolveDone = ok; });
    const onPhase = p => { if (opts.onPhase) opts.onPhase(p); if (p === 'browse') resolveDone({ ok: true, phase: p }); };
    let engine;
    const mode = data.mode && data.mode !== 'pending' ? data.mode : null;
    if (adapter === 'r9') {
      const anchor = e => e.stampAnchor || ({ invite: { x: .78, y: .62, r: .11 }, street: { x: .78, y: .17, r: .13 }, grain: { x: .72, y: .38, r: .15 }, mono: { x: .76, y: .18, r: .12 }, riso: { x: .79, y: .73, r: .12 }, acid: { x: .77, y: .17, r: .12 } })[e.pack];
      engine = window.JuTicketsHost.mount(root, { profile: opts.profile || 'quick', event, mode: 'pending', history: () => data.history || [], stampAnchor: anchor, active: opts.active, onPhase, onComplete: r => { if (opts.onComplete) opts.onComplete(r); if (opts.profile !== 'archive') resolveDone({ ok: true, phase: 'stamped', result: r }); } });
      if (mode && opts.settled) engine.setSettled(mode); else { engine.setSettled('pending'); if (mode) engine.setMode(mode); }
    } else {
      engine = window.JuTickets.mount(root, { mode: 'pending', active: opts.active || (() => true), onPhase, onIndex: opts.onIndex });
      engine.setEvent(Object.assign({}, event));
      if (mode) { await waitReady(engine); engine.setMode(mode); if (opts.settled) settleV27(engine); }
    }
    const handle = {
      engine, adapter, done,
      replay: () => engine.replay(),                       // 完整序列（V27 replay → playAttendanceSequence）
      setMode: m => engine.setMode(m),                     // 刚记录的那次：播序列
      settle: m => { if (adapter === 'r9') return engine.setSettled(m || 'present'); engine.setMode(m || 'present'); settleV27(engine); return true; },
      diag: () => engine.diag(),
      destroy: () => { try { engine.destroy(); } catch (e) { } },
    };
    root.__juritualStamp = handle;
    return handle;
  };
  NS.stamp.TIMELINE = TL;
  NS.stamp.TIMELINE_R9_QUICK = { enter0: 0, enter1: .12, press0: .12, press1: .21, ink0: .218, ink1: .26, lift0: .29, lift1: .40, exit0: .40, exit1: .54, end: .56 };
  NS.stamp.INK = { present: [45, 106, 75], absent: [178, 58, 44] };
  NS.stamp.ANCHOR_V27 = { invite: { x: .78, y: .82, r: .13 }, street: { x: .78, y: .17, r: .13 }, grain: { x: .72, y: .38, r: .15 }, mono: { x: .76, y: .18, r: .12 }, riso: { x: .79, y: .76, r: .12 }, acid: { x: .77, y: .17, r: .12 } };
  NS.stamp.ensure = ensure;
  NS.stamp.ENGINES = ENGINES.map(e => e.path);

  /* ── stampFace：同一章面、轻量落章 ───────────────────────────────────────────────
     JuStamp.make(variant) 画的是 600×600 章面：外圈半径 280（线宽 9）、内圈 252、72 刻度、'JU / {city}' 700 26px Space Mono、
     「出席」900 168px Noto Serif SC（>2 字 122px）、'WE WERE HERE' 700 24px、年份 700 22px，再叠印泥噪点；stampTo() 以 k = rx/280 缩放。
     V27 原件在局卡上的尺寸：rx = .13 × 卡宽 245.5 = 31.9px → 圈径 ≈64px @1x；旋转 −11°。 */
  const PENDING_INK = [113, 119, 133];   // 灰墨（扩展：V27 没有 pending 章，待定只是不盖）
  let pendingCache = {};
  function pendingFace(metadata) {
    // JuStamp.make 的参数化复刻（几何、字体、噪点同原件；只改墨色与文字），仅用于 pending
    const city = metadata && metadata.city || 'NYC', year = metadata && metadata.year || '2026', key = city + '|' + year;
    if (pendingCache[key]) return pendingCache[key];
    const S = 600, c = document.createElement('canvas'); c.width = c.height = S; const g = c.getContext('2d');
    const col = 'rgb(' + PENDING_INK.join(',') + ')';
    g.translate(S / 2, S / 2); g.strokeStyle = col; g.fillStyle = col; g.lineCap = 'round';
    g.lineWidth = 9; g.beginPath(); g.arc(0, 0, 280, 0, Math.PI * 2); g.stroke();
    g.lineWidth = 3; g.beginPath(); g.arc(0, 0, 252, 0, Math.PI * 2); g.stroke();
    for (let k = 0; k < 72; k++) { const a = k / 72 * Math.PI * 2, long = k % 3 === 0; g.lineWidth = long ? 3 : 2; g.beginPath(); g.moveTo(Math.cos(a) * 258, Math.sin(a) * 258); g.lineTo(Math.cos(a) * (long ? 275 : 268), Math.sin(a) * (long ? 275 : 268)); g.stroke(); }
    const mono = "'Space Mono', Menlo, monospace", serif = "'Noto Serif SC', 'Songti SC', 'STSong', serif";
    g.textAlign = 'center'; g.textBaseline = 'middle';
    if ('letterSpacing' in g) g.letterSpacing = '7px';
    g.font = '700 26px ' + mono; g.fillText('JU / ' + city, 0, -128);
    const text = '待定';
    if ('letterSpacing' in g) g.letterSpacing = '14px';
    g.font = '900 168px ' + serif; g.fillText(text, 7, 4);
    if ('letterSpacing' in g) g.letterSpacing = '6px';
    g.font = '700 24px ' + mono; g.fillText('WE WERE HERE', 0, 118);
    g.font = '700 22px ' + mono; g.fillText(String(year), 0, 154);
    g.setTransform(1, 0, 0, 1, 0, 0);
    // 印泥噪点（同 JuStamp.noise：LCG 种子 90210）
    const nc = document.createElement('canvas'); nc.width = nc.height = 256; const ng = nc.getContext('2d'), nid = ng.createImageData(256, 256); let s = 90210; const nd = nid.data;
    for (let i = 0; i < nd.length; i += 4) { s = (Math.imul(s, 1664525) + 1013904223) >>> 0; nd[i] = nd[i + 1] = nd[i + 2] = 255; nd[i + 3] = s >>> 24; }
    ng.putImageData(nid, 0, 0);
    const id = g.getImageData(0, 0, S, S), d = id.data, n = nd;
    const blot = document.createElement('canvas'); blot.width = blot.height = S; const bg = blot.getContext('2d'); bg.imageSmoothingEnabled = true; bg.drawImage(nc, 0, 0, 24, 24, 0, 0, S, S);
    const bd = bg.getImageData(0, 0, S, S).data;
    for (let p = 0; p < d.length; p += 4) {
      if (!d[p + 3]) continue;
      const x = (p / 4) % S, y = (p / 4 / S) | 0;
      const fine = n[(((y & 255) * 256) + (x & 255)) * 4 + 3] / 255, big = bd[p + 3] / 255;
      let a = (0.62 + 0.38 * fine) * (0.72 + 0.42 * big);
      if (fine < 0.07) a *= 0.25;
      d[p + 3] = Math.round(Math.max(0, Math.min(1, d[p + 3] / 255 * a)) * 235);
    }
    g.putImageData(id, 0, 0);
    pendingCache[key] = c; return c;
  }
  /* mode: 'present'|'absent'|'pending'；opts: {diameter:64, dpr, city:'NYC', year:'2026', dataURL:true}
     返回 {canvas, dataURL, width, height, diameter, rotate:-11, blend:'multiply', mode}；canvas 未旋转（旋转交给 CSS / juStamp 关键帧的终点 −11°）
     需要 window.JuStamp 已就绪且字体已载入（先 await JURitual.stampFace.ready()） */
  NS.stampFace = function (mode, opts) {
    opts = opts || {};
    if (!window.JuStamp) throw new Error('JURitual.stampFace: window.JuStamp 未就绪（先 await JURitual.stampFace.ready()）');
    const diameter = opts.diameter || 64, dpr = Math.min(opts.dpr || window.devicePixelRatio || 1, 2);
    const size = Math.ceil(diameter * 600 / 560);          // 600 画布单位 / (2 × 280 圈半径)
    const c = document.createElement('canvas'); c.width = c.height = Math.round(size * dpr); c.style.width = c.style.height = size + 'px';
    const g = c.getContext('2d'); g.scale(dpr, dpr);
    const meta = { city: opts.city || 'NYC', year: opts.year || '2026' };
    if (mode === 'pending') { const k = (diameter / 2) / 280; g.save(); g.translate(size / 2, size / 2); g.scale(k, k); g.drawImage(pendingFace(meta), -300, -300); g.restore(); }
    else window.JuStamp.stampTo(g, mode === 'absent' ? 'absent' : 'present', size / 2, size / 2, diameter / 2, diameter / 2, 0, 1, meta);
    c.className = 'ju-stamp-face'; c.dataset.mode = mode; c.setAttribute('aria-label', mode === 'absent' ? '未出席' : mode === 'pending' ? '待定' : '出席');
    return { canvas: c, dataURL: opts.dataURL === false ? null : c.toDataURL('image/png'), width: size, height: size, diameter, rotate: -11, blend: 'multiply', mode };
  };
  NS.stampFace.ready = () => ensure('v27').then(() => document.fonts.ready);
  /* 把章面落到某一行：el 为纸面上的落章位（position:relative），返回 canvas；pressed=true 时播 juStamp .55s（原件第 78 行关键帧，终点 −11°） */
  NS.stampFace.mount = function (el, mode, opts) {
    opts = opts || {};
    const face = NS.stampFace(mode, opts), c = face.canvas;
    c.style.transform = 'rotate(' + face.rotate + 'deg)';
    if (opts.pressed) c.dataset.pressed = 'true';
    el.querySelectorAll('.ju-stamp-face').forEach(old => old.remove());
    el.appendChild(c);
    return Object.assign(face, { press: () => { c.dataset.pressed = 'false'; void c.offsetWidth; c.dataset.pressed = 'true'; return face; }, remove: () => c.remove() });
  };
  NS.stampFace.PENDING_INK = PENDING_INK;
})();

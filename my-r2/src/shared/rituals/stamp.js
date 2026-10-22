/* stamp.js — 出席印记（08 散场：WebGL2 橡皮章落下盖印 → 今天这张票根 settle → 以前的局显现 → 翻阅）
   ───────────────────────────────────────────────────────────────────────────────
   原件判定（两处都能真实运行，见 spec/baseline-rituals.md §出席印记）：
   · 已认可原件 = V27 的 08 散场（用户侧主线）：/home/user/JU/.build/baseline/V27.html 第 427 行 ./ju-tickets2.js（window.JuTickets）
       盖章时间线 TL（秒）：enter .18→1.05 / press 1.05→1.34 / ink 1.40→1.52 / lift 1.70→2.20 / exit 2.20→2.85 / end 2.95；归档 INTRO_DUR 1.9s
       章 = 程序几何（橡胶垫 r=MARK.r、木块、车木把手），完全不透明，落下时真实遮住票面；按压时票面有 .045 的凹陷（uDent）
       章印 MARK 来自 stampAnchor(pack)：invite {x:.78,y:.82,r:.13}（相对 1200×1600 贴图；r 为宽度比例）→ 局部坐标 (x−.5)·2.4, (.5−y)·3.0, r·2.4
       票根 mesh：2.4×3.0×.018（36×48 面片 + 圆角 .075 周边），纹理 720×900（JuFilm.paintCard）；章面纹理由 JuStamp.make()（600×600，印泥噪点）
       present = 深绿 rgb(45,106,75)「出席」，absent = 印泥红 rgb(178,58,44)「未出席」；环文 'JU / {city}' · 'WE WERE HERE' · 年份
       盖章姿态 pressPose：rx −26°（从高处看桌面上的票）；盖完 → introPose：0–.45 settle，随后 1–3 张以前的局从纵深显现（每张延迟 .13s，.48s）
       prefers-reduced-motion：不播放盖章，直接 ink=1、phase stamped → 归档 → browse（跳过 intro）
       没有视频帧：v2 引擎“不再有 Cycles 影片与接管帧”；ju-stamp.js 里的 Compositor / VID_QUAD / retexture 是 v1 影片遗留，V27 资源表里没有 mp4
   · R9（局主端逐人记录）= 同一引擎的宿主适配器：/home/user/JU/.build/baseline/R9.html 第 85014-85377 行 vendor/ju-tickets-host.js（window.JuTicketsHost）
       文件头声明“Source: byte-identical V27 ju-tickets2.js. Original geometry, shaders, C-path and wall controls retained.”
       差异：profile 'quick'（TL 压缩为 enter 0→.12 / press .12→.21 / ink .218→.26 / lift .29→.40 / exit .40→.54 / end .56，起落高度 1.15/.32/.72/2.1，
       退出时 alpha 淡出）；章锚点 invite 改为 {x:.78,y:.62,r:.11}（app.js 第 795 行，参加者姓名叠印在票面下方）；history / paintTicket / stampAnchor 可注入；
       onComplete 回调；指针事件改挂在 stage 上。R9 的 ju-stamp.js 与 V27 逐字节相同。
   依赖（均为原件逐字节副本，见 assets/original/）：
       assets/original/v27/ju-paper-film.js（JuFilm.paintCard，720×900 局卡贴图；不需要 ju-paper-model.js）
       assets/original/v27/ju-envelope.js（JuEnvelope.makeJuReverse，512×640 卡背；不需要 JU_CARD_DATA）
       assets/original/v27/ju-stamp.js（JuStamp.make / stampTo）
       assets/original/v27/ju-tickets2.js（JuTickets.mount）
       字体：Libre Caslon Text / Caveat / Zhi Mang Xing / Space Mono / Noto Serif SC 900（assets/fonts/fonts.css）
   V27 页面侧编排（第 3488-3522 行）：JuTickets.mount(el,{mode:att8,active:()=>nearScreen('s08'),onPhase})；t08Sync → setEvent({...r.event}) → setMode(att8)；
       replay8 → _t08.replay()；att8 'pending'|'present'|'absent'；出席事实写入 JuLedger.attend(v,k)（review-tools.js），与动画分离：
       **先写 attendance，再 setMode 播章**（动画只是结果的呈现）。
   键盘：画布 browse 态 ArrowUp/Down/Left/Right 翻阅，Home/End 首尾，Enter/Space 翻面（引擎自带）；盖章本身由状态触发，本文件提供 replay()/setMode() 作为按钮入口。
   ─────────────────────────────────────────────────────────────────────────────── */
(function () {
  'use strict';
  const NS = window.JURitual = window.JURitual || {};
  const BASE = (() => { const s = document.currentScript && document.currentScript.src; return s ? s.slice(0, s.lastIndexOf('/') + 1) : ''; })();
  const ENGINES = ['assets/original/v27/ju-paper-film.js', 'assets/original/v27/ju-envelope.js', 'assets/original/v27/ju-stamp.js', 'assets/original/v27/ju-tickets2.js'];
  const R9 = ['assets/original/r9/ju-tickets-host.js'];
  const loadScript = src => new Promise((ok, no) => { const s = document.createElement('script'); s.src = src; s.onload = ok; s.onerror = () => no(new Error('load ' + src)); document.head.appendChild(s); });
  let loading = null;
  function ensure(adapter) {
    const need = (window.JuTickets ? [] : ENGINES).concat(adapter === 'r9' && !window.JuTicketsHost ? R9 : []);
    if (!need.length) return Promise.resolve();
    loading = (loading || Promise.resolve()).then(async () => { for (const f of need) if (!(f.includes('tickets2') && window.JuTickets) && !(f.includes('tickets-host') && window.JuTicketsHost)) await loadScript(BASE + f); });
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
    if (window.JuLedger && window.JuLedger.personalHistory) return false;
    window.JuLedger = { original: event, lookup: () => null, eventProjection: e => e, personalHistory: () => history || [], __juRitualShim: true };
    return true;
  }
  /* data：{event:{id,city,pack,title,en,wd,date,dateNum,time,loc,host,capacity,seats}, mode:'pending'|'present'|'absent', history:[{id,event,attendance,endedAt}]}
     opts：{adapter:'v27'|'r9', active():boolean, onPhase(p), onIndex(i,card)}
     返回 Promise<handle>：{engine, replay(), setMode(m), diag(), destroy(), done: Promise(phase==='browse')} */
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
    if (adapter === 'r9') {
      const anchor = e => e.stampAnchor || ({ invite: { x: .78, y: .62, r: .11 }, street: { x: .78, y: .17, r: .13 }, grain: { x: .72, y: .38, r: .15 }, mono: { x: .76, y: .18, r: .12 }, riso: { x: .79, y: .73, r: .12 }, acid: { x: .77, y: .17, r: .12 } })[e.pack];
      engine = window.JuTicketsHost.mount(root, { profile: opts.profile || 'quick', event, mode: 'pending', history: () => data.history || [], stampAnchor: anchor, active: opts.active, onPhase, onComplete: r => { if (opts.onComplete) opts.onComplete(r); if (opts.profile !== 'archive') resolveDone({ ok: true, phase: 'stamped', result: r }); } });
      engine.setSettled('pending');
      if (data.mode && data.mode !== 'pending') engine.setMode(data.mode);
    } else {
      engine = window.JuTickets.mount(root, { mode: data.mode || 'pending', active: opts.active || (() => true), onPhase, onIndex: opts.onIndex });
      engine.setEvent(Object.assign({}, event));
      if (data.mode && data.mode !== 'pending') engine.setMode(data.mode);
    }
    const handle = {
      engine, adapter, done,
      replay: () => engine.replay(),
      setMode: m => engine.setMode(m),
      diag: () => engine.diag(),
      destroy: () => { try { engine.destroy(); } catch (e) { } },
    };
    root.__juritualStamp = handle;
    return handle;
  };
  NS.stamp.TIMELINE = { enter0: .18, enter1: 1.05, press0: 1.05, press1: 1.34, ink0: 1.40, ink1: 1.52, lift0: 1.70, lift1: 2.20, exit0: 2.20, exit1: 2.85, end: 2.95, intro: 1.9 };
  NS.stamp.TIMELINE_R9_QUICK = { enter0: 0, enter1: .12, press0: .12, press1: .21, ink0: .218, ink1: .26, lift0: .29, lift1: .40, exit0: .40, exit1: .54, end: .56 };
  NS.stamp.INK = { present: [45, 106, 75], absent: [178, 58, 44] };
  NS.stamp.ANCHOR_V27 = { invite: { x: .78, y: .82, r: .13 }, street: { x: .78, y: .17, r: .13 }, grain: { x: .72, y: .38, r: .15 }, mono: { x: .76, y: .18, r: .12 }, riso: { x: .79, y: .76, r: .12 }, acid: { x: .77, y: .17, r: .12 } };
  NS.stamp.ensure = ensure;
})();

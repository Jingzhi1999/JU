/* ============================================================================
 * JU 共有语言 · skins.js —— 三种背景环境的统一外壳接口（新写的封装层；引擎本体均为原件，未改）
 *
 *   JU.shared.skins.mount(hostEl, name /* 'cotton' | 'halo' | 'sunset' *\/, { live: boolean, exclusive?: boolean })
 *   JU.shared.skins.unmount(hostEl)
 *   JU.shared.skins.pause(hostEl)  /  JU.shared.skins.resume(hostEl)
 *   JU.shared.skins.setSkin(hostEl, name)
 *   JU.shared.skins.setLive(hostEl)        // 把 live 让给这个宿主（其余自动转静态）
 *   JU.shared.skins.state(hostEl)          // { name, live, paused, engine: 'cotton-bg'|'ju-halo-skin'|'ju-sunset-skin'|'static' }
 *
 * 引擎来源：
 *   cotton —— <cotton-bg>，V27 原件（backgrounds.js = V27.html data["./cotton-bg.js"] 原样解码），需要 window.JU_THREE
 *             （vendor-three.js = V27.code.html L423 的 ./vendor/three-r185.js 原样解码，three.js r185，MIT）。
 *   halo / sunset —— <ju-halo-skin> / <ju-sunset-skin>，R9 原件（skins-r9.js = R9.code.html L82119-L82749 / L82752-L83313），裸 WebGL1，无其他依赖。
 * 加载顺序：vendor-three.js → backgrounds.js → skins-r9.js → skins.js（缺少 vendor-three.js 时 cotton 自动退为静态）。
 *
 * 规则：
 *   1. 同一页面多个宿主可以各自 mount，但同一时刻只允许一个 live（最后一次 live=true 的 mount / setLive 获得 live，
 *      其余宿主自动转为静态快照 + CSS 渐变），这是交付外壳「非当前方案停止消耗资源」的需要。诊断用途可传 { exclusive:false } 允许多 live。
 *   2. live=false、WebGL 不可用、或 prefers-reduced-motion 时，用静态 CSS 回退：每种环境按实测像素取的 3–5 个采样色写成渐变
 *      （PALETTES；采样方法与数值见 spec/baseline-v27.md「三环境」一节）。
 *   3. pause(host)：把当前帧快照到一张 2D canvas 覆盖在上面，然后把引擎元素从 DOM 摘下（三种引擎的共享渲染器在没有实例时都会停掉 rAF）；
 *      resume(host)：重新挂回引擎元素，下一帧出来后撤掉快照。cotton 引擎的帧在 el._c2（原件内部 2D 拷贝），halo/sunset 的帧在 shadowRoot 的 canvas。
 *   4. setSkin：按 R9 的切换方式做交叉淡入（opacity .25→1 + blur 12px→0，650ms，R9.code.html L87300）；reduced-motion 时直接替换。
 * ========================================================================== */
(function () {
  'use strict';
  const NS = (window.JU = window.JU || {});
  NS.shared = NS.shared || {};
  if (NS.shared.skins) return;

  const ENGINES = {
    cotton: { tag: 'cotton-bg', ready: () => !!(window.JU_THREE && customElements.get('cotton-bg')), frameCanvas: el => el._c2 || null },
    halo: { tag: 'ju-halo-skin', ready: () => !!customElements.get('ju-halo-skin'), frameCanvas: el => el.shadowRoot && el.shadowRoot.querySelector('canvas') },
    sunset: { tag: 'ju-sunset-skin', ready: () => !!customElements.get('ju-sunset-skin'), frameCanvas: el => el.shadowRoot && el.shadowRoot.querySelector('canvas') },
  };

  // 静态回退色板：由 skins-demo.html 的 live 渲染首帧按 5 点采样（左上 / 右上 / 中 / 左下 / 右下 + 均值）得到，
  // 见 evidence/baseline/v27/skins-samples.json；每条 css 的亮度与原件首帧接近（对比度表见 spec）。
  const PALETTES = {
    /*PALETTE:cotton*/ cotton: {"base": "#dfdfe7", "stops": ["#dfdee6", "#d6e0e8", "#dfdfe7", "#e3e1e9", "#dbe3ea", "#e4dce5", "#dde3ea"], "css": "radial-gradient(70% 48% at 10% 6%, rgba(228,220,229,0.9) 0%, rgba(228,220,229,0) 70%), radial-gradient(60% 42% at 90% 6%, rgba(215,224,231,0.75) 0%, rgba(215,224,231,0) 70%), radial-gradient(60% 44% at 10% 94%, rgba(219,227,234,0.8) 0%, rgba(219,227,234,0) 70%), radial-gradient(70% 48% at 90% 94%, rgba(221,227,234,0.9) 0%, rgba(221,227,234,0) 70%), linear-gradient(180deg, #dfdee6 0%, #d6e0e8 25%, #dfdfe7 50%, #e3e1e9 75%, #dbe3ea 100%)"},
    /*PALETTE:halo*/ halo: {"base": "#e48b3c", "stops": ["#cfaea9", "#db9c66", "#e48b3c", "#e48543", "#d59c83", "#d4ad89", "#f16406"], "css": "radial-gradient(70% 48% at 10% 6%, rgba(212,173,137,0.9) 0%, rgba(212,173,137,0) 70%), radial-gradient(60% 42% at 90% 6%, rgba(204,175,187,0.75) 0%, rgba(204,175,187,0) 70%), radial-gradient(60% 44% at 10% 94%, rgba(177,225,255,0.8) 0%, rgba(177,225,255,0) 70%), radial-gradient(70% 48% at 90% 94%, rgba(241,100,6,0.9) 0%, rgba(241,100,6,0) 70%), linear-gradient(180deg, #cfaea9 0%, #db9c66 25%, #e48b3c 50%, #e48543 75%, #d59c83 100%)"},
    /*PALETTE:sunset*/ sunset: {"base": "#cfa1a0", "stops": ["#ff9f6b", "#f7ac7a", "#cfa1a0", "#b2a5bc", "#9bacd4", "#ffa168", "#9caed3"], "css": "radial-gradient(70% 48% at 10% 6%, rgba(255,161,104,0.9) 0%, rgba(255,161,104,0) 70%), radial-gradient(60% 42% at 90% 6%, rgba(255,155,107,0.75) 0%, rgba(255,155,107,0) 70%), radial-gradient(60% 44% at 10% 94%, rgba(148,170,219,0.8) 0%, rgba(148,170,219,0) 70%), radial-gradient(70% 48% at 90% 94%, rgba(156,174,211,0.9) 0%, rgba(156,174,211,0) 70%), linear-gradient(180deg, #ff9f6b 0%, #f7ac7a 25%, #cfa1a0 50%, #b2a5bc 75%, #9bacd4 100%)"},
  };

  const hosts = new Map();
  let liveHost = null;
  let webgl = null;

  function webglOK() {
    if (webgl !== null) return webgl;
    try {
      const c = document.createElement('canvas');
      webgl = !!(c.getContext('webgl', { failIfMajorPerformanceCaveat: false }) || c.getContext('experimental-webgl'));
    } catch (e) { webgl = false; }
    return webgl;
  }
  const reduced = () => !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const canLive = name => !!(ENGINES[name] && ENGINES[name].ready() && webglOK() && !reduced());

  function layerEl() {
    const d = document.createElement('div');
    d.className = 'ju-skin-layer';
    d.setAttribute('aria-hidden', 'true');
    d.style.cssText = 'position:absolute;inset:0;z-index:0;pointer-events:none;overflow:hidden;';
    return d;
  }
  function staticEl(name) {
    const d = document.createElement('div');
    d.className = 'ju-skin-static';
    d.dataset.skin = name;
    d.style.cssText = 'position:absolute;inset:0;background-color:' + PALETTES[name].base + ';background-image:' + PALETTES[name].css + ';';
    return d;
  }
  function engineEl(name) {
    const el = document.createElement(ENGINES[name].tag);
    el.setAttribute('seed', '1');
    el.setAttribute('aria-hidden', 'true');
    if (name !== 'cotton') el.style.cssText = 'position:absolute;inset:0;display:block';
    return el;
  }
  function snapshot(rec) {
    const src = rec.engine && ENGINES[rec.name].frameCanvas(rec.engine);
    if (!src || !src.width || !src.height) return null;
    const c = document.createElement('canvas');
    const w = Math.max(2, rec.host.clientWidth), h = Math.max(2, rec.host.clientHeight);
    c.width = w; c.height = h;
    c.className = 'ju-skin-snapshot';
    c.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;display:block';
    try { c.getContext('2d').drawImage(src, 0, 0, w, h); } catch (e) { return null; }
    return c;
  }

  function build(rec, wantLive) {
    const layer = layerEl();
    layer.append(staticEl(rec.name));           // 静态底总在最下面：引擎出帧前 / 失败时都有东西可看
    rec.engine = null;
    rec.live = false;
    if (wantLive && canLive(rec.name)) {
      rec.engine = engineEl(rec.name);
      layer.append(rec.engine);
      rec.live = true;
    }
    return layer;
  }

  function demote(host) {
    const rec = hosts.get(host);
    if (!rec || !rec.live) return;
    const snap = snapshot(rec);
    if (snap) rec.layer.insertBefore(snap, rec.engine);
    rec.engine.remove();
    rec.engine = null;
    rec.live = false;
    rec.paused = false;
    rec.snapshot = snap;
    if (liveHost === host) liveHost = null;
  }

  function mount(host, name, opts) {
    name = PALETTES[name] ? name : 'cotton';
    opts = opts || {};
    if (hosts.has(host)) { setSkin(host, name, opts); return state(host); }
    const cs = getComputedStyle(host);
    if (cs.position === 'static') host.style.position = 'relative';
    const rec = { host, name, live: false, paused: false, wantLive: !!opts.live, exclusive: opts.exclusive !== false, layer: null, engine: null, snapshot: null };
    if (rec.wantLive && rec.exclusive && liveHost && liveHost !== host) demote(liveHost);
    rec.layer = build(rec, rec.wantLive);
    host.insertBefore(rec.layer, host.firstChild);
    hosts.set(host, rec);
    if (rec.live && rec.exclusive) liveHost = host;
    return state(host);
  }

  function unmount(host) {
    const rec = hosts.get(host);
    if (!rec) return false;
    rec.layer.remove();
    hosts.delete(host);
    if (liveHost === host) liveHost = null;
    return true;
  }

  function pause(host) {
    const rec = hosts.get(host);
    if (!rec || !rec.live || rec.paused) return false;
    const snap = snapshot(rec);
    if (snap) rec.layer.append(snap);
    rec.snapshot = snap;
    rec.engine.remove();                         // 共享渲染器在实例集合为空时停止 rAF（三种引擎均如此）
    rec.paused = true;
    return true;
  }

  function resume(host) {
    const rec = hosts.get(host);
    if (!rec || !rec.paused) return false;
    if (!canLive(rec.name)) { rec.paused = false; rec.live = false; rec.engine = null; return false; }
    rec.layer.insertBefore(rec.engine, rec.snapshot || null);
    rec.paused = false;
    const snap = rec.snapshot; rec.snapshot = null;
    if (snap) requestAnimationFrame(() => requestAnimationFrame(() => snap.remove()));
    return true;
  }

  function setLive(host) {
    const rec = hosts.get(host);
    if (!rec) return false;
    if (liveHost && liveHost !== host) demote(liveHost);
    if (!rec.live) {
      if (!canLive(rec.name)) return false;
      if (rec.snapshot) { rec.snapshot.remove(); rec.snapshot = null; }
      rec.engine = engineEl(rec.name);
      rec.layer.append(rec.engine);
      rec.live = true; rec.paused = false;
    }
    liveHost = host;
    return true;
  }

  function setSkin(host, name, opts) {
    name = PALETTES[name] ? name : 'cotton';
    const rec = hosts.get(host);
    if (!rec) return mount(host, name, opts || {});
    if (opts && typeof opts.live === 'boolean') rec.wantLive = opts.live;
    if (rec.name === name && !(opts && typeof opts.live === 'boolean')) return state(host);
    const old = rec.layer;
    rec.name = name;
    const wantLive = rec.wantLive && (liveHost === host || !liveHost || !rec.exclusive);
    if (wantLive && rec.exclusive && liveHost && liveHost !== host) demote(liveHost);
    const next = build(rec, wantLive);
    if (rec.live && rec.exclusive) liveHost = host;
    rec.layer = next;
    rec.paused = false; rec.snapshot = null;
    host.insertBefore(next, old);
    if (reduced() || !next.animate) { old.remove(); return state(host); }
    next.style.opacity = '.25'; next.style.filter = 'blur(12px)';
    const anim = next.animate([{ opacity: .25, filter: 'blur(12px)' }, { opacity: 1, filter: 'blur(0)' }], { duration: 650, easing: 'ease', fill: 'forwards' });
    const done = () => { next.style.opacity = ''; next.style.filter = ''; old.remove(); };
    anim.onfinish = done; anim.oncancel = done;
    return state(host);
  }

  function state(host) {
    const rec = hosts.get(host);
    if (!rec) return null;
    return { name: rec.name, live: rec.live, paused: rec.paused, engine: rec.live ? ENGINES[rec.name].tag : 'static', isLiveHost: liveHost === host };
  }

  NS.shared.skins = { mount, unmount, pause, resume, setSkin, setLive, state, PALETTES, ENGINES, canLive, webglOK, hosts };
})();

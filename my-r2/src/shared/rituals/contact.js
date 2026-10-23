/* contact.js — 撕票后联系信息展开 + 复制（原件复用：时序、过渡、文案、真实剪贴板判定）
   ───────────────────────────────────────────────────────────────────────────────
   来源：/home/user/JU/.build/baseline/V27.html（V27.code.html 行号一致）
   · 第 1271-1277 行 s06 DOM：[data-contact-reveal23] > .ju-contact-row(.ju-contact-name「局主 · {host}」/ .ju-contact-account / button.ju-contact-copy)
                     + p.ju-contact-note23 + p.ju-form-error；页脚 [data-contact-action23]（主按钮「已加微信」/「待赴约」）
   · 第 264 行       .ju-contact-row / name / account / copy 的 CSS（见 ticket.css）
   · 第 4423 行      contactReveal23(page)：撕完（p7 → 'torn'）后 300ms 显示联系层，850ms 显示页脚动作；减少动态时均为 0ms
   · 第 4505-4507 行 contactWrap23：opacity 0→1、translateY(16px)→0，transition 'opacity .5s ease, transform .6s cubic-bezier(.2,.9,.3,1)'，visibility/pointer-events 同步
                     contactButton23：opacity 0→1、translateY(12px)→0，transition 'opacity .5s ease, transform .55s cubic-bezier(.2,.9,.3,1)'；已加微信后 aria-disabled
                     contactAddedLabel23：'撕券后8小时内联系局主' / '已加微信 · 等这次见面' + '。此处为示例微信。'
                     contactLabel18：'已加微信' / '待赴约'；contactAccount23：示例账号（老杨 → 'laoyang.ju'）
   · 第 4212 行      copyContact21()：busy 锁 + 序号；navigator.clipboard.writeText 成功 → wxCopied=true（文案「已复制」、图标换勾）；
                     失败 → contactError20 '复制失败，请长按账号复制'（不假报成功，brief §10）
   · 第 4499 行      copyIcon22：已复制 'M5 12l4 4L19 6'；未复制 'M9 9h11v11H9z M5 15H3V3h12v2'（17×17，stroke 1.6）
   · 第 4334 行      contactCopy20：'已复制' / '复制'
   · 第 311 行       CSS：燃烧中（[data-burn] 有 canvas）或票无效时联系层 display:none
   数据与动画：联系层的出现是撕票写入成功之后的结果（contactReveal23 只在 JuLedger.canContact 为真时生效）；「已加微信」写入 JuLedger.contact（addContact18，第 4259 行）。
   键盘 / 按钮等价物：复制为 button（可聚焦）；展开由撕票结果驱动，本文件提供 reveal() 作为程序入口。
   ─────────────────────────────────────────────────────────────────────────────── */
(function () {
  'use strict';
  const NS = window.JURitual = window.JURitual || {};
  const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches || document.documentElement.dataset.juReduced === 'true';
  const ICON = { copied: 'M5 12l4 4L19 6', copy: 'M9 9h11v11H9z M5 15H3V3h12v2' };
  const LABEL = { copied: '已复制', copy: '复制' };
  const NOTE = { before: '撕券后8小时内联系局主。此处为示例微信。', added: '已加微信 · 等这次见面。此处为示例微信。' };
  const ACTION = { before: '已加微信', added: '待赴约' };

  /* host：包含 [data-contact-reveal]（联系层）与可选 [data-contact-action]（页脚主按钮）的容器
     data：{host:'老杨', account:'laoyang.ju', added:false}
     opts：{onCopy(ok), onAdd(), labels}——labels:false 时不写动作按钮与说明行的文案（方案用 Preact 绑定 c.ticket.contact.ctaLabel 等，
     原件改写 textContent 会顶掉 Preact 的文本节点；C10 复核发现），只维护 aria-disabled 与显示状态 */
  NS.contact = function (host, data, opts) {
    opts = opts || {}; data = data || {};
    const wrap = host.querySelector('[data-contact-reveal]') || host;
    const action = host.querySelector('[data-contact-action]');
    const name = wrap.querySelector('.ju-contact-name'), account = wrap.querySelector('.ju-contact-account');
    const copyBtn = wrap.querySelector('.ju-contact-copy'), note = wrap.querySelector('.ju-contact-note23'), err = wrap.querySelector('.ju-form-error');
    const timers = {}; let busy = false, seq = 0, added = !!data.added;
    if (name && data.host) name.textContent = '局主 · ' + data.host;
    if (account && data.account) account.textContent = data.account;
    const paint = () => {
      if (note && opts.labels !== false) note.textContent = added ? NOTE.added : NOTE.before;
      if (action) { if (opts.labels !== false) { const t = action.querySelector('[data-slot="actionLabel"]') || action; t.textContent = added ? ACTION.added : ACTION.before; } action.setAttribute('aria-disabled', String(added)); }
    };
    const setCopied = ok => {
      if (!copyBtn) return;
      const p = copyBtn.querySelector('path'), t = copyBtn.querySelector('span');
      if (p) p.setAttribute('d', ok ? ICON.copied : ICON.copy);
      if (t) t.textContent = ok ? LABEL.copied : LABEL.copy;
    };
    paint(); setCopied(false);
    const handle = {
      /* contactReveal23：300ms 联系层，850ms 动作按钮；减少动态 0ms */
      reveal: () => new Promise(ok => {
        clearTimeout(timers.reveal); clearTimeout(timers.action);
        wrap.dataset.revealed = 'false'; wrap.setAttribute('aria-hidden', 'true'); if (action) action.dataset.shown = 'false';
        const r = reduced();
        timers.reveal = setTimeout(() => { wrap.dataset.revealed = 'true'; wrap.setAttribute('aria-hidden', 'false'); }, r ? 0 : 300);
        timers.action = setTimeout(() => { if (action) action.dataset.shown = 'true'; ok({ ok: true, revealedAt: r ? 0 : 300, actionAt: r ? 0 : 850 }); }, r ? 0 : 850);
      }),
      hide: () => { clearTimeout(timers.reveal); clearTimeout(timers.action); wrap.dataset.revealed = 'false'; wrap.setAttribute('aria-hidden', 'true'); if (action) action.dataset.shown = 'false'; setCopied(false); if (err) err.textContent = ''; return handle; },
      /* copyContact21：只有真实成功才给成功反馈 */
      copy: async () => {
        if (busy) return false; const my = ++seq; busy = true;
        setCopied(false); if (err) err.textContent = '';
        let ok = false;
        try { await navigator.clipboard.writeText(account ? account.textContent : (data.account || '')); ok = true; }
        catch (e) { ok = false; }
        if (my === seq) { setCopied(ok); if (!ok && err) err.textContent = '复制失败，请长按账号复制'; }
        busy = false; if (opts.onCopy) opts.onCopy(ok); return ok;
      },
      add: () => { if (added) return false; added = true; paint(); if (err) err.textContent = ''; if (opts.onAdd) opts.onAdd(); return true; },   /* 已加微信后，之前的复制失败行已无意义（C05 复核） */
      destroy: () => { handle.hide(); },   /* 主负责人（C04 复核）：同一段 DOM 在跳转 / replace 时会被下一张票复用，销毁时把显示状态（data-revealed / data-shown / 已复制 / 错误行）一并复位 */
    };
    if (copyBtn) copyBtn.onclick = () => handle.copy();
    if (action) action.onclick = () => { if (action.getAttribute('aria-disabled') !== 'true') handle.add(); };
    return handle;
  };
  NS.contact.TIMING = { reveal: 300, action: 850 };
})();

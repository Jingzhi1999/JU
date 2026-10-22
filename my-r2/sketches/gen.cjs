#!/usr/bin/env node
/* my-r2/sketches/gen.cjs — 主负责人的十个构图草案（静态、同数据、同环境）。
   目的：在真实 390×844 里先画构图与空间关系，再命名（任务书 §05）。不是交付物；只用于内部比较与淘汰记录。
   用法：node my-r2/sketches/gen.cjs → my-r2/sketches/out/<id>-<role>.html */
const fs = require('fs'), path = require('path'), vm = require('vm');
const ROOT = path.resolve(__dirname, '..', '..');
const ctx = { window: {} }; ctx.window.window = ctx.window; vm.createContext(ctx);
vm.runInContext(fs.readFileSync(path.join(ROOT, 'src/core/ju-data.js'), 'utf8'), ctx);
const JU = ctx.window.JU;
const d = JU.data('default'); const J = JU.derive.joined(d); const H = JU.derive.hosted(d);
const esc = s => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;');
const left = ms => { const s = Math.max(0, Math.floor(ms / 1000)); const h = Math.floor(s / 3600), m = Math.floor(s / 60) % 60; return h + ':' + String(m).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0'); };
const BRUNCH_LEFT = left(J.groups.act[0].deadline - JU.NOW);
const initials = n => (n || '?').slice(0, 1);
const PACK = { invite: ['#F4EBD9', '#A8281F'], riso: ['#FFE7E0', '#D63C2A'], acid: ['#E9FF6B', '#1C1C1C'], street: ['#1B1D22', '#F5F2EA'], grain: ['#EADFCB', '#3B3A36'], mono: ['#F2F2F2', '#111'] };
const card = (r, w) => { const p = PACK[(r.event || r).pack] || PACK.invite; return `<div class="card" style="width:${w}px;background:${p[0]};color:${p[1]}"><b>${esc((r.event || r).en)}</b><span>${esc((r.event || r).title)}</span><i>${esc(r.when ? r.when.md + ' ' + r.when.time : '')}</i></div>`; };

const COMMON = `
*{box-sizing:border-box}body{margin:0;background:#6b6b6b;display:flex;gap:24px;padding:24px;font-family:"Noto Sans SC",-apple-system,"PingFang SC",sans-serif}
.phone{position:relative;width:390px;height:844px;overflow:hidden;}.phone>:is(.hd,.tabs,.due,.axis,.lead,.list,.stack,.col,.grid,.band,.first,.sec){position:relative}.phone{background:#F6F4F1;color:#14161F;-webkit-font-smoothing:antialiased;font-size:15px;line-height:1.45;flex:none}
.env{position:absolute;inset:0;pointer-events:none;background:
  radial-gradient(70% 25% at 0% 4%,rgba(238,138,186,.95),rgba(238,138,186,0) 76%),
  radial-gradient(66% 24% at 104% 14%,rgba(106,192,226,.95),rgba(106,192,226,0) 76%),
  radial-gradient(84% 22% at 40% 30%,rgba(178,160,238,.9),rgba(178,160,238,0) 74%),
  radial-gradient(76% 20% at 0% 47%,rgba(128,204,228,.8),rgba(128,204,228,0) 72%),
  radial-gradient(70% 20% at 100% 50%,rgba(240,164,200,.75),rgba(240,164,200,0) 72%),
  linear-gradient(180deg,#f1b9d3 0%,#d9cdf2 26%,#c3e3f0 50%,#e8dcf0 78%,#efe7f2 100%)}
.cta{display:inline-flex;align-items:center;justify-content:center;width:min(100%,280px);height:48px;border-radius:24px;background:linear-gradient(180deg,#5d6dd3 0%,#4553BE 55%,#3b48a6 100%);color:#fff;font:500 15px/1 inherit;font-family:inherit;box-shadow:0 10px 22px -10px rgba(69,83,190,.75),inset 0 1px 0 rgba(255,255,255,.38),inset 0 -1px 0 rgba(0,0,0,.18);border:0}
.nav{position:absolute;left:12px;right:12px;bottom:10px;height:66px;display:flex;align-items:stretch;background:rgba(255,255,255,.72);backdrop-filter:blur(8px);border-radius:20px;box-shadow:0 1px 0 rgba(255,255,255,.6) inset,0 10px 30px -18px rgba(20,22,31,.35);z-index:9}
.nav>div{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:5px;font-size:12px;color:#626777}.nav>div.on{color:#14161F}.nav i{width:23px;height:23px;border:1.7px solid currentColor;border-radius:7px;display:block}
.t30{font-size:30px;font-weight:500;color:#252b3a;line-height:1.25;letter-spacing:-.01em}.t14{font-size:14px;color:#535b70}
.card{position:relative;aspect-ratio:4/5;border-radius:4px;display:flex;flex-direction:column;padding:7% 7% 6%;container-type:inline-size;box-shadow:0 6px 14px -8px rgba(20,22,31,.35);overflow:hidden;flex:none}
.card b{font-family:"Libre Caslon Text",Georgia,serif;font-size:7.6cqw;letter-spacing:.2cqw;text-align:center;white-space:nowrap;overflow:hidden;line-height:1;border-bottom:.35cqw solid currentColor;padding-bottom:3cqw}
.card span{font-size:6.4cqw;line-height:1.2;margin-top:auto;font-weight:500}.card i{font-style:normal;font-size:3cqw;opacity:.75;margin-top:2cqw;font-family:"Space Mono",monospace}
.chips{display:flex}.chips b{width:28px;height:28px;border-radius:50%;background:#fff;border:2px solid #F6F4F1;display:inline-flex;align-items:center;justify-content:center;font-size:12px;font-weight:600;color:#252b3a;margin-left:-8px;box-shadow:0 1px 2px rgba(0,0,0,.12)}.chips b:first-child{margin-left:0}
.seg{display:flex;gap:3px}.seg i{height:6px;flex:1;border-radius:3px;background:#d9dbe3}.seg i.ok{background:#4553BE}.seg i.host{background:#14161F}.seg i.res{background:#f0b64d}
.st{font-size:13px}.st.act{color:#C2364C}.st.go{color:#0E9B76}.st.wait{color:#535b70}
`;
function page(title, css, body) { return `<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><title>${esc(title)}</title><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@400;500;600;700&family=Noto+Serif+SC:wght@500;600;700&family=Archivo:wght@500;600;700&family=Space+Mono&family=Libre+Caslon+Text:wght@700&display=swap"><style>${COMMON}${css}</style></head><body>${body}</body></html>`; }
const NAV = `<div class="nav"><div><i></i>找局</div><div><i></i>开局</div><div class="on"><i></i>我的局</div><div><i></i>设置</div></div>`;
const act = J.groups.act, soon = J.groups.soon, wait = J.groups.wait;
const lead = act[0];
const hTodo = H.sections.todo, hRes = H.sections.resched, hRec = H.sections.recruit, hForm = H.sections.formed, hLead = hTodo[0];
const tone = r => r.group === 'act' ? 'act' : r.group === 'soon' ? 'go' : 'wait';
const segs = r => `<div class="seg">${(r.seats || []).map(s => `<i class="${s.kind}"></i>`).join('')}</div>`;
const S = {};

/* ---------- A 左轴 · 日期锚（时间分组轴；截止另列） ---------- */
S.A = {
  css: `.a .hd{padding:58px 24px 10px}.a .tabs{display:flex;gap:18px;padding:8px 24px 14px;font-size:15px;color:#626777}.a .tabs b{color:#14161F;font-weight:600;border-bottom:2px solid #14161F;padding-bottom:4px}
  .a .due{margin:0 16px 6px;background:rgba(255,255,255,.78);border-radius:14px;padding:14px 16px 16px;display:grid;grid-template-columns:52px 1fr;gap:0 12px}
  .a .due .anc{font-size:12px;color:#C2364C;line-height:1.3;padding-top:3px}.a .due .anc b{display:block;font:600 18px/1.1 "Archivo";color:#C2364C}
  .a .due h3{margin:0;font-size:18px;font-weight:600;line-height:1.3}.a .due p{margin:4px 0 12px;font-size:13px;color:#535b70}
  .a .axis{padding:4px 16px 110px}.a .day{display:grid;grid-template-columns:52px 1fr;gap:0 12px;padding:12px 0;border-top:1px solid rgba(20,22,31,.1)}
  .a .day .anc{padding-top:2px}.a .day .anc b{display:block;font:600 22px/1 "Archivo";color:#14161F}.a .day .anc span{display:block;font-size:12px;color:#535b70;margin-top:4px}
  .a .ev{padding:0 0 10px}.a .ev:last-child{padding-bottom:0}.a .ev h4{margin:0;font-size:16px;font-weight:500;line-height:1.35}.a .ev p{margin:2px 0 0;font-size:13px;color:#535b70}.a .ev .st{margin-top:3px}
  .a .ev .st em{font-style:normal;color:#4553BE;margin-left:8px}`,
  joined: () => {
    const byDay = {}; [...act.slice(1), ...soon, ...wait, act[0]].forEach(r => { (byDay[r.when.md] = byDay[r.when.md] || []).push(r); });
    const days = Object.keys(byDay).sort();
    return `<div class="phone a"><div class="env"></div>
<div class="hd"><div class="t30">我的局</div><div class="t14">4 项要你回应 · 这周 3 场</div></div>
<div class="tabs"><b>我参加的</b><span>我发起的</span></div>
<div class="due"><div class="anc"><b>19:21</b>今天截止</div><div><h3>${esc(lead.event.title)}</h3><p>已预留 · 剩 ${BRUNCH_LEFT} · 读完约定再确认</p><button class="cta">阅读并确认</button></div></div>
<div class="axis">${days.map(k => { const rs = byDay[k]; const w = rs[0].when; return `<div class="day"><div class="anc"><b>${w.day}</b><span>${w.wdZh} · ${w.month}月</span></div><div>${rs.sort((a, b) => a.sortTime - b.sortTime).map(r => `<div class="ev"><h4>${esc(r.event.title)}</h4><p>${r.when.time} · ${esc(r.place.hood)} · ${esc(r.host.name)}</p><div class="st ${tone(r)}">${esc(r.id === 'brunch' ? '已预留 · 截止见上' : r.label)}${r.cta && r.id !== 'brunch' ? `<em>${esc(r.cta)} ›</em>` : ''}</div></div>`).join('')}</div></div>`; }).join('')}</div>${NAV}</div>`;
  },
  hosted: () => {
    const rows = [...hTodo, ...hRes, ...hRec, ...hForm]; const byDay = {}; rows.forEach(r => { (byDay[r.when.md] = byDay[r.when.md] || []).push(r); }); const days = Object.keys(byDay).sort();
    return `<div class="phone a"><div class="env"></div>
<div class="hd"><div class="t30">我的局</div><div class="t14">2 项待你处理 · 草稿 1</div></div>
<div class="tabs"><span>我参加的</span><b>我发起的</b></div>
<div class="due"><div class="anc"><b>现在</b>待处理</div><div><h3>${esc(hLead.event.title)}</h3><p>${hLead.label} · 通过即发出 6 小时预留</p><button class="cta">审核申请</button></div></div>
<div class="axis">${days.map(k => { const rs = byDay[k]; const w = rs[0].when; return `<div class="day"><div class="anc"><b>${w.day}</b><span>${w.wdZh} · ${w.month}月</span></div><div>${rs.map(r => `<div class="ev"><h4>${esc(r.event.title)}</h4><p>${r.when.time} · ${esc(r.place.hood)} · 已确认 ${r.counts.confirmed}/${r.counts.capacity}</p><div class="st ${r.todo ? 'act' : r.key === 'formed' ? 'go' : 'wait'}">${esc(r.label)}${r.cta && r.id !== hLead.id ? `<em>${esc(r.cta)} ›</em>` : ''}</div></div>`).join('')}</div></div>`; }).join('')}</div>${NAV}</div>`;
  }
};

/* ---------- B 人先（人物簇领行） ---------- */
S.B = {
  css: `.b .hd{padding:58px 24px 6px}.b .tabs{display:flex;gap:18px;padding:6px 24px 10px;font-size:15px;color:#626777}.b .tabs b{color:#14161F;font-weight:600}
  .b .lead{margin:6px 16px 10px;padding:18px 18px 18px;background:#fff;border-radius:18px;box-shadow:0 14px 30px -20px rgba(20,22,31,.4)}
  .b .lead .chips b{width:52px;height:52px;font-size:18px;margin-left:-14px}.b .lead .chips b:first-child{margin-left:0}.b .lead h3{margin:12px 0 0;font-size:21px;font-weight:600;line-height:1.3}.b .lead .who{font-size:15px;color:#252b3a;margin-top:10px}
  .b .lead p{margin:4px 0 14px;font-size:13px;color:#535b70}.b .lead .left{font:600 15px "Archivo";color:#C2364C}
  .b .grp{padding:10px 24px 4px;font-size:12px;color:#626777;letter-spacing:.06em}
  .b .row{display:grid;grid-template-columns:auto 1fr;gap:0 14px;padding:12px 24px;align-items:center}.b .row .chips b{width:40px;height:40px;font-size:14px;margin-left:-12px}.b .row .chips b:first-child{margin-left:0}
  .b .row .who{font-size:17px;font-weight:500;color:#14161F}.b .row h4{margin:1px 0 0;font-size:14px;font-weight:400;color:#252b3a}.b .row p{margin:2px 0 0;font-size:13px;color:#535b70}
  .b .list{padding-bottom:100px}`,
  joined: () => {
    const who = r => { const ms = (r.item.members || []).filter(m => !m.you && m.name).map(m => m.name); return ms.length ? '和 ' + ms.slice(0, 3).join('、') + (ms.length > 3 ? ' 等 ' + ms.length + ' 人' : '') : '和 ' + r.host.name; };
    const chips = (r, n) => `<div class="chips">${(r.item.members || []).filter(m => !m.you && m.name).slice(0, n).map(m => `<b>${esc(initials(m.name))}</b>`).join('')}</div>`;
    const row = r => `<div class="row">${chips(r, 3)}<div><div class="who">${esc(who(r))}</div><h4>${esc(r.event.title)}</h4><p>${r.when.zh} · ${esc(r.place.hood)} · <span class="st ${tone(r)}">${esc(r.label)}</span></p></div></div>`;
    return `<div class="phone b"><div class="env"></div>
<div class="hd"><div class="t30">我的局</div><div class="t14">这周要见 9 个人</div></div><div class="tabs"><b>我参加的</b><span>我发起的</span></div>
<div class="lead">${chips(lead, 4)}<h3>${esc(lead.event.title)}</h3><div class="who">${esc(who(lead))}</div><p>${lead.when.zh} · ${esc(lead.place.hood)} · <span class="left">剩 ${BRUNCH_LEFT}</span> 读完约定再确认</p><button class="cta">阅读并确认</button></div>
<div class="list"><div class="grp">要你回应</div>${act.slice(1).map(row).join('')}<div class="grp">就快见面</div>${soon.map(row).join('')}<div class="grp">还在等</div>${wait.map(row).join('')}</div>${NAV}</div>`;
  },
  hosted: () => {
    const apps = r => (r.item.applications || []).filter(a => a.status === 'pending');
    const chipsN = names => `<div class="chips">${names.slice(0, 4).map(n => `<b>${esc(initials(n))}</b>`).join('')}</div>`;
    const row = r => { const names = r.item.members.filter(m => !m.host).map(m => m.nick); return `<div class="row">${chipsN(names.length ? names : ['?'])}<div><div class="who">${names.length ? esc(names.slice(0, 3).join('、')) : '还没有人'}${r.counts.reserved ? ' · 1 人已预留' : ''}</div><h4>${esc(r.event.title)}</h4><p>${r.when.zh} · ${esc(r.place.hood)} · <span class="st ${r.todo ? 'act' : r.key === 'formed' ? 'go' : 'wait'}">${esc(r.label)}</span></p></div></div>`; };
    const a = apps(hLead);
    return `<div class="phone b"><div class="env"></div>
<div class="hd"><div class="t30">我的局</div><div class="t14">2 个人在等你答复</div></div><div class="tabs"><span>我参加的</span><b>我发起的</b></div>
<div class="lead">${chipsN(a.map(x => x.nick))}<h3>${esc(hLead.event.title)}</h3><div class="who">${esc(a.map(x => x.nick).join('、'))} 申请加入</div><p>${hLead.when.zh} · ${esc(hLead.place.hood)} · 已确认 ${hLead.counts.confirmed}/${hLead.counts.capacity}（含你）</p><button class="cta">审核申请</button></div>
<div class="list"><div class="grp">待你处理</div>${hTodo.slice(1).map(row).join('')}<div class="grp">改期中</div>${hRes.map(row).join('')}<div class="grp">招募中</div>${hRec.map(row).join('')}<div class="grp">已成局</div>${hForm.map(row).join('')}</div>${NAV}</div>`;
  }
};

/* ---------- C 双窗（两角色同屏，分隔条可拖） ---------- */
S.C = {
  css: `.c .hd{padding:58px 24px 12px}.c .pane{position:absolute;left:0;right:0;background:rgba(255,255,255,.82);border-radius:22px 22px 0 0;box-shadow:0 -10px 30px -22px rgba(20,22,31,.5)}
  .c .p1{top:132px;bottom:0;padding:16px 20px 0}.c .p2{bottom:0;height:300px;background:#1B1D27;color:#F5F4F0;border-radius:22px 22px 0 0;padding:14px 20px 0}
  .c .ph{display:flex;justify-content:space-between;align-items:baseline}.c .ph b{font-size:18px;font-weight:600}.c .ph span{font-size:13px;color:#535b70}.c .p2 .ph span{color:#aeb2c4}
  .c .handle{width:36px;height:4px;border-radius:2px;background:rgba(20,22,31,.18);margin:0 auto 10px}.c .p2 .handle{background:rgba(255,255,255,.3)}
  .c .lead{margin:12px 0 8px;padding:12px 14px;background:#F6F4F1;border-radius:14px}.c .lead h3{margin:0;font-size:17px;font-weight:600}.c .lead p{margin:3px 0 10px;font-size:13px;color:#535b70}
  .c .row{display:flex;justify-content:space-between;gap:12px;padding:9px 0;border-top:1px solid rgba(20,22,31,.08);font-size:14px}.c .row small{font-size:12px;color:#535b70;display:block}.c .p2 .row{border-top-color:rgba(255,255,255,.1)}.c .p2 .row small{color:#aeb2c4}
  .c .row .st{white-space:nowrap}`,
  joined: () => `<div class="phone c"><div class="env"></div><div class="hd"><div class="t30">我的局</div><div class="t14">参加 8 场 · 发起 5 场</div></div>
<div class="pane p1"><div class="handle"></div><div class="ph"><b>我参加的</b><span>4 项要你回应</span></div>
<div class="lead"><h3>${esc(lead.event.title)}</h3><p>${lead.when.zh} · ${esc(lead.place.hood)} · 已预留 · 剩 ${BRUNCH_LEFT}</p><button class="cta">阅读并确认</button></div>
${[...act.slice(1), ...soon, ...wait].map(r => `<div class="row"><div>${esc(r.event.title)}<small>${r.when.zh} · ${esc(r.place.hood)}</small></div><span class="st ${tone(r)}">${esc(r.label)}</span></div>`).join('')}</div>
<div class="pane p2"><div class="handle"></div><div class="ph"><b>我发起的</b><span>2 项待你处理</span></div>${[...hTodo, ...hRes, ...hRec].map(r => `<div class="row"><div>${esc(r.event.title)}<small>${r.when.zh} · ${esc(r.place.hood)}</small></div><span class="st" style="color:${r.todo ? '#FF8A9B' : '#aeb2c4'}">${esc(r.label)}</span></div>`).join('')}</div>${NAV}</div>`,
  hosted: () => `<div class="phone c"><div class="env"></div><div class="hd"><div class="t30">我的局</div><div class="t14">参加 8 场 · 发起 5 场</div></div>
<div class="pane p2" style="top:132px;height:auto;bottom:0"><div class="handle"></div><div class="ph"><b>我发起的</b><span>2 项待你处理</span></div>
<div class="lead" style="background:#262937"><h3>${esc(hLead.event.title)}</h3><p style="color:#aeb2c4">${hLead.when.zh} · ${esc(hLead.place.hood)} · ${hLead.label}</p><button class="cta">审核申请</button></div>
${[...hTodo.slice(1), ...hRes, ...hRec, ...hForm].map(r => `<div class="row"><div>${esc(r.event.title)}<small>${r.when.zh} · ${esc(r.place.hood)} · 已确认 ${r.counts.confirmed}/${r.counts.capacity}</small></div><span class="st" style="color:${r.todo ? '#FF8A9B' : '#aeb2c4'}">${esc(r.label)}</span></div>`).join('')}</div>
<div class="pane p1" style="top:auto;bottom:0;height:300px"><div class="handle"></div><div class="ph"><b>我参加的</b><span>4 项要你回应</span></div>${[...act, ...soon].map(r => `<div class="row"><div>${esc(r.event.title)}<small>${r.when.zh} · ${esc(r.place.hood)}</small></div><span class="st ${tone(r)}">${esc(r.label)}</span></div>`).join('')}</div>${NAV}</div>`
};

/* ---------- D 叠层（恒定露出的叠纸） ---------- */
S.D = {
  css: `.d .hd{padding:58px 24px 8px}.d .tabs{display:flex;gap:18px;padding:4px 24px 10px;font-size:15px;color:#626777}.d .tabs b{color:#14161F;font-weight:600}
  .d .stack{position:relative;margin:4px 16px 0}.d .grp{font-size:12px;color:#626777;letter-spacing:.06em;margin:14px 8px 8px}
  .d .sheet{position:relative;background:var(--bg,#fff);color:var(--fg,#14161F);border-radius:18px 18px 0 0;padding:16px 18px;box-shadow:0 -10px 24px -14px rgba(20,22,31,.45);margin-top:-70px;min-height:150px}.d .sheet p{color:inherit;opacity:.75}.d .sheet .st{color:inherit;opacity:.9;font-weight:500}
  .d .sheet.first{margin-top:0}.d .sheet.lead{min-height:0;padding-bottom:18px}.d .sheet h3{margin:0;font-size:17px;font-weight:600;line-height:1.3}.d .sheet p{margin:3px 0 0;font-size:13px;color:#535b70}
  .d .sheet .st{position:absolute;right:18px;top:17px}.d .lead h3{font-size:21px}.d .lead p{margin-bottom:12px}`,
  joined: () => {
    const sheet = (r, i) => { const p = PACK[r.event.pack] || PACK.invite; return `<div class="sheet${i === 0 ? ' first' : ''}" style="--bg:${p[0]};--fg:${p[1]}"><h3>${esc(r.event.title)}</h3><p>${r.when.zh} · ${esc(r.place.hood)}</p><span class="st">${esc(r.label)}</span></div>`; };
    return `<div class="phone d"><div class="env"></div><div class="hd"><div class="t30">我的局</div><div class="t14">4 项要你回应</div></div><div class="tabs"><b>我参加的</b><span>我发起的</span></div>
<div class="stack"><div class="sheet first lead"><h3>${esc(lead.event.title)}</h3><p>${lead.when.zh} · ${esc(lead.place.hood)} · 已预留 · 剩 ${BRUNCH_LEFT}</p><button class="cta">阅读并确认</button></div>
${act.slice(1).map((r, i) => sheet(r, 1)).join('')}
<div class="grp">就快见面 · 还在等</div>${[...soon, ...wait].map((r, i) => sheet(r, i)).join('')}</div>${NAV}</div>`;
  },
  hosted: () => {
    const sheet = (r, i) => { const p = PACK[r.event.pack] || PACK.invite; return `<div class="sheet${i === 0 ? ' first' : ''}" style="--bg:${p[0]};--fg:${p[1]}"><h3>${esc(r.event.title)}</h3><p>${r.when.zh} · ${esc(r.place.hood)} · 已确认 ${r.counts.confirmed}/${r.counts.capacity}</p><span class="st">${esc(r.label)}</span></div>`; };
    return `<div class="phone d"><div class="env"></div><div class="hd"><div class="t30">我的局</div><div class="t14">2 项待你处理 · 草稿 1</div></div><div class="tabs"><span>我参加的</span><b>我发起的</b></div>
<div class="stack"><div class="sheet first lead"><h3>${esc(hLead.event.title)}</h3><p>${hLead.when.zh} · ${esc(hLead.place.hood)} · ${hLead.label}</p><button class="cta">审核申请</button></div>${hTodo.slice(1).map(r => sheet(r, 1)).join('')}
<div class="grp">改期中 · 招募中 · 已成局</div>${[...hRes, ...hRec, ...hForm].map((r, i) => sheet(r, i)).join('')}</div>${NAV}</div>`;
  }
};

/* ---------- E 大面（上：一场的整面；下：其余的纸） ---------- */
S.E = {
  css: `.e .env{display:none}.e{background:#E98AB6}.e .hero{position:absolute;inset:0 0 auto;height:500px;padding:58px 24px 0;color:#2A0F1D;background:linear-gradient(180deg,#F3A9CD 0%,#E98AB6 60%,#DD7AA9 100%)}
  .e .hero .t30{color:#2A0F1D}.e .hero .t14{color:#5A2B42}.e .tabs{display:flex;gap:18px;margin:10px 0 0;font-size:15px;color:#7A3C58}.e .tabs b{color:#2A0F1D;font-weight:600}
  .e .when{margin-top:38px;font:600 15px/1 "Archivo";letter-spacing:.02em}.e .when b{display:block;font-size:34px;margin-top:6px;letter-spacing:-.02em}
  .e h2{margin:14px 0 0;font-size:26px;font-weight:600;line-height:1.25;max-width:300px}.e .meta{margin-top:8px;font-size:14px;color:#5A2B42}.e .cta{margin-top:18px}
  .e .card{position:absolute;right:24px;top:118px}
  .e .sheet{position:absolute;left:0;right:0;top:486px;bottom:0;background:#F6F4F1;border-radius:26px 26px 0 0;padding:14px 24px 0;box-shadow:0 -12px 40px -20px rgba(42,15,29,.5)}
  .e .handle{width:36px;height:4px;border-radius:2px;background:rgba(20,22,31,.18);margin:0 auto 12px}.e .sheet .grp{font-size:12px;color:#626777;letter-spacing:.06em;margin:8px 0 2px}
  .e .row{display:flex;justify-content:space-between;gap:12px;padding:9px 0;border-top:1px solid rgba(20,22,31,.08);font-size:14px}.e .row small{display:block;font-size:12px;color:#535b70}`,
  joined: () => `<div class="phone e"><div class="hero"><div class="t30">我的局</div><div class="t14">4 项要你回应</div><div class="tabs"><b>我参加的</b><span>我发起的</span></div>
<div class="when">${lead.when.wdZh} ${lead.when.md}<b>${lead.when.time}</b></div><h2>${esc(lead.event.title)}</h2><div class="meta">${esc(lead.place.full)} · 局主 ${esc(lead.host.name)} · 已预留 · 剩 ${BRUNCH_LEFT}</div><button class="cta">阅读并确认</button></div>
<div class="sheet"><div class="handle"></div><div class="grp">还有 7 场</div>${[...act.slice(1), ...soon, ...wait].map(r => `<div class="row"><div>${esc(r.event.title)}<small>${r.when.zh} · ${esc(r.place.hood)}</small></div><span class="st ${tone(r)}">${esc(r.label)}</span></div>`).join('')}</div>${NAV}</div>`,
  hosted: () => `<div class="phone e"><div class="hero" style="background:linear-gradient(180deg,#B4A6EA 0%,#9D8CE0 60%,#8E7BD6 100%);color:#17123A"><div class="t30" style="color:#17123A">我的局</div><div class="t14" style="color:#3E3470">2 项待你处理</div><div class="tabs"><span style="color:#5B4F9A">我参加的</span><b style="color:#17123A">我发起的</b></div>
<div class="when">${hLead.when.wdZh} ${hLead.when.md}<b>${hLead.when.time}</b></div><h2>${esc(hLead.event.title)}</h2><div class="meta" style="color:#3E3470">${esc(hLead.place.full)} · ${hLead.label} · 已确认 ${hLead.counts.confirmed}/${hLead.counts.capacity}（含你）</div><button class="cta">审核申请</button></div>
<div class="sheet"><div class="handle"></div><div class="grp">还有 4 场 · 草稿 1</div>${[...hTodo.slice(1), ...hRes, ...hRec, ...hForm].map(r => `<div class="row"><div>${esc(r.event.title)}<small>${r.when.zh} · ${esc(r.place.hood)}</small></div><span class="st ${r.todo ? 'act' : r.key === 'formed' ? 'go' : 'wait'}">${esc(r.label)}</span></div>`).join('')}</div>${NAV}</div>`
};

/* ---------- F 字排（无容器，纯文字版式） ---------- */
S.F = {
  css: `.f{background:#FBFAF7}.f .env{height:300px;inset:0 0 auto;mask-image:linear-gradient(#000 40%,transparent)}.f .hd{padding:58px 24px 0}.f .hd .t30{font-family:"Noto Serif SC",serif;font-weight:600}
  .f .tabs{display:flex;gap:18px;padding:10px 24px 0;font-size:15px;color:#626777}.f .tabs b{color:#14161F;font-weight:600}
  .f .col{padding:26px 24px 110px}.f .grp{font-size:12px;color:#626777;letter-spacing:.08em;margin:18px 0 6px}
  .f .it{padding:10px 0 12px;border-bottom:1px solid rgba(20,22,31,.12)}.f .it h3{margin:0;font-family:"Noto Serif SC",serif;font-size:21px;font-weight:600;line-height:1.3}.f .it .w{font:500 14px "Archivo";margin-top:5px;color:#252b3a}.f .it .w span{font-family:"Noto Sans SC";margin-left:6px}
  .f .it .st{margin-top:4px}.f .lead h3{font-size:26px}.f .lead .cta{margin-top:14px}`,
  joined: () => {
    const it = r => `<div class="it"><h3>${esc(r.event.title)}</h3><div class="w">${r.when.md} ${r.when.time}<span>${r.when.wdZh} · ${esc(r.place.hood)}</span></div><div class="st ${tone(r)}">${esc(r.label)}${r.need ? ' · ' + esc(r.need) : ''}</div></div>`;
    return `<div class="phone f"><div class="env"></div><div class="hd"><div class="t30">我的局</div><div class="t14">4 项要你回应 · 这周 3 场</div></div><div class="tabs"><b>我参加的</b><span>我发起的</span></div>
<div class="col"><div class="it lead"><h3>${esc(lead.event.title)}</h3><div class="w">${lead.when.md} ${lead.when.time}<span>${lead.when.wdZh} · ${esc(lead.place.hood)} · ${esc(lead.host.name)}</span></div><div class="st act">已预留 · 剩 ${BRUNCH_LEFT} · 读完约定再确认</div><button class="cta">阅读并确认</button></div>
<div class="grp">要你回应</div>${act.slice(1).map(it).join('')}<div class="grp">就快见面</div>${soon.map(it).join('')}<div class="grp">还在等</div>${wait.map(it).join('')}</div>${NAV}</div>`;
  },
  hosted: () => {
    const it = r => `<div class="it"><h3>${esc(r.event.title)}</h3><div class="w">${r.when.md} ${r.when.time}<span>${r.when.wdZh} · ${esc(r.place.hood)} · 已确认 ${r.counts.confirmed}/${r.counts.capacity}</span></div><div class="st ${r.todo ? 'act' : r.key === 'formed' ? 'go' : 'wait'}">${esc(r.label)}</div></div>`;
    return `<div class="phone f"><div class="env"></div><div class="hd"><div class="t30">我的局</div><div class="t14">2 项待你处理 · 草稿 1</div></div><div class="tabs"><span>我参加的</span><b>我发起的</b></div>
<div class="col"><div class="it lead"><h3>${esc(hLead.event.title)}</h3><div class="w">${hLead.when.md} ${hLead.when.time}<span>${hLead.when.wdZh} · ${esc(hLead.place.hood)}</span></div><div class="st act">${hLead.label} · 通过即发出 6 小时预留</div><button class="cta">审核申请</button></div>
<div class="grp">待你处理</div>${hTodo.slice(1).map(it).join('')}<div class="grp">改期中</div>${hRes.map(it).join('')}<div class="grp">招募中</div>${hRec.map(it).join('')}<div class="grp">已成局</div>${hForm.map(it).join('')}</div>${NAV}</div>`;
  }
};

/* ---------- G 下盘（底部固定动作盘，列表在上方流过） ---------- */
S.G = {
  css: `.g .hd{padding:58px 24px 8px}.g .tabs{display:flex;gap:18px;padding:4px 24px 8px;font-size:15px;color:#626777}.g .tabs b{color:#14161F;font-weight:600}
  .g .list{padding:0 24px 330px}.g .grp{font-size:12px;color:#626777;letter-spacing:.06em;margin:12px 0 4px}
  .g .row{display:flex;justify-content:space-between;gap:12px;padding:10px 0;border-top:1px solid rgba(20,22,31,.1);font-size:15px}.g .row small{display:block;font-size:13px;color:#535b70}
  .g .plate{position:absolute;left:0;right:0;bottom:0;height:318px;background:#14161F;color:#F5F4F0;border-radius:28px 28px 0 0;padding:22px 24px 0;box-shadow:0 -20px 50px -30px rgba(20,22,31,.9)}
  .g .plate .k{font-size:12px;color:#9EA3B8;letter-spacing:.06em}.g .plate h2{margin:8px 0 0;font-size:24px;font-weight:600;line-height:1.25}.g .plate .m{margin-top:8px;font-size:14px;color:#C9CCDA}.g .plate .left{font:600 15px "Archivo";color:#FFB3C1}
  .g .plate .cta{margin-top:18px;box-shadow:0 10px 22px -10px rgba(93,109,211,.8),inset 0 1px 0 rgba(255,255,255,.38)}.g .plate .nav2{position:absolute;left:12px;right:12px;bottom:10px;height:66px;display:flex;color:#9EA3B8}
  .g .plate .nav2>div{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:5px;font-size:12px}.g .plate .nav2>div.on{color:#F5F4F0}.g .plate .nav2 i{width:23px;height:23px;border:1.7px solid currentColor;border-radius:7px;display:block}`,
  joined: () => `<div class="phone g"><div class="env"></div><div class="hd"><div class="t30">我的局</div><div class="t14">4 项要你回应</div></div><div class="tabs"><b>我参加的</b><span>我发起的</span></div>
<div class="list"><div class="grp">要你回应</div>${act.slice(1).map(r => `<div class="row"><div>${esc(r.event.title)}<small>${r.when.zh} · ${esc(r.place.hood)}</small></div><span class="st act">${esc(r.label)}</span></div>`).join('')}<div class="grp">就快见面</div>${soon.map(r => `<div class="row"><div>${esc(r.event.title)}<small>${r.when.zh} · ${esc(r.place.hood)}</small></div><span class="st go">${esc(r.label)}</span></div>`).join('')}<div class="grp">还在等</div>${wait.map(r => `<div class="row"><div>${esc(r.event.title)}<small>${r.when.zh} · ${esc(r.place.hood)}</small></div><span class="st wait">${esc(r.label)}</span></div>`).join('')}</div>
<div class="plate"><div class="k">先处理这一件 · 已预留</div><h2>${esc(lead.event.title)}</h2><div class="m">${lead.when.zh} · ${esc(lead.place.hood)} · 局主 ${esc(lead.host.name)}</div><div class="m"><span class="left">剩 ${BRUNCH_LEFT}</span> 读完约定再确认</div><button class="cta">阅读并确认</button>
<div class="nav2"><div><i></i>找局</div><div><i></i>开局</div><div class="on"><i></i>我的局</div><div><i></i>设置</div></div></div></div>`,
  hosted: () => `<div class="phone g"><div class="env"></div><div class="hd"><div class="t30">我的局</div><div class="t14">2 项待你处理 · 草稿 1</div></div><div class="tabs"><span>我参加的</span><b>我发起的</b></div>
<div class="list"><div class="grp">待你处理</div>${hTodo.slice(1).map(r => `<div class="row"><div>${esc(r.event.title)}<small>${r.when.zh} · ${esc(r.place.hood)}</small></div><span class="st act">${esc(r.label)}</span></div>`).join('')}<div class="grp">改期中 · 招募中 · 已成局</div>${[...hRes, ...hRec, ...hForm].map(r => `<div class="row"><div>${esc(r.event.title)}<small>${r.when.zh} · ${esc(r.place.hood)} · 已确认 ${r.counts.confirmed}/${r.counts.capacity}</small></div><span class="st ${r.key === 'formed' ? 'go' : 'wait'}">${esc(r.label)}</span></div>`).join('')}</div>
<div class="plate"><div class="k">先处理这一件 · ${hLead.label}</div><h2>${esc(hLead.event.title)}</h2><div class="m">${hLead.when.zh} · ${esc(hLead.place.hood)} · 已确认 ${hLead.counts.confirmed}/${hLead.counts.capacity}（含你）</div><div class="m">阿蒋、Momo 在等答复 · 通过即发出 6 小时预留</div><button class="cta">审核申请</button>
<div class="nav2"><div><i></i>找局</div><div><i></i>开局</div><div class="on"><i></i>我的局</div><div><i></i>设置</div></div></div></div>`
};

/* ---------- H 色带（意图分区 = 色域，高度随内容） ---------- */
S.H = {
  css: `.h .env{display:none}.h{background:#F6F4F1}.h .hd{padding:58px 24px 10px;background:#F6F4F1}.h .tabs{display:flex;gap:18px;padding:0 24px 14px;font-size:15px;color:#626777}.h .tabs b{color:#14161F;font-weight:600}
  .h .band{padding:16px 24px 18px}.h .band .k{display:flex;justify-content:space-between;font-size:13px;letter-spacing:.04em;opacity:.8}.h .b1{background:#E65C7E;color:#fff}.h .b2{background:#4553BE;color:#fff}.h .b3{background:#E8E6F0;color:#14161F}
  .h .band h3{margin:10px 0 0;font-size:22px;font-weight:600;line-height:1.25}.h .band .m{font-size:14px;opacity:.9;margin-top:4px}.h .band .cta{margin-top:14px;background:#fff;color:#4553BE;box-shadow:0 10px 22px -12px rgba(0,0,0,.4)}
  .h .row{display:flex;justify-content:space-between;gap:10px;padding:9px 0;border-top:1px solid rgba(255,255,255,.3);font-size:15px}.h .b3 .row{border-top-color:rgba(20,22,31,.12)}.h .row small{display:block;font-size:13px;opacity:.85}.h .row .st{color:inherit;opacity:.9}`,
  joined: () => `<div class="phone h"><div class="hd"><div class="t30">我的局</div><div class="t14">4 项要你回应</div></div><div class="tabs"><b>我参加的</b><span>我发起的</span></div>
<div class="band b1"><div class="k"><span>要你回应 · 4</span><span>按截止先后</span></div><h3>${esc(lead.event.title)}</h3><div class="m">${lead.when.zh} · ${esc(lead.place.hood)} · 已预留 · 剩 ${BRUNCH_LEFT}</div><button class="cta">阅读并确认</button>
${act.slice(1).map(r => `<div class="row"><div>${esc(r.event.title)}<small>${r.when.zh} · ${esc(r.place.hood)}</small></div><span class="st">${esc(r.label)}</span></div>`).join('')}</div>
<div class="band b2"><div class="k"><span>就快见面 · 1</span><span>已成局</span></div>${soon.map(r => `<div class="row"><div>${esc(r.event.title)}<small>${r.when.zh} · ${esc(r.place.hood)}</small></div><span class="st">${esc(r.label)}</span></div>`).join('')}</div>
<div class="band b3"><div class="k"><span>还在等 · 3</span><span>等局主或其他成员</span></div>${wait.map(r => `<div class="row"><div>${esc(r.event.title)}<small>${r.when.zh} · ${esc(r.place.hood)}</small></div><span class="st">${esc(r.label)}</span></div>`).join('')}</div>${NAV}</div>`,
  hosted: () => `<div class="phone h"><div class="hd"><div class="t30">我的局</div><div class="t14">2 项待你处理 · 草稿 1</div></div><div class="tabs"><span>我参加的</span><b>我发起的</b></div>
<div class="band b1"><div class="k"><span>待你处理 · 2</span><span>审核与出席</span></div><h3>${esc(hLead.event.title)}</h3><div class="m">${hLead.when.zh} · ${esc(hLead.place.hood)} · ${hLead.label}</div><button class="cta">审核申请</button>${hTodo.slice(1).map(r => `<div class="row"><div>${esc(r.event.title)}<small>${r.when.zh} · ${esc(r.place.hood)}</small></div><span class="st">${esc(r.label)}</span></div>`).join('')}</div>
<div class="band b2"><div class="k"><span>改期中 · 1</span><span>等成员逐人答复</span></div>${hRes.map(r => `<div class="row"><div>${esc(r.event.title)}<small>${r.when.zh} · ${esc(r.place.hood)}</small></div><span class="st">${esc(r.label)}</span></div>`).join('')}</div>
<div class="band b3"><div class="k"><span>招募中 · 已成局</span><span>按日期</span></div>${[...hRec, ...hForm].map(r => `<div class="row"><div>${esc(r.event.title)}<small>${r.when.zh} · ${esc(r.place.hood)} · 已确认 ${r.counts.confirmed}/${r.counts.capacity}</small></div><span class="st">${esc(r.label)}</span></div>`).join('')}</div>${NAV}</div>`
};

/* ---------- I 地点（按区分节：哪里见） ---------- */
const AREA = { Brooklyn: '布鲁克林', Manhattan: '曼哈顿', Queens: '皇后区', Upstate: '上州' };
S.I = {
  css: `.i .hd{padding:58px 24px 8px}.i .tabs{display:flex;gap:18px;padding:4px 24px 10px;font-size:15px;color:#626777}.i .tabs b{color:#14161F;font-weight:600}
  .i .first{margin:4px 24px 8px;padding:14px 0 16px;border-top:2px solid #14161F}.i .first .k{font-size:12px;color:#C2364C;letter-spacing:.06em}.i .first h3{margin:4px 0 0;font-size:21px;font-weight:600;line-height:1.3}.i .first p{margin:4px 0 12px;font-size:13px;color:#535b70}
  .i .sec{padding:14px 24px 2px}.i .sec .ah{display:flex;align-items:baseline;gap:10px;border-bottom:1px solid rgba(20,22,31,.25);padding-bottom:6px}.i .sec .ah b{font-size:24px;font-weight:600;letter-spacing:.02em}.i .sec .ah span{font-size:13px;color:#535b70}.i .sec .ah i{font-style:normal;font:500 12px "Archivo";color:#8a8f9f;margin-left:auto;letter-spacing:.08em}
  .i .row{display:grid;grid-template-columns:84px 1fr;gap:0 12px;padding:10px 0;border-bottom:1px solid rgba(20,22,31,.08)}.i .row .hood{font-size:14px;font-weight:500;color:#252b3a;line-height:1.35}.i .row .hood small{display:block;font-size:12px;color:#535b70;font-weight:400}
  .i .row h4{margin:0;font-size:16px;font-weight:500;line-height:1.35}.i .row .m{font-size:13px;color:#535b70;margin-top:2px}.i .row .st{margin-top:2px}.i .list{padding-bottom:110px}`,
  joined: () => {
    const rows = [...act.slice(1), ...soon, ...wait]; const by = {}; rows.forEach(r => { (by[r.place.area] = by[r.place.area] || []).push(r); });
    const row = r => `<div class="row"><div class="hood">${esc(r.place.hood)}<small>${r.when.wdZh} ${r.when.md}</small></div><div><h4>${esc(r.event.title)}</h4><div class="m">${r.when.time} · ${esc(r.host.name)}</div><div class="st ${tone(r)}">${esc(r.label)}</div></div></div>`;
    return `<div class="phone i"><div class="env"></div><div class="hd"><div class="t30">我的局</div><div class="t14">4 项要你回应 · 三个区</div></div><div class="tabs"><b>我参加的</b><span>我发起的</span></div>
<div class="first"><div class="k">先回应这一件 · 今天 19:21 截止</div><h3>${esc(lead.event.title)}</h3><p>${esc(lead.place.full)} · ${lead.when.zh} · 已预留 · 剩 ${BRUNCH_LEFT}</p><button class="cta">阅读并确认</button></div>
<div class="list">${Object.keys(by).map(a => `<div class="sec"><div class="ah"><b>${AREA[a] || a}</b><span>${by[a].length} 场</span><i>${a.toUpperCase()}</i></div>${by[a].sort((x, y) => x.sortTime - y.sortTime).map(row).join('')}</div>`).join('')}</div>${NAV}</div>`;
  },
  hosted: () => {
    const rows = [...hTodo.slice(1), ...hRes, ...hRec, ...hForm]; const by = {}; rows.forEach(r => { (by[r.place.area] = by[r.place.area] || []).push(r); });
    const row = r => `<div class="row"><div class="hood">${esc(r.place.hood)}<small>${r.when.wdZh} ${r.when.md}</small></div><div><h4>${esc(r.event.title)}</h4><div class="m">${r.when.time} · 已确认 ${r.counts.confirmed}/${r.counts.capacity}</div><div class="st ${r.todo ? 'act' : r.key === 'formed' ? 'go' : 'wait'}">${esc(r.label)}</div></div></div>`;
    return `<div class="phone i"><div class="env"></div><div class="hd"><div class="t30">我的局</div><div class="t14">2 项待你处理 · 草稿 1</div></div><div class="tabs"><span>我参加的</span><b>我发起的</b></div>
<div class="first"><div class="k">先处理这一件 · ${hLead.label}</div><h3>${esc(hLead.event.title)}</h3><p>${esc(hLead.place.full)} · ${hLead.when.zh} · 已确认 ${hLead.counts.confirmed}/${hLead.counts.capacity}（含你）</p><button class="cta">审核申请</button></div>
<div class="list">${Object.keys(by).map(a => `<div class="sec"><div class="ah"><b>${AREA[a] || a}</b><span>${by[a].length} 场</span><i>${a.toUpperCase()}</i></div>${by[a].map(row).join('')}</div>`).join('')}</div>${NAV}</div>`;
  }
};

/* ---------- J 中轴（居中版式） ---------- */
S.J = {
  css: `.j{text-align:center}.j .hd{padding:58px 24px 4px}.j .tabs{display:flex;justify-content:center;gap:22px;padding:8px 24px 18px;font-size:15px;color:#626777}.j .tabs b{color:#14161F;font-weight:600}
  .j .lead{padding:6px 32px 18px}.j .lead .w{font:600 13px "Archivo";letter-spacing:.08em;color:#535b70}.j .lead .w b{display:block;font-size:32px;letter-spacing:-.02em;color:#14161F;margin-top:4px;line-height:1}
  .j .lead h2{margin:12px 0 0;font-size:24px;font-weight:600;line-height:1.3}.j .lead .m{margin-top:6px;font-size:14px;color:#535b70}.j .lead .st{margin-top:6px}.j .lead .cta{margin-top:16px}
  .j .grp{font-size:12px;color:#626777;letter-spacing:.1em;margin:18px 0 2px}.j .it{padding:10px 32px}.j .it h3{margin:0;font-size:17px;font-weight:500;line-height:1.3}.j .it .m{font-size:13px;color:#535b70;margin-top:2px}.j .it .st{margin-top:2px}
  .j .rule{width:28px;height:1px;background:rgba(20,22,31,.25);margin:4px auto 0}.j .col{padding-bottom:110px}`,
  joined: () => {
    const it = r => `<div class="it"><h3>${esc(r.event.title)}</h3><div class="m">${r.when.zh} · ${esc(r.place.hood)}</div><div class="st ${tone(r)}">${esc(r.label)}</div></div>`;
    return `<div class="phone j"><div class="env"></div><div class="hd"><div class="t30">我的局</div><div class="t14">4 项要你回应</div></div><div class="tabs"><b>我参加的</b><span>我发起的</span></div>
<div class="col"><div class="lead"><div class="w">${lead.when.wdZh} ${lead.when.md}<b>${lead.when.time}</b></div><h2>${esc(lead.event.title)}</h2><div class="m">${esc(lead.place.full)} · 局主 ${esc(lead.host.name)}</div><div class="st act">已预留 · 剩 ${BRUNCH_LEFT} · 读完约定再确认</div><button class="cta">阅读并确认</button></div>
<div class="grp">要你回应</div><div class="rule"></div>${act.slice(1).map(it).join('')}<div class="grp">就快见面</div><div class="rule"></div>${soon.map(it).join('')}<div class="grp">还在等</div><div class="rule"></div>${wait.map(it).join('')}</div>${NAV}</div>`;
  },
  hosted: () => {
    const it = r => `<div class="it"><h3>${esc(r.event.title)}</h3><div class="m">${r.when.zh} · ${esc(r.place.hood)} · 已确认 ${r.counts.confirmed}/${r.counts.capacity}</div><div class="st ${r.todo ? 'act' : r.key === 'formed' ? 'go' : 'wait'}">${esc(r.label)}</div></div>`;
    return `<div class="phone j"><div class="env"></div><div class="hd"><div class="t30">我的局</div><div class="t14">2 项待你处理 · 草稿 1</div></div><div class="tabs"><span>我参加的</span><b>我发起的</b></div>
<div class="col"><div class="lead"><div class="w">${hLead.when.wdZh} ${hLead.when.md}<b>${hLead.when.time}</b></div><h2>${esc(hLead.event.title)}</h2><div class="m">${esc(hLead.place.full)} · 已确认 ${hLead.counts.confirmed}/${hLead.counts.capacity}（含你）</div><div class="st act">${hLead.label} · 阿蒋、Momo</div><button class="cta">审核申请</button></div>
<div class="grp">待你处理</div><div class="rule"></div>${hTodo.slice(1).map(it).join('')}<div class="grp">改期中</div><div class="rule"></div>${hRes.map(it).join('')}<div class="grp">招募中</div><div class="rule"></div>${hRec.map(it).join('')}<div class="grp">已成局</div><div class="rule"></div>${hForm.map(it).join('')}</div>${NAV}</div>`;
  }
};

const OUT = path.join(__dirname, 'out'); fs.mkdirSync(OUT, { recursive: true });
for (const id of Object.keys(S)) { for (const role of ['joined', 'hosted']) { fs.writeFileSync(path.join(OUT, `${id}-${role}.html`), page(id + ' ' + role, S[id].css, S[id][role]())); } }
console.log('wrote', Object.keys(S).length * 2, 'sketches →', OUT);

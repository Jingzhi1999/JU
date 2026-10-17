/* jus-data.js — shared demo state for all ten 「设置」 concepts: dataset, derivations, business engine, state index, variants,
   persistence adapter. Everything here is product semantics; nothing here is visual. Concepts call:
     JUS.data(variant)              fresh deep copy of a dataset
     JUS.derive.*                   view models (home summary, favorites, records, reports, privacy facts, feed, mine)
     JUS.engine.<action>(data, p)   → { data, effect }   (data is a NEW deep copy; effect describes what to animate)
     JUS.fmt.*                      formatting helpers (same clock and format as src/core/ju-data.js: WD MM.DD · HH:MM, New York)
     JUS.INDEX / JUS.VARIANTS / JUS.PERMISSIONS / JUS.RULES / JUS.COPY / JUS.CITIES / JUS.SKINS / JUS.IDMAP
     JUS.store                      namespaced localStorage adapter (jus:<CODE>:v1); reset clears only that key
   Semantics preserved from the product (V27 入局 / R3 开局 / 我的局 extracts, see settings/spec/state-contract.md):
   favorites are keyed by stable event id and never change a sign-up; 未出席 is a fact awaiting review, never a penalty; the only
   quota rule is「主动退出每年 4 次」(no remaining-count is computed from sample data); system permission ≠ reminder service connected;
   a profile edit never rewrites past sign-up snapshots; changing the email drops its verified mark; demo review progress only comes
   from seeded scenarios, never from a user's save. */
(function (global) {
  'use strict';
  var JUS = global.JUS = global.JUS || {};
  JUS.SCHEMA = 1;
  var H = 3600000, M = 60000, D = 24 * H;
  function t(iso) { var m = /^(\d{4})-(\d{2})-(\d{2})(?:T(\d{2}):(\d{2}))?/.exec(iso); return Date.UTC(+m[1], +m[2] - 1, +m[3], m[4] ? +m[4] : 0, m[5] ? +m[5] : 0); }
  var NOW = t('2026-12-17T15:00'); JUS.NOW = NOW; JUS.t = t;
  var WD_ZH = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'], WD_EN = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function clone(o) { return JSON.parse(JSON.stringify(o)); }

  /* ---------------- formatting ---------------- */
  var fmt = {
    parts: function (ms) { var d = new Date(ms); return { y: d.getUTCFullYear(), mo: d.getUTCMonth() + 1, d: d.getUTCDate(), wd: d.getUTCDay(), h: d.getUTCHours(), mi: d.getUTCMinutes() }; },
    when: function (iso) { if (!iso) return { zh: '', en: '', md: '', time: '', date: '', long: '' }; var p = fmt.parts(typeof iso === 'number' ? iso : t(iso)); var md = pad(p.mo) + '.' + pad(p.d), time = pad(p.h) + ':' + pad(p.mi); return { zh: WD_ZH[p.wd] + ' ' + md + ' · ' + time, en: WD_EN[p.wd] + ' ' + md + ' · ' + time, md: md, time: time, date: p.mo + '月' + p.d + '日', wdZh: WD_ZH[p.wd], long: p.y + '年' + p.mo + '月' + p.d + '日 ' + WD_ZH[p.wd] + ' ' + time }; },
    date: function (ms) { var p = fmt.parts(ms); return p.mo + '月' + p.d + '日'; },
    dateTime: function (ms) { var p = fmt.parts(ms); return p.mo + '月' + p.d + '日 ' + pad(p.h) + ':' + pad(p.mi); },
    ymd: function (ms) { var p = fmt.parts(ms); return p.y + '.' + pad(p.mo) + '.' + pad(p.d); },
    ago: function (ms) { var d = NOW - ms; if (d < M) return '刚刚'; if (d < H) return Math.floor(d / M) + ' 分钟前'; if (d < D) return Math.floor(d / H) + ' 小时前'; return Math.floor(d / D) + ' 天前'; },
    place: function (loc) { var i = loc.indexOf('-'); return { borough: i > 0 ? loc.slice(0, i) : '', hood: i > 0 ? loc.slice(i + 1) : loc, full: loc.replace('-', ' · ') }; }
  };
  JUS.fmt = fmt;

  /* ---------------- cities (browse preference scope only; never rewrites an event's own city / tz) ---------------- */
  /* the six cities R3 开局 already offers (cityOptions NYC/BOS/LA/SFO/SEA/CHI; zones NYC,BOS→New_York · LA,SFO,SEA→Los_Angeles · CHI→Chicago).
     No other city is invented here; a custom city exists only inside an 开局 draft (not a browse preference). */
  JUS.CITIES = [
    { key: 'nyc', code: 'NYC', name: '纽约', en: 'New York', tz: 'America/New_York', tzLabel: '纽约时间' },
    { key: 'bos', code: 'BOS', name: '波士顿', en: 'Boston', tz: 'America/New_York', tzLabel: '波士顿时间' },
    { key: 'la', code: 'LA', name: '洛杉矶', en: 'Los Angeles', tz: 'America/Los_Angeles', tzLabel: '洛杉矶时间' },
    { key: 'sf', code: 'SFO', name: '旧金山', en: 'San Francisco', tz: 'America/Los_Angeles', tzLabel: '旧金山时间' },
    { key: 'sea', code: 'SEA', name: '西雅图', en: 'Seattle', tz: 'America/Los_Angeles', tzLabel: '西雅图时间' },
    { key: 'chi', code: 'CHI', name: '芝加哥', en: 'Chicago', tz: 'America/Chicago', tzLabel: '芝加哥时间' }
  ];
  JUS.CITY_COPY = { noResult: '没有匹配的城市', retry: '重新搜索', customNote: '自定义城市只能在开局草稿里填写，这里只选默认浏览的城市。' };
  JUS.cityByKey = function (k) { return JUS.CITIES.filter(function (c) { return c.key === k; })[0] || JUS.CITIES[0]; };

  /* ---------------- appearance (inherits R3's three backgrounds; a concept renders them in its own material) ---------------- */
  JUS.SKINS = [
    { key: 'cotton', name: '棉糖', en: 'Cotton Candy', line: '粉、紫、青三色的柔和水面', tokens: { paper: '#fffdf5f5', ink: '#263936', secondary: '#596851', rule: '#26393629', accent: '#526c54', bg: ['#fbe1ec', '#ececf4', '#d3edf3'], clear: '#f3f2f8' } },
    { key: 'halo', name: '光晕', en: 'Halo', line: '暖白上一圈橙到紫的光', tokens: { paper: '#fff9effa', ink: '#362e3c', secondary: '#655564', rule: '#362e3c2b', accent: '#69516c', bg: ['#ff5005', '#dbba95', '#d0bce1'], clear: '#fff9ef' } },
    { key: 'sunset', name: '落日', en: 'Sunset', line: '橙、蓝、黄的黄昏天色', tokens: { paper: '#fffbf2f7', ink: '#3b352d', secondary: '#6a5b4c', rule: '#3b352d29', accent: '#775842', bg: ['#ff7a33', '#33a0ff', '#ffc53d'], clear: '#fea669' } }
  ];
  JUS.SKIN_TRANSITION = { ms: 650, from: 'opacity .25 + blur 12px', to: 'opacity 1 + blur 0', easing: 'cubic-bezier(.22,1,.36,1)' };
  /* ---------------- notification categories & states ---------------- */
  JUS.NOTIFY_CATS = [
    { key: 'invite', label: '收到邀请', sub: '局主通过了你的申请，开始 6 小时预留' },
    { key: 'reserve', label: '预留到期前提醒', sub: '预留还剩 1 小时时提醒你去确认' },
    { key: 'waitlist', label: '候补轮到', sub: '有人放弃或到期，按顺位发出预留' },
    { key: 'reschedule', label: '局主改了时间', sub: '需要你答复是否按新时间参加' },
    { key: 'change', label: '活动变化', sub: '成局出票、取消、散场记录' },
    { key: 'host', label: '我发起的局', sub: '有人申请、成员确认、候补变化' }
  ];
  JUS.PERMISSIONS = [
    { key: 'default', label: '未请求' }, { key: 'requesting', label: '请求中' }, { key: 'granted', label: '已允许' }, { key: 'denied', label: '已拒绝' }, { key: 'unsupported', label: '不支持' }
  ];
  /* copy for the three layers: product preference / system permission / reminder service. Strings mirror V27's notificationCopy where known. */
  JUS.COPY = {
    permission: {
      default: { title: '还没有向系统申请通知权限', body: '允许后，系统才会显示 JU 的提醒。', cta: '申请系统权限' },
      requesting: { title: '正在等系统回答', body: '请在系统弹出的窗口里选择。', cta: '' },
      granted: { title: '系统已允许显示通知', body: '这只是系统权限；提醒是否能送达还取决于提醒服务。', cta: '' },
      denied: { title: '系统已拒绝通知', body: '要重新开启，需要到系统设置里修改；这里的开关改不了系统的决定。', cta: '去系统设置（示意）' },
      unsupported: { title: '这个浏览器不支持通知', body: '偏好会保存，但不会有任何系统提醒。', cta: '' }
    },
    service: { on: '提醒服务已连接 · 可以送达', off: '提醒服务未连接 · 偏好会保存，但目前不会真的发出提醒' },
    prefHint: '关闭某类提醒只影响提醒本身，不会撤回报名、取消席位或移除待办。',
    saveFail: '本机保存失败，请重试',
    copyOk: '微信号已复制', copyBusy: '正在复制…', copyFail: '未能复制，请长按微信号手动复制', copyRetry: '复制失败 · 点击重试',
    emailChanged: '邮箱改了之后需要重新验证；验证邮件尚未接入，先按「未验证」记录。',
    snapshotNote: '已报名的局仍使用报名时填写的资料；新资料只用于之后的报名。',
    unsaved: { title: '有没保存的修改', body: '离开会丢掉刚才的输入。', keep: '继续编辑', discard: '放弃修改' },
    recordHelp: '未出席是待核实的事实，不等于故意缺席，也不会自动处罚；可随时补充说明或提出异议，补充会留下记录。',
    quotaRule: '每年 4 次主动退出机会，跨活动、未撕 / 已撕共用，接受改期后再退出也计入。',
    quotaNoCount: '这里只列出已记录的事实；剩余次数按账户的完整记录与年度口径计算，本地演示不计算。',
    reportNote: '事实陈述 · 不评分、不自动处罚。',
    reportInert: '举报进度由平台处理后更新；本地演示只保存你提交的内容。',
    privacyLead: '你的资料在不同情形下谁能看见：',
    demoOnly: '本地演示 · 不连接真实账户',
    cityScope: '只影响「找局」默认显示哪座城市；不改动已创建、已参加的活动，也不改它们的时区。',
    favEmpty: { title: '还没有收藏', body: '遇到想去的，留在这里。', cta: '去找局' },
    contactRules: { beforeFormed: '成局后交换联系方式', closed: '联系方式已关闭', closedWhy: '本场结束已超过 24 小时。' }
  };
  /* rules copy (JuRules26, three groups; verbatim from the V27 agreement sheet via spec/extracts/extract-participant.md §8) */
  JUS.RULES = [
    { group: '确认', items: [
      { title: '收到邀请，才开始留位', body: '申请和候补不占位；邀请发出后预留 6 小时，重开页面不续时。' },
      { title: '六小时内，读完再确认', body: '确认前可点“去不了了”；放弃或到期释放位置，不记主动失约；候补退队不记缺席。' },
      { title: '全员确认，才成局出票', body: '包括局主。撕开票根，再联系赴约：撕开副券后 8 小时内联系局主；邀请未确认到期按候补顺序补位。' } ] },
    { group: '信用', items: [
      { title: '去不了了，请主动退出', body: '每年 4 次主动退出机会，跨活动、未撕 / 已撕共用，接受改期后再退出也计入。' },
      { title: '安排变化，不算主动失约', body: '确认前放弃预留或到期、纯候补退队、拒绝改期、局主取消不记失约、不消耗机会；撕券后 8 小时未联系不自动算故意缺席。' } ] },
    { group: '赴约', items: [
      { title: '撕开有效票，再联系', body: '成局后仅局主可见你的微信。' },
      { title: '联系方式，有查看期限', body: '退出 / 拒绝改期 / 取消后票和联系入口失效；散场 24 小时后关闭。' },
      { title: '改期重新选，取消不算失约', body: '接受新时间就撕开新版副券；去不了可点“去不了了”；局主取消后票根作废，重开也不恢复。' } ] }
  ];

  /* ---------------- events (ids identical to src/core/ju-data.js so 我的局 and favorites share identity) ---------------- */
  function ev(o) { return Object.assign({ status: 'open', version: 1, city: 'nyc', cat: 'food' }, o); }
  var EVENTS = {
    brunch: ev({ id: 'brunch', title: '周六早午餐 · 只聊不卷', iso: '2026-12-19T11:30', loc: 'Brooklyn-威廉斯堡', host: { name: '阿檬', wx: 'ameng.nyc' }, capacity: 3, note: '一家不赶客的早午餐店，聊聊最近在读的书。' }),
    livehouse: ev({ id: 'livehouse', title: '周四 Livehouse · 散场后吃宵夜', iso: '2026-12-18T21:30', loc: 'Brooklyn-布什维克', host: { name: '老杨', wx: 'laoyang.ju' }, capacity: 5, version: 2, cat: 'night', proposal: { oldIso: '2026-12-18T20:30' } }),
    run3k: ev({ id: 'run3k', title: '公园慢跑 3K · 跑完喝咖啡', iso: '2026-12-20T09:00', loc: 'Manhattan-中央公园', host: { name: 'Nina', wx: 'nina.runs' }, capacity: 6, cat: 'sport' }),
    coffee: ev({ id: 'coffee', title: '手冲咖啡品鉴 · 三款豆子', iso: '2026-12-21T15:00', loc: 'Queens-阿斯托利亚', host: { name: '蛋挞', wx: 'dantat.coffee' }, capacity: 4 }),
    theater: ev({ id: 'theater', title: '外百老汇小剧场 · 一起看《海鸥》', iso: '2026-12-19T19:30', loc: 'Manhattan-西村', host: { name: '花卷', wx: 'huajuan_play' }, capacity: 4, cat: 'culture' }),
    sketch: ev({ id: 'sketch', title: '周末速写 · 画人不画景', iso: '2026-12-27T14:00', loc: 'Brooklyn-DUMBO', host: { name: '小面', wx: 'xiaomian.draws' }, capacity: 5, cat: 'culture' }),
    vintage: ev({ id: 'vintage', title: '古着淘货 · 下东区三家店', iso: '2026-12-26T13:00', loc: 'Manhattan-下东区', host: { name: 'Kiki', wx: 'kiki1210' }, capacity: 4, cat: 'shop' }),
    dimsum: ev({ id: 'dimsum', title: '法拉盛早茶 · 周日十点', iso: '2026-12-21T10:00', loc: 'Queens-法拉盛', host: { name: '阿宽', wx: 'akuan_88' }, capacity: 5 }),
    climb: ev({ id: 'climb', title: '新手攀岩 · 周三晚上', iso: '2026-12-24T19:00', loc: 'Brooklyn-绿点', host: { name: 'Leon', wx: 'leon_hp' }, capacity: 4, cat: 'sport' }),
    jazz: ev({ id: 'jazz', title: '周五爵士小酒馆 · 第二场', iso: '2026-12-12T22:00', loc: 'Manhattan-哈莱姆', host: { name: '老杨', wx: 'laoyang.ju' }, capacity: 4, cat: 'night', status: 'ended', endedAt: t('2026-12-13T01:00') }),
    mahjong: ev({ id: 'mahjong', title: '周末麻将 · 不赌钱', iso: '2026-12-14T15:00', loc: 'Queens-埃姆赫斯特', host: { name: '阿宽', wx: 'akuan_88' }, capacity: 4, cat: 'game', status: 'ended', endedAt: t('2026-12-14T19:00') }),
    ramen: ev({ id: 'ramen', title: '深夜拉面 · 吃完散步回家', iso: '2026-12-15T23:00', loc: 'Manhattan-东村', host: { name: '西西', wx: 'xixi_nyc' }, capacity: 4, status: 'cancelled', cancelledAt: t('2026-12-15T12:00') }),
    boardgame: ev({ id: 'boardgame', title: '桌游夜 · 新手局', iso: '2026-12-16T19:00', loc: 'Brooklyn-公园坡', host: { name: 'Ivy', wx: 'ivy_pm' }, capacity: 6, cat: 'game', status: 'ended', endedAt: t('2026-12-16T23:00') }),
    karaoke: ev({ id: 'karaoke', title: 'K 歌 · 只唱老歌', iso: '2026-12-11T21:00', loc: 'Queens-法拉盛', host: { name: '花卷', wx: 'huajuan_play' }, capacity: 6, cat: 'night', status: 'ended', endedAt: t('2026-12-12T00:30') }),
    picnic: ev({ id: 'picnic', title: '秋末野餐 · 各带一样', iso: '2026-11-29T12:00', loc: 'Manhattan-中央公园', host: { name: '蛋挞', wx: 'dantat.coffee' }, capacity: 6, status: 'ended', endedAt: t('2026-11-29T16:00'), version: 2 }),
    hike: ev({ id: 'hike', title: '熊山徒步 · 早班车', iso: '2026-12-06T07:30', loc: 'Upstate-熊山', host: { name: 'Leon', wx: 'leon_hp' }, capacity: 5, cat: 'sport', status: 'ended', endedAt: t('2026-12-06T17:00') }),
    hike2: ev({ id: 'hike2', title: '熊山徒步 · 第二次', iso: '2026-11-22T07:30', loc: 'Upstate-熊山', host: { name: 'Leon', wx: 'leon_hp' }, capacity: 5, cat: 'sport', status: 'ended', endedAt: t('2026-11-22T17:00') }),
    bookclub: ev({ id: 'bookclub', title: '读书会 · 《房思琪》', iso: '2026-12-05T19:00', loc: 'Brooklyn-公园坡', host: { name: '小面', wx: 'xiaomian.draws' }, capacity: 5, cat: 'culture', status: 'ended', endedAt: t('2026-12-05T21:30') }),
    pottery: ev({ id: 'pottery', title: '陶艺体验 · 拉坯一次', iso: '2026-12-10T14:00', loc: 'Brooklyn-红钩', host: { name: 'Nina', wx: 'nina.runs' }, capacity: 4, cat: 'culture', status: 'ended', endedAt: t('2026-12-10T17:00') }),
    /* hosted by you */
    bar: ev({ id: 'bar', title: '周五小酒馆试营业', iso: '2026-12-19T20:30', loc: 'Manhattan-东村', host: 'you', capacity: 5, hosted: true, cat: 'night' }),
    bbq: ev({ id: 'bbq', title: '阳台烧烤 · 自带肉', iso: '2026-12-21T16:00', loc: 'Queens-长岛市', host: 'you', capacity: 4, hosted: true, version: 2, establishedAt: NOW - 30 * H }),
    wine: ev({ id: 'wine', title: '自然酒小试 · 六款', iso: '2026-12-23T19:30', loc: 'Brooklyn-威廉斯堡', host: 'you', capacity: 5, hosted: true, establishedAt: NOW - 10 * H }),
    cards: ev({ id: 'cards', title: '德州扑克新手桌', iso: '2026-12-28T20:00', loc: 'Queens-阿斯托利亚', host: 'you', capacity: 6, hosted: true, cat: 'game' }),
    museum: ev({ id: 'museum', title: '看展搭子 · 现代馆', iso: '2026-12-16T13:00', loc: 'Manhattan-中城', host: 'you', capacity: 4, hosted: true, cat: 'culture', status: 'ended', endedAt: NOW - 20 * H, establishedAt: NOW - 60 * H }),
    /* feed-only events (入局 01 seam): not joined, so a favorite never implies a sign-up */
    hotpot: ev({ id: 'hotpot', title: '冬至火锅 · 各带一样菜', iso: '2026-12-21T18:30', loc: 'Queens-法拉盛', host: { name: '阿宽', wx: 'akuan_88' }, capacity: 6 }),
    badminton: ev({ id: 'badminton', title: '周日羽毛球 · 两块场', iso: '2026-12-21T14:00', loc: 'Queens-法拉盛', host: { name: 'Momo', wx: 'momo_bd' }, capacity: 8, cat: 'sport' }),
    bakery: ev({ id: 'bakery', title: '面包店巡游 · 三家新店', iso: '2026-12-20T10:00', loc: 'Brooklyn-绿点', host: { name: '小满', wx: 'xiaoman.eats' }, capacity: 4 }),
    nightmuseum: ev({ id: 'nightmuseum', title: '博物馆夜场 · 周五免费', iso: '2026-12-26T18:00', loc: 'Manhattan-上东区', host: { name: 'Ivy', wx: 'ivy_pm' }, capacity: 5, cat: 'culture' }),
    ktv: ev({ id: 'ktv', title: 'K-town 唱到十二点', iso: '2026-12-27T21:00', loc: 'Manhattan-韩国城', host: { name: '西西', wx: 'xixi_nyc' }, capacity: 6, cat: 'night' }),
    thrift: ev({ id: 'thrift', title: '古着淘货 · 布鲁克林三家店', iso: '2026-12-28T13:00', loc: 'Brooklyn-威廉斯堡', host: { name: '阿蒋', wx: 'ajiang_vtg' }, capacity: 4, cat: 'shop' }),
    skate: ev({ id: 'skate', title: '布莱恩特公园滑冰 · 新手也来', iso: '2026-12-22T19:00', loc: 'Manhattan-中城', host: { name: 'Leon', wx: 'leon_hp' }, capacity: 6, cat: 'sport' }),
    lanight: ev({ id: 'lanight', title: '626 夜市 · 吃到走不动', iso: '2026-12-27T19:00', loc: 'Arcadia-626 夜市', host: { name: '阿紫', wx: 'azi_la' }, capacity: 6, city: 'la' }),
    bosdim: ev({ id: 'bosdim', title: '昆西早茶 · 周六', iso: '2026-12-20T10:30', loc: 'Quincy-昆西', host: { name: '大伦', wx: 'dalun_bos' }, capacity: 5, city: 'bos' })
  };
  var YOU = { id: 'you', name: '阿禾', wx: 'ahe_ju', email: 'ahe@nyu.edu', emailVerified: true, emailDomain: 'nyu.edu', emailKind: 'school' };
  /* 我的局 seam rows (stage labels mirror JU.STAGE in src/core/ju-data.js; the seam only displays and toggles favorites) */
  var JOINED = [
    { eventId: 'brunch', stage: 'invited', label: '预留中 · 等你确认', group: '要你回应', deadline: NOW + 4 * H + 21 * M, snapshot: { name: '阿禾', wx: 'ahe_ju', at: NOW - 2 * D } },
    { eventId: 'livehouse', stage: 'reschedule', label: '局主改了时间 · 等你答复', group: '要你回应', snapshot: { name: '阿禾', wx: 'ahe_ju', at: NOW - 6 * D } },
    { eventId: 'run3k', stage: 'tear', label: '已成局 · 撕票联系局主', group: '就快见面', ticket: { version: 1, torn: false }, snapshot: { name: '阿禾', wx: 'ahe_ju', at: NOW - 5 * D } },
    { eventId: 'theater', stage: 'going', label: '待赴约', group: '就快见面', ticket: { version: 1, torn: true }, contactAdded: true, snapshot: { name: '阿禾', wx: 'ahe_ju', at: NOW - 8 * D } },
    { eventId: 'dimsum', stage: 'gathering', label: '就位中 · 等全员确认', group: '还在等', snapshot: { name: '阿禾', wx: 'ahe_ju', at: NOW - 1 * D } },
    { eventId: 'vintage', stage: 'waitlist', label: '候补第 2 位', group: '还在等', snapshot: { name: '阿禾', wx: 'ahe_ju', at: NOW - 9 * H } },
    { eventId: 'sketch', stage: 'pending', label: '等局主审核', group: '还在等', snapshot: { name: '阿禾', wx: 'ahe_ju', at: NOW - 3 * H } },
    { eventId: 'jazz', stage: 'ended', label: '散场 · 记录为出席', group: '历史' },
    { eventId: 'mahjong', stage: 'rejected', label: '这次没留住', group: '历史' },
    { eventId: 'ramen', stage: 'cancelled', label: '局主取消', group: '历史' },
    { eventId: 'karaoke', stage: 'exited', label: '已退出', group: '历史' },
    { eventId: 'boardgame', stage: 'queue_left', label: '已退出候补', group: '历史' },
    { eventId: 'hike2', stage: 'ended', label: '散场 · 记录为未出席 · 待核实', group: '历史' },
    { eventId: 'hike', stage: 'expired', label: '预留已到期', group: '历史' },
    { eventId: 'picnic', stage: 'declined', label: '拒绝改期 · 已退出', group: '历史' },
    { eventId: 'bookclub', stage: 'released', label: '放弃预留', group: '历史' },
    { eventId: 'pottery', stage: 'withdrawn', label: '撤回申请', group: '历史' }
  ];
  var HOSTED = [
    { eventId: 'bar', label: '2 份申请待审', formed: false },
    { eventId: 'bbq', label: '改期中 · 1 人未答复', formed: true },
    { eventId: 'wine', label: '已成局 · 已出票', formed: true },
    { eventId: 'cards', label: '招人中 · 还差 3 人', formed: false },
    { eventId: 'museum', label: '散场 · 出席待记录', formed: true, ended: true }
  ];
  /* records = account-level facts, read-only except supplements / dispute / appeal (which append, never rewrite) */
  function RECORDS() {
    return [
      { id: 'rec-jazz', eventId: 'jazz', kind: 'attendance', value: 'present', text: '局主记录：出席', at: t('2026-12-13T10:20'), status: 'recorded', quota: false, supplements: [] },
      { id: 'rec-hike2', eventId: 'hike2', kind: 'attendance', value: 'absent', text: '局主记录：未出席 · 待核实', at: t('2026-11-23T09:10'), status: 'pending_review', quota: false, supplements: [{ text: '当天高烧，已私信局主', at: t('2026-11-23T12:00'), by: 'you' }], dispute: null },
      { id: 'rec-karaoke', eventId: 'karaoke', kind: 'exit', text: '主动退出 · 已告知局主', at: t('2026-12-11T15:00'), status: 'recorded', quota: true, supplements: [], appeal: null },
      { id: 'rec-picnic', eventId: 'picnic', kind: 'change', text: '拒绝改期 · 已退出 · 不占主动退出机会', at: t('2026-11-27T18:00'), status: 'recorded', quota: false, supplements: [] },
      { id: 'rec-hike', eventId: 'hike', kind: 'change', text: '预留到期 · 位置已释放 · 不记失约', at: t('2026-12-04T20:00'), status: 'recorded', quota: false, supplements: [] },
      { id: 'rec-ramen', eventId: 'ramen', kind: 'change', text: '局主取消 · 票根作废 · 不计你的退出', at: t('2026-12-15T12:00'), status: 'recorded', quota: false, supplements: [] },
      { id: 'rec-boardgame', eventId: 'boardgame', kind: 'change', text: '退出候补 · 不记缺席', at: t('2026-12-15T09:00'), status: 'recorded', quota: false, supplements: [] }
    ];
  }
  /* reports = things you reported about an event / a person; progress states only come from seeded scenarios */
  function REPORTS() {
    return [
      { id: 'rep-boardgame', eventId: 'boardgame', text: '局主最后一刻改了地点，没在局里说明，大家在原地等了四十分钟。', who: ['Ivy（局主）'], materials: [{ name: '群聊截图 · 1', kind: 'image' }], at: t('2026-12-17T01:30'), status: 'needs_more', localNo: 'R-1216-02',
        timeline: [{ at: t('2026-12-17T01:30'), state: 'submitted', text: '已提交' }, { at: t('2026-12-17T09:00'), state: 'received', text: '已受理' }, { at: t('2026-12-17T11:20'), state: 'needs_more', text: '需要补充：当天改地点的聊天记录或时间线' }], supplements: [] },
      { id: 'rep-karaoke', eventId: 'karaoke', text: '有成员在包厢里反复劝酒，拒绝后仍继续。', who: ['小满'], materials: [], at: t('2026-12-12T10:05'), status: 'received', localNo: 'R-1212-01',
        timeline: [{ at: t('2026-12-12T10:05'), state: 'submitted', text: '已提交' }, { at: t('2026-12-12T15:00'), state: 'received', text: '已受理' }], supplements: [] }
    ];
  }
  function FEEDBACK() { return [{ id: 'fb-1', text: '希望「找局」可以按周末筛选。', at: t('2026-12-10T21:00'), status: 'submitted', localNo: 'F-1210-01' }]; }
  var REPORT_STATES = { saved: '本地已保存 · 未提交', submitted: '已提交', received: '已受理', needs_more: '需要补充', closed: '已处理' };
  JUS.REPORT_STATES = REPORT_STATES;
  var RECORD_STATES = { recorded: '已记录', pending_review: '待核实', disputed: '异议已提出', appealed: '申诉已提出', supplemented: '已补充' };
  JUS.RECORD_STATES = RECORD_STATES;

  /* ---------------- datasets / variants ---------------- */
  JUS.VARIANTS = [
    { key: 'default', label: '标准示例' }, { key: 'empty', label: '全空（无收藏 / 记录 / 举报）' }, { key: 'many', label: '收藏与记录较多' },
    { key: 'long', label: '长称呼 / 长邮箱 / 长标题' }, { key: 'denied', label: '系统权限已拒绝' }, { key: 'unsupported', label: '浏览器不支持通知' },
    { key: 'connected', label: '权限已允许 · 服务已连接' }, { key: 'fresh', label: '新用户（邮箱未验证）' }
  ];
  function build(variant) {
    variant = variant || 'default';
    var d = {
      variant: variant,
      you: clone(YOU),
      events: clone(EVENTS),
      joined: clone(JOINED), hosted: clone(HOSTED),
      favorites: [{ eventId: 'hotpot', at: NOW - 2 * D }, { eventId: 'nightmuseum', at: NOW - 1 * D }, { eventId: 'sketch', at: NOW - 5 * H }],
      prefs: { city: 'nyc' },
      notify: { permission: 'default', serviceConnected: false, prefs: { invite: true, reserve: true, waitlist: true, reschedule: true, change: true, host: true } },
      appearance: { skin: 'cotton', reduceMotion: false },
      records: RECORDS(), reports: REPORTS(), feedback: FEEDBACK(),
      session: { kind: 'demo', startedAt: NOW - 3 * D, device: '本机浏览器' },
      flags: { failNext: false, copyFailNext: false },
      seq: 3
    };
    if (variant === 'empty') { d.favorites = []; d.records = []; d.reports = []; d.feedback = []; d.joined = d.joined.filter(function (j) { return j.group !== '历史'; }); }
    if (variant === 'many') {
      d.favorites = ['hotpot', 'nightmuseum', 'sketch', 'badminton', 'bakery', 'ktv', 'thrift', 'skate', 'lanight', 'bosdim', 'coffee', 'climb'].map(function (id, i) { return { eventId: id, at: NOW - (i + 1) * 7 * H }; });
      d.reports.push({ id: 'rep-mahjong', eventId: 'mahjong', text: '审核没通过没关系，但局主在群里公开了我的微信号。', who: ['阿宽（局主）'], materials: [], at: t('2026-12-14T20:00'), status: 'closed', localNo: 'R-1214-03', timeline: [{ at: t('2026-12-14T20:00'), state: 'submitted', text: '已提交' }, { at: t('2026-12-15T10:00'), state: 'received', text: '已受理' }, { at: t('2026-12-16T18:00'), state: 'closed', text: '已处理 · 已提醒该局主' }], supplements: [] });
      d.records.push({ id: 'rec-pottery', eventId: 'pottery', kind: 'change', text: '撤回申请 · 不影响信用', at: t('2026-12-08T10:00'), status: 'recorded', quota: false, supplements: [] });
      d.records.push({ id: 'rec-bookclub', eventId: 'bookclub', kind: 'change', text: '放弃预留 · 不记失约', at: t('2026-12-04T12:00'), status: 'recorded', quota: false, supplements: [] });
      d.records.push({ id: 'rec-mahjong', eventId: 'mahjong', kind: 'attendance', value: 'present', text: '局主记录：出席', at: t('2026-12-14T21:00'), status: 'recorded', quota: false, supplements: [] });
    }
    if (variant === 'long') {
      d.you.name = '阿禾（周末只想睡到十一点）'; d.you.email = 'hehe.zhang.weekend.brunch.2026@stern.nyu.edu'; d.you.wx = 'ahe_weekend_brunch_club_2026';
      d.events.hotpot.title = '冬至火锅 · 各带一样菜 · 不吃辣的也有清汤锅 · 吃完一起去对面买汤圆'; d.events.hotpot.loc = 'Queens-法拉盛缅街与 39 大道交口那家门口有红灯笼的店 B1';
      d.events.sketch.title = '周末速写 · 画人不画景 · 自带本子画完互相看 · 新手也欢迎来坐坐';
    }
    if (variant === 'denied') { d.notify.permission = 'denied'; }
    if (variant === 'unsupported') { d.notify.permission = 'unsupported'; }
    if (variant === 'connected') { d.notify.permission = 'granted'; d.notify.serviceConnected = true; }
    if (variant === 'fresh') { d.you = { id: 'you', name: '新来的', wx: '', email: '', emailVerified: false, emailDomain: '', emailKind: '' }; d.favorites = []; d.records = []; d.reports = []; d.feedback = []; d.joined = []; d.hosted = []; d.session.startedAt = NOW - 10 * M; }
    return d;
  }
  JUS.data = build;
  JUS.baseState = function (variant) { return { variant: variant || 'default', data: build(variant), view: { name: 'home' } }; };

  /* ---------------- persistence adapter (one namespaced key per concept; never touches other prototypes' keys) ---------------- */
  JUS.store = {
    key: function (code) { return 'jus:' + code + ':v1'; },
    load: function (code) { try { var s = global.localStorage && global.localStorage.getItem(JUS.store.key(code)); return s ? JSON.parse(s) : null; } catch (e) { return null; } },
    save: function (code, data) { try { global.localStorage && global.localStorage.setItem(JUS.store.key(code), JSON.stringify(data)); return true; } catch (e) { return false; } },
    clear: function (code) { try { global.localStorage && global.localStorage.removeItem(JUS.store.key(code)); } catch (e) { } }
  };

  /* ---------------- validation ---------------- */
  var validate = {
    name: function (v) { v = (v || '').trim(); if (!v) return '称呼不能为空'; if (v.length > 16) return '称呼最多 16 个字'; return ''; },
    wx: function (v) { v = (v || '').trim(); if (!v) return ''; if (!/^[A-Za-z][-_A-Za-z0-9]{5,19}$/.test(v)) return '微信号 6–20 位，字母开头，只能用字母、数字、下划线和减号'; return ''; },
    email: function (v) { v = (v || '').trim(); if (!v) return ''; if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return '邮箱格式不对'; return ''; },
    text: function (v, min) { v = (v || '').trim(); if (v.length < (min || 4)) return '至少写 ' + (min || 4) + ' 个字'; if (v.length > 500) return '最多 500 字'; return ''; }
  };
  JUS.validate = validate;

  /* ---------------- derivations (view models; no mutation) ---------------- */
  function eventOf(d, id) { return d.events[id]; }
  function hostName(d, e) { return e.host === 'you' ? d.you.name : e.host.name; }
  function eventStatus(d, e) {
    if (e.status === 'cancelled') return { key: 'cancelled', label: '已取消', closed: true };
    if (e.status === 'ended' || (e.endedAt && e.endedAt < NOW)) return { key: 'ended', label: '已结束', closed: true };
    if (t(e.iso) < NOW) return { key: 'past', label: '已开始', closed: true };
    return { key: 'open', label: '可报名', closed: false };
  }
  function joinedRow(d, id) { return d.joined.filter(function (j) { return j.eventId === id; })[0] || null; }
  function hostedRow(d, id) { return d.hosted.filter(function (j) { return j.eventId === id; })[0] || null; }
  function isFav(d, id) { return d.favorites.some(function (f) { return f.eventId === id; }); }
  function favRow(d, f) {
    var e = eventOf(d, f.eventId); var st = eventStatus(d, e); var j = joinedRow(d, e.id), h = hostedRow(d, e.id); var city = JUS.cityByKey(e.city);
    return { id: e.id, event: e, title: e.title, when: fmt.when(e.iso), place: fmt.place(e.loc), host: hostName(d, e), city: city, crossCity: e.city !== d.prefs.city, status: st, favAt: f.at, favAgo: fmt.ago(f.at), relation: j ? { kind: 'joined', label: j.label, stage: j.stage } : h ? { kind: 'hosted', label: h.label } : { kind: 'none', label: '未报名' }, canApply: st.key === 'open' && !j && !h, archived: st.closed };
  }
  function recordRow(d, r) {
    var e = eventOf(d, r.eventId);
    var status = r.dispute ? 'disputed' : r.appeal ? 'appealed' : r.status;
    return Object.assign({}, r, { event: e, title: e.title, when: fmt.when(e.iso), place: fmt.place(e.loc), host: hostName(d, e), atText: fmt.dateTime(r.at), statusKey: status, statusLabel: RECORD_STATES[status] || status, canDispute: r.kind === 'attendance' && r.value === 'absent' && !r.dispute, canAppeal: r.kind === 'exit' && !r.appeal, canSupplement: true, kindLabel: r.kind === 'attendance' ? '出席记录' : r.kind === 'exit' ? '主动退出' : '安排变化', quotaLabel: r.quota ? '占年度主动退出机会' : '不占机会 · 不记失约' });
  }
  function reportRow(d, r) {
    var e = eventOf(d, r.eventId);
    return Object.assign({}, r, { event: e, title: e.title, when: fmt.when(e.iso), host: hostName(d, e), atText: fmt.dateTime(r.at), statusLabel: REPORT_STATES[r.status] || r.status, needsMore: r.status === 'needs_more', open: r.status !== 'closed', timelineRows: (r.timeline || []).map(function (x) { return Object.assign({}, x, { atText: fmt.dateTime(x.at) }); }) });
  }
  JUS.derive = {
    event: eventOf, eventStatus: eventStatus, isFav: isFav, joinedRow: joinedRow, hostedRow: hostedRow, hostName: hostName,
    city: function (d) { return JUS.cityByKey(d.prefs.city); },
    /* home summary: current values for every settings group */
    summary: function (d) {
      var city = JUS.cityByKey(d.prefs.city); var n = d.notify; var onCount = Object.keys(n.prefs).filter(function (k) { return n.prefs[k]; }).length;
      var permLabel = { default: '未申请系统权限', requesting: '等系统回答', granted: n.serviceConnected ? '系统已允许 · 服务已连接' : '系统已允许 · 服务未连接', denied: '系统已拒绝', unsupported: '浏览器不支持' }[n.permission];
      var openReports = d.reports.filter(function (r) { return r.status !== 'closed'; }).length, needMore = d.reports.filter(function (r) { return r.status === 'needs_more'; }).length;
      var pending = d.records.filter(function (r) { return r.status === 'pending_review' && !r.dispute; }).length;
      return {
        you: d.you, emailLabel: d.you.email ? (d.you.emailVerified ? '已验证' : '未验证') : '未填写', wxLabel: d.you.wx ? d.you.wx : '未填写',
        favCount: d.favorites.length, favLabel: d.favorites.length ? d.favorites.length + ' 个局' : '还没有收藏',
        city: city, cityLabel: city.name, notifyLabel: onCount + '/' + JUS.NOTIFY_CATS.length + ' 类开启 · ' + permLabel, permission: n.permission, serviceConnected: n.serviceConnected,
        skin: JUS.SKINS.filter(function (s) { return s.key === d.appearance.skin; })[0], reduceMotion: d.appearance.reduceMotion, appearanceLabel: JUS.SKINS.filter(function (s) { return s.key === d.appearance.skin; })[0].name + (d.appearance.reduceMotion ? ' · 减少动态' : ''),
        recordCount: d.records.length, recordLabel: d.records.length ? d.records.length + ' 条事实' + (pending ? ' · ' + pending + ' 条待核实' : '') : '还没有记录', pendingRecords: pending,
        reportCount: d.reports.length, reportLabel: d.reports.length ? (openReports ? openReports + ' 条处理中' : '均已处理') + (needMore ? ' · ' + needMore + ' 条需要补充' : '') : '没有举报', needMore: needMore,
        feedbackCount: d.feedback.length, attention: needMore + pending,
        sessionLabel: d.session.kind === 'demo' ? JUS.COPY.demoOnly : '', joinedCount: d.joined.filter(function (j) { return j.group !== '历史'; }).length, hostedCount: d.hosted.filter(function (h) { return !h.ended; }).length
      };
    },
    favorites: function (d) {
      var rows = d.favorites.slice().sort(function (a, b) { return b.at - a.at; }).map(function (f) { return favRow(d, f); });
      return { all: rows, active: rows.filter(function (r) { return !r.archived; }), archived: rows.filter(function (r) { return r.archived; }), count: rows.length, empty: rows.length === 0 };
    },
    favorite: function (d, id) { var f = d.favorites.filter(function (x) { return x.eventId === id; })[0]; return f ? favRow(d, f) : null; },
    /* 入局 01 seam: the feed of the browse city, with favorite marks; `filter` ∈ all | fav */
    feed: function (d, filter) {
      var city = d.prefs.city;
      var rows = Object.keys(d.events).map(function (k) { return d.events[k]; }).filter(function (e) { return e.city === city && !e.hosted && eventStatus(d, e).key === 'open'; })
        .sort(function (a, b) { return t(a.iso) - t(b.iso); })
        .map(function (e) { var j = joinedRow(d, e.id); return { id: e.id, event: e, title: e.title, when: fmt.when(e.iso), place: fmt.place(e.loc), host: hostName(d, e), hostWx: e.host === 'you' ? d.you.wx : e.host.wx, capacity: e.capacity, fav: isFav(d, e.id), joined: j, joinedLabel: j ? j.label : '', canSeeHostWx: !!(j && j.ticket && j.ticket.torn && !j.contactClosed) }; });
      if (filter === 'fav') rows = rows.filter(function (r) { return r.fav; });
      return { rows: rows, count: rows.length, favCount: rows.filter(function (r) { return r.fav; }).length, city: JUS.cityByKey(city) };
    },
    /* 我的局 seam: joined / hosted rows with favorite marks; favorites never alter stage / ticket / history */
    mine: function (d) {
      var joined = d.joined.map(function (j) { var e = eventOf(d, j.eventId); return Object.assign({}, j, { id: e.id, event: e, title: e.title, when: fmt.when(e.iso), place: fmt.place(e.loc), fav: isFav(d, e.id), snapshotLabel: j.snapshot ? '报名时填写：' + j.snapshot.name + (j.snapshot.wx ? ' · ' + j.snapshot.wx : '') : '' }); });
      var hosted = d.hosted.map(function (h) { var e = eventOf(d, h.eventId); return Object.assign({}, h, { id: e.id, event: e, title: e.title, when: fmt.when(e.iso), place: fmt.place(e.loc), fav: isFav(d, e.id) }); });
      return { current: joined.filter(function (j) { return j.group !== '历史'; }), history: joined.filter(function (j) { return j.group === '历史'; }), hosted: hosted };
    },
    records: function (d) {
      var rows = d.records.slice().sort(function (a, b) { return b.at - a.at; }).map(function (r) { return recordRow(d, r); });
      var exits = rows.filter(function (r) { return r.kind === 'exit'; }).length;
      return { rows: rows, attendance: rows.filter(function (r) { return r.kind === 'attendance'; }), exits: rows.filter(function (r) { return r.kind === 'exit'; }), changes: rows.filter(function (r) { return r.kind === 'change'; }), count: rows.length, exitCount: exits, exitLine: exits ? '本机记录中的主动退出：' + exits + ' 次（2026）' : '本机记录中没有主动退出', pending: rows.filter(function (r) { return r.statusKey === 'pending_review'; }).length, empty: rows.length === 0 };
    },
    record: function (d, id) { var r = d.records.filter(function (x) { return x.id === id; })[0]; return r ? recordRow(d, r) : null; },
    reports: function (d) { var rows = d.reports.slice().sort(function (a, b) { return b.at - a.at; }).map(function (r) { return reportRow(d, r); }); return { rows: rows, open: rows.filter(function (r) { return r.open; }), closed: rows.filter(function (r) { return !r.open; }), needMore: rows.filter(function (r) { return r.needsMore; }), count: rows.length, empty: rows.length === 0 }; },
    report: function (d, id) { var r = d.reports.filter(function (x) { return x.id === id; })[0]; return r ? reportRow(d, r) : null; },
    feedback: function (d) { return d.feedback.slice().sort(function (a, b) { return b.at - a.at; }).map(function (f) { return Object.assign({}, f, { atText: fmt.dateTime(f.at), statusLabel: f.status === 'submitted' ? '已提交' : '本地已保存' }); }); },
    notify: function (d) {
      var n = d.notify; var p = JUS.COPY.permission[n.permission];
      var canDeliver = n.permission === 'granted' && n.serviceConnected;
      return { permission: n.permission, permissionLabel: JUS.PERMISSIONS.filter(function (x) { return x.key === n.permission; })[0].label, permCopy: p, serviceConnected: n.serviceConnected, serviceCopy: n.serviceConnected ? JUS.COPY.service.on : JUS.COPY.service.off, canDeliver: canDeliver, deliverLabel: canDeliver ? '提醒可以送达' : n.permission === 'granted' ? '系统已允许，但提醒服务未连接，目前不会发出提醒' : n.permission === 'denied' ? '系统已拒绝，不会显示任何提醒' : n.permission === 'unsupported' ? '不支持通知，不会有提醒' : '还未申请系统权限，不会有提醒', canRequest: n.permission === 'default', cats: JUS.NOTIFY_CATS.map(function (c) { return Object.assign({}, c, { on: !!n.prefs[c.key] }); }), onCount: Object.keys(n.prefs).filter(function (k) { return n.prefs[k]; }).length };
    },
    /* privacy: who can see your profile, derived from your actual events and the product rules */
    privacy: function (d) {
      var facts = [];
      d.hosted.forEach(function (h) { var e = eventOf(d, h.eventId); var st = eventStatus(d, e); facts.push({ eventId: e.id, title: e.title, role: '你是局主', rule: st.key === 'ended' ? (e.endedAt && NOW - e.endedAt < 24 * H ? '已散场 · 24 小时内成员仍可见你的微信' : '已散场 · 联系方式已关闭') : h.formed ? '已成局 · 撕开有效票的成员可见你的微信' : '未成局 · 成员看不到你的微信', open: st.key !== 'ended' || (e.endedAt && NOW - e.endedAt < 24 * H) }); });
      d.joined.forEach(function (j) { var e = eventOf(d, j.eventId); if (j.group === '历史') return; facts.push({ eventId: e.id, title: e.title, role: '你是参加者', rule: j.ticket ? '已成局 · 只有局主可见你的微信' : j.stage === 'pending' ? '申请中 · 局主可见你的申请资料（称呼、邮箱验证状态）' : '未成局 · 只有局主可见你的称呼', open: true }); });
      return { lead: JUS.COPY.privacyLead, general: ['称呼对局主与同局成员可见。', '微信只在成局后对局主可见；成员之间互不可见。', '邮箱只用于验证标记，任何人看不到地址本身。', '退出、拒绝改期、局主取消后，联系入口立即关闭；散场 24 小时后关闭。'], facts: facts, demo: JUS.COPY.demoOnly };
    },
    about: function (d) { return { version: 'JU 原型 · 设置 · 本地演示', built: global.__JUS_BUILT || '', rules: JUS.RULES, cities: JUS.CITIES.length, demo: JUS.COPY.demoOnly }; }
  };

  /* ---------------- engine (pure: (data, payload) → { data, effect }) ---------------- */
  function withData(data, mut) {
    var d = clone(data);
    if (d.flags && d.flags.failNext) { d.flags.failNext = false; return { data: d, effect: { type: 'error', message: JUS.COPY.saveFail } }; }
    var effect = mut(d) || { type: 'noop' };
    return { data: d, effect: effect };
  }
  function nextId(d, prefix) { d.seq = (d.seq || 0) + 1; return prefix + '-' + d.seq; }
  function localNo(d, prefix) { var p = fmt.parts(NOW); return prefix + '-' + pad(p.mo) + pad(p.d) + '-' + pad((d.seq || 0) + 1); }
  JUS.engine = {
    setFailNext: function (data, p) { var d = clone(data); d.flags.failNext = !!p.on; return { data: d, effect: { type: 'flag' } }; },
    setCopyFailNext: function (data, p) { var d = clone(data); d.flags.copyFailNext = !!p.on; return { data: d, effect: { type: 'flag' } }; },
    simPermission: function (data, p) { var d = clone(data); d.notify.permission = p.value; return { data: d, effect: { type: 'permission', value: p.value } }; },
    simService: function (data, p) { var d = clone(data); d.notify.serviceConnected = !!p.on; return { data: d, effect: { type: 'service', on: !!p.on } }; },
    /* favorites: idempotent; never touches joined / hosted / records */
    favorite: function (data, p) { return withData(data, function (d) { if (!d.events[p.eventId]) return { type: 'error', message: '这个局不存在' }; if (isFav(d, p.eventId)) return { type: 'favorited', eventId: p.eventId, already: true, count: d.favorites.length }; d.favorites.push({ eventId: p.eventId, at: NOW }); return { type: 'favorited', eventId: p.eventId, count: d.favorites.length, first: d.favorites.length === 1 }; }); },
    unfavorite: function (data, p) { return withData(data, function (d) { var before = d.favorites.length; d.favorites = d.favorites.filter(function (f) { return f.eventId !== p.eventId; }); if (d.favorites.length === before) return { type: 'unfavorited', eventId: p.eventId, already: true, count: before }; return { type: 'unfavorited', eventId: p.eventId, count: d.favorites.length, last: d.favorites.length === 0 }; }); },
    toggleFavorite: function (data, p) { return isFav(data, p.eventId) ? JUS.engine.unfavorite(data, p) : JUS.engine.favorite(data, p); },
    /* profile: explicit save; validation first (no write on invalid); email change drops the verified mark; snapshots untouched */
    saveProfile: function (data, p) {
      var errors = { name: validate.name(p.name), wx: validate.wx(p.wx), email: validate.email(p.email) };
      if (errors.name || errors.wx || errors.email) return { data: clone(data), effect: { type: 'invalid', errors: errors } };
      return withData(data, function (d) {
        var emailChanged = (p.email || '').trim() !== d.you.email; var changed = [];
        if ((p.name || '').trim() !== d.you.name) changed.push('name'); if ((p.wx || '').trim() !== d.you.wx) changed.push('wx'); if (emailChanged) changed.push('email');
        d.you.name = (p.name || '').trim(); d.you.wx = (p.wx || '').trim(); d.you.email = (p.email || '').trim();
        if (emailChanged) { d.you.emailVerified = false; d.you.emailDomain = d.you.email.split('@')[1] || ''; d.you.emailKind = /\.edu$/.test(d.you.emailDomain) ? 'school' : d.you.email ? 'work' : ''; }
        return { type: 'profile-saved', changed: changed, emailChanged: emailChanged, nothing: changed.length === 0 };
      });
    },
    /* city: immediate; scope = browse default only */
    setCity: function (data, p) { return withData(data, function (d) { if (!JUS.CITIES.some(function (c) { return c.key === p.city; })) return { type: 'error', message: '没有这座城市' }; var prev = d.prefs.city; d.prefs.city = p.city; return { type: 'city', city: p.city, prev: prev, same: prev === p.city }; }); },
    /* notifications: product preference is immediate; permission request is a simulated system round-trip the concept animates */
    setNotifyPref: function (data, p) { return withData(data, function (d) { d.notify.prefs[p.key] = !!p.on; return { type: 'pref', key: p.key, on: !!p.on }; }); },
    requestPermission: function (data, p) { return withData(data, function (d) { if (d.notify.permission !== 'default') return { type: 'permission', value: d.notify.permission, noop: true }; d.notify.permission = 'requesting'; return { type: 'permission', value: 'requesting' }; }); },
    resolvePermission: function (data, p) { return withData(data, function (d) { if (d.notify.permission !== 'requesting') return { type: 'permission', value: d.notify.permission, noop: true }; d.notify.permission = p.value === 'granted' ? 'granted' : 'denied'; return { type: 'permission', value: d.notify.permission }; }); },
    /* appearance: preview is view state in the concept; apply writes; reduce motion is immediate */
    applySkin: function (data, p) { return withData(data, function (d) { var prev = d.appearance.skin; d.appearance.skin = p.skin; return { type: 'skin', skin: p.skin, prev: prev }; }); },
    setReduceMotion: function (data, p) { return withData(data, function (d) { d.appearance.reduceMotion = !!p.on; return { type: 'reduce-motion', on: !!p.on }; }); },
    /* records: append-only supplements / dispute / appeal; the fact text itself is never rewritten */
    addSupplement: function (data, p) {
      var err = validate.text(p.text, 4); if (err) return { data: clone(data), effect: { type: 'invalid', errors: { text: err } } };
      return withData(data, function (d) { var r = d.records.filter(function (x) { return x.id === p.recordId; })[0]; if (!r) return { type: 'error', message: '找不到这条记录' }; r.supplements.push({ text: p.text.trim(), at: NOW, by: 'you', materials: p.materials || [] }); if (r.status === 'recorded') r.status = 'supplemented'; return { type: 'supplemented', recordId: r.id, count: r.supplements.length }; });
    },
    fileDispute: function (data, p) {
      var err = validate.text(p.text, 4); if (err) return { data: clone(data), effect: { type: 'invalid', errors: { text: err } } };
      return withData(data, function (d) { var r = d.records.filter(function (x) { return x.id === p.recordId; })[0]; if (!r) return { type: 'error', message: '找不到这条记录' }; if (r.kind !== 'attendance' || r.value !== 'absent') return { type: 'error', message: '只能对「未出席」记录提出异议' }; if (r.dispute) return { type: 'error', message: '已经提出过异议' }; r.dispute = { text: p.text.trim(), at: NOW, status: 'submitted', materials: p.materials || [] }; return { type: 'disputed', recordId: r.id }; });
    },
    fileAppeal: function (data, p) {
      var err = validate.text(p.text, 4); if (err) return { data: clone(data), effect: { type: 'invalid', errors: { text: err } } };
      return withData(data, function (d) { var r = d.records.filter(function (x) { return x.id === p.recordId; })[0]; if (!r) return { type: 'error', message: '找不到这条记录' }; if (r.kind !== 'exit') return { type: 'error', message: '只能对主动退出记录申诉' }; if (r.appeal) return { type: 'error', message: '已经申诉过' }; r.appeal = { text: p.text.trim(), at: NOW, status: 'submitted', materials: p.materials || [] }; return { type: 'appealed', recordId: r.id }; });
    },
    /* reports: supplement an existing one (needs_more → submitted), or file a new one from a seam */
    supplementReport: function (data, p) {
      var err = validate.text(p.text, 4); if (err && !(p.materials && p.materials.length)) return { data: clone(data), effect: { type: 'invalid', errors: { text: err } } };
      return withData(data, function (d) { var r = d.reports.filter(function (x) { return x.id === p.reportId; })[0]; if (!r) return { type: 'error', message: '找不到这条举报' }; r.supplements.push({ text: (p.text || '').trim(), at: NOW, materials: p.materials || [] }); if (r.status === 'needs_more') { r.status = 'submitted'; r.timeline.push({ at: NOW, state: 'submitted', text: '已补充 · 等待处理' }); } return { type: 'report-supplemented', reportId: r.id, wasNeedsMore: r.status === 'submitted' }; });
    },
    fileReport: function (data, p) {
      var err = validate.text(p.text, 4); if (err) return { data: clone(data), effect: { type: 'invalid', errors: { text: err } } };
      return withData(data, function (d) { if (!d.events[p.eventId]) return { type: 'error', message: '这个局不存在' }; var id = nextId(d, 'rep'); d.reports.push({ id: id, eventId: p.eventId, text: p.text.trim(), who: p.who || [], materials: p.materials || [], at: NOW, status: 'submitted', localNo: localNo(d, 'R'), timeline: [{ at: NOW, state: 'submitted', text: '已提交' }], supplements: [] }); return { type: 'report-filed', reportId: id }; });
    },
    submitFeedback: function (data, p) {
      var err = validate.text(p.text, 4); if (err) return { data: clone(data), effect: { type: 'invalid', errors: { text: err } } };
      return withData(data, function (d) { var id = nextId(d, 'fb'); d.feedback.push({ id: id, text: p.text.trim(), at: NOW, status: 'submitted', localNo: localNo(d, 'F') }); return { type: 'feedback', id: id }; });
    },
    /* copy: the real clipboard result decides the feedback; copyFailNext simulates a refused clipboard (review panel only) */
    copyResult: function (data, p) { var d = clone(data); var fail = d.flags.copyFailNext || !p.ok; d.flags.copyFailNext = false; return { data: d, effect: fail ? { type: 'copy-failed', value: p.value, message: JUS.COPY.copyFail } : { type: 'copied', value: p.value, message: JUS.COPY.copyOk } }; },
    /* account (demo only): ends the demo session; isolated to this concept's namespace */
    endDemoSession: function (data, p) { return withData(data, function (d) { d.session = { kind: 'ended', endedAt: NOW, device: d.session.device }; return { type: 'session-ended' }; }); },
    restartDemoSession: function (data, p) { return withData(data, function (d) { d.session = { kind: 'demo', startedAt: NOW, device: '本机浏览器' }; return { type: 'session-started' }; }); }
  };

  /* ---------------- state index (review panel) ---------------- */
  var G = { home: '首页与资料', fav: '收藏与城市', notify: '通知与外观', rec: '记录与举报', help: '帮助与账户', seam: '跨模块接缝', edge: '边界与变体' };
  JUS.INDEX = [
    { key: 's-home', group: G.home, label: '设置首页', open: { surface: 'home' } },
    { key: 's-home-attention', group: G.home, label: '首页 · 有需要处理的项', open: { surface: 'home' } },
    { key: 's-profile', group: G.home, label: '个人资料', open: { surface: 'profile' } },
    { key: 's-profile-edit', group: G.home, label: '编辑资料', open: { surface: 'profile-edit' } },
    { key: 's-profile-invalid', group: G.home, label: '编辑资料 · 校验失败', open: { surface: 'profile-edit', state: 'invalid' } },
    { key: 's-profile-saved', group: G.home, label: '资料已保存', open: { surface: 'profile', state: 'saved' } },
    { key: 's-profile-fresh', group: G.home, label: '新用户 · 邮箱未验证', variant: 'fresh', open: { surface: 'profile' } },
    { key: 's-fav', group: G.fav, label: '收藏的局', open: { surface: 'favorites' } },
    { key: 's-fav-detail', group: G.fav, label: '收藏 · 活动详情', open: { surface: 'favorite-detail', id: 'hotpot' } },
    { key: 's-fav-empty', group: G.fav, label: '收藏 · 空态', variant: 'empty', open: { surface: 'favorites' } },
    { key: 's-fav-many', group: G.fav, label: '收藏 · 较多（含跨城市）', variant: 'many', open: { surface: 'favorites' } },
    { key: 's-city', group: G.fav, label: '默认浏览城市', open: { surface: 'city' } },
    { key: 's-city-search', group: G.fav, label: '城市搜索 · 无结果', open: { surface: 'city', state: 'noresult' } },
    { key: 's-notify', group: G.notify, label: '通知与提醒', open: { surface: 'notify' } },
    { key: 's-notify-request', group: G.notify, label: '通知 · 请求系统权限中', open: { surface: 'notify', state: 'requesting' } },
    { key: 's-notify-denied', group: G.notify, label: '通知 · 系统已拒绝', variant: 'denied', open: { surface: 'notify' } },
    { key: 's-notify-unsupported', group: G.notify, label: '通知 · 不支持', variant: 'unsupported', open: { surface: 'notify' } },
    { key: 's-notify-connected', group: G.notify, label: '通知 · 已允许且服务已连接', variant: 'connected', open: { surface: 'notify' } },
    { key: 's-appearance', group: G.notify, label: '外观与动态', open: { surface: 'appearance' } },
    { key: 's-appearance-preview', group: G.notify, label: '外观 · 预览落日', open: { surface: 'appearance', state: 'preview', id: 'sunset' } },
    { key: 's-records', group: G.rec, label: '我的记录', open: { surface: 'records' } },
    { key: 's-record-absent', group: G.rec, label: '记录详情 · 未出席待核实', open: { surface: 'record-detail', id: 'rec-hike2' } },
    { key: 's-record-dispute', group: G.rec, label: '出席异议 · 填写', open: { surface: 'record-dispute', id: 'rec-hike2' } },
    { key: 's-record-exit', group: G.rec, label: '记录详情 · 主动退出', open: { surface: 'record-detail', id: 'rec-karaoke' } },
    { key: 's-record-appeal', group: G.rec, label: '信用申诉 · 填写', open: { surface: 'record-appeal', id: 'rec-karaoke' } },
    { key: 's-record-supplement', group: G.rec, label: '补充记录 · 填写', open: { surface: 'record-supplement', id: 'rec-hike2' } },
    { key: 's-records-empty', group: G.rec, label: '记录 · 空态', variant: 'empty', open: { surface: 'records' } },
    { key: 's-reports', group: G.rec, label: '我的举报', open: { surface: 'reports' } },
    { key: 's-report-needmore', group: G.rec, label: '举报详情 · 需要补充', open: { surface: 'report-detail', id: 'rep-boardgame' } },
    { key: 's-report-supplement', group: G.rec, label: '举报补充 · 填写', open: { surface: 'report-supplement', id: 'rep-boardgame' } },
    { key: 's-report-received', group: G.rec, label: '举报详情 · 已受理', open: { surface: 'report-detail', id: 'rep-karaoke' } },
    { key: 's-reports-empty', group: G.rec, label: '举报 · 空态', variant: 'empty', open: { surface: 'reports' } },
    { key: 's-help', group: G.help, label: '帮助与反馈', open: { surface: 'help' } },
    { key: 's-feedback', group: G.help, label: '产品反馈 · 填写', open: { surface: 'feedback' } },
    { key: 's-privacy', group: G.help, label: '隐私与资料可见性', open: { surface: 'privacy' } },
    { key: 's-account', group: G.help, label: '账户与本机数据', open: { surface: 'account' } },
    { key: 's-account-confirm', group: G.help, label: '账户 · 危险操作确认', open: { surface: 'account', state: 'confirm' } },
    { key: 's-about', group: G.help, label: '关于与规则', open: { surface: 'about' } },
    { key: 's-rules', group: G.help, label: '规则全文（长文）', open: { surface: 'rules' } },
    { key: 's-seam-feed', group: G.seam, label: '入局 01 · 找局列表（滑动收藏）', open: { surface: 'seam-feed' } },
    { key: 's-seam-feed-fav', group: G.seam, label: '入局 01 · 只看收藏', open: { surface: 'seam-feed', state: 'fav' } },
    { key: 's-seam-feed-detail', group: G.seam, label: '入局 · 活动详情（未报名）', open: { surface: 'seam-feed-detail', id: 'hotpot' } },
    { key: 's-seam-mine', group: G.seam, label: '我的局 · 列表（含收藏标记）', open: { surface: 'seam-mine' } },
    { key: 's-long', group: G.edge, label: '长称呼 / 长邮箱 / 长标题', variant: 'long', open: { surface: 'home' } },
    { key: 's-long-fav', group: G.edge, label: '长标题 · 收藏列表', variant: 'long', open: { surface: 'favorites' } },
    { key: 's-fail', group: G.edge, label: '保存失败 · 重试', open: { surface: 'profile-edit', state: 'fail' } }
  ];
  /* cross-module id mapping (filled from the V27 / R3 extracts; see settings/spec/state-contract.md) */
  JUS.IDMAP = { v27: {}, r3: {}, note: '待抽取结果填写：V27 以城市 + 标题为收藏键，R3 以活动 id 为键；本契约以 id 为唯一身份' };
})(typeof window !== 'undefined' ? window : this);

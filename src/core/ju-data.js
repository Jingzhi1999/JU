/* ju-data.js — shared demo dataset, derivations, business engine and state index for all ten concepts.
   Everything here is product semantics; nothing here is visual. Concepts call:
     JU.data(variant)            fresh deep copy of a dataset
     JU.baseState(variant)       { variant, role, section, data, view }
     JU.derive.joined(data)      participant list model (groups, labels, objects, ctas)
     JU.derive.hosted(data)      host list model (sections, labels, seats, ctas) + drafts + history
     JU.derive.event(data, id)   one event with both-side facts
     JU.engine.<action>(data, payload) → { data, effect }   (data is a NEW deep copy; effect describes what to animate)
     JU.fmt.*                    formatting helpers
     JU.INDEX                    state index for the review panel
   Rules preserved from the product: capacity includes the host; applications/waitlist never hold a seat; 6-hour reservation;
   formed = everyone (incl. host) confirmed; ticket valid only for the current version; tear → contact within 8h; contact closes
   24h after ending; reschedule asks confirmed members (accept = new ticket, decline = seat released, not an active withdrawal);
   cancel is irreversible (tickets void, contacts closed, not counted against members); 未出席 is a fact awaiting review, never a penalty. */
(function (global) {
  'use strict';
  var JU = global.JU = global.JU || {};
  var H = 3600000, M = 60000;
  function t(iso) { var m = /^(\d{4})-(\d{2})-(\d{2})(?:T(\d{2}):(\d{2}))?/.exec(iso); return Date.UTC(+m[1], +m[2] - 1, +m[3], m[4] ? +m[4] : 0, m[5] ? +m[5] : 0); }
  var NOW = t('2026-12-17T15:00'); JU.NOW = NOW; JU.t = t;
  var WD_EN = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'], WD_ZH = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'], WD_ZH1 = ['日', '一', '二', '三', '四', '五', '六'];
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function parts(iso) { var d = new Date(t(iso)); return { y: d.getUTCFullYear(), mo: d.getUTCMonth() + 1, d: d.getUTCDate(), h: d.getUTCHours(), mi: d.getUTCMinutes(), wd: d.getUTCDay() }; }
  var fmt = {
    when: function (iso) {
      if (!iso) return { en: '', zh: '', md: '', time: '', wdEn: '', wdZh: '', wd1: '', date: '', long: '', meeting: '', month: '', day: '' };
      var p = parts(iso); var md = pad(p.mo) + '.' + pad(p.d), time = pad(p.h) + ':' + pad(p.mi);
      var mt = new Date(t(iso) - 10 * M); var meeting = pad(mt.getUTCHours()) + ':' + pad(mt.getUTCMinutes()) + ' 门口';
      return { en: WD_EN[p.wd] + ' ' + md + ' · ' + time, zh: WD_ZH[p.wd] + ' ' + md + ' · ' + time, md: md, time: time, wdEn: WD_EN[p.wd], wdZh: WD_ZH[p.wd], wd1: WD_ZH1[p.wd], date: p.mo + '月' + p.d + '日', long: p.mo + '月' + p.d + '日 ' + WD_ZH[p.wd] + ' ' + time, meeting: meeting, month: pad(p.mo), day: pad(p.d), hour: pad(p.h), minute: pad(p.mi), iso: iso };
    },
    place: function (loc) { if (!loc) return { area: '', hood: '', full: '' }; var i = loc.indexOf('-'); if (i < 0) return { area: '', hood: loc, full: loc }; return { area: loc.slice(0, i), hood: loc.slice(i + 1), full: loc.slice(0, i) + ' · ' + loc.slice(i + 1) }; },
    left: function (ms) { if (ms <= 0) return '00:00:00'; var s = Math.floor(ms / 1000); return pad(Math.floor(s / 3600)) + ':' + pad(Math.floor(s / 60) % 60) + ':' + pad(s % 60); },
    leftShort: function (ms) { if (ms <= 0) return '已到期'; var h = Math.floor(ms / H), m = Math.floor((ms % H) / M); return h > 0 ? h + ' 小时 ' + m + ' 分' : m + ' 分钟'; },
    ago: function (ms) { var d = NOW - ms; if (d < M) return '刚刚'; if (d < H) return Math.floor(d / M) + ' 分钟前'; if (d < 24 * H) return Math.floor(d / H) + ' 小时前'; return Math.floor(d / (24 * H)) + ' 天前'; },
    abs: function (ms) { var d = new Date(ms); return (d.getUTCMonth() + 1) + '.' + pad(d.getUTCDate()) + ' ' + pad(d.getUTCHours()) + ':' + pad(d.getUTCMinutes()); },
    deadlineCopy: function (ms) { var d = new Date(ms), n = new Date(NOW); var day = d.getUTCDate() === n.getUTCDate() ? '今天' : (d.getUTCDate() === n.getUTCDate() + 1 ? '明天' : (d.getUTCMonth() + 1) + '月' + d.getUTCDate() + '日'); return '请在 ' + day + ' ' + pad(d.getUTCHours()) + ':' + pad(d.getUTCMinutes()) + ' 前阅读并确认'; },
    seatLine: function (c) { var parts = []; if (c.reserved) parts.push('预留 ' + c.reserved); if (c.available) parts.push('空 ' + c.available); if (c.queue) parts.push('候补 ' + c.queue); return parts.join(' · '); },
    isoAdd: function (iso, days, minutes) { var d = new Date(t(iso) + days * 24 * H + (minutes || 0) * M); return d.getUTCFullYear() + '-' + pad(d.getUTCMonth() + 1) + '-' + pad(d.getUTCDate()) + 'T' + pad(d.getUTCHours()) + ':' + pad(d.getUTCMinutes()); }
  };
  JU.fmt = fmt;
  function clone(o) { return JSON.parse(JSON.stringify(o)); }
  var uid = 0; function id(p) { return p + '-' + (++uid); }

  /* ------------------------------------------------------------------ people ------------------------------------------------------------------ */
  var YOU = { id: 'you', name: '阿禾', wx: 'ahe_ju' };
  var APPLICANTS = [
    { id: 'ap-xiaoman', nick: '小满', wx: 'xm_01', note: '第一次来，会带一副牌', verified: true, mail: 'xiaoman@nyu.edu', appliedAt: NOW - 25 * M },
    { id: 'ap-kiki', nick: 'Kiki', wx: 'kiki1210', note: '新手友好吗？', verified: false, mail: '', appliedAt: NOW - 2 * H },
    { id: 'ap-ajiang', nick: '阿蒋', wx: 'jiang_sva', note: 'SVA 在读，想认识新朋友', verified: true, mail: 'ajiang@nyu.edu', appliedAt: NOW - 40 * M },
    { id: 'ap-momo', nick: 'Momo', wx: 'momo-cold', note: '带一杯冷萃当见面礼', verified: true, mail: 'momo@nyu.edu', appliedAt: NOW - 3 * H },
    { id: 'ap-leon', nick: 'Leon', wx: 'leon_hp', note: '下班直接过去', verified: false, mail: '', appliedAt: NOW - 5 * H },
    { id: 'ap-ivy', nick: 'Ivy', wx: 'ivy_pm', note: '', verified: true, mail: 'ivy@nyu.edu', appliedAt: NOW - 9 * H },
    { id: 'ap-xixi', nick: '西西', wx: 'xixi_nyc', note: '住得近，可以帮忙占位', verified: true, mail: 'xixi@columbia.edu', appliedAt: NOW - 11 * H },
    { id: 'ap-akuan', nick: '阿宽', wx: 'akuan_88', note: '', verified: false, mail: '', appliedAt: NOW - 26 * H }
  ];

  /* ------------------------------------------------------------------ events ------------------------------------------------------------------ */
  /* pack = card art family carried over from the old product (invite / riso / acid / street / grain / mono); concepts may map it to their own palette */
  function ev(o) { return Object.assign({ version: 1, status: 'open', joinMode: 'application', pack: 'invite', cat: 'food', fee: '', note: '' }, o); }
  var EVENTS = {
    /* 我参加的 */
    brunch: ev({ id: 'brunch', title: '周六早午餐 · 只聊不卷', en: 'SLOW BRUNCH', pack: 'invite', cat: 'food', iso: '2026-12-19T11:30', loc: 'Brooklyn-威廉斯堡', host: { name: '阿檬', wx: 'ameng.nyc' }, capacity: 4, note: '一家不赶客的早午餐店，聊聊最近在读的书。' }),
    livehouse: ev({ id: 'livehouse', title: '周四 Livehouse · 散场后吃宵夜', en: 'LATE SHOW', pack: 'acid', cat: 'night', iso: '2026-12-18T21:30', loc: 'Brooklyn-布什维克', host: { name: '老杨', wx: 'laoyang.ju' }, capacity: 5, version: 2, note: '票各买各的，散场后一起去隔壁吃宵夜。' }),
    run3k: ev({ id: 'run3k', title: '公园慢跑 3K · 跑完喝咖啡', en: 'EASY 3K', pack: 'grain', cat: 'sport', iso: '2026-12-20T09:00', loc: 'Manhattan-中央公园', host: { name: 'Nina', wx: 'nina.runs' }, capacity: 6, joinMode: 'direct', note: '配速随意，跑完去 72 街喝咖啡。' }),
    coffee: ev({ id: 'coffee', title: '手冲咖啡品鉴 · 三款豆子', en: 'POUR OVER', pack: 'mono', cat: 'food', iso: '2026-12-21T15:00', loc: 'Queens-阿斯托利亚', host: { name: '蛋挞', wx: 'dantat.coffee' }, capacity: 4, note: '我带豆子和器具，你带杯子。' }),
    theater: ev({ id: 'theater', title: '外百老汇小剧场 · 一起看《海鸥》', en: 'OFF-BROADWAY', pack: 'riso', cat: 'culture', iso: '2026-12-19T19:30', loc: 'Manhattan-西村', host: { name: '花卷', wx: 'huajuan_play' }, capacity: 4, note: '散场后在剧场门口聊十分钟就走。' }),
    sketch: ev({ id: 'sketch', title: '周末速写 · 画人不画景', en: 'URBAN SKETCH', pack: 'street', cat: 'culture', iso: '2026-12-27T14:00', loc: 'Brooklyn-DUMBO', host: { name: '小面', wx: 'xiaomian.draws' }, capacity: 5, note: '自带本子，画完互相看。' }),
    vintage: ev({ id: 'vintage', title: '古着淘货 · 下东区三家店', en: 'VINTAGE WALK', pack: 'acid', cat: 'shop', iso: '2026-12-26T13:00', loc: 'Manhattan-下东区', host: { name: 'Kiki', wx: 'kiki1210' }, capacity: 4, note: '三家店走一圈，不买也行。' }),
    dimsum: ev({ id: 'dimsum', title: '法拉盛早茶 · 周日十点', en: 'DIM SUM', pack: 'invite', cat: 'food', iso: '2026-12-21T10:00', loc: 'Queens-法拉盛', host: { name: '阿宽', wx: 'akuan_88' }, capacity: 5, note: '人齐了才点菜。' }),
    climb: ev({ id: 'climb', title: '新手攀岩 · 周三晚上', en: 'BOULDER NIGHT', pack: 'street', cat: 'sport', iso: '2026-12-24T19:00', loc: 'Brooklyn-绿点', host: { name: 'Leon', wx: 'leon_hp' }, capacity: 4, note: '租鞋 12 刀，第一次来有人教。' }),
    jazz: ev({ id: 'jazz', title: '周五爵士小酒馆 · 第二场', en: 'JAZZ SET', pack: 'mono', cat: 'night', iso: '2026-12-12T22:00', loc: 'Manhattan-哈莱姆', host: { name: '老杨', wx: 'laoyang.ju' }, capacity: 4, status: 'ended', endedAt: t('2026-12-13T01:00') }),
    mahjong: ev({ id: 'mahjong', title: '周末麻将 · 不赌钱', en: 'MAHJONG', pack: 'riso', cat: 'game', iso: '2026-12-14T15:00', loc: 'Queens-埃姆赫斯特', host: { name: '阿宽', wx: 'akuan_88' }, capacity: 4, status: 'ended', endedAt: t('2026-12-14T19:00') }),
    ramen: ev({ id: 'ramen', title: '深夜拉面 · 吃完散步回家', en: 'MIDNIGHT RAMEN', pack: 'grain', cat: 'food', iso: '2026-12-15T23:00', loc: 'Manhattan-东村', host: { name: '西西', wx: 'xixi_nyc' }, capacity: 4, status: 'cancelled', cancelledAt: t('2026-12-15T12:00') }),
    boardgame: ev({ id: 'boardgame', title: '桌游夜 · 新手局', en: 'BOARD GAMES', pack: 'street', cat: 'game', iso: '2026-12-16T19:00', loc: 'Brooklyn-公园坡', host: { name: 'Ivy', wx: 'ivy_pm' }, capacity: 6, status: 'ended', endedAt: t('2026-12-16T23:00') }),
    pottery: ev({ id: 'pottery', title: '陶艺体验 · 拉坯一次', en: 'POTTERY', pack: 'grain', cat: 'culture', iso: '2026-12-10T14:00', loc: 'Brooklyn-红钩', host: { name: 'Nina', wx: 'nina.runs' }, capacity: 4, status: 'ended', endedAt: t('2026-12-10T17:00') }),
    karaoke: ev({ id: 'karaoke', title: 'K 歌 · 只唱老歌', en: 'KARAOKE', pack: 'acid', cat: 'night', iso: '2026-12-11T21:00', loc: 'Queens-法拉盛', host: { name: '花卷', wx: 'huajuan_play' }, capacity: 6, status: 'ended', endedAt: t('2026-12-12T00:30') }),
    picnic: ev({ id: 'picnic', title: '秋末野餐 · 各带一样', en: 'PICNIC', pack: 'invite', cat: 'food', iso: '2026-11-29T12:00', loc: 'Manhattan-中央公园', host: { name: '蛋挞', wx: 'dantat.coffee' }, capacity: 6, status: 'ended', endedAt: t('2026-11-29T16:00'), version: 2 }),
    hike: ev({ id: 'hike', title: '熊山徒步 · 早班车', en: 'BEAR MTN', pack: 'street', cat: 'sport', iso: '2026-12-06T07:30', loc: 'Upstate-熊山', host: { name: 'Leon', wx: 'leon_hp' }, capacity: 5, status: 'ended', endedAt: t('2026-12-06T17:00') }),
    bookclub: ev({ id: 'bookclub', title: '读书会 · 《房思琪》', en: 'BOOK CLUB', pack: 'mono', cat: 'culture', iso: '2026-12-05T19:00', loc: 'Brooklyn-公园坡', host: { name: '小面', wx: 'xiaomian.draws' }, capacity: 5, status: 'ended', endedAt: t('2026-12-05T21:30') }),
    /* 我发起的 */
    bar: ev({ id: 'bar', title: '周五小酒馆试营业', en: 'BAR TRIAL', pack: 'riso', cat: 'night', iso: '2026-12-19T20:30', loc: 'Manhattan-东村', host: YOU, capacity: 5, hosted: true, note: '朋友的店试营业，我们去捧场。' }),
    bbq: ev({ id: 'bbq', title: '阳台烧烤 · 自带肉', en: 'ROOF BBQ', pack: 'street', cat: 'food', iso: '2026-12-21T16:00', loc: 'Queens-长岛市', host: YOU, capacity: 4, hosted: true, version: 2, establishedAt: NOW - 30 * H, proposal: { oldIso: '2026-12-20T17:00', at: NOW - 6 * H }, note: '我出炭和炉子，肉各带各的。' }),
    museum: ev({ id: 'museum', title: '看展搭子 · 现代馆', en: 'MoMA WALK', pack: 'acid', cat: 'culture', iso: '2026-12-16T13:00', loc: 'Manhattan-中城', host: YOU, capacity: 4, hosted: true, status: 'ended', endedAt: NOW - 20 * H, establishedAt: NOW - 60 * H }),
    wine: ev({ id: 'wine', title: '自然酒小试 · 六款', en: 'NATURAL WINE', pack: 'mono', cat: 'food', iso: '2026-12-23T19:30', loc: 'Brooklyn-威廉斯堡', host: YOU, capacity: 5, hosted: true, establishedAt: NOW - 10 * H, note: '六款酒，每人出 20 刀。' }),
    cards: ev({ id: 'cards', title: '德州扑克新手桌', en: 'POKER 101', pack: 'grain', cat: 'game', iso: '2026-12-28T20:00', loc: 'Queens-阿斯托利亚', host: YOU, capacity: 6, hosted: true, joinMode: 'direct' }),
    hostwine2: ev({ id: 'hostwine2', title: '自然酒小试 · 四款', en: 'NATURAL WINE I', pack: 'mono', cat: 'food', iso: '2026-12-04T19:30', loc: 'Brooklyn-威廉斯堡', host: YOU, capacity: 5, hosted: true, status: 'ended', endedAt: t('2026-12-04T23:00'), establishedAt: t('2026-12-01T10:00') }),
    hostcards2: ev({ id: 'hostcards2', title: '德州扑克新手桌 · 第一期', en: 'POKER 101', pack: 'grain', cat: 'game', iso: '2026-11-20T20:00', loc: 'Queens-阿斯托利亚', host: YOU, capacity: 6, hosted: true, status: 'ended', endedAt: t('2026-11-21T00:00'), establishedAt: t('2026-11-18T10:00') }),
    hostpicnic: ev({ id: 'hostpicnic', title: '河边野餐 · 下雨取消', en: 'RIVER PICNIC', pack: 'invite', cat: 'food', iso: '2026-11-15T12:00', loc: 'Brooklyn-多米诺公园', host: YOU, capacity: 6, hosted: true, status: 'cancelled', cancelledAt: t('2026-11-14T20:00') })
  };
  var LONG = { brunch: { title: '周六早午餐 · 只聊不卷 · 带上一本最近在读的书', loc: 'Brooklyn-威廉斯堡北六街与贝德福德大道交口那家门口有绿色雨棚的店' }, livehouse: { title: '周四 Livehouse · 散场后一起吃宵夜 · 不喝酒也欢迎来坐坐', loc: 'Brooklyn-布什维克 Knickerbocker 大道与 Troutman 街口（蓝门）' }, bar: { title: '周五小酒馆试营业 · 第一次开门请多包涵 · 来的人都有一杯', loc: 'Manhattan-东村圣马克广场 B1（门口有红灯笼，走到底左转）' } };

  /* ------------------------------------------------------------------ participant items ------------------------------------------------------------------ */
  function mem(name, status, extra) { return Object.assign({ id: id('m'), name: name, status: status }, extra || {}); }
  function joinItem(eventId, stage, extra) { return Object.assign({ eventId: eventId, stage: stage, members: [], queue: [], ticket: null, deadline: null, queuePos: 0, attendance: null, records: [], contactAdded: false }, extra || {}); }
  function joinedDefault() {
    return [
      joinItem('brunch', 'invited', { deadline: NOW + 4 * H + 21 * M, members: [mem('阿檬', 'host'), mem('小面', 'confirmed'), mem('阿禾', 'invited', { you: true, deadline: NOW + 4 * H + 21 * M })] }),
      joinItem('livehouse', 'reschedule', { ticket: { version: 1, torn: true }, contactAdded: true, reschedule: { oldIso: '2026-12-18T20:30', newIso: '2026-12-18T21:30', at: NOW - 3 * H }, members: [mem('老杨', 'host'), mem('阿禾', 'confirmed', { you: true }), mem('Momo', 'confirmed'), mem('Leon', 'confirmed'), mem('西西', 'confirmed')] }),
      joinItem('run3k', 'tear', { ticket: { version: 1, torn: false }, members: [mem('Nina', 'host'), mem('阿禾', 'confirmed', { you: true }), mem('小面', 'confirmed'), mem('阿宽', 'confirmed'), mem('蛋挞', 'confirmed'), mem('花卷', 'confirmed')] }),
      joinItem('coffee', 'contact', { ticket: { version: 1, torn: true }, members: [mem('蛋挞', 'host'), mem('阿禾', 'confirmed', { you: true }), mem('Ivy', 'confirmed'), mem('Nina', 'confirmed')] }),
      joinItem('theater', 'going', { ticket: { version: 1, torn: true }, contactAdded: true, members: [mem('花卷', 'host'), mem('阿禾', 'confirmed', { you: true }), mem('西西', 'confirmed'), mem('小面', 'confirmed')] }),
      joinItem('sketch', 'pending', { appliedAt: NOW - 20 * H, members: [mem('小面', 'host'), mem('Nina', 'confirmed'), mem('Leon', 'invited', { deadline: NOW + 2 * H })] }),
      joinItem('vintage', 'waitlist', { queuePos: 2, joinedAt: NOW - 9 * H, members: [mem('Kiki', 'host'), mem('阿宽', 'confirmed'), mem('蛋挞', 'confirmed'), mem('花卷', 'invited', { deadline: NOW + 1 * H + 5 * M })], queue: [{ name: 'Leon' }, { name: '阿禾', you: true }] }),
      joinItem('dimsum', 'gathering', { members: [mem('阿宽', 'host'), mem('阿禾', 'confirmed', { you: true }), mem('小面', 'confirmed'), mem('Nina', 'invited', { deadline: NOW + 2 * H + 8 * M }), mem('', 'open')] }),
      joinItem('jazz', 'ended', { ticket: { version: 1, torn: true }, contactAdded: true, attendance: 'present', endedAt: t('2026-12-13T01:00'), members: [mem('老杨', 'host'), mem('阿禾', 'confirmed', { you: true }), mem('Momo', 'confirmed'), mem('Leon', 'confirmed')], records: [{ kind: 'attendance', text: '局主记录：出席', at: t('2026-12-13T10:20') }] }),
      joinItem('mahjong', 'rejected', { appliedAt: t('2026-12-13T09:00'), decidedAt: t('2026-12-13T18:00'), members: [mem('阿宽', 'host')] }),
      joinItem('ramen', 'cancelled', { ticket: { version: 1, torn: false, void: true }, cancelledAt: t('2026-12-15T12:00'), members: [mem('西西', 'host'), mem('阿禾', 'confirmed', { you: true }), mem('花卷', 'confirmed'), mem('Ivy', 'confirmed')] }),
      joinItem('boardgame', 'queue_left', { leftAt: t('2026-12-15T20:00'), members: [mem('Ivy', 'host')] })
    ];
  }
  function joinedExtraCurrent() {
    return [
      joinItem('climb', 'invited_queue', { deadline: NOW + 5 * H + 40 * M, queuePos: 0, members: [mem('Leon', 'host'), mem('西西', 'confirmed'), mem('阿禾', 'invited', { you: true, deadline: NOW + 5 * H + 40 * M }), mem('', 'open')] })
    ];
  }
  function joinedExtraHistory() {
    return [
      joinItem('pottery', 'withdrawn', { appliedAt: t('2026-12-07T10:00'), leftAt: t('2026-12-08T09:00'), members: [mem('Nina', 'host')] }),
      joinItem('karaoke', 'exited', { ticket: { version: 1, torn: true, void: true }, leftAt: t('2026-12-11T15:00'), members: [mem('花卷', 'host'), mem('阿禾', 'confirmed', { you: true }), mem('Momo', 'confirmed')], records: [{ kind: 'exit', text: '主动退出 · 已告知局主', at: t('2026-12-11T15:00') }] }),
      joinItem('picnic', 'declined', { ticket: { version: 1, torn: true, void: true }, reschedule: { oldIso: '2026-11-28T12:00', newIso: '2026-11-29T12:00' }, leftAt: t('2026-11-27T19:00'), members: [mem('蛋挞', 'host'), mem('阿禾', 'confirmed', { you: true })] }),
      joinItem('hike', 'expired', { deadline: t('2026-12-04T09:00'), members: [mem('Leon', 'host'), mem('阿禾', 'invited', { you: true })] }),
      joinItem('bookclub', 'released', { leftAt: t('2026-12-03T22:00'), members: [mem('小面', 'host'), mem('阿禾', 'invited', { you: true })] }),
      joinItem('hike', 'ended', { eventId: 'hike2', ticket: { version: 1, torn: true }, contactAdded: true, attendance: 'absent', endedAt: t('2026-12-06T17:00'), members: [mem('Leon', 'host'), mem('阿禾', 'confirmed', { you: true }), mem('Nina', 'confirmed')], records: [{ kind: 'attendance', text: '局主记录：未出席 · 待核实', at: t('2026-12-06T21:00') }, { kind: 'note', text: '你补充：当天高烧，已私信局主', at: t('2026-12-07T08:00') }] }),
      joinItem('bookclub', 'ended', { eventId: 'bookclub2', ticket: { version: 1, torn: true }, contactAdded: true, attendance: null, endedAt: t('2026-12-05T21:30'), members: [mem('小面', 'host'), mem('阿禾', 'confirmed', { you: true }), mem('Ivy', 'confirmed')] })
    ];
  }
  /* ------------------------------------------------------------------ host items ------------------------------------------------------------------ */
  function hmem(nick, status, extra) { return Object.assign({ id: id('h'), nick: nick, status: status, wx: '', torn: false, contactAdded: false, attendance: null, trail: [], reschedule: null }, extra || {}); }
  function app(i, status) { return Object.assign({}, APPLICANTS[i], { status: status || 'pending' }); }
  function hostItem(eventId, extra) { return Object.assign({ eventId: eventId, applications: [], members: [hmem('你', 'confirmed', { host: true, slot: 0 })], queue: [], leaves: [], handled: [] }, extra || {}); }
  function hostedDefault() {
    return [
      hostItem('bar', { applications: [app(0, 'approved'), app(1, 'approved'), app(2), app(3)], members: [hmem('你', 'confirmed', { host: true, slot: 0 }), hmem('小满', 'confirmed', { slot: 1, wx: 'xm_01' }), hmem('Kiki', 'invited', { slot: 2, wx: 'kiki1210', deadline: NOW + 2 * H + 14 * M })] }),
      hostItem('museum', { members: [hmem('你', 'confirmed', { host: true, slot: 0 }), hmem('小满', 'confirmed', { slot: 1, wx: 'xm_01', torn: true, contactAdded: true, attendance: 'present', trail: [{ v: 'present', at: NOW - 19 * H }] }), hmem('阿蒋', 'confirmed', { slot: 2, wx: 'jiang_sva', torn: true, contactAdded: true }), hmem('Momo', 'confirmed', { slot: 3, wx: 'momo-cold', torn: true, contactAdded: false })] }),
      hostItem('bbq', { members: [hmem('你', 'confirmed', { host: true, slot: 0 }), hmem('小满', 'confirmed', { slot: 1, wx: 'xm_01', torn: true, contactAdded: true, reschedule: 'accepted' }), hmem('Momo', 'confirmed', { slot: 2, wx: 'momo-cold', torn: true, reschedule: 'ask' }), hmem('阿蒋', 'declined', { slot: 3, wx: 'jiang_sva', reschedule: 'declined' })], leaves: [{ nick: '阿蒋', kind: 'declined', at: NOW - 4 * H }] }),
      hostItem('wine', { applications: [app(4, 'approved'), app(5, 'approved'), app(6, 'approved'), app(7, 'approved')], members: [hmem('你', 'confirmed', { host: true, slot: 0 }), hmem('Leon', 'confirmed', { slot: 1, wx: 'leon_hp', torn: true, contactAdded: true }), hmem('Ivy', 'confirmed', { slot: 2, wx: 'ivy_pm', torn: false }), hmem('西西', 'confirmed', { slot: 3, wx: 'xixi_nyc', torn: true }), hmem('阿宽', 'confirmed', { slot: 4, wx: 'akuan_88', torn: true, contactAdded: true })] }),
      hostItem('cards', { members: [hmem('你', 'confirmed', { host: true, slot: 0 }), hmem('Ivy', 'confirmed', { slot: 1, wx: 'ivy_pm' }), hmem('Leon', 'invited', { slot: 2, wx: 'leon_hp', deadline: NOW + 5 * H + 2 * M })], queue: [{ nick: '西西', joinedAt: NOW - 9 * H }, { nick: '小满', joinedAt: NOW - 3 * H }], leaves: [{ nick: 'Momo', kind: 'expired', at: NOW - 8 * H }] })
    ];
  }
  function hostedExtraHistory() {
    return [
      hostItem('hostwine2', { members: [hmem('你', 'confirmed', { host: true, slot: 0 }), hmem('Leon', 'confirmed', { slot: 1, attendance: 'present', trail: [{ v: 'present', at: t('2026-12-05T10:00') }] }), hmem('Ivy', 'confirmed', { slot: 2, attendance: 'present', trail: [{ v: 'present', at: t('2026-12-05T10:00') }] }), hmem('西西', 'confirmed', { slot: 3, attendance: 'present', trail: [{ v: 'present', at: t('2026-12-05T10:01') }] }), hmem('阿宽', 'confirmed', { slot: 4, attendance: 'present', trail: [{ v: 'present', at: t('2026-12-05T10:01') }] })] }),
      hostItem('hostcards2', { members: [hmem('你', 'confirmed', { host: true, slot: 0 }), hmem('小满', 'confirmed', { slot: 1, attendance: 'present', trail: [{ v: 'present', at: t('2026-11-21T09:00') }] }), hmem('Kiki', 'confirmed', { slot: 2, attendance: 'present', trail: [{ v: 'present', at: t('2026-11-21T09:00') }] }), hmem('阿蒋', 'confirmed', { slot: 3, attendance: 'absent', trail: [{ v: 'pending', at: t('2026-11-21T09:00') }, { v: 'absent', at: t('2026-11-22T09:00') }] }), hmem('Momo', 'confirmed', { slot: 4, attendance: 'present', trail: [{ v: 'present', at: t('2026-11-21T09:01') }] }), hmem('Leon', 'confirmed', { slot: 5, attendance: 'present', trail: [{ v: 'present', at: t('2026-11-21T09:01') }] })] }),
      hostItem('hostpicnic', { members: [hmem('你', 'confirmed', { host: true, slot: 0 }), hmem('花卷', 'confirmed', { slot: 1 }), hmem('Nina', 'confirmed', { slot: 2 }), hmem('蛋挞', 'invited', { slot: 3 })], queue: [{ nick: 'Leon', joinedAt: t('2026-11-13T10:00') }], cancelAffected: { confirmed: 2, reserved: 1, queue: 1, pending: 0 } })
    ];
  }
  function draftsDefault() { return [{ id: 'draft-reading', title: '雨天读书局', en: 'RAINY READ', pack: 'invite', iso: null, loc: 'Brooklyn-公园坡', capacity: 4, joinMode: 'application', missing: ['日期', '时间'], updatedAt: NOW - 3 * 24 * H, source: null }]; }
  function draftsMore() { return [{ id: 'draft-hotpot', title: '冬至火锅 · 各带一样菜', en: 'HOT POT', pack: 'mono', iso: '2026-12-21T18:30', loc: 'Queens-法拉盛', capacity: 6, joinMode: 'application', missing: [], updatedAt: NOW - 2 * H, source: null }, { id: 'draft-untitled', title: '', en: '', pack: 'grain', iso: null, loc: '', capacity: 4, joinMode: 'direct', missing: ['局名', '日期', '时间', '地点'], updatedAt: NOW - 40 * M, source: { title: '自然酒小试 · 四款' } }]; }

  /* ------------------------------------------------------------------ datasets ------------------------------------------------------------------ */
  function build(variant) {
    uid = 0;
    var d = { variant: variant, you: clone(YOU), events: clone(EVENTS), joined: [], hosted: [], drafts: [], flags: { failNext: false } };
    if (variant === 'empty') return d;
    if (variant === 'drafts') { d.drafts = draftsDefault().concat(draftsMore()); return d; }
    if (variant === 'single') { d.joined = joinedDefault().slice(0, 1); d.hosted = hostedDefault().slice(0, 1); return d; }
    d.joined = joinedDefault(); d.hosted = hostedDefault(); d.drafts = draftsDefault();
    if (variant === 'many') { d.joined = d.joined.concat(joinedExtraCurrent()); d.hosted.push(hostItem('bbq', { eventId: 'bbq2' })); d.events.bbq2 = Object.assign(clone(EVENTS.bbq), { id: 'bbq2', title: '阳台烧烤 · 第二场', iso: '2026-12-28T16:00', version: 1, proposal: null, establishedAt: null }); d.hosted[d.hosted.length - 1].members = [hmem('你', 'confirmed', { host: true, slot: 0 }), hmem('Ivy', 'confirmed', { slot: 1 })]; d.events.climb2 = Object.assign(clone(EVENTS.climb), { id: 'climb2', title: '新手攀岩 · 周五场', iso: '2026-12-26T19:00' }); d.joined.push(joinItem('climb2', 'going', { ticket: { version: 1, torn: true }, contactAdded: true, members: [mem('Leon', 'host'), mem('阿禾', 'confirmed', { you: true }), mem('小面', 'confirmed'), mem('Momo', 'confirmed')] })); }
    if (variant === 'pending') { var b = d.hosted[0]; b.applications = [app(0, 'approved'), app(1, 'approved'), app(2), app(3), app(4), app(5), app(6), app(7)]; d.hosted[4].applications = [app(2), app(3), app(4)]; d.hosted[4].members = [hmem('你', 'confirmed', { host: true, slot: 0 })]; d.events.cards.joinMode = 'application'; }
    if (variant === 'history') { d.joined = d.joined.concat(joinedExtraHistory()); d.events.hike2 = Object.assign(clone(EVENTS.hike), { id: 'hike2', title: '熊山徒步 · 第二次', iso: '2026-11-22T07:30', endedAt: t('2026-11-22T17:00') }); d.events.bookclub2 = Object.assign(clone(EVENTS.bookclub), { id: 'bookclub2', title: '读书会 · 《秋园》', iso: '2026-11-14T19:00', endedAt: t('2026-11-14T21:30') }); d.hosted = d.hosted.concat(hostedExtraHistory()); }
    if (variant === 'long') { Object.keys(LONG).forEach(function (k) { Object.assign(d.events[k], LONG[k]); }); }
    return d;
  }
  JU.data = function (variant) { return build(variant || 'default'); };
  JU.baseState = function (variant) { return { variant: variant || 'default', role: 'joined', section: 'current', data: JU.data(variant), view: { name: 'list' } }; };

  /* ------------------------------------------------------------------ derivations ------------------------------------------------------------------ */
  var STAGE = {
    pending: { label: '待审核', group: 'wait', tone: 'wait', object: 'card', need: '等局主审核 · 不占名额', cta: '' , detailTitle: '等待审核' },
    invited: { label: '已预留', group: 'act', tone: 'act', object: 'card', need: '预留到期前阅读约定并确认', cta: '阅读并确认', detailTitle: '已预留 · 等你确认' },
    invited_queue: { label: '候补轮到 · 已预留', group: 'act', tone: 'act', object: 'card', need: '轮到你了 · 到期前阅读约定并确认', cta: '阅读并确认', detailTitle: '候补轮到你了' },
    waitlist: { label: '候补第 N 位', group: 'wait', tone: 'wait', object: 'card', need: '轮到你时才开始 6 小时预留', cta: '', detailTitle: '候补中' },
    gathering: { label: '待全员确认', group: 'wait', tone: 'wait', object: 'card', need: '包括局主全员确认后才出票', cta: '', detailTitle: '等待全员确认' },
    tear: { label: '待撕票', group: 'act', tone: 'act', object: 'ticket', need: '撕开副券后可以联系局主', cta: '撕开票根', detailTitle: '撕开，联系局主' },
    contact: { label: '待联系', group: 'act', tone: 'act', object: 'ticket', need: '撕票后 8 小时内联系局主', cta: '联系局主', detailTitle: '联系局主' },
    going: { label: '待赴约', group: 'soon', tone: 'go', object: 'ticket', need: '已记录加微信 · 按最终时间赴约', cta: '查看票根', detailTitle: '待赴约' },
    reschedule: { label: '待确认新时间', group: 'act', tone: 'act', object: 'ticket', need: '局主改了时间，答复前旧票不能用', cta: '答复新时间', detailTitle: '局主改了时间' },
    ended: { label: '已散场', group: 'kept', tone: 'kept', object: 'stamp', need: '', cta: '', detailTitle: '散场' },
    cancelled: { label: '已取消', group: 'closed', tone: 'void', object: 'spine', need: '局主取消 · 票根作废，不计你的退出', cta: '', detailTitle: '局主取消了' },
    rejected: { label: '这次没留住', group: 'closed', tone: 'void', object: 'spine', need: '这次没留住 · 不影响信用', cta: '', detailTitle: '这次没留住' },
    withdrawn: { label: '已撤回', group: 'closed', tone: 'void', object: 'spine', need: '申请已撤回', cta: '', detailTitle: '已撤回申请' },
    exited: { label: '已退出', group: 'closed', tone: 'void', object: 'spine', need: '主动退出 · 票根与联系已关闭', cta: '', detailTitle: '已退出这局' },
    declined: { label: '已退出', group: 'closed', tone: 'void', object: 'spine', need: '拒绝改期 · 席位已释放', cta: '', detailTitle: '未接受新时间' },
    expired: { label: '预留已到期', group: 'closed', tone: 'void', object: 'spine', need: '预留到期未确认 · 位置已补给他人', cta: '', detailTitle: '预留已到期' },
    released: { label: '预留已释放', group: 'closed', tone: 'void', object: 'spine', need: '放弃预留 · 不记主动失约', cta: '', detailTitle: '已放弃预留' },
    queue_left: { label: '已退出候补', group: 'closed', tone: 'void', object: 'spine', need: '退出候补 · 不记缺席', cta: '', detailTitle: '已退出候补' }
  };
  JU.STAGE = STAGE;
  var GROUPS = { act: { title: '要你回应', note: '按截止先后' }, soon: { title: '就快见面', note: '已成局 · 按日期' }, wait: { title: '还在等', note: '等局主或其他成员' }, kept: { title: '散场', note: '带出席记录 · 新的在前' }, closed: { title: '未成行', note: '不计出席' } };
  JU.GROUPS = GROUPS;
  function counts(members, capacity) { var c = { capacity: capacity, confirmed: 0, reserved: 0, available: 0, queue: 0 }; members.forEach(function (m) { if (m.status === 'confirmed' || m.status === 'host') c.confirmed++; else if (m.status === 'invited') c.reserved++; }); c.available = Math.max(0, capacity - c.confirmed - c.reserved); return c; }
  function seats(members, capacity) { var s = []; members.forEach(function (m) { if (m.status === 'host' || (m.host && m.status === 'confirmed')) s.push({ kind: 'host', name: m.name || m.nick }); else if (m.status === 'confirmed') s.push({ kind: 'ok', name: m.name || m.nick, you: !!m.you, torn: !!m.torn, contactAdded: !!m.contactAdded, attendance: m.attendance || null }); else if (m.status === 'invited') s.push({ kind: 'res', name: m.name || m.nick, you: !!m.you, deadline: m.deadline || null }); }); while (s.length < capacity) s.push({ kind: 'open' }); return s.slice(0, capacity); }
  JU.derive = {
    joined: function (data) {
      var groups = { act: [], soon: [], wait: [], kept: [], closed: [] };
      data.joined.forEach(function (it, idx) {
        var e = data.events[it.eventId]; var st = STAGE[it.stage]; var c = counts(it.members, e.capacity);
        var when = fmt.when(it.stage === 'reschedule' && it.reschedule ? it.reschedule.newIso : e.iso); var place = fmt.place(e.loc);
        var row = { id: it.eventId, idx: idx, item: it, event: e, stage: it.stage, label: st.label, group: st.group, groupTitle: GROUPS[st.group].title, tone: st.tone, object: st.object, need: st.need, cta: st.cta, detailTitle: st.detailTitle, when: when, place: place, counts: c, seats: seats(it.members, e.capacity), host: e.host, ticket: it.ticket, contactAdded: it.contactAdded, attendance: it.attendance, records: it.records || [], queuePos: it.queuePos, deadline: it.deadline, left: it.deadline ? Math.max(0, it.deadline - NOW) : null, leftText: it.deadline ? fmt.left(Math.max(0, it.deadline - NOW)) : '', leftRatio: it.deadline ? Math.max(0, Math.min(1, (it.deadline - NOW) / (6 * H))) : 0, sortTime: t(e.iso), endedAt: e.endedAt || it.endedAt || 0 };
        if (it.stage === 'waitlist') row.label = '候补第 ' + it.queuePos + ' 位';
        if (it.stage === 'gathering') row.label = '待全员确认 · ' + c.confirmed + '/' + e.capacity;
        if (it.stage === 'going') { var same = fmt.when(e.iso).md === fmt.when('2026-12-17T00:00').md; row.need = same ? '今天 ' + when.time + ' 见' : '已记录加微信 · 按最终时间赴约'; }
        if (it.stage === 'reschedule') { row.oldWhen = fmt.when(it.reschedule.oldIso); row.newWhen = fmt.when(it.reschedule.newIso); }
        if (it.stage === 'ended') { row.attendanceText = it.attendance === 'present' ? '记录为出席' : it.attendance === 'absent' ? '记录为未出席 · 待核实' : it.attendance === 'pending' ? '记录为待定' : '局主还没记录出席'; }
        if (it.stage === 'cancelled') row.when = fmt.when(e.iso);
        groups[st.group].push(row);
      });
      groups.act.sort(function (a, b) { return (a.deadline || 9e15) - (b.deadline || 9e15) || a.sortTime - b.sortTime; });
      groups.soon.sort(function (a, b) { return a.sortTime - b.sortTime; }); groups.wait.sort(function (a, b) { return a.sortTime - b.sortTime; });
      groups.kept.sort(function (a, b) { return b.endedAt - a.endedAt; }); groups.closed.sort(function (a, b) { return b.sortTime - a.sortTime; });
      var current = groups.act.concat(groups.soon, groups.wait); var history = groups.kept.concat(groups.closed);
      return { groups: groups, current: current, history: history, lead: groups.act[0] || groups.soon[0] || null, badge: groups.act.length, counts: { current: current.length, history: history.length }, empty: current.length === 0, emptyKind: current.length ? '' : (history.length ? 'rested' : 'first'), sectionsCurrent: ['act', 'soon', 'wait'].filter(function (k) { return groups[k].length; }).map(function (k) { return { key: k, title: GROUPS[k].title, note: GROUPS[k].note, rows: groups[k] }; }), sectionsHistory: ['kept', 'closed'].filter(function (k) { return groups[k].length; }).map(function (k) { return { key: k, title: GROUPS[k].title, note: GROUPS[k].note, rows: groups[k] }; }) };
    },
    hostRow: function (data, it) {
      var e = data.events[it.eventId]; var members = it.members; var c = counts(members, e.capacity); c.queue = it.queue.length;
      var pending = it.applications.filter(function (a) { return a.status === 'pending'; }).length;
      var nonHost = members.filter(function (m) { return !m.host && m.status === 'confirmed'; });
      var unanswered = e.proposal && e.status === 'open' ? members.filter(function (m) { return m.status === 'confirmed' && m.reschedule === 'ask'; }).length : 0;
      var formed = e.status !== 'cancelled' && (!!e.establishedAt || c.confirmed >= e.capacity);
      var unrecorded = e.status === 'ended' ? nonHost.filter(function (m) { return !m.attendance; }).length : 0;
      var present = nonHost.filter(function (m) { return m.attendance === 'present'; }).length;
      var key = e.status === 'cancelled' ? 'cancelled' : e.status === 'ended' ? 'ended' : pending ? 'review' : unanswered ? 'reschedule' : formed ? 'formed' : 'recruit';
      var todo = pending > 0 || (e.status === 'ended' && unrecorded > 0);
      var life = e.status === 'cancelled' ? '已取消' : e.status === 'ended' ? '已散场' : unanswered ? '改期中' : formed ? '已成局' : '招募中';
      var label = e.status === 'cancelled' ? '票根作废 · 联系已关闭' : e.status === 'ended' ? (unrecorded ? unrecorded + ' 人出席待记录' : (nonHost.length ? present + '/' + nonHost.length + ' 人到场' : '已散场')) : pending ? pending + ' 份申请待审' : unanswered ? unanswered + ' 人未答复新时间' : formed ? '全员确认 · 已出票' : c.reserved ? c.reserved + ' 人已预留 · 等确认' : '还有 ' + c.available + ' 个空位';
      var status = e.status === 'cancelled' ? '已取消' : e.status === 'ended' ? (unrecorded ? unrecorded + ' 人出席未记录' : '已散场') : pending ? pending + ' 份申请待审' : unanswered ? unanswered + ' 人未答复新时间' : formed ? '已成局' : c.reserved ? c.reserved + ' 人已预留 · 等确认' : '招募中';
      var contactOpen = formed && e.status !== 'cancelled' && (e.status !== 'ended' || NOW < e.endedAt + 24 * H);
      var formedLine = e.status === 'cancelled' ? '已取消 · 不能撤销，票根作废、联系关闭' : e.status === 'ended' ? (contactOpen ? '已散场 · 24 小时内仍可查看成员微信' : '已散场 · 联系方式已关闭') : formed ? '已成局 · 成员微信仅你可见' : '全员（含你）确认后成局出票';
      var cta = pending ? '审核申请' : (e.status === 'ended' && unrecorded) ? '记录出席' : '';
      var section = e.status === 'cancelled' ? 'cancelled' : todo ? 'todo' : e.status === 'ended' ? 'ended' : unanswered ? 'resched' : formed ? 'formed' : 'recruit';
      return { id: it.eventId, item: it, event: e, key: key, todo: todo, life: life, label: label, status: status, cta: cta, section: section, pending: pending, unanswered: unanswered, unrecorded: unrecorded, present: present, nonHost: nonHost.length, asked: nonHost.filter(function (m) { return m.reschedule; }).length + members.filter(function (m) { return m.status === 'declined' && m.reschedule === 'declined'; }).length, answered: members.filter(function (m) { return m.reschedule === 'accepted' || m.reschedule === 'declined'; }).length, formed: formed, contactOpen: contactOpen, formedLine: formedLine, counts: c, seats: seats(members, e.capacity), seatText: '已确认 ' + c.confirmed + '/' + e.capacity, seatMore: fmt.seatLine(c), when: fmt.when(e.iso), oldWhen: e.proposal ? fmt.when(e.proposal.oldIso) : null, place: fmt.place(e.loc), sortTime: t(e.iso), endedAt: e.endedAt || 0, canReschedule: e.status === 'open' && !unanswered, canEnd: e.status === 'open' && formed && !unanswered, canCancel: e.status === 'open', notFormedHint: e.status === 'open' && !formed, cancelAffected: { confirmed: nonHost.length, reserved: c.reserved, queue: it.queue.length, pending: pending }, recorded: nonHost.length - unrecorded, absent: nonHost.filter(function (m) { return m.attendance === 'absent'; }).length, undecided: nonHost.filter(function (m) { return m.attendance === 'pending'; }).length };
    },
    hosted: function (data) {
      var rows = data.hosted.map(function (it) { return JU.derive.hostRow(data, it); });
      var sections = { todo: [], resched: [], recruit: [], formed: [], ended: [], cancelled: [] };
      rows.forEach(function (r) { sections[r.section].push(r); if (r.section === 'todo' && r.event.status === 'ended') sections.ended.push(r); });
      sections.todo.sort(function (a, b) { return (b.pending ? 1 : 0) - (a.pending ? 1 : 0) || a.sortTime - b.sortTime; });
      ['resched', 'recruit', 'formed'].forEach(function (k) { sections[k].sort(function (a, b) { return a.sortTime - b.sortTime; }); });
      sections.ended.sort(function (a, b) { return b.endedAt - a.endedAt; }); sections.cancelled.sort(function (a, b) { return b.sortTime - a.sortTime; });
      var current = sections.todo.concat(sections.resched, sections.recruit, sections.formed);
      var drafts = data.drafts.slice().sort(function (a, b) { return b.updatedAt - a.updatedAt; }).map(function (d) { return { id: d.id, draft: d, title: d.title || '未命名的局', untitled: !d.title, when: d.iso ? fmt.when(d.iso) : null, whenText: d.iso ? fmt.when(d.iso).zh : '日期未定', place: d.loc ? fmt.place(d.loc) : null, placeText: d.loc ? fmt.place(d.loc).hood : '地点未定', ready: d.missing.length === 0, missingText: d.missing.length ? '还差 ' + d.missing.join('、') : '信息齐了，可以发布', agoText: '改于 ' + fmt.ago(d.updatedAt), source: d.source, seats: d.capacity - 1, capacity: d.capacity, pack: d.pack, deleting: !!d.deleting }; });
      var history = sections.ended.concat(sections.cancelled);
      return { rows: rows, sections: sections, current: current, history: history, drafts: drafts, lead: sections.todo[0] || null, badge: sections.todo.length, counts: { current: current.length, drafts: drafts.length, history: history.length }, empty: current.length === 0, emptyKind: current.length ? '' : (drafts.length ? 'drafts' : 'first'), sectionsCurrent: [['todo', '待你处理', '审核与出席'], ['resched', '改期中', '等成员逐人答复'], ['recruit', '招募中', '还没成局'], ['formed', '已成局', '按日期']].filter(function (s) { return sections[s[0]].length; }).map(function (s) { return { key: s[0], title: s[1], note: s[2], rows: sections[s[0]] }; }), sectionsHistory: [['ended', '已散场', '可以从这里再开一局'], ['cancelled', '已取消', '票根作废 · 联系已关闭']].filter(function (s) { return sections[s[0]].length; }).map(function (s) { return { key: s[0], title: s[1], note: s[2], rows: sections[s[0]] }; }) };
    },
    /* host management model for one event */
    manage: function (data, eventId) {
      var it = data.hosted.filter(function (x) { return x.eventId === eventId; })[0]; if (!it) return null;
      var r = JU.derive.hostRow(data, it); var e = r.event;
      var apps = it.applications.map(function (a) { return Object.assign({}, a, { verifiedLabel: a.verified ? (a.mail.split('@')[1] || '') + ' 邮箱已验证' : '未验证邮箱', agoText: '申请于 ' + fmt.ago(a.appliedAt), handled: a.status !== 'pending', resultText: a.status === 'approved' ? '已发出邀请 · 等对方确认' : a.status === 'rejected' ? '已谢绝 · 对方会看到「这次没留住」' : a.status === 'cancelled' ? '活动已取消' : '' }); });
      var roster = it.members.slice().sort(function (a, b) { return (a.slot || 0) - (b.slot || 0); }).map(function (m) {
        var stateText = m.host ? '局主 · 你' : e.status === 'cancelled' ? (m.status === 'confirmed' ? '取消前已确认' : m.status === 'invited' ? '取消前已预留' : '') : m.status === 'invited' ? '已预留' : m.status === 'confirmed' ? (m.reschedule === 'ask' ? '未答复新时间' : m.reschedule === 'accepted' ? '已接受新时间' : '已确认') : m.status === 'declined' ? '拒绝改期 · 已退出' : m.status === 'expired' ? '预留到期' : m.status === 'exited' ? '主动退出' : m.status;
        var ticketText = m.host ? '' : m.status !== 'confirmed' ? '' : e.status === 'cancelled' ? '票根作废' : r.formed ? (m.torn ? '已撕票' : '票根未撕') : '等成局出票';
        var tone = m.host ? 'host' : e.status === 'cancelled' ? 'void' : m.status === 'invited' ? 'res' : m.status === 'confirmed' ? (m.reschedule === 'ask' ? 'wait' : 'ok') : 'void';
        return Object.assign({}, m, { stateText: stateText, ticketText: ticketText, tone: tone, leftText: m.deadline ? '剩 ' + fmt.left(Math.max(0, m.deadline - NOW)) : '', leftRatio: m.deadline ? Math.max(0, Math.min(1, (m.deadline - NOW) / (6 * H))) : 0, showWx: !m.host && m.status === 'confirmed' && r.contactOpen && !!m.wx, attLabel: m.attendance === 'present' ? '出席' : m.attendance === 'absent' ? '未出席 · 待核实' : m.attendance === 'pending' ? '待定' : '未记录', attTrail: (m.trail || []).slice().reverse().map(function (x, i, arr) { var name = function (v) { return v === 'present' ? '出席' : v === 'absent' ? '未出席' : '待定'; }; var prev = arr[i + 1]; return prev ? '更正 ' + name(prev.v) + ' → ' + name(x.v) + ' · ' + fmt.abs(x.at) : '记录 ' + name(x.v) + ' · ' + fmt.abs(x.at); }), inRoster: m.status === 'confirmed' || m.status === 'invited' || m.host });
      });
      var attendees = roster.filter(function (m) { return !m.host && m.status === 'confirmed'; });
      return Object.assign(r, { apps: apps, pendingApps: apps.filter(function (a) { return !a.handled; }), handledCount: apps.filter(function (a) { return a.handled && (it.handled || []).indexOf(a.id) >= 0; }).length, roster: roster.filter(function (m) { return m.inRoster; }), attendees: attendees, queue: it.queue.map(function (q, i) { return Object.assign({}, q, { no: '№' + (i + 1), agoText: '加入于 ' + fmt.ago(q.joinedAt) }); }), leaves: it.leaves.slice().reverse().slice(0, 6).map(function (l) { return Object.assign({}, l, { text: { expired: '预留到期', released: '放弃预留', declined: '拒绝改期', exited: '主动退出', withdrawn: '已撤回', rejected: '未通过' }[l.kind] || l.kind }); }), reschedRoster: roster.filter(function (m) { return !m.host && (m.reschedule || m.status === 'declined'); }).map(function (m) { return Object.assign({}, m, { answerText: m.reschedule === 'ask' ? '还没答复' : m.reschedule === 'accepted' ? '接受 · 换新版票' : '拒绝 · 已退出' }); }), openSeats: r.counts.available, meeting: fmt.when(e.iso).meeting, rescheduleDesc: attendees.length ? attendees.length + ' 位已确认的成员要各自答复：接受换新版票，拒绝释放席位且不计主动退出。答复前旧票不能使用。' : r.counts.reserved ? '现在没有要答复的已确认成员；已预留的人确认时看到的就是新时间。' : '还没有已确认的成员，新时间直接生效。' });
    },
    event: function (data, eventId) { var e = data.events[eventId]; return { event: e, when: fmt.when(e.iso), place: fmt.place(e.loc), joined: data.joined.filter(function (x) { return x.eventId === eventId; })[0] || null, hosted: data.hosted.filter(function (x) { return x.eventId === eventId; })[0] || null }; }
  };

  /* ------------------------------------------------------------------ engine ------------------------------------------------------------------ */
  function fail(data, message) { return { data: data, effect: { type: 'error', message: message } }; }
  function withData(data, fn) { var d = clone(data); if (d.flags.failNext) { d.flags.failNext = false; return fail(d, '本机保存失败，请重试'); } var eff = fn(d) || {}; return { data: d, effect: eff }; }
  function jitem(d, id) { return d.joined.filter(function (x) { return x.eventId === id; })[0]; }
  function hitem(d, id) { return d.hosted.filter(function (x) { return x.eventId === id; })[0]; }
  function you(it) { return it.members.filter(function (m) { return m.you; })[0]; }
  JU.engine = {
    /* ---------------- participant ---------------- */
    confirmReservation: function (data, p) { return withData(data, function (d) { var it = jitem(d, p.eventId); var e = d.events[p.eventId]; var me = you(it); me.status = 'confirmed'; delete me.deadline; it.deadline = null; var c = counts(it.members, e.capacity); var formed = c.confirmed >= e.capacity; if (formed) { e.establishedAt = NOW; it.stage = 'tear'; it.ticket = { version: e.version, torn: false }; } else it.stage = 'gathering'; return { type: 'confirmed', formed: formed, eventId: p.eventId }; }); },
    releaseReservation: function (data, p) { return withData(data, function (d) { var it = jitem(d, p.eventId); var me = you(it); me.status = 'released'; it.stage = 'released'; it.leftAt = NOW; it.deadline = null; return { type: 'released', eventId: p.eventId }; }); },
    leaveWaitlist: function (data, p) { return withData(data, function (d) { var it = jitem(d, p.eventId); it.stage = 'queue_left'; it.leftAt = NOW; it.queue = it.queue.filter(function (q) { return !q.you; }); it.queuePos = 0; return { type: 'queue_left', eventId: p.eventId }; }); },
    withdrawApplication: function (data, p) { return withData(data, function (d) { var it = jitem(d, p.eventId); it.stage = 'withdrawn'; it.leftAt = NOW; return { type: 'withdrawn', eventId: p.eventId }; }); },
    tearTicket: function (data, p) { return withData(data, function (d) { var it = jitem(d, p.eventId); it.ticket.torn = true; it.ticket.tornAt = NOW; it.stage = 'contact'; return { type: 'torn', eventId: p.eventId }; }); },
    markContacted: function (data, p) { return withData(data, function (d) { var it = jitem(d, p.eventId); it.contactAdded = true; it.stage = 'going'; return { type: 'contacted', eventId: p.eventId }; }); },
    acceptReschedule: function (data, p) { return withData(data, function (d) { var it = jitem(d, p.eventId); var e = d.events[p.eventId]; e.iso = it.reschedule.newIso; it.ticket = { version: e.version, torn: true, tornAt: NOW }; it.acceptedAt = NOW; it.stage = it.contactAdded ? 'going' : 'contact'; it.reschedule.answered = 'accepted'; return { type: 'reschedule-accepted', eventId: p.eventId, stage: it.stage }; }); },
    declineReschedule: function (data, p) { return withData(data, function (d) { var it = jitem(d, p.eventId); it.stage = 'declined'; it.leftAt = NOW; it.contactAdded = false; if (it.ticket) it.ticket.void = true; it.reschedule.answered = 'declined'; return { type: 'reschedule-declined', eventId: p.eventId, burn: true }; }); },
    exitEvent: function (data, p) { return withData(data, function (d) { var it = jitem(d, p.eventId); it.stage = 'exited'; it.leftAt = NOW; it.contactAdded = false; if (it.ticket) it.ticket.void = true; var me = you(it); if (me) me.status = 'exited'; it.records = (it.records || []).concat([{ kind: 'exit', text: '主动退出 · 已告知局主', at: NOW }]); return { type: 'exited', eventId: p.eventId, burn: !!it.ticket }; }); },
    addRecord: function (data, p) { return withData(data, function (d) { var it = jitem(d, p.eventId); it.records = (it.records || []).concat([{ kind: p.kind || 'note', text: p.text, at: NOW }]); return { type: 'record-added', eventId: p.eventId }; }); },
    /* ---------------- host ---------------- */
    approve: function (data, p) { return withData(data, function (d) { var it = hitem(d, p.eventId); var e = d.events[p.eventId]; var a = it.applications.filter(function (x) { return x.id === p.appId; })[0]; if (!a || a.status !== 'pending') return { type: 'error', message: '这份申请已经处理过。' }; var c = counts(it.members, e.capacity); if (c.available <= 0) return { type: 'error', message: '名额已满，暂时不能再发邀请。' }; if (it.queue.length) return { type: 'error', message: '候补里有人排在前面，按顺位先邀请。' }; a.status = 'approved'; a.decidedAt = NOW; var used = it.members.map(function (m) { return m.slot; }); var slot = 1; while (used.indexOf(slot) >= 0) slot++; it.members.push(hmem(a.nick, 'invited', { slot: slot, wx: a.wx, deadline: NOW + 6 * H, invitedAt: NOW })); it.handled = (it.handled || []).concat([a.id]); return { type: 'invited', eventId: p.eventId, appId: a.id, nick: a.nick, slot: slot }; }); },
    reject: function (data, p) { return withData(data, function (d) { var it = hitem(d, p.eventId); var a = it.applications.filter(function (x) { return x.id === p.appId; })[0]; if (!a || a.status !== 'pending') return { type: 'error', message: '这份申请已经处理过。' }; a.status = 'rejected'; a.decidedAt = NOW; it.handled = (it.handled || []).concat([a.id]); return { type: 'rejected', eventId: p.eventId, appId: a.id, nick: a.nick }; }); },
    propose: function (data, p) { return withData(data, function (d) { var it = hitem(d, p.eventId); var e = d.events[p.eventId]; if (!p.newIso) return { type: 'error', message: '选好新的日期和时间。' }; if (p.newIso === e.iso) return { type: 'error', message: '新时间和原时间一样。' }; if (it.members.some(function (m) { return m.status === 'confirmed' && m.reschedule === 'ask'; })) return { type: 'error', message: '上一次改期还有人未答复。' }; e.proposal = { oldIso: e.iso, at: NOW }; e.iso = p.newIso; e.version++; var asked = 0; it.members.forEach(function (m) { if (!m.host && m.status === 'confirmed') { m.reschedule = 'ask'; asked++; } }); return { type: 'proposed', eventId: p.eventId, asked: asked, oldIso: e.proposal.oldIso, newIso: e.iso }; }); },
    cancel: function (data, p) { return withData(data, function (d) { var it = hitem(d, p.eventId); var e = d.events[p.eventId]; var r = JU.derive.hostRow(d, it); e.status = 'cancelled'; e.cancelledAt = NOW; it.applications.forEach(function (a) { if (a.status === 'pending') a.status = 'cancelled'; }); it.members.forEach(function (m) { m.contactAdded = false; }); it.cancelAffected = r.cancelAffected; it.queue = []; return { type: 'cancelled', eventId: p.eventId, affected: r.cancelAffected, burn: true }; }); },
    end: function (data, p) { return withData(data, function (d) { var it = hitem(d, p.eventId); var e = d.events[p.eventId]; var r = JU.derive.hostRow(d, it); if (!r.formed) return { type: 'error', message: '还没成局，不能记为散场；可以取消这场。' }; if (r.unanswered) return { type: 'error', message: '改期还有人未答复，先等答复。' }; e.status = 'ended'; e.endedAt = NOW; return { type: 'ended', eventId: p.eventId, toRecord: r.nonHost }; }); },
    attend: function (data, p) { return withData(data, function (d) { var it = hitem(d, p.eventId); var e = d.events[p.eventId]; if (e.status !== 'ended') return { type: 'error', message: '散场后才能记录出席。' }; var m = it.members.filter(function (x) { return x.id === p.memberId; })[0]; if (!m || m.status !== 'confirmed') return { type: 'error', message: '只为已确认的成员记录出席。' }; if (m.attendance === p.value) return { type: 'noop' }; var correction = !!m.attendance; m.attendance = p.value; m.trail = (m.trail || []).concat([{ v: p.value, at: NOW }]); return { type: 'attended', eventId: p.eventId, memberId: m.id, value: p.value, correction: correction }; }); },
    deleteDraft: function (data, p) { return withData(data, function (d) { var i = d.drafts.findIndex(function (x) { return x.id === p.draftId; }); if (i < 0) return { type: 'error', message: '草稿已不存在。' }; var removed = d.drafts.splice(i, 1)[0]; d.undo = { draft: removed, index: i, at: NOW }; return { type: 'draft-deleted', draftId: p.draftId, title: removed.title || '未命名的局', index: i }; }); },
    undoDelete: function (data, p) { return withData(data, function (d) { if (!d.undo) return { type: 'error', message: '没有恢复成功' }; d.drafts.splice(Math.min(d.undo.index, d.drafts.length), 0, d.undo.draft); var id = d.undo.draft.id; d.undo = null; return { type: 'draft-restored', draftId: id }; }); },
    commitUndo: function (data) { return withData(data, function (d) { d.undo = null; return { type: 'undo-expired' }; }); },
    setFailNext: function (data, p) { var d = clone(data); d.flags.failNext = p.on !== false; return { data: d, effect: { type: 'flag' } }; }
  };

  /* ------------------------------------------------------------------ state index ------------------------------------------------------------------ */
  JU.INDEX = [
    { key: 'j-home', group: '参加者 · 列表', label: '当前（默认）', role: 'joined', section: 'current' },
    { key: 'j-history', group: '参加者 · 列表', label: '历史', role: 'joined', section: 'history' },
    { key: 'j-many', group: '参加者 · 列表', label: '当前较多', role: 'joined', section: 'current', variant: 'many' },
    { key: 'j-history-many', group: '参加者 · 列表', label: '历史较多', role: 'joined', section: 'history', variant: 'history' },
    { key: 'j-d-pending', group: '参加者 · 局内', label: '待审核', role: 'joined', open: { eventId: 'sketch', surface: 'detail' } },
    { key: 'j-d-invited', group: '参加者 · 局内', label: '已预留待确认', role: 'joined', open: { eventId: 'brunch', surface: 'detail' } },
    { key: 'j-d-waitlist', group: '参加者 · 局内', label: '候补等待', role: 'joined', open: { eventId: 'vintage', surface: 'detail' } },
    { key: 'j-d-invitedq', group: '参加者 · 局内', label: '候补轮到', role: 'joined', variant: 'many', open: { eventId: 'climb', surface: 'detail' } },
    { key: 'j-d-gathering', group: '参加者 · 局内', label: '已确认待成局', role: 'joined', open: { eventId: 'dimsum', surface: 'detail' } },
    { key: 'j-d-tear', group: '参加者 · 局内', label: '已出票待撕', role: 'joined', open: { eventId: 'run3k', surface: 'ticket' } },
    { key: 'j-d-contact', group: '参加者 · 局内', label: '已撕票待联系', role: 'joined', open: { eventId: 'coffee', surface: 'contact' } },
    { key: 'j-d-going', group: '参加者 · 局内', label: '已联系待赴约', role: 'joined', open: { eventId: 'theater', surface: 'ticket' } },
    { key: 'j-d-reschedule', group: '参加者 · 局内', label: '改期待答复', role: 'joined', open: { eventId: 'livehouse', surface: 'reschedule-reply' } },
    { key: 'j-d-withdraw', group: '参加者 · 局内', label: '撤回 / 退出确认', role: 'joined', open: { eventId: 'theater', surface: 'withdraw' } },
    { key: 'j-d-ended', group: '参加者 · 局内', label: '已散场 · 历史票根', role: 'joined', section: 'history', open: { eventId: 'jazz', surface: 'history' } },
    { key: 'j-d-cancelled', group: '参加者 · 局内', label: '局主取消', role: 'joined', section: 'history', open: { eventId: 'ramen', surface: 'history' } },
    { key: 'j-d-rejected', group: '参加者 · 局内', label: '审核未通过', role: 'joined', section: 'history', open: { eventId: 'mahjong', surface: 'history' } },
    { key: 'j-d-queueleft', group: '参加者 · 局内', label: '退出候补', role: 'joined', section: 'history', open: { eventId: 'boardgame', surface: 'history' } },
    { key: 'j-d-exited', group: '参加者 · 局内', label: '主动退出', role: 'joined', section: 'history', variant: 'history', open: { eventId: 'karaoke', surface: 'history' } },
    { key: 'j-d-declined', group: '参加者 · 局内', label: '拒绝改期', role: 'joined', section: 'history', variant: 'history', open: { eventId: 'picnic', surface: 'history' } },
    { key: 'j-d-expired', group: '参加者 · 局内', label: '预留到期', role: 'joined', section: 'history', variant: 'history', open: { eventId: 'hike', surface: 'history' } },
    { key: 'j-d-released', group: '参加者 · 局内', label: '放弃预留', role: 'joined', section: 'history', variant: 'history', open: { eventId: 'bookclub', surface: 'history' } },
    { key: 'j-d-withdrawn', group: '参加者 · 局内', label: '撤回申请', role: 'joined', section: 'history', variant: 'history', open: { eventId: 'pottery', surface: 'history' } },
    { key: 'j-d-absent', group: '参加者 · 局内', label: '散场 · 未出席待核实', role: 'joined', section: 'history', variant: 'history', open: { eventId: 'hike2', surface: 'history' } },
    { key: 'h-home', group: '局主 · 列表', label: '当前（默认）', role: 'hosted', section: 'current' },
    { key: 'h-drafts', group: '局主 · 列表', label: '草稿', role: 'hosted', section: 'drafts' },
    { key: 'h-history', group: '局主 · 列表', label: '历史', role: 'hosted', section: 'history' },
    { key: 'h-pending', group: '局主 · 列表', label: '待处理较多', role: 'hosted', section: 'current', variant: 'pending' },
    { key: 'h-history-many', group: '局主 · 列表', label: '历史较多', role: 'hosted', section: 'history', variant: 'history' },
    { key: 'h-drafts-many', group: '局主 · 列表', label: '只有草稿', role: 'hosted', section: 'drafts', variant: 'drafts' },
    { key: 'h-m-review', group: '局主 · 管理', label: '申请审核', role: 'hosted', open: { eventId: 'bar', surface: 'manage', tab: 'applications' } },
    { key: 'h-m-members', group: '局主 · 管理', label: '成员与席位', role: 'hosted', open: { eventId: 'wine', surface: 'manage', tab: 'members' } },
    { key: 'h-m-waitlist', group: '局主 · 管理', label: '候补', role: 'hosted', open: { eventId: 'cards', surface: 'manage', tab: 'waitlist' } },
    { key: 'h-m-contact', group: '局主 · 管理', label: '联系信息', role: 'hosted', open: { eventId: 'wine', surface: 'manage', tab: 'contact' } },
    { key: 'h-m-leaves', group: '局主 · 管理', label: '离开记录', role: 'hosted', open: { eventId: 'cards', surface: 'manage', tab: 'leaves' } },
    { key: 'h-m-reschedule', group: '局主 · 管理', label: '改时间', role: 'hosted', open: { eventId: 'wine', surface: 'manage', tab: 'reschedule' } },
    { key: 'h-m-replies', group: '局主 · 管理', label: '改期答复', role: 'hosted', open: { eventId: 'bbq', surface: 'manage', tab: 'replies' } },
    { key: 'h-m-cancel', group: '局主 · 管理', label: '取消这局', role: 'hosted', open: { eventId: 'cards', surface: 'manage', tab: 'cancel' } },
    { key: 'h-m-end', group: '局主 · 管理', label: '记为散场', role: 'hosted', open: { eventId: 'wine', surface: 'manage', tab: 'end' } },
    { key: 'h-m-attendance', group: '局主 · 管理', label: '出席记录', role: 'hosted', open: { eventId: 'museum', surface: 'manage', tab: 'attendance' } },
    { key: 'h-m-card', group: '局主 · 管理', label: '完整局卡', role: 'hosted', open: { eventId: 'bar', surface: 'manage', tab: 'card' } },
    { key: 'h-m-cancelled', group: '局主 · 管理', label: '已取消的局', role: 'hosted', section: 'history', variant: 'history', open: { eventId: 'hostpicnic', surface: 'manage', tab: 'members' } },
    { key: 'h-draft', group: '局主 · 管理', label: '草稿摘要', role: 'hosted', section: 'drafts', open: { eventId: 'draft-reading', surface: 'draft' } },
    { key: 'b-empty', group: '边界', label: '完全空', role: 'joined', section: 'current', variant: 'empty' },
    { key: 'b-empty-h', group: '边界', label: '完全空 · 局主', role: 'hosted', section: 'current', variant: 'empty' },
    { key: 'b-single', group: '边界', label: '只有一场', role: 'joined', section: 'current', variant: 'single' },
    { key: 'b-single-h', group: '边界', label: '只有一场 · 局主', role: 'hosted', section: 'current', variant: 'single' },
    { key: 'b-drafts', group: '边界', label: '只有草稿', role: 'hosted', section: 'current', variant: 'drafts' },
    { key: 'b-long', group: '边界', label: '长标题长地点', role: 'joined', section: 'current', variant: 'long' },
    { key: 'b-long-h', group: '边界', label: '长标题 · 局主', role: 'hosted', section: 'current', variant: 'long' }
  ];
})(typeof window !== 'undefined' ? window : this);

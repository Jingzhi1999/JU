/* jus-data.js (R2) — shared demo state for all ten 「设置」 R2 concepts (S01–S10): dataset, derivations, business engine, state index, variants,
   persistence adapter. Everything here is product semantics; nothing here is visual. Concepts call:
     JUS.data(variant)              fresh deep copy of a dataset
     JUS.derive.*                   view models (home summary, favorites, records, reports, privacy facts, feed, mine)
     JUS.engine.<action>(data, p)   → { data, effect }   (data is a NEW deep copy; effect describes what to animate)
     JUS.fmt.*                      formatting helpers (same clock and format as src/core/ju-data.js: WD MM.DD · HH:MM, New York)
     JUS.INDEX / JUS.VARIANTS / JUS.PERMISSIONS / JUS.RULES / JUS.COPY / JUS.CITIES / JUS.SKINS / JUS.IDMAP
     JUS.store                      namespaced localStorage adapter (jus:<CODE>:v1); reset clears only that key
   Sources: settings/spec/extracts/extract-v27-settings.md (入局), extract-r3-settings.md (开局), extract-myju-settings.md (我的局).
   Semantics preserved from the product (see settings/spec/state-contract.md):
   favorites are keyed by stable event id and never change a sign-up; 未出席 is a fact awaiting review, never a penalty; the only
   quota rule is「主动退出每年 4 次」(no remaining-count is computed from sample data); system permission ≠ reminder service connected;
   a profile edit never rewrites past sign-up snapshots; changing the email drops its verified mark; demo review progress only comes
   from seeded scenarios, never from a user's save. */
(function (global) {
  'use strict';
  var JUS = global.JUS = global.JUS || {};
  JUS.SCHEMA = 2;
  var H = 3600000, M = 60000, D = 24 * H;
  function t(iso) { var m = /^(\d{4})-(\d{2})-(\d{2})(?:T(\d{2}):(\d{2}))?/.exec(iso); return Date.UTC(+m[1], +m[2] - 1, +m[3], m[4] ? +m[4] : 0, m[5] ? +m[5] : 0); }
  var NOW = t('2026-12-17T15:00'); JUS.NOW = NOW; JUS.t = t;
  /* R2 clock: the dataset is anchored at NOW (logical 2026-12-17 15:00), but anything that must EXPIRE or COUNT DOWN reads JUS.now(),
     which advances with real time since load plus a review offset (panel 「时间 +5 分钟」). Old round used the frozen NOW for both
     sending and verifying codes, so expiry could never happen. */
  var LOAD = Date.now(); JUS.clock = { offset: 0, loadedAt: LOAD };
  JUS.now = function () { return NOW + (Date.now() - LOAD) + JUS.clock.offset; };
  JUS.advance = function (ms) { JUS.clock.offset += ms; return JUS.now(); };
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
    ago: function (ms) { var d = JUS.now() - ms; if (d < M) return '刚刚'; if (d < H) return Math.floor(d / M) + ' 分钟前'; if (d < D) return Math.floor(d / H) + ' 小时前'; return Math.floor(d / D) + ' 天前'; },
    place: function (loc) { var i = loc.indexOf('-'); return { borough: i > 0 ? loc.slice(0, i) : '', hood: i > 0 ? loc.slice(i + 1) : loc, full: loc.replace('-', ' · ') }; }
  };
  JUS.fmt = fmt;

  /* ---------------- cities (browse preference scope only; never rewrites an event's own city / tz) ---------------- */
  /* the six cities R3 开局 already offers (cityOptions NYC/BOS/LA/SFO/SEA/CHI; zones NYC,BOS→New_York · LA,SFO,SEA→Los_Angeles · CHI→Chicago).
     No other city is invented here; a custom city exists only inside an 开局 draft (not a browse preference). */
  JUS.CITIES = [
    { key: 'NYC', name: '纽约', en: 'New York', tz: 'America/New_York', tzLabel: '纽约时间' },
    { key: 'BOS', name: '波士顿', en: 'Boston', tz: 'America/New_York', tzLabel: '波士顿时间' },
    { key: 'LA', name: '洛杉矶', en: 'Los Angeles', tz: 'America/Los_Angeles', tzLabel: '洛杉矶时间' },
    { key: 'SFO', name: '旧金山', en: 'San Francisco', tz: 'America/Los_Angeles', tzLabel: '旧金山时间' },
    { key: 'SEA', name: '西雅图', en: 'Seattle', tz: 'America/Los_Angeles', tzLabel: '西雅图时间' },
    { key: 'CHI', name: '芝加哥', en: 'Chicago', tz: 'America/Chicago', tzLabel: '芝加哥时间' }
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
    { key: 'default', label: '未请求' }, { key: 'requesting', label: '请求中' }, { key: 'granted', label: '已允许通知' }, { key: 'denied', label: '已拒绝' }, { key: 'unsupported', label: '暂不支持' }
  ];
  /* V27 favorites gesture (favMove/favEnd + ju-paper-film): the seam inherits these numbers and strings verbatim */
  JUS.FAV = { throwPx: 82, deadZone: 6, axisRatio: 1.25, clamp: 190, idleDamp: 0.26, release: '.5s cubic-bezier(.2,.9,.3,1.04)', rotatePerPx: 0.012,
    copy: { add: '收进收藏', remove: '拿出收藏', alreadyOn: '已经收着了', notOn: '还没收藏', hintOn: '已收藏 ✦ 左滑撤回 · 点卡进详情', hintOff: '上下翻卡 · 点正中那张进详情', emptyCity: '还没收藏这个城市的局', pillAll: '全部', pillFavs: '收藏' },
    icon: { on: '★', off: '☆' } };
  /* copy for the three layers: product preference / system permission / reminder service.
     permission strings = V27 notificationLabel22 / notificationCopy22 verbatim (the 「我的局」 pointer is V27's own wording). */
  JUS.COPY = {
    permission: {
      default: { label: '开启提醒', title: '还没有向系统申请通知权限', body: '可允许系统通知；消息提醒暂未开通，请在“我的局”查看邀请。', cta: '开启提醒' },
      requesting: { label: '请求中', title: '正在等系统回答', body: '请在系统弹出的窗口里选择。', cta: '' },
      granted: { label: '已允许通知', title: '系统已允许通知', body: '已允许系统通知，消息提醒暂未开通。请在“我的局”查看邀请。', cta: '' },
      denied: { label: '已拒绝', title: '通知权限已关闭', body: '通知权限已关闭。可在浏览器设置中调整，仍可正常报名。', cta: '' },
      unsupported: { label: '暂不支持', title: '当前环境不支持系统通知', body: '当前环境不支持系统通知，仍可正常报名并在“我的局”查看进度。', cta: '' }
    },
    permissionError: '暂时无法请求权限，请稍后再试。',
    service: { on: '提醒服务已连接 · 可以送达', off: '消息提醒暂未开通 · 偏好会保存，但目前不会真的发出提醒' },
    prefHint: '关闭某类提醒只影响提醒本身，不会撤回报名、取消席位或移除待办。',
    saveFail: '本机保存失败，请重试',
    copyOk: '微信号已复制', copyBusy: '正在复制…', copyFail: '未能复制，请长按微信号手动复制', copyFailInline: '复制失败，请长按账号复制',
    profileErrors: { nameEmpty: '请填写称呼', nameLong: '称呼最多10个字', wxEmpty: '请填写微信号', wxChars: '微信号仅填写字母、数字、下划线或短横线', mailFormat: '邮箱格式不正确', mailFree: '请使用工作或学校邮箱', mailUnverified: '请完成邮箱验证，或清空后跳过', codeWrong: '验证码不正确', codeExpired: '验证码已过期，请重新发送', codeResend: '重新发送' },
    emailHint: '改了邮箱要重新验证；验证码只在本机生成，不会真的发邮件。',
    snapshotNote: '已报名的局仍使用报名时填写的资料；新资料只用于之后的报名。',
    unsaved: { title: '修改还没保存', body: '离开会丢掉刚才的输入。', keep: '继续编辑', discard: '放弃修改' },
    draftKept: '草稿未保存，当前内容仍保留，请重试。',
    appealSaved: '申诉说明已保存本机，尚未提交审核服务。', appealFail: '申诉未保存，内容已保留，请重试。',
    supplementFail: '补充未提交，内容已保留，请重试。',
    recordHelp: '未出席是待核实的事实，不等于故意缺席，也不会自动处罚；可随时补充说明或提出异议，补充会留下记录。',
    recordHelpDisputed: '未出席是待核实的事实，不等于故意缺席，也不会自动处罚；你已提出异议，正在等待核实，仍可随时补充说明。',
    creditSettings: '记录、核实、认定、处理与更正分别显示。举报不等于违规；主动告知轻于未告知后经核实的缺席。 同一账户每年共4次票根主动退出机会，跨活动、未撕和已撕票共用，接受改期后再退出也计入。确认前放弃预留或预留到期、纯候补退队、拒绝改期、局主取消不消耗。不凭举报或计时自动处罚。',
    quotaRule: '同一账户每年共4次票根主动退出机会，跨活动、未撕和已撕票共用，接受改期后再退出也计入。',
    quotaNoCount: '当前年度配置仍为空，自动处罚关闭；没有完整账户数据与已批准年度口径时，不展示年度余额。',
    creditEmpty: '暂无信用记录', reportsEmpty: '暂无举报记录',
    reportNote: '事实陈述 · 不评分、不自动处罚。',
    reportMock: '举报仅保存本机；状态由平台处理后更新，本地演示不会自动推进。',
    reportSupplementLabel: '补充材料', reportSupplementPlaceholder: '补充相关细节', reportSupplementCta: '提交补充',
    appealLabel: '补充事实或申诉说明', appealCta: '保存说明', appealEntry: '补充与申诉',
    privacyLead: '你的资料在不同情形下谁能看见：',
    wxPolicy: '成局后，仅局主可见你的微信。退出、取消或散场24小时后，关闭查看。',
    demoOnly: '本地演示 · 不连接真实账户',
    cityScope: '只影响「找局」默认显示哪座城市；不改动已创建、已参加的活动，也不改它们的时区。',
    favEmpty: { title: '还没有收藏', body: '遇到想去的，留在这里。', cta: '去找局' },
    contactRules: { beforeFormed: '成局后交换联系方式', closed: '联系方式已关闭', closedWhy: '本场结束已超过 24 小时。', window: '撕券后8小时内联系局主' }
  };
  /* JuRules26 (JU-27-agreement-1): 18 rule titles verbatim; bodies only where the source quoted them verbatim (others: title only, no invented body) */
  JUS.RULE_GROUPS = [{ key: 'confirm', name: '确认', line: '收到邀请，读完再点头。' }, { key: 'credit', name: '信用', line: '承诺之后，及时回应。' }, { key: 'attend', name: '赴约', line: '把联系与见面安排好。' }];
  JUS.RULES = [
    { n: '01', group: 'confirm', title: '收到邀请，才开始留位', body: '申请和候补不占位；邀请发出后预留 6 小时，重开页面不续时。' },
    { n: '02', group: 'confirm', title: '六小时内，读完再确认', body: '确认前可点“去不了了”；放弃或到期释放位置，不记主动失约；候补退队不记缺席。' },
    { n: '03', group: 'confirm', title: '全员确认，才成局出票', body: '包括局主。' },
    { n: '04', group: 'confirm', title: '撕开票根，再联系赴约', body: '撕开副券后 8 小时内联系局主；邀请未确认到期按候补顺序补位。' },
    { n: '05', group: 'credit', title: '确认参加，就是承诺', body: '' },
    { n: '06', group: 'credit', title: '去不了了，请主动退出', body: '每年 4 次主动退出机会，跨活动、未撕 / 已撕共用，接受改期后再退出也计入。' },
    { n: '07', group: 'credit', title: '没告知、没赴约，要核实', body: '' },
    { n: '08', group: 'credit', title: '故意缺席，有信用后果', body: '' },
    { n: '09', group: 'credit', title: '退出额度与失约，分开看', body: '' },
    { n: '10', group: 'credit', title: '失约认定，要看具体事实', body: '' },
    { n: '11', group: 'credit', title: '安排变化，不算主动失约', body: '确认前放弃预留或到期、纯候补退队、拒绝改期、局主取消不记失约、不消耗机会；撕券后 8 小时未联系不自动算故意缺席。' },
    { n: '12', group: 'credit', title: '先核实，再处理；有错可改', body: '记录、核实、认定、处理、申诉与更正各自留痕。结合双方说明、当次有效安排、出席及联系证据判断；举报不成立、出席更正或申诉成立时，同步更正事实、次数和处理。同一事实不重记；异议到“设置→信用记录→补充与申诉”。' },
    { n: '13', group: 'attend', title: '撕开有效票，再联系', body: '成局后，仅局主可见你的微信。撕开有效副券后，可查看局主微信，并在8小时内联系。已接受改期且已撕的同版票，重开时不用再打印或重撕；“已加微信”不代表对方回复或你已到场。' },
    { n: '14', group: 'attend', title: '联系方式，有查看期限', body: '退出、拒绝改期或局主取消后，票和联系入口失效；正常散场24小时后关闭联系查看。改期先答复，失效旧票不能查看联系方式；不向其他成员公开。' },
    { n: '15', group: 'attend', title: '先看费用，再决定参加', body: '' },
    { n: '16', group: 'attend', title: '见面前核对，现场守边界', body: '' },
    { n: '17', group: 'attend', title: '改期重新选，取消不算失约', body: '接受新时间就撕开新版副券；去不了可点“去不了了”；局主取消后票根作废，重开也不恢复。' },
    { n: '18', group: 'attend', title: '发生问题，写清具体事实', body: '在散场页点“举报”；到“设置→帮助与反馈→我的举报”查询或补材料，信用异议到“设置→信用记录→补充与申诉”。写清时间、行为和证据，避免人身评价；现场遇险先求助。' }
  ];
  JUS.RULES_VERSION = 'JU-27-agreement-1';
  JUS.POLICY_NOTE = '以下为可审阅推荐，不是生效规则。当前年度配置仍为空，自动处罚关闭；没有完整账户数据与已批准年度口径时，不展示年度余额。';

  /* ---------------- events (ids identical to src/core/ju-data.js so 我的局 and favorites share identity) ---------------- */
  function ev(o) { return Object.assign({ status: 'open', version: 1, city: 'NYC', cat: 'food', joinMode: 'application' }, o); }
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
    /* feed-only events for the 入局 01 seam = real V27 FEED_ROWS (city|pack|title ids), so favorites can be mapped across files.
       None of them is joined, so a favorite never implies a sign-up. */
    coffeechat: ev({ id: 'coffeechat', v27: 'NYC|street|下班 Coffee Chat 半小时', pack: 'street', title: '下班 Coffee Chat 半小时', iso: '2026-12-17T18:00', loc: 'Manhattan-中城', host: { name: 'Nina', wx: 'nina.runs' }, capacity: 4, cat: 'coffee' }),
    badminton: ev({ id: 'badminton', v27: 'NYC|acid|菜狗羽毛球拼局', pack: 'acid', title: '菜狗羽毛球拼局', iso: '2026-12-19T14:00', loc: 'Queens-长岛市', host: { name: '球球', wx: 'qiuqiu_bd' }, capacity: 4, cat: 'sports', joinMode: 'direct' }),
    hotpot: ev({ id: 'hotpot', v27: 'NYC|invite|深夜救急火锅局', pack: 'invite', title: '深夜救急火锅局', iso: '2026-12-18T19:30', loc: 'Queens-法拉盛', host: { name: '老杨', wx: 'laoyang.ju' }, capacity: 4 }),
    sichuan: ev({ id: 'sichuan', v27: 'NYC|grain|川菜辣度分级评审团', pack: 'grain', title: '川菜辣度分级评审团', iso: '2026-12-19T18:30', loc: 'Brooklyn-八大道', host: { name: '麻酱', wx: 'majiang_nyc' }, capacity: 5 }),
    prettyfood: ev({ id: 'prettyfood', v27: 'NYC|riso|漂亮饭 · 只拍不吃派', pack: 'riso', title: '漂亮饭 · 只拍不吃派', iso: '2026-12-21T12:30', loc: 'Manhattan-下城', host: { name: '鱼丸', wx: 'yuwan.eats' }, capacity: 4 }),
    coffee8: ev({ id: 'coffee8', v27: 'NYC|mono|早八摆烂咖啡局', pack: 'mono', title: '早八摆烂咖啡局', iso: '2026-12-22T08:30', loc: 'Manhattan-东村', host: { name: '小满', wx: 'xiaoman.eats' }, capacity: 4, cat: 'coffee' }),
    werewolf: ev({ id: 'werewolf', v27: 'NYC|riso|狼人杀新手场', pack: 'riso', title: '狼人杀新手场', iso: '2026-12-20T19:00', loc: 'Manhattan-下城', host: { name: '大熊', wx: 'daxiong_wolf' }, capacity: 5, cat: 'games' }),
    exhibit: ev({ id: 'exhibit', v27: 'NYC|riso|周末看展搭子局', pack: 'riso', title: '周末看展搭子局', iso: '2026-12-20T13:00', loc: 'Queens-长岛市', host: { name: '蛋挞', wx: 'dantat.coffee' }, capacity: 4, cat: 'culture' }),
    bookshop: ev({ id: 'bookshop', v27: 'NYC|grain|独立书店逛到关门', pack: 'grain', title: '独立书店逛到关门', iso: '2026-12-27T16:00', loc: 'Brooklyn-威廉斯堡', host: { name: '西西', wx: 'xixi_nyc' }, capacity: 4, cat: 'culture' }),
    rooftop: ev({ id: 'rooftop', v27: 'NYC|invite|天台小酒 · 看天际线', pack: 'invite', title: '天台小酒 · 看天际线', iso: '2026-12-19T21:30', loc: 'Manhattan-中城', host: { name: 'Leo', wx: 'leo_roof' }, capacity: 4, cat: 'night' }),
    picnic2: ev({ id: 'picnic2', v27: 'NYC|grain|中央公园野餐', pack: 'grain', title: '中央公园野餐', iso: '2026-12-21T11:30', loc: 'Manhattan-上东区', host: { name: '花卷', wx: 'huajuan_play' }, capacity: 6, cat: 'outdoor' }),
    vintagewalk: ev({ id: 'vintagewalk', v27: 'NYC|invite|Vintage 淘货 Citywalk', pack: 'invite', title: 'Vintage 淘货 Citywalk', iso: '2026-12-27T13:00', loc: 'Brooklyn-威廉斯堡', host: { name: '阿蒋', wx: 'ajiang_vtg' }, capacity: 4, cat: 'walk' }),
    bosmala: ev({ id: 'bosmala', v27: 'BOS|invite|Allston 麻辣香锅拼桌', pack: 'invite', title: 'Allston 麻辣香锅拼桌', iso: '2026-12-19T19:00', loc: 'Boston-Allston', host: { name: '小林', wx: 'xiaolin_bos' }, capacity: 4, city: 'BOS' }),
    lakbbq: ev({ id: 'lakbbq', v27: 'LA|grain|Arcadia 半夜烤肉', pack: 'grain', title: 'Arcadia 半夜烤肉', iso: '2026-12-18T22:00', loc: 'SGV-Arcadia', host: { name: '阿宽', wx: 'akuan_88' }, capacity: 4, city: 'LA' })
  };
  /* cross-file id map: canonical id ↔ V27 event id (city|pack|title) and V27 favorites key (city|title); 我的局 ids are canonical already.
     R3's favorites key (CITY:feedRow index) cannot be mapped to an event and is not inherited. */
  JUS.IDMAP = { v27: {}, v27FavKey: {}, myju: {}, r3: null, note: 'V27 feed 行 id = city|pack|title；V27 收藏键 = city|title（无 pack）；R3 收藏键 = 城市:下标（不可映射）；我的局 id = canonical' };
  Object.keys(EVENTS).forEach(function (k) { var e = EVENTS[k]; if (e.v27) { JUS.IDMAP.v27[k] = e.v27; JUS.IDMAP.v27FavKey[k] = e.v27.split('|')[0] + '|' + e.v27.split('|')[2]; } else { JUS.IDMAP.myju[k] = k; } });
  var YOU = { id: 'you', name: '阿禾', wx: 'ahe_ju', email: 'ahe@nyu.edu', emailVerified: true, emailDomain: 'nyu.edu', emailKind: 'school', emailPending: null };
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
  /* records = account-level facts. Shape follows V27 ju-state creditEvents: { key, type, eventId, at, updatedAt, status recorded|pending_review|corrected|dismissed|verified,
     penalty:null, eligible (withdrawalScope27.eligible), appeals[{kind:'dispute'|'appeal', reason, at, status:'pending_review'}], supplements[{text,at}] }.
     type 'attended' (局主记录：出席) is an attendance record from 我的局, not a credit fact. Fact text is never rewritten; only appeals / supplements append. */
  function fact(key, type, eventId, at, extra) { return Object.assign({ key: key, id: key, type: type, eventId: eventId, accountId: 'you', at: at, updatedAt: at, status: type === 'active_withdrawal' || type === 'attended' ? 'recorded' : type === 'absence_reported' ? 'pending_review' : 'recorded', penalty: null, eligible: type === 'active_withdrawal', appeals: [], supplements: [] }, extra || {}); }
  function RECORDS() {
    return [
      fact('rec-jazz', 'attended', 'jazz', t('2026-12-13T10:20')),
      fact('rec-hike2', 'absence_reported', 'hike2', t('2026-11-23T09:10'), { supplements: [{ text: '当天高烧，已私信局主', at: t('2026-11-23T12:00') }] }),
      fact('rec-karaoke', 'active_withdrawal', 'karaoke', t('2026-12-11T15:00')),
      fact('rec-picnic', 'host_reschedule_declined', 'picnic', t('2026-11-27T18:00')),
      fact('rec-hike', 'reservation_expired', 'hike', t('2026-12-04T20:00')),
      fact('rec-ramen', 'host_cancelled', 'ramen', t('2026-12-15T12:00')),
      fact('rec-boardgame', 'queue_left', 'boardgame', t('2026-12-15T09:00'))
    ];
  }
  /* V27 creditLabel / creditStatus verbatim (+ 'attended') */
  JUS.creditLabel = function (f) { return ({ attended: '局主记录：出席', active_withdrawal: '主动告知退出', reservation_released: '未确认预留已释放', reservation_expired: '预留已到期', queue_left: '已退出候补', host_reschedule_declined: '已拒绝局主改期', host_cancelled: '局主已取消' })[f.type] || (f.status === 'corrected' ? (f.attendanceMode === 'present' ? '已更正为出席' : f.attendanceMode === 'pending' ? '出席待确认 · 旧记录已更正' : '未出席记录已更正') : '未出席记录'); };
  JUS.creditStatus = function (f) { return f.eligible === false && f.status === 'recorded' && f.type !== 'attended' ? '已记录 · 不占主动退出机会' : f.type === 'active_withdrawal' && (f.status === 'corrected' || f.status === 'dismissed') ? '已更正 · 不计主动退出事实' : ({ pending_review: '待核实 · 未处罚', recorded: '已记录', corrected: '已更正 · 不作为当前违规', dismissed: '不成立', verified: '事实已核实 · 未执行处罚' })[f.status] || f.status; };
  JUS.RECORD_KINDS = { attended: '出席记录', absence_reported: '出席记录', active_withdrawal: '主动退出', reservation_released: '安排变化', reservation_expired: '安排变化', queue_left: '安排变化', host_reschedule_declined: '安排变化', host_cancelled: '安排变化' };
  /* reports: V27 ju-state report object { id:'DEMO-<base36>-<n>', text, who[], whoName, shots[{name,size}], status, createdAt, updatedAt, timeline[{status,at}], supplements[{text,at}] }.
     V27 sets status 'accepted' at creation (isolated mock). This contract adds 'submitted' for user-filed reports so a save never claims platform acceptance;
     accepted / processing / needs_info / resolved only come from seeded demo scenarios. */
  JUS.REPORT_LABELS = { submitted: '已提交', accepted: '已受理', processing: '处理中', needs_info: '需补充', resolved: '已处理', failed: '提交失败' };
  function report(o) { return Object.assign({ shots: [], supplements: [], source: 'isolated-mock' }, o); }
  function REPORTS() {
    return [
      report({ id: 'DEMO-MWZK1A-1', eventId: 'boardgame', text: '局主最后一刻改了地点，没在局里说明，大家在原地等了四十分钟。', who: ['host'], whoName: 'Ivy（局主）', shots: [{ name: '群聊截图.jpg', size: 412000 }], status: 'needs_info', createdAt: t('2026-12-17T01:30'), updatedAt: t('2026-12-17T11:20'),
        timeline: [{ status: 'accepted', at: t('2026-12-17T01:30') }, { status: 'processing', at: t('2026-12-17T09:00') }, { status: 'needs_info', at: t('2026-12-17T11:20') }], needsText: '需要补充：当天改地点的聊天记录或时间线' }),
      report({ id: 'DEMO-MWRQ7C-1', eventId: 'karaoke', text: '有成员在包厢里反复劝酒，拒绝后仍继续。', who: ['member-2'], whoName: '小满', status: 'accepted', createdAt: t('2026-12-12T10:05'), updatedAt: t('2026-12-12T15:00'),
        timeline: [{ status: 'accepted', at: t('2026-12-12T15:00') }] })
    ];
  }
  function FEEDBACK() { return [{ id: 'fb-1', text: '希望「找局」可以按周末筛选。', at: t('2026-12-10T21:00'), status: 'submitted', localNo: 'F-1210-01' }]; }
  JUS.REPORT_STATES = JUS.REPORT_LABELS;

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
      favorites: [{ eventId: 'hotpot', at: NOW - 2 * D }, { eventId: 'exhibit', at: NOW - 1 * D }, { eventId: 'sketch', at: NOW - 5 * H }],
      prefs: { city: 'NYC' },
      notify: { permission: 'default', serviceConnected: false, prefs: { invite: true, reserve: true, waitlist: true, reschedule: true, change: true, host: true } },
      appearance: { skin: 'cotton', reduceMotion: false },
      records: RECORDS(), reports: REPORTS(), feedback: FEEDBACK(),
      session: { kind: 'demo', startedAt: NOW - 3 * D, device: '本机浏览器' },
      flags: { failNext: false, copyFailNext: false, permissionAnswer: 'granted' },
      seq: 3, codeGen: 0
    };
    if (variant === 'empty') { d.favorites = []; d.records = []; d.reports = []; d.feedback = []; d.joined = d.joined.filter(function (j) { return j.group !== '历史'; }); }
    if (variant === 'many') {
      d.favorites = ['hotpot', 'exhibit', 'sketch', 'badminton', 'sichuan', 'werewolf', 'bookshop', 'rooftop', 'vintagewalk', 'bosmala', 'lakbbq', 'coffee', 'climb'].map(function (id, i) { return { eventId: id, at: NOW - (i + 1) * 7 * H }; });
      d.reports.push(report({ id: 'DEMO-MWQ3F0-1', eventId: 'mahjong', text: '审核没通过没关系，但局主在群里公开了我的微信号。', who: ['host'], whoName: '阿宽（局主）', status: 'resolved', createdAt: t('2026-12-14T20:00'), updatedAt: t('2026-12-16T18:00'), timeline: [{ status: 'accepted', at: t('2026-12-15T10:00') }, { status: 'resolved', at: t('2026-12-16T18:00') }] }));
      d.records.push(fact('rec-bookclub', 'reservation_released', 'bookclub', t('2026-12-04T12:00')));
      d.records.push(fact('rec-mahjong', 'attended', 'mahjong', t('2026-12-14T21:00')));
      d.records.push(fact('rec-boardgame-abs', 'absence_reported', 'pottery', t('2026-12-10T19:00'), { status: 'verified' }));
    }
    if (variant === 'long') {
      d.you.name = '阿禾·周末睡到十一点'; d.you.email = 'hehe.zhang.weekend.brunch.2026@stern.nyu.edu'; d.you.wx = 'ahe_weekend_brunch_club_2026';
      d.events.hotpot.title = '深夜救急火锅局 · 不吃辣的也有清汤锅 · 吃完一起去对面买汤圆'; d.events.hotpot.loc = 'Queens-法拉盛缅街与 39 大道交口那家门口有红灯笼的店 B1';
      d.events.sketch.title = '周末速写 · 画人不画景 · 自带本子画完互相看 · 新手也欢迎来坐坐';
    }
    if (variant === 'denied') { d.notify.permission = 'denied'; }
    if (variant === 'unsupported') { d.notify.permission = 'unsupported'; }
    if (variant === 'connected') { d.notify.permission = 'granted'; d.notify.serviceConnected = true; }
    if (variant === 'fresh') { d.you = { id: 'you', name: '新来的', wx: '', email: '', emailVerified: false, emailDomain: '', emailKind: '', emailPending: null }; d.favorites = []; d.records = []; d.reports = []; d.feedback = []; d.joined = []; d.hosted = []; d.session.startedAt = NOW - 10 * M; }
    return d;
  }
  JUS.data = build;
  JUS.baseState = function (variant) { return { variant: variant || 'default', data: build(variant), view: { name: 'home' } }; };

  /* ---------------- persistence adapter (one namespaced key per concept; never touches other prototypes' keys) ---------------- */
  JUS.store = {
    key: function (code) { return 'jus2:' + code + ':v1'; },
    load: function (code) { try { var s = global.localStorage && global.localStorage.getItem(JUS.store.key(code)); return s ? JSON.parse(s) : null; } catch (e) { return null; } },
    save: function (code, data) { try { global.localStorage && global.localStorage.setItem(JUS.store.key(code), JSON.stringify(data)); return true; } catch (e) { return false; } },
    clear: function (code) { try { global.localStorage && global.localStorage.removeItem(JUS.store.key(code)); } catch (e) { } }
  };

  /* ---------------- validation ---------------- */
  var MAILFREE = ['gmail.com', 'qq.com', '163.com', '126.com', 'outlook.com', 'hotmail.com', 'yahoo.com', 'icloud.com', 'foxmail.com', 'me.com', 'live.com', 'sina.com'];
  function graphemes(v) { try { if (global.Intl && Intl.Segmenter) { var n = 0; var it = new Intl.Segmenter('zh', { granularity: 'grapheme' }).segment(v); for (var x of it) n++; return n; } } catch (e) { } return Array.from(v).length; }
  var validate = {
    name: function (v) { v = (v || '').trim(); if (!v) return JUS.COPY.profileErrors.nameEmpty; if (graphemes(v) > 10) return JUS.COPY.profileErrors.nameLong; return ''; },
    wx: function (v) { v = (v || '').trim(); if (!v) return JUS.COPY.profileErrors.wxEmpty; if (!/^[A-Za-z0-9_-]+$/.test(v)) return JUS.COPY.profileErrors.wxChars; return ''; },
    email: function (v) { v = (v || '').trim(); if (!v) return ''; if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return JUS.COPY.profileErrors.mailFormat; if (MAILFREE.indexOf(v.split('@')[1].toLowerCase()) >= 0) return JUS.COPY.profileErrors.mailFree; return ''; },
    text: function (v, min) { v = (v || '').trim(); if (v.length < (min || 4)) return '请填写至少' + (min || 4) + '字的内容'; if (v.length > 500) return '最多 500 字'; return ''; }
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
    var open = r.appeals.filter(function (a) { return a.status === 'pending_review'; });
    return Object.assign({}, r, { event: e, title: e.title, when: fmt.when(e.iso), place: fmt.place(e.loc), host: hostName(d, e), atText: fmt.dateTime(r.at), updatedText: fmt.dateTime(r.updatedAt || r.at),
      label: JUS.creditLabel(r), statusLabel: JUS.creditStatus(r), kindLabel: JUS.RECORD_KINDS[r.type] || '记录', isCredit: r.type !== 'attended',
      quotaLabel: r.type === 'attended' ? '' : r.eligible ? '占年度主动退出机会' : '不占机会 · 不记失约',
      canDispute: r.type === 'absence_reported' && !r.appeals.some(function (a) { return a.kind === 'dispute'; }), canAppeal: r.type === 'active_withdrawal' && !r.appeals.some(function (a) { return a.kind === 'appeal'; }), canSupplement: true,
      appealCount: r.appeals.length, openAppeals: open.length, appealLine: open.length ? '已保存 ' + open.length + ' 条说明 · 待核实（本机）' : '', pendingReview: r.status === 'pending_review',
      helpText: r.type !== 'absence_reported' ? '' : (r.appeals.some(function (a) { return a.kind === 'dispute'; }) ? JUS.COPY.recordHelpDisputed : JUS.COPY.recordHelp),
      supplementRows: (r.supplements || []).map(function (x) { return Object.assign({}, x, { atText: fmt.dateTime(x.at), materialsText: materialsText(x.materials) }); }) });
  }
  function reportRow(d, r) {
    var e = eventOf(d, r.eventId);
    return Object.assign({}, r, { event: e, title: e.title, when: fmt.when(e.iso), host: hostName(d, e), atText: fmt.dateTime(r.createdAt), updatedText: fmt.dateTime(r.updatedAt), statusLabel: JUS.REPORT_LABELS[r.status] || r.status, needsMore: r.status === 'needs_info', open: r.status !== 'resolved', shotCount: r.shots.length,
      timelineRows: (r.timeline || []).map(function (x) { return { status: x.status, label: JUS.REPORT_LABELS[x.status] || x.status, atText: fmt.dateTime(x.at), text: x.status === 'needs_info' && r.needsText ? r.needsText : '' }; }),
      supplementRows: (r.supplements || []).map(function (x) { return Object.assign({}, x, { atText: fmt.dateTime(x.at), materialsText: materialsText(x.materials) }); }) });
  }
  /* attached local files (name + size only, never uploaded): 「截图.jpg · 402 KB、时间线.png · 1.2 MB」 */
  function sizeText(n) { return n > 1048576 ? (n / 1048576).toFixed(1) + ' MB' : Math.max(1, Math.round((n || 0) / 1024)) + ' KB'; }
  function materialsText(list) { return (list || []).map(function (m) { return m.name + (m.size ? ' · ' + sizeText(m.size) : ''); }).join('、'); }
  JUS.derive = {
    event: eventOf, eventStatus: eventStatus, isFav: isFav, joinedRow: joinedRow, hostedRow: hostedRow, hostName: hostName,
    city: function (d) { return JUS.cityByKey(d.prefs.city); },
    /* home summary: current values for every settings group */
    summary: function (d) {
      var city = JUS.cityByKey(d.prefs.city); var n = d.notify; var onCount = Object.keys(n.prefs).filter(function (k) { return n.prefs[k]; }).length;
      var permLabel = { default: '未申请系统权限', requesting: '请求中', granted: n.serviceConnected ? '已允许通知 · 提醒已连接' : '已允许通知 · 提醒暂未开通', denied: '通知已拒绝', unsupported: '暂不支持通知' }[n.permission];
      var openReports = d.reports.filter(function (r) { return r.status !== 'resolved'; }).length, needMore = d.reports.filter(function (r) { return r.status === 'needs_info'; }).length;
      /* the report label names each stage once: 需补充 / 处理中 (accepted + processing) / 已提交 — a submitted report is not 「处理中」 yet */
      var repBy = {}; d.reports.forEach(function (r) { repBy[r.status] = (repBy[r.status] || 0) + 1; });
      var repProc = (repBy.processing || 0) + (repBy.accepted || 0), repParts = [];
      if (needMore) repParts.push(needMore + ' 条需补充'); if (repProc) repParts.push(repProc + ' 条处理中'); if (repBy.submitted) repParts.push(repBy.submitted + ' 条已提交');
      /* 待核实 describes the record (still under review after a dispute); attention counts only the ones still waiting for you */
      var pendingAll = d.records.filter(function (r) { return r.status === 'pending_review'; }).length;
      var pending = d.records.filter(function (r) { return r.status === 'pending_review' && !r.appeals.length; }).length;
      return {
        you: d.you, emailLabel: d.you.email ? (d.you.emailVerified ? '已验证' : '未验证') : '未填写', wxLabel: d.you.wx ? d.you.wx : '未填写',
        favCount: d.favorites.length, favLabel: d.favorites.length ? d.favorites.length + ' 个局' : '还没有收藏',
        city: city, cityLabel: city.name, notifyLabel: onCount + '/' + JUS.NOTIFY_CATS.length + ' 类开启 · ' + permLabel, permission: n.permission, serviceConnected: n.serviceConnected,
        skin: JUS.SKINS.filter(function (s) { return s.key === d.appearance.skin; })[0], reduceMotion: d.appearance.reduceMotion, appearanceLabel: JUS.SKINS.filter(function (s) { return s.key === d.appearance.skin; })[0].name + (d.appearance.reduceMotion ? ' · 减少动态' : ''),
        recordCount: d.records.length, recordLabel: d.records.length ? d.records.length + ' 条事实' + (pendingAll ? ' · ' + pendingAll + ' 条待核实' : '') : JUS.COPY.creditEmpty, pendingRecords: pendingAll, pendingToAnswer: pending,
        reportCount: d.reports.length, reportLabel: d.reports.length ? (repParts.length ? repParts.join(' · ') : '均已处理') : JUS.COPY.reportsEmpty, needMore: needMore, reportOpen: openReports, reportProcessing: repProc, reportSubmitted: repBy.submitted || 0,
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
        .map(function (e) { var j = joinedRow(d, e.id); return { id: e.id, event: e, title: e.title, pack: e.pack || 'invite', cat: e.cat, when: fmt.when(e.iso), place: fmt.place(e.loc), host: hostName(d, e), hostWx: e.host === 'you' ? d.you.wx : e.host.wx, capacity: e.capacity, joinMode: e.joinMode, fav: isFav(d, e.id), favKey: JUS.IDMAP.v27FavKey[e.id] || (e.city + '|' + e.title), joined: j, joinedLabel: j ? j.label : '', canSeeHostWx: !!(j && j.ticket && j.ticket.torn && !j.contactClosed) }; });
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
      var exits = rows.filter(function (r) { return r.type === 'active_withdrawal'; }).length;
      return { rows: rows, attendance: rows.filter(function (r) { return r.kindLabel === '出席记录'; }), exits: rows.filter(function (r) { return r.type === 'active_withdrawal'; }), changes: rows.filter(function (r) { return r.kindLabel === '安排变化'; }), count: rows.length, exitCount: exits, exitLine: exits ? '本机记录中的主动告知退出：' + exits + ' 次' : '本机记录中没有主动退出', pending: rows.filter(function (r) { return r.pendingReview; }).length, empty: rows.length === 0, lead: JUS.COPY.creditSettings };
    },
    record: function (d, id) { var r = d.records.filter(function (x) { return x.id === id; })[0]; return r ? recordRow(d, r) : null; },
    reports: function (d) { var rows = d.reports.slice().sort(function (a, b) { return (b.updatedAt || b.createdAt || 0) - (a.updatedAt || a.createdAt || 0); }).map(function (r) { return reportRow(d, r); }); return { rows: rows, open: rows.filter(function (r) { return r.open; }), closed: rows.filter(function (r) { return !r.open; }), needMore: rows.filter(function (r) { return r.needsMore; }), count: rows.length, empty: rows.length === 0 }; },
    report: function (d, id) { var r = d.reports.filter(function (x) { return x.id === id; })[0]; return r ? reportRow(d, r) : null; },
    feedback: function (d) { return d.feedback.slice().sort(function (a, b) { return b.at - a.at; }).map(function (f) { return Object.assign({}, f, { atText: fmt.dateTime(f.at), statusLabel: f.status === 'submitted' ? '已提交' : '本地已保存' }); }); },
    notify: function (d) {
      var n = d.notify; var p = JUS.COPY.permission[n.permission];
      var canDeliver = n.permission === 'granted' && n.serviceConnected;
      /* granted + connected must not still say 「消息提醒暂未开通」 */
      if (n.permission === 'granted' && n.serviceConnected) p = Object.assign({}, p, { title: '系统已允许通知', body: '已允许系统通知，提醒服务已连接，可以送达。' });
      return { permission: n.permission, permissionLabel: p.label, permCopy: p, buttonLabel: p.label, buttonDisabled: n.permission !== 'default', serviceConnected: n.serviceConnected, serviceCopy: n.serviceConnected ? JUS.COPY.service.on : JUS.COPY.service.off, canDeliver: canDeliver, deliverLabel: canDeliver ? '提醒可以送达' : n.permission === 'granted' ? '系统已允许，但消息提醒暂未开通，目前不会发出提醒' : n.permission === 'denied' ? '通知权限已关闭，不会显示任何提醒' : n.permission === 'unsupported' ? '当前环境不支持系统通知，不会有提醒' : '还未申请系统权限，不会有提醒', canRequest: n.permission === 'default', cats: JUS.NOTIFY_CATS.map(function (c) { return Object.assign({}, c, { on: !!n.prefs[c.key] }); }), onCount: Object.keys(n.prefs).filter(function (k) { return n.prefs[k]; }).length };
    },
    /* privacy: who can see your profile, derived from your actual events and the product rules */
    privacy: function (d) {
      var facts = [];
      d.hosted.forEach(function (h) { var e = eventOf(d, h.eventId); var st = eventStatus(d, e); facts.push({ eventId: e.id, title: e.title, role: '你是局主', rule: st.key === 'ended' ? (e.endedAt && NOW - e.endedAt < 24 * H ? '已散场 · 24 小时内成员仍可见你的微信' : '已散场 · 联系方式已关闭') : h.formed ? '已成局 · 撕开有效票的成员可见你的微信' : '未成局 · 成员看不到你的微信', open: st.key !== 'ended' || (e.endedAt && NOW - e.endedAt < 24 * H) }); });
      d.joined.forEach(function (j) { var e = eventOf(d, j.eventId); if (j.group === '历史') return; facts.push({ eventId: e.id, title: e.title, role: '你是参加者', rule: j.ticket ? '已成局 · 只有局主可见你的微信' : j.stage === 'pending' ? '申请中 · 局主可见你的申请资料（称呼、邮箱验证状态）' : '未成局 · 只有局主可见你的称呼', open: true }); });
      return { lead: JUS.COPY.privacyLead, policy: JUS.COPY.wxPolicy, general: ['称呼对局主与同局成员可见。', JUS.COPY.wxPolicy, '邮箱只用于验证标记（显示域名，如 nyu.edu）；任何人看不到地址本身。', '退出、拒绝改期或局主取消后，票和联系入口失效；正常散场24小时后关闭联系查看。'], facts: facts, demo: JUS.COPY.demoOnly, noToggles: '这里没有开关：谁能看见你，由活动的成局、票根与散场状态决定。' };
    },
    about: function (d) { return { version: 'JU 原型 · 设置 · 本地演示', rulesVersion: JUS.RULES_VERSION, built: global.__JUS_BUILT || '', rules: JUS.RULES, groups: JUS.RULE_GROUPS, policyNote: JUS.POLICY_NOTE, cities: JUS.CITIES.length, demo: JUS.COPY.demoOnly, storageKey: 'jus2:<方案编号>:v1' }; },
    emailPending: function (d) { var pnd = d.you.emailPending; if (!pnd) return null; var now = JUS.now(); return Object.assign({}, pnd, { resendLeftMs: Math.max(0, pnd.resendAt - now), resendLeftS: Math.ceil(Math.max(0, pnd.resendAt - now) / 1000), expiresInMs: Math.max(0, pnd.expiresAt - now), expired: now > pnd.expiresAt }); }
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
    favorite: function (data, p) { return withData(data, function (d) { if (!d.events[p.eventId]) return { type: 'error', message: '这个局不存在' }; if (isFav(d, p.eventId)) return { type: 'favorited', eventId: p.eventId, already: true, count: d.favorites.length }; d.favorites.push({ eventId: p.eventId, at: p.at || JUS.now() }); return { type: 'favorited', eventId: p.eventId, count: d.favorites.length, first: d.favorites.length === 1 }; }); },
    unfavorite: function (data, p) { return withData(data, function (d) { var before = d.favorites.length; d.favorites = d.favorites.filter(function (f) { return f.eventId !== p.eventId; }); if (d.favorites.length === before) return { type: 'unfavorited', eventId: p.eventId, already: true, count: before }; return { type: 'unfavorited', eventId: p.eventId, count: d.favorites.length, last: d.favorites.length === 0 }; }); },
    toggleFavorite: function (data, p) { return isFav(data, p.eventId) ? JUS.engine.unfavorite(data, p) : JUS.engine.favorite(data, p); },
    /* profile: explicit save; validation first (no write on invalid). A changed email must be verified (local 6-digit test code, as V27 sendCode) or cleared; snapshots untouched. */
    saveProfile: function (data, p) {
      var email = (p.email || '').trim();
      var errors = { name: validate.name(p.name), wx: validate.wx(p.wx), email: validate.email(email) };
      if (!errors.email && email && email !== data.you.email && !(data.you.emailPending && data.you.emailPending.verified && data.you.emailPending.email === email)) errors.email = JUS.COPY.profileErrors.mailUnverified;
      if (errors.name || errors.wx || errors.email) return { data: clone(data), effect: { type: 'invalid', errors: errors } };
      return withData(data, function (d) {
        var emailChanged = email !== d.you.email; var changed = [];
        if ((p.name || '').trim() !== d.you.name) changed.push('name'); if ((p.wx || '').trim() !== d.you.wx) changed.push('wx'); if (emailChanged) changed.push('email');
        d.you.name = (p.name || '').trim(); d.you.wx = (p.wx || '').trim();
        if (emailChanged) { d.you.email = email; d.you.emailVerified = !!email; d.you.emailDomain = email.split('@')[1] || ''; d.you.emailKind = /\.edu$/i.test(d.you.emailDomain) ? 'school' : email ? 'work' : ''; }
        d.you.emailPending = null;
        return { type: 'profile-saved', changed: changed, emailChanged: emailChanged, nothing: changed.length === 0 };
      });
    },
    /* email verification (local test code, V27: 6 digits, 59s resend, 5 min expiry, code = String(246809 + generation).padStart(6,'0'); shown only in the review panel) */
    requestEmailCode: function (data, p) {
      var email = (p.email || '').trim(); var err = validate.email(email) || (!email ? JUS.COPY.profileErrors.mailFormat : '');
      if (err) return { data: clone(data), effect: { type: 'invalid', errors: { email: err } } };
      return withData(data, function (d) { d.codeGen = (d.codeGen || 0) + 1; var code = String(246809 + d.codeGen).padStart(6, '0'); var now = JUS.now(); d.you.emailPending = { email: email, generation: d.codeGen, code: code, sentAt: now, resendAt: now + 59000, expiresAt: now + 5 * M, verified: false, attempts: 0 }; return { type: 'code-sent', email: email, code: code }; });
    },
    verifyEmailCode: function (data, p) {
      var pnd = data.you.emailPending; if (!pnd) return { data: clone(data), effect: { type: 'error', message: '请先发送验证码' } };
      if (JUS.now() > pnd.expiresAt) return { data: clone(data), effect: { type: 'invalid', errors: { code: JUS.COPY.profileErrors.codeExpired, expired: true } } };
      if (String(p.code || '').trim() !== pnd.code) { var d2 = clone(data); d2.you.emailPending.attempts++; return { data: d2, effect: { type: 'invalid', errors: { code: JUS.COPY.profileErrors.codeWrong } } }; }
      return withData(data, function (d) { d.you.emailPending.verified = true; return { type: 'email-verified', email: pnd.email, domain: pnd.email.split('@')[1] }; });
    },
    clearEmailPending: function (data, p) { var d = clone(data); d.you.emailPending = null; return { data: d, effect: { type: 'flag' } }; },
    /* review only: age the pending code so the 「已过期」 branch is reachable without waiting 5 real minutes (index s-profile-code-expired) */
    expireEmailCode: function (data, p) { var d = clone(data); if (d.you.emailPending) { d.you.emailPending.expiresAt = JUS.now() - 1000; d.you.emailPending.resendAt = JUS.now() - 1000; } return { data: d, effect: { type: 'flag' } }; },
    /* city: immediate; scope = browse default only */
    setCity: function (data, p) { return withData(data, function (d) { if (!JUS.CITIES.some(function (c) { return c.key === p.city; })) return { type: 'error', message: '没有这座城市' }; var prev = d.prefs.city; d.prefs.city = p.city; return { type: 'city', city: p.city, prev: prev, same: prev === p.city }; }); },
    /* notifications: product preference is immediate; permission request is a simulated system round-trip the concept animates */
    setNotifyPref: function (data, p) { return withData(data, function (d) { d.notify.prefs[p.key] = !!p.on; return { type: 'pref', key: p.key, on: !!p.on }; }); },
    requestPermission: function (data, p) { return withData(data, function (d) { if (d.notify.permission !== 'default') return { type: 'permission', value: d.notify.permission, noop: true }; d.notify.permission = 'requesting'; return { type: 'permission', value: 'requesting' }; }); },
    /* the system's answer comes from the review panel preset (flags.permissionAnswer, default granted) unless the concept passes p.value */
    resolvePermission: function (data, p) { return withData(data, function (d) { if (d.notify.permission !== 'requesting') return { type: 'permission', value: d.notify.permission, noop: true }; var v = (p && p.value) || d.flags.permissionAnswer || 'granted'; d.notify.permission = v === 'granted' ? 'granted' : 'denied'; return { type: 'permission', value: d.notify.permission }; }); },
    setPermissionAnswer: function (data, p) { var d = clone(data); d.flags.permissionAnswer = p.value; return { data: d, effect: { type: 'flag' } }; },
    /* appearance: preview is view state in the concept; apply writes; reduce motion is immediate */
    applySkin: function (data, p) { return withData(data, function (d) { var prev = d.appearance.skin; d.appearance.skin = p.skin; return { type: 'skin', skin: p.skin, prev: prev }; }); },
    setReduceMotion: function (data, p) { return withData(data, function (d) { d.appearance.reduceMotion = !!p.on; return { type: 'reduce-motion', on: !!p.on }; }); },
    /* records (credit facts / attendance): append-only. supplement = 补充事实; dispute = 出席异议 (absence_reported only, once); appeal = 信用申诉 (active_withdrawal only, once).
       All three are V27 appeals/supplements on the fact: saved locally, status pending_review, never auto-reviewed. */
    addSupplement: function (data, p) {
      var err = validate.text(p.text, 4); if (err) return { data: clone(data), effect: { type: 'invalid', errors: { text: err } } };
      return withData(data, function (d) { var r = d.records.filter(function (x) { return x.id === p.recordId; })[0]; if (!r) return { type: 'error', message: '找不到这条记录' }; r.supplements.push({ text: p.text.trim(), at: JUS.now(), materials: (p.materials || []).map(function (m) { return { name: m.name, size: m.size || 0, local: true }; }) }); r.updatedAt = JUS.now(); return { type: 'supplemented', recordId: r.id, count: r.supplements.length, message: JUS.COPY.appealSaved }; });
    },
    fileDispute: function (data, p) {
      var err = validate.text(p.text, 4); if (err) return { data: clone(data), effect: { type: 'invalid', errors: { text: err } } };
      return withData(data, function (d) { var r = d.records.filter(function (x) { return x.id === p.recordId; })[0]; if (!r) return { type: 'error', message: '找不到这条记录' }; if (r.type !== 'absence_reported') return { type: 'error', message: '只能对「未出席记录」提出异议' }; if (r.appeals.some(function (a) { return a.kind === 'dispute'; })) return { type: 'error', message: '已经提出过异议' }; r.appeals.push({ kind: 'dispute', reason: p.text.trim(), at: JUS.now(), status: 'pending_review', materials: p.materials || [] }); r.updatedAt = JUS.now(); return { type: 'disputed', recordId: r.id, message: JUS.COPY.appealSaved }; });
    },
    fileAppeal: function (data, p) {
      var err = validate.text(p.text, 4); if (err) return { data: clone(data), effect: { type: 'invalid', errors: { text: err } } };
      return withData(data, function (d) { var r = d.records.filter(function (x) { return x.id === p.recordId; })[0]; if (!r) return { type: 'error', message: '找不到这条记录' }; if (r.type !== 'active_withdrawal') return { type: 'error', message: '只能对主动退出记录申诉' }; if (r.appeals.some(function (a) { return a.kind === 'appeal'; })) return { type: 'error', message: '已经申诉过' }; r.appeals.push({ kind: 'appeal', reason: p.text.trim(), at: JUS.now(), status: 'pending_review', materials: p.materials || [] }); r.updatedAt = JUS.now(); return { type: 'appealed', recordId: r.id, message: JUS.COPY.appealSaved }; });
    },
    /* reports: supplement only while needs_info (V27 ju-state.supplement → processing); file a new one from the 我的局 seam (status submitted, never auto-accepted) */
    supplementReport: function (data, p) {
      var text = (p.text || '').trim(); if (!text && !(p.materials && p.materials.length)) return { data: clone(data), effect: { type: 'invalid', errors: { text: '请填写补充内容或添加材料' } } };
      return withData(data, function (d) { var r = d.reports.filter(function (x) { return x.id === p.reportId; })[0]; if (!r) return { type: 'error', message: '找不到这条举报' }; if (r.status !== 'needs_info') return { type: 'error', message: '这条举报现在不需要补充' }; r.supplements.push({ text: text, at: JUS.now(), materials: p.materials || [] }); r.status = 'processing'; r.updatedAt = JUS.now(); r.timeline.push({ status: 'processing', at: JUS.now() }); return { type: 'report-supplemented', reportId: r.id }; });
    },
    fileReport: function (data, p) {
      var err = validate.text(p.text, 4); if (err) return { data: clone(data), effect: { type: 'invalid', errors: { text: '请填写至少4字的举报内容' } } };
      if (!(p.who && p.who.length)) return { data: clone(data), effect: { type: 'invalid', errors: { who: '请选择举报对象' } } };
      return withData(data, function (d) { if (!d.events[p.eventId]) return { type: 'error', message: '这个局不存在' }; var n = d.reports.filter(function (x) { return x.eventId === p.eventId; }).length + 1; var id = 'DEMO-' + NOW.toString(36).toUpperCase() + '-' + n + '-' + (++d.seq); d.reports.push(report({ id: id, eventId: p.eventId, text: p.text.trim(), who: p.who, whoName: (p.whoName || p.who.join('、')), shots: p.materials || [], status: 'submitted', createdAt: JUS.now(), updatedAt: JUS.now(), timeline: [{ status: 'submitted', at: JUS.now() }] })); return { type: 'report-filed', reportId: id }; });
    },
    submitFeedback: function (data, p) {
      var err = validate.text(p.text, 4); if (err) return { data: clone(data), effect: { type: 'invalid', errors: { text: err } } };
      return withData(data, function (d) { var id = nextId(d, 'fb'); d.feedback.push({ id: id, text: p.text.trim(), at: JUS.now(), status: 'submitted', localNo: localNo(d, 'F') }); return { type: 'feedback', id: id }; });
    },
    /* copy: the real clipboard result decides the feedback; copyFailNext simulates a refused clipboard (review panel only) */
    copyResult: function (data, p) { var d = clone(data); var fail = d.flags.copyFailNext || !p.ok; d.flags.copyFailNext = false; return { data: d, effect: fail ? { type: 'copy-failed', value: p.value, message: JUS.COPY.copyFail } : { type: 'copied', value: p.value, message: JUS.COPY.copyOk } }; },
    /* account (demo only): ends the demo session; isolated to this concept's namespace */
    endDemoSession: function (data, p) { return withData(data, function (d) { d.session = { kind: 'ended', endedAt: JUS.now(), device: d.session.device }; return { type: 'session-ended' }; }); },
    restartDemoSession: function (data, p) { return withData(data, function (d) { d.session = { kind: 'demo', startedAt: JUS.now(), device: '本机浏览器' }; return { type: 'session-started' }; }); }
  };

  /* V27 入局 visual / motion tokens (reference only; concepts design their own language but may consult these for continuity) */
  JUS.V27 = { fontUi: "'Noto Sans SC','Microsoft YaHei','PingFang SC',sans-serif", fontMono: "'Space Mono',monospace", fontDisplay: "'Archivo',sans-serif", ink: '#14161F', body: '#252b3a', secondary: '#535b70', accent: '#4553BE', link: '#4352bb', focus: '#4A5AD6', error: '#DA3A52', success: '#0E9B76', rule: '#d5d9e6', titlePx: 30, metaPx: 14, ctaH: 48, toastMs: 2600, sheetIn: '.42s cubic-bezier(.17,.89,.24,1)', sheetOut: '.3s cubic-bezier(.4,0,.92,.5)', rise: '.6s cubic-bezier(.16,1,.3,1)', press: 'scale(.958)' };

  /* ---------------- state index (review panel) ---------------- */
  var G = { home: '首页与资料', fav: '收藏与城市', notify: '通知与外观', rec: '记录与举报', help: '帮助与账户', seam: '跨模块接缝', edge: '边界与变体' };
  JUS.INDEX = [
    { key: 's-home', group: G.home, label: '设置首页', open: { surface: 'home' } },
    { key: 's-home-attention', group: G.home, label: '首页 · 有需要处理的项', open: { surface: 'home' } },
    { key: 's-profile', group: G.home, label: '个人资料', open: { surface: 'profile' } },
    { key: 's-profile-edit', group: G.home, label: '编辑资料', open: { surface: 'profile-edit' } },
    { key: 's-profile-invalid', group: G.home, label: '编辑资料 · 校验失败', open: { surface: 'profile-edit', state: 'invalid' } },
    { key: 's-profile-saved', group: G.home, label: '资料已保存', open: { surface: 'profile', state: 'saved' } },
    { key: 's-profile-fresh', group: G.home, label: '新用户 · 邮箱未填写', variant: 'fresh', open: { surface: 'profile' } },
    { key: 's-profile-code', group: G.home, label: '编辑资料 · 邮箱验证码', open: { surface: 'profile-edit', state: 'code' } },
    { key: 's-profile-code-expired', group: G.home, label: '编辑资料 · 验证码已过期（时钟推进）', open: { surface: 'profile-edit', state: 'code-expired' } },
    { key: 's-fav', group: G.fav, label: '收藏的局', open: { surface: 'favorites' } },
    { key: 's-fav-detail', group: G.fav, label: '收藏 · 活动详情', open: { surface: 'favorite-detail', id: 'hotpot' } },
    { key: 's-fav-joined', group: G.fav, label: '收藏 · 已报名的局（速写）', open: { surface: 'favorite-detail', id: 'sketch' } },
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
    { key: 's-record-absent', group: G.rec, label: '记录详情 · 未出席记录（待核实）', open: { surface: 'record-detail', id: 'rec-hike2' } },
    { key: 's-record-dispute', group: G.rec, label: '出席异议 · 填写', open: { surface: 'record-dispute', id: 'rec-hike2' } },
    { key: 's-record-exit', group: G.rec, label: '记录详情 · 主动退出', open: { surface: 'record-detail', id: 'rec-karaoke' } },
    { key: 's-record-appeal', group: G.rec, label: '信用申诉 · 填写', open: { surface: 'record-appeal', id: 'rec-karaoke' } },
    { key: 's-record-supplement', group: G.rec, label: '补充记录 · 填写', open: { surface: 'record-supplement', id: 'rec-hike2' } },
    { key: 's-records-empty', group: G.rec, label: '记录 · 空态', variant: 'empty', open: { surface: 'records' } },
    { key: 's-reports', group: G.rec, label: '我的举报', open: { surface: 'reports' } },
    { key: 's-report-needmore', group: G.rec, label: '举报详情 · 需补充', open: { surface: 'report-detail', id: 'DEMO-MWZK1A-1' } },
    { key: 's-report-supplement', group: G.rec, label: '举报补充 · 填写', open: { surface: 'report-supplement', id: 'DEMO-MWZK1A-1' } },
    { key: 's-report-received', group: G.rec, label: '举报详情 · 已受理', open: { surface: 'report-detail', id: 'DEMO-MWRQ7C-1' } },
    { key: 's-report-file', group: G.seam, label: '我的局 · 举报填写（周五爵士小酒馆）', open: { surface: 'seam-report', id: 'jazz' } },
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
    { key: 's-fail', group: G.edge, label: '保存失败 · 重试', open: { surface: 'profile-edit', state: 'fail' } },
    { key: 's-unsaved', group: G.edge, label: '编辑中返回 · 未保存确认', open: { surface: 'profile-edit', state: 'unsaved' } },
    { key: 's-kb', group: G.edge, label: '编辑资料 · 键盘弹出（输入可见）', open: { surface: 'profile-edit', state: 'kb' } }
  ];
})(typeof window !== 'undefined' ? window : this);

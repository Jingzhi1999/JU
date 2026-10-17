# 「我的局」十套 → 「设置」模块 · 接缝抽取（extract-myju-settings v1）

> 审计对象：仓库 `/home/user/JU`，HEAD `61cb4f0a`（"C08 repeat-copy fix; canvas v7; final record state"；记录文档 §0 写的 `6013a1e` 是记录生成时的 HEAD，之后又提交了一次）。
> 来源优先级：`src/core/ju-data.js`（数据与引擎，唯一事实源）> `spec/state-inventory.md` / `spec/concept-contract.md` / `spec/ju-data.spec.md` > `concepts/src/CNN.dc.html`（十套源文件；`concepts/project/*.dc.html` 与 `JU-My-Ju-Fable51-10-Concepts.html` 都是构建产物）> `JU-MY-JU-PROJECT-RECORD.md`（用户要求与验证分级）> `evidence/CNN/*.md`（代理评审，非验收）。
> 读法：`文件:行` 为本次抽取时的行号；代码片段为节选（`…` 表示省略），文案为原文。本文不改任何既有文件。

---

## 0. 一页结论

1. **没有任何账户级对象**。数据只有 `data.joined[].records[]`（每条 `{kind, text, at}`），没有 `reports[]`、没有举报 id / 状态、没有信用计数、没有偏好、没有持久化（`src/core/ju-data.js:153`、`:281`；`localStorage` 在 `src/` 与 `concepts/src/` 中 0 次出现）。「设置」要承接的「我的举报 / 我的记录 / 申诉 / 进度」在本轮全部是**惰性文字**。
2. **十套的「举报」写法互不一致**：七套写 `kind:'report'`，C02 写 `kind:'note'`，C06 没有举报层；文本有固定句（C01 `你提交了一条举报 · 已受理`）、拼接句（C04 `举报已受理：{text}（涉及 …）· 截图 N 张`）、丢掉「谁」的（C05 / C09）、只存在视图态的回执（C08 `accepted`）。设置模块若要列「我的举报」，不能靠解析这些 `text`，必须自己定义对象。
3. **复制微信十套都是假成功**：`navigator.clipboard.writeText(...).catch(()=>{})` 之后无条件 `已复制` + toast `微信号已复制`（如 `concepts/src/C01.dc.html:1505`）；清单要求的失败文案「未能复制，请长按微信号手动复制」（`spec/state-inventory.md:147`）与 `ds_states` 的 `fail-copy` 开关（`spec/ju-data.spec.md:207`）无一实现（`复制失败|长按` 在十套中 0 次）。
4. **没有收藏 / 书签 UI**：`收藏|bookmark|fav|★|☆|星|heart|关注|标星` 在十套中 0 次命中（C03 的 `landing bookmark` 是返回落点标记，C05 的 `.c05-pin` 是裁片上的别针装饰，均非功能）。
5. **「设置」在本轮只是底部导航上一个静态字（C02–C10），C01 没有底部导航**；契约允许静态渲染「找局 / 开局 / 我的局 / 设置」（`spec/concept-contract.md:137`）；`spec/limits.md:11` 明确「不含 … 登录、设置」。
6. 用户**没有认可或否定任何一套**（记录 §1.2 "无"）；对本轮有效的否定全部来自开场简报，见 §5 / §C。

---

## 1. 数据模型（`src/core/ju-data.js`）

### 1.1 时钟、时区、格式

| 项 | 事实 | 位置 |
|---|---|---|
| 「现在」 | `var NOW = t('2026-12-17T15:00'); JU.NOW = NOW;` 固定，不走动 | `ju-data.js:20` |
| 时间解析 | `t(iso)` 用 `Date.UTC(...)` 解析 `YYYY-MM-DDTHH:MM`；全部字段都是**无时区的本地字面值**，按 UTC 运算只为避开浏览器时区；没有 `tz` 字段 | `ju-data.js:19` |
| 时区文案 | 规格要求「全部纽约本地时间；弹层写 `纽约时间`；不随浏览器 locale 变」 | `spec/ju-data.spec.md:12` |
| 显示格式 | `fmt.when(iso)` → `{en:'SAT 12.19 · 20:30', zh:'周六 12.19 · 20:30', md, time, wdEn, wdZh, wd1, date:'12月19日', long, meeting:'HH:MM 门口'(−10 min), month, day, hour, minute, iso}` | `ju-data.js:25-30` |
| 地点 | `fmt.place('Brooklyn-威廉斯堡')` → `{area:'Brooklyn', hood:'威廉斯堡', full:'Brooklyn · 威廉斯堡'}`；**没有 city 字段**，城市即 `loc` 的 `-` 前半 | `ju-data.js:31` |
| 其余 | `left(ms)` `HH:MM:SS`、`leftShort`、`ago(ms)`（刚刚 / N 分钟前 / N 小时前 / N 天前）、`abs(ms)` `M.DD HH:mm`、`deadlineCopy`、`seatLine`、`isoAdd` | `ju-data.js:32-38` |

### 1.2 人物（唯一的「账户」数据）

```js
// ju-data.js:45
var YOU = { id: 'you', name: '阿禾', wx: 'ahe_ju' };
// ju-data.js:46-55  APPLICANTS = [{ id:'ap-xiaoman', nick:'小满', wx:'xm_01', note:'第一次来，会带一副牌', verified:true, mail:'xiaoman@nyu.edu', appliedAt }, … ap-kiki / ap-ajiang / ap-momo / ap-leon / ap-ivy / ap-xixi / ap-akuan]
```

- `data.you` 是 `YOU` 的深拷贝（`:153`）。参加侧显示「阿禾」，发起侧显示「你」（`hmem('你','confirmed',{host:true,slot:0})`，`:130`）。
- 规格：「不提供的字段：信用分 / rep / 等级 / 参加次数」（`spec/ju-data.spec.md:16`）。**设置模块可用的账户字段只有 `you.name` 与 `you.wx`**。

### 1.3 事件（`EVENTS[id]`）

```js
// ju-data.js:59
function ev(o) { return Object.assign({ version: 1, status: 'open', joinMode: 'application', pack: 'invite', cat: 'food', fee: '', note: '' }, o); }
// ju-data.js:62  brunch: ev({ id:'brunch', title:'周六早午餐 · 只聊不卷', en:'SLOW BRUNCH', pack:'invite', cat:'food', iso:'2026-12-19T11:30', loc:'Brooklyn-威廉斯堡', host:{ name:'阿檬', wx:'ameng.nyc' }, capacity: 3, note:'…' })
// ju-data.js:81  bar: ev({ id:'bar', …, host: YOU, capacity: 5, hosted: true, … })
// ju-data.js:82  bbq: ev({ …, version: 2, establishedAt: NOW - 30*H, proposal: { oldIso:'2026-12-20T17:00', at: NOW - 6*H } })
```

| 字段 | 取值 | 备注 |
|---|---|---|
| `id` | 无前缀英文词：`brunch` `livehouse` … `hostpicnic`；变体派生 `bbq2` `climb2` `hike2` `bookclub2` | 规格建议的 `j-*` / `h-*` / `d-*` 前缀**未采用**（`spec/ju-data.spec.md:1` 注："实际演示数据与引擎以 ju-data.js 为准 … 键名略有出入"） |
| `status` | `open` / `ended`（+`endedAt`）/ `cancelled`（+`cancelledAt`） | `:71-74`, `:83`, `:88` |
| `joinMode` | `application` / `direct` | 直接留位的局没有申请区 |
| `pack` | `invite` `riso` `acid` `street` `grain` `mono`（旧产品卡面家族，`:58` 注释） | 概念各自映射色板 |
| `cat` | `food` `night` `sport` `culture` `shop` `game` | |
| `capacity` | 3–6，**含局主** | `need = capacity − 1` |
| `version` | 改期 +1（`propose`，`:285`）；票只对当前版本有效 | |
| `establishedAt` / `proposal{oldIso,at}` / `hosted:true` | 局主侧事实 | |
| `LONG` | `long` 变体替换 `brunch` / `livehouse` / `bar` 的 title 与 loc | `:90` |

### 1.4 参加者条目与 `records`

```js
// ju-data.js:94
function joinItem(eventId, stage, extra) { return Object.assign({ eventId, stage, members: [], queue: [], ticket: null, deadline: null, queuePos: 0, attendance: null, records: [], contactAdded: false }, extra || {}); }
// ju-data.js:93  mem(name, status, extra) → { id:'m-N', name, status }   status ∈ host / confirmed / invited / open / released / exited ；成员可带 you:true, deadline
```

- `stage` 枚举（`STAGE`，`:168-187`）：`pending invited invited_queue waitlist gathering tear contact going reschedule ended cancelled rejected withdrawn exited declined expired released queue_left`。每个 stage 带 `label / group(act|soon|wait|kept|closed) / tone / object(card|ticket|stamp|spine) / need / cta / detailTitle`。`exited` 与 `declined` 的 label 同为「已退出」，靠 `need` 区分（契约 §10 `:136`）。
- `ticket`：`{ version, torn, tornAt?, void? }`；`reschedule`：`{ oldIso, newIso, at?, answered? }`；`attendance`：`null | 'present' | 'absent' | 'pending'`；`leftAt / appliedAt / decidedAt / acceptedAt / endedAt / cancelledAt`。
- **`records[]` 形状**：`{ kind, text, at }`，无 id、无状态、无作者字段。演示数据里的三种 kind：

```js
// ju-data.js:105  jazz   records: [{ kind:'attendance', text:'局主记录：出席', at: t('2026-12-13T10:20') }]
// ju-data.js:119  karaoke records: [{ kind:'exit', text:'主动退出 · 已告知局主', at: t('2026-12-11T15:00') }]
// ju-data.js:123  hike2  records: [{ kind:'attendance', text:'局主记录：未出席 · 待核实', at: … }, { kind:'note', text:'你补充：当天高烧，已私信局主', at: … }]
```

  第四种 `kind:'report'` 只由概念写入（§3）。`records` 只存在于 `data.joined[]`；`data.hosted[]` 没有 records（局主侧的「轨迹」是成员上的 `trail`）。

### 1.5 局主条目

```js
// ju-data.js:128-130
function hmem(nick, status, extra) { return Object.assign({ id:'h-N', nick, status, wx:'', torn:false, contactAdded:false, attendance:null, trail:[], reschedule:null }, extra); }
function app(i, status) { return Object.assign({}, APPLICANTS[i], { status: status || 'pending' }); }
function hostItem(eventId, extra) { return Object.assign({ eventId, applications:[], members:[hmem('你','confirmed',{host:true,slot:0})], queue:[], leaves:[], handled:[] }, extra); }
```

- `members[].status` ∈ `confirmed / invited / declined / expired / exited`；`reschedule` ∈ `null / 'ask' / 'accepted' / 'declined'`；`trail[] = {v:'present'|'absent'|'pending', at}`（更正留痕，`attend` 追加，`:288`）。
- `applications[].status` ∈ `pending / approved / rejected / cancelled`；`handled[]` = 本次已处理的 appId（`appsToShow` 口径，`:257`）。
- `queue[] = {nick, joinedAt}`；`leaves[] = {nick, kind, at}`，kind 文案表 `{ expired:'预留到期', released:'放弃预留', declined:'拒绝改期', exited:'主动退出', withdrawn:'已撤回', rejected:'未通过' }`（`:257`）；`cancelAffected {confirmed, reserved, queue, pending}`（`:144`, `:286`）。
- 派生：`derive.hostRow` → `section ∈ todo / resched / recruit / formed / ended / cancelled`、`key ∈ cancelled/ended/review/reschedule/formed/recruit`、`life`、`label`、`status`、`cta`（`:214-231`）；`derive.manage(data,id)` 给 H1 全部区块（`:246-257`）。

### 1.6 草稿

```js
// ju-data.js:147-148
draftsDefault() → [{ id:'draft-reading', title:'雨天读书局', en:'RAINY READ', pack:'invite', iso:null, loc:'Brooklyn-公园坡', capacity:4, joinMode:'application', missing:['日期','时间'], updatedAt: NOW - 3*24*H, source:null }]
draftsMore()    → [{ id:'draft-hotpot', title:'冬至火锅 · 各带一样菜', iso:'2026-12-21T18:30', loc:'Queens-法拉盛', capacity:6, missing:[] , … }, { id:'draft-untitled', title:'', …, missing:['局名','日期','时间','地点'], source:{ title:'自然酒小试 · 四款' } }]
```

删除 / 撤销：`deleteDraft` 把草稿放进 `d.undo = {draft, index, at}`（`:289`），`undoDelete` 原位插回（`:290`），`commitUndo` 清空（`:291`）。

### 1.7 变体与基础状态

```js
// ju-data.js:151-165
build(variant): { variant, you, events: clone(EVENTS), joined:[], hosted:[], drafts:[], flags:{ failNext:false } }
  empty → 全空；drafts → 只有 3 份草稿；single → joined[0]=brunch, hosted[0]=bar；default → 12 joined / 5 hosted / 1 draft
  many → +climb(invited_queue) +climb2(going) +bbq2(hosted)；pending → bar 8 份申请、cards 改申请制 3 份待审
  history → +7 条参加历史(hike2, bookclub2 派生) +3 条局主历史；long → LONG 替换
JU.data(variant) / JU.baseState(variant) → { variant, role:'joined', section:'current', data, view:{name:'list'} }
```

面板变体标签（`src/core/ju-review.js:8-12`）：`default 标准示例 · empty 完全空 · single 只有一场 · drafts 只有草稿 · pending 待处理较多 · many 当前较多 · history 历史较多 · long 长标题长地点`。

### 1.8 持久化：没有

- `JU.data()` 每次返回新深拷贝；`reset()` / `loadVariant()` / `jumpTo()` 都重建（`ju-review.js:55-66`）；十套同在一个文档时各自 Shadow DOM、各自实例与数据（记录 §5.3）。
- 没有 `localStorage` / `sessionStorage` / IndexedDB（`src/`、`concepts/src/` 均 0 命中）。记录 §5.3：「全部数据为本地演示数据（`JU.data`），固定时钟 … 没有真实接口、通知、分享、数据库」。
- **旧原型（v3 评审画布）的存储键**，仅供与入局 / 开局原型对 id：`JuLedger`（localStorage `JU_V26_EVENTS_1`：`event{}, status, members[], queue[], history[], application, draft, reportDraft, reports[], creditEvents[], attendance, proposal`）与 `JuMine27`（localStorage `JU_MINE27_1`：`{drafts{}, seq, profile{nick,wx}, variant27, fixturesOff}`）；样例 id 形如 `demo:mine27:ramen`（`spec/extracts/extract-data.md:9-10`、`extract-review.md:108`）。本轮**没有沿用**这些键与 id。

### 1.9 演示数据清单（id 与旧规格 id 的对照见 §B）

参加侧（`joined`，`ju-data.js:95-126`；变体列为空 = default 即有）：

| id | title | loc | iso | capacity · host | stage | 变体 | 备注 |
|---|---|---|---|---|---|---|---|
| brunch | 周六早午餐 · 只聊不卷 | Brooklyn-威廉斯堡 | 2026-12-19T11:30 | 3 · 阿檬 | invited | | deadline NOW+4h21m；确认即成局 → 出票（契约 §10） |
| livehouse | 周四 Livehouse · 散场后吃宵夜 | Brooklyn-布什维克 | 2026-12-18T21:30（v2；旧 20:30） | 5 · 老杨 | reschedule | | 票 v1 已撕、已加微信 |
| run3k | 公园慢跑 3K · 跑完喝咖啡 | Manhattan-中央公园 | 2026-12-20T09:00 | 6 · Nina | tear | | joinMode direct |
| coffee | 手冲咖啡品鉴 · 三款豆子 | Queens-阿斯托利亚 | 2026-12-21T15:00 | 4 · 蛋挞 | contact | | |
| theater | 外百老汇小剧场 · 一起看《海鸥》 | Manhattan-西村 | 2026-12-19T19:30 | 4 · 花卷 | going | | |
| sketch | 周末速写 · 画人不画景 | Brooklyn-DUMBO | 2026-12-27T14:00 | 5 · 小面 | pending | | |
| vintage | 古着淘货 · 下东区三家店 | Manhattan-下东区 | 2026-12-26T13:00 | 4 · Kiki | waitlist | | queuePos 2 |
| dimsum | 法拉盛早茶 · 周日十点 | Queens-法拉盛 | 2026-12-21T10:00 | 5 · 阿宽 | gathering | | |
| jazz | 周五爵士小酒馆 · 第二场 | Manhattan-哈莱姆 | 2026-12-12T22:00 | 4 · 老杨 | ended | | attendance present；records: attendance |
| mahjong | 周末麻将 · 不赌钱 | Queens-埃姆赫斯特 | 2026-12-14T15:00 | 4 · 阿宽 | rejected | | |
| ramen | 深夜拉面 · 吃完散步回家 | Manhattan-东村 | 2026-12-15T23:00 | 4 · 西西 | cancelled | | 票 void |
| boardgame | 桌游夜 · 新手局 | Brooklyn-公园坡 | 2026-12-16T19:00 | 6 · Ivy | queue_left | | |
| climb | 新手攀岩 · 周三晚上 | Brooklyn-绿点 | 2026-12-24T19:00 | 4 · Leon | invited_queue | many | |
| climb2 | 新手攀岩 · 周五场 | Brooklyn-绿点 | 2026-12-26T19:00 | 4 · Leon | going | many | 派生自 climb |
| pottery | 陶艺体验 · 拉坯一次 | Brooklyn-红钩 | 2026-12-10T14:00 | 4 · Nina | withdrawn | history | |
| karaoke | K 歌 · 只唱老歌 | Queens-法拉盛 | 2026-12-11T21:00 | 6 · 花卷 | exited | history | records: exit |
| picnic | 秋末野餐 · 各带一样 | Manhattan-中央公园 | 2026-11-29T12:00（v2） | 6 · 蛋挞 | declined | history | |
| hike | 熊山徒步 · 早班车 | Upstate-熊山 | 2026-12-06T07:30 | 5 · Leon | expired | history | |
| bookclub | 读书会 · 《房思琪》 | Brooklyn-公园坡 | 2026-12-05T19:00 | 5 · 小面 | released | history | |
| hike2 | 熊山徒步 · 第二次 | Upstate-熊山 | 2026-11-22T07:30 | 5 · Leon | ended | history | attendance absent；records: attendance + note |
| bookclub2 | 读书会 · 《秋园》 | Brooklyn-公园坡 | 2026-11-14T19:00 | 5 · 小面 | ended | history | attendance null（局主未记录） |

发起侧（`hosted`，`ju-data.js:131-146`）：

| id | title | loc | iso | capacity | section / key | 变体 | 备注 |
|---|---|---|---|---|---|---|---|
| bar | 周五小酒馆试营业 | Manhattan-东村 | 2026-12-19T20:30 | 5 | todo / review | | 申请：小满 ✓ Kiki ✓ 阿蒋 待审 Momo 待审 |
| museum | 看展搭子 · 现代馆 | Manhattan-中城 | 2026-12-16T13:00 | 4 | todo（出席）+ ended | | endedAt NOW−20h；小满 present |
| bbq | 阳台烧烤 · 自带肉 | Queens-长岛市 | 2026-12-21T16:00（v2；旧 12-20T17:00） | 4 | resched | | 小满 accepted · Momo ask · 阿蒋 declined |
| wine | 自然酒小试 · 六款 | Brooklyn-威廉斯堡 | 2026-12-23T19:30 | 5 | formed | | establishedAt NOW−10h |
| cards | 德州扑克新手桌 | Queens-阿斯托利亚 | 2026-12-28T20:00 | 6 | recruit | | direct；候补 西西 · 小满；leaves Momo expired |
| bbq2 | 阳台烧烤 · 第二场 | Queens-长岛市 | 2026-12-28T16:00 | 4 | recruit | many | |
| hostwine2 | 自然酒小试 · 四款 | Brooklyn-威廉斯堡 | 2026-12-04T19:30 | 5 | ended | history | 四人 present |
| hostcards2 | 德州扑克新手桌 · 第一期 | Queens-阿斯托利亚 | 2026-11-20T20:00 | 6 | ended | history | 阿蒋 absent，trail pending→absent |
| hostpicnic | 河边野餐 · 下雨取消 | Brooklyn-多米诺公园 | 2026-11-15T12:00 | 6 | cancelled | history | cancelAffected {2,1,1,0} |

草稿：`draft-reading`（default）；`draft-hotpot` `draft-untitled`（drafts 变体，`:147-148`）。

---

## 2. 引擎（`JU.engine`）与设置相关的接缝

### 2.1 返回形状与失败武装

```js
// ju-data.js:265-266
function fail(data, message) { return { data: data, effect: { type: 'error', message: message } }; }
function withData(data, fn) { var d = clone(data); if (d.flags.failNext) { d.flags.failNext = false; return fail(d, '本机保存失败，请重试'); } var eff = fn(d) || {}; return { data: d, effect: eff }; }
// ju-data.js:292   setFailNext(data, {on}) → { data, effect:{type:'flag'} }
// ju-review.js:46  p.armFail = function () { this.setState(function (s) { return { data: JU.engine.setFailNext(s.data, { on: true }).data }; }); };
// ju-panel.html:26 <button … onClick="{{panel.armFail}}">下一次保存失败</button>
```

- 所有动作 `(data, payload) → { data, effect }`，`data` 是新深拷贝；`effect.type === 'error'` 时 UI 显示失败态与重试（契约 §10 `:128`、`:133`）。`armFail` 是**一次性**：下一次任何写入失败一次。
- 全部 `effect` 类型（`:272-292`）：`confirmed{formed}` `released` `queue_left` `withdrawn` `torn` `contacted` `reschedule-accepted{stage}` `reschedule-declined{burn}` `exited{burn}` `record-added` ｜ `invited{appId,nick,slot}` `rejected{appId,nick}` `proposed{asked,oldIso,newIso}` `cancelled{affected,burn}` `ended{toRecord}` `attended{memberId,value,correction}` / `noop` `draft-deleted{draftId,title,index}` `draft-restored{draftId}` `undo-expired` `flag` `error{message}`。
- 引擎自带的拒绝文案（`effect.type:'error'`，不经 `failNext`）：`这份申请已经处理过。` `名额已满，暂时不能再发邀请。` `候补里有人排在前面，按顺位先邀请。` `选好新的日期和时间。` `新时间和原时间一样。` `上一次改期还有人未答复。` `还没成局，不能记为散场；可以取消这场。` `改期还有人未答复，先等答复。` `散场后才能记录出席。` `只为已确认的成员记录出席。` `草稿已不存在。` `没有恢复成功`。

### 2.2 产生记录 / 举报 / 退出 / 出席的动作

```js
// ju-data.js:281
addRecord: function (data, p) { return withData(data, function (d) { var it = jitem(d, p.eventId); it.records = (it.records || []).concat([{ kind: p.kind || 'note', text: p.text, at: NOW }]); return { type: 'record-added', eventId: p.eventId }; }); },
// ju-data.js:280  exitEvent … it.records = (it.records || []).concat([{ kind: 'exit', text: '主动退出 · 已告知局主', at: NOW }]); return { type:'exited', eventId, burn: !!it.ticket };
// ju-data.js:288  attend … var correction = !!m.attendance; m.attendance = p.value; m.trail = (m.trail || []).concat([{ v: p.value, at: NOW }]); return { type:'attended', …, correction };
```

- `addRecord` 是**唯一**的「举报 / 补充」出口：参数只有 `eventId / kind / text`；写到参加者条目；只对存在于 `data.joined` 的 eventId 有效（`jitem` 找不到会抛错 —— 没有防护）。没有「出席异议」动作：异议只能是 `kind:'note'` 的文字。
- 「主动退出每年 4 次」只是文案（`JU.RULES` credit 行，`:298`；`JU.COPY.exit.body`，`:304`），数据里没有计数器；可数的只有 `records` 中 `kind:'exit'` 的条数（演示里仅 karaoke 一条）。
- 复制微信**没有引擎动作**，纯视图行为（§3）。撤销：`deleteDraft → undoDelete / commitUndo`，配合 `holdKey('undo', 10000, …)`（契约 §11 `:142`）。

### 2.3 共享文案中与设置有关的

```js
// ju-data.js:323
historyFooter: { lead: '散场后遇到问题，或对记录有异议', links: ['补充这局的记录', '对出席记录提出异议'] }
// ju-data.js:314-315  contactNote: '撕券后 8 小时内联系局主。此处为示例微信。'   contactedNote: '已加微信 · 等这次见面。'
// ju-data.js:313      attendanceHelp: '未出席是待核实的事实，不等于故意缺席，也不会自动处罚；可随时更正，更正会留下记录。'
```

`JU.COPY` 里**没有**「举报」「设置」「帮助与反馈」「查看进度」「查看我的记录」的共享文案——这些句子全部由各概念各自硬编码（§3），因此措辞不一。

### 2.4 定时器约定（新模块必须沿用）

`this.after(ms, fn)`（随速度缩放、减少动态下 0ms）、`this.hold(ms, fn)`（真实时间窗：toast 2600 / 撤销 10000 / 已复制 1800–2600）、`this.holdKey(key, ms, fn)` / `cancelKey(key)`（同类窗口一次只一个）、`this.motion(name, fn)` + `beforeReplay(name)`、`this.reset()`、`this.jumpTo(key) → applyJump(e)`（`ju-review.js:22-66`；契约 §2 `:80`、§11 `:141-142`）。

---

## 3. 十套逐一：举报 · 回执 · 记录 · 异议 · 账户级入口 · 复制 · 收藏

| 方案 | 举报写入（`engine.addRecord` 载荷） | 回执 / 受理结果（原文） | 「查看我的记录」 | 「补充这局的记录」 | 「出席异议」/ 历史页脚 | `copyWx` 失败处理 | 收藏 |
|---|---|---|---|---|---|---|---|
| C01 票据卷 | `{kind:'report', text:'你提交了一条举报 · 已受理'}` **固定句**；表单收集 ≥4 字 note 与「谁」chips 但不写入；每局只能举报一次（`reported` → `canReport:false`）`C01.dc.html:1500-1503, 1636-1641, 1561, 1575` | 回执块 `JU · 举报回执 / 已受理 / 可在“设置 → 帮助与反馈”查询进度。` + 惰性 `查看进度 ›`（title `查看进度在「设置 → 帮助与反馈」里，不在本范围内`）`:867` | 无 | 无单独输入（slip 内 note 不写入） | 历史页脚 `— 本卷到此 · JU —` / lead + `可在设置里补充或申诉` `:1360`；无「异议」字 | 假成功：`try{ navigator.clipboard.writeText(wx).catch(()=>{}) }catch{}` → `已复制` + `微信号已复制` 2200ms `:1505` | 无 |
| C02 站牌 | **没有「举报」**：按钮 `不对劲？补充记录` → `{kind:'note', text:'你补充：'+text+'（涉及 A、B）'}` `:968, 1444-1446`；sheet 注 `截图 ≤6 · 本范围不演示上传。受理后可在“设置 → 帮助与反馈”查询进度。` `:1189`；按钮 `提交记录` `:1192` | 详情 result 行 `已受理 · 可在“设置 → 帮助与反馈”查询进度` `:1446`；无「查看进度」 | 无 | 同上（合并进「补充记录」） | 历史 footer 字符串 `lead · 补充这局的记录 / 对出席记录提出异议 · 账户级记录页不在本范围演示` `:1594` | 假成功；详情内不出 toast，读卡器显示 `已复制 · COPIED` `:1282` | 无 |
| C03 刊 | `{kind:'report', text:'局内记录：'+text+' · 涉及 A、B'}` `:1346`；sheet kicker `局内记录 · 举报`，标题 `说说发生了什么`，`添加截图` 惰性 `:1605, 1055-1059` | sheet 内 `已受理 / 可在“设置 → 帮助与反馈”查询进度。` + 惰性 `查看进度` `:1053` | 惰性 `查看我的记录 / 账户级 · 不在本范围` `:788` | 输入 `补充一句记录（≥4 字）` + `补充记录` → `{kind:'note', text:'你补充：'+text}` `:786, 1345` | 页脚 `lead · 补充记录或申诉（设置 · 账户级）` 惰性 `:1002, 1426` | 假成功 2600ms `:1344` | 无（`landing bookmark` = 返回落点标记 `:209`） |
| C04 夜玻璃 | `{kind:'report', text:'举报已受理：'+text+'（涉及 …）'+' · 截图 N 张'}`；截图计数 0–6 为**假计数**（`shots` 只是数字）`:1767-1773, 2190-2192`；errMsg `提交失败，内容已保留。请重试。` | 层内 `已受理` 章 + `举报已受理` / `可在“设置 → 帮助与反馈”查询进度。` + 惰性 `查看进度 · 不在本范围演示` `:1474` | 无 | 输入 → `{kind:'note', text:'你补充：'+text}` `:1763` | 历史页脚 `散场后遇到问题，或对记录有异议 / 补充这局的记录 · 对出席记录提出异议 / （在「设置」里处理 · 不在本范围演示）`（span，不可点）`:1003` | 假成功 1800ms `:1761` | 无 |
| C05 缝线 | `{kind:'report', text:'举报已受理：'+text}`；「谁」chips 可选但**不写入** `:1546, 1545` | 行内 `已受理 · 可在“设置 → 帮助与反馈”查询进度。` + disabled `查看进度 › 不在本范围`；提交前 hint `提交后会受理，可在设置里查进度` `:980, 1543` | disabled 按钮 `查看我的记录 · 账户级` `:979` | 输入 `补充一句这局的记录` + `记下` → `{kind:'note', …}` `:977, 1541` | **无历史页脚链接**；列表脚 `— 台面到此 — / 评审样例 · 不计入真实记录与信用` `:1356` | 假成功 2200ms `:1466` | 无（`.c05-pin` 是别针装饰 `:582`） |
| C06 桌面 | **没有举报层**（`不对劲` 0 次）；只有 `补充` → `{text:'你补充：'+txt}`（无 kind → 引擎默认 `note`）`:939, 1698` | 无 | 无 | 输入 aria `补充这局的记录`、placeholder `说说发生了什么 · 只记事实` `:939` | 局内页脚 `footLead` + links：出席过 → `['对出席记录提出异议', '查看进度（设置 → 帮助与反馈）']`，否则 `['查看进度（设置 → 帮助与反馈）']`（span）`:1696-1697`；列表页脚 `lead · 在局内记录里补充，账户级申诉在设置` `:1431` | 假成功 2200ms `:1600` | 无 |
| C07 格盘 | `{kind:'report', text:'举报：'+text+'（A、B）'}` `:1479`；截图行 `本范围不演示上传` `:1087` | `已受理 · 可在“设置 → 帮助与反馈”查询进度（查看进度不在本范围）` `:1083`；按钮旁 `受理后可在设置里查进度` `:1707` | help 文字 `查看我的记录 · 账户级，不在本范围` `:928` | 输入 `补充一句` + `记录` → `{kind:'note', …}` `:920, 1706`；仅 ended / exited / cancelled 可写 `:1702-1704` | 页脚 `lead · links[0] · links[1] / 账户级记录页不在本范围演示。` `:810, 1586` | 假成功 2600ms `:1284` | 无 |
| C08 时间尺 | `{kind:'report', text:'你记录：'+text+'（A、B）'}` `:1391`；回执数据存在**组件 state `accepted`**，不在 data | 纸签 `JU. / 受理回执 · {时间} / 已受理 · 局内记录 / {局名 · when} / 引用原文 / 涉及 · … / 事实陈述 · 不评分、不自动处罚 / 可在“设置 → 帮助与反馈”查询进度。` + 惰性 `查看进度 / 设置模块 · 不在本范围演示` `:1114, 1910` | 惰性 `查看我的记录 / 账户级 · 不在本范围`（参加约定行 `:993`；未成行结果页 `nextInert` `:1644`） | 输入 `补充一句（至少 4 个字）` + `补充` `:981, 1390` | **无历史页脚链接**（尺尾 `JU · 时间尺 · 到此为止` `:1611`） | 假成功 1800ms `:1388` | 无 |
| C09 影印贴纸 | `{kind:'report', text:'举报已受理：'+txt}`；「谁」只作静态贴纸展示，不可选、不写入 `:1574, 817`；提交即关层 | 无回执层；按钮旁静态 hint `受理后可在「设置 → 帮助与反馈」查询进度` `:886`；新记录高亮 `fresh` | 无 | 输入 aria `补充这局的记录`、placeholder `补充一句事实…` + `补充` `:885, 1517` | 列表页脚 `— 本期到此 · JU — / lead · 在设置里补充或申诉（不在本范围）` `:1324` | 假成功 2200ms `:1455` | 无 |
| C10 胶片 | `{kind:'report', text:'你提交了局内记录：'+text+' · 涉及 A、B'+' · 截图 N 张'+' · 已受理'}` `:1581-1585`；截图假计数 `:1979`；failMsg `提交失败，内容已保留。请重试。` | 层内 `RECEIVED · 局内记录 / 已受理 / 可在“设置 → 帮助与反馈”查询进度。` + 惰性 `查看进度 › / 设置模块 · 不在本范围` `:1381` | 参加约定层末 `查看我的记录 › · 账户级页面，不在本范围演示` `:1367` | 输入 → `{kind:'note', text:'你补充：'+text}` `:1639` | **无历史页脚链接** | 假成功 1800ms `:1637` | 无 |

逐套补注：

- **入口标签**：`不对劲？举报 ›`（C01 C05 C09 C10）、`不对劲？举报`（C03 C04 C07 C08）、`不对劲？补充记录`（C02）、无（C06）。副文：C01 `说说发生了什么`；C04 `说说发生了什么 · 只记录事实，不评分`；C08 `局内记录 · 事实陈述`；C10 `说说发生了什么 · 只记事实`。只有 C01 / C04 / C10 给了 `data-act="report"`。
- **「谁」chips 的来源**：C01 `[局主（局主）] + seats(ok|res, !you)`（`:1638`）；C03 `members(!you)`（`:1605`）；C04 `[host（局主）] + members(confirmed,!you)`（`:2188`）；C05 `['局主 '+name] + seats(ok,!you)`（`:1538`）；C08 `members(!you, !open)`（`:1908`）；C10 `members(!you)`（`:1974`）。清单要求「`谁` chips（含 `（局主）`）」（`spec/state-inventory.md:225`）。
- **处理中 / 失败**：C01 `where:'slip', ms:420`；C02 sheet 内 `故障 · {message}` + `重试`（`:1190`）；C04 `ms:520` + errMsg；C05 `where:'hist'`（原位 alert + 重试 `:978`）；C07 sheet alert `提交失败，内容已保留` `:922`；C09 `inline:true` alert `:885`；C10 `failMsg`。核心的失败句是 `本机保存失败，请重试`（`ju-data.js:266`），各套用自己的 `failMsg` 覆盖。
- **底部导航「设置」**：C02 `:786`、C03 `:1010`、C04 `:1113`、C05 `:889`、C06 `:901`、C07 `:818`、C08 `:898`、C09 `:787`、C10 `:1015`（齿轮 SVG + 「设置」，静态 span / disabled button）。**C01 没有底部导航**（底栏是 48px 存根槽，记录 §3.1）。
- **惰性入口措辞**（设置模块可沿用其一）：`不在本范围演示`（C02 伪元素 `:139`、C06、C07、C08、C09、C10）、`不在本范围内`（C01 title）、`不在本范围`（C05、C07、C08）、`其他模块 · 不在本范围演示`（C03 C09）、`账户级 · 不在本范围`（C03 C08）、`设置模块 · 不在本范围演示`（C08 C10）、`账户级记录页不在本范围演示`（C02 C07）。契约只规定「保留文字与位置、禁用态或说明『不在本范围演示』，不跳转」（`spec/concept-contract.md:138`）。

---

## 4. 必须保留的语义（§G）与范围映射（§F）中触及设置的条目

### 4.1 `spec/state-inventory.md` §G（原文，`:271-282`）

1. 「**没有公开信用分**。任何地方不出现评分、等级、`极好 / 良好`、星级或「信用 N 分」；只陈述事实（`不占主动退出机会` / `待核实 · 未处罚`）。」
2. 「**八种「没去成」是八个不同事实**：`cancelled`（局主取消）· `rejected`（审核未通过）· `withdrawn`（撤回申请）· `exited`（主动退出）· `declined`（拒绝改期）· `expired`（预留到期）· `reservation_released`（放弃未确认预留）· `queue_left`（退出候补），各有自己的状态词与副文，不合并为「已退出」一种。」（代码里 `reservation_released` = `released`）
3. 「**`未出席` ≠ 缺席处罚**：出席是局主记录的待核实事实，可随时更正并留痕；`待定` 是主动选择，`未记录` 是没有选择；任何地方不写「扣分」「处罚」「拉黑」。」
4. 「**不发明惩罚**：唯一存在的规则是「主动退出占年度 4 次机会」（只对 `exited`）。放弃预留、到期、退候补、拒绝改期、局主取消都明确写「不占 / 不记」。」
5. 「**规则缺失处用中性事实**：… 8 小时联系窗不加倒计时、不加逾期后果。」
6. 「**局主侧数据不给参加者**：申请人留言 / 邮箱验证 / 微信、其他成员的微信与 `已自报加微信`、离开记录、候补名单真名（参加者只见 `X**`）、出席轨迹，只在 H1。参加者只在撕开有效票后看到**局主**微信。」
11. 「**`已加微信` 只是自报**：不代表对方回复或到场；散场 24 小时后双方联系入口都关闭。」
12. 「**结果出现在动作发生处**：审核结果原位替换按钮、撤销在删除之前、历史不重放盖章；只有删除草稿、复制、改期已发出才用 toast。」

### 4.2 `spec/state-inventory.md` §F（范围映射，原文行）

- 规则行 `:242`：「活动相关的 `举报 / 记录 / 申诉` 进入局内 `查看 / 补充` 表面；明显属于其他模块的入口排除并写明理由。「惰性」= 保留文字 / 位置、不响应点击、不做跳转」。
- `:260` 「举报（s08 `不对劲？举报`）| 举报层（局内）| 概念内 | `p_history` 局内记录层（事实陈述，不评分）」
- `:261` 「查看进度（举报受理后）| 设置 → 帮助与反馈 | **排除** | 其他模块；保留一句 `可在“设置 → 帮助与反馈”查询进度。`」
- `:262` 「历史页脚 `我的举报` / `信用记录 · 补充与申诉` | 设置 → reports / credit | **排除** | 跨局的账户级页面；页脚可保留 lede `散场后遇到问题，或对记录有异议` + 惰性链接；局内异议走 `p_history` 的 `补充`」
- `:263` 「参加约定 sheet 内 `查看我的记录` / `读信用` / `读赴约` | 信用记录页 | 约定层保留；记录页排除 | `参加约定 ›` 三类约定在概念内；`查看我的记录` 惰性（账户级）」
- `:264` 「底部导航 `找局 / 开局 / 设置` | 其他根页 | 惰性 | 导航可静态渲染，`我的局` 选中」
- `:266` 「评审工具条 / 代成员操作 / 样例切换 | 评审壳 | 排除（改为 `ds_*` 切换）」
- `:267` 「读取失败 `重新读取` | 本页 | 概念内 | `ds_states`」

### 4.3 举报层与复制的规格（设置要对齐的事实源）

- `p_history` 行（`:225`）：「局内记录：`不对劲？举报` → 层 `说说发生了什么`（≥4 字）· `谁` chips（含 `（局主）`）· 截图 ≤6 · 提交 → `已受理` · `可在“设置 → 帮助与反馈”查询进度。`（`查看进度` 惰性）… 提交 `提交失败，内容已保留。请重试。`」
- C5 联系信息（`:147`）：「`复制` → toast `微信号已复制`；失败 alert `未能复制，请长按微信号手动复制`」；`p_ticket`（`:223`）：「复制失败 `复制失败，请长按账号复制`」；`ds_states` 开关含 `fail-copy`（`spec/ju-data.spec.md:207`）。**十套均未实现失败分支**。
- 旧原型中「设置」的去向（语义来源，非视觉基线）：`我的举报`（settings→reports）/ `信用记录 · 补充与申诉`（settings→credit）（`spec/extracts/extract-participant.md:20`）；评审项 S13「信用入口 → settings/credit；样例计入经历 0、样例信用事实 0」（`extract-review.md:110`）；局主侧**没有**举报 / 申诉入口（`extract-host.md:92, 255`）。
- 范围声明：`spec/limits.md:11-12`「不含发现页、入局申请表单、开局编辑器、登录、设置；… 举报 / 申诉只做局内「查看 / 补充」记录层，不建设账户级系统。」

---

## 5. 用户的明确要求、认可与否定（`JU-MY-JU-PROJECT-RECORD.md`）

### 5.1 有效要求（§1.1，原文要点）

1. 「十套完整可操作的「我的局」视觉与动效方案；只做「我的局」范围；研究 ≥50 例；十套差异矩阵；打印 / 撕票 / 燃烧完整呈现；统一评审入口；最终交付主画布 + 研究附录 + 设计与覆盖附录。对 v3（Opus 5.5 最新版）与 v2.1（上一版）的视觉与动效「非常不满意」，两版都不是审美基线。」
2. 「不要把我的要求改写成主要做减法 / 只调留白 / 重点先修功能」；「不要先交三套静态图」；「不要十套都是纸票叠放，也不要十套都是冷感黑白时装网站」；「不要把要求收敛成无特征的极简白底 UI」。
3. 设计师品牌：「Junya Watanabe、Yohji Yamamoto、Rick Owens、Ann Demeulemeester、Maison Martin Margiela 只是举例 … **不要再用 Acne Studios、Gentle Monster 充当这一类别的核心样本** … 不把这一方向简化成「暗黑、黑白、粗粝、大字号」。」
4. 产品定位：「面向在美国生活的年轻华人，帮助真实线下相聚；年轻、有生活感、轻但靠谱；活动名、时间、地点、角色与下一步必须自然可读。」
5. 额度：「如果四小时额度用完了，就等四小时继续启动，一直重复直到完成」。
6. 记录文档：「维护 `JU-MY-JU-PROJECT-RECORD.md` 作为唯一主入口；按实际材料记录，不把口头汇报当验收；文档工作不替代主任务，也不代表设计已通过视觉验收；不额外授权推送 / 部署 / 重置（主任务仍按此前授权继续）。」
8. 「用户告知额度重置后「从中断处继续」… 随后用户通过 `/model` 把会话模型从 Fable 5.1 切换为 Opus 5.5 … 方案的设计意图、契约与已建成果不因换模型而改变。」

范围（§0.1）：「只做「我的局」：我参加的 / 我发起的两个身份及其局内详情、管理、弹层、票件、状态变化与返回；不做发现页、入局 / 开局流程、登录、真实接口。」「本轮优先级：第一眼吸引力与层级 > 材质 / 运动 / 空间连续 > 同方案内一致性 > 十套差异 > 本地可操作性。」「用实际截图 / 录屏核验；不以源码存在、构建成功、测试数量作为视觉合格证据；不自评高分。」

### 5.2 认可（§1.2）

「**无**。截至本文更新，用户没有审阅或认可任何一套方案、任何截图或任何动效。本文中所有「完成」均为实现状态，不是验收状态。」

### 5.3 否定（§1.3 表，原文）

| 否定项 | 出处 | 对本轮的约束 |
|---|---|---|
| v3-Opus55 与 v2.1 评审画布的视觉与动效 | 开场简报 | 其视觉、层级、卡片构造、材质、背景、动效、布局都允许重设计；只保留产品语义与范围依据 |
| 用 Acne Studios / Gentle Monster 代表「设计师品牌」 | 简报 §04 | 研究台账中未使用两者 |
| 「主要做减法 / 只调留白 / 先修功能」的解读 | 简报 §01 | 方向卡要求每套在构图、字体、组件、材质、过渡、核心动作六维上重新设计 |
| 先交三套静态图再做其余 | 简报 §01 | 本轮直接并行构建十套可操作方案 |
| 用 alert / 空白弹层 / 按钮缩放 / 跳转旧稿代替结果 | 简报 §02 | 契约硬规则；评审脚本检查 |
| 背景快速循环渐变 / 漂浮粒子 / 持续晃动 | 简报 §07 | 契约硬规则 |
| 自评「9.8/10」等分数 | 简报 §11 | 本文与最终答复不给自评分 |

§1.6：「无被取代的用户要求。v3 台账 … 与 v3 的 P1–P8 原则属于被否定版本的内部规范，本轮**不作为基线**，仅用于语义核对」。

### 5.4 主负责人（非用户）判断应保护的局部（`spec/lead-review.md:30`）

「C01 打印三段走纸、撕票纤维缝、焦卷残片；C04 撕票裂开与碎裂；C02 翻牌数字与插卡；C05 布标与线脚；C06 便签改期；C10 帧与相纸。这些在修复时应保护」——记录 §6.5 注明「以上均**不是**用户认可」。

---

## 6. 已知缺陷与跨套不一致（与设置相关）

| # | 现象 | 证据 | 对设置模块的含义 |
|---|---|---|---|
| 1 | 举报写入文本十套十样（固定句 / 拼接句 / 丢「谁」/ 丢截图 / kind 为 note / 无举报层） | §3 表；`C01.dc.html:1503`、`C02:1446`、`C05:1546`、`C09:1574`、C06 0 命中 | 「我的举报」列表不能从 `records` 解析得到；需要设置自己的对象或在核心新增 `reports[]`（改核心要对十套重跑回归，记录 §7.2） |
| 2 | 回执是视图态或一次性：C08 的 `accepted` 不进 data；C01 `reported` 由 records 推导、只能举报一次；C09 无回执 | `C08:1391, 1910`；`C01:1561-1575` | 「查看进度」没有可查的进度；回执字段（时间 / 局名 / 原文 / 涉及）只有 C08 一套齐全 |
| 3 | 复制微信假成功；无失败文案；`fail-copy` 开关未实现 | 十套 `copyWx` / `copy`；`复制失败|长按` 0 命中；回归脚本只测「已复制」停留（`tools/test/copy-regress.cjs:1-2`） | 若设置含「我的微信」等可复制项，不要沿用假成功；清单给了两句失败文案（§4.3） |
| 4 | 「查看我的记录」只在 C03 C05 C07 C08 C10；历史页脚链接只在 C02 C03 C04 C06 C07（C01 C09 为一句话；C05 C08 C10 无） | §3 表 | 入口不齐 ≠ 语义不同：§F 规定都惰性、都排除 |
| 5 | 「出席异议」只出现在 C04（span）与 C06（links），其他八套没有这四个字；清单的 `historyFooter.links[1]` 原文是「对出席记录提出异议」 | `C04:1003`、`C06:1697`、`ju-data.js:323` | 异议在数据上只能是 `kind:'note'` 记录 |
| 6 | 评审指出产品文案里混进规格注释：C02 m5「历史结果页「（只陈述，不评分）」「（找局模块，不在本范围）」」；C07 M8 扫描后仍保留「不在本范围」类说明（§10 允许） | `evidence/C02/review-1.md:105`；`evidence/C07/verify-r1.md:37` | 惰性入口的说明应是产品口吻的一句，不是括号注释 |
| 7 | 重复复制不重新计时（C10 minor 4）；C01 / C07 第二次复制回执过短已在 `61cb4f0a` 前修（holdKey） | `evidence/C10/final-verify.md:93-94`；记录 §6.8 | 用 `holdKey('copy', …)` |
| 8 | 记录 §6.3 五条：C04 底栏盖最后一组（已修，§6.7）；C01 面板外重复失败按钮；C01/C04 出票分支待重验；研究缺口；无 GPU 未测帧率 | 记录 §6.3 | 设置模块若放底栏，列表留安全区（契约 §10 `:137`） |
| 9 | 各套仍开的 minor：C01 6、C02 5、C03 1、C04 2、C05 2、C06 5、C07 3、C08 5、C09 5、C10 4（代理结论） | `evidence/CNN/final-verify.md`；记录 §6.8 | 不阻塞 |
| 10 | 记录 §7.2 的不可改项：「`src/core/*` 的 API 形状（改了要对十套重跑 `tools/coverage-matrix.cjs` 与 `tools/test/*regress*.cjs`）；被用户认可的局部」；§7.1：「在用户反馈前不要冻结任何一套为最终方案，也不要删除任何一套」 | 记录 §7 | 设置模块应**只增不改**核心；新增 API 要向后兼容 |

---

## 7. 构建与工具事实（新模块应复用）

### 7.1 `src/build.js`

- 元数据：`concepts/concepts.json`（可用 `JU_CONCEPTS` 环境变量换成另一份清单，`:10`）；每条 `{code, file, name, line, motions[3], notes}`；只装配**源文件存在且带三个标记**的条目：`<!-- @panel -->`、`/* @core */`、`/* @panel-css */`（缺标记跳过并警告，`:11, :23`）。
- 注入顺序（`:24-28`）：`<!-- @panel -->` → `<sc-if value="{{panel.show}}">` + `src/core/ju-panel.html`；`/* @panel-css */` → `ju-panel.css` + `ju-fx.css`；`<!-- @fx-svg -->` → `ju-fx.svg`；`/* @core */` → `ju-data.js + ju-fx.js + ju-review.js` + `var CONCEPT = {code,name,line,notes,motions}`；无 `<title>` 时补 `<title>CODE NAME</title>`。
- 输出：`concepts/project/CNN.dc.html`（`:33`）、`canvas.json`、`Main.dc.html`（`:35-91`）、独立画布 `JU-My-Ju-Fable51-10-Concepts.html`（`:93-128`）。`JU_STANDALONE=<path>` 时只写私有独立画布，不碰共享文件（`:31`；契约 §10 `:127`）。
- 独立画布装配：`src/shell/shell.html` 占位 `/*@shell-css*/ /*@preact*/ /*@runtime*/ /*@data*/ /*@shell-js*/`；`/*@data*/` 注入 `window.__JU_SOURCES（code→装配后源）/__JU_META/__JU_DOCS/__JU_BUILT`（`:121`）；附录由 `md()` 把 `research/ledger.md, spec/directions.md, spec/motion-specs.md, spec/coverage.md, spec/state-inventory.md, spec/limits.md, spec/concept-refs.md` 转成 HTML（`:113`）。壳的四个视图：总览 / 方案 / 对比 / 附录，`#concept/C01` 直达（`src/shell/shell.js:74-75`）；运行时 `src/runtime/dc-mini-runtime.js` + `preact.min.js`，**不是**官方 Design 画布运行时（官方画板用自带 `support.js`，记录 §4、`spec/limits.md:5`）。

### 7.2 Design 画布画板约定（`concepts/project/canvas.json`，由 build.js 计算）

```js
// build.js:36-40
const W = 780, H = 884, GX = 80, GY = 120; const perRow = 5;
boards['Main.dc.html'] = { x: 0, y: 0, w: 1240, h: 640, title: '评审入口 · 十套方案索引', is_interactive: true };
boards[c.file] = { x: col * (W + GX), y: 640 + 223 + 120 + r * (H + GY), w: W, h: H, title: `${c.code} ${c.name}`, is_interactive: true };   // 行 r = floor(index/5)
canvas.notes.row1 = { x: 0, y: 760, text: '十套「我的局」方案 · 每套 = 手机画面（390×844）+ 画面外评审面板（…）', kind: 'title1', maxW: 4220 };
```

- 实际值（`canvas.json:31-110`）：C01–C05 在 `y:983`，`x = 0 / 860 / 1720 / 2580 / 3440`；C06–C10 在 `y:1987`；全部 `w:780, h:884`。按同一公式，第 11 块会落在 `x:0, y:2991`。`canvas.json` 顶层：`v:3, createdOnFiles, title:'JU 我的局 · 十套视觉动效方案', launch:{view:'canvas'}, pages:[], notes, designSystems:[], boards, order`。
- 画板文件骨架（契约 §1 `:23-63`）：`<x-dc><helmet>…<style>body{margin:0} /* @panel-css */</style></helmet><div class="ju-stage"><div class="ju-phone"><div class="app{{panel.rootCls}}" style="--k:{{panel.k}};--frame:{{panel.frame}}" ref="{{rootRef}}">…</div><!-- @fx-svg --></div><!-- @panel --></div></x-dc>` + `<script type="text/x-dc" data-dc-script data-props='{"panel":…,"preset":{"editor":"enum","options":["joined","hosted"]},"idle":…,"$preview":{"width":780,"height":884}}'>/* @core */ class Component extends DCLogic { … } JU.mixin(Component);</script>`。手机 390×844；所有 id 带方案前缀；只用 class / 属性选择器，不用 `:root`。
- 已发布画布：`https://claude.ai/artifact/D36UTTJnXUnfpN5praq1Av`，版本 7「C08 repeat-copy fix」（记录 §0）。

### 7.3 `tools/capture.cjs`（头注释 `:1-6`）

「`node tools/capture.cjs <CODE> <outdir> '<json actions>' [--w 1000] [--h 1000] [--clip x,y,w,h] [--cols 6] [--scale 300]`；env `JU_STANDALONE=<path>` targets a private build … screenshots cost ~150ms each, so use `{"speed":0.5}` rather than tiny "every"; clip-path'd drag targets only receive pointer events inside their polygon → use `"at":[dx,dy]` from the element centre; prefer overlay-scoped selectors (e.g. `.c03-over .c03-btn`) because querySelector returns the FIRST match … actions: `[{"click":"css inside shadow root"},{"wait":400},{"shots":5,"every":250},{"jump":"state-key"},{"drag":{"from":"css","to":[dx,dy],"steps":8,"shots":true}},{"eval":"js using root, inst"},{"speed":0.5},{"shot":true},{"fontwait":true}]`」。实现要点：打开独立画布 `#concept/CODE`，定位 `.stage-host[data-code=CODE]` 的 shadowRoot 与 `.ju-phone` 矩形为默认裁切（`:20`）；实例取 `window.JUShell.mounts.stage['stage:' + code + ':'].instance`（`:29-31`）；收集 `pageerror` 与 console error 到 `log.json`；用 ffmpeg 拼 `sheet.png`（`:37`，需 `-reinit_filter 0`）。依赖 Playwright 于 `/opt/node-tools/node_modules/playwright`。
- `tools/coverage.cjs`：对 `JU.INDEX` 全部 50 个 key 逐一 `jumpTo` 截图 → `outdir/<key>.png` + `sheet.png` + `log.json`，`--only j-|h-|b-`（`:1-2`）。`tools/coverage-matrix.cjs`：对 `concepts.json` 中有源文件的每套跑 coverage，写 `evidence/CNN/coverage-matrix/` 与 `spec/coverage.md`（`:1-2, 12, 24`）。
- 回归（记录 §7 末）：`node src/build.js → node tools/coverage-matrix.cjs → node tools/test/rm-undo-sweep.cjs → node tools/test/timer-regress.cjs → node tools/test/copy-regress.cjs → node tools/test/standalone.cjs`。脚本依赖的选择器约定（契约 §10 `:135`）：覆盖层根 `cNN-over`；行 `data-rid="{{row.id}}"`；`data-act="confirm|release|tear|contact|copy|contacted|accept|decline|withdraw|exit|approve|reject|propose|cancel|end|attend-present|attend-absent|attend-pending|delete|undo|back|close"`（概念另加了 `report / note / submit / retry / shot / rules / flip`）。
- 其他：`tools/motion-specs.cjs` 把 `spec/motion/CNN.md` 汇总为 `spec/motion-specs.md`；`tools/shrink-sheets.py` 把入库 PNG 压到 ≤1400px / 256 色；`.gitignore` 排除 `.build/` 与 `evidence/**/{review-*,fix-r*,verify-r*}/**/f[0-9]*.png`。
- 记录文档：`tools/record/build-record.py` 用 `tools/record/body.md`（手写正文）+ `research/ledger.json` + `evidence/` 树 + git 状态生成 `JU-MY-JU-PROJECT-RECORD.md`（占位 `{{NOW}} {{RESEARCH_TABLE}} {{EVIDENCE_C01}} {{GIT_LOG}} {{GIT_STATUS}} {{BRANCH}} {{HEAD}} {{SIZES}} {{SRCS}} {{MOTION_SPECS}}`）；运行 `python3 -I tools/record/build-record.py`；**改正文只改 `body.md`**（记录文件头注）。
- 工作流脚本：`tools/workflow-build-concepts.js`（Map → Build → Review → Fix）、`tools/workflow-lead-fix.js`（Fix → Verify）；均以 `concepts.json` 为清单。

---

## A. 「我的局」留给「设置」的接缝

| 入口 | 所在方案 | 当前状态 | 应落到设置的哪个对象 |
|---|---|---|---|
| 举报回执里的「查看进度 ›」/「可在“设置 → 帮助与反馈”查询进度。」 | C01 C03 C04 C05 C07 C08 C10（回执层）；C02（result 行）；C09（静态 hint） | 惰性文字；回执为视图态；无进度数据 | 设置 › 帮助与反馈 › 我的举报（列表 + 状态 `已受理`…）；数据侧需要新对象 `report {id, eventId, text, who[], shots, at, status}` —— 本轮不存在 |
| 历史页脚 `散场后遇到问题，或对记录有异议` → `补充这局的记录` / `对出席记录提出异议` | C02 C03 C04 C06 C07（文字 / span）；C01 C09（`可在设置里补充或申诉`）；C05 C08 C10 无 | 惰性；`JU.COPY.historyFooter`（`ju-data.js:323`） | 设置 › 我的记录 › 申诉 / 补充（账户级、跨局）；局内补充仍在我的局（`addRecord kind:'note'`） |
| 参加约定层 / 详情里的「查看我的记录」 | C03 C05 C07 C08 C10 | 惰性，标「账户级」 | 设置 › 我的记录：主动退出次数（规则「每年 4 次」，`JU.RULES` credit 行；数据里只有 `records kind:'exit'`）、出席记录（`joined[].attendance`）、八种未成行事实 —— 只陈述事实，**不得出现分数 / 等级**（§G1） |
| 底部导航「设置」 | C02–C10 静态；C01 无导航 | 静态图标 + 字，不可点 | 设置根页；我的局内保持惰性（§F `:264`） |
| 账户资料（名字 / 微信） | 无 UI | 数据只有 `data.you = {id:'you', name:'阿禾', wx:'ahe_ju'}`（`ju-data.js:45`）；旧原型 `JuMine27.profile{nick,wx}` | 设置 › 账户 / 微信号（成员微信只在成局后对局主可见，§G6） |
| 复制微信的失败分支「未能复制，请长按微信号手动复制」 | 无一实现 | 假成功 | 不属于设置；但设置若有可复制项应实现失败态（§4.3） |
| 读取失败 `本机记录暂时读不出来 / 重新读取` | 十套 `ds_states` 内 | 概念内 | 不属于设置；可作设置 › 本机数据 的措辞参照 |
| 评审面板「下一次保存失败」/ 变体切换 / 速度 / 减少动态 | 面板（画面外） | 评审壳，非产品 | 设置模块沿用 `armFail()` 与面板，**不在产品界面里放演示控件**（契约 §10 `:133`） |
| 「再开一局」「继续编辑」「去找局」「去开局」 | 十套惰性 | 开局 / 找局模块 | 不是设置的对象，列此以免误收 |
| 「含评审样例 · 样例不计入你的真实记录与信用」（旧原型脚注；C05 列表脚仍写 `评审样例 · 不计入真实记录与信用`） | C05 `:1356` | 文案残留 | 若设置提供「演示数据」说明，用面板变体而不是产品内开关 |

## B. 稳定 ID 与演示数据清单

- **事件 id（代码，无前缀）** ↔ 旧规格 id（`spec/ju-data.spec.md` §3–§5）：`brunch`↔`j-brunch`、`livehouse`↔`j-livehouse`、`run3k`↔`j-run3k`、`theater`↔`j-theater`、`dimsum`↔`j-dimsum`、`vintage`↔`j-vintage`、`sketch`↔`j-sketch`、`jazz`↔`j-jazz`、`mahjong`↔`j-mahjong`、`ramen`↔`j-ramen`、`boardgame`↔`j-boardgame`、`bar`↔`h-bar`、`bbq`↔`h-bbq`、`museum`↔`h-museum`、`wine`↔`h-wine`、`cards`↔`h-cards`、`draft-reading`↔`d-reading`、`draft-hotpot`↔`d-hotpot`、`draft-untitled`↔`d-blank`。规格里的 `coffee` 是 `j-coffee`（withdrawn，many 变体），代码里 `coffee` 是 `contact` 阶段的「手冲咖啡品鉴」——**同名不同物**；规格的 `h-picnic / h-reel / h-yumcha / h-desk / h-soho`、`j-build / j-stretch / j-club …` 未进代码；代码另有 `hostwine2 / hostcards2 / hostpicnic / bbq2 / climb2 / hike2 / bookclub2`。人物：代码 `you`、`ap-xiaoman … ap-akuan`（`ju-data.js:45-55`）；规格 `p-ahe / p-xiaoman …`（`spec/ju-data.spec.md:44-57`）。旧 v3 画布：`demo:mine27:*`、`JU_V26_EVENTS_1`、`JU_MINE27_1`（§1.8）。
- **成员 id**：`m-N` / `h-N` 由 `uid` 顺序生成，`build()` 每次重置 `uid = 0`（`:152`），所以同一变体内稳定、跨变体不保证相同。
- **stage / section / tab 枚举**：参加者 18 个 stage（§1.4）；局主 `section ∈ todo resched recruit formed ended cancelled`；manage tab 全集 `applications members waitlist contact leaves reschedule replies cancel end attendance card`（契约 §10 `:129`）；surface ∈ `detail ticket contact reschedule-reply withdraw history manage draft`（契约 §4 `:89`）。
- **`JU.INDEX` 50 个 key**（`ju-data.js:327-376`）：`j-home j-history j-many j-history-many`；`j-d-pending(sketch) j-d-invited(brunch) j-d-waitlist(vintage) j-d-invitedq(climb·many) j-d-gathering(dimsum) j-d-tear(run3k·ticket) j-d-contact(coffee·contact) j-d-going(theater·ticket) j-d-reschedule(livehouse·reschedule-reply) j-d-withdraw(theater·withdraw) j-d-ended(jazz·history) j-d-cancelled(ramen) j-d-rejected(mahjong) j-d-queueleft(boardgame) j-d-exited(karaoke·history变体) j-d-declined(picnic) j-d-expired(hike) j-d-released(bookclub) j-d-withdrawn(pottery) j-d-absent(hike2)`；`h-home h-drafts h-history h-pending h-history-many h-drafts-many`；`h-m-review(bar·applications) h-m-members(wine) h-m-waitlist(cards) h-m-contact(wine) h-m-leaves(cards) h-m-reschedule(wine) h-m-replies(bbq) h-m-cancel(cards) h-m-end(wine) h-m-attendance(museum) h-m-card(bar) h-m-cancelled(hostpicnic·members) h-draft(draft-reading·draft)`；`b-empty b-empty-h b-single b-single-h b-drafts b-long b-long-h`。
- **变体 key**：`default empty single drafts pending many history long`（`ju-review.js:8-12`）。
- **选择器约定**：`cNN-over`、`data-rid`、`data-act=…`（§7.3）；`.stage-host[data-code=CODE]` → shadowRoot → `.ju-phone`。
- **时钟**：`JU.NOW = 2026-12-17T15:00`（THU；所有「今天」「剩余」「N 小时前」以此为准）。

## C. 用户已明确的要求／否定（原文）

见 §5.1–§5.3（全部摘自 `JU-MY-JU-PROJECT-RECORD.md` §0.1、§1.1、§1.2、§1.3、§1.6）。对「设置」最直接的三条：
1. 「只做「我的局」… 不做发现页、入局 / 开局流程、登录、真实接口。」——设置本轮**不在范围**，十套里对它只有惰性引用。
2. 「不要把要求收敛成无特征的极简白底 UI」「不要十套都是纸票叠放，也不要十套都是冷感黑白时装网站」「背景快速循环渐变 / 漂浮粒子 / 持续晃动」被否定；「用 alert / 空白弹层 / 按钮缩放 / 跳转旧稿代替结果」被否定。
3. 「按实际材料记录，不把口头汇报当验收 … 不额外授权推送 / 部署 / 重置」；「不自评高分」。
用户**没有**对任何视觉方向、任何局部作出认可（§1.2 为「无」）。

## D. 未能核实的项

1. 「入局（V27）」「开局（R3）」原型不在本仓库（旧附件在容器 `/root/.claude/uploads/…`，记录 §8；本容器未见），其 id / 存储键只能靠 `spec/extracts/extract-data.md` 的转述（`JU_V26_EVENTS_1`、`JU_MINE27_1`、`demo:mine27:*`）；与代码 id 的对照（§B）是**名称推断**，未经那两份原型核对。
2. 复制失败分支与 `fail-copy`：基于 grep（0 命中）与 `copyWx` 源码判断，未在浏览器里实际模拟 `clipboard` 拒绝。
3. C06 没有举报层：基于 `不对劲|report` 0 命中；评审报告（`evidence/C06/*.md`）也未提及，但未逐帧看图确认。
4. 十套惰性入口的实际渲染（是否像可点）只看了源码与评审文字，未重新截图。
5. Design 画布版本 7 是否与 `61cb4f0a` 源完全一致：容器内不能渲染官方画布（`spec/limits.md:5`），只能相信记录 §0。
6. 记录 §6.3 第 3 条「C01 / C04 出票分支」后续在 §6.7 的修复轮中是否重验，记录未单独写明。
7. `JU_CONCEPTS` 换清单构建第 11 块画板（§7.2 的 `x:0, y:2991` 推算）未实际运行。
8. 各套 `final-verify.md` 的 minor 清单未逐条核对与设置的相关性（只抽了复制 / 举报相关行）。

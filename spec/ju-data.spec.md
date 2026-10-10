> 主设计负责人注：本文件是合成代理给出的数据建议；**实际演示数据与引擎以 `src/core/ju-data.js` 为准**（人物、事件、变体、索引均已实现，键名略有出入）。本文件用于核对格式规则与记录形状。

# 我的局 · 共享演示数据集（ju-data.spec v1）

十个概念共用同一份数据，状态 key 与 `state-inventory.md` 一致。人名、局名、文案尽量沿用旧样例（`mock-data.json`），改动列在 §10。

## 0. 约定

| 项 | 规则 |
|---|---|
| 「现在」`seed` | `2026-12-17T10:00:00-05:00`（THU，纽约时间）。所有相对时间（剩余、`ago`、「今天」）以它为准；概念可用真实时钟，但演示截图统一用 seed |
| 时区 | 全部纽约本地时间；弹层写 `纽约时间`；不随浏览器 locale 变 |
| 存储 | ISO `YYYY-MM-DDTHH:MM`（本文件）；显示由 §1 规则生成 |
| id | 参加事件 `j-*`，发起事件 `h-*`，草稿 `d-*`，人物 `p-*`，变体 `id.variant`，数据集 `ds-*` |
| 「你」 | 一个账户：参加时显示 `阿禾`，发起时显示 `你`（局卡 host `你`，H1 `局主 · 你`） |
| 不提供的字段 | 信用分 / rep / 等级 / 参加次数（旧 PROFILES 的 `rep: 极好` 之类**不进数据集**） |
| 容量 | 含局主，3–8；`need = capacity − 1` |

## 1. 显示格式规则

| 字段 | 规则 | 例 |
|---|---|---|
| `when` | `WD MM.DD · HH:MM`，WD = 英文三字母大写，月日零填充，24h | `SAT 12.19 · 20:30` |
| 卡面日期 | `WD MM.DD` | `SAT 12.19` |
| 列表时间·地点 | `when` + 街区，同一行，只有地点可省略 | `SAT 12.19 · 20:30  东村` |
| `loc` → 街区 | `区-街区` 取 `-` 后 | `Manhattan-东村` → `东村` |
| `loc` → 详情 | `区 · 街区` | `Manhattan · 东村` |
| 改期 | `改为 {新 when}`；`原定 {旧 when}`（删除线） | `改为 SAT 12.19 · 21:00` / `原定 FRI 12.18 · 20:00` |
| 集合 | 新时间 −10 分钟 + ` 门口`；未设 → `待局主确认` | `15:50 门口` |
| 倒计时 | `HH:MM:SS`，到 0 停在 `00:00:00`；列表 `预留剩余 …`，H1 `剩 …`；颜色：>50% 绿 `rgb(14,155,118)`，>15% 琥珀 `rgb(190,140,40)`，其余红 `rgb(206,62,45)` | `04:21:00` |
| `ago` | `刚刚`（<1 分）/ `N 分钟前` / `N 小时前` / `N 天前` | `申请于 12 分钟前` |
| 轨迹时间 | `M.DD HH:mm`（月不填充） | `12.16 15:02` |
| 截止文案 | `请在 今天｜明天｜M月D日 HH:mm 前阅读并确认` | `请在 今天 14:21 前阅读并确认` |
| 席位 | `已确认 c/cap`（局主侧 `含你` / 参加侧 `（含局主）`）· `预留 r · 空 a · 候补 q`（0 省略）| `已确认 2/5（含你）` |
| 到场 | `n/N 人到场`，n = 记为出席，N = 已确认非局主；无成员 → `已散场` | `4/5 人到场` |
| 候补 | 参加 `候补第N位`；H1 `№1` | |
| 草稿 | `日期未定` / `地点未定` / `未命名的局` / `还差 局名、日期、时间、地点`（只列缺的）/ `信息齐了，可以发布` / `改于 {ago}` / `由「{源}」再开` | |
| 局名 | 中点两侧单空格 ` · `；≈40 字时 ≤2 行省略 | |

## 2. 人物

| id | 显示名 | 微信 | 邮箱验证 | 角色 |
|---|---|---|---|---|
| `p-ahe` | 阿禾（发起侧显示 `你`） | `ahe_ju` | nyu.edu ✓ | 本人 |
| `p-xiaomian` | 小面 | — | — | 常见同局成员 |
| `p-akuan` | 阿宽 | — | — | 同局成员；也是 `j-mahjong` 局主 |
| `p-danta` | 蛋挞 | — | — | 同局成员（`j-dimsum` 预留中） |
| `p-huajuan` | 花卷 | — | — | 候补 / 成员 |
| `p-xiaoman` | 小满 | `xm_01` | nyu.edu ✓ | 申请人 / 我发起的局的核心成员 |
| `p-kiki` | Kiki | `kiki1210` | ✗ 未验证邮箱 | 申请人 / 成员；也是 `j-vintage` 局主 |
| `p-ajiang` | 阿蒋 | `jiang_sva` | nyu.edu ✓ | 申请人 / 成员 |
| `p-momo` | Momo | `momo-cold` | nyu.edu ✓ | 申请人 / 候补 |
| `p-leon` | Leon | `leon_hp` | ✗ | 申请人 / 候补 / 未出席样例 |
| `p-ivy` | Ivy | `ivy_pm` | nyu.edu ✓ | 申请人（无留言） |
| `p-anon` | （未填称呼） | `ju_19` | ✗ | 仅 `ds-many-pending` |
| `p-xixi` | 西西 | — | — | `j-sketch` / `j-bookstore` 局主；`h-bar` 离开记录 |
| 局主 | 阿檬 · Nono · Ken · 老周 · 阿珍 · 老K · Ray · Tin · 小林 · 大熊 · Bike · 麻酱 · Leo · Cyc · 小满 | 示例微信：`laoyang.ju` 样式 → `{拼音}.ju`（如 `ken.ju`） | | 我参加的局的局主 |

申请人留言（原文）：小满 `第一次来，会带一副牌`；Kiki `新手友好吗？`；阿蒋 `SVA 在读，想认识新朋友`；Momo `带一杯冷萃当见面礼`；Leon `下班直接过去`；Ivy 无；（未填称呼）`可以带朋友吗`。

## 3. 我参加的 · 事件（标准集 11 条 + 变体）

成员按席位顺序，`✓` 已确认 · `◐` 已预留 · `你` = 阿禾。

| id | 局名 / en | 包 · 类 | 时间（ISO → 显示） | 地点（loc → 街区） | 局主 · 容量 | 成员 | 我的状态 key | 关键事实 | 列表显示 |
|---|---|---|---|---|---|---|---|---|---|
| `j-brunch` | 周六早午餐 · 只聊不卷 / SLOW BRUNCH | invite · food | `2026-12-19T11:30` → `SAT 12.19 · 11:30` | `Brooklyn-威廉斯堡` → 威廉斯堡 | 阿檬 · 4 | 阿檬 ✓ · 小面 ✓ · **你 ◐** · 空 | `invited` | 通过于 `12-17T08:21`，截止 `12-17T14:21`（剩 `04:21:00`，绿）；2/4 · 预留 1 · 空 1 | lead：`已预留 04:21:00` + 进度条 .725 · `预留到期前阅读约定并确认` · `阅读并确认`；卡 `仍可报名` / `已确认 2/4 · 已预留 1` |
| `j-livehouse` | Livehouse 后排也行 / BACK ROW | acid · music | 新 `2026-12-19T21:00` → `SAT 12.19 · 21:00`；旧 `2026-12-18T20:00` → `FRI 12.18 · 20:00` | `Brooklyn-布什维克` → 布什维克 | Nono · 4 | Nono ✓ · 小面 ✓ · 阿宽 ✓ · 你 ✓ | `reschedule` | 成局 `12-15T21:00`；v2（改期于 `12-17T08:00`）；我持 v1 票，已撕（`12-16T08:00`），已加微信；集合 `20:50 门口` | 票根显示 `20:00` / `FRI 12.18` 划掉 + `改期` 章（已撕）；时间行 `改为 SAT 12.19 · 21:00`；`待确认新时间` · `答复新时间 ›` |
| `j-run3k` | 中央公园慢跑 3K / EASY 3K | street · sports | `2026-12-20T08:00` → `SUN 12.20 · 08:00` | `Manhattan-上东区` → 上东区 | Ken · 4 | Ken ✓ · 小面 ✓ · 阿宽 ✓ · 你 ✓ | `tear` | 成局 `12-15T19:00`；未撕；集合 `待局主确认` | 票根未撕（`08:00` / `SUN 12.20`）· `待撕票` · `撕开票根 ›` |
| `j-theater` | 布鲁克林小剧场 · 坐第一排 / FRONT SEAT | grain · culture | `2026-12-17T19:30` → `THU 12.17 · 19:30` | `Brooklyn-Dumbo` → Dumbo | 老周 · 4 | 老周 ✓ · 小面 ✓ · 阿宽 ✓ · 你 ✓ | `going` | 成局 `12-15T20:00`；撕于 `12-16T09:00`；已加微信 `12-16T09:05`；今天 | 票根已撕 · `待赴约` · `今天 19:30 见` · `查看票根 ›`（就快见面） |
| `j-dimsum` | 法拉盛点心局 / DIM SUM | riso · food | `2026-12-21T10:30` → `MON 12.21 · 10:30` | `Queens-法拉盛` → 法拉盛 | 阿珍 · 5 | 阿珍 ✓ · 小面 ✓ · 阿宽 ✓ · 蛋挞 ◐（截止 `12-17T12:08`，剩 `02:08:00`）· 你 ✓ | `gathering` | 未成局；4/5 · 预留 1 · 空 0 | 座位段 `ok ok ok res ok` · `4/5 已确认（含局主）` · `待全员确认` · `包括局主全员确认后才出票`；卡 `席位已预留` |
| `j-vintage` | SoHo 古着淘货 / VINTAGE DIG | mono · walk | `2026-12-22T14:00` → `TUE 12.22 · 14:00` | `Manhattan-SoHo` → SoHo | Kiki · 4 | Kiki ✓ · 小面 ✓ · 阿宽 ✓ · 蛋挞 ✓（满，已成局） | `waitlist` | 候补：№1 花卷（加入 `12-17T01:00`，9 小时前）· №2 **你**（`12-17T05:00`，5 小时前）；4/4 · 候补 2 | `候补第2位` · `轮到你时才开始 6 小时预留`；卡 `已成局` |
| `j-sketch` | 画室静物速写 · 不会画也行 / STILL LIFE | invite · culture | `2026-12-26T15:00` → `SAT 12.26 · 15:00` | `Manhattan-东村` → 东村 | 西西 · 4 | 西西 ✓ · 小面 ✓ · 空 · 空；你 = 申请中（`12-16T22:40`） | `pending` | 2/4 · 空 2；申请不占席位 | `待审核` · `等局主审核 · 不占名额`；卡 `仍可报名` / `已确认 2/4 · 已预留 0` |
| `j-jazz` | 东村爵士夜 / JAZZ ROOM | grain · night | `2026-12-05T21:00` → `SAT 12.05 · 21:00` | `Manhattan-东村` → 东村 | 老K · 4 | 老K ✓ · 小面 ✓ · 阿宽 ✓ · 你 ✓ | `ended` | 散场 `2026-12-06T00:30`；已撕、已加微信；出席 `present`（局主记录 `12-06T01:10`）；联系已关闭 | 历史 · 散场：票墙卡 + 章 `出席`（grain 深色包 → 浅墨）· `记录为出席` |
| `j-mahjong` | 麻将三缺一 · 新手场 / MAHJONG | riso · games | `2026-12-12T20:00` → `SAT 12.12 · 20:00` | `Queens-法拉盛` → 法拉盛 | 阿宽 · 4 | 阿宽 ✓ · 小面 ✓ · 花卷 ✓ · 蛋挞 ✓ | `rejected` | 谢绝于 `12-08T21:15` | 历史 · 未成行 书脊：`这次没留住` · `这次没留住 · 不影响信用` |
| `j-ramen` | 拉面深夜场 / LATE RAMEN | street · food | `2026-12-10T22:30` → `THU 12.10 · 22:30` | `Manhattan-中城` → 中城 | Ray · 4 | Ray ✓ · 小面 ✓ · 阿宽 ✓ · 你 ✓ | `cancelled` | 成局 `12-07T19:00`；取消于 `12-09T18:00`；取消时票快照 v1（未撕） | 书脊：`已取消` · `局主取消 · 票根作废，不计你的退出`；展开 `原定 THU 12.10 · 22:30` |
| `j-boardgame` | 桌游店包场 · 随便玩 / BOARD NIGHT | acid · games | `2026-12-09T15:00` → `WED 12.09 · 15:00` | `NJ-JSQ` → JSQ | Tin · 4 | Tin ✓ · 小面 ✓ · 阿宽 ✓ · 蛋挞 ✓ | `queue_left` | 入候补 `12-07T10:00`，退出 `12-08T09:00` | 书脊：`已退出候补` · `退出候补 · 不记缺席` |

变体（同一事件换一个事实，用于覆盖剩余状态与票根形态）：

| 变体 id | 改动 | 状态 key | 列表显示 |
|---|---|---|---|
| `j-vintage.promoted` | 阿宽 于 `12-17T09:58` 主动退出，花卷 已在 `12-16` 退出候补 → 你顺位获邀，截止 `12-17T15:58` | `invited_queue` | `候补轮到 · 已预留 05:58:00`（进度条 .994）· `阅读并确认`；回执 `位置已预留` · `请在 今天 15:58 前阅读并确认` |
| `j-run3k.torn` | 撕于 `12-17T09:10`，未加微信 | `contact` | 票根已撕 · `待联系` · `撕票后 8 小时内联系局主` · `联系局主 ›`；联系层 `局主 · Ken` `ken.ju` |
| `j-livehouse.untorn` | 旧票未撕 | `reschedule` | 票根未撕 + 划线 + `改期` 章（两种改期票形态都要画） |
| `j-livehouse.accepted` | 已撕新副券（v2），沿用已加微信 | `going` | `待赴约` · `已记录加微信 · 按最终时间赴约`；票根 `21:00` / `SAT 12.19`，无章 |
| `j-theater.nextday` | 活动改为 `12-18T19:30` | `going` | 说明换成 `已记录加微信 · 按最终时间赴约` |
| `j-jazz.pending` | 局主尚未记录出席 | `ended` | 票墙卡无章 · `已散场` |
| `j-jazz.recent` | 散场 `12-16T23:30`（10.5 小时前） | `ended` | 展开层仍显示局主微信（<24h） |
| `j-brunch.lasthour` | 截止 `12-17T10:59` | `invited` | `00:59:00` 红 · 进度条 .164 |
| `j-brunch.expired` | 截止已过（`12-17T09:30`） | `expired` | 书脊：`预留已到期` · `预留到期未确认 · 位置已补给他人` |

扩展事件（只在 `ds-many-*` 出现）：

| id | 局名 / en | 包 · 类 | 时间 | 地点 | 局主 · 容量 | 状态 key | 关键事实 / 列表 |
|---|---|---|---|---|---|---|---|
| `j-build` | Vibe Coding 通宵场 / BUILD NIGHT | mono · code | `2026-12-18T21:00` → `FRI 12.18 · 21:00` | `Manhattan-中城` | Ray · 4 | `contact` | 撕于 `12-17T09:10`；`待联系` |
| `j-stretch` | 养生局 · 拉伸半小时 / STRETCH | street · sports | `2026-12-22T20:00` → `TUE 12.22 · 20:00` | `Brooklyn-威廉斯堡` | 阿檬 · 4 | `invited` | 截止 `12-17T11:02`（剩 `01:02:00`，琥珀→红边界）；在 `j-brunch` 之前排 |
| `j-club` | 蹦到腿软 · 电子场 / CLUB NIGHT | acid · night | `2026-12-26T23:30` → `SAT 12.26 · 23:30` | `Brooklyn-威廉斯堡` | Cyc · 6 | `going` | 已撕、已加微信 |
| `j-jazzbar` | 爵士小酒馆蹲一晚 / JAZZ BAR | street · music | `2026-12-23T21:00` → `WED 12.23 · 21:00` | `Manhattan-东村` | 老K · 4 | `gathering` | 老K ✓ · 你 ✓ · 花卷 ◐（剩 `03:40:00`）· 空；段 `ok ok res open` · `2/4 已确认（含局主）` |
| `j-pmtalk` | 产品人瞎聊 Networks / PM TALK | grain · coffee | `2026-12-23T19:00` → `WED 12.23 · 19:00` | `Manhattan-中城` | Ivy · 4 | `waitlist` | `候补第1位`，候补 1 |
| `j-ps1` | 周末看展搭子局 / PS1 WALK | riso · culture | `2026-12-20T13:00` → `SUN 12.20 · 13:00` | `Queens-长岛市` | 蛋挞 · 4 | `pending` | 申请于 `12-17T09:40` |
| `j-coffee` | 早八摆烂咖啡局 / SLOW MORNING | mono · coffee | `2026-12-22T08:30` → `TUE 12.22 · 08:30` | `Manhattan-东村` | 小满 · 4 | `withdrawn` | 撤回于 `12-14T19:20` |
| `j-rooftop` | 天台小酒 · 看天际线 / ROOFTOP | invite · night | `2026-12-19T21:30` → `SAT 12.19 · 21:30` | `Manhattan-中城` | Leo · 4 | `exited` | 成局后已撕票，`12-15T22:05` 主动退出；退出票快照（已撕） |
| `j-bookstore` | 独立书店逛到关门 / BOOKSTORE | grain · culture | 新 `2026-12-27T16:00`；旧 `2026-12-26T16:00` | `Brooklyn-威廉斯堡` | 西西 · 4 | `declined` | 拒绝改期于 `12-16T11:30` |
| `j-werewolf` | 狼人杀新手场 / WEREWOLF | riso · games | `2026-12-20T19:00` → `SUN 12.20 · 19:00` | `Manhattan-下城` | 大熊 · 5 | `expired` | 截止 `12-15T03:00` 未确认 |
| `j-nightride` | 布鲁克林桥夜骑 / NIGHT RIDE | mono · outdoor | `2026-12-18T21:00` → `FRI 12.18 · 21:00` | `Brooklyn-威廉斯堡` | Bike · 4 | `reservation_released` | 放弃于 `12-13T14:10` |
| `j-spice` | 川菜辣度分级评审团 / SPICE PANEL | grain · food | `2026-12-12T18:30` → `SAT 12.12 · 18:30` | `Brooklyn-八大道` | 麻酱 · 5 | `ended_other` | 散场 `12-12T21:40` 时我仍 `pending` |
| `j-pottery` | 陶艺体验 · 捏个杯子 / CLAY CUP | riso · culture | `2026-11-28T14:00` → `SAT 11.28 · 14:00` | `Brooklyn-绿点` | 小林 · 4 | `ended` | 散场 `11-28T16:30`；出席 |
| `j-hike` | 熊山徒步 · 看最后一波红叶 / BEAR MTN | street · outdoor | `2026-11-21T08:30` → `SAT 11.21 · 08:30` | `NY-熊山州立公园` → 熊山州立公园 | Ken · 4 | `ended` | 散场 `11-21T13:00`；**未出席**（局主记录 `11-21T13:20`，`待核实`）→ 章 `未出席` 灰墨 · `记录为未出席 · 待核实` |
| `j-karaoke` | K 歌到天亮 / KTV NIGHT | acid · night | `2026-11-14T22:00` → `SAT 11.14 · 22:00` | `Manhattan-韩国城` | Nono · 4 | `ended` | 散场 `11-15T03:00`；出席 |
| `j-bookclub` | 读书会 · 第一章就行 / CH.1 CLUB | invite · culture | `2026-10-30T19:00` → `FRI 10.30 · 19:00` | `Manhattan-上西区` | 西西 · 4 | `ended` | 散场 `10-30T21:30`；出席 |
| `j-picnic` | 中央公园野餐 / PICNIC | mono · outdoor | `2026-10-17T12:00` → `SAT 10.17 · 12:00` | `Manhattan-羊草坪` | 阿珍 · 4 | `ended` | 散场 `10-17T15:00`；出席 |

## 4. 我发起的 · 事件（标准集 8 条，覆盖全部局主状态）

局主 = 你；成员微信只在 H1、且只在 `hostCanContact` 时显示。

| id | 局名 / en | 包 · 类 | 时间 | 地点 | 容量 | 成员（席位顺序） | 申请 / 候补 / 离开记录 | 状态 key | 列表行 | H1 头部 |
|---|---|---|---|---|---|---|---|---|---|---|
| `h-bar` | 周五小酒馆试营业 / BAR TRIAL | riso · night | `2026-12-19T20:30` → `SAT 12.19 · 20:30` | `Manhattan-东村` | 5 | 你 ✓ · 小满 ✓（`等成局出票`，wx `xm_01`）· Kiki ◐（截止 `12-17T12:14`，`剩 02:14:00`）· 空 · 空 | 待审：阿蒋（`12-17T09:48`，`申请于 12 分钟前`）· Momo（`12-17T09:00`，`1 小时前`）；已处理：小满 / Kiki 通过；离开记录：西西 `预留到期`（`12-16T20:00`）；候补 0 | `host_review` | 待你处理 · life `招募中` · `2 份申请待审` · 段 `ok ok res open open` · `已确认 2/5 含你 · 预留 1 · 空 2` · CTA `审核申请` | `2 份申请待审 · SAT 12.19 · 20:30`；`已确认 2/5（含你）` / `预留 1 · 空 2`；`全员（含你）确认后成局出票`；成员口径 `5 个座位（含你）· 已确认 2 · 预留 1`；空位行 `还有 2 个空位`；取消弹层：已确认成员 1 · 已预留 1 · 待审申请 2 |
| `h-bbq` | 阳台烧烤 · 自带肉 / BALCONY BBQ | street · outdoor | 新 `2026-12-21T16:00` → `MON 12.21 · 16:00`；旧 `2026-12-20T17:00` → `SUN 12.20 · 17:00`；集合 `15:50 门口` | `Queens-长岛市` | 4 | 你 ✓ · 小满 ✓（`已接受新时间` · `已撕票` · `已自报加微信` · wx `xm_01` 可复制）· Kiki ✓（`未答复新时间` · `票根未撕` · wx `kiki1210`）· 空（阿蒋 已拒绝） | 改期于 `12-16T20:00`，v2；答复：小满 `接受 · 换新版票`、Kiki `还没答复`、阿蒋 `拒绝 · 已退出`；离开记录：阿蒋 `拒绝改期` | `host_resched` | 改期中 · life `改期中` · `1 人未答复新时间` · 段 `ok ok ok open` · `已确认 3/4 含你 · 空 1` | `1 人未答复新时间 · MON 12.21 · 16:00`；`已成局 · 成员微信仅你可见`；改期答复 `已答复 2/3` · `没有答复期限`；安排区：`改时间` 隐藏、`记为散场` 隐藏（有未答复）、`取消这局` |
| `h-museum` | 看展搭子 · 现代馆 / MOMA WALK | acid · culture | `2026-12-16T13:00` → `WED 12.16 · 13:00` | `Manhattan-中城` | 4 | 你 ✓ · 小满 ✓ · Kiki ✓ · 阿蒋 ✓（都已撕票） | 散场 `2026-12-16T14:00`（20 小时前）；出席：小满 `出席`（轨迹 `记录 出席 · 12.16 15:02`）· Kiki `未记录` · 阿蒋 `未记录` | `host_attendance` | 待你处理 · life `已散场` · `2 人出席待记录` · CTA `记录出席`；**同时**在历史 · 已散场 票墙卡 `1/3 人到场` | `2 人出席未记录 · WED 12.16 · 13:00`；`1/3 已记录出席` / `出席 1`；`已散场 · 24 小时内仍可查看成员微信`；出席区三人 + 三段控件；安排区只剩 `再开一局` |
| `h-picnic` | 周日下午 · 公园坡野餐 / PARK SLOPE | street · outdoor | `2026-12-27T14:00` → `SUN 12.27 · 14:00` | `Brooklyn-公园坡` | 5 | 你 ✓ · Momo ✓ · Ivy ◐（截止 `12-17T15:12`，`剩 05:12:00`）· 空 · 空 | 待审 0；离开记录：蛋挞 `放弃预留`（`12-16T11:40`）；候补 0 | `host_recruit` | 招募中 · life `招募中` · `1 人已预留 · 等确认` · 段 `ok ok res open open` · `已确认 2/5 含你 · 预留 1 · 空 2` | `1 人已预留 · 等确认 · SUN 12.27 · 14:00`；`全员（含你）确认后成局出票`；申请区不显示；安排区 `改时间` / `还没成局，不能记为散场` / `取消这局` |
| `h-reel` | 午夜场老电影 / MIDNIGHT REEL | mono · culture | `2026-12-23T23:00` → `WED 12.23 · 23:00` | `Manhattan-东村` | 4 | 你 ✓ · 小满 ✓（`已撕票` · `已自报加微信`）· Kiki ✓（`已撕票`）· 阿蒋 ✓（`票根未撕`） | 成局 `12-15T21:00`；候补：№1 Momo（`加入于 9 小时前`）· №2 Leon（`5 小时前`）；离开记录 0 | `host_formed` | 已成局 · life `已成局` · `全员确认 · 已出票` · 段 `ok ok ok ok` · `已确认 4/4 含你 · 候补 2` | `已成局 · WED 12.23 · 23:00`；`已确认 4/4（含你）`；`已成局 · 成员微信仅你可见`；候补区 `候补 · 2 · 不占席位`；安排区 `改时间` / `记为散场` / `取消这局` |
| `h-yumcha` | 周末早茶 · 法拉盛 / YUM CHA | riso · food | `2026-12-20T10:30` → `SUN 12.20 · 10:30` | `Queens-法拉盛` | 4 | 你 · 小满 `取消前已确认` · Momo `取消前已预留` · 空 | 取消于 `12-14T21:00`；待审 Leon → 已取消；候补 Ivy → 已取消；所有联系关闭 | `host_cancelled` | 历史 · 已取消 书脊 · `票根作废 · 联系已关闭` | `已取消 · SUN 12.20 · 10:30`；进度行隐藏；`已取消 · 不能撤销，票根作废、联系关闭`；成员 void；安排区只剩 `再开一局` |
| `h-wine` | 自然酒小试 · 六款 / NATURAL WINE | grain · night | `2026-11-27T19:00` → `FRI 11.27 · 19:00` | `Brooklyn-绿点` | 5 | 你 · 小满 · Kiki · 阿蒋 · Momo（全部 `出席`） | 散场 `11-27T22:30`；全部记录于 `11-27T23:05` | `host_ended` | 历史 · 已散场 票墙卡 · `4/4 人到场` · `再开一局`（惰性） | `已散场`；`4/4 已记录出席` / `出席 4`；`已散场 · 联系方式已关闭`；出席区只读 + `更正` |
| `h-cards` | 德州扑克新手桌 / POKER 101 | mono · games | `2026-11-13T20:00` → `FRI 11.13 · 20:00` | `Manhattan-东村` | 6 | 你 · 小满 · Kiki · 阿蒋 · Momo（`出席`）· Leon（`未出席 · 待核实`） | 散场 `11-13T23:30`；Leon 轨迹：`记录 待定 · 11.13 23:40` → `更正 待定 → 未出席 · 11.14 10:12` | `host_ended` | 历史 · 已散场 · `4/5 人到场` | `已散场`；`5/5 已记录出席` / `出席 4 · 未出席 1`；Leon 行墨章 `未出席` + 轨迹两行 |

扩展（`ds-many-*`）：

| id | 局名 / en | 包 · 类 | 时间 | 地点 | 容量 | 事实 | 状态 key | 列表行 |
|---|---|---|---|---|---|---|---|---|
| `h-mahjong` | 麻将 + 夜宵 / MAHJONG | riso · games | `2026-12-23T20:00` → `WED 12.23 · 20:00` | `Queens-法拉盛` | 4 | 只有你；待审：Leon（✗ · `下班直接过去` · `3 小时前`）· Ivy（✓ · 无留言 · `1 天前`）· （未填称呼）（✗ · `可以带朋友吗` · `2 天前`） | `host_review` | 待你处理 · `招募中` · `3 份申请待审` · `已确认 1/4 含你 · 空 3` |
| `h-bbq.withapps` | 同 `h-bbq` + 待审 Leon、Ivy | | | | | 改期中且有待审 | `host_review` | 待你处理 · life `改期中` · `2 份申请待审`；H1 顺序 申请 → 改期答复 → 成员 |
| `h-cards.unrecorded` | 同 `h-cards`，散场改为 `12-17T07:00`（3 小时前），无人记录 | | | | | | `host_attendance` | 待你处理 · `5 人出席待记录`；历史 `0/5 人到场` |
| `h-desk` | 自习室拼桌 · 别摸鱼 / DEEP WORK | street · code | `2026-12-05T10:00` → `SAT 12.05 · 10:00` | `Manhattan-上东区` | 5 | 小满 · Kiki · 阿蒋 `出席`，Ivy `待定`；散场 `12-05T14:00` | `host_ended` | 历史 · `3/4 人到场`（`待定` 不计入） |
| `h-soho` | SoHo 逛街扫货 / SOHO SHOP | street · walk | `2026-12-13T14:30` → `SUN 12.13 · 14:30` | `Manhattan-下城` | 4 | 取消于 `12-11T09:00`；小满 `取消前已确认` | `host_cancelled` | 历史 · 已取消 书脊 |

## 5. 草稿（标准 3 条，完成度各不同）

| id | 局名 | 包 · 类 | 日期 / 时间 | 地点 | 容量 · 模式 | 改于 | 来源 | 完成度 | 行显示 |
|---|---|---|---|---|---|---|---|---|---|
| `d-hotpot` | 冬至火锅 · 各带一样菜 / HOT POT | mono · food | `2026-12-21T18:30` | `Queens-法拉盛` | 6 · 申请制 | `12-17T09:40`（`20 分钟前`） | 新建 | `draft_ready` | `冬至火锅 · 各带一样菜` · `MON 12.21 · 18:30  法拉盛` · `信息齐了，可以发布`（绿）· `改于 20 分钟前` · `继续编辑 ›`（惰性）· `删除` |
| `d-reading` | 雨天读书局 / RAINY READ | invite · culture | — | `Brooklyn-公园坡` | 4 · 申请制 | `12-16T22:10`（`12 小时前`） | 新建 | `draft_incomplete` | `雨天读书局` · `日期未定  公园坡` · `还差 日期、时间` · `改于 12 小时前` |
| `d-blank` | （空）→ `未命名的局` | invite · — | — | — | 4 · 申请制 | `12-14T15:00`（`3 天前`） | 新建 | `draft_incomplete` | `未命名的局` · `日期未定  地点未定` · `还差 局名、日期、时间、地点` · `改于 3 天前` |
| `d-museum2`（扩展） | 看展搭子 · 现代馆 | acid · culture | — | `Manhattan-中城` | 4 | `12-17T09:55`（`5 分钟前`） | 由「看展搭子 · 现代馆」再开 | `draft_incomplete` | 多一行 `由「看展搭子 · 现代馆」再开` |
| `d-ride`（扩展） | 布鲁克林桥夜骑 · 第二季 | mono · outdoor | `2026-12-30T21:00` | — | 4 | `12-15T08:00`（`2 天前`） | 新建 | `draft_incomplete` | `WED 12.30 · 21:00  地点未定` · `还差 地点` |

排序 `updatedAt` 降序：hotpot → reading → blank。删除任一条 → 撤销条 `已删除「{局名}」` + `撤销`（10 s）；`d-blank` 的撤销条写 `已删除「未命名的局」`。

## 6. 申请人（H1 申请区行）

| 局 | 称呼 | 验证徽章 | 留言 | 申请于 | 状态 |
|---|---|---|---|---|---|
| `h-bar` | 阿蒋 | `nyu.edu 邮箱已验证` | “SVA 在读，想认识新朋友” | `12 分钟前` | 待审 |
| `h-bar` | Momo | `nyu.edu 邮箱已验证` | “带一杯冷萃当见面礼” | `1 小时前` | 待审 |
| `h-bar` | 小满 | `nyu.edu 邮箱已验证` | “第一次来，会带一副牌” | `1 天前` | 已通过（已确认） |
| `h-bar` | Kiki | `未验证邮箱` | “新手友好吗？” | `4 小时前` | 已通过（预留中） |
| `h-mahjong` | Leon | `未验证邮箱` | “下班直接过去” | `3 小时前` | 待审 |
| `h-mahjong` | Ivy | `nyu.edu 邮箱已验证` | （无） | `1 天前` | 待审 |
| `h-mahjong` | 未填称呼 | `未验证邮箱` | “可以带朋友吗” | `2 天前` | 待审 |

演示用「处理后」结果：对阿蒋 `发出邀请` → 该行变 `已发出邀请 · 等对方确认`，成员区新增 `阿蒋 已预留 剩 05:59:59`，头部 `1 份申请待审`，段 `ok ok res res open`，`已确认 2/5（含你）` / `预留 2 · 空 1`；对 Momo `谢绝` → `已谢绝 · 对方会看到「这次没留住」`，席位不变；组头 `申请 0 · 已处理 2`，头部 status 变 `2 人已预留 · 等确认`。

## 7. 候补 · 离开记录 · 出席记录（汇总）

| 类型 | 局 | 条目 |
|---|---|---|
| 候补 | `h-reel` | `№1 Momo · 加入于 9 小时前`，`№2 Leon · 加入于 5 小时前` |
| 候补 | `j-vintage`（参加者视角） | `01 花卷` → 显示 `花**`；`02 你` |
| 候补 | `h-yumcha` | Ivy → 已取消（取消后候补区不显示） |
| 离开记录 | `h-bar` | `西西 预留到期` |
| 离开记录 | `h-bbq` | `阿蒋 拒绝改期` |
| 离开记录 | `h-picnic` | `蛋挞 放弃预留` |
| 离开记录 | `j-vintage.promoted`（H1 视角，若需要） | `阿宽 主动退出` |
| 出席 | `h-museum` | 小满 `出席`（`记录 出席 · 12.16 15:02`）· Kiki `未记录` · 阿蒋 `未记录` |
| 出席 | `h-wine` | 四人 `出席` |
| 出席 | `h-cards` | 四人 `出席`；Leon `未出席 · 待核实`（`记录 待定 · 11.13 23:40` / `更正 待定 → 未出席 · 11.14 10:12`） |
| 出席 | `h-desk` | 三人 `出席`；Ivy `待定` |
| 出席（参加者侧） | `j-jazz` 出席 · `j-hike` 未出席 · `j-jazz.pending` 待记录 | |

## 8. 历史条目与排序

| 分区 | 组 | 条目（排序后） | 规则 |
|---|---|---|---|
| 参加 · 历史（标准） | 散场 1 | `j-jazz` | endedAt 降序；1 张 = `one` 构图 |
| 参加 · 历史（标准） | 未成行 3 | `j-mahjong`（12.12）· `j-ramen`（12.10）· `j-boardgame`（12.09） | 活动时间降序；书脊 |
| 参加 · 历史（many） | 散场 6 | 12 月：`j-jazz`；11 月：`j-pottery` · `j-hike` · `j-karaoke`；10 月：`j-bookclub` · `j-picnic` | 跨 ≥2 个月 → 月份标题；票墙 `many` 两列 |
| 参加 · 历史（many） | 未成行 9 | `j-bookstore`（12.27 declined）· `j-coffee`（12.22 withdrawn）· `j-werewolf`（12.20 expired）· `j-rooftop`（12.19 exited）· `j-nightride`（12.18 released）· `j-mahjong`（12.12 rejected）· `j-spice`（12.12 ended_other）· `j-ramen`（12.10 cancelled）· `j-boardgame`（12.09 queue_left） | 九种结局各一 |
| 发起 · 历史（标准） | 已散场 3 | `h-museum`（12.16，`1/3 人到场`）· `h-wine`（11.27）· `h-cards`（11.13） | endedAt 降序；`few` 构图；`h-museum` 同时在当前 · 待你处理 |
| 发起 · 历史（标准） | 已取消 1 | `h-yumcha` | 书脊 |
| 发起 · 历史（many） | 已散场 4 / 已取消 2 | + `h-desk`（12.05）；`h-yumcha`（12.20）· `h-soho`（12.13） | |

## 9. 边界数据集组成

| 数据集 id | 我参加的 | 我发起的 | 草稿 | 徽标 |
|---|---|---|---|---|
| `ds-standard` | 当前 7：act `j-brunch`（lead）· `j-livehouse` · `j-run3k`；soon `j-theater`；wait `j-dimsum` · `j-vintage` · `j-sketch`；历史 4 | 当前 5：todo `h-bar`（lead）· `h-museum`；resched `h-bbq`；recruit `h-picnic`；formed `h-reel`；历史 4 | `d-hotpot` · `d-reading` · `d-blank` | 3 / 2 |
| `ds-empty` | 0 · 0 | 0 · 0 | 0 | 隐藏 |
| `ds-single` | `j-brunch` · 0 | `h-bar` · 0 | 0 | 1 / 1 |
| `ds-drafts-only` | 0 · 0 | 0 · 0 | 3 | 隐藏 |
| `ds-many-pending` | act 6：`j-stretch`（01:02）· `j-brunch`（04:21）· `j-vintage.promoted`（05:58）· `j-livehouse` · `j-run3k` · `j-build`；soon `j-theater`；wait `j-dimsum` · `j-sketch` · `j-ps1`；历史 4 | todo 5：`h-bar`（4 待审：阿蒋 · Momo · Leon · Ivy）· `h-mahjong`（3 待审）· `h-bbq.withapps` · `h-museum` · `h-cards.unrecorded`；recruit `h-picnic`；formed `h-reel`；历史 4 | 3 | 6 / 5 |
| `ds-many-current` | 当前 13：act `j-brunch` · `j-stretch` · `j-livehouse` · `j-run3k` · `j-build`；soon `j-theater` · `j-club`；wait `j-dimsum` · `j-jazzbar` · `j-vintage` · `j-pmtalk` · `j-sketch` · `j-ps1`；历史 4 | 当前 6：todo `h-bar` · `h-museum` · `h-mahjong`；resched `h-bbq`；recruit `h-picnic`；formed `h-reel`；历史 4 | 3 | 5 / 3 |
| `ds-many-history` | 当前 7（标准）· 历史 15（§8 many） | 当前 5 · 历史 6（§8 many） | 3 | 3 / 2 |
| `ds-long` | 标准，替换：`j-brunch` 局名 `周六早午餐 · 只聊不卷 · 带上一本最近在读的书，顺便认识几个同样不想卷的人`，loc `Brooklyn-威廉斯堡北六街与贝德福德大道交口（L 线 Bedford Av 站旁）`；`j-livehouse` 局名 `Livehouse 后排也行 · Indie Night Vol.3 返场 · 散场后一起去吃宵夜`，loc `Brooklyn-布什维克 Elsewhere 屋顶` | 标准，替换：`h-bar` 局名 `周五小酒馆试营业 · 第一次开门请多包涵 · 来的人都送一杯`，loc `Manhattan-东村圣马克广场 B1（门口有红灯笼）` | `d-reading` 局名 `雨天读书局 · 带一本你没读完的书来互相安慰` | 3 / 2 |
| `ds-states` | 标准 + 开关：`loading`（任一写入停在 processing 1.2 s）· `fail-write`（写入失败：toast / 层内 alert，重试成功）· `fail-read`（整页 `本机记录暂时读不出来` + `重新读取`）· `fail-copy` · `fail-tear`（副券复位）· `no-burn`（`已退出，纸件动效暂不可用`）· `disabled`（C7 同时间；`gathering` `等待确认`；`going` `待赴约`） | 同左 | 3 | 3 / 2 |

## 10. 与旧样例（mock-data.json）的差异

1. `seed` 固定为 `2026-12-17T10:00`（旧样例用运行时刻），`j-theater` 因而落在「今天」，演示 `今天 19:30 见`。
2. `h-museum` 活动日期由 `12-06` 改为 `12-16`，使「散场 20 小时前 · 微信仍可见」与活动日期自洽。
3. `j-jazz` 的 endedAt 改为活动当晚（`12-06T00:30`），不再是 seed−40h。
4. `j-vintage` 候补第一位由 `Kiki`（与局主同名）改为 `花卷`；`j-mahjong` 成员 `阿宽`（与局主同名）改为 `花卷`。
5. 新增局主状态所需事件：`h-picnic`（招募中）· `h-reel`（已成局）· `h-yumcha`（已取消）；`h-wine` / `h-cards` 从 many 变体提到标准集。
6. 新增第三份草稿 `d-blank`（空草稿）；旧 `d-hotpot` 从 drafts 变体提到标准集。
7. 新增 `ds-single` / `ds-many-pending` / `ds-many-current` / `ds-states`（旧原型靠评审工具条现场拼）。
8. 删除所有 `rep` / `events` / 信用等级字段；申请人只保留 称呼 · 微信 · 验证 · 留言 · 时间。

## 11. 记录形状（供实现，JSON 简式）

```json
{
  "event": {"id":"j-brunch","title":"周六早午餐 · 只聊不卷","en":"SLOW BRUNCH","pack":"invite","cat":"food",
            "iso":"2026-12-19T11:30","loc":"Brooklyn-威廉斯堡","host":"阿檬","capacity":4,"joinMode":"application",
            "version":1,"meeting":null,"status":"open","endedAt":null,"cancelledAt":null,"establishedAt":null,
            "proposal":null},
  "members": [{"id":"host","name":"阿檬","slot":0,"status":"confirmed"},
              {"id":"p-xiaomian","name":"小面","slot":1,"status":"confirmed"},
              {"id":"p-ahe","name":"阿禾","slot":2,"status":"invited","invitedAt":"2026-12-17T08:21","deadline":"2026-12-17T14:21"}],
  "queue": [], "history": [],
  "me": {"application":"approved","userVersion":1,"tornVersion":null,"tornAt":null,"contactAdded":false,
         "attendance":null,"readReceipt":null},
  "stage": "invited"
}
```

局主记录额外字段：`applications[uid] {status, nick, wx, note, verified, mail, appliedAt, decidedAt}`；`memberFacts[uid] {tornVersion, tornAt, contactAdded, reschedule:{version, choice, answeredAt}, attendance, attendanceStatus, attendanceHistory[{previous, mode, at}]}`；`history[] {name, status, at}`；`queue[] {id, name, status, joinedAt}`。草稿：`{id, title, en, pack, cat, city, loc, iso|null, capacity, joinMode, fee, note, updatedAt, source:{kind:"new"|"reopen", title}}`，永不含成员 / 票 / 记录。

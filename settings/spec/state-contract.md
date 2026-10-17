# 「设置」跨模块状态契约（设置 · 入局 01 接缝 · 我的局接缝）

> 实现以 `settings/src/core/jus-data.js` 为准；本文解释每个对象的归属、作用域、保存模型与边界，并记录源码冲突的处理决定。依据分级：**①** 用户明确要求 **②** 当前源码可核实的既有能力 **③** 旧稿有明确产品意图但仍是占位或错误实现 **④** 本轮为完善设置提出的设计建议（可逆的本地默认方案） **⑤** 信息缺失、冲突或尚待核实。④⑤ 不是已确定的产品规则。

## 0. 原则

1. **同一方案内状态互通，不同方案之间隔离**：每套方案一个命名空间 `jus:<SCNN>:v1`（`JUS.store`），设置、入局接缝、我的局接缝读写同一份 `data`；「重置本套」只清这一个键，从不触碰 V27（`JU_V26_EVENTS_1`、`JU_MINE27_1`、`demo:mine27:*`）、R3（`ju-visual-motion-r1`、`ju-create-v19-ultra-r2`、`ju-background-skin-v1`）或上一轮「我的局」的任何键。①②
2. **稳定身份**：活动的唯一身份是 `eventId`（与 `src/core/ju-data.js` 的 id 相同：`brunch`、`livehouse`…）。收藏、记录、举报、快照都以 `you.id + eventId` 关联；标题、城市文案、数组位置、DOM class 都不是身份。改标题不是新活动；同名不同城市是两个活动。①
3. **结果出现在动作发生处**，保存结果与数据修改时机一致（引擎写入成功才显示成功；失败保留输入）。①
4. **本地演示**：没有真实账户、验证邮件、通知服务、审核服务或后端。产品界面里只写用户理解当前操作、后果与真实状态所需的话；演示控制（变体、权限模拟、失败模拟、重置）全部在画面外的评审面板。①

## 1. 稳定 ID 与跨文件映射

| 来源 | 该来源的「身份」 | 处理决定 |
|---|---|---|
| 我的局（`src/core/ju-data.js`） | `event.id`（无前缀：`brunch`…）；成员 `m-N`；草稿 `draft-*` | **采用为本契约的 canonical id**。② |
| V27 入局 | 收藏键 `favKeyAt` = 城市 + 标题（`filteredFeed` 按此过滤）；账本 `JuLedger` 按 event id 存一条记录（`JU_V26_EVENTS_1`），feed 行来自 `FEED_ROWS`（每城若干行） | 以 V27 的 event id / feed 行对照到 canonical id（映射表见 `JUS.IDMAP.v27`，由 V27 抽取填写）；**标题不再作为键**。③→④ |
| R3 开局 | `H.state.favorites` 键 = `城市:feedRow 下标`（如 `NYC:0`），取消写 `false` 而非删除；活动 id `draft-<base36>-<8 位>`、`demo-host-hotpot`、`demo-history-0..4` | 下标键无法稳定映射到活动；接缝不继承 R3 的键格式。R3 样例活动 `demo-host-hotpot`（深夜救急火锅局）与本契约 `hotpot`（冬至火锅）**不是同一活动**，不合并。③ |

映射规则：不同文件的活动只有在 **id 明确对应**（V27 ledger id ↔ canonical id）时才视为同一活动；仅标题相似不合并（例：`vintage` 古着淘货 · 下东区三家店 与 `thrift` 古着淘货 · 布鲁克林三家店 是两个活动）。⑤ 的部分（V27 id 清单）等抽取。

## 2. 对象模型与作用域

| 对象（`data.*`） | 内容 | 作用域 | 保存模型 | 修改后同步到 | 不受影响 | 本地 / 真实 |
|---|---|---|---|---|---|---|
| `you` | `name` 称呼、`wx` 微信、`email`、`emailVerified`、`emailDomain`、`emailKind`（school / work） | 账户级默认值 | **显式保存**（编辑 → 校验 → 保存；取消恢复原值；未保存返回要确认） | 设置首页、资料页、隐私页、接缝里「你」的称呼；**之后的新报名默认填入新值** | 已提交的报名快照 `joined[].snapshot`（报名时填写的称呼 / 微信）、已发布活动、历史记录 | 本地；邮箱改动后 `emailVerified=false`，验证邮件未接入（产品内写明「未验证」，不冒充已发送） |
| `favorites[]` | `{eventId, at}`，无重复 | 账户级 | **即时**（引擎幂等：重复收藏返回 `already`，不加条目） | 设置 › 收藏、入局接缝标记与「只看收藏」计数、我的局接缝标记 | `joined[]`（报名 / 预留 / 候补 / 票根 / 历史）、`hosted[]`、`records[]` | 本地 |
| `prefs.city` | 默认浏览城市 key（R3 六城之一） | **本次浏览偏好 → 本轮提升为账户级默认值**（R3 中不持久化，每次重置 NYC；③→④） | 即时 | 入局接缝列表按此城市筛选；设置首页当前值 | 已创建 / 已参加活动的 `event.city`、地点、时区、历史时间（`setCity` 只写 `prefs.city`） | 本地 |
| `notify.prefs` | 六类提醒开关（邀请 / 预留到期前 / 候补轮到 / 改期 / 活动变化 / 我发起的局） | 账户级 | 即时 | 通知页、首页计数 | 报名、席位、待办事实（关闭提醒不撤回任何事） | 本地（类别来自现有事件：邀请 / 预留 / 候补 / 改期 / 活动变化 ②；「我发起的局」为 ④） |
| `notify.permission` | `default` 未请求 / `requesting` / `granted` / `denied` / `unsupported` | 系统层（浏览器 / 系统） | 只能通过「申请系统权限」改变 `default → requesting → granted|denied`；`denied` / `unsupported` 在产品内不可改 | 通知页三态说明、首页当前值 | 偏好开关本身仍可保存 | 本地模拟：评审面板「系统权限」按钮决定系统的回答；V27 `notificationStatus22 / requestNotification22` 的状态与文案为参照（待抽取核对） |
| `notify.serviceConnected` | 提醒服务是否连接 | 服务层 | 产品内不可改（只展示） | 通知页「能否送达」 | — | 本地：默认未连接（真实提醒未接入），面板可切换 |
| `appearance.skin` | `cotton 棉糖 / halo 光晕 / sunset 落日`（R3 三套，色值见 `JUS.SKINS[].tokens`） | 账户级 | **预览 → 应用 / 取消**（预览是方案内视图态，不写数据；应用才写；取消恢复） | 全方案背景材质（每套用自己的材料表达三种背景；**方案切换 ≠ 换肤**） | — | 本地（R3 用 `H.commit` 持久化到 `ju-visual-motion-r1`；本轮写各自命名空间） |
| `appearance.reduceMotion` | 减少动态 | 账户级 | 即时 | 全方案动效时长（与评审面板的「减少动态」独立：面板是评审开关，产品内开关是用户偏好） | — | 本地（R3 只有系统媒体查询，无应用内开关 ③→④） |
| `records[]` | 账户级事实：`attendance`（出席 / 未出席 · 待核实）、`exit`（主动退出 · 占年度机会）、`change`（预留到期 / 放弃预留 / 退候补 / 拒绝改期 / 局主取消 / 撤回申请 · 不占机会）；每条 `{id, eventId, kind, value?, text, at, status, quota, supplements[], dispute?, appeal?}` | 账户级历史快照（**只读事实**） | 事实文本不可改；只能**追加** `supplements[]`、`dispute`（仅未出席）、`appeal`（仅主动退出）；状态 `recorded → supplemented / disputed / appealed`；`pending_review` 由演示场景设定 | 记录页、详情、首页计数 | 事实本身、活动、票根、我的局历史 | 本地；真实核实流程未接入（状态只到「已提出」） |
| `reports[]` | 举报对象：`{id, eventId, text, who[], materials[], at, status, localNo, timeline[], supplements[]}`；状态 `saved / submitted / received / needs_more / closed` | 账户级 | 新建 `fileReport`（接缝）；补充 `supplementReport`（`needs_more → submitted` 并追加时间线）；**用户保存从不自动推进到「已受理 / 已处理」**，这些只来自演示场景数据 | 举报列表、详情、首页计数、我的局接缝回执 | 活动与记录 | 本地；编号 `R-MMDD-NN` 为本地编号（产品内标「本地编号」） |
| `feedback[]` | 普通产品反馈 `{id, text, at, status, localNo}` | 账户级 | 提交即保存 | 帮助页列表 | — | 本地；与举报分开（不同对象） |
| `session` | `{kind: demo|ended, startedAt, device}` | 本机 | 「退出登录（本地演示）」结束演示会话；「重新开始」恢复；只作用于本命名空间 | 账户页 | 已提交记录、举报、资料（结束会话不删除它们） | 本地；真实工程没有登录 / 解绑 / 注销能力（V27、R3 均无，待 V27 抽取最终核对 ⑤） |
| `flags` | `failNext`、`copyFailNext` | 评审 | 面板设置；引擎下一次写入 / 复制消费 | — | — | 评审用 |

## 3. 五条链路

### 3.1 收藏
- 读取：`JUS.derive.favorites(d)`（设置）、`derive.feed(d, 'all'|'fav')`（入局接缝）、`derive.mine(d)`（我的局接缝，每行 `fav`）。
- 修改：`engine.favorite / unfavorite / toggleFavorite`（任一入口）。幂等；效果 `{favorited|unfavorited, eventId, count, first?, last?, already?}`。
- 手势契约（接缝）：参照 V27（成熟度最高）：**右滑 = 收藏，左滑 = 取消**；阈值 70px（R3 实测值，V27 阈值待抽取核对）；死区 6px；未达阈值回弹；错误方向（已收藏再右滑）给「已经在收藏里」反馈且不改状态；拖动中卡片跟手。R3 的「任一方向切换」**不继承**（记录为差异，不改原文件）。③④
- 不受影响：报名 / 预留 / 候补 / 票根 / 历史 / 席位；取消收藏已报名活动不触发退出。
- 活动改期 / 取消 / 结束：收藏保留，列表分「可报名」与「已结束 / 已取消」归档区；信息随 `events[id]` 最新状态显示。④
- 返回 / 刷新：命名空间持久化（`store.save` 在每次成功写入后）；重置清空。
- 验收：见 §5 表。

### 3.2 资料
- 读取：`d.you`；接缝 `derive.mine` 每行 `snapshotLabel`（报名时填写的资料）。
- 修改：`engine.saveProfile({name, wx, email})`：校验（称呼必填 ≤16 字；微信 6–20 位字母开头；邮箱格式）→ 不通过返回 `{type:'invalid', errors}` **不写入**；通过则写入，`emailChanged` 时 `emailVerified=false`。
- 取消 = 丢弃编辑态；未保存返回 → 确认（`COPY.unsaved`）；失败 → 保留输入 + 重试（`failNext`）。
- 快照：`joined[].snapshot` 不变；资料页与接缝提示 `COPY.snapshotNote`。
- 三件不同的事：自己的微信（`you.wx`，可编辑）/ 别人能否看见你的微信（隐私页按活动与角色派生，不可开关）/ 你能否看见局主微信（接缝详情按 `canSeeHostWx` = 撕开有效票且联系未关闭）。

### 3.3 城市
- 读取：`derive.city(d)`、`derive.feed` 按 `prefs.city`。修改：`engine.setCity({city})` 即时。搜索：方案内按名称 / 拼音代码过滤六城；无结果文案 `CITY_COPY.noResult / retry`。
- 不改：`events[].city / loc / iso`；跨城市收藏在列表上标城市与「当地时间」（`crossCity`）。
- R3 的草稿 `cityPatch`（清空地点、重映射时区）**不套用到全局偏好**。②

### 3.4 通知
- 三层分开呈现：偏好（`prefs`，可改）/ 系统权限（`permission`，只能申请一次）/ 服务连接（`serviceConnected`，只展示）。`derive.notify(d).deliverLabel` 给出综合结论（能否送达）。
- 申请流程：`requestPermission`（→ `requesting`）→ 方案动画「系统弹窗」→ `resolvePermission({value})`：系统回答由评审面板预设（默认允许；面板可预设拒绝）。`denied` / `unsupported` 下开关可存但页面明确「不会显示提醒」。
- 不可关闭类别：现有规则没有 → 全部可关（不自行添加）。①
- 不编造已发送 / 已送达。

### 3.5 记录 · 举报 · 申诉 · 反馈
- 记录：`derive.records` → 详情 `derive.record(id)` → `addSupplement`（任何记录）/ `fileDispute`（仅 `attendance=absent` 且未提出过）/ `fileAppeal`（仅 `exit` 且未申诉过）；输入 ≥4 字；失败保留；重试不重复（引擎拒绝第二次异议 / 申诉）。
- 举报：`derive.reports` → 详情（原文、对象、材料、本地编号、时间线）→ `needs_more` 时 `supplementReport`；接缝的我的局历史行可 `fileReport`（对象：活动 + `who[]` 含「（局主）」）。
- 反馈：`submitFeedback`，与举报分开。
- 状态分级：本地已保存 / 已提交 / 已受理 / 需要补充 / 已处理（后三者只由演示数据产生）。
- 多对象切换时草稿不串：方案内编辑态必须以 `recordId / reportId` 为键保存草稿文本。④

## 4. 保存 / 失败 / 返回 / 重复 / 刷新 / 隔离（全方案统一）

| 情形 | 规则 |
|---|---|
| 即时型（开关、城市、减少动态、收藏） | 点击即写入；写入失败 → 控件回到原态 + 失败提示 + 重试（面板「下一次保存失败」可演示） |
| 显式保存型（资料、补充、异议、申诉、举报补充、反馈） | 编辑中 → 校验 → 保存中（≥ 300ms 可见）→ 成功落定（结果在原位）/ 失败保留输入 + 重试；重试不产生第二条 |
| 预览型（外观） | 预览不写数据；应用写；取消 / 返回恢复原值 |
| 未保存返回 | 有改动时弹确认：继续编辑 / 放弃修改 |
| 快速重复点击 / 滑动 | 引擎幂等；UI 在处理中禁用触发器 |
| 刷新 / 重新进入 | 从命名空间恢复（标准画布）；预览与对比视图不持久化 |
| 切换方案 / 重置 | 不污染其他方案；重置只清当前键并回到标准示例 |

## 5. 收藏接缝验收表（每套都要实际验证）

| 场景 | 引擎 / 派生保证 | 验证方法 |
|---|---|---|
| 入局接缝收藏未报名活动 A（如 `hotpot`） | `favorite` 加入 → `favorites` 出现 A；`joinedRow(A)` 仍为 null | capture：拖动 → 跳 `s-fav` 截图 |
| 收藏管理取消 A，回到来源 | `unfavorite` → 接缝标记消失、计数减一 | 跳 `s-fav` 取消 → 跳 `s-seam-feed` |
| 入局取消 A，回收藏管理 | 同上反向 | 同上 |
| 我的局接缝操作同一活动（如 `sketch`）的收藏 | 三处读同一 `favorites`；`joined[sketch].stage` 不变 | `s-seam-mine` 切换 → `s-fav` → `s-seam-feed` |
| 重复点击 / 滑动 | `already` 不加条目 | 连续两次拖动 |
| 取消最后一个 | `last:true` → 空态 | `empty` 变体收藏一个再取消 |
| 已报名 / 已出票 / 历史的 A 取消收藏 | 只改 `favorites` | `theater`（going，已撕票）取消收藏后 `ticket.torn` 仍 true |
| 改期 / 取消 / 结束 | 列表显示最新状态并归档 | `many` 变体含 `coffee`（可报名）与历史活动 |
| 从收藏打开详情 | 权限同来源：未撕票看不到局主微信 | `s-fav-detail` |
| 同名 / 跨城市 / 改标题 | id 身份；`vintage` vs `thrift`；`lanight`（LA）`bosdim`（BOS） | `many` 变体 |
| 保存失败后重试 | `failNext` 消费一次；图标 / 计数与数据一致 | 面板武装失败 → 操作 → 重试 |
| 返回 / 重进 / 刷新 | 命名空间恢复 | 刷新独立画布 |
| 切换方案 / 重置 | 键隔离 | 两套各自操作后互查 |

## 6. 源码冲突与处理决定

| 冲突 | 决定 | 依据 |
|---|---|---|
| 收藏键：V27 城市 + 标题 / R3 城市:下标 / 我的局无 | canonical `eventId`；映射表 `JUS.IDMAP` | ①② |
| 手势：V27 方向性 / R3 任一方向切换 | 方向性（V27）；差异记录，不改原文件 | ①（简报指定） |
| 取消收藏：R3 写 `false` | 删除条目 | ④ |
| 皮肤真值双源（`ju-visual-motion-r1` vs `ju-background-skin-v1`） | 设置只写自己命名空间；记录双源问题，不迁移旧键 | ② |
| 棉糖调色两套（R3 three.js vs v17 兜底） | 以 R3 `cotton-bg` 通道色为准（`JUS.SKINS[0].tokens.bg`） | ② |
| 复制反馈：我的局十套假成功；R3 「正在复制…/已复制/复制失败 · 点击重试」；V27 失败「复制失败，请长按账号复制」；清单「未能复制，请长按微信号手动复制」 | 真实 clipboard 结果决定反馈；失败文案用清单句 + 可手动复制的内容；面板可模拟失败 | ②③ |
| 举报对象：我的局各套只存句子 | 设置自有 `reports[]` 结构化对象；我的局接缝回执读同一对象 | ③→④ |
| 浏览城市不持久化（R3） | 提升为账户级默认值 | ④ |
| 减少动态只有系统媒体查询（R3） | 增加应用内偏好 | ①（简报要求考虑减少动态） |
| 年度退出次数计数 | 只列事实与规则文字，不算「还剩 N 次」 | ①（简报 §08E） |
| 账户 / 登录能力 | 无依据 → 「退出登录（本地演示）」「本机演示数据」标明本地演示；不发明密码 / 绑定 | ①⑤ |

## 7. 评审面板的模拟能力（画面外）
变体（标准 / 全空 / 较多 / 长文本 / 已拒绝 / 不支持 / 已连接 / 新用户）· 下一次保存失败 · 系统权限（未请求 / 请求中 / 已允许 / 已拒绝 / 不支持）· 提醒服务连接 · 速度 1× / 0.5× · 暂停 · 关键帧 · 减少动态（评审开关）· 重播 · 重置本套。

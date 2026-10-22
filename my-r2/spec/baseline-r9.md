# JU「我的局」R2 · 基线 D（R9）现状与接缝观察

> 观察对象：`/home/user/JU/.build/baseline/R9.html`（24 MB，单页；`<title>JU · R9 一起，把见面定下来</title>`，评审侧栏标注 `R9 / REFINED VISUAL & MOTION`）。任务书 §02 写的是 R8，上传文件按内容识别为 R9：本地存储键 `ju-r9-review-state` / `ju-r9-local-state`，并向下兼容 `ju-r8-*`、`ju-r7-*`。
> 任务书口径：它"仅作当前综合实现与接缝参考；文件名和版本号不构成整套视觉已获认可的证据"。本文只写观察，不裁定规则谁对，不给方案。
> 证据目录：`/home/user/JU/my-r2/evidence/baseline/r9/`（Playwright chromium-1194，viewport 390×844，dpr 2，PNG；离线字体已打包，截图前等待 `document.fonts.ready` 并静置 0.8–0.9 s；网络请求全部拦截）。截图清单见文末附录。
> 行号引用的是去 base64 的副本 `/home/user/JU/.build/baseline/R9.code.html`（与原文件行号不同）。

## 0. R9 怎么运行、怎么切换

- 路由（`app.js` 第 87059 行 `const routes=[...]`，11 项）：`s00 我的局`、`s07 赴约安排`、`s01 看见局`、`s02 想开局`、`s03a 挑张脸`、`s04 双卡`、`s05 发出去`、`s06 能确认`、`s08 计划有变`、`s09a 会出现`、`s09b 归档墙`。`go(id)` 渲染并写 `location.hash='#sXX'`；默认进入 `#s00`。手机外 `#review-nav` 按钮 `data-route` 直接切路由。
- 本轮范围内真正用到的路由：s00（我的局总览，双角色）、s07（参加者赴约安排）、s06（管理 / 申请审核 / 名单）、s08（改时间 / 取消）、s09a（出席记录）、s09b（局主归档墙）、s05（分享页，管理页脚入口）。s01–s04 是发现与开局编辑器（范围外）。
- 评审侧栏（手机外）：共同背景（Cotton Candy / Halo / Sunset）；本地演示样本（`JUR7Review.load`：future / ended-six / complete-six / complete-twelve / cancel-independent / long-intro / all-present / all-absent / complete-empty / ended-twelve）；返回已载入的演示活动；真实内容宽度 320 / 390 / 430；减少前景动效 · 审阅；R9 专项复验（`JUR9ReviewStates.load`：reconfirm / limits / empty-future）；`模拟下一位确认`（#review-response：把一位 invited / reschedule_pending 按"接受"写入）；`以产品视图打开 ↗`（`?view=product`：隐藏评审壳，初始为占位活动，无样本）。侧栏说明原文："当前为独立演示账本。不会写入真实活动列表。外部通知与分享服务未接通。"
- 数据层 `state.js`（`window.JUHost`）：单一"当前活动"`current` + `savedEvents` + `archives` + `joinedEvents` + `draft`（只有一份草稿）+ `annualLedger`（局主年度额度账本）。**`joinedEvents` 在 R9 中只有初始化 `[]` 与读取 `listJoined()`，没有任何写入路径**，所以"我参加的"在 R9 原样运行时永远是空态；参加者侧状态只能靠注入数据观察（见 §A.3）。
- 390 px 宽时评审布局自动把手机放到 (0,0) 390×844，侧栏落到手机外，截图即手机画面。

## A. 页面组织与导航（谁进谁、返回落点、分区与筛选）

### A.1 我的局（s00）
截图：`s00-host-default.png`、`s00-host-multi.png`、`s00-host-multi-scrolled.png`、`s00-host-multi-bottom-past.png`、`s00-host-many-after-session.png`、`s00-host-many-after-session-bottom.png`、`s00-joined-empty.png`、`s00-host-empty-product.png`、`s00-joined-empty-product.png`。

- 外层：V27 式标题 `我的局`（约 30px，滚动时收进工具行中部，见 `s00-host-multi-scrolled.png`），左返回键，右侧文字动作 `局主归档`（→ s09b）。
- 角色分区：`role=tablist` 两枚 tab `我参加的 / 我发起的`，默认 `我发起的`（`overviewRole='host'` 初值；从 s01 主导航"我的局"进入也强制 host）。切换为 `lightSwitch`（220ms 横移淡入），各角色滚动位置分别记忆（`overviewRolePositions`）。该 rail 为 `position:sticky`，吸顶时加 `is-stuck`。
- 正文只有两段，没有"当前 / 历史 / 草稿"三分区，也没有任何筛选：
  1. 进行中（status 不是 ended / cancelled / exited）按开始时间升序；第 1 条是 `is-nearest` 大卡（标题、地点 + 街区、`N 位确认参加`/`等大家加入`、`另有 N 位留位`、独立的日期时刻块、阶段句 + 动作句），其后各条是 `is-following` 紧凑行。
  2. `之前的安排`（ended / cancelled / exited，时间倒序），同样的行模板但不带人数。
- 行上的阶段句与动作句（局主侧 `phaseOf`，决定点进去落在哪一页）：

| 条件 | 阶段句 | 动作句 | 进入 |
|---|---|---|---|
| cancelled | 已取消 | 查看原定安排 | s08 |
| ended（已归档） | 已结束 · 记录只读 | 回看本场记录 | s09a |
| recording | 出席已记齐 / 正在记录出席 | 回看本场记录 / 继续记录出席 | s09a |
| 有实际结束证据、未记录 | 已结束 · 待记录出席 | 记录这场见面 | s09a |
| 改期后有人未答复 | 新时间，等本人回应 | 查看待回应的人 | s06（待确认） |
| 已过原定开始时间、无结束证据 | 已到原定开始时间 · 尚未收到结束确认 | 查看参加者 / 查看当前报名 | s06 |
| 有待处理申请 | N 份申请等你看 | 看看谁想来 | s06（待处理） |
| 有留位待确认 | 等 N 位本人确认 | 查看待确认的人 | s06（待确认） |
| 24 小时内开始且有确认者 | 24 小时内见面 | 打开本场名册 | s09a |
| 其余 | N 位已确认 / 约定已保存 | 查看参加者 / 分享这次约定 | s06 / s05 |

- 参加者侧行（`joinedPhase`，一律进 s07）：pending `申请已递交 · 等局主处理 / 查看申请安排`；confirmed `你已确认参加 / 查看赴约安排`；invited `已收到邀请 · 等你回应 / 查看邀请安排`；reschedule_pending `时间有变化 · 原确认已失效 / 查看新安排`；cancelled `约定已取消 / 查看原定安排`；ended `这次见面已结束 / 回看约定`；exited `你已退出本场 / 回看原安排`。没有候补、待撕票、待联系、改期答复等更细的参加者阶段。
- 页底 `nav.r5-overview-bottom`：`→ 找局`（→ s01 发现页）与 `+ 开一局`（→ 开局表单 s02）。空态：局主 `先定下一个好主意 / 从活动、时间和地点开始，把想做的事约起来。` + 主 CTA `开一局`；参加者 `一起做点什么 / 找一场想参加的活动，给这一天添个安排。` + 主 CTA `看看有什么局` + `确认参加后，安排会留在这里。`——两个空态都靠范围外入口成立。
- 返回落点：`back()` 弹出 `navigationStack`（记录来源路由、活动、名单筛选、角色、滚动位置、焦点），所以从管理页返回会回到原角色、原滚动位置并把标题飞回原行（`identityFlight` 380ms）；**栈空时在 s00 按返回 → 进入 s01 看见局（发现页，范围外）**，见 `s00-back-lands-on-s01-discovery.png`；在其他页栈空 → s00。
- 草稿：R9 只有一份开局表单草稿（`state.draft`，s02），我的局里没有草稿分区、没有草稿摘要 / 删除 / 撤销；`s02-draft-form-limits-sample.png`、`s02-draft-form-blank.png` 只是开局编辑器画面。
- 历史被拆成三处：s00 `之前的安排`（含取消）、`局主归档` s09b（只含已归档的 ended）、s06 的只读 `本场记录`。

### A.2 赴约安排（s07，参加者）
截图：`s07-joined-nav-fallback.png`（R9 原样：无数据时侧栏点 07 直接回落到总览）、以及注入参加记录后的 `s07-joined-*.png`（见 §A.3）。

- 结构：标题 `赴约安排`；`agreementReading`（局名、地点/街区、日期 `MM / DD` + `年 · 周几`、时刻 + `XX当地时间`、`预计留出 时长`）；状态句（即 joinedPhase 标签）；`费用`；需要回应的状态下追加边界块：invited `这份邀请等你决定 / 上方是邀请中的安排。收到邀请不等于已经确认参加。` + `邀请回应尚未接入 / 本版本只能查看安排，不能提交决定。`；reschedule_pending `原确认已失效 / 上方是当前保存的新安排。重新确认前，你尚未恢复本场参加资格。` + `重新确认尚未接入`；cancelled `本场已经取消，原参加确认仅作记录。`；页尾 `← 回到我参加的`。
- 没有票根、撕票、联系层、候补位置、撤回 / 退出、出席记录、历史票根；路由自述（侧栏文案）："参加者只查看自己的约定与状态，不显示局主申请名单或他人的联系方式。"
- 返回：`回到我参加的` 与系统返回都走 `back()`，回到 s00 并保持 `我参加的` 角色。

### A.3 注入参加记录后的观察（本文为看清 s07 自行写入 `joinedEvents`，不属于 R9 自带数据）
【待补：shots3 结果】

### A.4 管理这局（s06，路由名"能确认"）
截图：`s06-manage-pending.png`、`s06-manage-invited-empty.png`、`s06-manage-invited.png`、`s06-manage-confirmed.png`、`s06-manage-pending-after-invite.png`、`s06-manage-pending-after-decline.png`、`s06-manage-confirmed-after-response.png`、`s06-person-pending-sheet.png`、`s06-person-invited-sheet.png`、`s06-person-confirmed-sheet.png`、`s06-handled-sheet.png`、`s06-handled-sheet-open.png`、`s06-tools-menu-open.png`、`s06-event-detail-sheet-meet/join/fee.png`、`s06-manage-scrolled-header.png`、`s06-manage-reconfirm-pending.png`、`s06-person-reconfirm-sheet.png`、`s06-manage-reconfirm-after-one-accept.png`、`s06-r9-reconfirm-sample*.png`、`s06-manage-cancelled.png`、`s06-manage-ended-unrecorded*.png`、`s06-manage-recording-twelve.png`、`s06-manage-ended-readonly.png`、`s06-person-ended-sheet.png`、`s06-manage-no-applicants*.png`、`s06-manage-pending-long-intro.png`、`s06-person-long-intro-sheet*.png`。

- 进入方式：s00 行点击（按阶段预置名单筛选 `rosterFilter`）、s05 的 `报名管理`、s09a 空态 `查看报名状态`、s09b 空态 `回到这场活动`。返回落点由栈决定（通常 s00 同角色同滚动位）。
- 外层标题按活动状态改名：open `谁想来`；recording `这场见面`；ended `本场记录`；cancelled `这场已取消`。右侧文字动作 `活动详情` → `r8OpenAgreement` 抽屉（三 tab `见面 / 参与 / 费用`，纯 `dl` 文本：日期、开始、当地时间、预计时长、预计结束、碰面地点、碰头说明 / 加入方式、参加范围、报名截止、`计划人数 含你共 N 人`、赴约补充 / 费用安排、包含范围、费用说明）。**R9 没有"查看完整原局卡并回收"的票卡对象，"完整局卡"只是这份文本抽屉**；局卡画面只出现在 s05 分享页与 s09a/s09b 票面。
- 活动上下文块：局名、`MM.DD HH:MM 地点`、状态句（cancelled `报名、邀请和赴约已关闭`；ended `已结束 · 出席记录只读`；recording `正在记录 · 名册与时间已固定`）、容量句 `r4Capacity`（open：`N 位确认 · N 位留位 · N 位空位 / 暂无空位`；recording：`名册已固定 · N 位应到`；ended：`本场 N 位应到 · 已归档`；cancelled：`取消前 N 位已确认`）、`安排 ˅` 下拉（`记录出席` / `计划有变` / `历史归档`，随状态禁用；recording 时附注 `首次记录后，名册与时间固定。`，cancelled 附注 `本场已取消，保留原申请记录。`）。当前任务条（`查看出席记录` / `继续记录出席` / 24 小时内 `查看本场名册`）。
- 名单 tab（`role=tablist`，带计数）：`待处理`（recording 时叫 `未处理`）/ `待确认` / `已确认`（cancelled 时叫 `原确认`）。初始 tab：recording / ended / 有确认的 cancelled → 已确认；无申请但有留位 → 待确认；否则待处理。
  - 待处理 / 待确认行：卡片（姓名、状态 `新申请` / `已留位，等本人确认` / `新时间待回复`、留言摘要 58 字截断、来源 `邮箱域名 · xxx` / `邮箱已验证 · xxx` / `未提供邮箱资料`、`查看申请 / 查看详情`、`留位至 10/22 15:40`）。
  - 已确认 / 改期待回复行：紧凑行（人形图标、姓名、`本人已确认`）。
  - 改期后 `待确认` tab 顶部插入 `共同的新安排 / 2026.11.07 · 19:30 / 海底捞 · 纽约当地时间`。
  - 每个 tab 的空态各有一句（例：待处理 `这场，等你邀约 / 分享这场活动，一起把时间约好。`、`申请都看过了 / N 位已留位，正在等本人回复。`；待确认 `没有等待中的邀请 / 邀请成功后，这里会保留对方的回复状态。`；已确认 `还在等本人点头 / 本人确认后，名字会出现在这份名单里。`；recording `本场名册已固定 / 尚未确认的申请不在本场应到名册中。`；closed `这次约定已取消 / 原来的确认和处理结果仍可查阅。`）。
- 名单尾部 `已处理的申请 N →`：抽屉列出 declined / expired / exited / cancelled 四类人的最终结果（`已谢绝` / `留位已到期` / `已退出` / `活动已取消`），可展开留言、来源、`留位截至 …`。**这就是 R9 的"离开记录"：与当前名单分层，但不区分"主动退出 / 拒绝改期"（都是 exited）**。
- 页脚：`计划共 N 人，含你`（cancelled / ended 时 `原计划共 N 人，含你`）与 `导出与分享 →`（→ s05）。
- 人员详情（`personDetail`，底部抽屉）：深蓝人员横幅（姓名、状态词、状态细句）、留言气泡、活动上下文行、来源、联系块、（待处理时）容量句；页脚 `谢绝这位` + `邀请这位`（无空位时 `暂无空位` 禁用）或 `回到名单 →`。邀请 / 谢绝后关闭抽屉，姓名"飞"到目标 tab（`moveName` 480ms），名单重排 360ms，计数 200ms 弹入。
  - 联系块（`contactMarkup`）：可联系时 `微信号 / demo-contact-1 / 复制微信号`（真实 `navigator.clipboard`，失败显示 `复制失败 · 点击重试`）；否则一句关闭原因：`确认并成局后交换联系方式`、`联系方式已关闭`（取消）、`联系方式已关闭 / 本场结束已超过24小时。`、`当前未参加本场`、`不在本场应到名册中`、`确认新安排后，再交换联系方式`。**R9 没有独立"联系信息"tab，联系信息只在人员详情里、只对局主可见。**
- 候补：R9 局主侧没有候补队列；满员时只有 `暂无空位` 禁用态与 `预留已满 · 可候补 / 已成局 · 可候补` 的发现页卡片文案（V27 vendor）。
- 成员与席位：没有席位图、没有把局主画进名单（只在页脚 `含你`），空位只是数字。待出票 / 已撕票的区分不存在。
- 分页：名单超过页容量时 `第 1 / N 页 · 共 N 位`（实际 pageSize = 全部，故未触发）。
- 出席 / 改期 / 取消均从 `安排 ˅` 进入；s06 不承载改期答复操作（局主只看回复状态，回复靠评审按钮模拟）。

### A.5 计划有变（s08：改时间、取消）
截图：`s08-plan-active.png`、`s08-plan-future.png`、`s08-time-editor-date/time/duration.png`、`s08-reschedule-confirm-sheet.png`、`s08-plan-after-reschedule-saved-note.png`、`s08-plan-after-reschedule.png`、`s08-plan-history-open.png`、`s08-reschedule-confirm-sheet-last-quota.png`、`s08-plan-quota-exhausted.png`、`s08-reschedule-confirm-disabled-no-quota.png`、`s08-cancel-confirm-sheet.png`、`s08-plan-cancelled-locked.png`、`s08-plan-ended-locked.png`、`s08-plan-ended-unrecorded-locked.png`、`s08-plan-r9-reconfirm-sample.png`。

- 进入：s06 `安排 ˅ → 计划有变`、s00 已取消行、s09a 门控页 `查看现在的安排`。返回：栈。
- 结构：活动卡（时钟图标、局名、地点 · 街区）→ 单节点时间轴（`现在的约定` / `11 月 5 日 周四` / 大字 `19:30` / `纽约当地时间 · UTC-5` / `预计留出 时长待定`）→ `换个时间见 / 日期、时刻与时长 →` → `本年度改期额度 / 2026 年 · 全年 2 次 / 当前剩余 N 次` → `这次见不成了？ / 取消后，报名与邀请都会关闭。 / 取消本场 →`（红）→ `之前改过的时间 N 次 ˅`（展开：新时间、时长、`第 N 版`）。
- 改时间 = `editTime` 抽屉 `约在什么时候`（tab `日期 / 开始 / 时长`；日历 + 直接输入；24 小时制时分 + 常用分钟；时长 1 / 1.5 / 2 / 3 小时、自定（≤30 字，计数校验）、暂不设时长；CTA `定下这个时间`）→ `把约定改到这里` 确认抽屉（逐项 `原来 → 新`、新约定摘要、后果 `N 位需要重新确认 / 原参加确认与票件暂时失效，等本人确认新安排。` + `另有 N 份未确认邀请将到期释放。`、额度预测 `本次使用 1 次。确认本次改期成功后，还剩 N 次。`、`继续修改` / `确认这次修改`）→ 回到 s08，`现在的约定` 块高亮 520ms 并出现 `新约定已保存` 2.4 s。可提交 / 不可提交：时间未变 → `未作修改，原约定保持不变`；过去时间 → `选择未来的见面日期`；额度 0 → CTA 禁用 + `本年度额度已用完，超额处理暂不可用。`。
- 改期答复（局主视角）只在 s06 `待确认` tab 看回复状态；接受 → 落入 `已确认`（新版票 id），拒绝 → 落入 `已处理的申请`（`已退出`）。
- 取消 = `取消这次约定` 抽屉（`这次约定` 卡、`取消以后，不能撤销。` + 三条后果、`本年度取消额度 全年 1 次` + 预测、`保留这场活动` / 危险按钮 `确认取消活动`）→ 回 s06 `这场已取消`；此后 s08 锁定 `本场已经取消 / 上方保留本场原定安排。 / ← 返回本场`。其他锁定句：`已归档，保留这份约定`、`这场已经结束 / 实际结束后，不能再改期或取消。`、`计划已经固定 / 出席记录开始后，名册和时间不再修改。`。
- 没有"票件失效 / 燃烧"画面：取消后票面文字变为 `活动已取消`（s05 `这局取消了`，`s05-published-cancelled.png`），分享按钮仍可用，`报名管理 / 6 位已确认参加` 仍按确认数显示。

### A.6 出席（s09a，路由名"会出现"）与散场 / 归档
截图：`s09a-gate-not-ended.png`、`s09a-empty-future-not-ended.png`、`s09a-record-ready-person1.png`、`s09a-record-ready-twelve-first.png`、`s09a-roster-sheet-complete.png`、`s09a-roster-sheet-twelve.png`、`s09a-stamp-seq-*.png`（序列帧，§D）、`s09a-interrupt-*.png`、`s09a-reduced-motion-after-record.png`、`s09a-complete-result.png`、`s09a-complete-arrival-early/settled.png`、`s09a-complete-twelve-long-names.png`、`s09a-correction-view.png`、`s09a-correction-edit.png`、`s09a-correction-saved.png`、`s09a-complete-result-after-correction.png`、`s09a-archive-confirm-sheet.png`、`s09a-archived-readonly.png`、`s09a-empty-roster.png`、`s09a-archive-empty-confirm-sheet.png`。

- 进入：s00 行（已结束 / 记录中 / 24 小时内）、s06 `安排 ˅ → 记录出席` 或当前任务条、s09a 自身的名册抽屉。返回：栈。
- 前置门控：没有"实际结束证据"（`actualEnd`，演示中由样本 adapter 写入）时显示 `出席记录 / 等这场见面结束 / 活动实际结束后，才能记录这 N 位参加者的出席情况。` + `查看现在的安排 →`；无确认者时 `还没有确认参加的人` / `还有邀请，等本人确认`（附 `待处理申请 N / 待本人确认 N`）/ `申请来了，名册还在等`，CTA `查看报名状态`。**R9 没有局主"记为散场"动作；"散场"事实来自外部证据，局主能做的终点动作是"结束并归档本场"。**
- 记录页：标题 `会出现` + 副题局名；右上 `名册`（抽屉 `本场名册`：`N 位应到 / N 位已记录`，逐人 `01 小面 本人已确认参加 待记录 / 出席 / 未出席`，点人进入查看）；`已记录 n / N` + 进度条；身份块 `正在记录 / 小面 / 邮箱域名 · columbia.edu / 第 01 位`；票卡桌面（当前票卡 + 下一张在后面微露）；底部工具区 `这位是否到场？` + `未出席`（弱按钮）/ `出席`（主 CTA）。
- 单人序列：点按 → 立刻写入 → 盖章（quick 时序）→ `已记录 · 出席` 停留 → 旧卡飞出、下一张就位 → 下一位身份滑入；最后一位完成后整页换成结果页 `出席记录齐了`（活动块、`出席 N 人 / 未出席 N 人` 两列姓名、`已保存 N 位的出席结果，归档前可修正。`、CTA `回看与修正记录`、`结束并归档本场`）。细节与计时见 §D。
- 更正：结果页或名册点人 → `查看记录 / Momo / 第 02 位` + 票卡（已盖章）+ `修改记录` / `返回本场记录 →`；`修改记录` → `调整这位的记录` 双选 + `保存修改` / `保留原记录`；保存 = 直接重贴章面（无盖章动画）+ 亮度闪 320ms，宣告 `Momo的记录已修改`；数据层保留 `recordedAt` 并写 `modifiedAt`，但没有变更轨迹列表。规则句（state.js）：`已有记录可以修改，不能退回未记录。`
- 归档：`结束并归档本场` → 若有人未记录：`还有出席记录未完成 / 先记下这 N 位的出席状态，再结束本场。` + 名单 + `继续记录`；否则 `结束这场见面`（`已记录 N 位，记录齐全`、`归档后保留历史 / 归档后，出席记录变为只读，不能再修正。`、`保留当前活动` / `确认结束并归档`）→ s09b。空名册：`这场没有应到者 / 无需记录出席，可直接归档活动安排。` → `归档这场空名册`。归档后 s09a 为只读结果页 `这一场，已归档`，名册抽屉改名 `出席记录 · 只读`，s06 改名 `本场记录`。
- 出席印记对象：V27 票卡（英文大标题 `HOTPOT RESCUE`、书法中文局名、`活动已结束`、`SEATS / WHERE / TIME` 英文栏、参加者姓名与票号条）+ 橡皮章（绿 `出席` / 红 `未出席`，环文 `JU / NYC`、`WE WERE HERE`、年份）。

### A.7 归档墙（s09b，标题"留下这一局"）
截图：`s09b-archive-wall-after-archive.png`、`s09b-archive-wall-intro-settled.png`、`s09b-archive-wall-next.png`、`s09b-archive-people-sheet.png`、`s09b-archive-empty-product.png`。

- 进入：s00 `局主归档`、s06 `安排 ˅ → 历史归档`、s09a 归档确认、s05 `看看这场的归档`。
- V27 三维票根墙（`profile:'archive'`）：从 s00 进入时播放 1.9 s intro 再进入浏览；归档刚完成进入时跳过 intro；左右拖 / 方向键换场，点按 / 空格翻面。下方事实块：局名、`2026.10.20 19:30 纽约当地时间`、`海底捞 · 纽约`、`N 人出席 N 人未出席`（历史演示样本显示 `历史演示 · 无逐人记录`；空名册 `归档时没有应到参加者`），`查看本场出席记录 →` 抽屉 `本场出席记录 只读`。
- 空态：`还没有结束的活动 / 由你发起、主动结束的活动，会把安排和出席记录留在这里。` + 当前活动卡 + `回到这场活动 / 查看我的局`。
- 墙里只有局主自己归档的局；参加者的历史票根不存在。

## B. 规则与文案核对表（R9 原文 vs 上一轮核心 `src/core/ju-data.js`）

说明：R9 原文均可在 `R9.code.html` 中 grep；ju-data 引用 `JU.RULES` / `JU.COPY` / `JU.STAGE` / `JU.engine`。只列事实，不裁定。

| # | 规则 | R9 的实际表述 / 行为 | ju-data.js 的表述 / 行为 | 一致性 |
|---|---|---|---|---|
| 1 | 预留 6 小时 | 代码：`invite()` → `p.deadline=Date.now()+6*3600000`，到期自动 `expired`（`scheduleExpiry`，窗口聚焦 / 可见时补查）。文案只给算出来的截止：`留位至 10/22 15:40 · 纽约当地时间`、`留位已到期`、`${name}的留位已到期，空位已释放，结果保存在已处理申请。`；人员细句 `已留位，等本人确认`。"6 小时"四个字只在 V27 vendor 候补回执画面里出现：`轮到后需在6小时内确认`（R9 路由未挂载）。 | RULES.confirm：`邀请发出后预留 6 小时，重开页面不续时`；STAGE.waitlist：`轮到你时才开始 6 小时预留`；COPY.approveHelp：`发出邀请后对方有 6 小时阅读约定并确认`；engine.approve `deadline: NOW + 6*H`。 | 时长一致。术语不同：R9 全程用"留位"，ju-data 用"预留"。R9 没有向局主解释 6 小时，只显示截止时刻。 |
| 2 | 联系 8 小时 | R9 里没有"8 小时"（grep `8小时` / `8 小时` = 0），也没有撕票步骤。联系开放条件 `canContact`：已成局 `formedAt` 且本人已确认当前版本且 `ticketReleased` 且未取消且（未结束或结束 24h 内）。文案：`确认并成局后交换联系方式`、`微信号 … 复制微信号`。 | STAGE.contact：`撕票后 8 小时内联系局主`；RULES.meet：`撕开副券后 8 小时内联系局主；成局后仅局主可见你的微信`；RULES.credit：`撕券后 8 小时未联系，不自动算故意缺席`；COPY.contactNote：`撕券后 8 小时内联系局主。此处为示例微信。` | **不一致**：R9 无 8 小时窗口、无撕票前置；"仅局主可见微信"这一点两边一致（R9 s07 自述不显示他人联系方式）。 |
| 3 | 散场后 24 小时联系关闭 | 代码：`Date.now()<r.endedAt+86400000`；文案：`联系方式已关闭 / 本场结束已超过24小时。`；取消抽屉：`联系方式关闭，出席记录不再开放。`。`endedAt` 来自实际结束证据或归档，不是局主动作。 | RULES.meet：`联系方式有查看期限：退出、拒绝改期、取消后票和联系入口失效；散场 24 小时后关闭。`；COPY.endEvent：`成员微信在散场 24 小时后不再可见。`；derive：`已散场 · 24 小时内仍可查看成员微信`。 | 时长一致。差异在"散场"的来源：ju-data 是局主 `记为散场`，R9 是外部"实际结束证据"。 |
| 4 | 年度 4 次主动退出 | R9 没有参加者退出额度（grep `4 次` = 0；参加者侧没有退出动作）。R9 另有**局主侧**年度额度：`quota()` → 改期 2 次、取消 1 次（按 America/New_York 业务年，`annualLedger` 真计数）；文案：`本年度改期额度 / 2026 年 · 全年 2 次 / 当前剩余 N 次`、`本次使用 1 次。确认本次改期成功后，还剩 N 次。`、`本年度额度已用完，超额处理暂不可用。`、失败句 `本年度免费改期次数已用完，超额处理政策尚未接入。` / `本年度免费取消次数已用完，超额处理政策尚未接入。`；侧栏 `年度免费额度仍由同一局主共享；不会重置账本。` | RULES.credit：`每年 4 次主动退出机会，跨活动、未撕 / 已撕共用；接受改期后再退出也计入。`；COPY.exit：`记为主动退出（同一账户每年共 4 次）`；engine.exitEvent 只改状态、不计数。 | **不一致**：R9 无参加者 4 次规则；R9 新增 ju-data 没有的局主改期 2 次 / 取消 1 次额度，且两处都标明"超额处理政策尚未接入"。 |
| 5 | 容量含局主 | 代码：`capacity = need + 1`（blank / sanitize / publish / counts 全部如此；`need` 1–12 为"还招人数"）。文案：`计划共 N 人 · 含局主`（s05）、`计划共 N 人，含你` / `原计划共 N 人，含你`（s06 页脚）、`计划人数 含你共 N 人`（活动详情）；容量句 `N 位确认 · N 位留位 · N 位空位`。发现页票面（vendor）：`还缺 4 人 · 不算局主`。 | 文件头：`capacity includes the host`；`counts()` 把 host 计入 confirmed，`seats()` 第一格为 host。 | 一致（总人数含局主）。R9 的 `need` 与 `capacity` 是两个数，ju-data 只有 `capacity`。 |
| 6 | 全员确认才成局出票 | 代码：每位接受邀请即 `ticketId = event:v{version}:person`、`ticketReleased=true`；`formedAt` 在确认数等于 `need` 时写入（即全部席位确认）；联系方式门控 `formedAt`。文案：`本人已确认，等这局成行。`（已确认但未成局）、s05 标题 `这局，约好了`（成局）/ `约定，保存好了`；票面 `SEATS 7/9 已确认 · 0 已预留`。"出票"一词不存在（grep = 0），参加者侧没有票根画面。 | RULES.confirm：`全员确认，才成局出票：包括局主在内全员确认后才出票。`；STAGE.gathering：`包括局主全员确认后才出票`；文件头：`ticket valid only for the current version`。 | 成局判定一致（全部席位确认）。**出票时点不一致**：R9 数据层在每人确认时就生成票 id，并未表达"成局才出票"；版本绑定一致。 |
| 7 | 改期：接受 = 新票 / 拒绝 = 释放席位 | 代码：改期 → 已确认者变 `reschedule_pending`、`ticketReleased=false`、未确认留位直接 `expired`、`version++`、清空名册与结束证据；接受 → `acceptedVersion=version`、新 `ticketId=…:v{version}:…`；拒绝 → `status='exited'`（与主动退出同一状态，标签 `已退出`），席位从计数中释放。文案：`N 位需要重新确认 / 原参加确认与票件暂时失效，等本人确认新安排。`、`另有 N 份未确认邀请将到期释放。`、行 `新时间待回复`、`共同的新安排`、人员细句 `…等待本人回应。`、联系 `确认新安排后，再交换联系方式`；参加者侧 `时间有变化 · 原确认已失效`、`重新确认前，你尚未恢复本场参加资格。`。容量句把待回复者计作"留位"（`0 位确认 · 7 位留位 · 1 位空位`）。 | RULES.meet：`接受新时间就撕开新版副券；去不了可点「去不了了」`；COPY.repliesHelp：`接受的人换新版票并保留已加微信；拒绝的人释放席位，不计主动退出。`；STAGE.declined：`拒绝改期 · 席位已释放`（独立于 exited）；COPY.decline：`…不记你的主动失约，也不消耗主动退出机会，旧票不恢复。`；engine.acceptReschedule 新票 `{version, torn:true}` 并保留 contactAdded。 | 接受 = 新版票一致；拒绝 = 释放席位一致。**不一致**：R9 拒绝改期落入 `exited`，不与主动退出区分；R9 改期时未确认留位立即到期（ju-data 无此规则）；ju-data 的"保留已加微信"在 R9 无对应物。 |
| 8 | 取消不可逆 | 文案：`取消以后，不能撤销。` + `关闭本场报名与邀请。` / `N 位原确认保留为历史记录，不能再用于赴约。` / `联系方式关闭，出席记录不再开放。`；s08 `取消后，报名与邀请都会关闭。`；参加者侧 `约定已取消`、`本场已经取消，原参加确认仅作记录。`。代码：`status='cancelled'`，pending / invited / reschedule_pending 变 `cancelled`，所有 `ticketReleased=false`，并消耗年度取消额度。 | COPY.cancelEvent：`活动、未确认的邀请和候补一起结束；成员不计主动退出。` + irreversible `取消后已出的票根作废、联系入口关闭，不能撤销。`；STAGE.cancelled：`局主取消 · 票根作废，不计你的退出`。 | 不可逆、联系关闭一致。差异：R9 有取消额度；R9 没有"票根作废 / 燃烧"的表达（票面改字 `活动已取消`），也没有"不计成员退出"的句子（因为它根本没有退出计数）。 |
| 9 | 未出席是事实不是惩罚 | R9 没有这类句子（grep `惩` / `处罚` / `失约` = 0；`缺席` 只出现在 `不会生成出席或缺席记录`）。相关文案：`这位是否到场？`、`已记录 · 未出席`、`已保存 N 位的出席结果，归档前可修正。`、`名册与时间已固定，出席记录仍可修正。`、`已有记录可以修改，不能退回未记录。`、`归档后，出席记录变为只读，不能再修正。`、`已归档 · 每个人的出席结果只供查阅。`。更正只写 `modifiedAt`，无轨迹。 | COPY.attendanceHelp：`未出席是待核实的事实，不等于故意缺席，也不会自动处罚；可随时更正，更正会留下记录。`；engine.attend 写 `trail:[{v,at}]`。 | **不一致**：R9 没有"待核实 / 不处罚"的表述；R9 归档后不可更正，ju-data 说"可随时更正"；R9 无更正轨迹。 |
| 10 | 没有信用分 | 无 `信用` 字样（grep = 0），无任何分数 / 等级；`state.js` 头注释 `no transmission, payment or invented credit policy`。 | 同样没有分数，但 RULES 有一组标题叫 `信用`，STAGE.rejected `这次没留住 · 不影响信用`，COPY.withdraw `不影响信用`。 | 都没有信用分；ju-data 文案仍使用"信用"一词，R9 完全不用。 |
| 11 | （补）候补 / 撤回 / 放弃预留 / 退出候补 | 局主侧无候补队列；参加者侧无撤回、放弃、退出动作（s07 只读）；只有 V27 vendor 票面文案 `候补 第 N 位`、`邀请已到期，预留席位已释放。`、`这次候补已经结束。`。 | STAGE 有 waitlist / invited_queue / queue_left / released / withdrawn；COPY.queueHelp `有人放弃或预留到期时，按顺位自动发出 6 小时预留。` | R9 未实现，无法核对。 |

## C. 接缝清单（R9 里指向本轮范围外的入口）

任务书 §09.E：这些入口本轮不渲染为可点击假入口；可保留必要导航位置，范围说明放手机外。下表记录 R9 现状与各自文案，"本轮处理"一列只是对照任务书的归类，不是设计方案。

| 位置 | R9 文案（原文） | R9 实际去向 | 范围归类 | 本轮处理 |
|---|---|---|---|---|
| s00 标题行返回键（导航栈为空时） | `返回`（aria-label，图标） | `s01 看见局`（发现页） | 发现 | 惰性；手机外注明"返回落点在本轮范围外"。 |
| s00 页底 | `→ 找局` | `s01` | 发现 | 惰性入口，文案保留 `找局`。 |
| s00 页底 | `+ 开一局` | `startCreate()` → `s02 想开局` | 开局编辑器 | 惰性入口，文案保留 `开一局`。 |
| s00 局主空态主 CTA | `开一局`（`先定下一个好主意 / 从活动、时间和地点开始，把想做的事约起来。`） | `s02` | 开局编辑器 | 空态不能依赖它成立（§09.D）；保留位置、不可点。 |
| s00 参加者空态主 CTA | `看看有什么局`（`一起做点什么 / 找一场想参加的活动，给这一天添个安排。` / `确认参加后，安排会留在这里。`） | `s01` | 发现 | 同上。 |
| s06 页脚 / 各 tab 空态 / s00 "约定已保存"行 | `导出与分享 →`、`分享这次约定` | `s05 发出去`（`导出分享图` 真实下载 PNG、`复制活动编号` 真实剪贴板、`核对赴约安排`、`报名管理`） | 发布 / 分享流程（开局后段） | 惰性；`s05` 整页不进入本轮。 |
| s05 | `报名管理` / `看看这场的归档` | `s06` / `s09b` | 范围内回流 | 随 s05 一起不渲染。 |
| s01 主导航 | `找局 / 开局 / 我的局 / 设置` | s01 / s02 / s00 / 背景抽屉 | 发现、开局、设置 | 整页范围外；`设置` 在 R9 只是背景选择（`Cotton Candy 棉糖 / Halo 光晕 / Sunset 落日`）。 |
| s01 / s02 | `切换城市`、`时间城市`、编辑区域 | `openCity` / `openArea` 抽屉 | 城市选择 | 范围外。 |
| 开局表单草稿 | `编辑草稿`（s04 → s02）、R9 专项样本 `合规上限 · 上海 / 2027 草稿` | `s02` | 开局编辑器 | 本轮草稿只做摘要 / 删除 / 撤销，不进编辑器；R9 没有"继续编辑草稿"在我的局里的入口。 |
| 登录 | — | — | 登录 | R9 没有登录概念（无用户对象、无登录页）。 |
| 参加者回应 | `邀请回应尚未接入` / `重新确认尚未接入` / `本版本只能查看安排，不能提交决定。` | 无 | 真实服务（回应通道） | R9 已是惰性说明块；本轮参加者动作（确认 / 释放 / 撤回 / 退出 / 答复）在 R9 没有前例。 |
| 局主模拟回应 | 侧栏 `模拟下一位确认` | `receiveResponse(id,true)` | 评审控制 | 保持在手机外。 |
| 实际结束证据 | 侧栏 `结束证据仅为本地演示 adapter`；门控页 `等这场见面结束` | 样本写入 `actualEnd` | 真实服务 | R9 没有"记为散场"按钮；本轮若做散场动作，与 R9 无接缝可继承。 |
| 额度政策 | `超额处理政策尚未接入` / `超额处理暂不可用` | 失败返回 | 真实服务 | 演示假设，不是已确认规则。 |
| 外部通知 / 分享服务 | 侧栏 `外部通知与分享服务未接通`；`exportContract().externalDelivery='not-connected'` | — | 真实服务 | 保持手机外说明。 |
| 剪贴板 | `复制微信号` / `复制活动编号`（`正在复制… / 已复制 / 复制失败 · 点击重试`） | `navigator.clipboard.writeText`，失败才报失败 | 本地能力 | 范围内可继承其"只在真实成功时报成功"的做法。 |

## D. 出席印记 / 散场序列的实际观察

### D.1 代码定义的时序（设计意图，来自源码）
- 盖章引擎 `vendor/ju-tickets-host.js` + `vendor/ju-stamp.js`，出席页用 `profile:'quick'`：`enter 0–0.12 s → press 0.12–0.21 → ink 0.218–0.26（墨迹出现）→ lift 0.29–0.40 → exit 0.40–0.54 → end 0.56 s`（归档墙用的 `DEFAULT_TL` 是 0.18–2.95 s 的长版）。`t ≥ 0.56 s` 触发 `completeStamp()` → `onComplete`。
- 应用层 `renderAttendance` / `markAttendance`：点按 → `H.record()` 同步写入 → `setPhase('stamping')`（按钮文字 `正在记录`，`aria-busy`）→ `ticket.setMode(status)` 播章 → `stampComplete` → `setPhase('hold')`（结果句 `已记录 · 出席`，按钮 `出席 · 已记录`，计数 `已记录 n/N` 弹入 480ms）→ `later(handoff, 560ms)` → `setPhase('handoff')`：旧卡 `perspective` 右上飞出并淡出 570ms（`cubic-bezier(.36,0,.35,1)`），下一张从偏移 (9px,13px, 2.2°) 就位 570ms（`cubic-bezier(.24,.68,.22,1)`）→ `settle` → `setPhase('ready')`，下一位身份块右侧滑入 460ms，按钮解锁。
- 期望总时长（点按到下一位可操作）≈ 0.56 + 0.56 + 0.57 ≈ **1.7 s**；减少动态：章即时落定、hold 160ms、handoff 120ms 淡出 ≈ 0.3 s。
- 最后一位：`settle` 无下一张 → `go('s09a',true)` 重绘结果页，入场分 4 层（提示 0ms、记录纸 45ms、脚注 95ms、动作 115ms，各 300ms，`cubic-bezier(.16,1,.3,1)`）≈ 0.42 s；以 `JU_LAST_STAMP.startedAt` 去重，只播一次，重进不再重播。
- 更正保存：不播章，`setSettled` 直接换章面 + 亮度 320ms。

### D.2 本环境实测（headless chromium + SwiftShader 软件 WebGL，机器同时在跑其他任务）
- `JU_TICKETS.diag()`：`webgl:true, profile:'quick'`。点按 `出席` 的同一次事件循环内：`attendance` 记录数 0→1、`status: open → recording`、`attendancePhase: stamping`、返回键 / `未出席` / `名册` 均 `disabled`（`motion.json run1.click`）。**数据写入在动画之前**。
- run1（小面 · 出席，无截图干扰，`performance.now`）：click +0 → stamping（日志首帧 +657ms，为记录器延迟）→ hold **+2886ms** → handoff **+4396ms** → 下一位 ready **+11497ms**；`JU_LAST_STAMP.elapsedMs = 1865`（代码 560），handoff `settledAt − startedAt = 5475ms`（代码 570）。以上是软件渲染下每帧约 1 s 造成的拉长，**不能当作正常速度**；正常速度的画面本环境无法得到，需实机复核。
- run4（减少动态，Kiki · 出席）：hold +1128ms → handoff +1143ms → ready +4203ms，同样受渲染速度拉长；但各阶段都正确落定。
- 可打断性：stamping / hold / handoff 期间工具区按钮和标题栏按钮全部 `disabled`，点击无效（`motion.json interrupt.mid`：返回、未出席、名册三个点击都没有改变路由、阶段或打开抽屉）；长按 Enter / 空格被 `attendanceHeldKeys` 吞掉，避免连带标记下一位；`busyStamp` 防双击。**手机内没有任何方式打断序列**。从手机外（评审导航 / `go()`）在 stamping 中途离开：`go()` 清掉计时器、取消动画、销毁票卡，记录保持已保存（3 条），回到 s09a 后直接显示第 4 位 `Kiki`、`已记录 3/6`（`s09a-interrupt-navigated-away-mid-stamp.png`、`s09a-interrupt-returned-next-person.png`）。失败路径（`H.record` 不 ok）：按钮改为 `重试记录出席 / 重试记未出席`，结果句 `记录未保存，请重试`，不播章。
- 完成转场：`s09a-complete-arrival-early.png`（结果页出现后 ~150ms）与 `s09a-complete-arrival-settled.png` 已无差异，说明 0.42 s 的入场在截图前结束。

### D.3 逐帧（Playwright 假时钟推进 JS 计时器 / `performance.now` / rAF，Web Animations 仍走真实时间）
【待补：motion2 帧清单】

### D.4 散场 / 归档序列
- R9 没有燃烧、撕券、打印：`结束并归档本场` → 确认抽屉 → `H.archive()` → `go('s09b', true, {kind:'save'})`。归档墙在 `selectedEventId` 已设时 `skipIntro`，直接显示刚归档的票卡；从 `局主归档` 入口进入则先播 1.9 s 的 V27 intro（`INTRO_DUR`）再可浏览。取消后也没有票件作废动画，只是票面文字 `活动已取消`。
- 归档后不可再更正（抽屉原句 `归档后，出席记录变为只读，不能再修正。`）。

## E. 不应继承的东西（观察，不写方案）

按任务书 §03 诊断口径的六条逐一对照：① 物件世界挤占构图、JU 内容退成道具上的小内容；② 换材质 / 放大不等于成熟；③ 机关、编号、英文、盖印、厚边反复消耗资源；④ 仪式动作替代日常查看质感；⑤ 业务规则与旧表现决定混淆；⑥ 未实测不得写成已实测。R9 不是"未通过的十套"，但下列组织 / 布局决定同样没有获得认可：

1. **总览首条大卡 + 其余压成列表**（`s00-host-multi.png`）：第一条被拆成两块表面（白卡 + 下移的日期块），其他局缩成文字行；"哪场要处理 / 哪次见面将至"的主次只靠排序位置（口径 ①②）。
2. **吸顶 rail 与正文冲突**（`s00-host-multi-scrolled.png`、`s00-host-multi-bottom-past.png`）：滚动时大卡的 `3 份申请等你看 / 看看谁想来` 画在 `我参加的 / 我发起的` rail 上面，正文没有被 rail 裁掉——这是实测看到的层级错误（口径 ⑥，已实测）。
3. **标题收拢后的裁切留白**（`s06-manage-scrolled-header.png`）：短名单页滚动后标题进入工具行，正文顶部被 `clip-path` 裁掉但占位仍在，出现约 260px 空白（口径 ⑥，已实测）。
4. **"我的局"没有当前 / 历史 / 草稿分区，历史拆在三处**（s00 `之前的安排`、s09b `局主归档`、s06 `本场记录`），草稿根本不出现；参加者侧只有空态（口径 ⑤：这是 R9 的组织决定，不是业务事实）。
5. **空态依赖范围外按钮**（`开一局` / `看看有什么局`），与 §09.D "空态和单项态仍有完整构图，不依靠范围外入口成立"相反。
6. **返回键把"我的局"送回发现页**（`s00-back-lands-on-s01-discovery.png`）。
7. **管理页的三 tab + 下拉"安排" + 独立"已处理的申请"抽屉 + 纯文本"活动详情"抽屉**：候补、联系信息、离开记录、席位都没有自己的位置；拒绝改期与主动退出混为 `已退出`；容量句把改期待回复算作"留位"（口径 ⑤，表现决定与业务事实缠在一起）。
8. **人员详情 = 深蓝横幅 + 聊天气泡**（`s06-person-*-sheet.png`）：留言被做成气泡、人形图标与蓝底占据首屏一半，活动与联系信息退到下方（口径 ①）。
9. **计划有变页的单节点"时间轴"与超大时刻**（`s08-plan-future.png`）：一个圆点和一条竖线只承载一个节点，`19:30` 约 60px，`本年度改期额度 / 全年 2 次`、`取消额度 / 全年 1 次` 这些未确认的演示政策占据正文重要位置（口径 ②⑤）。
10. **出席票卡的英文主导与票号条**（`s09a-record-ready-person1.png`）：`HOTPOT RESCUE`、`SEATS / WHERE / TIME`、`REAL PLANS ONLY`、`WE WERE HERE`、参加者名下的 34 位票号 slug 都比中文局名更抢眼；章面环文也是英文（口径 ①③）。
11. **序列不可打断、每位必须看完 ≈1.7 s 的三段动画**，且归档墙每次从入口进入都重播 1.9 s intro（口径 ④：频繁任务被仪式占用）。
12. **结果页两列姓名网格**（`s09a-complete-result.png`）与归档墙下方的纯文本事实块：首页精致、深层回到通用面板（§07 "外面精致，点进去是通用后台"）。
13. **分享页（s05）在取消 / 结束后仍保留可用的导出与复制**，`报名管理 / 6 位已确认参加` 继续按确认数计（`s05-published-cancelled.png`）。
14. **R9 路由命名**（`能确认 / 会出现 / 留下这一局 / 计划有变 / 谁想来`）和页内标题随状态改名（`谁想来 → 这场见面 → 本场记录 → 这场已取消`）是 R9 的文案决定，不是已确认的产品语言。
15. **参加者侧是只读桩**：没有票根、撕票、联系层、候补、退出；本轮"我参加的"全部状态与动作没有 R9 前例可继承，只能继承 V27 / R3 的票根实现。

## 附录 · 截图清单（`/home/user/JU/my-r2/evidence/baseline/r9/`）
【待补：最终清单】

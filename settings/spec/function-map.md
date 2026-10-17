# 「设置」功能归属表（共同台账）

列：功能／对象 → 依据与状态（①用户要求 ②源码既有 ③旧稿意图但占位或错误 ④本轮设计建议 ⑤待核实）→ 原始入口 → 本轮归属 → 操作者 → 读取位置 → 修改位置 → 数据源与稳定 ID → 操作结果 → 不应受影响的状态 → 保存、失败、返回规则 → 代码位置 → 十套覆盖情况（由 `settings/spec/coverage.md` 在实现后生成）。

| 功能／对象 | 依据与状态 | 原始入口 | 本轮归属 | 操作者 | 读取位置 | 修改位置 | 数据源 / ID | 操作结果 | 不应受影响 | 保存 / 失败 / 返回 | 代码位置 |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 设置首页与导航 | ① + ② V27 `rootTabs18 / settings19`（底部导航「找局 / 开局 / 我的局 / 设置」） | V27 底部导航；我的局十套静态「设置」字 | 设置首页：分组、当前值、身份、需要处理的计数；二级进入与返回原位 | 用户 | `derive.summary` | — | — | 进入二级、返回原位置；来自接缝时回到来源 | — | — | `jus-data.js derive.summary`；各方案 `applyJump` |
| 个人资料（称呼 / 微信 / 邮箱 + 验证状态） | ③ V27 `JuMine27.profile{nick,wx}`、申请资料含邮箱验证标记；R3 无资料字段；我的局只有 `you{name,wx}` → ④ 本轮补齐账户级编辑 | V27 报名表 / 局主申请审核中的「nyu.edu 邮箱已验证 / 未验证邮箱」 | 查看、编辑、校验、保存、取消、失败恢复；区分默认资料与报名快照 | 用户 | `d.you`；接缝 `mine[].snapshotLabel` | `engine.saveProfile` | `you.id` | 保存成功原位更新 + 「已保存」；邮箱改动 → 未验证 | `joined[].snapshot`、历史、已发布活动 | 显式保存；失败保留输入；未保存返回确认 | `jus-data.js validate / engine.saveProfile` |
| 收藏的局 | ① 必做接缝；② V27 `favKeyAt/favMove/favEnd/filteredFeed`；② R3 `H.state.favorites`（城市:下标）；③ 我的局无 | V27 入局 01 列表右滑 / 左滑；R3 首页横滑 | 设置 › 收藏管理（列表、状态识别、详情、取消、恢复、空态、归档）+ 入局接缝 + 我的局接缝 | 用户 | `derive.favorites / feed / mine` | `engine.favorite / unfavorite` | `eventId` | 标记与数量三处一致；空态完整 | 报名 / 预留 / 候补 / 票根 / 历史 | 即时；失败回弹 + 重试；重复幂等 | `jus-data.js engine.favorite…`；`state-contract.md §3.1` |
| 从收藏打开活动详情 | ① | — | 收藏详情（与来源一致；联系方式按权限） | 用户 | `derive.favorite(id)`、`feed.rows[].canSeeHostWx` | — | `eventId` | 看到最新状态；未撕票不见局主微信 | — | — | `derive.feed` |
| 默认浏览城市 | ② R3 六城 + 时区映射；③ R3 不持久化 → ④ 提升为账户级 | R3 首页「切换城市」 | 选择、搜索、无结果、返回；作用域说明 | 用户 | `derive.city`、`feed` | `engine.setCity` | `prefs.city`（`nyc/bos/la/sf/sea/chi`） | 入局接缝列表切换城市 | 已创建 / 已参加活动的城市、地址、时区、历史 | 即时 | `JUS.CITIES / CITY_COPY` |
| 通知偏好（六类） | ② 事件存在（邀请 / 预留 / 候补 / 改期 / 活动变化）；④ 「我发起的局」类别 | V27 `notificationStatus22 / requestNotification22 / notificationCopy22`（待抽取核对） | 偏好开关 + 说明 | 用户 | `derive.notify` | `engine.setNotifyPref` | `notify.prefs[key]` | 开关原位落定 | 报名 / 席位 / 待办 | 即时；失败回到原态 | `JUS.NOTIFY_CATS` |
| 系统通知权限 | ② V27 区分系统权限与提醒服务；⑤ 具体文案待抽取 | V27 设置 | 未请求 / 请求中 / 允许 / 拒绝 / 不支持 五态；申请流程 | 用户（申请）/ 系统（回答） | `derive.notify.permCopy` | `engine.requestPermission / resolvePermission` | `notify.permission` | 状态说明 + 能否送达结论 | 偏好本身 | 不可逆（拒绝后需去系统设置） | `JUS.COPY.permission` |
| 提醒服务连接 | ② V27 「允许通知不等于提醒服务已开通」 | V27 设置 | 只读状态 | 系统 | `derive.notify.serviceCopy` | 面板 `simService` | `notify.serviceConnected` | — | — | — | — |
| 外观（棉糖 / 光晕 / 落日） | ② R3 `openSettings / setSkin`（仅此一项） | R3 导航「设置」→ sheet「背景」 | 预览、应用、取消、持久化；每套以自身材质表达三种背景 | 用户 | `d.appearance.skin`、`JUS.SKINS` | `engine.applySkin` | `appearance.skin` | 背景过渡（R3：650ms 透明度 + 模糊） | — | 预览不写；应用写；取消恢复 | `JUS.SKINS / SKIN_TRANSITION` |
| 减少动态 | ① 简报要求；③ R3 仅媒体查询 → ④ 应用内偏好 | — | 开关；减少动态下状态与结果仍完整 | 用户 | `d.appearance.reduceMotion` | `engine.setReduceMotion` | — | 全方案动效缩短 | — | 即时 | 方案根元素 `.rm-user` |
| 我的记录（账户级事实） | ② V27 `openCredit22`「信用记录 / 补充与申诉」；② 我的局 `records[]`（出席 / 退出 / 补充）与八种未成行事实；① 不做公开信用分 | V27 设置；我的局「查看我的记录」（惰性） | 事实列表（出席 / 主动退出 / 安排变化）、详情、核实状态；规则文字；不算剩余次数 | 用户（查看）；局主（记录出席，不在本轮） | `derive.records / record` | 只追加（见下行） | `records[].id`、`eventId` | — | 事实本身 | — | `RECORDS()` |
| 记录补充 | ② 我的局 `addRecord kind:'note'`（局内）；② V27 `objectDraft26`（草稿与失败保留，待核对） | 我的局历史页脚「补充这局的记录」 | 从具体记录进入，追加补充（文字 + 材料），保留历史 | 用户 | `record.supplements` | `engine.addSupplement` | `recordId` | 新条目出现在该记录下 | 事实文本 | 显式保存；≥4 字；失败保留；草稿按 `recordId` 隔离 | `engine.addSupplement` |
| 出席异议 | ③ 我的局「对出席记录提出异议」仅文字 → ④ 本轮实现 | 我的局历史页脚 | 仅对「未出席 · 待核实」提出；一次；状态「异议已提出」 | 用户 | `record.dispute` | `engine.fileDispute` | `recordId` | 状态变更 + 提交内容可查 | 出席事实不被改写 | 显式保存；第二次被拒绝 | `engine.fileDispute` |
| 信用申诉 | ② V27 `selectCredit26`（关联记录的申诉，待核对） | V27 设置 › 信用记录 › 补充与申诉 | 仅对「主动退出」申诉；一次；状态「申诉已提出」 | 用户 | `record.appeal` | `engine.fileAppeal` | `recordId` | 同上 | 退出事实 | 同上 | `engine.fileAppeal` |
| 我的举报与进度 | ② V27 `openReports19 / openHelp19`「我的举报 / 举报进度 / 补充材料」；③ 我的局十套回执惰性、对象不结构化 | V27 设置 › 帮助与反馈；我的局回执「查看进度」 | 列表、详情（原文 / 对象 / 材料 / 本地编号 / 时间线）、需要补充时的补充、返回与输入保留 | 用户 | `derive.reports / report` | `engine.supplementReport`；接缝 `fileReport` | `reports[].id`、`localNo` | `needs_more → submitted` + 时间线追加 | 活动与记录 | 显式保存；失败保留；草稿按 `reportId` 隔离 | `REPORTS()` |
| 帮助与反馈 | ② V27 `openHelp19`；③ 支持渠道未接入 | V27 设置 | 帮助内容（基于真实规则）、产品反馈（与举报分开）、我的反馈列表 | 用户 | `JUS.RULES`、`derive.feedback` | `engine.submitFeedback` | `feedback[].id` | 已提交条目 | — | 显式保存 | — |
| 隐私与资料可见性 | ② 规则：成局后仅局主可见你的微信；撕有效票后可见局主微信；散场 24h 关闭；① 不新增越权开关 | V27 约定 sheet；R3 `canContact` | 说明页：一般规则 + 按你的活动派生的具体情形；无开关 | 用户（查看） | `derive.privacy` | — | — | — | — | — | `derive.privacy` |
| 账户与会话 | ⑤ V27 / R3 均未见登录、解绑、注销 → 标「本地演示」；④ 本机演示数据管理 | R3 审阅栏 fixture 清除（评审壳） | 「退出登录（本地演示）」确认 → 执行 → 结果；「本机演示数据」说明；危险操作只作用隔离数据 | 用户 | `d.session` | `engine.endDemoSession / restartDemoSession`；面板重置 | 命名空间键 | 会话结束态页面 | 已提交记录 / 举报 / 资料 | 确认 → 执行 → 可恢复 | `engine.*Session` |
| 关于、规则与支持信息 | ② JuRules26 三类约定文案（逐字）；③ 无正式服务条款 → 不伪造 | V27 约定 sheet | 规则全文长文阅读、版本（构建时间）、本地演示说明 | 用户 | `JUS.RULES`、`derive.about` | — | — | — | — | — | — |
| 复制微信号 / 账号 | ② R3 `copy()`；③ 我的局假成功 | 联系层 | 按真实结果反馈；失败给可手动复制内容 | 用户 | — | `engine.copyResult` | — | 已复制 / 未能复制 + 重试 | — | 面板可模拟失败 | `engine.copyResult` |
| 入局 01 接缝 | ① 必做 | V27 s01 | 浏览城市列表、滑动收藏、只看收藏、未报名详情 | 用户 | `derive.feed` | `favorite / unfavorite` | `eventId` | 与设置同步 | 报名状态 | — | — |
| 我的局接缝 | ① 必做 | 我的局列表 | 参加 / 发起 / 历史行 + 收藏标记 + 举报回执落点（读同一 `reports`） | 用户 | `derive.mine`、`derive.reports` | `toggleFavorite`、`fileReport` | `eventId` | 三处一致；阶段不变 | 阶段 / 票根 / 席位 / 历史 | — | — |
| 调试 / 重置 / 失败 / 权限模拟 / 方案导航 | ① 放画布外 | — | 评审面板 | 评审者 | — | 面板 | — | — | — | — | `jus-panel.html` |
| 钱包 / 支付 / 会员 / 积分 / 排行榜 / 黑名单 / 改密码 / 手机号登录 | ① 不扩张；⑤ 无依据 | — | **不做**（列为核查项，无证据） | — | — | — | — | — | — | — | — |

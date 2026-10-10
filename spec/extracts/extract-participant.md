# 我的局 · 我参加的 — 参与者侧产品语义抽取（V3 / Opus55 review canvas）

来源：`d979de84-JU-My-Ju-v3-Opus55-review-canvas.html`。
- 列表组件（jm3）标记：`#m01` 行 2356–2512；产品页 `#s01` 内同一模板（`data-scope="s01"`，绑定 `mm.*`；m01 绑定 `mj.*`，逐行 diff 一致）。m01 固定为「我参加的」（`lockNote: 评审镜像 · 固定为「我参加的」`）。
- 状态机：`ju-state.js`（行 39，`JuLedger`，localStorage `JU_V26_EVENTS_1`）→ `ju-mine27.js`（行 40，`JuMine27.participantStage`）→ 应用脚本 `STAGE27 / needLine27 / joinItem27 / joinPane27`（行 6025–6160）。
- 约定文案：`rules26.js`（行 38，`JuRules26`）。评审工具条：`ju-mine27-review.js`（行 6389）。
- 旧屏（动作跳转目标）：s02 1237 · s03 1352 · s03b 1500 · s04 1624 · s05 1685 · s06g 1815 · s06 1911 · s08 1980 · s09 2073 · s11 2202 · s12 2286。**没有 `#s04c` section**（只剩 CSS 选择器与 `armDeflate4c`）；「审核未通过」在 s04 上渲染。

---

## 1. 壳层：我的局 · 我参加的

| 元素 | 文案 / 行为 |
|---|---|
| 标题 | `我的局`（滚动 56px 内折叠） |
| 角色 tab（tablist） | `我参加的` / `我发起的`；m01 中 host 锁定（`aria-disabled`）。徽标 = 「要你回应」项数，aria `N 项要你回应`（host 侧 `N 项待你处理`） |
| 分区 tab（join） | `当前`（不显示数字）/ `历史`（显示 past 数量） |
| 读取失败 | `本机记录暂时读不出来` / `你的局没有丢，只是这台设备暂时读不到。` / 链接 `重新读取` |
| 样例脚注 | `含评审样例 · 样例不计入你的真实记录与信用`（有 fixture 时） |
| 历史页脚 | `散场后遇到问题，或对记录有异议` → `我的举报`（settings→reports）/ `信用记录 · 补充与申诉`（settings→credit） |
| 空态 · 当前（从未加入） | kind `first`：`还没有加入任何局` / `找到想去的局，申请或留位后会出现在这里。` / CTA `去找局` → 找局 |
| 空态 · 当前（只有历史） | kind `rested`：`眼下没有进行中的局` / `散场和没成行的都在「历史」里。` / `去找局` |
| 空态 · 历史 | kind `history`：`还没有结束的局` / `散场的票根和没成行的记录会分开留在这里。` / `回到当前` → join/now |

### 1.1 当前页分组（按“接下来要做什么”，不是生命周期）

| group key | 标题 | 计数 | 右侧说明 | 排序 |
|---|---|---|---|---|
| `act` | `要你回应` | n | `按截止先后` | deadline 升序（无 deadline 排后）→ 权重 invited 0 / reschedule 1 / tear 2 / contact 3 → 活动时间 |
| `soon` | `就快见面` | n | `已成局 · 按日期` | 活动时间升序 |
| `wait` | `还在等` | n | `等局主或其他成员` | 活动时间升序 |

空分组不渲染。**Lead 项** = `act[0] || soon[0]`：放大卡面、显示 `jm3-need` 一句话、6 小时进度条（有 deadline 时）、实体 CTA 按钮（`hasCta` 时）。非 lead 项只显示行内 `jm3-next` 文字（= cta，带箭头）。

### 1.2 历史页分组

| group | 标题 | 说明 | 形态 | 排序 |
|---|---|---|---|---|
| `kept`（archive） | `散场` n | `带出席记录 · 新的在前` | 票根墙（stub）：1 张 `one`（132px 图 + 文字横排）/ 2–3 `few` / >3 `many`（两列） | endedAt 降序 |
| `closed` | `未成行` n | `不计出席` | 书脊列表（spine，pack 色书脊竖排 `en`） | 活动时间降序 |

### 1.3 列表项信息（`joinItem27`）

| 字段 | 来源 |
|---|---|
| 标题 | `event.title`（` · ` 规范化） |
| 时间 | `WD MM.DD · HH:MM`（改期待答复时前缀 `改为`，显示新时间） |
| 地点 | `loc` 取 `-` 后街区（详情用 `区 · 街区`） |
| 状态行 | 圆点 + `label`；tone 色：act / go / wait / void / kept；有 deadline 时附 `<time>` `HH:MM:SS`（t5Color 随剩余比例变色） |
| 座位段（仅 gathering） | 每席一段（局主 / 已确认 `ok` / 已预留 `res` / 空位 `open`）+ `c/cap 已确认（含局主）` |
| 物件 | `card`（JuCardV2，statusLabel `已成局`/`仍可报名`/`席位已预留`，seatCaption `已确认 c/cap · 已预留 r`，seats 只在 s06g 路线显示空位数）/ `ticket`（有效票或改期待答复）/ `stamp`（已散场） |
| aria | `标题，label，预留剩余 HH:MM:SS，时间，地点` |
| 点击 | 整行与 lead CTA 都调 `openFromMine27` → 保存返回上下文 → 卡片飞行（仅 card 物件且路线 ∈ s05/s06g/h01）→ `selectEvent(event,{route})` → `goTo(route)` |

计时：`_t5 = setInterval(refresh18, 1000)` 每秒重渲染；`participantStage` 每次调用先 `JuLedger.expire(r)`（到期自动转 expired 并顺位候补）。

---

## 2. 状态模型

### 2.1 账本字段 → `phase(r)`（标签 / 旧屏路线）

| 条件（按优先级） | phase.label | route |
|---|---|---|
| `status=cancelled` | `已取消` | s12 |
| `status=ended` 且我 confirmed | `已结束` | s08 |
| `proposal.choice=ask` 且我 confirmed | `待确认新时间` | s11 |
| `proposal.choice=declined` | `已退出` | s06g |
| 候补中（position>0） | `候补第N位` | s09 |
| application `pending` | `待审核` | s04 |
| `approved` | `已预留` | s05 |
| `confirmed` | `已确认` | formed ? s06 : s06g |
| `expired` | `预留已到期` | s05 |
| `reservation_released` | `预留已释放` | direct ? s03b : s02 |
| `withdrawn` | `已退出` | s04 |
| `exited` | `已退出` | s06g |
| `rejected` | `这次没留住` | s04 |
| `declined` | `已退出` | s06g |
| `unapplied` | `未参加` | s03b / s02 |

### 2.2 `participantStage` 总表（列表显示语义）

列：key · 列表标签 · 分组（当前/历史）· tone · 物件 · lead 一句话（`needLine27`，历史里作 sub）· CTA（lead 按钮 / 行内 next）· 打开去向。

| 产品状态 | key | 列表标签 | 分组 | tone | 物件 | need 句 | CTA | 去向 |
|---|---|---|---|---|---|---|---|---|
| 待审核 | `pending` | `待审核` | 还在等 | wait | card | `等局主审核 · 不占名额` | — | s04 |
| 已预留待确认 | `invited` | `已预留` + `HH:MM:SS` 倒计时 + 进度条 | 要你回应 | act | card（飞行） | `预留到期前阅读约定并确认` | `阅读并确认` | s05 |
| 候补轮到 | `invited`（queue 行 status=invited） | `候补轮到 · 已预留` + 倒计时 | 要你回应 | act | card | 同上 | `阅读并确认` | s05 |
| 候补等待 | `waitlist` | `候补第N位` | 还在等 | wait | card | `轮到你时才开始 6 小时预留` | — | s09 |
| 已确认待成局 | `gathering` | `待全员确认` + 座位段 | 还在等（adapter 给 soon，`joinItem27` 改为 wait） | wait | card（飞行到 s06g） | `包括局主全员确认后才出票` | — | s06g |
| 已出票待撕 | `tear` | `待撕票` | 要你回应 | act | ticket（未撕） | `撕开副券后可以联系局主` | `撕开票根` | s06 |
| 已撕票待联系 | `contact` | `待联系` | 要你回应 | act | ticket（已撕） | `撕票后 8 小时内联系局主` | `联系局主` | s06 |
| 已联系待赴约 | `going` | `待赴约` | 就快见面 | go | ticket（已撕） | 当天 `今天 HH:MM 见`，否则 `已记录加微信 · 按最终时间赴约` | `查看票根` | s06 |
| （兜底：已确认且成局但票不可用/联系窗已关） | `confirmed` | `已确认` | 就快见面 | go | card | `已成局` | `查看票根` | s06 / s06g |
| 改期待答复 | `reschedule` | `待确认新时间`；时间行 `改为 新时间` | 要你回应 | act | ticket（显示**旧**时间划掉 + `改期` 章；撕/未撕随旧票） | `局主改了时间，答复前旧票不能用` | `答复新时间` | s11 |
| 已散场 | `ended` | `已结束` | 历史 · 散场 | kept | stamp（票根画 + 出席章） | `记录为出席` / `记录为未出席 · 待核实` / `已散场`（pending） | — | s08 |
| 局主取消 | `cancelled` | `已取消` | 历史 · 未成行 | void | spine | `局主取消 · 票根作废，不计你的退出` | — | s12 |
| 审核未通过 | `rejected` | `这次没留住` | 未成行 | void | spine | `这次没留住 · 不影响信用` | — | s04 |
| 撤回申请 | `withdrawn` | `已退出` | 未成行 | void | spine | `申请已撤回` | — | s04 |
| 主动退出 | `exited` | `已退出` | 未成行 | void | spine | `主动退出 · 票根与联系已关闭` | — | s06g |
| 拒绝改期 | `declined` | `已退出` | 未成行 | void | spine | `拒绝改期 · 席位已释放` | — | s06g |
| 预留到期 | `expired` | `预留已到期` | 未成行 | void | spine | `预留到期未确认 · 位置已补给他人` | — | s05 |
| 放弃未确认预留 | `reservation_released` | `预留已释放` | 未成行 | void | spine | `放弃预留 · 不记主动失约` | — | s03b / s02 |
| 退出候补 | `queue_left` | `已退出候补` | 未成行 | void | spine | `退出候补 · 不记缺席` | — | s03b / s02 |
| 散场但我非确认成员 | `ended_other` | `已结束` | 未成行 | void | spine | （空） | — | s08 |

判定优先级（`participantStage`）：cancelled → ended(+confirmed) → ended_other → reschedule(ask+confirmed) → declined(proposal) → waitlist → pending → invited → gathering(confirmed && !formed) → tear(validTicket && !torn) → contact(canContact && !contactAdded) → going(valid && contactAdded && open) → confirmed → expired/reservation_released → withdrawn/rejected/exited/declined → queue_left → other。
`validTicket` = formed ∧ 我 confirmed ∧ `userVersion === event.version`；`canContact` = validTicket ∧ 已撕本版 ∧ (未散场 或 散场 < 24h)。

「参加过」只有 `ended` 一种（有确认席位的正常散场）；撤回/未通过/退出/取消均为“结束记录”，不计出席。

---

## 3. 各状态详情（信息 · 动作 · 去向 · 转移 · 文案）

### 3.1 待审核 `pending`（s04「04 等确认」）
- 列表：卡片物件；`待审核`；`等局主审核 · 不占名额`；无 CTA；在 `还在等`。
- s04：标题 `等待确认`（信封动效 waiting）；无底部按钮（`footer04On20` 仅在 invited/confirmed/withdrawn/rejected 时显示）；右上弱动作 `撤回`（仅 pending）。
- 撤回 sheet（aria `撤回申请`）：`撤回报名？` / `撤回后不再参与本次报名，不影响信用。仍有位置时可以重新报名。` / `再想想` / `撤回报名` → `JuLedger.leave('withdrawn')` → application=`withdrawn`，信封 `rejectC` 动效；失败 toast `本机保存失败，请重试`（v17 演示 toast `撤回了 · 像没来过一样`）。
- 转移：局主通过 → `invited`（6h 从此刻起）；局主未通过 → `rejected`（s04 标题 `这次没留住`，按钮 `再找个局`）；撤回 → `withdrawn`（s04 标题 `已退出`，`再找个局`）；局主取消 → `cancelled`。
- 返回：`返回上一页` → `terminalBack27('s03')`。

### 3.2 已预留待确认 `invited`（s05「05 锁定 确认入局」）
- 列表：`已预留` + `HH:MM:SS`（变色）+ lead 进度条（宽 = 剩余/6h）；need `预留到期前阅读约定并确认`；CTA `阅读并确认`；aria 含 `预留剩余 HH:MM:SS`。候补转正时标签 `候补轮到 · 已预留`。
- s05：标题 `已预留`（phase.label；到期后 `预留已到期`）；副标 `WD MM.DD · HH:MM · 地点`；条 `剩余 HH:MM:SS`（到期 `00:00:00`）；局卡（飞行到达处）；成员列 `局主` / `同局的`：`已确认` / `已预留` / `位置已释放`。
- 主 CTA：`阅读细则` → 卡片翻开为「参加约定」阅读层（三类 `确认` `信用` `赴约`，`已到约定末尾`，hint `请读到末尾，再确认入局` → `已读完，可以确认`；读到底写 readReceipt，失败 toast `阅读记录未保存，请重试`）→ `确认入局` → `JuLedger.confirm` → s06g；失败 `保存失败，请重试`。已确认后 CTA 变 `查看成员` → s06g。
- 弱动作 `去不了了` → sheet `退出这局？` + `你还未确认参加。退出后释放预留，不记主动失约，也不消耗票根主动退出机会；想再参加，需重新申请。` + `保留位置` / `确认退出` → `releaseReservation` → `reservation_released`（记 excluded fact，顺位候补）→ 结果标题 `已退出这局` + 信封 rejectC；失败 `无法保存退出，请重试`。到期（非 invited 非 confirmed）显示 `再找个局`。
- 转移：确认 → `gathering` 或直接 `tear`（若此刻全员齐）；到期 → `expired`（位置补给候补）；放弃 → `reservation_released`；局主取消 → `cancelled`。
- 规则：邀请发出后预留 6 小时，重开页面不续时；6 小时内读完三类约定才可确认。

### 3.3 候补等待 `waitlist` / 候补轮到（s09「09 满了的门口」）
- 列表：`候补第N位`；`轮到你时才开始 6 小时预留`；在 `还在等`；无 CTA。
- s09 门口：标题/时间行/`N 人局`；条 `c/cap 已确认` · `r 已预留 · 候补 q`；`已进` 名单（局主、`已确认`/`已预留`）；`候补` 名单（序号 `01`…，他人 `X**`，自己 `你`；空 `还没有人在候补`）；提示 `轮到后需在6小时内确认。`（等待中）/ `候补尚未留位，按加入顺序邀请。`；条上提示 `候补第 N 位` / `位置已留给你` / `邀请已到期` / `活动已取消`。
- CTA（`watch9CtaLabel`）：已获邀 `去确认` → s05；有空位 `查看活动` → s03b/s02；否则 `加入候补`（申请制 → s03 表单带 waitlist 意图；直入 → 直接 `JuLedger.queue`）。
- 候补回执（信封展开，`JU. / 候补回执`）：标题按状态 `已加入候补` / `位置已预留` / `邀请已到期` / `活动已取消` / `已确认参加` / `候补状态已更新`；正文：等待 `轮到后需在6小时内确认。`；轮到 `请在 今天|明天|M月D日 HH:MM 前阅读并确认`（到期 `邀请已到期，请查看当前状态`）；取消 `活动已取消，候补已经结束。`；其它 `候补状态已更新，请查看当前活动。`；回执字段：序号 `NN 位` / `已预留` / `已到期` / `已取消`，说明 `现在尚未留位，也尚未确认参加。` / `邀请的6小时已开始计时。` / `候补状态已变化。`。按钮 `知道了` / `查看邀请` / `查看结果`；弱动作 `退出候补`。
- 退出候补：`JuLedger.queue(false)` → queue 行 `left`，application=`unapplied`，记 `queue_left`（不计缺席）；失败 `退出未保存，请重试`。
- 轮到（promote）：位置空出时按加入顺序 `invited`，6h 开始；回执关闭时若 invited → toast `轮到你了，位置已预留。` → s05；取消 → toast `活动已取消，候补已结束。` → s12；expired/declined/exited → `参加状态已变化，请查看当前记录。`。
- 准入拒绝文案：`本次候补已经关闭。` / `你已经获邀或确认，请查看当前参加状态。` / `本次已退出；重新参加资格尚未开放，请另选活动。` / `申请正在审核，请先查看审核进度。` / `现在有空位了，请按普通报名继续；仍需局主审核。`；toast `你已在正式名单中`。
- s03b（直入）：`候补第 NN 位 / 轮到后需在6小时内确认。现在尚未开始留位倒计时。`；按钮 `查看候补` / `查看邀请` / `留个位置`（→ `JuLedger.invite` → s05，失败 `留位未完成，请重试或查看剩余位置`）；不可用：`位置已满`→`加入候补`，`活动已取消`/`活动已结束`→`再找个局`。

### 3.4 已确认待成局 `gathering`（s06g「06 就位中 全员确认」）
- 列表：`待全员确认` + 座位段 + `c/cap 已确认（含局主）`；need `包括局主全员确认后才出票`；在 `还在等`；无 CTA；卡片飞行到 s06g。
- s06g：标题 `等待全员确认`（成局 `已成局`；取消 `活动已取消`；退出 `已退出`）；`c/cap 已确认`；分段条；成员：`已确认` / `已预留 Nh`（剩余小时向上取整）/ `位置已释放`。CTA：未成局 `等待确认`（禁用）；成局 `去撕票根` → s06；成局但版本不符且改期待答复 `确认新时间` → s11；退出态 `再找个局`。返回 → `terminalBack27('s05')`。
- 转移：全员确认 → formed（`establishedAt`）→ `tear`；局主改期（仅 confirmed 成员被问）→ `reschedule`；取消 → `cancelled`。此阶段**没有**“去不了了”（约定：你确认后若仍在等人，尚无有效票）。

### 3.5 已出票待撕 `tear`（s06「07 撕开票根」）
- 列表：票根物件（未撕：带副券条、虚线孔）；`待撕票`；`撕开副券后可以联系局主`；CTA `撕开票根`。
- s06：标题 `撕开，联系局主`；副标时间行；纸票打印入场（p7 idle→printing→ready）；票面：`票根` · 标题 · 大号时间 · 日期 · `地点` · `集合`（默认 `待局主确认`，改期后 `HH:MM 门口`）· `局主`；拖副券撕开 → `JuLedger.torn`（p7 `torn`）；失败 `未能保存，请重新撕下副券`。
- 撕后 → `contact`。弱动作 `去不了了`（见 §6.3）。入口 `参加约定 ›` 打开约定 sheet（`参加约定` / `我的信用记录`、`查看我的记录`、`读信用`/`读赴约`、`我知道了`）。
- 票不可用时（`invalidTicket21`）以说明 + 按钮替代：取消 `这局已取消，原票根不再有效。`→`查看取消结果`→s12；散场 `这次活动已结束，记录已归档。`→`查看散场记录`→s08；改期待答复 `局主调整了时间，请确认新安排。`→`确认新时间`→s11；未确认 `确认入局后，才会为你保留票根。`→`查看参加状态`→phase 路线；未成局 `还有成员待确认，全员到齐后出票。`→`查看成员`→s06g；已退出 `你已退出，原票根和联系方式已失效。`→`查看退出结果`→s06g。

### 3.6 已撕票待联系 `contact`（s06）
- 列表：票根物件（已撕：副券隐藏，面底边锯齿）；`待联系`；`撕票后 8 小时内联系局主`；CTA `联系局主`。
- s06 标题 `联系局主`；联系层（撕后 300ms 出现，850ms 出按钮）：`局主 · {host}` + 微信账号（示例 `laoyang.ju` / `demo.{city}`）+ 复制按钮（`复制`→`已复制`；失败 `复制失败，请长按账号复制`）；说明 `撕券后8小时内联系局主。此处为示例微信。`；CTA `已加微信` → `JuLedger.contact`（contactAdded=true）→ 标题 `待赴约`、CTA 变 `待赴约`（禁用）、说明 `已加微信 · 等这次见面。此处为示例微信。`；联系窗已关 toast `联系方式已关闭`；失败 `本机保存失败，请重试`。
- 8 小时只有文案，无计时/无自动处理（约定 `撕券后8小时未联系，不自动算故意缺席`）。

### 3.7 已联系待赴约 `going`（s06）
- 列表：票根（已撕）；`待赴约`；need 当天 `今天 HH:MM 见` 否则 `已记录加微信 · 按最终时间赴约`；在 `就快见面`；CTA `查看票根` → s06（标题 `待赴约`）。
- 转移：局主改期 → `reschedule`（联系状态沿用）；局主取消 → `cancelled`；活动结束 → `ended`；`去不了了` → `exited`。

### 3.8 改期待答复 `reschedule`（s11「10 局主改时间」）
- 列表：时间行 `改为 WD MM.DD · HH:MM`；票根物件显示**旧**时间（粗红删除线）+ `改期` 章，撕/未撕状态随旧票；`待确认新时间`；need `局主改了时间，答复前旧票不能用`；CTA `答复新时间`；排 act 权重 1。
- s11：标题 `局主改时间`；新票打印（p10 printing→ready）：新时间/日期、`原定 旧日期 旧时间`、`地点`、`集合`、`局主`、章 `时间已改`、`改到 {WD} {集合}`。
- 接受 = 撕新票副券（或 `yes11`）→ `JuLedger.choose(true)`：`userVersion=version`、`ticketTornVersion=version`（新票视为已撕）、生成新 ticket；标题 `新时间已确认`（已加微信则 `待赴约`）；联系层同 s06（CTA `已加微信`/`待赴约`）；失败 `新时间未保存，请重新撕下副券` / `新时间未保存，请重试`。→ 列表进入 `contact`（未加微信）或 `going`。
- 拒绝：弱动作 `去不了了`（aria `不接受新时间`）→ sheet `新时间去不了？` + `这是局主改期。退出后释放席位并作废票根，不记你的主动失约，也不消耗主动退出机会，旧票不恢复。` + `再想想` / `确认退出` → `JuLedger.choose(false)` → `declined`（记 `host_reschedule_declined`，释放席位顺位候补，contactAdded=false）→ 票“卷边炭化”烧毁（variant B，约 6.6s）→ 灰烬 → 跳 s06g（`已退出` + `未接受局主的新时间，位置已释放。` + `再找个局`）；灰烬 CTA `查看退出结果` → s06g；失败 toast `尚未退出，新时间仍待你答复` / sheet 内 `保存失败，尚未退出。新时间仍待你答复，请重试。`。
- V27 演示文案（demo 分支）：`时间挪了一下`/`局主改了时间 · 选择是否参加`，撕后 `按新时间见`/`票根已更新 · 已接受改期`，灰烬 `已退出改期活动`/`改期后退出，不影响成局信用。`，toast `新票根打好了 · 去，就撕副券；不去，就烧掉`、`已接受改期 · 按新票根的时间见`。
- 局主侧改期规则：新时间 = 必须不同于原时间；上一次改期有人未答复不能再改；改期后 `version+1`，只问 confirmed 成员；`meeting` = 新时间前 10 分钟 `门口`。

### 3.9 已散场 `ended`（s08「08 散场 票根墙」）
- 列表（历史 · 散场）：票根画（V27 08 墙票，按 event+version 缓存）+ 出席章（圆形，右下，`出席` / `未出席` + `JU · ATTENDED`，墨色随 pack：invite/riso/acid 深色，street/grain/mono 浅色；`未出席` 用灰墨）；无章 = 待记录；sub `记录为出席` / `记录为未出席 · 待核实` / `已散场`。点击 → s08。
- s08：标题 `散场`；票根墙（个人历史 personalHistory，`上下滑动 · 翻以前的局　点一下 · 看背面`）；章状态 `等章` / `出席` / `未出席`；按钮 `不对劲？举报`（sheet：`说说发生了什么` ≥4 字、`谁` 人员 chips 含 `（局主）`、截图 ≤6、提交 → `已受理` `可在“设置 → 帮助与反馈”查询进度。` `查看进度`；失败 `提交失败，内容已保留。请重试。`）、`再找一局`。返回 → `terminalBack27('s06')`。
- 出席为局主记录、待核实事实（`absence_reported` / `absence_after_tear` pending_review，不执行处罚）；联系方式散场 24h 后关闭查看。

### 3.10 未成行各态（历史 · 未成行 · 书脊）
| 状态 | 标签 | sub | 点击去向 / 旧屏表现 | 信用事实 |
|---|---|---|---|---|
| 局主取消 `cancelled` | `已取消` | `局主取消 · 票根作废，不计你的退出` | s12：标题 `活动已取消`（demo `局主取消了`），取消时票快照（改期未答复则显示旧时间）`原定 日期 时间`、`不计为未出席，也不影响成局信用。`、票块（地点/集合/局主，重发票时 `时间已改` 章），入屏即烧（variant C）→ 灰烬 + `再找个局` | `host_cancelled`（不占机会） |
| 审核未通过 `rejected` | `这次没留住` | `这次没留住 · 不影响信用` | s04 标题 `这次没留住` + `再找个局` | 无 |
| 撤回申请 `withdrawn` | `已退出` | `申请已撤回` | s04 标题 `已退出` + `再找个局` | 无 |
| 主动退出 `exited` | `已退出` | `主动退出 · 票根与联系已关闭` | s06g `已退出` + `再找个局`；s06 `已退出这局` + `查看退出结果` | `active_withdrawal`（记录 `主动告知退出`，占 4 次/年） |
| 拒绝改期 `declined` | `已退出` | `拒绝改期 · 席位已释放` | s06g `已退出` + `未接受局主的新时间，位置已释放。` | `host_reschedule_declined`（不占） |
| 预留到期 `expired` | `预留已到期` | `预留到期未确认 · 位置已补给他人` | s05 标题 `预留已到期`、条 `00:00:00`、`再找个局`；s09 条 `邀请已到期` | `reservation_expired`（不占） |
| 放弃预留 `reservation_released` | `预留已释放` | `放弃预留 · 不记主动失约` | s03b / s02（可重新申请） | `reservation_released`（不占） |
| 退出候补 `queue_left` | `已退出候补` | `退出候补 · 不记缺席` | s03b / s02 | `queue_left`（不占） |

重新参加：`exited` / `declined` 不能再申请或候补（`本次已退出，重新参加资格尚未开放。`）；其余可重新申请。

---

## 4. 票根（票据物件）解剖与状态

| 语境 | 结构 | 状态 |
|---|---|---|
| 列表 `jm3-tk`（196×245 缩放） | 面：`JU. / 票根`、大号时间（66px）、`WD MM.DD`、`改期` 章（右下，-11°）；副券条（66px，顶部虚线孔，点阵纸） | `data-torn`（撕过本版）：副券隐藏、面底边锯齿；`data-changed`（改期待答复）：显示旧时间 + 删除线 + `改期` 章 |
| 列表 `jm3-card` | JuCardV2 卡面 + 圆点/光泽/边沿/上下缺口 | 可飞行（`data-flight=card`）到 s05 / s06g / h01 并飞回 |
| 列表 `jm3-stub`（散场） | 票根画（4:5）+ 出席章 | 无章 / `出席` / `未出席` |
| s06 纸票 p7 | 主票 + 副券 | `idle` → `printing`（出纸）→ `ready` → `torn`；退出时 `exitBurn23: burning → ash`（variant C）/ `failed` |
| s11 纸票 p10 | 新版票 + `时间已改` 章 | `printing` → `printed/ready` → `torn`（接受）/ `burning → ash`（拒绝，variant B 卷边炭化）|
| s12 | 取消票快照 + 章 | `b12: idle → burning → ash`（variant C 情绪电影，落灰收尾） |
| s08 墙 | 历史票叠 | 章 `等章` / `出席` / `未出席`，点一下看背面 |

账本票对象：`{eventId, version, event, torn, issuedAt, width:258, material:'JU-paper-23', proposal}`；取消时存 `cancelTicket`，退出时存 `exitTicket`（含是否已撕）。

---

## 5. 联系局主流程
1. 前提 `canContact`：成局 ∧ 我 confirmed ∧ 本版票已撕 ∧（未散场或散场 <24h）。
2. s06/s11 撕后联系层：`局主 · 名字` + 账号 + `复制`（clipboard；成功 `已复制`，失败 `复制失败，请长按账号复制`，切屏/换局即失效）+ 说明 `撕券后8小时内联系局主。此处为示例微信。`
3. `已加微信` → `JuLedger.contact` → 标题/CTA `待赴约`，说明 `已加微信 · 等这次见面。`；列表转 `going`。
4. 关闭：退出、拒绝改期、取消 → 立即关（`contactAdded=false`）；散场 24h 后关；旧票（改期未答复）不能看联系方式。`已加微信` 不代表对方回复或已到场。

---

## 6. 退出 / 离开流程汇总

| 场景 | 入口（屏） | 确认文案 | 账本 | 结果屏 / 文案 | 信用 |
|---|---|---|---|---|---|
| 6.1 撤回申请 | s04 `撤回` | `撤回报名？` / `撤回后不再参与本次报名，不影响信用。仍有位置时可以重新报名。` / `再想想`·`撤回报名` | `leave('withdrawn')` | s04 `已退出` + `再找个局` | 无 |
| 6.2 放弃预留 | s05 `去不了了` | `退出这局？` / reservationExit / `保留位置`·`确认退出` | `releaseReservation` | `已退出这局`（信封 rejectC） | `reservation_released` 不占 |
| 6.3 主动退出（持票，未撕/已撕） | s06 `去不了了`（仅 open ∧ confirmed ∧ 非改期待答复） | `退出这局？` / ticketExit（`…记为主动退出。同一账户每年共4次…`）/ `继续赴约`·`确认退出` | `withdrawConfirmed`（exitTicket、顺位候补、通知局主 local_only） | 票烧毁（C）→ s06g `已退出`+`再找个局`；s06 `已退出这局`、`查看退出结果` | `active_withdrawal` 占 4 次/年 |
| 6.4 拒绝改期 | s11 `去不了了` | `新时间去不了？` / rescheduleDecline / `再想想`·`确认退出` | `choose(false)` | 卷边炭化（B）→ s06g `已退出` + `未接受局主的新时间，位置已释放。` | 不占 |
| 6.5 退出候补 | s09 `退出候补` | 无二次确认 | `queue(false)` | 回到 s09 门口 | `queue_left` 不占 |
| 6.6 成局后退出（v17 演示） | — | toast `已成局 · 请先联系局主协商退出` | — | — | — |

---

## 7. 导航与返回
- 打开：`openFromMine27(r, route, scope, 'join')`：`returnTo27` 存 `{root:'mine', role:'join', view, scrollOffset, eventId, scope}`（sessionStorage `JU_MINE27_RETURN`）→ s01 上卡片飞行（HANDOFF27 = s05/s06g/h01）→ `selectEvent(event,{route})` → `goTo(route)`。若 `options.route` 缺省，selectEvent 自算：直入候补 s03b；cancelled s12；ended s08；ask+confirmed s11；confirmed → validTicket ? s06 : s06g；invited+approved s05；pending s04；候补或满 s09；否则 s03b/s02。
- 返回：旧屏返回键 `backLabel27` = `返回我的局`（有 mine 上下文）否则 `返回找局`；`restoreMine27` 恢复角色/分区/两个窗格滚动，`landMine27` 高亮落点 1.6s（`jm3-landed`），card 物件飞回原槽（可能已换分组，先滚到可见）。`terminalBack27` 用于 s04/s06g/s08 返回。
- **所有参与者动作目前都跳回旧 s0x 屏**（列表内无就地动作）：`阅读并确认`→s05；`答复新时间`→s11；`撕开票根`/`联系局主`/`查看票根`→s06；gathering→s06g；pending→s04；waitlist→s09；散场→s08；取消→s12；rejected/withdrawn→s04；exited/declined→s06g；expired→s05；reservation_released/queue_left→s03b|s02。
- 底部主导航：`找局` `开局` `我的局` `设置`。

---

## 8. 相关约定文案（JuRules26，约定 sheet 三类：确认 / 信用 / 赴约）
- `收到邀请，才开始留位`：申请和候补不占位；邀请发出后预留 6 小时，重开页面不续时。
- `六小时内，读完再确认`：确认前可点“去不了了”；放弃或到期释放位置，不记主动失约；候补退队不记缺席。
- `全员确认，才成局出票`：包括局主。 `撕开票根，再联系赴约`：撕开副券后 8 小时内联系局主；邀请未确认到期按候补顺序补位。
- `去不了了，请主动退出`：每年 4 次主动退出机会，跨活动、未撕/已撕共用，接受改期后再退出也计入。
- `安排变化，不算主动失约`：确认前放弃预留或到期、纯候补退队、拒绝改期、局主取消不记失约、不消耗机会；撕券后 8 小时未联系不自动算故意缺席。
- `撕开有效票，再联系`：成局后仅局主可见你的微信；`联系方式，有查看期限`：退出/拒绝改期/取消后票和联系入口失效；散场 24 小时后关闭。
- `改期重新选，取消不算失约`：接受新时间就撕开新版副券；去不了可点“去不了了”；局主取消后票根作废，重开也不恢复。

---

## 9. 评审工具条（M1）可触发的转移
`局主通过`(invite) · `局主未通过`(leave rejected) · `预留置零（到期）`(zeroTime) · `释放一席（候补推进）`(leave 他人 exited→promote) · `局主改期`(propose：+1 天 +30 分) · `局主取消`(cancel) · `活动结束`(end，需有效票) · `散场超过 24 小时`(endedAt-24h)。样例集：`标准` / `全空（0）` / `只有草稿` / `很多历史` / `长名称与长地点`；`重置评审样例` / `清空评审样例`。
标准样例（我参加的）：brunch=invited(剩 4h21m) · livehouse=reschedule(已撕已加微信) · run3k=tear · theater=going · dimsum=gathering(cap5，另一人预留剩 2h08m) · vintage=waitlist(第 2 位) · sketch=pending · jazz=ended(出席) · mahjong=rejected · ramen=cancelled · boardgame=queue_left；`很多历史` 另加 pottery/hike(未出席)/karaoke/bookclub/picnic。

---

## 10. 发现 / 待确认
1. `gathering` 在 adapter 中 group=`soon`，但 `joinItem27` 强制改为 `wait`（`还在等`）；若日后直接用 adapter 分组会不一致。
2. 「候补轮到」没有独立 key，仅靠 queue 行 `status=invited` 改标签为 `候补轮到 · 已预留`，去向与普通 invited 相同（s05）。
3. 「历史票根展开」在本原型中不存在：点 stub/spine 一律跳旧屏（s08/s12/s04/s06g/s05/s02/s03b），返回时仅高亮落点。
4. `confirmed` 兜底态（成局但 `userVersion≠version` 且非 ask，或联系窗已关）标签 `已确认`、CTA `查看票根`，去向由 phase 决定（s06/s06g）。
5. 8 小时联系窗与 24 小时联系关闭都无倒计时 UI，只有文案与 `canContact` 判定；列表唯一计时器是 6 小时预留。
6. s12 在 V27 演示 vals 中标题为 `局主取消了`，在账本驱动 vals 中为 `活动已取消`；s11 同理有两套文案（演示 / 账本）。
7. `ended_other`（散场时我非确认成员）落在 `未成行`，sub 为空字符串。
8. 退出候补无二次确认 sheet；撤回申请与放弃预留有。

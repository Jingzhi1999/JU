# C04 夜玻璃 · 评审 round 1（独立评审，非建造者）

- 评审对象：`concepts/src/C04.dc.html`，私有构建 `.build/review-C04.html`（`JU_STANDALONE` 构建，未写共享文件）。
- 证据：`evidence/C04/review-1/`（本轮自己操作截图；每个目录含 `sheet.png` + 逐帧 `fNN.png` + `log.json`）。`coverage/` = 50/50 索引状态，`log.json` errors 为空；其余 25 个流程目录 `errors` 全部为空，唯一例外 `fast-clicks/log.json` 的 "click target missing: .pane .back" 是 M5 缺陷的症状（第二次打开的详情被吃掉，返回键不存在），不是页面报错。
- 另有真实指针探针 `probe-real-clicks/`（Playwright mouse.click，hit-test 确认点中的是目标本身）。
- 结论：**pass = false**（1 blocker，5 major，7 minor）。

## 判定摘要

| 验收项 | 结果 |
|---|---|
| 首屏主角与秩序 | 通过：lead 玻璃板（局名 22px / 琥珀倒计时 34px / CTA）> 后排缩小变暗的板；局主首屏同构（`coverage/j-home.png`, `h-home.png`） |
| 角色清楚、同一系统 | 通过：玻璃轨道滑块 + 两叠平移（`role-switch/f00–f06`） |
| 时间/地点/状态/动作分级 | 通过（lead 与普通行各自有层级） |
| 详情 / 管理质量 = 首页 | **未达**（M2：详情层不透明、下半屏空；见下） |
| 每个入口有完整结果与返回 | 基本通过；例外 B1 / M5（快速操作后卡住或被吃掉） |
| 关键动效 开始→过程→落点 | 出票 / 撕票 / 参加者作废 通过；分区切换与滚动层级缺失（M3）；局主作废裂纹次序错（M4） |
| 物件连续性 | 撕票碎片带原副券文字（`ticket-print-tear/f30`）通过；作废时席位号变 `NO.--`（m5） |
| 取消 / 改期 / 散场 / 空态构图 | 通过（`resched-decline/f20`, `withdraw-exit/f18`, `host-cancel-half/f15+`, `coverage/b-empty*.png`），草稿删空 10 s 空白除外（m2） |
| 长标题 / 多成员 | 排得下但违反“时间不换行 / 标题 ≤2 行”（m1） |
| 中文排版 | 整体好；多处单字孤行（m1） |
| 快速连点无残影 / 卡住 | **未达**：B1（返回卡成模糊首页）、M5（第二次打开被吃掉） |
| 打印 / 撕 / 燃烧阶段 | 出票、撕票、参加者侧碎裂真实渐进；局主侧裂纹先整张出现再闪回重画（M4） |
| 面板（索引 / 速度 / 定帧 / 重置 / 变体 / 失败按钮） | 通过（`scrub/`, `reduced-motion/`, `fail-retry/`, `probe-real-clicks/06–08`）；定帧释放后从 0% 重播（m6） |
| log.json errors 为空 | 通过（见上） |
| 语义（无信用分、八种未成行各异、局主数据不外泄、计数正确） | 通过：结果页事实表只写“不记缺席 / 记一次主动退出”；候补他人 `L**`；审核通过后 待审 2→1、预留 1→2、空 2→1、徽标 2→1（`host-approve-reject/f06–f26`） |

## Blocker

### B1 · 作废动画进行中点「返回我的局」→ 首页永久模糊、无任何层
- 状态 / 动作：参加者侧 `j-d-withdraw`（theater · going → 退出）或 `j-d-reschedule → 去不了了 → 确认退出`：确认后弹层收起，碎裂 3.2 s 期间返回胶囊可点（真实指针 hit-test = `.back` 本身）。点它 → 详情收回 → 3.2 s 定时器再把 `detail` 置为 `{result, layer}`（无 id）→ `.home.recede` 常驻，`D.on` 为假，没有任何面板。
- 证据：`probe-real-clicks/00-A-shatter-playing.png` → `01-A-after-back.png` → `02-A-final.png`（整屏模糊首页、无返回、无弹层）；状态转储 `home:"home recede", pane:false, detail:["result","layer"], fx:{voided:true}`。程序化复现 `stuck-exit-back/f12`、`fast-clicks/f34`。
- 建议修改：`leaveAction` 的 `after(3200)`、`shatterStub` 的 `after(820)`、`startPrint` 的 `after(2200)`、`confirmReservation` 的两个定时器里先判 `s.detail && s.detail.id === id` 再合并；`closeDetail` 时清掉这些待执行回调（记录 token）。同时作废进行中把 `.ph .back` 设为禁用（和 `D.acts=null` 一致，“同一时刻一个主要动作”）。
- 验收：重复上面步骤，最终首页清晰可操作；再从列表打开该局应直接是“已退出”结果页。

## Major

### M1 · 撕票：副券还没碎完，标题 / 状态 / CTA 已经变成“待联系 · 已加微信”
- 证据：`ticket-print-tear/f27`（松手）→ `f28`（≈150 ms 后：眉注 CONTACT 待联系、标题「联系局主」、PASS 通行证·已撕、绿色「已加微信」已出现，副券仍整块带裂纹）→ `f29–f31`（碎片在 CTA 上方坠落）。`resched-accept/f22–f26` 同样（接受后先出现「待赴约」禁用条，碎片还在落）。
- 影响：结果先于动作落点出现；与 §6“打印中不显示会让人误以为已完成的操作按钮”同一类问题。
- 建议：`fx.shatterStub` 期间维持撕票前的眉注 / 标题（或改为「副券碎裂分离中」）并 `D.acts=null`；待 `fx.torn`（820 ms）联系层升起时再一起切换标题与 CTA。

### M2 · 详情 / 管理层是不透明的黑板：夜色与后退的玻璃叠在静止态完全不可见，详情下半屏空
- 证据：`coverage/j-d-tear.png`、`j-d-invited.png`、`j-d-pending.png`、`j-d-waitlist.png`、`j-d-gathering.png`、`h-m-review.png`；像素采样 `.pane` 区域 ≈ rgb(10,12,22) 近乎均匀，首页同位置 (41,37,35)/(29,20,36)。只有在 `home-open-back/f10` 这样的过渡帧里才看得到后退失焦的板。
- 影响：方向卡的核心前提“近的清楚、远的失焦”在详情落定后不存在；详情材质（平黑）与首页毛玻璃不是同一材料；`tear / invited / pending / waitlist` 详情 40–50% 画面空白、CTA 孤悬底部，质量低于首页。
- 建议：`.pane-bg` 透明度降到 ≈.55/.7、`.home.recede` brightness 提到 ≈.7（或保留一层带行剪影的“远玻璃”），让后排板与光斑透过来；详情内容改为居中的玻璃纵列（通行证 + 约定摘要 + 同局的人），不要把 pass 顶在上面、CTA 钉在底部。

### M3 · M2「分区切换」与 M3「滚动 / 顶部层级变化」两族没有设计
- 证据：`role-switch/f12→f13`（点「草稿」30 ms 后内容已整块替换）；探针：切换后 220 ms 内首个 shelf opacity=1、transform=none，没有任何过渡。`many-scroll/f01–f03`、`f05–f06` 与探针：`.brand h1` 高 31 px / `.top` 145 px 在 scrollTop=400 时不变；管理页 `host-tabs/f06`（成员滚到 500）头部同样不动。
- 建议：分区切换做下划线 160 ms 滑动 + 内容 120 ms 淡入（F03）；首页 56 px 内标题淡出上移、分段条常驻（F02）；管理头 30→18 px 折叠。

### M4 · 局主取消：裂纹整张在“升起”阶段就已画满，进入碎裂时闪没再重画
- 证据：`host-cancel-half/f05`（0.5×，局主副本升起时裂网已完整）、`f06`、`f07`；探针 `cstage=rise` 时 `stroke-dashoffset=0 / dasharray=none`，切到 `shatter` 时 `offset=1978`（整条不可见）再于 900 ms 内画到 0；`scrub/f04`（5% 定帧也是整张裂网）。
- 影响：§6“从完整票件开始 → 起火点 → 推进”的次序被打破，先看到结果再看过程，并有一帧闪烁。
- 建议：`rise` 阶段的裂纹 path 直接以 `stroke-dasharray:len; stroke-dashoffset:len` 渲染（或不渲染），`shatter` 起从起裂点画出。

### M5 · 快速 打开 → 返回 → 再打开：第二次打开被上一次关闭的定时器吃掉
- 证据：`stuck-open-back-open/f01–f05`（f02 第二次从卡片展开，f04 首页模糊且无面板，f05 回到首页、详情消失）；`fast-clicks/f12–f17` 同样，并导致 `log.json` 里的 "click target missing: .pane .back"。
- 原因：`closeDetail` 的 `after(440)` 无条件 `detail:null`；新的 `openDetail` 在其之前发生。
- 建议：关闭时记录 token，回调里只在 `s.detail && s.detail.phase==='out'` 时卸载；或 `openDetail` 时取消未执行的关闭回调。

## Minor

- **m1 · 长数据与孤字**：`coverage/b-long.png` lead 标题 3 行（规格 ≤2 行省略）、时间行折成「周六 / 12.19」（规格“时间不换行”），`b-long-h.png` 同；单字孤行：「到期前阅读约定并确 / 认」（`coverage/j-d-invited.png`、`home-open-back/f01`）、「6 小时预留 · 不续 / 时」（`coverage/j-d-invitedq.png`）、「一起看《海 / 鸥》」（`coverage/j-home.png` 末行）。建议 `.when>span{white-space:nowrap}`、`.ttl` 两行 clamp、加宽 `.cdblock .rt` 或缩短文案。
- **m2 · 删掉唯一草稿后 10 s 空白**：`drafts/f05–f07`、`f12–f16` 列表区只有撤销条，「没有草稿」构图要等撤销条过期才出现。建议撤销条后方即渲染（弱化的）空态或保留幽灵槽位。
- **m3 · §10 选择器约定缺失**：源码里 0 处 `c04-over` / `data-rid` / `data-act`（行用 `data-id`）。评审脚本只能用结构选择器；请补齐。
- **m4 · 改时间弹层与取消结果的细节**：未选新时间时「改为 · 纽约时间」显示的是带删除线的原时间而非占位「选好新的日期和时间」（`coverage/h-m-reschedule.png`、`host-resched/f01`）；取消后的结果构图印出「待审申请 0 份」而弹层按规则省略了 0 项（`host-cancel-half/f15+`、`coverage/h-m-cancelled.png`）。
- **m5 · 作废物件身份**：主动退出作废时通行证席位号变成「NO.-- / 4」（`probe-real-clicks/00-A-shatter-playing.png`，退出后成员已不在名单）；「票根作废 VOID」从第一帧裂纹起就透过玻璃可见（`resched-decline/f07–f09`），结果先于碎落。建议用票快照里的席位号；`.frame` 在碎片离开（≈1.9 s）后再淡入。
- **m6 · 评审工具行为**：定帧滑杆释放后碎裂从 0% 重播（`scrub/f10→f11`）而非从所在帧续播；出票中的「正在出票」提示悬在通行证下方约 90 px（`ticket-print-tear/f03`），和出口射线脱节。
- **m7 · 材质细节**：列表行 44 px 通行证缩略图叠加删除线时间 + 「改期」章 + 全息带，显得挤（`coverage/j-home.png` 第 2–4 行）；副券碎片是平的裁剪矩形，没有玻璃的 1px 边缘高光与厚度（`ticket-print-tear/f30`）。

## 已核对通过的部分（供下一轮保护）
- 出票：射线出口 → 票头 → 停顿 → 时间 → 停顿 → 齿孔副券，成像中「去不了了」禁用、副券不可拖（`ticket-print-tear/f01–f16`，`invited-confirm/f14–f21` 确认入局即成局出票）。
- 撕票：沿齿孔渐进断裂、支裂依次出现、副券位移 + 微旋、<0.55 回弹（`tear-rebound/f01–f13`）、碎片是同一副券（带文字）、断口光带、联系层弹簧升起、复制 → 已复制 + toast、已加微信 → 待赴约禁用条（`ticket-print-tear/f17–f43`）。
- 参加者侧作废：裂纹 0→900 ms 真实画出（探针 dashoffset 1636→0）、碎片逐块坠落、空框 + VOID、结果构图（标题 / 正文 / 事实表 / 返回），返回落在历史·未成行并高亮（`resched-decline/`, `withdraw-exit/`, `waitlist-leave/`）。
- 局主：审核结果原位替换 + 所有计数同帧更新；改时间校验 / 成功 / toast / 答复页 / 列表重组（`host-resched/`）；取消 0.5× ≥8 帧碎裂 + 端态 + 历史落点（`host-cancel-half/`）；散场 → 出席 → 印记 → 更正 → 轨迹（`host-end-attend/`）；局卡弹层；草稿删除 / 撤销（`drafts/`）。
- 失败 / 重试在管理页与详情页都原位出现并可成功（`fail-retry/`）；减少动态直接呈现结果态（`reduced-motion/`）；重置 / 变体正常（`probe-real-clicks/06–08`）；50/50 索引状态零报错。

# C07 格盘 · 评审第 1 轮（视觉 / 动效）

评审者没有参与构建。私有构建：`JU_STANDALONE=.build/review-C07.html node src/build.js`。下面的每条结论都来自真实截图和实际操作流程（`evidence/C07/review-1/*/sheet.png` 与整尺寸帧 `fNN.png`），只有在找根因时才去看源码。另外在临时目录跑了 6 次 DOM 探针（数值抄在对应条目里）。

**结论：不通过（pass = false）。** 1 个 blocker，10 个 major，9 个 minor。

## 覆盖情况与已经做对的部分
- `coverage/`：50/50 个状态，0 个错误。参加者 18 个局内状态、局主 12 个管理面、7 个边界都能跳到并正确显示。
- 各 log.json 的 errors 全部为空。唯一的例外是 `reduced-motion/log.json`，见 M6：那条记录本身就是一个 bug，撤销条没有出现。
- 首屏层级成立：橙色 2×2 lead 格配 34px 倒计时和 24px 局名，下面是宽格，再下面是小格。身份切换、分区切换、随滚动收起标题都有完整的连续过程（`home-joined/` f01–f31）。
- 撕票是真实拖拽（`tear-drag/` f03–f29）：按在副券像素列上，像素一行一行脱离并跟手；没过阈值松手会回弹（f05→f07）；过了阈值会落下，留下点线存根槽和残留像素，然后联系层错峰出现。
- 打印分步点亮，前面有扫描线，打印过程中不显示操作按钮（`print-speed1/` f04–f10）。
- 格子重排可以看到：brunch 确认后从 2×2 缩成 2×1，livehouse 升为 lead（`read-confirm/` f31–f34）。
- 审核（通过 / 谢绝）后，按钮原位换成结果行，计数、席位、头部状态同帧更新，列表组也跟着迁移（`approve-reject/`）。
- 改时间：三种校验都对（相同时间 / 未选 / 有效），提交后出 toast，hero 重印（`resched-sheet/`）。
- 散场后逐人记出席，盖 3×3 像素章，更正会留下轨迹（`end-attend/`）。
- 下一次保存失败 → 重试：在票面、申请行、操作盘三处都会在原位报错，重试能成功（`fail-retry/`）。
- 面板的倍速、拖动关键帧、重播、重置、演示数据切换、暂停都能用（`scrub-void/`、`panel/`）。
- 连续快速点击没有留下卡住的层（`rapid-clicks/`）。

## Blocker

### B1 像素作废没有完整播完：没吃到一半就"愈合"，剩下的部分在同一帧里整块消失
- **在哪里**：C9 取消这局、p_exit 主动退出、p_answer_time 拒绝改期，也就是所有用到 `.c07-void.dropping` 的地方。
- **证据**：
  - `cancel-half/`（0.5×）：f12–f17，缺口从右上角出现；f18–f23 碎片往下落。但从 f21 起，票面右上角又完整了。f24–f30 票面完整，只剩左下角有碎片在落。到 f31，整张票在一帧内消失，变成一个空白框。
  - `resched-decline/` f13–f23：同样，右上缺口先出现，后来又被补回。
  - 构建者自己的 `evidence/C07/cancel/` f09–f11：大约 40% 被吃掉后，剩下的一帧切空。
  - 探针（1×）：96 个 mask 格里，到 1.6s 只有 41 个 opacity=0，此后一直停在 41–44 个，直到 3.6s 加上 `dropped` 被一次性隐藏。delay 大于约 1.0s 的格子一直没有关掉；它们的 `getAnimations()` 已经是 finished，computed opacity 却不是 0。
  - 停在关键帧拖动下是逐步推进的（`scrub-void/` f01–f07），所以问题只出在实时播放时。
- **为什么是 blocker**：§6 要求"焦边推进、缺口扩大 → 剩余形态 → 结果，作用在同一张票件上，不是直接切掉"。客户实际看到的过程是：开一个角，补回去，再整块切掉。
- **怎么修**：
  - 不要在 HTML 的 CSS `mask:url(#svgmask)` 里依赖 SVG `<mask>` 内 rect 的 CSS 动画。Chrome 不会可靠地让这类 mask 失效重绘。
  - 方案 a：把票面渲染成 12×8 个 HTML 子格。每个子格用 `background` 或复制一份 face，再用 `clip-path: inset()` 只显示自己那一块。每格自己做 opacity / transform 关键帧，碎片和缺口就是同一个节点。
  - 方案 b：用一个注册过的 `@property --c07-void-t`，配合 `mask-image: conic-gradient / linear-gradient` 分级推进。
  - 方案 c：在 JS 里用 `after()` 分 12 步改写 polygon `clip-path`。
  - 不管用哪种，都要验证 1× 和 0.5× 下 off 数量单调增加到 96，并且最后一个格子消失和灰格出现在视觉上是连续的。

## Major

### M1 所有操作盘被强制拉到接近满屏，中间是大片空白，还顶进了状态栏
- **证据**：
  - `coverage/j-d-withdraw.png`、`h-m-cancel.png`、`h-m-end.png`、`h-m-card.png`、`h-m-reschedule.png`
  - `withdraw-pending/` f02–f06
  - `exit-confirm/` f03–f06
  - `read-confirm/` f04–f12
  - 探针：`.c07-sheet` 的 computed top=0px、height=774px（屏幕 844），而正文只有几行。
- **根因**：sheet 按选择器约定加了 `c07-over` 类，于是吃到 `.c07-over{position:absolute;inset:0;background…}`。后面的 `.c07-sheet` 覆盖了 left/right/bottom，唯独 top:0 留下了。结果是：
  - "退出这局？""撤回报名？""记为散场？""局卡"都成了一块 774px 高的白板，中间空着 300–450px；
  - 标题落在刘海 / 状态栏区；
  - 底下盘面的压暗只剩 70px 一条，方向卡里"格子膨胀到底部的操作盘"这种形态没有了。
- **怎么修**：在 `.c07-sheet` 里写 `top:auto; inset:auto 8px 8px 8px`（或者把 `.c07-over` 的样式限定成 `.c07-over:not(.c07-sheet)`），高度跟内容走，`max-height` 保留。然后复查遮罩、标题和底部按钮。

### M2 返回时原格被埋在顶栏下面，或者落在视口外，看不到落点
- **证据**：
  - 探针：run3k 打开前在 y=808。返回后盘面滚到了 599，格子 top=77、bottom=221，而顶栏 bottom=168，也就是 144px 高的格子有约 2/3 被顶栏盖住。
  - `detail-open-back/` f18–f23：只露出"撕开副券后可以联系局主 / 撕开票根 ›"一条带描边。
  - `exit-return/` f08–f12 和 `withdraw-pending/` f17–f21：落点格只露一条边。
  - `approve-reject/` f20–f23：bar 改到「招募中」之后，屏幕上根本看不到它。
  - `resched-accept/` f28：livehouse 改到「就快见面」之后，同样看不到。
  - `resched-sheet/` f17：展开层先收回到旧的「已成局」槽位，那一帧是一个只有青绿描边的空白格；下一帧才重排到「改期中」。`end-attend/` f35 也一样：收回到旧槽位时，局名被裁成「自然酒小试 · 六」。
- **怎么修**：
  - 滚动定位时扣掉顶栏实际高度（标题行收起后约 120px），再留 12px 余量，让目标格完整落在顶栏下面。
  - 如果写入后格子换了组，先在冻结的盘面上算出新位置，把新位置滚进视口，再收回到新矩形；或者收回到旧矩形以后，让同一个节点带着内容 FLIP 到新槽位并跟随滚动。
  - 无论哪种，都不能出现无内容的空白格。

### M3 作废后的构图不完整：大块空白通行证框 + 底部一个小灰格，碎片没有合成残骸
- **证据**：
  - `coverage/j-d-cancelled.png`、`j-d-exited.png`、`j-d-declined.png`、`h-m-cancelled.png`
  - `cancel-half/` f34、f36
  - `resched-decline/` f24
- **现象**：
  - 「通行证 / 局卡·通行证」里，票面消失后留下约 190px 的空白，灰格贴在最底下。
  - 碎片在落下途中淡出，灰格靠 settle 动画凭空出现。"剩下的格子碎片合成历史里的一个灰格"这件事没有被看见。
  - 作废后的票头说明仍然写着「刮下副券后联系局主」「撕下副券 = 接受新时间」，和作废状态矛盾。
  - 主负责人第一轮标为「高」的 C07 问题仍未解决。
- **怎么修**：
  - 让落下的碎片停在票框底部，逐渐聚成 3×N 的残骸格；由残骸格向上收拢成灰格，把框高度同步收到灰格高度（520ms）。
  - 灰格内部保留缺块图形（原票的 QR 外轮廓，用描边表示）。
  - 票头 note 改成「已作废 · 局主取消 / 主动退出 / 拒绝改期」。

### M4 改期待答复升为 lead 后，hero 显示的是旧时间，没有删除线，也没有新时间
- **证据**：`read-confirm/` f33–f37。brunch 成局后，livehouse 成了 2×2 lead：右上大号「20:30 FRI 12.18」是旧时间，没有划掉，整格找不到「改为 21:30」。用默认数据做比对：同一行在宽格时（`coverage/j-home.png`）写的是「改为 周五 12.18 · 21:30」，是对的。
- **根因**：`joinedTile()` 里，无 deadline 时 `t.big = when.time`，而 reschedule 时 `when = r.oldWhen`。lead 模板只渲染 `t.need`，没有渲染 `t.extra`。
- **为什么是 major**：违反 G10「新时间只出现一次、旧时间只出现在一处（删除线）」，也违反 A 表 reschedule「时间行前缀 改为 {新 when}」。在最显眼的格子里，参加者会以为时间没变。
- **怎么修**：lead reschedule 的 big 显示新时间，前面加小号的「改为」；`.c07-when` 行显示 `<s>旧时间</s>`；或者 big 保持旧时间但加删除线，副行写「改为 …」。

### M5 接受改期时，同一张新票同时出现两份
- **证据**：`resched-accept/` f12–f16。副券落下的约 1s 里，上面是新票（时间已改，像素在落），下面原来旧票的位置换成了另一张「通行证 21:30 V2 · 副券已刮下」。两张都叫「通行证」，内容是同一张新票。到 f17，下面那张消失，布局向上跳，联系层出现。
- **为什么是 major**：违反"同一物件身份连续、不中途换成另一个素材"。M7 旧票 → 新票的过程也就看不出来了：旧票既没有灰化，也没有在原地退场。
- **怎么修**：写入成功后，旧票子格保持旧票内容并灰化、盖「改期」章，在落下结束（1000ms）时以 collapse 高度退场；新票就地翻成「通行证」。不要在旧票的 key 上渲染新票的数据。

### M6 打开减少动态后，撤销窗口、toast、"已复制"都瞬间消失（语义被破坏）
- **证据**：
  - 探针：RM 下删除草稿后，`undoBar=false`、`state.undo=null`，草稿数已经从 3 变成 2（直接提交，无法撤销）。复制后 `toast` 没有 `on` 类，按钮文字立刻回到「复制」。非 RM 下 `undoBar=true`。
  - 截图：`rm-undo/` f02–f07，`reduced-motion/log.json`（找不到 `[data-act="undo"]`）。
- **根因**：`after()` 在 rm 下把所有时长乘以 0，包括 `after(10000)` 的 commitUndo 和 `after(2600)` 的 toast / copied。
- **怎么修**：语义时长（撤销 10s、toast 2.6s、已复制 2.6s）不能跟着动效缩放。可以：
  - 在 C07 里包一个 `afterReal(ms, fn)`，在 rm 下还原时长；
  - 或者请主负责人在 core 的 `after(ms, fn, {real:true})` 加这个开关（其他方案大概率也有同样问题）。

### M7 深色「散场」格上的日期和地点几乎看不见
- **证据**：
  - `coverage/j-history.png`、`h-history.png`、`j-history-many.png`、`h-history-many.png`
  - 放大采样：「周六 12.12 哈莱姆」的字色是 rgb(75,80,86)，底色是 rgb(34,38,43)，对比度约 1.9:1。
- **根因**：`.kept .c07-when b` 设成了白色，但 `.c07-when span` 仍然用 `--ink2` 深灰。
- **为什么是 major**：违反 §0「次要信息依然可读，不要低对比灰字」。历史里每一张散场格都受影响。
- **怎么修**：加上 `.kept .c07-when span,.ended .c07-when span{color:rgba(255,255,255,.7)}`，深格里的其他次要文字也一起检查。

### M8 产品界面里出现了方案说明 / 规格话术
- **证据**：
  - `coverage/j-home.png`、`h-home.png`：分区行右侧写着「急的格子大 · 处理完就缩」「待处理的格子最大」。
  - `j-d-ended.png`：「进入历史不重放盖章」。
  - `j-d-exited.png`、`exit-confirm/` f16：「只陈述事实，不评分」。
  - `h-m-cancel` 的结果、`cancel-half/` f36：「取消后票根作废，这里留下灰格」。
  - `j-d-tear.png`：「8 小时只是文案，不计时、不自动处罚」。
  - `j-d-contact.png`：「票版本 = 活动版本 1」。
  - 打印中：「格子逐行点亮，完成前不能刮」。
- **为什么是 major**：客户会把这些当作内部注释漏到了界面上。规格里的规则应该转写成用户语言，或者干脆删掉。
- **怎么修**：
  - 分区行右侧换成真正的排序口径（如「按截止先后」「审核与出席」）。
  - 「8 小时只是文案…」→「撕券后 8 小时内联系局主」。
  - 「只陈述事实，不评分」「进入历史不重放盖章」「这里留下灰格」「票版本 = …」直接删除。

### M9 管理页和局内详情在滚动后不显示局名（没有折叠头）
- **证据**：
  - `coverage/h-m-members.png`、`h-m-waitlist.png`、`h-m-attendance.png`、`h-m-replies.png`、`h-m-leaves.png`
  - `long-many/` f03–f04、f13–f15
- **现象**：滚过 hero 以后，顶部只剩「返回我的局」和色块导航条，屏幕上任何地方都没有这局的名字。C 通用规则要求「标题永远是局名（折叠后单行省略）」，F02 / M3 要求管理页标题随滚动连续收起。
- **怎么修**：顶栏里，在返回键和色块导航条之间放一行单行省略的局名（14–15px / 600）。透明度和位移跟 hero 离开视口的比例绑定（`--sc` 同款），参加者详情同样处理。

### M10 已取消的局里，预留成员仍然显示实时倒计时
- **证据**：`coverage/h-m-cancelled.png`（Leon：「取消前已预留 · 剩 05:02:00 · 确认前不占定」），`cancel-half/` f36（同一行）。
- **为什么是 major**：取消后预留已经结束（C9：预留成员 → cancelled）。还挂着一个 6h 倒计时，自相矛盾，也违反「唯一倒计时只给有效预留」。
- **怎么修**：event 为 cancelled 时，成员右栏改成「预留已结束」或「票根作废」，同时隐藏 minibar。

## Minor
1. **申请人、成员的徽章被拉成整宽色条**（`coverage/h-m-review.png`、`h-m-contact.png`、`h-m-members.png`）。根因是 `.c07-rw .who span{display:block}` 命中了 `.c07-badge2`。修法：`.c07-rw .who .c07-badge2{display:inline-block;width:auto}`。
2. **审核处理中时，同一行两个按钮都出现像素 loader**（`approve-reject/` f03、f12），分不清是哪个动作在处理。只在被点的按钮里显示 loader，另一个只置灰。
3. **副券竖排标签被裁切**：「副券 · 刮下」只露出「副」和半个「券」，「STUB · 已撕」只露出「STUB」。另外中文是从 DM Mono 回退到系统字体（`coverage/j-d-tear.png` 放大可见），已撕态还出现英文「STUB」。修法：标签改成中文两字「副券」/「存根」，字体用 Noto Sans SC，并给出足够高度。
4. **时间被拆到两行**：「原定 周三 12.23 · / 19:30」和「改为 … 12.24 · / 20:15」（`resched-sheet/` f01–f06、`coverage/h-m-replies.png`），违反"时间不换行"。修法：对照行改成上下两行，`white-space:nowrap`。
5. **失败条的标签「没有保存成功」被挤成两行**（`fail-retry/` f06）。给标签 `white-space:nowrap`，正文放到下一行。
6. **出票的开头**：先出现一个约 300ms 的空白白框，没有出口或喂纸的暗示（`print-speed1/` f03、`detail-open-back/` f05）。可以让第一行像素在扫描线出现的同一帧就点亮，或者在框顶画一条「出票口」像素槽。
7. **首屏格盘感偏弱**：两个首页的首屏都是 lead 加整宽 2×1 卡片竖着叠，真正的 1×1 混排要滚到「还在等」才出现（主负责人第一轮「中」级问题部分仍在）。可以考虑把次要的「要你回应」做成 1×1 成对排，或者让宽格内部分成「文字 | 通行证缩略」两格。
8. **详情和管理页内部基本是单列子格堆叠**，「格子内部再分格」只有候补那一处双列，和首页的网格语言没有对上。
9. **其他**：
   - p_history 散场缺少「点一下 · 看背面」翻面；
   - 撕下的像素落到半空就淡出，没有落到什么地方；
   - 字族组合和 C01 一样（Noto Sans SC + DM Mono）。C07 在构图、组件、材质、过渡、动作五个维度上都和其他九套不同，所以 ≥4 维的要求仍然满足。

## 证据目录
`evidence/C07/review-1/`：coverage、home-joined、detail-open-back、print-speed1、tear-drag、contact-copy-added、resched-accept、resched-decline、exit-confirm、exit-return、withdraw-pending、history-expand、read-confirm、approve-reject、resched-sheet、end-attend、cancel-half、draft-delete-undo、fail-retry、reduced-motion、rm-undo、scrub-void、rapid-clicks、long-many、panel。每个目录都有 `sheet.png` 和 `log.json`。

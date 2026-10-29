# C07「下盘」· R2 独立复核

- **复核对象**：主负责人冻结快照 `/home/user/JU/.build/verify/C07/src/C07.dc.html`（sha256 前 12 位 `a7b64a3b36dd`，开始时核对一致）。构建者的 `my-r2/concepts/src/C07.dc.html` 没有读，也没有用。
- **构建**：内嵌字体（`JU_FONTS_CSS=…/fonts-embed.css JU_CONCEPTS_DIR=/home/user/JU/.build/verify/C07/src JU_STANDALONE=/home/user/JU/.build/verify-C07.html JU_ONLY=C07`），产物 9.54 MB，C07 源 167 KB，索引 50 条。
- **对照**：最近邻 C05、C03 用当前 `my-r2/concepts/src` 构建到 `.build/verify/C07/ref-C05.html`、`ref-C03.html`，只截对照图。另建 C00 参考实现 `.build/verify/C07/ref-C00.html`，只用来校准撕票在本机的节奏。
- **方法**：所有浏览器任务都经 `my-r2/tools/slot.sh`，一次只占一个槽（串行队列见 `verify/_driver/runq*.sh`）。驱动是自写的 `verify/_driver/drive.cjs`：鼠标点击、拖拽、滚轮和键盘（Tab 导航、Enter、Esc、↑↓）都是真实输入；帧序列用 CDP screencast 采集浏览器实际绘制的帧，标签时间相对该段第一帧。每次挂载后、每次换环境后都先执行 `JU.shared.skins.pause(inst.envRef.current)`。复制成功路径用本机 http 加剪贴板授权（`--http`），其余用 file://。索引跳转只用在三处：§1 的静态取景、§4 的四个工具、撕票校准。13 项操作全部从首页真实导航进入。
- **负载**：所有运动帧录制时 1 分钟负载在 2.6–6.8 之间（都低于 8）。每段的负载记在各目录 `log.json` 的 `recs[].load`。
- 下文证据路径都相对 `my-r2/evidence/C07/verify/`。`sheet-*.png` 是该段 1× 帧的接触表，`r-*.jpg` 是单帧，`NN-*.png` 是静态截图。

---

## §1 视觉结论：**需修改后复核**

整体构图成立，所以不是「不通过」。首屏有明确主体：底部深墨盘是重心，上方色光列表是其余内容。三环境下列表区随环境变，盘不变。不看名字也能和最近邻区分开。

需要修改后再复核的有四处：
1. 参加者详情退回成表格（M3）。
2. 局卡用了 V27 没有的尺寸档（M4）。
3. 盘的每次交接都先清空成一块空深色面（M2），而盘正是这一套的视觉主体。
4. 作废类终态和少量内容时有无组织的空白（m4、m18）。

**依据截图（均已 Read）**：`vis-home/00–08`（双角色 × 三环境 + 滚动）、`vis-deep-j/00–13`、`vis-deep-h/00–24`、`vis-rm/00–12`（系统减少动态）、`neighbor-C05/00–03`、`neighbor-C03/00–03`、`compare/nb-C05-C07-home.jpg`、`compare/nb-C03-C07-home.jpg`、`compare/nb-detail-review-C05-C03-C07.jpg`、`measure/log.json`、`coverage/sheet.jpg`、`widths/sheet.jpg`。

| # | 问题（任务书 §07 / §11） | 结论 | 依据 |
|---|---|---|---|
| 1 | 整屏主体形态与重心；留白 | **首屏 ✓**：盘高 329 px（局主 315 px，约占 38%），装 24px 局名、座位点、倒计时和 CTA；列表 15/13px，分量轻；滚到底时最后一项仍在盘上方可见。<br>**深层页有好有坏**：票根页 ✓（票居中，深墨承托）；管理页 ✓（名单在色光上、动作在盘里，延续首页）。<br>**问题**：参加者详情 ✗（深色整页的键值表，见 M3）；作废 / 取消 / 退出终态偏空（条纹灰烬条加下半屏空，m4）；局主历史与草稿只有 1–2 条时，列表后是大片无组织空白（m18） | `vis-home/00、04、05`、`vis-deep-j/00–03、09、10`、`vis-deep-h/00、06、12、13` |
| 2 | 中文是否好读；最小字号；灰字与胶囊 | **字阶清楚**：页头 30→18、盘内局名 24、列表局名 15、元数据与状态 13、分组标签 12；最小 12px。胶囊只用在受影响人数和复制钮。<br>**问题**：状态列与盘 meta 截断（m1）；两行局名断词（m2）；手机内有 10 处范围说明灰字（m3）；「要你回应」三条状态全用错误红（m7） | `vis-deep-j/13`、`vis-deep-h/02、15、24`、`measure/log.json` |
| 3 | 表面与光是否一致 | **✓ 同一套逻辑**：不透明深墨盘、色光底、V27 CTA 高光；没有噪点、堆渐变、粗阴影。页头收拢时的一层背景模糊有功能作用，可以接受。<br>**问题**：唯一的堆渐变是作废终态的条纹灰烬条（m4） | `vis-home/00–03`、`vis-deep-j/09` |
| 4 | 深层页是否由同一构图生成 | **部分是**：票根、管理、出席、改时间、取消、局卡都是盘上升或盘作动作区生成的。非燃烧类历史事实（退出候补 / 没留住 / 放弃预留 / 到期 / 撤回）有局卡加印章，组织得最好。<br>**问题**：参加者详情是「返回 + 标题 + 表格」。同页族里 C05、C03 都把局卡放进详情，C07 没有，也违背本套命题「局卡在详情盘的上部」 | `vis-deep-j/00–02`、`compare/nb-detail-review-C05-C03-C07.jpg`、`opx-joined/09–11、13、15` |
| 5 | 关掉动画后静态画面是否成立 | **✓**：系统减少动态下，首屏、票根、散场印记、出席、取消终态都完整 | `vis-rm/00–12`、`rm-op2/07`、`rm-op7b/08` |
| 6 | 与最近邻相比，不看名字能否分辨 | **✓**：C05 是上半屏彩色面加局卡，其余在下方纸上；C03 是上下两窗，另一角色在下窗。<br>**提醒**：C03 局主态的上窗和 C07 的盘一样，都是深墨、白字、同一 CTA、同一「先处理这一件」内容，差别只在位置和另一窗 | `compare/nb-C05-C07-home.jpg`、`compare/nb-C03-C07-home.jpg` |
| 7 | 固定物件是否原件；周围空间 | **✓ 原件**：票根 258 宽（出纸口 84 px、舞台 346×520，打印 / 撕 / 燃烧都走 JURitual）；CTA 280×48 用 V27 构造；页头 30→18 连续收拢并居中；散场印记用 V27 08 场景（舞台 390×520）；局主逐人出席用共享 stampFace。<br>**问题**：局卡 258×323 是自创档（M4）；阅读约定层没有用 V27 表单卡栈（m15）；打印舞台多了一个空的圆角占位框（m5） | `measure/log.json`、`op6-host-review/05-card.jpg`、`op2-read-confirm/01-read-top.jpg`、`op3-tear-contact/r-btn-tear-00.jpg` |

---

## §2 功能与动效发现（按严重度排：blocker 0 · major 6 · minor 20）

没有发现阻断问题。13 项操作都能用真实点击、拖拽或键盘走通。数据先写后播。三类失败都看到了原位反馈，并且可以重试：撕票写入失败、取消写入失败、复制失败。

### 13 项操作执行记录

| # | 证据目录 | 亲自操作的结果 |
|---|---|---|
| 1 | `op1-scroll-role` | **标题收拢 ✓**：滚轮下滚，标题 30→18 连续收拢（240 px 处 18px 居中，83 px 处 19.6px、hc .865）；回滚后恢复 30px。<br>**角色记忆 ✓**：切到局主再切回，分区（局主停在「草稿」）和滚动位置（参加者 83 px）都保留。<br>**分区记忆 ✗**：当前分区滚到 180 px，切到历史再切回，只恢复到 83 px，见 m20。<br>**问题**：M2、m6、m20 |
| 2 | `op2-read-confirm`、`half-speed` | **✓**：未读完时确认无效；读到末尾后可以确认。确认后依次是处理中、已成局，打印中只出现「去不了了」，撕票按钮等打印结束才入场。返回后早午餐移到「要你回应 · 待撕票」，有落点高亮。<br>**问题**：M1、M2 |
| 3 | `op3-tear-contact`、`op3b-tear-redo` | **手势 ✓**：拖 90 px 回弹，不写数据；拖住时按 Esc 再松手也回弹；拖 175 px 撕开，副券坠落后出现联系层；武装写入失败时出现原件错误行，副券回位，再撕成功。<br>**复制 ✓**：武装复制失败后出现「复制失败，请长按账号复制」和「重试」；重试后显示已复制，剪贴板里是 `nina.runs`。<br>**其余 ✓**：已加微信后变待赴约；返回后进「就快见面」组；用 Tab 到抓手再按 Enter，或点按钮「撕开票根」，都能撕开。<br>**问题**：m9、m17 |
| 4 | `op4-reschedule-reply` | **接受 ✓**：新票带原定划线和「时间已改」章，撕下即接受，之后进待赴约。<br>**拒绝 ✓**：重置后点拒绝，出现确认层；确认后燃烧 B（多点烧穿）→「已退出」→ 查看退出结果 → 历史「未接受新时间」。<br>**问题**：M6、m4 |
| 5 | `op5-waitlist-withdraw-exit` | **✓ 三条都走通**：<br>• 古着淘货：门口 → 退出候补 → 回执 → 历史「已退出候补」。<br>• 周末速写：撤回 → 「已撤回」→ 历史。<br>• 外百老汇：去不了了 → 确认层 → 燃烧 C（左侧横向）→ 已退出这局 → 历史。<br>**问题**：M6、m10、m14 |
| 6 | `op6-host-review` | **审核 ✓**：发出邀请后，结果行、申请数 2→1、席位（预留 1→2，新席位动画）、头部状态在同一帧更新；谢绝 Momo 后，头部变「2 人已预留 · 等确认」，徽标 2→1。<br>**处理完 ✓**：最后一份处理完，盘变成「申请都有答复了」；首页「待你处理」组消失，酒馆移到「招募中」并有落点。<br>**局卡 ✓**：可以打开并关闭。<br>**问题**：M2、M4 |
| 7 | `op7a-reschedule`、`op7b-end-attendance` | **改时间 ✓**：同一时间被拒（红字提示，按钮 aria-disabled）；用键盘 ↑ 改到 19:45 后确认，出现 toast，头部与局卡时间重印，答复区 0/4。阳台烧烤答复区 2/3。<br>**出席 ✓**：记为散场后进入出席，Leon 出席、Ivy 未出席、西西待定，焦点按 Leon→Ivy→西西→阿宽 移动，没有自动翻页。更正 Leon 后留下轨迹。全部记录后显示「都记好了 · 1/4 人到场」，历史里同样是「1/4 人到场」。<br>**问题**：M2、m12 |
| 8 | `op8-cancel` | **✓**：确认层列出受影响的人（已确认 1 · 已预留 1 · 候补 2）；武装失败后层内显示「本机保存失败，请重试」；重试后盘内局卡燃烧，出现「这局已取消」；历史显示「已取消 · 票根作废 · 联系已关闭」。<br>**问题**：M2、M4、m4、m19 |
| 9 | `op9-drafts` | **✓**：删除后相邻草稿补位，撤销后回到原槽位，再删 10 秒后真正提交；删到 0 条后进入空态。<br>**问题**：m3、m10 |
| 10 | `op10-clock`、`hclock`、`hclock2`、`hclock3` | **参加者侧 ✓**：「到最近到期」让古着淘货候补从 2 位进到 1 位；「+24 小时」后早午餐预留到期，古着淘货轮到我，开始 6 小时预留。<br>**联系关闭 ✓**：散场 24 小时后显示「联系方式已关闭」，微信隐藏。<br>**局主侧**：「到最近到期」三次都跳到参加者侧的期限，Leon 的预留没有到期；改用 +1 小时 ×5 加 +5 分钟（结果见文末补录）。<br>**问题**：m13 |
| 11 | `op11a-variants-sizes`、`op11b-keyboard` | **✓**：七个变体 × 两个角色、360 / 430 宽、文字 115%、键盘态（改时间、局内记录）、安全区都看过。<br>**问题**：m1、m2 |
| 12 | `op12-pause-scrub`、`q6-pause` | 签名路径的暂停与关键帧基本无效，见 M5 |
| 13 | `rm-op2/3/6/7b`、`rm/` | **✓**：第 2、3、6、7 四条流程在系统减少动态下终态完整；rm-check 11/11 |

### Major

**M1 · 成局后自动跳到票根，途中整屏空白；结果层的「查看票根」按钮来不及按就被替换**
- 现象：
  - 点「确认入局」后依次出现处理中、「✓ 已确认 · 已成局」和「查看票根」按钮。
  - 1× 下约 1.13 s 后，不等点击就替换到票根。
  - 替换时有整屏空白帧（1× f25 +1216ms），返回键和标题都不在，只剩根导航，持续约 100–200 ms。
  - 之后票根面淡入并开始打印。
- 复现：参加者首页 → 盘「阅读并确认」→ 滚到「已到约定末尾」→ 确认入局 → 什么都不点。
- 证据：`op2-read-confirm/sheet-confirm.jpg`（第三行 f23→f25→f27）、`compare/op2-blank-frame-confirm-to-ticket.jpg`、`half-speed/sheet-h-confirm-to-ticket.jpg`（f62、f65）。
- 修法：二选一。
  - 保留结果层，等用户点「查看票根」。
  - 或者自动替换，但票根面要在阅读层之上进入（先入后出），不能先出后入。
  - 不要既给按钮又自动跳。

**M2 · 盘交接内容时先清空成空盘（系统性问题）；盘上升时局名和 CTA 先消失，再在别处出现**
- 现象：盘是整屏重心，但每次交接都先撤掉旧内容，约 100–150 ms 后才淡入新内容，中间是一块空的深色盘。出现在这些地方：
  - 角色切换：1× 空盘 +0→+138ms，列表本身是一帧替换，没有过渡。
  - 点「阅读并确认」：空盘上升 +0→+150ms 后才出现阅读层。
  - 列表行进票根：0.5× 下空盘约 300 ms。
  - 返回首页：空盘 +147ms。
  - 审核通过后交给下一位、出席落章后交给下一位、改时间提交后：各有一帧空盘。
  - 取消这局：半屏空深色块上升约 330 ms 后才出现局卡。
- 被点的列表行和升起的盘之间没有对应关系。
- 复现：任意一次角色切换；在首页点任意一行；局主审核点「发出邀请」；出席点「出席」；「取消这局」→ 确认。
- 证据：`compare/op1-role-switch-empty-tray.jpg`、`op1-scroll-role/sheet-m1-to-hosted.jpg`（f1–f6）、`op2-read-confirm/sheet-rise-read.jpg`（f1–f5）、`half-speed/sheet-h-row-to-ticket.jpg`（f1–f8）、`q5-misc/sheet-back-restore.jpg`（f7）、`op6-host-review/sheet-approve.jpg`（+383ms）、`op7b-end-attendance/sheet-att-1-present.jpg`（+1013ms）、`op7a-reschedule/sheet-resched-confirm.jpg`（+494ms）、`op8-cancel/sheet-cancel-retry-burn.jpg`（+473→+804ms）。
- 来源：`.c07-lead.sw-a/.sw-b` 和 `.c07-actin.sw-*` 的进入动画带 110 ms 延迟和 `backwards`，而旧内容已经先撤掉；盘上升时 lead 立即被设为 inert 并隐藏。
- 修法：
  - 交接改为重叠：旧内容淡出和新内容进入至少重叠 60–80 ms，或者新内容随盘高一起滑入。
  - 盘上升时，让 lead 的局名移动到详情标题的位置，作为同一个对象连续过去。
  - 从列表行进入时，让该行保持高亮直到被盘盖住，或者让盘从这一行的位置升起。

**M3 · 参加者详情退回成「返回 + 标题 + 键值表」，没有局卡**
- 现象：已预留、待审核、候补、待成局四种详情都是深色整页，内容依次是：
  - 状态大标题和局名；
  - 「成员」表；
  - 「参加约定 确认 3 条 / 信用 3 条 / 赴约 3 条」表。
- 这些详情页里没有局卡，也没有盘里已经有的座位点。本套命题写的是「局卡在详情盘的上部」；同页族对照里，C05、C03 同一状态的详情都放了局卡。
- 复现：在首页点「法拉盛早茶」（待成局）或「周末速写」（待审核）。
- 证据：`vis-deep-j/00-j-d-invited.jpg`、`01-j-d-pending.png`、`02-j-d-waitlist.png`、`opx-joined/03-dimsum-gathering.jpg`、`compare/nb-detail-review-C05-C03-C07.jpg`。
- 修法：
  - 在详情盘上部放原局卡（V27 档 212×265 或 196×245）。
  - 成员改用盘内的座位点加一行计数。
  - 约定改成一行摘要，点了再进阅读层。
  - 让详情从首页盘的构图长出来，而不是一张表格。

**M4 · 局卡用了自创的 258×323 档**
- 现象：
  - 下列四处的局卡都是 258 宽：局卡层、改期后的局卡、取消时燃烧的局卡、历史局卡。源码注释写的是「258 wide like the ticket paper」。
  - 这不是 V27 的任何一档。V27 只有 196×245 / 212×265 / 296×370 / 328×460，directions §0.3 和 contract §1 都要求不自创档。
- 证据：`measure/log.json`（`h-m-card` 条：`.c07-ocard:66,353 258x323`）、`op6-host-review/05-card.jpg`、`op7a-reschedule/08-card-new-time.jpg`、`op8-cancel/sheet-cancel-retry-burn.jpg`、`opx-joined/09-boardgame-queueleft.jpg`。
- 修法：
  - 盘内局卡层和取消燃烧用 296×370（大档）。
  - 历史和详情用 212×265（中档）。

**M5 · 暂停与关键帧对签名路径基本无效；关键帧重播后终态变了**

(a) 出票
- 出票中按「暂停」，打印不停：0 / 800 / 1600 ms 三帧里纸一直在走，然后落定。
- 打印过程中拖关键帧，票面不动。
- 只有在打印结束后再拖，才会重播出票，而且重播期间「撕开票根」按钮一直可见。

(b) 燃烧
- 燃烧中按「暂停」也不停，约 0.8 s 后就到终态。
- 关键帧可以 seek 燃烧。但重播并释放后，终态丢了两样东西：灰烬条，以及「已退出这局 / 主动退出 · 票根与联系已关闭」结果块；「联系方式已关闭」也移到了页底。这和第一次燃烧的终态不一致。

(c) 盘的上升
- 0.5× 下升起时按「暂停」，盘照样升完。
- 这时拖关键帧 25→100，画面一直是静止的首页，没有中间态；释放后又回到票根。
- 原因：C07 没有任何 `.scrub` 规则，盘的上升、下降、交接都是 CSS transition，关键帧控制不到。

- 复现：
  - 公园慢跑票根出票中按「暂停」。
  - 周六早午餐成局出票结束后，直接拖关键帧。
  - 外百老汇点「去不了了」→ 确认，燃烧中按「暂停」→ 拖关键帧 →「释放」→ 再拖一次。
  - 0.5× 下点「手冲咖啡」行，随即按「暂停」→ 拖关键帧。
- 证据：`q6-pause/00–03`（出票）、`05–08`（燃烧）、`09–16`（盘上升）、`op12-pause-scrub/00–17`、`op12-pause-scrub/18–32`、`compare/op12-burn-endstate-before-after-replay.jpg`。
- 修法：
  - `review.paused` 变化时，对 print / burn 的 handle 调 pause / resume。
  - 盘的上升、下降、交接改用受 `--frame` 控制的 animation，并写 `.scrub` 规则。
  - 灰烬、结果块、关闭文案这些终态由 state 决定，不靠一次性回调写入。
  - 重播出票时隐藏撕票按钮。

**M6 · 历史列表把「拒绝改期」和「主动退出」都写成「已退出」**
- 现象：
  - 周四 Livehouse 拒绝改期、外百老汇主动退出之后，历史「未成行」里两行状态都是「已退出」。
  - 「历史较多」变体里，K 歌（主动退出）和秋末野餐（拒绝改期）也是同一个字。
  - 详情页能区分两者（「未接受新时间 · 拒绝改期」/「已退出这局 · 主动退出」），列表不能。contract §4F 要求八种「没去成」是八个事实。
- 根因：共享数据里 `declined` 和 `exited` 的 label 都是「已退出」，而 C07 的历史行只显示 label。
- 证据：`op4-reschedule-reply/09-joined-history.jpg`、`op5-waitlist-withdraw-exit/13-joined-history.jpg`、`opx-joined/log.json`（历史较多各行状态）、`op4-reschedule-reply/07-history.jpg`。
- 修法：
  - C07 的未成行行改用 need 的前半（「拒绝改期」/「主动退出」）或 detailTitle。
  - 或者由主负责人在共享层把两者的 label 分开。

### Minor

**截断与排版**
- **m1 截断**：几处文字被截掉，需要把时效信息放到优先占宽的位置或换到第二行，盘 meta 拆成两行。
  - 状态列 max-width 168 px，把时效截成「候补轮到 · 已预留 · 05:3…」（`vis-deep-j/13-j-many.jpg`）。
  - 盘 meta：「已确认 2/3（含…」（`vis-deep-h/02`）、「通过即发出 6 小…」（`vis-deep-h/15`）、360 宽下「预留 1 …」（`op11a-variants-sizes/15-w360-hosted.jpg`）。
  - 草稿行两端都省略（`op9-drafts/02-drafts-tab.jpg`）。
- **m2 断词**：长局名换行时断在「第一次开 / 门请多包涵」（`vis-deep-h/24-b-long-h.jpg`）。修法：优先在「·」处断开，或用 `word-break: keep-all`。
- **m3 手机内有 10 处范围说明**：如「本轮不可点」「账户级记录页不在本次范围」「本轮未开放」（`vis-deep-j/01、11`、`vis-deep-h/12、14、18`、`op9-drafts/09`）。contract §4E 要求范围说明放在手机外。

**作废终态与占位**
- **m4 自造的灰烬条**：作废、取消、退出的终态都是一条 258×40 的条纹渐变块，看起来像条码或木条；下半屏是大片空白；「联系方式已关闭」红字左对齐悬在条上方（`vis-deep-j/09、10`、`op4-reschedule-reply/06-burned.jpg`、`op5-waitlist-withdraw-exit/sheet-exit-burn.jpg` 末帧）。原件的终态是纸没了，只留页头文案和 CTA。修法：去掉条纹块，把结果块和关闭文案对齐成一组。
- **m5 打印占位框**：出票前和出票中，落点先显示一个空的圆角框（`.c07-stage::after`，原件没有），像一个空卡槽（`op3-tear-contact/r-btn-tear-00.jpg`、`01`）。

**滚动与状态色**
- **m6 页头停在半收拢**：
  - 局主列表最多只能滚 38 px，页头停在 hc 0.40：标题 25 px，副标题 37% 透明、贴着标签行（`measure/log.json` 第 3 条、`vis-home/08-h-home-scroll-end.jpg`）。
  - 修法：短列表不收拢，或者滚到尾部时吸附到 0 或 1，副标题更早淡出。
- **m7 状态色**：「要你回应」三条状态都用错误红（首屏 3 处红字），和复制失败、保存失败是同一种颜色（`vis-home/00`）。

**返回、失败与文案**
- **m8 返回没有即时反馈**：从票根返回首页，点击后约 230 ms 画面不变（`op2-read-confirm/sheet-back-home.jpg` f1–f8）。疑似是原件销毁占住了主线程，需要真机确认。修法：先播返回过渡，过渡结束后再销毁 print / tear / contact。
- **m9 撕票失败时票根下移**：错误行插入后，票根整体下移约 13 px（`op3b-tear-redo/sheet-drag-fail.jpg` +1.2→1.6 s）。修法：预留错误行的高度，或让错误行叠放。
- **m10 文案拼接**：
  - 候补回执行首悬挂「 · 退出候补 · 不记缺席」（`op5-waitlist-withdraw-exit/03-left.jpg`）。
  - 已撤回页的结果块重复了页头内容（`07-withdrawn.png`）。
  - 草稿删空后盘标题是「0 份草稿」（`op9-drafts/09-all-deleted-committed.jpg`）。

**入口、过渡与提示位置**
- **m11 盘里那一件没有进详情的入口**：点盘里的局名没有反应（`opx-joined/log.json` 第一条 `nav=home`）。这一件的成员、约定、倒计时详情，只有在它不是 lead 时才能从列表进入。
- **m12 改时间后时间直接换字**：提交后，头部和局卡上的时间从旧到新没有过渡；M7 只在答复区用划线表达（`op7a-reschedule/sheet-resched-confirm.jpg`）。
- **m13 时钟补位提示占用了 lead 的标签行**：「「古着淘货 · 下东区三家店」候补前进到第 1 位」出现在「周六早午餐」的盘上（`op10-clock/01-joined-due1.jpg`），容易被读成这一件自己的状态。
- **m14 候补门口页底 CTA 盖住名单最后一行**：被盖住的是「№2 你」（`vis-deep-j/02-j-d-waitlist.jpg`）。修法：滚动容器底部留出 sfoot 的高度。
- **m15 阅读约定层没有用 V27 表单卡栈**：三类约定是纯文字段落（`op2-read-confirm/01-read-top.jpg`、`03-read-end.png`）。contract §1 写明卡栈用于「阅读约定」层。可读性本身没有问题。

**焦点、加载占位与共享层**
- **m16 历史印记加载期间有空矩形**：每次打开散场历史，08 场景画出来之前，有约 0.8 s 只是一个空的占位矩形；已经不重放盖章，这一点是对的（`q5-misc/sheet-jazz-open-2.jpg` +466→+1271ms）。需要真机看实际长度。
- **m17 盘升起后焦点留在被盖住的列表行；首页不 inert**：
  - 点列表行进入票根后，`activeElement` 仍是首页那一行；键盘用户要按 8 次 Tab 穿过被盘盖住的行才到撕票抓手（`op3b-tear-redo/log.json`：drag-hold-cancel 后 focus=`div[rid=run3k]`，kb-tear 前 `tabs: 8`）。
  - 首页只在表单态才设为 inert。
  - 修法：盘升起后把焦点移到返回键或该面的主动作；栈顶不是 home 时给首页加 `inert`；返回后焦点回到原行，与落点一致。
- **m18 少量内容时的空白**：局主历史只有 2 条、草稿只有 1 条时，列表后面大半屏是无组织的空白；同时盘只放了一行摘要，接近本套命题自己写的失败信号「盘吃掉一半屏幕却只放一行字」（`vis-deep-h/12`、`13`、`vis-deep-j/11`）。
- **m19 已取消的局仍在显示预留倒计时（共享层）**：取消后名单里 Leon 显示「取消前已预留 · 剩 05:01:43」（`op8-cancel/04-cancel-settled.jpg`）。来源是 `ju-ctl.js` 的 `roster.left.on = !!r.leftText`，属于共享层问题，应该由主负责人处理。另外，这里取消直接燃烧，没有看到契约写的「抽色」这一步（`op8-cancel/sheet-cancel-retry-burn.jpg`）。

- **m20 分区切换后滚动位置被钳**：参加者「当前」滚到 180 px，切到「历史」再切回「当前」，只恢复到 83 px（约等于历史分区的最大滚动值），页头停在 19.6px（hc .865）的半收拢状态。角色切换的记忆是对的（83→83）。推测是恢复滚动时旧分区内容还在 DOM 里，scrollTop 被钳住了。证据：`op1-scroll-role/log.json`（mid-180 → current-back 两次 eval）、`op1-scroll-role/04-mid-180.jpg` 对照 `06-current-back.png`。修法：等新分区渲染完（下一帧）再恢复 scrollTop，或者两个分区分别用各自的滚动容器。

### 亲自确认没有问题的部分
这些项供构建者对照。它们没问题不代表视觉已经通过。
- **页头**：30→18 连续收拢，回滚后恢复；管理页同样收拢到 18px 居中（`q5-misc/06`）。
- **返回**：滚动位置恢复到 247 px，落回原行并高亮（`q5-misc/sheet-back-restore.jpg`）。
- **角色记忆**：切换角色后，分区和滚动位置都保留。分区切换的滚动位置有问题，见 m20。
- **阅读层**：未读完时确认无效，读完后可以确认。
- **打印与撕票**：打印中只有「去不了了」，撕票按钮在打印结束后才入场；撕不到 50% 回弹且不写数据，过 50% 撕开；写入失败后可以原位重撕；键盘 Enter 和按钮与手势等价。
- **复制**：武装失败后显示原件提示和「重试」；http 下真实写入了 `nina.runs` 和 `leon_hp`。
- **燃烧**：B / C 两种都作用在原票件上，并有确定终态；第一次真实打开历史才燃烧，第二次打开是静态灰烬（`q5-misc/02`）。
- **散场印记**：历史散场印记不重放；「未出席 · 待核实」能正确显示（`q5-misc/04`）。
- **审核**：结果行、计数、席位、头部状态在同一帧更新；最后一份处理完后，盘的状态转换正确，并回到首页落点。
- **改时间**：同一时间被拒。
- **出席**：当帧写入；焦点按顺序移动；更正留下轨迹；全部记录后历史显示「1/4 人到场」。
- **草稿**：删除后相邻补位，撤销回到原槽，10 s 后提交。
- **时钟**：+24 小时后显示散场后联系关闭的文案。
- **键盘态**：输入框和主动作都在键盘之上。
- **减少动态**：2、3、6、7 四条流程终态完整。

> **环境限制**：撕开后的自动完成与坠落，在无 GPU 的无头 Chromium 里约 2 s，原件约 0.35 s 加 1.08 s。用同一个驱动、同一个手势测 C00 参考实现，也是约 2 s（`cal-C00/sheet-cal-drag-long.jpg` 对照 `cal-C07/sheet-cal-drag-long.jpg`），所以不算 C07 的问题，但撕票节奏需要真机验收。

---

## §3 覆盖表（50 条索引 × 五栏；只勾亲自看过的）

「入口存在」一栏来自 coverage 工具：50/50，0 错误，0 不符。其余四栏是亲自操作和查看的结果，「—」表示没有看过这一项。「正常速度动效已看」只勾录过 1× 帧序列的条目。

| # | 索引 | 入口存在（coverage 工具） | 真实操作成功（亲自） | 静态视觉已看 | 正常速度动效已看（1×） | 仍需用户验收 |
|---|---|---|---|---|---|---|
| 1 | `j-home` 当前（默认） | ✓ | ✓ op1 滚动/分区/角色真实点击与滚轮 | ✓ vis-home/00–04 | ✓ op1 sheet-m3-scroll-down / m1 / m2 | 真机滚动手感；分区切回后滚动位置被钳（m20） |
| 2 | `j-history` 历史 | ✓ | ✓ op1 分区 tab；op4/op5 退出后历史 | ✓ vis-deep-j/11、op5/13 | ✓ op1 sheet-m2-to-history | — |
| 3 | `j-many` 当前较多 | ✓ | ✓ 面板变体「当前较多」后查看 | ✓ vis-deep-j/13、op11a/08 | — | 状态列截断（§2 m1） |
| 4 | `j-history-many` 历史较多 | ✓ | ✓ 变体后历史 tab，逐行点开 5 条 | ✓ vis-deep-j/12、opx-joined/12 | — | — |
| 5 | `j-d-pending` 待审核 | ✓ | ✓ op5 行→详情→撤回 | ✓ op5/05、vis-deep-j/01 | ✓ op5 sheet-enter-sketch | — |
| 6 | `j-d-invited` 已预留待确认 | ✓ | ✓ op2 盘「阅读并确认」直达阅读层；opx 盘「去不了了」→放弃预留（该局详情页本身只经跳转看过，§2 m11） | ✓ vis-deep-j/00（跳转）、op2/01 | ✓ op2 sheet-rise-read | 详情无局卡（§2 M3） |
| 7 | `j-d-waitlist` 候补等待 | ✓ | ✓ op5 古着淘货门口 | ✓ op5/01 | ✓ op5 sheet-enter-waitlist | — |
| 8 | `j-d-invitedq` 候补轮到 | ✓ | ✓ op10「+24 小时」后盘内「候补轮到 · 已预留」 | ✓ op10/10 | — | 轮到后的阅读确认未另走 |
| 9 | `j-d-gathering` 已确认待成局 | ✓ | ✓ opx 法拉盛早茶行→详情 | ✓ opx-joined/03 | — | 详情无局卡（§2 M3） |
| 10 | `j-d-tear` 已出票待撕 | ✓ | ✓ op3/op3b 拖 <50% 回弹、≥50% 撕开、失败重撕、键盘 Enter、按钮 | ✓ op3/01、op3b/00 | ✓ op3b sheet-drag-short/long/fail、kb-tear、btn-tear | 撕开后自动完成与坠落在无 GPU 环境偏慢（C00 同样），需真机看节奏 |
| 11 | `j-d-contact` 已撕票待联系 | ✓ | ✓ op3 联系层、武装复制失败→失败提示+重试→已复制（http 真剪贴板） | ✓ op3/04、05 | ✓ op3 sheet-copy-fail、copy-retry | — |
| 12 | `j-d-going` 已联系待赴约 | ✓ | ✓ op3 已加微信→待赴约；op5 外百老汇 | ✓ op3/06、opx-joined/02 | ✓ op3 sheet-contacted | — |
| 13 | `j-d-reschedule` 改期待答复 | ✓ | ✓ op4 接受（撕新票）/ 重置后拒绝 | ✓ op4/01、04 | ✓ op4 sheet-enter-reply、accept | — |
| 14 | `j-d-withdraw` 撤回 / 退出确认 | ✓ | ✓ op4/op5 四种确认层（拒绝改期 / 退出候补 / 撤回 / 主动退出）+ opx 放弃预留 | ✓ op4/05、op5/02、06、10、opx-joined/04 | ✓ op5 sheet-leave-sheet、withdraw-sheet、exit-sheet | — |
| 15 | `j-d-ended` 已散场 · 历史票根 | ✓ | ✓ op11b / q5-misc 历史→周五爵士（真实点击，两次打开） | ✓ op11b/02、03、q5-misc/03、vis-rm/06 | ✓ q5-misc sheet-jazz-open-1/2（不重放盖章） | 加载占位约 0.8 s（m16）；08 场景真机表现 |
| 16 | `j-d-cancelled` 局主取消 | ✓ | ✓ opx / q5-misc 历史→深夜拉面：首开燃烧、再开静态灰烬 | ✓ opx-joined/08、q5-misc/02、vis-deep-j/09 | ✓ opx-joined sheet-open-ramen-burn、q5-misc sheet-ramen-second-open | 灰烬条（§2 m4） |
| 17 | `j-d-rejected` 审核未通过 | ✓ | ✓ opx 历史→周末麻将 | ✓ opx-joined/10 | — | — |
| 18 | `j-d-queueleft` 退出候补 | ✓ | ✓ op5 退出候补→回执→历史；opx 桌游夜 | ✓ op5/03、opx-joined/09 | ✓ op5 sheet-leave-ok | — |
| 19 | `j-d-exited` 主动退出 | ✓ | ✓ op5 外百老汇 确认层→燃烧 C→历史；opx K 歌首开燃烧 | ✓ op5/11、12、opx-joined/14 | ✓ op5 sheet-exit-burn、op12 / q6 燃烧暂停与关键帧 | 历史列表与拒绝改期同字（§2 M6）；暂停无效（M5） |
| 20 | `j-d-declined` 拒绝改期 | ✓ | ✓ op4 拒绝改期→燃烧 B→查看退出结果→历史 | ✓ op4/06、07、opx-joined/16 | ✓ op4 sheet-decline-burn、to-history | 历史列表显示「已退出」（§2 M6） |
| 21 | `j-d-expired` 预留到期 | ✓ | ✓ op10「+24 小时」早午餐预留到期；opx 熊山徒步 | ✓ opx-joined/13 | — | — |
| 22 | `j-d-released` 放弃预留 | ✓ | ✓ opx 盘「去不了了」→确认→放弃预留→历史 | ✓ opx-joined/05、11 | ✓ opx-joined sheet-release-sheet、release-ok | — |
| 23 | `j-d-withdrawn` 撤回申请 | ✓ | ✓ op5 撤回申请→结果→历史 | ✓ op5/07 | ✓ op5 sheet-withdraw-ok | 结果块与页头重复（§2 m10） |
| 24 | `j-d-absent` 散场 · 未出席待核实 | ✓ | ✓ q5-misc 变体「历史较多」→历史→熊山徒步·第二次（真实点击） | ✓ q5-misc/04、05 | — | 08 场景滚轮会翻卡而非滚页（原件交互） |
| 25 | `h-home` 当前（默认） | ✓ | ✓ op1/op6 角色切换与盘 CTA | ✓ vis-home/05–08 | ✓ op1 sheet-m1-to-hosted / to-joined、half-speed（0.5×） | 半收拢停留（§2 m6）；空盘交接（M2） |
| 26 | `h-drafts` 草稿 | ✓ | ✓ op9 删除→补位→撤销→再删→10 s 提交 | ✓ op9/02–07 | ✓ op9 sheet-del-1、undo、del-2、commit-10s | — |
| 27 | `h-history` 历史 | ✓ | ✓ op7b/op8 局主历史 tab | ✓ op7b/09、op8/05、vis-deep-h/12 | — | — |
| 28 | `h-pending` 待处理较多 | ✓ | ✓ 变体「待处理较多」查看 | ✓ vis-deep-h/15、op11a/07 | — | 盘 meta 截断（§2 m1） |
| 29 | `h-history-many` 历史较多 | ✓ | ✓ 变体「历史较多」查看 | ✓ vis-deep-h/16、op11a/11 | — | — |
| 30 | `h-drafts-many` 只有草稿 | ✓ | ✓ op9 变体「只有草稿」→草稿 tab | ✓ op9/01、02、vis-deep-h/17 | ✓ op9 sheet-del-1 | — |
| 31 | `h-m-review` 申请审核 | ✓ | ✓ op6 通过一份→谢绝最后一份（同帧：结果行/计数/席位/头部） | ✓ op6/01–04 | ✓ op6 sheet-approve、reject-last | — |
| 32 | `h-m-members` 成员与席位 | ✓ | ✓ op7a 自然酒成员；opx 复制成员微信（成功+武装失败+重试） | ✓ op7a/00、opx-hosted/01–03 | ✓ op7a sheet-enter-wine、opx-hosted sheet-copy-ok | — |
| 33 | `h-m-waitlist` 候补 | ✓ | ✓ hclock3 Leon 预留到期→候补 西西 补位（6 小时）、候补 2→1、离开记录 1→2 | ✓ hclock3/01、02、vis-deep-h/02 | ✓ hclock3 sheet-h-expire-leon | 名单换人无过渡（M2） |
| 34 | `h-m-contact` 联系信息 | ✓ | ✓ opx-hosted 成员微信复制（http 真剪贴板 leon_hp） | ✓ opx-hosted/01–03、vis-deep-h/03 | — | — |
| 35 | `h-m-leaves` 离开记录 | ✓ | ✓ opx-hosted 离开记录展开 | ✓ opx-hosted/04、vis-deep-h/04 | — | — |
| 36 | `h-m-reschedule` 改时间 | ✓ | ✓ op7a 同时间被拒→新时间→确认（真实键盘 ↑↓） | ✓ op7a/01–06、op11b/01（键盘态） | ✓ op7a sheet-resched-open、resched-confirm | 时间换字无过渡（§2 m12） |
| 37 | `h-m-replies` 改期答复 | ✓ | ✓ op7a 自然酒 0/4 答复区、阳台烧烤 2/3 答复区 | ✓ op7a/06、10 | ✓ op7a sheet-resched-confirm、enter-bbq | — |
| 38 | `h-m-cancel` 取消这局 | ✓ | ✓ op8 确认层（受影响的人）→武装失败→层内失败→重试→燃烧→历史 | ✓ op8/01–05 | ✓ op8 sheet-cancel-open、cancel-fail、cancel-retry-burn | 半屏空盘（§2 M2） |
| 39 | `h-m-end` 记为散场 | ✓ | ✓ op7b 记为散场确认层 | ✓ op7b/00 | ✓ op7b sheet-end-open、end-ok | — |
| 40 | `h-m-attendance` 出席记录 | ✓ | ✓ op7b 四人 出席/未出席/待定、焦点顺序、更正留轨迹、全部记录→历史 1/4 人到场 | ✓ op7b/01–09 | ✓ op7b sheet-att-1-present…att-4、correct-* | 章面真机质感 |
| 41 | `h-m-card` 完整局卡 | ✓ | ✓ op6/op7a 查看局卡并关闭 | ✓ op6/05、op7a/08 | ✓ op6 sheet-card-open、card-close | 局卡 258 档（§2 M4） |
| 42 | `h-m-cancelled` 已取消的局 | ✓ | ✓ op8 历史→已取消的局 | ✓ op8/06、vis-deep-h/11 | ✓ op8 sheet-open-cancelled | — |
| 43 | `h-draft` 草稿摘要 | ✓ | ✓ opx-hosted 草稿行→摘要 | ✓ opx-hosted/05、06、vis-deep-h/14 | ✓ opx-hosted sheet-open-draft | — |
| 44 | `b-empty` 完全空 | ✓ | ✓ 变体「完全空」两角色 | ✓ vis-deep-h/18、op11a/00 | — | — |
| 45 | `b-empty-h` 完全空 · 局主 | ✓ | ✓ 同上 | ✓ vis-deep-h/19、op11a/01 | — | — |
| 46 | `b-single` 只有一场 | ✓ | ✓ 变体「只有一场」 | ✓ vis-deep-h/20、op11a/02 | — | — |
| 47 | `b-single-h` 只有一场 · 局主 | ✓ | ✓ 同上 | ✓ vis-deep-h/21、op11a/03 | — | — |
| 48 | `b-drafts` 只有草稿 | ✓ | ✓ 变体「只有草稿」两角色；op9 删到空 | ✓ vis-deep-h/22、op11a/04、05、op9/09 | ✓ op9 sheet-del-last | — |
| 49 | `b-long` 长标题长地点 | ✓ | ✓ 变体「长标题长地点」 | ✓ vis-deep-h/23、op11a/12 | — | — |
| 50 | `b-long-h` 长标题 · 局主 | ✓ | ✓ 同上 | ✓ vis-deep-h/24、op11a/13 | — | 两行局名断词（§2 m2） |

---

## §4 工具结果（原始数字）

四个工具都在 `/home/user/JU/.build/verify-C07.html` 上运行，都经过 slot.sh。它们都靠索引跳转到目标状态，所以测不到真实导航路径上的问题。§2 的 M1、M2、M5、M6、m8、m17 在这些工具里都不会出现。

| 工具 | 命令输出（原样） | 运行时段与 1 分钟负载 |
|---|---|---|
| coverage | `{"states":50,"errors":0,"mismatches":0,"sheet":"/home/user/JU/my-r2/evidence/C07/verify/coverage/sheet.jpg"}`（log.json：keys 50，errors []，mismatches []）→ `coverage/sheet.jpg`、50 张 | 10:43:04–10:46:11 · 3.16→9.15 |
| widths | `{"code":"C07","shots":48,"sheet":"/home/user/JU/my-r2/evidence/C07/verify/widths/sheet.jpg","overflow":[],"findings":[],"fontInvariance":[],"minFont":12,"api":{"zoom":"ok","safe":"ok"},"errors":0}` | 10:47:01–10:52:01 · 7.47→7.28 |
| kb-check | `{"code":"C07","shots":2,"findings":[],"errors":0}`；明细：h-m-reschedule 的 date / time 底边 368 px，确认键底边 484 px，键盘顶 544 px；j-d-ended 记录的 text 底边 389 px，提交底边 482 px | 10:52:01–10:53:25 · 7.28→5.05 |
| rm-check | `{"code":"C07","rmSys":true,"flowsOk":"11/11","findings":[],"errors":0}`；11 条流程：enter-back✓, read-confirm✓, tear-contact-copy✓, reschedule-accept✓, reschedule-decline✓, waitlist-leave✓, review-approve-reject✓, reschedule-propose✓, cancel-burn✓, end-attend✓, draft-delete-undo✓ | 10:53:25–10:54:06 · 5.05→2.83 |

其他静态核对：
- 快照源 171,338 B，不超过 200 KB；构建报告 C07 167 KB。
- 禁用词（扣分 / 信用分 / 处罚 / 等级 / 剩余次数）在快照源中出现 0 次。
- 手机内范围说明 10 处（m3）。
- 最小字号：自测 12px，与 widths 一致。

工具原始输出：`coverage.stdout.txt`、`widths.stdout.txt`、`kb.stdout.txt`、`rm.stdout.txt`，以及同名目录下的 `log.json` 和截图。

---

## 补录（局主侧候补补位）

**局主侧**（德州扑克新手桌，`hclock3`）：
- 「到最近到期」连按三次，时钟停在 16:05 / 17:00 / 17:08，都是参加者侧的期限，Leon 的预留没有到期（`hclock/log.json`）。
- 改用 +1 小时 ×5，再按 +5 分钟。Leon 的预留到期后：
  - 候补 №1 西西补位，拿到 6 小时预留（剩 05:59:58）；
  - 候补数 2→1；
  - 离开记录 1→2；
  - 盘标签变成绿字「Leon 的预留已到期 · 候补 西西 已补位 · 6 小时预留」。
- 名单行是一帧直接换人，没有过渡；盘在 +0 帧是空的（同 M2）。证据：`hclock3/01-cards-leon-expired.jpg`、`02-cards-expired-scrolled.png`、`sheet-h-expire-leon.png`。

**参加者侧**（`op10-clock`）：
- 到期后，古着淘货候补从 2 位进到 1 位。
- +24 小时后，早午餐预留到期，古着淘货进入「候补轮到 · 已预留」，6 小时倒计时开始。
- 看展搭子的联系方式在散场 24 小时后关闭。

---

## 复核第 2 轮（快照 `a9cc4edf6f52` · 2026-10-29 14:53–15:08）

- **快照与构建**：sha256 前 12 位核对一致；共享核心已更新，按原简报用内嵌字体重建 `/home/user/JU/.build/verify-C07.html`（C07 191 KB）。
- **方法**：只用真实点击、滚轮和键盘，不用 jump。动效先看 1×，再看 0.5×，并用暂停和关键帧看落点。所有帧录制时 1 分钟负载在 2.3–3.5 之间（低于 8，见 `r2/*/log.json` 的 `recs[].load`）。
- **新增检查方法**：自写一个逐帧采样器，在 rAF 里记录盘内与页面标题的位置和实际不透明度，判定同一时刻有没有两份标题叠在一起（`_driver/r2gen.py`）。
- **证据**：放在 `verify/r2/A–F`（41 MB），路径下文都相对 `verify/`。

### 视觉结论：**需修改后复核（范围已收窄到两项动效）**
- **已过**：静态门槛各项都过了。M3 详情有了局卡构图，M4 局卡改成 212×265，m3、m4、m7 也已改好。依据：`r2/A/01-detail.jpg`、`r2/B/00-home.jpg`、`r2/C/21-exit-end-first.jpg`、`r2/F/00–04`。
- **还要改**：
  1. 盘内交叉时新旧标题在同一位置叠印（major）。
  2. 取消这局的燃烧拖过关键帧后，终态不落定（major）。
- **仍在的小问题**：m18 少量内容时的空白（minor）。

### M1–M6 复核
| 项 | 结论 | 证据 |
|---|---|---|
| M1 | **✓ 已改**：确认后结果层保留，3 s、5 s 后仍停在「已确认 · 已成局 / 查看票根」，点了才进票根；票根面叠在阅读层之上淡入，没有空白帧 | `r2/A/04-after-confirm-3s.jpg`、`05-after-confirm-5s.png`、`r2/A/sheet-view-ticket-1x.jpg`、`r2/A2/sheet-view-ticket-05x.jpg` |
| M2 | **空盘已消失，但出现了新问题**：<br>• 已改：角色切换 +0 帧就有新内容；行按下 +53ms 有高亮；审核通过 / 谢绝的交接没有空帧。<br>• 新问题：改成原位交叉淡化后出现标题叠印，见下方「新增检查 1」 | `r2/B/sheet-role-hosted-1x.jpg`、`r2/A/sheet-enter-detail-1x.jpg`、`r2/C/sheet-approve-1x.jpg` |
| M3 | **✓ 已改**：详情盘上部是原局卡 212×265，下面是座位点和约定一行摘要；点盘内局名也能进详情 | `r2/A/01-detail.jpg`、`r2/E/00-m11-lead-title-click.jpg` |
| M4 | **✓ 已改**：局卡全部是 212×265，见下方「新增检查 2」 | `r2/F/log.json` |
| M5 | **大部分已改，取消燃烧还有一处残留**，分项见下方「M5 分项」 | `r2/D/00–07`、`r2/D/16–17`、`r2/C/05–06、08、10`、`r2/C/21` 对照 `27` |
| M6 | **✓ 已改**（共享 label）：「历史较多」里秋末野餐显示「拒绝改期」，K 歌显示「已退出」 | `r2/B/09-M6-history-many-scrolled.jpg` |

**M5 分项**
- **盘上升 ✓**：0.5× 下按暂停后画面冻结（trayTop 166 不变）；拖关键帧 0→100 连续插值；释放后走完。
- **返回段 ✓**：暂停同样能冻结。
- **燃烧 ✓**：暂停能冻结；关键帧 seek 连续。
- **退出票根燃烧 ✓**：重播后的终态和第一次一致。
- **取消这局的局卡燃烧（残留，major）**：按「暂停 → 拖关键帧 → 释放」操作后，停在空舞台；等 6 s、再拖一次再等 6.5 s，都不出现「这局已取消」结果块，`data-state` 一直是 `burning`。不拖关键帧时，8 s 内正常落定。证据：`r2/C/12-cancel-end-after-release.jpg`、`r2/C/18-cancel-end-after-replay.jpg` 对照 `r2/E/03-cancel-normal-end-8s.jpg`；合图 `r2/cancel-burn-pause-scrub-end.jpg`。
- **不是 C07 的问题**：燃烧结束后再拖关键帧，重播的是返回段（0 = 票根，100 = 首页），释放后再进入。这符合共享 mixin「导航重播 = 返回再进入」。

### 新增检查 1：盘内块交叉时，新旧标题是否同位叠印 —— **有（major）**

每次进入和返回都会叠印，详细位置如下：
- **进入详情**（法拉盛早茶）：
  - 1× +128ms：「周六早午餐 · 只聊不卷」和「等待全员确认」叠在同一位置，旧的「阅读并确认」CTA 也压在新局卡上（`r2/A/r-enter-detail-1x-04.jpg`）。
  - 0.5× +160–203ms 连续 3 帧（`r2/A/sheet-enter-detail-05x.jpg`）。
- **从详情返回**：1× +57–115ms，旧详情和新 lead 叠在一起（`r2/A/r-back-detail-1x-02.jpg`、`03`）。
- **从票根返回**：1× +101–185ms，「撕开，联系局主」加票根和新 lead「周五 Livehouse」叠在一起。采样器记录到两者的不透明度从 0.82/0.17 变到 0.08/0.81，同时可见；0.5× 结果一致（`r2/A/r-ticket-back-1x-04.jpg`、`05`、`r2/A2/log.json`）。
- **首页 → 管理**：+53–122ms，上半区「我的局」列表和「东村小酒馆试营业」管理页整页双重曝光；盘内 lead「东村小酒馆试营业」和动作块「阿蒋」也叠在一起（`r2/C/sheet-enter-review-1x.jpg`）。
- **管理 → 首页**：+17–98ms，「申请都有答复了」和「看展搭子 · 现代馆」叠在一起（`r2/C/log.json` overlaps）。
- **暂停截图**：暂停在盘上升中途的静帧同样是两份标题叠在一起（`r2/D/00-rise-paused-0.jpg`）。合图：`r2/overprint-enter-detail-and-returns.jpg`、`r2/overprint-returns.jpg`。
- **没有叠印的地方**：审核通过和谢绝的交接（同一个元素里换内容）。
- **修法**，二选一或组合：
  - 交接分两段：旧块 0–90 ms 内淡到 0，新块 90 ms 后再进入。
  - 新块错位进入：先上移 12–16 px，再落到位。
  - 进入详情时，把 lead 的局名当作同一对象移到详情标题的位置，不要同时显示两份。

### 新增检查 2：局卡是否全套 212×265 —— **局卡模板全部是**
- **212×265 ✓**：详情（早午餐、法拉盛早茶）、局卡层（东村小酒馆、自然酒）、取消燃烧的局卡（已先抽色）、历史纸面局卡（桌游夜、周末麻将）。证据：`r2/A/log.json`、`r2/C/log.json`、`r2/E/log.json`、`r2/F/log.json`。
- **不是 212 档的两处**：
  - 散场 08 印记场景是 V27 原件几何（卡 250×313，占位框同尺寸，`r2/F/02-hist-jazz-08.jpg`），属于原件，不算违规。
  - 草稿摘要用的是票面样式 258×226（`r2/B/12-draft-summary.jpg`），不是局卡模板；如果主负责人把它算作局卡，就不符合。

### Minor 抽查（13 条）
| 项 | 结论 | 证据 |
|---|---|---|
| m1 截断 | ✓ 状态列不再截断（「候补轮到 · 已预留 · 05:39:35」完整显示）；只有地点被省略，规则允许 | `r2/E/04-m1-many-joined.jpg` |
| m2 断词 | ✓ 长局名在「·」处断行 | `r2/E/06-m2-long-hosted.jpg` |
| m3 范围说明 | ✓ 手机内 0 处（扫描了首页、历史、草稿、空态、草稿摘要的 innerText） | `r2/B/log.json` |
| m4 灰烬条 | ✓ 已去掉，终态只剩页头、「联系方式已关闭」和 CTA | `r2/C/21-exit-end-first.jpg` |
| m5 打印占位框 | ✓ 已去掉 | `r2/A/sheet-view-ticket-1x.jpg` |
| m6 半收拢 | ✓ 局主短列表能收拢到 18px | `r2/E/02-m6-hosted-bottom.jpg` |
| m7 状态色 | ✓「要你回应」改用紫色 rgb(91,47,180)，不再是错误红 | `r2/B/log.json`、`r2/B/00-home.jpg` |
| m11 盘内入口 | ✓ 点盘内局名能进详情 | `r2/E/00` |
| m14 CTA 遮挡 | ✓「№2 你」不再被 CTA 盖住 | `r2/E/01-m14-waitlist-bottom.jpg` |
| m17 焦点 | ✓ 进票根后焦点在返回键，首页 inert，Tab 2 次到撕票抓手；返回后焦点回到原行，首页恢复可用 | `r2/C/log.json` |
| m19 倒计时 | ✓ 取消后名单不再显示预留倒计时；局卡先抽色再燃烧 | `r2/C/04-cancel-burning.jpg`、`12` |
| m20 分区记忆 | ✓ 当前 180 px → 历史 → 当前，仍是 180 px | `r2/B/log.json` |
| m18 空白 | ✗ 仍在：局主历史 1 条、草稿 1 条时，列表后面大半屏空白，盘只放两行字 | `r2/B/05-hosted-drafts.jpg`、`06-hosted-history.png` |

### 仍需用户验收
- 叠印约持续 1–2 个 1× 绘制帧，需要在真机上看它是否明显。
- 取消燃烧、出席章在真机上的节奏。
- 08 场景在真机上的表现。

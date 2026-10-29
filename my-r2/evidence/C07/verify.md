# C07「下盘」· R2 独立复核

- **复核对象**：主负责人冻结快照 `/home/user/JU/.build/verify/C07/src/C07.dc.html`（sha256 前 12 位 `a7b64a3b36dd`，复核开始时核对一致）。构建者的 `my-r2/concepts/src/C07.dc.html` 未读、未用。
- **构建**：内嵌字体（`JU_FONTS_CSS=…/fonts-embed.css JU_CONCEPTS_DIR=/home/user/JU/.build/verify/C07/src JU_STANDALONE=/home/user/JU/.build/verify-C07.html JU_ONLY=C07`）→ 9.54 MB，C07 源 167 KB，索引 50。
- **对照**：最近邻 C05、C03 用当前 `my-r2/concepts/src` 构建到 `.build/verify/C07/ref-C05.html`、`ref-C03.html`（只截对照图）；撕票节奏校准另建 C00 → `.build/verify/C07/ref-C00.html`。
- **方法**：所有浏览器任务经 `my-r2/tools/slot.sh`，一次只占一个槽（自写串行队列 `verify/_driver/runq*.sh`）。自写驱动 `verify/_driver/drive.cjs`：真实鼠标点击 / 拖拽 / 滚轮、真实键盘（Tab 导航、Enter、↑↓），帧序列用 CDP screencast（浏览器真实绘制帧，标签时间相对该段第一帧）；挂载后与换环境后都先 `JU.shared.skins.pause(inst.envRef.current)`。复制成功路径用本机 http + 剪贴板授权（`--http`），其余 file://。索引跳转只用于 §1 的静态取景、§4 的工具和撕票校准，13 项操作全部从首页真实导航。
- **负载**：全部运动帧录制时 1 分钟负载 2.6–6.8（< 8），每段负载写在各目录 `log.json` 的 `recs[].load`。
- 下文证据路径都相对 `my-r2/evidence/C07/verify/`。`sheet-*.png` 是该段 1× 帧接触表，`r-*.jpg` 是单帧。

---

## §1 视觉结论：**需修改后复核**

整体构图成立，不是「不通过」：首屏有明确主体（底部深墨盘 = 重心，上方色光列表 = 其余），三环境下列表区变、盘不变，和最近邻能直接分辨。需要修改的是深层页的一部分、一个固定物件的尺寸档，以及盘的交接方式（§2 M1–M2 对画面质量的影响与静态问题同级）。

**依据截图（均已 Read）**：`vis-home/00–08`（双角色 × 三环境 + 滚动）、`vis-deep-j/00–13`、`vis-deep-h/00–24`、`vis-rm/00–12`（系统减少动态）、`neighbor-C05/00–03`、`neighbor-C03/00–03`、`compare/nb-C05-C07-home.png`、`compare/nb-C03-C07-home.png`、`compare/nb-detail-review-C05-C03-C07.png`、`measure/log.json`。

| # | 问题（任务书 §07 / §11） | 结论 | 依据 |
|---|---|---|---|
| 1 | 完整主体形态与重心；留白 | 首屏 ✓：盘 329 px（局主 315 px，约 38%）承载 24px 局名 + 座位点 + 倒计时 + CTA，列表 15/13px 轻；滚到底最后一项在盘上方可见。深层页分化：票根页 ✓（票居中，深墨承托）；管理页 ✓（名单在色光上、动作在盘里，延续首页）；**参加者详情 ✗**（深色整页的键值表，见 M3）；**作废/取消/退出终态偏空**（条纹灰烬条 + 下半屏空，m4）；**单项列表空**（局主历史 1 条、草稿 1 条后是大片无组织空白：`vis-deep-h/12`、`13`） | `vis-home/00、04、05`、`vis-deep-j/00–03、09、10`、`vis-deep-h/00、06、12、13` |
| 2 | 中文可读性、最小字号、灰字 / 胶囊 | 字阶清楚（30→18 页头 / 24 盘内局名 / 15 列表局名 / 13 元数据与状态 / 12 分组标签），最小 12px；胶囊只在受影响人数与复制钮。问题：状态列与盘 meta 截断（m1）、两行局名断词（m2）、手机内范围说明灰字 10 处（m3）、「要你回应」三条状态全用错误红（m7） | `vis-deep-j/13`、`vis-deep-h/02、15、24`、`measure/log.json` |
| 3 | 表面与光是否一致 | ✓ 一个逻辑：不透明深墨盘 + 色光底 + V27 CTA 高光；无噪点 / 堆渐变 / 粗阴影。页头收拢时有一层功能性背景模糊（可接受）。唯一的「堆渐变」是作废终态的条纹灰烬条（m4） | `vis-home/00–03`、`vis-deep-j/09` |
| 4 | 深层页是否同一构图生成 | 部分：票根 / 管理 / 出席 / 改时间 / 取消 / 局卡都是「盘上升或盘作动作区」生成；**参加者详情是返回 + 标题 + 表格**，同页族里 C05、C03 都把局卡放进详情，C07 没有（且违背本套命题「局卡在详情盘的上部」）。历史中非燃烧类事实（退出候补 / 没留住 / 放弃预留 / 到期 / 撤回）有局卡 + 印章，组织得最好 | `vis-deep-j/00–02`、`compare/nb-detail-review-C05-C03-C07.png`、`opx-joined/09–11、13、15` |
| 5 | 关掉动画后静态是否成立 | ✓ 系统减少动态下首屏、票根、散场印记、出席、取消终态都完整 | `vis-rm/00–12`、`rm-op2/07`、`rm-op7b/08` |
| 6 | 与最近邻是否不看名字能分辨 | ✓ C05 是上半屏彩色面 + 局卡、其余在下方纸上；C03 是上下两窗（另一角色在下窗）。共有语汇提醒：C03 局主态上窗与 C07 盘同为深墨 + 白字 + 同一 CTA + 同一「先处理这一件」内容，差别只在位置与另一窗 | `compare/nb-C05-C07-home.png`、`compare/nb-C03-C07-home.png` |
| 7 | 固定物件是否原件、周围空间 | 票根 258 宽原件 ✓（出纸口 84 px、舞台 346×520、打印 / 撕 / 燃烧走 JURitual）；CTA 280×48 V27 构造 ✓；页头 30→18 连续收拢并居中 ✓；散场印记 V27 08 场景（舞台 390×520 ≥ 486）✓，局主逐人用共享 stampFace ✓。**局卡 258×323 是自创档**（M4）；阅读约定层没有用 V27 表单卡栈（m15）；打印舞台多了一个空圆角占位框（m5） | `measure/log.json`、`op6-host-review/05-card.png`、`op2-read-confirm/01-read-top.png`、`op3-tear-contact/r-btn-tear-00.jpg` |

---

## §2 功能与动效发现（按严重度；blocker 0 · major 7 · minor 15）

未发现阻断：13 项操作都能用真实点击 / 拖拽 / 键盘走通，数据先写后播、失败可重试（撕票写入失败、取消写入失败、复制失败都看到原位反馈）。

### Major

**M1 · 成局后自动替换到票根，途中整屏空白；结果层的「查看票根」被自动跳转抢先**
- 现象：阅读层「确认入局」→ 处理中 → 「✓ 已确认 · 已成局 / 查看票根」，约 1.2 s 后不等点击就 replace 到票根；替换时出现只剩根导航的整屏空白帧（1× ≈ 90–125 ms，0.5× 两帧 ≈ 200 ms），随后票根面淡入、打印。
- 复现：参加者首页 → 盘「阅读并确认」→ 滚到「已到约定末尾」→ 确认入局 → 不点任何东西。
- 证据：`op2-read-confirm/sheet-confirm.png`（f23→f25→f27）、`compare/op2-blank-frame-confirm-to-ticket.png`、`half-speed/sheet-h-confirm-to-ticket.png`（f62、f65）。
- 修法：二选一——保留结果层直到用户点「查看票根」；或自动替换但票根面叠在阅读层之上进入（先入后出），不要先出后入。不要同时给按钮又自动跳。

**M2 · 盘内容交接时先清空成空盘（系统性），上升时局名与 CTA 先消失再在别处出现**
- 现象：盘是整屏重心，每次交接都先撤掉旧内容、隔约 110 ms 再淡入新内容，中间是一块空的深色盘：角色切换 1× ≈ 100–140 ms（列表区一帧替换、无过渡）；点「阅读并确认」后空盘上升约 150 ms 才出阅读层；列表行进票根同样（0.5× 约 300 ms 空盘）；审核通过交给下一位、出席落章交给下一位、改时间提交后各有一帧空盘；取消这局时半屏空深色块上升约 330 ms 才出局卡。被点的列表行与升起的盘之间没有对应关系。
- 复现：任意角色切换；首页点任一行；局主审核「发出邀请」；出席「出席」；「取消这局」→ 确认。
- 证据：`compare/op1-role-switch-empty-tray.png`、`op1-scroll-role/sheet-m1-to-hosted.png`（f1–f5）、`op2-read-confirm/sheet-rise-read.png`（f1–f4）、`half-speed/sheet-h-row-to-ticket.png`（f1–f8）、`op6-host-review/sheet-approve.png`（+383ms）、`op7b-end-attendance/sheet-att-1-present.png`（+1013ms）、`op7a-reschedule/sheet-resched-confirm.png`（+494ms）、`op8-cancel/sheet-cancel-retry-burn.png`（+473→+804ms）。
- 来源：`.c07-lead.sw-a/.sw-b`、`.c07-actin.sw-*` 的进入动画带 110 ms 延迟 + `backwards`，旧内容已先撤；上升时 lead 立即 inert/隐藏。
- 修法：交接改为重叠（旧内容淡出与新内容进入至少重叠 60–80 ms，或新内容随盘高度一起滑入）；盘上升时让 lead 的局名移动到详情标题位置（同一对象）；从列表行进入时，行保持高亮直到被盘覆盖，或盘从该行位置升起。

**M3 · 参加者详情退回「返回 + 标题 + 键值表」，没有局卡**
- 现象：已预留 / 待审核 / 候补 / 待成局详情都是深色整页：状态大标题、局名、「成员」表、「参加约定 确认 3 条 / 信用 3 条 / 赴约 3 条」表；没有局卡、没有盘里已有的座位点。本套命题写的是「局卡在详情盘的上部」；同页族对照 C05、C03 都把局卡放进同一状态的详情。
- 复现：首页点「法拉盛早茶」（待成局）或「周末速写」（待审核）。
- 证据：`vis-deep-j/00-j-d-invited.png`、`01-j-d-pending.png`、`02-j-d-waitlist.png`、`opx-joined/03-dimsum-gathering.png`、`compare/nb-detail-review-C05-C03-C07.png`。
- 修法：详情盘上部放原局卡（V27 档 212×265 或 196×245），成员改用盘内的座位点 + 一行计数，约定改为一行摘要 + 进入阅读层；让详情由首页盘的构图长出来，而不是表格。

**M4 · 局卡用了自创的 258×323 档**
- 现象：局卡层、改期后局卡、取消燃烧的局卡、历史局卡都是 258 宽（源码注释「258 wide like the ticket paper」），不是 V27 档 196×245 / 212×265 / 296×370 / 328×460（directions §0.3、contract §1「不自创档」）。
- 证据：`measure/log.json`（`h-m-card` 条：`.c07-ocard:66,353 258x323`）、`op6-host-review/05-card.png`、`op7a-reschedule/08-card-new-time.png`、`op8-cancel/sheet-cancel-retry-burn.png`、`opx-joined/09-boardgame-queueleft.png`。
- 修法：盘内局卡层与取消燃烧用 296×370（大）；历史与详情用 212×265（中）。

**M5 · 暂停 / 关键帧对签名路径基本无效；关键帧重播后终态变了**
- 现象：(a) 出票中按「暂停」打印不停；拖关键帧 0→100 票面不动；只在「结束后拖」时重播出票，且重播期间「撕开票根」按钮一直可见。盘的上升 / 下降 / 交接是 CSS transition，C07 没有任何 `.scrub` 规则，关键帧对它们无效。(b) 燃烧中按「暂停」不停（约 1 s 内到终态）；关键帧能 seek 燃烧，但重播 + 释放后终态丢了灰烬条与「已退出这局 / 主动退出 · 票根与联系已关闭」结果块，「联系方式已关闭」移到页底——与首次终态不一致。
- 复现：周六早午餐确认成局后出票中按「暂停」→ 拖关键帧 →「释放」；出票结束后直接拖关键帧；外百老汇「去不了了」→ 确认 → 燃烧中「暂停」→ 拖关键帧 →「释放」→ 再拖一次。
- 证据：`op12-pause-scrub/00–09`（出票）、`10–17`（结束后重播）、`18–32`（燃烧）、`compare/op12-burn-endstate-before-after-replay.png`。
- 修法：`review.paused` 变化时对 print / burn handle 调 pause / resume；给盘的上升 / 下降 / 交接改用可受 `--frame` 控制的 animation 并写 `.scrub` 规则；终态（灰烬 / 结果块 / 关闭文案）由 state 决定，不由一次性回调写入；重播出票时隐藏撕票按钮。

**M6 · 历史列表把「拒绝改期」与「主动退出」都写成「已退出」**
- 现象：周四 Livehouse 拒绝改期后、外百老汇主动退出后，历史「未成行」里两行状态都是「已退出」；「历史较多」变体里 K 歌（主动退出）与秋末野餐（拒绝改期）也同字。详情页能区分（「未接受新时间 · 拒绝改期 · 席位已释放」/「已退出这局 · 主动退出」），列表不能。契约 §4F：八种「没去成」是八个事实。
- 证据：`op4-reschedule-reply/09-joined-history.png`、`op5-waitlist-withdraw-exit/13-joined-history.png`、`opx-joined/log.json`（历史较多行状态列表）、`op4-reschedule-reply/07-history.png`。
- 修法：未成行行的状态用 need 前半（「拒绝改期」「主动退出」）或 detailTitle，保证八种事实在列表层可辨。

**M7 · 盘升起后焦点留在被盖住的列表行；首页不 inert**
- 现象：点列表行进入票根后，`activeElement` 仍是首页那一行；键盘用户要 Tab 8 次穿过被盘盖住的列表行才到撕票抓手；首页只在表单态才 inert。
- 证据：`op3b-tear-redo/log.json`（drag-hold-cancel 后 focus=`div[rid=run3k]`，kb-tear 前 `tabs: 8`）。
- 修法：盘升起后把焦点移到返回键或该面主动作；栈顶不是 home 时给首页加 `inert`；返回后焦点回到原行（与落点一致）。

### Minor

- **m1 截断**：`.c07-row .st` 的 max-width 168 px 把时效截掉「候补轮到 · 已预留 · 05:3…」（`vis-deep-j/13-j-many.png`）；盘 meta「已确认 2/3（含…」（`vis-deep-h/02`）、「通过即发出 6 小…」（`vis-deep-h/15`）、360 宽「预留 1 …」（`op11a-variants-sizes/15-w360-hosted.png`）；草稿行两端省略（`op9-drafts/02-drafts-tab.png`）。修法：时效信息优先占宽或换到第二行；盘 meta 拆两行。
- **m2 断词**：长局名两行断在「第一次开 / 门请多包涵」（`vis-deep-h/24-b-long-h.png`）。修法：优先在「·」处断，或 `word-break: keep-all`。
- **m3 手机内范围说明 10 处**：「本轮不可点」「账户级记录页不在本次范围」「本轮未开放」（`vis-deep-j/01、11`、`vis-deep-h/12、14、18`、`op9-drafts/09`）。契约 §4E：范围说明放手机外。
- **m4 自造灰烬条**：作废 / 取消 / 退出终态是一条 258×40 的条纹渐变块，像条码或木条；下半屏大片空；「联系方式已关闭」红字左对齐悬在条上方（`vis-deep-j/09、10`、`op4-reschedule-reply/06-burned.png`、`op5-waitlist-withdraw-exit/sheet-exit-burn.png` 末帧）。原件终态是纸没了 + 页头文案 + CTA。修法：去掉条纹块，结果块与关闭文案对齐成一组。
- **m5 打印占位框**：出票前 / 中，落点先显示一个空圆角框（`.c07-stage::after`，原件没有），像空卡槽（`op3-tear-contact/r-btn-tear-00.jpg`、`01`）。
- **m6 半收拢停留**：局主列表最大滚动只有 38 px，页头停在 hc 0.40（标题 25 px、副标题 37% 透明贴着标签行）（`measure/log.json` 第 3 条、`vis-home/08-h-home-scroll-end.png`）。修法：短列表不收拢，或尾部吸附到 0/1，副标题更早淡出。
- **m7 状态色**：「要你回应」三条状态都用错误红（首屏 3 处红字），与复制失败、保存失败同色（`vis-home/00`）。
- **m8 返回无即时反馈**：从票根返回首页前约 230 ms 画面不变（`op2-read-confirm/sheet-back-home.png` f1–f8），疑为原件销毁占主线程；需真机确认。修法：先播返回过渡，过渡结束再销毁 print / tear / contact。
- **m9 撕票失败时票根下移**：错误行插入使票根整体下移约 13 px（`op3b-tear-redo/sheet-drag-fail.png` +1.2→1.6 s）。修法：预留错误行高度或叠放。
- **m10 文案拼接**：候补回执行首悬挂「 · 退出候补 · 不记缺席」（`op5-waitlist-withdraw-exit/03-left.png`）；已撤回页结果块重复页头（`07-withdrawn.png`）；草稿删空后盘标题「0 份草稿」（`op9-drafts/09-all-deleted-committed.png`）。
- **m11 盘里的「先处理这一件」没有进详情的入口**：点局名无反应（`opx-joined/log.json` 首条 `nav=home`），它的成员 / 约定 / 倒计时详情只有在它不是 lead 时才能从列表进。
- **m12 改时间提交后时间直接换字**：头部与局卡上的旧→新时间没有过渡，M7 只在答复区用划线表达（`op7a-reschedule/sheet-resched-confirm.png`）。
- **m13 时钟补位提示占用 lead 标签行**：「「古着淘货 · 下东区三家店」候补前进到第 1 位」出现在「周六早午餐」的盘上（`op10-clock/01-joined-due1.png`），易误读成这一件的状态。
- **m14 候补门口页底 CTA 盖住名单最后一行「№2 你」**（`vis-deep-j/02-j-d-waitlist.png`）。修法：滚动容器底部留出 sfoot 高度。
- **m15 阅读约定层未用 V27 表单卡栈**：三类约定是纯文字段落（`op2-read-confirm/01-read-top.png`、`03-read-end.png`）；契约 §1 写明卡栈用于「阅读约定」层。可读性本身没问题。

### 亲自确认没有问题的（供构建者对照，不代表视觉通过）
页头 30→18 连续收拢、回滚恢复（`op1` eval：240 px 处 18px 居中、回顶 30px）；角色与分区记忆（局主「草稿」分区切回后保持）；阅读层未读完确认禁用、读完启用；打印中只有「去不了了」、撕票按钮在打印结束后才入场；撕 <50% 回弹不写数据、≥50% 撕开、写入失败原位重撕、键盘 Enter 与按钮等价；复制武装失败 → 原件「复制失败，请长按账号复制」+ 重试 → http 下真实写入 `nina.runs` / `leon_hp`；燃烧 B / C 作用在原票件上并有确定终态，首次真实打开历史才燃烧；审核通过后结果行 / 计数 / 席位 / 头部同一帧更新，最后一份处理完盘转为「申请都有答复了」并回首页落点；改时间同时间被拒（红字提示 + 按钮禁用）；出席当帧写入、焦点按 Leon→Ivy→西西→阿宽 移动、更正留轨迹、全部记完历史「1/4 人到场」；草稿删除补位 / 原槽撤销 / 10 s 提交；+24 小时后散场联系关闭文案；键盘态输入与主动作都在键盘之上；系统减少动态下 2、3、6、7 四条流程终态完整。

> **一个已知的环境限制**：撕开后的自动完成与坠落在无 GPU 的无头 Chromium 里约 2 s（原件约 0.35 s + 1.08 s）。用同一驱动、同一手势测 C00 参考实现也是约 2 s（`cal-C00/sheet-cal-drag-long.png` 对 `cal-C07/sheet-cal-drag-long.png`），所以不算 C07 的问题，但节奏需要真机验收。

**q5 补录说明**（返回滚动恢复、历史二次进入不重放、未出席待核实、管理页收拢、局主侧候补补位）：见文末「补录」。

---

## §3 覆盖表（50 条索引 × 五栏；只勾亲自看过的）

TABLE_PLACEHOLDER

---

## §4 工具结果（原始数字）

TOOLS_PLACEHOLDER

# C09「地点」· 修复轮 1（对 `verify.md` §2）

- 源文件 `my-r2/concepts/src/C09.dc.html`：**199,962 B**（≤ 200 KB；构建报 195 KB）。最终构建 10-29 20:32（`JU_STANDALONE=.build/C09.html JU_ONLY=C09`，含共享层截至 20:13 的改动：燃烧句柄落定、出席更正焦点、中文截图浏览器、改时间日期上下限）。
- 证据目录 `fix-r1/`（新目录，`stage2/`、`verify/` 未动）。所有路径都是**真实操作**：真实点击（`L.clickSel` → `page.mouse.click`）、真实滚轮（`page.mouse.wheel`）、真实键盘（`keyboard.type`）；每条录制只从 `j-home` 起步（首屏），不走索引跳转进深层态。面板控件（暂停、关键帧、速度、减少动态、变体、「到最近到期」、「下一次写入失败」）照评审方式使用。
- 运动帧：CDP screencast 1×（每个实际绘制的帧），环境引擎暂停；录制时 1 分钟负载 1.4–4.1（< 8，见各 `frames.json` 的 `load_at_start` / `load_at_end`）。截图 PNG 已用 `shrink-verify.py` 转 JPG。
- 构建分布：四个工具、环境探针、`M7-scrub/` 是最终构建（20:32）跑的；`minor/m9-reschedule/` 是 20:13 构建（共享层日期上下限 + C09 `min/max` 之后）；其余录制 / 截图是 18:26 构建——之后两次构建只改了改时间日期框（20:13）和评审面板「返回重放」时带回原来的分开路线（20:32），这些证据走的路径不经过这两处。

## 四个自动工具 + 环境（最终构建）

| 工具 | 结果 | 证据 |
|---|---|---|
| coverage | 50 / 50 态，errors 0，mismatches 0 | `fix-r1/checks/coverage/` |
| widths | 48 张，overflow 0，findings 0，最小字号 12，zoom / safe API ok | `fix-r1/checks/widths/` |
| kb-check | findings 0，errors 0 | `fix-r1/checks/kb/` |
| rm-check | rmSys true，流程 11 / 11，findings 0 | `fix-r1/checks/rm/` |
| env-probe + env-count | 16 页环境露出 **54.7–91.9 %**（透出 3.7–11.8 %）：j-home 57.8、h-home 61.5、j-d-tear 54.7（最低）、h-m-cancelled 91.9（最高） | `fix-r1/checks/env/counts.json` |

## Major

**M1 吸顶区头推出时无底色、压字** — 改：`_stick` 改用版面坐标（offsetTop 链：含 sticky 偏移、不含分开动画的 transform）判定 `y − scrollTop − 吸顶线 < 1.5`，吸住与被推出都给 `.97` 实底 + 磨砂；`componentDidUpdate` 每次都重算（返回恢复滚动、减少动态也一样）。
- 滚轮到底（12 × 120px）：`fix-r1/M1-sticky/m1-a-wheel-bottom.jpg`；`log-wheel-index.json`：scrollTop 658 / 658，「曼哈顿 3 场」被推到 56（吸顶线 70）仍 `is-stuck`，底色 `rgba(250,249,251,.97)`，压在它下面的末行被实底盖住。
- 点页头区索引「皇后区 2」：`m1-b-index-queens.jpg`（同一读数）。
- 减少动态 + 恢复滚动：滚轮到 550 → 点「周末速写」→ 返回：`m1-c-rm-return.jpg`，`log-returns.json`（返回前后都是曼哈顿吸住 70、底色 .97）。1× 同一路径 +200ms 与落定：`m1-d-1x-return-200ms.jpg`、`m1-e-1x-return-settled.jpg`，逐帧 `M1-sticky/return-1x/sheet.jpg`。
- 复核原路径③（先做块 → 阅读 → 确认 → 票根 → 返回）现在回到首页顶部（共享 m1 修正后栈是 首页 › 阅读 › 票根，落点是先做块），不再停在 553，所以 ③ 用上面的「滚到 550 → 进出」覆盖同一机制。

**M2 详情 / 阅读层不排局名** — 改：详情页题 = 局名，副行 = 状态 · 还差什么（去掉与页题、状态重复的段）；阅读层 `c09-rtitle` = 局名、`c09-rstate` = 状态；候补页、历史页同样。证据（首页真实点击进入）：`fix-r1/M2-titles/m2-a-detail-gathering.jpg`（法拉盛早茶 · 周一十点 / 等待全员确认 · 包括局主全员确认后才出票）、`m2-b-detail-waitlist.jpg`（古着淘货 · 下东区三家店 / 已加入候补 · 3/4 已确认 · 1 已预留 · 候补 2）、`m2-c-read-title.jpg`（先做块「阅读并确认」：周六早午餐 · 只聊不卷 / 已预留 · 等你确认）。

**M3 确认成功的回执不在视口** — 改：回执（`v.rd.slip`：结果或到期）放在阅读层页脚、按钮正上方（`.c09-fslip` role=status，340ms 升起），按钮随之变「查看票根」。证据：`fix-r1/M3-receipt/m3-read-result-by-button.jpg`；`log-slip.json`：回执 673–760（手机高 844），紧贴按钮上沿；逐帧 `M3-receipt/confirm/sheet.jpg`（真实滚轮读到末尾 → 确认入局 → 处理中 → 回执升起）。减少动态同位置：`fix-r1/swap/read-to-ticket-rm/sheet.jpg` 前段。

**M4 取消后没有抽色 + 余烬** — 改：`onEffect('cancelled')` → 1.9s：区带墨线转余烬色并升起 14 粒 6px 余烬，标题 / 区名退成 meta 灰，墨线终态灰色虚线；名单同帧「取消前已确认 / 票根作废」。证据：`fix-r1/M4-cancel/sheet.jpg`（局主 → 德州扑克新手桌 → 取消这局 → 面板「下一次写入失败」→ 确认 → 层内「本机保存失败，请重试」→ 重试 → 抽色 + 余烬 → 虚线终态，帧 f05–f31）。

**M5 先做块被换成另一局时没有回执** — 改：`_leadHold`：首页停稳时先做块的 id 变了（放弃 / 到期）→ 原块原位显示结果 1.7s（高度按实测锁定，墨色上沿 900ms 退到 0，CTA 收起）：「已放弃预留 / 位置已释放 · 不记主动失约」、「预留已到期 / 没有确认 · 位置已补给他人」；然后下一件从 .18、下方 10px 升入（700ms）。换数据（变体 / 重置 / 跳转）不算处理。证据：`fix-r1/M5-lead/release/sheet.jpg`（去不了了 → 确认放弃）、`fix-r1/M5-lead/expiry/sheet.jpg`（面板「到最近到期」第 6 次：结果 + toast「「周六早午餐」预留已到期 · 位置已补给他人」→ 周五 Livehouse 升入）。

**M6 「同区还有」进另一张票根：空白帧 + 沿用旧滚动** — 改：票根 → 票根是同一页面内的滑换：进入时销毁旧票根、重置出票，记住旧滚动、新页滚到 0（`data-restore=manual`），内容从 40px / .4 滑入 300ms，区带不动；返回恢复旧滚动并从 −40px / .4 滑回。证据：`fix-r1/M6-near/sheet.jpg`（剧场票根 → 滚到「同区还有」→ 点「公园慢跑 3K」→ 返回）；`log-scroll.json`：剧场 374 → 新票 +250ms scrollTop 0、票位 198–536 在视口 → 出票后 198–658 → 返回剧场 370；`m6x-a/b/c-*.jpg`。进出最淡的一帧也有标题、区带、同行可读，没有只剩环境的帧。

**M7 暂停 / 关键帧对签名路径无效** — 改：`_syncFreeze`：暂停或拖关键帧时，把根节点下正在跑的有限动画（CSS 过渡经 WAAPI）原位 `pause()`；之后才开始的（原件自己的定时器触发的联系层等）在 `transitionrun` / `animationstart` 时补冻；关键帧 v = 主体位移走到 v%（按缓动反求时间），100 = 各段自己的终点；释放时继续播放。停稳后再拖：重放最后一段（进入 `_replayEnter`；返回 `_replayBack`：票根瞬时放回再返回，带上原来的分开 / 区带路线）并冻在 v。燃烧：暂停停在当前火线（`_burnHeld`），拖到终点的落定交给共享句柄。证据 `fix-r1/M7-scrub/`（0.5×，`log.json` 读数）：
- 进入：暂停 +0 与 +700ms 同为位移 15.3 / 86.5px、透明度 .56（冻住）；关键帧 0 = 48 / 271px、0；**50 = 24.0 / 135.6px（正好一半）、.37**；100 = 终点；释放后 idle；停稳后拖 30 → 重放并冻在 33.6 / 189.9px（走了 30 %），拖 80 → 9.6 / 54.3px。
- 返回：暂停冻在起点；关键帧 50 = 深层内容 25.4 / 143.3px、.73，首页页头 .37；100 = 终点；停稳后拖 40 → 重放返回（带原来的分开与区带路线）并冻在 40 %：深层 20.4 / 115.3px、.82，首页页头 .29（`m7-back-replay40.jpg`）。返回测试用的是普通票根（燃烧测试排在最后，退出后的结果页不能重放成同一页）。
- 燃烧：`burn-pause/sheet.jpg`（暂停 8 帧火线不动，继续后从同一火线烧完）；烧完后拖 50 → 重放并冻在一半（`m7-burn-replay-k50.jpg`），拖到 100 先不落定（舞台仍 338px，`m7-burn-k100-held.jpg`），释放后落定（舞台收起，`m7-burn-released.jpg`）。
- 逐帧：`M7-scrub/entry-back/sheet.jpg`。

## Minor

| # | 改了什么 | 证据（`fix-r1/`） |
|---|---|---|
| m1 先做块直达阅读（共享） | 重建即得：栈 首页 › 阅读 › 票根，返回一次回首页 | `swap/read-to-ticket/`、`M1-sticky/log-*.json` |
| m2 副券坠落穿过占位文字 | 撕开那一刻（拖过半 / Enter / 按钮）联系占位立即让位 | `minor/m2-tear/sheet.jpg` |
| m3 阅读层页脚透字 | 页脚底 26px 内升到 .97 | `minor/m3a-read-foot-disabled.jpg` |
| m4 返回交叉淡化一帧整页约 30 % | 到达层不再错开：离开 ease-in 100–110ms，到达同时从 0 线性 120ms；六条路径逐帧：最强一层最低 .56，两层合计最低 .72（先做块进入时白块 85ms 先退） | `minor/m4-xfade/log.json`、`minor/m4-return-row/`、`minor/m4-return-lead-ticket/` |
| m5 「去不了了」出现两次 | 改期答复页只在页脚 | `minor/m5-reply-decline-once.jpg` |
| m6 撤销倒计时不走 | 每 0.5s 刷新：0.6s「撤销 9s」、4.6s「撤销 5s」 | `minor/m6-a-undo-0s.jpg`、`m6-b-undo-4s.jpg`、`log-undo.json` |
| m7 剩余时长两种写法（共享） | 重建即得：名单「剩 2 小时多」 | `minor/m7s-roster-remaining.jpg` |
| m8 时钟结算只换字 | 被改动的行 / 局主名单行 / 候补行 1.6s 白底 + 按优先级合并的一句话 toast | `minor/m8-clock/sheet.jpg` |
| m9 改时间直接换字 | 成功后管理页滚回顶部，页头时间与「改为 …」逐字重印；日期框绑 `dMin/dMax`，键盘逐段输入不被改写，过去 / 一年外的日期写原因并禁用确认 | `minor/m9-reschedule/`（`log-date-input.json`：键入 2026/12/01、2028/01/01 原样保留 + 「只能改到今天起一年内的日期。」） |
| m10 暂停时燃烧直接到终点 | 见 M7 燃烧 | `M7-scrub/burn-pause/` |
| m11 取消后返回一帧行与区头叠字 | 首页面板 `overflow-y:clip`（分开中的行不再撑大滚动范围、不再钳住滚动），区带跟随节头实测位置 | `minor/m11-cancel-return/sheet.jpg` |
| m12 手机内的评审说明 | 三处全删（不可点的「继续编辑」只留 `aria-disabled`） | `minor/m12-a-detail-bottom.jpg`、`m12-b-draft-row.jpg` |
| m13 「信用」文案（共享） | 重建即得：「不计为未出席，也不算主动退出。」 | `minor/m16-a-history-cancelled.jpg` |
| m14 只有一场时双线 | 区头墨线让给先做块的墨色上沿 | `minor/m14-single-one-line.jpg` |
| m15 长地点省略后空隙 | 点号改成单独的 `·` 字形；被省略的地点名按整字宽收（`_syncClip`），省略号后紧接「·」 | `minor/m15-long-place.jpg` |
| m16 未成行历史 / 草稿空态半屏空 | 历史：落定条 + 记录 + 「这一局」（时间 / 集合 / 地点 / 局主）+ 同区还有；草稿空态：四区「暂无」+「草稿发布之后，会落进它所在的区」 | `minor/m16-a/b/c/d-*.jpg` |

## 本轮自查多修的一处
**阅读层「查看票根」→ 票根（替换）**：原来替换时下层首页在 enter 一步闪出、和阅读层叠印约 180ms，减少动态下还有一帧只剩区带的空白。改：替换时下层页保持 `visibility:hidden`；离开页在 enter 一步保持不透明、之后 140ms ease-in 退出；票根区带从离开页区带的位置起步落到槽位、离开页区带当帧隐藏；减少动态下过渡一律 `none`（1ms 过渡开始那一帧仍是旧值）。证据：`fix-r1/swap/read-to-ticket/sheet.jpg`、`swap/read-to-ticket-rm/sheet.jpg`、`swap/probe-normal.json`（首页全程 0；阅读 / 票根交叉点约 .63）、`swap/probe-rm.json`（同一帧完成交换）。

## 观察（不算缺陷 / 共享层）
- 出纸口 24px 保留（主负责人决定，列为用户验收项）。
- 共享：面板「减少动态」不会让 `JuPrint` 出纸立即落定（原件只看 `matchMedia`），减少动态录制里出纸仍有约 1s 的推出（`swap/read-to-ticket-rm/`）。
- 关键帧在落点白条还在走（1.1s，0.5× 时 2.2s）时拖动，冻住的是落点而不是重放（共享 `_movingAnims` 把它算作「正在动」）；停稳后再拖才重放。
- 页头收拢后区索引随页头退场（`pointer-events:none`），只在页头展开时可点。
- 被推出的区头上半截会滑进收拢页头的磨砂下（与系统列表一致），底色始终在。
- 根目录有一个空的 `/out`（阶段 2 一次 `$S` 未设时的误写，已把内容移走；删除被安全检查拦下，未绕过）。

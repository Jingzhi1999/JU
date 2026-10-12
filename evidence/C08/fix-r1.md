# C08 时间尺 · 主负责人修复轮 第 1 轮（fix-r1）变更记录

构建：`JU_STANDALONE=/home/user/JU/.build/C08.html node src/build.js`。覆盖：`evidence/C08/fix-r1/coverage/`，50/50 个状态，0 错误。下面每个流程目录都有 `f*.png`、`sheet.png`、`log.json`，所有 `log.json` 的 errors 都为空。带 probe 的流程用的是 capture 工具的临时副本（只多了 `probe` / `pshots` 两个动作，返回值记在 `log.json → probes`），其余流程用共享的 `tools/capture.cjs` 跑。五张静帧已从修复后的构建重新生成：`joined-home.png`、`hosted-home.png`、`detail.png`、`manage.png`、`result.png`。

## 本轮改动

| 问题 | 改动 | 证据 |
|---|---|---|
| 主负责人「全部 · 管理页结构雷同（申请审核）」 | 申请区改成**申请尺**。<br>· 每张申请签挂在它的「申请于」时刻。<br>· 签与签之间的尺段按真实间隔取长（0.24px/分钟，限制在 8–44px）。超过 1 小时画成点线空档，跨日画成首页尺那样的双斜线断口，并标注「隔 2时20分」。<br>· 尺一直走到红色的 **NOW** 刻度，那里标注「现在 · 还有 N 个空位 · 待审 N」。<br>· NOW 下方是同一比例的 **6 小时预留窗**（86px，止于 21:00）。<br>两个动作也改成尺上的两种手势：<br>· **谢绝** = 剪断吊线：线中间裂开，签往下坠，尺上的刻度变成断开的刻度。这和参加者在历史里看到的「未通过」是同一个形态。<br>· **发出邀请** = 挂到现在：按钮上带着「▮ 至 21:00」。通过后，吊线和刻度都变成琥珀色。一枚带同一头像的预留签从申请签沿尺飞进预留窗，窗随即涂满琥珀。如果窗在屏幕外，面板只滚到窗露出为止。<br>语义全部保留：称呼、认证章、留言、申请时间、原位结果行、待审 / 预留 / 空位计数、席位格、组头「通过即发出 6 小时预留 / 已处理 N」、6 小时帮助文。 | `fix-r1/review-ruler/`（0.5×：f03–f14 是发出邀请与预留签入窗，f15–f24 是谢绝剪线）<br>`fix-r1/review-many/`（8 份申请、跨日断口、满员时报「名额已满」）<br>`fix-r1/review-fail-rm/`（写入失败出现在签内，动作行收起，重试后成功；减少动态下直接落定）<br>`fix-r1/review-return/`（返回后该行落到「招募中」，再打开时 已处理 2）<br>`manage.png` |
| 自查发现：参加者成员行写「剩 6h」，倒计时却是 05:40:00 | 成员副文改成「剩 5时40分」，和倒计时用同一种取整 | `fix-r1/waitlist-receipt/f02.png` |

## 主负责人 C08 行：「首屏尺上日期随分组跳跃（12.19 → 12.18 → 12.20）」

- **已修复（第 2 轮）**：「要你回应 / 待你处理」两组现在是折尺。每块单独一段尺，各自有日期牌，段与段之间是铆钉关节和「另一段」，组头写「按截止先后 · 一块一段」。同一把尺上不会再出现时间倒退。主负责人建议里「在尺上用断点 / 分组标记标出分段」这一半已经做到。证据：`fix-r1/coverage/j-home.png`、`h-home.png`、`joined-home.png`。
- **未采纳**：「组内按时间排序」。`spec/state-inventory.md` 的排序规则写明 `act` 组按截止时间升序，然后按 invited / reschedule / tear / contact 的权重，最后才按活动时间。改成按活动时间排序会改变十套共用的语义。

## review-2（最新一轮评审）列出的未关项：在当前构建上重新核验

这些问题第 3 轮已经修过，本轮在当前构建上逐项重新核验，都没有复现，所以没有重做。

| review-2 | 本轮核验 | 证据 |
|---|---|---|
| M1 快速「返回 → 打开另一块」，新面板会自己关掉 | 打开早午餐，400ms 后点返回，90ms 后点 Livehouse。之后 1.35s 内按 150ms 采样 9 次，`view` 都是 `detail:livehouse:in` | `fix-r1/stress-reopen/log.json` |
| M2 改时间提交后，关闭中的抽屉闪出错误 | 抽屉关闭全程显示「原定 周三 12.23 · 19:30 / 改为 纽约时间 周四 12.24 · 20:30」，`warn=false` | `fix-r1/resched-sheet/log.json`、f06–f08 |
| M3 散场历史详情没有票件 | 有归档尺、已撕留存联、出席章（出席 / 未出席·待核实）。翻面后背面是 `JU.` 和「有 JU，就开局」 | `fix-r1/history-ended/` |
| M4 分区切换时新内容先闪出 | 旧内容先淡出（1 → 0.02，130ms），新内容再从 0 淡入。新内容在任何时刻都没有以满不透明度先出现 | `fix-r1/switch-probe/log.json`（section） |
| m1 身份切换中间有空白、胶囊切得晚 | 点击当帧胶囊就切换；两把尺交叉推动，t=46ms 时旧尺 opacity 1、新尺 0，没有空帧 | `fix-r1/switch-probe/log.json`（role）、`fix-r1/home/` |
| m2 返回时背景块先变空白纸 | 背景块 `clip-path` 从左往右展开，`textO=1`，宽 306px | `fix-r1/return-wipe/log.json`、`fix-r1/card-detail-back/` |
| m3 退出 / 拒绝改期的结果硬切 | 存根、联系层、成员先原位收起，结果再淡入 | `fix-r1/exit-settle/f27–f30`、`fix-r1/decline-settle/f26–f30` |
| m4 释放滑杆后燃烧倒回起点 | 滑杆到 70% 后释放，`--c08-bp` 依次为 0.867 → 0.964 → 1.000 → burnt，没有倒回 | `fix-r1/scrub-release/log.json` |
| m5 取消后进度行留到燃烧结束 | 写入当帧 hero 变虚线、进度行收起，燃烧只作用在局卡条上 | `fix-r1/cancel-progress/f06–f29` |
| m6 深色块上的状态点看不见 | 墨底上改用浅墨点或亮红点 | `fix-r1/coverage/h-home.png`、`j-history.png` |
| m7 散场后管理 hero 仍是白纸 | 记为散场时墨色从左往右刷过 hero | `fix-r1/end-ink/f06–f10` |
| m8 同一 tick 连点「发出邀请」叠出错误 | 同一 tick 点三次，`_busy=true`，最后 ierr=0、待审 2 → 1 | `fix-r1/approve-tick/log.json` |
| m9 举报受理文字溢出 | 表单换成受理回执纸签，文字全部换行 | `fix-r1/report-receipt/` |
| m10 候补缺回执 | 候补回执签和「候补轮到」实线版都在 | `fix-r1/waitlist-receipt/` |
| m11 连删草稿时撤销被静默丢弃 | 撤销条写「连删 3 份 · 撤销只恢复这一份，其余 2 份已删除」，撤销后 toast 也如实说明 | `fix-r1/drafts-rapid/` |
| m12 字体与 C02 重叠 | 数字体用 Bricolage Grotesque 窄体，所有帧都是 | 任意帧 |

## 三个核心动作与首屏：回归检查（未改，确认没有退化）

- 打印（三段走纸）：`fix-r1/print/`
- 撕票（未过阈值回弹 → 撕开 → 落进存根槽）：`fix-r1/tear/`
- 燃烧 / 作废：`fix-r1/exit-settle/`、`decline-settle/`、`cancel-progress/`
- 首屏 / 长标题 / 空态：`fix-r1/home/`
- 卡 → 详情 → 返回：`fix-r1/card-detail-back/`

已认可的部分都保留未动：日期牌、铆钉、刻度压印、折尺、出票 / 撕票 / 焦线、成员轨上的 6 小时区间。

## 未采纳

- 组内按活动时间排序：理由见上，会改变共用的排序语义。
- 成员 / 出席分区不重做：两者已经在轨上（6 小时预留区间、章点），新的预留窗与成员轨上的 6 小时区间是同一种语言。再改只会重复，不增加信息。

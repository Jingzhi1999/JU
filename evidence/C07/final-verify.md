# C07 格盘 · 最终复核（final pass）

- 复核人：独立复核，没有参与构建，也没有参与之前各轮评审。
- 对象：`concepts/src/C07.dc.html`。本轮唯一的源码改动（`git diff`：5 增 5 删）是删除本地 `afterReal(ms, fn)`，把 `say()`、`copy()`、`deleteDraft()` 的三个实时窗口改为核心 `this.hold()`（`src/core/ju-review.js`）。
- 私有构建：`JU_STANDALONE=/home/user/JU/.build/final-C07.html node src/build.js` → `built 10 concepts; 3.58 MB`。构建产物里 `afterReal` 出现 0 次。
- 对照构建：用 `git archive HEAD`（ca0ccdd，C07 仍是 `afterReal`）在 scratchpad 另建 `.build/final-C07-HEAD.html`，只用来判断问题是不是本轮引入的。
- 证据：全部在 `evidence/C07/final-verify/`。
  - 操作流脚本：`flows.sh`，共 11 组 capture。
  - 计时探针：`rm-probe.cjs` → `rm-probe.json`（14 个场景）、`recopy-probe.json`、`redelete-probe-HEAD.json`。探针在页面内每 50 ms 采样 DOM，每个场景开一个新页面。
  - coverage 1 组。
- 12 张 `sheet.png` 我都读过：coverage、rm-undo、rm-redelete、rm-toasts、rm-print-tear、rm-tear-btn、rm-cancel、card-detail-back、print、tear、cancel-half、draft-undo。回执条、作废和返回的关键帧另外放大看过。
- 日志：12 组 capture / coverage 的 `log.json` 都是 `errors: []`。探针各场景也没有 pageerror 或 console error。

## 结论：**不通过**

blocker 0 · **major 1（F1）** · minor 8（F2，加上 verify-r1 遗留的 7 条）。

这一轮要求复核的项目，在首次操作时都成立：
- 减少动态下，撤销窗口和回执停留真实时长；
- 出票、撕票、取消作废直接给出正确结果；
- 动效开启时，几条主流程和 verify-r1 逐帧一致。

但复核撤销窗口时发现一个计时缺陷：同一份草稿「删除 → 撤销 → 再删除」，第二次的撤销条会被第一次删除留下的计时器提前关闭，草稿被直接提交删除（F1）。
- 这不是本轮引入的：HEAD 构建结果完全一样。
- 但它属于 contract §11 的实时窗口（「草稿撤销 10 秒」），也正是本轮 hold() 审计的范围。
- 它让「10 秒内可以撤销」的承诺落空，并且造成不可恢复的删除，所以按 major 计。
- C01 的 final-verify 对同一缺陷也判了 major，两边口径一致。

## 1. 检查项

| 检查 | 结论 | 证据 |
|---|---|---|
| Coverage 50/50，0 错误 | **成立** | `coverage/log.json`：`states: 50`，`errors: []`。<br>`coverage/sheet.png` 和 builder 的 `final/coverage` 逐状态做了像素比较：42 张完全相同；另外 8 张只在很小的区域内有色差（最大是顶部 390×29 px 的一条），其中 7 张没有一个像素色差超过 40，`h-history-many` 有 48 px（放大看，文字字形相同）。<br>没有空白、遮挡或错位的状态。 |
| 减少动态 ON：删除草稿后撤销控件可见 ≥ 8 s，撤销能恢复该行 | **首次删除成立**（再删除见 F1） | `rm-probe.json`：<br>· `undoNoTap`：删除后 50 ms 出现撤销条，持续 **9933 ms**，之后 `commitUndo`，草稿列表为空。<br>· `undoTap`：8600 ms 时撤销条仍在，写「已删除「雨天读书局」」；点撤销后 0 ms 内原行回来；等到 11.6 s 草稿仍在，没有被延迟提交。<br>帧：`rm-undo` f02 删除后立刻是空态加撤销条（减少动态下没有倒计时线），f03–f10 撤销条一直在（约 1–8.5 s），f11 撤销后「雨天读书局」回到原位，「草稿 1」，f12–f14 稳定。 |
| 减少动态 ON：至少两条回执 / 反馈在停留期间可读 | **成立**（3 条回执，外加「已复制」） | `rm-probe.json`，从 DOM 量 `.c07-toast.on` 且不透明度 > 0.9 的时长：<br>· 微信号已复制：**2517 ms**<br>· 已接受改期 · 按新票根的时间见：**2469 ms**<br>· 已改时间 · 等 4 位成员答复：**2520 ms**<br>· 按钮上的「已复制」：**2518 ms**<br>帧：`rm-toasts` f02–f07、f10–f15、f18–f24。放大看，三条深底白字回执都完整可读，没有被底栏或面板截断。 |
| 减少动态 ON：出票的结果直接、正确 | **成立** | 探针 `print`：从首页点开 run3k 后 **80 ms** 票面 `phase: ready`，「刮下副券」键已就位，扫描线 `display: none`。<br>帧 `rm-print-tear` f02：点开后第一帧就是完整通行证、「按住右侧副券向下刮」提示和同局名单，没有走纸过程。 |
| 减少动态 ON：撕票的结果直接、正确 | **成立** | 探针 `tear`：点「刮下副券」后 **58 ms**，`torn` 为真，联系层已出现，引擎里 `stage: contact`，复制键已就位。<br>帧：`rm-tear-btn` f02 已是「待联系」、存根格、「副券已刮下 · 可以联系局主了」、联系局主 nina.runs。`rm-print-tear` f04–f10 是手动拖刮：像素跟手，这是用户的直接操作，不算自动动效，提示「再刮一点 → 松手就撕下」；f11 松手后直接是同样的结果。<br>改期接受：`toastAccept` 中新票已撕、旧票已移除；`rm-toasts` f10 直接是青绿「待赴约 21:30」。 |
| 减少动态 ON：取消作废的结果直接、正确 | **成立** | 探针 `cancel`：点「确认取消」后 **102 ms** 进入 `voidPhase: dropped`，操作盘已关，引擎里 `status: cancelled`。局卡文字是「已作废 · 局主取消 / 联系入口关闭 · 成员不计主动退出 · 不能撤销」。<br>帧：`rm-cancel` f02 是灰格残骸，hero 写「已取消」，成员格写「取消前已确认 · 票根作废」「取消前已预留 · 预留已结束」。返回后（f06–f09）落在「历史 · 已取消」组里。 |
| 减少动态 OFF：局卡 → 详情 → 返回（0.5×） | **无回退** | `card-detail-back` 和 verify-r1 `detail-back` 的 sketch 段逐帧一致：淡色格先原样展开（f03–f04），再过渡到整面石板蓝，子格逐个出现（f05–f15）；返回时格子收进原格，落点描边（f19–f27）。verify-r1 遗留的 N1（返回后半段是只剩芯片的空面板，f17–f18）仍在，没有变化。 |
| 减少动态 OFF：出票 | **无回退** | `print`（1×）：展开 → 深色出票口槽加扫描线（f03–f04）→ 逐行点亮（f05–f13），期间写「出票中…」→ 出现「刮下副券」（f14 起）。打印中没有刮券键，和 verify-r1 `print` 一致。 |
| 减少动态 OFF：撕票 | **无回退** | `tear`（1×）：拖动时像素逐行脱离，提示「再刮一点 → 松手就撕下」（f01–f08）→ 写入时键内出现 loader（f10–f11）→ 抬头变「待联系」，像素落进存根槽堆积（f12–f17）→ 联系层（f19 起）。和 verify-r1 `tear` 一致。 |
| 减少动态 OFF：0.5× 取消作废 | **无回退** | `cancel-half`：<br>· 确认键 loader（f02–f05）→ 操作盘滑走 → 票面从右侧逐格脱落（f08–f20）→ 碎片在框底堆成瓦砾。<br>· 灰格淡入时瓦砾还在（f22–f25），没有空框阶段 → 落定成 10×10 残骸灰格，缺块留描边。<br>· hero 芯片保持「1 人已预留 · 等确认」，到落定才翻成「已取消」。<br>· 返回后落到「历史 · 已取消」，有落点描边（f35–f36）。<br>和 verify-r1 `cancel-half` 一致。 |
| 减少动态 OFF：草稿删除 / 撤销 | **无回退**（同样受 F1 影响） | `draft-undo`（0.5×）：冬至火锅原位收起，雨天读书局补位（f05–f06）→ 撤销条升起，橙色倒计时线逐帧缩短（f07–f13）→ 撤销后同一格原位展开，邻格让位，有落点描边（f14–f23）→ f24 落定。和 verify-r1 `draft-undo` 一致。<br>探针 `undoNoTapOff`：撤销条持续 9956 ms（加上 260 ms 写入等待）。<br>verify-r1 遗留的 N5（点删除后约 240 ms 没有反馈；0.5× 下是 f02–f04）仍在。 |

## 2. 新发现

### F1 · major · 再次删除同一份草稿时，撤销窗口被上一次的计时器提前关闭

- **复现**：局主「草稿」→ 删除「雨天读书局」→ 撤销 → 再删除同一份。
  - 第二条撤销条只显示到第一次删除后满 10 秒，然后消失，草稿被提交删除，列表进入「没有草稿」空态。
  - 规格（`spec/ju-data.spec.md` 第 150 行）是「撤销条 … + 撤销（10 s）」，草稿详情页也写着「删除后 10 秒内可以撤销」。
- **实测**（`rm-probe.json`）：

  | 减少动态 | 第一次撤销 | 第二次删除 | 第二条撤销条持续 | 结果 |
  |---|---|---|---|---|
  | ON | 3.0 s | 3.2 s | 6.70 s | 草稿被删 |
  | ON | 8.6 s | 8.8 s | **1.11 s** | 草稿被删 |
  | OFF | 3.0 s | 3.2 s | 6.74 s | 草稿被删 |
  | OFF | 8.6 s | 8.8 s | **1.11 s** | 草稿被删 |

  四种情况下，撤销条都在第一次删除后 9.96–10.25 s 消失，`data.drafts` 变成 `[]`。
- **帧**：`rm-redelete`。f02–f04 是第一条撤销条；f05 撤销后「雨天读书局」回来；f06 再删除，出现第二条撤销条；f06–f14 撤销条还在；f15 起撤销条消失，草稿没了，「没有草稿」。
- **不是本轮引入的**：HEAD 构建（仍是 `afterReal`）跑同一探针，结果一样，减少动态 ON / OFF 都是 1107 ms（`redelete-probe-HEAD.json`）。本轮把 `afterReal` 换成 `hold()`，没有改判断条件。
- **原因**：`concepts/src/C07.dc.html` 第 1518 行，`deleteDraft` 的计时器回调只判断 `self.state.undo && self.state.undo.id === id`。`undoDelete`（第 1521 行）不会取消这个计时器；再删同一份时 `undo.id` 相同，第一次删除留下的计时器到点后，就把第二次删除提前提交了。`undo` 里虽然存了 `at: Date.now()`，但回调没有用它。
- **修法**（一行级，任选其一）：
  - 回调里比对删除时刻：`var at = Date.now(); self.setState({ undo: { id: id, title: eff.title, at: at }, … }); self.hold(10000, function () { if (self.state.undo && self.state.undo.at === at) { … } });`。
  - 或者保留 `hold()` 返回的句柄，在 `undoDelete` 和下一次删除时用已有的 `this.cancelTimer(e)`（第 1436 行）取消它。

### F2 · minor · 连续两次「复制」，第二次的回执和「已复制」很快消失

- **原因**：同一类计时器问题。`say(text)` 的 hold 按文字判断，`copy()` 的 hold 按 `copied === key` 判断，都不区分是第几次触发。
- **实测**（`recopy-probe.json`，减少动态 ON）：第一次复制 2.0 s 后再复制，第二条「微信号已复制」只停 **580 ms**，按钮上的「已复制」只停 **579 ms**。
- **为什么是 minor**：用户 2 秒前已经读过同一句反馈，影响小。
- **修法**：和 F1 相同，用 token 或时刻判断，或者取消前一个 hold。

## 3. verify-r1 遗留的 minor（这一轮没有改，仍然存在）

- N1：返回飞行的后半段是只剩芯片的空面板。`card-detail-back` f17–f18、`cancel-half` f34 可见。
- N2：落进冻结 lead 格的 70 ms 交叉淡化有错位双影。
- N3：长标题变体里，通行证 meta 的地点被硬裁成半个字。
- N4：出席分区头的「出席 n/N」数的是已记录人数。
- N5：点「删除」后约 240 ms（1×）没有反馈。`draft-undo` f02–f04 可见。
- N6：正文里还有词内断行。
- R1 m8（部分修复）：参加者详情内部仍是整宽子格竖着叠。

本轮源码只改了计时 helper，以上 7 项的成因没有变化。

## 4. 判定

- blocker 0、**major 1（F1）**、minor 8，所以 **pass = false**。
- 本轮目标本身已经达成：三个实时窗口都改用核心 `hold()`，减少动态下时长保留，出票、撕票、作废直接落定，动效开启时没有回退。
- 但 §11 实时窗口里的「草稿撤销 10 秒」在「撤销后再删除」时不成立，会造成不可恢复的删除。改成按删除时刻或 token 判断（F1 修法）后，重跑 `rm-probe.cjs` 里的 `redelete3`、`redelete86`、`redelete3Off`、`redelete86Off`，第二条撤销条应持续约 10 s，F1 即可关闭；F2 可以一并修掉。

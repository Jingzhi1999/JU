# C09 影印贴纸 · final 复核（final-verify，2026-10-12）

复核人：新的复核代理，没有参与构建。读过 `evidence/C09/final.md`（构建者改动记录）、`evidence/C09/verify-r1.md`（上一轮结论）、`spec/concept-contract.md` §9 / §11，以及 `src/core/ju-review.js` 里 `after()` / `hold()` 的实现。

构建：`JU_STANDALONE=/home/user/JU/.build/final-C09.html node src/build.js`，输出 `built 10 concepts; 3.58 MB standalone`。所有帧和探针都来自这份私有构建，存放在 `evidence/C09/final-verify/`。capture 的动作脚本在 `probe/actions/`，探针脚本在 `probe/*.cjs.txt`，原始结果在 `probe/*.json*`。所有 `log.json` 的 errors 都为空，探针运行时也没有页面错误。

本轮源码改动：相对 checkpoint `ca0ccdd`，`concepts/src/C09.dc.html` 只改了 3 行（`git diff --stat`：3 处增、3 处删）。`say()` 的 toast 2600ms、`copyWx()` 的「已复制」2200ms、草稿撤销窗口 10000ms，都从 `after()` 改成了 `hold()`。

**结论：通过。** 0 个 blocker，0 个 major。指定的遗留项已关闭，减少动态关闭时的行为没有回归。新记一个 minor（以前就有，不是本轮引入），另外 verify-r1 的 4 个 minor 照旧带过来。

---

## 一、逐项检查

| 检查项 | 结论 | 证据 |
|---|---|---|
| 覆盖 50/50，0 错误 | **通过** | `coverage/log.json`：`states: 50, errors: []`。`coverage/sheet.png` 已读：50 个状态都渲染完整，没有白块，没有半路卡住。 |
| **遗留项**（lead sweep）：减少动态开时删除草稿，800ms 后看不到撤销条 | **已关闭** | `probe/undo-toast-rm.json` run1 在 800ms 的采样：`.c09-undo` 在手机框内，opacity 1.00，撤销按钮的 hit-test 命中它自己（`in\|op1.00\|top\|y244`）。`rm-draft-undo/` 的 f04（约 0.9s）里撤销条和 toast 都在。 |
| 减少动态开：撤销控件可见 ≥ 8 s | **通过** | 探针 run2：删除后 52ms 撤销条出现，一直保持到约 10.05s（9800ms 还在，10300ms 已不在）。100 到 9800ms 之间的每个采样点都是 `in / op1.00 / top`。帧 `rm-draft-undo/` f03 到 f14（约 0.2s 到 9.9s）撤销条一直可见。 |
| 减少动态开：撤销恢复这一行 | **通过** | 8.5s 时用真实鼠标点「撤销」：50ms 后列表回到 `["雨天读书局"]`，撤销条收起，engine 的 drafts 也恢复了。11s 后仍在，旧的 commit 定时器没有误删。帧：`rm-draft-undo/` f15 到 f18，「草稿 1」回来了，没有落地动画（减少动态下本来就没有）。 |
| 减少动态开：至少两条 toast 在显示期间可读 | **通过（3 条）** | 「已删除「雨天读书局」」：52ms 到约 2.6s 都是 opacity 1。「微信号已复制」：100 到 2400ms 是 opacity 1，2700ms 收起，按钮上的「已复制」在 2.2s 变回「复制」。「已改时间 · 等 4 位成员答复」：`rm-toasts/` f12 到 f16 可见，f17 收起。放大裁切后三条字都清楚（白底黑字压在底栏上，和 verify-r1 记录的位置一样）。 |
| 减少动态开：打印、撕票、取消燃烧的结果立即且正确出现 | **通过** | `probe/rm-results.json`：**打印**：点 run3k 行后 139ms 打开详情，157ms 票已打印完，剪刀可以用，提示是「按住剪刀沿线往下剪」。**撕票**：68ms 后口袋显示「副券 × 1」，提示「已剪开 · 副券收在下面的口袋」。**取消**：86ms 后弹层关闭，页面显示「已取消」。帧：`rm-print/` f03，点击后约 60ms，票完整、右框在、剪刀出现。`rm-tear/` f03 是锯齿断口、「已剪 · 待联系」、口袋 × 1。`rm-cancel/` f03 是静态残片，原定时间划线，写着「已取消 · 不能撤销，票根作废、联系关闭」，和 `coverage/h-m-cancelled`、`verify-r1/rm` 的构图一致。f10 返回后在「历史 · 已取消」。 |
| 减少动态关：局卡 → 详情 → 返回（0.5×） | **无回归** | `motion-detail/`：f02 页面从下沿翻起、带透视，下层露出详情。f03 到 f13 详情落定。f14 到 f17 行形状的那一页贴回。f19 到 f23 粉色落地描边，之后消失。帧序和 `verify-r1/detail-half` 一致。 |
| 减少动态关：打印（0.5×） | **无回归** | `motion-print/`：扫描灯走过，纸先露出下沿（「待剪」「剪下，联系局主 →」），分段走出，最后落定，剪刀出现。和 `verify-r1/print` 一致。 |
| 减少动态关：撕票 | **无回归** | `motion-tear/`：剪刀走线，副券断开、落下、进口袋（f07「副券 × 1」高亮），「已剪 · 待联系」。点「已加微信」后变成「待赴约」，没有 toast，和 verify-r1 的 `tear/` f40 到 f46 一致。 |
| 减少动态关：取消燃烧（0.5×） | **无回归** | `motion-cancel/`：处理中，确认层收起，从右下角点火，焦边推进，碳粉片落下，留下焦边空白页。返回后落在「历史 · 已取消」，带落地描边。像素测量：落定那一帧的 12px 上移（印章 y 112 → 100）和 `verify-r1/cancel` f41 → f42 完全一样，属于已知的 minor 2，没有变大也没有新增。 |
| 减少动态关：草稿撤销 | **无回归** | `motion-draft-undo/`：撕下动画，撤销条和 toast 滑入（380ms），f04 到 f14 一直在。撤销后草稿带粉色落地框回来（f16、f17）。10.5s 后仍在（f22）。探针（`undo-toast-motion.json`）：撤销条从 359ms 到约 10.4s，800ms 时 opacity 0.99 并命中。 |

补充回归：
- **连点删除**（verify-r1 M7）：用真实鼠标在同一点连点三次，间隔 30、120、300ms，减少动态开和关都只删 1 份，没有粉色失败条（`probe/positional-taps.jsonl`）。下一行的删除按钮落在 y 560 或 574，原来的点是 y 532，不会误点到下一行。
- `rm-draft-stress/` 用的脚本每次都重新 `querySelector` 第一个删除按钮，所以是有意删了三份不同的草稿。撤销只回来最后一份，这是 engine 的单槽撤销，减少动态开和关结果相同（`probe5.cjs.txt`），不算问题。

---

## 二、未关闭的问题

### 新记录（minor，以前就有，不是回归）

**N1. 同一份草稿「删除 → 撤销 → 再删除」时，第二次的撤销窗口被第一次的定时器截短。**
`deleteDraft` 的 `hold(10000)` 回调只检查 `self.state.undo.draftId === id`。`undoDelete()` 不会清掉这个定时器。同一份草稿再删一次时，第一次删除留下的定时器会在「第一次删除 + 10s」时触发，把第二次删除提前 commit 掉。
实测（`probe/redelete.jsonl`）：0s 删除，1.5s 撤销，4.0s 再删除，第二次的撤销条只停了约 6.0s（减少动态开 5999ms，关 6378ms），草稿被永久删除，而不是给满 10s。最坏情况下，撤销后过 9.9s 再删除，撤销条大约 0.1s 就消失。
这个时序 C09 一开始就有，contract §9 的撤销示例写法也是这样，减少动态关时同样会出现。本轮把 `after` 改成 `hold` 并没有引入它，只是让减少动态开时也走到这条路径。只有这种三步连续操作才会触发，普通的单次删除给满 10s，所以记为 minor。
**修复**：每次删除生成一个 token，写进 `undo`，回调里比较 token。或者把 `hold()` 返回的句柄存起来，`undoDelete()` 和新的删除时用 `clearTimeout(e.id)` 并从 `_timers` 里移除。

### 沿用 verify-r1（都是 minor，本轮不在范围内，没有改动）
1. 退出或拒绝改期写入成功的那一帧，结果先于燃烧出现（联系便签收起，名单变成 3/4）。
2. 取消落定时残片页上移 12px，局卡说明这时才换成取消文案。本轮再次测到，数值和上一轮相同。
3. 打开详情的第一帧，裁切边切过下一行的文字，还有一条 1px 横线。
4. 申请条里的失败条在「请 / 重试」中间折行。

记录但不算问题：toast 落在底栏上，会盖住底栏标签 2.6s，verify-r1 已经记过。

---

## 三、证据清单（每张 sheet.png 都读过）

`evidence/C09/final-verify/`
- `coverage/`：50 个状态，以及 sheet.png 和 log.json
- 减少动态开：`rm-draft-undo/`、`rm-toasts/`（复制微信，再改时间 20:30）、`rm-print/`、`rm-tear/`、`rm-cancel/`、`rm-draft-stress/`
- 减少动态关：`motion-detail/`（0.5×）、`motion-print/`（0.5×）、`motion-tear/`、`motion-cancel/`（0.5×）、`motion-draft-undo/`
- `probe/`：`probe.cjs.txt`（撤销条和 toast 的几何、opacity、hit-test 采样）、`probe2`（再删除时序）、`probe3`（减少动态下结果出现的毫秒数）、`probe4`（定点连点）、`probe5`（单槽撤销）；结果是 `undo-toast-rm.json`、`undo-toast-motion.json`、`rm-results.json`、`redelete.jsonl`、`positional-taps.jsonl`；capture 动作在 `actions/*.json`。

辅助脚本都写在本会话 scratchpad 的 `c09fv/` 子目录里，用的是独立文件名，截图只写在 `evidence/C09/final-verify/` 下，没有碰其他 concept 的目录。

# C05 缝线 · final 定向修复（2026-10-12）

范围：只改了 `concepts/src/C05.dc.html` 里的计时器类型（3 处）和两行注释，另外在 `spec/motion/C05.md` 补了一行 〔final〕 说明。没有改设计，也没有动其他方案的文件。

## 1. 改了什么

契约 §11：真实时间窗口用 `this.hold(ms, fn)`。它和 `after()` 一样受暂停 / 重置 / 清除控制，0.5× 时拉长，但在减少动态下**不**归零。动画落定仍用 `after()`。

### after → hold（3 处）

| # | 位置（当前行号） | 改前 | 改后 | 这是什么窗口 |
|---|---|---|---|---|
| 1 | L1185 `say(text)` | `this.setState({ toast: { text: text, on: true } }); this.after(2600, function () { … toast on:false … })` | `… this.hold(2600, …)` | toast 的阅读窗口（复制 · 改期已发出 · 接受改期），顶栏右格 2.6s |
| 2 | L1350 `deleteDraft(id, h)` → `act('deleteDraft')` 成功回调 | `self.setState({ undo: { draftId: id, title: eff.title } }); self.after(10000, function () { … JU.engine.commitUndo … })` | `… self.hold(10000, …)` | 草稿撤销窗口 10s，到时提交删除 |
| 3 | L1466 `copyWx(wx)` | `this.patchView({ copied: wx }); this.say('微信号已复制'); this.after(2200, function () { self.patchView({ copied: false }); })` | `… this.hold(2200, …)` | 复制成功反馈：按钮上的「已复制」停留 2.2s |

注释：在 `say()` 上方（L1183–1184）和 `deleteDraft()` 上方（L1346）各加了一行，写明哪段是运动、哪段是真实时间。

### 保留 after() 的（36 处，全部是动画完成或运动编排）

- 写入处理时长 `act()` L1193（默认 460ms / 各调用自己的 `ms`）：这是模拟的处理中停留，不是阅读窗口。减少动态下结果立即出现，符合「运动的结果立即出现」。
- 列表：`reread` L1232，身份切换 L1240/1244/1245，分区切换 L1249。
- 覆盖层翻开 / 折回 / 卸载 / 去模糊 L1260–1262、L1269、L1279、L1281。落点色 `landed` 清除 L1282（1700ms，没有文字的材质高亮）。
- 草稿行收起 L1349/1350（30 / 360ms）。撤销后回槽 `entering` L1352（480ms）、`landed` L1352（1800ms）。
- 详情：首次挂牌 L1404、首次烧焦 L1405、弹层进出 L1409/1410、挂牌三段 L1413、断线落袋 L1429/1430（1020ms 那步里的 `say()` 本身走 hold）、烧焦完成 L1439、确认后出票 L1446、离开流程 L1461/1462。
- 管理页：审核「缝 / 剪」的 `fresh` 清除 L1609（2500ms）和出席章 `fresh` 清除 L1659（2500ms）。这两个只是动画触发 class，清除后终态（已发出邀请 / 已谢绝 / 出席章）不变，没有阅读窗口。改期后切到答复页 L1680、取消燃烧 L1685/1690、从草稿摘要删除前等折回 L1715。
- C05 没有逐秒倒计时 tick（倒计时按 `JU.NOW` 静态计算），也没有 `setTimeout` / `setInterval`。

## 2. Sweep finding（lead, 2026-10-12）已关闭

> 减少动态开启时，删除草稿 800ms 后没有撤销条（关闭减少动态时有）。

原因：撤销窗口原来用 `after(10000)`，减少动态下变成 0ms，`commitUndo` 在撤销条渲染出来的同一刻就执行了。改成 `hold(10000)` 后，减少动态只去掉行收起的运动，撤销条照常停 10s。

复现对照（同一个 build，在实例上把 `hold` 临时指回 `after` 来还原修复前的行为，减少动态开，删除后 800ms 读一次）：`evidence/C05/final/probe/sweep-repro.json`
- 修复前（after）：`undoBarAt800ms: false`，`undoState: null`（已被提交）
- 修复后（hold）：`undoBarAt800ms: true`，`undoState: { draftId: "draft-reading", title: "雨天读书局" }`

## 3. 验证

- 构建：`JU_STANDALONE=/home/user/JU/.build/C05.html node src/build.js` 输出 `built 10 concepts; 3.58 MB standalone`。
- Coverage：`JU_STANDALONE=/home/user/JU/.build/C05.html node tools/coverage.cjs C05 evidence/C05/final/coverage` 结果 **50/50，errors 0**（`evidence/C05/final/coverage/sheet.png`，已 Read）。
- 操作流（`tools/capture.cjs`，6 组，log.json 的 errors 全部为空，6 张 sheet.png 都已 Read）：

| 流程 | 目录 | 看到的 |
|---|---|---|
| 减少动态开 · 删除草稿 → 撤销 | `evidence/C05/final/rm-on-draft-undo/` | f02（删除后 0.8s）到 f06（约 8.4s）撤销条「已删除「雨天读书局」 撤销」一直都在；f07 点撤销后草稿回到原槽位；f08 静止终态 |
| 减少动态开 · 复制微信 | `evidence/C05/final/rm-on-copy-toast/` | 顶栏右格 toast「微信号已复制」+ 按钮「已复制」；约 2.2s 后按钮回到「复制」，toast 仍在；约 2.9s 后 toast 收起 |
| 减少动态开 · 改时间提交 | `evidence/C05/final/rm-on-reschedule-toast/` | 弹层立即收起，切到「改期答复」，toast「已改时间 · 等 4 位成员答复」显示约 1.9s 时仍在，约 2.9s 后收起 |
| 减少动态关 · 删除草稿 → 撤销 | `evidence/C05/final/rm-off-draft-undo/` | 和改前一样：行收起后撤销条一直停到约 8.4s，撤销后回槽 |
| 减少动态关 · 复制微信 | `evidence/C05/final/rm-off-copy-toast/` | 和改前一样 |
| 减少动态关 · 改时间提交 | `evidence/C05/final/rm-off-reschedule-toast/` | 和改前一样：处理中「----」→ 弹层收起 → 答复页 + toast |

- 时序探针（每 100ms 读一次 DOM）：`evidence/C05/final/probe/timing.json`（脚本 `probe/probe.cjs`），errors 为空。

| 窗口 | 减少动态开 | 减少动态关 |
|---|---|---|
| 撤销条（放着让它过期） | 110ms 出现 → 10044ms 消失，删除被提交 | 518ms 出现（含 360ms 行收起 + 60ms 写入）→ 10497ms 消失 |
| 撤销条 → 8.5s 时点撤销 | 撤销条持续到 8.5s；点下后 12ms 内草稿恢复 | 撤销条持续到 8.5s；点下后约 107ms 草稿恢复（80ms 写入） |
| 复制：toast / 「已复制」 | toast 到约 2.6s（2675ms 那次采样已没有）；「已复制」到约 2.2s（2265ms 那次采样已回到「复制」） | 同左 |
| 改时间 toast | 13ms 出现 → 约 2.68s 消失 | 517ms 出现（460ms 处理中之后）→ 约 3.1s 消失 |

结论：减少动态开启时，每个运动的端态都立即出现；toast、撤销条、「已复制」都按真实时长停留。减少动态关闭时的行为和改前一致。

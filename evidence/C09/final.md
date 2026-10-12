# C09 影印贴纸 · final（2026-10-12）

范围：只按 contract §11 审计 `this.after()` / `this.hold()`，并关闭 sweep 遗留项「减少动态下删除草稿 800ms 后看不到撤销条」。没有改设计，也没有碰其他 concept 的文件。

## 改了什么

`concepts/src/C09.dc.html` 共改 3 行，都是把「真实时间」窗口从 `after()` 改到 `hold()`。

| 行 | 窗口 | 原来 | 现在 |
|---|---|---|---|
| 1147 | toast 显示时长（所有 `say()`：删除草稿、改时间、复制微信、接受改期……） | `say(text) { …setState({ toast: { text, on: true } }); this.after(2600, function () { …on: false… }); }` | `this.hold(2600, …)` |
| 1455 | 复制微信后按钮上「已复制」的停留 | `copyWx(wx) { … this.patchView({ copied: wx }); this.say('微信号已复制'); this.after(2200, function () { self.patchView({ copied: false }); }); }` | `this.hold(2200, …)` |
| 1767 | 草稿删除后 10 秒撤销窗口（到时才 `commitUndo` 并收起撤销条） | `…self.setState({ leaving: null, undo: { draftId: id, title: eff.title } }); self.say('已删除「…」'); self.after(10000, function () { if (self.state.undo && self.state.undo.draftId === id) { …commitUndo… undo: null } }); }` | `self.hold(10000, …)` |

**sweep 遗留项的原因**：`after()` 在减少动态下乘 0，10 秒撤销窗口变成 0ms，删除一落定就立刻 `commitUndo` 并收起撤销条，所以 800ms 时什么都看不到。改成 `hold(10000)` 后已经关闭。实测撤销条在 60ms 出现，10.05s 收起，8.5s 时点「撤销」可以恢复草稿。

## 仍然用 `after()` 的调用（逐个审计过，都是动画落定或排序）

- 翻页、贴回、叠页：1184 / 1203 / 1218 / 1219 / 1225 / 1231 / 1232（`landed` 落地高亮 = `c09-land` 1100ms 动画）
- 切换身份的转书动画：1200
- 票据流程：1336（进入历史后点火）、1340（出票）、1361（复印 2620ms = 出票动画）、1368（剪刀自动走线）、1386–1389（副券落袋、撕下、联系便签、`pocketFresh`）、1404（翻票）、1418（燃烧完成）、1426 / 1444 / 1445 / 1453（贴纸 slap / peel）
- 便签层：1349 / 1350 / 1357
- 管理页：1595 / 1704（`secSwap` 切换）、1664（出席章 `slap` 动画）、1685（改时间后切到答复页、`reprint` 高亮）、1695 / 1699（取消燃烧）、1719 / 1720 / 1740（申请条拖回）
- 草稿：1760（摘要页关闭后再删）、1766（`leaving` 撕下动画）、1771（撤销后 `entering` / `landed` 动画）
- `act()` 的模拟写入延迟（1154，460ms 或各调用传入的 ms）：它不是阅读或撤销窗口，而是让结果出现的门槛。为了满足「减少动态下动作结果立即出现」，它保留在 `after()`。所以减少动态下看不到处理中的帧，结果直接落定；减少动态关闭时处理中的帧照常出现（见 `motion-resched-toast` f04）。
- 文件里没有 `setInterval`，也没有逐秒 tick。倒计时都是相对 `JU.NOW` 的静态值，所以没有需要转成 `hold` 的 tick。

## 验证

- 构建：`JU_STANDALONE=/home/user/JU/.build/C09.html node src/build.js` → `built 10 concepts; 3.58 MB standalone`
- 覆盖：`node tools/coverage.cjs C09 evidence/C09/final/coverage` → `{"states":50,"errors":0}`，`coverage/sheet.png` 已读，50 个状态都渲染正常。
- 计时探针（Playwright，每 50ms 轮询 DOM）：`evidence/C09/final/timing/rm.json`（减少动态开）、`timing/motion.json`（关），脚本 `timing/probe.cjs.txt`

| 流程 | 减少动态 开 | 减少动态 关 |
|---|---|---|
| 删除草稿 → 撤销条可见 | 60ms → 10050ms | 380ms → 10367ms |
| 删除草稿 → toast「已删除「雨天读书局」」 | 61ms → 2620ms | 374ms → 2962ms |
| 8.5s 时点撤销 | 撤销条在 · 草稿恢复 1 份 · 撤销条收起 | 同左 |
| 复制微信 → 「已复制」/ toast | 2246ms / 2610ms | 2247ms / 2610ms |
| 页面错误 | 0 | 0 |

截图（每张 sheet.png 都已读过）：

- (a) 减少动态 开
  - `evidence/C09/final/rm-draft-undo/`：f02 打开减少动态。f03（约 0.95s）草稿已消失，撤销条和 toast 都在。toast 留到 f04（约 2.1s），f05 收起。撤销条在 f03–f10（约 0.95–8.6s）一直在。f11 点撤销后草稿立即回来（没有落地动画，结果直接出现）。f12 1.5s 后仍在。
  - `evidence/C09/final/rm-copy-wx/`：j-d-contact，把联系便签滚进视野后点「复制」。f03–f05 按钮是「已复制」，toast「微信号已复制」可见。f07 恢复为「复制」，toast 收起。
  - `evidence/C09/final/rm-resched-toast/`：h-m-reschedule，把新时间改成 20:30 后提交。f04 便签关闭，结果直接落定（第 2 版、改期中、答复页）。toast「已改时间 · 等 4 位成员答复」在 f04–f06 可见，f07 起收起。
- (b) 减少动态 关（行为不变）
  - `evidence/C09/final/motion-draft-undo/`：与 (a) 相同，撤销条保持到 f10（约 8.6s）。f11 撤销后草稿带粉色落地框回来（`landed` 动画）。f12 落地框消失。
  - `evidence/C09/final/motion-copy-wx/`：「已复制」与 toast 同 (a)，f06 toast 正在滑出。
  - `evidence/C09/final/motion-resched-toast/`：f04 确认按钮处理中，f05 结果和 toast 出现，toast 在 f05–f07 可见。

## 备注

- 0.5× 速度下 `hold()` 会把窗口拉长到 2 倍（撤销 20s、toast 5.2s），这是核心的既定行为，本轮没有改动。
- 截图里的帧时间包含 capture.cjs 每张截图约 150ms 的开销。准确的毫秒数以 `timing/*.json` 为准。

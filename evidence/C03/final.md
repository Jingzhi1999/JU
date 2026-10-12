# C03 刊 · final pass：真实时间窗口改走 `hold()`，局卡条裁切修复

范围：只改 `concepts/src/C03.dc.html`。没有改设计，也没有动其他方案的文件。
依据：`spec/concept-contract.md` §11。`this.hold(ms, fn)` 和 `after()` 一样受暂停 / 重置 / 清除控制，0.5× 时拉长，但在「减少动态」下不会压成 0ms。

关闭的开放项（`evidence/C03/verify-r1.md`）：
- **N1（major）**：减少动态下 toast 从不出现，删除存稿的 10 秒撤销窗口变成 0。
- **N2（minor）**：fix-r1 加的 `contain:paint` 把长标题编辑部局卡条里的「查看局卡 ›」切掉了下半截。

## 一、after → hold 的改动（7 处，行号为当前文件）

| # | 行 | 上下文 | 窗口 | 改前 → 改后 |
|---|---|---|---|---|
| 1 | :1146 | `say(text, extra)`：非 sticky 的 toast 到点隐藏 `{ toast: …, on: false }` | toast 显示 2.6s | `if (!t.sticky) this.after(2600, …)` → `this.hold(2600, …)` |
| 2 | :1344 | `copyWx(wx)`：`this.say('微信号已复制'); … setState({ copied: false })`（按钮写「已复制」） | 复制成功反馈停留 2.6s | `this.after(2600, …)` → `this.hold(2600, …)` |
| 3 | :1360 | `deleteDraft` 写入成功后：`say('已删除「…」', { hasUndo, sticky })`，到点 `JU.engine.commitUndo` 并收起撤销条 | 草稿撤销 10s | `self.after(10000, …)` → `self.hold(10000, …)` |
| 4 | :1222 | `closeOver()`，翻页途中倒放返回：`landed: id0` 红书签到点清除 | 落点书签 2s | `this.after(2000, …)` → `this.hold(2000, …)` |
| 5 | :1237 | `closeOver()`，常规返回：`landed: id` 红书签到点清除 | 落点书签 2s | `self.after(2000, …)` → `self.hold(2000, …)` |
| 6 | :1252 | `landLater()`，写入落地时页面已合上：跟去新分区后的红书签到点清除 | 落点书签 2s | `this.after(2030, …)` → `this.hold(2030, …)` |
| 7 | :1363 | `undoDelete()`：撤销后恢复行上的红书签到点清除 | 落点书签 2s | `self.after(2000, { landed: null })` → `self.hold(2000, …)` |

第 4–7 条也属于真实时间窗口，理由如下：
- C03 的落点书签不是 CSS 动画。它是 `.c03-row.landed .c03-mark` / `.c03-cv.landed .c03-cvmk` 的静态状态类，只带一个 180ms 的进场过渡，书签显示的时间完全由 `landed` 留多久决定。
- 原来用 `after(2000)`，减少动态下 `landed` 在同一刻被设上又清掉，返回目录后书签根本看不到。减少动态下没有翻页动画，书签是唯一的落点提示，所以这一条比 1× 下更需要。
- 改成 `hold` 之后，减少动态下书签立刻出现（过渡随 `--k` 变成即时），并停留真实的 2s。1× 和 0.5× 下 `hold` 与 `after` 的时长完全相同，行为不变。

另外在 `say()` 上方（:1144）加了一行注释，写明分工：`after()` 用于动画落定，减少动态下为 0；`hold()` 用于真实时间窗口。

## 二、保留 `after()` 的调用（44 处，都是动画落定或动画排序）

| 行 | 上下文 | 说明 |
|---|---|---|
| :1151 | `act()` 模拟写入延时（460ms，或 `opts.ms`） | 不是阅读或撤销窗口。减少动态下结果立即出现；失败条一直留着，直到点「重试」 |
| :1163 | `bumpFade` 16ms | 分区淡入 |
| :1196、1199、1200 | `switchRole`：rm 下 16ms 恢复滚动；3D 翻刊 16 / 620 / 16ms | 翻刊动画 |
| :1203 | `switchSection` 16ms 恢复滚动 | 布局步骤 |
| :1210、1212 | `openOver`：快速打开 20ms；翻页 900ms | 翻页动画 |
| :1221 | 翻页途中倒放结束（`frac × 900 + 20`ms） | 翻页动画 |
| :1230、1235 | `closeOver` 30ms 定位行；翻回 820ms 卸载跨页 | 翻页动画 |
| :1252（第一处） | `landLater` 30ms 定位行 | 布局步骤（同一行的书签停留已改为 hold） |
| :1269–1274 | `afterOpen` 排序：联系层 60 / 300ms，退出层 60ms，已取消首开燃烧 500ms，滚到票 950ms，管理页各 tab 80 / 120ms | 打开后的动作排序 |
| :1281 | 印制：`delay`，然后走纸 2400ms → 印好 | 印制动画 |
| :1301、1302、1303 | 撕券：副券落进夹页 760ms；联系层 820ms；接受改期 1250ms 后 `say()` | 撕券动画。toast 的停留由 `say` 里的 hold 负责 |
| :1307 | `nudgeCoupon` 420ms 回弹 | 提示动画 |
| :1314 | `burnTicket` 燃烧时长 `g.dur` | 燃烧动画 |
| :1318、1319 | `openSheet` 16ms；`closeSheet` 330ms | 弹层进出 |
| :1330 | 成局 → 印制 360ms → 滚到票 900ms | 动作排序 |
| :1339 | 退出 / 拒绝改期写入后 380ms 起火 | 燃烧排序 |
| :1349 | 发出邀请：`freshSeat` 700ms 清除 | `.c03-seat.fresh` 500ms 弹起动画 |
| :1351 | 改时间：`reprint` 600ms 清除 | `.c03-swhen.reprint` 420ms 重印动画。toast 由 `say` 负责 |
| :1352 | 取消这局：360ms 起火，`g.dur` 落定 | 局卡条燃烧 |
| :1354 | 出席：`fresh` 2500ms 清除 | `.c03-stamp.fresh` 550ms 盖章动画。章本身是数据，不依赖 fresh |
| :1359、1360（第一处） | 删除存稿：130ms 收高；420ms 写入 | 行淡出 → 收起 |
| :1363（前两处） | 撤销：300ms 卸载已淡出的 toast；460ms 清 `entering` | toast 淡出、行回槽动画 |
| :1588 | 草稿摘要「删除存稿」：先翻回，900ms 后 `deleteDraft` | 翻页后再收起 |

C03 没有逐秒 tick 的倒计时。倒计时文字按引擎固定的 `now` 推导，没有定时器。

## 三、N2：局卡条裁切

- 原因：`.c03-tk.c03-stk{contain:paint}` 把局卡条锁在 96px 里。长变体的地点「Manhattan · 东村圣马克广场 B1（门口有红灯笼，走到底左转）」在 250px 宽的信息栏里折成两行（37px）。`.c03-sinfo` 被撑到约 104px，「查看局卡 ›」被裁掉 8–9px。
- 改动（:480–482）：保留 `contain:paint`（它防的是燃烧滤镜在条外留残迹）。局卡条里的地点行和状态行改为单行省略：`.c03-stk .c03-splace,.c03-stk .c03-sline{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}`。
- 不丢信息：完整地点就印在局卡条正上方的元信息行（`.c03-meta2`，不截断），完整局卡里也有。
- 为什么不让条变高：S 型燃烧的遮罩是 `userSpaceOnUse` 的 CSS px，焦痕 svg 却按 `viewBox 0 0 334 96` 拉伸。条一变高，焦痕和烧洞就对不上。现在条保持 334×96，燃烧几何不变。

## 四、验证

**构建与覆盖**
- 构建：`JU_STANDALONE=/home/user/JU/.build/C03.html node src/build.js`，构建通过（built 10 concepts → `.build/C03.html`）。
- 覆盖：`JU_STANDALONE=… node tools/coverage.cjs C03 evidence/C03/final/coverage`，结果 **50/50，errors 0**（`final/coverage/sheet.png`）。

**计时探针**（`final/timing.json`，脚本 `final/timing-probe.cjs`，单独运行，errors 为空）

| | 减少动态 ON | 减少动态 OFF |
|---|---|---|
| 删除存稿 → 撤销条出现 | 53ms | 512ms（行先淡出、收起） |
| 8.8s 时撤销条 | 仍在（on，opacity 1，「已删除「雨天读书局」撤销」） | 仍在 |
| 8.8s 点撤销 | 存稿 0 → 1，恢复 | 0 → 1，恢复 |
| 恢复行红书签 | 约 2.0s（点撤销后 200ms 开始测，还剩 1793ms） | 约 2.0s（点撤销后 700ms 开始测，还剩 1357ms） |
| 不撤销 → 撤销条停留 | 9953ms，然后提交（`data.undo` 清空，存稿 0） | 9950ms，然后提交 |
| 复制微信 toast「微信号已复制」 | 4ms 出现，停留到 2596ms；「已复制」停留到 2596ms | 2597ms / 2597ms |
| 改时间提交 toast「已改时间 · 等 4 位成员答复」 | 18ms 出现，停留到 2546ms | 475ms 出现（写入中），停留到 3025ms |
| 打开局卡再返回，落点书签 | 9ms 出现，停留到 1980ms | 47ms 出现，停留到 2014ms |

**帧序列**（`tools/capture.cjs`；每组都有 `sheet.png` + `log.json`，errors 全空；所有 sheet 都看过）

| 组 | 内容 |
|---|---|
| `final/rm-draft-undo/` | 减少动态 ON（`eval inst.toggleRM()`），「只有草稿」3 份：<br>f02 删除第 2 份：行立即消失，撤销条立即出现<br>f03 / f04 / f05：约 3s / 6s / 8.5s，撤销条都还在<br>f06 约 8.8s 点「撤销」：「冬至火锅」回到原槽，红书签立即出现<br>f07 约 0.9s 后书签仍在；f08 约 2.6s 后书签已收 |
| `final/off-draft-undo/` | 减少动态 OFF，同一流程：<br>f02 行淡出；f03–f05 撤销条到 8.5s 仍在<br>f06 撤销：条带着文字淡出，行回槽<br>f07 书签；f08 书签收起。与 verify-r1 `drafts` 一致 |
| `final/rm-copy-toast/`、`final/off-copy-toast/` | 编辑部 · 联系信息，点 Leon「复制」：<br>f02–f04（约 0.1 / 1.4 / 2.5s）顶部 toast「微信号已复制」+ 按钮「已复制」<br>f05（约 3.4s）都已收起。两种模式相同 |
| `final/rm-resched-toast/` | 减少动态 ON，改时间提交：<br>f03 弹层立刻关闭，toast「已改时间 · 等 4 位成员答复」立刻出现<br>f04、f05 仍在；f06（约 2.9s）已收，头部「4 人未答复新时间」 |
| `final/off-resched-toast/` | 减少动态 OFF：<br>f03「确认改时间 ···」写入中<br>f04–f06 toast；f07 收起。与改前一致 |
| `final/long-strip/` | 长标题 · 局主 → 编辑部（1×）：<br>f02 地点单行省略，「查看局卡 ›」连下划线完整在条内<br>f03–f13 取消这局，S 型燃烧到残片 + 「已取消 / 票根作废 · 联系关闭 / 归入往期」，没有越界残迹<br>f14 默认数据的同一条，不受影响<br>放大对比：`long-strip/zoom-strip.png` |
| `final/strip-probe.txt` | 脚本 `final/strip-probe.cjs`。长变体 slink 23–41，在条 −49…47 内（`clipped:false`，改前 bottom 55 > 47）。默认 / 成员 / 已取消三种数据的几何与 verify-r1 相同，`contain: paint` 仍生效 |

## 未改 / 说明

- 0.5×：`hold()` 与 `after()` 一样乘 2，所以 0.5× 下所有窗口和动画的比例不变。
- verify-r1 备注里的「toast 压在编辑部大标题上」属于常规覆盖，不计入，本轮没有动。

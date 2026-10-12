# C08 时间尺 · final pass 验证（final-verify）

验证者没有参与构建，也没有参与之前各轮评审。本轮只做聚焦验证：确认主负责人 2026-10-12 的 sweep 发现已关闭，确认减少动态下的真实时间窗口都恢复了，并检查动效开启时的主流程没有回退。

- **构建**：私有构建 `.build/final-C08.html`，命令 `JU_STANDALONE=/home/user/JU/.build/final-C08.html node src/build.js`，输出「built 10 concepts; 3.58 MB standalone」。
- **源码指纹**：`concepts/src/C08.dc.html` 的 md5 为 `680abc47…`，验证开始和结束时各核对一次，两次相同。
  - 与 HEAD（`1bb20eda…`，即 verify-r1 验证的版本）相比，diff 只有 11 行增、8 行删。
  - 改动只有这些：6 处 `after→hold`（`dropPaneTimers` 的 toast 900ms、`toast()` 2600ms、`landOn` 1600ms、`copyWx` 1800ms、`deleteDraft` 的 10s 撤销窗、`closePanesThen` 的撤销窗续期）、撤销条的 `--c08-uhold` 内联变量、`undo.ms`，以及一条 `.app.rm .c08-undo i::after` 规则。与 `final.md` 的描述一致。
  - `hold()` 在 `src/core/ju-review.js` 里，已经提交，本轮未改动。
- **证据**：全部来自本轮的实际操作，放在 `evidence/C08/final-verify/<flow>/fNN.png`。
  - 每组都有 `sheet.png` 和 `log.json`，复现命令在 `flows.sh`。
  - 计时探针 `probe.cjs` → `probe.json`：减少动态开、关各跑一遍，每 20–100ms 在页面内读一次 DOM 和实例状态。
  - 基线对比 `baseline-probe.cjs`：同一脚本分别对 HEAD 构建和本轮构建运行，结果是 `baseline-HEAD.json` 和 `baseline-final.json`。HEAD 构建在会话临时目录里单独生成，没有改动工作区。
  - 边界探针：`edge-probe.cjs` → `edge-probe.json`。
  - 放大图在 `zoom/`。
- **覆盖**：`coverage/` 共 50/50 个状态，errors 为 0（`coverage/sheet.png` 已看过，50 个状态都正常渲染）。
- **capture 日志**：12 组 capture 加上 coverage，`errors` 全部为空。三个探针的 `errors` 也都为空。
- **sheet**：13 张 `sheet.png` 全部看过，关键处另做了局部放大。

**结论：通过（pass）**。0 blocker、0 major。
- minor 共 5 条：verify-r1 遗留的 n1–n4 本轮没有改，状态不变；n5 是本轮新记录的，不是回退。

---

## 一、sweep 发现是否关闭：已关闭

原问题（主负责人，2026-10-12）：减少动态开启时，删除草稿 800ms 后看不到撤销条；减少动态关闭时能看到。

| 检查 | HEAD（verify-r1 版本） | 本轮构建 | 证据 |
|---|---|---|---|
| 减少动态开，删除后 800ms 时有撤销条 | **没有**。11.5s 内撤销条一次都没进 DOM，草稿在下一 tick 直接提交删除（`drafts: []`） | **有**。撤销条 12ms 出现，在屏到 9981ms | `baseline-HEAD.json → rmOn.undo`、`baseline-final.json → rmOn.undo` |
| 减少动态开，复制微信号后有 toast | **没有**。toast 一次都没进入 `.in` | 2ms 到 2614ms 一直可见 | 同上 → `copyToast` |
| 减少动态关（对照） | 撤销条 419–10329ms，toast 3–2613ms | 撤销条 422–10340ms，toast 4–2618ms | 两种构建在误差范围内相同 |

画面上的复现：`rm-draft-undo/`
- f02：点击后 60ms，「雨天读书局」行已经移除，同时出现「没有草稿」和撤销条「已删除「雨天读书局」 撤销」。
- f03：约 0.8s，撤销条仍在。这一帧就是 sweep 要求看到的画面。

## 二、减少动态 ON

### 2.1 草稿删除：撤销条至少 8s，撤销后行回来

| 项目 | 结果 | 证据 |
|---|---|---|
| 撤销条在屏时长 | 行 21ms 内移除（没有离场动画）。撤销条 126ms 起可见（探针每 100ms 采样，并要求祖先不透明度 ≥0.5），847ms 时可见，最后一次见到是 9934ms，10036ms 收起。 | `probe.json → rmOn.A` |
| 不点撤销 | 10s 后提交删除：`drafts: []`，列表是「没有草稿」，与 1× 相同 | `rmOn.A.draftsAfterExpiry`；`rm-draft-undo/f14–f18`（再删一次，约 3s、6s、9s 时都有撤销条；约 12s 时收起，只剩「没有草稿」） |
| 进度线按真实时间走 | `::after` 的 `animationDuration` 是 `10s`，不再是 1ms；5.07s 时 `scaleX` 为 0.495。<br>画面上的线从满格开始，按秒缩短到约 10%，不会提前显示「时间到」 | `rmOn.A.drainAt5s`；`zoom/rm-undo-drain.png`（f02、f03、f06、f10、f17、f18） |
| 8.6s 时点「撤销」 | 8618ms 时撤销条仍在。点下后 4ms 内 `draft-reading` 回到列表，撤销条收起。<br>11.5s 时复查：行还在，`state.data.drafts = ["draft-reading"]`，没有迟到的提交，也没有错误条 | `rmOn.A2`；`rm-draft-undo/f10→f11–f13`（f04–f10 共 7 帧，约 1.9–8.1s，撤销条一直在；f11 撤销后行回位） |
| 打开面板加切身份时的续期（`closePanesThen`） | 在「只有草稿」里删一份，打开另一份草稿摘要，2.5s 时点「参加」切身份。<br>撤销窗 `state.undo` 保持到 9903ms，10006ms 才结束；身份切到 `joined`。<br>没有因为续期被压成 0 而提前提交 | `rmOn.A3` |
| 0.5× 加减少动态 | 撤销窗 20000ms，进度线 `20s`，两者一致 | `edge-probe.json → half` |
| 暂停 | 进度线 `animationPlayState: paused`，2.5s 内 `transform` 不变，撤销窗不提交 | `edge-probe.json → pause` |

### 2.2 toast 与反馈：全部可以读完

| 反馈 | 在屏时长（减少动态开） | 证据 |
|---|---|---|
| 复制微信号：toast「微信号已复制」 | 56–2622ms，共 2566ms | `rmOn.B.copy`；`rm-toasts/f02–f07` 可见，f08 收起 |
| 复制按键「已复制」 | 点击时就是「已复制」，1835ms 恢复成「复制」 | `rmOn.B.copy.labelGoneMs`；`rm-toasts/f02–f05` 显示「已复制」，f06 恢复 |
| 改时间：toast「已改时间 · 等 4 位成员答复」 | 77–2651ms，共 2574ms；同时「改期答复 已答复 0/4」分区立即出现 | `rmOn.B.propose`；`rm-toasts/f11–f16` 可见，f17 收起 |
| 接受改期：toast「已接受改期 · 按新票根的时间见」 | 松手后 85ms 出现，在屏 2580ms | `rmOn.B.accept`；`rm-resched-accept/f03–f09`，f10 收起 |
| 连删后撤销：toast「已恢复「冬至火锅 · 各带一样菜」 · 另 1 份已删除」 | 60–2634ms，共 2574ms。撤销条如实写明「连删 2 份 · 撤销只恢复这一份，其余 1 份已删除」 | `rmOn.B.partialUndo`、`rmOn.B.batchBar` |
| 返回落点红框 | 61–1651ms；动画是静态的，但提示仍然出现 | `rmOn.C`；`rm-detail-back/f05–f07` 有红框，f08 消失 |

### 2.3 结果即时出现，内容正确

| 动作 | 结果 | 证据 |
|---|---|---|
| 出票（第一次打开公园慢跑 3K） | 41ms 内 `print` 从 `run` 变成 `null`，`printedV` 记为 `run3k:1`。<br>点击后 60ms 的帧里票已经完整平铺，没有出纸缝和分段送纸；标题是「撕开，联系局主」，副券和「撕开副券后可以联系局主」提示都在 | `rmOn.D`；`rm-print-tear/f02` |
| 撕票 | 拖动时副券跟手，这是直接操作。<br>松手后 5ms 写入 `ticket.torn`，49ms 联系层可见。<br>松手后 80ms 的帧里：留存联完整，存根托盘写「已撕下 · V1」，「副券已撕下 · 撕券后 8 小时内联系局主」，联系层是「Nina nina.runs 复制」，CTA「已加微信」，标题「联系局主」 | `rmOn.E`；`rm-print-tear/f06–f12` |
| 接受改期（撕新票 V2） | 松手后的第一帧：V2 已撕，存根写「旧票 V1 · 新票 V2」，原定位置留淡影「原定 · 旧票不再使用」，联系层出现，牌头「待赴约」，toast 可读 | `rm-resched-accept/f03–f10` |
| 取消这局（销毁） | 点「确认取消」后 17ms 进入 `burning`，40ms 进入 `void`，抽屉已关。<br>60ms 的帧就是最终构图：hero 是虚线框加「已取消」，历史尺上有焦痕，「票根作废 · 联系已关闭」，「原定 周一 12.28 · 20:00 …… 已取消 · 不能撤销」，「这局的安排 已取消」。<br>与 0.5× 动画结束时的画面一致 | `rmOn.F`；`rm-cancel/f02–f07`、`cancel-half/f40` |

## 三、减少动态 OFF：与 verify-r1 相比没有回退

动效关闭时 `hold()` 和 `after()` 的缩放相同，新加的 CSS 规则只在 `.app.rm` 下生效，所以按代码不会有变化。实测也一致：

| 流程 | 结果 | 证据 |
|---|---|---|
| 卡 → 详情 → 返回（1×） | 与 verify-r1 相同：块原位展开，hero 上移，内容淡入；返回时内容先淡出，再收回原块；最后有红色落点框。没有空白矩形 | `card-detail-back/f02–f27`，对照 `verify-r1/card-detail-back/` |
| 卡 → 详情 → 返回（0.5×，Livehouse） | 局部尺和 V2 出票照常；返回时收回原块，背景块全程带字 | `card-detail-back-half/f02–f27` |
| 出票（1×） | 先出现出纸缝，然后分三段送纸（露出 → 停顿 → 再露出），墨迹随纸出缝显影，之后出现「撕开副券」提示。<br>阶段时间：566ms `run`、2774ms `issued`、3529ms 结束 | `print/f03–f32`；`probe.json → rmOff.D` |
| 撕票（1×） | 拖动时副券掀起，过阈值后整张外翻，先停住写「保存中 · 写入后副券落下」，然后缩小落进存根槽；槽里是同一张副券。<br>276ms 写入，1600ms 联系层出现 | `tear/f01–f36`；`rmOff.E` |
| 取消销毁（0.5×） | 依次为：确认 → 处理中（抽屉内三点）→ 抽屉关闭 → 局卡条起火 → 焦线上行 → 余烬 → 焦痕 → 历史尺长出 → 入槽 → 「票根作废 · 联系已关闭」。局卡条全程在场，破坏过程超过 28 帧。<br>阶段时间：472ms `armed`、870ms `burning`、3472ms `burnt`、5148ms `void` | `cancel-half/f01–f40`；`rmOff.F` |
| 草稿删除 / 撤销（1×） | 行原位收起（f03–f04），然后是「没有草稿」加撤销条和进度线（f05–f10），撤销后行从原位展开（f11 `entering`），之后稳定 | `drafts-undo/f02–f20` |
| 计时（1×） | 撤销条 527–10343ms；toast：复制 2492ms、改时间 2458ms、接受改期 2534ms、连删撤销 2517ms；「已复制」1806ms；落点 526–2099ms。<br>与 HEAD 基线一致（撤销条 419–10329 对 422–10340；toast 2610 对 2614） | `probe.json → rmOff`、`baseline-HEAD.json` 对 `baseline-final.json → rmOff` |

## 四、仍然开放的项（都是 minor）

| # | 问题 | 状态 |
|---|---|---|
| n1 | 长标题时，管理面板的「返回我的局」折成两行（verify-r1 遗留） | 本轮没有改，状态不变 |
| n2 | 改时间提交后，「改期答复」分区展开时有一帧白块（verify-r1 遗留） | 本轮没有改，状态不变 |
| n3 | 管理面板滚动后再返回，收回的落点不对（verify-r1 遗留） | 本轮没有改，状态不变 |
| n4 | 中文行尾单字孤行，或行首是孤立的「·」（verify-r1 遗留） | 本轮没有改，状态不变 |
| n5（新记录） | 「已接受改期 · 按新票根的时间见」toast 停留 2.6s，盖住详情底部的状态按钮「待赴约」。<br>减少动态下松手后的第一帧，联系层还没滚到位，toast 还压着「已加微信 · 等这次见面」一行；下一帧滚到位后就不再压住。 | 证据：`rm-resched-accept/f03–f09`、`zoom/rm-accept-toast.png`。<br>不属于回退：1× 下 toast 的位置和时长相同，只是以前减少动态下 toast 当帧就消失，所以看不出来。<br>建议：面板内 toast 抬到 CTA 上方；或者减少动态下先滚到联系层，再出 toast。 |

**备注（不计入问题）**
- `final.md` 把 `run()` 的模拟写入延迟留在 `after()`，所以减少动态下写入结果立即出现。这符合「减少动态直接给结果」。失败和重试路径不在本轮范围内，verify-r1 的 `fail-retry/` 已经覆盖，本轮源码没有改动这部分。
- 原始帧 `final-verify/**/fNN.png` 共约 36MB。当前 `.gitignore` 只忽略 `review-*`、`fix-r*`、`verify-r*` 下的 `f*.png`，不包括 `final-verify/`。提交前请主负责人决定是否补上规则。本轮没有提交任何内容。

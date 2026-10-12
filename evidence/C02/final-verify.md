# C02 站牌 · final pass 验证（final-verify）

验证者没有参与构建，也没有参与之前各轮评审。本轮只做聚焦验证：确认 verify-r1 的唯一 major（M-new）已关闭，同时检查动效开启时的主流程没有回退。

- **构建**：私有构建 `.build/final-C02.html`，命令 `JU_STANDALONE=/home/user/JU/.build/final-C02.html node src/build.js`，输出「built 10 concepts」。
- **源码指纹**：`concepts/src/C02.dc.html` 的 md5 为 `1c9758a8…`，验证开始和结束时各核对一次，两次相同。
  - 与 HEAD（`cb2d2828…`，即 verify-r1 验证的版本）相比，diff 只有 9 行增、7 行删。
  - 改动只有这些：4 处 `after→hold`、倒计时归零即停、撤销进度线改用 `--kt` 和 `.rm` 覆盖规则、根变量 `--kt`。与 `final.md` 的描述一致。
- **证据**：全部来自本轮的实际操作，放在 `evidence/C02/final-verify/<flow>/fNN.png`。
  - 每组都有 `sheet.png` 和 `log.json`。
  - 计时探针：`probe.json`（撤销窗、toast、已复制、出票）和 `probe-countdown.json`（倒计时）。探针在页面内每 50–100ms 采样一次实例状态和 DOM。
  - 放大拼图在 `zoom/`。
- **覆盖**：`coverage/` 共 50/50 个状态，errors 为 0（`coverage/sheet.png`）。
- **capture 日志**：15 组 capture，加上 coverage，`errors` 全部为空。两个探针的 `errors` 也为空。

**结论：通过（pass）**。0 blocker、0 major；minor 5 条（verify-r1 遗留 3 条，新记录 2 条，都不是本轮改动带来的）。

---

## 一、M-new 是否关闭：已关闭

M-new 的原问题是：减少动态下，所有「真实时间」计时器都被压成 0ms。

| verify-r1 的子项 | 本轮结果 | 证据 |
|---|---|---|
| 撤销窗消失：删稿后立刻变成「没有草稿」，撤销条一帧都没有 | **已修**。<br>• 减少动态下删稿即时生效：「雨天读书局」行 100ms 内移除，同时出现「没有草稿」和撤销条，没有离场动画。<br>• 撤销条在屏 **9900ms**（探针，100ms 采样）。8.5s 时仍可见，`state.undo` 仍在，进度线宽度 56px；9.5s 时剩 19px。<br>• 进度线 `animationDuration` 为 `10s`（不再是 1ms），宽度 348 → 184（5s）→ 56（8.5s），按真实时间均匀缩短。<br>• 8.6s 时点「撤销」：草稿回到 `["雨天读书局"]`，行回到列表，撤销条收起；2s 后复查仍在。<br>• 不点撤销时 10s 后提交删除，草稿为 `[]`，与 1× 一致。 | `rm-draft-undo/f02–f13`（f03–f11 共 9 帧约 8.3s 撤销条一直在，f12 撤销后行回位）<br>`zoom/rm-draft-undo.png`<br>`probe.json → rmOn.A / A2` |
| 6 小时倒计时狂奔到 00:00:00，与「剩 5h」矛盾；归零后仍高频 setState | **已修**。<br>• 减少动态下 10s 内跳 10 次：04:21:00 → 04:20:59 → … → 04:20:50，间隔约 1000ms，期间 setState 共 10 次。<br>• 列表 04:20:57 进入详情，详情显示 04:20:57，同屏成员行「已预留 · 剩 5h」，CTA「阅读并确认」，三者一致。<br>• 把剩余时间人为推到 3s，归零后显示 00:00:00 并停止：`_timers` 为 0，`_ticking` 为 false，之后 2s 内 0 次 setState。 | `rm-countdown/`、`rm-countdown-detail/`<br>`probe-countdown.json → rmOn.list / detail / zeroStop` |
| toast 当帧收起；复制后按键不显示「已复制」 | **已修**。减少动态下四种反馈都可以读完：<br>• 管理盘「复制」：toast「微信号已复制」可见 2500ms，按键「已复制」可见 2100ms。<br>• 改时间：toast「已改时间 · 等 4 位成员答复」可见 2494ms。<br>• 成局出票：toast「全员到齐 · 已成局出票」可见 2450ms。<br>• 票面联系条「复制」：读卡器显示「已复制微信号 · COPIED」，按键「已复制」，约 2.2s 后恢复「已过闸 · PASSED / 复制」。 | `rm-copy-toast/f03–f09`、`rm-resched-toast/f03–f09`、`rm-print/f06–f11`、`rm-ticket-copy/f03–f08`<br>`zoom/rm-copy-toast.png`、`zoom/rm-print-toast.png`<br>`probe.json → rmOn.B / C / D` |

**补充**：动效开启（1×）时，这几个计时与减少动态下一致：撤销窗 9900ms，toast 2446–2482ms，已复制 2100ms，倒计时 10s 内跳 10 次（`probe.json → rmOff`、`probe-countdown.json → rmOff`）。可见 `hold()` 只是不再随减少动态缩放，1× 的时长没有变。

## 二、减少动态 ON：结果即时出现

| 动作 | 结果 | 证据 |
|---|---|---|
| 出票（读完约定 → 确认入局 → 成局） | 点「确认入局」后 80ms 内，票卡已经完整平铺，读卡器显示「插卡 · INSERT」，没有 ISSUING 阶段（探针 phase 92ms 内直接为 `ready`）。toast 停留约 2.5s 后收起，状态翻牌显示「撕开，联系局主」。 | `rm-print/f05–f14`、`zoom/rm-print-toast.png` |
| 撕票（过闸） | 下拖超过阈值并松手后，下一帧就是「已过闸 · PASSED」：撕裂孔、PASSED 压印、集屑窗圆片都在，联系条（局主 Nina、复制、已加微信）已经展开，牌头变为「待联系」。 | `rm-tear/f02–f08`、`zoom/rm-tear-cancel.png` |
| 取消这局（销毁） | 点「确认取消」后立即显示「已取消 · 不能撤销」、残卡（焦痕、磁条裂缝）、「作废 · VOID」，成员显示「取消前已确认 / 取消前已预留」，牌头为「已取消」。<br>首帧有约 40ms 的过渡帧，见 n5。 | `rm-cancel/f03–f09`、`rm-cancel/zoom-f03-f04.png`、`zoom/rm-tear-cancel.png` |
| 改时间 | 提交后立即显示「改期答复 已答复 0/4」、新时间 21:00、成员「未答复新时间」，toast 可读。 | `rm-resched-toast/` |

## 三、减少动态 OFF：与 verify-r1 相比没有回退

| 流程 | 结果 | 证据 |
|---|---|---|
| 卡 → 详情 → 返回（参加者，0.5×） | 与 verify-r1 相同：<br>• 进入时，背景先退成空板，牌头独自留下，详情翻牌翻入。<br>• 返回时，牌面先减淡，牌头飞回，列表最后才翻入。<br>• 任何一帧都没有两层可读文字。 | `open-back-05/f02–f27` |
| 卡 → 管理盘 → 返回（局主，1×） | 管理盘从右侧滑入滑出；落点行「13:00 看展搭子 · 现代馆」带琥珀标记，在底栏之上。 | `host-open-back/` |
| 出票（0.5×） | 成局后 toast 出现，然后出票：卡从读卡口分段露出（露出—停顿—再露出），墨迹自上而下印出，「出票中 · ISSUING」之后变为「插卡 · INSERT」。 | `print-05/f08–f29` |
| 撕票（1×） | 拖卡跟手，依次显示读数 13% / 27% / … / 100%。<br>之后经过 FEEDING → READING → ALIGN，冲头摆入、打孔，显示「已过闸 · PASSED」，吐卡，展开联系条。 | `tear/f01–f27` |
| 取消销毁（0.5×） | 依次为：确认 → 处理中 → 局卡条小卡飞入读卡槽 → OVERHEAT → 焦边沿磁条推进 → 起泡翘曲、磁条断裂 → 「作废 · VOID」→「已取消」。 | `cancel-05/f02–f33` |
| 草稿删除 / 撤销（1×） | 行收拢离场 →「没有草稿」+ 撤销条，进度线缩短（f04–f12）→ 点撤销后行入场回位 → 稳定。 | `draft-undo/f01–f17` |

## 四、仍然开放的项（都是 minor）

| # | 问题 | 证据 | 说明 |
|---|---|---|---|
| n1 | 作废残卡焦区偏暖棕、上舔形状偏圆丘（verify-r1 遗留） | `rm-cancel/f04`、`cancel-05/f30–f33` | 本轮没有改，状态不变。 |
| n2 | 「全员到齐 · 已成局出票」toast 停留 2.6s，盖住刚换值的状态翻牌行（verify-r1 遗留） | `print-05/f09–f20`、`rm-print/f06–f11` | 这是 toast 时长恢复的自然结果：现在减少动态下也和 1× 一样会盖住，之前是因为 toast 当帧就消失才看不出来。<br>不属于回退，修法同 verify-r1。 |
| n3 | 局主取消时「取消中」区块在一帧内插入，把成员区下推（verify-r1 遗留） | `cancel-05/f09→f10` | 状态不变。 |
| n4 | 详情、弹层或管理盘打开期间，6h 倒计时暂停：详情里的数字停住；返回列表后从停住的值继续，于是比真实时间慢了在详情里停留的时长。 | `rm-countdown-detail/f06–f09`（详情 04:20:57 停 3s）<br>`probe-countdown.json → detail`（详情停 3s 不动；返回后从 04:20:50 继续，两种模式相同） | 这是既有行为：`step` 里的 `if (this.state.detail \|\| this.state.manage \|\| this.state.sheet) return` 在 HEAD 版本就有，与本轮改动无关。<br>减少动态与 1× 表现一致，不会再与「剩 5h」矛盾。<br>建议改为由 `JU.NOW` 加上真实经过时间算出剩余值，或者在详情里继续 tick。 |
| n5 | 减少动态下「确认取消」后，有约 40ms（2–3 帧）的过渡：先显示未烧的卡加起泡圆点，然后才是残卡。 | `rm-cancel/f03`、`rm-cancel/zoom-f03-f04.png`<br>rAF 探针：73ms 时 `c02-card`，96ms 时 `burning`，115ms 时 `burnt` | 取消路径本轮没有改动，是既有行为。<br>肉眼几乎察觉不到，但严格来说不是「直接给结果」。<br>建议在 `.rm` 下让 `cancelEvent` 直接把 `mtk` 置为 `burnt`。 |

另：管理盘底部 toast 停留期间会压住「记为散场」一行的文字（`rm-copy-toast/f03–f09`），改时间的 toast 会压住成员行（`rm-resched-toast/f03–f09`）。1× 下也一样，builder 在 `final.md` 第五节已经说明，这里不另计。

## 五、结论

- verify-r1 的唯一 major M-new 已关闭。减少动态下，撤销窗（约 10s，可撤销并恢复）、6h 倒计时（每秒一跳、归零即停、与「剩 5h」一致）、toast 和「已复制」反馈都按真实时间呈现。
- 出票、撕票、取消销毁在减少动态下都即时给出正确结果。
- 动效开启时，卡→详情→返回、出票、撕票、0.5× 取消燃烧、草稿撤销都与 verify-r1 一致，没有回退。
- 覆盖 50/50，errors 0。
- 开放项：0 blocker、0 major、5 minor → **pass**。

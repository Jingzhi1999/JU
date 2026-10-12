# C03 刊 · final pass 复核（final-verify）

- 复核对象：`concepts/src/C03.dc.html` 工作区当前版本，含 final pass 的改动（7 处 `after → hold`，以及局卡条 `.c03-stk .c03-splace/.c03-sline` 单行省略）。`git diff` 只有这两类改动，和 `final.md` 的描述一致。
- 构建：`JU_STANDALONE=/home/user/JU/.build/final-C03.html node src/build.js`，成功（built 10 concepts）。本次复核和构建、修复的代理不是同一个。
- 方法：
  - `tools/coverage.cjs` 跑全部索引状态。
  - `tools/capture.cjs` 实际操作 14 组流程：减少动态开 8 组，关 6 组，含 0.5×。
  - 另跑 6 个只读 Playwright 探针，查 toast / 撤销条的计时、行恢复、暂停 / 重置，以及局卡条几何。
  - 所有 `sheet.png` 都看过，可疑帧裁出放大看。
  - 脚本和动作 JSON 放在 `final-verify/probes/scripts/`。
- 依据：`spec/concept-contract.md` §2 / §8 / §11，`evidence/C03/verify-r1.md`（N1 major、N2 minor），`evidence/C03/final.md`。

## 结论

**通过**（blocker 0 · major 0 · minor 1）。

verify-r1 留下的两项都已关闭：N1（减少动态下 toast 不出现，10 秒撤销窗口变成 0）和 N2（「查看局卡 ›」被裁）。减少动态关闭时，翻页、印制、撕票、取消燃烧、存稿撤销与 verify-r1 一致，没有回归。

另有一项新 minor（N3）：连续删除两份存稿时，前一次删除留下的 10 秒计时会提前提交后一次删除。这是改动之前就有的逻辑问题，减少动态开关都一样，不是本轮带进来的。

## 一、覆盖

| 项 | 结果 | 证据（final-verify/） |
|---|---|---|
| 索引状态 | **50/50，errors 0** | `coverage/sheet.png`、`coverage/log.json` |
| 与 verify-r1 逐张比对 | 50 张转灰度后，像素差 > 40 的点：47 张为 0。其余 3 张的差异都是红字的亚像素抗锯齿：`h-draft`「还没写完」、`j-d-rejected`「这次没留住」、`h-drafts-many` 1×3 px。放大看两边字形相同，静态状态与 verify-r1 一致 | `coverage/*.png` 对比 `verify-r1/coverage/*.png` |

## 二、已关闭的开放项

### N1（major）→ **已关闭**

减少动态下 toast 能出现，存稿撤销窗口有完整的 10 秒。

| 检查 | 减少动态 ON | 减少动态 OFF（对照） | 证据 |
|---|---|---|---|
| 删除存稿 → 撤销条出现 | 48ms | 662ms（行先淡出、收高） | `probes/timing.json` |
| 撤销条持续可见（on、opacity 1、在手机框内） | 到 8827ms 仍在（探针 8.8s 时停下去点撤销） | 到 8816ms 仍在 | `probes/timing.json` `undo.at88` |
| 8.8s 点「撤销」 | 存稿 2 → 3，「冬至火锅 · 各带一样菜」回到原来的第 2 槽，顺序不变；`data.undo` 清空 | 同左 | `probes/undo-rows.json` |
| 撤销后 11s | 仍是 3 份，没有迟到的提交 | 同左 | `probes/undo-rows.json` `after11s` |
| 不撤销 → 自动提交 | 撤销条 39ms → 9984ms，然后提交（2 份，`undo` 清空） | 492ms → 10452ms | `probes/timing.json` `commit` |
| 帧序列 | `rm-draft-undo/`：f01 是 3 份；f02 删除后行立刻消失，撤销条立刻出现；f03 / f04 / f05（约 3 / 6 / 8.5s）条都在；f06 点撤销后行回原槽，右缘红书签立刻出现（`zoom-restored.png`）；f07（+0.9s）书签仍在；f08（+2.6s）书签已收 | `off-drafts/`：f02 淡出 → f03 收高 → f04 下一行上移 → f05 起出现撤销条，f10 时仍在；撤销后条带着文字淡出（`zoom-undo-fade.png`），行回槽，书签约 2s 后收起 | sheet 已看 |
| 自动提交帧 | `rm-draft-commit/`：f02（约 0.1s）、f03（约 5s）、f04（约 9.5s）条都在，f05（约 11s）已收，存稿 2 | — | sheet 已看 |
| 暂停 / 重置 | 删除后 2s 暂停 12s：条仍在，`undo` 未提交。恢复后再停留 7971ms 才提交（剩余时间正确）。删除后 3s 跳回索引，再等 10.5s：3 份，没有残留计时 | — | `probes/hold-pause-reset.json` |

**toast（减少动态 ON，三条都按时长可读）**

| toast | 出现 | 最后可见 | 停留 | 帧（`rm-toasts/`） |
|---|---|---|---|---|
| 「微信号已复制」（编辑部 · 联系信息），按钮同时写「已复制」 | 36ms | 2590ms（「已复制」也到 2590ms） | 约 2.55s | f02 / f03 / f04（约 0.1 / 1.2 / 2.3s）在，f05（约 3.5s）已收 |
| 「已改时间 · 等 4 位成员答复」 | 52ms | 2601ms | 2549ms | f08 / f09 / f10 在；f11 已收，头部写「4 人未答复新时间」 |
| 「已接受改期 · 按新票根的时间见」（撕新副券） | 76–90ms | 2603–2612ms | 约 2.52s | f13 / f14 / f15 在，f16 已收；也见 `rm-accept-toast/` f03–f05 → f06 |

减少动态 OFF 的对照：复制 166 → 2547ms，改时间 646 → 3018ms（含写入），接受改期 1534 → 3916ms（含撕券动画）。toast 都停留约 2.4–2.6s，与改前一致。

**落点书签（减少动态 ON，hold 带来的变化）**：打开局卡再返回，书签在 10ms 出现，停留到 1968ms（`probes/timing.json`）。`rm-open-back/`：f04 / f05 有书签，f06（约 2.4s）已收。改前减少动态下书签根本看不到，现在能看到，没有副作用。

### N2（minor）→ **已关闭**

| 检查 | 结果 | 证据（final-verify/） |
|---|---|---|
| 长标题 · 局主 → 编辑部 | 地点单行省略为「Manhattan · 东村圣马克广场 B1（门口有…」。「查看局卡 ›」连同下划线完整在条内。完整地点印在条正上方的元信息行，没截断 | `long-strip/f02`、`f03`、`zoom-strip.png`（对照 `verify-r1/long-title/f13` 的裁切） |
| 几何 | 19 种条（默认 / 待处理较多 5 局 / 长变体 5 局 / 已取消 / 管理各 tab）：`.c03-slink` 都在 72–90，条高 96，没有越界。`contain: paint` 仍生效 | `probes/strip-geometry.json` |
| 省略的副作用 | 只有长变体的地点行被省略。所有状态行都没省略，包括最长的「已取消 · 不能撤销，票根作废、联系关闭」和「已散场 · 24 小时内仍可查看成员微信」 | `probes/strip-geometry.json`（`sline.truncated` 全部 false） |
| 长变体取消燃烧（1×） | S 型从右起火 → 焦带 → 左侧残片，右侧写「已取消 / 票根作废 · 联系关闭 / 归入往期」。没有越界残迹，条上方的元信息行干净 | `long-strip/f04–f21`、`zoom-strip-burnt.png` |

## 三、减少动态 ON：结果态立即出现且正确

| 流程 | 结果 | 证据（final-verify/） |
|---|---|---|
| 印制（阅读回执 → 确认入局） | f02 回执「确认入局」灰；f03 读到末尾后可点；f04（点击后 40ms）就已是 3/3、「待撕票」、整张印好的票根、CTA 红色「撕开票根」。没有出现待印制空框或「印制中」的中间帧，f05–f07 一直稳定 | `rm-print/` |
| 撕票 | f03（松手后 20ms）：「待联系」，票面「已撕」，副券在夹页，联系层已升起（局主 · Nina）。f04–f06 稳定 | `rm-tear/` |
| 取消这局 | f02（点确认后 40ms）：「已取消」，局卡条已经是烧后残片，右侧有结果字，成员行写「取消前已确认 / 已预留」。f06 返回往期 · 已取消焦边封面，带红书签 | `rm-cancel/` |
| 接受改期（撕新副券） | f03：「待赴约」，新票「已撕」，联系层升起，toast 同时出现 | `rm-accept-toast/` |

## 四、减少动态 OFF：没有回归（对照 verify-r1）

| 流程 | 结果 | 证据（final-verify/） |
|---|---|---|
| 局卡 → 详情 → 返回（0.5×） | 叶子绕书脊翻开，叶背透印，下页扫动阴影。返回时翻回，条目右缘落红书签，约 4s 后收起（第 20–28 帧有，第 29 帧起没有；0.5× 下 2000ms×2，与改前相同） | `off-card-detail-back/`、`zoom-turn.png`，对照 `verify-r1/card-detail-back` |
| 出票 / 印制（0.5×） | 「确认入局 ···」写入中 → 3/3，弹层收起 → 「票页 · 待印制」空框，CTA 灰「印制中」 → 分段走纸 → 自上而下上墨 → 套红「票根」 → CTA 转红「撕开票根」。全程没有闪出已印好的票 | `off-print/`，对照 `verify-r1/confirm-print` |
| 撕票（0.5×） | 跳转后先走一遍印制；拖动时副券跟手，绕内角抬起，纤维边；撕下后向左荡出，压平后落进夹页口，被前片挡住，夹页显示「存根 1 张」；落定后联系层才升起 | `off-tear/`、`zoom-drop.png`，对照 `verify-r1/tear` |
| 取消这局燃烧（0.5×） | 「确认取消 ···」 → S 型右侧起火，火线、余烬、焦带 → 左侧残片 + 右侧结果字。没有越界残迹。返回翻页后落在往期已取消封面，带红书签 | `off-cancel/`、`zoom-burn.png`，对照 `verify-r1/cancel-index` |
| 存稿删除 / 撤销（1×） | 先淡出，再收高，下一行平移；撤销条约 10s；撤销时条带着文字淡出，行回原槽并有红书签 | `off-drafts/`，对照 `verify-r1/drafts` |

1× / 0.5× 下 `hold()` 与 `after()` 的时长公式相同（`speed 0.5 → ×2`，其余 ×1），所以减少动态 OFF 的行为在代码上就不会变。帧序列和计时也证实了这一点。

## 五、新发现

### Minor

**N3. 连续删除两份存稿时，前一次删除的 10 秒计时会提前提交后一次删除，后一次的撤销窗口可缩到约 1 秒**（清单的存稿撤销机制；§11 撤销 10 秒）

- 原因：`deleteDraft` 每次都挂一个 `hold(10000)`。到点时只检查「当前 toast 是否 `hasUndo && on`」，不检查是不是自己那一次删除。所以第一次删除的计时到点后，会把第二次删除的撤销条收起并 `commitUndo`。
- 证据：
  - `probes/undo-sequence.json`：删 A → 2s 撤销 → 3s 删 B。B 的撤销条在减少动态 ON 下只留 6951ms，OFF 下 7444ms，不足 10s。
  - `probes/undo-sequence-2.json`（减少动态 ON）：删 A → 8s 撤销 → 9s 删 B，B 的条只留 950ms，然后存稿已提交为 2 份。删 A 后 5s（A 的条还在）再删 B，B 的条留 4901ms。
- 定级：只在 10 秒内连续删除两份时发生，单次删除的主路径正确（第二节）。撤销条会在到点时消失，不会留下一个点了没反应的按钮。这段逻辑改前用 `after(10000)` 时就有，在减少动态 OFF 下同样出现，不是 final pass 的回归。所以记为 minor。
- 建议：
  - 在 `deleteDraft` 里把这次的 toast 对象或删除 id 存进闭包，到点时只在 `self.state.toast === t0`（或 `toast.draftId === id`）时提交。
  - 或者每次删除 / 撤销时先清掉上一次的 `hold` 计时（`hold` 返回的 entry 可以从 `_timers` 里移除，并 `clearTimeout`）。

## 备注（未计入）

- 顶部 toast（复制、改时间、接受改期）会盖住编辑部大标题，或跨页首行的上半，持续约 2.6s。这与 verify-r1 备注相同，属于 toast 的常规覆盖，本轮没有改动，不计。
- 0.5× 下撤销窗口和 toast 也随 `hold` 拉长为 20s / 5.2s，这符合 §11 的约定。

## 证据索引（evidence/C03/final-verify/）

| 目录 | 帧数 | 内容 |
|---|---|---|
| `coverage/` | 50 | 索引全覆盖 |
| `rm-draft-undo/` | 9 | 减少动态 ON：删除 → 撤销 → 书签 |
| `rm-draft-commit/` | 6 | 减少动态 ON：10s 自动提交 |
| `rm-toasts/` | 17 | 减少动态 ON：复制、改时间、接受改期三条 toast |
| `rm-accept-toast/` | 7 | 减少动态 ON：接受改期单独一组 |
| `rm-print/` | 8 | 减少动态 ON：印制 |
| `rm-tear/` | 7 | 减少动态 ON：撕票 |
| `rm-cancel/` | 8 | 减少动态 ON：取消 |
| `rm-open-back/` | 7 | 减少动态 ON：打开 / 返回书签 |
| `off-card-detail-back/` | 31 | 0.5× 翻页往返 |
| `off-print/` | 30 | 0.5× 印制 |
| `off-tear/` | 35 | 0.5× 撕票 |
| `off-cancel/` | 36 | 0.5× 取消燃烧 |
| `off-drafts/` | 18 | 1× 存稿删除 / 撤销 |
| `long-strip/` | 22 | 长标题编辑部局卡条 + 燃烧 |
| `probes/` | — | `timing.json`、`undo-rows.json`、`undo-sequence.json`、`undo-sequence-2.json`、`hold-pause-reset.json`、`strip-geometry.json`；脚本与动作 JSON 在 `probes/scripts/` |

每个 capture 目录都有 `sheet.png` 和 `log.json`，errors 全空，所有 `sheet.png` 都看过。探针的 errors 也全空。放大图：`long-strip/zoom-strip.png`、`zoom-strip-burnt.png`、`rm-draft-undo/zoom-restored.png`、`off-drafts/zoom-undo-fade.png`、`off-cancel/zoom-burn.png`、`off-tear/zoom-drop.png`、`off-card-detail-back/zoom-turn.png`。

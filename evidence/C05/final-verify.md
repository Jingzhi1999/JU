# C05 缝线 · final 定向复核（final-verify，2026-10-12）

- 复核对象：`concepts/src/C05.dc.html` 工作区修改（相对 HEAD 只有 3 处 `after → hold` 和 2 行注释，`git diff` 6+/4-），`spec/motion/C05.md` 新增的 〔final〕 一行；共享核心 `src/core/ju-review.js` 自 verify-r1（1885929）以来只**新增**了 `hold()`，`after()` 没动。
- 私有构建：`JU_STANDALONE=/home/user/JU/.build/final-C05.html node src/build.js` → `built 10 concepts; 3.58 MB standalone`。
- 依据：builder 的 `evidence/C05/final.md`，上一轮结论 `evidence/C05/verify-r1.md`，主负责人 sweep 发现（减少动态开启时删除草稿 800ms 后没有撤销条）。
- 方法：`tools/coverage.cjs` 跑 50 个状态；`tools/capture.cjs` 跑 12 组操作流；另写了一个页内 rAF 探针（`final-verify/probe/probe.cjs`，每帧读 DOM / state，只记录变化点，时间戳是 `performance.now()`），结果在 `final-verify/probe/timing.json`。所有 `log.json` 和探针的 errors 都为空。13 张 sheet.png 我都看过；另外拼了两张放大对比图（见下）。

## 结论

**通过。** blocker 0 · major 0。sweep 发现已关闭。减少动态关闭时没有回归。verify-r1 的两个 minor（open-1 / open-2）不在这次修复范围内，原样保留。

## 1. Coverage

| 项 | 结果 |
|---|---|
| `coverage.cjs C05 evidence/C05/final-verify/coverage` | **50/50，errors 0** |
| `coverage/sheet.png` | 已看。参加者 / 局主列表、24 个参加者局内状态、13 个管理页、草稿摘要、7 个边界状态都能正常渲染，和 verify-r1 的 coverage 一致，没有空白页或错位 |

## 2. 减少动态 开

| 检查 | 目录 / 证据 | 看到的 | 判定 |
|---|---|---|---|
| **sweep 发现：删除后 800ms 有撤销条** | `rm-on-draft-undo/f03`（删除后约 0.8s） | 空态「无样板 · 没有草稿」+ 底部撤销条「已删除「雨天读书局」 撤销」 | **已关闭** |
| 撤销条停留 ≥ 8s | `rm-on-draft-undo/f03–f11`（约 0.8s → 约 9.0s 共 9 帧） | 每一帧都有撤销条，文字和按钮完整 | 通过 |
| 撤销恢复草稿 | `rm-on-draft-undo/f12–f13` | 约 9.1s 点「撤销」后，「没写完的局 1」和「雨天读书局」回到原槽位，「草稿」分区计数也回来了 | 通过 |
| 探针：放着让它过期 | `timing.json` → `rmOn_undoExpire` | 撤销条 267ms 出现，**10018ms** 消失，`undoState` 同时清空（删除被提交） | 通过 |
| 探针：9.0s 时点撤销 | `rmOn_undoAt9s` | 28ms 出现，一直到 9016ms 点撤销；9030ms 撤销条消失、草稿行数 0→1，`titleBack: ["draft-reading"]` | 通过 |
| 草稿摘要内删除 | `rm-on-draft-summary-delete/` | 摘要里点「删除草稿」→ 立即回到草稿列表空态 + 撤销条；约 0.1s、0.5–1.3s、约 7.4s、约 9.0s 都在；点撤销后草稿回来 | 通过 |
| 连删两条 | `rm-on-two-deletes-expire/` | 删第一条 →「已删除「未命名的局」」；删第二条 → 撤销条换成「冬至火锅 · 各带一样菜」，计数 3→2→1；第二条删除后约 8.4s 撤销条仍在，约 11s 已提交，剩「雨天读书局」 | 通过 |
| toast 1：复制微信 | `rm-on-copy-toast/f03–f10`；探针 `rmOn_copy` | 顶栏右格「微信号已复制」+ 按钮「已复制」；按钮 **2210ms** 回到「复制」，toast **2610ms** 消失 | 通过 |
| toast 2：改时间提交 | `rm-on-reschedule-toast/f03–f10`；探针 `rmOn_reschedToast` | 弹层立即收起，切到「改期答复 已答复 0/4」，顶栏「已改时间 · 等 4 位成员答复」从 29ms 到 **2616ms** | 通过 |
| toast 3：接受改期（拉断新吊牌） | `rm-on-accept-toast/f03–f09` | 松手后立即：旧牌盖「作废」章、新吊牌已撕、白标「待赴约」、顶栏「已接受改期 · 按新吊牌的时间见」，大约 2.6s 后收起（f10） | 通过 |
| 打印（挂牌）结果立即出现 | `rm-on-print-tear/f02`；探针 `rmOn_printTear_x1` | 从列表点「公园慢跑 3K」后 28ms 打开详情，**65ms** 时 `phase: ready`：吊牌整张挂好，线已系在粉线叉上，票号 JU-RUN3K 清楚，下面是「↓ 拉 按住吊牌向下拉，拉断棉线」 | 通过 |
| 撕票结果立即出现 | `rm-on-print-tear/f12`；探针同上 | 松手后 **47ms**（1341→1388ms）`torn + contact`：吊牌在存根袋里，线头留在裁片上，白标「待联系」，「联系局主 · nina.runs [复制] / 已加微信」直接出现；返回后列表行变成「待联系 · 联系局主 ›」 | 通过 |
| 取消燃烧结果立即出现 | `rm-on-cancel/f03`；探针 `rmOn_cancel_x1` | 点「确认取消」后 31ms 弹层收起、白标「已取消」，**39ms** `burn: burnt`：订单簿头部变成轮廓材质，角上留焦痕，成员「取消前已确认 / 取消前已预留」；返回后落在「历史 · 已取消」 | 通过 |

减少动态下的打印 / 撕票 / 取消结果和 verify-r1 的 `verify-r1/rm/sheet.png` 一致。

## 3. 减少动态 关（回归）

| 流程 | 目录 / 证据 | 看到的 | 和 verify-r1 对比 |
|---|---|---|---|
| 卡片 → 详情 → 返回（0.5×，待撕票行） | `rm-off-open-print-tear-back-05x/f01–f04`、`f44–f52`；放大图 `keyframes.png` | 行在原位沿折线翻开，背景压暗失焦；返回时裁片折回原行，列表从失焦中浮出，落点是同一行（已变成「待联系」） | 一致（`verify-r1/land/`） |
| 卡片 → 详情 → 返回（1×，lead） | `rm-off-lead-open-back-1x/` | 早午餐 lead 翻开 → 详情 → 返回，lead 裁片在原位接住 | 一致 |
| 打印（0.5×） | 同上 `f05–f28`；探针 `rmOff_printTear_x0.5` | 「挂牌中 · 吊牌从布边下抽出，一停一抽」：吊牌分几次从右侧布边下抽出 → 「系线中 · 棉线穿过扣眼，在粉线叉上打结」→ 落定。时间点：1727ms 开始 printing，5728ms tying，7152ms ready（1× 时是 868 / 2871 / 3581ms，正好是 2 倍） | 一致（`verify-r1/ticket/`） |
| 撕票（0.5×） | 同上 `f29–f43` | 往下拉 → 线断 →「线断了 · 吊牌落进存根袋」→ 线头留在裁片上 → 联系白标展开。falling 到 torn 1506ms、到联系卡 2045ms（1× 时是 761 / 1016ms） | 一致（`verify-r1/tear/`） |
| 取消燃烧（0.5×） | `rm-off-cancel-05x/`；对比图 `rm-off-cancel-05x/compare-vs-r1.png`（上排本轮，下排 verify-r1） | 「确认取消」变成处理中「-----」→ 弹层收起 → 订单簿从右上角起火，焦边是起伏的不规则曲线，外侧有焦毛和灰点，后面浮出灰线轮廓 → 轮廓 +「已取消」→ 返回落到「历史 · 已取消」。探针：写入 1408ms，开始燃烧 2175ms，烧完 8342ms（1× 时是 719 / 1091 / 4178ms） | 一致（`verify-r1/cancel/`），对比图里焦边形状和材质没有区别 |
| 草稿删除 → 撤销（1×） | `rm-off-draft-undo/`；探针 `rmOff_undoExpire` / `rmOff_undoAt9s` | 行收起 → 空态 + 撤销条（441ms 出现，10428ms 提交）；9.0s 点撤销后草稿回到原槽位，有一段落点色 | 一致（`verify-r1/drafts/`） |
| toast（1×） | 探针 `rmOff_copy` / `rmOff_reschedToast` | 复制：toast 12→2612ms，「已复制」12→2212ms；改时间：460ms 处理中之后 479ms 出现，3087ms 消失 | 和改前时长一样（`hold` 在 1× 下和 `after` 完全相同） |

代码层面：`hold()` 和 `after()` 唯一的区别是减少动态时不归零，1× / 0.5× 的系数一样，所以减少动态关闭时这 3 个窗口的时长不会变。其余 36 处 `after()` 没动，上面的帧和探针时间点都和 motion spec、verify-r1 对得上。

## 4. 原有未关闭项（verify-r1 已记录，不在本轮修复范围内）

- **open-1 · minor**：360 宽待撕票详情的需求行第二行以「·」开头。本轮没改这段代码。
- **open-2 · minor**：`--ink3 #60657a` 在台面色 `#e1dac8` 上对比度 4.14:1。本轮 `--ink3` 还是 `#60657a`。

## 5. 判定

blocker 0 · major 0 · minor 2（都是 verify-r1 留下的） → **pass = true**。
sweep 发现（lead, 2026-10-12）：**已关闭**。

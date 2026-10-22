# JU「设置」R2 · 十个艺术指导方向 · 项目记录（本阶段唯一主入口）

> 记录原则与上一阶段相同：只写有材料可核实的内容；构建 / 研究代理的自报在主负责人复看前标「代理自报」；用户尚未审阅的内容不写成「已认可」。验证等级：已写代码 / 已运行 / 已检查视觉 / 已检查完整动效 / 已检查交互 / 用户已认可。文档不含任何密码、Token、Cookie、私钥或敏感环境变量值。

## A. 当前现场与恢复入口

| 项 | 内容 |
|---|---|
| 最后更新 | 2026-10-22 04:2x UTC |
| 分支 / 提交 | `claude/eager-brahmagupta-ct0owo`（已推送到 `5e0e47b`） |
| 任务书 | `settings-r2/brief/R2-PROMPT.txt`（用户上传的 `JU-SETTINGS-FABLO51-REDESIGN-R2-PROMPT.txt` 原文；附带的审查页 `JU-SETTINGS-R2-REVIEW-AND-PROMPT.html` 的逐套诊断已读） |
| 用户本轮原话（要点） | 旧十套全部重新构思，不选任何一套继续修，不拼接旧构图，不换皮交付；十套各有独立、成熟的艺术指导；共有的 JU 身份与关键行为保持稳定，正文构图 / 空间比例 / 中文排版 / 色彩面积 / 表面层次 / 运动编排充分开放；视觉吸引力是独立且必要的门槛；一次性交付十套完整、可体验、可离线打开的方案；用实际画面和真实操作证明 |
| 主要交付 | `JU-SETTINGS-R2-TEN-DIRECTIONS.html`（尚未生成；构建脚本已就位：`node settings-r2/src/build.js`） |
| 当前步骤 | 2026-10-22 00:1x UTC 十一个代理（十个构建 + 一个研究）因 Fable 用量上限（HTTP 429）同时中止；用户把会话模型切到 Opus 5.5。主负责人：① 读了七份半成品首屏（S02 / S03 / S04 / S05 / S08 / S09 / S10，`.build/lead-partial/sheet.png`），结论：缩略图里都读成「页头 + 身份 + 一列等高行」，只换了底色——写了 `settings-r2/spec/art-direction-v2.md`（通用规则 + 逐套配方），并把 S02 改为「大字目录」、S06 改为「一段话」；② 写了共享行为控制器 `settings-r2/src/core/jus-ctl.js`（见 §C）；③ 以 Opus 重新启动十个阶段 1 构建代理与研究代理（进行中） |
| 恢复方法 | 代理完成后其汇报到达主会话；若会话中断：读本文 §E 各套状态 → 看 `settings-r2/evidence/SNN/stage1/` → 用 `settings-r2/tools/lead-sheet.cjs .build/lead-home s-home --gray` 生成十套同状态并排（需要各套私有构建 `.build/SNN.html`：`JU_STANDALONE=.build/SNN.html JUS_ONLY=SNN node settings-r2/src/build.js`）|
| 用户已认可 | **无**（截至本文，用户未审阅本阶段任何内容） |


## A.1 进展日志（追加）
- 2026-10-22 01:0x–01:5x UTC：十套阶段 1 全部交付并经主负责人复看通过（各套意见见 `settings-r2/spec/verification.md` §2.1）；十套首页隐名并排（三环境、彩色 + 灰度）与同流程比较存于 `settings-r2/evidence/lead/`。
- 02:0x UTC：十个构建代理 + 研究代理进入阶段 2 后因 **Opus 会话用量上限（HTTP 429，04:00 UTC 重置）** 同时中止；04:02 UTC 主负责人提交它们留下的文件（`ceac387`），04:03 UTC 用 SendMessage 让十一个代理从中断处继续。
- 04:05 UTC：按用户要求「额度重置后自动继续任务」，建立每小时一次的定时检查（scheduled task「JU 设置 R2 · 额度重置后自动续跑」，每小时第 5 分钟触发到本会话）：若代理因上限中止且已重置，就让它们继续；项目完成后删除。
- 04:0x UTC：**用户重申「视觉呈现是最高优先级——视觉不好看，再完美的功能也没有意义」**。已写入 `stage2-brief.md` 顶部、`verify-brief.md` 判定节与 `art-direction-v2.md`，并逐一告知十个构建者（先把每个 surface 做到与首页同等质量，再补检查；交付前做 12 页接触表自审；主负责人先只看画面）。
- 04:1x UTC：主负责人对十个进行中的构建做二级页隐名并排（收藏、通知、记录、记录详情、规则、外观预览、账户确认、找局接缝；`settings-r2/evidence/lead/stage2-wip/`）。观察：二级页大多已延续各自语言（S02 大字分区、S03 光 + 墨、S04 海报块、S05 圆光盘、S07 预览台、S09 夜灯）；**问题**：八套的确认层都是同一种白色底部 sheet；S06 / S07 下部列表退回普通行；S08 二级页依赖页内标签栏；S10 二级页仍是空色块占位——已分别下达意见。

## B. 输入与基线（实际核对）

| 输入 | 状态 | 处理 |
|---|---|---|
| `JU 设置 · 十套方案.html`（旧十套） | 已到位、已解包（11 页）、已逐页截图与按状态索引操作 | `settings-r2/spec/baseline-observations.md`（§1 首屏实看、§2 源码问题核实、§3 规则来源、§4 清单、§5 二级页同构并排） |
| `JU-V27-review-canvas(2).html` | **未上传到本会话** | 用旧分支 `claude/new-session-ix9g6p` 的 `extract-v27-settings.md`（逐函数提取）+ 任务书 §4 数值代替；标为未验证项 |
| `JU-MY-R8-Visual-Motion-Refined.html` | **未上传到本会话** | 用 `extract-r3-settings.md` / `extract-myju-settings.md` 代替；标为未验证项 |
| 旧设置项目（仓库远端分支 `claude/new-session-ix9g6p`） | 已发现并提取其 spec / research / core / tools（未合并到本分支；按文件复制并改写） | 复用的只有：三份提取文件、状态契约、功能归属表、共享引擎（语义层）与工具管线；视觉零复用 |

## C. 契约、核心与工具（已写代码 · 已运行）

- `settings-r2/spec/concept-contract.md`：质量门槛（任务书 §2/§7/§8）、共有语言规格表（页头 30/14→18、CTA 280×48 JU 蓝、三种环境必须是大面积真实色光、语义）、文件骨架与四个注入标记、**禁止整页缩放**、键盘 `--kb`、减少动态三源、覆盖范围（52 条索引）、选择器、验证命令、完成定义、坑。
- `settings-r2/spec/directions.md`：十个命题（S01 字即内容 / S02 侧栏目录 / S03 上光下墨 / S04 海报块 / S05 居中仪式 / S06 对话流 / S07 预览在上 / S08 横向分栏 / S09 夜灯 / S10 叠层），每套八项；六维矩阵（D1 / D4 / D5 / D6 十行各不相同 → 任意两套 ≥ 4 维不同）；淘汰候选；候选参考。
- `settings-r2/spec/builder-brief.md`（两阶段）、`function-state-map.md`（15 类 ↔ 引擎 ↔ 索引）、`rules-check.md`（微信必填 / 免费邮箱 / 每年四次：来源等级与「未验收」）、`limits.md`、`verification.md`（三栏，进行中）。
- 核心 `settings-r2/src/core/jus-data.js`（R2）：**走时钟** `JUS.now()`（数据锚点 + 真实走时 + 面板偏移），验证码过期按走时钟判断（Node 测试通过），`expireEmailCode`（评审用），命名空间 `jus2:`，索引 52 条（新增 `s-profile-code-expired / s-unsaved / s-kb`），材料记录真实文件名与大小；`core-regress.cjs` 31 项通过。
- `jus-review.js`（R2）：系统 `prefers-reduced-motion` 监听（`review.rmSys`，根类 `rm rm-sys`）、`after()` 三源归零、尺寸预设 `setPhoneSize`（375×812 / 390×844 / 430×932，`.ju-phone` 变量驱动，真实回流）、键盘模拟 `toggleKb`（`--kb:300px`）、`advanceClock / expireCode`；**删除了 `fitWidth` 缩放助手**。
- 面板 `jus-panel.html/css`：尺寸 / 键盘 / 时钟 / 系统 RM 显示；`@media (prefers-reduced-motion: reduce)` 兜底。
- 壳 `settings-r2/src/shell/*`：总览每套五个状态（首页 / 资料编辑 / 收藏 / 记录详情 / 保存失败）；对比视图：全部十套或挑三套、同一状态、尺寸、1× / 0.5×、**隐去名称、灰度检查、减少动态**；附录八页；无相对链接。
- 工具：`capture / coverage / coverage-matrix / widths（375/390/430 + 字号不变性 + .app 无 transform）/ kb-check（新）/ rm-check（新）/ lead-sheet（新：同状态十套隐名并排、可灰度）/ shrink-evidence / review-sheet / motion-specs / test/standalone / test/core-regress`。
- 管线样例 `settings-r2/concepts/src/S00.dc.html`（非交付）：私有构建 → 面板尺寸 430 真实变宽、键盘变量生效、时钟 +5、52 条索引、`rm-check` 在模拟系统 RM 下 `rmSys:true`、`kb-check` / `widths` 无 findings、对比 / 总览 / 附录可用、0 错误（**已运行 · 已检查交互**，主负责人亲自）。
- **共享行为控制器 `settings-r2/src/core/jus-ctl.js`**（主负责人写，2026-10-22）：导航栈（起点矩形、各 surface 滚动位置记忆、enter→in→idle / exit 相位、打断时先结算）、页头收拢变量 `--hc`（直接写 DOM，不触发重渲染）、资料表单（V27 校验、验证码发送 / 错码 / 59s 重发 / **按走时钟过期** / 重新发送恢复、保存处理中 → 失败保留输入 → 重试 → 成功回原位）、未保存确认层、文本表单（记录补充 / 异议 / 申诉、举报补充、反馈、接缝举报；草稿按对象隔离；本机文件名与大小）、通知（模拟系统提示）、外观（预览不写数据 / 应用 / 取消 / 离开即清除预览）、城市、收藏（拿出 + 4 秒撤回且恢复原位置）、记录 / 举报 / 帮助 / 隐私 / 关于 / 账户、入局接缝（V27 滑动参数）、我的局接缝、根导航、52 条索引的栈路径与状态构造。`settings-r2/spec/ctl-api.md` 是给构建代理的接口说明。**已运行**：`settings-r2/tools/test/ctl-regress.cjs` 全部通过（导航、资料全流程、过期、两种未保存确认、表单失败 / 重试、通知拒绝后不可再申请、外观预览、城市作用域、撤回恢复顺序、已报名局收藏不改票根、根切换、接缝举报 = 已提交、52 条索引全部生成视图模型）；S00 改写为控制器接线参考，浏览器真实点击走通（页头 `--hc` 1.0 时标题 18px、返回恢复滚动、验证码、失败重试、保存回到资料页、系统提示允许、指针右滑收藏 + toast、根切换后首页计数 4），coverage 52/52、0 错误（**已检查交互**，主负责人亲自）。

## D. 研究
- 第一次研究代理录入 5 条（Instrument–Oura、Work & Co–Aesop、ustwo–The Body Coach、BUCK–Headspace、Ann Demeulemeester SS26，含证据图）后被 429 中止；Opus 研究代理接续（先核对这 5 条）。目标：`settings-r2/research/ledger.md|json`（≥50 案，含七个指定入口；类别配额 UI ≥16 其中设置屏 ≥10、动态 ≥12、编辑 ≥8 含中文 ≥3、设计师作品 ≥10、获奖 ≥4）；失败项 `failures.md`。完成前本节为空。

## E. 十套状态（阶段 1 进行中）

| 编号 | 命题 | 阶段 1 | 阶段 2 | 主负责人复看 |
|---|---|---|---|---|
| S01 字即内容 | 当前值即版面主角 | 首次代理被 429 中止（未产出）；Opus 重启进行中 | — | — |
| S02 大字目录 | 整屏大字目录 → 首字竖栏 + 内容面（v2 改写） | 首次半成品（旧方向）被否；Opus 重启进行中 | — | 半成品首屏已看（读成黑栏 + 列表） |
| S03 上光下墨 | 上光场 / 下墨面 | 半成品结构可用；Opus 按 v2 重做进行中 | — | 半成品首屏已看 |
| S04 海报拼块 | 满版拼块、无圆角、高饱和 | 半成品（粉彩圆角卡）被否；Opus 重做进行中 | — | 半成品首屏已看 |
| S05 居中仪式 | 单中轴对称 | 半成品方向对、尺度不足；Opus 按 v2 重做进行中 | — | 半成品首屏已看 |
| S06 一段话 | 一整段关于你的话，值可点（v2 改写） | 首次代理未产出；Opus 进行中 | — | — |
| S07 预览在上 | 固定实时预览 + 控件 | 首次代理未产出；Opus 进行中 | — | — |
| S08 横向分栏 | 横向整高栏 | 半成品（标签页 + 列表）被否；Opus 重做进行中 | — | 半成品首屏已看 |
| S09 夜灯 | 墨底 + 光下的陈述 | 半成品（深色列表）被否；Opus 重做进行中 | — | 半成品首屏已看 |
| S10 叠层 | 真正重叠的层、露 72px 边 | 半成品（粉彩胶囊）被否；Opus 重做进行中 | — | 半成品首屏已看 |

## F. 验证（见 `settings-r2/spec/verification.md`，三栏）
- 已完成的「实际观察 / 操作」：旧十套 11 页截图与 6 个同状态并排；S00 管线各项。
- 尚未验证：十套本身（任何一套）；与 V27 / R8 真实画面的并排衔接；真机。

## G. 下一步
1. 收齐十个阶段 1 汇报 → `lead-sheet.cjs` 生成 s-home（三环境）/ s-profile-edit 的隐名并排与灰度 → 逐套判断「成立 / 调整 / 推翻」→ 用 SendMessage 下达阶段 2 或重做。
2. 研究代理汇报 → 核对七个入口与配额 → 写 `settings-r2/spec/concept-refs.md`（每套 5–8 条，五件事）。
3. 阶段 2 完成后：独立复核代理逐套复操作 → 修复轮 → 共享构建 → 在最终导出文件上复跑 coverage / widths / kb / rm / standalone → 填写 `verification.md` → 更新本文 → 提交推送。

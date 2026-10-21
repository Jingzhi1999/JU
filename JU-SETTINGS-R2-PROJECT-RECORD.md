# JU「设置」R2 · 十个艺术指导方向 · 项目记录（本阶段唯一主入口）

> 记录原则与上一阶段相同：只写有材料可核实的内容；构建 / 研究代理的自报在主负责人复看前标「代理自报」；用户尚未审阅的内容不写成「已认可」。验证等级：已写代码 / 已运行 / 已检查视觉 / 已检查完整动效 / 已检查交互 / 用户已认可。文档不含任何密码、Token、Cookie、私钥或敏感环境变量值。

## A. 当前现场与恢复入口

| 项 | 内容 |
|---|---|
| 最后更新 | 2026-10-21 23:5x UTC |
| 分支 / 提交 | `claude/eager-brahmagupta-ct0owo`（已推送到 `b0766d7` 之前的提交；本文件与之后的变更在下一次推送） |
| 任务书 | `settings-r2/brief/R2-PROMPT.txt`（用户上传的 `JU-SETTINGS-FABLO51-REDESIGN-R2-PROMPT.txt` 原文；附带的审查页 `JU-SETTINGS-R2-REVIEW-AND-PROMPT.html` 的逐套诊断已读） |
| 用户本轮原话（要点） | 旧十套全部重新构思，不选任何一套继续修，不拼接旧构图，不换皮交付；十套各有独立、成熟的艺术指导；共有的 JU 身份与关键行为保持稳定，正文构图 / 空间比例 / 中文排版 / 色彩面积 / 表面层次 / 运动编排充分开放；视觉吸引力是独立且必要的门槛；一次性交付十套完整、可体验、可离线打开的方案；用实际画面和真实操作证明 |
| 主要交付 | `JU-SETTINGS-R2-TEN-DIRECTIONS.html`（尚未生成；构建脚本已就位：`node settings-r2/src/build.js`） |
| 当前步骤 | 十个构建代理并行进行**阶段 1**（首屏 ×3 环境 + 资料详情 / 编辑 + 核心交互）；研究代理进行 ≥50 案再筛选；主负责人等待后做隐名并排 / 灰度 / 同流程核对，决定继续或推翻 |
| 恢复方法 | 代理完成后其汇报到达主会话；若会话中断：读本文 §E 各套状态 → 看 `settings-r2/evidence/SNN/stage1/` → 用 `settings-r2/tools/lead-sheet.cjs .build/lead-home s-home --gray` 生成十套同状态并排（需要各套私有构建 `.build/SNN.html`：`JU_STANDALONE=.build/SNN.html JUS_ONLY=SNN node settings-r2/src/build.js`）|
| 用户已认可 | **无**（截至本文，用户未审阅本阶段任何内容） |

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

## D. 研究
- 代理进行中：`settings-r2/research/ledger.md|json`（≥50 案，含七个指定入口；类别配额 UI ≥16 其中设置屏 ≥10、动态 ≥12、编辑 ≥8 含中文 ≥3、设计师作品 ≥10、获奖 ≥4）；失败项 `failures.md`。完成前本节为空。

## E. 十套状态（阶段 1 进行中）

| 编号 | 命题 | 阶段 1 | 阶段 2 | 主负责人复看 |
|---|---|---|---|---|
| S01 字即内容 | 当前值即版面主角 | 代理进行中 | — | — |
| S02 侧栏目录 | 竖排目录栏 + 内容面 | 代理进行中 | — | — |
| S03 上光下墨 | 上光场 / 下墨面 | 代理进行中 | — | — |
| S04 海报块 | 通栏平涂色块 | 代理进行中 | — | — |
| S05 居中仪式 | 单中轴对称 | 代理进行中 | — | — |
| S06 对话流 | 句子 + 嵌入控件 | 代理进行中 | — | — |
| S07 预览在上 | 固定实时预览 + 控件 | 代理进行中 | — | — |
| S08 横向分栏 | 横向整高栏 | 代理进行中 | — | — |
| S09 夜灯 | 墨底 + 动态光团 | 代理进行中 | — | — |
| S10 叠层 | z 轴叠层露边 | 代理进行中 | — | — |

## F. 验证（见 `settings-r2/spec/verification.md`，三栏）
- 已完成的「实际观察 / 操作」：旧十套 11 页截图与 6 个同状态并排；S00 管线各项。
- 尚未验证：十套本身（任何一套）；与 V27 / R8 真实画面的并排衔接；真机。

## G. 下一步
1. 收齐十个阶段 1 汇报 → `lead-sheet.cjs` 生成 s-home（三环境）/ s-profile-edit 的隐名并排与灰度 → 逐套判断「成立 / 调整 / 推翻」→ 用 SendMessage 下达阶段 2 或重做。
2. 研究代理汇报 → 核对七个入口与配额 → 写 `settings-r2/spec/concept-refs.md`（每套 5–8 条，五件事）。
3. 阶段 2 完成后：独立复核代理逐套复操作 → 修复轮 → 共享构建 → 在最终导出文件上复跑 coverage / widths / kb / rm / standalone → 填写 `verification.md` → 更新本文 → 提交推送。

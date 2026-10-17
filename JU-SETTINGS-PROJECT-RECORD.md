# JU「设置」十套视觉与动效方案 · 项目记录（唯一主入口）

> 本文件是「设置」项目的唯一主记录。上一轮「我的局」的主记录是 `JU-MY-JU-PROJECT-RECORD.md`，本文不覆盖它。辅助文件（研究台账、规格、证据、代码）在各节注明位置。
> 记录原则：只写有材料可核实的内容；代理（子任务）自报而主负责人未复核的内容标注「代理自报」；用户尚未审阅的内容不写成「已认可」。无法核实的写「未知」。

---

## A. 当前现场与恢复入口

| 项 | 内容 |
|---|---|
| 最后更新 | 2026-10-17 18:1x UTC（容器时钟为 UTC；用户时区未知） |
| 当前有效版本 | git 分支 `claude/new-session-ix9g6p`（从 `claude/eager-brahmagupta-ct0owo` 的 HEAD `61cb4f0a` 起）；本轮尚未提交 |
| 工程目录 | `/home/user/JU`（云容器内的仓库克隆；容器临时，**只有已提交并推送的内容可迁移**） |
| 设置工程子目录 | `settings/`（独立于上一轮：`settings/spec/`、`settings/concepts/{src,project}`、`settings/src/{core,shell,build.js}`、`settings/research/`、`settings/tools/`、`settings/evidence/`）；复用仓库根 `src/runtime/`（preact + dc-mini-runtime）与 `src/core/ju-fx.*`（几何 / 动效原语）|
| 交付入口 1（规划中） | Design 画布（claude.ai Artifact）：https://claude.ai/artifact/GbRvZNXusNc5sLS1CWC8h6 — 本轮新建；当前只有入口画板（十套索引，标「画板制作中」），方案画板随实现逐套加入 |
| 交付入口 2（规划中） | 独立评审画布 `JU-Settings-Fablo51-10-Concepts.html`（仓库根；由 `node settings/src/build.js` 生成；当前为空壳，不含方案） |
| 预览 / 启动 | 直接用浏览器打开 `JU-Settings-Fablo51-10-Concepts.html`（总览 / 方案 / 对比 / 附录；`#concept/SC01` 直达）。字体来自 Google Fonts（容器内已验证可达，HTTP 200；离线退回系统字体）。无需安装；Node 22 + Playwright（`/opt/node-tools/node_modules/playwright`，Chromium 已预装）+ ffmpeg 仅用于构建与截图验证 |
| 构建 | `node settings/src/build.js`（写 `settings/concepts/project/*.dc.html`、`canvas.json`、`Main.dc.html` 与独立画布）；私有构建 `JU_STANDALONE=/home/user/JU/.build/SCNN.html node settings/src/build.js`（并行开发用，不写共享文件） |
| 验证工具 | `node settings/tools/capture.cjs <CODE> <outdir> '<actions json>'`（操作并抽帧，生成 sheet.png + log.json）；`node settings/tools/coverage.cjs <CODE> <outdir>`（跳转全部状态索引截图）；两者支持 `JU_STANDALONE` |

### A.1 工作状态总表

| 状态 | 事项 |
|---|---|
| 已完成（有材料） | 现场核对：三份输入附件与仓库上一轮成果（§B.2）；设置工程骨架与工具（`settings/src/build.js`、`jus-review.js`、`jus-panel.html/css`、shell、capture / coverage）；十套方向卡与差异矩阵初稿 `settings/spec/directions.md`；十套元数据 `settings/concepts/concepts.json`；Design 画布已创建并发布入口画板 |
| 进行中（后台代理） | ① V27「入局」源码抽取 → `settings/spec/extracts/extract-v27-settings.md`；② R3「开局」源码抽取 → `extract-r3-settings.md`；③「我的局」接缝抽取 → `extract-myju-settings.md`；④ 研究补充：设置专项 UI 案例（目标 10–12 例）→ `settings/research/draft-ui-settings.md`；⑤ 设置相关动效案例（目标 6–8 例）→ `draft-motion-settings.md`；⑥ 编辑设计 / 设计师作品结构案例（目标 7–9 例）→ `draft-editorial-designer-settings.md`。证据写入 `research/evidence/<新 slug>/` |
| 受阻 / 失败 | 无硬性阻塞。已知限制同上一轮：Design 画布无法在容器内渲染（只能用独立画布截图验证）；容器无 GPU；部分站点（awwwards、behance、tympanus、ssense、metmuseum）在本网络被拒 |
| 未开始 | 共同状态契约与功能归属表（等抽取结果）；共享设置核心 `settings/src/core/jus-data.js`；十套实现；证据；研究合并台账 `settings/research/ledger.md`；用户审阅 |

### A.2 当前具体位置
- 第一步（确认现场、保存快照）完成；第二步（范围与契约）等待三份抽取；第三步（研究）后台进行中；第四步（方向）初稿已写，待研究结果校正与参考映射。
- 未实现任何一套方案；没有任何截图或动效证据。

### A.3 当前最重要的问题
1. 三模块收藏语义不一致（V27 源码为右滑收藏 / 左滑取消、以城市 + 标题为键；R3 为横向阈值切换、以活动 ID 为键；我的局无收藏集合）——需在契约里定稳定 ID 映射与手势规则（默认以 V27 语义为参考），等抽取确认阈值与方向。
2. 记录 / 举报 / 申诉对象模型在我的局各套中不一致（部分只存固定句子）——契约需统一对象语义。
3. 视觉验收只能由用户做。

### A.4 下一个应执行的具体动作
1. 读三份抽取，写 `settings/spec/function-map.md`（功能归属表）与 `settings/spec/state-contract.md`（跨模块状态契约，含稳定 ID 映射、作用域、保存模型、本地 / 真实能力）。
2. 实现 `settings/src/core/jus-data.js`（演示数据、引擎、状态索引、变体、权限 / 服务模拟），并用 Node 跑转移测试。
3. 合并研究台账，补参考映射 `settings/spec/concept-refs.md`；修正方向卡。
4. 试点两套差异最大的方向（计划：SC02 面板 与 SC05 冰箱门），各做首页 + 一处信息较密二级页 + 一段完整编辑 / 保存 / 返回或收藏变化；用真实中文长内容截图检查后再展开其余八套。

## B. 用户要求与方案地位

### B.1 本轮有效的用户要求（来自 `JU-SETTINGS-FABLO51-PROMPT.md`，要点）
- 主任务切换为「设置」：十套完整、可操作的视觉与动效方案；视觉性最重要，但不允许遗漏功能；十套共用完整功能范围；最终交付十套，不中途停下让用户先选。
- 必须先完整理解现有产品（V27 入局、R3 开局、我的局十套），建立功能归属表与跨模块状态契约；收藏是必做接缝样例（§7），方法推广到记录 / 举报 / 申诉、资料、城市、通知。
- 研究 ≥50 个有效案例（可继承上一轮合格研究，补设置专项；UI 类 ≥8 例与设置 / 偏好 / 个人信息 / 内容管理相关；动态类 ≥6 例有真实移动端证据）。
- 十套方向由研究与产品问题产生，任意两套 ≥4 维差异；不预设风格标签。
- 规格：390×844 主评审，检查 360 / 430；材质、运动质量、结果构图要求（§11–12）；统一入口 `JU-Settings-Fablo51-10-Concepts.html`；唯一主记录 `JU-SETTINGS-PROJECT-RECORD.md`。
- 验证分级：已写代码 / 已运行 / 已检查静态视觉 / 已观看完整动效 / 已检查交互与状态 / 用户明确认可，分别记录。
- 本轮不额外授权部署、重置仓库、改变权限、对外发送消息、真实举报提交或真实账户删除。**关于推送**：用户简报写「不额外授权推送」，而本会话的运行环境要求把工作提交并推送到指定分支 `claude/new-session-ix9g6p`（容器临时，不推送则记录不可迁移，与用户「记录必须可恢复」的要求冲突）。主负责人的处理：只提交并推送到该指定分支，不推送到其他分支、不部署、不开 PR。上一轮也是以同样方式推送到其指定分支。

### B.2 输入文件与基线判断（已核对）
| 输入 | 核对结果 |
|---|---|
| `JU-V27-review-canvas-Claude-under30MB.html`（28.3 MB） | 「入局」；用户称成熟度最高；本轮以其核实后的中文排版、标题 / 按钮关系、导航语义、触感、材质与连续运动为重要参照；设置内部允许实质性新设计 |
| `JU-R3-Visual-Motion.html`（23 MB） | 「开局」；功能组件大致实现，视觉未过关；只取功能意图、字段、城市 / 时区、草稿、收藏（按 ID）线索 |
| `JU-My-Ju-Fable51-10-Concepts.html`（4.2 MB） | 与仓库根同名文件 MD5 一致（`491efba7…`）；仓库 `concepts/src/C01–C10.dc.html` 是其维护源；用户尚未视觉审核；任何一套都不是已认可基线 |
| 上一轮记录 `JU-MY-JU-PROJECT-RECORD.md` | §1.2「用户明确认可」为空；§1.3 否定项（Acne / Gentle Monster 作设计师品牌样本；只做减法 / 只调留白；先交三套静态图；alert / 空弹层 / 跳旧稿；背景快速循环渐变 / 粒子；自评分数）本轮继续遵守 |

### B.3 用户明确认可的内容及保护范围
- **无**（截至本文更新，用户未审阅本轮任何内容）。

### B.4 用户明确否定的方向（继承 + 本轮）
- 见 B.2 最后一行；另：本轮简报明确否定「十种配色的通用设置列表」「巨大头像 / 巨型英文 SETTINGS / 成排圆角容器代替构图」「遍布低对比灰色解释字」「只有首页精致、打开后变成默认表单」「用方案切换冒充产品换肤」「改昵称做成撕票、普通开关做成打印、退出登录做成燃烧仪式」。

### B.5 模型暂定建议（未经用户确认）
- 十套方向（§D 的方向卡）由主负责人从约 17 个候选中选定，淘汰理由见 `settings/spec/directions.md` 末尾。
- 编号前缀 `SC`（设置）以区分上一轮 `C01–C10`。
- 收藏接缝默认以 V27 的方向性手势（右滑收藏 / 左滑取消）为参考语义；待抽取确认。

## C. 功能与状态契约
- 待写：`settings/spec/function-map.md`、`settings/spec/state-contract.md`（等 §A.1 三份抽取）。

## D. 研究台账与失败尝试
- 继承：`research/ledger.md` / `ledger.json`（上一轮 94 例：ui 26、motion 21、editorial 18、designer 21、award 8；已看动效 30）。主负责人核对：其中与设置 / 偏好 / 个人资料直接相关的只有 REF14（Airbnb 2025 Profile）、REF87（Crouton 内容管理）两例 → 设置专项缺口由 §A.1 的三个研究代理补充。
- 本轮新增草稿（代理产出，待主负责人核验证据后合并进 `settings/research/ledger.md`）：`settings/research/draft-ui-settings.md`、`draft-motion-settings.md`、`draft-editorial-designer-settings.md`。

## E. 设置 SC01—SC10 的真实规格与进度
- 方向卡：`settings/spec/directions.md`（初稿，六维 + 差异矩阵 + 淘汰方向）。
- 实现状态：十套均**未开始**；没有代码值可记录。

## F. 代码地图与可迁移性
```
JU-Settings-Fablo51-10-Concepts.html     独立评审画布（构建产物；当前为空壳）
JU-SETTINGS-PROJECT-RECORD.md           本文
settings/concepts/concepts.json          十套元数据（编号、名称、一句话、三个核心动作、备注）
settings/concepts/src/SCNN.dc.html       各方案源文件（待写；带 <!-- @panel --> /* @core */ /* @panel-css */ <!-- @fx-svg --> 标记）
settings/concepts/project/               构建产物：Design 画布用画板 + canvas.json + Main.dc.html
settings/src/core/jus-data.js            （待写）共享设置状态：演示数据、引擎、索引、变体、权限 / 服务模拟
settings/src/core/jus-review.js          评审 mixin（after / hold / holdKey / afterKey、重置、索引跳转、重播、失败 / 权限 / 服务模拟）
settings/src/core/jus-panel.html|css     评审面板（手机画面外）
settings/src/shell/                      独立画布外壳（总览 / 方案 / 对比 / 附录）
settings/src/build.js                    构建脚本
settings/tools/capture.cjs|coverage.cjs  截图 / 抽帧 / 覆盖工具（默认指向设置画布）
settings/spec/                           方向卡、（待写）功能归属表、状态契约、动效规格、覆盖表、限制
settings/spec/extracts/                  三模块抽取（代理产出中）
settings/research/                       研究草稿与合并台账（证据在 research/evidence/）
src/runtime/ · src/core/ju-fx.*          复用上一轮运行时与动效原语（不修改）
```
- 原始附件在容器 `/root/.claude/uploads/4330fea6-…/`，不在仓库；只读。
- 真实能力边界：全部为本地原型与演示数据；没有真实账户、验证邮件、通知服务、审核服务或后端。

## G. 验证与缺陷
- 尚无实现，无验证记录。验证分级定义沿用上一轮：已写代码 / 已运行 / 已检查静态视觉 / 已观看完整动效 / 已检查交互与状态 / 用户明确认可。

## H. 接手后的前三至五项动作
1. 读 `settings/spec/extracts/*.md` 三份 → 写 `function-map.md` 与 `state-contract.md`（含稳定 ID 映射表、作用域、保存模型、本地 / 真实能力）。完成标准：收藏、资料、城市、通知、记录 / 举报 / 申诉五条链路每条有「读取位置 / 修改位置 / 不应受影响的状态 / 保存失败返回规则」。
2. 写 `settings/src/core/jus-data.js` 并在 Node 跑转移测试（收藏加入 / 取消 / 重复、资料保存 / 失败 / 重试、通知三态、城市作用域、记录补充 / 申诉、举报补充、重置隔离）。
3. 合并研究台账 → `settings/research/ledger.md`（≥50 有效例，五类配额，每例证据路径核对存在）；写 `settings/spec/concept-refs.md`（每套 5–8 例跨 ≥3 类）。
4. 试点 SC02 与 SC05（见 A.4 第 4 条）；用 `settings/tools/capture.cjs` 截图复看后再展开。
5. 每个里程碑后更新本文并提交推送到 `claude/new-session-ix9g6p`。

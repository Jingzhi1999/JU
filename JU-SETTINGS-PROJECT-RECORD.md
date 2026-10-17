# JU「设置」十套视觉与动效方案 · 项目记录（唯一主入口）

> 本文件是「设置」项目的唯一主记录。上一轮「我的局」的主记录是 `JU-MY-JU-PROJECT-RECORD.md`，本文不覆盖它。辅助文件（研究台账、规格、证据、代码）在各节注明位置。
> 记录原则：只写有材料可核实的内容；代理（子任务）自报而主负责人未复核的内容标注「代理自报」；用户尚未审阅的内容不写成「已认可」。无法核实的写「未知」。

---

## A. 当前现场与恢复入口

| 项 | 内容 |
|---|---|
| 最后更新 | 2026-10-17 19:2x UTC（容器时钟为 UTC；用户时区未知） |
| 当前有效版本 | git 分支 `claude/new-session-ix9g6p`（从 `claude/eager-brahmagupta-ct0owo` 的 HEAD `61cb4f0a` 起）；本轮提交见 §F；已推送到 origin 同名分支 |
| 工程目录 | `/home/user/JU`（云容器内的仓库克隆；容器临时，**只有已提交并推送的内容可迁移**） |
| 设置工程子目录 | `settings/`（独立于上一轮：`settings/spec/`、`settings/concepts/{src,project}`、`settings/src/{core,shell,build.js}`、`settings/research/`、`settings/tools/`、`settings/evidence/`）；复用仓库根 `src/runtime/`（preact + dc-mini-runtime）与 `src/core/ju-fx.*`（几何 / 动效原语）|
| 交付入口 1 | Design 画布（claude.ai Artifact）：https://claude.ai/artifact/GbRvZNXusNc5sLS1CWC8h6 — 入口画板 + 已完成方案的画板（当前：SC05 冰箱门；其余随完成加入） |
| 交付入口 2 | 独立评审画布 `JU-Settings-Fablo51-10-Concepts.html`（仓库根；`JUS_ONLY=SC05 node settings/src/build.js` 生成；当前只含 SC05；全部完成后用 `node settings/src/build.js` 生成十套） |
| 预览 / 启动 | 直接用浏览器打开 `JU-Settings-Fablo51-10-Concepts.html`（总览 / 方案 / 对比 / 附录；`#concept/SC01` 直达）。字体来自 Google Fonts（容器内已验证可达，HTTP 200；离线退回系统字体）。无需安装；Node 22 + Playwright（`/opt/node-tools/node_modules/playwright`，Chromium 已预装）+ ffmpeg 仅用于构建与截图验证 |
| 构建 | `node settings/src/build.js`（写 `settings/concepts/project/*.dc.html`、`canvas.json`、`Main.dc.html` 与独立画布）；私有构建 `JU_STANDALONE=/home/user/JU/.build/SCNN.html node settings/src/build.js`（并行开发用，不写共享文件） |
| 验证工具 | `node settings/tools/capture.cjs <CODE> <outdir> '<actions json>'`（操作并抽帧，生成 sheet.png + log.json）；`node settings/tools/coverage.cjs <CODE> <outdir>`（跳转全部状态索引截图）；`node settings/tools/widths.cjs <CODE>`（360 / 390 / 430 三行对照 + 横向溢出列表）；三者支持 `JU_STANDALONE`。主负责人复核：`bash settings/tools/review-check.sh <CODE>`（私有构建 + coverage + 证据清单 + 禁用词）、`python3 -I settings/tools/review-sheet.py <CODE>`（命名截图拼图 → `.build/review-<CODE>.jpg`）。聚合：`node settings/tools/coverage-matrix.cjs`（→ `settings/spec/coverage.md`）、`node settings/tools/motion-specs.cjs`（→ `settings/spec/motion-specs.md`）、`node settings/tools/test/standalone.cjs`（独立画布冒烟）、`node settings/tools/test/core-regress.cjs`（引擎回归 31 项） |

### A.1 工作状态总表

| 状态 | 事项 |
|---|---|
| 已完成（有材料） | 现场核对（§B.2）；三份源码抽取 `settings/spec/extracts/extract-{v27,r3,myju}-settings.md`（代理产出，主负责人通读并据此写契约）；功能归属表 `settings/spec/function-map.md`；跨模块状态契约 `settings/spec/state-contract.md`；共享设置核心 `settings/src/core/jus-data.js`（Node 转移测试通过，见 §G）；评审 mixin / 面板 / 外壳 / 构建 / 截图工具；管线测试画板 `SC00`（私有构建 + capture 0 错误）；研究：新增 29 例（UI 12、动效 8、编辑 4、设计师 5）合并为 `settings/research/ledger.md`（共 123 例）；参考映射 `settings/spec/concept-refs.md`（每套 6–11 例跨 ≥3 类）；十套方向卡 `settings/spec/directions.md`；实现契约 `settings/spec/concept-contract.md` + 代理简报 `settings/spec/builder-brief.md`；Design 画布入口画板（版本 2） |
| 进行中 | 九套由构建代理并行实现（SC01 / SC02 / SC03 / SC04 / SC06 / SC07 / SC08 / SC09 / SC10，每套按 `settings/spec/builder-brief.md`，私有构建），主负责人逐套复看 |
| 受阻 / 失败 | 无硬性阻塞。已知限制同上一轮：Design 画布无法在容器内渲染（只能用独立画布截图验证）；容器无 GPU；部分站点（awwwards、behance、tympanus、ssense、metmuseum）在本网络被拒 |
| 未开始 | 其余八套实现；逐套证据；覆盖表 `settings/spec/coverage.md`；动效规格汇总 `settings/spec/motion-specs.md`；用户审阅 |

### A.2 当前具体位置
- 第一步（现场与快照）、第二步（范围与契约）、第三步（研究 ≥50 例）完成；第四步（十套方向 + 内部试点）进行中：方向卡与参考映射已写，试点 SC02 / SC05 开始实现。
- 尚无任何交付方案的截图或动效证据（只有 SC00 管线测试的抽帧 `.build/cap-sc00*/`，不计入证据）。

### A.3 当前最重要的问题
1. 十套的视觉质量尚无实物可判断；试点要先证明构图、材质、动效在真实中文内容下成立。
2. 抽取核实的三处源码事实改变了原设想：V27 设置首页只有「信用记录 / 帮助与反馈」两行（其余分组是本轮新增的账户级设计，已在功能归属表逐项标 ④）；V27 收藏键为 `city|title` 且无持久化、R3 键为 `城市:下标`（不可映射）——契约以 canonical id 为身份，入局接缝直接取 V27 feed 行（14 条）并记录 `JUS.IDMAP`；V27 举报创建即「已受理」（mock）——契约改为用户提交后只到「已提交」，受理 / 处理中 / 需补充 / 已处理只由演示数据产生。
3. 视觉验收只能由用户做。

- 2026-10-17 19:2x UTC：九个构建代理（SC01–SC04、SC06–SC10）因会话用量限制（HTTP 429，重置 22:40 UTC）同时中止，已写到磁盘的内容保留（源文件 SC01 / SC02 / SC03 / SC06 / SC07 / SC09 / SC10 部分或全部、SC02 规格与证据）；22:42 UTC 用户确认限额已重置，九个代理已用 SendMessage 从中断处恢复。若再次触发限制：等到错误里给出的重置时间后再逐个恢复（代理 transcript 已保存，不要新开代理）。
### A.4 下一个应执行的具体动作
1. 完成试点 SC02 / SC05：构建 → `capture.cjs` 抽帧 → Read 看图 → 修构图 / 材质 / 动效 → `coverage.cjs` 全状态 0 错误 → 证据入 `settings/evidence/SCNN/`。
2. 主负责人复看两套首屏、二级页、三个核心动作与收藏接缝；把发现的坑补进 `settings/spec/concept-contract.md` §10。
3. 并行启动其余八套（代理），每套按 `settings/spec/builder-brief.md`；主负责人逐套复看、统一核验来源与状态契约。
4. 生成 `settings/spec/coverage.md`、`settings/spec/motion-specs.md`；构建共享画布；发布十套画板到 Design 画布；更新本文；提交推送。

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
- `settings/spec/function-map.md`：23 行功能归属（依据分级 ①–⑤、原始入口、归属、读取 / 修改位置、稳定 ID、不受影响状态、保存 / 失败 / 返回规则、代码位置）；明确不做的扩张项（钱包 / 支付 / 会员 / 积分 / 排行榜 / 黑名单 / 改密码 / 手机号登录）。
- `settings/spec/state-contract.md`：原则、稳定 ID 与跨文件映射（V27 `city|pack|title` / 收藏键 `city|title`；R3 `城市:下标` 不可映射；我的局 canonical）、对象模型与作用域表、五条链路（收藏 / 资料 / 城市 / 通知 / 记录·举报·申诉·反馈）、统一保存 / 失败 / 返回 / 重复 / 刷新 / 隔离规则、收藏接缝验收表（13 场景）、源码冲突与处理决定（16 条）、评审面板模拟能力。
- 实现：`settings/src/core/jus-data.js`（数据 / 派生 / 引擎 / 索引 49 条 / 变体 8 个 / 持久化适配器）。V27 逐字继承：收藏手势参数与文案（`JUS.FAV`）、通知五态文案（`JUS.COPY.permission`）、信用事实标签与状态字（`JUS.creditLabel / creditStatus`）、举报对象与状态字、资料校验文案与邮箱本机测试码流程、JuRules26 18 条标题与已引用正文、政策声明句。本轮新增设计（④）在文件注释与契约中注明。

## D. 研究台账与失败尝试
- 合并台账：`settings/research/ledger.md`（由 `settings/tools/build-ledger.py` 生成）：**123 例** = 继承 94（ui 26、motion 21、editorial 18、designer 21、award 8；已看动效 30）+ 本轮新增 29（ui 12：SU01–SU12；motion 8：SM01–SM08，全部已看动效，其中 5 例为真实手机界面录像；editorial 4：SE01–SE04；designer 5：SD01–SD05）。五类最低构成（16 / 12 / 8 / 10 / 4）与合计 ≥50 均满足；设置专项要求（UI ≥8 例与设置 / 偏好 / 资料 / 内容管理相关；动态 ≥6 例有移动端证据）满足。
- 证据核对：主负责人用脚本核对 29 例新增案例在 `research/evidence/<slug>/` 的文件全部存在（ui 12 例 37 张、editorial / designer 9 例 32 张、motion 8 例各含 sheet.jpg + 关键帧）；并抽看了代理汇报中的观察文本。主负责人**没有**逐张重看全部图片，这一步按「代理自报 + 文件存在核对」记录。
- 继承案例中与设置直接相关的只有 REF14、REF87 两例；本轮映射到具体方案的继承案例 28 例已在台账「对设置的转译」列写明方案编号；其余 66 例保留原转译并标「继承 · 本轮未映射」。
- 失败 / 未立案：三份草稿各附「访问失败／未立案」清单（合计 55 条：Behance / Awwwards / Tympanus / SSENSE / Met 被拒；Bear、Signal support 403；App Store 429；Luma / Partiful 设置需登录；Apple HIG 多数页面无动效视频；animations.dev / uilabs 无演示；jenson.im / benjitaylor / codepen 不可达等），已并入 `settings/research/ledger.md` §三。
- 淘汰的方向候选与理由：`settings/spec/directions.md` 末尾。

## E. 设置 SC01—SC10 的真实规格与进度
- 方向卡：`settings/spec/directions.md`（六维 + 差异矩阵 + 淘汰方向）；参考映射：`settings/spec/concept-refs.md`。
- **SC05 冰箱门**（主负责人亲自实现；已写代码 · 已运行 · 已检查静态视觉 · 已观看核心动效抽帧 · 已检查交互与状态；用户未审阅）：源 `settings/concepts/src/SC05.dc.html`（~121 KB）；规格与三个核心动作分段 `settings/spec/motion/SC05.md`（构图坐标、字体字号、色板、材质、每段时长与曲线、实际观察与建议值分开）；证据 `settings/evidence/SC05/`（home / dense / favorites / favorites-after-remove / record-detail / record-supplement(-saved) / report-supplement / saved(-home) / edge-empty / edge-fail / edge-denied / edge-long / edge-invalid / seam-feed / seam-feed-detail / seam-mine / appearance-preview；`motion-1` 取下与放回、`motion-2` 翻面开关、`motion-3` 拿起名片 → 编辑 → 保存 → 贴回、`motion-seam-swipe` 入局滑动收藏；`coverage/` 49 个索引状态 0 错误）。已知问题见 `spec/motion/SC05.md` 末尾（词磁贴 lift 前 100ms 内容少、无真机触控）；原先的「收藏网格补位无 FLIP」「帮助页偏平」已修（`componentDidUpdate` FLIP 位移 360ms；帮助页改为门上的菜单纸，证据 `help.png` 与重抽的 `motion-1/`）。
- **SC02 面板**（构建代理实现，主负责人复核；已写代码 · 已运行 · 已检查静态视觉 · 已观看核心动效抽帧 · 已检查接缝交互；用户未审阅）：源 `settings/concepts/src/SC02.dc.html`（180 KB）；规格 `settings/spec/motion/SC02.md`（61 行：三个核心动作分段表 + 字体 / 字号阶 / 色板 / 材质 / 圆角阴影 / 布局 / 长文本规则，分当前代码值 / 实际观察 / 建议值）；证据 `settings/evidence/SC02/`（31 项：7 类状态截图 + help / city / records / report-detail / privacy / rules / account-confirm / widths-sheet；`motion-1` 拨杆 23 帧、`motion-2` 旋钮 21 帧、`motion-3` 保护盖红钮 24 帧；`coverage/` 49 状态 0 错误）。构图：黑色铭牌（称呼 + 微信 + 邮箱 + 已验证 LED）在上，下方 11 个搪瓷模块各带 LCD 读数（收藏数 / 城市 / 6/6 类开启 / 棉糖 / 7 条事实 / 2 条处理中 / 规则 18 条 / 无开关 / 演示中 / 18 条规则），首页 844 内不滚动；唯一的红色是保护盖下的结束会话红钮。代理报告的未达标项：确认区高度生长是 `grid-rows` 过渡，关键帧滑块不能暂停它；用户偏好「减少动态」由方案自己的 `go()` 处理（随后 mixin 的 `after()` 已改为同时读 `data.appearance.reduceMotion`）。
- **SC06 内衬**（构建代理实现，主负责人复核；已写代码 · 已运行 · 已检查静态视觉 · 已观看核心动效抽帧 · 已检查接缝交互；用户未审阅）：源 `settings/concepts/src/SC06.dc.html`（161 KB）；规格 `settings/spec/motion/SC06.md`（55 行）；证据 `settings/evidence/SC06/`（29 张命名 PNG 含 seam-feed-after-swipe / seam-settings-favorites / seam-mine-unfav / knot-open / appearance-applied / notify-requesting / city-noresult；`motion-1` 拉链展开 42 帧、`motion-2` 按扣 21 帧、`motion-3` 重织织唛 23 帧；`coverage/` 49 状态 0 错误；`widths.jpg`）。构图：深色里布（三种皮肤 = 三种里布色）上，顶部包边织带循环织字，白色四针织唛（称呼 27px + Archivo Narrow 账号）= 我；胸袋拉链（资料）、收藏拉链贴袋（袋口露出色样卡）、城市笔袋、洗标（六个提醒符号行 + 三块里布色样 + 系结）、两只涂层帆布箱袋（记录 / 举报，D 环挂「需要处理」吊牌）、最里层四块织带标（帮助 / 隐私 / 账户 / 关于）；二级页 = 口袋里的米白袋布，页头是拉开的袋口拉链；橙色只在拉片与按扣；首页为固定像素场景用 `fitWidth(390)` + `.wall` 缩放。代理报告的未达标项：① 拉链展开是 clip-path / transform 过渡，关键帧滑杆只对 ②③ 有效。
- **SC07 墨水屏**（构建代理实现，主负责人复核；已写代码 · 已运行 · 已检查静态视觉 · 已观看核心动效抽帧 · 已检查接缝交互；用户未审阅）：源 `settings/concepts/src/SC07.dc.html`（122 KB）；规格 `settings/spec/motion/SC07.md`（56 行）；证据 `settings/evidence/SC07/`（24 张命名 PNG 含 profile-code / notify-requesting / city-noresult / rules；`motion-1` 刷新翻页 23 帧、`motion-2` 方块开关 18 帧、`motion-3` 反相落定 20 帧；`coverage/` 49 状态 0 错误）。构图：衬线大字称呼 + 微信 / 邮箱 / 城市一行；五条黑组头（个人资料 / 收藏与城市 / 通知与外观 / 记录与举报 / 帮助与账户）下引导点对齐的「标签 …… 当前值」行，橙色只在屏角 LED「需要处理 2」与方块小字；全部运动都是「反相 — 显现 — 残影清除」，无阴影渐变；纸纹为静态 SVG 噪点层。代理报告的取舍：记录状态词三个放右栏，V27 原文放条目第三行；用户偏好减少动态由方案的 `refresh / flashRow` 自行处理（mixin 现已同时读该偏好）。
- **SC01 登记表**（构建代理实现，主负责人复核；已写代码 · 已运行 · 已检查静态视觉 · 已观看核心动效抽帧 · 已检查接缝交互；用户未审阅）：源 `settings/concepts/src/SC01.dc.html`（162 KB）；规格 `settings/spec/motion/SC01.md`（58 行）；证据 `settings/evidence/SC01/`（20 张命名 PNG；`motion-1` 盖章 / 划线 / 层叠 30 帧、`motion-2` 27 帧、`motion-3` 29 帧；`coverage/` 49 状态 0 错误）。构图：一张带 5% 网格的登记表，表头 30px 称呼 + 编号 / 填表日期 / 待处理数；分组用 ▌粗线，每行「标签 | 当前值 | 附表 N」，行尾朱红章（已验证 / 待核实 / 需补充 / 开关章）；二级页是纸上长出的编号附表，补充 / 异议 / 申诉是夹带纸条；危险操作是表尾「撕角处」。代理报告的未达标项：真机软键盘遮挡未处理；撕角未做纤维撕裂边。
- **SC09 软体**（构建代理实现，主负责人复核；已写代码 · 已运行 · 已检查静态视觉 · 已观看核心动效抽帧 · 已检查接缝交互；用户未审阅）：源 `settings/concepts/src/SC09.dc.html`（139 KB）；规格 `settings/spec/motion/SC09.md`（58 行）；证据 `settings/evidence/SC09/`（20 张命名 PNG；`motion-1` 膨胀进入 / 收缩返回 22 帧、`motion-2` 软球开关 21 帧、`motion-3` 保存脉冲 18 帧、`motion-seam-swipe` 四种滑动 22 帧；`coverage/` 49 状态 0 错误）。构图：粘土色软体，「我」最大、两轴不等圆角、称呼 34px；收藏 / 通知 / 城市 / 外观四个软体放当前值，记录 / 举报用杏色提示待核实 / 需补充，底部四个小软体（帮助 / 隐私 / 账户 / 关于）；页面从软体原地膨胀出来，返回收缩；材质 = 平涂 + 一道内阴影 + 一条高光 + 接触影，无滤镜噪点。代理报告的未达标项：无头截图约 150ms 一张，100ms 的软球开关只抽到 3–4 个中间帧，真机 60fps 需复核过冲；`s-report-file` 跳转按索引标签打开空表单（产品路径下桌游夜已有未结举报应显示回执）。
- SC03 / SC04 / SC08 / SC10：代理构建中（22:42 UTC 恢复后进行中；未完成者无证据、无代码值可记录）。

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
settings/tools/capture.cjs|coverage.cjs|widths.cjs  截图 / 抽帧 / 覆盖 / 宽度工具（默认指向设置画布）
settings/tools/review-check.sh|review-sheet.py  主负责人复核门槛与拼图
settings/tools/coverage-matrix.cjs|motion-specs.cjs  十套覆盖矩阵与动效规格合集
settings/tools/test/standalone.cjs|core-regress.cjs  独立画布冒烟 / 引擎回归
settings/spec/                           方向卡、（待写）功能归属表、状态契约、动效规格、覆盖表、限制
settings/spec/extracts/                  三模块抽取（代理产出中）
settings/research/                       研究草稿与合并台账（证据在 research/evidence/）
src/runtime/ · src/core/ju-fx.*          复用上一轮运行时与动效原语（不修改）
```
- 原始附件在容器 `/root/.claude/uploads/4330fea6-…/`，不在仓库；只读。
- 真实能力边界：全部为本地原型与演示数据；没有真实账户、验证邮件、通知服务、审核服务或后端。

## G. 验证与缺陷
验证分级：已写代码 / 已运行 / 已检查静态视觉 / 已观看完整动效 / 已检查交互与状态 / 用户明确认可。
- 共享核心 `jus-data.js`：**已运行**（Node vm 转移测试，主负责人亲自）：收藏幂等与取消、已报名活动收藏后阶段与票根不变、资料校验（称呼 10 字 / 微信字符 / 免费邮箱）、未验证邮箱不可保存、验证码错 / 对、保存后快照不变、保存失败武装与重试、权限申请与预设回答（允许 / 拒绝）、城市切换不改活动城市、记录补充 / 异议（第二次拒绝）/ 申诉、举报补充（需补充 → 处理中；非需补充拒绝）、新举报状态为已提交、八个变体全部派生无错。
- 管线 `SC00`：**已运行 + 已检查静态视觉**（主负责人看过 `.build/cap-sc00/sheet.png` 18 帧与 `cap-sc00b` 7 帧）。SC00 不是交付方案。
- **SC02 面板**（代理构建，主负责人复核）：**已运行 · 已检查静态视觉 · 已观看核心动效抽帧 · 已检查接缝交互**。主负责人亲自跑过：`review-check.sh SC02`（私有构建通过、coverage 49/49 无错误、面板控件泄漏 0、禁用词 0）、`widths.cjs SC02`（overflow 空）、`review-sheet.py SC02`（27 张命名截图通读）、`motion-2` / `motion-3` 帧序列通读；接缝用方案自己的导航而非状态跳转验证（`.build/sc02-seam2`：入局右滑 菜狗羽毛球拼局 → 「收进收藏 · 共 4 个」→ 设置首页卡槽「4 个局 · 菜狗羽毛球拼局」→ 收藏页 4 张且新收藏在首位「刚刚收藏」→ 回入局「收藏 4」→ 左滑拿出 → 「拿出收藏 · 还有 3 个」）。注意：`jumpTo` 会按索引重建数据，所以接缝一致性必须用导航而不是 jump 串联验证（已写进复核方法）。未独立复核：代理声称的键盘操作、复制失败反馈、权限五态的逐一点击（coverage 截图里五态画面都在）。
- **SC06 内衬**（代理构建，主负责人复核）：**已运行 · 已检查静态视觉 · 已观看核心动效抽帧 · 已检查接缝交互**。主负责人亲自跑过：`review-check.sh SC06`（构建通过、coverage 49/49 无错误、泄漏 0、禁用词 0）、`widths.cjs SC06`（overflow 空）、`review-sheet.py SC06`（29 张通读）、`motion-1` / `motion-3` 帧序列通读；接缝走导航验证（`.build/sc06-seam`：入局右滑 菜狗羽毛球拼局 → 「收进收藏 · 共 4 个」→ 设置「4 个局」→ 收藏口袋 4 张且新收藏在首位 → 我的局 → 回入局「收藏 4」→ 左滑「拿出收藏」→ 设置「3 个局」）。未独立复核：拉链拖拽阈值（≥45% 补完）、系结手势、剪标确认的两半分离。
- **SC07 墨水屏**（代理构建，主负责人复核）：**已运行 · 已检查静态视觉 · 已观看核心动效抽帧 · 已检查接缝交互**。主负责人亲自跑过：`review-check.sh SC07`（构建通过、coverage 49/49 无错误、泄漏 0、禁用词 0）、`widths.cjs SC07`（overflow 空）、`review-sheet.py SC07`（25 张通读）、`motion-1` 帧序列通读（整块反相 → 灰态按行变黑可见）；接缝走导航验证（`.build/sc07-seam`：「收藏 3」→ 右滑 菜狗 → 「收藏 4」→ 设置「4 个局」→ 收藏页 4 条且菜狗在首位 → 我的局 → 回入局 → 左滑拿出 → 设置「3 个局」）。未独立复核：`.scrub` 冻结与 `replay()`、方块开关逐类点击。
- **SC01 登记表**（代理构建，主负责人复核）：**已运行 · 已检查静态视觉 · 已观看核心动效抽帧 · 已检查接缝交互**。主负责人亲自跑过：`review-check.sh SC01`（构建通过、coverage 49/49 无错误、泄漏 0、禁用词 0）、`widths.cjs SC01`（overflow 空）、`review-sheet.py SC01`（20 张通读）、`motion-1` 帧序列通读；接缝走导航验证（`.build/sc01-seam`：「收藏 3」→ 右滑 菜狗 → 「收藏 4」→ 设置「4 个局 · 最近 · 菜狗羽毛球拼局」→ 附表 2 收藏 4 条且菜狗为 01 → 我的局 → 回入局 → 左滑拿出 → 设置「3 个局」）。未独立复核：撕角拖开确认、关键帧负延迟 scrub、减少动态直出。
- **SC09 软体**（代理构建，主负责人复核）：**已运行 · 已检查静态视觉 · 已观看核心动效抽帧 · 已检查接缝交互**。主负责人亲自跑过：`review-check.sh SC09`（构建通过、coverage 49/49 无错误、泄漏 0、禁用词 0）、`widths.cjs SC09`（overflow 空）、`review-sheet.py SC09`（20 张通读）、`motion-1` 帧序列通读（软体膨胀成页、收缩返回）；接缝走导航验证（`.build/sc09-seam`：「收藏 3」→ 右滑 菜狗 → 「收进收藏 · 共 4 个」→ 设置「4 个局 · 最近 · 菜狗羽毛球拼局」→ 收藏页 4 条且菜狗在首位 → 我的局 → 回入局「收藏 4」→ 左滑拿出 → 设置「3 个局」）。未独立复核：软球开关过冲、保存脉冲的 scrub、城市竖排软体选中。
- **SC05 冰箱门**（主负责人亲自）：**已运行 · 已检查静态视觉 · 已观看核心动效抽帧 · 已检查交互与状态**。看过的接触表：`.build/sc05-cap1…cap8`（首页、名片 lift、资料编辑 → 验证码错 / 对 → 保存 → 贴回、收藏取下 / 放回 / 清空 → 空态、外观半高面板预览 / 贴上、记录详情 → 出席异议 → 保存、举报详情 → 补充 → 处理中、帮助 / 隐私 / 账户退出与重新开始 / 关于 / 规则、长文本变体、保存失败重试、校验失败、城市无结果与切换、权限拒绝 / 不支持 / 已连接、未保存返回确认、入局滑动四种情形、只看收藏、接缝详情、我的局收藏切换与举报填写 → 回执 → 查看进度）；`coverage` 49/49 无错误。修过的缺陷：门的退后态类名 `.back` 与返回按钮撞名导致门塌成 40px（改 `.lifted`）；名片长邮箱与角标重叠（值截断）；传单标题断行（`text-wrap:balance`）；收藏关系标签压住标题（移入文字行）；lift 起点为空白矩形（加 `.carry` 层）；外观预览看不见门（半高面板）；白板 / 铁盒整件只能进一个页（改为逐行目标）。
- 工具缺陷：`capture.cjs` 的 drag 以前不滚动目标到视口内（已修，`scrollIntoView`）。

## H. 接手后的前三至五项动作
1. **完成或复核试点**（目标：SC02、SC05 各自通过契约 §9 完成定义）。读：`settings/spec/builder-brief.md`、`concept-contract.md`、`settings/concepts/src/SC02.dc.html` / `SC05.dc.html`、`settings/evidence/SC02|SC05/`。依赖：无。不可改：`settings/src/core/*` 的 API 形状（改了要对已建方案重跑 coverage）、原始附件、上一轮 `concepts/`。完成标准：coverage 全部状态 0 错误；7 类证据齐；三个核心动作帧序列可看；收藏接缝三处一致。
2. **把试点经验写进契约 §10**，然后用 `builder-brief.md` 启动其余八套（SC01 / SC03 / SC04 / SC06 / SC07 / SC08 / SC09 / SC10）。完成标准：每套汇报含 10 条自检；主负责人逐套看 `home.png`、`dense.png`、三个 `motion-*/sheet.png`。
3. **共享构建与画布**：`node settings/src/build.js` → 独立画布；`settings/concepts/project/*` → Design 画布（`canvas.json` + 十个画板，一次只发送新文件）。
4. **覆盖与动效附录**：生成 `settings/spec/coverage.md`（10 × 49 状态）、`settings/spec/motion-specs.md`（汇总 `settings/spec/motion/SCNN.md`）；写 `settings/spec/limits.md`（环境限制：无 GPU、无真机、Design 画布容器内不可渲染）。
5. 每个里程碑后更新本文并提交推送到 `claude/new-session-ix9g6p`。

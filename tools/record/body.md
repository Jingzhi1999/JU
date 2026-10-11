# JU「我的局」十套视觉与动效方案 · 项目记录（唯一主入口）

> 本文件是本项目唯一的主记录文档。辅助文件（研究台账、规格、证据截图、代码）在本文各节中注明位置与关系。本文由 `tools/record/build-record.py` 从 `tools/record/body.md`（手写正文）与仓库内数据生成；修改正文请改 `body.md` 再重新生成，不要直接改本文。
> 记录原则：只写有材料可核实的内容；代理（子任务）自报而主负责人未复核的内容标注「代理自报」；用户尚未审阅的内容不写成「已认可」。

---

## 0. 当前现场与继续工作入口

| 项 | 内容 |
|---|---|
| 最后更新 | {{NOW}}（容器时钟为 UTC；用户时区未知） |
| 当前有效版本 | git 分支 `{{BRANCH}}`，HEAD `{{HEAD}}`（远端 origin 同名分支；见 §6 的提交列表与未提交项） |
| 工程目录 | `/home/user/JU`（云容器内的仓库克隆；容器是临时的，**只有已 push 的内容可迁移**） |
| 交付入口 1 | Design 画布（claude.ai Artifact）：https://claude.ai/artifact/D36UTTJnXUnfpN5praq1Av — 目前只发布了入口画板 `Main.dc.html`（十套索引）；C01/C04 画板**尚未发布**到画布（文件在 `concepts/project/`） |
| 交付入口 2 | 独立评审画布 `JU-My-Ju-Fable51-10-Concepts.html`（仓库根；由 `node src/build.js` 生成；当前只含已完成的方案源文件：{{SRCS}}） |
| 预览 / 启动 | 直接用浏览器打开 `JU-My-Ju-Fable51-10-Concepts.html`（总览 / 方案 / 对比 / 附录四个视图，`#concept/C01` 直达）；字体来自 Google Fonts（离线时退回系统字体）。无需安装；Node 22 + Playwright（已预装于容器）仅用于构建与截图验证 |
| 构建 | `node src/build.js`（写 `concepts/project/*.dc.html`、`canvas.json`、`Main.dc.html` 与独立画布）；私有构建 `JU_STANDALONE=<path> node src/build.js`（并行开发用，不写共享文件） |
| 验证工具 | `node tools/capture.cjs <CODE> <outdir> '<actions json>'`（操作并抽帧，生成 sheet.png + log.json）；`node tools/coverage.cjs <CODE> <outdir>`（跳转全部 50 个索引状态截图）；两者支持 `JU_STANDALONE` |

### 0.1 本轮任务范围与目标（来自用户简报，摘要）
- 只做「我的局」：我参加的 / 我发起的两个身份及其局内详情、管理、弹层、票件、状态变化与返回；不做发现页、入局 / 开局流程、登录、真实接口。
- 交付**十套**完整可操作的视觉与动效方案（不是先交三套静态图）；每套覆盖共同状态清单；十套之间在六个维度上有真实差异。
- 本轮优先级：第一眼吸引力与层级 > 材质 / 运动 / 空间连续 > 同方案内一致性 > 十套差异 > 本地可操作性。
- 研究至少 50 个真实案例（五类配额），每例有可核验证据；设计师品牌指创作者的具体作品（不是轻奢 / 潮牌 / 营销品牌）。
- 打印 / 撕票 / 燃烧必须完整呈现阶段；所有关键动作有开始、过程、落点；物件连续。
- 用实际截图 / 录屏核验；不以源码存在、构建成功、测试数量作为视觉合格证据；不自评高分。

### 0.2 工作状态总表

| 状态 | 事项 |
|---|---|
| 已完成（有材料） | 附件语义抽取（`spec/extracts/*.md`）；共同状态清单 `spec/state-inventory.md` + 数据规格 `spec/ju-data.spec.md`；共享运行时 / 数据引擎 / 动效工具 / 评审面板 / 构建与截图工具；十套方向卡与差异矩阵 `spec/directions.md`；实现契约 `spec/concept-contract.md`（含试点经验 §10）；研究台账 `research/ledger.md` + `ledger.json`（94 例）+ 证据 `research/evidence/`；试点 C01 票据卷、C04 夜玻璃两套源文件及其自验证据 |
| 进行中（后台） | 工作流 `wf_e040b27e-e9f`（脚本 `tools/workflow-build-concepts.js`）：阶段 Map（为十套写 `spec/concept-refs.md` 参考映射）→ Build（C02 C03 C05 C06 C07 C08 C09 C10 八套并行私有构建）→ Review（十套各一轮独立截图评审，含 C01/C04）→ Fix（最多两轮）。启动于 2026-10-11 00:3x UTC；结果写入 `concepts/src/`、`spec/motion/`、`evidence/<CODE>/review-N.md`。本文件生成时其进度**无法从本文核实**，以仓库文件为准 |
| 受阻 / 失败 | 无硬性阻塞。已知限制：设计画布（claude.ai）无法在容器内渲染，只能用独立画布做截图验证；容器评审画布无 GPU（SwiftShader），性能不代表真机；Dribbble 页面可截图但部分站点（awwwards、behance、tympanus、ssense、metmuseum）在本网络被拒 |
| 未开始 | 十套全部通过评审后的主负责人复审；把十套画板发布到 Design 画布；附录（差异矩阵 / 动效分段汇总 / 覆盖矩阵 / 限制）；最终独立画布构建与推送；最终答复 |

### 0.3 当前具体位置
- 已有可操作方案：C01（`concepts/src/C01.dc.html`，{{SIZES}} 内见大小）与 C04；两者在主负责人补丁后的核心上重新跑过 `tools/coverage.cjs`：50/50 状态可到达、0 错误（主负责人于 2026-10-11 00:2x UTC 实跑，`evidence/C01/coverage-v2/`、`evidence/C04/coverage-v2/`）。主负责人**只亲眼看过**两套的参加者 / 局主首屏四张图（`evidence/C0x/joined-home.png`、`hosted-home.png`）；其余截图与动效帧为试点代理自报，尚未复核。
- 其余八套：方向卡已定（§3），源文件尚不存在，正在由后台工作流构建。
- 用户**尚未审阅任何一套**。

### 0.4 当前最重要的问题
1. 十套的视觉质量是否达到用户要求，目前只有代理自验与主负责人对首屏的初步观察；需要主负责人逐套看详情、管理页、打印 / 撕票 / 燃烧帧序列。
2. 并行构建对共享核心的依赖：若评审 / 修复阶段再改 `src/core/*`，需要对十套重跑 coverage。
3. Design 画布尚未承载十套；发布需要在全部构建后进行（每套一个画板，`concepts/project/CNN.dc.html` + `canvas.json`）。

### 0.5 下一个应执行的具体动作
1. 等待工作流 `wf_e040b27e-e9f` 完成；读取其返回（每套的 missing / reviews / blockers），对未通过的方案按评审报告安排修复。
2. 主负责人逐套打开 `evidence/CNN/` 的 sheet.png 复核（至少：两张首屏、detail、manage、print / tear / burn 帧），并用 `tools/capture.cjs` 自行抽查两条流程；记录结论到本文 §7。
3. `node src/build.js` 生成最终独立画布；把 `concepts/project/C01–C10.dc.html` 与更新后的 `canvas.json` 发布到 Design 画布；在独立画布附录中嵌入 `spec/directions.md`、`spec/motion-specs.md`、`spec/coverage.md`、`research/ledger.md`、`spec/limits.md`。
4. 提交并推送；最终答复先给画布链接，再按套说明核心差异与最值得体验的动作。

---

## 1. 用户要求、设计边界与方案状态

### 1.1 本轮真正有效的用户要求（原文要点，按对话顺序）
1. 开场简报（任务全文）：十套完整可操作的「我的局」视觉与动效方案；只做「我的局」范围；研究 ≥50 例；十套差异矩阵；打印 / 撕票 / 燃烧完整呈现；统一评审入口；最终交付主画布 + 研究附录 + 设计与覆盖附录。对 v3（Opus 5.5 最新版）与 v2.1（上一版）的视觉与动效「非常不满意」，两版都不是审美基线。
2. 「不要把我的要求改写成主要做减法 / 只调留白 / 重点先修功能」；「不要先交三套静态图」；「不要十套都是纸票叠放，也不要十套都是冷感黑白时装网站」；「不要把要求收敛成无特征的极简白底 UI」。
3. 设计师品牌：Junya Watanabe、Yohji Yamamoto、Rick Owens、Ann Demeulemeester、Maison Martin Margiela 只是举例，要主动拓展更多创作者与时期；**不要再用 Acne Studios、Gentle Monster 充当这一类别的核心样本**；研究具体作品（结构、比例、材料张力、层叠 / 露出 / 遮蔽、空间关系、系列节奏），不等于商品网格；不把这一方向简化成「暗黑、黑白、粗粝、大字号」。
4. 产品定位：面向在美国生活的年轻华人，帮助真实线下相聚；年轻、有生活感、轻但靠谱；活动名、时间、地点、角色与下一步必须自然可读。
5. 额度：「如果四小时额度用完了，就等四小时继续启动，一直重复直到完成」。
6. 记录文档：维护 `JU-MY-JU-PROJECT-RECORD.md` 作为唯一主入口；按实际材料记录，不把口头汇报当验收；文档工作不替代主任务，也不代表设计已通过视觉验收；不额外授权推送 / 部署 / 重置（主任务仍按此前授权继续）。
7. 用户问「为什么报错停掉」：原因是主负责人的一次回复被安全分类器拦截（非工具 / API 错误），已答复；无需用户操作。

### 1.2 用户明确认可的内容及保护范围
- **无**。截至本文更新，用户没有审阅或认可任何一套方案、任何截图或任何动效。本文中所有「完成」均为实现状态，不是验收状态。

### 1.3 用户明确否定的方向与反馈
| 否定项 | 出处 | 对本轮的约束 |
|---|---|---|
| v3-Opus55 与 v2.1 评审画布的视觉与动效 | 开场简报 | 其视觉、层级、卡片构造、材质、背景、动效、布局都允许重设计；只保留产品语义与范围依据 |
| 用 Acne Studios / Gentle Monster 代表「设计师品牌」 | 简报 §04 | 研究台账中未使用两者（已核：`research/ledger.json` 无此二者） |
| 「主要做减法 / 只调留白 / 先修功能」的解读 | 简报 §01 | 方向卡要求每套在构图、字体、组件、材质、过渡、核心动作六维上重新设计 |
| 先交三套静态图再做其余 | 简报 §01 | 本轮直接并行构建十套可操作方案 |
| 用 alert / 空白弹层 / 按钮缩放 / 跳转旧稿代替结果 | 简报 §02 | 契约硬规则；评审脚本检查 |
| 背景快速循环渐变 / 漂浮粒子 / 持续晃动 | 简报 §07 | 契约硬规则 |
| 自评「9.8/10」等分数 | 简报 §11 | 本文与最终答复不给自评分 |

### 1.4 已实现但尚未经过用户审阅的内容
- C01 票据卷：`concepts/src/C01.dc.html`，规格 `spec/motion/C01.md`，证据 `evidence/C01/`（详见 §3.1）。
- C04 夜玻璃：`concepts/src/C04.dc.html`，规格 `spec/motion/C04.md`，证据 `evidence/C04/`（详见 §3.4）。
- 共享系统（运行时、评审面板、数据引擎、动效工具）、独立画布外壳、Design 画布入口画板。
- 研究台账 94 例（§2）。

### 1.5 模型暂定建议与未完成的方案比较
- 十套方向的选择（§3 的方向卡）是主负责人的暂定判断：在 20 个候选方向（含「地图 / 城市」「聊天线程」「霓虹夜店」「黏土软物」等）中选定 10 个，淘汰理由：地图方向与「下一步要做什么」的信息组织不匹配；聊天线程视觉吸引力弱；霓虹过于主题化；黏土与桌面 / 贴纸方向在材质上重叠。未做用户确认。
- 燃烧实现方式：从「整元素位移滤镜」（文字会变形，`tools/test/fx/sheet.png` 第 3 行可见）改为「SVG mask 内置粗糙圆孔 + 余烬描边环」（文字清晰，`tools/test/fx/burn.png`）；各方案在此基础上各自调整。
- 局卡 → 详情展开：C00 管线测试用非等比 scale（文字被拉伸，`tools/test/flip/sheet.png` 第 2、9 帧可见）；契约因此要求用 width/height 或 clip-path inset 过渡（C04 已按 clip-path 实现，代理自报）。

### 1.6 已被后续指令取代的旧要求
- 无被取代的用户要求。v3 台账（附件 `224b38db-JU-My-Ju-v3-reference-ledger.md`，30 例 REF01–REF30）与 v3 的 P1–P8 原则属于被否定版本的内部规范，本轮**不作为基线**，仅用于语义核对；其 30 例也未计入本轮 94 例（本轮研究明确排除了它们）。

---

## 2. 研究台账与参考案例

### 2.1 总体
- 位置：`research/ledger.md`（完整文本，含每例 10 个字段、审核校正备注 20 条、落选候选 3 条、访问失败 / 未立案 103 条、跨案例原则 12 条）；`research/ledger.json`（结构化同一数据，字段 id / name / creator / period / url / viewed / observation / translation / evidence / status / category / tags / auditNote）；证据图片 `research/evidence/<slug>/…`（仓库内为 1200px 宽 JPEG 缩版，共 324 个被台账引用的文件；原始 PNG 约 195 MB 留在容器临时目录，**不随仓库迁移**）。
- {{RESEARCH_COUNTS}}
- 方法：8 个「发现」代理按五类分头检索，用 Playwright 对原始页面截图 / 抽帧（`research/tools/shot.cjs`，容器临时目录），再由「审核」代理逐条打开证据图核对观察与来源真实性（默认拒绝）；两轮补足；最后由一个代理按统一格式写台账。**主负责人复核程度**：核对了总数与分类、证据文件全部存在、抽查了前三条与 Rick Owens 一条；未逐条复核 94 条观察的准确性。
- 判定口径：`已看动效` = 抽帧 / 录屏中界面确有变化并记录了帧位；`仅核验静态` = 只看到静态页面。同一项目的多页只算一例；访问失败不计入。
- 原任务指定入口（A Magazine Curated By — Margiela / Yohji、Yohji Yamamoto Collection、Rick Owens Runway Shows）：只有 Rick Owens 秀页进入了台账（REF67，PORTERVILLE FW24）。A Magazine 两期与 Yohji 官网系列页**未作为独立案例立案**（主负责人在环境测试时截过 A Magazine Margiela 页，`tools`/临时目录，未进入台账）；这是本轮研究的一个缺口，若需要可补做。
- 与方案的关系：每套方案的 5–8 例映射（≥3 类来源）由后台工作流 Map 阶段写入 `spec/concept-refs.md`；写入前本表「对应方案」列为「待映射」。
- 排除项：Acne Studios、Gentle Monster 与 v3 台账 30 例均不在本轮 94 例内。

### 2.2 跨案例可复用原则（台账 §五，12 条，摘要）
1 角色分层靠标记不靠分组，人数用中点单行计数；2 状态在原位标注、只给当前状态上色；3 粘性底栏携带「日期 · 状态胶囊 · 主按钮」；4 弹层从触发按钮本身长出来、背景只压暗不换页；5 二级操作原位展开、父层两级压暗、局卡→详情共享图层连续放大；6 票根有固定解剖（顶部缺口 + 头带 + 标签 / 值栅格 + 底部码板）；7 撕票与换态用裁切边扫过、参差锯齿、文字位置不动；8 出票与庆祝有节奏（遮挡推出分 3–4 个停顿）；9 到场凭证用「盖章」不用勾选框；10 改期对照用网格或旧空心新实心的时间线；11 标题三级比例约 30:20:16 与中文混排规范；12 历史区归档用同尺寸封面格 + 说明行。完整文字见 `research/ledger.md` §五。

### 2.3 全部案例（{{RESEARCH_COUNTS}}）
{{RESEARCH_TABLE}}

### 2.4 落选与失败
- 落选候选 3 条（有证据但观察与证据不符）与访问失败 / 未立案 103 条，逐条见 `research/ledger.md` 附录 A / B。典型失败：awwwards.com 连接被重置、behance.net 403、tympanus.net 403、ssense.com 403、metmuseum.org 429、部分 404 slug。失败项**不计入** 94 例。

---

## 3. 十套方案的视觉、材质与动效规格

方向卡、六维差异矩阵与物件 / 数字之分见 `spec/directions.md`（主负责人撰写，是设计意图，不是实现记录）。以下按实际状态记录；未开始的方案只保留方向卡要点，不虚构参数。

### 3.1 C01 票据卷（已实现 · 代理自报 · 主负责人仅看过首屏）
- 源文件 `concepts/src/C01.dc.html`；规格全文 `spec/motion/C01.md`（代理撰写）；证据 `evidence/C01/`：{{EVIDENCE_C01}}。
- 视觉（当前代码值，来自规格）：字族 Noto Sans SC 400/500/700 + DM Mono 400/500（只两族）；时间 28px DM Mono 500（票面 40px），局名 20px/1.3（lead 21px/700，详情 24px/700），日期 / 地点 13.5px，状态点阵 12px DM Mono 字距 .06em，回单头 11px 字距 .14em；色板：纸 #f3efe6 / 阴面 #e9e4d8 / 墨 #1b1a18 / 灰墨 #5f5a51 / 淡墨 #9a9388 / 红印 #b3301f / 机壳 #242229–#302d36–#17161b / 出纸口 #09080b / 焦炭 #271e19–#3a2e26 / 余烬 #ff7a1a。构图：机壳顶板 96px（铭牌 + 两卷身份拨杆）→ 出纸口 → 342px 纸带居中可滚动 → 底栏 48px 存根槽。层级：第一眼大号 mono 时间 + 粗体局名；第二眼点阵状态行（反白 / 描边 / 点线灰 / 虚线淡 / 红描五态）；第三眼组名与说明。
- 材质：热敏纸横向条纹 `repeating-linear-gradient` + 左右 6% 边缘暗化；纸边 1px 暗线 + 24px 下落阴影；齿孔 9px 节距点线 + 两侧半圆缺口；票 = 2.5px 墨边框一截纸 + 2px 点线齿孔副券；机壳哑光深灰 + 竖向拉丝；撕口 34 段 ±4.2px 纤维轮廓 + 1.6px 亮纤维带 + 5px 软阴影；焦边 feTurbulence 置换。主负责人观察（首屏两张）：纸面与机壳的明暗对比成立，大号时间与局名形成主次，状态点阵行可读；未核验详情与票面。
- 动效（代理自报的当前代码值）：① 走纸打印 2200ms×k，三段走纸两次停顿（`c01-feed3`，linear 分段），印头 10px 暗渐变，打印中副券不可点；② 撕票：副券右端按下，`p = clamp((−dx + 1.15dy)/175)`，阈值 0.55，回弹 220ms；落下 820ms `cubic-bezier(.45,.02,.75,.5)` 旋转 12→−26°、rotateX 0→70°、scale .68 到底栏存根槽；主票 250→184px 底边锯齿；300ms 后联系层打印；③ 焦卷作废 2600ms（票）/ 2800ms（活动条）`cubic-bezier(.35,.05,.5,1)`：mask 圆孔 0→reach（`#fx-rough-strong` 毛边）+ 16px 炭圈 + 5px 余烬线（80% 后淡出）+ 10 粒纸灰落向底栏；烧尽后折叠为 0 高，原位出现焦炭残片 `.c01-char`。其余：共享元素展开 420ms `cubic-bezier(.2,.8,.2,1)`、身份切换 430ms 收卷 + 520ms 出卷、便签 380ms、回执 420ms/2.6s、印章 560ms、草稿删除 360ms + 撤销条 10s。
- 验证分级：已写代码 ✔；已运行 ✔（主负责人 coverage-v2 50/50，0 错误）；已检查视觉：主负责人仅首屏两张 ✔，其余代理自报；已检查完整动效：代理自报（`evidence/C01/print|tear|cancel|…/sheet.png`），主负责人未看；已检查交互：代理自报；用户已认可 ✘。
- 已知偏差：规格 §4 说在面板外加了一条「C01 本地演示」失败按钮——契约随后改为面板内置「下一次保存失败」，评审阶段应移除重复控件；代理自报「无种子场景能在确认时成局」——核心数据已改（brunch 容量 3），需确认 C01 已走通出票分支。

### 3.2 C02 站牌（未开始 · 方向卡）
深色机械翻牌板：行式翻牌（时间 · 局名 · 状态牌），Unbounded 700 数字 + Noto Sans SC 700；翻片 #1d2024 上下受光差、板面 #121417 细噪点；磁条卡票件；行翻开成面板；核心动作：状态翻牌、过闸撕票（插卡 → 吞半 → 读卡灯 → 吐打孔卡）、过热作废（磁条焦黑、塑料起泡、牌面翻成「取消」）。参数待实现后记录。

### 3.3 C03 刊（未开始 · 方向卡）
杂志目录 → 跨页：Noto Serif SC 700 局名 26–34px + Instrument Serif 页码；铜版纸 #f7f5f0、墨 #111、校对红 #c8102e；3D 翻页（折线在书脊）；撕角券；烧页（焦洞扩大、灰屑、焦边页框留在历史）。参数待实现后记录。

### 3.4 C04 夜玻璃（已实现 · 代理自报 · 主负责人仅看过首屏）
- 源文件 `concepts/src/C04.dc.html`；规格全文 `spec/motion/C04.md`；证据 `evidence/C04/`：{{EVIDENCE_C04}}。
- 视觉（当前代码值）：Noto Sans SC 500 标题 27px 字距 .08em，局名 22/26px，行内 15/16px；Sora 600 倒计时 34/44/40px 字距 −.02/−.03em；眉注 Sora 600 10px 大写字距 .22em 与中文 13px 并置；色板 夜色 #050811/#0a1020/#101a33，文字四级 #f2f5ff α1/.76/.52/.30，强调 #ffc46b（要你回应 / 预留 / 倒计时 / 改期）、#72e6c6（就快见面 / 已确认 / 出席）、#a3b4ff（还在等 / 候补）、#cdb9ff（局主）、作废 rgba(176,188,220,.5)、危险 #ff6f7d；pack 色相六种。背景静止：四片径向色斑 + 五个模糊光斑 + 六个光点，无循环动画。
- 材质：玻璃 `backdrop-filter: blur(14px) saturate(1.35)`，表面 160° 渐变 α.11→.045→.075，顶边 1px 高光 α.34，1px 内边 α.10，底部内阴影（厚度），落影 `0 20px 44px -24px`；lead 板更亮并带 tone 色外发光；厚玻璃（弹层 / 底栏）深色底 α.78–.84 + blur 26px；暗玻璃 / 书脊几乎不透光；通行证更亮玻璃 + 112° 全息三色带（screen 混合，静止）；景深按 `--z` 1/.975/.95 缩放，远层物件 blur .8/1.6px、变暗，文字始终清晰；进入详情时首页 `scale(.93) blur(10px) brightness(.5)`。主负责人观察（首屏两张）：第一眼主角明确（最前玻璃板 + 琥珀倒计时 + 金色 CTA），中文在玻璃上清晰；**问题**：底部固定导航压住列表最后一项（参加者首屏「还在等」组被导航遮住），需要底部安全区（已写入契约 §10 底部导航条款，待评审修复）。
- 动效（代理自报）：① 景深展开：`clip-path: inset(板矩形 round 18px)` → `inset(0)`，内层 `translateY(from.y − 44px)` → 0，背景 scale 1→.93 / blur 0→10px / brightness 1→.5，480ms `cubic-bezier(.2,.8,.2,1)`，返回 400ms，落点高亮 1.4s；② 裂开撕票：副券按住下拖 `p=(dy+.25dx)/120`，`JU.fx.tearClip`（n=14, amp 3.2）把直线齿孔换成折线，裂纹 `stroke-dashoffset` 随 p 揭示，阈值 .55，回弹 420ms `cubic-bezier(.2,1.25,.3,1)`；碎裂 7 块 `c04-shard` 720ms `cubic-bezier(.4,0,.75,.4)` 每块延迟 85ms，位移 120–210px、旋转 ±22°；820ms 后联系层 460ms 弹起；③ 碎裂作废：从一点起裂纹 → 18 块径向碎片逐块坠落 → 带裂纹的空框残留 → 历史中变成暗色薄片（具体时长见 `spec/motion/C04.md` §2③）；另有通行证三段显现（出票）。
- 验证分级：已写代码 ✔；已运行 ✔（主负责人 coverage-v2 50/50，0 错误）；已检查视觉：主负责人首屏两张 ✔（含上面的导航遮挡问题）；完整动效 / 交互：代理自报（`evidence/C04/card-detail|flow-tear|flow-exit|host-cancel|…/sheet.png`）；用户已认可 ✘。
- 代理自报的限制：通行证指针倾斜为 12px 步进的状态驱动；无实时倒计时（`JU.NOW` 固定）。

### 3.5 C05 缝线（未开始 · 方向卡）
白坯布裁片 + 粉线 + 四针白标：Noto Serif SC 300/500 局名 24px + Cormorant 数字，粉线标注 Zhi Mang Xing；坯布极细 feTurbulence 纹理、缝线虚线 + 针脚阴影、吊牌卡纸 + 棉线；裁片沿折线 3D 翻开；核心动作：翻开裁片、断线撕票（棉线拉紧绷断回弹）、布面烧焦（起毛、焦黑、灰线轮廓）。

### 3.6 C06 桌面（未开始 · 方向卡）
俯视桌面物件（票根、拍立得、便签、杯垫）重叠、最急的摆正在最上；Noto Sans SC 700 + Space Mono，批注 Ma Shan Zheng；物件厚度边 + 接触阴影 + 半透明纸胶带；拿起 = 旋转校正 + 放大 + 阴影随高度；核心动作：拿起放下、桌上撕票（副券留在桌面）、烟灰缸（烧到剩灰和一片未燃尽的角）。

### 3.7 C07 格盘（未开始 · 方向卡）
权重网格仪表盘（要你回应 2×2、就快见面 2×1、还在等 1×1）；Noto Sans SC 600 + DM Mono；分区色 暖橙 / 青绿 / 灰蓝；格子 FLIP 膨胀到整盘并内部分格；核心动作：格子重排、刮落撕票（像素列脱落）、像素作废（逐块脱落变灰合成历史灰格）。

### 3.8 C08 时间尺（未开始 · 方向卡）
左侧 56px 竖直时间尺 + 当前线，块高 = 时长、块 y = 时间，状态用描边 / 填充 / 票状区分；Archivo Narrow 刻度 + Noto Sans SC 500；块横向展开成详情、尺不动；核心动作：改期沿尺滑动（旧位淡影、新位打印）、拖出撕票、尺上作废（焦痕刻在尺上）。

### 3.9 C09 影印贴纸（未开始 · 方向卡）
A5 zine 页 + 荧光贴纸（#ff4fa3 / #f1ff3b）+ 影印颗粒；ZCOOL QingKe HuangYou 局名 36px + Noto Sans SC + Liu Jian Mao Cao 手写；贴纸撕起露出下一层；核心动作：撕贴纸、剪票（沿剪刀线锯齿）、影印烧（发黑卷边、贴纸烧成黑点）。

### 3.10 C10 胶片（未开始 · 方向卡）
横向 35mm 底片条（齿孔、帧号），曝光程度 = 状态，灯箱里的当前帧最亮；Noto Sans SC 500 + Space Mono，红蜡笔批注 Long Cang；帧放大像相纸显影；核心动作：显影出票（影像从无到有）、剪底片（裁刀沿帧边）、胶片熔穿（起泡、熔穿、卷边、帧框变黑）。

### 3.11 十套差异矩阵
见 `spec/directions.md` 末尾（构图 / 字体 / 组件 / 材质 / 过渡 / 核心动作六列）；物件启发 C01 C02 C03 C05 C06 C09 C10，原生数字 C04 C07 C08；第一眼鲜明 C02 C04 C09 C10，构造细节成立 C01 C03 C05 C08，介于其间 C06 C07。已实现的 C01 与 C04 在六维上全部不同（纸带 / 玻璃叠、mono 时间 / Sora 倒计时、打印段 / 玻璃板、热敏纸 / 毛玻璃、走纸 / 景深、焦卷 / 碎裂）。

---

## 4. 共享系统（所有方案依赖）

| 文件 | 作用 | 状态 |
|---|---|---|
| `src/runtime/preact.min.js`（10.24.3，MIT）+ `src/runtime/dc-mini-runtime.js` | 在独立画布内渲染 `.dc.html` 画板（`{{holes}}`、`sc-if`、`sc-for`、on* 事件、ref、SVG 属性大小写修正、`@property` 注册、Shadow DOM 隔离） | 已实现并通过 `tools/test/smoke.cjs`（文本 / 列表 / 条件 / 事件 / 过渡 / 字体）；**不是**官方 Design 画布运行时，官方画布用其自带 `support.js` |
| `src/core/ju-data.js` | 演示数据（人物、26 个事件、参加者 / 局主项、草稿、8 个变体）、派生模型（`derive.joined/hosted/manage/rowById`）、业务引擎（`engine.*` 纯函数返回 `{data, effect}`）、共享文案 `RULES/COPY/STAGE/GROUPS`、50 条状态索引 `INDEX` | 已实现；主负责人用 Node 跑过转移测试（审核 / 改期 / 取消 / 散场 / 出席 / 撕票 / 改期接受 / 草稿删除撤销 / 全部变体） |
| `src/core/ju-review.js` | 评审面板 mixin：速度 1×/0.5×、减少动态、暂停、关键帧滑杆、可暂停定时器 `after`、`motion`/`replay`/`beforeReplay`、`reset`、变体、`jumpTo→applyJump`、`armFail` | 已实现；面板交互在 C00 管线测试中验证（`tools/test/sa-concept.png`） |
| `src/core/ju-fx.js` / `ju-fx.css` / `ju-fx.svg` | 几何（撕裂轮廓、clip 多边形、矩形测量、散落）、CSS 原语（`.fx-burn` SVG-mask 燃烧、`.fx-printer` 走纸、`.fx-stamp`、`.fx-tear`、`.fx-ash`、`.rm/.paused/.scrub`）、SVG 滤镜（粗糙置换、颗粒、墨迹、余烬渐变） | 已实现；主负责人在 C00 上抽帧验证（`tools/test/fx/sheet.png`、`burn.png`） |
| `src/core/ju-panel.html` / `ju-panel.css` | 评审面板模板与样式（手机画面外） | 已实现 |
| `src/build.js` | 注入核心 / 面板 / 动效到各画板，生成 `concepts/project/*.dc.html`、`canvas.json`、`Main.dc.html`、独立画布；支持 `JU_STANDALONE` 私有输出 | 已实现 |
| `src/shell/*` | 独立画布外壳：总览（十套参加者 / 局主首屏预览）、方案（全尺寸 + 面板）、对比（2–3 套同状态）、附录 | 已实现，仅在 C00 / C01 / C04 上检查过 |
| `tools/capture.cjs` / `tools/coverage.cjs` | 操作抽帧 / 全状态截图 | 已实现并使用 |
| `concepts/src/C00.dc.html` | 管线测试与模式示例（非交付） | 保留 |

---

## 5. 工程与代码状态

### 5.1 代码地图
```
JU-My-Ju-Fable51-10-Concepts.html   独立评审画布（构建产物；提交到仓库）
JU-MY-JU-PROJECT-RECORD.md          本文（由 tools/record/ 生成）
concepts/concepts.json              十套元数据（编号、名称、一句话、三个核心动作、备注）
concepts/test.json                  管线测试元数据（C00）
concepts/src/CNN.dc.html            各方案源文件（带 <!-- @panel --> /* @core */ /* @panel-css */ <!-- @fx-svg --> 标记）
concepts/project/                   构建产物：Design 画布用画板 + canvas.json + Main.dc.html
src/runtime | src/core | src/shell | src/build.js
spec/concept-contract.md            实现契约（§0 质量标准 … §10 试点经验）
spec/directions.md                  十套方向卡 + 差异矩阵
spec/state-inventory.md             共同状态清单（前言为主负责人的键名 / 动效族对照）
spec/ju-data.spec.md                数据规格（建议稿；实现以 ju-data.js 为准）
spec/extracts/*.md                  对旧画布的语义抽取（参加者 / 局主 / 数据 / 动效 / 评审）
spec/motion/CNN.md                  各方案规格（当前：{{MOTION_SPECS}}）
spec/concept-refs.md                各方案参考映射（后台工作流生成中）
research/ledger.md | ledger.json | evidence/ | evidence-files.txt
evidence/CNN/                       各方案截图与帧序列（builder 与 reviewer 产出）
tools/capture.cjs | coverage.cjs | workflow-build-concepts.js | test/ | record/
```

### 5.2 分支、提交与未提交
- 分支 `{{BRANCH}}`，HEAD `{{HEAD}}`。最近提交：
```
{{GIT_LOG}}
```
- 生成本文时的工作区状态（`git status --short`）：
```
{{GIT_STATUS}}
```
- 备份：除 origin 远端外无其他备份；容器临时目录（`/tmp/claude-0/.../scratchpad`）中的研究原图、私有构建、工作流日志不可迁移。

### 5.3 集成状态与 Mock 边界
- 全部数据为本地演示数据（`JU.data`），固定时钟 `JU.NOW = 2026-12-17 15:00`；没有真实接口、通知、分享、数据库；所有写入经 `JU.engine` 纯函数修改内存副本；「本机保存失败」由面板按钮一次性触发。
- 独立画布中十套同在一个文档，各自 Shadow DOM 隔离、各自实例与数据；Design 画布中每个画板是独立文档。
- 外部依赖：Google Fonts（css2 链接，离线退回系统字体）；无外部图片；Preact 内联。
- 不可迁移：Design 画布链接属于用户账户；容器内 `.build/` 私有画布、`/tmp` 研究原图与 Playwright 环境。

---

## 6. 验证记录与缺陷

### 6.1 已做验证（主负责人亲自）
| 日期（UTC） | 对象 | 方法 | 结果 / 证据 |
|---|---|---|---|
| 2026-10-10 15:5x | 运行时 | `tools/test/smoke.cjs`（Playwright） | 洞 / 列表 / 条件 / 事件 / 过渡 / DOM 持久 / 字体加载通过；`tools/test/smoke-*.png` |
| 2026-10-10 16:0x–16:3x | 管线（C00） | `tools/test/standalone.cjs`、`fxlab.cjs`、`capture.cjs` | 面板（0.5×、索引跳转、变体）工作；打印 / 撕票 / 燃烧帧序列 `tools/test/fx/`；FLIP `tools/test/flip/sheet.png` |
| 2026-10-10 16:2x | 数据引擎 | Node 脚本 | 转移与变体计数正确（见 §4） |
| 2026-10-11 00:2x | C01 / C04 | `tools/coverage.cjs` 50 状态 | 0 错误，`evidence/C0x/coverage-v2/sheet.png` |
| 2026-10-11 00:2x | C01 / C04 首屏 | 肉眼看 `joined-home.png` / `hosted-home.png` | C01 层级成立；C04 主角明确但底部导航遮挡最后一组 |

### 6.2 代理自报、未经主负责人复核
- C01、C04 的详情 / 管理 / 打印 / 撕票 / 燃烧 / 改期 / 散场 / 草稿撤销 / 空态 / 长标题等帧序列（`evidence/C0x/*/sheet.png`，各目录 `log.json` 自报 errors 为空）。
- 研究台账 94 条观察的逐条准确性（由审核代理核过，主负责人抽查 4 条）。

### 6.3 已知缺陷与问题
| # | 页面 / 状态 | 复现 | 实际 | 目标 | 根因 / 假设 | 修改位置 | 优先级 | 验收 |
|---|---|---|---|---|---|---|---|---|
| 1 | C04 参加者 / 局主首屏 | 打开 C04 默认态 | 固定底栏盖住列表最后一组 | 列表留底部安全区，最后一项可见 | 列表容器无 padding-bottom（假设） | `concepts/src/C04.dc.html` 列表样式 | 高 | 首屏截图最后一项完整可见 |
| 2 | C01 评审面板 | 看面板 | 面板外多一条「C01 本地演示」失败按钮，与面板内置按钮重复 | 只保留面板内置「下一次保存失败」 | 试点早于契约 §10 | `concepts/src/C01.dc.html` 面板包裹层 | 中 | 面板只有一处失败按钮 |
| 3 | C01 / C04 出票分支 | `j-d-invited` → 读完约定 → 确认 | 代理自报原数据无法成局；核心已改 brunch 容量 3 | 确认后成局 → 走出票 | 核心修改后试点未重验 | 两套 `applyJump`/confirm 分支 | 中 | capture：确认后出现打印序列 |
| 4 | 研究 | — | 用户指定入口 A Magazine 两期 / Yohji 系列页未立案 | 补 2–3 例或在附录说明 | 发现代理选择了其他 Yohji / Margiela 档案页 | `research/ledger.*` | 低 | 台账新增或说明 |
| 5 | 全部 | — | 容器无 GPU，帧率 / 流畅度未测 | 真机或桌面浏览器复查长动效 | 环境限制 | — | 低 | 用户侧体验 |

### 6.4 验证分级定义
已写代码 → 已运行（coverage / capture 无错误）→ 已检查视觉（人看过截图）→ 已检查完整动效（人逐帧看过序列）→ 已检查交互（人操作过流程）→ 用户已认可。本文每处「验证分级」按此标注；凡写「代理自报」即表示未达到「已检查」级。

---

## 7. 下一步（优先级最高的五项）

1. **拿到八套并通过评审**（目标：十套源文件齐全、每套至少一轮独立评审无 blocker）。读 / 改：工作流返回、`evidence/CNN/review-N.md`、`concepts/src/CNN.dc.html`。依赖：`wf_e040b27e-e9f`。不可改：`src/core/*` 的 API 形状（改了要对十套重跑 coverage）、`spec/state-inventory.md` 的语义规则。完成标准：十套 `tools/coverage.cjs` 50/50 且 0 错误；评审报告无 blocker。回归：全部十套 coverage。
2. **主负责人逐套复核视觉与动效**（目标：每套看两张首屏 + detail + manage + print/tear/burn 三组帧 + 一条自抽查流程）。读：`evidence/CNN/*/sheet.png`；改：`JU-MY-JU-PROJECT-RECORD.md` §3/§6。完成标准：每套在 §3 有「主负责人观察」与问题清单；发现的 blocker 转修复。
3. **发布与附录**（目标：Design 画布十个画板 + 独立画布附录齐全）。读 / 改：`concepts/project/*`、`canvas.json`、`spec/motion-specs.md`（汇总 `spec/motion/*.md`）、`spec/coverage.md`（清单 × 十套）、`spec/limits.md`、`src/build.js` 附录映射。不可改：画布 URL；`Main.dc.html` 以外的画板文件名。完成标准：画布可见十个画板；独立画布附录四个标签有内容。回归：`tools/test/standalone.cjs` 通过。
4. **修复试点已知问题**（§6.3 #1–#3）。完成标准：对应 capture 序列显示修复后状态。
5. **最终提交与答复**（目标：推送 `{{BRANCH}}`；答复先给画布链接，再按套说明差异与最值得体验的动作；附录链接）。不可改：不创建 PR（用户未要求）。完成标准：远端 HEAD 包含全部交付；本文 §0 更新为最终状态。

---

## 8. 辅助文件索引
| 文件 | 内容 | 与当前实现的关系 |
|---|---|---|
| `spec/concept-contract.md` | 每个方案代理必读的技术 + 质量契约 | 十套实现的共同约束；§10 来自试点经验 |
| `spec/directions.md` | 方向卡 + 差异矩阵 | 设计意图；实现后以 `spec/motion/CNN.md` 为准 |
| `spec/state-inventory.md` + 前言 | 共同状态清单 | 覆盖的依据；键名以 `ju-data.js` 为准 |
| `spec/extracts/*.md` | 旧画布语义抽取 | 仅语义来源，不是视觉基线 |
| `spec/motion/CNN.md` | 每套参数与三个核心动作分段 | 代理撰写，待主负责人复核 |
| `research/ledger.md` / `ledger.json` / `evidence/` | 研究台账与证据 | §2 |
| `evidence/CNN/` | 每套截图与帧序列（builder + reviewer） | §3 / §6 |
| `tools/test/` | 运行时与管线测试产物 | §6.1 |
| 原附件（用户上传） | `d979de84-JU-My-Ju-v3-Opus55-review-canvas.html`、`a5dc7fed-JU-My-Ju-v2.1-review-canvas.html`、`8911a099-JU-My-Ju-v3-visual-motion-review.html`、`224b38db-JU-My-Ju-v3-reference-ledger.md` | 在容器 `/root/.claude/uploads/...`，不在仓库；语义已抽取到 `spec/extracts/` |

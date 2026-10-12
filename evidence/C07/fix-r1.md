# C07 格盘 · 主负责人修复轮 fix-r1（建造者变更记录）

- 输入：`spec/lead-review.md`（C07 两行：高「退出 / 作废结果」、中「次级格」；「全部 · 管理页结构雷同」中）、`evidence/C07/review-1.md`、`review-2.md`（最新、权威：0 blocker / 3 major / 16 minor）。
- 源文件：`concepts/src/C07.dc.html`；私有构建：`JU_STANDALONE=/home/user/JU/.build/C07.html node src/build.js`。
- 覆盖：`fix-r1/coverage/`：50/50 状态，`log.json` errors 为空。本轮 25 个帧序列目录（各含 `sheet.png` + `log.json`，errors 全为空；整尺寸帧 `fNN.png` 按仓库规则只留本地）。`fix-r1/probes.json`：M2 冻结格内容、审核飞入时间线、操作盘竞态、草稿收起几何四组 DOM 探针。
- 命名静帧已从本轮最终构建刷新：`joined-home.png`（coverage j-home）、`hosted-home.png`（h-home）、`detail.png`（j-d-invited）、`manage.png`（申请格阵：阿蒋已邀请、席位带落座、Momo 待审，取自 `lead-apps-review-half/f15`）、`result.png`（主动退出后的结果 + 灰格残骸，取自 `lead-void-exit/f34`）。
- 规格：`spec/motion/C07.md` 已更新，改动的值标 〔fix-r1〕（§1 布局构图 / 材质规则 / 新增「中文排版」行；§2 ① 冻结规则、③ 聚合与释放续播、首次打开；§3 M2 / M4 / M5（重做）/ 成员席位格阵 / M6 / M10；新增 §6）。

## 改动

| 来源 | 发现 | 改动 | 证据 |
|---|---|---|---|
| review-2 M1 | 草稿删除整格一帧消失；撤销时从网格左上角飞出、压在别的草稿上 | 离场 / 删除的格保留最后一次在屏的矩形（不再归零）；删除 = 原槽位 `height 144→0`（内容从下往上被裁）300ms，邻格切到同一条 300ms 曲线补位；撤销 = 同一格原槽位展开、邻格让位、落点描边 | `fix-r1/m1-draft-undo/`（0.5×）；`probes.json → draft`（冬至火锅 top 398 不动，高 144→112→28→8→0；雨天读书局 552→517→428→406→398；撤销反向） |
| review-2 M2 | 收回的详情落进显示写入前状态的冻结格，两层文字重叠、状态回退 | 冻结只冻结布局：盘面位置 / 尺寸 / 分组用 `frozen` 算，格内容用写入后的行按旧尺寸渲染；收回最后的交叉淡化缩到 70ms（370–440ms）；落进 2×1 / 1×1 时 hero 大字先淡掉，只有芯片与面落进格 | `fix-r1/m2-confirm-reflow/`、`m2-confirm-reflow-half/`（0.5×：确认 → 出票 → 返回 → 冻结的 2×2 已写「待撕票 11:30」→ 缩成 1×1，livehouse 升为 lead）、`m2-resched-accept-back/`（接受改期后收回的格已是青绿「待赴约 21:30」）；`probes.json → m2` |
| review-2 M3 | 24px 标题单字孤行、拆《》、拆「局主」；正文两字孤行 | 局名按「 · 」切段、每段 `nowrap`，只在分隔符后换行（超宽单段才段内换行，按格级给 em 上限）；标题 `text-wrap:balance`；正文段落末 5 字绑定（Chromium 的 `pretty` 不管中文孤字，已探针确认）；通行证 meta 三段各自 `nowrap`、最多 3 行 | `fix-r1/m3-titles/`（「周四 Livehouse · / 散场后吃宵夜」「外百老汇小剧场 · / 一起看《海鸥》」、通行证「威廉斯堡 · / 集合 19:20 门口 · / 局主 你」、取消盘「成员不 / 计主动退出。」→ 整句、长标题变体） |
| lead「全部」中：管理页结构雷同 | 申请审核是十套共有的行列表，只换了材质 | **构图**：申请区是展开层里一块凹下的子格盘，盘里是申请格阵——第一份待审 = 2×1 整面橙格（大头像、17px 称呼、认证、15px 留言），其余 = 1×1 淡橙格，奇数补一格虚线说明格；盘顶吸附「席位带」（滚到第 4–6 份申请也在视野）。审核模式下申请盘紧跟 hero，局卡移到盘下。**动作形态**：每格底边是分成两键的键条「谢绝 \| 发出邀请」；按下 → 键内像素步进 → 被选键横向长满整条、另一键收为 0，键面原位变结果（青绿「已发出邀请 · 等对方确认」/ 灰「已谢绝 · 对方会看到「这次没留住」」），整格退出待办色，不移位；邀请时申请人的头像像素飞进席位带第一个空位（560ms），落地那一帧席位变预留、「预留 · 空」换值。语义全保留：称呼（空 → 未填称呼）、认证胶囊、留言、申请于…、谢绝 / 发出邀请、原位结果、待审 −1 / 预留 +1 / 空 −1、组头「已处理 N」、hero 状态、失败原位红条 + 重试 | `fix-r1/lead-apps-review-half/`（0.5×：邀请 → 处理中 → 键长满 → 飞入 → 落座；谢绝 → 灰键）、`lead-apps-pending/`（6 份申请：1 个 2×1 + 5 个 1×1 + 说明格，滚动后席位带吸顶，对 1×1 邀请 / 谢绝）、`lead-apps-fail-retry/`、`lead-apps-rm/`（减少动态：无飞行，结果与座位同帧）、`manage.png`；`probes.json → fly`（1×：写入 ≈460ms，飞行 496–1060ms，1061ms 落座 + 「预留 2 · 空 1」） |
| lead「全部」（成员 / 出席，可选） | 同上 | 成员 / 联系信息 / 已取消局的成员区改为席位格阵：一席一格（局主深格、已确认淡青绿、已预留淡橙 + mono 倒计时 + 进度线、取消灰格、空位虚线格），右上席号，微信号整段不截断；出席保留三段键 + 3×3 像素章 | `fix-r1/lead-members-grid/`（members / contact 复制 / waitlist / replies / cancelled）、`protect-end-attend/` |
| lead C07 中：次级格 | 次级格是普通卡片，格盘感只在 lead 格 | 尺寸规则：要你回应 / 待你处理的其余项、还在等、招募中、已成局、未成行 = 1×1 成对排进两列；奇数个 1×1 的组把末格放宽成 2×1；两个只有一格 1×1 的相邻组共用一行（两个半宽组头）。进行中的格改为分区淡色面（淡色 + 分区色边 / 底唇 + 白底芯片），1×1 右上 26px 物件小格（QR / 局卡像素）。首屏两个身份都能看到 2×2 + 一对 1×1 | `fix-r1/lead-grid-home/`（当前 / 滚动 / 局主 招募中 \| 已成局 共用一行 / 历史 / 较多 / 待处理较多 / 只有一场 / 空态）、`joined-home.png`、`hosted-home.png` |
| review-2 minor 1 | 参加者 cancelled 首次打开不烧票 | 从历史点开（非面板跳转）且未看过：先显示完整作废票（不打印），620ms 后在同一张票上作废一次，记入 `voidSeen`；再开直接灰格 | `fix-r1/n01-cancelled-first-burn/` |
| review-2 minor 2 | pending 局卡写「席位已预留」 | statusLabel 按阶段：pending / waitlist →「仍可报名」，invited →「席位已预留」 | `fix-r1/n10-withdraw/` f01、`coverage/j-d-pending.png` |
| review-2 minor 3 | 宽格底行比文字栏缩进 16px | 列表页脚改名 `.c07-lfoot`，不再命中格内 `.c07-foot` | `coverage/j-home.png`、`h-home.png` |
| review-2 minor 4 | 1×1 芯片硬裁、席位折两行、地点只剩一字 | 1×1 新模板：芯片省略号；席位缩为 11px 像素一行 + 「3/5 已确认」；时间行 = 时间 · 月日 · 街区（改期格让位给删除线旧时间，新时间在底行）；长芯片时不放装饰物件 | `coverage/j-home.png`、`b-long.png`、`j-many.png` |
| review-2 minor 5 | 展开第一帧白 → 整面橙；收回时橙层落进白格 | hero 用淡色层 `::before` 承接：从淡色格展开时先是同一淡色，260ms 淡成整面分区色，收回反向；状态换色（如接受改期 橙→青绿）不做插值 | `fix-r1/n05-expand-tint/`（0.5×） |
| review-2 minor 6 | 分区切换离场 / 进场格同槽叠字 | 离场格原位 130ms 淡出，进场格 130ms 后按视觉序错峰 40ms 进 | `fix-r1/n06-section-switch/` |
| review-2 minor 7 | 作废末段约 700ms 空白框 | 每个碎片落地即开始聚合（`max(2100, d+720)ms`，原统一 2760ms）；框高收拢提前到 78.8%，灰格 60.6%–71.2% 淡入 | `fix-r1/lead-void-exit/`、`lead-void-decline/`、`lead-void-cancel-half/`（0.5×） |
| review-2 minor 8 | 关键帧释放后倒退 | 释放时以拖动帧为时钟续播：遮罩时钟 = 拖动帧，碎片 / 高度 / 灰格延迟减去 `--vt0` 并换同内容 `-b` 关键帧重启，落定计时改为剩余时长 | `fix-r1/n08-scrub-release/`（20% → 55% → 30% → 释放，f04→f05 连续） |
| review-2 minor 9 | 操作盘开 / 关竞态停在打开 | 延迟的 `on` 只作用于同一 `uid` 且仍在 `start` 的盘 | `fix-r1/n09-sheet-race/`；`probes.json → race`（关闭在 2–30ms 内，8/8 都没留下盘） |
| review-2 minor 10 | 撤回报名时局卡一帧消失 | 局卡留在原位 700ms 灰化，标「已失效 · 已撤回」；结果在写入那一帧出现（不再闪出历史块） | `fix-r1/n10-withdraw/` |
| review-2 minor 11 | 退出候补加了二次确认 | 去掉确认层：门口里的「退出候补」直接写入，按钮原位换结果「已退出 · 你不在候补名单里了」，序号变「—」；失败原位「退出未保存」+ 重试；首页弱动作打开详情并聚焦门口 | `fix-r1/n11-leave-queue/` |
| review-2 minor 12 | 首屏格盘感弱 | 见上「lead C07 中：次级格」 | `fix-r1/lead-grid-home/` |
| review-2 minor 13 | 局主取消时 hero 提前变灰 | hero / 席位格保持写入前（`view.hold`）到 3300ms 灰格落定才翻为「已取消」 | `fix-r1/lead-void-cancel-half/` |
| review-2 minor 14 | 预留到期 `00:00:00` 出现两次 | 未成行的行 hero 大字显示活动时间，`00:00:00` 只留在历史子格 | `coverage/j-d-expired.png` |
| review-2 minor 15 | 已放弃预留 / 已退出候补 / 已撤回只有文字 | 没有票的未成行都保留一张灰化局卡格（标原因） | `coverage/j-d-released.png`、`j-d-queueleft.png`、`j-d-withdrawn.png`、`j-d-rejected.png` |
| review-2 minor 16 | 申请审核仍是子格里的列表 | 见上「全部」行 | 同上 |

## 复核为已修（当前构建，未重做）

| 来源 | 发现 | 结论 | 证据 |
|---|---|---|---|
| lead C07 高：退出 / 作废结果 | 终态只剩淡灰卡 + 空白通行证格，残余没有落定 | review-2 已确认修好：同一张票逐格脱落 → 框底瓦砾 → 聚成 10×10 残骸灰格（缺角留描边轮廓）+「已作废 · 原因」+ 后果句 + 结果子格。本轮在当前构建复核仍成立，并顺带去掉了聚合前的空白框（minor 7）、局主 hero 等灰格落定（minor 13） | `fix-r1/lead-void-exit/`、`lead-void-decline/`、`lead-void-cancel-half/`、`result.png` |
| review-2 「已经做对」 | 出票 / 刮票 / 改期 / 返回落点 / 失败重试 / 减少动态 / 连点 | 未改核心路径；回归检查通过 | `fix-r1/protect-tear/`（短拖回弹 → 长拖逐行脱离 → 落进存根槽 → 联系层 → 已加微信）、`protect-detail-back/`（展开 / 收回落点描边）、`protect-end-attend/`（记为散场 → 出席章 → 更正）、`m2-confirm-reflow/`（三段出票）、`lead-apps-fail-retry/` |

## 受保护的部分

- 主负责人「已认可」列表里没有 C07 条目；review-2 列出的已做对部分（像素作废、出票、刮票、改期、返回落点、失败重试、减少动态）都按上面的回归目录复核，未简化。

## 其他

- 宽度：`fix-r1/widths/`（360 / 430：参加者首页、局主首页、申请格阵、通行证详情）无横向溢出，格按 `(宽 − 42) / 2` 自适应；`probes.json → widths`：两种宽度 × 5 个状态（含长标题），盘面 / 展开层横向滚动量 0、越过右缘的元素 0。
- 没有拒绝任何发现。
- 一处有意的次序（已写入规格 M5）：邀请时待审数 / 结果键在写入那一帧变，席位带的座位与「预留 · 空」在像素落座那一帧变（1× 晚约 560ms）——飞进去的像素就是那个预留席位。减少动态下两者同帧。

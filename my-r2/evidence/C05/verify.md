# C05「大面」· 独立复核（复核代理 · 2026-10-29）

对象：冻结快照 `/home/user/JU/.build/verify/C05/src/C05.dc.html`（md5 04b3f518…，2026-10-23 06:41），构建 `/home/user/JU/.build/verify-C05.html`（内嵌字体，`JU_CONCEPTS_DIR` 指向快照）。没有读、没有用 `my-r2/concepts/src/C05.dc.html`。所有浏览器作业经 `my-r2/tools/slot.sh`；静态截图前 `JU.shared.skins.pause(inst.envRef.current)`；帧序列的负载记在各自 `log.json`。证据都在 `my-r2/evidence/C05/verify/`。

## §1 视觉结论（先于功能检查写定）

**结论：视觉通过**（另有 minor 待修，见 §2 V 组；最终视觉验收仍由用户作出）。

依据（都是我自己截的图，逐张看过）：
- 双角色首屏 × 三环境：`v1-home-env/f01`（参加者·棉糖）`f02`（局主·棉糖）`f03/f04`（光晕）`f05/f06`（落日）。
- 深层页：`coverage/j-d-gathering`、`j-d-invited`（详情）、`j-d-tear`、`j-d-contact`、`j-d-reschedule`（票根面）、`h-m-review`、`h-m-members`、`h-m-attendance`、`h-m-reschedule`（管理 / 出席 / 改时间层）、`j-history`、`j-d-ended`、`j-d-cancelled`、`j-d-rejected`（历史）、`b-empty`、`b-empty-h`、`h-drafts`、`h-draft`（空态 / 草稿）、`h-m-card`、`j-d-withdraw`（弹层）。拼图：`coverage/sheet.png`。
- 宽度与字号：`widths/f00-w-360-j-home`、`f24-w-430-j-home`、`f32-zoom-390-j-home`、`f22-w-390-b-long`、`f23-w-390-b-long-h`。
- 灰度 + 最近邻：`gray/gray-C05-vs-C07.png`（左两张 C05，右两张 C07），C07 原色 `v6-neighbor-C07/sheet.png`。
- 固定物件实测：`measure/fixed.json`。

逐项回答（简报七问）：
1. **主体形态与重心**：成立。上 62%（纸边 y=525）是一块不透明环境色面，面内左列大字时间、右上 V27 局卡、卡下局名 + 一行说明 + 主 CTA；下方一张纸承载其余。重心在面右上的局卡与左侧 42px 时间之间，留白有组织（面内三段：页头 / 时间+卡 / 局名+CTA）。
2. **中文**：页头 30/500，局名 22/600（两行 balance、≤300px），地点·局主 14，纸上行 14/500 + 13，状态 13，最小 12（widths 实测）；面上深墨（#2A0F1D / #17123A），没有低对比灰字成片，也没有胶囊泛滥。弱点：时间（42px Archivo）明显大过局名（22px），阅读顺序是「日期 → 时间 → 状态 → 地点局主 → 局名」，与命题矩阵「大面内 34/26/14」不一致（见 §2 V1）；长标题局主侧折成「第一次开 / 门请多包涵」（V3）。
3. **表面与光**：一致。面不透明、只在右上一处白色径向高光，局卡投向左下的长软影，纸是平的、只有上沿影；没有噪点、堆渐变、粗阴影或玻璃模糊替代关系（光晕 / 落日的面是环境本身的色带）。
4. **深层页**：同一构图生成——详情 / 票根 / 管理 / 出席 / 历史 / 草稿 / 空态全部是「上面 = 这一场的面，下面 = 纸」，票根面变票底灰、作废与未成行变褪色面、管理面换成席位大数；没有退回「返回 + 标题 + 列表」默认面板。弱点：未成行 / 已取消的历史页纸上只有 3 行，下面约 250px 空纸（V4）。
5. **关掉动画后**：静态画面成立（所有依据图都是环境暂停、动画停稳后的帧；系统减少动态下的终态见 §4 rm）。
6. **与最近邻 C07 对比**：不看名字可分辨——C05 是上彩色面 + 下浅纸，C07 是上浅色列表 + 下深墨盘；灰度下仍是相反的明暗结构。
7. **固定物件**：局卡 212×265（V27 中档，原件）、拿起的局卡 296×370（大档）、票根面 258 宽、主 CTA 280×48（8 层渐变 + 6 层阴影、radius 999，原构造）、页头 30px 收到 18px 区间；周围空间够（卡与时间列之间 ≥10px，票根两侧 ≥66px）。

仍需用户判断的视觉取舍：面占 62% 而纸上只露 2.5 行（360 宽只露 1.5 行）；冷蓝 CTA 放在饱和粉面上；局主默认首屏的主角局卡是 V27 玻璃包，卡面带模板里的 PHOTO_01 / PHOTO_02 占位格（共享模板，不是 C05 自造）。

## §2 功能与动效发现

帧序列都是我自己录的 CDP 截屏流（录制脚本与步骤 `verify/_scripts/rec.cjs`、`*.json`：环境引擎暂停、外壳页面滚动锁住、每段记 1 分钟负载，见各目录 `log.json`）；标签 `+Nms` 相对该段第一帧。负载 ≥ 8 的两段（`op4-kb-reschedule` 的键盘撕、接受改期，8.04 / 8.12）只当功能证据，不作动效判断；其余各段负载 2.9–7.7。

### major（3）

**M-1 签名路径与角色切换穿过「近空白 / 只剩一行标题」的帧**（directions §0 第 9 条：返回途中不能只剩一行标题、角色切换不能有近空白帧）
- 现象：「先清场、再穿过、后落定」让离开页先淡到 0，新页之后才显影；中间约 100–200ms（1×）屏上只剩色面 + 一行飞行标题，或整屏空白。
  - 首页行 → 票根：`verify/m4-enter-back-1x/f003`（+104ms，整屏无字）；票根 → 返回：`f019`（+253ms，只剩标题「公园慢跑 3K · 跑完喝咖啡」）。
  - 首页行 → 详情：`f039`（只剩标题）；详情 → 返回：`f049`。0.5×：`verify/m4-feedback/f044–f045`（进入）、`f059–f062`（返回，≈130ms@1× 只剩页头带 + 一行标题）；进入第一段还有叠影 `m4-feedback/f043`（半透明列表叠在首页面的 11:30 / 局名 / CTA 上）。
  - 局主行 → 管理：`m4-enter-back-1x/f067`；返回 `f080–f081`。撕票后返回首页：`verify/op3-tear/f058–f059`。
  - 面上 CTA → 阅读层：`verify/op2-read-confirm/f002–f005`（只剩局卡，页头与正文全空）；票根 → 详情：`f056–f057`、详情 → 首页：`verify/op2b-brunch-return/f007`（整屏空白）。
  - 角色切换（顶部，1×）：`verify/op1-scroll-role/f003–f004`（+93/+138ms 面上无字、纸上列表只剩淡影）；0.5×：`f052–f054`。构建者自己的探针 `stage2/fixes/after/3-signature-probe.txt` 也是 150–175ms 处 leavingFace 与 newFace 同时 ≤ 0.2。
- 建议：进入与离开重叠（新面显影在旧面降到约 0.4 之前开始，任何一帧两者不同时低于 0.5）；新页的纸内容从第一帧就在，不要先清空纸再淡入；返回时让首页列表先在下层显出、标题再落回；角色切换改 60–100ms 交叉淡化，不要「旧字立即收起 + 90ms 后才淡入」。

**M-2 色面不参与滚动：首页 / 详情 / 管理上 58–75% 的屏幕划不动**
- 现象：触摸模拟（`hasTouch` + CDP touch 事件）从面上（屏 y=300、420）上划 220px，三处页面都没有任何滚动；只有从纸上（y=650）起手才滚。滚轮同理：时间、局名、CTA、环境层都在 `[data-scroller]` 之外。证据与复现脚本：`verify/scroll-dead-zone/touch-swipe.txt`。
- 影响：手机上最自然的起手位置（屏幕中部）正好是面，上划没有回应，像卡住了，也像「只有这一场」。
- 建议：面上非交互部分 `pointer-events:none`，CTA / 局卡 / 去不了了 / 角色切换 `pointer-events:auto`，让手势落到滚动容器里的 `.c05-sp` 占位；或把面放进滚动容器做 `position:sticky` 背板。

**M-3 关键帧滑杆对签名路径无效，结束后拖滑杆也不重播**（任务书 §12 评审能力；简报第 12 项）
- 现象：点「法拉盛早茶」后 140ms 暂停 → 定格正确（`verify/op12-scrub-clock2/f001–f002`），但拖到 0 / 35 / 70 / 100 四帧完全相同（`f003–f006`，面已全到、纸缺失的中间态）；释放后正常落定（`f007`）。回首页停稳后拖滑杆 0 / 50 / 100 不重播（`f009–f011`，`log.json` info：`replay:false`、`last:"go:detail"`）。
- 原因推断：签名路径的标题飞行与面显影是脚本逐帧驱动，滑杆只能定位 CSS / WAAPI 动画；首页面上倒计时条每秒重启的宽度过渡让评审层一直认为「还有动画在走」，不进入自动重播。
- 建议：把飞行标题 / 面显影 / 纸下沉改为可 seek 的 WAAPI 动画（或给 scrub 提供钩子按进度驱动）；倒计时条改为无过渡的逐秒宽度，或排除在 `_movingAnims` 之外。

### minor（12）
- V1 字阶与命题不一致：面内时间 42 / 局名 22（矩阵「大面内 34/26/14」），阅读顺序成了「日期 → 时间 → 状态 → 地点局主 → 局名」（`v1-home-env/f01`）。需主负责人确认是否接受。
- V2 手机内出现范围说明：「我的举报 / 记录页为账户级，本轮不可点」「开局模块，本轮不可点」「查看我的记录 · 账户级页面，本轮不可点」「账户级记录页不在本次范围」（`coverage/j-d-ended`、`h-draft`）。契约 §4E：范围说明放手机外。
- V3 局主长标题折在词中：「第一次开 / 门请多包涵」（`widths/f23-w-390-b-long-h`）。
- V4 未成行 / 已取消的历史页纸上只有 3 行，下方约 250px 空纸（`coverage/j-d-rejected`、`j-d-cancelled`）。
- V5 改时间层用原生日期 / 时间控件，显示浏览器区域格式「12/24/2026」「08:00 PM」，与全站 24 小时制不一致（`op7-reschedule-attend/f011`）。
- V6 确认层身份行的缩略图是一块纯色方块，读起来像缺图（`coverage/j-d-withdraw`、`op6-8-review-cancel/f087`）。
- V7 草稿摘要面上大字时间位写「--:--」，像数据坏了（`coverage/h-draft`）。
- F1 复制失败后点「已加微信」：失败行被清掉，但「再复制一次」按钮还留着（`op3-tear/f056`，rm 终态 `rm/f02` 同样）。
- F2 退出候补确认后，确认层在一帧内消失、没有关闭过渡（`op5-leave-withdraw-exit/f009 → f010`，该段只画了 2 帧）。
- F3 拒绝改期燃烧 B 时纸升到票槽下沿，未撕的副券压在纸边上，炭边与落灰越过纸边（`op4-kb-reschedule/f051、f055`；原件要求票四周 74px 燃烧空间）。
- F4 局主取消只有抽色（1.1s 去饱和），没有可见的余烬（`op6-8-review-cancel/f096–f111`；契约 / ctl-api 写的是「抽色 + 余烬」）。
- F5 面上那一场（周六早午餐）确认成局后返回首页：面换成另一场，早午餐落进纸上「要你回应」组，但没有落点标记（`op2b-brunch-return/f013–f016`；对照撕票返回有落点 `op3-tear/f061`）。

### 已确认可用（真实点击 / 拖拽 / 键盘，逐帧看过）
标题 30→18 连续收拢并回滚恢复、角色切换后分区与滚动记忆（`op1-scroll`，期望全部通过）；阅读层未读完禁用 → 读完可确认 → 处理中 → 成局 → 出票时无撕票键、2.3s+ 后出现（`op2-read-confirm/f014–f049`）；拖 35% 回弹不写数据、拖 70% 撕开、副券坠落、联系层、复制失败一行 + 长按提示、已加微信 → 处理中 → 待赴约、返回落到「就快见面」并有落点（`op3-tear`）；Enter 与「撕开票根」按钮等价撕（`op4-kb-reschedule`）；改期接受 / 拒绝 → 燃烧 B → 历史「拒绝改期」；退出候补（墨色胶囊、无蓝 CTA）、撤回、主动退出 → 燃烧 C → 历史「已退出」（`op5`）；审核通过时结果行 / 计数 / 席位 / 头部「1 份申请待审」同帧（`op6-8-review-cancel/f019`），最后一份后首页面换成「看展搭子 · 记录出席」；局卡拿起 296×370 与落回；取消层受影响人数、武装失败在层内 + 重试、抽色、历史「已取消」；改时间同时间禁用 → 新时间 → 局卡与面上时间重印、答复区 0/4、阳台烧烤 2/3（`op7`）；散场 → 四人逐人出席 / 未出席 / 待定 / 出席，焦点到下一位、不自动翻页、更正留轨迹、历史「1/4 人到场」；草稿删除 → 相邻补位 → 原槽位撤销 → 10s 后提交 → 只剩草稿的空态（`op9-10-drafts-clock`）；时钟：候补第 2 → 1 位、早午餐预留到期、局主侧 Leon 到期 → 西西补位 05:59:59、+24h 联系关闭文案（`op10-clock`、`op12-scrub-clock2`）。角色切换探针：点击后 6–20ms 首个 DOM 变化、10–22ms 首个动画。

### 共享层问题（不计入 C05，转主负责人）
详情成员行「已预留 · 剩 5 小时」与同屏倒计时「剩 04:20:31」不一致（向上取整）；COPY 里「不影响信用」与阅读层小标题「信用」；V27 玻璃包局卡带 PHOTO_01 / 02 占位格（局主默认首屏主角卡）；「周五小酒馆试营业」排在周六；出席「待定」算作已记录（4/4「都记好了」）。

## §3 覆盖表（只勾我亲自看过 / 做过的；「图」= 我读过的截图，「帧」= 我看过的 1× 帧序列）

| 索引 | 入口存在 | 真实操作成功 | 静态视觉已看 | 正常速度动效已看 | 仍需用户验收 |
|---|---|---|---|---|---|
| j-home | ✓ | ✓ 滚动收拢 / 回滚、角色切换记忆、点行进入 | ✓ v1-home-env/f01、f03、f05 | ✓ op1-scroll、op1-scroll-role（M-1） | 面 62% 纸露 2.5 行；粉面上的蓝 CTA |
| j-history | ✓ | ✓ 分区切换后看列表 | ✓ coverage/j-history、op5/f073 | — | 大数字 4 作主角 |
| j-many | ✓ | ✓ 上拉到底 p=1 再回滚 | ✓ coverage/j-many | ✓ op1-scroll | 同 j-home |
| j-history-many | ✓ | — | ✓ coverage | — | ✓ |
| j-d-pending | ✓ | ✓ 撤回报名 | ✓ op5/f012、f019 | ✓ op5（确认层） | — |
| j-d-invited | ✓ | ✓ 阅读 → 确认 → 成局 | ✓ coverage/j-d-invited | ✓ op2（M-1） | — |
| j-d-waitlist | ✓ | ✓ 退出候补 | ✓ op5/f001、f008 | ✓ op5（F2） | — |
| j-d-invitedq | ✓ | — | ✓ coverage | — | ✓ |
| j-d-gathering | ✓ | ✓ 进入 / 返回 | ✓ coverage/j-d-gathering | ✓ m4-enter-back-1x、m4-feedback 0.5×（M-1） | — |
| j-d-tear | ✓ | ✓ 拖回弹 / 拖撕 / Enter / 按钮 | ✓ coverage/j-d-tear | ✓ op3-tear | 无头环境出纸慢 |
| j-d-contact | ✓ | ✓ 复制失败 + 已加微信 | ✓ op3/f045、f056 | ✓ op3（F1） | — |
| j-d-going | ✓ | ✓ 去不了了 → 燃烧 C | ✓ op5/f031 | ✓ op5 | — |
| j-d-reschedule | ✓ | ✓ 接受 / 拒绝 | ✓ op4/f019 | ✓ 拒绝 + 燃烧 B（接受段负载 8.12 不计） | — |
| j-d-withdraw | ✓ | ✓ 退出 / 拒绝确认层 | ✓ op5/f038、op4/f045 | ✓ op5 | — |
| j-d-ended | ✓ | — | ✓ coverage/j-d-ended | — | 08 场景卡在面上偏暗 |
| j-d-cancelled | ✓ | — | ✓ coverage | — | 压痕读法 |
| j-d-rejected | ✓ | — | ✓ coverage（V4） | — | ✓ |
| j-d-queueleft | ✓ | ✓ 由退出候补产生 | ✓ op5/f011 | ✓ op5 | — |
| j-d-exited | ✓ | ✓ 主动退出 → 历史 | ✓ op5/f072 | ✓ op5 | — |
| j-d-declined | ✓ | ✓ 拒绝改期 → 历史 | ✓ op4/f079 | ✓ op4 | — |
| j-d-expired | ✓ | ✓ 时钟到期（数据 + 首页） | ✓ op12/f013 | — | ✓ |
| j-d-released | ✓ | — | ✓ coverage | — | ✓ |
| j-d-withdrawn | ✓ | ✓ 撤回结果 | ✓ op5/f030 | ✓ op5 | — |
| j-d-absent | ✓ | — | ✓ coverage | — | ✓ |
| h-home | ✓ | ✓ 角色切换、行与 CTA 进入管理 | ✓ v1-home-env/f02、f04、f06 | ✓ op1-scroll-role、m4 C/D、op6 | PHOTO 占位卡（共享） |
| h-drafts | ✓ | ✓ 分区记忆 | ✓ coverage/h-drafts | ✓ op9 | 虚线卡位读法 |
| h-history | ✓ | ✓ 取消 / 散场后查看 | ✓ op6/f113、op7/f116 | — | — |
| h-pending | ✓ | — | ✓ coverage | — | 同 j-home |
| h-history-many | ✓ | — | ✓ coverage | — | ✓ |
| h-drafts-many | ✓ | ✓ 删除 / 补位 / 撤销 / 10s | ✓ op9/f001 | ✓ op9 | — |
| h-m-review | ✓ | ✓ 通过 / 谢绝 / 最后一份 | ✓ coverage、op6/f014 | ✓ op6 | — |
| h-m-members | ✓ | ✓ 行进入 | ✓ coverage/h-m-members | ✓ m4 C（M-1） | — |
| h-m-waitlist | ✓ | ✓ 时钟补位 | ✓ op12/f014–f015 | — | — |
| h-m-contact | ✓ | — | ✓ coverage | — | ✓ |
| h-m-leaves | ✓ | —（只读到文本「离开记录 · 2」） | ✓ coverage | — | ✓ |
| h-m-reschedule | ✓ | ✓ 同时间禁用 → 新时间 → 确认 | ✓ op7/f010–f011（V5） | ✓ op7 | — |
| h-m-replies | ✓ | ✓ 阳台烧烤答复 2/3 | ✓ op7/f029 | — | — |
| h-m-cancel | ✓ | ✓ 受影响 / 失败在层内 / 重试 | ✓ op6/f087、f091 | ✓ op6（F4） | — |
| h-m-end | ✓ | ✓ 记为散场 | ✓ op7/f036 | ✓ op7 | — |
| h-m-attendance | ✓ | ✓ 逐人记录 / 焦点 / 更正 / +24h | ✓ op7/f100、f115 | ✓ op7 | — |
| h-m-card | ✓ | ✓ 拿起 / 落回 | ✓ op6/f055 | ✓ op6 | — |
| h-m-cancelled | ✓ | ✓ 取消后的管理面 | ✓ op6/f112 | ✓ op6（抽色） | — |
| h-draft | ✓ | — | ✓ coverage（V7） | — | ✓ |
| b-empty | ✓ | — | ✓ coverage | — | 空卡位 + 一句话是否够 |
| b-empty-h | ✓ | — | ✓ coverage | — | 同上 |
| b-single | ✓ | — | ✓ coverage | — | ✓ |
| b-single-h | ✓ | — | ✓ coverage | — | ✓ |
| b-drafts | ✓ | ✓ 删到零后的空态 | ✓ op9/f028–f029 | — | — |
| b-long | ✓ | — | ✓ widths/f22、f32 | — | — |
| b-long-h | ✓ | — | ✓ widths/f23（V3） | — | ✓ |

## §4 工具结果（原始）
- `coverage.cjs C05 verify/coverage --settle 1200`：`{"states":50,"errors":0,"mismatches":0}`（log：errors []、mismatches []）。
- `widths.cjs C05 verify/widths`：`shots 48, overflow [], findings [], fontInvariance [], minFont 12, api {zoom ok, safe ok}, errors 0`。
- `kb-check.cjs C05 verify/kb`：`shots 2, findings [], errors 0`（h-m-reschedule、j-d-ended+report，图已看）。
- `rm-check.cjs C05 verify/rm`：`rmSys true, flowsOk 11/11, findings [], errors 0`（2/3/6/7 四条终态 `rm/f01、f02、f06、f07、f09` 已看）。
- 所有自录序列 console 错误 0；期望（expect）全部通过。

# 「我的局」R2 · 共享契约（主负责人定稿 v1 · 2026-10-22）

本契约约束十套新方案共用的**产品语义、最小共有语言、技术管线、覆盖范围与验证**。正文构图、角色分区组织、容器、中文字阶与行宽、对象与文字的空间关系、前景颜色面积、表面与光、详情与管理的组织、代表性空间转换，全部由各套方向卡（`my-r2/spec/directions.md`）决定，并且必须彼此不同。任务书原文 `my-r2/brief/R2-PROMPT.txt` 永远优先于本契约；本契约只是把它落成可执行的规格。

旧十套（`JU-My-Ju-Fable51-10-Concepts.html` 的 C01 票据卷 … C10 胶片）整体未通过视觉验收。可以保留的只有：经核对的产品数据 / 角色权限 / 状态逻辑（`src/core/ju-data.js` 的语义）、底层工具与评审能力。旧附录里的**布局决定不是基线**：文字四角色顺序、13px 状态、lead 特权、「局卡 / 票根 / 票墙卡 / 书脊」物件映射、唯一倒计时的表现、F01–F11 参数，都不再约束新方案（见 `my-r2/spec/baseline-old10.md`）。

## 0. 质量门槛（任务书 §01 优先级、§03、§07、§11；视觉单独判定，功能不能抵分）

1. **第一眼**：整屏有完整的主体形态、明确重心、足够有力的主次反差和有组织的留白；局名、时间、角色、下一步有先后。不是把所有字、按钮、间距一起放大，也不是删光内容制造空旷。
2. **中文是主角**：少而清楚的文字角色（标题 / 时间 / 地点 / 状态 / 人数 / 行动），每套自己定义但要少；**正文最小 13px，功能标签与状态 ≥ 12px**；以实际内容测量行宽与换行（两行标题、长地点、中英混排、`long` 变体），不用全局缩放或自动缩字补救；不靠大英文、编号、胶囊、低对比灰字制造设计感。
3. **质感 = 关系**：形体、边缘、光源、表面、遮挡、接触阴影、按压与归位相互支持；先让纯构图和字体关系成立，再加材料层次。禁止噪点 / 堆渐变 / 粗阴影 / 玻璃模糊 / 装饰缝线替代关系；不禁止有表现力的颜色、透明度与细节。
4. **成熟**：第一页、深层管理、空态、取消后、历史与更正结果处于同一质量；不允许「外面精致，点进去是通用后台表格或默认白色弹窗」。
5. **JU 的吸引力**：场景内容、人的称呼、时间地点与行动是画面主角；不变成内容流、微信群接龙、Eventbrite、Dating App、音乐厂牌网站；不是十套冷淡极简列表、黑白时装站、SaaS 后台或同一大卡片模板。
6. **内部直接淘汰**（任务书 §11）：要看名字才知道差异；关掉动画后静态画面缺乏构图与吸引力；把普通页面包成另一件道具；只靠重阴影 / 噪点 / 玻璃 / 金色 / 纯黑 / 巨大英文 / 大留白称高级；首页好看而详情 / 名单 / 出席 / 历史退回默认组件；活动名和下一步被数字、刊期、页码、装饰物压住；动效中断后失控、结果不清、频繁任务要等表演；为统一而同质化，或为不同而失去 JU 气质。
7. **不自评**：不写「世界顶级」「9.9 分」「全部通过」；交画面与操作证据；用户作最终视觉验收。

## 1. 固定并忠实继承的最小共有语言（任务书 §02）

实测数值与提取代码见 `my-r2/spec/baseline-v27.md`、`my-r2/spec/baseline-rituals.md`，模块在 `my-r2/src/shared/`（构建时注入，概念**不重做、不缩小、不改构造**；可决定它们在自己空间里的位置、旁侧内容、进入与返回的关系）。

| 项 | 规格 | 来源 |
|---|---|---|
| 产品身份 | JU；中文优先；年轻、有生活感、轻但靠谱、让线下相聚真正发生 | 任务书 |
| 外层标题与吸顶 | V27 实测（`baseline-v27.md`）：主标题 Noto Sans SC 30px/500/#14161f，辅助行 14px/400/#535b70，返回键 44×44 玻璃圆钮 at (22,24)，工具行 0–44px；收拢 `p = clamp((scrollTop − 4) / 84)`，字号 `30 − 12p`、top `53 − 40.45p`、max-width `346 − 104p`、水平居中，p=1 时标题中心落在工具行中心 22px；辅助行随 p 淡出。V27 自己的屏幕滚动距离不足从未到 p=1，我们的长列表必须真实到达并回滚恢复；12 字双行标题在 V27 断成「…火锅 / 局」——本轮两行标题用 `text-wrap:balance` + 两行省略复核。实现：共享 `JU.shared.header`（`--hc` 0→1 由控制器写入，概念用 `calc()` 插值；也可直接使用 `my-r2/src/shared/v27/header.*` 的原构造） | V27（`baseline-v27.md` §1） |
| 主要 CTA | 宽 `min(100%,280px)` × 高 48px、radius 999；底色 #8DB1F2 + 8 层渐变 + 6 层 box-shadow（内晕 / 1px 白描边 / 顶高光 / 底青光 / 外 1px 蓝描边 / 投影）+ 高光条；文字 14.5px/500/.06em 白；按压 `:active scale(.958)` + `.48s cubic-bezier(.18,1.5,.36,1)`；禁用 `rgba(20,22,31,.055)` + 1px 内描边——**用 V27 的真实构造**（`my-r2/src/shared/v27/cta.css`），不是任意蓝块，不随主题变黑条；只用于主要确认（阅读并确认 / 撕开票根 / 联系局主 / 答复新时间 / 发出邀请 / 确认改时间 / 记为散场 等各表面的唯一主动作）；弱动作与危险动作按自身职责设计（取消这局用危险色，不用主 CTA 构造） | V27 |
| 三种环境 | Cotton Candy（V27 原件：three.js 水面，`my-r2/src/shared/v27/backgrounds.js`）/ Halo / Sunset（**V27 没有这两种，原件在 R9** `<ju-halo-skin>` / `<ju-sunset-skin>`，提取为 `skins-r9.*`）；统一接口 `JU.shared.skins.mount(host, name, {live})`，非当前实例与减少动态用静态 CSS 回退；`data-skin="cotton\|halo\|sunset"`。**每套在三环境下都成立**，前景的面、边、透明度与明暗面积由各套决定；背景服务前景，不与标题 / 列表 / 状态争注意力；已有背景风格保留，节奏问题只在其系统内修正 | V27 / R3 |
| 成熟局卡 / 票根 | 局卡模板 JuCardV2（六个视觉包，cqw 制 4:5；V27 用过的尺寸档：196×245 / 212×265 / 296×370 / 阅读态 328×460；3D 壳 perspective 1150，翻面 1020ms）、表单卡栈（5 张 + 2 张背纸，阈值 ±84px，甩出 62°）——在我的局里卡栈用于「阅读约定」层的三类约定卡；票根出票 / 打印、撕票、作废 / 燃烧、出席印记（`my-r2/src/shared/rituals/*`）：原件原尺寸、原时长曲线、原几何；概念决定它们在「我的局」里的组织、旁侧内容、详情与返回空间；**不改成十种道具**，也不缩小原件去迁就版式——版式要为原件留出它需要的空间 | V27 / R9 |
| 双角色与状态 | 我参加的 / 我发起的分开；事实、权限、必要动作一致（§4）；50 项索引是状态集 | 旧 `JU.INDEX` |
| 动效底线 | 及时、连续、可打断、停稳清晰、可返回；普通按压 / 复制 / 基础开关可共用 JU 基础语言 | 任务书 §08 |
| 色彩基底 | 墨 `#14161F`、正文 `#252b3a`、次级 `#535b70`、主蓝 `#4553BE` / 焦点 `#4A5AD6`、错误 `#DA3A52`、成功 `#0E9B76`（V27）；各套在此之上决定前景主色面积、冷暖与亮度层级 | V27 |
| 字体 | V27 的字体角色表（`baseline-v27.md` §6）；交付文件内嵌字体（`tools/embed-fonts.py --common`），字重与授权记录在附录；**不能因字体加载失败而换字** | 任务书 §10 |

## 2. 文件与结构（Design 画板格式；四个注入标记）

- 每套只写一个文件 `my-r2/concepts/src/CNN.dc.html`（`<x-dc>` + `<helmet>` + 模板 + `<script type="text/x-dc" data-dc-script data-props='…'>`），类名前缀 `cNN-`，`id` / `@property` 带前缀。保留标记：`/* @panel-css */`（面板 + fx + **共享模块 CSS**）、`<!-- @fx-svg -->`、`<!-- @panel -->`（面板在 `.ju-stage` 内、`.ju-phone` 外）、`/* @core */`（`JU.*` 核心 + 共享模块 JS + `CONCEPT`）。
- 骨架（评审脚本按此定位）：
  ```html
  <div class="ju-stage">
    <div class="ju-phone{{panel.phoneCls}}" style="{{panel.phoneStyle}}">
      <div class="app cNN{{panel.rootCls}}" style="--k:{{panel.k}};--frame:{{panel.frame}}" ref="{{rootRef}}" data-skin="{{c.skin}}" data-role="{{c.role}}">…</div>
      <!-- @fx-svg -->
    </div>
    <!-- @panel -->
  </div>
  ```
  `.ju-phone` 尺寸由面板预设决定（`--pw/--ph`：360×780 / 375×812 / **390×844（主评审）** / 430×932 / 适应窗口高度）；`.app` 必须 `position:absolute; inset:0` 并**真实回流**；禁止 `transform:scale()` 整页缩放；安全区用 `--sat/--sab`（面板可开「刘海 + 底部指示条」模拟，`.ju-phone.safe`）；文字放大用面板「文字 115%」（`.ju-phone.zoom` 把 `--tz:1.15` 给 `.app`，正文字号写 `calc(15px * var(--tz,1))` 一类，或至少标题 / 正文 / 状态三级随之放大且不溢出）。
- 键盘：有输入的表面（改时间、局内记录 / 举报补充）必须让聚焦输入与主动作停留在 `calc(100% - var(--kb))` 之上；`tools/kb-check.cjs` 检查。
- 减少动态三源：面板 `review.rm`、系统 `prefers-reduced-motion`（mixin 监听 → `rmSys`）、本机偏好（若方案提供）；任一生效：`this.after()` 归零、`.app.rm *` 时长 1ms、仪式直接到终态，**来源、结果与必要状态同样完整**。
- 模板语法只有：`{{a.b}}` 点路径、`<sc-if value="{{cond}}" hint-placeholder-val="{{false}}">`、`<sc-for list="{{xs}}" as="x" hint-placeholder-count="3">`、小写事件属性（`onClick / onPointerDown / onPointerMove / onPointerUp / onPointerCancel / onInput / onChange / onScroll / onKeyDown / onAnimationEnd / onTransitionEnd`）、`ref="{{ref}}"`。不用 innerHTML / 外部脚本 / iframe / canvas（共享仪式模块若自带 canvas / WebGL 由核心注入，概念不自建）；图标内联 SVG，不用 emoji；真实控件 `<button type="button">`、`<input>` + `<label>`、`aria-label`。
- 不修改共享文件（`my-r2/src/*`、`my-r2/spec/*` 的共享部分、其他方案）；核心缺陷写进汇报。

## 3. 共享核心（构建时注入 `JU.*`；读 `my-r2/src/core/ju-data.js`、`ju-ctl.js`、`ju-review.js`，接口说明 `my-r2/spec/ctl-api.md`）

- 数据：`JU.data(variant)` / `JU.baseState(variant)`；变体 `default / empty / single / drafts / pending / many / history / long`（`JU.VARIANTS`）。同一数据十套共用，每套的运行时数据彼此隔离（各自实例）。
- 时钟：`JU.NOW` 数据锚点（演示日 2026-12-17 15:00，画布外注明「演示日期，不冒充实时」）；`JU.now()` 走时；`JU.advance(ms)`；面板：+5 分钟 / +1 小时 / 到最近到期 / +24 小时。倒计时、`剩 HH:MM:SS`、「今天 / 明天」、联系窗 24h、`ago` 全部读 `JU.now()`；时钟推进时核心结算到期（`JU.engine.settle`：预留到期 → `expired` → 候补顺位补 6h），概念只负责画出变化。
- 引擎：`JU.engine.<action>(data, p) → { data, effect }` 纯函数，**所有状态变化必须经过它**（`this.act(name, p)`，并用返回的 `res.data` 派生）；失败武装（面板「下一次写入失败」）→ `effect.type='error'` → 处理中（≥300ms 可见）→ 失败在发生处 + 重试 → 成功落定原位。复制：`this.copy(text)` 只在 `navigator.clipboard.writeText` 真实成功后给成功反馈，失败给「未能复制，长按手动复制」+ 可重试（面板可武装「下一次复制失败」）。
- 控制器 `JU.ctl`（`this.ctlVals()` → `c`）：角色 / 分区、导航栈（起点矩形、相位 enter → in → idle / exit、滚动记忆）、`--hc` 页头收拢变量、详情 / 阅读确认 / 候补 / 票根（打印 / 撕 / 键盘等价 / 联系 / 复制）/ 改期答复 / 历史展开 / 局内记录、管理 H1 十二个表面、草稿删除与撤销、弹层与焦点、toast、仪式事件（`c.fx`）。概念只负责**构图、排版、表面与运动**。
- 评审 mixin：`after / hold / holdKey / cancelKey / act / motion / jumpTo / applyJump(默认 = ctlJump) / reset / loadVariant / setSpeed / toggleRM / togglePause / scrubTo / setPhoneSize / fitPhone / toggleKb / toggleSafe / toggleZoom / advanceClock / panelVals`。时长写法 `calc(380ms * var(--k,1))`；长动效用 keyframes + `.scrub` 规则；`.app.paused *` 冻结。
- 共享模块：`JU.shared.header / cta / skins / card / cardStack`、`JU.ritual.print / tear / contact / burn / stamp`（签名见 `my-r2/spec/baseline-rituals.md` §复用接口与 `ctl-api.md`）。

## 4. 必须覆盖的范围（任务书 §09；索引 `JU.INDEX` 50 条全部可达，`tools/coverage.cjs` 验证；详表 `spec/state-inventory.md` A–G 仍是语义依据，其中的布局决定除外）

**A. 我参加的**：当前 + 历史；组织意图「需要我回应 / 即将赴约 / 仍在等待」（分组与版式可重设计，但三种意图要能分辨）；状态：待审核、已预留待确认、候补等待、候补轮到、已确认待成局、已出票待撕、已撕待联系、已联系待赴约、改期待答复、已散场；未成行八种事实各自区分：局主取消、审核未通过、撤回申请、主动退出、拒绝改期、预留到期、放弃未确认预留、退出候补。动作：详情与返回；阅读确认 / 释放预留；候补位置 / 轮到回应 / 退出候补；接受 / 拒绝新时间；查看 / 撕开票根、联系信息层、复制与加微信记录；撤回 / 退出确认及结果；历史票根、出席记录与本场相关记录（补充 / 异议为局内事实陈述）。
**B. 我发起的**：当前 = 待处理 / 招募中 / 已成局 / 改期中 / 待记录出席；先表达哪场要处理、哪次见面将发生，再按需展开申请 / 预留 / 确认 / 空位 / 候补 / 未答复人数（**不是每卡一整块指标墙**）；草稿：摘要、不同完成度、删除、撤销；历史：已散场 / 已取消及相关记录。
**C. 管理这局**（十二个表面，可用适合本套的层级 / 面板 / 展开形式，不为凑数拆成孤立全屏）：进入与返回原位；申请审核（人、验证状态、备注、时间、邀请 / 谢绝、处理状态、计数与席位变化）；成员与席位（局主 / 已预留 / 已确认 / 空位 / 待出票 / 已撕票；展开收起）；候补顺序（不画成已确认）；联系信息（角色可见范围、展开、复制反馈）；离开记录与名单的层级关系；改时间（原 / 新时间、输入、影响范围、可提交 / 不可提交、再想想、结果）；改期答复（未答复 / 接受 / 拒绝、旧 / 新票关系、人数更新）；取消（确认、受影响成员、处理中、票件失效 / 燃烧、稳定结束画面与历史归位）；散场（确认、稳定结果、进入出席登记与历史）；出席（出席 / 未出席 / 待定、印记、保存、更正、轨迹）；查看完整原局卡并回收。
**D. 边界与真实内容**：完全空、只有一场、只有草稿、待处理较多、多场同日、当前很多、历史很多、较多人名 / 成员、长标题、长地点、中英混排；禁用、加载、失败与重试。内容多时不强压一屏，条目不必同样大；空态与单项态有完整构图，不依赖「去找局 / 去开局」成立。
**E. 范围外接缝**：不做发现 / 城市 / 完整报名 / 开局编辑器 / 登录 / 设置 / 后端。`继续编辑草稿 / 再开一局 / 去找局 / 去开局 / 查看进度 / 账户级记录页` **不渲染为可点的假入口**（保留文字与位置，禁用态或说明；范围说明在手机外）。
**F. 事实与权限**（`state-inventory.md` §G 十二条仍然有效）：无公开信用分、不新增处罚 / 扣分 / 等级；八种「没去成」是八个事实；`未出席` 是待核实事实；局主侧数据（申请人留言 / 邮箱 / 微信、他人微信、离开记录、候补真名、出席轨迹）不给参加者；成局不可逆；票的三种不可用各写各的；计数口径写在数字旁；一个时间格式；`已加微信` 只是自报。
**演示假设**（画布外注明，不借设计批准为政策）：预留 6 小时、撕票后 8 小时联系、散场后 24 小时联系关闭、年度 4 次主动退出、容量含局主、全员确认成局出票；与 R9 的差异见 `baseline-r9.md` §b。

## 5. 动效（任务书 §08：十一族每套都覆盖；每个关键过程看 触发前 → 即时反馈 → 连续变化 → 内容接替 → 结果落定 → 返回 / 下一动作）

| 族 | 内容 | 必须出现之处 |
|---|---|---|
| M1 | 我参加的 / 我发起的角色切换 | 顶部 / 任一位置的身份切换；各角色记忆分区与滚动 |
| M2 | 当前 / 历史 / 草稿与必要筛选切换 | 分区切换 |
| M3 | 向上滚动、标题收拢、回滚、长页稳定层级 | 当前较多 / 历史较多 / 管理页 |
| M4 | 活动 / 票件进入详情、收起与返回来源 | 所有详情 / 票根 / 历史 / 管理进入与返回（同一对象身份连续；返回保留角色、分区、滚动位置与原项；状态移组时有合理新落点） |
| M5 | 审核、邀请、谢绝之后人数、席位、待处理项变化 | 申请审核 → 计数、席位、头部状态、列表徽标 |
| M6 | 局内弹层 / 抽屉 / 面板进入、切换、关闭 | 确认层、改时间、取消、散场、局卡、联系层、记录 |
| M7 | 改时间及答复：旧 / 新时间、旧 / 新票关系 | 改时间提交后局卡时间、参加者改期行与答复 |
| M8 | 出票 / 打印、撕票、联系信息展开、退出 / 取消与票件作废 | `tear` 首次出票（打印）、撕票（手势 + 键盘 / 按钮等价）、联系层、取消 / 退出 / 拒绝改期的燃烧 |
| M9 | 散场、逐人记录出席、印章落定、更正、归档 | 记为散场 → 出席区；每人选择 → 盖章 → 落定 → 焦点下一位（不自动翻页掩盖未保存）；更正留轨迹；历史不重放盖章 |
| M10 | 草稿删除、相邻补位、撤销恢复 | 草稿分区（10s 撤销，原槽位恢复） |
| M11 | 最后一项处理完转入空态或稳定结果 | 待审最后一份、出席最后一人、草稿最后一条、取消后 |

规则：对象连续（进入详情不先消失再出现无关矩形）；视觉连贯（停止后无模糊 / 残影 / 错位 / 白块 / 闪屏）；可打断（快速切换、连续返回、拖一半放手、反向、动画中关闭不留半完成界面）；**数据结果与动画结果分开**（失败可回退 / 重试，动画播完不等于业务成功）；节奏先看 1×，不以统一 300ms / 固定弹簧代替调校；高频小动作不过冲；核心长动作明确可重看 / 可中断 / 重复进入的稳定态（已完成的仪式不强制重播）。仪式：先复用已认可源；打印中不提前出现完成后的按钮；撕裂跟手、可取消、渐进断口、副券有归宿；燃烧作用于原票件并有确定结束态；既有时长与几何不缩成淡出。

## 6. 选择器约定（评审脚本按此操作）

`data-act="confirm|release|tear|contact|copy|contacted|accept|decline|withdraw|exit|leave-queue|approve|reject|propose|cancel|end|attend-present|attend-absent|attend-pending|correct|delete|undo|back|close|retry|ok|report|card"`；行根 `data-rid="<eventId|draftId>"`；覆盖层 / 弹层根 `.cNN-over`；当前表面根 `data-surface="<surface>"`；滚动容器 `data-scroller="<name>"`；起点元素 `data-origin="<key>"`；角色切换 `data-role-tab="joined|hosted"`；分区切换 `data-section-tab="current|history|drafts"`；管理区块 `data-section="apps|members|queue|contact|leaves|replies|attendance|arrange"`；输入 `data-field="date|time|text"`。

## 7. 验证（必须做；不能只看源码）

```
JU_FONTS_CSS=/home/user/JU/my-r2/.fonts/fonts-embed.css JU_STANDALONE=/home/user/JU/.build/CNN.html JU_ONLY=CNN node my-r2/src/build.js   # 内嵌字体（撕票原件依赖）
JU_STANDALONE=/home/user/JU/.build/CNN.html node my-r2/tools/coverage.cjs CNN /home/user/JU/my-r2/evidence/CNN/coverage      # 50/50, errors []
JU_STANDALONE=/home/user/JU/.build/CNN.html node my-r2/tools/widths.cjs CNN                                                  # 360/375/390/430 + zoom：overflow []，minFont ≥ 12
JU_STANDALONE=/home/user/JU/.build/CNN.html node my-r2/tools/kb-check.cjs CNN
JU_STANDALONE=/home/user/JU/.build/CNN.html node my-r2/tools/rm-check.cjs CNN                                                # 系统 prefers-reduced-motion 下终态完整
JU_STANDALONE=/home/user/JU/.build/CNN.html node my-r2/tools/capture.cjs CNN /home/user/JU/my-r2/evidence/CNN/<flow> '<actions>'
JU_STANDALONE=/home/user/JU/.build/CNN.html node my-r2/tools/flow-compare.cjs …                                              # 正常速度 JPEG 帧序列（录屏替代）
python3 -I my-r2/tools/shrink-evidence.py CNN
```
每套必交证据（任务书 §12）：① 参加者默认首屏 ② 局主默认首屏 ③ 一个普通局内详情 ④ 一个关键管理 / 出席状态 ⑤ 历史或空态 ⑥ 一次关键操作后的稳定结果；加：一条「进入—操作—返回」正常速度帧序列（`flow-compare.cjs`，≥ 24 帧）；打印 / 撕 / 燃烧 / 出席章各一组触发 / 发展 / 落定帧；三环境首屏；`long / many / empty` 首屏；360 与 430 宽首屏；键盘态；减少动态终态。每张图自己 Read 过。

## 8. 完成定义与覆盖表

- 覆盖 50/50、0 错误；widths / kb / rm 无 findings；最小字号 ≥ 12px；源文件 ≤ 200 KB；禁用词（扣分 / 信用分 / 处罚 / 等级 / 剩余次数）为 0；无评审控件泄漏进手机。
- 覆盖表五栏分开：**入口存在 / 真实操作成功 / 静态视觉已看 / 正常速度动效已看 / 仍需用户验收**——不得用一个「50/50 ✓」同时声称五件事。
- `my-r2/spec/motion/CNN.md`：十一族各自的实现记录（谁动、从哪到哪、时长曲线、打断与返回、减少动态终态）+ 关键视觉参数（字体角色与字阶、行宽实测、色板与前景面积、光源 / 表面规则、页头收拢实现）+「一个仍可能失败的设计判断与你如何检查」。

## 9. 已验证的模式与坑（继承两轮，仍然有效）

- 共享元素展开：起点矩形 `JU.fx.rectIn(el, this.rootRef.current)` → `phase:'start'` 渲染 → 读一次布局（`void el.getBoundingClientRect()`）→ `phase:'in'`；**不要非等比 scale 文字**；展开层从起点就带内容；返回反向到原对象。
- 引擎之后用返回的数据 `res.data`，不要在同一回调读 `this.state.data`。
- 定时器：动画落定 `this.after()`（随速度 / 减少动态）；toast / 撤销 10s / 倒计时逐秒 / 复制反馈用 `holdKey(key, ms, fn)`（真实时间窗，减少动态不压缩）。
- Shadow DOM：`this.rootRef.current.querySelector`，不用 `document.querySelector`；`setPointerCapture` 用 try/catch；横向拖动后屏蔽紧随 click；行根 `touch-action:pan-y`（撕票面 `touch-action:none`）。
- 返回动画用独立 `@keyframes` 名；keyframes 驱动几何的元素 `transition:none`。`is-under.ph-exit` 的终态必须等于 `is-top.ph-idle`。
- `jumpTo` 会重建数据：跨表面一致性用真实点击串联验证，不用 jump 串联。
- 被 mask 的元素内部一切都被 mask；灰烬 / 碎片放兄弟层；`@property` 名带前缀。
- 材质 / 滤镜不得影响文字清晰度；文字层永远在 `filter`/`backdrop-filter` 之外。
- 弹层：打开时焦点进入首个可操作元素，Esc / 关闭回到触发元素（控制器提供 `c.sheet.focusRef / onKeyDown`）。

## 10. 任务书 §10 修复项的落点

| 问题 | 谁实现 | 怎么验证 |
|---|---|---|
| 复制失败仍报已复制 | 核心 `this.copy()` | 面板武装复制失败 → 必须出现失败反馈与手动复制提示 |
| 系统 prefers-reduced-motion | 核心 mixin + 概念 `.rm` CSS | `rm-check.cjs`（emulateMedia） |
| 撕票键盘 / 按钮等价、模态焦点 | 核心 `c.ticket.tearNow` + 概念提供按钮 / 键盘入口；弹层焦点由 `c.sheet` | capture 用键盘撕票一次；弹层 Tab/Esc |
| `#compare` 直开先取索引 | 外壳：`window.__JU_INDEX` 构建时注入，比较控件在其后建立 | `offline-check.cjs` 直开 `#compare` |
| 比较视图卸载 | 外壳 `DCMini.unmount` + 实例 `clearTimers` + `getAnimations().cancel` | `offline-check.cjs` 切换三次后统计活动动画与定时器 |
| 可控时钟 | 核心 `JU.now/advance/settle` + 面板 | capture：+到期 → 预留过期 → 候补补位 |
| 尺寸与放大 | 面板 360/375/390/430 + 文字 115% + 安全区 + 键盘；真实回流 | `widths.cjs` |
| 字体打包 | 构建 `JU_FONTS_CSS` + `embed-fonts.py --common` | `offline-check.cjs` 断网加载无回退字体 |

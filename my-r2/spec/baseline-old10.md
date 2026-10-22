# 旧十套基线观察 · OLD10 实测（R2 基线观察员）

对象：`/home/user/JU/.build/baseline/OLD10.html`（与仓库根 `JU-My-Ju-Fable51-10-Concepts.html` 逐字节相同，构建时间 2026-10-12T04:43，4.36 MB）。
证据：`my-r2/evidence/baseline/old10/`，260 张 PNG（97.7 MB），全部为 390×844、deviceScaleFactor 2（780×1688 像素）。
索引：`my-r2/spec/old10-index.json`（`window.JU.INDEX`，50 项；文件里不存在 `window.__JU_INDEX`）。

## 0 方法、口径与限制

- 打开方式：Playwright + Chromium 1194（无头），直接 `file://` 打开 OLD10.html，走 `#concept/Cxx` 路由。壳层用 `DCMini.mount` 把每套挂进 `.stage-host[data-code]` 的 shadow root，实例在 `JUShell.mounts.stage['stage:Cxx:'].instance`。截图前隐藏壳层的顶栏/左栏并把 `.ju-stage` 的内边距归零，让 `.ju-phone`（390×844，`contain: layout paint`）正好落在视口 (0,0)；`.ju-phone` 的 38px 圆角和外阴影设为 0（这两项是评审画布的"手机框"，不属于产品画面）。每张截图前都执行评审面板同样的 `instance.reset()` + `instance.setSpeed(1)`，再 `instance.jumpTo(key)`（即面板"状态索引"按钮调用的函数），等待 1.5 s 再截。
- 字体：10 套引用的 Google Fonts 全部加载成功（`document.fonts` 无 error，无 requestfailed）。所有字号/字族来自 `getComputedStyle`，位置宽度来自 `getBoundingClientRect`，均为 CSS px。
- 颜色面积：对截图按 RGB 极差 ≥ 40 判为"有彩"，按明度 L<0.35 / >0.75 判深/浅，样本为整张 390×844。
- 运动：用 CDP `Page.startScreencast` 录真实合成帧（带帧时间戳），路径固定为"参加者首页 → 点第一条（lead）→ 点次要动作『去不了了』→ 点取消 → 点返回 → 点『我发起的』"，再用同一路径按关键点补 2× 截图。帧率受无头合成器限制：一次过渡只有 3–30 帧，"首次变化/最后变化"的毫秒数精确到帧间隔（30–300 ms），只能说明量级，不能当作精确时长。没有测撕票/剪票等拖拽手势，没有测对比度比值。
- 评审面板本身（1×/0.5×/暂停/关键帧/演示数据/重置）在十套里都存在且可用；本文只用了它的 reset/1×/jumpTo。

逐套字段的"行宽"口径：**标题可用宽度** = 普通条目（非 lead）里活动标题元素的实测宽度；括号里是它占整屏 390px 的比例。

---

## 1 C01 票据卷

截图：`C01-joined-home.png` `C01-hosted-home.png` `C01-detail-ticket.png` `C01-detail-invited.png` `C01-manage-review.png` `C01-manage-attendance.png` `C01-manage-card.png` `C01-draft.png` `C01-joined-history.png` `C01-hosted-history.png` `C01-hosted-drafts.png` `C01-history-ended.png` `C01-confirm-withdraw.png` `C01-empty-joined.png` `C01-empty-hosted.png` `C01-long-joined.png` `C01-joined-many.png` `C01-path-*.png` `C01-motion-*-strip.png`

- 主导构图：深灰"打印机外壳"（#29262e）占满上 100px（品牌 + 角色开关）与下 48px（底栏 "STUBS · ASH"），中间是 342px 宽的米色纸带（x=24–366，#f3efe6），纸带内文 306px（x=42–348）。纸带里的条目标题是满宽的 306px（78%）；带票根的条目在时间行右侧放 46×46 的迷你票（`c01-obj`），历史页"散场"条目右侧 52.6px 的出席章把标题压到 190px。列表可滚高度 1530px（视口 696px）。
- 字号实测：lead 标题 21px/700，普通标题 20px/500（Noto Sans SC）；时间 28px/500 DM Mono；状态签 11px DM Mono（白字黑底）；地点 13.5px；说明 12.5–13px；CTA 14px/500。页面上最常见的字号是 20、13.5、11px（按字符数）。
- 物件与文字关系：文字就是纸带上的打印内容，齿孔、横向虚线和深色外壳是"打印机"叙事；物件（迷你票、出席章、改期戳）贴在时间行右侧，不与标题争同一行。
- 前景颜色面积：有彩像素 0.2%（只有红色"改期/出席"戳），深色 32%（外壳）、浅色 59%（纸）。整套本质上是黑白。
- 表面与光：无 backdrop、无滤镜；7 个阴影、8 个渐变（纸带卷边/齿孔），纸面有轻微横纹。`C01-manage-card.png` 的局卡是一张贴胶带的斜纸条浮在变暗的纸带上。
- 详情/管理页：全部是同一条纸带继续打印——详情（`C01-detail-invited.png`）、工单（`C01-manage-review.png`，"工单 · 管理这局 · WO-BAR"）、出席、草稿、历史票根都用同一个"返回 我参加的 · 当前"抬头 + 同一纸面；材料没有退回通用面板，但结构上十页同构（见 §11-3）。
- 代表性运动（`C01-motion-enter-strip.png`）：点 lead 后约 0.16 s 列表整体变淡（其余条目先退），0.6 s 纸带只剩抬头、以下空白，1.0 s 详情打印到成员名单，1.48 s CTA 出现并停稳（屏录 30 帧，最后一次变化 +1.36 s）。返回（`C01-motion-back-strip.png`）：0.13 s 详情淡出，0.39–0.89 s 之间纸带上只剩一行标题、其余全空（约 0.5 s 的"空纸"段），1.5 s 列表才回来。切换到"我发起的"（`C01-motion-switch-strip.png`）：0.2–0.37 s 纸带整体上卷，0.67 s 纸带几乎全空（只剩顶部分段按钮），1.31 s 才打印完——一次日常切换要 1.3 s 并经过一帧近空白。无跳帧/黑帧，但有空纸帧。
- 对评审判断的核验："打印机与热敏回单的叙事先占据了完整外壳，活动内容被安置在其中"——**证实**：外壳占 32% 像素，可用纸面 342px，每一页（含管理、草稿）都必须是"打印件"。但补充一点：纸面内部的阅读其实是十套里最干净的（标题 20–21px 满宽、地点 13.5px、无遮挡），问题不在可读性，在于品牌等于"收据"。"参数不能证明实际顺滑"——实测走纸/返回/切换都在 1.3–1.5 s，并且中途有空纸帧。

---

## 2 C02 站牌

截图：`C02-joined-home.png` `C02-hosted-home.png` `C02-detail-ticket.png` `C02-detail-invited.png` `C02-manage-review.png` `C02-manage-attendance.png` `C02-manage-card.png` `C02-draft.png` `C02-joined-history.png` `C02-hosted-history.png` `C02-hosted-drafts.png` `C02-history-ended.png` `C02-confirm-withdraw.png` `C02-empty-joined.png` `C02-empty-hosted.png` `C02-long-joined.png` `C02-joined-many.png` `C02-path-*.png` `C02-motion-*-strip.png`

- 主导构图：黑板（#131518）满屏，顶部"我的局 28px/900 + DEPARTURES · 我参加的"、右上翻牌时钟，然后一行表头"时间 · TIME / 局 · EVENT / 状态 · STATUS"。lead 卡 366×240（x=12），翻牌时间 4 格 27×46（共 130.5px）在左，标题从 x=169 起只有 195.5px（50%）。普通条目满宽 390 但左侧翻牌时间 86.5px、右侧翻牌状态字（已 预 留）约 60px，标题 196–214px（50–55%）。列表可滚高度 1203px。
- 字号实测：lead 标题 18px/700，普通标题 16px/700；时间是 Unbounded 翻牌数字（lead 23px、普通 15px）；状态翻牌字 12.5px；地点/日期 10–10.5px Archivo Narrow 600（全大写英文 + 中文，整页最小的正文）；CTA 14.5px/700。最常见字号 12.5、15、10.5px。
- 物件与文字关系：每个时间数字、每个状态字都是一个独立"翻牌格"（`c02-fc/c02-fh`，599 个可见元素里 174 个圆角盒、182 个渐变、61 个阴影），活动名称是唯一不带机械外框的文字，视觉上反而最轻。
- 前景颜色面积：深色 92%、浅色 2%，有彩 4.1%（黄/橙：CTA、角色胶囊、警示点）。
- 表面与光：翻牌格有上下分割线与内阴影，CTA 是黄色凸起按钮（`C02-manage-review.png` 里还有一个摇杆：谢绝｜摇杆｜发出邀请）。无模糊。
- 详情/管理页：详情是同一块黑板上的"DETAIL · GATE/RESERVED"，标题变成一行翻牌字（已 预 留 · 等 你 确 认），票是一张磁卡 + "插卡 · INSERT"读卡槽（`C02-detail-ticket.png`）；管理是"操作盘 · 局主"（`c02-mpanel`，390×844 的同色面板，`C02-manage-review.png`）；局卡/草稿都是从底部升起的黑色抽屉。材料一致，结构与其它九套相同。
- 代表性运动（`C02-motion-enter-strip.png`）：点 lead 后 0.45 s 内没有任何变化（13 帧中第一帧有变化在 +446 ms），0.63 s 其它条目消失、黑板空出一大块，1.08 s 顶部标题栏换成详情抬头，1.67 s 翻牌字逐个翻完停稳。返回（`C02-motion-back-strip.png`）：0.34–1.03 s 黑板上只剩一条标题行，其它区域空，1.58 s 列表回来。切换角色：0.33 s 角色胶囊先翻成空白块，0.44 s 整个列表淡成 15% 左右的残影，0.98 s 新列表翻入，1.16 s 停稳。
- 对评审判断的核验："数字、状态和机械单元取得明显存在感，活动名称相对退后"——**证实**：机械格占了条目左右 146–190px，标题只剩一半宽度、16px；地点缩到 10px 窄体英文。"更像调度设备的精密，而不是值得期待的见面"——画面证实：整屏 92% 是黑色，唯一的人味是 10px 的"威廉斯堡"。补充：进入详情前有约 0.45 s 的无反馈空档。

---

## 3 C03 刊

截图：`C03-joined-home.png` `C03-hosted-home.png` `C03-detail-ticket.png` `C03-detail-invited.png` `C03-manage-review.png` `C03-manage-attendance.png` `C03-manage-card.png` `C03-draft.png` `C03-joined-history.png` `C03-hosted-history.png` `C03-hosted-drafts.png` `C03-history-ended.png` `C03-confirm-withdraw.png` `C03-empty-joined.png` `C03-empty-hosted.png` `C03-long-joined.png` `C03-joined-many.png` `C03-path-*.png` `C03-motion-*-strip.png`

- 主导构图：整页白纸（#f6f4ef），刊头"参加刊 40px/900 Noto Serif SC + 发起刊 21px + 日期『17』66px Instrument Serif + CONTENTS · NO. 12 · JOINED + 本期/往期/Contents"占顶部 180px。lead 条目 334px（x=34），标题满宽 334；普通条目左侧是 42–46px 的页码列（004/008/012，Instrument Serif），标题从 x=80 起 264px（68%）。目录页可滚高度 1706px（十套里第二长）。
- 字号实测：lead 标题 31px/700 Noto Serif SC，普通标题 20px/700；时间 16/14px Instrument Serif；状态 13/12.5px；地点 14/13px；CTA 17px/700（红色"阅读并确认 →"）；页码 20px。最常见字号 13、14、12.5px。
- 物件与文字关系：没有实物道具，但有大量"刊物语义"：页码、"要你回应 · 已预留"眉题、右侧小方框图标、"编辑部 · 第 076 页"、"来稿 · 申请 / 批注"、"存稿 · 未排版"（`C03-manage-review.png` `C03-draft.png`）。历史页改成 3 列封面格（104.7×139.5，标题 12.5px，`C03-joined-history.png`）。
- 前景颜色面积：浅色 91%，有彩 1.3%（校对红）。黑白红三色。
- 表面与光：无阴影、无滤镜（stats: shadow 0），只有细线与红线；详情顶部是一块 390×204 的牛皮色版头（`c03-plate`，#d3bb95）。
- 详情/管理页：详情 = 跨页（版头 + 三栏日期/地点/席位 + 票根），管理 = "编辑部"，出席 = 同一纸面的列表；全部是同一张白纸换版式，深层页没有"刊"之外的新结构。
- 代表性运动（`C03-motion-enter-strip.png`）：屏录在点后 0.65 s 前没有产生新帧，0.65 s 的帧仍是目录，0.87 s 的帧已是完整跨页——中间的"翻页"没有被录到任何中间帧（无头合成器可能丢帧，也可能翻页只在很短时间内可见）；按画面看，这就是一次切换，不是一次翻页。返回：0.03–1.9 s 之间 9 帧，最大单帧变化 99%（整屏替换），1.9 s 才停。切换到"发起刊"：0.69–1.15 s 换刊头与目录。
- 对评审判断的核验："它并不缺大字。问题在于日期、页码、目录与活动管理同时争夺主次"——**证实**：66px 的"17"和 40px 的"参加刊"比 31px 的活动标题更大；页码列让普通标题从 x=80 开始；"编辑部/来稿/批注/存稿"把管理语义换成刊物语义。补充：长地点在这套里不换行只截断（"威廉斯堡北六街与贝德福…" 330px 容器、实际 378px，`C03-long-joined.png`）；宋体 31px 标题本身是十套里读起来最稳的一个。

---

## 4 C04 夜玻璃

截图：`C04-joined-home.png` `C04-hosted-home.png` `C04-detail-ticket.png` `C04-detail-invited.png` `C04-manage-review.png` `C04-manage-attendance.png` `C04-manage-card.png` `C04-draft.png` `C04-joined-history.png` `C04-hosted-history.png` `C04-hosted-drafts.png` `C04-history-ended.png` `C04-confirm-withdraw.png` `C04-empty-joined.png` `C04-empty-hosted.png` `C04-long-joined.png` `C04-joined-many.png` `C04-path-*.png` `C04-motion-*-strip.png`

- 主导构图：深蓝黑底（#05080c 系）上四个 blur(16px) 的彩色光斑（220/260/150/70px），顶部"我的局 27px + 当前/历史 + 玻璃胶囊角色切换"占 150px。条目是 350px 玻璃卡（x=20），lead 卡 273px 高，标题 314px（90%）；普通卡三列：左侧时间 36–45px（Sora 17px）、中间标题 185–197px（53–56%）、右侧 45–64px 的"小物件位"（深色小时间块或 JU 迷你卡）。可滚高度 1314px。
- 字号实测：lead 标题 22px/500，普通标题 15px/500；时间 Sora 15–17px/600（右侧物件框里的时间 11px/700）；状态 12px；地点 13/12px；CTA 15px；详情里倒计时 44px Sora。最常见字号 15、11、12px。
- 物件与文字关系：每条右侧固定留 45–64px 给一个小玻璃物件（带 JU 字样或缩小的时间），标题被压到一半宽；lead 的 JU 迷你卡 52px 宽。
- 前景颜色面积：深色 84%，有彩 17.9%（蓝 12.3% + 橙 5.5%：光斑、CTA、进度条）。
- 表面与光：主页 26 个阴影、7 个 backdrop-filter、7 个 filter、15 个渐变；详情页 backdrop 14、filter 11、shadow 56。玻璃边缘有高光线。文字本身可读（白字），但一进入详情，整个列表被模糊成不可读的色块（`C04-motion-enter-strip.png` 第 2–5 帧）。
- 详情/管理页：详情、管理、出席、草稿都是同样的深蓝玻璃卡堆（`C04-manage-review.png` 的申请卡还做了"谢绝 ‹ 头像 › 发出邀请"滑块）；局卡是从底部升起的毛玻璃抽屉。材料一致，结构同其它九套。
- 代表性运动：点 lead 后 0.25 s 详情已经在位、列表开始虚化，0.37 s 列表完全糊掉，但详情内容从 0.75 s 到 1.8 s 仍在缓慢上漂（返回按钮被顶出画面、倒计时块从 y≈400 漂到 y≈280），屏录最后一次变化在 +2.5 s——进入后 2.5 s 画面还没停稳。点"去不了了"后 0.93 s 才出现确认层。返回：0.08–2.3 s 一直有变化（9 帧，最大单帧 69%）。切换角色 0.18–0.7 s，干净。
- 对评审判断的核验："空间层次依赖透明、叠压、虚焦和缩放，实际文字对比与可读性需渲染核验"——**部分证实**：静止的首页白字在深玻璃上可读（没有低透明度文字，dimText 为空）；真正的问题是（1）三列结构让普通标题只剩 185–197px；（2）进入详情时把列表整体虚焦成不可读色块，而且详情本身 2.5 s 还在漂；（3）玻璃层数在深层页只增不减（详情 14 个 backdrop）。"玻璃层数不能替代内容面的完整性"——证实。

---

## 5 C05 缝线

截图：`C05-joined-home.png` `C05-hosted-home.png` `C05-detail-ticket.png` `C05-detail-invited.png` `C05-manage-review.png` `C05-manage-attendance.png` `C05-manage-card.png` `C05-draft.png` `C05-joined-history.png` `C05-hosted-history.png` `C05-hosted-drafts.png` `C05-history-ended.png` `C05-confirm-withdraw.png` `C05-empty-joined.png` `C05-empty-hosted.png` `C05-long-joined.png` `C05-joined-many.png` `C05-path-*.png` `C05-motion-*-strip.png`

- 主导构图：坯布底（#e1dac8，带布纹）上放 350px 的"裁片"纸（x=20，折角、虚线针脚）；裁片内文 306–310px（78–79%），标题满宽。顶部"我的局 36px/300 Noto Serif + 4 项要你回应（Cormorant 斜体）+ 当前/历史"占 180px；分组标题用手写体（Zhi Mang Xing 23px，"要你回应"）。可滚高度 1896px（十套里最长，因为每片之间留 20–30px 布面）。
- 字号实测：lead 标题 24px/500 Noto Serif SC，普通 19px；时间 Cormorant 42px/600（lead）、27px（普通）；状态签 11px；地点 12px；说明 12.5px；CTA 15px/500（藏青缝边按钮）。最常见字号 12、19、12.5px。
- 物件与文字关系：大头针（×）、白标、吊牌 + 棉线（`C05-detail-ticket.png`）、"存根袋"、订单簿里的"座位表"是一条带刻度的布尺（`C05-manage-review.png`）。文字边线稳定（左边 42px），物件放在右上角不挤标题。
- 前景颜色面积：浅色 89%，有彩 0.9%（朱红状态字）；藏青 + 米白 + 朱红。
- 表面与光：6 个阴影、8 个 filter（布纹用 SVG 噪点）、12 个渐变；进入详情时背景用 `blur(2px) brightness(0.9)`。
- 详情/管理页：详情 = 同一张裁片翻开（"局内"），管理 = "订单簿 · JU-BAR"，出席、草稿同纸同针脚。材料一致。
- 代表性运动（`C05-motion-enter-strip.png`）：点后 0.13 s 列表微暗，0.33 s 裁片从点按处以 3D 折线翻开（能看到一帧折叠中的中间态），0.63 s 落平，0.89 s 后无变化——十套里最快最连续的进入之一（20 帧，最后变化 +0.89 s）。确认层 0.12–0.4 s；返回 0.12–0.84 s（89 帧，连续）；切换 0.07–0.57 s。无空白帧。
- 对评审判断的核验："设计师品牌的借鉴主要变成了裁缝工艺符号"——**证实**：针、线、吊牌、布尺、白标、手写体都在画面里，而且管理页把"席位"做成布尺刻度。但有一点与评审的担心相反：这套的中文行长（306px 满宽）、字阶（42/24/19/12）和运动连续性是十套里最成立的，失败在气质（手工坊）而不在排版。

---

## 6 C06 桌面

截图：`C06-joined-home.png` `C06-hosted-home.png` `C06-detail-ticket.png` `C06-detail-invited.png` `C06-manage-review.png` `C06-manage-attendance.png` `C06-manage-card.png` `C06-draft.png` `C06-joined-history.png` `C06-hosted-history.png` `C06-hosted-drafts.png` `C06-history-ended.png` `C06-confirm-withdraw.png` `C06-empty-joined.png` `C06-empty-hosted.png` `C06-long-joined.png` `C06-joined-many.png` `C06-path-*.png` `C06-motion-*-strip.png`

- 主导构图：俯视桌面——上下木边（#242018）、绿毡（#2c4136），物件散放：lead 是 340×209 的黄色便签（x=25，旋转 0°），其后是 348×195 的票根（x=17，旋转 −2.5°）、343×211（x=21，+0.9°）、348×195（x=19，−2.5°）。相邻物件实测**互相压住 12–16px**（brunch/livehouse 重叠 14px，livehouse/run3k 12px，run3k/coffee 16px）。票根类条目右 1/3 是"副券 · 撕下"竖排存根，标题只有 222–224px（64%）。可滚高度 1839px。
- 字号实测：lead 标题 18px/700，普通 16.5px/700（Noto Sans SC）；时间 Space Mono 21px/700（lead）、19/14px；状态 12px/700；地点 12.5/12px；说明 10.5px；小字 9.5px（票根编号 JU-LIVEHO-2、№2）。最常见字号 12、9.5、10.5px。
- 物件与文字关系：文字左边线随物件漂移（43 / 37 / 42px），再加旋转，没有一条稳定的阅读边；拍立得（`C06-joined-history.png`，绿色网格照片 349×229）把标题推到 y=391、宽 192px；管理页是夹板（`C06-manage-review.png`，木纹 + 金属夹 + 便签 + 木头按钮）。
- 前景颜色面积：参加者首页有彩 52.6%（橙 28.8% + 黄 22.8%：便签、牛皮票、绿毡），深色 41%、中间 33%、浅色 26%；局主首页有彩只有 10.8%（白纸 + 绿毡）。两个角色的首页色彩面积差 5 倍。
- 表面与光：24 个阴影、11 个旋转元素、17 个渐变、2 个 text-shadow、1 个 mix-blend；撕边用 blur(0.5px)；进入详情时整桌 `brightness(0.52) saturate(0.8) blur(2.6px)`。
- 详情/管理页：详情 = 把物件"拿起"放到桌面上方（便签放大），下面是白纸信息（`C06-detail-invited.png`）；管理 = 夹板 + 便签 + 木头按钮；出席 = 红色"出席"圆章；局卡 = 拍立得。材料一致。
- 代表性运动（`C06-motion-enter-strip.png`）：0.10 s 桌面变暗，0.34 s 便签抬起放大、其余物件虚化，0.66 s 详情白纸到位，1.05 s 停稳（14 帧，最大单帧 60%）。返回 0.27–1.12 s（17 帧）；切换角色 0.34–1.18 s，中途整桌变暗再亮（最大单帧 81%）。无空白帧，但有一帧全暗。
- 对评审判断的核验："多种材质、叠压与旋转让每条活动都成为独立小物件，稳定的文字边线被削弱。是否实际遮挡尚未验证"——**证实并补上实测**：相邻物件重叠 12–16px（便签压住下一张票的上沿），旋转 ±2.5°，标题左边线在 37–43px 之间漂；文字本身没有被相邻物件盖住（遮挡检查只发现底栏盖住折下去的条目），但长地点在便签上截断到 164px。"长内容处理与扫描成本有明确风险"——长标题两行夹 `…`，地点单行截断，证实。

---

## 7 C07 格盘

截图：`C07-joined-home.png` `C07-hosted-home.png` `C07-detail-ticket.png` `C07-detail-invited.png` `C07-manage-review.png` `C07-manage-attendance.png` `C07-manage-card.png` `C07-draft.png` `C07-joined-history.png` `C07-hosted-history.png` `C07-hosted-drafts.png` `C07-history-ended.png` `C07-confirm-withdraw.png` `C07-empty-joined.png` `C07-empty-hosted.png` `C07-long-joined.png` `C07-joined-many.png` `C07-path-*.png` `C07-motion-*-strip.png` `C07-motion-confirm-strip.png`

- 主导构图：浅灰底（#e7e8e3），顶部"我的局 27px/700 + 黑色胶囊角色切换 + 当前/历史"占 204px（十套里最高的头部），格盘从 y=244 起：大格 358×304（橙 #ff6b35）、宽条 358×144、小格 174×156 双列。lead 大格里右上是 157.8×50 的倒计时块（34px DM Mono），标题 24px 排在左侧 148px（分成两段），左边距 15px；小格标题 14.5px/144px；宽条标题 16.5px/242px（68%）。可滚高度 1334px。
- 字号实测：标题 24 / 16.5 / 14.5px（600）；时间 DM Mono 15 / 14 / 13px，倒计时 34px，局主大格的"2 份申请待审"中的 2 是 56px；状态 12 / 11.5 / 11px/600；地点 13.5 / 12.5 / 12px；CTA 15.5px/600。最常见字号 11、14.5、11.5px——小字最多的一套之一。
- 物件与文字关系：格子本身就是物件，面积由"紧急程度"决定；小格有二维码角标；小格"改期"条目实测没有地点（livehouse 小格 hood 为空，run3k 小格有"中央公园"）——源码特判在画面上成立。
- 前景颜色面积：有彩 30.1%（橙 29.8%，其中 #ff6b35 一块就是 26.3%），浅色 60%。管理页橙色 35%。
- 表面与光：12 个阴影、63 个圆角、无滤镜；进入详情时主面 `blur(1.5px) brightness(0.86)`。
- 详情/管理页：详情 = 大格展开成整条橙色版头 + 白格堆（`C07-detail-invited.png`，右上有一串格子导航点），管理 = 橙色版头 + 申请卡（`C07-manage-review.png`），出席/草稿 = 白格。材料一致。
- 代表性运动（`C07-motion-enter-strip.png`）：0.22 s 其余格子开始退后变灰、大格抬起，0.32 s 其余格子虚化，0.57 s 大格向上展开成版头、下面格子仍虚，1.0 s 详情格堆到位，1.3 s 停稳（9 帧，最大单帧 71%）。点"去不了了"后 **1.04 s 画面才第一次变化**、1.12 s 确认层弹出（`C07-motion-confirm-strip.png` 前三帧完全相同）——这是十套里最长的无反馈空档。返回 0.35–2.24 s 一直在动（15 帧）。切换角色 0.02–0.55 s（FLIP 重排，最快的切换之一）。
- 对评审判断的核验："面积权重主要服务计数与处理状态，固定几何会反过来要求内容让位"——**证实**：大格里 34px 倒计时和 56px 计数比 24/20px 标题更大更靠上；小格 174px 宽只放得下 14.5px 标题并砍掉地点；宽条 242px。"不是只换皮"——也证实，它确实按状态分配面积，而且 FLIP 切换 0.55 s 就停。

---

## 8 C08 时间尺

截图：`C08-joined-home.png` `C08-hosted-home.png` `C08-detail-ticket.png` `C08-detail-invited.png` `C08-manage-review.png` `C08-manage-attendance.png` `C08-manage-card.png` `C08-draft.png` `C08-joined-history.png` `C08-hosted-history.png` `C08-hosted-drafts.png` `C08-history-ended.png` `C08-confirm-withdraw.png` `C08-empty-joined.png` `C08-empty-hosted.png` `C08-long-joined.png` `C08-joined-many.png` `C08-path-*.png` `C08-motion-*-strip.png`

- 主导构图：浅灰底（#e6e8e1），左侧 56px 纸尺（x=0–56，黄铜铆钉、刻度 13:00/14:00…、日期块"六 12.19"），红色"NOW · 周四 12.17 · 15:00"横线在 y=143；活动块满宽 390（`c08-blk`），里面的卡 306px（x=67–373），标题从 x=81 起 278px（71%）。块与块之间有虚线"另一段"分隔，即尺子是分段的，不连续。可滚高度 1625px。
- 字号实测：lead 标题 20px/700，普通 18px/500，历史 14px；尺上时间 Bricolage Grotesque 12.5px/700（宽 26–31px）；状态 12.5px；地点 12.5px；说明 10.5px；CTA 15px；详情倒计时 30–40px。最常见字号 12.5、10.5、18px。
- 物件与文字关系：尺子只是一条装饰列（刻度与块高不对应：lead 块 251px 高覆盖尺上 11:30→14:00，活动并没有时长信息；下一条 21:30 紧接着画在它下面并标"另一段"）；副券在块右端（`C08-joined-home.png` 第三条"副券 →"占右侧 80px，标题缩到 204px）。
- 前景颜色面积：浅色 86%，有彩 2.4%（红 NOW 线、绿进度、黄铜）。
- 表面与光：46 个阴影（块、铆钉）、16 个渐变、无滤镜；纸尺有焦痕纹理。
- 详情/管理页：详情是从右侧滑入的 334px 面板（x=56–390，`c08-pane`），左边的尺子仍露着 56px 当装饰，内文 301px；管理同一面板（`C08-manage-review.png`，顶部"看展搭子 · 现代馆"版头 + 成员条）；局卡是托盘里的票。材料一致。
- 代表性运动（`C08-motion-enter-strip.png`）：0.16 s 面板从右侧滑入（0.29 s 已过半），0.73 s 基本到位，0.83 s 停稳（7 帧，连续）。返回 0.15–0.7 s 面板滑出，0.98 s 列表回位，1.47 s 时 lead 卡出现红色描边"落点"提示。切换角色：0.26 s 列表淡出、0.36 s 角色块翻转、0.57 s 新列表淡入、0.84 s 停稳。无空白帧。确认层 0.02–0.4 s。
- 对评审判断的核验："可独立借鉴的是时间在左、内容在右；现实现不能被解释为准确连续的日程轴"——**证实**：尺子按块分段（"另一段"），块高由内容决定，刻度只在块内，截止时间（6 小时倒计时）不在尺上，而在卡里。补充：这套的进入/返回/切换是十套里最短且连续的（0.8 / 1.0 / 0.84 s），说明"抽屉式详情 + 列表留在原位"这个关系在实测上成立；要舍弃的是铆钉、焦痕、纸尺纹和副券。

---

## 9 C09 影印贴纸

截图：`C09-joined-home.png` `C09-hosted-home.png` `C09-detail-ticket.png` `C09-detail-invited.png` `C09-manage-review.png` `C09-manage-attendance.png` `C09-manage-card.png` `C09-draft.png` `C09-joined-history.png` `C09-hosted-history.png` `C09-hosted-drafts.png` `C09-history-ended.png` `C09-confirm-withdraw.png` `C09-empty-joined.png` `C09-empty-hosted.png` `C09-long-joined.png` `C09-joined-many.png` `C09-path-*.png` `C09-motion-*-strip.png`

- 主导构图：顶部 164px 的"碳粉黑"版头（#111，"JU · ZINE № 12"、"我的局"36px 黄油体、手写黄色日期、两条白纸角色条），下面灰纸（#dad9d2）上放 358px 白页（x=16）。lead 页 288px 高，标题 312px（87%）。普通条目三列：左 76px 时间列（24px 黄油体 + 11.5px 日期地点）、中间标题 162px（45%）、右 54–66px 物件列（迷你票/贴纸）。可滚高度 1794px。
- 字号实测：lead 时间 40px、标题 29px（ZCOOL QingKe HuangYou，400）；普通标题 20px、时间 24px；状态贴纸 15px/700（lead）、11px；地点 13 / 11.5px；CTA 15px/700；手写批注 21px Liu Jian Mao Cao；页码 p.01 手写。最常见字号 12、20、11px。
- 物件与文字关系：粉色贴纸（旋转 −6°～+6°，11 个旋转元素）、黄色荧光笔划、胶带、"p.01"页码、"副券口袋"；普通条目的地点被 76px 列截断成"威廉斯堡北六…"（`C09-long-joined.png`），标题两行夹 `…`。
- 前景颜色面积：浅色 57%、深色 34%（版头 + 底栏），有彩 3.4%（黄 1.9% + 品红 1.4%）。"荧光"只是贴纸大小的点。
- 表面与光：16 个阴影、3 个 mix-blend（半色调）、11 个旋转；页面有复印噪点。
- 详情/管理页：详情 = 白页（34px 黄油体标题 + 剪刀线票 + 副券口袋，`C09-detail-ticket.png`），管理 = "贴纸纸 · 管理这局"（邀请贴 №4/№5 可揭，申请条手绘框，`C09-manage-review.png`），出席 = 粉/黄贴纸，局卡 = 黄色便利贴，草稿 = 虚线框。材料一致。
- 代表性运动（`C09-motion-enter-strip.png`）：点后 0.53 s 和 0.62 s 的帧与静止画面一样（只有按压态），0.7–1.2 s 页面从右下滑入并把下面的条目推开（1.22 s 帧里第二条被挤到一半），1.34 s 停稳——有约 0.6 s 的无反馈空档。返回 0.26–0.89 s，0.99 s lead 页出现粉色描边落点。切换角色（`C09-motion-switch-strip.png`）：0.2 s 角色条翻转，0.36 s 列表褪成 20% 残影，0.62 s 几乎全白（只剩版头），1.07 s 新列表到位，1.27 s 停稳——一次切换经过一帧近空白。次要动作"去不了了"在详情里位于 y=945，首屏之外，脚本没点到（路径里 confirm 段为空）。
- 对评审判断的核验："主动的 DIY 小志视觉态度，放大展示字体已经发生，继续放大不会修正内容宽度和品牌方向"——**证实**：40/29px 大字只在 lead 一条上，其余条目标题 162px、地点 76px 截断；黑色版头 164px 占屏 19%，比任何一条活动都大。补充：切换角色有 0.6 s 近空白帧，进入前有 0.6 s 空档。

---

## 10 C10 胶片

截图：`C10-joined-home.png` `C10-hosted-home.png` `C10-detail-ticket.png` `C10-detail-invited.png` `C10-manage-review.png` `C10-manage-attendance.png` `C10-manage-card.png` `C10-draft.png` `C10-joined-history.png` `C10-hosted-history.png` `C10-hosted-drafts.png` `C10-history-ended.png` `C10-confirm-withdraw.png` `C10-empty-joined.png` `C10-empty-hosted.png` `C10-long-joined.png` `C10-joined-many.png` `C10-path-*.png` `C10-motion-*-strip.png`

- 主导构图：暗房黑（#0c0906）+ 琥珀，顶部"JU · 暗房 · 接触印样 / 我的局 28px / 本周 12.13(日)~12.19(六) / A 我参加的 · B 我发起的 / 当前 历史 · SHEET A · NOW"占 194px。每个分组是一条**横向**胶片轨（`track`，clientWidth 390、scrollWidth 1254 → 4 条活动要横滑 3.2 屏），首帧 300×260（x=18，上下各 22px 齿孔，内框 275×199），标题 18px/256px（66% 屏宽）；其它轨 252×222 帧，标题 16px/208px（53%）；每轨只露出 1.24 帧，第二帧只露 72px。纵向可滚高度只有 952px，但横向总宽 1254 + 810px。
- 字号实测：标题 18 / 16px（500）；时间 Space Mono 26 / 22px/700；状态 12px；地点 12px；说明 12px；CTA 14px；齿孔旁的帧号/标签 7.5–8px Space Mono（参加者首页上 8px 字有 76 个、7.5px 有 26 个，是整页第二多的字号）。
- 物件与文字关系：未"点亮"的帧整帧降透明（实测 '20:30' 26px 在 0.6、'预留到期前阅读约定并确认' 0.68、'SAT 12.19' 0.72），点亮的帧是奶白底（#fff9ea）黑字；帧号、JU 400、RESPOND · 01、01/04 分页器全是 8px 英文。
- 前景颜色面积：深色 82%，浅色 14%（点亮帧），有彩 6.6%（琥珀）。
- 表面与光：9 个阴影、20 个渐变（齿孔、灯箱光晕）；管理页有放大镜（`C10-manage-review.png` 的 loupe）和红蜡笔字（Long Cang）。
- 详情/管理页：详情 = 顶部一帧底片 + 下方文字（`C10-detail-invited.png`，倒计时 30px 琥珀），管理 = 灯箱接触印样（申请者是 3 格小底片 + 放大镜），出席 = 红圈"出席"手写，局卡 = 安全灯红色抽屉。材料一致。
- 代表性运动（`C10-motion-enter-strip.png`）：0.14 s 按压，0.37 s 被点的帧抬起放大、其余变暗（一帧明显发糊的中间态），0.61 s 详情到位、内容仍暗，1.01 s 停稳（18 帧）。返回 0.11–0.97 s（帧缩回轨道）；切换角色 0.19 s 整个轨道横向滑走、0.42 s 新轨道到位、0.76 s 停稳。确认层 0.15–0.38 s。无空白帧。
- 对评审判断的核验："多轨道横滑分散了活动扫描路径；以曝光降低整帧内容透明度，会让信息清晰度服从材质故事"——**证实**：4 条"要你回应"要横滑 3 屏，第二条只露 72px；未点亮帧的时间字只有 60% 不透明；8px 英文标签比 12px 中文正文还多。补充：这套的进入/返回/切换是连续的（≤1 s，无空白帧），问题在扫描路径与对比度，不在运动。

---

## 11 十套共同的失败惯性（≥6，每条带证据）

1. **先给道具或外壳留位，活动名称再去填剩下的宽度。** 普通条目的标题可用宽度：C02 196px、C09 162px、C04 185–197px、C06 222px、C07 144–242px、C10 208px、C08 278px；占用者分别是翻牌格（130/86px）、时间列 + 物件列（76 + 54）、三列小物件位（36 + 45–64）、副券存根、倒计时块（158px）/小格、齿孔 + 帧边（22+22 + 帧宽 252/390）、纸尺（56px）。只有 C01/C03/C05 的标题满宽（306/334/306px），而它们用的是收据、刊物、裁片外框。证据：各套 `*-joined-home.png`、`*-long-joined.png`。
2. **"大字"只落在一条 lead 上，其余正文退到 10–12.5px。** 十套参加者首页按字符数最常见的字号：C01 20/13.5/11、C02 12.5/15/10.5、C03 13/14/12.5、C04 15/11/12、C05 12/19/12.5、C06 12/9.5/10.5、C07 11/14.5/11.5、C08 12.5/10.5/18、C09 12/20/11、C10 8/12/16。C10 有 102 个 7.5–8px 字，C02 地点 10px 窄体，C06 说明 9.5–10.5px。大字（C03 66/40、C05 42、C07 56/34、C09 40/29）都在头部或 lead，不改变第二条以后的阅读。
3. **深层页没有退回"通用面板"，但十套的深层页互相是同一张模板换材料。** 每套的详情/管理/出席/局卡/草稿都保持本套材质（收据纸、黑板、白纸、玻璃、裁片、夹板、格子、抽屉面板、贴纸页、底片），这点评审页的担心不成立；但 10 套 × 5 页的信息结构完全一致：返回链接 + 标题 + 状态行 + 倒计时 + 主/次 CTA + 成员列表 + "参加约定"；管理页一律"申请 / 成员 / 安排"三个页签 + 同样的阿蒋/Momo 申请卡 + "谢绝 / 发出邀请"。证据：10 张 `*-manage-review.png`、`*-detail-invited.png` 并排看（`m-Cxx-2.png` 在 scratchpad）。差异在皮，不在组织。
4. **运动花在"表演材料"上，日常路径要么慢、要么穿过空白。** 进入详情从点击到停稳：C01 1.4 s、C02 1.7 s（前 0.45 s 无反馈）、C04 >2.5 s（持续上漂）、C06 1.05 s、C07 1.3 s、C09 1.34 s（前 0.6 s 无反馈）、C10 1.2 s；C03 没录到翻页中间帧（0.65→0.87 s 直接替换）。切换角色：C01 1.31 s 并在 0.67 s 出现近空纸帧、C02 1.16 s 并在 0.44 s 列表褪成残影、C09 1.27 s 并在 0.62 s 近全白、C06 中途整桌全暗；只有 C05（0.57 s）、C07（0.55 s）、C10（0.76 s）、C08（0.84 s）干净。返回：C01 0.39–0.89 s 空纸、C02 0.34–1.03 s 黑板只剩一行、C04/C07 返回后 2.2–2.3 s 仍在动。证据：`*-motion-enter-strip.png` `*-motion-switch-strip.png` `*-motion-back-strip.png`。
5. **次要动作的反馈空档。** 点"去不了了"到确认层出现：C07 1.04 s、C04 0.93 s、C06 0.3 s、C02 0.18 s、C01 0.16 s、C05 0.12 s、C10 0.15 s、C08 0.02 s；C09 的次要动作在详情首屏之外（y=945）。证据：`*-motion-confirm-strip.png`、`*-path-confirm.png`。
6. **长内容一律截断，没有一套让地点换行成立。** `b-long` 变体下，地点行在十套里全部单行截断：C01 142px（两行夹断）、C02 150px、C03 330px（不换行）、C04 107px、C05 115px、C06 164px、C07 199px、C08 278px、C09 76px、C10 94px；长标题统一两行 `…`。证据：`*-long-joined.png`。
7. **时间秩序被"要做什么"覆盖，画面上看不到日期的连续。** 十套参加者首页的顺序完全一样（brunch 12.19 → livehouse 12.18 → run3k 12.20 → coffee 12.21 → theater 12.19 → dimsum 12.21 → vintage 12.26 → sketch 12.27），都是按分组 + 状态优先级排，组内日期前后交错；C08 的尺子也分段。只有 C10 用"本周 12.13～12.19"做了一个周的锚点，但它的轨道横向排列。证据：probe2 `timeOrder` 实测（scratchpad `probe2.json`）、各 `*-joined-home.png`。
8. **颜色要么近乎单色，要么一块大面积饱和色压住全屏。** 参加者首页有彩像素：C01 0.2%、C05 0.9%、C03 1.3%、C08 2.4%、C09 3.4%、C02 4.1%、C10 6.6%（以上七套几乎无色）；C04 17.9%（蓝紫光斑）、C07 30.1%（一块 #ff6b35 占 26%）、C06 52.6%（黄便签 + 绿毡，但局主首页只剩 10.8%）。没有一套把色彩当作可控面积来分配。证据：scratchpad `analysis-*.json` 与各 `*-joined-home.png` `*-hosted-home.png`。
9. **英文/等宽编号替代中文层级。** 十套都在用英文 mono 标签撑结构：DEPARTURES · TIME · EVENT · STATUS（C02）、CONTENTS · NO. 12（C03）、RESERVED/TEAR/PASS/AGREEMENT（C04）、JU · 票根 · V1 / JU-RUN3K-1（C05/C06）、BAR TRIAL / SLOW BRUNCH（C03/C07）、STUBS · ASH（C01）、ZINE № 12 / p.01（C09）、JU 400 · RESPOND · 01 / SHEET A（C10）、Bricolage 尺刻度（C08）。字族统计里 C02 的 Unbounded + Archivo Narrow 占 309 字符、Noto Sans SC 265；C10 Space Mono 205 vs Noto Sans SC 211。
10. **头部各自为政，没有 JU 共有外层。** "我的局"标题字号从 15px（C01、C06）到 36–40px（C05、C09、C03）；头部高度从 100px（C01）到 204px（C07）；没有一套用 V27 的标题比例、三背景或冷蓝 CTA（CTA 分别是黑、黄、红、橙、藏青、琥珀）。

---

## 12 可保留的能力清单（对应源码）

- **示例数据与业务规则**：`src/core/ju-data.js` —— 26 个示例活动（EVENTS，含 hosted 与 history）、8 位申请人、`joinedDefault/joinedExtraCurrent/joinedExtraHistory`、`hostedDefault`、草稿；`build(variant)` 的 8 个演示变体（default/empty/single/drafts/pending/many/history/long，`JU.VARIANTS` 在 ju-review.js）；`STAGE` 表（12 个参加者阶段的 label/group/tone/object/need/cta/detailTitle）；`GROUPS`；`JU.fmt`（when/place/left/leftShort/ago/deadlineCopy/seatLine/isoAdd）；`JU.COPY`（撤回/退出/放弃预留/拒绝改期/退出候补/取消/散场/改时间的文案、各种空态文案、历史页脚）。固定演示时钟 `JU.NOW = 2026-12-17T15:00`。
- **角色与派生模型**：`JU.derive.joined(data)`（groups act/soon/wait/kept/closed、current/history、lead、badge、emptyKind）、`JU.derive.hosted(data)`（sections todo/…、drafts、history、seats、seatText、cta）、`JU.derive.event/manage`。每套只是在这些派生结果上做渲染（例如 C01 的 `joinedRow/hostRow/draftRow`）。
- **状态引擎（纯函数，返回新 data + effect）**：`JU.engine.confirmReservation / releaseReservation / leaveWaitlist / withdrawApplication / tearTicket / markContacted / acceptReschedule / declineReschedule / exitEvent / addRecord / approve / reject / propose / cancel / end / attend / deleteDraft / undoDelete / setFailNext`（`src/core/ju-data.js` 270 行起），含"下一次保存失败"的失败/重试演示钩子。
- **评审能力**：`src/core/ju-review.js` 的 `JU.mixin`——1×/0.5× 速度、减少动态、暂停、关键帧 scrub（`--k`/`--frame` CSS 变量）、尊重速度的 `after/hold/holdKey/cancelKey` 定时器、`reset(variant)`、`loadVariant`、`jumpTo(key) → applyJump(entry)`、`replay`、`panelVals`；`JU.INDEX` 50 项状态索引（已导出到 `old10-index.json`）；面板模板 `src/core/ju-panel.html` + `ju-panel.css`（在手机画面外）。各套都实现了 `applyJump(e)`（把 `open.surface/tab` 映射到自己的视图）以及 `data-rid`（条目）/`data-act="back"`（返回）这两个测试钩子——这次全部截图与路径回放都靠它们，值得作为新稿的硬性约定保留。
- **底层工具**：`src/runtime/dc-mini-runtime.js`（`.dc.html` 模板子集：{{}}、sc-if、sc-for、on*、ref，Preact 之上，shadow root 隔离样式）+ `src/runtime/preact.min.js`；`src/build.js`（把 `concepts/src/*.dc.html` + 核心 + 面板装配成单文件评审画布与 Design canvas 工程）；`src/shell/shell.html/.css/.js`（总览/方案/对比/附录四视图、`#overview|concept/Cxx|compare|appendix` 路由、三套并排"同时跳转/全部重置/1×/0.5×"）；`concepts/concepts.json`（十套元数据与三个核心动作文案）。`src/core/ju-fx.js/.css/.svg` 是烧毁/打印/盖章/撕裂/灰烬的几何与关键帧原语——它们是旧材料叙事的工具，可以留作可选工具，不应作为新稿的默认动作库。
- **已核对的壳层问题（本次实测附带确认）**：`window.__JU_INDEX` 不存在，索引只在 `JU.INDEX`；对比视图在没有先挂载任何方案时读不到索引（shell.js 第 42 行 `window.JU && JU.INDEX`），与评审页 §06 的推断一致，未做复现以外的修复。

---

## 附：文件命名

- `Cxx-joined-home / hosted-home / joined-history / hosted-history / hosted-drafts / joined-many / long-joined / empty-joined / empty-hosted`：列表态（jumpTo 对应 j-home、h-home、j-history、h-history、h-drafts、j-many、b-long、b-empty、b-empty-h）。
- `Cxx-detail-ticket（j-d-tear）/ detail-invited（j-d-invited）/ history-ended（j-d-ended）/ confirm-withdraw（j-d-withdraw）/ manage-review（h-m-review）/ manage-attendance（h-m-attendance）/ manage-card（h-m-card）/ draft（h-draft）`。
- `Cxx-path-detail / path-confirm / path-cancelled / path-back / path-hosted`：真实点击路径在各关键点的 2× 截图。
- `Cxx-motion-enter-strip / confirm-strip / back-strip / switch-strip`：屏录帧（1×）按"点击后 +120/350/650/1000/1500 ms"取最近帧并排，标签里的毫秒数是该帧的真实偏移。
- 原始屏录帧、测量 JSON（`*-static.json`、`*-motion.json`、`analysis-*.json`、`probe.json`、`probe2.json`）与脚本在 `/tmp/claude-0/-home-user-JU/c1f2fb96-6559-5a75-970f-6155c432919b/scratchpad/old10/`。

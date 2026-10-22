# 「我的局」R2 · 每套方案的参考对照（concept-refs v2 · 主负责人）

> 每条 = 原作关系 → JU 决定 → 证据截图。来源只用 `my-r2/research/ledger.json` 里 status=verified 的条目（三组 107 条 verified；配额 UI 33 / 动效 22 / 编辑 18 / 设计师 24 / 奖项 10）。参考用于推演设计关系，不是搬样式；证据图在 `my-r2/research/evidence/<slug>/`。

## C01 左轴（10 条 · UI/UX / 动效 / 奖项 / 编辑 / 设计师）

| 来源 | 类别 | 原作关系 | JU 决定 | 证据 |
|---|---|---|---|---|
| Things 3 — Upcoming 按日分组列表与 Headings（`things3-upcoming`） | UI/UX | 按日分组、大日数 + 小星期的组头 | 左列锚点 = 日号 22px + 星期月份 12px；同日多场共用锚点 | `evidence/things3-upcoming/01.png` `evidence/things3-upcoming/02.png` |
| Airbnb 2025 Summer Release — Trips 标（`airbnb-trips-itinerary`） | UI/UX | 左轨日期标记的竖向时间线，当天实心 / 未来空心 | 左列锚点只标日期先后，不做等距刻度；「今天」锚点实心 | `evidence/airbnb-trips-itinerary/01.png` `evidence/airbnb-trips-itinerary/02.png` |
| Tide Guide 潮汐与海况（Apple Design Award （`ada-tide-guide`） | 奖项 | 按日期分组 + 用白点标「现在」 | 截止块的 19:21 锚点与活动轴的日期锚点分开；现在 / 截止是另一种锚 | `evidence/ada-tide-guide/01.png` `evidence/ada-tide-guide/02.png` |
| Flighty — 官网首屏的 My Flights 列表与延误预测时间（`flighty-my-flights`） | UI/UX | 关键时间与状态在行内的固定位置 | 右列每行：局名 → 时间 · 地点 · 局主 → 状态 + 行内动作 | `evidence/flighty-my-flights/01.png` `evidence/flighty-my-flights/02.png` |
| Mousse Magazine #95 线上文章「Ebun Sodipo（`mousse-95-ebun-sodipo`） | 编辑 | 左栏正文、右侧留白的单栏节奏；元信息三段行 | 右列 302px 的中文行宽与元信息「时间 · 地点 · 局主」一行 | `evidence/mousse-95-ebun-sodipo/01.png` `evidence/mousse-95-ebun-sodipo/02.png` |
| Sheet Modal（Motion 官方示例）（`motion-sheet-modal`） | 动效 | 内容一出现就排好版、整体一次位移 | 右列详情 x 轴滑入 320ms，内容不重排；左列锚点交叉淡出 | `evidence/motion-sheet-modal/01.png` `evidence/motion-sheet-modal/02.png` |
| Apple Developer「Behind the Design: F（`flighty-apple-developer-interview`） | UI/UX | 一行一局的机场牌逻辑；倒数常驻可瞥见而不催促 | 右列每行三段一行；截止块的倒计时常驻，不闪不催 | `evidence/flighty-apple-developer-interview/01.png` `evidence/flighty-apple-developer-interview/02.png` |
| Apple Design Awards 2023 · Interacti（`ada-2023-flighty`） | 奖项 | 评语「关键信息放在最需要的地方」 | 锚点列 = 最需要的信息（日期）固定在左 | `evidence/ada-2023-flighty/01.png` `evidence/ada-2023-flighty/02.png` |
| Y's for men 2026-27 Autumn/Winter Co（`ys-for-men-26aw`） | 设计师 | 三个黑色体量靠高低错落区分；过去用褪色同色系 | 锚点列的日号靠位置错落形成节奏；历史分区用同色系褪色而非灰度 | `evidence/ys-for-men-26aw/01.png` `evidence/ys-for-men-26aw/02.png` |
| Rasmus Andersson「The Inter typeface （`rsms-inter`） | 设计师 | 等宽数字（tnum）让倒计时与人数对齐 | 锚点日号与倒计时用 Archivo 等宽数字，列内对齐 | `evidence/rsms-inter/01.png` `evidence/rsms-inter/02.png` |

## C02 人先（10 条 · UI/UX / 动效 / 奖项 / 编辑 / 设计师）

| 来源 | 类别 | 原作关系 | JU 决定 | 证据 |
|---|---|---|---|---|
| Partiful 公开活动页（Abbode Sample Sale）（`partiful-event-page`） | UI/UX | 主办人靠头像角上徽章区分；人数行中点单行 | 人物簇里的局主带小标；行尾「等 N 人」计数 | `evidence/partiful-event-page/01.png` `evidence/partiful-event-page/02.png` |
| Meetup 活动页：Attendees 卡片的 Host 徽标与候补粘（`meetup-event-attendees`） | UI/UX | Host 小胶囊 + 溢出格「+N」 | 簇最多 2 圆 + 计数，簇位 56px，文字列 ≥268px | `evidence/meetup-event-attendees/01.png` `evidence/meetup-event-attendees/02.png` |
| Apple Invites — Guest List 面板与邀请编辑卡（（`apple-invites-guest-list`） | UI/UX | 名单分组 HOST 单独一组 + GOING (N) | 详情名单：局主一行在前，已确认 / 已预留分组计数 | `evidence/apple-invites-guest-list/01.png` `evidence/apple-invites-guest-list/02.png` |
| DICE 活动页（Honey Dijon: Day & Night）（`dice-event-waitlist`） | UI/UX | 叠压头像 + 计数圆环做名单预览 | 先做这件白卡上的 52px 首字圆簇 | `evidence/dice-event-waitlist/01.png` `evidence/dice-event-waitlist/02.png` |
| Gentler Streak 健身追踪（Apple Design Awa（`ada-gentler-streak`） | 奖项 | 称呼 + 判断 + 说明的可亲层级 | 页头辅助句「这周要见 9 个人」；行首「和 老杨、Momo」 | `evidence/ada-gentler-streak/01.png` `evidence/ada-gentler-streak/02.png` |
| A Magazine Curated By A/19 — Kim Jon（`amcb-kim-jones`） | 编辑 | 两列扫读式名单：左列角色、右列人名 | 管理申请审核 = 人的卡：称呼 / 验证 / 留言引文 | `evidence/amcb-kim-jones/01.png` `evidence/amcb-kim-jones/02.png` |
| Family-style dialog（Motion 官方示例）（`motion-family-dialog`） | 动效 | 主按钮长成确认卡、第二动作从旁分裂 | 通过 / 谢绝后原位结果行，不弹 toast | `evidence/motion-family-dialog/01.png` `evidence/motion-family-dialog/02.png` |
| Instrument × Eventbrite App 重塑「Reima（`instrument-eventbrite-app`） | UI/UX | 叠压头像「N friends going」 | 行首簇 + 「等 N 人」计数的原型 | `evidence/instrument-eventbrite-app/01.png` `evidence/instrument-eventbrite-app/02.png` |
| Studio Dumbar/DEPT® × Wabi：个人软件生成 Ap（`studio-dumbar-wabi`） | UI/UX | 大小不一的圆沿弧线成串，体量 = 角色 | 先做这件白卡上的簇：局主圆最大、靠前 | `evidence/studio-dumbar-wabi/01.png` `evidence/studio-dumbar-wabi/02.png` |
| Alexander McQueen「Plato's Atlantis」S（`mcqueen-platos-atlantis`） | 设计师 | 主要参与者用带下划线的人名列表而非头像墙 | 详情名单：名字行可点，不做头像墙 | `evidence/mcqueen-platos-atlantis/01.png` `evidence/mcqueen-platos-atlantis/02.png` |

## C03 双窗（10 条 · UI/UX / 动效 / 奖项 / 编辑 / 设计师）

| 来源 | 类别 | 原作关系 | JU 决定 | 证据 |
|---|---|---|---|---|
| Vaul — Drawer for React（官方演示）（`vaul-drawer`） | UI/UX | 抽屉弹出时背景同步缩小压暗 | 收起窗始终可见为上下文；展开窗推入详情时收起窗轻微压暗 | `evidence/vaul-drawer/01.png` `evidence/vaul-drawer/02.png` |
| Sheet Modal（Motion 官方示例）（`motion-sheet-modal`） | 动效 | 整体一次位移上升，把手约面板 1/10 | 两窗交换高度 300ms 同帧；把手 36×4 | `evidence/motion-sheet-modal/01.png` `evidence/motion-sheet-modal/02.png` |
| Daylight Computer 网站（basement.studio（`basement-daylight-site`） | UI/UX | 当前段全黑、其他段 20% 灰的强弱导航 | 展开窗标题 18px/600，收起窗标题同字号但 60% 透明 | `evidence/basement-daylight-site/01.png` `evidence/basement-daylight-site/02.png` |
| Magazine B Issue No.101 LACOSTE 商品页与（`magazine-b-101-lacoste`） | 编辑 | 滚动后局名 + 主按钮压成吸顶操作条 | 展开窗内滚动时窗头吸顶，CTA 留在窗内底部 | `evidence/magazine-b-101-lacoste/01.png` `evidence/magazine-b-101-lacoste/02.png` |
| Rooms® 4.0（Apple Design Award 2024 ·（`ada-rooms`） | 奖项 | 首页顶卡用有限集合代替无限流 | 收起窗只露该角色前三行，不做无限流 | `evidence/ada-rooms/01.png` `evidence/ada-rooms/02.png` |
| iOS Menu (paco.me/craft)（`paco-ios-menu`） | UI/UX | 二级操作原位向下展开 | 窗内管理的安排区在窗内展开，不跳页 | `evidence/paco-ios-menu/01.png` `evidence/paco-ios-menu/02.png` |
| BookBlock — A Content Flip Plugin（De（`codrops-bookblock`） | 动效 | 同一册子前后页、从中缝立起翻过 | （可选）角色交换时两窗以分隔线为轴的轻微翻折感；不做 3D 书 | `evidence/codrops-bookblock/01.png` `evidence/codrops-bookblock/02.png` |
| Apple WWDC18 Session 803「Designing F（`wwdc18-designing-fluid-interfaces`） | 动效 | 可打断可改道；弹簧默认 100% damping，带动量的手势才轻微过冲 | 分隔条拖动跟手、半途可反向；松手 100% damping 到位 | `evidence/wwdc18-designing-fluid-interfaces/01.png` `evidence/wwdc18-designing-fluid-interfaces/02.png` |
| Rick Owens 本人访谈「Rick Owens Talks Int（`rick-owens-interview-2017`） | 设计师 | 少量大体量 + 大量留白产生分量 | 两窗各只有一个重物（展开窗的白卡 / 收起窗的三行） | `evidence/rick-owens-interview-2017/01.png` `evidence/rick-owens-interview-2017/02.png` |
| Helmut Lang Spring 1998（Vogue Runway（`helmut-lang-ss98`） | 设计师 | 黑底上只用一条 hairline 分隔 | 深窗内只有 10% 白线，不做卡中卡 | `evidence/helmut-lang-ss98/01.png` `evidence/helmut-lang-ss98/02.png` |

## C04 叠层（9 条 · UI/UX / 动效 / 编辑 / 设计师）

| 来源 | 类别 | 原作关系 | JU 决定 | 证据 |
|---|---|---|---|---|
| Ticket Animation（Knife and Fox，Dribb（`dribbble-bistline-ticket-animation`） | 动效 | 多票叠放只露上沿，当前票飞出时下方列表同步 | 叠纸只露 70px 上沿；纸抬起展开时其它纸压缩到底部叠边 | `evidence/dribbble-bistline-ticket-animation/01.png` `evidence/dribbble-bistline-ticket-animation/02.png` |
| Eventbrite Organizer 页：票根堆叠插图与「N fri（`eventbrite-organizer-ticket-stack`） | UI/UX | 票按角度错开堆叠、越旧越被底色染暗 | 历史分区的叠纸：越旧越暗；纸色来自局卡 pack | `evidence/eventbrite-organizer-ticket-stack/01.png` `evidence/eventbrite-organizer-ticket-stack/02.png` |
| Card Shuffle（Rive Marketplace 文件）（`rive-cwthrs-card-shuffle`） | 动效 | 以角为支点扇开、收起回到同一外形 | 同日多场的叠纸轻微扇开 ±3°（可选） | `evidence/rive-cwthrs-card-shuffle/01.png` `evidence/rive-cwthrs-card-shuffle/02.png` |
| Apple HIG · Wallet — 票证示例与设计规范（`apple-wallet-pass-anatomy`） | UI/UX | 票证头带左类别右状态 | 露出带：左局名 + 时间地点，右上状态 | `evidence/apple-wallet-pass-anatomy/01.png` `evidence/apple-wallet-pass-anatomy/02.png` |
| The Gentlewoman nº 34（Autumn and Win（`gentlewoman-no34-all-issues`） | 编辑 | 整卡底色区分类型的封面系统 | 纸色 = 该局局卡 pack 的纸色（降饱和 20%） | `evidence/gentlewoman-no34-all-issues/01.png` `evidence/gentlewoman-no34-all-issues/02.png` |
| Card Stack Effects（Yuda 演示）（`codrops-card-stack-effects`） | 动效 | 顶卡以远处支点甩出淡去、下一张即刻顶上 | 取消 / 退出后该纸甩出，叠层补位 | `evidence/codrops-card-stack-effects/01.png` `evidence/codrops-card-stack-effects/02.png` |
| Junya Watanabe Fall 2000「Techno Cout（`junya-watanabe-techno-couture-fw00`） | 设计师 | 每张只用一种饱和主色，颜色按局而非按元素变化 | 纸色 = 局卡 pack 色；一张纸一个色 | `evidence/junya-watanabe-techno-couture-fw00/01.png` `evidence/junya-watanabe-techno-couture-fw00/02.png` |
| Junya Watanabe 本人书面问答：「'The real thi（`junya-watanabe-vogue-interview`） | 设计师 | 尊重原型再转化：换材料 / 放大一号，能说出原型是什么 | 原型 = 局卡；纸是局卡的「放大一号」 | `evidence/junya-watanabe-vogue-interview/01.png` `evidence/junya-watanabe-vogue-interview/02.png` |
| Chalayan Spring 2007「One Hundred and（`chalayan-one-hundred-eleven-ss07`） | 设计师 | 旧→新是同一张票的两个状态 | 改期时纸上新票打印、旧票「原定」划线，不并列两张 | `evidence/chalayan-one-hundred-eleven-ss07/01.png` `evidence/chalayan-one-hundred-eleven-ss07/02.png` |

## C05 大面（9 条 · UI/UX / 动效 / 奖项 / 编辑 / 设计师）

| 来源 | 类别 | 原作关系 | JU 决定 | 证据 |
|---|---|---|---|---|
| Awwwards Conferences 网站（Locomotive 案（`locomotive-awwwards-conferences`） | UI/UX | 标题极大、日期用对比色小字放角落 | 色面内 34px 时间 + 26px 局名，地点 · 局主 14px | `evidence/locomotive-awwwards-conferences/01.png` `evidence/locomotive-awwwards-conferences/02.png` |
| DICE 活动页（Honey Dijon: Day & Night）（`dice-event-waitlist`） | UI/UX | 白大标题 + 荧光时间 + 灰地点的三级对比 | 色面上的三级：时间（Archivo）/ 局名 / 元数据 | `evidence/dice-event-waitlist/01.png` `evidence/dice-event-waitlist/02.png` |
| VERSE 网站报头与文章页「台灣味一定要「正宗」嗎？紐約主廚史官以《T（`verse-site-masthead-article`） | 编辑 | 报头式今日块：超大日期数字 + 两行小字 | 色面 = 一场的整面；纸上的「还有 7 场」小字 | `evidence/verse-site-masthead-article/01.png` `evidence/verse-site-masthead-article/02.png` |
| Pokopia: Modal（Motion 官方示例）（`motion-pokopia-modal`） | 动效 | 先模糊背景、再让色块长成整张面板 | 纸上一行上升进色面：色面内容交叉淡出，纸下沉再回弹 | `evidence/motion-pokopia-modal/01.png` `evidence/motion-pokopia-modal/02.png` |
| Crouton 食谱管理（Apple Design Award 2024（`ada-crouton`） | 奖项 | 主操作胶囊 + 三格指标条紧接封面 | 色面底部 CTA；局主面「已确认 2/5 · 待审 2」一行 | `evidence/ada-crouton/01.png` `evidence/ada-crouton/02.png` |
| uilabs — Elastic Card（按钮长成面板）（`uilabs-elastic-card`） | UI/UX | 面板色 = 按钮色，同一材质 | 票根页：色面变为票底色 #edeff7 承载票根 | `evidence/uilabs-elastic-card/01.png` `evidence/uilabs-elastic-card/02.png` |
| Ann Demeulemeester Spring Summer 202（`ann-demeulemeester-ss26-campaign`） | 设计师 | 宏阔背景 + 小而紧的主体 | 色面是宏阔的，局名与人在面内保持亲密尺度 | `evidence/ann-demeulemeester-ss26-campaign/01.png` `evidence/ann-demeulemeester-ss26-campaign/02.png` |
| Instrument × Oura App「Designing a mo（`instrument-oura-app`） | UI/UX | 同一骨架靠一行衬线短句 + 低对比底图给温度；语义色只落在状态小字 | 色面上的温度来自面色与时间大字，状态只在小字上用色 | `evidence/instrument-oura-app/01.png` `evidence/instrument-oura-app/02.png` |
| BUCK × Headspace 品牌短片（BUCK 官网项目页 + 页（`buck-headspace`） | 动效 | 一屏只让一两个形状动，大体量几何 + 纯色背景 | 纸上升进面时只有纸与面动，其余静止 | `evidence/buck-headspace/01.png` `evidence/buck-headspace/02.png` |

## C06 字排（9 条 · UI/UX / 动效 / 编辑 / 设计师）

| 来源 | 类别 | 原作关系 | JU 决定 | 证据 |
|---|---|---|---|---|
| justfont blog「給科幻作品的中文字體提案：電馭」字体设计长文（`justfont-blog-cyber-typeface-essay`） | 编辑 | 宋体标题、黑体说明、行高 1.9 靠字体族分层 | 衬线局名 21/26px + 黑体元数据 14px | `evidence/justfont-blog-cyber-typeface-essay/01.png` `evidence/justfont-blog-cyber-typeface-essay/02.png` |
| Obscura Magazine 线上专题「When the Sun R（`obscura-wong-hiu-ching`） | 编辑 | 居中多行标题块；中英混排空格与「」规则 | 局名两行省略；英文前后半角空格 | `evidence/obscura-wong-hiu-ching/01.png` `evidence/obscura-wong-hiu-ching/02.png` |
| System Magazine Issue 26（Fall Winter（`system-magazine-issue-26`） | 编辑 | 单一字体只靠字号建立目录节奏 | 组名 12px 字距 + 项 21px，没有容器 | `evidence/system-magazine-issue-26/01.png` `evidence/system-magazine-issue-26/02.png` |
| Apartamento Magazine Issue #37（Sprin（`apartamento-issue-37`） | 编辑 | 局名 → 费用 → 人数 → 主按钮 → 名单的信息顺序 | 原地展开后的段落顺序：局名 → 时间地点 → 人 → 物件 → 动作 | `evidence/apartamento-issue-37/01.png` `evidence/apartamento-issue-37/02.png` |
| Next.js Conf 2024 — 线下体验与网站（basement（`basement-nextjs-conf-2024`） | UI/UX | 姓名大号 + 等宽小字角色 | 名单行：名字 15px + Archivo 小字状态 | `evidence/basement-nextjs-conf-2024/01.png` `evidence/basement-nextjs-conf-2024/02.png` |
| The Magic of Clip Path — Theme switc（`emil-clip-path-theme-switch`） | 动效 | 新态作为复制层叠在原票上、文字不动 | 状态行换值时文字位置不动，只换字与色（settle） | `evidence/emil-clip-path-theme-switch/01.png` `evidence/emil-clip-path-theme-switch/02.png` |
| Work & Co × Aesop「Bridging digital a（`workco-aesop`） | UI/UX | 标签小字 / 值 / 细分隔线三件套；一段大号衬线作唯一说话段 | 详情的时间 / 地点 / 人数规格行；局名衬线 | `evidence/workco-aesop/01.png` `evidence/workco-aesop/02.png` |
| Kris Sowersby《Söhne design informati（`klim-soehne-design-information`） | 设计师 | 长文 + 右侧小字旁注栏 | （可选）详情说明右侧的小字时间 / 地点旁注 | `evidence/klim-soehne-design-information/01.png` `evidence/klim-soehne-design-information/02.png` |
| Rasmus Andersson「The Inter typeface （`rsms-inter`） | 设计师 | 小字用 text 光学尺寸、大数字用 display | Archivo 时间在 14px 与 26px 两档 | `evidence/rsms-inter/01.png` `evidence/rsms-inter/02.png` |

## C07 下盘（9 条 · UI/UX / 动效 / 奖项 / 编辑 / 设计师）

| 来源 | 类别 | 原作关系 | JU 决定 | 证据 |
|---|---|---|---|---|
| Meetup 活动页：Attendees 卡片的 Host 徽标与候补粘（`meetup-event-attendees`） | UI/UX | 粘性底栏固定携带日期 · 状态胶囊 · 主按钮 | 深墨盘 = 先做这件 + CTA 固定在底部 | `evidence/meetup-event-attendees/01.png` `evidence/meetup-event-attendees/02.png` |
| Magazine B Issue No.101 LACOSTE 商品页与（`magazine-b-101-lacoste`） | 编辑 | 滚动后局名 + 主按钮压成吸顶操作条 | 盘内局名 24px + CTA；列表在上方流过 | `evidence/magazine-b-101-lacoste/01.png` `evidence/magazine-b-101-lacoste/02.png` |
| DICE 活动页（Honey Dijon: Day & Night）（`dice-event-waitlist`） | UI/UX | 详情底部粘性价格 / 状态条 | 票根页：盘上升为整页深底 | `evidence/dice-event-waitlist/01.png` `evidence/dice-event-waitlist/02.png` |
| Sheet Modal（Motion 官方示例）（`motion-sheet-modal`） | 动效 | 面板整体一次位移上升、背景只压暗 | 盘上升 320ms，列表淡出 160ms | `evidence/motion-sheet-modal/01.png` `evidence/motion-sheet-modal/02.png` |
| Sonner — toast component（官方演示）（`sonner-toast`） | UI/UX | 白卡自下方上移淡入，标题黑副文灰 | 盘内 toast 与结果行用同一材质 | `evidence/sonner-toast/01.png` `evidence/sonner-toast/02.png` |
| Rooms® 4.0（Apple Design Award 2024 ·（`ada-rooms`） | 奖项 | 底部三项浮胶囊 Tab | 根导航在盘内底部，与盘同色系 | `evidence/ada-rooms/01.png` `evidence/ada-rooms/02.png` |
| teenage engineering「OP–1 field」官方产品页（`teenage-engineering-op-1-field`） | 设计师 | 等距单元网格 + 一两处不同形打破节奏；状态只在一个小屏里用彩色 | 盘是整屏唯一的「长键」；盘内只有倒计时一处彩色 | `evidence/teenage-engineering-op-1-field/01.png` `evidence/teenage-engineering-op-1-field/02.png` |
| Apple WWDC18 Session 803「Designing F（`wwdc18-designing-fluid-interfaces`） | 动效 | 带动量的手势才给约 80% 的轻微过冲 | 盘上拉有动量时允许轻微过冲，按钮点击 100% damping | `evidence/wwdc18-designing-fluid-interfaces/01.png` `evidence/wwdc18-designing-fluid-interfaces/02.png` |
| Apple Developer「Behind the Design: F（`flighty-apple-developer-interview`） | UI/UX | Live Activity 式常驻小卡 | 盘 = 常驻的「进行中」卡 | `evidence/flighty-apple-developer-interview/01.png` `evidence/flighty-apple-developer-interview/02.png` |

## C08 色带（10 条 · UI/UX / 动效 / 奖项 / 编辑 / 设计师）

| 来源 | 类别 | 原作关系 | JU 决定 | 证据 |
|---|---|---|---|---|
| Family（family.co）首页「Details that mat（`family-wallet-feature-grid`） | UI/UX | 活动流按待处理 / 本周 / 本月分组，结果色字 | 三条带 = 三种意图；带内行右侧状态 | `evidence/family-wallet-feature-grid/01.png` `evidence/family-wallet-feature-grid/02.png` |
| Material 3 Expressive —「Start buildi（`m3-expressive-tactics`） | UI/UX | 只给当前状态上色、主操作在形状与颜色上脱离 | 白底 CTA 只在第一条带出现 | `evidence/m3-expressive-tactics/01.png` `evidence/m3-expressive-tactics/02.png` |
| Monocle 杂志期号归档页（Latest Issues）（`monocle-issues-archive`） | 编辑 | 固定编号色块固定位置 | 带的顺序与色相固定：意图 1 环境主色 / 意图 2 JU 蓝 / 意图 3 浅灰紫 | `evidence/monocle-issues-archive/01.png` `evidence/monocle-issues-archive/02.png` |
| POPEYE No. 954「THIS IS LONDON」试读与目次页（`popeye-954-contents`） | 编辑 | 三级目次层级：编号 + 粗体 + 小字 | 带头 13px 组名 + 口径；带内 15/13 | `evidence/popeye-954-contents/01.png` `evidence/popeye-954-contents/02.png` |
| Family-style dialog（Motion 官方示例）（`motion-family-dialog`） | 动效 | 主按钮长成确认卡 | 带展开为整页，其它带被推出 | `evidence/motion-family-dialog/01.png` `evidence/motion-family-dialog/02.png` |
| Crouton 食谱管理（Apple Design Award 2024（`ada-crouton`） | 奖项 | 半透明胶囊压在封面 | 带内白线分隔与 30% 白线的层次 | `evidence/ada-crouton/01.png` `evidence/ada-crouton/02.png` |
| Dries Van Noten SS2015 苔藓地毯秀（Vogue R（`dries-van-noten-ss15-moss`） | 设计师 | 同一现场的多张卡共用一条连续底材 | 同意图的多场共享一条带 | `evidence/dries-van-noten-ss15-moss/01.png` `evidence/dries-van-noten-ss15-moss/02.png` |
| Pentagram × Slack 品牌识别（新 octothorpe （`pentagram-slack`） | UI/UX | 2–4 个同形单元在图标尺寸下仍可辨认 | 带内状态标记用同形小单元 | `evidence/pentagram-slack/01.png` `evidence/pentagram-slack/02.png` |
| UNDERCOVER 2027 Spring-Summer「Poison（`undercover-2027ss-poisonous-plants`） | 设计师 | 中文局名与副题粗体 22 / 常规 14 | 带内 22px 局名 + 14px 元数据 | `evidence/undercover-2027ss-poisonous-plants/01.png` `evidence/undercover-2027ss-poisonous-plants/02.png` |
| PORTO ROCHA × Tinder 品牌重塑「It starts （`porto-rocha-tinder`） | UI/UX | 同一套 tab 在三种主题底色上 | 三环境下带的色相替换规则 | `evidence/porto-rocha-tinder/01.png` `evidence/porto-rocha-tinder/02.png` |

## C09 地点（9 条 · UI/UX / 动效 / 奖项 / 编辑 / 设计师）

| 来源 | 类别 | 原作关系 | JU 决定 | 证据 |
|---|---|---|---|---|
| Reposaku（レポサク）智慧农业平台 — Good Design G（`gmark-reposaku`） | 奖项 | 地图图钉 + 日期区间胶囊 | 节头 = 区名 24px + N 场 + 英文区名小字 | `evidence/gmark-reposaku/01.png` `evidence/gmark-reposaku/02.png` |
| My Japan Railway / TRAIN TRIP 数字站章 —（`dandad-my-japan-railway`） | 奖项 | 最近站点 + 定位针 + 一句提示 | 行第二行行首的街区 14px/500 | `evidence/dandad-my-japan-railway/01.png` `evidence/dandad-my-japan-railway/02.png` |
| Airbnb 2025 Summer Release — Trips 标（`airbnb-trips-itinerary`） | UI/UX | 「时间 · Hosted by 谁」一行区分角色 | 行第二行：街区 · 星期日期时间 · 局主 | `evidence/airbnb-trips-itinerary/01.png` `evidence/airbnb-trips-itinerary/02.png` |
| Luma 活动页（Friends of the Studio: Home（`luma-event-page`） | UI/UX | 报名卡的状态首行 | 行第三行状态 | `evidence/luma-event-page/01.png` `evidence/luma-event-page/02.png` |
| Monocle 杂志期号归档页（Latest Issues）（`monocle-issues-archive`） | 编辑 | 固定三栏 1 时间 / 2 地点 / 3 人数 | 管理页的节 = 区块，节头 = 区块名 | `evidence/monocle-issues-archive/01.png` `evidence/monocle-issues-archive/02.png` |
| iOS App Store: Layout animation（Moti（`motion-app-store-layout`） | 动效 | 封面与局名作为同一图层连续放大 | 节内滑入详情，节头固定作为面包屑 | `evidence/motion-app-store-layout/01.png` `evidence/motion-app-store-layout/02.png` |
| Craig Green SS26 秀图页（品牌官网「SS26 IMAGE（`craig-green-ss26`） | 设计师 | 同一底色带表明属于同一局 | 同一区的行共享节头与一条细线 | `evidence/craig-green-ss26/01.png` `evidence/craig-green-ss26/02.png` |
| Work & Co × Aesop「Bridging digital a（`workco-aesop`） | UI/UX | 面包屑「Skin • Cleanse」 | 详情面包屑「曼哈顿 • 西村」 | `evidence/workco-aesop/01.png` `evidence/workco-aesop/02.png` |
| Instrument × Feeld App「Where Identit（`instrument-feeld-app`） | UI/UX | 从任何一屏进入详情，不强制线性 | 节内任一行直接进详情；返回到节 | `evidence/instrument-feeld-app/01.png` `evidence/instrument-feeld-app/02.png` |

## C10 中轴（11 条 · UI/UX / 动效 / 奖项 / 编辑 / 设计师）

| 来源 | 类别 | 原作关系 | JU 决定 | 证据 |
|---|---|---|---|---|
| A Magazine Curated By A#22 — Grace W（`amcb-grace-wales-bonner`） | 编辑 | 编号小字 → 局名大字 → 副题小字三行居中 | 先做这件：日期小字 → 32px 时间 → 24px 局名居中 | `evidence/amcb-grace-wales-bonner/01.png` `evidence/amcb-grace-wales-bonner/02.png` |
| Obscura Magazine 线上专题「When the Sun R（`obscura-wong-hiu-ching`） | 编辑 | 五行居中、字距拉开的节奏 | 组名 12px 字距 .1em + 28px 短横线 | `evidence/obscura-wong-hiu-ching/01.png` `evidence/obscura-wong-hiu-ching/02.png` |
| System Magazine Issue 26（Fall Winter（`system-magazine-issue-26`） | 编辑 | 居中堆叠、只靠字号 | 各项 17px 局名 + 13px 元数据居中 | `evidence/system-magazine-issue-26/01.png` `evidence/system-magazine-issue-26/02.png` |
| Apartamento Magazine Issue #37（Sprin（`apartamento-issue-37`） | 编辑 | 参加者名单排成字标下一小段居中文字 | 详情成员名单居中成段 | `evidence/apartamento-issue-37/01.png` `evidence/apartamento-issue-37/02.png` |
| Exclusion Tabs (rauno.me/craft)（`rauno-exclusion-tabs`） | UI/UX | 滑动胶囊承载选中态 | 居中的角色切换 | `evidence/rauno-exclusion-tabs/01.png` `evidence/rauno-exclusion-tabs/02.png` |
| BookBlock — A Content Flip Plugin（De（`codrops-bookblock`） | 动效 | 沿中轴翻页而非平移 | 详情沿轴向下展开，返回标题回落 | `evidence/codrops-bookblock/01.png` `evidence/codrops-bookblock/02.png` |
| Gentler Streak 健身追踪（Apple Design Awa（`ada-gentler-streak`） | 奖项 | 可亲而有秩序的三行层级 | 页头辅助句居中、一句判断 | `evidence/ada-gentler-streak/01.png` `evidence/ada-gentler-streak/02.png` |
| Walter Van Beirendonck AW2026-27「SCA（`wvb-scare-the-crow`） | 设计师 | 请柬层级：局名占三分之一、日期第二大、地址缩小 | 先做这件的请柬式层级 | `evidence/wvb-scare-the-crow/01.png` `evidence/wvb-scare-the-crow/02.png` |
| Alexander McQueen「Plato's Atlantis」S（`mcqueen-platos-atlantis`） | 设计师 | 标题三行比例约 30:20:16 | 32 / 24 / 14 的居中三行 | `evidence/mcqueen-platos-atlantis/01.png` `evidence/mcqueen-platos-atlantis/02.png` |
| teenage engineering「OP–1 field」官方产品页（`teenage-engineering-op-1-field`） | 设计师 | 长清单用单一字号逐行居中 | 历史分区单一字号居中 | `evidence/teenage-engineering-op-1-field/01.png` `evidence/teenage-engineering-op-1-field/02.png` |
| Thom Browne「Mens Spring 2027 Runway」（`thom-browne-ss27-runway`） | 设计师 | 等宽成对描边按钮承载旧时间 / 新时间 | 改期答复的两列对照 | `evidence/thom-browne-ss27-runway/01.png` `evidence/thom-browne-ss27-runway/02.png` |

## 未能核验的点名条目

- Maison Margiela Artisanal 2025 官方页：本网络下 maisonmargiela.com 全站 403，web.archive.org 不可达；上一轮截图保留在 `my-r2/research/evidence/margiela-artisanal-2025/`（若有）仅作参考，不计入配额。yohjiyamamoto.co.jp、mds.isseymiyake.com 同样 403（旧条目 dropped）。

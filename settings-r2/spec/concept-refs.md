# 真实参考与转译（设置 R2）

> 来源：`settings-r2/research/ledger.md|json`（65 例：UI 20〔其中真实设置 / 资料 / 通知 / 隐私 / 账户界面 11〕、动态 18〔有真实移动端证据 12〕、编辑设计 10〔中文 5〕、设计师作品 12、获奖项目 5；已看动效 24；继承改写 40、新增 25；访问失败 23 条另列于 `failures.md`，不计入）。每条采用的参考在台账里记录了五件事：原始链接、实际看过的画面 / 帧、要学的方法、影响 JU 的元素或状态、不应照搬的外观。证据图在 `settings-r2/research/evidence/<slug>/`。
> 下表的「如何转译」是本项目的设计判断，不是这些案例对 JU 效果的实证。

## 七个指定入口

| # | 指定入口 | 状态 | 实际看到 / 处理 | slug |
|---|---|---|---|---|
| 1 | Instrument — Oura App | ✅ 已打开（仅静态） | 18 屏案例页：Readiness 三卡、Elevated 详情、Vitals 列表、Impact 三项指标、2026 奖项格；页内 7 个 Vimeo 播放器在无头浏览器报错，未看到动效 | `instrument-oura` |
| 2 | Work & Co — Aesop | ✅ 已打开（仅静态） | 22 屏：衬线 / 无衬线分工、发丝线规格表、深色购物车、HOW 2018 / Webby 2019 / FastCo；Vimeo 播放器报错，未看到转场 | `workco-aesop` |
| 3 | ustwo — The Body Coach | ✅ 已打开并看动效 | 14 屏 + 页内 app 循环录屏 7.7s：逐帧差分测得内容区 1 帧硬切、青柠胶囊约 330–400ms 追上 | `ustwo-body-coach` |
| 4 | BUCK — Headspace | ✅ 已打开并看动效 | 4 段 Mux 流：30s 主片按 2fps 连续抽 60 帧 + 两段方形循环；前任「每 3s」接触表无法复现，已弃用 | `buck-headspace` |
| 5 | Ann Demeulemeester — SS26 Campaign | ✅ 已打开并看动效 | 14 屏 + 两段 12s 影片按 2fps 抽帧：满幅 / 332px 窄栏交替、0.5–2.5s 硬切 | `annd-ss26-campaign` |
| 6 | Maison Margiela — Artisanal Collection 2025 | ⚠️ 官方页 403（Akamai，本轮两次尝试 + WebFetch 均被拒） | 改看同一系列的完整官方图：FASHIONSNAP「Maison Margiela ‘Artisanal’ 2025 Collection」49 张（Image by: Maison Margiela）逐张下载拼表 + 6 张 1200px；Vogue Runway 评论首段与前 3 张 | `margiela-artisanal-2025` |
| 7 | Yohji Yamamoto — SS26 官方系列图库 | ⚠️ 官方页与图片 403（Akamai） | WebFetch 只取得结构（Yohji Yamamoto collections › SPRING / SUMMER 2026，LOOK 01–27，图片 2025/12 上传），画面无法查看；改看同季巴黎女装秀 FASHIONSNAP 144 张（含谢幕） + Vogue 前 3 张——两者是否与官方图库同一组造型无法确认，已在条目中写明 | `yohji-yamamoto-ss26` |

## 可复用原则

**整屏构图**
1. 一屏一个主导体量，其余围绕它组织：Oura 的 Readiness 大字、Rick Owens 固定相框里只让体量变化、Moonlitt 唯一发光的月亮（`instrument-oura` `rick-owens-porterville-fw24` `award-moonlitt`）——对应 v2 规则 1，读成「身份 + 一列等高行」即失败。
2. 只用两种尺度交替：满幅 + 窄栏。Ann D SS26 的满幅立面与约 332px 居中文字栏、Fantastic Man 只占半页的正文；留白来自不对称放置，而不是把所有东西放大（`annd-ss26-campaign` `fantastic-man-karel-martens`）。
3. 概览直接写出当前值，并把复杂规则压成一个可读值：行尾值 / 标签下摘要（Android Settings）、「My Contacts (-3, +7)」（Telegram）、「Push, In-app, Everyone」（Bluesky）；列表只留给真正的列表（`android-settings-pattern` `telegram-privacy-last-seen` `bluesky-notification-settings`）。

**中文排版**
4. 层级靠字族与字重，不靠灰色小字：宋体叙述 / 黑体操作（報導者导语 20/34px 宋、正文 18/38px 黑；VERSE 宋体粗标题 + 1.9 行高正文）；浅底次级字不浅于 `#535b70`（`twreporter-longform` `verse-editorial` `workco-aesop`）。
5. 34–56px、600–700 字重的中文先查笔画内白：多笔画字宁可降一档字重或加字号，也不压字距（justfont「電馭」的简笔与辨识判断，`justfont-cyber-essay`）。
6. 三条硬规则：行首行尾禁则、标点挤压（先挤进后推出）、汉字与数字 / 拉丁之间 ≤ 1/4 字宽且紧邻中文标点时取消；段内可点值用颜色 + 跟随每一行的细下边线（`w3c-clreq` `twreporter-longform` `codrops-natural-language-form`）。

**色彩面积与表面**
7. 环境色是「一天里的时间」，不是皮肤：大面积呈现、切换时整面先变、前景后到（Tide Guide 2026 ADA 评语「palette that changes with the sky」；BUCK 以整面底色衔接场景；Telegram 主题在真实界面上即时预览）（`award-tide-guide` `buck-headspace` `telegram-gift-themes`）。
8. 强调色只出现一两次才有分量：Ann D AW26 红丝绒只出现两次、Yohji AW26-27 每个看次只在一处放有色布、Margiela Artisanal 49 套里唯一的荧光黄绿——JU 蓝 CTA 每屏最多一次（`annd-aw26-show` `yohji-yamamoto-aw26-27` `margiela-artisanal-2025`）。
9. 完成度落在相接处：边、缝、顶缘高光与投影干净，信息可以直接写在边上（Margiela 布边与四点固定、Junya 外露接合、Wallet 折叠头带）；不用纹理、玻璃、模糊正文（`margiela-aw97-wrap-skirt-vam` `junya-watanabe-aw26` `apple-wallet-passes`）。

**运动编排**
10. 出入口是同一个对象：从哪里长出来就收回到哪里（App Store 卡片 ↔ 整页、M3 全屏对话框收回 FAB、Family 按钮长成确认面板），返回时回到原入口与滚动位置；未保存关闭先问一句（`motion-app-store-layout` `m3-dialogs` `motion-family-dialog`）。
11. 按频率分配量级：开关约 67ms 换态（M3 switch）；指示物 280–400ms 追上（rauno 标签、Body Coach 分段）；面板按拖动距离与速度提交或弹回（M3 bottom sheet）；页头收拢由滚动驱动、可逆（M3 app bars、Telegram 资料页头）（`m3-switch-motion` `rauno-exclusion-tabs` `m3-bottom-sheet-gesture` `m3-app-bars`）。
12. 层级切换分三拍：背景先变成色场 → 容器轮廓 → 内容，文字全程清晰（Android 16 下拉通知栏）；所有表现型运动可在「减少动态」里关闭而语义保留（Telegram Power Saving 的总模式 + 逐项开关）（`android-16-expressive-launch-videos` `telegram-power-saving`）。

## 每套参考

> 依据 `settings-r2/spec/art-direction-v2.md`（S02 已改为「大字目录 → 侧栏」，S06 已改为「一段话」）。每行：参考 slug（类别）— 它如何改变这一套的画面或动作。

### S01 字即内容（纸色 + 顶部环境光场；称呼 56px；不对称两栏的 34–44px 衬线值；值原位变编辑）
- `instrument-oura`（界面）— 每个值块固定三级：13px 标签 → 34–44px 值 → 一句状态；「已验证 / 待核实」只用语义色小字，不涂整块。
- `fantastic-man-karel-martens`（编辑）— 称呼与第一个值块用悬挂缩进与一条短横组织；右栏值块下沉错位，留白来自不对称而不是放大。
- `verse-editorial`（编辑·中文）— 「3 个局」照「Oct. 10」的大数字 + 小字当期信息并置，下挂三条 14px 局名；底部文字索引用「 · 」分隔。
- `justfont-cyber-essay`（编辑·中文）— 56px/600 称呼与 34–44px Serif SC 600 大值逐字查内白（醒、糖、棉这类多笔画字），600 / 500 两档并排比较，糊了就降字重而不是压字距。
- `w3c-clreq`（编辑·中文）— 「7 条事实 · 1 待核实」中数字与汉字 1/4 字宽；两行长值不出现行首标点。
- `yohji-yamamoto-aw26-27`（设计师）— 字段名退成 13px 注释，全屏只有一处强调（「● 2 件事等你回应」那一句 JU 蓝）。
- `m3-app-bars`（动效）— 签名转场「值字原位变形」与页头收拢一样，是同一个文字对象的连续位置 / 字号变化，回滚即恢复。
- `m3-snackbar`（动效）— 保存失败在同一位置给一句提示 +「重试」，成功后同一位置换成「已保存」并自动消失；提示出现时值块与页头不动，不叠多条。

### S02 大字目录 → 侧栏（整屏环境渐变 + 40px 大字目录；点击后收成 64px 首字竖栏 + 右侧内容面）
- `m3-navigation-rail`（动效）— 大字目录与首字竖栏是同一个目录的两种密度；换页时竖栏不动、内容面换、当前舌片移动；内容滚动时竖栏固定。
- `popeye-954-contents`（编辑）— 像整面饱和蓝底的 CONTENTS 页：首页本身就是目录，最醒目的是起头的组名，小字值退在同一行。
- `magazine-b-lacoste`（编辑）— 每项 = 40px 组名 + 同基线 14px 当前值（必要时第二行一句 14px 说明），条目节奏 60px。
- `android-settings-pattern`（界面）— 目录项文字必须等于内容面 30px 页头（「提醒」→「提醒」）；目录直接露出当前值，值按性质写成短值或一句摘要。
- `telegram-privacy-last-seen`（界面）— 复杂设置压成目录右侧一个可读值（「微信 · 成局后可见」），而不是「已设置」。
- `rauno-exclusion-tabs`（动效）— 竖栏里「与内容面相连的白色舌片」在纵向换页时连续滑动，经过的首字按重叠区域反白。
- `award-tide-guide`（获奖）— 首页的整屏环境渐变按「一天里的天空」取色，棉糖 / 光晕 / 落日切换时整屏情绪变化。
- `justfont-cyber-essay`（编辑·中文）— 40px/600 的九个组名逐字查内白（藏、醒、举、账），两档字重并排比较，糊了就降一档，不压字距。

### S03 上光下墨（上 46% 环境光场 + 48px 身份；下 54% 墨面：待处理亮块、收藏横带、64px 分组行；墨面整张抽起 / 落回）
- `m3-bottom-sheet-gesture`（动效）— 墨面可拖：跟手预览、过阈值上抽成详情、速度够直接提交、距离不足弹回原高度。
- `android-16-expressive-launch-videos`（动效）— 抽起时三拍：光场先压缩成色带 → 墨面轮廓到位 → 内容淡入；文字全程清晰。
- `annd-ss26-campaign`（设计师）— 只有两种尺度：大面积光场 + 墨面上的一条亲密细节（两块待处理亮块）。
- `rick-owens-temple-ss26`（设计师）— 墨面像从肩线垂下的一整块布：只有顶缘（28px 圆角 + 1px 高光）是受力点，抽起 / 落回时整张移动不变形。
- `annd-aw26-show`（设计师）— 深色体量上只有一两条「松开的亮线」：环境色只给待处理亮块与当前值，不铺满墨面。
- `kinfolk-issue-61`（编辑）— 收藏横带的标题行写「全部城市 ⌄」并压一条结构线，下面才是三个局签。
- `bluesky-notification-settings`（界面）— 墨面分组行用一行副标题汇总当前值（「横幅 · 应用内 · 同局成员」），行高 64px 不叠两行小字。
- `award-flighty`（获奖）— 记录 / 举报在墨面上写成「状态标签 + 一句原因 + 时间线」，并在页首说明「只有你能看到」。

### S04 海报拼块（3px 纸缝、无圆角的满版色块；身份块 52px、收藏块「3」88px；块原位长成整页）
- `motion-app-store-layout`（动效）— 签名转场：块原位长成整页，其余块压暗退后不离场；返回时整页缩回同一块，网格与滚动位置不变。
- `m3-dialogs`（动效）— 块 → 整页是 container transform；资料编辑未保存返回时，在原页上弹出一句「放弃修改？」而不是直接丢弃。
- `buck-headspace`（动效）— 外观切换时整页块色先换、标题后到；每块只有一个主角（大数字或大字）。
- `gentlewoman-covers`（编辑）— 每块的骨架固定（标题位 / 值位 / 说明位），环境只改变整块平涂色。
- `junya-watanabe-aw26`（设计师）— 块是单元、缝是可见的接合处，整页仍是一个完整的长方形体量。
- `rick-owens-porterville-fw24`（设计师）— 体量集中在一处（身份块 200px 高、称呼 52px），其余块更矮更窄，对比形成力量。
- `award-my-japan-railway`（获奖）— 收藏块写真实局名（「深夜救急火锅局」），集合是私人的，不做排名。
- `justfont-cyber-essay`（编辑·中文）— 52px/700 称呼、34px/700「纽约」在饱和色块上检查笔画粘连与对比。

### S05 居中仪式（中轴对称；称呼 48px + 360px 环境光晕；居中「段」；弹层从被点段落中心长出）
- `annd-ss26-campaign`（设计师）— 只有两种尺度：360px 光晕与约 330px 的居中窄栏；文字永远窄而居中，不与光晕争宽。
- `margiela-artisanal-2025`（设计师）— 所有段用同一个居中装置（13px 标签 + 26px 值 + 32px 短线），差异只在内容；全屏唯一的颜色重音是底部 JU 蓝描边胶囊，像终场唯一的荧光色。
- `margiela-20th-anniversary-ss09`（设计师）— 弹层像从两个支点被提起：从段落中心 scale .92 → 1，其余内容降到 0.6。
- `apple-invites`（界面）— 局名居中大字 + 时间地点两行小字；空字段写成居中的可点提示（「添加微信号」）。
- `motion-family-dialog`（动效）— 确认面板从居中 CTA 长出、取消或确认后缩回 CTA，面板只占需要的高度。
- `m3-dialogs`（动效）— 弹层进出只用淡入 + 轻微缩放，背景保持原样；未保存关闭先问一句。
- `gentlewoman-covers`（编辑）— 居中正文 22px 的「About」段：居中只给短段落，长内容回到窄栏。
- `award-gentler-streak`（获奖）— 弹层里的每个选项 = 一行标题 + 一句不带评判的说明，选中只用一枚点色。

### S06 一段话（22px 衬线整段写「我是阿禾……」；值 600 + 3px 环境色下划线；点值原位变输入或行下展开面板）
- `codrops-natural-language-form`（界面）— 句子就是表单：点值时编辑器在原位出现，提交后只替换那个词，句子不重排。
- `twreporter-longform`（编辑·中文）— 宋体导语式段落；可点值用颜色 + 跟随每一行的细下边线，跨行不包成胶囊。
- `w3c-clreq`（编辑·中文）— 段内混排「ahe@nyu.edu」「6 类提醒」「（已验证）」：禁则、标点挤压与 1/4 字宽空隙决定整段是否好读。
- `yohji-yamamoto-ss26`（设计师）— 整段文字就是表面（像 099 号把一封信排满前身），每句至多一处偏置的强调。
- `telegram-stories-privacy`（界面）— 值的细化写在同一行下面（「微信 · 成局后可见」下一行「只给同局成员 ›」），不另开一层。
- `whatsapp-parental-controls`（界面）— 记录写成「主语 + 动作 + 对象 + 时间」的完整句子，与段落语气一致。
- `yohji-yamamoto-ss99`（设计师）— 行下展开的面板是句子的「里层」，本身完整可用；收起后只在原短语留下 3px 下划线这条「边」。
- `m3-segmented-buttons`（动效）— 行下展开的三环境 / 城市选择：新旧选项同一时刻交接，段落本身不动。

### S07 预览在上（上 40% 环境上的实时预览：申请人卡 / 提醒横幅 / 环境样张；下 60% 白色控制面）
- `telegram-gift-themes`（动效）— 控制面不动，预览区按所选环境即时变化，连确认按钮也换色；应用后回到原上下文。
- `strava-map-visibility`（界面）— 预览可在「我看到的 / 局主看到的」之间切换，被隐藏的字段灰显。
- `feishu-notification-settings`（界面）— 通知页的预览是一条真实横幅样例，系统权限写成状态卡（已开启 / 去设置 ›）。
- `bluesky-notification-settings`（界面）— 把「设置 → 实际出现的横幅」画成因果：改一个开关，上面的横幅立刻变化。
- `signal-usernames-2024`（界面）— 控制面每组组脚一句「谁会看到」，预览卡本身就是分享物。
- `telegram-power-saving`（界面）— 「动态」先有总档，总档为「减少」时细项整体失效并写明原因；每个细项一句人话说明它关掉什么，预览区据此演示差别。
- `award-tide-guide`（获奖）— 预览物在首页、通知、外观各页保持同一身份（同一条曲线贯穿 Today / 表格 / 小组件）。
- `rick-owens-porterville-fw24`（设计师）— 固定相框（预览区）里只让内容变，相框的位置与尺寸不动。

### S08 横向分栏（整高纸栏横向 snap、右露下一栏 28px；顶部栏名轨；当前栏展开占满）
- `m3-carousel`（动效）— 下一栏的 28px 边在横滑过程中长成整栏、当前栏同时收窄成边；松手总是吸附回「一栏 + 一边」。
- `rauno-exclusion-tabs`（动效）— 栏名轨的环境色下划线是一个连续移动的实体：随横滑跟手、宽度跟随目标栏名，而不是松手时整词切换。
- `ustwo-body-coach`（界面）— 换栏时页头与身份不动，栏内容立即可读，指示物 300–400ms 追上。
- `bluesky-notification-settings`（界面）— 「提醒」栏「6/6」大数字下六行，每行副标题写送达方式。
- `kinfolk-issue-61`（编辑）— 每栏顶部的范围选择（「纽约 ⌄」）压在一条结构线上。
- `popeye-954-contents`（编辑）— 栏名轨与栏内标题用同一套编号 / 名称起头，横向浏览时对位。
- `junya-watanabe-aw26`（设计师）— 每栏是一个完整单元、栏缝是可见接合处，环境色在缝里连续。
- `award-flighty`（获奖）— 「记录与举报」栏的状态标签 + 时间线；提醒由接收方自己决定。

### S09 夜灯（底 #0E1016；三团 30–45% 环境光静止、只在焦点变化时移动；称呼 52px 白；「光下的陈述」两栏）
- `award-moonlitt`（获奖）— 墨底上只有一个发光主体在称呼背后，其余卡片退到低亮度；内容按块整体替换。
- `obscura-wong-hiu-ching`（编辑·中文）— 一盏暖光照亮的地方就是视觉中心：最亮的光团跟随焦点。
- `annd-aw26-show`（设计师）— 待处理 = 一道 JU 蓝亮线 + 一句话，强调色全屏只出现一两次。
- `rick-owens-temple-ss26`（设计师）— 层次只靠透明度与亮度（30–45% 光团、白字），不靠描边与阴影；标签白度按通用规则 3 不低于 70%（配方写的 60% 偏低）。
- `android-16-expressive-launch-videos`（动效）— 详情面升起前光团先聚成色场，再出面板，再出文字。
- `emil-clip-path-theme-switch`（动效）— 环境切换沿一个方向揭开到新色光，前景文字不经过中间灰；减少动态时瞬切。
- `instrument-oura`（界面）— 深底上值用大字、状态用语义色小字（「1 待核实」），不把整块涂色。
- `telegram-power-saving`（界面）— 光团移动是可关闭的「效果」，关闭后光团固定但仍在，语义不变。

### S10 叠层（顶层身份层 230px；其后每层压在前层上只露 72px 边：20px 组名 + 15px 当前值；抽起一层到顶，其余压成 24px 边）
- `apple-wallet-passes`（界面）— 每层露出的边 = Wallet 折叠头带：只写「是什么 + 最关键的当前值」，展开后才有全部。
- `yohji-yamamoto-ss99`（设计师）— 抽起一层时下面的层仍完整；压扁的层只留一条边提示存在。
- `margiela-aw97-wrap-skirt-vam`（设计师）— 边本身承载信息（像布边织字），不另加标签框；层只在必要处固定。
- `junya-watanabe-techno-couture-fw00`（设计师）— 同一单元的重复形成纵深：每层的边同高同构，靠色与顺序区分。
- `telegram-folders-archive`（动效）— 层落回时边上的当前值已经是新值；取消收藏时相邻局签补位并给「撤回」。
- `m3-bottom-sheet-gesture`（动效）— 抽起的层可下拉压回成边：过阈值提交、不足弹回。
- `magazine-b-lacoste`（编辑）— 边上的「组名 + 同基线当前值」排成一列，读起来是一份目录。
- `airbnb-2025-profile`（界面）— 顶层身份层 = 首字头像 + 称呼 + 城市 + 角上验证徽章；不放任何可被当作信用分的计数。

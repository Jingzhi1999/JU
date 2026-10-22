# S05 居中仪式 · 独立复核（阶段 2）

- 复核者：独立复核代理（未参与构建），2026-10-22。只按真实点击 / 输入与截图判断，构建者自报不计。
- 被测文件：`.build/verify-S05.html`（`S05.dc.html` 与 HEAD 0412ec2 相同，未改动）。项 1–9 用共享核心 d9f58b5 构建；项 10 及最后一轮工具复跑用 aed3207 重建（关键帧按下即开始）。
- 驱动：`.build/verify-S05-drive.cjs`（在 capture.cjs 之上加了真实键盘输入、滚轮、面板按文字点击、文件输入、关键帧滑块真实拖动；`eval/measure/poll` 只读状态，不驱动产品）。
- 自动检查（两次构建结果相同）：coverage 52/52、0 错误；widths overflow [] / fontInvariance [] / 最小字号 13；kb-check findings []；rm-check rmSys true、findings []。
- 计数：**blocker 0 / major 5 / minor 12**。

## 主负责人要我独立判断的三件事
1. **同一团光开每一页：仪式还是单调？——单调。** 首页 → 资料那一步成立（光留在原处、主角从「阿禾」换成资料），这是 S05 最好的一刻；但往后十页（收藏、详情、城市、通知、外观、记录、记录详情、举报详情、帮助、规则、隐私、账户、关于）都是同一张卡、同一位置、同一尺寸、同一配色的光盘，只换盘里的字；「帮助与反馈」与「参加约定」甚至开着同一个「18 条约定」。缩略图里分不出页，光晕环境下是 12 个一模一样的烈橙色环。光盘还把真正的内容（提醒类别、记录列表、规则）一律压到首屏下半或折线以下。
2. **居中正文：** 规则全文 16px / 1.85、约 20 字一行，测量本身舒服（手机中文正常栏宽）；问题在两处——justify + `text-align-last:center` 让段尾孤字跳到中间（「诉”。」「到场。」），以及大量 13–15px、3–5 行的居中说明在 260–280px 栏里频繁拆词。结论：3 行以上的阅读文字应离开中轴（栏居中、字左齐或末行左齐），中轴只留给标题、值和 ≤2 行的短说明。
3. **内嵌圆角卡片 = 手机里的手机？——是，三种环境都是。** 卡片 342×760 与手机 390×844 几乎同比例，28px 圆角套在 38px 机身圆角里，带投影，JU 字标悬在卡片上方像状态栏；左右各 24px 的边只露出一条被调淡的首页，不承担信息，却让每一页正文都少 48px 宽。

## 发现（严重度 | 位置 / 状态 | 现象 | 证据 | 建议改法）
视觉（先列）
- major | 全部二级页 × 棉糖 / 光晕 / 落日 | 每张卡片都以同一团 316px 光盘开场、位置与尺寸不随页面内容变化；12 页并排几乎只能靠盘中文字区分；光晕环境下重复 12 个高饱和橙环；内容被压到折线以下 | `verify/pages-cotton/twelve-390-cotton.jpg`、`verify/pages-halo/twelve-390-halo.jpg`、`verify/pages-sunset/twelve-390-sunset.jpg`、`verify/widths/sheet.jpg` | 保留「同一团光」这个对象，但让它按页面类型变化：资料 / 详情保持整盘；列表页一进来就收成页头旁的小光章或被卡顶裁成半盘，把列表提到首屏；表单页缩成主角背后的小光；数字页与词页用不同的裁切 / 偏位。帮助页不要重复规则页的「18 条约定」
- major | 所有卡片页（三环境） | 内嵌卡片读成「手机里的手机」：同比例、套圆角、投影，左右 24px 空边无信息却吃掉正文宽度 | 同上三张 12 页表、`verify/crops/profile-390-note-sliced.jpg` | 长成之后改为左右满宽的底部弹起式卡片（只留顶部露出首页），或卡片高度跟内容走；让中心长出的动作在长成时把边缘推出屏幕
- major | 个人资料卡静止态（签名流程的落点） | 390：快照说明「已报名的局仍使用报名时填写的资料…」被底部 24px 渐隐切成半行，像渲染残片；375×812：「已验证 · 学校邮箱」被淡到约 35%，快照说明完全看不见 | `verify/crops/profile-390-note-sliced.jpg`、`verify/crops/profile-375-verified-faded.jpg`、`verify/i09-sizes-variants/f05.jpg` | 资料页头部光盘 min-height 288 → 约 220，或把快照说明放进动作条上方的固定位置；渐隐起点避开最后一行（静止态最后一行必须完整）；375 必须复查
- major | 编辑资料（任何 ≥ 8 字称呼；long 变体全部三个字段） | 40px 单行居中输入框只容约 7 个汉字：合法的 10 字称呼编辑时永远看不全（只见「想睡到十一点吧」或「周末只想睡到十」）；long 变体的微信号、邮箱也被裁掉尾部 | `verify/crops/edit-inputs-clip-long-values.jpg`、`verify/i18-long-name-edit/log.json`（scrollW 408 / 528 > clientW 292） | 称呼按字数降字号（40 → 32 → 26）或改为可换行的 textarea；微信号 / 邮箱同理（展示页已会换行，编辑页也要能看全）
功能（视觉之后）
- major | 通知 6 个类别、外观「减少动态」 | 「开着 \| 关了」画成二选一分段，实际整枚胶囊是一个 toggle：点已选中的「开着」会把它关掉，点「关了」会把它打开（真实点击两半各一次实测） | `verify/crops/capsule-switch-tap-on-half-turns-off.jpg`、`verify/i04b-switch/log.json` | 点哪一半就设成哪一值（已是该值则不变），role 改为 radiogroup 或保留 switch 但改成单一开关外形；这正是方向卡写下的失败点「开关对会被误读为两个按钮」
- minor | 首页 / 根页页头收拢 | --hc ≈ 0.4–0.6 时 JU 字标与「设置」相撞（U 压在「设」上）；终态 JU 比 18px 标题偏高 | `verify/crops/header-collapse-collision.jpg`、`verify/i01-enter/f12.jpg`–`f13.png` | 字标先向左让位、标题稍后上移；终态按基线对齐（30 → 18 连续性本身已实测通过）
- minor | 全部 toast | `.s05-toast` 用 left:50% 的收缩宽度，被锁在 195px（半屏），十几个字就折两行；固定 top:10 盖住 JU 字标和收拢后的页头标题 | `verify/crops/notify-prompt-and-2line-toast.jpg`、`verify/i15-toast/log.json`（width 195、2 行） | `width:max-content; max-width:calc(100% - 48px)`；位置避开字标（卡片内顶部或动作条上方）
- minor | 所有卡片页 | 根导航「设置」的蓝点从卡片下沿露出（右下约 300,817），像残留物 | `verify/crops/profile-390-note-sliced.jpg`（右下）、`verify/pages-cotton/f02.jpg` | 卡片在上时隐藏根导航，或让卡片下沿盖过导航
- minor | 根切换 设置 ↔ 找局 / 我的局 | 交叉淡入时两团尺寸、位置不同的光与「21 个局」「阿禾」叠成双重曝光 | `verify/crops/root-switch-double-exposure.jpg` | 同一团光留在原处只换主角，或先出后入
- minor（动效） | 卡片返回 | 字与头部光先在 110ms 内退成 0，再收回一张空白纸卡，返回途中对象身份消失；字退场是 transition，关键帧拖到返回的 0 帧已是空卡 | `verify/crops/exit-blank-card-folds-back.jpg`、`verify/i10d-exit-scrub/log.json` | 收回时让头部主角随卡缩回原段（与长出对称）；字退场也写成 @keyframes 并接 `.scrub`
- minor（功能） | 卡片长出的前约 260ms | 点返回键时它还在 clip 之外，点按落在 `.s05-shw` 上，scrim 判断 target ≠ currentTarget 不处理，点按被吞，卡片照常打开（控制器本身支持动画中返回） | `.build/verify-S05-backdebug.txt`（返回键中心命中 DIV.s05-shw，最终仍为 home>favorites）、`verify/i13-interrupt/log.json` | ph-enter / ph-in 时 `.s05-shw{pointer-events:none}`、只让 `.s05-sheet` 接收，或 scrim 把落在 `.s05-shw` 上的点按也当外部点按
- minor | 居中多行说明 / 规则正文 | 拆词：当前年/度、调/整、偏好会保/存、青三/色、共/用、至少 4 个/字、真实/账户；规则段尾孤字居中 | `verify/crops/rules-reading.jpg`、`verify/crops/help-privacy-about.jpg`、`verify/coverage/s-records-empty.jpg`、`verify/coverage/s-feedback.jpg` | 见上「居中正文」：长文离开中轴；短说明 `text-wrap:pretty` + 关键词不断行
- minor | 邮箱验证 | 键盘弹起时「验证 / 重发」藏在底部渐隐与保存条下，只看得到此刻无效的「保存」；过期后在码框里输入会清掉「已过期」提示、又没有验证键，界面不再解释为什么验不了 | `verify/crops/kb-code-verify-hidden.jpg`、`verify/i02-profile/f21.jpg` | 码步骤时让「验证」上到动作条（或贴键盘上沿）；过期提示保留到重新发送
- minor（shared + S05） | 举报详情「已提交的补充」 | 补充时加的本机文件在详情里不出现：共享视图模型只给记录补充算 materialsText，举报补充没有；S05 也没渲染 `x.materials` | `verify/i07b-appeal-report/f11.jpg`–`f12.png`、`verify/i07b-appeal-report/log.json` | 共享：report supplementRows 补 materialsText；S05：渲染「材料 …」行
- minor（shared） | 记录详情，提过一次异议后 | 异议入口已消失，但下方说明仍写「可随时补充说明或提出异议」 | `verify/i07a-record/sheet.jpg` 末帧 | 共享文案按 goDispute 是否可用切换；S05 在已用过时写一句「异议已提出（每条一次）」
- minor（shared） | long 变体 → 编辑资料 | 变体称呼 13 字，超过 10 字规则，编辑一打开计数就是红色 13/10，任何保存先报错 | `verify/crops/edit-inputs-clip-long-values.jpg` 第三张 | 共享数据把 long 称呼控制在 10 字内
- minor | 小弹层（「2 件事等你」、未保存确认） | 38% 纸色幕太薄，弹层下首页的局名清晰可读，与弹层内容抢 | `verify/i11-attention/f02.jpg` | 小弹层场景加深到约 60%，或只对弹层背后做局部模糊

## 实际观察 / 实际操作通过的项
- 进入设置（根导航 找局 → 设置）、滚轮下滚：页头 30 → 27.5 → 25 → 22.5 → 20 → 18px 连续，标题移入字标旁的工具行；回滚恢复 30px（`verify/i01-enter/log.json`）。
- 资料：清空称呼保存 → 「请填写称呼」；改邮箱 → 发码 → 错码「验证码不正确」→ 面板过期 →「验证码已过期，请重新发送」→ 重新发送 → 新码验证 → 已验证；武装失败 → 「保存中…」329ms 可见 → 失败文案 + 输入保留 →「重试保存」→「已保存」→ 卡片收回；处理结束后 411ms 落定；资料卡显示「资料已保存 / 刚更新」，回首页称呼在原位交叉淡入（旧值 → 新值 190–337ms），账号行变为 stern.nyu.edu 已验证。免费邮箱、未验证新邮箱、非法微信号、11 字称呼各自报错（`i02-profile`、`i02b-save-timing`、`i17-validation`）。
- 未保存：「取消」与点卡片外都弹确认；继续编辑保留输入；放弃修改收回到资料，重开草稿已清（`i03-unsaved`）。
- 通知：开启提醒 → 系统弹窗 283ms 挂上、约 346ms 可见 → 允许 → 已允许；拒绝预设 → 已拒绝；denied / unsupported / connected 三层表达各不相同；类别开关数值回到首页（`i04-notify`）。
- 外观：预览光晕 / 落日时整屏换光（650ms 新光从模糊升起），取消后数据仍为棉糖，再预览并应用后首页同步；用户「减少动态」与系统减少动态下预览瞬切、页面写明「跟随系统」（`i05-skin`、`i05b-skin-sysrm`）。
- 收藏：入局接缝右滑超阈值收进（错误方向阻尼 ×0.26 + 「还没收藏」）；首页计数与前三个局名、收藏列表、我的局按钮、入局星标四处一致；拿出 → 撤回回到原第二位；全部拿出后空态；empty 变体空态；只看收藏；详情里收藏 / 拿出（`i06-fav`、`i12-feed-detail`、`i14-wrong-swipe`、`i16-fav-three-places`）。
- 记录：未出席补充（附本机文件，详情显示文件名）→ 异议 → 异议入口消失；主动退出 → 空提交报错 → 申诉；举报需补充 → 补充 → 处理中（时间线多一节点）；我的局历史行举报：未选对象报「请选择举报对象」→ 选后提交 → 回到我的局原位置，行内「举报已提交」，设置里我的举报出现该条（`i07a`、`i07b`、`i07d`）。
- 帮助：反馈失败（内容保留）→ 重试 → 列入「我的反馈」；规则全文、隐私、账户退出本机演示 → 已结束 → 重新开始、关于（`i08-help-account`）。
- 375 / 430 真实回流；long / many / fresh 的首页、收藏、资料；键盘模拟下焦点与主动作在键盘之上（`i09-sizes-variants`、`i09b-keyboard`、`kb/`）。
- 返回恢复首页滚动位置（260 → 260）；连点两次 / 三次只开一张卡（`i13-interrupt`、`i13b-fast-taps`）。
- 暂停与关键帧（共享修复已生效）：0.5× 下签名转场中暂停停在 283ms 帧；拖 0 → 100 从这段转场起点（原段盒子、透明 0、0.92）走到整卡，不随暂停处偏移；转场结束后直接拖，自动重播最近一次核心动作并冻结（sheet / value / skin 三个都试过）；「释放」后回到实时状态并继续；「重播上一动效」三个动作都能重播（`i10a`、`i10b`、`i10c`、`i10d`）。
- 首页页头无演示声明（「2 件事等你回应 · 纽约」）；首页无主 CTA；JU 蓝只用于保存 / 提交 / 应用 / 开启提醒；未见 emoji（★☆ 为 V27 的符号）。

## 未能验证的项
- 真机与真实软键盘、真实系统「减少动态」设置（只用了 Playwright 的 reducedMotion 模拟）、真实等待 5 分钟过期（用了面板「让验证码过期」）、帧率。
- 最终离线交付文件 `JU-SETTINGS-R2-TEN-DIRECTIONS.html` 未测（只测私有构建）；字体在离线环境下的回退未测。
- 中文文件名的本机材料：本环境的 Playwright setInputFiles 对非 ASCII 路径静默失败（工具限制，不是 S05），改用 ASCII 文件名。
- 修改资料后「历史报名快照不变」：我的局接缝不显示称呼，无法从画面确认。

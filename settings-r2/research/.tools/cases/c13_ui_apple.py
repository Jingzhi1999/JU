E = 'settings-r2/research/evidence/'
def ev(slug, *names): return [f'{E}{slug}/{n}' for n in names]
CASES = [
dict(
 slug='apple-invites', name='Apple Newsroom「Introducing Apple Invites」——Upcoming 满幅邀请卡与居中的编辑单元', creator='Apple', period='2025-02-04',
 cat='ui', url='https://www.apple.com/newsroom/2025/02/introducing-apple-invites-a-new-app-that-brings-people-together/', viewed='2026-10-10（上一轮截图）；2026-10-22 复核截图',
 what_seen='两张页面截图。① Upcoming 屏：顶栏「Upcoming ⌄」+ 「+」与头像；一张满幅照片卡（三人合影）占据屏幕主体，左上角半透明胶囊「♛ Hosting」，卡片下部居中一簇叠压的小头像，其下白色大标题「Housewarming Party」两行居中，再下「Tue, September 2, 8:00 PM / Brooklyn, NY」两行小字居中；右侧露出下一张卡的边。② 编辑邀请：模糊放大的红色背景上一列半透明圆角单元，全部居中——「Event Title」大字 →「📅 Date and Time」→「📍 Location」→ 头像 +「Hosted by Andre Lorico / Add a description.」→ 底部照片图标与 ✕；每个单元图标在上、文字在下。',
 brief='满幅照片邀请卡上居中的大标题 + 时间地点；编辑态是一列居中的半透明单元（图标在上、文字在下）。',
 method='整屏一个居中轴：主体（局名）大而居中，时间地点在下方小字居中，主办与客人用叠压头像；编辑时每个字段是一个居中的独立单元，空字段直接写成可点的提示语（「Add a description.」）。',
 affects='S05 居中仪式：称呼与「段」全部居中，每段 13px 标签 + 26px 值 + 14px 说明；空值写成居中的可点提示（「添加微信号」）；收藏的局在 S05 中以居中局名 + 时间地点两行呈现；JU 与 Apple Invites 同属「组局」语境，可对照局卡的信息层级。',
 avoid='满幅照片底与模糊背景上的半透明单元（任务书禁止廉价玻璃）、皇冠 Hosting 徽章、Apple Intelligence 图像生成。',
 evidence=ev('apple-invites','newsroom-upcoming-card.jpg','edit-invitation-centered-cells.jpg'),
 motion_seen=False, award=None, inherited='apple-invites-guest-list（上一轮 REF03）', concepts=['S05','S07'], tags=['event-app'], status='仅核验静态（继承截图）'),
dict(
 slug='apple-wallet-passes', name='Apple Wallet：Developer 概览（钱包叠放）+ HIG「Wallet」票证设计规范', creator='Apple（Developer / Human Interface Guidelines）', period='2024–2026（现行版）',
 cat='ui', url='https://developer.apple.com/design/human-interface-guidelines/wallet', url_viewed=['https://developer.apple.com/wallet/'], viewed='2026-10-10（上一轮截图）；2026-10-22 复核截图',
 what_seen='三张截图。① developer.apple.com/wallet 概览：Wallet app 里票证层叠，每张只露出顶部一条头带，头带上是该卡最关键的一项——DRIVER’S LICENSE、CITY TRANSIT、Cash $226.78、MUSEUM GUEST NO.、Coffee Shop POINTS 3392、Art Museum、AIRLINE SFO → NRT；最后一张完整展开；下方 Boarding passes（SFO ✈ NRT 大字 + 一排小字格 + 二维码）与 Coupons 示例。② HIG「Designing passes」：「Keep the pass front uncluttered. Show essential information, like an event date or account balance, in the header so people can see it when the pass is collapsed in Wallet」「Make your pass instantly identifiable」「Ensure sufficient contrast」，配紫色会员卡（MEMBER NAME Juan Chavez、MEMBER ID、MEMBER SINCE / EXPIRES / GUEST PASS）。③ Pass styles 对比：紫底白字标签 ✓ / 紫底品红标签 ✗；Concert 票（EVENT Jazz Show、LOCATION Stadium、TIME / LEVEL / ROW / SEAT）。',
 brief='票证叠放时每张只露一条头带，头带上写「标题 + 最关键的一个值」；规范明文：关键信息放在折叠时也能看到的头部。',
 method='叠放的每一层只露出一条头带，头带只承载「是什么 + 最关键的当前值」；层的主体信息在展开后才出现；颜色识别每一层，文字与底色对比必须足够。',
 affects='S10 叠层：每层露出 72px 的边 = Wallet 的头带——左 20px/600 分组名、右 15px 当前值（「提醒 · 6 类」「外观 · 棉糖」「收藏 · 3 个局」）；抽起一层后才显示全部；层色取环境派生色时检查白 / 墨字对比；S07 预览区的身份卡。',
 avoid='票证条码、航班 / 会员卡外观、全大写小字标签（JU ≥12px 且中文为主）。',
 evidence=ev('apple-wallet-passes','wallet-stack-and-pass-types.jpg','hig-designing-passes.jpg','hig-pass-styles-contrast.jpg'),
 motion_seen=False, award=None, inherited='apple-wallet-pass-anatomy（上一轮 REF04）', concepts=['S10','S07'], tags=['pattern'], status='仅核验静态（继承截图）'),
]

E = 'settings-r2/research/evidence/'
def ev(slug, *names): return [f'{E}{slug}/{n}' for n in names]
CASES = [
dict(
 slug='bluesky-notification-settings', name='Bluesky 博客「More Control Over Your Notifications」——设置 › 通知：每类一行的送达摘要 + 详情页（推送 / 应用内开关 + 来自谁）', creator='Bluesky（The Bluesky Team）', period='2025-07-07（app 1.104）',
 cat='ui', url='https://bsky.social/about/blog/07-02-2025-more-notification-control', viewed='2026-10-22',
 what_seen='手机 390 宽读博文并下载文内 4 张原图（2400×1260 / 2400×1200 / 1600×1066 / 1600×800）。「Enhanced Notification Settings」图：左屏「Notifications」列表 10 行，每行 = 线性图标 + 标题 + 灰色副行汇总当前送达方式（Likes「Push, In-app, Everyone」、New followers、Replies「In-app, Push, Everyone」、Mentions、Quotes、Reposts、Reposts of your reposts「Off」+ 蓝色「New」胶囊、Likes of your reposts、Activity from others「Push, In-app」、Everything else）+ chevron；箭头指向右屏「Likes」详情：标题 + 一句说明「Get notifications when people like your posts.」→ 两只开关「Push notifications」「In-app notifications」（开）→ 分隔线 → 小标题「From」+ 单选「Everyone ● / People I follow ○」。「Activity Notifications」图：资料页「Following」左侧一枚蓝色铃铛，曲线箭头连到锁屏上的推送横幅「The Athletic · NEWS: The New York Knicks have offer…」。正文：选项来自 Everyone / People you follow / No One；发帖人可在 Settings › Privacy and Security 关闭「Allow others to get notified of your posts」。',
 brief='通知列表每行副标题汇总「推送、应用内、来自谁」；详情 = 一句说明 + 推送 / 应用内两开关 + 「来自」单选；铃铛 → 锁屏横幅的因果图示。',
 method='每类通知拆成三个正交维度（推送、应用内、来自谁），列表行用一行副标题把三者的当前值写出来，详情页按同样顺序排列；新增的项用一枚小胶囊「New」；给出「设置 → 实际出现的横幅」的因果示意。',
 affects='通知（§9.6）六类提醒：每类一行「横幅 · 应用内 · 仅同局成员」式副标题，详情页两开关 + 范围单选；S08「提醒」栏「6/6」大数字下的六行、S03 墨面行、S02 内容面；S07 预览区画出「这条提醒会怎么出现」的横幅（因果示意）。',
 avoid='Bluesky 蓝色、社交网络的点赞 / 转发语义、「New」胶囊遍布。',
 evidence=ev('bluesky-notification-settings','settings-notifications-list-and-likes-detail.jpg','profile-bell-to-push.jpg','overview.jpg'),
 motion_seen=False, award=None, inherited=False, concepts=['S08','S03','S02','S07'], tags=['settings-screen'], status='仅核验静态'),
dict(
 slug='airbnb-2025-profile', name='Airbnb 2025 Summer Release——重新设计的 Profile 页与 Trips 行程页（Newsroom）', creator='Airbnb', period='2025-05-13',
 cat='ui', url='https://news.airbnb.com/product-releases/airbnb-2025-summer-release/', viewed='2026-10-22（另见上一轮 REF14 的 Trips 截图）',
 what_seen='桌面浏览（页高约 8313 CSS px），移除 cookie 浮层后截取两段。Profile：左上大标题「Profile」+ 右上铃铛圆钮；一张白色圆角卡：左半为头像（右下红色盾形验证徽章）+ 姓名「Alexi」+ 灰色「Los Angeles, CA」，右半三行统计以发丝线分隔「24 Trips / 22 Reviews / 8 Years on Airbnb」（大数字在上、小字在下）；其下两张方形瓷砖各带「NEW」小标：Past trips（叠放的旅行照片）、Connections（三枚叠压头像）。旁文：「share where you’ve traveled on Airbnb and see the people you’ve met along the way… highlight the over 200 million guests and hosts… identity verification」。Trips tab：「Apartment in Mexico City · May 22–26 · Hosted by Anna」卡 + 「Get directions」，下面按日期的竖向时间线（Thu 22 红圆标 → Check in after 3:00 PM；Local taqueada 5:00 PM；Sat 24 → Get in the ring with a real Mexican luchador 1:30 PM）；底栏 Explore / Wishlists / Trips / Messages / Profile。',
 brief='Profile：身份卡（头像 + 验证徽章 + 姓名 + 城市）与三项统计并排，下接「去过的地方 / 认识的人」两块瓷砖；Trips：按日期的时间线。',
 method='资料页以一张「身份卡」为视觉中心：身份（头像、名字、城市、验证）与几项与本人相关的事实并排，下面是两块通往个人收藏的入口瓷砖；验证状态用头像角上的一个小徽章表达，而不是一行文字。',
 affects='设置首页身份区（§9.1）：称呼 + 默认城市 +「nyu.edu 邮箱已验证」作为身份卡的一部分（S10 顶层身份层、S04 身份块、S07 预览区的申请人卡）；收藏与「见过的人」式入口瓷砖（S04 收藏块、S08 收藏栏）。',
 avoid='公开的 Reviews 计数与「Years on Airbnb」这类可被理解为信用分的数字（任务书禁止公开信用分）；红色品牌色；旅行照片。',
 evidence=ev('airbnb-2025-profile','profile-screen-stats-tiles.jpg','trips-tab-itinerary.jpg'),
 motion_seen=False, award=None, inherited='airbnb-trips-itinerary（上一轮 REF14 的 Trips 记录；本轮重截并补 Profile）', concepts=['S10','S04','S07','S08'], tags=['settings-screen'], status='仅核验静态'),
]

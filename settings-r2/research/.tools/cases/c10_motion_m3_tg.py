E = 'settings-r2/research/evidence/'
def ev(slug, *names): return [f'{E}{slug}/{n}' for n in names]
CASES = [
dict(
 slug='m3-app-bars', name='Material 3「App bars」规范——flexible app bar 滚动时压缩成小标题栏、搜索栏展开成搜索视图（规范视频）', creator='Google Material Design（M3 Expressive）', period='M3 组件规范（2025）',
 cat='motion', url='https://m3.material.io/components/app-bars/guidelines', viewed='2026-10-22',
 what_seen='滚动规范页取得 8 段视频地址，下载 3 段（60fps）抽帧。①「Medium and large flexible app bars can use the compress effect to transform into small app bars when scrolled」（1004×694）：0.7–1.1s 大标题「Recap from June 12-19」左对齐在内容上方；1.2s 随内容上滚开始淡出上移；1.3–1.6s 同一标题以小字号出现在顶栏正中，与返回钮、两个动作同一行——约 400ms 跟随滚动完成；回滚 3.6–4.2s 反向展开，大标题回到左侧原位。②「When selected, a search app bar opens a search view」：1.0–1.6s 点搜索栏（涟漪），1.7–1.9s 搜索栏向四周扩展成整页搜索视图（左侧返回箭头 + 最近搜索 Peanut / End of school year），约 300ms；4.6–4.8s 点返回，搜索视图收回成原来的胶囊搜索栏，下面的消息列表恢复。③「Upon scrolling, an app bar container fills with contrasting color」：Top Stories 页滚动后顶栏底色填充以与内容分隔。',
 brief='大标题随滚动在约 400ms 内压缩成顶栏中部的小标题（回滚反向）；搜索栏约 300ms 扩展成整页搜索视图、返回时收回原位。',
 method='页头收拢由滚动驱动、可逆，标题是同一个对象从大到小、从左到中的连续变化，而不是两个标题交叉替换；搜索入口与搜索页是同一个容器的两种尺寸，返回时回到原来的胶囊。',
 affects='十套共有的页头规格（30px 主标题 / 14px 辅助 → 滚动连续收拢到 18px 进入工具行中部，§4）：标题必须是同一元素的连续变换、回滚即恢复；默认城市的搜索（§9.5：选择、搜索、无结果）——S07 / S03 城市页搜索框原位展开成搜索视图，返回时回到原入口与滚动位置。',
 avoid='M3 紫色外观、相册内容、把收拢做成两套标题的淡入淡出替换。',
 evidence=ev('m3-app-bars','flexible-bar-compress-expand-10fps.jpg','search-bar-to-view-10fps.jpg','scroll-container-fill-2fps.jpg'),
 motion_seen=True, award=None, inherited=False, concepts=['S01','S03','S07','S02'], tags=['mobile-evidence','component-spec-video'], status='已看动效'),
dict(
 slug='m3-dialogs', name='Material 3「Dialogs」规范——全屏对话框从 FAB 展开、未保存关闭时弹出确认、关闭后收回 FAB；基础对话框进出（规范视频）', creator='Google Material Design', period='M3 组件规范（2025）',
 cat='motion', url='https://m3.material.io/components/dialogs/guidelines', viewed='2026-10-22',
 what_seen='下载 2 段规范视频抽帧。①「A basic modal dialog appears when a full-screen dialog is closed without being saved」（1748×2048，4.46s，10fps 细看）：0.3–0.9s 深色日历页，点右下紫色 FAB（涟漪）；1.0–1.1s 一块紫色面从 FAB 位置向左上扩展成整页（container transform），随即变成「New event」全屏表单（邮箱、Carmen’s Birthday Surprise Party、123 El Camino…、Tues, Sep 26 7:00 PM–11:00PM、All day、Eastern Standard Time）；1.9–2.1s 点左上 ✕，表单中部淡入一张小对话框「Discard draft?」+「Cancel / Discard」（约 200ms）；2.6–3.0s 点其中一钮（涟漪在 Cancel 上）后，3.1–3.3s 表单向下、向右下角收缩，3.3–3.5s 收回成原来的 FAB，日历完整恢复。②「A dialog appears with an enter and exit transition」：地图页上「Use location service?」对话框淡入并轻微放大（约 1.0s 处），两钮 Disagree / Agree，3.0s 淡出，底下的地点卡「Dandelion Chocolate · Navigate」与底栏不动。',
 brief='FAB → 全屏表单（container transform）；未保存点 ✕ → 「Discard draft?」小对话框约 200ms 淡入；选择后表单收回 FAB；基础对话框淡入放大、背景不动。',
 method='模态的出入口是同一个对象：从哪里长出来就收回到哪里；未保存时关闭不直接丢弃，而是在原表单上方弹出一个只问一件事的小对话框；对话框进出只用淡入 + 轻微缩放，背景保持原样。',
 affects='§8「模态打开、关闭、未保存确认」与 §9.2「未保存返回确认」：S05 居中弹层从被点段落中心长出、关闭时缩回该段；S04 块长成整页、返回时缩回块位；所有套的资料编辑在未保存返回时弹出一句问题 +「继续编辑 / 放弃修改」，不自动丢弃输入。',
 avoid='M3 深紫外观与 FAB；用 Cancel / Discard 这类含义模糊的按钮文字（JU 写成「继续编辑」「放弃修改」）。',
 evidence=ev('m3-dialogs','fullscreen-dialog-discard-to-fab-10fps.jpg','basic-dialog-enter-exit-2fps.jpg'),
 motion_seen=True, award=None, inherited=False, concepts=['S05','S04','S01'], tags=['mobile-evidence','component-spec-video'], status='已看动效'),
dict(
 slug='m3-snackbar', name='Material 3「Snackbar」规范——失败提示带「Retry」，重试成功后换成成功提示（规范视频）', creator='Google Material Design', period='M3 组件规范（2024–2025）',
 cat='motion', url='https://m3.material.io/components/snackbar/guidelines', viewed='2026-10-22',
 what_seen='下载规范页 3 段视频（1352×600），裁出手机区按 1–2fps 抽帧。重试一段（6.5s）：0s 植物照片编辑页；1–2s 底部工具条上方出现深色 snackbar「Can’t add photo to your favorites」+ 右侧紫色文字钮「Retry」；3s 点 Retry 后 snackbar 消失；4–5s 新的 snackbar「Photo added to your favorites.」（无按钮）；6s 自动消失。另一段（4.5s）：snackbar 从底部滑入、停留后滑出，上方内容不动。规范页文字「Don’t stack snackbars on top of one another」「Don’t animate other components along with snackbar animations, such as the floating action button」。',
 brief='失败 snackbar 带一个文字钮「Retry」→ 重试 → 成功 snackbar 自动消失；不叠放、不带动其他组件。',
 method='失败与重试在原位置给结果：一条提示、一个动作、成功后用同一位置的另一条提示收尾；提示出现时页面其余部分不动，不叠加多条。',
 affects='§8「错误和重试」与收藏取消的「撤回」：收藏列表取消后底部一条「已取消收藏 · 撤回」；保存失败时「没保存上 · 重试」，重试成功换成「已保存」；S01 的「已保存」12px 字在值右侧 2.6s 消失、S03 墨面底部的提示条——都不带动页头或 CTA。',
 avoid='M3 深灰 snackbar 外观、英文按钮、同时弹多条提示。',
 evidence=ev('m3-snackbar','error-retry-success-1fps.jpg','snackbar-in-out-2fps.jpg'),
 motion_seen=True, award=None, inherited=False, concepts=['S01','S03','S10'], tags=['mobile-evidence','component-spec-video'], status='已看动效'),
dict(
 slug='telegram-stories-privacy', name='Telegram 博客「Telegram Stories」——「WHO CAN VIEW THIS STORY」隐私选择页 + 资料页头随滚动收进灵动岛（iOS 真机图与录屏）', creator='Telegram', period='2023-08',
 cat='ui', url='https://telegram.org/blog/stories', viewed='2026-10-22',
 what_seen='读博文「Granular Privacy Settings」一节（4 档：Everyone / My Contacts / Close Friends / Selected Contacts，每档可再排除或包含任意用户；可选一组「永远看不到」的人；可禁止截图）并下载该节原图（1080×1080）：深色 iOS 面板，组头「WHO CAN VIEW THIS STORY」；四行 = 左侧单选圈 + 彩色圆形图标 + 白色标题 + 蓝色可点副行（Everyone「exclude people ›」、Contacts「exclude people ›」、Close Friends ✓「15 contacts ›」、Selected Contacts「edit list ›」）；组脚「Select people（蓝）who will never see any of your stories.」；第二组开关「Allow Screenshots」「Post to My Page」（开）+ 组脚「Keep this story on your profile even after it expires in 24 hours. Privacy settings will apply.」；底部通栏蓝色「Post Story」。下载「Stories Posted to the Profile」录屏（1080×1080、60fps、8s）按 10fps 细看：0.8–1.4s 圆形头像在上滚时逐渐模糊变暗并缩进屏幕顶部的灵动岛，1.4–1.6s 姓名「Paul du Rove ✓」与「last seen just now」上移缩小进顶栏中部，操作行压扁；7.3–7.8s 回滚时反向展开，头像从灵动岛里重新长出。',
 brief='每个隐私选项一行 + 一条蓝色可点副行（排除谁 / 15 位 / 编辑名单）；资料页头上滚时头像缩进灵动岛、姓名进顶栏，回滚反向。',
 method='选项与它的细化入口写在同一行：标题是选择，蓝色副行是对这个选择的进一步编辑（排除的人数 / 名单），不另开一层；身份页头随滚动连续压缩，头像有明确的去处（灵动岛），回滚时从同一处长回。',
 affects='隐私与资料可见性（§9.11）：「微信号」可见范围单选，每项下一行可点的细化（「仅成局后的同局成员」）；S06 段落里可点短语 + 下一行展开；S01 / S03 身份区（称呼 48–56px）随滚动连续收进工具行（§4 页头规格），头像 / 首字圆有固定去处，回滚恢复。',
 avoid='Telegram 深色面板与彩色圆形图标、故事 / 截图禁止等 JU 没有的能力、灵动岛特效本身。',
 evidence=ev('telegram-stories-privacy','who-can-view-this-story-screen.jpg','profile-header-collapse-10fps.jpg'),
 motion_seen=True, award=None, inherited=False, concepts=['S06','S01','S03'], tags=['settings-screen','app-capture'], status='已看动效'),
]

E = 'settings-r2/research/evidence/'
def ev(slug, *names): return [f'{E}{slug}/{n}' for n in names]
CASES = [
dict(
 slug='motion-app-store-layout', name='Motion 官方示例「iOS App Store: Layout animation」——卡片原位长成整页、Esc 缩回原卡（animateLayout 共享元素）', creator='Matt Perry · Motion（motion.dev）', period='2025-02-27',
 cat='motion', url='https://motion.dev/examples/js-app-store-layout', url_viewed=['https://examples.motion.dev/js/app-store-layout'], viewed='2026-10-22（示例页内嵌 iframe，直接打开 examples.motion.dev 版，在 390×844 视口用 Playwright 录屏后按 20fps 抽帧）',
 what_seen='深色「Today」页两列图片卡（Photography「Capture the Night With These Camera Apps」、Architecture「Discover Hidden Gems in Historic City Centers」、Commute、Fitness）。点第一张（5.28s）：5.35–5.65s 卡片标题文字先在原卡内淡化重排，5.70s 卡片从左列原位扩展成通栏（图片高约 1/3 屏），标题移到图片左上并改为一行半，下方淡入两段正文；「Today」页头与其他卡同时压暗退后；约 400ms 完成。按 Esc（7.35s）：7.40–7.75s 通栏收窄回左列原位，正文先消失，右列与下排卡从暗处恢复，7.80s 起回到原网格，滚动位置不变。注：这是网页上模拟 iOS 的组件示例，不是 app 录屏。',
 brief='卡片原位长成整页（约 400ms），其余卡压暗退后；Esc 时整页收回到同一张卡、网格与滚动位置不变。',
 method='共享元素：入口卡与详情页是同一个对象，展开时位置与尺寸连续变化、标题随之移位，其他内容压暗而不离场；返回时沿原路径收回到原卡，周围网格恢复，用户回到原来的阅读位置。',
 affects='S04 海报拼块的签名转场「块原位长成整页（块色成为页面底色，块标题移到页头位置）」；返回时块缩回原位、其余块从暗处恢复；§8「从某个设置入口进入详情，再回到同一个入口与滚动位置」。',
 avoid='深色照片卡与 App Store 编辑内容外观；把每个设置项都做成可展开大卡。',
 evidence=ev('motion-app-store-layout','card-to-page-and-back-20fps.jpg','opened-state-390.jpg'),
 motion_seen=True, award=None, inherited='motion-app-store-layout（上一轮 REF27；本轮重新录屏抽帧）', concepts=['S04'], tags=['web-demo'], status='已看动效'),
dict(
 slug='motion-family-dialog', name='Motion 官方示例「Family-style dialog」——主按钮长成确认面板、取消时缩回按钮', creator='Motion（motion.dev），仿 Family 钱包的对话框', period='2025（示例页现行版）',
 cat='motion', url='https://motion.dev/examples/react-family-dialog', url_viewed=['https://examples.motion.dev/react/family-dialog'], viewed='2026-10-22（390×844 录屏，20fps 抽帧）',
 what_seen='深色底，底部一枚薄荷绿通栏胶囊「Receive」。点按（4.65s）：4.70–4.90s 一块深色圆角面板从按钮位置向上长出，按钮本身成为面板里的主按钮「Receive」，面板内容依次出现：「? Confirm」标题 + ✕、灰色说明「Are you sure you want to receive a load of money?」、两钮「Cancel」（深灰）/「Receive」（薄荷绿）；约 200ms 完成。点 Cancel（6.41s）：6.45–6.70s 面板向下收缩、内容淡出，最后收回成底部原来的「Receive」胶囊。再次打开并点面板里的 Receive（9.29s）：9.60–9.75s 面板同样收回成按钮。注：网页组件示例。',
 brief='主按钮长成确认面板（约 200ms），按钮成为面板的主按钮；取消 / 确认后面板收回成同一个按钮。',
 method='确认面板与触发它的按钮是同一个对象：从按钮长出、问一个问题、在原地给出两个选择，结束后缩回原按钮；面板不遮住整页，只占底部需要的高度。',
 affects='JU 主确认 CTA（≈280×48 JU 蓝，§4）在资料保存、退出登录、提交举报等确认场景：确认面板从 CTA 长出、取消时缩回 CTA（S03 墨面上的 CTA、S05 居中 CTA）；未保存返回确认（§8）的小面板从返回钮附近出现。',
 avoid='薄荷绿、钱包「收钱」语义、深色玻璃面板；把普通开关也做成二次确认。',
 evidence=ev('motion-family-dialog','button-to-sheet-cancel-confirm-20fps.jpg','sheet-open-390.jpg'),
 motion_seen=True, award=None, inherited='motion-family-dialog（上一轮 REF28；本轮重新录屏抽帧）', concepts=['S05','S03'], tags=['web-demo'], status='已看动效'),
dict(
 slug='emil-clip-path-theme-switch', name='Emil Kowalski「The Magic of Clip Path」——主题切换：深色副本自上而下用 clip-path 揭开', creator='Emil Kowalski（emilkowal.ski）', period='文章页现行版（2026-10 访问）',
 cat='motion', url='https://emilkowal.ski/ui/the-magic-of-clip-path', viewed='2026-10-22（390×844 录屏，20fps 抽帧）',
 what_seen='文章中的「Experience the theme switch animation yourself」示例：浅色卡片（标题、两段说明、黑色「Switch theme」按钮）+ 下方代码 `.clipPathReveal { clip-path: inset(0 0 100% 0); animation: revealClipPath 1s cubic-bezier(0.77, 0, 0.175, 1) forwards }`、`@keyframes revealClipPath { from { clip-path: inset(0 0 100% 0) } to { clip-path: inset(0 0 0 0) } }`。点「Switch theme」（5.96s）：6.10s 一条黑色边缘从卡片顶部出现，6.20–6.85s 深色版本（黑底白字、白色按钮）自上而下覆盖浅色版本，前约 300ms 很慢、中段加速、末段减速；文字在两种主题下始终清晰（是两份完整的副本，而不是颜色插值）。',
 brief='深色副本用 clip-path 自上而下揭开（约 1s，慢-快-慢）；文字全程清晰，因为是两份副本叠放。',
 method='主题切换不是全局颜色渐变，而是让「新主题的整页副本」沿一个方向揭开覆盖旧主题：有方向、有前沿，文字不在中间色里发灰；减少动态时可以直接切换。',
 affects='外观（§9.7）棉糖 / 光晕 / 落日的切换：S09 / S02 / S03 的大面积环境色光可沿一个方向揭开到新环境（如自下而上，像换一天里的时间），前景文字保持清晰；减少动态模式下改为瞬时切换；S07 预览区内的环境样张。',
 avoid='黑白主题本身、1 秒全页覆盖用于高频操作（外观切换低频才可用）、代码示例外观。',
 evidence=ev('emil-clip-path-theme-switch','clip-path-theme-reveal-20fps.jpg','before-after-390.jpg'),
 motion_seen=True, award=None, inherited='emil-clip-path-theme-switch（上一轮 REF33；本轮重新录屏抽帧）', concepts=['S09','S02','S03','S07'], tags=['web-demo'], status='已看动效'),
dict(
 slug='rauno-exclusion-tabs', name='Rauno Freiberg「Exclusion Tabs」——黑色胶囊滑过时，被覆盖的字母逐字反白', creator='Rauno Freiberg（rauno.me/craft）', period='2023-03',
 cat='motion', url='https://rauno.me/craft/exclusion-tabs', viewed='2026-10-22（1280×800 录屏，25fps 抽帧）',
 what_seen='浅灰圆角舞台中央一行标签「All Posts / Engineering / Community（黑色胶囊选中）/ Press / Changelog」，约 14px。点 All Posts（5.00s）：5.04–5.32s 黑色胶囊从 Community 经过 Engineering 滑到 All Posts（约 280ms，开始快、结尾慢），胶囊经过时与它重叠的字母逐字变白、离开后恢复黑色——例如 5.16s「Engin|eering」前半黑后半白、「All Po|sts」被胶囊盖住的部分已变白；终点胶囊尺寸随目标文字宽度变化。',
 brief='选中胶囊滑动约 280ms，经过的字母按重叠区域逐字反白，胶囊宽度随目标词变化。',
 method='当前态指示物是一个连续移动的实体，文字颜色由它与文字的几何重叠决定（而不是切换瞬间整词变色），因此移动过程中每一帧都可读；指示物的宽度跟随目标标签。',
 affects='S08 横向分栏顶部的栏名轨（当前 17px/600 + 指示物，横滑时指示物连续移动、经过的栏名逐字反白）；S02 竖栏当前项「与内容面相连的白色舌片」在纵向换页时连续滑动；外观三选一的选中块。',
 avoid='黑色胶囊外观照搬、英文标签、过小字号（JU 栏名 ≥15px）。',
 evidence=ev('rauno-exclusion-tabs','pill-slide-text-inversion-25fps.jpg','demo-page.jpg'),
 motion_seen=True, award=None, inherited='rauno-exclusion-tabs（上一轮 REF15；本轮重新录屏抽帧）', concepts=['S08','S02'], tags=['web-demo'], status='已看动效'),
]

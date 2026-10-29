# C06「字排」· 独立复核（快照 0f028c080d4b）

复核对象：主负责人冻结的快照 `/home/user/JU/.build/verify/C06/src/C06.dc.html`（sha256 前 12 位 `0f028c080d4b`，开工时与 14:39 容器重启后各核对一次，一致）。构建内嵌字体，输出 `/home/user/JU/.build/verify-C06.html`（C06 源 140 KB，索引 50）。没有读、也没有用 `my-r2/concepts/src/C06.dc.html`。最近邻 C10（源 sha `cf5fd1933c4e`）与 C02（源 sha `030937c059f3`）从 `my-r2/concepts/src/` 复制到 scratchpad 后构建，只用于对照截图。所有浏览器命令经 `my-r2/tools/slot.sh`；静态截图前用 `JU.shared.skins.pause(inst.envRef.current)` 暂停环境引擎。真实操作由我自写的驱动完成（scratchpad `vfy-c06/drv/vdrive.cjs`，基于 `tools/_lib.cjs`）：真实指针点击 / 拖拽 / 滚轮 / 键盘；运动用 CDP screencast 记录真实绘制帧（帧标签 `+Tms` 相对该段第一帧），每段录前记 1 分钟负载（`log.json` 的 `segs[].load1`）。证据目录 `my-r2/evidence/C06/verify/`。

## §1 视觉结论：视觉通过（附修改项，见 §2 中标「视觉」的 minor 条目）

先于功能检查写定。依据：三环境双角色首屏 `vg-skins.jpg`（`visual/v-j-home-{cotton,halo,sunset}.jpg`、`visual/v-h-home-*.jpg`）、滚到底 `visual/v-j-home-scrolled.jpg`、`v-h-home-scrolled.jpg`、详情 `vg-detail.jpg`、票根 / 改期 `vg-ticket.jpg`、管理 / 出席 `vg-manage.jpg`、`vg-manage2.jpg`、历史 `vg-history.jpg`、`vg-history2.jpg`、弹层 `vg-sheets.jpg`、`vg-sheets2.jpg`、空态与边界 `vg-empty.jpg`、`vg-single-long.jpg`、`vg-long-many.jpg`、减少动态 `vg-rm.jpg`、最近邻 `vg-nn-anon.jpg`、`vg-nn-deep.jpg`（匿名：A = C10、B = C06、C = C02）。

| 问题 | 判断 | 依据 |
|---|---|---|
| 1 主体形态与重心 | 成立。首屏上半是「先做这件」一段：12px 引语 + 红色截止 → 26px Noto Serif SC 600 局名 → 14px 时间 · 地点 → 13px 状态 → 倒计时细线 → 280×48 原 CTA（下面一条环境色光带）→ 文字弱动作；其余各项 21px 衬线局名 + 14/13px 两行，1px 墨线分隔，组名 12px + 右侧说明。重心明确，留白来自段落间距而不是空着。局主侧同构（「待你处理」→ 审核申请）。整体是左对齐的书页节奏，不是白底通用列表：字阶反差（26 / 21 / 14 / 13 / 12）和墨线撑住了结构 | `visual/v-j-home-cotton.jpg`、`v-h-home-cotton.jpg`、`v-j-home-scrolled.jpg`、`v-h-home-scrolled.jpg` |
| 2 中文可读 | 字阶少而清楚（实测页头 30px/500、先做这件 26px/600 衬线、各项 21px/600 衬线、时间地点 14px、状态 13px、组名 / 引语 12px；九个状态的最小字号都是 12px）。行宽 342。`long` 变体局名两行、地点单行省略，时间不换行。没有胶囊。问题（都是 minor）：① 名单里本人一行显示「你（你）」（CSS `::after` 给已经是「你」的名字再加「（你）」，源第 201 行）；② 「参加约定」的长句放在两栏 `.c06-line` 的右栏、右对齐，多行时左缘参差，难读；③ 画面内的范围说明脚注 `.c06-foot` 以 opacity .28 显示，实测对比 1.44:1，基本读不出（草稿摘要、已取消管理、历史）；④ 作废 / 未成行状态字 `#6F7486` 13px 对比 4.45:1，略低于 AA | `visual/v-detail-invited.jpg`、`v-detail-waitlist-queue.jpg`、`v-draft.jpg`、`v-manage-cancelled.jpg`、`log.json`（probes `type:*`） |
| 3 表面与光 | 一致：纸底 #FBFAF7 + 墨，环境色光只在顶部渐隐，三环境下前景都成立；页面本身无卡、无面、无影。唯一的第二道光是 CTA 下的全宽色光带（`.c06-ctaw::before`，按钮在场才出现）：读起来像按钮落在光里，是有意设计，是否保留请用户判断。票根 / 局卡 / 08 散场局卡带各自原件的影子，属于原件。没有噪点 / 堆渐变 / 玻璃模糊替代关系（返回键是 V27 原件的玻璃圆钮） | `vg-skins.jpg`、`crop-cta-band.jpg`、`vg-ticket.jpg` |
| 4 深层页同构 | 是同一构图生成：详情、票根、改期、候补、历史都是原地展开在列表里的段落（局名不动，原件以原尺寸插在段落中，四周留白，后面的项淡到 28% 让位）；管理 = 17px 衬线段落标题 + 文字行 + 文字动作；弹层 = 纸面升起的一段文字（26px 衬线标题 + 身份行 + 正文 + 两个文字动作或原 CTA）。没有退回「返回 + 标题 + 列表」默认面板 | `vg-detail.jpg`、`vg-manage.jpg`、`vg-manage2.jpg`、`vg-history.jpg`、`vg-sheets.jpg` |
| 5 减少动态静态 | 成立，与正常态同一画面。差异一处：减少动态下票根抓手圆点不画（正常态有），撕票入口仍有 CTA 与键盘 | `vg-rm.jpg` |
| 6 与最近邻 | 不看名字能分辨，灰度下也能：C10 居中轴 + 无衬线 + 32px 时间数字 + 胶囊切换；C02 人物首字圆领行 + 白卡；C06 左对齐衬线 + 墨线 + 文字式角色切换，无任何容器。深层页同样可分（C10 / C02 的申请人是白卡，C06 是文字行） | `vg-nn-anon.jpg`、`vg-nn-deep.jpg` |
| 7 固定物件 | 页头 30px/500 → 收拢 18px 居中（实测）；主 CTA 280×48 原构造（实测）；票根 258 宽，左右各 66px；局卡详情 212×265（中档）、弹层 296×370（大档）；出席记录行里是 R9 章，历史散场是 08 场景原件；周围空间足够 | `vg-ticket.jpg`、`vg-sheets2.jpg`、`vg-manage.jpg`、`vg-history.jpg` |

结论：**视觉通过**。构图命题（无容器纯文字版式、原地展开、原件如内页插图）在首页、深层页、空态、弹层与减少动态下都成立，和 C10 / C02 不看名字可分。要修的是中文排版细节（「你（你）」、右对齐长句、读不出的脚注、作废字对比）——都列在 §2。最终视觉验收由用户作出。

## §2 功能与动效发现

全部操作用真实指针点击 / 拖拽 / 滚轮 / 键盘完成（面板按钮也是真实点击；只在静态视觉截图时用索引跳转）。63 段 screencast 录制时 1 分钟负载 3.8–6.5（全部 < 8，无一段需重录），帧率 12–66 fps。复制成功路径在本机 http 源 + 剪贴板授权下验证（`file://` 一律拒绝写入，是环境限制）。

### 13 项操作结果

| # | 操作 | 结果 | 证据 |
|---|---|---|---|
| 1 | 滚动收拢 / 回滚；角色与分区记忆 | 成立。每 20px 实测 27.3 → 24.5 → 21.8 → 19.1 → 18px，中心 x 69 → 195，辅助行透明度 1 → .66 → .32 → 0；回滚恢复 30px。参加的 scrollTop 300 → 切到发起的（0）→ 草稿 → 切回参加的（当前，300）→ 再切发起的（草稿）。切换：旧列表一帧切掉，新列表从约 30% 透明度在 ~150ms 内显出，页头不动，无近空白帧；连点三次停在正确角色 | `op01/op01-scroll-down/sheet.jpg`、`op01/op01-role-joined-05x/sheet.jpg`、`op01/op01-section-history/sheet.jpg`、`op01/log.json` |
| 2 | 周六早午餐：阅读 → 确认 → 成局 → 出票 → 返回 | 阅读到末尾前「确认入局」禁用、点击无效；处理中 ~360ms → 「已确认 · 已成局」+「查看票根」。出票：点击后 446ms 进入 printing，出纸口与票位轮廓 +「票正在出纸。」先在，~1.04s 纸开始推出，~3.09s ready，「撕开票根」~3.16s 才出现（不提前）。返回有问题：见 M2、m1 | `op02/op02-print/sheet.jpg`、`op02/op02-1x-open-read/sheet.jpg`、`op02/log.json` |
| 3 | 公园慢跑 3K：拖撕 / 联系 / 复制 / 已加微信 / 键盘与按钮 | 拖 30% 回弹不写数据；拖 65% 渐进断口 → 副券下坠 → 联系层 → 「已加微信」；面板武装后复制：原件行「复制失败，请长按账号复制」+「重试」，无 toast；重试（http）真实写入 `nina.runs` →「✓ 已复制」；已加微信 → 「待赴约」；返回后该行移入「就快见面」。重置后 Enter（抓手有焦点框）与「撕开票根」按钮各撕一次都成立。问题见 M5、m5 | `op03/op03-drag-30/sheet.jpg`、`op03/op03-drag-65/sheet.jpg`、`op03/op03-key-enter/sheet.jpg`、`op03/vg-op03-states.jpg` |
| 4 | 周五 Livehouse：接受（新票撕）/ 重置后拒绝 | 新票带「原定 FRI 12.18 20:30」划线 +「时间已改」章；拖撕接受 → 直接「待赴约」（改期前已加微信）→ 返回移入「就快见面」。拒绝：确认层焦点在「再想想」→ 处理中 → 燃烧 B 原件（+1.29s 起燃，+4.98s 纸尽，+5.6s 票位收起成「票根已作废。」）→ 历史「拒绝改期 · 席位已释放」 | `op04/op04-decline-burn/sheet.jpg`、`op04/vg-op04-states.jpg` |
| 5 | 候补退出 / 撤回申请 / 主动退出 | 古着淘货点行直接到候补门口（顺位 L** 遮名）→ 退出候补 → 顺位 1 人 → 历史「已退出候补」；周末速写撤回 → 「已撤回」；外百老汇退出 → 燃烧 C（+0.75s → +4.84s，+5.6s 收起）→ 历史「已退出 · 主动退出」并有「退出 · 已告知局主」记录。三种事实在历史里各写各的 | `op05/op05-exit-burn/sheet.jpg`、`op05/vg-op05-a.jpg`、`op05/vg-op05-b.jpg` |
| 6 | 东村小酒馆审核 | 「正在发出…」一帧内出现；+517ms 同一帧里：原位结果行「已发出邀请 · 等对方确认」、行状态「1 份申请待审 · 预留 2 · 空 1」、申请计数「1 份待审 · 已处理 1」、成员席位「预留 2」一起变；谢绝最后一份同一帧变成「申请都处理完了 · 2 份」且组名「待你处理 2 → 1」；完整局卡 296×370，关闭后焦点回到「查看局卡」；返回后该局移入「招募中」 | `op06/op06-approve/sheet.jpg`、`op06/log.json`（approve-frames / reject-frames） |
| 7 | 自然酒小试改时间 → 阳台烧烤答复 → 散场 → 出席 | 同时间：红字提示 + 确认禁用；选 20:30 → 预览「原定 … → 周三 12.23 · 20:30」→ 提交 → 行时间 20:30 +「原定 19:30」+「4 人未答复新时间」，toast「已改时间 · 等 4 位成员答复」，答复区 0/4；阳台烧烤答复区「已答复 2/3」逐人状态。记为散场（重置后）→ 四人：指针点出席，键盘 Tab/Enter 记未出席、待定；每次盖章后焦点到下一位的「出席」，scrollTop 恒为 821（不自动翻页）；更正保留「更正 未出席 → 出席 / 记录 未出席」轨迹；全部记完「都记好了 · 3/4 人到场」，历史「3/4 人到场」 | `op07/op07-att-1-present/sheet.jpg`、`op07/op07-resched-submit/sheet.jpg`、`op07/vg-op07-states.jpg`、`op07/log.json` |
| 8 | 德州扑克新手桌取消 | 确认层列出受影响的人（已确认 1 / 已预留 1 / 候补 2）+ 不可撤销行；武装失败 → 层内「本机保存失败，请重试」、按钮变「重试」；重试成功 → 历史「已取消 · 票根作废 · 联系已关闭」。取消效果缺失，见 M3 | `op08/vg-op08-states.jpg`、`op08/op08-cancel-retry/sheet.jpg`、`op08/vg-op08-hist.jpg` |
| 9 | 草稿删除 / 撤销 / 10 秒 / 空态 | 删中间一条 → 撤销条 →（撤销）原槽位恢复 → 再删 → 11s 后真正消失；删光 → 「没有草稿」空态。问题见 m6、m7 | `op09/op09-delete/sheet.jpg`、`op09/vg-op09-states.jpg` |
| 10 | 时钟 | 到最近到期：16:05 候补第 2 → 第 1 位；19:21 早午餐预留到期进历史「预留已到期 · 位置已补给他人」；20:02 局主侧 Leon「预留到期」入离开记录、候补 №1 西西获 6 小时预留；22:05 参加者侧古着淘货「候补轮到 · 已预留」成为先做这件。+24 小时：局主侧看展搭子「24 小时内仍可查看成员微信」→「联系方式已关闭」 | `op10/log.json`、`op10b/op10b/03-brunch-expired.jpg`、`op10c/vg-op10c.jpg` |
| 11 | 变体 / 宽度 / 115% / 键盘 / 安全区 | 七个变体两角色经面板真实切换都成立；360 / 430 无横向溢出、票根仍 258 宽；115% 不溢出；改时间键盘态输入框与确认在键盘之上；安全区页头让位刘海 | `op11/vg-variants.jpg`、`op11/vg-widths-zoom-kb.jpg` |
| 12 | 暂停与关键帧 | 不成立，见 M4 | `op12/vg-op12-a.jpg`、`op12/vg-op12-b.jpg`、`op12/log.json` |
| 13 | 系统减少动态下 2 / 3 / 6 / 7 | 成立：`rmSys` 真、`.app.rm`，四条流程终态完整（瞬印 → 撕 → 联系层 → 待赴约；审核完；出席 2/4），>1ms 动画 0 条；移组的行带 `is-landing` | `op13/op13/*.jpg`、`op13/log.json` |

另做了打断测试（任务书 §08 可打断）与补充入口：`op14/`、`op14b/`、`op15/`（放弃预留、历史三种、补充记录、名单复制、离开记录、草稿摘要）。

### 发现（按严重度）

**blocker**：无。

**M1 · major · 连续返回留下看不见的展开层，吞掉点击**
- 现象：从票根连按两次返回（间隔 90ms）后，导航已回到 home，但外百老汇的展开层 `.c06-x`（614px，opacity 1，pointer-events auto）仍在布局里，覆盖「手冲咖啡品鉴」「外百老汇」两行；画面看起来和正常返回完全一样，真实点「公园慢跑 3K」没有任何反应（`elementFromPoint` 命中 `div.c06-x`）。单次返回、或两次返回间隔 250ms 都正常。
- 复现：参加者首页滚动 300 → 点外百老汇 → 等 1.6s → 返回键连点两次（90ms）→ 点公园慢跑 3K。
- 证据：`op14b/log.json`（double-back-90-hits / -tap-run3k）、`op14b/vg-op14b.jpg`、`op14/log.json`。
- 修法：返回期间的第二次 back（或 `nav.phase==='exit'` 中的任何输入）要么忽略、要么立即结算当前收起；收起结束统一清掉展开态（`has-x` / `.c06-x`），离场层在动画期间加 `pointer-events:none`。

**M2 · major · 票根返回详情：约 300ms 没有任何可见反馈，然后剪切 + 1–2 帧空白**
- 现象：「阅读并确认 → 查看票根」后栈是 home > detail > ticket。在票根上按返回，exit 相位 300ms 内票面完全不动（只有抓手提示在跑），随后票根一帧消失、展开区留 1–2 帧空白纸，再淡入详情（局卡 + 同局的人），详情 CTA 到 +725ms 才出现。违反「点击后 ≤80ms 有可见反馈」与「不能先消失再出现无关矩形」。
- 复现：首页先做这件「阅读并确认」→ 滚到末尾 → 确认入局 → 查看票根 → 等出票完 → 返回。
- 证据：`op02/op02-1x-back/sheet.jpg`（f1–f24 不变、f25–f26 空白）、`op02/op02-05x-back/sheet.jpg`、`op02b/log.json`（first-back-timeline：0–293ms phase exit、票台 433px 不变）。
- 修法：成局后用 `replace` 把下层 detail 一起换掉（返回直接回首页收起），或给 ticket → detail 一个从 0ms 开始的原地交接（票面收起与详情内容同时进行），不要留空白帧。

**M3 · major · 局主取消没有取消效果，成功后结果不在视野内**
- 现象：重试成功后弹层收起，视口停在「取消这局」按钮所在的底部（scrollTop 1106），看到的只是名单行变成「取消前已确认 / 已取消 · 票根作废」、安排区只剩「再开一局」；「已取消 · 不能撤销，票根作废、联系关闭」的头部在屏幕外。没有任务书与简报要求的「局卡抽色 + 余烬」：`onEffect` 不处理 `cancelled`（源第 1043 行），CSS 里也没有对应规则；弹层收起后视口内不再有任何绘制帧。
- 复现：发起的 → 德州扑克新手桌 → 取消这局 → 面板「下一次写入失败」→ 确认取消 → 重试。
- 证据：`op08/vg-op08-states.jpg`（04-cancelled、05-cancelled-settled）、`op08/op08-cancel-retry/sheet.jpg`、`op08/log.json`（retry-timeline 的动画列表为空）。
- 修法：`cancelled` 到达时先把该局头部滚回视野，再在局名 / 局卡上做抽色与余烬，落定为「已取消」头部；这一步也是 M8「票件作废」的局主侧落点。

**M4 · major（评审能力）· 暂停与关键帧对 C06 的签名运动不起作用**
- 现象：0.5× 点开法拉盛早茶、+230ms 按「暂停」：展开没有停（700ms 内运行中的动画 10 → 1、scrollTop 891 → 969，画面继续滚到详情）。拖关键帧：0 是半展开态，25 / 50 / 75 / 100 都是收起的首页列表，不是「从该段起点到终点」；释放后落到正确的详情。运动结束后直接拖关键帧：0 / 50 / 100 三个位置都是同一张最终画面，没有自动重播最近核心动作。
- 证据：`op12/vg-op12-a.jpg`、`op12/vg-op12-b.jpg`、`op12/log.json`。
- 修法：原地展开的高度 / 滚动 tween 要读评审的 paused / scrub 状态（暂停时冻结，scrub 时按进度设位置），或改成带 `.scrub` 规则的 CSS 动画；`lastMotion` 登记的重播要能复现展开而不是重走导航。

**M5 · major（跳动部分需 GPU 真机复核）· 拖撕落定阶段：旧 CTA 残留、副券落在按钮与联系层上、整页跳动**
- 现象（两次拖撕都复现：公园慢跑 3K、Livehouse 新票）：撕开后「撕开票根 / 接受新时间」CTA 还在原位 0.5–1s，副券挂着、下坠时盖在这个按钮上；下坠末段出现 260–340ms 没有绘制帧，随后整页一下上跳 ~113px（局名移出视野），副券仍在下落并穿过刚淡入的联系层文字。键盘 Enter 路径：CTA 在 detach 时就撤掉、滚动是平滑的（+439 → +608ms），但联系层同样在副券还没落完时出现在它下面（原件是落完 300ms 后才显出）。
- 复现：点公园慢跑 3K → 等出票 → 从副券左侧向右拖 168px 松手。
- 证据：`op03/op03-drag-65/sheet.jpg`（f67 +1288 → f70 +1550 无帧、之后跳动）、`op04/op04-accept-tear/sheet.jpg`（f72 +1600 → f76 +1938）、`op03/op03-key-enter/sheet.jpg`。
- 环境区分：本机无 GPU、4 核共享、负载 5–6；无绘制的那 260–340ms 可能被环境放大，但「CTA 残留」「副券盖住按钮 / 联系层」在键盘与拖拽两条路径上都是确定的，与环境无关。
- 修法：detach（`tearCommit` 成功）当帧撤掉撕票 CTA；联系层等副券 `onDone` 再显出，或把联系层放到 220px 垂落区之外；滚到联系层用平滑滚动并避开下坠期。

**m1 · minor · 移组的行先消失 200–300ms 再在新位置淡入**
- 早午餐（op2 第二次返回）、公园慢跑（op3）、Livehouse（op4）都是：收起时该行从原位消失，200–300ms 内新位置是空的，然后淡入；`landKey` 始终为空，落定后没有持续的落点标记（减少动态下反而有 `is-landing`）。对象连续性弱于「从哪里来、向哪里去」的要求。证据：`op02b/op02-second-back/sheet.jpg`、`op02b/crop-brunch-gap-05x.jpg`、`op03/op03-back/sheet.jpg`。修法：让该行从原位置滑到新位置（源里已有冻结顺序的注释，第 825 行），落定后给 1s 落点标记。

**m2 · minor · 首页「阅读并确认」是两段运动，~0.75s 才停稳**
- 先原地展开详情（~400ms），再升起阅读层，+700–800ms 停稳；用户的目标是阅读层，中间那段详情展开显得绕。证据：`op02/op02-1x-open-read/sheet.jpg`。修法：从先做这件直接升起阅读层，下层详情不播展开。

**m3 · minor · 从首页先做这件「去不了了 → 确认退出」（放弃预留）没有结果反馈**
- 列表在遮罩后重排，早午餐直接消失，只剩计数「当前 8 → 7 / 历史 4 → 5」；没有「位置已释放」之类的落定句子或 toast。证据：`op14b/op14b-release-from-lead/sheet.jpg`、`op15/vg-op15.jpg`。

**m4 · minor · 原地展开时局名会移动**
- 点列表中部的行，整页滚动把该项带到顶部（局名上移约 140px），与命题「局名不动」不同；读感仍连续、~300ms 停稳。证据：`op03/op03-open/sheet.jpg`。

**m5 · minor · 键盘用户丢焦点**
- 键盘撕票后焦点离开 shadow root（`activeElement` 为空，共享层 10-29 说明会先停在票台）；出席「更正」后焦点同样丢失。证据：`op03/log.json`（geom-key）、`op07/log.json`（att-correct-open）。修法：撕后把焦点放到「复制」，更正后放到重开的「出席」。

**m6 · minor · 草稿撤销条倒计时不走**
- 删除 4 秒后仍显示「撤销 · 10s」，11 秒后才消失。证据：`op09/vg-op09-states.jpg`（04-deleted-4s）、`op09/log.json`。

**m7 · minor · 草稿删除的相邻补位是「跳 + 淡入」**
- 被删行淡出后槽位空 ~50ms，下一条直接出现在新位置再淡入，不是滑上来。证据：`op09/op09-delete/sheet.jpg`（f9–f11）。

**m8 · minor · 改时间提交：时间在遮罩后直接换字；toast 盖住页头标题**
- 「局卡时间重印」看不到过程，弹层收起时 20:30 已经在那；黑色 toast 与撤销条压在页头「我的局」上 2.6s。证据：`op07/op07-resched-submit/sheet.jpg`、`op04/op04-accept-tear/sheet.jpg`。

**m9 · minor（视觉）· 中文文案与排版细节**
- 「你（你）」「第 2 位（你） 你」：`.c06-line.you>b::after` 给本来就是「你」的名字再加「（你）」（源第 201 行）。
- 「参加约定」长句放在两栏右侧并右对齐，多行时左缘参差（`visual/v-detail-waitlist-queue.jpg`）。
- 重复信息：撤回后结果块与状态行重复「已撤回 / 申请已撤回」；候补门口 lede 重复状态行；候补轮到的倒计时提示与回执重复「请在 明天 04:05 前阅读并确认」；名单复制失败同时有「未能复制 · 重试」与「重试」两个入口；草稿摘要页头「删除草稿」与行内「删除」两个删除入口。
- 证据：`visual/v-detail-invited.jpg`、`op05/vg-op05-a.jpg`、`op05/vg-op05-b.jpg`、`op10c/vg-op10c.jpg`、`op15/vg-op15.jpg`。

**m10 · minor（视觉）· 对比度**
- 画面内的范围说明脚注 `.c06-foot`（opacity .28）对比 1.44:1，基本不可读——要么删掉（范围说明应在手机外），要么提到 ≥ 4.5:1；作废 / 未成行状态字 `#6F7486` 13px 为 4.45:1。证据：`visual/log.json`（probes `type:*`）。

**m11 · minor（视觉）· 草稿分区空态偏薄**
- 删光草稿后只有一行标题 + 一句说明 + 不可点「去开局」，下方大片空白；其它空态有分组骨架。证据：`op09/op09/07-drafts-empty.jpg`。

**m12 · minor · 减少动态下票根抓手圆点不画**
- 撕票仍可用 CTA 与键盘，但副券上少了「从这里撕」的提示。证据：`vg-rm.jpg`。

**附（非 C06 问题，记给共享层）**：已取消历史的「不计为未出席，也不影响成局信用。」来自 `my-r2/src/core/ju-ctl.js:713`（10-29 已去掉其它「信用」字样）；无头浏览器原生日期 / 时间控件显示为 en-US 格式（12/23/2026、07:30 PM），是环境 locale。

## §3 覆盖表（五栏分开）

只勾我亲自看过的。「入口存在」取自 coverage 工具（50/50，0 错误，0 不符）；「真实操作成功」= 我用真实输入走到并完成该状态的动作；「静态视觉已看」= 我 Read 过该状态的截图（标「跳转」的只看了索引跳转后的静态画面）；「正常速度动效已看」= 我看过该状态进入 / 变化的 1× 帧序列（段名即 `<op>/<段名>/sheet.jpg`）；「仍需用户验收」写具体项，其余一律是视觉最终验收。路径相对 `my-r2/evidence/C06/verify/`。

| # | 索引 | 状态 | 入口存在 | 真实操作成功 | 静态视觉已看 | 正常速度动效已看 | 仍需用户验收 |
|---|---|---|---|---|---|---|---|
| 1 | `j-home` | 当前（默认） | ✓ | ✓ op1 滚动 / 角色 / 分区 | ✓ visual/v-j-home-* | ✓ op01 scroll / role 1× + 0.5× | 三环境真机色光；CTA 下色光带取舍 |
| 2 | `j-history` | 历史 | ✓ | ✓ op1 分区点击 | ✓ visual/v-j-history | ✓ op01-section-history | 视觉最终验收 |
| 3 | `j-many` | 当前较多 | ✓ | ✓ op11 面板变体 + 角色点击 | ✓ op11/op11/v4-j | — | 长列表滚动手感 |
| 4 | `j-history-many` | 历史较多 | ✓ | ✓ op11 面板变体 + 历史点击 | ✓ op11/op11/v5-j | — | 视觉最终验收 |
| 5 | `j-d-pending` | 待审核 | ✓ | ✓ op5 周末速写 点开 | ✓ op05/op05/06-sketch-detail | — | 视觉最终验收 |
| 6 | `j-d-invited` | 已预留待确认 | ✓ | ✓ op2 先做这件 | ✓ visual/v-detail-invited, op02 帧 | ✓ op02-1x-open-read | 视觉最终验收 |
| 7 | `j-d-waitlist` | 候补等待 | ✓ | ✓ op5 古着淘货 门口 | ✓ op05/op05/02-vintage-door | — | 视觉最终验收 |
| 8 | `j-d-invitedq` | 候补轮到 | ✓ | ✓ op10c 时钟到 22:05 → 成为先做这件 | ✓ op10c/op10c/02-vintage-turn | — | 视觉最终验收 |
| 9 | `j-d-gathering` | 已确认待成局 | ✓ | ✓ op14 法拉盛早茶 点开 | ✓ visual/v-detail-gathering | ✓ op14-double-tap | 视觉最终验收 |
| 10 | `j-d-tear` | 已出票待撕 | ✓ | ✓ op3 拖撕 / 键盘 / 按钮 | ✓ op03/op03/01-ready | ✓ op03-drag-30 / -65 / key-enter | GPU 真机：拖撕落定时的整页跳动 |
| 11 | `j-d-contact` | 已撕票待联系 | ✓ | ✓ op3 联系层 / 复制失败 / 重试 | ✓ op03/vg-op03-states | ✓ op03-drag-65 | 视觉最终验收 |
| 12 | `j-d-going` | 已联系待赴约 | ✓ | ✓ op3 已加微信；op5 外百老汇 | ✓ op03/op03/06-contacted | ✓ op03-contacted | 视觉最终验收 |
| 13 | `j-d-reschedule` | 改期待答复 | ✓ | ✓ op4 接受（新票撕） | ✓ op04/op04/01-reply-ready | ✓ op04-accept-tear | 视觉最终验收 |
| 14 | `j-d-withdraw` | 撤回 / 退出确认 | ✓ | ✓ op4 / op5 四种确认层 | ✓ op04/op04/04-decline-sheet、op05/op05/03、07、10 | ✓ op04-decline-open | 视觉最终验收 |
| 15 | `j-d-ended` | 已散场 · 历史票根 | ✓ | ✓ op15 历史分区点开 | ✓ op15/op15/04-ended | ✓ op15-ended-open（SwiftShader 12fps） | 08 场景在 GPU 设备上的节奏 |
| 16 | `j-d-cancelled` | 局主取消 | ✓ | ✓ op15 首次真实打开（燃烧 C） | ✓ op15/op15/07-cancelled-after、08-cancelled-reopen | ✓ op15-cancelled-first-open | 视觉最终验收 |
| 17 | `j-d-rejected` | 审核未通过 | ✓ | ✓ op15 点开 | ✓ op15/op15/09-rejected | — | 视觉最终验收 |
| 18 | `j-d-queueleft` | 退出候补 | ✓ | ✓ op5 退出候补 | ✓ op05/op05/04-vintage-result | ✓ op05-leave-queue | 视觉最终验收 |
| 19 | `j-d-exited` | 主动退出 | ✓ | ✓ op5 外百老汇 退出 | ✓ op05/op05/12-theater-history | ✓ op05-exit-burn（燃烧 C） | 视觉最终验收 |
| 20 | `j-d-declined` | 拒绝改期 | ✓ | ✓ op4 拒绝 | ✓ op04/op04/06-history | ✓ op04-decline-burn（燃烧 B） | 视觉最终验收 |
| 21 | `j-d-expired` | 预留到期 | ✓ | ✓ op10b 时钟到 19:21 | ✓ op10b/op10b/03-brunch-expired | — | 视觉最终验收 |
| 22 | `j-d-released` | 放弃预留 | ✓ | ✓ op15 / op14b 先做这件「去不了了」→ 确认退出 | ✓ op15/op15/01-release-sheet、02、03 | ✓ op14b-release-from-lead | 结果反馈缺失（§2 m3） |
| 23 | `j-d-withdrawn` | 撤回申请 | ✓ | ✓ op5 撤回 | ✓ op05/op05/08-sketch-result | ✓ op05-withdraw | 视觉最终验收 |
| 24 | `j-d-absent` | 散场 · 未出席待核实 | ✓ | — | ✓ visual/v-hist-absent（跳转） | — | 默认数据无真实入口；只看了跳转静态 |
| 25 | `h-home` | 当前（默认） | ✓ | ✓ op1 / op6 | ✓ visual/v-h-home-* | ✓ op01-role-hosted | 三环境真机色光 |
| 26 | `h-drafts` | 草稿 | ✓ | ✓ op1 分区点击 | ✓ op01/op01/04-hosted-drafts | ✓ op01-section-drafts | 视觉最终验收 |
| 27 | `h-history` | 历史 | ✓ | ✓ op7 / op8 历史分区 | ✓ op07/op07/12-history、op08/op08/07-history | — | 视觉最终验收 |
| 28 | `h-pending` | 待处理较多 | ✓ | ✓ op11 面板变体 | ✓ op11/op11/v3-h | — | 视觉最终验收 |
| 29 | `h-history-many` | 历史较多 | ✓ | ✓ op11 面板变体 | ✓ op11/op11/v5-h | — | 视觉最终验收 |
| 30 | `h-drafts-many` | 只有草稿 | ✓ | ✓ op9 面板变体 | ✓ op09/op09/01-drafts | — | 视觉最终验收 |
| 31 | `h-m-review` | 申请审核 | ✓ | ✓ op6 通过一份 / 谢绝最后一份 | ✓ op06/op06/01-review、02、03 | ✓ op06-approve、op06-reject-last | 视觉最终验收 |
| 32 | `h-m-members` | 成员与席位 | ✓ | ✓ op6 / op15 | ✓ op06/op06/01-review、op15/op15/10-roster-copied | — | 视觉最终验收 |
| 33 | `h-m-waitlist` | 候补 | ✓ | ✓ op8 / op10c（顺位补位） | ✓ op08/op08/01-manage、op10c/op10c/03-h-cards | — | 视觉最终验收 |
| 34 | `h-m-contact` | 联系信息 | ✓ | ✓ op15 名单复制（http 真写入）+ 武装失败 | ✓ op15/op15/10、11 | — | 两个「重试」（§2） |
| 35 | `h-m-leaves` | 离开记录 | ✓ | ✓ op14b 展开 / op10c | ✓ op14b/op14b/leaves-open、op10c/op10c/03-h-cards | — | 视觉最终验收 |
| 36 | `h-m-reschedule` | 改时间 | ✓ | ✓ op7 同时间被拒 → 新时间 → 提交 | ✓ op07/op07/01-resched-same、02、03 | ✓ op07-resched-submit | 视觉最终验收 |
| 37 | `h-m-replies` | 改期答复 | ✓ | ✓ op7 自然酒 0/4、阳台烧烤 2/3 | ✓ op07/op07/04-bbq-replies | — | 视觉最终验收 |
| 38 | `h-m-cancel` | 取消这局 | ✓ | ✓ op8 武装失败 → 层内失败 → 重试 | ✓ op08/op08/02、03、04 | ✓ op08-cancel-fail、op08-cancel-retry | 取消效果缺失（§2 M3） |
| 39 | `h-m-end` | 记为散场 | ✓ | ✓ op7 记为散场 | ✓ op07/op07/05-end-sheet、06 | ✓ op07-end | 视觉最终验收 |
| 40 | `h-m-attendance` | 出席记录 | ✓ | ✓ op7 四人逐人（指针 + 键盘）+ 更正 | ✓ op07/op07/06–11 | ✓ op07-att-1-present、att-2-absent-kb、att-correct、att-last | 视觉最终验收 |
| 41 | `h-m-card` | 完整局卡 | ✓ | ✓ op6 查看局卡 / 关闭 | ✓ op06/op06/04-card | ✓ op06-card-open、op06-card-close | 视觉最终验收 |
| 42 | `h-m-cancelled` | 已取消的局 | ✓ | ✓ op8 取消后 + 历史点开 | ✓ op08/op08/04、05、08 | ✓ op08-cancel-retry | 视觉最终验收 |
| 43 | `h-draft` | 草稿摘要 | ✓ | ✓ op15 点开草稿 | ✓ op15/op15/13-draft-summary | ✓ op15-draft-open | 两个删除入口（§2） |
| 44 | `b-empty` | 完全空 | ✓ | ✓ op11 面板变体 | ✓ op11/op11/v0-j | — | 视觉最终验收 |
| 45 | `b-empty-h` | 完全空 · 局主 | ✓ | ✓ op11 面板变体 + 角色点击 | ✓ op11/op11/v0-h | — | 视觉最终验收 |
| 46 | `b-single` | 只有一场 | ✓ | ✓ op11 | ✓ op11/op11/v1-j | — | 视觉最终验收 |
| 47 | `b-single-h` | 只有一场 · 局主 | ✓ | ✓ op11 | ✓ op11/op11/v1-h | — | 视觉最终验收 |
| 48 | `b-drafts` | 只有草稿 | ✓ | ✓ op11 / op9 | ✓ op11/op11/v2-j | — | 视觉最终验收 |
| 49 | `b-long` | 长标题长地点 | ✓ | ✓ op11 | ✓ op11/op11/v6-j | — | 视觉最终验收 |
| 50 | `b-long-h` | 长标题 · 局主 | ✓ | ✓ op11 | ✓ op11/op11/v6-h | — | 视觉最终验收 |

## §4 工具结果（原始数字）

命令按简报（`LOCK="my-r2/tools/slot.sh timeout 900 env JU_STANDALONE=/home/user/JU/.build/verify-C06.html"`），15:25–15:32 依次运行；原始输出在各目录的 `log.json`。

| 工具 | 输出目录 | 结果 |
|---|---|---|
| coverage | `coverage/` | `{"states":50,"errors":0,"mismatches":0}`；接触表 `coverage/sheet.jpg`（50 个状态都渲染出 C06 的页面系统，无空白 / 崩坏状态） |
| widths | `widths/` | `{"shots":48,"overflow":[],"findings":[],"fontInvariance":[],"minFont":12,"api":{"zoom":"ok","safe":"ok"},"errors":0}` |
| kb-check | `kb/` | `{"shots":2,"findings":[],"errors":0}`；h-m-reschedule：日期 261–308、时间 347–394、确认底 528，键盘顶 544；j-d-ended 补充记录：输入框 335–458、提交底 528 |
| rm-check | `rm/` | `{"rmSys":true,"flowsOk":"11/11","findings":[],"errors":0}` |

这四个工具都走索引跳转，测不到真实导航路径上的问题：M1（连续返回留下的隐形层）、M2（票根返回详情的空白帧）、M3（取消后结果不在视野）、M4（暂停 / 关键帧）、M5（拖撕落定）都是工具全绿时我亲手操作发现的。

其它静态检查：快照源 142 919 字节（≤ 200 KB）；禁用词（扣分 / 信用分 / 处罚 / 等级 / 剩余次数）在快照源中各 0 处。

## 仍需用户验收

- 视觉最终验收（§1 是我的判断，不代替用户）：尤其 CTA 下全宽色光带是否保留、衬线局名的吸引力是否足够撑起「无容器」首页。
- 有 GPU 的真机上复核：M5 的整页跳动与 260–340ms 无绘制帧、出票准备时长（本机 printing 2.6–2.9s，原件 2.3s；点击到纸开始推出 ~1.04s，其中 ~0.45s 是本套等导航停稳、~0.6s 是原件准备，后者被 SwiftShader 拉长）、08 散场场景帧率（本机 12fps）。
- 三环境在真机上的色光（截图时环境引擎已暂停）。

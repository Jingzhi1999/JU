# C06「字排」· 独立复核（快照 0f028c080d4b）

复核对象：主负责人冻结的快照 `/home/user/JU/.build/verify/C06/src/C06.dc.html`（sha256 前 12 位 `0f028c080d4b`，开工时与 14:39 容器重启后各核对一次，一致）。构建内嵌字体，输出 `/home/user/JU/.build/verify-C06.html`（C06 源 140 KB，索引 50）。没有读、也没有用 `my-r2/concepts/src/C06.dc.html`。最近邻 C10（源 sha `cf5fd1933c4e`）与 C02（源 sha `030937c059f3`）从 `my-r2/concepts/src/` 复制到 scratchpad 后构建，只用于对照截图。所有浏览器命令经 `my-r2/tools/slot.sh`；静态截图前用 `JU.shared.skins.pause(inst.envRef.current)` 暂停环境引擎。真实操作由我自写的驱动完成（scratchpad `vfy-c06/drv/vdrive.cjs`，基于 `tools/_lib.cjs`）：真实指针点击 / 拖拽 / 滚轮 / 键盘；运动用 CDP screencast 记录真实绘制帧（帧标签 `+Tms` 相对该段第一帧），每段录前记 1 分钟负载（`log.json` 的 `segs[].load1`）。证据目录 `my-r2/evidence/C06/verify/`。

## §1 视觉结论：视觉通过（附修改项，见 §2 中标「视觉」的 minor 条目）

先于功能检查写定。依据：三环境双角色首屏 `vg-skins.jpg`（`visual/v-j-home-{cotton,halo,sunset}.png`、`visual/v-h-home-*.png`）、滚到底 `visual/v-j-home-scrolled.png`、`v-h-home-scrolled.png`、详情 `vg-detail.jpg`、票根 / 改期 `vg-ticket.jpg`、管理 / 出席 `vg-manage.jpg`、`vg-manage2.jpg`、历史 `vg-history.jpg`、`vg-history2.jpg`、弹层 `vg-sheets.jpg`、`vg-sheets2.jpg`、空态与边界 `vg-empty.jpg`、`vg-single-long.jpg`、`vg-long-many.jpg`、减少动态 `vg-rm.jpg`、最近邻 `vg-nn-anon.jpg`、`vg-nn-deep.jpg`（匿名：A = C10、B = C06、C = C02）。

| 问题 | 判断 | 依据 |
|---|---|---|
| 1 主体形态与重心 | 成立。首屏上半是「先做这件」一段：12px 引语 + 红色截止 → 26px Noto Serif SC 600 局名 → 14px 时间 · 地点 → 13px 状态 → 倒计时细线 → 280×48 原 CTA（下面一条环境色光带）→ 文字弱动作；其余各项 21px 衬线局名 + 14/13px 两行，1px 墨线分隔，组名 12px + 右侧说明。重心明确，留白来自段落间距而不是空着。局主侧同构（「待你处理」→ 审核申请）。整体是左对齐的书页节奏，不是白底通用列表：字阶反差（26 / 21 / 14 / 13 / 12）和墨线撑住了结构 | `visual/v-j-home-cotton.png`、`v-h-home-cotton.png`、`v-j-home-scrolled.png`、`v-h-home-scrolled.png` |
| 2 中文可读 | 字阶少而清楚（实测页头 30px/500、先做这件 26px/600 衬线、各项 21px/600 衬线、时间地点 14px、状态 13px、组名 / 引语 12px；九个状态的最小字号都是 12px）。行宽 342。`long` 变体局名两行、地点单行省略，时间不换行。没有胶囊。问题（都是 minor）：① 名单里本人一行显示「你（你）」（CSS `::after` 给已经是「你」的名字再加「（你）」，源第 201 行）；② 「参加约定」的长句放在两栏 `.c06-line` 的右栏、右对齐，多行时左缘参差，难读；③ 画面内的范围说明脚注 `.c06-foot` 以 opacity .28 显示，实测对比 1.44:1，基本读不出（草稿摘要、已取消管理、历史）；④ 作废 / 未成行状态字 `#6F7486` 13px 对比 4.45:1，略低于 AA | `visual/v-detail-invited.png`、`v-detail-waitlist-queue.png`、`v-draft.png`、`v-manage-cancelled.png`、`log.json`（probes `type:*`） |
| 3 表面与光 | 一致：纸底 #FBFAF7 + 墨，环境色光只在顶部渐隐，三环境下前景都成立；页面本身无卡、无面、无影。唯一的第二道光是 CTA 下的全宽色光带（`.c06-ctaw::before`，按钮在场才出现）：读起来像按钮落在光里，是有意设计，是否保留请用户判断。票根 / 局卡 / 08 散场局卡带各自原件的影子，属于原件。没有噪点 / 堆渐变 / 玻璃模糊替代关系（返回键是 V27 原件的玻璃圆钮） | `vg-skins.jpg`、`crop-cta-band.png`、`vg-ticket.jpg` |
| 4 深层页同构 | 是同一构图生成：详情、票根、改期、候补、历史都是原地展开在列表里的段落（局名不动，原件以原尺寸插在段落中，四周留白，后面的项淡到 28% 让位）；管理 = 17px 衬线段落标题 + 文字行 + 文字动作；弹层 = 纸面升起的一段文字（26px 衬线标题 + 身份行 + 正文 + 两个文字动作或原 CTA）。没有退回「返回 + 标题 + 列表」默认面板 | `vg-detail.jpg`、`vg-manage.jpg`、`vg-manage2.jpg`、`vg-history.jpg`、`vg-sheets.jpg` |
| 5 减少动态静态 | 成立，与正常态同一画面。差异一处：减少动态下票根抓手圆点不画（正常态有），撕票入口仍有 CTA 与键盘 | `vg-rm.jpg` |
| 6 与最近邻 | 不看名字能分辨，灰度下也能：C10 居中轴 + 无衬线 + 32px 时间数字 + 胶囊切换；C02 人物首字圆领行 + 白卡；C06 左对齐衬线 + 墨线 + 文字式角色切换，无任何容器。深层页同样可分（C10 / C02 的申请人是白卡，C06 是文字行） | `vg-nn-anon.jpg`、`vg-nn-deep.jpg` |
| 7 固定物件 | 页头 30px/500 → 收拢 18px 居中（实测）；主 CTA 280×48 原构造（实测）；票根 258 宽，左右各 66px；局卡详情 212×265（中档）、弹层 296×370（大档）；出席记录行里是 R9 章，历史散场是 08 场景原件；周围空间足够 | `vg-ticket.jpg`、`vg-sheets2.jpg`、`vg-manage.jpg`、`vg-history.jpg` |

结论：**视觉通过**。构图命题（无容器纯文字版式、原地展开、原件如内页插图）在首页、深层页、空态、弹层与减少动态下都成立，和 C10 / C02 不看名字可分。要修的是中文排版细节（「你（你）」、右对齐长句、读不出的脚注、作废字对比）——都列在 §2。最终视觉验收由用户作出。

## §2 功能与动效发现

（进行中）

## §3 覆盖表

（进行中）

## §4 工具结果

（进行中）

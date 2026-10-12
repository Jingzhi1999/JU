# C03 刊 · 修复第 1 轮（fix-r1）变更表

- 输入：`evidence/C03/review-2.md`（最新、权威：major 1–3 + minor 4–10 未关）、`spec/lead-review.md`（C03 高 / 中两行 + 「全部 · 管理页结构雷同」）。review-2 已确认修好的第 1 轮项目（出票前态、燃烧残片、券入夹页、拒绝改期新票、跨页中文主角、状态行断行、取消后倒计时）未重做。
- 构建：`JU_STANDALONE=/home/user/JU/.build/C03.html node src/build.js`（成功）。
- 覆盖：`tools/coverage.cjs C03 evidence/C03/fix-r1/coverage` → **50/50，errors 0**。
- 帧序列：`evidence/C03/fix-r1/<flow>/`（16 组，每组 `sheet.png` + `log.json`，errors 全空，sheet 全部逐张看过）。三个计算样式 / 滚动探针的输出在 `font-cascade/probe.txt`、`return-scroll/probe.txt`、`scroll-collapse/probe.txt`。
- 刷新：`evidence/C03/joined-home.png`、`hosted-home.png`、`detail.png`、`manage.png`、`result.png`（最终构建；result = 主动退出燃烧落定）。
- 规格：`spec/motion/C03.md`，改过的参数标【fix-r1】，文末新增 §6。

## 评审第 2 轮（review-2）

| 项 | 问题 | 改动 | 证据 |
|---|---|---|---|
| Major 3 | `.app button{font:inherit}`（0,1,1）压过 `.c03-issue` / `.c03-tab` 等单类规则：刊名掉回 Sans 400，未选中的刊 14px | 重置改成 `:where(.app) button` / `:where(.app) input`（特异度 0）。刊名 Serif 900 40px / 未选中 21px、分区 Serif 700 15px、来稿与名单宋体都按规格生效 | `fix-r1/font-cascade/sheet.png`（f01–f05）、`font-cascade/probe.txt`（`.c03-issue.on = Noto Serif SC 900 40px`，`fonts.check 900 = true`） |
| Major 1 | 减少动态下打开 / 返回闪出叠字或缺字的一帧（叶子仍走 1ms 的 3D + visibility 晚约 30ms） | `.rm` 下完全不走 3D：`openOver` / `closeOver` / `switchRole` 在 rm 时同一次渲染直接换页，不加 `turning` / `returning`；`.rm .c03-leaf{animation:none;transform:none}`；合上的目录页在 rm 下保持 visible、压在不透明跨页之下（z 1），不再切 visibility；`.rm .c03-shade{display:none}` | `fix-r1/rm-open-back/sheet.png`：5 局 × 打开 / 返回，每次点击后 5 / 30 / 55 / 80 / 380ms 逐帧（f02–f51）+ 身份切换 2 次（f52–f60），61 帧全部干净（review-2 的叠字是 rm-ghost f21、rm f02、rm-ghost2 f30） |
| Major 2 | 自然路径取消后焦痕残块留在局名下的时间地点行上；起火时局卡条压在吸顶局名下 | 局卡条加 `contain:paint`（`.c03-stk`），滤镜区域画不出条外；`cancelNow` 写入后若编辑部不在顶部，同一帧 `scrollTop = 0`（局卡条完整露出），360ms 后起火 | `fix-r1/cancel-natural/sheet.png`：从底部点「取消这局」→ f05 确认 → f06–f11 燃烧（条完整可见）→ f12 燃烧中用户下滑 140px → f16 回到顶部 → f17 再等 2.5s → f18 滚 5px：时间地点行始终清楚；f19 返回落在往期 · 已取消焦边封面（红书签）。`cancel-index/`（0.5×，索引路径）同样干净。对照实验（最终构建上临时去掉 `contain:paint` 跑同一路径）也干净：起火前回到顶部这一步去掉了成因（在吸顶页眉下起火），`contain:paint` 是防止滤镜区域再画出条外的保险 |
| Minor 4 | 目录收起停在 scrollTop≈40 时刊名与小标题都约 10%，错开叠成灰影 | 刊头 `opacity 1 − 2.5p`（原 1 − 1.7p，约 29px 已透明）；小标题本来就从 p ≥ .5（36px）才出现，所以两者不再同时可见 | `fix-r1/scroll-collapse/sheet.png` f02–f09（10/20/28/36/40/46/54/72px），f06 = 40px：只剩小标题 |
| Minor 5 | 返回时目录不恢复滚动（0 → 298） | `revealRow`：目录保持翻走时的滚动，只有条目换了分区、或其标题带被吸顶页眉（80px）/ 底栏（84px）挡住时才滚到中间 | `fix-r1/return-scroll/sheet.png` f00 → f15（0.5× 翻开再翻回，同一张构图 + 红书签）；f16–f18 条目在视口外时才滚进来；`return-scroll/probe.txt`（in view：0 → 0；视口外：→ 585） |
| Minor 6 | 长标题跨页找不到完整局名；编辑部收起后吸顶标题折两行 | 跨页：图版局名会超过 2 行时，在眉注下加一行完整局名（宋体 17px、balance）；编辑部：标题展开最多 3 行，滚到 ≥60px 后单行省略，少掉的行高以 margin-bottom 补回 | `fix-r1/long-title/sheet.png` f02–f03（livehouse 全文行）、f05（brunch，两行内不加）、f07–f09（编辑部 3 行 → 单行省略）；`scroll-collapse/probe.txt`（nextBlockTop 136 → 135，不跳） |
| Minor 7 | 身份翻刊落地后刊名还有 300ms 字号过渡 | 删掉 `.c03-issue` 的 font-size / color 过渡；新刊从翻页开始就以终态字号与该刊记忆的滚动渲染在下面 | `fix-r1/issue-flip/sheet.png` f03–f12、f14–f23：翻页结束（≈f06 / f17）后刊头不再变化 |
| Minor 8 | 退出燃烧中 / 写入中按「目录」：回到本期原位，没有书签，也没跟着去往期 | `closeOver` 在写入未落地时记 `_landAfter`；`act()` 落地后若页面已合上，`landLater` 切到条目的新分区、滚进视口、落 2s 红书签；往期封面加同样的红书签（`.c03-cvmk`）；页面已合上时不再空烧，票直接记为已烧毁态 | `fix-r1/exit-back-midwrite/sheet.png`：f02 确认退出 → f03 立刻按「目录」→ f04–f09 落在往期 · 未成行「外百老汇」封面并带红书签；f13–f21 燃烧到一半按「目录」同样落点 |
| Minor 9 | 结果页按钮写「查看退出结果」，撤回也这么写 | 所有结果页（撤回 / 退出 / 放弃预留 / 拒绝改期 / 已取消…）的行动条统一写「回到目录 · 往期」，左侧小字「本页完」 | `fix-r1/result-cta/sheet.png` f01–f05，f06 返回落在往期 |
| Minor 10a | 已取消局卡条残片只剩右上角一小块，像污渍 | S 变体几何改为火从右侧起、向左推进：`[334,96,205,0] [334,0,175,.15] [110,96,34,.5]`，残片在左侧（封面缩略 + 日期起头 + 地点残段），结果字移到右侧烧空处（`cap:'r'`） | `fix-r1/remnants/sheet.png` f01–f02，`cancel-index/` f19，`coverage/h-m-cancelled.png` |
| Minor 10b | 存档票根背面「有」字被镜像撕口切掉 | 背面内容上移（`justify-content:flex-start; padding-top:44px`） | `fix-r1/remnants/sheet.png` f04–f07、f09（存档背面「有 JU，就开局」完整） |
| Minor 10c | 图版状态标在待审核 / 候补 / 待全员确认时写「席位已预留」，像“我的位置已预留” | 状态标写局的状态「这局 · 仍可报名 / 席位已预留 / 已成局」，待审核一律「这局 · 仍可报名」（清单 A） | `fix-r1/remnants/sheet.png` f10–f12；`coverage/j-d-pending.png`、`j-d-waitlist.png` |
| 小项（顺带） | 局名在「 · 」处断行时，新行可能以「·」开头（长标题编辑部） | 分段符改为不换行空格 + 中点（` · `），行尾可以是「·」，行首不会 | `fix-r1/scroll-collapse/sheet.png` f13 |

## 主负责人复审（spec/lead-review.md）

| 行 | 复核结果 | 改动 | 证据 |
|---|---|---|---|
| C03 高 · 跨页页首大号英文 | **已修好（上一轮）**，当前构建仍成立：图版主角是中文局名 34px，英文是 13px 眉注 `SLOW BRUNCH No. 004`；完整局卡同理 | 无 | `fix-r1/lead-plate/sheet.png` f01–f04，`coverage/j-d-*.png` |
| C03 中 · lead 进度条 + 黑色整宽按钮 | 目录 lead **已修好（上一轮，目录式行动条）**；但跨页里仍是 3px 进度条 + 整宽黑按钮，仍可复现 | 跨页的主行动改成与目录 lead 同一条目录式行动条（墨线 + 红书签刻 + 倒计时或小字 + 引导点引信 + 宋体红字动词 →）；印制中 / 等待确认时整条转灰并写「印制中」/「等其他人」；状态行不再重复倒计时 | `fix-r1/detail-cta/sheet.png` f01–f11（已预留 / 候补轮到 / 待全员确认 / 印制中 → 撕开票根 / 待赴约 / 改期）；`detail.png` |
| 全部 · 管理页结构雷同 | 当前构建仍是「头像 + 名字 + 胶囊 + 留言 + 谢绝 / 发出邀请两个按钮」，可复现 | **申请审核 = 来稿夹 + 批注栏**：每份申请是一张别着回形针的稿纸（来稿 № / 申请于 / 宋体署名 + 认证签 / 留言写在红色横格上），页面右侧 86px 是编辑的批注栏（红竖线 + 引线）。审核动作就是批注：「发出邀请」是铅笔虚线圈里的红字，按下时红笔把圈画实（520ms），写入后圈里换成「采用」；「谢绝」带校对删除记号，按下时记号用红笔重描，写入后批注写「退稿」（删除线），稿纸转灰、留言被红色斜线划掉；稿纸底部 70px 红线 + 结果行。语义不变：申请人名、认证、留言、时间、谢绝 / 发出邀请、原位结果、待审计数 / 已处理、预留 / 空位、座位格。**名单 = 演职员表**：席号（席位格 + 两位数）+ 宋体人名 + 引导点 + 状态，第二行票态 / 倒计时 / 自报加微信，微信号叠在「复制」上；编辑部成员与席位、改期答复、参加者成员、候补已进名单都用它；出席行用席号替代头像圆片（红章、更正轨迹不变） | `fix-r1/manage-review/sheet.png`（0.5×：f03–f09 发出邀请 → 圈画实 → 采用，待审 2→1、预留 1→2、空 2→1、座位格弹起；f10–f15 谢绝 → 删除记号 → 退稿 + 划线，待审 1→0，头部「2 人已预留 · 等确认」；f16 返回落在「招募中」；f17–f21 待处理较多 6 份 + 失败条在稿纸内 + 重试成功）；`fix-r1/manage-lists/sheet.png`（f01 成员、f02 联系信息、f03 改期答复、f05–f07 出席 + 新鲜红章、f08 已取消、f09–f10 参加者成员）；`manage.png` |

## 保护项（未简化，回归已看）
- 3D 翻页（书签、叶背透印、下页扫动阴影、中途倒放）：`fix-r1/return-scroll/` f02–f14、`issue-flip/`。
- 印制三段走纸 + 上墨 + 套红：`fix-r1/regress-motions/` f01–f05。
- 撕券（跟手、纤维边、绕内角抬起、落进夹页、同一元素留在袋里，联系层落定后升起）：`regress-motions/` f05–f19。
- C 型退出燃烧、B 型拒绝改期卷边炭化：`regress-motions/` f20–f35。
- 红笔审核结果、出席红章与更正轨迹：`manage-review/`、`manage-lists/` f05–f07。

## 未改 / 说明
- review-2「备注」的 `cancel-half`（0.5× 下索引跳转后立刻确认无响应）：评审者自己判定为脚本时序问题、不计入；本轮 `cancel-index/`（0.5×）从索引打开取消层再确认，燃烧完整播放，无需改动。
- review-2 major 2 建议的「burnt 后用静态残片替换动画层」：`c03-burnt` 本来就是静态终半径渲染；根因是条外的滤镜残留，已用 `contain:paint` 收住，没有再加一套替换层。
- minor 4 建议的「小标题 p ≥ .5 才出现」：现有 `opacity: 2p − 1` 已满足，只改了刊头的退场速度。
- 候补（候稿）与撤稿记录仍是「№ + 名字 + 时间」的编号行：它们本来就是版面式的编号列表，不属于雷同的申请审核构图，本轮不动。

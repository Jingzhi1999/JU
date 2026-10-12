# C06 桌面 · 主负责人修复轮 r1 · 变更清单

依据：`spec/lead-review.md`（C06 两行 + 「全部」行）、`evidence/C06/review-2.md`（最新评审，5 major + 12 minor）。私有构建 `JU_STANDALONE=/home/user/JU/.build/C06.html node src/build.js`。
最终构建：`tools/coverage.cjs` **50/50 状态、0 错误**（`fix-r1/coverage/`）；`fix-r1/` 下 17 组 capture 的 log.json errors 全空；四个 DOM 探针 errors 全空。所有 sheet.png 都逐张看过。
参数改动已写进 `spec/motion/C06.md`（标 **[r1 改]** / **[r1 新]**）。

## 主负责人复审的行

| 发现 | 处理 | 证据 |
|---|---|---|
| 全部 · 中 · 申请审核十套结构雷同 | **重做构图和动作形式。** 构图：主页索引卡回形针下夹着的申请名片，在管理页发到夹板纸上成一叠。第一张待审的摆正放在最上面，其余压边、错开小角度（和桌面上「最急的摆正在最上」是同一条规则），整叠伸出纸边。名片本身：蓝墨名章写首字，右上角贴绿色验证封签（未验证是铅笔虚线框），留言是用胶带贴上去的黄纸条，`申请于 …` 用 mono。动作：两枚俯视看的橡皮章（木块 + 圆把手 + 标签上就是印面预览），`谢绝` 小、灰墨，`发出邀请` 大、朱红。按下时这枚章被拿起（放大、投影变远、三点步进），另一枚变暗不可点。写入成功后，用过的章移到盖章位压下、落墨后抬走，原位留下印迹 `已邀请` / `已谢绝` 和两行结果。通过的名片被回形针夹住（表示夹进名单）；谢绝的名片在自己的槽位里被推开一点并褪色。下一张待审的名片随之摆正。语义都保留：称呼、验证、留言、时间、谢绝 / 发出邀请、结果原位、各行不移位（槽位 `2:181, 171:181` 前后一致）、待审 −1 / 预留 +1 / 空位 −1、座位格盖一格、头部 status、分页签和组头计数、成员页新名片、无 toast、失败红条在该名片内且可重试。出席的三选一也换成同一套章（出席 / 未出席 / 待定），记录仍是圆形印记，更正轨迹不变。 | `fix-r1/review-approve/`（1× 每 90ms）· `fix-r1/review-deal/`（0.5× 从列表拿起 → 发牌）· `fix-r1/review-many/`（6 张、滚动折叠、失败 → 重试 → 成员页）· `fix-r1/review-rm/`（减少动态）· `fix-r1/review-double/probe-double.txt` · `fix-r1/att-stamps/` · `manage.png` |
| C06 · 中 · 详情顶部便签压住「我参加的 · 当前」与时间行 | **当前构建上已修好**（第 2 轮）：返回签单独落在木纹上，铭牌收起，身份签下沉淡出，拿起的物件从 y=80 开始，不压任何标签。本轮把背景退让再加深：`brightness(.58) blur(1.6px)` → `brightness(.52) saturate(.8) blur(2.6px)`，物件之间露出的桌面字已经读不出来（改期详情里新旧票之间那条缝原来能看到红字）。 | `fix-r1/lift-top/`（0.5× 拿起 / 放回 + j-d-pending / j-d-going / h-m-members）· `fix-r1/coverage/j-d-invited.png` `j-d-reschedule.png` · `detail.png` |
| C06 · 低 · 拍立得影像区是纯色渐变 | **当前构建上已修好**（第 1 / 2 轮）：影像区按 pack 画小图形（acid 网格 + 圆、mono 地平线 + 月等），加颗粒，只留 10px 编号，非 lead 降低饱和度。本轮没有改。 | `fix-r1/coverage/h-home.png` `j-history.png` `h-m-attendance.png` |

## review-2 的 major（最新评审；第 2 轮之后已修，本轮在当前构建上逐项复测）

| # | 复测结果 | 证据 |
|---|---|---|
| M1 放下时整屏上滚 24px | 已修：放下全程 `.app.scrollTop` 和文档 scrollTop 都是 0 | `fix-r1/setdown/probe-scroll.txt` + 帧序列 |
| M2 放下中点另一件被吞 | 已修：180ms 时点剧场票，之后 1.5s 一直是 `detail/theater/in` | `fix-r1/reopen/probe-reopen.txt` + 帧序列 |
| M3 燃烧尾段空档、幽灵轮廓 | 已修：残角就是同一张纸，灰堆随洞一起长，没有空白矩形或轮廓线；`.scrub` 能拖到残余 | `fix-r1/burn-exit/` `fix-r1/burn-cancel/` `fix-r1/burn-scrub/` |
| M4 结果块插入时一帧跳 66–137px | 已修：每帧最大位移 12–35px（16–24ms 一帧，是 460–480ms 缓动的一部分）；只有一次 45px，那一帧是 30ms 的掉帧 | `fix-r1/land-reflow/probe-land.txt`（两次运行） |
| M5 双击「发出邀请」出假失败 | 已修，并在新的橡皮章上重新验证：双击、重复谢绝、对已处理行再点，都没有 alert 和 toast | `fix-r1/review-double/probe-double.txt` |

## review-2 的 minor（复测）
已修（当前构建）：#1 管理页头不重复（`manage.png`）· #2 夹板滚动时卡片缩小 + 羽化（`review-many` f02–f04）· #3 旧时间只出现一次（`coverage/j-d-reschedule.png`）· #4 审核 / 撕票不出 toast（探针 toast 没有 `on`）· #5 失败文案与位置（`fail-retry/`：副券上的红标签带；「无法保存退出，请重试」留在确认纸条内 → 重试成功）· #6 `00:00:00` 条、散场翻面提示（`coverage/j-d-expired.png` `j-d-ended.png`）· #7 索引卡行格（`coverage/h-home.png`）· #8 撤回折叠没有双影（`withdraw/`）· #9 处理中按返回不留残影（`exit-back/`）· #10 撕票提示并入说明（`coverage/j-d-tear.png`）· #11 纸张上沿压住票下沿（`tear/`）· #12 360 宽（`w360/`：名片、章、出席章都放得下）。

## 本轮另外发现并修掉的
- **`flashFresh` 互相覆盖**：通过申请时同一帧要发两次落点标记（被盖章的名片 + 新座位），第二次读的是旧 state，把第一次覆盖了，所以第 1 / 2 轮里「已邀请」印章的落墨动画其实从来没播放过。现在改为函数式 setState。证据：`review-approve` f04–f06 能看到 ghost 章和落墨。
- 删掉审核旧版留下的无用 CSS（`.c06-rs` `.c06-ring` `.c06-cn .c06-vb`）。
- 结果行加了视觉隐藏的 ` · `，所以 DOM 文本仍是 `已发出邀请 · 等对方确认` / `已谢绝 · 对方会看到「这次没留住」`，评审脚本照旧能匹配。

## 没有做的（及理由）
- 成员页：仍是原来压边错角的名片叠。方向卡写的就是「名单 = 一张名片堆」，而且它承载复制微信 / 展开行，这一轮不想为了统一造型冒回归的风险；新成员只在这里墨色闪入。
- 分页签「申请 2」和组头「申请 · 2」重复计数：保留。清单 C2 要求组头写 `申请 · {待审数}`；分页签是本方案的导航，两者职责不同。
- 改期详情里新旧两张票之间约 6px 的缝：没有改票的 200px 偏移（燃烧目标和 `c06-pull2` 都依赖它）。改成加深桌面模糊，缝里只剩看不出字形的色块（`coverage/j-d-reschedule.png`）。
- 共享引擎 `declineReschedule` 不改 `you().status`：仍在本方案的渲染层处理，`src/core` 没有改。

## 保护项（没有回退）
便签改期（列表票上的「改为 周五 12.18 / 21:30」便签和接受流程，`resched/`）、出票信封滑到纸下（`reopen/` 后半）、撕票纤维缝 + 存根位（`tear/`）、烟灰缸残角（`burn-*`）、拿起放下 FLIP（`lift-top/`）、减少动态（`review-rm/`）都重新拍过，和第 2 轮一致。

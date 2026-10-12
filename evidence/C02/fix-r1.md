# C02 站牌 · 主负责人修复轮 r1 · 变更记录

依据：`spec/lead-review.md`（C02 两行 + 「全部 · 管理页结构雷同」）、`evidence/C02/review-2.md`（最新评审）。私有构建 `JU_STANDALONE=/home/user/JU/.build/C02.html node src/build.js`；`tools/coverage.cjs` → `fix-r1/coverage/`：**50/50 状态、0 错误**；本轮所有 `fix-r1/*/log.json` 的 errors 都为空；360 / 430 宽溢出探针 `fix-r1/widths/log.json`：无溢出。下面每条都是在当前构建上实际操作、抽帧并逐张看过 sheet 后写的。用户尚未审阅。

## 主负责人评审

| 行 | 结论 | 本轮改动 | 证据 |
|---|---|---|---|
| 全部 · 中 · 管理页（申请审核）结构雷同 | **已改** | 申请区重做成**到站板 ARRIVALS + 道岔拨杆**。<br>• 构图：区块头带待审数翻牌（2→1→0）；自带本局座位灯轨（审核意图下顶部那条灯轨不再重复出现）；列头条「申请于 · Time / 申请人 · Name / 状态 · Status」。<br>• 每位申请人是一行站牌：申请时刻 HH:MM 翻牌 · 称呼 · 状态翻牌（待审 → 已邀请 / 已谢绝）；字距行写「申请于 N 分钟前 · ●邮箱已验证 / ○未验证邮箱」；留言放进内凹显示窗。<br>• 动作：螺钉钢板上的两键夹一根拨杆（谢绝 ‹ · 拨杆 · 发出邀请 ›）。点键或拖球头，杆扳到该侧（±34°，过冲「咔」）；被按的键下沉、另一侧变暗；处理中扫光。<br>• 原地结果：两键退场、只留键槽；**杆停在扳到的一侧**，它指向的槽以翻片落下「已发出邀请」（绿）/「已谢绝」，盘下一行说明。状态翻牌、计数、头部状态、灯轨（新预留灯点亮、预留 / 空位数）同时变化，成员区新增预留行。<br>• 失败时杆弹回中立，出故障条 + 重试。<br>• 出席区三键装到同一种螺钉钢板上，每键带档位灯，管理盘的控件语汇因此统一。<br>• 语义全保留：称呼、认证、留言、申请时间、谢绝 / 发出邀请、原地结果、计数与席位变化，选择器 `data-rid` / `data-act="approve|reject|retry"` 不变，全部写入经 `JU.engine`。 | `fix-r1/lead-all-review-before-after-approve-reject.png`（左：旧版；右三张：新版初始 / 通过后 / 谢绝后）<br>`fix-r1/apps-approve-reject/`（从首页 lead「审核申请」进入，0.5×，返回后落在「招募中」）<br>`fix-r1/apps-lever-drag/`（小拖回弹，过阈值后通过 / 谢绝）<br>`fix-r1/apps-fail-retry-rapid/`（失败回弹 → 重试；三连击只写一次）<br>`fix-r1/apps-many/`（6 份申请）<br>`fix-r1/rm-apps/`<br>`fix-r1/arrivals-board-zoom-2x.png`<br>`fix-r1/attendance/`、`fix-r1/attendance-plate-before-after.png`<br>`fix-r1/widths/` |
| C02 · 高 · 列表局名单行截断 | **已在 fix-2 修好**（本轮复核） | 无代码改动。局名 ≤2 行再省略，只有地点省略（长标题变体里 lead 与行都是两行；详情牌头两行）。 | `fix-r1/r2-M3-lead-titles/`（h-home、b-long、b-long-h、j-d-going）<br>`fix-r1/coverage/j-home.png`、`b-long.png` |
| C02 · 中 · 焦斑像深棕圆块加白色气泡 | **fix-2 已改形；本轮再修一遍** | fix-2 已做：焦痕沿磁条与槽口横向铺开再分两股上舔；磁条断开、右半翘起；有裂缝；作废卡被顶出槽口。<br>本轮修剩下的「污渍感」：<br>• 焦纹噪声改为沿磁条方向拉长的横纹（`baseFrequency .16 → .045 .3`，透明度 .8 → .66），不再像颗粒泥斑<br>• 起泡从白色玻璃珠改为与焦区同族的琥珀褐通透鼓包 | `fix-r1/lead-C02-burn-residue-before-after-zoom.png`（3× 放大，左旧右新）<br>`fix-r1/r2-M4-lead-burn/`（局主取消 0.5× 全程，以及 exited / declined / 已取消三种残卡） |

## 评审 round 2 · Major（最新评审列为未修的 5 项）

这 5 项都已在 round 2 之后的修复轮（`evidence/C02/fix-2/`）改过。本轮在当前构建上重跑原场景确认，没有再改代码：

| # | 结论 | 证据 |
|---|---|---|
| M1 票面 / 联系层返回叠印 | 已修：卡、读卡器、联系条与牌面同时翻出淡去，列表下面没有可读文字叠在一起 | `fix-r1/r2-M1-contact-back/`（0.5×）、`fix-r1/r2-M1-M2-resched-accept/` |
| M2 落点行在底栏下 | 已修：换组后的落点行、索引进入后返回的落点行都完整落在底栏之上 | `fix-r1/r2-M2-land-nav/`（h-m-members、j-d-going 返回）、`fix-r1/r2-M1-M2-resched-accept/` 末段 |
| M3 局名单行截断 | 已修（同主负责人「高」行） | `fix-r1/r2-M3-lead-titles/` |
| M4 作废残骸像污渍 | 已修，本轮再修一遍（同主负责人「中」行） | `fix-r1/r2-M4-lead-burn/`、`fix-r1/lead-C02-burn-residue-before-after-zoom.png` |
| M5 草稿摘要丢左边距 | 已修：摘要标签与「继续编辑」都在 18px 侧距上，草稿行动作与标题左对齐 | `fix-r1/r2-M5-drafts-gutter/` |

## 评审 round 2 · Minor（抽查）

| # | 结论 | 证据 |
|---|---|---|
| m1 读取失败态 | 已有：翻牌「本机记录暂时读不出来」，点「重新读取」后恢复 | `fix-r1/r2-m1-read-failure/` |
| m3 复制 toast 盖牌头 | 已修：详情里复制后，读卡器显示屏改为「已复制微信号 · COPIED」 | `fix-r1/reg-tear/` 末帧 |
| m4 关键帧松手从 0% 重烧 | 已修：拖到 40% 松手后从 40% 续播 | `fix-r1/r2-m4-scrub-release/` |
| m5 从成员视图退出时卡没有入场 | 已修：卡先落进读卡器（READING），再过热 | `fix-r1/r2-m5-exit-from-members/` |
| m6 历史首次打开时边翻入边烧 / m12 散场票背面 | 已修：先读卡后点火；票根点一下翻到背面「JU. / 有 JU，就开局」 | `fix-r1/r2-m6-m12-history/` |
| m7 翻片里空格与标点各占一格 / m8 成员第二事实被截 / m9 盘头 meta 硬截 / m10 身份牌与主键同为实心琥珀 / m11 已取消局缺局卡条 | 已修 | `fix-r1/coverage/j-d-tear.png`、`h-m-members.png`、`j-home.png`、`h-m-cancelled.png` |

## 受保护的长处（回归）

- 翻牌数字：身份切换整板翻、行状态翻片、管理盘头部翻牌照旧，见 `fix-r1/reg-switch-open-back/`。
- 插卡 / 过闸：拖卡跟手，未过阈值回弹；打孔、圆片落入集屑窗、吐卡照旧，见 `fix-r1/reg-tear/`。
- 申请区的新拨杆沿用同一套钢面按键与翻片语汇，没有改动它们的参数。

## 未改 / 说明

- 改期答复区、候补、离开记录：这一轮只改了申请审核与出席这两个「审核动作」，这几块结构保持不变。它们是只读名单，没有需要表达方向的动作；成员区已是座位灯行。
- 拨杆拖拽只用无头浏览器鼠标模拟验证过，真机触控手感未验证。
- 规格同步：`spec/motion/C02.md` 中 M5（整节重写）、M9、焦纹 / 起泡参数、管理盘构图、验证材料都已更新，改动处标「〔r1 改〕」。
- 五张总览图已从修复后构建刷新：`joined-home.png`、`hosted-home.png`、`detail.png`（run3k 成员视图）、`manage.png`（到站板：一行已通过、一行待审）、`result.png`（局主取消后的作废残卡）。

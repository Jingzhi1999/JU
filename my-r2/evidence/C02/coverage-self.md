# C02 人先 · 覆盖表草稿（阶段 2，构建者自填）

只勾我自己亲眼看过 / 亲手点过的。✓ = 看过或做过；— = 没有单独做；「跳转」= 只经索引跳转到达、没有从首页真实点进去。证据都在 `my-r2/evidence/C02/stage2/`：`coverage/`（50 态接触表）、`rm/`（系统减少动态下 11 条流程终态）、`kb/`（键盘态）、`widths/` 与 `widths-deep/`（四宽 + 115% + 安全区），其余为正常速度帧序列（CDP 录屏，帧名带毫秒）与静帧。修正轮 A 的证据在 `stage2/roundA/`：`handover/`（按下 +40ms 静帧、详情 / 管理 / 票根的进入与返回、`home()` 一层与两层，帧名即距 pointerdown 的毫秒）、`copy/`（复制失败 + 重试、已加微信处理中）、`timeline.txt`（页面内逐帧采样）。

| 索引 | 状态 | 入口存在 | 真实操作成功 | 静态视觉已看 | 正常速度动效已看 | 仍需用户验收 |
|---|---|---|---|---|---|---|
| j-home | 参加者 · 当前 | ✓ | ✓ 点行进详情 / 票根、角色与分区切换、先做这件 CTA 直达阅读层 | ✓ s12/01 | ✓ roundA/handover detail-*、motion/M1 M2、extra2/list-to-read、extra/tap+back-mid-flight | 第一眼「人先」是否成立 |
| j-history | 参加者 · 历史 | ✓ | ✓ 点开被取消的那局（第一次真实打开才烧） | ✓ extra2/history-list | ✓ extra2/burn-cancelled | — |
| j-many | 当前较多（13 局） | ✓ | ✓ 滚到底再滚回 | ✓ motion/M3-* | ✓ M3（滚动驱动，逐位置截图） | 深处是否像通讯录（spec/motion/C02.md §三） |
| j-history-many | 历史较多 | ✓ | ✓ 滚到底再滚回 | ✓ extra/M3h-* | ✓ M3（逐位置截图） | — |
| j-d-pending | 待审核 | ✓ | ✓ 撤回报名 → 已撤回 | ✓ fail/disabled-cta | ✓ extra/withdraw | — |
| j-d-invited | 已预留待确认 | ✓ | ✓ 进入阅读层 → 读到底 → 确认 → 成局 → 查看票根；「下一次写入失败」→ 重试成功 | ✓ extra2/read | ✓ extra2/to-read、fail/confirm-* | — |
| j-d-waitlist | 候补等待 | ✓ | ✓ 查看候补（人物行）、退出候补（rm） | ✓ | — | — |
| j-d-invitedq | 候补轮到 | 跳转 | — | ✓ coverage | — | — |
| j-d-gathering | 已确认待成局 | ✓ | ✓ 进入 / 返回 / 入场途中返回 | ✓ s12/03 | ✓ extra/tap、back-mid-flight（打断） | 局卡只写「·」前的局名，全名在卡下 |
| j-d-tear | 已出票待撕 | ✓ | ✓ 拖过阈值撕下；拖一半放手回位且不写入（torn=false） | ✓ | ✓ roundA/handover ticket-*、print/、tear/、extra/half-drag | 无头 SwiftShader 下出纸前准备 ≈0.75s |
| j-d-contact | 已撕票待联系 | ✓ | ✓ 复制（http 真实剪贴板）、「下一次复制失败」→ 原件那一行（role=alert）+ 旁边的「重试」、已加微信（写入期间「处理中…」并锁住）→ 待赴约 | ✓ roundA/copy | ✓ tear/、fail/copy-* | — |
| j-d-going | 已联系待赴约 | ✓ | ✓ 去不了了 → 确认 → 燃烧 C → 查看退出结果 → 历史灰烬 | ✓ | ✓ burn/burnC、to-history | — |
| j-d-reschedule | 改期待答复 | ✓ | ✓ 接受（rm）、拒绝 → 燃烧 B | ✓ | ✓ burn/burnB | — |
| j-d-withdraw | 退出确认层 | ✓ | ✓ 确认 / Esc / 焦点回到触发 | ✓ | ✓ burn/confirm | — |
| j-d-ended | 散场 · 历史票根 | ✓ | ✓ 历史列表点开即为盖好章的 08 场景（settled，不重放）；局内记录层（键盘态） | ✓ s12/05、clock/10 | ✓ stamp/history-settled | 08 场景在无头环境由 SwiftShader 绘制 |
| j-d-cancelled | 局主取消 | ✓ | ✓ 第一次打开烧掉（取消），之后只剩灰烬、再开不重放 | ✓ extra2/cancelled-ashes | ✓ extra2/burn-cancelled、reopen-no-replay | — |
| j-d-rejected | 审核未通过 | 跳转 | — | ✓ coverage | — | — |
| j-d-queueleft | 退出候补 | ✓ | ✓（rm/waitlist-leave 之后） | ✓ | — | — |
| j-d-exited | 主动退出 | ✓ | ✓ 退出后 replace 到历史（灰烬、票位已收拢） | ✓ | ✓ burn/to-history | — |
| j-d-declined | 拒绝改期 | ✓ | ✓ | ✓ | ✓ burn/burnB | — |
| j-d-expired | 预留到期 | ✓ | ✓ 时钟「到最近到期」使早午餐预留到期，先做这件换卡 | ✓ clock/06-07 | 静帧序列（140ms → 1s） | — |
| j-d-released | 放弃预留 | 跳转 | — | ✓ coverage | — | — |
| j-d-withdrawn | 撤回申请 | ✓ | ✓（extra/withdraw 之后） | ✓ | — | — |
| j-d-absent | 散场 · 未出席待核实 | 跳转 | — | ✓ coverage | — | — |
| h-home | 局主 · 当前 | ✓ | ✓ 点先做这件卡进管理、返回落回卡上 | ✓ s12/02 | ✓ roundA/handover manage-*、path/ | — |
| h-drafts | 局主 · 草稿 | ✓ | ✓ 删掉唯一的草稿 → 空态 + 撤销条 | ✓ extra2/M11-* | ✓ extra2/M11-last-draft | — |
| h-history | 局主 · 历史 | ✓ | — | ✓ coverage | — | — |
| h-pending | 待处理较多 | ✓ | ✓ 滚动 | ✓ variants/ | — | — |
| h-history-many | 历史较多 | 跳转 | — | ✓ coverage | — | — |
| h-drafts-many | 只有草稿 | ✓ | ✓ 删第一个，下面两个补位，撤销回原槽位 | ✓ | ✓ motion/M10-* | — |
| h-m-review | 申请审核 | ✓ | ✓ 通过 / 谢绝 / 写入失败 → 知道了 → 再通过；两份都处理完 | ✓ s12/06、extra2/M11-all-handled | ✓ path/approve、fail/approve-* | — |
| h-m-members | 成员与席位 | ✓ | ✓ 取消层 / 局卡层：Tab 循环、Esc、焦点回触发 | ✓ env/ | ✓ motion/M6 | — |
| h-m-waitlist | 候补 | ✓ | ✓ 时钟：Leon 预留到期 → 西西补位（席位盖章、「预留到期 −1 · 候补补位 +1」） | ✓ clock/00-02 | 静帧序列 | — |
| h-m-contact | 联系信息 | ✓ | ✓ 复制成员微信 | ✓ extra/contact-copy | — | — |
| h-m-leaves | 离开记录 | ✓ | ✓ 展开 / 收起 | ✓ | ✓ extra/leaves-toggle | — |
| h-m-reschedule | 改时间 | ✓ | ✓ 同时间禁用 → 新时间 → 提交 → 答复区；键盘态 | ✓ kb/ | ✓ motion/M7 | 原生日期 / 时间框会把 Tab 分给内部分段（浏览器行为） |
| h-m-replies | 改期答复 | 跳转 | — | ✓ coverage | — | — |
| h-m-cancel | 取消这局 | ✓ | ✓ 确认取消 → 已取消（人逐个变灰） | ✓ | ✓ extra/cancel-drain | 抽色较轻（40px 圆 900ms 变灰） |
| h-m-end | 记为散场 | ✓ | ✓ | ✓ | ✓ stamp/end | — |
| h-m-attendance | 出席记录 | ✓ | ✓ 出席 / 未出席 / 更正为待定，章面逐人按下；最后一位记完 → 完成句；+24h 联系关闭 | ✓ s12/04、clock/08-09、extra2/M11-all-recorded | ✓ stamp/、extra2/M11-last-person | — |
| h-m-card | 完整局卡 | ✓ | ✓ 打开 / Esc / 焦点回「局卡」 | ✓ coverage、widths-deep | — | 局卡只写「·」前的局名 |
| h-m-cancelled | 已取消的局 | 跳转 | — | ✓ coverage | — | — |
| h-draft | 草稿摘要 | ✓ | ✓ 删除草稿 → 返回列表、撤销条在列表 | ✓ | ✓ extra/draft-delete | — |
| b-empty | 完全空 | 跳转 | — | ✓ s12/05b、variants/ | — | — |
| b-empty-h | 完全空 · 局主 | 跳转 | — | ✓ variants/ | — | — |
| b-single | 只有一场 | 跳转 | — | ✓ variants/ | — | — |
| b-single-h | 只有一场 · 局主 | 跳转 | — | ✓ variants/ | — | — |
| b-drafts | 只有草稿 | 跳转 | — | ✓ variants/ | — | — |
| b-long | 长标题长地点 | 跳转 | ✓ 点开详情（局卡写短名、卡下写全名与两行地点） | ✓ variants/ | — | — |
| b-long-h | 长标题 · 局主 | 跳转 | ✓ 点开管理 | ✓ variants/ | — | — |

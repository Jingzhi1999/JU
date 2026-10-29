# C03「双窗」· 覆盖表自评（阶段 2）

只勾我亲自看过的。证据路径相对 `my-r2/evidence/C03/stage2/`。「入口存在」= `coverage.cjs` 跳转到达且 `jumpKey` 一致（50/50，errors 0，mismatches 0），截图在 `coverage/<key>.png`，十行接触表逐张 Read。「真实操作成功」= 我用真实点击 / 拖动 / 键盘做过，数据层结果被断言或在截图里看到。「正常速度动效已看」：录屏 = CDP 截屏流（7–14 fps），只在 1 分钟负载 < 8 时录（`stage2/load-log.txt`）；逐步 = 真实时间下按节拍截图（不是慢放）。「仍需用户验收」写的是我自己判断不了、需要真人看的那一点。

| # | 状态 | 入口存在 | 真实操作成功 | 静态视觉已看 | 正常速度动效已看 | 仍需用户验收 |
|---|---|---|---|---|---|---|
| 1 | j-home 当前（默认） | ✓ | ✓ 进详情 / 返回；点把手、拖把手换角色；分区切换 | ✓ six、env×3、widths | ✓ 录屏 m4-detail、m1-role、m1-drag、m2-section、signature | 真机触摸下拖把手的跟手与甩的阈值 |
| 2 | j-history 历史 | ✓ | ✓ 切到历史；打开「深夜拉面」首次燃烧 | ✓ | ✓ 录屏 m2-section；逐步 burn-cancelled | — |
| 3 | j-many 当前较多 | ✓ | ✓ 滚到底再回顶 | ✓ widths×4 | ✓ 录屏 m3-scroll | 静止时下沿整块隐藏的那段空纸是否被读成「到底了」 |
| 4 | j-history-many 历史较多 | ✓ | — | ✓ | — | 长历史滚动（与 h-history-many 同一实现，未单独录） |
| 5 | j-d-pending 待审核 | ✓ | ✓ 打开撤回层（玻璃 + 墨色胶囊） | ✓ | — | — |
| 6 | j-d-invited 已预留待确认 | ✓ | ✓ 阅读并确认 → 成局 → 查看票根；打开放弃预留层；时钟到期 | ✓ six、env×3 | ✓ 逐步 clock-expire-j | — |
| 7 | j-d-waitlist 候补等待 | ✓ | ✓ 退出候补（rm 流程）；打开退出候补层；时钟顺位 2→1 | ✓ | ✓ 逐步 clock-wait-j | — |
| 8 | j-d-invitedq 候补轮到 | ✓ | — | ✓ | — | — |
| 9 | j-d-gathering 已确认待成局 | ✓ | — | ✓ | — | — |
| 10 | j-d-tear 已出票待撕 | ✓ | ✓ 打印 → 拖 70px 回弹 → 过半撕开 → 联系 → 复制（真实剪贴板）→ 已加微信；Enter 撕；写入失败副券复位 + 票脚一行「未能保存，请重新撕下副券」+ 重撕 | ✓ widths×4 | ✓ 逐步 tear、tear-key、fail-tear | 撕票在真机上的手感（原件） |
| 11 | j-d-contact 已撕票待联系 | ✓ | ✓ 复制 / 已加微信（撕票流程经过）；复制失败 → 重试 | ✓ | ✓ 逐步 tear、fail-copy | — |
| 12 | j-d-going 已联系待赴约 | ✓ | ✓ 去不了了 → 确认退出 → 燃烧 C；Tab 循环 / Esc 回到触发；换到我发起的后白窗第一行「正在看 · 票根」→ 点它回到票根 | ✓ | ✓ 录屏 m6-sheet；逐步 burn-exit、context | — |
| 13 | j-d-reschedule 改期待答复 | ✓ | ✓ 接受新时间（撕新副券）；去不了了 → 燃烧 B | ✓ | ✓ 录屏 m7-accept；逐步 burn-decline | 接受后联系层出现前约 2–3s 的等待（原件坠落 + 揭示） |
| 14 | j-d-withdraw 撤回 / 退出确认 | ✓ | — | ✓ | — | — |
| 15 | j-d-ended 已散场 · 历史票根 | ✓ | ✓ 打开 08 印记（settled 不重放）；+24h；局内记录：少于 4 字禁用 → 写入失败 → 重试 → 已受理 | ✓ | ✓ 逐步 stamp-history、clock-24h-j、fail-record | 08 印记场景 520px 高，下方事实需要滚动 |
| 16 | j-d-cancelled 局主取消 | ✓ | ✓ 首次打开在原票上烧一次 → 灰烬线；返回再开不重放 | ✓ six | ✓ 逐步 burn-cancelled | — |
| 17 | j-d-rejected 审核未通过 | ✓ | — | ✓ | — | — |
| 18 | j-d-queueleft 退出候补 | ✓ | ✓（仅减少动态下，rm 流程终态） | ✓ | — | — |
| 19 | j-d-exited 主动退出 | ✓ | ✓ 由 burn-exit 真实到达 | ✓ | ✓ 逐步 burn-exit | — |
| 20 | j-d-declined 拒绝改期 | ✓ | ✓ 由 burn-decline 真实到达 | ✓ | ✓ 逐步 burn-decline | — |
| 21 | j-d-expired 预留到期 | ✓ | ✓ 到最近到期 ×6 在原位变为「预留已到期」 | ✓ | ✓ 逐步 clock-expire-j | — |
| 22 | j-d-released 放弃预留 | ✓ | — | ✓ | — | — |
| 23 | j-d-withdrawn 撤回申请 | ✓ | — | ✓ | — | — |
| 24 | j-d-absent 散场 · 未出席待核实 | ✓ | — | ✓ | — | — |
| 25 | h-home 当前（默认） | ✓ | ✓ 审核申请 → 发出邀请 → 返回；换角色 | ✓ six、env×3、widths | ✓ 录屏 signature、m1-role | — |
| 26 | h-drafts 草稿 | ✓ | ✓ 删最后一份 → 空态 + 撤销；rm 流程删除 / 撤销 | ✓ | ✓ 逐步 last-draft | — |
| 27 | h-history 历史 | ✓ | — | ✓ | — | — |
| 28 | h-pending 待处理较多 | ✓ | — | ✓ widths×4 | — | — |
| 29 | h-history-many 历史较多 | ✓ | ✓ 滚到底再回顶 | ✓ | ✓ 录屏 m3-scroll-h | — |
| 30 | h-drafts-many 只有草稿 | ✓ | ✓ 删中间一份 → 邻行补位 → 撤销回原槽位 | ✓ | ✓ 逐步 draft | — |
| 31 | h-m-review 申请审核 | ✓ | ✓ 发出邀请 / 谢绝 → 计数、席位、页头 → 申请都处理完了；写入失败原位 → 知道了 → 重试 → 已发出邀请 | ✓ six | ✓ 录屏 m5-review、signature；逐步 fail-review | — |
| 32 | h-m-members 成员与席位 | ✓ | ✓ 查看局卡 → 关闭 | ✓ | ✓ 录屏 m6-card | — |
| 33 | h-m-waitlist 候补 | ✓ | ✓ 到最近到期 ×8：Leon 到期 → 西西补位 | ✓ | ✓ 逐步 clock-host | — |
| 34 | h-m-contact 联系信息 | ✓ | — | ✓ | — | — |
| 35 | h-m-leaves 离开记录 | ✓ | — | ✓ | — | — |
| 36 | h-m-reschedule 改时间 | ✓ | ✓ 同时间禁用 → 新时间 → 提交 → 答复区；键盘不遮输入与主动作 | ✓ kb | ✓ 录屏 m7-propose | — |
| 37 | h-m-replies 改期答复 | ✓ | — | ✓ | — | — |
| 38 | h-m-cancel 取消这局 | ✓ | ✓ Tab 循环、Esc 回到「取消这局」；rm 流程取消 → 燃烧 | ✓ | — | — |
| 39 | h-m-end 记为散场 | ✓ | ✓ 记为散场 → 逐人落章 → 焦点下一位 → 更正留轨迹 → 最后一位 | ✓ | ✓ 逐步 stamp-host | — |
| 40 | h-m-attendance 出席记录 | ✓ | ✓ +24h 联系关闭 | ✓ six、widths×4 | ✓ 逐步 clock-24h-h | — |
| 41 | h-m-card 完整局卡 | ✓ | ✓（经 h-m-members 打开） | ✓ | ✓ 录屏 m6-card | — |
| 42 | h-m-cancelled 已取消的局 | ✓ | — | ✓ | — | — |
| 43 | h-draft 草稿摘要 | ✓ | — | ✓ | — | — |
| 44 | b-empty 完全空 | ✓ | — | ✓ six、variant-empty | — | 虚线空局卡这一笔是否够「完整构图」 |
| 45 | b-empty-h 完全空 · 局主 | ✓ | — | ✓ variant-empty | — | 同上 |
| 46 | b-single 只有一场 | ✓ | — | ✓ variant-single | — | 「这一场走到哪了」五步是否多余 |
| 47 | b-single-h 只有一场 · 局主 | ✓ | — | ✓ variant-single | — | 同上 |
| 48 | b-drafts 只有草稿 | ✓ | — | ✓ variant-drafts | — | — |
| 49 | b-long 长标题长地点 | ✓ | — | ✓ widths×4 + 115% + 安全区、variant-long | — | — |
| 50 | b-long-h 长标题 · 局主 | ✓ | — | ✓ widths×4 + 115% + 安全区 | — | — |

# C04「叠层」· 覆盖自查（阶段 2）

五栏分开记，只勾自己看到的。入口存在 = `coverage.cjs` 跳到了这个状态并截了图（stage2/coverage/，50/50，errors 0，mismatches 0）。静态视觉已看 = 我看过覆盖接触表（参加者 24 + 局主 / 边界 26，两张合成图）或单独的定格。正常速度动效已看：「实时」是 CDP 录屏；「逐帧」是在 `--k=1` 正常时间线上 freeze / seek 取的帧。

| 状态 | 入口存在 | 真实操作成功 | 静态视觉已看 | 正常速度动效已看 | 仍需用户验收 |
|---|---|---|---|---|---|
| j-home · 当前（默认） | ✓ | ✓ 打开 Livehouse → 接受改期 → 返回、改槽（path/）；角色 / 分区切换（motion-a）；rm enter-back；时钟到期跳变（motion-b clk） | ✓ 接触表 | ✓ 实时录屏 328 帧（path/，负载 5.8–7.2）+ 逐帧 k=1（fixes/after-open / back） | 实时开页起步是否同步（见 motion/C04.md 的判断） |
| j-history · 历史 | ✓ | ✓ 打开作废的局 → 首次燃烧 → 压印（motion-b m8b） | ✓ 接触表 | ✓ 逐帧（motion-a m2-sec，motion-b m8b） | 整体观感 |
| j-many · 当前较多 | ✓ | ✓ 滚到收拢终点再回滚（motion-a m3-many） | ✓ 接触表 | ✓ 逐帧（motion-a m3-many） | 整体观感 |
| j-history-many · 历史较多 | ✓ | – | ✓ 接触表 | – | 整体观感 |
| j-d-pending · 待审核 | ✓ | – | ✓ 接触表 | – | 整体观感 |
| j-d-invited · 已预留待确认 | ✓ | ✓ rm read-confirm（阅读确认 → 成局出票） | ✓ 接触表 | – | 整体观感 |
| j-d-waitlist · 候补等待 | ✓ | ✓ rm waitlist-leave | ✓ 接触表 | – | 整体观感 |
| j-d-invitedq · 候补轮到 | ✓ | – | ✓ 接触表 | – | 整体观感 |
| j-d-gathering · 已确认待成局 | ✓ | – | ✓ 接触表 | – | 整体观感 |
| j-d-tear · 已出票待撕 | ✓ | ✓ rm tear-contact-copy；按钮撕（contact-exit t1） | ✓ 接触表 | ✓ 实时撕新票（path/ accept 段）；按钮撕定格（contact-exit t1） | 整体观感 |
| j-d-contact · 已撕票待联系 | ✓ | ✓ 复制失败 → 重试 → 已加微信（contact-exit c2–c5） | ✓ 接触表 | ✓ 联系层出现（path/ accept 段） | 整体观感 |
| j-d-going · 已联系待赴约 | ✓ | ✓ 去不了了 → 确认退出 → 燃烧 → 压印（contact-exit x1，motion-b m8a）；看局主微信（g1–g2） | ✓ 接触表 | ✓ 逐帧（motion-b m6-close，m8a 燃烧） | 「看局主微信」是阶段 2 新增的入口，请看它在页脚的分量 |
| j-d-reschedule · 改期待答复 | ✓ | ✓ rm reschedule-accept / decline；path 接受新票 | ✓ 接触表 | ✓ 实时（path/ 接受 → 撕新票 → 返回） | 整体观感 |
| j-d-withdraw · 撤回 / 退出确认 | ✓ | ✓ 同一确认层从 j-d-going 打开后确认 / 继续赴约（motion-b m6、m8a） | ✓ 接触表 | ✓ 逐帧（motion-a m6-open / close，Tab 循环） | 整体观感 |
| j-d-ended · 已散场 · 历史票根 | ✓ | – | ✓ 接触表 | – | 整体观感 |
| j-d-cancelled · 局主取消 | ✓ | – | ✓ 接触表 | – | 压印「已作废」改到 meta 下方（覆盖截图是改动之前的） |
| j-d-rejected · 审核未通过 | ✓ | – | ✓ 接触表 | – | 整体观感 |
| j-d-queueleft · 退出候补 | ✓ | – | ✓ 接触表 | – | 整体观感 |
| j-d-exited · 主动退出 | ✓ | – | ✓ 接触表 | – | 同上 |
| j-d-declined · 拒绝改期 | ✓ | – | ✓ 接触表 | – | 同上 |
| j-d-expired · 预留到期 | ✓ | – | ✓ 接触表 | – | 整体观感 |
| j-d-released · 放弃预留 | ✓ | – | ✓ 接触表 | – | 整体观感 |
| j-d-withdrawn · 撤回申请 | ✓ | – | ✓ 接触表 | – | 整体观感 |
| j-d-absent · 散场 · 未出席待核实 | ✓ | – | ✓ 接触表 | – | 整体观感 |
| h-home · 当前（默认） | ✓ | ✓ 角色切换（motion-a m1）；时钟到期（motion-b clk-2） | ✓ 接触表 | ✓ 逐帧 k=1（motion-a m1-role） | 整体观感 |
| h-drafts · 草稿 | ✓ | ✓ rm draft-delete-undo；删除 / 撤销（motion-a m10） | ✓ 接触表 | ✓ 逐帧（motion-a m10 抽出 / 放回） | 整体观感 |
| h-history · 历史 | ✓ | – | ✓ 接触表 | – | 整体观感 |
| h-pending · 待处理较多 | ✓ | – | ✓ 接触表 | – | 整体观感 |
| h-history-many · 历史较多 | ✓ | – | ✓ 接触表 | – | 整体观感 |
| h-drafts-many · 只有草稿 | ✓ | ✓ 删到最后一份 → 空态（motion-a m11） | ✓ 接触表 | ✓（motion-a m11） | 整体观感 |
| h-m-review · 申请审核 | ✓ | ✓ rm review-approve-reject；通过 / 谢绝（motion-a m5） | ✓ 接触表 | ✓（motion-a m5 处理中 → 写入） | 整体观感 |
| h-m-members · 成员与席位 | ✓ | ✓ 只做了滚动收拢（motion-a m3-manage），没有写入操作 | ✓ 接触表 | ✓（motion-a m3-manage） | 整体观感 |
| h-m-waitlist · 候补 | ✓ | – | ✓ 接触表 | – | 整体观感 |
| h-m-contact · 联系信息 | ✓ | – | ✓ 接触表 | – | 整体观感 |
| h-m-leaves · 离开记录 | ✓ | – | ✓ 接触表 | – | 整体观感 |
| h-m-reschedule · 改时间 | ✓ | ✓ rm reschedule-propose；改时间提交（motion-c m7） | ✓ 接触表 | ✓（motion-c m7 处理中 → 写入） | 整体观感 |
| h-m-replies · 改期答复 | ✓ | ✓ 经 M7 提交后到达「改期答复 0/4」（motion-c m7-4） | ✓ 接触表 | – | 整体观感 |
| h-m-cancel · 取消这局 | ✓ | ✓ rm cancel-burn；取消 → 成员纸褪色（motion-b m8c） | ✓ 接触表 | ✓（motion-b m8c 褪色） | 整体观感 |
| h-m-end · 记为散场 | ✓ | ✓ rm end-attend；记为散场 → 出席（motion-b m9-0） | ✓ 接触表 | ✓（motion-b m9-0） | 整体观感 |
| h-m-attendance · 出席记录 | ✓ | ✓ 逐人落章 + 更正（motion-b m9）；+24h 联系方式关闭（motion-b clk-4） | ✓ 接触表 | ✓（motion-b m9 落章 000 / 120 / 320 / 落定） | 整体观感 |
| h-m-card · 完整局卡 | ✓ | – | ✓ 接触表 | – | 整体观感 |
| h-m-cancelled · 已取消的局 | ✓ | – | ✓ 接触表 | – | 整体观感 |
| h-draft · 草稿摘要 | ✓ | – | ✓ 接触表 | – | 整体观感 |
| b-empty · 完全空 | ✓ | – | ✓ 接触表 | – | 整体观感 |
| b-empty-h · 完全空 · 局主 | ✓ | – | ✓ 接触表 | – | 整体观感 |
| b-single · 只有一场 | ✓ | – | ✓ 接触表 | – | 整体观感 |
| b-single-h · 只有一场 · 局主 | ✓ | – | ✓ 接触表 | – | 整体观感 |
| b-drafts · 只有草稿 | ✓ | – | ✓ 接触表 | – | 整体观感 |
| b-long · 长标题长地点 | ✓ | – | ✓ 接触表 | – | 整体观感 |
| b-long-h · 长标题 · 局主 | ✓ | – | ✓ 接触表 | – | 整体观感 |

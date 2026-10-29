# C08 色带 · 覆盖表草稿（阶段 2，构建者自填）

只勾我自己亲眼看过 / 亲手点过的。✓ = 看过或做过；— = 没有单独做；「跳转」= 只经索引跳转到达、没有从首页真实点进去。证据都在 `my-r2/evidence/C08/stage2/`：`coverage/`（终版构建 50 态接触表，覆盖工具 50/50、errors 0、mismatches 0）、`six/`、`env/`、`variants/`、`sizes/`、`keyboard/`、`operations/`、`clock/`、`m3/`、`widths/`、`kb/`、`reduced-motion/`、`contrast/`（终版构建重跑）、`before-after/`、`rituals/`（出票 / 撕票 / 燃烧 B·C·取消 / 落章：触发→展开→落定帧条），`fix1/`（修复轮：深层页环境露出实测、CTA 配色对比、各修复点截图），其余 `motion-*` 为正常速度帧序列（CDP 录屏，帧名带毫秒，`load.txt` 记开录时 1 分钟负载，全部 < 8）。

| 索引 | 状态 | 入口存在 | 真实操作成功 | 静态视觉已看 | 正常速度动效已看 | 仍需用户验收 |
|---|---|---|---|---|---|---|
| j-home | 参加者 · 当前 | ✓ | ✓ 点行进票根 / 点先做这件进详情、返回原位；角色与分区切换（记忆分区）；Tab / Enter 走到行并打开 | ✓ six/1、env/三环境 | ✓ motion-m4-enter-operate-return-ticket、motion-m1m2-role-section | 页头站在落日环境上的分量是否合适 |
| j-history | 参加者 · 历史 | ✓ | ✓ 点开被取消的那局（第一次真实打开才烧） | ✓ coverage | ✓ motion-m8-burn-cancel | — |
| j-many | 当前较多 | ✓ | ✓ 滚到底（hc=1）再滚回 | ✓ variants/many、m3/j-many-* | ✓ M3（滚动驱动，逐位置截图） | — |
| j-history-many | 历史较多 | ✓ | ✓ 滚到底（hc=1）再滚回 | ✓ variants/history、m3/j-history-many-* | ✓ M3（逐位置截图） | — |
| j-d-pending | 待审核 | ✓ | ✓ 撤回报名弹层开 / 关（Esc、焦点回到触发） | ✓ operations/8（禁用主动作） | ✓ motion-m6-layers | — |
| j-d-invited | 已预留待确认 | ✓ | ✓ 首页「阅读并确认」直接由带展开成阅读层（无详情垫层）→ 读到底 → 确认 → 成局结果由带组成（结果 + 局卡 + 成员带 + 约定纸）→ 查看票根（同一条带不动，内容先出后进）；「下一次写入失败」→ 重试成功 | ✓ six/3、operations/9–13 | ✓ 逐帧核对（展开，局卡在同色延续带上） | 局卡只写「·」前的局名，全名在头部面 |
| j-d-waitlist | 候补等待 | ✓ | ✓ 查看候补位置；到最近到期 → 第 2 位变第 1 位 | ✓ clock/jw-0、jw-1 | — | — |
| j-d-invitedq | 候补轮到 | 跳转 | — | ✓ coverage | — | — |
| j-d-gathering | 已确认待成局 | 跳转 | — | ✓ coverage（席位条在延续带上） | — | — |
| j-d-tear | 已出票待撕 | ✓ | ✓ 从首页点进：出票口 + 虚线票位 → 停稳后打印 → 撕开票根（按钮）→ 联系层；副券 Enter 撕 → 焦点落到「复制」 | ✓ keyboard/12–13、rituals/print、rituals/tear | ✓ motion-m4-enter-operate-return-ticket（含局名「回车」折行 / 打印 / 撕 / 联系 / 返回） | 打印 2.3s 是原件时长 |
| j-d-contact | 已撕票待联系 | ✓ | ✓「下一次复制失败」→ 原件那行提示 + 旁边重试 | ✓ operations/6–7 | — | — |
| j-d-going | 已联系待赴约 | ✓ | ✓ 从首页点进：联系层自动打开（共享层）；去不了了 → 确认退出 → 燃烧 C → 空舞台收起 → 查看退出结果 → 历史页用未成行的灰 | ✓ coverage | ✓ motion-m8-burn-exit | — |
| j-d-reschedule | 改期待答复 | ✓ | ✓ 带面写新开始时间（不再是集合时间）；「去不了了」只在页脚与「接受新时间」并排；接受（撕新副券 → 联系）；不接受 → 燃烧 B | ✓ coverage | ✓ motion-m7-reply、motion-m8-burn-decline | — |
| j-d-withdraw | 退出确认层 | ✓ | ✓ 留下（蓝 CTA）/ 确认退出（V27 危险构造） | ✓ coverage | ✓（同 burn-exit 前半） | — |
| j-d-ended | 散场 · 历史票根 | 跳转 | ✓ 局内记录弹层（键盘遮挡检查） | ✓ six/5（08 场景 settled，不重放） | — | — |
| j-d-cancelled | 局主取消 | ✓ | ✓ 第一次真实打开燃烧，之后褪色局卡 | ✓ coverage | ✓ motion-m8-burn-cancel | — |
| j-d-rejected | 审核未通过 | 跳转 | — | ✓ coverage（褪色局卡） | — | — |
| j-d-queueleft | 退出候补 | 跳转 | ✓（rm 流程：退出候补终态） | ✓ coverage、reduced-motion/f05 | — | — |
| j-d-exited | 主动退出 | ✓ | ✓ 燃烧后「查看退出结果」进入：未成行灰、面包屑「未成行」 | ✓ coverage | — | — |
| j-d-declined | 拒绝改期 | 跳转 | ✓ 历史页用未成行灰（不再是要你回应的红） | ✓ coverage | — | — |
| j-d-expired | 预留到期 | 跳转 | ✓ 时钟：周六早午餐预留到期移出「要你回应」 | ✓ coverage、clock | ✓ motion-m11-clock-expiry（下一件升为带首时带首与 CTA 一起淡入） | — |
| j-d-released | 放弃预留 | 跳转 | ✓ 只有一场时放弃预留（详情内 / 首页内） | ✓ coverage | ✓ motion-m11-empty、motion-m11-inplace-release | — |
| j-d-withdrawn | 撤回申请 | 跳转 | — | ✓ coverage | — | — |
| j-d-absent | 未出席待核实 | 跳转 | — | ✓ coverage（08 场景：未出席章） | — | — |
| h-home | 局主 · 当前 | ✓ | ✓ 点待你处理 → 管理 → 发出邀请 → 返回，计数原位落定 | ✓ six/2、env/三环境 | ✓ motion-m5-review | — |
| h-drafts | 草稿 | ✓ | ✓ 删除 → 收起 → 撤销回原位；再删 → 撤销窗口关闭后「没有草稿」才淡入（撤销条不再被推下） | ✓ coverage | ✓ motion-m10-drafts | — |
| h-history | 局主 · 历史 | ✓ | — | ✓ coverage | — | — |
| h-pending | 待处理较多 | ✓ | — | ✓ variants/pending | — | — |
| h-history-many | 历史较多 | ✓ | ✓ 尝试滚动：数据只有 4 场，一屏放下，无收拢 | ✓ m3/h-history-many-* | — | 数据量不足以收拢（记录，不改数据） |
| h-drafts-many | 只有草稿 | ✓ | ✓ 删除第一份 → 下面两份补位 → 撤销回到第一位 | ✓ coverage | ✓ motion-m10-drafts-fill | — |
| h-m-review | 申请审核 | ✓ | ✓ 通过 / 谢绝；处理中；「下一次写入失败」→ 知道了 → 重试成功 | ✓ six/6、operations/1–5 | ✓ motion-m5-review、motion-m11-last | — |
| h-m-members | 成员与席位 | 跳转 | — | ✓ coverage | — | — |
| h-m-waitlist | 候补 | 跳转 | ✓ 时钟：Leon 预留到期 → 西西顺位补位、离开记录 +1 | ✓ clock/hm-0、hm-7 | — | — |
| h-m-contact | 联系信息 | 跳转 | — | ✓ coverage | — | — |
| h-m-leaves | 离开记录 | 跳转 | — | ✓ coverage | — | — |
| h-m-reschedule | 改时间 | ✓ | ✓ 输入新日期时间 → 确认改时间 → 改期答复带；键盘遮挡检查 | ✓ keyboard/10–11、kb | ✓ motion-m7-propose | — |
| h-m-replies | 改期答复 | 跳转 | — | ✓ coverage | — | — |
| h-m-cancel | 取消这局 | 跳转 | ✓ 确认取消 → 头部面与成员 / 候补 / 答复带一起 700ms 抽成未成行色 | ✓ coverage、reduced-motion/f08 | ✓ motion-m8-cancel-drain | 取消在局主侧只有褪色，没有燃烧（燃烧在参加者第一次打开时） |
| h-m-end | 记为散场 | 跳转 | ✓（rm 流程：散场 → 出席 → 更正） | ✓ coverage、reduced-motion/f09 | — | — |
| h-m-attendance | 出席记录 | 跳转 | ✓ 出席 / 未出席 → stampFace 落章；滚到底时收拢走完（短页补透明尾部，不再停在半收拢重影）；+24h 联系关闭文案 | ✓ six/4、clock/h-att-* | ✓ motion-m9-attendance | — |
| h-m-card | 完整局卡 | 跳转 | — | ✓ coverage（JuCardV2 大档在带色顶上） | — | — |
| h-m-cancelled | 已取消的局 | 跳转 | — | ✓ coverage（各带已抽成未成行色） | — | — |
| h-draft | 草稿摘要 | 跳转 | — | ✓ coverage | — | — |
| b-empty | 完全空 | ✓ | — | ✓ variants/empty、six/5b | — | 零高带会不会被读成骨架屏（spec/motion/C08.md 末节） |
| b-empty-h | 完全空 · 局主 | ✓ | — | ✓ variants/empty-other-role | — | 同上 |
| b-single | 只有一场 | ✓ | ✓ 详情里放弃预留 → 返回落进零高带；首页里放弃预留 → 带原地收拢 | ✓ variants/single | ✓ motion-m11-empty、motion-m11-inplace-release | — |
| b-single-h | 只有一场 · 局主 | ✓ | ✓ 通过两份申请 → 返回：幽灵带停一拍收拢、下一条带上移 | ✓ variants/single-other-role | ✓ motion-m11-last | — |
| b-drafts | 只有草稿 | ✓ | — | ✓ variants/drafts | — | — |
| b-long | 长标题长地点 | ✓ | — | ✓ variants/long、widths（keep-all：不在词中间断行） | — | — |
| b-long-h | 长标题 · 局主 | ✓ | — | ✓ variants/long-other-role、widths | — | — |

# C07「下盘」· 覆盖表草稿（构建者自填，只勾我亲自看过的）

五栏分开：**入口存在**＝`coverage.cjs` 由索引跳到该态并截图（stage2/coverage，50/50，errors []，接触表逐段 Read）；**真实操作成功**＝我用真实点击 / 键盘 / 手势做过的操作且数据断言通过（括号里是证据目录：reduced-motion = rm-check 十一条真实点击流程；operations；motion-m*；clock；keyboard；six）；**静态视觉已看**＝我 Read 过该态截图；**正常速度动效已看**＝我 Read 过该态的 1× 截屏流帧序列（stage2/motion-* 与 flow-*）；**仍需用户验收**＝我认为需要人来判断的点（全部 50 条最终都需用户验收，这里只写具体疑点）。

| # | 索引 | 入口存在 | 真实操作成功 | 静态视觉已看 | 正常速度动效已看 | 仍需用户验收 |
|---|---|---|---|---|---|---|
| 1 | `j-home` 当前（默认） | ✓ | ✓ 盘里 阅读并确认 / 行进入返回 / 角色切换 / 去不了了（盘内确认） | ✓ | ✓ m1m2 · m4 · m6 | 盘高随内容滑动是否「呼吸」太多 |
| 2 | `j-history` 历史 | ✓ | ✓ 点散场的局进入历史 | ✓ | ✓ m9-history-settled | 是 |
| 3 | `j-many` 当前较多 | ✓ | ✓ 滚到底 / 回滚 | ✓ | ✓ m3 | 是 |
| 4 | `j-history-many` 历史较多 | ✓ | ✓ 滚到底；点一行进入再返回原位 | ✓ | ✓ m3 | 是 |
| 5 | `j-d-pending` 待审核 | ✓ | ✓ 撤回报名 → 确认层 → 结果（operations） | ✓ | ✓ m4（进入 / 返回） | 是 |
| 6 | `j-d-invited` 已预留待确认 | ✓ | ✓ 阅读 → 确认 → 成局 → 出票（rm-check + m8-print） | ✓ | ✓ m8-print | 打印引擎起步约 0.6–1.5s（无 GPU 环境），这段由出纸口 + 票位轮廓占位 |
| 7 | `j-d-waitlist` 候补等待 | ✓ | ✓ 退出候补（rm-check） | ✓ | — | 是 |
| 8 | `j-d-invitedq` 候补轮到 | ✓ | ✓ 读完 → 确认入局（operations） | ✓ | — | 是 |
| 9 | `j-d-gathering` 已确认待成局 | ✓ | — | ✓ | — | 控制器不给「已确认待成局」退出入口（secLabel 不含 gathering），只看了静态 |
| 10 | `j-d-tear` 已出票待撕 | ✓ | ✓ 手势撕票 → 联系 → 复制 → 已加微信（m8 / rm-check） | ✓ | ✓ m8-tear-contact | 是 |
| 11 | `j-d-contact` 已撕票待联系 | ✓ | ✓ 复制（http 剪贴板）→ 已加微信；复制失败 → 重试（operations） | ✓ | — | 是 |
| 12 | `j-d-going` 已联系待赴约 | ✓ | ✓ 去不了了 → 确认退出 → 燃烧（m8-burn-exit） | ✓ | ✓ m8-burn-exit · m6 | 是 |
| 13 | `j-d-reschedule` 改期待答复 | ✓ | ✓ 撕下副券=接受（m7）；拒绝 → 燃烧 B（rm-check） | ✓ | ✓ m7 | 是 |
| 14 | `j-d-withdraw` 撤回 / 退出确认 | ✓ | ✓ 同一确认层从「待赴约」票根进入：Tab 循环 / Esc 回到触发处（keyboard）、退出 → 燃烧（m8-burn-exit） | ✓ | ✓ m6（第二层墨色确认） | 是 |
| 15 | `j-d-ended` 已散场 · 历史票根 | ✓ | ✓ 局内记录弹层（kb-check） | ✓ | ✓ m9-history-settled | 小尺寸章面的可读性 |
| 16 | `j-d-cancelled` 局主取消 | ✓ | — | ✓ | — | 是 |
| 17 | `j-d-rejected` 审核未通过 | ✓ | — | ✓ | — | 无票的历史用局卡纸 + 事实章 |
| 18 | `j-d-queueleft` 退出候补 | ✓ | ✓ 同类事实由真实操作产生：候补「退出候补」→ 确认（reduced-motion · waitlist-leave） | ✓ | — | 是 |
| 19 | `j-d-exited` 主动退出 | ✓ | ✓ 同类事实由真实操作产生：待赴约「去不了了」→ 确认退出 → 燃烧（motion-m8-burn-exit） | ✓ | — | 是 |
| 20 | `j-d-declined` 拒绝改期 | ✓ | ✓ 同类事实由真实操作产生：改期票「去不了了」→ 确认 → 燃烧 B（reduced-motion · reschedule-decline） | ✓ | — | 是 |
| 21 | `j-d-expired` 预留到期 | ✓ | ✓ 同类事实由时钟产生：早午餐预留到期 → 历史归位（clock） | ✓ | — | 是 |
| 22 | `j-d-released` 放弃预留 | ✓ | ✓ 同类事实由真实操作产生：首屏「去不了了」→ 盘内确认 → 放弃预留（operations 末段） | ✓ | — | 是 |
| 23 | `j-d-withdrawn` 撤回申请 | ✓ | ✓ 同类事实由真实操作产生：待审核「撤回报名」→ 确认（operations） | ✓ | — | 是 |
| 24 | `j-d-absent` 散场 · 未出席待核实 | ✓ | — | ✓ | — | 是 |
| 25 | `h-home` 当前（默认） | ✓ | ✓ 盘里 审核申请 → 管理 → 返回原位 | ✓ | ✓ flow-enter-operate-return · m1m2 | 是 |
| 26 | `h-drafts` 草稿 | ✓ | ✓ 删除最后一份 → 撤销（m11 / rm-check） | ✓ | ✓ m11 | 是 |
| 27 | `h-history` 历史 | ✓ | — | ✓ | — | 是 |
| 28 | `h-pending` 待处理较多 | ✓ | ✓ 盘里 审核申请 → 管理（operations） | ✓ | — | 是 |
| 29 | `h-history-many` 历史较多 | ✓ | ✓ 点一行 → 管理（已散场 / 已取消）→ 返回（operations） | ✓ | — | 是 |
| 30 | `h-drafts-many` 只有草稿 | ✓ | ✓ 删除第 2 条 → 补位 → 撤销回原槽位（m10） | ✓ | ✓ m10 | 是 |
| 31 | `h-m-review` 申请审核 | ✓ | ✓ 邀请 / 谢绝；写入失败 → 重试（flow · operations） | ✓ | ✓ flow-enter-operate-return | 是 |
| 32 | `h-m-members` 成员与席位 | ✓ | ✓ 改时间 / 取消 / 散场 / 局卡 在盘内打开与关闭（m6 · m9） | ✓ | ✓ m6 · m9 | 表单类让盘长高到 49–57% |
| 33 | `h-m-waitlist` 候补 | ✓ | ✓ 时钟：Leon 预留到期 → 西西补位（clock） | ✓ | — | 是 |
| 34 | `h-m-contact` 联系信息 | ✓ | ✓ 名单里复制成员微信（operations） | ✓ | — | 是 |
| 35 | `h-m-leaves` 离开记录 | ✓ | ✓ 离开记录展开（operations） | ✓ | — | 是 |
| 36 | `h-m-reschedule` 改时间 | ✓ | ✓ 改日期 → 预览 → 确认改时间 → 名单到改期答复；键盘不遮挡（m7 · kb-check · rm-check） | ✓ | ✓ m7 | 是 |
| 37 | `h-m-replies` 改期答复 | ✓ | — | ✓ | — | 是 |
| 38 | `h-m-cancel` 取消这局 | ✓ | ✓ 确认取消 → 局卡在盘里燃烧 → 结果；写入失败 → 重试（m8 · operations） | ✓ | ✓ m8-burn-cancel | 6.6s 燃烧对局主是否太长（结果与返回在燃烧中已可用） |
| 39 | `h-m-end` 记为散场 | ✓ | ✓ 记为散场 → 出席台（rm-check · m9） | ✓ | ✓ m9 | 是 |
| 40 | `h-m-attendance` 出席记录 | ✓ | ✓ 逐人落章 → 焦点下一位；更正留轨迹；写入失败不落章；连点只记一次（six ④ · m9 · operations · keyboard） | ✓ | ✓ m9 | 名单里 44px 章面偏淡 |
| 41 | `h-m-card` 完整局卡 | ✓ | ✓ 局卡在盘内打开 / 关闭（m6） | ✓ | ✓ m6 | 是 |
| 42 | `h-m-cancelled` 已取消的局 | ✓ | — | ✓ | — | 是 |
| 43 | `h-draft` 草稿摘要 | ✓ | ✓ 删除草稿 → 回列表，盘里撤销（operations） | ✓ | — | 是 |
| 44 | `b-empty` 完全空 | ✓ | ✓ 「找局」为不可点的说明（operations） | ✓ | — | 空态：环境光一句 + 盘里三档图例 |
| 45 | `b-empty-h` 完全空 · 局主 | ✓ | — | ✓ | — | 同上 |
| 46 | `b-single` 只有一场 | ✓ | ✓ 盘里 阅读并确认 → 阅读层（operations） | ✓ | — | 单项：环境光一句 + 盘里那一件 |
| 47 | `b-single-h` 只有一场 · 局主 | ✓ | — | ✓ | — | 同上 |
| 48 | `b-drafts` 只有草稿 | ✓ | ✓ 盘里 接着改草稿 → 草稿分区（operations） | ✓ | — | 是 |
| 49 | `b-long` 长标题长地点 | ✓ | ✓ 盘里 阅读并确认（operations） | ✓ | — | 是 |
| 50 | `b-long-h` 长标题 · 局主 | ✓ | — | ✓ | — | 是 |

合计：入口 50/50 · 真实操作 40/50 · 静态视觉 50/50 · 正常速度动效 21/50。未做真实操作的条目只做了跳转与静态检查。

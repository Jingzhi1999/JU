# C05 大面 · 覆盖表草稿（阶段 2，构建者自填）

只勾我自己亲眼看过 / 亲手点过的。✓ = 看过或做过；— = 没有单独做；「跳转」= 只经索引跳转到达（或是数据变体的首页），没有从默认首页真实点进去。证据都在 `my-r2/evidence/C05/stage2/`：`checks/coverage/`（50 态接触表，索引跳转）、`entry/`（从首页真实点击进入 33 个状态后的落点）、`history/`（历史与草稿的三种面，dsf 2）、`sheets/`（全部弹层）、`shared/`（共享改动后的复验：复制失败一行、处理中、已撕票从首页进入、home 一层、弹层键盘焦点 / Esc / 回到触发元素）、`checks/rm/`（系统减少动态下 11 条流程终态）、`checks/kb/`、`checks/widths/`、`keyboard/`、`fail/`（写入失败 / 复制失败 / 禁用 / 处理中）、`clock/`、`six/`、`env/`、`variants/`、`widths/`，其余为正常速度帧序列（CDP 录屏，帧名带从真实 pointerdown 起算的毫秒；本机同时跑着其他构建，部分序列帧稀疏，关键时序另有页内逐帧探针 `fixes/after/*-probe.txt`）。

| 索引 | 状态 | 入口存在 | 真实操作成功 | 静态视觉已看 | 正常速度动效已看 | 仍需用户验收 |
|---|---|---|---|---|---|---|
| j-home | 参加者 · 当前 | ✓ 默认首页 | ✓ 点行进详情 / 票根 / 答复 / 候补（entry/）、角色与分区切换 | ✓ six/1、env/*-1 | ✓ fixes/after/3-signature、motion/m1-role | 面占首屏 62%，纸上只露 2–3 行（spec/motion/C05.md 设计判断） |
| j-history | 参加者 · 历史 | ✓ 分区「历史」 | ✓ 点最近一次散场的卡区 → 08 场景；点被取消的那局 → 第一次打开才烧 | ✓ history/1 | ✓ motion/m9-history-open、rituals/burn-history-first-open-C | — |
| j-many | 当前较多 | 跳转（变体） | ✓ 上拉到底再回滚，页头收到带、再展开 | ✓ variants/v-many-joined | ✓ motion/m3-scroll-many | 同 j-home |
| j-history-many | 历史较多 | 跳转（变体） | ✓ 从这里点开 6 个历史（entry/j-d-exited … j-d-absent）、滚到底再回滚 | ✓ coverage | ✓ motion/m3-scroll-history-many | — |
| j-d-pending | 待审核 | ✓ 行「周末速写」 | ✓ 撤回报名（玻璃 再想想 + 墨色胶囊）→ 已撤回 → 回到列表（home 一层，shared/5-6） | ✓ entry/、sheets/withdraw | ✓ motion/m4-home-one-level | — |
| j-d-invited | 已预留待确认 | ✓ 面上「这一场」 | ✓ 阅读并确认 → 成局 → 查看票根（rm/read-confirm）；放弃预留确认层（保留位置 = 主 CTA） | ✓ env/*-3、sheets/release | — | — |
| j-d-waitlist | 候补等待 | ✓ 行「古着淘货」 | ✓ 退出候补（rm）；时钟：候补第 2 → 第 1 位 | ✓ entry/、clock/3-4 | — | — |
| j-d-invitedq | 候补轮到 | 跳转 | — | ✓ coverage | — | — |
| j-d-gathering | 已确认待成局 | ✓ 行「法拉盛早茶」 | ✓ 进入 / 返回原行（落点色） | ✓ six/3 | ✓ fixes/after/3-signature | 局卡只写「·」前的局名，全名在卡下 |
| j-d-tear | 已出票待撕 | ✓ 行「公园慢跑 3K」 | ✓ 拖动撕下 / Enter 撕下（keyboard/kb-6）/ 按钮（rm） | ✓ entry/、widths/360-j-d-tear | ✓ fixes/after/2-ticket-entry（面先变灰、票槽在，然后打印）、rituals/print-tear-contact | 无头环境出纸前准备 0.75–2s（原件 + 机器负载） |
| j-d-contact | 已撕票待联系 | ✓ 行「手冲咖啡品鉴」（行的主动作：票根 + 联系层） | ✓ 复制（http 真实剪贴板）、复制失败只一行 role=alert + 旁边「再复制一次」、不弹 toast（shared/1、fail/5）、已加微信 → 处理中… → 待赴约（shared/2-3） | ✓ shared/4-torn-from-home-coffee | ✓ motion/m4-contact-row、rituals/print-tear-contact | — |
| j-d-going | 已联系待赴约 | ✓ 行「外百老汇小剧场」 | ✓ 返回原行；去不了了 → 确认 → 燃烧 C → 槽里压痕；键盘打开退出层 → Tab 在层内 → Esc → 焦点回到「去不了了」（shared/7） | ✓ shared/4-torn-from-home-theater | ✓ fixes/after/1-ticket-return（+ probe）、rituals/burn-exit-C | — |
| j-d-reschedule | 改期待答复 | ✓ 行「周四 Livehouse」 | ✓ 接受（rm）、去不了了 → 拒绝 → 燃烧 B | ✓ entry/ | ✓ rituals/burn-decline-B | — |
| j-d-withdraw | 退出确认层 | ✓ 待赴约 → 去不了了 | ✓ 确认退出；写入失败 → 重试（fail/3）；焦点落在「继续赴约」、Tab 在层内（keyboard/kb-3、kb-4） | ✓ sheets/exit | ✓ rituals/burn-exit-C | — |
| j-d-ended | 散场 · 历史票根 | ✓ 历史 → 行 / 面上卡区 | ✓ 08 场景 settled（不重放）、面板重播完整盖章；局内记录层（kb-check、sheets/record） | ✓ six/5a、env/*-4、history/4 | ✓ motion/m9-history-open、rituals/stamp-08-replay | DOM 局卡 → 08 场景的交叉在慢机器上要 0.5–2s |
| j-d-cancelled | 局主取消 | ✓ 历史 → 行 | ✓ 第一次真实打开：票坐在槽里 → 燃烧 C → 压痕；跳转直接是压痕 | ✓ history/6 | ✓ rituals/burn-history-first-open-C | 压痕的读法（「已作废」章 + 票面原文） |
| j-d-rejected | 审核未通过 | ✓ 历史 → 行 | — | ✓ history/8（褪色面 + 褪色卡） | — | — |
| j-d-queueleft | 退出候补 | ✓ 历史 → 行 | — | ✓ entry/ | — | — |
| j-d-exited | 主动退出 | ✓ 历史较多 → 行 | ✓ 第一次打开燃烧（entry/ 截在燃烧中） | ✓ history/7、coverage | — | — |
| j-d-declined | 拒绝改期 | ✓ 历史较多 → 行 | ✓ 第一次打开燃烧 B（entry/ 截在燃烧中） | ✓ entry/、coverage | — | — |
| j-d-expired | 预留到期 | ✓ 历史较多 → 行 | ✓ 时钟到期：早午餐进历史，面上换下一件（clock/7） | ✓ entry/ | — | — |
| j-d-released | 放弃预留 | ✓ 历史较多 → 行 | — | ✓ entry/ | — | — |
| j-d-withdrawn | 撤回申请 | ✓ 历史较多 → 行 | — | ✓ entry/ | — | — |
| j-d-absent | 散场 · 未出席待核实 | ✓ 历史较多 → 行 | ✓ 聚焦 08 画布按 ↓ 翻到以前的局（keyboard/kb-7） | ✓ history/5、coverage | — | 以前的局叠在卡右侧，最右一张被屏幕边裁掉 |
| h-home | 局主 · 当前 | ✓ 角色「我发起的」 | ✓ 面上 CTA → 审核 → 通过 → 返回；分区切换 | ✓ six/2、env/*-2 | ✓ path/review-1x、motion/m2-section、fixes/after/3-signature-hosted（+ probe） | — |
| h-drafts | 局主 · 草稿 | ✓ 分区「草稿」 | ✓ 删除 → 撤销（rm/draft-delete-undo）；撤销条贴在导航上方（fail/7） | ✓ history/3 | ✓ motion/m2-section | 虚线卡位的读法 |
| h-history | 局主 · 历史 | ✓ 分区「历史」 | — | ✓ history/2 | ✓ motion/m2-section | — |
| h-pending | 待处理较多 | 跳转（变体） | — | ✓ variants/v-pending-hosted | — | 同 j-home |
| h-history-many | 历史较多 | 跳转（变体） | ✓ 从这里点开已取消的局（entry/h-m-cancelled） | ✓ coverage | — | — |
| h-drafts-many | 只有草稿 / 草稿 3 | 跳转 | ✓ 删除 → 面上卡位换成下一份 → 原槽位撤销 | ✓ coverage | ✓ motion/m10-draft | — |
| h-m-review | 申请审核 | ✓ 首页 CTA「审核申请」 | ✓ 通过 / 谢绝（rm、path）、写入失败原位（fail/1）、处理中（fail/6）、最后一份（m11） | ✓ six/6a | ✓ path/review-1x、motion/m11-last-application | — |
| h-m-members | 成员与席位 | ✓ 行「自然酒小试」 | ✓ 局卡拿起 / 落回 | ✓ entry/ | ✓ motion/m6-card-sheet | — |
| h-m-waitlist | 候补 | ✓ 行「德州扑克新手桌」 | ✓ 时钟连续到期：Leon 预留到期 → 西西补位（clock/5-6） | ✓ entry/ | — | — |
| h-m-contact | 联系信息 | 跳转 | — | ✓ coverage | — | — |
| h-m-leaves | 离开记录 | 跳转 | — | ✓ coverage | — | — |
| h-m-reschedule | 改时间 | ✓ 管理页「改时间」键（看见，未从首页点到） | ✓ 同时间禁用（fail/4）→ 新时间 → 确认（rm、m7）；kb-check 无遮挡 | ✓ coverage | ✓ motion/m7-reschedule | — |
| h-m-replies | 改期答复 | ✓ 行「阳台烧烤」 | — | ✓ entry/（面上「改到 / 原定」） | — | — |
| h-m-cancel | 取消这局 | ✓ 德州扑克 → 取消这局 | ✓ 确认取消 → 面与卡原位抽色 1.1s（rm/cancel-burn）；键盘打开 → Tab 在层内 → Esc → 焦点回到「取消这局」 | ✓ sheets/cancel | ✓ motion/m8-host-cancel-drain | — |
| h-m-end | 记为散场 | ✓ 自然酒小试 → 记为散场 | ✓ 散场 → 出席 → 更正（rm/end-attend） | ✓ sheets/end | ✓ motion/m9-end-attend | — |
| h-m-attendance | 出席记录 | ✓ 行「看展搭子」 | ✓ 出席落章（stampFace）、Enter 记录后焦点到下一位（kb-5）、+24h 联系关闭（clock/8-9） | ✓ six/4 | ✓ rituals/stamp-attendance | — |
| h-m-card | 完整局卡 | ✓ 点面上的局卡 | ✓ 卡被拿起 296×370 / 落回 | ✓ sheets/card-lifted | ✓ motion/m6-card-sheet | — |
| h-m-cancelled | 已取消的局 | ✓ 历史较多 → 行 | — | ✓ history/9（褪色面 + 褪色卡） | ✓（m8 抽色的终点） | — |
| h-draft | 草稿摘要 | ✓ 草稿 → 行 | — | ✓ history/10（虚线卡位 + 还差什么） | — | — |
| b-empty | 完全空 | 跳转（变体） | — | ✓ six/5b、variants/v-empty-joined | — | 空卡位 + 一句话是否足够 |
| b-empty-h | 完全空 · 局主 | 跳转（变体） | — | ✓ variants/v-empty-hosted | — | 同上 |
| b-single | 只有一场 | 跳转（变体） | — | ✓ variants/v-single-joined | — | — |
| b-single-h | 只有一场 · 局主 | 跳转（变体） | — | ✓ variants/v-single-hosted | — | — |
| b-drafts | 只有草稿 | 跳转（变体） | — | ✓ variants/v-drafts-hosted | — | — |
| b-long | 长标题长地点 | 跳转（变体） | — | ✓ variants/v-long-joined、checks/widths（115%） | — | — |
| b-long-h | 长标题 · 局主 | 跳转（变体） | — | ✓ variants/v-long-hosted | — | — |

## 修复轮（10-29 复核第 1 轮 → 交第 2 轮；证据 `stage2/fix/`，录制负载 4–7，环境引擎暂停）
| 条目 | 改法 | 证据 |
|---|---|---|
| M-1 签名路径 / 角色切换经过空白帧 | 进入 / 返回 = 从那一行打开 / 收回的带子：两页始终是不透明整页、各占一部分屏幕，标题在带子里飞，卡与面色同一曲线；replace（查看票根）同；角色 / 分区 = 90ms 交叉淡化，新旧错开 28 / 22px | `m-enter-back`、`m-role-section`、`m-read-ticket` |
| M-2 面上起手不滚 | 面 / 卡上的竖向拖动与滚轮转给顶层页的纸（惯性续滚，拖过不触发点击）；面里不可点部分 `pointer-events:none` | `face-scroll/touch-swipe.txt`（首页 / 详情 / 管理 y160–420 起手均滚 ≈305px） |
| M-3 关键帧滑杆无效 | 转场全部 WAAPI，`_syncScrub` 写 currentTime；静止时拖滑杆 = 瞬间回到上一次转场的起点（不绘制）再播；倒计时条去掉宽度过渡 | `scrub`（0 / 35 / 70 / 100 四帧不同；回首页后 0 / 50 / 100 重播返回） |
| 规则 10 环境露出 | 色面改为半透明纱（参加者 30% / 局主 36% / 票根 66% / 褪色 60%），去掉光晕 / 落日的静态仿制渐变与高光；遮罩 .24；深层页收拢带 96px；拿起的局卡下移 28px | `env/count.json`、`env-steps/count.json`（59 态最低 11.0%）、`env-look`、`contrast`（213 项最低 5.31） |
| 新栈 home > read | 核对：阅读层直接在首页上；查看票根 replace；出票后返回一次即回首页，带子收回到早午餐的新行并补落点 | `m-read-ticket/log.json` info |
| V1 字阶 | 保留 42 / 22（阶段 1 定的单一主角），34 / 26 对照待主负责人定 | `v1` |
| V2 手机内范围说明 | 去掉；入口只留文字与禁用态，说明移到面板 notes | `checks/coverage/j-d-ended`、`h-draft` |
| V3 长标题拆词 | `word-break:keep-all`（面标题、局名、行标题、飞行标题） | `checks/widths/f23-w-390-b-long-h` |
| V4 未成行 / 已取消空纸 | 纸上「这一场」：原定 / 地点 / 局主 / 人数 + 当时的成员 | `checks/coverage/j-d-rejected`、`j-d-cancelled` |
| V5 12 小时制 | 原生控件保留（键盘 / 选择器），其上叠 24 小时中文显示「12月23日 周三」「19:30」 | `minor/v5-*`、`minor/minor.txt` |
| V6 身份行纯色块 | 方块写日与星期 | `checks/coverage/j-d-withdraw` |
| V7 草稿「--:--」 | 「未定」（32px） | `checks/coverage/h-draft` |
| F1 已加微信后「再复制一次」 | 绑定的是 `c.ticket.contact.copyFail`（控制器已随原件失败行清掉）：实测 retry 0 | `minor/f1-*` |
| F2 退出候补确认层一帧消失 | 关闭用前一帧副本：遮罩淡出 220ms、纸下落 64px | `f2-leave-queue` |
| F3 燃烧 B 副券压在纸边 | 副券只在真正撕下后才从纸边计算中减去；燃烧期间纸边让出 74px | `f3-burn-b` |
| F4 局主取消无余烬 | 抽色同时 18 粒余烬从卡下沿与两侧升起、冷却熄灭 | `f4-host-cancel` |
| F5 早午餐返回无落点 | 来源行已不在时落到这场在纸上的新行 + 落点色 | `m-read-ticket` |
| 共享修正 | `'fresh'` 与 `'printing'` 同样出票；撕开后焦点移到复制键；票台外的撕票失败行可见 | `tear/tear.txt`、`tear/tear-failed` |

### 修复轮 2（10-29 晚，证据 `stage2/fix2/`）
| 条目 | 改法 | 证据 |
|---|---|---|
| V1 字阶 | 按矩阵改为面内时间 34 / 局名 26（首页两角色、详情、候补、历史、草稿同一类；管理页的已确认数 60 不变）；三环境与 115%、360 宽复看：局名在「·」处折行，不拆词 | `env-look`、`checks/widths/f32–f39`、`f06–f07` |
| 飞行标题压字 | 标题的容器与新页同一条带子 clip，只在带子里飞；带子里被它经过的文字（按同一曲线每 1/40 采样的标题框判定）在它到之前隐去、过后再出现；返回时标题先消失、原行的字再出现 | `m-enter-back-1x`、`m-enter-back-05x`；逐帧检测 `overlap-1x.txt`、`overlap-05x.txt`（A–E 五段往返 × 两种速度：0 处） |

### 修复轮 3（复核第 2 轮 R2-1，证据 `stage2/fix3/`）
| 条目 | 改法 | 证据 |
|---|---|---|
| 角色 / 分区切换叠印 | 两拍：旧内容 75ms 退净，新内容随后从 20px 外落位；任何一帧不同时可见 | `paths-1x` f067–f118、`paths-05x` f091–f166 |
| 飞行局名压字 / 两份局名 | 带子里不切字：每行（和局卡）整行切换，带子容下它且标题不在上面时才出现；有标题在飞时离场的「这一场」与旧卡立即退场、返回时离场页的字立即清掉；标题只做 transform（与带子同在合成线程，不落后）；返回时标题落到行线上、最后一帧交给行；面到面（CTA → 管理）不飞标题 | `paths-1x` A f001–f033、B f035–f066、C f119–f150、D f151–f182；`paths-05x` 同段；`f5-brunch-1x/05x` |
| 「去不了了」对比度 | 面上次级动作改为面墨 600：棉糖 6.46 / 光晕 5.23 / 落日 5.43（复核同法渲染像素） | `contrast-r2/contrast.txt` |
| 局主首页副行剩「票」 | 副行 keep-all：360 / 115% 折成「…全员（含你）/ 确认后成局出票」 | `checks/widths/f01、f33` |

### 修复轮 4（复核第 3 轮 · 近空白，证据 `stage2/fix4/`）
| 条目 | 改法 | 证据 |
|---|---|---|
| 角色 / 分区切换近空白 | 同一帧换内容：新内容第一帧就满不透明、从 16px 外归位，旧内容同帧离开；只有面色淡变 | `paths-1x` f067–f118、`paths-05x` f091–f166 |
| 返回只剩飞行局名 | 到达页从第一帧在带子揭开处画好，离开页只被带子收走（行到带子边才走），屏上始终有正文；带子窄于 120px 时清掉离开页残余 | `paths-1x` A f018–f033、B f051–f066、C f135–f150、D f167–f182；`paths-05x` 同段；`f5-brunch-*` |
| 进入面上只剩局名 | 旧面内容留到带子边到达它为止（旧局名与旧卡除外：同一时刻一场局名、一张卡） | `paths-1x` D f151–f166、BUSY f207–f222 |
| 出票中返回残留票槽 | 票槽 / 票台整块参与切换，带子变窄即清掉；带子、各行、标题同一时钟（主线程忙也不脱节） | `paths-1x` BUSY f191–f206 |
| 落定时两行跳一行 | 飞行标题按「两边都同一行」切段，换行段走 L 形路径，片段不相交，落在行的字形上 | `paths-1x` A f018–f033、`paths-05x` A f024–f045 |
| 自证探针 | 每段转场「面与纸文字都 ≤ .3」最长时长与「只剩标题」帧数：1× 与 0.5× 全部 0 | `probe-1x.txt`、`probe-05x.txt` |

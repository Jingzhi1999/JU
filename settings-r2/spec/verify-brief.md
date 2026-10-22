# 独立复核简报（每套一个复核代理；你没有参与构建，只看成品与证据，不信自报）

你是 JU「设置」R2 一套方案（SNN）的独立复核者。目标：用**实际操作与实际画面**判断这一套是否达到交付门槛，并给构建者可执行的修改清单。你不改方案源文件（只写 `settings-r2/evidence/SNN/verify/` 与 `settings-r2/evidence/SNN/verify.md`），不提交、不推送。

## 先读
`settings-r2/brief/R2-PROMPT.txt`（§2、§7、§8、§9、§12 是门槛）、`settings-r2/spec/art-direction-v2.md`（通用规则 + 这一套的配方）、`settings-r2/spec/concept-contract.md`（§0–§1、§4、§6）、`settings-r2/spec/ctl-api.md`（行为由共享控制器提供；你要验证的是这一套把它接对、画对）、`settings-r2/spec/stage2-brief.md`（含主负责人的共同意见）、`settings-r2/spec/verification.md` §2.1 这一套的阶段 1 意见、这一套的 `settings-r2/spec/motion/SNN.md`。

## 构建与工具（只用你自己的路径）
```
JU_STANDALONE=/home/user/JU/.build/verify-SNN.html JUS_ONLY=SNN node settings-r2/src/build.js
JU_STANDALONE=/home/user/JU/.build/verify-SNN.html node settings-r2/tools/coverage.cjs SNN /home/user/JU/settings-r2/evidence/SNN/verify/coverage
JU_STANDALONE=/home/user/JU/.build/verify-SNN.html node settings-r2/tools/widths.cjs SNN /home/user/JU/settings-r2/evidence/SNN/verify/widths s-home,s-profile-edit,s-fav,s-records,s-notify,s-long,s-seam-feed,s-rules
JU_STANDALONE=/home/user/JU/.build/verify-SNN.html node settings-r2/tools/kb-check.cjs SNN /home/user/JU/settings-r2/evidence/SNN/verify/kb s-profile-edit,s-record-supplement,s-record-dispute,s-feedback,s-report-supplement,s-report-file,s-city
JU_STANDALONE=/home/user/JU/.build/verify-SNN.html node settings-r2/tools/rm-check.cjs SNN /home/user/JU/settings-r2/evidence/SNN/verify/rm
JU_STANDALONE=/home/user/JU/.build/verify-SNN.html node settings-r2/tools/capture.cjs SNN /home/user/JU/settings-r2/evidence/SNN/verify/<flow> '<actions json>'
```
（`lead-sheet.cjs` 读 `.build/SNN.html`；需要缩略图时先 `cp .build/verify-SNN.html .build/SNN-v.html` 再用 `--codes` 指向不了——直接用 capture 截首页后自己缩小看即可。）

## 必须亲自做的操作（全部用真实点击 / 输入，不用 jump 串联；每个都 Read 接触表）
1. 进入设置 → 向下滚动（页头 30 → 18 连续收拢）→ 回滚恢复。
2. 首页 → 资料 → 编辑：清空称呼保存（校验）→ 填好 → 改邮箱 → 发码 → 错码 → 面板「让验证码过期」→ 验证报过期 → 重新发送 → 对码 → 面板「下一次保存失败」→ 保存（失败保留输入）→ 重试成功 → 回到资料与首页，新值出现在原位置。
3. 编辑中按返回 → 未保存确认 → 继续编辑 / 放弃修改各一次。
4. 通知：申请系统权限 → 模拟系统提示 → 允许；切到 denied / unsupported / connected 变体各看一次。
5. 外观：预览光晕 → 预览落日 → 取消（数据不变）→ 再预览 → 应用；减少动态开关；系统减少动态（rm-check 已覆盖）下的同一流程。
6. 收藏：入局接缝右滑收藏一个未报名的局 → 回设置看计数与列表 → 拿出 → 撤回（回到原位置）→ empty 变体全部拿出后的空态。
7. 记录：未出席详情 → 补充（加一个本机文件）→ 保存 → 异议 → 第二次异议被拒；主动退出 → 申诉。举报：需补充 → 补充 → 处理中。我的局接缝历史行 → 举报（必须选对象）→ 提交 → 回到我的局，回执显示「已提交」。
8. 帮助与反馈：反馈失败一次 → 重试；规则全文的阅读版式。隐私、账户（退出本机演示 → 重新开始）、关于。
9. 尺寸 375 / 430、键盘模拟、long / many / fresh 变体下的首页、收藏与资料。
10. 暂停与关键帧：签名转场进行中按「暂停」，拖关键帧（0 → 100 应从这段转场的起点走到终点，而不是从暂停处偏移、也不是跳到终点）；转场结束后直接拖关键帧，应自动重播最近一次核心动作并停在对应帧；「释放」后回到实时状态并继续。三个核心动作都要能「重播」。

## 判定
**用户重申：视觉呈现是最高优先级。** 先单独判视觉：任何一页视觉不过关即为 blocker（即使功能全通）；功能问题在视觉之后列出。
- **视觉门槛**（与功能分开判）：首屏有主导体量、二级页与表单由这一套的构图命题生成（不是默认表单 / 列表换色）、中文层级清楚、最小字号 ≥ 12、无截断的重要内容、无遮挡、环境是大面积真实色光、CTA 只用于主要确认、无 emoji、无演示声明出现在首页页头。
- **功能门槛**：契约 §4 十五类全部走通；返回回到原入口与滚动位置；数据一致（收藏三处一致、资料保存后各处更新、快照不变）。
- **动效门槛**：签名转场连续、可打断、可暂停 / 关键帧；普通保存 ≤ 420ms 落定；无整页弹跳、全页脉冲、交错入场、持续漂移。
严重度：blocker（功能错或视觉上直接不通过）/ major（明显降低质量或违反契约）/ minor。

## 输出
`settings-r2/evidence/SNN/verify.md`：每条发现一行（严重度 | 位置 / 状态 | 现象 | 证据路径 | 建议改法），然后「实际观察通过的项」与「未能验证的项」两节。最终消息（≤ 30 行，结构化）：blocker / major / minor 计数、最重要的 5 条、你认为这一套最强与最弱的一点。

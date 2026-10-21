# 功能状态对照（任务书 §9 十五类 ↔ 共享引擎 ↔ 评审索引）

每一行：类别 → 必须到达的状态 → 引擎动作 / 派生 → 索引键（`JUS.INDEX`，52 条；`tools/coverage.cjs` 对十套逐条验证）→ 旧十套的覆盖情况（源码检查）→ R2 的变化。「演示」= 本机演示能力，产品内有一句准确说明；「真实」= 真正会发生的事。

| # | 类别 | 状态 | 引擎 / 派生 | 索引键 | 旧十套 | R2 变化 |
|---|---|---|---|---|---|---|
| 1 | 设置概览 | 有数据 / 有待处理 / 新用户 / 全空 / 较多 / 长文本 | `derive.summary` | `s-home`, `s-home-attention`, `s-profile-fresh`（fresh 变体）, `s-long`（long 变体）；empty / many 变体经面板 | 有 | 待处理计数与入口由各套方向组织 |
| 2 | 个人资料 | 展示 / 编辑 / 校验失败 / 取消 / 保存成功 / 保存失败保留输入 / 未保存返回确认 / 键盘态 | `engine.saveProfile`（`invalid` 不写入）、`setFailNext` | `s-profile`, `s-profile-edit`, `s-profile-invalid`, `s-profile-saved`, `s-fail`, **`s-unsaved`（新）**, **`s-kb`（新）** | 有（无键盘态索引） | 键盘模拟 300px 必须不遮输入与主动作 |
| 3 | 邮箱验证 | 发送 / 输入 / 错码 / 重发倒计时 59s / **过期 / 恢复（重新发送）** | `requestEmailCode / verifyEmailCode / clearEmailPending`；`derive.emailPending`（走时钟） | `s-profile-code`, **`s-profile-code-expired`（新）** | 过期不可达（固定时钟） | 走时钟；面板「时间 +5 分钟 / 让验证码过期」 |
| 4 | 收藏的局 | 列表 / 详情（权限同来源）/ 已报名标记 / 取消 / 空态 / 较多 + 跨城市 / 长局名 | `favorite / unfavorite / toggleFavorite`；`derive.favorites / favorite` | `s-fav`, `s-fav-detail`, `s-fav-joined`, `s-fav-empty`, `s-fav-many`, `s-long-fav` | 有 | 列表与详情的空间组织由方向决定 |
| 5 | 默认浏览城市 | 选择 / 搜索 / 无结果 / 当前值与保存反馈 / 作用域说明 | `setCity`；`JUS.CITIES / CITY_COPY` | `s-city`, `s-city-search` | 有 | — |
| 6 | 通知 | 偏好六类 / 系统权限五态 / 服务未连接 / 已连接 / 申请流程（系统弹窗） | `setNotifyPref / requestPermission / resolvePermission`；`derive.notify` | `s-notify`, `s-notify-request`, `s-notify-denied`, `s-notify-unsupported`, `s-notify-connected` | 有 | 三层仍分开；送达结论必须是有分量的画面 |
| 7 | 外观 | 三种环境预览 / 应用 / 取消 / 减少动态（用户）/ 系统减少动态协调 | `applySkin / setReduceMotion`；`review.rmSys` | `s-appearance`, `s-appearance-preview` | 预览多为色样；无系统 RM | 预览 = 画面本身；系统 RM 接入并显示「跟随系统」 |
| 8 | 我的记录 | 列表 / 详情（未出席待核实、主动退出、安排变化）/ 补充（含本机文件名）/ 异议 / 申诉 / 草稿隔离 / 空态 | `addSupplement / fileDispute / fileAppeal`；`derive.records / record` | `s-records`, `s-record-absent`, `s-record-dispute`, `s-record-exit`, `s-record-appeal`, `s-record-supplement`, `s-records-empty` | 有 | 材料 = 真实 File 名与大小，标「本机演示 · 不上传」 |
| 9 | 我的举报 | 列表 / 详情（状态、对象、原文、材料、本地编号、时间线）/ 需补充 → 补充 / 草稿 / 空态 | `supplementReport`；`derive.reports / report` | `s-reports`, `s-report-needmore`, `s-report-supplement`, `s-report-received`, `s-reports-empty` | 有 | — |
| 10 | 帮助与反馈 | 帮助内容 / 反馈输入 / 提交演示 / 失败恢复 / 我的反馈 | `submitFeedback`；`JUS.RULES`；`derive.feedback` | `s-help`, `s-feedback` | 有 | — |
| 11 | 隐私与可见性 | 一般规则 + 按活动派生情形；无伪开关 | `derive.privacy` | `s-privacy` | 有 | — |
| 12 | 账户 | 说明 / 危险操作确认 / 结束演示会话 / 重新开始 | `endDemoSession / restartDemoSession` | `s-account`, `s-account-confirm` | 有 | — |
| 13 | 关于与规则 | 关于 / 规则全文长文 | `derive.about`；`JUS.RULES / POLICY_NOTE` | `s-about`, `s-rules` | 有 | — |
| 14 | 最小接缝 | 入局列表滑动收藏 / 只看收藏 / 未报名详情 / 我的局列表（收藏标记）/ 从历史行举报回到正确的局 | `derive.feed / mine`；`toggleFavorite / fileReport` | `s-seam-feed`, `s-seam-feed-fav`, `s-seam-feed-detail`, `s-seam-mine`, `s-report-file` | 有 | 举报新建 = 已提交，不自动受理（保留） |
| 15 | 画面外评审工具 | 方案切换 / 统一数据（变体）/ 状态入口 / 1× / 0.5× / 暂停 / 关键帧 / 重播 / 失败模拟 / 重置 / **尺寸 375·390·430 / 键盘 / 时钟 / 系统 RM 显示** | 面板 + shell（对比视图：全部十套、隐名、灰度、尺寸、减少动态） | — | 有（无尺寸 / 键盘 / 时钟） | 新增项见 `jus-panel.html`；shell 对比视图新增三道差异检查 |

## 业务层保证（引擎测试 `tools/test/core-regress.cjs` 覆盖）
修改资料不改历史报名快照；收藏不改报名阶段 / 票根；举报不自动成立（新建 = 已提交）；记录只追加；失败保留输入（引擎不写入）；重试不重复；城市只改浏览偏好；十套数据命名空间隔离（`jus2:<SNN>:v1`），重置回到同一比较数据。

## 旧原型规则的核对（任务书 §9 末段）
见 `settings-r2/spec/rules-check.md`。

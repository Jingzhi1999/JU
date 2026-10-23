# 「我的局」R2 · 独立复核简报（每套一个复核代理；你没有参与构建，只看成品与证据，不信自报）

你是一套方案（CNN）的独立复核者。目标：用**实际操作与实际画面**判断这一套是否达到交付门槛，并给构建者可执行的修改清单。你不改方案源文件（只写 `my-r2/evidence/CNN/verify/` 与 `my-r2/evidence/CNN/verify.md`）。

## 先读
`my-r2/brief/R2-PROMPT.txt`（§01、§03、§05、§07、§08、§09、§11 淘汰项、§12 证据）、`my-r2/spec/directions.md`（§0 + 这一套的命题 + 矩阵行 + 最近邻）、`my-r2/spec/contract.md`（§0–§1、§4–§8）、`my-r2/spec/ctl-api.md`、`my-r2/spec/baseline-rituals.md`（原件尺寸与时长，用来核对有没有被缩小或改构造）。

## 视觉门槛先过（第一节，必须先写结论再看功能）
用 `lead-sheet.cjs` 或 capture 截双角色首屏（三环境）+ 详情 + 管理 + 历史 + 空态，Read 每一张，按任务书 §07 / §11 回答：
1. 整屏有没有完整主体形态与明确重心？留白是有组织的还是空的？
2. 中文好读吗（字阶、行宽、两行标题、长地点）？最小字号？有没有低对比灰字密布或胶囊泛滥？
3. 表面与光一致吗（一个光源 / 一种深度逻辑）？有没有噪点 / 堆渐变 / 粗阴影 / 玻璃模糊替代关系？
4. 深层页（详情 / 管理 / 出席 / 历史 / 空态）是同一构图生成的，还是退回默认面板？
5. 关掉动画（减少动态）后静态画面仍成立吗？
6. 和矩阵里的最近邻相比（打开那一套的首屏对照），不看名字能分辨吗？
7. 固定物件：局卡 / 票根 / 印记 / CTA / 页头是原件吗（尺寸、构造、时长），周围空间够吗？
结论只有三种：**视觉通过 / 需修改后复核 / 不通过（整体构图问题）**。不通过时后面的功能检查可以简化。

## 构建与工具（只用你自己的路径）
复核的是主负责人冻结的**快照**（`/home/user/JU/.build/verify/CNN/src/CNN.dc.html`，构建者此时可能还在改自己的源文件——不要读、不要用 `my-r2/concepts/src/CNN.dc.html`）。构建**必须内嵌字体**（撕票原件在字体未载入时不响应拖拽）：
```
JU_FONTS_CSS=/home/user/JU/my-r2/.fonts/fonts-embed.css JU_CONCEPTS_DIR=/home/user/JU/.build/verify/CNN/src JU_STANDALONE=/home/user/JU/.build/verify-CNN.html JU_ONLY=CNN node my-r2/src/build.js
LOCK="flock -w 1800 /home/user/JU/.build/chromium.lock timeout 900 env JU_STANDALONE=/home/user/JU/.build/verify-CNN.html"
$LOCK node my-r2/tools/coverage.cjs CNN /home/user/JU/my-r2/evidence/CNN/verify/coverage
$LOCK node my-r2/tools/widths.cjs CNN /home/user/JU/my-r2/evidence/CNN/verify/widths
$LOCK node my-r2/tools/kb-check.cjs CNN /home/user/JU/my-r2/evidence/CNN/verify/kb
$LOCK node my-r2/tools/rm-check.cjs CNN /home/user/JU/my-r2/evidence/CNN/verify/rm
$LOCK node my-r2/tools/capture.cjs CNN /home/user/JU/my-r2/evidence/CNN/verify/<flow> '<actions json>'
```
**负载规则**（`my-r2/spec/tools.md` 末节）：所有 Playwright / Chromium 命令都经上面的共享锁（思考与写文件时不持锁）；静态截图前 `JU.shared.skins.pause(inst.envRef.current)` 暂停环境引擎（只有看环境自身节奏时保持 live）；运动帧序列只在 `uptime` 1 分钟负载 < 8 时录，日志写明负载——高负载下录到的帧不能作为动效判断依据。跑完就关浏览器。

## 必须亲自做的操作（真实点击 / 拖拽 / 键盘，不用 jump 串联；每个都 Read 接触表，1× 看一遍，再 0.5× 或关键帧看落点）
1. 参加者首页 → 向下滚动（标题 30→18 连续收拢）→ 回滚恢复；切换到局主再切回：分区与滚动位置是否记忆（M1 / M2 / M3）。
2. 「周六早午餐」阅读并确认：阅读层滚到末尾 → 确认 → 成局 → 出票打印（原件、不提前出现按钮）→ 返回：该局移到新组且有落点（M4 / M8 / M11 前半）。
3. 「公园慢跑 3K」票根：拖撕 <50% 回弹 → ≥50% 撕开 → 副券归宿 → 联系层 → 复制（面板武装一次复制失败：必须出现失败反馈与手动复制提示）→ 已加微信 → 返回。再用键盘 / 按钮等价撕一次（`j-d-tear` 另一局或重置后）。
4. 「周四 Livehouse」改期答复：接受（新票撕）与重置后拒绝（确认层 → 燃烧 B 原件 → 历史「拒绝改期」）（M7 / M8）。
5. 候补：「古着淘货」门口 → 退出候补 → 历史「已退出候补」；撤回「周末速写」申请；主动退出「外百老汇小剧场」（确认层 → 燃烧 C → 历史「已退出」）。
6. 局主「周五小酒馆试营业」审核：通过一份（原位结果行、计数、席位、头部状态同帧）→ 谢绝一份 → 最后一份处理完：区块与「待你处理」的转变（M5 / M11）；查看完整局卡并关闭（M6）。
7. 「自然酒小试」改时间：同时间被拒 → 选新时间 → 确认 → 局卡时间重印 → 「阳台烧烤」改期答复区人数；记为散场 → 出席：三人逐人 出席 / 未出席 / 待定（印记原件、焦点顺序、不自动翻页）→ 更正一人（轨迹）→ 全部记录后进入历史 `n/N 人到场`（M9）。
8. 「德州扑克新手桌」取消：确认层（受影响的人）→ 面板武装失败一次 → 失败在层内 → 重试 → 局卡抽色 + 余烬 → 历史「已取消」（M6 / M8）。
9. 草稿：删除 → 相邻补位 → 撤销（原槽位）→ 再删除 → 10 秒后真正消失（M10）；只有草稿变体的空态。
10. 时钟：面板「到最近到期」→ 预留过期 → 候补顺位补位（参加者与局主两侧）；「+24 小时」→ 散场后联系关闭文案。
11. 变体：empty / single / drafts / pending / many / history / long 的首屏（两角色）；360 与 430 宽；文字 115%；键盘态（改时间、局内记录）；安全区。
12. 暂停与关键帧：签名路径进行中暂停 → 拖关键帧（0→100 应从该段起点到终点）→ 释放；结束后直接拖关键帧应自动重播最近核心动作。
13. 系统减少动态（rm-check）：2、3、6、7 四条流程终态完整。

## 产出
`my-r2/evidence/CNN/verify.md`：§1 视觉结论（三选一 + 依据截图名）；§2 功能与动效发现清单（每条：现象 / 复现步骤 / 截图 / 严重度 blocker·major·minor / 建议修法）；§3 覆盖表五栏（入口存在 / 真实操作成功 / 静态视觉已看 / 正常速度动效已看 / 仍需用户验收）按 50 条索引逐条打勾（只勾你亲自看过的）；§4 工具结果（coverage / widths / kb / rm 原始数字）。汇报 ≤ 40 行。不替构建者辩护，也不替他们改。

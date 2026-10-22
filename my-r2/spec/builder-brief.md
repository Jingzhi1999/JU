# 「我的局」R2 · 方案构建代理简报（每个 CNN 代理从这里开始）

你要实现十套中的**一套**：一台真正可操作、你自己截图复看过的 390×844 手机画面（360 / 375 / 430 真实回流）。视觉是独立且必要的门槛（用户原话：视觉呈现是最高优先级，功能完美也不能替代）。功能齐全、状态丰富、有创意，都不能替代视觉通过。

## 必读（按顺序）
0. `my-r2/brief/R2-PROMPT.txt` §01、§03、§05、§07、§08（任务书原文优先于一切）。
1. `my-r2/spec/directions.md` §0 共同规则 + 你那一套的命题（构图、分量、字阶、物件进入方式、详情 / 管理组织、代表路径、会失败的信号、最近邻）+ §2 矩阵里你那一行（其他九行告诉你**不能像谁**）。
2. `my-r2/spec/contract.md`（质量门槛、共有语言、骨架与标记、共享核心、范围、动效族、选择器、验证、完成定义、坑、§10 修复落点）。
3. `my-r2/spec/ctl-api.md`（共享控制器：你只负责构图、排版、表面与运动，行为来自 `this.ctlVals()`）与 `my-r2/concepts/src/C00.dc.html`（**接线参考**：每个绑定都在；视觉故意朴素——只抄绑定，不抄样子）。
4. `my-r2/spec/baseline-v27.md`、`my-r2/spec/baseline-rituals.md`（固定物件的实测尺寸、构造与复用接口；`my-r2/src/shared/` 的模块已由构建注入）。
5. `my-r2/spec/baseline-old10.md`（旧十套为什么被否决——尤其「深层页退回默认面板」「物件吃掉正文宽度」「大字不是大气」）。
6. `spec/state-inventory.md` A–D、G（语义；其中布局决定不约束）。
7. 你的参考：`my-r2/spec/concept-refs.md` 里你那一节（5–8 条，≥3 类），用 Read 打开至少三张证据图再动手。

## 两个阶段
**阶段 1（先交付，等主负责人核对后再继续）**：双角色首屏（default，三环境各一张）+ `j-d-tear` 票根面（首次进入打印 → 撕副券 → 联系层，用共享仪式原件）+ `h-m-review` 申请审核（通过一份后计数 / 席位 / 头部状态原位变化）+ 本套签名路径（命题里的「代表路径」）的正常速度帧序列。主负责人用匿名 / 同环境 / 灰度对比表复核构图；不通过就返工，不进阶段 2。
**阶段 2（收到继续指令后）**：50 条索引全部可达、十一动效族、全部弹层与焦点、边界变体（empty / single / drafts / pending / many / history / long）、三个宽度 + 文字 115% + 键盘 + 安全区、减少动态终态；证据（契约 §7）与 `my-r2/spec/motion/CNN.md`；汇报。

## 你写的文件
- `my-r2/concepts/src/CNN.dc.html`（唯一产品源；四个标记；类名前缀 `cNN-`；≤ 200 KB）
- `my-r2/spec/motion/CNN.md`（阶段 2）
- `my-r2/evidence/CNN/…`（截图与帧序列；完成后 `python3 -I my-r2/tools/shrink-evidence.py CNN`）
- 不修改共享文件；不碰其他方案；共享核心的问题写进汇报（主负责人修）。

## 命令（契约 §7）
```
JU_STANDALONE=/home/user/JU/.build/CNN.html JU_ONLY=CNN node my-r2/src/build.js
JU_STANDALONE=/home/user/JU/.build/CNN.html node my-r2/tools/capture.cjs CNN <outdir> '<actions json>'
JU_STANDALONE=/home/user/JU/.build/CNN.html node my-r2/tools/coverage.cjs CNN <outdir>
JU_STANDALONE=/home/user/JU/.build/CNN.html node my-r2/tools/widths.cjs CNN <outdir> [states]
JU_STANDALONE=/home/user/JU/.build/CNN.html node my-r2/tools/kb-check.cjs CNN <outdir>
JU_STANDALONE=/home/user/JU/.build/CNN.html node my-r2/tools/rm-check.cjs CNN <outdir>
JU_STANDALONE=/home/user/JU/.build/CNN.html node my-r2/tools/flow-compare.cjs …
```
工具用法见各文件头注释与 `my-r2/spec/tools.md`。

## 质量自检（阶段 2 交付前逐条回答，写进汇报）
1. 首屏第一眼看什么、第二眼看什么？局名、时间、角色、下一步有没有先后？
2. 三种环境下首屏都成立吗？前景的面、边、透明度在三种底色上各是什么关系？
3. `long` 变体的 40 字局名、长地点、中英混排各自排得怎样？最小字号多少？行宽实测多少？
4. 详情 / 票根 / 管理 / 出席 / 历史 / 空态是不是由你的构图生成的（不是「返回 + 标题 + 列表」）？
5. 局卡、票根、出席印记、CTA、页头是原件吗？它们周围的空间够吗？有没有被缩小或改构造？
6. 代表路径在 1× 下：触发前 → 即时反馈 → 连续变化 → 内容接替 → 结果落定 → 返回，哪一步最弱？
7. 快速连点、拖一半放手、动画中返回、减少动态，各自的终态完整吗？
8. 数据先写、动画后播了吗？失败武装后 UI 在发生处显示失败并可重试吗？复制失败分支看过吗？
9. 十一动效族各在哪里出现？哪一族你做得最弱、为什么？
10. 和最近邻方案相比，关掉颜色后还能看出不同吗？
11. 一个仍可能失败的设计判断是什么、你怎么检查的？
12. 共享核心 / 仪式模块有什么问题？

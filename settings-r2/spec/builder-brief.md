# R2 方案构建代理简报（每个 SNN 代理从这里开始）

你要实现 JU「设置」R2 十套中的**一套**：一台真正可操作、你自己截图复看过的手机画面（375 / 390 / 430 三个宽度真实回流）。视觉是独立且必要的门槛：首屏有分量的构图与视觉中心、中文排版质量、三种环境的真实面积、一致的材质逻辑、有主语的动效；二级页、编辑态、列表、详情、确认层都由你的方向卡生成，不回到默认表单。功能不能漏：十套共用同一业务范围（契约 §4，索引 52 条）。

## 必读（按顺序）
1. `settings-r2/spec/concept-contract.md`（质量门槛、共有语言规格、文件结构、共享核心、覆盖范围、选择器、验证、完成定义、坑）
2. `settings-r2/spec/directions.md` 里你的那一节 + 总表与六维矩阵里你那一行（这是你的艺术指导；其他九行告诉你**不能像谁**）
3. `settings-r2/spec/baseline-observations.md`（旧十套为什么被否决；§5 的二级页同构是你必须避免的）
4. `settings-r2/spec/state-contract.md`（对象模型、作用域、保存模型、收藏手势参数、文案、冲突处理决定）
5. `settings-r2/src/core/jus-data.js`（`JUS.derive.* / engine.* / COPY / RULES / SKINS / NOTIFY_CATS / FAV / INDEX`）与 `settings-r2/src/core/jus-review.js`（mixin：after / hold / holdKey / act / motion / jumpTo / applyJump / panelVals / setPhoneSize / toggleKb / isRM）
6. `settings-r2/concepts/src/S00.dc.html`（管线样例：骨架、面板注入、索引映射、接缝手势的最小实现；**不要抄它的视觉**）
7. 你的参考案例：`settings-r2/spec/directions.md` 末尾你那一行的候选 + `settings-r2/research/ledger.md`（若已存在）；证据图在 `research/evidence/<slug>/`（上一轮）或 `settings-r2/research/evidence/<slug>/`。用 Read 打开至少三张看一眼再动手。

## 两个阶段
**阶段 1（先交付，等主负责人核对后再继续）**：首屏（`s-home`，default 变体）+ 一个代表性详情（资料详情 → 编辑）+ 一个正常速度的核心交互（你方向卡 §6 的主语动作），三种环境都能切（面板「外观」索引或引擎 `applySkin`）。产出 `settings-r2/evidence/SNN/stage1/`：`home-cotton.png / home-halo.png / home-sunset.png / detail.png / edit.png` + `flow-core/sheet.png`，以及 widths 检查结果。汇报 ≤ 20 行。主负责人会把十套首屏匿名并排、灰度、同流程比较；不成立的方向会被要求推翻重来，所以阶段 1 不要先铺功能。
**阶段 2（收到继续指令后）**：贯穿全部 52 个索引状态、九个流程、三个检查（widths / kb / rm）、`spec/motion/SNN.md`、证据与汇报（契约 §6–§7）。

## 你写的文件
- `settings-r2/concepts/src/SNN.dc.html`（唯一产品源；四个标记；类名前缀 `sNN-`）
- `settings-r2/spec/motion/SNN.md`（阶段 2）
- `settings-r2/evidence/SNN/…`（截图与接触表；完成后 `python3 -I settings-r2/tools/shrink-evidence.py SNN`）
- 不要修改共享文件；不要碰其他方案；发现核心问题写进汇报。

## 命令
```
JU_STANDALONE=/home/user/JU/.build/SNN.html JUS_ONLY=SNN node settings-r2/src/build.js
JU_STANDALONE=/home/user/JU/.build/SNN.html node settings-r2/tools/capture.cjs SNN <outdir> '<actions json>'
JU_STANDALONE=/home/user/JU/.build/SNN.html node settings-r2/tools/coverage.cjs SNN <outdir>
JU_STANDALONE=/home/user/JU/.build/SNN.html node settings-r2/tools/widths.cjs SNN <outdir> [states]
JU_STANDALONE=/home/user/JU/.build/SNN.html node settings-r2/tools/kb-check.cjs SNN <outdir> [states]
JU_STANDALONE=/home/user/JU/.build/SNN.html node settings-r2/tools/rm-check.cjs SNN <outdir>
```
`capture.cjs` 动作：`{"click":"css"}`、`{"drag":{"from":"css","to":[dx,dy],"steps":8,"shots":true}}`、`{"jump":"index-key"}`、`{"wait":ms,"shot":true}`、`{"shots":n,"every":ms}`、`{"eval":"js（root, inst 可用）"}`、`{"speed":0.5}`、`{"scroll":"css","to":y}`。css 在你的 shadow root 内查询；输入文本用 eval：`var i=root.querySelector('[data-field=name]'); i.value='阿禾二'; i.dispatchEvent(new Event('input',{bubbles:true}))`。切环境：`{"eval":"inst.act('applySkin',{skin:'halo'})"}`。每次改动后 Read `sheet.png` 逐帧看；`log.json` 的 `errors` 必须为空。看到文字模糊 / 残影 / 重叠 / 白块 / 半空卡住 / 层级错乱 / 挤压 / 小字遍布 / 首屏没有主角，就改设计，不要只修功能。

## 质量自检（阶段 2 交付前逐条回答）
1. 首屏第一眼看什么、第二眼看什么？身份、分组、当前值、状态、动作有没有互相抢层级？
2. 三种环境下首屏都成立吗？环境是大面积色光还是微染？
3. 中文称呼、微信号、长邮箱（`long` 变体）、长局名各自排得怎样？最小字号是多少？
4. 二级页 / 编辑态 / 列表 / 详情 / 确认层是不是由你的方向生成的（与「返回 + 标题 + 三个输入框」不同）？
5. 材质在静止与运动时是同一逻辑吗？纹理 / 滤镜有没有影响文字？
6. 核心动作：触发 → 发展 → 落定 → 返回连续吗？中断 / 重播 / 0.5× / 关键帧 / 减少动态（三源）下完整吗？普通保存 ≤ 420ms 落定吗？
7. 页头 30 → 18 连续收拢实现了吗？CTA 只用于主要确认吗？
8. 收藏接缝三处一致吗？已报名的局取消收藏后阶段 / 票根不变吗？最后一个取消后空态完整吗？
9. 资料：校验、验证码（错 / 对 / 过期 → 重发）、保存失败重试、未保存返回确认、键盘态都走通了吗？保存后首页当前值更新并回到原位了吗？
10. 通知：六种状态（未请求 / 请求中 / 允许 / 拒绝 / 不支持 / 未连接）各有画面吗？记录 / 举报：详情 → 补充 / 异议 / 申诉 → 保存 → 返回，草稿不串对象吗？
11. 每个按钮都有与名称一致的结果吗？
12. 你认为仍可能失败的一个设计判断是什么，你怎么检查的？

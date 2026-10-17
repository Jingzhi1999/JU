# 方案构建代理简报（每个 SCNN 代理从这里开始）

你要实现 JU「设置」十套方案中的**一套**，交付一个真正可操作、经过你自己截图复看的 390×844 手机画面。视觉性最重要：首屏要有明确的视觉主角、构图重心与中文排版质量；二级页、编辑器、弹层、列表、空态、失败态、结果态延续同一方案的质量；材质要在表面、厚度、边缘、接触、受光、遮挡与运动中成立；动效要可追踪、有阈值、有归宿。功能不能漏：十套共用完整功能范围。

## 必读（按顺序）
1. `settings/spec/concept-contract.md`（实现契约：文件结构、模板语法、共享核心、必须覆盖的界面、索引映射、选择器、动效族、验证、完成定义、已知坑）
2. `settings/spec/directions.md` 中你的那一节（六维方向卡）+ 首页表格里你那一行
3. `settings/spec/concept-refs.md` 中你的那一节（5–8 个参考案例的具体转译；证据图在 `research/evidence/<slug>/`，用 Read 打开至少三张看一眼再动手）
4. `settings/spec/state-contract.md`（对象模型、作用域、保存模型、收藏手势参数、文案、冲突处理决定）
5. `settings/src/core/jus-data.js`（读 `JUS.derive.*`、`JUS.engine.*`、`JUS.COPY/FAV/RULES/SKINS/CITIES/NOTIFY_CATS/REPORT_LABELS/creditLabel/creditStatus`、`JUS.INDEX`）与 `settings/src/core/jus-review.js`（mixin 方法）
6. `settings/concepts/src/SC00.dc.html`（管线样例：骨架、拖拽收藏、FLIP 详情、toast、失败重试的最小写法）与 `src/core/ju-fx.css`（可用的效果原语）
7. `settings/concepts/concepts.json` 中你的条目（名称、一句话、三个核心动作、备注）

## 你写的文件
- `settings/concepts/src/SCNN.dc.html`（唯一的产品源文件；保留四个标记 `/* @panel-css */`、`<!-- @fx-svg -->`、`<!-- @panel -->`、`/* @core */`）
- `settings/spec/motion/SCNN.md`（三个核心动作的分段记录 + 关键视觉参数：字体、字号阶、色板、材质规则、圆角 / 阴影 / 边缘规则、布局构图；分清「当前代码值 / 实际观察 / 建议值」）
- `settings/evidence/SCNN/`：`home.png`、`dense.png`、`favorites.png`、`favorites-after-remove.png`、`record-detail.png`、`record-supplement.png`（或举报补充）、`saved.png`、`edge-empty.png`、`edge-fail.png`、`edge-denied.png`、`seam-feed.png`、`seam-mine.png`，以及三个核心动作的帧目录 `motion-1/ motion-2/ motion-3/`（各含 `sheet.png` + `log.json`）与一份 `coverage/`（`node settings/tools/coverage.cjs` 输出）
- **不要修改**任何共享文件（`settings/src/*`、`src/*`、`settings/spec/*.md` 的共享部分、其他方案）。发现核心 bug 或契约矛盾：在你的汇报里写明，不要绕过去改共享文件。

## 构建与验证命令（全部用私有构建，避免互相覆盖）
```
JU_STANDALONE=/home/user/JU/.build/SCNN.html node settings/src/build.js
JU_STANDALONE=/home/user/JU/.build/SCNN.html node settings/tools/capture.cjs SCNN /home/user/JU/.build/SCNN-cap-xxx '<actions json>'
JU_STANDALONE=/home/user/JU/.build/SCNN.html node settings/tools/coverage.cjs SCNN /home/user/JU/settings/evidence/SCNN/coverage
```
`capture.cjs` 动作：`{"click":"css"}`、`{"drag":{"from":"css","to":[dx,dy],"steps":8,"shots":true}}`、`{"jump":"index-key"}`、`{"wait":ms,"shot":true}`、`{"shots":n,"every":ms}`、`{"eval":"js（可用 root, inst）"}`、`{"speed":0.5}`、`{"scroll":"css","to":y}`。所有 css 在你的 shadow root 内查询（`root.querySelector`），优先用 `data-act` / `data-rid` / `.scNN-over` 选择器。输入文本：`{"eval":"var i=root.querySelector('[data-field=name]'); i.value='阿禾二'; i.dispatchEvent(new Event('input',{bubbles:true}))"}`。
每次改动后至少跑一遍契约 §8 的序列，用 Read 打开 `sheet.png` 逐帧看；`log.json` 的 `errors` 必须为空。看到文字模糊 / 残影 / 重叠 / 白块 / 半空卡住 / 层级错乱 / 挤压 / 低对比灰字遍布 / 首屏没有主角，就改设计，不要只修功能。

## 质量自检（交付前逐条回答，写进汇报）
1. 首屏第一眼看什么？第二眼看什么？身份、分组、当前值、状态、动作有没有互相抢最强层级？
2. 中文称呼、微信号、长邮箱（`long` 变体）、长标题各自排得怎样？有没有溢出或缩字？
3. 开关、单选、文本编辑、记录列表、帮助长文、危险操作是不是各有形态？
4. 材质在静止与运动时是不是同一物件、同一材料？纹理 / 滤镜有没有影响文字清晰？
5. 三个核心动作：触发 → 发展 → 落定 → 返回是否连续？中断 / 重播 / 0.5× / 关键帧 / 减少动态下是否完整？
6. 收藏接缝三处一致吗（入局滑动 → 设置列表 → 我的局标记 → 回入局）？已报名的局取消收藏后阶段 / 票根不变吗？最后一个取消后是完整空态吗？
7. 资料：校验、邮箱验证码、保存失败重试、未保存返回确认都走通了吗？保存后首页当前值更新了吗？
8. 通知：五种权限态 + 服务未连接的结论都各有画面吗？
9. 记录 / 举报：详情 → 补充 / 异议 / 申诉 → 保存结果 → 返回，草稿不串对象吗？
10. 每个按钮都有与名称一致的结果吗？有没有「看似能用、实际没有结果」的按钮？

## 汇报格式（最终回复，≤40 行）
- 文件路径与大小；`coverage` 结果（状态数 / 错误数）；三个核心动作的帧目录；
- 上面 10 条自检的逐条回答（诚实写出未达标项）；
- 你对共享核心 / 契约的问题或建议；
- 你认为主负责人复看时最该先看的 3 张图。

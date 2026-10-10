# 「我的局」十套方案 · 概念实现契约（每个方案代理必读）

你负责实现十套方案中的一套：一个可操作的 390×844 手机画面 + 画面外评审面板，覆盖共同状态清单（`spec/state-inventory.md`）的全部内容。读完本文、`spec/state-inventory.md`、你的方向卡（`spec/directions.md` 中你的那一节）与 `src/core/*.js` 再动手。

## 0. 质量标准（来自客户简报，逐条有效）

- 第一眼：首屏必须有明确的视觉主角与秩序（页面标题 / 活动主体 / 下一步 三者有主次）；局名与时间地点形成比例差；中文标题、状态、时间、地点、人名本身要排得好看，不能靠大号英文撑场。
- 层级：角色切换、分类、状态、卡片、按钮不能同时抢最强层级；关键信息清楚，次要信息依然可读（不要遍布低对比灰字）。
- 构造：局卡、票件、名单、弹层应有各自的形态与信息职责，不是同一种圆角容器的堆叠。
- 材质：从表面、边缘、厚度、受光、接触关系中看得出来；噪点 / 渐变 / 阴影只是构成的一部分；背景服务主体，不与内容竞争（禁止快速循环渐变、漂浮粒子、持续晃动）。
- 一致：同一方案的按钮、状态标记、纸件、弹层、历史与结果态用一致的材质与规则；空态、错误态、取消后、动画结束后的画面也要是完整构图。
- 动效：所有关键动作有开始、过程、落点；同一物件在运动前后身份连续、可追踪（不能中途换成另一个素材或空白矩形）；进入详情时背景要退让 / 遮挡 / 失焦（不能只让原卡消失再淡入无关大面板）；动画结束后文字不得留下模糊、残影、偏移、重叠；同一时刻一个主要动作。
- 材料对应运动：纸就有弯、厚、遮挡、折线、边缘与受力处；别的材料也要有它的重量与柔软度；拖拽要跟手、释放有归宿、取消有回退。
- 打印 / 撕票 / 燃烧：必须完整呈现（见 §6），不能只给结果截图。
- 不要把要求收敛成无特征的极简白底 UI；允许强烈、材质丰富、动效鲜明，但要有结构、主次、一致性。
- 不新增产品机制；语义保留（见 state-inventory §G）。

## 1. 文件与结构

- 你只写一个文件：`concepts/src/CNN.dc.html`（NN = 你的编号）。构建脚本 `node src/build.js` 会把共享核心注入并产出 `concepts/project/CNN.dc.html` 与独立画布 `JU-My-Ju-Fable51-10-Concepts.html`。
- 文件骨架（必须保留三个标记 + fx-svg 标记）：

```html
<!doctype html>
<html lang="zh-CN">
<head>
<meta charset="utf-8">
<title>CNN 方案名</title>
<script src="./support.js"></script>
</head>
<body>
<x-dc>
<helmet>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=...&display=swap">
<style>
body{margin:0}
/* @panel-css */
/* 你的全部 CSS。只用 class / 属性选择器，不用 :root（改用 .app 根元素放变量），不用 body 以外的标签全局样式。 */
</style>
</helmet>
<div class="ju-stage">
  <div class="ju-phone">
    <div class="app{{panel.rootCls}}" style="--k:{{panel.k}};--frame:{{panel.frame}}" ref="{{rootRef}}">
      ……整个产品界面……
    </div>
    <!-- @fx-svg -->
  </div>
  <!-- @panel -->
</div>
</x-dc>
<script type="text/x-dc" data-dc-script data-props='{"panel":{"editor":"boolean","default":true},"preset":{"editor":"enum","options":["joined","hosted"],"default":"joined"},"idle":{"editor":"boolean","default":false},"$preview":{"width":780,"height":884}}'>
/* @core */
class Component extends DCLogic {
  constructor(p) { super(p); this.reviewInit(CONCEPT); if (p.preset === 'hosted') this.state.role = 'hosted'; }
  initialState(variant) { return Object.assign({}, JU.baseState(variant), { /* 你的方案私有视图状态 */ }); }
  applyJump(e) { /* 根据 e.open 打开对应界面（见 §4） */ }
  renderVals() { const panel = this.panelVals(); panel.show = this.props.panel !== false; return { panel, rootRef: this.rootRef, /* ... */ }; }
}
JU.mixin(Component);
</script>
</body>
</html>
```

- 模板语法只有：`{{a.b}}` 点路径（不能写表达式）、`<sc-if value="{{cond}}" hint-placeholder-val="{{false}}">`、`<sc-for list="{{xs}}" as="x" hint-placeholder-count="3">`（可用 `{{$index}}`）、事件 `onClick="{{fn}}"`（也可 onPointerDown / onPointerMove / onPointerUp / onPointerCancel / onInput / onChange / onScroll / onAnimationEnd / onTransitionEnd）、`ref="{{someRef}}"`（`{current:null}` 对象）。class、style 可插值：`class="card {{x.cls}}"`、`style="--p:{{x.p}}"`。
- 所有计算在 `renderVals()` 里做并以名字暴露；循环项的处理函数绑定在项上（`items.map(x => ({...x, open: () => ...}))`）。
- 不用 innerHTML / appendChild / document.write 构建 UI；可以在事件里用 `ev.currentTarget.getBoundingClientRect()`、`this.rootRef.current.querySelector(...)` 做测量（FLIP）。不用全局 keydown。不用 `<iframe>`、`<canvas>`、外部脚本；图片只用内联 SVG 或 CSS 绘制（不引用外部图片）。图标用内联描边 SVG，不用 emoji。
- 字体：只能用 Google Fonts `css2` 链接（中文可选：Noto Sans SC / Noto Serif SC / ZCOOL XiaoWei / ZCOOL QingKe HuangYou / ZCOOL KuaiLe / Ma Shan Zheng / Zhi Mang Xing / Long Cang / Liu Jian Mao Cao；拉丁与数字可配 Archivo / DM Mono / Space Mono / Instrument Serif / Fraunces / Syne / Unbounded / Bricolage Grotesque / IBM Plex Mono / Cormorant / Playfair Display / Manrope / Sora 等；禁用 Inter / Roboto / Arial）。每套最多 3 个字族。
- 所有 id 必须带方案前缀（如 `id="c03-hole-e1"`），因为十套会同在一个文档里。
- 真实控件：按钮用 `<button type="button">`，输入用 `<input>` + `<label>`，图标按钮加 `aria-label`。

## 2. 共享核心（构建时注入，`JU.*`）

- `JU.data(variant)` → 全新深拷贝的演示数据（variant ∈ default / empty / single / drafts / pending / many / history / long）。
- `JU.baseState(variant)` → `{ variant, role:'joined', section:'current', data, view:{name:'list'} }`。
- `JU.engine` → 业务动作（纯函数：`(data, payload) => { data, effect }`），见 `src/core/ju-data.js` 顶部注释；**所有状态变化必须经过它**（保证十套语义一致）。你负责把 `effect` 变成动画与落点。
- `JU.fmt` → 日期 / 时间 / 席位 / 倒计时格式化。
- `JU.INDEX` → 状态索引条目 `{key, group, label, role, section, variant, open:{eventId, surface, tab}}`。`jumpTo(key)` 会：清定时器 → 重建数据 → 设 role/section → 调你的 `applyJump(e)`。
- `JU.fx` → `tearProfile / tearClip / tearClipV / rectIn / scatter`（见 `src/core/ju-fx.js`），CSS 原语见 `src/core/ju-fx.css`（`.fx-burn` `.fx-printer` `.fx-stamp` `.fx-tear` `.fx-ash`，以及 `.rm` `.paused` `.scrub` 全局态）。你可以不用这些原语自己画，但**打印、撕票、燃烧必须达到 §6 的阶段要求**。
- Mixin 方法：`this.after(ms, fn)`（随速度缩放、重置时清除，**所有定时器必须用它**）、`this.motion(name, fn)`（登记核心动效以便“重播”）、`this.reset()`、`this.loadVariant(key)`、`this.jumpTo(key)`、`this.setSpeed(x)`、`this.rootRef`。
- CSS 时长写法：`transition: transform calc(380ms * var(--k,1)) cubic-bezier(...)`、`animation-duration: calc(600ms * var(--k,1))`；长动效（打印 / 撕票收束 / 燃烧 / 作废）用 keyframes，并支持 `.scrub` 下 `animation-play-state:paused; animation-delay: calc(-1 * var(--frame) * 时长)`（见 ju-fx.css 的写法）。`.rm` 下所有动画 1ms（减少动态）——你的 UI 在 `.rm` 下必须直接呈现结果态且可理解。

## 3. 必须覆盖的界面与状态

以 `spec/state-inventory.md` 为准（A 参加者状态表、B 局主状态表、C 管理界面表、D 参加者局内动作、E 边界数据集、F 范围映射、G 语义保留、H 动效族）。同类状态允许共用结构，但标题、物件状态、主要行动、时间信息、结果反馈必须正确。

## 4. 状态索引与 applyJump

`JU.INDEX` 中带 `open` 的条目格式：`open: { eventId, surface, tab }`，surface ∈ `detail`（参加者局内详情）/ `ticket`（票根面）/ `contact`（联系信息层）/ `reschedule-reply`（答复新时间）/ `withdraw`（撤回 / 退出确认）/ `history`（历史票根展开）/ `manage`（局主管理，tab ∈ applications / members / waitlist / contact / leaves / reschedule / cancel / end / attendance / card）/ `draft`（草稿摘要）。你的 `applyJump(e)` 要把这些映射到自己的视图模型并**直接显示该界面（跳过入场动画或用快速入场均可）**。

## 5. 评审面板

构建注入；你只需在 renderVals 返回 `panel`（`this.panelVals()` 再加 `show`）。面板在手机画面外，不要在产品界面里再放任何评审控件。`CONCEPT.motions` 列出你的三个核心动作（构建自 `concepts/concepts.json`，由主设计负责人填写，你可建议修改）。

## 6. 打印 / 撕票 / 燃烧 的阶段要求

- 出票 / 打印：物件从明确的出口逐步露出（可见“露出—停顿—再露出”的走纸节奏或你的材料逻辑），打印中不显示会让人误以为已完成的操作按钮，完成后票面清晰、与前态材料一致，落定到它在页面中的位置。
- 撕票：从明确的受力点开始（拖拽或长按+拖），渐进断裂（已撕部分与未撕部分可区分）、可见边缘纤维 / 断口、分离部分有重量地垂落 / 移走并落到它的归宿（存根槽 / 历史 / 消失有理由），留下的部分与“已撕票待联系”状态对得上；释放前未过阈值要回弹。不是两张矩形突然分开。
- 燃烧 / 作废（取消这局、票件失效）：从完整票件开始 → 起火点 → 焦边推进、缺口扩大 → 剩余形态（灰烬 / 残片 / 焦痕）→ 明确的失效 / 归档结果；燃烧作用在同一张票件上，不是上面飘几颗橙色粒子，也不是大面积火焰盖住后直接切掉。动画后活动状态、列表位置、剩余票件与动作结果一致。

每个核心动作在你的方案说明（`spec/motion/CNN.md`，你来写）里记录：触发方式、运动对象、起点 / 终点、分段时长、曲线或弹簧参数、变换中心、遮罩、阴影变化、中断 / 重播方式。

## 7. 验证（必须做，不能只看源码）

- `node src/build.js` 后用 `node tools/capture.cjs CNN <outdir> '<actions json>'` 实际操作与截图（参数见文件头注释；动作可 click / drag / jump / wait / shots / eval / scroll）。每次改动后至少跑：参加者默认首屏、局主默认首屏、一个局卡→详情→返回序列、一个管理界面、打印 / 撕票 / 燃烧各一组帧、空态与长标题变体。
- 用 Read 打开 `sheet.png` 逐帧看：有没有文字模糊 / 残影 / 重叠、白块、半空卡住、层级错乱、挤压；不满意就改。`log.json` 里的 errors 必须为空。
- 在 `evidence/CNN/` 保留：`joined-home.png`、`hosted-home.png`、`detail.png`、`manage.png`、`result.png`、以及核心动效的帧序列目录（含 sheet.png）。

## 8. 完成定义

- 索引里每个条目都能跳到并正确显示；每个按钮都有本范围内的视觉结果；返回能回到来源位置；重置可恢复。
- 390×844 下 100% 成立；在 360 与 430 宽下不崩（phone 容器固定 390，但你的布局不要依赖绝对像素到溢出）。
- `node src/build.js` 成功且 `tools/capture.cjs` 的 errors 为空。
- 写好 `spec/motion/CNN.md`（三个核心动作分段 + 关键视觉参数：字体、字号阶、色板、材质规则、圆角 / 阴影 / 边缘规则、布局构图）。

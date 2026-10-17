# 「设置」十套方案 · 概念实现契约（每个方案代理必读）

你负责实现十套「设置」方案中的一套：一个可操作的 390×844 手机画面 + 画面外评审面板，覆盖 `settings/spec/function-map.md` 的全部功能与 `settings/spec/state-contract.md` 的全部规则。读完本文、方向卡（`settings/spec/directions.md` 中你的那一节）、`settings/spec/state-contract.md`、`settings/src/core/jus-data.js`、`settings/src/core/jus-review.js`，以及管线样例 `settings/concepts/src/SC00.dc.html` 再动手。

## 0. 质量标准（来自客户简报 §11–§12，逐条有效）

- **视觉性最重要**：默认首屏必须有明确的视觉主角、构图重心与阅读顺序；身份、标题、分组、当前值、状态、动作不能同时争抢最强层级。不能用巨大头像、巨型英文 SETTINGS 和成排圆角容器代替构图。
- **中文排版**：称呼、微信号、长邮箱、城市、解释文字本身要排得好看；不靠英文样张撑设计；不遍布低对比灰色解释字（说明放在恰当层级，简洁可读）。
- **控件各有表达**：文本编辑、即时开关、选择器、记录列表、帮助内容和危险操作各有自己的形态，不能一律「容器 + 箭头」。二级页、编辑器、弹层、列表、空态、错误态与结果态延续同一方案的设计质量；不能只有首页精致。
- **材质**：从表面、厚度、边缘、接触、受光、遮挡和运动中体现；噪点 / 渐变 / 滤镜 / 阴影只是手段。静止与运动时是同一物件、同一材料；纹理不影响文字清晰度；同一方案的按钮、输入、弹层、记录与结果态属于同一体系。背景服务主体：**禁止**快速循环渐变、持续飘动、噪点粒子抢注意力。
- **动效**：用户能追踪同一内容从哪里来、怎样展开、停在哪里、怎样返回；不让原物件突然消失再淡入无关面板；拖动跟手、有阈值、取消与释放后的归宿；保存结果与数据修改时机一致；动画结束文字清晰（无缩放模糊、白块、残影、错位）；同一时刻一个主动作；高频开关利落，仪式感只留给合适场景；减少动态下状态与结果仍完整。
- **不许的替代**：alert、空弹层、只有 toast、跳到旧稿、按钮缩放代替结果；把改昵称做成撕票、普通开关做成打印、退出登录做成燃烧仪式。
- **语义**：没有公开信用分 / 等级 / 扣分；未出席 ≠ 处罚；只列事实不算「还剩 N 次」；允许通知 ≠ 提醒已送达；复制按真实结果反馈；收藏 ≠ 报名；改浏览城市不搬活动。
- **十套共用完整功能范围**：不能通过删功能、删状态或隐藏入口制造更漂亮的首屏；低频内容可以合理折叠，但必须有正常用户路径可达（不靠无文字图标或隐藏手势）。

## 1. 文件与结构

- 你只写一个文件：`settings/concepts/src/SCNN.dc.html`。构建脚本 `node settings/src/build.js` 注入共享核心并产出 `settings/concepts/project/SCNN.dc.html` 与独立画布 `JU-Settings-Fablo51-10-Concepts.html`。
- 骨架（必须保留四个标记）：

```html
<!doctype html>
<html lang="zh-CN">
<head>
<meta charset="utf-8">
<title>SCNN 方案名</title>
<script src="./support.js"></script>
</head>
<body>
<x-dc>
<helmet>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=...&display=swap">
<style>
body{margin:0}
/* @panel-css */
/* 你的全部 CSS。只用 class / 属性选择器；不用 :root（变量放 .app 根元素）；不用 body 以外的标签全局样式。 */
</style>
</helmet>
<div class="ju-stage">
  <div class="ju-phone">
    <div class="app{{panel.rootCls}}{{userRm}}" style="--k:{{panel.k}};--frame:{{panel.frame}}" ref="{{rootRef}}">
      ……整个产品界面……
    </div>
    <!-- @fx-svg -->
  </div>
  <!-- @panel -->
</div>
</x-dc>
<script type="text/x-dc" data-dc-script data-props='{"panel":{"editor":"boolean","default":true},"preset":{"editor":"enum","options":["home","dense"],"default":"home"},"idle":{"editor":"boolean","default":false},"persist":{"editor":"boolean","default":true},"$preview":{"width":780,"height":884}}'>
/* @core */
class Component extends DCLogic {
  constructor(p) { super(p); this.reviewInit(CONCEPT); if (p.preset === 'dense') { /* 直接打开你信息最密的二级页（无入场动画） */ } }
  initialState(variant) { return Object.assign({}, JUS.baseState(variant), { /* 你的方案私有视图状态 */ }); }
  applyJump(e) { /* 根据 e.open 打开对应界面（§4） */ }
  renderVals() { const panel = this.panelVals(); panel.show = this.props.panel !== false; return { panel, rootRef: this.rootRef, userRm: this.state.data.appearance.reduceMotion ? ' rm-user' : '', /* ... */ }; }
}
JUS.mixin(Component);
</script>
</body>
</html>
```

- 模板语法只有：`{{a.b}}` 点路径（不能写表达式）、`<sc-if value="{{cond}}" hint-placeholder-val="{{false}}">`、`<sc-for list="{{xs}}" as="x" hint-placeholder-count="3">`（可用 `{{$index}}`）、事件 `onClick="{{fn}}"`（也可 onPointerDown / onPointerMove / onPointerUp / onPointerCancel / onInput / onChange / onFocus / onBlur / onKeyDown / onScroll / onAnimationEnd / onTransitionEnd）、`ref="{{someRef}}"`（`{current:null}` 对象）。class、style 可插值。
- 所有计算在 `renderVals()` 里做并以名字暴露；循环项的处理函数绑定在项上。
- 不用 innerHTML / appendChild / document.write 构建 UI；可以在事件里测量（`ev.currentTarget.getBoundingClientRect()`、`this.rootRef.current.querySelector(...)`）做 FLIP。不用全局 keydown。不用 `<iframe>`、`<canvas>`、外部脚本、外部图片；图像只用内联 SVG 或 CSS 绘制；图标用内联描边 SVG，不用 emoji。
- 字体：只能用 Google Fonts `css2` 链接（中文：Noto Sans SC / Noto Serif SC / ZCOOL XiaoWei / ZCOOL QingKe HuangYou / ZCOOL KuaiLe / Ma Shan Zheng / Zhi Mang Xing / Long Cang / Liu Jian Mao Cao；拉丁与数字可配 Archivo / DM Mono / Space Mono / Space Grotesk / Instrument Serif / Fraunces / Syne / Unbounded / Bricolage Grotesque / IBM Plex Mono / Cormorant Garamond / Playfair Display / Manrope / Sora 等；禁用 Inter / Roboto / Arial）。每套最多 3 个字族。
- 所有 id 与 `@property` 自定义属性名带方案前缀（`id="sc03-hole-1"`、`--sc03-ink`），十套同在一个文档里。
- 真实控件：按钮 `<button type="button">`，输入 `<input>` / `<textarea>` + `<label>`，图标按钮加 `aria-label`。文本输入用 `onInput` 把值写进你的编辑态（不要直接改 data）。
- **持续动画**：不要有任何常驻循环动画（背景、呼吸、漂浮）。`idle` 为 true（总览预览）时不要做入场动画，直接呈现落定态。

## 2. 共享核心（构建时注入，`JUS.*`）

- `JUS.data(variant)` / `JUS.baseState(variant)` → `{ variant, data, view:{name:'home'} }`。变体：`default empty many long denied unsupported connected fresh`。
- `JUS.derive.summary(d)`（首页当前值与计数）、`favorites(d)`、`favorite(d,id)`、`feed(d, 'all'|'fav')`（入局接缝）、`mine(d)`（我的局接缝）、`records(d)`、`record(d,id)`、`reports(d)`、`report(d,id)`、`feedback(d)`、`notify(d)`、`privacy(d)`、`about(d)`、`city(d)`、`event(d,id)`、`eventStatus(d,e)`、`isFav(d,id)`。
- `JUS.engine.*`（纯函数，返回 `{data, effect}`）：`favorite / unfavorite / toggleFavorite`、`saveProfile`、`setCity`、`setNotifyPref`、`requestPermission / resolvePermission`、`applySkin`、`setReduceMotion`、`addSupplement`、`fileDispute`、`fileAppeal`、`supplementReport`、`fileReport`、`submitFeedback`、`copyResult`、`endDemoSession / restartDemoSession`。**所有数据变化必须经过引擎**；用 mixin 的 `this.act(name, payload)`（自动 setState + 持久化）并处理 `effect.type`：`error`（失败：保留输入 + 重试）、`invalid`（校验：`effect.errors` 逐字段显示）、其余为成功效果。
- `JUS.COPY / RULES / CITIES / CITY_COPY / SKINS / SKIN_TRANSITION / NOTIFY_CATS / PERMISSIONS / REPORT_STATES / RECORD_STATES / validate`。
- `JU.fx`（`src/core/ju-fx.js`，同包注入）：`rectIn(el, root)`（FLIP 矩形）、`tearProfile / tearClip / tearClipV / scatter / rand`；CSS 原语 `.fx-stamp` 等（`src/core/ju-fx.css`）；`.rm .paused .scrub` 全局态。
- Mixin：`this.after(ms, fn)`（动画落定；随速度缩放、减少动态下 0ms、暂停 / 重置时清除）、`this.hold(ms, fn)`（真实时间窗：toast、撤销、复制反馈；减少动态下不缩短）、`this.holdKey(key, ms, fn)` / `this.afterKey(key, ms, fn)` / `this.cancelKey(key)`（同类窗口一次只一个）、`this.motion(name, fn)`（登记核心动效以便重播；实现 `beforeReplay(name)` 恢复动效前状态）、`this.reset()`、`this.loadVariant(key)`、`this.jumpTo(key)`、`this.setSpeed(x)`、`this.simPermission(v)`、`this.simService()`、`this.armFail()`、`this.rootRef`、`this.persistNow(data)`。
- CSS 时长写法：`transition: transform calc(380ms * var(--k,1)) cubic-bezier(...)`、`animation-duration: calc(600ms * var(--k,1))`；长动效用 keyframes 并支持 `.scrub` 下 `animation-play-state:paused; animation-delay: calc(-1 * var(--frame) * 时长)`。`.rm` 与 `.rm-user` 下所有动画 1ms（评审减少动态 / 用户偏好减少动态都必须直接呈现结果态且可理解）。

## 3. 必须覆盖的界面与状态

| 区域 | 必须有的界面与状态 |
|---|---|
| 首页 | 分组、当前值（称呼 / 微信 / 邮箱验证 / 收藏数 / 城市 / 通知综合状态 / 外观 / 记录数与待核实 / 举报处理中与需补充 / 帮助 / 账户）；需要处理的项有可见提示；进入二级与返回原位置 |
| 个人资料 | 查看页（称呼、微信、邮箱 + 已验证域名 / 未填写）；编辑页（输入、光标、选中、逐字段校验错误 `COPY.profileErrors`、禁用、保存中、失败重试、未保存返回确认）；邮箱改动 → 「发送验证码」→ 6 位码输入（59s 重发倒计时用 `hold`、错码 / 过期提示）→ 验证通过才能保存（`requestEmailCode / verifyEmailCode`；测试码显示在评审面板）；保存后稳定画面；快照说明（`COPY.snapshotNote`） |
| 收藏 | 列表（可报名 / 已结束已取消归档区、跨城市标注、与报名关系标签）；详情（最新状态、联系方式按权限）；取消收藏（相邻让位）、最后一个移除 → 完整空态（`COPY.favEmpty`）、恢复 / 重新收藏；长标题 |
| 城市 | 六城选择、当前值、搜索、无结果（`CITY_COPY`）、作用域说明（`COPY.cityScope`）、返回 |
| 通知 | 六类开关 + 说明（`COPY.prefHint`）；系统权限五态各自画面（`COPY.permission[state]`）；申请流程（请求中 → 系统回答）；提醒服务连接状态；综合「能否送达」结论 |
| 外观 | 三种背景预览（预览不写数据）、应用、取消预览恢复原值；减少动态开关；方案切换 ≠ 换肤 |
| 我的记录（信用记录） | 页顶说明 `COPY.creditSettings`；事实列表（`row.label` + `row.statusLabel`，V27 文案逐字；分「出席记录 / 主动退出 / 安排变化」）；规则文字（`COPY.recordHelp`、`quotaRule`、`quotaNoCount`）；详情（活动、时间、事实、`quotaLabel`、已保存说明条数、补充历史）；「补充与申诉」：补充填写（任何记录）、出席异议（仅未出席记录，一次）、信用申诉（仅主动退出，一次）；保存结果「申诉说明已保存本机，尚未提交审核服务。」；空态 `COPY.creditEmpty` |
| 我的举报 | 列表（活动名 + 状态字 `JUS.REPORT_LABELS`，处理中 / 已处理分区）、详情（状态、活动、举报对象 `whoName`、原文、截图、受理编号 `id`、更新时间、时间线、已提交补充）、仅「需补充」时「补充材料 / 提交补充」（文字 + 添加 / 移除材料）→ 变为「处理中」、失败保留、空态 `COPY.reportsEmpty`；`COPY.reportNote / reportMock` |
| 帮助与反馈 | 帮助内容（从 `JUS.RULES` 组织的问答或章节）、产品反馈填写与提交结果、我的反馈列表；与举报分开 |
| 隐私 | `derive.privacy`：一般规则 + 按活动派生的具体情形；无开关 |
| 账户 | 本机演示说明、退出登录（本地演示）确认 → 执行 → 结果态 → 恢复；危险操作只作用隔离数据 |
| 关于与规则 | 版本（`derive.about`）、规则全文长文阅读（三组）、返回 |
| 接缝 | 入局 01：浏览城市列表（V27 feed 行）、滑动收藏（`JUS.FAV`：死区 6px、轴比 1.25、右滑 >82px 收进 / 左滑 <−82px 拿出、错误方向阻尼 0.26 + 灰洗层 + 「已经收着了 / 还没收藏」、夹 ±190px、回弹 `.5s cubic-bezier(.2,.9,.3,1.04)`、拖动旋转 0.012°/px）、「全部 / 收藏」pill、空态「还没收藏这个城市的局」、未报名详情（局主微信按权限）；我的局：参加 / 发起 / 历史行 + 收藏标记可切换、历史行「不对劲？举报」→ `fileReport`（≥4 字 + 对象 chips 含「（局主）」）→ 回执「可在“设置 → 帮助与反馈”查询进度」→ 设置举报详情 |
| 边界 | 空、长文本、保存失败与重试、权限拒绝 / 不支持、减少动态；360 与 430 宽不崩（phone 容器固定 390；用 `JU_STANDALONE=.build/SCNN.html node settings/tools/widths.cjs SCNN` 出 360 / 390 / 430 三行对照并报告横向溢出；按固定像素摆的场景可在 `componentDidMount` 调 mixin 的 `this.fitWidth(390)`，再给场景容器 `width:390px;transform-origin:0 0;transform:scale(var(--wk,1))`；流式布局的页面用 `calc(100% - …)` 而不是 362px 这类常量） |

## 4. 状态索引与 `applyJump`

`JUS.INDEX` 条目 `open: { surface, id?, state? }`。surface ∈ `home · profile · profile-edit · favorites · favorite-detail · city · notify · appearance · records · record-detail · record-supplement · record-dispute · record-appeal · reports · report-detail · report-supplement · help · feedback · privacy · account · about · rules · seam-feed · seam-feed-detail · seam-mine`；state ∈ `invalid`（资料编辑填入非法值并显示校验）· `saved`（刚保存的稳定画面）· `noresult`（城市搜索无结果）· `requesting`（权限请求中）· `preview`（外观预览 `id` 皮肤）· `confirm`（账户危险操作确认层）· `fav`（接缝只看收藏）· `fail`（已武装失败并触发一次保存，显示失败态）。`applyJump(e)` 要把这些映射到你的视图模型并**直接显示该界面**（跳过入场动画或快速入场均可）。

## 5. 评审面板

构建注入；你只需在 renderVals 返回 `panel`（`this.panelVals()` 再加 `show`）。面板在手机画面外，不要在产品界面里放任何评审控件。`CONCEPT.motions` 是你的三个核心动作（来自 `settings/concepts/concepts.json`，可建议修改）。

## 6. 选择器约定（评审脚本按此操作）

- 覆盖层 / 弹层根元素加类 `scNN-over`；列表行加 `data-rid="{{row.id}}"`；
- 主要动作加 `data-act`：`back · close · open · edit · save · cancel · retry · confirm · discard · keep-editing · toggle · select · preview · apply · fav · unfav · supplement · dispute · appeal · report-supplement · add-material · remove-material · feedback · request-permission · copy · city · skin · reduce-motion · danger · restart · seam-feed · seam-mine · seam-settings`；
- 文本输入加 `data-field="name|wx|email|code|text|search"`；`data-act` 另含 `send-code · verify-code`。

## 7. 动效族（简报 §12，每套都要覆盖本范围内出现的动作）

1 进入设置 / 退出；2 分组展开、二级进入、收起与返回原位置；3 当前值进入编辑器（焦点、输入区、键盘布局接替）；4 开关 / 单选 / 多选 / 选择器状态变化；5 编辑中 → 待保存 → 保存中 → 成功落定 / 失败重试；6 未保存返回、继续编辑、放弃修改；7 外观预览、应用、取消预览恢复；8 收藏加入 / 取消 / 相邻让位 / 最后一项移除与恢复；9 记录或举报详情展开、时间线层级、材料添加、补充保存与回收；10 账户确认、取消、执行与结果；11 正常 / 空 / 加载 / 失败 / 权限受限之间的连续变化。

每套至少三个与自身构造相符的核心动作（`concepts.json`），在正常操作中可触发、可重播、支持 1× / 0.5× 与关键帧。每个关键动效在 `settings/spec/motion/SCNN.md` 记录：触发 → 起始 → 按下 / 受力 → 关键变化 → 内容接替 → 落定 → 返回；运动对象、分段时长、延迟、曲线、位移 / 旋转轴 / 缩放 / 透视 / 变换中心、遮罩与遮挡层级、阴影变化、文字与按钮出现时机，重复点击 / 中断 / 返回 / 重播处理；并分清「当前代码值 / 实际观察 / 建议值」。

## 8. 验证（必须做，不能只看源码）

- 私有构建：`JU_STANDALONE=/home/user/JU/.build/SCNN.html node settings/src/build.js`；截图：`JU_STANDALONE=/home/user/JU/.build/SCNN.html node settings/tools/capture.cjs SCNN <outdir> '<actions json>'`（动作 click / drag / jump / wait / shots / eval / scroll / speed；见文件头）；覆盖：`JU_STANDALONE=... node settings/tools/coverage.cjs SCNN <outdir>`。
- 每次改动后至少跑：首页、资料编辑 → 保存 → 返回、收藏管理取消最后一项 → 空态 → 重新收藏、通知权限申请流程、外观预览 / 取消、记录详情 → 补充保存、举报需要补充 → 补充保存、接缝滑动收藏 → 设置可见、长文本变体、失败重试。用 Read 打开 `sheet.png` 逐帧看（文字模糊 / 残影 / 重叠 / 白块 / 半空卡住 / 层级错乱 / 挤压）；`log.json` 的 errors 必须为空。
- 在 `settings/evidence/SCNN/` 保留 7 类证据：`home.png`、`dense.png`（信息较密的二级）、`favorites.png` + `favorites-after-remove.png`、`record-detail.png` + `record-supplement.png`（或举报）、`saved.png`、`edge.png`（空 / 失败 / 权限受限之一，建议三张都留），以及三个核心动作的帧序列目录（含 `sheet.png`、`log.json`）。

## 9. 完成定义

- `JUS.INDEX` 每个条目都能跳到并正确显示；每个按钮都有与名称一致的结果；返回能回到来源位置；重置可恢复；接缝三处收藏一致（§ 契约 §5 表逐条实际验证）。
- 390×844 下 100% 成立；360 / 430 不崩；长文本不溢出。
- 构建成功，`capture.cjs` 的 errors 为空；`coverage.cjs` 全部状态无错误。
- 写好 `settings/spec/motion/SCNN.md`（三个核心动作分段 + 关键视觉参数：字体、字号阶、色板、材质规则、圆角 / 阴影 / 边缘规则、布局构图）。

## 10. 已验证的模式与坑（来自上一轮与 SC00 管线测试）

- **共享元素展开**：`JU.fx.rectIn(ev.currentTarget, this.rootRef.current)` 取矩形 → `setState({detail:{id, phase:'start', from:r}})` → `this.after(16, …phase:'in')`；**不要用非等比 scale 拉伸文字**：用 `width/height` 或 `clip-path: inset()` 过渡，或对内层做反向缩放；背景层同时退让 / 遮挡 / 失焦。FLIP 在 `start` 渲染后、切到 `in` 前读一次布局（`void el.getBoundingClientRect()`），否则无头浏览器里可能不出现过渡。
- **滑动收藏**：`onPointerDown` 记录起点并 `setPointerCapture`，`onPointerMove` 更新位移（死区 6px 后判定为拖动，拖动中元素 `transition:none`），`onPointerUp` 过阈值 70px 按方向调用 `favorite` / `unfavorite`，否则回弹；拖动过的行要屏蔽随后的 click（`moved` 标记）。行根元素 `touch-action:none; user-select:none`。
- **引擎之后用返回的数据**：`const res = this.act('x', …)`，同一回调里派生要用 `res.data`，不要读 `this.state.data`（setState 异步）。`res.effect.type === 'error'` 显示失败态与重试；`'invalid'` 逐字段显示 `errors`。
- **定时器**：动画落定用 `after`；toast / 撤销 / 复制反馈用 `holdKey('toast', 2600, …)` 等键控窗口，避免「再做一次同类动作」时上一次的定时器提前关闭。
- **持久化**：`act()` 已自动保存到命名空间；视图态（当前页、编辑中的文本）不持久化。
- **失败演示**：面板「下一次保存失败」武装后下一次引擎写入返回 `error`；你的 UI 要显示处理中 → 失败 → 重试 → 成功。不要在界面里放演示控件。
- **燃烧 / mask 相关**：被 mask 元素内部的一切都会被 mask 掉；灰烬放兄弟层。`@property` 名带方案前缀。
- **Shadow DOM**：每套在独立画布里运行在各自的 shadow root；`document.querySelector` 查不到你的元素，用 `this.rootRef.current.querySelector`。
- **预览缩放**：总览预览以 `scale(.5)` 显示；`rectIn` 已按根元素比例换算。
- **惰性入口**：找局 / 开局的完整流程不在本范围：接缝里「去找局」「报名」等按钮保留文字与位置，禁用态或说明「不在本范围演示」，不跳转；但**设置内部**打开的详情、编辑器与记录必须在本方案内完成，不留「看似能用、实际没有结果」的按钮。

## 11. 试点 SC05 冰箱门 补充的坑（2026-10-17）

- **类名碰撞**：方案内所有类名要唯一且不与面板 CSS（`.ju-*`）冲突。SC05 曾把门的退后态写成 `.door.back`，与返回按钮 `.back{width:40px;height:40px}` 撞名，整扇门塌成 40px。给状态类加前缀（`.lifted`、`.scNN-xxx`）。
- **共享元素展开要带内容走**：展开用的层在起点就要显示被拿起物件的内容（SC05 的 `.carry` 层：名片的称呼 / 微信 / 邮箱，白板的几行，字磁贴的字），落定后再交叉淡入页面内容（先淡出 carry，延迟 ≈ 60ms；页头 ≈ 200ms、正文 ≈ 240ms 后淡入），返回时反向。不要让一张空白矩形飞过去。
- **起点矩形**：行内按钮作为点击目标时，用 `ev.currentTarget.closest('.paper')`（整件物件）取起点矩形，不要用按钮自己的小矩形。
- **内联样式 vs 类几何**：`start / out` 阶段用内联 `left/top/width/height` 写起点；`in` 阶段清空内联样式让类决定几何，CSS 过渡会在两者之间插值。切到 `in` 前读一次布局（`void el.getBoundingClientRect()`）。
- **拖动与点击**：横向拖动结束后要屏蔽紧随其后的 click（`_suppressClick = id`）；行根元素 `touch-action:pan-y`（不是 `none`），纵向滚动才不会被吞；`setPointerCapture` 用 try/catch。
- **半高面板**：外观预览时面板只占下半（SC05 `.sheet.in.half`），让被预览的背景可见；面板几何变化本身就是过渡。
- **验证码倒计时**：`holdKey('resend', 1000, tick)` 自链；验证通过时 `cancelKey('resend')`。
- **capture 工具**：`drag` 现在会先 `scrollIntoView`；点击要选到真正带处理函数的元素（`.fcell[data-rid=x] .flyer`，而不是容器 `.fcell`），对容器 `click()` 不会触发子元素的处理函数。
- **证据体积**：抽帧全部完成后运行 `python3 -I settings/tools/shrink-evidence.py SCNN`，把 `motion-*/`、`coverage/` 的 PNG 转成 JPEG（命名状态图保留 PNG）。
- **第二个完整参考实现**：`settings/concepts/src/SC05.dc.html`（约 120 KB）：lift / carry、接缝手势（`feedDown/Move/Up`）、资料编辑与验证码、记录 / 举报表单与草稿保留、索引跳转 `applyJump` 的完整映射。逻辑结构可以借鉴，视觉与运动必须按你自己的方向卡重做。

### §11 补充（十套交付后，来自各构建代理的教训）
- 类名在**方案内部**也要唯一（SC07 的 `.e-fs` 曾与自己的接缝星标撞名）；建议统一前缀 `scNN-`。
- 返回动画要用独立的 `@keyframes` 名：同名关键帧加 `animation-direction: reverse` 不会重启已完成的动画，页面会直接跳到起点（SC09）。
- 用 keyframes 驱动几何（`top` / `translate`）时给该元素 `transition: none`，否则内联 `top` 的过渡会与关键帧叠加（SC03 曾出现袋子先下沉再上移）。
- `derive.feed(d, filter)` 只认 `'fav'` / `'all'`；`JUS.FAV.copy.hintOn/hintOff` 是卡轮用语，列表式接缝可换成「右滑收进收藏 · 左滑拿出」。
- `motion(name, fn)` 只记 fn；重播需要前置状态时把前态挂在 `this.lastMotion.pre`（SC04 做法）。
- 固定像素场景用 `this.fitWidth(390)` + `.wall{width:390px;transform-origin:0 0;transform:scale(var(--wk,1))}`；流式页面用 `calc(100% - …)`。
- 接缝一致性只能用导航串联验证（`jumpTo` 重建数据），见记录 §G「接缝验证方法」。

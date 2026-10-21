# 「设置」R2 · 概念实现契约（每个方案构建代理必读）

R2 = 旧十套（SC01–SC10）全部作废后的重做。本契约只约束**产品语义、共享语言、技术管线与验证**；正文构图、空间比例、中文排版、色彩面积、表面层次与运动编排由各套方向卡（`settings-r2/spec/directions.md`）决定，且必须彼此不同。

## 0. 质量门槛（来自任务书 §2、§7、§8；视觉是独立且必要的门槛，功能完成不能抵消）

1. 整屏有明确、足够有分量的构图与视觉中心；主次、聚散、边缘、空白都经过推敲。不是几十个小盒子、小标签、小边码堆出来的「完成度」。
2. 中文是主角：主标签 / 当前值 / 次要说明 / 状态 / 动作五级清楚；**正文最小字号 13px，功能标签与状态不得低于 12px**；长称呼、长邮箱、多行局名、时间地点真实检查（`long` 变体）。不靠 7–11px 英文、编号、徽章制造设计感；不加口号、诗意标题、解释性灰色小字。
3. 质感 = 表面、边缘、厚度、光线、遮挡、按压反馈之间的一致关系；每套一个光源 / 深度 / 表面逻辑。禁止：模糊正文、持续发光、过强纹理、脏边、颗粒噪声代替丰富度；统一的廉价玻璃卡、软黏土按钮、金属器械皮肤、默认 neumorphism。
4. 画面可以丰富、有色彩、有层次；不得一律退成普通白底设置列表，也不得统一黑白、暗黑、细字、巨大留白。
5. 动效：谁在动、为什么动、从哪里出发、经过什么空间、在哪里停、文字何时可读、能否打断、返回如何连续。按压 80–160ms、常规展开 / 返回 240–420ms 为初始区间；**普通保存不得做 1–2 秒仪式**；禁止每行交错入场、整页弹跳、保存全页脉冲、无意义扫光 / 抖动、返回重放片头、反相闪烁。撕封 / 撕票 / 打印 / 燃烧只属于它们各自的事件语义（本模块没有这些事件，**不要**把它们用于开关、保存、退出）。
6. **二级页、编辑态、列表、详情、确认层都必须由方向卡定义的空间构成生成**：不允许首页精致、二级页回到「返回 + 标题 + 三个输入框 + 取消/保存」的默认模板（旧十套正是这样失败的，见 `baseline-observations.md` §5）。
7. 同一对象前、中、后身份连续：详情回去回到原对象、原滚动位置；变化后的值回到原位置。

## 1. 必须保持的共有语言（任务书 §4）

| 项 | 规格 | 来源 |
|---|---|---|
| 名称与字标 | 「JU」字标职责（出现在页头或根导航的 JU 位置）；中文优先的阅读秩序 | 任务书 |
| 根导航 | 四个根入口「找局 / 开局 / 我的局 / 设置」，设置为当前；语义与顺序不变；形态由方向决定（底栏、侧栏、顶部段、分区首字…都可以） | V27 `rootTabs18` |
| 外层页头比例 | 可见态：主标题 **30px / 500**（行高 1.25），辅助信息 **14px / 400**（`#535b70` 系次级色）；向下滚动时主标题**连续**收拢到 **18px** 并进入工具行（返回 / 动作）中部；回滚恢复。各套可以决定页头的材质、对齐、背景与工具行内容，但 30 → 18 的连续收拢必须实现（`.hd` 用 `clamp()`/scroll 驱动的 `--sp` 变量或 IntersectionObserver 两态过渡 240–420ms） | V27 `title20 / meta21`；任务书 §4 |
| 主要确认动作 | 主 CTA **宽 min(100%, 280px) × 高 48px**，胶囊或由方向决定的圆角；JU 蓝 `#4553BE` 主色 + 顶部高光 / 底部压暗的内外明暗（不是任意蓝色渐变）；按压 `scale(.958)` 80–160ms；**只**用于主要确认（保存资料、提交补充 / 异议 / 申诉 / 反馈、应用外观、开启提醒）；开关、取消、次级动作不得做成主 CTA | V27 `blueCta`、`--ju-action-height:48px` |
| 色彩基底 | 墨 `#14161F`、正文 `#252b3a`、次级 `#535b70`、主色 `#4553BE` / 焦点 `#4A5AD6`、错误 `#DA3A52`、成功 `#0E9B76`；各套在此之上自由决定前景主色面积、冷暖与亮度层级 | V27 |
| 三种外观环境 | `JUS.SKINS`：棉糖 Cotton Candy（粉 / 紫 / 青柔和水面 `#fbe1ec #ececf4 #d3edf3`）、光晕 Halo（暖白上一圈橙到紫 `#ff5005 #dbba95 #d0bce1`）、落日 Sunset（橙 / 蓝 / 黄 `#ff7a33 #33a0ff #ffc53d`）。**每套必须把三种环境做成真实的大面积色光 / 背景（≥ 首屏 35% 面积或整个底层），不是纸色 / 布色 / 壳色的微小染色**；外观页预览 = 当前画面本身随之变化（不是 60×40 色样）；切换过渡 ≈ 650ms `cubic-bezier(.22,1,.36,1)` 透明度 + 模糊（R3），减少动态下瞬切 | R3 `setSkin`；任务书 §4 |
| 语义 | 没有公开信用分；收藏≠报名；举报≠处罚；记录是私有事实；本机演示不冒充真实服务 | 任务书 §4 / §9 |
| 年轻、明亮、有生活感、轻但靠谱 | 允许有张力的深浅与冷暖；不强制统一浅色比例；不把产品改成另一个品牌 | 任务书 §4 |

## 2. 文件与结构（与旧管线相同的四个标记，运行时不变）

- 你写**一个**文件：`settings-r2/concepts/src/SNN.dc.html`（Design 画板格式：`<x-dc>` + `<helmet>` + 模板 + `<script type="text/x-dc" data-dc-script data-props='…'>`），保留四个注入标记：`/* @panel-css */`（面板与 fx 样式）、`<!-- @fx-svg -->`（滤镜定义）、`<!-- @panel -->`（评审面板，渲染在 `.ju-stage` 内、`.ju-phone` 外）、`/* @core */`（共享核心 `JU.fx` + `JUS.*` + `CONCEPT`）。
- 骨架（必须一致，评审脚本按此定位）：
  ```html
  <div class="ju-stage">
    <div class="ju-phone{{panel.phoneCls}}" style="{{panel.phoneStyle}}">
      <div class="app sNN{{panel.rootCls}}" style="--k:{{panel.k}};--frame:{{panel.frame}}" ref="{{rootRef}}" data-skin="{{skin}}"> …你的产品界面… </div>
      <!-- @fx-svg -->
    </div>
    <!-- @panel -->
  </div>
  ```
  `.ju-phone` 的尺寸由面板预设决定（`--pw/--ph`：375×812 / 390×844 / 430×932）；`.app` 必须 `position:absolute; inset:0` 并**真实回流**——禁止 `transform:scale()` 整体缩放、禁止固定 390px 场景（旧 `fitWidth` 已删除）。宽度用百分比 / `minmax()` / `clamp()`。
- 键盘：面板「键盘（模拟 300px）」给 `.ju-phone` 加 `.kb` 并设 `--kb:300px`。有输入的页面必须让**聚焦的输入框与主动作**停留在 `calc(100% - var(--kb))` 之上（底部动作条 `bottom: var(--kb,0px)`；滚动容器 `padding-bottom: calc(var(--kb,0px) + …)`）。`tools/kb-check.cjs` 会检查。
- 减少动态三源：面板开关 `review.rm`、系统 `prefers-reduced-motion`（mixin 监听 → `review.rmSys`，根类 `.rm .rm-sys`）、用户偏好 `data.appearance.reduceMotion`（根类 `.rm-user` 由你加）。三者任一生效时：`this.after()` 归零、CSS 的 `.rm` 规则把时长压到 1ms；**状态与结果必须同样完整**（瞬切即结果）。你的 CSS 只需遵守 `.app.rm *` / `.app.rm-user *` 的时长规则（面板 css 已含 `@media (prefers-reduced-motion: reduce)` 兜底）。
- 类名：全部加前缀 `sNN-`（除骨架类 `app / ju-*`），避免与面板 `.ju-*` 与自身碰撞；`@property` 名带前缀；`id` 带前缀。
- 不要修改任何共享文件（`settings-r2/src/*`、`src/*`、`settings-r2/spec/*` 的共享部分、其他方案）。发现核心缺陷或契约矛盾：写进汇报，不要绕过去改共享文件。

## 3. 共享核心（构建时注入，`JUS.*`；读 `settings-r2/src/core/jus-data.js`）

- `JUS.data(variant)` / `JUS.baseState(variant)`；变体：`default / empty / many / long / denied / unsupported / connected / fresh`。
- `JUS.derive.*`：`summary`（首页当前值与待处理计数）、`favorites / favorite(id)`、`feed(d, 'all'|'fav')`（入局接缝）、`mine`（我的局接缝）、`records / record(id)`、`reports / report(id)`、`feedback`、`notify`（三层：偏好 / 系统权限 / 服务连接 + 送达结论）、`privacy`、`about`、`emailPending`（`resendLeftS / expiresInMs / expired`，基于走时钟）、`city`。
- `JUS.engine.<action>(data, p) → { data, effect }`（纯函数；用 `this.act(name, p)` 调用并**用返回的 `res.data` 派生**）：`favorite / unfavorite / toggleFavorite`、`saveProfile`（校验不通过 → `effect.type='invalid'` + `errors`；改邮箱未验证不能保存）、`requestEmailCode / verifyEmailCode / clearEmailPending`（本机 6 位测试码只显示在面板；59s 重发倒计时真实走时；**5 分钟过期按走时钟真实发生**，面板可「让验证码过期」）、`setCity`、`setNotifyPref / requestPermission / resolvePermission`（系统回答来自面板预设）、`applySkin / setReduceMotion`、`addSupplement / fileDispute / fileAppeal`（记录只追加；异议仅未出席、申诉仅主动退出，各一次）、`supplementReport`（仅「需补充」）、`fileReport`（接缝；新举报 = 已提交，不自动受理）、`submitFeedback`、`copyResult`（真实剪贴板结果 + 面板失败模拟）、`endDemoSession / restartDemoSession`。
- 失败：面板「下一次保存失败」武装后下一次写入返回 `effect.type='error'`（`JUS.COPY.saveFail`）——UI 必须：处理中（≥ 300ms 可见）→ 失败 + 保留输入 + 重试 → 成功落定在原位；重试不产生第二条。
- `JUS.COPY / RULES / RULE_GROUPS / NOTIFY_CATS / PERMISSIONS / SKINS / CITIES / CITY_COPY / FAV / REPORT_LABELS / creditLabel / creditStatus / RECORD_KINDS / POLICY_NOTE`：文案逐字使用（它们来自 V27 / 规则文本），不改写、不发明。
- 时钟：`JUS.now()`（走时）；`JUS.NOW`（数据锚点）。只有过期 / 倒计时 / 「刚刚」类相对时间读 `JUS.now()`。
- 持久化：`this.act()` 成功后自动写命名空间 `jus2:<SNN>:v1`；重置只清本套。

## 4. 必须覆盖的界面与状态（任务书 §9 十五类；索引 `JUS.INDEX` 52 条全部可达，`tools/coverage.cjs` 验证）

1. 概览：身份、待处理项、各入口；`fresh`（新用户）与有数据态；`empty / many / long` 变体。
2. 资料：展示、编辑、校验（称呼 ≤10 字、微信必填与字符、邮箱格式与免费邮箱）、取消、保存、失败保留输入、未保存返回确认（`s-unsaved`）、键盘态（`s-kb`）。
3. 邮箱验证：发送、输入、错误、重发（59s）、**过期与恢复**（`s-profile-code-expired` → 重新发送）；产品内一句「本机演示 · 验证码不发邮件」。
4. 收藏：列表、详情（权限同来源：未撕票看不到局主微信）、已报名标记、取消、空态、较多 / 跨城市 / 长局名；收藏与报名独立。
5. 默认浏览城市：选择、搜索、无结果、当前值与保存反馈；作用域说明（不改已创建 / 已参加活动）。
6. 通知：偏好 / 系统权限 / 送达服务三层分别表达；未请求 / 请求中 / 已允许 / 已拒绝 / 不支持 / 未连接 都有各自画面；申请流程含「系统弹窗」的方案内演出（≤ 420ms 出现）。
7. 外观：三种环境的真实预览与应用（预览不写数据；应用写；取消恢复）；减少动态开关；系统偏好协调（页面写明「跟随系统」状态）。
8. 记录：列表、详情（未出席 · 待核实 / 主动退出 / 安排变化）、补充（含本机文件名材料）、异议、申诉、草稿按对象隔离、空态。
9. 举报：列表、详情（状态 / 对象 / 原文 / 材料 / 本地编号 / 时间线）、需补充 → 补充、草稿、空态。
10. 帮助与反馈：帮助内容（18 条规则 + 常见问题）、反馈输入、提交演示、失败恢复、我的反馈。
11. 隐私：按真实规则与你的活动派生的具体情形；无伪造开关。
12. 账户：「退出登录（本地演示）」确认 → 执行 → 结束态 → 重新开始；本机数据说明；不冒充注销。
13. 关于 / 规则全文（长文阅读路径、版本、本地演示说明）。
14. 接缝：入局 01 列表（滑动收藏，V27 参数 `JUS.FAV`：右滑 >82px 收进、左滑 <−82px 拿出、错误方向阻尼 ×0.26 + 文案）、只看收藏、未报名详情；我的局列表（收藏标记）+ 从历史行发起举报并回到正确的局。
15. 画面外评审工具：面板已提供（速度 / 暂停 / 关键帧 / 减少动态 / 尺寸 / 键盘 / 索引 / 变体 / 失败 / 权限 / 时钟 / 重置 / 重播）。你要实现 `applyJump(e)`（`e.open.surface / state / id`）把 52 条索引映射到你的界面，并在 `motion(name, fn)` 里登记三个核心动作供重播。

## 5. 选择器约定（评审脚本按此操作）

`data-act="save|submit|cancel|back|toggle|skin|fav|unfav|copy|request|apply|preview|confirm|retry|resend|verify"`，`data-field="name|wx|email|code|text|search"`，`data-rid="<eventId|recordId|reportId>"`，覆盖层根 `.sNN-over`，当前页根 `data-surface="<surface>"`。开关元素 `role="switch" aria-checked`。

## 6. 验证（必须做；不能只看源码）

```
JU_STANDALONE=/home/user/JU/.build/SNN.html JUS_ONLY=SNN node settings-r2/src/build.js
JU_STANDALONE=/home/user/JU/.build/SNN.html node settings-r2/tools/coverage.cjs SNN /home/user/JU/settings-r2/evidence/SNN/coverage      # 52/52, errors []
JU_STANDALONE=/home/user/JU/.build/SNN.html node settings-r2/tools/widths.cjs SNN                                                        # overflow [], fontInvariance [], minFont ≥ 12
JU_STANDALONE=/home/user/JU/.build/SNN.html node settings-r2/tools/kb-check.cjs SNN                                                      # findings []
JU_STANDALONE=/home/user/JU/.build/SNN.html node settings-r2/tools/rm-check.cjs SNN                                                      # rmSys true, findings []
JU_STANDALONE=/home/user/JU/.build/SNN.html node settings-r2/tools/capture.cjs SNN /home/user/JU/settings-r2/evidence/SNN/<flow> '<actions>'
python3 -I settings-r2/tools/shrink-evidence.py SNN
```
必做的 capture 流程（每个都 Read `sheet.png` 逐帧看）：`flow-enter`（从根导航进入设置 → 滚动页头收拢 → 回滚）、`flow-profile`（进入资料 → 编辑 → 校验失败 → 改邮箱 → 发码 → 错码 → 对码 → 保存 → 新值回到原位 → 返回原滚动位置）、`flow-fail`（武装失败 → 保存 → 失败保留输入 → 重试成功）、`flow-notify`（申请权限 → 系统弹窗 → 允许；拒绝预设再来一次）、`flow-skin`（预览三种环境 → 应用 → 取消）、`flow-fav`（接缝右滑收藏 → 设置首页计数 → 收藏列表 → 取消 → 空态（empty 变体））、`flow-record`（记录详情 → 补充 → 保存 → 异议）、`flow-account`（确认 → 退出 → 重新开始）、`flow-unsaved`（编辑 → 返回 → 继续编辑 / 放弃）。以 1× 为准看节奏，0.5× 只用于看中间帧。

## 7. 完成定义

- 覆盖 52/52、0 错误；widths / kb / rm 三个检查无 findings；最小字号 ≥ 12px。
- 九个流程的接触表存在且你自己看过；三个核心动作可重播、可暂停、可关键帧。
- 方案源文件 ≤ 160 KB；无面板控件泄漏到手机内（`grep -c "armFail\|simPermission\|variant" SNN.dc.html` 只出现在面板注入处）；禁用词（扣分 / 信用分 / 年度剩余 / 剩余次数）为 0。
- `settings-r2/spec/motion/SNN.md`：三个核心动作的分段（触发 → 发展 → 落定 → 返回；时长 / 曲线 / 谁动）+ 关键视觉参数（字体、字号阶、色板、光源 / 表面规则、页头收拢实现）+ 「一个仍可能失败的设计判断与你如何检查」。
- 汇报 ≤ 40 行：文件与大小、各检查结果、九个流程的证据路径、自检十问（见 `builder-brief.md`）、对共享核心的问题。

## 8. 已验证的模式与坑（继承自上一轮，仍然有效）

- 共享元素展开：起点矩形 `JU.fx.rectIn(el, this.rootRef.current)` → `phase:'start'` 渲染 → 读一次布局 → `phase:'in'`；**不要非等比 scale 文字**；展开层从起点就带内容；返回反向到原对象。
- 引擎之后用返回的数据（`res.data`），不要在同一回调里读 `this.state.data`。
- 定时器：动画落定 `this.after()`（受速度 / 减少动态影响）；toast / 撤销 / 倒计时用 `this.holdKey(key, ms, fn)`（真实时间窗，不被减少动态压缩）；验证码倒计时 `holdKey('resend', 1000, tick)` 自链，验证通过时 `cancelKey('resend')`。
- Shadow DOM：用 `this.rootRef.current.querySelector`，不用 `document.querySelector`。
- 拖动与点击：横向拖动后屏蔽紧随的 click；行根 `touch-action:pan-y`；`setPointerCapture` 用 try/catch。
- 返回动画用独立 `@keyframes` 名；keyframes 驱动几何的元素 `transition:none`。
- `jumpTo` 会重建数据：跨模块一致性用方案自己的导航串联验证（capture 的 click），不要用 jump 串联。
- 材质 / 滤镜不得影响文字清晰度；被 mask 的元素内部一切都被 mask。

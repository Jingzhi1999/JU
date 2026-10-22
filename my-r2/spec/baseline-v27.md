# V27 基线实测规格（用户入局评审画布 · 共有语言提取）

基线 B：`/home/user/JU/.build/baseline/V27.html`（29.7 MB，完整 base64）；行号引用一律用去掉 base64 的副本 `V27.code.html`（9.3 MB，4765 行；两份文件行数相同、行号一一对应）。应用脚本 `<script type="text/x-dc">` 从 V27.code.html L1689 开始，文中 "V27:NNNN" 均为 V27.code.html 行号。

实测环境：Playwright + chromium-1194（/opt/pw-browsers，headless，`--use-angle=swiftshader`），`?view=product`，viewport 390×844，deviceScaleFactor 2，PNG。屏幕通过 V27 自带的 fixture 路径激活（`JU_APP.resetScreen19(id)` → `JuLedger.fixture(id)`，该方法只在 review 视图放行，脚本在同一同步调用里临时把 `html[data-view]` 切到 review 再切回 product）。驱动脚本：`scratchpad/v27/shoot.cjs`；原始数据：`my-r2/evidence/baseline/v27/measurements.json`。

每个数字后标注来源：**[CS]** = getComputedStyle；**[BR]** = getBoundingClientRect（相对 .ju-phone 左上角，单位 CSS px）；**[SRC]** = 源码原文（V27.code.html / 解码模块）；**[INL]** = JS 写入的内联 style（syncHeader23 等）。

### 环境限制（必须先读）
- swiftshader 软件 WebGL：Cotton Candy 一帧耗时 0.25–1.4 s（`JU_COTTON.diagnostics().meanRenderMs`），所有基于时间的动画（纸封 unfold、卡片翻面、卡栈回弹）在无头环境里慢 20–60 倍；因此截图分两类：几何/状态驱动的帧（滚动收拢、按压保持、拖拽保持、手动设定角度）可信；时间采样帧只记录数值（见各节），不以截图代表动效速度。
- 门口撕封（s02）阶段在 `prefers-reduced-motion: reduce` 下执行（纸封释放用 .01 s，棉花糖背景只画一帧），**标题收拢的几何与 reduced-motion 无关**（syncHeader23 只看 scrollTop）；该阶段截图的背景是静止帧、卡片不自转。标注于 `measurements.json → header2.reducedMotion`。
- s04（等待确认）与信封类舞台（ju-envelope.js）在 swiftshader 下把背景画成黑色：ju-envelope.js L191-L197 `background()` 会把同屏 `cotton-bg canvas` 作为背景纹理（`alpha:false` 上下文），无头环境里棉花糖尚未出帧时纹理为空 → 黑底。这是环境现象，不是 V27 设计；真机上信封舞台叠在棉花糖之上。

## 1. 外层标题 · 辅助行 · 返回/工具 · 连续吸顶

### 1.1 源码构造 [SRC]
- 文本角色：`title20()` V27:4214 → font 30px / 500 / line-height 1.25 / letter-spacing 0 / #14161f / overflow-wrap anywhere；`meta21()` V27:4215 → 14px / 400 / 1.5 / #535b70；壳 `header21()` V27:4216 → position sticky top 0 z-index 12 column gap 9 margin-bottom 13 background transparent。`titleShrink/subCollapse/stickyShell`（V27:4120-4122）只是转发到这三个静态样式——收拢不在这里。
- 收拢实现：`syncHeader23(scroll,h)` V27:4457-4476（由 componentDidUpdate → sync22() V27:1946/4477 每次渲染调用；滚动事件 `onS05Scroll` 等 V27:2480 只在 |Δ|>2px 时 setState）。进度 `p = headP(scrollTop) = clamp((scrollTop-4)/84, 0, 1)` V27:4119 → **触发区间 scrollTop 4px→88px，线性**，每帧重算；元素上的 `transition: … .1s linear` 只做帧间平滑。
- 标题内联写入（V27:4467-4468）：`top = 53 − 40.45p` px，`font-size = 30 − 12p` px（**30 → 18**），`line-height 1.05`，`max-width = w − 104p`（w = header 宽 346 → 收拢后 242），`left = w·p/2` + `translateX(−50p%)`（p=1 时水平居中），`white-space: p===1 ? nowrap : normal` + ellipsis。
- 辅助行（V27:4472）：`top = 53 + (th+9)(1−p) − 9p`，`height = 42(1−p)`，`opacity = 1−p`（th = 标题在 30px/1.05 下量得的自然高度：单行 31.5，双行 63，V27:4470 用隐藏探针测量，按 文本|宽度|fonts.status 缓存）。
- 进度块（V27:4473）：`top = 53 + (progressTop−53)(1−p)`，progressTop = 53+th+9+42+9；header 高度恒定为 progressTop+ph（V27:4474，"flow extent 稳定，滚动范围不随收拢变化"），`--ju-head-visible = 53+(progressTop−53)(1−p)+ph` 供 ::before 毛玻璃与票根 clip-path 使用（V27:4482）。
- 工具行：返回键 `backPillStyle` V27:2520-2523 = 44×44 圆、rgba(255,255,255,.34) + backdrop-filter blur(16px) saturate(1.6)、四层 inset 高光描边 + 两层外投影，按压 `style-active="transform:scale(.9)"`，悬停背景 .5；它处于 header 顶部（top 0），所以**工具行 = 0–44px，中心 22px**；弱动作（去不了了）是 header 外的 absolute 元素：`top: var(--ju-content-top)`, right 18, 高 44（V27:4314）——与返回键同一水平带。
- 收拢终点几何（源码推导）：标题 top 12.55px，字号 18 × 1.05 = 18.9px 高 → 标题中心 = 12.55 + 9.45 = **22.0px = 工具行中心**，即"收至 18px 并进入工具行中部"在源码上严格成立。
- 顶距：product 视图 `--ju-content-top:24px`（V27:173；review 画布 66px）；滚动容器 `[data-scroll22]` top=24, padding-top 0（V27:297），padding-bottom = `--ju-footer-clearance`（页脚可见时 footer 高+24，否则 28 / s06g 54，V27:4484）。

### 1.2 实测（390×844，product 视图）

静态态公共值 [CS]：标题 font-family `"Noto Sans SC", "Microsoft YaHei", "PingFang SC", sans-serif`，30px / 500 / line-height 31.5px(=1.05，syncHeader23 写入) / letter-spacing normal / rgb(20,22,31)；辅助行 14px / 400 / 21px / rgb(83,91,112)；返回键 44×44 at (22,24)，background rgba(255,255,255,.34)，backdrop-filter blur(16px) saturate(1.6)。标题左边 22px（= 滚动容器 padding 22），标题 rect.y 77 = 24（content-top）+ 53（内联 top）。

#### s05「已预留」（固定标题 + 辅助行 + 进度块；reduced-motion 下复测，computed 与内联一致）

| 帧 | scrollTop | p | 标题 font-size [INL/CS] | 标题 line-height [CS] | 标题 top(内联)/rect.y [INL/BR] | 标题 x,w,h [BR] | max-width [INL] | 行数/th | 辅助行 height·opacity [CS] | 辅助行 rect.y [BR] | 返回键 rect [BR] | 进度块 top [INL] | --ju-head-visible |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| p000 | 0 (max 64) | 0 | 30px / 30px | 31.5px | 53px / 77 | 22, 90, 31.5 | 346px | 1 / 32 | 42px · 1 | 118 | 22,24 44×44 | 145px | 191px |
| p025 | 25 (max 64) | 0.25 | 27px / 27px | 28.35px | 42.8875px / 66.88 | 55.13, 81, 28.34 | 320px | 1 / 32 | 31.5px · 0.75 | 105.5 | 22,24 44×44 | 122px | 168px |
| p050 | 46 (max 64) | 0.5 | 24px / 24px | 25.2px | 32.775px / 56.77 | 90.5, 72, 25.19 | 294px | 1 / 32 | 21px · 0.5 | 93 | 22,24 44×44 | 99px | 145px |
| p075 | 64 (max 64) | 0.714 | 21.4286px / 21.4286px | 22.5px | 24.1071px / 48.09 | 122.63, 64.22, 22.48 | 271.714px | 1 / 32 | 12px · 0.285714 | 82.28 | 22,24 44×44 | 79.2857px | 125.28571428571428px |
| p100 | 64 (max 64) | 0.714 | 21.4286px / 21.4286px | 22.5px | 24.1071px / 48.09 | 122.63, 64.22, 22.48 | 271.714px | 1 / 32 | 12px · 0.285714 | 82.28 | 22,24 44×44 | 79.2857px | 125.28571428571428px |

#### s02 门口（活动标题「深夜救急火锅局」为外层标题；真实撕封后的 door 态；截图 header-s02-door-p000/p050/p100）

| 帧 | scrollTop | p | 标题 font-size [INL/CS] | 标题 line-height [CS] | 标题 top(内联)/rect.y [INL/BR] | 标题 x,w,h [BR] | max-width [INL] | 行数/th | 辅助行 height·opacity [CS] | 辅助行 rect.y [BR] | 返回键 rect [BR] | 进度块 top [INL] | --ju-head-visible |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| p000 | 0 (max 50) | 0 | 30px / 30px | 31.5px | 53px / 77 | 22, 210, 31.5 | 346px | 1 / 32 | 42px · 1 | 118 | 22,24 44×44 |  | 191px |
| p025 | 25 (max 50) | 0.25 | 27px / 27px | 28.35px | 42.8875px / 66.88 | 41.63, 189, 28.34 | 320px | 1 / 32 | 31.5px · 0.75 | 105.5 | 22,24 44×44 |  | 168px |
| p050 | 46 (max 50) | 0.5 | 24px / 24px | 25.2px | 32.775px / 56.77 | 66.5, 168, 25.19 | 294px | 1 / 32 | 21px · 0.5 | 93 | 22,24 44×44 |  | 145px |
| p075 | 50 (max 50) | 0.548 | 23.4286px / 23.4286px | 24.6px | 30.8488px / 54.84 | 71.87, 163.86, 24.58 | 289.048px | 1 / 32 | 19px · 0.452381 | 90.61 | 22,24 44×44 |  | 140.61904761904762px |
| p100 | 50 (max 50) | 0.548 | 23.4286px / 23.4286px | 24.6px | 30.8488px / 54.84 | 71.87, 163.86, 24.58 | 289.048px | 1 / 32 | 19px · 0.452381 | 90.61 | 22,24 44×44 |  | 140.61904761904762px |
| p100b | 50 (max 50) | 0.548 | 23.4286px / 23.4286px | 24.6px | 30.8488px / 54.84 | 71.87, 163.86, 24.58 | 289.048px | 1 / 32 | 19px · 0.452381 | 90.61 | 22,24 44×44 |  | 140.61904761904762px |

#### s02 门口 · 多行标题样例「周五深夜法拉盛救急火锅局」（经 V27 自带 JuLedger.fixture 构造的 12 字标题；截图 header-s02-longtitle-*）

| 帧 | scrollTop | p | 标题 font-size [INL/CS] | 标题 line-height [CS] | 标题 top(内联)/rect.y [INL/BR] | 标题 x,w,h [BR] | max-width [INL] | 行数/th | 辅助行 height·opacity [CS] | 辅助行 rect.y [BR] | 返回键 rect [BR] | 进度块 top [INL] | --ju-head-visible |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| p000 | 0 (max 159) | 0 | 30px / 30px | 31.5px | 53px / 77 | 22, 346, 63 | 346px | 2 / 63 | 42px · 1 | 149 | 22,24 44×44 |  | 176px |
| p050 | 46 (max 81) | 0.5 | 24px / 24px | 25.2px | 32.775px / 56.77 | 36.5, 288, 25.19 | 294px | 1 / 63 | 21px · 0.5 | 108.5 | 22,24 44×44 |  | 160.5px |
| p100 | 81 (max 81) | 0.917 | 19px / 19px | 19.95px | 15.9208px / 39.91 | 76.07, 228.02, 19.94 | 250.667px | 1 / 63 | 3.5px · 0.0833333 | 74.75 | 22,24 44×44 |  | 109.25px |
| p100b | 81 (max 81) | 0.917 | 19px / 19px | 19.95px | 15.9208px / 39.91 | 76.07, 228.02, 19.94 | 250.667px | 1 / 63 | 3.5px · 0.0833333 | 74.75 | 22,24 44×44 |  | 109.25px |

#### s05（首轮，无 reduced-motion；computed 列因 swiftshader 掉帧而滞后一帧，以内联列为准）

| 帧 | scrollTop | p | 标题 font-size [INL/CS] | 标题 line-height [CS] | 标题 top(内联)/rect.y [INL/BR] | 标题 x,w,h [BR] | max-width [INL] | 行数/th | 辅助行 height·opacity [CS] | 辅助行 rect.y [BR] | 返回键 rect [BR] | 进度块 top [INL] | --ju-head-visible |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| p000 | 0 (max 64) | 0 | 30px / 30px | 31.5px | 53px / 77 | 22, 90, 31.5 | 346px | 1 / 32 | 42px · 1 | 118 | 22,24 44×44 | 145px | 191px |
| p025 | 25 (max 64) | 0.25 | 27px / 30px | 31.5px | 42.8875px / 77 | 22, 90, 31.5 | 320px | 1 / 32 | 42px · 1 | 118 | 22,24 44×44 | 122px | 168px |
| p050 | 46 (max 64) | 0.5 | 24px / 30px | 31.5px | 32.775px / 77 | 22, 90, 31.5 | 294px | 1 / 32 | 42px · 1 | 118 | 22,24 44×44 | 99px | 145px |
| p075 | 64 (max 64) | 0.714 | 21.4286px / 24px | 25.2px | 24.1071px / 56.77 | 90.5, 72, 25.19 | 271.714px | 1 / 32 | 21px · 0.5 | 93 | 22,24 44×44 | 79.2857px | 125.28571428571428px |
| p100 | 64 (max 64) | 0.714 | 21.4286px / 24px | 25.2px | 24.1071px / 56.77 | 90.5, 72, 25.19 | 271.714px | 1 / 32 | 21px · 0.5 | 93 | 22,24 44×44 | 79.2857px | 125.28571428571428px |
| p100b | 64 (max 64) | 0.714 | 21.4286px / 21.4286px | 22.5px | 24.1071px / 48.09 | 122.63, 64.22, 22.48 | 271.714px | 1 / 32 | 12px · 0.285714 | 82.28 | 22,24 44×44 | 79.2857px | 125.28571428571428px |

#### s06g（首轮，无 reduced-motion；computed 列因 swiftshader 掉帧而滞后一帧，以内联列为准）

| 帧 | scrollTop | p | 标题 font-size [INL/CS] | 标题 line-height [CS] | 标题 top(内联)/rect.y [INL/BR] | 标题 x,w,h [BR] | max-width [INL] | 行数/th | 辅助行 height·opacity [CS] | 辅助行 rect.y [BR] | 返回键 rect [BR] | 进度块 top [INL] | --ju-head-visible |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| p000 | 0 (max 38) | 0 | 30px / 30px | 31.5px | 53px / 77 | 22, 180, 31.5 | 346px | 1 / 32 | 42px · 1 | 118 | 22,24 44×44 | 145px | 191px |
| p025 | 25 (max 38) | 0.25 | 27px / 30px | 31.5px | 42.8875px / 77 | 22, 180, 31.5 | 320px | 1 / 32 | 42px · 1 | 118 | 22,24 44×44 | 122px | 168px |
| p050 | 38 (max 38) | 0.405 | 25.1429px / 30px | 31.5px | 36.6274px / 77 | 22, 180, 31.5 | 303.905px | 1 / 32 | 42px · 1 | 118 | 22,24 44×44 | 107.762px | 153.76190476190476px |
| p075 | 38 (max 38) | 0.405 | 25.1429px / 25.1429px | 26.4px | 36.6274px / 60.63 | 61.5, 150.77, 26.39 | 303.905px | 1 / 32 | 25px · 0.595238 | 97.75 | 22,24 44×44 | 107.762px | 153.76190476190476px |
| p100 | 38 (max 38) | 0.405 | 25.1429px / 25.1429px | 26.4px | 36.6274px / 60.63 | 61.5, 150.77, 26.39 | 303.905px | 1 / 32 | 25px · 0.595238 | 97.75 | 22,24 44×44 | 107.762px | 153.76190476190476px |
| p100b | 38 (max 38) | 0.405 | 25.1429px / 25.1429px | 26.4px | 36.6274px / 60.63 | 61.5, 150.77, 26.39 | 303.905px | 1 / 32 | 25px · 0.595238 | 97.75 | 22,24 44×44 | 107.762px | 153.76190476190476px |

读数要点：
- 各屏 `[data-scroll22]` 可滚动范围 [BR]（scrollHeight−clientHeight，默认 fixture）：s02=144, s03b=44, s05=64, s06g=38, s06=48, s09=222, s11=0；door 态 s02 实测 50（默认 7 字标题）/ 81（12 字双行标题）。收完需要 scrollTop ≥ 88：**390×844 下没有一个默认 fixture 屏能到 p=1**（s05 最多 p≈0.71，s06g 0.40，s06 0.52，s03b 0.48，s02 door 0.55，s02 双行标题 0.92）。任务书「必须复核实际画面」的结论：源码曲线正确，但实际画面只走到一半到九成；p=1 的终点只能在更矮视口（如 390×667）或更长名单下出现。
- 收拢终点（p=1）的实测只能在更矮视口取得（390×667，见上表 header3）：标题 18px / 18.9px 行高、top 12.55 → 中心 22px = 工具行（返回键 0–44px）中心；max-width 242px、nowrap+ellipsis、水平居中；辅助行 height 0 / opacity 0；进度块贴到 header 顶部 53px 处。
- 多行标题：V27 默认数据里最长的活动名是 9 字（「川菜辣度分级评审团」，270px < 346px），不会换行；双行样例用 12 字标题构造。双行时 th=63，辅助行/进度块相应下移 31.5px，收拢终点仍回到工具行中部（nowrap + ellipsis 单行）。

## 2. 主要 CTA（冷蓝光感药丸）

### 2.1 构造清单 [SRC]（`blueCta(on)` V27:1863-1870；HTML L660 / L809 / L1102 / L1410；文字 / 高光 V27:2518-2519）

| 层 | 作用 | 原文 |
|---|---|---|
| 盒 | 宽 `min(100%,280px)`，高 48，`border-radius:999px`，overflow hidden，flex 居中，`align-self:center`，color #fff | V27:1865 |
| 1 底色 | `backgroundColor:#8DB1F2` | V27:1866 |
| 2 渐变（8 层 backgroundImage，上到下按声明顺序叠） | ① radial 58%×44% @31% 99%：底边左青白高光 rgba(211,246,253,.97)→0 ② radial 50%×42% @55% 102%：底边中 rgba(183,236,253,.86) ③ radial 54%×44% @85% 100%：底边右 rgba(166,213,252,.88) ④ radial 50%×62% @20% 4%：顶边左 rgba(163,195,253,.92) ⑤ radial 52%×58% @55% 2%：顶边中 rgba(150,188,251,.9) ⑥ radial 54%×66% @87% 4%：顶边右钴蓝 rgba(129,172,252,.96) ⑦ radial 46%×70% @6% 54%：左侧补光 rgba(158,198,248,.6) ⑧ linear 178deg：rgba(150,186,252) 0% → (126,166,240) 30% → (122,166,232) 56% → (176,226,250) 86% → (181,238,253) 100%（主体：上钴蓝、下青白） | V27:1867 |
| 3 边缘与内外明暗（6 层 box-shadow） | inset 0 0 18px 9px rgba(58,104,178,.2)（内晕，压暗四周）；inset 0 0 0 1px rgba(255,255,255,.62)（1px 白描边）；inset 0 1px 0 rgba(240,248,255,.72)（顶 1px 高光）；inset 0 −6px 12px −8px rgba(209,246,255,.8)（底部青白内光）；0 0 0 1px rgba(172,204,252,.62)（外 1px 淡蓝描边）；0 8px 20px −12px rgba(146,186,238,.4)（外投影） | V27:1868 |
| 4 高光条 `<span>` | absolute left/right 14 top 3 高 13 圆角 999，180deg 白 .62→0，pointer-events none | ctaGlossStyle V27:2519 |
| 5 文字 `<span>` | **实测 15px / 500 / letter-spacing normal**：基础 ctaTextStyle 为 14.5px/.06em（V27:2518），但 vals18 的 ctaTextStyle（V27:4317 `{position:relative,fontFamily:var(--ju-font-ui),fontSize:15,fontWeight:500}`）在 renderVals 合并时覆盖它 | V27:2518 / V27:4317 |
| 6 按压 | HTML `style-active="transform:scale(.958)"` → support.js 生成 `.scpN:active{transform:scale(.958)!important}`（collectProps L428-430 / createPseudoSheet L1568-1589）；回弹由 `transition: transform .48s cubic-bezier(.18,1.5,.36,1), box-shadow .48s …` 提供（过冲 1.5 的 spring 近似） | V27:1869 + L660 |
| 7 禁用 | `blueCta(false)`：同尺寸，cursor not-allowed，color #626777，background rgba(20,22,31,.055)，box-shadow inset 0 0 0 1px rgba(20,22,31,.1)，`transition: all .4s ease`；aria-disabled 由业务值给（如 s05Busy V27:4342） | V27:1864 |
| 不存在的层 | 无 ::before/::after、无 SVG、无 filter、无 border、无 blur；"光感"全部由 ②③ 的 radial 渐变 + ③ 的 inset 阴影构成 | 全文检索 |

页脚（CTA 的容器）：`[data-footer22]` absolute 底栏（L657）→ `barFadeStyle` 20px 透明垫 + `barPadStyle` padding `0 22px var(--ju-bottom-pad,46px)`（product 视图 --ju-bottom-pad:20px，L173）gap 10 居中（V27:2515-2516）；页脚有可见按钮时加 `.ju-footer-active22` 的 #f2f4fb 渐变底（L284，sync22 V27:4484）。

### 2.2 三状态实测 [CS/BR]（s05「阅读细则」CTA；截图 cta-default / cta-pressed / cta-disabled；在 prefers-reduced-motion 下截取——材质为静态渐变不受影响，按压过渡被 CSS 压到 80ms 但终态 scale(.958) 相同）

- **默认**：文案「阅读细则」aria-disabled=false；rect x=55 y=776 w=280 h=48 [BR]；width 280px height 48px radius 999px color rgb(255, 255, 255) cursor pointer [CS]；background-color rgb(141, 177, 242)；box-shadow `rgba(58, 104, 178, 0.2) 0px 0px 18px 9px inset, rgba(255, 255, 255, 0.62) 0px 0px 0px 1px inset, rgba(240, 248, 255, 0.72) 0px 1px 0px 0px inset, rgba(209, 246, 255, 0.8) 0px -6px 12px -8px inset, rgba(172, 204, 252, 0.62) 0px 0px 0px 1px, rgba(146, 186, 238, 0.4) 0px 8px 20px -12px`；transform `none`；transition `transform 0.08s cubic-bezier(0.18, 1.5, 0.36, 1), box-shadow 0.08s cubic-bezier(0.18, 1.5, 0.36, 1)`
  - 高光条 rect(相对按钮) {'x': 14, 'y': 3, 'w': 252, 'h': 13}，background `linear-gradient(rgba(255, 255, 255, 0.62), rgba(255, 255, 255, 0))`
  - 文字 15px / 500 / normal / rgb(255, 255, 255)，rect {'x': 109.98, 'y': 12.75, 'w': 60.02, 'h': 22.5}
  - 生成的 :active 规则：`.scp8:active { transform: scale(0.958) !important; }`
  - 页脚 rect {'x': 0, 'y': 756, 'w': 390, 'h': 88}，pad padding `0px 22px 20px`，--ju-bottom-pad `20px`
  - background-image（computed 前 300 字）：`radial-gradient(58% 44% at 31% 99%, rgba(211, 246, 253, 0.97) 0%, rgba(196, 238, 252, 0.58) 36%, rgba(178, 224, 250, 0) 66%), radial-gradient(50% 42% at 55% 102%, rgba(183, 236, 253, 0.86) 0%, rgba(178, 226, 251, 0.4) 42%, rgba(176, 228, 251, 0) 70%), radial-gradient(54% 44% at 85% 100%, rgba(166, 2…`（共 8 层）
- **按压保持（page.mouse.down 650ms 后）**：文案「阅读细则」aria-disabled=false；rect x=60.88 y=777.01 w=268.24 h=45.98 [BR]；width 280px height 48px radius 999px color rgb(255, 255, 255) cursor pointer [CS]；background-color rgb(141, 177, 242)；box-shadow `rgba(58, 104, 178, 0.2) 0px 0px 18px 9px inset, rgba(255, 255, 255, 0.62) 0px 0px 0px 1px inset, rgba(240, 248, 255, 0.72) 0px 1px 0px 0px inset, rgba(209, 246, 255, 0.8) 0px -6px 12px -8px inset, rgba(172, 204, 252, 0.62) 0px 0px 0px 1px, rgba(146, 186, 238, 0.4) 0px 8px 20px -12px`；transform `matrix(0.958, 0, 0, 0.958, 0, 0)`；transition `transform 0.08s cubic-bezier(0.18, 1.5, 0.36, 1), box-shadow 0.08s cubic-bezier(0.18, 1.5, 0.36, 1)`
  - 高光条 rect(相对按钮) {'x': 13.41, 'y': 2.87, 'w': 241.42, 'h': 12.45}，background `linear-gradient(rgba(255, 255, 255, 0.62), rgba(255, 255, 255, 0))`
  - 文字 15px / 500 / normal / rgb(255, 255, 255)，rect {'x': 105.37, 'y': 12.21, 'w': 57.49, 'h': 21.56}
  - 生成的 :active 规则：`.scp8:active { transform: scale(0.958) !important; }`
  - 页脚 rect {'x': 0, 'y': 756, 'w': 390, 'h': 88}，pad padding `0px 22px 20px`，--ju-bottom-pad `20px`
  - background-image（computed 前 300 字）：`radial-gradient(58% 44% at 31% 99%, rgba(211, 246, 253, 0.97) 0%, rgba(196, 238, 252, 0.58) 36%, rgba(178, 224, 250, 0) 66%), radial-gradient(50% 42% at 55% 102%, rgba(183, 236, 253, 0.86) 0%, rgba(178, 226, 251, 0.4) 42%, rgba(176, 228, 251, 0) 70%), radial-gradient(54% 44% at 85% 100%, rgba(166, 2…`（共 8 层）
- **禁用（进入阅读、未读到末尾）**：文案「确认入局」aria-disabled=true；rect x=55 y=776 w=280 h=48 [BR]；width 280px height 48px radius 999px color rgb(98, 103, 119) cursor not-allowed [CS]；background-color rgba(20, 22, 31, 0.055)；box-shadow `rgba(20, 22, 31, 0.1) 0px 0px 0px 1px inset`；transform `none`；transition `0.08s`
  - 高光条 rect(相对按钮) {'x': 14, 'y': 3, 'w': 252, 'h': 13}，background `linear-gradient(rgba(255, 255, 255, 0.62), rgba(255, 255, 255, 0))`
  - 文字 15px / 500 / normal / rgb(98, 103, 119)，rect {'x': 109.98, 'y': 12.75, 'w': 60.02, 'h': 22.5}
  - 生成的 :active 规则：`.scp8:active { transform: scale(0.958) !important; }`
  - 页脚 rect {'x': 0, 'y': 717, 'w': 390, 'h': 127}，pad padding `0px 22px 20px`，--ju-bottom-pad `20px`
  - background-image（computed 前 300 字）：`none…`（共 0 层）
- 禁用（s06g 等待确认）：未取得（None）
- 按压过程 transform 采样 [CS]（mouse.down 后 ms→matrix）：[{'t': 60, 'transform': 'matrix(0.955937, 0, 0, 0.955937, 0, 0)'}, {'t': 200, 'transform': 'matrix(0.958, 0, 0, 0.958, 0, 0)'}, {'t': 500, 'transform': 'matrix(0.958, 0, 0, 0.958, 0, 0)'}]；松开 700ms 后 transform `none`。

## 3. 背景环境

### 3.1 V27 实有：Cotton Candy（`<cotton-bg>`，模块 `./cotton-bg.js`，提取为 src/shared/v27/backgrounds.js）[SRC]
- 技术：three.js r185 `WebGLRenderer{alpha:false,antialias:true,preserveDrawingBuffer:true,powerPreference:"low-power"}`，pixelRatio 1，LinearSRGB、无 tone mapping，clearColor (243,242,248)=#f3f2f8；正交相机 ±3（按宽高比拉伸）；`PlaneGeometry(18,18,192,192)` 绕 z 转 −90°；`MeshPhysicalMaterial{metalness:.2,roughness:.9}` + `AmbientLight(0xffffff,1.2π)`；顶点着色器用 cnoise 置换（uNoiseDensity 1，uNoiseStrength 3，uSpeed .3）；片元按 x/z 位置 smoothstep 混合三色。
- 三色（RGB/255）：uC1 (251,225,236) 粉、uC2 (236,236,244) 淡紫灰、uC3 (211,237,243) 淡青。移植自 @shadergradient/react 2.4.20 waterPlane（MIT，许可文本在模块头）。
- 节奏：`clock += min(dt,.1)·.25`（有效速度 .075），uTime=clock；`prefers-reduced-motion` 时 uTime 固定 .2、只画一帧，`data-mode` 标为 reduced-motion / dynamic / context-lost / unavailable。单渲染器、单时钟服务全部 12 个实例，按尺寸分组渲染后 drawImage 到各自 2D canvas；IntersectionObserver 只渲染可见实例；页面隐藏时停。
- 切换：**没有切换**。12 处 `<x-import … seed="N">` 的 seed 不被读取（元素类无 observedAttributes、不读 attributes）。
- Halo / Sunset：**V27.html 全文不存在**（仅数据里的地名 "SF-Sunset"/"Sunset 粤菜早茶"）。REVIEW.txt L226/L401 与任务书把三背景列为既定环境，其名称来自同目录 R9（R9.code.html L87290 `skins=[[cotton,Cotton Candy,棉糖],[halo,Halo,光晕],[sunset,Sunset,落日]]`，L87293-87300 `setSkin`：`html[data-skin]` + `<cotton-bg seed="1">` / `<ju-halo-skin>` / `<ju-sunset-skin>` 自定义元素，650ms opacity+blur 交叉淡入；前景按 `html[data-skin=halo|sunset]` 覆盖色板 L798 等）。本任务只核对 V27，故 Halo/Sunset 的参数未提取；R9 不是本轮基线。

### 3.2 实测（s05，截图 bg-cotton-s05-t0 / t2s / t4s 为同一屏不同时刻；像素采样取自几乎空白的 screen-s12.png）
- 2D 拷贝画布尺寸 {'w': 780, 'h': 1688, 'note': 'sampled offline (PIL) from screen-s12.png, an almost empty screen (only header text + CTA); grid avoids text; browser-side canvas sampling was cut off when the run was stopped'}，data-mode `dynamic (data-mode read in screens stage)`，元素 background-color [CS] rgb(243, 242, 248) [SRC: element cssText background:#f3f2f8]
- 9 点像素采样（画布坐标，RGB/hex）：

| fx,fy | x,y | rgb | hex | 对比度 vs 标题 #14161F | vs 辅助 #535b70 | vs 白 #fff |
|---|---|---|---|---|---|---|
| 0.1,0.3 | 78,506 | (211, 225, 232) | #d3e1e8 | 13.5:1 | 5.1:1 | 1.34:1 |
| 0.5,0.3 | 390,506 | (210, 226, 232) | #d2e2e8 | 13.6:1 | 5.1:1 | 1.33:1 |
| 0.9,0.3 | 702,506 | (217, 224, 231) | #d9e0e7 | 13.5:1 | 5.1:1 | 1.33:1 |
| 0.1,0.55 | 78,928 | (219, 224, 232) | #dbe0e8 | 13.6:1 | 5.1:1 | 1.33:1 |
| 0.5,0.55 | 390,928 | (225, 224, 232) | #e1e0e8 | 13.8:1 | 5.2:1 | 1.31:1 |
| 0.9,0.55 | 702,928 | (219, 225, 232) | #dbe1e8 | 13.7:1 | 5.1:1 | 1.32:1 |
| 0.1,0.8 | 78,1350 | (224, 226, 233) | #e0e2e9 | 13.9:1 | 5.2:1 | 1.29:1 |
| 0.5,0.8 | 390,1350 | (214, 227, 233) | #d6e3e9 | 13.8:1 | 5.2:1 | 1.31:1 |
| 0.9,0.8 | 702,1350 | (210, 227, 233) | #d2e3e9 | 13.7:1 | 5.1:1 | 1.32:1 |

- 相对亮度（Rec.709 加权 0–255，8px 网格）：min 222.3 / max 226.3 / mean 224 —— 背景整体处于 L≈222–226 的浅色带，对比度见上表（标题 #14161F ≥ 12:1，辅助 #535b70 ≥ 5:1）。
- 前景在三背景上的对比处理：V27 只有一套浅色背景，**没有按背景切换前景色板**；对比靠 (a) 深色文字固定值（#14161f / #535b70 / 状态蓝 #4A5AD6）；(b) 吸顶区 `[data-header23]::before`：高度 --ju-head-visible 的 blur(5px) 毛玻璃，随 p 显现，再用 mask 渐隐（V27:299，V27:304 覆盖为无底色纯遮罩）；(c) 页脚显露时 #f2f4fb 渐变底（L284）；(d) 玻璃控件（返回键 .34 白 + blur16、表单纸 .965→.935 白 + blur26、成员抽屉 .95 白 + blur30）；(e) s01 底部 92px 渐变（L539）。

### 3.3 Halo / Sunset（来源 R9，提取为 src/shared/v27/skins-r9.js）[SRC]

R9.code.html 的 `<script data-bundled-source="vendor/v17-skins.js">`（L81919-L83440）定义了三个自定义元素：`ju-cotton-skin`（R9 自己用 fbm 噪声重做的棉花糖近似版，L81940-L82116，未收入）、`ju-halo-skin`（L82119-L82749）、`ju-sunset-skin`（L82752-L83313），以及壳元素 `ju-legacy-background`（L83316-L83440，按 `html[data-ju-skin]` 在三者间换子元素）。R9 页面层用 `setSkin()`（L87293-L87302）切换：写 `html[data-skin]`、`#background` 里换成 `<cotton-bg seed="1">` 或 `<ju-halo-skin>/<ju-sunset-skin>`，650ms opacity .25→1 + blur 12→0 交叉淡入，并持久化到 `H.state.skin`。V27 不含其中任何一个。

| 项 | Halo（ju-halo-skin） | Sunset（ju-sunset-skin） |
|---|---|---|
| 渲染 | 裸 WebGL1，共享离屏画布 MASTER 376×830（alpha:false, antialias:false, depth, preserveDrawingBuffer, high-performance）；两道 pass：噪声置换平面 → framebuffer 纹理 → 半调（halftone）后处理全屏三角形 | 裸 WebGL1，共享离屏画布 376×830（antialias:true）；单 pass：球面网格 + 周期 pnoise 顶点置换，片元按到中心距离混色 |
| 颜色 uniform（0-255） | uColor1 (255,80,5) 橙 · uColor2 (219,186,149) 驼 · uColor3 (208,188,225) 淡紫；brightness 1.2 | uColor1 (255,122,51) 橙 · uColor2 (51,160,255) 天蓝 · uColor3 (255,197,61) 黄；brightness 1.5 |
| 速度 / 起点 | HALO_SPEED .025（官方 preset .4 的 1/16；"一次大构图变化约 40–50 秒"），elapsed 起点 340 s（可用 ?haloTime= 覆盖），每帧 += min(dt,.1) | SUNSET_SPEED .1，起点 0 s（?sunsetTime= / ?haloTime=），?sunsetPaused=1 可冻结 |
| 是否动态 | 是：rAF 连续渲染；document.hidden / prefers-reduced-motion / 无实例时停（只保留 renderAndMirror 的一帧） | 同左 |
| 每实例成本 | 每帧 render 一次 master，再 drawImage(copy) 到每个实例 shadow DOM 的 2D canvas（376×830，CSS 100%） | 同左 |
| 失败回退 | WebGL 不可用 / context lost：paintFallback() 画 2D 线性渐变 135°：#ff5005 → #dbba95 58% → #d0bce1；canvas 底色 #ff5005 | 竖向 #fea669 → #f99674 32% → #cb9ca3 58% → #9ca2d1 80% → #85a2e8；底色 #ff7a33 |
| 依赖 / 资源 | 无（不用 three.js，无图片）；R9 L86865 的 skin-previews.js 仅是设置弹窗的静态预览 PNG | 同左 |
| 前景适配（R9 自己的） | `html[data-skin=halo],html[data-skin=sunset]{--r4-muted:#34424f;--r4-accent:#25385f;…}` 等（skins-r9.css，R9 L798/L1210-1212/L1269/L1467-1471/L1477-1478）：R9 在这两套皮肤下把正文容器加了 #edf4f6d9 一类的浅底 | 同左 |

- halo live 首帧实测（skins-demo-halo-live.png；引擎画布 376×830 getImageData，7 点 21×21 均值）：(0.12,0.08) #d4ad89，(0.88,0.08) #ccafbb，(0.5,0.5) #e58934，(0.12,0.92) #b1e1ff，(0.88,0.92) #f16406，(0.5,0.25) #da9f6d，(0.5,0.75) #e6813a；亮度 min/max/mean 117.7/222/163.5。
- sunset live 首帧实测（skins-demo-sunset-live.png；引擎画布 376×830 getImageData，7 点 21×21 均值）：(0.12,0.08) #ffa168，(0.88,0.08) #ff9b6b，(0.5,0.5) #cea0a1，(0.12,0.92) #94aadb，(0.88,0.92) #9caed3，(0.5,0.25) #faa976，(0.5,0.75) #aea8c1；亮度 min/max/mean 165.9/187.3/174.3。
- cotton live 首帧实测（skins-demo-cotton-live.png；引擎画布 390×844 getImageData，7 点 21×21 均值）：(0.12,0.08) #e4dce5，(0.88,0.08) #d7e0e7，(0.5,0.5) #dfdfe7，(0.12,0.92) #dbe3ea，(0.88,0.92) #dde3ea，(0.5,0.25) #d6e0e8，(0.5,0.75) #e0e1e9；亮度 min/max/mean 221.9/226.5/224.1。
- cotton 时钟：t0 clock 1.0499750000000003 → +9589ms 后 1.4458000000000002（swiftshader 下帧数少，推进慢；真机每秒 +.25）。截图 skins-demo-cotton-t0 / t2s。
- skins.js API 烟测（halo live）：pause → state {"name": "halo", "live": true, "paused": true, "engine": "ju-halo-skin", "isLiveHost": false}，快照层出现 True；resume → {"name": "halo", "live": true, "paused": false, "engine": "ju-halo-skin", "isLiveHost": false}。

### 3.4 统一外壳 skins.js 与三环境对比度实测

接口（src/shared/v27/skins.js）：`JU.shared.skins.mount(host, name, {live, exclusive})` / `unmount` / `pause` / `resume` / `setSkin` / `setLive` / `state`。live 引擎：cotton → `<cotton-bg>`（V27 原件 backgrounds.js + vendor-three.js）；halo / sunset → `<ju-halo-skin>` / `<ju-sunset-skin>`（R9 原件 skins-r9.js）。规则：同一页面只允许一个 live（最后一次 live 的 mount / setLive 得到 live，其余转为"当前帧快照 + 静态渐变"），live=false / 无 WebGL / prefers-reduced-motion 一律静态 CSS；pause 把当前帧快照到 2D canvas 后摘下引擎元素（三种引擎的共享渲染器在实例集合为空时都会停 rAF），resume 挂回；setSkin 按 R9 的 650ms opacity+blur 交叉淡入。演示页 src/shared/v27/skins-demo.html（三台 390×844：cotton live / halo 静态 / sunset 静态；`?live=all&exclusive=0` 可三台全 live 用于采样；`?fg=0` 隐藏前景）。

静态回退色板（由 live 首帧 3×5 网格行均值 + 四角采样生成；skins-samples.json / skins-palettes.json）：

| 环境 | 5 行均值（上→下） | 四角 tl / tr / bl / br | live 首帧亮度 mean | 静态回退亮度 mean（bg-only 实测） |
|---|---|---|---|---|
| cotton | #dfdee6 → #d6e0e8 → #dfdfe7 → #e3e1e9 → #dbe3ea | #e4dce5 / #d7e0e7 / #dbe3ea / #dde3ea | 224.1 | 222.1（cotton-bg） |
| halo | #cfaea9 → #db9c66 → #e48b3c → #e48543 → #d59c83 | #d4ad89 / #ccafbb / #b1e1ff / #f16406 | 163.5 | 162.2（static） |
| sunset | #ff9f6b → #f7ac7a → #cfa1a0 → #b2a5bc → #9bacd4 | #ffa168 / #ff9b6b / #94aadb / #9caed3 | 174.3 | 174.2（static） |

对比度实测（skins-demo-all.png 的前景隐藏版，dpr2，文字外接矩形下的平均底色；WCAG 比值；cotton 列为 live 原件，halo / sunset 列为静态回退）：

| 环境 | 模式 | 角色 | 前景色 | 字号/字重 | 底色均值 | 对比度(均值) | 最亮处 | 最暗处 |
|---|---|---|---|---|---|---|---|---|
| cotton | live | title | #14161f | 30px/500 | #dfdde6 | **13.42:1** | 13.54:1 | 13.4:1 |
| cotton | live | meta | #535b70 | 14px/400 | #e1dde6 | **5.06:1** | 5.09:1 | 5.04:1 |
| cotton | live | body | #454b5e | 14px/400 | #e1dde6 | **6.48:1** | 6.52:1 | 6.46:1 |
| cotton | live | cta-label-on-pill | #ffffff | 15px/500 | #9abfef | **1.9:1** | 1.0:1 | 2.74:1 |
| halo | static | title | #14161f | 30px/500 | #d2a993 | **8.45:1** | 8.71:1 | 8.12:1 |
| halo | static | meta | #535b70 | 14px/400 | #d5a78b | **3.14:1** | 3.22:1 | 3.04:1 |
| halo | static | body | #454b5e | 14px/400 | #d8a279 | **3.87:1** | 4.02:1 | 3.7:1 |
| halo | static | cta-label-on-pill | #ffffff | 15px/500 | #9abdec | **1.93:1** | 1.0:1 | 3.14:1 |
| sunset | static | title | #14161f | 30px/500 | #fca16d | **8.98:1** | 9.24:1 | 8.77:1 |
| sunset | static | meta | #535b70 | 14px/400 | #fca470 | **3.45:1** | 3.54:1 | 3.38:1 |
| sunset | static | body | #454b5e | 14px/400 | #faa875 | **4.51:1** | 4.61:1 | 4.4:1 |
| sunset | static | cta-label-on-pill | #ffffff | 15px/500 | #99bdee | **1.93:1** | 1.0:1 | 2.74:1 |

同一组文字角色落在 live 原件首帧的上部（标题/辅助/正文所在的上 40%）：
- cotton：顶带均色 #dadfe7，标题 #14161f 13.48:1，辅助 #535b70 5.06:1，正文 #454b5e 6.48:1，顶带最差格 5.05:1。
- halo：顶带均色 #d5a588，标题 #14161f 8.22:1，辅助 #535b70 3.09:1，正文 #454b5e 3.95:1，顶带最差格 2.86:1。
- sunset：顶带均色 #fba673，标题 #14161f 9.28:1，辅助 #535b70 3.49:1，正文 #454b5e 4.46:1，顶带最差格 3.3:1。

读数要点：V27 的深色文字角色在 Cotton Candy 上远超 7:1；在 Halo（R9 默认 340 s 起点的橙色构图）上，14px 辅助行 #535b70 只有 ≈3:1，正文 #454b5e ≈4:1，低于 4.5:1；Sunset 上辅助行 ≈3.5:1。R9 自己也因此给这两套皮肤加了浅色容器底（skins-r9.css）。若新方案要在三环境上共用 V27 的文字色，Halo / Sunset 下需要前景退让层（毛玻璃 / 浅底）或更深的辅助色。

## 4. 局卡模板与翻面

### 4.1 模板 [SRC]（`./ju-card.html` → src/shared/v27/ju-card.html；别名 JuCardV2）
- 外盒 `container-type:inline-size`，字体 Noto Sans SC，底色 #F2E8D5；卡面 `aspect-ratio:4/5`，六个视觉包 invite / street / grain / mono / riso / acid（props L140；V27 默认 heroPack invite，选中活动的 pack 可覆盖，V27:2259）；可选二维码条 `qrOn`；性别标签 `genderOn`；每包末尾一层 SVG feTurbulence 纹理（opacity .14–.55，multiply/overlay/soft-light）。
- 在各屏的实际尺寸（hint-size）：s02 门口 3D 卡 **212×265**（L598）；s05 / s06g / s09 门口 **196×245**（L1039/L1168/L1444）；s03b / s09 封条下 **296×370**（L857/L872/L1429）；s01 信息流为 WebGL 纸卡（ju-paper-film，非本模板）。
- 文字角色（cqw 换算：196 宽 → 1cqw=1.96px；212 → 2.12px；296 → 2.96px）：

| 包 | 角色 | 字体 / 字重 | cqw | @196 | @212 | @296 |
|---|---|---|---|---|---|---|
| invite | 英文标题 | Libre Caslon Text 700 | 7.6cqw | 14.9px | 16.1px | 22.5px |
| invite | 中文标题（手写，rotate −2°） | Caveat / Zhi Mang Xing | 11.5cqw | 22.5px | 24.4px | 34.0px |
| invite | 来不来！！ | Caveat / Zhi Mang Xing | 6.6cqw | 12.9px | 14.0px | 19.5px |
| invite | TO/DATE 手写 | Caveat / Zhi Mang Xing | 6.6cqw | 12.9px | 14.0px | 19.5px |
| invite | SEATS/WHERE/TIME 行 | Space Mono | 2.85cqw | 5.6px | 6.0px | 8.4px |
| invite | JU NYC 编号 | Space Mono | 2.4cqw | 4.7px | 5.1px | 7.1px |
| street | 标题 | Archivo 500 | 8cqw | 15.7px | 17.0px | 23.7px |
| street | Hosted by | Archivo 400 | 3.7cqw | 7.3px | 7.8px | 11.0px |
| street | 地点/时间 | Archivo 500 | 6.4cqw | 12.5px | 13.6px | 18.9px |
| grain | 英文大字 | Archivo Black | 13.5cqw | 26.5px | 28.6px | 40.0px |
| grain | 座位/日期/时间 | Space Mono 700 | 3.5cqw | 6.9px | 7.4px | 10.4px |
| mono | 中文标题 | Space Mono 700（Noto Sans SC 回退） | 6cqw | 11.8px | 12.7px | 17.8px |
| mono | IN … / 日期 | Space Mono 700 | 4.3cqw | 8.4px | 9.1px | 12.7px |
| riso | 中文标题 | Noto Sans SC 900 | 11.5cqw | 22.5px | 24.4px | 34.0px |
| riso | 时间 见 | Archivo 800 | 7.5cqw | 14.7px | 15.9px | 22.2px |
| acid | 中文标题 | Noto Sans SC 900 | 12.2cqw | 23.9px | 25.9px | 36.1px |
| acid | 编号/英文名 | Oswald 600 | 7cqw | 13.7px | 14.8px | 20.7px |
| acid | HOSTED BY | Oswald 500 | 4.5cqw | 8.8px | 9.5px | 13.3px |

### 4.2 3D 卡壳与翻面 [SRC]（src/shared/v27/ju-card.css / ju-card.js）
- 透视 1150px，perspective-origin 50% 46%；宿主 `[data-spin-host]` preserve-3d；正面/背面 `backface-visibility:hidden`，圆角 13，正面投影 `0 42px 84px -28px rgba(18,22,48,.55), 0 10px 26px -12px rgba(18,22,48,.35)`；侧棱 7px（translateX(−3.5px) rotateY(90deg)）；背面预旋转 180°，渐变纸 157deg #FFF→#EAEDFB→#DBE1F5→#FDFDFF + 8px 蓝点阵 + JU. 字标（Libre Caslon Text 52/46px）。
- 自转：`SPIN_DPS=30°/s`（V27:1988），角速度以 1−e^(−1.25dt) 起转，俯仰 tilt → 6°；每帧写 `rotateX(tilt) rotateY(a)`，正反面 `brightness(.80+.30|cos a|^.7) saturate(.92+.16|cos a|)`，侧棱 opacity .35+.65|sin a|^2.2，投影 scaleX .42+.58|cos a| · opacity .42+.48|cos a|，光带 translateX = (a<180? a/180 : (360−a)/180)·235 − 48 %（V27:2050-2061）。
- 拖拽（startSpin V27:2072-2100）：Δa = Δx·0.78 °/px，tilt = clamp(t0 − Δy·0.2, ±24°)，松手速度 clamp ±1400°/s（最低回到 30°/s 继续转）。
- **翻面（锁定）**：`flip05()` V27:1942 置 `data-spin-run=0` 与 `data-spin-to = (a<180 ? 180 : 540)`；状态机 V27:2028-2035：**时长 1020 ms**，缓动 `e = 1 + 2.14q³ + 1.14q²`（q = k−1，终点轻微过冲），tilt 以 1−e^(−3.4dt) 归零；到点 `onSettle`：角取整到 180 倍数、`rest=true` 保持终态、`f5="open"` 打开阅读层。进入阅读时卡壳 1.02s ease 从 196×245 放大到 min(100%,328px)×min(100%,460px)（V27:4348），阅读层 opacity .32s。离开 s05 时取消锁定并恢复自转（V27:2235）。reduced-motion：k=1 直接落位。
- 翻面在哪些屏：s05（读约定 → 确认入局）。s02 / s03b / s06g / s09 的卡只自转 + 拖拽，没有锁定翻面；"左右翻卡"（左右滑）属于表单卡栈（第 5 节），不是局卡。

### 4.3 实测（截图 card-front-000 / card-mid-062 / card-mid-118 / card-back-180，手动设定角度后冻结；card-back-reading-open/-end 为真实 flip05 落定后的阅读态）
**本轮未取得卡片角度帧与翻面采样**（运行被停止）。可用画面：`screen-s05.png` / `screen-s06g.png`（196×245 正面，自转中的一帧）、`s02-door-after-tear.png` / `header-s02-door-*`（212×265 正面，角度冻结为 0°）、`screen-s03b.png` / `screen-s09.png`（296×370 封条下的卡）、`screen-s01.png`（信息流 WebGL 纸卡）。复跑：`node scratchpad/v27/shoot.cjs cards`（手动角度 0/62/118/180 帧、真实 flip05 角度采样、阅读态）。

## 5. 表单卡栈（s03 留个位置）

### 5.1 规则 [SRC]（src/shared/v27/card-stack.css / card-stack.js）
- 结构：`.ju-form-stack`（高 = var(--ju-form-paper-height,430px)+38px，perspective 1600px，touch-action pan-y）内有两张背纸 `.ju-form-back26`（far: translateY(−34px) scale(.903) opacity .48 z1；near: translateY(−19px) scale(.951) opacity .8 z2；top 38px 高 calc(100%−38px) 圆角 26，白→#f6f8ff 176deg）+ 5 张 `[data-form-step=0..4]`（top 38px，圆角 26，纸面渐变白 .965→.935 + blur(26px) saturate(1.5)）。背纸数量 = min(2, 4−index)（formBack27 V27:4663）。
- 手势（startCard3 V27:4704-4714）：pointerdown 在栈上（input/button/[data-nodrag] 除外），位移 >8px 后判轴（|fx|>|dy|·1.2 → 横向，setPointerCapture），拖动中 `p = min(1, |dx| / (1.2·w))`；松手 **dx>84 → 下一张（校验不过则红色"还差必填"+ juShake 回弹），dx<−84 → 上一张，否则回弹**。键盘：左右键切换，末张 Enter 递交。
- 卡位（cardPose26 V27:4647-4655）：当前张 `translate3d(dir·1.35w·p,0,0) rotateZ(dir·62°·p) scale(min(1,h/(cos·h+sin·w)))`，transform-origin 50% 50%；目标张从后面升起 `translate3d(−dir·9·sin(πp)px, −19(1−p)px, 0) rotateZ(−dir·2°·sin(πp)) scale(.951+.049p)`。reduced-motion：仅 ±8px 平移 + 淡入淡出。
- 动画（animateCard26 V27:4656-4662）：提交 `ms = 840·max(.32,|Δp|)`，回弹 360ms，缓动 `1−(1−t)^3.35`；期间 `paintCardFrame27` 每帧写 transform + 纸面投影 lift（1+sin(πp)·.7）+ 色洗；落定后 setState({c3}) 并 restoreCardPaint27。
- 色洗（washFor V27:2742-2761）：`t = min(1,|dx|/132)`，opacity = .5+.9t，右滑绿 rgb(30,167,124)「n/5 填好了」/ 末张「递给局主」，左滑蓝 rgb(74,120,214)「回上一张」/「已经是第一张」，被拦截红 rgb(218,58,82)「还差必填」；clip-path 斜切 polygon(0 0, 118t% 0, 96t% 100%, 0 100%)；内文 44px 圆环 + 25px/700 白字，旋转 ∓4°。
- 校验（card3Ok V27:2123-2130）：称呼非空且 ≤10 字、微信号 `^[A-Za-z0-9_-]+$`、留言 ≤40 宽（JuLedger.noteError）、邮箱为空或格式正确且已验证。

### 5.2 实测（截图 stack-rest / stack-drag-060 / -140 / -260 / stack-settled-card2 / stack-drag-back-150 / stack-back-to-card1 / stack-drag-blocked-150 / stack-blocked-shake-result）
**本轮未取得卡栈拖拽帧**（运行被停止）。可用画面：`screen-s03.png`（静止态：当前张 + 两张背纸 far/near、步骤点、「右滑填好 · 左滑放回」）。复跑：`node scratchpad/v27/shoot.cjs stack`（dx 60/140/260 保持帧、松手落定、左滑回退、必填为空的拦截抖动）。

## 6. 字体角色表（摘要；完整表与文件清单见 src/shared/v27/fonts.md）

| 角色 | 字体 | 规格 | 出处 |
|---|---|---|---|
| UI 字体栈 | `--ju-font-ui: Noto Sans SC, Microsoft YaHei, PingFang SC, sans-serif` | 可变字体切片（101 片 ×5 字重共用文件，4.52 MB） | V27:49 |
| 外层标题 | Noto Sans SC | 30px / 500 / 1.25（收拢时 1.05，30→18） | title20 V27:4214 |
| 辅助行 | Noto Sans SC | 14px / 400 / 1.5 / #535b70 | meta21 V27:4215 |
| CTA 文案 | var(--ju-font-ui) | 15px / 500 / 字距 normal / #fff（V27:4317 覆盖 V27:2518 的 14.5/.06em） | V27:4317 |
| 数字（票根时间、倒计时、候补序号） | Archivo 500/700 | 28 / 92 / 60px | L262、L281、L390 |
| 眉行 / 编号 / 吐司 | Space Mono 400/700 | 8–13px，字距 .04–.42em | 132 处 |
| JU. 字标 | Libre Caslon Text 400 | 28px（s01）/ 52px（卡背） | L519 / L607 |
| 局卡各包 | Caveat·Zhi Mang Xing / Archivo / Archivo Black / Oswald / Noto Sans SC 900 | cqw 制 | ju-card.html |
| 嵌入 | 326 个 woff2（13.86 MB）→ Blob URL，863 条 @font-face，font-display swap；无许可文本内嵌 | V27:3-35 |

## 7. 任务书引用的 R3 行号在 V27 里对应什么

任务书给的是 R3（JU-R3-Visual-Motion.html）的行号，R3 未上传。V27.code.html / V27.html 只有 **4765 行**，这些行号在 V27 中不存在；按内容在 V27 里对应如下（同目录的 R9.code.html 有 88131 行，但核对其 L84054-84067（WebGL 顶点属性）、L84187-84205（信息流指针）、L1758-1759（.r7-cancel-consequences）、L86289-86306（qrcode 库）也都不是任务书所述内容，故这些行号既不属于 V27 也不属于 R9）。

| 任务书引用 | V27 里的对应（按内容） |
|---|---|
| CTA / 标题 84054–84067 | 行号找不到。CTA → `blueCta(on)` V27:1863-1870 + ctaText/Gloss V27:2518-2519；标题 → `title20()` V27:4214、`screenTitleStyle` V27:2527、token V27:49 |
| 吸顶 84187–84205 | 行号找不到。→ `headP` V27:4119、`syncHeader23` V27:4457-4476、`sync22` V27:4477-4485、CSS V27:296-304 |
| 背景 1758–1759 | 行号找不到（V27 L1758-1759 落在应用脚本的 feed 数据区）。→ `<x-import … cotton-bg>` V27:516/574/688/837/961/1022/1151/1248/1320/1409/1538/1623；模块本体 = V27.html L4 data["./cotton-bg.js"]（base64）；three 依赖 V27:423 |
| 卡栈 86289–86306 | 行号找不到。→ `cardPose26` V27:4647-4655、`animateCard26` V27:4656-4662、`startCard3` V27:4704-4714、`vals03` V27:2721-2861、CSS V27:392-405 |

## 8. 与任务书描述不符 / 需要注意之处

1. **三背景只有一套**：V27 没有 Halo / Sunset，也没有任何背景切换；`seed` 属性无效。任务书"三套既定背景环境"若指 V27，则不成立；名称来自 R9（见 3.1）。Halo / Sunset 已从 R9 原样提取（3.3），并连同 V27 的 Cotton Candy 封装为统一外壳（3.4）。
2. **「收至约 18px 并进入工具行中部」在源码上成立，但 390×844 的实际画面走不完**：收拢需要 scrollTop ≥ 88px，而默认 fixture 下 s05 仅 64px、s06g 38px、s06 48px、s03b 44px、s02 door 50px（双行标题 81px）可滚动，没有一个屏到 p=1；终点态只在更矮视口或更长内容下出现。
2b. **多行标题的换行是 overflow-wrap:anywhere 的硬换行，没有 text-wrap:balance**：12 字标题在 30px/346px 下断成「周五深夜法拉盛救急火锅 / 局」，第二行只剩一个字（截图 header-s02-longtitle-p000-clip）；收拢到 p≈0.4（字号 ≈25px）后又回到单行，期间 header 高度按双行 th=63 固定，不随回到单行而缩短。
3. **标题 line-height 有两套**：静态 1.25（title20），一旦 syncHeader23 接管即改为 1.05（含 p=0），所以吸顶页的标题行高实测恒为 31.5px，而非 37.5px。
4. **stickyShell / titleShrink / subCollapse 只是名字**：V27 中它们不计算收拢（V27:4120-4122），真正的函数是 syncHeader23；任务书点名的 stickyShell 已退化。
5. **CTA 文案实测 15px/500、无字距**：源码里有两套 ctaTextStyle（V27:2518 的 14.5px/.06em 与 V27:4317 的 15px），后者在合并时胜出；若按 2518 抄 14.5px 会与实际画面不符。宽度 `min(100%,280px)`、高 48 与任务书一致。
6. **CTA 的"边缘"没有 border**：全部由 inset/outset box-shadow 构成；按压只有 scale(.958) + .48s 过冲回弹，没有颜色/阴影变化（禁用态才换材质）。
7. **局卡"翻面"只在 s05**（flip05 锁定 1020ms 过冲曲线）；其他屏的卡只自转；"左右翻卡"是 s03 表单卡栈的手势（±84px 阈值、62° 甩出），不是局卡。
8. **flipBox/face/stack 是 v17 票根翻面的遗留**（V27:4015-4023、4105-4112），V27 的 HTML 已不引用（全文 0 处），不要当作现行翻面实现。
9. **s04c 在 CSS/路由里存在但没有 `<section id="s04c">`**（V27:57、2237）；evidence 没有 s04c 首屏。
10. **字体许可**：V27 未内嵌任何字体许可文本（仅 three.js / shadergradient 的 MIT）；使用的 9 个家族在 Google Fonts 均为 OFL 1.1（公开信息，需自行核对）。
11. **无头环境**：s04 及信封舞台黑底、动画慢 20–60 倍、门口阶段用 reduced-motion 截图（见开头"环境限制"）；这些不是 V27 的画面事实。

## 9. 产出文件

- 截图与数据：`my-r2/evidence/baseline/v27/`：bg-cotton-s05-t0.png、bg-cotton-s05-t2s.png、bg-cotton-s05-t4s.png、cta-default.png、cta-disabled.png、cta-pressed.png、header-s02-door-p000-clip.png、header-s02-door-p000-scroll0.png、header-s02-door-p050-clip.png、header-s02-door-p050-scroll46.png、header-s02-door-p100-clip.png、header-s02-door-p100-scroll50.png、header-s02-door-p100b-clip.png、header-s02-door-p100b-scroll50.png、header-s02-longtitle-p000-clip.png、header-s02-longtitle-p000-scroll0.png、header-s02-longtitle-p050-clip.png、header-s02-longtitle-p050-scroll46.png、header-s02-longtitle-p100-clip.png、header-s02-longtitle-p100-scroll81.png、header-s02-longtitle-p100b-clip.png、header-s02-longtitle-p100b-scroll81.png、header-s02-longtitle-sealed.png、header-s05-p000-clip.png、header-s05-p000-scroll0.png、header-s05-p050-clip.png、header-s05-p050-scroll46.png、header-s05-p100-clip.png、header-s05-p100-scroll64.png、header-s06g-p000-clip.png、header-s06g-p000-scroll0.png、header-s06g-p050-clip.png、header-s06g-p050-scroll38.png、header-s06g-p100-clip.png、header-s06g-p100-scroll38.png、measurements.json、s02-door-after-tear.png、screen-s01.png、screen-s02.png、screen-s03.png、screen-s03b.png、screen-s04.png、screen-s05.png、screen-s06.png、screen-s06g.png、screen-s08.png、screen-s09.png、screen-s11.png、screen-s12-after-burn.png、screen-s12.png、skins-contrast.json、skins-demo-all.png、skins-demo-cotton-live.png、skins-demo-cotton-t0.png、skins-demo-cotton-t2s.png、skins-demo-cotton.png、skins-demo-halo-live.png、skins-demo-halo.png、skins-demo-sunset-live.png、skins-demo-sunset.png、skins-samples.json
- 提取代码：`my-r2/src/shared/v27/`：header.css、header.js、cta.css、cta.js、backgrounds.js、backgrounds.css、ju-card.html、ju-card.css、ju-card.js、ju-member.html、card-stack.css、card-stack.js、fonts.md（每个文件头部注明来源 class / 行号；JS 方法体与模块均为原样切片，不改语义）；追加：skins-r9.js / skins-r9.css（R9 Halo / Sunset 原件）、vendor-three.js（V27 的 three r185，MIT）、skins.js（统一外壳）、skins-demo.html（三环境演示页）。
- 临时脚本（不入库）：scratchpad/v27/decode_modules.py（解码 V27.html 全部内联模块）、shoot.cjs（Playwright 驱动）、extract_src.py（按行号切片生成提取文件）、build_spec.py（生成本文）。

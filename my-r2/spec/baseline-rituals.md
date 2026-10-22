# JU「我的局」R2 · 票根仪式基线（baseline-rituals）

> 任务书 §02 固定条款：“已认可的票根出票 / 打印、撕票、作废 / 燃烧、出席印记等物件，复用 V27 / R3 原件，不按方案重做、不缩小原件”。
> 本文记录每个仪式在原件里的几何、时长曲线、触发条件、键盘 / 按钮等价物、减少动态终态、与文字的空间关系、数据与动画的先后，以及复用接口。
> 产出代码：`my-r2/src/shared/rituals/`；证据：`my-r2/evidence/baseline/rituals/`（dpr 2，390×844 手机框；`v27-*` / `r9-*` 为原页截图，`demo-*` 为复用件截图，文件名含虚拟时间）。

## 0 · 来源、身份与判定

| 文件 | 身份（按内容识别） | 本文用到的部分 |
|---|---|---|
| `/home/user/JU/.build/baseline/V27.html`（29.7 MB；去 base64 副本 `V27.code.html` 行号一致） | 「JU 用户入局流程 V27 · 基线修复与完整验收」评审画布，13 屏；标题含 **07 撕开票根 · PRINT & TEAR（主线）**、**08 散场 · AFTER（主线）**、**10 局主改时间 · RESCHEDULE（分支）**、**11 局主取消** | 出票打印、撕副券、联系展开、作废燃烧、改期重出票、出席印记（08 散场） |
| `/home/user/JU/.build/baseline/R9.html`（24 MB） | 「JU · R9 一起，把见面定下来」局主端单页应用（s00–s09b 由 app.js 路由，`data-screen` 只落 s01）；源码注释与 V27 08 散场相同 | 出席印记的局主端用法：s09a 逐人记录（quick 时间线）、s09b 归档票墙 |
| R3（`JU-R3-Visual-Motion.html`） | **未上传**，无法核对局主开局侧是否另有票根 / 印章原件 | — |

引擎原件都以 base64 `data:` 脚本内嵌在 V27 第 421–433 行，解码后逐字节存于 `rituals/assets/original/`（清单与 sha256：`assets/original/SOURCES.json`）：

| 原件 | V27 行号 | 全局名 | 用途 | 复用件 |
|---|---|---|---|---|
| `./ju-print.js` | 428 | `window.JuPrint` | 出票：DOM 栅格化 → WebGL 32×128 网格卷纸，2300 ms | `print.js` |
| `./ju-tear.js` | 428 | `window.JUTear` | 撕副券：26 段 verlet 链、SNAP .5、键盘 Enter/Space | `tear.js` |
| `./ju-nativeburn.js` | 430 | `window.JUNativeBurn` | 作废燃烧：原生纸面 clip-path 炭化（V27 页面实际调用，variant B / C） | `burn.js` |
| `./ju-burn.js` | 429 | `window.JUBurn` | 火焰 / 余烬粒子版燃烧；**V27 打包但页面未调用**（`JUBurn.mount` 0 次） | 仅存档 |
| `./ju-tickets2.js` | 427 | `window.JuTickets` | 08 散场 v2：WebGL2 橡皮章 → settle → 历史显现 → 翻阅 | `stamp.js` |
| `./ju-stamp.js` | 426 | `window.JuStamp` | 印泥章面（make / stampTo）；Compositor / VID_QUAD 为 v1 影片遗留 | `stamp.js` |
| `./ju-paper-film.js` | 422 | `window.JuFilm` | 只用 `paintCard()` 画 720×900 局卡贴图 | `stamp.js` |
| `./ju-envelope.js` | 432 | `window.JuEnvelope` | 只用 `makeJuReverse()` 画 512×640 卡背 | `stamp.js` |
| R9 `vendor/ju-tickets-host.js` | R9 85014–85377 | `window.JuTicketsHost` | 同一引擎的宿主适配器（声明 byte-identical 源 + quick/archive profile） | `stamp.js`（`adapter:'r9'`，未认可变体） |
| R9 `vendor/ju-stamp.js` | R9 84337–84487 | `window.JuStamp` | 与 V27 `ju-stamp.js` **逐字节相同** | — |

**判定：** 五个仪式的已认可原件都在 V27；R9 只提供同一引擎的局主端调用方式。出席印记以 V27 08 散场为原件（见 §6）。

## 1 · 票根物件（DOM 票根）

实测（V27 `#s06`，390×844，字体全部载入，fixture「深夜救急火锅局 / 19:30 / 12.18 / 法拉盛 / 待局主确认 / 老杨」）：

| 部件 | 尺寸 / 位置 | 来源 |
|---|---|---|
| 手机内容区 | padding `66px 22px 128px`；吸顶头部 145 px + margin-bottom 13 px → 舞台顶 y = 231（相对手机），纸顶 y = 315 | 第 1248–1258 行、`measurePaper21` |
| 舞台 `[data-print-stage]` | 332 × `--ju-paper-height`：未撕 493 = 84(top) + 351(纸) + 58；已撕（主线 s07）455 = 84 + 351 + 20；s10 改期票 top 24、已撕 312 = 24 + 268 + 20 | 第 3602 行 |
| 纸 `[data-paper]` | 258 宽，`left:50%; margin-left:-129px; top:84px`（s10 24px；手机高 < 720 时 24px）；起点 `translateY(-452px)` 透明 | 第 3448 行 |
| 主票 `.ju-ticket-face` | 258 × **268**：padding 18；品牌 `700 13px/1.4 Space Mono` 字距 .12em（18.19 高）；局名 `600 20px/1.35 Noto Sans SC`（27 高，margin 12 0 16）；时间行 `700 28px/1.1 Archivo` 字距 −.02em，padding-bottom 14（44.8 高）；地点 / 集合 / 局主 三行 grid `40px 1fr`，border-top 1px #cdd1de，padding-top 8，margin-top 8（各 30 高，间距 38）；底色 #edeff7；圆角 14 14 0 0 | 第 261–263 行 |
| 「原定」行 `.ju-ticket-previous` | 14px #555e73 line-through，margin 0 0 10（改期票专有） | 第 263 行 |
| 副券（canvas，由 JUTear.drawStub 画） | **258 × 84**，margin-top −1；底色 #EDEFF7；9 px 网点 rgba(26,29,42,.077)；上缘毛边振幅 1.9 px；下角圆角 14；文案 `400 14px Noto Sans SC #535b70` 左距 18；箭头 #818aa5 1.4 px（w−42 → w−22） | ju-tear.js `drawStub` |
| 齿孔线 | 未撕段 1.4 px 虚线 `[3.4,3.4]` rgba(26,29,42,.30)，前沿 1–2 px 张力翘起；已撕段毛边 rgba(214,217,229,.95) 1.6 px，步长 3.2 | ju-tear.js `paint` ④ |
| 影子外壳 `.ju-paper-shadow24` | 与纸同形（圆角 14 14 10 10），`drop-shadow(0 18px 26px rgba(18,22,48,.26)) drop-shadow(0 3px 4px rgba(18,22,48,.18))`；`clip-path:inset(0 0 var(--ju-shadow-stub25) 0)` 让出副券 84 px（副券画布自带软影） | 第 327、347 行 |
| 「时间已改」章 `[data-raster=stamp]` | `top:150px; right:-20px`（右缘外溢 20 px）；`2.5px double #4550BE`；`700 10px Space Mono` 字距 .14em；padding 7 10；圆角 8；`rotate(-9deg)`；底 rgba(243,244,251,.86)；实测约 82 × 32 | 第 3952 行 |
| s12 取消票章 `p12Stamp` | top 118 right −14，边 rgba(26,29,42,.5)，11px .16em，`juStamp .55s ease .4s both` | 第 4003 行 |
| 燃烧宿主 `[data-burn]` | 258 × 0，left 0 top 0，z 9 | 第 3948 行 |

**三态：** 未撕 ready（纸 + 副券 + 抓手圆点）→ 已撕 torn（副券画布 display:none；主线保留 84 px 空宿主，s10 收成 0）→ 作废 void（纸被 clip-path 吃完、`opacity:0` / body display:none；终态文案落定）。复用件：`ticket.css`（`data-state="idle|printing|ready|torn|burning|void"`）、`ticket.html`（四张静态样张）。

**文字槽位**（V27 模板变量 → `data-slot`）：`eventTitle→title`、`eventTime→time`、`eventMd→md`（V27 只放 **MM.DD**，不含星期；星期在页头 eventLine 和「原定 FRI 12.18 19:30」里）、`eventLoc→loc`、`eventMeeting→meeting`（空时「待局主确认」；改期票为「19:50 门口」）、`eventHost→host`、`oldDate18 oldTime18→previous`、章文案 `mark`。

**字体**（均 SIL OFL，Google Fonts 切片，从 V27 第 4 / 14 行原样抽出到 `assets/fonts/`，8.4 MB）：Noto Sans SC 400/500/700（局名 600 回落到 700）、Space Mono 400/700、Archivo 400/500/700、Noto Serif SC 900（仅「出 / 席 / 未」切片，章面用）、Libre Caslon Text 400/700、Caveat 600/700、Zhi Mang Xing 400、Archivo Black 400、Oswald 500/600/700（后七种为 08 散场局卡贴图 / 卡背用）。

## 2 · 出票 / 打印（PRINT）

- **触发：** 进入视野（`printWatch`，intersectionRatio > .12）自动出票；评审按钮「演示 · 重播出纸」（`resetPrint`）。前置条件 `JuLedger.validTicket`（已成局、本人已确认、票版本一致）。
- **序列（`printRun`，第 3601 行）：** `setState printing` → `await fonts.ready` → `tearMount()`（先挂副券 rig）→ `await rig.ready` → `await rAF` → 校验 `rig.canvasReady`（否则“纸票未准备好，请重试”）→ `tearRedraw()` → `measurePaper21()` → `JuPrint.mount(paper,{done})` → `complete`：`paper.inert=false` → `ready`（已撕过的票直接 `torn`）→ `tearSync()`（此时才启用撕）→ 再量。**打印中不出现完成后的按钮**：主按钮 `juCtaIn .55s cubic-bezier(.2,.9,.3,1) .1s both` 只在 ready 后入场；打印中吸顶头部铺实底 `rgba(245,246,253)` 渐变。
- **几何：** 真实 DOM 栅格化为 2× 纹理（四周 pad 42 px，副券画布与章一并采样）；WebGL 画布宽 = 舞台宽 + 84（left −42），高 = 舞台高；32 × 128 顶点网格；纸从出纸口上方 feed=(1−progress)·纸高 推出；弯曲 `bend = exp(−y/44)`，离纸高度 `z = 32·wet·bend`，透视 `900/(900−z)`，受光 `.88 + .12·cosθ`；出纸口只有 16 px 阴影渐变 + 2 px 受光边（left/right 62），没有机身。
- **时长曲线：** **2300 ms**，`progress = .5 − .5·cos(π·t^.9)`；收尾再画 3 帧后 `flat()`（透明度 1 / transform none）→ 摘画布。
- **减少动态：** `duration = 1 ms`（引擎内判定），纸直接落到位；头部实底与按钮入场受全局 1 ms 规则。
- **空间：** 舞台在打印中 `overflow:hidden`（纸从 −452 px 推出，上方被裁）；纸上方不需要额外留白，但舞台顶到纸顶的 84 px（主线）/ 24 px（改期）是出纸口位置，不能被文字压掉；纸下方未撕时留 58 px（抓手圆点提示 + 影子）。
- **数据与动画：** 出票不写任何业务数据（票在成局时生效）；可重播、可中断（`printReset` 销毁网格、移除 `[data-print-curve]`、纸回到起点）。
- **证据：** `v27-print-1…4`、`demo-print-1…4`。

## 3 · 撕副券（TEAR）

- **物体模型：** 一整条副券 = 26 段 verlet 链；`GRAV 1450 px/s²`、`DAMP .982`、`BEND .30`、`MAXA 2.05°`（相邻段最大夹角，纸的挺度）、`ITER 6`；条码 / 文字 / 纸底同一张源画布逐段采样 → 共用形变。
- **画布：** `CW = 258 + 88×2 = 434`，`CH = 18 + 84 + 220 = 322`，挂在副券宿主上 `left −88, top −18`（实测相对手机 x −22 → 画布横向超出内容区 44 px、超出手机 22 px，由滚动容器 `overflow-x:hidden` 裁掉）；垂落空间 **下方 220 px**。
- **手势（`grab` 层：role=button，aria-label「撕下副券」，覆盖 left/right −16、top −18、高 114）：** `p = (clientX − x0)/(258·scale)`，0..1；松手 `SNAP = 0.5`：p < .5 回位（2.6 /s）；p ≥ .5 自动撕完，`rate = .95 + clamp(vel/W, 0, 1.5)` /s（惯性）；p ≥ 1 立即断开；`pointercancel / lostpointercapture / blur / visibilitychange` 均视为取消 → 回位（可取消、不留半完成）。
- **键盘：** grab 可聚焦（启用时 tabindex 0，`aria-disabled` 同步），Enter / Space → `auto=true, rate=2.8` /s（≈357 ms 撕完）。**原件已有键盘等价物**；复用件再加 `JURitual.tear.trigger()`，走同一 auto 路径，不改视觉。
- **断开与坠落：** `detach` 时先回调 `onDetach()`（**写入点**，见 §10），返回 false 则 `reset()` + 重新启用；成功则 `done`，末节带角动量下坠；坠落 **1080 ms**：0–620 ms 不透明，620→1000 ms 线性淡出，1080 ms 画布 `display:none` → `onDone()`。
- **抓手：** 21 px 白色圆点（径向 #FDFDFF→#D7DBE8，影 0 1.5px 5px rgba(18,22,48,.22)），落在撕裂前沿；提示 `juKnobHint 3.4s linear infinite`（0→104 px 右移渐隐）；随 p 淡出 `max(0, 1 − 1.05p)`，拖动中隐藏。
- **撕后：** 舞台高过渡 `height .5s cubic-bezier(.2,.9,.3,1)`：主线 493 → 455（保留 84 px 空宿主，见 `v27-tear-4-settled`），s10 → 312（宿主收 0、`visibility:hidden`）；影子 clip 同步。
- **减少动态：** 自动撕直接 `detach`（无过程），回位直接 p=0，坠落按 1081 ms 终态立即隐藏，圆点提示动画停止。
- **错误态：** 写入失败 → `.ju-tear-error24`「未能保存，请重新撕下副券」（改期票：「新时间未保存，请重新撕下副券」），副券回位、可再撕。
- **证据：** `v27-tear-1…4`（鼠标拖到 p≈.28 再过半松手）、`demo-tear-1…4`、`demo-reduced-2-tear-endstate`。

## 4 · 联系信息展开（CONTACT）

- **触发：** 撕票 `onDone` → `p7='torn'` → `contactReveal23('s06')`；只有 `JuLedger.canContact`（有效票 + 已撕 + 散场后 24 h 内）为真才显示。
- **时序：** **300 ms** 后联系层出现（`opacity 0→1`、`translateY(16px)→0`，`transition: opacity .5s ease, transform .6s cubic-bezier(.2,.9,.3,1)`，同时 visibility / pointer-events 打开），**850 ms** 后页脚主按钮出现（`translateY(12px)→0`，`.5s / .55s cubic-bezier(.2,.9,.3,1)`）；减少动态时两者 0 ms。
- **DOM / 几何：** `.ju-contact-row` grid `minmax(0,1fr) auto`，min-height 84，padding 16 0，border-top 1px #b9c2d4；姓名 14px「局主 · 老杨」；账号 18px/1.5 可选中；复制按钮 `500 14px #4352bb`，min 76×44，图标 17×17（未复制 `M9 9h11v11H9z M5 15H3V3h12v2` / 已复制 `M5 12l4 4L19 6`）；说明 `.ju-contact-note23` 13px/1.6 #596177「撕券后8小时内联系局主。此处为示例微信。」；主按钮文案「已加微信」→ 加过后「待赴约」并 `aria-disabled`。联系层位于舞台之下 margin-top 14（主线实测 y = 754）。
- **复制：** `navigator.clipboard.writeText` 真实成功才显示「已复制」；失败显示「复制失败，请长按账号复制」（不假报成功）。
- **证据：** `v27-contact-1…3`、`demo-contact-1…5`。

## 5 · 作废 / 燃烧（BURN）

- **引擎：** `JUNativeBurn`（version `25.0-shadow-handoff`）。真实 DOM 票面从不被采样或替换：每帧改 `surface.style.clipPath = path(evenodd, 外框 + 到达时间场的等时线)`，影子外壳同步同一 clip；画布（四周 **pad 74 px**，即 406 × (H+148)）只画炭化带、热边、卷曲碎片、落灰。章 `[data-raster=stamp]` 的外轮廓并入纸的蒙版，一起被烧。
- **三种到达场：** A 右下角起燃（end 7.2 s / 场时长 9.3 s / curls 58 / ash 78 / fold 8.5 / char 1；V27 页面未用）；**B 多点烧穿**（点 .32,.31 / .78,.65 / .13,.92；end 8.2 / 10.6 / 118 / 136 / 17 / 1.5）= **改期拒绝「去不了了」**（s11，`startBurn`）；**C 左侧横向推进**（end 9.3 / 12.6 / 72 / 126 / 10 / 1.05）= **局主取消**（s12，进屏即点火）与 **主动退出**（s06 `exitConfirmed22`）。
- **时长：** V27 传 `duration: 6.6`，`playbackDuration = min(6.6, 7.6) = 6.6 s`，`rate = 场时长 / 6.6`；主体烧尽且无大碎片后 .45 s 内画布 `destination-out` 整体淡出 → `onDone`（实测 C 约 5.3 s 收尾，B 约 5.6 s；6.6 s 为上限）。炭化带 5 层描边 25c/17c/9c/4c/1.7c（ignite = smooth(.06,.72,t)），热边 #d43b0d 5.5 px + #ff5419 1.45 px（shadowBlur 5）+ 逐纤维 #ffb451 / #ff7726；卷曲碎片 `curlScale .48`；落灰重力 150（C 119）、落点 H + 14 + 18r。
- **终态（ash）：** 纸 `display:none` / `opacity:0`；`ashWrap`（left/right 22，top 36%）三段 `juSettle`（标题 26px 500 `.58s .06s`、说明 12.5px/1.95 300 max-width 250 `.58s .21s`、次级 `.55s .58s`）；文案 s11「已退出改期活动 / 改期后退出，不影响成局信用。/ 再找个局 / 知道了」，s12「局主取消了（页头「活动已取消」）/ 不计为未出席，也不影响成局信用。/ 再找一局」。
- **已撕的票再烧（s06 主动退出）：** 原件保留 84 px 空副券宿主，而引擎的内联 clip-path 会盖掉影子外壳的 `inset` 让位，空宿主区会露出一块纸影；复用件 `burn.js` 在 torn 态先把空宿主按 s10 规则收成 0 再点火（引擎未改）。
- **可见性：** IntersectionObserver + visibilitychange + scroll / resize，不可见即暂停，回来接着烧，不重头；`prepareBurnLayout26` 在手机高 < 720 时先把票挪进安全区（320 ms，cubic-bezier(.16,1,.3,1)）再点火。
- **减少动态：** **V27 源码未接系统设置**（任务书 §10 已指出），复用件补：`engine.seek(duration)` 直接到终态再落定文案（不改曲线）。
- **证据：** `v27-burnB-0…4`（含「去不了了」确认 sheet）、`v27-burnC-1…4`、`demo-burnC-1…4`、`demo-burnB-1…4`、`demo-reduced-3-burn-endstate`；`burn.svg` 为原引擎 `seek(t)` 导出的火线等时线（B / C / A，0.5–6.6 s）。

## 6 · 出席印记（STAMP）

**两处原件对比（都真实运行过，WebGL2 via SwiftShader，Playwright 虚拟时钟）：**

| | V27 · 08 散场（用户侧主线） | R9 · s09a 逐人记录（局主侧） |
|---|---|---|
| 引擎 | `ju-tickets2.js`（JuTickets） | `ju-tickets-host.js`（JuTicketsHost，“byte-identical V27 源 + 宿主适配”） |
| 被盖的物件 | 本场 **局卡**（WebGL mesh 2.4 × 3.0 × .018，36×48 面片，圆角 .075；贴图 720×900 `JuFilm.paintCard`，invite 版式），**不是 DOM 票根** | 同一局卡 + 参加者姓名 / 票号叠印（`attendanceArt`，app.js 704 行） |
| 画面尺寸 | 卡宽 `min(舞台宽×.66, 舞台高×.52, 250)`；08 屏舞台 372 宽（内容区 332 + 两侧 −20 margin）→ **245.5 px**，高 306.9（demo 实测 diag 相同）；盖章姿态 `rx −26°`（桌面俯视），归档后站回翻阅姿态（屏幕足迹约 248 × 311） | 桌面 `.attendance-desk` 350 px（手机高 ≤ 760 时 290）；quick 回退图宽 `min(w×.76, h×.70, 275)` |
| 章印 | `stampAnchor('invite') = {x:.78, y:.82, r:.13}` → 直径 ≈ **64 px**（卡宽 26%），旋转 −11°，位于卡右下 | `{x:.78, y:.62, r:.11}` → 直径 ≈ 54 px，位置上移（给姓名条让位） |
| 章体 | 程序几何：橡胶垫（r = 章半径 + .02）+ 木块（.05→.22）+ 车木把手（到 1.25），完全不透明，落下时真实遮住票面；接触软影 | 同 |
| 时间线 | enter .18→1.05 s · press →1.34 · ink **1.40→1.52**（墨迹 alpha）· lift →2.20 · exit →2.85 · end **2.95 s**；随后 settle 0–.45 + 历史显现（INTRO **1.9 s**）→ browse（1.1 s 后一次 .9 s 的掀角提示） | quick：enter 0→.12 · press →.21 · ink .218→.26 · lift →.40 · exit →.54 · end **.56 s**，退出时章淡出；无 intro；完成 `onComplete` 后由页面做人与人的交接 |
| 墨色 / 文字 | present 深绿 rgb(45,106,75)「出席」，absent 印泥红 rgb(178,58,44)「未出席」；环文 `JU / NYC` · `WE WERE HERE` · 年份；`JuStamp.make` 600×600 噪点印泥 | 同（R9 `ju-stamp.js` 逐字节相同） |
| 交互 | browse：上下拖、滚轮、↑↓←→ / Home / End 翻阅，点一下 / Enter / Space 翻面 | 指针事件挂在 stage；归档页左右方向键；实例挂在 `host.__jutHost`（V27 为 `host.__jut`） |
| 减少动态 | 跳过盖章动作：ink=1、phase stamped → 直接 browse | 同，并立即 `onComplete` |
| 视频帧 | **无**。v2 引擎注释“不再有 Cycles 影片与接管帧”；`JuStamp.Compositor / VID_QUAD / retexture` 是 v1 影片遗留，V27 资源表无 mp4 | 无 |

**判定：** V27 08 散场是已认可的出席印记原件（主线、能真实运行、章与局卡同一几何）；R9 是同一引擎的未认可变体（时间线压到 .56 s、章缩到 r .11、位置上移），记录供局主端逐人记录参考，不作为基线几何。

**可独立运行的最小版本（`stamp.js`）：** 四个原件脚本（paper-film / envelope / stamp / tickets2，共 ≈ 140 KB）+ 字体 + 一个 `JuLedger` 垫片（`lookup→null`、`eventProjection→e`、`personalHistory→历史数组`、`original→当前局`）；不需要 three.js、`ju-paper-model.js`（1.6 MB）或 `JU_CARD_DATA`。限制：必须有 WebGL2（否则引擎自动回落到 `<img data-t08="flat">` 平面图，无盖章动作）；`paintCard` 的其他版式（street / grain / mono / riso / acid）需要同一套字体，已一并打包。

- **证据：** `v27-stamp-0…6`、`r9-stamp-0…9`、`demo-stamp-1…8`、`demo-reduced-4-stamp-endstate`。

## 7 · 改期（RESCHEDULE）

- **原件有的：** 局主改时间（`reschedule18 → JuLedger.propose`）→ 进入 s11，**新票出票**（同一打印序列，纸顶 24 px）：时间行换成新时间（SAT 12.19 / 20:00），加「原定 FRI 12.18 19:30」划线行，右缘「时间已改」章，副券文案「撕下，确认新时间」；页头「局主改时间 / 时间挪了一下」。**接受** = 撕副券（`onDetach → JuLedger.choose(true)`，撕完 → 「按新时间见」+ 联系层）；**拒绝** = 「去不了了」→ 确认 sheet →`JuLedger.choose(false)` → **variant B 燃烧**这张新票 → 终态「已退出改期活动」。
- **原件没有的：** 旧票没有单独的作废动画——旧票（s06）不再展示，新票替换之；取消时若票已改期，s12 票面带「原定」行与章（`cancelReissued21`），再被 variant C 烧掉。
- **证据：** `v27-reschedule-1…2`、`v27-burnB-*`、`demo-reschedule-1…4`、`demo-burnB-*`。

## 8 · 减少动态总表（`prefers-reduced-motion: reduce`）

| 仪式 | 原件行为 | 终态 |
|---|---|---|
| 全局 CSS（第 71–73 行） | 所有关键帧 1 ms、过渡 80 ms | — |
| 打印 | 引擎 duration 1 ms | 纸在位、ready |
| 撕 | auto 直接 detach；回位直接 p=0；坠落跳到 1081 ms | torn + 联系层 0 ms 出现 |
| 联系 | 300 / 850 ms → 0 / 0 | 可见、可复制 |
| 燃烧 | **原件未接**；复用件 `seek(终点)` | void + 文案落定 |
| 出席章 | 不播放盖章；ink=1 → 归档 → browse | 已盖章的卡、可翻阅 |

demo 的「减少动态」开关通过代理 `matchMedia` 让原件引擎与 CSS 同时生效（只在 demo 里）。

## 9 · 与文字的空间关系（原件周围需要的空间，不能被压缩）

| 仪式 | 需要的空间 |
|---|---|
| 票根本体 | 宽 258，左右各留 ≥ 44（内容区 346 内居中）；章右溢 20 px；纸顶 84 px（出纸口）；纸底 58 px（未撕）/ 20 px（已撕） |
| 打印 | 舞台两侧各 42 px（网格纹理 pad）；舞台内上方 452 px 行程被 `overflow:hidden` 裁掉，但舞台不能被压矮到纸高以下 |
| 撕 | 副券两侧各 88 px、下方 220 px 的垂落空间（画布可被滚动容器横向裁切，但纵向 220 px 内不能有遮挡的文字 / 按钮，否则副券落在文字上）；抓手层上伸 18 px |
| 联系层 | 舞台下 14 px 起，行高 ≥ 84；主按钮在页脚（48 × min(100%,280)） |
| 燃烧 | 纸四周各 74 px 画布（炭边、碎片、落灰落到 H + 14 + 18r）；手机高 < 720 时原件会先把票挪进「返回按钮下缘 ~ 主按钮上缘 − 16」的安全区 |
| 出席章 | 舞台高 ≥ 卡高（306.9）+ 章把手上伸（起落高度 3.0 单位 ≈ 1.25 卡高，入场从右上方飞入），即 08 屏 `flex:1` 的整块（实测 ≈ 486 px）；R9 桌面 350 px |

## 10 · 数据与动画是否分离（原件里状态改变的时点）

| 仪式 | 写入 | 时点 |
|---|---|---|
| 打印 | 不写 | 票已有效，出票只是呈现；可重播 |
| 撕 | `JuLedger.torn(EVENT)`（改期票 `choose(true)`） | **动画中途**：撕裂前沿到右端（detach）先写，成功才坠落；失败回位 + 错误行 |
| 联系 | `JuLedger.contact` | 按钮点击时写（动画前）；复制不写 |
| 燃烧 | `choose(false)` / `cancel` / `withdrawConfirmed` | **动画前**：写入成功才在下一帧点火；失败 toast「尚未退出 / 原票仍有效，请重试」，票不动 |
| 出席章 | `JuLedger.attend(v,'present'|'absent')`（R9：`H.record`） | **动画前**：先写事实再 `setMode` 播章；R9 盖章完成 `onComplete` 后才交接下一位，不自动翻页掩盖未保存结果 |

即：原件已经把“数据结果”和“动画结果”分开管理（任务书 §08 要求）；复用接口以 `onDetach / onCommit` 回调保留这一时点。

## 11 · 复用接口建议（`window.JURitual`，供十套方案调用）

加载顺序：`assets/fonts/fonts.css` → `ticket.css print.css tear.css burn.css stamp.css` → `print.js tear.js burn.js contact.js`（各自内含原件引擎）→ 出席章四个原件脚本（或由 `stamp.js` 按需注入）→ `stamp.js`。DOM 契约见 `ticket.html`（保留 `data-paper / data-paper-surface / data-paper-shadow / data-paper-shell / data-tear / data-burn / data-raster / data-wet / data-bend / data-print-stage / data-slot`）。

| 函数 | 参数 | 返回 | 说明 |
|---|---|---|---|
| `JURitual.fillTicket(stage, data)` | `data:{title,time,md,loc,meeting,host,previous?,mark?}` | — | 只填文字槽位 |
| `JURitual.measureTicket(stage, settled)` | — | 舞台高 | `measurePaper21` 原式 |
| `JURitual.print(host, data, opts)` | `opts:{final:'ready'|'torn', stub:true, tear:{onDetach,onDone}, enableTear:true, onState(s)}` | `Promise<{ok,state,webgl,reason?,message?}>` | 出票；内部先挂副券 rig；`JURitual.print.reset(host)` 重播 |
| `JURitual.tear(host, data, opts)` / `.tear.mount` | `data:{reissued?,key?}`，`opts:{onDetach():boolean,onDone()}` | `{rig, promise, enable(on), trigger(), reset(), destroy(), p, done}` | `trigger()` = 键盘路径；`promise → {ok,detachedAt,doneAt}` |
| `JURitual.contact(host, data, opts)` | `data:{host,account,added}`，`opts:{onCopy(ok),onAdd()}` | `{reveal():Promise, hide(), copy():Promise<boolean>, add(), destroy()}` | 300 / 850 ms；真实剪贴板判定 |
| `JURitual.burn(host, data, opts)` | `data:{reason:'reschedule-declined'|'cancelled'|'withdrawn', ashTitle, ashSub, ashSec}`，`opts:{variant?,duration:6.6,onDone,onState,reduced}` | `{engine, promise, pause(), resume(), seek(s), destroy(), variant}` | 先写数据再调用；`JURitual.burn.reset(host)` |
| `JURitual.stamp(host, data, opts)` | `data:{event, mode:'pending'|'present'|'absent', history[]}`，`opts:{adapter:'v27'|'r9', profile, active(), onPhase, onIndex, onComplete}` | `Promise<{engine, replay(), setMode(m), diag(), destroy(), done}>` | 先写出席再 `setMode`；`done` 在 phase=browse 时兑现 |

常量：`JURitual.print.duration=2300`、`tear.SNAP=.5 / KEY_RATE=2.8 / FALL_MS=1080 / PAD{88,18,220} / SIZE{258,84}`、`burn.DURATION=6.6 / VARIANTS`、`stamp.TIMELINE / TIMELINE_R9_QUICK / INK / ANCHOR_V27`。

## 12 · 原件里不应继承的东西

- V27 的评审外壳：手机黑边框、状态栏「9:41」、底部进度条、Cotton Candy 三维背景（`cotton-bg` / three.js / mist rig），以及 `ju-scale.js` 的整机缩放。
- 旧方案主题装饰：隐藏的「REISSUED」卡（第 1565–1580 行，Noto Sans SC 900 标题、条码、打孔；`display:none` 的遗留）、`print10()` 的百分比打印进度条（`prt10`，第 3665 行，旧 DOM 版打印）、`startStub10` 的拖 120 px 撕票（旧 DOM 版，第 3813 行）、`pr7HintPill`「往右撕副券」胶囊、`juCueTear / juCueX` 提示、`juB1–B8 / juEmber / juCharGrow` DOM 粒子（`ashDust` 为空数组，未用）、`ju-burn.js` 火焰版燃烧（未被页面调用）。
- `JuStamp` 的 v1 影片合成（`Compositor / retexture / VID_QUAD`）。
- 第 217 行把散场提示整行 `display:none` 的权宜、第 311 行用 `:has()` 按屏号隐藏联系层的选择器（新方案应按状态驱动）。
- 示例微信 `laoyang.ju` / `demo.{city}` 等演示数据、`6 小时 / 8 小时 / 24 小时` 等未确认数值（任务书 §09F）。
- 不要继承 R9 quick 章的 .56 s 时间线与 r .11 章印作为用户侧基线。

## 13 · 证据与捕获方法

- 原页：Playwright 1.56 + 本机 Chromium（SwiftShader WebGL2），`page.clock.install()` 伪时钟让 rAF / performance.now 按虚拟时间逐帧推进（页面在无 GPU 环境只有 1–2 fps，墙钟截图会漂移）；V27 走评审视图、`data-review-size=390x844`（整机 1:1）、`JU_APP.resetScreen19(屏)` 建 fixture，其余屏 `display:none`（否则 15 台手机的 WebGL 上下文把 08 散场挤成平面回退）；R9 用 `JUHost.fixture('ended-six')` + `JU_CREATE.go('s09a')`。CSS 过渡 / Web Animations 不受伪时钟控制，截图里它们按真实时间走（已在文件名标注虚拟时间）。
- 复用件：`demo.html` 同法逐帧截取（`demo-*`），每个仪式 ≥ 4 帧（开始 / 过程 / 落点 / 稳定）+ 减少动态终态 4 帧；`ticket-states-static.png` 为 `ticket.html` 四张静态样张（258 宽；未撕 351 高 / 已撕 267 / 改期 374）。
- 对照：同名仪式的 `v27-*` 与 `demo-*` 并列；票根 258 宽、主票 268 高、副券 84 高、散场局卡 245.5 宽、章 64 px 等数值一致即未缩小、未走样。

## 14 · 限制 / 待办

- R3 未上传：局主开局侧若另有票根 / 印章原件，本文无法核对。
- 出席章依赖 WebGL2；无 WebGL2 时只能显示平面图（原件行为），没有降级的 DOM 盖章动画。
- 燃烧引擎在手机高 < 720 的布局预飞（`prepareBurnLayout26`）未并入 `burn.js`（它依赖 V27 的页脚 / 返回按钮选择器）；新方案应按自身布局保证 §9 的空间。
- `demo.html` 的背景为中性占位，不是三套既定背景环境。

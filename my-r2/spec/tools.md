# 「我的局」R2 · 构建与评审工具链（核心 2 · 2026-10-22）

从 Phase B（`settings-r2/`）移植：路径 `settings-r2 → my-r2`、`JUS → JU`、`S → C` 前缀，索引键用 `my-r2/src/core/ju-data.js` 的 50 条（键名与旧十套相同），状态集按 `contract.md` §6 / §7。所有脚本头部注释都写了用法；这里只记入口、默认值与与 Phase B 的差异。浏览器工具都走 `/opt/node-tools/node_modules/playwright` 的 Chromium，截图只截手机框（`.ju-phone`），操作只在 stage 的 shadow root 内。

## 构建 `node my-r2/src/build.js`

| 环境变量 | 作用 |
|---|---|
| `JU_STANDALONE=<out.html>` | 私有构建：只写这一个文件（不写 `my-r2/concepts/project/*`、不写交付文件） |
| `JU_ONLY=C03,C05` | 只构建这些套；`C00`（`internal`）必须点名 |
| `JU_FONTS_CSS=<css>` | 内嵌 `embed-fonts.py` 产出的 @font-face，并剥掉外壳与各套的 Google Fonts `<link>` |
| `JU_CONCEPTS` / `JU_CONCEPTS_DIR` / `JU_CORE_DIR` / `JU_SHARED_DIR` | 改输入位置（测试用；默认 `my-r2/concepts/concepts.json`、`my-r2/concepts/src`、`my-r2/src/core`、`my-r2/src/shared`） |
| `JU_COVERAGE_MD` / `JU_EVIDENCE_INDEX` | 改覆盖表 / 证据索引位置（测试用；默认 `my-r2/spec/coverage.md`、`my-r2/evidence/index.json`） |

注入：`/* @panel-css */` ← `ju-panel.css` + `src/core/ju-fx.css` + 共享 CSS（若源里有 `/* @shared-css */`，共享 CSS 放那里）；`<!-- @fx-svg -->` ← `src/core/ju-fx.svg` + 共享 SVG；`<!-- @panel -->` ← `ju-panel.html`（包在 `<sc-if value="{{panel.show}}">`）；`/* @core */` ← `src/core/ju-fx.js` + `ju-data.js` + `ju-ctl.js` + `ju-review.js` + 共享 JS（`v27/` 先、`rituals/` 后、其余按字母）+ `var CONCEPT`。共享目录里 `assets/ original*/ test*/ docs/ fonts/` 与 `_` 开头的文件不注入；**不能独立解析的 JS（方法节选，如 `v27/header.js`）会被跳过并警告**，不会把十套全部弄坏。缺核心文件 / 缺 concepts.json / 缺附录文档只警告不崩（`tools/test/build.cjs` 保证）。

交付文件注入：`__JU_SOURCES / __JU_META / __JU_META_ALL / __JU_DOCS / __JU_INDEX（vm 跑 ju-data.js 取 INDEX，比较控件在它之后建立） / __JU_COVERAGE（解析 coverage.md 的 "### CNN" 五栏表） / __JU_EVIDENCE（index.json 的缩略图 data URI） / __JU_SCOPE / __JU_BUILT`。附录映射：matrix（`spec/matrix.md` 否则 `directions.md`）、refs（`concept-refs.md`）、research（`research/ledger.md`）、motion（`motion-record.md` 否则 `motion-specs.md`）、coverage、verification、limits、observations（`baseline-old10.md`）——缺的显示「尚未生成」。

**共享 JS 只注入一次**：离线交付与 `JU_STANDALONE` 私有构建里，全部共享 JS（three.js r185、backgrounds / skins-r9 / skins、rituals 引擎）作为一个 window 级 bundle 放在外壳（`<!--@shared-svg-->` / `/*@shared-js*/` 槽，在 shell.js 之前），每个模块包在 `window.__JU_SHARED[<file>]` 一次性守卫里（模块自带的 `window.JU_THREE` / `customElements.get` / `JU.shared.skins` 守卫也保留），重复执行无害；方案源的 `/* @core */` 只保留 ju-fx + ju-data + ju-ctl + ju-review + CONCEPT。共享 CSS 仍按方案注入（shadow 内需要）；共享 SVG 只含 `<defs>` 的按方案注入到 `@fx-svg`（shadow 内 `url(#id)` 需要），其余（如 `rituals/burn.svg` 参考图）放外壳一次、隐藏。Design 画布的 `concepts/project/*.dc.html` 仍自包含（每个画板带全部共享 JS）；`JU_CANVAS=1` 让私有构建也走自包含。构建输出 `window.__JU_SHARED_BUNDLE`（mode / js / css / svgDefs / svgReference / skipped / bytes）。

字体：`JU_FONTS_CACHE=.build/fonts-cache .build/fontenv/bin/python my-r2/tools/embed-fonts.py [out.css] <sources…> --common [--offline] [--require "<spec>"] [--no-required]`（默认输出 `my-r2/.fonts/fonts-embed.css`，缓存 `my-r2/.fonts/cache`；`JU_FONTS_CACHE` 可复用 Phase B 的下载）。除源文件里的 Google Fonts 链接外，默认总是加上必需家族（`v27/fonts.md` + `baseline-rituals.md` §1）：Noto Sans SC 400/500/700、Space Mono 400/700、Archivo 400/500/700、Noto Serif SC 900（只子集「出席未」）、Libre Caslon Text 700；`--offline` 只用缓存（缺的列入 missing，不联网）；旁车报告 `<out>.json`（家族 / 字重 / 子集字数 / KB / 许可 SIL OFL 1.1 / missing）由 build 读成 `window.__JU_FONTS`，外壳在附录「限制与未验证项」末尾渲染成「字体与共享资源」表。

## 外壳（`my-r2/src/shell/`）

总览（每套一张卡：j-home / h-home / j-d-tear / h-m-attendance 四台真实挂载的预览；未构建的套显示「画板制作中」；范围说明一行在页顶）· 方案（左栏 + 原尺寸舞台，面板在手机外；离开的实例 `pauseTimers()` + 动画 `pause()`，回来恢复）· 比较（挑选 2–3 套 / 全部十套；同一状态；**同步点击**：输入 data-act 值或选择器，对每个舞台 shadow root 内该元素做 pointerdown→pointerup→click；重置 / 1× / 0.5× / 尺寸 / 匿名 / 灰度 / 减少动态 / 显示面板；换组合时 `unmountHost()`：取消全部动画、`clearTimers()`、`handle.unmount()`、清空 shadow root、移除节点）· 附录（覆盖表五栏页 / 证据画廊 / 八个文档）。路由 `#overview · #concept/CNN · #compare · #appendix/<doc>`，pushState + popstate，直开 `#compare` / `#appendix` 正常。`window.JUShell.stats()` 报告当前视图之外仍在运行的动画 / 定时器数（`offline-check.cjs` 用）。

## 工具（都接受 `JU_STANDALONE=<私有构建>`，否则用交付文件）

| 工具 | 用法 | 判定 |
|---|---|---|
| `coverage.cjs` | `node my-r2/tools/coverage.cjs CNN <outdir> [--only j-]` | 50 张 + sheet；`errors []`、`mismatches []`（跳转后 `jumpKey` 不符） |
| `widths.cjs` | `node my-r2/tools/widths.cjs CNN [outdir] [states]`（默认 j-home,h-home,j-d-tear,h-m-attendance,j-many,h-pending,b-long,b-long-h） | 360/375/390/430 + 文字 115%（`toggleZoom`）+ 安全区（`toggleSafe`）：`overflow []`、`minFont ≥ 12`、字号不随宽度变、`.app` 无 transform、115% 确实放大 |
| `kb-check.cjs` | `node my-r2/tools/kb-check.cjs CNN [outdir] [states]`（默认 `h-m-reschedule,j-d-ended+[data-act="report"]`；`+选择器` = 先点开弹层） | 聚焦输入与主动作（ok/propose/submit/report）在键盘之上；`.app` 没被整体滚动 |
| `rm-check.cjs` | `node my-r2/tools/rm-check.cjs CNN [outdir] [--flows a,b]` | `prefers-reduced-motion: reduce` 下 `rmSys` 为真、`.app.rm`、`tools/flows.json` 的 11 条真实点击流程全部到达终态、无 >1ms 动画仍在跑 |
| `capture.cjs` | `node my-r2/tools/capture.cjs CNN <outdir> '<actions>'`；动作：click / key（`{"key":"Enter","focus":"[data-act=tear]"}`）/ drag / jump / flow / wait / shots / speed / rm / kb / safe / zoom / size / variant / skin / clock（`"+5m" "+1h" "+24h" "due"` → `toNextDeadline`）/ scroll / input / eval / expect | 帧 + sheet + `log.json` |
| `flow-compare.cjs` | `node my-r2/tools/flow-compare.cjs <outdir> [--codes …] [--flow enter-back] [--final] [--skin] [--span 1400] [--max 16]` | CDP screencast 真实绘制帧（7–14 fps），裁到手机，每套一行；不足 24 帧自动加长 span 重录一次；帧标签 `fK/N +Tms` 相对该段第一帧 |
| `lead-sheet.cjs` | `node my-r2/tools/lead-sheet.cjs <outdir> <state> [--codes] [--gray] [--skin halo] [--w 390 --h 844] [--zoom] [--safe] [--kb] [--final] [--actions '[…]']` | 匿名并排 / 灰度 / 同环境 |
| `coverage-matrix.cjs` | `node my-r2/tools/coverage-matrix.cjs [C01 …] [--out] [--manual] [--evidence] [--no-run]` | 写 `spec/coverage.md`：入口存在（自动）+ 每套五栏表；后四栏来自 `spec/coverage-manual.json`（`{"C01":{"j-home":{"op":"…","static":"…","motion":"…","pending":"…"},"*":{…}}}`） |
| `motion-specs.cjs` | `node my-r2/tools/motion-specs.cjs [--out]` | 汇总 `spec/motion/CNN.md` → `spec/motion-specs.md` |
| `evidence-index.py` | `python3 -I my-r2/tools/evidence-index.py [--root] [--codes] [--width 260]` | 扫 `evidence/CNN/*.png` 与 `CNN/<flow>/sheet.*`，缩略图到 `evidence/_thumbs/`，写 `evidence/index.json`（`notes.json` 的说明并入） |
| `shrink-evidence.py` / `shrink-verify.py` / `review-sheet.py` | 同 Phase B，根目录 `my-r2/evidence`，`--root` 可改 | — |
| `offline-check.cjs` | `node my-r2/tools/offline-check.cjs <file> <outdir>` | 断网：直开 `#compare` 先有索引；换三次组合后当前之外动画 / 定时器为 0、live 环境 ≤ 1 且只在当前舞台；总览每套四台到位；字体无回退；覆盖表页存在且五栏；各套打开无错误；**体积**：交付文件 ≤ 40 MB、每套源 ≤ 200 KB（`__JU_META[].srcBytes`）、每个共享 JS 模块在文件里恰好出现一次 |
| `final-check.sh` | `bash my-r2/tools/final-check.sh [C01 …]` | 对交付文件跑 standalone / offline / coverage / widths / kb / rm / flow，汇总 `evidence/final/summary.json` |
| `test/standalone.cjs` | `JU_STANDALONE=<file> node my-r2/tools/test/standalone.cjs [--shots dir]` | 外壳冒烟：无 console error、四视图路由与 back/forward、预览四台、比较初始化 + 同步点击 + 换组合卸载、附录页 |
| `test/build.cjs` | `node my-r2/tools/test/build.cjs` | 缺核心 / 缺列表不崩；标记齐全时注入正确；缺标记跳过；`JU_ONLY` 与 internal；`@shared-css`；索引 50；字体内嵌 |

选择器优先级：工具与外壳的「`a, b`」是**按顺序的备选**（第一个有可见匹配的生效），不是一个 CSS 组；同一备选里多个匹配时优先 `.cNN-over` 内的那个，否则第一个有尺寸的（`last:true` 取最后一个）。

## 负载规则（主负责人 · 2026-10-23 04:10 起，所有构建者与复核者）
本机 4 核；无 GPU 的无头 Chromium 用 SwiftShader 画 live 环境（棉糖 three.js 水面），每个页面约占满一个核。八位构建者并行时 1 分钟负载到过 40，帧序列的时间戳因此被拉长，录出来的运动不可信。
1. 所有 Playwright / Chromium 命令都经共享槽位：`my-r2/tools/slot.sh timeout 900 node …`（全机最多两个浏览器任务同时跑；06:05 起取代单锁 `flock … chromium.lock`——单锁时负载只有 2–3 却要排队十几分钟）。一次只为一个任务占槽，长批次拆成多次调用；思考与写文件时不占槽。
2. 页面挂载、环境画出第一帧（约 1s）后暂停环境引擎：`JU.shared.skins.pause(inst.envRef.current)`（ctl-regress 的同一调用；暂停留当前帧快照，静态截图外观不变）。`setSkin` 会重建 live 层，切换后约 700ms 再暂停一次。只有专门记录环境自身节奏的采集保持 live。
3. 运动帧序列只在 `uptime` 1 分钟负载 < 8 时录制，日志写明当时负载；高于此值录到的序列要重录。
4. 一次运行结束就关浏览器，不留常驻会话。

# V27 字体角色与字体文件清单

来源：`/home/user/JU/.build/baseline/V27.html`（完整 base64）；行号引用 `V27.code.html`。字体二进制未复制，仅列清单（解码脚本 `scratchpad/v27/decode_modules.py` 输出于 scratchpad，不入库）。

## 1. 字体栈（源码原文）

```css
/* V27.code.html L49 */
:root{--ju-font-ui:'Noto Sans SC','Microsoft YaHei','PingFang SC',sans-serif;--ju-title-size:30px;--ju-meta-size:14px;--ju-action-height:48px}
body{...;font-family:var(--ju-font-ui)}.ju-phone{font-family:var(--ju-font-ui)}.ju-phone button{font-family:inherit}
body{font-variant-numeric:tabular-nums;-webkit-font-smoothing:antialiased;text-rendering:optimizeLegibility}   /* L67 */
```

`--ju-title-size / --ju-meta-size / --ju-action-height` 三个 token 在 V27 里只被声明，实际标题/辅助/CTA 的数值是在 JS 内联样式里写死的（30 / 14 / 48，见 header.js、cta.js），两边一致。

## 2. 字体角色表（产品屏内实际使用）

| 角色 | 字体 | 字号 / 字重 / 行高 / 字距 / 颜色 | 出处（V27.code.html） |
|---|---|---|---|
| 外层标题（吸顶） | var(--ju-font-ui) = Noto Sans SC | 30px / 500 / 1.25 / 0 / #14161f；收拢时 line-height 1.05，字号 30→18px | title20() L4214；syncHeader23 L4467 |
| 非吸顶标题（结果页、表单页） | var(--ju-font-ui) | 30px / 500 / 1.18 / .02em / #14161F | screenTitleStyle L2527；`.ju-result-title` L245；`.ju-root-sheet h1` L248 |
| 辅助行（时间·地点） | var(--ju-font-ui) | 14px / 400 / 1.5 / 0 / #535b70 | meta21() L4215；s03b/s09 内联 L845/L1417 |
| 进度说明行 | var(--ju-font-ui) | 14px / 1.5；左侧 #4A5AD6，右侧 rgba(20,22,31,.72) | L586、L1028、L1157 |
| 主要 CTA 文案 | 继承 var(--ju-font-ui) | 14.5px / 500 / .06em / #FFFFFF（button 版 15px） | ctaTextStyle L2518；L4317 |
| 弱动作（去不了了 / 撤回） | var(--ju-font-ui) | 14px / 500 / #535969 | weak L4314 |
| 危险动作（确认退出） | var(--ju-font-ui) | 13.5px / 500 / .04em / #C0392B | q5QuitStyle L3366-3369 |
| 名单行姓名 | var(--ju-font-ui) | 15px / 500 / .02em / #14161F | L628、L1074 |
| 分组小标签（局主 / 已进 / 同局的） | var(--ju-font-ui) | 11px / 400 / .2em / rgba(20,22,31,.66) | L625、L1071 |
| 表单字段标签 | var(--ju-font-ui) | 14px / 500 / #4A5AD6 | L703、`.ju-field-label22` L281 |
| 表单输入 | var(--ju-font-ui)（vals26Form）| 18px / 400 / 1.5 / #14161f；占位 18px/400 #697183 | L4716、L404 |
| 色洗大字（填好了 / 回上一张） | 继承 | 25px / 700 / 1.12 / .01em / #FFFFFF | washFor text L2758 |
| 底部抽屉标题 | var(--ju-font-ui) | 23px / 500 / 1.3 / #252b3a | `.ju-sheet-heading h2` L226、L377 |
| 抽屉正文 | var(--ju-font-ui) | 14px / 400 / 1.75 / #535b70 | `.ju-sheet>p` L389 |
| 票根标题 | 继承 | 20px / 600 / 1.35 | `.ju-ticket-title` L262 |
| 票根时间·日期（数字） | **Archivo** | 28px / 700 / 1.1 / -.02em | `.ju-ticket-when` L262 |
| 提醒时长大数字 | **Archivo** | 92px / 500 / .95 / -.04em / #4553be | `.ju-reminder-time22` L281 |
| 候补序号大数字 | **Archivo** | 60px / 500 / 1.4 / #4553be | `.ju-queue-paper25 strong` L390 |
| 约定蓝页编号 | **Archivo** | 27px / 500 | `.ju-blue-preface25>span` L368 |
| 状态栏时间 9:41（设备 chrome，product 隐藏） | Archivo | 15px / 700 | L668 |
| 眉行 / 编号 / 小标签 / 提示 | **Space Mono** | 9.5px /.3em（eyebrow L2526）；8px /.42em（卡背 L608）；11px（规则编号 L410）；13px/700 .12em（票根品牌行 L262） | 多处，产品屏内共 132 处引用 |
| 吐司 | Space Mono | 11.5px / .04em / #F8F9FF | L664 |
| JU. 字标（s01 顶、卡背） | **Libre Caslon Text** | 28px/400（L519）；卡背 52px（L607）/ 46px（L1049），"." 为 #4A5AD6 / #5361DC | |
| 局卡 invite 包 | Libre Caslon Text 700（英文标题 7.6cqw）、Space Mono、**Caveat / Zhi Mang Xing**（手写中文标题 11.5cqw、TO/DATE 6.6cqw） | ju-card.html L18-L37 |
| 局卡 street 包 | Archivo 500/400（8cqw / 3.7cqw / 6.4cqw）、Space Mono | ju-card.html L47-L57 |
| 局卡 grain 包 | **Archivo Black**（13.5cqw）、Space Mono | ju-card.html L65-L70 |
| 局卡 mono 包 | Space Mono 700（6cqw 中文标题带 Noto Sans SC 回退） | ju-card.html L80-L86 |
| 局卡 riso 包 | Noto Sans SC **900**（11.5cqw）、Archivo 800、Space Mono | ju-card.html L93-L103 |
| 局卡 acid 包 | **Oswald** 500/600（7cqw/4.5cqw）、Noto Sans SC 900（12.2cqw）、Space Mono 700 | ju-card.html L111-L117 |
| 成员资料抽屉 | 继承 var(--ju-font-ui)；名字 23px/500；字段 12.5px / 14.5px 500；handle Space Mono 11.5px | ju-member.html L15-L26 |

Noto Serif SC 只出现在评审画布的顶栏（L481-L482，`font-weight:900;font-size:30px`），product 视图下该区域 `display:none`（L53），产品屏内未使用。Microsoft YaHei 只作为 `--ju-font-ui` 的回退以及 ju-envelope.js 里 canvas 绘字的回退（`'30px "Microsoft YaHei",sans-serif'`，ju-envelope.js L70-L71）。

字重实际用到（产品屏）：Noto Sans SC 300（3 处，app 内联）、400、500（最多，14+6 处）、600（3 处，票根标题等）、700（6 处）、900（局卡 riso/acid 标题）。Archivo 400/500/700/800；Space Mono 400/700；Libre Caslon Text 400/700（+italic 400 仅评审画布）；Caveat 600/700；Oswald 500/600/700；Archivo Black 400；Zhi Mang Xing 400。

## 3. 字体文件清单（全部内嵌）

- 嵌入方式：引导脚本（V27.code.html L3-L35）把 `data` 表（L4）里的 **326 个 .woff2** 解成 Blob → `URL.createObjectURL`，再把 L14 的 `css`（Google Fonts CSS API 风格的 `@font-face` 表，**863 条**，`font-display:swap`，按 unicode-range 切片）里的 `JU_STANDALONE_BLOB_…_END` 占位符替换成 blob URL（L13 fontMap、L15），以 `<style data-standalone-fonts>` 注入 head（L32）。ju-card.html / ju-member.html 通过 `href="./assets/fonts.css"` 共享同一张表（L24）。
- 字体文件总字节：13,856,904（全部 326 个 woff2 均被 fonts.css 引用，无冗余）。
- `font-family` 声明与文件（同一家族多个字重共用同一组文件 = 可变字体切片；Space Mono、Libre Caslon Text 为静态字重各自文件）：

| 家族 | 声明的字重/样式 | @font-face 条数 | 唯一文件数 | 字节 | 切片方式 |
|---|---|---|---|---|---|
| Noto Sans SC | 300 / 400 / 500 / 700 / 900（normal，5 个字重共用同一组文件） | 505 | 101 | 4,516,508 | CJK 101 片 unicode-range |
| Noto Serif SC | 700 / 900（共用） | 202 | 101 | 6,027,992 | CJK 101 片 |
| Zhi Mang Xing | 400 | 92 | 92 | 2,566,104 | CJK 92 片 |
| Archivo | 300 / 400 / 500 / 600 / 700 / 800 normal + 300 / 400 italic（共用 3+3 文件） | 24 | 6 | 169,668 | latin / latin-ext / vietnamese |
| Archivo Black | 400 | 2 | 2 | 32,936 | latin / latin-ext |
| Caveat | 600 / 700（共用） | 8 | 4 | 224,476 | latin / latin-ext / cyrillic / cyrillic-ext |
| Libre Caslon Text | 400 / 700 normal，400 italic（各自文件） | 6 | 6 | 122,056 | latin / latin-ext |
| Oswald | 500 / 600 / 700（共用） | 15 | 5 | 72,492 | latin / latin-ext / vietnamese / cyrillic / cyrillic-ext |
| Space Mono | 400 / 700 normal，400 italic（各自文件） | 9 | 9 | 124,672 | latin / latin-ext / vietnamese |

文件名均为 `./assets/<uuid>.woff2`（完整映射见 scratchpad `fonts.rows.json` / `assets/fonts.css`，不入库）。

## 4. 许可信息

- **V27 内未嵌入任何字体许可文本**（全文检索 "SIL Open Font" / "OFL" / "fonts.google" 为 0 命中；唯一的 "OFL" 子串命中是 ju-envelope-art.js 内 PNG base64 的巧合）。V27 嵌入的第三方许可声明只有：three.js r185 MIT（L423 模块头）与 @shadergradient/react 2.4.20 MIT（cotton-bg.js 头，见 backgrounds.js）。
- 这些家族在 Google Fonts 公开目录下的许可（公开信息，非 V27 内证据，使用前需自行核对）：Noto Sans SC、Noto Serif SC、Archivo、Archivo Black、Caveat、Libre Caslon Text、Oswald、Space Mono、Zhi Mang Xing 均以 SIL Open Font License 1.1 发布。随产品分发时应补齐 OFL 文本与保留字体名约束。

## 5. 与任务书描述的差异

- 任务书说"标题约 30px、辅助约 14px、收至约 18px"：源码精确值为 30 / 14 / 18（`30-12p`），实测见 `spec/baseline-v27.md`。
- 字体并非"var(--ju-font-ui) 指向多个字体文件"：UI 字体只有 Noto Sans SC（可变字体切片），其余家族只用于数字、英文字标、局卡视觉包与小标签。

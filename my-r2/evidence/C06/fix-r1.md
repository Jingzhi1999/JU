# C06「字排」· fix-r1：独立复核（快照 0f028c080d4b）之后的修改

- 源文件：`my-r2/concepts/src/C06.dc.html`，172,840 字节（169 KB，上限 200 KB）。
- 构建：`JU_FONTS_CSS=/home/user/JU/my-r2/.fonts/fonts-embed.css JU_STANDALONE=.build/C06.html JU_ONLY=C06 node my-r2/src/build.js`（含共享层三处新改：燃烧句柄 onDone、出席更正焦点、截图浏览器中文）。
- 本轮证据全部在 `my-r2/evidence/C06/fix-r1/`；stage1 / stage2 证据未动。所有运动帧、静帧、四个自动工具、env-probe 与对比度路线都是在同一个终版构建上录的（20:53–21:04 UTC）。
- 帧证据都来自真实点击 / 拖动 / 按键 / 滚轮（`clickSel` = 先 `reveal` 再在元素中心发真实鼠标点击；拖撕是真实的按下-移动-松开；面板按钮也是真实点击），每条流程从首页起步，不走索引跳转。只有四个自动工具（coverage / widths / kb / rm）和 env-probe 按约定用索引跳转。
- 运动帧只在 1 分钟负载 < 8 时录（每段录制前检查，`log.json` 里每段 `loadBefore / loadAfter / loadOk`，本轮全部 `loadOk: true`）。
- 帧标签：`input+Nms` = 距离这次真实输入（pointerdown / keydown）的毫秒；`release+Nms` = 距离松手（pointerup）的毫秒。页内另用 rAF 逐帧采样（时间从 pointerdown / pointerup 起算），写在 `log.json` 的 `*-timeline` 里。
- 截图里的 PNG 已用 `my-r2/tools/shrink-verify.py` 转成 JPG（`checks/env/` 的 7 张保留 PNG，便于 env-count 复算）。

## 工具复跑（终版构建）

| 工具 | 结果 | 证据 |
|---|---|---|
| coverage | 50 / 50 状态，errors 0，mismatches 0 | `checks/coverage/` |
| widths | 48 张，overflow 0，findings 0，最小字号 12px，zoom / safe api ok | `checks/widths/` |
| kb | 2 张，findings 0，errors 0 | `checks/kb/` |
| rm（减少动态） | rmSys true，flows 11 / 11，findings 0，errors 0 | `checks/rm/` |
| env-probe + env-count | 7 页全部 ≥ 13.4%（见下） | `checks/env/`、`checks/env/env-count.json` |
| 对比度（真实点击路线，10 页 × 三环境） | 30 页次全部 ≥ 4.5:1，最低 4.76:1（日落页头上的弱动作） | `contrast/summary.txt`、`contrast/sheet.jpg` |

环境比例（`env-count.py`，[直接露出 %, 透出 %]）：

| 页面 | 比例 |
|---|---|
| 首页 · 参加者 j-home | 14.0 / 14.4 |
| 首页 · 局主 h-home | 14.1 / 14.4 |
| 详情 j-d-invited | 13.9 / 14.4 |
| 票根 j-d-tear | 13.4 / 14.9 |
| 历史 j-d-ended | 13.7 / 15.1 |
| 管理 · 审核 h-m-review | 13.7 / 15.1 |
| 管理 · 出席 h-m-attendance | 13.6 / 14.8 |

## Major

**M1 · 连按两次返回后展开层留在布局里吞点击**

- 原因：控制器在 exit 阶段、栈深 < 2 时再次 back，只改状态不 setState，展开层的 DOM 留着。
- 改了什么：返回改成幂等。本套在 `JU.mixin` 之后包一层 `back()`：退场途中再按一次 → `_landBack()` 直接落到终态（收起动画与滚动时钟一律 finish、取消 nav 计时、出栈并 setState、`_snap` 跳过动画）；排队中的返回（`_backQ`）不重复入队。收起一开始，正在收的段落就 `pointer-events: none`；结束或被打断都走同一个清理。
- 证据（真实双击，页内记录两次 pointerdown 的间隔）：`M1/sheet.jpg`；帧 `M1/M1-90-dbl-*.jpg`、`M1/M1-40-dbl-*.jpg`、`M1/M1-*-tap-run3k-*.jpg`；静帧 `M1/M1-90-1-landed.jpg`、`M1/M1-90-2-run3k-open.jpg`、`M1/M1-40-*.jpg`；数字 `M1/log.json`。
- 实测：两档实际间隔 97ms / 46ms；两档都落到 `stack=home phase=idle`，`.c06-x` 0 个；在「公园慢跑 3K」中心做命中测试，命中的就是这一行；再点进入 `ticket:run3k`。

**M2 · 票根返回约 400ms 无反馈、剪切 + 空白纸**

- 改了什么：返回一按下（pointerdown，不等 click）就给反应：票根变暗、上移 8px、缩到 .975（220ms，快起缓收，从第 40ms 处起播，按下后第一帧就看得出），其余内容降到 .5；按下后没有点成（移出按钮再松手、pointercancel、1.5s 内没有 click）就原路退回。键盘 Enter 仍在 click 时起。控制器的 back 推迟两帧，保证反应先画出来。新页画好之前旧页一直在（变暗留着），新页的内容从 .5 淡入，不从 0 开始，所以没有空白帧。
- 证据：`M2/sheet-a.jpg`（首页 → 详情 → 阅读 → 票根，再返回到详情，每帧）；帧 `M2/M2-a-back-to-detail-*.jpg`；时间线 `M2/log.json` 的 `M2-a-timeline`。按下没点成：`M2/press-cancel/`（真实按下返回 → 移开 120 / 160px → 松手：+120ms 票根 0.33，+620ms 回到 1.00，栈仍是 `home > detail > ticket`；`log.json`、`P5-after-cancelled-press.jpg`）。
- 实测（页内，从 pointerdown 起，录制时 1 分钟负载 5.8–6.8）：第一个采样帧 +11ms 票根已是 0.58（文字 0.65）→ +45ms 0.44 → +67ms 0.40 → 停在 .3 / .5 一直可见 → +362ms 详情画出（高度 685 → 888 继续长），中间 0 帧空白。录屏帧：按下后的第一帧 `input+45ms` 已变暗，`input+400ms` 前后是详情。

**M3 · 局主取消缺「局卡抽色 + 余烬」，「已取消」头部在视野外**

- 改了什么：`onEffect('cancelled')` → 弹层下沉的同时把这一局的头部滚回视野（120ms 后起，360ms）；480ms 后局名墨色抽到 `--cx`（棉 #4F5466，晕 / 日落 #3D4254）900ms，同时 18 粒余烬（9px 暖色光点）从局名基线升起 30–70px 后熄灭。头部读的是实时数据（`_liveH`），不再是冻结的行，所以状态行当场变成「票根作废 · 联系已关闭」。减少动态：直接落定。
- 证据（真实点击：发起的 → 德州扑克新手桌 → 取消这局 → 面板「下一次写入失败」→ 确认取消 → 层内失败 → 重试）：`M3/sheet.jpg`；帧 `M3/M3-retry-cancel-*.jpg`；静帧 `M3/M3-0-manage.jpg` … `M3/M3-3-settled.jpg`；`M3/log.json`。
- 实测：落定后头部在列表顶下 10px；状态「票根作废 · 联系已关闭 · 已确认 2/3 · 预留 1」；局名颜色 rgb(79, 84, 102)。

**M4 · 暂停 / 关键帧没有接上原地展开**

- 改了什么：展开、收起、换段、换组都是脚本动画；滚动补间改成读一段挂在滚动容器上的空 WAAPI 动画（「滚动时钟」）的 `currentTime`。暂停 = 暂停根节点下本套的有限动画（燃烧走引擎 `seek / pause`）；关键帧 = 每段动画按相对本次运动起点的偏移设 `currentTime`，0 / 25 / 50 / 75 / 100 就是展开过程的五个位置；释放 = 从当前位置播完。运动结束后，`lastMotion` 登记的是原地重放（回到打开前的滚动位置、窗口从 0 打开），不重走导航。
- 同轮补修：6 小时倒计时细条原来每秒做一次 900ms 的宽度过渡，窗口里永远「有东西在动」，复核面板因此判断不了运动已结束，关键帧不能重播（第一次复跑的 `M4-replay-*` 五张一样）。细条改成 `transform: scaleX(var(--ratio))`、不做过渡（每秒变化 1/21600，看不出差别）。
- 证据（0.5×，真实点击「法拉盛早茶」，+230ms 点面板「暂停」）：`M4/sheet.jpg`；静帧 `M4/M4-p0-paused.jpg`、`M4/M4-p1-paused-700ms-later.jpg`、`M4/M4-k000.jpg` … `M4/M4-k100.jpg`、`M4/M4-r0-released-settled.jpg`、`M4/M4-replay-k000.jpg` … `M4/M4-replay-k100.jpg`；`M4/log.json`。
- 实测（scrollTop / 段落窗口 top）：暂停 +0 与 +700ms 完全一样（684 / 417，19 段动画全部 paused）；关键帧 0 / 25 / 50 / 75 / 100 = 598 / 598 / 773 / 800 / 804（窗口 −360 → 379 → 427 → 444 → 444）；释放后落定 804；落定后再拖关键帧 = 598 / 636 / 779 / 801 / 804（窗口 −360 → 412 → 430 → 444 → 444），原地重放。

**M5 · 拖撕落定：旧 CTA 不退场、副券落在按钮 / 联系层上、整页上跳 ~113px、页头换文案时高度跳**

- 改了什么：撕开的那一刻（松手过半、Enter / 空格或按钮）旧 CTA 立刻退场（150 / 200ms 淡出下沉，`.is-leaving` 由 VM 绑定、同帧也直接加，CTA 下的全宽色光带同时退，CTA 撤走后光带保留不变）；联系层改到副券落地（原件 `onDone`）之后才显出，副券落在空纸上；把联系层带进视野的滚动等票台收起后再起，一次 420ms，并且不把局名推到页头下面；页头换文案时票台用 transform 补偿。
- 证据：`M5/sheet-a.jpg`（公园慢跑 3K 拖撕）、`M5/sheet-b.jpg`（周五 Livehouse 新票拖撕 = 接受新时间）、`M5/sheet-c.jpg`（键盘 Enter 撕）；帧 `M5/M5-a-drag-tear-*.jpg`、`M5/M5-b-drag-accept-*.jpg`、`M5/M5-c-key-enter-*.jpg`；`M5/log.json` 的 `M5-a-timeline / M5-b-timeline`。
- 实测（页内，从松手起）：CTA 不透明度 +26ms 已为 0（b：+29ms）；+167ms 副券脱离（b：+168ms）；联系层 +1.24s 才挂上（b：+1.34s）；票台收起后联系层直接放得下，这次滚动 0px（票台 top 322 → 322，scrollTop 不变），没有任何跳动。

## Minor

**m1 · 移组行连续移动（FLIP）**：换组的那一行作为一张不透明的纸条从旧位置滑到新组（360ms，`translateY` + 一道很浅的抬起阴影 .38 → 0），其余行让位；落定后左侧 1.1s 落点标记。收起时不再先把这一行淡掉。证据：`m1/sheet.jpg`（公园慢跑 3K 已加微信后：要你回应 → 就快见面；周五 Livehouse 接受新时间后），帧 `m1/m1-back-regroup-*.jpg`、`m1/m1-back-regroup-livehouse-*.jpg`。

**m2 · 首页「阅读并确认」并成一段**：先做这件点「阅读并确认」= 栈 `home > read` 一次运动（阅读层从底部升起盖住列表），约 300ms 到位（帧 `input+97ms` 已在升，`input+355ms` 到位）。证据：`M2/sheet-b.jpg` 上半，帧 `M2/m2-lead-read-*.jpg`，静帧 `M2/m2-read-up.jpg`。

**m3 · 首页放弃预留先给结果行再退场**：先做这件「去不了了 → 确认退出」→ 该行原位换成「已处理 · 位置已释放 · 不记主动失约 · 已移到历史」1.3s（光带与 CTA 收起），再自身高度 300ms 收到 0，下一件「先做这件」补上。证据：`m3/sheet.jpg`，帧 `m3/m3-release-*.jpg`。

**m4 · 原地展开时局名不动**：局名留在原处，除非段落里的原件放不进粘底动作之上；那时列表只移动放下原件所需的距离，最多把局名带到页头下 12px，不再更远（联系层的补滚也受这条限制，不再把局名推到页头下面）。只有局名最终落到列表顶 72px 以内时，上方各局才一次退场；否则它们留在原处、按 .28 变暗，不留空白带（`M3/M3-0-manage.jpg` 即此）。实测（真实滚轮定位 + 真实点击）：① 新手攀岩（面板「当前较多」，局卡）在列表顶下 100px 处点开 → 仍在 100px，scrollTop 367 → 367，局卡下沿 602px（粘底动作之上的界限 630px）；② 同一行在 419px 处点开 → 120px，列表移动 299px，局卡下沿 622 + 8 = 630，正好放下；③ 外百老汇（票根 + 联系层）在 530px 处点开 → 12px（scrollTop 302 → 820），上方各局一次退场。证据：`m4/sheet.jpg`，帧 `m4/m4-open-high-*.jpg`、`m4/m4-open-mid-*.jpg`、`m4/m4-open-low-*.jpg`，静帧 `m4/m4-high-open.jpg`、`m4/m4-mid-open.jpg`、`m4/m4-low-open.jpg`，`m4/log.json`。

**m5 · 键盘撕票与「更正」后的焦点**：键盘 Enter 撕票 → 联系层出现后焦点在「复制」（`BUTTON.ju-contact-copy`）；出席「更正」→ 焦点留在同一个人的「出席」（`BUTTON.c06-ta [attend-present]`，共享层新构建，不滚动）。证据：`m5/sheet.jpg`、`m5/M5-c1-focus-on-copy.jpg`、`m5/m5-att-1-correct-focus.jpg`，`m5/log.json` 的 `m5-correct-focus`、`M5/log.json` 的 `m5-kb-tear-focus`。

**m6 · 草稿撤销倒计时按时钟走**：倒计时读控制器 undo 计时器的到期时刻（暂停时停、0.5× 时减半），每秒刷新。实测 0 / 2 / 4s = 「撤销 · 9s / 7s / 5s」。证据：`m6-m7/m6-0s.jpg`、`m6-2s.jpg`、`m6-4s.jpg`，`m6-m7/log.json`。

**m7 · 草稿补位滑动**：删除的那一份高度 260ms 收到 0（同时淡出右移），下一份跟着滑上来；撤销时恢复的那一份高度 0 → 原高 280ms，下面的让开。同轮补修：列表按序号复用节点，收起那一行的节点会拿去显示下一份草稿，原来它会带着淡入过渡「先淡出再淡回」；现在换内容的那一帧关掉它的过渡，下一份不再闪。证据：`m6-m7/sheet.jpg`（面板「只有草稿」→ 发起的；删中间一份「冬至火锅」→ 撤销），帧 `m6-m7/m7-delete-*.jpg`、`m6-m7/m7-undo-*.jpg`。

**m8 · 改时间提交后「重印」被看见、toast 不压页头**：弹层下沉后，答复区「改为 周四 12.24 · 19:30」与头部时间从左到右重印（clip-path 620ms，延 320ms），原定时间划掉；toast 放在粘底动作之上。实测 toast 上沿 835 / 下沿 880，页头下沿 164（页面坐标）。原生日期控件显示 2026/12/24 · 19:30（中文浏览器）。证据：`m8/sheet.jpg`，帧 `m8/m8-propose-*.jpg`，`m8/log.json`。

**m9 · 文案排版**：去掉 `.c06-line.you>b::after`（不再「你（你）」）；「参加约定」改成左右两栏、右栏左对齐（`is-rule`）；段落内不重复状态行（结果块 / lede / 回执与状态行相同就不出）；状态行自身不重复（只是把状态再说一遍的单句省掉：「已撤回 · 申请已撤回」→「已撤回」）；候补回执不再重复状态行的「轮到你时才开始 6 小时预留」；候补轮到的回执不再重复倒计时那句「请在 … 前阅读并确认」；名单复制失败只留行内「未能复制 · 重试」；草稿摘要只留页头「删除草稿」（段落打开时行内的删除收起）；未命名草稿与撤销提示统一叫「未命名的局」。证据：`m9/sheet.jpg`、`m9/sheet-zoom.jpg`（2× 头部：撤回后状态行只剩「已撤回」；候补 lede 只剩「2 位 已加入候补」；候补轮到只剩一句「请在 今天 20:40 前阅读并确认」和「邀请的6小时已开始计时。」），静帧 `m9/m9-1-invited.jpg` … `m9/m9-7-draft-summary.jpg`（m9-5 走面板「当前较多」→ 点新手攀岩），各页文本在 `m9/log-ma.json`、`m9/log-mb.json`。

**m10 · 对比度**：范围脚注 `.c06-foot` 在段落打开时整句隐去（不再以 .28 显示），列表态用 `--faint`；作废 / 未成行状态字 `--void` 棉 #5C6174，晕 / 日落 #3D4254；晕 / 日落的 `--warn` 改 #7A1229，`--cx` #3D4254。量法：每段文字的墨 = 计算色 × 自身 alpha × 所有祖先 opacity，叠在它身后真实像素（框内第 90 百分位）上算 WCAG 比；段落打开时背后按 .28 变暗的列表是上下文，单列不判。实测（10 页 × 棉 / 晕 / 日落，路线全是真实点击，`contrast/route.json`）：范围脚注 1.44:1 → 棉 4.94:1、晕 / 日落 5.90:1；作废字 4.45:1 → 棉 5.89:1、晕 / 日落 9.55:1；30 页次最低 4.76:1（日落页头上的「查看局卡 / 补充记录 / 撤回报名」）。证据：`contrast/summary.txt`、`contrast/sheet.jpg`、每页 `contrast/<页>-<环境>.txt` 与截图。

**m11 · 草稿空态**：草稿全删后，空态是一份字排提纲「一份草稿会记下：局名 / 时间 / 地点 / 人数」（横线与小字，与列表同一套字阶）。证据：`m11/sheet.jpg`、`m11/m11-drafts-empty.jpg`（真实点击删完 3 份，`m11-drafts-left = 0`）。

**m12 · 减少动态下抓手圆点**：面板「减少动态」后，撕票起点的圆点不再做呼吸动画（`animation: none`），静止画在起点，不透明度 1。证据：`m12/sheet.jpg`、`m12/m12-stub-crop-2x.jpg`，`m12/log.json`（`dot animation=none knob opacity=1`）。

## 命题修正（m4）

命题「局名不动」保留，写明例外：段落里的原件（票根 258×351，未撕时连副券约 470px 高；局卡 212×265）放不进粘底动作之上时，列表滚动刚好放下原件的距离（与展开同起同落，一次），并且不超过「局名在页头下 12px」。理由：票根的副券要能直接撕、局卡要整张可见；若局名死守原位，点到中下部的局时副券会落在粘底 CTA 和根导航下面，撕不到。已同步写进 `my-r2/spec/motion/C06.md` 第五节。

## 共享层（未改，记录）

- 无新增问题。本轮用到的共享改动：燃烧句柄 onDone（seek 到底时）、出席更正焦点留在本人、截图浏览器中文。

# C09「地点」· 修复轮 2（对 `verify.md`「复核第 2 轮」）

源文件 **201,678 B**（≤ 200 KiB；构建报 197 KB）；构建 10-29 21:24（`.build/C09.html`）。证据 `fix-r2/`：真实点击 / 滚轮，从 j-home 起步；1× 与 0.5× 都是 CDP 逐帧，负载 4.3–6.5（< 8）。`fNN.jpg` 是证据里的编号，括号里是原录制帧号（`frames.json` 有对照）。

## 必须修
**R2-M1 返回落点**：替换（阅读 → 查看票根）时，新票根项沿用原入口 key（`row-brunch`）；返回时共享层按这个 key 把移到别组的那一行软滚进视野，C09 发现先做块已换成别的局时，区带改飞这一行所在的区头（用版面坐标，直接到位、不穿过其他行），落点落在这一行。读数（`R2-M1-landing/probe-1x.json`、`probe-rm.json`）：栈 `ticket:row-brunch`；首页 scrollTop 560，「周六早午餐」行顶 467（手机高 844），`is-landing`；离开从点击后第一帧就开始（1× 每帧都在退）。逐帧：1× `R2-M1-landing/1x/sheet.jpg`，减少动态 `R2-M1-landing/rm/sheet.jpg`。

**转场两拍**：离开的一方 80ms 内 ease-in 退到 0，到来的一方 90ms 后才开始（160ms ease-out）；替换时下层首页隐藏，离开页区带隐藏、票根区带接力；区带位移缩到 240ms，在到来一拍前基本到位。逐帧读数（`two-beat/probe-six-paths.json`、`probe-read-to-ticket.json`）：六条路径 + 阅读 → 票根，「两层同时 > 0」的采样 **0 个**。逐帧（左 = 离开最后一帧，中 = 只剩区带的一帧，右 = 到来第一帧）：
- 1×（`two-beat/1x/`）：首页 → 详情 f03 / f04 / f05（帧 11 / 12 / 13）；详情 → 首页 f16 / f17 / f18（31 / 32 / 33）；先做块 → 阅读 f25 / f26 / f27（83 / 84 / 85）；阅读 → 首页 f39 / f40 / f41（105 / 106 / 107）；首页 → 票根 f49 / f50 / f51（145 / 146 / 147）；票根 → 首页 f59 / f60 / f61（216 / 217 / 218）；阅读 → 票根 f67 / f68 / f69（368 / 369 / 370）；票根 → 首页（落点）f76 → f77（418 → 419，相邻两帧各只有一层）。
- 0.5×（`two-beat/0.5x/`）：首页 → 详情 f05 / f06 / f07（17 / 18 / 19）；详情 → 首页 f17 / f18 / f19（51 / 52 / 53）；阅读 → 首页 f28 / f29 / f30（184 / 185 / 186）；票根 → 首页 f42 / f43（319 / 320）；阅读 → 票根 f52 / f53–f54 / f55（561 / 562–563 / 564）；票根 → 首页（落点）f58 / f59 / f60（639 / 640 / 641）。
- 局名不再同时出现两份：离开页的局名在中间那帧之前已经退到 0。

**阅读层页脚透字**：阅读正文加 `mask-image`，按页脚实测高度（`--c09-fh`），在页脚上沿以上 36px 内淡出，页脚后面没有字；正文底部留出页脚高度 + 30px。`read-footer/r2-m3-read-foot-midscroll.jpg`（滚动中）、`r2-m3-read-foot-end.jpg`（读到末尾）。

## Minor
- 候补前移 toast：变化的行落在 toast 区（底部 210px）时，toast 等 1.6s 高亮结束再出。`minor/r2-clk-a-300ms.jpg`（+300ms 只有行高亮、没有 toast）、`r2-clk-b-2000ms.jpg`（toast 在 715，行在 541–642），`log-clock-toast.json`。
- 改时间 toast：弹层（含 230ms 收起残影）还在时不显示 toast。`minor/reschedule-toast/sheet.jpg`。

## 工具（同一构建）
coverage 50/50（errors 0，mismatches 0）· widths 48 张（overflow 0，findings 0，最小字号 12）· kb findings 0 · rm 11/11、findings 0（`fix-r2/checks/`）。

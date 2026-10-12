# C02 站牌 · final pass：真实时间窗口改走 `hold()`

范围：只改 `concepts/src/C02.dc.html` 里的计时归属，没有改设计，也没有动其他方案的文件。
依据：`spec/concept-contract.md` §11。`this.hold(ms, fn)` 与 `after()` 一样受暂停 / 重置 / 清除控制，0.5× 时拉长，但「减少动态」下不会压成 0ms。

关闭的开放项：verify-r1 的 **M-new**。原问题是减少动态下所有真实时间计时器都立即触发：
- 草稿撤销条消失；
- 6 小时倒计时狂奔到 00:00:00，与「剩 5h」矛盾；
- toast 和「已复制」都看不到。

## 一、after → hold 的改动（4 处）

| # | 位置（当前行号） | 窗口 | 改前 → 改后 |
|---|---|---|---|
| 1 | `:1265 toast(text)` | toast 显示 2.6s | `this.setState({ toast: text, toastOn: true }); this.after(2600, () => { if (this.state.toast === text) this.setState({ toastOn: false }); })` → `this.hold(2600, …)` |
| 2 | `:1282 copy(text, key)` | 复制成功反馈停留 2.2s：按键「已复制」/ 读卡器「已复制 · COPIED」 | `… this.toast('微信号已复制'); … this.after(2200, () => { if (this.state.copied === key) this.setState({ copied: '' }); })` → `this.hold(2200, …)` |
| 3 | `:1284 startTick()` | 6 小时预留倒计时，每秒一 tick（两处：首次 arm 和每步续 arm） | `this.setState(s => ({ tick: s.tick + 1 })); this._ticking = true; this.after(1000, step); }; this.after(1000, step);` → 两处都改为 `this.hold(1000, step)` |
| 4 | `:1714 deleteDraft()` 成功回调 | 草稿撤销窗 10s | `this.setState({ leaving: null, undo: {…} }); this.after(10000, () => { … JU.engine.commitUndo(…) … })` → `this.hold(10000, …)` |

## 二、为同一问题补的两处

**1. 倒计时归零即停（`:1284`）**
- 在 `step` 里加了 `if ((j.lead.left || 0) - this.state.tick * 1000 <= 0) return;`。
- 到 00:00:00 后不再续 tick。verify-r1 记录过「归零后仍以每秒数百次 setState」，这一条同时消除。

**2. 撤销条底部进度线（`:228–230`、`:713`、`:1789`）**
- 这条 2px 进度线原来用 `calc(10000ms * var(--k))` 计时。共享的 `.rm *{animation-duration:1ms!important}` 会把它当帧清空，于是撤销条还在，「剩余时间」却显示为 0。
- 它是撤销窗的时钟，不是装饰，所以改成：
  - 新增根变量 `--kt`，渲染值 `kt: s.review.speed === 0.5 ? 2 : 1`，只随速度变化，与 `hold()` 一致；
  - `.c02-undo .bar` 的动画时长改用 `var(--kt)`；
  - 加一条 `.rm .c02-undo .bar{animation-duration:calc(10000ms * var(--kt,1))!important}`，减少动态下也按真实 10s 走完。
- 这是一根 2px 的线性缩短线，没有位移，也没有视差。

## 三、保留 `after()` 的调用（动画落定，共 52 处）

| 类别 | 行号 | 为什么保留 |
|---|---|---|
| 翻牌落定 | :1258 | 清 `_flip` |
| 处理中延时 | :1279 | `run` 的 480ms busy |
| 切换身份 / 分区 / 重读的翻出翻入 | :1290、1296、1366 | — |
| 详情进出 | :1378–1381、1394–1403 | 含落点行标记 1400ms。它是 CSS `c02-land` 动画，时长 ×`--k`，在 `.rm` 下本来就是即时结果 |
| 弹层进出与规则读完检测 | :1424、1425、1428 | — |
| 关弹层后换场 | :1434、1438–1442 | 380ms |
| 燃烧 / 插卡 / 回弹 | :1463、1478、1481、1490、1497 | — |
| 过闸各相位与过闸后 toast 的起点 | :1500、1505–1511 | toast 本身的停留已由 hold 负责 |
| 管理盘进出、滚动定位、区块琥珀闪 | :1615–1628、1621 | 闪是 `c02-land` 动画 |
| 新座位灯 / 出席灯 `fresh` 类清除 | :1630、1632 | 都是 500ms 的点亮动画 |
| 改时间重印、散场滚动 | :1635、1637 | — |
| 取消时小卡飞入 | :1641–1652 | — |
| 删稿离场 | :1712 | 380ms |
| 撤销 / 失败后入场 | :1715、1718 | 460ms |

减少动态下，这些动作的结果都会立即出现（verify-r1 的 `rm/` 已经验证，本轮没有改动它们）。

## 四、验证

**构建与覆盖**
- 构建：`JU_STANDALONE=/home/user/JU/.build/C02.html node src/build.js`，构建通过。
- 覆盖：`node tools/coverage.cjs C02 evidence/C02/final/coverage`，结果 **50/50，errors 0**（`evidence/C02/final/coverage/sheet.png`）。

**(a) 减少动态 ON**（先执行 `eval "inst.toggleRM()"`）
- `evidence/C02/final/rm-draft-undo/`：
  - f01 草稿列表；f02 点「删除」，立即出现「没有草稿」和撤销条，没有离场动画，即时出结果。
  - f02–f09 共 7 帧、约 8.7s，撤销条一直在，底部进度线逐帧缩短。
  - f10 点「撤销」，「雨天读书局」回到原位；f11 稳定。
- `evidence/C02/final/rm-copy-toast/`：
  - 局主管理盘 · 联系信息，点 Leon 的「复制」。
  - f02–f06（约 2.2s）按键为「已复制」，f07 起恢复为「复制」。
  - f03–f07（约 2.5s）底部 toast「微信号已复制」可见，f08 起消失。
- `evidence/C02/final/rm-countdown/`：lead 倒计时 04:21:00 → 04:20:59 → … → 04:20:53，每秒一跳，不再狂奔。
- `evidence/C02/final/rm-countdown-detail/`：
  - 停 5s 后，列表显示 04:20:55。
  - 进入详情后，倒计时显示 04:20:54，同屏「已预留 · 剩 5h」，两者不再矛盾。

**(b) 减少动态 OFF**（1×，与之前一致）
- `evidence/C02/final/draft-undo/`：
  - f02 行收拢离场；f03–f09 撤销条在场，进度线缩短；f10 撤销后行入场回位；f11 稳定。
- `evidence/C02/final/copy-toast/`：
  - f02–f06 显示「已复制」；f03–f07 显示 toast「微信号已复制」。
- `evidence/C02/final/countdown/`：每秒一跳。

**计时探针**（`evidence/C02/final/probe.json`，每 80–100ms 轮询一次实例状态和 DOM）

| 指标 | 减少动态 ON | 减少动态 OFF |
|---|---|---|
| 撤销窗 | 9901ms，删除后 14ms 出现 | 9881ms，离场 418ms 后出现 |
| 8.5s 时撤销条仍在 | 是 | 是 |
| 点撤销后草稿 | 回到 `["雨天读书局"]` | 回到 `["雨天读书局"]` |
| 进度线 `animationDuration` | `10s` | `10s` |
| 进度线宽度 | 366px → 5s 时 173px | 5s 时 188px |
| toast 可见 | 2522ms | 2508ms |
| 「已复制」可见 | 2239ms | 2261ms |
| 倒计时 10s 内 tick 数 | 10（04:21:00 → 04:20:50） | 10 |
| 页面 errors | 无 | 无 |

所有 capture 的 `log.json`，errors 都为空。

## 五、未改动的范围
- verify-r1 的 minor n1–n3 不在本次范围内。
- 管理盘底部 toast 停留时会压住「记为散场」这一行的文字，1× 下也一样。这是既有布局，本次没有改。

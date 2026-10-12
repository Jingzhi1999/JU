# C06 桌面 · final pass: hold() audit (contract §11) + full event names

Scope: a small, targeted pass on `concepts/src/C06.dc.html` only. Nothing was redesigned and no other concept's files or shared files were touched. Starting point: `evidence/C06/verify-r1.md` (pass, one open major M-A) and the lead sweep finding about the draft undo bar under 减少动态.

## What changed

1. **Real-time windows now use `this.hold()`** (3 conversions, table below). Before this pass, all three ran on `this.after()`, which drops to 0 ms under 减少动态. With 减少动态 on, the toast, the 「已复制」 label and the 10-second draft undo window therefore never appeared: the undo was committed in the same tick as the delete, which is the lead sweep finding (no undo bar 800 ms later). They now keep their real length (stretched at 0.5×; paused, reset and cleared like every other timer).
2. **Undo countdown line under 减少动态.** The 2px line under the undo bar is a CSS animation timed by `--k`. Under 减少动态 that is 0.001, so the line would read "time's up" at once. It is now hidden under `.rm` (`.rm .c06-undo i{display:none}`), and the bar itself stays up for the full 10 s. With 减少动态 off, nothing changed.
3. **Full event name in every expanded view** (closes verify-r1 M-A and the residue of m-E):
   - **Lifted objects** (note, polaroid, coaster, index card, draft card, plus the conversion ghosts and the burning index card, which share the class): once lifted (`.c06-over.in`), the title is no longer clamped. It wraps at phrase boundaries (`word-break:keep-all; overflow-wrap:anywhere`), so 「深夜拉面 · / 吃完散步回家」 is no longer split inside a word. Fixed-height faces grow with the name (coaster `min-height:104px`, polaroid `min-height:214px` with the same bottom border). The coaster's reason line wraps too, instead of 「不计你…」. The list copy, and the flight to and from it, keep the clamp, so the shared element still leaves and lands identical to the row (`names-lift/`). `openOver` re-reads the lifted height once more after the unclamped render (`remeasure(40)`), so the sheet still tucks 8 px under the object.
   - **Ticket stage** (fixed 180px face, because the tear geometry depends on it): a ticket keeps its two-line clamp. A new `nameCheck(gen)`, run from `settle` and `remeasure`, measures whether the ticket title is cut. If it is (`view.nameCut`), the full name heads the sheet in a `.c06-fullname` line directly under the ticket, above the status heading. In the default data no ticket title is cut, so that line never appears there and nothing is duplicated.
   - **History sheets**: the 「这局 · 归档」 kv now starts with a 局名 row. The 局主取消 sheet, whose heading is the outcome 「局主取消了」, therefore names the event on the paper as well as on the coaster.
   - **Full card slip (局卡)**: the polaroid title and the place line are no longer cut. The face grows with them and no longer overlaps the kv below.
   - Lists still truncate. Every truncated row opens, one tap away, into one of the views above.

The source diff is 29 insertions and 10 deletions, all in `concepts/src/C06.dc.html`.

## after → hold conversions

| Line | Context | Before → after | Why |
|---|---|---|---|
| 1245 | `say(text)`: `this.setState({ toast: { text, on: true } }); this.hold(2600, … { toast: …, on: false })` | `after(2600)` → **`hold(2600)`** | toast visibility (reading window). This covers every toast: 微信号已复制, 已改时间 · 等 N 位成员答复, 已接受改期. |
| 1600 | `copyWx(wx)`: `this.patchView({ copied: wx }); this.say('微信号已复制'); this.hold(2200, … { copied: false })` | `after(2200)` → **`hold(2200)`** | copy-success feedback dwell (「已复制」 label) |
| 1892 | `deleteDraft` → `self.setState({ …, undo: { draftId, title } }); self.hold(10000, … JU.engine.commitUndo …)` | `after(10000)` → **`hold(10000)`** | 10 s draft undo window |

C06 has no live countdown ticks: reservation countdowns are derived from the engine's fixed `NOW`, with no interval timer.

## after() calls kept (animation completion or sequencing)

Under 减少动态 each of these collapses to 0 ms, so the result state appears at once.

| Line(s) | Context | Note |
|---|---|---|
| 1255 | `act()` simulated save latency (460 / opts.ms) | Not a reading or undo window. Under 减少动态 the result, or the failure strip, appears at once, and a failure stays until 重试. |
| 1267 | `act()` closing → `closeOver` (0) | deferred put-down |
| 1295 | `switchRole` swap out / in (320 / 420) | identity swap animation |
| 1298 | `switchSection` (16 / 320) | section body re-enter |
| 1325, 1327 | `openOver` settle / lift start (20), now plus `remeasure(40)` | lift flight and measurement |
| 1338, 1345 | `closeOver` start (30) / unmount (450) | put-down flight |
| 1346 | `closeOver` → `landed:null` (1900) | clears `.c06-obj.landed::after`, a 1500 ms glow animation |
| 1479–1481 | first-open print (560) / sleeve burn (700) / rules after open (520) | sequencing |
| 1485, 1486 | `openSlip` / `closeSlip` (20 / 360) | slip slide |
| 1493 | `convert` ghost cleanup (560) | conversion animation |
| 1497 | `remeasure` (40), now also runs `nameCheck` | layout read |
| 1505, 1507 | `printTicket` envelope / second print (2000 / 2040) | print animation |
| 1524–1530 | `tearFall` stub drop / void old / rise / contact (700 / 1320 / 1620 / 2100 or 900) | tear animation. The toast it raises is held by `say`. |
| 1547–1550 | `burnTicket` timeline (660 / +2600 / +360 / +800) | burn animation |
| 1562, 1565 | `confirmJoin` after slip (300) / print (900) | sequencing |
| 1580, 1587–1589 | `leaveFlow` after slip (320 / 0), decline void / leave / burn (560 / 1000 / 1520) | sequencing |
| 1835 | `flashFresh` cleanup (1200 / 1600) | clears `.fresh` re-ink / seat-in / stamp animations. The changed value itself is data. |
| 1838 | `submitReschedule` → `setTab('replies')` (260) | sequencing after the slip closes; the toast is held by `say` |
| 1845, 1851–1854 | `submitCancel` after slip (320) + burn timeline | burn animation |
| 1860 | `submitEnd` after slip (300) | slide-off conversion |
| 1883 | draft 删除 → `closeOver` then `deleteDraft` (500) | put-down before the fold |
| 1888 | `deleteDraft` row fold (580) | fold animation before the write |
| 1890, 1895 | `entering:null` (480), `landed:null` (1900) | re-enter animation / landed glow cleanup |

## Verification (private build `.build/C06.html`)

- Build: `JU_STANDALONE=/home/user/JU/.build/C06.html node src/build.js` built OK. The shared canvas and `concepts/project/*` were not written.
- Coverage: `evidence/C06/final/coverage/` shows **50/50 states, 0 errors**. I read `sheet.png`.
- Timing probe: `evidence/C06/final/timing.json`, from the script `evidence/C06/final/timing-probe.cjs`, sampled every 50 ms. `timing-before.json` is the same probe run against a build of the pre-pass source.

  | | undo bar up | still up at 8.6 s | full window, no undo | undo restores | copy toast | 「已复制」 | 改时间 toast | errors |
  |---|---|---|---|---|---|---|---|---|
  | 减少动态 ON, **before** | never | no | never shown (committed at once) | n/a | never | never | never | 0 |
  | 减少动态 ON, after | appears at 70 ms | yes | 9924 ms, then committed | yes | 2499 ms | 2178 ms | 2482 ms | 0 |
  | 减少动态 OFF, after | appears at 1.1 s (after put-down + fold) | yes | 9939 ms, then committed | yes | 2432 ms | 2162 ms | 2411 ms | 0 |
  | 减少动态 OFF, before | 1.1 s | yes | 9965 ms | yes | 2456 ms | 2187 ms | 2428 ms | 0 |

  With 减少动态 off, the numbers match the pre-pass build, so nothing changed there. Under 减少动态 the countdown line is `display:none`; with it off, it is `block`.
- Full-name probe: `evidence/C06/final/probe-titles.txt`, from the script `probe-titles.cjs`. It opens all 33 index states that open a surface, plus the 局卡 slip and four long-title surfaces. For each one, it checks whether the event's full title appears somewhere visible in the expanded view without being cut: no ellipsis, and no line clamp, comparing against the same element unclamped. **38/38 OK, 0 errors.** Before the pass (`probe-titles-before.txt`) four failed: j-d-cancelled (coaster 「深夜拉面 · 吃完散步…」), the long-title livehouse ticket, the long-title bar manage card, and the long-title 局卡 slip.
- Recorded flows (`tools/capture.cjs`). I read each `sheet.png`, and every `log.json` has 0 errors.
  - `evidence/C06/final/rm-undo/`: 减少动态 ON (`inst.toggleRM()`), 草稿摘要, 删除这份草稿. The desk shows 没有草稿 at once, and the undo bar 「已删除「雨天读书局」 撤销」 is up from f03 to f11 (about 0.3 s to 8.6 s), with no moving line. 撤销 at f12 restores 雨天读书局 in place immediately (f12–f15).
  - `evidence/C06/final/undo/`: 减少动态 OFF, same flow. The draft is put down and folds away (f02), then the undo bar slides in with its shrinking line (f03–f10). 撤销 at f11 brings the draft back with its re-enter and landed glow (f11–f14). Unchanged.
  - `evidence/C06/final/rm-copy/`: 减少动态 ON, j-d-contact, 复制. f03–f06 show 「已复制」, and f03–f07 show the toast 「微信号已复制」 on the desk edge. The label is back to 复制 at f07 and the toast is gone at f08; exact times are in `timing.json`.
  - `evidence/C06/final/copy/`: 减少动态 OFF, same flow. Unchanged.
  - `evidence/C06/final/rm-resched/` and `resched/`: 改时间 slip → 确认改时间 with 减少动态 ON and OFF. The toast 「已改时间 · 等 4 位成员答复」 stays about 2.5 s in both. Under 减少动态 the slip and tab change land at once.
  - `evidence/C06/final/names-history/`: every participant history detail (j-d-ended, cancelled, rejected, queueleft, exited, declined, expired, released, withdrawn, absent) plus the host's h-m-cancelled. Every coaster or polaroid shows the whole name; 局主取消 reads 「深夜拉面 · / 吃完散步回家」, and every 「这局」 kv starts with 局名.
  - `evidence/C06/final/names-long/`: long-title variant. The brunch note shows its three-phrase name; the livehouse ticket keeps its clamp and the sheet head shows 「周四 Livehouse · 散场后一起吃宵夜 · 不喝酒也欢迎来坐坐」 above 局主改了时间; the bar clipboard card shows 「周五小酒馆试营业 · / 第一次开门请多包涵 · 来的人都有一杯」 on its ruled lines on both the 申请 and 成员 tabs; the 局卡 slip shows the full name and full place with no overlap.
  - `evidence/C06/final/names-lift/`: a real tap on the cancelled coaster in 历史 (first open, so the void-ticket burn plays once), then back, then a tap on the long-title bar card. The object unclamps as it is lifted, the sheet follows its new height, and the put-down flies back clamped to land identical to the row.
  - `evidence/C06/final/rm-names/`: 减少动态 ON, real taps. The cancelled coaster, the bar card and the livehouse ticket head all show the full name in the first frame after the tap.

Not verified: a real-device frame rate, and widths other than the 390 phone frame for the new wraps. At 360 the lifted objects are 328 wide, so names wrap one line earlier and the faces grow with them.

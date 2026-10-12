# C07 格盘 · final pass: hold() audit (contract §11)

Scope: a small, targeted pass. Nothing was redesigned and no other concept's files were touched. Latest verdict before this pass: `evidence/C07/verify-r1.md` (pass, 0 blocker, 0 major).

## What changed

One source edit, in `concepts/src/C07.dc.html` (helpers block, lines 1268–1270, plus two call sites). Diff: 5 insertions, 5 deletions.

- **Removed the local `afterReal(ms, fn)` shim** (old line 1269). Fix round 1 (M6) added it because the core had no real-time timer then. It was a copy of `after()` that skipped the reduced-motion scale. It did the same job as the core `p.hold()` in `src/core/ju-review.js` (pause / reset / clear, 2× at 0.5× speed, real length under 减少动态). C07 now calls the core `this.hold()` directly, so it cannot drift from the contract.
- **Rewrote the helper comment** (line 1268) to state the rule: real-time windows use `hold()`; `after()` is kept for animation-completion settles, which drop to 0 under 减少动态 so the result appears at once.

## after / afterReal → hold conversions

| Line | Context (after edit) | Before | After | Why |
|---|---|---|---|---|
| 1270 | `say(text)`: `setState({toast:{text,on:true}})` → timer clears `toast.on` if the text still matches | `this.afterReal(2600, …)` | **`this.hold(2600, …)`** | Toast reading window. Every toast goes through `say()`: 微信号已复制, 已改时间 · 等 N 位成员答复, 已接受改期 · 按新票根的时间见, engine error text. |
| 1284 | `copy(text, key)`: `setState({copied:key})` (the 复制 button reads 「已复制」) + `say('微信号已复制')` → timer clears `copied` | `this.afterReal(2600, …)` | **`this.hold(2600, …)`** | How long the copy-success label stays up. |
| 1518 | `deleteDraft(id)` → `setState({undo:{id,title,at}})` → timer runs `JU.engine.commitUndo` and clears `undo` if this draft is still the pending one | `self.afterReal(10000, …)` | **`self.hold(10000, …)`** | The 10-second draft undo window. |

No plain `this.after(...)` call needed converting. Every real-time window in C07 was already on the shim, and those three are now on `hold()`. C07 has no live countdown ticks: reservation and stub countdowns (`leftText`, `04:21:00`, minibar) come from the engine's fixed `now`, with no interval timer.

## after() calls kept (animation completion or sequencing)

Under 减少动态 each of these drops to 0 ms, so the end state appears at once.

| Line(s) | Context | Note |
|---|---|---|
| 1274 | `act()` simulated save latency (460 ms default; 320 attend, 260 delete) | Kept on `after`. It is not a reading or undo window. Under 减少动态 the write result appears at once, and a failure strip (`err`) stays until the user taps 重试 (it is state, not a timer). |
| 1292, 1293 | `switchRole` / `switchSection` → `swap:false` (900) | grid swap stagger |
| 1302, 1303 | `openOver` instant / start → `phase:'in'` (20) → `afterOpen` (470) | tile expand (M4) |
| 1323, 1327 | `closeOver` collapse → unmount (460); `landed:null` (1900) | Return flight. `landed` drives `.c07-tile.landed`, a landing ring plus the `c07-land` 1100 ms animation. It marks where the tile landed after the motion; it is not a message with reading time. Kept on `after`, as in C01. |
| 1329, 1330, 1333, 1335 | `closeOver` settle / scroll ordering (70 / 40 / 30); section swap (900) | sequencing of the return |
| 1407, 1408, 1410 | `openDetail` print start (520 / 30); burn on first sight (620); open withdraw sheet after the expand (540 / 40) | print / void / sheet sequencing |
| 1413 | `startPrint` → `phase:'ready'` (2000) | print animation completion |
| 1419, 1427, 1428 | `autoTear` (380); tear fall → `torn` (1000); contact reveal + toast (1280) | Tear animation. The toast at 1428 is shown via `say()`, so its visibility is on `hold()`. |
| 1433 | `retirePass` collapse (400) | old ticket collapses out |
| 1437, 1443, 1457 | `voidRun` mask clock (60 ms steps); `_voidEnd` (`C07.V.END`); scrub release | Void animation clock. It is not a real-time countdown. |
| 1460, 1461, 1464 | `openSheet` (20); `closeSheet` (400); `closeThen` (120) | sheet slide |
| 1473, 1474, 1477, 1478 | confirm → print (380); `popYou` (900); cancel → void (`C07.V.END`); reschedule `whenFresh` flash (700) | Animation settles. The 改时间 toast at 1478 goes through `say()` → `hold()`. |
| 1491 | `openManage` → open sheet / scroll to section (520 / 40) | sequencing after the expand |
| 1499, 1505, 1506 | approve: `freshSeat` pop (700); avatar fly (16 / 580) | invite fly-to-seat |
| 1510 | `attend` → clear `fresh[memberId]` (2500) | Removes the `c07-stamp-pop` animation class (520 ms). The recorded stamp itself stays in the data. |
| 1516, 1517 | `deleteDraft` grid `tight:false` (700); overlay collapse (400) | fold / reflow |
| 1521 | `undoDelete` `tight:false` (700), `landed:null` (1600) | re-expand + landing ring |

## Verification

- Build: `JU_STANDALONE=/home/user/JU/.build/C07.html node src/build.js` → `built 10 concepts; 3.58 MB standalone`.
- Coverage: `JU_STANDALONE=… node tools/coverage.cjs C07 evidence/C07/final/coverage` → `{"states":50,"errors":0}`. I read the sheet: all 50 states render with the same layout as `verify-r1/coverage`.
- Capture flows (`tools/capture.cjs`, every `log.json` has `errors: []`). I read every `sheet.png`:
  - `evidence/C07/final/rm-on-draft-undo/` (12 frames): f02 减少动态 on (`inst.toggleRM()`); f03 删除 → empty drafts tile + bar 「已删除「雨天读书局」 撤销」 with no countdown line (`.rm .c07-undo .cd` hidden); f04–f08 the bar stays at about 1 s, 3 s, 5 s, 7 s and about 8.6 s after the delete; f09 撤销 → 「雨天读书局」 restored, 草稿 1; f10–f11 stable.
  - `evidence/C07/final/rm-on-copy-toast/` (8 frames): f02 减少动态 on at `j-d-contact`; f03 复制 → toast 「微信号已复制」 + button 「已复制」; f04–f05 both still up (about 1.1 s and 2.0 s); f06–f07 both cleared (after 2.6 s).
  - `evidence/C07/final/rm-off-draft-undo/` (11 frames): same flow at 1×. f02 is still the draft during the 260 ms save latency; the bar's orange countdown line shrinks (f03–f07); 撤销 re-expands the draft with the landing ring (f08–f09), then settles (f10). Unchanged from `verify-r1/draft-undo`.
  - `evidence/C07/final/rm-off-copy-toast/` (7 frames): toast slides / fades in (f02), stays (f03–f04), is mid-fade over the contact row at f05 and gone at f06; 「已复制」 → 「复制」. Unchanged.
- Numeric probe (playwright script in the scratchpad, polled every 100 ms; output saved to `evidence/C07/final/probe-hold.json`):

  | Flow | 减少动态 | Window first seen → last seen | End state |
  |---|---|---|---|
  | draft undo bar (no tap) | on | 100 → 9939 ms | `commitUndo` ran, bar gone at about 10.0 s |
  | draft undo bar (no tap) | off | 301 → 10245 ms (260 ms save latency + 10 s) | same |
  | toast 微信号已复制 + 「已复制」 | on | 100 → 2520 ms | `copied` cleared by 3.0 s |
  | toast 微信号已复制 + 「已复制」 | off | 100 → 2509 ms | same |

  Before this pass, the fix-round-1 shim already kept these windows at full length under 减少动态 (verify-r1 M6). This pass moves them onto the shared core `hold()` without changing behaviour. With 减少动态 off nothing changes, because `hold()` and `after()` are identical at k = 1 / 2.

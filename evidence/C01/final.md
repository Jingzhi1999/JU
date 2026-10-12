# C01 票据卷 · final pass: hold() audit (contract §11)

Scope: a small, targeted pass. Nothing was redesigned and no other concept's files were touched. Latest verdict before this pass: `evidence/C01/verify-r1.md`, with no open majors.

## What changed

There is one source edit, in `concepts/src/C01.dc.html` (helpers block, about line 1165).

- I deleted C01's local `hold(ms, fn)` override. Review round 2 (commit f7f9518) added it because the core had no real-time timer at the time. The shared core now provides `this.hold()` (`src/core/ju-review.js`, `p.hold`). The local copy matched it line for line, so C01 now uses the core version directly and cannot drift from the contract.
- I replaced the old comment with a one-line rule: `after()` waits for an animation to finish and drops to 0 under 减少动态; `hold()` is for real-time windows and keeps its full length.

## after → hold conversions

C01 already ran its three real-time windows on `hold()` from round 2, so this pass needed **no new conversions**. The audit confirmed those three are correct and that every remaining `after()` waits for an animation or orders animation steps.

| Line | Context | Timer | Why |
|---|---|---|---|
| 1167 | `say(text)`: receipt-tongue toast `{toast:{on:false}}` | **hold(2600)** | toast visibility (reading window) |
| 1334 | `deleteDraft` → `hold(10000, … JU.engine.commitUndo …)` | **hold(10000)** | 10 s draft undo window |
| 1505 | `copyWx(wx)` → `patchView({copied:false})` (「已复制」 label) + `say('微信号已复制')` | **hold(2200)** + hold(2600) | copy-success feedback dwell |

No live countdown ticks exist in C01. Countdowns are derived from the engine's fixed `now`, with no interval timer.

## after() calls kept (animation completion or sequencing)

| Line | Context | Note |
|---|---|---|
| 1171–1172 | `guardAnim` fallback check | finishes a core motion if `animationend` was lost |
| 1196 | `act()` simulated save latency (480 / 60 / 80 / 260 ms) | Kept as `after`. This is not a reading or undo window: under 减少动态 the save result and any failure strip appear at once, and the failure strip stays until the user taps 重试. |
| 1225, 1229 | `measureBody` print-out (16 ms measure → dur + 40) | paper print animation |
| 1245 | role switch roll (430 / 40 / 720) | roll animation |
| 1248 | `switchSection` reprint (16 / 500) | reprint animation |
| 1256, 1258, 1259 | `openOver` FLIP start → in → body print | entry flight |
| 1267, 1277, 1278 | `closeOver` lift → land → unmount | return flight |
| 1279 | `closeOver` → `landed:null` (2400) | Clears the class for `.c01-row.landed::after`, a 1600 ms fade animation. Under 减少动态 it is a 1 ms animation, so `hold()` would show nothing extra. |
| 1329 | `deleteDraft` row fold (370) | fold animation before the write |
| 1335 | delete failure → `entering:null` (460) | re-enter animation |
| 1339 | `undoDelete` → `entering:null` (460) / `landed:null` (2000) | re-enter + landed fade cleanup |
| 1409 | first-open cancelled ticket → burn (260) | burn sequencing |
| 1412, 1413 | `openSlip` / `closeSlip` (20 / 380) | slip slide |
| 1427, 1428, 1434 | ticket print chain / tail print (120 / 60 / 16 → 740) | print sequencing |
| 1454, 1455 | `trayCatch` (580); accept-reschedule step (340) then `say()` | tray animation; the toast it raises is held by `say` |
| 1481 | formed → `printTicket` (420) | print sequencing |
| 1495 | burn after slip lift (460 / 280 / 0) | burn sequencing |
| 1717 | attendance stamp `fresh` cleanup (2400) | `.c01-stamp.fresh` 560 ms stamp animation; the stamp itself is data |
| 1742 | coupon tear `fresh.app.kind` cleanup (760) | coupon tear-off animation |
| 1747 | scroll a slip error into view (40) | layout step |
| 1751 | `submitReschedule` → `setTab('replies')` (420) | sequencing after the slip closes; the toast is held by `say` |
| 1757 | strip burn start (300) | burn sequencing |
| 1796 | draft summary 删除 → close then `deleteDraft` (720) | return flight before the fold |

## Verification (private build `.build/C01.html`)

- Build: `JU_STANDALONE=/home/user/JU/.build/C01.html node src/build.js` built OK. The core `p.hold` is in the output, and the old local `hold(ms, fn) {` is gone. The shared canvas and `concepts/project/*` were not written.
- Coverage: `evidence/C01/final/coverage/` shows **50/50 states, 0 errors**. I read `sheet.png`.
- Timing probe (`evidence/C01/final/timing.json`, script `evidence/C01/final/timing-probe.cjs`):

  | | undo bar up | visible at 8.5 s | undo restores | toast up | 「已复制」 up | errors |
  |---|---|---|---|---|---|---|
  | 减少动态 ON | 9993 ms (appears at 50 ms) | yes | yes (clicked at 8.8 s) | 2615 ms | 2212 ms | 0 |
  | 减少动态 OFF | 10004 ms (appears at 454 ms, after the fold) | yes | yes (clicked at 9.7 s) | 2617 ms | 2214 ms | 0 |

- Recorded flows. I read each `sheet.png`, and every capture logged 0 errors.
  - `evidence/C01/final/rm-undo/`: 减少动态 ON (`inst.toggleRM()`), 草稿 tab, delete. The undo bar appears at once and is still up in f02–f09 (about 0.4 s to 8.6 s); the moving countdown line is hidden under RM. Undo at f10 restores 雨天读书局 in place immediately (f10–f12).
  - `evidence/C01/final/rm-copy/`: 减少动态 ON, j-d-contact, 复制. f02–f05 show 「已复制」 plus the receipt 「JU · 回执 · 微信号已复制」. The label returns to 复制 at f06 (about 2.3 s), and the receipt is gone by f07 (about 3.5 s).
  - `evidence/C01/final/undo/`: 减少动态 OFF, same flow. The row folds (f02), then the undo bar prints with its shrinking countdown line (f03–f10, up to about 9 s). Undo at f11 reprints the draft (f12–f14). Unchanged from verify-r1.
  - `evidence/C01/final/copy/`: 减少动态 OFF, same as the RM-on flow. Unchanged.

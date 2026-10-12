# C04 夜玻璃 · final pass: hold() audit (contract §11) + confirm→formed print fix (verify-r1 N1)

Scope: a small, targeted pass. Nothing was redesigned and no other concept's files were touched. All changes are in `concepts/src/C04.dc.html`. `spec/motion/C04.md` got two clarifying sentences (timer contract; print section).

## 1. Timer audit: after → hold

C04 had a private helper, `afterReal(ms, fn)`, added in review-2 (M3). It ran on real time under reduced motion and delegated to `after()` otherwise. That is exactly what the shared core's `this.hold()` now does (`src/core/ju-review.js`, `p.hold`), so I deleted the helper (old lines 1571–1578) and moved its four call sites to `this.hold()`. Behaviour is the same: paused, reset and cleared with the review timers, stretched at 0.5×, and never collapsed to 0 under 减少动态. The helper's comment is replaced by a three-line rule (line 1571): `after()` = animation settle, `hold()` = real-time window.

| Line (now) | Context | Before | After | Why |
|---|---|---|---|---|
| 1609 | `toast(text)` → `setState({ toast: '' })` | `this.afterReal(2600, …)` | **`this.hold(2600, …)`** | toast visibility (reading window) |
| 1623 | `run()` processing beat → `go()` (engine write) | `this.afterReal(opts.ms \|\| 420, go)` | **`this.hold(opts.ms \|\| 420, go)`** | simulated save latency: the 处理中 sweep stays on screen for its real duration under 减少动态 (C04 has shown it this way since review-2) |
| 1761 | `copyWx(wx, key)` → `setState({ copied: '' })` (「已复制」 label) | `this.afterReal(1800, …)` | **`this.hold(1800, …)`** | copy-success feedback dwell |
| 1911 | `deleteDraft` → `commitUndo` | `this.afterReal(10000, …)` | **`this.hold(10000, …)`** | 10 s draft undo window |

There are no live countdown ticks in C04. The reservation and contact countdowns come from the engine's fixed `JU.NOW`, with no interval timer.

### after() calls kept (animation settle or sequencing)

Every remaining `this.after(...)` waits for an animation or orders animation steps. Under reduced motion each one drops to 0 ms, so its result appears at once.

| Lines | Context |
|---|---|
| 1577 (`lmEnd`), 1679, 1722, 1899 | completion of long motions (print 2200, pass / cancel shatter 3200), scrubbable |
| 1600, 1602, 1603 | section-switch indicator FLIP (16) / content swap (110) / fade-in (360) |
| 1629 | `landOn`: reveal row (60) and clear the `landed` class (1600). That class drives the 1400 ms `c04-land` glow keyframe. It is an animation, not a message. |
| 1644, 1653, 1655, 1668, 1669, 1671 | detail / draft open: anim flag, FLIP start → in (20), print kick-off after landing (480), first-open shatter beat (900) |
| 1692, 1694, 1697, 1698 | close detail (40 / 440), open / close sheet (20 / 460) |
| 1710, 1731, 1732 | settle class clear (900 / 1400), rules sheet close → print kick-off (520 + 200) |
| 1749, 1758 | stub shatter → contact layer (820 / 700), history pass flip (170 / 20 / 280) |
| 1763, 1772 | new-record entry animation clear (600 / 700) |
| 1775, 1776 | rules layer in (40), end-of-text check after the slide-in (600), rules out (520) |
| 1788, 1789, 1801, 1805 | manage pane open / close FLIP |
| 1828, 1835, 1845, 1868 | application bead flight / frost / spring-back |
| 1878, 1882 | reschedule submit: smooth scroll (320), date reprint and title settle clear (1200). The toast in this flow goes through `toast()` and therefore uses `hold`. |
| 1893, 1899, 1901 | cancel: copy rise (560), title settle (900), end-event settle (900) |
| 1902 | attendance: progress settle (700); `attFresh` clear (2500) removes the `.attmk.fresh` stamp tilt and `c04-mark` keyframe. That is an animation state, not a reading window. |
| 1907, 1916 | draft row fold before the write (400), undo re-entry `c04-enter` (520) |
| 1918, 1919 | draft view open / close FLIP |

## 2. Confirm → formed print path (verify-r1 N1, major), now closed

**Problem:** on `j-d-invited` (brunch, capacity 3), pressing 确认入局 formed the event, but `detail.printed` stayed `true` until the rules sheet had finished closing (520 ms at 1×). During that window the FINISHED pass showed behind the sheet: stub, tear hint, an enabled 去不了了, and a live `data-act="tear"`. A drag in that window tore a pass that had never been printed.

**Fix:**
- `confirmReservation()` (line 1729–1731): `printed: !eff.formed` is now set in the same `setState` as `layer: 'rules-out'`, which is the frame the write succeeds. The pass is `.unprinted` from that frame on: all pieces at opacity 0 and `pointer-events: none`, with only the α.45 exit ray showing. The 520 ms sheet close and the 200 ms gap are unchanged. Then `startPrint()` runs the approved three-stage print.
- `tearDown()` (line 1735): it also returns early while `detail.layer` is `rules` or `rules-out`.
- No actionable controls during the reveal (`detailVals`). These are now disabled from the write until the print completes:
  - 去不了了: `disabled` adds `!d.printed` (line 2033).
  - 接受新时间 (reschedule): `disabled` adds `!d.printed` (line 2056).
  - The 参加约定 › / 参加约定全文 › links: `disabled: fx.print || !d.printed`, threaded through `agreeLink`. Both template buttons now bind `disabled` (lines 1225, 1234).
- The tear hint was already gated on `d.printed`, so it appears only after the print.
- The pass sub-note reads 「全员确认 · 出票中」 before and during the print, and 「全员确认 · 已出票」 only once printed (line 2059).

Probe timeline (`final/probes/probes.json`, rAF sampler, every DOM / state change):

| Run | write (rules-out) | print starts | printed | finished pass before printed | 去不了了 enabled before printed | tear hint before printed |
|---|---|---|---|---|---|---|
| 1× | 432 ms: `pass unprinted`, stub opacity 0, 去不了了 disabled | 1149 ms | 3397 ms | 0 | 0 | 0 |
| 0.5× | 861 ms: `pass unprinted` | 2296 ms | 6723 ms | 0 | 0 | 0 |
| 0.5× + real mouse drag on the stub at +1.15 s (the verify-r1 race) | 892 ms | 2323 ms | 6729 ms | 0 | 0 | 0; after 7 s: stage `tear`, **not torn**, printed normally |

## 3. Verification

- Build: `JU_STANDALONE=/home/user/JU/.build/C04.html node src/build.js` → `built 10 concepts; 3.58 MB standalone`.
- Coverage: `JU_STANDALONE=… node tools/coverage.cjs C04 evidence/C04/final/coverage` → **50/50 states, 0 errors** (`final/coverage/sheet.png`, `log.json`).
- Captures (`tools/capture.cjs`). Every `log.json` has `errors: []` and I read every `sheet.png`:
  - (a) 减少动态 ON (`eval inst.toggleRM()`):
    - `final/rm-draft-undo/`: delete → the row goes at once → the undo bar (still full bar + 「10 秒内可撤销」) stays across 7 one-second frames (≈ 8.6 s) → 撤销 → the draft is back. The probe `rm_undo_window` measures **10000 ms** visible, then commit.
    - `final/rm-copy-toast/` (j-d-contact → 复制): 「已复制」 and the toast 「微信号已复制」 stay up. The probe `rm_copy_toast` measures **toast 2600 ms, 已复制 1800 ms**.
  - (b) 减少动态 OFF, unchanged:
    - `final/draft-undo/`: fold → draining amber bar → 撤销 → `c04-enter` back in place.
    - `final/copy-toast/`: the probe `copy_toast_1x` measures toast 2590 ms, 已复制 1800 ms.
  - (c) 确认入局 on brunch (`j-d-invited`):
    - `final/confirm-print-1x/` and `final/confirm-print-half/`: the rules sheet closes over an empty pass slot (only the exit ray); 去不了了 is dimmed; then ray → head → pause → time → pause → stub; tear hint and an enabled 去不了了 only after it lands. The pass is never shown finished before it is printed.
    - `final/rm-confirm-print/`: 处理中 beat (real time), then the printed pass directly.
  - Regression for the list-opened print paths (now also gated by `!d.printed`):
    - `final/regress-tap-tear-print/` (tap 公园慢跑 3K row)
    - `final/regress-tap-resched-print/` (tap Livehouse row): 接受新时间 / 参加约定 / 去不了了 are dimmed during the print and enabled after it.
- Probe script: `final/probes/probe-final.cjs`. Output: `final/probes/probes.json`.

## Not changed / notes

- One small existing detail is out of scope and left as is. During the 520 ms the confirmed rules sheet takes to slide away, its footer and hint re-derive to the read-only variant (「参加约定 · 三类」), because the stage is no longer `invited`. It is sliding off-screen, and verify-r1 did not flag it.
- verify-r1 N2 (minor, stub hovering after a failed tear write) was not part of this pass's brief, so I left it untouched.

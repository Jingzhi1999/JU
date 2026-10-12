# C08 时间尺: final pass (contract §11, `this.hold()`)

Date: 2026-10-12. Scope: `concepts/src/C08.dc.html` only. Nothing was redesigned. With reduced motion (RM) off, `hold()` and `after()` use the same scaling (×1, or ×2 at 0.5×), so RM-off behaviour is unchanged.

## What changed

1. **Six real-time windows moved from `after()` to `hold()`.** Under RM they now keep their real duration instead of collapsing to 0 ms.
2. **Sweep finding closed** (lead, 2026-10-12: "with RM on, deleting a draft shows no undo bar 800 ms later").
   - Cause: the 10 s undo window was `this.after(10000, commitUndo)`. Under RM that becomes 0 ms, so `commitUndo` ran on the next tick and the bar was gone before anyone could see it.
   - Fix: the window is now `this.hold(10000, …)`, and the re-arm in `closePanesThen` is now `this.hold(left / k, …)`.
3. **Undo-bar drain kept honest under RM.** The bar's 2 px countdown line (`.c08-undo i::after`, 10 s linear) was being collapsed to 1 ms by the core `.rm *::after` rule. That made the bar read "time's up" while the window was still open.
   - The bar now carries `style="--c08-uhold:{{undo.ms}}ms"`, where `undo.ms = 10000 × (0.5× ? 2 : 1)`.
   - New rule: `.app.rm .c08-undo i::after{animation-duration:var(--c08-uhold,10000ms)!important}`, so the drain runs in real time under RM.
   - With RM off, the existing `calc(10000ms * var(--k))` still applies, so nothing changes. 暂停 and scrub still freeze the bar (`.paused` and `.scrub` rules are untouched).

## Each after → hold conversion (line numbers are in the edited file)

| # | Line | Method | Before | After | Why it is real time |
|---|---|---|---|---|---|
| 1 | 1188 | `dropPaneTimers()` | `if (this.state.toast) this.after(900, () => this.setState({ toast: '' }));` | `this.hold(900, …)` | A toast that outlives a closing pane stays readable for 0.9 s |
| 2 | 1195 | `toast(text)` | `this.setState({ toast: text }); this.after(2600, () => { if (this.state.toast === text) … })` | `this.hold(2600, …)` | Toast reading window (copy, 改时间, 接受改期, partial-undo notice) |
| 3 | 1216 | `landOn(id)` | `this.after(1600, () => { if (this.state.landed === id) this.setState({ landed: null }); });` | `this.hold(1600, …)` | The red "you are back here" ring on the row you returned to is a 1.6 s orientation cue, not motion. Under RM it is static (no transition) but still shown. The `after(40)` scrollIntoView next to it stays `after`. |
| 4 | 1388 | `copyWx(wx, key)` | `this.toast('微信号已复制'); this.after(1800, () => { if (this.state.copied === key) … })` | `this.hold(1800, …)` | The 复制 → 已复制 success label dwell |
| 5 | 1481 | `deleteDraft(id)` | `this._undoTimer = this.after(10000, () => { … commitUndo … });` | `this._undoTimer = this.hold(10000, …)` | The 10 s draft undo window (the sweep finding) |
| 6 | 1495 | `closePanesThen(fn)` | `if (s.undo && left > 0) this._undoTimer = this.after(left / k, …)` | `this.hold(left / k, …)` | Re-arms what is left of the undo window after the header switches clear all timers |

## Kept on `after()` on purpose (animation completion and sequencing; 51 calls)

These all settle the *result* of a motion, so under RM the result lands at once:

- The row collapse before the delete write (`after(380)`) and the `entering` class (`after(520)`).
- FLIP and pane phases (`after(16/20/40/60)`, `after(r ? 440 : 180)`), and sheet open/close (`after(20)`, `after(400)`).
- Print, stamp, tear and stub (`PRINT_MS`, `STUB_MS + …`).
- The `burnClock` timers and the history-ruler fly/fold chain.
- The role and section swap (`after(24/120/380)`).
- `fresh` and `settle` keyframe-class removals:
  - approve `after(1100)` and `after(660)`
  - reject `after(900)`
  - attend `after(700)` and `after(2500)`. The `.c08-att.fresh` class only drives a 550 ms stamp keyframe; there is no text dwell.
  - addNote `after(600)`, markContacted `after(900)`, propose and end `settle`.
- `after(STUB_MS + 1200, () => this.toast(…))` only *starts* the 接受改期 toast once the tear has settled. The toast's own visibility then goes through `hold(2600)`.
- `run()`'s simulated write latency, `after(opts.ms || 460, go)`. The §11 list does not include it, and "the result appears immediately under RM" is kept. Failure and retry still show (verified in coverage). This is the one judgement call; if a real-latency dwell is wanted under RM, switch it to `hold`.

C08 has no live per-second countdown tick (no `setInterval` or tick loop). The 04:21:00 reservation figures are derived statically, so there was nothing to convert there.

## Verification

- `JU_STANDALONE=/home/user/JU/.build/C08.html node src/build.js` ran from `/home/user/JU`: "built 10 concepts; 3.58 MB standalone".
- `JU_STANDALONE=… node tools/coverage.cjs C08 /home/user/JU/evidence/C08/final/coverage` gave `{"states":50,"errors":0}`.
- Captures (`tools/capture.cjs`). Every `log.json` has `errors: []`, and every `sheet.png` was opened and checked.

| Flow | Path | What the frames show |
|---|---|---|
| (a) RM on, draft delete, then undo | `evidence/C08/final/rm-on-draft-undo/` | f02 (click +60 ms): row already gone (result immediate) and undo bar up. f03–f07 (~1 s → ~8.6 s): bar still up, with the drain line shrinking in real time. f08: 撤销 at ~8.6 s brings 雨天读书局 back. f09–f10: steady. |
| (a) RM on, copy WeChat, then toast | `evidence/C08/final/rm-on-copy-toast/` | f02–f04 (~0.1 / 1.1 / 2.1 s): toast 「微信号已复制」 visible. The 已复制 label shows in f02–f03, then reverts to 复制. f05 (~3.2 s): toast gone. |
| (a) RM on, detail, then back (landed cue) | `evidence/C08/final/rm-on-detail-back-landed/` | Detail opens instantly. After back: red landed ring at ~0.25 s and ~1.15 s, gone at ~2.05 s. |
| (b) RM off, draft delete, then undo | `evidence/C08/final/rm-off-draft-undo/` | Unchanged. f02: row collapsing (`leaving`). f03–f07: undo bar with drain. f08: `entering` restore. |
| (b) RM off, copy WeChat, then toast | `evidence/C08/final/rm-off-copy-toast/` | Unchanged. Toast slides in, stays about 2.6 s, and the 已复制 label reverts at about 1.8 s. |

The timing probe (`evidence/C08/final/timing-probe.json`, sampled every 100 ms) had no errors in either mode:

| | RM on | RM off |
|---|---|---|
| Undo bar first seen | 0 ms | 414 ms (after the 380 ms collapse) |
| Undo bar last seen | 9970 ms | 10330 ms |
| Bar visible at 800 ms (the sweep check) | yes | yes |
| Bar still up at 8.5 s | yes | yes |
| 撤销 restores the row | yes | yes |
| Drain `animation-duration` | `10s` | `10s` |
| Drain `scaleX` at 5 s | 0.49 | 0.54 |
| Toast visible | 0–2539 ms | 0–2514 ms |
| 已复制 label | 0–1707 ms | 0–1744 ms |

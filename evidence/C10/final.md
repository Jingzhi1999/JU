# C10 胶片 · final pass (contract §11, `this.hold()`)

Date: 2026-10-12. Scope: `concepts/src/C10.dc.html` only. Nothing was redesigned and no other concept's file was touched. The latest verdict (`evidence/C10/verify-r1.md`) left no open majors, so this pass is only the §11 timer audit. With reduced motion (RM) off, `hold()` and `after()` scale time the same way (×1, or ×2 at 0.5×), so RM-off behaviour is unchanged. The RM-off captures below confirm it.

## What changed

1. **Local `keep()` helper removed in favour of the shared core `this.hold()`.**
   - C10 already had its own "product timer", `keep(ms, fn)`. With RM off it called `after()`; with RM on it armed an unscaled real-time timer.
   - Its four call sites (toast, 已复制, loupe dwell, 10 s undo) now call `this.hold()` directly.
   - One difference from `keep()`: `hold()` also stretches ×2 at 0.5× when RM is on. That matches §11 and the undo fuse's `calc(10000ms * var(--k))`. Under RM the fuse is static (`.rm .undo .fuse{animation:none}`), so nothing visible changes.
   - The helper's comment block is replaced by a short note on when to use `after()` and when to use `hold()` (lines 1437–1439).
2. **Two `after()` calls that carried a reading window moved to `hold()`.** Under RM these used to collapse to 0 ms, so the cue was never visible:
   - the 改时间 struck old time at the end of the hero time row;
   - the amber highlight on the newest line of the attendance-correction trail.
3. All other `after()` calls stay on `after()`: 51 calls remain. They are animation completion or sequencing, so under RM their result still lands at once. The one judgement call is listed below.

## Each conversion (line numbers in the edited file)

| # | Line | Method | Before | After | Why it is real time |
|---|---|---|---|---|---|
| 1 | 1441 | `toast(text)` | `this.keep(2600, () => { if (this.state.toast === text) this.clearToast(); })` | `this.hold(2600, …)` | Toast reading window (微信号已复制, 已改时间 · 等 N 位成员答复, 已接受改期). The 420 ms fade-out in `clearToast()` stays `after(420)`. |
| 2 | 1637 | `copyWx(wx, key)` | `this.toast('微信号已复制'); this.keep(1800, () => { if (this.state.copied === key) this.setState({ copied: '' }); })` | `this.hold(1800, …)` | How long the 复制 → 已复制 success label stays |
| 3 | 1686 | `advanceApp(appId)` | `this.keep(900, () => { … this.focusApp(next.id); })` | `this.hold(900, …)` | The 圈选 / 打叉 result stays readable under the loupe before the light moves to the next applicant |
| 4 | 1720 | `deleteDraft(id)` | `this._undoTimer = this.keep(10000, () => { … commitUndo … })` | `this._undoTimer = this.hold(10000, …)` | The 10 s draft undo window. `undoDelete()` still clears it through `_undoTimer`. |
| 5 | 1697–1698 | `propose()` (改时间 submit) | `this.after(1800, () => … { whenCls: '', oldShown: false, titleSettle: false }, fx: {} …)` | Split into two calls. `this.after(1800, … { whenCls: '', titleSettle: false }, fx: {} …)` keeps the reprint / settle animation classes. `this.hold(1800, … { oldShown: false } …)` handles the old time. | The struck old time (`.hface .tm.strike.old`, e.g. ~~19:30~~ next to the new 20:00) is a 1.8 s "old → new" reading cue, not motion. The class clean-up is animation completion, so it stays `after`. |
| 6 | 1712 | `attend(memberId, value)` | `this.after(2500, () => { if (this.state.attFresh === memberId) this.setState({ attFresh: null }); })` | `this.hold(2500, …)` | `attFresh` keeps the newest trail line (`更正 出席 → 未出席 · …`) amber (`.trail div.fresh{color:var(--edge)}`) for 2.5 s. That is a text highlight dwell, far longer than any animation. Under RM the red-pencil mark (`.pm.fresh`, `forwards` fill) still appears drawn at once. The `progSettle` `after(800)` beside it stays `after`. |

## Kept on `after()` on purpose (animation completion and sequencing)

- **Pane open, return and FLIP phases:** `after(20/40/60)`, `after(r ? 520 : 160)`, the `rewind()` 16 ms steps, `landRect` `after(80)`, `jumpTo` and `applyJump` `after(30/60/80)`.
- **Sheet in and out:** `after(20)` and `closeSheet` `after(420)`.
- **Developing tray:** `after(520)` start, `after(2600)` printed, `after(3800)` wet.
- **Melts:** `playMelt` `after(3000)`, `playMeltMg` `after(1740/3000)`, the first-void `after(560)`.
- **Cut sequence:** `after(760)` torn, `after(1240)` contact scroll, `after(2600)` torn clean-up.
- **Draft row:** collapse `after(430)` before the delete write, and `entering` `after(540)`.
- **Animation class removals:** settle `after(900/1200)`, `progSettle` `after(800)`, `newRecord` `after(700/800)` (the `.rec.fresh` 420 ms keyframe only), `titleSettle` `after(1000)`.
- **Smaller sequencing:** `expose` `after(460)`, `revealErr` `after(40)`, `revealBench` `after(30)`, `checkRulesEnd` `after(700)`, `rewindSheets` `after(0)`.
- **`landOn(id)` `after(1600)`:** in C10 the "landed" cue is purely a keyframe pulse. `c10-land` ends on a transparent ring with `both` fill, so the class shows no lasting state, and under RM there is nothing static to keep up.
- **`after(760, … this.toast('已接受改期 …'))`:** this only *starts* the toast once the tear has settled. The toast's own visibility goes through `hold(2600)`.
- **`clearToast()` `after(420)`:** the text stays in the pill until the fade ends. Under RM the fade is 1 ms, so clearing at once is correct.
- **Judgement call, `run()`'s simulated write latency `after(opts.ms || 420, go)`:** §11 does not list it, and keeping it on `after()` preserves "the result appears immediately under RM". Failure and retry still show (coverage `errors: 0`; fail-retry was verified in verify-r1). This matches C08's decision.

C10 has no live per-second countdown tick: there is no `setInterval` or tick loop, and the 04:21:00-style figures come from the dataset. So there was nothing to convert there.

## Verification

- Build: running `JU_STANDALONE=/home/user/JU/.build/C10.html node src/build.js` from `/home/user/JU` printed "built 10 concepts; 3.58 MB standalone → /home/user/JU/.build/C10.html".
- Coverage: `JU_STANDALONE=/home/user/JU/.build/C10.html node tools/coverage.cjs C10 /home/user/JU/evidence/C10/final/coverage` printed `{"states":50,"errors":0}`. I read the sheet (`evidence/C10/final/coverage/sheet.png`): all 50 states render as before.
- Timing probe: `evidence/C10/final/timing-probe.json` samples the DOM every ~100 ms in both modes and recorded `errors: []`. All times are ms after the click.

| Window | RM on | RM off |
|---|---|---|
| Draft undo bar `.undo` (no undo pressed) | visible 30 → 9986, gone 10088 (committed, `undo: null`) | visible 518 (after the 430 ms collapse) → 10364, gone 10466 |
| Undo pressed at 8.5 s | bar still up at 8.5 s; draft restored (1 delete button again, `undo: null`) | same |
| Copy wechat: toast `.toast.on` 「微信号已复制」 | 2 → 2490, gone 2596 | 2 → 2589, gone 2691 |
| Copy wechat: 已复制 label | 2 → 1768, gone 1871 | 2 → 1762, gone 1866 |
| 改时间 submit: toast 「已改时间 · 等 4 位成员答复」 | 111 → 2595, gone 2699 | 927 (after the write latency and sheet close) → 3399 |
| 改时间 submit: struck old time | 111 → 1761, gone 1864 (**before this pass: ~0 ms**) | 927 → 2573 |
| Attendance correction: amber newest trail line | 12 → 2477, gone 2580 (**before this pass: ~0 ms**) | 309 → 2672 |

- Captures: all eight flows were recorded with `tools/capture.cjs` at 1× speed. Every `log.json` has `errors: []`, and I opened and checked every `sheet.png`.

| Flow | Path | What the frames show |
|---|---|---|
| (a) RM on · delete draft → undo | `evidence/C10/final/rm-on-draft-undo/` | f02: RM on. f03 (+0.12 s): the row is already gone, with the empty state and 空白片头 strip, and the undo bar 「已删除「雨天读书局」 撤销」 is up (result immediate). f04–f10 (~1.3 s → ~8.3 s): bar still up. f11: 撤销 at ~8.4 s brings 雨天读书局 back. f12–f13: steady, no bar. |
| (a) RM on · copy wechat → toast | `evidence/C10/final/rm-on-copy-toast/` | f03 (+0.08 s): toast 「微信号已复制」 at the top and 已复制 on the button. f04–f05: both still visible. f06–f07: toast still up, label back to 复制. f08–f09: toast gone. |
| (a) RM on · 改时间 submit → toast | `evidence/C10/final/rm-on-resched-toast/` | f03: valid new time (周四 12.24 · 20:00), so 确认改时间 is enabled. f04 (+0.15 s): sheet closed, hero reprinted to 20:00 with ~~19:30~~ at the row end, 改期答复 tab, toast 「已改时间 · 等 4 位成员答复」. f05–f06: strike and toast still up. f07 (~2 s): strike gone, toast still up. f10–f11: toast gone. |
| (a) RM on · attendance correction (extra, for conversion 6) | `evidence/C10/final/rm-on-attend-trail/` | f03: 更正 opens the three-way choice. f04: 「未出席 · 待核实」 red box already drawn; the trail line 「更正 出席 → 未出席 · 12.17 15:00」 is amber. f05–f07 (to ~2.35 s): still amber. f08–f09: back to grey. |
| (b) RM off · delete draft → undo | `evidence/C10/final/rm-off-draft-undo/` | Unchanged. f03: the row content fades (`leaving`). f04: the cell collapses. f05: undo bar with the red fuse draining (visibly shorter by f10). f11: 撤销 restores the draft (`entering`). |
| (b) RM off · copy wechat → toast | `evidence/C10/final/rm-off-copy-toast/` | Unchanged. The toast slides in, 已复制 fades in (f03), and the label reverts at about 1.8 s (f06–f07). The toast is gone by about 2.7 s. |
| (b) RM off · 改时间 submit → toast | `evidence/C10/final/rm-off-resched-toast/` | Unchanged. f04: 「发出中…」 busy state. f05: sheet closed. f06 onward: reprinted 20:00 with ~~19:30~~ struck at the row end, plus the toast; the strike clears at about 2.6 s and the toast at about 3.4 s. |
| (b) RM off · attendance correction | `evidence/C10/final/rm-off-attend-trail/` | Unchanged. The red pencil box draws in, and the newest trail line is amber for about 2.5 s. |

Raw `fNN.png` frames are kept next to each sheet (the same as the other concepts' `final/` folders).

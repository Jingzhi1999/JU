# 我的局 V3 · Motion & Material vocabulary + ticket anatomy (extracted)

Source: `d979de84-JU-My-Ju-v3-Opus55-review-canvas.html` (27 MB). CSS = lines 49–923 (V27 keyframes at 77–172, 我的局 V3 block `.jm3` at 421–861). App script = lines 2811–6386 (V3 code with `27` suffix at 5880–6374). Engines are base64 `<script data-standalone-source>` blobs on lines 924–936 (decoded to `scratchpad/decoded/`): `ju-print.js`, `ju-tear.js`, `ju-nativeburn.js` (used), `ju-burn.js` (legacy, unreferenced), `ju-stamp.js`, `ju-tickets2.js`, `ju-paper-film.js` (JuFilm.paintCard). The `JuCardV2` component is inlined on line 4 as `"./ju-card.html"` (decoded to `scratchpad/decoded/ju-card.html`).

Screens: `s01` (我的局 lives in the root sheet of 01 as `.jm3[data-scope=s01]`), `m01`/`m02` (review mirrors of the same template, `data-fixed=true`), `h01` (管理这局), detail screens that receive/return the card: `s05` 锁定, `s06g` 就位中, `h01`; paper screens: `s06` (07 撕开票根), `s11` (10 局主改时间), `s12` (11 局主取消), `s08` (08 散场 票根墙).

---

## 0. Shared tokens and gates

| Token | Value | Where |
|---|---|---|
| `--jm-ease` / `FLY_EASE27` | `cubic-bezier(.2,.9,.3,1)` | all V3 travel, fold, switch, print-stamp |
| settle ease | `cubic-bezier(.2,.8,.2,1)` 280 ms | `SETTLE27.settle` |
| seat ease | `cubic-bezier(.2,.9,.3,1.04)` (slight overshoot) | `SETTLE27.seat`, V27 `juSeatOn/Out`, `juPerf` |
| burn pre-layout ease | `cubic-bezier(.16,1,.3,1)` 320 ms | `prepareBurnLayout26` |
| button press | `.jm3-btn` transform `.48s cubic-bezier(.18,1.5,.36,1)`, active `scale(.958)`; `.jm3-planbtn` `.3s cubic-bezier(.2,1.4,.36,1)`, active `.985` | H1 |
| sheet | `juSheet .32s cubic-bezier(.2,.9,.3,1)` (translateY 100%→0); overlay `rgba(8,9,16,.6)` + blur 3px, `.jm3-overlay{z-index:60}` | all sheets |
| toast | `juToast .3s ease` (translate(-50%,10px)→0), auto-dismiss **2600 ms** (`toast(k,m)` L3349) | `.jm3-toast` bottom 100 px (s01/h01), 122 px elsewhere |
| shadows | `--jm-e1` (resting paper, contact), `--jm-e2` (lifted), `--jm-tray` (paper tray), `FACE_SHADOW27` = `0 42px 84px -28px rgba(18,22,48,.55),0 10px 26px -12px rgba(18,22,48,.35)` (05 detail card) | |
| grain | `--jm-grain` feTurbulence SVG, opacity .05 multiply on trays/strip/empty/planbtn/sheet-id | |

**Reduced motion** (`prefers-reduced-motion: reduce`): global `*{animation-duration:1ms;transition-duration:80ms}` (CSS 120–122); `.jm3` extra: no track/indicator transitions, no `.jm3-app-result/.jm3-undo/.jm3-sheet` animation, `.jm3-landed::after` hidden, `.jm3-att-mark` no stamp. JS skips: card flight (`motionOk27`), `data-switching`, view fade, `SETTLE27`, `ember27`, `foldRow27`, landed mark; engines: print duration 1 ms, tear auto-detaches instantly, 08 stamp sets ink=1 immediately.

**Product mode** (`html[data-view=product]`, CSS 51–58, 432): one screen at `min(100vw,480px)`×`100dvh`, review chrome / `.ju-external-replay` / `.ju-demo-controls` / `#ju-review-controls` hidden, `#h01` shown by `data-screen=h01`. Only the **card hand-off flight** is product-only (`motionOk27 = dataset.view==='product' && !reduced`). Review-only: `ju-mine27-review.js` (代成员操作 bars), `review-tools.js` (scene bars, 390×844 / 375×667 / 320×568), `motion-review25.js`, mirrors `m01/m02`, `hostRecord27` fallback. Everything else below runs in both views, gated only by reduced motion.

---

## 1. Card hand-off: list → detail (380 ms) and back (360 ms) — `handoff27 / prepBack27 / handback27` (L5936–6013)

| Aspect | Spec |
|---|---|
| Principle (MOT02) | "The card you tap travels to where the next screen shows that same card, and travels back on return." Source and destination are the **same render** (JuCardV2 at 196×245 with the 05 face layers); the list shows it scaled, so the flight is one object changing size and place, never a picture, never a second blank card. |
| Eligible routes | `HANDOFF27 = ['s05','s06g','h01']` and only when the list object is a **card** (`it.flight === 'card'`). Ticket / stamp objects keep their own V27 entrances (ticket drop, tear, envelope, sleeve, wall, burn). |
| Trigger | tap `.jm3-hit` → `openFromMine27` (join) / `openHost27` (host) → `returnTo27` (saves role/view/scroll/eventId) → `handoff27(id, route)` → `selectEvent` / `goTo('h01')`. `openGuard27`: one open per 800 ms (double tap). |
| Source | `#s01 .jm3-item[data-event=ID] .jm3-card[data-flight=card] .jm3-face`; must be ≥20 px wide and on screen. |
| Destination | s05/s06g: `[data-spin-face="front"]`; h01: `.jm3-strip .jm3-face`. `holdDest27` injects a `<style>` hiding the dest block (`[data-spin3d],[data-spin-shadow]` or `#h01 .jm3-strip .jm3-card`) until arrival. Slot gets `.jm3-away` (`.jm3-card,.jm3-tk{visibility:hidden}`). |
| Flyer | `flyer27`: clone of the face, `position:fixed`, `z-index:2147483000`, `transform-origin:0 0`, `transform: translate(from) scale(from.width/196)`, class `jm3-flyer`. |
| Seek | rAF loop until dest exists (`offsetWidth>40`) and `dataset.screen===route`; `restRect27` subtracts transforms of still-running entrance animations (06g `juRise`). Abort after 900 ms → flyer fades 160 ms. |
| Forward flight | `flyAnim27(F, from, to, 380, sh0, sh1)`: single straight glide, uniform scale, `FLY_EASE27`, `fill:forwards` ("paper is heavy and does not bounce – no arc, no overshoot, so the card never rises into the head (P6)"). Shadow track: `sh0` → mid `0 46px 80px -26px rgba(18,22,48,.5),0 14px 30px -12px rgba(18,22,48,.32)` at offset .55 → `sh1` (`FACE_SHADOW27`, or the strip's shadow scaled for h01). |
| Landing | wait for running entrance animations on dest ancestors (max 900 ms) → remove hold → `[data-spin-shadow]` ground shadow fades in **240 ms ease-out** → next frame remove flyer, un-`away` slot. Safety `guard27` 2400 ms (pause-aware). |
| Back pressed mid-flight | `prepBack27`: `fw.stop()` (commitStyles + cancel) — the same flyer turns around from where it is. |
| Capture on back | `prepBack27(id)` runs before s01 shows: route = current screen if in HANDOFF27 (a 局 confirmed in 05 leaves from 06g), dest must be fully visible (h01: below `h1Cut27`). s05/s06g: `flyer3d27` clones the whole `[data-spin3d]` (front, back, edge, current `rotateY`, filter, sheen) inside a 196×245 perspective box (`perspective` 1150 px default, origin `50% 46%`). |
| Return flight | `handback27` (from `landMine27` after render): if the slot is above `--jm-cut` or outside the pane → flyer fades 180 ms. Else `.jm3-away` on slot, `flyAnim27(…, 360, …)`; 3D copy simultaneously animates `rotateY → 0/360°` (360 ms, FLY_EASE27), faces' filter → `brightness(1.1) saturate(1.08)`, sheens → `translateX(-48%)`. Guard 1400 ms. |
| Landed mark | `revealLand27` scrolls the pane so the item is inside (`scrollTop += r.top − cut − 24`) **before first paint**; then `.jm3-landed` (+ `.jm3-handed` if it flew) → `::after` wash `rgba(74,90,214,.07)` `jm3Land 1.1s cubic-bezier(.4,0,.2,1)` (0→1 @18%→0); inset `4px -8px` r16 (lead: inset 0 r20; spine r12; stub inset −4 r14). Classes removed after 1600 ms. Focus goes to the `.jm3-hit`. |
| Return context | `JuMine27.setReturn({root:'mine',role,view,filter,scrollOffset,eventId,scope})`; `restoreMine27` restores function, both panes' scroll (`mem.pending`), `mem.land`, `data-instant` (transitions off for one frame). Back label `返回我的局` vs `返回找局`. |

---

## 2. Header collapse

### 2a. V27 `syncHeader23(scroll, h)` (L5581–5600) — pages `s02 s03b s05 s06g s09 s06 s11 h01`
| Element | Travel (p = `headP(scrollTop)` = clamp((scroll−4)/84) → **starts at 4 px, done at 88 px**) |
|---|---|
| `[data-screen-title]` | `top: 53 → 12.55px` (53−40.45p); `font-size: 30 → 18px` (30−12p), `line-height 1.05`; `left = w·p/2` + `translateX(−50%·p)` (ends centered); `max-width: w − 104p`; `nowrap + ellipsis` at p=1; transitions `.1s linear` (font-size/top/left/transform). Title height measured by a hidden probe (`_titleHeight24`, fallback 31.5). |
| meta (`title.nextElementSibling`) | `top: 53 + (th+9)(1−p) − 9p`, `height: 42(1−p)`, `opacity: 1−p`. |
| progress row (child with a 5 px bar) | `top: 53 + (progressTop−53)(1−p)`; `progressTop = 53+th+9+42+9`. |
| header box | fixed `height = progressTop + ph` (scroll extent never changes); sets `--ju-head-progress`, `--ju-head-visible = 53+(progressTop−53)(1−p)+ph`. |
| content under it | s06/s11: `[data-ticket-content24]` gets `clip-path:inset(cut …)`; h01: `.jm3-h1-scroll` mask-image transparent → opaque between `--h1-cut+2px` and `+20px`; `--h1-head = head.offsetHeight+13` is the body's top padding. `h1Reveal27` scrolls to 0 after a plan-level result. |
Type: `title20` 30px/500 `#14161f`; `meta21` 14px `#535b70`; `header21` sticky, gap 9, margin-bottom 13.

### 2b. 我的局 head fold `headSync27` (L5903–5908, CSS 438–453)
`c = clamp(scrollTop / 56)` → `--jm-c` (registered `@property`). `.jm3-title` (30px/42px, margin-top 12): `opacity: 1 − 1.6c`, `translateY(−12c px)`. `.jm3-bar` (roles + views): `translateY(−c · --jm-title-h)`; `--jm-title-h` measured (default 62 px, 56 px at `max-height:640`), `--jm-head-full` = bar bottom (default `--jm-top(66) + 148`). Pane padding-top `head-full + 24`; pane mask: transparent → opaque from `--jm-cut+1px` to `+16px`, bottom fade last 30 px; `--jm-cut = head-full − c·title-h`. While `data-switching` (340 ms after a function switch) `--jm-c` transitions `.28s` so the fold interpolates to the other pane's own scroll.

---

## 3. Identity segment switch 我参加的 ⇄ 我发起的 (CSS 455–489, `syncMine27` L6317–6328)

| Part | Spec |
|---|---|
| Control | `.jm3-roles` tablist (46 px pill, padding 3, `rgba(255,255,255,.34)`, inset ring) with tabs `我参加的` / `我发起的` (`.jm3-role`, 15.5px/500, selected `#14161F`) + `.jm3-badge` (19 px, `#4A5AD6`) = count of items in 要你回应 / 待你处理 (aria `n 项要你回应` / `n 项待你处理`). |
| Indicator | `.jm3-role-ind` raised chip, `translateX(--jm-r·100%)` **.28s `--jm-ease`**; `.jm3[data-role=host]{--jm-r:1}`. |
| Panes | `.jm3-track` and `.jm3-views-track` (two columns, gap 24) `translateX(--jm-r·(−100% − 24px))` .28s; inactive pane `visibility:hidden` delayed .28s and `inert`. |
| Bookkeeping | `mineNav27(role, view, {scope,instant,top})` is the single entry; switching function keeps the other function's view + scroll; `data-switching` set for **340 ms** (not first paint, not `instant`, not reduced). |
| Keyboard | ArrowLeft/Right toggle, Home → join, End → host (automatic activation; focus follows after 2 rAF). |
| View tabs | join: `当前` / `历史 (n)`; host: `当前` / `草稿 (n)` / `历史 (n)` (`.jm3-view small` count). Underline `.jm3-views::after` 2 px `#4553BE`, `--ul-x/--ul-w` transition `.16s` (after first paint `data-ul`). Switching view: pane `opacity 0→1 120 ms ease-out` (id `jm3-view`); each (scope:role:view) remembers its own scroll. |
| Review mirrors | `data-fixed=true`: no transitions, locked tab `aria-disabled`, note `评审镜像 · 固定为「我参加的」/「我发起的」`. |

---

## 4. Settle stamps on changed facts — `SETTLE27` (L6331–6339)
Any element with `data-stamp-id` + `data-stamp-key` animates **only when its key changes between renders** (never on first paint; skipped under reduced motion).

| `data-stamp-anim` | Keyframes | Duration / ease | Used on |
|---|---|---|---|
| `settle` (default) | `translateY(5px) opacity .25 → 0 / 1` | 280 ms `cubic-bezier(.2,.8,.2,1)` | `.jm3-state` (join key = `it.key`; host key = `it.label`), H1 title `.jm3-h1-title` (key `host.key:status`) |
| `seat` (**座位盖章**) | `scaleY(.42) opacity .35 → scaleY(1.07)@62% → scaleY(1) opacity 1` | 500 ms `cubic-bezier(.2,.9,.3,1.04)` | every `.jm3-segs i` (join gathering `s01-jseg-…`, host `s01-seg-…`) and `.jm3-h1-segs i` (`h1seg-…`), key = `sg.k` (`ok`/`res`/`open`) |
| `print` (**日期重印**) | `clip-path:inset(0 0 100% 0) translateY(−7px) → inset(0) translateY(0)` (prints top-down) | 420 ms `cubic-bezier(.2,.9,.3,1)` | H1 strip `.jm3-strip-txt .jm3-date` (`h1when-ID`, key = `hm.when`) → fires after 确认改时间 |

Seat segments (`segs27`): one per seat incl. slot 0 = `局主` (always `ok`); `ok #4A5AD6`, `res rgba(74,90,214,.38)`, `open #cdd1df`; 5 px tall, gap 3, ≤170 px; caption `c/cap 已确认（含局主）`. H1 segs also `transition:background .5s ease`; after 散场 the same bar re-labels: `ok`=出席, `res`=未出席, `open`=未记录 (aria `name attLabel`), with `nRec/n 已记录出席`.

V27 roots: `juSeatOn .5s cubic-bezier(.2,.9,.3,1.04)` / `juSeatOut .55s ×2 alternate` on the 06 gate strips (92 px tall columns with initial + `✓` / `补人` / countdown; ok = green gradient), `juPerf .6s delay .3s` (scaleX .55→1) dotted perforation when done; foot `READY TO TEAR` / `位子放回 · 局主在补人` / `还差 n 个 · 6 小时没点自动放回`.

---

## 5. 日期重印 beyond H1 (the reschedule object)
| Place | Behaviour |
|---|---|
| s11 reissued 票根 | `.ju-ticket-when` shows `{revisedTime}` `{revisedDate}`; `.ju-ticket-previous` `原定 {oldDate} {oldTime}` line-through; stamp `[data-raster=stamp]` **`时间已改`** (double 2.5 px `#4550BE`, Space Mono 700 10px .14em, radius 8, `rotate(−9deg)`, top 150 / right −20, bg `rgba(243,244,251,.86)`); hidden alt layout animates it `juStamp .55s ease .35s both`; s12 shows the same stamp (`juStamp .55s ease .4s`) only when `cancelReissued21`. Header `时间挪了一下 / 局主改了时间 · 选择是否参加` → torn `按新时间见 / 票根已更新 · 已接受改期`. |
| list `.jm3-tk[data-changed=true]` | chop `改期` shown (inset ring 3 px `#4A5AD6`, 22px/600, `rotate(−11deg)`, bottom-right) and `.jm3-tk-time` line-through 5 px `rgba(194,54,76,.8)` + grey `#7a8094`; time/date printed are the **old ticket you hold** (`proposal.old`), while `.jm3-when` gets prefix `改为` (`.jm3-new`, `#9a5b12`) + new when; needLine `局主改了时间，答复前旧票不能用`. |
| H1 `.jm3-change` | `原定 <s>old</s>` → arrow → `改为 · 纽约时间 <b>new</b>`; `data-ready=false` greys the new value; note `新时间和原时间一样，换一个日期或时间才能确认。` |
| 06 gate tear note | stub text `撕下，确认新时间`; rig `right` text `REISSUED` (vs `REAL PLANS ONLY`). |

---

## 6. 卡面抽色 (card desaturation)
| Selector | Rule | When |
|---|---|---|
| `.jm3-strip .jm3-face` | `transition: filter .7s ease` → `[data-closed=true]`: `grayscale(.55) brightness(.98)` | H1 strip once the 局 is not `open` (ended or cancelled); colour drains in place, card stays |
| `.jm3-card[data-draft=true] .jm3-face` | `opacity:.86; filter:saturate(.7)` + dashed ring `::after` 1.5 px `rgba(74,90,214,.55)` inset −4 | 草稿 cards |
| rest filter | `.jm3-face{filter:brightness(1.1) saturate(1.08)}` (also the target of the 3-D hand-back) | all live cards |
| list | closed 局 show **no card** at all → `.jm3-spine` (pack-coloured edge) / kept → `.jm3-stub` art | history |

---

## 7. 余烬 / 燃烧 (ember / burn)

### 7a. Ember sparks on the H1 strip — `ember27(card)` (L6334–6344, `jm3Ember` CSS 729)
Trigger: `syncMine27` sees `#h01 .jm3-strip` `data-cancelled` flip `false→true` for the same event (right after 确认取消), not reduced (not view-gated). Fixed layer at the card's lower edge (`top = r.bottom−6`, 6 px tall, z 60). **10** sparks `<i>` 7–11 px, radial `#fff4d8 → #ffc070 30% → #ff7a32 55% → transparent 72%` + `drop-shadow(0 0 3px rgba(255,128,48,.85))`, left 4–96 %, bottom 0–10 px, `--ex ±18px`, `--ey −(34…64)px`; `jm3Ember 850–1350 ms cubic-bezier(.25,.6,.35,1)` delay 0–240 ms `both`: `0% opacity 0 scale 1 → 18% 1 → 60% .8 → 100% opacity 0 translate(--ex,--ey) scale(.4)`. Layer removed when all finished (fallback 8000 ms). V27's `juEmber` (`scale .6→.2`, rise 58 px) is the full-ticket sibling. "The card stays, its colour drains (§6) and a few embers leave its lower edge (V27's burn language, briefly)."

### 7b. Paper burn — `JUNativeBurn` (ju-nativeburn.js, `burnMount` L4900–4907)
| Aspect | Spec |
|---|---|
| Variants | `B` = s11 去不了了 (`卷边炭化 · 多点烧穿`: 3 ignition points .32W/.31H, .78W/.65H, .13W/.92H; 118 curls, 136 ash); `C` = s12 局主取消 and s07 退出这局 (`情绪电影 · 侧向推进 · 落灰收尾`: front sweeps from the left with a sinusoidal edge; 72 curls, 126 ash). `A` unused. |
| Duration | app passes `duration: 6.6` s (playback = `min(duration, 7.6)`; presets' internal timelines A 9.3 / B 10.6 / C 12.6 s are rate-compressed). Tail: `.45 s` fade after the last major fragment. |
| Mechanism | time-of-arrival scalar field (3.4 px grid, grain noise) → marching-squares contour → written to `surface.style.clipPath` of the **real DOM ticket** (and its shadow face) every frame: the paper is eaten in place, never rasterized/cloned; canvas (`data-ju-material-fx`) draws glowing char edge, curls, inert ash, 2900 fibres; **no flames**. The `时间已改` stamp's rounded rect is unioned into the outline. Milestones `mainGone → majorFragmentGone → lastParticle → resultReady`. |
| Shadow | while burning the paper's own drop-shadow is removed and `SHADOW10` (`drop-shadow(0 18px 26px rgba(18,22,48,.26)) drop-shadow(0 3px 4px …18)`) sits on `[data-paper-shell]`; `.ju-paper-shadow24` clipped to the live stub height. |
| Pre-layout | `prepareBurnLayout26`: on phones < 720 px the stage glides/scales into the band between the back pill and the result CTA (`320 ms cubic-bezier(.16,1,.3,1)`), stamp lettering compensated to ≥10 px, overlapping header copy hidden (1 ms) and restored 160 ms linear; phase attr `data-burn-layout26 = preparing | burning | done`. |
| Start conditions | s11: `proposal.choice==='declined'` and `p10==='ready'` (rig disabled first). s12: auto-ignite when the stage intersects >0.45 (`b12 idle`), demo re-burn after 620 ms. s07: `exitConfirmed22` after `JuLedger.withdrawConfirmed`. |
| End state | `onDone` → `p10:'ash', r11:'left'` / `b12:'ash'` / `exitBurn23:'ash'`; s11 & s07 then `finishBurnRoute27('s06g')` (route next frame unless a dialog/credit sheet is open). s12 stays on the ash screen. Ash copy settles `juSettle .58s cubic-bezier(.22,.9,.3,1)` (title .06 s, sub .21 s, secondary .58 s). s11: `已退出改期活动` / `改期后退出，不影响成局信用。` / CTA `再找个局` / `知道了`. s12: `局主取消了` / `{title} · 原定 {date} · {time}` / `不计为未出席，也不影响成局信用。` / `再找个局`. s07: CTA `查看退出结果` → s06g; failure toast `已退出，纸件动效暂不可用`. |
| Sheets before burning | s11 `去不了了` → `新时间去不了？` (再想想 / 确认退出); s07 `去不了了` → `退出这局？` (继续赴约 / 确认退出). |

---

## 8. 撕票 (tear) — `JUTear` (ju-tear.js) mounted by `tearMount` (L4783–4815)
| Aspect | Spec |
|---|---|
| Object | the 副券 strip under the ticket: `[data-tear=s07|s10]`, **258 × 84 px**, canvas padded 88/18/220; modelled as **26 verlet segments** (one continuous paper: distance constraint + bending). Params: `GRAV 1450 px/s²`, `DAMP .982`, `BEND .30`, `MAXA 2.05°` per segment (paper stiffness), `ITER 6`, `SNAP .5`. |
| Face (`drawStub`) | paper `#EDEFF7`, 9 px dot grid `rgba(26,29,42,.077)`, ragged top edge, 420 fibre specks, text `撕下，联系局主` (s07) / `撕下，确认新时间` (s10) Noto 14px `#535b70` at x 18 + arrow `→` at right. Mount params `right: 'REAL PLANS ONLY' | 'REISSUED'`, s10 `note.lines ['时间改到 {date} {time}','同一批人，按新时间见。'] by '— {host}'` (passed to the rig; only the one-line text + arrow is drawn in this build). |
| Perforation | untorn part: dashed `[3.4,3.4]` `rgba(26,29,42,.30)` 1.4 px + a 1–2 px tension lift at the front; torn part: pale ragged edge `rgba(214,217,229,.95)`; a 9 px cavity shadow under the torn span; hanging paper casts a blurred (5 px, α .26) shadow. |
| Handle | white 21 px knob at the tear front, hint `juKnobHint 3.4s linear infinite`; opacity `1 − 1.05p`, hidden while dragging; grab zone `role=button` aria `撕下副券`. |
| Gesture | horizontal drag → `p = (x − x0)/(W·scale)`; release ≥ **50 %** auto-completes at `.95 + clamp(vel/W,0,1.5)` per s, < 50 % retracts at 2.6/s; Enter/Space auto-tears at 2.8/s. |
| Detach | `onDetach` commits the fact first (s07 `JuLedger.torn`; s10 `choose(true)`); a failed write resets the strip and shows `未能保存，请重新撕下副券` (s07) / toast `新时间未保存，请重新撕下副券` (s10). Then the strip falls (initial velocities per node), fades from 620 → 1000 ms (380 ms), `display:none` at 1080 ms; `onDone` → s07 `p7:'torn'` + `contactReveal23` (contact row 300 ms, action 850 ms; `wx7Wrap` opacity .5 s / translate .6 s after .25 s); s10 `acceptTime18` + toast `已接受改期 · 按新票根的时间见`. |
| Enabled | s07: `p7==='ready' && open && validTicket`; s10: `p10==='ready' && open && proposal ask && member confirmed`. One canvas per host (self-heal removes duplicates). Pauses when hidden/off-screen. |
| Stage | `pr7Stage` 476 → **404** px when torn (`.5s cubic-bezier(.2,.9,.3,1)`); `--ju-ticket-top24` 24 px (<720 tall) else 84; `measurePaper21` sets `--ju-paper-height`, `--ju-ticket-scale23`, `--ju-shadow-stub25` (≤84). |
| List echo | `.jm3-tk[data-torn=true]`: stub hidden, face bottom gets the jagged clip-path (polygon with 98.4–100 % teeth). Hint keyframe `juCueTear` (0 → 72 px,13 px @56 % → 88 px,17 px @74 %). |

---

## 9. 出票 / 打印 (print) — `JuPrint` (ju-print.js) via `printRun` (L4725)
| Aspect | Spec |
|---|---|
| Trigger | IntersectionObserver on `[data-print-io=s07|s10]` ratio > .12 while state `idle` (auto on entering the screen). Preconditions: `p7` needs `validTicket`; `p10` needs open + `proposal.choice==='ask'` + member confirmed. Leaving a page never erases printed/torn state. Review replay `演示 · 重播出纸` (`printReset` → 120 ms → `printRun`). |
| Sequence | state `printing` → `fonts.ready` → `tearMount` → rig `ready` → rAF → `tearRedraw` → scroll to top if phone < 720 → `measurePaper21` → `JuPrint.mount(paper,{tag,done})`; if the rig is not ready: back to `idle` + toast `纸票未准备好，请重试`. |
| Raster | the paper DOM (text per glyph, borders, dashed borders, the transformed stamp, the tear canvas, images) is drawn into one 2× texture with 42 px pad — "one paper texture, one continuous 32 × 128 surface, no cloned controls". |
| Motion | WebGL mesh 32×128; **2300 ms** (reduced 1 ms); `progress = .5 − .5·cos(π·t^.9)`; paper feeds from above (`translateY(−452px)`, opacity 0 at rest) with a mouth curl `bend = e^(−y/44)`, `z = 32·wet·bend`, perspective 900, shading .88–1.0 (`wet = 1 − progress`). Paper DOM is `opacity:0; inert` meanwhile; on finish `flat()` (opacity 1, transform none) → `complete()` sets `ready` (or `torn` if `ticketTornVersion === event.version`) → `tearSync` enables the rig. Context loss / no WebGL → instant flat. |
| Mouth | 16 px top gradient `rgba(20,22,31,.16→0)` + 2 px white lip (`left/right 62`), opacity 1 only while printing, `.4s ease`; the sticky header becomes a solid shell. |
| CTA | `juCtaIn .55s cubic-bezier(.2,.9,.3,1) .1s both`; hint pill `juCtaIn .5s`. s07 title `撕开，联系局主` → torn `联系局主` → contact added `待赴约`; invalid `票根暂不可用` / `活动已取消` / `活动已结束`. s11 ready note `往右撕副券` (Space Mono 11 px, not a button) → torn `已确认`; secondary `去不了了`. |
| Legacy s11 sim | `print10()`: 85 ms ticks `+2.4…6.8 %`, `打印中 n%`, then 240 ms → `printed` + toast `新票根打好了 · 去，就撕副券；不去，就烧掉`; `stub10` drag 120/160 px (older path, superseded by the rig). |

---

## 10. 作废 (void) — how invalidity is expressed (no "作废" glyph exists)
| Surface | Expression |
|---|---|
| list tone | `STAGE27` tone `void` for `cancelled, ended_other, declined, exited, withdrawn, rejected, expired, reservation_released, queue_left, other` → `.jm3-state[data-tone=void]` `#7d8396`, hollow dot not used (filled); `kept` (ended, confirmed) same grey. |
| list object | closed 局 render as `.jm3-spine` (30 px pack-coloured edge with the EN title vertical, name, when · place, needLine) under `未成行 · 不计出席` (join) / `已取消 · 票根作废 · 联系已关闭` (host, label `票根作废 · 联系已关闭`). |
| needLine | `局主取消 · 票根作废，不计你的退出`, `拒绝改期 · 席位已释放`, `主动退出 · 票根与联系已关闭`, `申请已撤回`, `预留到期未确认 · 位置已补给他人`, `放弃预留 · 不记主动失约`, `退出候补 · 不记缺席`, `这次没留住 · 不影响信用`. |
| H1 | status `已取消`, formedLine `已取消 · 不能撤销，票根作废、联系关闭`, progress hidden, members `data-tone=void` (opacity .7) with `取消前已确认 / 取消前已预留`, plan only `再开一局`; strip grayscale (§6) + embers (§7a). |
| 07 screen | `invalidTicket21` → `.ju-ticket-empty21` reason (`这局已取消，原票根不再有效。` / `这次活动已结束，记录已归档。` / `局主调整了时间，请确认新安排。` / `确认入局后，才会为你保留票根。` / `还有成员待确认，全员到齐后出票。`) + CTA `ticketNext21` (`查看取消结果`→s12 / `查看散场记录`→s08 / `确认新时间`→s11 / `查看参加状态` / `查看成员`→s06g); paper state `已取消` / `已成局 n/n` / `待全员确认`. |
| member | the ticket **burns** (§7b, s12). Cancel sheet copy: `取消后已出的票根作废、联系入口关闭，不能撤销。` |

---

## 11. Draft delete + undo (AUD33/34) — `discardDraft27 / undoDiscard27 / foldRow27` (L6183–6196, CSS 644–648)
1. `.jm3-more` **删除** (aria `删除草稿「t」，可撤销`) on a `.jm3-draft` row.
2. `foldRow27(row,false)`: height/padding/opacity → 0, `overflow:hidden`, **260 ms** `FLY_EASE27`, `fill:forwards`, id `jm3-collapse`; `_folding27` lock; guard 1200 ms. ("a row leaving or coming back folds / unfolds in place; nothing else in the list moves on its own (P7)").
3. `discardNow27`: snapshot → `JuMine27.discardDraft`; failure → toast `没有删除成功` (row stays). Success → `mem.undo = {scope, draft, title}`, **10 000 ms** timer, re-render (folded element never stays folded: animation cancelled next frame).
4. Undo bar `.jm3-undo` at the top of 草稿: dark `rgba(20,22,31,.86)`, radius 14, `jm3Settle .3s`, text `已删除「title」` + link `撤销`.
5. `undoDiscard27`: `restoreDraft` (failure toast `没有恢复成功`) → clear timer → render → `foldRow27(row,true)` 260 ms (id `jm3-expand`), overflow restored on finish.
Draft row anatomy: dashed draft card, name, when (`日期未定`) · place (`地点未定`), state `还差 局名、日期、时间、地点` or `信息齐了，可以发布` (`data-ready` → green), sub `改于 n 分钟前` (+ `· 由「t」再开`), next `继续编辑`. Group head `没写完的局 · 只存活动内容 · 成员和记录不进草稿`. Empty: `没有草稿 / 开局时随时可以先存一份，没写完的局会留在这里。/ 去开局`.

---

## 12. Cancel-event sequence (host, H1) — `hostModel27` (L6235–6302)
| Step | What happens |
|---|---|
| entry | plan section `这局的安排` → `.jm3-planbtn[data-tone=danger]` **取消这局** / `确认前会列出受影响的人` (`canCancel = open`). Siblings: `改时间 / 已确认的人各自答复` (open && no open proposal), `记为散场 / 散场后逐人记录出席` (open && formed), hint `还没成局，不能记为散场`, `再开一局 / 只带入活动内容，成员与记录不复制` (closed). |
| sheet | `hostSheet27='cancel'` → `.jm3-sheet[data-tone=danger]` (`juSheet .32s`), `role=alertdialog` **取消这局**; id row (`.jm3-sheet-id`: xs card `--jm-k .2245` + title + `when · place`); `.jm3-impact` dl `已确认成员 / 已预留 / 候补 / 待审申请` (zero rows omitted; Archivo 22 px numbers); `.jm3-irrev` red note; description `活动、未确认的邀请和候补一起结束；成员不计主动退出。`; actions `再想想` / **确认取消** (danger `#C2364C`). "nothing is destroyed until confirmed". |
| commit | `doCancel` → `hostAct27(M.cancel)`; failure shows `.jm3-alert` `这一步没有生效，请刷新后重试。` inside the sheet (`AUD19`: a write that fails says so where it happened). Success → `h1Reveal27()` (scroll 0) → sheet closes. |
| result in place | strip `data-closed=true` → face grayscale .7 s; `data-cancelled=true` → `ember27`; title stamp-key changes → settle 280 ms; status `已取消`; progress row hidden; `formedLine` → `已取消 · 不能撤销，票根作废、联系关闭`; members tone void; plan → `再开一局`. |
| list | the 局 leaves 当前 and files under 历史 · 已取消 as a spine; participants' stage → `cancelled` (void) and their next open shows the s12 burn. |
Reschedule sibling: sheet **改时间** (`.jm3-change`, date/time inputs, `rsDesc` counts, `确认改时间` disabled until a different time) → toast `已改时间 · 等 n 位成员答复` / `已改时间` → strip date **reprints** (§4 print 420 ms), `改期答复` section with `接受 · 换新版票` / `拒绝 · 已退出` / `还没答复`. End sibling: **记为散场？** → `记为散场` → intent `attendance`, segs become the attendance bar, toast none.

---

## 13. Attendance stamp (出席章)
| Surface | Spec |
|---|---|
| 08 散场 (`JuTickets` v2, WebGL) | mode `pending` (rests unstamped, demo label `等章`) / `present` / `absent` from `r.attendance`. Rubber stamp (procedural pad + wood block + handle, opaque) timeline (s): enter .18–1.05, **press 1.05–1.34, ink 1.40–1.52**, lift 1.70–2.20, exit 2.20–2.85, end 2.95; card at `pressPose` (rx −26°, seen from above); intro 1.9 s: today's stub settles 0–.45 (easeIO), earlier stubs rise from depth from .50 + .13·(i−1) over .48 (easeOut); then browse (vertical drag pitch 145–228 px, wheel, keys), tap = flip (ry 180°, lift .10, bend), peek hint after 1100 ms; hint `上下滑动 · 翻以前的局　点一下 · 看背面`; aria `票根：上下拖动翻阅以前的局，点一下翻到背面` / `本次票根；还没有更早的局，点一下翻到背面`. Reduced / no WebGL: ink = 1 at once, flat `<img>` fallback. Replay `演示 · 重播盖章`. |
| stamp art (`JuStamp.make`) | 600 px ring (9 px outer, 3 px inner, 72 ticks), `JU / {city}`, big `出席` (168 px) or `未出席` (122 px) serif 900, `WE WERE HERE`, year; ink present `rgb(45,106,75)` 深绿 / absent `rgb(178,58,44)` 印泥红; noise/blot alpha; `rotate −11°`; anchor per pack (invite .78/.82 r .13, street .78/.17, grain .72/.38 r .15, mono .76/.18 r .12, riso .79/.76, acid .77/.17). |
| list `.jm3-stamp` (history kept stubs) | CSS ring (2.5 px border + 5.5 px inset ring), width 46 %, right 8 % / bottom 9 %, `rotate(−11deg)`, `<b>出席|未出席</b><small>JU · ATTENDED</small>`; ink `出席 rgba(176,36,48,.86)` multiply, `未出席 rgba(70,78,104,.88)`; **light ink on dark packs** (`PACK_INK27`: street/grain/mono → `rgba(255,236,226,.94)` / `rgba(232,236,250,.92)`, normal blend + text-shadow). Static (no entrance). |
| H1 roster `.jm3-att-mark` | 52×30, radius 9, 2 px border, `rotate(−11deg)`, `.08em`; present `rgba(11,127,97,.9)`, absent `rgba(155,42,58,.85)`, pending dashed `rgba(79,85,104,.8)`; `data-fresh=true` (recorded < 2500 ms ago) → **`juStamp .55s ease`** (`scale(2.1) rotate(−24°) → .94/−8° @70% → 1/−11°`). Control `.jm3-seg` 出席 / 未出席 / 待定 (unrecorded = nothing pressed) → after record: mark + `更正` link; labels `未记录 / 待定 / 出席 / 未出席 · 待核实`; trail `记录 出席 · 12.19 20:31` / `更正 出席 → 未出席 · …`; note `未出席是待核实的事实，不等于故意缺席，也不会自动处罚；可随时更正，更正会留下记录。` |
| list state echo | join `ended` needLine `记录为出席` / `记录为未出席 · 待核实` / `已散场`; host `n/m 人到场`; todo `n 人出席待记录` → CTA `记录出席`. |

---

## 14. Other in-place motions (for completeness)
| Element | Motion |
|---|---|
| `.jm3-app-result` | application handled: the result replaces the buttons in the same box, `jm3Settle .42s` (`已发出邀请 · 等对方确认` / `已谢绝 · 对方会看到「这次没留住」`); rows keep their order until leaving H1 (AUD19). |
| `.jm3-bar6` (6 h reservation bar) | `width/background .9s linear`, colour via `t5Color`; timer `预留剩余 hh:mm:ss`. |
| `.jm3-h1-segs i` | `background .5s ease` + seat stamp. |
| `.jm3-empty` | static paper cue (two dashed/solid sheets, rotated 4° / −5° for drafts, stub corners for history). |
| 05/06g detail card spin | `data-spin3d` host (not V3): rotateY drag, read-sheet `wrap.animate` 650 ms `cubic-bezier(.16,.86,.2,1)`; V3 only reuses its rest pose for the hand-off. |

---

## 15. Ticket anatomy

### 15a. V27 票根 (paper on s06 / s11 / s12) — markup L1931–1937, 2221–2232, 2300–2313; CSS 262–264, 328
```
[data-paper=s07]  258 px wide, centered (left 50%, margin-left −129), top 84 (24 on short phones), rest transform translateY(−452px) opacity 0
├─ [data-paper-shadow] .ju-paper-shadow24   #edeff7 slab r14 14 10 10, drop-shadow 0 18px 26px .26 + 0 3px 4px .18, clipped by --ju-shadow-stub25
├─ [data-burn]                               burn canvas host (z 9)
└─ [data-paper-shell] › [data-paper-surface] (258 px, isolation)
   ├─ body (#EDEFF7, r 14 14 0 0)
   │  └─ .ju-ticket-face  padding 18, Noto 14/1.5 #22283b
   │     ├─ .ju-ticket-brand      "JU. / 票根"         Space Mono 700 13px .12em #51596f
   │     ├─ .ju-ticket-title      {eventTitle}         20px/600
   │     ├─ .ju-ticket-when       {eventTime} … {eventMd}   Archivo 700 28px, space-between   (s11/s12: revised values)
   │     ├─ .ju-ticket-previous   "原定 {oldDate} {oldTime}"  line-through (reissued only)
   │     ├─ .ju-ticket-line ×3    地点 {eventLoc} · 集合 {eventMeeting | 待局主确认} · 局主 {eventHost}   (40px label + value, 1px #cdd1de rules)
   │     └─ [data-wet]            42 px top gradient (print wetness)
   ├─ [data-raster=stamp]  "时间已改"  (s10; s12 when reissued)
   └─ [data-tear] 84 px   副券 canvas rig (perforation + "撕下，联系局主|撕下，确认新时间 →") + [data-bend] 34 px bottom shade
```
Fields present: **name, time + date, place, meeting point, host, perforation, (reissue stamp + 原定 line)**. Not printed on the V27 ticket: a seat number and a code — seats live on the card caption (`已确认 n/cap · 已预留 m`) and the "code" is the ledger pair `ticketTornVersion` vs `event.version`; a serial (`001…`) exists only on the 08 wall history cards; `REAL PLANS ONLY` / `REISSUED` appear on the invite card foot and in the hidden s11 alt layout (barcode strip 26 px + `REISSUED` 9 px .16em), not on the live paper.

List miniature `.jm3-tk` (196×245 → `scale(--jm-k)`, drop-shadow 1.5/9 px): `.jm3-tk-face` `#EDEFF7` r14 14 0 0 pad 18: `.jm3-tk-brand` `JU. / 票根` 13px, **`.jm3-tk-time` Archivo 700 66px** (the figure), `.jm3-tk-date` `{wd} {md}` Archivo 500 22px `#535b70`, `.jm3-tk-chop` `改期` (hidden unless `data-changed`); `.jm3-tk-stub` 66 px dotted paper with 2.5 px dashed perforation (`left/right 12`); `data-torn` hides the stub and tears the face bottom (§8).

### 15b. 08 票墙卡 (`JuTickets.paintTicket`, ju-tickets2.js L21–24, 181, 304)
| Aspect | Spec |
|---|---|
| deck | `cards = [today] + personalHistory(event)` (history entries: `serial` `001…` padded, `attendance`, `endedAt`, `event`); demo `CARDS` (hotpot 007 … coffee 001) only seed the first slot; hidden `<img data-t08-img="…-front">` ×7 webp demo textures. |
| front art | `JuFilm.paintCard({...event, num: city||'NYC', date: (wd||'FRI')+' '+date})` → **720 × 900** canvas in JuCardV2's language (1 cqw = 7.2 px) + `JuStamp.stampTo` at the pack anchor (`r·W`, rot −11, α 1, `{city, year:'2026'}`) when attendance ≠ `none`. V26 text rules inside paintCard: `cancelled → 活动已取消`, `ended → 活动已结束` (toWho `这局的记录`); with counts: `n/cap 已确认 · r 已预留`, `已成局`, `已满员 / 预留已满 / 余 n 位`, `已成局 · 可候补` … |
| back | `JuEnvelope.makeJuReverse(e)`. |
| geometry | mesh 2.4 × 3.0 units, .018 thick, rounded; stamp mark `MARK` at (.78,.82) r .15·2.4; poses: press (rx −26°), rest stack (`pose(rel)` spiral: x .15·rel, y −.13·rel, z −.43·rel, rz −6°·rel), flip (ry 180°). |
| list reuse (`art27`) | the same `paintTicket(event,false,'none')` downscaled to **360×450 JPEG q.88**, cached per `id|version|projectionKey`, repainted after `document.fonts.ready`; CSS `.jm3-stamp` drawn on top (§13) so the ink can follow the pack (dark cards). Shown as `.jm3-stub-art` (4/5 aspect, r10) in the 散场 / 已散场 walls (`data-mode` one → 132 px art + text grid; few → 2 cols; many → 2 cols wall), with `再开一局` under host stubs. |

### 15c. JuCardV2 (the 局卡) — component `./ju-card.html` (aliased `JuCardV2.dc.html`), props at L140, logic L141–166
| Prop | Default / meaning |
|---|---|
| `pack` | `invite` (邀请函) · `street` (街拍) · `grain` (深夜颗粒) · `mono` (终端) · `riso` (纸感) · `acid` (荧光) |
| `title` / `en` | `深夜救急火锅局` / `HOTPOT RESCUE` (en printed on the card, max 16 chars in the composer) |
| `date` / `date-num` / `time` | `FRI 12.18` / `12-18-2026` / `19:30` (order everywhere: `SAT 12.19 · 20:30`) |
| `loc` / `loc-en` | `法拉盛` / `FLUSHING` (lists show the neighbourhood of `Brooklyn-威廉斯堡`; details `Brooklyn · 威廉斯堡`) |
| `host` / `num` | `老杨` / city code `NYC` (draft: host `你`) |
| `seats` | open seats 1–12, 0 = full → `toWho` `在局里的你` vs `缺{n}人的你`; `seatLong` `已成局 · 位子满了` / `还缺 n 人 · 不算局主`; `seatMid` `已成局` / `还缺 n 人`; `seatShort` `已满员` / `缺 n 人`; `seatAsk` `已成局 · 名单锁定` / `缺 n 人 · 报名后等确认` |
| `status-label` → `seatMid`/`seatShort`; `seat-caption` → `seatLong`/`seatAsk` | app overrides (`cardProps27`): `statusLabel` = `已成局` / `仍可报名` / `席位已预留`, `seatCaption` = `已确认 ok/cap · 已预留 r`; draft: `草稿` / `''`; 06g passes open seats, 05/09/list pass 0 |
| `qr`, `women`/`men` (`♀ 女生局` / `♂ 男生局`), `slug` | optional |
Layout (container-query, aspect 4/5; **196 × 245** at detail width): invite = `{en}` (Caslon red `#A8281F`) → rule `JU {num}` → `TO: {toWho}  DATE: {date}` (Caveat handwriting on `#CDAF93` rules) → framed box with corner marks: `{title}` (Caveat 11.5 cqw, rotate −2°) + `来不来！！` → rows `SEATS {seatLong}` / `WHERE {loc} · NEW YORK` / `TIME {date} · {time} 开吃` → foot `BY {host} · {num}` / `REAL PLANS ONLY`. street = Archivo title, `Hosted by {host} · {seatMid}`, image placeholder `[ 官方图库 · 街拍 / 夜市_02 ]`, `PUBLISHED ON JU` / `ju.app`, `In {loc}` / city / date / time. grain = `JU PRESENTS ⤵`, `{num}`, big `{en}` (Archivo Black), right column `{seatShort}` / `[{dateNum}]` / `{time}`, foot `{title}` / `AT {loc}…`. mono / riso / acid use the same field set (`title en date dateNum time loc host num seatShort seatAsk genderTag`).

The **05 face** (replicated wherever the card appears, CSS 561–574, markup L1708–1714): `.jm3-face` 196×245 r13, bg `#F2E8D5`, `filter:brightness(1.1) saturate(1.08)`, inherits V27's text defaults; layers in order: `JuCardV2` → `.jm3-face-dots` (7 px dot grid, soft-light .2) → `.jm3-face-sheen i` (44 % diagonal highlight, blur 6, overlay, `translateX(−48%)`) → `.jm3-face-rim` (inset 1 px white .5) → `.jm3-notch` top/bottom (22 px circles at −11 px). The 05 3-D box adds an edge (7 px white gradient), a back face (`JU.` 46 px Caslon, `有 JU，就开局`, dot grid) and a ground-shadow ellipse (`[data-spin-shadow]`).

### 15d. Where each object appears and at what scale (`--jm-k` = 196-px multiples)
| Place | Object | Scale / size | Shadow |
|---|---|---|---|
| join list item `.jm3-item` | card / ticket / (stamp → stub) | `.4286` (84 px col), 还在等 group `.3571`; phone ≤360: `.3878` / `.3265` | `--jm-e1` |
| host list item `.jm3-hitem` | card (right column) | `.398` (78 px); ≤360: `.3469` | `--jm-e1` |
| draft row `.jm3-draft` | dashed card | item scale, `data-draft` | faint |
| H1 strip `.jm3-strip` | the hand-off card | `.4898`; ≤360 `.4286`; ≤640 tall `.3265` | `--jm-e1` |
| H1 sheets `.jm3-sheet-id` | xs card | `.2245` | small contact |
| H1 `局卡` sheet `.jm3-cardsheet-stage` | full card | `1.1` | `FACE_SHADOW27` |
| 05 / 06g detail | 3-D card | `1` (196×245) | `FACE_SHADOW27` + ground ellipse |
| history 散场 wall | stub art (jpeg) + CSS stamp | 4/5 box, 132 px when `one` | contact 1.5/18 px |
| history 未成行 / 已取消 | spine | 30 px edge + text row | inset white |

### 15e. Stage → list object → detail route (`joinItem27` L6086–6102, `participantStage` ju-mine27.js L38–61, `hostItem27` L6108–6120)
| stage.key | label (ph.label unless noted) | group | tone | object | flight | CTA (lead only) | route |
|---|---|---|---|---|---|---|---|
| invited | (`候补轮到 · 已预留` when from queue) | 要你回应 | act | card | → s05 | 阅读并确认 | s05 |
| reschedule | — | 要你回应 | act | **ticket** (old time + 改期 chop) | none | 答复新时间 | s11 |
| tear | 待撕票 | 要你回应 | act | ticket | none | 撕开票根 | s06 |
| contact | 待联系 | 要你回应 | act | ticket (torn) | none | 联系局主 | s06 |
| going | 待赴约 | 就快见面 | go | ticket (torn) | none | 查看票根 | s06 |
| confirmed | — | 就快见面 | go | ticket if validTicket else card | card→s06g | 查看票根 | per phase |
| gathering | 待全员确认 | 还在等 (segs) | wait | card | → s06g | — | s06g |
| pending / waitlist (`候补第n位`) | — | 还在等 | wait | card | none | — | per phase |
| ended (confirmed) | — | 历史 · 散场 | kept | **stamp** (stub art + 出席/未出席) | — | — | s08 |
| cancelled / ended_other (`已结束`) / declined / exited / withdrawn / rejected / expired / reservation_released / queue_left (`已退出候补`) / other | — | 历史 · 未成行 | void | spine | — | — | s12 for cancelled, else per phase |
Host items are always cards flying to `h01` (`openHost27` with intent `review` / `attendance` / `manage`); `life` = `已取消 / 已散场 / 改期中 / 已成局 / 招募中`; groups `待你处理 (审核与出席)` / `改期中 (等成员逐人答复)` / `招募中 (还没成局)` / `已成局 (按日期)`; labels `n 份申请待审`, `n 人出席待记录`, `n 人未答复新时间`, `n 人已预留 · 等确认`, `还有 n 个空位`, `全员确认 · 已出票`, `n/m 人到场`, `票根作废 · 联系已关闭`; ended → stub (`再开一局`), cancelled → spine.

---

## 16. Product-mode-only checklist
| Behaviour | Runs in | Gate |
|---|---|---|
| card flight to/from s05 · s06g · h01 | **product only** | `motionOk27()` |
| head fold, segment switch, view fade, settle/seat/print stamps, landed wash, ember27, fold/undo, app-result settle, strip desaturation | product + review | reduced motion only |
| print (JuPrint), tear (JUTear), burn (JUNativeBurn), 08 stamp (JuTickets) | product + review | reduced motion / WebGL availability; review adds replay buttons |
| review bars (代成员操作, seed/clear fixtures, 390×844 / 375×667 / 320×568), mirrors m01/m02 | review only | `dataset.view==='review'` |

# 我的局 · mock data extract (JU-My-Ju-v3 review canvas)

Companion to `mock-data.json`. Source: the four base64 `<script>` blobs decoded from the canvas (`rules26.js` → `JuRules26`, `ju-state.js` → `JuLedger`, `ju-mine27.js` → `JuMine27` adapter + review fixtures, `ju-mine27-review.js` → review bars) plus the inline app script (lines 2811–6386: `FEED_ROWS`, `PROFILES`, `STAGE27`, `when27`/`place27`/`fmtLeft27`, `joinItem27`/`hostItem27`/`hostModel27`). Decoded copies are in `../decoded/`.

## 1. Where the data lives

| Layer | Key / object | Holds |
|---|---|---|
| `JuLedger` (localStorage `JU_V26_EVENTS_1`) | one record per event id | `event{}`, `status open/ended/cancelled`, `members[]`, `queue[]`, `history[]`, `application` (you), `draft`, `reportDraft`, `reports[]`, `creditEvents[]`, `attendance`, `proposal`, ticket facts |
| `JuMine27` (localStorage `JU_MINE27_1`) | `{drafts{}, seq, profile{nick,wx}, variant27, fixturesOff}` | 开局 drafts only (never members/tickets) |
| hosted record extras | `r.hosted27`, `r.applications27[uid]`, `r.memberFacts27[uid]` | host flag, per-applicant status/profile, per-member facts (torn, contact, reschedule answer, attendance) |
| App feed | `FEED_ROWS` / `FEED_CAPACITY25` | 找局 cards per city (s01) — out of scope for 我的局 but the ids are shared |

Nothing is static: every 我的局 row is a projection (`participantStage` / `hostSummary`) over ledger records. The review canvas auto-seeds fixtures (`JuMine27.autoSeed()`) if no `demo:mine27:*` record exists.

## 2. JSON shape (`mock-data.json`)

| Key | Content |
|---|---|
| `meta` | id schemes, storage keys, relative-time convention (`seed±Nh/d` = offset from the moment `seedReviewFixtures()` ran) |
| `formats` | storage formats (`dateNum`, `date`, `wd`, `time`, `loc`) and every display string builder |
| `rules` | capacity, join modes, 6-hour reservation, expiry/promotion, formed/validTicket/contact windows, reschedule/cancel/end, validation copy |
| `people` | `you` (阿禾 / ahe_ju in fixtures, 你 in the plain ledger), host self (你), member name pools, applicant pool (6), review apply generator, `PROFILES` (10 member-sheet profiles), s06g gate demo generator |
| `events` | `JuLedger.original` (深夜救急火锅局), packs/cities/cats, all 76 feed rows as `[cat, pack, title, en, MM.DD, HH:MM, loc, host, seatsLegacy, capacity]` |
| `participantItems` | the 11 我参加的 fixtures with full roster, counts, stage (key/label/group/need/CTA/needLine/route/object) and display strings; `manyVariantExtraEnded` (5); standard list composition + sort rules |
| `hostItems` | the 5 我发起的 fixtures (bar, bbq, museum, wine, cards) with applicants, scripted transitions, counts, summary, list item, H1 model strings; full host label catalog |
| `drafts` | draft shape, completeness rule, 2 fixture drafts, composer sample/defaults, published-event shape, 再开一局 rule |
| `history` | participant past (kept/closed), host past, `history[]`/`queue[]`/`memberFacts27` shapes, credit-event and phase label catalogs, report shape |
| `variants` | the 5 review data sets (`standard / empty / drafts / many / long`) and every empty-state copy |
| `reviewHarness` | the review-bar actions per screen (m01, m02/h01, c01) and their result copy |

Chinese copy is verbatim. Dates carry both the prototype's `MM-DD-YYYY` and an ISO `YYYY-MM-DDTHH:MM` (local New York time; year 2026).

## 3. Date / time / place formats

| Builder | Output | Example |
|---|---|---|
| stored `dateNum` | `MM-DD-YYYY` | `12-19-2026` |
| stored `date` / `wd` | `MM.DD` / `SUN…SAT` (derived from `new Date(y,m-1,d)`) | `12.19` / `SAT` |
| `when27(e)` | `<WD> <MM.DD> · <HH:MM>` | `SAT 12.19 · 20:30` |
| `whenIso27(iso,time)` | same, from the native date input | `('2026-12-19','20:30')` → `SAT 12.19 · 20:30` |
| card date (JuCardV2) | `<WD> <MM.DD>` | `SAT 12.19` |
| list row | `when` span + `place` span | `SAT 12.19 · 20:30  东村` |
| `place27(loc)` | text after the first `-` | `Manhattan-东村` → `东村` |
| `place27(loc,true)` | `区 · 街区` | `Manhattan · 东村` |
| H1 meta | `<status> · <when27>` | `2 份申请待审 · SAT 12.19 · 20:30` |
| reschedule row | `改为` + new when; 原定 = `[wd date, time].join(' · ')` | `改为 SAT 12.19 · 21:00` / 原定 `FRI 12.18 · 20:00` |
| `meeting` | time − 10 min + ` 门口` | `15:50 门口` |
| `fmtLeft27(ms)` | `HH:MM:SS`, floors at `00:00:00` | list `预留剩余 04:21:00`, H1 `剩 02:14:00` |
| `fmtAbs27(t)` | `M.DD HH:mm` (month unpadded) | `12.19 20:30` (attendance trail) |
| `ago27(t)` | `刚刚` / `N 分钟前` / `N 小时前` / `N 天前` | `申请于 刚刚`, `加入于 9 小时前`, `改于 3 天前` |
| `deadlineCopy` (rules) | `请在 今天|明天|M月D日 HH:mm 前阅读并确认` | `请在 今天 18:21 前阅读并确认` |
| queue | `候补第N位` (participant), `№1` (H1) | |
| counts | `已确认 N/CAP`, basis `含你` / `（含局主）`, `预留 R · 空 A · 候补 Q` | `已确认 2/5（含你）`, `4/5 已确认（含局主）` |
| ended host 局 | `<present>/<confirmed> 人到场` | `4/5 人到场` |

Feed rows carry only `MM.DD`; `buildFeed` fixes the year to 2026 and derives `WD`.

## 4. Reservation / countdown rules

1. **Capacity includes the host** (3–8). `need = capacity − 1` → `再邀 N 人 · 共 N+1 人（含你）`. Applications and waitlist entries never hold a seat; only `invited` (预留) and `confirmed` do.
2. **6-hour reservation** (`SIX = 21 600 000 ms`): `invite()`/`promote()` set `deadline = invitedAt + 6h`. Reopening the page never extends it. Host approve copy: `通过即发出 6 小时预留` / `发出邀请后对方有 6 小时阅读约定并确认，确认前不占定、不出票`.
3. **Countdown**: shown only for your own `invited` row (list `预留剩余 HH:MM:SS` + a bar whose width = remaining/6h) and in H1 for reserved members (`剩 HH:MM:SS`). Colour `t5Color(1 − fraction)`: green `rgb(14,155,118)` → amber `rgb(190,140,40)` → red `rgb(206,62,45)`.
4. **Expiry**: `expire()` turns overdue `invited` members into `expired` (you → application `expired`, label `预留已到期`), then **promotes** the first `waiting` queue entry into the freed slot with a fresh 6 h (`有人放弃或预留到期时，按顺位自动发出 6 小时预留`). A promoted queue member shows `候补轮到 · 已预留`.
5. **Formed** = not cancelled and (`establishedAt` set or confirmed === capacity). **validTicket** = formed ∧ you confirmed ∧ `userVersion === event.version`.
6. **Tear → contact**: contact is available once the valid ticket is torn, and closes 24 h after `endedAt`, on exit, decline or cancel. Copy says contact within 8 h of tearing. Host side: `hostCanContact` = formed ∧ not cancelled ∧ within 24 h of ending (`已散场 · 24 小时内仍可查看成员微信` vs `已散场 · 联系方式已关闭`).
7. **Reschedule**: host `propose()` bumps `version`, every confirmed non-host member gets `reschedule.choice = 'ask'` (`N 人未答复新时间`); accept → `acceptedVersion`/`tornVersion` = new version (`接受 · 换新版票`); decline → seat released, `拒绝 · 已退出`, no active-withdrawal fact. The ledger's own `propose()` (participant review bar) shifts +1 day / +30 min.
8. **Cancel**: irreversible; invited members, waiting/invited queue rows and pending applications become `cancelled`; contacts close. **End** only when formed and no answer is open; afterwards attendance is recorded per confirmed member (`出席 / 未出席 / 待定`), corrections kept in `attendanceHistory`; `未出席` = `待核实`, never auto-penalised.
9. **Withdrawal quota** (policy `JU-27-agreement-1`): 4 active withdrawals per account per year; releases, expiries, waitlist exits, reschedule declines and host cancellations are excluded.

## 5. Generators (procedural data)

| Generator | Rule | Sample |
|---|---|---|
| `JuLedger.create(e)` | non-fixture records: `occupied = capacity − initialAvailable (default 1)`; host + (occupied−1) members from `['小面','阿宽','蛋挞','花卷','西西','Nina','Leon']`, member-0 confirmed, the rest invited (6 h); plus `you` unapplied | 深夜救急火锅局 cap 4 → 老杨(host) · 小面 confirmed · 阿宽 invited · 你 |
| `joinFixture(key, event, state)` | roster from `OTHER` pool as `fx-i` (slot i+1, invitedAt seed−3h, deadline seed+3h); you = 阿禾 (slot per state); host row from `event.host`; 11 states: invited, pending, gathering, tear, going, reschedule, ended, cancelled, waitlist, rejected, queue_left | see `participantItems.items` |
| `hostFixture(key, {applicants:N, script})` | host 你; first N of the applicant pool via `simulateApply` (pending, no seat); `script` then runs approve/confirm/tear/contact/propose/answer/end/attend | bar: 4 applicants → 小满 confirmed, Kiki reserved (2h14m), 阿蒋 + Momo pending |
| applicant ids / mails | `m27-<base36 ms>-<seq>`; mail = verified ? `nick.toLowerCase()+'@nyu.edu'` : '' (so `小满@nyu.edu`, `momo@nyu.edu`) | H1 shows `nyu.edu 邮箱已验证` / `未验证邮箱` |
| review “来一份申请” | k-th click: name = `[小满,Kiki,阿蒋,Momo,Leon,Ivy,西西,阿宽][(k−1)%8]`, wx `ju_<k+10>`, note/mail/verified only on odd k | 1st: 小满 / ju_11 / 第一次参加，想认识新朋友 / 小满@nyu.edu ✓; 2nd: Kiki / ju_12 / — / ✗ |
| `gateSeats(step, you)` (s06g demo) | names `[you, 小面, Momo, Leon, 阿宽…]`, clocks `04:12 07:30 09:05 11:40 13:22 15:08 16:30`; step 3 substitutes 阿蒋 (`刚补进来`, `09:58`) | 5 steps 等大家点头 → 就差 Leon 了 → 空出一个位子 → 阿蒋在确认 → 四个人齐了 |
| `art27` / stamps | history cards are painted once per (event, version, projection); stamp `出席`/`未出席` ink follows pack (`invite/riso/acid` dark, `street/grain/mono` light) | |

## 6. Variants (review data sets)

| Variant | Select label | 我参加的 | 我发起的 | 草稿 |
|---|---|---|---|---|
| `standard` | 样例：标准 | 11 (3 要你回应 · 1 就快见面 · 3 还在等 · 1 散场 · 3 未成行) | bar (2 份申请待审), bbq (改期中), museum (2 人出席待记录; also in 历史) | 雨天读书局 (还差 日期、时间) |
| `empty` | 样例：全空（0） | — | — | — |
| `drafts` | 样例：只有草稿 | — | — | 雨天读书局 + 冬至火锅 · 各带一样菜 (信息齐了) |
| `many` | 样例：很多历史 | standard + 5 ended (pottery, hike(未出席), karaoke, bookclub, picnic) → 6-card wall | standard + wine (4/4 人到场), cards (4/5 人到场) | 雨天读书局 |
| `long` | 样例：长名称与长地点 | brunch/livehouse with long titles & places | bar with long title & place | 雨天读书局 |

Badges in `standard`: 我参加的 `3 项要你回应`, 我发起的 `2 项待你处理`. Fixtures are flagged (`fixture:true`, id `demo:mine27:*`) and labelled `含评审样例 · 样例不计入你的真实记录与信用`; they never enter real history or credit facts. “Single event”, “many pending” and “many current” are not separate sets — they are composed live with the review bars (e.g. repeated 来一份申请 on bar → many pending; 局主通过 / 释放一席 on joined rows).

## 7. Noted quirks

- vintage fixture: the queue entrant `fx-q0` is named `Kiki`, same as the host `Kiki`; mahjong fixture: host `阿宽` and member `fx-1 阿宽` share a name.
- `JuLedger.original` stores `loc: '法拉盛'` while the NYC feed row for the same id uses `Queens-法拉盛` (whichever creates the record first wins).
- Fixture events have `initialAvailable 0 / seats 0`; `seats` on feed rows is legacy display and never a capacity fact.
- bbq fixture: after 阿蒋 declines, his member row stays with status `declined` (not removed), so he appears in H1 改期答复 as `拒绝 · 已退出` and in 离开记录 as `拒绝改期`.

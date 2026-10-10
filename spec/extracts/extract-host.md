# 我的局 · 我发起的 (host) + 管理这局 (H1) — product semantics extracted from prior prototype

Source: `d979de84-JU-My-Ju-v3-Opus55-review-canvas.html` — markup `#m02` (L2520–2683), `#h01` (L2684–2774); app script `hostItem27` / `hostPane27` / `hostModel27` / `openHost27` (L5912–5942, L6016–6316); adapter `ju-mine27.js` (base64 on L40: `hostSummary`, `approve/reject/propose/cancel/end/attend/reopenAsDraft/saveDraft/publish`); ledger `ju-state.js` (L39: `counts/formed/expire/invite/leave/promote`).
Canvas notes (verbatim): m02 — 「与产品页同一组件，固定在「我发起的」。有任务的局进「待你处理」，其余按真实阶段：改期中 / 招募中 / 已成局。座位条一席一段，计数注明含你。」 h01 — 「标题是局名，状态在副标题。按进入时的任务排：审核先看申请，散场先记出席，其余先看成员。…代成员操作在画布外。」

---

## 0. Data model (what the host side is built on)

| Fact | Rule |
|---|---|
| Hosted event | A ledger record flagged `hosted27` (published by local account). `capacity` **includes the host** (host occupies slot 0, always `confirmed`). Composer `need` = capacity − 1 (3–8 人局 incl. host → 再邀 2–7 人). |
| Seat counts `counts(r)` | `confirmed` = members with status `confirmed` (host included); `reserved` = status `invited` (6 h reservation running); `available` = `capacity − confirmed − reserved` while `open`, else 0; `queue` = waiting 候补. |
| 成局 `formed` | not cancelled AND (`establishedAt` set OR confirmed === capacity). `establishedAt` is written the first time confirmed hits capacity and **persists** (a later decline/exit does not un-form the 局). |
| Reservation | `invite()` assigns the lowest free slot, `deadline = now + 6h`. Expired → member status `expired` (into history), slot auto-promoted to first waiting 候补 (new 6 h). Expiry is evaluated (`expire`) every time H1 / lists render. |
| Join modes | `application` (申请制: host approves → 6 h 预留 → applicant confirms) / `direct` (直接留位: applicant is invited immediately, still 6 h to confirm). Composer copy: 「申请制：你审核通过才发出 6 小时预留，对方确认后才占定。」 「直接留位：先到先留，对方仍要在 6 小时内阅读约定并确认。」 |
| Applications `applications27[uid]` | `{status: pending/approved/rejected/cancelled, profile:{nick,wx,note,mail,verified}, appliedAt, decidedAt}`. |
| Per-member facts `memberFacts27[uid]` | `acceptedVersion/confirmedVersion`, `tornVersion/tornAt` (撕票), `contactAdded` (member self-reported 已加微信), `reschedule:{version,choice:ask/accepted/declined,answeredAt}`, `attendance: pending/present/absent`, `attendanceHistory[]`, `attendanceStatus`, `exitReason`. |
| Contact visibility `hostCanContact` | formed AND not cancelled AND (not ended OR now < endedAt + 24 h). |
| Event status | `open` → `ended` (记为散场) or `cancelled` (取消). Both terminal. |
| Drafts (`JU_MINE27_1`) | Content keys only: `title,en,pack,cat,city,loc,dateNum,time,capacity,joinMode,fee,note` + `step, createdAt, updatedAt, source{kind:new/reopen, from, title, fixture}`. Never members / contacts / tickets / versions / credit. |
| hostSummary.key (priority order) | `cancelled` → `ended` (label 待记录出席 if attendance pending else 已散场) → `review` (pending apps > 0) → `reschedule` (anyone still `ask` on current version) → `gathering` (not formed; adapter label 等待确认 / 招人中) → `formed` (已成局). |

---

## 1. 我发起的 list (m02 / s01 host role)

### 1.1 Header
- Title 我的局. Role tabs 我参加的 / 我发起的 (in review mirror m02 the other tab is `aria-disabled`, locked). Badge on 我发起的 = number of 当前 rows in 待你处理 (`aria-label` 「N 项待你处理」; join badge is 「N 项要你回应」).
- View tabs for host: **当前** (no count) · **草稿** (count = drafts) · **历史** (count = past rows; note an ended 局 awaiting attendance counts in both 当前 and 历史).
- Switching role keeps the other role's view/scroll; switching view restores that view's own scroll.
- Bottom nav: 找局 / 开局 / 我的局 / 设置.
- Fixture footer when samples present: 「含评审样例 · 样例不计入你的真实记录与信用」.
- Read failure (join pane only in markup): 「本机记录暂时读不出来 / 你的局没有丢，只是这台设备暂时读不到。」 + 重新读取.

### 1.2 Row → group mapping (`hostItem27`)

| Condition (in order) | group | section |
|---|---|---|
| status cancelled | `closed` | 历史 › 已取消 |
| ended and no attendance todo | `archive` | 历史 › 已散场 |
| todo exists (pending apps, or ended + attendance pending) | `todo` | 当前 › 待你处理 (ended+todo **also** in 历史 › 已散场) |
| proposal open & someone unanswered | `resched` | 当前 › 改期中 |
| formed | `formed` | 当前 › 已成局 |
| else | `recruit` | 当前 › 招募中 |

`life` chip (always shown on row): 已取消 / 已散场 / 改期中 (proposal + unanswered) / 已成局 / 招募中. A 局 with pending apps **and** open reschedule sits in 待你处理 with life 改期中.

### 1.3 当前 sections (empty sections hidden)

| Section h2 | count | note | sort |
|---|---|---|---|
| 待你处理 | n | 审核与出席 | review-intent first, then event time |
| 改期中 | n | 等成员逐人答复 | event time |
| 招募中 | n | 还没成局 | event time |
| 已成局 | n | 按日期 | event time |

Lead = first 待你处理 row only: gets glossy CTA button (审核申请 / 记录出席). All todo rows show inline next-text (`jm3-next`) = same CTA. Non-todo rows have no CTA text (intent `manage`, tap opens H1).

### 1.4 Row content (当前)
- `life` chip · title · `when` (`WD MM.DD · HH:MM`) · place (neighbourhood only, e.g. 威廉斯堡).
- Seat bar (`hasSegs` = not cancelled & not ended): one segment per seat, slot 0 = 局主 (ok); `ok` 已确认 / `res` 已预留 / `open` 空位. Seat line: **已确认 c/cap** + basis 「含你」 + more: `预留 N · 空 N · 候补 N` (zero parts omitted; 空 omitted when ended).
- State label (`label`):

| host.key / status | label |
|---|---|
| review (todo) | `N 份申请待审` |
| ended + attendance pending (todo) | `N 人出席待记录` |
| reschedule | `N 人未答复新时间` |
| gathering, reserved>0 | `N 人已预留 · 等确认` |
| gathering, reserved=0 | `还有 N 个空位` |
| formed | `全员确认 · 已出票` |
| ended (no todo) | `n/N 人到场` (confirmed members marked present / confirmed non-host) or 已散场 if no members |
| cancelled | `票根作废 · 联系已关闭` |

- Card thumbnail (JuCardV2, same card the member sees): statusLabel 已成局 / 仍可报名 / 席位已预留; seatCaption `已确认 n/cap · 已预留 N`. Card flies to H1 on open and back on return.
- aria: `title，life，label，when，place`.
- Tap → `openHost27(id, scope, intent)` with intent `review` / `attendance` for todo rows, else `manage`.

### 1.5 草稿 view
- Undo bar (10 s): 「已删除「{title}」」 + 撤销 → draft restored in place (row unfolds).
- Section 没写完的局 — note 「只存活动内容 · 成员和记录不进草稿」.
- Draft row: card (statusLabel 草稿, host 你, seats = capacity−1, title fallback 未命名的局) · title · when (`WD MM.DD · HH:MM`, else 日期未定) · place (else 地点未定) · completeness state · `改于 {刚刚 / N 分钟前 / N 小时前 / N 天前}` [· `由「{source title}」再开`] · next-text 继续编辑 · 删除 button (aria 「删除草稿「{title}」，可撤销」).
- Completeness: missing = any of 局名 / 日期 / 时间 / 地点 → 「还差 日期、时间」 (`data-ready=false`); none missing → 「信息齐了，可以发布」 (`data-ready=true`). (Publish additionally validates capacity 3–8; errors 写一个局名 / 选一个日期 / 选一个时间 / 写一个大致地点 / 「当前原型支持 3–8 人局（含局主），即再邀 2–7 人」.)
- Tap row → load draft into composer (c01 / root `create`), return context = 我发起的 · 草稿. Composer back → 我发起的 · 草稿. 
- Delete failure toasts: 没有删除成功 / 没有恢复成功 / 草稿已不存在。/ 本机没有保存成功，请重试。
- Drafts sorted by `updatedAt` desc.

### 1.6 历史 view
- **已散场** (count) — note 「可以从这里再开一局」. Wall of ticket-art stubs (mode one/few/many), sorted endedAt desc. Stub: title · when · place · sub = `n/N 人到场`; plus link **再开一局** (aria 「用「{title}」再开一局」). Tap stub → H1.
- **已取消** (count) — note 「票根作废 · 联系已关闭」. Spine list (pack-coloured edge with `en`), sorted event time desc; sub = 票根作废 · 联系已关闭. Tap → H1.
- No 举报 / 申诉 entries on the host side (those links — 我的举报, 信用记录 · 补充与申诉 — exist only in 我参加的 › 历史 footer).

### 1.7 Empty states (host)

| view | condition | title | body | CTA → |
|---|---|---|---|---|
| 当前 | drafts exist | 还没有进行中的局 | 草稿还在，补完就能发布。 | 接着改草稿 → 草稿 view |
| 当前 | no drafts | 还没发起过局 | 开一个局，审核、成员和出席都在这里管。 | 去开局 → composer |
| 草稿 | — | 没有草稿 | 开局时随时可以先存一份，没写完的局会留在这里。 | 去开局 → composer |
| 历史 | — | 还没有结束的局 | 散场和取消的局会留在这里，可以从中再开一局。 | 回到当前 |

---

## 2. 管理这局 (H1)

### 2.1 Opening / closing
- `openHost27`: resets handled-application order, sheets, messages; intent = given (`review` / `attendance`) or derived: pending apps → review; ended + attendance pending → attendance; else manage. Always opens scrolled to top (strip leads so the flying card has a landing slot).
- Review layout default (no 局 chosen): first open hosted 局 with pending apps, else first open, else first.
- Missing record: title 找不到这场活动, meta 「这场活动不在本机，返回我的局重新选择。」; opening from list toasts 「这场活动不在本机。」.
- Back pill aria: 返回我的局 (when return context is 我的局) / 返回找局. Back clears sheets/done results and returns to list, landing on the originating row.
- Collapsing header: title = 局名 (stamp-settles on state change); meta = `{status} · {when}`; progress row (hidden when cancelled).

### 2.2 Header status strings (`status`)

| condition (priority) | status |
|---|---|
| cancelled | 已取消 |
| ended, unrecorded > 0 | `N 人出席未记录` |
| ended, all recorded | 已散场 |
| pending apps | `N 份申请待审` |
| reschedule unanswered | `N 人未答复新时间` |
| formed | 已成局 |
| reserved > 0 | `N 人已预留 · 等确认` |
| else | 招募中 |

### 2.3 Header progress
- Before end: left **已确认 c/cap（含你）**, right `预留 N · 空 N`; segs = one per seat (host ok). aria `已确认 c/cap，含你；已预留 N；空位 N`.
- After end: left **`nRec/N 已记录出席`**, right `出席 n · 未出席 n`; segs = one per confirmed member (ok=出席, res=未出席, open=未记录), each labelled `name attLabel`. aria `nRec/N 人出席已记录`.

### 2.4 Event strip (always first)
Card thumbnail (tap → 局卡 sheet) · when (prints anew on change) · place (full `Brooklyn · 威廉斯堡`) · `formedLine` · link **查看局卡**.

| state | formedLine |
|---|---|
| cancelled | 已取消 · 不能撤销，票根作废、联系关闭 |
| ended, within 24 h | 已散场 · 24 小时内仍可查看成员微信 |
| ended, after 24 h | 已散场 · 联系方式已关闭 |
| formed | 已成局 · 成员微信仅你可见 |
| open, not formed | 全员（含你）确认后成局出票 |

Cancel transition: card stays, colour drains (`data-cancelled`), embers leave its lower edge once.

### 2.5 Section order by intent (then 这局的安排 always last)

| intent | sequence | section shown if |
|---|---|---|
| review | 申请 → 改期答复 → 成员 → 候补 | 申请: any pending or handled-this-visit; 改期答复: proposal && open; 成员: not ended; 候补: waiting > 0; 出席: ended && confirmed members > 0 |
| attendance | 出席 only | |
| manage (default) | 改期答复 → 成员 → 申请 → 候补 | |

Errors from any write appear in place as alert: `{adapter message}` or fallback 「这一步没有生效，请刷新后重试。」; on success nothing but the in-place result.

### 2.6 申请 (applicant review)
- Header 申请 · **count = still-pending** · note 「通过即发出 6 小时预留」 or, once any handled this visit, 「已处理 N」.
- Applicant row: avatar initial · nick (fallback 未填称呼) · badge `{domain} 邮箱已验证` (e.g. nyu.edu) **or** 未验证邮箱 · note in quotes “…” (if any) · `申请于 {ago}` · actions **谢绝** (secondary) / **发出邀请** (primary glossy).
- After action the row stays in place (no reorder) until leaving the screen; buttons replaced by result line: `invited` → 「已发出邀请 · 等对方确认」; `rejected` → 「已谢绝 · 对方会看到「这次没留住」」.
- Help: 「发出邀请后对方有 6 小时阅读约定并确认，确认前不占定、不出票；申请人的微信成局后才可见。」
- Effects of 发出邀请 (`approve`): application → approved; member row created `invited` with slot + 6 h deadline, name/profile copied from application; reserved +1, available −1, pending −1; header status recomputed. Refusals: 这份申请已经处理过。/ 名额已满，暂时不能再发邀请。/ 候补里有人排在前面，按顺位先邀请。/ 活动已取消。/ 活动已结束。
- 谢绝 (`reject`): application → rejected (no seat change); member sees 这次没留住 · 不影响信用.
- Direct-join events skip review (applicant is invited at once).

### 2.7 改期答复 (reschedule tracking)
- Header 改期答复 · **已答复 n/N** · note 「没有答复期限」.
- Change row: 原定 ~~old when~~ → 改为 **current when**.
- Roster of every confirmed member asked on the current version: `还没答复` (ask) / `接受 · 换新版票` (accepted) / `拒绝 · 已退出` (declined).
- Help: 「接受的人换新版票并保留已加微信；拒绝的人释放席位，不计主动退出。」
- Shown while `proposal` exists and 局 open (even if 0 asked).

### 2.8 成员 (roster; hidden after end)
- Header 成员 · basis `{cap} 个座位（含你）· 已确认 N[ · 预留 N]`.
- Rows in slot order: host row avatar 主 · host name · 「局主 · 你」; then each invited/confirmed member:

| member | state text | tone | extras |
|---|---|---|---|
| invited | 已预留 | res | countdown `剩 HH:MM:SS` (colour drains toward deadline) |
| confirmed, formed, open | 已确认 | ok | ticket: 已撕票 / 票根未撕 |
| confirmed, not formed | 已确认 | ok | ticket: 等成局出票 |
| confirmed, asked | 未答复新时间 | wait | |
| confirmed, accepted | 已接受新时间 | ok | |
| cancelled 局 | 取消前已确认 / 取消前已预留 | void | |

- `已自报加微信` shown when member marked contact added.
- 联系信息: `微信 {wx}` + **复制** only when member is confirmed AND `canContact` (formed, not cancelled, < 24 h after end) AND wx on file. Copy → toast 「微信号已复制」; failure alert 「未能复制，请长按微信号手动复制」.
- Empty seat row (open & available > 0): **还有 N 个空位** / 等人.
- **离开记录 · N** (collapsed `<details>`, last 6, newest first): name + `预留到期` / `放弃预留` / `拒绝改期` / `主动退出` / `已撤回` / `未通过`.
- Member withdrawal writes `hostNotices27 {type: member_withdrew}` in data but it is **not surfaced** in the UI.

### 2.9 候补
- Header 候补 · N · 「不占席位」. Rows `№n` · name · `加入于 {ago}`.
- Help: 「有人放弃或预留到期时，按顺位自动发出 6 小时预留。」 Promotion is automatic (ledger `promote`); the adapter's `inviteFromQueue` is not wired to any UI.

### 2.10 出席 (attendance; after 记为散场)
- Header 出席 · **nRec/N** · 「逐人记录 · 可更正」. One row per confirmed (non-host) member.
- Row: avatar · name · attLabel: `未记录` (none) / `待定` / `出席` / `未出席 · 待核实` · **更正** link (when recorded & not editing) · wx + 复制 (while canContact) · trail.
- Segmented control (shown when unrecorded or editing): **出席 / 未出席 / 待定**; `aria-pressed` only once something was chosen (待定 is a real choice, not a default). Choosing writes immediately, closes edit mode, shows stamp mark 出席 / 未出席 / 待定 (fresh animation < 2.5 s).
- Trail (shown when ≥ 2 history entries), newest first: `记录 {X} · M.DD HH:MM` for the first entry, `更正 {A} → {B} · M.DD HH:MM` for corrections.
- Help: 「未出席是待核实的事实，不等于故意缺席，也不会自动处罚；可随时更正，更正会留下记录。」 + `散场 24 小时内仍可查看成员微信` / `散场已超过 24 小时，联系方式已关闭`.
- Write (`attend`): only after end (散场后才能记录出席。), only confirmed members (只为已确认的成员记录出席。); same value → no-op; sets `attendanceStatus` recorded / pending_review (absent) / pending. No penalty executed.

### 2.11 这局的安排 (plan)

| button | sub | shown when |
|---|---|---|
| 改时间 | 已确认的人各自答复 | open && no unanswered reschedule |
| 记为散场 | 散场后逐人记录出席 | open && formed && no unanswered reschedule |
| hint 还没成局，不能记为散场 | | open && not formed |
| 取消这局 (danger) | 确认前会列出受影响的人 | open |
| 再开一局 | 只带入活动内容，成员与记录不复制 | ended or cancelled |

### 2.12 改时间 sheet
- Title 改时间 · × · identity (xs card, title, `when · place`).
- Change row: 原定 ~~when~~ → **改为 · 纽约时间** `{new when}` or placeholder 「选好新的日期和时间」 (`data-ready`).
- Inputs: 新日期 (`date`, prefilled current) · 新时间 (`time`, 15-min step, prefilled current).
- Note when identical: 「新时间和原时间一样，换一个日期或时间才能确认。」
- Description (`rsDesc`): confirmed non-host > 0 → 「N 位已确认的成员要各自答复：接受换新版票，拒绝释放席位且不计主动退出。答复前旧票不能使用。」; none confirmed but reserved → 「现在没有要答复的已确认成员；已预留的人确认时看到的就是新时间。」; nobody → 「还没有已确认的成员，新时间直接生效。」
- Buttons 再想想 / **确认改时间** (disabled until a different valid date+time).
- Submit (`propose`): version +1; event date/wd/time replaced; meeting = time − 10 min 「门口」; `proposal {old, current, choice: host}`; every confirmed non-host member gets `reschedule {choice: ask}`. Refusals: 选好新的日期和时间。/ 新时间和原时间一样。/ 上一次改期还有人未答复。
- After: scroll to top, sheet closes, intent → manage, toast 「已改时间 · 等 N 位成员答复」 (or 「已改时间」 when N = 0); header when re-prints; 改期答复 section appears; list row → 改期中 (`N 人未答复新时间`), life 改期中.
- Member answers (participant side s11): accept → accepted version & new ticket auto-torn, keeps contact; decline → seat released (`declined` → 离开记录 拒绝改期), queue promoted, contact closed, not counted as 主动退出.

### 2.13 取消这局 sheet (alertdialog)
- Title 取消这局 · identity.
- 会受影响的人 (zero rows omitted, block hidden if all zero): 已确认成员 (confirmed − host) · 已预留 · 候补 · 待审申请.
- Irreversible line: 「取消后已出的票根作废、联系入口关闭，不能撤销。」 Description: 「活动、未确认的邀请和候补一起结束；成员不计主动退出。」
- Buttons 再想想 / **确认取消** (danger).
- Write (`cancel`): status cancelled + cancelledAt; waiting/invited queue → cancelled; invited members → cancelled; pending applications → cancelled; every member's contactAdded = false + contactClosedAt. Confirmed members keep status (shown 取消前已确认).
- After (no toast): scroll top, sheet closes; header status 已取消, progress hidden; formedLine 已取消 · 不能撤销，票根作废、联系关闭; roster void-toned; plan shows only 再开一局; list row → 历史 › 已取消 (`票根作废 · 联系已关闭`). Participants see s12 (局主取消, ticket burn).

### 2.14 记为散场 sheet
- Title 记为散场？ · identity · description 「记为散场后，你可以逐人记录出席（待核实，可更正）。成员微信在散场 24 小时后不再可见。」 · 再想想 / **记为散场**.
- Write (`end`): refusals 还没成局，不能记为散场；可以取消这场。/ 改期还有人未答复，先等答复。; sets status ended + endedAt.
- After: scroll top, sheet closes, intent → attendance; header `N 人出席未记录`, progress switches to attendance; only 出席 + 这局的安排 (再开一局); list row → 待你处理 `N 人出席待记录` with CTA 记录出席 **and** 历史 › 已散场 (`n/N 人到场`); contact stays visible 24 h.

### 2.15 查看完整局卡 sheet
- From strip thumbnail or 查看局卡 link. Title 局卡 · full-size JuCardV2 (statusLabel 已成局 / 仍可报名 / 席位已预留; seatCaption `已确认 n/cap · 已预留 N`) · help 「成员在详情里看到的是同一张局卡。」 · close × / overlay tap.

### 2.16 Toasts on H1
已发布 · 这局出现在「我发起的」 (after publish) · 微信号已复制 · 已改时间 · 等 N 位成员答复 / 已改时间. (2.6 s.)

---

## 3. Jumps to other modules

| from | action | to |
|---|---|---|
| 我发起的 empty / 草稿 empty / nav 开局 | 去开局 | composer (c01 seam, root `create`), fresh draft |
| 我发起的 › 当前 empty (drafts exist) | 接着改草稿 | 我发起的 › 草稿 |
| 草稿 row | 继续编辑 | composer loaded with draft; back → 我发起的 › 草稿 |
| 历史 › 已散场 stub / H1 plan | 再开一局 | `reopenAsDraft`: new draft with content only (date/time cleared), `source {kind: reopen, title}`; composer shows 「只带入了活动内容；成员、联系方式、票根和记录不会复制。」; failure toast 草稿没有保存成功 |
| composer | 存草稿 | message 「已存为草稿 · 在「我的局 · 我发起的 · 草稿」继续」 |
| composer | 发布 | validates; publishes (draft deleted, event `host27:*` hosted); sets 我发起的 · 当前 as return; opens H1 (manage) with toast 已发布 · 这局出现在「我发起的」; errors 「还差几项，补完再发布」 |
| 我的局 | bottom nav | 找局 / 开局 / 我的局 / 设置 |

Report / credit / appeal: none on host rows or H1. (Only 我参加的 › 历史 footer: 「散场后遇到问题，或对记录有异议」 → 我的举报 / 信用记录 · 补充与申诉.)

---

## 4. Review fixtures (host, variant `standard`) — useful as acceptance scenarios
Applicant pool (nick / wx / note / verified@nyu.edu): 小满 xm_01 「第一次来，会带一副牌」 ✓ · Kiki kiki1210 「新手友好吗？」 ✗ · 阿蒋 jiang_sva 「SVA 在读，想认识新朋友」 ✓ · Momo momo-cold 「带一杯冷萃当见面礼」 ✓ · Leon leon_hp 「下班直接过去」 ✗ · Ivy ivy_pm (no note) ✓.

| fixture | setup | expected list state |
|---|---|---|
| 周五小酒馆试营业 (riso, 12-19-2026 20:30, Manhattan-东村, cap 5) | 小满 approved+confirmed; Kiki invited (deadline 2 h 14 m); 阿蒋、Momo pending | 待你处理 · life 招募中 · `2 份申请待审` · 已确认 2/5 含你 · 预留 1 · 空 2 · CTA 审核申请 |
| 阳台烧烤 · 自带肉 (street, 12-20-2026 17:00, Queens-长岛市, cap 4) | 3 approved+confirmed (formed); 小满 torn+contact; proposed → 12-21-2026 16:00; 小满 accepted, 阿蒋 declined | 改期中 · `1 人未答复新时间` · 已答复 2/3 · 离开记录: 阿蒋 拒绝改期 · still formed (establishedAt) with 空 1 |
| 看展搭子 · 现代馆 (acid, 12-06-2026 13:00, Manhattan-中城, cap 4) | 3 confirmed+torn; ended 20 h ago; 小满 present | 待你处理 `2 人出席待记录` (CTA 记录出席) and 历史 › 已散场 `1/3 人到场`; wx still visible (< 24 h) |
| draft 雨天读书局 (invite, Brooklyn-公园坡, cap 4, no date/time) | — | 草稿 · 「还差 日期、时间」 |
| variant many: 自然酒小试 · 六款 (cap 5, 4 present, ended 13 d) · 德州扑克新手桌 (cap 6, 4 present 1 absent, ended 27 d) | — | 历史 › 已散场 `4/4 人到场` / `4/5 人到场`; contact closed |
| variant drafts: 雨天读书局 + 冬至火锅 · 各带一样菜 (complete) | — | 草稿: 还差… / 信息齐了，可以发布 |

Samples are flagged (`fixture`, id `demo:mine27:*`) and never count toward real records or credit.

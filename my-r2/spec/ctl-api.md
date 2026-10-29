# 共享控制器 `JU.ctl`（`my-r2/src/core/ju-ctl.js`）· 接口定稿 v1（核心 1 · 2026-10-22）

控制器只负责**行为**：角色 / 分区、导航栈、页头收拢变量、详情与局内动作、票根仪式的触发与数据写入、管理 H1 十二个表面、草稿删除撤销、弹层与焦点、toast、复制、时钟。**不含任何标记与样式**。每套方案用自己的构图、排版、表面和运动去渲染 `this.ctlVals()`。字段以本文为准（已按实现改写；v0 的要求没有删减，差异见 §13）。语义以 `spec/state-inventory.md` A–G 与 `my-r2/src/core/ju-data.js` 为准。接线参考：`my-r2/concepts/src/C00.dc.html`（每个绑定都在里面，视觉故意朴素）。

## 1. 用法
```js
class Component extends DCLogic {
  constructor(p) {
    super(p); this.reviewInit(CONCEPT);
    this.motionSpec = { fwd: 360, back: 300, swap: 280, role: 300 };   // 1× 毫秒；控制器按速度放大、减少动态归零
    this.headerRange = 96; this.processMs = 360; this.printMs = 2300; this.burnMs = 6600; this.deleteMs = 260;
    this.tearSpec = { dist: 160, kx: -1, ky: 1.2 };                     // 拖拽 → progress = clamp((dx·kx + dy·ky) / dist, 0, 1)
  }
  initialState(variant) { return JU.baseState(variant); }              // 已含控制器状态 nav / sheet / toast / ui
  onEffect(fx) { /* 数据已写好；在这里登记 / 启动自己的运动或调用 JU.ritual.* */ }
  renderVals() { const panel = this.panelVals(); panel.show = this.props.panel !== false; const c = this.ctlVals(); return { panel, rootRef: this.rootRef, c }; }
}
JU.mixin(Component);   // 安装评审 mixin + 控制器；applyJump 默认 = ctlJump（50 条索引全部映射）
```
可覆盖：`motionSpec`、`headerRange`（默认 96px）、`processMs`（处理中可见时长，默认 360ms，真实时间，减少动态不压缩）、`printMs`（出票占位时长 2300ms，共享仪式接入后由仪式回调 `c.ticket.printed()` 结束，先到先算）、`burnMs`（燃烧占位 6600ms，同理 `burnDone()`）、`deleteMs`（草稿收起 / 展开 260ms）、`tearSpec`、`tearThreshold`（0.5）、`paths`、钩子 `onEffect(effect)`、`onNav(kind, surface, params)`、`beforeReplay(name)`。

## 2. 状态（`JU.ctlState()`，合并进 `JU.baseState`）
| 键 | 内容 |
|---|---|
| `nav` | `{ stack:[{s,p,from,key,id}], phase:'idle'∣'enter'∣'in'∣'exit', dir:'fwd'∣'back'∣'swap'∣'role', seq, leaving }` |
| `role` / `section` | `joined∣hosted` / `current∣history∣drafts`（来自 `JU.baseState`；home 不入栈） |
| `sheet` | `null` 或 `{ kind, sub, eventId, id, busy, error, done, date, time, text }` |
| `toast` | `null` 或 `{ text, kind, id }` |
| `ui` | `memo{joined,hosted}`（各角色分区记忆）、`prevRole/prevSection`、`landKey`（返回落点 1.1s）、`read{eventId,progress,done,doneAt}`、`ticket{printed{key:true}, printing:key∣null, tear{progress,active,done,error}, contactOpen}`、`burned{eventId:true}`、`burn{eventId,playing}`、`result{eventId,kind,sub,title,body,formed,burn,burning}`、`copy{key,text,ok,at}`、`undo{draftId,title,index,at}`、`ghost{draftId,index,draft}`、`restored`、`manage{open{sec:bool},editing{memberId:bool},fresh{memberId:seq},focus,next}`、`busy{key:true}`、`errors{key:msg}`、`fx`（最近一个效果）、`tick`、`settled` |

## 3. 表面（surface）与栈
`home`（角色 × 分区在 state 里，不入栈）→ `detail`（参加者局内详情；含成员视图）/ `read`（阅读并确认层，detail 之上）/ `waitlist`（候补门口 + 回执）/ `ticket`（票根面：打印 / 撕 / 联系层 / 待赴约 / 不可用说明 / 退出结果）/ `reply`（改期答复：新票）/ `history`（历史展开）/ `manage`（H1，params `{eventId, intent}`）/ `draft`（草稿摘要，params `{draftId}`）。弹层不是表面，是 `c.sheet`。

默认路径 `JU.CTL_PATHS`：`detail:['home','detail']`，`read:['home','detail','read']`，`ticket:['home','ticket']`，`reply:['home','reply']`，`history:['home','history']`，`manage:['home','manage']`，`draft:['home','draft']`，`waitlist:['home','waitlist']`。`go('read')` 从 home 直接推入时会把缺失的父级 `detail` 插到它下面（返回永远有去处）；`go()` 忽略与栈顶相同（同 surface + 同 params）的重复推入；`back()` 在 exit 动画中可连续调用（先结算上一个）；`replace()`（dir `swap`）用于「查看退出结果 → history」「查看票根（成局后）」这类不该再返回中间态的切换。

### `c.nav`
| 字段 | 说明 |
|---|---|
| `on.<s>` / `is.<s>` / `cls.<s>` | 该 surface 是否要渲染（top / under / leaving 三者都 on）/ 是否栈顶 / 类名：`is-top∣is-under∣is-leaving` + `ph-enter∣ph-in∣ph-idle∣ph-exit` + `dir-fwd∣dir-back∣dir-swap∣dir-role` |
| `cur / prev / depth / phase / dir / moving / params` | 栈顶 surface、下层 surface、深度、相位、方向、是否在动、栈顶 params |
| `from / fromStyle / fromKey` | 起点矩形（`ev.currentTarget.closest('[data-origin]')`，`JU.fx.rectIn`）/ `--fx-x/--fx-y/--fx-w/--fx-h` 样式串 / 起点 key。**返回时控制器重新测量同 key 的元素**（已移组时先滚进视口），元素不存在则 `from=null`（概念改为淡出） |
| `landKey` | 返回完成后 1.1s 内等于起点 key（行上 `row.landing` 同步为 true）供落点标记 |
| `back() / home()` | 返回 / 回到根（清栈） |
| `onScroll(ev)` | 绑在每个 `[data-scroller]` 上：写 `--hc`（0→1，`scrollTop / headerRange`）到滚动容器、`[data-surface]` 祖先及其 `[data-header]`；返回时按 (surface id) 或 (home × role × section) 恢复滚动位置 |
| `rootCls` | `' nav-<phase> dir-<dir> at-<cur> over-<prev> leaving-<s> role-<role> sec-<section> has-sheet has-toast'`（拼在 `.app` 类名上） |
| `title / curTitle / leavingFrom` | 表面中文名表 / 当前名 / 离开中的起点矩形 |

## 4. 角色与分区
`c.role`、`c.section`、`c.prevRole`、`c.prevSection`、`c.setRole(k)`、`c.setSection(k)`、`c.roleTabs[{k,label,badge,badgeText,on,cls,go}]`、`c.sectionTabs[{k,label,count,countText,on,cls,go}]`（局主多一个 `drafts`）、`c.home{cls:'role-x sec-y ph-… dir-…', isJoined,isHosted,isCurrent,isHistory,isDrafts}`。切换时 home 留在栈上，`nav.phase/dir` 走 `enter → in → idle` + `dir-role` / `dir-swap`，各角色记忆分区与滚动（切换前捕获、切换后恢复）。选择器：`data-role-tab="joined|hosted"`、`data-section-tab="current|history|drafts"`。

## 5. 列表视图模型
**`c.joined`**（= `JU.derive.joined` 全部字段 + 包装）：`groups.{act,soon,wait,kept,closed}`、`current`、`history`、`lead`、`sections[{key,title,note,count,rows}]`（当前三意图，空组不出现）、`sectionsHistory`（散场 / 未成行）、`months[{key,title,rows}]`（历史按月）、`badge`、`badgeText`、`counts{current,history}`、`empty{on,kind,title,body,action{label,inert,go}}`（去找局 inert；历史空态 → 回到当前）。
每行 = derive 行（`id,stage,label,group,tone,need,cta,detailTitle,when{zh,md,time,wdZh,wdEn,…},place{area,hood,full},counts,seats[],host,ticket,contactAdded,attendance,records,queuePos,deadline,left,leftText,leftRatio,leftTone,contactOpen,hostWx,oldWhen,newWhen,attendanceText,…`）+ `key,title,en,pack,hostName,left{text,ratio,tone:'green∣amber∣red∣expired',on,expired}（读 JU.now()）,deadlineText（请在 今天/明天 HH:MM 前…）,open(ev),act(ev),secondary(ev)∣null,secondaryLabel,secondaryKey('withdraw∣release∣exit∣decline∣leave-queue'),ctaLabel,isLead,landing,originKey('row-<id>'),whenText,placeText,seatText,monthTitle`。
`open`：按 stage 进 detail / waitlist / ticket / reply / history；`act`（主动作）：invited → `read`、contact → `ticket`+联系层、其余同 open；`secondary` → 确认层。行内按钮的点击不会冒泡成 open（控制器的 act / secondary / del 都 `stopPropagation`，`open` 又忽略来自内部 `[data-act]` 的点击）。

**`c.hosted`**：`rows`、`sections[{key:todo∣resched∣recruit∣formed,…}]`、`sectionsHistory[{ended,cancelled}]`、`current`、`history`、`lead`、`drafts`、`badge`、`badgeText`、`counts{current,drafts,history}`、`undo{on,draftId,text,label,act(),left}`、`empty{…}`（有草稿 → 接着改草稿 `go` 到草稿分区；去开局 inert）。
局主行 = `JU.derive.hostRow` 全部字段（`key` 被换成活动 id 作列表键；derive 原来的状态键在 **`stateKey`**：`cancelled∣ended∣review∣reschedule∣formed∣recruit`；`todo,life,label,status,cta,section,pending,unanswered,unrecorded,present,nonHost,formed,contactOpen,formedLine,counts,seats,seatText,seatMore,when,oldWhen,place,canReschedule,canEnd,canCancel,…`）+ `title,en,pack,open(ev),act(ev),intent('review∣attendance∣manage'),ctaLabel,isLead,landing,originKey,whenText,placeText,roster`。
草稿行 = derive（`id,title,untitled,whenText,placeText,ready,missingText,agoText,source,seats,capacity,pack`）+ `key,cls('is-deleting'∣'is-restored'∣'')、ghost、sourceText、open(ev)、del(ev)、continueInert:true、continueLabel、originKey、landing`。删除：引擎立刻写入 → 原槽位保留 `ghost` 行 `deleteMs` 供收起 → 撤销条 10s（`holdKey('undo')`）→ `undo.act()` 原槽位恢复并带 `is-restored` 260ms；到期 `commitUndo`。

## 6. 参加者局内
**`c.detail`**（栈顶 ∈ detail / read 时 `on`）：`eventId,row,title,stage,label,need,event,when,place,host,members[{id,name('你'),status,statusText('局主∣已确认∣已确认 · 等成局出票∣已预留 · 剩 N 小时∣位置已释放'),you,leftText,tone}],seats,counts,seatText,countdown{text,ratio,tone,on,expired},rules(JU.RULES),primary{key,label,act,disabled,busy},secondary{key,label,act}∣null,openRead(ev),result,error,back(),receipt(候补轮到的回执),originKey`。
`primary.key`：`read`（阅读并确认）/ `ticket` / `reply` / `waitlist` / `history` / `members` / `home`（回到列表：到期或已有结果）/ `none`（禁用：等局主审核 / 等待确认）。到期中途：`countdown.expired` → 标题「预留已到期」、primary 回到列表。

**`c.read`**（栈顶 read）：`eventId,row,title,progress(0..1),done,state('reading∣busy∣failed∣confirmed∣expired∣released'),busy,failed,confirmed,expired,error,rules,countdown,members,hint('请读到末尾，再确认入局'→'已读完，可以确认'),endMark,onScroll(ev)（**绑在阅读层自己的 `[data-scroller="read"]` 上**，既写 `--hc` 也记进度；内容不足一屏时自动算读完）,confirm(),retry(),release(ev),primary{key:'confirm∣retry∣ticket∣members∣home',label,act,disabled},secondary,back(),result{title,body,formed}`。确认：处理中 ≥ `processMs` → 引擎 → 失败原位 + 重试 / 成功 → `result`（成局 → 「查看票根」`replace('ticket')`，否则「查看成员」返回 detail）。

**`c.waitlist`**（栈顶 waitlist）：`eventId,row,title,stage,pos,total,counts,seats,seatLine,entered[],queue[{pos,name('X**'∣'你'),you}],hint,receipt{title('已加入候补∣位置已预留∣邀请已到期∣已退出候补'),field,body,note},countdown,turn(轮到),result,viewInvite(ev)（→ read）,leave(ev)（→ 确认层）,ok(),back(),primary{label,act},secondary`。

**`c.ticket`**（栈顶 ticket / reply；`c.reply` = `c.ticket.reply`）：
| 字段 | 说明 |
|---|---|
| `face` | `title,en,pack,time,md,wdZh,wdEn,date,when,place,meeting('HH:MM 门口'∣'待局主确认'),host,version,versionText,stamp('时间已改'∣''),code,seat,torn,tornText` |
| `state` | `fresh`（本版未印、仪式未启动）→ `printing` → `printed` → `torn`；`void`（取消 / 散场 / 退出 / 未出票 / 改期待答复时打开 ticket 面） |
| `printing / printed() / printKey` | 本版（`eventId:version`）未打印过 → 进入时 `printing` 并由控制器 `afterKey('print', printMs)` 兜底；共享仪式 `JU.ritual.print(el,{onDone:c.ticket.printed})` 先完成就先结束；离开不清除已印记忆 |
| `tear` | `progress,active,done,error,threshold,canTear,style('--tear:0.42'),cls('is-drag'∣'is-torn'),onDown/onMove/onUp/onCancel,onKey(Enter/Space),tearNow(),label,hint`。拖拽映射 `tearSpec`；未过阈值回弹（不写数据）；过阈值或 `tearNow()` → **先写** `tearTicket` / `acceptReschedule` → 成功才 `fx torn`、副券落下，失败 `error`「未能保存，请重新撕下副券」+ 重试（副券复位）；撕开 300ms 后联系层自动打开 |
| `contact` | `on,available,wx,hostName,hostLabel,note,closed,closedText,done,busy,error,copy(),copied,copyFail,copyLabel,retryCopy(),markContacted(),ctaLabel('已加微信∣处理中…∣重试∣待赴约'),ctaDisabled,open(),close(),toggle(),openSheet(ev)`（做成弹层的方案用 sheet kind `contact`） |
| `unavailable` | `{on,text,label,act}` 票不可用六种说明（取消 / 散场 / 改期待答复 / 未确认 / 待成局 / 已退出）各自一句 + 一个去处 |
| `result` | 退出 / 拒绝改期后：`{title,body,label:'查看退出结果',act,burn,burning,burnDone()}` |
| `exit(ev) / exitLabel / canExit` | 去不了了 → 确认层（reply 面是 `decline`） |
| `reply` | `oldWhen,newWhen,oldText('原定 …'),newText('改到 周x HH:MM 门口'),answered,accept()(= tearNow),decline(ev),oldTorn,contactAdded` |
| `ritual` | 给共享原件的文字槽位（`JURitual.fillTicket / print / tear` 的 data）：`{key, title, time, md, loc, meeting('HH:MM 门口'∣'待局主确认'), host, previous('FRI 12.18 19:30'，改期票才有), mark('时间已改'∣''), reissued, account(局主微信), added}`；概念把同一份值绑进 `data-slot` 文字，脚本再交给原件 |
| `registerTear(h)` / `tearCommit()` | 共享撕票 rig 的接入点：`JURitual.tear` 的 handle 注册后 `tear.tearNow()` 走它的 `trigger()`（键盘路径）；rig 的 `onDetach` 调 `tearCommit()`（同步写入，返回布尔：失败副券回位 + 错误行，成功才坠落、才发 `torn`）。没有 rig 时 `tearNow()` 自己写入并 300ms 后打开联系层 |
| `contact.copyWith(run)` | 剪贴板调用属于共享联系层时（`handle.copy()` → `Promise<boolean>`）用它：真实结果进 `copyState`，面板「下一次复制失败」让这一次 `writeText` 被拒（原件也显示自己的「复制失败，请长按账号复制」） |
| `result.reason` | 作废原因给 `JURitual.burn`：`withdrawn`（主动退出，C）∣ `reschedule-declined`（B） |
| `back(), isReply, hostWx, originKey, rules, title, stage, row` | |

**`c.history`**（栈顶 history）：`eventId,row,title,stage,label,event,when,oldWhen,place,host,stamp('present∣absent∣pending∣none'),stampText,attendanceText,reason,closedNote,records[{kind,text,at,atText,kindLabel}],members,ticket{torn,void,version}∣null,ashes,burn{play,done,burnDone()},burnOnce,contactOpen,hostWx,copyWx(),copied,copyFail,copyLabel,retryCopy(),contactClosedText,report{open(ev),on,text,onInput,count,max:120,min:4,submit(),done,busy,error,close(),label,doneText},back(),originKey,footer`；给原件的：`ritual`（票根快照槽位，同 `c.ticket.ritual` + `torn`，仅 cancelled / exited / declined 且有票）、`burn.reason`（`cancelled∣withdrawn∣reschedule-declined`）、`hasStamp`（散场）、`stampData{event{id,city,pack,title,en,wd,date,dateNum,time,loc,host,capacity,seats,version}, mode:'pending∣present∣absent', history[{id,event,attendance,endedAt}]}`（V27 08 散场场景 `JURitual.stamp` 的 data）。取消 / 退出 / 拒绝改期的票：第一次真实打开 `burn.play=true`（控制器 `burnMs` 兜底，仪式 `onDone` 先到先算），之后 `ashes`（记忆在 `ui.burned`）；索引跳转直接落在灰烬态。

## 7. 管理 H1（`c.manage`，栈顶 manage）
`on, missing, eventId, intent('review∣attendance∣manage'), m（JU.derive.manage 原样）, event, head{title,status,life,meta,when,oldWhen,place,formedLine,progress{confirmed,cap,reserved,available,seats[],text,more,attendance{rec,total,present,absent,text,sub}∣null,hidden},cancelled,ended,formed,contactOpen,cardLink,dimmed}, order[]（按 intent 的区块顺序，`arrange` 永远最后）, show{apps,replies,members,queue,leaves,attendance,arrange}, apps, roster, queue, leaves, replies, attendance, arrange, card{open(ev),label}, error, back(), backLabel('返回我的局'), focus, originKey`。
每个区块共有：`key, on（显示条件）, order（在 order[] 里的位置，供 CSS order）, open, cls('is-open∣is-closed' + ' is-focus'), toggle()`。显示条件：申请 = 有待审或本次已处理（未取消未散场）；改期答复 = 有 proposal 且 open；成员 = 未散场（已取消时 void）；候补 = waiting>0；离开记录 = N>0（默认收起）；出席 = 已散场且有已确认成员。
- `apps{title,titleHandled,sub,count,handled,help,empty,rows[{…app 字段,nickText('未填称呼'),initial,verifiedLabel,agoText,note,busy,error,result,resultText,tone,approve(ev),reject(ev),retry()}]}`：处理中 ≥ processMs → `invited` / `rejected` 效果 → 结果原位（行不移位；本次处理过的行留在列表）。
- `roster{title,line,rows[{…member,name('你'),initial,stateText,ticketText,tone,left{text,ratio,tone,on},showWx,wx,wxText,copyWx(),copied,copyFail,copyLabel,retryCopy(),contactText('已自报加微信')}],openSeats,openText,openRows[{key,text:'等人'}],voidNote}`。
- `queue{title,sub,count,rows[{no,nick,agoText,initial}],help}`、`leaves{title,count,rows[{nick,text,at,atText}]}`、`replies{title,sub,answered,total,oldWhen,newWhen,rows[{id,name,answerText,tone,ticketLine}],help}`。
- `attendance{title,sub,rec,total,present,absent,undecided,rows[{id,name,initial,value,label,recorded,editing,choosing,stampFresh,stamp,trail[],showTrail,error,isNext,set(v),setPresent(),setAbsent(),setPending(),correct(),isPresent,isAbsent,isPending,showWx,wx,wxText,copyWx(),copied,copyFail,copyLabel,retryCopy()}],help,contactLine,focusNext,allRecorded,doneText}`：点选**当帧写入**（无处理中）→ `attended` 效果 → `stampFresh` 2.5s（`holdKey`）→ 焦点移到下一位（控制器在下一次渲染后 focus `[data-rid=next] [data-act="attend-present"]`，不自动翻页）；`correct()` 重开三段；轨迹 ≥2 条显示。
- `arrange{title,canReschedule,canEnd,canCancel,notFormedHint,endHint,unansweredHint,reschedule(ev),end(ev),cancel(ev),card(ev),rescheduleLabel/Note,endLabel/Note,cancelLabel/Note,showReopen,reopenInert:true,reopenLabel,reopenNote,reopen()}`。
进入 manage 时控制器先 `settleNow()`（每次渲染先结算到期），`params.focus` 区块在渲染后滚到可见。记为散场成功后同一栈条目的 `intent` 改为 `attendance`（`setTopParams`，不重放进入动画）。

## 8. 草稿摘要 `c.draft`
栈顶 draft：`on, draftId, row（= 草稿行）, title, whenText, placeText, missingText, ready, agoText, sourceText, capacity, continueInert:true, back(), del(ev)（删除并返回，撤销条在列表）`；草稿已删 → `missing:true`。

## 9. 弹层 `c.sheet`
`on, kind, sub, eventId, cls('kind-x sub-y'), title, body, irreversible, identity{title,when,place,pack}, affected[{label,n}], affectedTitle, fields, canOk, okLabel, cancelLabel, ok(), cancel(), busy, error, done, danger, hint, card, text, onInput, count, max, min, doneTitle, doneBody, focusRef, onKeyDown`。
| kind | 打开方式 | ok() | 备注 |
|---|---|---|---|
| `confirm` sub `withdraw∣release∣exit∣decline∣leaveQueue` | 行 / 详情 / 票根的次要动作，`ctl.openConfirm(sub,id,ev)` | 处理中 → `withdrawApplication∣releaseReservation∣exitEvent∣declineReschedule∣leaveWaitlist` → 关闭 → 发生处显示 `result` | 文案 `JU.COPY.<sub>`；exit / decline `danger` |
| `reschedule` | `c.manage.arrange.reschedule(ev)` | `propose` → 关闭 → toast「已改时间 · 等 N 位成员答复」→ 答复区展开、滚到顶 | `fields{date,time,onDate,onTime,valid,same,sameHint,placeholder,oldWhen,newWhen,newText,consequence,tz:'纽约时间',minStep:15}`；`canOk` = 日期时间有效 ∧ ≠ 原时间 ∧ 无未答复 |
| `cancel` | `arrange.cancel(ev)` | `cancel` → 关闭 → `cancelled` 效果（概念：抽色 + 余烬） | `affected` 0 项省略，`irreversible` 条 |
| `end` | `arrange.end(ev)` | `end` → 关闭 → intent attendance、出席区展开 | 不可散场时 `hint` |
| `card` | `c.manage.card.open(ev)` | 关闭 | `card{title,en,pack,when,place,host,statusLabel,caption,note}` |
| `record` | `c.history.report.open(ev)` | `addRecord` → `done` → 「已受理」 | `text/onInput/count`，< 4 字拒绝 |
| `contact` | `c.ticket.contact.openSheet(ev)` | 关闭 | 可选 |
焦点：打开后进入弹层根（`ref="{{c.sheet.focusRef}}"`，优先 `[data-autofocus]`，否则第一个可聚焦元素）；`onKeyDown` 绑在覆盖层或对话框根：Tab 在弹层内循环、Esc = cancel；关闭后焦点回到触发元素（打开时的 `ev.currentTarget`）。处理中不能关闭（`cancel()` 无效）。

## 10. 效果与仪式（`this.act` → `c.fx` → `onEffect`）
顺序永远是：① 引擎写数据（`setState({data})`）② `ui.fx = {…effect, seq, at}` ③ `onEffect(fx)`。失败（`type:'error'`）不发效果、不播动画。`replay`（面板「重播上一动效」）= 用同一个 effect（加 `replay:true`）再调一次 `onEffect`；导航的重播 = 返回再进入。
| type | 载荷 | 何时 |
|---|---|---|
| `confirmed` | `formed, eventId` | 阅读确认成功；随后 `formed`（`eventId`）单独再发一次用于打印 |
| `printed` | `key` | 出票结束（仪式或 printMs）；不登记重播 |
| `torn` | `eventId, reply` | 撕票 / 接受改期（新票撕下） |
| `contacted` | `eventId` | 已加微信 |
| `released / withdrawn / queue_left` | `eventId, promoted[]` | 放弃预留 / 撤回 / 退出候补 |
| `exited` | `eventId, burn, promoted[]` | 主动退出（燃烧 C） |
| `reschedule-accepted` | `eventId, stage` | （引擎同时产生；控制器以 `torn{reply:true}` 为准） |
| `reschedule-declined` | `eventId, burn, promoted[]` | 拒绝改期（燃烧 B） |
| `invited` | `eventId, appId, nick, slot` | 审核通过（**v0 写的 `approved`，引擎实际是 `invited`**） |
| `rejected` | `eventId, appId, nick` | 谢绝 |
| `proposed` | `eventId, asked, oldIso, newIso` | 改时间（日期重印） |
| `cancelled` | `eventId, affected, burn` | 取消（抽色 + 余烬） |
| `ended` | `eventId, toRecord` | 记为散场 |
| `attended` | `eventId, memberId, value, correction` | 出席记录 / 更正（盖章） |
| `draft-deleted / draft-restored / undo-expired` | `draftId, title, index` | 草稿 |
| `record-added` | `eventId` | 局内记录 |
| `expired` | `side:'joined'∣'host', eventId, name∣nick, memberId, slot, other, at` | 时钟结算：预留到期 |
| `queue-invited / queue-turn / queue-moved` | `side, eventId, name∣nick, slot, deadline, from, pos` | 时钟结算 / 释放席位后的候补顺位 |
`promoted[]` 里的效果也会逐个 `onEffect`。

### 10.1 共享原件接入（`window.JURitual.*`、`JU.shared.skins`；C00 的调用点 = 参考写法）
原件由概念在自己的 DOM 上调用（DOM 契约 `my-r2/src/shared/rituals/ticket.html`：258 宽、主票 268、副券 84，不缩放；`data-print-stage / data-paper / data-paper-shadow / data-paper-shell / data-paper-surface / data-tear / data-burn / data-raster / data-wet / data-bend / data-slot` 原样保留）。控制器只给数据与写入点，**数据先写、动画后播、失败不播**：
| 仪式 | C00 调用点 | 控制器一侧 |
|---|---|---|
| 出票 `JURitual.print(stage, c.ticket.ritual, {final:'ready', tear:{onDetach,onDone}})` | `_mountTicket`：票面 DOM 出现且 `c.ticket.state==='printing'` 时；promise 落定 → `c.ticket.printed()`（`!ok` 时 toast `r.message`，流程仍继续）；已印过的票（跳转 / 再进入）走 `_settleTicket`（`fillTicket` + 纸直接落定 + ready 态挂 `JURitual.tear.mount`，torn 态 `measureTicket(stage,true)`） | 有 `JURitual.print` 时不再武装 `printMs` 兜底计时器；`ui.ticket.printed[key]` 由 `printed()` 写 |
| 撕 `JURitual.tear`（print 内部挂好，`stage.querySelector('[data-tear]').__juritual`） | `onDetach: () => this.tearCommit()`（同步布尔）、`onDone: () => _uiIn('ticket',{contactOpen:true})`；handle 交给 `registerTear(h)`；手势在 rig 的抓手层（`[data-tear] [role=button]`，拖过 SNAP .5 自动撕完；Enter / Space 同 `trigger()`）；按钮 `data-act="tear-now"` / `accept` → `c.ticket.tear.tearNow()` → `rig.trigger()` | `tearCommit()` 写 `tearTicket` / `acceptReschedule`，失败返回 false（副券回位 + 原件错误行「未能保存，请重新撕下副券」），成功发 `torn` |
| 联系 `JURitual.contact(section, {host, account, added}, {})` | 票面出现后 `_contact()` 创建；`c.ticket.contact.on` 变化 → `reveal()` / `hide()`（原件 300 / 850ms）；原件的复制按钮改接 `c.ticket.contact.copyWith(() => h.copy())`，页脚 `[data-contact-action]` 改接 `markContacted()`；效果 `contacted` 到达后才 `h.add()`（原件把主按钮涂成「待赴约」） | `copyVia` / `markContacted` |
| 燃烧 `JURitual.burn(stage, {reason}, {onDone})` | 票根面：`c.ticket.result.burning` 为真时一次（reason = `result.reason`），`onDone → c.ticket.result.burnDone()`；历史：首次真实打开 cancelled / exited / declined 的票（`c.history.burn.play`），`onDone → c.history.burn.burnDone()`，之后 `ashes`（舞台 `void`） | 有 `JURitual.burn` 时不武装 `burnMs` 兜底；`burned[eventId]` 记忆 |
| 出席章 `JURitual.stamp(host, c.history.stampData, {adapter:'v27', active})` | 历史 · 散场的 `.c00-t08[data-t08-scope]`（整块 520px）；引擎脚本 `assets/original/v27/*` 由 stamp.js 按页面相对路径按需加载，失败 → 普通章占位 | — |
| 环境 `JU.shared.skins.mount(envEl, c.skin, {live})` | `.ju-env` 是 `.app` 第一个孩子；`componentDidMount` mount（live = 面板实例且非预览 / 比较）、面板切环境 `setSkin`、暂停 `pause` / `resume`、卸载 `unmount` | `c.skin`、`review.paused` |
重播（面板「重播上一动效」）：出票 `JURitual.print.reset(stage)` 后再 print；撕 `h.reset(); h.enable(true); h.trigger()`（`tearCommit` 对已撕的票返回 true 不再写）；燃烧 `JURitual.burn.reset(stage)` → 重新落定 → burn；出席章 `h.replay()`。**登记重播要直接赋 `this.lastMotion = {name, fn}`**——`this.motion(name, fn)` 会立刻执行 fn（见 §14）。

## 11. 其它
`c.toast{on,text,kind,cls:'k-ok∣k-error∣k-info'}`（2600ms / 错误 3600ms，一次一条）、`c.copy(text, key, okText)` / `this.copy(...)`（真实 `navigator.clipboard.writeText`；只有 resolve 才给成功；失败或面板武装 → toast「未能复制，长按手动复制」+ `c.copyState(key){copied,failed,text,label,retry()}` 8s）、`c.say(text,kind)`、`c.inert(ev)`（范围外入口统一提示）、`c.rootNav[{k,label,on,inert,cls,go}]`（找局 / 开局 / 设置 inert，我的局 on）、`c.skin`（`cotton∣halo∣sunset`，面板切换，概念写 `data-skin`）、`c.ritual{print,tear,contact,burn,stamp,skins}`（共享模块是否在场；没有时控制器的 printMs / burnMs 兜底计时器接管，概念画占位）、`c.rm`、`c.kb`、`c.safe`、`c.zoom`、`c.fx`、`c.fail{armed,copyArmed}`、`c.clock{now,nowText,offsetMin,demoNote,next}`、`c.rules`、`c.COPY`、`c.surfaceTitle`。
时钟：倒计时逐秒 `holdKey('tick',1000)` **只在有 deadline 的行可见时运行**（列表当前区有预留行 / 详情·阅读·候补面的该局有预留 / 管理面有已预留成员），每秒 `JU.dueCount` > 0 才 `settleNow()`；面板 +5 分钟 / +1 小时 / 到最近到期 / +24 小时 / 回到演示时刻 → `advanceClock` → `settleNow` → 效果逐个到达，概念只画变化。

## 12. 索引映射 `ctlJump(e, data)`
50 条 `JU.INDEX` 全部可达，跳转后栈完整（返回可用），**同一帧应用**（`jumpTo` → 新数据集 + `ctlJump` 一次渲染，无 home 闪现；概念若覆盖 `applyJump` 则仍延迟 30ms）。映射：列表条目 → role + section；`detail` → `home>detail`；`ticket` → `home>ticket`（本版记为已印，撕票可直接操作）；`contact` → ticket + 联系层打开；`reschedule-reply` → `home>reply`（新票已印）；`withdraw` → ticket + 确认层（按 stage：pending=withdraw、invited=release、reschedule=decline、waitlist=leaveQueue、其余 exit；索引里的 theater 是 going → `exit`）；`history` → `home>history` 且该票记为已烧（静态灰烬；燃烧只在真实首次打开播放）；`manage` tab → intent（applications → review、attendance → attendance、其余 manage）+ 区块展开与聚焦（contact → 成员区，leaves → 展开）+ `reschedule / cancel / end / card` 直接打开对应 sheet；`draft` → `home>draft`。

## 13. 与 v0 的差异
1. 效果名以引擎为准：审核通过是 `invited`（非 `approved`）；确认入局是 `confirmed` + 单独的 `formed`；新增 `printed`、`expired`、`queue-invited`、`queue-turn`、`queue-moved`、`record-added`，效果带 `seq/at`，重播带 `replay:true`。
2. `c.read`、`c.waitlist` 是顶层对象（v0 写在 `c.detail` 下）；`c.reply` = `c.ticket.reply`。
3. 行动作带 `key`（`primary.key / secondary.key / secondaryKey`）供 `data-act` 绑定；`c.manage.<sec>.order/show/toggle`；`c.nav.landKey` / `row.landing`。
4. 弹层关闭选择器是 `data-act="close"`（`cancel` 留给「取消这局」）；弹层 primary 是 `data-act="ok"`；撕票手势元素 `data-act="tear"`（需 `tabindex="0"`，Enter / Space），按钮等价 `data-act="tear-now"`（reply 面为 `accept`）；行主动作 `data-act="cta"`。
5. 草稿删除：数据立刻写，`ghost` 行留 `deleteMs` 供收起；`undo.left` 秒数。
6. `copy(text, key, okText)`：第三参数（局主侧「微信号已复制」）。
7. 退出候补走确认层（v0 要求；`state-inventory` §D 说原型无二次确认——见汇报的语义矛盾）。
8. 不做本机持久化（Phase B 的 `JUS.store`）：契约要求各套运行时数据隔离、评审工具要求确定性状态；每次打开都是数据集初态。
9. 新增可覆盖 `printMs / burnMs / deleteMs / tearSpec / tearThreshold`（接了原件后只作兜底）。
10. 原件接入后的选择器：`data-act="tear"` 标在副券宿主 `[data-tear]` 上，手势 / 键盘的真实目标是 rig 生成的抓手层 `[data-tear] [role="button"]`（tabindex=0）；联系层按原件 DOM（`[data-contact-reveal]` 内 `.ju-contact-copy[data-act=copy]`，页脚 `[data-contact-action][data-act=contacted]`）；复制失败的重试按钮在 `.c00-copyfail [data-act=retry]`。
11. 新增 `tearCommit() / registerTear(h) / copyVia(run) / c.ticket.ritual / c.history.ritual / c.history.stampData / c.history.burn.reason / c.ticket.result.reason / c.ritual`；`JU.hasRitual(name)`。

## 14. 坑（已验证的）
- **Preact 的 setState 在渲染时才落地**：`setState` 之后在同一 tick 里再读 `this.state` 得到的是旧值。控制器已全部改用返回的 `res.data` / 函数式 setState（`closeSheet` 曾因此关不掉、出席「下一位」曾算到刚记录的人、同步 `ctlJump` 曾读到上一个变体）。概念的 `onEffect` 里同样只用 `fx` 载荷，不读 `this.state.data`。
- **收拢页头不能改变滚动容器高度**：页头缩短 → 容器变高 → 页底 `scrollTop` 被重新钳制 → `--hc` 变化 → 页头再变……肉眼可见的抖动（Playwright 报 "element is not stable"）。用恒定高度的页头（标题保留 30px 行框、辅助行只变透明度）或覆盖式页头（绝对定位 + 容器 padding-top）。
- 行内按钮必须带 `data-act`，否则行的 `open` 分不清内部点击（控制器以 `[data-act]` 判断）。
- 倒计时进度条若用 `transition: width 900ms`，它每秒重启、在 `getAnimations()` 里永远 running；减少动态靠 `.app.rm *` 把它压到 1ms（rm-check 按此统计）。
- 跳转一次渲染中位 40ms、峰值 ~160ms（50 条）；评审脚本每次跳转仍应等 ≥ 300ms。
- `file://` 页面拿不到剪贴板权限；回归测试用本机 http 服务 + `grantPermissions`。交付文件里真实点击（用户手势）即可写入，失败路径已处理。
- Shadow DOM 里查焦点用 `root.getRootNode().activeElement`；弹层 `ref` 放对话框根、`onKeyDown` 放覆盖层。
- 减少动态下 `after()` 为 0：出票 / 燃烧瞬间到终态，`hold`（处理中、toast、撤销、tick）不压缩。
- `go('read')` 会把 `detail` 插在下层：详情必须在 `is-under` 时也能渲染（`c.detail.on` 在 read 为栈顶时同样为 true）。
- `c.nav.fromStyle` 只在点击元素有 `[data-origin]` 祖先时非空；为空时概念走普通过渡。
- **`this.motion(name, fn)` 会立刻执行 fn**（评审 mixin：运行并登记）。给仪式登记重播只能 `this.lastMotion = {name, fn}`；C00 曾因此在出票一开始就 reset + 重印，第一个 print promise 被 superseded、票面瞬间变「已印」。
- **引擎拥有的 DOM 不能被模板绑定**：`data-state / data-print`、舞台 `style`（`--ju-paper-height`）、纸的内联样式、`[data-tear]` / `[data-burn]` 里的画布、联系层的 `data-revealed` 与按钮文案都由原件写；模板里只绑静态属性（Preact 只在 vnode 值变化时才写 DOM）与同一份 `data-slot` 文字。`[data-tear]` / `[data-burn]` 不放 vnode 子节点，引擎追加的节点 Preact 不会动。
- **无头环境的 WebGL**：headless Chromium 走 SwiftShader（`ANGLE / Vulkan / SwiftShader`，WebGL1+2 可用但慢）。live 的 Cotton Candy（three.js 水面）把整页压到 ≈7 rAF/s，所有 rAF 驱动的原件都随之爬行（键盘撕票 357ms → 2s，坠落 1080ms 在 5s 内完不成）；引擎暂停（`JU.shared.skins.pause`）后回到 60 fps。回归与帧序列采集都先 pause 环境引擎（= 面板「暂停」），三环境首屏单独 live 截。真机 / 有 GPU 的浏览器无此问题。出票的 32×128 网格在 SwiftShader 上 ≈2.5–3.5s 完成（原件 2300ms）。
- `JURitual.stamp` 的引擎脚本（`assets/original/v27/ju-paper-film / ju-envelope / ju-stamp / ju-tickets2.js`）不在 bundle 里，stamp.js 用 `document.currentScript` 的目录（bundle 内为空 → 页面相对路径）按需加载：私有构建靠 `.build/assets → my-r2/src/shared/rituals/assets` 软链；交付单文件里会失败 → C00 退回普通章并显示原因（需要构建把四个引擎并入，或 stamp.js 内联它们）。字体同理（`assets/fonts/fonts.css`，采集时用改写了 url 的副本作 `JU_FONTS_CSS`）。 **（已解决，2026-10-23：`build.js` 的 `addRitualOriginals()` 按 `rituals/bundle.json` 把四个原件逐字内联在 stamp.js 之前，私有构建与交付单文件都不再按路径加载；08 场景在单文件里可用。）**
- 08 散场引擎没有「已盖章的静态态」：传 `mode` 就播一次盖章；再次进入历史会重播（规格「进入历史不重放盖章」需要引擎加 settled 选项，已列给主负责人）。
- 原件读 `prefers-reduced-motion` 或 `html[data-ju-reduced]`（页面级）：C00 只在面板实例把 `review.rm` 镜像到它，比较视图里多实例会互相影响。
- 关键帧滑杆只能 seek 燃烧（`handle.seek`）；出票 / 撕 / 盖章是 rAF 引擎，用「重播」看。
- `file://` 下 `navigator.clipboard.writeText` 被拒：capture 的联系流程落在失败分支（原件「复制失败，请长按账号复制」+ 控制器 toast），成功路径由回归在 http 上证明。

## 15. 已验证（核心 1 · 2026-10-22）
构建：`node <scratchpad>/core1/build-c00.js` → `/home/user/JU/.build/C00.html`（外壳 294 KB，含 preact + runtime + C00 源 256 KB；`src/build.js` 由核心 2 移植，标记同 contract §2）。
| 检查 | 结果 |
|---|---|
| `my-r2/tools/test/ctl-regress.cjs`（Playwright / chromium，真实点击；原件接入后 **79/79 通过**，环境引擎 pause） | 原 74 项 +5：出票由 `JURitual.print` 真实完成（≈2.3s+）后才有撕票按钮、抓手层可聚焦；Enter 在抓手层撕开 → 写入在 detach 时、坠落后联系层 / 850ms 主按钮由原件出现；改期新票带原定行 + 时间已改章，接受 = rig.trigger；拒绝改期后舞台 `burning` 且 `[data-burn] canvas` 在跑；手势：拖 60px 回位不写、拖 200px 自动撕完先写后落；减少动态下 JuPrint 1ms、直接 detach、联系层 0ms。原 74 项：50 条 jump 全部到达目标 surface、`renderVals()` 无错、栈深 ≥2、contact 层 / sheet 到位、console 0 错误、50 个画面文本无禁用词；九条流程：详情返回（--hc 写入、起点 key、滚动恢复 120px、落点 landKey）、阅读确认（滚到底才可确认 → 武装失败原位重试 → 成局 → 查看票根 → 出票中无按钮 → 2.3s 后已印）、撕票（Enter 等价 → 联系层 → 真实剪贴板 `readText()==='ameng.nyc'` → 已加微信 → 待赴约）、改期接受（撕新票 → going + toast）/ 拒绝（确认层 → declined → 燃烧结果 → 查看退出结果到 history）、候补退出（门口 `L**` → 退出 → 回执）、审核通过 / 谢绝（待审 −1 · 预留 +1 · 成员 +1 · 原位结果；谢绝不动席位、头部 status 与徽标重算）、改时间（同时间禁用 → 新时间 → 答复区 4 人 · 时间重印 · toast）、取消（受影响名单 → 已取消 · void 成员 · 历史归位）、散场出席更正（intent attendance · 当帧写入 · 新鲜章 · 焦点下一位 · 更正留轨迹）、草稿删除撤销（ghost → 空态 + 撤销条 → 原槽位恢复） |
| 时钟 | tick 只在有预留行时运行、每秒变化、切到历史停止；+65min 花卷到期 → Leon 获邀 → 我从第 2 位到第 1 位；+5h05 我的 brunch 预留到期 → 未成行 00:00:00；到最近到期 → 轮到我（invited_queue）；局主侧 Leon「预留到期」入离开记录、候补按顺位获邀 |
| 复制失败分支 | 武装 → toast「未能复制，长按手动复制」+ 手动提示 + 重试，标志消费；重试真实写入成功 |
| 撕票手势 | 拖半程回弹且不写数据；拖过阈值写入后落券；键盘 Enter 等价 |
| 弹层焦点 | 打开进入对话框首控件、Tab 循环、Esc 关闭并回到触发元素 |
| 减少动态（`reducedMotion:'reduce'`） | `rmSys=true`；阅读→确认→出票（瞬印）→撕→联系层完整；无 >1ms 动画在跑；取消到稳定终态 |
| `settings-r2/tools/widths.cjs C00`（360/375/390/430 × 8 态） | overflow []，字号随宽度不变，`.app` 无 transform，minFont 12 |
| 头less 冒烟 `<scratchpad>/core1/ctl-smoke.cjs` | 通过（引擎 / 视图模型 / 50 跳 / 禁用词） |
| 帧序列（`my-r2/tools/capture.cjs`，`my-r2/evidence/C00/<flow>/f*.jpg + sheet.jpg`，均 Read 看过） | `print` 10 帧（纸从出纸口推出到落定）· `tear` 28 帧（拖 60px 回位、拖 200px 撕开、坠落、联系层、已加微信）· `tear-keyboard` 11 帧（Enter 同一路径）· `contact` 6 帧（复制在 file:// 下走失败分支、已加微信 → 待赴约）· `burn` 13 帧（主动退出 → C 变体侧向炭边落灰 → 空舞台 + 已退出这局）· `burn-declined` 11 帧（新票 → 去不了了 → B 多点烧穿）· `stamp` 11 帧（08 场景：章落下、出席印、归档）· `skins` 8 帧（cotton / halo / sunset live）· `reissue` 9 帧（新票打印：原定划线 + 时间已改章） |
禁用词（扣分 / 信用分 / 处罚 / 等级 / 剩余次数）：核心四文件 + C00 = 0（数据里两句「不会自动处罚」改为「不会自动带来任何后果」，语义不变）。

### 主负责人修正（2026-10-23 · C01 复核发现）
- **返回时不再双重滚动**：`back()` 先把下层页面的滚动恢复到记忆位置（`_restoreNow`），再测量起点；起点行只有在可见部分 < 50% 时才滚进视口（`reveal(el, false, {soft:true, memoKey})`），并同步更新记忆，结算时的恢复不会再把列表拉回原位。回归：`my-r2/tools/test/reveal-regress.cjs`（旧控制器：646 → 391 跳动；新控制器：391 恒定）。
- **区块聚焦不再遮住页头**：`reveal(sec, true)` 尊重区块自身的 CSS `scroll-margin-top`（默认 8px）并加上滚动容器内 sticky `[data-header]` 的高度；区块已在可视区上部 60% 内时不滚动。方案若需要更大的留白，给 `[data-section]` 写 `scroll-margin-top`。
- **首字**：`JU.fmt.initial(name)`——阿蒋 → 蒋、小满 → 满、老杨 → 杨（前缀 阿 / 小 / 老 / 大 不算名字），拉丁名取首字母大写；控制器里申请人、成员、候补、出席的 `initial` 都用它（C02 复核发现：原先一律取第一个字，阿蒋 / 阿檬 / 阿宽都成了「阿」）。
- **复制只提示一次**：经 `copyVia`（共享联系模块自带「✓ 已复制」）复制成功时，控制器不再另弹「已复制」toast；失败仍弹「未能复制，长按手动复制」并给重试。
- **replace 离场页不再空帧**：`replace()`（阅读 → 票根、票根 ⇄ 改期新票等）时，离场的那一页沿用它最后一次渲染的视图模型（同一 eventId / draftId），带 `leaving:true`（C07 复核发现）。
- **共享 CSS**：`v27/skins-r9.css` 删去 R9 页面外壳规则（`.review-*`、`.device`、`.page`、`.ju-phone{width:390px;height:844px}`）——它曾把所有方案的手机钉死在 390×844、覆盖面板尺寸预设；`rituals/ticket.css` 的局名加 `text-wrap:balance`（唯一偏离原件处：只改折行，不改字号字重间距）。
- **widths.cjs**：仪式原件刻意超宽的画布（撕票 434 = 258 + 2×88、燃烧 pad 74、出票画布）不计入横向溢出。

### 主负责人修正（2026-10-23 · C05 复核发现）
- **票根局名不再以「·」起行**：`text-wrap:balance` 会挑「 · 」前的空格折行，得到「公园慢跑 3K / · 跑完喝咖啡」。控制器交给 `JURitual.fillTicket` 的 `ritual.title` 现在经 `JU.fmt.keepDot`（点前换成不换行空格、点后保留普通空格），折行变成「公园慢跑 3K · / 跑完喝咖啡」（C00 实测两行）。方案自己的替换可以删掉，留着也无害（已替换过的串不再匹配）。
- **列表局名同样的问题**（长标题两行省略时「·」可能起行）：组装交付时会对视图模型里所有局名统一套 `keepDot`。各方案的脚本按文字找元素时请用空白归一的匹配（Playwright `text=` / `hasText` 已归一；自写 `textContent.includes('… · …')` 会因 U+00A0 失配）。
- **widths.cjs 的最小字号**不再计入 V27 局卡原件的小字：自身或祖先的行内 `font-size` 用 `cqw` 的文字（局卡模板逐字复制，随 4:5 容器缩放，原件就带 5–8px 标注）不进 minFont；方案自己的文字仍须 ≥ 12px。
- **出票时机（建议，非强制）**：无 GPU 的无头环境里 `JURitual.print` 会占住主线程约 3s；进入票根页时等导航停稳（`nav.phase === 'idle'`）再调用 `print`，入场动画才不被卡住（C05 做法）。出票前的空位要有东西：出纸口 / 票位轮廓先在，不能只剩一行「出票中」。

### 主负责人修正（2026-10-23 · C08 复核发现）
- **返回时的测量可以不受 transform 影响（选用）**：`back()` 量原点行时，若下层页面此刻还带着 transform（整页被推出屏、色带被移走、缩放），视觉测量会把行看成在屏外而滚动列表（C08：约 640px）。给滚动容器（或其祖先）加 `data-measure="layout"`，控制器就改用布局坐标（offset 链，忽略 transform 与滚动）判断可见度并给出返回落点矩形——也就是页面停稳后的位置。没有加标记的方案行为不变。回归：`reveal-regress.cjs` 新增三项（无标记时复现误滚 / 有标记时列表不动 / 落点矩形为未变换位置），7/7。
- **局主行的状态键**：`c.hosted` 每行的 `key` 是活动 id（列表键），derive 原来的状态键现在保留在 `stateKey`（`cancelled∣ended∣review∣reschedule∣formed∣recruit`）。
- **退出类确认层按 V27 的职责区分**（V27 原文核对：放弃预留 `保留位置` 用蓝色主 CTA、`确认退出` 红字红描边；退出已确认的局 `继续赴约` 用蓝色主 CTA；撤回报名 `再想想` 玻璃描边 + `撤回报名` 墨色胶囊，没有蓝 CTA）：
  - `danger`：`release∣exit∣decline` 为真 → 确认键用 V27 危险构造（`cta.css .ju-v27-danger`）。原先 `release` 为假，「确认退出」被画成蓝色主 CTA，与 V27 相反。
  - `keepPrimary`：`release∣exit∣decline` 为真 → **取消 / 保留键用主 CTA 原构造**（V27 `q5StayStyle = blueCta`），这一层的蓝色只给「留下」。
  - `okTone`：`withdraw∣leaveQueue` 为 `'ink'`（V27 撤回报名的墨色胶囊，无蓝 CTA），其余 `'danger'`。
  各方案在阶段 2 按这三个字段改确认层模板。

### 主负责人修正（2026-10-23 · C02 阶段 2 汇报）
- **草稿摘要页「删除草稿」不返回**：`c.draft` 原先把草稿行自带的 `del`（列表里的删除 + 撤销条）合并在页面字段之后，覆盖了页面的 `del`（删除并返回）。现在页面字段在后：`c.draft.del(ev)` = 删除并返回；行自己的删除仍可用 `c.draft.rowDel`。方案里「先 deleteDraft 再 back」的绕法可以删掉。
- **widths.cjs** 不再把 08 散场场景（`[data-t08-scope]` 内：舞台左右各外扩 20px、画布再外扩 24px，原件如此）算作横向溢出。
- **kb-check.cjs** 不再固定等 700ms：打开弹层、升起键盘后等到有限时长的动画全部结束（无限循环的转圈 / live 环境不计，最多 4s）再测，负载高时不再误报入场途中的位置。
- **重初始化的原件**（出票准备约 0.75s；08 场景、燃烧引擎的初始化）在无 GPU 环境会占住主线程：一律等导航停稳再启动（同 C05 的出票做法）。

### 主负责人修正（2026-10-23 · C04 / C06 阶段 1 汇报）
- **已撕的票从首页点进去**：原先 `printed{}` 只记本次会话，已撕的票又不会重新出票，状态停在 `fresh`、联系层不出现（只有索引跳转时正常）。现在已撕（非改期答复）的票视为已印：进入即 `state:'torn'`，可直接显示已撕原件与联系层。方案里「自己铺已撕原件 + 调 printed() / contact.open()」的绕法可以删掉。
- **`home()` 只深一层时等于 `back()`**：有 exit 阶段、走 reveal 与落点（原地展开的方案可以折回）；更深时仍直接回首页。
- **退场中的页沿用最后的视图模型**：`back()` 的 exit 阶段里栈顶页（同一 eventId / draftId）用离场前最后一次的视图模型并带 `leaving:true`——`_leaveApply` 先清掉的结果行 / 联系层状态不会在退场途中换句。
- **`data-restore="manual"`**：滚动容器带这个属性时，控制器的返回恢复（`_restoreNow` 与结算时恢复）不动它，由方案自己摆位（原地展开的方案用它代替「展开时给 data-scroller 改名」）。
- **`jumpTo` / `reset` 把所有 `[data-scroller]` 归零并清空滚动记忆**（不再需要方案自己包 `_fresh`）。
- **回执不重复**：标题已含字段时（「位置已预留」+「已预留」、「已退出候补」+「已退出」）字段为空。
- **局主自己那行**的 `stateText` 改为「局主」（姓名列已是「你」）。
- **出席说明**去掉禁用词：「…不等于故意缺席，也不会自动带来任何后果；可随时更正，更正会留下记录。」
- **复制失败只剩一条信息**：经共享联系模块复制时，失败只由原件那一行「复制失败，请长按账号复制」说（方案让这行 `role="alert"`），控制器不再弹 toast；`copyFail / retryCopy` 仍在，重试做成这一行旁的动作，不要再写第三句。联系模块 `destroy()` 现在会复位显示状态（同一段 DOM 被下一张票复用时不再带着「已加微信」）。
- **「已加微信」处理中**：用 `c.ticket.contact.ctaLabel / ctaDisabled`（写入期间为「处理中…」并禁用），不要直接用原件按钮的同步 add()。
- **票根局名**加 `word-break:keep-all`：中文词不拆（「手冲咖啡品 / 鉴」→「手冲咖啡品鉴 ·」/「三款豆子」）；没有空格的超长局名仍按原件的 `overflow-wrap:anywhere` 折行。
- **widths.cjs** 不再把票根原件的「时间已改 / 已取消」章（`.ju-ticket-mark`，10–11px）计入最小字号。
- 回归：新增 `my-r2/tools/test/shared-regress.cjs`（已撕票入口、home 一层退场、退场冻结视图模型、跳转归零、回执去重）。

### 主负责人修正（2026-10-23 · C10 阶段 1 汇报）
- **联系模块 `labels:false`**：`JURitual.contact(host, data, { labels: false, … })` 时原件不写动作按钮与说明行的文案（它用 `textContent` 改写，会顶掉 Preact 的文本节点，绑定的 `c.ticket.contact.ctaLabel` 从此不再更新），只维护 `aria-disabled` 与显示状态。方案用控制器的 `ctaLabel / ctaDisabled` 显示「已加微信 → 处理中… → 待赴约」时请传它（或像 C10 那样给原件留一个隐藏 slot）。
- **管理区块分出 `label` 与 `count`**：`c.manage.<区块>` 原有 `title`（如「申请 · 2」）不变，另加 `label`（「申请」）与 `count`（`2`、`'已答复 1/3'`、`'2/3'`；成员 / 安排为 `null`），居中或分栏排版不用再拆字符串。
- **接触表中文标签**：`_lib.cjs` 的 `tilePy` 用文泉驿正黑写标签（原先 PIL 默认字体把中文画成方块）。

### 主负责人修正（2026-10-23 · C05 阶段 2 汇报）
- 联系模块 `add()`（已加微信）时清掉原件的复制失败行——之前失败行会一直留到下一次复制。
- §14「stamp 引擎按路径加载、单文件会退回普通章」已过时：四个原件在构建时内联（见 §14 该条的补注）。

## C03 阶段 2 汇报 · 共享层修正（10-29）
- 撕票写入失败行：模板把 `[data-tear-error]` 放在票台（`[data-print-stage]`）外的上一行，`JURitual.tear` 原先只在票台内找，失败文案从未写出（除 C03 自绘一行外，九套都没有可见的撕票失败反馈）。现在先找票台内、再找票台的直接兄弟。自己另画失败行的方案（C03）请继续隐藏原行，避免两行同时出现。
- 复制：`copy(text, key, okText, inPlace)`。`inPlace` 为真时成功不弹 toast（视图里 `copyState(key).label` 已显示「已复制」），失败仍弹「未能复制，长按手动复制」。名单 / 出席 / 历史联系 / 重试四处已改为 inPlace——这几处原先 toast 与按钮文字同时变化。
- `data-hc="manual"`：每次更新后控制器会给每个 `[data-scroller]` 重写 `--hc`；自己驱动 `--hc` 的滚动容器（C03 两窗交换）加这个属性即可跳过，滚动事件照常写入。
- 历史里过期的预留：成员行原先显示「已预留 · 剩 1 小时」（j-d-expired），现在为「预留已过期」，色调为 void，无剩余时间。
- 待查（未改）：减少动态下撕开后 `measureTicket` 在 detach 当帧测高，票台多出约 84px（C03 自补测）；`jumpTo` 只把带 `data-scroller` 的元素归零——自己的滚动列表请加 `data-scroller`。
- 演示数据口径：参加者侧所有已散场的局都早于 24 小时，「+24 小时」在参加者侧没有可见变化；这条只在局主侧可演示（记入限制）。
- `_mountTicket` 建议加防御分支：`'fresh'` 与 `'printing'` 一样走出票（C02 复核：已撕票曾以 fresh 进入，票位空白；共享层已修根因，防御分支避免任何遗漏路径留空票位）。
- 切换角色 / 分区首次进入：没有存过滚动位置时，`[data-scroller="home"]` 归零（原先沿用另一角色列表的滚动量，C02 复核 m3）；shared-regress 新增一项（8/8）。
- 减少动态下撕开后票台多出约 84px（上一条「待查」）：`JURitual.tear` 落定后连续 24 帧、再于 700ms 重测票台高度（C03 / C07 各自做过同样的补测，现在共享层统一做）。探针：常规与减少动态撕开后 `--ju-paper-height` 都是 398px。
- 拒绝改期与主动退出在历史里不再同名：`declined.label` = 「拒绝改期」，回执标题同步（原先两者都是「已退出」，C07 复核 M6）。
- 已取消 / 已散场的局，名单里的预留不再显示倒计时（`leftText / leftRatio / leftTone` 为空，C07 复核 m19）。

### 主负责人修正（2026-10-29 · C05 / C08 复核与汇报）
- 名单成员行的剩余时长改为与同屏倒计时一致的口语写法 `JU.fmt.hoursLeft(ms)`：04:20:31 →「剩 4 小时多」，不足 1 小时为「剩不到 1 小时」（原先向上取整成「剩 5 小时」）。
- 文案去掉「信用」字样：未通过 = 「这次没留住 · 不影响以后报名」，撤回确认层 = 「…也不记为失约」（任务书 §09-F：不新增信用 / 等级）；约定原文里的「信用」一节是 V27 原件，未动。
- 演示数据：标题里的星期与日期对齐（周五 Livehouse、法拉盛早茶 · 周一十点、新手攀岩 · 周四晚上、周一麻将、many 的新手攀岩 · 周六场）；以星期命名的酒馆改为地名（东村小酒馆试营业、哈莱姆爵士酒馆 · 第二场）。所有变体核对过：标题中的星期与日期 0 处不一致。
- 票根联系层：「已加微信」后控制器的 `copyFail` 随原件失败行一起清掉（不再单独剩「重试」）。
- 撕开后焦点：副券抓手被原件移除时焦点不再落到 <body>，先停在票台上（`tabindex=-1`），方案可再移到复制键。
- 保留：「待定」是出席三值之一，算作已记录（任务书 §08「出席：出席 / 未出席 / 待定」）；玻璃包局卡无照片时显示原件的条纹占位与 PHOTO_0n（原件行为，记入限制）。
- 改时间 / 记为散场提交后只 reveal 目标区块（原先同时 `scrollTop('manage')`，两次滚动互相打架，C10 汇报）。
- 自动插入的父层栈项（首页直达管理时垫在下面的详情）继承来源行的 `key`：从它返回首页时仍会把那一行带回视野（C10 汇报）。
- `c.history.title` 是结果短语（如「已退出这局」），局名在 `c.history.event.title`；需要以局名作页标题的方案用后者。
- 截图工具（`_lib.cjs`）浏览器语言为 zh-CN：原生日期 / 时间控件按中文 24 小时制呈现。
- 过期预留不能确认入局：引擎 `confirmReservation` 在 stage 不是 invited / invited_queue、或预留截止已过时返回错误「预留已到期，位置已补给他人。」；阅读层在 stage 为 expired 时进入到期态（C01 复核 B1：到期后读到末尾仍能确认并直接成局出票）。shared-regress 新增一项（9/9）。
- 已撕的票（待联系 / 待赴约）从任意入口进入时联系层自动打开（`contactOpen`），原先只有 `params.contact` 才开（C04：待赴约没有入口）。
- 成员行：本人已放弃的预留 =「已放弃预留」；过期 =「预留已过期」；无截止时间的预留 =「已预留」（不再出现「剩不到 1 小时」）；三者都没有倒计时（C03 复核）。
- 弹层聚焦首字段：`focus({preventScroll:true})` 之后把各级祖先的滚动量复原（Chromium 里日期输入框仍会把外层滚走，C06 实测 `.app` 被滚到 428）。回归 79/79、9/9、7/7。
- 导航路径：`read` 默认改为 `['home', 'read']`——首页「阅读并确认」直接进阅读层，不再垫一层未访问的详情；从详情页进阅读层时详情照常保留。查看票根仍是 replace，出票后返回一次回到首页（C01 / C03 / C10 复核都把「返回落到没进过的详情」列为 major；C01 / C03 / C07 早已自行覆盖）。回归 79/79、9/9、7/7。
- 取消历史（`c.history.closedNote`）：「不计为未出席，也不影响成局信用。」→「不计为未出席，也不算主动退出。」——我们自己的文案不出现「信用」（C06 复核）；V27 原件演示页里的同句未动。
- 局主管理名单（`c.manage.roster[].left.text`）：预留成员的剩余时间改用 `fmt.hoursLeft`，写「剩 2 小时多 / 剩不到 1 小时」，与参加者侧成员行一致；进度条（ratio / tone）不变；参加者自己的截止块仍是走秒倒计时（C01 修复轮）。回归 79/79、9/9、7/7。
- 出席更正：`attend()` 在该成员处于更正态（`manage.editing[id]`）时，焦点留在被更正的人身上（`_focusAtt = memberId`），不再移到下一位、也不滚动；首次记录仍移到下一位未记录者（C03 汇报；ctl-regress 新增一条）。
- 燃烧句柄（`JURitual.burn` 返回的 handle）：原件引擎 `seek(duration)` 只置 done、不回调 onDone，之后 `start / resume` 直接返回——包装层补上落定：暂停中拖到终点不落定（评审仍在拖），`resume()` 时若已到终点即落定；未暂停直接 seek 到终点，下一帧落定。原件引擎逐字节未改（C03 汇报；shared-regress 新增一条）。
- 截图 / 评审工具（`_lib.cjs`）以 `--lang=zh-CN`、`LANG=zh_CN.UTF-8` 启动浏览器：原生日期 / 时间控件跟随浏览器语言而非页面 locale，原先渲染成 12/24/2026 · 07:30 PM，现在是 2026/12/24 · 19:30。回归 80/80、10/10、7/7。

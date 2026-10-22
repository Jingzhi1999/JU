# 共享控制器 `JU.ctl`（`my-r2/src/core/ju-ctl.js`）· 接口要求 v0（主负责人）→ 核心构建者实现后把本文改为 v1 定稿

控制器只负责**行为**：角色 / 分区、导航栈、页头收拢变量、详情与局内动作、票根仪式的触发与数据写入、管理 H1 十二个表面、草稿删除撤销、弹层与焦点、toast、复制、时钟。**不含任何标记与样式**。每套方案用自己的构图、排版、表面和运动去渲染 `this.ctlVals()`。模式与 Phase B 的 `settings-r2/src/core/jus-ctl.js` 一致（导航相位、`--hc`、`holdKey`、`ctlJump`），语义以 `spec/state-inventory.md` A–G 与 `src/core/ju-data.js` 为准。

## 用法
```js
class Component extends DCLogic {
  constructor(p) { super(p); this.reviewInit(CONCEPT); this.motionSpec = { fwd: 360, back: 300, swap: 280, role: 300 }; }
  initialState(variant) { return JU.baseState(variant); }     // 已含控制器状态（nav / ui / sheet / toast / ticket / forms）
  renderVals() { const panel = this.panelVals(); panel.show = this.props.panel !== false; const c = this.ctlVals(); return { panel, rootRef: this.rootRef, c }; }
}
JU.mixin(Component);   // 安装评审 mixin + 控制器；applyJump 默认 = ctlJump（50 条索引全部映射）
```
可覆盖：`motionSpec`、`headerRange`（默认 96px）、`processMs`（处理中可见时长，默认 360ms）、`paths`、钩子 `onEffect(effect)`（引擎效果到达时，概念登记 / 启动自己的运动）、`beforeReplay(name)`。

## 表面（surface）与栈
`home`（角色 × 分区在 state 里，不入栈）→ `detail`（参加者局内详情；含成员视图）/ `read`（阅读并确认层，detail 之上）/ `waitlist`（候补门口 + 回执）/ `ticket`（票根面：打印 / 撕 / 联系层 / 待赴约）/ `reply`（改期答复：新票）/ `history`（历史展开：票墙卡 + 出席记录 + 局内记录）/ `manage`（H1，params `{eventId, intent}`）/ `draft`（草稿摘要）。弹层不是表面，是 `c.sheet`（kind ∈ `confirm / reschedule / cancel / end / card / record / contact`）。默认路径（`ctlJump` 用）：`detail: ['home','detail']`，`read: ['home','detail','read']`，`ticket: ['home','ticket']`，`reply: ['home','reply']`，`history: ['home','history']`，`manage: ['home','manage']`，`draft: ['home','draft']`，`waitlist: ['home','waitlist']`。

`c.nav`：`on.<surface>` / `cls.<surface>`（`is-top / is-under / is-leaving` + `ph-enter / ph-in / ph-idle / ph-exit` + `dir-fwd / dir-back / dir-swap / dir-role`）/ `is.<surface>` / `back()` / `home()` / `from / fromStyle / fromKey`（起点矩形取 `ev.currentTarget.closest('[data-origin]')`，返回时落回同 key 的元素并写 `--fx-*`）/ `cur / prev / depth / phase / dir / params / rootCls`；`onScroll` 绑在每个 `[data-scroller]` 上写 `--hc`（0→1）到滚动容器、`[data-surface]` 祖先与其 `[data-header]`，返回时恢复滚动位置；`go()` 忽略栈顶相同的重复推入；`back()` 在动画中可连续调用。

## 角色与分区
`c.role`（`joined | hosted`）、`c.setRole(k)`、`c.roleTabs[{k,label,on,badge,go}]`；`c.section`（`current | history | drafts`）、`c.setSection(k)`、`c.sectionTabs[{k,label,count,on,go}]`（局主多一个 `drafts`）；各角色记忆分区与滚动；切换写 `dir-role` / `dir-swap` 相位供运动。

## 列表视图模型
- `c.joined`：`groups.{act,soon,wait}` 与 `current`（每行：`id, stage, label, need, cta, detailTitle, when{zh,md,time,wdZh,…}, place{area,hood,full}, counts, seats, host, members, deadline, left{text,ratio,tone}（读 JU.now()）, old/newWhen, attendanceText, open(ev), act(ev)（主动作：按 stage 进入 read / ticket / reply / detail）, secondary(ev)（撤回 / 去不了了 / 退出候补 → 确认层）`）；`history`（`kept` 散场 + `closed` 未成行，`monthTitle` 供分月）；`lead`、`badge`、`counts`、`empty{kind,title,body,action{label,inert:true}}`。
- `c.hosted`：`sections.{todo,resched,recruit,formed}` 与 `current`（每行：`id, key, life, label, status, cta, pending, unanswered, unrecorded, seats, counts, when, place, open(ev)（进入 manage，intent 按 key）, act(ev)`）；`drafts[{id,title,untitled,whenText,placeText,missingText,ready,agoText,sourceText,open(ev),del(ev)}]`；`history`；`undo{on,text,act(),left}`；`badge`、`counts`、`empty{…}`。
- 两角色的空态文案用 `JU.COPY.empty*`；`去找局 / 去开局 / 接着改草稿`：前两者 `inert:true`，后者 `go` 到草稿分区。

## 参加者局内
- `c.detail`（栈顶 ∈ detail/read 时 `on`）：`row`（同列表行）、`title`（`detailTitle`）、`members[{name,status,statusText,you,leftText}]`、`seats`、`countdown{text,ratio,tone,expired}`、`rules[{key,title,lines}]`（`JU.RULES`）、`primary{label,act,disabled,busy}`、`secondary{label,act}`、`openRead()`、`read{on, progress, done, onScroll, hint, confirm(), release()}`（滚到底才允许确认；写阅读回执）、`waitlist{pos,total,entered[],queue[],hint,leave()}`、`error`（失败在发生处）。
- `c.ticket`（栈顶 ticket/reply）：`face{title,time,md,wdZh,wdEn,place,meeting,host,version,stamp}`、`state ∈ fresh | printing | printed | torn | void`（本版未打印过 → 进入时 `printing`，打印由 `JU.ritual.print` 驱动，完成回调 `c.ticket.printed()`；离开不清除已印记忆）、`tear{progress, active, onDown/onMove/onUp/onCancel, tearNow()（键盘 / 按钮等价，视觉走同一撕裂动画的快进）, threshold:0.5}`、`contact{open, wx, hostName, note, copy(), copied, copyFail, retryCopy(), markContacted(), done}`、`exit(ev)`（→ 确认层）、`reply{oldWhen,newWhen,accept()（= 撕新票）,decline()（→ 确认层 → 燃烧）}`。
- `c.history`：`row`、`stamp ∈ present | absent | pending | none`、`records[]`、`report{open(), text, onInput, count, max, submit(), done}`、`burnOnce`（取消 / 退出 / 拒绝改期的票：第一次打开播放一次，之后静态灰烬；记忆在 state）。

## 管理 H1
`c.manage`（栈顶 manage）：`intent ∈ review | attendance | manage`、`head{title,status,meta,progress{confirmed,cap,reserved,available,seats[],attendance{rec,total,present,absent}}, formedLine}`、`order[]`（区块顺序按 intent）、`apps{count,handled,rows[{…,approve(ev),reject(ev),busy,result,resultText}],help,empty}`、`roster{line,rows[{…stateText,ticketText,tone,leftText,showWx,copyWx(),copied}]}`、`queue{rows,help}`、`leaves{rows,count,open,toggle()}`、`replies{answered,total,rows,help}`、`attendance{rows[{…,value,set(v),editing,correct(),trail[],stampFresh}],rec,total,help,focusNext}`、`arrange{reschedule(),end(),cancel(),canEnd,endHint,reopenInert}`、`card{open()}`、`error`。所有写入失败在发生处原位 alert；成功不出横幅（例外：改时间、复制 toast）。

## 弹层 `c.sheet`
`on, kind, title, body, irreversible, identity{title,when,place}, affected[{label,n}], fields{date,time,onDate,onTime,sameHint,consequence}, canOk, okLabel, cancelLabel, ok(), cancel(), busy, error, focusRef, onKeyDown`（Tab 循环、Esc 关闭、关闭后焦点回触发元素）。kind：`confirm`（withdraw / release / exit / decline / leaveQueue，文案 `JU.COPY.*`）、`reschedule`（C7）、`cancel`（C9）、`end`（C10）、`card`（C12）、`record`（局内记录输入：`text, onInput, count, max=120, min=4, submit`）、`contact`（可选：联系层做成弹层的方案）。

## 效果与仪式
引擎 `effect` 到达时控制器：① 写数据 ② 设置 `c.fx = {seq, type, id, …}` ③ 调用概念的 `onEffect(effect)`。类型：`formed`（成局 → 打印）、`torn`、`contacted`、`reschedule-accepted`（新票撕下）、`reschedule-declined`（燃烧 B）、`exited`（燃烧 C）、`cancelled`（局主取消：抽色 + 余烬）、`approved / rejected`（计数与席位）、`proposed`（日期重印）、`ended`（进入出席）、`attended{fresh}`（盖章）、`draft-deleted / draft-restored`、`released / withdrawn / queue_left`、`error`。仪式模块 `JU.ritual.*` 由概念在自己的 DOM 上调用（签名见 `baseline-rituals.md`），控制器保证**数据先写、动画后播**，失败不播。

## 其它
`c.toast{on,text,kind}`、`c.copy(text, key)`（真实剪贴板结果）、`c.rootNav[{k,label,on,inert,go}]`（找局 / 开局 / 设置 inert，我的局 on）、`c.skin`（`cotton | halo | sunset`，面板切换）、`c.rm`、`c.kb`、`c.safe`、`c.zoom`、`c.clock{nowText,demoNote}`、`c.fail{armed}`。

## 索引映射 `ctlJump(e)`
50 条 `JU.INDEX`：`open.surface ∈ detail | ticket | contact | reschedule-reply | withdraw | history | manage(tab) | draft`。映射：`contact` → `ticket` + `contact.open`；`reschedule-reply` → `reply`；`withdraw` → `ticket`（theater）+ `sheet confirm(exit)`；`manage` tab → `manage` intent（applications → review；attendance → attendance；其余 manage）+ 该区块展开 + `arrange` 弹层（reschedule / cancel / end / card 直接打开对应 sheet）；`draft` → `draft`。跳转后栈完整（返回可用）。

## 测试
`my-r2/tools/test/ctl-regress.cjs`：在 jsdom 或 vm 里跑 C00：50 条 jump 全部到达且 `renderVals()` 不抛错；九条真实流程（详情返回、阅读确认成局出票、撕票联系复制、改期接受 / 拒绝、候补退出、审核通过 / 谢绝到计数、改时间到答复、取消燃烧到历史、散场出席更正、草稿删除撤销）断言数据与 `c` 视图；时钟推进到期结算。

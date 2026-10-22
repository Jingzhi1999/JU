# 共享控制器 `JUS.ctl`（`settings-r2/src/core/jus-ctl.js`）· 构建代理用的接口说明

控制器只负责**行为**：导航栈、页头收拢变量、表单（资料 / 验证码 / 文本表单）、确认层、通知 / 外观 / 城市 / 收藏 / 记录 / 举报 / 帮助 / 隐私 / 账户、两个接缝、索引映射。**不含任何标记与样式**——每套用自己的构图、排版、表面与运动去渲染它。完整接线示例：`settings-r2/concepts/src/S00.dc.html`（视觉故意朴素，只抄绑定，不抄样子）。回归测试：`node settings-r2/tools/test/ctl-regress.cjs`。

## 用法
```js
class Component extends DCLogic {
  constructor(p) { super(p); this.reviewInit(CONCEPT); this.motionSpec = { fwd: 340, back: 300, root: 320, swap: 280 }; /* 你的转场时长 */ }
  initialState(variant) { return JUS.baseState(variant); }          // 已含控制器状态（nav / pf / tf / sheet / toast / ui）
  renderVals() { const panel = this.panelVals(); panel.show = this.props.panel !== false; const c = this.ctlVals(); return { panel, rootRef: this.rootRef, c, /* 你自己的派生 */ }; }
}
JUS.mixin(Component);   // 同时安装评审 mixin 与控制器；applyJump 默认 = ctlJump（52 条索引全部映射好）
```
可覆盖：`this.motionSpec`、`this.headerRange`（页头收拢的滚动距离，默认 96px）、`this.saveMs`（保存处理中可见时长，默认 360ms）、`this.paths`（surface → 栈路径）、`onProfileSaved(effect)`、`onFormDone(kind, id, effect)`、`onNav(type, surface, params)`、`onSkinPreview(key)`；自定义 `applyJump(e)` 时先调 `this.ctlJump(e)` 再补充。

## 26 个 surface
`home, profile, profile-edit, favorites, favorite-detail, city, notify, appearance, records, record-detail, record-supplement, record-dispute, record-appeal, reports, report-detail, report-supplement, help, feedback, privacy, account, about, rules, seam-feed, seam-feed-detail, seam-mine, seam-report`。三个根：`home`（设置）、`seam-feed`（找局）、`seam-mine`（我的局）。你可以把几个 surface 渲染在同一套构图里（例如 S01 让 `profile-edit` 在 `profile` 原位变成编辑态），但每个 surface 都必须可到达、可返回。

## 导航 `c.nav`
| 字段 | 含义 |
|---|---|
| `on.<surface>` | 是否渲染（栈顶 + 其下一层 + 根切换时离场的一层） |
| `cls.<surface>` | `is-top` / `is-under` / `is-leaving` + `ph-enter` / `ph-in` / `ph-idle` / `ph-exit` + `dir-fwd` / `dir-back` / `dir-swap` / `dir-root` |
| `is.<surface>` | 是否栈顶 |
| `go.<surface>(ev)` | 无参数进入；有参数的入口用各行自带的 `open(ev)`；起点矩形取 `ev.currentTarget.closest('[data-origin]')` |
| `back()` / `home()` | 返回（有未保存内容时先弹确认层）/ 回设置首页 |
| `onScroll` | 绑在每个 `[data-scroller="<name>"]` 上：写 `--hc`（0→1）到滚动容器、其 `[data-surface]` 祖先、该 surface 内的 `[data-header]`；返回时恢复滚动位置 |
| `from` / `fromStyle` / `fromKey` | 栈顶的起点矩形（`{x,y,w,h}`）/ CSS 变量串 `--fx-x/y/w/h` / 起点元素的 `data-origin` 值 |
| `cur` / `prev` / `depth` / `phase` / `dir` / `params` / `curTitle` / `rootCls` | 当前状态；`rootCls` 形如 ` nav-in dir-fwd at-profile over-home` 可直接拼到 `.app` 的 class |
相位：前进 `enter`（刚挂上，读一次布局）→ `in`（你的 CSS 过渡到位）→ `idle`；返回 `exit`（栈顶离开、下层回到位）→ 出栈后下层变 `is-top ph-idle`——**`is-under.ph-exit` 的终态必须等于 `is-top.ph-idle`**，否则出栈时会跳一下。快速连点 / 动画中返回：控制器会先结算当前转场再执行新动作。
页头：`.hd .title{font-size:calc(30px - 12px * var(--hc,0))}` 一类写法；30 → 18 连续，并移入工具行中部（用 `--hc` 插值位移）；辅助信息 14px 随 `--hc` 淡出。

## 根导航 `c.rootNav`
`[{k:'find',label:'找局'},{k:'create',label:'开局',disabled},{k:'mine',label:'我的局'},{k:'settings',label:'设置'}]`，每项 `{on, cls, go}`；开局点了提示「不在本次演示范围」。根切换相位 `dir-root`，离场 surface 带 `is-leaving`。

## 资料 `c.pf`（在 `profile-edit` 时 `on:true`）
`name / wx / email / code`、`err.{name,wx,email,code}`、`onName / onWx / onEmail / onCode / onKeyCode`、`nameCount`（如 `2/10`）、`dirty / saving / failed / saved / shake / shakeCls`、`emailChanged / needCode / codeNone / codeSent / codeExpired / codeVerified / resendLeft / canResend / resendLabel / expiresIn`、`sendCode() / verify() / resend() / save() / retry() / cancel()`、`saveLabel`（保存 / 保存中… / 重试保存）、`failText`、`emailHint / snapshotNote / codeNote / verifiedText`。输入框必须带 `data-field="name|wx|email|code"`，主动作 `data-act="save"`。保存成功默认：toast「资料已保存」→ 220ms 后返回上一层，`c.you.savedName / savedWx / savedEmail` 为真（让新值在原位置被看见）。

## 文本表单 `c.form`（栈顶为 `record-supplement / record-dispute / record-appeal / report-supplement / feedback / seam-report` 时 `on:true`）
`kind / id / title / label / placeholder / text / onInput / count / min / err.{text,who}`、`canFiles / files[{name,sizeText,remove}] / onFiles`（`<input type="file" multiple>`，只记文件名与大小）、`fileNote`、`needWho / who[{k,label,on,toggle}]`（举报对象）、`saving / failed / failText / done / shake`、`submit() / cancel()`、`submitLabel`。草稿按对象隔离（`kind:id`），未提交返回会弹确认层。成功默认：toast → 返回上一层。

## 其它视图模型
- `c.you`：`name / wx / email / emailLabel / wxLabel / verified / domain / initial / copyWx() / copyFail / savedName …`
- `c.sum`：`derive.summary`（`favLabel / cityLabel / notifyLabel / appearanceLabel / recordLabel / reportLabel / sessionLabel …`）；`c.att` 需要你处理的事项（`{key, kind, title, label, status, line, open}`）、`c.attCount`
- `c.notify`：`deliverLabel / canDeliver / permission / permCopy{title,body} / isDefault / isRequesting / isGranted / isDenied / isUnsupported / serviceConnected / serviceCopy / cats[{key,label,sub,on,aria,cls,toggle}] / onCount / total / request() / sys{on,title,body,allow,deny} / prefHint`
- `c.skin`：`cur / shown / preview / previewing / list[{key,name,en,line,on,shown,cls,pick}] / curName / shownName / apply() / cancel() / applyLabel / rmUser / rmSys / rmOn / rmAria / rmToggle() / rmLine`；`.app` 的 `data-skin` 用 `c.skinShown`（预览也会让整套画面换环境）
- `c.city`：`cur / q / onQ / clearQ / list[{key,name,en,tzLabel,on,cls,pick}] / none / noResult / retry / scope / note / flash`
- `c.fav`：`rows / active / archived[{id,title,when,place,host,cityName,crossCity,statusLabel,closed,joined,hosted,relLabel,favAgo,open,remove}] / count / empty / emptyCopy{title,body,cta} / undo{on,text,act,label} / goFind()`；`c.favDetail`（`favorite-detail`）：`title / when / place / host / cap / note / status / fav / favLabel / toggleFav / joined / joinedLabel / canSeeHostWx / hostWx / hostWxRule / copyHostWx / applyNote / favAgo / crossCity / city`
- `c.recs`：`rows[{id,label,statusLabel,kindLabel,title,when,quotaLabel,pendingReview,open,…}] / groups[{title,rows,count}] / count / empty / help / quotaRule / quotaNo / creditSettings / emptyText`；`c.rec`（记录类 surface）：`label / statusLabel / title / when / place / host / quotaLabel / supplementRows[{text,atText,materialsText}] / appealRows[{kindLabel,reason,atText,statusLabel}] / goSupplement / goDispute|null / goAppeal|null`
- `c.reps`：`rows[{id,title,statusLabel,needsMore,updatedText,open}] / count / empty / note / mock / emptyText`；`c.rep`：`statusLabel / title / text / whoName / shotRows / id / atText / updatedText / timelineRows[{label,atText,text}] / supplementRows / needsMore / needsText / goSupplement|null`
- `c.help`：`groups[{key,name,line,rules[{n,title,body}]}] / faq / feedback[{text,statusLabel,localNo,atText}] / goFeedback / goReports / goRules`
- `c.privacy`：`lead / policy / general[] / facts[{title,role,rule,open}]`；`c.about`：`version / rulesVersion / built / policyNote / demo / storageKey / goRules`
- `c.acct`：`demo / ended / startedText / endedText / device / end() / restart() / storageNote / noAccount`
- `c.feed`（入局接缝）：`rows[{id,title,when,place,host,fav,star,dx,style,cls,hint,down,move,up,cancel,key,open,toggle}] / count / favCount / city / isAll / isFav / setAll / setFav / hintIdle / empty / emptyText`——行元素：`style="{{r.style}}" onPointerDown onPointerMove onPointerUp onPointerCancel onKeyDown onClick` + `touch-action:pan-y`，`.is-drag` 时 `transition:none`，释放回弹 `.5s cubic-bezier(.2,.9,.3,1.04)`；`c.feedDetail`
- `c.mine`（我的局接缝）：`current / history / hosted[{id,title,label,star,toggleFav,receipt,canReport,report}]`；`c.seamReport`
- `c.sheet`：`on / unsaved / accountEnd / title / body / keep / discard / keepLabel / discardLabel / confirm / cancel / confirmLabel / cancelLabel`；`c.toast`：`on / text / kind / cls`
- `c.kb`（键盘模拟开）、`c.rm`（三源减少动态任一生效）、`c.session`、`c.demoNote`

## 你仍然要自己做的
构图、排版、表面、每个 surface 的版式、转场（用 `cls` / `fromStyle` / `--hc` / `phase` 驱动）、核心动作的编排（`this.motion(name, fn)` 登记以便重播）、长内容与空态的版式、三个环境的大面积呈现、键盘下的布局（`var(--kb)`）、减少动态下的等价状态。

## 评审工具约定（阶段 2 期间补充）
- `onNav(type, surface, params)` 在新栈状态生效**之前**调用（`go` / `back` 里先 setState 再回调，但回调时 `this.state.nav` 仍是旧值）；有的方案靠这一点区分「栏展开」与「列到达」，此顺序保持不变。
- 关键帧：开始拖动时，共享核心把**被各套 `.scrub` 规则（设 animation-delay 或 animation 的规则）命中的动画**的 currentTime 归零、释放时还原；没有动作在进行时会先重播最近一次 `this.motion()` 登记的核心动作。若一套有多个核心动作，`.scrub` 规则要限定到最近播放的那个动作（例如动作期间在根上加 `.sNN-m-<动作名>`），否则会把别的动作一起倒回去。一次性动画结束后撤掉动画类或用 `backwards` 填充，不要让已结束的动画一直挂着。
- `capture.cjs` 的 `click` 是真实指针点击（先 `reveal()` 只滚动所属 `[data-scroller]`，再点元素中心，最多在顶部以下 48px）；被遮挡会记入日志。屏幕外的目标请先用滑动 / 滚动把它带进来。
- 面板接口：`scrubTo(v)` 的 v 是 0–100（`--frame` = v / 100），`scrubTo(null)` 释放；`setSpeed(x)` 只认 1 与 0.5。`capture.cjs` 的 `jump` 与 `click` 都接受 `"shot": false`。
- 视图模型补充（S06 / S07 复核与汇报后）：`c.pf.base`（编辑开始时的原值，用于标出改动过的字段）；`c.sheet.guards`（未保存确认保护的是 `'profile'` 还是某个表单种类）与 `c.sheet.guardsKey`（表单的 `kind:id`）；`c.sum.pendingRecords` 现在是「仍在核实中的记录数」（异议之后仍算待核实），`c.sum.pendingToAnswer` 是「还等你回应的」（计入首页需要处理的件数）。未保存确认标题改为「修改还没保存」。
- `c.you.lastSaved` / `savedName` 等「刚更新」标记在保存后 4.5 秒自动清除（实时窗口，不受减少动态影响）；不要再自己永久保留。
- 手机内文案（S03 复核后）：`codeNote` 不再提「评审面板」；`acct.storageNote` 不再显示存储键（键名改由 `acct.storageKey` 提供，只用于手机外的说明）；通知「已允许 + 已连接」时 `permCopy` 不再说「消息提醒暂未开通」。
- 数据补充（S05 复核后）：举报与记录的 `supplementRows[i].materialsText`（「截图.jpg · 402 KB、…」，只有本机文件名与大小）；记录的 `helpText`（未出席记录在提出异议之后改为「你已提出异议，正在等待核实，仍可随时补充说明」——请用它代替固定的 `JUS.COPY.recordHelp`）；「长称呼」变体改为 10 个字以内（称呼规则上限）。
- 举报计数（S01 复核后）：`c.sum.reportLabel` 现在逐阶段各说一次（「1 条需补充 · 1 条处理中 · 1 条已提交」，已提交不再算「处理中」）；另有 `reportOpen`（未结束）、`reportProcessing`（已受理 + 处理中）、`reportSubmitted`、`needMore`。请用这些字段，不要自己数 `reps` 里的函数属性。

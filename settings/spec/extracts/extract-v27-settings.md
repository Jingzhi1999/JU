# JU V27 原型提取 · 「设置」模块承接依据（extract-v27-settings）

- 来源：`/root/.claude/uploads/4330fea6-5730-5810-9ae8-18088dd29e6e/fca10784-JU-V27-review-canvas-Claude-under30MB.html`（29,703,009 字节，4765 行，只读）。
- 提取日期：2026-10-17。方法：`grep -b -n -o`、python 字节切片、`sed -n`、`awk`；base64 data-URI 脚本已解码到临时目录后按解码行号引用。未修改源文件。
- 判定标签：[实现行为] 代码真实执行并有可见结果；[占位或禁用] 入口存在但无业务效果或仅本机/mock；[提案文字] 仅为文案或未批准方案；[不确定] 无法从代码核实。

## 0. 源文件结构与「最终生效定义」规则

| 代码块 | 源位置（原文件行 / 字节） | 说明 |
|---|---|---|
| 内联引导 | 行 2，字节 41–237 | `document.documentElement.dataset.view = ?view=product → 'product' : 'review'`；`dataset.screen = location.hash.slice(1) || 's01'` |
| `<script data-standalone-bootstrap>` | 行 2–35 | 20 MB 资产字典（字体 woff2、`./ju-card.html`、`./ju-member.html`、`./cotton-bg.js` 等 706 个 key）→ Blob URL |
| `rules26.js`（data-URI） | 行 38，字节 21439726 | `window.JuRules26`：正式约定 `JU-27-agreement-1`、18 条规则、policy |
| `ju-state.js`（data-URI） | 行 39，字节 21452565 | `window.JuLedger`：本机账本，唯一 localStorage key |
| `support.js`（data-URI） | 行 40，字节 21495533 | DC 运行时（`DCLogic`、`renderVals` 基类返回 `{}`） |
| 全局 CSS `<style>` | 行 48–420（字节 21587965–21649862） | 所有 token、类规则、reduced-motion |
| 画布 HTML 模板 | 行 434–1688 | 13 个 `<section id="sXX">`；主导航与「设置」整屏模板在**行 545**（#s01 内） |
| 主逻辑 `<script type="text/x-dc">` | 行 1689–4762（字节 29357123–29692193） | `class Component extends DCLogic`，3073 行；**原文件行 = 脚本内行 + 1688** |
| 评审工具 `review-tools.js` / `motion-review25.js` | 行 4765，字节 29692205 / 29700172 | 仅 `data-view=review` 生效 |
| 其他效果模块 | 行 421–433 | ju-paper-model / ju-paper-film（JuFilm）/ three r185 / mist / stamp / tickets2 / tear / print / burn / nativeburn / envelope / scale |

**哪个定义赢**：`Component.renderVals()`（主逻辑 L3063–3071 → 原文件 4751–4759）：

```js
renderVals() {
  const s = this.state;
  const out = this.sharedVals(s);
  const proto = Object.getPrototypeOf(this);
  for (const k of Object.getOwnPropertyNames(proto)) {
    if (k.indexOf('vals') === 0 && typeof this[k] === 'function') Object.assign(out, this[k](s));
  }
  return out;
}
```

即按类体中 `vals*` 方法的**定义顺序**合并，后定义者覆盖同名键。顺序（脚本内行号）：`sharedVals 767 → vals01 842 → vals02 931 → vals03 1033 → vals03b 1348 → vals09b 1403 → vals04 1545 → vals05 1577 → valsGate 1700 → vals06 1745 → vals07 1790 → vals08 1824 → vals09 1884 → vals10 1899 → vals11 2156 → vals12 2257 → valsX 2311 → vals18 2622 → vals22 2804 → vals23 2815 → vals24 2833 → vals25 2866 → vals25State 2923 → vals26Form 3027 → vals26State 3042 → vals26Agreement 3061`。

对本模块有影响的覆盖关系（后者生效）：
- `allCredit22`、`setSupplement19`、`sendSupplement19`、`setCreditAppeal22`、`sendCreditAppeal22`：vals18(2642)/vals22(2806)/vals25State(2932) 均定义，**vals26State(3045–3047) 最终生效**（接入草稿保留与新文案）。
- `showCredit22`/`closeCredit22`：vals22 定义，**vals26Agreement(3061) 生效**（走 B5 约定面板）。
- `mineRows18`：vals18(2641) 定义，**vals25State(2933) 生效**（selectEvent 时带 `route` 选项）。
- `rep8*`、`openRep8/closeRep8/setRep8/sendRep8`：vals08 定义旧版，**vals25State(2925–2931) 生效**。
- 没有任何 `X = function` / `Object.assign(Component.prototype…)` / 后置 `function X19` 形式的补丁；所有定义都在类体内一次性给出（grep 全文件无第二定义）。

---

## 1. 导航与设置屏

### 1.1 `rootTabs18` —— 底部主导航 [实现行为]
位置：vals18，脚本 L2639 → **原文件 L4327**。

```js
rootTabs18:[['find','找局','compass'],['create','开局','plus'],['mine','我的局','tickets'],['settings','设置','settings']]
  .map(([id,label,icon])=>({id,label,icon,iconPath:{compass:'…',plus:'M12 5v14M5 12h14',tickets:'…',settings:'M9 3h6l1 3 3 1 2 5-2 5-3 1-1 3H9l-1-3-3-1-2-5 2-5 3-1 1-3 M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6'}[icon],
    selected:(s.root18||'find')===id,style:{color:(s.root18||'find')===id?'#4553BE':'#646a7b'},pick:()=>this.setState({root18:id})})),
```

- 四个 tab：`find` 找局 / `create` 开局 / `mine` 我的局 / **`settings` 设置**。选中色 `#4553BE`，未选 `#646a7b`。
- 导航**只存在于 #s01**（模板 L113 → 原文件 **L545**：`<nav class="ju-main-nav" aria-label="主导航">`），样式 `.ju-main-nav{position:absolute;left:12px;right:12px;bottom:var(--ju-root-bottom,24px);height:66px;…z-index:32}`（CSS L201 → 原文件 L248；product 视图 `--ju-root-bottom:10px`）。
- 切 tab 只改 `root18`，**不改** `settings19`，所以从别的 tab 回到「设置」会停在上次的子屏。
- `root18` 初始 `'find'`（state 初始化 L172 → 原 L1860）；`selectEvent`（L685→L2373）、`hydrate18`（L2500→L4188）、`resetScreen19`（L2569→L4257）都会把 `root18` 重置为 `'find'`。
- `toFind18:()=>this.setState({root18:'find',feedFilter:'all',dig:2})`（L2640→L4328）定义存在，模板未见绑定 [不确定]。
- 「开局」tab：模板中**没有** `rootCreate18` 分支（grep 0 次），面板只显示标题 `开局`；另有 `pressOpen: () => this.toast('s01', '开局流程不在本离线演示中')`（L928→L2616）。模板 L64（原 L496）明示：`原型边界：开局为导航占位；04包含等待、通过、未通过和撤回结果。邮箱验证由画布测试事件触发，举报仅保存本机。活动费用、完整集合地址与时长尚未提供。` → [占位或禁用]

### 1.2 根面板标题与子屏状态
`rootTitle18`（L2638 → L4326）：

```js
rootTitle18:s.root18==='create'?'开局':s.root18==='mine'?'我的局':s.settings19==='help'?'帮助与反馈':s.settings19==='reports'?'我的举报':s.settings19==='detail'?'举报进度':s.settings19==='credit'?'信用记录':'设置',
```

`settings19` 枚举：`'home' | 'help' | 'reports' | 'detail' | 'credit'`（初始 `'home'`，state L172）。

### 1.3 `settings19`/设置整屏模板 [实现行为]
模板 L113 → 原文件 **L545**（去掉 style 的精简结构，文案逐字）：

```html
<sc-if value="{{rootOther18}}"><div class="ju-root-sheet">
  <sc-if value="{{settingsBackOn19}}"><button class="ju-settings-back" sc-camel-on-click="{{settingsBack19}}" aria-label="返回上一级">←</button></sc-if>
  <h1>{{rootTitle18}}</h1>
  <sc-if value="{{rootMine18}}">
    <sc-if value="{{mineEmpty20}}"><p class="ju-empty">还没加入任何局</p><button class="ju-paper-action" sc-camel-on-click="{{rootFindAction20}}">去找局</button></sc-if>
    <sc-for list="{{mineRows18}}" as="row"><button class="ju-mine-row" sc-camel-on-click="{{row.pick}}"><span>{{row.title}}</span><small>{{row.status}}</small></button></sc-for>
  </sc-if>
  <sc-if value="{{rootSettings18}}"><div class="ju-feedback">
    <sc-if value="{{settingsHome19}}">
      <button class="ju-setting-row" sc-camel-on-click="{{openCredit22}}">信用记录 <span>›</span></button>
      <button class="ju-setting-row" sc-camel-on-click="{{openHelp19}}">帮助与反馈 <span>›</span></button>
    </sc-if>
    <sc-if value="{{settingsHelp19}}"><button class="ju-setting-row" sc-camel-on-click="{{openReports19}}">我的举报 <span>›</span></button></sc-if>
    <sc-if value="{{settingsCredit22}}">
      <p class="ju-credit-note22">{{creditSettingsCopy26}}</p>
      <sc-if value="{{noCredit22}}"><p>暂无信用记录</p></sc-if>
      <sc-for list="{{allCredit22}}" as="f"><div class="ju-credit-entry22"><strong>{{f.title}}</strong><p>{{f.label}} · {{f.status}}</p><time>{{f.time}}</time><button class="ju-rule-link22" sc-camel-on-click="{{f.appeal}}">补充与申诉</button></div></sc-for>
      <sc-if value="{{creditAppealOn22}}"><label for="credit-appeal22">补充事实或申诉说明</label><textarea id="credit-appeal22" class="ju-credit-text22" value="{{creditAppeal22}}" sc-camel-on-input="{{setCreditAppeal22}}"></textarea><button class="ju-paper-action" sc-camel-on-click="{{sendCreditAppeal22}}">保存说明</button></sc-if>
      <p role="status">{{creditMessage22}}</p>
    </sc-if>
    <sc-if value="{{settingsReports19}}">
      <sc-if value="{{reportsEmpty19}}"><p>暂无举报记录</p></sc-if>
      <sc-for list="{{reportRows19}}" as="ticket"><button class="ju-report-row" sc-camel-on-click="{{ticket.pick}}"><span>{{ticket.title}}</span><strong>{{ticket.status}}</strong></button></sc-for>
    </sc-if>
    <sc-if value="{{settingsDetail19}}"><div class="ju-report-detail">
      <span class="ju-report-status">{{reportStatus19}}</span><h2>{{reportTitle19}}</h2>
      <p>举报对象 · {{reportWho19}}</p><p>{{reportText19}}</p>
      <div class="ju-report-materials"><sc-for list="{{reportImages19}}" as="shot"><a href="{{shot.data}}" target="_blank" rel="noopener" sc-camel-on-click="{{shot.open}}"><img sc-camel-src="{{shot.data}}" alt="{{shot.name}}"></a></sc-for></div>
      <dl><dt>受理编号</dt><dd>{{reportNumber19}}</dd><dt>更新时间</dt><dd>{{reportUpdated19}}</dd></dl>
      <ol><sc-for list="{{reportTimeline19}}" as="step"><li><b>{{step.label}}</b><time>{{step.time}}</time></li></sc-for></ol>
      <sc-for list="{{reportSupplements19}}" as="extra"><p>{{extra.text}}</p></sc-for>
      <sc-if value="{{reportNeeds19}}"><label for="report-supplement">补充材料</label><textarea id="report-supplement" value="{{supplement19}}" sc-camel-on-input="{{setSupplement19}}" placeholder="补充相关细节"></textarea><button class="ju-feedback-submit" sc-camel-on-click="{{sendSupplement19}}">提交补充</button></sc-if>
    </div></sc-if>
  </div></sc-if>
</div></sc-if>
```

**设置首页清单（settings19==='home'）**：只有两项——`信用记录 ›`、`帮助与反馈 ›`。没有资料/称呼/微信/邮箱、没有通知开关、没有外观、没有关于/版本、没有退出登录。

### 1.4 子屏导航函数（vals18，L2642 → 原 L4330）[实现行为]

```js
settingsBackOn19:s.root18==='settings'&&s.settings19&&s.settings19!=='home',
settingsHome19:!s.settings19||s.settings19==='home',settingsHelp19:s.settings19==='help',settingsReports19:s.settings19==='reports',settingsDetail19:s.settings19==='detail',
settingsBack19:()=>this.setState({settings19:s.settings19==='detail'?'reports':s.settings19==='reports'?'help':'home'}),
openHelp19:()=>this.setState({settings19:'help'}),openReports19:()=>this.setState({settings19:'reports'}),
reportRows19:tickets.map(t=>({title:t.eventTitle,status:JuLedger.reportLabels[t.status],id:t.id,pick:()=>this.selectReport19(t)})),reportsEmpty19:!tickets.length,
reportTitle19:ticket?.eventTitle||'',reportWho19:ticket?.whoName||'',reportText19:ticket?.text||'',reportNumber19:ticket?.id||'',
reportUpdated19:ticket?new Date(ticket.updatedAt).toLocaleString('zh-CN'):'',reportStatus19:JuLedger.reportLabels[ticket?.status]||'',reportNeeds19:ticket?.status==='needs_info',
reportImages19:(ticket?.shots||[]).map(shot=>({...shot,open:event=>this.openReportImage27(shot,event)})),
reportTimeline19:(ticket?.timeline||[]).map(t=>({label:JuLedger.reportLabels[t.status],time:new Date(t.at).toLocaleString('zh-CN')})),reportSupplements19:ticket?.supplements||[],
```

- `openCredit22:()=>this.setState({settings19:'credit'})`、`settingsCredit22:s.settings19==='credit'`（vals22 L2806 → 原 L4494）。
- 返回链：`detail → reports → help → home`；`credit → home`（落入 else 分支）。`←` 按钮 `.ju-settings-back{…font-size:23px;min-width:44px;height:44px;margin:0 0 18px -10px}`（CSS L183→原 L230）。
- `tickets=JuLedger.allReports()`，`ticket=tickets.find(t=>t.id===s.reportSelected19&&t.eventId===s.reportSelectedEvent26)`（vals18 头 L2624）。
- 浏览器返回键不作用于子屏：`writeRoute25`/`restoreRoute25` 只记录 `event/ticket/intent/#screen`，不含 `root18/settings19` → [实现行为]（设置内层级无 URL/history）。

### 1.5 `openReports19` 外部入口：散场页举报结果 → 我的举报 [实现行为]
- 模板 L948 → 原 **L1380**：`<div sc-camel-on-click="{{openReportQuery19}}" role="button" tabindex="0" style-active="opacity:.5">查看进度</div>`；旁边文案：`可在“设置 → 帮助与反馈”查询进度。`、状态字 `已受理`。
- `openReportQuery19:()=>this.showReports19()`（vals08 L1843 → 原 L3531）。
- `showReports19(){this.setState({root18:'settings',settings19:'reports',rep8On:false});this.goTo('s01')}`（L2570 → 原 **L4258**）。
- 规则文案也指向该路径（rules26 第 12、18 条）：`异议到“设置→信用记录→补充与申诉”`、`到“设置→帮助与反馈→我的举报”查询或补材料`。

### 1.6 子流程「帮助与反馈 / 我的举报 / 举报进度 / 补充材料」
1. **帮助与反馈**（help）：唯一一行 `我的举报 ›`。无 FAQ、无联系客服、无反馈表单 → 其余为空 [占位或禁用]。
2. **我的举报**（reports）：空态 `暂无举报记录`；行 `.ju-report-row`：`{{ticket.title}}`（活动名）+ `{{ticket.status}}`（标签）。
   - `JuLedger.reportLabels={accepted:'已受理',processing:'处理中',needs_info:'需补充',resolved:'已处理',failed:'提交失败'}`（ju-state L49）。
   - 点击：`selectReport19(ticket){const text=this.objectDraft26('supplement',ticket.eventId,ticket.id);this.setState({reportSelected19:ticket.id,reportSelectedEvent26:ticket.eventId,settings19:'detail',supplement19:text})}`（L2571 → 原 L4259）。
3. **举报进度**（detail）：状态字、活动名 h2、`举报对象 · {{whoName}}`、正文、截图缩略（72×72，点击 `openReportImage27` 新窗口打开；失败 toast：`图片无法打开，请返回后重试。` / `图片未打开，请允许弹出窗口后重试。`，窗口标题 `shot.name||'举报截图'`，`viewer.opener=null`，L2572–2584 → 原 L4260–4272）、`受理编号`、`更新时间`、时间线（每步 `reportLabels[status]` + `toLocaleString('zh-CN')`）、已提交补充列表。
4. **补充材料**：仅当 `status==='needs_info'` 显示；textarea placeholder `补充相关细节`；按钮 `提交补充`。
   - 输入：`setSupplement19:e=>{if(ticket)this.editObjectDraft26('supplement',ticket.eventId,ticket.id,e.target.value)}`（vals26State L3046 → 原 L4734）；`editObjectDraft26` 同时写内存 `_objectDrafts26` 与账本 `JuLedger.saveObjectDraft`，失败 toast `草稿未保存，当前内容仍保留，请重试。`（L3040 → 原 L4728）。
   - 提交（生效版本 vals26State L3046）：
     ```js
     sendSupplement19:()=>{if(!ticket)return;const text=this.objectDraft26('supplement',ticket.eventId,ticket.id);
       if(!JuLedger.supplement(ticket.eventId,ticket.id,text)){this.toast('s01','补充未提交，内容已保留，请重试。');return}
       delete this._objectDrafts26?.[this.objectKey26('supplement',ticket.eventId,ticket.id)];this.setState({supplement19:'',factTick18:(s.factTick18||0)+1})},
     ```
     被覆盖的旧文案（vals18 L2642）：`补充未提交，请检查内容后重试`。
   - 账本规则（ju-state L87）：`supplement:(eventId,reportId,text)=>commit(...,r=>{const t=r.reports.find(x=>x.id===reportId);if(!t||t.status!=='needs_info'||!text.trim())return false;t.supplements.push({text:text.trim(),at:Date.now()});t.status='processing';t.updatedAt=Date.now();t.timeline.push({status:'processing',at:t.updatedAt});if(r.objectDrafts?.supplement)delete r.objectDrafts.supplement[reportId];return true})` → 成功后状态自动变 `处理中`，补充入口随之隐藏 [实现行为]。
   - 结果态：成功无 toast，仅清空输入并刷新列表；失败 toast 并保留文本（内存+账本草稿）。
5. toast 均挂在 key `'s01'`（设置面板位于 #s01），样式见 §9。

### 1.7 子流程「信用记录 / 补充与申诉」
- 顶部说明 `creditSettingsCopy26: JuRules26.copy.creditRecord+' '+JuRules26.copy.creditBoundary`（vals26Agreement L3061 → 原 L4749），即：
  `记录、核实、认定、处理与更正分别显示。举报不等于违规；主动告知轻于未告知后经核实的缺席。 同一账户每年共4次票根主动退出机会，跨活动、未撕和已撕票共用，接受改期后再退出也计入。确认前放弃预留或预留到期、纯候补退队、拒绝改期、局主取消不消耗。不凭举报或计时自动处罚。`
- 空态 `暂无信用记录`（`noCredit22:!JuLedger.records().some(x=>x.creditEvents?.length)`）。
- 列表（生效版本 vals26State L3045 → 原 L4733）：
  ```js
  allCredit22:JuLedger.records().flatMap(rec=>(rec.creditEvents||[]).map(f=>({key:f.key,title:rec.event.title,label:JuLedger.creditLabel(f),status:JuLedger.creditStatus(f),time:new Date(f.updatedAt||f.at).toLocaleString('zh-CN'),appeal:()=>this.selectCredit26(rec,f)}))),
  ```
  `selectCredit26(rec,f){this.setState({creditSelected22:f.key,creditAppeal22:this.objectDraft26('appeal',rec.id,f.key),creditMessage22:''});}`（L3041 → 原 L4729）——打开时**恢复申诉草稿**。
- 标签/状态（ju-state L64–65）：
  ```js
  creditLabel=f=>({active_withdrawal:'主动告知退出',reservation_released:'未确认预留已释放',reservation_expired:'预留已到期',queue_left:'已退出候补',host_reschedule_declined:'已拒绝局主改期',host_cancelled:'局主已取消'})[f.type]||(f.status==='corrected'?(f.attendanceMode==='present'?'已更正为出席':f.attendanceMode==='pending'?'出席待确认 · 旧记录已更正':'未出席记录已更正'):'未出席记录');
  creditStatus=f=>f.withdrawalScope27?.eligible===false&&f.status==='recorded'?'已记录 · 不占主动退出机会':f.type==='active_withdrawal'&&['corrected','dismissed'].includes(f.status)?'已更正 · 不计主动退出事实':({pending_review:'待核实 · 未处罚',recorded:'已记录',corrected:'已更正 · 不作为当前违规',dismissed:'不成立',verified:'事实已核实 · 未执行处罚'})[f.status]||f.status;
  ```
- 申诉输入 `setCreditAppeal22:e=>{if(rec)this.editObjectDraft26('appeal',rec.id,s.creditSelected22,e.target.value)}`；提交（vals26State L3047 → 原 L4735）：
  ```js
  sendCreditAppeal22:()=>{if(!rec)return;const text=this.objectDraft26('appeal',rec.id,s.creditSelected22);
    if(!JuLedger.appealCredit(rec.event,s.creditSelected22,text)){this.setState({creditMessage22:'申诉未保存，内容已保留，请重试。'});return}
    delete this._objectDrafts26?.[this.objectKey26('appeal',rec.id,s.creditSelected22)];
    this.setState({creditSelected22:'',creditAppeal22:'',creditMessage22:'申诉说明已保存本机，尚未提交审核服务。'})},
  ```
  被覆盖旧文案（vals22 L2806）：`请填写说明；若保存失败，请重试。`。
- 账本（ju-state L70）：`appealCredit:(e,key,reason)=>commit(e,r=>{const f=r.creditEvents?.find(x=>x.key===key);if(!f||!reason?.trim())return false;f.appeals||=[];f.appeals.push({reason:reason.trim(),at:Date.now(),status:'pending_review'});if(r.objectDrafts?.appeal)delete r.objectDrafts.appeal[key];return true})`。
- 结果态：只有 `pending_review` 一种；没有审核结果、没有期限、没有撤回 → 存储 [实现行为]，审核流程 [占位或禁用]（文案自述「尚未提交审核服务」）。
- 另一处信用记录视图：票根页「参加约定」B5 面板的 `我的信用记录`（`creditTitle23`，vals23 L2822）只列当前活动的 `creditEvents22`，无申诉入口；该面板按 `JuLedger.ruleKey` 记阅读进度（`recordAgreementRead`）。

---

## 2. 收藏（Favorites）

### 2.1 键格式与过滤 [实现行为]
位置：脚本 L621–625 → 原文件 **L2309–2313**。

```js
midDig(filter, city) { const list = this.filteredFeed(filter, city); return Math.min(2, Math.max(0, list.length - 1)); }
filteredFeed(filter,city) { return (this.feedByCity[city] || []).map(e=>({...e,...JuLedger.eventProjection({...e,city})})).filter(x => filter === 'all' || (filter === 'favs' ? this.state.favs[city+'|'+x.title] : x.cat === filter)); }
digList() { const s = this.state; return this.filteredFeed(s.feedFilter,s.city); }
favKeyAt(i) { const it = this.digList()[i]; return it ? this.state.city+'|'+it.title : ''; }
```

- **收藏键 = `city + '|' + title`**（例 `NYC|深夜救急火锅局`），**不是**事件 id（事件 id = `city|pack|title`，见 §6）。pack 不参与 → 同城同名不同 pack 会撞键（样例数据中无撞键）。
- 过滤 pill：`get pills(){ return [{ id: 'all', l: '全部', g: '' }, {id:'favs',l:'收藏',g:'☆'}].concat(themes…) }`（L16 → 原 L1704）。切城市/筛选走 `changeFeed19(city,filter)`（L2568 → 原 L4256，async，等 WebGL `setCards` 完成后才提交 state；失败 `filmFail:true`）。
- 空态文案（vals01 L885 → 原 L2573）：`digHint: digN === 0 ? (s.feedFilter==='favs'?'还没收藏这个城市的局':'这个主题这两天还没局') : (favOn ? '已收藏 ✦ 左滑撤回 · 点卡进详情' : '上下翻卡 · 点正中那张进详情')`。
- 列表为空时 canvas 隐藏并 `inert`（filmSync L657 → 原 L2345）。

### 2.2 `favs` 状态与持久化
- `state = { … favs: {}, favX: 0, favDrag: false, … }`（L146/148 → 原 L1834/1836）。纯内存对象 `{ [city|title]: true }`。
- **无持久化**：`favs` 在 ju-state.js/support.js/模板/film 中 0 次出现；全文件唯一存储 key 为 `JU_V26_EVENTS_1`（§8）。刷新即丢失 → [实现行为]（会话级）。
- `resetScreen19`（评审重置）刻意保留：`const favs=this.state.favs,city=this.state.city…this.setState({...cleared,...this._initial19,…favs,…})`（L2569 → 原 L4257）。

### 2.3 手势：方向、阈值、取消 [实现行为]
常量 `FAV_THROW = 82`（L118 → 原 L1806，同行 `DIG_SLEEVE = 296; DIG_LABEL = 44; DIG_PITCH = 140; … TRACK_MAX = 200`）。

手势桥接（`filmCanvasRef`，L642–644 → 原 L2330–2332）：`onFavStart: () => this.setState({ favDrag: true, favX: 0 })`，`onFavMove: dx => this.favMove(dx)`，`onFavEnd: (dx, cancel) => this.favEnd(dx, cancel)`。

轴判定在 WebGL 层（ju-paper-film.js 解码 L538–546，原文件 L422 data-URI）：

```js
if(!d.axis){
  if(Math.hypot(dx,dy)<6)return;
  if(Math.abs(dx)>Math.abs(dy)*1.25){
    d.axis=d.canFav?'x':'blocked';
    if(d.axis==='x'&&self.opts.onFavStart)self.opts.onFavStart();
  }else d.axis='y';
}
if(d.axis==='blocked')return;
if(d.axis==='x'){if(self.opts.onFavMove)self.opts.onFavMove(dx+d.favStart);wake();return;}
```

- 移动 ≥6px 后定轴；`|dx| > |dy|×1.25` 判横向；`canFav = stable && hitCenter(e)`（舞台静止且按在正中卡上），否则横向被 `blocked`；纵向为翻卡。
- 释放：`onFavEnd(cancel?0:coords(e,d.rect).x-d.x+d.favStart, cancel)`（L557）。取消源：`pointercancel`、`lostpointercapture`、`window blur/resize`、IntersectionObserver 离屏、`cancelGesture()`（L574–596）；主逻辑 `_cancelInput`（blur/visibilitychange）也调 `_film.cancelGesture()`。

```js
favMove(dx) {                                                       // L665 → 原 L2353
  const key = this.favKeyAt(this.state.dig), on = !!this.state.favs[key];
  const idle = (dx > 0 && on) || (dx < 0 && !on);
  const x = idle ? dx * 0.26 : Math.max(-190, Math.min(190, dx));
  if (this._film) this._film.setFavX(x);
  this.setState({ favX: x, favDrag: true });
}
favEnd(dx, cancel) {                                                // L672 → 原 L2360
  const key = this.favKeyAt(this.state.dig), on = !!this.state.favs[key];
  const add = !cancel && dx > this.FAV_THROW && !on, del = !cancel && dx < -this.FAV_THROW && on;
  if (this._film) this._film.setFavX(0);
  if (add || del) {
    this.setState(x => { const nf = Object.assign({}, x.favs); if (add) nf[key] = true; else delete nf[key]; return { favs: nf, favX: 0, favDrag: false }; });
  } else this.setState({ favX: 0, favDrag: false });
}
```

| 情况 | 行为 |
|---|---|
| **右滑 > 82px 且未收藏** | 加入收藏 |
| **左滑 < −82px 且已收藏** | 取消收藏 |
| 未过阈值 | 回弹，无变化 |
| `cancel`（指针取消/失焦/离屏） | 回弹，无变化（dx 传 0） |
| 错误方向（右滑已收藏 / 左滑未收藏） | `idle`：位移阻尼 ×0.26，灰色洗层，文案提示，释放无变化 |
| 正确方向位移上限 | 夹到 ±190px |
| 键盘 | `ArrowRight` 加、`ArrowLeft` 删（`add===on` 时忽略），`onDigKey` L889–901 → 原 L2577–2589 |

### 2.4 拖动中的视觉反馈（vals01 L848–927 → 原 L2536–2615）[实现行为]
- `fx = s.favDrag ? s.favX : 0, fp = Math.min(1, Math.abs(fx) / 96), ready = Math.abs(fx) > this.FAV_THROW, right = fx > 0`。
- DOM 覆盖层 `favWrapStyle`：`transform:'translateX(fx px) rotate(fx*0.012 deg)'`，释放回弹 `transition: 'transform .5s cubic-bezier(.2,.9,.3,1.04)'`。
- 洗层 `washStyle.opacity = fp*(idle?0.5:1)`；右滑蓝 `linear-gradient(126deg,rgba(58,74,206,.9) 0%,rgba(88,146,232,.84) 44%,rgba(150,224,250,.76) 100%)`；左滑墨 `linear-gradient(126deg,rgba(26,32,50,.88) 0%,rgba(66,76,102,.8) 52%,rgba(120,130,154,.72) 100%)`；idle 灰 `linear-gradient(126deg,rgba(226,232,247,.72) 0%,rgba(198,208,232,.62) 100%)`。
- 图标 `washIcon: right ? '★' : '☆'`（44px，随 fp 旋转 ±13°）。
- 文案 `washText: idle ? (favOn ? '已经收着了' : '还没收藏') : (right ? '收进收藏' : '拿出收藏')`，Space Mono 10.5px/.24em/700，`ready` 时描边 1.5px 白。
- 常驻角标 `favTabStyle`：右下 27px 圆、蓝渐变 `linear-gradient(152deg,rgba(74,90,214,.96) 0%,rgba(120,190,244,.94) 100%)`，`opacity: favOn && digN ? 1 : 0`，`transform: favOn ? 'scale(1)' : 'scale(.35)'`，`transition:'transform .52s cubic-bezier(.18,1.5,.36,1), opacity .26s ease'`。
- WebGL 侧 `setFavX(px)`（film L626）：`state.favTarget=px`，拖动中直接赋值，否则按 `1-exp(-dt*23)` 缓动；`prefers-reduced-motion` 时瞬时到位（L504）；光膜卡本体随 `favX` 平移并 `rz -= favX*.012`（L436–438）。

---

## 3. 通知

### 3.1 状态判定与请求 [实现行为]
```js
notificationStatus22(){return !window.isSecureContext||!('Notification' in window)?'unsupported':Notification.permission;}      // L2688 → 原 L4376
async requestNotification22(){if(this.state.notificationBusy22)return;const status=this.notificationStatus22();if(status!=='default'){this.setState({notification22:status});return}
  const seq=this._notificationSeq22=(this._notificationSeq22||0)+1,scene=this._scene19;this.setState({notificationBusy22:true,notificationError22:''});
  try{const permission=await Notification.requestPermission();if(seq!==this._notificationSeq22||scene!==this._scene19)return;
    this.setState({notification22:permission,notificationChoice22:permission==='granted'?'permission_only':'not_enabled'});
    JuLedger.draft(this.EVENT,{notificationPermission:permission,notificationChoice:permission==='granted'?'permission_only':'not_enabled'})}
  catch{if(seq===this._notificationSeq22)this.setState({notification22:this.notificationStatus22(),notificationError22:'暂时无法请求权限，可先递交报名。'})}
  finally{if(seq===this._notificationSeq22)this.setState({notificationBusy22:false})}}                                               // L2689 → 原 L4377
```
- 状态枚举：`'default'`（未请求）/ `'granted'` / `'denied'` / `'unsupported'`（非安全上下文或无 `Notification`）；`notificationBusy22` 表示「请求中」。
- 挂载时 `this.setState({notification22:this.notificationStatus22()})`（L218 → 原 L1906）；`hydrate18` 从账本草稿回填 `notificationChoice22:d.notificationChoice||''`、`notification22:d.notificationPermission||''`（L2501）。

### 3.2 文案（vals22 L2808 → 原 L4496）[实现行为]
```js
notificationLabel22:s.notificationBusy22?'请求中':n==='granted'?'已允许通知':n==='denied'?'已拒绝':n==='unsupported'?'暂不支持':'开启提醒',
notificationDisabled22:s.notificationBusy22||n!=='default',
skipNotification22:()=>{this.setState({notificationChoice22:'skipped',notificationError22:''});JuLedger.draft(this.EVENT,{notificationChoice:'skipped'})},
notificationCopy22:n==='granted'?'已允许系统通知，消息提醒暂未开通。请在“我的局”查看邀请。'
  :n==='denied'?'通知权限已关闭。可在浏览器设置中调整，仍可正常报名。'
  :n==='unsupported'?'当前环境不支持系统通知，仍可正常报名并在“我的局”查看进度。'
  :s.notificationChoice22==='skipped'?'稍后再开也可以。请记得在“我的局”查看邀请。'
  :'可允许系统通知；消息提醒暂未开通，请在“我的局”查看邀请。',
```

| 状态 | 按钮标签 | 按钮可用 | 说明文案 |
|---|---|---|---|
| default（未请求） | 开启提醒 | 是 | 可允许系统通知；消息提醒暂未开通，请在“我的局”查看邀请。 |
| default + 已跳过 | 开启提醒 | 是 | 稍后再开也可以。请记得在“我的局”查看邀请。 |
| 请求中 | 请求中 | 否 | （同上一状态） |
| granted | 已允许通知 | 否 | 已允许系统通知，消息提醒暂未开通。请在“我的局”查看邀请。 |
| denied | 已拒绝 | 否 | 通知权限已关闭。可在浏览器设置中调整，仍可正常报名。 |
| unsupported | 暂不支持 | 否 | 当前环境不支持系统通知，仍可正常报名并在“我的局”查看进度。 |
| 请求抛错 | 开启提醒 | 是 | 错误行：暂时无法请求权限，可先递交报名。 |

- **系统权限 vs 提醒服务**：代码只请求浏览器权限；「提醒服务」没有实现（无 Service Worker、无 `new Notification`、无订阅）。区分靠账本字段 `notificationChoice ∈ {'permission_only','not_enabled','skipped'}` 与 `notificationPermission`。评审工具注释：`本机测试验证码，不发送邮件。通知权限、订阅与送达分开；此演示未连接消息或订阅服务。`（review-tools.js L7）→ 提醒服务 [占位或禁用]。
- 「开关」实际改动：仅 `Notification.requestPermission()` 的结果 + 写入**当前活动**的 `r.draft`（localStorage）。没有全局通知偏好，不在设置里。
- 所在位置：报名表第 5 步「别错过邀请」（模板 L361 → 原 L793）：
  `<span class="ju-field-label22">别错过邀请</span> … <div class="ju-bookmark25">6H</div><h3>收到邀请后，<br>为你留<em>六小时</em>。</h3><p class="ju-a2-annotation25">把下一次见面，记在心上。</p><p class="ju-a2-window25">六小时内阅读并确认；超时释放预留。<br>想再参加，可以重新申请。</p><p class="ju-reminder-copy22">{{notificationCopy22}}</p><button class="ju-reminder-enable22" sc-camel-disabled="{{notificationDisabled22}}">{{notificationLabel22}}</button><button class="ju-reminder-skip22">暂不开启</button><p class="ju-form-error" role="status">{{notificationError22}}</p>`
- 递交门槛：`submit18` 要求 `this.state.notificationSeen22`（L2531 → 原 L4219），该标志在卡组动画提交到第 5 步时置真（L2972：`notificationSeen22:this.state.notificationSeen22||(commit&&m.to===4)`）——用户必须**看到**该步，但不必允许通知。
- 样式：`.ju-reminder-enable22,.ju-reminder-skip22{min-height:44px;border:0;border-radius:22px;background:#e8ebfa;color:#4352bb;font:500 15px var(--ju-font-ui)}`、`.ju-reminder-enable22:disabled{color:#5c6478;background:#edf0f7;cursor:default}`、`:active{transform:translateY(1px);background:#dee3f6}`（CSS L234/273 → 原 L281/320）。

---

## 4. 举报 / 信用记录对象模型

### 4.1 账本记录（ju-state.js L9 `create`）
```js
{id:id(e), event:{...e,id,capacity,initialAvailable,version:1,updatedAt}, status:'open', members:[{id:'host',name:e.host,slot:0,status:'confirmed',host:true},…,{id:'you',name:'你',slot:-1,status:'unapplied',deadline:0}],
 history:[], queue:[], application:'unapplied', draft:{}, reportDraft:{text:'',who:'host',shots:[]}, reports:[], attendance:'pending', contactAdded:false, userVersion:1, revision:0}
```
运行中追加：`creditEvents[]`、`objectDrafts{supplement:{[reportId]:text},appeal:{[factKey]:text}}`、`agreementReads26`、`ruleAcceptances[]`、`readReceipt`、`submittedProfile`、`notifications[]`、`attendanceHistory[]`、`proposal`、`ticket/cancelTicket/exitTicket`、`establishedAt/endedAt`。
所有写入经 `commit(e,fn)`（L12）：深拷贝 → 执行 → `save()` 失败则回滚并返回 false（「失败即保留」的根源）。

### 4.2 举报（report）
- 组件草稿 `reportDraft25(r)`（L2885 → 原 L4573）：`{text, who:'host', shots:[{name,size,data(dataURL)}]}`，持久化到 `r.reportDraft`（`JuLedger.reportDraft`）；失败文案 `草稿未保存，内容和截图仍保留，请重试。`（`persistReportDraft25` L2886）。
- 附件（`reportFiles18` L2586 → 原 L4274）：必须 `image/*` 且非空（`不是有效图片`）、≤2,097,152 字节（`超过2MB`）、≤6 张（`最多6张`）、像素 ≤24,000,000（`图片尺寸无效`）、去重；读取失败 `读取失败`/`读取已中止`；切活动中断 → `附件读取已中止，请重新添加尚未完成的截图。`。
- 发送 `sendReport18`（L2607 → 原 L4295）校验 toast（key `'s08'`）：`截图还在处理中，请稍候`、`请重新添加失败截图，或移除失败项后提交`、`请填写至少4字的举报内容`、`请选择举报对象`；草稿持久化失败 → `rep8St:'failed'`；模拟 650ms；评审钩子 `_reportFail19` → `'failed'`（按钮 `重试提交`）；成功 → `JuLedger.report()`，草稿清空，`rep8St:'done'`、`reportId18`。
- 账本对象（ju-state L85）：
  ```js
  report={...clone(data),id:'DEMO-'+now.toString(36).toUpperCase()+'-'+(r.reports.length+1),source:'isolated-mock',status:'accepted',createdAt:now,updatedAt:now,timeline:[{status:'accepted',at:now}],supplements:[]}
  ```
  `data = {text, who(成员 id), whoName, shots[]}`。`allReports()` 附加 `eventId:r.id, eventTitle`，按 `updatedAt` 倒序（L50）。
- 状态推进只有评审工具 `reportAdvance(eventId,reportId,status)`（L86，限 `source==='isolated-mock'`），s08 评审条：`工单处理中 / 工单需补充 / 工单已处理`，注释 `隔离 mock 举报服务：未真实发送；状态仅供演示。` → 状态机 [占位或禁用]，本机存储与 UI [实现行为]。
- 举报 ↔ 活动：挂在 `r.reports`（r.id = 事件 id）；举报 ↔ 人：`who` 为成员 id（`'host'`/`'member-i'`/候补 id），`reportPeople18()` 排除 `'you'`。
- s08 入口文案：textarea placeholder `说说时间、地点和发生的事`，aria `举报详情`、`选择本地截图，最多6张`、`移除附件`；按钮 `提交举报` / `提交中…` / `处理截图中…` / `重试提交`；`＋ 加截图` / `可不加` / `已加 N 张` / `处理中 N 张`；`正在处理 N 张截图，完成后可以提交。`；`移除失败项`（vals25State L2925–2931）。

### 4.3 信用事实（credit fact，ju-state L59–62）
```js
f={key,factIdentity:identity,type,eventId:r.id,accountId:'you',accountSource:'local_prototype_account',ticketVersion:r.event.version,ruleVersion:RULE_VERSION,at:Date.now(),
   status:type==='active_withdrawal'?'recorded':'pending_review',active:true,penalty:null,source:r.fixture?'review_fixture':'local_user_action',...details}
```
- `type`：`active_withdrawal`（撕票后主动退出，`withdrawalScope27:{rule:'ticket_active_withdrawal_4_per_year',eligible:true,…,annualAssignment:'unresolved'}`）、`reservation_released`、`reservation_expired`、`queue_left`、`host_reschedule_declined`、`host_cancelled`（后五者 `excludedFact27`，`eligible:false`）、`absence_reported` / `absence_after_tear`（`attend(e,'absent')`）。
- `status`：`recorded | pending_review | corrected | dismissed | verified`；`penalty` 始终 `null`；`reviewHistory[]`、`appeals[{reason,at,status:'pending_review'}]`、`updatedAt`。
- 同一事实去重：`factIdentity=[r.id,'you',type,type==='active_withdrawal'?'once':r.event.version].join('|')`。
- 年度汇总 `withdrawalSummary27()`（L61）返回 `{annualAllowance:4, annualWindow:null, annualRemaining:null, accountDataComplete:false, …}` → 年度余额**不计算、不展示** [占位或禁用]。
- 评审裁决 `reviewCredit(e,key,decision,reason)`（L69，`verified|dismissed|corrected`）无 UI 入口。

### 4.4 对象草稿（supplement / appeal）
```js
objectKey26(kind,eventId,key){return JSON.stringify([kind,eventId,key])}                                                   // L3038 → 原 L4726
objectDraft26(kind,eventId,key){this._objectDrafts26||={};const id=this.objectKey26(kind,eventId,key);return Object.prototype.hasOwnProperty.call(this._objectDrafts26,id)?this._objectDrafts26[id]:JuLedger.objectDraft(kind,eventId,key);}
editObjectDraft26(kind,eventId,key,text){…this._objectDrafts26[id]=text;this.setState(kind==='appeal'?{creditAppeal22:text,creditMessage22:''}:{supplement19:text});if(!JuLedger.saveObjectDraft(kind,eventId,key,text)){this.toast('s01','草稿未保存，当前内容仍保留，请重试。');return false}return true;}
```
- 账本 `saveObjectDraft`（L46）只接受 `kind ∈ {'supplement','appeal'}`，且目标举报/事实必须存在；成功提交后由 `supplement()`/`appealCredit()` 删除对应草稿。
- 内存层优先于账本层（`hasOwnProperty` 判断），账本写失败时内存仍保留 → 「失败并保留」[实现行为]。

---

## 5. 资料与联系方式

### 5.1 字段、位置、校验 [实现行为]
资料**只在报名表 s03**（五张卡）录入，设置内无资料页。字段头（vals03 `heads` L1075 → 原 L2763，`out['c'+n+'Key']=h.k` L1159）：

| 步 | 标题 `cNKey` | input | 规则（`card3Ok` L435 → 原 L2123） | 错误文案（`cardError26` L3000 → 原 L4688） |
|---|---|---|---|---|
| 01 | 怎么称呼（必填） | aria `你的称呼`，placeholder `比如「阿禾」`，计数 `n/10` | 非空且 `nickLength20 ≤ 10`（`Intl.Segmenter('zh',{granularity:'grapheme'})`），不在合成输入中 | `请填写称呼` / `称呼最多10个字` |
| 02 | 微信号（必填） | aria `你的微信号`，placeholder `填写微信号，不是昵称`，徽标 `必填/已填写`，ⓘ `查看微信可见范围` | `/^[A-Za-z0-9_-]+$/` | `请填写微信号` / `微信号仅填写字母、数字、下划线或短横线` |
| 03 | 捎句话（选填） | aria `给局主的留言`，placeholder `说一句你的口味或相处习惯`，10 组建议词（`noteSetLabel n/10`） | `JuLedger.noteWeight ≤ 40`（CJK/全角计 2） | `留言最多20个汉字或40个英文字母` |
| 04 | 工作／学校邮箱（选填） | aria `验证邮箱`，placeholder `例如 you@nyu.edu`，徽标 `vBadge: s.vDomain||'邮箱验证'` | 为空可跳过；否则格式 `/^[^\s@]+@[^\s@]+\.[^\s@]+$/` 且 `mStep==='ok'` | `请完成邮箱验证，或清空后跳过` |
| 05 | 别错过邀请 | 通知（§3） | — | — |

邮箱验证（`sendCode` L462 → 原 L2150）：免费邮箱黑名单 `MAILFREE=['gmail.com','qq.com','163.com','126.com','outlook.com','hotmail.com','yahoo.com','icloud.com','foxmail.com','me.com','live.com','sina.com']`（L122）→ `请使用工作或学校邮箱`；格式错 → `邮箱格式不正确`；6 位验证码，59s 重发倒计时，5 分钟过期，本机测试码 `String(246809+generation).padStart(6,'0')`（评审按钮 `填入测试验证码`）→ 验证服务 [占位或禁用]。
徽标文案：必填项 `还差这项 / 已填好 / 必填`，选填 `选填`（L1160）。

账本侧 `profileError`（ju-state L29）重复同样规则：`nick`（空或 >10）、`wx`（空或非 `/^[a-zA-Z0-9_-]+$/`）、`note`（>40）、`mail`（有邮箱但未验证）。

### 5.2 存储与可见范围
- 草稿 `formDraft25()`：`{nick,wx,note,mail,verified,domain,notificationChoice,notificationPermission,returnIntent25}`（L2878 → 原 L4566），`refresh18`/`saveCurrentDrafts25` 写入 **当前活动** `r.draft`（`JuLedger.draft`）；失败 toast `草稿未保存，输入仍保留在当前页面` / `草稿暂未保存，当前输入已保留。请稍后再切换活动。`。提交后另存 `r.submittedProfile`。**资料是按活动存的，不是账户级** → 设置若要「我的资料」需新建账户级存储 [不确定：原型无此层]。
- 「我」的资料卡 `meProfile(s)`（L590 → 原 L2278）：`{name:nick||'你', verified:mStep==='ok', handle:'@'+mail 本地部, domain:'@'+域, gender:'', events:0, rep:'新朋友', isYou:true}`。成员资料 Sheet（ju-member.html L133–136）展示字段：`身份验证`（`m.domain || '已验证'` / `未验证`）、`性别`、`来过 N 局`、`信誉`（`m.rep||'新朋友'`）。静态 `PROFILES` 表（L577 → 原 L2265）给局主/成员 `verified/handle/domain/gender/events/rep`。**成员 Sheet 不显示微信号**。
- 规则文案（rules26 `copy.wx`，L6）：`成局后，仅局主可见你的微信。退出、取消或散场24小时后，关闭查看。`；第 13/14 条见 §7。模板 L295（原 L727）ⓘ 按钮展开 `{{wxPolicy26}}` 显示此句。→ 「局主可见成员微信」仅为文案，原型无局主视角 [提案文字]。
- **实际实现的可见性**（成员看局主微信）：
  ```js
  canContact:r=>validTicket(r)&&r.ticketTornVersion===r.event.version&&(!r.endedAt||Date.now()<r.endedAt+86400000),   // ju-state L77
  validTicket=r=>formed(r)&&member(r)?.status==='confirmed'&&r.userVersion===r.event.version;                          // L19
  ```
  条件：已成局、本人 confirmed、票版本一致、**已撕当前版本副券**、未结束或结束后 <24h。退出/拒绝改期/取消时 `contactAdded=false`，票作废使 `validTicket` 为假。**「撕券后 8 小时内联系」只在文案中，无 8 小时计时器**。
  显示账号：`eventWx:this.EVENT.host==='老杨'?'laoyang.ju':'demo.'+this.EVENT.city.toLowerCase()`（sharedVals L775 → 原 L2463）→ [占位或禁用]（示例微信，文案 `…。此处为示例微信。` L2819）。
  出现时序 `contactReveal23`（L2735 → 原 L4423）：账号 300ms 后淡入，按钮 850ms（reduced-motion 均为 0）。
- `addContact18`（L2566 → 原 L4254）：`if(!JuLedger.canContact(r)){toast('s06','联系方式已关闭')}` → `JuLedger.contact` 置 `contactAdded=true`，失败 `本机保存失败，请重试`；标签 `已加微信` → `待赴约`；说明 `(r.contactAdded?'已加微信 · 等这次见面':'撕券后8小时内联系局主')+'。此处为示例微信。'`。

### 5.3 复制到剪贴板与失败处理 [实现行为]
```js
async copyContact21(){…if(!JuLedger.canContact(record)||this._copyBusy21)return;…this.setState({wxCopied:false,contactError20:''});
  try{await navigator.clipboard.writeText(this.renderVals().eventWx);if(current())this.setState({wxCopied:true,contactError20:''});}
  catch{if(current())this.setState({wxCopied:false,contactError20:'复制失败，请长按账号复制'});}finally{if(seq===this._copySeq21)this._copyBusy21=false;}}   // L2524 → 原 L4212
async copyText(t,key,flag){const scene=this._scene19;
  try { await navigator.clipboard.writeText(t);if(scene!==this._scene19)return;this.setState({[flag]:true}); this.toast(key,'微信号已复制'); }
  catch {if(scene!==this._scene19)return; this.setState({[flag]:false}); this.toast(key,'未能复制，请长按微信号手动复制'); } }                                   // L540 → 原 L2228
```
- s06（票根页）用 `copyContact21`：成功标签 `contactCopy20: s.wxCopied?'已复制':'复制'`，图标切换为对勾 path；失败写 `contactError20` 行内错误。s07 旧页用 `copyText`：toast。
- **失败不会误报成功**：catch 分支显式置 false；并以 `scene/route/seq/canContact` 守卫丢弃过期结果。无 `execCommand` 回退。

---

## 6. 活动数据模型与样例

### 6.1 字段（`buildFeed` L101–117 → 原 L1789–1805；`JuLedger.create` L9；`eventProjection` L44）
| 字段 | 来源 | 说明 |
|---|---|---|
| `id` | `city+"|"+pack+"|"+title` | 事件主键；账本 `id(e)` 同算法；评审 fixture 前缀 `demo:v26:<screen>:` |
| `city` | 卡片所属城市（`NYC/BOS/LA/SFO/SEA/CHI`） | `cityOptions`（L3 → 原 L1691）zh/en |
| `pack` | 纸面风格 `invite/street/grain/mono/riso/acid` | 也是 `heroPack` 枚举 |
| `title` / `en` | 中文标题 / 英文副题 | |
| `cat` | 主题 `food/coffee/sports/games/culture/code/walk/night/outdoor/music` | 过滤键 |
| `date`/`wd`/`dateNum` | `'WD MM.DD'`→拆为 `wd`+`date`；`dateNum 'MM-DD-2026'` | `new Date(2026,mo-1,dy)` 本地时区；**无时区字段** |
| `time` | `'HH:MM'` | 24h 文本 |
| `loc` | `'区域-地点'` | |
| `host` | 局主名字字符串 | 无 id |
| `capacity` | `FEED_CAPACITY25[id]`（3–8，含局主） | `seats` 为旧字段，不作容量事实（L6 注释） |
| `joinMode` | `cat==="sports"&&pack==="acid"?"direct":"application"` | 直入 vs 申请 |
| `version` / `updatedAt` / `initialAvailable` / `meeting` / `fee` | 账本补充 | `fee` 未提供 → 规则第 15 条 `这场活动尚未说明费用。` |
| 记录 `status` | `open | cancelled | ended` | |
| 记录 `application`（我的状态） | `unapplied|pending|approved|confirmed|waitlisted|expired|reservation_released|withdrawn|exited|rejected|declined|cancelled` | `phase()` 标签：待审核/已预留/已确认/预留已到期/预留已释放/已退出/这次没留住/未参加/已取消/已结束/待确认新时间/候补第N位 |
| 成员 `status` | `confirmed|invited|applied|expired|reservation_released|withdrawn|exited|declined|rejected|cancelled|unapplied` | 预留期 `SIX=21600000`（6h） |

账本原始活动（ju-state L4）：`{id:'NYC|invite|深夜救急火锅局',city:'NYC',pack:'invite',title:'深夜救急火锅局',en:'HOTPOT RESCUE',wd:'FRI',date:'12.18',dateNum:'12-18-2026',time:'19:30',loc:'法拉盛',host:'老杨',capacity:4,joinMode:'application',seats:1}`（与 feed 行 `loc:'Queens-法拉盛'` 不一致，见 §B）。

### 6.2 样例活动（`FEED_ROWS` L17–99 → 原 L1705–1787；共 76 条；status 默认 `open`，首次 `JuLedger.get` 时建档）
格式：`id` | 日期 时间（2026）| 地点 | 局主 | 容量 | joinMode

**NYC（25）**
- `NYC|street|下班 Coffee Chat 半小时` | 12.17 18:00 | Manhattan-中城 | Nina | 4 | application
- `NYC|acid|菜狗羽毛球拼局` | 12.19 14:00 | Queens-长岛市 | 球球 | 4 | **direct**
- `NYC|invite|深夜救急火锅局` | 12.18 19:30 | Queens-法拉盛 | 老杨 | 4 | application（= 账本 `original`）
- `NYC|grain|川菜辣度分级评审团` | 12.19 18:30 | Brooklyn-八大道 | 麻酱 | 5 | application
- `NYC|riso|漂亮饭 · 只拍不吃派` | 12.21 12:30 | Manhattan-下城 | 鱼丸 | 4 | application
- `NYC|mono|早八摆烂咖啡局` | 12.22 08:30 | Manhattan-东村 | 小满 | 4 | application
- `NYC|grain|产品人瞎聊 Networks` | 12.23 19:00 | Manhattan-中城 | Ivy | 4 | application
- `NYC|mono|跑不动也来 5K` | 12.20 08:00 | Manhattan-上东区 | Ken | 6 | application
- `NYC|street|养生局 · 拉伸半小时` | 12.22 20:00 | Brooklyn-威廉斯堡 | 阿檬 | 4 | application
- `NYC|invite|四缺一 · 别装了` | 12.18 20:30 | Queens-法拉盛 | 阿宽 | 4 | application
- `NYC|riso|狼人杀新手场` | 12.20 19:00 | Manhattan-下城 | 大熊 | 5 | application
- `NYC|acid|桌游店包场 · 随便玩` | 12.26 15:00 | NJ-JSQ | Tin | 4 | application
- `NYC|riso|周末看展搭子局` | 12.20 13:00 | Queens-长岛市 | 蛋挞 | 4 | application
- `NYC|mono|午夜场老电影` | 12.19 23:00 | Manhattan-东村 | 老周 | 4 | application
- `NYC|grain|独立书店逛到关门` | 12.27 16:00 | Brooklyn-威廉斯堡 | 西西 | 4 | application
- `NYC|mono|Vibe Coding 通宵场` | 12.18 21:00 | Manhattan-中城 | Ray | 4 | application
- `NYC|street|自习室拼桌 · 别摸鱼` | 12.21 10:00 | Manhattan-上东区 | Momo | 5 | application
- `NYC|street|SoHo 逛街扫货` | 12.20 14:30 | Manhattan-下城 | Kiki | 4 | application
- `NYC|invite|Vintage 淘货 Citywalk` | 12.27 13:00 | Brooklyn-威廉斯堡 | 阿蒋 | 4 | application
- `NYC|invite|天台小酒 · 看天际线` | 12.19 21:30 | Manhattan-中城 | Leo | 4 | application
- `NYC|acid|蹦到腿软 · 电子场` | 12.26 23:30 | Brooklyn-威廉斯堡 | Cyc | 6 | application
- `NYC|grain|中央公园野餐` | 12.21 11:30 | Manhattan-上东区 | 花卷 | 6 | application
- `NYC|mono|布鲁克林桥夜骑` | 12.18 21:00 | Brooklyn-威廉斯堡 | Bike | 4 | application
- `NYC|riso|Livehouse 站前排` | 12.20 20:00 | Brooklyn-威廉斯堡 | Nono | 4 | application
- `NYC|street|爵士小酒馆蹲一晚` | 12.23 21:00 | Manhattan-东村 | 老K | 4 | application

**BOS（12）**
- `BOS|invite|Allston 麻辣香锅拼桌` | 12.19 19:00 | Boston-Allston | 小林 | 4 | application
- `BOS|grain|东北菜硬核局` | 12.22 18:00 | Quincy-Wollaston | 铁蛋 | 4 | application
- `BOS|riso|Cambridge 早八自习局` | 12.21 08:30 | Cambridge-哈佛广场 | 阿檬 | 4 | application
- `BOS|mono|Back Bay 咖啡瞎聊` | 12.26 15:00 | Boston-后湾 | Yuki | 4 | application
- `BOS|acid|MIT 体育馆羽毛球` | 12.20 16:00 | Cambridge-中央广场 | Sam | 4 | **direct**
- `BOS|invite|麻将三缺一` | 12.18 20:00 | Boston-Allston | 老陈 | 4 | application
- `BOS|riso|美术馆免费夜` | 12.24 18:30 | Boston-后湾 | Lulu | 4 | application
- `BOS|mono|Hackathon 前夜赶工` | 12.19 21:00 | Cambridge-哈佛广场 | Neo | 5 | application
- `BOS|street|Newbury 街扫货` | 12.20 13:30 | Boston-后湾 | Mia | 4 | application
- `BOS|acid|学生场 Club` | 12.26 22:30 | Boston-Allston | Dee | 6 | application
- `BOS|grain|查尔斯河边散步` | 12.20 15:30 | Boston-后湾 | Yuki | 4 | application
- `BOS|riso|小场地 Indie Gig` | 12.23 20:00 | Boston-Allston | Ada | 4 | application

**LA（12）**
- `LA|grain|Arcadia 半夜烤肉` | 12.18 22:00 | SGV-Arcadia | 阿宽 | 4 | application
- `LA|invite|Koreatown 豆腐汤` | 12.21 19:00 | LA-韩国城 | Jae | 4 | application
- `LA|mono|西好莱坞 Vibe Coding` | 12.23 19:00 | LA-西好莱坞 | Tin | 4 | application
- `LA|street|Pasadena 晴天咖啡` | 12.20 10:30 | Pasadena-Old Town | Cleo | 4 | application
- `LA|acid|Santa Monica 慢跑` | 12.20 07:30 | Santa Monica-海滨 | Ray | 5 | **direct**
- `LA|mono|攀岩馆抱石` | 12.22 18:30 | Pasadena-Old Town | Ben | 4 | application
- `LA|riso|桌游 + 披萨` | 12.19 19:30 | SGV-Arcadia | 小鹿 | 5 | application
- `LA|riso|Getty 看展` | 12.27 13:00 | Santa Monica-海滨 | Mimi | 4 | application
- `LA|street|Melrose 淘 Vintage` | 12.26 14:00 | LA-韩国城 | Zoe | 4 | application
- `LA|invite|天台落日酒` | 12.19 18:30 | Santa Monica-海滨 | Sol | 4 | application
- `LA|grain|Runyon 徒步看日出` | 12.21 06:30 | Pasadena-Old Town | Hux | 6 | application
- `LA|acid|Echo Park 小型 Gig` | 12.24 20:30 | LA-韩国城 | Rae | 4 | application（music+acid，非 direct）

**SFO（10）**
- `SFO|invite|Milpitas 老火锅夜` | 12.18 20:00 | South Bay-Milpitas | 汤圆 | 4 | application
- `SFO|grain|Sunset 粤菜早茶` | 12.20 10:30 | SF-Sunset | 阿珍 | 4 | application
- `SFO|mono|湾区周末 Build 局` | 12.19 10:00 | South Bay-Palo Alto | Ken | 4 | application
- `SFO|street|Oakland 咖啡瞎聊` | 12.22 16:00 | East Bay-Oakland | Nia | 4 | application
- `SFO|acid|羽毛球俱乐部` | 12.21 18:00 | South Bay-Milpitas | Wei | 4 | **direct**
- `SFO|riso|剧本杀中文场` | 12.26 19:00 | South Bay-Milpitas | 小鱼 | 5 | application
- `SFO|riso|SFMOMA 慢慢看` | 12.27 13:30 | SF-Sunset | Lin | 4 | application
- `SFO|street|Union Square 扫货` | 12.20 14:00 | SF-SOMA | Coco | 4 | application
- `SFO|invite|天台看湾区夜景` | 12.19 21:00 | East Bay-Oakland | Van | 4 | application
- `SFO|grain|Lands End 海边走` | 12.21 11:00 | SF-Sunset | Bo | 5 | application

**SEA（9）**
- `SEA|invite|中国城打边炉` | 12.19 19:00 | Bellevue-Downtown | 阿海 | 4 | application
- `SEA|grain|西雅图三文鱼局` | 12.22 18:30 | Seattle-U District | Kai | 4 | application
- `SEA|street|雨天咖啡摆烂局` | 12.19 16:00 | Bellevue-Downtown | 西西 | 4 | application
- `SEA|mono|Redmond 早八自习` | 12.21 08:00 | Redmond-Overlake | Ann | 4 | application
- `SEA|acid|室内羽毛球` | 12.20 17:00 | Redmond-Overlake | Jun | 4 | **direct**
- `SEA|riso|Capitol Hill 桌游` | 12.26 19:30 | Seattle-Capitol Hill | Momo | 5 | application
- `SEA|street|Capitol Hill 逛唱片店` | 12.20 14:00 | Seattle-Capitol Hill | Momo | 4 | application
- `SEA|invite|小酒馆听黑胶` | 12.23 21:00 | Seattle-Capitol Hill | Ola | 4 | application
- `SEA|grain|Discovery Park 徒步` | 12.21 10:00 | Seattle-U District | Fern | 6 | application

**CHI（8）**
- `CHI|grain|中国城暖锅局` | 12.19 18:30 | Chicago-中国城 | 老周 | 4 | application
- `CHI|invite|深盘披萨挑战` | 12.21 19:00 | Chicago-Loop | Max | 4 | application
- `CHI|mono|Loop 早八咖啡` | 12.22 08:30 | Chicago-Loop | Iris | 4 | application
- `CHI|acid|室内篮球半场` | 12.20 16:00 | Evanston-NU | Duke | 5 | **direct**
- `CHI|riso|麻将 + 夜宵` | 12.18 20:00 | Chicago-中国城 | 阿玲 | 4 | application
- `CHI|riso|美术馆免费日` | 12.27 13:00 | Chicago-Loop | Sun | 4 | application
- `CHI|invite|爵士老酒馆` | 12.23 21:00 | Chicago-Lincoln Park | Ray | 4 | application
- `CHI|grain|湖边暴走` | 12.20 11:00 | Chicago-Lincoln Park | Bea | 5 | application

ID 映射提示：收藏键 `city|title` 可由事件 id 去掉中段得到；反向需查 feed。`restoreRoute25` 用 `?event=<id>` 查 `JuLedger.lookup(eventId)` 或 feed（L2915），找不到 toast `这条活动记录不在本机，请从列表重新选择。`。

---

## 7. 规则文本

### 7.1 正式约定 `JuRules26`（rules26.js，原文件 L38 data-URI）
- `VERSION='JU-27-agreement-1'`；类别：`confirm 确认 收到邀请，读完再点头。` / `credit 信用 承诺之后，及时回应。` / `attend 赴约 把联系与见面安排好。`
- `copy`（L5–12，逐字）：
  - `wx`: `成局后，仅局主可见你的微信。退出、取消或散场24小时后，关闭查看。`
  - `reservationExit`: `你还未确认参加。退出后释放预留，不记主动失约，也不消耗票根主动退出机会；想再参加，需重新申请。`
  - `ticketExit`: `确认后释放席位、作废票根并关闭联系方式，记为主动退出。同一账户每年共4次，跨活动、未撕和已撕票共用；接受改期后再主动退出也计入。`
  - `rescheduleDecline`: `这是局主改期。退出后释放席位并作废票根，不记你的主动失约，也不消耗主动退出机会，旧票不恢复。`
  - `creditRecord`: `记录、核实、认定、处理与更正分别显示。举报不等于违规；主动告知轻于未告知后经核实的缺席。`
  - `creditBoundary`: `同一账户每年共4次票根主动退出机会，跨活动、未撕和已撕票共用，接受改期后再退出也计入。确认前放弃预留或预留到期、纯候补退队、拒绝改期、局主取消不消耗。不凭举报或计时自动处罚。`
- 18 条 `rules(r)`（L16–35）标题逐字：01 收到邀请，才开始留位 / 02 六小时内，读完再确认 / 03 全员确认，才成局出票 / 04 撕开票根，再联系赴约 / 05 确认参加，就是承诺 / 06 去不了了，请主动退出 / 07 没告知、没赴约，要核实 / 08 故意缺席，有信用后果 / 09 退出额度与失约，分开看 / 10 失约认定，要看具体事实 / 11 安排变化，不算主动失约 / 12 先核实，再处理；有错可改 / 13 撕开有效票，再联系 / 14 联系方式，有查看期限 / 15 先看费用，再决定参加 / 16 见面前核对，现场守边界 / 17 改期重新选，取消不算失约 / 18 发生问题，写清具体事实。与设置直接相关的正文：
  - 12：`记录、核实、认定、处理、申诉与更正各自留痕。结合双方说明、当次有效安排、出席及联系证据判断；举报不成立、出席更正或申诉成立时，同步更正事实、次数和处理。同一事实不重记；异议到“设置→信用记录→补充与申诉”。`
  - 13：`成局后，仅局主可见你的微信。撕开有效副券后，可查看局主微信，并在8小时内联系。已接受改期且已撕的同版票，重开时不用再打印或重撕；“已加微信”不代表对方回复或你已到场。`
  - 14：`退出、拒绝改期或局主取消后，票和联系入口失效；正常散场24小时后关闭联系查看。改期先答复，失效旧票不能查看联系方式；不向其他成员公开。`
  - 18：`在散场页点“举报”；到“设置→帮助与反馈→我的举报”查询或补材料，信用异议到“设置→信用记录→补充与申诉”。写清时间、行为和证据，避免人身评价；现场遇险先求助。`
- `policy`（L14）：`{version,status:'approved-directions-with-pending-details',direction:'同一账户跨活动每年共4次票根主动退出机会，未撕、已撕及接受改期后主动退出共用。现场水局每年一次；撕票根后再水局半年一次；超限封号。主动告知的处理轻于未告知后经核实的缺席。',activeWithdrawal:{annualLimit:4,scope:'account-across-events',sharedTicketStates:['untorn','torn','reschedule_accepted'],excluded:[…],calendarOrRolling:null,timeZone:null,effectiveAt:null,…},parameters:{…appealWindow:null,…},automaticEnforcement:false}`。
- 候补文案 `queueDoorHint26: q.state==='waiting'?'轮到后需在6小时内确认。':'候补尚未留位，按加入顺序邀请。'`（L3044）。

### 7.2 实现与文案对照
| 主题 | 实现（代码） | 文案 | 标签 |
|---|---|---|---|
| 预留 6 小时 | `SIX=21600000`，`deadline=now+SIX`，`expireRaw` 到期释放并补位 | 第 01/02 条、`6H` 卡 | [实现行为] |
| 联系 | `canContact` = 有效票 ∧ 已撕当前版 ∧（未结束 ∨ 结束 <24h） | `撕开副券后8小时内联系局主` | 24h [实现行为]；8h [提案文字] |
| 退出次数 4/年 | `annualAllowance:4` 常量；`annualWindow:null`、`annualRemaining:null`；无计数拦截 | `同一账户每年共4次…` | 记录事实 [实现行为]；计次/限制 [占位或禁用] |
| 年度窗口 | `calendarOrRolling:null` | P1 提案自然年 | [提案文字] |
| 时区 | 无字段；`new Date(y,m,d)` 本地 | P2 提案 IANA 时区默认 America/New_York | [提案文字] |
| 申诉期限 | 无；`appealWindow:null` | P7 提案 30 天 | [提案文字] |
| 处理方式 | `penalty:null`，`automaticEnforcement:false`，`reviewCredit` 仅评审 | P4/P5/P6 | [提案文字] |
| 重新参加资格 | `['exited','declined']` 永久拒绝再入（`queueAdmission`/`apply`） | `本次已退出；重新参加资格尚未开放，请另选活动。` | [实现行为]（硬拒） |

### 7.3 7 项待决策方案（原文件 L464–473，`JU-27-policy-proposal-1`）[提案文字]
声明：`以下为可审阅推荐，不是生效规则。当前年度配置仍为空，自动处罚关闭；没有完整账户数据与已批准年度口径时，不展示年度余额。`
- P1 年度窗口：`采用自然年，窗口为账户政策时区每年1月1日00:00起至次年1月1日00:00前；以成功退出事实的服务器时间归属年度。`（受影响：账户年度统计、退出确认可用次数、**设置年度分组**、跨年与临界退出用例）
- P2 时区：`账户首次启用本政策时固定一个 IANA 政策时区；本原型的推荐默认值 America/New_York。退出事实保存 UTC 时间及当时政策时区/窗口ID；旅行或切换活动城市不改变既有年度归属。改时区只对下一自然年生效。`
- P3 启用日期与历史迁移：`在正式公告的生效日启用新政策；只将生效后、可证明为真实票根主动退出且具完整账户/活动/事实ID的记录纳入正式用量。旧记录保留原规则版本；资料不完整的旧退出单列历史事实，不补推次数。评审fixture永不纳入真实账户统计。`
- P4 第1至4次内的处理：`推荐记录主动退出并使用一次机会，不因该主动退出本身扣分、限制参加或封号；…`
- P5 第5次及以后：`始终允许立即退出、释放席位和作废票。推荐记录“超出年度机会，待核实”并引导可选原因说明；在明确处罚方案获批准、已通知用户且完成核实前，不自动扣分、不自动封号、不拦截退出。…`
- P6 与旧缺席类别重叠：`为每次活动建立唯一事实ID，…一事实至多一次处理。保留已定“现场水局每年一次、撕票后再水局半年一次、超限封号”的方向，…`
- P7 更正与申诉：`更正追加到原事实ID，保留操作者、时间、理由、前后状态；有效退出事实撤销后重算原年度用量…推荐自处理通知送达起30天允许申诉，涉及事实性错误保留随时补充入口；期限仍须批准。`

---

## 8. 外观 / 减少动态 / 持久化

- **皮肤/主题/深色**：无。`heroPack` prop 枚举 `invite|street|grain|mono|riso|acid`（x-dc `data-props`）是**卡片纸面**而非用户皮肤；页面背景为 WebGL「Cotton Candy」水面（`./cotton-bg.js`，shadergradient 移植）与评审画布暗底 `#0A0502`，product 底 `#f2f4fd`。无 `prefers-color-scheme`。→ 外观设置 [占位或禁用]（不存在）
- **prefers-reduced-motion**：
  - CSS 全局（L24–26 → 原 L71–73）：`@media (prefers-reduced-motion:reduce){*{animation-duration:1ms!important;animation-delay:0ms!important;animation-iteration-count:1!important;transition-duration:80ms!important;transition-delay:0ms!important}}`；另 `.ju-swipe-rail:after{animation:none}`（L153）、`.ju-reminder-paper22{animation:none}`（L241）。
  - JS：`otpReduced(){return !!(window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches)}`（L478 → 原 L2166），用于 OTP 弹入、翻卡 `prepareCard26.reduced`、`contactReveal23` 延时 0、`spin` 阶段；film `reduced.matches` 使 favX 瞬时；ju-member `this._rm` 关闭 `juSheet` 动画；ju-tickets2 `reduced`。无用户内开关 → 跟随系统 [实现行为]。
- **存储键（全部）**：
  - `localStorage['JU_V26_EVENTS_1']`：`records` 全表（ju-state L3/L8），每次 `commit` 整体 `JSON.stringify` 写回，失败回滚。
  - URL：`?event=<eventId>&ticket=<version>[&intent=waitlist]#<screen>`，`history.state={ju25:true,eventId,ticketVersion,screen}`（`writeRoute25` L2914 → 原 L4602）；`?view=product|review`（内联 L2）。
  - 无 `sessionStorage`、无 IndexedDB、无 cookie、无 Service Worker。
  - 内存级：`favs`、`_formDrafts25/_formSteps25/_reportDrafts25/_objectDrafts26`、`_initial19`。
  - 全局：`window.JU_APP`、`JU_REVIEW_SYNC`、`JU_SCALE_APPLY`、`JU_CARD_DATA`、`__juStandaloneFiles/__resourceBlobs/__resources/__juStandaloneReady`、`JuLedger`、`JuRules26`、`JuFilm`、`JuPaperModel`。

---

## 9. 值得保护的视觉与动效语言

- **字体栈**：`:root{--ju-font-ui:'Noto Sans SC','Microsoft YaHei','PingFang SC',sans-serif;--ju-title-size:30px;--ju-meta-size:14px;--ju-action-height:48px}`（CSS L2 → 原 L49）；`body,.ju-phone{font-family:var(--ju-font-ui)}`；标签/徽标/toast/句柄用 `'Space Mono',monospace`（10–13px，letter-spacing .04–.24em）；大数字 `'Archivo'`（`.ju-reminder-time22 font:500 92px/.95`）。设置列表项硬编码 `font:17px 'Noto Sans SC'`。
- **核心色**：墨 `#14161F`；正文 `#252b3a`、次级 `#535b70/#535969/#626777/#646a7b`、辅助 `#677085/#60697c`；主色 `#4553BE`（选中 tab、状态字 `#4555bb`）、`#4352bb/#4352BB`（文字按钮/链接）、`#5361dc`（进度、选中圆点、芽色 `#4957b5/#5361c5`）、`#4A5AD6`（焦点环、字段标签、caret、`a`）；错误 `#DA3A52`/`#a32b3e`/`#ad3449`；成功 `#0E9B76`；分隔线 `#d5d9e6/#cfd5e3/#c6cde0/#cdd2df`；玻璃面 `rgba(255,255,255,.72–.95)+blur(14–30px)`；选区 `#c6cdf5/#202642`。蓝 CTA：`backgroundColor:'#8DB1F2'` + 多层径向渐变（`blueCta` 脚本 L176–182 → 原 L1864–1870），禁用 `rgba(20,22,31,0.055)`/`#626777`；墨 CTA `#14161F`/`#F8F9FF`，红 `#DA3A52`/`#FFF0F3`（`inkCta`）。
- **标题/按钮关系**：`title20()={fontFamily:var(--ju-font-ui),fontSize:30,fontWeight:500,lineHeight:1.25,letterSpacing:0,color:'#14161f'}`，`meta21()={fontSize:14,fontWeight:400,lineHeight:1.5,color:'#535b70'}`（L2526–2527 → 原 L4214–4215）；根面板 `.ju-root-sheet h1{color:#252b3a;font-size:30px;font-weight:500;margin:12px 0 28px}`；主按钮 48px 胶囊 `width:min(100%,280px)`，字 15px/500；次按钮 `.ju-paper-action{height:44px;min-width:112px;font:500 15px}` 文字蓝；行高 44px 最小触控（返回、ⓘ、链接）。
- **页面切换**：product 视图下屏幕切换 = `html[data-view="product"][data-screen="sXX"] #sXX{display:flex!important}`（CSS L9），**无推入/弹出过渡**；tab/设置子屏切换为 `sc-if` 直接重渲染，无动效 → 设置的「层级进入/返回」目前为瞬切 [实现行为]。
- **Sheet**：成员 Sheet 开 `juSheet .42s cubic-bezier(.17,.89,.24,1)`，关 `transform .3s cubic-bezier(.4,0,.92,.5)`，拖放回 `.44s cubic-bezier(.18,.92,.26,1.02)`，遮罩 `rgba(12,14,26,.30)` `.28–.34s`；`juSheetDrop .42s cubic-bezier(.2,.9,.3,1.04)`；约定面板切类 `550ms cubic-bezier(.16,1,.3,1)`，B5 面板就绪 1730ms；成员关闭回焦 340ms。
- **入场**：`juRise .6–.8s cubic-bezier(.16,1,.3,1)`、`juCtaIn .5–.55s cubic-bezier(.2,.9,.3,1)`、`juReminder22 .65s ease-out`、`juFieldError .18s ease-out`。
- **Toast**：`animation:juToast .3s ease`，`bottom:100–122px`，`background:rgba(16,18,30,0.92)`，`color:#F8F9FF`，`font-size:11.5–13px`，`padding:12px 18px`，`border-radius:12px`，Space Mono `.04em`，`box-shadow:inset 0 0 0 1px rgba(255,255,255,0.1),0 20px 44px rgba(0,0,0,0.6)`（模板 L118 → 原 L550）；自动消失 **2600ms**（`toast()` L539 → 原 L2227）。
- **常用缓动（出现次数，CSS+主逻辑）**：`cubic-bezier(.22,.9,.3,1)`×12、`(.2,.9,.3,1.04)`×12、`(.2,.9,.3,1)`×11、`(.16,1,.3,1)`×8、`(.2,1.4,.36,1)`×5、`(.18,1.5,.36,1)`×3、`(.22,.86,.24,1)`×3、`(.2,.86,.24,1.02)`×3。
- **按压反馈**：模板属性 `style-active="transform:scale(.958)"`×17、`scale(.9)`×11、`scale(.94);opacity:.5`×10、`scale(.97)`×5、`opacity:.5`×3；`.ju-reminder-enable22:active:not(:disabled),.ju-reminder-skip22:active{transform:translateY(1px);background:#dee3f6}`；`[role="button"]{-webkit-tap-highlight-color:transparent}`；焦点 `:focus-visible{outline:2.5px solid #4A5AD6;outline-offset:3px}`。**无 `navigator.vibrate`/haptics**。
- 既有效果模块（仅列名，不展开）：打印出纸 `ju-print`、撕券 `ju-tear`、焚烧 `ju-burn`/`ju-nativeburn`、盖章 `ju-stamp`、票根墙 `ju-tickets2`、信封 `ju-envelope`、雾膜 `ju-mist`、光膜卡轮 `ju-paper-film`、水面背景 `cotton-bg`。

---

## 10. 占位 / 禁用 / 边界声明

| 项 | 位置 | 证据 | 标签 |
|---|---|---|---|
| 开局 tab 为导航占位 | 模板 L64（原 L496）、L113；`pressOpen` L928 | `原型边界：开局为导航占位…`；`开局流程不在本离线演示中`；无 `rootCreate18` 分支 | [占位或禁用] |
| 消息提醒服务 | vals22 L2808；review-tools L7 | `消息提醒暂未开通`；`此演示未连接消息或订阅服务` | [占位或禁用] |
| 申诉审核 | vals26State L3047 | `申诉说明已保存本机，尚未提交审核服务。` | [占位或禁用] |
| 举报服务 | ju-state L85–86；review-tools L7 | `source:'isolated-mock'`；`隔离 mock 举报服务：未真实发送；状态仅供演示。`；模板 L64 `举报仅保存本机` | [占位或禁用] |
| 示例微信 | sharedVals L775；vals23 L2819 | `'laoyang.ju'`/`'demo.'+city`；`此处为示例微信。` | [占位或禁用] |
| 邮箱验证 | sendCode L462；模板 L64 | 本机测试码；`邮箱验证由画布测试事件触发` | [占位或禁用] |
| 费用/地址/时长 | 模板 L64；rules 第 15 条 | `活动费用、完整集合地址与时长尚未提供。`；`这场活动尚未说明费用。` | [占位或禁用] |
| 重新参加资格 | ju-state L32/L71；L3037 | `本次已退出；重新参加资格尚未开放，请另选活动。` | [占位或禁用]（硬拒） |
| 年度余额/窗口/时区/申诉期限 | ju-state L61；rules26 L14 | `annualWindow:null`…`automaticEnforcement:false` | [占位或禁用] |
| `inert` 用法 | filmSync L657（空列表 canvas）；sync18Access L2518（表单步、门、阅读面、撕券）；L2798（联系入口 `data-contact-reveal23/action23`）；约定面板 L3059；review-tools L9（非活动屏整机 `inert`） | 均为可达性门控，不是功能禁用 | [实现行为] |
| `sc-camel-disabled` | 通知按钮（L361）、重发验证码（L348）、举报提交/输入（L935/940）、候补确认（L978） | 条件禁用 | [实现行为] |
| `TODO/FIXME` | 主逻辑、账本、规则 grep | 0 处 | — |
| `toFind18` | L2640 | 定义但未见模板绑定 | [不确定] |
| 评审专用 | `resetScreen19` 仅 `data-view==='review'`；fixture id `demo:v26:*`；`personalHistory`/`withdrawalSummary27` 排除 fixture | | [实现行为] |

---

## A. 设置必须承接的职责清单

| 职责 | 现有入口 | 现有实现程度 | 代码位置（原文件行） |
|---|---|---|---|
| 底部 tab「设置」与根面板标题 | #s01 `.ju-main-nav` → `root18='settings'`，标题 `设置/信用记录/帮助与反馈/我的举报/举报进度` | 实现（瞬切、无 URL） | L4327 `rootTabs18`；L4326 `rootTitle18`；模板 L545；CSS L248 |
| 子屏返回链 `detail→reports→help→home`、`credit→home` | `.ju-settings-back ←` | 实现 | L4330 `settingsBack19`；CSS L230 |
| 信用记录列表（跨活动） | 设置首页 `信用记录 ›` | 实现（本机账本） | L4494 `openCredit22`；L4733 `allCredit22`（vals26State 生效）；ju-state L59–65 |
| 补充与申诉（含草稿恢复、失败保留） | 信用记录条目 `补充与申诉` → textarea → `保存说明` | 存储实现；审核 mock | L4729 `selectCredit26`；L4735 `sendCreditAppeal22`；L4726–4728 对象草稿；ju-state L46/L70 |
| 帮助与反馈入口 | 设置首页 `帮助与反馈 ›` | 仅一行子入口 | L4330 `openHelp19` |
| 我的举报列表 | `帮助与反馈 → 我的举报 ›`；散场页 `查看进度` 深链 | 实现（mock 状态） | L4330 `openReports19/reportRows19`；L4258 `showReports19`；L3531 `openReportQuery19`；模板 L1380 |
| 举报进度详情（状态、对象、正文、截图新窗、编号、时间线、补充列表） | 列表行点击 | 实现 | L4259 `selectReport19`；L4260–4272 `openReportImage27`；L4330 report* 绑定 |
| 补充材料（仅 `needs_info`，草稿保留，提交后转 `处理中`） | 详情页 `补充材料`/`提交补充` | 实现 | L4734 `setSupplement19/sendSupplement19`；ju-state L87 |
| 通知权限状态与文案（default/请求中/granted/denied/unsupported/skipped） | 报名表第 5 步，设置内**无** | 系统权限实现；提醒服务未实现 | L4376–4377；L4496；模板 L793 |
| 收藏（键 `city|title`、右加左删、82px 阈值、会话级） | 找局卡轮横滑 / 方向键；`收藏` pill | 实现，无持久化；设置内**无**管理入口 | L2309–2313；L2353–2360；L2536–2615；film L538–557 |
| 资料（称呼/微信/捎句话/邮箱验证） | 报名表 s03；设置内**无** | 按活动草稿实现；非账户级 | L2763 heads；L2123 `card3Ok`；L4688 `cardError26`；L4566 `formDraft25`；ju-state L29 |
| 微信可见范围与复制 | 票根页（撕券后）；ⓘ 文案 | 成员看局主实现（24h 关闭）；局主看成员仅文案 | ju-state L77 `canContact`；L4212 `copyContact21`；L2228 `copyText`；rules26 L6 |
| 规则/约定正文与版本号 | 票根页「参加约定」B5 面板；信用记录顶部说明 | 实现（阅读进度记账） | L4749 `vals26Agreement`；L4740–4748；rules26 全文 |
| 外观/减少动态 | 无入口；跟随系统 | 无用户设置 | CSS L71–73；L2166 `otpReduced` |
| 本机数据/存储 | 无入口 | 单 key `JU_V26_EVENTS_1` | ju-state L3/L8 |

## B. 开放问题 / 冲突

1. **收藏键 ≠ 事件 id**：`favs[city|title]` 省略 `pack`，事件 id 为 `city|pack|title`；若设置要列出/同步收藏，需决定以哪一个为主键，并处理潜在撞键（样例无撞键）。
2. **收藏无持久化**：刷新即失；设置若承接「我的收藏」需新增存储（账本之外或新 key），并决定是否随 `JU_V26_EVENTS_1` 同步失败回滚语义。
3. **资料按活动存储**（`r.draft`/`r.submittedProfile`），没有账户级资料；设置「我的资料」要么汇总最近一次草稿，要么新建账户对象 —— 原型未定。
4. **通知**：无全局偏好；`notificationChoice` 存在每个活动草稿里。设置若做开关，只能展示浏览器权限状态与「提醒服务未开通」，且 `denied` 后代码不能再请求（只能提示去浏览器设置）。
5. **微信可见性方向冲突**：文案说「仅局主可见你的微信」，实现是「成员在撕券后看局主示例微信」；成员微信（`draft.wx`）从未在任何 UI 展示。
6. **8 小时联系窗口**只在文案，`canContact` 只实现 24 小时散场关闭；是否在设置/票根加计时需决策（P 文案第 11 条明说「不自动关闭」）。
7. **年度窗口/时区/申诉期限/处理方式**全部 `null` 且未批准（P1–P7）；设置若显示「年度剩余次数」会与 `withdrawalSummary27.annualRemaining:null` 冲突，应显示「未启用」。
8. **vals 覆盖的旧文案仍在源码**（`请填写说明；若保存失败，请重试。`、`补充未提交，请检查内容后重试`、vals25State 中 `appeal` 不恢复草稿的版本）——继承时必须按生效版本（vals26State）而不是首次出现。
9. **设置层级没有 URL/history**，浏览器返回会退出到上一活动路由而不是上一子屏；是否纳入 `writeRoute25` 需决策。
10. **`original.loc='法拉盛'` 与 feed `Queens-法拉盛` 不一致**（同一 id）；账本建档时 `create(e)` 以传入对象为准，先打开哪一边决定存储值。
11. 举报对象是成员 id（`host`/`member-i`/候补 id），跨活动不唯一；设置列表只显示 `whoName`。
12. 时间显示用 `toLocaleString('zh-CN')`（浏览器时区），事件日期用本地 `new Date(2026,…)`；没有统一时区策略。
13. `settingsBack19` 从 `credit` 直接回 `home`，而 `detail` 两级返回——层级深度不对称；设置若新增子屏需明确映射表而非链式三元。
14. 设置面板寄生在 #s01（toast key `'s01'`、`.ju-root-sheet{inset:0 0 108px}` 让出导航高度）；独立模块需自带 toast 容器与底部安全区。

## C. 本提取未能核实的项

- `toFind18` 是否被任何模板绑定（grep 模板 0 次；可能为死代码）。
- `ju-card.html`（JuCardV2 组件）内部是否有与收藏/资料相关逻辑：grep `收藏|wx` 为 0，未逐行阅读其 23 KB。
- `ju-paper-film.js` 中 `hitCenter` 的精确命中区域（只确认函数存在于 L517 与 `canFav` 依赖）。
- 评审视图 `data-view=review` 下 `.ju-root-sheet` 的实际可见性/布局（只在 product 视图核对 CSS 变量）。
- `Notification.requestPermission()` 在 iOS/PWA 外的真实行为（代码以 `isSecureContext` 与 `'Notification' in window` 判 unsupported，未做 UA 分支）。
- 20 MB 资产字典中除字体、`ju-card.html`、`ju-member.html`、`cotton-bg.js` 外是否还有别名 `./JuCardV2.dc.html`、`./JuMemberSheet.dc.html` 的差异内容（仅确认为别名映射）。
- 主逻辑中 `vals03`（L1033–1347）、`vals05`、`vals09` 等与设置无直接关系的大段未逐行阅读；其中若存在设置相关键名（grep 已覆盖 `settings|notification|fav|wx|nick|mail|credit|report` 前缀）则已纳入。
- 账本 `records` 在 `JU_V26_EVENTS_1` 超过 localStorage 配额时的具体用户提示路径（只核实到 `commit` 回滚与各处 `本机保存失败，请重试` 类 toast）。

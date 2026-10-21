# R3 提取 · 「设置」模块承接依据（extract-r3-settings.md）

> 来源（只读）：`/root/.claude/uploads/4330fea6-5730-5810-9ae8-18088dd29e6e/9777fff8-JU-R3-Visual-Motion.html`（24,075,113 字节，86,888 行）。
> 代码分布：第 1 行 19.3 MB（字体/贴图 base64 + 第一段 CSS），第 2–1760 行 CSS，`<script data-bundled-source=...>` 块：
> `vendor/cotton-bg.js` 81401–81440 · `vendor/v17-skins.js` 81440–82961 · `v17-data.js`+`state.js` 82961–82999 · `vendor/ju-paper-film.js` 83001–83660 · `vendor/ju-envelope.js` 83810–84054 · `v27-shared.js` 84054–84187 · `header.js` 84187–84206 · `form-motion.js` 84206–84306 · `discovery.js`（`V27_DISCOVERY_HTML`）84307 · `vendor/ju-tickets-host.js` 84320–84677 · `skin-previews.js` 86165 · `r2-motion.js` 86166–86189 · `r2-suggestions.js` 86189–86219 · `r2-regions.js` 86219–86289 · `r3-motion.js` 86289–86310 · `app.js` 86310–86888。
> `data-bundled-source` 只是打包标记，不证明存在独立文件。
> 标签：[实现行为] 代码真的这样跑 · [占位或禁用] 有字段/DOM 但无行为或被禁用 · [提案文字] 仅文案/注释 · [不确定] 未能完全核实。
> 行号 = 源文件行；偏移 = 字节偏移（`grep -b`）。所有函数均核对为最终生效定义（未发现后续重定义）。

---

## 1. `openSettings` 与 `setSkin`（「设置」入口 = 仅背景选择）

### 1.1 入口 [实现行为]
- 唯一入口：s01（看见局）底部主导航的「设置」按钮。`app.js` `renderHome` 尾部（行 86423，偏移 23978221）：
  ```js
  $('.ju-main-nav [aria-label="设置"]').onclick=()=>openSettings();
  ```
- 主导航来自 V27 快照 `V27_DISCOVERY_HTML`（行 84307）：四个按钮 `aria-label` 为「找局」「开局」「我的局」「设置」（图标 = 齿轮路径 `M9 3h6l1 3 3 1 2 5-2 5-3 1-1 3H9…`）。
- 路由表（行 86314）没有设置路由：`s01 看见局 / s02 想开局 / s03a 挑张脸 / s04 双卡 / s05 发出去 / s06 能确认 / s08 计划有变 / s09a 会出现 / s09b 归档墙`。设置是一个 modal sheet，不是页面。

### 1.2 `openSettings`（app.js 行 86429–86432，偏移 23979145）[实现行为]
```js
function openSettings(){
  const skins=[['cotton','Cotton Candy','棉糖'],['halo','Halo','光晕'],['sunset','Sunset','落日']];
  openModal('背景',`<div class="skin-choices">${skins.map(([id,name,zh])=>`<button class="skin-choice" data-skin="${id}" aria-pressed="${H.state.skin===id}"><span class="skin-preview" data-preview="${id}"><img src="${window.JU_SKIN_PREVIEWS?.[id]||''}" alt="${zh}背景静态预览"></span><span class="skin-caption"><strong>${zh}</strong><span>${name}</span></span><span class="skin-selected" aria-hidden="true">${icon('check',18)}</span></button>`).join('')}</div>`,'',sheet=>{$$('.skin-choice',sheet).forEach(b=>b.onclick=()=>{if(setSkin(b.dataset.skin)!==false)closeModal()})});
}
```
- Sheet 标题是「背景」，不是「设置」。内容只有三张皮肤卡；无其它设置项。
- 预览图：`window.JU_SKIN_PREVIEWS={cotton:'data:image/png;base64,…',halo:…,sunset:…}`（`skin-previews.js` 行 86165，244 KB 静态 PNG）。
- 选中态：`aria-pressed`，CSS `.skin-choice[aria-pressed=true]{border-color:var(--manage-accent);background:#526c5409}`、`.skin-selected{opacity:0}` → 选中时 `opacity:1`（行 195–204）。
- 点击后立即应用并关闭 sheet（无「确认」按钮）。

### 1.3 `setSkin`（app.js 行 86433–86441，偏移 23979863）[实现行为]
```js
function setSkin(skin){
  if(!['cotton','halo','sunset'].includes(skin))return false;
  if(!safe(H.commit(s=>{s.skin=skin})))return false;
  document.documentElement.dataset.skin=skin;
  $('#skin').value=skin;
  const bg=$('#background');
  bg.innerHTML=skin==='cotton'?'<cotton-bg seed="1"></cotton-bg>':`<ju-${skin}-skin style="position:absolute;inset:0;display:block" seed="1"></ju-${skin}-skin>`;
  JUR2.motion(bg,[{opacity:.25,filter:'blur(12px)'},{opacity:1,filter:'blur(0)'}],{duration:650});
  return true;
}
```
- 持久化：先 `H.commit` 写入 `state.skin`（见 §9），失败（存储异常）则不切换、并由 `safe()` 显示「未能保存 · 点击重试」。
- 应用方式：`html[data-skin=…]` 属性 + 重建 `#background` 子元素（`<cotton-bg>` 或 `<ju-halo-skin>`/`<ju-sunset-skin>`）。
- 切换过渡：`#background` 整体 650 ms，opacity .25→1、blur 12px→0，缓动为 JUR2 默认 `cubic-bezier(.22,1,.36,1)`；reduced-motion 下为 1 ms（JUR2.motion 内置）。
- 启动：`setSkin(H.state.skin)`（行 86886）；审阅栏 `<select id="skin">`（行 1758）`onchange=e=>setSkin(e.target.value)`（行 86885）。产品视图下审阅栏控件隐藏：`html[data-view=product] … .skin-label,.review-button{display:none}`（行 12）。

### 1.4 三套皮肤的精确值
**随皮肤变化的 CSS 变量（仅 5 个；行 112–114）** [实现行为]
```css
:root{--manage-paper:#fffdf5f5;--manage-ink:#263936;--manage-secondary:#596851;--manage-rule:#26393629;--manage-accent:#526c54}
html[data-skin=halo]{--manage-paper:#fff9effa;--manage-ink:#362e3c;--manage-secondary:#655564;--manage-rule:#362e3c2b;--manage-accent:#69516c}
html[data-skin=sunset]{--manage-paper:#fffbf2f7;--manage-ink:#3b352d;--manage-secondary:#6a5b4c;--manage-rule:#3b352d29;--manage-accent:#775842}
```
其余全局 token（`--ink/--muted/--blue/--rule/--paper/--accent`）不随皮肤变化。

**棉糖 cotton = `<cotton-bg>`（`vendor/cotton-bg.js` 行 81401–81440）** [实现行为]
- three.js 移植 ShaderGradient `waterPlane`（@shadergradient/react 2.4.20，MIT）。
- 三通道颜色（行 81429）：`channels=[[251,225,236],[236,236,244],[211,237,243]]` → `#fbe1ec`（粉）、`#ececf4`（淡紫白）、`#d3edf3`（冰蓝）。
- 清屏色 `setClearColor(243/255,242/255,248/255)` = `#f3f2f8`；元素底色 `background:#f3f2f8`。
- 参数：`uSpeed .3`，时间倍率 `.25`（有效速度 .075），`uNoiseDensity 1`，`uNoiseStrength 3`，`uLoopDuration 40`；`MeshPhysicalMaterial{metalness:.2,roughness:.9}`；`PlaneGeometry(18,18,192,192)`，`rotation.z=-π/2`；`AmbientLight(0xffffff,1.2π)`；`setPixelRatio(1)`，`powerPreference:'low-power'`。
- 单一 WebGL 渲染器服务所有实例（每实例 2D canvas blit）；reduced-motion 时静止在 `clock=.2` 单帧。
- 另有 `ju-cotton-skin`（v17-skins.js 行 81462–81636，原生 GLSL 版，调色 `#ebedff / #f3f2f8 / #dbf8ff / rose vec3(.988,.882,.918)`，CSS 兜底 `linear-gradient(150deg,#f7e9ef 0%,#eef0fb 32%,#e6f2fa 60%,#f3f2f8 100%)`）— R3 的 `setSkin` **未使用**它 [占位或禁用]。

**光晕 halo = `<ju-halo-skin>`（v17-skins.js 行 81640–82275）** [实现行为]
- 画布 `MASTER_WIDTH 376 × MASTER_HEIGHT 830`；`HALO_SPEED 0.025`（注释：官方预设 0.4，"一次大的构图变化约 40–50 秒"）；`HALO_BRIGHTNESS 1.2`；`HALO_START_TIME 340`（可用 `?haloTime=` 覆盖）。
- 三色 uniform（相对行 460–462）：`uColor1 = rgb(255,80,5) #ff5005`，`uColor2 = rgb(219,186,149) #dbba95`，`uColor3 = rgb(208,188,225) #d0bce1`；带半调（halftone）着色 pass。
- 画布底色 `#ff5005`；无 WebGL 时 `paintFallback` 线性渐变：`0 #ff5005 → .58 #dbba95 → 1 #d0bce1`。

**落日 sunset = `<ju-sunset-skin>`（v17-skins.js 行 82273–82835）** [实现行为]
- `SUNSET_SPEED 0.1`，`SUNSET_BRIGHTNESS 1.5`，`SUNSET_START_TIME 0`（`?sunsetTime=`/`?haloTime=`），`?sunsetPaused=1` 可暂停。
- 三色 uniform（相对行 401–403）：`uColor1 = rgb(255,122,51) #ff7a33`，`uColor2 = rgb(51,160,255) #33a0ff`，`uColor3 = rgb(255,197,61) #ffc53d`。
- 画布底色 `#ff7a33`；兜底渐变：`0 #fea669 → .32 #f99674 → .58 #cb9ca3 → .8 #9ca2d1 → 1 #85a2e8`。

### 1.5 旧版皮肤 API（v17-skins.js 行 82836–82960）[占位或禁用]
```js
const STORAGE_KEY = "ju-background-skin-v1";
const TAGS = Object.freeze({ cotton: "ju-cotton-skin", halo: "ju-halo-skin", sunset: "ju-sunset-skin" });
… document.documentElement.setAttribute("data-ju-skin", activeSkin); …
window.JU_SET_SKIN = (value) => applySkin(value, true);
window.JU_GET_SKIN = () => activeSkin;
```
- 启动时读 `localStorage['ju-background-skin-v1']` 并设置 `html[data-ju-skin]`；监听 `[data-ju-skin-select]` 的 change 和跨标签 `storage` 事件。
- R3 DOM 中没有 `[data-ju-skin-select]`、没有 `<ju-legacy-background>`，app.js 不调用 `JU_SET_SKIN`。结果：该键只读不写，`data-ju-skin` 与 `data-skin` 两个属性并存但 CSS 只使用 `data-skin`。**存在两套皮肤真值来源**（见 §B）。

---

## 2. `renderHome`、`H.state.favorites`、`H.commit`（收藏）

### 2.1 收藏键 = `城市:行号`，不是活动 ID [实现行为]
`renderHome`（app.js 行 86420–86423，偏移 23974447）：
```js
let city='NYC',filter='all',idx=2;
const all=[{id:'all'},{id:'favs'},...B.themes.filter(t=>t.id!=='custom')];
const cards=()=>{const rows=(B.feedRows[city]||[]).map((r,i)=>({id:city+':'+i,cat:r[0],pack:r[1],title:r[2],en:r[3],date:'FRI '+r[4],dateNum:r[4].replace('.','-')+'-2026',time:r[5],loc:r[6],host:r[7],seats:r[8],capacity:r[8]+1,num:city,city}));
 if(city==='NYC'){const coffee=rows.findIndex(r=>r.pack==='street'&&r.cat==='coffee'),sport=rows.findIndex(r=>r.cat==='sports');const first=[rows[coffee],rows[sport],rows[0]];return [...first,...rows.filter(x=>!first.includes(x))].filter(x=>filter==='all'||filter==='favs'&&H.state.favorites[x.id]||x.cat===filter)}
 return rows.filter(x=>filter==='all'||filter==='favs'&&H.state.favorites[x.id]||x.cat===filter)};
```
- 首页卡片来自静态 `JU_CREATE_BASE.feedRows[city]`（v17-data.js 行 82961），每行 `[cat,pack,title,en,date,time,loc,host,seats]`；卡 id 为 `"NYC:0"` 这类 **城市代码:数组下标**。
- 与活动模型的 id（`draft-…`、`demo-host-hotpot`）**没有任何映射**；收藏的不是「活动」，是「首页静态卡」。
- `H.state.favorites` 结构：`{ "NYC:0": true, "NYC:7": false, … }`（布尔映射，取消收藏写 `false` 而非删除键）。
- NYC 的展示顺序被重排（咖啡街拍卡、第一张运动卡、rows[0] 置顶），但 id 仍按原始下标，稳定。

### 2.2 手势（`vendor/ju-paper-film.js` `JuFilm.Stage`，行 83525–83583）[实现行为]
```js
listen(canvas,'pointerdown',function(e){ … stable=settled();
  state.drag={…,axis:null,rect:rect,favStart:state.favX,canFav:stable&&hitCenter(e),canTap:stable}; … });
listen(canvas,'pointermove',function(e){ … dx=c.x-d.x,dy=c.y-d.y;
  if(!d.axis){
    if(Math.hypot(dx,dy)<6)return;
    if(Math.abs(dx)>Math.abs(dy)*1.25){ d.axis=d.canFav?'x':'blocked'; if(d.axis==='x'&&self.opts.onFavStart)self.opts.onFavStart(); }
    else d.axis='y';
  }
  if(d.axis==='blocked')return;
  if(d.axis==='x'){if(self.opts.onFavMove)self.opts.onFavMove(dx+d.favStart);wake();return;}
  … /* y 轴 = 翻卡 */ });
function release(e,cancel){ … if(d.axis==='x'){ if(self.opts.onFavEnd)self.opts.onFavEnd(cancel?0:coords(e,d.rect).x-d.x+d.favStart,cancel); … } }
listen(canvas,'pointerup',e=>release(e,false)); listen(canvas,'pointercancel',e=>release(e,true)); listen(canvas,'lostpointercapture',e=>release(e,true));
```
- 轴判定：死区 6 px；`|dx| > 1.25·|dy|` 判为横向（收藏），否则纵向（翻卡）。横向只在卡箱静止且按在中央卡上（`settled()&&hitCenter`）时允许，否则 `blocked`。
- 坐标系：`coords()` 把 clientX 换算为 canvas 内部像素（`*width/r.width`）；快照中 canvas `width=358`，与 CSS px 近似 1:1 [不确定：`resize()` 是否乘 DPR 未核实]。
- 取消来源：`pointercancel`、`lostpointercapture`、`window blur`、`resize`、`visibilitychange(hidden)`、IntersectionObserver 离屏、`setCards()` 重载 → `release(…,true)` → `onFavEnd(0,true)`。

`renderHome` 回调（行 86423，偏移 23976096）：
```js
onFavStart:()=>{},
onFavMove:dx=>film.setFavX(dx),
onFavEnd:(dx,cancel)=>{if(!cancel&&Math.abs(dx)>70&&list[idx]){const id=list[idx].id;const wasSaved=!!H.state.favorites[id];if(safe(H.commit(s=>{s.favorites[id]=!wasSaved}),wasSaved?'已取消收藏':'已收藏')&&filter==='favs')update()}film.setFavX(0)},
```
- **阈值 70（canvas px，绝对值）**；**方向无关：左滑或右滑都是 TOGGLE**（已收藏→取消，未收藏→收藏）。
- 低于阈值 / 取消：不提交，`film.setFavX(0)` 回弹。
- 成功反馈：只有 `JUR2.announce('已收藏'|'已取消收藏')`（`#r2-live` sr-only 状态区），**没有可见 toast、没有卡面标记**。若当前在「收藏」筛选下取消，列表立即 `update()` 重算。
- `onFavStart` 为空函数 [占位或禁用]。

### 2.3 拖动中的视觉反馈 [实现行为]
- 纸卡本体（行 83434–83440）：`p.x+=favX*upp*arrival; p.rz-=favX*.012*arrival`（随手指平移并以 0.012°/px 轻微旋转，仅作用于中央卡附近 `arrival=exp(-(rel/.30)²)`）。
- 回弹（行 83503–83505）：`favX=mix(favX,favTarget,1-exp(-dt*23))`，reduced-motion 直接到位。
- DOM 叠层 `[data-ju-fav-wrap]`（行 83452–83457 `syncOverlay`）只同步 `transform:translateX(favX px) rotate(favX*.012deg)`。该叠层内部（V27 快照，行 84307）含 ☆「拿出收藏」提示层与 ★ 徽标，均 `opacity:0`，**R3 没有任何代码改变其 opacity** → [占位或禁用]。
- 画布 `aria-label`（行 83486）：`${title}，上下翻看局卡，左右滑动收藏，点卡进入`；容器 `aria-label="局卡箱 · 上下拖动翻卡，左右滑收藏，上下键翻卡"`。

### 2.4 收藏列表视图 [实现行为（仅筛选）]
- 分类条第二个 chip 为 `favs`（`all` 数组第 2 项），选中后 `cards()` 以 `H.state.favorites[x.id]` 过滤；chip 选中样式内联：`background:#263936;color:#fffdf5`，未选中 `#fffdf5e8 / #40554b`。
- 空态（行 86423）：
  ```html
  <div class="home-empty home-empty-redesign"><div class="saved-mark">…书签 SVG…</div>
  <h2>还没有收藏</h2><p>${城市中文名}</p><span>遇到想去的，留在这里。</span>
  <button class="home-find-action">去找局 →</button></div>
  ```
  按钮行为：`filter='all';update()`。
- 没有独立收藏页、没有批量管理/清空、没有排序、没有跨城市汇总（筛选只在当前浏览城市内）。

### 2.5 `H.commit`（state.js 行 82970）[实现行为]
```js
commit(mutator){const next=clone(state);const r=mutator(next);if(r===false)return {ok:false,code:'invalid'};
 try{ if(api.failNext){api.failNext=false;throw Error('injected save failure')}
   localStorage.setItem(KEY,JSON.stringify(next));state=next;window.dispatchEvent(new CustomEvent('ju-host-change'));return {ok:true,value:r};
 }catch(error){return {ok:false,code:'storage',error:error.message}}},
```
- 整状态深拷贝→变更→整体 `JSON.stringify` 写一个键；成功派发 `ju-host-change`。返回 `{ok,code,value|error}`，由 app.js `safe()` 统一处理（storage 失败 → 「未能保存 · 点击重试」持久错误态；其它 → `result.error||'当前状态已变化，请返回查看'`）。
- `H.draft(patch)`（行 82971）是另一条路径：返回布尔，不派发事件，强制 `capacity=need+1`。

---

## 3. 城市与时区

### 3.1 时区映射与城市列表 [实现行为]
- state.js 行 82964：`zones={NYC:'America/New_York',BOS:'America/New_York',LA:'America/Los_Angeles',SFO:'America/Los_Angeles',SEA:'America/Los_Angeles',CHI:'America/Chicago'}`。
- `JU_CREATE_BASE.cityOptions`（行 82961）**不含时区字段**：
  `NYC 纽约 NEW YORK · BOS 波士顿 BOSTON · LA 洛杉矶 LOS ANGELES · SFO 湾区 BAY AREA · SEA 西雅图 SEATTLE · CHI 芝加哥 CHICAGO`。
- 搜索别名（r2-regions.js 行 86223）：
  `NYC:['纽约市','New York City','纽约','NY'] BOS:['波城','Boston','波士顿'] LA:['洛城','洛杉矶','Los Angeles'] SFO:['旧金山','三藩市','硅谷','湾区','San Francisco','Bay Area','SF','Silicon Valley'] SEA:['西雅图','Seattle'] CHI:['芝城','芝加哥','Chicago']`
- 归一化 `norm`：NFKC + 小写 + 去除 `空白 - – — _ . , / ·`。

### 3.2 `openCity`（r2-regions.js 行 86276–86286；app.js 包装 行 86860）[实现行为]
- Sheet 标题「在哪个城市」；输入框 placeholder `纽约 / New York / NYC`，`aria-label="搜索城市中文、英文或缩写"`。
- 结果行 `.r2-city-row`：中文 / 英文 / 代码；当前城市显示 ✓，其它 ↗。
- 无结果：`<strong>没有匹配的城市</strong><button data-retry-query>重新搜索 ↺</button>`。
- `custom=true` 且有输入时追加「自己填写「q」」：名称 `wid>40` → 提示「缩短城市名称后继续」；否则二级 sheet 选「当地时区」（内置标签 `America/New_York 美国东部 · New York / America/Chicago 美国中部 / America/Denver 美国山地 / America/Los_Angeles 美国太平洋 / Asia/Shanghai 中国标准时间 / Europe/London 伦敦 / Asia/Tokyo 东京` + `Intl.supportedValuesOf('timeZone')` 全集），CTA「使用这个城市」→ `onSelect({id:'custom:'+name,zh:name,timezone})`。
- 列表入场 280 ms `opacity .45→1, translateY(10px)→0`。

### 3.3 浏览城市 vs 活动城市 [实现行为]
- 首页浏览城市是 `renderHome` 的**局部变量** `city='NYC'`：`$('[aria-label="切换城市"]').onclick=()=>openCity(city,(c)=>{city=c.id;label.textContent=c.zh;closeModal();update()},false)`。**不持久化、不进 H.state、每次回到 s01 重置为 NYC；禁止自定义城市**。
- 活动/草稿城市在 `draft.city`，入口 `time-city`（时间卡）与 `edit-city`（地点卡）（app.js 行 86827）：
  ```js
  'edit-city':()=>openCity(D().city,c=>{const changed=c.id!==D().city;if(!saveDraft(JUR2Regions.cityPatch(D(),c)))return;closeModal();refreshPaper(2);refreshPaper(3);if(changed)openArea()},true),
  ```
  允许自定义城市；改城市后自动打开「碰面区域」。

### 3.4 `cityPatch`（r2-regions.js 行 86232–86238）[实现行为]
```js
function cityPatch(draft,city){
 const patch={city:city.id,cityLabel:city.zh,timezone:city.timezone||window.JUHost?.zones?.[city.id]||({NYC:'America/New_York',BOS:'America/New_York',CHI:'America/Chicago'}[city.id]||'America/Los_Angeles')};
 if(city.id===draft.city)return patch;
 const snapshots={...(draft.r2LocationDrafts||{})};
 if(draft.neighborhood||draft.place||draft.meeting)snapshots[draft.city]={city:draft.city,cityLabel:draft.cityLabel,timezone:draft.timezone,neighborhood:draft.neighborhood,regionId:draft.regionId||'',place:draft.place,meeting:draft.meeting};
 return {...patch,neighborhood:'',regionId:'',place:'',meeting:'',r2LocationDrafts:snapshots,r2PreviousCity:draft.city};
}
```
- 换城市时：**时区重映射**；**区域/地点/集合说明清空**；旧城市的位置快照存入 `draft.r2LocationDrafts[旧城]`，`r2PreviousCity` 记录上一个城市；`openArea` 内提供 `[data-restore]` 恢复按钮（行 86266）。
- **日期与时间字符串不变**（`dateISO/time` 保留），但 `H.instant()` 按新时区重新解释 → 绝对时刻改变。无「改期」提案产生（草稿期）。
- 同城重选：只返回 `{city,cityLabel,timezone}`。

### 3.5 区域数据与搜索 [实现行为]
- `JU_R2_REGION_DATA`（行 86220，40 KB）：`groups{NYC,BOS,LA,SFO,SEA,CHI}` + `regions[]`（约 170 条）。样例：
  `{"id":"nyc-flushing","serviceCity":"NYC","group":"queens","zh":"法拉盛","en":"Flushing","aliases":["Flushing Main Street","法拉盛市中心"],"kind":"neighborhood","source":["nyc"],"legacy":["Queens-法拉盛"],"value":"皇后区 · 法拉盛"}`
- `search(city,q)` 匹配 zh/en/aliases/legacy/分组 zh；无结果：`没找到“q”` + 「换个词搜索」 + 「采用「q」」（超过 `limits.hood=20` 宽度 → 「缩短区域名称」）。
- 加载时把 regions 的 `value` 合并进 `JU_CREATE_BASE.hoodMap[city]`（保持校验白名单兼容）。

### 3.6 时区显示 [实现行为]
- `localZone(e)`（app.js 行 86443）：`Intl.DateTimeFormat('zh-CN',{timeZone:e.timezone,timeZoneName:'shortOffset'})` → `UTC-5` 形式。
- `H.instant(e)`（state.js）：按 `dateISO+time` 在 `timezone` 下迭代求 UTC，DST 不存在的本地时间返回 `NaN`（校验文案「这个当地时间不存在，请重新选择」）。
- 各处只显示「${cityLabel}当地时间」+ 折叠的「时区详情」(`${timezone} · UTC±`)；时间编辑器注释「按活动当天的时区计算。」

---

## 4. 草稿模型与活动模型

### 4.1 草稿字段（state.js `blank()` 行 82965）[实现行为]
```js
{id:'draft-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,10),version:1,title:'',theme:'',customTheme:'',dateISO:'2026-12-18',time:'19:30',timeSet:false,city:'NYC',cityLabel:'纽约',timezone:zones.NYC,neighborhood:'Queens-法拉盛',place:'',meeting:'',duration:'',need:4,capacity:5,joinMode:'application',women:false,men:false,deadline:'twoHours',hint:'',pack:'invite',fee:{type:'unspecified',currency:'USD',amount:'',max:'',note:''},host:'老杨',hostId:'host',hostWechat:'laoyang-ju'}
```
- R2/R3 运行期追加字段：`regionId`、`r2LocationDrafts`、`r2PreviousCity`（由 cityPatch/openArea 写入）。
- 校验（`validate(e,step)`）：标题 ≤30 宽（汉字 2）；主题；时间需 `timeSet` 且未来；区域/地点（地点 ≤24 宽，区域 ≤20 宽或白名单）；人数 1–12；费用类型枚举 `unspecified|free|own|aa|fixed|host`，币种 `USD|CAD|CNY|EUR|GBP|JPY`。

### 4.2 活动与记录 [实现行为]
- `publish()`：`event=clone(draft); capacity=need+1; version=1;` → **活动 id = 草稿 id（`draft-<base36 时间>-<8 位随机>`）**；记录 `{event,status:'open',publishedAt,formedAt:null,participants:[],attendance:{},proposals:[],roster:null}`；旧 current 移入 `savedEvents[旧id]`。
- 记录状态枚举：`open → recording → ended`；`open → cancelled`。
- 参与者状态枚举：`pending | invited | confirmed | reschedule_pending | declined | exited | expired | cancelled`。
- 参与者字段：`participantId('p'+n), name, note, verified(域名或 null), wechat, status, acceptedVersion, ticketId = eventId+':v'+version+':'+participantId, ticketReleased, appliedAt, invitedAt, deadline(=邀请时刻+6h), invitationId = eventId+':'+participantId+':'+时间戳`。
- 版本：`reschedule(patch)` → `event.version+1`，`proposals.push({id:'change-'+Date.now(),before,after,at})`。
- `counts()`：`confirmed`（已确认且版本一致）、`reserved`（invited+reschedule_pending）、`pending`、`available=max(0,need-confirmed-reserved)`、`capacity=need+1`。
- `exportContract()`：`{schema:'ju.host-event.v1',event:projection(event),status,participants,attendance,archive,externalDelivery:'not-connected'}`（无 UI 入口）[占位或禁用]。

### 4.3 样例活动（用于跨模块 ID 对照）
| id | title | city | 时间 | status | 来源 |
|---|---|---|---|---|---|
| `demo-host-hotpot` | 深夜救急火锅局 | NYC（纽约，Queens-法拉盛 · 海底捞） | 2026-12-18 19:30 America/New_York | open | `fixture()` 行 82966 |
| `demo-history-0` | 周末菜狗羽毛球 | NYC | 2026-09-12 19:30 | ended | `historyFixtures()` 行 82967 |
| `demo-history-1` | 下班看展搭子 | NYC | 2026-08-12 19:30 | ended | 同上 |
| `demo-history-2` | 秋日咖啡闲聊 | NYC | 2026-07-12 19:30 | ended | 同上 |
| `demo-history-3` | 周五电影局 | NYC | 2026-06-12 19:30 | ended | 同上 |
| `demo-history-4` | 中央公园野餐 | NYC | 2026-05-12 19:30 | ended | 同上 |

- 演示参与者（`B.applicants`）：小面 columbia.edu→confirmed；Momo nyu.edu→confirmed；Leon google.com pending；Kiki 未验证 pending；阿蒋 sva.edu pending。
- 首页静态卡（收藏对象）数量：NYC 25、BOS 12、LA 12、SFO 10、SEA 9、CHI 8；例如 `NYC:0` = 深夜救急火锅局 12.18 19:30 Queens-法拉盛 局主 老杨 还招 4。**首页卡与活动模型 id 无关联；`demo-host-hotpot` 与 `NYC:0` 同名但无代码映射。**

---

## 5. 通知相关事件

| 事件 | 代码 | 触发 | UI/权限 | 标签 |
|---|---|---|---|---|
| 邀请（留位） | `invite(id)` state.js | 局主在 s06 参与者 sheet 点「邀请这位」 | 按钮文案「正在留位→已留位」，sheet 自动关闭（560 ms / reduced 160 ms）；无推送 | [实现行为] |
| 预留到期 | `expire()` | **仅在 `renderManage()` 进入时调用**（行 86532），无定时器 | 无提示，状态变 `expired`「邀请已到期」 | [实现行为] |
| 本人确认/退出 | `receiveResponse(id,accept,context)` | 审阅栏按钮「模拟下一位确认」(`#review-response`) | 校验 eventId/version/token/deadline；拒绝→`exited` | [实现行为（模拟）] |
| 改期 | `reschedule(patch)` | s08「改个时间」→ `confirmReschedule` | 文案见 §8；confirmed→reschedule_pending，invited→expired | [实现行为] |
| 取消 | `cancel()` | s08「取消这局」→ `confirmCancel` | 文案见 §8 | [实现行为] |
| 活动变化广播 | `window.dispatchEvent(new CustomEvent('ju-host-change'))` | 每次 `H.commit` 成功 | 页内事件，无订阅者可见 UI | [实现行为] |
| 候补 | — | host 模型无候补队列（`counts()` 无 waitlist） | 纸卡文案「可候补」仅在 `card.confirmed` 为数字时出现（首页卡无此字段）；`ju-envelope.js` 有 V25 参与者端「候补回执」路由（`ROUTES.queueReceive25/queueRest25/waiting`，文案「轮到后需在6小时内确认」「位置已经预留，请先阅读参加约定。」「邀请已到期，预留席位已释放。」「这次候补已经结束。」） | [占位或禁用]；是否可达 [不确定] |
| 系统通知 / Notification API / 权限 | 无 | — | 全文无 `Notification`、无 `navigator.share`、无 service worker | 不存在 |

- 唯一「通知」机制：`JUR2.announce(text)` 写入 `#r2-live`（`role=status aria-live=polite` sr-only）；`JUR2.feedback(btn,text,kind,{persist})` 把按钮文字临时替换（2200 ms 自动恢复，`waiting`/`persist` 除外）。

---

## 6. 开局中的局主资料与联系方式

### 6.1 局主字段 [占位或禁用]
- 仅 `blank()` 硬编码：`host:'老杨', hostId:'host', hostWechat:'laoyang-ju'`。
- **全文无任何 UI 编辑或显示 `hostWechat`**（grep 唯一命中为 blank()）；**无 邮箱/email、无 称呼 字段、无局主验证**。
- `e.host` 只出现在首页卡详情 modal（行 86422）：`<p>局主 ${esc(e.host)}</p>`（来自静态 feedRow 的 host 列）及卡面绘制。
- 分享图（§7）不含局主姓名或联系方式。

### 6.2 参与者联系方式可见规则（state.js `canContact`）[实现行为]
```js
canContact(p,r=state.current){return !!(r.formedAt&&p.status==='confirmed'&&p.acceptedVersion===r.event.version&&p.ticketReleased&&r.status!=='cancelled'&&(!r.endedAt||Date.now()<r.endedAt+86400000))},
```
- 即：**成局（formedAt）且本人已确认当前版本且票已发放且未取消且结束未超 24 小时** → 显示 `微信号 + 「复制微信号」`。
- 否则 `personDetail`（app.js 行 86606–86614）按优先级给出标题/说明：
  ```
  默认：成局后交换联系方式 / 确认参加并成局后开放。
  活动已取消：活动已取消 / 联系方式已关闭。
  结束超 24h：联系方式已关闭 / 本场结束已超过 24 小时。
  invited：已为对方留位 6 小时 / 本人确认后，才计入参加人数。
  reschedule_pending 或版本不一致或票未放：等对方确认新安排 / 确认并成局后开放联系方式。
  confirmed 未成局：参加已确认，等这局成行 / 成局后开放联系方式。
  declined/exited/expired：当前未参加本场 / 联系方式未开放。
  ```
- 验证显示：`${esc(p.verified||'尚未验证')}`（verified 为邮箱域名字符串，如 `columbia.edu`）。
- 成局条件：`receiveResponse` 中 `confirmed===need && !formedAt → formedAt=Date.now()`。

### 6.3 复制到剪贴板（app.js 行 86529）[实现行为]
```js
async function copy(text,ok,btn=JUR2.current()){if(btn?.disabled)return;JUR2.restore(btn);JUR2.feedback(btn,'正在复制…','waiting',{persist:true});if(btn){btn.disabled=true;btn.setAttribute('aria-busy','true')}
 try{if(window.JU_TEST_FAIL_COPY){window.JU_TEST_FAIL_COPY=false;throw Error('test')}await navigator.clipboard.writeText(text);JUR2.feedback(btn,'已复制','success');}
 catch{JUR2.feedback(btn,'复制失败 · 点击重试','error',{persist:true});}
 finally{if(btn?.isConnected){btn.disabled=false;btn.removeAttribute('aria-busy')}}}
```
- 流程：按钮文字→「正在复制…」(disabled, aria-busy) → 成功「已复制」（2.2 s 后恢复）/ 失败「复制失败 · 点击重试」（持久，再次点击由 r2-motion 全局 click 监听 `restore`）。
- **注意：参数 `ok`（'微信号已复制'/'编号已复制'）未被使用**，实际永远显示「已复制」。
- 仅使用 `navigator.clipboard.writeText`，无 `execCommand` 兜底。

---

## 7. 分享能力（与设置/隐私相关）

- s05 `renderPublished`（行 86514–86526）两个动作：`导出分享图`（`save-share`）与 `复制活动编号`（`copy-link`）；无 `navigator.share`、无公开链接、无海报以外的形式。
- `shareTarget(e)`（行 86347）：`'urn:ju:local:event:'+encodeURIComponent(e.id)+':v:'+e.version`。
- `shareCanvas(e)`（行 86350–86418）：900 px 宽 PNG，QR 码（纠错 M，quiet zone 4）编码同一 URN；文案「见面约定」「${date} / ${time}」城市/区域/地点/费用行；QR 下方「本机活动识别码」「公开报名链接尚未接通」；页脚「JU  /  本机保存 · 第 N 版」；`dataset.qr` 记 `public:false`。
- `saveShare`（行 86528）：`canvas.toBlob → <a download="JU-<title>-ShareCard.png">`；反馈「正在生成分享图…」→「下载已发起」/「生成失败 · 点击重试」。
- `exportContract().externalDelivery:'not-connected'`。
- 无隐私开关、无可见范围设置、无分享记录。标签：[实现行为（本机）]；对外传播 [占位或禁用]。

---

## 8. 规则/政策文案（逐字）

| 主题 | 文案（逐字） | 位置 | 标签 |
|---|---|---|---|
| 预留 | 「已为对方留位 6 小时」「本人确认后，才计入参加人数。」 | personDetail 行 86609/86621 | [实现行为] `deadline=now+6*3600000`，`expire()` |
| 预留 | 「邀请会留位 6 小时；本人确认后才计入参加人数。」 | manage 空态 行 86556 | [实现行为] |
| 预留/成局 | 「成局后交换联系方式」「确认参加并成局后开放。」「成局后开放联系方式。」 | 行 86606–86611 | [实现行为] canContact |
| 联系关闭 | 「联系方式已关闭」「本场结束已超过 24 小时。」「活动已取消」「联系方式已关闭。」 | 行 86607–86608 | [实现行为] +86400000 |
| 退出 | 状态标签「已退出」(`exited`)、「已谢绝」(`declined`)、「邀请已到期」(`expired`)；「当前未参加本场」「联系方式未开放。」 | 行 86605/86612 | [实现行为]（无独立退出政策文本） |
| 改期 | 「${count} 位 参加者需要重新确认」「未确认新时间前，原票暂不能用于本场出席。尚未确认的邀请将失效。」 | confirmReschedule 行 86644 | [实现行为] reschedule() |
| 取消 | 「确认后停止报名，当前邀请失效，参加者不能再用这场票赴约。」「此操作不能撤销。」；s08 已取消态「这次约定已经取消，报名与邀请已关闭。」 | 行 86645/86643 | [实现行为] cancel() |
| 时区 | 「${cityLabel}当地时间」「时区详情 ${timezone} · UTC±」「按活动当天的时区计算。」 | 行 86643/86836/86488 | [实现行为] instant()/localZone() |
| 加入方式 | 「我来邀请 — 看过报名后，再邀请对方。」「直接加入 — 留好位置，仍需本人确认参加。」「加入方式决定谁来留位。参加是否确认，仍由对方本人点头。」 | selectSetting 行 86827/86869 | [提案文字] `joinMode` 在 state.js 无任何分支使用 |
| 报名截止 | 「开始前 2 小时 — 给彼此留一点出门前的准备时间。」「前一天 24:00 — 见面前一天结束时停止报名。」「满了就关 — 达到人数上限，就不再接收报名。」 | 行 86868 | [提案文字] `event.deadline` 从未被校验或执行 |
| 参加范围 | `editLimits()`（women/men） | 行 86871 | [占位或禁用] state.js 不读取 women/men |
| 出席 | 「已确认名单也用于当天的出席记录。」 | 行 86561 | [实现行为] eligible()/record() |
| 年度 | 未找到任何「年度」文案或逻辑 | — | 未知/不存在 |
| 总则 | `/* Host-side adapter. v17 field policies retained; V27 invitation/version semantics. Local prototype only: no transmission, payment or invented credit policy. */` | state.js 行 82961–82962 | [提案文字] |

---

## 9. 持久化与 reduced-motion

### 9.1 全部存储键 [实现行为]
| 键 | 读/写 | 内容 | 位置 |
|---|---|---|---|
| `ju-visual-motion-r1` | 读+写（唯一写入键） | 整个 `state` JSON（见下） | state.js 行 82963/82969–82971 |
| `ju-create-v19-ultra-r2` | 仅读（兜底迁移） | 旧版同构状态；仅当 `schema===1` 才采用 | 行 82969 |
| `ju-background-skin-v1` | 仅读（R3 不写） | `'cotton'|'halo'|'sunset'` 字符串 | v17-skins.js 行 82840/82854 |
| sessionStorage / IndexedDB / cookie | 无 | — | — |

状态结构（schema 1）：
```js
{schema:1,
 draft:{…blank() 字段 + regionId/r2LocationDrafts/r2PreviousCity…},
 current:{event,status,publishedAt,formedAt,participants:[],attendance:{},proposals:[],roster,cancelledAt?,endedAt?},
 savedEvents:{[eventId]:record},
 archives:[{eventId,eventVersion,event,participants,attendance,status:'ended',endedAt,demo?}],
 favorites:{[cardId]:boolean},
 skin:'cotton'|'halo'|'sunset',
 draftStep:0..5}
```
- 载入净化：`savedEvents` 非普通对象则置 `{}`；删除与 `current.event.id` 重复的 savedEvents 项。
- 读取异常 → `loadError='本机记录暂时无法读取。'`，启动后 toast。
- 无 schema 迁移逻辑、无版本号递增、无导出/清除 UI。
- 测试注入：`H.failNext=true` 使下一次写入抛错；`window.JU_TEST_FAIL_COPY / JU_TEST_FAIL_SAVE`。

### 9.2 reduced-motion [实现行为]
- CSS：多处 `@media(prefers-reduced-motion:reduce)`（行 14、62、110、216、297、502、635、786、806、1023、1083、1276、1289、1536、1754）。行 14 全局 `*,*::before,*::after{animation-duration:1ms!important…}`；行 806 `.ju-phone button[data-pressed=true]{transform:none}.sheet{animation:none!important}`。
- JS：`JUR2.motion` 在 reduced 下帧替换为 `[{opacity:1},{opacity:1}]`、duration 1、delay 0；`closeModal` 直接 finish；纸卡箱 `bend=0`、`favX` 即时到位；cotton 静止单帧；manage 列表动画整体跳过。
- 没有应用内「减少动态」开关，仅跟随系统媒体查询。

---

## 10. 视觉与动效语言（参考，R3 视觉未通过评审）

- 字体：`--ju-font-ui:'Noto Sans SC','Microsoft YaHei','PingFang SC',sans-serif`；展示字 `Archivo`（300–800 + Archivo Black）、`Noto Serif SC`、`Libre Caslon Text`（邀请函卡）、`Caveat`、`Oswald`、`Space Mono`（均 @font-face 内嵌于第 1 行）。常见组合 `font-family:Archivo,var(--ju-font-ui)`。
- 全局 token（第 1 行 `:root`）：`--ink:#14161f;--muted:#535b70;--blue:#4a5ad6;--rule:#66728d30;` `font:400 14px/1.5`；表单/管理页 `:root`（行 46）：`--ink:#263936;--muted:#58645c;--blue:#526c54;--rule:#52655735;--paper:#fffdf5;--accent:#476449`；审阅壳 `body{background:#11131a}`；手机 `.ju-phone{width:390px;height:844px;border-radius:34px;background:#e9edf6}`。
- 绿色成功态（JUR2.green）：`#12B886` + `linear-gradient(178deg,#49c8a1,#14ae80 65%,#80e1bf)`；错误字段 `#f5c9c8→#f7e5e1`；选中高亮 `#dde5af`。
- 缓动/时长：
  - `JUR2.motion` 默认 `cubic-bezier(.22,1,.36,1)` 420 ms（r2-motion 行 86170）。
  - 区域/城市列表 `cubic-bezier(.2,.8,.2,1)` 320 ms；manage 人员过渡 `cubic-bezier(.16,1,.3,1)` 460 ms。
  - Sheet：CSS `animation:sheet-in .32s cubic-bezier(.16,1,.3,1)`（`translateY(100%)→0`）；JS `JUR2.sheet` 入场 520 ms `translateY(110px)/.2 → -3px@.8 → 0`；关闭 240 ms `cubic-bezier(.4,0,.8,.4)` 到 `translateY(110px) opacity 0`；拖拽关闭阈值 `dy>95` 或 `dy>36 且 <250 ms`，跟手系数 .85，回位 450 ms。
  - 页面切换（r3-motion）：header 480/310 ms `translateX(18|9px)`；主体 590/360 ms `translate(28,10)|(13,0)` + `clipPath inset 6%`，阶梯 45 ms（最多 90）。
  - 皮肤切换 650 ms（§1.3）；按钮反馈闪光 `brightness 1.15→1` 440 ms。
  - 按压：`.ju-phone button[data-pressed=true]{transform:scale(.958)}`（行 793，transition 含 `cubic-bezier(.18,1.5,.36,1)`）；`:active` 被 `.ju-phone button:active{transform:none}` 关闭，改由 r2-motion 的 `data-pressed` 驱动。V27 弹性曲线 `cubic-bezier(.18,1.5,.36,1)` 亦用于 ★ 徽标与 CTA。
  - Modal 背板 `.modal-backdrop{background:#24362c40;backdrop-filter:blur(4px)}`，sheet `background:#fffdf5;border-radius:22px 22px 0 0`。

---

## 11. 占位 / 禁用 / 待办（与设置、资料、收藏、通知相关）

- `TODO`：应用代码中为零（14 处均在 three.js vendor）。「不在本范围」：未找到。
- `inert`：modal 打开时 `page.inert=true`；关闭动画期间 `sheet.inert=true` 并 `disabled` 全部控件；非当前表单卡 `el.inert=!active`；出席页下一张卡 inert。
- `disabled`：参与者 sheet「暂时满员」(`available===0`)；manage「记录出席」(`cancelled`)、「计划有变」(`status!=='open'`)。
- 设置相关占位：设置 sheet 仅背景；`onFavStart` 空函数；收藏叠层 ☆/★ 常驻 `opacity:0`；`hostWechat` 从不显示；`joinMode/deadline/women/men` 存而不用；`ju-background-skin-v1` 读而不写；`exportContract` 无入口；分享图写明「公开报名链接尚未接通」；`externalDelivery:'not-connected'`。
- 审阅工具（产品视图隐藏）：`#skin` select、`#review-fixture 载入演示活动`、`#review-response 模拟下一位确认`。

---

## A. 设置必须承接的职责清单

| 职责 | 现有入口 | 实现程度 | 代码位置 |
|---|---|---|---|
| 背景皮肤选择（棉糖/光晕/落日） | s01 导航「设置」→ sheet「背景」 | 已实现，仅此一项 | app.js 86429–86441；CSS 112–114, 195–204 |
| 皮肤持久化 | `H.commit(s=>s.skin=…)` | 已实现（`ju-visual-motion-r1`.skin）；旧键 `ju-background-skin-v1` 仅读 | state.js 82969–82970；v17-skins 82840–82954 |
| 皮肤切换过渡 | `JUR2.motion(#background …650ms)` | 已实现 | app.js 86439 |
| 收藏（保存/取消） | s01 中央卡横滑 >70px，方向无关 toggle | 已实现（键 = `城市:下标`） | app.js 86423；film 83525–83583 |
| 收藏列表 | s01 分类 chip「favs」 | 仅筛选，无管理页/清空/跨城 | app.js 86420–86423 |
| 收藏视觉反馈 | 卡位移+旋转；sr-only 播报 | 部分（无可见徽标/toast） | film 83434–83457；JUR2.announce |
| 浏览城市偏好 | s01「切换城市」 | 局部变量，不持久化，重置 NYC | app.js 86423 |
| 活动城市/时区 | 草稿卡 `time-city`/`edit-city` | 已实现（含自定义城市+时区选择） | app.js 86827；r2-regions 86232–86286 |
| 局主资料（称呼/微信/邮箱/验证） | 无 | 字段仅 host/hostId/hostWechat 硬编码；无邮箱 | state.js 82965 |
| 联系方式可见规则 | 参与者 sheet | 已实现（代码规则 canContact） | state.js canContact；app.js 86606–86614 |
| 复制微信号/活动编号 | 参与者 sheet / s05 | 已实现（成功文案固定「已复制」，失败可重试） | app.js 86529 |
| 通知偏好/权限 | 无 | 不存在；仅 aria-live 播报 | r2-motion 86171 |
| 预留到期检查 | `H.expire()` 进入 s06 时 | 已实现但无定时/无提醒 | app.js 86532；state.js expire |
| 分享/隐私 | s05 导出分享图、复制 URN | 本机实现；无公开链接/隐私开关 | app.js 86347–86418, 86514–86529 |
| 规则文案（预留/联系/改期/取消/时区） | 分散于 sheet | 已实现；加入方式/截止/参加范围为提案 | §8 |
| 本机数据管理（导出/清除/演示） | 审阅栏 `#review-fixture`；`exportContract` 无 UI | 占位 | app.js 86885；state.js exportContract |
| 减少动态 | 系统媒体查询 | 已实现，无应用内开关 | 多处 |

## B. 与 V27 可能冲突的点（从 R3 侧可见）

1. **收藏手势语义**：R3 为「左右任一方向、|dx|>70 canvas px → toggle」；V27 快照叠层含 ☆「拿出收藏」提示与 ★ 徽标（暗示方向性/状态性反馈），R3 未驱动它们。若 V27 规定「右滑收藏、左滑取消」或按方向区分，与 R3 冲突。
2. **收藏键**：R3 用 `城市:feedRows 下标`（如 `NYC:0`），既非活动 id 也非标题；首页卡与活动模型（`draft-…`/`demo-host-hotpot`）无映射。V27 若按 id 或 title 存储，需要映射层。
3. **取消收藏写 `false` 而非删除键**：`favorites` 会累积 `false` 项；按「键存在即收藏」解读的实现会出错。
4. **收藏反馈**：R3 无可见确认（仅 sr-only 播报，`JUR2.announce`），卡面无「已收藏」标记。
5. **横向判定比例 1.25 与死区 6 px**：纵向是翻卡主手势，横向需 `settled()` 且命中中央卡；与 V27 可能的「任意卡可收藏」不同。
6. **皮肤真值双源**：`ju-visual-motion-r1`.skin（R3 写）vs `ju-background-skin-v1`（V17 旧 API 只读）；`html[data-skin]` vs `html[data-ju-skin]` 两属性并存，CSS 只用前者。
7. **皮肤命名**：中文 棉糖/光晕/落日 与英文 Cotton Candy/Halo/Sunset；R3 棉糖实际渲染元素是 `<cotton-bg>`（three.js），而 v17 的 `ju-cotton-skin` 另有一套调色与兜底渐变——两者颜色不完全一致（`#fbe1ec/#ececf4/#d3edf3` vs `#ebedff/#f3f2f8/#dbf8ff`）。
8. **「设置」= 仅背景**，sheet 标题是「背景」而非「设置」。
9. **浏览城市不持久化**（每次回首页重置 NYC）；活动城市允许 `custom:<name>` id 与任意 IANA 时区，而首页城市列表只有 6 个固定城市且禁用自定义。
10. **城市切换副作用**：清空区域/地点/集合说明并快照到 `r2LocationDrafts`；日期时间字符串保留但绝对时刻随时区改变。
11. **主导航标签**「找局/开局/我的局/设置」 vs 路由名「看见局/想开局/能确认」等（审阅侧命名）。
12. `copy()` 忽略自定义成功文案（永远「已复制」）。
13. `joinMode`「直接加入」、`deadline` 三档、`women/men` 参加范围：R3 仅存字段与文案，无行为；若 V27 规定了行为则 R3 未实现。
14. 候补：R3 host 模型无候补队列，但 ju-envelope（V25 参与者端）含「候补回执」文案；两边口径可能不一致。
15. 旧状态键 `ju-create-v19-ultra-r2` 作为兜底读取，若 V27 使用其它键名则不会被迁移。

## C. 本提取未能核实的项

- `coords()` 的 canvas 内部像素是否随 DPR 缩放（`resize()` 未读），因此 70 px 阈值相对 CSS px 的实际大小 [不确定]。
- `skin-previews.js` 三张 PNG 的实际画面内容（未解码）。
- `ju-paper-film.js` 其余部分（如 `announce()` 全文、`setCards`、字体加载）与 `deck.js`、`ju-tickets-host.js`、`ju-envelope.js` 的内部状态机；ju-envelope 的候补路由是否能从 host 流程到达。
- `JU_R2_REGION_DATA.regions` 共约 170 条，未逐条枚举；`kind/source` 字段取值集合未统计。
- `editLimits()`（参加范围）完整 UI 与保存结构（仅读到注释「Legacy both=true…collapse to all」）。
- `r2-suggestions.js` 的建议文案全集；`form-motion.js`/`V27Shared` 中非 `cubic-bezier` 形式的动效参数。
- cotton 着色器的完整噪声/光照实现（仅提取颜色与参数）；halo/sunset 着色器内部是否随时间改变三色以外的颜色。
- 第 1 行 CSS 中除 `:root/body/.ju-phone` 以外是否还有与皮肤相关的规则（grep `html[data-skin` 在第 1 行无命中）。
- 「年度」相关内容：全文未找到；V27 侧是否存在未知。
- `H.state.draftStep` 与表单卡顺序的完整语义；`renderForm` 六张卡的全部字段入口（只读了第 6 张「赴约前，定好这些」）。
- 浏览器兼容兜底（`navigator.clipboard` 不可用时的行为仅为报错态）。

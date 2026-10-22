/* ============================================================================
 * JU V27 共有语言提取 · header.js
 * 外层标题 / 辅助行 / 返回键 / 连续吸顶收拢的真实实现，逐字取自 V27 的 x-dc 应用脚本
 * （V27.code.html L1689 起的 <script type="text/x-dc" data-dc-script>，class Component extends DCLogic）。
 * 每段前注明 V27.code.html 行号；方法体原样复制，不改语义。方法名带数字后缀是 V27 自己的版本记号（20/21/23/24…）。
 * 调用关系：
 *   滚动容器 <div data-scroll22 sc-camel-on-scroll="{{onS05Scroll}}">  → onS05Scroll 把 scrollTop 写入 state.sc05（阈值 >2px 才 setState）
 *   → React 重渲染 → componentDidUpdate(V27:1946) 调 sync22() → 对每个 [data-scroll22] 内的 [data-header22] 调 syncHeader23(scroll,h)
 *   → syncHeader23 按 p=headP(scrollTop) 直接写标题 / 辅助行 / 进度块的内联样式（连续、每次滚动都重算；.1s linear 过渡只做帧间平滑）。
 *   stickyShell/titleShrink/subCollapse 名字是 v17 的遗留 API，在 V27 里全部退化为静态样式（见 L4120-4122）。
 * ========================================================================== */

/* ---- headP：收拢进度。scrollTop 4px 开始，88px 收完（区间 84px，线性） ---- 来源：V27.code.html L4119 */
  headP(v) { return Math.min(1, Math.max(0, (v - 4) / 84)); }

/* ---- v17 遗留 API 在 V27 中退化为静态样式 ---- 来源：V27.code.html L4118-L4122 */
  // v17「06 — 能确认」原样：sticky 壳 + 标题 30→18 收缩 + 副行塌缩
  headP(v) { return Math.min(1, Math.max(0, (v - 4) / 84)); }
  titleShrink(v){return this.title20();}
  subCollapse(v){return this.meta21();}
  stickyShell(v) { return this.header21(); }

/* ---- 静态样式：title20 / meta21 / header21 ---- 来源：V27.code.html L4214-L4216 */
  title20(){return {fontFamily:'var(--ju-font-ui)',fontSize:30,fontWeight:500,lineHeight:1.25,letterSpacing:0,color:'#14161f',overflowWrap:'anywhere'};}
  meta21(){return {fontFamily:'var(--ju-font-ui)',fontSize:14,fontWeight:400,lineHeight:1.5,letterSpacing:0,color:'#535b70',height:'auto',whiteSpace:'normal',overflowWrap:'anywhere',textAlign:'left'};}
  header21(){return {position:'sticky',top:0,zIndex:12,display:'flex',flexDirection:'column',gap:9,flexShrink:0,background:'transparent',marginBottom:13};}

/* ---- 共用样式：页脚、CTA 文本与高光、返回键、眉行、非吸顶标题（renderVals 的公共部分） ---- 来源：V27.code.html L2515-L2528 */
      barFadeStyle: { height: 20, flexShrink: 0, background: 'transparent' },
      barPadStyle: { pointerEvents: 'auto', background: 'transparent', padding: '0 22px var(--ju-bottom-pad,46px)', display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'center' },
      barHintStyle: { fontFamily: "'Space Mono',monospace", fontSize: 9, letterSpacing: '0.12em', color: 'rgba(20,22,31,.66)', whiteSpace: 'nowrap', textAlign: 'center' },
      ctaTextStyle: { position: 'relative', fontSize: 14.5, fontWeight: 500, letterSpacing: '0.06em', whiteSpace: 'nowrap' },
      ctaGlossStyle: { position: 'absolute', left: 14, right: 14, top: 3, height: 13, borderRadius: 999, background: 'linear-gradient(180deg,rgba(255,255,255,0.62),rgba(255,255,255,0))', pointerEvents: 'none' },
      backPillStyle: { position: 'relative', alignSelf: 'flex-start', flexShrink: 0, width: 44, height: 44, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', overflow: 'hidden',
        background: 'rgba(255,255,255,0.34)', backdropFilter: 'blur(16px) saturate(1.6)', WebkitBackdropFilter: 'blur(16px) saturate(1.6)',
        boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.95), inset 0 -1px 2px rgba(255,255,255,0.5), inset 0 0 0 1px rgba(255,255,255,0.55), 0 6px 16px -8px rgba(20,26,52,0.45), 0 1px 2px rgba(20,26,52,0.12)',
        transition: 'transform .26s cubic-bezier(.2,1.4,.36,1), background .22s' },
      backGlyphStyle: { position: 'relative', zIndex: 2, fontSize: 15, lineHeight: 1, color: 'rgba(20,22,31,0.78)', marginTop: -1, textShadow: '0 1px 0 rgba(255,255,255,0.7)' },
      backGlossStyle: { position: 'absolute', left: '14%', right: '30%', top: '8%', height: '34%', borderRadius: '50%', background: 'linear-gradient(180deg,rgba(255,255,255,0.85),rgba(255,255,255,0))', pointerEvents: 'none' },
      eyebrowStyle: { fontFamily: "'Space Mono',monospace", fontSize: 9.5, letterSpacing: '0.3em', color: 'rgba(20,22,31,.66)', fontWeight: 400, whiteSpace: 'nowrap' },
      screenTitleStyle: { fontWeight: 500, fontSize: 30, letterSpacing: '0.02em', color: '#14161F', lineHeight: 1.18, whiteSpace: 'normal', overflowWrap:'anywhere' },
    };

/* ---- 滚动回调（每屏一份，形式相同） ---- 来源：V27.code.html L2480-L2483 与 L2646 */
      onS05Scroll: e => { const v = e.currentTarget.scrollTop; if (Math.abs(v - s.sc05) > 2) this.setState({ sc05: v }); },
      onS06Scroll: e => { const v = e.currentTarget.scrollTop; if (Math.abs(v - s.sc06) > 2) this.setState({ sc06: v }); },
      onS09Scroll: e => { const v = e.currentTarget.scrollTop; if (Math.abs(v - s.sc09) > 2) this.setState({ sc09: v }); },
      onS12Scroll: e => { const v = e.currentTarget.scrollTop; if (Math.abs(v - s.sc12) > 2) this.setState({ sc12: v }); },
      onS02Scroll: e => { const v = e.currentTarget.scrollTop; if (Math.abs(v - s.sc02) > 2) this.setState({ sc02: v }); },

/* ---- s02 门口的 header 组合样式（展开/收拢由 door 状态与 scroll 共同决定） ---- 来源：V27.code.html L2619-L2622、L2628-L2634、L2647-L2655 */
  vals02(s) {
    const locked = this.lockedBefore();
    const need = this.need();
    const p = Math.min(1, Math.max(0, (s.sc02 - 4) / 84));
    const EZ = 'cubic-bezier(.22,.86,.24,1)';
    const hm = s.headM || {};
    const fs02 = door ? 30 - p * 12 : 25.5;
    const tw02 = (hm.t02 || 186) * fs02 / 25.5;
    const tx02 = door ? -Math.max(0, ((hm.ct02 || 332) - tw02) / 2) : 0;
    const sx02 = door ? -Math.max(0, ((hm.cs02 || 332) - (hm.s02 || 262)) / 2) : 0;
    const scr02 = door && s.sc02 > 2;
      s02StickyStyle: this.header21(),
      s02TitleStyle: this.title20(),
      s02SubRow: this.meta21(),
      s02BackWrap: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, opacity: 1, pointerEvents: 'auto', transition: 'opacity .2s ease' },
      s02HeadMove: { display: 'flex', flexDirection: 'column', gap: 9, alignItems: 'flex-start', textAlign: 'left',
        transform: 'translateY(0)', transition: 'transform .84s ' + EZ + ' .04s' },
      s02ProgWrap: { maxHeight: door ? 150 : 0, opacity: door ? 1 : 0, overflow: 'hidden', transition: 'max-height .68s ' + EZ + ' .58s, opacity .5s ease .66s' },
      s02ScrollStyle: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, overflowY: door ? 'auto' : 'hidden', overflowX: 'hidden', padding: 'var(--ju-content-top,66px) 22px 220px', boxSizing: 'border-box', display: 'block', zIndex: 2 },
      s02StageStyle: { position: 'relative', height: door ? 328 : 'min(452px, calc(var(--ju-phone-height,844px) - 180px))', margin: '4px 0 2px', transition: 'height .84s ' + EZ, flexShrink: 0 },

/* ---- measureHeads：量标题/副行自然宽度（s02/s3b 从居中滑到左侧时使用 translateX 插值） ---- 来源：V27.code.html L2101-L2121 */
  // 标题 / 副行从居中滑到左侧：量出它们的自然宽度，用 translateX 插值，而不是切 align-items
  measureHeads() {
    const out = {};
    ['t02', 's02', 't3b', 's3b'].forEach(k => {
      const el = document.querySelector('[data-head="' + k + '"]');
      if (!el || !el.parentElement) return;
      const C = el.parentElement.clientWidth;
      if (!C) return;
      let w = 0;
      if (el.getAttribute('data-head-row')) {
        const kids = el.children;
        for (let i = 0; i < kids.length; i++) w += kids[i].getBoundingClientRect().width;
        w += 8 * Math.max(0, kids.length - 1);
      } else {
        const fs = parseFloat(getComputedStyle(el).fontSize) || 25.5;
        w = el.getBoundingClientRect().width * 25.5 / fs;
      }
      if (w > 4) { out[k] = w; out['c' + k] = C; }
    });
    if (Object.keys(out).length) this.setState(x => ({ headM: Object.assign({}, x.headM, out) }));
  }

/* ---- componentDidUpdate 中的同步链（节选该行） ---- 来源：V27.code.html L1946 */
    this.syncCard26();this.paintCardFrame27();this.syncDialogFocus();this.flushBurnRoute27();this.sync18Access();this.sync22();this.syncMotion25();this._spinWake && this._spinWake();

/* ---- syncHeader23：连续收拢的真实实现（标题 30→18px、top 53→12.55px、居中、max-width 收 104px、辅助行塌缩、进度块上移、header 高度恒定） ---- 来源：V27.code.html L4457-L4476 */
  syncHeader23(scroll,h){
    const page=scroll.closest('section')?.id;
    if(!['s02','s03b','s05','s06g','s09','s06','s11'].includes(page)||!h.offsetWidth)return;
    const title=h.querySelector('[data-screen-title]');if(!title)return;
    const meta=title.nextElementSibling,group=title.parentElement;
    const prog=[...h.children].find(e=>e!==group&&e!==title&&e!==meta&&e.querySelector('[style*="height: 5px"],[style*="height:5px"]'));
    if(group!==h){group.style.display='contents';group.style.transform='none'}
    const p=this.headP(scroll.scrollTop),w=h.clientWidth;
    h.dataset.header23='';h.style.setProperty('--ju-head-progress',String(p));
    title.dataset.headerTitle23='';
    Object.assign(title.style,{position:'absolute',top:(53-40.45*p)+'px',fontSize:(30-12*p)+'px',lineHeight:'1.05',width:'max-content',maxWidth:(w-104*p)+'px',whiteSpace:p===1?'nowrap':'normal',overflow:'hidden',textOverflow:'ellipsis',margin:'0',transform:'translateX('+(-50*p)+'%)',transition:'font-size .1s linear, top .1s linear, left .1s linear, transform .1s linear',pointerEvents:'none'});
    title.style.left=(w*p/2)+'px';
    // Stable flow extent: only the visual layers collapse. The document never changes its scroll range at the compact threshold.
    const key=[title.textContent,w,document.fonts.status].join('|');if(h._measureKey24!==key){const probe=title.cloneNode(true);probe.removeAttribute('data-screen-title');probe.removeAttribute('data-header-title23');probe.setAttribute('aria-hidden','true');Object.assign(probe.style,{position:'absolute',visibility:'hidden',pointerEvents:'none',width:w+'px',maxWidth:w+'px',fontSize:'30px',lineHeight:'1.05',fontWeight:'500',whiteSpace:'normal',height:'auto',maxHeight:'none',transform:'none',transition:'none',left:'0',top:'0',overflow:'visible'});h.append(probe);const measured=probe.offsetHeight;probe.remove();if(measured>0){h._titleHeight24=measured;h._measureKey24=key;}}const th=h._titleHeight24||31.5;
    const metaTop=53+th+9,progressTop=metaTop+42+9;
    if(meta){Object.assign(meta.style,{position:'absolute',left:'0',right:'0',top:(53+(th+9)*(1-p)-9*p)+'px',height:(42*(1-p))+'px',opacity:String(1-p),overflow:'hidden',margin:'0',transform:'none',transition:'height .1s linear, opacity .1s linear, top .1s linear'});meta.dataset.headerMeta23=''}
    let ph=0;if(prog){prog.dataset.headerProgress23='';Object.assign(prog.style,{position:'absolute',left:'0',right:'0',top:(53+(progressTop-53)*(1-p))+'px'});ph=prog.offsetHeight;}
    Object.assign(h.style,{height:(progressTop+ph)+'px',minHeight:(progressTop+ph)+'px',top:'0',padding:'0',marginTop:'0',gap:'0'});
    h.style.setProperty('--ju-head-visible',(53+(progressTop-53)*(1-p)+ph)+'px');
  }

/* ---- sync22：调用 syncHeader23，并用 --ju-head-visible 对票根内容做 clip-path；页脚可见时计算 --ju-footer-clearance ---- 来源：V27.code.html L4477-L4485 */
  sync22(){
    for(const id of ['s06','s11']){const phone=document.querySelector('#'+id+' .ju-phone');if(phone)phone.dataset.exitSlot24=String(id==='s06'?JuLedger.validTicket(this.record())||!!this.state.exitBurn23:this.record().proposal?.choice==='ask'||['burning','ash'].includes(this.state.p10));}
    const form=document.querySelector('#s03 .ju-form-content24'),ff=document.querySelector('#s03 .ju-form-footer');if(form){form.style.bottom=(ff?.offsetHeight?ff.offsetHeight+12:28)+'px';form.style.paddingBottom='28px'};
    document.querySelectorAll('#s03 [data-form-step]').forEach(el=>{const n=Number(el.dataset.formStep),m=this._cardMotion26,active=n===this.state.c3&&!this.state.sent&&!m;el.dataset.active=String(active);el.dataset.visible=String(!this.state.sent&&(m?(n===m.from||n===m.to):active));el.inert=!active;el.setAttribute('aria-hidden',String(!active));});
    for(const p of document.querySelectorAll('[data-scroll22]')){
      const h=p.querySelector('[data-header22]');if(h){this.syncHeader23(p,h);const content=p.querySelector('[data-ticket-content24]');if(content&&!content.hasAttribute('data-burn-layout26')){const ratio=p.closest('.ju-phone').getBoundingClientRect().width/p.closest('.ju-phone').offsetWidth;const cut=Math.max(0,(h.getBoundingClientRect().top+parseFloat(h.style.getPropertyValue('--ju-head-visible'))*ratio-content.getBoundingClientRect().top)/ratio);content.style.clipPath='inset('+cut+'px -90px -100px)';}}
      const screen=p.closest('.ju-phone')?.firstElementChild,footer=screen?.querySelector(':scope > [data-footer22]');
      if(footer){const on=Array.from(footer.querySelectorAll('button,[role=button]')).some(x=>x.getBoundingClientRect().height>0&&Number(x.style.opacity||getComputedStyle(x).opacity)>.01);const height=on?footer.offsetHeight+24:(p.closest('#s06g')?54:28);p.style.setProperty('--ju-footer-clearance',height+'px');footer.classList.toggle('ju-footer-active22',on)}
    }

/* ---- activateScreen 的 product 分支：切屏后回到顶部并 measureHeads ---- 来源：V27.code.html L2240-L2243 */
    if(document.documentElement.dataset.view==='product') {
      window.scrollTo(0,0);
      requestAnimationFrame(() => { this.measureHeads(); window.dispatchEvent(new Event('resize')); });
    }

/* ---- 对应 HTML 结构（V27.code.html L575-L590，s02；s05 为 L1023-L1031 的单层写法） ----
            <div data-scroll22="" sc-camel-on-scroll="{{onS02Scroll}}" data-s02-scroll="1" data-door-scroll="" style="{{s02ScrollStyle}}">
              <div data-header22="" style="{{s02StickyStyle}}">
                <div style="{{s02BackWrap}}">
                  <div sc-camel-on-click="{{back02}}" role="button" tabindex="0" aria-label="返回找局" style="{{backPillStyle}}" style-active="transform:scale(.9)" style-hover="background:rgba(255,255,255,0.5)"><span style="{{backGlyphStyle}}">←</span><span style="{{backGlossStyle}}"></span></div>
                </div>
                <div style="{{s02HeadMove}}">
                  <span data-head="t02" data-screen-title="true" style="{{s02TitleStyle}}">{{eventTitle}}</span>
                  <div data-head="s02" data-head-row="1" style="{{s02SubRow}}">{{eventLine}} · {{needLabel}}</div>
                </div>
                <div style="{{s02ProgWrap}}">
                  <div style="display:flex;flex-direction:column;gap:8px;padding-bottom:12px">
                    <div style="display:flex;justify-content:space-between;gap:10px;font-family:var(--ju-font-ui);font-size:14px;line-height:1.5;letter-spacing:0"><span style="color:#4A5AD6;white-space:nowrap">已确认 {{lockedN}}/{{needN}}</span><span style="color:rgba(20,22,31,0.72);white-space:nowrap">已预留 {{pendingN}}</span></div>
                    <div style="height:5px;background:rgba(20,22,31,0.16);border-radius:999px;overflow:hidden"><div style="{{s02ProgressFill}}"></div></div>
                  </div>
                </div>
              </div>
---- */

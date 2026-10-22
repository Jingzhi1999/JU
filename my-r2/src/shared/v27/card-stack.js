/* ============================================================================
 * JU V27 共有语言提取 · card-stack.js
 * s03 报名表单卡栈：手势、卡位、色洗、提交/回退动画。逐字取自 V27 x-dc 应用脚本（行号为 V27.code.html）。
 * HTML 骨架（V27.code.html L697-L699、L795）：
 *   <div class="ju-form-stack" sc-camel-on-pointer-down="{{c3Down}}" sc-camel-on-key-down="{{onC3Key}}" style="height:calc(var(--ju-form-paper-height,430px) + 38px);perspective:1600px;touch-action:pan-y">
 *     <div class="ju-form-back26 ju-form-back-far26"></div><div class="ju-form-back26 ju-form-back-near26"></div>
 *     <div data-form-step="0" style="{{c1Outer}}"><div style="{{c1Inner}}"><div style="{{c1Wash}}">…</div> …字段… </div></div>  × 5（data-form-step 0..4）
 *   </div><div class="ju-form-nav26">…步骤点 / "右滑填好 · 左滑放回"…</div>
 * 调用链：c3Down → startCard3(e)（轴判定 8px、|fx|>|dy|·1.2）→ prepareCard26(to,dir,dx) 建 _cardMotion26 → 每帧 paintCardFrame27 写 cardPose26 与色洗
 *   → 松手：dx>84 nextCard3() / dx<-84 goCard3(c3-1) / 否则 animateCard26(0,false) 回弹 → animateCard26 用 rAF 插值 p（缓动 1-(1-t)^3.35）→ 落定 setState({c3}) 并 restoreCardPaint27。
 * 校验：card3Ok(n)（称呼 ≤10 字、微信号 [A-Za-z0-9_-]、留言 ≤40 宽、邮箱可空或已验证）；不通过时 reject3(n) 触发红色色洗 "还差必填" + juShake。
 * ========================================================================== */

/* ---- vals03：输入框、纸面 cardInner、色洗 washFor、卡头文案（节选 L2721-L2763） ---- 来源：V27.code.html L2721-L2763 */
  vals03(s) {
    const ci = s.c3, cx = s.c3x, dp = Math.min(1, Math.abs(cx) / 130), N = this.CARDS3;
    const cTr = 'transform .62s cubic-bezier(.16,.86,.2,1.005), opacity .44s ease, box-shadow .4s ease';
    const nickR = this.NICK_MAX - this.wid(s.nick);
    const noteR = this.NOTE_MAX - this.wid(s.note);
    const okAll = this.card3Ok(1) && this.card3Ok(2);
    const curOk = this.card3Ok(ci + 1);
    const inputBase = err => ({ width: '100%', border: 'none', borderBottom: '1.5px solid ' + (err ? '#DA3A52' : 'rgba(20,22,31,.14)'), background: 'transparent', fontSize: 18, fontWeight: 500, fontFamily: "'Noto Sans SC',sans-serif", color: '#14161F', padding: '10px 2px', boxSizing: 'border-box', letterSpacing: '.02em', transition: 'border-color .25s' });
    const cardOuter = n => this.cardPose26(n);
    const cardInner = n => {
      const active = (n - 1) === ci, bad = s.err3 === n && active;
      const lift = active && this._cardMotion26 ? 1+Math.sin(Math.PI*this._cardMotion26.p)*.7 : 1;
      return { position: 'relative', width: '100%', height: '100%', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', gap: 12, padding: '18px 20px 16px', borderRadius: 26, overflowY: 'auto', overflowX:'hidden', touchAction:'pan-y',
        background: 'linear-gradient(176deg,rgba(255,255,255,.965) 0%,rgba(250,251,255,.945) 54%,rgba(245,247,255,.935) 100%)',
        backdropFilter: 'blur(26px) saturate(1.5)', WebkitBackdropFilter: 'blur(26px) saturate(1.5)',
        boxShadow: bad ? 'inset 0 0 0 1.5px rgba(218,58,82,.62), 0 30px 70px -26px rgba(150,34,70,.5)'
          : (active ? 'inset 0 0 0 1px rgba(255,255,255,.62), inset 0 0 0 1.6px rgba(20,22,31,.055), 0 ' + (12 * lift).toFixed(0) + 'px ' + (26 * lift).toFixed(0) + 'px -10px rgba(20,26,52,.24), 0 8px 22px -14px rgba(20,26,52,.3)'
            : 'inset 0 0 0 1px rgba(255,255,255,.5), inset 0 0 0 1.4px rgba(20,22,31,.05), 0 20px 46px -26px rgba(20,26,52,.42)'),
        animation: bad && !s.c3drag ? ((s.shakeKey % 2 ? 'juShakeB' : 'juShakeA') + ' .5s cubic-bezier(.36,.07,.19,.97) both') : 'none' };
    };
    const SW = 132;
    const washFor = () => {
      const dir = cx > 0 ? 1 : -1;
      const t = Math.min(1, Math.abs(cx) / SW);
      const green = dir > 0, blocked = green && !curOk, last = ci === N - 1;
      const tint = blocked ? '218,58,82' : (green ? '30,167,124' : '74,120,214');
      return {
        wash: { position: 'absolute', inset: 0, zIndex: 40, borderRadius: 26, pointerEvents: 'none', overflow: 'hidden',
          opacity: t === 0 ? 0 : Math.min(1, 0.5 + t * 0.9),
          background: 'linear-gradient(' + (green ? '108deg' : '252deg') + ',rgb(' + tint + ') 0%,rgba(' + tint + ',0.97) 58%,rgba(' + tint + ',0.94) 100%)',
          clipPath: green ? 'polygon(0% 0%, ' + (t * 118).toFixed(1) + '% 0%, ' + (t * 96).toFixed(1) + '% 100%, 0% 100%)' : 'polygon(' + (100 - t * 118).toFixed(1) + '% 0%, 100% 0%, 100% 100%, ' + (100 - t * 96).toFixed(1) + '% 100%)',
          transition: s.c3drag ? 'none' : 'opacity .3s ease, clip-path .42s cubic-bezier(.2,.9,.3,1)' },
        inner: { position: 'absolute', zIndex: 41, top: 26, left: green ? 24 : 'auto', right: green ? 'auto' : 24, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 11,
          transform: 'rotate(' + (green ? -4 : 4) + 'deg) translateY(' + ((1 - t) * 14).toFixed(1) + 'px) scale(' + (0.9 + t * 0.1).toFixed(3) + ')',
          opacity: Math.max(0, (t - 0.12) / 0.5), transition: s.c3drag ? 'none' : 'all .34s cubic-bezier(.2,.9,.3,1.04)' },
        ring: { width: 44, height: 44, borderRadius: '50%', boxShadow: 'inset 0 0 0 2.5px rgba(255,255,255,.92)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 19, color: '#FFFFFF', lineHeight: 1 },
        glyph: blocked ? '!' : (green ? (last ? '↗' : '✓') : '↺'),
        text: { fontWeight: 700, fontSize: 25, lineHeight: 1.12, letterSpacing: '0.01em', color: '#FFFFFF', maxWidth: 150, textShadow: '0 1px 12px rgba(0,0,0,.14)' },
        label: blocked ? '还差必填' : (green ? (last ? '递给局主' : (ci + 1) + '/5 填好了') : (ci === 0 ? '已经是第一张' : '回上一张')),
      };
    };
    const heads = [
      { i: '01', k: '怎么称呼', bad: 1 }, { i: '02', k: '微信号', bad: 2 },

/* ---- vals03 尾部：把 outer/inner/wash 逐张写入 c1…c5 ---- 来源：V27.code.html L2841-L2861 */
    const w = washFor();
    for (let n = 1; n <= N; n++) {
      const h = heads[n - 1], active = (n - 1) === ci, bad = s.err3 === n;
      out['c' + n + 'Outer'] = cardOuter(n);
      out['c' + n + 'Inner'] = cardInner(n);
      out['c' + n + 'Idx'] = h.i;
      out['c' + n + 'Key'] = h.k;
      out['c' + n + 'BadgeText'] = h.bad ? (bad ? '还差这项' : (this.card3Ok(n) ? '已填好' : '必填')) : '选填';
      out['c' + n + 'Badge'] = { fontFamily: "'Space Mono',monospace", fontSize: 13, letterSpacing: '.16em', fontWeight: 700, whiteSpace: 'nowrap', padding: '6px 10px', borderRadius: 999,
        color: bad ? '#DA3A52' : (h.bad && this.card3Ok(n) ? '#0E9B76' : 'rgba(20,22,31,.42)'),
        background: bad ? 'rgba(218,58,82,.08)' : (h.bad && this.card3Ok(n) ? 'rgba(14,155,118,.08)' : 'rgba(20,22,31,.04)'),
        boxShadow: 'inset 0 0 0 1px ' + (bad ? 'rgba(218,58,82,.22)' : (h.bad && this.card3Ok(n) ? 'rgba(14,155,118,.2)' : 'rgba(20,22,31,.07)')), transition: 'all .25s' };
      out['c' + n + 'Wash'] = active ? w.wash : { display: 'none' };
      out['c' + n + 'WashInner'] = active ? w.inner : { display: 'none' };
      out['c' + n + 'WashRing'] = active ? w.ring : { display: 'none' };
      out['c' + n + 'WashGlyph'] = active ? w.glyph : '';
      out['c' + n + 'WashText'] = active ? w.text : { display: 'none' };
      out['c' + n + 'WashLabel'] = active ? w.label : '';
    }
    return out;
  }

/* ---- card3Ok / firstGap3 ---- 来源：V27.code.html L2123-L2131 */
  card3Ok(n) {
    const s = this.state;
    if (n === 1) return !!(s.nick || '').trim() && this.nickLength20(s.nick)<=10 && !this._nickComposing20;
    if (n === 2) return /^[A-Za-z0-9_-]+$/.test((s.wx||'').trim());
    if(n===3)return !this._noteComposing27&&!JuLedger.noteError(s.note);
    if(n===4)return !s.mail.trim()||(/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s.mail.trim())&&s.mStep==='ok');
    return true;
  }
  firstGap3() { for (let n = 1; n <= this.CARDS3; n++) if (!this.card3Ok(n)) return n; return 0; }

/* ---- cardKey26 / cardGeometry26 / cancelCard26 / syncCard26 / prepareCard26 ---- 来源：V27.code.html L4625-L4646 */
  cardKey26(){return this.record().id+'|'+this.EVENT.version+'|'+this._scene19;}
  cardGeometry26(){const phone=document.querySelector('#s03 .ju-phone'),stack=phone?.querySelector('.ju-form-stack'),r=phone?.getBoundingClientRect();return[innerWidth,innerHeight,phone?.offsetWidth,phone?.offsetHeight,r?.width,r?.height,stack?.offsetWidth,stack?.offsetHeight].map(n=>Math.round((n||0)*1000)/1000).join('|');}
  cancelCard26(update=true,finishSaved=false){
    cancelAnimationFrame(this._cardPaintRAF27);this._cardPaintRAF27=0;
    const nodes=this._cardNodes27,hand=this._submitHandoff27;this._cardNodes27=null;this._submitHandoff27=null;this._submitAnim23=false;
    cancelAnimationFrame(this._cardRAF26);this._cardToken26=(this._cardToken26||0)+1;this._cardMotion26=null;this._cardQueued26=null;
    if(this._cOff){const off=this._cOff;this._cOff=null;off(true)}
    if(update&&(this.state.c3x||this.state.c3drag))this.setState({c3x:0,c3drag:false});
    this.restoreCardPaint27(nodes);
    if(hand&&hand.key===this.cardKey26()){
      if(finishSaved&&document.documentElement.dataset.screen==='s03'){this._submitHandoff27=hand;this.finishSubmit27(hand);}
      else this.setState({sent:!hand.waitlist,submitting3:false});
    }
  }
  syncCard26(){const m=this._cardMotion26;if(m&&(m.key!==this.cardKey26()||this.state.c3!==m.from||this.state.sent||document.documentElement.dataset.screen!=='s03'))this.cancelCard26();}
  prepareCard26(to,dir,logical=0){
    cancelAnimationFrame(this._cardRAF26);this._cardToken26=(this._cardToken26||0)+1;
    const from=this.state.c3,el=document.querySelector('#s03 [data-form-step="'+from+'"]');if(!el)return null;
    this._cardNodes27=[...document.querySelectorAll('#s03 [data-form-step]')];
    const m=this._cardMotion26={from,to,dir,p:Math.min(1,Math.abs(logical)/(1.2*el.offsetWidth)),logical,w:el.offsetWidth,h:el.offsetHeight,key:this.cardKey26(),geometry26:this.cardGeometry26(),running:false,reduced:this.otpReduced()};
    this.setState({c3x:logical,c3drag:true});return m;
  }

/* ---- cardPose26：五张纸的位置 / 旋转 / 缩放（含 reduced-motion 分支） ---- 来源：V27.code.html L4647-L4655 */
  cardPose26(n){
    const i=n-1,m=this._cardMotion26,base={position:'absolute',left:0,right:0,top:38,height:'calc(100% - 38px)',boxSizing:'border-box',transition:'none',transformOrigin:'50% 0%',visibility:'hidden',opacity:0,zIndex:4,pointerEvents:'none'};
    if(!m){if(i===this.state.c3)Object.assign(base,{visibility:'visible',opacity:1,zIndex:5,transform:'translate3d(0,0,0) rotateZ(0deg) rotateY(0deg) scale(1)',pointerEvents:'auto',cursor:'grab'});return base;}
    const p=m.p,a=Math.sin(Math.PI*p),q=1-p;
    if(m.reduced){if(i===m.from||i===m.to)Object.assign(base,{visibility:'visible',opacity:i===m.from?1-p:p,zIndex:i===m.from?5:4,transform:'translateX('+(i===m.from?m.dir*8*p:-m.dir*8*(1-p))+'px)'});return base;}
    if(i===m.from){const pose=p,angle=62*pose*Math.PI/180,scale=Math.min(1,m.h/(Math.cos(angle)*m.h+Math.sin(angle)*m.w));Object.assign(base,{visibility:'visible',opacity:1,zIndex:5,transformOrigin:'50% 50%',transform:'translate3d('+(m.dir*1.35*m.w*pose)+'px,0,0) rotateZ('+(m.dir*62*pose)+'deg) rotateY(0deg) scale('+scale+')',cursor:'grabbing'});}
    else if(i===m.to)Object.assign(base,{visibility:'visible',opacity:1,zIndex:4,transform:'translate3d('+(-m.dir*9*a)+'px,'+(-19*q)+'px,0) rotateZ('+(-m.dir*2*a)+'deg) rotateY(0deg) scale('+(.951+.049*p)+')'});
    return base;
  }

/* ---- animateCard26 / formBack27 / scheduleCardPaint27 / restoreCardPaint27 / paintCardFrame27 ---- 来源：V27.code.html L4656-L4687 */
  animateCard26(target,commit,after){
    const m=this._cardMotion26;if(!m)return;if(m.key!==this.cardKey26()){this.cancelCard26();return}
    cancelAnimationFrame(this._cardRAF26);const token=this._cardToken26=(this._cardToken26||0)+1,start=m.p,fromX=m.logical,endX=target?m.dir*1.2*m.w:0,ms=m.reduced?(target?170:100):(target?840*Math.max(.32,Math.abs(target-start)):360);m.running=true;let started;
    const tick=now=>{if(token!==this._cardToken26||m!==this._cardMotion26)return;if(m.key!==this.cardKey26()||document.documentElement.dataset.screen!=='s03'){this.cancelCard26();return}started??=now;const t=Math.min(1,(now-started)/ms),e=1-Math.pow(1-t,3.35);m.p=start+(target-start)*e;m.logical=fromX+(endX-fromX)*e;this.paintCardFrame27();
      if(t<1){this._cardRAF26=requestAnimationFrame(tick);return}const queued=this._cardQueued26;this._cardQueued26=null;this._cardMotion26=null;if(!this._submitHandoff27){this.setState({c3:commit?m.to:m.from,c3x:0,c3drag:false,notificationSeen22:this.state.notificationSeen22||(commit&&m.to===4)});this.restoreCardPaint27(this._cardNodes27);}if(after)after();else if(queued!==null&&queued!==undefined)requestAnimationFrame(()=>{if(token===this._cardToken26&&m.key===this.cardKey26())this.goCard3(queued)});
    };this._cardRAF26=requestAnimationFrame(tick);
  }
  formBack27(far){
    const m=this._cardMotion26,index=m?Math.max(m.from,m.to):this.state.c3,count=Math.min(2,4-index);
    return {display:!this.state.sent&&count>=(far?2:1)?'block':'none'};
  }
  scheduleCardPaint27(){if(!this._cardPaintRAF27)this._cardPaintRAF27=requestAnimationFrame(()=>{this._cardPaintRAF27=0;this.paintCardFrame27()});}
  restoreCardPaint27(nodes){
    if(!nodes?.length)return;const vals=this.vals03({...this.state,c3x:0,c3drag:false});
    for(const el of nodes){if(!el.isConnected)continue;const n=Number(el.dataset.formStep)+1,pose=this.cardPose26(n);
      for(const key of ['transform','transformOrigin','visibility','opacity','zIndex','pointerEvents','cursor'])el.style[key]=pose[key]??'';
      const paper=el.firstElementChild,wash=paper?.firstElementChild;if(paper)paper.style.boxShadow=vals['c'+n+'Inner'].boxShadow;if(wash){wash.style.opacity='0';if(wash.firstElementChild)wash.firstElementChild.style.opacity='0';}
    }
  }
  paintCardFrame27(){
    const m=this._cardMotion26;if(!m)return;
    const nodes=this._cardNodes27;if(!nodes?.length)return;
    for(const el of nodes){const n=Number(el.dataset.formStep),pose=this.cardPose26(n+1);for(const key of ['transform','transformOrigin','visibility','opacity','zIndex','pointerEvents','cursor'])el.style[key]=pose[key]??'';}
    const paper=nodes[m.from]?.firstElementChild,wash=paper?.firstElementChild,inner=wash?.firstElementChild;if(!paper||!inner)return;
    const p=m.p,lift=1+Math.sin(Math.PI*p)*.7,cx=m.logical,t=Math.min(1,Math.abs(cx)/132),green=cx>0,blocked=green&&!this.card3Ok(m.from+1),tint=blocked?'218,58,82':green?'30,167,124':'74,120,214';
    if(this.state.err3!==m.from+1)paper.style.boxShadow='inset 0 0 0 1px rgba(255,255,255,.62), inset 0 0 0 1.6px rgba(20,22,31,.055), 0 '+(12*lift).toFixed(0)+'px '+(26*lift).toFixed(0)+'px -10px rgba(20,26,52,.24), 0 8px 22px -14px rgba(20,26,52,.3)';
    Object.assign(wash.style,{opacity:t===0?'0':String(Math.min(1,.5+t*.9)),background:'linear-gradient('+(green?'108deg':'252deg')+',rgb('+tint+') 0%,rgba('+tint+',0.97) 58%,rgba('+tint+',0.94) 100%)',clipPath:green?'polygon(0% 0%, '+(t*118).toFixed(1)+'% 0%, '+(t*96).toFixed(1)+'% 100%, 0% 100%)':'polygon('+(100-t*118).toFixed(1)+'% 0%, 100% 0%, 100% 100%, '+(100-t*96).toFixed(1)+'% 100%)',transition:'none'});
    Object.assign(inner.style,{left:green?'24px':'auto',right:green?'auto':'24px',transform:'rotate('+(green?-4:4)+'deg) translateY('+((1-t)*14).toFixed(1)+'px) scale('+(.9+t*.1).toFixed(3)+')',opacity:String(Math.max(0,(t-.12)/.5)),transition:'none'});
    if(inner.children[0])inner.children[0].textContent=blocked?'!':green?(m.from===4?'↗':'✓'):'↺';
    if(inner.children[1])inner.children[1].textContent=blocked?'还差必填':green?(m.from===4?'递给局主':(m.from+1)+'/5 填好了'):(m.from===0?'已经是第一张':'回上一张');
    for(const [selector,far]of [['.ju-form-back-far26',true],['.ju-form-back-near26',false]]){const el=nodes[0]?.parentElement.querySelector(selector);if(el)el.style.display=this.formBack27(far).display;}
  }

/* ---- cardError26 / reject3 / goCard3 / nextCard3 / startCard3 / vals26Form ---- 来源：V27.code.html L4688-L4720 */
  cardError26(n){return n===1?(this.nickLength20(this.state.nick)>10?'称呼最多10个字':'请填写称呼'):n===2?(this.state.wx.trim()?'微信号仅填写字母、数字、下划线或短横线':'请填写微信号'):n===3?'留言最多20个汉字或40个英文字母':'请完成邮箱验证，或清空后跳过';}
  reject3(n){
    const finish=()=>{this.setState(x=>({c3:n-1,c3x:0,c3drag:false,err3:n,shakeKey:x.shakeKey+1,formError20:this.cardError26(n)}));this.focusStep18()};
    this.setState({err3:n,formError20:this.cardError26(n)});
    if(this._cardMotion26&&this._cardMotion26.from===n-1){this.animateCard26(0,false,finish);return}
    this.cancelCard26(false);finish();
  }
  goCard3(i){
    if(this._submitAnim23||this.state.sent||this._noteComposing27||this._nickComposing20)return;const target=Math.max(0,Math.min(this.CARDS3-1,i)),from=this.state.c3;
    if(this._cardMotion26?.running){if(target===from)this.animateCard26(0,false);else this._cardQueued26=target;return}
    if(target===from){if(this._cardMotion26)this.animateCard26(0,false);else if(i<0)this.toast('s03','已经是第一张');return}
    if(target>from){const bad=this.firstGap3();if(bad&&bad<=target){if(bad-1===from){this.reject3(bad);return}this.prepareCard26(bad-1,Math.sign(bad-1-from));this.animateCard26(1,true,()=>this.reject3(bad));return}}
    const m=this._cardMotion26;if(!m||m.to!==target||m.from!==from)this.prepareCard26(target,Math.sign(target-from));
    this.setState({err3:0,formError20:'',submitError22:''});this.animateCard26(1,true);
  }
  nextCard3(){if(this._noteComposing27||this._nickComposing20||this._submitAnim23||this.state.sent)return;const ci=this.state.c3;if(this._cardMotion26?.running){this._cardQueued26=Math.min(4,ci+1);return}if(ci<4){if(!this.card3Ok(ci+1)){this.reject3(ci+1);return}this.goCard3(ci+1);return}this.presentSubmit23();}
  startCard3(e){
    if(this._submitAnim23||this.state.sent||this._noteComposing27||this._nickComposing20||e.button!==0||e.target.closest('input,textarea,button,[data-nodrag],[role="button"]'))return;
    if(this._cOff)this._cOff(true);cancelAnimationFrame(this._cardRAF26);this._cardToken26=(this._cardToken26||0)+1;
    const existing=this._cardMotion26;if(existing)existing.running=false;
    const el=e.currentTarget,pid=e.pointerId,sx=e.clientX,sy=e.clientY,scale=el.getBoundingClientRect().width/el.offsetWidth||1,base=existing?.logical||0;this._cardGestureGeometry26=this.cardGeometry26();let axis=null,dx=base,closed=false;
    const off=(hard=false)=>{if(closed)return;closed=true;window.removeEventListener('pointermove',move);window.removeEventListener('pointerup',up);window.removeEventListener('pointercancel',cancel);try{el.releasePointerCapture(pid)}catch{}this._cOff=null;this._cardGestureGeometry26=null;if(hard){cancelAnimationFrame(this._cardRAF26);this._cardToken26=(this._cardToken26||0)+1;this._cardMotion26=null;}};
    const move=ev=>{if(ev.pointerId!==pid)return;const fx=(ev.clientX-sx)/scale,dy=(ev.clientY-sy)/scale;dx=base+fx;if(!axis&&Math.hypot(fx,dy)>8){axis=Math.abs(fx)>Math.abs(dy)*1.2?'x':'y';if(axis==='x'){try{el.setPointerCapture(pid)}catch{}}}if(axis!=='x')return;ev.preventDefault();const dir=dx>=0?1:-1,from=this.state.c3,blocked=dir>0&&!this.card3Ok(from+1),to=blocked?from:Math.max(0,Math.min(4,from+dir));let m=this._cardMotion26;if(!m||m.dir!==dir||m.to!==to)m=this.prepareCard26(to,dir,dx);if(!m)return;m.logical=dx;m.p=Math.min(1,Math.abs(dx)/(1.2*m.w));this.scheduleCardPaint27();};
    const cancel=ev=>{if(ev&&ev.pointerId!==undefined&&ev.pointerId!==pid)return;off();if(this._cardMotion26)this.animateCard26(0,false);else this.setState({c3x:0,c3drag:false});};
    const up=ev=>{if(ev.pointerId!==pid)return;off();if(axis!=='x'){if(existing)this.animateCard26(0,false);return}if(dx>84)this.nextCard3();else if(dx< -84)this.goCard3(this.state.c3-1);else if(this._cardMotion26)this.animateCard26(0,false);};
    window.addEventListener('pointermove',move,{passive:false});window.addEventListener('pointerup',up);window.addEventListener('pointercancel',cancel);this._cOff=hard=>hard?off(true):cancel();
  }
  vals26Form(s){
    const base={width:'100%',border:'none',borderBottom:'1.5px solid rgba(20,22,31,.14)',background:'transparent',fontFamily:'var(--ju-font-ui)',fontSize:18,fontWeight:400,lineHeight:1.5,letterSpacing:0,color:'#14161f',padding:'10px 2px',boxSizing:'border-box'},error=n=>({...base,borderBottomColor:s.err3===n?'#DA3A52':'rgba(20,22,31,.14)'});
    const out={formBackFar27:this.formBack27(true),formBackNear27:this.formBack27(false),nickInputStyle:error(1),wxInputStyle:error(2),noteInputStyle:error(3),mailInput26:error(4),formFinal26:s.c3===4,formGesture26:s.c3===4?'右滑递交报名':'右滑填好 · 左滑放回',sent3CtaStyle:this.blueCta(!s.submitting3),formBusy25:!!this._submitAnim23||s.submitting3||!!this._cardMotion26?.running};
    for(let n=1;n<=5;n++)out['c'+n+'Outer']=this.cardPose26(n);
    return out;
  }

/* ---- 对应 HTML（V27.code.html L697-L699 栈与第一张的开头；L795 导航） ----
                <div sc-camel-on-pointer-down="{{c3Down}}" sc-camel-on-key-down="{{onC3Key}}" tabindex="0" class="ju-form-stack" role="group" aria-label="报名卡组，左右键切换；最后一步按 Enter 递交" style="position:relative;flex:none;height:calc(var(--ju-form-paper-height,430px) + 38px);perspective:1600px;touch-action:pan-y">
                  <div style="{{formBackFar27}}" class="ju-form-back26 ju-form-back-far26" aria-hidden="true"></div><div style="{{formBackNear27}}" class="ju-form-back26 ju-form-back-near26" aria-hidden="true"></div><div data-form-step="0" style="{{c1Outer}}"><div style="{{c1Inner}}">
                  <div style="{{c1Wash}}"><div style="{{c1WashInner}}"><div style="{{c1WashRing}}">{{c1WashGlyph}}</div><span style="{{c1WashText}}">{{c1WashLabel}}</span></div></div>
<div class="ju-form-nav26"><div class="ju-step-dots"><sc-for list="{{cardDots3}}" as="d" hint-placeholder-count="5"><button aria-label="{{d.label}}" style="{{d.style}}" sc-camel-on-click="{{d.onPick}}"><span style="{{d.dot}}"></span></button></sc-for></div><p class="ju-form-gesture26">{{formGesture26}}</p><sc-if value="{{hasSubmitError22}}"><p class="ju-form-error" role="alert">{{submitError22}}</p></sc-if></div>
---- */

/* ============================================================================
 * JU V27 共有语言提取 · ju-card.js
 * 局卡的 3D 自转 / 拖拽 / 锁定翻面（"翻面"）的真实实现，逐字取自 V27 x-dc 应用脚本（行号为 V27.code.html）。
 * 参与元素（见 ju-card.css）：[data-spin-host]（宿主，写 rotateX/rotateY）、[data-spin-face=front|back]（写 brightness/saturate 滤镜）、
 *   [data-spin-edge]（写 opacity）、[data-spin-shadow]（写 scaleX/opacity）、[data-spin-sheen]（写 translateX 光带）。
 * 状态机（每张卡 h）：a 角度、v 角速度(°/s)、tilt 俯仰、drag、rest、to（锁定目标角，data-spin-to）。
 *   - 自转：data-spin-run!="0" 且非 reduced-motion → v 以 1-exp(-dt*1.25) 追到 SPIN_DPS=30°/s，tilt 追到 6°。
 *   - 拖拽：startSpin：a = a0 + dx*0.78（°/px），tilt = clamp(t0 - dy*0.2, ±24)；松手把速度 clamp ±1400°/s 后继续转（最小 30°/s）。
 *   - 锁定翻面（flip05 / data-spin-to）：从当前角到 180 或 540，1020ms，缓动 e = 1 + 2.14q³ + 1.14q²（q=k-1，轻微过冲），tilt 以 1-exp(-dt*3.4) 归零；
 *     到点后 onSettle：角取整到 180 的倍数，rest=true（保持终态不再转），f5='open' 进入阅读态，卡壳在 1.02s 内放大到 min(100%,328px)×min(100%,460px)。
 *   - 亮度：filter brightness(.80+.30·|cos a|^.7) saturate(.92+.16·|cos a|)；侧棱 opacity .35+.65·|sin a|^2.2；投影 scaleX .42+.58|cos a|。
 * ========================================================================== */

/* ---- spinInit：收集 [data-spin-host]、IntersectionObserver 控制、逐帧状态机与绘制 ---- 来源：V27.code.html L1983-L2071 */
  // 局卡 3D 自转 —— 02 门口 + 03B 共用同一套角度（与 v17 05 同参数）
  spinInit() {
    cancelAnimationFrame(this._spinRaf); clearTimeout(this._spinFind);
    const W = window;
    const gen = (W.__juEntrySpinGen = (W.__juEntrySpinGen || 0) + 1);
    this.SPIN_DPS = 30;
    this._sLast = 0;
    const collect = () => Array.prototype.slice.call(document.querySelectorAll('[data-spin-host]')).map(el => ({
      el: el,
      sheens: Array.prototype.slice.call(el.querySelectorAll('[data-spin-sheen]')),
      fF: el.querySelector('[data-spin-face="front"]'),
      fB: el.querySelector('[data-spin-face="back"]'),
      sh: el.parentElement ? el.parentElement.querySelector('[data-spin-shadow]') : null,
      ed: el.querySelector('[data-spin-edge]'),
      a: 0, v: 0, tilt: 0, drag: false, visible:false, needsPaint:true,      // 每张卡自己的角度：没开门之前正面朝人、纹丝不动
    }));
    const find = () => {
      if (gen !== W.__juEntrySpinGen) return;
      const hosts = collect();
      if (!hosts.length) { this._spinFind = setTimeout(find, 500); return; }
      this._hosts = hosts;
      this._spinIO && this._spinIO.disconnect();
      this._spinIO=new IntersectionObserver(entries=>{entries.forEach(e=>{const h=this._hosts.find(h=>h.el===e.target);if(h)h.visible=e.isIntersecting;});this._spinWake && this._spinWake();});
      hosts.forEach(h=>this._spinIO.observe(h.el));
      let frame = 0;
      const loop = now => {
        if (gen !== W.__juEntrySpinGen) return;
        frame++;
        if (!this._hosts.length || !this._hosts[0].el.isConnected || (frame % 150 === 0 && document.querySelectorAll('[data-spin-host]').length !== this._hosts.length)) {
          this._hosts = collect().filter(h => h.el.isConnected);
          if (!this._hosts.length) { this._spinFind = setTimeout(find, 500); return; }
        }
        this._spinRaf=0;
        if(document.hidden)return;
        let active=false;
        const dt = Math.min(0.05, this._sLast ? (now - this._sLast) / 1000 : 0.016);
        this._sLast = now;
        for (let i = 0; i < this._hosts.length; i++) {
          const h = this._hosts[i];
          if (!h.el.isConnected) continue;
          if(!h.visible||this._dialogToken)continue;
          const run = h.el.getAttribute('data-spin-run') !== '0' && !this.otpReduced() && !h.rest;
          const to = h.el.getAttribute('data-spin-to');
          const moving=h.drag || run || (to && (h.to!==+to || now-h.tFrom<1100)) || (!h.rest && (Math.abs(h.a)>.03 || Math.abs(h.tilt)>.03));
          if(!moving && !h.needsPaint)continue;active=active||moving;h.needsPaint=false;
          if (to) {                                          // 锁定落面：一条带轻微过冲的曲线推到目标角
            const tv = +to;
            if (h.to !== tv) { h.to = tv; h.aFrom = h.a; h.tFrom = now; }
            const k = this.otpReduced()?1:Math.min(1, (now - h.tFrom) / 1020);
            const q = k - 1, e = 1 + 2.14 * q * q * q + 1.14 * q * q;
            h.a = h.aFrom + (h.to - h.aFrom) * e;
            h.v = 0;
            h.tilt += (0 - h.tilt) * (1 - Math.exp(-dt * 3.4));
          } else if (h.drag) {
            // 角度由指针直接写
          } else if (run) {                                   // 落位之后才起转：转速从 0 缓缓推到额定
            h.v += (this.SPIN_DPS - h.v) * (1 - Math.exp(-dt * 1.25));
            h.a += h.v * dt;
            h.a=((h.a%360)+360)%360;
            h.tilt += (6 - h.tilt) * (1 - Math.exp(-dt * 2.4));
          } else if(!h.rest) {                                // 未开始保持正面；完成后保留稳定终态
            h.v = 0;
            h.a += (0 - h.a) * (1 - Math.exp(-dt * 7));
            h.tilt += (0 - h.tilt) * (1 - Math.exp(-dt * 7));
            if (Math.abs(h.a) < 0.03) h.a = 0;
            if (Math.abs(h.tilt) < 0.03) h.tilt = 0;
          }
          const a = ((h.a % 360) + 360) % 360;
          const ar = a * Math.PI / 180;
          const cs = Math.cos(ar), sn = Math.abs(Math.sin(ar));
          const face = Math.abs(cs);
          const pp = (a < 180 ? a / 180 : (360 - a) / 180) * 235 - 48;
          const flt = 'brightness(' + (0.80 + 0.30 * Math.pow(face, 0.7)).toFixed(3) + ') saturate(' + (0.92 + 0.16 * face).toFixed(3) + ')';
          h.el.style.transform = 'rotateX(' + h.tilt.toFixed(2) + 'deg) rotateY(' + h.a.toFixed(2) + 'deg)';
          if (h.fF) h.fF.style.filter = flt;
          if (h.fB) h.fB.style.filter = flt;
          if (h.ed) h.ed.style.opacity = (0.35 + 0.65 * Math.pow(sn, 2.2)).toFixed(3);
          if (h.sh) { h.sh.style.transform = 'scaleX(' + (0.42 + 0.58 * face).toFixed(3) + ')'; h.sh.style.opacity = (0.42 + 0.48 * face).toFixed(3); }
          for (let k = 0; k < h.sheens.length; k++) h.sheens[k].style.transform = 'translateX(' + pp.toFixed(1) + '%)';
          if(to && h.onSettle && (this.otpReduced() || now-h.tFrom>=1020)) { const done=h.onSettle;h.onSettle=null;done(); }
        }
        if(active)this._spinRaf=requestAnimationFrame(loop);
      };
      this._spinWake=()=>{if(!this._spinRaf&&!document.hidden)this._spinRaf=requestAnimationFrame(loop);};
      this._spinVisible=()=>{if(document.hidden){cancelAnimationFrame(this._spinRaf);this._spinRaf=0;}else{this._sLast=0;this._spinWake();}};
      document.addEventListener('visibilitychange',this._spinVisible);this._spinWake();
    };
    find();
  }

/* ---- startSpin：指针拖拽（s02 / s05 / s06g / s09 的 sc-camel-on-pointer-down="{{spinDown}}"） ---- 来源：V27.code.html L2072-L2100 */
  startSpin(e) {
    if(e.target.closest('[data-reading]'))return;
    const el = e.currentTarget.querySelector('[data-spin-host]');
    const h = (this._hosts || []).filter(x => x.el === el)[0];
    if (!h) return;
    e.preventDefault();
    this._spinOff && this._spinOff();
    const pid=e.pointerId,scale=e.currentTarget.getBoundingClientRect().width/e.currentTarget.offsetWidth||1;
    const sx = e.clientX, sy = e.clientY, a0 = h.a, t0 = h.tilt;
    h.drag = true; this._spinWake && this._spinWake();
    let lx = sx, lt = performance.now();
    const mv = ev => {
      if(ev.pointerId!==pid)return;
      h.a = a0 + (ev.clientX - sx) / scale * 0.78;
      h.tilt = Math.max(-24, Math.min(24, t0 - (ev.clientY - sy) * 0.2));
      const now = performance.now();
      if (now - lt > 12) {
        h.v = Math.max(-1400, Math.min(1400, (ev.clientX - lx) * 0.78 / ((now - lt) / 1000)));
        lx = ev.clientX; lt = now;
      }
    };
    const up = () => {
      h.drag = false; this._sLast = 0;
      if (Math.abs(h.v) < this.SPIN_DPS) h.v = this.SPIN_DPS;
      window.removeEventListener('pointermove', mv); window.removeEventListener('pointerup', up); window.removeEventListener('pointercancel',up); this._spinOff = null;
    };
    window.addEventListener('pointermove', mv); window.addEventListener('pointerup', up); window.addEventListener('pointercancel',up);
    this._spinOff = up;
  }

/* ---- flip05：锁定翻到背面（s05 读约定） ---- 来源：V27.code.html L1942 */
  flip05(){const el=document.querySelector('[data-spin-host="s05"]'),host=this._hosts?.find(h=>h.el===el);if(!host){this._confirming5=false;this.setState({f5:'open'});return}host.rest=false;const scene=this._scene19;host.onSettle=()=>{if(scene!==this._scene19||this.record().application!=='approved')return;host.tilt=0;host.a=Math.round(host.a/180)*180;host.rest=true;host.needsPaint=true;this._confirming5=false;this.setState({f5:'open'});requestAnimationFrame(()=>document.querySelector('#s05 [data-reading]')?.focus({preventScroll:true}))};host.needsPaint=true;el.setAttribute('data-spin-run','0');const cur=((host.a%360)+360)%360;host.a=cur;el.setAttribute('data-spin-to',String(cur<180?180:540));this._spinWake();}

/* ---- readRules18 / confirmJoin18 / closeRead22：翻面进入阅读、读到末尾才可确认、返回 ---- 来源：V27.code.html L4234-L4235、L4390 */
  readRules18(){const r=this.record();JuLedger.expire(r);const m=JuLedger.member(r);if(r.status==='cancelled'||m?.status!=='invited'||r.application!=='approved'){this.refresh18();return false}document.querySelector('#s05 [data-reading]')?.scrollTo(0,0);document.querySelector('#s05 [data-card-block]')?.parentElement.scrollTo(0,0);const scene=this._scene19,epoch=this._routeEpoch22,id=r.id;const wrap=document.querySelector('[data-spin-host="s05"]')?.parentElement.parentElement,from=wrap?.getBoundingClientRect();this._confirming5=true;this._readIntent22=0;this.setState({f5:'flip',readKey22:JuLedger.ruleKey(r),readReached22:r.readReceipt?.key===JuLedger.ruleKey(r)});requestAnimationFrame(()=>{if(scene!==this._scene19||epoch!==this._routeEpoch22||id!==this.record().id||document.documentElement.dataset.screen!=='s05'||!from||!wrap?.isConnected)return;const to=wrap.getBoundingClientRect(),scale=wrap.closest('.ju-phone').getBoundingClientRect().width/wrap.closest('.ju-phone').offsetWidth;wrap.animate([{transform:'translate('+((from.left-to.left)/scale)+'px,'+((from.top-to.top)/scale)+'px)'},{transform:'translate(0,0)'}],{duration:1020,easing:'cubic-bezier(.16,.86,.2,1)',fill:'none'})});this.flip05();return true;}
  confirmJoin18(){if(this.state.f5!=='open'||!this.state.readReached22||this.state.readKey22!==JuLedger.ruleKey(this.record()))return false;if(!JuLedger.confirm(this.EVENT)){if(JuLedger.member(this.record())?.deadline>Date.now()&&this.record().status==='open')this.toast('s05','保存失败，请重试');this.refresh18();return false}this.refresh18();this.goTo('s06g');return true;}
  closeRead22(){

/* ---- s05 的卡壳 / 阅读层样式与标题（vals23） ---- 来源：V27.code.html L4341-L4351 */
      s05Title:m?.status==='confirmed'?'已确认入局':phase.label,
      s05CtaLabel:m?.status==='confirmed'?'查看成员':reading?'确认入局':'阅读细则',s05Busy:reading&&(s.f5!=='open'||!s.readReached22),s05CtaStyle:this.blueCta(!reading||s.f5==='open'&&s.readReached22),
      s05Cta:()=>{if(m?.status==='confirmed'){this.goTo('s06g');return}if(reading)this.confirmJoin18();else this.readRules18()},confirm5:()=>this.confirmJoin18(),
      s05BarLeft:pending?'剩余 '+String(Math.floor(s.t5/3600)).padStart(2,'0')+':'+String(Math.floor(s.t5/60)%60).padStart(2,'0')+':'+String(s.t5%60).padStart(2,'0'):m?.status==='confirmed'?'已确认':'00:00:00',
      s05ScrollStyle:{position:'absolute',inset:0,padding:'var(--ju-content-top,66px) 22px 120px',boxSizing:'border-box',overflowY:reading?'hidden':'auto',zIndex:2,opacity:s.q5==='done'?0:1,pointerEvents:s.q5==='done'?'none':'auto'},
      s05StickyStyle:{...this.header21(),display:'flex',flexDirection:'column',gap:9,opacity:reading?0:1,pointerEvents:reading?'none':'auto'},
      s05CardBlock:reading?{position:'absolute',inset:'48px 22px 112px',display:'flex',alignItems:'center',justifyContent:'center',zIndex:3}:{position:'relative',margin:'26px 0 18px',display:'flex',justifyContent:'center'},
      s05SpinWrap:{position:'relative',width:['flip','open'].includes(s.f5)?'min(100%,328px)':'196px',height:['flip','open'].includes(s.f5)?'min(100%,460px)':'245px',perspective:1150,perspectiveOrigin:'50% 46%',touchAction:reading?'pan-y':'none',cursor:reading?'auto':'grab',transition:'width 1.02s ease,height 1.02s ease'},
      s05DealLayer:{position:'absolute',inset:0,padding:'20px 18px 24px',boxSizing:'border-box',display:'flex',flexDirection:'column',overflowY:'auto',touchAction:'pan-y',opacity:s.f5==='open'?1:0,transition:'opacity .32s ease'},
      s05ListBlock:{display:reading?'none':'flex',flexDirection:'column',paddingBottom:20},s05LogoLayer:{position:'absolute',inset:0,display:s.f5==='open'?'none':'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:9},
      leave05Style:weak,leave05:()=>this.setState({q5:'sheet'}),q5Stay:()=>this.setState({q5:'idle'}),q5Quit:()=>this.quit18(),q5Back:()=>this.goTo('s01'),q5Other:()=>this.goTo('s01'),

/* ---- s02 门口：封套卡与 3D 卡同心同尺寸交接（sealed→door） ---- 来源：V27.code.html L2655-L2669 */
      s02StageStyle: { position: 'relative', height: door ? 328 : 'min(452px, calc(var(--ju-phone-height,844px) - 180px))', margin: '4px 0 2px', transition: 'height .84s ' + EZ, flexShrink: 0 },
      // 封套卡与 3D 卡全程同心同尺寸：一起缩、一起扭正，中途静静交接 —— 看上去就是同一张卡
      s02SealWrap: { position: 'absolute', left: '50%', top: '50%', width: 296, height: 370, margin: '-185px 0 0 -148px', zIndex: 5,
        transform: door ? 'scale(.716216) rotate(0deg)' : 'scale(var(--ju-seal-fit,1)) rotate(-1.3deg)',
        opacity: door ? 0 : 1, pointerEvents: door ? 'none' : 'auto',
        transition: 'transform .84s ' + EZ + ', top .84s ' + EZ + ', opacity .32s ease .30s' },
      // 雾透轻卷：mist 画布 / 抓手 / 提示与 03B · 09B 共用 mistKit（同一套几何与参数）
      s02Phase: s.s2m || 'sealed',
      spin02Run: s.spin2 ? '1' : '0',
      s02SpinWrap: { position: 'absolute', left: '50%', top: '50%', width: 212, height: 265, margin: '-132.5px 0 0 -106px', perspective: '1150px', perspectiveOrigin: '50% 46%',
        opacity: 1, transform: door ? 'scale(1) rotate(0deg)' : 'scale(calc(1.396226 * var(--ju-seal-fit,1))) rotate(-1.3deg)',
        pointerEvents: door ? 'auto' : 'none', touchAction: 'none', cursor: 'grab', userSelect: 'none',
        transition: 'transform .84s ' + EZ + ', top .84s ' + EZ + ', opacity .32s ease .30s' },
      s02BodyIn: { display: 'flex', flexDirection: 'column', opacity: door ? 1 : 0, transform: door ? 'translateY(0)' : 'translateY(28px)', transition: 'opacity .55s ease .62s, transform .8s ' + EZ + ' .62s' },
      s02CtaOn: door,

/* ---- activateScreen 对 s05 读态的复位（离开 s05 时取消锁定） ---- 来源：V27.code.html L2235 */
    if(id==='s04c')id='s04';if(id!=='s05'&&this.state.f5!=='idle'){this._readCloseCancel23?.();this.setState({f5:'idle'});const h=this._hosts?.find(h=>h.el.dataset.spinHost==='s05');if(h){h.onSettle=null;h.rest=false;h.to=null;h.el.removeAttribute('data-spin-to');h.el.dataset.spinRun='1'}}

/* ---- sync22 中阅读态标记 data-read-open23（配合 ju-card.css 的 #s05 [data-read-open23=true] 规则） ---- 来源：V27.code.html L4488 */
    const reader=document.querySelector('[data-spin-host="s05"]');if(reader)reader.dataset.readOpen23=String(this.state.f5==='open');

/* ---- 遗留的 2D "翻面" 辅助（flipBox/face/stack，v17 票根翻面）——V27 的 HTML 已不再引用（全文检索 flip12Box/face12F 为 0 处），仅作记录 ---- 来源：V27.code.html L4014-L4023、L4105-L4112 */
    const PAINT = 'transition:background .45s ease,color .45s ease,box-shadow .45s ease,opacity .45s ease';
    const flipBox = (on, live, hpx) => 'position:relative;width:100%;height:' + hpx + 'px;cursor:' + (live ? 'pointer' : 'default')
      + (live && !on ? ';animation:juBob 5.2s ease-in-out infinite' : '');
    const face = (shown, align) => 'position:absolute;left:0;top:0;right:0;bottom:0;pointer-events:none;'
      + 'display:flex;justify-content:center;align-items:' + (align || 'center') + ';'
      + 'transition:opacity .34s ease,transform .46s cubic-bezier(.2,.9,.3,1.04);'
      + (shown ? 'opacity:1;transform:scale(1)' : 'opacity:0;transform:scale(.94)');
    const stack = (show) => 'position:absolute;top:18px;bottom:18px;right:-4px;width:7px;border-radius:4px;pointer-events:none;'
      + 'background:linear-gradient(180deg,rgba(255,255,255,0),rgba(255,255,255,.92) 45%,rgba(255,255,255,0));'
      + 'box-shadow:0 0 14px 2px rgba(226,232,255,.55);transition:opacity .4s ease;opacity:' + (show ? 1 : 0);
      // ---- 11 票根翻面 + 退位挪到主键上方 ----
      flip11: () => this.setState(x => ({ flip11: !x.flip11, seen11: true })),
      flip12: () => this.setState(x => ({ flip12: !x.flip12, seen12: true })),
      flip12Box: flipBox(s.flip12, true, 355),
      seen12On: s.seen12,
      face12F: face(!s.flip12, 'flex-start') + ';border-radius:18px;overflow:hidden',
      face12B: face(s.flip12, 'flex-start'),
      flipCue12: stack(!s.flip12),

/* ---- 对应 HTML（V27.code.html L592-L615，s02 门口的 212×265 3D 卡；s05 为 L1033-L1068，196×245，背面多了 data-reading 阅读层） ----
                <div sc-camel-on-pointer-down="{{spinDown}}" style="{{s02SpinWrap}}">
                  <div style="position:relative;width:212px;height:265px;transform-style:preserve-3d">
                    <div data-spin-shadow="true" style="position:absolute;left:6%;right:6%;bottom:-26px;height:22px;border-radius:50%;background:radial-gradient(ellipse at center,rgba(24,28,58,0.34),rgba(24,28,58,0) 72%);filter:blur(5px);pointer-events:none"></div>
                    <div data-spin3d="true" data-spin-host="s02" data-spin-run="{{spin02Run}}" style="position:absolute;inset:0;transform-style:preserve-3d">
                      <div data-spin-edge="true" style="position:absolute;left:0;top:2px;bottom:2px;width:7px;transform:translateX(-3.5px) rotateY(90deg);background:linear-gradient(180deg,#FFFFFF 0%,#DFE4F4 22%,#FFFFFF 50%,#D9DFF2 78%,#FFFFFF 100%);box-shadow:0 0 10px rgba(255,255,255,0.55)"></div>
                      <div data-spin-face="front" style="position:absolute;inset:0;border-radius:13px;overflow:hidden;backface-visibility:hidden;-webkit-backface-visibility:hidden;box-shadow:0 42px 84px -28px rgba(18,22,48,0.55),0 10px 26px -12px rgba(18,22,48,0.35)">
                        <dc-import name="JuCardV2" status-label="{{eventCardStatus22}}" seat-caption="{{eventSeatCaption22}}" pack="{{heroPackVal}}" title="{{eventTitle}}" en="{{eventEn}}" date="{{eventDate}}" date-num="{{eventDateNum}}" time="{{eventTime}}" loc="{{eventLoc}}" seats="{{needLeftEntry}}" host="{{eventHost}}" num="{{eventCity}}" hint-size="212px,265px"></dc-import>
                        <div style="position:absolute;inset:0;pointer-events:none;opacity:0.2;background-image:radial-gradient(circle at 1px 1px,rgba(255,255,255,0.95) 1px,transparent 1.5px);background-size:7px 7px;mix-blend-mode:soft-light"></div>
                        <div style="position:absolute;inset:0;overflow:hidden;pointer-events:none"><div data-spin-sheen="true" style="position:absolute;top:-28%;bottom:-28%;left:0;width:44%;background:linear-gradient(102deg,rgba(255,255,255,0) 0%,rgba(226,234,255,0.42) 40%,rgba(255,255,255,0.88) 51%,rgba(214,228,255,0.36) 62%,rgba(255,255,255,0) 100%);mix-blend-mode:overlay;filter:blur(6px)"></div></div>
                        <div style="position:absolute;inset:0;pointer-events:none;border-radius:13px;box-shadow:inset 0 0 0 1px rgba(255,255,255,0.5)"></div>
                        <div style="position:absolute;top:-11px;left:50%;margin-left:-11px;width:22px;height:22px;border-radius:50%;background:rgba(16,18,30,0.16);box-shadow:inset 0 -3px 5px rgba(16,18,30,0.3)"></div>
                      <div style="position:absolute;bottom:-11px;left:50%;margin-left:-11px;width:22px;height:22px;border-radius:50%;background:rgba(16,18,30,0.16);box-shadow:inset 0 3px 5px rgba(16,18,30,0.3)"></div>
                      </div>
                      <div data-spin-face="back" style="position:absolute;inset:0;border-radius:13px;overflow:hidden;backface-visibility:hidden;-webkit-backface-visibility:hidden;transform:rotateY(180deg);background:linear-gradient(157deg,#FFFFFF 0%,#EAEDFB 40%,#DBE1F5 68%,#FDFDFF 100%);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:9px;box-shadow:0 42px 84px -28px rgba(18,22,48,0.55),inset 0 0 0 1px rgba(20,22,31,0.09)">
                        <div style="position:absolute;inset:0;pointer-events:none;opacity:0.34;background-image:radial-gradient(circle at 1px 1px,rgba(120,132,200,0.5) 1px,transparent 1.6px);background-size:8px 8px"></div>
                        <span style="font-family:'Libre Caslon Text',serif;font-weight:400;font-size:52px;line-height:1;letter-spacing:0.01em;color:#14161F;position:relative">JU<span style="color:#5361DC">.</span></span>
                        <span style="font-family:'Space Mono',monospace;font-size:8px;letter-spacing:0.42em;color:rgba(20,22,31,.66);position:relative">有 JU，就开局</span>
                        <span style="position:absolute;bottom:14px;left:0;right:0;text-align:center;font-family:'Space Mono',monospace;font-size:7.5px;letter-spacing:0.28em;color:rgba(20,22,31,.66)">· NEW YORK ·</span>
                        <div style="position:absolute;inset:0;overflow:hidden;pointer-events:none"><div data-spin-sheen="true" style="position:absolute;top:-28%;bottom:-28%;left:0;width:44%;background:linear-gradient(102deg,rgba(255,255,255,0) 0%,rgba(226,234,255,0.5) 40%,rgba(255,255,255,0.92) 51%,rgba(214,228,255,0.4) 62%,rgba(255,255,255,0) 100%);mix-blend-mode:overlay;filter:blur(6px)"></div></div>
                        <div style="position:absolute;top:-11px;left:50%;margin-left:-11px;width:22px;height:22px;border-radius:50%;background:rgba(16,18,30,0.13);box-shadow:inset 0 -3px 5px rgba(16,18,30,0.24)"></div>
                      <div style="position:absolute;bottom:-11px;left:50%;margin-left:-11px;width:22px;height:22px;border-radius:50%;background:rgba(16,18,30,0.13);box-shadow:inset 0 3px 5px rgba(16,18,30,0.24)"></div>
                      </div>
                    </div>
                  </div>
---- */

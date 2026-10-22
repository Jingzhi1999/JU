/* ============================================================================
 * JU V27 共有语言提取 · cta.js
 * 主要 CTA（冷蓝光感药丸）的真实构造：V27 里它是 JS 生成的内联样式对象 blueCta(on)，没有 class、没有伪元素、没有 SVG、没有 filter。
 * 结构（HTML）：<div role="button" style="{{blueCtaOn}}" style-active="transform:scale(.958)">
 *                 <span style="{{ctaGlossStyle}}"></span><span style="{{ctaTextStyle}}">文案</span></div>
 *   —— 第一个 span 是高光层（ctaGlossStyle），第二个 span 是文字层（ctaTextStyle）。button 版本见 L809 / L1410（.ju-result-cta27 / .ju-action-native21）。
 * 按压：style-active 由 support.js 编译成 .scpN:active{transform:scale(.958)!important}（support.js collectProps L428-L430、createPseudoSheet L1568-L1589），
 *   配合 blueCta 的 transition: transform .48s cubic-bezier(.18,1.5,.36,1) —— 回弹过冲曲线。
 * 禁用：blueCta(false) 返回灰色扁平态（并设 cursor:not-allowed），aria-disabled 由各屏的 busy 值决定（如 s05Busy）。
 * ========================================================================== */

/* ---- blueCta(on)：主要 CTA 的全部层（背景色 / 7 层 radial + 1 层 linear 渐变 / 6 层 box-shadow / 回弹过渡）与禁用态；inkCta：黑/红墨色按钮 ---- 来源：V27.code.html L1863-L1877 */
  blueCta(on) {
    if (!on) return { alignSelf: 'center', width: 'min(100%,280px)', height: 48, position:'relative',overflow:'hidden',borderRadius: 999, boxSizing: 'border-box', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 9, cursor: 'not-allowed',color:'#626777',background: 'rgba(20,22,31,0.055)', boxShadow: 'inset 0 0 0 1px rgba(20,22,31,0.1)', transition: 'all .4s ease' };
    return { alignSelf: 'center', width: 'min(100%,280px)', position: 'relative', height: 48, borderRadius: 999, overflow: 'hidden', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFFFFF',
      backgroundColor: '#8DB1F2',
      backgroundImage: 'radial-gradient(58% 44% at 31% 99%,rgba(211,246,253,0.97) 0%,rgba(196,238,252,0.58) 36%,rgba(178,224,250,0) 66%),radial-gradient(50% 42% at 55% 102%,rgba(183,236,253,0.86) 0%,rgba(178,226,251,0.4) 42%,rgba(176,228,251,0) 70%),radial-gradient(54% 44% at 85% 100%,rgba(166,213,252,0.88) 0%,rgba(158,204,250,0.46) 40%,rgba(152,198,250,0) 70%),radial-gradient(50% 62% at 20% 4%,rgba(163,195,253,0.92) 0%,rgba(150,184,248,0.44) 44%,rgba(146,182,246,0) 78%),radial-gradient(52% 58% at 55% 2%,rgba(150,188,251,0.9) 0%,rgba(140,178,248,0.42) 46%,rgba(138,178,246,0) 80%),radial-gradient(54% 66% at 87% 4%,rgba(129,172,252,0.96) 0%,rgba(124,166,246,0.48) 44%,rgba(132,174,248,0) 78%),radial-gradient(46% 70% at 6% 54%,rgba(158,198,248,0.6) 0%,rgba(158,198,248,0) 74%),linear-gradient(178deg,rgba(150,186,252,1) 0%,rgba(126,166,240,1) 30%,rgba(122,166,232,1) 56%,rgba(176,226,250,1) 86%,rgba(181,238,253,1) 100%)',
      boxShadow: 'inset 0 0 18px 9px rgba(58,104,178,0.2),inset 0 0 0 1px rgba(255,255,255,0.62),inset 0 1px 0 rgba(240,248,255,0.72),inset 0 -6px 12px -8px rgba(209,246,255,0.8),0 0 0 1px rgba(172,204,252,0.62),0 8px 20px -12px rgba(146,186,238,0.4)',
      transition: 'transform .48s cubic-bezier(.18,1.5,.36,1), box-shadow .48s cubic-bezier(.18,1.5,.36,1)' };
  }
  inkCta(tone) {
    const red = tone === 'red';
    return { alignSelf: 'center', width: 'min(100%,280px)', height: 48, boxSizing: 'border-box', borderRadius: 999, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, cursor: 'pointer', letterSpacing: '.04em',
      background: red ? '#DA3A52' : '#14161F', color: red ? '#FFF0F3' : '#F8F9FF',
      boxShadow: red ? '0 16px 32px -12px rgba(218,58,82,.6)' : '0 16px 34px -14px rgba(20,22,31,0.55)',
      transition: 'transform .3s cubic-bezier(.2,1.4,.36,1), background .25s' };
  }

/* ---- 文字层 / 高光层 / 页脚（barFade / barPad / barHint） ---- 来源：V27.code.html L2515-L2519 */
      barFadeStyle: { height: 20, flexShrink: 0, background: 'transparent' },
      barPadStyle: { pointerEvents: 'auto', background: 'transparent', padding: '0 22px var(--ju-bottom-pad,46px)', display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'center' },
      barHintStyle: { fontFamily: "'Space Mono',monospace", fontSize: 9, letterSpacing: '0.12em', color: 'rgba(20,22,31,.66)', whiteSpace: 'nowrap', textAlign: 'center' },
      ctaTextStyle: { position: 'relative', fontSize: 14.5, fontWeight: 500, letterSpacing: '0.06em', whiteSpace: 'nowrap' },
      ctaGlossStyle: { position: 'absolute', left: 14, right: 14, top: 3, height: 13, borderRadius: 999, background: 'linear-gradient(180deg,rgba(255,255,255,0.62),rgba(255,255,255,0))', pointerEvents: 'none' },

/* ---- 各屏取用（节选）：s02 blueCtaOn，s05 s05CtaStyle（阅读未到末尾时为禁用态），s06g g6CtaStyle(formed)，s09 queueAckStyle25(!busy) ---- 来源：V27.code.html L2645、L4342、L4355-L4358（节选）、L4732（节选） */
      blueCtaOn: this.blueCta(true),
      s05CtaLabel:m?.status==='confirmed'?'查看成员':reading?'确认入局':'阅读细则',s05Busy:reading&&(s.f5!=='open'||!s.readReached22),s05CtaStyle:this.blueCta(!reading||s.f5==='open'&&s.readReached22),
      g6Step:()=>this.nextMember18(),g6Btn:'确认下一位成员',g6CtaColor:{fontFamily:'var(--ju-font-ui)',fontSize:15,fontWeight:500,letterSpacing:0,lineHeight:1.5,color:'#fff'},g6CtaStyle:this.blueCta(formed),g6CtaLabel:formed?(r.userVersion===r.event.version?'去撕票根':'确认新时间'):'等待确认',g6Go:()=>{if(formed&&r.userVersion!==r.event.version&&r.proposal?.choice==='ask')this.goTo('s11');else if(valid)this.goTo('s06 …
    watch9BarHint:q.state==='invited'?'位置已留给你':q.state==='expired'?'邀请已到期':r.status==='cancelled'?'活动已取消':'',queueDoorHint26:q.state==='waiting'?'轮到后需在6小时内确认。':'候补尚未留位，按加入顺序邀请。',queueAckDisabled23:!!s.queueBusy22,queueAckStyle25:this.blueCta(!s.queueBusy22), …

/* ---- 弱动作（右上角"去不了了"等）与退出确认里的危险按钮 q5QuitStyle ---- 来源：V27.code.html L4314、L3366-L3369 */
    const weak={position:'absolute',top:'var(--ju-content-top,66px)',right:18,zIndex:26,minWidth:52,height:44,display:'flex',alignItems:'center',justifyContent:'center',fontSize:14,fontWeight:500,color:'#535969',cursor:'pointer',borderRadius:12};
      q5QuitStyle: { alignSelf: 'center', width: 'min(100%,280px)', height: 48, boxSizing: 'border-box', borderRadius: 999,
        display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: 13.5,
        fontWeight: 500, letterSpacing: '.04em', color: '#C0392B', whiteSpace: 'nowrap',
        background: 'rgba(255,255,255,.62)', boxShadow: 'inset 0 0 0 1px rgba(192,57,43,.3)' },

/* ---- 次级白色药丸（s12SecStyle，244×40） ---- 来源：V27.code.html L4115 */
      s12SecStyle: 'align-self:center;width:244px;height:40px;box-sizing:border-box;border-radius:999px;display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:13.5px;font-weight:500;letter-spacing:.04em;white-space:nowrap;color:#14161F;background:rgba(255,255,255,.72);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);box-shadow:inset 0 1px 0 rgba(255,255,255,.9),inset 0 0 0 1px rgba(20,22,31,.1),0 12px 28px -18px rgba(20,26,52,.5)',

/* ---- HTML 使用处（V27.code.html） ----
 L660  s02 页脚：<div sc-camel-on-click="{{go03}}" role="button" tabindex="0" aria-label="{{directAction25}}" style="{{blueCtaOn}}" style-active="transform:scale(.958)"><span style="{{ctaGlossStyle}}"></span><span style="{{ctaTextStyle}}">{{directAction25}}</span></div>
 L809  s03 递交后：<button class="ju-result-cta27" sc-camel-on-click="{{go04From03}}" aria-label="查看进度" sc-camel-disabled="{{sent3Busy}}" style="{{sent3CtaStyle}}" style-active="transform:scale(.958)"><span style="{{ctaGlossStyle}}"></span><span style="{{ctaTextStyle}}">查看进度</span><span aria-hidden="true">→</span></button>
 L1102 s05 页脚（含 aria-disabled 与 reading 提示）：<sc-if value="{{terminal05On19}}"><div role="button" tabindex="0" style="{{blueCtaOn}}" sc-camel-on-click="{{q5Other}}"><span style="{{ctaGlossStyle}}"></span><span style="{{ctaTextStyle}}">再找个局</span></div></sc-if><sc-if value="{{reading22}}"><p class="ju-read-hint22" aria-live="polite">{{readHint22}}</p></sc-if><sc-if value="{{action05On19}}"><div sc-camel-on-click="{{s05Cta}}" role="button" tabindex="0" aria-label="{{s05CtaLabel}}" aria-disabled="{{s05Busy}}" style="{{s05CtaStyle}}" style-active="transform:scale(.958)"><span style="{{ctaGlossStyle}}"></span><span style="{{ctaTextStyle}}">{{s05CtaLabel}}</span></div></sc-if> …
 L1410 s09 候补回执（button.ju-action-native21 + sc-camel-disabled）：…<button class="ju-action-native21" style="{{queueAckStyle25}}" sc-camel-on-click="{{queueAck22}}" sc-camel-disabled="{{queueAckDisabled23}}"><span style="{{ctaGlossStyle}}"></span><span style="{{ctaTextStyle}}">{{queueAckLabel25}}</span></button>…
 L1121-L1122 退出确认表：保留位置（blueCta）与 确认退出（q5QuitStyle，style-active="transform:scale(.97)"）
 ---- */

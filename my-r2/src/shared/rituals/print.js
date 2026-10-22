/* print.js — JU 票根出票打印序列（原件复用，不改时长曲线、不改尺寸、不改配色）
   ───────────────────────────────────────────────────────────────────────────────
   来源：/home/user/JU/.build/baseline/V27.html（V27.code.html 行号一致）
   · 第 428 行  <script data-standalone-source="./ju-print.js" src="data:text/javascript;base64,…">
                → 下方第一段 IIFE 为该文件逐字节解码后的原文（window.JuPrint = {mount, raster}），sha256 见 assets/original/SOURCES.json
                  · raster(paper)：把真实 DOM 票面（含副券 canvas、data-raster="stamp" 章）栅格化成 2× 画布，四周 pad 42px
                  · mount(paper,{tag,done})：WebGL 32×128 顶点网格；进度 progress = .5 − .5·cos(π·t^.9)，duration 2300ms
                    （prefers-reduced-motion 时 1ms）；feed=(1−progress)·纸高 从出纸口上方推出；
                    弯曲 bend=exp(−y/44)，离纸高度 z=32·wet·bend，透视 900/(900−z)，受光 vLight=.88+.12·cosθ
                  · 完成：flat()（纸 opacity 1 / transform none / pointer-events auto）→ 摘画布 → done()
   · 第 3601 行 printRun(key,phase)：出票编排（本文件 JURitual.print 复刻的顺序）：
                setState printing → await fonts.ready → tearMount() → await rig.ready → await rAF →
                校验 rig.canvasReady（否则提示“纸票未准备好，请重试”）→ tearRedraw() → measurePaper21() →
                JuPrint.mount(paper,{tag,done:complete})；complete：paper.inert=false → setState ready|torn → tearSync() → measurePaper21()
   · 第 3602 行 measurePaper21(paper)：--ju-paper-height = ceil(top + (纸高 + max(0,84−副券高)) + 58)；已撕态 ceil(top + 纸高 + 20)；
                --ju-shadow-stub25 = min(84, 副券高)；--ju-ticket-top24 = 手机高 <720 ? 24px : 84px
   · 第 3652-3663 行 printReset(key)：销毁网格、移除 [data-print-curve]、纸回到 translateY(-452px)/opacity 0/transition none、rig.reset()
   · 第 3664-3677 行 printWatch()：进入视野（intersectionRatio > .12）自动出票（本文件不自动触发，由调用方决定）
   · 第 3453-3461 行 pr7Stage / pr7Mouth / pr7Lip 状态（见 print.css）
   数据与动画：V27 出票不写业务数据（票在成局时已生效，JuLedger.validTicket 为前置条件）；出票可重播（resetPrint，第 3473 行）。
   键盘 / 按钮等价物：原件由进入视野自动触发 + 「演示 · 重播出纸」按钮；本文件提供 JURitual.print(host,data) 作为按钮入口。
   ─────────────────────────────────────────────────────────────────────────────── */
/* One paper texture, one continuous 32 × 128 surface. No cloned controls. */
(() => {
  function raster(paper){
    const rect=paper.getBoundingClientRect(),W=paper.offsetWidth,H=paper.offsetHeight,pad=42,sx=rect.width/W,sy=rect.height/H,cv=document.createElement('canvas');cv.width=(W+pad*2)*2;cv.height=(H+pad*2)*2;cv.juPad=pad;const g=cv.getContext('2d');g.scale(2,2);g.translate(pad,pad);
    for(const el of [paper,...paper.querySelectorAll('*')]){
      const c=getComputedStyle(el),b=el.getBoundingClientRect();if(!b.width||!b.height||c.display==='none'||c.visibility==='hidden'||el!==paper&&c.opacity==='0'||el.closest('[data-raster="skip"]')||el.parentElement?.closest('[data-raster="stamp"]'))continue;
      const x=(b.left-rect.left)/sx,y=(b.top-rect.top)/sy,w=b.width/sx,h=b.height/sy;
      if(el.dataset.raster==='stamp'){
        let ox=0,oy=0,node=el;while(node&&node!==paper){ox+=node.offsetLeft;oy+=node.offsetTop;node=node.offsetParent;}const origin=c.transformOrigin.split(' ').map(parseFloat),m=new DOMMatrix(c.transform==='none'?undefined:c.transform);g.save();g.translate(ox+origin[0],oy+origin[1]);g.transform(m.a,m.b,m.c,m.d,m.e,m.f);g.translate(-origin[0],-origin[1]);g.fillStyle=c.backgroundColor;g.beginPath();g.roundRect(0,0,el.offsetWidth,el.offsetHeight,parseFloat(c.borderRadius)||0);g.fill();g.strokeStyle=c.borderTopColor;const bw=parseFloat(c.borderTopWidth)||0,double=c.borderTopStyle==='double'&&bw>=3;g.lineWidth=double?bw/3:bw;for(const inset of (double?[bw/6,bw*5/6]:[bw/2])){g.beginPath();g.roundRect(inset,inset,el.offsetWidth-inset*2,el.offsetHeight-inset*2,Math.max(0,(parseFloat(c.borderRadius)||0)-inset));g.stroke()}g.font=[c.fontStyle,c.fontWeight,c.fontSize,c.fontFamily].join(' ');g.fillStyle=c.color;g.textBaseline='middle';g.letterSpacing='0px';let tx=parseFloat(c.paddingLeft)+parseFloat(c.borderLeftWidth);const ls=parseFloat(c.letterSpacing)||0;for(const ch of el.textContent){g.fillText(ch,tx,el.offsetHeight/2);tx+=g.measureText(ch).width+ls;}g.restore();continue;
      }
      if(el.hasAttribute('data-tear')){const rig=el.__jurig;if(rig?.canvasReady&&!rig.destroyed&&h>0){const ratio=rig.cv.width/rig.CW,px=-parseFloat(rig.cv.style.left),py=-parseFloat(rig.cv.style.top);g.drawImage(rig.cv,px*ratio,(py-2)*ratio,rig.W*ratio,(rig.H+2)*ratio,x,y-2,rig.W,rig.H+2);}continue}
      if(el.closest('[data-tear]'))continue;
      if(el.tagName==='CANVAS'||el.tagName==='IMG'&&el.complete){g.drawImage(el,x,y,w,h);continue}
      if(c.backgroundColor!=='rgba(0, 0, 0, 0)'&&el!==paper){g.fillStyle=c.backgroundColor;g.beginPath();g.roundRect(x,y,w,h,[parseFloat(c.borderTopLeftRadius)||0,parseFloat(c.borderTopRightRadius)||0,parseFloat(c.borderBottomRightRadius)||0,parseFloat(c.borderBottomLeftRadius)||0]);g.fill()}
      for(const side of ['Top','Bottom','Left','Right']){const bw=parseFloat(c['border'+side+'Width']);if(!bw||c['border'+side+'Style']==='none')continue;g.strokeStyle=c['border'+side+'Color'];g.lineWidth=bw;g.setLineDash(c['border'+side+'Style']==='dashed'?[3,3]:[]);g.beginPath();if(side==='Top'||side==='Bottom'){const yy=y+(side==='Bottom'?h:0);g.moveTo(x,yy);g.lineTo(x+w,yy)}else{const xx=x+(side==='Right'?w:0);g.moveTo(xx,y);g.lineTo(xx,y+h)}g.stroke();g.setLineDash([])}
      for(const n of el.childNodes)if(n.nodeType===3&&n.textContent.trim()){g.font=[c.fontStyle,c.fontWeight,c.fontSize,c.fontFamily].join(' ');g.fillStyle=c.color;g.textBaseline='alphabetic';g.letterSpacing='0px';const range=document.createRange();for(let i=0;i<n.textContent.length;i++){range.setStart(n,i);range.setEnd(n,i+1);const b=range.getBoundingClientRect();if(!b.width||!b.height)continue;const xx=(b.left-rect.left)/sx,yy=(b.bottom-rect.top)/sy-parseFloat(c.fontSize)*.18;g.fillText(n.textContent[i],xx,yy);if(c.textDecorationLine.includes('line-through')){g.strokeStyle=c.textDecorationColor;g.lineWidth=1;g.beginPath();g.moveTo(xx,(b.top+b.height*.55-rect.top)/sy);g.lineTo(xx+b.width/sx,(b.top+b.height*.55-rect.top)/sy);g.stroke()}}}
    }return cv;
  }
  function mount(paper,opts) {
    const parent=paper.parentElement,W=paper.offsetWidth,H=paper.offsetHeight,computedTop=parseFloat(getComputedStyle(paper).top),top=Number.isFinite(computedTop)?computedTop:84;
    const oldTransform=paper.style.transform;let src;paper.style.transform='none';try{src=raster(paper)}finally{paper.style.transform=oldTransform}
    const cv=document.createElement('canvas');cv.dataset.printCurve=opts.tag;
    Object.assign(cv.style,{position:'absolute',left:'-42px',top:'0',width:'calc(100% + 84px)',height:'100%',pointerEvents:'none',zIndex:3,filter:getComputedStyle(paper.querySelector('[data-paper-shadow]')||paper).filter});parent.append(cv);
    const gl=cv.getContext('webgl',{alpha:true,antialias:true,preserveDrawingBuffer:true});let raf=0,dead=false,prog,buf,tex;
    const flat=()=>{paper.style.opacity='1';paper.style.transform='none';paper.style.pointerEvents='auto';};
    function destroy(){if(dead)return;dead=true;cancelAnimationFrame(raf);paper.inert=false;if(gl){gl.deleteTexture(tex);gl.deleteBuffer(buf);gl.deleteProgram(prog);gl.getExtension('WEBGL_lose_context')?.loseContext()}cv.remove()}
    if(!gl){flat();destroy();opts.done();return {destroy,diag:()=>({webgl:false,texture:[src.width,src.height]})}}
    try {
      const shader=(kind,code)=>{const s=gl.createShader(kind);gl.shaderSource(s,code);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(s));return s};
      prog=gl.createProgram();
      gl.attachShader(prog,shader(gl.VERTEX_SHADER,`precision highp float;attribute vec2 uv;uniform vec2 frame;uniform vec2 paper;uniform float top;uniform float progress;varying vec2 vUV;varying float vY;varying float vLight;void main(){float feed=(1.-progress)*paper.y;float y=top+uv.y*paper.y-feed;float wet=1.-progress;float bend=exp(-max(y,0.)/44.);float z=32.*wet*bend;float dy=1.-.27*wet*bend;float dz=-32./44.*wet*bend;float actualY=y-12.*wet*(1.-bend);float perspective=900./(900.-z);vec2 p=vec2((uv.x-.5)*paper.x*perspective+frame.x*.5,(actualY-frame.y*.5)*perspective+frame.y*.5);gl_Position=vec4(p.x/frame.x*2.-1.,1.-p.y/frame.y*2.,0.,1.);vUV=uv;vY=y;vLight=.88+.12*dy/sqrt(dy*dy+dz*dz);}`));
      gl.attachShader(prog,shader(gl.FRAGMENT_SHADER,`precision highp float;uniform sampler2D art;varying vec2 vUV;varying float vY;varying float vLight;void main(){if(vY<0.)discard;vec4 c=texture2D(art,vUV);gl_FragColor=vec4(c.rgb*vLight,c.a);}`));gl.linkProgram(prog);if(!gl.getProgramParameter(prog,gl.LINK_STATUS))throw Error(gl.getProgramInfoLog(prog));gl.useProgram(prog);
      const a=[];for(let y=0;y<128;y++)for(let x=0;x<32;x++)for(const p of [[x,y],[x+1,y],[x+1,y+1],[x,y],[x+1,y+1],[x,y+1]])a.push(p[0]/32,p[1]/128);
      buf=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buf);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(a),gl.STATIC_DRAW);const loc=gl.getAttribLocation(prog,'uv');gl.enableVertexAttribArray(loc);gl.vertexAttribPointer(loc,2,gl.FLOAT,false,0,0);
      tex=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,tex);gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL,true);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,src);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
      paper.style.opacity='0';paper.inert=true;
      const dpr=Math.min(2,devicePixelRatio),fw=parent.clientWidth+84,fh=parent.clientHeight;cv.width=fw*dpr;cv.height=fh*dpr;gl.viewport(0,0,cv.width,cv.height);gl.uniform2f(gl.getUniformLocation(prog,'frame'),fw,fh);gl.uniform2f(gl.getUniformLocation(prog,'paper'),W+src.juPad*2,H+src.juPad*2);gl.uniform1f(gl.getUniformLocation(prog,'top'),top-src.juPad);
      const start=performance.now(),duration=matchMedia('(prefers-reduced-motion:reduce)').matches?1:2300;let progress=0,tailFrames=0;
      function step(now){if(dead)return;const t=Math.max(0,Math.min(1,(now-start)/duration));progress=.5-.5*Math.cos(Math.PI*Math.pow(t,.9));gl.clear(gl.COLOR_BUFFER_BIT);gl.uniform1f(gl.getUniformLocation(prog,'progress'),progress);gl.drawArrays(gl.TRIANGLES,0,a.length/2);if(t<1||tailFrames++<3)raf=requestAnimationFrame(step);else{flat();paper.inert=false;destroy();opts.done()}}
      cv.addEventListener('webglcontextlost',()=>{if(!dead){flat();paper.inert=false;destroy();opts.done()}},{once:true});raf=requestAnimationFrame(step);
      return {destroy,diag:()=>({webgl:true,vertices:a.length/2,segments:[32,128],textures:1,progress,mouthAngle:Math.atan2(-32/44*(1-progress),1-.27*(1-progress))*180/Math.PI,texture:[src.width,src.height],paper:[W,H],padding:src.juPad,stub:paper.querySelector('[data-tear]')?.offsetHeight||0})};
    } catch(e){flat();paper.inert=false;destroy();opts.done();return {destroy,diag:()=>({webgl:false,error:e.message})}}
  }
  window.JuPrint={mount,raster};
})();

/* ── JURitual.print：V27 printRun / printReset / measurePaper21 的可复用编排（第 3601-3663 行） ── */
(function () {
  'use strict';
  const NS = window.JURitual = window.JURitual || {};
  const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches || document.documentElement.dataset.juReduced === 'true';
  const raf = () => new Promise(ok => requestAnimationFrame(ok));
  const stageOf = host => host.matches('[data-print-stage]') ? host : host.querySelector('[data-print-stage]');
  const SLOTS = ['title', 'time', 'md', 'loc', 'meeting', 'host', 'previous', 'mark'];

  /* 文字槽位：data-slot="title|time|md|loc|meeting|host|previous|mark"（previous / mark 为空时隐藏） */
  function fill(stage, data) {
    if (!data) return;
    for (const key of SLOTS) {
      const el = stage.querySelector('[data-slot="' + key + '"]');
      if (!el || data[key] === undefined) continue;
      if (key === 'previous') { el.hidden = !data.previous; el.textContent = data.previous ? '原定 ' + data.previous : ''; continue; }
      if (key === 'mark') { el.hidden = !data.mark; el.textContent = data.mark || ''; continue; }
      el.textContent = data[key] == null ? '' : String(data[key]);
    }
  }
  NS.fillTicket = fill;

  /* measurePaper21（第 3602 行）：舞台高度与影子让位，按原式计算 */
  function measure(stage, settled) {
    const paper = stage.querySelector('[data-paper]'); if (!paper) return;
    const rig = paper.querySelector('[data-tear]'), stub = rig ? rig.offsetHeight : 0;
    const top = parseFloat(getComputedStyle(paper).top) || 0;
    const fullPaperHeight = paper.offsetHeight + Math.max(0, 84 - stub);
    const height = settled ? Math.ceil(top + paper.offsetHeight + 20) : Math.ceil(top + fullPaperHeight + 58);
    stage.style.setProperty('--ju-paper-height', height + 'px');
    stage.style.setProperty('--ju-shadow-stub', Math.min(84, stub) + 'px');
    return height;
  }
  NS.measureTicket = measure;

  /* printReset（第 3652 行） */
  function reset(host) {
    const stage = stageOf(host); if (!stage) return;
    const paper = stage.querySelector('[data-paper]');
    if (stage.__juPrintMesh) { try { stage.__juPrintMesh.destroy(); } catch (e) { } stage.__juPrintMesh = null; }
    stage.__juPrintSeq = (stage.__juPrintSeq || 0) + 1;
    stage.querySelectorAll('[data-print-curve]').forEach(el => el.remove());
    if (paper) { paper.style.transition = 'none'; paper.style.transform = 'translateY(-452px)'; paper.style.opacity = '0'; paper.style.pointerEvents = 'none'; }
    const rig = paper && paper.querySelector('[data-tear]') && paper.querySelector('[data-tear]').__jurig;
    if (rig) rig.reset();
    stage.dataset.state = 'idle'; delete stage.dataset.print;
  }

  /* printRun（第 3601 行）。返回 Promise<{ok, state, reason?}>；data 为文字槽位；opts.final = 'ready'|'torn'（已撕过的票重打时直接落到已撕态）
     opts.stub = false 时不挂副券引擎（只打印主票）。 */
  NS.print = function (host, data, opts) {
    opts = opts || {};
    const stage = stageOf(host);
    return new Promise(async resolve => {
      if (!stage) return resolve({ ok: false, reason: 'no-stage' });
      const paper = stage.querySelector('[data-paper]');
      if (!paper) return resolve({ ok: false, reason: 'no-paper' });
      if (stage.dataset.print === 'printing') return resolve({ ok: false, reason: 'busy' });
      fill(stage, data);
      reset(stage);
      const seq = stage.__juPrintSeq;
      stage.dataset.print = 'printing'; stage.dataset.state = 'printing';
      if (opts.onState) opts.onState('printing');
      await document.fonts.ready;
      let rig = null;
      if (opts.stub !== false && window.JUTear && paper.querySelector('[data-tear]')) {
        rig = NS.tear ? NS.tear.mount(stage, data, opts.tear || {}).rig : null;
        if (rig) await rig.ready;
      }
      await raf();
      if (seq !== stage.__juPrintSeq || !paper.isConnected) return resolve({ ok: false, reason: 'superseded' });
      if (opts.stub !== false && window.JUTear && paper.querySelector('[data-tear]') && (!rig || rig.destroyed || !rig.canvasReady)) {
        delete stage.dataset.print; stage.dataset.state = 'idle';
        return resolve({ ok: false, reason: 'rig-not-ready', message: '纸票未准备好，请重试' });
      }
      if (rig && !rig.done && rig.p < 0.001) rig.redraw();          // tearRedraw：字体到位后重画副券
      measure(stage, false);
      const complete = () => {
        if (seq !== stage.__juPrintSeq) return;
        paper.inert = false;
        const final = opts.final === 'torn' ? 'torn' : 'ready';
        delete stage.dataset.print; stage.dataset.state = final;
        if (rig) rig.setEnabled(final === 'ready' && opts.enableTear !== false);   // tearSync
        measure(stage, final === 'torn');
        if (opts.onState) opts.onState(final);
        resolve({ ok: true, state: final, webgl: stage.__juPrintMesh ? stage.__juPrintMesh.diag().webgl : false });
      };
      if (!window.JuPrint) { paper.style.opacity = '1'; paper.style.transform = 'none'; paper.style.pointerEvents = 'auto'; return complete(); }
      try { stage.__juPrintMesh = window.JuPrint.mount(paper, { tag: stage.dataset.printStage || 'ticket', done: complete }); }
      catch (e) { paper.style.opacity = '1'; paper.style.transform = 'none'; paper.style.pointerEvents = 'auto'; complete(); }
    });
  };
  NS.print.reset = reset;
  NS.print.duration = 2300;          // JuPrint：duration = reduced ? 1 : 2300
  NS.print.reduced = reduced;
})();

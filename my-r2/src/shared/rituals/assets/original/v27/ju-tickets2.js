/* JU · 08 散场 v2 —— 一个引擎、一段连续镜头：WebGL 里的橡皮章落下盖印 → 今天这张票根单独 settle → 两三张以前的局轻轻显现 → 上下翻阅 / 点一下翻票根。
   与 v1 的区别：不再有 Cycles 影片与接管帧（材质 / 光照 / 透视始终同一套）；章是程序几何（扁平橡胶垫 + 木块 + 车木把手，silhouette 就是「印章」）；
   章本体完全不透明，落下时票面被真实遮住；纸的物理（重、阻尼大、settle 快、不弹）；翻面 = 轻抬 + 翻页式转身（带纸张弯曲）；无指针视差。
   DOM 钩子（data-t08）：stage / canvas / flat / hint / hidden <img data-t08-img="…-front|-back">。API：mount(host, {mode, active, onPhase, onIndex}) → setMode / replay / destroy / diag。 */
(function () {
  'use strict';
  var CARDS = [
    { id: 'hotpot', title: '深夜救急火锅局', serial: '007' }, { id: 'pretty', title: '漂亮饭，只拍不吃派', serial: '006' }, { id: 'spice', title: '川菜辣度分级评审团', serial: '005' },
    { id: 'wine', title: '下班小酒局', serial: '004' }, { id: 'solo', title: '一人食火锅拼桌', serial: '003' }, { id: 'cinema', title: '雨夜电影局', serial: '002' }, { id: 'coffee', title: '周末咖啡局', serial: '001' },
  ];
  var clamp = function (v, a, b) { return Math.max(a, Math.min(b, v)); }, mix = function (a, b, t) { return a + (b - a) * t; }, smooth = function (t) { t = clamp(t, 0, 1); return t * t * (3 - 2 * t); };
  var easeOut = function (t) { t = clamp(t, 0, 1); return 1 - Math.pow(1 - t, 3); }, easeIn = function (t) { t = clamp(t, 0, 1); return t * t * t; }, easeIO = function (t) { t = clamp(t, 0, 1); return t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; };
  // 章在票面贴图（900×1200）里的位置 → 票根局部坐标（宽 2.4 / 高 3.2）
  var MARK = {x:(.78-.5)*2.4,y:(.5-.82)*3.0,r:.15*2.4,rot:-11};
  // 盖章时间线（秒）
  var TL = { enter0: .18, enter1: 1.05, press0: 1.05, press1: 1.34, ink0: 1.40, ink1: 1.52, lift0: 1.70, lift1: 2.20, exit0: 2.20, exit1: 2.85, end: 2.95 };
  var INTRO_DUR = 1.9;

  // Selected-event artwork: Canvas port of ju-after-archive/scripts/make_textures.py.
  // Keep its full 1200×1600 print layout; old lettering is never patched over.
  function stampAnchor(e){return ({invite:{x:.78,y:.82,r:.13},street:{x:.78,y:.17,r:.13},grain:{x:.72,y:.38,r:.15},mono:{x:.76,y:.18,r:.12},riso:{x:.79,y:.76,r:.12},acid:{x:.77,y:.17,r:.12}})[e.pack]||{x:.78,y:.82,r:.13}}
  function paintTicket(event,back,attendance){const e=event?.id&&JuLedger.lookup(event)?JuLedger.eventProjection(event):event||{},c=document.createElement('canvas');if(back&&window.JuEnvelope){return JuEnvelope.makeJuReverse(e)}JuFilm.paintCard({...e,num:e.city||'NYC',date:(e.wd||'FRI')+' '+e.date},c);if(attendance&&attendance!=='none'&&window.JuStamp){const p=stampAnchor(e);JuStamp.stampTo(c.getContext('2d'),attendance,p.x*c.width,p.y*c.height,p.r*c.width,p.r*c.width,-11,1,{city:e.city||'NYC',year:'2026'})}return c;}

  function historyCards(event){return JuLedger.personalHistory(event?.id).map((r,i)=>({id:'history-'+r.id,title:r.event.title,serial:String(i+1).padStart(3,'0'),attendance:r.attendance,endedAt:r.endedAt,event:{...r.event}}));}
  function Tickets(host, opts) {
    var self = this; this.host = host; this.opts = opts || {}; this.destroyed = false;
    var scope = host.closest('[data-t08-scope]') || host;
    var $ = function (n) { return scope.querySelector('[data-t08="' + n + '"]'); };
    var img = function (n) { return scope.querySelector('img[data-t08-img="' + n + '"]'); };
    var history=historyCards(JuLedger.original);var cards = [Object.assign({},CARDS[0]),...history], N = cards.length, mod = function (n) { return ((n % N) + N) % N; };
    var currentEvent=null,eventKey='',eventArt=null,updateEventTexture=function(){},suspendedAt=0,listeners=[];
    function listen(target,type,fn,options){target.addEventListener(type,fn,options);listeners.push(function(){target.removeEventListener(type,fn,options);});}
    var canvas = $('canvas'), stage = $('stage'), flat = $('flat'), reduced = matchMedia('(prefers-reduced-motion: reduce)');
    var state = this.state = { q: 0, target: 0, v: 0, flip: 0, flipTarget: 0, flipV: 0, drag: null, browse: false, visible: true, last: 0, announced: -1, ready: false, intro: null, introE: null, stamp: null, stampT: 0, ink: 0, peek: 0 };
    var gl = null, render = function () { }, glOkay = false, raf = 0, width = 0, height = 0, phase = '', mode = this.opts.mode || 'pending', variant = 'present';
    var setVariantTex = function () { };
    canvas.style.opacity = '1'; if (flat) flat.style.display = 'none';
    function hint(text) { var h = $('hint'); if (!h) return; if (text && !self._hintUsed) { h.textContent = text;Object.assign(h.style,{fontSize:'14px',letterSpacing:'0',lineHeight:'1.5',height:'auto',minHeight:'21px'}); h.style.opacity = '1'; } else h.style.opacity = '0'; }

    function setupGL() {
      gl = canvas.getContext('webgl2', { alpha: true, antialias: true, premultipliedAlpha: true, powerPreference: 'low-power', preserveDrawingBuffer: self.opts.preserve !== undefined ? !!self.opts.preserve : true });
      if (!gl) throw new Error('WebGL2 unavailable');
      var VERT = '#version 300 es\nprecision highp float;\nin vec3 aPos;in vec2 aUV;in vec3 aNormal;in float aFace;\nuniform mat4 uProjection;uniform mat4 uModel;uniform vec2 uBend;uniform vec3 uCamera;uniform vec3 uDent;\nout vec2 vUV;out vec2 vLocal;out vec3 vWorld;out vec3 vNormal;out float vFace;\nvoid main(){\n  vec3 p=aPos;float py=p.y+1.5;\n  p.z+=.009*(p.x*p.x-.5)+.003*sin(p.y*1.7);\n  p.z+=uBend.x*py*py*.17+uBend.y*p.x*p.x*.24;\n  float dd=length(p.xy-uDent.xy);p.z-=uDent.z*exp(-dd*dd*2.2);\n  vec3 n=normalize(vec3(aNormal.x-(uBend.y*p.x*.48+.018*p.x)*aNormal.z,aNormal.y-(uBend.x*py*.34+.0051*cos(p.y*1.7))*aNormal.z,aNormal.z));\n  vec4 world=uModel*vec4(p,1.);vWorld=world.xyz;vNormal=normalize(mat3(uModel)*n);vUV=aUV;vLocal=aPos.xy;vFace=aFace;\n  gl_Position=uProjection*vec4(world.xyz-uCamera,1.);\n}';
      var FRAG = '#version 300 es\nprecision highp float;\nin vec2 vUV;in vec2 vLocal;in vec3 vWorld;in vec3 vNormal;in float vFace;\nuniform sampler2D uFront;uniform sampler2D uBack;uniform sampler2D uInked;uniform float uInk;uniform float uOpacity;uniform float uShade;uniform vec3 uCamera;\nout vec4 color;\nfloat hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}\nvoid main(){\n  if(vFace<1.5){\n    vec2 q=abs(vLocal)-vec2(1.125,1.425);\n    if(length(max(q,0.))+min(max(q.x,q.y),0.)-.075>0.)discard;\n  }\n  vec3 n=normalize(vNormal);if(!gl_FrontFacing)n=-n;\n  vec3 v=normalize(uCamera-vWorld),l=normalize(vec3(-3.8,5.2,7.));\n  vec4 texel;if(vFace<.5){texel=texture(uFront,vUV);if(uInk>0.){vec4 s=texture(uInked,vUV);texel=mix(texel,s,uInk);}}else texel=texture(uBack,vUV);\n  vec3 base=texel.rgb;float a=texel.a;\n  float grain=hash(floor(vUV*vec2(1300.,1700.)))-.5;\n  if(vFace>1.5){base=vec3(.737,.721,.659)+grain*.035;a=1.;}\n  if(a<.12)discard;\n  float delta=(max(dot(n,l),0.)-l.z)*.17;\n  float spec=pow(max(dot(reflect(-v,n),normalize(vec3(-.45,-.28,1.))),0.),36.);\n  float edge=pow(1.-max(dot(n,v),0.),3.);\n  vec3 result=base*(1.+delta)*uShade+vec3(1.,.975,.92)*spec*.009;\n  if(vFace>1.5)result=base*(.74+.26*max(dot(n,l),0.))+edge*vec3(.09,.10,.13);\n  float rim=1.-smoothstep(.001,.005,min(min(vUV.x,1.-vUV.x),min(vUV.y,1.-vUV.y)));\n  float phase=dot(n,vec3(1.4,1.8,2.3))*3.2+vUV.x*2.4-vUV.y*1.2;\n  vec3 spectrum=.5+.5*cos(phase+vec3(0.,2.1,4.2));\n  float angle=pow(1.-max(dot(n,v),0.),1.4);\n  float spectralEdge=1.-smoothstep(.015,.095,min(min(vUV.x,1.-vUV.x),min(vUV.y,1.-vUV.y)));\n  float ink=1.-smoothstep(.25,.58,(base.r+base.g+base.b)/3.);\n  result+=spectrum*(.15*angle+spectralEdge*.15+ink*spec*.3);\n  result+=vec3(.93,.94,1.)*pow(max(dot(reflect(-v,n),normalize(vec3(.3,.8,1.))),0.),120.)*.25;\n  if(vFace<.5)result+=rim*.13;\n  color=vec4(result,a*uOpacity);\n}';
      // 实体（章）：漫反射 + 柔高光 + 微 fresnel；uKind 0 木 / 1 橡胶
      var SVERT = '#version 300 es\nprecision highp float;\nin vec3 aPos;in vec3 aNormal;in float aKind;uniform mat4 uProjection;uniform mat4 uModel;uniform vec3 uCamera;\nout vec3 vW;out vec3 vN;out float vK;out vec3 vP;\nvoid main(){vec4 w=uModel*vec4(aPos,1.);vW=w.xyz;vN=normalize(mat3(uModel)*aNormal);vK=aKind;vP=aPos;gl_Position=uProjection*vec4(w.xyz-uCamera,1.);}';
      var SFRAG = '#version 300 es\nprecision highp float;\nin vec3 vW;in vec3 vN;in float vK;in vec3 vP;uniform vec3 uCamera;uniform float uOpacity;out vec4 color;\nfloat hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}\nfloat vn(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y);}\nvoid main(){vec3 n=normalize(vN);if(!gl_FrontFacing)n=-n;vec3 v=normalize(uCamera-vW),l=normalize(vec3(-3.8,5.2,7.));\n  vec3 base;float rough;\n  if(vK<.5){float ang=atan(vP.y,vP.x);float g=vn(vec2(ang*3.2,vP.z*9.)+vec2(vP.z*1.3,0.));float g2=vn(vec2(ang*11.,vP.z*30.));base=mix(vec3(.70,.52,.33),vec3(.88,.71,.49),g*.8+g2*.2);rough=22.;}\n  else if(vK<1.5){base=vec3(.19,.18,.185)+(hash(floor(vP.xy*140.))-.5)*.02;rough=9.;}\n  else{float ang2=atan(vP.y,vP.x);float g3=vn(vec2(ang2*2.6,vP.z*7.));base=mix(vec3(.66,.47,.29),vec3(.84,.66,.44),g3);rough=26.;}\n  float diff=.50+.50*max(dot(n,l),0.);vec3 R=reflect(-v,n);float spec=pow(max(dot(R,l),0.),rough)*(vK<.5||vK>1.5?.18:.07);float fr=pow(1.-max(dot(n,v),0.),4.)*.08;\n  vec3 amb=vec3(.93,.95,1.)*.14*(.5+.5*n.y);vec3 c=base*diff+amb*base+spec+fr;\n  color=vec4(c*uOpacity,uOpacity);}';
      // 接触阴影：票面上的软椭圆
      var HVERT = '#version 300 es\nprecision highp float;\nin vec2 aQ;uniform mat4 uProjection;uniform mat4 uModel;uniform vec3 uCamera;uniform vec3 uPos;uniform vec2 uHalf;out vec2 vQ;\nvoid main(){vQ=aQ;vec4 w=uModel*vec4(uPos+vec3(aQ*uHalf,0.),1.);gl_Position=uProjection*vec4(w.xyz-uCamera,1.);}';
      var HFRAG = '#version 300 es\nprecision highp float;\nin vec2 vQ;uniform float uAlpha;uniform float uSoft;out vec4 color;\nvoid main(){float d=length(vQ);float a=(1.-smoothstep(1.-uSoft,1.,d))*uAlpha;color=vec4(vec3(.13,.11,.09)*a,a);}';
      function shader(type, src) { var s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw Error(gl.getShaderInfoLog(s)); return s; }
      function program(vs, fs) { var p = gl.createProgram(); gl.attachShader(p, shader(gl.VERTEX_SHADER, vs)); gl.attachShader(p, shader(gl.FRAGMENT_SHADER, fs)); gl.linkProgram(p); if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw Error(gl.getProgramInfoLog(p)); return p; }
      var prog = program(VERT, FRAG), sprog = program(SVERT, SFRAG), hprog = program(HVERT, HFRAG);
      var u = {}; ['Projection', 'Model', 'Bend', 'Front', 'Back', 'Inked', 'Ink', 'Opacity', 'Shade', 'Camera', 'Dent'].forEach(function (n) { u[n] = gl.getUniformLocation(prog, 'u' + n); });
      var su = {}; ['Projection', 'Model', 'Camera', 'Opacity'].forEach(function (n) { su[n] = gl.getUniformLocation(sprog, 'u' + n); });
      var hu = {}; ['Projection', 'Model', 'Camera', 'Pos', 'Half', 'Alpha', 'Soft'].forEach(function (n) { hu[n] = gl.getUniformLocation(hprog, 'u' + n); });
      // ── 票根 mesh（同 v1） ──
      var verts = []; var push = function (x, y, z, uvx, uvy, nx, ny, nz, f) { verts.push(x, y, z, uvx, uvy, nx, ny, nz, f); };
      function surf(x, y, back) { push((x - .5) * 2.4, (y - .5) * 3.0, back ? -.018 : .018, back ? 1 - x : x, 1 - y, 0, 0, back ? -1 : 1, back ? 1 : 0); }
      for (var back = 0; back < 2; back++) for (var iy = 0; iy < 48; iy++) for (var ix = 0; ix < 36; ix++) {
        var x = ix / 36, y = iy / 48, xx = (ix + 1) / 36, yy = (iy + 1) / 48;
        (back ? [[x, y], [xx, yy], [xx, y], [x, y], [x, yy], [xx, yy]] : [[x, y], [xx, y], [xx, yy], [x, y], [xx, yy], [x, yy]]).forEach(function (p) { surf(p[0], p[1], back); });
      }
      var perimeter = [];
      [[1.125, 1.425, 0], [-1.125, 1.425, 90], [-1.125, -1.425, 180], [1.125, -1.425, 270]].forEach(function (d) {
        var cx = d[0], cy = d[1], start = d[2];
        
        for (var j = 0; j <= 12; j++) { var a = (start + j / 12 * 90) * Math.PI / 180; perimeter.push([cx + .075 * Math.cos(a), cy + .075 * Math.sin(a)]); }
        
      });
      for (var i = 0; i < perimeter.length; i++) {
        var a2 = perimeter[i], b2 = perimeter[(i + 1) % perimeter.length], dx = b2[0] - a2[0], dy = b2[1] - a2[1], len = Math.hypot(dx, dy), steps = Math.max(1, Math.ceil(len / .06));
        for (var j2 = 0; j2 < steps; j2++) {
          var p = [a2[0] + dx * j2 / steps, a2[1] + dy * j2 / steps], n = [a2[0] + dx * (j2 + 1) / steps, a2[1] + dy * (j2 + 1) / steps];
          [[p, -.018], [n, -.018], [n, .018], [p, -.018], [n, .018], [p, .018]].forEach(function (q) { var vv = q[0]; push(vv[0], vv[1], q[1], (vv[0] + 1.2) / 2.4, (1.5 - vv[1]) / 3.0, dy / len, -dx / len, 0, 2); });
        }
      }
      var vao = gl.createVertexArray(); gl.bindVertexArray(vao); var buf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buf); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verts), gl.STATIC_DRAW);
      var offset = 0; [['aPos', 3], ['aUV', 2], ['aNormal', 3], ['aFace', 1]].forEach(function (d) { var a3 = gl.getAttribLocation(prog, d[0]); gl.enableVertexAttribArray(a3); gl.vertexAttribPointer(a3, d[1], gl.FLOAT, false, 36, offset * 4); offset += d[1]; });
      // ── 橡皮章 mesh：车床轮廓（r, z）逐段旋转成面；kind 0 木块 / 1 橡胶垫 / 2 把手木 ──
      var sv = [];
      function lathe(profile, kind, seg) {
        seg = seg || 56;
        for (var i2 = 0; i2 < profile.length - 1; i2++) {
          var A = profile[i2], B = profile[i2 + 1], dr = B[0] - A[0], dz = B[1] - A[1], L = Math.hypot(dr, dz) || 1, nr = dz / L, nz = -dr / L;
          if (A[0] === 0 && B[0] === 0) continue;
          for (var s = 0; s < seg; s++) {
            var a0 = s / seg * Math.PI * 2, a1 = (s + 1) / seg * Math.PI * 2, c0 = Math.cos(a0), s0 = Math.sin(a0), c1 = Math.cos(a1), s1 = Math.sin(a1);
            var P = [[A[0] * c0, A[0] * s0, A[1], nr * c0, nr * s0, nz], [B[0] * c0, B[0] * s0, B[1], nr * c0, nr * s0, nz], [B[0] * c1, B[0] * s1, B[1], nr * c1, nr * s1, nz], [A[0] * c1, A[0] * s1, A[1], nr * c1, nr * s1, nz]];
            [P[0], P[1], P[2], P[0], P[2], P[3]].forEach(function (q) { sv.push(q[0], q[1], q[2], q[3], q[4], q[5], kind); });
          }
        }
      }
      var R = MARK.r;                                                       // 橡胶垫半径 = 印迹半径
      lathe([[0, 0], [R + .02, 0], [R + .02, .035], [R + .01, .05], [0, .05]], 1);                   // 橡胶垫：薄、扁、直边
      lathe([[0, .05], [R - .03, .05], [R - .01, .07], [R - .01, .17], [R - .06, .22], [0, .22]], 0);   // 木块：略缩、上缘倒角
      lathe([[0, .22], [.15, .22], [.12, .30], [.085, .42], [.08, .58], [.10, .72], [.15, .86], [.185, .98], [.17, 1.10], [.12, 1.19], [.06, 1.235], [0, 1.25]], 2, 40); // 把手：细颈 → 圆头，车木
      var svao = gl.createVertexArray(); gl.bindVertexArray(svao); var sbuf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, sbuf); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(sv), gl.STATIC_DRAW);
      var so = 0; [['aPos', 3], ['aNormal', 3], ['aKind', 1]].forEach(function (d) { var a4 = gl.getAttribLocation(sprog, d[0]); gl.enableVertexAttribArray(a4); gl.vertexAttribPointer(a4, d[1], gl.FLOAT, false, 28, so * 4); so += d[1]; });
      var hvao = gl.createVertexArray(); gl.bindVertexArray(hvao); var hbuf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, hbuf); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
      var aq = gl.getAttribLocation(hprog, 'aQ'); gl.enableVertexAttribArray(aq); gl.vertexAttribPointer(aq, 2, gl.FLOAT, false, 8, 0);
      gl.bindVertexArray(null);
      var textures = [], ext = gl.getExtension('EXT_texture_filter_anisotropic');
      function imgReady(im) { return new Promise(function (res, rej) { if (!im) return rej(Error('missing texture')); var ok = function () { im.naturalWidth ? res(im) : rej(Error('texture decode')); }; if (im.complete) ok(); else { im.addEventListener('load', ok, { once: true }); im.addEventListener('error', function () { rej(Error('texture load')); }, { once: true }); } }); }
      function texFrom(src) {
        var t = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, t); gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false); gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, src); gl.generateMipmap(gl.TEXTURE_2D);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        if (ext) gl.texParameterf(gl.TEXTURE_2D, ext.TEXTURE_MAX_ANISOTROPY_EXT, Math.min(8, gl.getParameter(ext.MAX_TEXTURE_MAX_ANISOTROPY_EXT))); return t;
      }
      var loadTexture = function (name) { return imgReady(img(name)).then(function (im) { return texFrom(im); }); };
      var inked = {}, cleanFront = null;
      setVariantTex = function () { };
      updateEventTexture=function(){
        if(!currentEvent||self.destroyed)return;if(!glOkay){var f=paintTicket(currentEvent,false,mode==='pending'?'none':mode),b=paintTicket(currentEvent,true);eventArt={front:f.toDataURL(),back:b.toDataURL()};cards.slice(1).forEach(c=>{c.art={front:paintTicket(c.event,false,c.attendance==='pending'?'none':c.attendance).toDataURL(),back:paintTicket(c.event,true).toDataURL()}});announce(true);return;}
        var front=paintTicket(currentEvent,false,'none'),back=paintTicket(currentEvent,true);var present=paintTicket(currentEvent,false,'present'),absent=paintTicket(currentEvent,false,'absent');
        var old=[textures[0][0],textures[0][1],inked.present,inked.absent];
        var mark=stampAnchor(currentEvent);MARK.x=(mark.x-.5)*2.4;MARK.y=(.5-mark.y)*3.0;MARK.r=mark.r*2.4;cleanFront=texFrom(front);textures[0]=[cleanFront,texFrom(back)];inked.present=texFrom(present);inked.absent=texFrom(absent);
        old.forEach(function(t,i){if(t&&old.indexOf(t)===i)gl.deleteTexture(t);});
        cards.slice(1).forEach((c,j)=>{const i=j+1,f=paintTicket(c.event,false,c.attendance==='pending'?'none':c.attendance),b=paintTicket(c.event,true);if(textures[i])textures[i].forEach(old=>gl.deleteTexture(old));textures[i]=[texFrom(f),texFrom(b)];c.art={front:f.toDataURL(),back:b.toDataURL()}});
        textures.splice(N).forEach(pair=>pair.forEach(t=>gl.deleteTexture(t)));self._ticketTextureSize=[front.width,front.height];
        eventArt={front:front.toDataURL('image/png'),back:back.toDataURL?back.toDataURL('image/png'):back.currentSrc||back.src};announce(true);wake();
      };
      var projection = [];
      function resize() { var r = canvas.getBoundingClientRect(); width = canvas.clientWidth || r.width; height = canvas.clientHeight || r.height; if (!width || !height) return; var dpr = Math.min(devicePixelRatio || 1, 2); canvas.width = Math.max(1, Math.round(width * dpr)); canvas.height = Math.max(1, Math.round(height * dpr)); var cardWidth=Math.min((stage.clientWidth||width)*.66,height*.52,250), f=cardWidth*9.5/(height*1.2), a=width/height, n=.1, far=50; self._frame={stage:[stage.clientWidth,height],cardWidth:cardWidth,cardHeight:cardWidth*1.25}; projection = [f / a, 0, 0, 0, 0, f, 0, 0, 0, 0, (far + n) / (n - far), -1, 0, 0, 2 * far * n / (n - far), 0]; gl.viewport(0, 0, canvas.width, canvas.height); wake(); }
      self._ro = new ResizeObserver(resize); self._ro.observe(stage); resize();
      function identity() { return [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]; }
      function mul(a, b) { var r = Array(16).fill(0); for (var c = 0; c < 4; c++) for (var row = 0; row < 4; row++) for (var k = 0; k < 4; k++) r[c * 4 + row] += a[k * 4 + row] * b[c * 4 + k]; return r; }
      function model(p) {
        var a = p.rx * Math.PI / 180, b = p.ry * Math.PI / 180, c = p.rz * Math.PI / 180, ca = Math.cos(a), sa = Math.sin(a), cb = Math.cos(b), sb = Math.sin(b), cc = Math.cos(c), sc = Math.sin(c), s = p.scale == null ? 1 : p.scale;
        var t = identity(); t[12] = p.x; t[13] = p.y; t[14] = p.z;
        return mul(mul(mul(t, [cc, sc, 0, 0, -sc, cc, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]), [cb, 0, -sb, 0, 0, 1, 0, 0, sb, 0, cb, 0, 0, 0, 0, 1]), mul([1, 0, 0, 0, 0, ca, sa, 0, 0, -sa, ca, 0, 0, 0, 0, 1], [s, 0, 0, 0, 0, s, 0, 0, 0, 0, s, 0, 0, 0, 0, 1]));
      }
      // 章的姿态（票根局部坐标：xy 在票面上，z = 离纸高度），随盖章时间线
      function stampPose(t) {
        var s = { h: 0, x: MARK.x, y: MARK.y, rx: 0, ry: 0, rz: MARK.rot, alpha: 1, on: false, press: 0 };
        if (t < TL.enter0 || t >= TL.exit1) return s;
        s.on = true;
        if (t < TL.enter1) { var e = easeOut((t - TL.enter0) / (TL.enter1 - TL.enter0)); s.h = mix(3.0, .6, e); s.x = MARK.x + mix(.7, 0, e); s.y = MARK.y + mix(2.0, 0, e); s.rx = mix(-30, -8, e); s.ry = mix(16, 4, e); }
        else if (t < TL.press1) { var e2 = easeIn((t - TL.press0) / (TL.press1 - TL.press0)); s.h = mix(.6, 0, e2); s.rx = mix(-8, 0, e2); s.ry = mix(4, 0, e2); s.press = e2 * e2; }
        else if (t < TL.lift0) { s.h = 0; s.press = 1 - .35 * smooth((t - TL.press1) / (TL.lift0 - TL.press1)); }
        else if (t < TL.lift1) { var e3 = easeIO((t - TL.lift0) / (TL.lift1 - TL.lift0)); s.h = mix(0, 1.25, e3); s.rx = mix(0, -12, e3); s.ry = mix(0, 5, e3); s.press = (1 - e3) * .65; }
        else { var e4 = easeIn((t - TL.exit0) / (TL.exit1 - TL.exit0)); s.h = mix(1.25, 3.8, e4); s.x = MARK.x + mix(0, 1.1, e4); s.y = MARK.y + mix(0, 2.4, e4); s.rx = mix(-12, -32, e4); s.ry = mix(5, 14, e4); }
        return s;
      }
      render = function () {
        if (!state.ready || !glOkay || !width) return;
        gl.depthMask(true); gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT); gl.enable(gl.BLEND); gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ONE_MINUS_SRC_ALPHA); gl.disable(gl.CULL_FACE); gl.enable(gl.DEPTH_TEST); gl.depthFunc(gl.LEQUAL);
        var orbit = Math.pow(Math.sin(state.q * Math.PI), 2), cam = [.75 * orbit, 0, 9.5 + 2.6 * orbit];
        var sp = state.stamp ? stampPose(state.stampT) : null;
        var poses = [];
        if (state.introE != null) { for (var ii = 0; ii < Math.min(N, 4); ii++) { var pi = introPose(ii, state.introE); if (pi.alpha > .005) poses.push({ i: ii, p: pi }); } }
        else if (!state.browse) poses.push({ i: 0, p: pressPose() });
        else for (var i = Math.max(0,Math.floor(state.q) - 2); i <= Math.min(N-1,Math.ceil(state.q) + 3); i++) { var p = pose(i - state.q); if (p.alpha > .005) poses.push({ i: i, p: p }); }
        // Fit the camera to the complete curved surface; keep every original C pose.
        poses.forEach(o=>{const p=o.p,m=model(p);for(let iy=0;iy<=12;iy++)for(let ix=0;ix<=12;ix++){const x=-1.2+ix*.2,y=-1.5+iy*.25,py=y+1.5,z=.018+.009*(x*x-.5)+.003*Math.sin(y*1.7)+p.bx*py*py*.17+p.by*x*x*.24;const wx=m[0]*x+m[4]*y+m[8]*z+m[12],wy=m[1]*x+m[5]*y+m[9]*z+m[13],wz=m[2]*x+m[6]*y+m[10]*z+m[14];cam[2]=Math.max(cam[2],wz+projection[0]*Math.abs(wx-cam[0])/((stage.clientWidth-28)/width),wz+projection[5]*Math.abs(wy)/((stage.clientHeight-28)/height));}});self._frame.fitDepth=cam[2];
        gl.useProgram(prog); gl.bindVertexArray(vao); gl.uniformMatrix4fv(u.Projection, false, projection); gl.uniform1i(u.Front, 0); gl.uniform1i(u.Back, 1); gl.uniform1i(u.Inked, 2); gl.uniform3f(u.Camera, cam[0], cam[1], cam[2]);
        var m0 = null;self._bounds=[];
        poses.sort(function (a, b) { return a.p.z - b.p.z; }).forEach(function (o) {
          var i = o.i, p = o.p, m = model(p); if (i === 0) m0 = m;
          var points=[];for(var iy=0;iy<=12;iy++)for(var ix=0;ix<=12;ix++){var x=-1.2+ix*.2,y=-1.5+iy*.25,py=y+1.5,z=.018+.009*(x*x-.5)+.003*Math.sin(y*1.7)+p.bx*py*py*.17+p.by*x*x*.24,world=[m[0]*x+m[4]*y+m[8]*z+m[12]-cam[0],m[1]*x+m[5]*y+m[9]*z+m[13]-cam[1],m[2]*x+m[6]*y+m[10]*z+m[14]-cam[2]],w=-world[2];points.push([(projection[0]*world[0]/w*.5+.5)*width,(.5-projection[5]*world[1]/w*.5)*height])}self._bounds.push({i:i,alpha:p.alpha,left:Math.min(...points.map(p=>p[0]))+canvas.getBoundingClientRect().left-stage.getBoundingClientRect().left,right:Math.max(...points.map(p=>p[0]))+canvas.getBoundingClientRect().left-stage.getBoundingClientRect().left,top:Math.min(...points.map(p=>p[1])),bottom:Math.max(...points.map(p=>p[1]))});
          gl.uniformMatrix4fv(u.Model, false, m); gl.uniform2f(u.Bend, p.bx, p.by); gl.uniform1f(u.Opacity, p.alpha); gl.uniform1f(u.Shade, 1 - Math.min(Math.abs(i - state.q), 2) * .012);
          var dent = (i === 0 && sp && sp.press > 0) ? sp.press * .045 : 0; gl.uniform3f(u.Dent, MARK.x, MARK.y, dent);
          gl.uniform1f(u.Ink, mod(i) === 0 ? state.ink : 0);
          var tx = textures[mod(i)]; gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, tx[0]); gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D, tx[1]); gl.activeTexture(gl.TEXTURE2); gl.bindTexture(gl.TEXTURE_2D, inked[variant] || tx[0]);
          gl.drawArrays(gl.TRIANGLES, 0, verts.length / 9);
        });
        if (sp && sp.on && m0) {
          // 接触阴影：光从左上来，影子落在右下；越高越大越淡
          var h = sp.h, sh = clamp(1 - h / 2.2, 0, 1);
          if (sh > 0) {
            gl.useProgram(hprog); gl.bindVertexArray(hvao); gl.depthMask(false); gl.uniformMatrix4fv(hu.Projection, false, projection); gl.uniformMatrix4fv(hu.Model, false, m0); gl.uniform3f(hu.Camera, cam[0], cam[1], cam[2]);
            gl.uniform3f(hu.Pos, sp.x + .06 + h * .09, sp.y - .05 - h * .11, .03); var rr = R + .04 + h * .16; gl.uniform2f(hu.Half, rr, rr * .96); gl.uniform1f(hu.Alpha, .34 * sh * sh + .04 * sh); gl.uniform1f(hu.Soft, clamp(.25 + h * .3, .25, .85));
            gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4); gl.depthMask(true);
          }
          gl.useProgram(sprog); gl.bindVertexArray(svao); gl.uniformMatrix4fv(su.Projection, false, projection); gl.uniform3f(su.Camera, cam[0], cam[1], cam[2]); gl.uniform1f(su.Opacity, 1);
          var local = model({ x: sp.x, y: sp.y, z: .018 + h, rx: sp.rx, ry: sp.ry, rz: sp.rz, scale:MARK.r/R });
          gl.uniformMatrix4fv(su.Model, false, mul(m0, local)); gl.drawArrays(gl.TRIANGLES, 0, sv.length / 7);
        }
        gl.bindVertexArray(null);
      };
      cards.forEach(function(c,idx){const e=idx===0?(currentEvent||JuLedger.original):{...c.event,serial:c.serial};c.event=e;const f=paintTicket(e,false,idx===0||c.attendance==='pending'?'none':c.attendance),b=paintTicket(e,true);textures.push([texFrom(f),texFrom(b)]);c.art={front:f.toDataURL(),back:b.toDataURL()};});glOkay=true;if(currentEvent)updateEventTexture();return Promise.resolve();
    }
    // ── 翻阅姿态：C 回旋 Hermite 轨迹（同 v1），去掉指针视差；翻面 = 轻抬 + 翻页式转身（带纸张弯曲） ──
    function pose(rel) {
      var ar = Math.abs(rel), near = Math.exp(-ar * ar * 2), v = clamp(state.v, -3, 3); var p = { x: 0, y: 0, z: 0, rx: 0, ry: 0, rz: 0, bx: 0, by: 0, scale: 1, alpha: clamp(1 - (ar - 2.1) / .75, 0, 1) };
      if (rel >= 0) { p.x = Math.min(rel, 3) * .15; p.y = -Math.min(rel, 3) * .13; p.z = -rel * .43; p.rz = -rel * 6; p.rx = 5 + rel * 2; p.ry = -7 + rel * 2; }
      else {
        var d = -rel, keys = [[0, 0, 0, 0, 5, -7, 0], [.23, .20, .20, 1.35, 0, -17, -12], [.53, 1.78, .48, .65, -7, 48, -45], [.80, 1.10, -.02, -1.35, 3, 32, -34], [1, .16, -.25, -2.20, 5, -7, -12], [3, .23, -.36, -3.4, 8, -5, -16]];
        var k = 0; while (k < keys.length - 2 && d > keys[k + 1][0]) k++;
        var a = keys[k], b = keys[k + 1], before = keys[Math.max(0, k - 1)], after = keys[Math.min(keys.length - 1, k + 2)], t = clamp((d - a[0]) / (b[0] - a[0]), 0, 1), t2 = t * t, t3 = t2 * t;
        ['x', 'y', 'z', 'rx', 'ry', 'rz'].forEach(function (key, j) { var m = j + 1, span = b[0] - a[0], ta = (b[m] - before[m]) / Math.max(.001, b[0] - before[0]) * span, tb = (after[m] - a[m]) / Math.max(.001, after[0] - a[0]) * span; p[key] = (2 * t3 - 3 * t2 + 1) * a[m] + (t3 - 2 * t2 + t) * ta + (-2 * t3 + 3 * t2) * b[m] + (t3 - t2) * tb; });
        var lift = Math.sin(Math.min(d, 1) * Math.PI); p.bx = -lift * .13; p.by = lift * .07;
      }
      var arrival = Math.exp(-Math.pow(rel / .38, 2));
      p.z += Math.min(Math.abs(v) * .06, .2) * near; p.bx -= v * .035 * near;
      // 翻面：像翻一张票根 —— 抬起一点、绕偏离中心的轴转过去、纸面有弧度、落回原位
      var f = state.flip + state.peek, fs = Math.sin(Math.PI * clamp(f, 0, 1)), pv = -.55, th = f * Math.PI;
      p.ry += f * 180 * arrival; p.x += (pv * (1 - Math.cos(th)) - 2 * pv * f) * arrival; p.z += (.10 * fs) * arrival; p.rz += -4 * fs * arrival; p.bx += -.15 * fs * arrival; p.by += .04 * fs * arrival;
      return p;
    }
    // ── 归档：今天这张先独自 settle（0–.45），随后 1–3 张以前的局从纵深轻轻显现 ──
    function lerpPose(a, b, t) { var o = {}; ['x', 'y', 'z', 'rx', 'ry', 'rz', 'bx', 'by', 'scale', 'alpha'].forEach(function (k) { o[k] = mix(a[k] == null ? 0 : a[k], b[k] == null ? 0 : b[k], t); }); return o; }
    // 盖章时票根像放在桌面上、从高处看：后仰 24°，章的把手才有 silhouette；归档时才站回翻阅姿态
    function pressPose() { return { x: -.02, y: .10, z: -.28, rx: -26, ry: -4, rz: 1.5, bx: 0, by: 0, scale: 1, alpha: 1 }; }
    function introPose(i, e) {
      var rest = pose(i);
      if (i === 0) { var se = easeIO(clamp(e / .5, 0, 1)); var p = lerpPose(pressPose(), rest, se); p.z -= .10 * Math.sin(Math.PI * se); p.alpha = 1; return p; }
      var ei = easeOut(clamp((e - .50 - .13 * (i - 1)) / .48, 0, 1));
      var start = { x: rest.x + .12, y: rest.y - .55, z: rest.z - 1.1, rx: rest.rx + 8, ry: rest.ry + 2, rz: rest.rz - 5, bx: -.03, by: .01, scale: 1, alpha: 0 };
      var q = lerpPose(start, rest, ei); q.alpha = rest.alpha * ei; return q;
    }
    function fitFlat(){if(!flat)return;const w=Math.min(stage.clientWidth*.66,stage.clientHeight*.52,250);Object.assign(flat.style,{position:'absolute',left:'50%',top:'50%',width:w+'px',height:(w*1.25)+'px',transform:'translate(-50%,-50%)',objectFit:'contain',maxWidth:'none',filter:'drop-shadow(0 18px 24px #26325430)'});}
    listen(window,'resize',fitFlat);
    function fallback(){cards.forEach((c,i)=>{const e=i===0?(currentEvent||JuLedger.original):c.event;if(e)c.art={front:paintTicket(e,false,i===0?(mode==='pending'?'none':mode):(c.attendance==='pending'?'none':c.attendance)).toDataURL(),back:paintTicket(e,true).toDataURL()}});glOkay=false;canvas.style.display='none';if(flat)flat.style.display='block';fitFlat();announce(true);}

    function announce(force) {
      var i = mod(Math.round(state.q)); if (i === state.announced && !force) return; state.announced = i; var c = cards[i];
      if (flat) { flat.style.display = glOkay ? 'none' : 'block'; var im = img(c.id + (state.flipTarget ? '-back' : '-front')); if(i===0&&eventArt)flat.src=eventArt[state.flipTarget?'back':'front'];else if(c.art)flat.src=c.art[state.flipTarget?'back':'front'];else if (im) flat.src = im.currentSrc || im.src; flat.alt = c.title + (state.flipTarget ? '的背面' : '的正面'); }
      if (self.opts.onIndex) self.opts.onIndex(i, c);
    }
    function wake() { if (!raf && !self.destroyed) { state.last = 0; raf = requestAnimationFrame(tick); } }
    function tick(now) {
      raf = 0; if (self.destroyed || document.hidden || !state.visible) return; var dt = clamp((now - (state.last || now)) / 1000, 0, .035); state.last = now;
      if (state.stamp) {
        state.stampT = (now - state.stamp.t0) / 1000;
        var t = state.stampT;
        state.ink = clamp((t - TL.ink0) / (TL.ink1 - TL.ink0), 0, 1);
        setPhase(t < TL.ink0 ? 'press' : 'stamped');
        if (t >= TL.end) { state.stamp = null; state.ink = 1; startIntro(); }
      }
      if (state.intro) {
        var e = clamp((now - state.intro.t0) / 1000 / INTRO_DUR, 0, 1); state.introE = e;
        if (e >= 1) { state.intro = null; state.introE = null; beginBrowse(); }
      }
      if (state.peekT) { var pk = (now - state.peekT) / 1000; state.peek = pk < .9 ? .075 * Math.sin(Math.PI * clamp(pk / .9, 0, 1)) : 0; if (pk >= .9) { state.peek = 0; state.peekT = 0; } }
      if (!state.drag) {
        if (reduced.matches) { state.q = state.target; state.v = 0; state.flip = state.flipTarget; state.flipV = 0; }
        else { for (var j = 0; j < 3; j++) { var s = dt / 3; state.v += ((state.target - state.q) * 130 - state.v * 18) * s; state.q += state.v * s; state.flipV += ((state.flipTarget - state.flip) * 64 - state.flipV * 16.5) * s; state.flip += state.flipV * s; } }
        if (Math.abs(state.target - state.q) < .00008 && Math.abs(state.v) < .0003) { state.q = state.target; state.v = 0; } if (Math.abs(state.flipTarget - state.flip) < .0001 && Math.abs(state.flipV) < .0004) { state.flip = state.flipTarget; state.flipV = 0; }
      } else state.v = clamp(state.drag.velocity, -3, 3) * Math.exp(-(now - state.drag.time) / 65);
      render(); if (state.browse && Math.abs(state.q - state.target) < .04) announce();
      var active = state.stamp || state.intro || state.peekT || state.drag || Math.abs(state.q - state.target) > .00005 || Math.abs(state.v) > .0001 || Math.abs(state.flip - state.flipTarget) > .00005 || Math.abs(state.flipV) > .0002;
      if (active) raf = requestAnimationFrame(tick);
    }
    function setFront() { state.flipTarget = 0; }
    function advance(dir) { if (!state.browse) return; self._hintUsed = true; hint(''); setFront(); state.target = clamp(Math.round(state.target) + dir,0,N-1); if (!glOkay) { state.q = state.target; announce(true); } wake(); }
    function flip() { if (!state.browse || Math.abs(state.q - state.target) > .08) return; self._hintUsed = true; hint(''); state.peekT = 0; state.peek = 0; state.flipTarget = state.flipTarget ? 0 : 1; if (!glOkay) announce(true); wake(); }
    listen(canvas,'pointerdown', function (e) { if (!state.browse || e.button !== 0 || state.drag) return; canvas.setPointerCapture(e.pointerId); state.drag = { id: e.pointerId, x: e.clientX, y: e.clientY, q: state.q, last: state.q, time: performance.now(), velocity: 0, moved: false }; state.target = state.q; wake(); });
    listen(canvas,'pointermove', function (e) {
      if (!state.browse || !state.drag || state.drag.id !== e.pointerId) return; var r = canvas.getBoundingClientRect();
      var d = state.drag, k = (r.height || height) / Math.max(1, height), delta = (e.clientY - d.y) / (k || 1);
      if (Math.hypot(e.clientX - d.x, e.clientY - d.y) > 8) { if (!d.moved) { self._hintUsed = true; hint(''); } d.moved = true; setFront(); }
      if (d.moved) { var pitch = clamp(height * .4, 145, 228), q = d.q - delta / pitch, now = performance.now(), dt = Math.max(.008, (now - d.time) / 1000); d.velocity = mix(d.velocity, (q - d.last) / dt, .5); d.last = q; d.time = now; state.q = clamp(q,Math.max(0,d.q-2),Math.min(N-1,d.q+2)); state.target = state.q; state.v = clamp(d.velocity, -3, 3); }
      wake();
    });
    // 松手：纸有重量 —— 只带一点惯性，落到最近一张，不弹
    function release(e, cancel) { if (!state.drag || state.drag.id !== e.pointerId) return; var d = state.drag, v = d.velocity * Math.exp(-(performance.now() - d.time) / 65); state.target = clamp(Math.round(state.q + (cancel ? 0 : clamp(v * .08, -.4, .4))),0,N-1); state.v = cancel ? 0 : clamp(v, -2.4, 2.4); state.drag = null; if (canvas.hasPointerCapture(e.pointerId)) { try { canvas.releasePointerCapture(e.pointerId); } catch (x) { } } if (!d.moved && !cancel) flip(); wake(); }
    listen(canvas,'pointerup', function (e) { release(e, false); }); listen(canvas,'pointercancel', function (e) { release(e, true); }); listen(canvas,'lostpointercapture', function (e) { release(e, true); });
    this._cancelGesture=function(){if(state.drag)release({pointerId:state.drag.id},true);};
    listen(window,'blur',this._cancelGesture);listen(window,'resize',this._cancelGesture);
    function syncVisibility(){
      var now=performance.now(),paused=document.hidden||!state.visible;
      if(paused){if(!suspendedAt)suspendedAt=now;self._cancelGesture();return;}
      if(suspendedAt){if(state.stamp)state.stamp.t0+=now-Math.max(suspendedAt,state.stamp.t0);if(state.intro)state.intro.t0+=now-Math.max(suspendedAt,state.intro.t0);if(state.peekT)state.peekT+=now-Math.max(suspendedAt,state.peekT);suspendedAt=0;}wake();
    }
    var lastWheel = 0, wheelSum = 0; listen(canvas,'wheel', function (e) { if (!state.browse) return; e.preventDefault(); var now = performance.now(); if (now - lastWheel < 520) return; wheelSum += e.deltaY * (e.deltaMode === 1 ? 16 : 1); if (Math.abs(wheelSum) > 28) { advance(Math.sign(wheelSum)); wheelSum = 0; lastWheel = now; } }, { passive: false });
    this._onKey = function (e) {
      if (!state.browse || e.altKey || e.ctrlKey || e.metaKey) return;
      if (self.opts.active && !self.opts.active()) return;
      var tg = e.target; if (tg && (tg.tagName === 'INPUT' || tg.tagName === 'TEXTAREA' || tg.isContentEditable)) return;
      if (['ArrowDown', 'ArrowRight', 'ArrowUp', 'ArrowLeft', 'Home', 'End'].indexOf(e.key) >= 0) { e.preventDefault(); if (e.key === 'Home' || e.key === 'End') { setFront(); state.target = e.key === 'Home' ? 0 : N - 1; wake(); } else advance(['ArrowDown', 'ArrowRight'].indexOf(e.key) >= 0 ? 1 : -1); }
      else if ((e.key === 'Enter' || e.key === ' ') && document.activeElement === canvas) { e.preventDefault(); flip(); }
    };
    document.addEventListener('keydown', this._onKey);
    function setPhase(p) { if (p === phase) return; phase = p; host.dataset.phase = p; if (self.opts.onPhase) self.opts.onPhase(p); }
    function startIntro() {
      if (state.intro || state.browse) return; setPhase('archive');
      if (!glOkay || reduced.matches) { beginBrowse(); return; }
      state.intro = { t0: performance.now() }; state.introE = 0; wake();
    }
    function beginBrowse() {
      state.intro = null; state.introE = null; state.browse = true; setPhase('browse'); host.dataset.ready = 'true';
      hint(N>1?'上下滑动 · 翻以前的局　点一下 · 看背面':'还没有更早的局 · 点一下看背面'); announce(true); wake();
      // 一次很小的「掀角」：告诉人这张票根可以翻过来
      clearTimeout(self._peekTm); if (glOkay && !reduced.matches) self._peekTm = setTimeout(function () { if (!self.destroyed && state.browse && !state.drag && !state.flipTarget) { state.peekT = performance.now(); wake(); } }, 1100);
    }
    // ── 起点：静止的未盖章票根（pending 永远停在这里） ──
    function toPress() {
      state.browse = false; state.intro = null; state.introE = null; state.stamp = null; state.stampT = 0; state.ink = 0; state.peek = 0; state.peekT = 0; clearTimeout(self._peekTm);
      if(self._cancelGesture)self._cancelGesture();
      state.q = state.target = state.v = state.flip = state.flipV = 0; state.drag = null; state.announced = -1; setFront();
      host.dataset.ready = 'false'; phase = ''; setPhase('press'); if (flat) flat.style.display = 'none';
      hint(''); announce(true); render();
    }
    function play() { if (reduced.matches || !glOkay) { state.ink = 1; setPhase('stamped'); startIntro(); return; } state.stamp = { t0: performance.now() }; state.stampT = 0; wake(); }
    // 同一套 motion；status 只决定章的颜色与文字
    function playAttendanceSequence(status) {
      variant = status === 'absent' ? 'absent' : 'present';
      toPress(); if (state.ready) play(); else self._pendingPlay = true;
    }
    this.replay = function () { if (mode === 'pending') { toPress(); beginBrowse(); return; } playAttendanceSequence(mode); };
    this.setEvent=function(event){
      if(!event||self.destroyed)return;var history=historyCards(event),key=JSON.stringify([event,history.map(c=>[c.id,c.event.version,c.attendance,c.endedAt])]);if(key===eventKey)return;
      eventKey=key;currentEvent=Object.assign({},event);cards.splice(1,N-1,...history);N=cards.length;canvas.setAttribute('aria-label',N>1?'票根：上下拖动翻阅以前的局，点一下翻到背面':'本次票根；还没有更早的局，点一下翻到背面');cards[0]=Object.assign({},cards[0],{title:event.title,serial:event.serial||cards[0].serial});
      updateEventTexture();if(mode==='pending'){toPress();beginBrowse();}else playAttendanceSequence(mode);
      if(document.fonts&&document.fonts.status!=='loaded')document.fonts.ready.then(function(){if(!self.destroyed&&key===eventKey)updateEventTexture();});
    };
    this.mode = function () { return mode; };
    this.setMode = function (m) {
      mode = m;
      if (m === 'pending') { variant = 'present'; toPress(); beginBrowse(); return; }
      playAttendanceSequence(m);
    };
    listen(canvas,'webglcontextlost', function (e) { e.preventDefault(); fallback(); });
    this._io = new IntersectionObserver(function (es) { state.visible = es[0].isIntersecting; syncVisibility(); }, { threshold: [.01, .5] }); this._io.observe(stage);
    this._onVis = syncVisibility; document.addEventListener('visibilitychange', this._onVis);
    this._onReduced = function () { wake(); }; reduced.addEventListener('change', this._onReduced);
    this.diag = function () { return { ready: state.ready, webgl: glOkay, browse: state.browse, intro: !!state.intro, introE: state.introE, stamp: !!state.stamp, stampT: state.stampT, ink: state.ink, q: state.q, target: state.target, selected: mod(Math.round(state.q)), flip: state.flip, phase: phase, mode: mode, variant: variant, glError: glOkay ? gl.getError() : null, dimensions: [canvas.width, canvas.height], framing:self._frame,bounds:self._bounds, event:currentEvent&&{title:currentEvent.title,city:currentEvent.city||currentEvent.num}, textureResolution:self._ticketTextureSize||null }; };
    this.render = function () { render(); };
    this.step = function (now) { tick(now); };
    this.destroy = function () { self._cancelGesture();self.destroyed = true;listeners.forEach(function(off){off();}); cancelAnimationFrame(raf); clearTimeout(self._peekTm); if (self._ro) self._ro.disconnect(); if (self._io) self._io.disconnect(); document.removeEventListener('keydown', self._onKey); document.removeEventListener('visibilitychange', self._onVis); reduced.removeEventListener('change', self._onReduced); if (gl) { var lose = gl.getExtension('WEBGL_lose_context'); if (lose) lose.loseContext(); } };
    (function init() {
      setPhase('press');
      Promise.resolve().then(setupGL).then(function () { }, function (err) { console.warn('JU 08 fallback:', err && err.message); fallback();updateEventTexture(); }).then(function () {
        if (self.destroyed) return; state.ready = true; announce(true); render();
        if (self._pendingPlay) { self._pendingPlay = false; play(); }
      });
      self.setMode(mode);
    })();
  }
  window.JuTickets = { mount: function (host, opts) { if (host.__jut) { try { host.__jut.destroy(); } catch (e) { } } var t = new Tickets(host, opts); host.__jut = t; return t; }, CARDS: CARDS, paintTicket:paintTicket };
})();

/* ju-paper-film.js — 逐字取自 JU-01-3D-paper-motion.html 的 JuFilm 舞台（Blender 纸张网格 · satin 着色 · 临界阻尼）。
   模型数据拆到 ju-paper-model.js（window.JuPaperModel），审阅修订：保留模型、材质及运动求解，修复中断、命中与生命周期。 */
/* JU · 01 看见局 — v14. Blender-authored paper geometry, satin print,
   a centered vertical track and direct manipulation with critically damped release.
   Card artwork stays in the existing JuCardV2 visual language (720 × 900). */
(function () {
  'use strict';
  var clamp = function (v, a, b) { return Math.max(a, Math.min(b, v)); }, mix = function (a, b, t) { return a + (b - a) * t; }, ease = function (t) { return t * t * (3 - 2 * t); };
  var VERT = '#version 300 es\n' +
    'precision highp float;\n' +
    'in vec3 aPos;in vec2 aUV;in vec3 aNormal;in float aFace;\n' +
    'uniform mat4 uProjection;uniform mat4 uModel;uniform vec2 uBend;uniform float uThickness;\n' +
    'out vec2 vUV;out vec3 vWorld;out vec3 vNormal;out float vFace;\n' +
    'void main(){\n' +
    '  vec3 p=aPos; p.z*=uThickness;\n' +
    '  float py=p.y;\n' +
    '  p.z+=uBend.x*py*py*.24;\n' +
    '  vec3 n=normalize(vec3(aNormal.x,aNormal.y-uBend.x*py*.48*aNormal.z,aNormal.z));\n' +
    '  vec4 world=uModel*vec4(p,1.);\n' +
    '  vWorld=world.xyz;vNormal=normalize(mat3(uModel)*n);vUV=aUV;vFace=aFace;\n' +
    '  gl_Position=uProjection*vec4(world.xyz-vec3(0.,0.,9.5),1.);\n' +
    '}';
  var FRAG = '#version 300 es\n' +
    'precision highp float;\n' +
    'in vec2 vUV;in vec3 vWorld;in vec3 vNormal;in float vFace;\n' +
    'uniform sampler2D uTexture;uniform int uMaterial;uniform float uOpacity;uniform float uGrain;uniform float uLight;\n' +
    'out vec4 color;\n' +
    'float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}\n' +
    'float rounded(vec2 uv){vec2 q=abs((uv-.5)*vec2(2.4,3.))-vec2(1.135,1.435);return length(max(q,0.))+min(max(q.x,q.y),0.)-.065;}\n' +
    'void main(){\n' +
    '  vec3 N=normalize(vNormal),V=normalize(vec3(0.,0.,9.5)-vWorld);\n' +
    '  if(!gl_FrontFacing)N=-N;\n' +
    '  vec3 L=normalize(vec3(-3.8,5.8,7.5));\n' +
    '  float grain=(hash(floor(vUV*vec2(950.,1200.)))-.5)*uGrain/(1.+length(fwidth(vUV)*vec2(950.,1200.))*2.);\n' +
    '  N=normalize(N+vec3(grain*.05,grain*.04,0.));\n' +
    '  vec3 base=texture(uTexture,vUV).rgb;\n' +
    '  if(vFace>.5 && vFace<1.5){\n' +
    '    base=mix(vec3(.91,.869,.773),vec3(.97,.947,.889),vUV.y);\n' +
    '    vec2 q=abs(vUV-.5);\n' +
    '    float inner=step(q.x,.414)*step(q.y,.425);\n' +
    '    float inner2=step(q.x,.411)*step(q.y,.422);\n' +
    '    base=mix(base,vec3(.52,.29,.26),(inner-inner2)*.3);\n' +
    '    float stamp=length((vUV-.5)*vec2(1.,.8));\n' +
    '    base=mix(base,vec3(.54,.32,.29),(1.-smoothstep(.119,.122,stamp))*smoothstep(.113,.118,stamp)*.65);\n' +
    '    base+=grain*.23;\n' +
    '  }\n' +
    '  if(vFace>1.5){\n' +
    '    float layers=sin(vUV.y*1400.)*.025;\n' +
    '    base=vec3(.92,.899,.845)+layers*.18;\n' +
    '    if(uMaterial==2)base=vec3(.86,.81,.91)+layers*.4;\n' +
    '  }\n' +
    '  float diffuse=.88+.13*max(dot(N,L),0.);\n' +
    '  vec3 R=reflect(-V,N);\n' +
    '  vec3 softbox=normalize(vec3(-.45,-.28,1.));\n' +
    '  float gloss=pow(max(dot(R,softbox),0.),uMaterial==0?14.:38.);\n' +
    '  float strip=smoothstep(.965,.996,dot(R,normalize(vec3(.7,.18,1.))))*smoothstep(-.6,.4,R.y);\n' +
    '  float fresnel=pow(1.-max(dot(N,V),0.),3.);\n' +
    '  vec3 light=vec3(1.,.974,.94)*gloss*(uMaterial==0?.025:.075)*uLight;\n' +
    '  if(uMaterial>0){light+=vec3(.85,.91,1.)*strip*.075*uLight;light+=vec3(.94,.96,1.)*fresnel*.12;}\n' +
    '  vec3 result=base*diffuse+light+grain*.05;\n' +
    '  if(uMaterial==2){\n' +
    '    float phase=dot(N,vec3(1.4,1.8,2.3))*3.2+vUV.x*2.4-vUV.y*1.2;\n' +
    '    vec3 spectrum=.5+.5*cos(phase+vec3(0.,2.1,4.2));\n' +
    '    float angle=pow(1.-max(dot(N,V),0.),1.4);\n' +
    '    float edge=1.-smoothstep(.015,.095,min(min(vUV.x,1.-vUV.x),min(vUV.y,1.-vUV.y)));\n' +
    '    float ink=1.-smoothstep(.25,.58,(base.r+base.g+base.b)/3.);\n' +
    '    result+=spectrum*(.15*angle+edge*.15+ink*gloss*.3)*uLight;\n' +
    '    result+=vec3(.93,.94,1.)*pow(max(dot(R,normalize(vec3(.3,.8,1.))),0.),120.)*.25;\n' +
    '  }\n' +
    '  float edgeLight=1.-smoothstep(.001,.007,min(min(vUV.x,1.-vUV.x),min(vUV.y,1.-vUV.y)));\n' +
    '  if(vFace<.5)result+=edgeLight*.025;\n' +
    '  color=vec4(result,uOpacity);\n' +
    '}';
  var SVERT = '#version 300 es\nprecision highp float;in vec2 aPosition;uniform vec4 uRect;out vec2 vUV;\nvoid main(){vUV=aPosition;gl_Position=vec4(aPosition*uRect.zw+uRect.xy,0.,1.);}';
  var SFRAG = '#version 300 es\nprecision highp float;in vec2 vUV;uniform float uAlpha;out vec4 color;\nvoid main(){float d=dot(vUV,vUV);float a=exp(-d*4.8)*(1.-smoothstep(.65,1.2,d))*uAlpha;color=vec4(.11,.13,.22,a);}';

  /* ───────── 卡面 → texture：按 JuCardV2 的规则在 720×900 画布上复刻（1cqw = 7.2px） ───────── */
  var U = 7.2, TW = 720, TH = 900;
  var F = {
    caslon: "'Libre Caslon Text', Georgia, serif",
    mono: "'Space Mono', Menlo, Consolas, monospace",
    caveat: "'Caveat', 'Zhi Mang Xing', cursive",
    archivo: "'Archivo', 'PingFang SC', 'Hiragino Sans GB', sans-serif",
    black: "'Archivo Black', 'Archivo', sans-serif",
    oswald: "'Oswald', 'Archivo Narrow', 'Arial Narrow', sans-serif",
    sc: "'Noto Sans SC', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif",
  };
  var NOISE = null;
  function noise() {
    if (NOISE) return NOISE;
    var c = document.createElement('canvas'); c.width = TW; c.height = TH;
    var g = c.getContext('2d'), id = g.createImageData(TW, TH), s = 48271, d = id.data;
    for (var i = 0; i < d.length; i += 4) { s = (Math.imul(s, 1664525) + 1013904223) >>> 0; var v = s >>> 24; d[i] = d[i + 1] = d[i + 2] = v; d[i + 3] = 255; }
    g.putImageData(id, 0, 0); NOISE = c; return c;
  }
  function setFont(c, o) { c.font = (o.w || 400) + ' ' + o.s + 'px ' + o.f; if ('letterSpacing' in c) c.letterSpacing = (o.ls || 0) + 'px'; }
  function M(c, str, o) { c.save(); setFont(c, o); var w = c.measureText(str).width; c.restore(); return w; }
  function T(c, str, x, y, o) {
    c.save(); setFont(c, o); c.fillStyle = o.col; c.textAlign = o.al || 'left'; c.textBaseline = o.bl || 'middle';
    if (o.alpha != null) c.globalAlpha = o.alpha;
    if (o.sh) { c.shadowColor = o.sh.col; c.shadowOffsetX = o.sh.x || 0; c.shadowOffsetY = o.sh.y || 0; c.shadowBlur = o.sh.b || 0; }
    if (o.rot) { c.translate(x, y); c.rotate(o.rot); x = 0; y = 0; }
    c.fillText(str, x, y); c.restore();
  }
  function wrap(c, str, o, maxW) {
    var toks = String(str).match(/[\u3000-\u9fff\uff00-\uffef\u3040-\u30ff]|[^\s\u3000-\u9fff\uff00-\uffef\u3040-\u30ff]+|\s+/g) || [];
    var lines = [], cur = '';
    toks.forEach(function (t) {
      var test = cur + t;
      if (cur && M(c, test.replace(/\s+$/, ''), o) > maxW) { lines.push(cur.replace(/\s+$/, '')); cur = /^\s+$/.test(t) ? '' : t; }
      else cur = test;
    });
    if (cur.replace(/\s+$/, '')) lines.push(cur.replace(/\s+$/, ''));
    return lines.length ? lines : [''];
  }
  function fit(c, str, o, maxW, min) { var s = o.s; while (s > min && M(c, str, Object.assign({}, o, { s: s })) > maxW) s -= 1; return s; }
  function lg(c, deg, W, H, stops) {
    var th = deg * Math.PI / 180, L = Math.abs(W * Math.sin(th)) + Math.abs(H * Math.cos(th));
    var dx = Math.sin(th) * L / 2, dy = -Math.cos(th) * L / 2;
    var g = c.createLinearGradient(W / 2 - dx, H / 2 - dy, W / 2 + dx, H / 2 + dy);
    stops.forEach(function (s) { g.addColorStop(s[0], s[1]); }); return g;
  }
  function rg(c, cx, cy, rx, ry, stops) {
    c.save(); c.translate(cx, cy); c.scale(rx, ry);
    var g = c.createRadialGradient(0, 0, 0, 0, 0, 1); stops.forEach(function (s) { g.addColorStop(s[0], s[1]); });
    c.fillStyle = g; c.fillRect(-1, -1, 2, 2); c.restore();
  }
  function stripes(c, x, y, w, h, deg, c1, c2, period) {
    c.save(); c.beginPath(); c.rect(x, y, w, h); c.clip(); c.fillStyle = c1; c.fillRect(x, y, w, h);
    c.translate(x + w / 2, y + h / 2); c.rotate((deg - 90) * Math.PI / 180); var R = Math.hypot(w, h);
    c.fillStyle = c2; for (var s = -R; s < R; s += period * 2) c.fillRect(s + period, -R, period, 2 * R);
    c.restore();
  }
  function rrect(c, x, y, w, h, r) { c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r); c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath(); }
  function line(c, x1, y1, x2, y2, col, w) { c.strokeStyle = col; c.lineWidth = w || 1; c.beginPath(); c.moveTo(x1, y1); c.lineTo(x2, y2); c.stroke(); }
  function grain(c, alpha, op) { c.save(); c.globalAlpha = alpha; c.globalCompositeOperation = op; c.drawImage(noise(), 0, 0); c.restore(); }
  // 虚线圆角 pill（官方图库占位）
  function dashedPill(c, str, cx, cy, o, padX, padY, col, radius) {
    var w = M(c, str, o) + padX * 2, h = o.s * 1.2 + padY * 2;
    c.save(); c.setLineDash([6, 5]); c.strokeStyle = col; c.lineWidth = 2; rrect(c, cx - w / 2, cy - h / 2, w, h, radius); c.stroke(); c.restore();
    T(c, str, cx, cy, Object.assign({}, o, { al: 'center' }));
  }

  function paintCard(card, cv) {
    cv.width = TW; cv.height = TH;
    var c = cv.getContext('2d'), W = TW, H = TH;
    var pack = card.pack || 'invite';
    var seatN = parseFloat(card.seats), full = !(seatN > 0);
    var cityCode = card.city || card.num || String(card.id || '').split('|')[0] || 'NYC';
    var cityNames = {NYC:['纽约','NEW YORK'],BOS:['波士顿','BOSTON'],LA:['洛杉矶','LOS ANGELES'],SFO:['湾区','BAY AREA'],SEA:['西雅图','SEATTLE'],CHI:['芝加哥','CHICAGO']};
    var cityName = cityNames[cityCode] || [cityCode,cityCode];
    var v = {
      title: card.title || '', en: card.en || '', date: card.date || '', dateNum: card.dateNum || '', time: card.time || '',
      loc: card.loc || '', locEn: card.locEn || card.loc || '', host: card.host || '', num: card.num || 'NYC',
      toWho: full ? '在局里的你' : '缺' + seatN + '人的你', seatLong: full ? '已成局 · 位子满了' : '还缺 ' + seatN + ' 人 · 不算局主',
      seatMid: full ? '已成局' : '还缺 ' + seatN + ' 人', seatShort: full ? '已满员' : '缺 ' + seatN + ' 人',
      seatAsk: full ? '已成局 · 名单锁定' : '缺 ' + seatN + ' 人 · 报名后等确认',
    };
    // V26: existing text slots follow current event facts; card art is unchanged.
    if (card.status === 'cancelled' || card.status === 'ended') {
      var terminal = card.status === 'cancelled' ? '活动已取消' : '活动已结束';
      v.toWho = '这局的记录'; v.seatLong = terminal; v.seatMid = terminal; v.seatShort = terminal; v.seatAsk = terminal;
    } else if (Number.isFinite(card.confirmed) && Number.isFinite(card.capacity)) {
      var confirmed = card.confirmed + '/' + card.capacity + ' 已确认', reserved = (card.reserved || 0) + ' 已预留';
      v.seatLong = confirmed + ' · ' + reserved;
      v.seatMid = card.formed ? '已成局' : confirmed;
      v.seatShort = full ? (card.formed ? '已满员' : '预留已满') : '余 ' + seatN + ' 位';
      v.seatAsk = full ? (card.formed ? '已成局 · 可候补' : '预留已满 · 可候补') : '余 ' + seatN + ' 位 · 报名后等确认';
    }
    if (pack === 'invite') {
      var red = '#A8281F', ink = '#241F17', pad = 7 * U, top = 6.5 * U, bot = 5.5 * U;
      c.fillStyle = lg(c, 174, W, H, [[0, '#F4EBD9'], [.7, '#EFE4CC'], [1, '#EADDC2']]); c.fillRect(0, 0, W, H);
      var enO = { f: F.caslon, w: 700, s: 7.6 * U, ls: .22 * U, col: red };
      enO.s = fit(c, v.en, enO, W - pad * 2, 30);
      T(c, v.en, W / 2, top + 7.6 * U / 2, Object.assign({}, enO, { al: 'center' }));
      var y = top + 7.6 * U + 2.8 * U;
      var juO = { f: F.mono, s: 2.4 * U, ls: .5 * U, col: red }, juT = 'JU ' + v.num, juW = M(c, juT, juO);
      var rowMid = y + juO.s * .6;
      line(c, pad, rowMid, W / 2 - juW / 2 - 2 * U, rowMid, red, .35 * U); line(c, W / 2 + juW / 2 + 2 * U, rowMid, W - pad, rowMid, red, .35 * U);
      T(c, juT, W / 2, rowMid, Object.assign({}, juO, { al: 'center' }));
      y += juO.s * 1.2 + 3.6 * U;
      // TO / DATE 行（flex-end 对齐，行高由 Caveat 6.6cqw 决定）
      var rowH = 6.6 * U, rowB = y + rowH;
      var lab = { f: F.mono, s: 2.9 * U, ls: .2 * U, col: red };
      var toW = M(c, 'TO:', lab), dateLabW = M(c, 'DATE:', lab), gap = 2 * U;
      var dateO = { f: F.caveat, s: 6 * U, col: ink }, dateW = M(c, v.date, dateO) + 2 * U;
      T(c, 'TO:', pad, rowB - 1 * U - lab.s * .5, lab);
      var x1 = pad + toW + gap, x2 = W - pad - dateW - gap - dateLabW - gap;
      line(c, x1, rowB, x2, rowB, '#CDAF93', .3 * U);
      var whoO = { f: F.caveat, s: 6.6 * U, col: ink }; whoO.s = fit(c, v.toWho, whoO, x2 - x1 - 8, 26);
      T(c, v.toWho, (x1 + x2) / 2, rowB - rowH / 2 + 2, Object.assign({}, whoO, { al: 'center' }));
      T(c, 'DATE:', x2 + gap, rowB - 1 * U - lab.s * .5, lab);
      line(c, W - pad - dateW, rowB, W - pad, rowB, '#CDAF93', .3 * U);
      T(c, v.date, W - pad - dateW / 2, rowB - rowH / 2 + 2, Object.assign({}, dateO, { al: 'center' }));
      // 底部：三行 + footer，反推出中框高度
      var rowsTop0 = 0, rowFs = 2.85 * U, rowLine = rowFs * 1.2 + .7 * U + .28 * U, rowGap = 1.9 * U;
      var rowsH = rowLine * 3 + rowGap * 2, footFs = 2.6 * U, footH = footFs * 1.2;
      var afterBox = 4.2 * U + rowsH + 3.4 * U + footH;
      var boxTop = rowB + 4 * U, boxBot = H - bot - afterBox, bw = .4 * U;
      c.strokeStyle = red; c.lineWidth = bw; c.strokeRect(pad + bw / 2, boxTop + bw / 2, W - pad * 2 - bw, boxBot - boxTop - bw);
      var m = 1.4 * U, ms = 2.6 * U;
      line(c, pad + m, boxTop + m + bw / 2, pad + m + ms, boxTop + m + bw / 2, red, bw); line(c, pad + m + bw / 2, boxTop + m, pad + m + bw / 2, boxTop + m + ms, red, bw);
      line(c, W - pad - m, boxBot - m - bw / 2, W - pad - m - ms, boxBot - m - bw / 2, red, bw); line(c, W - pad - m - bw / 2, boxBot - m, W - pad - m - bw / 2, boxBot - m - ms, red, bw);
      var tO = { f: F.caveat, s: 11.5 * U, col: ink }; tO.s = fit(c, v.title, tO, W - pad * 2 - 12 * U, 40);
      var subO = { f: F.caveat, s: 6.6 * U, col: red };
      var blockH = tO.s * 1.12 + 1.6 * U + subO.s * 1.2, bTop = (boxTop + boxBot) / 2 - blockH / 2;
      T(c, v.title, W / 2, bTop + tO.s * 1.12 / 2, Object.assign({}, tO, { al: 'center', rot: -2 * Math.PI / 180 }));
      T(c, '来不来！！', W / 2, bTop + tO.s * 1.12 + 1.6 * U + subO.s * .6, Object.assign({}, subO, { al: 'center', rot: -2 * Math.PI / 180 }));
      rowsTop0 = boxBot + 4.2 * U;
      [['SEATS', v.seatLong], ['WHERE', v.loc + ' · ' + cityName[1]], ['TIME', v.date + ' · ' + v.time + ' 开吃']].forEach(function (row, i) {
        var yt = rowsTop0 + i * (rowLine + rowGap), mid = yt + rowFs * .62, vx = pad + 13 * U + 2.5 * U;
        T(c, row[0], pad, mid, { f: F.mono, w: 700, s: 2.85 * U, ls: .2 * U, col: red });
        T(c, row[1], vx, mid, { f: F.mono, s: 2.85 * U, col: ink });
        line(c, vx, yt + rowFs * 1.2 + .7 * U, W - pad, yt + rowFs * 1.2 + .7 * U, '#DBC6AC', .28 * U);
      });
      var fy = rowsTop0 + rowsH + 3.4 * U + footH / 2;
      T(c, 'BY ' + v.host + ' · ' + cityCode, pad, fy, { f: F.mono, s: footFs, ls: .24 * U, col: red });
      T(c, 'REAL PLANS ONLY', W - pad, fy, { f: F.mono, s: footFs, ls: .24 * U, col: red, al: 'right' });
      grain(c, .075, 'multiply');
    } else if (pack === 'street') {
      var iv = '#FFFDF6', pd = 6 * U;
      c.fillStyle = lg(c, 168, W, H, [[0, '#96825f'], [.32, '#6f5d46'], [.6, '#473d30'], [1, '#221e18']]); c.fillRect(0, 0, W, H);
      rg(c, W * .49, H * .47, W * .35 * 1.42, H * .15 * 1.42, [[0, 'rgba(255,242,208,.35)'], [.7, 'rgba(255,242,208,0)'], [1, 'rgba(255,242,208,0)']]);
      var bg2 = c.createLinearGradient(0, H * .55, 0, H); bg2.addColorStop(0, 'rgba(20,16,10,0)'); bg2.addColorStop(1, 'rgba(20,16,10,.55)'); c.fillStyle = bg2; c.fillRect(0, H * .55, W, H * .45);
      var tO2 = { f: F.archivo, w: 500, s: 8 * U, ls: -.12 * U, col: iv };
      var tl = wrap(c, v.title, tO2, W * .8 - pd * 2);
      tl.forEach(function (ln, i) { T(c, ln, pd, pd + tO2.s * 1.12 * (i + .5), tO2); });
      T(c, v.num, W - pd, pd + 1 * U + 2.8 * U * .6, { f: F.mono, s: 2.8 * U, col: iv, alpha: .75, al: 'right' });
      var hostedY = pd + tO2.s * 1.12 * tl.length + 3.7 * U * 1.1;
      T(c, 'Hosted by ' + v.host + ' · ' + v.seatMid, pd, hostedY, { f: F.archivo, s: 3.7 * U, col: iv, alpha: .82 });
      dashedPill(c, '[ 官方图库 · 街拍 / 夜市_02 ]', W / 2, H * .565, { f: F.mono, s: 2.8 * U, ls: .2 * U, col: 'rgba(255,253,246,.8)' }, 3 * U, 1.6 * U, 'rgba(255,253,246,.5)', 1 * U);
      var footY = H - pd - 2.7 * U * .6, ruleY = H - pd - 2.7 * U * 1.2 - 2.4 * U;
      T(c, 'PUBLISHED ON JU', pd, footY, { f: F.mono, s: 2.7 * U, ls: .2 * U, col: iv, alpha: .78 });
      T(c, 'ju.app', W - pd, footY, { f: F.mono, s: 2.7 * U, ls: .2 * U, col: iv, alpha: .78, al: 'right' });
      line(c, pd, ruleY, W - pd, ruleY, 'rgba(255,253,246,.3)', .24 * U);
      var b2 = ruleY - 3 * U, lh2 = 6.4 * U * 1.18, big = { f: F.archivo, w: 500, s: 6.4 * U, ls: -.08 * U, col: iv };
      var locationO = Object.assign({}, big);
      locationO.s = fit(c, 'In ' + v.loc, locationO, W - pd * 2 - M(c, v.date, big) - 3 * U, 4.5 * U);
      T(c, 'In ' + v.loc, pd, b2 - lh2 * 1.5, locationO); T(c, cityName[0], pd, b2 - lh2 * .5, big);
      T(c, v.date, W - pd, b2 - lh2 * 1.5, Object.assign({}, big, { al: 'right' })); T(c, v.time, W - pd, b2 - lh2 * .5, Object.assign({}, big, { al: 'right' }));
      grain(c, .32, 'overlay');
    } else if (pack === 'grain') {
      var pd3 = 5.5 * U;
      c.fillStyle = '#0a0b16'; c.fillRect(0, 0, W, H);
      rg(c, W / 2, H * .28, W * .65, H * .475, [[0, '#26305e'], [.46, '#151a36'], [1, '#0a0b16']]);
      rg(c, W / 2, H * .27, W * .22 * 1.42, H * .21 * 1.42, [[0, 'rgba(96,116,230,.38)'], [.7, 'rgba(96,116,230,0)'], [1, 'rgba(96,116,230,0)']]);
      T(c, 'JU PRESENTS ⤵', pd3, pd3 + 3.2 * U * .6, { f: F.mono, s: 3.2 * U, ls: 1 * U, col: '#D8D0B8' });
      T(c, v.num, W - pd3, pd3 + 3.2 * U * .6, { f: F.mono, s: 3.2 * U, ls: .2 * U, col: '#D8D0B8', al: 'right' });
      var footFs3 = 2.9 * U, footMid = H - pd3 - footFs3 * .6, rule3 = H - pd3 - footFs3 * 1.2 - 2.6 * U;
      T(c, v.title, pd3, footMid, { f: F.mono, s: footFs3, ls: .3 * U, col: '#B7B096' });
      T(c, 'AT ' + v.loc + '…', W - pd3, footMid, { f: F.mono, s: footFs3, ls: .3 * U, col: '#B7B096', al: 'right' });
      line(c, pd3, rule3, W - pd3, rule3, 'rgba(237,230,210,.22)', .24 * U);
      var enO3 = { f: F.black, s: 13.5 * U, ls: .08 * U, col: '#F0E9D6', sh: { col: 'rgba(0,0,0,.6)', x: .55 * U, y: .55 * U } };
      var enL = wrap(c, v.en, enO3, W * .72 - pd3), enB = rule3 - 3.4 * U, lh3 = enO3.s * .96;
      enL.forEach(function (ln, i) { T(c, ln, pd3, enB - lh3 * (enL.length - i - .5), enO3); });
      var rO = { f: F.mono, w: 700, s: 3.5 * U, ls: .4 * U, col: '#E4DCC4', al: 'right' }, rlh = 3.5 * U * 2.05, rBot = H - 17 * U;
      [v.seatShort, '[' + v.dateNum + ']', v.time].forEach(function (s, i) { T(c, s, W - pd3, rBot - rlh * (2.5 - i), rO); });
      grain(c, .55, 'soft-light');
    } else if (pack === 'mono') {
      var cr = '#F3EAD8', pd4 = 7 * U;
      c.fillStyle = lg(c, 175, W, H, [[0, '#5d2314'], [.36, '#8f4726'], [.62, '#70301a'], [1, '#2e1109']]); c.fillRect(0, 0, W, H);
      for (var sy = 0; sy < H; sy += 3 * U) { c.fillStyle = 'rgba(255,230,190,.05)'; c.fillRect(0, sy, W, 1.5 * U); c.fillStyle = 'rgba(0,0,0,.07)'; c.fillRect(0, sy + 1.5 * U, W, 1.5 * U); }
      rg(c, W / 2, H * .37, W * .3 * 1.42, H * .17 * 1.42, [[0, 'rgba(255,180,110,.22)'], [.7, 'rgba(255,180,110,0)'], [1, 'rgba(255,180,110,0)']]);
      var items = [
        { t: 'JU ' + v.num, o: { f: F.mono, s: 3 * U, ls: 1.1 * U, col: cr, alpha: .85 }, h: 3 * U * 1.2 },
        { t: v.title, o: { f: F.mono, w: 700, s: 6 * U, ls: .9 * U, col: cr }, h: 6 * U * 1.7, fitW: W - pd4 * 2 },
        { t: 'IN ' + v.locEn + ', ' + cityCode, o: { f: F.mono, w: 700, s: 4.3 * U, ls: 1 * U, col: cr }, h: 4.3 * U * 1.2 },
        { t: v.date + ' · ' + v.time, o: { f: F.mono, w: 700, s: 4.3 * U, ls: 1 * U, col: cr }, h: 4.3 * U * 1.2 },
        { t: v.seatAsk, o: { f: F.mono, s: 3.1 * U, ls: .8 * U, col: cr }, h: 3.1 * U * 1.2 + 3 * U + .56 * U, pill: true },
        { t: 'JU.APP · BY ' + v.host, o: { f: F.mono, s: 2.7 * U, ls: .7 * U, col: cr, alpha: .72 }, h: 2.7 * U * 1.2 },
      ];
      var total = items.reduce(function (a, it) { return a + it.h; }, 0) + 2.7 * U * (items.length - 1), yy = H / 2 - total / 2;
      items.forEach(function (it) {
        var o = Object.assign({}, it.o, { al: 'center' }); if (it.fitW) o.s = fit(c, it.t, o, it.fitW, 20);
        var mid = yy + it.h / 2;
        if (it.pill) { var pw = M(c, it.t, o) + 6.4 * U, ph = it.h; c.strokeStyle = 'rgba(243,234,216,.55)'; c.lineWidth = .28 * U; rrect(c, W / 2 - pw / 2, mid - ph / 2, pw, ph, ph / 2); c.stroke(); }
        T(c, it.t, W / 2, mid, o); yy += it.h + 2.7 * U;
      });
      dashedPill(c, '[ 官方图库 · 蒸汽 / 纹理_04 ]', W / 2, H - 4 * U - (2.5 * U * 1.2 + 2.4 * U) / 2, { f: F.mono, s: 2.5 * U, col: 'rgba(243,234,216,.72)' }, 2.6 * U, 1.2 * U, 'rgba(243,234,216,.4)', 1 * U);
      grain(c, .42, 'overlay');
    } else if (pack === 'riso') {
      var ink5 = '#2A2C33', pd5 = 6 * U;
      c.fillStyle = '#B7BCD9'; c.fillRect(0, 0, W, H);
      var juO5 = { f: F.archivo, w: 800, s: 6.5 * U, ls: -.2 * U, col: ink5 }, topMid = pd5 + 6.5 * U * .6;
      T(c, 'JU', pd5, topMid, juO5); T(c, '.', pd5 + M(c, 'JU', juO5), topMid, Object.assign({}, juO5, { col: '#A8281F' }));
      T(c, v.date, W - pd5, topMid, { f: F.mono, w: 700, s: 4 * U, col: ink5, al: 'right' });
      var timeO = { f: F.archivo, w: 800, s: 7.5 * U, ls: -.1 * U, col: ink5 }, botB = H - pd5;
      T(c, v.time + ' 见', pd5, botB - timeO.s * .5, timeO);
      var rO5 = { f: F.mono, s: 2.9 * U, col: ink5, al: 'right' }, rlh5 = 2.9 * U * 1.75;
      T(c, v.loc + ' · ' + cityName[0], W - pd5, botB - rlh5 * 1.5, rO5); T(c, v.seatShort + ' · JU ' + v.num, W - pd5, botB - rlh5 * .5, rO5);
      var midTop = pd5 + 6.5 * U * 1.2, midBot = botB - rlh5 * 2;
      var tO5 = { f: F.sc, w: 900, s: 11.5 * U, ls: .2 * U, col: ink5, sh: { col: 'rgba(168,40,31,.28)', x: .4 * U } };
      var tl5 = wrap(c, v.title, tO5, W - pd5 * 2);
      if (tl5.length === 2) { var half = Math.ceil(v.title.length / 2); if (M(c, v.title.slice(0, half), tO5) <= W - pd5 * 2) tl5 = [v.title.slice(0, half), v.title.slice(half)]; }
      var ph5 = 27 * U, pw5 = 37 * U, blockH5 = tl5.length * tO5.s * 1.12 + 4.2 * U + ph5, y5 = (midTop + midBot) / 2 - blockH5 / 2;
      tl5.forEach(function (ln, i) { T(c, ln, pd5, y5 + tO5.s * 1.12 * (i + .5), tO5); });
      var py5 = y5 + tl5.length * tO5.s * 1.12 + 4.2 * U;
      [0, 1].forEach(function (n) {
        var px = W / 2 - pw5 - 1.5 * U + n * (pw5 + 3 * U);
        stripes(c, px, py5, pw5, ph5, 45, '#989eBE', '#a9aec9', 2 * U);
        c.strokeStyle = 'rgba(42,44,51,.25)'; c.lineWidth = .28 * U; c.strokeRect(px + .14 * U, py5 + .14 * U, pw5 - .28 * U, ph5 - .28 * U);
        T(c, 'PHOTO_0' + (n + 1), px + pw5 / 2, py5 + ph5 / 2, { f: F.mono, s: 2.5 * U, col: '#5d6076', al: 'center' });
      });
      grain(c, .12, 'multiply');
    } else {
      var ink6 = '#14150F', pd6 = 6 * U;
      c.fillStyle = '#C9F23C'; c.fillRect(0, 0, W, H);
      stripes(c, 0, 0, W, 20 * U, -45, '#a7cc2b', '#b7dd33', 2.5 * U);
      T(c, '[ 官方图库 · 餐桌 / 沸腾_01 ]', W / 2, 10 * U, { f: F.mono, s: 2.6 * U, ls: .3 * U, col: '#5d7413', al: 'center' });
      stripes(c, 0, H - 14 * U, W, 14 * U, -45, '#a7cc2b', '#b7dd33', 2.5 * U);
      var tO6 = { f: F.sc, w: 900, s: 12.2 * U, ls: .15 * U, col: ink6 };
      var tl6 = wrap(c, v.title, tO6, W - pd6 * 2), lh6 = tO6.s * 1.08;
      var g6 = 2.4 * U, hs = [7 * U * 1.2, 4.5 * U * 1.2, lh6 * tl6.length, 7 * U * 1.2, 3.3 * U * 1.2];
      var tot6 = hs.reduce(function (a, b) { return a + b; }, 0) + g6 * 4, y6 = (20 * U + (H - 14 * U)) / 2 - tot6 / 2;
      var m0 = y6 + hs[0] / 2;
      T(c, v.num, pd6, m0, { f: F.oswald, w: 600, s: 7 * U, ls: .3 * U, col: ink6 }); T(c, v.en, W - pd6, m0, { f: F.oswald, w: 600, s: 7 * U, ls: .3 * U, col: ink6, al: 'right' });
      y6 += hs[0] + g6; var m1 = y6 + hs[1] / 2;
      T(c, 'HOSTED', pd6, m1, { f: F.oswald, w: 500, s: 4.5 * U, ls: .6 * U, col: ink6, alpha: .85 }); T(c, 'BY ' + v.host.toUpperCase(), W - pd6, m1, { f: F.oswald, w: 500, s: 4.5 * U, ls: .6 * U, col: ink6, alpha: .85, al: 'right' });
      y6 += hs[1] + g6;
      tl6.forEach(function (ln, i) { T(c, ln, pd6, y6 + lh6 * (i + .5), tO6); });
      y6 += hs[2] + g6; var m3 = y6 + hs[3] * .62;
      T(c, v.dateNum, pd6, m3, { f: F.oswald, w: 600, s: 7 * U, ls: .2 * U, col: ink6, bl: 'alphabetic' }); T(c, v.time + ' – LATE', W - pd6, m3, { f: F.oswald, w: 600, s: 5 * U, ls: .2 * U, col: ink6, al: 'right', bl: 'alphabetic' });
      y6 += hs[3] + g6; var m4 = y6 + hs[4] / 2;
      T(c, v.loc + ' · ' + cityCode, pd6, m4, { f: F.mono, w: 700, s: 3.3 * U, col: ink6 }); T(c, v.seatShort, W - pd6, m4, { f: F.mono, w: 700, s: 3.3 * U, col: ink6, al: 'right' });
      grain(c, .16, 'multiply');
    }
    return cv;
  }

  // Pure geometry and time-step helpers are shared with the numerical checks.
  var I = function () { return [1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1]; };
  function mul(a,b) {
    var r = Array(16).fill(0);
    for(var c=0;c<4;c++) for(var row=0;row<4;row++) for(var k=0;k<4;k++) r[c*4+row]+=a[k*4+row]*b[c*4+k];
    return r;
  }
  function model(p) {
    var a=p.rx*Math.PI/180,b=p.ry*Math.PI/180,c=p.rz*Math.PI/180,s=p.scale||1;
    var ca=Math.cos(a),sa=Math.sin(a),cb=Math.cos(b),sb=Math.sin(b),cc=Math.cos(c),sc=Math.sin(c);
    var t=I();t[12]=p.x;t[13]=p.y;t[14]=p.z;
    var rx=[1,0,0,0,0,ca,sa,0,0,-sa,ca,0,0,0,0,1];
    var ry=[cb,0,-sb,0,0,1,0,0,sb,0,cb,0,0,0,0,1];
    var rz=[cc,sc,0,0,-sc,cc,0,0,0,0,1,0,0,0,0,1];
    return mul(mul(mul(t,rz),ry),mul(rx,[s,0,0,0,0,s,0,0,0,0,s,0,0,0,0,1]));
  }
  function paperPose(rel,bend) {
    var ar=Math.abs(rel),near=Math.exp(-ar*ar*2),tail=Math.max(0,ar-1);
    return {x:0,y:-1.03*Math.tanh(4.6*rel)-.15*rel-Math.sign(rel)*1.1*tail*tail*tail/(1+tail*tail),
      z:-1.4*(Math.sqrt(rel*rel+.04)-.2),
      rx:20*Math.tanh(rel/.9),ry:0,rz:0,
      bx:clamp(-bend*.003*near,-.010,.010),by:0,
      scale:1-.30*(1-Math.exp(-12*rel*rel)),
      alpha:1-ease(clamp((ar-1.85)/.65,0,1))};
  }
  // Exact critically damped solution: identical timing at 60 Hz and 120 Hz.
  function settle(q,v,target,dt,omega) {
    var x=q-target,b=v+omega*x,decay=Math.exp(-omega*dt);
    return {q:target+(x+b*dt)*decay,v:(v-omega*b*dt)*decay};
  }
  function Stage(canvas,opts) {
    var self=this;this.canvas=canvas;this.opts=opts||{};this.ok=false;this.destroyed=false;
    var gl=this.gl=canvas.getContext('webgl2',{alpha:true,antialias:true,premultipliedAlpha:true,
      powerPreference:'default',preserveDrawingBuffer:!!this.opts.preserve});
    if(!gl){this.fail('WebGL2 unavailable');return;}
    if(!window.JuPaperModel||!window.JuPaperModel.vertices){this.fail('Paper model unavailable');return;}
    function shader(type,source) {
      var s=gl.createShader(type);gl.shaderSource(s,source);gl.compileShader(s);
      if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(s));
      return s;
    }
    function program(v,f) {
      var p=gl.createProgram(),vs=shader(gl.VERTEX_SHADER,v),fs=shader(gl.FRAGMENT_SHADER,f);
      gl.attachShader(p,vs);gl.attachShader(p,fs);gl.linkProgram(p);gl.deleteShader(vs);gl.deleteShader(fs);
      if(!gl.getProgramParameter(p,gl.LINK_STATUS))throw Error(gl.getProgramInfoLog(p));return p;
    }
    var prog,shadowProg;
    try{prog=program(VERT,FRAG);shadowProg=program(SVERT,SFRAG);}catch(e){console.error(e);this.fail('shader');return;}
    var u={};['Projection','Model','Bend','Thickness','Texture','Material','Opacity','Grain','Light'].forEach(function(n){u[n]=gl.getUniformLocation(prog,'u'+n);});
    var su={rect:gl.getUniformLocation(shadowProg,'uRect'),alpha:gl.getUniformLocation(shadowProg,'uAlpha')};
    // Actual triangulated, beveled mesh exported from Blender; no screen-space corner cutout.
    var vertices=new Float32Array(window.JuPaperModel.vertices);
    var vao=gl.createVertexArray();gl.bindVertexArray(vao);
    var buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,vertices,gl.STATIC_DRAW);
    var offset=0;[['aPos',3],['aUV',2],['aNormal',3],['aFace',1]].forEach(function(d){
      var a=gl.getAttribLocation(prog,d[0]);gl.enableVertexAttribArray(a);gl.vertexAttribPointer(a,d[1],gl.FLOAT,false,36,offset*4);offset+=d[1];
    });
    var shadowVAO=gl.createVertexArray();gl.bindVertexArray(shadowVAO);
    var sb=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,sb);
    gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,1,1,-1,-1,1,1,-1,1]),gl.STATIC_DRAW);
    var sa=gl.getAttribLocation(shadowProg,'aPosition');gl.enableVertexAttribArray(sa);gl.vertexAttribPointer(sa,2,gl.FLOAT,false,0,0);
    var aniso=gl.getExtension('EXT_texture_filter_anisotropic'),texCache={},cards=[],textures=[],N=0;
    function makeTexture(card) {
      var key=JSON.stringify(card);if(texCache[key])return texCache[key];
      var cv=paintCard(card,document.createElement('canvas')),t=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,t);
      gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,cv);gl.generateMipmap(gl.TEXTURE_2D);
      gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR_MIPMAP_LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
      if(aniso)gl.texParameterf(gl.TEXTURE_2D,aniso.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(4,gl.getParameter(aniso.MAX_TEXTURE_MAX_ANISOTROPY_EXT)));
      texCache[key]=t;return t;
    }
    function clearTextures(){Object.keys(texCache).forEach(function(k){gl.deleteTexture(texCache[k]);});texCache={};}
    this.repaint=function(){if(self.destroyed)return;clearTextures();textures=cards.map(makeTexture);wake();};
    var reduced=matchMedia('(prefers-reduced-motion: reduce)');
    var state=this.state={q:0,target:0,v:0,visible:true,ready:false,fontsReady:false,drag:null,entry:0,t:0,last:0,announced:-1,
      bend:0,wheelUntil:0,favX:0,favTarget:0,frames:0};
    var aspect=1,projection=I(),width=0,height=0,rig=.905,raf=0,entryStart=0,firstCards=true;
    var listeners=[],onFontsTimer=0,reportedBusy=false,restOverlay=null,cardsGeneration=0,fontTimeout=0;
    var loadingStatus=document.createElement('span');loadingStatus.dataset.juPaperStatus='';loadingStatus.setAttribute('role','status');loadingStatus.setAttribute('aria-live','polite');loadingStatus.style.cssText='position:absolute;left:8px;right:8px;bottom:8px;text-align:center;font:12px/1.6 sans-serif;color:#626a7c;pointer-events:none';loadingStatus.hidden=true;canvas.parentElement.appendChild(loadingStatus);
    function listen(target,type,fn,options){target.addEventListener(type,fn,options);listeners.push(function(){target.removeEventListener(type,fn,options);});}
    function maxQ(){return Math.max(0,N-1);}
    function busy(){return !state.ready||!!state.drag||Math.abs(state.q-state.target)>.012||Math.abs(state.q-Math.round(state.q))>.012||Math.abs(state.v)>.08||!!state.entry;}
    function reportBusy(){
      var b=busy();if(b!==reportedBusy){reportedBusy=b;if(self.opts.onBusy)self.opts.onBusy(b);}
      canvas.style.cursor=state.drag?'grabbing':'grab';
    }
    function resize(){
      if(self.destroyed)return;
      var r=canvas.getBoundingClientRect(),dpr=Math.min(devicePixelRatio||1,2);
      width=canvas.clientWidth||r.width;height=canvas.clientHeight||r.height;if(!width||!height)return;
      canvas.width=Math.round(width*dpr);canvas.height=Math.round(height*dpr);aspect=width/height;
      var f=1/Math.tan(30*Math.PI/360),n=.1,far=50;
      projection=[f/aspect,0,0,0,0,f,0,0,0,0,(far+n)/(n-far),-1,0,0,2*far*n/(n-far),0];
      // Keep the ticket legible while leaving more breathing room inside the phone.
      // Both bounds follow the live stage size so compact screens do not crop it.
      var cardWidth=Math.min(width*(self.opts.cardWidthRatio||.72),height*(self.opts.cardHeightRatio||.40),self.opts.maxCardWidth||250);
      rig=self.opts.rigScale||cardWidth*9.5/(height*f*1.2);
      gl.viewport(0,0,canvas.width,canvas.height);
      if(self.opts.onLayout)self.opts.onLayout(self.centerRect());wake();
    }
    this.centerRect=function(){
      var z=9.5-.009*rig,w=height*projection[5]*1.2*rig/z,h=w*1.25;
      return{x:(width-w)/2,y:(height-h)/2,w:w,h:h};
    };
    function pose(rel){
      var p=paperPose(rel,reduced.matches?0:state.bend);
      if(state.favX){
        var arrival=Math.exp(-Math.pow(rel/.30,2)),upp=19*Math.tan(Math.PI/12)/Math.max(1,height)/rig;
        p.x+=state.favX*upp*arrival;p.rz-=state.favX*.012*arrival;
      }
      return p;
    }
    function worldModel(p){
      return mul(model({x:0,y:-state.entry*.16,z:0,rx:0,ry:0,rz:0,scale:rig}),model(p));
    }
    function drawShadow(p,alpha,spread,drop){
      var f=projection[5],z=9.5-p.z*rig;
      gl.uniform4f(su.rect,p.x*rig*f/aspect/z,(p.y-drop-state.entry*.16/rig)*rig*f/z,
        spread*rig*f/aspect/z,1.43*p.scale*rig*f/z);
      gl.uniform1f(su.alpha,alpha*p.alpha);gl.drawArrays(gl.TRIANGLES,0,6);
    }
    function syncOverlay(){
      if(!restOverlay||!restOverlay.isConnected)restOverlay=canvas.parentElement&&canvas.parentElement.querySelector('[data-ju-fav-wrap]');
      if(!restOverlay)return;
      var delta=Math.abs(state.q-Math.round(state.q)),visible=N>0&&state.announced===Math.round(state.q)&&delta<.04&&!state.entry;
      restOverlay.style.visibility=visible?'visible':'hidden';
      restOverlay.style.transition='none';
      restOverlay.style.transform='translateX('+state.favX.toFixed(3)+'px) rotate('+(state.favX*.012).toFixed(3)+'deg)';
    }
    function render(){
      if(!width||!height)return;
      gl.depthMask(true);gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
      gl.enable(gl.BLEND);gl.blendFuncSeparate(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA,gl.ONE,gl.ONE_MINUS_SRC_ALPHA);
      gl.disable(gl.CULL_FACE);if(!N){syncOverlay();return;}
      var poses=[];
      for(var i=Math.max(0,Math.floor(state.q)-2);i<=Math.min(N-1,Math.ceil(state.q)+2);i++){
        var p=pose(i-state.q);if(p.alpha>.005)poses.push({i:i,p:p});
      }
      gl.useProgram(shadowProg);gl.bindVertexArray(shadowVAO);gl.disable(gl.DEPTH_TEST);gl.depthMask(false);
      poses.filter(function(o){return Math.abs(o.i-state.q)<1.2;}).forEach(function(o){
        drawShadow(o.p,.10,1.48*o.p.scale,.12);drawShadow(o.p,.07,1.23*o.p.scale,.045);
      });
      gl.enable(gl.DEPTH_TEST);gl.enable(gl.CULL_FACE);gl.cullFace(gl.BACK);
      gl.useProgram(prog);gl.bindVertexArray(vao);gl.uniformMatrix4fv(u.Projection,false,projection);
      gl.uniform1i(u.Material,1);gl.uniform1f(u.Thickness,1);gl.uniform1f(u.Grain,.20);gl.uniform1f(u.Light,.9);gl.uniform1i(u.Texture,0);
      poses.sort(function(a,b){return a.p.z-b.p.z;}).forEach(function(o){
        gl.depthMask(o.p.alpha>.995);gl.uniformMatrix4fv(u.Model,false,worldModel(o.p));
        gl.uniform2f(u.Bend,o.p.bx,0);gl.uniform1f(u.Opacity,o.p.alpha);
        gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,textures[o.i]);gl.drawArrays(gl.TRIANGLES,0,vertices.length/9);
      });
      gl.depthMask(true);syncOverlay();state.frames++;
      if(self.opts.onRender)self.opts.onRender(canvas);
    }
    function announce(force){
      if(!state.ready)return;
      var n=clamp(Math.round(state.q),0,maxQ());if(n!==state.announced||force){
        state.announced=n;canvas.setAttribute('aria-label',cards[n]?cards[n].title+'，上下翻看局卡，左右滑动收藏，点卡进入':'当前没有局卡');
        if(self.opts.onIndex)self.opts.onIndex(n);
      }
    }
    function wake(){if(!raf&&!self.destroyed){state.last=performance.now();raf=requestAnimationFrame(frame);}}
    function frame(now){
      raf=0;if(self.destroyed||document.hidden||!state.visible)return;
      var dt=Math.min((now-state.last)/1000,.05);state.last=now;state.t+=dt;
      if(state.entry){var t=clamp((now-entryStart)/420,0,1);state.entry=reduced.matches?0:Math.pow(1-t,3);}
      if(state.wheelUntil&&now>=state.wheelUntil){state.target=clamp(Math.round(state.target),0,maxQ());state.wheelUntil=0;state.v=0;}
      if(!state.drag&&!state.wheelUntil){
        if(reduced.matches){state.q=state.target;state.v=0;}
        else {var next=settle(state.q,state.v,state.target,dt,17);state.q=next.q;state.v=next.v;}
        if(Math.abs(state.q-state.target)<.0005&&Math.abs(state.v)<.008){state.q=state.target;state.v=0;}
      }
      state.bend=mix(state.bend,reduced.matches?0:clamp(state.v,-3,3),1-Math.exp(-dt*18));
      if(Math.abs(state.bend)<.002)state.bend=0;
      if(!state.drag||state.drag.axis!=='x'){
        state.favX=mix(state.favX,state.favTarget,reduced.matches?1:1-Math.exp(-dt*23));
        if(Math.abs(state.favX-state.favTarget)<.05)state.favX=state.favTarget;
      }
      if(Math.abs(state.q-state.target)<.012&&Math.abs(state.v)<.12)announce();
      render();reportBusy();
      var active=state.drag||state.entry||state.wheelUntil||state.q!==state.target||Math.abs(state.v)>.001||state.bend||state.favX!==state.favTarget;
      if(active)raf=requestAnimationFrame(frame);
    }
    function elastic(raw){
      var max=maxQ();if(raw<0)return -.30*(1-Math.exp(raw/.30));
      if(raw>max)return max+.30*(1-Math.exp(-(raw-max)/.30));return raw;
    }
    function coords(e,r){return{x:(e.clientX-r.left)*width/r.width,y:(e.clientY-r.top)*height/r.height};}
    function hitCenter(e){
      var r=canvas.getBoundingClientRect(),c=coords(e,r),cr=self.centerRect();
      // The touch target follows the actual paper during its favorite return.
      var angle=state.favX*.012*Math.PI/180,dx=c.x-(width/2+state.favX),dy=c.y-height/2;
      var localX=dx*Math.cos(angle)+dy*Math.sin(angle),localY=-dx*Math.sin(angle)+dy*Math.cos(angle);
      return Math.abs(localX)<=cr.w/2&&Math.abs(localY)<=cr.h/2;
    }
    function settled(){return state.ready&&!state.wheelUntil&&!state.entry&&Math.abs(state.q-state.target)<.012&&Math.abs(state.q-Math.round(state.q))<.012&&Math.abs(state.v)<.12;}
    listen(canvas,'pointerdown',function(e){
      if(e.button!==0||state.drag||!N||!state.ready)return;
      e.preventDefault();var rect=canvas.getBoundingClientRect(),c=coords(e,rect),stable=settled();
      state.wheelUntil=0;state.target=state.q;state.v=0;
      state.drag={id:e.pointerId,x:c.x,y:c.y,q:state.q,last:state.q,time:performance.now(),velocity:0,axis:null,
        rect:rect,favStart:state.favX,canFav:stable&&hitCenter(e),canTap:stable};
      canvas.setPointerCapture(e.pointerId);
      if(canvas.parentElement&&canvas.parentElement.focus)canvas.parentElement.focus({preventScroll:true});
      wake();
    });
    listen(canvas,'pointermove',function(e){
      var d=state.drag;if(!d||d.id!==e.pointerId)return;
      e.preventDefault();var c=coords(e,d.rect),dx=c.x-d.x,dy=c.y-d.y;
      if(!d.axis){
        if(Math.hypot(dx,dy)<6)return;
        if(Math.abs(dx)>Math.abs(dy)*1.25){
          d.axis=d.canFav?'x':'blocked';
          if(d.axis==='x'&&self.opts.onFavStart)self.opts.onFavStart();
        }else d.axis='y';
      }
      if(d.axis==='blocked')return;
      if(d.axis==='x'){if(self.opts.onFavMove)self.opts.onFavMove(dx+d.favStart);wake();return;}
      var pitch=clamp(self.centerRect().h*.57,168,216),q=elastic(d.q-dy/pitch);
      var now=performance.now(),dt=Math.max(.004,(now-d.time)/1000);
      d.velocity=mix(d.velocity,(q-d.last)/dt,1-Math.exp(-dt*32));
      d.last=q;d.time=now;state.q=q;state.target=q;state.v=clamp(d.velocity,-3,3);wake();
    });
    function release(e,cancel){
      var d=state.drag;if(!d||d.id!==e.pointerId)return;
      state.drag=null;
      if(canvas.hasPointerCapture(e.pointerId))canvas.releasePointerCapture(e.pointerId);
      if(d.axis==='x'){
        if(self.opts.onFavEnd)self.opts.onFavEnd(cancel?0:coords(e,d.rect).x-d.x+d.favStart,cancel);
        state.v=0;state.target=clamp(Math.round(state.q),0,maxQ());wake();return;
      }
      if(d.axis==='y'){
        var velocity=clamp(d.velocity*Math.exp(-(performance.now()-d.time)/80),-2.6,2.6);
        state.target=clamp(Math.round(state.q+(cancel?0:clamp(velocity*.10,-.32,.32))),0,maxQ());
        // Velocity must point toward the chosen snap point; a cancelled flick never travels away.
        var distance=state.target-state.q;
        state.v=!cancel&&velocity*distance>0?Math.sign(distance)*Math.min(Math.abs(velocity),Math.abs(distance)*17):0;
      }else{
        state.target=clamp(Math.round(state.q),0,maxQ());state.v=0;
        if(!cancel&&!d.axis&&d.canTap&&hitCenter(e)&&self.opts.onTap){
          var index=clamp(Math.round(state.q),0,maxQ());announce(true);self.opts.onTap(true,index);
        }
      }
      wake();
    }
    function cancelGesture(){
      if(state.drag)release({pointerId:state.drag.id},true);
      state.wheelUntil=0;state.target=clamp(Math.round(state.q),0,maxQ());state.v=0;
      state.favTarget=0;wake();
    }
    this.cancelGesture=cancelGesture;
    listen(window,'blur',cancelGesture);
    listen(window,'resize',cancelGesture);
    listen(canvas,'pointerup',function(e){release(e,false);});
    listen(canvas,'pointercancel',function(e){release(e,true);});
    listen(canvas,'lostpointercapture',function(e){release(e,true);});
    listen(canvas,'wheel',function(e){
      if(!N||!state.ready||Math.abs(e.deltaX)>Math.abs(e.deltaY))return;
      e.preventDefault();if(state.drag)return;
      var rect=canvas.getBoundingClientRect(),scale=height/Math.max(1,rect.height);
      var unit=e.deltaMode===1?16:e.deltaMode===2?rect.height:1;
      var amount=clamp(e.deltaY*unit*scale/340,-.45,.45);
      state.q=elastic(state.q+amount);state.target=state.q;state.v=0;
      state.wheelUntil=performance.now()+115;wake();
    },{passive:false});
    listen(canvas,'webglcontextlost',function(e){e.preventDefault();self.fail('context lost');});
    var ro=new ResizeObserver(resize);ro.observe(canvas);
    var io=new IntersectionObserver(function(es){state.visible=es[0].isIntersecting;if(state.visible)wake();else cancelGesture();},{threshold:.01});io.observe(canvas);
    listen(document,'visibilitychange',function(){if(document.hidden)cancelGesture();else wake();});
    listen(reduced,'change',function(){if(reduced.matches){state.entry=0;state.bend=0;state.v=0;}wake();});
    this.setCards=function(list,index){
      var generation=++cardsGeneration,nextCards=list.slice();cancelGesture();clearTimeout(fontTimeout);
      state.ready=false;state.fontsReady=false;canvas.setAttribute('aria-busy','true');
      loadingStatus.textContent='纸卡正在就位';loadingStatus.hidden=false;reportBusy();
      if(self.opts.onLoading)self.opts.onLoading(true);
      var deadline=new Promise(function(_,reject){fontTimeout=setTimeout(function(){reject(Error('字体载入超时，请重新进入'));},25000);});
      return Promise.race([loadFonts(nextCards),deadline]).then(function(){
        if(self.destroyed||generation!==cardsGeneration)return false;clearTimeout(fontTimeout);
        cards=nextCards;N=cards.length;textures=cards.map(makeTexture);
        // Preserve unchanged GPU resources. Only superseded card artwork is released.
        var keep=new Set(cards.map(function(card){return JSON.stringify(card)}));
        Object.keys(texCache).forEach(function(key){if(!keep.has(key)){gl.deleteTexture(texCache[key]);delete texCache[key]}});
        state.q=state.target=clamp(index||0,0,maxQ());state.v=0;state.bend=0;state.drag=null;
        state.wheelUntil=0;state.announced=-1;state.favX=state.favTarget=0;state.ready=true;state.fontsReady=true;
        self.ok=true;canvas.removeAttribute('data-ju-render-error');canvas.setAttribute('aria-busy','false');loadingStatus.hidden=true;
        state.entry=N&&firstCards&&!reduced.matches?1:0;if(N)firstCards=false;entryStart=performance.now();
        resize();announce(true);wake();if(self.opts.onLoading)self.opts.onLoading(false);if(self.opts.onReady)self.opts.onReady();return true;
      }).catch(function(error){
        if(self.destroyed||generation!==cardsGeneration)return false;clearTimeout(fontTimeout);canvas.setAttribute('aria-busy','false');
        loadingStatus.textContent='纸卡字体未就绪，请重新进入';loadingStatus.hidden=false;self.fail('字体加载失败：'+error.message);return false;
      });
    };
    this.setIndex=function(i,immediate){
      if(state.drag||!state.ready)return;state.wheelUntil=0;state.target=clamp(i,0,maxQ());
      if(immediate){state.q=state.target;state.v=0;announce();}wake();
    };
    this.advance=function(dir){self.setIndex(Math.round(state.target)+dir,false);};
    this.setFavX=function(px){
      state.favTarget=px||0;if(state.drag&&state.drag.axis==='x')state.favX=state.favTarget;wake();
    };
    this.index=function(){return clamp(Math.round(state.q),0,maxQ());};
    this.isSettled=settled;
    this.destroy=function(){
      self.destroyed=true;cardsGeneration++;cancelAnimationFrame(raf);clearTimeout(onFontsTimer);clearTimeout(fontTimeout);loadingStatus.remove();ro.disconnect();io.disconnect();
      listeners.forEach(function(off){off();});clearTextures();
      gl.deleteBuffer(buffer);gl.deleteBuffer(sb);gl.deleteVertexArray(vao);gl.deleteVertexArray(shadowVAO);
      gl.deleteProgram(prog);gl.deleteProgram(shadowProg);
    };
    this.ok=true;window.JuFilm.last=this;resize();
  }
  Stage.prototype.fail=function(why){
    this.ok=false;this.canvas.setAttribute('data-ju-render-error',why);
    if(this.opts&&this.opts.onFail)this.opts.onFail(why);
  };
  // Match the reference loader: prime the printed glyphs before the first GPU texture.
  function loadFonts(cards){
    if(!document.fonts||!cards||!cards.length)return Promise.resolve();
    var words=(cards||[]).map(function(c){return (c.title||'')+(c.host||'')+(c.loc||'');}).join('')+'缺人的你来不来还不算局主开吃就这张HOTPOT RESCUE 0123456789';
    var required=[['Libre Caslon Text',700],['Space Mono',400],['Space Mono',700],['Caveat',600],['Archivo',400],['Archivo',500],['Archivo',800],['Archivo Black',400],['Oswald',500],['Oswald',600],['Noto Sans SC',400],['Noto Sans SC',900],['Zhi Mang Xing',400]];
    // V16 installs its bundled CSS through <helmet> asynchronously. FontFaceSet.load
    // before those declarations exist resolves [] and would accept a fallback face.
    var declared=new Promise(function(resolve,reject){var started=performance.now();function check(){
      var families=Array.from(document.fonts).map(function(face){return face.family.replace(/["']/g,'');});
      var missing=required.filter(function(f){return families.indexOf(f[0])<0;});
      if(!missing.length){resolve();return;}
      if(performance.now()-started>24000){reject(Error('字体样式未就绪：'+missing[0][0]));return;}setTimeout(check,40);
    }check();});
    return declared.then(function(){return Promise.all(required.map(function(f){return document.fonts.load(f[1]+' 20px "'+f[0]+'"',words).then(function(faces){if(!faces.length)throw Error(f[0]+' '+f[1]+' 不可用');return faces;});}));});
  }
  window.JuFilm={Stage:Stage,paintCard:paintCard,loadFonts:loadFonts,motion:{pose:paperPose,settle:settle,model:model}};
})();

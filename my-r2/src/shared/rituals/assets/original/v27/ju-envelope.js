/* ju-envelope.js — 基于 ju-vellum 原生 WebGL 纸信封 renderer。
   保留原网格、纸材质、BASE / ROUTES / EASE / sample；JU 增加背景采样、活动贴图、
   可用空间取景，以及可见性、减少动态、资源释放与 context 恢复驱动。 */
(()=>{
if(window.JuEnvelope)return;
class PaperStudio {
  constructor(canvas,art,opts){this.opts=opts||{};
    this.canvas=canvas;this.gl=canvas.getContext('webgl',{alpha:false,antialias:true,preserveDrawingBuffer:true,powerPreference:'high-performance'});if(!this.gl)throw Error('WebGL 不可用');
    this.view={yaw:0,pitch:0,zoom:1.58,light:0};this.art=art;this.frames=0;this.lost=false;
    const gl=this.gl;
    const vertex=`precision highp float;
attribute vec3 aPos;attribute vec3 aNormal;attribute vec2 aUV;
uniform vec3 uAngles;uniform vec2 uViewport;uniform float uSpan,uTarget;
varying vec2 vUV;varying vec3 vNormal;varying vec3 vPos;
vec3 rotate(vec3 p){float c=cos(uAngles.x),s=sin(uAngles.x);p=vec3(p.x,c*p.y-s*p.z,s*p.y+c*p.z);c=cos(uAngles.y);s=sin(uAngles.y);p=vec3(c*p.x+s*p.z,p.y,-s*p.x+c*p.z);c=cos(uAngles.z);s=sin(uAngles.z);return vec3(c*p.x-s*p.y,s*p.x+c*p.y,p.z);}
void main(){vec3 p=rotate(aPos);float f=1500.0/(1500.0-p.z);gl_Position=vec4(p.x*f/(uSpan*uViewport.x/uViewport.y), (p.y-uTarget)*f/uSpan,-p.z/2000.0,1.0);vUV=aUV;vNormal=rotate(aNormal);vPos=aPos;}`;
    const fragment=`precision highp float;
uniform sampler2D uScene,uGrain,uArt,uReverse,uPrint;
uniform vec2 uViewport;uniform float uKind,uDensity,uBlur,uOpacity,uTriangle,uLight,uPrinted,uSeen;
varying vec2 vUV;varying vec3 vNormal;varying vec3 vPos;
vec3 read(vec2 uv){return texture2D(uScene,uv).rgb;}
void main(){vec2 q=gl_FragCoord.xy/uViewport;vec3 under=read(q);
if(uKind>2.5&&uKind<3.5){float e=min(vUV.x,min(vUV.y,1.0-vUV.x-vUV.y));float a=smoothstep(0.0,.045,e)*uOpacity;gl_FragColor=vec4(mix(under,vec3(.30,.32,.30),a),1.0);return;}
if(uKind>3.5){vec4 ink=texture2D(uPrint,vUV);gl_FragColor=vec4(mix(under,ink.rgb,ink.a*uOpacity),1.0);return;}
vec3 n=normalize(vNormal);if(n.z<0.0)n=-n;
vec3 l=normalize(mix(vec3(-.5,.7,1.2),vec3(-1.4,.4,.45),uLight));
float facing=max(dot(n,l),0.0);
if(uKind>.5&&uKind<1.5){vec4 a=vNormal.z>0.0?texture2D(uArt,vUV):texture2D(uReverse,vec2(1.0-vUV.x,vUV.y));float diffuse=.86+.16*facing;gl_FragColor=vec4(a.rgb*diffuse,1.0);return;}
vec2 material=vec2(vPos.x*.0032,vPos.y*.0032);
vec4 grain=texture2D(uGrain,material);vec4 fibre=texture2D(uGrain,material*vec2(1.1,1.7)+.23);
n=normalize(n+vec3((grain.r-.5)*.24,(fibre.g-.5)*.34,0.0));
float ndl=max(dot(n,l),0.0);float lambert=.76+.235*ndl;
float sheen=pow(max(dot(n,normalize(l+vec3(0.,0.,1.))),0.0),18.0)*.027;
vec3 paper=vec3(.968,.963,.925)*lambert+sheen;
float radius=uBlur*(.75+.5*(1.0-ndl));vec2 px=vec2(radius)/uViewport;
vec3 diffuse=under*.20;
diffuse+=(read(q+px*vec2(1.,0.))+read(q-px*vec2(1.,0.))+read(q+px*vec2(0.,1.))+read(q-px*vec2(0.,1.)))*.12;
diffuse+=(read(q+px*vec2(1.8,1.8))+read(q+px*vec2(-1.8,1.8))+read(q+px*vec2(1.8,-1.8))+read(q-px*vec2(1.8,1.8)))*.08;
float lum=dot(diffuse,vec3(.2126,.7152,.0722));diffuse=mix(vec3(lum),diffuse,.88);
float density=clamp(uDensity+(grain.g-.5)*.14,0.,1.);
vec3 color=mix(diffuse,paper,density);color+=((grain.r-.5)*.11+(fibre.g-.5)*.075)*(1.0+uLight*.45);
float edge=min(min(vUV.x,vUV.y),min(1.-vUV.x,1.-vUV.y));if(uTriangle>.5)edge=min(vUV.x,min(vUV.y,1.-vUV.x-vUV.y));
color-=exp(-max(edge,0.0)*260.0)*.033;color+=exp(-abs(edge-.003)*520.0)*.012;
if(uPrinted>.5){vec4 ink=texture2D(uPrint,vUV);color=mix(color,ink.rgb,ink.a*uSeen);}
gl_FragColor=vec4(mix(under,color,uOpacity),1.0);
}`;
    const fullV=`attribute vec2 aPos;varying vec2 vUV;void main(){vUV=aPos*.5+.5;gl_Position=vec4(aPos,0.,1.);}`;
    const fullF=`precision highp float;varying vec2 vUV;uniform sampler2D uScene;uniform float uBackground,uSpan,uTarget,uCardY,uEnvY,uEnvOpacity,uLight;uniform vec2 uViewport;uniform sampler2D uBgTex;uniform float uUseBg;uniform vec4 uBgRect;
float box(vec2 p,vec2 b){vec2 d=abs(p)-b;return length(max(d,0.))+min(max(d.x,d.y),0.);}
void main(){if(uBackground<.5){gl_FragColor=texture2D(uScene,vUV);return;}vec2 p=(vUV-.5)*vec2(2.*uSpan*uViewport.x/uViewport.y,2.*uSpan);p.y+=uTarget;
float wash=exp(-length((vUV-vec2(.35,.8))*vec2(.95,.7))*1.7);vec3 bg=mix(vec3(.795,.815,.83),vec3(.942,.946,.935),wash);if(uUseBg>.5)bg=texture2D(uBgTex,vec2(uBgRect.x+vUV.x*uBgRect.z,uBgRect.y+(1.0-vUV.y)*uBgRect.w)).rgb;
vec2 r=p-vec2(15.,-20.+uEnvY);float a=-.055; r=mat2(cos(a),-sin(a),sin(a),cos(a))*r;
float d=box(r,vec2(150.,188.));float shadow=exp(-pow(max(d,0.)/22.,2.))*.072*uEnvOpacity;shadow+=exp(-pow(max(d,0.)/65.,2.))*.025*uEnvOpacity;if(uUseBg>.5)shadow+=exp(-pow(max(d,0.)/110.,2.))*.06*uEnvOpacity;
float cd=box(p-vec2(16.,uCardY-19.),vec2(121.,151.));shadow+=exp(-pow(max(cd,0.)/26.,2.))*.055;
bg-=shadow;float grain=fract(sin(dot(gl_FragCoord.xy,vec2(12.9898,78.233)))*43758.5453)-.5;bg+=grain*.0028;gl_FragColor=vec4(bg,1.);}`;
    this.main=this.program(vertex,fragment);this.full=this.program(fullV,fullF);this.buffer=gl.createBuffer();this.quad=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,this.quad);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]),gl.STATIC_DRAW);
    this.grain=this.texture(this.makeGrain(),true);this.cardTexture=this.texture((this.opts.event?.queueRank23||this.opts.event?.queueReceipt25)?this.makeQueueReceipt():art);this.reverse=this.texture(this.opts.reverse||this.makeReverse());this.bgTex=this.texture();this.bg=null;this.print=this.texture(this.makePrint('waiting'));this.printKey='waiting';
    this.stamp=this.texture(this.makeStamp());this.passes=[this.target(),this.target()];this.front=0;
    this.resize();
  }
  program(v,f){const gl=this.gl;const make=(type,src)=>{const s=gl.createShader(type);gl.shaderSource(s,src);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(s));return s;};const p=gl.createProgram();gl.attachShader(p,make(gl.VERTEX_SHADER,v));gl.attachShader(p,make(gl.FRAGMENT_SHADER,f));gl.linkProgram(p);if(!gl.getProgramParameter(p,gl.LINK_STATUS))throw Error(gl.getProgramInfoLog(p));return{program:p,uniforms:{}};}
  uniform(p,n,...v){const gl=this.gl;const loc=p.uniforms[n]??(p.uniforms[n]=gl.getUniformLocation(p.program,n));if(v.length===1)gl.uniform1f(loc,v[0]);if(v.length===2)gl.uniform2f(loc,...v);if(v.length===3)gl.uniform3f(loc,...v);}
  bind(p,name,tex,unit){const gl=this.gl;gl.activeTexture(gl.TEXTURE0+unit);gl.bindTexture(gl.TEXTURE_2D,tex);gl.uniform1i(gl.getUniformLocation(p.program,name),unit);}
  texture(source,repeat=false){const gl=this.gl;const tex=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,tex);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,repeat?gl.REPEAT:gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,repeat?gl.REPEAT:gl.CLAMP_TO_EDGE);if(source){let upload=source;if((source.width&(source.width-1))||(source.height&(source.height-1))){upload=document.createElement('canvas');upload.width=2**Math.ceil(Math.log2(source.width));upload.height=2**Math.ceil(Math.log2(source.height));upload.getContext('2d').drawImage(source,0,0,upload.width,upload.height);}gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,upload);gl.generateMipmap(gl.TEXTURE_2D);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR_MIPMAP_LINEAR);const aniso=gl.getExtension('EXT_texture_filter_anisotropic');if(aniso)gl.texParameterf(gl.TEXTURE_2D,aniso.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(4,gl.getParameter(aniso.MAX_TEXTURE_MAX_ANISOTROPY_EXT)));}return tex;}
  target(){return{tex:this.texture(),fb:this.gl.createFramebuffer()};}
  resize(){const gl=this.gl,r=this.canvas.getBoundingClientRect();const dpr=Math.min(devicePixelRatio||1,1.65);let w=Math.round(r.width*dpr),h=Math.round(r.height*dpr);if(!w||!h)return;if(w===this.canvas.width&&h===this.canvas.height&&this.sized)return;this.canvas.width=w;this.canvas.height=h;this.dpr=dpr;this.passes.forEach(t=>{gl.bindTexture(gl.TEXTURE_2D,t.tex);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,w,h,0,gl.RGBA,gl.UNSIGNED_BYTE,null);gl.bindFramebuffer(gl.FRAMEBUFFER,t.fb);gl.framebufferTexture2D(gl.FRAMEBUFFER,gl.COLOR_ATTACHMENT0,gl.TEXTURE_2D,t.tex,0);if(gl.checkFramebufferStatus(gl.FRAMEBUFFER)!==gl.FRAMEBUFFER_COMPLETE)throw Error('渲染缓冲区不可用');});this.sized=true;}
  makeGrain(){const c=document.createElement('canvas');c.width=c.height=512;const x=c.getContext('2d');let seed=1347;const rand=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};const d=x.createImageData(512,512);for(let i=0;i<d.data.length;i+=4){const fine=107+rand()*42;d.data[i]=fine;d.data[i+1]=fine;d.data[i+2]=128;d.data[i+3]=255;}x.putImageData(d,0,0);for(let i=0;i<2900;i++){const px=rand()*512,py=rand()*512;const alpha=.05+rand()*.09;x.strokeStyle=`rgba(${i%2?'225,235,217':'52,73,49'},${alpha})`;x.lineWidth=.25+rand()*.55;x.beginPath();x.moveTo(px,py);x.quadraticCurveTo(px+rand()*9-4,py+rand()*10,px+rand()*20-5,py+rand()*22);x.stroke();}return c;}
  makeQueueReceipt(){const c=document.createElement('canvas');c.width=768;c.height=960;const x=c.getContext('2d'),v=this.opts.event,waiting=v.queueState25==='waiting'||!v.queueState25,invited=v.queueState25==='invited',end=invited&&v.queueDeadline25?new Date(v.queueDeadline25).toLocaleTimeString('zh-CN',{hour:'2-digit',minute:'2-digit',hour12:false}):'';x.fillStyle='#f5f1e8';x.fillRect(0,0,768,960);x.fillStyle='#4d5c94';x.font='500 27px "Noto Sans SC"';x.fillText('JU. / 候补回执',66,98);x.strokeStyle='#c2c8d8';x.beginPath();x.moveTo(66,136);x.lineTo(702,136);x.stroke();x.fillStyle='#2b3346';x.font='500 39px "Noto Sans SC"';const title=v.title||'';for(let i=0;i<title.length;i+=14)x.fillText(title.slice(i,i+14),66,204+Math.floor(i/14)*55);x.font='400 34px "Noto Sans SC"';x.fillStyle='#586275';x.fillText(v.wd+' '+v.date+' · '+v.time,66,318);x.fillStyle='#4553be';x.font='400 29px "Noto Sans SC"';x.fillText(waiting?'你在候补队列的':'当前参与状态',66,408);x.font=waiting?'500 216px "Archivo"':'500 122px "Noto Sans SC"';x.fillText(waiting?String(v.queueRank23).padStart(2,'0'):invited?'已预留':v.queueState25==='expired'?'已到期':v.queueState25==='cancelled'?'已取消':'已更新',60,625);x.font='400 32px "Noto Sans SC"';if(waiting)x.fillText('位',624,623);x.beginPath();x.moveTo(66,677);x.lineTo(702,677);x.stroke();x.fillStyle='#35466f';x.font='500 46px "Noto Sans SC"';x.fillText(waiting?'轮到后需在6小时内确认':invited?'请在 '+end+' 前确认':'请查看当前活动',66,752);x.font='400 36px "Noto Sans SC"';x.fillStyle='#586275';x.fillText(waiting?'现在尚未留位，也尚未确认参加。':invited?'位置已经预留，请先阅读参加约定。':v.queueState25==='expired'?'邀请已到期，预留席位已释放。':'这次候补已经结束。',66,810);x.font='22px "Space Mono"';x.fillText(waiting?'WAITING / JU.':invited?'INVITED / JU.':'UPDATED / JU.',66,893);return c;}
  makeReverse(){const c=document.createElement('canvas');c.width=512;c.height=640;const x=c.getContext('2d');x.fillStyle='#eae1cc';x.fillRect(0,0,512,640);x.strokeStyle='#b3a283';x.lineWidth=1;x.strokeRect(22,22,468,596);x.textAlign='center';x.fillStyle='#993e30';x.font='140px Georgia';x.fillText('JU.',256,316);x.font='22px sans-serif';x.fillText('局主说：来',256,383);x.font='12px monospace';x.fillText(((this.opts.event&&(this.opts.event.en||this.opts.event.title))||'HOTPOT RESCUE')+' · ADMIT ONE',256,565,460);return c;}
  makePrint(key){const c=document.createElement('canvas');c.width=1024;c.height=1024;const x=c.getContext('2d');x.fillStyle='rgba(75,80,67,.60)';x.textAlign='center';x.font='30px "Microsoft YaHei",sans-serif';const rank=this.opts.event?.queueRank23;const label=this.opts.event?.queueReceipt25?(this.opts.event.queueState25==='waiting'?'候补 第 '+rank+' 位':this.opts.event.queueState25==='invited'?'邀请已送达':'候补已更新'):key==='A'?'这次没约上':key==='B'?'留给下一场':key==='C'?'下次再一起':'等局主点头';x.fillText(label,512,849);x.font='13px monospace';x.fillStyle='rgba(74,80,67,.40)';x.fillText('FROM YOU  /  TO THE HOST',512,891);x.textAlign='left';x.font='24px Georgia';x.fillText('JU.',69,969);x.textAlign='right';x.font='12px monospace';x.fillText((this.opts.event&&(this.opts.event.en||this.opts.event.title))||'HOTPOT RESCUE',951,969,740);return c;}
  makeStamp(){const c=document.createElement('canvas');c.width=c.height=256;const x=c.getContext('2d');x.textAlign='center';x.font='50px "Microsoft YaHei",sans-serif';x.fillStyle='rgba(255,255,248,.65)';x.fillText('已 阅',129,110);x.fillStyle='rgba(64,71,60,.46)';x.fillText('已 阅',128,112);x.font='16px monospace';x.fillStyle='rgba(72,77,65,.4)';x.fillText('READ BY HOST',128,156);return c;}
  mesh(fn,tri=false,n=24){const out=[];const vertex=(u,v)=>{const p=fn(u,v);const e=.0004;const du=fn(u+e,v),dv=fn(u,v+e);const a=du.map((q,i)=>q-p[i]),b=dv.map((q,i)=>q-p[i]);let no=[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];let l=Math.hypot(...no)||1;no=no.map(q=>-q/l);return [...p,...no,u,v];};const push=(a,b,c)=>out.push(...vertex(...a),...vertex(...b),...vertex(...c));for(let j=0;j<n;j++)for(let i=0;i<n;i++){if(tri&&i+j>=n)continue;const u=i/n,v=j/n,d=1/n;push([u,v],[u+d,v],[u,v+d]);if(!tri||i+j<n-1)push([u+d,v],[u+d,v+d],[u,v+d]);}return new Float32Array(out);}
  triangle(a,b,c,warp,n=22){return this.mesh((u,v)=>warp([a[0]+(b[0]-a[0])*u+(c[0]-a[0])*v,a[1]+(b[1]-a[1])*u+(c[1]-a[1])*v,a[2]+(b[2]-a[2])*u+(c[2]-a[2])*v]),true,n);}
  fullPass(target,background=false){const gl=this.gl,p=this.full;gl.bindFramebuffer(gl.FRAMEBUFFER,target);gl.useProgram(p.program);gl.bindBuffer(gl.ARRAY_BUFFER,this.quad);const loc=gl.getAttribLocation(p.program,'aPos');gl.enableVertexAttribArray(loc);gl.vertexAttribPointer(loc,2,gl.FLOAT,false,0,0);this.bind(p,'uScene',this.passes[background?1-this.front:this.front].tex,0);this.uniform(p,'uBackground',background?1:0);this.bind(p,'uBgTex',this.bgTex,1);this.uniform(p,'uUseBg',this.bg?1:0);if(this.bg)gl.uniform4f(gl.getUniformLocation(p.program,'uBgRect'),this.bg.x,this.bg.y,this.bg.w,this.bg.h);this.uniform(p,'uViewport',this.canvas.width,this.canvas.height);this.uniform(p,'uSpan',this.span);this.uniform(p,'uTarget',this.targetY);this.uniform(p,'uCardY',this.s.cardY);this.uniform(p,'uEnvY',this.s.envY);this.uniform(p,'uEnvOpacity',this.s.envOpacity);this.uniform(p,'uLight',this.view.light);gl.drawArrays(gl.TRIANGLES,0,6);}
  pass(mesh,opt={}){const gl=this.gl,old=this.front,next=1-old,p=this.main;gl.bindFramebuffer(gl.FRAMEBUFFER,this.passes[old].fb);gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,this.passes[next].tex);gl.copyTexSubImage2D(gl.TEXTURE_2D,0,0,0,0,0,this.canvas.width,this.canvas.height);gl.bindFramebuffer(gl.FRAMEBUFFER,this.passes[next].fb);gl.useProgram(p.program);gl.bindBuffer(gl.ARRAY_BUFFER,this.buffer);gl.bufferData(gl.ARRAY_BUFFER,mesh,gl.DYNAMIC_DRAW);[['aPos',3,0],['aNormal',3,12],['aUV',2,24]].forEach(([name,size,offset])=>{const loc=gl.getAttribLocation(p.program,name);gl.enableVertexAttribArray(loc);gl.vertexAttribPointer(loc,size,gl.FLOAT,false,32,offset);});
this.bind(p,'uScene',this.passes[old].tex,0);this.bind(p,'uGrain',this.grain,1);this.bind(p,'uArt',this.cardTexture,2);this.bind(p,'uReverse',this.reverse,3);this.bind(p,'uPrint',opt.stamp?this.stamp:this.print,4);
this.uniform(p,'uAngles',-.13+this.view.pitch,-.18+this.view.yaw+this.s.yaw,-.055+this.s.roll);this.uniform(p,'uViewport',this.canvas.width,this.canvas.height);this.uniform(p,'uSpan',this.span);this.uniform(p,'uTarget',this.targetY);
this.uniform(p,'uKind',opt.kind||0);this.uniform(p,'uDensity',opt.density??.3);this.uniform(p,'uBlur',(opt.blur??1.1)*this.dpr);this.uniform(p,'uOpacity',opt.opacity??this.s.envOpacity);this.uniform(p,'uTriangle',opt.tri?1:0);this.uniform(p,'uLight',this.view.light);this.uniform(p,'uPrinted',opt.print?1:0);this.uniform(p,'uSeen',this.s.print);
gl.drawArrays(gl.TRIANGLES,0,mesh.length/8);this.front=next;}
  render(s){if(this.lost)return;this.s=s;this.resize();const gl=this.gl;const height=this.canvas.clientHeight,fr=this.opts.frame,top=fr?fr.top*height:(innerWidth<=740?75:80),bottom=fr?fr.bottom*height:(innerWidth<=740?128:134);this.span=s.span/this.view.zoom*height/(height-top-bottom);this.targetY=s.target+(bottom-top)*this.span/height;gl.viewport(0,0,this.canvas.width,this.canvas.height);gl.disable(gl.DEPTH_TEST);gl.disable(gl.CULL_FACE);gl.disable(gl.BLEND);this.front=0;this.fullPass(this.passes[0].fb,true);
const key=s.printKey||'waiting';if(key!==this.printKey){gl.deleteTexture(this.print);this.print=this.texture(this.makePrint(key));this.printKey=key;}
const geoKey=[s.envX,s.envY,s.corner,s.press].map(v=>v.toFixed(3)).join(',');if(this.geoKey!==geoKey){this.geometry={};this.geoKey=geoKey;}const cached=(key,maker)=>this.geometry[key]||(this.geometry[key]=maker());const warp=p=>{let [x,y,z]=p;const bend=Math.max(0,(x-y-293)/Math.SQRT2),angle=s.corner*1.50;const shift=bend*(1-Math.cos(angle));x-=shift/Math.SQRT2;y+=shift/Math.SQRT2;z+=bend*Math.sin(angle);z-=s.press*2.1*Math.exp(-((x-78)**2+(y+108)**2)/2500);return[x+s.envX,y+s.envY,z];};
const sheet=(z,bow=0)=>cached('sheet'+z,()=>this.mesh((u,v)=>warp([-150+300*u,190-380*v,z+bow*Math.sin(Math.PI*u)*Math.sin(Math.PI*v)]),false,22));
if(s.envOpacity>.001){this.pass(sheet(0,1.2),{density:.30});}
const theta=(1-s.open)*Math.PI;
const flap=this.triangle([-150,190,14],[150,190,14],[0,385,14],p=>{const d=p[1]-190,t=d/195;const lag=(s.flex*10+.7)*Math.sin(Math.PI*t);const a=theta+s.flex*.11*t*t;return warp([p[0],190+d*Math.cos(a)-lag*Math.sin(a),14+d*Math.sin(a)+lag*Math.cos(a)]);},32);
if(s.open>.5&&s.envOpacity>.001)this.pass(flap,{tri:true,density:.39,blur:.65});
const card=this.mesh((u,v)=>{let x=(u-.5)*256,y=(.5-v)*320;const wave=s.cardFlex*Math.sin(v*Math.PI)*3.2;let z=7+wave;const angle=s.cardAngle*Math.PI/180;if(Math.abs(angle)>0){const nx=x*Math.cos(angle)+z*Math.sin(angle);z=-x*Math.sin(angle)+z*Math.cos(angle);x=nx;}const roll=s.cardRoll;const nx=x*Math.cos(roll)-y*Math.sin(roll);y=x*Math.sin(roll)+y*Math.cos(roll);return[nx+s.cardX,y+s.cardY,z+s.cardZ];},false,24);
this.pass(card,{kind:1,opacity:1});
if(s.envOpacity>.001){
this.pass(sheet(15,2.8),{density:.25,blur:1.1,print:true});
this.pass(cached('left',()=>this.triangle([-150,190,16],[-150,-190,16],[12,-11,19],warp)),{tri:true,density:.19,blur:.7});
this.pass(cached('right',()=>this.triangle([150,-190,17],[150,190,17],[-12,-11,19.5],warp)),{tri:true,density:.22,blur:.75});
this.pass(cached('bottom',()=>this.triangle([-150,-190,19],[150,-190,19],[0,-7,22],warp)),{tri:true,density:.23,blur:.75});
if(s.open<.5&&s.open>.01){const shade=this.triangle([-150,190,23],[150,190,23],[0,190-195*Math.cos(Math.PI*s.open),23],p=>warp([p[0]-12*s.open,p[1]-22*s.open,p[2]]));this.pass(shade,{kind:3,tri:true,opacity:Math.min(.14,s.open*.8)*s.envOpacity});}
if(s.open<=.5)this.pass(flap,{tri:true,density:.40,blur:1.0});
if(s.seen>.001){const stamp=this.mesh((u,v)=>warp([42+80*u,-74-80*v,25]),false,3);this.pass(stamp,{kind:4,stamp:true,opacity:s.seen});}
}
this.fullPass(null);this.frames++;this.lastState=s;}
  dispose(){
    if(this.disposed)return;this.disposed=true;this.lost=true;const gl=this.gl;
    [this.grain,this.cardTexture,this.reverse,this.bgTex,this.print,this.stamp,...this.passes.map(p=>p.tex)].forEach(t=>gl.deleteTexture(t));
    this.passes.forEach(p=>gl.deleteFramebuffer(p.fb));[this.buffer,this.quad].forEach(b=>gl.deleteBuffer(b));
    [this.main,this.full].forEach(p=>{(gl.getAttachedShaders(p.program)||[]).forEach(s=>{gl.detachShader(p.program,s);gl.deleteShader(s);});gl.deleteProgram(p.program);});
    this.geometry=null;
  }
  setBackground(source,rect){const gl=this.gl;if(!source){this.bg=null;return;}gl.bindTexture(gl.TEXTURE_2D,this.bgTex);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,source);this.bg=rect;}
}
const BASE={open:0,flex:0,cardY:0,cardX:0,cardZ:0,cardFlex:0,cardAngle:0,cardRoll:0,envX:0,envY:0,envOpacity:1,corner:0,press:0,seen:0,print:1,yaw:0,roll:0,span:278,target:15};
// Channels overlap; no single ease forces every material to start and stop together.
const ROUTES={
rejectA:{title:'A / 轻合留白',duration:4.8,resultAt:3.05,key:'A',headline:'这次没约上。',subline:'申请已结束。下一次，再一起热闹。',note:'<b>更温柔的收尾。</b><br>开盖与局卡错峰运动，合拢前留半拍，再轻轻贴合。',channels:{
open:[[0,0],[.18,0],[1.25,.64,'inout'],[2.3,.64],[3.75,.02,'soft'],[4.45,0,'out']],
flex:[[0,0],[.50,.30],[1.10,.68],[1.55,.06],[2.35,.03],[3.30,.48],[3.90,.10],[4.70,0]],
cardY:[[0,0],[.73,0],[1.62,49,'soft'],[2.08,49],[3.05,0,'inout']],cardFlex:[[.7,0],[1.25,.65],[1.75,.2],[2.45,.45],[3.2,0]],
yaw:[[0,0],[1.7,.022],[3.2,-.009],[4.6,0]],span:[[0,278],[1.25,321],[2.3,321],[4.5,278]],target:[[0,15],[1.25,65],[2.3,65],[4.5,15]],print:[[0,1],[.35,0],[3.35,0],[4.35,1]]},phases:[[0,'封签松开'],[.35,'先抬翻盖，再带起局卡'],[1.65,'停留半拍'],[2.1,'局卡先落回'],[3.05,'翻盖缓缓贴合'],[4.35,'这次期待，轻轻收好']]},
rejectB:{title:'B / 回函归还',duration:5.6,resultAt:3.2,key:'B',headline:'把期待，留给下一场。',subline:'本次未入局。你的局卡，先交还给你。',note:'<b>更明确的结束。</b><br>局卡回到手边，保留一截在信封里；不旋转、不庆祝。',channels:{
open:[[0,0],[.15,0],[1.35,1,'inout']],flex:[[0,0],[.6,.7],[1.5,.18],[2.25,0]],
cardY:[[0,0],[.8,0],[1.18,21,'in'],[3.20,232,'soft'],[4.60,220,'out']],cardFlex:[[.8,0],[1.65,1],[2.65,.4],[4.4,0]],
cardX:[[0,0],[2.4,0],[4.2,7]],cardRoll:[[0,0],[2.7,0],[4.45,-.025]],envY:[[0,0],[2.10,0],[4.60,-34,'inout']],yaw:[[0,0],[3.75,-.036]],roll:[[0,0],[4.2,.018]],span:[[0,278],[2.55,348]],target:[[0,15],[3.15,140]],print:[[0,1],[.4,0],[4.6,0],[5.5,1]]},phases:[[0,'轻启回信'],[.5,'翻盖舒展开'],[1.18,'局卡缓缓抽回'],[3.2,'回到手边，停在袋口'],[4.6,'这次结束，留给下一场']]},
rejectC:{title:'C / 折角已阅',duration:5.2,resultAt:3.4,key:'C',headline:'读过了，这次先不了。',subline:'局主已阅 · 本次未入局。下次再一起。',note:'<b>更安静的确认。</b><br>不把局卡推出来；纸角留下折痕，已阅像轻轻压进纸里。',channels:{
open:[[0,0],[.2,0],[1.1,.39,'inout'],[1.75,.39],[2.85,0,'soft']],flex:[[0,0],[.65,.48],[1.3,.05],[2.4,.4],[3.0,0]],
cardY:[[0,0],[1.1,9],[1.6,9],[2.4,0]],corner:[[0,0],[2.55,0],[3.50,.94,'inout'],[4.40,.78,'out']],press:[[0,0],[3.05,0],[3.60,1],[4.55,0]],seen:[[0,0],[3.35,0],[4.3,1,'soft']],roll:[[0,0],[3.6,-.018],[4.9,0]],print:[[0,1],[.4,0],[3.0,0],[4.5,1]]},phases:[[0,'轻轻揭开'],[1.1,'停一下，局主读过了'],[1.8,'原卡留在信封里'],[2.6,'轻折一角'],[3.4,'已阅，缓缓留在纸上'],[4.6,'看过，也认真回应']]},
submit:{title:'提交 / 等待审核',duration:4.5,resultAt:4.1,key:'waiting',headline:'等一句「来吧」。',subline:'已送达局主手里。有消息就告诉你。',note:'<b>同一张卡，两种触感。</b><br>袋外保留原始清晰；进入袋内的部分，逐层覆上薄纸。',channels:{open:[[0,1],[2.55,1],[3.95,0,'soft']],cardY:[[0,485],[.3,485],[2.6,0,'soft']],cardFlex:[[0,0],[1.5,.8],[2.7,0]],flex:[[0,0],[2.7,.0],[3.4,.6],[4.4,0]],span:[[0,525],[.5,525],[3.15,278]],target:[[0,167],[.7,167],[3.15,15]],print:[[0,0],[3.7,0],[4.5,1]]},phases:[[0,'对准袋口'],[.3,'局卡递入，袋内覆纸'],[2.6,'卡片已完全入袋'],[3,'翻盖弯曲、贴合'],[4.1,'已送达，等局主点头']]},
approve:{title:'通过 / 开封进局',duration:6.6,resultAt:3.4,key:'waiting',headline:'局主说：来。',subline:'进局成功。深夜救急火锅局，见。',note:'<b>先释放，再旋转。</b><br>局卡完全越过袋口，信封退场之后，才开始展示旋转。',channels:{open:[[0,0],[.15,0],[1.20,1,'inout']],flex:[[0,0],[.6,.6],[1.5,0]],cardY:[[0,0],[.95,0],[2.65,392,'soft'],[3.55,100]],cardFlex:[[0,0],[1.6,.6],[2.8,0]],envY:[[0,0],[2.5,0],[3.55,-520,'inout']],envOpacity:[[0,1],[2.7,1],[3.55,0]],span:[[0,278],[1.9,425],[3.6,278]],target:[[0,15],[2.3,115],[3.6,95]],cardAngle:[[0,0],[3.7,-7],[4.5,0,'soft']],print:[[0,1],[.3,0]]},phases:[[0,'封签松开'],[.3,'信封舒展开'],[1.2,'局卡向上释放'],[2.65,'卡片已完全越过袋口'],[3.7,'完全脱离后，开始旋转'],[6.6,'进局成功']]}
};
ROUTES.waiting={duration:0,resultAt:0,key:'waiting',channels:Object.fromEntries(Object.entries(ROUTES.submit.channels).map(([k,p])=>[k,[[0,p.at(-1)[1]]]])),phases:[[0,'等待确认']]};
// V25 queue receipt reuses the approved receive path. The released paper rests for reading.
ROUTES.queueReceive25={...ROUTES.approve,title:'接收候补回执',channels:{...ROUTES.approve.channels,cardAngle:[[0,0]]},phases:[[0,'收到纸回执'],[.3,'封面舒展开'],[1.2,'回执向上释放'],[2.65,'回执越过袋口'],[3.7,'停稳阅读排位'],[6.6,'候补记录已保存']]};
ROUTES.queueRest25={duration:0,resultAt:0,key:'waiting',channels:Object.fromEntries(Object.entries(ROUTES.queueReceive25.channels).map(([k,p])=>[k,[[0,p.at(-1)[1]]]])),phases:[[0,'查看当前候补状态']]};
const EASE={in:t=>t*t*t,out:t=>1-(1-t)**3,inout:t=>t*t*t*(t*(t*6-15)+10),soft:t=>{const a=t*t,b=(1-t)*(1-t);return a/(a+b);}};
function sample(name,t){const r=ROUTES[name],s={...BASE,printKey:t>=r.resultAt?r.key:'waiting'};for(const [key,points] of Object.entries(r.channels)){if(t<=points[0][0]){s[key]=points[0][1];continue;}const end=points.at(-1);if(t>=end[0]){s[key]=end[1];continue;}let i=1;while(t>points[i][0])i++;const a=points[i-1],b=points[i],f=EASE[b[2]||'inout']((t-a[0])/(b[0]-a[0]));s[key]=a[1]+(b[1]-a[1])*f;}
// Card bottom and mouth are in the same world coordinates, including envelope descent.
if(s.cardY-160<=190+s.envY+12)s.cardAngle=0;return s;}

// ---------------- JU 舞台驱动层：只负责 canvas 生命周期 / 时间推进 / 可见性 / 脏帧 / 背景采样；不改动 index 的任何几何、材质、时间线 ----------------
function makeJuReverse(event){event=event||{};const cities={NYC:'NEW YORK',BOS:'BOSTON',LA:'LOS ANGELES',SFO:'BAY AREA',SEA:'SEATTLE',CHI:'CHICAGO'};const c=document.createElement('canvas');c.width=512;c.height=640;const x=c.getContext('2d');
  // 05 卡背：157deg 渐变 #FFFFFF→#EAEDFB 40%→#DBE1F5 68%→#FDFDFF
  const dx=Math.sin(157*Math.PI/180),dy=-Math.cos(157*Math.PI/180),L=256*Math.abs(dx)+320*Math.abs(dy);
  const g=x.createLinearGradient(256-dx*L,320-dy*L,256+dx*L,320+dy*L);g.addColorStop(0,'#FFFFFF');g.addColorStop(.4,'#EAEDFB');g.addColorStop(.68,'#DBE1F5');g.addColorStop(1,'#FDFDFF');x.fillStyle=g;x.fillRect(0,0,512,640);
  x.fillStyle='rgba(120,132,200,.17)';for(let py=2.6;py<640;py+=21)for(let px=2.6;px<512;px+=21){x.beginPath();x.arc(px,py,2.6,0,Math.PI*2);x.fill();}
  x.strokeStyle='rgba(20,22,31,.09)';x.lineWidth=2.6;x.strokeRect(1.3,1.3,509.4,637.4);
  x.textAlign='center';x.textBaseline='alphabetic';x.font="400 120px 'Libre Caslon Text',Georgia,serif";
  const ju=x.measureText('JU').width,dot=x.measureText('.').width,cx=256-(ju+dot)/2;x.textAlign='left';x.fillStyle='#14161F';x.fillText('JU',cx,340);x.fillStyle='#5361DC';x.fillText('.',cx+ju,340);
  x.textAlign='center';try{x.letterSpacing='9px';}catch(e){}x.font="400 21px 'Space Mono',monospace";x.fillStyle='rgba(20,22,31,.42)';x.fillText('有 JU，就开局',256,388);
  try{x.letterSpacing='6px';}catch(e){}x.font="400 20px 'Space Mono',monospace";x.fillStyle='rgba(20,22,31,.26)';x.fillText('· '+(event.cityName||cities[event.city]||event.city||'NEW YORK')+' ·',256,610,460);
  x.fillStyle='rgba(16,18,30,.13)';x.beginPath();x.arc(256,0,29,0,Math.PI*2);x.fill();x.beginPath();x.arc(256,640,29,0,Math.PI*2);x.fill();return c;}

class JuEnvelopeStage{
  constructor(canvas,opts){
    this.canvas=canvas;canvas.__juStage=this;this.opts=opts||{};this.route=null;this.time=0;this.playing=false;this.finished=false;this.spinTime=0;this.dirty=true;this.visible=false;this.ext=null;this.ready=false;this.lost=false;this.lastPose=null;this.phaseIdx=-1;this.cb={};this.raf=0;this.idle=0;this.preroll=0;
    const img=new Image();const fonts=(document.fonts&&document.fonts.ready)||Promise.resolve();
    img.onload=()=>{fonts.then(()=>{if(this.dead)return;this.art=img;this.mark();});};
    img.onerror=()=>{this.lost=true;};img.src=this.opts.art||window.JU_CARD_DATA;
    this.onContextLost=e=>{e.preventDefault();this.lost=true;this.ready=false;if(this.renderer){this.renderer.lost=true;this.viewState={...this.renderer.view};}cancelAnimationFrame(this.raf);clearTimeout(this.idle);this.raf=this.idle=0;this.opts.onLost?.();};canvas.addEventListener('webglcontextlost',this.onContextLost);
    this.onContextRestored=()=>{if(this.dead)return;this.renderer=null;this.lost=false;this.ready=false;this.last=performance.now();this.opts.onRestored?.();this.mark();};canvas.addEventListener('webglcontextrestored',this.onContextRestored);
    this.reduced=matchMedia('(prefers-reduced-motion: reduce)');
    this.onReduced=()=>{if(this.reduced.matches&&this.route&&!this.finished){this.preroll=0;this.time=ROUTES[this.route].duration;this.mark();}};
    this.reduced.addEventListener('change',this.onReduced);
    this.ro=new ResizeObserver(()=>this.mark());this.ro.observe(canvas);
    this.io=new IntersectionObserver(es=>{es.forEach(x=>{this.visible=x.isIntersecting;if(this.visible){this.last=performance.now();this.mark();}});},{threshold:0});this.io.observe(canvas);
    this.onVis=()=>{this.last=performance.now();this.mark();};document.addEventListener('visibilitychange',this.onVis);
    this.onTap=()=>{if(this.finished&&this.route==='approve'){const a=this.lastPose.cardAngle||0;this.extend({cardAngle:Math.abs(a)<90?180:0},.65);}};canvas.addEventListener('click',this.onTap);canvas.style.pointerEvents='auto';
    this.tick=this.tick.bind(this);this.last=performance.now();this.mark();
  }
  destroy(){if(this.dead)return;this.dead=true;this.playing=false;this.canvas.removeEventListener('click',this.onTap);this.ro.disconnect();this.io.disconnect();document.removeEventListener('visibilitychange',this.onVis);this.reduced.removeEventListener('change',this.onReduced);this.canvas.removeEventListener('webglcontextlost',this.onContextLost);this.canvas.removeEventListener('webglcontextrestored',this.onContextRestored);cancelAnimationFrame(this.raf);clearTimeout(this.idle);this.raf=this.idle=0;if(this.renderer)this.renderer.dispose();if(this.canvas.__juStage===this)delete this.canvas.__juStage;}
  mark(){if(this.dead)return;this.dirty=true;if(!this.raf)this.raf=requestAnimationFrame(this.tick);}
  // 播放 index 路线（原样）；delay = 播放前静止停留（信封闭合姿态），不改变路线内部时间
  start(route,cb,delay){this.route=route;this.cb=cb||{};this.time=0;this.playing=true;this.finished=false;this.spinTime=0;this.ext=null;this.preroll=this.reduced.matches?0:delay||0;if(this.reduced.matches)this.time=ROUTES[route].duration;this.canvas.style.opacity='';this.last=performance.now();const r=ROUTES[route];this.phaseIdx=0;this.cb.onPhase&&this.cb.onPhase(0,r.phases[0][1],0);this.mark();}
  stop(){this.playing=false;this.preroll=0;this.ext=null;this.cb={};cancelAnimationFrame(this.raf);this.raf=0;clearTimeout(this.idle);this.idle=0;}
  // 只允许 append 在 index 序列之后：从当前姿态插值到 to（部分通道），dur 秒
  extend(to,dur,onDone){this.ext={from:Object.assign({},this.lastPose||sample(this.route,this.time)),to:to,t:0,dur:dur,onDone:onDone};this.mark();}
  phases(r){const t=this.time;let i=-1;for(let k=0;k<r.phases.length;k++)if(r.phases[k][0]<=t)i=k;if(i!==this.phaseIdx){this.phaseIdx=i;this.cb.onPhase&&this.cb.onPhase(i,r.phases[i]?r.phases[i][1]:'',t);}}
  // 以 anchor（页面里 350×380 的舞台占位）为构图基准：全屏画布上复现“anchor 大小画布 + frame .05/.05”的相机，纸影不会被画布边缘切断
  frame(){
    const fn=this.opts.anchor,a=fn&&fn();if(!a)return;const ar=a.getBoundingClientRect(),cr=this.canvas.getBoundingClientRect();if(!ar.height||!cr.height)return;
    const H=cr.height,header=a.previousElementSibling,hr=header&&header.getBoundingClientRect();
    const upper=Math.max(16,ar.top-cr.top,hr?hr.bottom-cr.top+12:0);
    // V21 05 退出舞台的下界独立保存；不再借隐藏成员按钮偶然决定构图。
    let lower=Math.min(H-16,ar.bottom-cr.top-(this.opts.frameBottomInset||0)*cr.width/(this.canvas.clientWidth||cr.width));
    for(const el of this.canvas.parentElement.querySelectorAll('[role="button"],button')){
      let visible=true;for(let p=el;p&&p!==this.canvas.parentElement;p=p.parentElement){const cs=getComputedStyle(p);if(cs.display==='none'||cs.visibility==='hidden'||Number(cs.opacity)<.01){visible=false;break}}
      if(!visible)continue;
      const r=el.getBoundingClientRect();
      if(r.width>0&&r.height>0&&r.top>=cr.top+H*.55&&r.bottom<=cr.bottom+1)lower=Math.min(lower,r.top-cr.top-16);
    }
    const hs=Math.max(80,Math.min(ar.height,lower-upper,(cr.width-40)*1.08));
    const cy=upper+(lower-upper)/2,T=H-.45*hs-cy,B=(H-.9*hs)-T;
    this.renderer.opts.frame={top:T/H,bottom:B/H};this.bounds={top:upper,bottom:lower,height:hs,center:cy};
  }
  background(){
    if(this.bgOff)return;let p=this.canvas.parentElement,src=null;
    while(p&&!src){src=p.querySelector('cotton-bg canvas');p=p.parentElement;}
    if(!src||!src.width){this.renderer.setBackground(null);return;}
    const a=this.canvas.getBoundingClientRect(),b=src.getBoundingClientRect();if(!b.width||!b.height)return;
    this.renderer.setBackground(src,{x:(a.left-b.left)/b.width,y:(a.top-b.top)/b.height,w:a.width/b.width,h:a.height/b.height});
  }
  pose(){return this.lastPose;}
  // 把卡片四角投影到 canvas CSS 像素（与 vertex shader 同一套变换），供 DOM 空框定位
  projectCard(s){
    s=s||this.lastPose;const R=this.renderer;if(!s||!R||!R.span)return null;
    const ang=[-.13+R.view.pitch,-.18+R.view.yaw+s.yaw,-.055+s.roll];
    const rot=p=>{let[x,y,z]=p,c=Math.cos(ang[0]),sn=Math.sin(ang[0]);[y,z]=[c*y-sn*z,sn*y+c*z];c=Math.cos(ang[1]);sn=Math.sin(ang[1]);[x,z]=[c*x+sn*z,-sn*x+c*z];c=Math.cos(ang[2]);sn=Math.sin(ang[2]);[x,y]=[c*x-sn*y,sn*x+c*y];return[x,y,z];};
    const W=this.canvas.clientWidth,H=this.canvas.clientHeight,asp=W/H;let xs=[],ys=[];
    for(const[u,v]of[[0,0],[1,0],[0,1],[1,1]]){let x=(u-.5)*256,y=(.5-v)*320,z=7;const a=s.cardAngle*Math.PI/180;if(Math.abs(a)>0){const nx=x*Math.cos(a)+z*Math.sin(a);z=-x*Math.sin(a)+z*Math.cos(a);x=nx;}const r=s.cardRoll,nx=x*Math.cos(r)-y*Math.sin(r);y=x*Math.sin(r)+y*Math.cos(r);x=nx;
      const p=rot([x+s.cardX,y+s.cardY,z+s.cardZ]),f=1500/(1500-p[2]),nx2=p[0]*f/(R.span*asp),ny=(p[1]-R.targetY)*f/R.span;xs.push((nx2*.5+.5)*W);ys.push((1-(ny*.5+.5))*H);}
    const l=Math.min(...xs),t=Math.min(...ys);return{left:l,top:t,width:Math.max(...xs)-l,height:Math.max(...ys)-t};
  }
  tick(now){
    this.raf=0;if(this.dead)return;const dt=Math.max(0,Math.min(.06,(now-this.last)/1000));this.last=now;
    const rect=this.canvas.getBoundingClientRect(),live=this.visible&&!document.hidden&&rect.width>0&&rect.height>0;
    if(this.lost)return;
    if(!this.ready){
      // Hidden routes hold state without allocating contexts, textures or passes.
      if(!live||!this.art)return;
      try{this.renderer=new PaperStudio(this.canvas,this.art,{frame:this.opts.frame||{top:.05,bottom:.05},event:this.opts.event,reverse:this.opts.reverse===null?null:makeJuReverse(this.opts.event)});if(this.viewState)this.renderer.view={...this.viewState};this.ready=true;this.dirty=true;this.last=now;this.opts.onReady?.();}
      catch(e){console.error(e);this.lost=true;return;}
    }
    let s,endCallback=null;
    if(this.route){
      const r=ROUTES[this.route];
      if(this.playing&&live){
        if(this.preroll>0){this.preroll=Math.max(0,this.preroll-dt);}
        else if(!this.finished){this.time=Math.min(r.duration,this.time+dt);this.phases(r);if(this.time>=r.duration){this.finished=true;this.playing=false;endCallback=this.cb.onEnd;}}
        else if(this.route==='approve')this.spinTime+=dt;
        this.dirty=true;
      }
      if(this.ext&&live&&this.ext.t<this.ext.dur){this.ext.t=Math.min(this.ext.dur,this.ext.t+dt);this.dirty=true;if(this.ext.t>=this.ext.dur){const d=this.ext.onDone;this.ext.onDone=null;d&&d();}}
      s=sample(this.route,this.time);
      if(this.route==='approve'&&this.time>=3.7&&!this.ext&&!this.reduced.matches){if(this.finished&&live)this.spinTime+=dt;const t=Math.max(0,this.time-3.7+this.spinTime),angle=30*(t<1.25?t*t/(2*1.25):t-.625);s.cardAngle=angle;this.dirty=true;}
      
      if(this.ext){const q=EASE.inout(Math.min(1,this.ext.t/this.ext.dur));for(const k of Object.keys(this.ext.to))s[k]=this.ext.from[k]+(this.ext.to[k]-this.ext.from[k])*q;}
      if(s.cardY-160<=190+s.envY+12)s.cardAngle=0;
    }else s=Object.assign({},BASE,{printKey:'waiting'});
    if(this.dirty&&live){this.frame();this.background();this.renderer.render(s);this.lastPose=s;this.dirty=false;this.cb.onFrame&&this.cb.onFrame(s,this);}
    if(endCallback&&!this.dead)endCallback();
    if(this.dead)return;
    const active=live&&((this.playing)||(this.ext&&this.ext.t<this.ext.dur)||(this.route==='approve'&&this.finished&&!this.ext&&!this.reduced.matches));
    if(active)this.raf=requestAnimationFrame(this.tick);
    else if(live&&!this.reduced.matches){clearTimeout(this.idle);this.idle=setTimeout(()=>{this.idle=0;this.mark();},900);}  // 静止时每 0.9s 重绘一帧，跟随缓慢漂移的背景
  }
}
window.JuEnvelope={PaperStudio:PaperStudio,BASE:BASE,ROUTES:ROUTES,EASE:EASE,sample:sample,Stage:JuEnvelopeStage,makeJuReverse:makeJuReverse};
})();

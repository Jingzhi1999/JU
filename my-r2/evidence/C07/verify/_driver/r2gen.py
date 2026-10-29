import json
def samp(ms=900):
    return ("""(function(){var root=sr,t0=null;window.__ov={frames:[],over:[]};var onDown=function(){if(t0==null)t0=performance.now();};
root.addEventListener('pointerdown',onDown,true);document.addEventListener('keydown',onDown,true);
var groups=[['.c07-tray .c07-lead .t','.c07-tray .c07-act .t','.c07-tray .c07-act .c07-slip .who b','.c07-tray .c07-surf .c07-stitle','.c07-tray .c07-surf .c07-id .t','.c07-tray .c07-form .t','.c07-tray .c07-none'],['.c07-page .c07-title','.c07-mpage .c07-stitle']];
function eff(e){var o=1,n=e;while(n&&n.nodeType===1){var cs=getComputedStyle(n);if(cs.display==='none'||cs.visibility==='hidden')return 0;o*=parseFloat(cs.opacity);n=n.parentElement;}return o;}
var ph=root.querySelector('.ju-phone').getBoundingClientRect();var start=performance.now();
function step(){var now=performance.now();var rel=t0==null?null:Math.round(now-t0);var fr={t:rel,els:[]};
groups.forEach(function(g,gi){var list=[];g.forEach(function(sel){root.querySelectorAll(sel).forEach(function(e){var r=e.getBoundingClientRect();if(r.width<2||r.height<2)return;if(r.bottom<ph.top||r.top>ph.bottom)return;var o=eff(e);if(o<0.06)return;list.push({sel:sel.split(' ').slice(-2).join(' '),txt:e.textContent.trim().slice(0,10),o:Math.round(o*100)/100,r:[Math.round(r.left-ph.left),Math.round(r.top-ph.top),Math.round(r.width),Math.round(r.height)]});});});
for(var i=0;i<list.length;i++)for(var j=i+1;j<list.length;j++){var a=list[i].r,b=list[j].r;var ix=Math.max(0,Math.min(a[0]+a[2],b[0]+b[2])-Math.max(a[0],b[0])),iy=Math.max(0,Math.min(a[1]+a[3],b[1]+b[3])-Math.max(a[1],b[1]));var ar=Math.min(a[2]*a[3],b[2]*b[3]);if(ix*iy>0.2*ar)window.__ov.over.push({t:rel,g:gi,a:list[i].sel+'「'+list[i].txt+'」o'+list[i].o+'@'+a[1],b:list[j].sel+'「'+list[j].txt+'」o'+list[j].o+'@'+b[1]});}
fr.els=fr.els.concat(list.map(function(x){return x.sel.replace('.c07-','')+'「'+x.txt.slice(0,6)+'」'+x.o+'@'+x.r[1]}));});
window.__ov.frames.push(fr);if(now-start<%d)requestAnimationFrame(step);else{root.removeEventListener('pointerdown',onDown,true);document.removeEventListener('keydown',onDown,true);window.__ov.done=true;}}
requestAnimationFrame(step);})();""" % ms)
OVR = """var o=window.__ov||{frames:[],over:[]};var seen={},ov=[];o.over.forEach(function(x){var k=x.a+'|'+x.b;if(!seen[k]){seen[k]={a:x.a,b:x.b,t0:x.t,t1:x.t,n:0};ov.push(seen[k]);}seen[k].t1=x.t;seen[k].n++;});
var tl=o.frames.filter(function(f,i){return f.t!=null&&f.t<700&&(i%2===0)}).map(function(f){return f.t+':'+f.els.join(' ')});
return JSON.stringify({frames:o.frames.length,overlaps:ov.slice(0,12),timeline:tl.slice(0,40)});"""
CARD = """var ph=sr.querySelector('.ju-phone').getBoundingClientRect();var out=[];sr.querySelectorAll('.c07-ocard, canvas[data-card], .c07-pcard, .c07-t08 canvas, .c07-t08ph').forEach(function(e){var r=e.getBoundingClientRect();if(r.width<2)return;var cs=getComputedStyle(e);out.push((e.className||e.tagName)+':'+Math.round(r.width)+'x'+Math.round(r.height)+'@'+Math.round(r.left-ph.left)+','+Math.round(r.top-ph.top)+(cs.opacity<0.05?' (hidden)':''));});return out.join(' | ')||'no card'"""
NAV = "return inst.state.nav.stack.map(function(x){return x.s+(x.p&&x.p.eventId?':'+x.p.eventId:'')}).join('>')+' | '+((sr.querySelector('.c07-surf.is-top .c07-stitle')||{}).textContent||'')"
def rec(name, do, span=900, mx=18, then=None, ms=None):
    a=[{"eval":samp(ms or span)}, {"rec":name,"do":do,"span":span,"max":mx}]
    if then: a[1]["then"]=then
    a.append({"eval":OVR})
    return a
json.dump({"samp":samp(),"OVR":OVR,"CARD":CARD,"NAV":NAV}, open('r2snip.json','w'))
# R2-A: detail enter/back (dimsum) at 1x & 0.5x; card size; read-confirm M1
A=[{"shot":1,"name":"home"}]
A+= rec("enter-detail-1x",{"click":"[data-rid=dimsum]"},span=900,mx=18)
A+=[{"eval":CARD,"name":"detail"},{"eval":NAV}]
A+= rec("back-detail-1x",{"click":".c07-surf.is-top [data-act=back]"},span=900,mx=18)
A+=[{"eval":NAV,"name":"home-after-back"},{"panel":"0.5×","after":200}]
A+= rec("enter-detail-05x",{"click":"[data-rid=dimsum]"},span=1500,mx=24)
A+= rec("back-detail-05x",{"click":".c07-surf.is-top [data-act=back]"},span=1500,mx=24)
A+=[{"panel":"1×","after":200}]
A+= rec("rise-read-1x",{"click":".c07-lead [data-act=cta]"},span=900,mx=16)
A+=[{"wheel":"[data-scroller=read]","dy":4000,"steps":8,"every":50,"after":500,"name":"read-end"}]
A+= rec("confirm-1x",{"click":"[data-surface=read] .c07-sfoot .c07-cta"},span=3000,mx=24,ms=3000)
A+=[{"eval":NAV,"name":"after-confirm-3s"},{"wait":2000,"name":"after-confirm-5s"},{"eval":NAV}]
A+= rec("view-ticket-1x",{"click":"[data-surface=read] .c07-sfoot .c07-cta"},span=1500,mx=20)
A+=[{"eval":NAV},{"wait":3000,"name":"printed"}]
A+= rec("ticket-back-1x",{"click":".c07-surf.is-top [data-act=back]"},span=1300,mx=18)
A+=[{"eval":NAV,"name":"home-after-ticket"}]
json.dump(A,open('a-r2A.json','w'),ensure_ascii=False)
# R2-A2: same at 0.5x for M1 (reset first)
A2=[{"panel":"0.5×","after":200}]
A2+= rec("rise-read-05x",{"click":".c07-lead [data-act=cta]"},span=1500,mx=20)
A2+=[{"wheel":"[data-scroller=read]","dy":4000,"steps":8,"every":50,"after":800}]
A2+= rec("confirm-05x",{"click":"[data-surface=read] .c07-sfoot .c07-cta"},span=3500,mx=24,ms=3500)
A2+= rec("view-ticket-05x",{"click":"[data-surface=read] .c07-sfoot .c07-cta"},span=2200,mx=24)
A2+=[{"wait":5000},{"panel":"1×","after":200}]
A2+= rec("ticket-back-05x-at1x",{"click":".c07-surf.is-top [data-act=back]"},span=1300,mx=18)
json.dump(A2,open('a-r2A2.json','w'),ensure_ascii=False)

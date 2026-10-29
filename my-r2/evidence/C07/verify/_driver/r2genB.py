import json
S=json.load(open('r2snip.json')); samp=S['samp']; OVR=S['OVR']; CARD=S['CARD']; NAV=S['NAV']
def rec(name, do, span=900, mx=18, then=None):
    a=[{"eval":samp.replace('<900','<%d'%span)}, {"rec":name,"do":do,"span":span,"max":mx}]
    if then: a[1]["then"]=then
    a.append({"eval":OVR}); return a
ST="var s=sr.querySelector('[data-scroller=home]'); var t=sr.querySelector('.c07-title'); return [inst.state.role, inst.state.section, 'top='+Math.round(s.scrollTop), 'fs='+getComputedStyle(t).fontSize].join(' | ')"
COL="var out=[];sr.querySelectorAll('[data-surface=home] .c07-row .st').forEach(function(e){var c=getComputedStyle(e).color;out.push(e.textContent.trim().slice(0,8)+':'+c)});return out.slice(0,9).join(' ; ')"
SCOPE="var t=sr.querySelector('.ju-phone').innerText; var m=t.match(/本轮[^\\n]{0,8}|不在本次范围|不可点|未开放/g)||[]; return m.length+' '+JSON.stringify(m.slice(0,6))"
B=[{"shot":1,"name":"home"},{"eval":COL},{"eval":SCOPE}]
B+=rec("role-hosted-1x",{"click":"[data-role-tab=hosted]"},span=700,mx=14)
B+=[{"eval":SCOPE,"name":"hosted"}]
B+=rec("role-joined-1x",{"click":"[data-role-tab=joined]"},span=700,mx=14)
B+=[{"panel":"0.5×","after":200}]
B+=rec("role-hosted-05x",{"click":"[data-role-tab=hosted]"},span=1100,mx=18)
B+=rec("role-joined-05x",{"click":"[data-role-tab=joined]"},span=1100,mx=18)
B+=[{"panel":"1×","after":200},
 {"wheel":"[data-scroller=home]","dy":180,"steps":3,"every":40,"after":600},{"eval":ST,"name":"m20-current-180"},
 {"click":"[data-section-tab=history]","after":900},{"eval":ST,"name":"m20-history"},{"eval":SCOPE},
 {"click":"[data-section-tab=current]","after":900},{"eval":ST,"name":"m20-current-back"},
 {"click":"[data-role-tab=hosted]","after":800},{"click":"[data-section-tab=drafts]","after":800},{"eval":SCOPE,"name":"hosted-drafts"},
 {"click":"[data-section-tab=history]","after":800},{"eval":SCOPE,"name":"hosted-history"},
 {"click":"[data-role-tab=joined]","after":800},{"eval":ST,"name":"joined-after-role"},
 {"panelIn":["演示数据","历史较多"],"after":900},{"pause":True},
 {"click":"[data-section-tab=history]","after":900,"name":"M6-history-many"},
 {"eval":"return [].slice.call(sr.querySelectorAll('[data-surface=home] .c07-row')).map(function(r){return r.getAttribute('data-rid')+':'+((r.querySelector('.st')||{}).textContent||'').trim()}).join(', ')"},
 {"wheel":"[data-scroller=home]","dy":600,"steps":4,"after":500,"name":"M6-history-many-scrolled"},
 {"panelIn":["演示数据","完全空"],"after":900},{"pause":True},{"eval":SCOPE,"name":"empty-joined"},
 {"click":"[data-role-tab=hosted]","after":800},{"eval":SCOPE,"name":"empty-hosted"},
 {"panelIn":["演示数据","只有草稿"],"after":900},{"pause":True},{"click":"[data-role-tab=hosted]","after":800},{"click":"[data-section-tab=drafts]","after":800},
 {"click":"[data-surface=home] .c07-draft","after":1200,"name":"draft-summary"},{"eval":SCOPE},{"eval":CARD}
]
json.dump(B,open('a-r2B.json','w'),ensure_ascii=False)

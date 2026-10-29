import json
S=json.load(open('r2snip.json')); samp=S['samp']; OVR=S['OVR']; CARD=S['CARD']; NAV=S['NAV']
def rec(name, do, span=900, mx=18, then=None):
    a=[{"eval":samp.replace('<900','<%d'%span)}, {"rec":name,"do":do,"span":span,"max":mx}]
    if then: a[1]["then"]=then
    a.append({"eval":OVR}); return a
FOC="var ae=sr.activeElement; var home=sr.querySelector('[data-surface=home]'); return 'focus='+(ae?(ae.tagName+(ae.getAttribute('data-act')?'[act='+ae.getAttribute('data-act')+']':'')+(ae.getAttribute('data-rid')?'[rid='+ae.getAttribute('data-rid')+']':'')+' '+(ae.getAttribute('aria-label')||ae.textContent||'').trim().slice(0,16)):'none')+' | homeInert='+(home&&home.hasAttribute('inert'))"
END="var t=function(s){var x=sr.querySelector(s);return x?x.textContent.trim().replace(/\\s+/g,' ').slice(0,200):'-'}; var ash=sr.querySelector('.c07-ash'); var st=sr.querySelector('.c07-surf.is-top [data-print-stage], .c07-act [data-print-stage]'); return ['top='+t('.c07-surf.is-top .c07-ssc, .c07-act'), 'ash='+(ash?Math.round(ash.getBoundingClientRect().width)+'x'+Math.round(ash.getBoundingClientRect().height):'none'), 'stage='+(st&&st.getAttribute('data-state'))].join(' | ')"
G="[data-surface=ticket] [data-tear] [role=button]"
C=[{"click":"[data-role-tab=hosted]","after":800,"name":"hosted"}]
C+=rec("enter-review-1x",{"click":".c07-lead [data-act=cta]"},span=900,mx=14)
C+=rec("approve-1x",{"click":".c07-act [data-act=approve]"},span=1300,mx=18)
C+=rec("reject-1x",{"click":".c07-act [data-act=reject]"},span=1300,mx=18)
C+=[{"wheel":"[data-scroller=manage]","dy":-800,"steps":4,"after":400}]
C+=rec("card-open-1x",{"click":"[data-act=card]"},span=1000,mx=12)
C+=[{"eval":CARD,"name":"card-sheet"}]
C+=[{"click":".c07-over [data-act=close]","after":800}]
C+=rec("manage-back-1x",{"click":".c07-mhead [data-act=back]"},span=1000,mx=14)
C+=[{"click":"[data-rid=cards]","after":1300,"name":"cards-manage"},
 {"click":".c07-act [data-act=cancel]","after":900,"name":"cancel-sheet"}]
C+=rec("cancel-burn-1x",{"click":".c07-over [data-act=ok]"},span=2200,mx=22)
C+=[{"eval":CARD,"name":"cancel-burning"},{"panel":"暂停","after":60,"name":"burn-paused-0"},{"wait":900,"name":"burn-paused-900"},
 {"scrub":[0,100],"steps":4,"every":250,"shots":True},
 {"panel":"释放","after":200},{"wait":6000,"name":"cancel-end-after-release"},{"eval":END},
 {"scrub":[0,100],"steps":4,"every":300,"shots":True},{"panel":"释放","after":200},{"wait":6500,"name":"cancel-end-after-replay"},{"eval":END},
 {"click":".c07-act [data-act=back]","after":1300},
 {"click":"[data-role-tab=joined]","after":800},
 {"click":"[data-rid=run3k]","after":1200},{"eval":FOC,"name":"m17-ticket"},
 {"tabTo":G,"max":30},{"eval":FOC},
 {"click":".c07-surf.is-top [data-act=back]","after":1300},{"eval":FOC,"name":"m17-back"},
 {"click":"[data-rid=theater]","after":1300},
 {"click":"[data-surface=ticket] .c07-weak","after":800},
 {"rec":"exit-burn-1x","do":{"click":".c07-over [data-act=ok]"},"span":6800,"max":24},
 {"eval":END,"name":"exit-end-first"},
 {"scrub":[0,100],"steps":4,"every":300,"shots":True},{"panel":"释放","after":200},{"wait":7000,"name":"exit-end-after-replay"},{"eval":END}
]
json.dump(C,open('a-r2C.json','w'),ensure_ascii=False)
# R2-D: tray rise pause/scrub at 0.5x
SS="var tr=sr.querySelector('.c07-tray'); var b=tr.getBoundingClientRect(); var ph=sr.querySelector('.ju-phone').getBoundingClientRect(); var r=inst.state.review; return 'trayTop='+Math.round(b.top-ph.top)+' paused='+r.paused+' scrub='+r.scrub+' nav='+inst.state.nav.phase+' cls='+(sr.querySelector('.app').className.match(/c07-(rising|falling|mswap|up)|paused|scrub/g)||[]).join(',')"
D=[{"panel":"0.5×","after":200},
 {"click":"[data-rid=coffee]","after":120},{"panel":"暂停","after":40,"name":"rise-paused-0"},{"eval":SS},
 {"wait":700,"name":"rise-paused-700"},{"eval":SS},
 {"scrub":[0,100],"steps":5,"every":250,"shots":True},{"eval":SS},
 {"panel":"释放","after":1500,"name":"rise-released"},{"eval":SS},
 {"scrub":[0,100],"steps":5,"every":300,"shots":True},{"eval":SS},
 {"panel":"释放","after":1600,"name":"after-replay-release"},{"eval":SS},
 {"panel":"1×","after":200},
 {"click":".c07-surf.is-top [data-act=back]","after":120},{"panel":"暂停","after":40,"name":"fall-paused-0"},{"eval":SS},
 {"wait":600,"name":"fall-paused-600"},{"eval":SS},
 {"panel":"暂停","after":1200,"name":"fall-resumed"},{"eval":SS}
]
json.dump(D,open('a-r2D.json','w'),ensure_ascii=False)

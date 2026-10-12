# C08 final-verify capture flows (independent reviewer). Run from /home/user/JU.
set -e
cd /home/user/JU
export JU_STANDALONE=/home/user/JU/.build/final-C08.html
E=evidence/C08/final-verify
cap(){ node tools/capture.cjs C08 "$E/$1" "$2" --cols ${3:-6} | tail -1 | sed "s#^#$1: #"; }
RM='{"eval":"inst.toggleRM()","after":150}'
STUB='{"eval":"var s=root.querySelector(\".c08-pane [data-act=tear]\"); if(s) s.scrollIntoView({block:\"nearest\"});","after":250}'
# ---------- 减少动态 ON ----------
cap rm-draft-undo '['"$RM"',{"jump":"h-drafts","after":600},{"click":".c08-blk[data-rid=\"draft-reading\"] .c08-del","after":60},{"wait":560,"shot":true},{"shots":7,"every":900},{"click":".c08-undo [data-act=undo]","after":60},{"shots":2,"every":400},{"click":".c08-blk[data-rid=\"draft-reading\"] .c08-del","after":60},{"shots":4,"every":2900}]'
cap rm-toasts '['"$RM"',{"jump":"j-d-contact","after":700},{"click":".c08-pane [data-act=copy]","after":60},{"shots":6,"every":400},{"jump":"h-m-reschedule","after":700},{"eval":"inst.setState(function(s){return {resched:Object.assign({},s.resched,{time:\"20:30\",touched:true})};})","after":150,"shot":true},{"click":".c08-drawer [data-act=propose]","after":60},{"shots":6,"every":400}]' 7
cap rm-print-tear '['"$RM"',{"jump":"j-home","after":600},{"click":".c08-blk[data-rid=\"run3k\"] .c08-bk-main","after":60},{"shots":2,"every":150},'"$STUB"',{"shot":true},{"drag":{"from":".c08-pane [data-act=tear]","at":[115,0],"to":[150,20],"steps":6,"every":50,"shots":true},"after":80},{"shots":3,"every":250}]' 7
cap rm-resched-accept '['"$RM"',{"jump":"j-d-reschedule","after":900},'"$STUB"',{"shot":true},{"drag":{"from":".c08-pane [data-act=tear]","at":[100,0],"to":[150,20],"steps":6,"every":50},"after":80},{"shots":7,"every":400}]'
cap rm-cancel '['"$RM"',{"jump":"h-m-cancel","after":700},{"click":".c08-drawer [data-act=cancel]","after":60},{"shots":4,"every":200},{"eval":"var b=root.querySelector(\".c08-pane .c08-pbody\"); if(b) b.scrollTop=0;","after":150,"shot":true}]'
cap rm-detail-back '['"$RM"',{"jump":"j-home","after":600},{"click":".c08-blk[data-rid=\"brunch\"] .c08-bk-main","after":60},{"shots":2,"every":200},{"click":".c08-pane [data-act=back]","after":60},{"shots":5,"every":450}]'
# ---------- 减少动态 OFF ----------
cap card-detail-back '[{"jump":"j-home","after":1200},{"click":".c08-blk[data-rid=\"brunch\"] .c08-bk-main","after":40},{"shots":12,"every":90},{"wait":700},{"click":".c08-pane [data-act=back]","after":30},{"shots":12,"every":90}]' 7
cap card-detail-back-half '[{"jump":"j-home","after":1200},{"speed":0.5},{"click":".c08-blk[data-rid=\"livehouse\"] .c08-bk-main","after":40},{"shots":12,"every":140},{"wait":900},{"click":".c08-pane [data-act=back]","after":30},{"shots":12,"every":140}]' 7
cap print '[{"jump":"j-home","after":1200},{"click":".c08-blk[data-rid=\"run3k\"] .c08-bk-main","after":40},{"shots":30,"every":110}]' 7
cap tear '[{"jump":"j-d-tear","after":3500},'"$STUB"',{"shot":true},{"drag":{"from":".c08-pane [data-act=tear]","at":[115,0],"to":[150,20],"steps":7,"every":60,"shots":true},"after":20},{"shots":26,"every":110}]' 7
cap cancel-half '[{"jump":"h-m-cancel","after":1800},{"speed":0.5},{"click":".c08-drawer [data-act=cancel]","after":80},{"shots":30,"every":150},{"shots":8,"every":700}]' 7
cap drafts-undo '[{"jump":"h-drafts","after":1500},{"click":".c08-blk[data-rid=\"draft-reading\"] .c08-del","after":40},{"shots":7,"every":90},{"wait":600,"shot":true},{"click":".c08-undo [data-act=undo]","after":40},{"shots":9,"every":90}]' 7

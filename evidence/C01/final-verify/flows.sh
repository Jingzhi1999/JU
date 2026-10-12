# C01 final-verify capture flows (independent reviewer). Run from /home/user/JU.
set -e
cd /home/user/JU
export JU_STANDALONE=/home/user/JU/.build/final-C01.html
E=evidence/C01/final-verify
cap(){ node tools/capture.cjs C01 "$E/$1" "$2" --cols ${3:-6} | tail -1 | sed "s#^#$1: #"; }
STUB='{"eval":"var s=root.querySelector(\".c01-over [data-tk=main] .c01-side.stub\"); if(s) s.scrollIntoView({block:\"nearest\"});","after":200}'
FSTUB='{"eval":"var s=root.querySelector(\".c01-over [data-tk=fresh] .c01-side.stub\"); if(s) s.scrollIntoView({block:\"nearest\"});","after":200}'
# ---------- 减少动态 ON ----------
cap rm-undo '[{"eval":"inst.toggleRM()","after":150},{"jump":"h-drafts","after":600},{"click":".c01-feed [data-act=delete]","after":60},{"shots":8,"every":850},{"click":"[data-act=undo]","after":60},{"shots":2,"every":300},{"click":".c01-feed [data-act=delete]","after":60},{"shots":4,"every":2900}]'
cap rm-toasts '[{"eval":"inst.toggleRM()","after":150},{"jump":"j-d-contact","after":600},{"click":".c01-over [data-act=copy]","after":60},{"shots":6,"every":400},{"click":".c01-over [data-act=contacted]","after":60},{"shots":6,"every":400},{"jump":"h-m-end","after":600},{"click":".c01-slip [data-act=end]","after":60},{"shots":6,"every":400}]' 7
cap rm-print-tear '[{"eval":"inst.toggleRM()","after":150},{"jump":"j-home","after":600},{"click":".c01-feed [data-rid=\"r-run3k\"]","after":60},{"shots":2,"every":150},'"$STUB"',{"shot":true},{"drag":{"from":".c01-over [data-tk=main] .c01-side.stub","at":[123,93],"to":[-140,120],"steps":6,"every":50,"shots":true},"after":80},{"shots":3,"every":200}]'
cap rm-resched '[{"eval":"inst.toggleRM()","after":150},{"jump":"j-d-reschedule","after":600},'"$FSTUB"',{"shot":true},{"drag":{"from":".c01-over [data-tk=fresh] .c01-side.stub","at":[123,93],"to":[-140,120],"steps":6,"every":50},"after":80},{"shots":7,"every":400}]'
cap rm-cancel '[{"eval":"inst.toggleRM()","after":150},{"jump":"h-m-cancel","after":600},{"click":".c01-slip [data-act=cancel]","after":60},{"shots":3,"every":200},{"click":".c01-over [data-act=back]","after":60},{"shots":3,"every":200}]'
# ---------- 减少动态 OFF ----------
cap card-detail-back '[{"jump":"j-home","after":900},{"click":".c01-feed [data-rid=\"r-brunch\"]","after":40},{"shots":14,"every":100},{"wait":800},{"click":".c01-over [data-act=back]","after":30},{"shots":12,"every":100}]' 7
cap print '[{"jump":"j-home","after":900},{"click":".c01-feed [data-rid=\"r-run3k\"]","after":40},{"shots":34,"every":110}]' 7
cap tear '[{"jump":"j-d-tear","after":1500},'"$STUB"',{"shot":true},{"drag":{"from":".c01-over [data-tk=main] .c01-side.stub","at":[123,93],"to":[-140,120],"steps":6,"every":50,"shots":true},"after":20},{"shots":26,"every":115}]' 7
cap cancel-half '[{"jump":"h-m-cancel","after":1500},{"speed":0.5},{"click":".c01-slip [data-act=cancel]","after":100},{"shots":20,"every":160},{"shots":8,"every":700},{"speed":1},{"click":".c01-over [data-act=back]","after":60},{"shots":8,"every":200}]' 7
cap drafts '[{"jump":"h-drafts-many","after":1500},{"click":".c01-feed [data-act=delete]","after":40},{"shots":7,"every":100},{"wait":600,"shot":true},{"click":"[data-act=undo]","after":40},{"shots":9,"every":100}]' 7

# C07 final-verify capture flows (independent reviewer). Run from /home/user/JU.
set -e
cd /home/user/JU
export JU_STANDALONE=/home/user/JU/.build/final-C07.html
E=evidence/C07/final-verify
cap(){ node tools/capture.cjs C07 "$E/$1" "$2" --cols ${3:-6} | tail -1 | sed "s#^#$1: #"; }
RM='{"eval":"inst.toggleRM()","after":150}'
DEL='{"click":".c07-tile[data-rid=\"draft-reading\"] [data-act=delete]","after":60}'
# ---------- 减少动态 ON ----------
cap rm-undo '['"$RM"',{"jump":"h-drafts","after":700},'"$DEL"',{"shots":8,"every":850},{"click":"[data-act=undo]","after":60},{"shots":3,"every":400}]'
cap rm-redelete '['"$RM"',{"jump":"h-drafts","after":700},'"$DEL"',{"shots":2,"every":850},{"click":"[data-act=undo]","after":200},'"$DEL"',{"shots":10,"every":850}]'
cap rm-toasts '['"$RM"',{"jump":"j-d-contact","after":900},{"click":".c07-over [data-act=copy]","after":60},{"shots":6,"every":400},{"jump":"j-d-reschedule","after":900},{"click":".c07-over [data-act=accept]","after":60},{"shots":6,"every":400},{"jump":"h-m-reschedule","after":1200},{"eval":"inst.patchSheet({time:\"21:15\"})","after":200,"shot":true},{"click":".c07-sheet .c07-sheet-f .c07-btn.big","after":60},{"shots":6,"every":400}]' 7
cap rm-print-tear '['"$RM"',{"jump":"j-home","after":900},{"click":".c07-tile[data-rid=\"run3k\"] .c07-open","after":60},{"shots":2,"every":150},{"drag":{"from":".c07-over #c07-pass-main .c07-stub","to":[-40,170],"steps":6,"every":50,"shots":true},"after":80},{"shots":3,"every":200}]' 7
cap rm-tear-btn '['"$RM"',{"jump":"j-d-tear","after":900},{"click":".c07-over [data-act=tear]","after":60},{"shots":3,"every":200}]'
cap rm-cancel '['"$RM"',{"jump":"h-m-cancel","after":1200},{"click":".c07-sheet .c07-sheet-f .c07-btn.big","after":60},{"shots":3,"every":200},{"click":".c07-over [data-act=back]","after":60},{"shots":3,"every":300}]'
# ---------- 减少动态 OFF ----------
cap card-detail-back '[{"jump":"j-home","after":900},{"speed":0.5},{"click":".c07-tile[data-rid=\"sketch\"] .c07-open","after":40},{"shots":10,"every":110},{"wait":800,"shot":true},{"click":".c07-over [data-act=back]","after":30},{"shots":12,"every":110},{"wait":1200,"shot":true}]' 7
cap print '[{"jump":"j-home","after":900},{"click":".c07-tile[data-rid=\"run3k\"] .c07-open","after":40},{"shots":27,"every":110}]' 7
cap tear '[{"jump":"j-d-tear","after":1500},{"drag":{"from":".c07-over #c07-pass-main .c07-stub","to":[-40,170],"steps":7,"every":60,"shots":true},"after":20},{"shots":18,"every":110}]' 7
cap cancel-half '[{"jump":"h-m-cancel","after":1500},{"speed":0.5},{"click":".c07-sheet .c07-sheet-f .c07-btn.big","after":100},{"shots":24,"every":180},{"shots":6,"every":600},{"speed":1},{"click":".c07-over [data-act=back]","after":60},{"shots":10,"every":200}]' 7
cap draft-undo '[{"jump":"h-drafts-many","after":1500},{"speed":0.5},{"click":".c07-tile[data-rid=\"draft-hotpot\"] [data-act=delete]","after":40},{"shots":9,"every":110},{"wait":800,"shot":true},{"click":"[data-act=undo]","after":40},{"shots":10,"every":110},{"wait":2500,"shot":true}]' 7

#!/bin/bash
# final-verify capture set (independent). Run from /home/user/JU with JU_STANDALONE set.
O=evidence/C04/final-verify
RULES_END='{"eval":"const e=root.querySelector(\".rules .rs\"); e.scrollTop=99999; e.dispatchEvent(new Event(\"scroll\"));","after":400,"shot":true}'
cap() { node tools/capture.cjs C04 "$O/$1" "$2" ${3:-} | tail -1 | sed "s#^#$1 #"; }
case "$1" in
a)
# N1: confirm → formed print at 1x (dense) and 0.5x
cap n1-confirm-1x '[{"jump":"j-d-invited","after":900},{"click":".pane .acts .cta","after":1300},'"$RULES_END"',{"click":".rules [data-act=\"confirm\"]","after":20},{"shots":22,"every":20},{"wait":800,"shot":true}]'
cap n1-confirm-half '[{"jump":"j-d-invited","after":900},{"speed":0.5},{"click":".pane .acts .cta","after":2400},'"$RULES_END"',{"click":".rules [data-act=\"confirm\"]","after":20},{"shots":34,"every":60},{"wait":1500,"shot":true}]'
# N1: real drag on the pass slot during the window (0.5x, ~1.15 s after confirm)
cap n1-drag-half '[{"jump":"j-d-invited","after":900},{"speed":0.5},{"click":".pane .acts .cta","after":2400},'"$RULES_END"',{"click":".rules [data-act=\"confirm\"]","after":1100},{"drag":{"from":".pane .piece.stubp","at":[0,100],"to":[0,180],"steps":8,"shots":true},"after":200},{"click":".pane .bar2 .weak","after":200},{"shots":10,"every":500},{"wait":1500,"shot":true}]'
;;
b)
# reduced motion ON
cap rm-draft-undo '[{"eval":"inst.toggleRM()"},{"jump":"h-drafts","after":900},{"click":"[data-act=\"delete\"]","after":60},{"shots":8,"every":850},{"click":".undo [data-act=\"undo\"]","after":200},{"shots":3,"every":500}]'
cap rm-copy-toast '[{"eval":"inst.toggleRM()"},{"jump":"j-d-contact","after":1000},{"click":".pane [data-act=\"copy\"]","after":60},{"shots":9,"every":150},{"wait":700,"shot":true}]'
cap rm-resched-toast '[{"eval":"inst.toggleRM()"},{"jump":"h-m-reschedule","after":1000},{"eval":"inst.setState({ resched: { date: \"2026-12-24\", time: \"19:30\", touched: true } })","after":200,"shot":true},{"click":".sheet [data-act=\"propose\"]","after":600},{"shots":8,"every":150},{"wait":900,"shot":true}]'
cap rm-confirm-print '[{"eval":"inst.toggleRM()"},{"jump":"j-d-invited","after":900},{"click":".pane .acts .cta","after":600},'"$RULES_END"',{"click":".rules [data-act=\"confirm\"]","after":20},{"shots":6,"every":120}]'
;;
c)
cap rm-print-tap '[{"eval":"inst.toggleRM()"},{"jump":"j-home","after":800},{"click":".rw[data-rid=\"run3k\"] .row","after":30},{"shots":6,"every":100}]'
cap rm-tear '[{"eval":"inst.toggleRM()"},{"jump":"j-d-tear","after":900},{"drag":{"from":".pane .piece.stubp","at":[0,100],"to":[0,200],"steps":8,"shots":true},"after":100},{"shots":4,"every":200}]'
cap rm-cancel '[{"eval":"inst.toggleRM()"},{"jump":"h-m-cancel","after":900},{"click":".sheet [data-act=\"cancel\"]","after":30},{"shots":6,"every":150},{"click":".pane.mg .bar2 .back","after":600}]'
;;
d)
# reduced motion OFF, regression
cap card-detail-back-half '[{"jump":"j-home","after":800},{"speed":0.5},{"click":".rw[data-rid=\"theater\"] .row","after":20},{"shots":10,"every":80},{"wait":800,"shot":true},{"click":".pane .bar2 .back","after":20},{"shots":10,"every":80},{"wait":1500,"shot":true}]'
cap print-tap-half '[{"jump":"j-home","after":800},{"speed":0.5},{"click":".rw[data-rid=\"run3k\"] .row","after":20},{"shots":30,"every":60},{"wait":1500,"shot":true}]'
;;
e)
cap tear-half '[{"jump":"j-d-tear","after":900},{"speed":0.5},{"drag":{"from":".pane .piece.stubp","at":[0,100],"to":[0,200],"steps":10,"shots":true},"after":60},{"shots":24,"every":80},{"wait":1500,"shot":true}]'
cap cancel-half '[{"jump":"h-m-cancel","after":900},{"speed":0.5},{"click":".sheet [data-act=\"cancel\"]","after":20},{"shots":36,"every":100},{"wait":1500,"shot":true},{"click":".pane.mg .bar2 .back","after":1500}]'
cap draft-undo-1x '[{"jump":"h-drafts","after":900},{"click":"[data-act=\"delete\"]","after":60},{"shots":5,"every":120},{"wait":2000,"shot":true},{"click":".undo [data-act=\"undo\"]","after":30},{"shots":5,"every":120}]'
cap back-mid-print '[{"jump":"j-home","after":800},{"click":".rw[data-rid=\"run3k\"] .row","after":1100},{"click":".pane .bar2 .back","after":30},{"shots":4,"every":200},{"wait":1500,"shot":true},{"click":".rw[data-rid=\"run3k\"] .row","after":600},{"shots":8,"every":300},{"wait":1500,"shot":true}]'
;;
esac

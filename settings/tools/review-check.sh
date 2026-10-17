#!/usr/bin/env bash
# Lead gate for one settings concept: node syntax/build check, coverage (all JUS.INDEX states, 0 errors), evidence inventory. Usage: bash settings/tools/review-check.sh SC03
set -u; C="$1"; cd /home/user/JU
echo "== $C source: $(wc -c < settings/concepts/src/$C.dc.html 2>/dev/null || echo MISSING) bytes"
JU_STANDALONE=/home/user/JU/.build/$C.html JUS_ONLY=$C node settings/src/build.js 2>&1 | tail -1
JU_STANDALONE=/home/user/JU/.build/$C.html node settings/tools/coverage.cjs $C /home/user/JU/.build/$C-cov 2>&1 | tail -1
echo "== evidence:"; ls settings/evidence/$C 2>/dev/null | tr '\n' ' '; echo
for m in motion-1 motion-2 motion-3; do printf "%s: %s frames, errors=%s\n" $m "$(ls settings/evidence/$C/$m 2>/dev/null | grep -c '^f')" "$(python3 -I -c "import json;print(json.load(open('settings/evidence/$C/$m/log.json'))['errors'])" 2>/dev/null || echo 'no log')"; done
printf "coverage dir: %s frames, errors=%s\n" "$(ls settings/evidence/$C/coverage 2>/dev/null | grep -c '\.jpg$\|\.png$')" "$(python3 -I -c "import json;print(json.load(open('settings/evidence/$C/coverage/log.json'))['errors'])" 2>/dev/null || echo 'no log')"
echo "== spec: $(wc -l < settings/spec/motion/$C.md 2>/dev/null || echo MISSING) lines; evidence size $(du -sh settings/evidence/$C 2>/dev/null | cut -f1)"
echo "== demo-control leak check (controls must live in the panel, not the phone):"; grep -c "data-act=\"armFail\"\|simPermission\|variant-select" settings/concepts/src/$C.dc.html
echo "== forbidden vocab (penalty/credit score/annual remaining):"; grep -n "扣分\|信用分\|年度剩余\|剩余次数" settings/concepts/src/$C.dc.html | head -5

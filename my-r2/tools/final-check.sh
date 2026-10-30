#!/bin/bash
# Runs every acceptance check against the FINAL deliverable (JU-MY-R2-TEN-DIRECTIONS.html), not a private build.
# Usage: bash my-r2/tools/final-check.sh [C01 C02 ...]      (default: all ten)
#        FC_PARTS=global,concepts,flow,summary (default: all four) runs only those parts, so the per-concept checks can be split
#        over two shells (e.g. FC_PARTS=concepts … C01 C02 C03 C04 C05 and … C06 … C10), then FC_PARTS=global,flow,summary once.
# Output: my-r2/evidence/final/<check>/... and my-r2/evidence/final/summary.json
set -u
cd /home/user/JU
F=/home/user/JU/JU-MY-R2-TEN-DIRECTIONS.html
O=my-r2/evidence/final
CODES="${*:-C01 C02 C03 C04 C05 C06 C07 C08 C09 C10}"
PARTS=",${FC_PARTS:-global,concepts,flow,summary},"
mkdir -p $O
export JU_STANDALONE=$F
if [[ $PARTS == *,global,* ]]; then
  node my-r2/tools/test/standalone.cjs --shots $O/standalone > $O/standalone.json 2>&1
  node my-r2/tools/offline-check.cjs $F $O/offline > $O/offline.json 2>&1
fi
if [[ $PARTS == *,concepts,* ]]; then
  for c in $CODES; do
    node my-r2/tools/coverage.cjs $c $O/coverage/$c > $O/coverage-$c.log 2>&1
    node my-r2/tools/widths.cjs $c $O/widths/$c > $O/widths-$c.log 2>&1
    node my-r2/tools/kb-check.cjs $c $O/kb/$c > $O/kb-$c.log 2>&1
    node my-r2/tools/rm-check.cjs $c $O/rm/$c > $O/rm-$c.log 2>&1
  done
fi
[[ $PARTS == *,flow,* ]] && node my-r2/tools/flow-compare.cjs $O/flow --final --flow enter-op-back --codes $(echo $CODES | tr ' ' ',') > $O/flow.log 2>&1
[[ $PARTS == *,summary,* ]] || exit 0
python3 - "$O" $CODES <<'PY'
import json, os, sys
O=sys.argv[1]; codes=sys.argv[2:]
def last_json(p):
    try:
        t=open(p,encoding='utf-8',errors='replace').read()
        i=t.rfind('\n{'); s=t[i+1:] if i>=0 else t[t.find('{'):]
        s=s.split('\n')[0] if s.startswith('{') and '\n' in s and s.count('{')>1 and s.strip().endswith(('OK','FAILED')) else s
        return json.loads(s.strip().split('\nstandalone')[0].split('\noffline-check')[0])
    except Exception as e:
        return {'parseError': str(e), 'tail': open(p,encoding='utf-8',errors='replace').read()[-300:] if os.path.exists(p) else 'missing'}
out={'standalone': last_json(O+'/standalone.json'), 'offline': last_json(O+'/offline.json'), 'flow': last_json(O+'/flow.log')}
for c in codes:
    out[c]={k: last_json('%s/%s-%s.log'%(O,k,c)) for k in ('coverage','widths','kb','rm')}
json.dump(out, open(O+'/summary.json','w'), ensure_ascii=False, indent=1)
print('summary written to', O+'/summary.json')
PY

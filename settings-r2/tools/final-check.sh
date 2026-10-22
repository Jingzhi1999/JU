#!/bin/bash
# Runs every acceptance check against the FINAL deliverable (JU-SETTINGS-R2-TEN-DIRECTIONS.html), not a private build.
# Output: settings-r2/evidence/final/<check>/... and settings-r2/evidence/final/summary.json
set -u
cd /home/user/JU
F=/home/user/JU/JU-SETTINGS-R2-TEN-DIRECTIONS.html
O=settings-r2/evidence/final
CODES="S01 S02 S03 S04 S05 S06 S07 S08 S09 S10"
mkdir -p $O
export JU_STANDALONE=$F
node settings-r2/tools/test/standalone.cjs > $O/standalone.json 2>&1
node settings-r2/tools/offline-check.cjs $F $O/offline > $O/offline.json 2>&1
for c in $CODES; do
  node settings-r2/tools/coverage.cjs $c $O/coverage/$c > $O/coverage-$c.log 2>&1
  node settings-r2/tools/widths.cjs $c $O/widths/$c s-home,s-profile-edit,s-fav,s-records,s-notify,s-long,s-seam-feed,s-rules > $O/widths-$c.log 2>&1
  node settings-r2/tools/kb-check.cjs $c $O/kb/$c s-profile-edit,s-record-supplement,s-record-dispute,s-feedback,s-report-supplement,s-report-file,s-city > $O/kb-$c.log 2>&1
  node settings-r2/tools/rm-check.cjs $c $O/rm/$c > $O/rm-$c.log 2>&1
done
node settings-r2/tools/flow-compare.cjs $O/flow --final > $O/flow.log 2>&1
python3 - <<'PY'
import json, glob, os, re
O='settings-r2/evidence/final'
def last_json(p):
    try:
        t=open(p,encoding='utf-8',errors='replace').read()
        i=t.rfind('\n{'); s=t[i+1:] if i>=0 else t[t.find('{'):]
        return json.loads(s)
    except Exception as e:
        return {'parseError': str(e), 'tail': open(p,encoding='utf-8',errors='replace').read()[-300:] if os.path.exists(p) else 'missing'}
out={'standalone': last_json(O+'/standalone.json'), 'offline': last_json(O+'/offline.json'), 'flow': last_json(O+'/flow.log')}
for c in 'S01 S02 S03 S04 S05 S06 S07 S08 S09 S10'.split():
    out[c]={k: last_json('%s/%s-%s.log'%(O,k,c)) for k in ('coverage','widths','kb','rm')}
json.dump(out, open(O+'/summary.json','w'), ensure_ascii=False, indent=1)
print('summary written')
PY

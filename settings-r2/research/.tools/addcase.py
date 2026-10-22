# merges CASES from a .py file into the repo ledger.json (the store), then rebuilds ledger.md
import sys, json, os, subprocess
LEDGER = '/home/user/JU/settings-r2/research/ledger.json'
store = json.load(open(LEDGER))
ns = {}; exec(open(sys.argv[1], encoding='utf-8').read(), ns)
idx = {c['slug']: i for i, c in enumerate(store)}
REQ = ['slug','name','creator','period','cat','url','viewed','what_seen','method','affects','avoid','evidence','motion_seen','award','inherited']
for c in ns['CASES']:
    miss = [k for k in REQ if k not in c]
    if miss: raise SystemExit(f"{c.get('slug')}: missing {miss}")
    assert c['cat'] in ('ui','motion','editorial','designer','award'), c['cat']
    if c['slug'] in idx: store[idx[c['slug']]] = c
    else: store.append(c); idx[c['slug']] = len(store) - 1
json.dump(store, open(LEDGER, 'w'), ensure_ascii=False, indent=1)
print('store now', len(store), 'cases')

#!/usr/bin/env python3
"""merge.py — 合并 my-r2/research/parts/group-*.json 为 ledger.json / ledger.md，并按任务书 §04 配额统计（只计 verified）。"""
import json, glob, os, collections
ROOT = os.path.dirname(os.path.abspath(__file__))
parts = sorted(glob.glob(os.path.join(ROOT, 'parts', 'group-*.json')))
entries = []; seen = set()
for p in parts:
    for e in json.load(open(p, encoding='utf-8')):
        if e['slug'] in seen: continue
        seen.add(e['slug']); e['group'] = os.path.basename(p).replace('.json', ''); entries.append(e)
cat_cn = {'ui': 'UI / UX', 'motion': '动效', 'editorial': '编辑 / 排版', 'designer': '设计师作品', 'award': '奖项原始页'}
quota = {'ui': 16, 'motion': 12, 'editorial': 8, 'designer': 10, 'award': 4}
ver = [e for e in entries if e.get('status') == 'verified']
cnt = collections.Counter(e['category'] for e in ver)
json.dump(entries, open(os.path.join(ROOT, 'ledger.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
lines = ['# 「我的局」R2 · 研究账本（合并自 parts/group-1..3；只有 verified 计入配额）', '',
         '| 类别 | verified | 配额 | 达标 |', '|---|---|---|---|']
for k in quota: lines.append(f'| {cat_cn[k]} | {cnt.get(k, 0)} | ≥{quota[k]} | {"✓" if cnt.get(k, 0) >= quota[k] else "✗"} |')
lines.append(f'| 合计 | {len(ver)} | ≥50 | {"✓" if len(ver) >= 50 else "✗"} |')
lines += ['', f'全部条目 {len(entries)}：verified {len(ver)} · downgraded {sum(1 for e in entries if e.get("status")=="downgraded")} · dropped {sum(1 for e in entries if e.get("status")=="dropped")}。证据截图在 `my-r2/research/evidence/<slug>/`。', '']
for k in quota:
    lines += [f'## {cat_cn[k]}', '', '| slug | 名称 | 作者 / 来源 | 时期 | 状态 | 实际观察 | 对 JU 我的局的转译 | 证据 |', '|---|---|---|---|---|---|---|---|']
    for e in [x for x in entries if x['category'] == k]:
        ev = ' '.join(f'`{v}`' for v in (e.get('evidence') or []))
        row = [e['slug'], e.get('name', ''), e.get('creator', ''), e.get('period', ''), e.get('status', ''), e.get('observation', ''), e.get('translation', ''), ev]
        lines.append('| ' + ' | '.join(str(c).replace('|', '\\|').replace('\n', ' ') for c in row) + ' |')
    lines.append('')
open(os.path.join(ROOT, 'ledger.md'), 'w', encoding='utf-8').write('\n'.join(lines))
print(json.dumps({'parts': [os.path.basename(p) for p in parts], 'entries': len(entries), 'verified': len(ver), 'byCategory': dict(cnt)}, ensure_ascii=False))

# -*- coding: utf-8 -*-
"""Builds my-r2/spec/coverage-manual.json (the hand-kept columns 2–5 of the five-column coverage table that coverage-matrix.cjs
renders) from each independent reviewer's own coverage table in my-r2/evidence/<CODE>/verify.md (§3, round 1), so the table says
what the reviewer actually did — not what a builder claims. Cells are copied as written and prefixed with the source; a concept-level
"*" note points at the later rounds (复核第 2 轮 / 主负责人复验), where items the first round marked ✗ or 部分 were re-checked.
Run: python3 -I my-r2/tools/coverage-from-verify.py [--out my-r2/spec/coverage-manual.json]"""
import json, os, re, sys
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
out = os.path.join(ROOT, 'my-r2/spec/coverage-manual.json')
if '--out' in sys.argv: out = os.path.abspath(sys.argv[sys.argv.index('--out') + 1])
KEY = re.compile(r'\b([jhb]-[a-z0-9]+(?:-[a-z0-9]+)*)\b')
def cells(line):
    s = line.strip()
    if s.startswith('|'): s = s[1:]
    if s.endswith('|'): s = s[:-1]
    return [c.strip() for c in s.split('|')]
def clean(t):
    t = t.replace('`', '').strip()
    return t if len(t) <= 160 else t[:157] + '…'
manual = {}
for code in ['C%02d' % i for i in range(1, 11)]:
    p = os.path.join(ROOT, 'my-r2/evidence', code, 'verify.md')
    if not os.path.exists(p): continue
    lines = open(p, encoding='utf-8').read().split('\n')
    rows = {}; later = any('复核第 2 轮' in l for l in lines)
    for i, l in enumerate(lines):
        if not l.startswith('|') or '入口存在' not in l or '仍需用户验收' not in l: continue
        head = cells(l)
        def col(*names):
            for j, h in enumerate(head):
                if any(n in h for n in names): return j
            return -1
        c_op, c_st, c_mo, c_pe = col('真实操作'), col('静态'), col('动效'), col('仍需用户验收')
        if min(c_op, c_st, c_mo, c_pe) < 0: continue
        for r in lines[i + 2:]:
            if not r.startswith('|'): break
            cs = cells(r); key = None
            for c in cs[:3]:
                m = KEY.search(c.replace('`', ''))
                if m: key = m.group(1); break
            if not key or key in rows: continue
            g = lambda j: clean(cs[j]) if 0 <= j < len(cs) else ''
            rows[key] = {'op': '复核 R1：' + g(c_op), 'static': '复核 R1：' + g(c_st), 'motion': '复核 R1：' + g(c_mo), 'pending': g(c_pe) or '是'}
        if rows: break
    if rows:
        if later: rows['*'] = {'pending': '是（最终视觉验收）'}
        manual[code] = rows
    print(code, len(rows) - (1 if '*' in rows else 0), 'rows')
json.dump(manual, open(out, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
print('wrote', out)

# -*- coding: utf-8 -*-
"""Converts a reviewer's PNG evidence (settings-r2/evidence/<CODE>/verify/**.png) to JPEG q85 and rewrites the matching
paths in settings-r2/evidence/<CODE>/verify.md, so the review stays readable and the repository stays small.
Run: python3 -I settings-r2/tools/shrink-verify.py S06"""
import os, sys, re, subprocess
root = '/home/user/JU/settings-r2/evidence'
code = sys.argv[1]
base = os.path.join(root, code, 'verify')
n = 0
for dp, dn, fn in os.walk(base):
    for f in fn:
        if f.endswith('.png'):
            src = os.path.join(dp, f); dst = src[:-4] + '.jpg'
            subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', src, '-q:v', '3', dst], check=True)
            os.remove(src); n += 1
md = os.path.join(root, code, 'verify.md')
if os.path.exists(md):
    s = open(md, encoding='utf-8').read()
    s2 = re.sub(r'((?:verify/)?[\w./-]+?)\.png\b', lambda m: m.group(1) + '.jpg' if os.path.exists(os.path.join(base, m.group(1).replace('verify/', '', 1) + '.jpg')) or 'verify/' in m.group(1) else m.group(0), s)
    open(md, 'w', encoding='utf-8').write(s2)
print('converted', n, 'PNG under', base)

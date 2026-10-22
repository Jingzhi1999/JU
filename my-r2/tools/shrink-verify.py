# -*- coding: utf-8 -*-
"""Converts a reviewer's PNG evidence (my-r2/evidence/<CODE>/verify/**.png) to JPEG q85 and rewrites the matching
paths in my-r2/evidence/<CODE>/verify.md, so the review stays readable and the repository stays small.
Run: python3 -I my-r2/tools/shrink-verify.py C06 [--root /path/to/evidence]"""
import os, sys, re, subprocess
args = [a for a in sys.argv[1:] if not a.startswith('--')]
root = sys.argv[sys.argv.index('--root') + 1] if '--root' in sys.argv else '/home/user/JU/my-r2/evidence'
if not args:
    print(__doc__); sys.exit(2)
code = args[0]
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

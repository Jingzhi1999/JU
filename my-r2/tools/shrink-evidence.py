# -*- coding: utf-8 -*-
"""Converts capture frames (motion-*/f*.png, */sheet.png, coverage/*.png, widths/*.png …) under my-r2/evidence/<CODE>/ to JPEG q85
and removes the PNGs, keeping the named state screenshots directly in my-r2/evidence/<CODE>/ (home-joined.png, …) as PNG.
stage1/ (evidence kept exactly as it was reviewed) and verify/ (reviewers' folders, see shrink-verify.py) are skipped.
Run: python3 -I my-r2/tools/shrink-evidence.py C05 [--root /path/to/evidence]"""
import os, sys, subprocess
args = [a for a in sys.argv[1:] if not a.startswith('--')]
root = sys.argv[sys.argv.index('--root') + 1] if '--root' in sys.argv else '/home/user/JU/my-r2/evidence'
if not args:
    print(__doc__); sys.exit(2)
code = args[0]
base = os.path.join(root, code)
n = 0
for dp, dn, fn in os.walk(base):
    rel = os.path.relpath(dp, base)
    if rel == '.' or rel.split(os.sep)[0] in ('stage1', 'verify'):
        continue  # named shots stay PNG; stage-1 evidence is kept as reviewed; reviewers' verify/ folders belong to shrink-verify.py
    for f in fn:
        if f.endswith('.png'):
            src = os.path.join(dp, f); dst = src[:-4] + '.jpg'
            subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', src, '-q:v', '3', dst], check=True)
            os.remove(src); n += 1
print('converted', n, 'frames under', base)

# -*- coding: utf-8 -*-
"""Converts capture frames (motion-*/f*.png, sheet.png, coverage/*.png) under settings-r2/evidence/<CODE>/ to JPEG q85 and removes the PNGs,
keeping the named state screenshots (home.png, dense.png, …) as PNG. Run: python3 -I settings-r2/tools/shrink-evidence.py SC05"""
import os, sys, subprocess
root = '/home/user/JU/settings-r2/evidence'
code = sys.argv[1]
base = os.path.join(root, code)
n = 0
for dp, dn, fn in os.walk(base):
    rel = os.path.relpath(dp, base)
    if rel == '.' or rel.split(os.sep)[0] == 'stage1':
        continue  # stage-1 evidence is kept as it was reviewed
    for f in fn:
        if f.endswith('.png'):
            src = os.path.join(dp, f); dst = src[:-4] + '.jpg'
            subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', src, '-q:v', '3', dst], check=True)
            os.remove(src); n += 1
print('converted', n, 'frames under', base)

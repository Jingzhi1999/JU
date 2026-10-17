# -*- coding: utf-8 -*-
"""Converts capture frames (motion-*/f*.png, sheet.png, coverage/*.png) under settings/evidence/<CODE>/ to JPEG q85 and removes the PNGs,
keeping the named state screenshots (home.png, dense.png, …) as PNG. Run: python3 -I settings/tools/shrink-evidence.py SC05"""
import os, sys, subprocess
root = '/home/user/JU/settings/evidence'
code = sys.argv[1]
base = os.path.join(root, code)
n = 0
for dp, dn, fn in os.walk(base):
    rel = os.path.relpath(dp, base)
    if rel == '.':
        continue
    for f in fn:
        if f.endswith('.png'):
            src = os.path.join(dp, f); dst = src[:-4] + '.jpg'
            subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', src, '-q:v', '3', dst], check=True)
            os.remove(src); n += 1
print('converted', n, 'frames under', base)

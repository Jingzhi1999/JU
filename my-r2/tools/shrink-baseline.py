#!/usr/bin/env python3
"""shrink-baseline.py <dir> — 把基线 / 研究证据截图缩到 1x（390 宽等比）并量化为 256 色 PNG（保留文件名与扩展名）。
用法：python3 -I my-r2/tools/shrink-baseline.py my-r2/evidence/baseline/r9 [--max-width 390]"""
import sys, os
from PIL import Image
d = sys.argv[1]; mw = int(sys.argv[sys.argv.index('--max-width') + 1]) if '--max-width' in sys.argv else 390
before = after = n = 0
for root, _, files in os.walk(d):
    for f in files:
        if not f.lower().endswith('.png'): continue
        p = os.path.join(root, f); before += os.path.getsize(p)
        im = Image.open(p); im.load()
        if im.width > mw * 1.05: im = im.resize((mw, round(im.height * mw / im.width)), Image.LANCZOS)
        im = im.convert('RGB').quantize(colors=256, method=Image.Quantize.MEDIANCUT, dither=Image.Dither.FLOYDSTEINBERG)
        im.save(p, optimize=True); after += os.path.getsize(p); n += 1
print(f'{d}: {n} files, {before/1e6:.1f} MB → {after/1e6:.1f} MB')

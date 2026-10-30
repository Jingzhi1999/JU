# -*- coding: utf-8 -*-
"""Copies one flow-compare run (my-r2/tools/flow-compare.cjs <outdir> …) into each concept's evidence folder, so the gallery shows
every concept's own 1x 进入—操作—返回 recording next to its stills:
  <outdir>/<CODE>-NN.jpg      → my-r2/evidence/<CODE>/flow-enter/NN.jpg   (the frames, as painted)
  <outdir>/<CODE>-sheet.png   → my-r2/evidence/<CODE>/flow-enter/sheet.jpg (labelled grid, 8 frames per row)
  <outdir>/log.json (this concept's part) → my-r2/evidence/<CODE>/flow-enter/log.json
Run: python3 -I my-r2/tools/flow-evidence.py <outdir> [C01 C02 …]"""
import json, os, re, shutil, sys
from PIL import Image
src = sys.argv[1]; codes = sys.argv[2:] or ['C%02d' % i for i in range(1, 11)]
root = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), 'my-r2', 'evidence')
log = json.load(open(os.path.join(src, 'log.json'), encoding='utf-8'))
for code in codes:
    dst = os.path.join(root, code, 'flow-enter'); shutil.rmtree(dst, ignore_errors=True); os.makedirs(dst)
    frames = sorted(f for f in os.listdir(src) if re.match(r'^%s-\d+\.jpg$' % code, f))
    for f in frames: shutil.copy(os.path.join(src, f), os.path.join(dst, f.split('-', 1)[1]))
    sp = os.path.join(src, code + '-sheet.png')
    if os.path.exists(sp): Image.open(sp).convert('RGB').save(os.path.join(dst, 'sheet.jpg'), quality=85, optimize=True)
    part = {k: log[k] for k in ('flow', 'title', 'skin', 'speed', 'span', 'max', 'min', 'screencast') if k in log}
    part['run'] = (log.get('log') or {}).get(code)
    json.dump(part, open(os.path.join(dst, 'log.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    print(code, len(frames), 'frames', 'sheet' if os.path.exists(sp) else 'NO SHEET')

"""Shrink untracked evidence contact sheets in place (same path): any non-frame PNG; max width 1400px, 256-colour palette PNG.
Usage: python3 tools/shrink-sheets.py <list-of-paths.txt>"""
import os, sys
from PIL import Image
paths=[l.strip() for l in open(sys.argv[1]) if l.strip()]
before=after=n=0
for p in paths:
    f=os.path.join('/home/user/JU',p)
    b=os.path.basename(p)
    if not b.endswith('.png') or b.startswith('f') and b[1:2].isdigit() or not os.path.isfile(f): continue
    s=os.path.getsize(f); before+=s
    try:
        im=Image.open(f).convert('RGB')
        if im.width>1400: im=im.resize((1400, round(im.height*1400/im.width)), Image.LANCZOS)
        q=im.quantize(colors=256, method=Image.Quantize.MEDIANCUT, dither=Image.Dither.NONE)
        tmp=f+'.tmp.png'; q.save(tmp, optimize=True)
        if os.path.getsize(tmp)<s: os.replace(tmp,f); n+=1
        else: os.remove(tmp)
    except Exception as e: print('skip',p,e)
    after+=os.path.getsize(f)
print('shrunk',n,'sheets',before//1024//1024,'MB ->',after//1024//1024,'MB')

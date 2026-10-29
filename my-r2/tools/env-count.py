"""my-r2 · env-count: share of each env-probe PNG that is pure magenta (environment exposed) and magenta-hued (seen through a
translucent surface). Usage: python3 -I my-r2/tools/env-count.py <dir>/*.png  →  {state: [exposed%, seen-through%]}"""
import sys, json, colorsys
from PIL import Image
res = {}
for f in sys.argv[1:]:
    im = Image.open(f).convert('RGB'); w, h = im.size
    px = im.load(); pure = tint = tot = 0
    for y in range(0, h, 2):
        for x in range(0, w, 2):
            r, g, b = px[x, y]; tot += 1
            if r > 215 and g < 60 and b > 215: pure += 1; continue
            hh, ll, ss = colorsys.rgb_to_hls(r/255, g/255, b/255)
            if 0.78 < hh < 0.89 and ss > 0.3 and (r - g) > 40 and (b - g) > 40: tint += 1
    res[f.rsplit('/',1)[1][:-4]] = (round(100*pure/tot,1), round(100*tint/tot,1))
print(json.dumps(res, ensure_ascii=False))

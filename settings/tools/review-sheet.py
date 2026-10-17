# -*- coding: utf-8 -*-
"""Lead-review contact sheet: tiles every named state screenshot (settings/evidence/<CODE>/*.png) with its file name as a label.
Run: python3 -I settings/tools/review-sheet.py SC05 [cols] → .build/review-<CODE>.jpg"""
import os, sys
from PIL import Image, ImageDraw, ImageFont
code = sys.argv[1]; cols = int(sys.argv[2]) if len(sys.argv) > 2 else 6
base = os.path.join('/home/user/JU/settings/evidence', code)
order = ['home', 'dense', 'favorites', 'favorites-after-remove', 'record-detail', 'record-supplement', 'record-supplement-saved', 'report-supplement', 'saved', 'saved-home', 'edge-empty', 'edge-fail', 'edge-denied', 'edge-long', 'edge-invalid', 'seam-feed', 'seam-feed-detail', 'seam-mine', 'appearance-preview', 'help']
names = sorted([f[:-4] for f in os.listdir(base) if f.endswith('.png')], key=lambda n: (order.index(n) if n in order else 99, n))
if not names: print('no png in', base); sys.exit(1)
scale = 0.6; W, H = int(390 * scale), int(844 * scale); pad = 8; lab = 22
rows = (len(names) + cols - 1) // cols
sheet = Image.new('RGB', (cols * (W + pad) + pad, rows * (H + lab + pad) + pad), (236, 233, 228))
d = ImageDraw.Draw(sheet)
try: font = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf', 13)
except Exception: font = ImageFont.load_default()
for i, n in enumerate(names):
    im = Image.open(os.path.join(base, n + '.png')).convert('RGB'); im.thumbnail((W, H))
    x = pad + (i % cols) * (W + pad); y = pad + (i // cols) * (H + lab + pad)
    d.text((x + 2, y + 3), n, fill=(60, 56, 50), font=font); sheet.paste(im, (x, y + lab))
out = '/home/user/JU/.build/review-%s.jpg' % code; os.makedirs('/home/user/JU/.build', exist_ok=True)
sheet.save(out, quality=82); print(out, len(names), 'shots')

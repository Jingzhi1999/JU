# -*- coding: utf-8 -*-
"""Lead-review contact sheet: tiles every named state screenshot (my-r2/evidence/<CODE>/*.png|jpg, the six required shots and the
extras: three environments, long / many / empty, 360 / 430 widths, keyboard, reduced motion) with its file name as a label.
Run: python3 -I my-r2/tools/review-sheet.py C05 [cols] [--root /path/to/evidence] → .build/review-<CODE>.jpg
Expected names (the order of the sheet): home-joined home-hosted detail manage history empty result flow ritual-print ritual-tear
ritual-burn ritual-stamp env-cotton env-halo env-sunset long many w360 w430 kb rm (anything else follows alphabetically)."""
import os, sys
from PIL import Image, ImageDraw, ImageFont
args = [a for a in sys.argv[1:] if not a.startswith('--')]
root = sys.argv[sys.argv.index('--root') + 1] if '--root' in sys.argv else '/home/user/JU/my-r2/evidence'
if not args:
    print(__doc__); sys.exit(2)
code = args[0]; cols = int(args[1]) if len(args) > 1 else 6
base = os.path.join(root, code)
order = ['home-joined', 'home-hosted', 'detail', 'manage', 'history', 'empty', 'result', 'flow', 'ritual-print', 'ritual-tear', 'ritual-burn', 'ritual-stamp', 'env-cotton', 'env-halo', 'env-sunset', 'long', 'many', 'w360', 'w430', 'kb', 'rm']
files = {}
for f in sorted(os.listdir(base)) if os.path.isdir(base) else []:
    n, ext = os.path.splitext(f)
    if ext.lower() in ('.png', '.jpg', '.jpeg') and n not in files:
        files[n] = os.path.join(base, f)
names = sorted(files, key=lambda n: (order.index(n) if n in order else 99, n))
if not names:
    print('no png/jpg in', base); sys.exit(1)
scale = 0.6; W, H = int(390 * scale), int(844 * scale); pad = 8; lab = 22
rows = (len(names) + cols - 1) // cols
sheet = Image.new('RGB', (cols * (W + pad) + pad, rows * (H + lab + pad) + pad), (236, 233, 228))
d = ImageDraw.Draw(sheet)
try: font = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf', 13)
except Exception: font = ImageFont.load_default()
for i, n in enumerate(names):
    im = Image.open(files[n]).convert('RGB'); im.thumbnail((W, H))
    x = pad + (i % cols) * (W + pad); y = pad + (i // cols) * (H + lab + pad)
    d.text((x + 2, y + 3), n, fill=(60, 56, 50), font=font); sheet.paste(im, (x, y + lab))
out = '/home/user/JU/.build/review-%s.jpg' % code; os.makedirs('/home/user/JU/.build', exist_ok=True)
sheet.save(out, quality=82); print(out, len(names), 'shots')

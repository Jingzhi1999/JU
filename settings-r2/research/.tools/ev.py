import sys, os, io
from PIL import Image
ROOT = '/home/user/JU/settings-r2/research/evidence'
slug, src, name = sys.argv[1], sys.argv[2], sys.argv[3]
crop = sys.argv[4] if len(sys.argv) > 4 and sys.argv[4] not in ('-', '') else None
maxw = int(sys.argv[5]) if len(sys.argv) > 5 else 1600
im = Image.open(src).convert('RGB')
if crop:
    x0, y0, x1, y1 = [int(v) for v in crop.split(',')]; im = im.crop((x0, y0, x1, y1))
if im.width > maxw: im = im.resize((maxw, round(im.height * maxw / im.width)), Image.LANCZOS)
os.makedirs(os.path.join(ROOT, slug), exist_ok=True)
out = os.path.join(ROOT, slug, name if name.endswith('.jpg') else name + '.jpg')
for q in (82, 76, 70, 64, 58, 50):
    buf = io.BytesIO(); im.save(buf, 'JPEG', quality=q, optimize=True)
    if buf.tell() <= 400 * 1024: break
while buf.tell() > 400 * 1024:
    im = im.resize((int(im.width * 0.85), int(im.height * 0.85)), Image.LANCZOS); buf = io.BytesIO(); im.save(buf, 'JPEG', quality=60, optimize=True)
open(out, 'wb').write(buf.getvalue()); print(out, im.size, buf.tell() // 1024, 'KB')

import sys
from PIL import Image, ImageDraw
out, cols, tw = sys.argv[1], int(sys.argv[2]), int(sys.argv[3]); files = sys.argv[4:]
ims = []
for f in files:
    im = Image.open(f).convert('RGB'); r = tw / im.width; ims.append((f.split('/')[-1], im.resize((tw, int(im.height * r)))))
rows = [ims[i:i+cols] for i in range(0, len(ims), cols)]
H = sum(max(i.height for _, i in row) + 16 for row in rows)
sheet = Image.new('RGB', (cols * tw + (cols - 1) * 4, H), 'white'); d = ImageDraw.Draw(sheet); y = 0
for row in rows:
    x = 0; rh = max(i.height for _, i in row)
    for name, im in row:
        d.text((x + 2, y + 2), name, fill='black'); sheet.paste(im, (x, y + 16)); x += tw + 4
    y += rh + 16
sheet.save(out, quality=72); print(out, sheet.size)

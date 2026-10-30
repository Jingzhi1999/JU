# Tile raw screencast frames of one segment (cropped to the phone) with their ms labels. python3 -I xsheet.py <probe.json> <rawdir> <seg> <out.png> [from_ms] [to_ms] [max]
import json, sys
from PIL import Image, ImageDraw, ImageFont
probe, rawdir, seg, out = sys.argv[1:5]; lo = float(sys.argv[5]) if len(sys.argv) > 5 else -1e9; hi = float(sys.argv[6]) if len(sys.argv) > 6 else 1e9; mx = int(sys.argv[7]) if len(sys.argv) > 7 else 16
d = json.load(open(probe)); box = d['box']; s = [x for x in d['segs'] if x['name'] == seg][0]
fr = [f for f in s['frames'] if lo <= f[1] <= hi]
if len(fr) > mx: fr = [fr[round(i * (len(fr) - 1) / (mx - 1))] for i in range(mx)]
ims = []
for name, ms in fr:
    im = Image.open(rawdir + '/' + seg + '/' + name).convert('RGB'); sx = im.width / d['vw']; sy = im.height / d['vh']
    im = im.crop((int(box['x'] * sx), int(box['y'] * sy), int((box['x'] + box['w']) * sx), int((box['y'] + box['h']) * sy)))
    full = im.resize((int(im.width * 0.4), int(im.height * 0.4))); mk = im.crop((0, im.height - 24, 120, im.height)).resize((180, 36)); full.paste(mk, (0, full.height - 36))
    ims.append((full, '%s +%d' % (name, ms)))
w = ims[0][0].width; h = ims[0][0].height; cols = min(8, len(ims)); rows = (len(ims) + cols - 1) // cols
sh = Image.new('RGB', (cols * (w + 6) + 6, rows * (h + 20) + 6), (40, 40, 44)); dr = ImageDraw.Draw(sh); ft = ImageFont.truetype('/usr/share/fonts/truetype/wqy/wqy-zenhei.ttc', 12)
for k, (im, lab) in enumerate(ims):
    x = 6 + (k % cols) * (w + 6); y = 6 + (k // cols) * (h + 20); dr.text((x, y), lab, fill=(230, 230, 230), font=ft); sh.paste(im, (x, y + 15))
sh.save(out); print(sh.size, len(ims))

# usage: python3 -I pair.py out.png scale img1 img2 ...   (side by side, gray gutters, optional labels from filenames)
import sys
from PIL import Image, ImageDraw, ImageFont
out=sys.argv[1]; sc=float(sys.argv[2]); fs=sys.argv[3:]
ims=[Image.open(f).convert('RGB') for f in fs]
ims=[i.resize((int(i.width*sc),int(i.height*sc))) if sc!=1 else i for i in ims]
try: ft=ImageFont.truetype('/usr/share/fonts/truetype/wqy/wqy-zenhei.ttc', 12)
except Exception: ft=None
lab=16
W=sum(i.width for i in ims)+8*(len(ims)+1); H=max(i.height for i in ims)+lab+8
s=Image.new('RGB',(W,H),(40,40,44)); d=ImageDraw.Draw(s); x=8
for f,i in zip(fs,ims):
    s.paste(i,(x,lab)); d.text((x,1),f.split('/')[-1][:48],fill=(230,230,230),font=ft); x+=i.width+8
s.save(out)

from PIL import Image, ImageDraw, ImageOps
import os
rows=[["/home/user/JU/my-r2/evidence/C03/verify/op10b-24h/000-hosted_after_24h.png","/home/user/JU/my-r2/evidence/C03/verify/op10b-24h/001-museum_manage_after_24h.png","/home/user/JU/my-r2/evidence/C03/verify/op10b-24h/002-museum_scrolled.png","/home/user/JU/my-r2/evidence/C03/verify/op10b-24h/003-cards_manage_after_24h.png","/home/user/JU/my-r2/evidence/C03/verify/op10b-24h/004-joined_after_24h.png"]]
labels=[["hosted after +24h","museum manage after +24h","museum scrolled","cards manage after +24h","joined after +24h"]]
sc=0.42; gap=6; lab=18
ims=[[Image.open(f).convert('RGB') for f in r] for r in rows]
W=max(int(i.width*sc) for r in ims for i in r); H=max(int(i.height*sc) for r in ims for i in r); cols=max(len(r) for r in ims)
sh=Image.new('RGB',(cols*(W+gap)+gap, len(ims)*(H+gap+lab)+gap),(40,40,44))
d=ImageDraw.Draw(sh)
from PIL import ImageFont
try: ft=ImageFont.truetype('/usr/share/fonts/truetype/wqy/wqy-zenhei.ttc', 13)
except Exception: ft=None
for ri,r in enumerate(ims):
    for ci,im in enumerate(r):
        x=gap+ci*(W+gap); y=gap+ri*(H+gap+lab)
        if labels and ri < len(labels) and ci < len(labels[ri]): d.text((x+2,y+2),str(labels[ri][ci]),fill=(230,230,230),font=ft)
        sh.paste(im.resize((int(im.width*sc),int(im.height*sc)),Image.LANCZOS),(x,y+lab))
sh.save("/home/user/JU/my-r2/evidence/C03/verify/op10b-24h/sheet.png",optimize=True)

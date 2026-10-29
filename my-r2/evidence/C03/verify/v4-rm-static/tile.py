from PIL import Image, ImageDraw, ImageOps
import os
rows=[["/home/user/JU/my-r2/evidence/C03/verify/v4-rm-static/000-rm_j-home.png","/home/user/JU/my-r2/evidence/C03/verify/v4-rm-static/001-rm_h-home.png","/home/user/JU/my-r2/evidence/C03/verify/v4-rm-static/002-rm_j-d-invited.png","/home/user/JU/my-r2/evidence/C03/verify/v4-rm-static/003-rm_j-d-tear.png","/home/user/JU/my-r2/evidence/C03/verify/v4-rm-static/004-rm_h-m-attendance.png","/home/user/JU/my-r2/evidence/C03/verify/v4-rm-static/005-rm_h-m-card.png"]]
labels=[["rm j-home","rm h-home","rm j-d-invited","rm j-d-tear","rm h-m-attendance","rm h-m-card"]]
sc=0.5; gap=6; lab=18
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
sh.save("/home/user/JU/my-r2/evidence/C03/verify/v4-rm-static/sheet.png",optimize=True)

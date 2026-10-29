from PIL import Image, ImageDraw, ImageOps
import os
rows=[["/home/user/JU/my-r2/evidence/C10/verify/visual2/000-j-home-420.png","/home/user/JU/my-r2/evidence/C10/verify/visual2/001-j-home-end.png","/home/user/JU/my-r2/evidence/C10/verify/visual2/002-h-home-420.png","/home/user/JU/my-r2/evidence/C10/verify/visual2/003-h-home-end.png","/home/user/JU/my-r2/evidence/C10/verify/visual2/004-b-long.png","/home/user/JU/my-r2/evidence/C10/verify/visual2/005-b-long-h.png"],["/home/user/JU/my-r2/evidence/C10/verify/visual2/006-j-many.png","/home/user/JU/my-r2/evidence/C10/verify/visual2/007-h-pending.png"]]
labels=[["j-home-420","j-home-end","h-home-420","h-home-end","b-long","b-long-h"],["j-many","h-pending"]]
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
sh.save("/home/user/JU/my-r2/evidence/C10/verify/visual2/sheet.png",optimize=True)

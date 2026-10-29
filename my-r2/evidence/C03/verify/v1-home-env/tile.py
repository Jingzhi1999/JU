from PIL import Image, ImageDraw, ImageOps
import os
rows=[["/home/user/JU/my-r2/evidence/C03/verify/v1-home-env/000-j-home_cotton.png","/home/user/JU/my-r2/evidence/C03/verify/v1-home-env/001-h-home_cotton.png"],["/home/user/JU/my-r2/evidence/C03/verify/v1-home-env/002-j-home_halo.png","/home/user/JU/my-r2/evidence/C03/verify/v1-home-env/003-h-home_halo.png"],["/home/user/JU/my-r2/evidence/C03/verify/v1-home-env/004-j-home_sunset.png","/home/user/JU/my-r2/evidence/C03/verify/v1-home-env/005-h-home_sunset.png"]]
labels=[["j-home cotton","h-home cotton"],["j-home halo","h-home halo"],["j-home sunset","h-home sunset"]]
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
sh.save("/home/user/JU/my-r2/evidence/C03/verify/v1-home-env/sheet.png",optimize=True)

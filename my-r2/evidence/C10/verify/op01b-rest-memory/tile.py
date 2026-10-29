from PIL import Image, ImageDraw, ImageOps
import os
rows=[["/home/user/JU/my-r2/evidence/C10/verify/op01b-rest-memory/000-rest_st_10.png","/home/user/JU/my-r2/evidence/C10/verify/op01b-rest-memory/001-rest_st_20.png","/home/user/JU/my-r2/evidence/C10/verify/op01b-rest-memory/002-rest_st_30.png","/home/user/JU/my-r2/evidence/C10/verify/op01b-rest-memory/003-rest_st_40.png","/home/user/JU/my-r2/evidence/C10/verify/op01b-rest-memory/004-rest_st_55.png","/home/user/JU/my-r2/evidence/C10/verify/op01b-rest-memory/005-rest_st_70.png"],["/home/user/JU/my-r2/evidence/C10/verify/op01b-rest-memory/006-joined_back_expect_st_60_.png","/home/user/JU/my-r2/evidence/C10/verify/op01b-rest-memory/007-current_back_expect_st_60_.png"]]
labels=[["rest st=10","rest st=20","rest st=30","rest st=40","rest st=55","rest st=70"],["joined back (expect st 60)","current back (expect st 60)"]]
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
sh.save("/home/user/JU/my-r2/evidence/C10/verify/op01b-rest-memory/sheet.png",optimize=True)

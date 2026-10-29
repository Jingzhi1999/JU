from PIL import Image, ImageDraw, ImageOps
import os
rows=[["/home/user/JU/my-r2/evidence/C10/verify/op02b-back-landing/000-detail_home-1.jpg","/home/user/JU/my-r2/evidence/C10/verify/op02b-back-landing/001-detail_home-6.jpg","/home/user/JU/my-r2/evidence/C10/verify/op02b-back-landing/002-detail_home-12.jpg","/home/user/JU/my-r2/evidence/C10/verify/op02b-back-landing/003-detail_home-17.jpg","/home/user/JU/my-r2/evidence/C10/verify/op02b-back-landing/004-detail_home-23.jpg","/home/user/JU/my-r2/evidence/C10/verify/op02b-back-landing/005-detail_home-28.jpg"],["/home/user/JU/my-r2/evidence/C10/verify/op02b-back-landing/006-detail_home-34.jpg","/home/user/JU/my-r2/evidence/C10/verify/op02b-back-landing/007-detail_home-39.jpg","/home/user/JU/my-r2/evidence/C10/verify/op02b-back-landing/008-detail_home-45.jpg","/home/user/JU/my-r2/evidence/C10/verify/op02b-back-landing/009-detail_home-50.jpg","/home/user/JU/my-r2/evidence/C10/verify/op02b-back-landing/010-detail_home-56.jpg","/home/user/JU/my-r2/evidence/C10/verify/op02b-back-landing/011-detail_home-61.jpg"],["/home/user/JU/my-r2/evidence/C10/verify/op02b-back-landing/012-detail_home-67.jpg","/home/user/JU/my-r2/evidence/C10/verify/op02b-back-landing/013-detail_home-72.jpg","/home/user/JU/my-r2/evidence/C10/verify/op02b-back-landing/014-detail_home-78.jpg","/home/user/JU/my-r2/evidence/C10/verify/op02b-back-landing/015-detail_home-83.jpg","/home/user/JU/my-r2/evidence/C10/verify/op02b-back-landing/016-home_landed.png","/home/user/JU/my-r2/evidence/C10/verify/op02b-back-landing/017-home_later.png"]]
labels=[["detail → home 1/83 +0ms","detail → home 6/83 +92ms","detail → home 12/83 +221ms","detail → home 17/83 +380ms","detail → home 23/83 +515ms","detail → home 28/83 +651ms"],["detail → home 34/83 +765ms","detail → home 39/83 +855ms","detail → home 45/83 +955ms","detail → home 50/83 +1047ms","detail → home 56/83 +1137ms","detail → home 61/83 +1223ms"],["detail → home 67/83 +1327ms","detail → home 72/83 +1426ms","detail → home 78/83 +1534ms","detail → home 83/83 +1622ms","home landed","home later"]]
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
sh.save("/home/user/JU/my-r2/evidence/C10/verify/op02b-back-landing/sheet.png",optimize=True)

from PIL import Image, ImageDraw, ImageOps
import os
rows=[["/home/user/JU/my-r2/evidence/C07/stage2/flow-compare/C07-00.jpg","/home/user/JU/my-r2/evidence/C07/stage2/flow-compare/C07-01.jpg","/home/user/JU/my-r2/evidence/C07/stage2/flow-compare/C07-02.jpg","/home/user/JU/my-r2/evidence/C07/stage2/flow-compare/C07-03.jpg","/home/user/JU/my-r2/evidence/C07/stage2/flow-compare/C07-04.jpg","/home/user/JU/my-r2/evidence/C07/stage2/flow-compare/C07-05.jpg","/home/user/JU/my-r2/evidence/C07/stage2/flow-compare/C07-06.jpg","/home/user/JU/my-r2/evidence/C07/stage2/flow-compare/C07-07.jpg","/home/user/JU/my-r2/evidence/C07/stage2/flow-compare/C07-08.jpg","/home/user/JU/my-r2/evidence/C07/stage2/flow-compare/C07-09.jpg","/home/user/JU/my-r2/evidence/C07/stage2/flow-compare/C07-10.jpg","/home/user/JU/my-r2/evidence/C07/stage2/flow-compare/C07-11.jpg","/home/user/JU/my-r2/evidence/C07/stage2/flow-compare/C07-12.jpg","/home/user/JU/my-r2/evidence/C07/stage2/flow-compare/C07-13.jpg","/home/user/JU/my-r2/evidence/C07/stage2/flow-compare/C07-14.jpg","/home/user/JU/my-r2/evidence/C07/stage2/flow-compare/C07-15.jpg","/home/user/JU/my-r2/evidence/C07/stage2/flow-compare/C07-16.jpg","/home/user/JU/my-r2/evidence/C07/stage2/flow-compare/C07-17.jpg","/home/user/JU/my-r2/evidence/C07/stage2/flow-compare/C07-18.jpg","/home/user/JU/my-r2/evidence/C07/stage2/flow-compare/C07-19.jpg","/home/user/JU/my-r2/evidence/C07/stage2/flow-compare/C07-20.jpg","/home/user/JU/my-r2/evidence/C07/stage2/flow-compare/C07-21.jpg","/home/user/JU/my-r2/evidence/C07/stage2/flow-compare/C07-22.jpg","/home/user/JU/my-r2/evidence/C07/stage2/flow-compare/C07-23.jpg","/home/user/JU/my-r2/evidence/C07/stage2/flow-compare/C07-24.jpg","/home/user/JU/my-r2/evidence/C07/stage2/flow-compare/C07-25.jpg","/home/user/JU/my-r2/evidence/C07/stage2/flow-compare/C07-26.jpg"]]
labels=[["起点","click f1/9 +0ms","click f2/9 +439ms","click f3/9 +507ms","click f4/9 +581ms","click f5/9 +671ms","click f6/9 +711ms","click f7/9 +769ms","click f8/9 +807ms","click f9/9 +1006ms","back f1/17 +0ms","back f2/17 +445ms","back f3/17 +717ms","back f4/17 +1041ms","back f5/17 +1094ms","back f6/17 +1157ms","back f7/17 +1200ms","back f8/17 +1229ms","back f10/17 +1275ms","back f11/17 +1290ms","back f12/17 +1307ms","back f13/17 +1321ms","back f14/17 +1337ms","back f15/17 +1401ms","back f16/17 +1827ms","back f17/17 +1844ms","终态"]]
sc=0.34; gap=6; lab=18
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
sh.save("/home/user/JU/my-r2/evidence/C07/stage2/flow-compare/sheet.png",optimize=True)

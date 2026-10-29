from PIL import Image, ImageDraw, ImageOps
import os
rows=[["/home/user/JU/my-r2/evidence/C01/verify/r2/resched-keyboard2/f000.png","/home/user/JU/my-r2/evidence/C01/verify/r2/resched-keyboard2/f001.png","/home/user/JU/my-r2/evidence/C01/verify/r2/resched-keyboard2/f002.jpg","/home/user/JU/my-r2/evidence/C01/verify/r2/resched-keyboard2/f003.jpg","/home/user/JU/my-r2/evidence/C01/verify/r2/resched-keyboard2/f004.jpg","/home/user/JU/my-r2/evidence/C01/verify/r2/resched-keyboard2/f005.jpg"],["/home/user/JU/my-r2/evidence/C01/verify/r2/resched-keyboard2/f006.jpg","/home/user/JU/my-r2/evidence/C01/verify/r2/resched-keyboard2/f007.jpg","/home/user/JU/my-r2/evidence/C01/verify/r2/resched-keyboard2/f008.png","/home/user/JU/my-r2/evidence/C01/verify/r2/resched-keyboard2/f009.png","/home/user/JU/my-r2/evidence/C01/verify/r2/resched-keyboard2/f010.png","/home/user/JU/my-r2/evidence/C01/verify/r2/resched-keyboard2/f011.png"],["/home/user/JU/my-r2/evidence/C01/verify/r2/resched-keyboard2/f012.png"]]
labels=[["0 日期框内按 Esc","1 日 ↓ 一天","2 1× 改期后返回（旧日期行） 1/24 +0","3 1× 改期后返回（旧日期行） 6/24 +93","4 1× 改期后返回（旧日期行） 10/24 +157","5 1× 改期后返回（旧日期行） 15/24 +243"],["6 1× 改期后返回（旧日期行） 19/24 +306","7 1× 改期后返回（旧日期行） 24/24 +406","8 返回 +0.45s","9 返回 +1s","10 返回 +1.9s","11 年 ↑（跨年）"],["12 今天 09:00（已过）"]]
sc=0.4; gap=6; lab=18
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
sh.save("/home/user/JU/my-r2/evidence/C01/verify/r2/resched-keyboard2/sheet.png",optimize=True)

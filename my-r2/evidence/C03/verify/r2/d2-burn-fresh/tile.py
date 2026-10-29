from PIL import Image, ImageDraw, ImageOps
import os
rows=[["/home/user/JU/my-r2/evidence/C03/verify/r2/d2-burn-fresh/000-livehouse_reply_fresh_page_.png"],["/home/user/JU/my-r2/evidence/C03/verify/r2/d2-burn-fresh/001-burn_B_fresh_1x.jpg","/home/user/JU/my-r2/evidence/C03/verify/r2/d2-burn-fresh/002-burn_B_fresh_1x.jpg","/home/user/JU/my-r2/evidence/C03/verify/r2/d2-burn-fresh/003-burn_B_fresh_1x.jpg","/home/user/JU/my-r2/evidence/C03/verify/r2/d2-burn-fresh/004-burn_B_fresh_1x.jpg","/home/user/JU/my-r2/evidence/C03/verify/r2/d2-burn-fresh/005-burn_B_fresh_1x.jpg","/home/user/JU/my-r2/evidence/C03/verify/r2/d2-burn-fresh/006-burn_B_fresh_1x.jpg"],["/home/user/JU/my-r2/evidence/C03/verify/r2/d2-burn-fresh/007-burn_B_fresh_1x.jpg","/home/user/JU/my-r2/evidence/C03/verify/r2/d2-burn-fresh/008-burn_B_fresh_1x.jpg","/home/user/JU/my-r2/evidence/C03/verify/r2/d2-burn-fresh/009-burn_B_fresh_1x.jpg","/home/user/JU/my-r2/evidence/C03/verify/r2/d2-burn-fresh/010-burn_B_fresh_1x.jpg","/home/user/JU/my-r2/evidence/C03/verify/r2/d2-burn-fresh/011-burn_B_fresh_1x.jpg","/home/user/JU/my-r2/evidence/C03/verify/r2/d2-burn-fresh/012-burn_B_fresh_1x.jpg"],["/home/user/JU/my-r2/evidence/C03/verify/r2/d2-burn-fresh/013-burn_B_fresh_1x.jpg","/home/user/JU/my-r2/evidence/C03/verify/r2/d2-burn-fresh/014-burn_B_fresh_1x.jpg","/home/user/JU/my-r2/evidence/C03/verify/r2/d2-burn-fresh/015-burn_B_fresh_1x.jpg","/home/user/JU/my-r2/evidence/C03/verify/r2/d2-burn-fresh/016-burn_B_fresh_1x.jpg","/home/user/JU/my-r2/evidence/C03/verify/r2/d2-burn-fresh/017-burn_B_fresh_1x.jpg","/home/user/JU/my-r2/evidence/C03/verify/r2/d2-burn-fresh/018-burn_B_fresh_1x.jpg"],["/home/user/JU/my-r2/evidence/C03/verify/r2/d2-burn-fresh/019-burn_B_fresh_1x.jpg","/home/user/JU/my-r2/evidence/C03/verify/r2/d2-burn-fresh/020-burn_B_fresh_1x.jpg"]]
labels=[["livehouse reply (fresh page)"],["burn B fresh 1x 1/131 +0","burn B fresh 1x 8/131 +730","burn B fresh 1x 15/131 +980","burn B fresh 1x 22/131 +1340","burn B fresh 1x 28/131 +1658","burn B fresh 1x 35/131 +1920"],["burn B fresh 1x 42/131 +2260","burn B fresh 1x 49/131 +2561","burn B fresh 1x 56/131 +2871","burn B fresh 1x 63/131 +3288","burn B fresh 1x 69/131 +3560","burn B fresh 1x 76/131 +3939"],["burn B fresh 1x 83/131 +4149","burn B fresh 1x 90/131 +4400","burn B fresh 1x 97/131 +4716","burn B fresh 1x 104/131 +4916","burn B fresh 1x 110/131 +5040","burn B fresh 1x 117/131 +5199"],["burn B fresh 1x 124/131 +5561","burn B fresh 1x 131/131 +5689"]]
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
sh.save("/home/user/JU/my-r2/evidence/C03/verify/r2/d2-burn-fresh/sheet.png",optimize=True)

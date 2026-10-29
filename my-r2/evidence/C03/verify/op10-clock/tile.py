from PIL import Image, ImageDraw, ImageOps
import os
rows=[["/home/user/JU/my-r2/evidence/C03/verify/op10-clock/000-j-home_还在等_visible.png"],["/home/user/JU/my-r2/evidence/C03/verify/op10-clock/001-panel_到最近到期_1_.jpg","/home/user/JU/my-r2/evidence/C03/verify/op10-clock/002-panel_到最近到期_1_.jpg"],["/home/user/JU/my-r2/evidence/C03/verify/op10-clock/003-after_due_1.png","/home/user/JU/my-r2/evidence/C03/verify/op10-clock/004-after_due_2.png","/home/user/JU/my-r2/evidence/C03/verify/op10-clock/005-j-home_top_after_due_2.png","/home/user/JU/my-r2/evidence/C03/verify/op10-clock/006-hosted_after_dues.png","/home/user/JU/my-r2/evidence/C03/verify/op10-clock/007-cards_manage_after_dues.png","/home/user/JU/my-r2/evidence/C03/verify/op10-clock/008-cards_manage_scrolled.png"],["/home/user/JU/my-r2/evidence/C03/verify/op10-clock/009-panel_24_小时.jpg","/home/user/JU/my-r2/evidence/C03/verify/op10-clock/010-panel_24_小时.jpg","/home/user/JU/my-r2/evidence/C03/verify/op10-clock/011-panel_24_小时.jpg","/home/user/JU/my-r2/evidence/C03/verify/op10-clock/012-panel_24_小时.jpg","/home/user/JU/my-r2/evidence/C03/verify/op10-clock/013-panel_24_小时.jpg","/home/user/JU/my-r2/evidence/C03/verify/op10-clock/014-panel_24_小时.jpg"],["/home/user/JU/my-r2/evidence/C03/verify/op10-clock/015-panel_24_小时.jpg","/home/user/JU/my-r2/evidence/C03/verify/op10-clock/016-panel_24_小时.jpg","/home/user/JU/my-r2/evidence/C03/verify/op10-clock/017-panel_24_小时.jpg","/home/user/JU/my-r2/evidence/C03/verify/op10-clock/018-panel_24_小时.jpg"],["/home/user/JU/my-r2/evidence/C03/verify/op10-clock/019-museum_manage_after_24h.png"]]
labels=[["j-home 还在等 visible"],["panel 到最近到期 (1) 1/2 +0","panel 到最近到期 (1) 2/2 +1839"],["after due 1","after due 2","j-home top after due 2","hosted after dues","cards manage after dues","cards manage scrolled"],["panel +24 小时 1/11 +0","panel +24 小时 2/11 +39","panel +24 小时 3/11 +63","panel +24 小时 4/11 +90","panel +24 小时 5/11 +120","panel +24 小时 7/11 +180"],["panel +24 小时 8/11 +207","panel +24 小时 9/11 +226","panel +24 小时 10/11 +257","panel +24 小时 11/11 +356"],["museum manage after +24h"]]
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
sh.save("/home/user/JU/my-r2/evidence/C03/verify/op10-clock/sheet.png",optimize=True)

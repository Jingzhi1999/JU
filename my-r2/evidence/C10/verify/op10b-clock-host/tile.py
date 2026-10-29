from PIL import Image, ImageDraw, ImageOps
import os
rows=[["/home/user/JU/my-r2/evidence/C10/verify/op10b-clock-host/000-cards_before_clock.png","/home/user/JU/my-r2/evidence/C10/verify/op10b-clock-host/001-cards_after_clock.png","/home/user/JU/my-r2/evidence/C10/verify/op10b-clock-host/002-cards_after_clock_lower.png","/home/user/JU/my-r2/evidence/C10/verify/op10b-clock-host/003-joined_after_clock.png","/home/user/JU/my-r2/evidence/C10/verify/op10b-clock-host/004-joined_history_after_clock.png"]]
labels=[["cards before clock","cards after clock","cards after clock lower","joined after clock","joined history after clock"]]
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
sh.save("/home/user/JU/my-r2/evidence/C10/verify/op10b-clock-host/sheet.png",optimize=True)

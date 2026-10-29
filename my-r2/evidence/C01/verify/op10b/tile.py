from PIL import Image, ImageDraw, ImageOps
import os
rows=[["/home/user/JU/my-r2/evidence/C01/verify/op10b/f000.png","/home/user/JU/my-r2/evidence/C01/verify/op10b/f001.png","/home/user/JU/my-r2/evidence/C01/verify/op10b/f002.jpg","/home/user/JU/my-r2/evidence/C01/verify/op10b/f003.png","/home/user/JU/my-r2/evidence/C01/verify/op10b/f004.png","/home/user/JU/my-r2/evidence/C01/verify/op10b/f005.png"],["/home/user/JU/my-r2/evidence/C01/verify/op10b/f006.png","/home/user/JU/my-r2/evidence/C01/verify/op10b/f007.png"]]
labels=[["0 阅读层(预留剩 4h20)","1 +5h 阅读层中到期","2 到期后主按钮 1/1 +0","3 到期后列表","4 参加者历史 到期后","5 德州扑克 +5h"],["6 德州扑克 再到最近到期","7 德州扑克 下段"]]
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
sh.save("/home/user/JU/my-r2/evidence/C01/verify/op10b/sheet.png",optimize=True)

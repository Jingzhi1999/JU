from PIL import Image, ImageDraw, ImageOps
import os
rows=[["/home/user/JU/my-r2/evidence/C01/verify/op12b/f000.png","/home/user/JU/my-r2/evidence/C01/verify/op12b/f001.png","/home/user/JU/my-r2/evidence/C01/verify/op12b/f002.png","/home/user/JU/my-r2/evidence/C01/verify/op12b/f003.png","/home/user/JU/my-r2/evidence/C01/verify/op12b/f004.png","/home/user/JU/my-r2/evidence/C01/verify/op12b/f005.png"],["/home/user/JU/my-r2/evidence/C01/verify/op12b/f006.png","/home/user/JU/my-r2/evidence/C01/verify/op12b/f007.png","/home/user/JU/my-r2/evidence/C01/verify/op12b/f008.png","/home/user/JU/my-r2/evidence/C01/verify/op12b/f009.png","/home/user/JU/my-r2/evidence/C01/verify/op12b/f010.png","/home/user/JU/my-r2/evidence/C01/verify/op12b/f011.png"]]
labels=[["0 退出确认层","1 燃烧中 暂停","2 燃烧暂停 +1s","3 燃烧 关键帧 0","4 燃烧 关键帧 35","5 燃烧 关键帧 70"],["6 燃烧 关键帧 100","7 燃烧 释放 +2.5s","8 燃烧结束","9 结束后拖关键帧 30","10 结束后 关键帧 80","11 结束后 释放 +6s"]]
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
sh.save("/home/user/JU/my-r2/evidence/C01/verify/op12b/sheet.png",optimize=True)

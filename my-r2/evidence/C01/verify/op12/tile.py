from PIL import Image, ImageDraw, ImageOps
import os
rows=[["/home/user/JU/my-r2/evidence/C01/verify/op12/f000.png","/home/user/JU/my-r2/evidence/C01/verify/op12/f001.png","/home/user/JU/my-r2/evidence/C01/verify/op12/f002.png","/home/user/JU/my-r2/evidence/C01/verify/op12/f003.png","/home/user/JU/my-r2/evidence/C01/verify/op12/f004.png","/home/user/JU/my-r2/evidence/C01/verify/op12/f005.png"],["/home/user/JU/my-r2/evidence/C01/verify/op12/f006.png","/home/user/JU/my-r2/evidence/C01/verify/op12/f007.png","/home/user/JU/my-r2/evidence/C01/verify/op12/f008.png","/home/user/JU/my-r2/evidence/C01/verify/op12/f009.png","/home/user/JU/my-r2/evidence/C01/verify/op12/f010.png","/home/user/JU/my-r2/evidence/C01/verify/op12/f011.png"],["/home/user/JU/my-r2/evidence/C01/verify/op12/f012.png","/home/user/JU/my-r2/evidence/C01/verify/op12/f013.png","/home/user/JU/my-r2/evidence/C01/verify/op12/f014.png","/home/user/JU/my-r2/evidence/C01/verify/op12/f015.png","/home/user/JU/my-r2/evidence/C01/verify/op12/f016.png"]]
labels=[["0 导航中 暂停","1 暂停 +0.7s","2 关键帧 0","3 关键帧 50","4 关键帧 100","5 释放后"],["6 燃烧中 暂停","7 燃烧暂停 +0.9s","8 燃烧 关键帧 0","9 燃烧 关键帧 35","10 燃烧 关键帧 70","11 燃烧 关键帧 100"],["12 燃烧 释放 +2.5s","13 燃烧结束","14 结束后拖关键帧 30（应自动重播）","15 结束后 关键帧 80","16 结束后 释放 +5s"]]
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
sh.save("/home/user/JU/my-r2/evidence/C01/verify/op12/sheet.png",optimize=True)

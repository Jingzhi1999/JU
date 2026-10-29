from PIL import Image, ImageDraw, ImageOps
import os
rows=[["/home/user/JU/my-r2/evidence/C01/verify/op11-sizes/f000.png","/home/user/JU/my-r2/evidence/C01/verify/op11-sizes/f001.png","/home/user/JU/my-r2/evidence/C01/verify/op11-sizes/f002.png","/home/user/JU/my-r2/evidence/C01/verify/op11-sizes/f003.png","/home/user/JU/my-r2/evidence/C01/verify/op11-sizes/f004.png","/home/user/JU/my-r2/evidence/C01/verify/op11-sizes/f005.png"],["/home/user/JU/my-r2/evidence/C01/verify/op11-sizes/f006.png","/home/user/JU/my-r2/evidence/C01/verify/op11-sizes/f007.png","/home/user/JU/my-r2/evidence/C01/verify/op11-sizes/f008.png","/home/user/JU/my-r2/evidence/C01/verify/op11-sizes/f009.png","/home/user/JU/my-r2/evidence/C01/verify/op11-sizes/f010.png","/home/user/JU/my-r2/evidence/C01/verify/op11-sizes/f011.png"],["/home/user/JU/my-r2/evidence/C01/verify/op11-sizes/f012.png","/home/user/JU/my-r2/evidence/C01/verify/op11-sizes/f013.png","/home/user/JU/my-r2/evidence/C01/verify/op11-sizes/f014.png","/home/user/JU/my-r2/evidence/C01/verify/op11-sizes/f015.png","/home/user/JU/my-r2/evidence/C01/verify/op11-sizes/f016.png","/home/user/JU/my-r2/evidence/C01/verify/op11-sizes/f017.png"]]
labels=[["0 360 参加者","1 360 局主","2 360 票根","3 430 参加者","4 430 局主","5 115% 参加者"],["6 115% 局主","7 115% 管理","8 115% 票根","9 键盘态 改时间","10 散场历史","11 局内记录层"],["12 键盘态 局内记录 3字","13 键盘态 局内记录 够字","14 记录提交后","15 安全区 散场历史","16 安全区 列表","17 安全区 当前"]]
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
sh.save("/home/user/JU/my-r2/evidence/C01/verify/op11-sizes/sheet.png",optimize=True)

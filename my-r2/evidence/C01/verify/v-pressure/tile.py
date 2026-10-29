from PIL import Image, ImageDraw, ImageOps
import os
rows=[["/home/user/JU/my-r2/evidence/C01/verify/v-pressure/f000.png","/home/user/JU/my-r2/evidence/C01/verify/v-pressure/f001.png","/home/user/JU/my-r2/evidence/C01/verify/v-pressure/f002.png","/home/user/JU/my-r2/evidence/C01/verify/v-pressure/f003.png","/home/user/JU/my-r2/evidence/C01/verify/v-pressure/f004.png","/home/user/JU/my-r2/evidence/C01/verify/v-pressure/f005.png","/home/user/JU/my-r2/evidence/C01/verify/v-pressure/f006.png"],["/home/user/JU/my-r2/evidence/C01/verify/v-pressure/f007.png","/home/user/JU/my-r2/evidence/C01/verify/v-pressure/f008.png","/home/user/JU/my-r2/evidence/C01/verify/v-pressure/f009.png","/home/user/JU/my-r2/evidence/C01/verify/v-pressure/f010.png","/home/user/JU/my-r2/evidence/C01/verify/v-pressure/f011.png"]]
labels=[["0 b-long 参加者","1 b-long-h 局主","2 j-many","3 j-many 下滚700","4 h-pending","5 j-history-many","6 h-history-many"],["7 h-drafts-many","8 RM j-home","9 RM j-d-tear","10 RM h-m-attendance","11 RM j-d-ended"]]
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
sh.save("/home/user/JU/my-r2/evidence/C01/verify/v-pressure/sheet.png",optimize=True)

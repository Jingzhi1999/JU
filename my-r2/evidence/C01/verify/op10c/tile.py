from PIL import Image, ImageDraw, ImageOps
import os
rows=[["/home/user/JU/my-r2/evidence/C01/verify/op10c/f000.png","/home/user/JU/my-r2/evidence/C01/verify/op10c/f001.jpg","/home/user/JU/my-r2/evidence/C01/verify/op10c/f002.jpg","/home/user/JU/my-r2/evidence/C01/verify/op10c/f003.jpg","/home/user/JU/my-r2/evidence/C01/verify/op10c/f004.jpg","/home/user/JU/my-r2/evidence/C01/verify/op10c/f005.jpg"],["/home/user/JU/my-r2/evidence/C01/verify/op10c/f006.jpg","/home/user/JU/my-r2/evidence/C01/verify/op10c/f007.jpg","/home/user/JU/my-r2/evidence/C01/verify/op10c/f008.jpg","/home/user/JU/my-r2/evidence/C01/verify/op10c/f009.jpg","/home/user/JU/my-r2/evidence/C01/verify/op10c/f010.jpg","/home/user/JU/my-r2/evidence/C01/verify/op10c/f011.png"],["/home/user/JU/my-r2/evidence/C01/verify/op10c/f012.png","/home/user/JU/my-r2/evidence/C01/verify/op10c/f013.png","/home/user/JU/my-r2/evidence/C01/verify/op10c/f014.png","/home/user/JU/my-r2/evidence/C01/verify/op10c/f015.png"]]
labels=[["0 到期后读到末尾","1 到期后点确认入局 1/46 +0","2 到期后点确认入局 6/46 +112","3 到期后点确认入局 11/46 +188","4 到期后点确认入局 16/46 +276","5 到期后点确认入局 21/46 +369"],["6 到期后点确认入局 26/46 +445","7 到期后点确认入局 31/46 +540","8 到期后点确认入局 36/46 +640","9 到期后点确认入局 41/46 +804","10 到期后点确认入局 46/46 +928","11 到期后确认结果"],["12 参加者历史","13 德州扑克 +5h","14 德州扑克 再到最近到期","15 德州扑克 下段"]]
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
sh.save("/home/user/JU/my-r2/evidence/C01/verify/op10c/sheet.png",optimize=True)

from PIL import Image, ImageDraw, ImageOps
import os
rows=[["/home/user/JU/my-r2/evidence/C01/verify/op11-variants/f000.png","/home/user/JU/my-r2/evidence/C01/verify/op11-variants/f001.png","/home/user/JU/my-r2/evidence/C01/verify/op11-variants/f002.png","/home/user/JU/my-r2/evidence/C01/verify/op11-variants/f003.png","/home/user/JU/my-r2/evidence/C01/verify/op11-variants/f004.png","/home/user/JU/my-r2/evidence/C01/verify/op11-variants/f005.png","/home/user/JU/my-r2/evidence/C01/verify/op11-variants/f006.png"],["/home/user/JU/my-r2/evidence/C01/verify/op11-variants/f007.png","/home/user/JU/my-r2/evidence/C01/verify/op11-variants/f008.png","/home/user/JU/my-r2/evidence/C01/verify/op11-variants/f009.png","/home/user/JU/my-r2/evidence/C01/verify/op11-variants/f010.png","/home/user/JU/my-r2/evidence/C01/verify/op11-variants/f011.png","/home/user/JU/my-r2/evidence/C01/verify/op11-variants/f012.png","/home/user/JU/my-r2/evidence/C01/verify/op11-variants/f013.png"]]
labels=[["0 empty 参加者","1 empty 局主","2 single 参加者","3 single 局主","4 drafts 参加者","5 drafts 局主","6 pending 参加者"],["7 pending 局主","8 many 参加者","9 many 局主","10 history 参加者","11 history 局主","12 long 参加者","13 long 局主"]]
sc=0.36; gap=6; lab=18
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
sh.save("/home/user/JU/my-r2/evidence/C01/verify/op11-variants/sheet.png",optimize=True)

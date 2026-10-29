from PIL import Image, ImageDraw, ImageOps
import os
rows=[["/home/user/JU/my-r2/evidence/C01/verify/op1b/f000.png","/home/user/JU/my-r2/evidence/C01/verify/op1b/f001.jpg","/home/user/JU/my-r2/evidence/C01/verify/op1b/f002.jpg","/home/user/JU/my-r2/evidence/C01/verify/op1b/f003.jpg","/home/user/JU/my-r2/evidence/C01/verify/op1b/f004.jpg","/home/user/JU/my-r2/evidence/C01/verify/op1b/f005.jpg","/home/user/JU/my-r2/evidence/C01/verify/op1b/f006.jpg"],["/home/user/JU/my-r2/evidence/C01/verify/op1b/f007.jpg","/home/user/JU/my-r2/evidence/C01/verify/op1b/f008.jpg","/home/user/JU/my-r2/evidence/C01/verify/op1b/f009.png","/home/user/JU/my-r2/evidence/C01/verify/op1b/f010.jpg","/home/user/JU/my-r2/evidence/C01/verify/op1b/f011.jpg","/home/user/JU/my-r2/evidence/C01/verify/op1b/f012.jpg","/home/user/JU/my-r2/evidence/C01/verify/op1b/f013.jpg"],["/home/user/JU/my-r2/evidence/C01/verify/op1b/f014.jpg","/home/user/JU/my-r2/evidence/C01/verify/op1b/f015.jpg","/home/user/JU/my-r2/evidence/C01/verify/op1b/f016.jpg","/home/user/JU/my-r2/evidence/C01/verify/op1b/f017.jpg","/home/user/JU/my-r2/evidence/C01/verify/op1b/f018.jpg","/home/user/JU/my-r2/evidence/C01/verify/op1b/f019.jpg","/home/user/JU/my-r2/evidence/C01/verify/op1b/f020.jpg"],["/home/user/JU/my-r2/evidence/C01/verify/op1b/f021.jpg","/home/user/JU/my-r2/evidence/C01/verify/op1b/f022.png","/home/user/JU/my-r2/evidence/C01/verify/op1b/f023.jpg","/home/user/JU/my-r2/evidence/C01/verify/op1b/f024.jpg","/home/user/JU/my-r2/evidence/C01/verify/op1b/f025.jpg","/home/user/JU/my-r2/evidence/C01/verify/op1b/f026.jpg","/home/user/JU/my-r2/evidence/C01/verify/op1b/f027.jpg"],["/home/user/JU/my-r2/evidence/C01/verify/op1b/f028.jpg"]]
labels=[["0 参加者 列表底","1 收拢态 首次切到局主 1/17 +0","2 收拢态 首次切到局主 3/17 +35","3 收拢态 首次切到局主 6/17 +71","4 收拢态 首次切到局主 8/17 +100","5 收拢态 首次切到局主 10/17 +134","6 收拢态 首次切到局主 12/17 +167"],["7 收拢态 首次切到局主 15/17 +218","8 收拢态 首次切到局主 17/17 +251","9 局主 首次进入","10 切回参加者 1/13 +0","11 切回参加者 3/13 +24","12 切回参加者 6/13 +70","13 切回参加者 8/13 +104"],["14 切回参加者 11/13 +155","15 切回参加者 13/13 +265","16 收拢态 首次切到历史 1/12 +0","17 收拢态 首次切到历史 3/12 +22","18 收拢态 首次切到历史 5/12 +54","19 收拢态 首次切到历史 8/12 +104","20 收拢态 首次切到历史 10/12 +139"],["21 收拢态 首次切到历史 12/12 +173","22 历史 首次进入","23 回到当前 1/13 +0","24 回到当前 3/13 +27","25 回到当前 6/13 +66","26 回到当前 8/13 +100","27 回到当前 11/13 +150"],["28 回到当前 13/13 +278"]]
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
sh.save("/home/user/JU/my-r2/evidence/C01/verify/op1b/sheet.png",optimize=True)

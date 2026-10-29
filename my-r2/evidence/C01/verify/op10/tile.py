from PIL import Image, ImageDraw, ImageOps
import os
rows=[["/home/user/JU/my-r2/evidence/C01/verify/op10/f000.png","/home/user/JU/my-r2/evidence/C01/verify/op10/f001.png","/home/user/JU/my-r2/evidence/C01/verify/op10/f002.png","/home/user/JU/my-r2/evidence/C01/verify/op10/f003.png","/home/user/JU/my-r2/evidence/C01/verify/op10/f004.png","/home/user/JU/my-r2/evidence/C01/verify/op10/f005.jpg","/home/user/JU/my-r2/evidence/C01/verify/op10/f006.jpg"],["/home/user/JU/my-r2/evidence/C01/verify/op10/f007.jpg","/home/user/JU/my-r2/evidence/C01/verify/op10/f008.jpg","/home/user/JU/my-r2/evidence/C01/verify/op10/f009.jpg","/home/user/JU/my-r2/evidence/C01/verify/op10/f010.jpg","/home/user/JU/my-r2/evidence/C01/verify/op10/f011.png","/home/user/JU/my-r2/evidence/C01/verify/op10/f012.png","/home/user/JU/my-r2/evidence/C01/verify/op10/f013.png"],["/home/user/JU/my-r2/evidence/C01/verify/op10/f014.jpg","/home/user/JU/my-r2/evidence/C01/verify/op10/f015.jpg","/home/user/JU/my-r2/evidence/C01/verify/op10/f016.jpg","/home/user/JU/my-r2/evidence/C01/verify/op10/f017.jpg","/home/user/JU/my-r2/evidence/C01/verify/op10/f018.jpg","/home/user/JU/my-r2/evidence/C01/verify/op10/f019.jpg","/home/user/JU/my-r2/evidence/C01/verify/op10/f020.jpg"],["/home/user/JU/my-r2/evidence/C01/verify/op10/f021.jpg","/home/user/JU/my-r2/evidence/C01/verify/op10/f022.png","/home/user/JU/my-r2/evidence/C01/verify/op10/f023.png","/home/user/JU/my-r2/evidence/C01/verify/op10/f024.jpg","/home/user/JU/my-r2/evidence/C01/verify/op10/f025.jpg","/home/user/JU/my-r2/evidence/C01/verify/op10/f026.jpg","/home/user/JU/my-r2/evidence/C01/verify/op10/f027.jpg"],["/home/user/JU/my-r2/evidence/C01/verify/op10/f028.jpg","/home/user/JU/my-r2/evidence/C01/verify/op10/f029.jpg","/home/user/JU/my-r2/evidence/C01/verify/op10/f030.png"]]
labels=[["0 j-home","1 到最近到期(参加者)","2 再到最近到期","3 三到最近到期","4 局主侧 到期后","5 进 小酒馆(预留过期 候补补位) 1/23 +0","6 进 小酒馆(预留过期 候补补位) 5/23 +58"],["7 进 小酒馆(预留过期 候补补位) 10/23 +143","8 进 小酒馆(预留过期 候补补位) 14/23 +207","9 进 小酒馆(预留过期 候补补位) 19/23 +293","10 进 小酒馆(预留过期 候补补位) 23/23 +358","11 小酒馆 管理 到期后","12 小酒馆 管理 下","13 +24h 参加者"],["14 进 外百老汇(联系) 1/30 +0","15 进 外百老汇(联系) 5/30 +71","16 进 外百老汇(联系) 9/30 +138","17 进 外百老汇(联系) 13/30 +205","18 进 外百老汇(联系) 18/30 +287","19 进 外百老汇(联系) 22/30 +354","20 进 外百老汇(联系) 26/30 +419"],["21 进 外百老汇(联系) 30/30 +485","22 外百老汇 +24h","23 +24h 局主","24 进 看展搭子 1/24 +0","25 进 看展搭子 6/24 +100","26 进 看展搭子 10/24 +163","27 进 看展搭子 15/24 +244"],["28 进 看展搭子 19/24 +325","29 进 看展搭子 24/24 +409","30 看展搭子 +24h 联系关闭"]]
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
sh.save("/home/user/JU/my-r2/evidence/C01/verify/op10/sheet.png",optimize=True)

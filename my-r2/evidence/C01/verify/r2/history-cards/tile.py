from PIL import Image, ImageDraw, ImageOps
import os
rows=[["/home/user/JU/my-r2/evidence/C01/verify/r2/history-cards/f000.png","/home/user/JU/my-r2/evidence/C01/verify/r2/history-cards/f001.png","/home/user/JU/my-r2/evidence/C01/verify/r2/history-cards/f002.png","/home/user/JU/my-r2/evidence/C01/verify/r2/history-cards/f003.png","/home/user/JU/my-r2/evidence/C01/verify/r2/history-cards/f004.png","/home/user/JU/my-r2/evidence/C01/verify/r2/history-cards/f005.png"],["/home/user/JU/my-r2/evidence/C01/verify/r2/history-cards/f006.png","/home/user/JU/my-r2/evidence/C01/verify/r2/history-cards/f007.png","/home/user/JU/my-r2/evidence/C01/verify/r2/history-cards/f008.png","/home/user/JU/my-r2/evidence/C01/verify/r2/history-cards/f009.png","/home/user/JU/my-r2/evidence/C01/verify/r2/history-cards/f010.png"]]
labels=[["0 未通过 历史","1 退出候补 历史","2 散场 历史","3 放弃预留 结果","4 撤回 历史","5 放弃预留 历史"],["6 预留到期 历史","7 invite 局卡(详情 212)","8 street 局卡(详情 212)","9 改期返回 +420ms","10 改到过去时间"]]
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
sh.save("/home/user/JU/my-r2/evidence/C01/verify/r2/history-cards/sheet.png",optimize=True)

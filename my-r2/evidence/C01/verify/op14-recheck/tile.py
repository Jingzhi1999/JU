from PIL import Image, ImageDraw, ImageOps
import os
rows=[["/home/user/JU/my-r2/evidence/C01/verify/op14-recheck/f000.png","/home/user/JU/my-r2/evidence/C01/verify/op14-recheck/f001.png","/home/user/JU/my-r2/evidence/C01/verify/op14-recheck/f002.png","/home/user/JU/my-r2/evidence/C01/verify/op14-recheck/f003.png","/home/user/JU/my-r2/evidence/C01/verify/op14-recheck/f004.png"],["/home/user/JU/my-r2/evidence/C01/verify/op14-recheck/f005.png","/home/user/JU/my-r2/evidence/C01/verify/op14-recheck/f006.png","/home/user/JU/my-r2/evidence/C01/verify/op14-recheck/f007.png"]]
labels=[["0 退出候补结果","1 参加者历史(退出候补后)","2 古着淘货 历史","3 拒绝改期 燃烧后","4 拒绝改期 历史"],["5 阅读层 到期(新构建)","6 到期后点主按钮(新构建)","7 取消后(新构建)"]]
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
sh.save("/home/user/JU/my-r2/evidence/C01/verify/op14-recheck/sheet.png",optimize=True)

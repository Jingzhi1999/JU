from PIL import Image, ImageDraw, ImageOps
import os
rows=[["/home/user/JU/my-r2/evidence/C03/verify/op11-variants/000-完全空_A.png","/home/user/JU/my-r2/evidence/C03/verify/op11-variants/001-完全空_B_swapped_.png"],["/home/user/JU/my-r2/evidence/C03/verify/op11-variants/002-只有一场_A.png","/home/user/JU/my-r2/evidence/C03/verify/op11-variants/003-只有一场_B_swapped_.png"],["/home/user/JU/my-r2/evidence/C03/verify/op11-variants/004-只有草稿_A.png","/home/user/JU/my-r2/evidence/C03/verify/op11-variants/005-只有草稿_B_swapped_.png"],["/home/user/JU/my-r2/evidence/C03/verify/op11-variants/006-待处理较多_A.png","/home/user/JU/my-r2/evidence/C03/verify/op11-variants/007-待处理较多_B_swapped_.png"],["/home/user/JU/my-r2/evidence/C03/verify/op11-variants/008-当前较多_A.png","/home/user/JU/my-r2/evidence/C03/verify/op11-variants/009-当前较多_B_swapped_.png"],["/home/user/JU/my-r2/evidence/C03/verify/op11-variants/010-历史较多_A.png","/home/user/JU/my-r2/evidence/C03/verify/op11-variants/011-历史较多_B_swapped_.png"],["/home/user/JU/my-r2/evidence/C03/verify/op11-variants/012-长标题长地点_A.png","/home/user/JU/my-r2/evidence/C03/verify/op11-variants/013-长标题长地点_B_swapped_.png"]]
labels=[["完全空 A","完全空 B (swapped)"],["只有一场 A","只有一场 B (swapped)"],["只有草稿 A","只有草稿 B (swapped)"],["待处理较多 A","待处理较多 B (swapped)"],["当前较多 A","当前较多 B (swapped)"],["历史较多 A","历史较多 B (swapped)"],["长标题长地点 A","长标题长地点 B (swapped)"]]
sc=0.42; gap=6; lab=18
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
sh.save("/home/user/JU/my-r2/evidence/C03/verify/op11-variants/sheet.png",optimize=True)

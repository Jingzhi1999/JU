from PIL import Image, ImageDraw, ImageOps
import os
rows=[["/home/user/JU/my-r2/evidence/C01/stage1/widths/f00-w-360-j-home.png","/home/user/JU/my-r2/evidence/C01/stage1/widths/f01-w-360-h-home.png","/home/user/JU/my-r2/evidence/C01/stage1/widths/f02-w-360-j-d-tear.png","/home/user/JU/my-r2/evidence/C01/stage1/widths/f03-w-360-h-m-review.png"],["/home/user/JU/my-r2/evidence/C01/stage1/widths/f04-w-375-j-home.png","/home/user/JU/my-r2/evidence/C01/stage1/widths/f05-w-375-h-home.png","/home/user/JU/my-r2/evidence/C01/stage1/widths/f06-w-375-j-d-tear.png","/home/user/JU/my-r2/evidence/C01/stage1/widths/f07-w-375-h-m-review.png"],["/home/user/JU/my-r2/evidence/C01/stage1/widths/f08-w-390-j-home.png","/home/user/JU/my-r2/evidence/C01/stage1/widths/f09-w-390-h-home.png","/home/user/JU/my-r2/evidence/C01/stage1/widths/f10-w-390-j-d-tear.png","/home/user/JU/my-r2/evidence/C01/stage1/widths/f11-w-390-h-m-review.png"],["/home/user/JU/my-r2/evidence/C01/stage1/widths/f12-w-430-j-home.png","/home/user/JU/my-r2/evidence/C01/stage1/widths/f13-w-430-h-home.png","/home/user/JU/my-r2/evidence/C01/stage1/widths/f14-w-430-j-d-tear.png","/home/user/JU/my-r2/evidence/C01/stage1/widths/f15-w-430-h-m-review.png"],["/home/user/JU/my-r2/evidence/C01/stage1/widths/f16-zoom-390-j-home.png","/home/user/JU/my-r2/evidence/C01/stage1/widths/f17-zoom-390-h-home.png","/home/user/JU/my-r2/evidence/C01/stage1/widths/f18-zoom-390-j-d-tear.png","/home/user/JU/my-r2/evidence/C01/stage1/widths/f19-zoom-390-h-m-review.png"],["/home/user/JU/my-r2/evidence/C01/stage1/widths/f20-safe-390-j-home.png","/home/user/JU/my-r2/evidence/C01/stage1/widths/f21-safe-390-h-home.png","/home/user/JU/my-r2/evidence/C01/stage1/widths/f22-safe-390-j-d-tear.png","/home/user/JU/my-r2/evidence/C01/stage1/widths/f23-safe-390-h-m-review.png"]]
labels=[["w 360 j-home","w 360 h-home","w 360 j-d-tear","w 360 h-m-review"],["w 375 j-home","w 375 h-home","w 375 j-d-tear","w 375 h-m-review"],["w 390 j-home","w 390 h-home","w 390 j-d-tear","w 390 h-m-review"],["w 430 j-home","w 430 h-home","w 430 j-d-tear","w 430 h-m-review"],["zoom 390 j-home","zoom 390 h-home","zoom 390 j-d-tear","zoom 390 h-m-review"],["safe 390 j-home","safe 390 h-home","safe 390 j-d-tear","safe 390 h-m-review"]]
sc=0.46; gap=8; lab=18
ims=[[Image.open(f).convert('RGB') for f in r] for r in rows]
W=max(int(i.width*sc) for r in ims for i in r); H=max(int(i.height*sc) for r in ims for i in r); cols=max(len(r) for r in ims)
sh=Image.new('RGB',(cols*(W+gap)+gap, len(ims)*(H+gap+lab)+gap),(230,228,224))
d=ImageDraw.Draw(sh)
for ri,r in enumerate(ims):
    for ci,im in enumerate(r):
        x=gap+ci*(W+gap); y=gap+ri*(H+gap+lab)
        if labels and ri < len(labels) and ci < len(labels[ri]): d.text((x+2,y+2),str(labels[ri][ci]),fill=(230,230,230))
        sh.paste(im.resize((int(im.width*sc),int(im.height*sc)),Image.LANCZOS),(x,y+lab))
sh.save("/home/user/JU/my-r2/evidence/C01/stage1/widths/sheet.png",optimize=True)

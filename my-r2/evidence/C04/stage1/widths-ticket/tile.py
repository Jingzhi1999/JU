from PIL import Image, ImageDraw, ImageOps
import os
rows=[["/home/user/JU/my-r2/evidence/C04/stage1/widths-ticket/f00-w-360-j-d-tear.png","/home/user/JU/my-r2/evidence/C04/stage1/widths-ticket/f01-w-360-j-d-contact.png","/home/user/JU/my-r2/evidence/C04/stage1/widths-ticket/f02-w-360-j-d-reschedule.png"],["/home/user/JU/my-r2/evidence/C04/stage1/widths-ticket/f03-w-375-j-d-tear.png","/home/user/JU/my-r2/evidence/C04/stage1/widths-ticket/f04-w-375-j-d-contact.png","/home/user/JU/my-r2/evidence/C04/stage1/widths-ticket/f05-w-375-j-d-reschedule.png"],["/home/user/JU/my-r2/evidence/C04/stage1/widths-ticket/f06-w-390-j-d-tear.png","/home/user/JU/my-r2/evidence/C04/stage1/widths-ticket/f07-w-390-j-d-contact.png","/home/user/JU/my-r2/evidence/C04/stage1/widths-ticket/f08-w-390-j-d-reschedule.png"],["/home/user/JU/my-r2/evidence/C04/stage1/widths-ticket/f09-w-430-j-d-tear.png","/home/user/JU/my-r2/evidence/C04/stage1/widths-ticket/f10-w-430-j-d-contact.png","/home/user/JU/my-r2/evidence/C04/stage1/widths-ticket/f11-w-430-j-d-reschedule.png"],["/home/user/JU/my-r2/evidence/C04/stage1/widths-ticket/f12-zoom-390-j-d-tear.png","/home/user/JU/my-r2/evidence/C04/stage1/widths-ticket/f13-zoom-390-j-d-contact.png","/home/user/JU/my-r2/evidence/C04/stage1/widths-ticket/f14-zoom-390-j-d-reschedule.png"],["/home/user/JU/my-r2/evidence/C04/stage1/widths-ticket/f15-safe-390-j-d-tear.png","/home/user/JU/my-r2/evidence/C04/stage1/widths-ticket/f16-safe-390-j-d-contact.png","/home/user/JU/my-r2/evidence/C04/stage1/widths-ticket/f17-safe-390-j-d-reschedule.png"]]
labels=[["w 360 j-d-tear","w 360 j-d-contact","w 360 j-d-reschedule"],["w 375 j-d-tear","w 375 j-d-contact","w 375 j-d-reschedule"],["w 390 j-d-tear","w 390 j-d-contact","w 390 j-d-reschedule"],["w 430 j-d-tear","w 430 j-d-contact","w 430 j-d-reschedule"],["zoom 390 j-d-tear","zoom 390 j-d-contact","zoom 390 j-d-reschedule"],["safe 390 j-d-tear","safe 390 j-d-contact","safe 390 j-d-reschedule"]]
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
sh.save("/home/user/JU/my-r2/evidence/C04/stage1/widths-ticket/sheet.png",optimize=True)

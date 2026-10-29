from PIL import Image, ImageDraw, ImageOps
import os
rows=[["/home/user/JU/my-r2/evidence/C10/verify/op03b-kbfocus-back/000-after_keyboard_tear_+_Tab.png","/home/user/JU/my-r2/evidence/C10/verify/op03b-kbfocus-back/001-back_to_home_after_contact-1.jpg","/home/user/JU/my-r2/evidence/C10/verify/op03b-kbfocus-back/002-back_to_home_after_contact-6.jpg","/home/user/JU/my-r2/evidence/C10/verify/op03b-kbfocus-back/003-back_to_home_after_contact-12.jpg","/home/user/JU/my-r2/evidence/C10/verify/op03b-kbfocus-back/004-back_to_home_after_contact-17.jpg","/home/user/JU/my-r2/evidence/C10/verify/op03b-kbfocus-back/005-back_to_home_after_contact-22.jpg"],["/home/user/JU/my-r2/evidence/C10/verify/op03b-kbfocus-back/006-back_to_home_after_contact-27.jpg","/home/user/JU/my-r2/evidence/C10/verify/op03b-kbfocus-back/007-back_to_home_after_contact-33.jpg","/home/user/JU/my-r2/evidence/C10/verify/op03b-kbfocus-back/008-back_to_home_after_contact-38.jpg","/home/user/JU/my-r2/evidence/C10/verify/op03b-kbfocus-back/009-back_to_home_after_contact-43.jpg","/home/user/JU/my-r2/evidence/C10/verify/op03b-kbfocus-back/010-back_to_home_after_contact-48.jpg","/home/user/JU/my-r2/evidence/C10/verify/op03b-kbfocus-back/011-back_to_home_after_contact-54.jpg"],["/home/user/JU/my-r2/evidence/C10/verify/op03b-kbfocus-back/012-back_to_home_after_contact-59.jpg","/home/user/JU/my-r2/evidence/C10/verify/op03b-kbfocus-back/013-back_to_home_after_contact-64.jpg","/home/user/JU/my-r2/evidence/C10/verify/op03b-kbfocus-back/014-back_to_home_after_contact-69.jpg","/home/user/JU/my-r2/evidence/C10/verify/op03b-kbfocus-back/015-back_to_home_after_contact-75.jpg","/home/user/JU/my-r2/evidence/C10/verify/op03b-kbfocus-back/016-back_to_home_after_contact-80.jpg","/home/user/JU/my-r2/evidence/C10/verify/op03b-kbfocus-back/017-home_after_contact.png"],["/home/user/JU/my-r2/evidence/C10/verify/op03b-kbfocus-back/018-home_settled.png"]]
labels=[["after keyboard tear + Tab","back to home after contact 1/80 +0ms","back to home after contact 6/80 +230ms","back to home after contact 12/80 +352ms","back to home after contact 17/80 +469ms","back to home after contact 22/80 +564ms"],["back to home after contact 27/80 +654ms","back to home after contact 33/80 +779ms","back to home after contact 38/80 +893ms","back to home after contact 43/80 +999ms","back to home after contact 48/80 +1083ms","back to home after contact 54/80 +1189ms"],["back to home after contact 59/80 +1289ms","back to home after contact 64/80 +1391ms","back to home after contact 69/80 +1493ms","back to home after contact 75/80 +1623ms","back to home after contact 80/80 +2596ms","home after contact"],["home settled"]]
sc=0.5; gap=6; lab=18
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
sh.save("/home/user/JU/my-r2/evidence/C10/verify/op03b-kbfocus-back/sheet.png",optimize=True)

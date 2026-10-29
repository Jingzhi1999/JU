from PIL import Image, ImageDraw, ImageOps
import os
rows=[["/home/user/JU/my-r2/evidence/C10/verify/visual/000-j-home-cotton.png","/home/user/JU/my-r2/evidence/C10/verify/visual/001-h-home-cotton.png","/home/user/JU/my-r2/evidence/C10/verify/visual/002-j-home-halo.png","/home/user/JU/my-r2/evidence/C10/verify/visual/003-h-home-halo.png","/home/user/JU/my-r2/evidence/C10/verify/visual/004-j-home-sunset.png","/home/user/JU/my-r2/evidence/C10/verify/visual/005-h-home-sunset.png"],["/home/user/JU/my-r2/evidence/C10/verify/visual/006-detail-gathering.png","/home/user/JU/my-r2/evidence/C10/verify/visual/007-detail-going.png","/home/user/JU/my-r2/evidence/C10/verify/visual/008-manage-review.png","/home/user/JU/my-r2/evidence/C10/verify/visual/009-manage-members.png","/home/user/JU/my-r2/evidence/C10/verify/visual/010-manage-attendance.png","/home/user/JU/my-r2/evidence/C10/verify/visual/011-j-history-list.png"],["/home/user/JU/my-r2/evidence/C10/verify/visual/012-h-history-list.png","/home/user/JU/my-r2/evidence/C10/verify/visual/013-history-ended.png","/home/user/JU/my-r2/evidence/C10/verify/visual/014-history-cancelled.png","/home/user/JU/my-r2/evidence/C10/verify/visual/015-empty-joined.png","/home/user/JU/my-r2/evidence/C10/verify/visual/016-empty-hosted.png","/home/user/JU/my-r2/evidence/C10/verify/visual/017-sheet-cancel.png"],["/home/user/JU/my-r2/evidence/C10/verify/visual/018-sheet-withdraw.png","/home/user/JU/my-r2/evidence/C10/verify/visual/019-ticket-tear.png","/home/user/JU/my-r2/evidence/C10/verify/visual/020-card-full.png","/home/user/JU/my-r2/evidence/C10/verify/visual/021-rm-j-home.png","/home/user/JU/my-r2/evidence/C10/verify/visual/022-rm-manage-review.png"]]
labels=[["j-home-cotton","h-home-cotton","j-home-halo","h-home-halo","j-home-sunset","h-home-sunset"],["detail-gathering","detail-going","manage-review","manage-members","manage-attendance","j-history-list"],["h-history-list","history-ended","history-cancelled","empty-joined","empty-hosted","sheet-cancel"],["sheet-withdraw","ticket-tear","card-full","rm-j-home","rm-manage-review"]]
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
sh.save("/home/user/JU/my-r2/evidence/C10/verify/visual/sheet.png",optimize=True)

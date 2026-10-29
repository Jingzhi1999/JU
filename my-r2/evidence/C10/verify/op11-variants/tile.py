from PIL import Image, ImageDraw, ImageOps
import os
rows=[["/home/user/JU/my-r2/evidence/C10/verify/op11-variants/000-empty-joined.png","/home/user/JU/my-r2/evidence/C10/verify/op11-variants/001-empty-hosted.png","/home/user/JU/my-r2/evidence/C10/verify/op11-variants/002-single-joined.png","/home/user/JU/my-r2/evidence/C10/verify/op11-variants/003-single-hosted.png","/home/user/JU/my-r2/evidence/C10/verify/op11-variants/004-drafts-joined.png","/home/user/JU/my-r2/evidence/C10/verify/op11-variants/005-drafts-hosted.png"],["/home/user/JU/my-r2/evidence/C10/verify/op11-variants/006-pending-joined.png","/home/user/JU/my-r2/evidence/C10/verify/op11-variants/007-pending-hosted.png","/home/user/JU/my-r2/evidence/C10/verify/op11-variants/008-many-joined.png","/home/user/JU/my-r2/evidence/C10/verify/op11-variants/009-many-hosted.png","/home/user/JU/my-r2/evidence/C10/verify/op11-variants/010-history-joined.png","/home/user/JU/my-r2/evidence/C10/verify/op11-variants/011-history-hosted.png"],["/home/user/JU/my-r2/evidence/C10/verify/op11-variants/012-long-joined.png","/home/user/JU/my-r2/evidence/C10/verify/op11-variants/013-long-hosted.png","/home/user/JU/my-r2/evidence/C10/verify/op11-variants/014-360-joined.png","/home/user/JU/my-r2/evidence/C10/verify/op11-variants/015-360-hosted.png","/home/user/JU/my-r2/evidence/C10/verify/op11-variants/016-430-hosted.png","/home/user/JU/my-r2/evidence/C10/verify/op11-variants/017-430-joined.png"],["/home/user/JU/my-r2/evidence/C10/verify/op11-variants/018-zoom115-joined.png","/home/user/JU/my-r2/evidence/C10/verify/op11-variants/019-zoom115-hosted.png","/home/user/JU/my-r2/evidence/C10/verify/op11-variants/020-safe-hosted.png","/home/user/JU/my-r2/evidence/C10/verify/op11-variants/021-safe-joined.png","/home/user/JU/my-r2/evidence/C10/verify/op11-variants/022-kb-reschedule.png","/home/user/JU/my-r2/evidence/C10/verify/op11-variants/023-kb-record.png"]]
labels=[["empty-joined","empty-hosted","single-joined","single-hosted","drafts-joined","drafts-hosted"],["pending-joined","pending-hosted","many-joined","many-hosted","history-joined","history-hosted"],["long-joined","long-hosted","360-joined","360-hosted","430-hosted","430-joined"],["zoom115-joined","zoom115-hosted","safe-hosted","safe-joined","kb-reschedule","kb-record"]]
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
sh.save("/home/user/JU/my-r2/evidence/C10/verify/op11-variants/sheet.png",optimize=True)

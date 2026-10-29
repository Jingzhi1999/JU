from PIL import Image, ImageDraw, ImageOps
import os
rows=[["/home/user/JU/my-r2/evidence/C10/verify/op09-drafts/000-only-drafts_joined.png","/home/user/JU/my-r2/evidence/C10/verify/op09-drafts/001-only-drafts_hosted_empty.png","/home/user/JU/my-r2/evidence/C10/verify/op09-drafts/002-to_drafts-1.jpg","/home/user/JU/my-r2/evidence/C10/verify/op09-drafts/003-to_drafts-4.jpg","/home/user/JU/my-r2/evidence/C10/verify/op09-drafts/004-to_drafts-6.jpg","/home/user/JU/my-r2/evidence/C10/verify/op09-drafts/005-to_drafts-9.jpg"],["/home/user/JU/my-r2/evidence/C10/verify/op09-drafts/006-to_drafts-12.jpg","/home/user/JU/my-r2/evidence/C10/verify/op09-drafts/007-to_drafts-15.jpg","/home/user/JU/my-r2/evidence/C10/verify/op09-drafts/008-to_drafts-17.jpg","/home/user/JU/my-r2/evidence/C10/verify/op09-drafts/009-to_drafts-20.jpg","/home/user/JU/my-r2/evidence/C10/verify/op09-drafts/010-drafts_list.png","/home/user/JU/my-r2/evidence/C10/verify/op09-drafts/011-delete_first_draft_no_paint_.png"],["/home/user/JU/my-r2/evidence/C10/verify/op09-drafts/012-deleted_+_undo_bar.png","/home/user/JU/my-r2/evidence/C10/verify/op09-drafts/013-undo_no_paint_.png","/home/user/JU/my-r2/evidence/C10/verify/op09-drafts/014-restored.png","/home/user/JU/my-r2/evidence/C10/verify/op09-drafts/015-deleted_again_t0.png","/home/user/JU/my-r2/evidence/C10/verify/op09-drafts/016-t+5s.png","/home/user/JU/my-r2/evidence/C10/verify/op09-drafts/017-t+10.6s_gone.png"]]
labels=[["only-drafts joined","only-drafts hosted empty","to drafts 1/20 +0ms","to drafts 4/20 +60ms","to drafts 6/20 +92ms","to drafts 9/20 +140ms"],["to drafts 12/20 +190ms","to drafts 15/20 +239ms","to drafts 17/20 +278ms","to drafts 20/20 +328ms","drafts list","delete first draft (no paint)"],["deleted + undo bar","undo (no paint)","restored","deleted again t0","t+5s","t+10.6s gone"]]
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
sh.save("/home/user/JU/my-r2/evidence/C10/verify/op09-drafts/sheet.png",optimize=True)

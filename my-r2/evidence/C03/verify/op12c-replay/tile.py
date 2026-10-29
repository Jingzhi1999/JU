from PIL import Image, ImageDraw, ImageOps
import os
rows=[["/home/user/JU/my-r2/evidence/C03/verify/op12c-replay/000-burn_ended_naturally_9s_.png","/home/user/JU/my-r2/evidence/C03/verify/op12c-replay/001-scrub_17.png","/home/user/JU/my-r2/evidence/C03/verify/op12c-replay/002-scrub_33.png","/home/user/JU/my-r2/evidence/C03/verify/op12c-replay/003-scrub_50.png","/home/user/JU/my-r2/evidence/C03/verify/op12c-replay/004-scrub_67.png","/home/user/JU/my-r2/evidence/C03/verify/op12c-replay/005-scrub_83.png"],["/home/user/JU/my-r2/evidence/C03/verify/op12c-replay/006-scrub_100.png","/home/user/JU/my-r2/evidence/C03/verify/op12c-replay/007-act.png","/home/user/JU/my-r2/evidence/C03/verify/op12c-replay/008-released.png","/home/user/JU/my-r2/evidence/C03/verify/op12c-replay/009-after_release_1200.png","/home/user/JU/my-r2/evidence/C03/verify/op12c-replay/010-after_release_2400.png","/home/user/JU/my-r2/evidence/C03/verify/op12c-replay/011-after_release_3600.png"],["/home/user/JU/my-r2/evidence/C03/verify/op12c-replay/012-after_release_4800.png","/home/user/JU/my-r2/evidence/C03/verify/op12c-replay/013-after_release_6000.png"],["/home/user/JU/my-r2/evidence/C03/verify/op12c-replay/014-run3k_printed.png","/home/user/JU/my-r2/evidence/C03/verify/op12c-replay/015-scrub_20.png","/home/user/JU/my-r2/evidence/C03/verify/op12c-replay/016-scrub_40.png","/home/user/JU/my-r2/evidence/C03/verify/op12c-replay/017-scrub_60.png","/home/user/JU/my-r2/evidence/C03/verify/op12c-replay/018-scrub_80.png","/home/user/JU/my-r2/evidence/C03/verify/op12c-replay/019-scrub_100.png"],["/home/user/JU/my-r2/evidence/C03/verify/op12c-replay/020-act.png","/home/user/JU/my-r2/evidence/C03/verify/op12c-replay/021-print_released.png","/home/user/JU/my-r2/evidence/C03/verify/op12c-replay/022-after_print_release_800.png","/home/user/JU/my-r2/evidence/C03/verify/op12c-replay/023-after_print_release_1600.png","/home/user/JU/my-r2/evidence/C03/verify/op12c-replay/024-after_print_release_2400.png","/home/user/JU/my-r2/evidence/C03/verify/op12c-replay/025-after_print_release_3200.png"],["/home/user/JU/my-r2/evidence/C03/verify/op12c-replay/026-after_print_release_4000.png"]]
labels=[["burn ended naturally (+9s)","scrub 17","scrub 33","scrub 50","scrub 67","scrub 83"],["scrub 100","act","released","after release 1200","after release 2400","after release 3600"],["after release 4800","after release 6000"],["run3k printed","scrub 20","scrub 40","scrub 60","scrub 80","scrub 100"],["act","print released","after print release 800","after print release 1600","after print release 2400","after print release 3200"],["after print release 4000"]]
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
sh.save("/home/user/JU/my-r2/evidence/C03/verify/op12c-replay/sheet.png",optimize=True)

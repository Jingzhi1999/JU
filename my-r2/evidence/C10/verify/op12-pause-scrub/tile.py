from PIL import Image, ImageDraw, ImageOps
import os
rows=[["/home/user/JU/my-r2/evidence/C10/verify/op12-pause-scrub/000-paused_mid-enter.png","/home/user/JU/my-r2/evidence/C10/verify/op12-pause-scrub/001-scrub_0_100_17.png","/home/user/JU/my-r2/evidence/C10/verify/op12-pause-scrub/002-scrub_0_100_33.png","/home/user/JU/my-r2/evidence/C10/verify/op12-pause-scrub/003-scrub_0_100_50.png","/home/user/JU/my-r2/evidence/C10/verify/op12-pause-scrub/004-scrub_0_100_67.png","/home/user/JU/my-r2/evidence/C10/verify/op12-pause-scrub/005-scrub_0_100_83.png"],["/home/user/JU/my-r2/evidence/C10/verify/op12-pause-scrub/006-scrub_0_100_100.png","/home/user/JU/my-r2/evidence/C10/verify/op12-pause-scrub/007-released.png","/home/user/JU/my-r2/evidence/C10/verify/op12-pause-scrub/008-released_settled.png","/home/user/JU/my-r2/evidence/C10/verify/op12-pause-scrub/009-scrub_after_end_auto-replay_17.png","/home/user/JU/my-r2/evidence/C10/verify/op12-pause-scrub/010-scrub_after_end_auto-replay_33.png","/home/user/JU/my-r2/evidence/C10/verify/op12-pause-scrub/011-scrub_after_end_auto-replay_50.png"],["/home/user/JU/my-r2/evidence/C10/verify/op12-pause-scrub/012-scrub_after_end_auto-replay_67.png","/home/user/JU/my-r2/evidence/C10/verify/op12-pause-scrub/013-scrub_after_end_auto-replay_83.png","/home/user/JU/my-r2/evidence/C10/verify/op12-pause-scrub/014-scrub_after_end_auto-replay_100.png","/home/user/JU/my-r2/evidence/C10/verify/op12-pause-scrub/015-released_2.png"]]
labels=[["paused mid-enter","scrub 0→100 17","scrub 0→100 33","scrub 0→100 50","scrub 0→100 67","scrub 0→100 83"],["scrub 0→100 100","released","released settled","scrub after end (auto-replay?) 17","scrub after end (auto-replay?) 33","scrub after end (auto-replay?) 50"],["scrub after end (auto-replay?) 67","scrub after end (auto-replay?) 83","scrub after end (auto-replay?) 100","released 2"]]
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
sh.save("/home/user/JU/my-r2/evidence/C10/verify/op12-pause-scrub/sheet.png",optimize=True)

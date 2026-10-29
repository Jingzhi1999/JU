from PIL import Image, ImageDraw, ImageOps
import os
rows=[["/home/user/JU/my-r2/evidence/C03/verify/op15-interrupt/000-handle_tap_then_reverse_after_120ms.jpg","/home/user/JU/my-r2/evidence/C03/verify/op15-interrupt/001-handle_tap_then_reverse_after_120ms.jpg","/home/user/JU/my-r2/evidence/C03/verify/op15-interrupt/002-handle_tap_then_reverse_after_120ms.jpg","/home/user/JU/my-r2/evidence/C03/verify/op15-interrupt/003-handle_tap_then_reverse_after_120ms.jpg","/home/user/JU/my-r2/evidence/C03/verify/op15-interrupt/004-handle_tap_then_reverse_after_120ms.jpg","/home/user/JU/my-r2/evidence/C03/verify/op15-interrupt/005-handle_tap_then_reverse_after_120ms.jpg"],["/home/user/JU/my-r2/evidence/C03/verify/op15-interrupt/006-handle_tap_then_reverse_after_120ms.jpg","/home/user/JU/my-r2/evidence/C03/verify/op15-interrupt/007-handle_tap_then_reverse_after_120ms.jpg","/home/user/JU/my-r2/evidence/C03/verify/op15-interrupt/008-handle_tap_then_reverse_after_120ms.jpg","/home/user/JU/my-r2/evidence/C03/verify/op15-interrupt/009-handle_tap_then_reverse_after_120ms.jpg","/home/user/JU/my-r2/evidence/C03/verify/op15-interrupt/010-handle_tap_then_reverse_after_120ms.jpg","/home/user/JU/my-r2/evidence/C03/verify/op15-interrupt/011-handle_tap_then_reverse_after_120ms.jpg"],["/home/user/JU/my-r2/evidence/C03/verify/op15-interrupt/012-handle_tap_then_reverse_after_120ms.jpg","/home/user/JU/my-r2/evidence/C03/verify/op15-interrupt/013-handle_tap_then_reverse_after_120ms.jpg"],["/home/user/JU/my-r2/evidence/C03/verify/op15-interrupt/014-after_reverse_tap.png","/home/user/JU/my-r2/evidence/C03/verify/op15-interrupt/015-tap_then_reverse_at_120ms.png","/home/user/JU/my-r2/evidence/C03/verify/op15-interrupt/016-open_then_back_at_150ms.png","/home/user/JU/my-r2/evidence/C03/verify/op15-interrupt/017-double_back.png","/home/user/JU/my-r2/evidence/C03/verify/op15-interrupt/018-sheet_Esc_during_entry.png"]]
labels=[["handle tap then reverse after 120ms 1/20 +0","handle tap then reverse after 120ms 2/20 +141","handle tap then reverse after 120ms 4/20 +300","handle tap then reverse after 120ms 5/20 +364","handle tap then reverse after 120ms 7/20 +484","handle tap then reverse after 120ms 8/20 +525"],["handle tap then reverse after 120ms 10/20 +638","handle tap then reverse after 120ms 11/20 +778","handle tap then reverse after 120ms 13/20 +850","handle tap then reverse after 120ms 14/20 +943","handle tap then reverse after 120ms 16/20 +973","handle tap then reverse after 120ms 17/20 +1009"],["handle tap then reverse after 120ms 19/20 +1063","handle tap then reverse after 120ms 20/20 +1081"],["after reverse tap","tap, then reverse at 120ms","open then back at 150ms","double back","sheet Esc during entry"]]
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
sh.save("/home/user/JU/my-r2/evidence/C03/verify/op15-interrupt/sheet.png",optimize=True)

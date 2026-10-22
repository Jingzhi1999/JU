import sys
from PIL import Image, ImageOps
fs=["settings-r2/evidence/lead/final/home-cotton/S01.png","settings-r2/evidence/lead/final/home-cotton/S02.png","settings-r2/evidence/lead/final/home-cotton/S03.png","settings-r2/evidence/lead/final/home-cotton/S04.png","settings-r2/evidence/lead/final/home-cotton/S05.png","settings-r2/evidence/lead/final/home-cotton/S06.png","settings-r2/evidence/lead/final/home-cotton/S07.png","settings-r2/evidence/lead/final/home-cotton/S08.png","settings-r2/evidence/lead/final/home-cotton/S09.png","settings-r2/evidence/lead/final/home-cotton/S10.png"]
ims=[Image.open(f).convert('RGB') for f in fs]
sc=0.5; w=int(390*sc); h=int(844*sc); cols=5; gap=10
rows=(len(ims)+cols-1)//cols
sh=Image.new('RGB',(cols*w+(cols+1)*gap, rows*h+(rows+1)*gap),(44,44,48))
for i,im in enumerate(ims):
    r,c=divmod(i,cols); sh.paste(im.resize((w,h),Image.LANCZOS),(gap+c*(w+gap),gap+r*(h+gap)))
sh.save('settings-r2/evidence/lead/final/home-cotton/sheet.png',optimize=True)

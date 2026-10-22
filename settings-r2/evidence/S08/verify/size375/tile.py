from PIL import Image, ImageOps, ImageDraw
fs=["/home/user/JU/settings-r2/evidence/S08/verify/size375/cotton-s-home.png","/home/user/JU/settings-r2/evidence/S08/verify/size375/cotton-s-long.png","/home/user/JU/settings-r2/evidence/S08/verify/size375/cotton-s-fav.png","/home/user/JU/settings-r2/evidence/S08/verify/size375/cotton-s-long-fav.png","/home/user/JU/settings-r2/evidence/S08/verify/size375/cotton-s-fav-many.png","/home/user/JU/settings-r2/evidence/S08/verify/size375/cotton-s-profile.png","/home/user/JU/settings-r2/evidence/S08/verify/size375/cotton-s-profile-fresh.png","/home/user/JU/settings-r2/evidence/S08/verify/size375/cotton-s-profile-edit.png"]
ims=[Image.open(f).convert('RGB') for f in fs]
sc=0.6; w=int(375*sc); h=int(812*sc); cols=8; gap=8
rows=(len(ims)+cols-1)//cols
sh=Image.new('RGB',(cols*w+(cols+1)*gap, rows*(h+16)+(rows+1)*gap),(44,44,48)); d=ImageDraw.Draw(sh)
import os
for i,im in enumerate(ims):
    r,c=divmod(i,cols); x=gap+c*(w+gap); y=gap+r*(h+16+gap); d.text((x+2,y+1),os.path.basename(fs[i])[:-4],fill=(230,230,230)); sh.paste(im.resize((w,h),Image.LANCZOS),(x,y+16))
sh.save('/home/user/JU/settings-r2/evidence/S08/verify/size375/sheet-cotton.png',optimize=True)

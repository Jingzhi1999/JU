from PIL import Image, ImageOps, ImageDraw
fs=["/home/user/JU/settings-r2/evidence/S08/verify/pages/sunset-s-home.png","/home/user/JU/settings-r2/evidence/S08/verify/pages/sunset-s-profile.png","/home/user/JU/settings-r2/evidence/S08/verify/pages/sunset-s-profile-edit.png","/home/user/JU/settings-r2/evidence/S08/verify/pages/sunset-s-fav.png","/home/user/JU/settings-r2/evidence/S08/verify/pages/sunset-s-fav-detail.png","/home/user/JU/settings-r2/evidence/S08/verify/pages/sunset-s-city.png","/home/user/JU/settings-r2/evidence/S08/verify/pages/sunset-s-notify.png","/home/user/JU/settings-r2/evidence/S08/verify/pages/sunset-s-appearance-preview.png","/home/user/JU/settings-r2/evidence/S08/verify/pages/sunset-s-records.png","/home/user/JU/settings-r2/evidence/S08/verify/pages/sunset-s-record-absent.png","/home/user/JU/settings-r2/evidence/S08/verify/pages/sunset-s-report-needmore.png","/home/user/JU/settings-r2/evidence/S08/verify/pages/sunset-s-rules.png"]
ims=[Image.open(f).convert('RGB') for f in fs]
sc=0.5; w=int(390*sc); h=int(844*sc); cols=6; gap=8
rows=(len(ims)+cols-1)//cols
sh=Image.new('RGB',(cols*w+(cols+1)*gap, rows*(h+16)+(rows+1)*gap),(44,44,48)); d=ImageDraw.Draw(sh)
import os
for i,im in enumerate(ims):
    r,c=divmod(i,cols); x=gap+c*(w+gap); y=gap+r*(h+16+gap); d.text((x+2,y+1),os.path.basename(fs[i])[:-4],fill=(230,230,230)); sh.paste(im.resize((w,h),Image.LANCZOS),(x,y+16))
sh.save('/home/user/JU/settings-r2/evidence/S08/verify/pages/sheet-sunset.png',optimize=True)

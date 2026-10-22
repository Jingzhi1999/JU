from PIL import Image, ImageOps, ImageDraw
fs=["/home/user/JU/settings-r2/evidence/S08/verify/pages2/sunset-s-appearance.png","/home/user/JU/settings-r2/evidence/S08/verify/pages2/sunset-s-help.png","/home/user/JU/settings-r2/evidence/S08/verify/pages2/sunset-s-feedback.png","/home/user/JU/settings-r2/evidence/S08/verify/pages2/sunset-s-privacy.png","/home/user/JU/settings-r2/evidence/S08/verify/pages2/sunset-s-account.png","/home/user/JU/settings-r2/evidence/S08/verify/pages2/sunset-s-account-confirm.png","/home/user/JU/settings-r2/evidence/S08/verify/pages2/sunset-s-about.png","/home/user/JU/settings-r2/evidence/S08/verify/pages2/sunset-s-reports.png","/home/user/JU/settings-r2/evidence/S08/verify/pages2/sunset-s-record-exit.png","/home/user/JU/settings-r2/evidence/S08/verify/pages2/sunset-s-record-supplement.png","/home/user/JU/settings-r2/evidence/S08/verify/pages2/sunset-s-report-file.png","/home/user/JU/settings-r2/evidence/S08/verify/pages2/sunset-s-seam-feed.png","/home/user/JU/settings-r2/evidence/S08/verify/pages2/sunset-s-seam-feed-detail.png","/home/user/JU/settings-r2/evidence/S08/verify/pages2/sunset-s-seam-mine.png","/home/user/JU/settings-r2/evidence/S08/verify/pages2/sunset-s-unsaved.png","/home/user/JU/settings-r2/evidence/S08/verify/pages2/sunset-s-fail.png","/home/user/JU/settings-r2/evidence/S08/verify/pages2/sunset-s-notify-denied.png","/home/user/JU/settings-r2/evidence/S08/verify/pages2/sunset-s-fav-empty.png"]
ims=[Image.open(f).convert('RGB') for f in fs]
sc=0.5; w=int(390*sc); h=int(844*sc); cols=6; gap=8
rows=(len(ims)+cols-1)//cols
sh=Image.new('RGB',(cols*w+(cols+1)*gap, rows*(h+16)+(rows+1)*gap),(44,44,48)); d=ImageDraw.Draw(sh)
import os
for i,im in enumerate(ims):
    r,c=divmod(i,cols); x=gap+c*(w+gap); y=gap+r*(h+16+gap); d.text((x+2,y+1),os.path.basename(fs[i])[:-4],fill=(230,230,230)); sh.paste(im.resize((w,h),Image.LANCZOS),(x,y+16))
sh.save('/home/user/JU/settings-r2/evidence/S08/verify/pages2/sheet-sunset.png',optimize=True)

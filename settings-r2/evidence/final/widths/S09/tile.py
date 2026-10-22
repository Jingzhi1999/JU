import os,sys
from PIL import Image, ImageDraw
d='settings-r2/evidence/final/widths/S09'; fs=sorted(f for f in os.listdir(d) if f.startswith('f') and f.endswith('.png'))
cols=8; W=440; H=950; pad=6
rows=(len(fs)+cols-1)//cols
sh=Image.new('RGB',(cols*(W+pad)+pad, rows*(H+pad+18)+pad),(230,228,224)); dr=ImageDraw.Draw(sh)
for i,f in enumerate(fs):
    im=Image.open(os.path.join(d,f)); x=pad+(i%cols)*(W+pad); y=pad+(i//cols)*(H+pad+18); dr.text((x+2,y+2),f[4:-4],fill=(50,50,50)); sh.paste(im,(x,y+18))
sh.save(os.path.join(d,'sheet.png'))

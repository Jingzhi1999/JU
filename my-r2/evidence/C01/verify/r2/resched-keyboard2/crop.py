from PIL import Image
box={"x":40,"y":258,"w":390,"h":844}
for f in ["/home/user/JU/my-r2/evidence/C01/verify/r2/resched-keyboard2/f002.jpg","/home/user/JU/my-r2/evidence/C01/verify/r2/resched-keyboard2/f003.jpg","/home/user/JU/my-r2/evidence/C01/verify/r2/resched-keyboard2/f004.jpg","/home/user/JU/my-r2/evidence/C01/verify/r2/resched-keyboard2/f005.jpg","/home/user/JU/my-r2/evidence/C01/verify/r2/resched-keyboard2/f006.jpg","/home/user/JU/my-r2/evidence/C01/verify/r2/resched-keyboard2/f007.jpg"]:
    im=Image.open(f)
    sx=im.width/480; sy=im.height/1110
    im.crop((int(box['x']*sx),int(box['y']*sy),int((box['x']+box['w'])*sx),int((box['y']+box['h'])*sy))).save(f,quality=84)

from PIL import Image
box={"x":40,"y":258,"w":390,"h":844}
for f in ["/home/user/JU/my-r2/evidence/C01/verify/op10b/f002.jpg"]:
    im=Image.open(f)
    sx=im.width/480; sy=im.height/1110
    im.crop((int(box['x']*sx),int(box['y']*sy),int((box['x']+box['w'])*sx),int((box['y']+box['h'])*sy))).save(f,quality=84)

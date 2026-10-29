from PIL import Image
box={"x":240,"y":90,"w":390,"h":844}
for f in ["/home/user/JU/my-r2/evidence/C10/verify/op10-clock/032-clock_+24h-1.jpg"]:
    im=Image.open(f)
    sx=im.width/1000; sy=im.height/1100
    im.crop((int(box['x']*sx),int(box['y']*sy),int((box['x']+box['w'])*sx),int((box['y']+box['h'])*sy))).save(f,quality=84)

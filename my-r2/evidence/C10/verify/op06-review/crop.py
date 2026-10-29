from PIL import Image
box={"x":240,"y":96,"w":390,"h":844}
for f in ["/home/user/JU/my-r2/evidence/C10/verify/op06-review/069-back_home-1.jpg","/home/user/JU/my-r2/evidence/C10/verify/op06-review/070-back_home-7.jpg","/home/user/JU/my-r2/evidence/C10/verify/op06-review/071-back_home-14.jpg","/home/user/JU/my-r2/evidence/C10/verify/op06-review/072-back_home-20.jpg","/home/user/JU/my-r2/evidence/C10/verify/op06-review/073-back_home-26.jpg","/home/user/JU/my-r2/evidence/C10/verify/op06-review/074-back_home-33.jpg","/home/user/JU/my-r2/evidence/C10/verify/op06-review/075-back_home-39.jpg","/home/user/JU/my-r2/evidence/C10/verify/op06-review/076-back_home-46.jpg","/home/user/JU/my-r2/evidence/C10/verify/op06-review/077-back_home-52.jpg","/home/user/JU/my-r2/evidence/C10/verify/op06-review/078-back_home-58.jpg","/home/user/JU/my-r2/evidence/C10/verify/op06-review/079-back_home-65.jpg","/home/user/JU/my-r2/evidence/C10/verify/op06-review/080-back_home-71.jpg"]:
    im=Image.open(f)
    sx=im.width/1000; sy=im.height/1100
    im.crop((int(box['x']*sx),int(box['y']*sy),int((box['x']+box['w'])*sx),int((box['y']+box['h'])*sy))).save(f,quality=84)

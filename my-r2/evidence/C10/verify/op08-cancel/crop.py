from PIL import Image
box={"x":240,"y":90,"w":390,"h":844}
for f in ["/home/user/JU/my-r2/evidence/C10/verify/op08-cancel/067-back_home-1.jpg","/home/user/JU/my-r2/evidence/C10/verify/op08-cancel/068-back_home-4.jpg","/home/user/JU/my-r2/evidence/C10/verify/op08-cancel/069-back_home-7.jpg","/home/user/JU/my-r2/evidence/C10/verify/op08-cancel/070-back_home-11.jpg","/home/user/JU/my-r2/evidence/C10/verify/op08-cancel/071-back_home-14.jpg","/home/user/JU/my-r2/evidence/C10/verify/op08-cancel/072-back_home-17.jpg","/home/user/JU/my-r2/evidence/C10/verify/op08-cancel/073-back_home-20.jpg","/home/user/JU/my-r2/evidence/C10/verify/op08-cancel/074-back_home-24.jpg","/home/user/JU/my-r2/evidence/C10/verify/op08-cancel/075-back_home-27.jpg","/home/user/JU/my-r2/evidence/C10/verify/op08-cancel/076-back_home-30.jpg"]:
    im=Image.open(f)
    sx=im.width/1000; sy=im.height/1100
    im.crop((int(box['x']*sx),int(box['y']*sy),int((box['x']+box['w'])*sx),int((box['y']+box['h'])*sy))).save(f,quality=84)

from PIL import Image
box={"x":40,"y":258,"w":390,"h":844}
for f in ["/home/user/JU/my-r2/evidence/C10/verify/op01-scroll-role/048-joined_history-1.jpg","/home/user/JU/my-r2/evidence/C10/verify/op01-scroll-role/049-joined_history-4.jpg","/home/user/JU/my-r2/evidence/C10/verify/op01-scroll-role/050-joined_history-6.jpg","/home/user/JU/my-r2/evidence/C10/verify/op01-scroll-role/051-joined_history-9.jpg","/home/user/JU/my-r2/evidence/C10/verify/op01-scroll-role/052-joined_history-11.jpg","/home/user/JU/my-r2/evidence/C10/verify/op01-scroll-role/053-joined_history-14.jpg","/home/user/JU/my-r2/evidence/C10/verify/op01-scroll-role/054-joined_history-16.jpg","/home/user/JU/my-r2/evidence/C10/verify/op01-scroll-role/055-joined_history-19.jpg"]:
    im=Image.open(f)
    sx=im.width/480; sy=im.height/1000
    im.crop((int(box['x']*sx),int(box['y']*sy),int((box['x']+box['w'])*sx),int((box['y']+box['h'])*sy))).save(f,quality=84)

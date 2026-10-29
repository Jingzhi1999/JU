from PIL import Image
box={"x":240,"y":90,"w":390,"h":844}
for f in ["/home/user/JU/my-r2/evidence/C10/verify/op04-reschedule-reply/097-查看退出结果-1.jpg","/home/user/JU/my-r2/evidence/C10/verify/op04-reschedule-reply/098-查看退出结果-3.jpg","/home/user/JU/my-r2/evidence/C10/verify/op04-reschedule-reply/099-查看退出结果-5.jpg","/home/user/JU/my-r2/evidence/C10/verify/op04-reschedule-reply/100-查看退出结果-7.jpg","/home/user/JU/my-r2/evidence/C10/verify/op04-reschedule-reply/101-查看退出结果-9.jpg","/home/user/JU/my-r2/evidence/C10/verify/op04-reschedule-reply/102-查看退出结果-10.jpg","/home/user/JU/my-r2/evidence/C10/verify/op04-reschedule-reply/103-查看退出结果-12.jpg","/home/user/JU/my-r2/evidence/C10/verify/op04-reschedule-reply/104-查看退出结果-14.jpg","/home/user/JU/my-r2/evidence/C10/verify/op04-reschedule-reply/105-查看退出结果-16.jpg","/home/user/JU/my-r2/evidence/C10/verify/op04-reschedule-reply/106-查看退出结果-18.jpg"]:
    im=Image.open(f)
    sx=im.width/1000; sy=im.height/1100
    im.crop((int(box['x']*sx),int(box['y']*sy),int((box['x']+box['w'])*sx),int((box['y']+box['h'])*sy))).save(f,quality=84)

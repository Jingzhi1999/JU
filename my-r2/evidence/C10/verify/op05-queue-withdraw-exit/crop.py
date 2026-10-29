from PIL import Image
box={"x":240,"y":96,"w":390,"h":844}
for f in ["/home/user/JU/my-r2/evidence/C10/verify/op05-queue-withdraw-exit/120-查看退出结果-1.jpg","/home/user/JU/my-r2/evidence/C10/verify/op05-queue-withdraw-exit/121-查看退出结果-3.jpg","/home/user/JU/my-r2/evidence/C10/verify/op05-queue-withdraw-exit/122-查看退出结果-4.jpg","/home/user/JU/my-r2/evidence/C10/verify/op05-queue-withdraw-exit/123-查看退出结果-6.jpg","/home/user/JU/my-r2/evidence/C10/verify/op05-queue-withdraw-exit/124-查看退出结果-8.jpg","/home/user/JU/my-r2/evidence/C10/verify/op05-queue-withdraw-exit/125-查看退出结果-9.jpg","/home/user/JU/my-r2/evidence/C10/verify/op05-queue-withdraw-exit/126-查看退出结果-11.jpg","/home/user/JU/my-r2/evidence/C10/verify/op05-queue-withdraw-exit/127-查看退出结果-13.jpg","/home/user/JU/my-r2/evidence/C10/verify/op05-queue-withdraw-exit/128-查看退出结果-14.jpg","/home/user/JU/my-r2/evidence/C10/verify/op05-queue-withdraw-exit/129-查看退出结果-16.jpg"]:
    im=Image.open(f)
    sx=im.width/1000; sy=im.height/1100
    im.crop((int(box['x']*sx),int(box['y']*sy),int((box['x']+box['w'])*sx),int((box['y']+box['h'])*sy))).save(f,quality=84)

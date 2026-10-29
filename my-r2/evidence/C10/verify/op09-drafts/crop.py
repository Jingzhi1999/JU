from PIL import Image
box={"x":240,"y":96,"w":390,"h":844}
for f in ["/home/user/JU/my-r2/evidence/C10/verify/op09-drafts/002-to_drafts-1.jpg","/home/user/JU/my-r2/evidence/C10/verify/op09-drafts/003-to_drafts-4.jpg","/home/user/JU/my-r2/evidence/C10/verify/op09-drafts/004-to_drafts-6.jpg","/home/user/JU/my-r2/evidence/C10/verify/op09-drafts/005-to_drafts-9.jpg","/home/user/JU/my-r2/evidence/C10/verify/op09-drafts/006-to_drafts-12.jpg","/home/user/JU/my-r2/evidence/C10/verify/op09-drafts/007-to_drafts-15.jpg","/home/user/JU/my-r2/evidence/C10/verify/op09-drafts/008-to_drafts-17.jpg","/home/user/JU/my-r2/evidence/C10/verify/op09-drafts/009-to_drafts-20.jpg"]:
    im=Image.open(f)
    sx=im.width/1000; sy=im.height/1100
    im.crop((int(box['x']*sx),int(box['y']*sy),int((box['x']+box['w'])*sx),int((box['y']+box['h'])*sy))).save(f,quality=84)

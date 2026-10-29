from PIL import Image
box={"x":240,"y":96,"w":390,"h":844}
for f in ["/home/user/JU/my-r2/evidence/C10/verify/op09b-drafts/015-undo-1.jpg","/home/user/JU/my-r2/evidence/C10/verify/op09b-drafts/016-undo-2.jpg","/home/user/JU/my-r2/evidence/C10/verify/op09b-drafts/017-undo-4.jpg","/home/user/JU/my-r2/evidence/C10/verify/op09b-drafts/018-undo-5.jpg","/home/user/JU/my-r2/evidence/C10/verify/op09b-drafts/019-undo-7.jpg","/home/user/JU/my-r2/evidence/C10/verify/op09b-drafts/020-undo-8.jpg","/home/user/JU/my-r2/evidence/C10/verify/op09b-drafts/021-undo-10.jpg","/home/user/JU/my-r2/evidence/C10/verify/op09b-drafts/022-undo-11.jpg","/home/user/JU/my-r2/evidence/C10/verify/op09b-drafts/023-undo-13.jpg","/home/user/JU/my-r2/evidence/C10/verify/op09b-drafts/024-undo-14.jpg","/home/user/JU/my-r2/evidence/C10/verify/op09b-drafts/025-undo-16.jpg","/home/user/JU/my-r2/evidence/C10/verify/op09b-drafts/026-undo-17.jpg"]:
    im=Image.open(f)
    sx=im.width/1000; sy=im.height/1100
    im.crop((int(box['x']*sx),int(box['y']*sy),int((box['x']+box['w'])*sx),int((box['y']+box['h'])*sy))).save(f,quality=84)

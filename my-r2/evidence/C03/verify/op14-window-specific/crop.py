from PIL import Image
import json
items=json.load(open("/home/user/JU/my-r2/evidence/C03/verify/op14-window-specific/crop.json"))
for it in items:
    im=Image.open(it['f']); b=it['box']
    sx=im.width/1000; sy=im.height/1000
    im.crop((int(b['x']*sx),int(b['y']*sy),int((b['x']+b['w'])*sx),int((b['y']+b['h'])*sy))).convert('RGB').save(it['f'],quality=82)

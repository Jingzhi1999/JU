#!/usr/bin/env python3
"""evidence-pick.py <dir>... — list the evidence files worth committing: everything except raw motion-frame runs (> 24 numbered
.jpg frames in one folder) whose folder holds a contact sheet (sheet*.jpg|png), or whose parent holds sheet-<folder>.*, that shows them. Prints one path per line.
Use: python3 -I my-r2/tools/evidence-pick.py my-r2/evidence/C04/stage1 | xargs -d '\\n' git add -f"""
import os, re, sys
FRAME = re.compile(r'(^\d{2,4}([-_].*)?|.*[-_]\d{3})\.jpe?g$', re.I)
for d in sys.argv[1:]:
    for root, _, files in os.walk(d):
        frames = [f for f in files if FRAME.match(f)]
        par = os.path.dirname(root); name = os.path.basename(root).lower()
        has_sheet = any(f.lower().startswith('sheet') for f in files) or any(g.lower().startswith('sheet') and name in g.lower() for g in (os.listdir(par) if os.path.isdir(par) else []))
        drop = set(frames) if (has_sheet and len(frames) > 24) else set()
        for f in sorted(files):
            if f in drop: continue
            if re.match(r'^f\d', f) and f.lower().endswith(('.png', '.jpg')): continue   # .gitignore'd raw capture frames
            print(os.path.join(root, f))

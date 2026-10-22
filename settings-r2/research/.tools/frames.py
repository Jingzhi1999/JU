import sys, subprocess, io, os
from PIL import Image, ImageDraw
src, out, tw = sys.argv[1], sys.argv[2], int(sys.argv[3])
COLS = int(os.environ.get('COLS', '10')); CROP = os.environ.get('CROP')
rows = []
for spec in sys.argv[4:]:
    s, d, fps, label = spec.split(':', 3); s, d, fps = float(s), float(d), float(fps)
    cmd = ['ffmpeg', '-v', 'error', '-ss', str(s), '-i', src, '-t', str(d), '-map', '0:v:0', '-vf', (f'crop={CROP},' if CROP else '') + f'fps={fps},scale={tw}:-2', '-r', str(fps), '-f', 'image2pipe', '-vcodec', 'png', '-']
    data = subprocess.run(cmd, capture_output=True, timeout=600).stdout
    sig = b'\x89PNG\r\n\x1a\n'
    frames = [(s + k / fps, Image.open(io.BytesIO(sig + p)).convert('RGB')) for k, p in enumerate(data.split(sig)[1:])]
    for j in range(0, len(frames), COLS): rows.append((label if j == 0 else '', frames[j:j + COLS]))
fw, fh = rows[0][1][0][1].size; Wd = max(len(f) for _, f in rows)
sheet = Image.new('RGB', (Wd * (fw + 3), sum(fh + (18 if l else 4) for l, _ in rows)), (70, 70, 70)); d = ImageDraw.Draw(sheet); y = 0
for label, frames in rows:
    if label: d.text((4, y + 3), label, fill='white'); y += 14
    for c, (t, im) in enumerate(frames):
        x = c * (fw + 3); sheet.paste(im, (x, y + 2)); d.rectangle((x, y + 2, x + 46, y + 14), fill='black'); d.text((x + 2, y + 3), f'{t:.2f}s', fill='white')
    y += fh + 4
os.makedirs(os.path.dirname(out) or '.', exist_ok=True)
sheet.save(out, quality=74); print(out, sheet.size, sum(len(f) for _, f in rows), 'frames')

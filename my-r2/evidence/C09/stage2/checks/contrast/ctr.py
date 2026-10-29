# ctr.py <dir> : contrast measured on rendered pixels.
# For every text line box: glyph colour = median of the A-pixels that moved most when glyphs were hidden (the stroke cores);
# backdrop = the B-pixels under the same box. Ratio reported = 10th percentile over backdrop pixels (worst ink-on-paper spots).
import sys, json, glob, os
import numpy as np
from PIL import Image

def lin(c):
    c = c / 255.0
    return np.where(c <= 0.03928, c / 12.92, ((c + 0.055) / 1.055) ** 2.4)

def lum(rgb):
    l = lin(np.asarray(rgb, dtype=float))
    return 0.2126 * l[..., 0] + 0.7152 * l[..., 1] + 0.0722 * l[..., 2]

def main(d):
    rows = []
    for jf in sorted(glob.glob(os.path.join(d, '*.json'))):
        base = jf[:-5]; name = os.path.basename(base)
        data = json.load(open(jf))
        A = np.asarray(Image.open(base + '-a.png').convert('RGB')).astype(int)
        B = np.asarray(Image.open(base + '-b.png').convert('RGB')).astype(int)
        sx = A.shape[1] / data['w']; sy = A.shape[0] / data['h']
        for it in data['items']:
            x0 = max(0, int(it['x'] * sx)); y0 = max(0, int(it['y'] * sy)); x1 = min(A.shape[1], int((it['x'] + it['w']) * sx)); y1 = min(A.shape[0], int((it['y'] + it['h']) * sy))
            if x1 - x0 < 4 or y1 - y0 < 6: continue
            a = A[y0:y1, x0:x1].reshape(-1, 3); b = B[y0:y1, x0:x1].reshape(-1, 3)
            diff = np.abs(a - b).max(axis=1)
            if diff.max() < 36: continue  # glyphs covered by something else (header glass, fade) — nothing to measure
            core = a[diff >= 0.8 * diff.max()]
            ink = np.median(core, axis=0)
            bgpix = b[diff < 0.15 * diff.max()] if (diff < 0.15 * diff.max()).sum() > 20 else b
            li = lum(ink); lb = lum(bgpix)
            cr = (np.maximum(li, lb) + 0.05) / (np.minimum(li, lb) + 0.05)
            worst = float(np.percentile(cr, 10)); med = float(np.median(cr))
            need = 4.5 if it['fs'] <= 18 else 3.0
            if not it['tag'] and it['y'] + it['h'] / 2 > data.get('occ', 1e9): it['tag'] = 'under-bar'
            rows.append(dict(state=name, t=it['t'], fs=it['fs'], fw=it['fw'], tag=it['tag'], cls=it['cls'], worst=round(worst, 2), med=round(med, 2), need=need,
                             ink='#%02x%02x%02x' % tuple(int(v) for v in ink), bg='#%02x%02x%02x' % tuple(int(v) for v in np.median(bgpix, axis=0)), y=round(it['y'])))
    return rows

if __name__ == '__main__':
    rows = main(sys.argv[1])
    json.dump(rows, open(os.path.join(sys.argv[1], 'result.json'), 'w'), ensure_ascii=False, indent=0)
    states = sorted(set(r['state'] for r in rows))
    for s in states:
        rs = [r for r in rows if r['state'] == s]
        own = [r for r in rs if not r['tag']]
        fails = [r for r in own if r['worst'] < r['need']]
        mn = min(own, key=lambda r: r['worst']) if own else None
        print(f"{s}: boxes {len(rs)} own {len(own)} fail {len(fails)} min {mn['worst'] if mn else '-'} ({mn['t'] if mn else ''})")
        for r in sorted(fails, key=lambda r: r['worst'])[:12]:
            print(f"   FAIL {r['worst']:.2f}/{r['med']:.2f} need {r['need']} fs{r['fs']} {r['t']!r} ink {r['ink']} bg {r['bg']} [{r['cls']}] y{r['y']}")
        ex = [r for r in rs if r['tag'] and r['worst'] < r['need']]
        for r in ex[:6]:
            print(f"   exempt[{r['tag']}] {r['worst']:.2f} fs{r['fs']} {r['t']!r} ink {r['ink']} bg {r['bg']}")

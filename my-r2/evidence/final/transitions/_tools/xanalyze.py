# Analyse an xprobe.cjs run: per segment, (1) longest run of "all content text <= 0.3" (ms, frames), (2) frames where only one
# line / title of content text is visible, (3) frames with a NEW overlapping visible text pair (not present in the start or end
# state), (4) frames where some event title has more visible copies than in the start / end state. Near-blank threshold: a run of
# (blank or one-line) frames longer than 34 ms (one painted frame ~33 ms). Writes summary.json; for flagged segments crops the
# screencast frames to the phone and tiles a labelled sheet into <evidence>/<seg>/.
# python3 -I xanalyze.py <probe.json> <rawdir> <evidence_dir>
import json, os, sys, statistics
from PIL import Image, ImageDraw, ImageFont
probe, rawdir, ev = sys.argv[1], sys.argv[2], sys.argv[3]
log = json.load(open(probe)); os.makedirs(ev, exist_ok=True)
FT = ImageFont.truetype('/usr/share/fonts/truetype/wqy/wqy-zenhei.ttc', 12)
NEAR_MS = 34

def runs(samples, pred):
    out = []; i = 0; n = len(samples)
    while i < n:
        if pred(samples[i]):
            j = i
            while j + 1 < n and pred(samples[j + 1]): j += 1
            end_t = samples[j + 1][0] if j + 1 < n else samples[j][0] + 17
            out.append({'from': i, 'to': j, 'ms': end_t - samples[i][0], 'frames': j - i + 1, 't0': samples[i][0], 't1': end_t})
            i = j + 1
        else: i += 1
    return out

summary = {'code': log['code'], 'load': [log.get('loadStart'), log.get('loadEnd')], 'segs': []}
box = log['box']
for s in log['segs']:
    row = {'name': s['name'], 'target': s.get('target'), 'before': s.get('before'), 'after': s.get('after'), 'reached': s.get('reached'), 'load': s.get('load')}
    if s.get('err') or not s.get('samples'):
        row['err'] = s.get('err', 'no samples'); summary['segs'].append(row); continue
    S = s['samples']
    dts = [b[0] - a[0] for a, b in zip(S, S[1:])]; row['dt_median'] = statistics.median(dts) if dts else None
    start, end = S[0], S[-1]
    import re
    nk = lambda k: re.sub(r'\d', '0', k)
    base_pairs = set(nk(k) for k in (start[3] or []) + (end[3] or []))
    base_tc = {}
    for x in (start, end):
        for k, v in (x[4] or {}).items(): base_tc[k] = max(base_tc.get(k, 0), v)
    blank_runs = runs(S, lambda x: x[1] == 1)
    one_runs = runs(S, lambda x: x[2] == 1)
    near_runs = runs(S, lambda x: x[1] == 1 or x[2] == 1)
    ov = [i for i, x in enumerate(S) if any(nk(p) not in base_pairs for p in (x[3] or []))]
    dup = [i for i, x in enumerate(S) if any(v >= 2 and v > base_tc.get(k, 0) for k, v in (x[4] or {}).items())]
    lb = max(blank_runs, key=lambda r: r['ms']) if blank_runs else None
    ln = max(near_runs, key=lambda r: r['ms']) if near_runs else None
    row.update({
        'blank_ms': lb['ms'] if lb else 0, 'blank_frames': lb['frames'] if lb else 0, 'blank_at': ('#%d–#%d +%d–%dms' % (lb['from'], lb['to'], lb['t0'], lb['t1'])) if lb else '',
        'one_frames': sum(r['frames'] for r in one_runs), 'one_at': [('#%d–#%d +%d–%dms' % (r['from'], r['to'], r['t0'], r['t1'])) for r in one_runs][:4],
        'near_ms': ln['ms'] if ln else 0, 'near_frames': ln['frames'] if ln else 0, 'near_at': ('#%d–#%d +%d–%dms' % (ln['from'], ln['to'], ln['t0'], ln['t1'])) if ln else '',
        'overlap_frames': len(ov), 'overlap_at': ['#%d +%dms %s' % (i, S[i][0], [p for p in (S[i][3] or []) if nk(p) not in base_pairs][:2]) for i in ov[:4]],
        'dup_frames': len(dup), 'dup_at': ['#%d +%dms %s' % (i, S[i][0], {k: v for k, v in (S[i][4] or {}).items() if v >= 2 and v > base_tc.get(k, 0)}) for i in dup[:4]],
        'one_lines': [S[r['from']][7] for r in one_runs][:3],
    })
    row['flag'] = [k for k, c in (('near-blank', row['near_ms'] > NEAR_MS), ('overlap', row['overlap_frames'] > 0), ('dup-title', row['dup_frames'] > 0)) if c]
    FR = s.get('frames') or []
    def files_in(t0, t1): return [f for f, ms in FR if t0 - 12 <= ms <= t1 + 12]
    def rng(fs): return (fs[0] + ('–' + fs[-1] if len(fs) > 1 else '')) if fs else ''
    row['near_files'] = rng(files_in(ln['t0'], ln['t1'])) if (ln and row['near_ms'] > NEAR_MS) else ''
    row['ovl_files'] = rng(sorted(set(sum([files_in(S[i][0], S[i][0]) for i in ov], [])))) if ov else ''
    row['dup_files'] = rng(sorted(set(sum([files_in(S[i][0], S[i][0]) for i in dup], [])))) if dup else ''
    row['ovl_samples'] = ('#%d–#%d +%d–%dms' % (ov[0], ov[-1], S[ov[0]][0], S[ov[-1]][0])) if ov else ''
    row['dup_samples'] = ('#%d–#%d +%d–%dms' % (dup[0], dup[-1], S[dup[0]][0], S[dup[-1]][0])) if dup else ''
    # evidence for flagged segments: every frame inside a flagged interval is saved (plus two frames of context on each side)
    if row['flag'] and s.get('frames'):
        FRm = s['frames']; keep = set()
        def mark(t0, t1):
            idx = [i for i, (f, ms) in enumerate(FRm) if t0 - 12 <= ms <= t1 + 12]
            if not idx:  # no frame inside: take the nearest one
                idx = [min(range(len(FRm)), key=lambda i: abs(FRm[i][1] - (t0 + t1) / 2))]
            for i in range(max(0, idx[0] - 2), min(len(FRm), idx[-1] + 3)): keep.add(i)
            return idx
        def rng2(idx): return (FRm[idx[0]][0] + ('–' + FRm[idx[-1]][0] if len(idx) > 1 else '')) if idx else ''
        if 'near-blank' in row['flag']: row['near_files'] = rng2(mark(ln['t0'], ln['t1']))
        if 'overlap' in row['flag']:
            ii = sorted(set(sum([mark(S[i][0], S[i][0]) for i in ov[:6]], []))); row['ovl_files'] = rng2(ii)
        if 'dup-title' in row['flag']:
            ii = sorted(set(sum([mark(S[i][0], S[i][0]) for i in dup[:6]], []))); row['dup_files'] = rng2(ii)
        sel = [FRm[i] for i in sorted(keep)][:40]
        d = os.path.join(ev, s['name']); os.makedirs(d, exist_ok=True); ims = []
        for name, ms in sel:
            im = Image.open(os.path.join(rawdir, s['name'], name)).convert('RGB')
            sx = im.width / log['vw']; sy = im.height / log['vh']
            im = im.crop((int(box['x'] * sx), int(box['y'] * sy), int((box['x'] + box['w']) * sx), int((box['y'] + box['h']) * sy)))
            out = os.path.join(d, name); im.save(out, quality=78); ims.append((im, '%s +%dms' % (name, ms)))
        if len(ims) > 16: ims = [ims[round(i * (len(ims) - 1) / 15)] for i in range(16)]
        sc = 0.42; w = int(ims[0][0].width * sc); h = int(ims[0][0].height * sc); cols = min(8, len(ims)); rows = (len(ims) + cols - 1) // cols
        sh = Image.new('RGB', (cols * (w + 6) + 6, rows * (h + 20) + 6), (40, 40, 44)); dr = ImageDraw.Draw(sh)
        for k, (im, lab) in enumerate(ims):
            x = 6 + (k % cols) * (w + 6); y = 6 + (k // cols) * (h + 20); dr.text((x, y), lab, fill=(230, 230, 230), font=FT); sh.paste(im.resize((w, h)), (x, y + 15))
        sh.save(os.path.join(ev, s['name'] + '-sheet.jpg'), quality=80); row['sheet'] = s['name'] + '-sheet.jpg'; row['frames_saved'] = [x[0] for x in sel]
    summary['segs'].append(row)
json.dump(summary, open(os.path.join(ev, 'summary.json'), 'w'), ensure_ascii=False, indent=1)
for r in summary['segs']:
    if r.get('err'): print(r['name'], 'ERR', r['err']); continue
    print('%-14s %-5s blank %3dms/%d  one %2d  near %3dms/%d  ovl %2d  dup %2d  dt %s  %s %s' % (r['name'], 'ok' if r['reached'] else 'MISS', r['blank_ms'], r['blank_frames'], r['one_frames'], r['near_ms'], r['near_frames'], r['overlap_frames'], r['dup_frames'], r['dt_median'], ','.join(r['flag']), (r['overlap_at'][:1] + r['dup_at'][:1] + ([r['near_at']] if r['near_ms'] > NEAR_MS else []))))

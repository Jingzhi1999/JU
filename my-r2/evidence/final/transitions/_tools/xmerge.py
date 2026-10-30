# Merge three runs per concept: run 1 = <E>/<C>/summary.json (evidence lives there), runs 2–3 = <S>/xana/<C>-r2|r3/summary.json.
# Numbers = median of the three runs; near-blank flagged when the median longest (blank or one-line) run is > 34 ms; overlap / two titles
# flagged when ≥ 2 of 3 runs show it (1 of 3 = 偶发, listed but not flagged). Evidence for a flag comes from the first run that shows it;
# when that is run 2 or 3, its sheet and frames are copied into <E>/<C>/ with an r2- / r3- prefix.
# python3 -I xmerge.py <E> <S> C01 C02 ...
import json, os, sys, shutil, statistics
E, S = sys.argv[1], sys.argv[2]; codes = sys.argv[3:]
NEAR = 34
def med(v): return statistics.median(v) if v else 0
for c in codes:
    runs = []
    for k, p in ((1, os.path.join(E, c, 'summary.json')), (2, os.path.join(S, 'xana', c + '-r2', 'summary.json')), (3, os.path.join(S, 'xana', c + '-r3', 'summary.json'))):
        if os.path.exists(p): runs.append((k, json.load(open(p))))
    names = [x['name'] for x in runs[0][1]['segs']] if runs else []
    out = {'code': c, 'runs': [k for k, _ in runs], 'loads': [r.get('load') for _, r in runs], 'segs': []}
    for n in names:
        rs = []
        for k, r in runs:
            x = [y for y in r['segs'] if y['name'] == n]
            if x and not x[0].get('err'): rs.append((k, x[0]))
        if not rs:
            err = [y for _, r in runs for y in r['segs'] if y['name'] == n]
            out['segs'].append({'name': n, 'err': (err[0].get('err') if err else 'no data')}); continue
        m = {'name': n, 'n': len(rs), 'reached': all(x.get('reached') for _, x in rs), 'after': rs[0][1].get('after'), 'target': rs[0][1].get('target'),
             'blank_ms': med([x['blank_ms'] for _, x in rs]), 'blank_frames': med([x['blank_frames'] for _, x in rs]), 'one_frames': med([x['one_frames'] for _, x in rs]),
             'near_ms': med([x['near_ms'] for _, x in rs]), 'near_frames': med([x['near_frames'] for _, x in rs]),
             'overlap_frames': med([x['overlap_frames'] for _, x in rs]), 'dup_frames': med([x['dup_frames'] for _, x in rs]),
             'near_list': [x['near_ms'] for _, x in rs], 'ovl_runs': sum(1 for _, x in rs if x['overlap_frames'] > 0), 'dup_runs': sum(1 for _, x in rs if x['dup_frames'] > 0)}
        m['flag'] = [f for f, cond in (('near-blank', m['near_ms'] > NEAR), ('overlap', m['ovl_runs'] >= 2), ('dup-title', m['dup_runs'] >= 2)) if cond]
        m['occasional'] = [f for f, cond in (('overlap', m['ovl_runs'] == 1), ('dup-title', m['dup_runs'] == 1)) if cond]
        ev = {}
        for f in m['flag'] + m['occasional']:
            key = {'near-blank': 'near-blank', 'overlap': 'overlap', 'dup-title': 'dup-title'}[f]
            for k, x in rs:
                if key in (x.get('flag') or []):
                    e = {'run': k}
                    if f == 'near-blank': e.update(at=x['near_at'], files=x.get('near_files'), ms=x['near_ms'], frames=x['near_frames'])
                    if f == 'overlap': e.update(at=x.get('ovl_samples'), files=x.get('ovl_files'), example=(x['overlap_at'][0].split(' ', 2)[-1] if x['overlap_at'] else ''))
                    if f == 'dup-title': e.update(at=x.get('dup_samples'), files=x.get('dup_files'), example=(x['dup_at'][0].split(' ', 2)[-1] if x['dup_at'] else ''))
                    sheet = x.get('sheet')
                    if k == 1: e['sheet'] = sheet; e['dir'] = n
                    elif sheet:
                        src = os.path.join(S, 'xana', '%s-r%d' % (c, k)); dst = os.path.join(E, c)
                        shutil.copy(os.path.join(src, sheet), os.path.join(dst, 'r%d-%s' % (k, sheet)))
                        if os.path.isdir(os.path.join(src, n)) and not os.path.isdir(os.path.join(dst, 'r%d-%s' % (k, n))): shutil.copytree(os.path.join(src, n), os.path.join(dst, 'r%d-%s' % (k, n)))
                        e['sheet'] = 'r%d-%s' % (k, sheet); e['dir'] = 'r%d-%s' % (k, n)
                        # the saved crops of runs 2–3 are a subsample: name only frames that exist
                        saved = sorted(os.listdir(os.path.join(dst, 'r%d-%s' % (k, n)))) if os.path.isdir(os.path.join(dst, 'r%d-%s' % (k, n))) else []
                        rngs = (e.get('files') or '').split('–'); lo_, hi_ = rngs[0], rngs[-1]
                        inside = [f for f in saved if lo_ <= f <= hi_] if lo_ else []
                        if not inside and saved and lo_: inside = [min(saved, key=lambda f: abs(int(f[1:4]) - int(lo_[1:4])))]
                        e['files'] = (inside[0] + ('–' + inside[-1] if len(inside) > 1 else '')) if inside else ''
                    ev[f] = e; break
        m['evidence'] = ev
        out['segs'].append(m)
    json.dump(out, open(os.path.join(E, c, 'merged.json'), 'w'), ensure_ascii=False, indent=1)
    print(c, 'runs', out['runs'], ' '.join('%s:%s' % (s['name'].split('-')[0], ','.join(s.get('flag', [])) or '-') for s in out['segs']))

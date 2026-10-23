# -*- coding: utf-8 -*-
"""Offline fonts for the my-r2 deliverable (ported from settings-r2/tools/embed-fonts.py; same subsetting, plus the required
family list, a cache-only mode and a sidecar report that build.js turns into window.__JU_FONTS for the appendix).
Collects every Google Fonts <link> used by the built concept sources and the shell, adds the REQUIRED families below
(my-r2/src/shared/v27/fonts.md + my-r2/spec/baseline-rituals.md §1), downloads the static TTF of each (family, weight, style)
through the Google Fonts CSS API (generic client => one TTF per weight), subsets each file to the characters that can actually
appear (concept sources + shared core data + shell + appendix docs; --common adds the GB2312 level-1 set; a family may carry its
own character list, e.g. Noto Serif SC 900 = 「出席未」 only), and writes one CSS file of @font-face rules with base64 WOFF2 data
that build.js inlines into the standalone page, plus <out>.json (families, weights, subset sizes, licence, what is missing).

Usage (needs fonttools + brotli; /home/user/JU/.build/fontenv/bin/python has them):
  .build/fontenv/bin/python my-r2/tools/embed-fonts.py [out.css] <text-sources...> [--common] [--offline] [--require "<spec>"] [--no-required]
    out.css        default my-r2/.fonts/fonts-embed.css (used when the first argument is not a .css path)
    sources        the built concept sources (my-r2/concepts/project/*.dc.html or the private .build/CNN.html files),
                   my-r2/src/core/ju-data.js, my-r2/src/shell/shell.html and the appendix docs
    --common       also include the 3,755 GB2312 level-1 characters (what people may type into inputs)
    --offline      never touch the network: use only what the download cache already holds (JU_FONTS_CACHE=.build/fonts-cache
                   reuses the Phase B downloads); families / weights that are not cached are listed under "missing"
    --require      override the required list; spec = "Family:400,500;Other:700@出席未" (weights; optional @chars = own subset)
    --no-required  only the families linked from the sources
  then: JU_FONTS_CSS=my-r2/.fonts/fonts-embed.css node my-r2/src/build.js
The download cache lives in my-r2/.fonts/cache/ (not committed); JU_FONTS_CACHE=<dir> points elsewhere."""
import sys, os, re, json, base64, hashlib, urllib.request, urllib.parse, io, time
from fontTools import subset
from fontTools.ttLib import TTFont

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
FONTS_DIR = os.path.join(ROOT, 'my-r2', '.fonts')
CACHE = os.environ.get('JU_FONTS_CACHE') or os.path.join(FONTS_DIR, 'cache')   # JU_FONTS_CACHE=.build/fonts-cache reuses the Phase B downloads
DEFAULT_OUT = os.path.join(FONTS_DIR, 'fonts-embed.css')
os.makedirs(CACHE, exist_ok=True)
UA = 'Mozilla/4.0 (compatible; fonts-subsetter)'  # generic client => static TTF per weight
MODERN_UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36'
OFFLINE = '--offline' in sys.argv
LICENSE = 'SIL Open Font License 1.1'
# the families the ten concepts share (fonts.md §2–3 + baseline-rituals.md §1); Noto Serif SC 900 is only ever 出 / 席 / 未
DEFAULT_REQUIRED = 'Noto Sans SC:400,500,700;Space Mono:400,700;Archivo:400,500,700;Noto Serif SC:900@出席未;Noto Serif SC:600;Libre Caslon Text:700'   # Serif 600 = C06 字排 的局名（全字集）
VARIABLE = {}  # family -> list of raw specs that use a width (wdth) axis: embedded as subset variable woff2

class Offline(Exception):
    pass

def _cached(key):
    p = os.path.join(CACHE, key)
    return open(p, 'rb').read() if os.path.exists(p) else None

def fetch(url):
    key = hashlib.sha1(url.encode()).hexdigest()
    data = _cached(key)
    if data is not None:
        return data
    if OFFLINE:
        raise Offline(url)
    req = urllib.request.Request(url, headers={'User-Agent': UA})
    data = urllib.request.urlopen(req, timeout=180).read()
    open(os.path.join(CACHE, key), 'wb').write(data)
    return data

def fetch_ua(url, ua):
    key = hashlib.sha1((ua + url).encode()).hexdigest()
    data = _cached(key)
    if data is not None:
        return data
    if OFFLINE:
        raise Offline(url)
    req = urllib.request.Request(url, headers={'User-Agent': ua})
    data = urllib.request.urlopen(req, timeout=180).read()
    open(os.path.join(CACHE, key), 'wb').write(data)
    return data

def families_from_links(texts):
    fams = {}
    for t in texts:
        for href in re.findall(r'href="(https://fonts\.googleapis\.com/css2\?[^"]+)"', t):
            href = href.replace('&amp;', '&')
            q = urllib.parse.urlparse(href).query
            for part in urllib.parse.parse_qs(q, keep_blank_values=True).get('family', []):
                name, _, spec = part.partition(':')
                name = name.replace('+', ' ')
                weights = set()
                ital = False
                if spec and 'wdth' in spec.split('@')[0].split(','):
                    VARIABLE.setdefault(name, [])
                    if spec not in VARIABLE[name]: VARIABLE[name].append(spec)
                    fams.setdefault(name, {'weights': set(), 'ital': False})
                    continue
                if spec:
                    axes, _, vals = spec.partition('@')
                    axes = axes.split(',')
                    for v in vals.split(';'):
                        nums = v.split(',')
                        if 'ital' in axes and 'wght' in axes:
                            if nums[0] == '1': ital = True
                            rng = nums[1]
                        elif 'wght' in axes:
                            rng = nums[0]
                        else:
                            rng = '400'
                        if '..' in rng:
                            a, b = rng.split('..'); weights.update(w for w in (400, 500, 600, 700) if int(a) <= w <= int(b))
                        else:
                            weights.add(int(float(rng)))
                else:
                    weights.add(400)
                f = fams.setdefault(name, {'weights': set(), 'ital': False})
                f['weights'] |= weights; f['ital'] = f['ital'] or ital
    return fams

def parse_required(spec, fams):
    """'Family:400,500;Other:700@chars' → merged into fams; returns {family: own character list}"""
    own = {}
    for part in [p.strip() for p in spec.split(';') if p.strip()]:
        name, _, rest = part.partition(':')
        ws, _, chars = rest.partition('@')
        name = name.strip()
        f = fams.setdefault(name, {'weights': set(), 'ital': False})
        f['weights'] |= set(int(w) for w in ws.split(',') if w.strip())
        if chars.strip():
            # the subset belongs to the weights named in THIS part only (Noto Serif SC:900@出席未 must not shrink a 600 face)
            for w in [int(w) for w in ws.split(',') if w.strip()]:
                own[(name, w)] = chars.strip()
            if not ws.strip():
                own[name] = chars.strip()
    return own

def own_for(own, name, weight, default):
    try: w = int(weight)
    except Exception: w = 400
    return own.get((name, w), own.get(name, default))

def css_for(name, weights, ital):
    fam = name.replace(' ', '+')
    if ital:
        spec = 'ital,wght@' + ';'.join(['0,%d' % w for w in sorted(weights)] + ['1,%d' % w for w in sorted(weights)])
    else:
        spec = 'wght@' + ';'.join(str(w) for w in sorted(weights))
    url = 'https://fonts.googleapis.com/css2?family=%s:%s&display=swap' % (fam, spec)
    try:
        return fetch(url).decode('utf-8')
    except Offline:
        raise
    except Exception:
        return fetch('https://fonts.googleapis.com/css2?family=%s&display=swap' % fam).decode('utf-8')

def cache_index():
    """offline mode: every @font-face block of every cached CSS response → {(family, style, weight): [{url, range}]}"""
    idx = {}
    for fn in os.listdir(CACHE):
        p = os.path.join(CACHE, fn)
        try:
            head = open(p, 'rb').read(80)
        except Exception:
            continue
        if b'@font-face' not in head and not head.startswith(b'/*'):
            continue
        try:
            css = open(p, encoding='utf-8').read()
        except Exception:
            continue
        for block in re.findall(r'@font-face\s*\{[^}]*\}', css):
            fam = re.search(r"font-family:\s*'([^']+)'", block); style = re.search(r'font-style:\s*(\w+)', block)
            weight = re.search(r'font-weight:\s*([\d ]+);', block); src = re.search(r"src:\s*url\((https://[^)]+)\)", block)
            ur = re.search(r'unicode-range:\s*([^;]+);', block); st = re.search(r'font-stretch:\s*([\d% ]+);', block)
            if not (fam and src):
                continue
            key = (fam.group(1), style.group(1) if style else 'normal', weight.group(1).strip() if weight else '400')
            rec = {'url': src.group(1), 'range': ur.group(1).strip() if ur else '', 'stretch': st.group(1).strip() if st else ''}
            if rec not in idx.setdefault(key, []):
                idx[key].append(rec)
    return idx

def gb2312_level1():
    # the 3,755 most common Chinese characters (GB2312 level 1, rows 16-55): what people type for names, feedback and notes
    out = set()
    for hi in range(0xB0, 0xD8):
        for lo in range(0xA1, 0xFF):
            try:
                out.add(bytes([hi, lo]).decode('gb2312'))
            except Exception:
                pass
    return out

def in_ranges(ch, ranges):
    c = ord(ch)
    for a, b in ranges:
        if a <= c <= b: return True
    return False

def parse_ranges(ur):
    ranges = []
    for r in ur.split(','):
        r = r.strip().replace('U+', '')
        if not r: continue
        if '-' in r: a, b = r.split('-'); ranges.append((int(a, 16), int(b, 16)))
        else: ranges.append((int(r, 16), int(r, 16)))
    return ranges

def subset_bytes(data, text):
    font = TTFont(io.BytesIO(data))
    opts = subset.Options(); opts.flavor = 'woff2'; opts.layout_features = ['*']; opts.name_IDs = ['*']; opts.notdef_outline = True; opts.hinting = False; opts.desubroutinize = True
    sub = subset.Subsetter(opts); sub.populate(text=text); sub.subset(font)
    buf = io.BytesIO(); font.flavor = 'woff2'; font.save(buf)
    return buf.getvalue()

def main():
    args = [a for a in sys.argv[1:] if not a.startswith('--')]
    skip = set()
    for flag in ('--require',):
        if flag in sys.argv:
            skip.add(sys.argv[sys.argv.index(flag) + 1])
    args = [a for a in args if a not in skip]
    common = '--common' in sys.argv
    if args and args[0].lower().endswith('.css'):
        out = args[0]; srcs = args[1:]
    else:
        out = DEFAULT_OUT; srcs = args
    if not srcs:
        print(__doc__); sys.exit(2)
    os.makedirs(os.path.dirname(os.path.abspath(out)), exist_ok=True)
    texts = [open(p, encoding='utf-8').read() for p in srcs if os.path.exists(p)]
    fams = families_from_links(texts)
    req_spec = '' if '--no-required' in sys.argv else (sys.argv[sys.argv.index('--require') + 1] if '--require' in sys.argv else DEFAULT_REQUIRED)
    own_text = parse_required(req_spec, fams) if req_spec else {}
    allchars = set()
    for t in texts:
        allchars |= set(t)
    # always include printable ASCII + common CJK punctuation
    allchars |= set(chr(c) for c in range(0x20, 0x7f))
    allchars |= set('，。、；：？！“”‘’（）《》〈〉【】—…·・～￥％＋－＝×÷→←↑↓★☆●○■□✓✕')
    if common:
        allchars |= gb2312_level1()
    text = ''.join(sorted(c for c in allchars if ord(c) >= 0x20))
    rules = []
    report = []
    missing = []
    idx = cache_index() if OFFLINE else {}
    def face_rule(name, style, weight, data, stretch='', urange=''):
        rules.append("@font-face{font-family:'%s';font-style:%s;font-weight:%s;%s%sfont-display:block;src:url(data:font/woff2;base64,%s) format('woff2')}" % (name, style, weight, ('font-stretch:%s;' % stretch) if stretch else '', ('unicode-range:%s;' % urange) if urange else '', base64.b64encode(data).decode('ascii')))
    # variable families with a width axis (e.g. Archivo wdth 62..125 for font-stretch): keep the axes, subset per unicode-range block
    for name, specs in sorted(VARIABLE.items()):
        ftext = own_text.get(name, text)
        for spec in specs:
            try:
                css = fetch_ua('https://fonts.googleapis.com/css2?family=%s:%s&display=swap' % (name.replace(' ', '+'), spec), MODERN_UA).decode('utf-8')
            except Offline:
                missing.append('%s (variable %s): not in the cache (offline)' % (name, spec)); continue
            for block in re.findall(r'@font-face\s*\{[^}]*\}', css):
                style = re.search(r'font-style:\s*(\w+)', block).group(1)
                weight = re.search(r'font-weight:\s*([\d ]+);', block).group(1).strip()
                stretch_m = re.search(r'font-stretch:\s*([\d% ]+);', block)
                m = re.search(r"src:\s*url\((https://[^)]+)\)", block)
                ur = re.search(r'unicode-range:\s*([^;]+);', block)
                if not m: continue
                ranges = parse_ranges(ur.group(1)) if ur else []
                block_text = ''.join(ch for ch in ftext if not ranges or in_ranges(ch, ranges))
                if not block_text.strip(): continue
                try:
                    data = subset_bytes(fetch_ua(m.group(1), MODERN_UA), block_text)
                except Offline:
                    missing.append('%s %s %s slice: file not in the cache (offline)' % (name, style, weight)); continue
                face_rule(name, style, weight, data, stretch_m.group(1).strip() if stretch_m else '', ur.group(1).strip() if ur else '')
                report.append({'family': name, 'style': style, 'weight': weight, 'variable': True, 'woff2KB': len(data) // 1024, 'chars': len(block_text)})
    for name, f in sorted(fams.items()):
        ftext = own_text.get(name, text)
        if name in VARIABLE:
            # the variable face covers its weight range; add static faces only for weights outside it
            lo_hi = []
            for spec in VARIABLE[name]:
                vals = spec.split('@')[1].split(',')
                axes = spec.split('@')[0].split(',')
                w = vals[axes.index('wght')] if 'wght' in axes else '400'
                a, _, b = w.partition('..'); lo_hi.append((int(a), int(b or a)))
            f['weights'] = set(w for w in f['weights'] if not any(a <= w <= b for a, b in lo_hi))
            if not f['weights']: continue
        if not f['weights']:
            f['weights'] = {400}
        wanted = [(w, s) for w in sorted(f['weights']) for s in (('normal', 'italic') if f['ital'] else ('normal',))]
        if OFFLINE:
            for w, s in wanted:
                recs = idx.get((name, s, str(w)), [])
                if not recs:
                    missing.append('%s %s %s: not in the cache (offline; run without --offline when online)' % (name, s, w)); continue
                whole = [r for r in recs if not r['range']]
                use = whole[:1] if whole else recs
                got = 0
                for r in use:
                    key = hashlib.sha1(r['url'].encode()).hexdigest(); key2 = hashlib.sha1((MODERN_UA + r['url']).encode()).hexdigest()
                    data = _cached(key) or _cached(key2)
                    if data is None:
                        continue
                    ranges = parse_ranges(r['range']) if r['range'] else []
                    block_text = ''.join(ch for ch in ftext if not ranges or in_ranges(ch, ranges))
                    if not block_text.strip():
                        got += 1; continue
                    sub_data = subset_bytes(data, block_text)
                    face_rule(name, s, str(w), sub_data, r['stretch'], r['range'])
                    report.append({'family': name, 'style': s, 'weight': str(w), 'srcKB': len(data) // 1024, 'woff2KB': len(sub_data) // 1024, 'chars': len(block_text), 'cached': True})
                    got += 1
                if not got:
                    missing.append('%s %s %s: font file not in the cache (offline)' % (name, s, w))
            continue
        try:
            css = css_for(name, f['weights'], f['ital'])
        except Offline:
            missing.append('%s: not in the cache (offline)' % name); continue
        for block in re.findall(r'@font-face\s*\{[^}]*\}', css):
            style = re.search(r'font-style:\s*(\w+)', block).group(1)
            weight = re.search(r'font-weight:\s*(\d+)', block).group(1)
            m = re.search(r"src:\s*url\((https://[^)]+)\)", block)
            if not m:
                continue
            try:
                ttf = fetch(m.group(1))
            except Offline:
                missing.append('%s %s %s: font file not in the cache (offline)' % (name, style, weight)); continue
            wtext = own_for(own_text, name, weight, ftext)
            data = subset_bytes(ttf, wtext)
            face_rule(name, style, weight, data)
            report.append({'family': name, 'style': style, 'weight': weight, 'ttfKB': len(ttf) // 1024, 'woff2KB': len(data) // 1024, 'chars': len(wtext)})
    open(out, 'w', encoding='utf-8').write('\n'.join(rules))
    total = sum(r['woff2KB'] for r in report)
    families = {}
    for r in report:
        fam = families.setdefault(r['family'], {'family': r['family'], 'weights': [], 'woff2KB': 0, 'license': LICENSE, 'source': 'Google Fonts（静态 TTF 经 fontTools 子集化为 WOFF2）', 'subset': ''})
        label = r['weight'] + ('' if r['style'] == 'normal' else ' ' + r['style']) + (' 可变' if r.get('variable') else '')
        if label not in fam['weights']: fam['weights'].append(label)
        fam['woff2KB'] += r['woff2KB']
    for name, fam in families.items():
        fam['subset'] = ('仅「%s」' % own_text[name]) if name in own_text else ('900 仅「%s」，其余全字集' % own_text[(name, 900)]) if (name, 900) in own_text else ('%d 字（源文件出现的字符%s）' % (len(text), ' + GB2312 一级常用字' if common else ''))
    want = sorted(set(fams.keys()) | set(VARIABLE.keys()))
    side = {'generated': time.strftime('%Y-%m-%d %H:%M UTC', time.gmtime()), 'chars': len(text), 'common': common, 'offline': OFFLINE, 'required': req_spec, 'wanted': want,
            'faces': len(report), 'totalKB': total, 'license': LICENSE, 'families': list(families.values()), 'missing': missing, 'faces_detail': report,
            'note': '许可：以上家族在 Google Fonts 公开目录下均为 SIL Open Font License 1.1；许可文本以各字体仓库为准，构建未复制许可全文。' + ('（--offline：只用了缓存里已有的字体）' if OFFLINE else '')}
    json.dump(side, open(out + '.json', 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    print(json.dumps({'out': out, 'chars': len(text), 'faces': len(report), 'totalKB': total, 'families': {k: v['weights'] for k, v in families.items()}, 'missing': missing}, ensure_ascii=False))

if __name__ == '__main__':
    main()

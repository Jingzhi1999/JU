# -*- coding: utf-8 -*-
"""Offline fonts for the my-r2 deliverable (ported unchanged from settings-r2/tools/embed-fonts.py; only the default paths differ).
Collects every Google Fonts <link> used by the built concept sources and the shell, downloads the static TTF of each
(family, weight, style) through the Google Fonts CSS API (generic client => one TTF per weight), subsets each file to the
characters that can actually appear (concept sources + shared core data + shell + appendix docs for the shell families),
and writes one CSS file of @font-face rules with base64 WOFF2 data that build.js inlines into the standalone page.

Usage (needs fonttools + brotli; /home/user/JU/.build/fontenv/bin/python has them):
  .build/fontenv/bin/python my-r2/tools/embed-fonts.py [out.css] <text-sources...> [--common]
    out.css      default my-r2/.fonts/fonts-embed.css (used when the first argument is not a .css path)
    sources      the built concept sources (my-r2/concepts/project/*.dc.html or the private .build/CNN.html files),
                 my-r2/src/core/ju-data.js, my-r2/src/shell/shell.html and the appendix docs
    --common     also include the 3,755 GB2312 level-1 characters (what people may type into inputs)
  then: JU_FONTS_CSS=my-r2/.fonts/fonts-embed.css node my-r2/src/build.js
The download cache lives in my-r2/.fonts/cache/ (not committed)."""
import sys, os, re, json, base64, hashlib, urllib.request, urllib.parse, io
from fontTools import subset
from fontTools.ttLib import TTFont

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
FONTS_DIR = os.path.join(ROOT, 'my-r2', '.fonts')
CACHE = os.path.join(FONTS_DIR, 'cache')
DEFAULT_OUT = os.path.join(FONTS_DIR, 'fonts-embed.css')
os.makedirs(CACHE, exist_ok=True)
UA = 'Mozilla/4.0 (compatible; fonts-subsetter)'  # generic client => static TTF per weight

def fetch(url):
    key = hashlib.sha1(url.encode()).hexdigest()
    p = os.path.join(CACHE, key)
    if os.path.exists(p):
        return open(p, 'rb').read()
    req = urllib.request.Request(url, headers={'User-Agent': UA})
    data = urllib.request.urlopen(req, timeout=180).read()
    open(p, 'wb').write(data)
    return data

MODERN_UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36'
VARIABLE = {}  # family -> list of raw specs that use a width (wdth) axis: embedded as subset variable woff2

def fetch_ua(url, ua):
    key = hashlib.sha1((ua + url).encode()).hexdigest()
    p = os.path.join(CACHE, key)
    if os.path.exists(p):
        return open(p, 'rb').read()
    req = urllib.request.Request(url, headers={'User-Agent': ua})
    data = urllib.request.urlopen(req, timeout=180).read()
    open(p, 'wb').write(data)
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

def css_for(name, weights, ital):
    fam = name.replace(' ', '+')
    if ital:
        spec = 'ital,wght@' + ';'.join(['0,%d' % w for w in sorted(weights)] + ['1,%d' % w for w in sorted(weights)])
    else:
        spec = 'wght@' + ';'.join(str(w) for w in sorted(weights))
    url = 'https://fonts.googleapis.com/css2?family=%s:%s&display=swap' % (fam, spec)
    try:
        return fetch(url).decode('utf-8')
    except Exception:
        return fetch('https://fonts.googleapis.com/css2?family=%s&display=swap' % fam).decode('utf-8')

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

def main():
    args = [a for a in sys.argv[1:] if not a.startswith('--')]
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
    def subset_bytes(data, text):
        font = TTFont(io.BytesIO(data))
        opts = subset.Options(); opts.flavor = 'woff2'; opts.layout_features = ['*']; opts.name_IDs = ['*']; opts.notdef_outline = True; opts.hinting = False; opts.desubroutinize = True
        sub = subset.Subsetter(opts); sub.populate(text=text); sub.subset(font)
        buf = io.BytesIO(); font.flavor = 'woff2'; font.save(buf)
        return buf.getvalue()
    def in_ranges(ch, ranges):
        c = ord(ch)
        for a, b in ranges:
            if a <= c <= b: return True
        return False
    # variable families with a width axis (e.g. Archivo wdth 62..125 for font-stretch): keep the axes, subset per unicode-range block
    for name, specs in sorted(VARIABLE.items()):
        for spec in specs:
            css = fetch_ua('https://fonts.googleapis.com/css2?family=%s:%s&display=swap' % (name.replace(' ', '+'), spec), MODERN_UA).decode('utf-8')
            for block in re.findall(r'@font-face\s*\{[^}]*\}', css):
                style = re.search(r'font-style:\s*(\w+)', block).group(1)
                weight = re.search(r'font-weight:\s*([\d ]+);', block).group(1).strip()
                stretch_m = re.search(r'font-stretch:\s*([\d% ]+);', block)
                m = re.search(r"src:\s*url\((https://[^)]+)\)", block)
                ur = re.search(r'unicode-range:\s*([^;]+);', block)
                if not m: continue
                ranges = []
                if ur:
                    for r in ur.group(1).split(','):
                        r = r.strip().replace('U+', '')
                        if '-' in r: a, b = r.split('-'); ranges.append((int(a, 16), int(b, 16)))
                        else: ranges.append((int(r, 16), int(r, 16)))
                block_text = ''.join(ch for ch in text if not ranges or in_ranges(ch, ranges))
                if not block_text.strip(): continue
                data = subset_bytes(fetch_ua(m.group(1), MODERN_UA), block_text)
                rules.append("@font-face{font-family:'%s';font-style:%s;font-weight:%s;%sfont-display:block;src:url(data:font/woff2;base64,%s) format('woff2')}" % (name, style, weight, ('font-stretch:%s;' % stretch_m.group(1).strip()) if stretch_m else '', base64.b64encode(data).decode('ascii')))
                report.append({'family': name, 'style': style, 'weight': weight, 'variable': True, 'woff2KB': len(data) // 1024})
    for name, f in sorted(fams.items()):
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
        css = css_for(name, f['weights'], f['ital'])
        for block in re.findall(r'@font-face\s*\{[^}]*\}', css):
            style = re.search(r'font-style:\s*(\w+)', block).group(1)
            weight = re.search(r'font-weight:\s*(\d+)', block).group(1)
            m = re.search(r"src:\s*url\((https://[^)]+)\)", block)
            if not m:
                continue
            ttf = fetch(m.group(1))
            font = TTFont(io.BytesIO(ttf))
            opts = subset.Options(); opts.flavor = 'woff2'; opts.layout_features = ['*']; opts.name_IDs = ['*']; opts.notdef_outline = True; opts.hinting = False; opts.desubroutinize = True
            sub = subset.Subsetter(opts); sub.populate(text=text); sub.subset(font)
            buf = io.BytesIO(); font.flavor = 'woff2'; font.save(buf)
            data = buf.getvalue()
            rules.append("@font-face{font-family:'%s';font-style:%s;font-weight:%s;font-display:block;src:url(data:font/woff2;base64,%s) format('woff2')}" % (name, style, weight, base64.b64encode(data).decode('ascii')))
            report.append({'family': name, 'style': style, 'weight': weight, 'ttfKB': len(ttf) // 1024, 'woff2KB': len(data) // 1024})
    open(out, 'w', encoding='utf-8').write('\n'.join(rules))
    total = sum(r['woff2KB'] for r in report)
    print(json.dumps({'chars': len(text), 'faces': len(report), 'totalKB': total, 'faces_detail': report}, ensure_ascii=False))

if __name__ == '__main__':
    main()

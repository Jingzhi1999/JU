# -*- coding: utf-8 -*-
"""Offline fonts for the R2 deliverable.
Collects every Google Fonts <link> used by the built concept sources and the shell, downloads the static TTF of each
(family, weight, style) through the Google Fonts CSS API (generic client => one TTF per weight), subsets each file to the
characters that can actually appear (concept sources + shared core data + shell + appendix docs for the shell families),
and writes one CSS file of @font-face rules with base64 WOFF2 data that build.js inlines into the standalone page.

Usage (needs fonttools + brotli; the scratchpad venv has them):
  <venv>/bin/python settings-r2/tools/embed-fonts.py <out.css> <text-sources...>
The download cache lives in .build/fonts-cache/ (not committed)."""
import sys, os, re, json, base64, hashlib, urllib.request, urllib.parse, io
from fontTools import subset
from fontTools.ttLib import TTFont

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
CACHE = os.path.join(ROOT, '.build', 'fonts-cache')
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

def main():
    out = sys.argv[1]
    srcs = sys.argv[2:]
    texts = [open(p, encoding='utf-8').read() for p in srcs if os.path.exists(p)]
    fams = families_from_links(texts)
    allchars = set()
    for t in texts:
        allchars |= set(t)
    # always include printable ASCII + common CJK punctuation
    allchars |= set(chr(c) for c in range(0x20, 0x7f))
    allchars |= set('，。、；：？！“”‘’（）《》〈〉【】—…·・～￥％＋－＝×÷→←↑↓★☆●○■□✓✕')
    text = ''.join(sorted(c for c in allchars if ord(c) >= 0x20))
    rules = []
    report = []
    for name, f in sorted(fams.items()):
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

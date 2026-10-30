# -*- coding: utf-8 -*-
"""Builds my-r2/evidence/index.json (+ small JPEG thumbnails under my-r2/evidence/_thumbs/) for the shell's 证据画廊:
build.js inlines each item's thumbnail as a data URI into the deliverable, so the gallery works offline.
What is indexed: the named state screenshots directly in my-r2/evidence/<CODE>/ (home-joined.png, detail.png, …; group 静态)
and every sheet.png / sheet.jpg one folder deeper (my-r2/evidence/<CODE>/<flow>/sheet.png; group = the folder name, e.g.
flow-enter, ritual-tear, coverage, widths, kb, rm). A hand-written note per file can be kept in my-r2/evidence/<CODE>/notes.json
({"detail.png": "普通局内详情 · 已预留", "flow-enter/sheet.png": "进入—操作—返回 1×"}) and is copied into the index.
Run: python3 -I my-r2/tools/evidence-index.py [--root /home/user/JU/my-r2/evidence] [--codes C01,C02] [--width 260] [--quality 72] [--format jpg|webp] [--fresh]
Output: <root>/index.json  { "generated": "...", "items": [ { "code", "group", "title", "file", "thumb", "note" } ] }"""
import os, sys, json, re, time
from PIL import Image
def opt(k, d):
    return sys.argv[sys.argv.index('--' + k) + 1] if '--' + k in sys.argv else d
root = os.path.abspath(opt('root', '/home/user/JU/my-r2/evidence'))
codes = [c for c in opt('codes', '').split(',') if c] or sorted(d for d in os.listdir(root) if re.match(r'^C\d\d$', d) and os.path.isdir(os.path.join(root, d)))
width = int(opt('width', '260')); quality = int(opt('quality', '72')); FMT = opt('format', 'jpg'); ritual_w = int(opt('ritual-width', '0')) or None   # three frames side by side read better a little wider   # --format webp: about a third smaller   # the deliverable must stay ≤ 16 MB: thumbnails are kept small
thumbs = os.path.join(root, '_thumbs')
items = []
# gallery order = the order of the brief's per-concept evidence list (默认首屏 ×2, 详情, 管理 / 出席, 历史, 空态, 操作后的稳定结果,
# 进入—操作—返回 1×, 四个仪式); anything else follows alphabetically
TITLES = {'home-joined': '参加者默认首屏', 'home-hosted': '局主默认首屏', 'detail': '普通局内详情', 'manage': '关键管理 / 出席状态', 'history': '历史',
          'empty': '空态', 'result': '关键操作后的稳定结果', 'flow-enter': '进入—操作—返回 · 1×', 'ritual-print': '仪式 · 出票',
          'ritual-tear': '仪式 · 撕票', 'ritual-burn': '仪式 · 作废燃烧', 'ritual-stamp': '仪式 · 出席章', 'coverage-matrix': '50 个索引状态'}
GROUPS = {'coverage-matrix': '入口存在（接触表）', 'flow-enter': '录帧', 'ritual-print': '触发 · 发展 · 落定', 'ritual-tear': '触发 · 发展 · 落定', 'ritual-burn': '触发 · 发展 · 落定', 'ritual-stamp': '触发 · 发展 · 落定'}
ORDER = ['home-joined', 'home-hosted', 'detail', 'manage', 'history', 'empty', 'result', 'flow-enter', 'ritual-print', 'ritual-tear', 'ritual-burn', 'ritual-stamp', 'coverage-matrix']
def thumb_for(rel, w=None):
    w = w or width
    src = os.path.join(root, rel); dst = os.path.join(thumbs, os.path.splitext(rel)[0] + ('.webp' if FMT == 'webp' else '.jpg'))
    os.makedirs(os.path.dirname(dst), exist_ok=True)
    if not os.path.exists(dst) or os.path.getmtime(dst) < os.path.getmtime(src) or '--fresh' in sys.argv:
        im = Image.open(src).convert('RGB'); im.thumbnail((w, w * 4)); im.save(dst, 'WEBP', quality=quality, method=6) if FMT == 'webp' else im.save(dst, quality=quality, optimize=True)
    return os.path.relpath(dst, root)
for code in codes:
    base = os.path.join(root, code)
    notes = {}
    np_ = os.path.join(base, 'notes.json')
    if os.path.exists(np_):
        try: notes = json.load(open(np_, encoding='utf-8'))
        except Exception as e: print('notes.json unreadable for', code, e)
    for f in sorted(os.listdir(base), key=lambda f: (ORDER.index(os.path.splitext(f)[0]) if os.path.splitext(f)[0] in ORDER else 99, f)):
        p = os.path.join(base, f)
        if os.path.isfile(p) and f.lower().endswith(('.png', '.jpg', '.jpeg')):
            rel = code + '/' + f
            items.append({'code': code, 'group': '静态', 'title': TITLES.get(os.path.splitext(f)[0], os.path.splitext(f)[0]), 'file': rel, 'thumb': thumb_for(rel), 'note': notes.get(f, '')})
    for d in sorted(os.listdir(base), key=lambda d: (ORDER.index(d) if d in ORDER else 99, d)):
        dp = os.path.join(base, d)
        if not os.path.isdir(dp) or d in ('verify', 'stage1', 'coverage-matrix'):   # 50 states in one contact sheet are illegible as a thumbnail; the 覆盖表 page links the states
            continue
        for sheet in ('sheet.png', 'sheet.jpg', 'sheet-gray.png', 'sheet-gray.jpg'):
            sp = os.path.join(dp, sheet)
            if os.path.exists(sp):
                rel = code + '/' + d + '/' + sheet
                items.append({'code': code, 'group': GROUPS.get(d, d), 'title': TITLES.get(d, d) + (' · 灰度' if 'gray' in sheet else ''), 'file': rel, 'thumb': thumb_for(rel, ritual_w if d.startswith('ritual-') else None), 'note': notes.get(d + '/' + sheet, '')})
out = {'generated': time.strftime('%Y-%m-%d %H:%M UTC', time.gmtime()), 'items': items}
json.dump(out, open(os.path.join(root, 'index.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
print(json.dumps({'index': os.path.join(root, 'index.json'), 'codes': codes, 'items': len(items)}, ensure_ascii=False))

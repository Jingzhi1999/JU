import json, os, sys, collections
from PIL import Image
T = '/home/user/JU/settings-r2/research/.tools/'
OUT = '/home/user/JU/settings-r2/research'; REPO = '/home/user/JU'
store = json.load(open(OUT + '/ledger.json'))
ORDER = ['slug','name','creator','period','cat','url','viewed','what_seen','method','affects','avoid','evidence','motion_seen','award','inherited']
EXTRA = ['url_viewed','concepts','tags','brief','status']
errs = []
for c in store:
    if not c['evidence']: errs.append(f"{c['slug']}: no evidence")
    for e in c['evidence']:
        p = os.path.join(REPO, e)
        if not e.startswith('settings-r2/research/evidence/' + c['slug'] + '/'): errs.append(f"{c['slug']}: path not under slug folder: {e}")
        if not os.path.exists(p): errs.append(f"{c['slug']}: missing {e}"); continue
        if os.path.getsize(p) > 400*1024: errs.append(f"{c['slug']}: >400KB {e}")
        try:
            if Image.open(p).format != 'JPEG': errs.append(f"{c['slug']}: not JPEG {e}")
        except Exception as ex: errs.append(f"{c['slug']}: unreadable {e} {ex}")
dup = [s for s, n in collections.Counter(c['slug'] for c in store).items() if n > 1]
if dup: errs.append(f'duplicate slugs {dup}')
for u, n in collections.Counter(c['url'] for c in store).items():
    if n > 1: errs.append(f'duplicate url ({n}x): {u}')
folders = set(os.listdir(OUT + '/evidence')); used = set(c['slug'] for c in store)
for f in sorted(folders - used): errs.append(f'orphan evidence folder: {f}')
for c in store:
    d = OUT + '/evidence/' + c['slug']
    if os.path.isdir(d):
        for fn in os.listdir(d):
            rel = f"settings-r2/research/evidence/{c['slug']}/{fn}"
            if rel not in c['evidence']: errs.append(f'unlisted evidence file: {rel}')
out = []
for c in store:
    d = {k: c[k] for k in ORDER}
    for k in EXTRA:
        if k in c: d[k] = c[k]
    out.append(d)
json.dump(out, open(f'{OUT}/ledger.json', 'w'), ensure_ascii=False, indent=1)
cnt = collections.Counter(c['cat'] for c in store); tags = lambda c: c.get('tags', [])
settings_ui = [c['slug'] for c in store if c['cat']=='ui' and 'settings-screen' in tags(c)]
zh_ed = [c['slug'] for c in store if c['cat']=='editorial' and 'zh' in tags(c)]
mob = [c['slug'] for c in store if c['cat']=='motion' and 'mobile-evidence' in tags(c)]
mseen = [c['slug'] for c in store if c['motion_seen']]
inh = [c['slug'] for c in store if c['inherited']]
five = [c['slug'] for c in store if c['cat']=='designer' and 'five-designers' in tags(c)]
summary = {'total': len(store), 'by_cat': dict(cnt), 'settings_screen_ui': len(settings_ui), 'zh_editorial': len(zh_ed), 'motion_mobile_evidence': len(mob), 'motion_seen': len(mseen), 'inherited': len(inh), 'new': len(store)-len(inh), 'designer_five': len(five)}
print(json.dumps(summary, ensure_ascii=False))
for e in errs: print('ERR', e)
json.dump({'summary': summary, 'settings_ui': settings_ui, 'zh_ed': zh_ed, 'mob': mob, 'mseen': mseen, 'inh': inh, 'five': five}, open(T + 'cases/summary.json', 'w'), ensure_ascii=False, indent=1)
def frag(name):
    p = f'{T}md/{name}.md'
    return open(p).read().strip() if os.path.exists(p) else f'（{name} 待补）'
catname = {'ui':'界面','motion':'动效','editorial':'编辑','designer':'设计师','award':'获奖'}
def cell(s): return str(s).replace('|','｜').replace('\n',' ')
L = ['# JU「设置」R2 · 研究台账', '']
L.append(f"- 合计 **{len(store)}** 例（每例一个主类别）：界面 {cnt['ui']}（其中真实设置 / 资料 / 通知 / 外观 / 隐私 / 账户画面 {len(settings_ui)}）· 动效 {cnt['motion']}（有真实移动端证据 {len(mob)}）· 编辑 {cnt['editorial']}（中文 {len(zh_ed)}）· 设计师 {cnt['designer']}（五位指定设计师 {len(five)}）· 获奖 {cnt.get('award',0)}。")
L.append(f"- 实际看过动态帧（motion_seen）{len(mseen)} 例；新开案例 {len(store)-len(inh)} 例，继承并重写转译 {len(inh)} 例（来源 slug 见 ledger.json 的 inherited）。")
L.append('- 证据路径相对仓库根（`settings-r2/research/evidence/<slug>/…jpg`，每张 ≤ 400 KB）；表内「证据」列只写文件名。失败来源见 `failures.md`，不计入。「·动」= 实际看过动态帧。')
L.append('- 「实际看到」列是压缩版；逐屏 / 逐帧的完整记录、尺寸与颜色测量在 `ledger.json` 的 what_seen。')
L.append('')
L.append('| 编号 | 作品 | 创作者·年份 | 类别 | 实际看到 | 要学的方法 | 影响 JU 的元素（方案） | 不照搬 | 证据 |')
L.append('|---|---|---|---|---|---|---|---|---|')
for i, c in enumerate(store, 1):
    ev = '<br>'.join(e.split('/')[-1] for e in c['evidence'])
    conc = '、'.join(c.get('concepts', [])); mark = '（继承）' if c['inherited'] else ''
    cat = catname[c['cat']] + ('·动' if c['motion_seen'] else '')
    aw = f"<br>奖项：{cell(c['award'])}" if c['cat']=='award' and c['award'] else ''
    L.append(f"| R{i:02d} | [{cell(c['name'])}]({c['url']}){mark}<br>`{c['slug']}` | {cell(c['creator'])} · {cell(c['period'])} | {cat} | {cell(c.get('brief') or c['what_seen'])}{aw} | {cell(c['method'])} | {cell(c['affects'])}（{conc}） | {cell(c['avoid'])} | {ev} |")
L += ['', '## 可复用原则', '', frag('principles'), '', '## 七个指定入口', '', frag('mandatory'), '', '## 每套参考', '', frag('per-concept'), '']
open(f'{OUT}/ledger.md', 'w').write('\n'.join(L) + '\n')
print('wrote ledger.json + ledger.md')

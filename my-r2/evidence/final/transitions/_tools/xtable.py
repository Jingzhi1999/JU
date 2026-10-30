# Build <E>/transitions.md from <E>/<C>/merged.json.  python3 -I xtable.py <E> <notes.json>
import json, os, sys
E = sys.argv[1]; notes = json.load(open(sys.argv[2])) if len(sys.argv) > 2 else {}
CODES = ['C01', 'C02', 'C03', 'C04', 'C06', 'C07', 'C08', 'C09', 'C10', 'C05']
SEGS = [('1-row-detail', '行→详情'), ('2-detail-back', '详情→返回'), ('3-row-ticket', '首页→票根'), ('4-ticket-back', '票根→返回'),
        ('5-role-hosted', '参加→发起'), ('6-role-joined', '发起→参加'), ('7-sec-history', '当前→历史'), ('8-sec-current', '历史→当前'),
        ('9-read-entry', '入口→阅读层'), ('10-read-back', '阅读层→返回')]
EXTRA = [('11-back-during-print', '出票中按返回'), ('12-row-after-role', '换角色后≈150ms 点行'), ('13-back-immediately', '紧接着返回')]
LAB = dict(SEGS + EXTRA)
def num(v): return ('%g' % v)
def cell(x):
    if not x: return '—'
    if x.get('err'): return '未测（%s）' % str(x['err'])[:20]
    c = '%s/%s·%s·%s·%s' % (num(x['blank_ms']), num(x['blank_frames']), num(x['one_frames']), num(x['overlap_frames']), num(x['dup_frames']))
    if not x.get('reached'): c += '（未到 %s）' % (x.get('after') or '').split('|')[0]
    if x.get('flag'): c = '**' + c + '**'
    if x.get('occasional'): c += '†'
    return c
def why(c, x, which):
    w = []
    for f in which:
        e = x['evidence'].get(f, {}); run = '第 %d 次' % e['run'] if e else ''
        if f == 'near-blank': w.append('近空白：三次 %s ms（中位 %s）；%s %s，截屏 `%s/%s/%s`%s' % ('/'.join(str(v) for v in x['near_list']), num(x['near_ms']), run, e.get('at', ''), c, e.get('dir', ''), e.get('files') or '—', '（这一次只有 1 个采样：主线程长任务期间合成线程仍在出图，实际时长可能更短，属临界）' if e.get('frames') == 1 else ''))
        if f == 'overlap': w.append('叠印：%d/3 次出现；%s %s，截屏 `%s/%s/%s`，例「%s」' % (x['ovl_runs'], run, e.get('at', ''), c, e.get('dir', ''), e.get('files') or '—', (e.get('example') or '')[:40]))
        if f == 'dup-title': w.append('两份局名：%d/3 次出现；%s %s，截屏 `%s/%s/%s`，%s' % (x['dup_runs'], run, e.get('at', ''), c, e.get('dir', ''), e.get('files') or '—', (e.get('example') or '')[:40]))
    return '；'.join(w)
data = {c: json.load(open(os.path.join(E, c, 'merged.json'))) for c in CODES if os.path.exists(os.path.join(E, c, 'merged.json'))}
out = ['# 十套转场横向测量（1× · 真实点击 · 页内逐帧探针 + CDP 截屏流 · 每套三次取中位数）', '',
       '口径（每套同一把尺子）：',
       '- 路径：首页行「法拉盛早茶」→ 详情 → 返回；首页行「外百老汇小剧场」（已撕票）→ 票根 → 返回；角色 参加 → 发起 → 参加；分区 当前 → 历史 → 当前；「周六早午餐」的阅读并确认入口 → 阅读层 → 返回。每组前 `inst.reset()`，环境引擎暂停，1×，每段从 pointerdown 起采 1.3s。每套跑三次（负载记在每套 `probe.json` 与 `merged.json`，全程 1 分钟负载 < 3）。',
       '- 采样：pointerdown 时取一次基线，之后每一帧在 rAF 之后的任务里取（= 这一帧画完的状态），约 16.7ms 一次。文字 = 手机内全部 DOM 文字，去掉角色 / 分区切换钮、返回钮、底部根导航。一段文字「可见」需同时满足：祖先不透明度 × 文字色 alpha × 祖先的线性渐变遮罩（mask-image）> 0.3；至少 60% 在手机框内；该点没有 ≥50% 不透明的有底色层（含 ::before / ::after 底色）盖住（命中测试，采样期间临时让所有层可命中、去掉 inert）；与身后底色的对比度 ≥ 1.5（白字落到浅底上不算可见）。画在 canvas 里的字（撕票副券、出票、燃烧）不计。',
       '- 四个数（每格 `全部文字≤0.3 最长 ms/帧 · 只剩一行标题的帧数 · 叠印帧数 · 两份局名帧数`，均为三次的中位数）：只剩一行标题 = 可见文字整体高度 ≤ 76px（页头标题 + 副行算一行）；叠印 = 两段不同的可见文字行框重叠 ≥ 30%（起止两帧本来就有的、完全对齐的同一串字不算，倒计时数字归一）；两份局名 = 同一局名可见 ≥ 2 份且多于起止状态。',
       '- 门槛（主负责人定）：「全部 ≤0.3」或「只剩一行标题」连续 > 34ms（约一个 30fps 绘制帧，60fps 下 ≥ 3 次绘制）记超出，按三次中位数判；叠印、两份局名三次里 ≥ 2 次出现记超出，只出现 1 次标 †（偶发）。超出的格子加粗。',
       '- 已知限制：探针只看 DOM；合成线程上的动画可能比主线程采样早一帧，单段数值有 ±1 帧（≈17ms）误差，30–40ms 的值属临界；每条超出都对照过截屏流。', '',
       '| 方案 | ' + ' | '.join(l for _, l in SEGS) + ' |', '|' + '---|' * (len(SEGS) + 1)]
for c in CODES:
    if c not in data: out.append('| %s | %s |' % (c, ' | '.join(['未测'] * len(SEGS)))); continue
    by = {x['name']: x for x in data[c]['segs']}; label = c + ('（%s）' % notes[c] if c in notes else '')
    out.append('| %s | %s |' % (label, ' | '.join(cell(by.get(k)) for k, _ in SEGS)))
concl = ''
if 'C05' in data:
    by = {x['name']: x for x in data['C05']['segs']}
    out += ['', 'C05 另测两段（第 3 轮的「主线程忙」场景：出票中 ≈450ms 按返回；换角色后 ≈150ms 点「看展搭子」，≈330ms 后立即返回）：', '',
            '| 方案 | ' + ' | '.join(l for _, l in EXTRA) + ' |', '|' + '---|' * (len(EXTRA) + 1), '| C05 | ' + ' | '.join(cell(by.get(k)) for k, _ in EXTRA) + ' |']
    allx = [by[k] for k, _ in SEGS + EXTRA if k in by and not by[k].get('err')]
    bad = [(k, by[k]) for k, _ in SEGS + EXTRA if k in by and by[k].get('flag')]
    occ = [(k, by[k]) for k, _ in SEGS + EXTRA if k in by and by[k].get('occasional')]
    nm = max(allx, key=lambda r: r['near_ms']) if allx else None
    if not bad:
        concl = 'C05 结论（%s）：十三段的近空白 / 只剩标题 / 叠印 / 两份局名都在门槛之内——近空白最长 %s ms（%s，中位数），只剩一行标题最多 %s 帧，叠印与两份局名均为 0%s。' % (notes.get('C05', ''), num(nm['near_ms']), LAB[nm['name']], num(max(r['one_frames'] for r in allx)), ('（偶发：%s）' % '、'.join(LAB[k] for k, _ in occ)) if occ else '')
    else:
        concl = 'C05 结论（%s）：%d 段超出门槛——%s；其余在门槛之内。' % (notes.get('C05', ''), len(bad), '；'.join('%s（%s）' % (LAB[k], why('C05', x, x['flag'])) for k, x in bad))
    out += ['', concl]
out += ['', '## 超出门槛的段（三次中位数判定；证据取第一次出现该问题的那次：#k = 探针采样号与 pointerdown 后毫秒，截屏 = 该套文件夹里的 fNNN.jpg，左下角洋红标签是采样号）', '']
anyb = False
for c in CODES:
    if c not in data: continue
    for x in data[c]['segs']:
        if x.get('flag'):
            anyb = True; e = list(x['evidence'].values())[0] if x['evidence'] else {}
            out.append('- **%s · %s**：%s。接触表 `%s/%s`。' % (c, LAB[x['name']], why(c, x, x['flag']), c, e.get('sheet') or '—'))
if not anyb: out.append('无。')
occl = [(c, x) for c in CODES if c in data for x in data[c]['segs'] if x.get('occasional')]
if occl:
    out += ['', '偶发（三次中只出现一次，未计入超出）：', '']
    for c, x in occl: out.append('- %s · %s：%s。' % (c, LAB[x['name']], why(c, x, x['occasional'])))
open(os.path.join(E, 'transitions.md'), 'w').write('\n'.join(out) + '\n')
print(concl); print('flagged segments:', sum(1 for c in data for x in data[c]['segs'] if x.get('flag')))

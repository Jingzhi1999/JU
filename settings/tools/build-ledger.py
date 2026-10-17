# -*- coding: utf-8 -*-
"""Merges research/ledger.json (inherited 94) with settings/research/draft-*.md (new) into settings/research/ledger.md.
Run: python3 -I settings/tools/build-ledger.py"""
import json,re,os,datetime
root='/home/user/JU'
a=json.load(open(f'{root}/research/ledger.json',encoding='utf-8'))
cat_zh={'ui':'专业 UI/UX、独立设计师与工作室项目','motion':'有动态证据的交互／数字体验案例','editorial':'时尚杂志、独立出版物与编辑设计','designer':'设计师品牌／设计师具体作品','award':'获奖项目原始案例'}
tr=json.load(open(f'{root}/settings/tools/ledger-translations.json',encoding='utf-8'))
def ev(x):
    out=[]
    for e in x['evidence']:
        e=re.sub(r'^.*?/research/evidence/','',e); e=e.replace('research/evidence/',''); out.append(e)
    return out
def exists_any(p):
    q=p[:-4]+'.jpg' if p.endswith('.png') else p
    return os.path.exists(f'{root}/research/evidence/{q}') or os.path.exists(f'{root}/research/evidence/{p}')
rows=[]; cc={}; sc={}
for x in a:
    cc[x['category']]=cc.get(x['category'],0)+1; sc[x['status']]=sc.get(x['status'],0)+1
    evs=ev(x); ok=sum(1 for e in evs if exists_any(e))
    rows.append(f"| {x['id']} | {x['name'].replace('|','｜')} | {x['creator'].replace('|','｜')} · {x['period'].replace('|','｜')} | {x['category']} | {x['status']} | [{x['url'][:50]}…]({x['url']}) | {(x.get('viewed') or '').replace('|','｜')} | {'；'.join(evs)}（可核对 {ok}/{len(evs)}） | {x['observation'].replace('|','｜')[:420]} | {tr.get(x['id'],'继承 · 本轮未映射到具体方案；原转译（我的局）：'+x['translation'].replace('|','｜')[:160])} |")
new=[]; fails=[]; principles=[]
for f in ['draft-ui-settings.md','draft-motion-settings.md','draft-editorial-designer-settings.md']:
    p=f'{root}/settings/research/{f}'
    if not os.path.exists(p): continue
    txt=open(p,encoding='utf-8').read()
    for l in txt.split('\n'):
        if re.match(r'^S[UMED]\d+｜',l):
            c=[s.strip() for s in l.split('｜')]
            cat={'SU':'ui','SM':'motion','SE':'editorial','SD':'designer'}[c[0][:2]]
            new.append((c,cat))
    m=re.search(r'(访问失败[^\n]*)\n([\s\S]*?)(?=\n#|\n可复用|\n\*\*可复用|\Z)',txt)
    if m: fails.append((f,m.group(2).strip()))
    m=re.search(r'(可复用[^\n]*原则[^\n]*)\n([\s\S]*?)(?=\n#|\Z)',txt)
    if m: principles.append((f,m.group(2).strip()))
ncc={}; nsc={}
for c,cat in new: ncc[cat]=ncc.get(cat,0)+1; st=c[11] if len(c)>11 else ''; nsc[st]=nsc.get(st,0)+1
newrows=[f"| {c[0]} | {c[1]} | {c[2]} · {c[3]} | {cat} | {c[11] if len(c)>11 else ''} | [{c[4][:50]}…]({c[4]}) | {c[5]} | {c[6]} | {c[7][:600]} | {c[8]} | {c[9]} |" for c,cat in new]
total=len(a)+len(new)
now=datetime.datetime.now(datetime.timezone.utc).strftime('%Y-%m-%d %H:%M UTC')
tot={k:cc.get(k,0)+ncc.get(k,0) for k in cat_zh}
hdr=f"""# JU「设置」· 研究台账（继承 + 设置专项新增）

- 生成：{now}；由 `settings/tools/build-ledger.py` 从 `research/ledger.json`（上一轮 94 例）与 `settings/research/draft-*.md`（本轮新增）合并。
- 合计 **{total}** 例（每例只计一个主类别）：{'、'.join(f'{cat_zh[k]} {tot[k]}' for k in ['ui','motion','editorial','designer','award'])}。其中继承 {len(a)}（已看动效 {sc.get('已看动效',0)}），本轮新增 {len(new)}（{'、'.join(f'{cat_zh[k]} {v}' for k,v in ncc.items())}；已看动效 {nsc.get('已看动效',0)}）。
- 简报最低构成核对：UI ≥16 → {tot['ui']}；动态 ≥12 → {tot['motion']}；编辑设计 ≥8 → {tot['editorial']}；设计师作品 ≥10 → {tot['designer']}；获奖 ≥4 → {tot['award']}；合计 ≥50 → {total}。
- 设置专项核对：UI 类中与设置 / 偏好 / 个人信息 / 内容管理 / 多层编辑相关 ≥8 → 本轮新增 SU01–SU12 共 {ncc.get('ui',0)} 例全部满足；动态类中有真实移动端界面或移动端操作演示证据 ≥6 → 本轮新增 SM02–SM06（5 例真实手机界面录像）+ SM01 / SM08（手机组件规范视频）+ 继承 REF27 / 28 / 29 / 30 / 31 / 32 / 36 / 42 / 44 / 46 / 47。
- 继承案例的「对设置的转译」列：已映射到具体方案的写明转译与方案编号；未映射的保留上一轮原转译并标「继承 · 本轮未映射」。每套的映射见 `settings/spec/concept-refs.md`。
- 证据根目录：`research/evidence/`（新增案例的 slug 在表内）。新增案例的证据文件已由主负责人脚本核对存在（见 `JU-SETTINGS-PROJECT-RECORD.md` §D）。

## 一、本轮新增（设置专项）

| 编号 | 作品名 | 创作者 · 年份／系列 | 类别 | 采用状态 | 原始来源 | 实际查看位置 | 证据路径（相对 research/evidence/） | 具体观察 | 可用于设置的结论 | 不适合照搬 |
|---|---|---|---|---|---|---|---|---|---|---|
"""+"\n".join(newrows)+"""

## 二、继承案例（上一轮 94 例；证据与原始观察不变）

| 编号 | 案例／作品 | 创作者 · 年份／系列 | 类别 | 状态 | 原始 URL | 实际查看位置 | 证据文件 | 具体观察（原） | 对「设置」的转译 |
|---|---|---|---|---|---|---|---|---|---|
"""+"\n".join(rows)+"""

## 三、访问失败／未立案（本轮新增批次）
"""+"\n".join(f"### {f}\n{t}" for f,t in fails)+"""

## 四、可复用原则（本轮新增批次提炼）
"""+"\n".join(f"### {f}\n{t}" for f,t in principles)+"""

## 五、每套映射
见 `settings/spec/concept-refs.md`（每套 5–8 例，跨 ≥3 类）。
"""
open(f'{root}/settings/research/ledger.md','w',encoding='utf-8').write(hdr)
print('ledger written', total, 'cases;', len(new), 'new;', tot)

# -*- coding: utf-8 -*-
"""Generates JU-MY-JU-PROJECT-RECORD.md from the hand-written body (tools/record/body.md) plus tables generated
from research/ledger.json, evidence folders and git state. Re-run after each milestone: python3 -I tools/record/build-record.py"""
import json, os, subprocess, datetime, glob
ROOT='/home/user/JU'
def sh(c):
    try: return subprocess.check_output(c, shell=True, cwd=ROOT, text=True, stderr=subprocess.STDOUT).strip()
    except subprocess.CalledProcessError as e: return (e.output or '').strip()
now=datetime.datetime.now(datetime.timezone.utc).strftime('%Y-%m-%d %H:%M UTC')
body=open(f'{ROOT}/tools/record/body.md',encoding='utf-8').read()
# ---- research table
a=json.load(open(f'{ROOT}/research/ledger.json',encoding='utf-8'))
cat_zh={'ui':'专业 UI/UX、独立设计师与工作室项目','motion':'有动态证据的交互／数字体验案例','editorial':'时尚杂志与编辑设计案例','designer':'设计师品牌／设计师具体作品','award':'获奖项目的原始案例'}
from collections import Counter
cc=Counter(x['category'] for x in a); sc=Counter(x['status'] for x in a)
def ev(x):
    out=[]
    for e in x['evidence']:
        e=e.replace('/tmp/claude-0/-home-user-JU/c1f2fb96-6559-5a75-970f-6155c432919b/scratchpad/research/evidence/','research/evidence/')
        if not e.startswith('research/evidence/'): e='research/evidence/'+e
        out.append(e)
    return out
def exists_jpg(p):
    q=p[:-4]+'.jpg' if p.endswith('.png') else p
    return os.path.exists(f'{ROOT}/{q}') or os.path.exists(f'{ROOT}/{p}') or os.path.isdir(f'{ROOT}/{p}')
rows=[]
for x in a:
    evs=ev(x); ok=sum(1 for e in evs if exists_jpg(e))
    rows.append(f"| {x['id']} | {x['name']} | {x['creator']} · {x['period']} | {x['category']} | {x['status']} | [{x['url'][:60]}…]({x['url']}) | {x['viewed']} | {x['observation']} | {x['translation']} | {'；'.join(evs)}（仓库内可核对 {ok}/{len(evs)}） | 待映射（spec/concept-refs.md 生成中） |")
research_table="\n".join(["| 编号 | 案例／作品 | 创作者 · 年份／系列 | 类别 | 状态 | 原始 URL | 实际查看位置 | 具体观察 | 可转译到「我的局」 | 证据文件（相对仓库） | 对应方案 |","|---|---|---|---|---|---|---|---|---|---|---|"]+rows)
counts_line=f"采纳 {len(a)} 例：" + "、".join(f"{cat_zh[k]} {cc[k]}" for k in ['ui','motion','editorial','designer','award']) + f"；状态：已看动效 {sc.get('已看动效',0)}、仅核验静态 {sc.get('仅核验静态',0)}。"
# ---- evidence folders
def tree(code):
    d=f'{ROOT}/evidence/{code}'
    if not os.path.isdir(d): return '（无）'
    items=[]
    for n in sorted(os.listdir(d)):
        p=os.path.join(d,n)
        if os.path.isdir(p):
            files=os.listdir(p); items.append(f"`{n}/`（{len(files)} 文件{'，含 sheet.png' if 'sheet.png' in files else ''}{'，含 log.json' if 'log.json' in files else ''}）")
        else: items.append(f"`{n}`")
    return '；'.join(items)
git=sh('git log --format="%h %ad %s" --date=iso | head -20')
status=sh('git status --short | head -40') or '（干净）'
branch=sh('git rev-parse --abbrev-ref HEAD'); head=sh('git rev-parse --short HEAD')
sizes={f:os.path.getsize(f'{ROOT}/{f}') for f in ['concepts/src/C01.dc.html','concepts/src/C04.dc.html','JU-My-Ju-Fable51-10-Concepts.html','src/core/ju-data.js','src/runtime/dc-mini-runtime.js'] if os.path.exists(f'{ROOT}/{f}')}
srcs=sorted(os.path.basename(p) for p in glob.glob(f'{ROOT}/concepts/src/C*.dc.html'))
motion_specs=sorted(os.path.basename(p) for p in glob.glob(f'{ROOT}/spec/motion/*.md'))
doc=body.replace('{{NOW}}',now).replace('{{RESEARCH_TABLE}}',research_table).replace('{{RESEARCH_COUNTS}}',counts_line)\
 .replace('{{EVIDENCE_C01}}',tree('C01')).replace('{{EVIDENCE_C04}}',tree('C04')).replace('{{GIT_LOG}}',git).replace('{{GIT_STATUS}}',status)\
 .replace('{{BRANCH}}',branch).replace('{{HEAD}}',head).replace('{{SIZES}}','；'.join(f'`{k}` {v//1024} KB' for k,v in sizes.items()))\
 .replace('{{SRCS}}','、'.join(srcs) or '（无）').replace('{{MOTION_SPECS}}','、'.join(motion_specs) or '（无）')
open(f'{ROOT}/JU-MY-JU-PROJECT-RECORD.md','w',encoding='utf-8').write(doc)
print('written', len(doc), 'chars;', len(a), 'cases')

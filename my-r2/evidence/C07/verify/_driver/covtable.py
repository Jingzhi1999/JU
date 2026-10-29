# builds §3 coverage table for verify.md; usage: python3 -I covtable.py <coverage log.json or ''> > out.md
import sys, json
idx = [l.rstrip('\n').split('\t') for l in open('/tmp/claude-0/-home-user-JU/c1f2fb96-6559-5a75-970f-6155c432919b/scratchpad/v/index.tsv', encoding='utf-8')]
cov = {}
if len(sys.argv) > 1 and sys.argv[1]:
    try:
        L = json.load(open(sys.argv[1]))
        bad = set()
        for e in (L.get('errors') or []) + (L.get('mismatches') or []):
            s = json.dumps(e, ensure_ascii=False)
            for k, _, _ in idx:
                if k in s: bad.add(k)
        cov = {k: ('✗' if k in bad else '✓') for k, _, _ in idx}
    except Exception as ex:
        cov = {}
# key: (real op, static, motion 1x, pending)
M = {
 'j-home': ('✓ op1 滚动/分区/角色真实点击与滚轮', '✓ vis-home/00–04', '✓ op1 sheet-m3-scroll-down / m1 / m2', '真机滚动手感'),
 'j-history': ('✓ op1 分区 tab；op4/op5 退出后历史', '✓ vis-deep-j/11、op5/13', '✓ op1 sheet-m2-to-history', ''),
 'j-many': ('✓ 面板变体「当前较多」后查看', '✓ vis-deep-j/13、op11a/08', '—', '状态列截断（§2 m1）'),
 'j-history-many': ('✓ 变体后历史 tab，逐行点开 5 条', '✓ vis-deep-j/12、opx-joined/12', '—', ''),
 'j-d-pending': ('✓ op5 行→详情→撤回', '✓ op5/05、vis-deep-j/01', '✓ op5 sheet-enter-sketch', ''),
 'j-d-invited': ('✓ op2 盘「阅读并确认」直达阅读层（详情页本身只能经列表行或跳转，§2 m11）', '✓ vis-deep-j/00（跳转）、op2/01', '✓ op2 sheet-rise-read', '详情无局卡（§2 M3）'),
 'j-d-waitlist': ('✓ op5 古着淘货门口', '✓ op5/01', '✓ op5 sheet-enter-waitlist', ''),
 'j-d-invitedq': ('✓ op10「+24 小时」后盘内「候补轮到 · 已预留」', '✓ op10/10', '—', '轮到后的阅读确认未另走'),
 'j-d-gathering': ('✓ opx 法拉盛早茶行→详情', '✓ opx-joined/03', '—', '详情无局卡（§2 M3）'),
 'j-d-tear': ('✓ op3/op3b 拖 <50% 回弹、≥50% 撕开、失败重撕、键盘 Enter、按钮', '✓ op3/01、op3b/00', '✓ op3b sheet-drag-short/long/fail、kb-tear、btn-tear', '撕开后自动完成与坠落在无 GPU 环境偏慢（C00 同样），需真机看节奏'),
 'j-d-contact': ('✓ op3 联系层、武装复制失败→失败提示+重试→已复制（http 真剪贴板）', '✓ op3/04、05', '✓ op3 sheet-copy-fail、copy-retry', ''),
 'j-d-going': ('✓ op3 已加微信→待赴约；op5 外百老汇', '✓ op3/06、opx-joined/02', '✓ op3 sheet-contacted', ''),
 'j-d-reschedule': ('✓ op4 接受（撕新票）/ 重置后拒绝', '✓ op4/01、04', '✓ op4 sheet-enter-reply、accept', ''),
 'j-d-withdraw': ('✓ op4/op5 四种确认层（拒绝改期 / 退出候补 / 撤回 / 主动退出）+ opx 放弃预留', '✓ op4/05、op5/02、06、10、opx-joined/04', '✓ op5 sheet-leave-sheet、withdraw-sheet、exit-sheet', ''),
 'j-d-ended': ('✓ op11b 历史→周五爵士（真实点击）', '✓ op11b/02、03、vis-rm/06', '—（q5 补录见 §2 备注）', '08 场景盖章原件的真机表现'),
 'j-d-cancelled': ('✓ opx 历史→深夜拉面首开燃烧', '✓ opx-joined/08、vis-deep-j/09', '✓ opx-joined sheet-open-ramen-burn', '灰烬条（§2 m4）'),
 'j-d-rejected': ('✓ opx 历史→周末麻将', '✓ opx-joined/10', '—', ''),
 'j-d-queueleft': ('✓ op5 退出候补→回执→历史；opx 桌游夜', '✓ op5/03、opx-joined/09', '✓ op5 sheet-leave-ok', ''),
 'j-d-exited': ('✓ op5 外百老汇 确认层→燃烧 C→历史；opx K 歌首开燃烧', '✓ op5/11、12、opx-joined/14', '✓ op5 sheet-exit-burn', '历史列表与拒绝改期同字（§2 M6）'),
 'j-d-declined': ('✓ op4 拒绝改期→燃烧 B→查看退出结果→历史', '✓ op4/06、07、opx-joined/16', '✓ op4 sheet-decline-burn、to-history', '历史列表显示「已退出」（§2 M6）'),
 'j-d-expired': ('✓ op10「+24 小时」早午餐预留到期；opx 熊山徒步', '✓ opx-joined/13', '—', ''),
 'j-d-released': ('✓ opx 盘「去不了了」→确认→放弃预留→历史', '✓ opx-joined/05、11', '✓ opx-joined sheet-release-sheet、release-ok', ''),
 'j-d-withdrawn': ('✓ op5 撤回申请→结果→历史', '✓ op5/07', '✓ op5 sheet-withdraw-ok', '结果块与页头重复（§2 m10）'),
 'j-d-absent': ('见 q5-misc（历史较多→hike2）', '见 q5-misc', '—', ''),
 'h-home': ('✓ op1/op6 角色切换与盘 CTA', '✓ vis-home/05–08', '✓ op1 sheet-m1-to-hosted / to-joined', '半收拢停留（§2 m6）'),
 'h-drafts': ('✓ op9 删除→补位→撤销→再删→10 s 提交', '✓ op9/02–07', '✓ op9 sheet-del-1、undo、del-2、commit-10s', ''),
 'h-history': ('✓ op7b/op8 局主历史 tab', '✓ op7b/09、op8 hosted-history、vis-deep-h/12', '—', ''),
 'h-pending': ('✓ 变体「待处理较多」查看', '✓ vis-deep-h/15、op11a/07', '—', '盘 meta 截断（§2 m1）'),
 'h-history-many': ('✓ 变体「历史较多」查看', '✓ vis-deep-h/16、op11a/11', '—', ''),
 'h-drafts-many': ('✓ op9 变体「只有草稿」→草稿 tab', '✓ op9/01、02、vis-deep-h/17', '✓ op9 sheet-del-1', ''),
 'h-m-review': ('✓ op6 通过一份→谢绝最后一份（同帧：结果行/计数/席位/头部）', '✓ op6/01–04', '✓ op6 sheet-approve、reject-last', ''),
 'h-m-members': ('✓ op7a 自然酒成员；opx 复制成员微信（成功+武装失败+重试）', '✓ op7a/00、opx-hosted/01–03', '✓ op7a sheet-enter-wine、opx-hosted sheet-copy-ok', ''),
 'h-m-waitlist': ('✓ op10/hclock 德州扑克候补顺位', '✓ op10/06、07、vis-deep-h/02', '—', '局主侧顺位补位见 hclock2'),
 'h-m-contact': ('✓ opx-hosted 成员微信复制（http 真剪贴板 leon_hp）', '✓ opx-hosted/01–03、vis-deep-h/03', '—', ''),
 'h-m-leaves': ('✓ opx-hosted 离开记录展开', '✓ opx-hosted/04、vis-deep-h/04', '—', ''),
 'h-m-reschedule': ('✓ op7a 同时间被拒→新时间→确认（真实键盘 ↑↓）', '✓ op7a/01–06、op11b/01（键盘态）', '✓ op7a sheet-resched-open、resched-confirm', '时间换字无过渡（§2 m12）'),
 'h-m-replies': ('✓ op7a 自然酒 0/4 答复区、阳台烧烤 2/3 答复区', '✓ op7a/06、10', '✓ op7a sheet-resched-confirm、enter-bbq', ''),
 'h-m-cancel': ('✓ op8 确认层（受影响的人）→武装失败→层内失败→重试→燃烧→历史', '✓ op8/01–05', '✓ op8 sheet-cancel-open、cancel-fail、cancel-retry-burn', '半屏空盘（§2 M2）'),
 'h-m-end': ('✓ op7b 记为散场确认层', '✓ op7b/00', '✓ op7b sheet-end-open、end-ok', ''),
 'h-m-attendance': ('✓ op7b 四人 出席/未出席/待定、焦点顺序、更正留轨迹、全部记录→历史 1/4 人到场', '✓ op7b/01–09', '✓ op7b sheet-att-1-present…att-4、correct-*', '章面真机质感'),
 'h-m-card': ('✓ op6/op7a 查看局卡并关闭', '✓ op6/05、op7a/08', '✓ op6 sheet-card-open、card-close', '局卡 258 档（§2 M4）'),
 'h-m-cancelled': ('✓ op8 历史→已取消的局', '✓ op8/07、vis-deep-h/11', '✓ op8 sheet-open-cancelled', ''),
 'h-draft': ('✓ opx-hosted 草稿行→摘要', '✓ opx-hosted/05、06、vis-deep-h/14', '✓ opx-hosted sheet-open-draft', ''),
 'b-empty': ('✓ 变体「完全空」两角色', '✓ vis-deep-h/18、op11a/00', '—', ''),
 'b-empty-h': ('✓ 同上', '✓ vis-deep-h/19、op11a/01', '—', ''),
 'b-single': ('✓ 变体「只有一场」', '✓ vis-deep-h/20、op11a/02', '—', ''),
 'b-single-h': ('✓ 同上', '✓ vis-deep-h/21、op11a/03', '—', ''),
 'b-drafts': ('✓ 变体「只有草稿」两角色；op9 删到空', '✓ vis-deep-h/22、op11a/04、05、op9/09', '✓ op9 sheet-del-last', ''),
 'b-long': ('✓ 变体「长标题长地点」', '✓ vis-deep-h/23、op11a/12', '—', ''),
 'b-long-h': ('✓ 同上', '✓ vis-deep-h/24、op11a/13', '—', '两行局名断词（§2 m2）'),
}
print('| # | 索引 | 入口存在（coverage 工具） | 真实操作成功（亲自） | 静态视觉已看 | 正常速度动效已看（1×） | 仍需用户验收 |')
print('|---|---|---|---|---|---|---|')
for i, (k, g, lab) in enumerate(idx, 1):
    op, st, mo, pe = M.get(k, ('—', '—', '—', ''))
    print(f'| {i} | `{k}` {lab} | {cov.get(k, "待工具")} | {op} | {st} | {mo} | {pe or "—"} |')

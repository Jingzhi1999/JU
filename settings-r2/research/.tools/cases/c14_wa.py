E = 'settings-r2/research/evidence/'
def ev(slug, *names): return [f'{E}{slug}/{n}' for n in names]
CASES = [
dict(
 slug='whatsapp-parental-controls', name='WhatsApp 博客「New Controls to Help Parents Guide Their Teens on WhatsApp」——Parental controls 页：上半设置入口、下半按日期的活动句子', creator='WhatsApp（Meta）', period='2026-09-30',
 cat='ui', url='https://blog.whatsapp.com/new-controls-to-help-parents-guide-their-teens-on-whatsapp', viewed='2026-10-22',
 what_seen='手机 390 宽读博文并下载头图原图（1920×1080）。Android 真机画面「Parental controls」：返回箭头 + 标题 + ⋮；四行设置入口（线性图标 + 16sp 左右文字，无 chevron、无分隔线）：Privacy settings / Meta AI / Status / Channels；其下小标题「Activity」与灰色日期组头「Today」，再接三条活动——每条 = 44dp 圆形头像 + 一句完整的话 + 灰色时间：「Alex created “Birthday party 🎉” 06:50 PM」「“Baseball 2026” reached 30 members 02:46 PM」「Alex created the “Alex learns guitar” channel 01:00 PM」。正文：家长为青少年选择隐私设置（谁能看头像、谁能拉进群），放宽需家长 PIN；加入 / 退出群、群规模明显增长时提醒家长；私人消息与通话仍端到端加密，任何人都看不到；整套控制「entirely optional」，可随时调整或关闭。',
 brief='上半四个设置入口，下半「Activity · Today」用一句完整的话 + 时间记录事实（谁做了什么）；正文强调可随时关闭、私信不可见。',
 method='把「设置」与「发生过的事实」放在同一页：入口在上，事实流在下；每条事实是一句完整的人话（主语 + 动作 + 对象 + 时间），不用状态码或分数；同时明确说出「看不到什么」（私信内容）。',
 affects='我的记录（§9.8：私有事实语义，待核实 / 已记录）与我的举报（§9.9：提交 / 受理 / 核实分开）：记录写成「你在 10/12『周末速写』被记为未到场 · 待核实」这样的一句话 + 时间，按日期分组；S06 一段话的句子化思路延伸到记录详情；S03 墨面下半的事实流；页首一句「只有你能看到这些记录」。',
 avoid='家长监护语义、Meta AI 选项、emoji 头像、Android 默认排版；不得把事实流做成公开动态或信用分。',
 evidence=ev('whatsapp-parental-controls','parental-controls-screen.jpg','blog-text-pin-and-alerts.jpg'),
 motion_seen=False, award=None, inherited=False, concepts=['S06','S03','S01'], tags=['settings-screen'], status='仅核验静态'),
]

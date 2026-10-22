# 失败来源记录 · 设置 R2 研究

失败来源**不计入**案例数。所有请求都走预配置代理，从未关闭 TLS 校验，也没有用任何方式绕过站点的拦截。时间为 UTC。
状态码写法：`000` = 没有 HTTP 响应（连接被重置或失败）。共 **23 条**：指定复试 5 条 + 官方站 / 存档 4 条 + 内容缺失或路径错误 14 条；另记过程事故 1 条（不计入）。

## A. brief 指定的「试一次、记录、继续」（2026-10-22 04:07:17 统一复试）

| # | 来源 | 请求 | 结果 | 处理 |
|---|---|---|---|---|
| F01 | Behance | `https://www.behance.net/search/projects?search=settings%20app` | 403（453 B，没有正文） | 未采用任何 Behance 作品（本来也只用于发现） |
| F02 | Awwwards | `https://www.awwwards.com/websites/mobile-apps/` | 000（连接失败） | 未采用 |
| F03 | Codrops / Tympanus | `https://tympanus.net/Tutorials/NaturalLanguageForm/` | 403，Cloudflare 挑战页「Just a moment...」 | 同一演示改为 clone 作者公开仓库 `github.com/codrops/NaturalLanguageForm`，在本地 Chromium 打开 index.html 操作截图 → `codrops-natural-language-form` |
| F04 | SSENSE | `https://www.ssense.com/en-us/men/designers/rick-owens` | 403，Cloudflare 挑战页 | 未采用（商品网格本来也不能作为设计师案例） |
| F05 | The Met | `https://www.metmuseum.org/art/collection/search?q=Margiela` | 429，「Vercel Security Checkpoint」 | 馆藏实物改看 V&A → `margiela-aw97-wrap-skirt-vam` |

## B. 指定入口与设计师官方站、网页存档

| # | 来源 | 请求 | 结果 | 处理 |
|---|---|---|---|---|
| F06 | Maison Margiela 官方「Artisanal 2025」页（§6 指定入口 6） | `https://www.maisonmargiela.com/en-us/mm-brand-show-artisanal-25.html`；首页 `https://www.maisonmargiela.com/` | 两次都是 403 Akamai「Access Denied」（首次探测与 04:07 复试）；WebFetch 也是 403 | 改看同一系列的完整图库：FASHIONSNAP `collection/maison-margiela/2025aw-couture/`，49 张，Image by: Maison Margiela；另看 Vogue Runway `fall-2025-couture/maison-martin-margiela` → `margiela-artisanal-2025`（条目已写明） |
| F07 | Yohji Yamamoto 官方 SS26 图库（§6 指定入口 7） | `https://www.yohjiyamamoto.co.jp/en/collection/yohji-yamamoto-collections/spring-summer-2026-5/`；图片 `/wp/wp-content/uploads/2025/12/YYc_LOOK1.jpg`（带 Referer） | 页面与图片都是 403 Akamai；不带 www 的 `yohjiyamamoto.co.jp` 证书不匹配（curl 60），没有绕过；WebFetch 只取得页面结构（LOOK 01–27） | 画面研究改看同季巴黎女装秀：FASHIONSNAP `collection/yohji-yamamoto/womens/2026ss/`（下载到 144 张）+ Vogue Runway 前 3 张。无法确认两者与官方图库是同一组造型，条目已写明 → `yohji-yamamoto-ss26` |
| F08 | Yohji Yamamoto 官方 AW26-27 页（复核） | `https://www.yohjiyamamoto.co.jp/collection/femme/autumn-winter-2026-27-2/` | 本轮整站 403，打不开 | 只复核了上一轮（2026-10-10）的官方截图，条目标为继承 → `yohji-yamamoto-aw26-27` |
| F09 | Internet Archive | `archive.org/wayback/available?url=…`（Margiela、Yohji 两条）；`web.archive.org/web/2026/…` 与 `web/2026id_/…` 快照 | 可用性 API 返回 429 Too Many Requests；快照请求被重置（000，前后三次，最后一次在 04:07） | 没有替代来源，F06 / F07 按上面的办法处理 |

## C. 页面打开了，但内容缺失、被遮挡或路径错误

| # | 来源 | 问题 | 处理 |
|---|---|---|---|
| F10 | Instrument — Oura 案例页 | 页内 7 个 Vimeo 播放器在无头 Chromium 里显示「Player error」 | 条目只按静态内容记录，`motion_seen` 记为 false |
| F11 | Work & Co — Aesop 案例页 | 7 个 Vimeo 位置只显示灰色渐变或「Player error」 | 同上，只按静态内容记录 |
| F12 | Vogue Runway（Margiela SS09 / Artisanal 2025、Junya FW00、Yohji SS99 / SS26） | 订阅墙：每场只露出前 3–6 张造型和评论第一段 | 只描述实际露出的造型；完整系列改看 FASHIONSNAP（有的场次有）或 V&A 实物 |
| F13 | Vogue Runway 路径猜测 | `fall-2025-couture/maison-margiela`、`…/maison-margiela-artisanal`、`…/maison-margiela-artisanal-collection`、`spring-2026-ready-to-wear/maison-margiela` 都是 404 | 正确路径是 `fall-2025-couture/maison-martin-margiela`（200） |
| F14 | FASHIONSNAP 路径猜测 | `junya-watanabe/2026ss`、`rick-owens/2026ss`、`rick-owens/2026aw`、`ann-demeulemeester/womens/2026ss` 都是 404 | 改用 `junya-watanabe/2026aw`、`rick-owens/womens/2026ss`、`ann-demeulemeester/2026aw`（均为 200）→ `junya-watanabe-aw26`、`rick-owens-temple-ss26`、`annd-aw26-show` |
| F15 | D&AD 条目「My Japan Railway」 | 未登录时项目图被模糊 | 奖项用条目文字和徽标 alt 文本核实（Black Pencil 2024）；项目画面沿用上一轮的 Dentsu 访谈截图，条目已写明 → `award-my-japan-railway` |
| F16 | W3C clreq 正式发布版 | `https://www.w3.org/TR/clreq/` 与 `https://www.w3.org/International/clreq/` 都是 403 Cloudflare 挑战页 | 改看 GitHub Pages 上的编辑草案 `https://w3c.github.io/clreq/`（200）→ `w3c-clreq` |
| F17 | Apple 支持《更改 iPhone 的通知设置》简体中文版 | `support.apple.com/zh-cn/guide/iphone/iph7c3d96bab/ios` 能打开（200），但截图没有本地化，仍是英文界面 | 只把中文步骤文字（界面词用中文引号）作为证据，不算中文界面截图 → `apple-iphone-notification-settings` |
| F18 | WhatsApp「Privacy Checkup」 | `https://blog.whatsapp.com/introducing-privacy-checkup` 返回 200，内容却是博客索引页（标题「WhatsApp Blog」） | 未采用；WhatsApp 改用家长控制一文 → `whatsapp-parental-controls` |
| F19 | WhatsApp「It’s time to reserve your WhatsApp username」 | 文内视频是广告片，没有设置界面 | 未采用 |
| F20 | Slack 帮助《Configure your Slack notifications》 | 页面能打开（200），但只有桌面截图，没有手机设置界面 | 未采用 |
| F21 | flighty.com 页内视频 | 是用户证言和新闻片段，不是 app 界面录屏 | `award-flighty` 只按静态截图记录，`motion_seen` 记为 false |
| F22 | LINE 官方部落格（`official-blog.line.me/tw`） | 网络搜索没有返回任何官方页面，只有第三方教程 | 未采用（不用二手教程截图） |
| F23 | 前任研究员的 BUCK「每 3 秒一帧」接触表 | 用源视频复现不出来（对不上时间点） | 已删除该文件，改为从 4 个 Mux 流重新连续抽帧 → `buck-headspace` |

## D. 过程事故（不计入）

- 2026-10-22：共享 scratchpad 被其他 agent 清空两次（先是 `scratchpad/r2`，01:36 又整个清空）。仓库里的 `ledger.json` 和 evidence 都还在；下载的源文件、抽帧和脚本已重新获取或重写。之后脚本与临时文件只放在 `/home/user/JU/.build/research-*`（已被 gitignore），不再使用共享 scratchpad。

# 限制与证据说明（设置轮）

- **验证环境**：云容器内无头 Chromium（Playwright，`/opt/pw-browsers`），SwiftShader 软件渲染，无 GPU；所有截图与抽帧来自 `settings/tools/capture.cjs` / `coverage.cjs` 对独立画布 `JU-Settings-Fablo51-10-Concepts.html`（或各方案的私有构建 `.build/SCNN.html`）的操作。**没有真机**，触控手感、帧率、`touch-action` 的实际行为未验证；不声称 60fps。
- **录屏**：环境不支持视频录制；核心动作以 0.5× 速度抽取连续关键帧（`settings/evidence/SCNN/motion-*/`，`sheet.jpg` 为接触表，`f*.jpg` 为帧，`log.json` 记录动作与错误）。帧间隔由脚本的 `every` 决定（通常 100–220ms），不是逐帧视频。
- **Design 画布（claude.ai）**：容器内不能渲染官方画布运行时（`support.js`），画板只能按 `.dc.html` 规范发布；独立画布用仓库内的 `dc-mini-runtime`（已实现的子集）验证。两者的实际渲染差异未核对。
- **字体**：Google Fonts 在线加载（容器内可达）；离线时退回系统字体，排版会变。
- **持久化**：每套方案一个 `localStorage` 命名空间 `jus:<SCNN>:v1`；Playwright 每次用新浏览器上下文，截图不受持久化影响。
- **真实能力**：全部为本地演示——没有账户、登录、验证邮件（验证码是本机测试码）、通知服务、举报审核或后端；产品界面上对此的说明见各方案的账户页与关于页。
- **研究**：Behance、Awwwards、Tympanus、SSENSE、Met Museum 在本网络被拒；Vogue Runway 只开放 3 看次 + 6 细节；App Store 页面会 429；具体失败项见 `settings/research/ledger.md` §三。
- **代理产出**：各方案由构建代理实现并自报验证；主负责人逐套复看 `home / dense / motion-* / coverage` 并在 `JU-SETTINGS-PROJECT-RECORD.md` §G 记录复看结论；用户尚未审阅任何一套。
- **状态索引与接缝验证**：`jumpTo(key)` 按索引条目重建演示数据（确定性），所以「先操作再跳转」看不到刚才的改动；跨模块一致性要用方案自己的导航串联验证（`capture.cjs` 的 `click` 动作），不能用 `jump` 串联。评审面板上这一点没有提示文案。
- **抽帧密度**：无头截图约 100–150ms 一张，100ms 级的动作（软球开关、按扣）只能抽到 3–4 个中间帧；需要精确关键帧的方案用 `inst.scrubTo(n)` 定格采样（SC03 / SC04 / SC01 已用）。
- **Design 画布运行时**：方案逻辑类使用 `componentDidMount` / `componentDidUpdate` / `ResizeObserver` / `ref="{{rootRef}}"`，在仓库的 `dc-mini-runtime` 上验证过，在官方 `support.js` 上未验证；画布上若有画板空白，先用独立画布复核。
- **共享核心修正晚于代理交付**：`derive.reports` 排序与 `s-report-file` 的目标活动在十套交付后修正；各套 `settings/evidence/SCNN/coverage/` 是修正前抽的，修正后的覆盖以 `settings/spec/coverage.md`（`coverage-matrix.cjs`）为准。
- **`verifyEmailCode` 的过期判断基于固定的演示时钟 `JUS.NOW`**，产品内到不了「验证码已过期」态（评审面板也没有模拟）；59s 重发倒计时是真实计时。

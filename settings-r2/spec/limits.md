# 限制与未验证项（设置 R2）

- **基准文件缺失**：任务书要求实看的 `JU-V27-review-canvas(2).html` 与 `JU-MY-R8-Visual-Motion-Refined.html` 未上传到本会话；共有语言按任务书 §4 的数值与旧分支的三份提取文件执行（`spec/extracts/`）。「与 V27 / R8 真实画面并排衔接」属于**尚未验证**。
- **验证环境**：云容器无头 Chromium（Playwright，SwiftShader 软件渲染，无 GPU，无真机）；截图与抽帧来自 `tools/capture.cjs / coverage.cjs / widths.cjs / kb-check.cjs / rm-check.cjs / lead-sheet.cjs`。触控手感、帧率、真机字体渲染未验证；不声称 60fps。
- **录屏**：不支持视频；核心动作以 1× 与 0.5× 抽帧（100–220ms 间隔）记录，不是逐帧视频。
- **字体**：Google Fonts 联网加载（容器可达）；离线打开交付文件时退回系统字体，排版会变（交付文件不内嵌字体文件，以控制体积）。
- **真实能力**：全部本地演示——无账户、登录、验证邮件（验证码为本机测试码）、通知服务、举报审核或后端；材料「添加」只记录本机文件名与大小。产品内各有一句准确说明。
- **持久化**：每套一个 `localStorage` 命名空间 `jus2:<SNN>:v1`；Playwright 每次新上下文，截图不受持久化影响。
- **状态索引**：`jumpTo` 按索引条目重建数据；跨模块一致性用方案自己的导航串联验证。
- **系统减少动态**：用 Playwright `reducedMotion: 'reduce'` 模拟核对（`rm-check.cjs`），不是真机系统设置。
- **键盘**：用面板的 300px 模拟内缩核对（`kb-check.cjs`），不是真实软键盘；真实键盘高度与 `visualViewport` 行为未验证。
- **Design 画布**：本轮主要交付是离线 HTML；画板版本（`settings-r2/concepts/project/`）按 `.dc.html` 规范生成，官方画布渲染未核对。
- **代理产出**：各方案由构建代理实现并自报；主负责人逐套复看证据并在记录中区分「实际观察 / 源码检查 / 尚未验证」；**用户尚未审阅任何一套**。

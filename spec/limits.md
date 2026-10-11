# 仍有的真实限制与证据位置

## 环境与验证限制
- 本轮所有截图与帧序列来自容器内无头 Chromium（SwiftShader，无 GPU）：能证明布局、层级、动画阶段与落点，不能证明真机帧率与流畅度；长动效（打印 / 撕票 / 燃烧 / 碎裂）建议在桌面 Chrome 或 iPhone Safari 复看。
- Design 画布（claude.ai）在容器内不可渲染；画板用官方运行时呈现，与独立画布的自研运行时（`src/runtime/dc-mini-runtime.js`）实现同一格式子集，但未在官方运行时上逐套验证；若画布内某套表现异常，以独立画布 `JU-My-Ju-Fable51-10-Concepts.html` 为准并反馈。
- 字体依赖 Google Fonts（css2）；离线或被墙时退回系统字体，中文字重与字距会变化。
- 演示时钟固定在 `2026-12-17 15:00`（`JU.NOW`），倒计时不实时走动；8 小时联系窗与散场 24 小时只有文案。
- 全部数据为本地演示数据，没有真实接口、通知、分享、数据库；「本机保存失败」由评审面板按钮一次性触发。

## 范围限制（按简报）
- 不含发现页、入局申请表单、开局编辑器、登录、设置；「继续编辑草稿」「再开一局」「去找局」「去开局」为惰性入口。
- 举报 / 申诉只做局内「查看 / 补充」记录层，不建设账户级系统。

## 证据位置
- 研究：`research/ledger.md`（94 例 + 失败项 + 原则）、`research/ledger.json`、`research/evidence/`（缩版 JPEG）。
- 各方案：`evidence/CNN/joined-home.png`、`hosted-home.png`、`detail.png`、`manage.png`、`result.png`、`coverage*/sheet.png`（50 个索引状态）、各流程目录的 `sheet.png` + `log.json`；评审报告 `evidence/CNN/review-N.md` 与 `evidence/CNN/review-N/`。
- 规格：`spec/motion/CNN.md`（每套参数与三个核心动作分段）汇总为 `spec/motion-specs.md`；覆盖矩阵 `spec/coverage.md`；方向卡与差异矩阵 `spec/directions.md`；参考映射 `spec/concept-refs.md`。
- 主记录：`JU-MY-JU-PROJECT-RECORD.md`（验证分级：已写代码 / 已运行 / 已检查视觉 / 已检查完整动效 / 已检查交互 / 用户已认可）。

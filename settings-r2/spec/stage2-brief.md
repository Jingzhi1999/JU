# 阶段 2 指令（主负责人核对阶段 1 后，逐套发给构建代理；每套另附具体意见）

你的阶段 1 已通过主负责人的隐名并排 / 灰度核对（意见见消息正文）。现在把方案扩展到**全部范围**：

1. **全部 surface 与状态**：52 条索引全部可达（`settings-r2/tools/coverage.cjs` → 52/52、0 错误），每个 surface 都由你的构图命题生成——列表页上方保留该页的主导元素，表单页沿用你的编辑语言，确认层 / 系统提示 / toast 也属于你的材质与运动。不允许出现「返回 + 标题 + 一列行」的默认页。
2. **接缝**：入局 01（`seam-feed`：V27 滑动收藏、只看收藏、未报名详情）与我的局（`seam-mine`：收藏标记、历史行的举报入口、回执状态、`seam-report` 表单）用你的语言做最小但完整的画面；根导航切换有转场（`dir-root`）。
3. **变体**：empty / many / long / fresh / denied / unsupported / connected 七个变体都要成立（空态完整、长文本不溢出不缩字、较多时的节奏）。
4. **减少动态三源**（面板、系统、用户偏好）：状态与结果等价、只去掉运动；外观页写明是否跟随系统。
5. **键盘**：面板「键盘（模拟 300px）」打开时，聚焦的输入框与主动作都在 `var(--kb)` 之上（`kb-check.cjs` 无 findings）。
6. **尺寸**：`widths.cjs` 对 s-home,s-profile-edit,s-fav,s-records,s-notify,s-long,s-seam-feed 三个宽度无溢出、字号不变（无整页缩放），最小字号 ≥ 12。
7. **动效**：普通保存 ≤ 420ms 落定；按压 80–160ms；常规展开 / 返回 240–420ms；签名转场 + 你方向的其余两个核心动作用 `this.motion(name, fn)` 登记（可重播、可暂停、可关键帧）；没有整页弹跳、全页脉冲、交错入场、反相闪烁、持续发光或漂移。
8. **证据**：九个流程接触表（`flow-enter / flow-profile / flow-fail / flow-notify / flow-skin / flow-fav / flow-record / flow-account / flow-unsaved`，见契约 §6）+ coverage + widths + kb + rm 输出，放在 `settings-r2/evidence/SNN/`；完成后 `python3 -I settings-r2/tools/shrink-evidence.py SNN`。
9. **`settings-r2/spec/motion/SNN.md`**：三个核心动作的分段（谁动、从哪里、经过什么、停在哪里、文字何时可读、能否打断、返回如何连续；时长 / 曲线）+ 关键视觉参数（字体、字号阶、色板、光源 / 表面规则、页头收拢实现）+ 「一个仍可能失败的设计判断与你如何检查」。
10. **汇报 ≤ 40 行**：文件与大小、各检查结果、九个流程的证据路径、`builder-brief.md` 的自检十二问逐条回答（如实写未达标项）、对共享核心 / 控制器的问题。

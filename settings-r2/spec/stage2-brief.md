> **用户重申（2026-10-22 04:0x UTC）：视觉呈现是最高优先级——视觉不好看，再完美的功能也没有意义。**
> 因此阶段 2 的工作顺序是：先把每一个 surface 的画面做到与首页同等质量（构图、字级、色彩面积、表面、动效），再补检查与证据。主负责人会**先只看画面**：任何一页读成默认表单 / 普通列表 / 比首页明显弱，整套退回重做那一页，功能全通也不算通过。
> 交付前你必须做一张「12 页接触表」（390 宽、默认环境：首页、资料、编辑、收藏、收藏详情、城市、通知、外观预览、我的记录、记录详情、举报详情、规则全文），用艺术指导的眼光逐页判断；哪页弱就先重做哪页。

# 阶段 2 指令（主负责人核对阶段 1 后，逐套发给构建代理；每套另附具体意见）

你的阶段 1 已通过主负责人的隐名并排 / 灰度核对（意见见消息正文）。现在把方案扩展到**全部范围**：

1. **全部 surface 与状态**：52 条索引全部可达（`settings-r2/tools/coverage.cjs` → 52/52、0 错误），每个 surface 都由你的构图命题生成——列表页上方保留该页的主导元素，表单页沿用你的编辑语言，确认层 / 系统提示 / toast 也属于你的材质与运动。不允许出现「返回 + 标题 + 一列行」的默认页。
2. **接缝**：入局 01（`seam-feed`：V27 滑动收藏、只看收藏、未报名详情）与我的局（`seam-mine`：收藏标记、历史行的举报入口、回执状态、`seam-report` 表单）用你的语言做最小但完整的画面；根导航切换有转场（`dir-root`）。
3. **变体**：empty / many / long / fresh / denied / unsupported / connected 七个变体都要成立（空态完整、长文本不溢出不缩字、较多时的节奏）。
4. **减少动态三源**（面板、系统、用户偏好）：状态与结果等价、只去掉运动；外观页写明是否跟随系统。
5. **键盘**：面板「键盘（模拟 300px）」打开时，聚焦的输入框与主动作都在 `var(--kb)` 之上（`kb-check.cjs` 无 findings）。
6. **尺寸**：`widths.cjs` 对 s-home,s-profile-edit,s-fav,s-records,s-notify,s-long,s-seam-feed 三个宽度无溢出、字号不变（无整页缩放），最小字号 ≥ 12。
7. **动效**：普通保存 ≤ 420ms 落定；按压 80–160ms；常规展开 / 返回 240–420ms；签名转场 + 你方向的其余两个核心动作用 `this.motion(name, fn)` 登记（可重播、可暂停、可关键帧）；没有整页弹跳、全页脉冲、交错入场、反相闪烁、持续发光或漂移。
   **可暂停 / 可关键帧的实现方式**：三个核心动作用 `@keyframes` 写（不要只用 transition），并接上面板的两个类：`.app.paused .x{animation-play-state:paused!important}`、`.app.scrub .x{animation-play-state:paused!important;animation-delay:calc(-1 * var(--frame,0) * <时长> * var(--k,1))!important}`（`--frame` 0..1 由面板写入）。纯 transition 的动作在暂停时只能跳到终点，不算「可暂停」。普通按压 / 开关可以继续用 transition。
8. **证据**：九个流程接触表（`flow-enter / flow-profile / flow-fail / flow-notify / flow-skin / flow-fav / flow-record / flow-account / flow-unsaved`，见契约 §6）+ coverage + widths + kb + rm 输出，放在 `settings-r2/evidence/SNN/`；完成后 `python3 -I settings-r2/tools/shrink-evidence.py SNN`。
9. **`settings-r2/spec/motion/SNN.md`**：三个核心动作的分段（谁动、从哪里、经过什么、停在哪里、文字何时可读、能否打断、返回如何连续；时长 / 曲线）+ 关键视觉参数（字体、字号阶、色板、光源 / 表面规则、页头收拢实现）+ 「一个仍可能失败的设计判断与你如何检查」。
10. **汇报 ≤ 40 行**：文件与大小、各检查结果、九个流程的证据路径、`builder-brief.md` 的自检十二问逐条回答（如实写未达标项）、对共享核心 / 控制器的问题。

## 主负责人的共同意见（适用于每一套）
- **首页页头的辅助信息不要放演示声明**（「本地演示 · 不连接真实账户」）——用真实状态（如「2 件事等你回应 · 纽约」）；演示边界只在账户 / 关于页说一句。
- **证据与临时输出只写到你自己的目录**：`settings-r2/evidence/SNN/…` 或 `/home/user/JU/.build/SNN-…`；不要写到共享的 scratchpad 根目录（`capture.cjs` 会先清空输出目录，别的构建者可能正用着同名目录）。
- **控制器更新（2026-10-22）**：聚焦输入框不再用 `scrollIntoView`（它会滚动被裁切的祖先，把整屏顶走），改为 `this.reveal(el)`：只滚动该输入所在的 `[data-scroller]`，并让它停在键盘内缩（`--kb`）之上。你自己要把某个元素带进视野时也用 `this.reveal(el)`。`kb-check.cjs` 现在会报告「整屏被顶走」。重新私有构建即可拿到新核心。
- `shrink-evidence.py` 只在阶段 2 全部证据完成后运行；阶段 1 的 PNG 保持原样。

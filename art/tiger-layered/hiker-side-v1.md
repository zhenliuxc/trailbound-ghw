# 虎跳峡侧视人物逐帧素材 v1

2026-10-17，为本轮 PixiJS 分层爬坡样段制作。使用内置 `image_gen`，未使用 CLI、API Key、Tripo、Spine 或付费生成服务。

## 文件与制作范围

- 原始生成 PNG：`art/tiger-layered/tiger-hiker-side-v1-source.png`，1774 × 887，RGBA。
- 游戏交付 WebP：`dist/sprites/tiger-hiker-side-v1.webp`，1760 × 880，保留透明 alpha。
- WebP 为 4 列、2 行，每格 440 × 440。按从左至右、先上后下读取 0–7 帧。
- 仅用本机已安装的 Sharp 做整图等比例缩小及 WebP 转码，quality 94、alphaQuality 100、effort 6。未裁剪、翻转、拼贴或重新绘制生成图。
- 原 PNG 来源：内置工具输出 `exec-b982d8bb-9cfb-4202-a8a5-3b71f9b7dbca.png`。原输出也保留在 Codex 的 generated_images 目录中。

先查看项目现有 `dist/sprites/tiger-hiker-v2.webp`，沿用橄榄帽、米白衣袖、深草绿长裤、棕靴和赭金背包的水彩人物方向。第一次参考编辑仍含向左人物，第二次修正虽统一朝向，步态差异仍不足，均未交付。最终图使用下方完整文字提示新生成，未附旧图，避免继承多朝向布局。

最终图已作素材制作查看：八帧均为向右侧视，包含跨步、下沉、过腿和抬脚轮廓，背景透明，没有底影或文字。生成结果两行脚底位置和人物高度略有差异，不能直接使用一个固定脚底锚点。以下参数供场景逐帧对齐，不宣称已经完成真实游戏中的步态、触摸或性能验收。

图片查看器会把轮廓边缘及少量透明空白中的红、黄 RGB 残色显示得很明显。读取成品像素确认：红色残色 alpha 最大 5/255，3177 个非零 alpha 红色像素中 3060 个为 1/255；黄色 alpha 最大 3/255，2130 个中 2112 个为 1/255。没有 alpha ≥ 128 的红色污染。独立红点抽样为 alpha 1/255。已保留原始 alpha，没有为消除查看器伪色而删除水彩柔边；实际混合效果仍待场景验收。

## 裁格与脚底锚点

矩形为 `[x, y, width, height]`。`anchor.y` 依据成品 alpha ≥ 128 的鞋底最下边界计算；`anchor.x` 统一为 0.5。显示高度可按各帧可见人物高度统一设置，不需要改变原画。

| 帧 | 相位目标 | 裁格 | anchor.y | 可见人物高度 |
| --- | --- | --- | --- | --- |
| 0 | 右脚前落地 | `[0,0,440,440]` | 0.9250 | 365 px |
| 1 | 下沉 | `[440,0,440,440]` | 0.9182 | 363 px |
| 2 | 左腿交错前送 | `[880,0,440,440]` | 0.9250 | 365 px |
| 3 | 左腿抬升 | `[1320,0,440,440]` | 0.9273 | 366 px |
| 4 | 左脚前落地 | `[0,440,440,440]` | 0.8818 | 356 px |
| 5 | 下沉 | `[440,440,440,440]` | 0.8773 | 354 px |
| 6 | 右腿交错前送 | `[880,440,440,440]` | 0.8841 | 358 px |
| 7 | 右腿抬升 | `[1320,440,440,440]` | 0.8841 | 357 px |

落脚相位为 0、4。动画相位应随实际行走距离推进，停步后停止换帧与发出脚步事件。整格中的透明留白应保留；不要为填满图格拉伸身体，也不要把参考图中的左右视角交替当作走路。

## 最终生成提示词

```text
Create a new production-quality watercolor 2D game animation sprite sheet. Landscape exactly 2048x1024 pixels. Transparent alpha background. Four equal columns, two equal rows: eight squares. A single young adult Chinese hiker walking TOWARD THE RIGHT edge of the page, strict side profile, in EIGHT CONSECUTIVE DISTINCT MOTION PHASES, one per square. Every face, cap brim and chest faces RIGHT; every backpack is on the LEFT/back side of its figure. This is animation, not a turn-around. Character: olive-green soft cap, short black hair, cream long-sleeve shirt with rolled cuffs, dark grass-green hiking trousers, brown leather boots, ochre-gold canvas backpack with same buckles. Fine hand-painted watercolor with delicate pencil detail, rich but quiet pigment, natural adult anatomy, beautiful paper grain only inside opaque cutout. Paint the character SMALLER within each cell: hat top at y=12% of cell, soles baseline y=92%, hip horizontal center exactly x=50%. Leave a LARGE TRANSPARENT GAP below feet and above every head; transparent margins on all four sides of every square, no figure crossing any boundary. Constant body size and head height with only subtle walking weight shift. Contact phases must have legs spread, and passing phases must have legs close together beneath the hips. Eight action poses in reading order: 1 right heel contacting ahead, left toe behind, long stride, left arm forward; 2 right knee flexed down bearing weight, left heel lifting behind; 3 LEFT KNEE PASSES RIGHT KNEE UNDER HIPS, LEGS CLOSE, right sole planted below hips, left foot airborne beside right calf; 4 left knee and boot swinging forward and up ahead of hips, right foot trailing planted; 5 left heel contacting ahead, right toe behind, long stride, RIGHT ARM FORWARD; 6 left knee flexed down bearing weight, right heel lifting behind; 7 RIGHT KNEE PASSES LEFT KNEE UNDER HIPS, LEGS CLOSE, left sole planted below hips, right foot airborne beside left calf; 8 right knee and boot swinging forward and up ahead of hips, left foot trailing planted. Legs must alternate correctly; poses 3 and 7 have NARROW LEG SILHOUETTES. Arm swing must alternate across the loop. Keep all eight noses pointing RIGHT. No left-facing character anywhere. No background, no ground, no shadows, no ellipse, no base plate, no cell boxes or grid lines, no text, no labels, no numbers, no watermark, no motion lines, no extra walking poles. Each sprite is complete head to boot with clean transparent edges and ample transparent padding. Match quiet refined hand-painted storybook watercolor, not flat vector, not pixel art, not 3D, not thick cartoon outlines.
```

提示词请求 2048 × 1024，内置工具实际输出 1774 × 887。工程成品因此按比例缩至可整数分格的 1760 × 880；文件尺寸以实际元数据为准。

未运行游戏测试、浏览器验收或性能检查。动画连续性、脚底贴合及角色融入场景仍待本轮实现完整后，由用户授权集中测试。

# 写实徒步人物 v1

2026-10-17。本轮用于用户确认的剧情对话与观景照片场景。主地图使用独立 Q 版素材。

## 来源与文件

- 角色身份、服装、配色与水彩画风来自用户提供的设定板，源文件名为 codex-clipboard-f4a137ee-3703-49fb-88bd-36678904ea62.png。两张附件展示相同设定板。
- 使用内置 imagegen 完成透明抠取及左侧抬腿姿势的自然站立补全，随后仅修正一次排布与透明边缘。没有调用 Tripo、Spine、付费 API 或 CLI，没有引入第三方角色素材。
- 选定 PNG 为 art/characters/realistic-source-v1.png。此处 source 指生成结果原始 PNG，不是用户设定板副本。
- 网页文件为 dist/characters/trailbound-realistic-v1.webp。使用工程现有 sharp 无损转码，保留原始尺寸与 alpha。没有裁拼、抠色或后续绘画。

## 图集与定位

画布 1774 × 887，2 列 1 行，每格 887 × 887。WebP 文件 644644 字节。

| 格 | 用途 | 局部 alpha > 8 可见边界，含端点 | 可见尺寸 | 可见中心与脚底，局部像素 |
| --- | --- | --- | --- | --- |
| 0 | 朝右前侧，双手扶背包带，站立交谈 | x 380–780，y 24–866 | 401 × 843 | 580，866 |
| 1 | 朝右背侧，站立观景 | x 170–526，y 25–872 | 357 × 848 | 348，872 |

上述边界用于消费端定位。alpha 8 相当于 8/255，忽略几乎不可见的半透明边缘噪点。保留完整方格渲染时，以第 0 格的 580/887、866/887 和第 1 格的 348/887、872/887 为画面居中及脚底参考；若裁取可见边界，则以裁取后的水平中心、底边对齐。第 1 格绝对 x 起点为 887 + 170 = 1057。

生成结果没有严格居中，脚底基线相差 6 px，帽顶和鞋底留白也小于提示词要求。消费端须按实际边界排布，不以方格中心假定人物中心。两个姿态仅为静态插画，不表示已具备逐帧动作。

## 初次提示词

Use case: background-extraction, identity-preserve.
Asset type: production transparent character sprite sheet for the watercolor browser hiking game Trailbound.
Input image: user-supplied character design board; edit target and sole identity/style reference. Extract and faithfully complete ONLY the two adult-proportioned young male hikers on the RIGHT HALF of the board. Ignore all three chibi figures at upper left and all detail panels, swatches, landscape, paper, rock and plants.
Primary request: make a wide transparent 2 columns by 1 row sprite sheet of that same young hiker in two poses. Each equal square cell contains one complete full-body character, same natural adult proportions and same scale, both feet visible, equal foot baseline near 90% of cell height, generous transparent padding on every edge. Left cell: front/right three-quarter view, gentle calm conversational standing posture with both boots resting on one level plane. Keep his hands loosely holding the backpack straps and his friendly profile from the large central hiker; remove the raised knee and the rock below it, faithfully complete that leg into relaxed natural standing. Right cell: rear/right three-quarter view, relaxed standing looking out to the right, faithfully preserve the rightmost standing hiker and backpack from the board. Preserve his identity, delicate youthful facial features, short dark hair, beige soft wide-brim hat and olive hat band, warm rust-red scarf, blue-gray hiking jacket, khaki loose trousers, moss/olive green hiking pack with metal water bottle and dark rolled sleeping mat, brown leather lace-up boots. Preserve the source fine detailed hand-drawn watercolor finish, subtle watercolor pigment and paper grain WITHIN painted subject, natural ink pencil contours, fine cloth seams and worn textures, quiet earth colors.
Constraints: This is a transparent cutout sheet, not a new scene. Two characters only. Adult-proportioned illustration, not photorealism and not chibi. Keep face, outfit, pack and palette faithfully tied to the source. Keep left character entirely within left half and right character entirely within right half, clean gap at center. No figure or object touches cell boundary. No background at all; genuine alpha transparency. Remove background paper and all scenery including the foreground rocks, ground, vegetation, contact shadows and distant mountains. No labels, no borders, no checker pattern pixels, no text, no color swatches. Do not invent a different outfit or a different face.

## 最终修正提示词

Use case: precise-object-edit, background-extraction.
Asset type: final transparent two-pose character sprite sheet for Trailbound.
Input image 1 is the edit target, the two cutout adult-proportioned watercolor hikers. Input image 2 is the original user character identity/style reference. Keep the two characters' face, adult body proportions, stance, hat, red scarf, gray-blue jacket, khaki pants, olive pack and gear, brown boots and all painted watercolor detail unchanged. Only correct the sprite sheet framing and cutout edge cleanup.
Return one 2 columns by 1 row sheet with exactly two equally sized square cells, real alpha transparency. Left cell front/right three-quarter conversational standing hiker, right cell rear/right three-quarter standing viewing hiker. Shrink both painted characters uniformly a little so the hat top has at least 8% transparent margin and boot soles have at least 8% transparent margin; both figures same scale and boot soles share a single horizontal baseline at 90% of total height. Each figure's complete visible painted bounding box must be horizontally centered in its own half-cell, not shifted toward the middle. Both boots, full hat, scarf and pack stay fully visible. Large clean gap between them.
Clean any tiny stray red/yellow pixels around silhouettes, retain naturally soft neutral watercolor alpha edges with no colored fringes, no white paper halo. No background, no rocks, no ground or contact shadows, no plants, no paper rectangle, no checkerboard paint, no text, no labels, no frame. Do not redesign or redraw identity. This is adult-proportioned illustrated watercolor, not chibi and not photorealism.

## 当前状态

素材已生成并落盘，已读取实际尺寸和 alpha 边界以支持接线。这是素材准备，不是游戏测试。人物在实际对话、照片、手机与桌面中的比例、遮挡、清晰度和身份一致性均未验收。本代理未运行构建、浏览器或游戏测试。

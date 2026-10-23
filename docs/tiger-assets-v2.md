# 虎跳峡水彩素材 v2

2026-10-17。配合 `tiger-gorge-redesign.md` 的本机实现制作；使用内置 `image_gen`，未使用 API/CLI。共六项新素材，不替换旧图片或旧手帐画作。本轮只制作、查看图片并进行必要的格式转换，没有游戏运行、浏览器、手机、性能或音频验收。

## 文件与使用约定

| 文件 | 尺寸 | 字节 | 用途 |
| --- | --- | ---: | --- |
| `dist/scenes/tiger-high-v2.webp` | 1659 × 948 | 618010 | 高路的远峡和左侧近坡；不含可走路径，路径由渲染层单独绘制 |
| `dist/scenes/tiger-river-v2.webp` | 1672 × 941 | 559696 | 中虎跳江边低视角，岩壁、巨石与下半幅急流 |
| `dist/sprites/tiger-cliff-v2.webp` | 1672 × 941，RGBA | 223616 | 左侧窄岩壁与右下岩石，中央透明；可拆为左右遮挡层 |
| `dist/sprites/tiger-hiker-v2.webp` | 1776 × 888，RGBA | 268262 | 4 列 × 2 行、每格 444 × 444 的八姿态人物 |
| `dist/scenes/tiger-longdong-v2.webp` | 1672 × 941 | 542814 | 薄流水沿崖而下、跨过山径的过渡场景 |
| `dist/scenes/tiger-halfway-v2.webp` | 1672 × 941 | 493446 | 对面玉龙山墙为主体，木栏和桌角限于边缘 |

背景使用自身宽高比做等比覆盖，不横向拉伸。高路并非严格 16:9，应用应使用实际尺寸。河流动效必须按这张图的水域遮罩制作，不能整体扭动岩壁或巨石。素材中的水流与石体是艺术演绎，不是现场水动力测量。

高路近坡在左下，向上逐渐收向左边，路径不能在上半部跨到远峡或天空。近坡右缘的参考美术坐标约为 `(0.12,0.05), (0.20,0.20), (0.38,0.40), (0.50,0.60), (0.62,0.80), (0.75,1)`，均为画面归一化坐标，不能用于地图。

龙洞图中小径大致经过 `(0,.65) → (.35,.58) → (.71,.52)`，流水跨径点约 `(.39,.58)`；这里只用于人物与动水的画面定位，不是实测路线。

### 人物帧与脚底

帧顺序：右向侧身两步、背向右上两步、左向侧身两步、背向左上两步。无登山杖。米白衬衣、灰绿裤、草绿帽、暖赭背包一致。生成结果的脚底并未严格遵守提示中的 88%，不能使用统一 `.88` 锚点。

以下是在最终 WebP 每格中读取 alpha ≥ 128 的可见轮廓所得参考锚点；anchorY 是最低可见脚底，anchorX 是可见包围盒中心。角色缩放保持刚性，步态可由帧切换和小幅重心变化表达。

| 帧 | 可见包围盒 x0,y0,x1,y1 | anchorX | anchorY |
| --- | --- | ---: | ---: |
| 0 | 114,36,352,424 | .52477 | .95270 |
| 1 | 108,37,346,424 | .51126 | .95270 |
| 2 | 133,37,348,428 | .54167 | .96171 |
| 3 | 120,36,352,428 | .53153 | .96171 |
| 4 | 113,27,368,409 | .54167 | .91892 |
| 5 | 104,27,357,411 | .51914 | .92342 |
| 6 | 126,26,345,414 | .53041 | .93018 |
| 7 | 122,26,356,414 | .53829 | .93018 |

人物 PNG 原尺寸 1774 × 887，编码时等比调至 1776 × 888，使格子为整数。其它素材没有几何裁切。使用本机 Sharp WebP `quality:88, alphaQuality:100, effort:6` 转码，透明图保留 alpha。

## 参考与真实性边界

先查看已有 `dist/scenes/tiger-v1.webp` 的精细水彩、纸纹和自然色层，再查看下列公开现场照片。照片仅作为地貌和构图依据，未打包进游戏，未宣称取得其再分发许可。

- [The Fabryk：虎跳峡徒步现场记录](https://thefabryk.com/blog/tiger-leaping-gorge-hike)，作者 Ryan Kretch，页面说明包含 2014、2025 的经历及后续更新。中虎跳两张图体现窄深峡、灰岩壁、河岸巨石及急流： [江边现场照片](https://thefabryk.b-cdn.net/temp/middle-tiger-leaping-gorge_s0f6i7.jpg)、[峡谷与河流照片](https://thefabryk.b-cdn.net/temp/middle-tiger-leaping-gorge_ure9zv.jpg)。不同照片水色不同，不能当作同季同流量的测量组。
- 同一现场记录的 [高路崖面流水照片](https://thefabryk.b-cdn.net/temp/tiger-leaping-gorge-second-day-waterfall_aamey6.jpg)，用于约束薄流水跨过窄山径的空间关系。页面图片说明为高路第二日瀑布；仅凭该图不能确定每一处构筑物的年代或精确机位。
- [The Gone Goat：高路与 Halfway 现场记录](https://www.thegonegoat.com/china/hiking-the-tiger-leaping-gorge-china)，作者 Pashmina。[Halfway 对面山体照片](https://images.squarespace-cdn.com/content/v1/57483e0df699bbec3bf5f6ef/1547098186497-6GVVJHTYG12N428T1WES/Halfway-Guest-House-Tiger-Leaping-Gorge-Hike-Trek-China.jpg) 体现木栏近景与对面的巨大山墙。新图据此减少旧图大桌面的遮挡，不复刻某个房间或阳台。

新图全部是生成的水彩艺术演绎，不是实拍、测绘或逐石复原，也不能证明现实开放或通行状态。高路代表性爬升段不声称逐弯复原二十八弯；河图不以一块特定生成巨石冒充已核准的命名石；龙洞薄流水和设施关系仍须与选定年代资料进一步核对。图片来源不为地图坐标提供证据。

## 生成原件

原件保留在仓库父目录 `../generated_images/`，没有删除或覆写：

| 素材 | 原件 |
| --- | --- |
| 高路 | `exec-25c8711a-6bd3-4504-954e-d66040a2fff8.png` |
| 江边 | `tiger-river-v2-original.png` |
| 前景岩壁 | `exec-dc8665f2-95a9-4922-afe3-53d36813b811.png` |
| 人物初稿 | `exec-7b0d13c0-b93a-49ea-8903-e12e020801ec.png` |
| 人物最终稿 | `exec-22c61956-5b96-4918-a10f-ce1dbdb9cde9.png` |
| 龙洞 | `exec-90bf769f-c473-41d5-8059-ee88f9ed82ba.png` |
| Halfway | `exec-b90f0d5a-5dfb-4327-ad61-4db1172f7835.png` |

江边生成时本机连接短暂断开，自动保存未发生；随后将内置工具返回的同一 PNG 字节恢复到上述原件路径，没有重新绘制或用其它图片替代。

## Prompt set

### River — illustration-story, opaque

Create one landscape 16:9 high-resolution fine hand-painted watercolor game background for Trailbound: the Jinsha River seen at riverbank height in Middle Tiger Leaping Gorge, Yunnan, China. This is an original interpretive landscape, NOT a reproduction of a photo. Geography constraints from observed Middle Gorge field references: narrow deep rock gorge, massive very steep layered fractured dark warm-grey cliff on left, similarly massive dark-grey cliff on right, a narrow hazy blue-grey opening receding near upper middle, sparse dry green shrubs only in rock cracks. Camera is on a low rocky bank looking obliquely along the river, not a high drone or Upper Gorge viewing platform. River occupies the entire lower half and extends into the narrow middle distance. Powerful desaturated grey-blue / muted jade-grey moving water with broken ivory white rapids, flow comes from the center distance toward the lower foreground; asymmetric irregular angular river boulders break and divide flow, one prominent dark slate boulder around x=0.56,y=0.66, several lower rocks downstream. Maintain credible channels around the rocks; no circular whirlpool, no waterfall, no yellow-brown Yellow River, no loess hills, no tropical foliage, no idyllic lake. Reserve enough visible continuous water around foreground boulders for an animated foam layer. Fine granulated pigment, paper fibers, layered transparent washes, controlled botanical and stone details, natural soft daylight, warm-grey rocks with cool shadow and restrained grass green, matching an exquisite Chinese mountain hiking watercolor travel journal. Full-bleed scenic artwork edge to edge, no frame or margins. No people, text, signs, buildings, flags, railings, bridges, UI, lettering or watermark. Make water and immense gorge the principal subject; avoid huge snow peaks in this low river view.

### High trail — illustration-story, opaque

Asset type: landscape 16:9 full-bleed watercolor game scenery, requested canvas 1792x1024 or similar wide high resolution. Original hand-painted interpretive Tiger Leaping Gorge high-trail landscape, Yunnan, matching an exquisite layered Chinese hiking travel journal. From the Haba-side high mountain slope, oblique view across an immense deep V-shaped gorge toward the towering sheer wall of Jade Dragon mountain. The left half and lower-left are a broad obliquely receding weathered grey-brown mountain slope with low grasses, sparse pine and dry-green shrubs, painted with detailed watercolor grain and exposed rock; this continuous left slope must be usable as a background under a separately rendered winding climbing path and small character. Do not paint any visible footpath or switchbacks: those are added by the game as a separate accurate layer. The right half and lower-right reveal immense deep canyon space; a very narrow distant pale blue-grey Jinsha River with tiny whitewater threads runs far below, from far mid-right toward bottom-right. Opposite canyon mountain wall is enormously tall, layered blue-grey / warm-grey fractured rock, a restrained glimpse of snow at its far high crest, realistic scale separation and aerial perspective, not fantasy alpine valley. Soft clear daylight, restrained grass greens, earthy rock and cool atmospheric blue-grey, nuanced watercolor pigment, paper fibers, fine botanical details. Keep central and left climbing slope low-contrast enough for a legible character without losing natural terrain. No people, animals, text, buildings, signs, bridges, railings, labels, borders, UI or watermark. No towering foreground flowers or tropical foliage. This is high above the river, no broad foreground lake, no river crossing, no yellow-brown Yellow River. Make the river visually subordinate to height and deep gorge.

The prompt's word “accurate” refers to the game's separate rendered path and its input alignment; it does not establish geographic surveying accuracy.

### Cliff — illustration-story, transparent

Asset type: one 16:9 landscape game foreground overlay with TRUE transparent alpha. Original very fine natural watercolor rock-edge artwork for Tiger Leaping Gorge high trail. Only paint a narrow irregular rocky cliff strip attached to the far LEFT edge, about 10-16% canvas width, from top left to bottom left, and a LOW small wedge of boulders attached to bottom-right corner, confined to bottom-right 18% width and 15% height. All middle and most of right side completely transparent. The left cliff has layered warm-grey, buff and dark-slate fractured rock, a few tiny sparse grass tufts and muted-green shrubs; lower-right wedge has sunlit layered rock and sparse dry grass. Slight soft watercolor pigment texture inside rock silhouettes, clean transparent outer edges, detailed materials matching a refined hiking travel journal. This is a parallax/occlusion layer, NOT a complete landscape, NOT a frame: don't paint bottom edge across screen, do not connect the left and right rocks. IMPORTANT no trail or path painted on this independently moving layer, no floor, no sky, no distant mountains, no river, no white paper background, no gradient haze, no characters, no text, no UI, no border. Transparent space is about 78% of total image. Natural daylight from upper-left, physically rigid rocks.

### Hiker — illustration-story, transparent

Asset type: production-ready eight-pose watercolor game character sprite sheet on true transparent alpha. Exact layout: 4 equal columns by 2 equal rows, square cells, overall 2:1 landscape canvas, e.g. 2048x1024. In each of the eight cells, the SAME full-body young adult East Asian hiker in a muted moss-green brimmed cap, warm cream long-sleeve shirt, slate-green hiking trousers, sturdy brown boots, and compact warm ochre backpack. Fine natural watercolor, delicate pencil contours, nuanced pigment on paper inside the figure, detailed enough for a graceful mountain-travel sketchbook, not vector or chibi. Same scale and anatomy in every cell. Each figure occupies central 60% of cell width, from 14% to 88% of cell height, with very generous completely transparent margins and feet at the 88% line. NO cell borders, labels, text, floor, base, shadows, dust, grass, colored wash outside silhouette, badges, tools, decorative elements. Row 1 left to right: pose0 right-facing side-view ascending-step left foot forward; pose1 right-facing side-view ascending-step right foot forward; pose2 three-quarter BACK view facing upper-right ascending left foot; pose3 three-quarter BACK view facing upper-right ascending right foot. Row 2 left to right: pose4 left-facing side-view ascending left foot; pose5 left-facing side-view ascending right foot; pose6 three-quarter BACK view facing upper-left ascending left foot; pose7 three-quarter BACK view facing upper-left ascending right foot. Feet and arms move naturally but body height stays consistent, no poles, no exaggerated jumps. Eight separate identical-person silhouettes, one per cell, never touching cells. Transparent everywhere outside figure outlines.

Final edit, using the first generated hiker image as the edit target: Edit this eight-pose sprite sheet for production cleanup ONLY. Preserve all eight same-person hiker poses, their exact 4 columns x 2 rows order and watercolor costume and style. Preserve genuine transparent background. Remove all visible red/yellow fringe speckles and any stray colored pixels outside the natural person silhouettes; edges must be clean and neutrally antialiased. Reposition and uniformly shrink each figure within its own same square cell so its full hat begins at 14% cell height, its lowest boot is at 88% cell height, centered horizontally with spacious transparent margins. Do not crop any hat or boot; no figure may touch row or column boundaries. Overall canvas must remain a 2:1 rectangle, eight square cells in 4x2. No backgrounds, ground, shadows, text, frames, extra figures or any new objects. Keep the figure silhouettes and precise poses; cleanup and spacing only.

### Longdong — illustration-story, opaque

Create a fine full-bleed landscape 16:9 watercolor game background of the Longdong / Guanyin cliffside waterfall along the high hiking trail in Tiger Leaping Gorge, Yunnan. Original artistic interpretation constrained by observed trail photographs: an immense sloping fractured dark grey rock face occupies the left 75% of the image, muted dry grass and sparse green shrubs cling to ledges; a thin irregular multi-strand white stream trickles down the cliff around x=0.28, crossing a narrow almost-horizontal dirt-and-stone footpath around y=0.62, then continues down out of the image. Several tiny rivulets split below the path. This is water running across a mountain trail, NOT a wide front-facing waterfall, not a waterfall into a blue plunge pool. Path follows the cliff from left edge to around x=.78 where it rounds the cliff corner; enough readable light tan path width to place a very small game hiker. Rightmost quarter opens into hazy blue-grey deep gorge and an opposite steep mountain wall. Natural daylight, earth brown and warm grey exposed rock, muted vegetation, pale falling water, exquisite watercolor transparent washes and paper texture, refined natural travel-journal illustration matching the previously generated Tiger gorge artwork. No people, no animals, no text, no signs, no lettering, no UI, no big structures, no bridge, no fantasy ropes, no decorative frame. Do not enlarge the stream into a broad waterfall. Maintain the cliff-trail-water crossing relationship rather than claiming survey-accurate scenery.

The model prompt used a commonly associated alternate name as a generation cue; this file does not independently establish name equivalence or exact waterfall coordinates.

### Halfway — illustration-story, opaque

Create one exquisite full-bleed 16:9 landscape watercolor game scene: the resting terrace / balcony at Halfway Guesthouse on the Tiger Leaping Gorge high trail, looking directly across the gorge toward the vast north-facing Jade Dragon mountain wall. Original interpretive watercolor informed by real travel photos, not an exact reproduction. Mountain wall and atmosphere occupy at least 80% of image: dark blue-grey striated near-vertical enormous rock faces rising abruptly across the valley, serrated crest partly veiled in soft white clouds, small restrained remnants of snow only high in shaded gullies. This must feel face-to-face with a huge mountain wall, NOT an axial symmetrical alpine valley and NOT a distant conical snow volcano. Lower left has just the side of a simple warm weathered wooden chair and a small glimpse of timber terrace structure. A low rustic timber railing runs along the very bottom edge, below y=.82, and a tiny corner of wooden tabletop is confined to bottom-left under 10% image area. Keep the central landscape unobstructed; no giant tabletop. Distant valley floor mostly hidden by the balcony and mountain slopes, no broad river view invented. Delicate soft sunlight, restrained spring green on mountain slopes, natural warm timber, subtle paper grain, richly layered hand-painted pigment, fine rock and wood detail, quiet spacious mountain-travel sketchbook mood, matching the generated high-trail grey-blue palette. No people, animals, written signs, text, flags, brand names, UI, borders or watermark.

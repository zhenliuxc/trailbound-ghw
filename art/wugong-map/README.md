# 武功山地图与人物素材

制作与引用遵循 [游戏美学](../../docs/game-design-charter.md)、[渲染与素材分工](../../docs/RENDERING_AND_LIBRARIES.md) 和 [素材来源规范](../../docs/PROVENANCE.md)。本文保存源图尺寸、锚点、原始来源与生成提示词，不代表主地图使用整幅手绘背景。

## 休息与远眺人物姿势

`hiker-rest-source-v1.png` → `public/characters/wugong-rest-view-v1.webp`，实际 1774 × 887，真正 RGBA 透明背景。参考图为原 `public/characters/trailbound-chibi-v1.webp`，以原角色米帽、红巾、灰蓝衣、卡其裤、苔绿包身份生成两种新姿势；左侧坐在低灰岩上休息，背包放身旁，右侧背后三分之二站姿远眺，看不到正脸。

两格都按 887 × 887 划分。实际大连通 alpha 边界和安全裁切区域见 `hiker-rest-v1.json`：

| 姿势 | visibleBounds (x,y,w,h) | sourceRect (x,y,w,h) | 源图脚底锚点 | 相对 sourceRect 脚底锚点 |
| --- | --- | --- | --- | --- |
| sit | 172,176,682,640 | 166,170,694,652 | 622,812 | 456,642 |
| view | 1159,87,392,734 | 1153,81,404,746 | 1408,815 | 255,734 |

姿势图只整图 WebP 编码，不修改源像素；准备脚本同时生成其 JSON 元数据。坐姿和背影延续同一角色身份，完整帽顶、石头、背包与双脚保留在裁切范围内。

原件：`/Users/liuxucheng/.codex/generated_images/01a14806-838b-72c0-8dcb-ba7f05fa57a4/exec-0d12b94e-fdda-4429-b166-575b91a6c6f0.png`

### 完整提示词 · 休息与远眺人物

```text
Use case: identity-preserve.
Asset type: two new poses derived from the provided Trailbound watercolor hiker character reference sheet, for a mountain walking game's camp and vista scenes.
Input image: the provided local Trailbound character sheet is an identity, proportions, clothing, watercolor brushwork, and materials reference; it is not a layout to keep.
Create a new truly transparent RGBA sprite sheet with exactly 2 equal-width columns and 1 row, ideally 2048×1024, with a broad empty fully transparent gap between poses and large transparent margins on every side. The same single character appears once in each column, complete whole body without cropping. Preserve the reference's appealing compact Q-version figure, large head, soft dark brown hair, warm skin, ivory-beige hiking hat with olive band, muted brick-red neck scarf, slate-blue jacket with khaki pocket trim, tan hiking trousers, brown leather hiking boots, moss-olive canvas backpack with tan straps, silver flask and tightly rolled grey-green sleeping mat. Preserve the reference's fine natural watercolor rendering, paper-like brush grain within colored regions, delicate linework and calm warm lighting. Both poses must have equal head size and body proportions; no other characters.
Left column: clear right-facing side or gentle three-quarter side view of this hiker sitting naturally on a low broad flat grey stone, resting. The hips rest visibly on the stone's top; both knees are bent naturally, boots on ground, both hands resting gently on knees, relaxed shoulders, scarf falls beside shoulder. The recognizable moss-green backpack is standing on the ground immediately beside the resting hiker, not worn, with its flask and rolled mat. The complete hiker, stone and backpack group fits within the left cell. Clear content-free transparent padding all around.
Right column: the same hiker standing quietly and looking outward, fully seen from the rear with only a slight three-quarter turn, no visible face or eyes whatsoever, hat back and backpack occupy the center, both boots planted comfortably. Both arms rest low at the sides or gently hold backpack shoulder straps. Worn backpack with flask, rolled mat and tan straps. A small scarf tail drifts sideways. Complete figure from top of hat to soles, with clear transparent padding all around.
No floor, terrain, sky, scenery, paper rectangle, backdrop, broad external shadows, cast shadow, drop shadow, transparency checkerboard, text, label, border, grid, icon, watermarks or UI. Transparent empty pixels must remain genuine alpha. Do not change clothing colors, backpack design, age or face identity. Do not draw a front-facing or face-visible figure in the right column.
```


素材由内置 `image_gen.imagegen` 生成，画风参考为 `public/scenes/wugong-v1.webp` 与 `public/scenes/wugong-cloudsea-v1.webp`。地形、物件和人物分别保留独立源图。

## 文件与尺寸

| 源文件 | 交付文件 | 实际尺寸 | 用途 |
| --- | --- | --- | --- |
| `terrain-source-v1.png` | `public/scenes/wugong-terrain-v1.webp` | 2172 × 724 | 3:1 斜俯视地面长卷，左侧山林经草坡到右侧草脊灰岩；不含天空和提前展开的云海 |
| `props-source-v1.png` | `public/sprites/wugong-map-props-v1.webp` | 1254 × 1254，RGBA | 树、芒草苔石、双帐篷营地、观景石四组独立景物 |

生成工具返回的分辨率低于提示词请求的 3072 × 1024 与 2048 × 2048；未放大插值，也不把提示词尺寸称为实际尺寸。透明图的上排高于下排，不能按四个等大方格切图。`props-v1.json` 和 `src/runtime/wugong-prop-art.ts` 保存实际 alpha 边界、相应源图矩形与地面锚点。每个锚点相对其裁切矩形，不相对整张图。

运行 `node art/wugong-map/prepare-v1.mjs` 可从保留的 PNG 源图重新编码 WebP 并生成上述坐标元数据。脚本按显式非等分区域查找 alpha > 12 的八连通域，合并区域内所有不小于最大域 0.8% 的主要区域，保留完整营地，边缘加入至多 6 像素。只对整张原图做格式编码，保留原有 alpha；没有抠改、改色、重画或生成新背景。坐标计算不是游戏测试。

长卷是无天空的连续地面；四组景物保持独立透明间隙。整幅手绘地形属于素材源，当前行进地图使用程序绘制的 2D 示意图。

## 来源

- Terrain 内置生成原件：`/Users/liuxucheng/.codex/generated_images/01a14806-838b-72c0-8dcb-ba7f05fa57a4/exec-d0feb9e1-c5e5-457a-94d0-dabd113c32da.png`
- Props 内置生成原件：`/Users/liuxucheng/.codex/generated_images/01a14806-838b-72c0-8dcb-ba7f05fa57a4/exec-bebc4276-1ac4-4027-8a73-af236c1dc909.png`

## 完整提示词 · Terrain

```text
Use case: illustration-story.
Asset type: high-detail watercolor terrain background for the Chinese mountain walking game Trailbound, a panoramic game environment that will be horizontally scrolled behind a small independent hiker and road.
Create one seamless, exquisitely detailed hand-painted watercolor landscape of Wugong Mountain in Jiangxi, China, warm season. The entire composition is seen from a consistent oblique bird's-eye camera roughly 50 degrees downward, like a beautiful hand-painted walkable world viewed from above, NOT a landscape postcard or a front-facing panorama. The entire image is terrain, viewed downward: NO sky, NO horizon line, NO distant horizontal mountain backdrop, NO early cloud sea.
Composition: extremely wide 3:1 panorama, ideally 3072×1024 or higher within the same ratio. Landscape continuously transitions from left to right: at the far left, cool moss-green temperate broadleaf mountain woodland, organic tree crowns with visible trunks and occasional stone steps among the roots, beautiful little moss-covered grey rocks; through left-center a rising sunlit grassy hillside, soft soil patches, loose fine grasses; in the center, a broad rolling golden-green mountain meadow; on the right, a gently rising grassy ridge with distinctive broad weathered pale-grey mountain rocks. Terrain contours are soft, natural and painterly. Scattered grass clumps, roots, stones, earth and individual leaf groups are fine and lush in near terrain, with delicately layered watercolor pigment granulation and paper texture. Use ivory paper highlights, warm golden-green Chinese silvergrass, olive broadleaf foliage and restrained blue-grey rock shadows.
Keep a broad natural lightly vegetated traversal corridor running gently across the middle-to-lower half of the whole image so the game can overlay a continuous pale-earth road and hiker. This corridor blends naturally into meadow and soil; do not paint a specific path or a trail line. Trees gather above or below it instead of blocking its entire width. Leave the central lower parts visually legible. The overall ground plane and scale stay consistent from left to right. Paint the terrain edge-to-edge, no vignettes or white paper border.
Craft: fine finished watercolor illustration with expressive layered washes, countless delicately painted grass blades and mineral textures, tactile matte paper. Natural directional light, subtle shadows, rich landscape specificity, peaceful immersive travel-sketchbook feeling. Retain the artwork's subtle painterly details without rough geometric mountain silhouettes. No people, characters, animals, tents, buildings, labels, symbols, badges, route markers, roads, text, watermarks, buttons or UI. No tropical plants, river, lake, snow, fantasy elements or cloud sea. No cartoon geometry, flat vector art or plastic 3D render.
```

## 完整提示词 · Props

```text
Use case: illustration-story.
Asset type: production-ready game environment prop sprites for Trailbound, Wugong Mountain in Jiangxi, warm season. Create ONE genuinely transparent RGBA PNG sprite sheet, preferably 2048×2048 pixels, arranged as exactly 2 columns and 2 rows of independent complete objects. Each cell has extensive empty transparent margins; objects never touch any sheet edge or cell boundary. There are NO outlines, labels, cell grid or background.

Paint in exquisite delicate hand-painted natural watercolor, layered pigment, tactile details inside the painted shapes, golden-green Chinese silvergrass, cool olive broadleaf foliage, warm ivory and pale grey rock, soft sunlight from upper left. Use a consistent oblique bird's-eye angle about 45 degrees downward, suitable for placing independently in a small hiker's game map. The art should match refined Chinese mountain travel sketchbook watercolor and be highly legible as full separated props.

Top-left cell: one full temperate broadleaf mountain tree with a naturally irregular rich foliage crown, visible branching grey-brown trunk and roots ending in a tiny confined mossy soil patch. Complete tree silhouette, crown and trunk entirely within the cell. Fine individual leaf clusters with open gaps, no palm, bamboo, pine or tropical leaves.
Top-right cell: a composed group of several elegant Chinese silvergrass clumps with fine green-gold blades, a few delicate flowering seed heads and two small softly weathered mossy grey stones. Low cluster, complete silhouettes within its own cell.
Bottom-left cell: one small quiet hiking camp comprised of exactly two modest complete dome tents, one warm ivory-beige and one muted sage green, placed beside each other on a very small confined ground patch. Entire tents fully visible from above at the same oblique angle; delicate fabric watercolor detail, entry openings and guy-lines. No logos, people, campfire, flags or extra objects.
Bottom-right cell: one broad flat weathered pale-grey scenic lookout boulder with a usable clear upper seating/standing surface and a few small tufts of silvergrass along its outer lower edge. Entire rock, coherent upper surface and side faces clearly visible. Natural fine mineral texture, moss seams, restrained shadows painted inside rock surfaces.

True fully transparent background and transparent gaps between foliage, blades, guy-lines and other separated painted shapes. Ground contact soil patches must remain small and confined beneath the object; do not fill rectangular cell grounds. No paper background, colored backdrop, broad external cast shadows, drop shadows, cloud, sky, mountains, scenery, horizon, road, trail, humans, animals, icons, borders, text, watermarks, UI. No white rectangles or a painted transparency checkerboard. Keep all objects independently extractable from their quarter of the image without neighboring fragments.
```


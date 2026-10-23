# 武功山林缘与草甸画面样稿

> 当前状态：已停用并存档。用户在查看实际行走样段后明确放弃该方向，要求主页面改回程序绘图与交互。主页面入口已移除，旧预览地址返回主页面；原预览 HTML 保存为 `walk-preview-archived-v1.html`，源码、样稿与素材保留。下文仅为历史制作记录，不代表继续采用或已验收。

## 可行走样段

用户进一步要求完成这一小段并打开本地预览。入口为 `dist/wugong-study.html`，本机地址为 http://127.0.0.1:8000/wugong-study.html?walk=1 。查询参数 walk=1 在素材就绪后开始沿路行走；普通地址保持初始静止。

- 源码：`src/wugong-study/`；生成入口：`dist/wugong-study.js`，由 `npm run build` 生成。
- 保留已确认构图，内置 imagegen 仅移除画中原人物，并另生成同风格的 4×2 八帧透明人物图。源图为 `ground-source-v1.png`、`walk-source-v1.png`，未覆盖原样稿。
- `node art/wugong-study/prepare-walk.mjs` 使用本机已有 sharp 整图转码并读取 alpha 边界，生成对应 WebP 和脚底锚点 JSON。ground 为 1672×941；人物 sheet 为1774×887，公共参考高度371.5。
- 点击或轻触浅土路沿路行走；可暂停、继续、回林缘或看全景，保留方向键/WASD、空格和 Escape。路径按底画暖土色路面校准，岩石后部分为美术连续线，不是 GPS 数据。
- 镜头只跟随路径脚点；人物使用短步幅和小幅前倾，树丛与岩石的遮挡读取同一底画的像素。前景像素遮罩在加载时准备，不在每帧重建；树丛遮罩去掉土色道路，避免把路面误当前景盖住人物。
- 手机按等比裁切跟随人物；减少动态效果、后台暂停、离开页面清理与素材失败重试均已编写。页面不读写主游戏进度、照片或手帐。
- 已完成一次必要构建以生成本地预览脚本。未运行自动测试、浏览器行走验收、手机或音频测试；构建成功不代表这些体验已通过。未提交、未推送、未发布。

无人物底画的内置来源：`/Users/liuxucheng/.codex/generated_images/01a147f8-0858-74e1-aa88-74d7c723c446/exec-b201ff58-865a-433e-a48b-c4a655490db9.png`。
步行动画的内置来源：`/Users/liuxucheng/.codex/generated_images/01a147f8-0858-74e1-aa88-74d7c723c446/exec-264851b2-676c-43aa-86ce-0782dd925dfc.png`。

### 无人物底画完整提示词

```text
Use case: precise-object-edit.
Edit target: the supplied approved Trailbound Wugong forest-to-meadow illustration.
Create the production clean background plate for this SAME game scene. Remove ONLY the one little hiker standing in the middle of the path and the hiker's contact/cast shadow. Inpaint the small vacated area with continuous pale warm-earth footpath matching its immediately surrounding brushwork and a few understated tiny stones. There must be no person, person-shaped residue or shadow anywhere.
Preserve EVERYTHING else exactly: same 1672-by-941 wide framing and camera, all path bends and path widths, all rocks, tree trunks, foliage and grass, their locations, lighting, color palette, fine olive pencil outlines, quiet watercolor-gouache texture, paper grain and atmosphere. This image is the approved art; do not redesign, simplify further, add grass to the trail, change details outside the hiker's former silhouette, change exposure or recolor. No extra props, labels, text, UI, border, watermark or new scenery. Edge-to-edge landscape background.
```

### 步行动画完整提示词

```text
Use case: identity-preserve.
Asset type: original Trailbound production animated character sheet, truly transparent RGBA PNG. Wide 2:1 canvas approximately 2048x1024, EXACTLY FOUR columns by TWO rows, eight equal square cells.
Input image is the APPROVED SCENE AND CHARACTER STYLE REFERENCE. Use only the little human hiker standing on the path as exact character identity, body proportions, viewpoint and drawing reference. Do not include the scenery.

Create eight chronological frames of ONE calm short-stride uphill walking cycle for this SAME hiker. All eight full-body figures seen in the same elevated three-quarter rear/right view as the reference, facing diagonally screen right/up. Same three-quarter view, same physical size, head angle, torso shape and costume in all frames, with no turn toward the viewer. Natural compact human drawing, same head-to-body ratio as reference; no cute huge head or anime eyes.

Exact identity: beige soft-brim trekking hat with olive hatband, tiny glimpse of dark hair under the rear brim, short rust-red scarf around neck with a small loose tail, matte blue-grey jacket and sleeves, khaki hiking trousers, brown ankle boots, moss-olive cloth backpack with brown/tan straps, small rolled beige mat across its bottom. Preserve the approved thin imperfect olive-brown pencil/ink contours, understated matte watercolor-gouache color shapes, muted warm green palette and gentle light from upper left. The hiker must look cut from the SAME illustrated world, not a shiny separately rendered object. Simplify equipment as in the reference. No new objects, staff, accessories, polished 3D shading or thick outlines.

Row-major chronological frames, left-to-right top row then bottom:
1 Left boot a short distance ahead planting heel, right boot behind toe pushing off, left near arm gently back.
2 Weight settles over left boot, right rear knee bends as its boot lifts.
3 A genuine narrow PASSING POSE: left supporting leg below hip, lifted right boot passing very close beside it, legs nearly overlap, arms near the side of torso. Not a split stride.
4 Right boot swings a short distance ahead with bent knee, left heel rising.
5 Opposite contact: right boot forward planting heel, left boot behind pushing off, near arm gently forward.
6 Weight settles over right boot, left rear knee bends and boot lifts.
7 Opposite narrow PASSING POSE: right leg supports below hip, left boot passes close beside supporting leg, legs nearly overlap.
8 Left boot swings gently forward, right heel lifts to return to frame 1.
Small reciprocal arm swing, subtle scarf and pack settling, 3-degree uphill forward torso lean, never a running or marching step. Feet advance only a modest distance in these poses, the compact path walk in the reference.

Registration: each full figure centered at 50% of its cell width, body height around 72% of cell height, common planted-foot baseline at 86% of cell height; all hats aligned around 14% cell height. Preserve generous truly transparent gaps, especially between the rows. Hat, pack, scarf and boots must never touch cell edges or neighboring cells. Identical head, hat and torso scale in every cell. Only slight body rise inherent to walking, no resize or squash.

Background: actual alpha transparency around and BETWEEN all body parts. No white or cream paper rectangle, no colored halo or checkerboard. Pigment texture belongs only inside painted character shapes. No ground, grass, environment, floor shadow, road, text, numbering, grid lines, borders, logo, extra figures, scene miniatures, full-front figure, side-profile figure or montage. Exactly eight independently extractable full figures of the same rear-three-quarter hiker.
```


2026-10-17。用户选择《Snufkin: Melody of Moominvalley》作为整体画面参考，要求先做一小段武功山，人物和场景风格统一。

`forest-meadow-study-v1.png` 是最初选用的静态美术样稿。画面选取林缘通向草甸的一段缓坡，人物、道路、树木与岩石同时绘制。用户随后确认这一方向可以，并要求制作可实际行走的小段。本图仍是样稿，不是游戏截图；后续行走实现与状态见下文。

使用内置 image_gen 生成首图，再进行一次定向简化，收拢草坡与树冠的碎笔触。未使用 CLI 或外部收费素材。角色及场景原创，仅参考该游戏的绘本构图、笔触统一和留白关系。沿用米帽、砖红围巾、灰蓝外套与苔绿背包的身份元素。

选用图内置生成来源：`/Users/liuxucheng/.codex/generated_images/01a147f8-0858-74e1-aa88-74d7c723c446/exec-8cc4d135-9f3a-44f1-a0d3-5dc246139029.png`。原样复制入库，没有裁剪、改色、拼接或覆盖旧资产。首图仅作为编辑过程，不接入项目。

## 首次生成完整提示词

```text
Use case: illustration-story.
Asset type: one finished visual sample for Trailbound, an original hand-painted hiking game. Create a wide landscape 16:9 illustration, approximately 1920 by 1080, showing ONE small playable-looking section of Wugong Mountain, Jiangxi, China. This is a scene composition with its hiker painted into it, not a sprite sheet, collage, presentation, or interface mockup.

Primary visual direction: the cohesive, carefully composed hand-drawn storybook game world of Snufkin: Melody of Moominvalley. Borrow the visual principles of clear oblique overhead terrain, clustered vegetation, quiet open ground, restrained watercolor-gouache, delicate irregular drawn contours, and a small readable character. Create original Chinese mountain scenery and an original Trailbound hiker; do not include Snufkin, Moomin characters, their houses, or recognizable game scenery.

Scene: a short inviting trail at the transition from subtropical mountain broadleaf woodland to Wugong's open highland green grass slopes in the warm growing season. One continuous warm light-earth footpath enters at lower left, bends gently through the middle, and turns uphill out of sight around a rounded grassy shoulder toward upper right. There is one significant curve, not a maze or many switchbacks. Dense leafy trees gathered in distinct loose clusters on the left and in the near foreground frame the route; the right half opens into a graceful green meadow slope with a few broad pale-grey weathered rocks. A further rolling grassy shoulder appears only softly along the upper edge. No vast vista or cloud sea yet. The path and a substantial area of soft simple meadow stay visually clear. Show only this small section, no full route map, no isolated floating island, no diorama edges, no white margins.

Camera and composition: consistent 40-to-45-degree oblique top-down game view, with little or no sky. Ground plane, rocks, trees and person share exactly the same perspective and sunlight. Natural asymmetric composition, broad restful areas and controlled detail. Trees have irregular rounded hand-drawn crowns with selected leaf marks inside, shaded moss/olive/blue-green groups, visible slender grey-brown trunks. Farther trees are gently quieter. Foreground foliage provides some overlapping depth. Grass uses a few rhythmic blade clusters along rocks and path edges, never a uniform field of scratches. Shadows are broad muted cool washes with subtle dappled light, never dramatic black shapes.

Hiker: exactly ONE small original human hiker, placed at the central bend, comfortably visible with full body. The hiker is about 7 percent of the full frame height, roughly three heads tall, seen from the same elevated three-quarter back/side angle, walking uphill toward the meadow with a short relaxed step and modest forward lean. Beige soft brimmed trekking hat with olive band, short dark hair, muted rust-red short scarf, simple blue-grey jacket, khaki trousers, brown boots, moss-green backpack with a small rolled mat. Simplify these at game scale. The person has the SAME thin imperfect olive-grey pencil/ink contours, matte pigment fills, selective soft brush shading and paper grain as every tree and rock. Compact natural silhouette and tiny understated face, no large sparkling anime eyes, no thick black cartoon outline, no shiny detailed equipment. Soft contact shadow under the planted boot. The hiker must feel painted by the same illustrator in the same pass as the landscape, without white halo, cutout edge, sticker look, or separate high-detail rendering.

Palette and craft: warm cream paper showing through muted spring olive and sage greens, restrained deeper blue-green canopy shadows, blue-grey rock shadow, gentle golden sunlight. Fresh, calm and quietly inviting. Fine watercolor and opaque gouache with intentional flat painted masses, light pigment granulation and very restrained pencil details. Tactile paper texture is subtle, not an overlaid noisy filter. Overall refinement comes from composition, coherent shapes and selective detail.

No text, labels, signs, buttons, HUD, titles, frame, watermark, map symbols, pins, decorative route line, multiple characters, buildings, tents, animals, tropical palms, bamboo forest, snowy alpine peaks, sharp European mountains, golden autumn grass, photorealism, 3D rendering, glossy lighting, heavy blur, oil-paint smears, countless individually rendered leaves, or dense repeated texture.
```

## 定向简化完整提示词

```text
Use case: precise-object-edit.
Edit target: the supplied original Trailbound Wugong forest-edge hiking illustration.
Make one focused art-direction refinement: simplify the environment's excessive microdetail into the coherent, quiet, delicately drawn storybook game language of Snufkin: Melody of Moominvalley. Keep the same overall shot, landform, tree placement, continuous pale-earth trail, original hiker identity, and woodland-to-meadow setting.

Replace the many tiny repeated grass strokes, leaf speckles, pebble marks and harsh mineral patterns with much larger, calmer, intentional watercolor-gouache color shapes. In particular, the broad right-hand grassy slope should have generous smooth softly mottled sage-green areas with only occasional designed tufts at rock edges and footpath edges. Keep no more than a quarter of the current tiny marks. Tree crowns should read as a few rounded asymmetrical painted foliage masses, with selected irregular pencil leaf contours, not hundreds of individually painted leaves. Use a little more fresh sage and olive green and less overall mustard-yellow, retaining gentle warm sun. Preserve selected near-road roots, several lovely rocks and grass clumps as the places where detail gathers. The whole image should look drawn with one illustrator's fine muted olive-grey pencil and painted with translucent watercolor plus matte gouache, especially the hiker, plants and rocks. No photographic materials or dense grain overlay.

Refine the one existing hiker in place so their full-body visible height is about 9 percent of the canvas height. Preserve the beige hat, rust-red short scarf, blue-grey coat, khaki trousers, brown boots and olive backpack, original human character and calm uphill walking action. Give the hiker the same light irregular pencil contours, simple matte washes, softened small details and sunlight as the landscape. Boots have a soft grounded contact shadow and a little overlapping verge grass, no sticker effect or separate rendering.

Critical invariants: same single continuous path and its bend; same 40-to-45-degree oblique downward perspective; forest left and grass meadow opening right; one character; trees in the foreground frame rather than hide the trail; no large sky, no cloud sea, no added props or scenery. Keep edge-to-edge wide landscape framing. No writing, UI, border, logo, glow, thick black outlines, flat vector geometry, 3D, anime face, motion blur, or Moomin characters. Preserve painterly craftsmanship through clear shape design and light pigment variation. Make the calm open meadow and unobstructed walking space a substantial part of this composition.
```

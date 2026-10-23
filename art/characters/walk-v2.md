# 主地图连续步行素材 v2

本轮按「步态再优化」制作独立的 8 帧步行素材，使用内置 `image_gen` 一次生成，未调用收费 API、CLI、Tripo 或 Spine。

## 产物与来源

- 原始生成 PNG：`art/characters/walk-source-v2.png`。
- 网站 WebP：`dist/characters/trailbound-walk-v2.webp`。
- 素材准备脚本：`art/characters/walk-prepare-v2.mjs`，使用本机已有 sharp，运行 `node art/characters/walk-prepare-v2.mjs` 可重新读取 alpha、生成帧数据和运行时常量，并进行整图 WebP 转码。
- 帧数据：`art/characters/walk-v2.json`。
- 运行时常量：`src/runtime/map-walk-art.ts`，由素材准备脚本维护，不手动改写帧数字。
- 尺寸：1774 × 887，4 列 × 2 行，RGBA 透明背景；实际尺寸不能被列数、行数整除，接入需使用整数 sourceRect。
- 身份参考：`dist/characters/trailbound-chibi-v1.webp`，沿用米草帽、橄榄帽带、红围巾、灰蓝外套、卡其裤、棕靴、苔绿背包、银色水瓶和卷垫。
- 内置工具原始位置：`/Users/liuxucheng/.codex/generated_images/01a147f9-ae15-7353-a5a1-6f21001099b6/exec-6cee8e5d-f00c-435e-9616-946b843ae91d.png`。
- 转码只对整图使用本机已有 sharp WebP 编码：quality 90、alphaQuality 100、effort 6；未裁拼、重绘、拉伸、改色或改变 alpha。

## 创作检查与使用边界

查看过参考及生成的源图片。第 3、7 格出现真正收腿、髋下经过的窄步幅姿势，比旧素材始终双腿张开的轮廓更适合连续步行，建议采用。两组接触帧的摆臂也有前后交换。人物身份和水彩方向继续沿用原图。

生成工具没有完全遵守透明留白，角色几乎占满单元高度，两行之间空间很小。素材准备脚本使用列分界 `[0, 443, 887, 1330, 1774]`、行分界 `[0, 447, 887]`，逐格读取 alpha > 12 的最大八连通角色区域。`sourceRect` 以角色区域为基础，四边增加最多 1 px 余量并限制在单元内，避开相邻角色。原始像素未作修改。第 4、8 格仍接近伸腿姿势，生成素材不保证逐帧生物力学精确。

JSON 中 `cellRect`、`visibleBounds`、`sourceRect` 和 `footAnchorSource` 使用源图坐标，`footAnchor` 使用相对裁框坐标。脚锚水平位置参照手工读取的髋部中轴，垂直位置取角色区域鞋底最大 y + 1。运行时帧 tuple 顺序为 `[x, y, width, height, footX, footY]`。本套 8 帧可见高度中位数为 429 px，统一显示比例为 `54 / 429`，约 0.125874；不按每帧高度分别缩放。

目前完成素材创作检查、alpha 读取、帧数据生成和格式转换。未运行游戏、浏览器、构建、自动化测试或游戏验证脚本，未进行实际动画体验验收。循环连贯、脚底稳定与地图显示仍待接入后按用户允许的范围查看。

## 完整提示词

```text
Use case: identity-preserve.
Asset type: production 2D watercolor hiking game sprite sheet, eight sequential walk poses, genuinely transparent RGBA.
Input image: the supplied existing character sheet is a STRICT CHARACTER IDENTITY AND PAINTING STYLE REFERENCE. Use its small chibi hiker. The old walking poses are NOT motion references: their legs remain too widely spread. Create an anatomically coherent continuous walk with real passing poses.
Primary request: make ONE clean sprite sheet, exactly FOUR equal columns by TWO equal rows, EIGHT full-body sprites in row-major sequence. Wide 2:1 overall canvas, square equal cells. Every sprite is the SAME little hiker, SAME physical scale, SAME right-facing three-quarter side view, head and upper torso almost identical throughout. This is a quiet relaxed walk, never running or marching.
Character invariant: friendly rounded chibi male hiker, large dark eyes, short tousled black hair, beige floppy wide-brim trekking hat with olive band, muted rust-red scarf, blue-grey field jacket, khaki trousers, brown hiking boots. Moss-olive backpack with tan straps, silver dark-capped side water bottle and rolled sleeping mat at the bottom. Fine hand-painted watercolor washes with pencil-like detail, pigment variation, feathered edges. Preserve all identity and clothing details from the reference. No walking sticks.
Motion structure: a single complete relaxed 8-frame cycle with small reciprocal arm swing and modest knee bend. Read left to right, top row then bottom row:
Frame 1: LEFT/near boot forward heel contact, RIGHT/far boot behind pushing off, near arm back and far arm forward.
Frame 2: weight lowers slightly onto forward LEFT/near boot, RIGHT/far knee begins bending and boot lifts from rear.
Frame 3: TRUE NARROW PASSING POSE. LEFT/near leg supports almost vertically beneath the hip. Bent RIGHT/far knee and lifted boot pass directly under the hip close beside the supporting shin. Legs nearly overlap, boots only a small horizontal distance apart. DO NOT draw a split stride here.
Frame 4: RIGHT/far bent knee swings gently ahead, LEFT/near supporting heel rises; weight a little higher; arms passing center.
Frame 5: RIGHT/far boot forward heel contact and LEFT/near boot behind pushing off. Clearly exchange the forward and rear legs compared with frame 1. Near arm forward, far arm back.
Frame 6: weight lowers slightly onto forward RIGHT/far boot, LEFT/near knee bends and boot lifts from rear.
Frame 7: TRUE NARROW OPPOSITE PASSING POSE. RIGHT/far leg supports nearly vertically under the hip; bent LEFT/near knee and lifted boot pass directly under the hip close beside the supporting shin. The silhouette is visibly narrower than frames 1 and 5. DO NOT draw a split stride.
Frame 8: LEFT/near bent knee swings gently ahead, RIGHT/far supporting heel rises, ready to return seamlessly to frame 1.
Registration: all heads face screen right with NO angle changes. Keep hat, face, torso and backpack aligned around the same cell-relative hip axis at 50% width. All figures identical head size and standing height. A common ground/contact baseline at 88% of each cell height; slight natural body rise only, no stretching or scaling. Entire figure occupies roughly 76% of cell height. Generous empty transparent margins around hat, scarf, backpack and boots in EVERY cell. No overlap or clipping between cells. Preserve consistent accessories instead of adding or removing items.
Backdrop: truly transparent outside painted character, including gaps between limbs. No paper rectangle, white matte, color halo, terrain, cast shadows, ground, grass, motion lines, extra objects, labels, numerals, words, watermark, frames or visible cell lines. No 3D, flat vector or thick cartoon outlines.
Priority: eight readable DIFFERENT biomechanically coherent steps, especially the two narrow passing poses and swapped contact poses, while preserving the exact reference character.
```


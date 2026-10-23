# 观音宕营地素材

2026-10-18，使用内置 image_gen 生成。两张图以用户提供的夜间营地构图和现有 Q 版人物为参考，属于游戏插画，不是观音宕实景照片。

## 夜景画稿

原稿为 `night-source-v1.png`，网页使用 `dist/scenes/wugong-camp-night-v1/night-v1.webp`。参考图一是用户提供的星空营地，参考图二为 `art/characters/walk-source-v2.png`。

```text
Use case: illustration-story. Create one production game-event watercolor background, wide landscape 16:9 or 2:1, high detail, for Trailbound's Wugongshan Guanyindang campsite first night. Image 1 is COMPOSITION AND LIGHT reference only. Image 2 is the EXACT CHARACTER IDENTITY reference, a sprite sheet of ONE character. Make a NEW coherent scene with exactly ONE of that Q/chibi hiker, large expressive eyes, brown hair, straw hiking hat with olive band, blue jacket, red scarf, tan trousers, brown boots and olive backpack. Seat this same character quietly in three-quarter side view at the LOWER LEFT, face looking up toward sky, backpack set beside them and an open sketchbook on lap. The seated character is small within the panorama, roughly 14 percent of image height. Watercolor and fine pencil edges consistent across character and scene. Two modest amber-lit camping tents behind the traveler on the grassy slope at lower left, then a recognizable broad high-altitude GRASSY SADDLE BASIN with tiny organized tent platforms in the midground, rounded connecting Wugongshan grass ridges and layered blue gray distant mountains. Warm-season green meadow, a little warm gold rim light on grass, no alpine snowy pointed peaks, no tropical trees. The upper 55 percent is a spacious deep indigo slightly textured watercolor sky with very sparse tiny dim stars. Leave the entire center and upper right sky dark and uncluttered because the program will place interactive constellation stars there; NO painted big bright stars, NO constellation lines, NO dominant moon, NO dense Milky Way at center. Small low clouds remain between distant valleys below ridge crests. Keep path, mountains and grass legible, fine visible handmade paper and pigment texture. Calm, intimate, beautifully painted travel journal illustration, no glossy 3D, no photoreal human, no huge head filling scene, no sticker collage, no labels, no text, no UI, no frames, no watermarks. Full bleed edge to edge.
```

## Q 版营地动作

原稿为 `actions-source-v1.png`，网页使用 `dist/scenes/wugong-camp-night-v1/actions-q-v1.webp`。参考图为 `art/characters/walk-source-v2.png`，要求透明背景。

```text
Create a transparent PNG game sprite sheet, 2 by 2 equal square cells, four poses of exactly the SAME SINGLE Q/chibi hiking child shown in the reference sheet. Match the reference identity faithfully: very large dark expressive eyes, short brown hair, straw hat with olive band, red scarf, blue hiking jacket, tan trousers, detailed brown hiking boots, olive backpack and rolled sleeping mat. Fine watercolor and pencil illustration, natural outline, not glossy 3D. Each pose faces RIGHT in three-quarter SIDE view. TOP LEFT: standing, backpack still on shoulders, hand holding strap. TOP RIGHT: crouching slightly to put the olive backpack down beside the boots, backpack separated from body but inside this same cell. BOTTOM LEFT: seated on a low nearly invisible rock with knees bent and boots pointing right, backpack placed at the character's left side, looking peacefully toward the upper right sky. BOTTOM RIGHT: the same seated pose, sipping water from a small metal cup, backpack at same left side. Four isolated full-body figures centered in their own cells, large 10 percent transparent margins to all cell borders, all hats and boots fully visible, no part touches cell edges or another cell. One pose per cell only. No background landscape, no scenery, no ground rectangle, no frame, no numbers, no letters, no drop shadow rectangle. Actual transparent alpha background. Keep the reference's big-eyed Q face, proportions and clothes precisely; no realistic adult.
```

## 网页资源准备

`node scripts/art/prepare-wugong-camp.mjs` 转换 WebP，并按透明区域间隙分行、计算人物边界，生成 `src/wugong-walk/scroll/camp-poses.ts`。生成图的行分界不是图片正中，不能按四等分强行裁切。原稿保留，脚点与画风效果仍以实际页面验收为准。

游戏连星由 SVG 与类型化状态实现。完成后的手帐截取同一张插画及玩家连出的星线，使用现有手帐存储与去重规则。星形为小游戏图案，不作为特定日期、方向的天文星图。

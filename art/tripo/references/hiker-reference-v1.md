> 迁移后，旧 `../generated_images/` 的原始素材副本保留在本工程 `.local/source-images/`；下文原始输出路径为历史来源记录。

# 徒步人物 Tripo 建模参考 v1

- 用途：Tripo image-to-model 的单人参考，后续在 Blender 精修；不是模型、绑骨结果或游戏直接贴图。
- 项目文件：`art/tripo/references/hiker-reference-v1.png`
- 原始输出：`../generated_images/exec-2b00e359-67c2-44f0-9ceb-571e9f5c0ca7.png`，保留未改。
- 实际规格：1024 × 1536 px，PNG，sRGB，8-bit RGBA，具有 alpha 透明通道；没有裁切、缩放、调色或自动抠图。
- 工具：内置 `image_gen.imagegen`，`transparent_background: true`；未用 CLI/API fallback，未调用 Tripo。
- 风格参考：查看现有 `dist/sprites/tiger-hiker-v2.webp` 和 `docs/tiger-three-materials.md` 后，用文字延续草绿帽、米白衣、灰绿裤、暖赭背包与棕鞋的身份及色板。原精灵图没有作为修改目标上传；本图是原创生成。
- 画面：一名年轻成人徒步者，正面 A-pose，全身与鞋底完整，双臂与躯干、两腿分离，近自然成人比例。肩带、胸扣、腰带、衣褶、口袋和鞋带有可辨细节；背包部分由正面肩部及身体两侧可见。
- 生产边界：单张正面参考不能定义背面结构或保证模型拓扑、手指、背包分体和绑骨质量。Tripo 生成后仍需在 Blender 做背面设计、网格/材质清理、角色比例与动画处理。本图表面偏精细写实概念渲染，最终游戏还需统一水彩贴图与场景光照。
- 素材查看：已直接查看内置工具输出并读取 PNG 元数据及背景 alpha 样本，确认单个人物、全身、无文字、透明边界。没有执行任何项目测试、构建、浏览器或游戏体验验收。

## 最终生成提示词

```text
Use case: stylized-concept.
Asset type: single-character production reference image for Tripo image-to-3D generation, followed by Blender character refinement and rigging. This is not a sprite sheet and not a scenic illustration.
Primary request: exactly ONE refined full-body young adult East Asian male hiker, natural realistic adult anatomy at approximately seven heads tall, charming but understated and mature, with a clear coherent silhouette. Front-facing neutral A-pose, body facing the camera, arms extended gently down and outward approximately 25 degrees from the torso so both upper arms, forearms, hands and fingers are separately readable; hands relaxed, legs straight and slightly apart, boots fully separated and flat at equal height. No perspective foreshortening. Head straight, relaxed neutral friendly expression, dark short hair and brown eyes.
Wardrobe and identity: soft sage/olive green brimmed hiking cap; ivory lightweight buttoned hiking shirt with visible collar, cloth folds, sleeves rolled to the forearms; muted gray-green straight hiking trousers with understated seams and pockets; worn brown leather hiking boots with visible laces and properly shaped rubber soles; warm ochre-brown hiking backpack worn behind the shoulders, visible complete shoulder straps, small chest strap, coherent waist belt and simple functional buckles. The backpack does not obscure the limbs. No trekking poles or props held in hands.
Style/medium: sophisticated stylized hand-painted 3D character concept with fine watercolor pigment granulation and soft natural tactile shading, precise coherent three-dimensional forms, beautiful cloth/leather stitching and restrained painted surface detail suitable for a PBR model. Fine travel-journal watercolor color language, subtle natural variations, gentle matte surface. Refined game-character quality, not a photograph, not hyperreal skin, not anime, not chibi, not a toy, not blocky low-poly.
Composition/framing: single full-body figure centered, vertical portrait composition, entire hat through soles inside frame with small clean margin. Easy-to-read exposed limb boundaries and complete silhouette. Neutral orthographic front character asset view.
Lighting/mood: broad neutral soft studio illumination, balanced and even, no dramatic cast lighting. Subject has self shading that explains shape but no cast ground shadow.
Background: genuinely transparent alpha background; no floor, no scene, no mountains, no decorative paper panel, no checkerboard painted into the image.
Color palette: sage green cap, warm ivory shirt, muted gray-green trousers, brown boots and warm ochre backpack, subdued natural colors.
Constraints: only one person and one view; clean edges; all limbs complete; coherent symmetrical anatomy; no overlapping legs; no view collage, no turntable panels, no text, no labels, no logos, no watermark, no UI. No dark thick outlines. No detached accessories. Request portrait high resolution.
```


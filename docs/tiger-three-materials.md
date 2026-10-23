> 迁移后，旧 `../generated_images/` 的原始素材副本保留在本工程 `.local/source-images/`；下文原始输出路径为历史来源记录。

# 虎跳峡 Three.js 水彩表面材质 v1

本轮新增材质用于立体山体、步道和坡面几何的表面，不作为山景背景平面。四块材质均为原创生成；不是虎跳峡现场实拍，也不代表精确地质剖面。

- 项目资产：`dist/textures/tiger-mountain-materials-v1.webp`
- 原始输出：`../generated_images/exec-672fe6ff-8228-414c-b640-9e4acb9676e8.png`（保留不改）
- 尺寸：1254 × 1254 px，2 × 2 等格，每格 627 × 627 px。
- WebP：742,076 bytes，RGB，无透明通道。Sharp 仅以质量 90 转码，没有重绘、裁切、调色或拼接。
- 生成方式：内置 `image_gen.imagegen`，未使用 CLI / API fallback，未引入外部照片或第三方素材。

## Atlas 顺序与 UV

图像坐标原点在左上，右为 x 正方向，下为 y 正方向。

| 图像位置 | 用途 | 像素区域（半开区间） | Three.js 常规 UV 范围 |
| --- | --- | --- | --- |
| 左上 | 暖灰风化岩石 | x [0,627)，y [0,627) | u [0,0.5]，v [0.5,1] |
| 右上 | 灰褐尘土碎石步道 | x [627,1254)，y [0,627) | u [0.5,1]，v [0.5,1] |
| 左下 | 克制草绿干草 / 苔地颗粒 | x [0,627)，y [627,1254) | u [0,0.5]，v [0,0.5] |
| 右下 | 青灰远山岩石 | x [627,1254)，y [627,1254) | u [0.5,1]，v [0,0.5] |

以上 UV 假设 `TextureLoader` 默认 `flipY: true`，使用常规底部 v=0 的几何 UV；若自定义 shader 直接按图像左上角采样，应按图像坐标转换。材质是颜色纹理，应使用 sRGB 色彩空间。

四格紧邻，没有额外 gutter。采样时建议把单格边界内缩约 2–3 px，并在单格内部进行重复映射，避免过滤采到邻格。整张 atlas 开启 RepeatWrapping 会重复四格，不能把它当成单一材质直接铺满。每格已经要求尽量平铺，但未执行接缝测试，不能将生成提示等同于无缝验收。

## 已做的素材查看与未验收范围

已用 `view_image` 查看生成结果：四格边界位于中心，没有文字、边框、角色、天空、透视风景或大型树叶；材质颗粒与风化裂隙覆盖各自格子。仅完成素材查看与格式转码，没有运行代码测试、构建、浏览器、GPU、手机或视觉体验验收。最终显示的粗细、重复尺度和远景对比度需随立体场景体验确认。

## 最终生成提示词

```text
Use case: stylized-concept.
Asset type: original production-ready texture atlas for a watercolor mountain walking game, applied as material on actual Three.js 3D rock, trail and hillside geometry.
Primary request: one perfectly square opaque image, a 2 by 2 grid of four equal square seamless surface textures. Every quadrant is an exact flat orthographic overhead material swatch at the same close material scale, filling its full square edge to edge. NO gutters, NO border, NO divider lines. Boundaries exactly at x=50% and y=50%, cleanly separated materials with no blending across quadrants.
Top left quadrant: dry Tiger Leaping Gorge warm gray weathered rock, restrained tawny undertone, fine granular mineral flecks and subtle short irregular stone joints, no big boulders.
Top right quadrant: gray-brown dusty mountain footpath earth, fine grit, sparse tiny natural gravel embedded in compacted dust, calm even texture, no footprints.
Bottom left quadrant: restrained sage and muted meadow green surface texture, tiny dry grass fibers, fine moss grain and a little ochre dust, NO distinct large leaves or plants.
Bottom right quadrant: blue-gray distant cliff rock surface texture, very subtle cool mineral grain and delicate sedimentary stone variations, low contrast.
Style/medium: refined hand-painted watercolor pigments on fine cold-press paper, translucent pigment blooms and delicate granulation; natural understated travel-journal watercolor palette and detail. Material swatches, not a landscape artwork. Flat diffuse albedo appearance, no directional lighting, no shadows, no perspective, no 3D objects.
Constraints: each quadrant should tile as seamlessly as possible within itself, consistent detail throughout, avoid any central focal motif, avoid edge vignette, no sky, no horizon, no scenery, no cliffs drawn as objects, no paths drawn winding through a scene, no trees, no flowers, no icons, no characters, no labels, no text, no logos, no watermark. Fine reusable subtle detail suitable for repetition on 3D meshes. Request square 1536 by 1536 image.
```

提示请求 1536 方图，工具实际交付 1254 方图；保留实际尺寸，未插值放大。

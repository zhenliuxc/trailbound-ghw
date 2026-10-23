# 主地图 Q 版人物素材 v1

用户提供的两份附件内容相同。本资产取其左侧三个 Q 版人物为身份与画风参考。使用内置 `image_gen`，未调用 Tripo、Spine、收费 API 或 CLI。

## 产物

- 原始生成 PNG：`art/characters/chibi-source-v1.png`，1448 × 1086 RGBA。
- 网站 WebP：`dist/characters/trailbound-chibi-v1.webp`，尺寸相同，quality 90、alphaQuality 100。只做整图格式转换，不裁拼、不重绘、不改色、不拉伸。
- 帧数据：`art/characters/chibi-v1.json`。
- 可重复的转码和 alpha 读取：`art/characters/chibi-prepare.mjs`，使用本机已有 sharp，不安装依赖。

PNG 的内置生成原路径为 `/Users/liuxucheng/.codex/generated_images/01a147e5-9cc5-7400-a7c5-989bb48ed56d/exec-d73de7fc-e040-4845-99fe-c5337e0bea1a.png`。

## 使用边界

生成图按 4 列、3 行排布，但各行基线并非严格等距。列宽均为 362；安全行分界为 0、376、724、1086。必须使用 JSON 的 `sourceRect`，不能按整图高度除以 3 硬裁，否则首行鞋底会切到下一行。

第 0 至 3 帧为正面静立、右向静立、举相机、后背观景。第 4 至 11 帧为右向行走，左右方向由同一套图翻转。所有服装与参考保持一致，包括米色软帽、橄榄帽带、红围巾、灰蓝外套、卡其裤、棕鞋和苔绿背包。

`visibleBounds` 使用 alpha > 12 的最大连通角色区域。零星边缘噪点另记于 `alphaBoundsIncludingNoise`。脚锚水平位置参照髋部中轴人工读取，避免背包把包围盒中心拉偏；垂直位置使用角色鞋底下缘。锚点相对于对应 `sourceRect`，不是相对于整图。各帧可见高度 332 至 349 px，接入时可按共同可见高度显示并保留原图宽高比。地图建议初始可见高度约 72 CSS px，最终大小仍需看实际地图。

第二次唯一修正尝试改善格间距，但出现静立和行走体量差异，因此未采用。首张身份与体量更一致。未继续生成变体。

## 实际处理与未验收项

已查看参考和两次生成素材，读取 PNG 尺寸、alpha 与脚底锚点，完成整图 WebP 转换。未运行游戏、浏览器、自动化、构建或集中测试。逐帧的步态连贯程度、地图显示尺寸与脚底稳定性需接入后按用户允许的范围查看；素材生成完成不等于游戏体验验收。

## 首次完整提示词

```text
Use case: identity-preserve.
Asset type: production-ready 2D game character sprite sheet, transparent RGBA, exactly 4 equal columns by 3 equal rows, 12 full-body sprites.
Input image: reference image only. Use the THREE SMALL CHIBI HIKERS AT THE UPPER LEFT of the reference as the exact character identity and painted style reference. Do not use the tall realistic figures.
Primary request: Adapt that same chibi hiker, no redesign, into a clean 12-pose sprite sheet for a quiet watercolor hiking game.
Character invariant: a warm friendly 2.5-head-tall little male hiker with large dark eyes, rounded chibi face, short tousled black hair, beige floppy wide-brim trekking hat with olive band, muted rust-red neck scarf, blue-grey field jacket, khaki trousers, brown leather hiking boots. Moss-olive large backpack, tan straps, silver dark-capped water bottle at side, rolled sleeping mat along bottom. Keep the reference's soft watercolor wash, fine ink-like pencil details, irregular pigment texture and gentle material shading. No poles.
Layout invariant: uniform 4-column × 3-row grid of equal rectangles, wide overall canvas 4:3, generous fully transparent padding between sprites. Each sprite centered in its own cell. Every sprite full body from hat tip through boot sole, same head/body proportions and physical scale; all feet on the same baseline within each row. Hat and backpack must never cross a cell boundary. No panel frames, outlines, cell lines, numbers, captions or text.
Read cells in row-major order left to right:
ROW ONE: cell 0 front-facing standing quietly smiling with hands on backpack straps; cell 1 standing in right-facing three-quarter side view; cell 2 same right-facing three-quarter view, standing still holding a small dark camera to face to photograph scenery; cell 3 standing still in back three-quarter view looking away, backpack visible.
ROWS TWO AND THREE: 8 consecutive frames of ONE continuous relaxed walking cycle. ALL eight frames keep EXACTLY the same right-facing three-quarter side angle as row-one cell 1, same face, hat and clothes, head direction steadily toward screen right. Row two cell 4 left boot forward contact, cell 5 lowering weight, cell 6 passing pose right leg moves forward, cell 7 rising weight. Row three cell 8 opposite right boot forward contact, cell 9 lowering weight, cell 10 passing pose left leg moves forward, cell 11 rising weight. Natural small reciprocal arm motion and soft backpack/scarf settling. Heads never rotate, turn backward or look left. Pose differences must clearly show different leg steps. Keep feet placement and character body size consistent so playback does not jump.
Backdrop: genuinely transparent alpha outside each character. Preserve feathered watercolor edges. No paper background, no beige halo, no ground, grass, plants, stones, footprints, cast shadows, swatches, landscape or picture borders. No photorealism, 3D, vector flatness or thick cartoon outlines.
```

## 未采用的唯一修正提示词

```text
Use case: identity-preserve. Edit target is the provided transparent 4×3 chibi hiking sprite sheet.
Preserve exactly this character's identity, watercolor painting, face, hat, clothes, colors and accessories. Preserve all 12 poses and the 4 columns × 3 rows ordering, transparent background and right-facing walking directions.
Change ONLY the layout spacing so each of the 12 sprites fits cleanly inside a true equal cell grid, with no edge or footwear ever crossing cell boundaries. Current first row has shoes crossing into the second row and lacks padding; repair this throughout the sheet.
Use a 4:3 canvas, 4 equal columns and 3 equal rows, each cell square. Scale every character down uniformly to occupy 78% of cell height. Place the boot contact baseline exactly at 88% cell height, and the head top around 10%. This leaves a generous transparent gap above and below EACH row. Align the character's standing body central axis at each cell's 50% width, with backpack extending left into available padding.
All top-row standing poses and all walking poses must have the same overall physical scale. Every entire hat brim, scarf end, backpack and boot must fit within its own cell with clear transparent margin; no clipping, no adjacent-cell debris. Keep actual alpha transparency outside each character and their watercolor edge.
Do not add labels, cell lines, paper, ground, shadows, terrain or any elements. Do not redesign or change the paintings; only uniform sizing and cell placement.
```


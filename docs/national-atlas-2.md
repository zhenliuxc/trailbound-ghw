# 首页全国地图细化

2026-10-22。用户要求优化主地图，本轮范围为首页全国选线地图。实现、构建与集中浏览器检查已完成，视觉效果待用户确认。未提交、推送或发布。

## 已实现

- 底图加入主要山地区域、盆地、长江与黄河水系、海岸浅色层次和少量地理名称。山纹与色块是 2D 示意，不是海拔或地形测量。
- 地点沿用原有七个经纬度锚点，与轮廓、水系使用同一投影。标题、页边距与地图展示空间重新安排。
- 七条路线复用地景图标库，分别使用草甸、江流、山脊、海湾、山峰、竹林和茶园图标。中文短名、地域信息与图标对应集中到 `src/content/route-atlas.ts`，三条日间路线的地域复用既有内容。
- 标签保留独立按钮和细线定位，手机采用紧凑尺寸与专用排布；桌面和手机的尺寸切换均以地图容器宽度为准。选择、悬停与键盘焦点同步突出对应地点。
- 点击地点仍先展开手绘封面；出发行为、七条路线的地图与小游戏、手帐存储均沿用原实现。返回全国地图恢复原地点的键盘焦点。

## 数据与源码

`assets/maps/china-physical.geojson` 保存筛选后的 18 个自然地理区域与 6 段长江、黄河水系。数据来自 Natural Earth 的 [地理区域](https://github.com/nvkelso/natural-earth-vector/blob/master/geojson/ne_50m_geography_regions_polys.geojson) 和 [河流中心线](https://github.com/nvkelso/natural-earth-vector/blob/master/geojson/ne_50m_rivers_lake_centerlines.geojson)，按其[公共领域条款](https://www.naturalearthdata.com/about/terms-of-use/)使用。来源、下载地址、原文件哈希与处理方式记录在 `assets/maps/sources.json`，站内说明位于 `dist/atlas-credits.html`。

`npm run build:route-map` 使用既有 D3 投影，将轮廓、地理锚点、山地区域、山纹和水系写入 `src/runtime/route-map-geometry.generated.ts`。普通构建消费本地生成文件；访问首页无需在线地图服务，也未增加依赖。

主要实现是 `src/runtime/route-map-picker.ts`、`src/content/route-atlas.ts` 与 `src/templates/home.html`。`dist/style.css` 仍是此仓库的手工维护源码；`dist/index.html`、`dist/runtime.js` 由构建生成。共用 `map-labels.ts` 增加可选的首选偏移，未配置的既有调用保持原排布规则。

## 本轮检查

沿用用户已明确授权的首页集中检查范围，记录见 [browser-checks.json](previews/national-atlas-2/browser-checks.json)。

| 检查 | 结果 |
| --- | --- |
| 必要构建 | `build:route-map` 与 `build` 成功，TypeScript 严格编译通过 |
| 七条路线选点 | 均显示对应封面标题、背景图地址和出发按钮；进度保持 0，未自动行走 |
| 返回地图 | 七条均隐藏封面并恢复对应 `route-*` 按钮焦点 |
| 键盘选择 | Enter 选择莫干山，焦点进入封面标题，返回后恢复地点焦点 |
| 浏览器尺寸 | 320×800、390×844、569×800、1454×909、1454×818 CSS 视口，七个标签均无矩形交叠或横向溢出 |
| 按钮尺寸 | 手机约 90×52、桌面约 132×58 CSS 像素 |
| 控制台 | 当前预览标签未捕获警告或错误 |
| 手帐 | 检查前后均显示 28 个瞬间，没有产生新收藏 |

检查中发现两处排布问题：自由避让可能把香港等标签挤向地图上方；标签 CSS 与地图脚本的宽窄断点不一致。现为手机提供按地理方向安排的首选位置，并用同一 `data-layout` 状态控制按钮尺寸，相关尺寸已复查。

本轮未运行整套自动测试，也未重走七条路线、做实体手机或声音验收。浏览器响应式检查不等同于真机测试。

预览：[当前首页](http://127.0.0.1:8000/)。截图：[主地图](previews/national-atlas-2/preview.png)、[手机](previews/national-atlas-2/mobile.png)、[更窄手机](previews/national-atlas-2/small.png)、[中间尺寸](previews/national-atlas-2/medium.png)、[莫干山封面](previews/national-atlas-2/mogan-cover-mobile.png)。

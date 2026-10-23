# 首页全国地图选线

2026-10-20。用户确认将首页路线卡片改为“全国地图选线路，点击地点查看封面”。实现完成并构建后，用户进一步选择“开始集中检查并打开预览”。本轮只改首页入口、对应封面的呈现与返回地图动作，不改七条旅程的玩法、事件、实拍或手帐规则。未提交、推送或发布。

## 实际行为

- 首次进入展示全国地图，没有默认选点，旅程封面在选线前隐藏。旅行手帐继续可读。
- 七条路线都有独立的原生按钮。点击地点调用原有 `selectRoute`，展开对应手绘封面并将焦点移到标题，不自动行走。封面的原有出发动作继续生效。
- 莫干山与九溪在浙江分组显示，两处地理锚点保留，标签为可读和可点击而错开。其他标签也与地理锚点区分，使用细线说明位置关系；不移动可玩路线坐标。
- “地图选线 ↑”回到全国地图并聚焦当前地点。页内旅程正在行走时先暂停；小游戏、奖励和照片展开时该按钮不可用。
- 四条已有独立旅程仍进入原页面；长坪沟、莫干山和九溪仍在首页开始原有旅程。这三条封面复用已有场景水彩，地图入口不额外生成画作。

## 实现与设计取舍

先按 architect/how 追踪现有选线、出发、清理和存储关系，再比较两份设计与独立评审。两份方案都选择静态 SVG 加原生 HTML 按钮。以单份几何数据的 B 为基础，采用 A 的单一 `entranceVisible` 展示状态、标题焦点与返回焦点约定；未采用两份完整投影或模态地图。源阅读、草图和评审保留于 Git 忽略的 `.local/route-map-design/`；配置中的 Claude/Grok 模型不可用，实际使用当前环境可用的 GPT 模型，没有伪称跨模型家族评审。

运行时入口为 `createRouteMapPicker({ root, routes, selected, onChoose })`，返回 `setSelected` 和 `destroy`。地图管理轮廓、标签排布、原生按钮与观察器；原有应用管理选路、封面、出发与手帐。选中同步不会回调或重置行程。

| 文件 | 作用 |
| --- | --- |
| `src/runtime/route-map-picker.ts` | 地图、七个按钮、宽窄排布、选中状态与清理 |
| `src/runtime/route-map-geometry.generated.ts` | 单份 SVG 轮廓与投影锚点，生成产物 |
| `scripts/generate-route-map.mjs` | 由来源数据生成上述几何；运行 `npm run build:route-map` 更新 |
| `assets/maps/` | 提取的 GeoJSON、约略路线位置及来源记录 |
| `src/app.js` | 复用原换路流程、首次展开、返回与焦点交接 |
| `dist/index.html`、`dist/style.css` | 入口结构、原有封面和响应式样式 |
| `dist/atlas-credits.html` | 面向玩家的底图与工具来源 |

底图使用 [Natural Earth 1:50m 数据](https://github.com/nvkelso/natural-earth-vector/blob/master/geojson/ne_50m_admin_0_countries.geojson)，按其[公共领域条款](https://www.naturalearthdata.com/about/terms-of-use/)提取轮廓和岛屿。来源 URL、原文件 SHA-256 与处理方式在 `assets/maps/sources.json`。全国锚点取现有路线范围的约略中心，保留既有路线参考和 OpenStreetMap 署名。

新增开发依赖 [d3-geo 3.1.1](https://d3js.org/d3-geo)，采用 ISC 许可；构建时用同一投影生成轮廓和地点坐标。普通构建消费已保存的几何文件，浏览器不加载完整 GeoJSON、D3 或在线地图服务。许可副本位于 `dist/vendor/d3-geo-LICENSE.txt`。没有新增运行时地图引擎、API Key 或后台服务。

## 本轮检查

`npm run build` 编译成功。用户批准测试后完成以下实际浏览器操作，读数见 [浏览器记录](previews/home-route-map-1/browser-checks.json)。

| 检查 | 结果 |
| --- | --- |
| 首页初始状态 | 7 个按钮、0 个选中项、旅程区隐藏，手帐 20 条 |
| 七处选点与封面 | 逐个点击七个地点，均显示对应场景图片、标题及出发按钮；进度均为 0，没有自动行走 |
| 返回地图 | 七条封面返回时，焦点均回到对应 `route-*` 按钮 |
| 四条独立旅程出发 | 实际点击出发，分别进入 `wugong-walk.html`、`tiger-walk.html`、`aotai-walk.html`、`maclehose-walk.html`，再通过浏览器返回 |
| 三条页内旅程出发 | 长坪沟、莫干山、九溪均留在首页进入行走；返回地图时暂停 |
| 键盘 | Enter 选择莫干山，焦点移至封面标题；Tab 到出发，Space 开始行走；返回聚焦莫干山按钮 |
| 桌面 | 1363 × 909 CSS 视口；修正地图偏高后，七个地点在首屏可见，没有标签交叠或横向溢出 |
| 窄屏 | 443 × 959 与 318 × 841 CSS 视口，均无标签交叠或横向溢出；最窄布局目标约 101 × 52 CSS 像素；实际点击香港入口并返回 |
| 手帐 | 选线、出发与返回后仍为原来的 20 条，没有新增互动记录 |
| 控制台 | 当前测试标签未捕获到警告或错误 |

另运行 `node --test tests/map-viewport.test.cjs`，5 项通过，检查原有场景坐标、比例与目标尺寸；这不代替全国地图的浏览器操作。`git diff --check` 通过。本轮没有重走七条完整旅程、重复验证全部小游戏、进行实体手机或音频试听，也没有把旧模拟 DOM 结果称为新首页验收。

实际检查发现桌面地图偏高，香港入口落到首屏以下。现宽屏地图高限制为 450–510 CSS 像素，并响应视口高度，窄屏保持单独排布；修复后复查了上述桌面与窄屏范围。

证据：[桌面全国地图](previews/home-route-map-1/02-desktop-atlas.png)、[窄屏地图](previews/home-route-map-1/01-narrow-atlas.png)、[更窄地图](previews/home-route-map-1/03-smallest-atlas.png)、[更窄封面](previews/home-route-map-1/04-smallest-cover.png)。七条封面点击截图保存在同目录 `cover-*.png`，部分为原有路线淡入转场期间的画面。

只读核实开发状态：本地 `master` 为 `10f8c94`，工作区保留既有未提交改动。实际远端 `master` 为 `2099e0d7c6e220fa60cd24f769ef1a80b381d671`，`codex/recover-site` 为 `4bc152762a50c0999eea88d1e42f2e5f204adfec`；未拉取、重置、合并或覆盖本地内容。

本地预览：`http://127.0.0.1:8000/`。界面效果待用户验收。

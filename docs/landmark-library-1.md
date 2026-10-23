# 地点图标库与地图标记

2026-10-21。用户要求更新其余路线的打卡图标，并整理成可直接接入的统一图标库，随后要求分析当前设计是否合理。当前已接入七条现行 2D 旅程，视觉仍为待讨论的第一版。

后续统一改进、当前尺寸和密集地点处理见 [第二版记录](landmark-library-2.md)。下文保留第一版的实现与评估记录。

## 结构与接入

- `src/journey/landmark-symbol.ts`：27 类原创线描地景、中文名称和屏幕尺寸；`LandmarkSymbol` 从图标定义推导，未知名称会在构建时报错。
- `src/journey/landmark-layer.ts`：统一创建、定位、命中、地名排布、可用与已到达状态。路线提供投影坐标和状态，组件不改变行程、照片、收藏或存储。
- `src/journey/landmark-label.ts`：图标锚点固定，只在四周移动名称。空间不足时不强行叠字；此策略仍需继续改善密集图标的表达。
- `src/journey/landmark-markers.css`：共同样式。当前跟随 30 px，桌面全图 26 px，小屏全图 20 px，按钮命中框 44 px。
- `scripts/build-landmark-library.mjs`：随 `npm run build` 生成 `dist/landmark-markers.css`、`dist/icons/landmarks/*.svg` 和 `dist/landmark-library.html`。不直接修改生成文件。

现有路线通常只需在地点数据中指定 `symbol`。新地图可直接接入标记层：

```ts
import { LandmarkLayer } from '../journey/landmark-layer';

const markers = new LandmarkLayer({
  container, signal, className: 'route-marker',
  places: [{ id: 'falls', name: '龙洞瀑布', symbol: 'waterfall', point: waterfallPoint }],
  onSelect: id => openArrivedPhoto(id),
});

// 在地图自身的动画帧内调用；沿用地图的同一坐标投影。
markers.update(projection, view, place => ({
  visible: true,
  enabled: visited.has(place.id),
  visited: visited.has(place.id),
}));
```

页面引入 `landmark-markers.css`。`labelSide` 可指定优先排布方向，`caption` 标记起终点、过夜或折返；支线返回时可通过 `setCaption` 更新说明。返回的占用矩形可供少量背景地名避让。

## 当前地点对应

| 地景 | 图标标识 | 例子 |
| --- | --- | --- |
| 村落、入口、客栈 | `village` / `gate` / `trailhead` / `inn` | 东江村、景区大门、北潭凹、中途客栈 |
| 寺院、营地 | `temple` / `camp` | 喇嘛寺、白起庙、观音宕、大石河 |
| 盘山路、山口、山顶、山脊 | `switchbacks` / `pass` / `summit` / `ridge` | 二十八道拐、吊马桩、金顶 |
| 石海、草甸、红石 | `stone-sea` / `alpine-meadow` / `redrock` | 九重石海、木骡子、红石阵 |
| 森林、枯树滩、盆地 | `forest` / `snag` / `dry-basin` | 原始森林、枯树滩、上下干海子 |
| 瀑布、江流、溪谷、水潭 | `waterfall` / `rapids` / `stream` / `lake` | 龙洞瀑布、中虎跳、九溪溪谷、九溪烟树 |
| 海湾、码头、眺望 | `beach` / `pier` / `viewpoint` | 浪茄、赤径、西湾山 |
| 竹林、石阶、茶园、涉溪石径 | `bamboo` / `steps` / `tea` / `stepping-stones` | 莫干山竹林、古道石阶、龙井茶园、九溪十八涧 |

这些是地景类别，不需要每个地点都造一个独有符号。名称继续承担具体地点身份。手帐的圆形手绘收藏徽章未替换为线描图标。

## 当前检查与设计判断

- `npm run build` 通过。迁移时发现虎跳峡仍以旧标记数组查询附近照片和返回终点，已改为查询路线数据，并通过组件更新终点说明。
- 74 项相关自动检查通过：武功山示意行程、鳌太镜头与行程、虎跳峡行程、麦理浩径与三条日间路线。包括更新后的武功山名称布局检查，确认名称排布不移动地景锚点。它们属于规则检查，不能代替完整浏览器实走。
- 实际浏览器核对七张地图桌面全图，图标均为 26 px，所有主要地名显示，主要名称之间无叠字。手机以实际 CSS 390×844 检查，图标为 20 px、命中框 44 px；地图未出现横向滚动。
- 本轮没有重新完整实走七条路线、逐一点击全部照片或验收声音，也不改变这些流程。未提交、未发布。

用户要求分析设计后，记录以下待讨论问题，不能把当前接入当作视觉定稿：

1. 海湾、江流和山海眺望过度依赖波纹，缩小后区分偏弱；干海子的图形也容易读成盆栽。
2. 内线在小屏全图实际约 0.78 px，寺院、森林等细节不够清晰。需要小尺寸专用简化和线宽，而不是只看总览页的大图标。
3. 鳌太白起庙与盆景园图标在手机全图过近；虎跳峡中峡客栈、龙洞瀑布和张老师小路的文字密度较高。共有名称避让尚未覆盖所有旧背景地名，也未解决固定锚点间的图标重叠。
4. 已到达、未到达、普通路标的视觉区别偏弱。后续应在统一形制内明确照片可查看状态，避免用颜色和尺寸制造杂乱。

建议保留统一圆底线描和数据配置，优先调整水域、山体和盆地图形；对小屏提供简化版本，并按地点重要程度处理密集区域。以上是评估建议，尚未作为下一轮图形重绘实施。

用户随后指出竹林未体现竹子特点。本轮已单独重画 `bamboo`：去掉宽圆叶片，增加竹竿分节与成簇尖叶，图标库和莫干山共用同一源。重新构建通过，并查看地图中的 30 px 随行与 20 px 手机全图显示；仅此图形修正未重复执行整套规则检查，观感仍待用户确认。

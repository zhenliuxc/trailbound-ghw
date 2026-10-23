# 虎跳峡本机重做：地理数据与证据边界

记录日期：2026-10-17。对应新增模块 `dist/tiger-route.js`。本次只读取公开资料和现有源码、保存实现；没有运行测试、浏览器或现实路线验收。

## 已取得的坐标

以下均按 WGS84 `[经度, 纬度]` 保存。OSM 坐标表示公开地图中的对象位置，并不等于实测入口或可通行证明。客栈建筑 way 使用 Overpass 返回的包围盒中心，不伪称门口。

| 地点 | 对象 / 坐标 | 来源快照 | 用途与限制 |
| --- | --- | --- | --- |
| Jane’s 客栈 | [node 2694196127](https://www.openstreetmap.org/node/2694196127)，`[100.0521112,27.1840154]` | 2026-07-15 15:22:01 UTC | 客栈 POI，与历史出发记录点不同 |
| 纳西雅阁 | [way 523168322](https://www.openstreetmap.org/way/523168322)，`[100.0883168,27.1854008]` | 同上 | 建筑中心 |
| 二十八道拐 | [way 460845367](https://www.openstreetmap.org/way/460845367)，命名“28拐” | 仓库既有数据 `retrievedAt:2026-10-14T01:23:33.508244+00:00` | 两端为 `[100.090327,27.186094]`、`[100.102111,27.189478]`；沿程先后由投影计算，完整几何保留在 `geography.js` |
| 茶马客栈 | [way 523179408](https://www.openstreetmap.org/way/523179408)，`[100.1112804,27.2099128]` | 2026-07-15 15:22:01 UTC | 建筑中心 |
| Halfway 中途客栈 | [node 1548360566](https://www.openstreetmap.org/node/1548360566)，`[100.1346063,27.2405505]` | 同上 | 客栈 POI；不等于阳台相机位置 |
| Tina’s 中峡客栈 | [node 12738700042](https://www.openstreetmap.org/node/12738700042)，`[100.1565898,27.2568165]` | 同上 | 客栈 POI，独立于历史轨迹末点 |
| 张老师客栈 | [node 4493654134](https://www.openstreetmap.org/node/4493654134)，`[100.1569705,27.2543535]` | 同上 | 只能确定客栈位置；步道口与联络线仍待核 |
| 中虎跳石 | [node 2969840607](https://www.openstreetmap.org/node/2969840607)，`[100.163818,27.2557114]` | 2026-07-24 11:04:51 UTC | 景物参照，不是玩家岸边站位；位于小桥 [way 293392144](https://www.openstreetmap.org/way/293392144) 末端 |

这批新增 OSM 数据于 2026-10-17 从 `overpass.kumi.systems/api/interpreter` 成功只读获取；服务器报告的数据库快照时间如上，不能写成截至今天的实地状态。公开查询未使用账号、令牌或私有数据。OSM 数据采用 ODbL，界面使用这些地图对象时保留 [© OpenStreetMap contributors](https://www.openstreetmap.org/copyright)。

Wikivoyage 页面内地图数据给纳西雅阁 `[100.088317,27.1854]`、茶马客栈 `[100.111281,27.209913]`，与 OSM 中心坐标吻合；这种共同地图数据不视为第二次现场测量。[对应页面版本](https://en.wikivoyage.org/w/index.php?title=Tiger_Leaping_Gorge_trek&oldid=5388695)

## 历史高路与端点

[FKT 作者说明](https://fastestknowntime.com/route/tiger-leaping-gorge-yunnan-china)明确其记录从桥头 Jane’s 出发，到 Tina’s 折返，并沿同路返回。2026-10-17 实际读取该页的 [eTrex GPX](https://fastestknowntime.com/system/files/routes/gps_data/TLG%20-%20eTrex.GPX)，文件有 **5134 个轨迹点、无 waypoint**。因此现有 `geography.js` 的 `rawPointCount:2517` 不能描述为完整源文件点数。

现有游戏高路是往返文件的去程截取，简化后 771 点，元数据约 21.801 km。以下保存为历史记录端点，不替换成附近客栈 POI：

- `HIGH_START.coord: [100.0519283,27.1859388]`，标签“桥头 Jane’s 一带”。
- `HIGH_END.coord: [100.157685,27.2574499]`，标签“Tina’s 一带”。

`anchors(track)` 以这些已取得坐标投影到调用者提供的实际高路线，输出 `distance`（米）、`fraction`、`trackCoord`、`offTrackMeters` 和来源。距离计算与 `TrailGame.metric` 使用相同的水平距离模型。偏离路线超过 150 米时不提供触发锚点；该阈值是技术防错，不是地理准确度声明。二十八道拐由命名路径两个端点投影得出开始、结束距离。**没有手工填入的路线百分比。**

## 留空的地点与支线

**龙洞瀑布 `coord:null`。** 现场文章可以确认它位于 Halfway 之后、下撤到 Tina’s 之前，但本次 OSM 返回多个瀑布对象：例如 [node 1548360628](https://www.openstreetmap.org/node/1548360628) 名称只有“大瀑布”，另有多个匿名瀑布。没有足够依据把其中任意一个等同龙洞，因此模块只保留沿途顺序。[现场顺序与照片](https://thehiddenchina.com/tiger-leaping-gorge-hiking-guide/)

**支线仍为顺序示意，`geometry:null`、`distanceKm:null`。** 实际查询得到 S230 公路和周边多条 path；其中多数小路无名称，没有现场轨迹足以证明完整“Tina’s—张老师小路—江边”连接。不能自动选最短路再冒充核准支线，也不能把相近道路线段拼成精确线路。

- Tina’s → 联络段 → 张老师客栈／小路 → 江边 → 原路返回，是本版选用的叙事关系。
- [The Fabryk 现场记录](https://thefabryk.com/blog/tiger-leaping-gorge-hike)描述入口经过张老师客栈、折返步道下行，并可沿原折返步道上返。
- [Wikivoyage](https://en.wikivoyage.org/wiki/Tiger_Leaping_Gorge)与 [Asia Hikes](https://www.asia-hikes.com/yunnan-china-tiger-leaping-gorge/)区分张老师小路、天梯，以及向下游核桃园延伸的一线天。
- 查询分别得到 [168级梯 way 293636806](https://www.openstreetmap.org/way/293636806) 和 [天梯 way 1394127342](https://www.openstreetmap.org/way/1394127342)；不能因为都称 ladder 就合为同一必经线。
- **江边 `riverside.coord:null`**，玩家的固定观景站位和一致影像组尚缺。中虎跳石 POI 仅供看景方向参照，不用于人物定位、步道终点吸附或相机站位。[历史江边照片](https://www.jennyfaraway.com/tiger-leaping-gorge-yunnan/)

文章中对设施年代、开放、费用的说法有差异；模块不提供现实通行建议，也不采用这些状态作为游戏已核验事实。

## 模块接口与接入

- 浏览器：`window.TrailTigerRoute`；CommonJS：`require('./tiger-route.js')`。模块无网络、无存储和 DOM 副作用。
- `PLACES`：按 id 索引，含 `label / coord / status / coordinateRole / source / leg`。`coord:null` 必须保留，不补默认值。
- `HIGH_START / HIGH_END`：历史高路首尾，标签使用“一带”。
- `STAGES`：真实地点顺序及支线往返阶段；含 `gameId`，不含预设 `fraction`。Halfway 与龙洞为无奖励观景／过场。
- `LEGS / MODE`：高路使用历史轨迹；支线显示“江边支线 · 路线顺序示意”。
- `anchors(track)`：只返回高路中可由坐标投影的锚点字典；不会把江边投影回高路冒充触发位置。
- `highStops(track)`：高路阶段数组；已定位阶段含 `anchor / fraction / distance`，未定位阶段 `anchor:null` 且没有 `fraction`。龙洞可接在 Halfway 的叙事后，但不在地图上制造一个假坐标。
- 参数 `track` 可为 `[lon,lat,ele?][]`、`{line}` 或路线对象 `{geo:{line}}`。输入缺失／无效返回空锚点；不会回退至固定百分比。
- 显示 `coord` 为真实地图对象，沿路触发使用 `trackCoord` 与 `distance`。二者不应混称同一个实测位置。

本轮实现未测试，等待主任务完成后按项目约定请求集中验证。

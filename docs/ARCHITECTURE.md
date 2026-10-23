# 山径的运行架构与源码边界

山径是静态浏览器应用。首页全国地图选择路线，七个独立旅程页承载 2D 行走，共用手绘页承载小游戏、奖励和旅行手帐。主线使用 PixiJS、TypeScript 与保留的 JavaScript 模块。

本文描述当前工作区结构。文中源码路径均相对仓库根目录，文档链接相对当前文件。

## 源码、素材与产物

```text
src/
  app.js                          首页及保留的旧旅程入口
  content/                        路线目录、事件身份、地理数据、照片与文案
  journey/                        共享几何、镜头、标记、照片、手绘页与会话
    game-registry.ts              共用手绘页的小游戏安装入口
    look-here/                    九溪本地路笺、草稿、取景与私藏流程
  runtime/                        小游戏、声音、奖励、手帐及存储公共能力
    legacy-game-registry.ts       保留的旧首页小游戏安装入口
  characters/                     两位旅人的图集与落脚锚点
  day-walk/                       长坪沟、莫干山、九溪共用的旅程宿主
    landscape/                    共用绘制基础与各路线地形构图
  wugong-walk/scroll/              武功山现行 2D 入口与行程
  tiger-walk/                      虎跳峡独立行程、地形与照片
  aotai-walk/                      鳌太独立行程、地形与照片
  maclehose-walk/                  麦理浩独立行程、地形与照片
  legacy/                         从旧发布目录迁出的 JavaScript 源码
  styles/                         手写站点 CSS
  pages/                          不使用模板生成的 HTML 页面
  templates/                      首页、日间旅程与共享界面 HTML 模板
public/                           站点素材、静态数据、第三方分发文件与许可
art/                              制作原图、素材记录与制作脚本
assets/                           地图等构建源数据
scripts/                          构建、素材制作与独立检查工具
.build/typescript/                TypeScript 编译中间产物，Git 忽略
.build/architecture-site/         可选独立站点构建目录，Git 忽略
dist/                             站点构建输出，继续保留版本管理
```

`dist/` 仅承载生成站点，保留版本管理。构建覆盖自己负责的输出，不清空整个目录。新增与修改发生在源码目录，随后由构建生成站点文件。

| 输入 | 输出方式 | 站点路径示例 |
| --- | --- | --- |
| `src/legacy/` | 原路径复制；`route-moments.js` 单独合成 | `dist/journey.js` |
| `src/styles/` | 原路径复制 | `dist/journey-map.css` |
| `src/pages/` | 原路径复制 | `dist/wugong-walk.html` |
| `public/` | 保留站点相对路径复制 | `dist/scenes/`、`dist/audio/`、`dist/photos/` |
| `src/templates/` 与内容目录 | 模板生成 | `dist/index.html`、三个日间地图页、七个手绘页 |
| TypeScript 与浏览器入口 | 编译及打包 | `dist/runtime.js`、`dist/day-walk.js`、各路线脚本 |
| 地景图标源码 | 生成图标、标记样式与总览 | `dist/icons/landmarks/` |

素材制作脚本把加工后的图片、音频与许可清单写入 `public/`。原始图稿和制作记录仍在 `art/` 或本地素材缓存。生成的 TypeScript 坐标数据仍写入原有 `src/` 模块；`art-play-atlas.js` 写入 `src/legacy/`。日常站点构建复制既有素材，不运行素材制作。

## 路线内容的唯一入口

`src/content/catalog.ts` 的 `CHAPTERS` 汇总七条路线的身份、名称、封面、地图页面、手绘页面和以下接入信息：

| 字段 | 使用方 |
| --- | --- |
| `atlas` | 全国地图的中文短名、地域与地景图标 |
| `events` | 地点事件入口与手绘页允许的事件身份 |
| `mapEntry` | 构建时选择路线入口，三个日间章节共用一份入口 |
| `artPresentation` | 手绘页标题、页面类名与样式依赖 |

`chapterFor()` 提供章节查询，`ROUTE_SUMMARIES` 从同一目录派生。路线的详细行程、照片与玩法参数仍归各自内容或规则模块，不复制进首页。

武功山、虎跳峡、鳌太、麦理浩的静态地点、道路控制点和世界范围分别位于 `content/wugong-map.ts`、`tiger-map.ts`、`aotai-map.ts`、`maclehose-map.ts`。路线状态机与绘制器读取同一份数据。`journey/geometry.ts` 提供 `Point`、`clamp`、`mix`、`smooth`、`distance` 与 `curve`，公共代码直接从这里读取基础几何能力。

全国地图由 `runtime/route-map-picker.ts` 管理。`scripts/generate-route-map.mjs` 从 `assets/maps/` 生成 `route-map-geometry.generated.ts`，保留本地轮廓、水系、地形与路线锚点。该素材准备步骤独立于日常站点构建。

## 旅程、绘制与生命周期

武功山、虎跳峡、鳌太和麦理浩保留各自旅程状态机。长坪沟、莫干山、九溪复用 `day-walk/` 宿主、`journey/day-route.ts` 与 `templates/day-walk.html`，各路线仍有自己的地形、行程、天气和玩法。

共享能力位于 `journey/` 和 `runtime/`：镜头与人物缩放、坐标投影、尺寸观察、照片弹窗、手绘转场、输入、资源加载、暂停退出、奖励和保存。地图绘制、标记命中与人物落脚使用同一投影；场景坐标、容器像素与设备像素比分开处理。

七条路线复用 `landmark-symbol.ts`、`landmark-layer.ts`、`landmark-label.ts` 和 `landmark-name-layer.ts`。图标固定于对应地景，名称在附近避让。日间地形的绘制基础、地面与溪流动态位于 `day-walk/landscape/`；路线绘制器通过 `LandscapeEffects` 接收旅程时钟、天气与减少动态效果设置，不另建游戏时钟。

`FrameLoop` 与场景生命周期管理暂停、后台和退出。照片、手帐、奖励与手绘弹窗暂停对应旅程；过期 session 的回调不能推进新场景。退出释放监听、动画、渲染资源与声音。

## 小游戏注册与完成流程

小游戏按宿主保留两个接入入口，避免首页加载只在手绘页使用的模块：

- `journey/game-registry.ts` 的 `installRouteGames()` 供共用手绘页使用，集中安装适配器、允许入口、奖励类型、标题、声音状态映射和额外资源清理。
- `runtime/legacy-game-registry.ts` 的 `installLegacyHomeGames()` 供保留的旧首页旅程使用，沿用原莫干山、虎跳峡与高路适配器及江边下行行为。

注册仍通过 `MiniGameController.registerGame()` 完成，后注册覆盖前注册。麦理浩先安装通用海岸适配器，再覆盖 `coast-sand` 和 `coast-shell`；长坪沟先安装日间适配器，再覆盖专用彩林玩法。虎跳峡保留 `TRAIL_GAMES` 的额外入口。旧首页保留莫干山、虎跳峡、高路的安装顺序。

页面先销毁小游戏控制器，再调用注册结果的 `destroy()`。活动场景由 `MiniApi.dispose` 释放，工厂额外持有的资源由注册结果清理。注册表没有接管行程状态机、胜利判定或存档。

`MiniApi` 继续提供 `create`、输入动作、`tick`、绘制、提示和 `outcome`，以及可选素材与生命周期接口。公共控制器处理鼠标、触屏、键盘、重试、异步结果失效与音效事件去重；具体玩法仍在现有规则和适配器中。

完成流程保持原契约：规则产生真实完成结果，手绘页校验允许入口、事件 ID、`edition`、`earned` 和当前 session，然后调用手帐保存及奖励展示。`RewardController` 只呈现奖励，不判定胜利或自行创建记录。跨页通信继续使用 `trailbound.art.v1`。

## 手帐与九溪本地照片

`runtime/journal-store.ts` 是统一存储出口。收藏按原规则读取最新记录、合并与去重，保存失败返回失败结果。既有 `trailbound.field-journal.v1`、事件 ID、记录格式、首次日期、文字与画作保持不变；不自动清空或覆盖用户收藏。

九溪已有的「你看这里」继续保留。`content/look-here.ts` 定义地点与取景内容，`journey/look-here/` 分别管理探索时长、草稿规则、应用会话、视图、本地装配，以及 dialog、history、焦点和滚动。取景由 `DayScene.capture()` 从地图世界坐标提取。

`runtime/private-photo.ts` 定义稳定照片契约，`private-photo-store.ts` 提供 IndexedDB 适配器，能力由 `journal-store.ts` 导出。数据库仍为 `trailbound-private-photos-v1`、版本 1、`photos` 表；偏好键仍为 `trailbound-glimpse-local-v1`。旧照片按原图片、日期和署名快照读取，不按当前内容重绘。

本地照片与小游戏 `Moment` 分开存储，在同一手帐墙展示。功能、数据及 UI 边界见 [你看这里](look-here.md)。当前没有跨用户公开、账号、媒体上传或后端服务。

## 构建关系

`scripts/build-runtime.mjs` 是站点构建入口。TypeScript 以 `strict` 和 `noEmitOnError` 编译到 `.build/typescript/`，随后 esbuild 打包浏览器脚本。

`scripts/build-content.mjs` 集中加载 `catalog.ts`、日间路线和长坪沟内容，首页、手绘页、日间页与入口计划使用同一份构建内容。地图脚本从 `CHAPTERS.mapEntry` 派生并去重，不另维护七条路线的入口名单。

`scripts/build-static.mjs` 将 `public/`、`src/legacy/`、`src/styles/`、`src/pages/` 复制到输出根目录。每个输出路径只有一个所有者；复制源之间、复制源与生成文件之间发生同名冲突时，构建报错。`src/legacy/route-moments.js` 的长坪沟占位段由 `build-day-pages.mjs` 根据内容合成，静态复制步骤跳过该文件。

构建不以旧 `dist/` 为输入，可以指定独立输出目录；默认输出仍是 `dist/`。`build-manifest.json` 记录本次输出文件，成功构建后仅移除上次清单中已不再生成的文件，未知文件保持原样。开发监听覆盖 `src/` 中的 JS、TS、HTML、CSS，`public/` 的全部文件，以及 TypeScript 配置和站点构建脚本。命令与目录使用方法见 [本机开发说明](LOCAL_DEVELOPMENT.md)。

## 当前设计资料

- [路线、季节与玩法](ROUTES.md)、[游戏理念与美学](game-design-charter.md)、[小游戏机制指南](gameplay-mechanism-guide.md)。
- [地点图标](landmark-icon-design-guide.md)、[手帐徽章](journal-badge-design-guide.md)。
- [声音](MUSIC.md)、[照片来源](PHOTO_CREDITS.md)、[素材追溯](PROVENANCE.md)、[渲染与依赖](RENDERING_AND_LIBRARIES.md)。

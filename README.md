# 山径 Trailbound

山径是一款浏览器徒步与旅行手帐体验。首页通过全国地图选择武功山、虎跳峡、鳌太线、麦理浩径第二段、长坪沟、莫干山或九溪龙井，进入对应旅程。

行进使用程序绘制的 2D 示意地图与 Q 版旅人，默认跟随，可主动切换全图。地点打卡展示实拍，途中小游戏使用手绘水彩；完成后展示圆形徽章，自动收进旅行手帐。声音由用户主动开启，收藏保存在当前浏览器。

## 本地运行

```sh
npm ci
./trailbound-local.command dev
```

打开 [本机站点](http://127.0.0.1:8000/)。源码与站点素材变化后自动构建，浏览器需手动刷新。

```sh
npm run build                               # 默认输出到 dist/
npm run build -- --outdir=.build/site       # 独立构建
```

更多命令见 [本地开发说明](docs/LOCAL_DEVELOPMENT.md)。

## 工程结构

| 目录 | 职责 |
| --- | --- |
| `src/content/` | 路线、地点、事件与页面入口 |
| `src/journey/` | 镜头、投影、会话、小游戏注册与旅程公共界面 |
| `src/runtime/` | 小游戏、声音、奖励、手帐和保存 |
| `src/legacy/` | 当前仍被调用的 JavaScript 规则、数据与绘制模块 |
| `src/styles/`、`src/pages/`、`src/templates/` | 样式、独立页面和共享模板 |
| `public/` | 随站点分发的素材、数据与许可 |
| `art/`、`assets/` | 制作原图、素材来源、地图源数据 |
| `scripts/`、`tests/` | 构建、素材制作与验证 |
| `dist/` | 构建输出，保留版本管理 |

路线统一由 `CHAPTERS` 注册，小游戏使用共用控制器和注册入口。修改源码后构建，不直接编辑 `dist/`。构建按清单清理失效产物，不删除未知文件。

九溪「你看这里」支持本地取景、纸笺草稿和私藏照片。账号、真实照片上传、公开路笺与后端服务尚未接入。

## 当前规范

- [项目协作约定](AGENTS.md)、[架构与源码边界](docs/ARCHITECTURE.md)。
- [七条路线与玩法](docs/ROUTES.md)、[你看这里](docs/look-here.md)。
- [游戏理念与美学](docs/game-design-charter.md)、[小游戏机制指南](docs/gameplay-mechanism-guide.md)。
- [地点图标规范](docs/landmark-icon-design-guide.md)、[手帐徽章规范](docs/journal-badge-design-guide.md)。
- [声音](docs/MUSIC.md)、[照片来源](docs/PHOTO_CREDITS.md)、[素材追溯](docs/PROVENANCE.md)、[渲染与依赖](docs/RENDERING_AND_LIBRARIES.md)。

规范随当前实现维护；变更历史由 Git 保存。临时检查和素材审阅输出放在忽略的 `.local/`，不加入规范文档。

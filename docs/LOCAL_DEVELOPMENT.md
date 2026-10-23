# 本地开发

下列命令均从仓库根目录执行。源码职责见 [架构与源码边界](ARCHITECTURE.md)。

## 启动与构建

要求 Node.js 18+、npm，以及本地静态服务使用的 Python 3。使用锁文件安装依赖：

```sh
npm ci
./trailbound-local.command dev
```

开发助手启动构建监听和本地服务，默认地址为 [http://127.0.0.1:8000/](http://127.0.0.1:8000/)。源码或素材变化后重新构建，浏览器需手动刷新；Ctrl-C 结束本次会话。同一工程已有服务时会复用，退出监听不关闭先前服务。

```sh
./trailbound-local.command install   # 使用锁文件和本地 npm 缓存安装
./trailbound-local.command build     # 构建 dist/
./trailbound-local.command watch     # 只监听构建
./trailbound-local.command serve     # 只提供 dist/ 本地服务
PORT=8001 ./trailbound-local.command dev
```

助手优先使用当前 shell 的 Node，也支持本机 nvm 环境。服务只绑定 `127.0.0.1`，不对外发布。

## 修改对应源码

| 内容 | 编辑位置 |
| --- | --- |
| 路线身份、封面、入口、地图短名与事件列表 | `src/content/catalog.ts` 及对应路线内容模块 |
| 手绘页小游戏接入 | `src/journey/game-registry.ts` |
| 首页保留模块的小游戏接入 | `src/runtime/legacy-game-registry.ts` |
| JavaScript 规则与场景 | `src/legacy/` |
| 站点样式 | `src/styles/` |
| 非模板页面 | `src/pages/` |
| 首页、日间旅程与共享界面 | `src/templates/` |
| 站点素材、静态数据及许可 | `public/` |

`public/scenes/example.webp` 输出为站点的 `scenes/example.webp`，引用不加 `public/`。`dist/` 是生成结果，继续参与版本管理，不能直接编辑。构建成功后只删除上次构建清单中失效的输出，未知文件不动。

不同输入不能争用同一个输出路径。遇到 `Duplicate site output`，应确定正确来源，移除重复所有者。监听器覆盖 `src/` 中的 JS、TS、HTML、CSS、`public/`、TypeScript 配置和站点构建脚本。

## 独立输出与存储隔离

```sh
npm run build -- --outdir=.build/site
python3 -m http.server 8001 --bind 127.0.0.1 --directory .build/site
```

独立输出只允许位于 `.build/` 下，不能覆盖 `.build/typescript/` 编译中间目录。构建不读取旧 `dist/` 作为输入。

不同端口对应不同浏览器存储来源，适合隔离验证。手帐使用 `trailbound.field-journal.v1`；本地照片使用 IndexedDB `trailbound-private-photos-v1`。不要清理真实用户存档来准备测试，旧格式读取与去重规则属于兼容契约。

## 验证

按 [协作约定](../AGENTS.md) 取得测试授权后，集中运行本轮受影响检查：

```sh
npm run typecheck
npm run check
npm test
```

可用 `node --test tests/文件名.test.cjs` 选择相关测试。`tests/` 包含规则、地图、注册、会话、存储及 DOM 模拟检查；模拟通过不能代替真实浏览器和听感验收。电脑和手机检查覆盖主要流程与基本布局，不反复穷举相邻尺寸。

构建、自动检查、浏览器体验、音频试听与发布分别汇报，不以构建成功替代其他结果。临时日志、截图和制作审阅输出保存在 `.local/`，不追加到 `docs/`。

## 素材制作

`art/` 保存原图与生成来源，`assets/` 保存地图源数据，素材脚本将可分发结果写入 `public/`。生成来源见 `art/provenance/` 与各素材目录，署名和许可清单随站点分发。细则见 [素材追溯](PROVENANCE.md)。

日常构建只复制既有素材，不调用图像生成、照片下载或音频制作。修改原图后先运行对应制作脚本，再构建站点。全国地图源数据更新使用 `npm run build:route-map`。

站点发布使用既有配置与访问范围，需单独授权；凭据保留在本地忽略配置中，不写入源码或文档。

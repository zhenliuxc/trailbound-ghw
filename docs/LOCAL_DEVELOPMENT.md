# 本机开发 · ~/code/trailbound

当前工程：`/Users/liuxucheng/code/trailbound`，位于用户自己的 Mac。

从终端启动完整开发环境：

```sh
cd ~/code/trailbound
./trailbound-local.command dev
```

本地地址为 `http://127.0.0.1:8000/`，仅绑定本机。源码变化后会重新构建，浏览器需手动刷新。若迁移恢复的同工程服务仍在运行，`dev` 会复用它并启动源码监听，避免重复占用端口；此时 Ctrl-C 只停止本次监听。正常新开的完整开发会话 Ctrl-C 会停止该会话。

其他入口：

```sh
./trailbound-local.command build    # 只构建
./trailbound-local.command watch    # 只监听源码并构建
./trailbound-local.command serve    # 只提供 dist/ 本地服务
./trailbound-local.command install  # 有必要时按锁文件重装依赖
./trailbound-local.command blender --version
```

迁移保留了 `node_modules`，无需为了迁移重新安装。离线 npm 缓存现在位于 `.local/npm-cache/`。启动脚本会使用现有 shell 的 Node，或本机已安装的 nvm Node 24.19.0。它从自身位置定位项目，不再依赖旧 Codex 任务目录。

## Tripo

私有配置现在位于：

`/Users/liuxucheng/code/trailbound/.local/tripo.env`

在本机文件中填写 `TRIPO_API_KEY=`，不要将密钥发送到聊天、Git 或网页。原有配置逐字节保留，迁移过程没有展示其内容；`.local/` 已被 Git 忽略。Tripo 工具仍从自身脚本定位仓库根，因此自动使用新配置路径。此轮迁移没有调用 Tripo、提交生成任务或消耗 credits。

## Blender 与素材

Blender 4.5.14 LTS 的本机副本位于 `.local/tools/blender/Blender.app`，通过 `./trailbound-local.command blender` 启动。原始安装记录保留在 `.local/tools/blender/INSTALLATION-ORIGINAL.md`。

制作场景时，从本工程根目录调用：

```sh
./trailbound-local.command blender \
  --background --python scripts/art/build-mountain-slice.py -- \
  --character .local/tripo/assets/实际人物.glb \
  --rock .local/tripo/assets/实际岩壁.glb
```

示例模型名须替换为真实输入；迁移没有生成或精修新模型。原任务目录的 `generated_images/` 已完整保留到本工程 `.local/source-images/`，供查阅历史文档中的原始素材引用。

## 旧目录和历史记录

原工程目录保留为带时间的备份，实际位置见 [迁移记录](migration-to-code.md)，未删除。旧任务目录的启动助手转发到这里，不会再启动备份工程。

历史构建日志、旧提交和进程记录保留当时的原路径。当前开发和配置路径以本文为准。迁移只核对文件、Git 与本地服务；没有运行集中游戏测试、重新生成模型、推送或发布。

## 武功山 2D 主入口

首页选择武功山，点击“从东江村出发”或“走进山路”，进入 <http://127.0.0.1:8000/wugong-walk.html?walk=1&scene=geography-events-5>。当前包含完整两天一夜：东江村、绝望坡、草甸、观音宕过夜，第二天经吊马桩、金顶，沿景区山路步行下到大门。背景为 PixiJS 程序化 2D 示意图，人物沿用指定的大眼睛 Q 版，默认跟随，右上角可主动切全图。

当前地图按北坡山群重排，景区下山经福星谷、中庵回到前景山脚。圆形图标是实景打卡，纸签图标是独立的小游戏邂逅；照片卡片只返回山路，完成游戏并收好才保存手绘。实现与检查记录见 `docs/wugong-geography-events-5.md`。

打卡点实际抵达后打开真实照片与介绍；草甸、营地、吊马桩和金顶可进入四个现有手绘小游戏，完成后收进同一本旅行手帐。照片注明区域实景与定点照片的区别。地图行走为本页会话，手帐继续自动保存。实现与验收边界见 [两天一夜 2D 行程](wugong-two-day-schematic.md)。最初样段记录见 [2D 示意地图与地点事件](wugong-schematic-map.md)。归档 2D 源码和实验素材仍保留，不从旧入口覆盖新行程。

## 武功山 3D 实验预览

2026-10-18 的项目主线已确认为 2D 行走、地点手绘事件与旅途手帐收集，见 [游戏理念与设计美学约定](game-design-charter.md)。`http://127.0.0.1:8000/wugong-3d.html` 和原草甸预览 URL 仅保留为归档实验，不进入主流程，也不代表当前产品方向。完整技术记录见 [全程 3D 地图](wugong-3d-full-map.md)。

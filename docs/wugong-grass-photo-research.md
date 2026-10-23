# 武功山草甸方案与照片选片

2026-10-17。用户反馈草像毛刺，要求查找现成的草甸生成和动画方案，并结合小红书、微博及网上实景重新核对景点和照片。本轮完成选型调查、照片盘点、候选图库和逐图用途备注，未修改游戏渲染器或替换景点照片，未发布。

以上为调研阶段状态。随后用户授权先制作草甸试片，实际接入和检查范围见 [武功山草甸风路试片](wugong-meadow-trial.md)。照片候选仍未替换进游戏。

## 为什么暂停继续加草

前两轮的共同假设是“增加细草叶和草丛数量，便能让坡面成为草甸”。这不能解决轮廓过尖、色面不连续和缺少成片体积的问题。最新实现仍待用户认可，不能把已经做过的布局检查写成草的观感通过。

源码盘点如下：

| 绘制位置 | 草形来源 | 当前问题 |
| --- | --- | --- |
| 大范围坡面 | `createGroundMarks` 的 `tussock`，进入背景缓存 | 稀疏小簇容易露出重复的尖轮廓 |
| 路肩静态草 | `trailsideDetails` 的 `tussock`，进入相同缓存 | 与大坡面复用同一种草形 |
| 近路风动草 | `paintGrass` 调用 `drawMeadowTuft` | 动画仍是这组尖草叶的弯曲 |

三个位置共用八种草形，每簇九片草叶。应改变草甸的分层和表现方式，再处理密度。近处少量叶片需要宽度、弧度和相互遮挡；中景需要连续的草丛起伏；远处应该成为顺着山坡的柔和色面。

照片的可重跑盘点为 `node scripts/art/audit-wugong-visit-photos.mjs`，基线保存在 `art/wugong-research/current-photos.json`。六站只用了三张照片：山脊图用于绝望坡、金顶和大门，草甸图用于草甸和吊马桩，冬季云海用于营地。六站原有文字均说明不是对应定点照片。这些说明应继续保留到真正匹配到地点为止。

## 现成库与组件

工程已经安装 Three.js 0.186.1 和 PixiJS 8.22.0，当前武功山独立行走页使用 Canvas 2D。

| 方案 | 已核对的能力 | 对当前项目的判断 |
| --- | --- | --- |
| [Three.js InstancedMesh](https://threejs.org/docs/pages/InstancedMesh.html) + [MeshSurfaceSampler](https://threejs.org/docs/pages/MeshSurfaceSampler.html) | 批量渲染共享几何体，按表面及权重分布实例 | 适合带体积的近景草场。风动仍需材质或着色器，不能只更换一个类名 |
| [three-stylized](https://github.com/Steve245270533/three-stylized) | README 提供草场、共享风、颜色和外部地形表面接口，仓库标为 MIT | 是可复用组件候选，不称为成熟的大型引擎；尚未验证与当前 Three.js 版本的兼容性 |
| [PixiJS Mesh](https://pixijs.com/8.x/guides/components/scene-objects/mesh) / MeshPlane | 官方支持顶点、材质和细分网格形变 | 更适合保留当前斜俯视构图、用草甸色块与草丛层表现风。仍需地形投影和遮挡接入 |

建议下一步先做一小块沿坡的 Three.js 草场试片，与现有山色和人物比例放在一起比较。用表面权重避开道路、岩壁和营地，近处显示少量弯曲叶片，中远处合成连续色面。现有 Canvas 场景不能直接加一段 3D 草而忽略投影、地形深度和人物遮挡，试片通过后再接入当前地图。

可查看 [Al-Ro 的风动草场示例](https://al-ro.github.io/projects/grass/) 了解成片草场的方式。该原作者说明使用实例化和草根旋转，纹理另有来源。本次浏览器未能打开示例，不将其运行效果或性能视为已验证。

另查看了 [James Smyth 的 MIT 草场示例](https://github.com/James-Smyth/three-grass-demo)。其 `package.json` 使用 Three.js `^0.120.1`，源码仍调用 `computeFaceNormals()`。它是效果与算法参考，不作为当前版本可直接复制运行的脚手架。本轮未下载运行任何第三方安装脚本，未新增引擎依赖。

## 地点与照片方向

保留用户已确定的东江村反穿、观音宕过夜、第二天到金顶再下景区大门。公开资料常把东江村不同支线与龙山村长线合写，因此不依据单篇游记增加发云界或改动现有节点顺序。[新浪转载的 Feekr 游记](https://fashion.sina.com.cn/l/ds/2023-06-26/0959/doc-imyxzvhp4310776.shtml)列出这几个核心节点，但其中过夜安排与用户确定的两天一夜不同，不整体照搬其日程。

| 地点 | 选片方向 | 已找到的线索与缺口 |
| --- | --- | --- |
| 东江村 | 村口和林间登山入口 | 起点照片仍缺少可确认位置且有明确许可的版本 |
| 绝望坡 | 真实陡坡小路、山肩与前后高差 | 候选 15 的爬升关系清楚，但原始说明未写坡名；不能直接标为绝望坡 |
| 草甸弯道 | 路贴坡面，草叶由近到远变成连续草色 | 候选 16 可作弯道画面；28 为草甸质感首选参考；都属于区域实景 |
| 观音宕 | 帐篷营地全貌，夜色作补图 | [景区官网图片线索](https://www.wugongshan.cn/page/strategyList%21info.htm?id=251)及[新浪原作者游记](https://zhongce.sina.com.cn/interface/article/view/57150/)有营地与栈道参考，未获得图片再分发授权 |
| 吊马桩 | 可辨认的山口、岔路和石笋地貌 | [景区检索条目](https://wugongshan.cn/w/jqtj/jqtjInfo.htm?id=36)将吊马桩解释为石笋地貌；[摄影作者远游的相册](https://dp.pconline.com.cn/photo/list_3592818.html)按地点命名，但版权归原作者，未获使用授权 |
| 金顶 | 金顶标志或古祭坛，另配回望山势 | [候选 04](https://commons.wikimedia.org/wiki/File:Golden_Dome_of_Wugong_Mountain.jpg)由 RoundNoName 标注金顶并以 CC BY 4.0 发布，画面是附近远眺，不是石碑特写。另有[古祭坛照片分类](https://commons.wikimedia.org/wiki/Category:Sacrificial_Relics_in_Mount_Wugong)可继续按单张核对 |
| 景区大门 | 武功山牌坊及山脚空间 | [旅客原帖](https://bbs.xiaopeng.com/article/3742216?tidType=1)有清楚的山门实景线索，未确认可用于游戏的再分发许可 |

“参考地点、构图合适、许可可用”是三个不同结论。目前没有找到每一站都同时满足三项的照片，因此未将候选整批替换进游戏。

## 本地候选页

预览为 `http://127.0.0.1:8000/research/wugong-photos/index.html`。已逐张查看十一张照片，添加用途备注、作者、日期、源页面和许可。候选 28、10、11 用于草甸表现参考；候选 15、16 用于爬升和转弯构图；候选 04 用于金顶周边远眺。候选 30 色彩及反差较强，不作为当前照片首选。

Commons 分类的 38 项原始清单保存在 `art/wugong-research/commons-candidates.json`。使用 `python3 scripts/art/prepare-wugong-photo-board.py` 可从保存的清单重建候选页，并复用已下载的十一张授权缩略图。候选页自身附带 `licenses.json`；不修改原图，不删除水印，不把社交平台图片混入授权图库。

## 访问边界和状态

- 小红书首页可打开，但随后出现登录弹窗，搜索框提示登录；未读取相关笔记正文。
- 微博搜索跳转到登录页，未读取相关微博正文。搜索引擎的摘要没有替代正文核对。
- 景区官网搜索可找到条目和图片线索，本次直接访问出现超时或 TLS 连接错误；没有绕过安全提示，也不将未读页面写成已读。
- 候选页已在真实浏览器打开。照片与许可来自 Commons；本轮未执行游戏行走、音频或性能验收，未替换游戏照片或接入草甸库。

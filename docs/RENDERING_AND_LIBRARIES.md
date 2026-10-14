# 画面层与第三方库

## 选择

现有项目的旅程、照片、故事与界面已经独立，因此采用PixiJS升级画面层，避免把整个项目迁移到另一套游戏框架。固定版本：8.22.0；npm官方包：https://www.npmjs.com/package/pixi.js 。版权与MIT许可见 `dist/vendor/PIXI-LICENSE.txt`。

| 工具 | 适用范围 | 本项目状态 |
| --- | --- | --- |
| PixiJS | GPU场景图、矢量/精灵、滤镜和渲染 | 已用于新版环境画面 |
| Phaser | 场景管理、动画、摄像机、输入、物理等完整游戏框架 | 已评估，未引入 |
| PixiJS内置BlurFilter/ColorMatrixFilter | 局部云雾柔化、高清明暗与色彩变化 | 已引入；整场景滤镜继承画布高清分辨率 |

没有一个库单独保证画面“最高”。精绘素材、角色动画、分层构图、光照和性能预算共同决定结果。当前版本的场景是ChatGPT/Codex编写的程序化插画，不是摄影地图或高程测量。

## 已实现

- 分层地面、山体明暗、草叶/碎石、植被冠层和云层。
- 峡谷江流与动态水光，秦岭冷色碎石和积雪，草甸区域暖绿配色。
- 云层慢速视差、桌面柔化和后段暖色变化。
- 固定相机变换与SVG路线叠加层对齐；核心路线和打卡坐标未修改。
- 渲染使用已有漫游时钟，不启动另一套后台行走循环。
- 本地分发固定版本库、保留许可、整场景继承高清分辨率、局部雾带降低滤镜分辨率、限制可见滤镜区域。
- GPU失败时显示同一场景数据的SVG表现，玩法继续可用。

尚未进行实际浏览器GPU截图、手机帧率和能耗测量。没有导入Spine骨骼动画、GSAP、自定义水波shader或第三方pixi-filters；不要把这些能力写成已经完成。

## 官方资料

- Application（异步初始化、WebGL/WebGPU、分辨率）：https://pixijs.com/8.x/guides/components/application
- Graphics（图形、曲线、GraphicsPath与性能）：https://pixijs.com/8.x/guides/components/scene-objects/graphics
- Filters（模糊、颜色、位移和自定义shader）：https://pixijs.com/8.x/guides/components/filters
- Phaser渲染指南：https://phaser.io/tutorials/phaser-4-shader-guide

核对日期：2026-10-14。

## v0.7 接入复查

PixiJS v8的Application异步init、固定分发包、一次创建场景图、外部统一动画时钟、手动render与SVG叠加相机方式均与当前架构兼容。具体质量问题来自前版ColorMatrixFilter的1倍中间分辨率，现按官方FilterOptions改为继承渲染目标分辨率和抗锯齿。画布按实际DPR、尺寸和像素预算设置；后续draw检测DPR变化。

只有云和雾图层承担模糊。已移除出发页面的整屏backdrop blur。路线与小人保留SVG保证矢量清晰度，小人由motion.js关节数据驱动，没有伪称使用PixiJS骨骼系统。

官方FilterOptions：https://pixijs.download/v8.22.0/docs/filters.FilterOptions.html

本次仍无真实浏览器GPU测试；适配器质量回归使用模拟Application和实际PixiJS图形数据，应据此理解验证范围。

## v0.7.1 滤镜裁剪修正

通过安装的 PixiJS 8.22.0 FilterSystem 源码确认：filterArea 会乘上容器的 worldTransform。上一版将屏幕矩形直接设在缩放/移动的 world 上，造成地图底图被截断，SVG 路线继续延伸。现将屏幕边界反投影到 world 的本地坐标，每帧随镜头更新，保留两像素边缘。高清滤镜配置、原路线和照片均保持不变。新增回归测试调用该库实际的边界变换逻辑。

## v0.9 动画分工

PixiJS仍负责背景地貌、云雾和水光。原生SVG叠加层新增代码绘制的草叶、蝶翼、飞鸟、落叶、浮雪、脚印与人物相机/围巾。`life.js`控制景物，`motion.js`控制步态和情境动作，均使用已有旅程时间；暂停和后台不启动额外常驻时钟。装饰性CSS卡片与纪念过渡独立播放不足1.1秒，不推进逻辑状态且不拦截指针。减少动态效果时停用这些过渡并冻结环境动画。

没有新动画库或图片素材依赖；第三方许可保持原有PixiJS和照片说明。

## v0.10 地理要素与坡面

新增terrain.js的路线采样、折线最近点、背景裁剪与坡面带，SVG和PixiJS仍使用同一套场景描述。水系独立于坡面覆盖层，水光演员来自实际河段，避免固定坐标漂移。OSM水系与峰点以相同投影转换，新增的数据包仍为本地静态资源。未引入DEM或新图形依赖。

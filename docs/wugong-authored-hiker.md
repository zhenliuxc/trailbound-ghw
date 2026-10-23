# 武功山 3D 试片：现成人物与动画

> **已归档为实验。** 2026-10-18 的项目主线确认为 2D 手绘水彩与旅途手帐收集，参见 [游戏理念与设计美学约定](game-design-charter.md)。现成人物和动作适配保留作参考；主体验不依赖实时 3D 人物与骨骼场景。

2026-10-17。用户同意武功山继续沿 3D 方向优化，并要求人物和走路动作尽量使用现成模型与动画。本轮只更新 `wugong-meadow.html` 独立草甸试片；没有改主游戏、原武功山行走页或其他路线。未发布、未提交，人物和动作效果待用户查看。

后续进展：用户随后明确要求完成整张地图，现已扩展为武功山全程 3D，见 [全程地图](wugong-3d-full-map.md)。本文保留现成人物首次接入时的记录。

本地预览：<http://127.0.0.1:8000/wugong-meadow.html?walk=1&scene=authored-hiker-2>。

## 模型与实际接入

人物采用 [Quaternius Ultimate Modular Men Pack](https://quaternius.com/packs/ultimatemodularcharacters.html) 中的 Adventurer。实际下载并读取了作者下载目录内的模型及随包 `License.txt`，该文件标明 CC0 1.0。模型自带背包、蒙皮和骨骼，直接保留作者的 Walk 与 Idle_Neutral，后者重命名为 Idle；其余动作未打包。

工程继续使用 Three.js 0.186.1，新增接入其 GLTFLoader、AnimationMixer 和 CCDIKSolver。没有再手工拼装人物肢体。服装、背包、头发与肤色统一调成草木绿、灰褐和低反光材质，与现有草甸共用光照、阴影和雾。

人物高度归一到 1.52 场景单位，保持当前小比例随行构图。Walk 的播放相位由实际前进距离驱动，停步时逐渐混入 Idle；上坡、下坡与转弯会收短步幅，并适度调整躯干倾斜。相机仍跟随地面路线位置，不随骨骼起伏移动。

原模型的鞋子由独立控制骨骼驱动，膝盖链与鞋子并非父子关系。适配层为标准 CCDIKSolver 添加虚拟脚踝，求解腿部朝向；真实鞋子控制骨骼到达地表目标。鞋底接触按模型实际顶点采样，并在着地阶段固定水平位置，抬脚后释放。骨盆按腿长和目标高差下调，给膝盖保留弯曲余量。

本轮只有作者现成的平地 Walk 和 Idle。上坡、下坡效果来自坡面适配，不称为已接入独立的登山或下山动画。尚未加入营地坐下、卸包、喝水动作，也没有在新试片接入照片弹窗、奖励或配乐。

## 可重跑的素材流程

`node scripts/art/prepare-wugong-hiker.mjs` 获取并核对固定源文件，去掉无关动画与水平根位移，调整材质，使用 glTF Transform 4.5.1 打包一个 GLB。该工具仅在开发时使用，不增加浏览器运行时依赖。

- `dist/characters/wugong-adventurer-v1.glb`：1,063,944 字节，无外部图片纹理与运行时解压器。
- `art/wugong-hiker/provenance-v1.json`：作者、原下载链接、源文件散列、原动画清单、保留动作和处理记录。
- `art/wugong-hiker/LICENSE-Quaternius.txt` 与站点同名许可副本：实际随包许可。
- `src/wugong-meadow/CREDITS.txt`：预览页“素材与组件来源”展示的署名。
- `src/wugong-meadow/hiker.ts`：模型加载、动画混合、鞋底接触和骨骼适配；其他路线不引用它。

素材脚本复跑后，GLB 的 SHA-256 保持 `06027a63da1e3c056439edfe4bf5bad4c2876282bc615bbe118c99dc106fd430`。

## 验证记录

沿用用户已经授权的武功山完整行走与场景检查范围。`npm run build` 完成严格 TypeScript 编译和浏览器 bundle 生成；构建不作为画面验收。

`node scripts/check-wugong-hiker.mjs` 读取实际 GLB，执行真实 AnimationMixer 与 CCDIKSolver，检查 402 个鞋子顶点、782 个姿态采样。模拟的路线长 62.04 场景单位，包含上坡和下坡；检查了走到营地、停步、重置与减少动态效果后的站立。通过结果见 `docs/previews/wugong-authored-hiker/pose-check.json`。相对道路高度的最深鞋底误差约 -0.0152 单位，最大支撑间隙约 0.0449 单位；不宣称完全消除了穿插。

该脚本不是浏览器、真机或 GPU 性能测试。真实浏览器中，新模型已从起点经过草坡和弯道完整走到营地，进度 100%，停止行走，按钮变为“再走一遍”。到达状态和截图保存在 `docs/previews/wugong-authored-hiker/arrival.json` 与 `arrival.png`。

浏览器检查了行走中停步与继续、主动切换全图与返回跟随，以及刷新后默认跟随。390 × 844 视野下无横向溢出，跟随、全图和行走按钮高 44 像素；人物能加载并继续行走，截图为同目录 `mobile-390.png`。控制台未读到错误或警告。临时屏幕尺寸已还原。

未执行其他路线回归、实体手机、听感或 GPU 性能验收。本轮范围不包括坐下、卸包和喝水动作。

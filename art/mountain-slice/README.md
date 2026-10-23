> 本机工程已迁移至 `~/code/trailbound`，工具入口和配置路径见 [本机开发说明](../../docs/LOCAL_DEVELOPMENT.md)。

# 虎跳峡 20–30 秒原生场景样段

本目录按 [slice-v1.json](slice-v1.json) 制作一段约 30 米的山间行走样段，不扩展到整条路线。它是为画面构图设计的路线示意，不是 GPS 轨迹或实测绝对高程。主路线、相机和运行端读取同一份合同。

当前交付是 Blender 制作脚本，尚未因脚本存在而生成或验收模型。必须提供实际下载的 Tripo 角色与岩块；没有输入时脚本会明确失败，不调用旧几何人物、静态滑行人物或占位岩块冒充完成。API key 和临时签名下载链接均不属于场景输入，不写入 `.blend`、GLB 或来源记录。

## 输入与制作

在仓库根目录使用 Blender 4.5 LTS 运行：

```sh
./trailbound-local.command blender \
  --background --python scripts/art/build-mountain-slice.py -- \
  --character .local/tripo/assets/character/animated-character.glb \
  --rock .local/tripo/assets/rocks/layered-cliff.glb
```

这些路径是示例，须替换成实际生成文件。`--rock` 可重复，关键岩肩与近景会轮换使用真实岩块资产，连续山壁仍由原生网格构成，不把一批等距岩球当作山地。

Tripo 若为多个动作返回分别下载的 GLB，可增加：

```sh
  --animation .local/tripo/assets/character/idle.glb
```

脚本只把真实动作绑定到同源角色。骨骼名称、父子关系、静止姿态矩阵必须一致；不一致时明确要求先做实际重定向。附加文件中的重复人体、网格和骨架会移出场景，实际动作通过主角色的 NLA 轨道保留。它不会凭名称给不同人物强行套动作。

若原始动作名称不含 `walk` 或 `idle`，先参考下载文件邻接的 `.glb.json` 中实际动作名称，再用 `--walk-action '真实动作名'` 或 `--idle-action '真实动作名'` 指定。它们只重命名已有动作。`WalkUphill` 仅在来源确有上坡动作时保留，不从普通 Walk 复制伪造。没有可识别的真实 Walk 会终止导出。

源角色默认声明面朝 glTF `+Z`。如果实际来源面朝其他方向，使用 `--character-forward -Z`、`+X` 或 `-X` 显式修正。完整蒙皮、骨骼与动作保留在统一缩放根节点下，角色高 1.7 米，脚底归零。Tripo 应请求原地动作。脚本只对单一对象根、且局部 XY 轴已明确对应世界水平面的通道去除净周期漂移；骨骼局部轴不等于世界轴，因此所有 `pose.bones` 平移原样保留，不猜测髋骨哪个轴是水平。实际处理范围写入报告，不声称重新制作了步态或校正了未知骨骼的位移。`extras.strideLength=1.44` 是运行端整周期默认值，未声称已从生成动画量测步幅，可用 `--stride-length` 提供实际确认值。

## 文件与坐标

成功制作后生成：

- `art/mountain-slice/tiger-walk-v1.blend`：可编辑原生场景，含打包贴图、光照、预览相机、隐藏的 Tripo 源岩块集合。
- `dist/models/tiger-walk-environment-v1.glb`：环境、可射线查询的 `PathSurface` 和来源信息，不包含人物或预览灯光。
- `dist/models/tiger-hiker-v1.glb`：归一化蒙皮人物与实际动作，不包含环境。
- `art/mountain-slice/build-report.json`：输入 SHA-256、保留的来源字段、实际动作名称、位移修正、输出清单。
- `art/mountain-slice/materials/`：从现有四格水彩图集裁出的贴图，避免四格边缘串色；它们也打包进原生文件和 GLB。

默认保护已有 `.blend`、GLB、派生材质图和制作报告，不覆盖已有作品。确实需要重建本脚本产生的文件时，可显式使用 `--replace-generated`；只有前次 `build-report.json` 标明本脚本身份，且目标文件 SHA-256 仍匹配记录，才允许替换。手工修改过的作品或来源不明的同名文件会被保护，需另选版本。

三项主文件先在临时制作目录生成，全部制作完成后才提交最终文件。制作失败保留旧的主文件；临时目录可用于诊断，不代表已完成。

运行端与 glTF 坐标均为 `+Y` 朝上、`+X` 面向峡谷、`+Z` 为人物前方。Blender 内部用 `(x, -z, y)` 对应世界坐标；标准 `export_yup` 会还原合同坐标。路线净宽约 1.55 米，脚底、路带和近坡取自同一表面函数。`PathSurface` 是独立网格，供运行端射线贴地查询。

合同节点保持 `TerrainNear`、`PathSurface`、`CliffShoulder`、`River`、`FarRidges`、`Foliage`。前段岩肩是连续地形与少量 Tripo 岩块共同形成的实际体量，行走约 10 米后退到人物右后方；视野通过行进和转弯打开。江流是位于 `x=85–125 / y=-75` 的曲折带，对岸从水边升起。远山采用独立层次与逐层淡化的色彩，不用矩形照片贴片承担主场景。

## 材质与交付边界

沿用 `dist/textures/tiger-mountain-materials-v1.webp` 的岩层、泥土与草木水彩图。近崖 UV 按实际高度和行进距离映射，路面以 1.55 米的尺度重复；不把一格纹理拉满百米崖壁。材质采用可导出 glTF 的贴图与 Principled BSDF。源贴图、骨骼和来源信息继续保留；没有邻接元数据时，输入只记录为“用户提供的本地 GLB、来源未知”，不因文件名或命令参数就宣称来自 Tripo。仅元数据实际声明 `provider=tripo` 时记录此来源声明。来源声明不等于已经完成画风、许可或动画质量验收。

原生文件配置柔和太阳光、Cycles 与贴图烘焙边距。AO/法线只配置制作条件，脚本不声称已经烘焙，运行端仍另行布灯。江流附带静态水纹网格和流向元数据，运行端负责克制的连续动效。

执行本制作脚本属于资产制作与必要构建。浏览器画面、相机遮挡、人物贴地与比例、实际步态、手机性能和音频听感仍须按仓库约定集中验收；脚本成功不等于这些体验已通过。

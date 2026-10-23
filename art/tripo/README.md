> 当前私有配置是 `~/code/trailbound/.local/tripo.env`，详见 [本机开发说明](../../docs/LOCAL_DEVELOPMENT.md)。

# 虎跳峡精修素材 · Tripo → Blender → Three.js

当前只准备了制作 brief 和本机命令工具，**未生成、下载或验收模型**。本目录没有把现有程序几何人物当作 Tripo 成果。目标是先完成一段 20–30 秒的「沿坡行走 → 绕过岩壁 → 峡谷展开 → 停下看江」；尚未交付的内容不计作完成。

## 接入

工具只用 Python 标准库。从仓库根目录运行 `python3 scripts/art/tripo-assets.py …`，无需把 Key 放进网页、前端环境、Git 或命令行参数。

本机环境变量 `TRIPO_API_KEY` 优先；也可以在已忽略的 `.local/tripo.env` 中填写：

```dotenv
TRIPO_API_KEY=在本机填写
TRIPO_API_REGION=global
```

该文件权限须为 `0600`。`global` 使用 `https://openapi.tripo3d.ai`；`cn` 使用官方中国区 `https://openapi.tripo3d.com`，须与自己的账户和 Key 匹配。工具按文本解析这个文件，不执行文件内容，也不打印 Key。

接口依据 Tripo 当前 apiv3：[官方入门说明](https://www.tripo3d.ai/help/api-plugins/how-to-use-tripo-api)、[Developers 快速入门](https://developers.tripo3d.ai/zh/docs/quick-start)、[官方 SDK API 参考](https://github.com/VAST-AI-Research/tripo-python-sdk/blob/master/docs/API.md)。没有使用即将退役的旧 `/v2/openapi/task`。Key 仅发送到所选官方 API 主机，禁止认证请求跟随重定向。模型下载是独立请求，不带 Key；signed URL 的查询参数不进入元数据。

## 命令及花费边界

只有 **`submit`** 创建远程任务，可能消耗 credits。`plan` 完全离线；`balance` 只读余额并确认 API 认证；`status` 只查询一次；`download` 查询已完成任务并保存文件；`import` 只复制本机文件。没有后台轮询、自动重试生成、自动补生成、自动串联绑骨或动画。用户已授权这次小范围 Tripo + Blender 片段制作，由根任务根据实读余额与当前价格控制用量；不购买套餐、不充值，也不为每次提交重复要求用户批准。

先通过官方只读接口确认连通和账户余额，不创建任务：

```sh
python3 scripts/art/tripo-assets.py balance
```

它查询 `/v3/account/balance`，仅输出认证成功、区域、balance/frozen 和查询时间；不会展示 Key 或原始响应。

人物已有原创正面 A-pose 水彩参考图，见 [参考图说明](./references/hiker-reference-v1.md)。先看使用该图的实际请求内容：

```sh
python3 scripts/art/tripo-assets.py plan --asset hiker-v1 --reference art/tripo/references/hiker-reference-v1.png
```

Key 在本机保存好、根任务完成只读连通和余额确认后，按本次已授权范围执行一次生成：

```sh
python3 scripts/art/tripo-assets.py submit --asset hiker-v1 --reference art/tripo/references/hiker-reference-v1.png
python3 scripts/art/tripo-assets.py status --task TASK_ID
python3 scripts/art/tripo-assets.py download --asset hiker-v1 --task TASK_ID
```

`--reference` 仅在显式 `submit` 内上传这张图片到 `/v3/files`，再将返回 token 发送给 `/v3/generation/image-to-model`；`plan` 只读取本地图的大小和 hash。参考文件须为不超过 10 MiB 的 PNG/JPEG/WebP。未传 `--reference` 时使用 brief 的文字生成请求，适用于两项岩石素材。不会把 image-to-model 文档未定义的长文字 prompt 混入图片请求；背包背面等未定义细节仍要在 Blender 中补齐。

`submit` 发出 POST 之前先在 `.local/tripo/submissions/` 留下本地收据。请求中断时结果可能不确定，**先到 Tripo 控制台核对已有任务，再决定是否重发**；不要因为没有收到 task ID 就立即再次生成。

人物生成、拓扑检查、蒙皮、动画是不同阶段。先查看原始模型和拓扑，再由根任务按余额与实际需要顺序提交对应阶段；这些都是本次制作的一部分：

```sh
python3 scripts/art/tripo-assets.py plan --asset hiker-v1 --stage rig-check --source-task GENERATED_TASK_ID
python3 scripts/art/tripo-assets.py submit --asset hiker-v1 --stage rig-check --source-task GENERATED_TASK_ID
python3 scripts/art/tripo-assets.py status --task CHECK_TASK_ID

python3 scripts/art/tripo-assets.py plan --asset hiker-v1 --stage rig --source-task GENERATED_TASK_ID
python3 scripts/art/tripo-assets.py submit --asset hiker-v1 --stage rig --source-task GENERATED_TASK_ID
python3 scripts/art/tripo-assets.py status --task RIG_TASK_ID
python3 scripts/art/tripo-assets.py download --asset hiker-v1 --stage rig --task RIG_TASK_ID

python3 scripts/art/tripo-assets.py plan --asset hiker-v1 --stage animate --source-task RIG_TASK_ID
python3 scripts/art/tripo-assets.py submit --asset hiker-v1 --stage animate --source-task RIG_TASK_ID
python3 scripts/art/tripo-assets.py status --task ANIMATION_TASK_ID
python3 scripts/art/tripo-assets.py download --asset hiker-v1 --stage animate --task ANIMATION_TASK_ID
```

brief 使用与 humanoid walk/idle 相容的 `v3.0-20260909` 绑骨版本，动画请求包含几何并采用原地循环。`--stage retarget` 是 `--stage animate` 的同义写法。**Walk 是角色交付的最低动作要求**；Idle 只有实际 GLB 包含时才算交付；没有请求或声称生成专门的 WalkUphill。接口返回成功不代表模型拓扑、背包权重或走路效果已合格；仍需实际精修与用户授权后的验收。

官方 Developers 的多动作示例为 `output.model_urls`，而 SDK 同时支持单 `model_url`。工具接受单文件、数组或按动作命名的结果映射，以实际返回为准；`status` 只列结果的 index/label，不打印 URL。若存在多个 GLB，先查看 `status`，再逐个选择下载：

```sh
python3 scripts/art/tripo-assets.py download --asset hiker-v1 --stage retarget --task ANIMATION_TASK_ID --output-index 0
python3 scripts/art/tripo-assets.py download --asset hiker-v1 --stage retarget --task ANIMATION_TASK_ID --output-index 1
```

也可使用 `--output-name "status 中的实际 label"`。默认文件名保留结果标签，各 GLB 记录自身真实 clip 名。单文件多 clip 可以直接交给 Blender；分文件则只合并实际同骨骼动画，不根据请求列表虚构缺失动作。

另两个静态资产 ID 是 `cliff-corner-v1`、`gorge-rock-v1`。静态岩石不提交蒙皮和动画任务。三项均已写出原创造型、配色、禁止项、面数目标与 Blender 精修要求，见 [asset-briefs.json](./asset-briefs.json)。人物纹理和岩壁纹理请求为 `detailed`，它们不是免费模式的保证；可在确认预算后调整 brief 再查看 `plan`。

## 已有 GLB：无需 API

用户从 Tripo Studio 导出的 GLB 或其他有明确来源的 GLB 可以直接导入，不上传、不生成、无 API 花费：

```sh
python3 scripts/art/tripo-assets.py import --asset hiker-v1 --file /绝对路径/人物.glb --creator "来源作者或账户" --source "原始导出来源" --model "实际已知版本" --license-note "实际许可与套餐记录，未知就写待核验"
```

这是**用户提供模型**，工具不会凭文件名把它认证为 Tripo 生成。已知 task ID 可以另传 `--source-task`；不得编造来源、模型版本、完成状态或授权。

## 文件与交接

默认原始 GLB：`.local/tripo/assets/<asset>/<stage>-<task>.glb`；本地导入使用 `import-<hash>.glb`。配套 `.glb.json` 记录 task、模型请求参数、来源、不含私密签名的源路径、SHA-256、实际 GLB 的 mesh/skin/animation 统计和许可待核验状态。API 任务收据位于 `.local/tripo/tasks/`。全部均留在本机，不自动复制至 `dist/`。

下载和导入先写同目录 `.tmp`，完成写入及 GLB 结构读取后再原子发布；已有目标文件会拒绝覆盖。失败的临时文件会清理，原始输入不变。文件必须是自含纹理的 GLB 2.0；ZIP、HTML、外部纹理引用与不完整文件不会成为交付文件。`--out` 可以指定项目内的新 `.glb` 路径，但必须使用新文件名。

Tripo 原始模型进入 Blender 后，要完成角色轮廓、衣物和背包细节、权重、脚步、UV、水彩材质及合适的网格简化；身高合同统一 **1.70 m**，脚底原点、Y 向上、正面 +Z；保持帽檐、背包主体和鞋底刚性。只有完成精修且记录来源的模型才能用于替换运行时角色，不能在缺少模型时恢复程序几何角色并将其称为 Tripo 成果。期望最终路径见每项 brief 的 `delivery.file`，这是目标而非已存在文件。

## 许可与未验证状态

每项资产元数据默认 `pending-verification`。须核对实际生成账户套餐、[Tripo 条款](https://www.tripo3d.ai/terms)、商业使用及随游戏分发模型和贴图的权限，并保留原作者/提供方记录。工具不自动把「付费」「API 成功」解释为许可已核验。

本轮尚未运行脚本、提交任务、测试、构建、打开浏览器或验收 Blender/实体设备。GLB 的结构统计只是交接信息，不能代替模型质量、动画或性能验收。

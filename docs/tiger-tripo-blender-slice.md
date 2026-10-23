> 当前工程已迁移至 `~/code/trailbound`。启动与 Tripo 配置见 [本机开发说明](LOCAL_DEVELOPMENT.md)；下文旧任务路径、命令和进程号保留为历史记录。

# 虎跳峡 Tripo + Blender 精修短段 · 准备记录

用户已同意先做 20–30 秒的精修山间行走片段：贴着山壁慢走、绕过岩肩、停下来望见金沙江。保留精细手绘水彩、真实地域关系、鼠标和触屏轻操作，以及现有照片、声音与手帐。此轮范围不扩展到整条路线迁移。

## 当前状态

**已完成工具、参考素材和代码准备；尚未生成 Tripo 模型，也未完成 Blender 资产制作。现有游戏入口没有切换到缺少模型的新场景。**

- 本机 Blender 4.5.14 LTS（arm64）已安装到任务目录 `.tools/blender/Blender.app`，`--version` 返回成功。官方安装包校验值匹配，记录见 `../.tools/blender/INSTALLATION.md`。
- 已生成单人全身 A-pose 建模参考：`art/tripo/references/hiker-reference-v1.png`。这是内置 imagegen 制作的二维参考，不是 Tripo 模型；完整提示词和素材边界见同目录 `hiker-reference-v1.md`。
- `scripts/art/tripo-assets.py` 已准备图生模型、文字生成、绑骨、动作重定向、状态/余额查询和下载工具；**尚未执行 API 请求或消耗 credits**。用法与实际接口来源见 `art/tripo/README.md`。
- `scripts/art/build-mountain-slice.py` 已准备 Blender 原生场景组装与 GLB 导出。缺少实际角色/岩块输入会停止，不生成几何替身。该脚本尚未执行。
- `src/runtime/mountain-walk/scene-authored.ts` 已准备独立 GLB 加载、可见路面接地、贴近人物的镜头、真实动作混合、照片截取和资源释放。缺模型或真实 Walk 动作会明确失败。
- 必要构建 `../trailbound-local.command build` 退出码为 `0`，生成独立 `dist/mountain-walk-authored-v1.js`。当前 `scene.ts` 仍加载上一版场景；新模块不会因构建而自动启用。

## 当前阻塞

用户选择在本机配置 Tripo API Key。私有模板 `.local/tripo.env` 已创建并加入 Git 忽略，初始权限为 `0600`；只在本机填写 `TRIPO_API_KEY=`，不在聊天、命令参数、网页或交付模型中保存密钥。检查配置时只输出是否已填写，不输出值。

最后一次本机检查显示模板仍为空。已打开 Tripo 控制台，它跳转到登录页；登录和 Key 配置仍需用户完成。尚未认证 Tripo、读取账户余额或提交任务；不能把工具准备当作 Tripo 接入成功。

配置保存后，先用只读 `balance` 确认账户连通，再在本轮已授权的小范围内生成角色与岩壁、完成真实蒙皮和 Walk/Idle。不会购买套餐或充值。API 返回的实际 GLB、骨骼和动作名称决定后续输入；不编造缺失的上坡动画。

## 画面合同与接续

`art/mountain-slice/slice-v1.json` 定义约 30 米的艺术化山路、2.7 米爬升和三段镜头：前段贴山跟随、中段侧移开景、终点停步看江。坐标为米制、+Y 向上、+X 为江谷、人物正面 +Z，非 GPS 或绝对海拔。镜头距实际地面约 1.85 米，最高约 2.2 米，不以高空俯视代替同行感。

实际模型完成后执行 Blender 制作脚本，保存可编辑 `.blend`、环境 GLB、角色 GLB 与来源记录；制作脚本用法见 `art/mountain-slice/README.md`。动作分多个 GLB 时按真实同源骨架合并，不伪造动作。

激活之前还需同步运行端短段路径、阶段提示、素材路径和场景入口，再做必要构建。当前运行路径仍为上一版长段，没有把这部分接线标为完成。入口继续使用 `http://127.0.0.1:8000/`，本轮尚未改变可见画面。

## 验证边界

本轮完成了软件安装所需的版本读取、参考素材制作与查看、源码静态阅读，以及 TypeScript/打包必要构建。没有运行项目测试、Python 工具的功能测试、浏览器游戏、手机、GPU 性能或听感验收，也没有渲染/验收 Blender 游戏场景。

待实际精修片段制作和接线完成后，再按 `AGENTS.md` 约定询问集中测试。未推送、部署或清理浏览器数据；原有未提交工作、实景照片和手帐逻辑保留。

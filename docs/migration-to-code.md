# 迁移到用户 Mac 的 ~/code

- 当前机器：macOS 26.4.1，Apple Silicon；源、目标均在用户自己的 Mac。
- 新工程：`/Users/liuxucheng/code/trailbound`。
- 原工程备份：`/Users/liuxucheng/Documents/Codex/2026-10-16/task/trailbound.backup-20261017-103610`，未删除，内容保持迁移前状态。
- 保留分支：`master`；HEAD：`2099e0d7c6e220fa60cd24f769ef1a80b381d671`。
- 初次复制核对：7030 个普通文件、3 个符号链接，237816645 字节；内容与权限一致，Git 状态一致。
- `.git`、Git 忽略文件、本地私有配置、`node_modules`、源码、资源、文档和全部未提交工作均一并复制。原始生成素材、离线 npm 缓存和 Blender 应用也已保留到新工程 `.local/`。
- 新增便携启动助手、源码监听与当前本机说明；历史文档仅添加迁移提示，原始构建日志未改写。旧助手原件保存在 `.local/migration/original-helpers/`，旧位置的助手转发到新工程。
- 私有逐文件迁移清单位于原任务 `.migration/`，不展示密钥或其内容。迁移前已停止旧构建监听和本地服务，未发现源文件写入句柄。

当前启动与 Tripo 配置见 [本机开发说明](LOCAL_DEVELOPMENT.md)。本轮不运行集中游戏测试、不生成收费模型、不推送、不发布。最终文件与启动核对结果另写入本工程 `.local/migration/final-verification.json`。

最终核对：迁移前 86 项未提交 Git 状态均保留，备份内容和权限未变；除上文已记录的路径文档调整外，原项目文件均保持一致。新本地服务 PID `65074` 的工作目录为新工程，HTTP HEAD 返回 `200`。这只核对服务连通，没有打开游戏或执行集中测试。

# 本地 Codex / Cowork 发布交接

## 用户指令

测试完成后，沟通本地 Codex，让它使用 `cowork publish`（用户原文 `cowork pubulish`）skill 发布到 `xhs 的 cowork`。

## 可复现的代码和验证

- GitHub：https://github.com/zhenliuxc/trailbound-ghw
- 版本分支：`codex/travel-moment-journal`；PR：https://github.com/zhenliuxc/trailbound-ghw/pull/2
- 从该分支取本交接文件所在提交，以该完整提交 SHA 作为发布版本；不要使用尚未包含七路线更新的 master。
- 执行 `npm ci`、`npm run check`、`npm test`。本次云端终端的检查通过，128 项测试全部通过；完整输出在 `docs/westlake-test-output.txt`。
- 新增第七条路线“西湖·九溪龙井”，含连通 OSM 选段、溪谷茶园地图、三张授权实景照片、三段原创合成声音、三枚旅行瞬间徽章。源证据见 `docs/WESTLAKE_ROUTE.md`。
- 地图和徽章完成静态渲染目视检查。云端受管预览不可用，真实桌面/手机 CSS、GPU 运行和听音尚未验证；本地有浏览器时补充实际检查，并按事实记录结果。

## 发布执行

1. 找到本机实际安装的 `cowork publish` skill，完整阅读其 SKILL.md 并使用其中指定的发布入口。不要猜测接口、凭证或项目标识。
2. 核对用户所指 `xhs 的 cowork` 对应的现有项目和当前访问设置，再把上述完整提交发布到该目标。这里未提供目标 URL 或项目 ID；不要把这条指令自行解释为小红书社交帖子。
3. 用户要求更新已有试玩站点，不新建替代站点。原 Sites 身份为 `appgprj_6ace5abcecd88191bc34207f10419101`，URL：https://trailbound-ghw-zhenliuxc.royal-box-3224.chatgpt.site ，保持本人私有访问。Cowork 发布不要改变该站点权限。
4. 保留照片来源许可、预加载与解码缓存、图片下方说明和跨路线手帐数据。不要加入遮挡图片的说明、照片精确拍摄平台推断、机械次数文案或已删除的地图资料栏。
5. 返回实际发布目标 URL、完整提交 SHA、部署成功状态与验证结果。若缺少入口或目标，明确报告缺项，不把交接文件当成已收到或已发布的证据。

## 当前交接状态

此文件是准备好的交接说明。当前会话未发现可联系用户本地 Codex 的通道，也未发现 `cowork publish` 技能；尚未送达本地 Codex，尚未发布至 XHS Cowork。

# MLH 提交准备

当前状态：**v0.11.1 参考 MVP、运行说明、90 项自动测试和提交清单已准备；源码已通过 GitHub 插件提交至 [zhenliuxc/trailbound-ghw](https://github.com/zhenliuxc/trailbound-ghw) 的 master 分支。Cursor 实作、真实运行截图和 MLH 提交仍未完成。**

## 官方要求核对

挑战：https://www.mlh.com/events/global-hack-week-open-source-90/challenges/01a11d23-3841-86cf-2fa3-5e70600e8f08

官方要求：由 Cursor 搭建可运行小应用，运行并迭代/调试；提交 **GitHub 仓库链接或运行截图**；用 **两句话说明 Cursor 帮助创建了什么**。当前页没有 Pro 购买要求，也没有强制要求聊天记录、演示视频或公开站点。

活动页列出北京时间 2026-10-16 01:00 结束。挑战表单是否有单独截止时间，需登录后检查；不要把活动结束时间当作已确认的表单截止时间。

## 完成顺序

1. 按 `CURSOR_WORKFLOW.md` 在空文件夹由 Cursor 生成初版，进行一次真实迭代并复测，更新贡献记录。
2. 在真实浏览器和手机试玩，保存截图。最快提交路径可以只用运行截图，规则允许不交仓库链接。
3. GitHub 仓库已由用户创建，v0.7 参考成果已通过 GitHub 插件提交。完成真实 Cursor 实作与复测后，把最终版本提交到 https://github.com/zhenliuxc/trailbound-ghw ，更新贡献记录，保留第三方许可。
4. 写两句话，限定为 Cursor 实际做过的内容。核对链接/截图可供评审查看。
5. 登录 MLH，打开挑战页的 **Submit your project**。本次未访问登录后的表单，字段名称与额外信息以实际页面为准。
6. 提交后检查成功页面或 View Your Submissions，保留确认。只有看到成功记录，才标记为已提交。

## GitHub 后续更新

当前仓库为 https://github.com/zhenliuxc/trailbound-ghw ，公开可访问，默认分支为 `master`。用户创建初始仓库并完成应用授权；ChatGPT/Codex 已通过 GitHub 插件提交当前参考源码，保留初始提交。已有的本人私有试玩站点并不会因源码公开而变为公开站点。截图也是规则允许的替代材料。

当前参考版本已提交到仓库。本版本不是 Cursor 实作记录；随后完成真实 Cursor 实作、复测，并提交最终成果、更新贡献记录。若后续通过网页上传，保留目录结构。不要把整个 ZIP 当成唯一代码内容。添加运行入口和贡献说明，并核对最终仓库URL。当前目录下的 `.openai/` 是私有试玩版本的部署配置，不需要上传到新的 GitHub 项目。

若熟悉 Git，可克隆已有仓库，在其中完成真实 Cursor 实作后的修改并提交。若挑战要求从零构建，请先遵循 CURSOR_WORKFLOW.md，在空文件夹完成初版并保留实际记录，再导入最终成果：

```bash
git clone https://github.com/zhenliuxc/trailbound-ghw.git
cd trailbound-ghw
# 将真实 Cursor 实作后的最终成果复制到此处并复测
git add .
git commit -m "Update Trailbound after Cursor implementation and verification"
git push origin master
```

新项目中如果尚未存在 LICENSE，不要宣称已授予某个开源许可证。挑战目前没有列出许可证为必需材料。

## 两句话模板（目前不能原样提交）

以下有明确占位符，只有完成真实 Cursor 操作后填写。不要将它视为已经发生的操作描述：

```text
Using Cursor, I [describe the files/features Cursor actually scaffolded] for Trailbound, a browser hiking game where a small backpack hiker follows an illustrated route, discovers scenery, and collects real landscape photographs.
Cursor then helped me [describe a real fix or improvement and how it was tested], and the final app supports [list the controls you actually verified].
```

如果使用了本参考 MVP 的素材或代码，在这两句话中注明 ChatGPT/Codex 的相关贡献。例如把第一句末尾补上实际的引用来源，或压缩介绍腾出一句说明。不要声称整个参考版本都是 Cursor 从零生成的。

## 提交前核对

- [ ] 有真实 Cursor 起始生成和至少一次实际迭代。
- [ ] 最终版本可运行，自动行走、观察、照片停留、情境选择和结尾可完成。
- [ ] 运行截图来自真实最终版本，没有把自动测试输出当截图。
- [ ] 仓库链接真实存在且评审可访问，或使用允许的运行截图路线。
- [ ] 两句话具体、准确，没有待填写占位符。
- [ ] 成功提交并看到自己的提交记录。

已签到活动是用户提供的事实；本次未重新查 Gmail，也未代替用户登录 MLH 或提交。

新版v0.2包含中国山野意象地图与风险系统。介绍最终成果时可说明这些功能，但Cursor贡献仍只填写真实执行部分，不把地貌意象图称为实测路线或真实导航地图。

当前交付为v0.3地理路线版：OSM步道/公开历史GPX与小人角色已接入。早期v0.2意象网格已替换；介绍时写明历史数据来源和范围，不说本项目重新实测了路线。

当前交付为v0.4卡通实景版：保留参考路线走向，九个命名打卡点解锁真实照片。照片署名与各自许可必须随最终成果保留。Cursor贡献只写确实执行过的生成与迭代，不把本参考项目改称Cursor从零生成。

当前交付v0.5漫游版包含自动行走、少量情境选择、真实照片与旅程回忆。新版介绍可描述这些功能，但Cursor贡献必须继续限定为实际执行部分。

当前参考交付为v0.6光影漫游版，新增PixiJS画面层。最终成果若复用该库须保留其许可，Cursor贡献仍按事实填写；当前GPU场景没有真实浏览器运行截图。

最新参考交付v0.7修正高清滤镜并优化云雾/步态，仍需真实Cursor实作、最终浏览器运行截图或GitHub链接和MLH表单提交。

最新参考版本为 v0.7.1，修正地图背景滤镜裁剪。Cursor 实作和 MLH 提交状态不变。

最新参考版本为v0.8，新增路边发现、九项浏览器手账与随机重玩。介绍可以描述这些实际功能，但仍需真实Cursor实作和复测，不能称为Cursor操作记录。

最新参考版本v0.9包含人物情境姿态、环境矢量动画与短过渡。当前检查没有执行真实CSS关键帧或GPU浏览器；运行截图仍需真实运行最终Cursor版本后取得。

最新参考版本v0.9.1调整了蝴蝶比例并重画小鸟；Cursor实作、真实运行截图及MLH提交仍待完成。

最新参考版本v0.10将地貌插画与路径贴合，并加入真实坐标水系和峰点。只能描述为地理要素参考与艺术化坡面，不能称DEM或真实等高线复原。OSM派生数据须保留ODbL署名，Cursor贡献仍按实际执行填写。

当前v0.10.1已删除重复练习地图，只有武功山、虎跳峡与鳌太线三张正式地图。Cursor实作和MLH提交仍待完成。

当前v0.11包含九个打卡点的原创合成音乐与环境音。最终实机验证应包含首次开启声音、打卡点切曲、暂停和后台停止；音频夹具不等于听音测试。Cursor贡献继续按真实操作填写。

当前v0.11.1将打卡照片改为铺满弹窗；最终截图需检查手机显示、文字和署名可读、继续按钮可用。Cursor实作与MLH提交状态不变。

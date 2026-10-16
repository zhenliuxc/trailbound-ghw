# 武功山简单互动调整 · 2026-10-16

用户反馈：游戏要简单有趣，山脊风路解谜难懂；金顶石语只需简单拼图，不要旋转，画面简单。

## 实现

- 云海改为“拨云见山”。点一下／划过前景云朵，云絮随风散去，露出山脊。实际碰到三朵不同云后完成；删除所有路线节点、地形规则、送风与撤回操作。鼠标、触摸和键盘共用同一完成状态。
- 金顶保留六片水彩拼图。画片始终正向，拖放或两次点击即可拼合；删除旋转模型、按钮、Q／E、方向判定与旋转动效。放错不计数，六片放对后才获得画作。
- 两处改为单列画面、简短提示与进度。拼图淡底稿常显，去掉多按钮侧栏；数字和格位轮廓仅键盘操作时显示。云海不显示 HUD 或操作面板，完整保留原水彩主体。
- 云絮散开触发短风声、既有许可拟音和柔和音色；拼片沿用纸声、锁合与完成反馈。没有下载新录音，不宣称真实当地录音或听感已验收。
- 继续沿用画作 ID、徽章、完成后展开、收藏与重玩去重。保留加载等待／错误、重试、退出、减少动态效果与后台暂停。摄影、纸鸢和其他路线玩法不扩展。

## 源码与已有工作

基于 `codex/recover-site` 的 `8576815`，版本 38 为上一轮已发布状态。本轮开始仅 `dist/journey.js` 有可见未提交修改，将金顶开场改为“再去金顶读一段石语”；已保留，并把同一段中的旧风路介绍同步为拨云。原差异另保留在本地临时补丁，未覆盖已有改动。

主要源文件：`dist/wugong-stories.js`、`dist/art-games.js`、`dist/art-game-scene.js`、`dist/app.js`、`dist/art-games.css`。同步路线介绍、互动文字、设计讨论稿与 `AGENTS.md`。

## 本轮验证

用户随后明确要求“测试发布”，已授权本轮集中测试和原站点发布。本轮只执行相关检查，没有重跑全部路线测试。

- `node --test tests/wugong-stories.test.cjs tests/art-games.test.cjs tests/wugong-chapter.test.cjs tests/water-flow.test.cjs tests/audio.test.cjs`：5 个文件通过，0 失败。Node 24 默认汇总按文件计数，此处不将文件数当作内部用例数。
- `npm run check`：脚本语法、引用、现有图片／声音来源、许可、哈希及图集资源检查通过。
- 新增拨云声音检查后，只定向运行该项，验证主动开启后短风声立即触发、隐藏后不补播，已通过。
- Chromium 154／WebGL／SwiftShader：1280×900 桌面、390×844 手机尺寸，各完成拨云和拼图并收藏两个不同标签，0 页面异常、0 资源请求失败。桌面常规动效，手机尺寸减少动态效果。
- 浏览器通过真实鼠标／触摸事件点击、拖动画片和划过云朵；空白及重复拨云点击不推进，Q／E 不旋转也不影响正确拼放。手机触摸由 Chromium 模拟，不能称为实体手机验证。
- 原生 Chromium Web Audio：主动开启、用浏览器事件触发后台暂停、回前台时暂停行进保持安静、手动继续恢复、静音均通过。未执行人工试听。

浏览器脚本增加 `TRAILBOUND_TEST_GAMES=clouds,puzzle`，只操作本轮两处；其他互动跳过后继续行进。检查使用本机独立浏览器存储，没有访问或清理生产存档。已逐张查看实际截图，确认两端画面与控件未被遮挡；这不是用户审美验收或硬件 GPU 性能测量。

证据：[浏览器原始结果](previews/wugong-simple/results.json)、[声音状态结果](previews/wugong-simple/audio-results.json)、[电脑拨云](previews/wugong-simple/desktop-clouds.png)、[电脑拼图](previews/wugong-simple/desktop-puzzle.png)、[手机尺寸拨云](previews/wugong-simple/phone-clouds.png)、[手机尺寸拼图](previews/wugong-simple/phone-puzzle.png)。

## 发布

已完成并验证的功能基线为 GitHub `26119b2`。本轮验证记录和脚本随后单独提交到 `codex/recover-site`，不合并 master。

发布仍使用原 Sites 项目 `appgprj_6ace5abcecd88191bc34207f10419101` 和原地址 https://trailbound-ghw-zhenliuxc.royal-box-3224.chatgpt.site/ 。发布前已确认版本 38、账户 owner、仅 owner 可访问且无外部访客；原 Sites 源码 main 为 `7d3cc7dbc83335975af05fe6c5503ea5a5791c32`。没有建立替代站点或改变访问范围。

沿用原生 Sites 接口和隔离 Git 工作树：将最终已提交的 GitHub 文件树完整同步到原 Sites main 的后续提交，对比两边文件树，再从同一提交打包 `.openai/hosting.json` 与 `dist/` 并推送和发布。构建型依赖未变，静态页面无需另行构建；凭据只经隐藏 stdin 传递，不存文件或日志。发布终态、实际版本号和 URL 以 Sites 返回与会话最终回报为准。

实体手机、真实硬件 GPU 帧率和人工音效试听仍未验收。

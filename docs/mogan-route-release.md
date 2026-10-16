# 莫干山改造 · 集中验证与发布准备

2026-10-16。用户先要求“完成莫干山路径的改造，以武功山的标准实施”，功能保存后明确要求“测试推送并发布”。本记录随待发布源码提交；上线版本、提交与部署结果以本次 Sites 返回为准。

开发和测试起点为 GitHub `codex/recover-site` 的 `57342c1a411608c838c02421a10c8d49cd734b44`；发布前核对远端仍为该提交。原私有站点当时为版本 42，Sites 源码 `02cc1433b5b3815690d621bd3fe537faaa735f11`。没有从落后的 master 覆盖代码。

## 实现范围

莫干山三幅原画对应三种操作：移动竹筒接住八个雨声、交替落脚走过十级石阶、调节或拉弓送纸叶穿过竹隙。共用精细水彩素材、加载门槛、完成收束、原画展开与收藏流程。未完成和跳过不发奖，收藏仍使用原 ID 与原去重规则，不恢复导入、导出或清空功能。

复用已打包的免费音乐和材质录音，增加莫干山场景编排与署名，没有增加付费素材或重复音乐下载。详细玩法、素材和声音分工见 [改造说明](mogan-route-upgrade.md)，许可与哈希见 [莫干山复用清单](../dist/audio/mogan-credits.json)。

## 自动检查

经用户授权后，一次集中运行：

```bash
node --test tests/mogan-games.test.cjs tests/mogan-ui.test.cjs tests/music-layer.test.cjs tests/audio.test.cjs tests/audio-scenes.test.cjs tests/mini-games.test.cjs tests/water-flow.test.cjs tests/runtime-lifecycle.test.cjs tests/art-games.test.cjs tests/journal.test.cjs
npm run check
```

**85 项相关测试全部通过**，没有跳过或失败；语法和资源检查通过。覆盖真实越口接雨、漏接重试、八音完成、石阶时机与错脚、慢速、弹道与取消、三幅原画的奖励收藏、旧记录保留、加载等待/退出及后台暂停、主题映射与异步音频清理。这里的模型/DOM 结果不代表真实浏览器、实体手机或听感。

素材检查包含图集帧界、266,450 bytes 的新图集、音乐/SFX 许可和文件哈希；配乐继续复用已有四个媒体文件，没有复制音频。没有为每个修复重复跑全部 85 项，也没有运行全仓库 `npm test`。

证据：[自动测试](previews/mogan-release/unit.txt)、[资源与语法](previews/mogan-release/asset-check.txt)、[最终严格 TypeScript 构建](previews/mogan-implementation/build.txt)。

## 浏览器发现与修复

首轮未能得到接雨的 PixiJS 画布：发行版没有启用可选的 Prepare 扩展，直接调用 `renderer.prepare.upload` 抛错后进入水彩图像 SVG 降级。改为扩展存在时预上传，否则用该 WebGL 渲染器的纹理系统显式绑定上传；仍使用同一水彩素材与规则，不能只让 SVG 降级通过就宣称 PixiJS 正常。

后续电脑流程已完成接雨和石阶，但打开弹弓时点击回执超时。取消等待导航和临时恢复时钟均未解决；将 WebGL 初始化移出打开事件的微任务，延后至下一个任务，并检查退出标志，避免在打开输入的处理期间分配上下文。相关浏览器复测只针对渲染、三段流程及原生音频，没有扩大到其他路线的全量验收。

定向脚本另修正了两项测试步骤：跳过未完成片段后应继续行进，避免立刻反复打开同一个仍可见的片段；使用发射按钮的路径应期待放弦/飞叶录音，不期待只有拉弓手势才产生的牵线录音。没有因此更改产品的未完成奖励或碰撞规则。

首轮与诊断证据：[画布未就绪](previews/mogan-release/browser-initial.txt)、[Prepare 异常定位](previews/mogan-release/browser-diagnosis.txt)、[第三段点击回执超时](previews/mogan-release/browser-click-timeout.txt)。最终复测没有再出现该超时。

## 浏览器最终结果

同一最终构建在真实 Chromium 中通过两种尺寸的完整流程：电脑 1280×900；手机触控模拟 390×844，开启减少动态效果。每种尺寸分别实际完成接雨、十级石阶和竹叶弹弓，弹出对应原画、收进手帐，留下 **3 条不同的已获得记录**。页面未捕获异常为 0，失败请求为 0，三段均有就绪的 PixiJS 画布。WebGL 使用 SwiftShader 软件渲染，不是手机 GPU 性能测试。

接雨由可见进度判断下一叶尖，通过画面指针操作移动竹筒；石阶读取视觉提示后点击左右脚按钮；弹弓先用未调节的一发确认不发奖励，再展开微调，通过原生 input 事件设置 40° / 60%，点击可见发射按钮完成。这并不声称已经用实体触摸拖弓或手动拖动滑块验收全部输入方式；取消与键盘等分支另有模型/DOM 覆盖。

原生音频探针观测实际 Chromium 的媒体解码与 Web Audio：

- 未开启声音没有媒体或音频请求；准备页开启声音仍不预取整首主题，行走后 A Kind Of Hope 解码并产生有效增益下的非零信号。
- 接雨 Cirrus、石阶 Reverie、纸叶 Childhood 在两种尺寸中均有解码/有效信号和真实媒体时钟到端点后的循环证据；游戏到奖励复用同一媒体元素。
- 操作有实际 BufferSource 采样启动：滴水/轻水花、三种脚步、放弦飞叶/轻落、展开与收画。探针没有换成假音频或假解码器，也没有把请求成功直接当成解码成功。
- 每种尺寸缓存主题 4 个，最多同时播放 2 个媒体流。模拟 blur/focus 后全部主题暂停、位置停止推进，再恢复；游戏内静音与最终静音均暂停主题并挂起 AudioContext。

业务时钟由 Playwright 加速，音乐时钟和解码保持原生。另用**不安装虚拟时钟**的独立电脑浏览器检查首次遇见：原生按钮点击约 1,330 ms 返回，随后确认画布就绪；这是本环境的一次观测，不是物理设备或通用性能承诺。

```bash
TRAILBOUND_TEST_AUDIO=1 \
TRAILBOUND_PLAYWRIGHT_MODULE=/opt/codex/runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright \
TRAILBOUND_REVIEW_DIR=/tmp/trailbound-mogan-browser-complete \
node scripts/test-mogan-browser.cjs
```

证据：[结构化结果](previews/mogan-release/browser-results.json)、[最终运行记录](previews/mogan-release/browser-final.txt)、[正常时钟首次打开](previews/mogan-release/native-open.txt)、[电脑正常时钟画面](previews/mogan-release/desktop-native.png)、[手机尺寸石阶](previews/mogan-release/phone-footsteps.png)、[手机尺寸纸叶](previews/mogan-release/phone-sling.png)。手帐的重玩去重、历史文字保留、迟到图片和媒体的销毁清理等分支由相关自动测试覆盖，不全部算作真实浏览器通关项目。

## 仍待用户实际体验

- 本地 Chromium、软件 WebGL、手机尺寸/触控模拟不能代替实体手机、Safari、真实 GPU 帧率、锁屏与操作系统切后台。
- 原生媒体解码、有效增益和非零信号不能代替耳机/手机外放试听。音量比例、曲风、滴水短句、循环乐句及换曲自然程度仍需人工听。
- 本地请求成功不代表线上弱网、媒体 Range 请求与所有设备缓存情况均已验收。

## 发布目标

原项目 `appgprj_6ace5abcecd88191bc34207f10419101`；原地址 `https://trailbound-ghw-zhenliuxc.royal-box-3224.chatgpt.site/`。发布前读取的访问配置为当前用户 owner、仅一位 owner、无群组和外部访客，保持原访问范围。

验证完成后提交并推送 GitHub `codex/recover-site`，将同一文件树同步到原 Sites 源仓库，再从实际已推送的 Sites 提交归档 `.openai/hosting.json` 和 `dist/`，调用原项目的私有部署。两个仓库父历史不同，SHA 可不同，文件树必须一致。不新建替代站点，不合并分支或删除旧会话。部署成功与版本号以本次工具返回记录及最终交付为准。

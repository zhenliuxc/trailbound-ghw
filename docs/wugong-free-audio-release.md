# 武功山免费配乐 · 本轮验证与发布准备

2026-10-16。用户已明确要求“测试，推送，然后发布”。更新前线上版本为 41，GitHub `f9fba3684bb5d6ebdd1c659060388b5d9403c9f4`，原 Sites 源码 `3c487cfa5d3de614286b90d0ce91ba191636fb01`。本记录随本轮源码提交，保留发布前的验证证据；实际部署版本号和结果以本次 Sites 返回为准。

## 更新内容

武功山四个小游戏分别使用 Scott Buckley 的 Childhood、Cirrus、A Kind Of Hope、Reverie；行走与照片页使用 Reverie。四首均以 CC BY 4.0 免费署名使用，十个 Kenney 材质短音效以 CC0 使用。素材授权费为 0 元，未采购素材、付费生成或委托作曲。它们是现有免费作品，不是独占或原创主题曲。

风筝牵线与展开、拨云、拍照快门、拿放拼片、展开画作、收好和脚步使用打包录音/拟音。大幅压低武功山程序风声，去掉该路线重复的合成完成旋律，保留安静的环境层。对应奖励持续游戏主题，换场景淡入淡出。只有用户开启声音后才加载；静音、后台、路线切换和销毁处理全部已创建主题。加载失败可点“重试配乐”，不连带关闭环境声。

设计、每场景处理和完整来源见 [wugong-music-design.md](wugong-music-design.md)；发布文件哈希、实际取得的固定版本源链接和修改记录见 [wugong-credits.json](../dist/audio/wugong-credits.json)。新配乐总计 5,351,464 bytes，十个短音效 40,184 bytes，已有六个录音文件保持原状。其他六条路线的内容未重新制作。

## 集中检查

必要的 `npm run build` 已在功能完成后执行，生成严格 TypeScript 配乐模块与浏览器产物。本轮未为每个小改动反复构建或运行全套测试。

```bash
node --test tests/music-layer.test.cjs tests/audio.test.cjs tests/audio-scenes.test.cjs tests/micro-moments.test.cjs tests/regional-effects.test.cjs tests/runtime-lifecycle.test.cjs
npm run check
```

相关回归首轮 54 项：53 项通过、1 项失败。失败项仍按单曲模型期待“切到另一首有效曲目时也保持 error”；现实现应允许该主题播放，同时保留失败主题等待显式重试。修正断言，补充换回失败主题与显式重试的检查，再仅复测该失败项，1 项通过。54 个不同案例均已有通过结果，**不是重新执行一整轮 54/54**，也没有将旧版本的全套测试数算入本轮。

```bash
node --test --test-name-pattern='a music error' tests/music-layer.test.cjs
```

资源与语法检查通过，包含四种音乐与运行时映射、作者/许可/修改记录、源文件和发布文件哈希、总计 6 MB / 单曲 3 MB / 短音效 100 KB 预算。既有图片、图集、许可与旧录音预算检查也通过。

证据：

- [首轮回归原始结果，含唯一失败](previews/wugong-free-audio/unit-initial.txt)
- [修正后定向复测](previews/wugong-free-audio/unit-focused.txt)
- [资源与语法检查](previews/wugong-free-audio/asset-check.txt)

## 浏览器检查

电脑与手机尺寸检查均通过：每种尺寸实际操作完成纸鸢、拨云、拍照、六片正向拼图，出现相应奖励并收进手帐；每种尺寸获得 4 个不同画作，无重复记录。使用本地静态服务器和真实 Chromium/Web Audio/媒体解码，电脑尺寸 1280×900，手机触控模拟 390×844 并开启减少动态效果。WebGL 使用 SwiftShader 软件渲染。

首轮脚本在拨云后停于“停下来看看”：此前的后台模拟按既有设计将旅程返回状态保留为暂停；收好奖励并不擅自恢复。补齐通过可见“继续走”按钮继续的测试步骤，再运行电脑和手机尺寸检查。该项是测试步骤遗漏，没有改变产品的后台暂停规则。

复测结果：

- 未开启声音时不请求音频；准备页开启声音不预取全部配乐，行走后实际播放 Reverie。
- 四种主题在两个尺寸中均完成原生解码、有效增益下的非零信号检查，以及真实媒体时钟到达端点后的循环检查。信号测量位于音乐源分支，另检查了有效增益，不代表最终扬声器的人工听音。
- 游戏到奖励复用同一媒体元素；牵线/展开、拨云、快门、拿片/落片及收画都有对应的原生 BufferSource 采样启动记录。
- 刻意中断首次 Childhood 请求后，出现“重试配乐”，环境/操作声保持开启；点击可见按钮后恢复加载播放。该预期网络失败单独记录，不算作未预期失败。
- 每种尺寸的最大同时播放音乐流为 2，缓存主题为 4；模拟 blur/focus 后所有缓存主题暂停且位置不继续推进，恢复后继续播放。游戏内静音和最终静音均暂停全部主题并挂起 AudioContext。
- 无未捕获页面错误，无未预期失败请求。业务时钟通过 Playwright 加速，媒体解码和音乐时钟仍使用原生浏览器实现。

```bash
TRAILBOUND_TEST_AUDIO=1 \
TRAILBOUND_PLAYWRIGHT_MODULE=/opt/codex/runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright \
TRAILBOUND_REVIEW_DIR=/tmp/trailbound-free-audio-browser \
node scripts/test-wugong-browser.cjs
```

证据：[结构化结果](previews/wugong-free-audio/browser-results.json)、[复测运行记录](previews/wugong-free-audio/browser-final.txt)、[首轮测试步骤遗漏记录](previews/wugong-free-audio/browser-initial.txt)、[电脑拨云截图](previews/wugong-free-audio/desktop-clouds.png)、[手机尺寸邂逅截图](previews/wugong-free-audio/phone-greet.png)。音频探针仅观测原生媒体和 Web Audio；没有用假媒体、假声音文件或假的解码器代替实际播放。

手帐嵌套、快速切主题、销毁后的异步清理等分支本轮由相关模型/DOM 回归覆盖；没有把这些全部写成已用真实浏览器验证。

## 仍待实际体验

- 未进行人工试听、耳机和手机外放验收。音乐风格、音量比例、循环乐句衔接、换曲自然程度仍需用户试听。
- 手机尺寸和触控模拟不是实体手机。iOS/Safari 的播放手势、系统静音开关、锁屏与恢复、实体设备 GPU 和帧率仍未验收。
- 页面 blur/focus 事件模拟不是操作系统真实切后台。非零解码信号与有效增益不等于已检查扬声器实际出声或听感。
- 本地服务器不代表线上网络条件、媒体 Range 请求或弱网体验已通过。

## 发布目标与来源

仅推送 GitHub `codex/recover-site`，将同一文件树同步到已存在的 Sites 源仓库，归档该已推送提交中的 `.openai/hosting.json` 与 `dist/`，再使用原私有项目发布。发布前已重新读取并确认原站点仍为 owner-private，未改变允许访问的人、没有新建替代站点。

- 项目：`appgprj_6ace5abcecd88191bc34207f10419101`
- 原站点：`https://trailbound-ghw-zhenliuxc.royal-box-3224.chatgpt.site/`
- GitHub：`https://github.com/zhenliuxc/trailbound-ghw/tree/codex/recover-site`

GitHub 与 Sites 的提交父历史不同，因此提交 SHA 可以不同；同步后比较完整文件树，发布归档必须来自实际推送到 Sites 的提交。不合并分支、不覆盖用户未提交工作、不删除旧会话，不将测试完成等同于已部署成功。

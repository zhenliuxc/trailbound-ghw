# 音乐与声景

声音由舒缓配乐、自然环境声、材质操作声和收藏反馈组成。用户主动开启声音，静音时主要玩法仍能通过画面理解。声音随地点、天气、昼夜、人物动作和游戏状态变化，脚步保持轻，不盖过溪水、风、鸟鸣或马铃。

## 当前实现

- `src/runtime/music-layer.ts` 负责授权配乐的选曲、加载、淡入淡出与播放状态。武功山和莫干山复用同一组录音，按场景选择曲目。
- `src/legacy/audio.js`、`audio-scenes.js` 提供共用 Web Audio 声景、录音与操作音调度。各路线的 `audio.ts` 接入行走、照片、天气、过夜与小游戏状态。
- `src/journey/game-registry.ts` 将游戏中的登高、峡谷展开等状态传给声景，画面推进与音量变化使用同一状态。
- 录音、拟音与浏览器合成并存。通用溪流、叶声、雨滴和风声用于声音设计，不标称为路线当地实录。

后台、照片或其他弹窗的暂停按场景职责处理。退出销毁声源与监听，过期加载不补播操作音。长配乐使用媒体播放与增益控制，短声音提前准备；加载失败不阻断行走与文字阅读。

## 配乐与素材依据

以下曲目由 Scott Buckley 创作，按素材清单中的 CC BY 4.0 许可使用。片段剪辑、循环和响度处理记录保存在清单中，不称为本项目原创曲目。

| 曲目 | 已使用文件 | 来源 |
| --- | --- | --- |
| Reverie | `public/audio/wugong-reverie-v1.mp3` | https://www.scottbuckley.com.au/library/reverie/ |
| Childhood | `public/audio/wugong-childhood-loop-v1.mp3` | https://www.scottbuckley.com.au/library/childhood/ |
| Cirrus | `public/audio/wugong-cirrus-loop-v1.mp3` | https://www.scottbuckley.com.au/library/cirrus/ |
| A Kind Of Hope | `public/audio/wugong-a-kind-of-hope-loop-v1.mp3` | https://www.scottbuckley.com.au/library/a-kind-of-hope/ |

| 清单 | 内容 |
| --- | --- |
| `public/audio/credits.json` | 共用环境录音、作者、原始来源、许可与处理 |
| `public/audio/wugong-credits.json` | 配乐、材质音与分发文件信息 |
| `public/audio/wugong-journey-credits-v1.json` | 旅程、营地与天气声源 |
| `public/audio/mogan-credits.json` | 莫干山复用音源与制作说明 |
| `public/audio/KENNEY-RPG-LICENSE.txt` | Kenney 素材许可原文 |

这些文件中的版本标识用于识别素材，不是开发日志。只要分发包或现存内容仍引用素材，就保留对应的来源与许可。

## 制作要求

所有配乐与音效使用免费且许可明确的素材。记录作者、原始来源、许可、分发文件及剪辑方式；“免版税”不能代替免费使用与站点分发授权。新增素材写入 `public/audio/`，再由构建复制到站点。

混音检查应实际试听环境声、脚步、操作声和完成反馈，并在一组普通电脑与手机外放条件下检查音量。自动检查可核对资源与生命周期，不能证明音色、音量或听感合适。

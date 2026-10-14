# 手机声音兼容修复（未发布）

声音仍默认关闭，由用户点击“声音 · 关”明确开启。

原版本使用 Web Audio 的默认会话。在 iPhone 上，该会话可能按 ambient 音频处理并受 Ring/Silent 静音模式影响，页面声音开关打开也可能听不到。WebKit 官方记录建议在支持的浏览器中设置 `navigator.audioSession.type = 'playback'`：https://bugs.webkit.org/show_bug.cgi?id=237322 。API 规范：https://w3c.github.io/audio-session/ 。

本次修复在用户开启声音时、创建或恢复 AudioContext 前设置 playback。没有该 API 或设置失败时继续使用原 Web Audio 路径，不申请麦克风权限，不自动播放。

原状态判断只使用页面开关，未核对 AudioContext 是否运行；同一照片的场景缓存也跳过了中断后的恢复。本次增加音频状态通知、同一场景恢复及“声音 · 点此恢复”交互。被挂起或中断的音频不再显示正在播放。恢复照片声音不会推进旅程，后台与静音仍停止声音。

`npm run check` 和 132 项 Node 测试通过。新增四项回归检查：明确开启后配置媒体会话及不支持时降级、同一照片中断恢复不重复排音符、resume 未真正进入 running 时不开启、状态事件与点击恢复的界面联动。音频夹具不模拟扬声器、音频波形、硬件静音或真实浏览器自动播放策略。

用户已要求不要马上上线。新开场文案和本次音频修复仅保存代码，原私有站点暂保留此前版本。

实机仍需验证：iPhone 静音开/关下明确开启音效、媒体音量、返回前台与照片停留恢复、Android 与无 AudioSession 浏览器的降级。

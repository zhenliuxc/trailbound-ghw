# 恢复发布验证 · 2026-10-15

源代码：GitHub master `e466d9dd78938fc0acc0fef4e0479184269d8ee0`，包含 PR #2 头 `20c8626c8257e100f0eb636d59356a6b6c66d511`。接手时 PR #2 已由远端合并，本次没有合并操作。

## 最小集成

只绑定18张已有景物互动的水彩图，不新增玩法，不改写旧记录。新记录用可选 artVersion:4 标记水彩图；无该字段的旧 edition:3 记录保留 SVG，较早记录保留原位图。未完成不发标签，存储 key 和 version:2 不变。图稿名称与既有互动标签名称可不同，本次保留既有文字。

| 图片 | 现有互动 ID |
| --- | --- |
|吊带追风|未接入：没有可确认的现成对应互动|
|草浪来信|meadow-bird|
|云海浮岛|meadow-butterfly|
|金顶石语|meadow-flower|
|铃声先到|未接入：没有可确认的现成对应互动|
|江在脚下|gorge-goat|
|半山歇脚|gorge-eagle|
|龙洞水帘|gorge-sparkle|
|牛牛先请|未接入：没有可确认的现成对应互动|
|石海棱光|snow-tracks|
|秦岭脊线|snow-lichen|
|横着也能到|未接入：没有可确认的现成对应互动|
|转角见海|coast-sand|
|潮汐收笔|coast-shell|
|赤径慢潮|coast-pier|
|树的另一个自己|valley-moss|
|红石微光|valley-bridge|
|木骡子开阔|valley-reflection|
|竹林接了句话|bamboo-drop|
|古道留痕|bamboo-step|
|再坐五分钟|未接入：没有可确认的现成对应互动|
|九溪踏石|westlake-stones|
|龙井春芽|westlake-tea|

没有明确新图映射的现有互动：snow-light（雾隙见峰）、bamboo-leaf（林隙远山）、westlake-eaves（一盏龙井）、westlake-floating-leaf（水绕石行）、westlake-leaf-shadow（茶垄流光）、westlake-basket（村口茶香）。这些仍使用已有图，未臆造图稿或新玩法。「再坐五分钟」不能擅自分配给两个不同喝茶互动。

## 验证证据

- npm run check 通过：全部脚本语法、HTML资源、21张许可照片、PixiJS锁定依赖比对、旧图谱、SVG和录音哈希。静态网站直接发布 dist，没有框架构建步骤。
- npm test：167 / 167 通过；详见 recovery-tests.txt。包含七路线完整DOM模拟流程、24互动完成与未完成、旧存档、重复旅程、照片不发标签、后台暂停、音频开关和录音请求。
- DOM模拟使用320、390及990像素等视口；CSS响应式规则静态检查通过。这不等于浏览器布局验证。
- 23张水彩图由Pillow解码，均384×384、透明角落；SHA-256与清单一致。3个录音文件由ffmpeg完整解码，无错误。
- 没有真实浏览器、GPU、物理手机或音频听感验证：本会话没有可调用的浏览器控制工具。
- 旧会话个人上下文检索服务返回不可用，无法读取其完整后续记录；已核对GitHub最新PR状态及远端分支、原Sites源仓库与访问权限。

## 发布范围

更新项目 appgprj_6ace5abcecd88191bc34207f10419101，保留 owner-only；不创建新站点、不扩大访问权限、不提交MLH。环境未附带 Sites 源码辅助脚本；使用原生 Sites 凭证/版本/私有部署接口，Git同步精确源提交，归档仅包含hosting清单和dist。

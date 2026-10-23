# 虎跳峡新版地标与取景存储

2026-10-17。本文件记录本机实现接口；未运行测试、验证脚本、浏览器或构建，等待本轮完成后的测试授权。

## 目录与到达入口

`dist/discoveries.js` 保留 `gorge-goat`、`gorge-eagle`、`gorge-sparkle`、`tiger-bell-first` 的 ID、内容与图像版本，标记 `legacyOnly: true`。旧手帐仍能读取；新旅程的随机发现池不再生成这四项。

新增目录项均为 `manualOnly: true`，没有 `at` 百分比，不产生随机偏移。其到达与主支线关系由旅程模块负责，目录本身不推断位置。

| ID | 手帐资格 | 备用画作 |
| --- | --- | --- |
| `tiger-28-bends-v1` | 实际完成后可收藏 | `scenes/tiger-high-v2.webp` |
| `tiger-middle-river-frame-v1` | 拍摄并主动留下后可收藏 | `scenes/tiger-river-v2.webp` |
| `tiger-halfway-view-v1` | 纯风景，不发收藏 | 无 |
| `tiger-longdong-passage-v1` | 纯风景，不发收藏 | 无 |

调用 `captureManual(trip, id)` 明确登记本次旅程已经到达／完成的地标。只允许上述四个 ID，要求路线一致；已有记录、其他 ID 或其他路线返回原 `trip`，不重复添加。该函数不检查 `visible()`，也不把登记到达等同于游戏完成。

`moment(state, trip, id, { experience })` 继续要求该 ID 已在 `trip.found` 中，并且 `experience.id` 相同、`edition === 3`、`earned === true` 才产生收藏资格。`reward: false` 的风景目录项即使收到 `earned: true`，也不会获得标签。

## 真正取景的图像

拍照适配器把快门当刻冻结的栅格画面放进 `experience.captureArt`。持久化后的 `Moment` 保留：

```ts
captureArt?: string;
artSource?: 'capture';
```

`safeCaptureArt(value)` 返回允许保存的原 data URL，或 `null`。限制为 `data:image/webp;base64,...`、`data:image/jpeg;base64,...`、`data:image/png;base64,...`，检查 Base64 格式、声明类型对应的文件头和解码后最多 300 KiB。外部 URL、SVG、其他 MIME、超限或文件头不匹配均不接受。文件头检查不代替浏览器实际图像解码。

导出常量 `MAX_CAPTURE_BYTES` 与 `MAX_CAPTURE_ART_LENGTH`，供拍照端控制分辨率、压缩质量和错误提示。拍照端应先完成图像生成与有效性检查，再允许“留下这张”。

若完成结果明确提交了无效或超大的 `captureArt`，`moment()` 返回 `null`；不能悄悄换成备用画作，再把它说成玩家拍摄的照片。调用端应保留重拍／重试机会，并在成功产生 moment 后提交新的 trip。

`cleanMoments()` 保留合规截图与 `artSource`；`tagArt()` 先返回合法截图，其次使用目录中的原版画作或备用图。旧存档中损坏的截图字段会被忽略，文字与可用备用画作继续可读。新 ID 不依赖旧版 `LEGACY` 目录才能清洗或读取。

## 首次记录与存储失败

沿用 `dist/journal.js` 的首次记录规则：同一路线、同一 ID、同等完成级别保留首次文字、日期与作品。重新拍摄不会覆盖已收下的第一张；旧的普通记录仍可按现有逻辑升级为完成记录。目录模块不自动删除或替换旧条目。

`saveMoments(storage, moments)` 仍返回布尔值。存在不合规的截图、不可用存储或 `setItem` 抛出配额等异常时返回 `false`；不会通过删除旧条目、舍弃照片或降级保存来伪装成功。浏览器原已存储内容不会因失败的写入被清空。调用端应明确区分本次页面内仍可查看与已经持久保存。

本子任务只修改目录与存储层；新场景素材、拍照适配器、奖品展示措辞及调用端失败提示由主任务接入，不能用这份记录代替相关体验验收。

# 龙洞瀑布实拍补齐

2026-10-19。只补虎跳峡龙洞瀑布照片及显示、署名，不改其他路线、小游戏或历史手帐。没有提交、推送或发布。

## 照片与地点依据

- 使用 Chen Zhao 的[《瀑布 / waterfall》原图](https://www.flickr.com/photos/livepine/437155777/)，原页公开标明 [CC BY 2.0](https://creativecommons.org/licenses/by/2.0/)。已在浏览器查看原作者、标题和许可链接，并读取公开照片元数据中的许可编号 4。
- 原作者没有直接写出龙洞名称。地点判断来自与 [Nick Kembel 实走记录](https://www.nickkembel.com/tiger-leaping-gorge-trek/)中明确标注为“Longdong waterfall viewed from directly across the valley”的照片比对，是地貌比对认定，不是原作者定名或照片 GPS 证明。
- 对应特征包括：山径横切阶梯状主瀑布的位置；主瀑左侧向右伸出的楔形岩层与其下深色岩缝；山径下方分成左侧细流和右侧较宽水流的岩面。命名参考也位于中途客栈至中峡客栈的这一段，与游戏路线顺序一致。
- 命名参考的原图 URL、段落和图注写入照片清单。参考图只用于地点核对，没有打包进游戏，也没有把游记的照片许可套用到所选照片上。

实际打包为 `dist/photos/tiger-longdong-place-v1.jpg`，960 × 1280，430419 字节，原 JPEG 无内容修补或生成。SHA-256：`51a2ad4934b619b3c317f1b5b4cf1f224af336624160462074997f0439e9654f`。

## 接入

`scripts/source-tiger-photos.py` 生成照片清单和 `src/tiger-walk/photos.ts`，保留原始标题、作者、原页、许可、比对依据和文件哈希。打卡弹窗显示“龙洞瀑布 · 历史实拍”，作者与许可继续可点开；致谢页说明地点比对的来源。

照片继续铺满容器，竖幅画面的显示位置改为 `50% 72%`，让横穿瀑布的步道保留在横幅容器中。这个位置只作用于龙洞瀑布，其他照片保持原样。旧区域照片文件及单独的原署名记录保留，避免已打开的旧版本缺图或丢失许可信息。当前地图脚本、样式缓存版本为 `longdong-photo-9`。

## 本轮检查

- `npm run build` 完成，包含 TypeScript 编译；构建记录见 `previews/tiger-longdong-9/build.txt`。
- 六张当前照片均能解码为 JPEG，文件 SHA-256 与清单一致；龙洞照片的作者、原题、许可和当前运行产物引用均已检查。记录见 `previews/tiger-longdong-9/asset-check.txt`。
- 在内置浏览器从桥头正常行进，经过中途客栈过夜后到达瀑布，新照片随到达自动展开。实际图片解码为 960 × 1280，图片与容器尺寸相同，`object-fit: cover`、`object-position: 50% 72%` 生效；截图中横切山径可见。作者、原题提示、原页与许可链接均正确。见 `previews/tiger-longdong-9/photo-dom.json` 与 `photo-desktop.jpg`。
- 点击“继续走”返回地图后，瀑布涂色事件仍正常随行进触发；这次没有重做、完成或发放该关徽章。此前已验收的山弯和客栈游戏使用正常跳过操作经过，没有修改行程状态或浏览器存档。
- 中途客栈照片实际加载正常，构图仍为 `50% 50%`，没有受瀑布专用取景影响。
- 返回地图后再次点击龙洞瀑布标记，新照片正常打开。预览已停在该弹窗；该标签页未捕获浏览器 error 记录。相关文本和日志也保存在 `previews/tiger-longdong-9/`。

这一轮没有重新验收整条路线或四关判定，也没有进行实体手机或听感验收；上轮完整行程记录见 [完整行程与照片补缺](tiger-trip-photos-8.md)。

本地入口：`http://127.0.0.1:8000/tiger-walk.html?scene=longdong-photo-9`。

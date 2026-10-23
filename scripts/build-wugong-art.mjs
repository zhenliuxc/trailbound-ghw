import { readFile, writeFile } from 'node:fs/promises';

/** Share the existing game / reward / journal markup, without mounting another map. */
export async function buildRouteArt(root, { route }) {
  const tiger = route === 'tiger', title = tiger ? '虎跳峡' : '武功山';
  const original = await readFile(new URL('dist/index.html', root), 'utf8');
  const slice = (start, end) => {
    const from = original.indexOf(start), to = original.indexOf(end, from);
    if (from < 0 || to < 0) throw new Error(`Missing shared art layout: ${start}`);
    return original.slice(from, to);
  };
  const mini = slice('<section id="micro-panel"', '<div id="overlay"');
  const wall = slice('<section class="field-journal', '<details class="route-details"');
  const overlays = slice('<dialog id="journal-detail"', '<noscript>');
  const scripts = ['vendor/pixi-8.22.0.min.js', 'route-moments.js', 'route-scenes.js', `discoveries.js?v=${tiger ? 'road-guide-7' : 'auto-journal-8'}`, 'journal.js', 'moment-scenes.js', 'moment-play.js', 'micro-moments.js', 'image-cache.js', 'hint-art.js', 'water-scene.js', 'kite-flight.js', 'wind-scene.js', 'wugong-stories.js?v=camera-origin-3', 'wugong-games.js', 'art-play-atlas.js', 'art-games.js', 'art-game-scene.js', 'mini-games.js', `audio-scenes.js${tiger ? '?v=road-guide-7' : ''}`, `audio.js${tiger ? '?v=road-guide-7' : ''}`, `wugong-art.js?v=${tiger ? 'road-guide-7' : 'climb-stroll-3'}`];
  const page = `<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover"><title>${title} · 手绘与旅行手帐</title>
<link rel="stylesheet" href="style.css"><link rel="stylesheet" href="art-games.css"><link rel="stylesheet" href="game-layout.css"><link rel="stylesheet" href="wugong-art.css?v=tiger-schematic-1">${tiger ? '<link rel="stylesheet" href="tiger-trail.css"><link rel="stylesheet" href="tiger-art.css?v=climb-stroll-3"><link rel="stylesheet" href="tiger-memories.css?v=road-guide-7">' : ''}
${scripts.map(file => `<script defer src="${file}"></script>`).join('\n')}</head><body class="wugong-art-page ${tiger ? 'tiger-art-page' : ''}" data-route="${route}">
<header class="art-page-header"><div><small>山径 · ${title}</small><h1 id="art-page-title">山间手绘</h1></div><button id="walk-toggle" type="button">返回山路 ×</button></header>
<main id="app-main"><section id="journey-stage">${mini}</section><section id="art-journal-wall">${wall}</section><div id="ending-journal" hidden><div id="ending-badges"></div><p id="ending-detail"></p></div></main>
${overlays}<footer class="art-page-credits"><a href="${route}-credits.html" target="_blank" rel="noopener">致谢</a></footer></body></html>`;
  await writeFile(new URL(`dist/${route}-art.html`, root), page);
  if (tiger) {
    const photos = JSON.parse(await readFile(new URL('dist/photos/tiger-schematic-v1-credits.json', root), 'utf8'));
    const escape = value => String(value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
    const entries = Object.values(photos).map(p => `<li><a href="${escape(p.source)}">${escape(p.title)}</a>，${escape(p.author)}，<a href="${escape(p.licenseUrl)}">${escape(p.license)}</a>。${escape(p.caption)}。${escape(p.modifications)}</li>`).join('');
    const credits = `<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>虎跳峡 · 素材与路线资料</title><link rel="stylesheet" href="tiger-walk.css"><style>main{max-width:960px;margin:40px auto;padding:0 24px}h1,h2{font-family:var(--serif)}p,li{line-height:1.95}li{margin-bottom:14px}h2{margin-top:35px}small{color:#7a8975}</style></head><body><main><a href="tiger-walk.html">← 回到虎跳峡</a><h1>虎跳峡 · 素材与路线资料</h1><p>主地图是程序绘制的 2D 路线示意，保留高路、江边支线与原路返回关系，不是 GPS 导航地图。按桥头出发、中途客栈过夜、经中峡客栈接张老师小路往返中虎跳安排体验。</p><h2>路线依据</h2><ul><li><a href="https://www.diqing.gov.cn/subsiteIndex/bulletin/ex/articleView.html?articleId=205689&amp;fromSubsiteFlagEx=dqzzf_zfbgs&amp;newsClassId=223&amp;orgCode=&amp;subsiteId=16">迪庆州体育产业发展规划 · 高路徒步线路</a>用于核对纳西雅阁、二十八道拐、茶马客栈、中途客栈及中峡客栈的先后顺序。</li><li><a href="https://fastestknowntime.com/route/tiger-leaping-gorge-yunnan-china">历史高路记录</a>与仓库已有 OSM 地点资料。支线按张老师小路往返，不把天梯或一线天拼成必经返回路。</li></ul><h2>实拍照片</h2><p>照片来自公开授权的历史实拍。桥头与中虎跳江段有地点说明；其余标为高路或峡谷区域配图，不将客栈路标、上虎跳景区或未确认名称的瀑布冒充定点照片。界面保留作者、原页和许可链接；照片本身继续按各自许可分发。</p><ul>${entries}</ul><h2>声音</h2><p>“Reverie” by Scott Buckley，<a href="https://www.scottbuckley.com.au/library/reverie/">原曲来源</a>，<a href="https://creativecommons.org/licenses/by/4.0/">CC BY 4.0</a>。沿用项目已整理的完整配乐版本。</p><p>风声为 Thimras 的 <a href="https://opengameart.org/content/park-ambiences">Park ambiences / open field wind</a>，CC0；水声为 Ksd5 的 <a href="https://commons.wikimedia.org/wiki/File:Swale.ogg">Swale.ogg</a>，CC0。翻页拟音使用 Wilfredor 的 <a href="https://commons.wikimedia.org/wiki/File:Leaves_falling_from_the_trees_during_autumn_in_the_forest.wav">落叶录音</a>，CC0；并非真实纸张录音。以上用于游戏声景，不声称为虎跳峡当地实录。完整处理与许可记录见 <a href="audio/credits.json">原有声音清单</a>、<a href="audio/wugong-credits.json">配乐与材质声清单</a>和 <a href="audio/wugong-journey-credits-v1.json">自然氛围清单</a>。</p><h2>手绘与人物</h2><p>山弯、客栈、瀑布与江边四幅风光和配套圆形徽章使用内置图像生成制作，属于艺术化游戏插画，并非当地实拍。<a href="scenes/tiger-memories-v4/credits.json">完整提示词与素材记录</a>说明原图、图集拆分和来源。人物沿用用户指定的大眼睛 Q 版素材。瀑布徽章保留当次涂过的山色，江边徽章保存当次圆窗内的实际构图和水流状态；玩家完成互动后才自动入帐。旧记录与首次收藏保留，不进行清空、导入或导出。</p><p><small>PixiJS · MIT。Native Web Animations / CSS。素材准备脚本：scripts/source-tiger-photos.py。</small></p></main></body></html>`;
    await writeFile(new URL('dist/tiger-credits.html', root), credits);
  }
}

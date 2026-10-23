import { readFile, writeFile } from 'node:fs/promises';
import { loadSiteContent } from './build-content.mjs';
const escape = value => String(value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
export async function buildDayPages(root, output = new URL('dist/', root)) {
  const { DAY_ROUTES, CHANGPING_MEMORIES } = await loadSiteContent(root);
  const entries = DAY_ROUTES.changping.events.map((event, order) => {
    const spec = CHANGPING_MEMORIES[event.entry];
    return { id: event.entry, route: 'changping', order, edition: 3, manualOnly: true, reward: true, bonus: true, name: spec.title, tag: spec.badge, place: event.place, scene: 'encounter-art', play: spec.kind, interaction: spec.kind === 'branches' ? 'tap' : 'drag', icon: spec.kind === 'cords' ? 'bell' : spec.kind === 'path' ? 'mountain' : spec.kind === 'branches' ? 'reflection' : 'leaf', prompt: spec.prompt, hint: event.line, result: spec.memory, memory: spec.memory, condition: '十月彩林 · 手绘记忆', badge: `badges/${event.entry}-v1.webp`, artV5: `badges/${event.entry}-v1.webp` };
  });
  const moments = await readFile(new URL('src/legacy/route-moments.js', root), 'utf8');
  const block = ` // BEGIN GENERATED CHANGPING MEMORIES\n ENCOUNTERS.push(...${JSON.stringify(entries, null, 2)});\n // END GENERATED CHANGPING MEMORIES\n`;
  const placeholder = ' // {{changping-memories}}\n';
  if (!moments.includes(placeholder)) throw new Error('Route moments source is missing the Changping content slot');
  await writeFile(new URL('route-moments.js', output), moments.replace(placeholder, block));
  const template = await readFile(new URL('src/templates/day-walk.html', root), 'utf8');
  for (const route of Object.values(DAY_ROUTES)) {
    const values = { ...route, start: route.places[0].name, end: route.itinerary === 'out-and-back' ? route.places[0].name : route.places.at(-1).name };
    const page = template.replace(/\{\{([a-z-]+)\}\}/g, (_, key) => { if (!(key in values)) throw new Error(`Unknown day template: ${key}`); return escape(values[key]); });
    const mapVersion = { changping: 'southern-maps-6', mogan: 'mogan-bamboo-weather-7', westlake: 'look-here-architecture-1' }[route.id];
    const styles = route.id === 'westlake' ? '<link rel="stylesheet" href="look-here.css?v=look-here-architecture-1"></head>' : '</head>';
    await writeFile(new URL(`${route.id}-walk.html`, output), page.replace('day-walk.js?v=southern-maps-6', `day-walk.js?v=${mapVersion}`).replace('</head>', styles));
    const photos = route.places.filter(place => place.photo).map(({ name, photo }) => `<li><strong>${escape(name)}</strong>：${escape(photo.caption)}。<a href="${escape(photo.source)}">${escape(photo.title)}</a>，${escape(photo.author)}，<a href="${escape(photo.licenseUrl)}">${escape(photo.license)}</a>。适配为 WebP 并按展示容器裁切，原许可继续适用。</li>`).join('');
    const sources = route.sources.map(source => `<li><a href="${escape(source.url)}">${escape(source.name)}</a></li>`).join('');
    const credits = `<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escape(route.name)} · 素材来源</title><link rel="stylesheet" href="day-walk.css"><style>main{max-width:960px;margin:40px auto;padding:0 24px}h1,h2{font-family:var(--serif)}p,li{line-height:1.95}li{margin-bottom:14px}</style></head><body><main><a href="${route.id}-walk.html">← 回到山径</a><h1>${escape(route.name)} · 素材来源</h1><p>${escape(route.subtitle)}。地图为构图调整后的 2D 路线示意，画面内时间表示虚拟行程。${route.id === 'changping' ? '本章表现十月彩林中的一日山谷徒步：喇嘛寺至木骡子原路往返，不含长穿毕。时间为压缩后的虚拟叙事，不是实际行程测量。' : route.id === 'mogan' ? '保留仓库已有 OSM 莫干岭西坡至大坑侧连通选段。下方古道资料仅为区域背景，不将其整段里程用于此选段。' : '本章自九溪烟树至龙井村口，不含龙井八景延伸段。'}</p><ul>${sources}</ul><h2>实拍与许可</h2><ul>${photos}</ul><p>全部原始素材记录保留在<a href="photos/credits.json">照片许可清单</a>。区域配图已在照片页明确说明，不表示对应地标的定点机位。</p><h2>手绘与人物</h2><p>${route.id === 'changping' ? '本轮使用图像生成工具制作山野手绘与透明物件，保留两位 Q 版旅人。长坪沟十月互动素材见 <a href="scenes/changping-autumn-v1/credits.json">彩林素材记录</a>；马铃遭遇与纸片接路为艺术创作。' : '本轮使用图像生成工具制作长坪沟溪谷、莫干山竹林、九溪茶园和透明茶盏手绘，保留既有圆形徽章和两位 Q 版旅人。'}插画为艺术化素材，不作为当地实拍。<a href="scenes/day-route-v2/credits.json">新手绘素材记录</a>。<a href="characters/traveler-choices-v1-credits.json">人物来源与处理记录</a>。</p><h2>声音与程序</h2><p>Music: “Reverie” by Scott Buckley，<a href="https://www.scottbuckley.com.au/library/reverie/">原曲</a>，<a href="https://creativecommons.org/licenses/by/4.0/">CC BY 4.0</a>。脚步及材质声复用 Kenney CC0 素材；自然氛围由通用录音和合成音构成，非当地实录。小游戏配乐与录音的完整署名见<a href="audio/credits.json">原声音记录</a>、<a href="audio/wugong-credits.json">配乐与材质声</a>、<a href="audio/wugong-journey-credits-v1.json">自然氛围</a>。</p><p>PixiJS · MIT。统一地图视角、照片弹窗、手绘过渡和手帐流程使用项目公共组件。</p></main></body></html>`;
    await writeFile(new URL(`${route.id}-credits.html`, output), route.id === 'westlake' ? credits.replace('<h2>声音与程序</h2>', '<p>林荫溪水与村口茶桌为生成插画，沿用春日水彩风格。<a href="scenes/westlake-journey-v3/credits.json">九溪场景与原始提示词记录</a>。</p><h2>路笺与字体</h2><p>路笺示例从本游戏九溪二维地图的固定画幅生成，是山径创作内容，不是实拍或真实玩家投稿。取景仅限本地点。标题使用 LXGW WenKai Regular，由 LXGW 与 Klee Project Authors 创作，按 SIL Open Font License 1.1 使用网页子集；正文沿用系统字体。<a href="fonts/LXGWWenKai-OFL.txt">字体许可</a> · <a href="fonts/look-here-font.json">来源与处理记录</a>。</p><h2>声音与程序</h2>') : credits);
  }
}
